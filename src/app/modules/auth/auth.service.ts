import { UserStatus } from "../../../generated/prisma/enums";
import { AppError } from "../../error/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import status from "http-status";
import {
  ILoginPatientPayload,
  IRegisterPatientPayload,
} from "./auth.interface";
import { tokenUtils } from "../../utils/token";
import { IAuthUser } from "../../interfaces";

const registerPatientInDB = async (payload: IRegisterPatientPayload) => {
  const { name, email, password, image } = payload;

  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
      image,
      //default values:
      //needPasswordChange: false,
      //role: Role.PATIENT,
      //....etc
    },
  });

  if (!data.user) {
    throw new AppError(status.BAD_REQUEST, "Failed to register user");
  }

  // create Patient Profile in Transaction after sign up of Patient as a User
  try {
    const patient = await prisma.$transaction(async (tx) => {
      const patientTx = await tx.patient.create({
        data: {
          userId: data.user.id,
          name: payload.name,
          email: payload.email,
        },
      });

      return patientTx;
    });

    const accessToken = tokenUtils.getAccessToken({
      userId: data.user.id,
      role: data.user.role,
      name: data.user.name,
      email: data.user.email,
      status: data.user.status,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified,
    });

    const refreshToken = tokenUtils.getRefreshToken({
      userId: data.user.id,
      role: data.user.role,
      name: data.user.name,
      email: data.user.email,
      status: data.user.status,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified,
    });

    return {
      accessToken,
      refreshToken,
      ...data,
      patient,
    };
  } catch (_error) {
    await prisma.user.delete({
      where: {
        id: data.user.id,
      },
    });
    throw new AppError(
      status.BAD_REQUEST,
      "Failed to register patient, Try again later",
    );
  }
};

const loginPatientInDB = async (payload: ILoginPatientPayload) => {
  const { email, password } = payload;

  const data = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });

  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError(
      status.FORBIDDEN,
      "The user you're trying to login as is blocked",
    );
  }

  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new AppError(
      status.NOT_FOUND,
      "The user you're trying to login as is not found",
    );
  }

  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });

  return {
    ...data,
    accessToken,
    refreshToken,
  };
};

const getMeFromDB = async (user: IAuthUser) => {
  // Fetch the user with their specific profile based on role
  const result = await prisma.user.findUnique({
    where: {
      id: user.id,
      isDeleted: false,
    },
    include: {
      patient: {
        include: {
          appointments: true,
          reviews: true,
          prescriptions: true,
          patientHealthData: true,
        },
      },
      doctor: {
        include: {
          specialties: true,
          appointments: true,
          reviews: true,
          prescriptions: true,
        },
      },
      admin: true,
    },
  });

  if (!result) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  return result;
};

export const AuthService = {
  registerPatientInDB,
  loginPatientInDB,
  getMeFromDB,
};
