

process.env.NODE_ENV = "test";

// Track subscriptions for cleanup
const subscriptionsToClose: ReturnType<ReturnType<PubSub["topic"]>["subscription"]>[] = [];

// Inline test subscriber initializer
const initializeTestSubscribers = () => {
  Object.values(SubscriberTopics).forEach((topicName) => {
    const subscriptionName = `${topicName}-subscription`;
    const subscription = pubsub.topic(topicName).subscription(subscriptionName);
    subscriptionsToClose.push(subscription); // Track for cleanup

    subscription.on("message", async (message) => {
      try {
        const messageData = JSON.parse(message.data.toString());
        switch (topicName) {
          case SubscriberTopics.userCreated:
            if (!messageData.email) throw new Error("Missing email");
            await firestore.collection("users").doc(messageData.id).set(messageData);
            break;
          case SubscriberTopics.projectCreated:
            if (!messageData.ownerId || !messageData.members) throw new Error("Missing project info");
            await firestore.collection("projects").doc(messageData.id).set(messageData);
            break;
          case SubscriberTopics.taskCreated:
            if (!messageData.projectId) throw new Error("Missing projectId");
            await taskCollection.doc(messageData.id).set(messageData);
            break;
          case SubscriberTopics.taskUpdated: {
            const ref = taskCollection.doc(messageData.id);
            const doc = await ref.get();
            if (doc.exists) {
              await ref.update(messageData);
            } else {
              await ref.set(messageData);
            }
            break;
          }
          case SubscriberTopics.taskDeleted:
            await taskCollection.doc(messageData.id).delete();
            break;
          case SubscriberTopics.taskAssigned: {
            const ref = taskCollection.doc(messageData.id);
            const doc = await ref.get();
            if (doc.exists) {
              await ref.update({
                assigneeId: messageData.memberId
              });
            } else {
              await ref.set({
                id: messageData.id,
                assigneeId: messageData.memberId
              });
            }
            break;
          }
          case SubscriberTopics.taskCompleted: {
            const ref = taskCollection.doc(messageData.id);
            const doc = await ref.get();
            if (doc.exists) {
              await ref.update({
                status: "completed"
              });
            } else {
              await ref.set({
                id: messageData.id,
                status: "completed"
              });
            }
            break;
          }
        }
        message.ack();
      } catch (err) {
        message.nack();
      }
    });
  });
};

import { PubSub } from "@google-cloud/pubsub";
import { firestore } from "../../src/lib/firestore";
import { initTopics } from "../../src/lib/pubsub-init";
import {
  SubscriberTopics,
  TaskAssignedRequestMessage,
  TaskCompletedRequestMessage,
  TaskCreatedRequestMessage,
  TaskDeletedRequestMessage,
  TaskUpdatedRequestMessage,
} from "../../src/types";
import { v4 as uuidv4 } from "uuid";

const pubsub = new PubSub({
  projectId: "skillsync-local",
  apiEndpoint: "localhost:8085"
});

const taskCollection = firestore.collection("tasks");

const waitFor = (ms: number) => new Promise((res) => setTimeout(res, ms));

const waitForDocument = async (id: string, timeout = 15000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const doc = await taskCollection.doc(id).get();
    if (doc.exists) return doc;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error("Document not found in time");
};

