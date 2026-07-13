"use client";

import { motion } from "framer-motion";

export default function EditorialSection() {
  const stats = [
    { num: "12+", label: "Years of craft" },
    { num: "47", label: "Artisan partners" },
    { num: "100%", label: "Sustainably sourced" },
  ];

  return (
    <section className="bg-[#110f0e] py-24 px-8 md:px-24 overflow-hidden relative">
      {/* 1. Large Decorative "M" in Background */}
      <div className="absolute top-10 left-10 text-[25vw] font-serif leading-none text-white/[0.03] select-none pointer-events-none">
        M
      </div>

      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
        
        {/* 2. Text Content Area */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#d4b383] mb-6 block">
            Our Philosophy
          </span>
          
          <h2 className="text-5xl md:text-7xl font-serif text-white leading-[1.1] mb-8 tracking-tighter">
            Fashion as a form <br />
            of <span className="italic opacity-80">self-expression</span>
          </h2>
          
          <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-lg mb-12 font-light">
            At Maison, we believe every garment tells a story. Each piece is designed with intention — 
            where <span className="text-white/80">sustainable craftsmanship</span> meets timeless aesthetics. 
            We work only with ateliers who share our commitment to quality and ethical production.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-8 pt-10 border-t border-white/10">
            {stats.map((stat, i) => (
              <div key={i}>
                <div className="text-2xl md:text-3xl font-serif text-[#d4b383] mb-1">
                  {stat.num}
                </div>
                <div className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-bold leading-tight">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 3. Editorial Image Grid (Asymmetrical) */}
        <div className="grid grid-cols-2 gap-4 h-[500px]">
          {/* Main Tall Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="row-span-2 h-full overflow-hidden"
          >
            <img 
              src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80" 
              className="w-full h-full object-cover transition-transform duration-1000 hover:scale-110"
              alt="Editorial Main"
            />
          </motion.div>

          {/* Two Smaller Images */}
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="h-[240px] overflow-hidden"
          >
            <img 
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80" 
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              alt="Detail 1"
            />
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.2 }}
             className="h-[240px] overflow-hidden"
          >
            <img 
              src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&q=80" 
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              alt="Detail 2"
            />
          </motion.div>
        </div>

      </div>
    </section>
  );
}