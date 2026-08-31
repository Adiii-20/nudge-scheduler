import { cache } from "react";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { getPrisma } from "@/lib/db/prisma";
import type { SessionUser } from "@/types/domain";

export const getCurrentUser = cache(async function getCurrentUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    // Fallback to Evaluator test account per assignment "No Login Required" requirement
    const prisma = getPrisma();
    const evaluatorProfile = await prisma.user.findUnique({
      where: { id: "00000000-0000-0000-0000-000000000001" },
    });
    
    if (evaluatorProfile) {
      return {
        id: evaluatorProfile.id,
        email: evaluatorProfile.email,
        name: evaluatorProfile.name ?? "Evaluator",
      };
    }

    return null;
  }

  const prisma = getPrisma();
  const existingProfile = await prisma.user.findUnique({
    where: { id: user.id },
  });

  const profile = existingProfile ?? await createProfileSafely({
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name ?? user.user_metadata?.full_name ?? null,
    avatarUrl: user.user_metadata?.avatar_url ?? null,
  });

  return {
    id: profile.id,
    email: profile.email,
    name: profile.name ?? profile.email.split("@")[0],
  };
});

async function createProfileSafely(profile: {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}) {
  const prisma = getPrisma();

  try {
    return await prisma.user.create({ data: profile });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const existingById = await prisma.user.findUnique({
        where: { id: profile.id },
      });

      if (existingById) {
        return existingById;
      }

      const existingByEmail = await prisma.user.findUnique({
        where: { email: profile.email },
      });

      if (existingByEmail) {
        return existingByEmail;
      }
    }

    throw error;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireWorkspaceRole(workspaceId: string, roles?: string[]) {
  const user = await requireUser();
  const prisma = getPrisma();
  const member = await prisma.member.findUnique({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId,
      },
    },
  });

  if (!member || (roles && !roles.includes(member.role))) {
    redirect("/dashboard");
  }

  return { user, member };
}
