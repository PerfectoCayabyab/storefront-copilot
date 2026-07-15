import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";

export async function createClient() {
  const headerStore = await headers();
  const authHeader = headerStore.get("authorization");

  // Native clients (the mobile merchant app) authenticate with a bearer
  // access token instead of browser cookies. PostgREST receives the token
  // via the Authorization header so RLS applies as usual, and getUser()
  // falls back to validating that same token.
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice("Bearer ".length);
    const client = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return [];
          },
          setAll() {},
        },
        global: { headers: { Authorization: authHeader } },
      }
    );
    const originalGetUser = client.auth.getUser.bind(client.auth);
    client.auth.getUser = (jwt?: string) => originalGetUser(jwt ?? token);
    return client;
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — session refresh is handled by
            // the middleware, so this can be safely ignored.
          }
        },
      },
    }
  );
}
