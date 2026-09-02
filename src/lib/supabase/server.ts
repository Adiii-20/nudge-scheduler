import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

async function fetchWithRetry(
  url: RequestInfo | URL,
  options?: RequestInit,
  retries = 2,
  delay = 500
): Promise<Response> {
  try {
    return await fetch(url, {
      ...options,
      keepalive: false,
    });
  } catch (error) {
    if (retries > 0) {
      console.warn(`⚠️ Supabase fetch failed. Retrying in ${delay}ms... (${retries} retries left). Error: ${error}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot write cookies; middleware refreshes them.
          }
        },
      },
      global: {
        fetch: (url, options) => {
          return fetchWithRetry(url, options);
        },
      },
    },
  );
}
