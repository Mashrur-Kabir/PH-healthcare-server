import { Request, Response } from "express";
import { AppError } from "../../error/AppError";
import { catchAsync } from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { specialtyService } from "./specialty.service";
import status from "http-status";

const createSpecialty = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  if (!payload) {
    throw new AppError(400, "Request body/payload missing!");
  }

  const result = await specialtyService.createSpecialtyInDB(payload);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Specialty created successfully",
    data: result,
  });
});

const getAllSpecialty = catchAsync(async (req: Request, res: Response) => {
  const result = await specialtyService.getAllSpecialtyInDB();

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "All specialty fetched successfully",
    data: result,
  });
});

const getSingleSpecialty = catchAsync(async (req: Request, res: Response) => {
  const { specialtyId } = req.params;

  const result = await specialtyService.getSingleSpecialtyFromDB(
    specialtyId as string,
  );

  if (!result) {
    throw new AppError(status.NOT_FOUND, "Specialty not found!");
  }

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Specialty fetched successfully",
    data: result,
  });
});

const updateSpecialty = catchAsync(async (req: Request, res: Response) => {
  const { specialtyId } = req.params;
  const payload = req.body;

  const result = await specialtyService.updateSpecialtyInDB(
    specialtyId as string,
    payload,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Specialty updated successfully",
    data: result,
  });
});

const deleteSpecialty = catchAsync(async (req: Request, res: Response) => {
  const { specialtyId } = req.params;

  if (!specialtyId) throw new AppError(400, "Specialty Id is required");

  const result = await specialtyService.deleteSpecialtyInDB(
    specialtyId as string,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Specialty deleted successfully",
    data: result,
  });
});

export const specialtyController = {
  createSpecialty,
  getAllSpecialty,
  getSingleSpecialty,
  updateSpecialty,
  deleteSpecialty,
};
