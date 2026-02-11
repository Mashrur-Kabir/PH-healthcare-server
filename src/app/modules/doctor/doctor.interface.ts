import { Gender } from "../../../generated/prisma/enums";

export interface IUpdateDoctorPayload {
  // Basic Info (updates the Doctor table)
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

  // Bridge Table logic
  // Used to replace or add new specialties
  specialties?: string[];
}
