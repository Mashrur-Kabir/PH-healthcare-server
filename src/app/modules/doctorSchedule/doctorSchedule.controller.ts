import { Request, Response } from "express";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";
import { catchAsync } from "../../shared/catchAsync";
import { DoctorScheduleService } from "./doctorSchedule.service";
import sendResponse from "../../shared/sendResponse";

const createMyDoctorSchedule = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const user = req.user;
    const doctorSchedule =
      await DoctorScheduleService.createMyDoctorScheduleInDB(user, payload);
    sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: "Doctor schedule created successfully",
      data: doctorSchedule,
    });
  },
);

const getMyDoctorSchedules = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const query = req.query;
  const result = await DoctorScheduleService.getMyDoctorSchedulesFromDB(
    user,
    query as IQueryParams,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Doctor schedules retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getAllDoctorSchedules = catchAsync(
  async (req: Request, res: Response) => {
    const query = req.query;
    const result = await DoctorScheduleService.getAllDoctorSchedulesFromDB(
      query as IQueryParams,
    );
    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "All doctor schedules retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  },
);

const getDoctorScheduleById = catchAsync(
  async (req: Request, res: Response) => {
    const doctorId = req.params.doctorId;
    const scheduleId = req.params.scheduleId;
    const doctorSchedule =
      await DoctorScheduleService.getDoctorScheduleByIdFromDB(
        doctorId as string,
        scheduleId as string,
      );
    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Doctor schedule retrieved successfully",
      data: doctorSchedule,
    });
  },
);

const updateMyDoctorSchedule = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const user = req.user;
    const updatedDoctorSchedule =
      await DoctorScheduleService.updateMyDoctorScheduleInDB(user, payload);
    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Doctor schedule updated successfully",
      data: updatedDoctorSchedule,
    });
  },
);

const deleteMyDoctorSchedule = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const user = req.user;
    await DoctorScheduleService.deleteMyDoctorScheduleFromDB(
      id as string,
      user,
    );
    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Doctor schedule deleted successfully",
      data: null,
    });
  },
);

export const DoctorScheduleController = {
  createMyDoctorSchedule,
  getMyDoctorSchedules,
  getAllDoctorSchedules,
  getDoctorScheduleById,
  updateMyDoctorSchedule,
  deleteMyDoctorSchedule,
};
