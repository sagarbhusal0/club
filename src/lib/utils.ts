export function cn(...c: (string|false|undefined)[]) { return c.filter(Boolean).join(" "); }

export function statusColor(s: string) {
  const m: Record<string,string> = {
    SUBMITTED:"bg-blue-100 text-blue-800", UNDER_REVIEW:"bg-yellow-100 text-yellow-800",
    SHORTLISTED:"bg-purple-100 text-purple-800", INTERVIEW:"bg-indigo-100 text-indigo-800",
    SELECTED:"bg-green-100 text-green-800", APPROVED:"bg-green-100 text-green-800",
    WAITLISTED:"bg-orange-100 text-orange-800", REJECTED:"bg-red-100 text-red-800",
    REGISTERED:"bg-blue-100 text-blue-800", CHECKED_IN:"bg-emerald-100 text-emerald-800",
    IDEA_REVIEW:"bg-amber-100 text-amber-800", NEEDS_REVISION:"bg-orange-100 text-orange-800",
    FINAL_SUBMITTED:"bg-emerald-100 text-emerald-800", DISQUALIFIED:"bg-red-100 text-red-800",
    PENDING:"bg-zinc-100 text-zinc-700",
  };
  return m[s] || "bg-gray-100 text-gray-800";
}

export function formatDate(d: string|Date) {
  return new Date(d).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"});
}

export function toCsv(rows: Record<string,unknown>[], headers: string[]) {
  const esc = (v: unknown) => {
    let s = String(v ?? "").replace(/"/g, '""');
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return `"${s}"`;
  };
  return [headers.map(esc).join(","), ...rows.map(r=> headers.map(h=> esc(r[h])).join(","))].join("\n");
}

export function registrationStatus(opens: string, closes: string): "OPEN"|"COMING_SOON"|"CLOSED" {
  const now = new Date(); const o = new Date(opens); const c = new Date(closes);
  if (isNaN(o.getTime()) || isNaN(c.getTime())) return "OPEN";
  c.setHours(23,59,59,999);
  if (now < o) return "COMING_SOON";
  if (now > c) return "CLOSED";
  return "OPEN";
}
export function hackathonStatus(opens: string, closes: string): "OPEN"|"COMING_SOON"|"CLOSED" {
  return registrationStatus(opens, closes);
}
