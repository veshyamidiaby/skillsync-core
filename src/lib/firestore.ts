import admin from "firebase-admin";
import { GCP_PROJECT_ID } from "../constants";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.NODE_ENV === "test" ?
      "skillsync-local" : GCP_PROJECT_ID,
  });
}

const firestore = admin.firestore();

if (process.env.NODE_ENV === "test") {
  firestore.settings({ host: "localhost:8080", ssl: false });
}

export { firestore };