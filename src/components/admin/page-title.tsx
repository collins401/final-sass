import { Separator } from "../ui/separator";

interface PageTitleProps {
  title: string;
  description: string;
  hasSeparator?: boolean;
  extra?: React.ReactNode;
}
export function PageTitle({ title, description, hasSeparator = false, extra }: PageTitleProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h1 className="font-bold text-2xl tracking-tight md:text-3xl">{title}</h1>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
        {extra}
      </div>
      {hasSeparator && <Separator className="my-4 lg:my-6" />}
    </>
  );
}
