import { z } from "zod";
import { AppointmentStatus } from "../../../generated/prisma/enums";

const bookAppointment = z.object({
  body: z.object({
    doctorId: z.string().min(1, "Doctor ID is required"),
    scheduleId: z.string().min(1, "Schedule ID is required"),
  }),
});

const changeAppointmentStatus = z.object({
  body: z.object({
    status: z.enum(Object.values(AppointmentStatus) as [string, ...string[]], {
      message: "Invalid appointment status",
    }),
  }),
});

export const AppointmentValidation = {
  bookAppointment,
  changeAppointmentStatus,
};
