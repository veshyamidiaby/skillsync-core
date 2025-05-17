import { firestore } from "../lib/firestore";
import { logger } from "../lib/logger";
import { publishMessage } from "../pubsub";
import {
  TaskAssignedRequestMessage,
  TaskCompletedRequestMessage,
  TaskCreatedRequestMessage,
  TaskDeletedRequestMessage,
  TaskUpdatedRequestMessage,
  TaskStatuses,
  PublisherTopics,
  TaskResponseMessage,
  ResponseErrorCodes,
  TaskCompletedResponseMessage,
} from "../types";
import {
  taskCreatedSchema,
  taskDeletedSchema,
  taskUpdatedSchema,
  taskAssignedSchema,
  taskCompletedSchema
} from "../validators";

const taskCollection = firestore.collection("tasks");
const porjectCollection = firestore.collection("projects");

const handleTaskCreated = async (data: TaskCreatedRequestMessage) => {
  // Handle task created message
  logger(data?.correlationKey).info("Handling task created message");
  logger(data?.correlationKey).info(data as any);

  const validation = taskCreatedSchema.safeParse(data);
  if (!validation.success) {
    await publishMessage(PublisherTopics.taskCreated, {
      correlationKey: data?.correlationKey,
      id: data?.id,
      status: false,
      message: "Invalid task data",
      errorCode: ResponseErrorCodes.invalidMessageData
    } as TaskResponseMessage);
    logger(data?.correlationKey).error(
      "Invalid task data:",
      validation.error.format()
    );
    return;
  }
  const validData = validation.data;

  try {
    const ref = taskCollection.doc(validData?.id);
    const existingTask = await ref.get();

    if (existingTask.exists) {
      await publishMessage(PublisherTopics.taskCreated, {
        correlationKey: validData?.correlationKey,
        id: validData?.id,
        status: false,
        message: "Task already exists",
        errorCode: ResponseErrorCodes.taskAlreadyExists
      } as TaskResponseMessage);

      logger(validData?.correlationKey).info(
        `Task already exists:`,
        data
      );
      return;
    }

    const result = await taskCollection.doc(validData?.id).set(data);

    await publishMessage(PublisherTopics.taskCreated, {
      correlationKey: validData?.correlationKey,
      id: validData?.id,
      status: true,
      message: "Task created successfully",
    } as TaskResponseMessage);

    logger(validData?.correlationKey).info(
      `Task created message handled successfully:`,
      result as any
    );
  } catch (error) {
    await publishMessage(PublisherTopics.taskCreated, {
      correlationKey: validData?.correlationKey,
      id: validData?.id,
      status: false,
      message: "Error creating task",
      errorCode: ResponseErrorCodes.unknownError
    } as TaskResponseMessage);

    logger(validData?.correlationKey).error(
      "Error handling task created message:",
      error as any
    );
  }
};

const handleTaskUpdated = async (data: TaskUpdatedRequestMessage) => {
  // Handle task created message
  logger(data?.correlationKey).info("Handling task updated message");
  logger(data?.correlationKey).info(data as any);

  const validation = taskUpdatedSchema.safeParse(data);
  if (!validation.success) {
    await publishMessage(PublisherTopics.taskCreated, {
      correlationKey: data?.correlationKey,
      id: data?.id,
      status: false,
      message: "Invalid task data",
      errorCode: ResponseErrorCodes.invalidMessageData
    } as TaskResponseMessage);
    logger(data?.correlationKey).error(
      "Invalid task data:",
      validation.error.format()
    );
    return;
  }
  const validData = validation.data;

  try {
    const ref = taskCollection.doc(validData?.id);
    const existingTask = await ref.get();

    if (!existingTask.exists) {
      await publishMessage(PublisherTopics.taskUpdated, {
        correlationKey: validData?.correlationKey,
        id: validData?.id,
        status: false,
        message: "Task does not exist",
        errorCode: ResponseErrorCodes.taskNotFound
      } as TaskResponseMessage);

      logger(validData?.correlationKey).info(
        `Task does not exist, skipping update:`,
        data
      );
      return;
    }

    const result = await taskCollection.doc(validData?.id).update(data);

    await publishMessage(PublisherTopics.taskUpdated, {
      correlationKey: validData?.correlationKey,
      id: validData?.id,
      status: true,
      message: "Task updated successfully",
    } as TaskResponseMessage);
    
    logger(validData?.correlationKey).info(
      `Task updated message handled successfully:`,
      result as any
    );
  } catch (error) {
    await publishMessage(PublisherTopics.taskUpdated, {
      correlationKey: validData?.correlationKey,
      id: validData?.id,
      status: false,
      message: "Error updating task",
      errorCode: ResponseErrorCodes.unknownError
    } as TaskResponseMessage);

    logger(validData?.correlationKey).error(
      "Error handling task updated message:",
      error as any
    );
  }
};

