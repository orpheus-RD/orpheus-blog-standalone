import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { Edit, FileText, Plus, Trash2, Upload, X, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

type EssayFormData = {
  title: string;
  subtitle: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  coverImageKey: string;
  category: string;
  tags: string;
  readTime: number;
  featured: boolean;
  published: boolean;
};

const defaultFormData: EssayFormData = {
  title: "",
  subtitle: "",
  excerpt: "",
  content: "",
  coverImageUrl: "",
  coverImageKey: "",
  category: "",
  tags: "",
  readTime: 5,
  featured: false,
  published: false,
};

export default function AdminEssays() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<EssayFormData>(defaultFormData);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const { data: essays, isLoading } = trpc.essays.listAll.useQuery({});
  
  const createMutation = trpc.essays.create.useMutation({
    onSuccess: () => {
      utils.essays.listAll.invalidate();
      toast.success("文章创建成功");
      closeDialog();
    },
    onError: (error) => {
      toast.error("创建失败: " + error.message);
    },
  });

  const updateMutation = trpc.essays.update.useMutation({
    onSuccess: () => {
      utils.essays.listAll.invalidate();
      toast.success("文章更新成功");
      closeDialog();
    },
    onError: (error) => {
      toast.error("更新失败: " + error.message);
    },
  });

  const deleteMutation = trpc.essays.delete.useMutation({
    onSuccess: () => {
      utils.essays.listAll.invalidate();
      toast.success("文章删除成功");
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    },
    onError: (error) => {
      toast.error("删除失败: " + error.message);
    },
  });

  const uploadMutation = trpc.upload.image.useMutation({
    onSuccess: (data) => {
      setFormData(prev => ({
        ...prev,
        coverImageUrl: data.url,
        coverImageKey: data.key,
      }));
      setIsUploading(false);
      toast.success("封面上传成功");
    },
    onError: (error) => {
      setIsUploading(false);
      toast.error("上传失败: " + error.message);
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("请选择图片文件");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("图片大小不能超过 10MB");
      return;
    }

    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      uploadMutation.mutate({
        filename: file.name,
        contentType: file.type,
        base64Data: base64,
      });
    };
    reader.readAsDataURL(file);
  };

  const openCreateDialog = () => {
    setEditingId(null);
    setFormData(defaultFormData);
    setIsDialogOpen(true);
  };

  const openEditDialog = (essay: NonNullable<typeof essays>[0]) => {
    setEditingId(essay.id);
    setFormData({
      title: essay.title,
      subtitle: essay.subtitle || "",
      excerpt: essay.excerpt || "",
      content: essay.content,
      coverImageUrl: essay.coverImageUrl || "",
      coverImageKey: essay.coverImageKey || "",
      category: essay.category || "",
      tags: essay.tags || "",
      readTime: essay.readTime || 5,
      featured: essay.featured || false,
      published: essay.published || false,
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData(defaultFormData);
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.error("请输入标题");
      return;
    }
    if (!formData.content.trim()) {
      toast.error("请输入内容");
      return;
    }

    const submitData = {
      ...formData,
      publishedAt: formData.published ? new Date() : undefined,
    };

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        ...submitData,
      });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteMutation.mutate({ id: deletingId });
    }
  };

  const togglePublish = (essay: NonNullable<typeof essays>[0]) => {
    updateMutation.mutate({
      id: essay.id,
      published: !essay.published,
      publishedAt: !essay.published ? new Date() : undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-semibold text-slate-900">
            杂志随笔
          </h1>
          <p className="text-slate-500 mt-1">
            管理您的文章和随笔
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          写文章
        </Button>
      </div>

      {/* Essays List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0 shadow-sm animate-pulse">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-32 h-24 bg-slate-200 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-5 bg-slate-200 rounded w-1/3 mb-2" />
                    <div className="h-4 bg-slate-200 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-slate-200 rounded w-1/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : essays && essays.length > 0 ? (
        <div className="space-y-4">
          {essays.map((essay) => (
            <Card key={essay.id} className="border-0 shadow-sm overflow-hidden">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {essay.coverImageUrl ? (
                    <div className="w-32 h-24 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                      <img
                        src={essay.coverImageUrl}
                        alt={essay.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-24 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <FileText className="h-8 w-8 text-slate-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">
                          {essay.title}
                        </h3>
                        {essay.subtitle && (
                          <p className="text-sm text-slate-500 truncate mt-1">
                            {essay.subtitle}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full ${
                              essay.published
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {essay.published ? "已发布" : "草稿"}
                          </span>
                          {essay.featured && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
                              精选
                            </span>
                          )}
                          {essay.category && (
                            <span className="text-xs text-slate-400">
                              {essay.category}
                            </span>
                          )}
                          <span className="text-xs text-slate-400">
                            {essay.readTime || 5} 分钟阅读
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => togglePublish(essay)}
                          title={essay.published ? "取消发布" : "发布"}
                        >
                          {essay.published ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(essay)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setDeletingId(essay.id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-full bg-slate-100 mb-4">
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              暂无文章
            </h3>
            <p className="text-slate-500 mb-4">
              开始写您的第一篇随笔吧
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              写文章
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "编辑文章" : "写文章"}
            </DialogTitle>
            <DialogDescription>
              {editingId ? "修改文章内容" : "创建新的杂志随笔"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Cover Image */}
            <div className="space-y-2">
              <Label>封面图片</Label>
              {formData.coverImageUrl ? (
                <div className="relative aspect-[21/9] rounded-lg overflow-hidden bg-slate-100">
                  <img
                    src={formData.coverImageUrl}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={() => setFormData(prev => ({ ...prev, coverImageUrl: "", coverImageKey: "" }))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-slate-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-600 mb-2" />
                      <p className="text-sm text-slate-500">上传中...</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">点击上传封面图片（可选）</p>
                    </>
                  )}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">标题 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="输入文章标题"
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-2">
              <Label htmlFor="subtitle">副标题</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                placeholder="输入副标题（可选）"
              />
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">摘要</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="文章摘要，将显示在列表中..."
                rows={2}
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">正文 *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="支持 Markdown 格式..."
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            {/* Category & Tags */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">分类</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="如：旅行、思考、书评"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">标签</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="用逗号分隔"
                />
              </div>
            </div>

            {/* Read Time & Options */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                  />
                  <Label htmlFor="featured">精选</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
                  />
                  <Label htmlFor="published">立即发布</Label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="readTime">阅读时间（分钟）</Label>
                <Input
                  id="readTime"
                  type="number"
                  value={formData.readTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, readTime: parseInt(e.target.value) || 5 }))}
                  className="w-20"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除这篇文章吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "删除中..." : "删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
