


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

const mockDoc = firestore.collection("users").doc("user-1");
const mockGet = mockDoc.get as jest.Mock;
const mockSet = mockDoc.set as jest.Mock;
const mockUpdate = mockDoc.update as jest.Mock;
const mockDelete = mockDoc.delete as jest.Mock;

describe("Firestore user collection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return existing user data", async () => {
    const mockUser = { id: "user-1", email: "test@example.com" };
    mockGet.mockResolvedValueOnce({ exists: true, data: () => mockUser });

    const result = await firestore.collection("users").doc("user-1").get();
    expect(result.exists).toBe(true);
    expect(result.data()).toEqual(mockUser);
  });

  it("should return not found if user doesn't exist", async () => {
    mockGet.mockResolvedValueOnce({ exists: false });

    const result = await firestore.collection("users").doc("user-1").get();
    expect(result.exists).toBe(false);
  });

  it("should create a new user", async () => {
    mockSet.mockResolvedValueOnce({});
    const payload = { id: "user-1", email: "new@example.com" };

    await firestore.collection("users").doc("user-1").set(payload);
    expect(mockSet).toHaveBeenCalledWith(payload);
  });

  it("should update an existing user", async () => {
    mockUpdate.mockResolvedValueOnce({});
    const updates = { name: "Updated Name" };

    await firestore.collection("users").doc("user-1").update(updates);
    expect(mockUpdate).toHaveBeenCalledWith(updates);
  });

  it("should delete a user", async () => {
    mockDelete.mockResolvedValueOnce({});

    await firestore.collection("users").doc("user-1").delete();
    expect(mockDelete).toHaveBeenCalled();
  });

  it("should handle error when getting user fails", async () => {
    mockGet.mockRejectedValueOnce(new Error("Firestore error"));

    await expect(firestore.collection("users").doc("user-1").get()).rejects.toThrow("Firestore error");
  });

  it("should handle error when creating user fails", async () => {
    mockSet.mockRejectedValueOnce(new Error("Set error"));

    await expect(firestore.collection("users").doc("user-1").set({})).rejects.toThrow("Set error");
  });

  it("should handle error when updating user fails", async () => {
    mockUpdate.mockRejectedValueOnce(new Error("Update error"));

    await expect(firestore.collection("users").doc("user-1").update({})).rejects.toThrow("Update error");
  });

  it("should handle error when deleting user fails", async () => {
    mockDelete.mockRejectedValueOnce(new Error("Delete error"));

    await expect(firestore.collection("users").doc("user-1").delete()).rejects.toThrow("Delete error");
  });
});