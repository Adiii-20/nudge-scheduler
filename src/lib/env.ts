import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL."),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required."),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required."),
  DIRECT_URL: optionalEnvString(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

function optionalEnvString() {
  return z.preprocess(
    (value) => value === "" ? undefined : value,
    z.string().min(1).optional(),
  );
}

function stripQuotes(value: any) {
  if (typeof value === "string") {
    if (value.startsWith('"') && value.endsWith('"')) {
      return value.slice(1, -1);
    }
    if (value.startsWith("'") && value.endsWith("'")) {
      return value.slice(1, -1);
    }
  }
  return value;
}

function normalizeEnv() {
  return {
    ...process.env,
    DATABASE_URL: stripQuotes(process.env.DATABASE_URL),
    DIRECT_URL: stripQuotes(process.env.DIRECT_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}

export const env = envSchema.parse(normalizeEnv());
