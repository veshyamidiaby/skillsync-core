import {
  userCreatedSchema,
  userUpdatedSchema,
  userDeletedSchema,
} from "../../src/validators";

describe("userCreatedSchema", () => {
  it("should pass validation with a valid payload", () => {
    const result = userCreatedSchema.safeParse({
      correlationKey: "abc-123",
      id: "user-1",
      email: "test@example.com",
      name: "John Doe",
    });

    expect(result.success).toBe(true);
  });

  it("should fail validation when email is missing", () => {
    const result = userCreatedSchema.safeParse({
      correlationKey: "abc-123",
      id: "user-1",
      name: "John Doe",
    });

    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.issues.some(issue => issue.path.includes("email"))).toBe(true);
    }
  });

  it("should fail validation when correlationKey is an empty string", () => {
    const result = userCreatedSchema.safeParse({
      correlationKey: "",
      id: "user-1",
      email: "test@example.com",
    });

    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.issues.some(issue => issue.path.includes("correlationKey"))).toBe(true);
    }
  });

  it("should fail validation when email is invalid", () => {
    const result = userCreatedSchema.safeParse({
      correlationKey: "abc-123",
      id: "user-1",
      email: "not-an-email",
    });

    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.issues.some(issue => issue.path.includes("email"))).toBe(true);
    }
  });

  it("should fail validation with all fields missing", () => {
    const result = userCreatedSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("userUpdatedSchema", () => {
  it("should pass with valid optional email", () => {
    const result = userUpdatedSchema.safeParse({
      correlationKey: "key-1",
      id: "user-1",
      email: "updated@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("should pass with valid optional name", () => {
    const result = userUpdatedSchema.safeParse({
      correlationKey: "key-1",
      id: "user-1",
      name: "Updated Name",
    });
    expect(result.success).toBe(true);
  });

  it("should fail with invalid email", () => {
    const result = userUpdatedSchema.safeParse({
      correlationKey: "key-1",
      id: "user-1",
      email: "invalid",
    });
    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.issues.some(issue => issue.path.includes("email"))).toBe(true);
    }
  });

  it("should fail with missing id", () => {
    const result = userUpdatedSchema.safeParse({
      correlationKey: "key-1",
      email: "updated@example.com",
    });
    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.issues.some(issue => issue.path.includes("id"))).toBe(true);
    }
  });

  it("should fail with empty correlationKey", () => {
    const result = userUpdatedSchema.safeParse({
      correlationKey: "",
      id: "user-1",
    });
    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.issues.some(issue => issue.path.includes("correlationKey"))).toBe(true);
    }
  });

  it("should fail with all fields missing", () => {
    const result = userUpdatedSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("userDeletedSchema", () => {
  it("should pass with valid correlationKey and id", () => {
    const result = userDeletedSchema.safeParse({
      correlationKey: "del-123",
      id: "user-2",
    });
    expect(result.success).toBe(true);
  });

  it("should fail with empty correlationKey", () => {
    const result = userDeletedSchema.safeParse({
      correlationKey: "",
      id: "user-2",
    });
    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.issues.some(issue => issue.path.includes("correlationKey"))).toBe(true);
    }
  });

  it("should fail with all fields missing", () => {
    const result = userDeletedSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(2);
    }
  });
});