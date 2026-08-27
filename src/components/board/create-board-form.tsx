"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createBoardAction } from "@/actions/workspace-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CreateBoardForm({ workspaceId }: { workspaceId: string }) {
  const [state, action] = useFormState(createBoardAction, null);

  return (
    <form action={action} className="flex flex-col gap-4 text-left">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-slate-700">
          Board Title
        </label>
        <Input 
          id="title"
          name="title" 
          placeholder="e.g. Marketing Campaign, Product Roadmap..." 
          required 
          className="w-full"
        />
        {state?.error ? (
          <p className="text-xs text-red-500">{state.error}</p>
        ) : null}
      </div>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creating..." : "Create Board"}
    </Button>
  );
}
