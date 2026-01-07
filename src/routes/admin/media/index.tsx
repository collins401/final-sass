import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  FileIcon,
  MoreHorizontal,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteMedia, getMedia, uploadMedia } from "@/lib/api/media";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/media/")({
  component: MediaPage,
  loader: async () => await getMedia({ data: { page: 1, pageSize: 50 } }),
});

// Types for local upload state
interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  previewUrl?: string; // For immediate feedback
}

function MediaPage() {
  const initialData = Route.useLoaderData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Data Query
  const { data: mediaData, refetch } = useQuery({
    queryKey: ["media"],
    queryFn: () => getMedia({ data: { page: 1, pageSize: 50 } }),
    initialData,
  });

  const uploadMutation = useMutation({
    mutationFn: uploadMedia,
    onSuccess: () => {
      refetch();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMedia,
    onSuccess: () => {
      toast.success("已删除");
      refetch();
    },
  });

  // --- File Processing Logic ---

  const addToQueue = (files: File[]) => {
    const newItems: UploadItem[] = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      progress: 0,
      status: "pending",
      previewUrl: URL.createObjectURL(file), // Create object URL instead of reading the file completely
    }));

    setUploadQueue((prev) => [...prev, ...newItems]);
    processQueue(newItems);
  };

  const processQueue = async (items: UploadItem[]) => {
    for (const item of items) {
      updateItemStatus(item.id, "uploading", 0);

      try {
        // Simulate upload progress
        // In a real app, axios/xhr would provide progress events
        for (let i = 10; i <= 90; i += 20) {
          await new Promise((r) => setTimeout(r, 150));
          updateItemStatus(item.id, "uploading", i);
        }

        // Get Dimensions if image
        let width, height;
        if (item.file.type.startsWith("image/")) {
          const img = new Image();
          img.src = item.previewUrl || "";
          await new Promise((resolve) => {
            img.onload = resolve;
          });
          width = img.width;
          height = img.height;
        }

        // Read file as Base64 (simulating server URL return)
        const reader = new FileReader();
        const base64Url = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(item.file);
        });

        await uploadMutation.mutateAsync({
          data: {
            filename: item.file.name,
            size: item.file.size,
            mimetype: item.file.type,
            url: base64Url,
            width,
            height,
          },
        });

        updateItemStatus(item.id, "success", 100);
      } catch (error) {
        console.error(error);
        updateItemStatus(item.id, "error", 0);
        toast.error(`上传失败: ${item.file.name}`);
      }
    }
  };

  const updateItemStatus = (id: string, status: UploadItem["status"], progress: number) => {
    setUploadQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status, progress } : item))
    );
  };

  const removeFromQueue = (id: string) => {
    setUploadQueue((prev) => prev.filter((i) => i.id !== id));
  };

  // --- Event Handlers ---

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      addToQueue(Array.from(e.dataTransfer.files));
    }
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("已复制到剪贴板");
  };

  return (
    <>
      <div className="mb-8 flex flex-col items-end justify-between border-zinc-100 border-b pb-6 md:flex-row dark:border-zinc-800">
        <div>
          <h1 className="mb-2 font-light text-3xl tracking-tight">媒体库</h1>
          <p className="text-sm text-zinc-500">管理您的媒体资源和附件。</p>
        </div>

        <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full px-6">
              <Plus className="mr-2 h-4 w-4" />
              上传媒体
            </Button>
          </DialogTrigger>
          <DialogContent className="border-zinc-100 bg-zinc-50 sm:max-w-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <DialogHeader>
              <DialogTitle>上传资源</DialogTitle>
              <DialogDescription>拖拽文件到此处或点击浏览。</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div
                className={cn(
                  "cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all duration-300",
                  isDragging
                    ? "border-zinc-900 bg-zinc-100 dark:border-zinc-50 dark:bg-zinc-800"
                    : "border-zinc-200 hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
                )}
                onClick={() => fileInputRef.current?.click()}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  className="hidden"
                  multiple
                  onChange={(e) => e.target.files && addToQueue(Array.from(e.target.files))}
                  ref={fileInputRef}
                  type="file"
                />
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <Upload className="h-8 w-8 text-zinc-400" />
                </div>
                <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                  点击上传或拖拽文件
                </p>
                <p className="mt-2 text-xs text-zinc-500">支持 SVG, PNG, JPG 或 GIF (最大 10MB)</p>
              </div>

              {/* Upload List */}
              {uploadQueue.length > 0 && (
                <div className="max-h-[300px] space-y-3 overflow-y-auto pr-2">
                  {uploadQueue.map((item) => (
                    <div
                      className="flex items-center gap-4 rounded-lg border border-zinc-100 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
                      key={item.id}
                    >
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-zinc-100">
                        {item.file.type.startsWith("image/") ? (
                          <img
                            alt=""
                            className="h-full w-full object-cover"
                            src={item.previewUrl}
                          />
                        ) : (
                          <FileIcon className="m-auto mt-2.5 h-5 w-5 text-zinc-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1.5 flex justify-between">
                          <p className="truncate pr-4 font-medium text-sm">{item.file.name}</p>
                          <span className="whitespace-nowrap text-xs text-zinc-500">
                            {formatBytes(item.file.size)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress className="h-1.5" value={item.progress} />
                          {item.status === "success" && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          )}
                          {item.status === "error" && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                      <Button
                        className="h-8 w-8 text-zinc-400 hover:text-red-500"
                        onClick={() => removeFromQueue(item.id)}
                        size="icon"
                        variant="ghost"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[80px]">预览</TableHead>
              <TableHead>文件名</TableHead>
              <TableHead className="hidden md:table-cell">类型</TableHead>
              <TableHead className="hidden md:table-cell">大小</TableHead>
              <TableHead className="hidden lg:table-cell">尺寸</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mediaData?.files.length === 0 ? (
              <TableRow>
                <TableCell className="h-32 text-center text-zinc-500" colSpan={6}>
                  暂无媒体资源，请上传文件。
                </TableCell>
              </TableRow>
            ) : (
              mediaData?.files.map((file) => (
                <TableRow className="group cursor-pointer" key={file.id}>
                  <TableCell>
                    <div className="h-10 w-10 overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
                      {file.mimetype.startsWith("image/") ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <img
                              alt={file.filename}
                              className="h-full w-full object-cover transition-transform hover:scale-110"
                              loading="lazy"
                              src={file.url}
                            />
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl overflow-hidden border-none bg-transparent p-0 shadow-none">
                            <img
                              alt={file.filename}
                              className="h-auto w-full rounded-lg shadow-2xl"
                              src={file.url}
                            />
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <FileIcon className="m-auto mt-2.5 h-5 w-5 text-zinc-400" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-zinc-700 dark:text-zinc-200">
                    {file.filename}
                  </TableCell>
                  <TableCell className="hidden text-zinc-500 md:table-cell">
                    <span className="rounded bg-zinc-100 px-2 py-1 font-semibold text-xs uppercase tracking-wider dark:bg-zinc-900">
                      {file.mimetype.split("/")[1] || "FILE"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs text-zinc-500 md:table-cell">
                    {formatBytes(file.size)}
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs text-zinc-500 lg:table-cell">
                    {file.width && file.height ? `${file.width} × ${file.height}` : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                        onClick={() => copyLink(file.url)}
                        size="icon"
                        variant="ghost"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => deleteMutation.mutate({ data: { id: file.id } })}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            删除资源
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
