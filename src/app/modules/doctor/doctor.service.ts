import status from "http-status";
import { AppError } from "../../error/AppError";
import { prisma } from "../../lib/prisma";
import { IUpdateDoctorPayload } from "./doctor.interface";
import { UserStatus } from "../../../generated/prisma/enums";
import { Doctor, Prisma } from "../../../generated/prisma/client";
import { QueryBuilder } from "../../utils/QueryBuilder";
import {
  doctorFilterableFields,
  doctorIncludeConfig,
  doctorSearchableFields,
} from "./doctor.constant";
import { IQueryParams } from "../../interfaces";

const getAllDoctorsFromDB = async (query: IQueryParams) => {
  // const doctors = await prisma.doctor.findMany({
  //   where: {
  //     isDeleted: false,
  //   },
  //   include: {
  //     user: {
  //       select: {
  //         id: true,
  //         email: true,
  //         role: true,
  //         status: true,
  //         image: true,
  //       },
  //     },
  //     specialties: {
  //       select: {
  //         specialty: true,
  //       },
  //     },
  //   },
  // });

  // return doctors;

  const queryBuilder = new QueryBuilder<
    Doctor,
    Prisma.DoctorWhereInput,
    Prisma.DoctorInclude
  >(prisma.doctor, query, {
    searchableFields: doctorSearchableFields,
    filterableFields: doctorFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .where({
      isDeleted: false,
    })
    .include({
      user: true,
      // specialties: true,
      specialties: {
        include: {
          specialty: true,
        },
      },
    })
    .dynamicInclude(doctorIncludeConfig)
    .paginate()
    .sort()
    .fields()
    .execute();

  console.log(result);
  return result;
};

const getDoctorByIdFromDB = async (id: string) => {
  return await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      user: true,
      specialties: {
        select: { specialty: true },
      },
      appointments: {
        include: {
          patient: true,
          doctor: true,
          schedule: true,
          prescription: true,
        },
      },
      doctorSchedules: {
        include: {
          schedule: true,
        },
      },
      reviews: true,
    },
  });
};

const updateDoctorInDB = async (id: string, payload: IUpdateDoctorPayload) => {
  const { specialties, doctor: doctorData } = payload;

  // 1. CHECK EXISTENCE
  const isExist = await prisma.doctor.findUnique({
    where: { id, isDeleted: false },
  });

  if (!isExist) {
    throw new AppError(
      status.NOT_FOUND,
      "Doctor not found or has been deleted.",
    );
  }

  // 2. BLOCK DELETION via Update
  if (doctorData?.isDeleted === true) {
    throw new AppError(
      status.BAD_REQUEST,
      "Please use the dedicated Delete API to deactivate a doctor profile.",
    );
  }

  return await prisma.$transaction(async (tx) => {
    // 3. Update Doctor Table if doctor data is provided
    if (doctorData && Object.keys(doctorData).length > 0) {
      await tx.doctor.update({
        where: { id },
        data: doctorData,
      });

      // 4. SYNC TO USER TABLE (Name and Image)
      const userUpdateData: Prisma.UserUpdateInput = {};
      if (doctorData.name) userUpdateData.name = doctorData.name;
      if (doctorData.profileImg) userUpdateData.image = doctorData.profileImg;

      if (Object.keys(userUpdateData).length > 0) {
        await tx.user.update({
          where: { id: isExist.userId },
          data: userUpdateData,
        });
      }

      // 5. REVIVAL LOGIC
      if (doctorData.isDeleted === false) {
        await tx.user.update({
          where: { id: isExist.userId },
          data: {
            isDeleted: false,
            status: UserStatus.ACTIVE,
            deletedAt: null,
          },
        });

        await tx.doctor.update({
          where: { id },
          data: { deletedAt: null },
        });
      }
    }

    // 6. Specialty Handling
    if (specialties && specialties.length > 0) {
      for (const specialty of specialties) {
        const { specialtyId, shouldDelete } = specialty;

        if (shouldDelete) {
          // Only delete the specific link if requested
          await tx.doctorSpecialty.delete({
            where: {
              doctorId_specialtyId: {
                doctorId: id,
                specialtyId,
              },
            },
          });
        } else {
          // Add if it doesn't exist, ignore if it does
          await tx.doctorSpecialty.upsert({
            where: {
              doctorId_specialtyId: {
                doctorId: id,
                specialtyId,
              },
            },
            create: {
              doctorId: id,
              specialtyId,
            },
            update: {}, // No update needed for junction tables
          });
        }
      }
    }

    // 7. Final Fetch to return fully synced and populated data
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
    const now = new Date();

    // 1. Soft delete from Doctor table
    const deletedDoctor = await tx.doctor.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: now,
      },
    });

    // 2. Soft delete the associated User account
    await tx.user.update({
      where: { id: doctor.userId },
      data: {
        isDeleted: true,
        status: UserStatus.DELETED,
        deletedAt: now,
      },
    });

    // 3. SECURITY: Kick the user out (Better-Auth sessions)
    // This prevents the doctor from continuing to use the app if they were logged in
    await tx.session.deleteMany({
      where: { userId: doctor.userId },
    });

    // 4. CLEANUP: Remove specialties bridge entries
    // This is optional for soft-delete, but keeps your junction table clean
    // await tx.doctorSpecialty.deleteMany({
    //   where: { doctorId: id },
    // });

    return deletedDoctor;
  });
};

export const doctorService = {
  getAllDoctorsFromDB,
  getDoctorByIdFromDB,
  updateDoctorInDB,
  softDeleteDoctorFromDB,
};
