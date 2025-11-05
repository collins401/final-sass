import { createFileRoute } from "@tanstack/react-router";
import {
	addEdge,
	applyEdgeChanges,
	applyNodeChanges,
	Background,
	BackgroundVariant,
	Controls,
	type Edge,
	Handle,
	MiniMap,
	type Node,
	Position,
	ReactFlow,
	useEdgesState,
	useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
	Check,
	Download,
	Edit,
	FolderPlus,
	Link2,
	Plus,
	RotateCcw,
	Settings,
	Trash2,
	X,
} from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/posts/category")({
	component: RouteComponent,
});

// 分类节点数据结构
interface CategoryNodeData {
	label: string;
	slug?: string;
	description?: string;
	order?: number;
	color: "blue" | "purple" | "green" | "orange" | "pink";
	level: number;
	onEdit: (id: string, name: string) => void;
	onEditDetails?: (id: string) => void;
	onDelete: (id: string) => void;
	onAddChild: (id: string) => void;
}

// 分类详细信息
interface CategoryDetails {
	id: string;
	label: string;
	slug: string;
	description: string;
	order: number;
	color: "blue" | "purple" | "green" | "orange" | "pink";
}

const colorClasses = {
	blue: "bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/50",
	purple:
		"bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg shadow-purple-500/50",
	green:
		"bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/50",
	orange:
		"bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/50",
	pink: "bg-gradient-to-br from-pink-400 to-pink-600 shadow-lg shadow-pink-500/50",
};

function CategoryNode({ data, id }: { data: CategoryNodeData; id: string }) {
	const [isEditing, setIsEditing] = useState(false);
	const [editValue, setEditValue] = useState(data.label);

	const handleSave = () => {
		if (!editValue.trim()) {
			toast.error("分类名称不能为空");
			return;
		}
		data.onEdit(id, editValue);
		setIsEditing(false);
		toast.success("保存成功");
	};

	const handleCancel = () => {
		setEditValue(data.label);
		setIsEditing(false);
	};

	return (
		<div
			className={cn(
				"group relative min-w-[280px] rounded-2xl p-6 text-white transition-all duration-300 hover:scale-105",
				colorClasses[data.color]
			)}
		>
			{/* 连接点 - 顶部（接收连接） */}
			<Handle
				className="!h-3 !w-3 !border-2 !border-white !bg-white/30 hover:!bg-white"
				id="top"
				position={Position.Top}
				type="target"
			/>

			{/* 连接点 - 底部（发起连接） */}
			<Handle
				className="!h-3 !w-3 !border-2 !border-white !bg-white/30 hover:!bg-white"
				id="bottom"
				position={Position.Bottom}
				type="source"
			/>

			{/* 连接点 - 左侧 */}
			<Handle
				className="!h-3 !w-3 !border-2 !border-white !bg-white/30 hover:!bg-white"
				id="left"
				position={Position.Left}
				type="target"
			/>

			{/* 连接点 - 右侧 */}
			<Handle
				className="!h-3 !w-3 !border-2 !border-white !bg-white/30 hover:!bg-white"
				id="right"
				position={Position.Right}
				type="source"
			/>

			{isEditing ? (
				<div className="flex items-center gap-2">
					<Input
						autoFocus
						className="h-10 border-white/30 bg-white/10 text-white placeholder:text-white/60"
						onChange={(e) => setEditValue(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") handleSave();
							if (e.key === "Escape") handleCancel();
						}}
						value={editValue}
					/>
					<Button
						className="h-10 w-10 bg-white/20 p-0 hover:bg-white/30"
						onClick={handleSave}
						size="icon"
					>
						<Check className="h-5 w-5" />
					</Button>
					<Button
						className="h-10 w-10 bg-white/20 p-0 hover:bg-white/30"
						onClick={handleCancel}
						size="icon"
					>
						<X className="h-5 w-5" />
					</Button>
				</div>
			) : (
				<>
					<div className="mb-4 flex items-center justify-between">
						<h3 className="font-bold text-2xl">{data.label}</h3>
						<div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
							{data.level === 0 && (
								<Button
									className="h-8 w-8 bg-white/20 p-0 hover:bg-white/30"
									onClick={() => data.onAddChild(id)}
									size="icon"
									title="添加子分类"
								>
									<Plus className="h-4 w-4" />
								</Button>
							)}
							<Button
								className="h-8 w-8 bg-white/20 p-0 hover:bg-white/30"
								onClick={() => data.onEditDetails?.(id)}
								size="icon"
								title="详细设置"
							>
								<Settings className="h-4 w-4" />
							</Button>
							<Button
								className="h-8 w-8 bg-white/20 p-0 hover:bg-white/30"
								onClick={() => setIsEditing(true)}
								size="icon"
								title="快速编辑"
							>
								<Edit className="h-4 w-4" />
							</Button>
							<Button
								className="h-8 w-8 bg-white/20 p-0 hover:bg-white/30"
								onClick={() => data.onDelete(id)}
								size="icon"
								title="删除"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
					</div>
					<div className="text-sm opacity-80">
						{data.slug && <div>Slug: {data.slug}</div>}
						{data.order !== undefined && <div>序号: {data.order}</div>}
						{data.slug || data.order !== undefined ? null : (
							<div>{data.level === 0 ? "根分类" : "子分类"}</div>
						)}
					</div>
				</>
			)}
		</div>
	);
}

