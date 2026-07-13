"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    id: 1,
    label: "SIGNATURE",
    title: "Where Fabric",
    titleBreak: "Meets",
    accent: "Story",
    sub: "THE HERITAGE COLLECTION",
    img: "https://images.unsplash.com/photo-1549062572-544a64fb0c56?w=1600&q=80",
    accentColor: "#b85c38", // Rust Orange
  },
  {
    id: 2,
    label: "EXCLUSIVE",
    title: "Crafted for",
    titleBreak: "the Bold",
    accent: "Few",
    sub: "LIMITED EDITION PIECES",
    img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80",
    accentColor: "#6b7d5d", // Olive Green
  },
  {
    id: 3,
    label: "NEW SEASON",
    title: "The Art of",
    titleBreak: "Effortless",
    accent: "Elegance",
    sub: "AUTUMN / WINTER 2026",
    img: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1600&q=80",
    accentColor: "#a68b6d", // Muted Gold
  }
];

const tickerItems = ["New AW25 Collection", "Sustainably Sourced", "Returns Within 30 Days", "As Seen in Vogue & Monocle", "Free Shipping Over £150"];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  // Constants based on your screenshot
  const BG_COLOR = "#110f0e";
  const BUTTON_GOLD = "#d4b383";

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const s = slides[current];

  return (
    <section className="relative h-[85vh] min-h-[550px] w-full flex flex-col overflow-hidden" style={{ backgroundColor: BG_COLOR }}>
      
      {/* 1. Main Content Area */}
      <div className="flex-1 relative flex items-center">
        
        {/* Right Side Image Layer */}
        <div className="absolute right-0 top-0 w-full md:w-[55%] h-full z-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="w-full h-full relative"
            >
              <img 
                src={s.img} 
                className="w-full h-full object-cover object-center" 
                alt="hero"
              />
              {/* Perfect Gradient Fade into Dark Background */}
              <div 
                className="absolute inset-0 bg-gradient-to-r"
                style={{ backgroundImage: `linear-gradient(to right, ${BG_COLOR} 18%, transparent 65%)` }}
              ></div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Left Side Content */}
        <div className="container mx-auto px-8 md:px-24 z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: -25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 25 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl"
            >
              {/* Top Label */}
              <div className="flex items-center gap-3 mb-6 md:mb-8">
                <div className="w-6 h-[1px] bg-gray-600"></div>
                <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-gray-500">
                  {s.label}
                </span>
              </div>

              {/* Main Title (Serif) */}
              <h1 className="text-5xl md:text-[88px] font-serif leading-[0.88] text-white tracking-tighter">
                {s.title} <br /> {s.titleBreak}
              </h1>

              {/* Italic Accent Word */}
              <div className="mt-3 mb-12 md:mb-16">
                <span 
                  className="text-6xl md:text-[95px] font-serif italic lowercase tracking-tight"
                  style={{ color: s.accentColor }}
                >
                  {s.accent}
                </span>
              </div>

              {/* Sub-text */}
              <p className="text-[9px] font-bold tracking-[0.45em] text-gray-500 mb-10 uppercase">
                {s.sub}
              </p>

              {/* Buttons Pair */}
              <div className="flex gap-4">
                <button 
                  className="px-12 py-4 text-[10px] font-bold uppercase tracking-[0.25em] transition-all hover:scale-105 active:scale-95"
                  style={{ backgroundColor: BUTTON_GOLD, color: "#110f0e" }}
                >
                  Explore Now
                </button>
                <button 
                  className="border border-white/20 px-12 py-4 text-[10px] font-bold uppercase tracking-[0.25em] text-white hover:bg-white/5 transition-all"
                >
                  View Lookbook
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Indicators (Custom Dots) */}
        <div className="absolute left-8 md:left-24 bottom-10 flex gap-2.5 z-20">
          {slides.map((_, i) => (
            <div 
              key={i}
              onClick={() => setCurrent(i)}
              className="h-[1.5px] cursor-pointer transition-all duration-700"
              style={{ 
                width: current === i ? "40px" : "12px", 
                backgroundColor: current === i ? BUTTON_GOLD : "rgba(255,255,255,0.12)" 
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* 2. Seamless Bottom Ticker */}
      <div className="w-full py-5 border-t border-white/5 bg-black/20 backdrop-blur-sm overflow-hidden">
        <motion.div
          className="flex whitespace-nowrap items-center"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 35 }}
        >
          {[...tickerItems, ...tickerItems].map((item, index) => (
            <div key={index} className="flex items-center">
              <span className="text-[9.5px] font-bold uppercase tracking-[0.35em] px-14 text-gray-500/80">
                {item}
              </span>
              <span className="text-gray-800 text-[6px]">●</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}