import { AuthForm } from "@/components/auth/auth-form";

export default function SignupPage() {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <AuthForm mode="signup" />
    </main>
  );
}
