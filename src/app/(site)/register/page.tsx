import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth-forms";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Register", robots: { index: false } };

export default function RegisterPage() {
  return <RegisterForm configured={isSupabaseConfigured} />;
}
