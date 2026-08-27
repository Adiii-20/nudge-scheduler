"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { createTaskAction } from "@/actions/workspace-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function AddTaskForm({
  workspaceId,
  boardId,
  columnId,
  onTaskAdded,
}: {
  workspaceId: string;
  boardId: string;
  columnId: string;
  onTaskAdded?: () => void;
}) {
  const [state, action] = useFormState(createTaskAction, null);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      router.refresh();
      if (onTaskAdded) {
        onTaskAdded();
      }
    }
  }, [router, state?.success, onTaskAdded]);

  return (
    <form ref={formRef} action={action} className="space-y-2 border-t pt-3">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="boardId" value={boardId} />
      <input type="hidden" name="columnId" value={columnId} />
      <Input name="title" placeholder="Add task" className="h-8 bg-background shadow-none" />
      <details className="group text-xs text-muted-foreground">
        <summary className="cursor-pointer select-none py-1 hover:text-foreground">Details</summary>
        <div className="space-y-2 pt-1">
          <Textarea
            name="description"
            placeholder="Notes or next step"
            className="min-h-14 resize-none bg-background text-xs shadow-none"
          />
          <Input name="dueDate" type="date" className="h-8 bg-background text-xs shadow-none" />
        </div>
      </details>
      <AddButton />
      {state?.error ? <p className="text-xs text-destructive">{state.error}</p> : null}
    </form>
  );
}

function AddButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="ghost" size="sm" className="w-full justify-start px-2 text-muted-foreground hover:text-foreground" disabled={pending}>
      <Plus className="h-4 w-4" /> {pending ? "Adding" : "Add"}
    </Button>
  );
}
