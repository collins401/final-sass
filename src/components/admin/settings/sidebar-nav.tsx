import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { type JSX, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type SidebarNavProps = React.HTMLAttributes<HTMLElement> & {
  items: {
    href: string;
    title: string;
    icon: JSX.Element;
  }[];
};

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const { tab } = useSearch({ from: "/admin/settings/" });
  const navigate = useNavigate();
  const [val, setVal] = useState(tab ?? "base");

  const handleSelect = (e: string) => {
    setVal(e);
    navigate({ to: "/admin/settings", search: { tab: e } });
  };

  return (
    <>
      <div className="p-1 md:hidden">
        <Select onValueChange={handleSelect} value={val}>
          <SelectTrigger className="h-12 sm:w-48">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.href} value={item.href}>
                <div className="flex gap-x-4 px-2 py-1">
                  <span className="scale-125">{item.icon}</span>
                  <span className="text-md">{item.title}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="hidden w-full min-w-40 bg-background px-1 md:block" type="always">
        <nav
          className={cn("flex space-x-2 py-1 lg:flex-col lg:space-x-0 lg:space-y-1", className)}
          {...props}
        >
          {items.map((item) => (
            <Link
              className={cn(
                buttonVariants({ variant: "ghost" }),
                tab === item.href ? "bg-muted hover:bg-accent" : "hover:bg-accent hover:underline",
                "justify-start"
              )}
              key={item.href}
              search={{ tab: item.href }}
              to="/admin/settings"
            >
              <span className="me-2">{item.icon}</span>
              {item.title}
            </Link>
          ))}
        </nav>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </>
  );
}
