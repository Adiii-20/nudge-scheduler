import Link from "next/link";
import type React from "react";
import { Plus, Star, Layout, Users, Bell, Clock, Activity, Zap } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getPrisma } from "@/lib/db/prisma";
import { WorkspaceCreateForm } from "@/components/dashboard/workspace-create-form";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

// Trello-style board background colours (cycle through them)
const BOARD_GRADIENTS = [
  "from-blue-400 to-indigo-500",
  "from-violet-400 to-purple-500",
  "from-emerald-400 to-teal-500",
  "from-sky-400 to-blue-500",
  "from-teal-400 to-emerald-500",
  "from-cyan-400 to-sky-500",
  "from-indigo-400 to-blue-600",
  "from-slate-400 to-slate-600",
];

function getBoardGradient(index: number) {
  return BOARD_GRADIENTS[index % BOARD_GRADIENTS.length];
}

// ─── Board tile ───────────────────────────────────────────────────────────────

function BoardTile({
  board,
  workspaceId,
  index,
}: {
  board: { id: string; title: string; _count: { tasks: number } };
  workspaceId: string;
  index: number;
}) {
  return (
    <Link
      href={`/workspace/${workspaceId}/board/${board.id}`}
      className={`group relative flex h-28 w-full flex-col justify-between rounded-xl bg-gradient-to-br ${getBoardGradient(index)} p-3 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-bold text-white drop-shadow leading-tight line-clamp-2">
          {board.title}
        </p>
        <button
          className="opacity-0 group-hover:opacity-100 transition-opacity rounded p-0.5 text-white/70 hover:text-yellow-300"
        >
          <Star className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="text-xs text-white/70 font-medium">
        {board._count.tasks} {board._count.tasks === 1 ? "card" : "cards"}
      </p>
    </Link>
  );
}

// ─── Create board tile ────────────────────────────────────────────────────────

function CreateBoardTile({ workspaceId }: { workspaceId: string }) {
  return (
    <Link
      href={`/workspace/${workspaceId}/board/new`}
      className="flex h-28 w-full flex-col items-center justify-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-all duration-200 cursor-pointer"
    >
      <Plus className="h-5 w-5" />
      <span className="text-sm font-medium">Create new board</span>
    </Link>
  );
}

// ─── Activity feed item ───────────────────────────────────────────────────────

function ActivityItem({
  user,
  action,
  task,
  date,
}: {
  user: { name: string | null; email: string };
  action: string;
  task?: { title: string } | null;
  date: Date;
}) {
  const initials = (user.name || user.email).charAt(0).toUpperCase();
  const displayName = user.name || user.email.split("@")[0];
  const timeAgo = formatRelativeTime(date);

  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
        {initials}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700">
          <span className="font-semibold">{displayName}</span>{" "}
          {action.replace(".", " ")}
          {task && (
            <span className="font-medium text-slate-800"> &quot;{task.title}&quot;</span>
          )}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{timeAgo}</p>
      </div>
    </div>
  );
}

function formatRelativeTime(date: Date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { workspace?: string };
}) {
  const user = await requireUser();
  const prisma = getPrisma();

  const memberships = await prisma.member.findMany({
    where: { userId: user.id },
    include: {
      workspace: {
        include: {
          boards: {
            include: { _count: { select: { tasks: true } } },
            orderBy: { createdAt: "asc" },
          },
          members: { include: { user: true }, orderBy: { createdAt: "asc" } },
          notifications: {
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          activities: {
            orderBy: { createdAt: "desc" },
            take: 10,
            include: { user: true, task: true },
          },
        },
      },
    },
  });

  const workspace = memberships.find((m) => m.workspaceId === searchParams.workspace)?.workspace 
    || memberships[0]?.workspace;

  if (!workspace) {
    return (
      <main className="flex h-full flex-col items-center justify-center p-8 text-center bg-slate-50">
        <Layout className="mb-4 h-12 w-12 text-slate-300" />
        <h1 className="mb-2 text-xl font-bold text-slate-800">No workspaces found</h1>
        <p className="mb-6 max-w-sm text-sm text-slate-500">
          You don&apos;t belong to any workspaces yet. Create one to get started!
        </p>
        <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <WorkspaceCreateForm />
        </div>
      </main>
    );
  }

  const role = memberships.find((m) => m.workspaceId === workspace.id)?.role || "VIEWER";
  const recentActivities = workspace.activities || [];

  return (
    <main className="min-h-full bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl">
        
        {/* Header section */}
        <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-md">
              <span className="text-xl font-bold text-white">
                {workspace.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                {workspace.name}
              </h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Layout className="h-3.5 w-3.5" />
                  {workspace.boards.length} Boards
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {workspace.members.length} Members
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main content - Boards list */}
          <div className="md:col-span-2">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
              <Clock className="h-5 w-5 text-slate-500" />
              Your boards
            </h2>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {workspace.boards.map((board, i) => (
                <BoardTile key={board.id} board={board} workspaceId={workspace.id} index={i} />
              ))}
              {(role === "OWNER" || role === "ADMIN") && (
                <CreateBoardTile workspaceId={workspace.id} />
              )}
            </div>

            {/* Quick links or tips area */}
            <div className="mt-8 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-5">
              <div className="flex gap-4 items-start">
                <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                  <Zap className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Get the most out of {workspace.name}</h3>
                  <p className="text-sm text-slate-600 mt-1 mb-3">Try adding due dates and assigning members to keep everything on track.</p>
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                    View tips
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar - Activity */}
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
              <h2 className="mb-4 flex items-center justify-between text-sm font-bold text-slate-800">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-slate-500" />
                  Activity
                </div>
                <button className="text-xs text-blue-600 hover:underline">View all</button>
              </h2>
              
              {recentActivities.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {recentActivities.map((act) => (
                    <ActivityItem 
                      key={act.id} 
                      user={act.user} 
                      action={act.action} 
                      task={act.task} 
                      date={act.createdAt} 
                    />
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-slate-500">
                  <p>No recent activity in this workspace.</p>
                </div>
              )}
            </div>

            {/* Pending notifications */}
            {workspace.notifications && workspace.notifications.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                  <Bell className="h-4 w-4 text-slate-500" />
                  Notifications
                </h2>
                <div className="space-y-2">
                  {workspace.notifications.map((n) => (
                    <div key={n.id} className="rounded border border-slate-100 bg-slate-50 p-2.5 text-sm">
                      <p className="font-medium text-slate-800 mb-0.5">{n.title}</p>
                      <p className="text-xs text-slate-500">{n.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}

