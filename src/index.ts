import express from "express";
import { APP_HOST, APP_PORT } from "./constants";
import { initalizeSubscribers, publishMessage } from "./pubsub";
import { SubscriberTopics } from "./types";
import { initTopics } from "./lib/pubsub-init";
import { logger } from "./lib/logger";

const app = express();

app.get("/health", (request, response) => {
  logger().info("Health check request received");
  response.status(200).send("OK");
});

app.post("/test-event", async (req, res) => {
  await publishMessage(SubscriberTopics.userCreated, {
    correlationKey: "test-correlation-key",
    id: "abc123",
    email: "test@skillsync.ai",
  });

  res.send("Test event published.");
});

(async () => {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    logger().warn(
      "[WARNING] GOOGLE_APPLICATION_CREDENTIALS is not set. GCP services may fail."
    );
  }

  try {
    await initTopics();
    logger().info("Pub/Sub topics initialized.");

    app.listen(APP_PORT, APP_HOST, () => {
      logger().info(
        `Server is running at http://${APP_HOST}:${APP_PORT}`
      );

      initalizeSubscribers();
    });
  } catch (error) {
    logger().error("Error initializing app:", error as any);
  }
})();