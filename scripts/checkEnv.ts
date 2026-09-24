// scripts/checkEnv.ts
import { loadEnvConfig } from "@next/env";
import { z } from "zod";

// Load environment variables from .env / .env.local like Next.js does
loadEnvConfig(process.cwd());

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

function reportErrors(err: z.ZodError) {
  console.error("\n❌  Environment validation failed:\n");
  
  // Zod v3 uses issues, v4 might have issues or errors
  const issues = err.issues || (err as any).errors || [];
  
  if (!issues.length) {
    console.error(err.message || err);
    return;
  }
  
  issues.forEach((e: any) => {
    const path = e.path.join(".");
    console.error(`  • ${path}: ${e.message}`);
  });
  console.error("\n💡  Please verify your environment variables in your local .env.local file or in the Vercel Settings.");
}

function main() {
  const result = envSchema.safeParse(normalizeEnv());
  if (!result.success) {
    reportErrors(result.error);
    process.exit(1);
  } else {
    console.log("✅  All required environment variables are present and valid!\n");
    console.table({
      NEXT_PUBLIC_SUPABASE_URL: result.data.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: result.data.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Present (verified)" : "Missing",
      DATABASE_URL: result.data.DATABASE_URL ? "Present (verified)" : "Missing",
      NEXT_PUBLIC_APP_URL: result.data.NEXT_PUBLIC_APP_URL,
    });
  }
}

main();
