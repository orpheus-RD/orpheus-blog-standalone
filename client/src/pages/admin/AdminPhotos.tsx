import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Camera, Edit, Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";

type PhotoFormData = {
  title: string;
  description: string;
  location: string;
  camera: string;
  lens: string;
  settings: string;
  imageUrl: string;
  imageKey: string;
  category: string;
  tags: string;
  featured: boolean;
  sortOrder: number;
};

const defaultFormData: PhotoFormData = {
  title: "",
  description: "",
  location: "",
  camera: "",
  lens: "",
  settings: "",
  imageUrl: "",
  imageKey: "",
  category: "",
  tags: "",
  featured: false,
  sortOrder: 0,
};

export default function AdminPhotos() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<PhotoFormData>(defaultFormData);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const { data: photos, isLoading } = trpc.photos.list.useQuery({});
  
  const createMutation = trpc.photos.create.useMutation({
    onSuccess: () => {
      utils.photos.list.invalidate();
      toast.success("照片创建成功");
      closeDialog();
    },
    onError: (error) => {
      toast.error("创建失败: " + error.message);
    },
  });

  const updateMutation = trpc.photos.update.useMutation({
    onSuccess: () => {
      utils.photos.list.invalidate();
      toast.success("照片更新成功");
      closeDialog();
    },
    onError: (error) => {
      toast.error("更新失败: " + error.message);
    },
  });

  const deleteMutation = trpc.photos.delete.useMutation({
    onSuccess: () => {
      utils.photos.list.invalidate();
      toast.success("照片删除成功");
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
        imageUrl: data.url,
        imageKey: data.key,
      }));
      setIsUploading(false);
      toast.success("图片上传成功");
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

  const openEditDialog = (photo: NonNullable<typeof photos>[0]) => {
    setEditingId(photo.id);
    setFormData({
      title: photo.title,
      description: photo.description || "",
      location: photo.location || "",
      camera: photo.camera || "",
      lens: photo.lens || "",
      settings: photo.settings || "",
      imageUrl: photo.imageUrl,
      imageKey: photo.imageKey || "",
      category: photo.category || "",
      tags: photo.tags || "",
      featured: photo.featured || false,
      sortOrder: photo.sortOrder || 0,
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
    if (!formData.imageUrl) {
      toast.error("请上传图片");
      return;
    }

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteMutation.mutate({ id: deletingId });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-semibold text-slate-900">
            摄影作品
          </h1>
          <p className="text-slate-500 mt-1">
            管理您的摄影作品集
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          添加照片
        </Button>
      </div>

      {/* Photos Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-0 shadow-sm animate-pulse">
              <div className="aspect-[4/3] bg-slate-200" />
              <CardContent className="p-4">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : photos && photos.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <Card key={photo.id} className="border-0 shadow-sm overflow-hidden group">
              <div className="aspect-[4/3] relative">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover"
                />
                {photo.featured && (
                  <span className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">
                    精选
                  </span>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => openEditDialog(photo)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setDeletingId(photo.id);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium text-slate-900 truncate">
                  {photo.title}
                </h3>
                {photo.location && (
                  <p className="text-sm text-slate-500 truncate mt-1">
                    📍 {photo.location}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-full bg-slate-100 mb-4">
              <Camera className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              暂无照片
            </h3>
            <p className="text-slate-500 mb-4">
              开始上传您的摄影作品吧
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              添加照片
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "编辑照片" : "添加照片"}
            </DialogTitle>
            <DialogDescription>
              {editingId ? "修改照片信息" : "上传新的摄影作品"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>照片 *</Label>
              {formData.imageUrl ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={() => setFormData(prev => ({ ...prev, imageUrl: "", imageKey: "" }))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-slate-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mb-2" />
                      <p className="text-slate-500">上传中...</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-500">点击上传图片</p>
                      <p className="text-xs text-slate-400 mt-1">支持 JPG, PNG, WebP，最大 10MB</p>
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
                placeholder="输入照片标题"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="描述这张照片..."
                rows={3}
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">拍摄地点</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="如：苏格兰高地"
              />
            </div>

            {/* Camera Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="camera">相机</Label>
                <Input
                  id="camera"
                  value={formData.camera}
                  onChange={(e) => setFormData(prev => ({ ...prev, camera: e.target.value }))}
                  placeholder="如：Fujifilm X-T4"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lens">镜头</Label>
                <Input
                  id="lens"
                  value={formData.lens}
                  onChange={(e) => setFormData(prev => ({ ...prev, lens: e.target.value }))}
                  placeholder="如：XF 23mm f/1.4"
                />
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-2">
              <Label htmlFor="settings">拍摄参数</Label>
              <Input
                id="settings"
                value={formData.settings}
                onChange={(e) => setFormData(prev => ({ ...prev, settings: e.target.value }))}
                placeholder="如：f/2.8, 1/250s, ISO 400"
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
                  placeholder="如：风景、人文、街拍"
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

            {/* Featured & Sort Order */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                />
                <Label htmlFor="featured">设为精选</Label>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="sortOrder">排序</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
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
              确定要删除这张照片吗？此操作无法撤销。
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
