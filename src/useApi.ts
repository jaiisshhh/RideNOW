import { useState } from 'react';
import { AxiosResponse } from 'axios';

type ApiState<T> = {
  data: T | null;
  error: string | null;
  isLoading: boolean;
};

// This custom hook will manage the state for any API request
export const useApi = <T, P>(apiFunc: (params: P) => Promise<AxiosResponse<T>>) => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const request = async (params: P) => {
    setState({ ...state, isLoading: true, error: null });
    try {
      const result = await apiFunc(params);
      setState({ data: result.data, isLoading: false, error: null });
      return result.data; // Return data on success
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An unknown error occurred.';
      setState({ data: null, isLoading: false, error: errorMessage });
      throw new Error(errorMessage); // Throw error to be caught in component if needed
    }
  };

  return { ...state, request };
};