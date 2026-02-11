import z from "zod";
import { Gender } from "../../../generated/prisma/enums";

const createDoctorSchema = z.object({
  body: z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    doctor: z
      .object({
        name: z.string("Name is required and must be a string"),
        email: z.email("A valid email address is required"),
        profileImg: z.url("Invalid profile image URL").optional(),
        contactNumber: z
          .string("Contact number is required and must be a string")
          .length(11, "Contact number must be 11 digits")
          .optional(),
        address: z.string().optional(),
        registrationNumber: z.string(
          "Registration number is required and must be a string",
        ),
        experience: z.number().int().nonnegative().default(0),
        gender: z.enum(
          [Gender.MALE, Gender.FEMALE],
          "Gender must be either MALE or FEMALE",
        ),
        appointmentFee: z.number().positive("Fee must be a positive number"),
        qualification: z.string("Valid qualification is required"),
        currentWorkingPlace: z.string("Valid working place is required"),
        designation: z
          .string("Valid designation is required")
          .min(2, "Designation must be at least 2 characters")
          .max(100, "Designation must be less than 100 characters"),
      })
      .strict(),
    specialties: z
      .array(z.uuid())
      .min(1, "At least one specialty ID is required"),
  }),
});

export const userValidation = {
  createDoctorSchema,
};
