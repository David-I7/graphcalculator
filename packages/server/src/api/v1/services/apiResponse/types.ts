export type ErrorResponse = {
  error: {
    code: number;
    type: string;
    message: string;
  };
};

export type SuccessResponse<T> = {
  data: T;
};
