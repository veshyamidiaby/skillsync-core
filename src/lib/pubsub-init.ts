import { PubSub } from "@google-cloud/pubsub";
import { PublisherTopics, SubscriberTopics } from "../types";
import { logger } from "./logger";
import { GCP_PROJECT_ID } from "../constants";

const pubsub = new PubSub({
  apiEndpoint: process.env.NODE_ENV === "test" ? "localhost:8085" : undefined,
  projectId: process.env.NODE_ENV === "test" ? "skillsync-local" : GCP_PROJECT_ID
});

const initTopics = async () => {
  for (const topic of Object.values(SubscriberTopics)) {
    const [exists] = await pubsub.topic(topic).exists();

    if (!exists) {
      logger().info(`Topic ${topic} does not exist. Creating...`);
      await pubsub.createTopic(topic);
      logger().info(`Topic ${topic} created.`);
    } else {
      logger().info(`Topic ${topic} already exists.`);
    }
  }

  for (const topic of Object.values(PublisherTopics)) {
    const [exists] = await pubsub.topic(topic).exists();

    if (!exists) {
      logger().info(`Topic ${topic} does not exist. Creating...`);
      await pubsub.createTopic(topic);
      logger().info(`Topic ${topic} created.`);
    } else {
      logger().info(`Topic ${topic} already exists.`);
    }
  }
};

export { initTopics };