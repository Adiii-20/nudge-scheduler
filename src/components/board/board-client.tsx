"use client";

import { useEffect, useMemo, useState, useTransition, useRef } from "react";
import {
  CalendarDays, CheckSquare, MessageSquare, Plus, MoreHorizontal,
  Trash, Search, Filter, X, Star, ChevronDown, ChevronUp, Zap
} from "lucide-react";
import {
  moveTaskAction, createColumnAction, renameColumnAction,
  deleteColumnAction, moveColumnAction,
} from "@/actions/workspace-actions";
import { AddTaskForm } from "@/components/board/add-task-form";
import { CardModal } from "@/components/board/card-modal";
import { cn } from "@/utils/cn";

type Task = {
  id: string;
  title: string;
  description: string | null;
  position: number;
  dueDate: string | null;
  assignee: { id: string; name: string | null; email: string } | null;
  commentsCount: number;
  labels: { id: string; name: string | null; color: string }[];
  checklists: { items: { isCompleted: boolean }[] }[];
};

type Column = {
  id: string;
  title: string;
  position: number;
  tasks: Task[];
};

// ─── Label colours ────────────────────────────────────────────────────────────
const LABEL_TEXT: Record<string, string> = {
  "#61bd4f": "#1e6823", "#f2d600": "#7a6200", "#ff9f1a": "#a65200",
  "#eb5a46": "#8e1a0e", "#c377e0": "#5e1e78", "#0079bf": "#023d6b",
  "#00c2e0": "#005e6e", "#51e898": "#1a6b38", "#ff78cb": "#8e1a5b",
  "#344563": "#fff",
};
function getLabelTextColor(bg: string) { return LABEL_TEXT[bg.toLowerCase()] ?? "#1a1a1a"; }

function formatDueDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(value));
}
function isOverdue(value: string | null) {
  if (!value) return false;
  return new Date(value) < new Date();
}

