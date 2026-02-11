import status from "http-status";
import { AppError } from "../../error/AppError";
import { prisma } from "../../lib/prisma";
import { IUpdateDoctorPayload } from "./doctor.interface";
import { UserStatus } from "../../../generated/prisma/enums";

const getAllDoctorsFromDB = async () => {
  const doctors = await prisma.doctor.findMany({
    where: {
      isDeleted: false, // Essential: don't show deleted doctors in the list
    },
    include: {
      user: true,
      specialties: {
        select: {
          specialty: true,
        },
      },
    },
  });

  return doctors;
};

const getDoctorByIdFromDB = async (id: string) => {
  return await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false, // Only get if not soft-deleted
    },
    include: {
      user: true,
      specialties: {
        select: { specialty: true },
      },
    },
  });
};

const updateDoctorInDB = async (id: string, payload: IUpdateDoctorPayload) => {
  const { specialties, ...doctorData } = payload;

  // 1. BLOCK DELETION: If the payload tries to set isDeleted to true, throw an error
  if (payload.isDeleted === true) {
    throw new AppError(
      status.BAD_REQUEST,
      "Please use the dedicated Delete API to deactivate a doctor profile.",
    );
  }

  // 2. CHECK EXISTENCE: Find the doctor regardless of their current status
  const isExist = await prisma.doctor.findUnique({
    where: { id },
  });

  if (!isExist) {
    throw new AppError(status.NOT_FOUND, "Doctor not found.");
  }

  return await prisma.$transaction(async (tx) => {
    // 3. Update the Doctor profile
    const updatedDoctor = await tx.doctor.update({
      where: { id },
      data: doctorData,
    });

    // 4. REVIVAL LOGIC: If isDeleted is false, we restore the User too
    if (payload.isDeleted === false) {
      await tx.user.update({
        where: { id: updatedDoctor.userId },
        data: {
          isDeleted: false,
          status: UserStatus.ACTIVE,
          deletedAt: null,
        },
      });

      // Clean up the Doctor's deletedAt timestamp
      await tx.doctor.update({
        where: { id },
        data: { deletedAt: null },
      });
    }

    // 5. Handle Specialties
    // Only proceed if specialties is provided AND has at least one item
    if (specialties && specialties.length > 0) {
      // Wipe old ones only when we are sure we have new ones to add
      await tx.doctorSpecialty.deleteMany({ where: { doctorId: id } });

      const doctorSpecialtyData = specialties.map((specialtyId) => ({
        doctorId: id,
        specialtyId,
      }));

      await tx.doctorSpecialty.createMany({ data: doctorSpecialtyData });
    }

    return await tx.doctor.findUnique({
      where: { id },
      include: {
        user: true,
        specialties: { select: { specialty: true } },
      },
    });
  });
};

const softDeleteDoctorFromDB = async (id: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id, isDeleted: false },
  });

  if (!doctor) {
    throw new AppError(status.NOT_FOUND, "Doctor not found or already deleted");
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Soft delete from Doctor table
    const deletedDoctor = await tx.doctor.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    // 2. Soft delete the associated User account
    await tx.user.update({
      where: { id: doctor.userId }, // You already have the userId in doctor.userId from your first check!
      data: {
        isDeleted: true,
        status: UserStatus.DELETED, // or your specific enum
        deletedAt: new Date(),
      },
    });

    return deletedDoctor;
  });
};

export const doctorService = {
  getAllDoctorsFromDB,
  getDoctorByIdFromDB,
  updateDoctorInDB,
  softDeleteDoctorFromDB,
};
