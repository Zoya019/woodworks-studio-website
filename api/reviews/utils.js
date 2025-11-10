const DEFAULT_REVIEWS_COLLECTION = "reviews";

export const REVIEWS_COLLECTION =
  process.env.FIREBASE_REVIEWS_COLLECTION?.trim() || DEFAULT_REVIEWS_COLLECTION;

export function logReviewDebug(message, meta = {}) {
  const prefix = "[reviews]";
  if (Object.keys(meta).length > 0) {
    console.log(`${prefix} ${message}`, meta);
  } else {
    console.log(`${prefix} ${message}`);
  }
}

