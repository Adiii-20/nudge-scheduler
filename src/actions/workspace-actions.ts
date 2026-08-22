"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser, requireWorkspaceRole } from "@/lib/auth/session";
import { createTask, createWorkspace, moveTask } from "@/services/workspace";

export async function createWorkspaceAction(_: unknown, formData: FormData) {
  const user = await requireUser();
  const parsed = z.object({ name: z.string().min(2).max(80) }).safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: "Workspace name must be at least 2 characters." };
  }

  const workspace = await createWorkspace(user.id, parsed.data.name);
  const board = workspace.boards[0];

  revalidatePath("/dashboard");
  redirect(board ? `/workspace/${workspace.id}/board/${board.id}` : `/dashboard?workspace=${workspace.id}`);
}

export async function createTaskAction(_: unknown, formData: FormData) {
  const parsed = z.object({
    workspaceId: z.string().min(1),
    boardId: z.string().min(1),
    columnId: z.string().min(1),
    title: z.string().min(2).max(160),
    description: z.string().max(2000).optional(),
    dueDate: z.string().optional(),
    assigneeId: z.string().optional(),
  }).safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: "Task title must be at least 2 characters." };
  }

  const { user } = await requireWorkspaceRole(parsed.data.workspaceId);
  await createTask({
    userId: user.id,
    workspaceId: parsed.data.workspaceId,
    boardId: parsed.data.boardId,
    columnId: parsed.data.columnId,
    title: parsed.data.title,
    description: parsed.data.description || undefined,
    dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
    assigneeId: parsed.data.assigneeId || undefined,
  });

  revalidatePath(`/workspace/${parsed.data.workspaceId}/board/${parsed.data.boardId}`);
  return { success: "Task created." };
}

export async function moveTaskAction(input: {
  workspaceId: string;
  boardId: string;
  taskId: string;
  columnId: string;
  position: number;
}) {
  const parsed = z.object({
    workspaceId: z.string().min(1),
    boardId: z.string().min(1),
    taskId: z.string().min(1),
    columnId: z.string().min(1),
    position: z.number().int().min(0),
  }).safeParse(input);

  if (!parsed.success) {
    return { error: "Invalid move request." };
  }

  const { user } = await requireWorkspaceRole(parsed.data.workspaceId);
  await moveTask({
    userId: user.id,
    workspaceId: parsed.data.workspaceId,
    boardId: parsed.data.boardId,
    taskId: parsed.data.taskId,
    columnId: parsed.data.columnId,
    position: parsed.data.position,
  });

  revalidatePath(`/workspace/${parsed.data.workspaceId}/board/${parsed.data.boardId}`);
  return { success: "Task moved." };
}

// --- COLUMN ACTIONS --- //

import { createColumn, deleteColumn, renameColumn, moveColumn } from "@/services/workspace";

export async function createColumnAction(_: unknown, formData: FormData) {
  const parsed = z.object({
    workspaceId: z.string().min(1),
    boardId: z.string().min(1),
    title: z.string().min(1).max(50),
  }).safeParse(Object.fromEntries(formData));

  if (!parsed.success) return { error: "Invalid column title." };

  const { user } = await requireWorkspaceRole(parsed.data.workspaceId);
  await createColumn({
    userId: user.id,
    workspaceId: parsed.data.workspaceId,
    boardId: parsed.data.boardId,
    title: parsed.data.title,
  });

  revalidatePath(`/workspace/${parsed.data.workspaceId}/board/${parsed.data.boardId}`);
  return { success: "List created." };
}

export async function renameColumnAction(input: {
  workspaceId: string;
  boardId: string;
  columnId: string;
  title: string;
}) {
  const { user } = await requireWorkspaceRole(input.workspaceId);
  await renameColumn({
    userId: user.id,
    workspaceId: input.workspaceId,
    columnId: input.columnId,
    title: input.title,
  });
  revalidatePath(`/workspace/${input.workspaceId}/board/${input.boardId}`);
  return { success: "List renamed." };
}

export async function deleteColumnAction(input: {
  workspaceId: string;
  boardId: string;
  columnId: string;
}) {
  const { user } = await requireWorkspaceRole(input.workspaceId);
  await deleteColumn({
    userId: user.id,
    workspaceId: input.workspaceId,
    columnId: input.columnId,
  });
  revalidatePath(`/workspace/${input.workspaceId}/board/${input.boardId}`);
  return { success: "List deleted." };
}

