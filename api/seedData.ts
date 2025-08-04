import { ObjectId } from 'mongodb';
import { UserRole } from '../types';

// Data ini akan dimasukkan secara otomatis ke database saat pertama kali dijalankan.
// ID unik dan kata sandi sudah diatur di sini.

export const initialUsers = [
  {
    _id: new ObjectId(),
    name: "Admin Utama",
    role: UserRole.ADMIN,
    password: "Cipeng55"
  },
  {
    _id: new ObjectId(),
    name: "Ahmad Fauzi",
    role: UserRole.JUDGE,
    password: "juri",
    assignedPostId: "665f12a3b4c5d6e7f8a9b0d1", // ID ini harus cocok dengan salah satu ID di initialPosts
    assignedCriteriaIds: ["c1", "c2"]
  },
  {
    _id: new ObjectId(),
    name: "Siti Aminah",
    role: UserRole.JUDGE,
    password: "juri",
    assignedPostId: "665f12a3b4c5d6e7f8a9b0d2", // ID ini harus cocok dengan salah satu ID di initialPosts
    assignedCriteriaIds: ["c3", "c4"]
  },
  {
    _id: new ObjectId(),
    name: "Budi Santoso",
    role: UserRole.JUDGE,
    password: "juri",
    assignedPostId: "665f12a3b4c5d6e7f8a9b0d3", // ID ini harus cocok dengan salah satu ID di initialPosts
    assignedCriteriaIds: ["c5", "c6"]
  },
  {
    _id: new ObjectId(),
    name: "Rina Marlina",
    role: UserRole.JUDGE,
    password: "juri",
    assignedPostId: "665f12a3b4c5d6e7f8a9b0d1", // ID ini harus cocok dengan salah satu ID di initialPosts
    assignedCriteriaIds: ["c1", "c2"]
  }
];

export const initialPosts = [
  {
    _id: new ObjectId("665f12a3b4c5d6e7f8a9b0d1"),
    name: "Pos Keberangkatan",
    criteria: [
      { id: "c1", name: "Kerapihan Barisan", maxScore: 100 },
      { id: "c2", name: "Semangat", maxScore: 100 }
    ]
  },
  {
    _id: new ObjectId("665f12a3b4c5d6e7f8a9b0d2"),
    name: "Pos Tengah",
    criteria: [
      { id: "c3", name: "Kekompakan Gerak", maxScore: 100 },
      { id: "c4", name: "Variasi Formasi", maxScore: 100 }
    ]
  },
  {
    _id: new ObjectId("665f12a3b4c5d6e7f8a9b0d3"),
    name: "Pos Finish",
    criteria: [
      { id: "c5", name: "Ketahanan Fisik", maxScore: 100 },
      { id: "c6", name: "Ketepatan Waktu", maxScore: 100 }
    ]
  }
];

// Kita perlu mereferensikan ID posts di dalam data users, jadi kita set manual ID untuk posts dan referensikan di users
const pos1Id = initialPosts[0]._id.toString();
const pos2Id = initialPosts[1]._id.toString();
const pos3Id = initialPosts[2]._id.toString();

initialUsers[1].assignedPostId = pos1Id;
initialUsers[2].assignedPostId = pos2Id;
initialUsers[3].assignedPostId = pos3Id;
initialUsers[4].assignedPostId = pos1Id;
