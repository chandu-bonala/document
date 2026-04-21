export type OrderStatus = 'pending' | 'success' | 'failed';

export type Course = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  subject: string;
  level: string;
  pageCount: number;
  price: number;
  fileUrl: string;
  createdAt: string;
  isPublished: boolean;
  pdfName?: string;
  uploadStatus?: 'ready';
  previewPoints?: string[];
};

export type PurchaseRecord = {
  id: string;
  courseId: string;
  courseTitle: string;
  userUid: string;
  userEmail: string;
  userName: string;
  paymentId: string;
  status: OrderStatus;
  createdAt: string;
  amount: number;
  fileUrl?: string;
  verificationMode?: 'demo' | 'server';
};

export type NewCourseInput = {
  title: string;
  description: string;
  price: number;
  pdfUri: string;
  pdfName: string;
  subject?: string;
  level?: string;
  pageCount?: number;
  tagline?: string;
};

export type CheckoutSession = {
  paymentId: string;
  orderId: string;
  signature: string;
  amount: number;
  courseId: string;
  userUid: string;
  userEmail: string;
  userName: string;
};

export type AppRoute =
  | { name: 'home' }
  | { name: 'detail'; courseId: string }
  | { name: 'checkout'; courseId: string }
  | { name: 'purchases' }
  | { name: 'downloads' }
  | { name: 'adminLogin' }
  | { name: 'adminDashboard' }
  | { name: 'uploadCourse' }
  | { name: 'architecture' };

export type AppRouteName = AppRoute['name'];

export type LearnerProfile = {
  name: string;
  email: string;
};

export type DownloadResult = {
  kind: 'mock' | 'external';
  destination: string;
};

export type AdminProfile = {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  role: string;
  isDemo: boolean;
  createdAt: string;
};
