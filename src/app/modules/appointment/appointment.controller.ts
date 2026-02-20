import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { AppointmentService } from "./appointment.service";
import sendResponse from "../../shared/sendResponse";

const bookAppointment = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const user = req.user;
  const appointment = await AppointmentService.bookAppointmentInDB(
    payload,
    user,
  );
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Appointment booked successfully",
    data: appointment,
  });
});

const getMyAppointments = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const appointments = await AppointmentService.getMyAppointmentsFromDB(user);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Appointments retrieved successfully",
    data: appointments,
  });
});

const changeAppointmentStatus = catchAsync(
  async (req: Request, res: Response) => {
    const appointmentId = req.params.id;
    const payload = req.body;
    const user = req.user;

    const updatedAppointment =
      await AppointmentService.changeAppointmentStatusInDB(
        appointmentId as string,
        payload,
        user,
      );
    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Appointment status updated successfully",
      data: updatedAppointment,
    });
  },
);

const getMySingleAppointment = catchAsync(
  async (req: Request, res: Response) => {
    const appointmentId = req.params.id;
    const user = req.user;

    const appointment = await AppointmentService.getMySingleAppointmentFromDB(
      appointmentId as string,
      user,
    );
    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Appointment retrieved successfully",
      data: appointment,
    });
  },
);

const getAllAppointments = catchAsync(async (req: Request, res: Response) => {
  const appointments = await AppointmentService.getAllAppointmentsFromDB();
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "All appointments retrieved successfully",
    data: appointments,
  });
});

const bookAppointmentWithPayLater = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const user = req.user;
    const appointment =
      await AppointmentService.bookAppointmentWithPayLaterInDB(payload, user);
    sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: "Appointment booked successfully with Pay Later option",
      data: appointment,
    });
  },
);

const initiatePayment = catchAsync(async (req: Request, res: Response) => {
  const appointmentId = req.params.id;
  const user = req.user;
  const paymentInfo = await AppointmentService.initiatePaymentInDB(
    appointmentId as string,
    user,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Payment initiated successfully",
    data: paymentInfo,
  });
});

export const AppointmentController = {
  bookAppointment,
  getMyAppointments,
  changeAppointmentStatus,
  getMySingleAppointment,
  getAllAppointments,
  bookAppointmentWithPayLater,
  initiatePayment,
};
