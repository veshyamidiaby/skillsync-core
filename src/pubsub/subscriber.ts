import { PubSub } from "@google-cloud/pubsub";
import {
  ProjectCreatedRequestMessage,
  ProjectDeletedRequestMessage,
  ProjectUpdatedRequestMessage,
  SubscriberMessage,
  SubscriberTopics,
  TaskAssignedRequestMessage,
  TaskCompletedRequestMessage,
  TaskCreatedRequestMessage,
  TaskDeletedRequestMessage,
  TaskUpdatedRequestMessage,
  UserCreatedRequestMessage,
  UserDeletedRequestMessage,
  UserUpdatedRequestMessage
} from "../types";
import { GCP_PROJECT_ID } from "../constants";
import {
  handleProjectCreated,
  handleProjectDeleted,
  handleProjectUpdated,
  handleTaskAssigned,
  handleTaskCompleted,
  handleTaskCreated,
  handleTaskDeleted,
  handleTaskUpdated,
  handleUserCreated,
  handleUserDeleted,
  handleUserUpdated
} from "../handlers";
import { logger } from "../lib/logger";

const pubsub = new PubSub({ projectId: GCP_PROJECT_ID });

const initalizeSubscribers = () => {
  logger().info("Initializing subscribers...");

  Object.values(SubscriberTopics).forEach(async (topicName) => {
    logger().info(`Initializing subscriber for topic: ${topicName}`);
    const subscriptionName = `${topicName}-subscription`;

    try {
      const [subscription] = await pubsub
        .topic(topicName)
        .subscription(subscriptionName)
        .get({ autoCreate: true });

      subscription.on("message", async (message) => {
        try {
          const messageData = JSON.parse(message.data.toString());
          await handleMessage(topicName, messageData);
          message.ack();
        } catch (error) {
          logger().error(
            `Error processing message:`,
            error as any
          );
          message.nack();
        }
      });

      subscription.on("error", (error) => {
        logger().error(
          `Error in subscription ${subscriptionName}:`,
          error as any
        );
      });

      subscription.on("close", () => {
        logger().info(
          `Subscription ${subscriptionName} closed`
        );
      });
    } catch (error) {
      logger().error(
        `Error initializing subscriber for ${topicName}:`,
        error as any
      );
    }
  });
};

const handleMessage = async <T extends SubscriberTopics>(
  topicName: T, messageData: SubscriberMessage
) => {
  logger(messageData?.correlationKey).info(`Received message on topic ${topicName}:`);
  logger(messageData?.correlationKey).info(messageData as any);

  switch (topicName) {
    case SubscriberTopics.userCreated:
      await handleUserCreated(messageData as UserCreatedRequestMessage);
      break;
    case SubscriberTopics.userUpdated:
      await handleUserUpdated(messageData as UserUpdatedRequestMessage);
      break;
    case SubscriberTopics.userDeleted:
      await handleUserDeleted(messageData as UserDeletedRequestMessage);
      break;
    case SubscriberTopics.projectCreated:
      await handleProjectCreated(messageData as ProjectCreatedRequestMessage);
      break;
    case SubscriberTopics.projectUpdated:
      await handleProjectUpdated(messageData as ProjectUpdatedRequestMessage);
      break;
    case SubscriberTopics.projectDeleted:
      await handleProjectDeleted(messageData as ProjectDeletedRequestMessage);
      break;
    case SubscriberTopics.taskCreated:
      await handleTaskCreated(messageData as TaskCreatedRequestMessage);
      break;
    case SubscriberTopics.taskUpdated:
      await handleTaskUpdated(messageData as TaskUpdatedRequestMessage);
      break;
    case SubscriberTopics.taskDeleted:
      await handleTaskDeleted(messageData as TaskDeletedRequestMessage);
      break;
    case SubscriberTopics.taskAssigned:
      await handleTaskAssigned(messageData as TaskAssignedRequestMessage);
      break;
    case SubscriberTopics.taskCompleted:
      await handleTaskCompleted(messageData as TaskCompletedRequestMessage);
      break;
    default:
      logger().info("No handler for this message");
  }
};

export { initalizeSubscribers };