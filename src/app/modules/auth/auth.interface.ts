export interface IRegisterPatientPayload {
  name: string;
  email: string;
  password: string;
  image: string;
}

export interface ILoginPatientPayload {
  email: string;
  password: string;
}

export interface IChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}
