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
import { Edit, GraduationCap, Plus, Trash2, Eye, EyeOff, ExternalLink, Upload, FileText, X } from "lucide-react";
import { toast } from "sonner";

type PaperFormData = {
  title: string;
  authors: string;
  abstract: string;
  journal: string;
  year: number;
  volume: string;
  issue: string;
  pages: string;
  doi: string;
  pdfUrl: string;
  pdfKey: string;
  category: string;
  tags: string;
  citations: number;
  featured: boolean;
  published: boolean;
};

const defaultFormData: PaperFormData = {
  title: "",
  authors: "",
  abstract: "",
  journal: "",
  year: new Date().getFullYear(),
  volume: "",
  issue: "",
  pages: "",
  doi: "",
  pdfUrl: "",
  pdfKey: "",
  category: "",
  tags: "",
  citations: 0,
  featured: false,
  published: false,
};

export default function AdminPapers() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<PaperFormData>(defaultFormData);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const { data: papers, isLoading } = trpc.papers.listAll.useQuery({});
  
  const createMutation = trpc.papers.create.useMutation({
    onSuccess: () => {
      utils.papers.listAll.invalidate();
      toast.success("论文创建成功");
      closeDialog();
    },
    onError: (error) => {
      toast.error("创建失败: " + error.message);
    },
  });

  const updateMutation = trpc.papers.update.useMutation({
    onSuccess: () => {
      utils.papers.listAll.invalidate();
      toast.success("论文更新成功");
      closeDialog();
    },
    onError: (error) => {
      toast.error("更新失败: " + error.message);
    },
  });

  const deleteMutation = trpc.papers.delete.useMutation({
    onSuccess: () => {
      utils.papers.listAll.invalidate();
      toast.success("论文删除成功");
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    },
    onError: (error) => {
      toast.error("删除失败: " + error.message);
    },
  });

  const uploadMutation = trpc.upload.pdf.useMutation({
    onSuccess: (data) => {
      setFormData(prev => ({
        ...prev,
        pdfUrl: data.url,
        pdfKey: data.key,
      }));
      setIsUploading(false);
      toast.success("PDF上传成功");
    },
    onError: (error) => {
      setIsUploading(false);
      toast.error("上传失败: " + error.message);
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error("请选择PDF文件");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("PDF大小不能超过 50MB");
      return;
    }

    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      uploadMutation.mutate({
        filename: file.name,
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

  const openEditDialog = (paper: NonNullable<typeof papers>[0]) => {
    setEditingId(paper.id);
    setFormData({
      title: paper.title,
      authors: paper.authors,
      abstract: paper.abstract || "",
      journal: paper.journal || "",
      year: paper.year || new Date().getFullYear(),
      volume: paper.volume || "",
      issue: paper.issue || "",
      pages: paper.pages || "",
      doi: paper.doi || "",
      pdfUrl: paper.pdfUrl || "",
      pdfKey: paper.pdfKey || "",
      category: paper.category || "",
      tags: paper.tags || "",
      citations: paper.citations || 0,
      featured: paper.featured || false,
      published: paper.published || false,
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
    if (!formData.authors.trim()) {
      toast.error("请输入作者");
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

  const togglePublish = (paper: NonNullable<typeof papers>[0]) => {
    updateMutation.mutate({
      id: paper.id,
      published: !paper.published,
      publishedAt: !paper.published ? new Date() : undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">
            Academic Papers
          </h1>
          <p className="text-neutral-400 mt-1">
            Manage your research publications
          </p>
        </div>
        <Button 
          onClick={openCreateDialog}
          className="bg-white text-black hover:bg-neutral-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Paper
        </Button>
      </div>

      {/* Papers List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-neutral-900 border-neutral-800 animate-pulse">
              <CardContent className="p-6">
                <div className="h-5 bg-neutral-800 rounded w-2/3 mb-2" />
                <div className="h-4 bg-neutral-800 rounded w-1/2 mb-2" />
                <div className="h-3 bg-neutral-800 rounded w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : papers && papers.length > 0 ? (
        <div className="space-y-4">
          {papers.map((paper) => (
            <Card key={paper.id} className="bg-neutral-900 border-neutral-800">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-white leading-tight">
                      {paper.title}
                    </h3>
                    <p className="text-sm text-neutral-400 mt-1">
                      {paper.authors}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      {paper.journal && (
                        <span className="text-sm text-neutral-500">
                          {paper.journal}
                        </span>
                      )}
                      {paper.year && (
                        <span className="text-sm text-neutral-500">
                          · {paper.year}
                        </span>
                      )}
                      {paper.doi && (
                        <a
                          href={`https://doi.org/${paper.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-neutral-400 hover:text-white flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" /> DOI: {paper.doi}
                        </a>
                      )}
                    </div>
                    {paper.abstract && (
                      <p className="text-sm text-neutral-500 mt-3 line-clamp-2">
                        {paper.abstract}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEditDialog(paper)}
                      className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-neutral-800"
                      onClick={() => {
                        setDeletingId(paper.id);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
              <GraduationCap className="h-8 w-8 text-neutral-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              No Papers Yet
            </h3>
            <p className="text-neutral-500 mb-4">
              Add your academic papers and research publications
            </p>
            <Button 
              onClick={openCreateDialog}
              className="bg-white text-black hover:bg-neutral-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Paper
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-neutral-900 border-neutral-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingId ? "Edit Paper" : "Add Paper"}
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              {editingId ? "Update paper information" : "Add a new academic paper"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-neutral-300">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter paper title"
                className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
              />
            </div>

            {/* Authors */}
            <div className="space-y-2">
              <Label htmlFor="authors" className="text-neutral-300">Authors *</Label>
              <Input
                id="authors"
                value={formData.authors}
                onChange={(e) => setFormData(prev => ({ ...prev, authors: e.target.value }))}
                placeholder="e.g., Zhang, X., Li, Y., Wang, Z."
                className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
              />
            </div>

            {/* Abstract */}
            <div className="space-y-2">
              <Label htmlFor="abstract" className="text-neutral-300">Abstract</Label>
              <Textarea
                id="abstract"
                value={formData.abstract}
                onChange={(e) => setFormData(prev => ({ ...prev, abstract: e.target.value }))}
                placeholder="Paper abstract..."
                rows={4}
                className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
              />
            </div>

            {/* Journal & Year */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="journal" className="text-neutral-300">Journal/Conference</Label>
                <Input
                  id="journal"
                  value={formData.journal}
                  onChange={(e) => setFormData(prev => ({ ...prev, journal: e.target.value }))}
                  placeholder="e.g., Nature, Science"
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year" className="text-neutral-300">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>
            </div>

            {/* Volume, Issue, Pages */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="volume" className="text-neutral-300">Volume</Label>
                <Input
                  id="volume"
                  value={formData.volume}
                  onChange={(e) => setFormData(prev => ({ ...prev, volume: e.target.value }))}
                  placeholder="e.g., 12"
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issue" className="text-neutral-300">Issue</Label>
                <Input
                  id="issue"
                  value={formData.issue}
                  onChange={(e) => setFormData(prev => ({ ...prev, issue: e.target.value }))}
                  placeholder="e.g., 3"
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pages" className="text-neutral-300">Pages</Label>
                <Input
                  id="pages"
                  value={formData.pages}
                  onChange={(e) => setFormData(prev => ({ ...prev, pages: e.target.value }))}
                  placeholder="e.g., 123-145"
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                />
              </div>
            </div>

            {/* DOI */}
            <div className="space-y-2">
              <Label htmlFor="doi" className="text-neutral-300">DOI</Label>
              <Input
                id="doi"
                value={formData.doi}
                onChange={(e) => setFormData(prev => ({ ...prev, doi: e.target.value }))}
                placeholder="e.g., 10.1000/xyz123"
                className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
              />
            </div>

            {/* PDF Upload */}
            <div className="space-y-2">
              <Label className="text-neutral-300">PDF File</Label>
              {formData.pdfUrl ? (
                <div className="flex items-center gap-3 p-3 bg-neutral-800 rounded-lg border border-neutral-700">
                  <FileText className="h-8 w-8 text-red-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      PDF Uploaded
                    </p>
                    <a
                      href={formData.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-neutral-400 hover:text-white truncate block"
                    >
                      Click to preview
                    </a>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300 hover:bg-neutral-700"
                    onClick={() => setFormData(prev => ({ ...prev, pdfUrl: "", pdfKey: "" }))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isUploading
                      ? "border-neutral-600 bg-neutral-800"
                      : "border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800/50"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {isUploading ? (
                    <>
                      <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2" />
                      <p className="text-sm text-neutral-400">Uploading...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-neutral-500 mx-auto mb-2" />
                      <p className="text-sm text-neutral-400">
                        Click to upload PDF file
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        Max 50MB
                      </p>
                    </>
                  )}
                </div>
              )}
              {/* Manual URL input as fallback */}
              <div className="mt-2">
                <Label htmlFor="pdfUrl" className="text-xs text-neutral-500">
                  Or enter PDF URL manually
                </Label>
                <Input
                  id="pdfUrl"
                  value={formData.pdfUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, pdfUrl: e.target.value }))}
                  placeholder="https://..."
                  className="mt-1 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                />
              </div>
            </div>

            {/* Category & Tags */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-neutral-300">Research Field</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Machine Learning"
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags" className="text-neutral-300">Keywords</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="Comma separated"
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                />
              </div>
            </div>

            {/* Citations & Options */}
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
                  <Label htmlFor="published" className="text-neutral-300">Published</Label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="citations" className="text-neutral-300">Citations</Label>
                <Input
                  id="citations"
                  type="number"
                  value={formData.citations}
                  onChange={(e) => setFormData(prev => ({ ...prev, citations: parseInt(e.target.value) || 0 }))}
                  className="w-24 bg-neutral-800 border-neutral-700 text-white"
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
              Are you sure you want to delete this paper? This action cannot be undone.
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
