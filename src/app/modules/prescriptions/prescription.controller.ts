import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { PrescriptionService } from "./prescription.service";
import sendResponse from "../../shared/sendResponse";

const givePrescription = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const user = req.user;
  const result = await PrescriptionService.givePrescription(user, payload);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Prescription created successfully",
    data: result,
  });
});

const myPrescriptions = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await PrescriptionService.myPrescriptions(user);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Prescription fetched successfully",
    data: result,
  });
});

const getAllPrescriptions = catchAsync(async (req: Request, res: Response) => {
  const result = await PrescriptionService.getAllPrescriptions();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Prescriptions retrieval successfully",
    data: result,
  });
});

const updatePrescription = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const prescriptionId = req.params.id;
  const payload = req.body;
  const result = await PrescriptionService.updatePrescription(
    user,
    prescriptionId as string,
    payload,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Prescription updated successfully",
    data: result,
  });
});

const deletePrescription = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const prescriptionId = req.params.id;
  await PrescriptionService.deletePrescription(user, prescriptionId as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Prescription deleted successfully",
    data: null,
  });
});

export const PrescriptionController = {
  givePrescription,
  myPrescriptions,
  getAllPrescriptions,
  updatePrescription,
  deletePrescription,
};
