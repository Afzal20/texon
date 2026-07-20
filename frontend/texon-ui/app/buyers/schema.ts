import { z } from "zod"

export const buyerFormSchema = z.object({
  name: z
    .string()
    .min(1, "Buyer name is required")
    .max(255, "Name must be 255 characters or fewer"),
  code: z
    .string()
    .min(1, "Buyer code is required")
    .max(50, "Code must be 50 characters or fewer")
    .regex(
      /^[A-Za-z0-9_-]+$/,
      "Code can only contain letters, numbers, hyphens, and underscores",
    ),
  country: z
    .string()
    .min(1, "Country is required")
    .max(100, "Country must be 100 characters or fewer"),
  address: z.string().max(500).optional(),
  contact_person: z.string().max(255).optional(),
  email: z.string().max(255).optional(),
  phone: z.string().max(50).optional(),
  is_active: z.boolean(),
})

export type BuyerFormValues = z.infer<typeof buyerFormSchema>

export const buyerSearchSchema = z.object({
  search: z.string().default(""),
  page: z.number().default(1),
})

export type BuyerSearchValues = z.infer<typeof buyerSearchSchema>
