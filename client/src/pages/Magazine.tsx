/**
 * Design Philosophy: Unified Card Layout
 * - All articles use the same card style (no featured/special layout)
 * - Clean, consistent visual presentation
 * - Mobile-first responsive design
 * - Image displayed in rounded container with category badge
 */

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, ArrowRight, BookOpen, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface Essay {
  id: number;
  title: string;
  subtitle: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  category: string;
  coverImage: string;
}

// Estimate read time from content
function estimateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

export default function Magazine() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedEssay, setSelectedEssay] = useState<Essay | null>(null);

  // Fetch essays from database
  const { data: dbEssays, isLoading, error } = trpc.essays.list.useQuery({});

  // Transform database essays to display format
  const essays = useMemo(() => {
    if (!dbEssays || dbEssays.length === 0) {
      return [];
    }
    return dbEssays.map(e => ({
      id: e.id,
      title: e.title,
      subtitle: e.subtitle || "",
      excerpt: e.excerpt || "",
      content: e.content || "",
      date: e.publishedAt 
        ? new Date(e.publishedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      readTime: e.content ? estimateReadTime(e.content) : "5 min read",
      category: e.category || "Uncategorized",
      coverImage: e.coverImageUrl || "",
    }));
  }, [dbEssays]);

  // Extract unique categories from essays
  const categories = useMemo(() => {
    if (essays.length === 0) return ["All"];
    const uniqueCategories = new Set(essays.map(e => e.category));
    return ["All", ...Array.from(uniqueCategories)];
  }, [essays]);

  const filteredEssays =
    selectedCategory === "All"
      ? essays
      : essays.filter((essay) => essay.category === selectedCategory);

  // Handle opening an essay
  const handleOpenEssay = useCallback((essay: Essay) => {
    setSelectedEssay(essay);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle closing the essay
  const handleCloseEssay = useCallback(() => {
    setSelectedEssay(null);
  }, []);

  // Keyboard navigation for essay view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedEssay && e.key === 'Escape') {
        handleCloseEssay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEssay, handleCloseEssay]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 mb-8 md:mb-12">
          <div className="h-10 md:h-12 w-36 md:w-48 bg-white/10 rounded animate-pulse mb-4" />
          <div className="h-5 md:h-6 w-72 md:w-96 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="container mx-auto px-4 md:px-6 mb-8 md:mb-12">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-9 md:h-10 w-20 md:w-24 bg-white/10 rounded-full animate-pulse flex-shrink-0" />
            ))}
          </div>
        </div>
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-4">
                <div className="aspect-[4/3] bg-white/10 rounded-xl animate-pulse" />
                <div className="h-6 bg-white/10 rounded animate-pulse" />
                <div className="h-4 bg-white/10 rounded animate-pulse w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center py-16">
            <p className="text-red-400 mb-2">Failed to load essays</p>
            <p className="text-white/40 text-sm">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  // Essay Detail View
  if (selectedEssay) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="essay-detail"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen bg-background"
        >
          {/* Hero Image */}
          <div className="relative h-[50vh] md:h-[60vh] lg:h-[70vh]">
            {selectedEssay.coverImage ? (
              <img
                src={selectedEssay.coverImage}
                alt={selectedEssay.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-white/5" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            
            {/* Back Button */}
            <button
              onClick={handleCloseEssay}
              className="absolute top-20 md:top-24 left-4 md:left-12 flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/30 backdrop-blur-sm px-3 md:px-4 py-2 rounded-full"
              aria-label="返回文章列表"
            >
              <ArrowLeft size={18} className="md:w-5 md:h-5" />
              <span className="font-nav text-xs md:text-sm tracking-wider">Back to Magazine</span>
            </button>

            {/* Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-12 lg:p-16">
              <div className="max-w-4xl mx-auto">
                <span className="font-nav text-xs tracking-widest uppercase text-white/60 mb-3 md:mb-4 block">
                  {selectedEssay.category}
                </span>
                <h1 className="font-display text-2xl md:text-4xl lg:text-5xl text-white mb-2 md:mb-3">
                  {selectedEssay.title}
                </h1>
                {selectedEssay.subtitle && (
                  <p className="font-display text-lg md:text-xl lg:text-2xl italic text-white/80 mb-4 md:mb-6">
                    {selectedEssay.subtitle}
                  </p>
                )}
                <div className="flex items-center gap-3 md:gap-4 text-white/50 font-nav text-xs md:text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} className="md:w-[14px] md:h-[14px]" />
                    {selectedEssay.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="md:w-[14px] md:h-[14px]" />
                    {selectedEssay.readTime}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 lg:py-16">
            <article className="max-w-3xl mx-auto">
              <div className="prose prose-lg prose-invert prose-p:text-white/80 prose-p:leading-relaxed prose-p:font-body prose-headings:font-display prose-headings:text-white max-w-none">
                {selectedEssay.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-5 md:mb-6 text-base md:text-lg leading-relaxed text-white/80 font-body">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Back to Magazine */}
              <div className="mt-12 md:mt-16 pt-6 md:pt-8 border-t border-white/10">
                <button
                  onClick={handleCloseEssay}
                  className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
                >
                  <ArrowLeft size={16} className="md:w-[18px] md:h-[18px] group-hover:-translate-x-1 transition-transform" />
                  <span className="font-nav text-xs md:text-sm tracking-wider">Back to Magazine</span>
                </button>
              </div>
            </article>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-4 md:px-6 mb-8 md:mb-12"
      >
        <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-semibold text-white mb-3 md:mb-4">
          Magazine
        </h1>
        
      </motion.div>

      {/* Category Filter - Scrollable on mobile */}
      {essays.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="container mx-auto px-4 md:px-6 mb-8 md:mb-12"
        >
          <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`font-nav text-xs md:text-sm tracking-wider px-3 md:px-4 py-2 rounded-full transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                  selectedCategory === category
                    ? "bg-white text-black"
                    : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {essays.length === 0 ? (
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center py-16 md:py-20">
            <BookOpen className="w-12 h-12 md:w-16 md:h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-white/80 mb-2">No essays yet</h2>
            <p className="text-white/40 font-body">Essays will appear here once they are published.</p>
          </div>
        </div>
      ) : filteredEssays.length === 0 ? (
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center py-16 md:py-20">
            <BookOpen className="w-12 h-12 md:w-16 md:h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/40 font-body">No essays in this category</p>
          </div>
        </div>
      ) : (
        /* Unified Card Grid - All cards use the same style */
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {filteredEssays.map((essay, index) => (
              <motion.article
                key={essay.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => handleOpenEssay(essay)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenEssay(essay);
                  }
                }}
                aria-label={`阅读文章: ${essay.title}`}
              >
                {/* Image Container - Rounded with category badge */}
                <div className="relative overflow-hidden rounded-xl md:rounded-2xl mb-4 md:mb-5 bg-white/5">
                  <div className="relative">
                    {/* Image maintains natural aspect ratio within container */}
                    {essay.coverImage ? (
                      <img
                        src={essay.coverImage}
                        alt={essay.title}
                        className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="aspect-[4/3] bg-white/10" />
                    )}
                  </div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 md:top-4 left-3 md:left-4">
                    <span className="font-nav text-xs tracking-wider px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-white/90">
                      {essay.category}
                    </span>
                  </div>
                </div>

                {/* Text Content */}
                <div className="space-y-2 md:space-y-3">
                  <h3 className="font-display text-xl md:text-2xl text-white group-hover:text-white/80 transition-colors">
                    {essay.title}
                  </h3>
                  {essay.subtitle && (
                    <p className="font-display text-base md:text-lg italic text-white/60">
                      {essay.subtitle}
                    </p>
                  )}
                  {essay.excerpt && (
                    <p className="font-body text-sm md:text-base text-white/50 line-clamp-3">
                      {essay.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 md:gap-3 text-white/40 font-nav text-xs">
                      <span>{essay.date}</span>
                      <span>·</span>
                      <span>{essay.readTime}</span>
                    </div>
                    <span className="text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all">
                      <ArrowRight size={16} className="md:w-[18px] md:h-[18px]" />
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
