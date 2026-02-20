import { Request, Response } from "express";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";
import { catchAsync } from "../../shared/catchAsync";
import { ScheduleService } from "./schedule.service";
import sendResponse from "../../shared/sendResponse";

const createSchedule = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const schedule = await ScheduleService.createScheduleInDB(payload);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Schedule created successfully",
    data: schedule,
  });
});

const getAllSchedules = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await ScheduleService.getAllSchedulesFromDB(
    query as IQueryParams,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Schedules retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getScheduleById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const schedule = await ScheduleService.getScheduleByIdFromDB(id as string);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Schedule retrieved successfully",
    data: schedule,
  });
});

const updateSchedule = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const updatedSchedule = await ScheduleService.updateScheduleInDB(
    id as string,
    payload,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Schedule updated successfully",
    data: updatedSchedule,
  });
});

const deleteSchedule = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await ScheduleService.deleteScheduleFromDB(id as string);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Schedule deleted successfully",
    data: null,
  });
});

export const ScheduleController = {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
};
