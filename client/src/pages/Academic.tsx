/*
 * Design Philosophy: Atmospheric Immersion
 * - Formal academic presentation with visual consistency
 * - Clean typography supporting serious reading
 * - Metadata presentation (author, abstract, references)
 * - Professional without being visually sterile
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { FileText, Calendar, BookOpen, ExternalLink, Download, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface Paper {
  id: number;
  title: string;
  authors: string[];
  abstract: string;
  journal: string;
  year: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  keywords: string[];
  pdfUrl?: string;
  citations?: number;
}

// Fallback static papers
const staticPapers: Paper[] = [
  {
    id: 1,
    title: "Visual Rhetoric in Contemporary Documentary Photography: A Semiotic Analysis",
    authors: ["Orpheus D."],
    abstract:
      "This paper examines the evolving visual rhetoric employed in contemporary documentary photography, analyzing how photographers construct meaning through compositional choices, color grading, and subject positioning. Drawing on semiotic theory and visual culture studies, we propose a framework for understanding how documentary images function as both evidence and argument in the digital age.",
    journal: "Journal of Visual Culture",
    year: "2024",
    volume: "23",
    pages: "145-172",
    doi: "10.1177/1470412924000001",
    keywords: ["Documentary Photography", "Visual Rhetoric", "Semiotics", "Digital Culture"],
  },
  {
    id: 2,
    title: "The Phenomenology of Place: Architectural Experience and Embodied Perception",
    authors: ["Orpheus D.", "Smith, J."],
    abstract:
      "This study investigates the phenomenological dimensions of architectural experience, focusing on how built environments shape embodied perception and spatial consciousness. Through a combination of theoretical analysis and empirical observation, we argue that architecture functions as a medium for the cultivation of particular modes of being-in-the-world.",
    journal: "Architectural Theory Review",
    year: "2024",
    volume: "29",
    pages: "78-103",
    doi: "10.1080/13264826.2024.000002",
    keywords: ["Phenomenology", "Architecture", "Embodiment", "Spatial Perception"],
  },
  {
    id: 3,
    title: "Between Stillness and Motion: Temporality in Landscape Photography",
    authors: ["Orpheus D."],
    abstract:
      "This article explores the paradoxical relationship between stillness and motion in landscape photography, examining how photographers negotiate the tension between the frozen moment of capture and the continuous flow of natural time. We analyze works by contemporary landscape photographers to demonstrate how temporal complexity is encoded within seemingly static images.",
    journal: "Photography & Culture",
    year: "2023",
    volume: "16",
    pages: "234-258",
    doi: "10.1080/17514517.2023.000003",
    keywords: ["Landscape Photography", "Temporality", "Nature", "Visual Arts"],
  },
];

export default function Academic() {
  const [expandedAbstract, setExpandedAbstract] = useState<number | null>(null);

  // Fetch papers from database
  const { data: dbPapers, isLoading } = trpc.papers.list.useQuery({});

  // Transform database papers to display format
  const papers = useMemo(() => {
    if (dbPapers && dbPapers.length > 0) {
      return dbPapers.map(p => ({
        id: p.id,
        title: p.title,
        authors: p.authors.split(',').map(a => a.trim()),
        abstract: p.abstract || "",
        journal: p.journal || "",
        year: p.year?.toString() || new Date().getFullYear().toString(),
        volume: p.volume || undefined,
        issue: p.issue || undefined,
        pages: p.pages || undefined,
        doi: p.doi || undefined,
        keywords: p.tags ? p.tags.split(',').map(t => t.trim()) : [],
        pdfUrl: p.pdfUrl || undefined,
        citations: p.citations || undefined,
      }));
    }
    return staticPapers;
  }, [dbPapers]);

  const handleDownload = async (pdfUrl?: string, title?: string) => {
    if (pdfUrl) {
      try {
        // Try to download the file
        const response = await fetch(pdfUrl);
        if (!response.ok) {
          throw new Error('Download failed');
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = title ? `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf` : 'paper.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("PDF下载成功");
      } catch (error) {
        // Fallback to opening in new tab
        window.open(pdfUrl, "_blank");
      }
    } else {
      toast("Coming Soon", {
        description: "PDF downloads will be available soon.",
      });
    }
  };

  const handleDOI = (doi: string) => {
    window.open(`https://doi.org/${doi}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-6 mb-12">
          <div className="h-12 w-64 bg-white/10 rounded animate-pulse mb-4" />
          <div className="h-6 w-96 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="container mx-auto px-6">
          <div className="space-y-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card border border-border rounded-lg p-6 md:p-8 animate-pulse">
                <div className="h-8 bg-white/10 rounded mb-4 w-3/4" />
                <div className="h-4 bg-white/10 rounded mb-4 w-1/4" />
                <div className="h-4 bg-white/10 rounded mb-4 w-1/2" />
                <div className="flex gap-2">
                  {[1, 2, 3].map(j => (
                    <div key={j} className="h-6 w-24 bg-white/10 rounded-full" />
                  ))}
                </div>
              </div>
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
        className="container mx-auto px-6 mb-12"
      >
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-4">
          Academic Papers
        </h1>
        <p className="font-body text-lg text-white/60 max-w-2xl">
          Scholarly articles and research publications exploring the intersections
          of visual culture, phenomenology, and aesthetic theory.
        </p>
      </motion.div>

      {/* Papers List */}
      <div className="container mx-auto px-6">
        {papers.length === 0 ? (
          <div className="text-center py-20">
            <GraduationCap className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/40 font-body">No papers yet</p>
          </div>
        ) : (
          <div className="space-y-8">
            {papers.map((paper, index) => (
              <motion.article
                key={paper.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-card border border-border rounded-lg p-6 md:p-8"
              >
                {/* Title and Authors */}
                <div className="mb-4">
                  <h2 className="font-display text-2xl md:text-3xl text-white mb-3 leading-tight">
                    {paper.title}
                  </h2>
                  <p className="font-body text-white/70">
                    {paper.authors.join(", ")}
                  </p>
                </div>

                {/* Publication Info */}
                <div className="flex flex-wrap items-center gap-4 mb-4 text-white/50 font-nav text-sm">
                  {paper.journal && (
                    <span className="flex items-center gap-1">
                      <BookOpen size={14} />
                      {paper.journal}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {paper.year}
                  </span>
                  {paper.volume && (
                    <span>
                      Vol. {paper.volume}
                      {paper.issue && `, No. ${paper.issue}`}
                      {paper.pages && `, pp. ${paper.pages}`}
                    </span>
                  )}
                  {paper.citations !== undefined && paper.citations > 0 && (
                    <span className="text-white/40">
                      Cited by {paper.citations}
                    </span>
                  )}
                </div>

                {/* Abstract */}
                {paper.abstract && (
                  <div className="mb-4">
                    <button
                      onClick={() =>
                        setExpandedAbstract(
                          expandedAbstract === paper.id ? null : paper.id
                        )
                      }
                      className="font-nav text-sm tracking-wider text-white/60 hover:text-white transition-colors mb-2 flex items-center gap-2"
                    >
                      <FileText size={14} />
                      Abstract
                      <span className="text-xs">
                        {expandedAbstract === paper.id ? "▲" : "▼"}
                      </span>
                    </button>
                    <motion.div
                      initial={false}
                      animate={{
                        height: expandedAbstract === paper.id ? "auto" : 0,
                        opacity: expandedAbstract === paper.id ? 1 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="font-body text-white/70 leading-relaxed pl-6 border-l-2 border-white/20">
                        {paper.abstract}
                      </p>
                    </motion.div>
                  </div>
                )}

                {/* Keywords */}
                {paper.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {paper.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="font-nav text-xs tracking-wider px-3 py-1 bg-white/5 rounded-full text-white/50"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-4">
                  {paper.doi && (
                    <button
                      onClick={() => handleDOI(paper.doi!)}
                      className="flex items-center gap-2 font-nav text-sm tracking-wider text-white/60 hover:text-white transition-colors"
                    >
                      <ExternalLink size={14} />
                      DOI: {paper.doi}
                    </button>
                  )}
                  <button
                    onClick={() => handleDownload(paper.pdfUrl, paper.title)}
                    className="flex items-center gap-2 font-nav text-sm tracking-wider px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white/80 hover:text-white transition-all"
                  >
                    <Download size={14} />
                    Download PDF
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      {/* Citation Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="container mx-auto px-6 mt-16"
      >
        <div className="border-t border-white/10 pt-8">
          <p className="font-body text-sm text-white/40 max-w-2xl">
            For citation information or to request full-text access to any of these
            publications, please contact the author directly. All works are
            protected under applicable copyright laws.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
