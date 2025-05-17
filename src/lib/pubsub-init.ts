import { PubSub } from "@google-cloud/pubsub";
import { PublisherTopics, SubscriberTopics } from "../types";
import { logger } from "./logger";

const pubbsub = new PubSub();

const initTopics = async () => {
  for (const topic of Object.values(SubscriberTopics)) {
    const [exists] = await pubbsub.topic(topic).exists();

    if (!exists) {
      logger().info(`Topic ${topic} does not exist. Creating...`);
      await pubbsub.createTopic(topic);
      logger().info(`Topic ${topic} created.`);
    } else {
      logger().info(`Topic ${topic} already exists.`);
    }
  }

  for (const topic of Object.values(PublisherTopics)) {
    const [exists] = await pubbsub.topic(topic).exists();

    if (!exists) {
      logger().info(`Topic ${topic} does not exist. Creating...`);
      await pubbsub.createTopic(topic);
      logger().info(`Topic ${topic} created.`);
    } else {
      logger().info(`Topic ${topic} already exists.`);
    }
  }
};

export { initTopics };