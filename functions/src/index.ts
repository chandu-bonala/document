import crypto from 'crypto';

import cors from 'cors';
import * as admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';
import Razorpay from 'razorpay';

admin.initializeApp();

const db = admin.firestore();
const corsHandler = cors({ origin: true });

const razorpayKeyId = process.env.RAZORPAY_KEY_ID ?? '';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET ?? '';

const razorpay =
  razorpayKeyId && razorpayKeySecret
    ? new Razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret,
      })
    : null;

export const createPaymentOrder = onRequest({ cors: true }, (req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    if (!razorpay) {
      res.status(500).json({ error: 'Razorpay credentials are missing' });
      return;
    }

    try {
      const { amount, courseId, userName, userEmail } = req.body as {
        amount: number;
        courseId: string;
        userName: string;
        userEmail: string;
      };

      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100),
        currency: 'INR',
        notes: {
          courseId,
          userName,
          userEmail,
        },
      });

      res.status(200).json({
        orderId: order.id,
        amount,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Could not create payment order' });
    }
  });
});

export const verifyPayment = onRequest({ cors: true }, (req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      const {
        orderId,
        paymentId,
        signature,
        courseId,
        amount,
        userUid,
        userEmail,
        userName,
      } = req.body as {
        orderId: string;
        paymentId: string;
        signature: string;
        courseId: string;
        amount: number;
        userUid?: string;
        userEmail: string;
        userName: string;
      };

      if (!razorpayKeySecret) {
        res.status(500).json({ error: 'Razorpay secret is missing' });
        return;
      }

      const generatedSignature = crypto
        .createHmac('sha256', razorpayKeySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const status = generatedSignature === signature ? 'success' : 'failed';

      if (status === 'success') {
        const orderDocId = paymentId || `${courseId}-${Date.now()}`;
        await db.collection('orders').doc(orderDocId).set({
          courseId,
          courseTitle: req.body.courseTitle ?? 'Course',
          userUid: String(userUid ?? ''),
          userEmail: String(userEmail ?? '').toLowerCase(),
          userName,
          paymentId,
          orderId,
          status,
          amount,
          verificationMode: 'server',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      }

      res.status(200).json({ status });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Payment verification failed' });
    }
  });
});
