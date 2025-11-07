// api/firebase.js
import admin from "firebase-admin";

let db;

// Check if we're in test mode
if (process.env.NODE_ENV === 'test' || !process.env.FIREBASE_CREDENTIALS || !process.env.FIREBASE_PROJECT_ID) {
  console.warn("⚠️  Running in test mode - using mock database");
  
  // Mock Firestore for testing
  db = {
    collection: (name) => ({
      add: async (data) => {
        console.log(`Mock: Adding to ${name}:`, data);
        return { id: 'mock-id-' + Date.now() };
      },
      doc: (id) => ({
        get: async () => {
          console.log(`Mock: Getting doc ${id} from ${name}`);
          return {
            exists: id.includes('verified'),
            data: () => ({
              name: 'Test User',
              email: 'test@example.com',
              rating: 5,
              message: 'Great service!',
              status: id.includes('verified') ? 'verified' : 'pending',
              token: 'test-token',
              timestamp: new Date()
            })
          };
        },
        update: async (data) => {
          console.log(`Mock: Updating doc ${id} in ${name}:`, data);
          return {};
        }
      }),
      get: async () => {
        console.log(`Mock: Getting all docs from ${name}`);
        return {
          docs: [{
            id: 'mock-id-1',
            data: () => ({
              name: 'Test User',
              email: 'test@example.com',
              rating: 5,
              message: 'Great service!',
              status: 'verified',
              timestamp: new Date()
            })
          }]
        };
      },
      where: (field, op, value) => ({
        get: async () => {
          console.log(`Mock: Querying ${name} where ${field} ${op} ${value}`);
          return {
            empty: false,
            docs: [{
              id: 'mock-id-1',
              data: () => ({
                name: 'Test User',
                email: 'test@example.com',
                rating: 5,
                message: 'Great service!',
                status: 'verified',
                timestamp: new Date()
              })
            }]
          };
        }
      })
    })
  };
} else {
  // Production Firebase setup
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
