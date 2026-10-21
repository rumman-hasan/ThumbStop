import type { Metadata } from "next";
import { LoginForm } from "@/components/auth-forms";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Login", robots: { index: false } };
export const dynamic = "force-dynamic";

export default function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  return <LoginForm next={searchParams.next} configured={isSupabaseConfigured} />;
}
