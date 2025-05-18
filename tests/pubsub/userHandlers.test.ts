

import {
  handleUserCreated,
  handleUserDeleted,
  handleUserUpdated,
} from "../../src/handlers/user";
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

describe("User Handlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("handleUserCreated", () => {
    it("should publish an error if validation fails", async () => {
      await handleUserCreated({ correlationKey: "abc", id: "" } as any);
      expect(publishMessage).toHaveBeenCalledWith(expect.stringContaining("user.created"), expect.objectContaining({
        status: false,
        errorCode: expect.any(String)
      }));
    });

    it("should publish an error if user already exists", async () => {
      mockGet.mockResolvedValueOnce({ exists: true });
      await handleUserCreated({ correlationKey: "abc", id: "u1", email: "a@b.com", name: "test" });
      expect(publishMessage).toHaveBeenCalledWith(expect.stringContaining("user.created"), expect.objectContaining({
        status: false,
        errorCode: expect.any(String)
      }));
    });

    it("should publish success and create user if valid", async () => {
      mockGet.mockResolvedValueOnce({ exists: false });
      mockSet.mockResolvedValueOnce({});
      await handleUserCreated({ correlationKey: "abc", id: "u1", email: "a@b.com", name: "test" });
      expect(mockSet).toHaveBeenCalled();
      expect(publishMessage).toHaveBeenCalledWith(expect.stringContaining("user.created"), expect.objectContaining({
        status: true,
      }));
    });

    it("should publish an error on Firestore failure", async () => {
      mockGet.mockResolvedValueOnce({ exists: false });
      mockSet.mockRejectedValueOnce(new Error("Firestore error"));
      await handleUserCreated({ correlationKey: "abc", id: "u1", email: "a@b.com", name: "test" });
      expect(publishMessage).toHaveBeenCalledWith(expect.stringContaining("user.created"), expect.objectContaining({
        status: false,
        errorCode: expect.any(String),
      }));
    });
  });

  describe("handleUserDeleted", () => {
    it("should publish an error if validation fails", async () => {
      await handleUserDeleted({ correlationKey: "abc", id: "" } as any);
      expect(publishMessage).toHaveBeenCalledWith(expect.stringContaining("user.deleted"), expect.objectContaining({
        status: false,
        errorCode: expect.any(String)
      }));
    });

    it("should publish error if user doesn't exist", async () => {
      mockGet.mockResolvedValueOnce({ exists: false });
      await handleUserDeleted({ correlationKey: "abc", id: "u1" });
      expect(publishMessage).toHaveBeenCalledWith(expect.stringContaining("user.deleted"), expect.objectContaining({
        status: false,
        errorCode: expect.any(String)
      }));
    });

    it("should publish success on successful delete", async () => {
      mockGet.mockResolvedValueOnce({ exists: true });
      mockDelete.mockResolvedValueOnce({});
      await handleUserDeleted({ correlationKey: "abc", id: "u1" });
      expect(mockDelete).toHaveBeenCalled();
      expect(publishMessage).toHaveBeenCalledWith(expect.stringContaining("user.deleted"), expect.objectContaining({
        status: true,
      }));
    });

    it("should publish error if Firestore delete fails", async () => {
      mockGet.mockResolvedValueOnce({ exists: true });
      mockDelete.mockRejectedValueOnce(new Error("fail"));
      await handleUserDeleted({ correlationKey: "abc", id: "u1" });
      expect(publishMessage).toHaveBeenCalledWith(expect.stringContaining("user.deleted"), expect.objectContaining({
        status: false,
        errorCode: expect.any(String)
      }));
    });
  });

  describe("handleUserUpdated", () => {
    it("should publish an error if validation fails", async () => {
      await handleUserUpdated({ correlationKey: "abc", id: "" } as any);
      expect(publishMessage).toHaveBeenCalledWith(expect.stringContaining("user.updated"), expect.objectContaining({
        status: false,
        errorCode: expect.any(String)
      }));
    });

    it("should publish error if user doesn't exist", async () => {
      mockGet.mockResolvedValueOnce({ exists: false });
      await handleUserUpdated({ correlationKey: "abc", id: "u1", name: "X" });
      expect(publishMessage).toHaveBeenCalledWith(expect.stringContaining("user.updated"), expect.objectContaining({
        status: false,
        errorCode: expect.any(String)
      }));
    });

    it("should update user if exists", async () => {
      mockGet.mockResolvedValueOnce({ exists: true });
      mockUpdate.mockResolvedValueOnce({});
      await handleUserUpdated({ correlationKey: "abc", id: "u1", name: "X" });
      expect(mockUpdate).toHaveBeenCalled();
      expect(publishMessage).toHaveBeenCalledWith(expect.stringContaining("user.updated"), expect.objectContaining({
        status: true,
      }));
    });

    it("should publish error if Firestore update fails", async () => {
      mockGet.mockResolvedValueOnce({ exists: true });
      mockUpdate.mockRejectedValueOnce(new Error("fail"));
      await handleUserUpdated({ correlationKey: "abc", id: "u1", name: "X" });
      expect(publishMessage).toHaveBeenCalledWith(expect.stringContaining("user.updated"), expect.objectContaining({
        status: false,
        errorCode: expect.any(String)
      }));
    });
  });
});