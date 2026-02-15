import { z } from "zod";
import { Gender } from "../../../generated/prisma/enums";

const updateDoctorSchema = z.object({
  body: z.object({
    // 1. Doctor Data (Nested object)
    doctor: z
      .object({
        name: z
          .string()
          .min(5, "Name must be at least 5 characters")
          .max(30, "Name must be at most 30 characters"),
        profileImg: z.url("Profile photo must be a valid URL"), // Matches your interface field name
        contactNumber: z
          .string()
          .min(11, "Contact number must be at least 11 characters")
          .max(15, "Contact number must be at most 15 characters"),
        address: z
          .string()
          .min(10, "Address must be at least 10 characters")
          .max(100, "Address must be at most 100 characters"),
        registrationNumber: z.string(),
        experience: z.number().int().nonnegative(),
        gender: z.enum([Gender.MALE, Gender.FEMALE]),
        appointmentFee: z.number().nonnegative(),
        qualification: z.string().min(2).max(50),
        currentWorkingPlace: z.string().min(2).max(50),
        designation: z.string().min(2).max(50),
      })
      .partial()
      .strict()
      .optional(), // <--- This makes the whole 'doctor' key optional

    // 2. Specialties Data (Sibling to doctor, not nested inside it)
    specialties: z.array(
      z.object({
        specialtyId: z.uuid("Specialty ID must be a valid UUID"),
        shouldDelete: z.boolean().default(false),
      }),
    ),
  }),
});

export const doctorValidation = {
  updateDoctorSchema,
};
