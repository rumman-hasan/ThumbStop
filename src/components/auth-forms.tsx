"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

function Shell({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return (
    <section className="py-16 sm:py-24">
      <div className="container-page max-w-md">
        <div className="card p-8">
          <h1 className="font-display text-2xl font-bold text-white">{title}</h1>
          <p className="mt-2 text-sm text-brand-muted">{intro}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </section>
  );
}

function Message({ error, ok }: { error?: string; ok?: string }) {
  if (error) return <p role="alert" className="rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>;
  if (ok) return <p role="status" className="rounded-md border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{ok}</p>;
  return null;
}

function NotConfigured() {
  return (
    <p role="note" className="mb-4 rounded-md border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">
      Accounts are not available yet because Supabase is not connected (see docs/SETUP-BANGLA.md).
    </p>
  );
}

export function LoginForm({ next, configured }: { next?: string; configured: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const supabase = createClient();
    const { data, error: err } = await supabase.auth.signInWithPassword({
      email: String(f.get("email") ?? "").trim(),
      password: String(f.get("password") ?? ""),
    });
    if (err || !data.user) {
      setError("Invalid email or password.");
      setBusy(false);
      return;
    }
    const { data: prof } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
    const safeNext = next && (next.startsWith("/admin") || next.startsWith("/portal")) ? next : null;
    router.replace(safeNext ?? (prof?.role === "client" ? "/portal" : "/admin"));
    router.refresh();
  }

  return (
    <Shell title="Login" intro="Clients and the ThumbStop team sign in here.">
      {!configured && <NotConfigured />}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="input" disabled={!configured} />
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" className="input" disabled={!configured} />
        </div>
        <Message error={error} />
        <button type="submit" disabled={busy || !configured} className="btn-primary w-full">{busy ? "Signing in…" : "Log in"}</button>
      </form>
      <div className="mt-6 flex justify-between text-sm text-brand-muted">
        <Link href="/forgot-password" className="hover:text-brand-cyan">Forgot password?</Link>
        <Link href="/register" className="hover:text-brand-cyan">Create account</Link>
      </div>
    </Shell>
  );
}

export function RegisterForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setOk("");
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") ?? "").trim();
    const email = String(f.get("email") ?? "").trim();
    const password = String(f.get("password") ?? "");
    if (name.length < 2) return setError("Please enter your name.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== String(f.get("confirm") ?? "")) return setError("Passwords do not match.");

    setBusy(true);
    const supabase = createClient();
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name }, emailRedirectTo: `${window.location.origin}/auth/callback?next=/portal` },
    });
    setBusy(false);
    if (err) return setError(err.message || "Could not create the account.");
    if (data.session) {
      router.replace("/portal");
      router.refresh();
      return;
    }
    setOk("Account created. Please check your email and click the confirmation link, then log in.");
  }

  return (
    <Shell title="Create client account" intro="Registration always creates a client account. Admin access cannot be self-registered.">
      {!configured && <NotConfigured />}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="label">Full name</label>
          <input id="name" name="name" required autoComplete="name" className="input" disabled={!configured} />
        </div>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="input" disabled={!configured} />
        </div>
        <div>
          <label htmlFor="password" className="label">Password (min 8 characters)</label>
          <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className="input" disabled={!configured} />
        </div>
        <div>
          <label htmlFor="confirm" className="label">Confirm password</label>
          <input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" className="input" disabled={!configured} />
        </div>
        <Message error={error} ok={ok} />
        <button type="submit" disabled={busy || !configured} className="btn-primary w-full">{busy ? "Creating…" : "Create account"}</button>
      </form>
      <p className="mt-6 text-center text-sm text-brand-muted">
        Already registered? <Link href="/login" className="font-semibold text-brand-cyan">Log in</Link>
      </p>
    </Shell>
  );
}

export function ForgotForm({ configured }: { configured: boolean }) {
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setBusy(false);
    // Same message whether or not the email exists, so accounts cannot be probed.
    setOk("If an account exists for that email, a reset link has been sent.");
  }

  return (
    <Shell title="Reset password" intro="Enter your email and we will send a reset link.">
      {!configured && <NotConfigured />}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" name="email" type="email" required className="input" disabled={!configured} />
        </div>
        <Message ok={ok} />
        <button type="submit" disabled={busy || !configured} className="btn-primary w-full">{busy ? "Sending…" : "Send reset link"}</button>
      </form>
      <p className="mt-6 text-center text-sm text-brand-muted">
        <Link href="/login" className="font-semibold text-brand-cyan">Back to login</Link>
      </p>
    </Shell>
  );
}

export function ResetForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const f = new FormData(e.currentTarget);
    const password = String(f.get("password") ?? "");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== String(f.get("confirm") ?? "")) return setError("Passwords do not match.");
    setBusy(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) return setError("Could not update the password. Open the reset link from your email again.");
    router.replace("/login");
  }

  return (
    <Shell title="Choose a new password" intro="Use the reset link from your email to reach this page.">
      {!configured && <NotConfigured />}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="label">New password</label>
          <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className="input" disabled={!configured} />
        </div>
        <div>
          <label htmlFor="confirm" className="label">Confirm password</label>
          <input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" className="input" disabled={!configured} />
        </div>
        <Message error={error} />
        <button type="submit" disabled={busy || !configured} className="btn-primary w-full">{busy ? "Saving…" : "Save password"}</button>
      </form>
    </Shell>
  );
}
