import { Ship } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "./ui/button";
export function DataEmpty({ children }: { children?: any }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Ship />
        </EmptyMedia>
        <EmptyTitle>Data Empty</EmptyTitle>
        <EmptyDescription>No data found.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button>Back home</Button>
          <Button variant="outline">Import Project</Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}
