/**
 * Design Philosophy: Complete Image Display
 * - Show full images without cropping
 * - Masonry-style layout to accommodate different aspect ratios
 * - Consistent visual presentation across all image sizes
 * - Mobile-first responsive design
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Camera, Download, ZoomIn } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Photo {
  id: number;
  src: string;
  title: string;
  location: string;
  year: string;
  description: string;
  camera?: string;
  lens?: string;
  settings?: string;
}

export default function Photography() {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Fetch photos from database
  const { data: dbPhotos, isLoading, error } = trpc.photos.list.useQuery({});

  // Transform database photos to display format
  const photos = useMemo(() => {
    if (!dbPhotos || dbPhotos.length === 0) {
      return [];
    }
    return dbPhotos.map(p => ({
      id: p.id,
      src: p.imageUrl,
      title: p.title,
      location: p.location || "",
      year: p.publishedAt ? new Date(p.publishedAt).getFullYear().toString() : new Date().getFullYear().toString(),
      description: p.description || "",
      camera: p.camera || undefined,
      lens: p.lens || undefined,
      settings: p.settings || undefined,
    }));
  }, [dbPhotos]);

  const openLightbox = useCallback((photo: Photo) => {
    setSelectedPhoto(photo);
    setIsLightboxOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    document.body.style.overflow = "unset";
    setTimeout(() => setSelectedPhoto(null), 300);
  }, []);

  const navigatePhoto = useCallback(
    (direction: "prev" | "next") => {
      if (!selectedPhoto) return;
      const currentIndex = photos.findIndex((p) => p.id === selectedPhoto.id);
      const newIndex =
        direction === "prev"
          ? (currentIndex - 1 + photos.length) % photos.length
          : (currentIndex + 1) % photos.length;
      setSelectedPhoto(photos[newIndex]);
    },
    [selectedPhoto, photos]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") navigatePhoto("prev");
      if (e.key === "ArrowRight") navigatePhoto("next");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, closeLightbox, navigatePhoto]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/60 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white/80 rounded-full animate-spin" />
          <span>Loading photos...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-2">Failed to load photos</p>
          <p className="text-white/40 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (photos.length === 0) {
    return (
      <div className="min-h-screen bg-black">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <Camera className="w-5 h-5 text-white/60" />
                <h1 className="text-lg font-medium text-white">Photography</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Empty state content */}
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Camera className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-white/80 mb-2">No photos yet</h2>
            <p className="text-white/40">Photos will appear here once they are uploaded.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      {/* Header - Matching Magazine style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-4 md:px-6 mb-8 md:mb-12"
      >
        <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-semibold text-white mb-3 md:mb-4">
          Photography
        </h1>
      </motion.div>

      {/* Masonry Grid */}
      <main className="container mx-auto px-4 md:px-6">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="break-inside-avoid"
            >
              <div
                className="relative group cursor-pointer overflow-hidden rounded-lg bg-white/5"
                onMouseEnter={() => setHoveredId(photo.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => openLightbox(photo)}
              >
                <img
                  src={photo.src}
                  alt={photo.title}
                  className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Hover Overlay */}
                <AnimatePresence>
                  {hoveredId === photo.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4"
                    >
                      <h3 className="text-white font-medium text-lg">{photo.title}</h3>
                      <p className="text-white/60 text-sm">
                        {photo.location} · {photo.year}
                      </p>
                      <div className="absolute top-4 right-4">
                        <ZoomIn className="w-5 h-5 text-white/80" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Navigation buttons */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigatePhoto("prev");
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigatePhoto("next");
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            {/* Image and info */}
            <div
              className="max-w-5xl max-h-[90vh] mx-auto px-16 flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                key={selectedPhoto.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                src={selectedPhoto.src}
                alt={selectedPhoto.title}
                className="max-h-[70vh] w-auto object-contain rounded-lg mx-auto block"
              />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-center"
              >
                <h2 className="text-2xl font-light text-white mb-2">{selectedPhoto.title}</h2>
                <p className="text-white/60 mb-2">
                  {selectedPhoto.location} · {selectedPhoto.year}
                </p>
                <p className="text-white/40 max-w-xl mx-auto">{selectedPhoto.description}</p>
                {(selectedPhoto.camera || selectedPhoto.lens || selectedPhoto.settings) && (
                  <div className="mt-4 flex items-center justify-center gap-4 text-sm text-white/30">
                    {selectedPhoto.camera && <span>{selectedPhoto.camera}</span>}
                    {selectedPhoto.lens && <span>{selectedPhoto.lens}</span>}
                    {selectedPhoto.settings && <span>{selectedPhoto.settings}</span>}
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
