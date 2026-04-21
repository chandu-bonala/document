# Firestore Setup Guide

## Overview

Your app now uses three explicit Firestore collections with secure, role-based access:

| Collection | Purpose | Document ID | Ownership |
|-----------|---------|------------|-----------|
| **admins** | Admin user profiles & permissions | Firebase UID | Self + admins |
| **courses** | Published course metadata & PDFs | Custom (e.g., `course-1`) | Admins only |
| **orders** | Purchase records & payment verification | Payment ID (e.g., `pay_...`) | User + admins |

---

## Collection Schemas

### 1. `admins` Collection

**Document ID**: Firebase Authentication UID of the admin user

```json
{
  "uid": "string (Firebase UID)",
  "email": "string (admin@example.com)",
  "displayName": "string (Admin Name)",
  "role": "admin",
  "isDemo": false,
  "createdAt": "timestamp"
}
```

**Rules**:
- ✅ Admins can read/write all admin profiles
- ✅ Users can create their own profile (Firebase signup)
- ✅ Only admins can delete admin profiles

---

### 2. `courses` Collection

**Document ID**: Custom course identifier (e.g., `face-structure-blueprint`)

```json
{
  "title": "string (Course Name)",
  "tagline": "string (Short description)",
  "description": "string (Full description)",
  "subject": "string (e.g., Looksmaxxing, Fitness)",
  "level": "string (e.g., Beginner, Advanced)",
  "pageCount": 48,
  "price": 499,
  "fileUrl": "string (GCS or CDN URL to PDF)",
  "isPublished": true,
  "pdfName": "string (optional, PDF file name)",
  "previewPoints": ["string (preview bullet 1)", "string (preview bullet 2)"],
  "createdAt": "timestamp"
}
```

**Rules**:
- ✅ Anyone can read **published** courses (`isPublished: true`)
- ✅ Only admins can create/update/delete courses
- ✅ Admins can read unpublished (`isPublished: false`) courses

---

### 3. `orders` Collection

**Document ID**: Payment ID (e.g., `pay_Ej5ePh3Z0I7ZyP` or auto-generated timestamp)

```json
{
  "courseId": "string (refs courses collection)",
  "courseTitle": "string (snapshot of course title)",
  "userUid": "string (Firebase UID of buyer)",
  "userEmail": "string (buyer email, lowercase)",
  "userName": "string (buyer name)",
  "paymentId": "string (Razorpay payment ID)",
  "orderId": "string (Razorpay order ID, backend only)",
  "status": "success|pending|failed",
  "amount": 499,
  "fileUrl": "string (optional, unlocked PDF URL)",
  "verificationMode": "server|demo",
  "createdAt": "timestamp"
}
```

**Rules**:
- ✅ Users can **create** orders only with their own `userUid`
- ✅ Users can **read** their own orders (`userUid` matches auth)
- ✅ Users can **update** their own orders (limited to status changes)
- ✅ Admins can read/update/delete all orders

---

## Deployment Steps

### Step 1: Deploy Firestore Rules

1. Go to **Firebase Console** → **Firestore Database** → **Rules** tab
2. Replace the current rules with the new content from `firestore.rules`
3. Click **Publish** (test mode: read & write allowed to all; this is dev-only)

**New Rules File**: [firestore.rules](./firestore.rules)

### Step 2: Seed Demo Data (Optional)

For development/testing, load sample `admins`, `courses`, and `orders`:

```bash
# Option A: Use Firebase CLI
firebase firestore:bulk-load firestore.demo.seed.json

# Option B: Import manually via Firebase Console
# → Firestore → (select database) → (hamburger) → Import collection
```

**Demo Seed File**: [firestore.demo.seed.json](./firestore.demo.seed.json)

### Step 3: Enable Anonymous Authentication

1. Go to **Firebase Console** → **Authentication** → **Sign-in method**
2. Enable **Anonymous** sign-in (used for learner checkout)
3. Save

---

## Application Changes

### Frontend

- ✅ Learners auto-sign-in anonymously on app start → receive `userUid` for orders
- ✅ Orders are now keyed by `paymentId` (idempotent, prevents duplicates)
- ✅ Order lookups filter by authenticated `userUid` instead of email (secure)
- ✅ Admin sign-ups now create `admins` collection profiles (required by rules)

### Backend (Cloud Functions)

- ✅ `verifyPayment()` now stores `userUid` from request payload
- ✅ `verifyPayment()` uses `setDoc(..., { merge: true })` to prevent duplicate orders
- ✅ Both `/orders` reads and writes now use `userUid` for ownership validation

### Types

- ✅ `PurchaseRecord` now includes `userUid`
- ✅ `CheckoutSession` now includes `userUid`
- ✅ All Firestore references are consistent

---

## Security Architecture

### Authentication Layers

1. **Admins**: Firebase Email/Password auth → creates `admins` doc → verified by rules
2. **Learners**: Firebase Anonymous auth (auto) → triggers on app start
3. **Orders**: Signed by payment backend → `userUid` validated on write

### Firestore Rules Flow

