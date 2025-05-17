import { CorrelationKey, TaskStatus } from "./pubsub-types";

enum SubscriberTopics {
  userCreated = "user.created.request",
  userUpdated = "user.updated.request",
  userDeleted = "user.deleted.request",
  projectCreated = "project.created.request",
  projectUpdated = "project.updated.request",
  projectDeleted = "project.deleted.request",
  taskCreated = "task.created.request",
  taskUpdated = "task.updated.request",
  taskDeleted = "task.deleted.request",
  taskAssigned = "task.assigned.request",
  taskCompleted = "task.completed.request",
}
type SubscriberTopic = `${SubscriberTopics}`;

type UserCreatedRequestMessage = {
  correlationKey: CorrelationKey;
  id: string;
  email: string;
  name?: string;
};

type UserUpdatedRequestMessage = {
  correlationKey: CorrelationKey;
  id: string;
  email?: string;
  name?: string;
};

type UserDeletedRequestMessage = {
  correlationKey: CorrelationKey;
  id: string;
};

type ProjectCreatedRequestMessage = {
  correlationKey: CorrelationKey;
  id: string;
  name: string;
  description?: string;
};

type ProjectUpdatedRequestMessage = {
  correlationKey: CorrelationKey;
  id: string;
  name?: string;
  description?: string;
};

type ProjectDeletedRequestMessage = {
  correlationKey: CorrelationKey;
  id: string;
};

type TaskCreatedRequestMessage = {
  correlationKey: CorrelationKey;
  id: string;
  projectId: string;
  name: string;
  description?: string;
  taskMembers?: string[];
  dueDate?: string;
  status?: TaskStatus;
};

type TaskUpdatedRequestMessage = {
  correlationKey: CorrelationKey;
  id: string;
  name?: string;
  description?: string;
  dueDate?: string;
  status?: TaskStatus;
};

type TaskDeletedRequestMessage = {
  correlationKey: CorrelationKey;
  id: string;
};

type TaskAssignedRequestMessage = {
  correlationKey: CorrelationKey;
  id: string;
  memberId: string;
};

type TaskCompletedRequestMessage = {
  correlationKey: CorrelationKey;
  id: string;
  completedBy: string;
};

type SubscriberMessage =
  UserCreatedRequestMessage |
  UserUpdatedRequestMessage |
  UserDeletedRequestMessage |
  ProjectCreatedRequestMessage |
  ProjectUpdatedRequestMessage |
  ProjectDeletedRequestMessage |
  TaskCreatedRequestMessage |
  TaskUpdatedRequestMessage |
  TaskDeletedRequestMessage |
  TaskAssignedRequestMessage |
  TaskCompletedRequestMessage;

interface SubscriberMessages {
  [SubscriberTopics.userCreated]: UserCreatedRequestMessage;
  [SubscriberTopics.userUpdated]: UserUpdatedRequestMessage;
  [SubscriberTopics.userDeleted]: UserDeletedRequestMessage;
  [SubscriberTopics.projectCreated]: ProjectCreatedRequestMessage;
  [SubscriberTopics.projectUpdated]: ProjectUpdatedRequestMessage;
  [SubscriberTopics.projectDeleted]: ProjectDeletedRequestMessage;
  [SubscriberTopics.taskCreated]: TaskCreatedRequestMessage;
  [SubscriberTopics.taskUpdated]: TaskUpdatedRequestMessage;
  [SubscriberTopics.taskDeleted]: TaskDeletedRequestMessage;
  [SubscriberTopics.taskAssigned]: TaskAssignedRequestMessage;
  [SubscriberTopics.taskCompleted]: TaskCompletedRequestMessage;
}

export {
  UserCreatedRequestMessage,
  UserUpdatedRequestMessage,
  UserDeletedRequestMessage,
  ProjectCreatedRequestMessage,
  ProjectUpdatedRequestMessage,
  ProjectDeletedRequestMessage,
  TaskCreatedRequestMessage,
  TaskUpdatedRequestMessage,
  TaskDeletedRequestMessage,
  TaskAssignedRequestMessage,
  TaskCompletedRequestMessage,
  SubscriberTopic,
  SubscriberMessage,
  SubscriberMessages,
  SubscriberTopics
};