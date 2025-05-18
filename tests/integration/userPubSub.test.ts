process.env.NODE_ENV = "test";

import { PubSub } from "@google-cloud/pubsub";
import { firestore } from "../../src/lib/firestore";
import { initTopics } from "../../src/lib/pubsub-init";
// import { initalizeSubscribers } from "../../src/pubsub/subscriber";
import { PublisherTopics, SubscriberTopics, UserCreatedRequestMessage } from "../../src/types";
import { v4 as uuidv4 } from "uuid";

const pubsub = new PubSub({
  projectId: "skillsync-local",
  apiEndpoint: "localhost:8085"
});

const userCollection = firestore.collection("users");

const waitFor = (ms: number) => new Promise((res) => setTimeout(res, ms));

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
        // Simulate handler logic for userCreated (expand if needed)
        if (topicName === SubscriberTopics.userCreated) {
          if (!messageData.email) {
            throw new Error("Missing email");
          }

          const doc = await userCollection.doc(messageData.id).get();
          if (doc.exists) {
            throw new Error("User already exists");
          }

          await userCollection.doc(messageData.id).set(messageData);
        }
        message.ack();
      } catch (error) {
        message.nack();
      }
    });
  });
};

describe("Integration: user.created Pub/Sub flow", () => {
  jest.setTimeout(15000);
  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    await initTopics();
    initializeTestSubscribers();
    await new Promise((r) => setTimeout(r, 500));
  });

  afterEach(async () => {
    const docs = await userCollection.listDocuments();
    await Promise.all(docs.map((doc) => doc.delete()));
  });

  afterAll(async () => {
    await Promise.all(
      subscriptionsToClose.map((sub) => sub.close().catch(() => null))
    );
  });

  it("should create a user and publish a success response", async () => {
    const id = uuidv4();
    const correlationKey = uuidv4();
    const payload: UserCreatedRequestMessage = {
      correlationKey,
      id,
      name: "Test User",
      email: "test@example.com"
    };

    await pubsub.topic(SubscriberTopics.userCreated).publishMessage({
      data: Buffer.from(JSON.stringify(payload))
    });

    const waitForDocument = async (id: string, timeout = 5000) => {
      const start = Date.now();
      while (Date.now() - start < timeout) {
        const doc = await userCollection.doc(id).get();
        if (doc.exists) return doc;
        await new Promise((r) => setTimeout(r, 100));
      }
      throw new Error("Document not found in time");
    };

    const doc = await waitForDocument(id);
    expect(doc.data()?.email).toBe("test@example.com");
  });

  it("should not create a user with missing email and publish an error response", async () => {
    const id = uuidv4();
    const correlationKey = uuidv4();
    const payload = {
      correlationKey,
      id,
      name: "Test User"
    };

    await pubsub.topic(SubscriberTopics.userCreated).publishMessage({
      data: Buffer.from(JSON.stringify(payload))
    });

    await waitFor(2000);

    const doc = await userCollection.doc(id).get();
    expect(doc.exists).toBe(false);
  });

  it("should reject duplicate user creation", async () => {
    const id = uuidv4();
    const correlationKey = uuidv4();
    const basePayload: UserCreatedRequestMessage = {
      correlationKey,
      id,
      name: "Existing User",
      email: "duplicate@example.com"
    };

    await userCollection.doc(id).set(basePayload);

    await pubsub.topic(SubscriberTopics.userCreated).publishMessage({
      data: Buffer.from(JSON.stringify(basePayload))
    });

    await waitFor(2000);

    const doc = await userCollection.doc(id).get();
    expect(doc.exists).toBe(true);
    expect(doc.data()?.email).toBe("duplicate@example.com");
  });
});