export async function moveColumnAction(input: {
  workspaceId: string;
  boardId: string;
  columnId: string;
  position: number;
}) {
  const { user } = await requireWorkspaceRole(input.workspaceId);
  await moveColumn({
    userId: user.id,
    workspaceId: input.workspaceId,
    boardId: input.boardId,
    columnId: input.columnId,
    position: input.position,
  });
  revalidatePath(`/workspace/${input.workspaceId}/board/${input.boardId}`);
}

// --- TASK DETAILS ACTIONS --- //

import { getTaskDetails, updateTaskDetails, toggleTaskLabel, createChecklist, addChecklistItem, toggleChecklistItem, deleteChecklistItem } from "@/services/workspace";

export async function getTaskDetailsAction(taskId: string) {
  return getTaskDetails(taskId);
}

export async function updateTaskDetailsAction(input: {
  workspaceId: string;
  boardId: string;
  taskId: string;
  title?: string;
  description?: string | null;
  dueDate?: Date | null;
}) {
  await requireWorkspaceRole(input.workspaceId);
  await updateTaskDetails({
    taskId: input.taskId,
    title: input.title,
    description: input.description,
    dueDate: input.dueDate,
  });
  revalidatePath(`/workspace/${input.workspaceId}/board/${input.boardId}`);
  return { success: "Task updated." };
}

export async function toggleTaskLabelAction(input: {
  workspaceId: string;
  boardId: string;
  taskId: string;
  labelId: string;
  connect: boolean;
}) {
  await requireWorkspaceRole(input.workspaceId);
  await toggleTaskLabel(input.taskId, input.labelId, input.connect);
  revalidatePath(`/workspace/${input.workspaceId}/board/${input.boardId}`);
  return { success: "Label updated." };
}

export async function createChecklistAction(input: {
  workspaceId: string;
  boardId: string;
  taskId: string;
  title?: string;
}) {
  await requireWorkspaceRole(input.workspaceId);
  await createChecklist(input.taskId, input.title);
  revalidatePath(`/workspace/${input.workspaceId}/board/${input.boardId}`);
  return { success: "Checklist created." };
}

export async function addChecklistItemAction(input: {
  workspaceId: string;
  boardId: string;
  checklistId: string;
  title: string;
}) {
  await requireWorkspaceRole(input.workspaceId);
  await addChecklistItem(input.checklistId, input.title);
  revalidatePath(`/workspace/${input.workspaceId}/board/${input.boardId}`);
  return { success: "Item added." };
}

export async function toggleChecklistItemAction(input: {
  workspaceId: string;
  boardId: string;
  itemId: string;
  isCompleted: boolean;
}) {
  await requireWorkspaceRole(input.workspaceId);
  await toggleChecklistItem(input.itemId, input.isCompleted);
  revalidatePath(`/workspace/${input.workspaceId}/board/${input.boardId}`);
  return { success: "Item toggled." };
}

export async function deleteChecklistItemAction(input: {
  workspaceId: string;
  boardId: string;
  itemId: string;
}) {
  await requireWorkspaceRole(input.workspaceId);
  await deleteChecklistItem(input.itemId);
  revalidatePath(`/workspace/${input.workspaceId}/board/${input.boardId}`);
  return { success: "Item deleted." };
}

import { createBoard } from "@/services/workspace";

export async function createBoardAction(_: unknown, formData: FormData) {
  const parsed = z.object({
    workspaceId: z.string().min(1),
    title: z.string().min(2).max(80),
  }).safeParse(Object.fromEntries(formData));

  if (!parsed.success) return { error: "Board title must be at least 2 characters." };

  const { user } = await requireWorkspaceRole(parsed.data.workspaceId);
  const board = await createBoard({
    userId: user.id,
    workspaceId: parsed.data.workspaceId,
    title: parsed.data.title,
  });

  revalidatePath(`/workspace/${parsed.data.workspaceId}`);
  revalidatePath(`/dashboard`);
  redirect(`/workspace/${parsed.data.workspaceId}/board/${board.id}`);
}
