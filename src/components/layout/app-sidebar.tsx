import Link from "next/link";
import type React from "react";
import { Bell, KanbanSquare, LogOut, Settings, Users } from "lucide-react";
import { logoutAction } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import type { WorkspaceSummary } from "@/types/domain";

export function AppSidebar({
  user,
}: {
  user: { name: string; email: string };
  workspaces: WorkspaceSummary[];
  activeWorkspaceId?: string;
}) {
  return (
    <aside className="sticky top-0 z-30 hidden h-screen w-14 shrink-0 border-r bg-background lg:block">
      <div className="flex h-14 items-center justify-center border-b">
        <Link href="/dashboard" className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
          N
        </Link>
      </div>
      <nav className="mt-3 space-y-1 px-2">
        <SidebarLink href="/dashboard" icon={<KanbanSquare className="h-4 w-4" />} label="Boards" />
        <SidebarLink href="/dashboard#members" icon={<Users className="h-4 w-4" />} label="Members" />
        <SidebarLink href="/dashboard#notifications" icon={<Bell className="h-4 w-4" />} label="Notifications" />
        <SidebarLink href="/dashboard#settings" icon={<Settings className="h-4 w-4" />} label="Settings" />
      </nav>
      <div className="absolute bottom-0 w-full border-t bg-background p-2">
        <div className="mb-2 grid place-items-center rounded-md py-2" title={`${user.name} (${user.email})`}>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-xs font-semibold">
            {user.name.slice(0, 1).toUpperCase()}
          </span>
        </div>
        <form action={logoutAction}>
          <Button variant="ghost" size="icon" className="w-full" title="Log out">
            <LogOut className="h-4 w-4 shrink-0" />
          </Button>
        </form>
      </div>
    </aside>
  );
}

function SidebarLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} title={label} aria-label={label} className="grid h-10 place-items-center rounded-md text-sm text-muted-foreground hover:bg-secondary/70 hover:text-foreground">
      <span className="shrink-0">{icon}</span>
    </Link>
  );
}
