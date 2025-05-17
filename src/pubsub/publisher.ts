import { PubSub } from "@google-cloud/pubsub";
import { GCP_PROJECT_ID } from "../constants";
import { PublisherMessage, PublisherTopic } from "../types";
import { logger } from "../lib/logger";

const pubsub = new PubSub({ projectId: GCP_PROJECT_ID });

const publishMessage = async (topicName: PublisherTopic, data: PublisherMessage) => {
  const dataBuffer = Buffer.from(JSON.stringify(data));

  try {
    const messageId = await pubsub
      .topic(topicName)
      .publishMessage({ data: dataBuffer });
    logger(data?.correlationKey).info(`Message ${messageId} published to ${topicName}`);
  } catch (error) {
    logger(data?.correlationKey).error(`Error publishing message to ${topicName}:`, error as any);
  }
};

export { publishMessage };