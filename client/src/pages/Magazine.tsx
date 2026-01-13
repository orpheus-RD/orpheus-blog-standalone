/*
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

// Fallback static essays
const staticEssays: Essay[] = [
  {
    id: 1,
    title: "The Art of Seeing",
    subtitle: "On Photography and Presence",
    excerpt:
      "In an age of infinite images, what does it mean to truly see? The camera becomes not just a tool for capture, but a lens through which we learn to inhabit the present moment more fully.",
    content: `In an age of infinite images, what does it mean to truly see? The camera becomes not just a tool for capture, but a lens through which we learn to inhabit the present moment more fully.

Photography, at its essence, is an act of attention. When we raise the camera to our eye, we are making a declaration: this moment matters. This light, this gesture, this fleeting configuration of the world deserves to be preserved.

But the paradox of photography is that in our rush to capture, we often fail to truly see. We become collectors of moments rather than inhabitants of them. The camera can become a barrier between ourselves and experience, a way of deferring presence to some imagined future when we will finally look at our photographs and remember.

The great photographers understood this tension. Henri Cartier-Bresson spoke of the "decisive moment"—that instant when form and content, gesture and meaning, align in perfect visual harmony. But to recognize such moments requires a kind of seeing that goes beyond mere looking. It requires presence, patience, and a willingness to be surprised by the world.

To photograph well is to practice a form of meditation. It is to slow down, to notice, to attend to the subtle play of light and shadow, the geometry of everyday spaces, the unguarded expressions that reveal our common humanity. The camera becomes not an escape from the present, but a doorway into deeper engagement with it.

In our image-saturated age, perhaps the most radical act is not to take more photographs, but to look more carefully at the ones we have. To sit with an image, to let it unfold its meanings slowly, to resist the urge to swipe to the next distraction. In this way, photography can teach us not just to see, but to be.`,
    date: "December 2024",
    readTime: "12 min read",
    category: "Photography",
    coverImage: "/images/image7.jpg",
  },
  {
    id: 2,
    title: "Wandering Through Time",
    subtitle: "Reflections on European Architecture",
    excerpt:
      "Standing before the Pantheon, one feels the weight of two millennia pressing down through those ancient columns. Architecture, at its finest, is frozen music—a symphony in stone that plays across centuries.",
    content: `Standing before the Pantheon, one feels the weight of two millennia pressing down through those ancient columns. Architecture, at its finest, is frozen music—a symphony in stone that plays across centuries.

The great buildings of Europe are not merely structures; they are conversations across time. When we enter a Gothic cathedral, we participate in a dialogue that began eight hundred years ago. The masons who carved those stones, the architects who conceived those soaring vaults, the countless worshippers who have passed through those doors—all are present in the space, their intentions and aspirations embedded in every surface.

Rome teaches us that cities are palimpsests. Beneath the Renaissance facades lie medieval foundations, and beneath those, the bones of ancient temples. To walk through Rome is to move through layers of time, each era leaving its mark on the urban fabric. The Pantheon's dome, still the largest unreinforced concrete dome in the world, speaks to an engineering audacity that we have yet to surpass.

But European architecture is not only about grandeur. It is also about the intimate scale of the village square, the proportions of a Tuscan farmhouse, the way light falls through a Venetian window onto a terrazzo floor. These vernacular traditions, developed over centuries of trial and refinement, offer lessons in how to build places that nourish the human spirit.

In an age of generic glass towers and cookie-cutter developments, the old cities of Europe remind us that architecture can be an art of place-making. Buildings can respond to climate, to culture, to the specific qualities of light and landscape. They can create spaces that invite lingering, that foster community, that age gracefully and grow more beautiful with time.

To travel through Europe is to receive an education in the possibilities of the built environment. It is to understand that architecture is not merely shelter, but a form of collective memory, a way of inscribing our values and aspirations in the physical world.`,
    date: "November 2024",
    readTime: "15 min read",
    category: "Travel",
    coverImage: "/images/image3.jpg",
  },
  {
    id: 3,
    title: "The Silence of Snow",
    subtitle: "A Winter Journey to the Scottish Highlands",
    excerpt:
      "There is a particular quality to highland silence in winter—not an absence of sound, but a presence of stillness so profound it becomes almost audible. The mountains hold their breath.",
    content: `There is a particular quality to highland silence in winter—not an absence of sound, but a presence of stillness so profound it becomes almost audible. The mountains hold their breath.

I arrived in the Highlands in late January, when the days are short and the light has a quality found nowhere else on earth. The sun, when it appears, hangs low on the horizon, casting long shadows across the snow-covered glens. Colors are muted—whites, grays, the dark green of distant pines—but within this limited palette, infinite subtleties reveal themselves.

The cold here is not merely temperature; it is a presence. It sharpens the senses, clarifies the mind. Breath becomes visible, a reminder of our animal nature, our dependence on the thin envelope of warmth we carry with us. The body learns to move efficiently, to conserve heat, to find shelter in the lee of rocks and walls.

Walking in the winter Highlands is an exercise in attention. The snow records everything—the passage of deer, the hunting routes of foxes, the landing sites of ravens. Reading these signs, one begins to understand the landscape as a living text, constantly being written and erased by weather and wildlife.

At night, if the clouds clear, the stars appear with an intensity impossible in light-polluted lowlands. The Milky Way arches overhead, and one understands viscerally what our ancestors knew: that we are small creatures on a small planet, spinning through an incomprehensible vastness.

The Highlands in winter offer no easy comforts. The weather can turn deadly in minutes; the distances are real; the cold is unforgiving. But for those willing to accept these terms, the rewards are profound. Here, in the silence of snow, one finds a kind of clarity that the busy world denies us. The mountains ask nothing of us but presence, and in return, they offer a glimpse of something eternal.`,
    date: "October 2024",
    readTime: "10 min read",
    category: "Travel",
    coverImage: "/images/DSCF3114.JPG",
  },
  {
    id: 4,
    title: "Portraits of Strangers",
    subtitle: "The Ethics and Aesthetics of Street Photography",
    excerpt:
      "Every photograph of a stranger is an act of both intimacy and intrusion. We capture moments that belong to others, freezing their private gestures into our public narratives.",
    content: `Every photograph of a stranger is an act of both intimacy and intrusion. We capture moments that belong to others, freezing their private gestures into our public narratives.

Street photography occupies an uncomfortable ethical territory. Unlike portrait photography, where subject and photographer enter into a contract of mutual consent, street photography often operates without permission. We take what is not offered, preserve what was meant to be ephemeral, make public what was private.

And yet, the greatest street photographs achieve something that consensual portraits rarely do. They capture people in states of unselfconsciousness, revealing truths that posed photographs conceal. The woman lost in thought on the subway, the children playing in a shaft of light, the old man feeding pigeons in the park—these images show us humanity in its unguarded moments.

The ethics of street photography cannot be reduced to simple rules. Context matters. A photograph that celebrates human dignity is different from one that exploits vulnerability. A image that reveals universal truths about the human condition is different from one that merely satisfies curiosity about others' lives.

The best street photographers develop a kind of ethical intuition. They learn to distinguish between images that honor their subjects and those that diminish them. They understand that the camera confers a responsibility—not just to make interesting pictures, but to represent the world with honesty and compassion.

In an age of ubiquitous surveillance and social media exposure, street photography raises new questions. When everyone carries a camera, when every public moment is potentially documented, what space remains for anonymity, for the freedom to move through the world unobserved?

Perhaps the answer lies not in abandoning street photography, but in practicing it with greater intentionality. To photograph strangers is to acknowledge our interconnection, our shared presence in public space. Done well, it can be an act of witness, a way of saying: I saw you, and your existence mattered.`,
    date: "September 2024",
    readTime: "18 min read",
    category: "Photography",
    coverImage: "/images/image5.jpg",
  },
];

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
  const { data: dbEssays, isLoading } = trpc.essays.list.useQuery({});

  // Transform database essays to display format
  const essays = useMemo(() => {
    if (dbEssays && dbEssays.length > 0) {
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
        coverImage: e.coverImageUrl || "/images/image7.jpg",
      }));
    }
    return staticEssays;
  }, [dbEssays]);

  // Extract unique categories from essays
  const categories = useMemo(() => {
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
            <img
              src={selectedEssay.coverImage}
              alt={selectedEssay.title}
              className="w-full h-full object-cover"
            />
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

      {/* Empty State */}
      {filteredEssays.length === 0 ? (
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center py-16 md:py-20">
            <BookOpen className="w-12 h-12 md:w-16 md:h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/40 font-body">No essays yet</p>
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
                    <img
                      src={essay.coverImage}
                      alt={essay.title}
                      className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.02]"
                      loading="lazy"
                    />
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
