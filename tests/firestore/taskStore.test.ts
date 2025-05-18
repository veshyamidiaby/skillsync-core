

import { firestore } from "../../src/lib/firestore";

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

const mockDoc = firestore.collection("tasks").doc("task-1");
const mockGet = mockDoc.get as jest.Mock;
const mockSet = mockDoc.set as jest.Mock;
const mockUpdate = mockDoc.update as jest.Mock;
const mockDelete = mockDoc.delete as jest.Mock;

describe("Firestore task collection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return existing task data", async () => {
    const mockTask = { id: "task-1", name: "Test Task" };
    mockGet.mockResolvedValueOnce({ exists: true, data: () => mockTask });

    const result = await firestore.collection("tasks").doc("task-1").get();
    expect(result.exists).toBe(true);
    expect(result.data()).toEqual(mockTask);
  });

  it("should return not found if task doesn't exist", async () => {
    mockGet.mockResolvedValueOnce({ exists: false });

    const result = await firestore.collection("tasks").doc("task-1").get();
    expect(result.exists).toBe(false);
  });

  it("should create a new task", async () => {
    mockSet.mockResolvedValueOnce({});
    const payload = { id: "task-1", name: "New Task" };

    await firestore.collection("tasks").doc("task-1").set(payload);
    expect(mockSet).toHaveBeenCalledWith(payload);
  });

  it("should update an existing task", async () => {
    mockUpdate.mockResolvedValueOnce({});
    const updates = { name: "Updated Task" };

    await firestore.collection("tasks").doc("task-1").update(updates);
    expect(mockUpdate).toHaveBeenCalledWith(updates);
  });

  it("should delete a task", async () => {
    mockDelete.mockResolvedValueOnce({});

    await firestore.collection("tasks").doc("task-1").delete();
    expect(mockDelete).toHaveBeenCalled();
  });

  it("should handle error when getting task fails", async () => {
    mockGet.mockRejectedValueOnce(new Error("Firestore error"));

    await expect(firestore.collection("tasks").doc("task-1").get()).rejects.toThrow("Firestore error");
  });

  it("should handle error when creating task fails", async () => {
    mockSet.mockRejectedValueOnce(new Error("Set error"));

    await expect(firestore.collection("tasks").doc("task-1").set({})).rejects.toThrow("Set error");
  });

  it("should handle error when updating task fails", async () => {
    mockUpdate.mockRejectedValueOnce(new Error("Update error"));

    await expect(firestore.collection("tasks").doc("task-1").update({})).rejects.toThrow("Update error");
  });

  it("should handle error when deleting task fails", async () => {
    mockDelete.mockRejectedValueOnce(new Error("Delete error"));

    await expect(firestore.collection("tasks").doc("task-1").delete()).rejects.toThrow("Delete error");
  });
});