```
Order Write (frontend)
  ↓
Check: request.auth.uid == request.resource.data.userUid
  ↓
Check: All required fields present & typed
  ↓
ALLOW or DENY
```

**Example**:
```javascript
allow create: if isSignedIn()
  && request.resource.data.userUid == request.auth.uid
  && request.resource.data.userEmail is string
  && request.resource.data.courseId is string
  && request.resource.data.status is string
  && request.resource.data.amount is number;
```

This prevents:
- ✅ Unauthenticated order creation
- ✅ Orders created with another user's `userUid`
- ✅ Malformed order documents (missing fields)

---

## Testing the Setup

### 1. Admin Signup (Demo)
```bash
Email: admin@example.com
Password: SecurePassword123!
Display Name: Your Admin Name
```

→ Should create `admins/{uid}` document

### 2. Create Course (Admin)
- Sign in as admin
- Go to **Upload Course** screen
- Fill in course details and PDF
- Press **Upload**

→ Should create `courses/{courseId}` document

### 3. Purchase Course (Learner)
- Sign out (or use incognito)
- Browse published courses
- Add learner email & name → **Pay and Unlock**

→ Should create `orders/{paymentId}` document with `status: success` or `pending`

### 4. View Orders (Learner)
- After checkout, go to **Purchases** tab

→ Should list user's own orders only

---

## Production Checklist

- [ ] Deploy `firestore.rules` to Firebase Console
- [ ] Enable Anonymous Authentication
- [ ] Create at least one admin via signup (adds self to `admins` collection)
- [ ] Upload first course (creates `courses` collection)
- [ ] Test order flow in production environment
- [ ] Verify Razorpay webhook delivers `userUid` in request body
- [ ] Monitor Firestore usage & quota

---

## Rollback (If Needed)

If rules are too restrictive and block legitimate writes:

1. Temporarily switch to **Test Mode** (allow all) in Firebase Console
2. Debug the specific rule line & fix
3. Re-publish corrected rules
4. Restore Production Mode rules

---

## Troubleshooting

### "Permission denied" on order creation

**Cause**: Learner UID mismatch in order doc

**Fix**:
```javascript
// ❌ Wrong
{ userUid: "different-uid", ...order }

// ✅ Right
{ userUid: request.auth.uid, ...order }
```

### "Admin profile not found"

**Cause**: Admin signup didn't write to `admins` collection

**Fix**: Republish rules, then re-signup admin

### "Courses collection is empty"

**Cause**: No courses uploaded yet, or `isPublished: false`

**Fix**: Admin uploads course and toggles `isPublished` to `true`

---

## API Reference

### Frontend Services

#### `getOrdersForUser({ email, uid })`
Fetch user's orders from `orders` collection filtered by `userUid`.

```typescript
const orders = await getOrdersForUser({
  email: "learner@example.com",
  uid: "firebase-uid-xyz"
});
```

#### `createOrderRecord(order: PurchaseRecord)`
Save a new order to `orders` collection (idempotent by payment ID).

```typescript
const savedOrder = await createOrderRecord({
  userUid: "firebase-uid-xyz",
  courseId: "course-id",
  paymentId: "pay_...",
  status: "success",
  // ... other fields
});
```

#### `getCourses()`
Fetch all published courses + unpublished (if admin).

```typescript
const courses = await getCourses();
```

#### `uploadCoursePdf(input: NewCourseInput)`
Create new course in `courses` collection (admin only).

```typescript
const course = await uploadCoursePdf({
  title: "My Course",
  price: 499,
  pdfUri: "file://...",
  // ... other fields
});
```

---

## Related Files

- **Firestore Rules**: [firestore.rules](./firestore.rules)
- **Demo Seed Data**: [firestore.demo.seed.json](./firestore.demo.seed.json)
- **Order Service**: [src/services/orderService.ts](./src/services/orderService.ts)
- **Course Service**: [src/services/courseService.ts](./src/services/courseService.ts)
- **Admin Service**: [src/services/adminService.ts](./src/services/adminService.ts)
- **Payment Service**: [src/services/paymentService.ts](./src/services/paymentService.ts)
- **Cloud Functions**: [functions/src/index.ts](./functions/src/index.ts)

---

## Summary of Changes

| Component | Change | Impact |
|-----------|--------|--------|
| Firestore Rules | Explicit collection schemas with field validation | Stricter security, prevents malformed writes |
| Anonymous Auth | Auto sign-in learners on app start | Users get `userUid` without email signup |
| Orders Table | Keyed by `paymentId`, includes `userUid` | Idempotent, owner-verified, no duplicates |
| Admin Profiles | Created on signup/login, stored in `admins` collection | Required for rule validation & audit trail |
| Cloud Functions | Deterministic order storage by payment ID | No duplicate orders from retried webhooks |
| Type System | `PurchaseRecord` & `CheckoutSession` include `userUid` | Type-safe ownership validation |

---

**Ready to deploy?** Follow the **Deployment Steps** above, test in **Test Mode** first, then move to **Production Mode** rules.

For questions, check the **Troubleshooting** section or review the Firestore Security Rules documentation.