const handleTaskDeleted = async (data: TaskDeletedRequestMessage) => {
  // Handle task created message
  logger(data?.correlationKey).info("Handling task deleted message");
  logger(data?.correlationKey).info(data as any);

  const validation = taskDeletedSchema.safeParse(data);
  if (!validation.success) {
    await publishMessage(PublisherTopics.taskCreated, {
      correlationKey: data?.correlationKey,
      id: data?.id,
      status: false,
      message: "Invalid task data",
      errorCode: ResponseErrorCodes.invalidMessageData
    } as TaskResponseMessage);
    logger(data?.correlationKey).error(
      "Invalid task data:",
      validation.error.format()
    );
    return;
  }
  const validData = validation.data;

  try {
    const ref = taskCollection.doc(validData?.id);
    const existingTask = await ref.get();

    if (!existingTask.exists) {
      await publishMessage(PublisherTopics.taskDeleted, {
        correlationKey: validData?.correlationKey,
        id: validData?.id,
        status: false,
        message: "Task does not exist",
        errorCode: ResponseErrorCodes.taskNotFound
      } as TaskResponseMessage);

      logger(validData?.correlationKey).info(
        `Task does not exist, skipping deletion:`,
        data
      );
      return;
    }

    const result = await taskCollection.doc(validData?.id).delete();

    await publishMessage(PublisherTopics.taskDeleted, {
      correlationKey: validData?.correlationKey,
      id: validData?.id,
      status: true,
      message: "Task deleted successfully",
    } as TaskResponseMessage);

    logger(validData?.correlationKey).info(
      `Task deleted message handled successfully:`,
      result as any
    );
  } catch (error) {
    await publishMessage(PublisherTopics.taskDeleted, {
      correlationKey: validData?.correlationKey,
      id: validData?.id,
      status: false,
      message: "Error deleting task",
      errorCode: ResponseErrorCodes.unknownError
    } as TaskResponseMessage);

    logger(validData?.correlationKey).error(
      "Error handling task deleted message:",
      error as any
    );
  }
};

const handleTaskAssigned = async (data: TaskAssignedRequestMessage) => {
  // Handle task assigned message
  logger(data?.correlationKey).info("Handling task assigned message");
  logger(data?.correlationKey).info(data as any);

  const validation = taskAssignedSchema.safeParse(data);
  if (!validation.success) {
    await publishMessage(PublisherTopics.taskCreated, {
      correlationKey: data?.correlationKey,
      id: data?.id,
      status: false,
      message: "Invalid task data",
      errorCode: ResponseErrorCodes.invalidMessageData
    } as TaskResponseMessage);
    logger(data?.correlationKey).error(
      "Invalid task data:",
      validation.error.format()
    );
    return;
  }
  const validData = validation.data;

  try {
    const ref = taskCollection.doc(validData?.id);
    const existingTask = await ref.get();

    if (!existingTask.exists) {
      await publishMessage(PublisherTopics.taskAssigned, {
        correlationKey: validData?.correlationKey,
        id: validData?.id,
        status: false,
        message: "Task does not exist",
        errorCode: ResponseErrorCodes.taskNotFound
      } as TaskResponseMessage);

      logger(validData?.correlationKey).info(
        `Task does not exist, skipping assignment:`,
        data
      );
      return;
    }
    if (
      existingTask.data()?.status === TaskStatuses.completed ||
      existingTask.data()?.status === TaskStatuses.archived ||
      existingTask.data()?.status === TaskStatuses.cancelled
    ) {
      await publishMessage(PublisherTopics.taskAssigned, {
        correlationKey: validData?.correlationKey,
        id: validData?.id,
        status: false,
        message: "Task not in progress",
        errorCode: ResponseErrorCodes.taskNotPending
      } as TaskResponseMessage);

      logger(validData?.correlationKey).info(
        `Task not in progress, skipping completion:`,
        data
      );
      return;
    }

    const projectRef = porjectCollection.doc(
      existingTask.data()?.projectId
    );
    const existingProject = await projectRef.get();
    if (!existingProject.exists) {
      await publishMessage(PublisherTopics.taskAssigned, {
        correlationKey: validData?.correlationKey,
        id: validData?.id,
        status: false,
        message: "Project does not exist",
        errorCode: ResponseErrorCodes.projectNotFound
      } as TaskResponseMessage);
      logger(validData?.correlationKey).info(
        `Project does not exist, skipping assignment:`,
        data
      );
      return;
    }

    const assignedUser = existingProject.data()?.members.find(
      (memberId: string) => memberId === validData?.memberId
    );
    if (!assignedUser) {
      await publishMessage(PublisherTopics.taskAssigned, {
        correlationKey: validData?.correlationKey,
        id: validData?.id,
        status: false,
        message: "User is not a member of the project",
        errorCode: ResponseErrorCodes.userNotInProject
      } as TaskResponseMessage);
      logger(validData?.correlationKey).info(
        `User is not a member of the project, skipping assignment:`,
        data
      );
      return;
    }

    const result = await taskCollection.doc(validData?.id).update({
      taskMembers: [...existingTask.data()?.taskMembers, validData?.memberId],
    });

    await publishMessage(PublisherTopics.taskAssigned, {
      correlationKey: validData?.correlationKey,
      id: validData?.id,
      status: true,
      message: "Task assigned successfully",
      data: {
        taskMembers: [...existingTask.data()?.taskMembers, validData?.memberId],
      }
    } as TaskResponseMessage);

    logger(validData?.correlationKey).info(
      `Task assigned message handled successfully:`,
      result as any
    );
  } catch (error) {
    await publishMessage(PublisherTopics.taskAssigned, {
      correlationKey: validData?.correlationKey,
      id: validData?.id,
      status: false,
      message: "Error assigning task",
      errorCode: ResponseErrorCodes.unknownError
    } as TaskResponseMessage);

    logger(validData?.correlationKey).error(
      "Error handling task assigned message:",
      error as any
    );
  }
};

