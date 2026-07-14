"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Input, Label } from "@/components/ui/field";
import { signIn, signUp, type AuthState } from "./actions";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="cut press btn-accent h-14 grid place-items-center font-mono uppercase tracking-wide text-sm font-bold focusable disabled:opacity-60"
    >
      {pending ? "…" : label}
    </button>
  );
}

export function AuthForm({ mode, next }: { mode: "login" | "signup"; next?: string }) {
  const action = mode === "login" ? signIn : signUp;
  const [state, formAction] = useActionState<AuthState, FormData>(action, undefined);

  return (
    <main className="min-h-dvh mx-auto max-w-app px-5 py-12 flex flex-col">
      <Link href="/" className="eyebrow">
        ← SIXTY
      </Link>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight">
        {mode === "login" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-2 text-muted text-sm">
        {mode === "login" ? "Log in to keep your streak alive." : "Sign up and start day 1 today."}
      </p>

      <form action={formAction} className="mt-8 grid gap-4">
        {next ? <input type="hidden" name="next" value={next} /> : null}
        {mode === "signup" && (
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" autoComplete="name" placeholder="Alex" />
          </div>
        )}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder="••••••••"
          />
        </div>

        {state?.error ? (
          <p className="cut bg-miss/15 border border-miss/40 text-miss text-[13px] px-3 py-2">
            {state.error}
          </p>
        ) : null}
        {state?.notice ? (
          <p className="cut bg-accent/15 border border-accent/40 text-accent text-[13px] px-3 py-2">
            {state.notice}
          </p>
        ) : null}

        <Submit label={mode === "login" ? "Log in" : "Create account"} />
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            No account?{" "}
            <Link href="/signup" className="text-accent font-semibold">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already registered?{" "}
            <Link href="/login" className="text-accent font-semibold">
              Log in
            </Link>
          </>
        )}
      </p>
    </main>
  );
}
