"use client";

import { AxiosError } from 'axios';

interface ErrorResponse {
  message?: string;
  error?: string;
  data?: {
    message?: string;
  };
}

export function serializeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null) {
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }
  return String(error);
}

export function handleAxiosError(error: unknown): string {
  if (error instanceof AxiosError) {
    // Handle network errors
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out - please try again';
    }
    if (!error.response) {
      return 'Network error - please check your connection';
    }

    // Handle bech32 address errors
    if (error.message.includes('bech32') || error.message.includes('prefix')) {
      return 'Invalid address format';
    }

    // Handle API errors
    const data = error.response.data as ErrorResponse;
    const message = data?.message || data?.error || data?.data?.message;
    if (message) {
      // Clean up common error messages
      if (message.includes('invalid address')) {
        return 'Invalid address format';
      }
      if (message.includes('not found')) {
        return 'Address not found';
      }
      if (message.includes('query cannot be empty')) {
        return 'Invalid query parameters';
      }
      return message;
    }

    // Handle HTTP status codes
    switch (error.response.status) {
      case 400:
        return 'Invalid request - please try again';
      case 401:
        return 'Authentication required';
      case 403:
        return 'Access denied';
      case 404:
        return 'Address not found';
      case 429:
        return 'Too many requests - please wait a moment';
      case 500:
        return 'Network error - please try again later';
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable';
      default:
        return `Request failed (${error.response.status})`;
    }
  }

  if (error instanceof TypeError) {
    if (error.message === 'Failed to fetch') {
      return 'Network error - please check your connection';
    }
    if (error.message.includes('JSON')) {
      return 'Invalid response from server';
    }
  }

  return 'An unexpected error occurred';
}

export function logError(error: unknown, context: string = '', silent: boolean = false): string {
  const errorMessage = handleAxiosError(error);
  
  // Only log errors if not silent and not expected failures
  if (!silent && 
      !(error instanceof Error && 
        (error.name === 'AbortError' || 
         error.message.includes('prefix') || 
         error.message.includes('bech32') ||
         error.message.includes('429')))) {
    console.error('Error:', {
      context,
      message: errorMessage,
      type: error instanceof Error ? error.name : typeof error,
      originalError: error instanceof Error ? error.message : String(error)
    });
  }
  
  return errorMessage;
}