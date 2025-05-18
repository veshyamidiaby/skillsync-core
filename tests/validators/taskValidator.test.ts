import {
  taskCreatedSchema,
  taskUpdatedSchema,
  taskDeletedSchema,
  taskAssignedSchema,
  taskCompletedSchema,
} from "../../src/validators";

describe("taskCreatedSchema", () => {
  it("should pass with valid input", () => {
    const result = taskCreatedSchema.safeParse({
      correlationKey: "abc-1",
      id: "task-1",
      projectId: "proj-1",
      name: "Test Task",
    });
    expect(result.success).toBe(true);
  });

  it("should fail with missing projectId", () => {
    const result = taskCreatedSchema.safeParse({
      correlationKey: "abc-1",
      id: "task-1",
      name: "Test Task",
    });
    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.issues.some(issue => issue.path.includes("projectId"))).toBe(true);
    }
  });

  // Additional tests for taskCreatedSchema
  it("should fail when name is an empty string", () => {
    const result = taskCreatedSchema.safeParse({
      correlationKey: "abc-1",
      id: "task-1",
      projectId: "proj-1",
      name: "",
    });
    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.issues.some(issue => issue.path.includes("name"))).toBe(true);
    }
  });

  it("should fail when taskMembers is not an array", () => {
    const result = taskCreatedSchema.safeParse({
      correlationKey: "abc-1",
      id: "task-1",
      projectId: "proj-1",
      name: "Test",
      taskMembers: "invalid-type",
    });
    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.issues.some(issue => issue.path.includes("taskMembers"))).toBe(true);
    }
  });

  it("should fail when status is not a valid enum", () => {
    const result = taskCreatedSchema.safeParse({
      correlationKey: "abc-1",
      id: "task-1",
      projectId: "proj-1",
      name: "Test",
      status: "NOT_VALID",
    });
    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.issues.some(issue => issue.path.includes("status"))).toBe(true);
    }
  });

  it("should fail with all required fields missing", () => {
    const result = taskCreatedSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(4);
    }
  });
});

describe("taskUpdatedSchema", () => {
  it("should pass with optional fields only", () => {
    const result = taskUpdatedSchema.safeParse({
      correlationKey: "abc-2",
      id: "task-2",
      name: "Updated name",
    });
    expect(result.success).toBe(true);
  });

  it("should fail with missing id", () => {
    const result = taskUpdatedSchema.safeParse({
      correlationKey: "abc-2",
      name: "Updated name",
    });
    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.issues.some(issue => issue.path.includes("id"))).toBe(true);
    }
  });

  // Additional test for taskUpdatedSchema
  it("should fail when status is invalid", () => {
    const result = taskUpdatedSchema.safeParse({
      correlationKey: "abc-2",
      id: "task-2",
      status: "NOT_A_STATUS",
    });
    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.issues.some(issue => issue.path.includes("status"))).toBe(true);
    }
  });
});

describe("taskDeletedSchema", () => {
  it("should pass with valid id and correlationKey", () => {
    const result = taskDeletedSchema.safeParse({
      correlationKey: "abc-3",
      id: "task-3",
    });
    expect(result.success).toBe(true);
  });

  it("should fail with empty correlationKey", () => {
    const result = taskDeletedSchema.safeParse({
      correlationKey: "",
      id: "task-3",
    });
    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.issues.some(issue => issue.path.includes("correlationKey"))).toBe(true);
    }
  });

  // Additional test for taskDeletedSchema
  it("should fail with all fields missing", () => {
    const result = taskDeletedSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("taskAssignedSchema", () => {
  it("should pass with all required fields", () => {
    const result = taskAssignedSchema.safeParse({
      correlationKey: "abc-4",
      id: "task-4",
      memberId: "user-123",
    });
    expect(result.success).toBe(true);
  });

  it("should fail with missing memberId", () => {
    const result = taskAssignedSchema.safeParse({
      correlationKey: "abc-4",
      id: "task-4",
    });
    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.issues.some(issue => issue.path.includes("memberId"))).toBe(true);
    }
  });

  // Additional test for taskAssignedSchema
  it("should fail with all fields missing", () => {
    const result = taskAssignedSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("taskCompletedSchema", () => {
  it("should pass with valid input", () => {
    const result = taskCompletedSchema.safeParse({
      correlationKey: "abc-5",
      id: "task-5",
      completedBy: "user-456",
    });
    expect(result.success).toBe(true);
  });

  it("should fail with missing completedBy", () => {
    const result = taskCompletedSchema.safeParse({
      correlationKey: "abc-5",
      id: "task-5",
    });
    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.issues.some(issue => issue.path.includes("completedBy"))).toBe(true);
    }
  });

  // Additional test for taskCompletedSchema
  it("should fail with all fields missing", () => {
    const result = taskCompletedSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(3);
    }
  });
});