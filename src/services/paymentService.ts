import { firebaseConfigStatus } from '../config/firebase';
import { CheckoutSession, Course, LearnerProfile } from '../types';

type VerificationResponse = {
  status: 'success' | 'pending' | 'failed';
  mode: 'demo' | 'server';
};

export const beginRazorpayCheckout = async (
  course: Course,
  learner: LearnerProfile,
  learnerUid: string,
): Promise<CheckoutSession> => {
  if (!course.price) {
    throw new Error('A valid course price is required before checkout.');
  }

  if (!learner.name || !learner.email) {
    throw new Error('Learner name and email are required for purchase records.');
  }

  if (firebaseConfigStatus.isConfigured && !learnerUid) {
    throw new Error('Learner authentication is required before checkout.');
  }

  const effectiveLearnerUid = learnerUid || 'demo-learner';

  if (firebaseConfigStatus.paymentOrderEndpoint) {
    const response = await fetch(firebaseConfigStatus.paymentOrderEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courseId: course.id,
        amount: course.price,
        userUid: effectiveLearnerUid,
        userName: learner.name,
        userEmail: learner.email,
      }),
    });

    if (!response.ok) {
      throw new Error('Could not create a Razorpay order from the backend.');
    }

    const data = (await response.json()) as Partial<CheckoutSession>;
    return {
      paymentId: data.paymentId ?? `pay_${Date.now()}`,
      orderId: data.orderId ?? `order_${Date.now()}`,
      signature: data.signature ?? 'server-issued-order',
      amount: course.price,
      courseId: course.id,
      userUid: effectiveLearnerUid,
      userEmail: learner.email.trim(),
      userName: learner.name.trim(),
    };
  }

  return {
    paymentId: `pay_${Date.now()}`,
    orderId: `order_${Date.now()}`,
    signature: 'frontend-simulated-signature',
    amount: course.price,
    courseId: course.id,
    userUid: effectiveLearnerUid,
    userEmail: learner.email.trim(),
    userName: learner.name.trim(),
  };
};

export const verifyPaymentOnServer = async (
  session: CheckoutSession,
): Promise<VerificationResponse> => {
  if (!firebaseConfigStatus.paymentVerificationEndpoint) {
    return { status: 'success', mode: 'demo' };
  }

  const response = await fetch(firebaseConfigStatus.paymentVerificationEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(session),
  });

  if (!response.ok) {
    throw new Error('Payment verification request failed.');
  }

  const data = (await response.json()) as { status?: string };
  return {
    status: data.status === 'failed' ? 'failed' : data.status === 'success' ? 'success' : 'pending',
    mode: 'server',
  };
};
