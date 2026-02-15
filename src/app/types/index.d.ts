import { IAuthUser } from "../interfaces";
declare global {
  namespace Express {
    interface Request {
      user: IAuthUser;
    }
  }
}
