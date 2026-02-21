import { addMinutes, format } from "date-fns";
import { Prisma, Schedule } from "../../../generated/prisma/client";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import {
  ICreateSchedulePayload,
  IUpdateSchedulePayload,
} from "./schedule.interface";
import { convertDateTime } from "../../helpers/dateTimeConvert";
import {
  scheduleFilterableFields,
  scheduleIncludeConfig,
  scheduleSearchableFields,
} from "./schedule.constant";
import { AppError } from "../../error/AppError";
import status from "http-status";

const createScheduleInDB = async (payload: ICreateSchedulePayload) => {
  const { startDate, endDate, startTime, endTime } = payload;
  const interval = 30;

  // Guardrail
  if (startTime >= endTime) {
    throw new AppError(
      status.BAD_REQUEST,
      "Start time must be earlier than end time!",
    );
  }

  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);
  const allScheduleData = [];

  while (currentDate <= lastDate) {
    const dateStr = format(currentDate, "yyyy-MM-dd");

    // Construct local reference points
    let currentSlotStart = new Date(`${dateStr}T${startTime}:00`);
    const dayEnd = new Date(`${dateStr}T${endTime}:00`);

    while (currentSlotStart < dayEnd) {
      const currentSlotEnd = addMinutes(currentSlotStart, interval);

      allScheduleData.push({
        startDateTime: convertDateTime(currentSlotStart),
        endDateTime: convertDateTime(currentSlotEnd),
      });

      currentSlotStart = currentSlotEnd;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Optimized: Single database trip with duplicate prevention
  await prisma.schedule.createMany({
    data: allScheduleData,
    skipDuplicates: true,
  });

  // Re-fetch to return actual data
  return await prisma.schedule.findMany({
    where: {
      startDateTime: {
        gte: convertDateTime(new Date(`${startDate}T${startTime}:00`)),
      },
      endDateTime: {
        lte: convertDateTime(new Date(`${endDate}T${endTime}:00`)),
      },
    },
    orderBy: { startDateTime: "asc" },
  });
};

const getAllSchedulesFromDB = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    Schedule,
    Prisma.ScheduleWhereInput,
    Prisma.ScheduleInclude
  >(prisma.schedule, query, {
    searchableFields: scheduleSearchableFields,
    filterableFields: scheduleFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .paginate()
    .dynamicInclude(scheduleIncludeConfig)
    .sort()
    .fields()
    .execute();

  return result;
};

const getScheduleByIdFromDB = async (id: string) => {
  const schedule = await prisma.schedule.findUnique({
    where: {
      id: id,
    },
  });
  return schedule;
};

// refactoring - doctor's appointment or booked slot conflict check
const updateScheduleInDB = async (
  id: string,
  payload: Partial<IUpdateSchedulePayload>,
) => {
  const { startDate, endDate, startTime, endTime } = payload;

  // 1. Fetch the existing schedule so we have fallbacks for missing fields
  const existingSchedule = await prisma.schedule.findUniqueOrThrow({
    where: { id },
  });

  // 2. Helper to extract the date/time digits without local timezone interference
  const getUTCString = (date: Date) => date.toISOString(); // e.g., "2026-04-01T03:00:00.000Z"

  // 3. Merge: Use the payload value IF provided, otherwise use the DB value
  const dateForStart =
    startDate || getUTCString(existingSchedule.startDateTime).split("T")[0];
  const dateForEnd =
    endDate || getUTCString(existingSchedule.endDateTime).split("T")[0];

  const timeForStart =
    startTime ||
    getUTCString(existingSchedule.startDateTime).split("T")[1].substring(0, 5);
  const timeForEnd =
    endTime ||
    getUTCString(existingSchedule.endDateTime).split("T")[1].substring(0, 5);

  // 4. Use your helper to ensure the final Date object is "Pure UTC"
  // This keeps the Create and Update logic perfectly synchronized
  const startDateTime = new Date(`${dateForStart}T${timeForStart}:00Z`);
  const endDateTime = new Date(`${dateForEnd}T${timeForEnd}:00Z`);

  const updatedSchedule = await prisma.schedule.update({
    where: { id },
    data: {
      startDateTime,
      endDateTime,
    },
  });

  return updatedSchedule;
};

const deleteScheduleFromDB = async (id: string) => {
  await prisma.schedule.delete({
    where: {
      id: id,
    },
  });
  return true;
};

export const ScheduleService = {
  createScheduleInDB,
  getAllSchedulesFromDB,
  getScheduleByIdFromDB,
  updateScheduleInDB,
  deleteScheduleFromDB,
};
