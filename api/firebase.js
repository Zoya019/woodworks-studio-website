// api/firebase.js
import admin from "firebase-admin";

let db;

// ✅ If missing credentials → test mode with mock Firestore
if (
  process.env.NODE_ENV === "test" ||
  !process.env.FIREBASE_CREDENTIALS ||
  !process.env.FIREBASE_PROJECT_ID
) {
  console.warn("⚠️ Running in TEST/NON-CONFIGURED mode — using mock Firestore");

  db = {
    collection: (name) => ({
      add: async (data) => {
        console.log(`Mock add → ${name}`, data);
        return { id: "mock-id-" + Date.now() };
      },
      where: () => ({
        limit: () => ({
          get: async () => ({
            empty: false,
            docs: [
              {
                id: "mock-id-verified",
                data: () => ({
                  name: "Test User",
                  email: "test@example.com",
                  rating: 5,
                  review: "Great service!",
                  verified: true,
                  createdAt: new Date(),
                }),
                ref: { update: async () => {} },
              },
            ],
          }),
        }),
        get: async () => ({
          empty: false,
          docs: [
            {
              id: "mock-id-verified",
              data: () => ({
                name: "Test User",
                email: "test@example.com",
                rating: 5,
                review: "Great service!",
                verified: true,
                createdAt: new Date(),
              }),
              ref: { update: async () => {} },
            },
          ],
        }),
      }),
      orderBy: () => ({
        limit: () => ({
          get: async () => ({
            docs: [
              {
                id: "mock-id-verified",
                data: () => ({
                  name: "Test User",
                  email: "test@example.com",
                  rating: 5,
                  review: "Great service!",
                  verified: true,
                  createdAt: new Date(),
                }),
              },
            ],
          }),
        }),
      }),
    }),
  };
} else {
  // ✅ PRODUCTION FIREBASE ADMIN
  const credentials = JSON.parse(process.env.FIREBASE_CREDENTIALS);

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(credentials),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }

  db = admin.firestore();
}

export default db;
