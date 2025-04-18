
export type ServiceResult<T> = {
  data: T | null;
  error: string | null;
  success: boolean;
};

export function createSuccessResult<T>(data: T): ServiceResult<T> {
  return { data, error: null, success: true };
}

export function createErrorResult<T>(error: string): ServiceResult<T> {
  return { data: null, error, success: false };
}
