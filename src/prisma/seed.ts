import { WorkspaceRole } from "@prisma/client";
import { getPrisma } from "@/lib/db/prisma";

async function main() {
  const prisma = getPrisma();
  
  // Wipe database for a clean seed
  await prisma.activityLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.checklistItem.deleteMany();
  await prisma.checklist.deleteMany();
  await prisma.task.deleteMany();
  await prisma.label.deleteMany();
  await prisma.column.deleteMany();
  await prisma.board.deleteMany();
  await prisma.member.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      id: "00000000-0000-0000-0000-000000000001",
      email: "evaluator@test.com",
      name: "Evaluator",
    },
  });

  const workspace = await prisma.workspace.create({
    data: {
      name: "Trello Clone Evaluation",
      slug: "trello-eval",
      members: {
        create: {
          userId: user.id,
          role: WorkspaceRole.OWNER,
        },
      },
      boards: {
        create: {
          title: "SDE Intern Project",
          columns: {
            create: [
              { title: "To Do", position: 0 },
              { title: "In Progress", position: 1 },
              { title: "Review", position: 2 },
              { title: "Done", position: 3 },
            ],
          },
        },
      },
    },
    include: { boards: { include: { columns: true } } },
  });

  const board = workspace.boards[0];
  const todo = board.columns.find((c) => c.title === "To Do")!;
  const inProgress = board.columns.find((c) => c.title === "In Progress")!;

  // Create Labels
  const bugLabel = await prisma.label.create({ data: { boardId: board.id, name: "Bug", color: "#ef4444" } });
  const featureLabel = await prisma.label.create({ data: { boardId: board.id, name: "Feature", color: "#3b82f6" } });
  const uiLabel = await prisma.label.create({ data: { boardId: board.id, name: "UI/UX", color: "#8b5cf6" } });

  // Create Tasks
  const t1 = await prisma.task.create({
    data: {
      title: "Implement Drag & Drop",
      description: "Allow reordering lists and tasks horizontally and vertically.",
      boardId: board.id,
      columnId: inProgress.id,
      position: 0,
      assigneeId: user.id,
      dueDate: new Date(Date.now() - 86400000), // Overdue
      labels: { connect: [{ id: featureLabel.id }, { id: uiLabel.id }] }
    }
  });

  const t2 = await prisma.task.create({
    data: {
      title: "Fix authentication bypass",
      description: "Ensure evaluator can log in without entering a real email.",
      boardId: board.id,
      columnId: todo.id,
      position: 0,
      labels: { connect: [{ id: bugLabel.id }] }
    }
  });

  // Create Checklists
  const checklist = await prisma.checklist.create({
    data: { taskId: t1.id, title: "DND Requirements" }
  });

  await prisma.checklistItem.createMany({
    data: [
      { checklistId: checklist.id, title: "Drag tasks", isCompleted: true, position: 0 },
      { checklistId: checklist.id, title: "Drag lists", isCompleted: false, position: 1 },
      { checklistId: checklist.id, title: "Persist to database", isCompleted: false, position: 2 },
    ]
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });
