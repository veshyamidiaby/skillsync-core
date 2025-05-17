import { firestore } from "../lib/firestore";
import { logger } from "../lib/logger";
import { publishMessage } from "../pubsub";
import {
  UserCreatedRequestMessage,
  UserDeletedRequestMessage,
  UserUpdatedRequestMessage,
  PublisherTopics,
  UserResponseMessage,
  ResponseErrorCodes,
} from "../types";
import { userCreatedSchema, userDeletedSchema, userUpdatedSchema } from "../validators";

const userCollection = firestore.collection("users");

const handleUserCreated = async (data: UserCreatedRequestMessage) => {
  // Handle user created message
  logger(data?.correlationKey).info("Handling user created message");
  logger(data?.correlationKey).info(data as any);

  const validation = userCreatedSchema.safeParse(data);

  if (!validation.success) {
    await publishMessage(PublisherTopics.userCreated, {
      correlationKey: data?.correlationKey,
      id: data?.id,
      status: false,
      message: "Invalid user data",
      errorCode: ResponseErrorCodes.invalidMessageData
    } as UserResponseMessage);

    logger(data?.correlationKey).error(
      "Invalid user data:",
      validation.error.format()
    );
    return;
  }
  const validData = validation.data;

  try {
    const ref = userCollection.doc(validData?.id);
    const existingUser = await ref.get();

    if (existingUser.exists) {
      await publishMessage(PublisherTopics.userCreated, {
        correlationKey: validData?.correlationKey,
        id: validData?.id,
        status: false,
        message: "User already exists",
        errorCode: ResponseErrorCodes.userAlreadyExists
      } as UserResponseMessage);

      logger(validData?.correlationKey).info(
        `User already exists:`,
        data
      );
      return;
    }

    const result = await userCollection.doc(validData?.id).set(data);

    await publishMessage(PublisherTopics.userCreated, {
      correlationKey: validData?.correlationKey,
      id: validData?.id,
      status: true,
      message: "User created successfully",
    } as UserResponseMessage);

    logger(validData?.correlationKey).info(
      `User created message handled successfully:`,
      result as any
    );
  } catch (error) {
    await publishMessage(PublisherTopics.userCreated, {
      correlationKey: validData?.correlationKey,
      id: validData?.id,
      status: false,
      message: "Error creating user",
      errorCode: ResponseErrorCodes.unknownError
    } as UserResponseMessage);

    logger(validData?.correlationKey).error(
      "Error handling user created message:",
      error as any
    );
  }
};

const handleUserDeleted = async (data: UserDeletedRequestMessage) => {
  // Handle user created message
  logger(data?.correlationKey).info("Handling user deleted message");
  logger(data?.correlationKey).info(data as any);

  const validation = userDeletedSchema.safeParse(data);
  if (!validation.success) {
    await publishMessage(PublisherTopics.userDeleted, {
      correlationKey: data?.correlationKey,
      id: data?.id,
      status: false,
      message: "Invalid user data",
      errorCode: ResponseErrorCodes.invalidMessageData
    } as UserResponseMessage);
    logger(data?.correlationKey).error(
      "Invalid user data:",
      validation.error.format()
    );
    return;
  }
  const validData = validation.data;

  try {
    const ref = userCollection.doc(validData?.id);
    const existingUser = await ref.get();

    if (!existingUser.exists) {
      await publishMessage(PublisherTopics.userDeleted, {
        correlationKey: validData?.correlationKey,
        id: validData?.id,
        status: false,
        message: "User does not exists",
        errorCode: ResponseErrorCodes.userNotFound
      } as UserResponseMessage);

      logger(validData?.correlationKey).info(
        `User does not exist, skipping deletion:`,
        data
      );
      return;
    }

    const result = await userCollection.doc(validData?.id).delete();

    await publishMessage(PublisherTopics.userDeleted, {
      correlationKey: validData?.correlationKey,
      id: validData?.id,
      status: true,
      message: "User deleted successfully",
    } as UserResponseMessage);

    logger(validData?.correlationKey).info(
      `User deleted message handled successfully:`,
      result as any
    );
  } catch (error) {
    await publishMessage(PublisherTopics.userDeleted, {
      correlationKey: validData?.correlationKey,
      id: validData?.id,
      status: false,
      message: "Error deleting user",
      errorCode: ResponseErrorCodes.unknownError
    } as UserResponseMessage);

    logger(validData?.correlationKey).error(
      "Error handling user deleted message:",
      error as any
    );
  }
};

const handleUserUpdated = async (data: UserUpdatedRequestMessage) => {
  // Handle user created message
  logger(data?.correlationKey).info("Handling user updated message");
  logger(data?.correlationKey).info(data as any);

  const validation = userUpdatedSchema.safeParse(data);
  if (!validation.success) {
    await publishMessage(PublisherTopics.userUpdated, {
      correlationKey: data?.correlationKey,
      id: data?.id,
      status: false,
      message: "Invalid user data",
      errorCode: ResponseErrorCodes.invalidMessageData
    } as UserResponseMessage);
    logger(data?.correlationKey).error(
      "Invalid user data:",
      validation.error.format()
    );
    return;
  }
  const validData = validation.data;

  try {
    const ref = userCollection.doc(validData?.id);
    const existingUser = await ref.get();

    if (!existingUser.exists) {
      await publishMessage(PublisherTopics.userUpdated, {
        correlationKey: validData?.correlationKey,
        id: validData?.id,
        status: false,
        message: "User does not exists",
        errorCode: ResponseErrorCodes.userNotFound
      } as UserResponseMessage);
      
      logger(validData?.correlationKey).info(
        `User does not exist, skipping update:`,
        data
      );
      throw new Error("User does not exist");
    }

    const result = await userCollection.doc(validData?.id).update(data);

    await publishMessage(PublisherTopics.userUpdated, {
      correlationKey: validData?.correlationKey,
      id: validData?.id,
      status: true,
      message: "User updated successfully",
    } as UserResponseMessage);

    logger(validData?.correlationKey).info(
      `User updated message handled successfully:`,
      result as any
    );
  } catch (error) {
    await publishMessage(PublisherTopics.userUpdated, {
      correlationKey: validData?.correlationKey,
      id: validData?.id,
      status: false,
      message: "Error updating user",
      errorCode: ResponseErrorCodes.unknownError
    } as UserResponseMessage);

    logger(validData?.correlationKey).error(
      "Error handling user updated message:",
      error as any
    );
  }
};

export { handleUserCreated, handleUserDeleted, handleUserUpdated };