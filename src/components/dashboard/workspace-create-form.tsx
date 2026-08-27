"use client";

import { useFormState } from "react-dom";
import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { createWorkspaceAction } from "@/actions/workspace-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function WorkspaceCreateForm() {
  const [state, action] = useFormState(createWorkspaceAction, null);

  return (
    <form action={action} className="flex gap-2">
      <Input name="name" placeholder="New workspace" className="max-w-56" />
      <CreateButton />
      {state?.error ? <p className="self-center text-sm text-destructive">{state.error}</p> : null}
    </form>
  );
}

function CreateButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="outline" disabled={pending}>
      <Plus className="h-4 w-4" /> {pending ? "Creating..." : "Create"}
    </Button>
  );
}
