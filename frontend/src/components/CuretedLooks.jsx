"use client";
import React from 'react';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

const looks = [
  {
    id: 1,
    imageUrl: 'https://i.pinimg.com/736x/64/6a/1e/646a1edf3ac1f7c1abab2bb6eb17f604.jpg',
    size: 'small',
    category: 'kids',
  },
  {
    id: 2,
    imageUrl: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    size: 'medium',
    category: 'men',
  },
  {
    id: 3,
    imageUrl: 'https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    size: 'large',
    category: 'women',
  },
  {
    id: 4,
    imageUrl: 'https://images.pexels.com/photos/2043590/pexels-photo-2043590.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    size: 'medium',
    category: 'women',
  },
  {
    id: 5,
    imageUrl: 'https://i.pinimg.com/736x/80/0a/31/800a3174cfff335726ed657d312cdadb.jpg',
    size: 'small',
    category: 'kids',
  },
];

const CuratedLooks = () => {
  const getAspectRatio = (size) => {
    switch (size) {
      case 'small': return 'aspect-[3/4]';
      case 'medium': return 'aspect-[3/4.5]';
      case 'large': return 'aspect-[3/5]';
      default: return 'aspect-[3/4]';
    }
  };

  const getWidth = (size) => {
    switch (size) {
      case 'small': return 'w-[12%]';
      case 'medium': return 'w-[17%]';
      case 'large': return 'w-[22%]';
      default: return 'w-[15%]';
    }
  };

  const getMt = (size) => {
    switch (size) {
      case 'small': return 'mt-[8%]';
      case 'medium': return 'mt-[4%]';
      case 'large': return 'mt-0';
      default: return 'mt-0';
    }
  };

  return (
    <section className="bg-[#f9f9f9] py-12 px-4 md:px-10">
      <div className="max-w-[1920px] mx-auto">
        <h2 className="text-center text-[12px] md:text-[13px] font-bold tracking-[0.2em] uppercase text-[#1a1a1a] mb-10 font-sans">
          Curated Looks For You
        </h2>

        {/* --- DESKTOP VIEW --- */}
        <div className="hidden md:flex items-start justify-center gap-3">
          {looks.map((look, index) => (
            <div
              key={look.id}
              className={`relative flex-shrink-0 group overflow-hidden ${getWidth(look.size)} ${getAspectRatio(look.size)} ${getMt(look.size)}`}
            >
              <img
                src={look.imageUrl}
                alt={`Curated Look ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-105"
              />

              {/* SHOP ALL BUTTON */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full flex justify-center">
                <Link
                  href={`/${(look.category || 'women').toLowerCase()}-store`}
                  className="flex items-center gap-2 bg-white px-4 py-2 shadow-md transition-all duration-300 hover:bg-black hover:text-white"
                >
                  <ShoppingBag className="w-3 h-3 text-[#1a1a1a] group-hover:text-white transition-colors duration-300" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#1a1a1a] hover:text-white transition-colors duration-300 whitespace-nowrap">
                    Shop All
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* --- MOBILE VIEW --- */}
        <div className="md:hidden flex overflow-x-auto gap-3 pb-4 snap-x snap-mandatory px-4 -mx-4">
          {looks.map((look, index) => (
            <div key={look.id} className="relative flex-shrink-0 w-[65vw] aspect-[3/4] snap-center overflow-hidden">
              <img
                src={look.imageUrl}
                alt={`Curated Look ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                <Link
                  href={`/${(look.category || 'women').toLowerCase()}-store`}
                  className="flex items-center gap-1.5 bg-white px-4 py-2 shadow-md"
                >
                  <ShoppingBag className="w-3 h-3 text-black" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-black whitespace-nowrap">
                    Shop All
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CuratedLooks;