import { Role, UserStatus } from "../../generated/prisma/enums";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: Role;
        emailVerified: boolean;
        status?: UserStatus;
        image?: string | null;
        isDeleted?: boolean;
      };
    }
  }
}
