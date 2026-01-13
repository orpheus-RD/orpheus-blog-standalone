/*
 * Design Philosophy: Atmospheric Immersion
 * - Clean, categorized search results
 * - User-friendly presentation
 * - Search across photography, essays, and papers
 * - Minimal, focused interface
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, Camera, BookOpen, FileText, X } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface SearchResult {
  id: number;
  type: "photography" | "magazine" | "academic";
  title: string;
  subtitle?: string;
  description: string;
  image?: string;
  tags: string[];
}

// Static fallback content
const staticContent: SearchResult[] = [
  // Photography
  {
    id: 1,
    type: "photography",
    title: "Winter Solitude",
    subtitle: "Isle of Skye, Scotland",
    description: "Snow-covered peaks under a pale winter sky",
    image: "/images/DSCF3114.JPG",
    tags: ["landscape", "winter", "scotland", "mountains", "snow"],
  },
  {
    id: 2,
    type: "photography",
    title: "Edge of the World",
    subtitle: "Seven Sisters, England",
    description: "Where chalk cliffs meet the sea",
    image: "/images/image7.jpg",
    tags: ["landscape", "cliffs", "england", "coast", "fog"],
  },
  {
    id: 3,
    type: "photography",
    title: "Turquoise Waters",
    subtitle: "Étretat, France",
    description: "A lone kayaker beneath limestone cliffs",
    image: "/images/image1.jpg",
    tags: ["seascape", "france", "kayak", "cliffs", "water"],
  },
  {
    id: 4,
    type: "photography",
    title: "Threshold",
    subtitle: "York, England",
    description: "An elderly man at the doorway",
    image: "/images/image5.jpg",
    tags: ["street", "portrait", "england", "light", "shadow"],
  },
  {
    id: 5,
    type: "photography",
    title: "Florentine Light",
    subtitle: "Florence, Italy",
    description: "The Duomo in golden hour",
    image: "/images/image2.jpg",
    tags: ["architecture", "italy", "florence", "cathedral", "crowd"],
  },
  {
    id: 6,
    type: "photography",
    title: "Roman Passage",
    subtitle: "Rome, Italy",
    description: "The Pantheon's ancient columns",
    image: "/images/image3.jpg",
    tags: ["architecture", "italy", "rome", "pantheon", "history"],
  },
  // Magazine Essays
  {
    id: 7,
    type: "magazine",
    title: "The Art of Seeing",
    subtitle: "On Photography and Presence",
    description: "What does it mean to truly see in an age of infinite images?",
    image: "/images/image7.jpg",
    tags: ["photography", "presence", "mindfulness", "vision"],
  },
  {
    id: 8,
    type: "magazine",
    title: "Wandering Through Time",
    subtitle: "Reflections on European Architecture",
    description: "Architecture as frozen music across centuries",
    image: "/images/image3.jpg",
    tags: ["architecture", "europe", "history", "travel"],
  },
  {
    id: 9,
    type: "magazine",
    title: "The Silence of Snow",
    subtitle: "A Winter Journey to the Scottish Highlands",
    description: "The profound stillness of highland winter",
    image: "/images/DSCF3114.JPG",
    tags: ["travel", "scotland", "winter", "nature", "silence"],
  },
  // Academic Papers
  {
    id: 10,
    type: "academic",
    title: "Visual Rhetoric in Contemporary Documentary Photography",
    description: "A semiotic analysis of meaning construction in documentary images",
    tags: ["documentary", "semiotics", "visual culture", "rhetoric"],
  },
  {
    id: 11,
    type: "academic",
    title: "The Phenomenology of Place",
    description: "Architectural experience and embodied perception",
    tags: ["phenomenology", "architecture", "embodiment", "perception"],
  },
  {
    id: 12,
    type: "academic",
    title: "Between Stillness and Motion",
    description: "Temporality in landscape photography",
    tags: ["landscape", "temporality", "photography", "time"],
  },
];

const typeIcons = {
  photography: Camera,
  magazine: BookOpen,
  academic: FileText,
};

const typeLabels = {
  photography: "Photography",
  magazine: "Magazine",
  academic: "Academic",
};

const typeRoutes = {
  photography: "/photography",
  magazine: "/magazine",
  academic: "/academic",
};

export default function Search() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Fetch data from backend
  const { data: dbPhotos } = trpc.photos.list.useQuery({});
  const { data: dbEssays } = trpc.essays.list.useQuery({});
  const { data: dbPapers } = trpc.papers.list.useQuery({});

  // Combine database content with static fallback
  const allContent = useMemo(() => {
    const content: SearchResult[] = [];

    // Add database photos
    if (dbPhotos && dbPhotos.length > 0) {
      dbPhotos.forEach(photo => {
        content.push({
          id: photo.id,
          type: "photography",
          title: photo.title,
          subtitle: photo.location || undefined,
          description: photo.description || "",
          image: photo.imageUrl,
          tags: photo.tags ? photo.tags.split(',').map(t => t.trim()) : [],
        });
      });
    }

    // Add database essays
    if (dbEssays && dbEssays.length > 0) {
      dbEssays.forEach(essay => {
        content.push({
          id: essay.id + 1000, // Offset to avoid ID collision
          type: "magazine",
          title: essay.title,
          subtitle: essay.subtitle || undefined,
          description: essay.excerpt || "",
          image: essay.coverImageUrl || undefined,
          tags: essay.tags ? essay.tags.split(',').map(t => t.trim()) : [],
        });
      });
    }

    // Add database papers
    if (dbPapers && dbPapers.length > 0) {
      dbPapers.forEach(paper => {
        content.push({
          id: paper.id + 2000, // Offset to avoid ID collision
          type: "academic",
          title: paper.title,
          description: paper.abstract || "",
          tags: paper.tags ? paper.tags.split(',').map(t => t.trim()) : [],
        });
      });
    }

    // If no database content, use static fallback
    if (content.length === 0) {
      return staticContent;
    }

    return content;
  }, [dbPhotos, dbEssays, dbPapers]);

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const searchTerms = query.toLowerCase().split(" ").filter(Boolean);

    return allContent.filter((item) => {
      // Filter by type if active
      if (activeFilter && item.type !== activeFilter) return false;

      // Search in title, subtitle, description, and tags
      const searchableText = [
        item.title,
        item.subtitle || "",
        item.description,
        ...item.tags,
      ]
        .join(" ")
        .toLowerCase();

      return searchTerms.every((term) => searchableText.includes(term));
    });
  }, [query, activeFilter, allContent]);

  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {
      photography: [],
      magazine: [],
      academic: [],
    };

    results.forEach((result) => {
      groups[result.type].push(result);
    });

    return groups;
  }, [results]);

  const handleResultClick = () => {
    toast("Coming Soon", {
      description: "Detailed view will be available soon.",
    });
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-6 mb-8"
      >
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-4">
          Search
        </h1>
        <p className="font-body text-lg text-white/60 max-w-2xl">
          Explore photography, essays, and academic papers across the entire site.
        </p>
      </motion.div>

      {/* Search Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="container mx-auto px-6 mb-8"
      >
        <div className="relative max-w-2xl">
          <SearchIcon
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, description, or tags..."
            className="w-full bg-card border border-border rounded-lg pl-12 pr-12 py-4 font-body text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </motion.div>

      {/* Filter Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="container mx-auto px-6 mb-12"
      >
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveFilter(null)}
            className={`font-nav text-sm tracking-wider px-4 py-2 rounded-full transition-all duration-300 ${
              activeFilter === null
                ? "bg-white text-black"
                : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
            }`}
          >
            All
          </button>
          {Object.entries(typeLabels).map(([key, label]) => {
            const Icon = typeIcons[key as keyof typeof typeIcons];
            return (
              <button
                key={key}
                onClick={() => setActiveFilter(activeFilter === key ? null : key)}
                className={`font-nav text-sm tracking-wider px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2 ${
                  activeFilter === key
                    ? "bg-white text-black"
                    : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Results */}
      <div className="container mx-auto px-6">
        <AnimatePresence mode="wait">
          {query.trim() === "" ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <SearchIcon size={48} className="mx-auto text-white/20 mb-4" />
              <p className="font-body text-white/40">
                Start typing to search across all content
              </p>
            </motion.div>
          ) : results.length === 0 ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <p className="font-body text-white/60 mb-2">
                No results found for "{query}"
              </p>
              <p className="font-body text-white/40 text-sm">
                Try different keywords or remove filters
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              {Object.entries(groupedResults).map(([type, items]) => {
                if (items.length === 0) return null;
                const Icon = typeIcons[type as keyof typeof typeIcons];
                const label = typeLabels[type as keyof typeof typeLabels];
                const route = typeRoutes[type as keyof typeof typeRoutes];

                return (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-display text-2xl text-white flex items-center gap-3">
                        <Icon size={24} className="text-white/60" />
                        {label}
                        <span className="font-nav text-sm text-white/40">
                          ({items.length})
                        </span>
                      </h2>
                      <Link href={route}>
                        <span className="font-nav text-sm text-white/50 hover:text-white transition-colors">
                          View all →
                        </span>
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {items.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                          className="bg-card border border-border rounded-lg overflow-hidden cursor-pointer group hover:border-white/20 transition-colors"
                          onClick={handleResultClick}
                        >
                          {item.image && (
                            <div className="aspect-[16/9] overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <h3 className="font-display text-lg text-white mb-1 group-hover:text-white/80 transition-colors">
                              {item.title}
                            </h3>
                            {item.subtitle && (
                              <p className="font-body text-sm text-white/60 mb-2">
                                {item.subtitle}
                              </p>
                            )}
                            <p className="font-body text-sm text-white/40 line-clamp-2">
                              {item.description}
                            </p>
                            {item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {item.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="font-nav text-xs px-2 py-0.5 bg-white/5 rounded text-white/40"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
