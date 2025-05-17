import admin from "firebase-admin";
import { GCP_PROJECT_ID } from "../constants";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: GCP_PROJECT_ID,
  });
}

const firestore = admin.firestore();

export { firestore };