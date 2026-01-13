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
          <h1 className="text-3xl font-semibold text-white">
            Magazine
          </h1>
          <p className="text-neutral-400 mt-1">
            Manage your essays and articles
          </p>
        </div>
        <Button 
          onClick={openCreateDialog}
          className="bg-white text-black hover:bg-neutral-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Write Essay
        </Button>
      </div>

      {/* Essays List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-neutral-900 border-neutral-800 animate-pulse">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-32 h-24 bg-neutral-800 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-5 bg-neutral-800 rounded w-1/3 mb-2" />
                    <div className="h-4 bg-neutral-800 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-neutral-800 rounded w-1/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : essays && essays.length > 0 ? (
        <div className="space-y-4">
          {essays.map((essay) => (
            <Card key={essay.id} className="bg-neutral-900 border-neutral-800 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {essay.coverImageUrl ? (
                    <div className="w-32 h-24 rounded-lg overflow-hidden bg-neutral-800 shrink-0">
                      <img
                        src={essay.coverImageUrl}
                        alt={essay.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-24 rounded-lg bg-neutral-800 flex items-center justify-center shrink-0">
                      <FileText className="h-8 w-8 text-neutral-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-white truncate">
                          {essay.title}
                        </h3>
                        {essay.subtitle && (
                          <p className="text-sm text-neutral-400 truncate mt-1">
                            {essay.subtitle}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full ${
                              essay.published
                                ? "bg-green-900/30 text-green-400 border border-green-800/50"
                                : "bg-yellow-900/30 text-yellow-400 border border-yellow-800/50"
                            }`}
                          >
                            {essay.published ? "Published" : "Draft"}
                          </span>
                          {essay.featured && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-blue-900/30 text-blue-400 border border-blue-800/50">
                              Featured
                            </span>
                          )}
                          {essay.category && (
                            <span className="text-xs text-neutral-500">
                              {essay.category}
                            </span>
                          )}
                          <span className="text-xs text-neutral-500">
                            {essay.readTime || 5} min read
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => togglePublish(essay)}
                          title={essay.published ? "Unpublish" : "Publish"}
                          className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800"
                        >
                          {essay.published ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEditDialog(essay)}
                          className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-neutral-800"
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
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-full bg-neutral-800 mb-4">
              <FileText className="h-8 w-8 text-neutral-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              No Essays Yet
            </h3>
            <p className="text-neutral-500 mb-4">
              Start writing your first essay
            </p>
            <Button 
              onClick={openCreateDialog}
              className="bg-white text-black hover:bg-neutral-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Write Essay
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-neutral-900 border-neutral-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingId ? "Edit Essay" : "Write Essay"}
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              {editingId ? "Update essay content" : "Create a new magazine essay"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Cover Image */}
            <div className="space-y-2">
              <Label className="text-neutral-300">Cover Image</Label>
              {formData.coverImageUrl ? (
                <div className="relative aspect-[21/9] rounded-lg overflow-hidden bg-neutral-800">
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
                  className="border-2 border-dashed border-neutral-700 rounded-lg p-6 text-center cursor-pointer hover:border-neutral-600 transition-colors bg-neutral-800/50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mb-2" />
                      <p className="text-sm text-neutral-400">Uploading...</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-neutral-500 mx-auto mb-2" />
                      <p className="text-sm text-neutral-400">Click to upload cover image (optional)</p>
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
              <Label htmlFor="title" className="text-neutral-300">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter essay title"
                className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-2">
              <Label htmlFor="subtitle" className="text-neutral-300">Subtitle</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                placeholder="Enter subtitle (optional)"
                className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
              />
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="excerpt" className="text-neutral-300">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Essay excerpt, will be shown in lists..."
                rows={2}
                className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-neutral-300">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Supports Markdown format..."
                rows={12}
                className="font-mono text-sm bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
              />
            </div>

            {/* Category & Tags */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-neutral-300">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Travel, Thoughts"
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags" className="text-neutral-300">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="Comma separated"
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
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
                  <Label htmlFor="featured" className="text-neutral-300">Featured</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
                  />
                  <Label htmlFor="published" className="text-neutral-300">Publish Now</Label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="readTime" className="text-neutral-300">Read Time (min)</Label>
                <Input
                  id="readTime"
                  type="number"
                  value={formData.readTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, readTime: parseInt(e.target.value) || 5 }))}
                  className="w-20 bg-neutral-800 border-neutral-700 text-white"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={closeDialog}
              className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-white text-black hover:bg-neutral-200"
            >
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-neutral-900 border-neutral-800">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Delete</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Are you sure you want to delete this essay? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
