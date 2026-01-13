/*
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

// Fallback static photos for when database is empty
const staticPhotos: Photo[] = [
  {
    id: 1,
    src: "/images/DSCF3114.JPG",
    title: "Winter Solitude",
    location: "Isle of Skye, Scotland",
    year: "2024",
    description: "Snow-covered peaks under a pale winter sky, where silence speaks louder than words.",
  },
  {
    id: 2,
    src: "/images/image7.jpg",
    title: "Edge of the World",
    location: "Seven Sisters, England",
    year: "2024",
    description: "Where chalk cliffs meet the sea, two figures walk toward the infinite horizon.",
  },
  {
    id: 3,
    src: "/images/image1.jpg",
    title: "Turquoise Waters",
    location: "Étretat, France",
    year: "2024",
    description: "A lone kayaker navigates the crystal waters beneath ancient limestone cliffs.",
  },
  {
    id: 4,
    src: "/images/image5.jpg",
    title: "Threshold",
    location: "York, England",
    year: "2024",
    description: "An elderly man pauses at the doorway, caught between shadow and light.",
  },
  {
    id: 5,
    src: "/images/image2.jpg",
    title: "Florentine Light",
    location: "Florence, Italy",
    year: "2024",
    description: "The Duomo's intricate facade glows in the golden hour, as crowds gather below.",
  },
  {
    id: 6,
    src: "/images/image3.jpg",
    title: "Roman Passage",
    location: "Rome, Italy",
    year: "2024",
    description: "The Pantheon stands eternal, as modern life flows past its ancient columns.",
  },
];

export default function Photography() {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Fetch photos from database
  const { data: dbPhotos, isLoading } = trpc.photos.list.useQuery({});

  // Transform database photos to display format, fallback to static if empty
  const photos = useMemo(() => {
    if (dbPhotos && dbPhotos.length > 0) {
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
    }
    return staticPhotos;
  }, [dbPhotos]);

  const openLightbox = useCallback((photo: Photo) => {
    setSelectedPhoto(photo);
    setIsLightboxOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    setTimeout(() => {
      setSelectedPhoto(null);
      document.body.style.overflow = "auto";
    }, 300);
  }, []);

  const navigatePhoto = useCallback((direction: "prev" | "next") => {
    if (!selectedPhoto) return;
    const currentIndex = photos.findIndex((p) => p.id === selectedPhoto.id);
    const newIndex =
      direction === "next"
        ? (currentIndex + 1) % photos.length
        : (currentIndex - 1 + photos.length) % photos.length;
    setSelectedPhoto(photos[newIndex]);
  }, [selectedPhoto, photos]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      
      switch (e.key) {
        case "Escape":
          closeLightbox();
          break;
        case "ArrowLeft":
          navigatePhoto("prev");
          break;
        case "ArrowRight":
          navigatePhoto("next");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, closeLightbox, navigatePhoto]);

  // Handle download
  const handleDownload = useCallback(async (photo: Photo) => {
    try {
      const response = await fetch(photo.src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${photo.title.replace(/\s+/g, "_")}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("图片下载成功");
    } catch (error) {
      toast.error("下载失败，请稍后重试");
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 mb-12 md:mb-16">
          <div className="h-10 md:h-12 w-48 md:w-64 bg-white/10 rounded animate-pulse mb-4" />
          <div className="h-5 md:h-6 w-72 md:w-96 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="container mx-auto px-4 md:px-6">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="mb-4 md:mb-6 bg-white/10 rounded-lg animate-pulse"
                style={{ height: `${200 + (i % 3) * 100}px` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-4 md:px-6 mb-12 md:mb-16"
      >
        <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-semibold text-white mb-3 md:mb-4">
          Photography
        </h1>
        
      </motion.div>

      {/* Gallery - Masonry Layout for Full Image Display */}
      <div className="container mx-auto px-4 md:px-6">
        {photos.length === 0 ? (
          <div className="text-center py-20">
            <Camera className="w-12 h-12 md:w-16 md:h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/40 font-body">No photos yet</p>
          </div>
        ) : (
          <>
            {/* First Row - Top Aligned Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6 items-start">
              {photos.slice(0, 2).map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  onMouseEnter={() => setHoveredId(photo.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div
                    className="relative overflow-hidden rounded-lg bg-white/5 cursor-pointer group"
                    onClick={() => openLightbox(photo)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openLightbox(photo);
                      }
                    }}
                    aria-label={`查看 ${photo.title}`}
                  >
                    <div className="relative">
                      <img
                        src={photo.src}
                        alt={photo.title}
                        className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: hoveredId === photo.id ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4 md:p-6"
                      >
                        <div className="flex items-end justify-between">
                          <div className="flex-1 min-w-0 mr-3">
                            <h3 className="font-display text-lg md:text-xl lg:text-2xl text-white mb-1 truncate">
                              {photo.title}
                            </h3>
                            <p className="font-nav text-xs md:text-sm text-white/70 tracking-wide truncate">
                              {photo.location} {photo.location && photo.year && "·"} {photo.year}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openLightbox(photo);
                              }}
                              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                              aria-label="放大查看"
                            >
                              <ZoomIn className="w-4 h-4 md:w-5 md:h-5 text-white" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(photo);
                              }}
                              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                              aria-label="下载图片"
                            >
                              <Download className="w-4 h-4 md:w-5 md:h-5 text-white" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Remaining Photos - Masonry Layout */}
            {photos.length > 2 && (
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-6">
                {photos.slice(2).map((photo, index) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: (index + 2) * 0.1 }}
                    className="mb-4 md:mb-6 break-inside-avoid"
                    onMouseEnter={() => setHoveredId(photo.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div
                      className="relative overflow-hidden rounded-lg bg-white/5 cursor-pointer group"
                      onClick={() => openLightbox(photo)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openLightbox(photo);
                        }
                      }}
                      aria-label={`查看 ${photo.title}`}
                    >
                      <div className="relative">
                        <img
                          src={photo.src}
                          alt={photo.title}
                          className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: hoveredId === photo.id ? 1 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4 md:p-6"
                        >
                          <div className="flex items-end justify-between">
                            <div className="flex-1 min-w-0 mr-3">
                              <h3 className="font-display text-lg md:text-xl lg:text-2xl text-white mb-1 truncate">
                                {photo.title}
                              </h3>
                              <p className="font-nav text-xs md:text-sm text-white/70 tracking-wide truncate">
                                {photo.location} {photo.location && photo.year && "·"} {photo.year}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openLightbox(photo);
                                }}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                                aria-label="放大查看"
                              >
                                <ZoomIn className="w-4 h-4 md:w-5 md:h-5 text-white" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(photo);
                                }}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                                aria-label="下载图片"
                              >
                                <Download className="w-4 h-4 md:w-5 md:h-5 text-white" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label="图片查看器"
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 md:top-6 md:right-6 p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
              aria-label="关闭"
            >
              <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </button>

            {/* Navigation Buttons */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigatePhoto("prev");
              }}
              className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
              aria-label="上一张"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigatePhoto("next");
              }}
              className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
              aria-label="下一张"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </button>

            {/* Image Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-[95vw] max-h-[85vh] md:max-w-[90vw] md:max-h-[80vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPhoto.src}
                alt={selectedPhoto.title}
                className="max-w-full max-h-[70vh] md:max-h-[75vh] object-contain rounded-lg mx-auto block"
              />
              
              {/* Photo Info */}
              <div className="mt-4 md:mt-6 text-center px-4">
                <h2 className="font-display text-xl md:text-2xl lg:text-3xl text-white mb-2">
                  {selectedPhoto.title}
                </h2>
                <p className="font-nav text-xs md:text-sm text-white/60 tracking-wide mb-3">
                  {selectedPhoto.location} {selectedPhoto.location && selectedPhoto.year && "·"} {selectedPhoto.year}
                </p>
                {selectedPhoto.description && (
                  <p className="font-body text-sm md:text-base text-white/50 max-w-2xl mx-auto mb-4 line-clamp-2 md:line-clamp-none">
                    {selectedPhoto.description}
                  </p>
                )}
                
                {/* Download Button */}
                <button
                  onClick={() => handleDownload(selectedPhoto)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>下载图片</span>
                </button>

                {/* Photo Counter */}
                <p className="font-nav text-xs text-white/40 mt-4">
                  {photos.findIndex((p) => p.id === selectedPhoto.id) + 1} / {photos.length}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
