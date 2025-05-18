

import {
  handleTaskCreated,
  handleTaskUpdated,
  handleTaskDeleted,
  handleTaskAssigned,
  handleTaskCompleted,
} from "../../src/handlers/task";
import { publishMessage } from "../../src/pubsub";
import { firestore } from "../../src/lib/firestore";

jest.mock("../../src/pubsub", () => ({
  publishMessage: jest.fn(),
}));
jest.mock("../../src/lib/logger", () => ({
  logger: () => ({
    info: jest.fn(),
    error: jest.fn(),
  }),
}));
jest.mock("../../src/lib/firestore", () => {
  const get = jest.fn();
  const set = jest.fn();
  const update = jest.fn();
  const del = jest.fn();

  return {
    firestore: {
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          get,
          set,
          update,
          delete: del,
        })),
      })),
    },
  };
});

const mockDoc = firestore.collection("").doc("");
const mockGet = mockDoc.get as jest.Mock;
const mockSet = mockDoc.set as jest.Mock;
const mockUpdate = mockDoc.update as jest.Mock;
const mockDelete = mockDoc.delete as jest.Mock;

describe("Task Handlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("handleTaskCreated", () => {
    it("should publish error on validation failure", async () => {
      await handleTaskCreated({ correlationKey: "key" } as any);
      expect(publishMessage).toHaveBeenCalledWith(expect.stringContaining("task.created"), expect.objectContaining({
        status: false,
      }));
    });

    it("should publish error if task already exists", async () => {
      mockGet.mockResolvedValueOnce({ exists: true });
      await handleTaskCreated({ correlationKey: "key", id: "t1", projectId: "p1", name: "Test" });
      expect(publishMessage).toHaveBeenCalledWith(expect.stringContaining("task.created"), expect.objectContaining({
        status: false,
      }));
    });

    it("should publish success on new task", async () => {
      mockGet.mockResolvedValueOnce({ exists: false });
      mockSet.mockResolvedValueOnce({});
      await handleTaskCreated({ correlationKey: "key", id: "t1", projectId: "p1", name: "Test" });
      expect(publishMessage).toHaveBeenCalledWith(expect.stringContaining("task.created"), expect.objectContaining({
        status: true,
      }));
    });

    it("should publish error if firestore fails", async () => {
      mockGet.mockResolvedValueOnce({ exists: false });
      mockSet.mockRejectedValueOnce(new Error("fail"));
      await handleTaskCreated({ correlationKey: "key", id: "t1", projectId: "p1", name: "Test" });
      expect(publishMessage).toHaveBeenCalledWith(expect.stringContaining("task.created"), expect.objectContaining({
        status: false,
      }));
    });
  });

  describe("handleTaskUpdated", () => {
    it("should publish error if task doesn't exist", async () => {
      mockGet.mockResolvedValueOnce({ exists: false });
      await handleTaskUpdated({ correlationKey: "key", id: "t1", status: "in-progress" });
      expect(publishMessage).toHaveBeenCalledWith(expect.stringContaining("task.updated"), expect.objectContaining({
        status: false,
      }));
    });

    it("should update and publish success", async () => {
      mockGet.mockResolvedValueOnce({ exists: true });
      mockUpdate.mockResolvedValueOnce({});
      await handleTaskUpdated({ correlationKey: "key", id: "t1", status: "in-progress" });
      expect(publishMessage).toHaveBeenCalledWith(expect.stringContaining("task.updated"), expect.objectContaining({
        status: true,
      }));
    });

    it("should publish error if update fails", async () => {
      mockGet.mockResolvedValueOnce({ exists: true });
      mockUpdate.mockRejectedValueOnce(new Error("fail"));
      await handleTaskUpdated({ correlationKey: "key", id: "t1", status: "in-progress" });
      expect(publishMessage).toHaveBeenCalledWith(expect.stringContaining("task.updated"), expect.objectContaining({
        status: false,
      }));
    });
  });

  describe("handleTaskDeleted", () => {
    it("should publish error if task doesn't exist", async () => {
      mockGet.mockResolvedValueOnce({ exists: false });
      await handleTaskDeleted({ correlationKey: "key", id: "t1" });
      expect(publishMessage).toHaveBeenCalledWith(expect.stringContaining("task.deleted"), expect.objectContaining({
        status: false,
      }));
    });

    it("should delete and publish success", async () => {
      mockGet.mockResolvedValueOnce({ exists: true });
      mockDelete.mockResolvedValueOnce({});
      await handleTaskDeleted({ correlationKey: "key", id: "t1" });
      expect(publishMessage).toHaveBeenCalledWith(expect.stringContaining("task.deleted"), expect.objectContaining({
        status: true,
      }));
    });

    it("should publish error if delete fails", async () => {
      mockGet.mockResolvedValueOnce({ exists: true });
      mockDelete.mockRejectedValueOnce(new Error("fail"));
      await handleTaskDeleted({ correlationKey: "key", id: "t1" });
      expect(publishMessage).toHaveBeenCalledWith(expect.stringContaining("task.deleted"), expect.objectContaining({
        status: false,
      }));
    });
  });

  describe("handleTaskAssigned", () => {
    it("should publish error if task or project not found", async () => {
      mockGet.mockResolvedValueOnce({ exists: false });
      await handleTaskAssigned({ correlationKey: "key", id: "t1", memberId: "u1" });
      expect(publishMessage).toHaveBeenCalledWith(expect.stringContaining("task.assigned"), expect.objectContaining({
        status: false,
      }));
    });
  });

  describe("handleTaskCompleted", () => {
    it("should publish error if task not found", async () => {
      mockGet.mockResolvedValueOnce({ exists: false });
      await handleTaskCompleted({ correlationKey: "key", id: "t1", completedBy: "u1" });
      expect(publishMessage).toHaveBeenCalledWith(expect.stringContaining("task.completed"), expect.objectContaining({
        status: false,
      }));
    });
  });
});