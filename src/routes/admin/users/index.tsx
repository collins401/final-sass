import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  ArrowUpDown,
  Ban,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  KeyRound,
  MoreHorizontal,
  RefreshCw,
  Search,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { PageTitle } from "@/components/admin/page-title";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getUsers, toggleBanUser, updateUserRole } from "@/lib/api/users";
import { authClient } from "@/lib/auth/auth.client";

const usersSearchSchema = z.object({
  page: z.number().catch(1),
  pageSize: z.number().catch(10),
  search: z.string().optional(),
  sort: z.enum(["createdAt", "name", "email"]).catch("createdAt"),
  order: z.enum(["asc", "desc"]).catch("desc"),
});

export const Route = createFileRoute("/admin/users/")({
  component: UsersPage,
  validateSearch: usersSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }) => {
    return context.queryClient.ensureQueryData({
      queryKey: ["users", deps],
      queryFn: () => getUsers({ data: deps }),
    });
  },
});

function UsersPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data } = useSuspenseQuery({
    queryKey: ["users", search],
    queryFn: () => getUsers({ data: search }),
  });

  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState(search.search || "");
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [reseting, setReseting] = useState(false);

  // Generate a random password (8 chars, 1 special char)
  const generatePassword = () => {
    const alnum = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const special = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let retVal = "";

    for (let i = 0; i < 7; ++i) {
      retVal += alnum.charAt(Math.floor(Math.random() * alnum.length));
    }

    const specialChar = special.charAt(Math.floor(Math.random() * special.length));
    const insertPos = Math.floor(Math.random() * 8);
    retVal = retVal.slice(0, insertPos) + specialChar + retVal.slice(insertPos);

    setGeneratedPassword(retVal);
    setCopied(false);
  };

  const handleSearch = () => {
    navigate({
      search: (prev) => ({ ...prev, search: searchInput, page: 1 }),
    });
  };

  const handlePageChange = (newPage: number) => {
    navigate({
      search: (prev) => ({ ...prev, page: newPage }),
    });
  };

  const handleSort = (field: "createdAt" | "name" | "email") => {
    navigate({
      search: (prev) => ({
        ...prev,
        sort: field,
        order: prev.sort === field && prev.order === "asc" ? "desc" : "asc",
      }),
    });
  };

  const updateUserRoleMutation = useMutation({
    mutationFn: updateUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("用户角色已更新");
    },
    onError: () => {
      toast.error("更新角色失败");
    },
  });

  const toggleBanMutation = useMutation({
    mutationFn: toggleBanUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("用户状态已更新");
    },
    onError: () => {
      toast.error("更新状态失败");
    },
  });

  const handleOpenResetDialog = (user: { id: string; name: string }) => {
    setSelectedUser(user);
    generatePassword();
    setResetDialogOpen(true);
  };

  const handleCopyPassword = async () => {
    await navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("密码已复制到剪贴板");
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;
    setReseting(true);
    try {
      await authClient.admin.setUserPassword({
        userId: selectedUser.id,
        password: generatedPassword,
      });
      toast.success("密码修改成功");
      setResetDialogOpen(false);
    } catch {
      toast.error("密码修改失败");
    } finally {
      setReseting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <PageTitle description="管理系统用户、角色与访问权限" title="用户管理" />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="搜索用户姓名或邮箱..."
              value={searchInput}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">用户</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>状态</TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center gap-1 hover:text-foreground">
                  注册时间
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.users.length === 0 ? (
              <TableRow>
                <TableCell className="h-24 text-center" colSpan={5}>
                  暂无匹配用户
                </TableCell>
              </TableRow>
            ) : (
              data.users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage alt={user.name || ""} src={user.image || ""} />
                        <AvatarFallback>{user.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{user.name}</span>
                        <span className="text-muted-foreground text-xs">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className="capitalize"
                      variant={user.role === "admin" ? "default" : "secondary"}
                    >
                      {user.role === "admin" ? "管理员" : "普通用户"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.banned ? (
                      <Badge className="items-center gap-1" variant="destructive">
                        <Ban className="h-3 w-3" /> 已封禁
                      </Badge>
                    ) : (
                      <Badge
                        className="items-center gap-1 border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400"
                        variant="outline"
                      >
                        <CheckCircle2 className="h-3 w-3" /> 正常
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">
                      {format(new Date(user.createdAt), "yyyy-MM-dd HH:mm")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="h-8 w-8" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">菜单</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>操作</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            const newRole = user.role === "admin" ? "user" : "admin";
                            updateUserRoleMutation.mutate({
                              data: { userId: user.id, role: newRole },
                            });
                          }}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          {user.role === "admin" ? "设为普通用户" : "设为管理员"}
                        </DropdownMenuItem>
                        {/* Password Reset Item */}
                        <DropdownMenuItem
                          onClick={() => handleOpenResetDialog({ id: user.id, name: user.name })}
                        >
                          <KeyRound className="mr-2 h-4 w-4" />
                          重置密码
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className={user.banned ? "text-green-600" : "text-destructive"}
                          onClick={() => {
                            toggleBanMutation.mutate({
                              data: { userId: user.id, banned: !user.banned },
                            });
                          }}
                        >
                          {user.banned ? (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" /> 解除封禁
                            </>
                          ) : (
                            <>
                              <Ban className="mr-2 h-4 w-4" /> 封禁账号
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination logic remains identical */}
        <div className="flex items-center justify-between border-t p-4">
          <div className="text-muted-foreground text-sm">
            共 {data.total} 名用户，当前第 {data.page} 页
          </div>
          <div className="flex items-center gap-2">
            <Button
              disabled={data.page === 1}
              onClick={() => handlePageChange(Math.max(1, data.page - 1))}
              size="sm"
              variant="outline"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              上一页
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, data.totalPages || 1) }, (_, i) => {
                let p = i + 1;
                if (data.totalPages > 5 && data.page > 3) {
                  p = data.page - 2 + i;
                }
                if (p > data.totalPages) return null;

                return (
                  <Button
                    className="h-8 w-8 p-0"
                    key={p}
                    onClick={() => handlePageChange(p)}
                    size="sm"
                    variant={p === data.page ? "default" : "ghost"}
                  >
                    {p}
                  </Button>
                );
              })}
            </div>
            <Button
              disabled={data.page >= data.totalPages}
              onClick={() => handlePageChange(Math.min(data.totalPages, data.page + 1))}
              size="sm"
              variant="outline"
            >
              下一页
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Reset Password Dialog */}
      <Dialog onOpenChange={setResetDialogOpen} open={resetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>重置密码</DialogTitle>
            <DialogDescription>
              正在为用户 <strong>{selectedUser?.name}</strong>{" "}
              重置密码。系统已自动生成高强度随机密码，请复制后使用。
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 py-4">
            <div className="grid flex-1 gap-2">
              <Label className="sr-only" htmlFor="password">
                Password
              </Label>
              <div className="relative">
                <Input
                  className="pr-10 font-mono"
                  id="password"
                  readOnly
                  value={generatedPassword}
                />
                <Button
                  className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                  onClick={generatePassword}
                  size="icon"
                  title="刷新密码"
                  variant="ghost"
                >
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
            <Button className="px-3" onClick={handleCopyPassword} size="sm" type="submit">
              <span className="sr-only">Copy</span>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <DialogFooter className="justify-end sm:justify-between">
            <div className="flex items-center text-muted-foreground text-xs">
              <Shield className="mr-1 h-3 w-3" /> 仅管理员可操作
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setResetDialogOpen(false)} type="button" variant="secondary">
                取消
              </Button>
              <Button disabled={reseting} onClick={handleResetPassword} type="button">
                {reseting ? "正在修改..." : "确认修改"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
