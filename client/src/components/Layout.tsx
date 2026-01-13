/*
 * Design Philosophy: Atmospheric Immersion
 * - Glass morphism navigation with backdrop blur
 * - Minimal interference with visual content
 * - Edge navigation that appears on interaction
 */

import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Search, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: "/", label: "Home" },
  { path: "/photography", label: "Photography" },
  { path: "/magazine", label: "Magazine" },
  { path: "/academic", label: "Academic" },
];

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isHomePage = location === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled || !isHomePage
            ? "glass border-b border-white/10"
            : "bg-transparent"
        }`}
      >
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/">
              <span className="font-display text-2xl font-semibold text-white tracking-wide hover:opacity-80 transition-opacity">
                Orpheus
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <span
                    className={`font-nav text-xs tracking-[0.2em] uppercase transition-all duration-300 hover:opacity-100 ${
                      location === item.path
                        ? "text-white opacity-100"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
              <Link href="/search">
                <span className="text-white/70 hover:text-white transition-colors p-2">
                  <Search size={18} />
                </span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white/70 hover:text-white transition-colors p-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden glass border-t border-white/10"
            >
              <div className="container mx-auto px-6 py-4 flex flex-col gap-4">
                {navItems.map((item) => (
                  <Link key={item.path} href={item.path}>
                    <span
                      className={`font-nav text-sm tracking-widest uppercase block py-2 transition-all duration-300 ${
                        location === item.path
                          ? "text-white"
                          : "text-white/70"
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                ))}
                <Link href="/search">
                  <span className="font-nav text-sm tracking-widest uppercase text-white/70 flex items-center gap-2 py-2">
                    <Search size={16} />
                    Search
                  </span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer - Only show on non-home pages */}
      {!isHomePage && (
        <footer className="glass border-t border-white/10 py-8">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="font-nav text-sm text-white/50">
                © {new Date().getFullYear()} Orpheus. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                {navItems.map((item) => (
                  <Link key={item.path} href={item.path}>
                    <span className="font-nav text-xs tracking-widest uppercase text-white/50 hover:text-white/80 transition-colors">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
