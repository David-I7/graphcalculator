export type User = {
  id: number;
  firstName: string;
  email: string;
};

export type UserData = {
  email: string;
  firstName: string;
  lastName?: string;
  password: string;
};

export type VerifyEmailResponse = {
  data: { isRegistered: boolean };
};

export type ApiErrorResponse = {
  error: {
    code: number;
    message: string;
    type: string;
  };
};
