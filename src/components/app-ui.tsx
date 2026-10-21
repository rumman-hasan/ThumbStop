import type { ReactNode } from "react";
import { titleCase } from "@/lib/format";

/** Shared building blocks for the admin dashboard and the client portal. */

export function PageHeader({ title, text, children }: { title: string; text?: string; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-white">{title}</h1>
        {text && <p className="mt-2 max-w-2xl text-sm text-brand-muted">{text}</p>}
      </div>
      {children}
    </div>
  );
}

export function Flash({ searchParams }: { searchParams: { error?: string; ok?: string } }) {
  if (searchParams.error) {
    return (
      <p role="alert" className="mb-6 rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
        {searchParams.error}
      </p>
    );
  }
  if (searchParams.ok) {
    return (
      <p role="status" className="mb-6 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
        {searchParams.ok}
      </p>
    );
  }
  return null;
}

const tones: Record<string, string> = {
  new: "bg-white/10 text-white/80",
  draft: "bg-white/10 text-white/80",
  planning: "bg-white/10 text-white/80",
  contacted: "bg-brand-cyan/15 text-brand-cyanSoft",
  in_progress: "bg-brand-cyan/15 text-brand-cyanSoft",
  sent: "bg-brand-cyan/15 text-brand-cyanSoft",
  pending: "bg-brand-cyan/15 text-brand-cyanSoft",
  qualified: "bg-amber-400/15 text-amber-200",
  review: "bg-amber-400/15 text-amber-200",
  partial: "bg-amber-400/15 text-amber-200",
  on_hold: "bg-amber-400/15 text-amber-200",
  won: "bg-emerald-400/15 text-emerald-300",
  completed: "bg-emerald-400/15 text-emerald-300",
  paid: "bg-emerald-400/15 text-emerald-300",
  overdue: "bg-red-400/15 text-red-300",
  cancelled: "bg-red-400/15 text-red-300",
  failed: "bg-red-400/15 text-red-300",
  lost: "bg-red-400/15 text-red-300",
  spam: "bg-red-400/15 text-red-300",
  admin: "bg-brand-royal/30 text-brand-royalBright",
  staff: "bg-brand-cyan/15 text-brand-cyanSoft",
  client: "bg-white/10 text-white/80",
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[value] ?? "bg-white/10 text-white/80"}`}>
      {titleCase(value)}
    </span>
  );
}

export function Field({
  label,
  name,
  type = "text",
  required = false,
  defaultValue,
  placeholder,
  textarea = false,
  rows = 3,
  min,
  max,
  step,
  children,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number | null;
  placeholder?: string;
  textarea?: boolean;
  rows?: number;
  min?: number;
  max?: number;
  step?: number | string;
  children?: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="label">
        {label}
        {required ? " *" : ""}
      </label>
      {children ??
        (textarea ? (
          <textarea id={name} name={name} rows={rows} required={required} defaultValue={defaultValue ?? ""} placeholder={placeholder} className="input" />
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            required={required}
            defaultValue={defaultValue ?? ""}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            className="input"
          />
        ))}
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="card p-5">
      <p className="label !mb-2">{label}</p>
      <p className="font-display text-3xl font-bold text-white">{value}</p>
      {hint && <p className="mt-1 text-xs text-brand-muted">{hint}</p>}
    </div>
  );
}

export function EmptyRow({ colSpan, text }: { colSpan: number; text: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-3 py-10 text-center text-sm text-brand-muted">
        {text}
      </td>
    </tr>
  );
}
