1. for http status:
   install:
   npm i http-status

2. handling the Global Express.Request. inside ./src/apps/types/index.d.ts:
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
   };
   }
   }
   }
