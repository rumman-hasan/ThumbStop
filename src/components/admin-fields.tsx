import type { ReactNode } from "react";

/** Like <Field>, but with a unique id per record so many edit forms can sit on one page. */
export function IdField({
  idPrefix,
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
  children,
}: {
  idPrefix: string;
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
  children?: ReactNode;
}) {
  const id = `${name}-${idPrefix}`;
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
        {required ? " *" : ""}
      </label>
      {children ??
        (textarea ? (
          <textarea id={id} name={name} rows={rows} required={required} defaultValue={defaultValue ?? ""} placeholder={placeholder} className="input" />
        ) : (
          <input id={id} name={name} type={type} required={required} defaultValue={defaultValue ?? ""} placeholder={placeholder} min={min} max={max} className="input" />
        ))}
    </div>
  );
}

export function Check({ name, label, defaultChecked = false }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 pt-6 text-sm text-white/90">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 accent-brand-cyan" />
      {label}
    </label>
  );
}
