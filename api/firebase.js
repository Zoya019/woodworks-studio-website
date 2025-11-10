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

  const memoryStore = new Map();

  function ensureCollection(name) {
    if (!memoryStore.has(name)) {
      memoryStore.set(name, new Map());
    }
    return memoryStore.get(name);
  }

  function createQuery({ collectionName, filters = [], orderBy, limitCount }) {
    return {
      where(field, op, value) {
        return createQuery({
          collectionName,
          filters: [...filters, { field, op, value }],
          orderBy,
          limitCount,
        });
      },
      orderBy(field, direction = "asc") {
        return createQuery({
          collectionName,
          filters,
          orderBy: { field, direction },
          limitCount,
        });
      },
      limit(count) {
        return createQuery({
          collectionName,
          filters,
          orderBy,
          limitCount: count,
        });
      },
      async get() {
        const col = ensureCollection(collectionName);
        let docs = Array.from(col.entries()).map(([id, data]) => ({
          id,
          data: () => data,
          ref: createDocRef(collectionName, id),
        }));

        filters.forEach(({ field, op, value }) => {
          if (op !== "==") {
            throw new Error(`Mock Firestore only supports '==' operations`);
          }
          docs = docs.filter((doc) => doc.data()?.[field] === value);
        });

        if (orderBy) {
          const { field, direction } = orderBy;
          const factor = direction === "desc" ? -1 : 1;
          docs.sort((a, b) => {
            const valA = a.data()?.[field];
            const valB = b.data()?.[field];
            if (valA === valB) return 0;
            return valA > valB ? factor : -factor;
          });
        }

        if (typeof limitCount === "number") {
          docs = docs.slice(0, limitCount);
        }

        return {
          empty: docs.length === 0,
          docs,
        };
      },
    };
  }

  function createDocRef(collectionName, id) {
    return {
      async get() {
        const col = ensureCollection(collectionName);
        const data = col.get(id);
        return {
          id,
          exists: data !== undefined,
          data: () => data,
        };
      },
      async set(data, options) {
        const col = ensureCollection(collectionName);
        if (options?.merge) {
          const existing = col.get(id) || {};
          col.set(id, { ...existing, ...data });
        } else {
          col.set(id, data);
        }
      },
      async update(data) {
        const col = ensureCollection(collectionName);
        const existing = col.get(id);
        if (!existing) {
          throw new Error(`Mock document ${collectionName}/${id} does not exist`);
        }
        col.set(id, { ...existing, ...data });
      },
      async delete() {
        const col = ensureCollection(collectionName);
        col.delete(id);
      },
    };
  }

  db = {
    collection: (name) => ({
      doc: (id) => createDocRef(name, id),
      add: async (data) => {
        const col = ensureCollection(name);
        const id = `mock-id-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        col.set(id, data);
        return { id };
      },
      where(field, op, value) {
        return createQuery({
          collectionName: name,
          filters: [{ field, op, value }],
        });
      },
      orderBy(field, direction) {
        return createQuery({
          collectionName: name,
          orderBy: { field, direction },
        });
      },
      limit(count) {
        return createQuery({
          collectionName: name,
          limitCount: count,
        });
      },
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
