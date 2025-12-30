import { cn } from "@/lib/utils";
import { Spinner } from "./ui/spinner";

export function Loading({ className }: { className?: string }) {
  return (
    <div className={cn("flex justify-center py-5 text-center", className)}>
      <Spinner />
    </div>
  );
}
