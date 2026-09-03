import { cn } from "@/lib/utils";

export function Button({ className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...p}
      className={cn(
        "inline-flex min-h-11 touch-manipulation items-center justify-center gap-1.5 rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium tracking-tight text-white antialiased transition-[transform,background-color,opacity,border-color,box-shadow] duration-150 ease-out hover:bg-black hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] active:scale-[0.97] active:shadow-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:hover:shadow-[0_4px_16px_rgba(255,255,255,0.12)]",
        className
      )}
    />
  );
}
export function Input({ className, ...p }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...p}
      className={cn(
        "h-11 w-full touch-manipulation rounded-xl border border-zinc-200 bg-white px-3.5 text-[15px] font-normal leading-none text-zinc-900 outline-none transition-[border-color,box-shadow,background-color] duration-150 ease-out placeholder:text-zinc-400 placeholder:font-normal focus:border-zinc-900 dark:focus:border-zinc-300 focus:bg-white dark:focus:bg-zinc-900 focus:ring-4 focus:ring-zinc-900/[0.06] aria-[invalid=true]:border-red-300 aria-[invalid=true]:focus:border-red-500 aria-[invalid=true]:focus:ring-red-500/10 md:h-10 md:text-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-white/10",
        className
      )}
    />
  );
}
export function Textarea({ className, ...p }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...p}
      className={cn(
        "w-full touch-manipulation rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-[15px] font-normal leading-6 text-zinc-900 outline-none transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-zinc-400 focus:border-zinc-900 dark:focus:border-zinc-300 focus:ring-4 focus:ring-zinc-900/[0.06] aria-[invalid=true]:border-red-300 md:px-3 md:py-2.5 md:text-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500",
        className
      )}
    />
  );
}
export function Select({ className, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...p}
      className={cn(
        "h-11 w-full touch-manipulation rounded-xl border border-zinc-200 bg-white px-3.5 text-[15px] font-normal text-zinc-900 outline-none focus:border-zinc-900 dark:focus:border-zinc-300 focus:ring-4 focus:ring-zinc-900/[0.06] aria-[invalid=true]:border-red-300 md:h-10 md:px-3 md:text-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100",
        className
      )}
    />
  );
}
export function Label({ className, ...p }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label {...p} className={cn("mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400", className)} />;
}
export function Card({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...p}
      className={cn(
        "rounded-[20px] border border-zinc-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] transition-[transform,box-shadow,border-color] duration-200 ease-out will-change-transform sm:p-6 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)] [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-[1px] [@media(hover:hover)_and_(pointer:fine)]:hover:border-zinc-300 [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] dark:[@media(hover:hover)_and_(pointer:fine)]:hover:border-zinc-700",
        className
      )}
    />
  );
}
export function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 flex items-start gap-1.5 text-xs font-normal leading-5 text-red-600 dark:text-red-400" role="alert">
      <span aria-hidden className="mt-0.5 inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold leading-none text-white dark:bg-red-500">
        !
      </span>
      <span>{children}</span>
    </p>
  );
}
export function Badge({ status }: { status: string }) {
  const m: Record<string, string> = {
    SUBMITTED:
      "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900",
    UNDER_REVIEW:
      "bg-amber-100 text-amber-900 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-500/20",
    SHORTLISTED:
      "bg-zinc-100 text-zinc-800 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700",
    INTERVIEW:
      "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900",
    SELECTED:
      "bg-emerald-100 text-emerald-900 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-500/20",
    APPROVED:
      "bg-emerald-100 text-emerald-900 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-500/20",
    WAITLISTED:
      "bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700",
    REJECTED:
      "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/20",
    REGISTERED:
      "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900",
    CHECKED_IN:
      "bg-emerald-100 text-emerald-900 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] ring-1 ring-inset ${m[status] || "bg-zinc-100 text-zinc-700 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700"}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800", className)} style={{ background: "linear-gradient(90deg, transparent 25%, rgba(0,0,0,0.04) 50%, transparent 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s ease infinite" }} />;
}
