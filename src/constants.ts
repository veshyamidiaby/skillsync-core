import "dotenv/config";

export const APP_HOST = process.env.APP_HOST || "localhost";
export const APP_PORT = parseInt(process.env.APP_PORT || "3000", 10);
export const LOG_LEVEL = process.env.LOG_LEVEL || "debug";
export const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID || "your-gcp-project-id";
