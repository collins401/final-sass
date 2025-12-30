import { TrashIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { SelectTodo } from "@/db/schema";
import { cn } from "@/lib/utils";

export function TodoItem({ todo }: { todo: SelectTodo }) {
  const [isChecked, setIsChecked] = useState(Boolean(todo.completed));
  const isSubmitting = false;
  const id = todo.id.toString();

  return (
    <li className="flex items-center gap-2 p-2 pl-3 hover:bg-accent" key={todo.id}>
      <label className="flex items-center gap-2" htmlFor={id}>
        <Checkbox
          checked={isChecked}
          disabled={isSubmitting}
          id={id}
          name={id}
          onCheckedChange={() => {
            setIsChecked(!isChecked);
          }}
        />
        <span
          className={cn("font-medium", {
            "text-muted-foreground line-through": isChecked,
          })}
        >
          {todo.title}
        </span>
      </label>
      <Button
        className="ml-auto size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        disabled={isSubmitting}
        onClick={() => {}}
        size="icon"
        type="submit"
        variant="ghost"
      >
        <TrashIcon className="size-4" />
      </Button>
    </li>
  );
}
