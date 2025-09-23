interface RateLimitOptions {
  interval: number // Time window in milliseconds
  uniqueTokenPerInterval: number // Maximum unique tokens per interval
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RateLimitError'
  }
}

export function rateLimit(options: RateLimitOptions) {
  const { interval, uniqueTokenPerInterval } = options
  const cache = new Map<string, RateLimitEntry>()

  return {
    check: async (limit: number, token: string): Promise<void> => {
      const now = Date.now()
      const entry = cache.get(token)

      if (!entry || now > entry.resetTime) {
        // First request or window expired
        cache.set(token, {
          count: 1,
          resetTime: now + interval,
        })
        return
      }

      if (entry.count >= limit) {
        throw new RateLimitError('Rate limit exceeded')
      }

      // Increment count
      entry.count++
      cache.set(token, entry)

      // Clean up old entries periodically
      if (cache.size > uniqueTokenPerInterval) {
        const cutoff = now - interval
        for (const [key, value] of cache.entries()) {
          if (value.resetTime < cutoff) {
            cache.delete(key)
          }
        }
      }
    },

    reset: (token: string): void => {
      cache.delete(token)
    },

    getRemainingRequests: (token: string, limit: number): number => {
      const entry = cache.get(token)
      if (!entry || Date.now() > entry.resetTime) {
        return limit
      }
      return Math.max(0, limit - entry.count)
    },

    getResetTime: (token: string): number | null => {
      const entry = cache.get(token)
      return entry ? entry.resetTime : null
    },
  }
}

// Convenience function for common rate limits
export const commonRateLimits = {
  // API endpoints
  apiEndpoint: rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 1000 }), // 1 min

  // File operations
  fileOperations: rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 500 }), // 1 min

  // Authentication
  auth: rateLimit({ interval: 5 * 60 * 1000, uniqueTokenPerInterval: 100 }), // 5 min

  // Agent access (stricter)
  agentAccess: rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 200 }), // 1 min

  // Rental operations
  rentals: rateLimit({ interval: 60 * 60 * 1000, uniqueTokenPerInterval: 50 }), // 1 hour
}
