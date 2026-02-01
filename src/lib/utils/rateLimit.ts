/**
 * Improved in-memory rate limiter for MVP
 * Better cleanup, memory management, and reliability
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
    lastSeen: number;
  };
}

const store: RateLimitStore = {};
const MAX_STORE_SIZE = 10000;
const CLEANUP_INTERVAL = 60000;
let lastCleanup = 0;

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

export function rateLimit(
  identifier: string,
  options: RateLimitOptions = { windowMs: 60000, maxRequests: 100 }
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();

  if (now - lastCleanup > CLEANUP_INTERVAL) {
    cleanupExpiredEntries(now);
    lastCleanup = now;
  }

  if (Object.keys(store).length >= MAX_STORE_SIZE) {
    cleanupOldestEntries(MAX_STORE_SIZE * 0.7);
  }

  const key = identifier;
  const record = store[key];

  if (!record || record.resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + options.windowMs,
      lastSeen: now,
    };
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetTime: now + options.windowMs,
    };
  }

  record.lastSeen = now;

  if (record.count >= options.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: options.maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

function cleanupExpiredEntries(now: number): void {
  let cleaned = 0;
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key];
      cleaned++;
    }
  }
  if (cleaned > 0) {
    console.log(`[RateLimit] Cleaned ${cleaned} expired entries`);
  }
}

function cleanupOldestEntries(targetCount: number): void {
  const entries = Object.entries(store)
    .sort(([, a], [, b]) => a.lastSeen - b.lastSeen);

  let cleaned = 0;
  for (const [key] of entries) {
    if (cleaned >= targetCount) break;
    delete store[key];
    cleaned++;
  }
  console.warn(`[RateLimit] Store too large, cleaned ${cleaned} oldest entries`);
}

export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';

  return ip;
}
