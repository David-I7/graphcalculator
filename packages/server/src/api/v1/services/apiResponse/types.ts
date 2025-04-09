export type ErrorResponse = {
  error: {
    code: number;
    message: string;
  };
};

export type SuccessResponse<T> = {
  data: T;
};
