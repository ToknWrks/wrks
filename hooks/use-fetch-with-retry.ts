"use client";

import { useState } from 'react';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import axiosRetry from 'axios-retry';
import { useApiRateLimit } from './use-api-rate-limit';
import { useApiCache } from './use-api-cache';
import { logError } from './use-error-handling';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const REQUEST_TIMEOUT = 15000; // 15 seconds

interface FetchOptions extends AxiosRequestConfig {
  skipCache?: boolean;
  skipRetry?: boolean;
  retries?: number;
}

// Create axios instance with retry configuration
const axiosInstance = axios.create();
axiosRetry(axiosInstance, {
  retries: MAX_RETRIES,
  retryDelay: (retryCount) => {
    return retryCount * RETRY_DELAY;
  },
  retryCondition: (error) => {
    // Retry on network errors, timeouts, or 5xx errors
    return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
           error.code === 'ECONNABORTED' ||
           (error.response?.status && error.response?.status >= 500);
  }
});

export function useFetchWithRetry() {
  const { checkRateLimit } = useApiRateLimit();
  const { getCachedData, setCachedData, updateStaleTimestamp } = useApiCache();
  const [isLoading, setIsLoading] = useState(false);

  const fetchWithRetry = async <T>(
    url: string,
    options: FetchOptions = {},
    cacheKey?: string
  ): Promise<T> => {
    const { skipCache, skipRetry, retries = MAX_RETRIES, ...config } = options;
    setIsLoading(true);

    try {
      // Check cache first if not skipped
      if (!skipCache && cacheKey) {
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
          setIsLoading(false);
          return cachedData;
        }
      }

      // Check rate limit before making request
      await checkRateLimit(url);

      const response = await axiosInstance.get<T>(url, {
        timeout: REQUEST_TIMEOUT,
        ...config,
        headers: {
          'Accept': 'application/json',
          ...config.headers
        },
        'axios-retry': {
          retries: skipRetry ? 0 : retries,
          retryDelay: (retryCount: number) => retryCount * RETRY_DELAY
        }
      });

      // Cache successful response if caching is enabled
      if (!skipCache && cacheKey) {
        setCachedData(cacheKey, response.data);
      }

      return response.data;
    } catch (err) {
      // Update cache timestamp to keep using stale data
      if (!skipCache && cacheKey) {
        updateStaleTimestamp(cacheKey);
      }

      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchWithRetry,
    isLoading
  };
}