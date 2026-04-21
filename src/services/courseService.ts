import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

import { db, firebaseConfigStatus } from '../config/firebase';
import { mockCourses } from '../data/mockCourses';
import { Course, NewCourseInput } from '../types';

const coursesCollection = 'courses';
const WRITE_TIMEOUT_MS = 15000;

const withTimeout = async <T>(promise: Promise<T>, label: string): Promise<T> => {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(`${label} timed out after ${WRITE_TIMEOUT_MS / 1000} seconds.`));
    }, WRITE_TIMEOUT_MS);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
};

const describeFirestoreError = (error: unknown) => {
  if (error instanceof Error) {
    if ('code' in error && typeof (error as { code?: unknown }).code === 'string') {
      return `firestore error: ${String((error as { code?: string }).code)}`;
    }

    return `firestore error: ${error.message}`;
  }

  return 'firestore error: unknown failure';
};

const buildCourseFromDoc = (id: string, data: Record<string, unknown>): Course => ({
  id,
  title: String(data.title ?? 'Untitled Notes'),
  tagline: String(data.tagline ?? 'Paid notes collection'),
  description: String(data.description ?? 'Course description unavailable.'),
  subject: String(data.subject ?? 'General'),
  level: String(data.level ?? 'Mixed'),
  pageCount: Number(data.pageCount ?? 0),
  price: Number(data.price ?? 0),
  fileUrl: String(data.fileUrl ?? ''),
  createdAt: new Date().toISOString(),
  isPublished: Boolean(data.isPublished ?? true),
  pdfName: data.pdfName ? String(data.pdfName) : undefined,
  uploadStatus: 'ready',
  previewPoints: Array.isArray(data.previewPoints)
    ? data.previewPoints.map((point) => String(point))
    : [],
});

export const getCourses = async (): Promise<Course[]> => {
  if (!firebaseConfigStatus.isConfigured || !db) {
    return mockCourses;
  }

  const snapshot = await getDocs(query(collection(db, coursesCollection), orderBy('createdAt', 'desc')));
  return snapshot.docs.map((entry) => buildCourseFromDoc(entry.id, entry.data()));
};

export const uploadCoursePdf = async (input: NewCourseInput): Promise<Course> => {
  const createdAt = new Date().toISOString();

  if (!firebaseConfigStatus.isConfigured || !db) {
    return {
      id: `mock-${Date.now()}`,
      title: input.title,
      tagline: input.tagline ?? 'Mock uploaded course',
      description: input.description,
      subject: input.subject ?? 'Custom',
      level: input.level ?? 'Paid',
      pageCount: input.pageCount ?? 0,
      price: input.price,
      fileUrl: input.pdfUri,
      createdAt,
      isPublished: true,
      pdfName: input.pdfName,
      uploadStatus: 'ready',
      previewPoints: ['Saved locally because Firebase is not configured.'],
    };
  }

  const coursePayload: Omit<Course, 'id' | 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
    title: input.title,
    tagline: input.tagline ?? 'Premium PDF notes',
    description: input.description,
    subject: input.subject ?? 'Custom',
    level: input.level ?? 'Paid',
    pageCount: input.pageCount ?? 0,
    price: input.price,
    fileUrl: input.pdfUri,
    pdfName: input.pdfName,
    uploadStatus: 'ready',
    createdAt: serverTimestamp(),
    isPublished: true,
    previewPoints: ['PDF reference stored in Firestore only.'],
  };

  let createdDoc;
  try {
    createdDoc = await withTimeout(addDoc(collection(db, coursesCollection), coursePayload), 'Course document write');
  } catch (error) {
    throw new Error(describeFirestoreError(error));
  }

  return {
    id: createdDoc.id,
    ...coursePayload,
    createdAt,
  };
};

export const toggleCoursePublishState = async (course: Course): Promise<Course> => {
  const next = { ...course, isPublished: !course.isPublished };

  if (!firebaseConfigStatus.isConfigured || !db) {
    return next;
  }

  await updateDoc(doc(db, coursesCollection, course.id), {
    isPublished: next.isPublished,
  });

  return next;
};
