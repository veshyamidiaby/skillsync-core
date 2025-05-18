

import {
  handleProjectCreated,
  handleProjectUpdated,
  handleProjectDeleted,
} from "../../src/handlers/project";
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

describe("Project Handlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("handleProjectCreated", () => {
    it("should publish an error if validation fails", async () => {
      await handleProjectCreated({ correlationKey: "key", id: "" } as any);
      expect(publishMessage).toHaveBeenCalledWith(expect.stringContaining("project.created"), expect.objectContaining({
        status: false,
        errorCode: expect.any(String),
      }));
    });

    it("should publish an error if project already exists", async () => {
      mockGet.mockResolvedValueOnce({ exists: true });
      await handleProjectCreated({ correlationKey: "key", id: "p1", name: "Proj", description: "Desc" });
      expect(publishMessage).toHaveBeenCalledWith(expect.stringContaining("project.created"), expect.objectContaining({
        status: false,
        errorCode: expect.any(String),
      }));
    });

    it("should publish success on new project creation", async () => {
      mockGet.mockResolvedValueOnce({ exists: false });
      mockSet.mockResolvedValueOnce({});
      await handleProjectCreated({ correlationKey: "key", id: "p1", name: "Proj", description: "Desc" });
      expect(mockSet).toHaveBeenCalled();
      expect(publishMessage).toHaveBeenCalledWith(expect.stringContaining("project.created"), expect.objectContaining({
        status: true,
      }));
    });

    it("should publish error on Firestore failure", async () => {
      mockGet.mockResolvedValueOnce({ exists: false });
      mockSet.mockRejectedValueOnce(new Error("fail"));
      await handleProjectCreated({ correlationKey: "key", id: "p1", name: "Proj", description: "Desc" });
      expect(publishMessage).toHaveBeenCalledWith(expect.stringContaining("project.created"), expect.objectContaining({
        status: false,
        errorCode: expect.any(String),
      }));
    });
  });

  describe("handleProjectUpdated", () => {
    it("should publish an error if validation fails", async () => {
      await handleProjectUpdated({ correlationKey: "key", id: "" } as any);
      expect(publishMessage).toHaveBeenCalledWith(expect.stringContaining("project.created"), expect.objectContaining({
        status: false,
        errorCode: expect.any(String),
      }));
    });

    it("should publish error if project doesn't exist", async () => {
      mockGet.mockResolvedValueOnce({ exists: false });
      await handleProjectUpdated({ correlationKey: "key", id: "p1", name: "Updated" });
      expect(publishMessage).toHaveBeenCalledWith(expect.stringContaining("project.updated"), expect.objectContaining({
        status: false,
        errorCode: expect.any(String),
      }));
    });

    it("should update project and publish success", async () => {
      mockGet.mockResolvedValueOnce({ exists: true });
      mockUpdate.mockResolvedValueOnce({});
      await handleProjectUpdated({ correlationKey: "key", id: "p1", name: "Updated" });
      expect(mockUpdate).toHaveBeenCalled();
      expect(publishMessage).toHaveBeenCalledWith(expect.stringContaining("project.updated"), expect.objectContaining({
        status: true,
      }));
    });

    it("should publish error if Firestore update fails", async () => {
      mockGet.mockResolvedValueOnce({ exists: true });
      mockUpdate.mockRejectedValueOnce(new Error("fail"));
      await handleProjectUpdated({ correlationKey: "key", id: "p1", name: "Updated" });
      expect(publishMessage).toHaveBeenCalledWith(expect.stringContaining("project.updated"), expect.objectContaining({
        status: false,
        errorCode: expect.any(String),
      }));
    });
  });

  describe("handleProjectDeleted", () => {
    it("should publish an error if validation fails", async () => {
      await handleProjectDeleted({ correlationKey: "key", id: "" } as any);
      expect(publishMessage).toHaveBeenCalledWith(expect.stringContaining("project.created"), expect.objectContaining({
        status: false,
        errorCode: expect.any(String),
      }));
    });

    it("should publish error if project doesn't exist", async () => {
      mockGet.mockResolvedValueOnce({ exists: false });
      await handleProjectDeleted({ correlationKey: "key", id: "p1" });
      expect(publishMessage).toHaveBeenCalledWith(expect.stringContaining("project.deleted"), expect.objectContaining({
        status: false,
        errorCode: expect.any(String),
      }));
    });

    it("should delete project and publish success", async () => {
      mockGet.mockResolvedValueOnce({ exists: true });
      mockDelete.mockResolvedValueOnce({});
      await handleProjectDeleted({ correlationKey: "key", id: "p1" });
      expect(mockDelete).toHaveBeenCalled();
      expect(publishMessage).toHaveBeenCalledWith(expect.stringContaining("project.deleted"), expect.objectContaining({
        status: true,
      }));
    });

    it("should publish error if Firestore delete fails", async () => {
      mockGet.mockResolvedValueOnce({ exists: true });
      mockDelete.mockRejectedValueOnce(new Error("fail"));
      await handleProjectDeleted({ correlationKey: "key", id: "p1" });
      expect(publishMessage).toHaveBeenCalledWith(expect.stringContaining("project.deleted"), expect.objectContaining({
        status: false,
        errorCode: expect.any(String),
      }));
    });
  });
});