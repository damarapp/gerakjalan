
import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { 
    User, Team, Post, Score, UserRole, 
    NewTeamPayload, UpdateTeamPayload, NewUserPayload, UpdateUserPayload, NewPostPayload, UpdatePostPayload, TeamLevel, TeamGender, TeamTotalScore, JudgeScoreDetail
} from '../types';

// State & Reducer
interface AppState {
    teams: Team[];
    users: User[];
    posts: Post[];
    scores: Score[];
    currentUser: User | null;
    loading: boolean;
    error: string | null;
}

const initialState: AppState = {
    teams: [],
    users: [],
    posts: [],
    scores: [],
    currentUser: null,
    loading: true,
    error: null,
};

type Action =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_DATA'; payload: { teams: Team[]; users: User[]; posts: Post[]; scores: Score[] } }
    | { type: 'LOGIN_SUCCESS'; payload: User }
    | { type: 'LOGOUT' }
    | { type: 'ADD_TEAM'; payload: Team }
    | { type: 'UPDATE_TEAM'; payload: Team }
    | { type: 'DELETE_TEAM'; payload: string }
    | { type: 'ADD_USER'; payload: User }
    | { type: 'UPDATE_USER'; payload: User }
    | { type: 'DELETE_USER'; payload: string }
    | { type: 'ADD_POST'; payload: Post }
    | { type: 'UPDATE_POST'; payload: Post }
    | { type: 'DELETE_POST'; payload: string }
    | { type: 'SUBMIT_SCORE_SUCCESS'; payload: Score };

const appReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'SET_LOADING': return { ...state, loading: action.payload };
        case 'SET_ERROR': return { ...state, error: action.payload, loading: false };
        case 'SET_DATA': return { ...state, ...action.payload, loading: false };
        case 'LOGIN_SUCCESS': return { ...state, currentUser: action.payload, loading: false };
        case 'LOGOUT': return { ...state, currentUser: null, loading: false };

        case 'ADD_TEAM': return { ...state, teams: [...state.teams, action.payload].sort((a,b) => a.number.localeCompare(b.number)) };
        case 'UPDATE_TEAM': return { ...state, teams: state.teams.map(t => t.id === action.payload.id ? action.payload : t).sort((a,b) => a.number.localeCompare(b.number)) };
        case 'DELETE_TEAM': return { ...state, teams: state.teams.filter(t => t.id !== action.payload) };

        case 'ADD_USER': return { ...state, users: [...state.users, action.payload] };
        case 'UPDATE_USER': return { ...state, users: state.users.map(u => u.id === action.payload.id ? action.payload : u) };
        case 'DELETE_USER': return { ...state, users: state.users.filter(u => u.id !== action.payload) };

        case 'ADD_POST': return { ...state, posts: [...state.posts, action.payload] };
        case 'UPDATE_POST': return { ...state, posts: state.posts.map(p => p.id === action.payload.id ? action.payload : p) };
        case 'DELETE_POST': return { ...state, posts: state.posts.filter(p => p.id !== action.payload) };
        
        case 'SUBMIT_SCORE_SUCCESS': {
            const { teamId, postId, judgeId } = action.payload;
            const existingScoreIndex = state.scores.findIndex(s => s.teamId === teamId && s.postId === postId && s.judgeId === judgeId);
            const newScores = [...state.scores];
            if (existingScoreIndex > -1) {
                newScores[existingScoreIndex] = { ...newScores[existingScoreIndex], ...action.payload };
            } else {
                newScores.push(action.payload);
            }
            return { ...state, scores: newScores };
        }

        default: return state;
    }
};

interface AppContextType {
    // Direct state access for modern components
    teams: Team[];
    users: User[];
    posts: Post[];
    scores: Score[];
    currentUser: User | null;
    loading: boolean;
    error: string | null;

    // Actions
    login: (role: UserRole, userId: string, password?: string) => Promise<void>;
    logout: () => void;
    addTeam: (team: NewTeamPayload) => Promise<void>;
    updateTeam: (team: UpdateTeamPayload) => Promise<void>;
    deleteTeam: (id: string) => Promise<void>;
    addUser: (user: NewUserPayload) => Promise<void>;
    updateUser: (user: UpdateUserPayload) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;
    addPost: (post: NewPostPayload) => Promise<void>;
    updatePost: (post: UpdatePostPayload) => Promise<void>;
    deletePost: (id: string) => Promise<void>;
    submitScore: (score: Score) => Promise<void>;
    calculateScores: (filters: { level: TeamLevel; gender: TeamGender }) => TeamTotalScore[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    const apiCall = useCallback(async (url: string, options: RequestInit = {}) => {
        const headers = new Headers(options.headers);
        headers.set('Content-Type', 'application/json');
        
        // Add Authorization header if a user is logged in
        const storedUserStr = localStorage.getItem('currentUser');
        if (storedUserStr) {
            const user: User = JSON.parse(storedUserStr);
            if(user.id) { // Use the main ID which is the mongo _id
                headers.set('Authorization', `Bearer ${user.id}`);
            }
        }

        const response = await fetch(url, { ...options, headers });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return null;
        }
        return response.json();
    }, []);

