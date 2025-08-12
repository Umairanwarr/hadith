import { useState, useCallback, useEffect } from 'react';
import { apiService } from '../lib/axios';
import { useNotifications } from '../contexts/NotificationContext';
import { useLoading } from '../contexts/LoadingContext';

interface UseApiOptions {
  showLoading?: boolean;
  showNotifications?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  autoFetch?: boolean;
  autoFetchDeps?: any[];
}

interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export const useApi = <T = any>(
  apiCall: (...args: any[]) => Promise<T>,
  options: UseApiOptions = {}
): ApiResponse<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { success, error: showError } = useNotifications();
  const { startLoading, stopLoading } = useLoading();

  const {
    showLoading = false,
    showNotifications = true,
    onSuccess,
    onError,
    autoFetch = false,
    autoFetchDeps = [],
  } = options;

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      console.log('🎯 useApi execute called:', {
        args,
        timestamp: new Date().toISOString()
      });
      
      try {
        setLoading(true);
        setError(null);

        if (showLoading) {
          startLoading('Loading...');
        }

        const result = await apiCall(...args);
        console.log('✅ useApi success:', {
          result: Array.isArray(result) ? `Array(${result.length})` : typeof result,
          timestamp: new Date().toISOString()
        });
        setData(result);

        if (showNotifications && onSuccess) {
          success('Success', 'Operation completed successfully');
        }

        onSuccess?.(result);
        return result;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
        console.log('❌ useApi error:', {
          error: errorMessage,
          timestamp: new Date().toISOString()
        });
        setError(errorMessage);

        if (showNotifications) {
          showError('Error', errorMessage);
        }

        onError?.(err);
        return null;
      } finally {
        setLoading(false);
        if (showLoading) {
          stopLoading();
        }
      }
    },
    [showLoading, showNotifications, onSuccess, onError, success, showError, startLoading, stopLoading]
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  // Auto-fetch support when requested
  useEffect(() => {
    if (autoFetch) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch, execute, ...autoFetchDeps]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
};

// Predefined API hooks for common operations
export const useGet = <T = any>(url: string, options?: UseApiOptions) => {
  return useApi<T>(() => apiService.get<T>(url), options);
};

export const usePost = <T = any>(url: string, options?: UseApiOptions) => {
  return useApi<T>((data: any) => apiService.post<T>(url, data), options);
};

export const usePut = <T = any>(url: string, options?: UseApiOptions) => {
  return useApi<T>((data: any) => apiService.put<T>(url, data), options);
};

export const useDelete = <T = any>(url: string, options?: UseApiOptions) => {
  return useApi<T>(() => apiService.delete<T>(url), options);
};

export const usePatch = <T = any>(url: string, options?: UseApiOptions) => {
  return useApi<T>((data: any) => apiService.patch<T>(url, data), options);
}; 