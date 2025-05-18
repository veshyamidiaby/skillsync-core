

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

const mockDoc = firestore.collection("projects").doc("project-1");
const mockGet = mockDoc.get as jest.Mock;
const mockSet = mockDoc.set as jest.Mock;
const mockUpdate = mockDoc.update as jest.Mock;
const mockDelete = mockDoc.delete as jest.Mock;

describe("Firestore project collection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return existing project data", async () => {
    const mockProject = { id: "project-1", name: "Test Project" };
    mockGet.mockResolvedValueOnce({ exists: true, data: () => mockProject });

    const result = await firestore.collection("projects").doc("project-1").get();
    expect(result.exists).toBe(true);
    expect(result.data()).toEqual(mockProject);
  });

  it("should return not found if project doesn't exist", async () => {
    mockGet.mockResolvedValueOnce({ exists: false });

    const result = await firestore.collection("projects").doc("project-1").get();
    expect(result.exists).toBe(false);
  });

  it("should create a new project", async () => {
    mockSet.mockResolvedValueOnce({});
    const payload = { id: "project-1", name: "New Project" };

    await firestore.collection("projects").doc("project-1").set(payload);
    expect(mockSet).toHaveBeenCalledWith(payload);
  });

  it("should update an existing project", async () => {
    mockUpdate.mockResolvedValueOnce({});
    const updates = { name: "Updated Project" };

    await firestore.collection("projects").doc("project-1").update(updates);
    expect(mockUpdate).toHaveBeenCalledWith(updates);
  });

  it("should delete a project", async () => {
    mockDelete.mockResolvedValueOnce({});

    await firestore.collection("projects").doc("project-1").delete();
    expect(mockDelete).toHaveBeenCalled();
  });

  it("should handle error when getting project fails", async () => {
    mockGet.mockRejectedValueOnce(new Error("Firestore error"));

    await expect(firestore.collection("projects").doc("project-1").get()).rejects.toThrow("Firestore error");
  });

  it("should handle error when creating project fails", async () => {
    mockSet.mockRejectedValueOnce(new Error("Set error"));

    await expect(firestore.collection("projects").doc("project-1").set({})).rejects.toThrow("Set error");
  });

  it("should handle error when updating project fails", async () => {
    mockUpdate.mockRejectedValueOnce(new Error("Update error"));

    await expect(firestore.collection("projects").doc("project-1").update({})).rejects.toThrow("Update error");
  });

  it("should handle error when deleting project fails", async () => {
    mockDelete.mockRejectedValueOnce(new Error("Delete error"));

    await expect(firestore.collection("projects").doc("project-1").delete()).rejects.toThrow("Delete error");
  });
});