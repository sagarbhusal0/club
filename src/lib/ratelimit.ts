const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter(t => now - t < windowMs);
  if (arr.length >= limit) return false;
  arr.push(now); hits.set(key, arr); return true;
}

export const LIMITS = {
  boardSubmit: { limit: 3, windowMs: 60_000, message: "Too many applications. Please try again in a minute." },
  hackathonSubmit: { limit: 3, windowMs: 60_000, message: "Too many team registrations. Please try again in a minute." },
  statusLookup: { limit: 10, windowMs: 60_000, message: "Too many lookups. Please try again shortly." },
  dashboard: { limit: 15, windowMs: 60_000, message: "Too many lookups. Please try again shortly." },
  login: { limit: 5, windowMs: 60_000, message: "Too many login attempts. Please try again in a minute." },
  broadcast: { limit: 1, windowMs: 5*60_000, message: "Please wait 5 minutes between broadcasts." },
  finalSubmission: { limit: 5, windowMs: 60_000, message: "Too many submissions. Try again shortly." },
  testEmail: { limit: 5, windowMs: 60_000, message: "Too many test emails. Try again shortly." },
} as const;

export function checkRateLimit(key: string, preset: typeof LIMITS[keyof typeof LIMITS]): { allowed: boolean; message?: string } {
  const allowed = rateLimit(key, preset.limit, preset.windowMs);
  return allowed ? { allowed: true } : { allowed: false, message: preset.message };
}

export function getClientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || headers.get("x-real-ip")?.trim()
    || "unknown";
}
