import { Prisma, WorkspaceRole } from "@prisma/client";
import { getPrisma } from "@/lib/db/prisma";
import { slugify } from "@/utils/token";

const defaultColumns = [
  { title: "Backlog", position: 0 },
  { title: "Todo", position: 1 },
  { title: "In Progress", position: 2 },
  { title: "Review", position: 3 },
  { title: "Completed", position: 4 },
];

export async function ensureDefaultWorkspace(user: { id: string; email: string; name: string }) {
  const prisma = getPrisma();
  const existing = await prisma.member.findFirst({
    where: { userId: user.id },
    include: { workspace: { include: { boards: true } } },
    orderBy: { createdAt: "asc" },
  });

  if (existing) {
    return existing.workspace;
  }

  const baseName = `${user.name}'s Workspace`;
  const baseSlug = slugify(baseName);
  const slug = `${baseSlug}-${user.id.slice(0, 6)}`;

  return prisma.workspace.create({
    data: {
      name: baseName,
      slug,
      members: {
        create: {
          userId: user.id,
          role: WorkspaceRole.OWNER,
        },
      },
      boards: {
        create: {
          title: "Product Roadmap",
          columns: {
            create: defaultColumns,
          },
        },
      },
    },
    include: { boards: true },
  });
}

export async function getWorkspaceSummaries(userId: string) {
  const prisma = getPrisma();
  return prisma.member.findMany({
    where: { userId },
    include: { workspace: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function createWorkspace(userId: string, name: string) {
  const prisma = getPrisma();
  const slug = `${slugify(name)}-${Date.now().toString(36)}`;

  return prisma.workspace.create({
    data: {
      name,
      slug,
      members: {
        create: {
          userId,
          role: WorkspaceRole.OWNER,
        },
      },
      boards: {
        create: {
          title: "Team Board",
          columns: {
            create: defaultColumns,
          },
        },
      },
    },
    include: {
      boards: {
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
  });
}

export async function getBoardForUser(userId: string, workspaceId: string, boardId: string) {
  const prisma = getPrisma();
  const membership = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });

  if (!membership) {
    return null;
  }

  return prisma.board.findFirst({
    where: { id: boardId, workspaceId },
    include: {
      workspace: true,
      columns: {
        orderBy: { position: "asc" },
        include: {
          tasks: {
            orderBy: { position: "asc" },
            include: {
              labels: true,
              checklists: { include: { items: true } },
              assignee: { select: { id: true, name: true, email: true } },
              _count: { select: { comments: true } },
            },
          },
        },
      },
    },
  });
}

export async function createTask(input: {
  userId: string;
  workspaceId: string;
  boardId: string;
  columnId: string;
  title: string;
  description?: string;
  dueDate?: Date;
  assigneeId?: string;
}) {
  const prisma = getPrisma();
  const column = await prisma.column.findFirst({
    where: {
      id: input.columnId,
      board: {
        id: input.boardId,
        workspaceId: input.workspaceId,
      },
    },
    select: { id: true },
  });

  if (!column) {
    throw new Error("Column not found.");
  }

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const lastTask = await tx.task.findFirst({
      where: { columnId: input.columnId },
      orderBy: { position: "desc" },
    });

    const task = await tx.task.create({
      data: {
        title: input.title,
        description: input.description,
        dueDate: input.dueDate,
        assigneeId: input.assigneeId,
        boardId: input.boardId,
        columnId: input.columnId,
        position: (lastTask?.position ?? -1) + 1,
      },
    });

    await tx.activityLog.create({
      data: {
        action: "task.created",
        userId: input.userId,
        workspaceId: input.workspaceId,
        taskId: task.id,
        metadata: { title: task.title },
      },
    });

    return task;
  });
}

export async function moveTask(input: {
  userId: string;
  workspaceId: string;
  boardId: string;
  taskId: string;
  columnId: string;
  position: number;
}) {
  const prisma = getPrisma();
  const [task, column] = await Promise.all([
    prisma.task.findFirst({
      where: {
        id: input.taskId,
        board: {
          id: input.boardId,
          workspaceId: input.workspaceId,
        },
      },
      select: { id: true },
    }),
    prisma.column.findFirst({
      where: {
        id: input.columnId,
        board: {
          id: input.boardId,
          workspaceId: input.workspaceId,
        },
      },
      select: { id: true, title: true },
    }),
  ]);

  if (!task || !column) {
    throw new Error("Task or column not found.");
  }

  return prisma.$transaction(async (tx) => {
    const task = await tx.task.update({
      where: { id: input.taskId },
      data: {
        columnId: input.columnId,
        position: input.position,
      },
    });

    await tx.activityLog.create({
      data: {
        action: "task.moved",
        userId: input.userId,
        workspaceId: input.workspaceId,
        taskId: input.taskId,
        metadata: { columnTitle: column.title },
      },
    });

    return task;
  });
}

// --- COLUMN CRUD --- //

export async function createColumn(input: {
  userId: string;
  workspaceId: string;
  boardId: string;
  title: string;
}) {
  const prisma = getPrisma();
  const board = await prisma.board.findFirst({
    where: { id: input.boardId, workspaceId: input.workspaceId }
  });
  if (!board) throw new Error("Board not found");

  return prisma.$transaction(async (tx) => {
    const lastCol = await tx.column.findFirst({
      where: { boardId: input.boardId },
      orderBy: { position: "desc" }
    });
    const col = await tx.column.create({
      data: {
        title: input.title,
        boardId: input.boardId,
        position: (lastCol?.position ?? -1) + 1,
      }
    });
    await tx.activityLog.create({
      data: {
        action: "column.created",
        userId: input.userId,
        workspaceId: input.workspaceId,
        metadata: { title: input.title },
      },
    });
    return col;
  });
}

export async function renameColumn(input: {
  userId: string;
  workspaceId: string;
  columnId: string;
  title: string;
}) {
  const prisma = getPrisma();
  return prisma.column.update({
    where: { id: input.columnId },
    data: { title: input.title }
  });
}

export async function deleteColumn(input: {
  userId: string;
  workspaceId: string;
  columnId: string;
}) {
  const prisma = getPrisma();
  return prisma.column.delete({
    where: { id: input.columnId }
  });
}

export async function moveColumn(input: {
  userId: string;
  workspaceId: string;
  boardId: string;
  columnId: string;
  position: number;
}) {
  const prisma = getPrisma();
  return prisma.column.update({
    where: { id: input.columnId },
    data: { position: input.position }
  });
}

// --- TASK DETAILS CRUD --- //

export async function getTaskDetails(taskId: string) {
  return getPrisma().task.findUnique({
    where: { id: taskId },
    include: {
      labels: true,
      checklists: {
        include: { items: { orderBy: { position: "asc" } } },
        orderBy: { createdAt: "asc" }
      },
      assignee: { select: { id: true, name: true, email: true } },
    }
  });
}

export async function updateTaskDetails(input: {
  taskId: string;
  title?: string;
  description?: string | null;
  dueDate?: Date | null;
}) {
  return getPrisma().task.update({
    where: { id: input.taskId },
    data: {
      title: input.title,
      description: input.description,
      dueDate: input.dueDate,
    }
  });
}

export async function getBoardLabels(boardId: string) {
  return getPrisma().label.findMany({
    where: { boardId },
    orderBy: { createdAt: "asc" }
  });
}

export async function createLabel(input: { boardId: string, name?: string, color: string }) {
  return getPrisma().label.create({
    data: { boardId: input.boardId, name: input.name, color: input.color }
  });
}

export async function toggleTaskLabel(taskId: string, labelId: string, connect: boolean) {
  return getPrisma().task.update({
    where: { id: taskId },
    data: {
      labels: connect ? { connect: { id: labelId } } : { disconnect: { id: labelId } }
    }
  });
}

export async function createChecklist(taskId: string, title: string = "Checklist") {
  return getPrisma().checklist.create({
    data: { taskId, title }
  });
}

export async function addChecklistItem(checklistId: string, title: string) {
  const prisma = getPrisma();
  return prisma.$transaction(async (tx) => {
    const lastItem = await tx.checklistItem.findFirst({
      where: { checklistId },
      orderBy: { position: "desc" }
    });
    return tx.checklistItem.create({
      data: {
        checklistId,
        title,
        position: (lastItem?.position ?? -1) + 1
      }
    });
  });
}

export async function toggleChecklistItem(itemId: string, isCompleted: boolean) {
  return getPrisma().checklistItem.update({
    where: { id: itemId },
    data: { isCompleted }
  });
}

export async function deleteChecklistItem(itemId: string) {
  return getPrisma().checklistItem.delete({
    where: { id: itemId }
  });
}

export async function createBoard(input: {
  userId: string;
  workspaceId: string;
  title: string;
}) {
  const prisma = getPrisma();
  return prisma.$transaction(async (tx) => {
    const board = await tx.board.create({
      data: {
        title: input.title,
        workspaceId: input.workspaceId,
        columns: {
          create: defaultColumns,
        },
      },
    });

    await tx.activityLog.create({
      data: {
        action: "board.created",
        userId: input.userId,
        workspaceId: input.workspaceId,
        metadata: { title: input.title },
      },
    });

    return board;
  });
}
