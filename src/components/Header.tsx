"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "./Logo";
import { navLinks } from "@/lib/site-config";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-brand-ink/90 backdrop-blur">
      <div className="container-page flex h-[72px] items-center justify-between">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium text-white/70 transition-colors hover:text-brand-cyan">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/login" className="text-sm font-semibold text-white/80 hover:text-brand-cyan">
            Login
          </Link>
          <Link href="/contact" className="btn-primary !py-2.5">
            Free Consultation
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/20 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            {open ? (
              <path d="M4 4l12 12M16 4L4 16" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M3 6h14M3 10h14M3 14h14" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Mobile" className="border-t border-white/10 bg-brand-ink lg:hidden">
          <div className="container-page flex flex-col py-3">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-white/5 py-3 text-base font-medium text-white/90"
              >
                {l.label}
              </Link>
            ))}
            <div className="flex gap-3 pb-2 pt-4">
              <Link href="/login" onClick={() => setOpen(false)} className="btn-outline flex-1">
                Login
              </Link>
              <Link href="/register" onClick={() => setOpen(false)} className="btn-primary flex-1">
                Register
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
