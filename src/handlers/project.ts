import { firestore } from "../lib/firestore";
import { logger } from "../lib/logger";
import { publishMessage } from "../pubsub";
import {
  ProjectCreatedRequestMessage,
  ProjectDeletedRequestMessage,
  ProjectResponseMessage,
  ProjectUpdatedRequestMessage,
  PublisherTopics,
  ResponseErrorCodes,
} from "../types";
import { projectCreatedSchema, projectDeletedSchema, projectUpdatedSchema } from "../validators";

const projectCollection = firestore.collection("projects");

const handleProjectCreated = async (data: ProjectCreatedRequestMessage) => {
  logger(data?.correlationKey).info("Handling project created message");
  logger(data?.correlationKey).info(data as any);

  const validation = projectCreatedSchema.safeParse(data);
  if (!validation.success) {
    await publishMessage(PublisherTopics.projectCreated, {
      correlationKey: data?.correlationKey,
      id: data?.id,
      status: false,
      message: "Invalid project data",
      errorCode: ResponseErrorCodes.invalidMessageData,
    } as ProjectResponseMessage);
    logger(data?.correlationKey).error(
      "Invalid project data:",
      validation.error.format()
    );
    return;
  }
  const validData = validation.data;

  try {
    const ref = projectCollection.doc(validData?.id);
    const existingProject = await ref.get();

    if (existingProject.exists) {
      await publishMessage(PublisherTopics.projectCreated, {
        correlationKey: validData?.correlationKey,
        id: validData?.id,
        status: false,
        message: "Project already exists",
        errorCode: ResponseErrorCodes.projectAlreadyExists,
      } as ProjectResponseMessage);

      logger(validData?.correlationKey).info(
        `Project already exists:`,
        data
      );
      return;
    }

    const result = await projectCollection.doc(validData?.id).set(data);

    await publishMessage(PublisherTopics.projectCreated, {
      correlationKey: validData?.correlationKey,
      id: validData?.id,
      status: true,
      message: "Project created successfully",
    } as ProjectResponseMessage);

    logger(validData?.correlationKey).info(
      `Project created message handled successfully:`,
      result as any
    );
  } catch (error) {
    await publishMessage(PublisherTopics.projectCreated, {
      correlationKey: validData?.correlationKey,
      id: validData?.id,
      status: false,
      message: "Error creating project",
      errorCode: ResponseErrorCodes.unknownError,
    } as ProjectResponseMessage);

    logger(validData?.correlationKey).error(
      "Error handling project created message:",
      error as any
    );
  }
};

const handleProjectUpdated = async (data: ProjectUpdatedRequestMessage) => {
  // Handle project created message
  logger(data?.correlationKey).info("Handling project updated message");
  logger(data?.correlationKey).info(data as any);

  const validation = projectUpdatedSchema.safeParse(data);
  if (!validation.success) {
    await publishMessage(PublisherTopics.projectCreated, {
      correlationKey: data?.correlationKey,
      id: data?.id,
      status: false,
      message: "Invalid project data",
      errorCode: ResponseErrorCodes.invalidMessageData,
    } as ProjectResponseMessage);
    logger(data?.correlationKey).error(
      "Invalid project data:",
      validation.error.format()
    );
    return;
  }
  const validData = validation.data;

  try {
    const ref = projectCollection.doc(validData?.id);
    const existingProject = await ref.get();

    if (!existingProject.exists) {
      await publishMessage(PublisherTopics.projectUpdated, {
        correlationKey: validData?.correlationKey,
        id: validData?.id,
        status: false,
        message: "Project does not exist",
        errorCode: ResponseErrorCodes.projectNotFound,
      } as ProjectResponseMessage);

      logger(validData?.correlationKey).info(
        `Project does not exist, skipping update:`,
        data
      );
      return;
    }

    const result = await projectCollection.doc(validData?.id).update(data);

    await publishMessage(PublisherTopics.projectUpdated, {
      correlationKey: validData?.correlationKey,
      id: validData?.id,
      status: true,
      message: "Project updated successfully",
    } as ProjectResponseMessage);

    logger(validData?.correlationKey).info(
      `Project updated message handled successfully:`,
      result as any
    );
  } catch (error) {
    await publishMessage(PublisherTopics.projectUpdated, {
      correlationKey: validData?.correlationKey,
      id: validData?.id,
      status: false,
      message: "Error updating project",
      errorCode: ResponseErrorCodes.unknownError,
    } as ProjectResponseMessage);

    logger(validData?.correlationKey).error(
      "Error handling project updated message:",
      error as any
    );
  }
};

const handleProjectDeleted = async (data: ProjectDeletedRequestMessage) => {
  // Handle project created message
  logger(data?.correlationKey).info("Handling project deleted message");
  logger(data?.correlationKey).info(data as any);

  const validation = projectDeletedSchema.safeParse(data);
  if (!validation.success) {
    await publishMessage(PublisherTopics.projectCreated, {
      correlationKey: data?.correlationKey,
      id: data?.id,
      status: false,
      message: "Invalid project data",
      errorCode: ResponseErrorCodes.invalidMessageData,
    } as ProjectResponseMessage);
    logger(data?.correlationKey).error(
      "Invalid project data:",
      validation.error.format()
    );
    return;
  }
  const validData = validation.data;

  try {
    const ref = projectCollection.doc(validData?.id);
    const existingProject = await ref.get();

    if (!existingProject.exists) {
      await publishMessage(PublisherTopics.projectDeleted, {
        correlationKey: validData?.correlationKey,
        id: validData?.id,
        status: false,
        message: "Project does not exist",
        errorCode: ResponseErrorCodes.projectNotFound,
      } as ProjectResponseMessage);

      logger(validData?.correlationKey).info(
        `Project does not exist, skipping deletion:`,
        data
      );
      return;
    }

    const result = await projectCollection.doc(validData?.id).delete();

    await publishMessage(PublisherTopics.projectDeleted, {
      correlationKey: validData?.correlationKey,
      id: validData?.id,
      status: true,
      message: "Project deleted successfully",
    } as ProjectResponseMessage);

    logger(validData?.correlationKey).info(
      `Project deleted message handled successfully:`,
      result as any
    );
  } catch (error) {
    await publishMessage(PublisherTopics.projectDeleted, {
      correlationKey: validData?.correlationKey,
      id: validData?.id,
      status: false,
      message: "Error deleting project",
      errorCode: ResponseErrorCodes.unknownError,
    } as ProjectResponseMessage);
    logger(validData?.correlationKey).error(
      "Error handling project deleted message:",
      error as any
    );
  }
};

export { handleProjectCreated, handleProjectUpdated, handleProjectDeleted };