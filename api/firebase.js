// api/firebase.js
import admin from "firebase-admin";

if (!process.env.FIREBASE_CREDENTIALS || !process.env.FIREBASE_PROJECT_ID) {
  throw new Error("FIREBASE_CREDENTIALS and FIREBASE_PROJECT_ID must be set in environment variables");
}

const credentials = JSON.parse(process.env.FIREBASE_CREDENTIALS);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(credentials),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();

export default db;
