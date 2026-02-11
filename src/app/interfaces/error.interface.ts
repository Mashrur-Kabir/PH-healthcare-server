export interface IErrorSources {
  path: string;
  message: string;
}

export interface IErrorResponse {
  success: false;
  message: string;
  errors?: {
    path: string;
    message: string;
  }[];
  stack?: string | string[];
}
