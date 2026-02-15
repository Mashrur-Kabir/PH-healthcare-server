import { Gender } from "../../../generated/prisma/enums";

export interface IUpdateDoctorSpecialtyPayload {
  specialtyId: string;
  shouldDelete: boolean;
}

export interface IUpdateDoctorPayload {
  // Basic Info (updates the Doctor table)
  doctor?: {
    name?: string;
    profileImg?: string;
    contactNumber?: string;
    address?: string;

    //Status Management
    isDeleted?: boolean;

    // Professional Info (updates the Doctor table)
    registrationNumber?: string;
    experience?: number;
    gender?: Gender;
    appointmentFee?: number;
    qualification?: string;
    currentWorkingPlace?: string;
    designation?: string;
  };

  // Bridge Table logic
  // Used to replace or add new specialties
  specialties?: IUpdateDoctorSpecialtyPayload[];
}
