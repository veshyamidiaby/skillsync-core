import {
  projectCreatedSchema,
  projectUpdatedSchema,
  projectDeletedSchema,
} from "../../src/validators";

describe("projectCreatedSchema", () => {
  it("should pass with valid data", () => {
    const result = projectCreatedSchema.safeParse({
      correlationKey: "key-1",
      id: "proj-1",
      name: "New Project",
      description: "Some description",
    });
    expect(result.success).toBe(true);
  });

  it("should fail with missing name", () => {
    const result = projectCreatedSchema.safeParse({
      correlationKey: "key-1",
      id: "proj-1",
    });
    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.issues.some(issue => issue.path.includes("name"))).toBe(true);
    }
  });

  it("should fail with empty name", () => {
    const result = projectCreatedSchema.safeParse({
      correlationKey: "key-1",
      id: "proj-1",
      name: "",
    });
    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.issues.some(issue => issue.path.includes("name"))).toBe(true);
    }
  });

  it("should fail with all fields missing", () => {
    const result = projectCreatedSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("should fail with empty correlationKey", () => {
    const result = projectCreatedSchema.safeParse({
      correlationKey: "",
      id: "proj-1",
      name: "Test Project",
    });
    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.issues.some(issue => issue.path.includes("correlationKey"))).toBe(true);
    }
  });
});

describe("projectUpdatedSchema", () => {
  it("should pass with name only", () => {
    const result = projectUpdatedSchema.safeParse({
      correlationKey: "key-2",
      id: "proj-2",
      name: "Updated Project",
    });
    expect(result.success).toBe(true);
  });

  it("should fail with missing id", () => {
    const result = projectUpdatedSchema.safeParse({
      correlationKey: "key-2",
      name: "Updated Project",
    });
    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.issues.some(issue => issue.path.includes("id"))).toBe(true);
    }
  });

  it("should fail with empty id", () => {
    const result = projectUpdatedSchema.safeParse({
      correlationKey: "key-2",
      id: "",
      name: "Updated Project",
    });
    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.issues.some(issue => issue.path.includes("id"))).toBe(true);
    }
  });

  it("should fail with empty correlationKey", () => {
    const result = projectUpdatedSchema.safeParse({
      correlationKey: "",
      id: "proj-2",
      name: "Updated Project",
    });
    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.issues.some(issue => issue.path.includes("correlationKey"))).toBe(true);
    }
  });

  it("should fail with all fields missing", () => {
    const result = projectUpdatedSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("projectDeletedSchema", () => {
  it("should pass with valid correlationKey and id", () => {
    const result = projectDeletedSchema.safeParse({
      correlationKey: "key-3",
      id: "proj-3",
    });
    expect(result.success).toBe(true);
  });

  it("should fail with empty correlationKey", () => {
    const result = projectDeletedSchema.safeParse({
      correlationKey: "",
      id: "proj-3",
    });
    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.issues.some(issue => issue.path.includes("correlationKey"))).toBe(true);
    }
  });

  it("should fail with all fields missing", () => {
    const result = projectDeletedSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("should fail with empty id", () => {
    const result = projectDeletedSchema.safeParse({
      correlationKey: "key-3",
      id: "",
    });
    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.issues.some(issue => issue.path.includes("id"))).toBe(true);
    }
  });
});