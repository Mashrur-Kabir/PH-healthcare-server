import { UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { IAdminUpdatePayload } from "./admin.interface";
import { AppError } from "../../error/AppError";
import status from "http-status";
import { Prisma } from "../../../generated/prisma/client";

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

const softDeleteAdminFromDB = async (id: string) => {
  // 1. Fetch the admin first to get the userId for the transaction
  const admin = await prisma.admin.findUnique({
    where: { id, isDeleted: false },
  });

  if (!admin) {
    throw new AppError(status.NOT_FOUND, "Admin not found or already deleted.");
  }

  return await prisma.$transaction(async (tx) => {
    const now = new Date();

    // 2. Soft delete the Admin profile
    const deletedAdmin = await tx.admin.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: now,
      },
    });

    // 3. Sync the User account status to DELETED
    await tx.user.update({
      where: { id: admin.userId },
      data: {
        isDeleted: true,
        status: UserStatus.DELETED,
        deletedAt: now,
      },
    });

    return deletedAdmin;
  });
};

export const adminService = {
  getAllAdminsFromDB,
  getAdminByIdFromDB,
  updateAdminInDB,
  softDeleteAdminFromDB,
};
