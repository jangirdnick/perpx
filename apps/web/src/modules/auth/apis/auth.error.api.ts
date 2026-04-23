import axios from 'axios';
import { ApiErrorResponse } from '@perpx/shared';

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const data = error.response?.data;

    if (data?.message) return data.message;
    if (data?.error) return data.error;

    if (error.code === 'ECONNABORTED') {
      return 'Request timeout. Please try again.';
    }

    if (!error.response) {
      return 'Unable to connect to server. Check your internet connection.';
    }

    if (error.response.status >= 500) {
      return 'Server error. Please try again after some time.';
    }

    if (error.response.status === 401) {
      return 'You are not authorized. Please login again.';
    }

    if (error.response.status === 403) {
      return 'You do not have permission to perform this action.';
    }

    if (error.response.status === 404) {
      return 'Requested resource was not found.';
    }

    return error.message || 'Request failed.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
};
