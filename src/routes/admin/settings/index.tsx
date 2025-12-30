import { createFileRoute } from "@tanstack/react-router";
import { Bell, Monitor, Palette, UserCog, Wrench } from "lucide-react";
import * as z from "zod/v4";
import { PageTitle } from "@/components/admin/page-title";
import { BaseSettings } from "@/components/admin/settings/base-settings";
import { SidebarNav } from "@/components/admin/settings/sidebar-nav";

export const Route = createFileRoute("/admin/settings/")({
  component: RouteComponent,
  validateSearch: z.object({
    tab: z.string().optional().default("base"),
  }),
});

function RouteComponent() {
  const { tab } = Route.useSearch();
  const sidebarNavItems = [
    {
      title: "基本信息",
      href: "base",
      icon: <UserCog size={18} />,
    },
    {
      title: "账户设置",
      href: "account",
      icon: <Wrench size={18} />,
    },
    {
      title: "外观设置",
      href: "appearance",
      icon: <Palette size={18} />,
    },
    {
      title: "消息通知",
      href: "notifications",
      icon: <Bell size={18} />,
    },
    {
      title: "显示设置",
      href: "display",
      icon: <Monitor size={18} />,
    },
  ];
  return (
    <>
      <PageTitle description="管理您的网站基本信息和各项偏好设置" hasSeparator title="网站设置" />
      <div className="flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="top-0 lg:sticky lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex w-full overflow-y-hidden p-1">
          {tab === "base" && <BaseSettings />}
          {/* {tab === 'account' && <AccountSettings />}
          {tab === 'appearance' && <AppearanceSettings />}
          {tab === 'notifications' && <NotificationsSettings />}
          {tab === 'display' && <DisplaySettings />} */}
        </div>
      </div>
    </>
  );
}
