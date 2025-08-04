
export enum UserRole {
  ADMIN = 'ADMIN',
  JUDGE = 'JUDGE',
  PUBLIC = 'PUBLIC',
}

export interface User {
  _id?: string;
  id: string;
  name: string;
  role: UserRole;
  password?: string;
  assignedPostId?: string; // Only for judges
  assignedCriteriaIds?: string[]; // Only for judges
}

export enum TeamLevel {
    SD = 'SD',
    SMP = 'SMP',
    SMA = 'SMA',
    UMUM = 'UMUM',
}

export enum TeamGender {
    PUTRA = 'Putra',
    PUTRI = 'Putri',
}

export interface Team {
  _id?: string;
  id: string;
  name: string;
  number: string;
  level: TeamLevel;
  gender: TeamGender;
}

export interface Criterion {
  id: string;
  name: string;
  maxScore: number; // e.g., 100
}

export interface Post {
  _id?: string;
  id: string;
  name: string;
  criteria: Criterion[];
}

export interface Score {
  _id?: string;
  teamId: string;
  postId: string;
  judgeId: string;
  scores: { [criterionId: string]: number };
  notes?: string;
}

export interface JudgeScoreDetail {
    judgeId: string;
    judgeName: string;
    postName: string;
    score: number;
}

export interface TeamTotalScore {
  teamId: string;
  teamName: string;
  teamNumber: string;
  totalScore: number;
  judgeScores: JudgeScoreDetail[];
}

// Data types for API payloads
export type NewTeamPayload = Omit<Team, 'id' | '_id'>;
export type UpdateTeamPayload = Team;

export type NewUserPayload = Omit<User, 'id' | '_id'>;
export type UpdateUserPayload = User;

export type NewPostPayload = Omit<Post, 'id' | '_id'>;
export type UpdatePostPayload = Post;
