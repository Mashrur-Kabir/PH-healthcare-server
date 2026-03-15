import { Role, UserStatus } from "../../../generated/prisma/enums";

export interface IAdminUpdatePayload {
  name?: string;
  profilePhoto?: string;
  contactNumber?: string;
  address?: string;
}

export interface IChangeUserStatusPayload {
  userId: string;
  userStatus: UserStatus;
}

export interface IChangeUserRolePayload {
  userId: string;
  role: Role;
}
