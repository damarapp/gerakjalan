
import { ObjectId } from 'mongodb';
import { UserRole, AdminPermission } from '../types.js';

// This data will be automatically inserted into the database on the first run.
// Unique IDs and passwords are set here.
// Post IDs are manually defined as fixed strings and referenced in the user data
// to ensure a consistent link between judges and their assigned posts.

const post1Id = "665f12a3b4c5d6e7f8a9b0d1";
const post2Id = "665f12a3b4c5d6e7f8a9b0d2";
const post3Id = "665f12a3b4c5d6e7f8a9b0d3";

export const initialUsers = [
  {
    _id: new ObjectId(),
    name: "admin",
    role: UserRole.ADMIN,
    password: "Cipeng55",
    permissions: [
        AdminPermission.MANAGE_TEAMS,
        AdminPermission.MANAGE_USERS,
        AdminPermission.MANAGE_POSTS,
        AdminPermission.VIEW_REPORTS,
    ]
  },
  {
    _id: new ObjectId(),
    name: "Ahmad Fauzi",
    role: UserRole.JUDGE,
    assignedPostId: post1Id,
    assignedCriteriaIds: ["c1", "c2"]
  },
  {
    _id: new ObjectId(),
    name: "Siti Aminah",
    role: UserRole.JUDGE,
    assignedPostId: post2Id,
    assignedCriteriaIds: ["c3", "c4"]
  },
  {
    _id: new ObjectId(),
    name: "Budi Santoso",
    role: UserRole.JUDGE,
    assignedPostId: post3Id,
    assignedCriteriaIds: ["c5", "c6"]
  },
  {
    _id: new ObjectId(),
    name: "Rina Marlina",
    role: UserRole.JUDGE,
    assignedPostId: post1Id,
    assignedCriteriaIds: ["c1", "c2"]
  }
];

export const initialPosts = [
  {
    _id: new ObjectId(post1Id),
    name: "Pos Keberangkatan",
    criteria: [
      { id: "c1", name: "Kerapihan Barisan", maxScore: 100 },
      { id: "c2", name: "Semangat", maxScore: 100 }
    ]
  },
  {
    _id: new ObjectId(post2Id),
    name: "Pos Tengah",
    criteria: [
      { id: "c3", name: "Kekompakan Gerak", maxScore: 100 },
      { id: "c4", name: "Variasi Formasi", maxScore: 100 }
    ]
  },
  {
    _id: new ObjectId(post3Id),
    name: "Pos Finish",
    criteria: [
      { id: "c5", name: "Ketahanan Fisik", maxScore: 100 },
      { id: "c6", name: "Ketepatan Waktu", maxScore: 100 }
    ]
  }
];