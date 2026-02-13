import status from "http-status";
import { Role, Specialty } from "../../../generated/prisma/client";
import { AppError } from "../../error/AppError";
import { prisma } from "../../lib/prisma";
import {
  ICreateAdminPayload,
  ICreateDoctorPayload,
  ICreateSuperAdminPayload,
} from "./user.interface";
import { auth } from "../../lib/auth";

const createDoctorInDB = async (payload: ICreateDoctorPayload) => {
  const specialties: Specialty[] = [];

  for (const specialtyId of payload.specialties) {
    const specialty = await prisma.specialty.findUnique({
      where: {
        id: specialtyId,
      },
    });
    if (!specialty) {
      throw new AppError(
        status.NOT_FOUND,
        `Specialty with id ${specialtyId} not found`,
      );
    }
    specialties.push(specialty);
  }

  const userExists = await prisma.user.findUnique({
    where: {
      email: payload.doctor.email,
    },
  });

  if (userExists) {
    throw new AppError(status.CONFLICT, "User with this email already exists");
  }

  const userData = await auth.api.signUpEmail({
    body: {
      name: payload.doctor.name,
      email: payload.doctor.email,
      password: payload.password,
      role: Role.DOCTOR,
      needPasswordChange: true,
      image: payload.doctor.profileImg,
    },
  });

  //Now you have a User ID, but the Doctor profile doesn't exist yet.
  try {
    const result = await prisma.$transaction(async (tx) => {
      if (payload.doctor.profileImg) {
        await tx.user.update({
          where: { id: userData.user.id },
          data: { image: payload.doctor.profileImg },
        });
      }

      const doctorData = await tx.doctor.create({
        data: {
          userId: userData.user.id,
          ...payload.doctor,
        },
      });
      const doctorSpecialtyData = specialties.map((specialty) => ({
        doctorId: doctorData.id,
        specialtyId: specialty.id,
      }));
      await tx.doctorSpecialty.createMany({
        //preparing the raw data to be inserted into the Physical Tables Doctor and Specialty.
        data: doctorSpecialtyData,
      });

      const doctor = await tx.doctor.findUnique({
        where: {
          id: doctorData.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          profileImg: true,
          contactNumber: true,
          address: true,
          registrationNumber: true,
          experience: true,
          gender: true,
          appointmentFee: true,
          qualification: true,
          currentWorkingPlace: true,
          designation: true,
          isDeleted: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              image: true,
              status: true,
              isDeleted: true,
              deletedAt: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          specialties: {
            select: {
              specialty: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
      });
      return doctor;
    });
    return result;
  } catch (_error) {
    await prisma.user.delete({
      where: {
        id: userData.user.id,
      },
    });
    throw new AppError(
      status.BAD_REQUEST,
      "Failed to register doctor, Try again later",
    );
  }
};

const createAdminInDB = async (payload: ICreateAdminPayload) => {
  // 1. Check if user already exists in the database
  const userExists = await prisma.user.findUnique({
    where: { email: payload.admin.email },
  });

  if (userExists) {
    throw new AppError(status.CONFLICT, "User with this email already exists");
  }

  // 2. Register User in Better-Auth
  const userData = await auth.api.signUpEmail({
    body: {
      name: payload.admin.name,
      email: payload.admin.email,
      password: payload.password,
      role: Role.ADMIN,
      needPasswordChange: true,
      image: payload.admin.profilePhoto,
    },
  });

  try {
    // 3. Create Admin profile in a transaction
    return await prisma.$transaction(async (tx) => {
      // Update the central User record with the profile photo
      if (payload.admin.profilePhoto) {
        await tx.user.update({
          where: { id: userData.user.id },
          data: { image: payload.admin.profilePhoto },
        });
      }

      const adminData = await tx.admin.create({
        data: {
          userId: userData.user.id,
          ...payload.admin,
        },
      });

      // 4. Return the complete profile including User data
      return await tx.admin.findUnique({
        where: { id: adminData.id },
        include: { user: true },
      });
    });
  } catch (_error) {
    // 5. Manual Rollback: Delete the User from Better-Auth if profile creation fails
    await prisma.user.delete({
      where: { id: userData.user.id },
    });
    throw new AppError(
      status.BAD_REQUEST,
      "Failed to create Admin profile, rolling back user registration.",
    );
  }
};

const createSuperAdminInDB = async (payload: ICreateSuperAdminPayload) => {
  const userExists = await prisma.user.findUnique({
    where: { email: payload.superAdmin.email },
  });

  if (userExists) {
    throw new AppError(status.CONFLICT, "User with this email already exists");
  }

  const userData = await auth.api.signUpEmail({
    body: {
      name: payload.superAdmin.name,
      email: payload.superAdmin.email,
      password: payload.password,
      role: Role.SUPER_ADMIN, // Set as SUPER_ADMIN
      needPasswordChange: true,
      image: payload.superAdmin.profilePhoto,
    },
  });

  try {
    return await prisma.$transaction(async (tx) => {
      // Sync image to User table
      if (payload.superAdmin.profilePhoto) {
        await tx.user.update({
          where: { id: userData.user.id },
          data: { image: payload.superAdmin.profilePhoto },
        });
      }

      // Use the 'admin' table for the profile data
      const superAdminData = await tx.admin.create({
        data: {
          userId: userData.user.id,
          ...payload.superAdmin,
        },
      });

      return await tx.admin.findUnique({
        where: { id: superAdminData.id },
        include: { user: true },
      });
    });
  } catch (_error) {
    await prisma.user.delete({ where: { id: userData.user.id } });
    throw new AppError(
      status.BAD_REQUEST,
      "Failed to create Super Admin profile",
    );
  }
};

export const userService = {
  createDoctorInDB,
  createAdminInDB,
  createSuperAdminInDB,
};
