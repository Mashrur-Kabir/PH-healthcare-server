import { Specialty } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createSpecialtyInDB = async (payload: Specialty): Promise<Specialty> => {
  const specialty = await prisma.specialty.create({
    data: payload,
  });

  return specialty;
};

const getAllSpecialtyInDB = async (): Promise<Specialty[]> => {
  const specialties = await prisma.specialty.findMany();

  return specialties;
};

const getSingleSpecialtyFromDB = async (
  id: string,
): Promise<Specialty | null> => {
  const specialty = await prisma.specialty.findUnique({
    where: {
      id,
      isDeleted: false, // Ensures we don't fetch soft-deleted items
    },
  });

  return specialty;
};

const updateSpecialtyInDB = async (
  id: string,
  payload: Partial<Specialty>,
): Promise<Specialty> => {
  const specialty = await prisma.specialty.update({
    where: { id },
    data: payload,
  });

  return specialty;
};

const deleteSpecialtyInDB = async (id: string): Promise<Specialty> => {
  const specialty = await prisma.specialty.delete({
    where: { id },
  });

  return specialty;
};

export const specialtyService = {
  createSpecialtyInDB,
  getAllSpecialtyInDB,
  getSingleSpecialtyFromDB,
  updateSpecialtyInDB,
  deleteSpecialtyInDB,
};
