import { CorrelationKey } from "./pubsub-types";
import { UserCreatedRequestMessage } from "./subscriber-types";

enum PublisherTopics {
  userCreated = "user.created.response",
  userUpdated = "user.updated.response",
  userDeleted = "user.deleted.response",
  projectCreated = "project.created.response",
  projectUpdated = "project.updated.response",
  projectDeleted = "project.deleted.response",
  taskCreated = "task.created.response",
  taskUpdated = "task.updated.response",
  taskDeleted = "task.deleted.response",
  taskAssigned = "task.assigned.response",
  taskCompleted = "task.completed.response",
  userCreatedTest = "user.created.request"
}
type PublisherTopic = `${PublisherTopics}`;

enum ResponseErrorCodes {
  userNotFound = "user.not.found",
  userAlreadyExists = "user.already.exists",
  userNotInProject = "user.not.in.project",
  projectNotFound = "project.not.found",
  projectAlreadyExists = "project.already.exists",
  taskNotFound = "task.not.found",
  taskAlreadyExists = "task.already.exists",
  taskMemberNotFound = "task.member.not.found",
  taskNotPending = "task.not.pending",
  unknownError = "unknown.error",
  invalidMessageData = "invalid.message.data",
}

type ResponseErrorCode = `${ResponseErrorCodes}`;

type UserResponseMessage = {
  correlationKey: CorrelationKey;
  status: boolean;
  id: string;
  message: string;
  errorCode?: ResponseErrorCode;
};

type ProjectResponseMessage = {
  correlationKey: CorrelationKey;
  status: boolean;
  id: string;
  message: string;
  errorCode?: ResponseErrorCode;
};

type TaskResponseMessage = {
  correlationKey: CorrelationKey;
  status: boolean;
  id: string;
  message: string;
  errorCode?: ResponseErrorCode;
};

type TaskUpdatedResponseMessage = {
  correlationKey: CorrelationKey;
  status: boolean;
  id: string;
  message: string;
  data?: {
    description?: string;
    taskMembers?: string[];
    dueDate?: string;
    status?: string;
  };
  errorCode?: ResponseErrorCode;
};

type TaskAssignedResponseMessage = {
  correlationKey: CorrelationKey;
  status: boolean;
  id: string;
  message: string;
  data?: {
    taskMembers?: string[];
  };
  errorCode?: ResponseErrorCode;
};

type TaskCompletedResponseMessage = {
  correlationKey: CorrelationKey;
  status: boolean;
  id: string;
  message: string;
  data?: {
    completedBy?: string;
    status?: string;
  };
  errorCode?: ResponseErrorCode;
};

type PublisherMessage =
  UserResponseMessage |
  ProjectResponseMessage |
  TaskResponseMessage |
  TaskUpdatedResponseMessage |
  TaskAssignedResponseMessage |
  TaskCompletedResponseMessage |
  UserCreatedRequestMessage;

interface PublisherMessages {
  [PublisherTopics.userCreated]: UserResponseMessage;
  [PublisherTopics.userUpdated]: UserResponseMessage;
  [PublisherTopics.userDeleted]: UserResponseMessage;
  [PublisherTopics.projectCreated]: ProjectResponseMessage;
  [PublisherTopics.projectUpdated]: ProjectResponseMessage;
  [PublisherTopics.projectDeleted]: ProjectResponseMessage;
  [PublisherTopics.taskCreated]: TaskResponseMessage;
  [PublisherTopics.taskUpdated]: TaskUpdatedResponseMessage;
  [PublisherTopics.taskDeleted]: TaskResponseMessage;
  [PublisherTopics.taskAssigned]: TaskAssignedResponseMessage;
  [PublisherTopics.taskCompleted]: TaskCompletedResponseMessage;
}

export {
  PublisherTopics,
  PublisherTopic,
  UserResponseMessage,
  ProjectResponseMessage,
  TaskResponseMessage,
  TaskUpdatedResponseMessage,
  TaskAssignedResponseMessage,
  TaskCompletedResponseMessage,
  PublisherMessage,
  PublisherMessages,
  ResponseErrorCodes
};