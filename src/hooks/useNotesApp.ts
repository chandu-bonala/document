import * as DocumentPicker from 'expo-document-picker';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Linking } from 'react-native';

import { auth, firebaseConfigStatus } from '../config/firebase';
import { mockCourses } from '../data/mockCourses';
import { getAdmins, signInAdmin, signOutAdmin, signUpAdmin } from '../services/adminService';
import { getCourses, toggleCoursePublishState, uploadCoursePdf } from '../services/courseService';
import { requestDownload } from '../services/downloadService';
import { createOrderRecord, getOrdersForUser } from '../services/orderService';
import { beginRazorpayCheckout, verifyPaymentOnServer } from '../services/paymentService';
import { AdminProfile, AppRoute, Course, LearnerProfile, PurchaseRecord } from '../types';

const emptyLearner: LearnerProfile = {
  name: '',
  email: '',
};

const emptyUploadForm = {
  title: '',
  description: '',
  price: '',
  subject: '',
  level: '',
  pageCount: '',
  tagline: '',
  selectedPdfName: '',
  selectedPdfUri: '',
};

export const useNotesApp = () => {
  const [route, setRoute] = useState<AppRoute>({ name: 'home' });
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [orders, setOrders] = useState<PurchaseRecord[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(mockCourses[0]?.id ?? '');
  const [learner, setLearner] = useState<LearnerProfile>(emptyLearner);
  const [learnerUid, setLearnerUid] = useState('');
  const [authSetupError, setAuthSetupError] = useState('');
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [adminLogin, setAdminLogin] = useState({
    mode: 'signin' as 'signin' | 'signup',
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    isSubmitting: false,
    isLoggedIn: false,
  });
  const [uploadForm, setUploadForm] = useState(emptyUploadForm);
  const [isUploading, setIsUploading] = useState(false);
  const [adminSessionKind, setAdminSessionKind] = useState<'none' | 'demo' | 'firebase'>('none');
  const [admins, setAdmins] = useState<AdminProfile[]>([]);
  const [uploadFeedback, setUploadFeedback] = useState({
    stage: '' as '' | 'validating' | 'firestore' | 'done' | 'error',
    message: '',
  });
  const [demoMode, setDemoMode] = useState(!firebaseConfigStatus.paymentVerificationEndpoint);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const loadedCourses = await getCourses();
        if (!active) {
          return;
        }
        setCourses(loadedCourses);
        if (loadedCourses[0]) {
          setSelectedCourseId((current) => current || loadedCourses[0].id);
        }
      } catch (error) {
        console.error('Failed to bootstrap courses', error);
      } finally {
        if (active) {
          setIsLoadingCourses(false);
        }
      }
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!firebaseConfigStatus.isConfigured || !auth) {
      return;
    }

    const firebaseAuth = auth;
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user) {
        setLearnerUid(user.uid);
        setAuthSetupError('');
        return;
      }

      try {
        const session = await signInAnonymously(firebaseAuth);
        setLearnerUid(session.user.uid);
        setAuthSetupError('');
      } catch (error) {
        console.error('Failed to sign in learner anonymously', error);
        const message = error instanceof Error ? error.message : 'Could not initialize learner authentication.';
        const friendlyMessage =
          message.includes('auth/operation-not-allowed')
            ? 'Enable Anonymous sign-in in Firebase Authentication for checkout and order writes.'
            : `Learner auth failed: ${message}`;
        setAuthSetupError(friendlyMessage);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      if (!learner.email || !learnerUid) {
        setOrders([]);
        return;
      }

      try {
        const records = await getOrdersForUser({
          email: learner.email,
          uid: learnerUid,
        });
        if (active) {
          setOrders(records);
        }
      } catch (error) {
        console.error('Failed to load orders', error);
      }
    };

    loadOrders();

    return () => {
      active = false;
    };
  }, [learner.email, learnerUid]);

  useEffect(() => {
    let active = true;

    const loadAdmins = async () => {
      try {
        const records = await getAdmins();
        if (active) {
          setAdmins(records);
        }
      } catch (error) {
        console.error('Failed to load admins', error);
      }
    };

    loadAdmins();

    return () => {
      active = false;
    };
  }, [adminLogin.isLoggedIn]);

  const publishedCourses = useMemo(() => courses.filter((course) => course.isPublished), [courses]);

  const selectedCourse = useMemo(() => {
    const list = route.name === 'adminDashboard' ? courses : publishedCourses;
    return list.find((course) => course.id === selectedCourseId) ?? courses[0] ?? null;
  }, [courses, publishedCourses, route.name, selectedCourseId]);

  const purchasedCourses = useMemo(
    () => orders.filter((order) => order.status === 'success'),
    [orders],
  );

  const purchaseMap = useMemo(() => new Set(purchasedCourses.map((order) => order.courseId)), [purchasedCourses]);

  const stats = useMemo(
    () => ({
      totalCourses: courses.length,
      publishedCourses: courses.filter((course) => course.isPublished).length,
      totalRevenue: orders.filter((order) => order.status === 'success').reduce((sum, order) => sum + order.amount, 0),
      successfulOrders: orders.filter((order) => order.status === 'success').length,
    }),
    [courses, orders],
  );

  const navigate = (next: AppRoute) => setRoute(next);

  const openAdminPanel = () => {
    if (adminLogin.isLoggedIn) {
      setRoute({ name: 'adminDashboard' });
      return;
    }

    setRoute({ name: 'adminLogin' });
  };

  const openCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setRoute({ name: 'detail', courseId });
  };

  const openCheckout = (courseId: string) => {
    setSelectedCourseId(courseId);
    setRoute({ name: 'checkout', courseId });
  };

  const performCheckout = async () => {
    if (!selectedCourse) {
      return;
    }

    if (firebaseConfigStatus.isConfigured && !learnerUid) {
      Alert.alert(
        'Authentication required',
        authSetupError || 'Learner session is not ready yet. Enable Anonymous Auth in Firebase and retry.',
      );
      return;
    }

    setIsCheckingOut(true);
    try {
      const session = await beginRazorpayCheckout(selectedCourse, learner, learnerUid);
      const verification = await verifyPaymentOnServer(session);
      const draftOrder: PurchaseRecord = {
        id: `${selectedCourse.id}-${Date.now()}`,
        courseId: selectedCourse.id,
        courseTitle: selectedCourse.title,
        userUid: session.userUid,
        userEmail: learner.email.trim().toLowerCase(),
        userName: learner.name.trim(),
        paymentId: session.paymentId,
        status: verification.status,
        createdAt: new Date().toISOString(),
        amount: selectedCourse.price,
        fileUrl: verification.status === 'success' ? selectedCourse.fileUrl : undefined,
        verificationMode: verification.mode,
      };

      const savedOrder = await createOrderRecord(draftOrder);
      setOrders((current) => [savedOrder, ...current]);
      setDemoMode(verification.mode === 'demo');

      if (savedOrder.status === 'success') {
        Alert.alert(
          verification.mode === 'demo' ? 'Demo payment complete' : 'Payment verified',
          'The course is unlocked and available in Downloads.',
        );
        setRoute({ name: 'downloads' });
      } else {
        Alert.alert(
          'Verification pending',
          'The payment request was created, but the backend still needs to confirm the signature before unlocking downloads.',
        );
        setRoute({ name: 'purchases' });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Checkout failed.';
      Alert.alert('Checkout failed', message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const downloadPurchasedCourse = async (courseId: string) => {
    const order = purchasedCourses.find((entry) => entry.courseId === courseId);
    const course = courses.find((entry) => entry.id === courseId);

    if (!order || !course) {
      Alert.alert('Download unavailable', 'This course is not unlocked yet.');
      return;
    }

    setIsDownloading(courseId);
    try {
      const result = await requestDownload(order.fileUrl ?? course.fileUrl, course.title);
      if (result.kind === 'external') {
        await Linking.openURL(result.destination);
      } else {
        Alert.alert('Mock download ready', `Generated demo file name: ${result.destination}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Download failed.';
      Alert.alert('Download failed', message);
    } finally {
      setIsDownloading(null);
    }
  };

  const handleAdminLogin = async () => {
    setAdminLogin((current) => ({ ...current, isSubmitting: true }));
    try {
      const session = await signInAdmin(adminLogin.email, adminLogin.password);
      setAdminSessionKind(session.authMode);
      try {
        const records = await getAdmins();
        setAdmins(records);
      } catch (listError) {
        console.error('Admin login succeeded but admin list fetch failed', listError);
      }
      setAdminLogin((current) => ({ ...current, isSubmitting: false, isLoggedIn: true }));
      setRoute({ name: 'adminDashboard' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Admin login failed.';
      setAdminLogin((current) => ({ ...current, isSubmitting: false }));
      Alert.alert('Admin login blocked', message);
    }
  };

  const handleAdminSignup = async () => {
    if (adminLogin.password !== adminLogin.confirmPassword) {
      Alert.alert('Password mismatch', 'Password and confirm password should match.');
      return;
    }

    setAdminLogin((current) => ({ ...current, isSubmitting: true }));
    try {
      const session = await signUpAdmin({
        displayName: adminLogin.displayName,
        email: adminLogin.email,
        password: adminLogin.password,
      });
      setAdminSessionKind(session.authMode);
      const records = await getAdmins();
      setAdmins(records);
      setAdminLogin((current) => ({
        ...current,
        isSubmitting: false,
        isLoggedIn: true,
        mode: 'signin',
        confirmPassword: '',
      }));
      Alert.alert('Admin account created', 'The new admin account is ready and has been signed in.');
      setRoute({ name: 'adminDashboard' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Admin signup failed.';
      const friendlyMessage =
        message.includes('permission-denied')
          ? 'Firebase Auth account may have been created, but Firestore blocked saving the admin profile. Publish the Firestore rules first, then try again.'
          : message.includes('auth/email-already-in-use')
            ? 'That email is already registered. Try signing in instead.'
            : message.includes('auth/operation-not-allowed')
              ? 'Enable Email/Password sign-in in Firebase Authentication before creating admins.'
              : message;
      setAdminLogin((current) => ({ ...current, isSubmitting: false }));
      Alert.alert('Admin signup blocked', friendlyMessage);
    }
  };

  const handleAdminLogout = async () => {
    await signOutAdmin();
    setAdminLogin({
      mode: 'signin',
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
      isSubmitting: false,
      isLoggedIn: false,
    });
    setAdminSessionKind('none');
    setRoute({ name: 'home' });
  };

  const pickPdf = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled) {
      return;
    }

    const file = result.assets[0];

    setUploadForm((current) => ({
      ...current,
      selectedPdfName: file.name,
      selectedPdfUri: file.uri,
    }));
    setUploadFeedback({
      stage: '',
      message: '',
    });
  };

  const submitCourseUpload = async () => {
    setUploadFeedback({
      stage: 'validating',
      message: 'Checking the upload form before sending data to Firebase.',
    });

    if (!uploadForm.title || !uploadForm.price || !uploadForm.selectedPdfUri) {
      setUploadFeedback({
        stage: 'error',
        message: 'Missing title, price, or PDF file.',
      });
      Alert.alert('Missing details', 'Add title, price, and a PDF before uploading.');
      return;
    }

    if (adminSessionKind === 'demo') {
      setUploadFeedback({
        stage: 'error',
        message:
          'You are logged in with the local demo admin. Demo admin can open the panel, but it cannot write to Firestore. Create or sign in with a real Firebase admin account first.',
      });
      Alert.alert(
        'Real Firebase login required',
        'Demo admin is only for UI testing. Use Admin Sign Up or a real Firebase admin login before uploading courses.',
      );
      return;
    }

    setIsUploading(true);
    setUploadFeedback({
      stage: 'firestore',
      message: 'Saving the course and PDF reference in Firestore.',
    });

    try {
      const created = await uploadCoursePdf({
        title: uploadForm.title,
        description: uploadForm.description,
        price: Number(uploadForm.price),
        pdfUri: uploadForm.selectedPdfUri,
        pdfName: uploadForm.selectedPdfName,
        subject: uploadForm.subject,
        level: uploadForm.level,
        pageCount: Number(uploadForm.pageCount || 0),
        tagline: uploadForm.tagline,
      });
      setUploadFeedback({
        stage: 'done',
        message: 'Course document and PDF reference were saved in Firestore.',
      });
      setCourses((current) => [created, ...current]);
      setUploadForm(emptyUploadForm);
      Alert.alert(
        'Course created',
        'The course data was saved in Firestore only. Firebase Storage is no longer required for this upload flow.',
      );
      setRoute({ name: 'adminDashboard' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Course upload failed.';
      const friendlyMessage = message.includes('permission-denied')
        ? 'Firebase blocked the course save. Most likely causes: Firestore rules are not published yet, or you are not signed in with a real Firebase admin account.'
        : message;
      setUploadFeedback({
        stage: 'error',
        message: friendlyMessage,
      });
      Alert.alert('Upload failed', friendlyMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const togglePublish = async (courseId: string) => {
    const current = courses.find((course) => course.id === courseId);
    if (!current) {
      return;
    }

    try {
      const updated = await toggleCoursePublishState(current);
      setCourses((all) => all.map((course) => (course.id === updated.id ? updated : course)));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not update publish status.';
      Alert.alert('Update failed', message);
    }
  };

  return {
    route,
    courses,
    publishedCourses,
    selectedCourse,
    learner,
    setLearner,
    orders,
    purchasedCourses,
    purchaseMap,
    admins,
    isLoadingCourses,
    isCheckingOut,
    isDownloading,
    demoMode,
    authSetupError,
    adminLogin,
    setAdminLogin,
    uploadForm,
    setUploadForm,
    isUploading,
    adminSessionKind,
    uploadFeedback,
    stats,
    firebaseReady: firebaseConfigStatus.isConfigured,
    navigate,
    openAdminPanel,
    openCourse,
    openCheckout,
    performCheckout,
    downloadPurchasedCourse,
    handleAdminLogin,
    handleAdminSignup,
    handleAdminLogout,
    pickPdf,
    submitCourseUpload,
    togglePublish,
  };
};

export type NotesAppController = ReturnType<typeof useNotesApp>;
