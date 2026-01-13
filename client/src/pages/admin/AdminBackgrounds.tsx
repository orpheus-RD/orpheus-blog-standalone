import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit2, Image, X, GripVertical, Eye, EyeOff } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Background {
  id: number;
  title: string | null;
  imageUrl: string;
  imageKey: string | null;
  active: boolean | null;
  sortOrder: number | null;
}

export default function AdminBackgrounds() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBackground, setEditingBackground] = useState<Background | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "",
    active: true,
    sortOrder: 0,
  });

  const utils = trpc.useUtils();
  const { data: backgrounds, isLoading } = trpc.backgrounds.listAll.useQuery({});
  const uploadMutation = trpc.upload.image.useMutation();
  const createMutation = trpc.backgrounds.create.useMutation({
    onSuccess: () => {
      utils.backgrounds.listAll.invalidate();
      toast.success("背景图添加成功");
      closeModal();
    },
    onError: (error) => {
      toast.error(`添加失败: ${error.message}`);
    },
  });
  const updateMutation = trpc.backgrounds.update.useMutation({
    onSuccess: () => {
      utils.backgrounds.listAll.invalidate();
      toast.success("背景图更新成功");
      closeModal();
    },
    onError: (error) => {
      toast.error(`更新失败: ${error.message}`);
    },
  });
  const deleteMutation = trpc.backgrounds.delete.useMutation({
    onSuccess: () => {
      utils.backgrounds.listAll.invalidate();
      toast.success("背景图已删除");
    },
    onError: (error) => {
      toast.error(`删除失败: ${error.message}`);
    },
  });

  const openAddModal = () => {
    setFormData({ title: "", imageUrl: "", active: true, sortOrder: 0 });
    setPreviewImage(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (background: Background) => {
    setEditingBackground(background);
    setFormData({
      title: background.title || "",
      imageUrl: background.imageUrl,
      active: background.active ?? true,
      sortOrder: background.sortOrder ?? 0,
    });
    setPreviewImage(background.imageUrl);
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingBackground(null);
    setFormData({ title: "", imageUrl: "", active: true, sortOrder: 0 });
    setPreviewImage(null);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("请选择图片文件");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("图片大小不能超过 10MB");
      return;
    }

    setIsUploading(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        
        // Upload to storage
        const result = await uploadMutation.mutateAsync({
          filename: file.name,
          contentType: file.type,
          base64Data: base64,
        });

        setFormData((prev) => ({ ...prev, imageUrl: result.url }));
        setPreviewImage(result.url);
        toast.success("图片上传成功");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("图片上传失败");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.imageUrl) {
      toast.error("请上传背景图片");
      return;
    }

    if (editingBackground) {
      updateMutation.mutate({
        id: editingBackground.id,
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("确定要删除这张背景图吗？")) {
      deleteMutation.mutate({ id });
    }
  };

  const toggleActive = (background: Background) => {
    updateMutation.mutate({
      id: background.id,
      active: !background.active,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-neutral-800 rounded animate-pulse mb-2" />
            <div className="h-5 w-64 bg-neutral-800 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-neutral-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-video bg-neutral-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Backgrounds</h1>
          <p className="text-neutral-400 mt-1">管理首页背景图片</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors font-medium"
        >
          <Plus size={18} />
          Add Background
        </button>
      </div>

      {/* Backgrounds Grid */}
      {backgrounds && backgrounds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {backgrounds.map((background) => (
            <motion.div
              key={background.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden"
            >
              {/* Image */}
              <div className="aspect-video relative">
                <img
                  src={background.imageUrl}
                  alt={background.title || "Background"}
                  className="w-full h-full object-cover"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => openEditModal(background)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                    title="编辑"
                  >
                    <Edit2 size={18} className="text-white" />
                  </button>
                  <button
                    onClick={() => toggleActive(background)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                    title={background.active ? "隐藏" : "显示"}
                  >
                    {background.active ? (
                      <EyeOff size={18} className="text-white" />
                    ) : (
                      <Eye size={18} className="text-white" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(background.id)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-full transition-colors"
                    title="删除"
                  >
                    <Trash2 size={18} className="text-red-400" />
                  </button>
                </div>
                {/* Status badge */}
                {!background.active && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 rounded text-xs text-neutral-400">
                    已隐藏
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="p-3 border-t border-neutral-800">
                <p className="text-white text-sm truncate">
                  {background.title || "未命名"}
                </p>
                <p className="text-neutral-500 text-xs mt-1">
                  排序: {background.sortOrder ?? 0}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-neutral-900 border border-neutral-800 rounded-lg">
          <Image className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">暂无背景图</h3>
          <p className="text-neutral-400 mb-4">添加背景图片用于首页轮播展示</p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors font-medium"
          >
            <Plus size={18} />
            添加第一张背景图
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-900 border border-neutral-800 rounded-lg w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                <h2 className="text-lg font-semibold text-white">
                  {editingBackground ? "编辑背景图" : "添加背景图"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-1 hover:bg-neutral-800 rounded transition-colors"
                >
                  <X size={20} className="text-neutral-400" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    背景图片 *
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {previewImage ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-800">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <span className="text-white text-sm">点击更换图片</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="w-full aspect-video border-2 border-dashed border-neutral-700 rounded-lg flex flex-col items-center justify-center hover:border-neutral-600 transition-colors"
                    >
                      {isUploading ? (
                        <div className="flex items-center gap-2 text-neutral-400">
                          <div className="w-5 h-5 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
                          上传中...
                        </div>
                      ) : (
                        <>
                          <Image className="w-8 h-8 text-neutral-500 mb-2" />
                          <span className="text-neutral-400 text-sm">点击上传图片</span>
                          <span className="text-neutral-500 text-xs mt-1">支持 JPG、PNG，最大 10MB</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    标题（可选）
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="为背景图添加描述性标题"
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
                  />
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    排序权重
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
                  />
                  <p className="text-neutral-500 text-xs mt-1">数值越大越靠前显示</p>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-neutral-300">
                    启用显示
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, active: !prev.active }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      formData.active ? "bg-white" : "bg-neutral-700"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform ${
                        formData.active ? "translate-x-5 bg-black" : "bg-neutral-400"
                      }`}
                    />
                  </button>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={!formData.imageUrl || createMutation.isPending || updateMutation.isPending}
                    className="flex-1 px-4 py-2 bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {createMutation.isPending || updateMutation.isPending ? "保存中..." : "保存"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
