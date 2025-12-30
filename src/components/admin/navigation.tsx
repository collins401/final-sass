import {
  BookOpen,
  BookUser,
  MessageCircleMore,
  Paperclip,
  Server,
  Settings2,
  Sparkles,
  SquareTerminal,
  UsersIcon,
} from "lucide-react";
import type { ComponentType } from "react";

export type IconType = ComponentType<{
  className?: string;
  size?: number | string;
}>;

export interface BaseNavItem {
  title: string;
  icon?: IconType;
  badge?: string | number;
}

export interface NavItemLink extends BaseNavItem {
  url: string;
  items?: undefined; // Discriminator to differentiate from NavItemCollapsible
}

export interface NavItemCollapsible extends BaseNavItem {
  items: NavItemLink[]; // Sub-items are always links and cannot have further sub-items
  url?: string; // Optional, for cases where the collapsible item itself might have a base path
}

export type NavItemUnion = NavItemLink | NavItemCollapsible;

export interface NavGroupData {
  id: string;
  title?: string;
  items: NavItemUnion[];
}

export const navigationGroups: NavGroupData[] = [
  {
    id: "nav-c",
    title: "Contents",
    items: [
      {
        icon: SquareTerminal,
        title: "文章管理",
        url: "/admin/posts",
        items: [
          {
            title: "新建",
            url: "/admin/posts/edit",
          },
          {
            title: "文章列表",
            url: "/admin/posts/list",
          },
          {
            title: "文章分类",
            url: "/admin/posts/category",
          },
        ],
      },
      {
        icon: Server,
        title: "产品管理",
        url: "/admin/products",
        items: [
          {
            title: "新建",
            url: "/admin/products/edit",
          },
          {
            title: "产品列表",
            url: "/admin/products/list",
          },
          {
            title: "产品分类",
            url: "/admin/products/category",
          },
        ],
      },
      {
        title: "招聘管理",
        icon: BookUser,
        url: "/admin/jobs",
      },
      {
        title: "页面管理",
        icon: BookOpen,
        url: "/admin/pages",
      },
      {
        title: "评论管理",
        icon: MessageCircleMore,
        url: "/admin/comments",
      },
      {
        title: "媒体附件",
        icon: Paperclip,
        url: "/admin/media",
      },
    ],
  },
  {
    id: "nav-b",
    title: "Settings",
    items: [
      {
        icon: Settings2,
        title: "网站设置",
        url: "/admin/settings",
      },
      {
        icon: UsersIcon,
        title: "用户管理",
        url: "/admin/users",
      },
      {
        icon: Sparkles,
        title: "AI设置",
        url: "/admin/copilot",
      },
    ],
  },
];
