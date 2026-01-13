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
          <h1 className="text-3xl font-semibold text-white">
            Photography
          </h1>
          <p className="text-neutral-400 mt-1">
            Manage your photography portfolio
          </p>
        </div>
        <Button 
          onClick={openCreateDialog}
          className="bg-white text-black hover:bg-neutral-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Photo
        </Button>
      </div>

      {/* Photos Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-neutral-900 border-neutral-800 animate-pulse">
              <div className="aspect-[4/3] bg-neutral-800" />
              <CardContent className="p-4">
                <div className="h-4 bg-neutral-800 rounded w-3/4 mb-2" />
                <div className="h-3 bg-neutral-800 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : photos && photos.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <Card key={photo.id} className="bg-neutral-900 border-neutral-800 overflow-hidden group">
              <div className="aspect-[4/3] relative">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover"
                />
                {photo.featured && (
                  <span className="absolute top-2 left-2 px-2 py-1 bg-yellow-500/90 text-black text-xs rounded-full font-medium">
                    Featured
                  </span>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => openEditDialog(photo)}
                    className="bg-white text-black hover:bg-neutral-200"
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
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium text-white truncate">
                  {photo.title}
                </h3>
                {photo.location && (
                  <p className="text-sm text-neutral-500 truncate mt-1">
                    📍 {photo.location}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-full bg-neutral-800 mb-4">
              <Camera className="h-8 w-8 text-neutral-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              No Photos Yet
            </h3>
            <p className="text-neutral-500 mb-4">
              Start uploading your photography work
            </p>
            <Button 
              onClick={openCreateDialog}
              className="bg-white text-black hover:bg-neutral-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Photo
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-neutral-900 border-neutral-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingId ? "Edit Photo" : "Add Photo"}
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              {editingId ? "Update photo information" : "Upload a new photo"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="text-neutral-300">Photo *</Label>
              {formData.imageUrl ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-800">
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
                  className="border-2 border-dashed border-neutral-700 rounded-lg p-8 text-center cursor-pointer hover:border-neutral-600 transition-colors bg-neutral-800/50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2" />
                      <p className="text-neutral-400">Uploading...</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-neutral-500 mx-auto mb-2" />
                      <p className="text-neutral-400">Click to upload image</p>
                      <p className="text-xs text-neutral-500 mt-1">Supports JPG, PNG, WebP, max 10MB</p>
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
                placeholder="Enter photo title"
                className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-neutral-300">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this photo..."
                rows={3}
                className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-neutral-300">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Scottish Highlands"
                className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
              />
            </div>

            {/* Camera Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="camera" className="text-neutral-300">Camera</Label>
                <Input
                  id="camera"
                  value={formData.camera}
                  onChange={(e) => setFormData(prev => ({ ...prev, camera: e.target.value }))}
                  placeholder="e.g., Fujifilm X-T4"
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lens" className="text-neutral-300">Lens</Label>
                <Input
                  id="lens"
                  value={formData.lens}
                  onChange={(e) => setFormData(prev => ({ ...prev, lens: e.target.value }))}
                  placeholder="e.g., XF 23mm f/1.4"
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                />
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-2">
              <Label htmlFor="settings" className="text-neutral-300">Camera Settings</Label>
              <Input
                id="settings"
                value={formData.settings}
                onChange={(e) => setFormData(prev => ({ ...prev, settings: e.target.value }))}
                placeholder="e.g., f/2.8, 1/250s, ISO 400"
                className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
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
                  placeholder="e.g., Landscape, Portrait"
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

            {/* Featured & Sort Order */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                />
                <Label htmlFor="featured" className="text-neutral-300">Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="sortOrder" className="text-neutral-300">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
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
              Are you sure you want to delete this photo? This action cannot be undone.
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
