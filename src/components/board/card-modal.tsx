"use client";

import { useEffect, useState, useTransition } from "react";
import {
  X, CheckSquare, CalendarDays, AlignLeft, Plus, Trash2,
  Tag, UserCircle2, Archive, Clock, Pencil,
} from "lucide-react";
import {
  getTaskDetailsAction,
  updateTaskDetailsAction,
  createChecklistAction,
  addChecklistItemAction,
  toggleChecklistItemAction,
  deleteChecklistItemAction,
} from "@/actions/workspace-actions";

// ─── Types ───────────────────────────────────────────────────────────────────

type Label = { id: string; name: string | null; color: string };

type TaskDetails = {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  checklists: {
    id: string;
    title: string;
    items: { id: string; title: string; isCompleted: boolean }[];
  }[];
  labels: Label[];
  assignee?: { id: string; name: string | null; email: string } | null;
};

// ─── Trello label palette ────────────────────────────────────────────────────

const TRELLO_LABELS = [
  { color: "#61bd4f", name: "Green" },
  { color: "#f2d600", name: "Yellow" },
  { color: "#ff9f1a", name: "Orange" },
  { color: "#eb5a46", name: "Red" },
  { color: "#c377e0", name: "Purple" },
  { color: "#0079bf", name: "Blue" },
  { color: "#00c2e0", name: "Sky" },
  { color: "#51e898", name: "Lime" },
  { color: "#ff78cb", name: "Pink" },
  { color: "#344563", name: "Black" },
];

function getLabelContrast(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#1a1a1a" : "#ffffff";
}

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 text-slate-500">{icon}</div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-slate-800 mb-2">{title}</h3>
        {children}
      </div>
    </div>
  );
}

// ─── Sidebar action button ────────────────────────────────────────────────────

function SidebarBtn({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
    >
      {icon}
      {label}
    </button>
  );
}

// ─── Label selector panel ─────────────────────────────────────────────────────

