import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <AuthForm mode="login" next={searchParams.next} />
    </main>
  );
}
