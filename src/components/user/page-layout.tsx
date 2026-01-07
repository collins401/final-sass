import type React from "react";

interface PageLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  extra?: React.ReactNode;
}
export function PageLayout(props: PageLayoutProps) {
  const { title, description, children, extra } = props;
  return (
    <>
      <div className="my-6 flex items-center justify-between border-b pb-3">
        <div className="space-y-0.5">
          <h1 className="font-bold text-xl tracking-tight md:text-3xl">{title}</h1>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
        {extra}
      </div>
      <div>{children}</div>
    </>
  );
}