const nodeTypes = {
	category: CategoryNode,
};

// 初始节点和边
const initialNodes: Node[] = [
	{
		id: "1",
		type: "category",
		data: {
			label: "新闻分类",
			color: "blue",
			level: 0,
		},
		position: { x: 250, y: 100 },
	},
	{
		id: "1-1",
		type: "category",
		data: {
			label: "公司新闻",
			color: "purple",
			level: 1,
		},
		position: { x: 100, y: 300 },
	},
	{
		id: "1-2",
		type: "category",
		data: {
			label: "行业新闻",
			color: "purple",
			level: 1,
		},
		position: { x: 400, y: 300 },
	},
	{
		id: "1-3",
		type: "category",
		data: {
			label: "趋势展望",
			color: "purple",
			level: 1,
		},
		position: { x: 700, y: 300 },
	},
];

const initialEdges: Edge[] = [
	{
		id: "e1-1-1",
		source: "1",
		target: "1-1",
		animated: true,
		type: "smoothstep",
		style: { stroke: "#9333ea", strokeWidth: 2 },
		label: "子分类",
		labelStyle: {
			fill: "#6b7280",
			fontSize: 12,
			fontWeight: 500,
		},
		labelBgStyle: {
			fill: "#fff",
			fillOpacity: 0.8,
		},
	},
	{
		id: "e1-1-2",
		source: "1",
		target: "1-2",
		animated: true,
		type: "smoothstep",
		style: { stroke: "#9333ea", strokeWidth: 2 },
		label: "子分类",
		labelStyle: {
			fill: "#6b7280",
			fontSize: 12,
			fontWeight: 500,
		},
		labelBgStyle: {
			fill: "#fff",
			fillOpacity: 0.8,
		},
	},
	{
		id: "e1-1-3",
		source: "1",
		target: "1-3",
		animated: true,
		type: "smoothstep",
		style: { stroke: "#9333ea", strokeWidth: 2 },
		label: "子分类",
		labelStyle: {
			fill: "#6b7280",
			fontSize: 12,
			fontWeight: 500,
		},
		labelBgStyle: {
			fill: "#fff",
			fillOpacity: 0.8,
		},
	},
];

