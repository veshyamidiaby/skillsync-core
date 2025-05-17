import { z } from "zod";
import { TaskStatuses } from "../types";

const taskCreatedSchema = z.object({
  correlationKey: z.string().min(1),
  id: z.string().min(1),
  projectId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  taskMembers: z.array(z.string()).optional(),
  dueDate: z.string().optional(),
  status: z.nativeEnum(TaskStatuses).optional(),
});

const taskUpdatedSchema = z.object({
  correlationKey: z.string().min(1),
  id: z.string().min(1),
  name: z.string().optional(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.nativeEnum(TaskStatuses).optional(),
});

const taskDeletedSchema = z.object({
  correlationKey: z.string().min(1),
  id: z.string().min(1),
});

const taskAssignedSchema = z.object({
  correlationKey: z.string().min(1),
  id: z.string().min(1),
  memberId: z.string().min(1),
});

const taskCompletedSchema = z.object({
  correlationKey: z.string().min(1),
  id: z.string().min(1),
  completedBy: z.string().min(1),
});

export {
  taskCreatedSchema,
  taskUpdatedSchema,
  taskDeletedSchema,
  taskAssignedSchema,
  taskCompletedSchema,
}