import { Course } from '../types';

export const mockCourses: Course[] = [
  {
    id: 'java-notes-pro',
    title: 'Java Notes',
    tagline: 'Interview-ready handwritten concepts',
    description:
      'Covers OOP, collections, exceptions, JDBC, and concise interview notes for last-minute revision.',
    subject: 'Java',
    level: 'Intermediate',
    pageCount: 94,
    price: 199,
    fileUrl: 'mock://java-notes.pdf',
    createdAt: '2026-04-20T10:00:00.000Z',
    isPublished: true,
    previewPoints: ['OOP and collections cheat sheet', 'Interview questions', 'JDBC summary'],
  },
  {
    id: 'dsa-crash-pack',
    title: 'DSA Crash Pack',
    tagline: 'Patterns over rote memorization',
    description:
      'Problem-solving notes focused on arrays, trees, graphs, sliding window, and dynamic programming.',
    subject: 'DSA',
    level: 'Advanced',
    pageCount: 128,
    price: 299,
    fileUrl: 'mock://dsa-crash-pack.pdf',
    createdAt: '2026-04-20T10:05:00.000Z',
    isPublished: true,
    previewPoints: ['Sliding window patterns', 'Tree traversal map', 'Graph and DP revision sheets'],
  },
  {
    id: 'dbms-exam-kit',
    title: 'DBMS Exam Kit',
    tagline: 'Compact and high-retention',
    description:
      'Normalization, transactions, indexing, SQL examples, and one-page answer formats for quick prep.',
    subject: 'DBMS',
    level: 'Beginner',
    pageCount: 76,
    price: 149,
    fileUrl: 'mock://dbms-exam-kit.pdf',
    createdAt: '2026-04-20T10:10:00.000Z',
    isPublished: true,
    previewPoints: ['Normalization diagrams', 'Transactions and ACID', 'Compact SQL examples'],
  },
];
