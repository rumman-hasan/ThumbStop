import type { Metadata } from "next";
import { ForgotForm } from "@/components/auth-forms";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Forgot password", robots: { index: false } };

export default function ForgotPasswordPage() {
  return <ForgotForm configured={isSupabaseConfigured} />;
}