const handleTaskCompleted = async (data: TaskCompletedRequestMessage) => {
  // Handle task completed message
  logger(data?.correlationKey).info("Handling task completed message");
  logger(data?.correlationKey).info(data as any);

  const validation = taskCompletedSchema.safeParse(data);
  if (!validation.success) {
    await publishMessage(PublisherTopics.taskCreated, {
      correlationKey: data?.correlationKey,
      id: data?.id,
      status: false,
      message: "Invalid task data",
      errorCode: ResponseErrorCodes.invalidMessageData
    } as TaskResponseMessage);
    logger(data?.correlationKey).error(
      "Invalid task data:",
      validation.error.format()
    );
    return;
  }
  const validData = validation.data;

  try {
    const ref = taskCollection.doc(validData?.id);
    const existingTask = await ref.get();

    if (!existingTask.exists) {
      await publishMessage(PublisherTopics.taskCompleted, {
        correlationKey: validData?.correlationKey,
        id: validData?.id,
        status: false,
        message: "Task does not exist",
        errorCode: ResponseErrorCodes.taskNotFound
      } as TaskResponseMessage);

      logger(validData?.correlationKey).info(
        `Task does not exist, skipping completion:`,
        data
      );
      return;
    }
    if (
      existingTask.data()?.status === TaskStatuses.completed ||
      existingTask.data()?.status === TaskStatuses.archived ||
      existingTask.data()?.status === TaskStatuses.cancelled
    ) {
      await publishMessage(PublisherTopics.taskCompleted, {
        correlationKey: validData?.correlationKey,
        id: validData?.id,
        status: false,
        message: "Task not in progress",
        errorCode: ResponseErrorCodes.taskNotPending
      } as TaskResponseMessage);

      logger(validData?.correlationKey).info(
        `Task not in progress, skipping completion:`,
        data
      );
      return;
    }

    const completingUser = existingTask.data()?.taskMembers.find(
      (memberId: string) => memberId === validData?.completedBy
    );
    if (!completingUser) {
      await publishMessage(PublisherTopics.taskCompleted, {
        correlationKey: validData?.correlationKey,
        id: validData?.id,
        status: false,
        message: "User is not a member of the task",
        errorCode: ResponseErrorCodes.taskMemberNotFound
      } as TaskResponseMessage);
      logger(validData?.correlationKey).info(
        `User is not a member of the task, skipping completion:`,
        data
      );
      return;
    }

    const result = await taskCollection.doc(validData?.id).update({
      status: TaskStatuses.completed,
      completedBy: validData?.completedBy,
      completeAt: new Date().toISOString()
    });

    await publishMessage(PublisherTopics.taskCompleted, {
      correlationKey: validData?.correlationKey,
      id: validData?.id,
      status: true,
      message: "Task completed successfully",
      data: {
        completedBy: validData?.completedBy,
        status: TaskStatuses.completed,
      }
    } as TaskCompletedResponseMessage);

    logger(validData?.correlationKey).info(
      `Task completed message handled successfully:`,
      result as any
    );
  } catch (error) {
    await publishMessage(PublisherTopics.taskCompleted, {
      correlationKey: validData?.correlationKey,
      id: validData?.id,
      status: false,
      message: "Error completing task",
      errorCode: ResponseErrorCodes.unknownError
    } as TaskResponseMessage);

    logger(validData?.correlationKey).error(
      "Error handling task completed message:",
      error as any
    );
  }
};

export {
  handleTaskCreated,
  handleTaskUpdated,
  handleTaskDeleted,
  handleTaskAssigned,
  handleTaskCompleted
};