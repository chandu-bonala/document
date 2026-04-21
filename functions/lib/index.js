"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = exports.createPaymentOrder = void 0;
const crypto_1 = __importDefault(require("crypto"));
const cors_1 = __importDefault(require("cors"));
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
const razorpay_1 = __importDefault(require("razorpay"));
admin.initializeApp();
const db = admin.firestore();
const corsHandler = (0, cors_1.default)({ origin: true });
const razorpayKeyId = process.env.RAZORPAY_KEY_ID ?? '';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET ?? '';
const razorpay = razorpayKeyId && razorpayKeySecret
    ? new razorpay_1.default({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret,
    })
    : null;
exports.createPaymentOrder = (0, https_1.onRequest)({ cors: true }, (req, res) => {
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
            const { amount, courseId, userName, userEmail } = req.body;
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
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Could not create payment order' });
        }
    });
});
exports.verifyPayment = (0, https_1.onRequest)({ cors: true }, (req, res) => {
    corsHandler(req, res, async () => {
        if (req.method !== 'POST') {
            res.status(405).json({ error: 'Method not allowed' });
            return;
        }
        try {
            const { orderId, paymentId, signature, courseId, amount, userUid, userEmail, userName, } = req.body;
            if (!razorpayKeySecret) {
                res.status(500).json({ error: 'Razorpay secret is missing' });
                return;
            }
            const generatedSignature = crypto_1.default
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
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Payment verification failed' });
        }
    });
});
