

process.env.NODE_ENV = "test";

import { PubSub } from "@google-cloud/pubsub";
import { firestore } from "../../src/lib/firestore";
import { initTopics } from "../../src/lib/pubsub-init";
import {
  PublisherTopics,
  SubscriberTopics,
  ProjectCreatedRequestMessage,
  ProjectUpdatedRequestMessage,
  ProjectDeletedRequestMessage
} from "../../src/types";
import { v4 as uuidv4 } from "uuid";

const pubsub = new PubSub({
  projectId: "skillsync-local",
  apiEndpoint: "localhost:8085"
});

const projectCollection = firestore.collection("projects");

const waitFor = (ms: number) => new Promise((res) => setTimeout(res, ms));
const subscriptionsToClose: ReturnType<ReturnType<PubSub["topic"]>["subscription"]>[] = [];

const initializeTestSubscribers = () => {
  Object.values(SubscriberTopics).forEach((topicName) => {
    const subscriptionName = `${topicName}-subscription`;
    const subscription = pubsub.topic(topicName).subscription(subscriptionName);
    subscriptionsToClose.push(subscription);

    subscription.on("message", async (message) => {
      try {
        const messageData = JSON.parse(message.data.toString());

        if (topicName === SubscriberTopics.projectCreated) {
          if (!messageData.name) throw new Error("Missing name");
          const doc = await projectCollection.doc(messageData.id).get();
          if (doc.exists) throw new Error("Project already exists");
          await projectCollection.doc(messageData.id).set(messageData);
        }

        if (topicName === SubscriberTopics.projectUpdated) {
          if (!messageData.id) throw new Error("Missing id");
          const doc = await projectCollection.doc(messageData.id).get();
          if (!doc.exists) throw new Error("Project does not exist");
          await projectCollection.doc(messageData.id).update(messageData);
        }

        if (topicName === SubscriberTopics.projectDeleted) {
          if (!messageData.id) throw new Error("Missing id");
          await projectCollection.doc(messageData.id).delete();
        }

        message.ack();
      } catch (error) {
        message.nack();
      }
    });
  });
};

describe("Integration: project Pub/Sub flow", () => {
  beforeAll(async () => {
    await initTopics();
    initializeTestSubscribers();
  });

  afterEach(async () => {
    const docs = await projectCollection.listDocuments();
    await Promise.all(docs.map((doc) => doc.delete()));
  });

  afterAll(async () => {
    await Promise.all(subscriptionsToClose.map((sub) => sub.close().catch(() => null)));
  });

  it("should create a project and store it", async () => {
    const id = uuidv4();
    const payload: ProjectCreatedRequestMessage = {
      correlationKey: uuidv4(),
      id,
      name: "New Project",
      description: "Integration test project"
    };

    await pubsub.topic(SubscriberTopics.projectCreated).publishMessage({
      data: Buffer.from(JSON.stringify(payload))
    });

    const waitForDocument = async (id: string, timeout = 7000) => {
      const start = Date.now();
      while (Date.now() - start < timeout) {
        const doc = await projectCollection.doc(id).get();
        if (doc.exists) return doc;
        await new Promise((r) => setTimeout(r, 100));
      }
      throw new Error("Project not found in time");
    };

    const doc = await waitForDocument(id);
    expect(doc.data()?.name).toBe("New Project");
  });

  it("should update an existing project", async () => {
    const id = uuidv4();
    const initialData = {
      id,
      name: "Initial Project",
      description: "Before update"
    };
    await projectCollection.doc(id).set(initialData);

    const updatePayload: ProjectUpdatedRequestMessage = {
      correlationKey: uuidv4(),
      id,
      name: "Updated Project",
      description: "After update"
    };

    await pubsub.topic(SubscriberTopics.projectUpdated).publishMessage({
      data: Buffer.from(JSON.stringify(updatePayload))
    });

    await waitFor(7000);
    const doc = await projectCollection.doc(id).get();
    expect(doc.data()?.name).toBe("Updated Project");
  }, 15000);

  it("should delete an existing project", async () => {
    const id = uuidv4();
    const projectData = {
      id,
      name: "Project to Delete",
      description: "Will be deleted"
    };
    await projectCollection.doc(id).set(projectData);

    const deletePayload: ProjectDeletedRequestMessage = {
      correlationKey: uuidv4(),
      id
    };

    await pubsub.topic(SubscriberTopics.projectDeleted).publishMessage({
      data: Buffer.from(JSON.stringify(deletePayload))
    });

    await waitFor(5000);
    const doc = await projectCollection.doc(id).get();
    expect(doc.exists).toBe(false);
  }, 15000);
});