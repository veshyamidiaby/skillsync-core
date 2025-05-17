import { z } from "zod";

const projectCreatedSchema = z.object({
  correlationKey: z.string().min(1),
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
});

const projectUpdatedSchema = z.object({
  correlationKey: z.string().min(1),
  id: z.string().min(1),
  name: z.string().optional(),
  description: z.string().optional(),
});

const projectDeletedSchema = z.object({
  correlationKey: z.string().min(1),
  id: z.string().min(1),
});

export {
  projectCreatedSchema,
  projectUpdatedSchema,
  projectDeletedSchema,
}