    const fetchData = useCallback(async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const data = await apiCall('/api/data');
            dispatch({ type: 'SET_DATA', payload: data });
        } catch (error: any) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
        } finally {
            // Check for a logged in user after fetching initial data
             const storedUser = localStorage.getItem('currentUser');
             if (storedUser) {
                 dispatch({ type: 'LOGIN_SUCCESS', payload: JSON.parse(storedUser) });
             } else {
                 dispatch({ type: 'SET_LOADING', payload: false });
             }
        }
    }, [apiCall]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const login = useCallback(async (role: UserRole, userId: string, password?: string) => {
        const { user } = await apiCall('/api/login', {
            method: 'POST',
            body: JSON.stringify({ role, userId, password }),
        });
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        localStorage.setItem('currentUser', JSON.stringify(user));
    }, [apiCall]);

    const logout = useCallback(() => {
        localStorage.removeItem('currentUser');
        dispatch({ type: 'LOGOUT' });
    }, []);

    // Secure CRUD operations
    const addTeam = useCallback(async (team: NewTeamPayload) => {
        const newTeam = await apiCall('/api/teams', { method: 'POST', body: JSON.stringify(team) });
        dispatch({ type: 'ADD_TEAM', payload: newTeam });
    }, [apiCall]);
    const updateTeam = useCallback(async (team: UpdateTeamPayload) => {
        await apiCall('/api/teams', { method: 'PUT', body: JSON.stringify(team) });
        dispatch({ type: 'UPDATE_TEAM', payload: team });
    }, [apiCall]);
    const deleteTeam = useCallback(async (id: string) => {
        await apiCall(`/api/teams?id=${id}`, { method: 'DELETE' });
        dispatch({ type: 'DELETE_TEAM', payload: id });
    }, [apiCall]);
    
    const addUser = useCallback(async (user: NewUserPayload) => {
        const newUser = await apiCall('/api/users', { method: 'POST', body: JSON.stringify(user) });
        dispatch({ type: 'ADD_USER', payload: newUser });
    }, [apiCall]);
    const updateUser = useCallback(async (user: UpdateUserPayload) => {
        await apiCall('/api/users', { method: 'PUT', body: JSON.stringify(user) });
        dispatch({ type: 'UPDATE_USER', payload: user });
    }, [apiCall]);
    const deleteUser = useCallback(async (id: string) => {
        await apiCall(`/api/users?id=${id}`, { method: 'DELETE' });
        dispatch({ type: 'DELETE_USER', payload: id });
    }, [apiCall]);
    
    const addPost = useCallback(async (post: NewPostPayload) => {
        const newPost = await apiCall('/api/posts', { method: 'POST', body: JSON.stringify(post) });
        dispatch({ type: 'ADD_POST', payload: newPost });
    }, [apiCall]);
    const updatePost = useCallback(async (post: UpdatePostPayload) => {
        await apiCall('/api/posts', { method: 'PUT', body: JSON.stringify(post) });
        dispatch({ type: 'UPDATE_POST', payload: post });
    }, [apiCall]);
    const deletePost = useCallback(async (id: string) => {
        await apiCall(`/api/posts?id=${id}`, { method: 'DELETE' });
        dispatch({ type: 'DELETE_POST', payload: id });
    }, [apiCall]);

    const submitScore = useCallback(async (score: Score) => {
        await apiCall('/api/scores', { method: 'POST', body: JSON.stringify(score) });
        dispatch({ type: 'SUBMIT_SCORE_SUCCESS', payload: score });
    }, [apiCall]);

    const calculateScores = useCallback((filters: { level: TeamLevel, gender: TeamGender }): TeamTotalScore[] => {
        const { level, gender } = filters;
        const filteredTeams = state.teams.filter(t => t.level === level && t.gender === gender);
        
        const teamScores = filteredTeams.map(team => {
            const relevantScores = state.scores.filter(s => s.teamId === team.id);
            let totalScore = 0;

            const judgeScores: JudgeScoreDetail[] = relevantScores.map(score => {
                const judge = state.users.find(u => u.id === score.judgeId);
                const post = state.posts.find(p => p.id === score.postId);
                
                const assignedCriteriaIds = judge?.assignedCriteriaIds ?? [];
                
                const scorePerJudge = Object.entries(score.scores).reduce((sum, [criterionId, criterionScore]) => {
                    if (assignedCriteriaIds.length === 0 || assignedCriteriaIds.includes(criterionId)) {
                        return sum + (criterionScore || 0);
                    }
                    return sum;
                }, 0);

                totalScore += scorePerJudge;
                
                return {
                    judgeId: judge?.id || 'unknown-judge',
                    judgeName: judge?.name || 'Unknown Judge',
                    postName: post?.name || 'Unknown Post',
                    score: scorePerJudge
                };
            });
            
            return {
                teamId: team.id,
                teamName: team.name,
                teamNumber: team.number,
                totalScore: totalScore,
                judgeScores: judgeScores
            };
        });

        return teamScores.sort((a, b) => b.totalScore - a.totalScore);
    }, [state.teams, state.scores, state.users, state.posts]);


    const value = {
        ...state,
        login,
        logout,
        addTeam,
        updateTeam,
        deleteTeam,
        addUser,
        updateUser,
        deleteUser,
        addPost,
        updatePost,
        deletePost,
        submitScore,
        calculateScores,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
