/*
 * Design Philosophy: Atmospheric Immersion
 * - Full-screen background image carousel with Ken Burns effect
 * - Slow, contemplative transitions (5s fade)
 * - Text floating above imagery with subtle shadows
 * - Minimal UI interference
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const backgroundImages = [
  "/images/DSCF3114.JPG",
  "/images/image7.jpg",
  "/images/image1.jpg",
  "/images/image5.jpg",
  "/images/image2.jpg",
  "/images/image3.jpg",
];

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Preload images
  useEffect(() => {
    const preloadImages = backgroundImages.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });
    
    Promise.all(
      preloadImages.map(
        (img) =>
          new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          })
      )
    ).then(() => setIsLoaded(true));
  }, []);

  // Auto-rotate images every 8 seconds
  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const interval = setInterval(nextImage, 8000);
    return () => clearInterval(interval);
  }, [isLoaded, nextImage]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image Carousel */}
      <div className="absolute inset-0">
        <AnimatePresence mode="sync">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0 ken-burns bg-cover bg-center"
              style={{
                backgroundImage: `url(${backgroundImages[currentImageIndex]})`,
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Vignette Overlay */}
        <div className="absolute inset-0 vignette" />

        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30" />

        {/* Film Grain Texture */}
        <div className="absolute inset-0 film-grain" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
          transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl"
        >
          {/* Main Title */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-white text-shadow leading-tight mb-6">
            We Read and Watch the World
          </h1>

          {/* Subtitle */}
          <p className="font-display text-lg sm:text-xl md:text-2xl italic text-white/90 text-shadow mb-4">
            An Aesthetic and Intellectual Exploration
          </p>

          {/* Author */}
          <p className="font-nav text-xs tracking-[0.3em] uppercase text-white/60 text-shadow">
            
          </p>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 1, delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-white/50"
          >
            <ChevronDown size={28} />
          </motion.div>
        </motion.div>

        {/* Image Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-8 right-8 flex gap-2"
        >
          {backgroundImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                index === currentImageIndex
                  ? "bg-white w-6"
                  : "bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </motion.div>
      </div>

      {/* Footer on Home Page */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 1, delay: 2 }}
        className="absolute bottom-4 left-0 right-0 text-center"
      >
        <p className="font-nav text-xs text-white/40">
          © {new Date().getFullYear()} Orpheus.com
        </p>
      </motion.div>
    </div>
  );
}
