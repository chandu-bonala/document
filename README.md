# Digital Notes Selling App

Expo React Native app for selling PDF notes with a Firebase-backed catalog, admin accounts saved in Firestore, Firestore-only course persistence, purchase tracking, and Razorpay payment verification.

## What is included

- User screens: store, course detail, checkout, purchases, downloads
- Admin screens: login, dashboard, upload course
- Firebase-ready services for courses, orders, and auth
- Firebase Functions scaffold for creating Razorpay orders and verifying signatures
- Firestore and Storage rules for published content plus admin-only writes

## Frontend setup

1. Install dependencies:
   `npm install`
2. The public Firebase app config for project `document-6b817` is already wired into `src/config/firebaseCredentials.ts`.
3. If you want to override it per environment, fill the `expo.extra` values in `app.json`.
3. Start Expo:
   `npm run start`

## Backend setup

1. Go to `functions/`
2. Install dependencies:
   `npm install`
3. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
4. For local admin SDK usage, authenticate with Firebase CLI or set `GOOGLE_APPLICATION_CREDENTIALS` to a local service-account JSON file that is not committed.
4. Build:
   `npm run build`
5. Deploy with Firebase CLI or run the emulator

## Security note about the service account

Do not paste the Firebase service-account private key into the app code or commit it into the repo.
If that key has already been exposed, revoke it in Google Cloud / Firebase and generate a new one before using this project in production.

## Firebase collections

### `admins`

```json
{
  "email": "admin@gmail.com",
  "displayName": "Demo Admin",
  "role": "admin",
  "isDemo": true,
  "createdAt": "timestamp"
}
```

### `courses`

```json
{
  "title": "Java Notes",
  "tagline": "Interview-ready handwritten concepts",
  "price": 199,
  "description": "Compact PDF notes",
  "subject": "Java",
  "level": "Intermediate",
  "pageCount": 94,
  "fileUrl": "document-or-picker-uri",
  "pdfName": "java-notes.pdf",
  "uploadStatus": "ready",
  "isPublished": true,
  "createdAt": "timestamp"
}
```

### `orders`

```json
{
  "courseId": "abc123",
  "courseTitle": "Java Notes",
  "userEmail": "student@example.com",
  "userName": "Student",
  "paymentId": "pay_xxx",
  "status": "success",
  "amount": 199,
  "verificationMode": "server",
  "createdAt": "timestamp"
}
```

## Important security note

Do not trust frontend payment success. The app should only unlock downloads after the backend verifies the Razorpay signature and stores a successful order.

## Firestore publish rules

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return isSignedIn() &&
        (
          request.auth.token.admin == true ||
          request.auth.token.email == 'admin@gmail.com'
        );
    }

    match /admins/{adminId} {
      allow read: if isAdmin() || (isSignedIn() && request.auth.uid == adminId);
      allow create: if isSignedIn() &&
        request.auth.uid == adminId &&
        request.resource.data.email == request.auth.token.email &&
        request.resource.data.role == 'admin';
      allow update, delete: if isAdmin();
    }

    match /courses/{courseId} {
      allow read: if resource.data.isPublished == true || isAdmin();
      allow create, update, delete: if isAdmin();
    }

    match /orders/{orderId} {
      allow create: if isAdmin();
      allow read: if isAdmin() || (isSignedIn() && resource.data.userEmail == request.auth.token.email);
      allow update, delete: if isAdmin();
    }
  }
}
```

## Storage rules

```txt
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## Demo admin login

- Demo admin email: `admin@gmail.com`
- Demo admin password: `admin123`
- The app accepts those credentials locally for demo access to the admin panel.
- The Firestore seed shape for the matching admin profile is in `firestore.demo.seed.json`.
- The raw password is intentionally not stored in Firestore.
# document
