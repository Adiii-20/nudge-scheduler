import { requireWorkspaceRole } from "@/lib/auth/session";
import { CreateBoardForm } from "@/components/board/create-board-form";
import { Layout } from "lucide-react";

export default async function NewBoardPage({
  params,
}: {
  params: { workspaceId: string };
}) {
  await requireWorkspaceRole(params.workspaceId);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center p-8 bg-slate-50">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm text-center">
        <Layout className="mx-auto mb-4 h-12 w-12 text-slate-300" />
        <h1 className="mb-2 text-2xl font-bold text-slate-800">Create a new board</h1>
        <p className="mb-6 text-sm text-slate-500">
          Organize your tasks, workflows, and projects in a new board.
        </p>
        <CreateBoardForm workspaceId={params.workspaceId} />
      </div>
    </div>
  );
}
