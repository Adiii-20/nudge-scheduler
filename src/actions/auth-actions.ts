"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z.string().email().max(255);
const passwordSchema = z.string().min(8).max(128);

export async function signUpAction(_: unknown, formData: FormData) {
  const parsed = z.object({
    name: z.string().min(2).max(80),
    email: emailSchema,
    password: passwordSchema,
  }).safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: "Use a valid name, email, and password with at least 8 characters." };
  }

  const { error } = await signUpWithEmailPassword(parsed.data.email, parsed.data.password, parsed.data.name);

  if (error) {
    return { error: error.message };
  }

  const { error: signInError } = await signInWithEmailPassword(parsed.data.email, parsed.data.password);

  if (signInError) {
    if (isEmailNotConfirmed(signInError)) {
      return { error: "Email confirmation is still enabled in Supabase. Turn it off to allow immediate login after registration." };
    }

    return { error: signInError.message };
  }

  redirect("/dashboard");
}

export async function loginAction(_: unknown, formData: FormData) {
  const parsed = z.object({
    email: emailSchema,
    password: z.string().min(1),
    remember: z.string().optional(),
    next: z.string().optional(),
  }).safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }

  const { error } = await signInWithEmailPassword(parsed.data.email, parsed.data.password);

  if (error) {
    if (isEmailNotConfirmed(error)) {
      return { error: "Email confirmation is still enabled in Supabase. Turn it off to use login without verification." };
    }

    return { error: error.message };
  }

  redirect(getSafeNextPath(parsed.data.next));
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

function getSafeNextPath(next?: string) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }

  return next;
}

async function signInWithEmailPassword(email: string, password: string) {
  try {
    const supabase = await createClient();
    return await supabase.auth.signInWithPassword({ email, password });
  } catch (error) {
    return { data: { user: null, session: null }, error: toAuthError(error) };
  }
}

async function signUpWithEmailPassword(email: string, password: string, name: string) {
  try {
    const supabase = await createClient();
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
  } catch (error) {
    return { data: { user: null, session: null }, error: toAuthError(error) };
  }
}

function toAuthError(error: unknown) {
  return {
    message: error instanceof Error ? error.message : "Auth service is unavailable. Try again.",
  };
}

function isEmailNotConfirmed(error: unknown) {
  return typeof error === "object"
    && error !== null
    && "code" in error
    && error.code === "email_not_confirmed";
}
