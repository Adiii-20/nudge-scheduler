import Link from "next/link";
import type React from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, CircleDashed, Clock3, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BoardClient } from "@/components/board/board-client";
import { requireUser } from "@/lib/auth/session";
import { getBoardForUser } from "@/services/workspace";

export default async function BoardPage({
  params,
}: {
  params: { workspaceId: string; boardId: string };
}) {
  const user = await requireUser();
  const board = await getBoardForUser(user.id, params.workspaceId, params.boardId);

  if (!board) {
    notFound();
  }

  const columns = board.columns.map((column) => ({
    id: column.id,
    title: column.title,
    position: column.position,
    tasks: column.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      position: task.position,
      dueDate: task.dueDate?.toISOString() ?? null,
      assignee: task.assignee,
      commentsCount: task._count.comments,
      labels: task.labels || [],
      checklists: task.checklists || [],
    })),
  }));
  // Generate a consistent gradient index based on the board ID string
  let hash = 0;
  for (let i = 0; i < board.id.length; i++) {
    hash = board.id.charCodeAt(i) + ((hash << 5) - hash);
  }
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
  const gradient = BOARD_GRADIENTS[Math.abs(hash) % BOARD_GRADIENTS.length];

  return (
    <main className={`flex h-full flex-col bg-gradient-to-br ${gradient}`}>
      <BoardClient 
        workspaceId={params.workspaceId} 
        boardId={params.boardId} 
        boardTitle={board.title}
        initialColumns={columns} 
      />
    </main>
  );
}
