import { PublisherTopics } from "./publisher-types";
import { SubscriberMessages, SubscriberTopics } from "./subscriber-types";

type CorrelationKey = string;

enum TaskStatuses {
  created = "created",
  inProgress = "in-progress",
  completed = "completed",
  archived = "archived",
  cancelled = "cancelled",
}

type TaskStatus = `${TaskStatuses}`;

type UserRecord = {
  id: string;
  email: string;
  name?: string;
};

type ProjectRecord = {
  id: string;
  name: string;
  description?: string;
};

type TaskRecord = {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  taskMembers?: string[];
  dueDate?: string;
  status?: TaskStatus;
};

interface ResponseTopics {
  [SubscriberTopics.userCreated]: PublisherTopics.userCreated;
  [SubscriberTopics.userUpdated]: PublisherTopics.userUpdated;
  [SubscriberTopics.userDeleted]: PublisherTopics.userDeleted;
  [SubscriberTopics.projectCreated]: PublisherTopics.projectCreated;
  [SubscriberTopics.projectUpdated]: PublisherTopics.projectUpdated;
  [SubscriberTopics.projectDeleted]: PublisherTopics.projectDeleted;
  [SubscriberTopics.taskCreated]: PublisherTopics.taskCreated;
  [SubscriberTopics.taskUpdated]: PublisherTopics.taskUpdated;
  [SubscriberTopics.taskDeleted]: PublisherTopics.taskDeleted;
  [SubscriberTopics.taskAssigned]: PublisherTopics.taskAssigned;
  [SubscriberTopics.taskCompleted]: PublisherTopics.taskCompleted;
}

type SubscriberEvent<T extends keyof SubscriberMessages> = {
  topic: T;
  data: SubscriberMessages[T];
};

export {
  UserRecord,
  ProjectRecord,
  TaskRecord,
  CorrelationKey,
  SubscriberEvent,
  TaskStatuses,
  TaskStatus,
  ResponseTopics,
};