function RouteComponent() {
	const [nodes, setNodes] = useNodesState(initialNodes);
	const [edges, setEdges] = useEdgesState(initialEdges);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [editingDetailsId, setEditingDetailsId] = useState<string | null>(null);
	const [editForm, setEditForm] = useState<CategoryDetails>({
		id: "",
		label: "",
		slug: "",
		description: "",
		order: 0,
		color: "blue",
	});

	// 节点变化处理
	const onNodesChange = useCallback(
		(changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
		[setNodes]
	);

	// 边变化处理
	const onEdgesChange = useCallback(
		(changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
		[setEdges]
	);

	// 连接节点 - 增强父子连接功能
	const onConnect = useCallback(
		(params: any) => {
			// 自动设置连接样式
			const sourceNode = nodes.find((n) => n.id === params.source);
			const targetNode = nodes.find((n) => n.id === params.target);

			// 根据连接类型设置不同样式
			const newEdge = {
				...params,
				animated: true,
				type: "smoothstep", // 使用平滑阶梯线
				style: {
					stroke: sourceNode?.data.level === 0 ? "#9333ea" : "#3b82f6",
					strokeWidth: 2,
				},
				// 添加标签显示关系
				label: targetNode?.data.level === 1 ? "子分类" : "关联",
				labelStyle: {
					fill: "#6b7280",
					fontSize: 12,
					fontWeight: 500,
				},
				labelBgStyle: {
					fill: "#fff",
					fillOpacity: 0.8,
				},
			};

			setEdges((eds) => addEdge(newEdge, eds));
			toast.success("已建立连接关系");
		},
		[setEdges, nodes]
	);

	// 编辑分类
	const handleEdit = useCallback(
		(id: string, newLabel: string) => {
			setNodes((nds) =>
				nds.map((node) => {
					if (node.id === id) {
						return {
							...node,
							data: { ...node.data, label: newLabel },
						};
					}
					return node;
				})
			);
		},
		[setNodes]
	);

	// 删除确认
	const handleDeleteClick = useCallback((id: string) => {
		setDeletingId(id);
	}, []);

	// 打开详细编辑
	const handleEditDetails = useCallback(
		(id: string) => {
			const node = nodes.find((n) => n.id === id);
			if (node) {
				setEditForm({
					id: node.id,
					label: node.data.label,
					slug: node.data.slug || "",
					description: node.data.description || "",
					order: node.data.order || 0,
					color: node.data.color,
				});
				setEditingDetailsId(id);
			}
		},
		[nodes]
	);

	// 保存详细信息
	const handleSaveDetails = () => {
		setNodes((nds) =>
			nds.map((node) => {
				if (node.id === editForm.id) {
					return {
						...node,
						data: {
							...node.data,
							label: editForm.label,
							slug: editForm.slug,
							description: editForm.description,
							order: editForm.order,
							color: editForm.color,
						},
					};
				}
				return node;
			})
		);
		setEditingDetailsId(null);
		toast.success("保存成功");
	};

	// 关闭详细编辑
	const handleCloseDetails = () => {
		setEditingDetailsId(null);
	};

	// 添加子分类
	const addChildCategory = useCallback(
		(parentId: string) => {
			const newId = `${parentId}-${Date.now()}`;

			setNodes((nds) => {
				const parentNode = nds.find((n) => n.id === parentId);
				if (!parentNode) return nds;

				const newNode: Node = {
					id: newId,
					type: "category",
					data: {
						label: "新子分类",
						slug: "",
						description: "",
						order: 0,
						color: "purple",
						level: 1,
						onEdit: handleEdit,
						onEditDetails: handleEditDetails,
						onDelete: handleDeleteClick,
						onAddChild: addChildCategory,
					},
					position: {
						x: parentNode.position.x + Math.random() * 200 - 100,
						y: parentNode.position.y + 200,
					},
				};

				return [...nds, newNode];
			});

			setEdges((eds) => {
				const newEdge: Edge = {
					id: `e-${parentId}-${newId}`,
					source: parentId,
					target: newId,
					animated: true,
					type: "smoothstep",
					style: { stroke: "#9333ea", strokeWidth: 2 },
					label: "子分类",
					labelStyle: {
						fill: "#6b7280",
						fontSize: 12,
						fontWeight: 500,
					},
					labelBgStyle: {
						fill: "#fff",
						fillOpacity: 0.8,
					},
				};
				return [...eds, newEdge];
			});

			toast.success("已添加子分类");
		},
		[handleEdit, handleEditDetails, handleDeleteClick, setNodes, setEdges]
	);

	// 添加根分类
	const addRootCategory = () => {
		const newId = `root-${Date.now()}`;
		const newNode: Node = {
			id: newId,
			type: "category",
			data: {
				label: "新分类",
				slug: "",
				description: "",
				order: 0,
				color: "blue",
				level: 0,
				onEdit: handleEdit,
				onEditDetails: handleEditDetails,
				onDelete: handleDeleteClick,
				onAddChild: addChildCategory,
			},
			position: { x: Math.random() * 500, y: Math.random() * 300 },
		};
		setNodes((nds) => [...nds, newNode]);
		toast.success("已添加根分类");
	};

	// 删除分类
	const handleDelete = () => {
		if (!deletingId) return;

		// 删除节点及其所有子节点
		const nodesToDelete = new Set<string>();
		const findChildren = (nodeId: string) => {
			nodesToDelete.add(nodeId);
			for (const edge of edges) {
				if (edge.source === nodeId) {
					findChildren(edge.target);
				}
			}
		};
		findChildren(deletingId);

		setNodes((nds) => nds.filter((n) => !nodesToDelete.has(n.id)));
		setEdges((eds) =>
			eds.filter((e) => {
				if (nodesToDelete.has(e.source)) return false;
				if (nodesToDelete.has(e.target)) return false;
				return true;
			})
		);
		setDeletingId(null);
		toast.success("删除成功");
	};

	// 更新节点数据中的回调函数
	const updateNodeCallbacks = useCallback(
		(nds: Node[]) =>
			nds.map((node) => ({
				...node,
				data: {
					...node.data,
					onEdit: handleEdit,
					onEditDetails: handleEditDetails,
					onDelete: handleDeleteClick,
					onAddChild: addChildCategory,
				},
			})),
		[handleEdit, handleEditDetails, handleDeleteClick, addChildCategory]
	);

	// 初始化时更新回调
	const [initialized, setInitialized] = useState(false);
	if (!initialized) {
		setNodes((nds) => updateNodeCallbacks(nds));
		setInitialized(true);
	}

	// 导出数据
	const exportData = () => {
		const data = {
			nodes: nodes.map((n) => ({
				id: n.id,
				label: n.data.label,
				color: n.data.color,
				level: n.data.level,
				position: n.position,
			})),
			edges: edges.map((e) => ({
				id: e.id,
				source: e.source,
				target: e.target,
			})),
		};

		const dataStr = JSON.stringify(data, null, 2);
		const dataBlob = new Blob([dataStr], { type: "application/json" });
		const url = URL.createObjectURL(dataBlob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "categories-flow.json";
		link.click();
		URL.revokeObjectURL(url);
		toast.success("导出成功");
	};

	// 重置布局
	const resetLayout = () => {
		setNodes(updateNodeCallbacks(initialNodes));
		setEdges(initialEdges);
		toast.success("已重置为初始布局");
	};

	// 显示连接帮助提示
	const showConnectionHelp = () => {
		toast.info(
			"💡 建立连接方法：\n1. 悬停在节点上显示4个白色连接点\n2. 从一个节点的圆点拖拽到另一个节点的圆点\n3. 或点击根分类的➕按钮自动添加子分类",
			{ duration: 5000 }
		);
	};

	return (
		<div className="flex h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100">
			{/* 头部工具栏 */}
			<div className="z-10 border-b bg-white p-4 shadow-sm">
				<div className="mx-auto flex max-w-7xl items-center justify-between">
					<div>
						<h1 className="font-bold text-3xl text-gray-900">
							文章分类管理（可拖拽）
						</h1>
						<p className="mt-1 text-gray-600 text-sm">
							使用流程图方式可视化管理，支持拖拽布局和连接
						</p>
					</div>
					<div className="flex gap-3">
						<Button onClick={showConnectionHelp} variant="outline">
							<Link2 className="mr-2 h-4 w-4" />
							如何连接
						</Button>
						<Button onClick={resetLayout} variant="outline">
							<RotateCcw className="mr-2 h-4 w-4" />
							重置布局
						</Button>
						<Button onClick={exportData} variant="outline">
							<Download className="mr-2 h-4 w-4" />
							导出数据
						</Button>
						<Button onClick={addRootCategory}>
							<FolderPlus className="mr-2 h-4 w-4" />
							添加根分类
						</Button>
					</div>
				</div>
			</div>

			{/* ReactFlow 画布 */}
			<div className="flex-1">
				<ReactFlow
					edges={edges}
					fitView
					nodes={nodes}
					nodeTypes={nodeTypes}
					onConnect={onConnect}
					onEdgesChange={onEdgesChange}
					onNodesChange={onNodesChange}
				>
					<Background gap={20} variant={BackgroundVariant.Dots} />
					<Controls />
					<MiniMap
						nodeColor={(node) => {
							const color = node.data.color as keyof typeof colorClasses;
							if (color === "blue") return "#3b82f6";
							if (color === "purple") return "#9333ea";
							if (color === "green") return "#22c55e";
							if (color === "orange") return "#f97316";
							if (color === "pink") return "#ec4899";
							return "#3b82f6";
						}}
						pannable
						zoomable
					/>
				</ReactFlow>
			</div>

			{/* 删除确认对话框 */}
			<AlertDialog
				onOpenChange={(open) => !open && setDeletingId(null)}
				open={!!deletingId}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>确认删除</AlertDialogTitle>
						<AlertDialogDescription>
							此操作将删除该分类及其所有子分类，且无法恢复。确定要继续吗？
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>取消</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive hover:bg-destructive/90"
							onClick={handleDelete}
						>
							删除
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* 详细编辑对话框 */}
			<Dialog onOpenChange={handleCloseDetails} open={!!editingDetailsId}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>编辑分类详细信息</DialogTitle>
						<DialogDescription>
							设置分类的名称、slug、描述、序号和颜色等信息
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						{/* 分类名称 */}
						<div className="space-y-2">
							<Label htmlFor="label">分类名称 *</Label>
							<Input
								id="label"
								onChange={(e) =>
									setEditForm({ ...editForm, label: e.target.value })
								}
								placeholder="请输入分类名称"
								value={editForm.label}
							/>
						</div>

						{/* Slug */}
						<div className="space-y-2">
							<Label htmlFor="slug">Slug</Label>
							<Input
								id="slug"
								onChange={(e) =>
									setEditForm({ ...editForm, slug: e.target.value })
								}
								placeholder="例如: company-news"
								value={editForm.slug}
							/>
							<p className="text-muted-foreground text-sm">
								用于 URL 的友好标识符，建议使用小写字母和连字符
							</p>
						</div>

						{/* 序号 */}
						<div className="space-y-2">
							<Label htmlFor="order">序号</Label>
							<Input
								id="order"
								min="0"
								onChange={(e) =>
									setEditForm({ ...editForm, order: Number(e.target.value) })
								}
								placeholder="0"
								type="number"
								value={editForm.order}
							/>
							<p className="text-muted-foreground text-sm">
								用于排序，数字越小越靠前
							</p>
						</div>

						{/* 描述 */}
						<div className="space-y-2">
							<Label htmlFor="description">描述</Label>
							<Textarea
								className="min-h-[100px]"
								id="description"
								onChange={(e) =>
									setEditForm({ ...editForm, description: e.target.value })
								}
								placeholder="请输入分类描述"
								value={editForm.description}
							/>
						</div>

						{/* 颜色 */}
						<div className="space-y-2">
							<Label htmlFor="color">颜色</Label>
							<Select
								onValueChange={(value: any) =>
									setEditForm({ ...editForm, color: value })
								}
								value={editForm.color}
							>
								<SelectTrigger>
									<SelectValue placeholder="选择颜色" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="blue">
										<div className="flex items-center gap-2">
											<div className="h-4 w-4 rounded bg-gradient-to-br from-blue-400 to-blue-600" />
											蓝色
										</div>
									</SelectItem>
									<SelectItem value="purple">
										<div className="flex items-center gap-2">
											<div className="h-4 w-4 rounded bg-gradient-to-br from-purple-400 to-purple-600" />
											紫色
										</div>
									</SelectItem>
									<SelectItem value="green">
										<div className="flex items-center gap-2">
											<div className="h-4 w-4 rounded bg-gradient-to-br from-green-400 to-green-600" />
											绿色
										</div>
									</SelectItem>
									<SelectItem value="orange">
										<div className="flex items-center gap-2">
											<div className="h-4 w-4 rounded bg-gradient-to-br from-orange-400 to-orange-600" />
											橙色
										</div>
									</SelectItem>
									<SelectItem value="pink">
										<div className="flex items-center gap-2">
											<div className="h-4 w-4 rounded bg-gradient-to-br from-pink-400 to-pink-600" />
											粉色
										</div>
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<DialogFooter>
						<Button onClick={handleCloseDetails} variant="outline">
							取消
						</Button>
						<Button onClick={handleSaveDetails}>保存</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
