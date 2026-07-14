"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    const supabase = createClient();
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          router.push("/onboarding");
          router.refresh();
        } else {
          // Email confirmation is enabled on the Supabase project.
          setNotice(
            "Check your inbox to confirm your email, then sign in to continue."
          );
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 font-semibold">
          <Bot className="h-6 w-6 text-accent" aria-hidden />
          Storefront Copilot
        </Link>

        <div className="rounded-2xl border border-line bg-surface p-8">
          <h1 className="text-xl font-semibold">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {isLogin
              ? "Sign in to manage your store."
              : "Free to try — seed a demo store in one click after signing up."}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-line bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-line bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                placeholder="At least 8 characters"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
                {error}
              </p>
            )}
            {notice && (
              <p role="status" className="rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">
                {notice}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-strong disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              {isLogin ? "Sign in" : "Sign up"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          {isLogin ? (
            <>
              New here?{" "}
              <Link href="/signup" className="text-accent hover:underline">
                Create an account
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/login" className="text-accent hover:underline">
                Sign in
              </Link>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
