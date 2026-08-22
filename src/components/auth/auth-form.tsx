"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { Mail, Lock, User } from "lucide-react";
import { loginAction, signUpAction } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/auth/submit-button";

type AuthMode = "login" | "signup";
type FormState = { error?: string } | null;
type FormAction = (state: FormState, formData: FormData) => Promise<FormState>;

export function AuthForm({ mode, next }: { mode: AuthMode; next?: string }) {
  const action = (mode === "login" ? loginAction : signUpAction) as FormAction;
  const [state, formAction] = useFormState<FormState, FormData>(action, null);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          {mode === "login" ? "Welcome back" : "Create your account"}
        </CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Sign in to continue to your workspace."
            : "Register and continue straight to your workspace."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {next ? <input type="hidden" name="next" value={next} /> : null}
          {mode === "signup" ? (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="name" name="name" className="pl-9" autoComplete="name" required />
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input id="email" name="email" type="email" className="pl-9" autoComplete="email" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input id="password" name="password" type="password" className="pl-9" autoComplete={mode === "login" ? "current-password" : "new-password"} required />
            </div>
          </div>

          {mode === "login" ? (
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                name="remember"
                value="true"
                defaultChecked
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
              Keep me signed in
            </label>
          ) : null}

          {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

          <SubmitButton>
            {mode === "login" ? "Sign in" : "Create account"}
          </SubmitButton>
        </form>

        <div className="mt-6 border-t pt-6">
          <Link 
            href="/dashboard"
            className="flex w-full items-center justify-center gap-2 rounded-md bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-violet-700 transition-all hover:shadow-md"
          >
            Login as Guest Evaluator
          </Link>
          <p className="mt-2 text-center text-xs text-slate-500">
            Skip registration and view the pre-populated test workspace.
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          {mode === "login" ? (
            <Button asChild variant="link" className="h-auto p-0">
              <Link href="/signup">Create account</Link>
            </Button>
          ) : (
            <Link href="/login" className="hover:text-foreground">Back to sign in</Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
