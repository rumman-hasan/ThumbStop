import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Server client acting as the signed-in user (RLS applies). Use in pages, actions and routes. */
export function createClient() {
  const cookieStore = cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component: cookies cannot be set here. The middleware refreshes them.
        }
      },
    },
  });
}
