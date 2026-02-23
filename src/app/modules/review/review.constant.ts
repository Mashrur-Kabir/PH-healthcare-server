import { Prisma } from "../../../generated/prisma/client";

export const reviewSearchableFields = [
  "comment",
  "doctor.name",
  "patient.name",
];

export const reviewFilterableFields = [
  "rating",
  "patientId",
  "doctorId",
  "appointmentId",
];

export const reviewIncludeConfig: Partial<
  Record<
    keyof Prisma.ReviewInclude,
    Prisma.ReviewInclude[keyof Prisma.ReviewInclude]
  >
> = {
  doctor: true,
  patient: true,
  appointment: {
    include: {
      doctor: true,
      patient: true,
    },
  },
};
