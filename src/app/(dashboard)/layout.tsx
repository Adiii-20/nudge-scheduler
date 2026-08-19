import Link from "next/link";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { requireUser } from "@/lib/auth/session";
import { ensureDefaultWorkspace, getWorkspaceSummaries } from "@/services/workspace";
import { logoutAction } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const workspace = await ensureDefaultWorkspace(user);
  let memberships = await getWorkspaceSummaries(user.id);

  if (!memberships.length) {
    memberships = [{
      id: "fallback",
      role: "OWNER",
      userId: user.id,
      workspaceId: workspace.id,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
      workspace,
    }];
  }

  const workspaces = memberships.map((membership) => ({
    id: membership.workspace.id,
    name: membership.workspace.name,
    slug: membership.workspace.slug,
    role: membership.role,
  }));

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar user={user} workspaces={workspaces} activeWorkspaceId={workspaces[0]?.id} />
      <div className="min-w-0 flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden flex shrink-0 items-center justify-between p-3 border-b bg-white">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-slate-800">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-blue-600 text-sm font-semibold text-white">N</span>
            Nudge
          </Link>
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            <form action={logoutAction}>
              <Button variant="ghost" size="icon" className="text-slate-500 w-8 h-8">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-slate-50">
          {children}
        </div>
      </div>
    </div>
  );
}
