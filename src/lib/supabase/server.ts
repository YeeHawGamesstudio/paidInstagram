import "server-only";

import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

import { env } from "@/lib/config/env";

function applyCookieMutations(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  cookiesToSet: { name: string; value: string; options: CookieOptions }[],
) {
  try {
    for (const { name, options, value } of cookiesToSet) {
      cookieStore.set(name, value, options);
    }
  } catch {
    // Server Components can read cookies but cannot always persist them.
  }
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        applyCookieMutations(cookieStore, cookiesToSet);
      },
    },
  });
}

export function createSupabaseAdminClient() {
  return createServerClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {},
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