function LabelPanel({
  currentLabels,
  onToggle,
}: {
  currentLabels: Label[];
  onToggle: (color: string, name: string) => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = TRELLO_LABELS.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-lg p-3 w-64">
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Labels</h4>
      <input
        className="w-full rounded border border-slate-200 px-2 py-1 text-xs mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Search labels…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="space-y-1.5">
        {filtered.map((l) => {
          const active = currentLabels.some((cl) => cl.color === l.color);
          return (
            <button
              key={l.color}
              onClick={() => onToggle(l.color, l.name)}
              className="relative flex w-full items-center gap-2 rounded-md overflow-hidden"
            >
              <span
                className="flex h-8 flex-1 items-center rounded-md px-3 text-sm font-semibold"
                style={{ backgroundColor: l.color, color: getLabelContrast(l.color) }}
              >
                {l.name}
              </span>
              {active && (
                <span className="absolute right-3 text-white text-xs font-bold">✓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Checklist progress bar ───────────────────────────────────────────────────

function ChecklistProgress({ completed, total }: { completed: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-9 text-right text-xs font-semibold text-slate-500">{pct}%</span>
      <div className="h-2 flex-1 rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${pct}%`,
            backgroundColor: pct === 100 ? "#61bd4f" : "#0079bf",
          }}
        />
      </div>
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export function CardModal({
  workspaceId,
  boardId,
  taskId,
  onClose,
}: {
  workspaceId: string;
  boardId: string;
  taskId: string;
  onClose: () => void;
}) {
  const [task, setTask] = useState<TaskDetails | null>(null);
  const [isPending, startTransition] = useTransition();

  // title edit
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleVal, setTitleVal] = useState("");

  // desc edit
  const [descEdit, setDescEdit] = useState(false);
  const [descVal, setDescVal] = useState("");

  // checklist item inputs
  const [newItemVals, setNewItemVals] = useState<Record<string, string>>({});
  const [addingItemFor, setAddingItemFor] = useState<string | null>(null);

  // labels panel
  const [showLabels, setShowLabels] = useState(false);

  async function reload() {
    const data = await getTaskDetailsAction(taskId);
    if (data) { setTask(data as any); setDescVal(data.description || ""); setTitleVal(data.title); }
  }

  useEffect(() => { reload(); }, [taskId]);

  // Keyboard escape
  useEffect(() => {
    function handler(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!task) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="flex items-center gap-3 rounded-xl bg-white px-8 py-6 shadow-xl">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <span className="text-sm text-slate-600">Loading card…</span>
        </div>
      </div>
    );
  }

  function handleSaveDesc() {
    startTransition(() => {
      void updateTaskDetailsAction({ workspaceId, boardId, taskId, description: descVal });
      setTask((p) => p ? { ...p, description: descVal } : p);
      setDescEdit(false);
    });
  }

  function handleSaveTitle() {
    if (!titleVal.trim()) return;
    startTransition(() => {
      void updateTaskDetailsAction({ workspaceId, boardId, taskId, title: titleVal.trim() });
      setTask((p) => p ? { ...p, title: titleVal.trim() } : p);
      setEditingTitle(false);
    });
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newDate = e.target.value ? new Date(e.target.value) : null;
    startTransition(() => {
      void updateTaskDetailsAction({ workspaceId, boardId, taskId, dueDate: newDate });
      setTask((p) => p ? { ...p, dueDate: newDate } : p);
    });
  }

  function handleAddChecklist() {
    startTransition(() => {
      void createChecklistAction({ workspaceId, boardId, taskId, title: "Checklist" }).then(reload);
    });
  }

  function handleAddItem(checklistId: string) {
    const val = newItemVals[checklistId]?.trim();
    if (!val) return;
    startTransition(() => {
      void addChecklistItemAction({ workspaceId, boardId, checklistId, title: val }).then(() => {
        setNewItemVals((p) => ({ ...p, [checklistId]: "" }));
        reload();
      });
    });
  }

  function handleToggleItem(itemId: string, isCompleted: boolean) {
    startTransition(() => {
      void toggleChecklistItemAction({ workspaceId, boardId, itemId, isCompleted }).then(reload);
    });
  }

  function handleDeleteItem(itemId: string) {
    startTransition(() => {
      void deleteChecklistItemAction({ workspaceId, boardId, itemId }).then(reload);
    });
  }

  function handleToggleLabel(color: string, name: string) {
    if (!task) return;
    const existing = task.labels.find((l) => l.color === color);
    if (existing) {
      setTask((p) => p ? { ...p, labels: p.labels.filter((l) => l.color !== color) } : p);
      // TODO: call removeLabel server action
    } else {
      const newLabel = { id: `temp-${Date.now()}`, name, color };
      setTask((p) => p ? { ...p, labels: [...p.labels, newLabel] } : p);
      // TODO: call addLabel server action
    }
  }

  const overdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex min-h-full items-start justify-center p-4 sm:p-8">
        <div
          className="relative w-full max-w-2xl rounded-2xl bg-[#f4f5f7] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 z-10 rounded-lg p-2 text-slate-500 hover:bg-black/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Labels banner */}
          {task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-5 pt-4 pb-0">
              {task.labels.map((label) => (
                <span
                  key={label.id}
                  className="inline-flex h-6 items-center rounded px-3 text-xs font-semibold"
                  style={{ backgroundColor: label.color, color: getLabelContrast(label.color) }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <div className="px-5 pt-4 pb-0 pr-14">
            {editingTitle ? (
              <textarea
                autoFocus
                rows={2}
                className="w-full resize-none rounded-lg border-2 border-blue-500 bg-white px-3 py-2 text-xl font-bold text-slate-800 focus:outline-none"
                value={titleVal}
                onChange={(e) => setTitleVal(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSaveTitle(); } if (e.key === "Escape") { setEditingTitle(false); setTitleVal(task.title); } }}
              />
            ) : (
              <h2
                onClick={() => { setEditingTitle(true); setTitleVal(task.title); }}
                className="cursor-pointer text-xl font-bold text-slate-800 hover:bg-black/5 rounded-lg px-2 py-1 -mx-2 transition-colors"
              >
                {task.title}
              </h2>
            )}
          </div>

          {/* Body */}
          <div className="flex flex-col md:flex-row gap-4 p-5">
            {/* Left / main */}
            <div className="flex-1 space-y-6 min-w-0">

              {/* Description */}
              <Section icon={<AlignLeft className="h-5 w-5" />} title="Description">
                {descEdit ? (
                  <div className="space-y-2">
                    <textarea
                      autoFocus
                      rows={5}
                      className="w-full resize-none rounded-lg border-2 border-blue-500 bg-white px-3 py-2 text-sm focus:outline-none"
                      placeholder="Add a more detailed description…"
                      value={descVal}
                      onChange={(e) => setDescVal(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button onClick={handleSaveDesc} className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700">
                        Save
                      </button>
                      <button onClick={() => setDescEdit(false)} className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-black/10">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setDescEdit(true)}
                    className="min-h-[64px] cursor-pointer rounded-lg bg-white/60 hover:bg-white px-3 py-2.5 text-sm text-slate-600 transition-colors"
                  >
                    {task.description || (
                      <span className="text-slate-400">Add a more detailed description…</span>
                    )}
                  </div>
                )}
              </Section>

              {/* Checklists */}
              {task.checklists.map((cl) => {
                const completed = cl.items.filter((i) => i.isCompleted).length;
                return (
                  <Section key={cl.id} icon={<CheckSquare className="h-5 w-5" />} title={cl.title}>
                    <ChecklistProgress completed={completed} total={cl.items.length} />
                    <div className="space-y-1 mb-3">
                      {cl.items.map((item) => (
                        <div key={item.id} className="group flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-black/5">
                          <input
                            type="checkbox"
                            checked={item.isCompleted}
                            onChange={(e) => handleToggleItem(item.id, e.target.checked)}
                            className="h-4 w-4 rounded accent-blue-600 cursor-pointer"
                          />
                          <span className={`flex-1 text-sm ${item.isCompleted ? "text-slate-400 line-through" : "text-slate-700"}`}>
                            {item.title}
                          </span>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="opacity-0 group-hover:opacity-100 rounded p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {addingItemFor === cl.id ? (
                      <div className="space-y-2">
                        <input
                          autoFocus
                          type="text"
                          placeholder="Add an item…"
                          className="w-full rounded-lg border border-blue-400 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newItemVals[cl.id] || ""}
                          onChange={(e) => setNewItemVals((p) => ({ ...p, [cl.id]: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === "Enter") handleAddItem(cl.id); if (e.key === "Escape") setAddingItemFor(null); }}
                        />
                        <div className="flex gap-2">
                          <button onClick={() => handleAddItem(cl.id)} className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700">Add</button>
                          <button onClick={() => setAddingItemFor(null)} className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-black/10"><X className="h-4 w-4" /></button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingItemFor(cl.id)}
                        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-black/5 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Add an item
                      </button>
                    )}
                  </Section>
                );
              })}
            </div>

            {/* Right sidebar */}
            <div className="w-full md:w-44 space-y-4 shrink-0">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Add to card</p>
                
                {/* Labels */}
                <div className="relative">
                  <SidebarBtn
                    icon={<Tag className="h-4 w-4" />}
                    label="Labels"
                    onClick={() => setShowLabels((o) => !o)}
                  />
                  {showLabels && (
                    <div className="absolute right-0 top-10 z-50">
                      <LabelPanel currentLabels={task.labels} onToggle={handleToggleLabel} />
                    </div>
                  )}
                </div>

                <SidebarBtn icon={<CheckSquare className="h-4 w-4" />} label="Checklist" onClick={handleAddChecklist} />
                <SidebarBtn icon={<UserCircle2 className="h-4 w-4" />} label="Members" />
              </div>

              {/* Due date */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Due date</p>
                <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${overdue ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
                  <Clock className="h-4 w-4 shrink-0" />
                  <input
                    type="date"
                    className="bg-transparent text-xs focus:outline-none w-full font-medium cursor-pointer"
                    value={task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""}
                    onChange={handleDateChange}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</p>
                <SidebarBtn icon={<Archive className="h-4 w-4" />} label="Archive" />
              </div>

              {/* Assigned member */}
              {task.assignee && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Members</p>
                  <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white shrink-0">
                      {(task.assignee.name || task.assignee.email).charAt(0).toUpperCase()}
                    </span>
                    <span className="text-xs font-medium text-slate-700 truncate">
                      {task.assignee.name || task.assignee.email}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
