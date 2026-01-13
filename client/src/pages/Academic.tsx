/**
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

export default function Academic() {
  const [expandedAbstract, setExpandedAbstract] = useState<number | null>(null);

  // Fetch papers from database
  const { data: dbPapers, isLoading, error } = trpc.papers.list.useQuery({});

  // Transform database papers to display format
  const papers = useMemo(() => {
    if (!dbPapers || dbPapers.length === 0) {
      return [];
    }
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
  }, [dbPapers]);

  const handleDownload = async (pdfUrl?: string, title?: string) => {
    if (pdfUrl) {
      // Check if mobile device
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // On mobile, directly open PDF in new tab/window
        // This is more reliable on mobile browsers
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        // Force download attribute for supported browsers
        if (title) {
          link.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        }
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("PDF已打开");
      } else {
        // Desktop: try blob download first
        try {
          const response = await fetch(pdfUrl, {
            mode: 'cors',
            credentials: 'omit'
          });
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
          window.open(pdfUrl, "_blank", "noopener,noreferrer");
        }
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

  // Loading state
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

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center py-16">
            <p className="text-red-400 mb-2">Failed to load papers</p>
            <p className="text-white/40 text-sm">{error.message}</p>
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
        className="container mx-auto px-4 md:px-6 mb-8 md:mb-12"
      >
        <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-semibold text-white mb-3 md:mb-4">
          Academic
        </h1>
      </motion.div>

      {/* Papers List */}
      <div className="container mx-auto px-6">
        {papers.length === 0 ? (
          <div className="text-center py-20">
            <GraduationCap className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-white/80 mb-2">No papers yet</h2>
            <p className="text-white/40 font-body">Academic papers will appear here once they are published.</p>
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
      {papers.length > 0 && (
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
      )}
    </div>
  );
}
