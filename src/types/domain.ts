import type { WorkspaceRole } from "@prisma/client";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
};

export type WorkspaceSummary = {
  id: string;
  name: string;
  slug: string;
  role: WorkspaceRole;
};

export type BoardColumn = {
  id: string;
  title: string;

  position: number;
  tasks: BoardTask[];
};

export type BoardTask = {
  id: string;
  title: string;
  description: string | null;

  position: number;
  dueDate: Date | null;
  assignee: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  commentsCount: number;
};
