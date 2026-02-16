import { UserStatus } from "../../../generated/prisma/enums";
import { AppError } from "../../error/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import status from "http-status";
import {
  IChangePasswordPayload,
  ILoginPatientPayload,
  IRegisterPatientPayload,
} from "./auth.interface";
import { tokenUtils } from "../../utils/token";
import { IAuthUser } from "../../interfaces";
import { jwtHelpers } from "../../utils/jwt";
import { envVars } from "../../../config/env";

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
    //passed a flat object as the payload
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

const getNewTokenService = async (
  refreshToken: string,
  sessionToken: string,
) => {
  const sessionTokenData = await prisma.session.findUnique({
    where: {
      token: sessionToken,
    },
    include: {
      user: true,
    },
  });

  if (!sessionTokenData || !sessionTokenData.user) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Invalid session or user not found",
    );
  }

  const verifiedRefreshToken = jwtHelpers.verifyToken(
    refreshToken,
    envVars.REFRESH_TOKEN_SECRET,
  );

  const payload = verifiedRefreshToken;

  if (!payload || !payload.userId) {
    throw new AppError(status.UNAUTHORIZED, "Invalid refresh token payload");
  }

  const getNewAccessToken = tokenUtils.getAccessToken({
    userId: payload.userId,
    role: payload.role,
    name: payload.name,
    email: payload.email,
    status: payload.status,
    isDeleted: payload.isDeleted,
    emailVerified: payload.emailVerified,
  });

  const getNewRefreshToken = tokenUtils.getRefreshToken({
    userId: payload.userId,
    role: payload.role,
    name: payload.name,
    email: payload.email,
    status: payload.status,
    isDeleted: payload.isDeleted,
    emailVerified: payload.emailVerified,
  });

  const updatedSession = await prisma.session.update({
    where: {
      token: sessionToken, //Find the row with this token,
    },
    data: {
      //set token to the same value it already has. For a standard application, keeping the sessionToken the same but extending the expiry is perfectly fine. It’s exactly how most session managers work to avoid "session thrashing."
      token: sessionToken,
      // Standard: Refresh should extend the session by a meaningful amount,
      // e.g., 7 days from NOW, or keep the original (e.g., 'one-month') date.
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      updatedAt: new Date(),
    },
  });

  return {
    accessToken: getNewAccessToken,
    refreshToken: getNewRefreshToken,
    sessionToken: updatedSession.token, //<-- we don't need the whole session. just the token
  };
};

const changePasswordInDB = async (
  payload: IChangePasswordPayload,
  sessionToken: string,
) => {
  const session = await auth.api.getSession({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  if (!session) {
    throw new AppError(status.UNAUTHORIZED, "Invalid session token");
  }

  const { oldPassword, newPassword } = payload;

  // Better-Auth internal API call
  // This automatically verifies the old password and updates to the new one
  const result = await auth.api.changePassword({
    body: {
      newPassword,
      currentPassword: oldPassword,
      revokeOtherSessions: true, // Recommended: Log out other devices for security
    },
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  if (!result) {
    throw new AppError(
      status.BAD_REQUEST,
      "Failed to change password. Ensure old password is correct.",
    );
  }

  if (session.user.needPasswordChange) {
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        needPasswordChange: false,
      },
    });
  }

  //after this previous sessions will be removed. so we need to generate access and refresh token again:
  const accessToken = tokenUtils.getAccessToken({
    userId: result.user.id,
    role: result.user.role,
    name: result.user.name,
    email: result.user.email,
    status: result.user.status,
    isDeleted: result.user.isDeleted,
    emailVerified: result.user.emailVerified,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: result.user.id,
    role: result.user.role,
    name: result.user.name,
    email: result.user.email,
    status: result.user.status,
    isDeleted: result.user.isDeleted,
    emailVerified: result.user.emailVerified,
  });

  return {
    ...result,
    accessToken,
    refreshToken,
  };
};

const logoutUserInDB = async (sessionToken: string) => {
  const result = await auth.api.signOut({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  return result;
};

const verifyEmailForUser = async (email: string, otp: string) => {
  const result = await auth.api.verifyEmailOTP({
    body: {
      email,
      otp,
    },
  });

  if (result && !result.user.emailVerified) {
    await prisma.user.update({
      where: {
        email,
      },
      data: {
        emailVerified: true,
      },
    });
  }
};

const forgetPasswordForUser = async (email: string) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!isUserExist) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  if (!isUserExist.emailVerified) {
    throw new AppError(status.BAD_REQUEST, "Email not verified");
  }

  if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
    throw new AppError(status.NOT_FOUND, "User not found or deleted");
  }

  await auth.api.requestPasswordResetEmailOTP({
    body: {
      email,
    },
  });
};

const resetPasswordForUser = async (
  email: string,
  otp: string,
  newPassword: string,
) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!isUserExist) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  if (!isUserExist.emailVerified) {
    throw new AppError(status.BAD_REQUEST, "Email not verified");
  }

  if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
    throw new AppError(status.NOT_FOUND, "User not found or deleted");
  }

  await auth.api.resetPasswordEmailOTP({
    body: {
      email,
      otp,
      password: newPassword,
    },
  });

  if (isUserExist.needPasswordChange) {
    await prisma.user.update({
      where: {
        id: isUserExist.id,
      },
      data: {
        needPasswordChange: false,
      },
    });
  }

  await prisma.session.deleteMany({
    //delete session across all device, forcing the user to log in again.
    where: {
      userId: isUserExist.id,
    },
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const googleLoginSuccessForUser = async (session: Record<string, any>) => {
  const { user } = session;

  const isPatientExist = await prisma.patient.findUnique({
    where: { userId: user.id },
  });

  if (!isPatientExist) {
    await prisma.patient.create({
      data: {
        userId: user.id,
        name: user.name,
        email: user.email,
      },
    });
  }

  // Use the full payload to stay consistent with other login methods
  const tokenPayload = {
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    status: user.status,
    isDeleted: user.isDeleted,
    emailVerified: user.emailVerified,
  };

  const accessToken = tokenUtils.getAccessToken(tokenPayload);
  const refreshToken = tokenUtils.getRefreshToken(tokenPayload);

  return { accessToken, refreshToken };
};

export const AuthService = {
  registerPatientInDB,
  loginPatientInDB,
  getMeFromDB,
  getNewTokenService,
  changePasswordInDB,
  logoutUserInDB,
  verifyEmailForUser,
  forgetPasswordForUser,
  resetPasswordForUser,
  googleLoginSuccessForUser,
};
