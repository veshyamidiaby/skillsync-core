import { z } from "zod";

const userCreatedSchema = z.object({
  correlationKey: z.string().min(1),
  id: z.string().min(1),
  email: z.string().email(),
  name: z.string().optional(),
})

const userUpdatedSchema = z.object({
  correlationKey: z.string().min(1),
  id: z.string().min(1),
  email: z.string().email().optional(),
  name: z.string().optional(),
})

const userDeletedSchema = z.object({
  correlationKey: z.string().min(1),
  id: z.string().min(1),
})

export {
  userCreatedSchema,
  userUpdatedSchema,
  userDeletedSchema,
}