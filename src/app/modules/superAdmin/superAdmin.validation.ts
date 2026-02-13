import { z } from "zod";

const updateSuperAdminSchema = z.object({
  body: z
    .object({
      name: z.string(),
      profilePhoto: z.url("Invalid profile photo URL"),
      contactNumber: z.string().length(11, "Contact number must be 11 digits"),
      address: z.string(),
    })
    .partial()
    .strict(),
});

export const superAdminValidation = {
  updateSuperAdminSchema,
};
