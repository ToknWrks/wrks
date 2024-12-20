"use client";

import { useState } from 'react';

const RATE_LIMIT_WINDOW = 1000; // 1 second window
const MAX_REQUESTS_PER_WINDOW = 5; // 5 requests per second
const BACKOFF_TIME = 2000; // 2 seconds backoff

interface RequestQueue {
  [endpoint: string]: {
    lastRequest: number;
    requestCount: number;
    backoffUntil?: number;
  };
}

export function useApiRateLimit() {
  const [requestQueue] = useState<RequestQueue>({});

  const checkRateLimit = async (endpoint: string): Promise<void> => {
    const now = Date.now();
    const queue = requestQueue[endpoint] || { lastRequest: 0, requestCount: 0 };

    // Check if in backoff period
    if (queue.backoffUntil && now < queue.backoffUntil) {
      const backoffDelay = queue.backoffUntil - now;
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
      queue.backoffUntil = undefined;
    }

    // Reset counter if outside window
    if (now - queue.lastRequest > RATE_LIMIT_WINDOW) {
      queue.requestCount = 0;
    }

    // If within rate limit, proceed immediately
    if (queue.requestCount < MAX_REQUESTS_PER_WINDOW) {
      queue.requestCount++;
      queue.lastRequest = now;
      requestQueue[endpoint] = queue;
      return;
    }

    // Apply backoff if rate limit exceeded
    queue.backoffUntil = now + BACKOFF_TIME;
    requestQueue[endpoint] = queue;
    
    // Wait for backoff period
    await new Promise(resolve => setTimeout(resolve, BACKOFF_TIME));
    queue.requestCount = 1;
    queue.lastRequest = Date.now();
    queue.backoffUntil = undefined;
    requestQueue[endpoint] = queue;
  };

  return { checkRateLimit };
}