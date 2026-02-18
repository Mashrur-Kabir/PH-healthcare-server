import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { Request, Response } from "express";
import { doctorService } from "./doctor.service";
import { IQueryParams } from "../../interfaces/query.interface";

const getAllDoctors = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const result = await doctorService.getAllDoctorsFromDB(query as IQueryParams);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "All doctors fetched successfully",
    meta: result.meta, // Pass meta here
    data: result.data, // Pass the array here
  });
});

const getDoctorById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await doctorService.getDoctorByIdFromDB(id as string);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Doctor fetched successfully",
    data: result,
  });
});

const updateDoctor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await doctorService.updateDoctorInDB(id as string, req.body);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Doctor updated successfully",
    data: result,
  });
});

const softDeleteDoctor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await doctorService.softDeleteDoctorFromDB(id as string);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Doctor deleted successfully",
    data: result,
  });
});

export const doctorController = {
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  softDeleteDoctor,
};
