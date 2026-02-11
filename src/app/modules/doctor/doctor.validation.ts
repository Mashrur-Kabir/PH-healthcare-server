import { z } from "zod";
import { Gender } from "../../../generated/prisma/enums";

const updateDoctorSchema = z.object({
  body: z
    .object({
      name: z.string(),
      profileImg: z.url("Invalid profile image URL"),
      contactNumber: z.string().length(11, "Contact number must be 11 digits"),
      address: z.string(),
      isDeleted: z.boolean(),
      registrationNumber: z.string(),
      experience: z.number().int().nonnegative(),
      gender: z.enum([Gender.MALE, Gender.FEMALE]),
      appointmentFee: z.number().positive("Fee must be a positive number"),
      qualification: z.string(),
      currentWorkingPlace: z.string(),
      designation: z
        .string()
        .min(2, "Designation must be at least 2 characters")
        .max(100, "Designation must be less than 100 characters"),
      specialties: z.array(z.uuid("Invalid Specialty ID format")),
    })
    .partial() //use optional() when there is a "must-update" field
    .strict(),
});

export const doctorValidation = {
  updateDoctorSchema,
};
