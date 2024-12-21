import { logError } from '@/lib/error-handling';

const RATE_LIMIT = 5; // Requests per second
const WINDOW_MS = 1000; // 1 second window
const BACKOFF_MS = 2000; // 2 second backoff

class RateLimiter {
  private requests: { [endpoint: string]: number[] } = {};
  private backoff: { [endpoint: string]: number } = {};

  async throttle(endpoint: string): Promise<void> {
    const now = Date.now();
    
    // Check if in backoff period
    if (this.backoff[endpoint] && now < this.backoff[endpoint]) {
      const delay = this.backoff[endpoint] - now;
      await new Promise(resolve => setTimeout(resolve, delay));
      delete this.backoff[endpoint];
    }

    // Initialize or clean old requests
    if (!this.requests[endpoint]) {
      this.requests[endpoint] = [];
    }
    this.requests[endpoint] = this.requests[endpoint].filter(time => 
      time > now - WINDOW_MS
    );

    // Check rate limit
    if (this.requests[endpoint].length >= RATE_LIMIT) {
      this.backoff[endpoint] = now + BACKOFF_MS;
      await new Promise(resolve => setTimeout(resolve, BACKOFF_MS));
      this.requests[endpoint] = [];
    }

    // Add current request
    this.requests[endpoint].push(now);
  }
}

export const rateLimiter = new RateLimiter();