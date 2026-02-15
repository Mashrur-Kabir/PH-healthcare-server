import { Role, UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ISuperAdminUpdatePayload } from "./superAdmin.interface";
import { AppError } from "../../error/AppError";
import status from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import { IAuthUser } from "../../interfaces";

const getAllSuperAdminsFromDB = async () => {
  return await prisma.admin.findMany({
    where: {
      isDeleted: false,
      user: { role: Role.SUPER_ADMIN }, // Filter specifically for Super Admins
    },
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

const getSuperAdminByIdFromDB = async (id: string) => {
  return await prisma.admin.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
      user: { role: Role.SUPER_ADMIN },
    },
    include: { user: true },
  });
};

const updateSuperAdminInDB = async (
  id: string,
  payload: ISuperAdminUpdatePayload,
) => {
  const isExist = await prisma.admin.findUnique({
    where: { id, isDeleted: false },
  });

  if (!isExist) {
    throw new AppError(status.NOT_FOUND, "Super Admin not found or deleted.");
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Update Profile
    await tx.admin.update({
      where: { id },
      data: payload,
    });

    // 2. Sync User table fields (Type-safe)
    const userUpdateData: Prisma.UserUpdateInput = {};
    if (payload.name) userUpdateData.name = payload.name;
    if (payload.profilePhoto) userUpdateData.image = payload.profilePhoto;

    if (Object.keys(userUpdateData).length > 0) {
      await tx.user.update({
        where: { id: isExist.userId },
        data: userUpdateData,
      });
    }

    // 3. RE-FETCH so the returned object is fully synced
    return await tx.admin.findUnique({
      where: { id },
      include: { user: true },
    });
  });
};

const softDeleteSuperAdminFromDB = async (
  id: string,
  currentUser: IAuthUser,
) => {
  const admin = await prisma.admin.findUnique({
    where: { id, isDeleted: false },
  });

  if (!admin) {
    throw new AppError(
      status.NOT_FOUND,
      "Super Admin not found or already deleted.",
    );
  }

  // SECURITY: Prevent self-deletion (Administrative Lockdown prevention)
  if (admin.userId === currentUser.id) {
    throw new AppError(
      status.BAD_REQUEST,
      "Security Error: You cannot delete your own account.",
    );
  }

  return await prisma.$transaction(async (tx) => {
    const now = new Date();

    // 1. Soft delete Admin record
    const deletedSuperAdmin = await tx.admin.update({
      where: { id },
      data: { isDeleted: true, deletedAt: now },
    });

    // 2. Soft delete User record & set status
    await tx.user.update({
      where: { id: admin.userId },
      data: {
        isDeleted: true,
        status: UserStatus.DELETED,
        deletedAt: now,
      },
    });

    // 3. KICK OUT: Immediate session revocation for security
    await tx.session.deleteMany({
      where: { userId: admin.userId },
    });

    // 4. CLEANUP: Delete OAuth accounts/Better-Auth linkages
    await tx.account.deleteMany({
      where: { userId: admin.userId },
    });

    return deletedSuperAdmin;
  });
};

export const superAdminService = {
  getAllSuperAdminsFromDB,
  getSuperAdminByIdFromDB,
  updateSuperAdminInDB,
  softDeleteSuperAdminFromDB,
};