// ─── Board top-bar ────────────────────────────────────────────────────────────
function BoardTopBar({
  boardTitle, searchQuery, setSearchQuery, filterUserId, setFilterUserId, allUsers,
}: {
  boardTitle: string;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  filterUserId: string;
  setFilterUserId: (v: string) => void;
  allUsers: { id: string; name: string | null; email: string }[];
}) {
  const [starred, setStarred] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2 px-3 sm:px-4 py-2.5 bg-black/20 backdrop-blur-sm text-white">
      <h1 className="text-base sm:text-lg font-bold tracking-tight mr-1 truncate max-w-[180px] sm:max-w-none">{boardTitle}</h1>
      <button onClick={() => setStarred(s => !s)} className="rounded p-1 hover:bg-white/20 transition-colors shrink-0" title="Star board">
        <Star className={cn("h-4 w-4", starred ? "fill-yellow-300 text-yellow-300" : "text-white/70")} />
      </button>

      <div className="mx-1 h-5 w-px bg-white/30 hidden sm:block" />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/60" />
        <input
          type="text"
          placeholder="Search cards…"
          className="h-8 rounded bg-white/20 pl-8 pr-3 text-sm text-white placeholder-white/60 focus:bg-white/30 focus:outline-none w-28 sm:w-36 focus:w-36 sm:focus:w-52 transition-all"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="relative">
        <button
          onClick={() => setFilterOpen(o => !o)}
          className={cn(
            "flex items-center gap-1 rounded px-2 h-8 text-sm font-medium transition-colors",
            filterOpen || filterUserId !== "all" ? "bg-white/30 text-white" : "hover:bg-white/20 text-white/80"
          )}
        >
          <Filter className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{filterUserId === "all" ? "Filter" : "Filtered"}</span>
          <ChevronDown className="h-3 w-3" />
        </button>
        {filterOpen && (
          <div className="absolute left-0 top-10 z-50 w-52 rounded-lg bg-white shadow-xl border border-slate-100 py-1 text-slate-800">
            <p className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Filter by member</p>
            <button onClick={() => { setFilterUserId("all"); setFilterOpen(false); }} className={cn("w-full text-left px-3 py-2 text-sm hover:bg-slate-50", filterUserId === "all" && "font-semibold text-blue-600")}>
              All members
            </button>
            {allUsers.map(u => (
              <button key={u.id} onClick={() => { setFilterUserId(u.id); setFilterOpen(false); }} className={cn("w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2", filterUserId === u.id && "font-semibold text-blue-600")}>
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                  {(u.name || u.email).charAt(0).toUpperCase()}
                </span>
                {u.name || u.email}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Member avatars */}
      <div className="flex -space-x-1">
        {allUsers.slice(0, 4).map(u => (
          <span key={u.id} title={u.name || u.email}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white ring-2 ring-white/40 cursor-pointer hover:ring-white transition-all">
            {(u.name || u.email).charAt(0).toUpperCase()}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Column header ────────────────────────────────────────────────────────────
function ColumnHeader({
  column, onRename, onDelete, dragHandleProps, isCollapsed, onToggleCollapse,
}: {
  column: Column;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(column.title);
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function commit() {
    if (val.trim() && val.trim() !== column.title) onRename(column.id, val.trim());
    setEditing(false);
  }

  return (
    <div className="flex items-center gap-1 px-1 group" {...dragHandleProps}>
      {editing ? (
        <input
          ref={inputRef} autoFocus
          className="flex-1 rounded bg-white px-2 py-1 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-blue-400"
          value={val}
          onChange={e => setVal(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setVal(column.title); setEditing(false); } }}
        />
      ) : (
        <button onClick={() => setEditing(true)} className="flex-1 text-left truncate text-sm font-semibold text-slate-800 px-2 py-1 rounded hover:bg-black/5">
          {column.title}
          <span className="ml-2 text-xs font-normal text-slate-500">{column.tasks.length}</span>
        </button>
      )}

      {/* Mobile collapse toggle */}
      {onToggleCollapse && (
        <button onClick={onToggleCollapse} className="rounded p-1.5 text-slate-500 hover:bg-black/10 transition-all lg:hidden">
          {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
      )}

      <div className="relative">
        <button onClick={() => setMenuOpen(o => !o)} className="rounded p-1.5 opacity-0 group-hover:opacity-100 hover:bg-black/10 text-slate-600 transition-all">
          <MoreHorizontal className="h-4 w-4" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-8 z-50 w-44 rounded-lg bg-white shadow-xl border border-slate-100 py-1">
            <button onClick={() => { setEditing(true); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 text-slate-700">Rename list</button>
            <button onClick={() => { if (confirm("Delete this list and all its cards?")) onDelete(column.id); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600">Delete list</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Task card ────────────────────────────────────────────────────────────────
function TaskCard({ task, isDragging, onDragStart, onDragEnd, onClick }: {
  task: Task; isDragging: boolean; onDragStart: () => void; onDragEnd: () => void; onClick: () => void;
}) {
  const allItems = task.checklists.flatMap(c => c.items);
  const totalItems = allItems.length;
  const completedItems = allItems.filter(i => i.isCompleted).length;
  const allDone = totalItems > 0 && completedItems === totalItems;
  const overdue = isOverdue(task.dueDate);

  return (
    <article
      draggable
      onDragStart={e => { e.stopPropagation(); onDragStart(); }}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={cn(
        "group cursor-pointer rounded-lg bg-white border border-slate-200/60 shadow-sm",
        "hover:shadow-md hover:border-slate-300 transition-all duration-150 active:cursor-grabbing",
        isDragging && "opacity-40 ring-2 ring-blue-400 shadow-lg scale-95"
      )}
    >
      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 px-3 pt-2.5">
          {task.labels.map(label => (
            <span key={label.id}
              className="inline-flex h-2 min-w-[2.5rem] rounded-full text-[10px] font-semibold px-2 items-center"
              style={{ backgroundColor: label.color, color: getLabelTextColor(label.color) }}
              title={label.name ?? ""}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}
      <div className="p-3">
        <p className="text-sm font-medium leading-snug text-slate-800 mb-1">{task.title}</p>
        {task.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-500 mb-2">{task.description}</p>
        )}
        {(task.dueDate || totalItems > 0 || task.commentsCount > 0 || task.assignee) && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {task.dueDate && (
              <span className={cn("inline-flex items-center gap-1 rounded text-xs font-medium px-1.5 py-0.5", overdue ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600")}>
                <CalendarDays className="h-3 w-3" />{formatDueDate(task.dueDate)}
              </span>
            )}
            {totalItems > 0 && (
              <span className={cn("inline-flex items-center gap-1 rounded text-xs font-medium px-1.5 py-0.5", allDone ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600")}>
                <CheckSquare className="h-3 w-3" />{completedItems}/{totalItems}
              </span>
            )}
            {task.commentsCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                <MessageSquare className="h-3 w-3" />{task.commentsCount}
              </span>
            )}
            <div className="flex-1" />
            {task.assignee && (
              <span title={task.assignee.name || task.assignee.email}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-[10px] font-bold text-white ring-1 ring-white">
                {(task.assignee.name || task.assignee.email).charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

// ─── Inline add-card ──────────────────────────────────────────────────────────
function InlineAddCard({ workspaceId, boardId, columnId }: { workspaceId: string; boardId: string; columnId: string }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mt-1 flex w-full items-center gap-1.5 rounded-lg px-2 py-2 text-sm text-slate-600 hover:bg-black/5 transition-colors">
        <Plus className="h-4 w-4" /> Add a card
      </button>
    );
  }
  return (
    <div className="mt-1">
      <AddTaskForm workspaceId={workspaceId} boardId={boardId} columnId={columnId} onTaskAdded={() => setOpen(false)} />
      <button onClick={() => setOpen(false)} className="mt-1 flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 px-1">
        <X className="h-3.5 w-3.5" /> Close
      </button>
    </div>
  );
}

// ─── Mobile column (collapsible accordion) ────────────────────────────────────
function MobileColumn({
  column, workspaceId, boardId, draggedTaskId, setDraggedTaskId,
  onRename, onDelete, onSelectTask, onDrop,
}: {
  column: Column; workspaceId: string; boardId: string;
  draggedTaskId: string | null; setDraggedTaskId: (id: string | null) => void;
  onRename: (id: string, title: string) => void; onDelete: (id: string) => void;
  onSelectTask: (id: string) => void;
  onDrop: (columnId: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section
      onDragOver={e => e.preventDefault()}
      onDrop={e => { e.stopPropagation(); onDrop(column.id); }}
      className={cn(
        "w-full rounded-xl bg-[#f1f2f4] shadow-sm border border-slate-200/60 transition-all",
        draggedTaskId && "ring-2 ring-blue-300"
      )}
    >
      {/* Column header */}
      <div className="px-3 pt-3 pb-2">
        <ColumnHeader
          column={column}
          onRename={onRename}
          onDelete={onDelete}
          isCollapsed={collapsed}
          onToggleCollapse={() => setCollapsed(c => !c)}
        />
      </div>

      {/* Cards — collapsible */}
      {!collapsed && (
        <>
          <div className="px-3 space-y-2 pb-1 max-h-80 overflow-y-auto">
            {column.tasks.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4 italic">No cards yet</p>
            )}
            {column.tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                isDragging={draggedTaskId === task.id}
                onDragStart={() => setDraggedTaskId(task.id)}
                onDragEnd={() => setDraggedTaskId(null)}
                onClick={() => onSelectTask(task.id)}
              />
            ))}
          </div>
          <div className="px-3 pb-3">
            <InlineAddCard workspaceId={workspaceId} boardId={boardId} columnId={column.id} />
          </div>
        </>
      )}

      {/* Collapsed summary */}
      {collapsed && (
        <div className="px-3 pb-3">
          <p className="text-xs text-slate-500">{column.tasks.length} card{column.tasks.length !== 1 ? "s" : ""}</p>
        </div>
      )}
    </section>
  );
}

// ─── Desktop column (horizontal Kanban) ──────────────────────────────────────
function DesktopColumn({
  column, index, workspaceId, boardId,
  draggedTaskId, setDraggedTaskId, draggedColumnId, setDraggedColumnId,
  dropTargetColumnId, setDropTargetColumnId,
  onRename, onDelete, onSelectTask, moveTask, moveColumn,
}: {
  column: Column; index: number; workspaceId: string; boardId: string;
  draggedTaskId: string | null; setDraggedTaskId: (id: string | null) => void;
  draggedColumnId: string | null; setDraggedColumnId: (id: string | null) => void;
  dropTargetColumnId: string | null; setDropTargetColumnId: (id: string | null) => void;
  onRename: (id: string, title: string) => void; onDelete: (id: string) => void;
  onSelectTask: (id: string) => void;
  moveTask: (taskId: string, colId: string) => void;
  moveColumn: (colId: string, targetIndex: number) => void;
}) {
  return (
    <section
      draggable
      onDragStart={e => { if (!draggedTaskId) setDraggedColumnId(column.id); else e.preventDefault(); }}
      onDragEnd={() => { setDraggedColumnId(null); setDropTargetColumnId(null); }}
      onDragOver={e => { e.preventDefault(); setDropTargetColumnId(column.id); }}
      onDrop={e => {
        e.stopPropagation();
        if (draggedTaskId) { moveTask(draggedTaskId, column.id); setDraggedTaskId(null); }
        else if (draggedColumnId && draggedColumnId !== column.id) { moveColumn(draggedColumnId, index); setDraggedColumnId(null); }
        setDropTargetColumnId(null);
      }}
      className={cn(
        "flex w-[272px] shrink-0 flex-col rounded-xl bg-[#f1f2f4] shadow-sm transition-all duration-200",
        "max-h-[calc(100vh-120px)]",
        draggedColumnId === column.id && "opacity-40 scale-95",
        dropTargetColumnId === column.id && draggedTaskId && "ring-2 ring-blue-400"
      )}
    >
      <div className="px-2 pt-2">
        <ColumnHeader column={column} onRename={onRename} onDelete={onDelete} />
      </div>
      <div className="flex-1 overflow-y-auto px-2 space-y-2 pb-1 min-h-[2px]">
        {column.tasks.map(task => (
          <TaskCard
            key={task.id} task={task}
            isDragging={draggedTaskId === task.id}
            onDragStart={() => setDraggedTaskId(task.id)}
            onDragEnd={() => setDraggedTaskId(null)}
            onClick={() => onSelectTask(task.id)}
          />
        ))}
      </div>
      <div className="px-2 pb-2">
        <InlineAddCard workspaceId={workspaceId} boardId={boardId} columnId={column.id} />
      </div>
    </section>
  );
}

// ─── Main BoardClient ─────────────────────────────────────────────────────────
export function BoardClient({
  workspaceId, boardId, boardTitle = "Board", initialColumns,
}: {
  workspaceId: string; boardId: string; boardTitle?: string; initialColumns: Column[];
}) {
  const [columns, setColumns] = useState(initialColumns);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
  const [dropTargetColumnId, setDropTargetColumnId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUserId, setFilterUserId] = useState("all");

  const taskIndex = useMemo(() => {
    const index = new Map<string, Task>();
    columns.forEach(col => col.tasks.forEach(t => index.set(t.id, t)));
    return index;
  }, [columns]);

  useEffect(() => { setColumns(initialColumns); }, [initialColumns]);

  const allUsers = useMemo(() => {
    const users = new Map<string, { id: string; name: string | null; email: string }>();
    columns.forEach(col => col.tasks.forEach(t => { if (t.assignee) users.set(t.assignee.id, t.assignee); }));
    return Array.from(users.values());
  }, [columns]);

  const filteredColumns = columns.map(col => ({
    ...col,
    tasks: col.tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesUser = filterUserId === "all" || t.assignee?.id === filterUserId;
      return matchesSearch && matchesUser;
    }),
  }));

  function moveTask(taskId: string, targetColumnId: string) {
    const task = taskIndex.get(taskId);
    if (!task) return;
    const prev = columns;
    let targetPosition = 0;
    const next = columns.map(col => {
      const without = col.tasks.filter(item => item.id !== taskId);
      if (col.id !== targetColumnId) return { ...col, tasks: without };
      targetPosition = without.length;
      return { ...col, tasks: [...without, { ...task, position: targetPosition }] };
    });
    setColumns(next);
    void moveTaskAction({ workspaceId, boardId, taskId, columnId: targetColumnId, position: targetPosition })
      .then((r: any) => { if (r?.error) setColumns(prev); });
  }

  function moveColumn(columnId: string, targetIndex: number) {
    const prev = columns;
    const col = columns.find(c => c.id === columnId);
    if (!col) return;
    const rest = columns.filter(c => c.id !== columnId);
    rest.splice(targetIndex, 0, col);
    setColumns(rest.map((c, i) => ({ ...c, position: i })));
    startTransition(() => { void moveColumnAction({ workspaceId, boardId, columnId, position: targetIndex }); });
  }

  function handleCreateList(e: React.FormEvent) {
    e.preventDefault();
    const title = newListTitle.trim();
    if (!title) return;
    setIsAddingList(false);
    setNewListTitle("");
    startTransition(() => {
      const fd = new FormData();
      fd.append("workspaceId", workspaceId);
      fd.append("boardId", boardId);
      fd.append("title", title);
      void createColumnAction(null, fd);
    });
  }

  function handleRenameList(columnId: string, title: string) {
    const prev = columns;
    setColumns(cols => cols.map(c => c.id === columnId ? { ...c, title } : c));
    startTransition(() => { void renameColumnAction({ workspaceId, boardId, columnId, title }).then((r: any) => { if (r?.error) setColumns(prev); }); });
  }

  function handleDeleteList(columnId: string) {
    const prev = columns;
    setColumns(cols => cols.filter(c => c.id !== columnId));
    startTransition(() => { void deleteColumnAction({ workspaceId, boardId, columnId }).then((r: any) => { if (r?.error) setColumns(prev); }); });
  }

  return (
    <div className="flex flex-col h-full">
      <BoardTopBar
        boardTitle={boardTitle}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        filterUserId={filterUserId} setFilterUserId={setFilterUserId}
        allUsers={allUsers}
      />

      {/* ── MOBILE: vertical stacked columns ── */}
      <div className={cn("flex flex-col gap-3 p-3 lg:hidden overflow-y-auto flex-1", isPending && "opacity-80 pointer-events-none")}>
        {filteredColumns.map(column => (
          <MobileColumn
            key={column.id}
            column={column}
            workspaceId={workspaceId}
            boardId={boardId}
            draggedTaskId={draggedTaskId}
            setDraggedTaskId={setDraggedTaskId}
            onRename={handleRenameList}
            onDelete={handleDeleteList}
            onSelectTask={setSelectedTaskId}
            onDrop={(colId) => {
              if (draggedTaskId) { moveTask(draggedTaskId, colId); setDraggedTaskId(null); }
            }}
          />
        ))}

        {/* Add list — mobile */}
        {isAddingList ? (
          <form onSubmit={handleCreateList} className="rounded-xl bg-[#f1f2f4] p-3 shadow-sm">
            <input
              autoFocus placeholder="Enter list title…"
              className="w-full rounded-lg border border-blue-400 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={newListTitle} onChange={e => setNewListTitle(e.target.value)}
              onKeyDown={e => e.key === "Escape" && setIsAddingList(false)}
            />
            <div className="mt-2 flex items-center gap-2">
              <button type="submit" className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">Add list</button>
              <button type="button" onClick={() => setIsAddingList(false)} className="rounded-lg p-1.5 text-slate-600 hover:bg-black/10">
                <X className="h-4 w-4" />
              </button>
            </div>
          </form>
        ) : (
          <button onClick={() => setIsAddingList(true)} className="flex w-full items-center gap-2 rounded-xl bg-white/60 hover:bg-white/90 px-4 py-3 text-sm font-semibold text-slate-700 transition-all shadow-sm">
            <Plus className="h-4 w-4" /> Add another list
          </button>
        )}
      </div>

      {/* ── DESKTOP: horizontal scrolling Kanban ── */}
      <div className={cn("hidden lg:flex gap-3 overflow-x-auto p-4 items-start flex-1 w-full", isPending && "opacity-80 pointer-events-none")}>
        {filteredColumns.map((column, index) => (
          <DesktopColumn
            key={column.id}
            column={column} index={index}
            workspaceId={workspaceId} boardId={boardId}
            draggedTaskId={draggedTaskId} setDraggedTaskId={setDraggedTaskId}
            draggedColumnId={draggedColumnId} setDraggedColumnId={setDraggedColumnId}
            dropTargetColumnId={dropTargetColumnId} setDropTargetColumnId={setDropTargetColumnId}
            onRename={handleRenameList} onDelete={handleDeleteList}
            onSelectTask={setSelectedTaskId}
            moveTask={moveTask} moveColumn={moveColumn}
          />
        ))}

        {/* Add list — desktop */}
        <div className="w-[272px] shrink-0">
          {isAddingList ? (
            <form onSubmit={handleCreateList} className="rounded-xl bg-[#f1f2f4] p-3 shadow-sm">
              <input
                autoFocus placeholder="Enter list title…"
                className="w-full rounded-lg border border-blue-400 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={newListTitle} onChange={e => setNewListTitle(e.target.value)}
                onKeyDown={e => e.key === "Escape" && setIsAddingList(false)}
              />
              <div className="mt-2 flex items-center gap-2">
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">Add list</button>
                <button type="button" onClick={() => setIsAddingList(false)} className="rounded-lg p-1.5 text-slate-600 hover:bg-black/10">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </form>
          ) : (
            <button onClick={() => setIsAddingList(true)} className="flex w-full items-center gap-2 rounded-xl bg-white/60 hover:bg-white/90 px-4 py-3 text-sm font-semibold text-slate-700 transition-all shadow-sm">
              <Plus className="h-4 w-4" /> Add another list
            </button>
          )}
        </div>
      </div>

      {/* Card modal */}
      {selectedTaskId && (
        <CardModal workspaceId={workspaceId} boardId={boardId} taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
      )}
    </div>
  );
}
