import { z } from "zod";

const createMyDoctorSchedule = z.object({
  body: z.object({
    scheduleIds: z
      .array(z.string("Schedule ID must be a string"))
      .min(1, "At least one schedule ID must be provided"),
  }),
});

const updateMyDoctorSchedule = z.object({
  body: z.object({
    scheduleIds: z
      .array(
        z.object({
          shouldDelete: z.boolean(),
          id: z.string().min(3, "Schedule ID is required"),
        }),
      )
      .min(1, "Schedule update list cannot be empty"),
  }),
});

export const DoctorScheduleValidation = {
  createMyDoctorSchedule,
  updateMyDoctorSchedule,
};
