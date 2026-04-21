import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';

import { db, firebaseConfigStatus } from '../config/firebase';
import { PurchaseRecord } from '../types';

const ordersCollection = 'orders';

const describeOrderError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return 'Unknown Firestore error while processing orders.';
  }

  const code = 'code' in error ? String((error as { code?: string }).code ?? '') : '';

  if (code === 'failed-precondition') {
    return 'Firestore index missing for orders query. Deploy firestore.indexes.json and wait until index status becomes Enabled.';
  }

  if (code === 'permission-denied') {
    return 'Firestore permission denied for orders. Ensure rules are published and learner is authenticated.';
  }

  return `Order service error: ${error.message}`;
};

export const getOrdersForUser = async (input: {
  email: string;
  uid: string;
}): Promise<PurchaseRecord[]> => {
  if (!input.email || !input.uid) {
    return [];
  }

  if (!firebaseConfigStatus.isConfigured || !db) {
    return [];
  }

  const ordersQuery = query(
    collection(db, ordersCollection),
    where('userUid', '==', input.uid),
    orderBy('createdAt', 'desc'),
  );
  let snapshot;
  try {
    snapshot = await getDocs(ordersQuery);
  } catch (error) {
    throw new Error(describeOrderError(error));
  }
  return snapshot.docs.map((entry) => {
    const data = entry.data();
    return {
      id: entry.id,
      courseId: String(data.courseId ?? ''),
      courseTitle: String(data.courseTitle ?? 'Course'),
      userUid: String(data.userUid ?? ''),
      userEmail: String(data.userEmail ?? ''),
      userName: String(data.userName ?? ''),
      paymentId: String(data.paymentId ?? ''),
      status: (data.status as PurchaseRecord['status']) ?? 'pending',
      createdAt: new Date().toISOString(),
      amount: Number(data.amount ?? 0),
      fileUrl: data.fileUrl ? String(data.fileUrl) : undefined,
      verificationMode: data.verificationMode === 'server' ? 'server' : 'demo',
    };
  });
};

export const createOrderRecord = async (order: PurchaseRecord): Promise<PurchaseRecord> => {
  if (!firebaseConfigStatus.isConfigured || !db) {
    return order;
  }

  if (!order.userUid) {
    throw new Error('Missing authenticated user uid for order write.');
  }

  const payload = {
    courseId: order.courseId,
    courseTitle: order.courseTitle,
    userUid: order.userUid,
    userEmail: order.userEmail.trim().toLowerCase(),
    userName: order.userName,
    paymentId: order.paymentId,
    status: order.status,
    amount: order.amount,
    fileUrl: order.fileUrl ?? '',
    verificationMode: order.verificationMode ?? 'server',
    createdAt: serverTimestamp(),
  };

  const orderId = order.paymentId || order.id;
  try {
    await setDoc(doc(db, ordersCollection, orderId), payload, { merge: true });
  } catch (error) {
    throw new Error(describeOrderError(error));
  }

  return {
    ...order,
    id: orderId,
  };
};
