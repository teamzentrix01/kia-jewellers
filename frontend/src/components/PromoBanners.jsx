"use client";

import { useEffect, useState } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Fallback images per group in case category has no image
const FALLBACKS = {
  Men:   "https://i.pinimg.com/736x/43/90/ff/4390ffa4d38e7939b0b08caabb5d25fd.jpg",
  Women: "https://i.pinimg.com/1200x/8b/6f/d3/8b6fd3f127d05ffe961fcbb0f56faccf.jpg",
  Kids:  "https://i.pinimg.com/736x/4f/45/95/4f45959163bfe0b52a344043c3190c13.jpg",
};

const STORE_LINKS = {
  Men:   "/men-store",
  Women: "/women-store",
  Kids:  "/kids-store",
};

const SUBTITLES = {
  Men:   "His Edit",
  Women: "Her Edit",
  Kids:  "Little Ones",
};

export default function PromoBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/categories`)
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return;

        // Pick one category per group (first one = best/featured)
        const grouped = {};
        data.forEach(cat => {
          if (!grouped[cat.group_label]) grouped[cat.group_label] = cat;
        });

        const order = ['Women', 'Men', 'Kids'];
        const result = order
          .filter(g => grouped[g])
          .map(g => {
            const cat = grouped[g];
            return {
              title: cat.name,
              subTitle: SUBTITLES[g] || g,
              img: cat.image_url || FALLBACKS[g],
              link: `${STORE_LINKS[g]}?subcategory=${cat.slug}`,
              storeLink: STORE_LINKS[g],
              buttonText: `Shop ${cat.name}`,
              group: g,
            };
          });

        setBanners(result);
      })
      .catch(() => setBanners([]))
      .finally(() => setLoading(false));
  }, []);

  // ── LOADING SKELETON ──────────────────────────────────────────────────────
  if (loading) return (
    <section className="w-full bg-[#f7f5f2] py-10 px-4 md:px-10">
      <div className="flex items-center gap-4 mb-8 max-w-7xl mx-auto">
        <div className="h-px flex-1 bg-[#1a1a1a]/10" />
        <div className="h-3 w-20 bg-[#1a1a1a]/10 rounded animate-pulse" />
        <div className="h-px flex-1 bg-[#1a1a1a]/10" />
      </div>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-0 border border-[#e0ddd9]">
        <div className="md:col-span-5 h-[500px] bg-[#e8e4df] animate-pulse" />
        <div className="md:col-span-7 flex flex-col border-l border-[#e0ddd9]">
          <div className="h-[250px] bg-[#ede9e4] animate-pulse border-b border-[#e0ddd9]" />
          <div className="h-[250px] bg-[#e0dcd7] animate-pulse" />
        </div>
      </div>
    </section>
  );

  if (banners.length < 3) return null;

  const [b1, b2, b3] = banners;

  return (
    <section className="w-full bg-[#f7f5f2] py-10 px-4 md:px-10">

      {/* Section Label */}
      <div className="flex items-center gap-4 mb-8 max-w-7xl mx-auto">
        <div className="h-px flex-1 bg-[#1a1a1a]/10" />
        <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#1a1a1a]/40">
          Featured
        </span>
        <div className="h-px flex-1 bg-[#1a1a1a]/10" />
      </div>

      {/* Asymmetric Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-0 border border-[#e0ddd9]">

        {/* ── Card 1 — Large Left ── */}
        <a href={b1.storeLink}
          className="md:col-span-5 relative group overflow-hidden h-[320px] md:h-[500px] block">
          <img src={b1.img} alt={b1.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-white/50 mb-1">
              {b1.subTitle}
            </p>
            <h3 className="text-2xl md:text-3xl font-serif italic text-white leading-tight mb-3">
              {b1.title}
            </h3>
            <span className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] font-bold text-white border-b border-white/40 pb-0.5 group-hover:border-white transition-all duration-300">
              {b1.buttonText}
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </span>
          </div>
        </a>

        {/* ── Right Column ── */}
        <div className="md:col-span-7 flex flex-col border-l border-[#e0ddd9]">

          {/* Card 2 — Top Right (horizontal) */}
          <a href={b2.storeLink}
            className="relative group overflow-hidden flex flex-row h-[240px] md:h-[250px] border-b border-[#e0ddd9]">
            {/* Image right */}
            <div className="w-[45%] h-full overflow-hidden flex-shrink-0 order-2">
              <img src={b2.img} alt={b2.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            {/* Text left */}
            <div className="flex-1 bg-[#f7f5f2] flex flex-col justify-between p-6 md:p-8 order-1 relative overflow-hidden">
              <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#1a1a1a]/40">
                {b2.subTitle}
              </p>
              <div>
                <h3 className="text-xl md:text-2xl font-serif italic text-[#1a1a1a] leading-tight mb-4">
                  {b2.title}
                </h3>
                <span className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] font-bold text-[#1a1a1a] border-b border-[#1a1a1a]/30 pb-0.5 group-hover:border-[#1a1a1a] transition-all duration-300">
                  {b2.buttonText}
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
              </div>
              <span className="text-[60px] font-serif text-[#1a1a1a]/5 leading-none select-none absolute bottom-2 right-4">
                02
              </span>
            </div>
          </a>

          {/* Card 3 — Bottom Right */}
          <a href={b3.storeLink}
            className="relative group overflow-hidden h-[240px] md:h-[250px] flex flex-row">
            {/* Text right */}
            <div className="flex-1 bg-[#1a1a1a] flex flex-col justify-between p-6 md:p-8 order-2 relative overflow-hidden">
              <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-white/30">
                {b3.subTitle}
              </p>
              <div>
                <h3 className="text-xl md:text-2xl font-serif italic text-white leading-tight mb-4">
                  {b3.title}
                </h3>
                <span className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] font-bold text-white border-b border-white/30 pb-0.5 group-hover:border-white transition-all duration-300">
                  {b3.buttonText}
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
              </div>
              <span className="text-[60px] font-serif text-white/5 leading-none select-none absolute bottom-2 right-4">
                03
              </span>
            </div>
            {/* Image left */}
            <div className="w-[45%] h-full overflow-hidden flex-shrink-0 order-1">
              <img src={b3.img} alt={b3.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
          </a>

        </div>
      </div>
    </section>
  );
}