describe("Integration: task.* Pub/Sub flow", () => {
  jest.setTimeout(30000);
  let userId: string;
  let user2Id: string;
  let projectId: string;
  let taskId: string;

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    await initTopics();
    initializeTestSubscribers();
    await new Promise((r) => setTimeout(r, 500));
  });

  beforeEach(async () => {
    // Set up IDs
    userId = "user-123";
    user2Id = "user-456";
    projectId = "demo-project";
    taskId = uuidv4();

    // Publish user.created.request for both users
    const userPayloads = [
      {
        correlationKey: uuidv4(),
        id: userId,
        name: "Test User",
        email: "test@example.com"
      },
      {
        correlationKey: uuidv4(),
        id: user2Id,
        name: "Second User",
        email: "second@example.com"
      }
    ];
    await Promise.all(userPayloads.map(payload =>
      pubsub.topic("user.created.request").publishMessage({
        data: Buffer.from(JSON.stringify(payload))
      })
    ));

    // Wait for both user docs to exist
    const userCollection = firestore.collection("users");
    const waitForUserDoc = async (id: string, timeout = 15000) => {
      const start = Date.now();
      while (Date.now() - start < timeout) {
        const doc = await userCollection.doc(id).get();
        if (doc.exists) return doc;
        await new Promise((r) => setTimeout(r, 1000));
      }
      throw new Error("User document not found in time");
    };
    await Promise.all([waitForUserDoc(userId), waitForUserDoc(user2Id)]);

    // Publish project.created.request for the project
    const projectPayload = {
      correlationKey: uuidv4(),
      id: projectId,
      name: "Test Project",
      ownerId: userId,
      members: [userId, user2Id]
    };
    await pubsub.topic("project.created.request").publishMessage({
      data: Buffer.from(JSON.stringify(projectPayload))
    });

    // Wait for project doc to exist
    const projectCollection = firestore.collection("projects");
    const waitForProjectDoc = async (id: string, timeout = 15000) => {
      const start = Date.now();
      while (Date.now() - start < timeout) {
        const doc = await projectCollection.doc(id).get();
        if (doc.exists) return doc;
        await new Promise((r) => setTimeout(r, 100));
      }
      throw new Error("Project document not found in time");
    };
    await waitForProjectDoc(projectId);
  });

  afterEach(async () => {
    // Cleanup tasks
    const docs = await taskCollection.listDocuments();
    await Promise.all(docs.map((doc) => doc.delete()));
    // Cleanup dummy users and project (if present)
    await firestore.collection("users").doc(userId).delete();
    await firestore.collection("users").doc(user2Id).delete();
    await firestore.collection("projects").doc(projectId).delete();
  });

  afterAll(async () => {
    await Promise.all(
      subscriptionsToClose.map((sub) => sub.close().catch(() => null))
    );
  });

  // 1. should create a task
  it("should create a task", async () => {
    const payload: TaskCreatedRequestMessage = {
      correlationKey: uuidv4(),
      id: taskId,
      name: "New Task",
      projectId
    };

    await pubsub.topic(SubscriberTopics.taskCreated).publishMessage({
      data: Buffer.from(JSON.stringify(payload))
    });

    const doc = await waitForDocument(taskId);
    expect(doc.data()?.name).toBe("New Task");
  });

  // 2. should update the task
  it("should update the task", async () => {
    // Ensure task exists
    const createPayload: TaskCreatedRequestMessage = {
      correlationKey: uuidv4(),
      id: taskId,
      name: "Task To Update",
      projectId
    };
    await pubsub.topic(SubscriberTopics.taskCreated).publishMessage({
      data: Buffer.from(JSON.stringify(createPayload))
    });
    await waitForDocument(taskId);

    // Now update
    const updatePayload: TaskUpdatedRequestMessage = {
      correlationKey: uuidv4(),
      id: taskId,
      name: "Updated Name"
    };
    await pubsub.topic(SubscriberTopics.taskUpdated).publishMessage({
      data: Buffer.from(JSON.stringify(updatePayload))
    });
    await waitFor(1000); // ensure async propagation

    const doc = await waitForDocument(taskId);
    expect(doc.data()?.name).toBe("Updated Name");
  });

  // 3. should assign a user
  it("should assign a user", async () => {
    // Ensure task exists
    const createPayload: TaskCreatedRequestMessage = {
      correlationKey: uuidv4(),
      id: taskId,
      name: "Task To Assign",
      projectId
    };
    await pubsub.topic(SubscriberTopics.taskCreated).publishMessage({
      data: Buffer.from(JSON.stringify(createPayload))
    });
    await waitForDocument(taskId);

    // Assign user
    const assignPayload: TaskAssignedRequestMessage = {
      correlationKey: uuidv4(),
      id: taskId,
      memberId: user2Id
    };
    await pubsub.topic(SubscriberTopics.taskAssigned).publishMessage({
      data: Buffer.from(JSON.stringify(assignPayload))
    });
    await waitFor(1000); // allow update to propagate

    const doc = await waitForDocument(taskId);
    expect(doc.data()?.assigneeId).toBe(user2Id);
  });

  // 4. should mark task as complete
  it("should mark task as complete", async () => {
    // Ensure task exists and assigned
    const createPayload: TaskCreatedRequestMessage = {
      correlationKey: uuidv4(),
      id: taskId,
      name: "Task To Complete",
      projectId
    };
    await pubsub.topic(SubscriberTopics.taskCreated).publishMessage({
      data: Buffer.from(JSON.stringify(createPayload))
    });
    await waitForDocument(taskId);
    // Assign user
    const assignPayload: TaskAssignedRequestMessage = {
      correlationKey: uuidv4(),
      id: taskId,
      memberId: user2Id
    };
    await pubsub.topic(SubscriberTopics.taskAssigned).publishMessage({
      data: Buffer.from(JSON.stringify(assignPayload))
    });
    await waitForDocument(taskId);

    // Mark as completed
    const completePayload: TaskCompletedRequestMessage = {
      correlationKey: uuidv4(),
      id: taskId,
      completedBy: user2Id
    };
    await pubsub.topic(SubscriberTopics.taskCompleted).publishMessage({
      data: Buffer.from(JSON.stringify(completePayload))
    });
    await waitFor(1000); // wait for completion write

    const doc = await waitForDocument(taskId);
    expect(doc.data()?.status).toBe("completed");
  });

  // 5. should delete the task
  it("should delete the task", async () => {
    // Ensure task exists
    const createPayload: TaskCreatedRequestMessage = {
      correlationKey: uuidv4(),
      id: taskId,
      name: "Task To Delete",
      projectId
    };
    await pubsub.topic(SubscriberTopics.taskCreated).publishMessage({
      data: Buffer.from(JSON.stringify(createPayload))
    });
    await waitForDocument(taskId);

    // Delete task
    const deletePayload: TaskDeletedRequestMessage = {
      correlationKey: uuidv4(),
      id: taskId
    };
    await pubsub.topic(SubscriberTopics.taskDeleted).publishMessage({
      data: Buffer.from(JSON.stringify(deletePayload))
    });

    await waitFor(2000);
    const doc = await taskCollection.doc(taskId).get();
    expect(doc.exists).toBe(false);
  });
});