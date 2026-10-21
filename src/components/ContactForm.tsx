"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "success" | "error";
type FieldErrors = Record<string, string>;

const budgets = ["Not sure yet", "Under ৳10,000", "৳10,000 – ৳30,000", "৳30,000 – ৳100,000", "Above ৳100,000"];

export function ContactForm({
  services,
  defaultService = "",
  whatsappHref,
}: {
  services: string[];
  defaultService?: string;
  whatsappHref: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setStatus("sending");
    setMessage("");
    setErrors({});

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(f.entries())),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus("success");
        form.reset();
        return;
      }
      setStatus("error");
      setErrors((data.fields as FieldErrors) ?? {});
      setMessage(data.error ?? "Something went wrong. Please try again or use WhatsApp.");
    } catch {
      setStatus("error");
      setMessage("Network problem. Please check your connection or use WhatsApp.");
    }
  }

  const err = (k: string) =>
    errors[k] ? (
      <p id={`${k}-err`} className="mt-1 text-xs text-red-300">
        {errors[k]}
      </p>
    ) : null;

  if (status === "success") {
    return (
      <div role="status" className="card p-8">
        <h2 className="font-display text-2xl font-bold text-white">Thank you. Your enquiry is saved.</h2>
        <p className="mt-3 text-brand-muted">
          We will contact you by phone, WhatsApp or email. For a faster reply you can also message us on WhatsApp.
        </p>
        <div className="mt-6 flex gap-3">
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-primary">Chat on WhatsApp</a>
          <button type="button" onClick={() => setStatus("idle")} className="btn-outline">Send another</button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5" aria-label="Contact form">
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="label">Name *</label>
          <input id="name" name="name" required className="input" autoComplete="name" aria-describedby={errors.name ? "name-err" : undefined} />
          {err("name")}
        </div>
        <div>
          <label htmlFor="email" className="label">Email *</label>
          <input id="email" name="email" type="email" required className="input" autoComplete="email" aria-describedby={errors.email ? "email-err" : undefined} />
          {err("email")}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="label">Phone / WhatsApp *</label>
          <input id="phone" name="phone" type="tel" required className="input" autoComplete="tel" aria-describedby={errors.phone ? "phone-err" : undefined} />
          {err("phone")}
        </div>
        <div>
          <label htmlFor="service" className="label">Service of interest</label>
          <select id="service" name="service" className="input" defaultValue={defaultService}>
            <option value="">Select a service</option>
            {services.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="budget" className="label">Budget range (optional)</label>
        <select id="budget" name="budget" className="input" defaultValue="">
          <option value="">Prefer not to say</option>
          {budgets.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="details" className="label">Project details *</label>
        <textarea id="details" name="details" required rows={5} maxLength={2000} className="input" aria-describedby={errors.details ? "details-err" : undefined} />
        {err("details")}
      </div>

      <button type="submit" disabled={status === "sending"} className="btn-primary w-full sm:w-auto">
        {status === "sending" ? "Sending…" : "Send enquiry"}
      </button>

      {status === "error" && (
        <div role="alert" className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {message}{" "}
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
            Message us on WhatsApp instead
          </a>
        </div>
      )}
    </form>
  );
}
