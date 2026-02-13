import { Gender } from "../../../generated/prisma/enums";

export interface ICreateDoctorPayload {
  password: string;
  doctor: {
    // Basic Info
    name: string;
    email: string;
    profileImg?: string;
    contactNumber?: string;
    address?: string;

    // Professional Info
    registrationNumber: string;
    experience?: number;
    gender: Gender;
    appointmentFee: number;
    qualification: string;
    currentWorkingPlace: string;
    designation: string;
  };
  // The "Bridge" IDs
  // We send an array of IDs from the frontend to link specialties
  specialties: string[];
}

export interface ICreateAdminPayload {
  password: string;
  admin: {
    name: string;
    email: string;
    profilePhoto?: string;
    contactNumber: string;
  };
}

export interface ICreateSuperAdminPayload {
  password: string;
  superAdmin: {
    name: string;
    email: string;
    profilePhoto?: string;
    contactNumber: string;
  };
}
