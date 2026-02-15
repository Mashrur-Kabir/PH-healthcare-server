import { Role, UserStatus } from "../../generated/prisma/enums";

export interface IAuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  emailVerified: boolean;
  status?: UserStatus;
  image?: string | null;
  isDeleted?: boolean;
}
