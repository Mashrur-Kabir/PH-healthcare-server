import { Role, UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import {
  IAdminUpdatePayload,
  IChangeUserRolePayload,
  IChangeUserStatusPayload,
} from "./admin.interface";
import { AppError } from "../../error/AppError";
import status from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import { IAuthUser } from "../../interfaces";

const getAllAdminsFromDB = async () => {
  return await prisma.admin.findMany({
    where: { isDeleted: false },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
        },
      },
    },
  });
};

const getAdminByIdFromDB = async (id: string) => {
  return await prisma.admin.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
    include: { user: true },
  });
};

const updateAdminInDB = async (id: string, payload: IAdminUpdatePayload) => {
  const isExist = await prisma.admin.findUnique({
    where: { id, isDeleted: false },
  });

  if (!isExist) {
    throw new AppError(
      status.NOT_FOUND,
      "Admin not found or has been deleted.",
    );
  }

  if (Object.keys(payload).length === 0) {
    return isExist;
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Update the Admin Profile
    await tx.admin.update({
      where: { id },
      data: payload,
    });

    // 2. Sync counterparts in the User table
    const userUpdateData: Prisma.UserUpdateInput = {};
    if (payload.name) userUpdateData.name = payload.name;
    if (payload.profilePhoto) userUpdateData.image = payload.profilePhoto;

    if (Object.keys(userUpdateData).length > 0) {
      await tx.user.update({
        where: { id: isExist.userId },
        data: userUpdateData,
      });
    }

    // 3. RE-FETCH the data so 'user' reflects the synced changes
    return await tx.admin.findUnique({
      where: { id },
      include: { user: true },
    });
  });
};

// Updated delete function signature to accept current user info
const softDeleteAdminFromDB = async (id: string, currentUser: IAuthUser) => {
  const admin = await prisma.admin.findUnique({
    where: { id, isDeleted: false },
  });

  if (!admin) {
    throw new AppError(status.NOT_FOUND, "Admin not found or already deleted.");
  }

  // VULNERABILITY FIX: Prevent self-deletion
  if (admin.userId === currentUser.id) {
    throw new AppError(
      status.BAD_REQUEST,
      "Security Error: You cannot delete your own account.",
    );
  }

  return await prisma.$transaction(async (tx) => {
    const now = new Date();

    const deletedAdmin = await tx.admin.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: now,
      },
    });

    await tx.user.update({
      where: { id: admin.userId },
      data: {
        isDeleted: true,
        status: UserStatus.DELETED,
        deletedAt: now,
      },
    });

    // SECURITY ENHANCEMENT: Immediate session termination
    await tx.session.deleteMany({
      where: { userId: admin.userId },
    });

    // DATA INTEGRITY: Remove OAuth/Linkage accounts
    await tx.account.deleteMany({
      where: { userId: admin.userId },
    });

    return deletedAdmin;
  });
};

const changeUserStatusInDB = async (
  user: IAuthUser,
  payload: IChangeUserStatusPayload,
) => {
  // 1. Super admin can change the status of any user (admin, doctor, patient). Except himself. He cannot change his own status.
  // 2. Admin can change the status of doctor and patient. Except himself. He cannot change his own status. He cannot change the status of super admin and other admin user.

  const isAdminExists = await prisma.admin.findUniqueOrThrow({
    where: {
      email: user.email,
    },
    include: {
      user: true,
    },
  });

  const { userId, userStatus } = payload;

  const userToChangeStatus = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });

  const selfStatusChange = isAdminExists.userId === userId;

  if (selfStatusChange) {
    throw new AppError(status.BAD_REQUEST, "You cannot change your own status");
  }

  if (
    isAdminExists.user.role === Role.ADMIN &&
    userToChangeStatus.role === Role.SUPER_ADMIN
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "You cannot change the status of super admin. Only super admin can change the status of another super admin",
    );
  }

  if (
    isAdminExists.user.role === Role.ADMIN &&
    userToChangeStatus.role === Role.ADMIN
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "You cannot change the status of another admin. Only super admin can change the status of another admin",
    );
  }

  if (userStatus === UserStatus.DELETED) {
    throw new AppError(
      status.BAD_REQUEST,
      "You cannot set user status to deleted. To delete a user, you have to use role specific delete api. For example, to delete an doctor user, you have to use delete doctor api which will set the user status to deleted and also set isDeleted to true and also delete the user session and account",
    );
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status: userStatus,
    },
  });

  return updatedUser;
};

const changeUserRoleInDB = async (
  user: IAuthUser,
  payload: IChangeUserRolePayload,
) => {
  // 1. Super admin can change the role of only other super admin and admin user. He cannot change his own role.
  // 2. Admin cannot change role of any user
  // 3. Role of Patient and Doctor user cannot be changed by anyone. If needed, they have to be deleted and recreated with new role.

  const isSuperAdminExists = await prisma.admin.findFirstOrThrow({
    where: {
      email: user.email,
      user: {
        role: Role.SUPER_ADMIN,
      },
    },
    include: {
      user: true,
    },
  });

  const { userId, role } = payload;

  const userToChangeRole = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });

  const selfRoleChange = isSuperAdminExists.userId === userId;

  if (selfRoleChange) {
    throw new AppError(status.BAD_REQUEST, "You cannot change your own role");
  }

  if (
    userToChangeRole.role === Role.DOCTOR ||
    userToChangeRole.role === Role.PATIENT
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "You cannot change the role of doctor or patient user. If you want to change the role of doctor or patient user, you have to delete the user and recreate with new role",
    );
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      role,
    },
  });

  return updatedUser;
};

export const AdminService = {
  getAllAdminsFromDB,
  getAdminByIdFromDB,
  updateAdminInDB,
  softDeleteAdminFromDB,
  changeUserStatusInDB,
  changeUserRoleInDB,
};
