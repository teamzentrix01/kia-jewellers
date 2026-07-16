"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Gem, RefreshCw, ShieldCheck, Sparkles, Truck } from "lucide-react";

const fallbackCategories = [
  ["Rings", "rings", "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=700&q=88"],
  ["Necklaces", "necklaces", "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=700&q=88"],
  ["Earrings", "earrings", "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=700&q=88"],
  ["Bangles", "bangles", "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=700&q=88"],
  ["Bridal", "bridal", "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=700&q=88"],
  ["Men's Edit", "mens-jewellery", "https://images.unsplash.com/photo-1619119069152-a2b331eb392a?w=700&q=88"],
];

const pieces = [
  ["Celestial Polki Necklace", "₹18,900", "necklaces", "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=700&q=90", "New"],
  ["Noor Emerald Drops", "₹7,450", "earrings", "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=700&q=90", "Bestseller"],
  ["Aarvi Diamond Band", "₹12,600", "rings", "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=700&q=90", "Loved"],
  ["Meher Gold Bangle", "₹9,800", "bangles", "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=700&q=90", "Limited"],
  ["Zoya Pearl Studs", "₹6,200", "earrings", "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=700&q=90", "Icon"],
  ["Ira Fine Chain", "₹11,400", "necklaces", "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=700&q=90", "Trending"],
];

const edits = [
  ["Modern heirlooms", "Pieces with main-character energy.", "rings", "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=900&q=88"],
  ["Colour theory", "Emeralds that do the talking.", "emeralds", "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=900&q=88"],
  ["Forever starts here", "A bridal edit, made personal.", "bridal", "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=900&q=88"],
];

export default function Home() {
  const [adminCategories, setAdminCategories] = useState([]);
  const [liveProducts, setLiveProducts] = useState([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/categories`)
      .then((response) => response.json())
      .then((data) => setAdminCategories(Array.isArray(data) ? data : []))
      .catch(() => setAdminCategories([]));
  }, []);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/products?limit=6`)
      .then(response => response.json())
      .then(data => setLiveProducts(Array.isArray(data) ? data : []))
      .catch(() => setLiveProducts([]));
  }, []);

  const categories = adminCategories.length
    ? adminCategories.slice(0, 6).map((category, index) => [category.name, category.slug, category.image_url || fallbackCategories[index % fallbackCategories.length][2]])
    : fallbackCategories;
  const displayPieces = liveProducts.length ? liveProducts.map((product, index) => [product.name, `₹${Number(product.discountedPrice || product.discounted_price || product.price || 0).toLocaleString('en-IN')}`, product.subCategory || product.sub_category || product.category || 'new-arrivals', product.images?.[0] || pieces[index % pieces.length][3], index === 0 ? 'New' : index === 1 ? 'Bestseller' : 'Loved']) : pieces;

  return (
    <div className="overflow-hidden bg-[#f7f3ec] text-[#211713]">
      <section className="mx-auto max-w-[1500px] px-3 pt-3 md:px-6 md:pt-5">
        <div className="heritage-hero relative h-[430px] overflow-hidden rounded-[1.4rem] bg-[#eadfce] md:h-[390px] md:rounded-[1.6rem]">
          <img src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1800&q=92" alt="KIA fine jewellery campaign" className="absolute inset-0 h-full w-full object-cover object-[62%_center]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(247,239,228,.98)_0%,rgba(247,239,228,.94)_34%,rgba(247,239,228,.38)_56%,rgba(33,23,19,.06)_100%)]" />
          <div className="absolute left-5 top-5 hidden rounded-full border border-[#cdbb9f] bg-[#fffaf2]/75 px-4 py-2 text-[8px] font-bold uppercase tracking-[.28em] text-[#705b4c] backdrop-blur-md sm:block">Crafted in India · Est. 2014</div>
          <div className="relative flex h-full items-end px-6 pb-9 pt-20 md:items-center md:px-12 md:pb-0 lg:px-16">
            <div className="max-w-[560px] text-[#2d211c]">
              <p className="section-kicker">The heirloom drop · 2026</p>
              <h1 className="font-serif text-[clamp(2.8rem,5vw,4.7rem)] font-light leading-[.84] tracking-[-.055em]">Indian artistry,<br /><em className="pl-[.45em] text-[#a77b43]">made modern.</em></h1>
              <p className="mt-5 max-w-sm text-[12px] leading-5 text-[#6e5b50]">Fine jewellery with a lighter point of view—crafted for celebrations, quiet luxuries and every iconic in-between.</p>
              <div className="mt-5 flex flex-wrap gap-2.5"><Link href="/category/new-arrivals" className="lux-button lux-button-gold">Explore collection <ArrowRight size={13} /></Link><Link href="/category/bridal" className="lux-button border border-[#9f8a73] bg-white/30 text-[#392b24] backdrop-blur-md hover:bg-white">Bridal atelier</Link></div>
            </div>
          </div>
          <Link href="/category/rings" aria-label="Explore the bezel edit" className="absolute bottom-5 right-5 hidden items-center gap-3 rounded-2xl border border-white/15 bg-[#211713]/40 p-2 pr-4 text-white shadow-lg backdrop-blur-xl transition hover:-translate-y-1 hover:bg-[#211713]/65 md:flex"><div className="h-12 w-12 overflow-hidden rounded-xl"><img src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200&q=85" alt="Diamond ring" className="h-full w-full object-cover" /></div><div><p className="text-[8px] uppercase tracking-[.24em] text-white/60">Trending now</p><p className="mt-1 font-serif text-sm">The bezel edit</p></div><ArrowUpRight size={15} className="ml-3 text-[#e4c992]" /></Link>
        </div>
      </section>

      <div className="mx-auto max-w-[1450px] px-5 md:px-10"><div className="grid grid-cols-2 border-b border-[#dcd1c3] py-4 text-center md:grid-cols-4">{["Hallmarked purity", "Insured shipping", "Lifetime care", "15-day exchange"].map((item) => <span key={item} className="border-[#dcd1c3] py-1 text-[8px] font-bold uppercase tracking-[.22em] text-[#796555] md:border-r md:last:border-r-0">{item}</span>)}</div></div>

      <section className="compact-section">
        <div className="section-heading-row"><div><p className="section-kicker">Find your piece</p><h2 className="section-title">Shop the <em>icons</em></h2></div><Link href="/category/new-arrivals" className="text-link">View all <ArrowRight size={12} /></Link></div>
        <div className="grid grid-cols-3 gap-2.5 md:grid-cols-6 md:gap-3">{categories.map(([name, slug, image]) => <Link key={slug} href={`/category/${slug}`} className="category-chip group"><div className="relative aspect-[1/1.05] overflow-hidden rounded-[1.2rem] bg-[#e8dfd4]"><img src={image} alt={name} className="h-full w-full object-cover transition duration-700 group-hover:scale-110 group-hover:rotate-1" /><div className="absolute inset-0 bg-gradient-to-t from-[#160e0b]/35 via-transparent to-transparent" /><span className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-white/85 text-[#211713] opacity-0 shadow-lg transition group-hover:opacity-100"><ArrowUpRight size={13} /></span></div><p className="mt-2.5 text-center font-serif text-sm md:text-base">{name}</p></Link>)}</div>
      </section>

      <section className="compact-section !pt-0"><div className="grid gap-3 md:grid-cols-12">{edits.map(([title, copy, slug, image], index) => <Link key={title} href={`/category/${slug}`} className={`${index === 1 ? "md:col-span-5" : index === 2 ? "md:col-span-3" : "md:col-span-4"} editorial-card group`}><img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover transition duration-1000 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" /><div className="relative mt-auto p-5 text-white md:p-6"><p className="text-[8px] font-bold uppercase tracking-[.28em] text-[#e4c992]">Edit 0{index + 1}</p><h3 className="mt-1.5 font-serif text-2xl italic">{title}</h3><p className="mt-1 text-[11px] text-white/65">{copy}</p></div></Link>)}</div></section>

      <section className="border-y border-[#ded4c8] bg-[#fcfaf6]"><div className="compact-section"><div className="section-heading-row"><div><p className="section-kicker">Currently obsessed</p><h2 className="section-title">Objects of <em>desire</em></h2></div><Link href="/category/bestsellers" className="text-link">Shop bestsellers <ArrowRight size={12} /></Link></div><div className="grid grid-cols-2 gap-x-3 gap-y-7 lg:grid-cols-4 lg:gap-4">{displayPieces.map(([name, price, slug, image, badge]) => <Link key={name} href={`/category/${slug}`} className="product-tile group"><div className="relative aspect-[4/4.5] overflow-hidden rounded-[1.35rem] bg-[#eee7dd]"><img src={image} alt={name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /><span className="absolute left-3 top-3 rounded-full border border-white/60 bg-white/75 px-2.5 py-1 text-[7px] font-bold uppercase tracking-[.2em] backdrop-blur-md">{badge}</span><span className="absolute bottom-3 right-3 grid h-9 w-9 translate-y-2 place-items-center rounded-full bg-[#211713] text-white opacity-0 shadow-xl transition group-hover:translate-y-0 group-hover:opacity-100"><ArrowUpRight size={14} /></span></div><div className="px-1 pt-3"><h3 className="font-serif text-base md:text-lg">{name}</h3><p className="mt-1 text-[11px] font-semibold text-[#7c6758]">{price}</p></div></Link>)}</div></div></section>

      <section className="compact-section"><div className="grid overflow-hidden rounded-[1.5rem] bg-[#241714] text-white md:grid-cols-[.9fr_1.1fr] md:rounded-[2rem]"><div className="flex items-center p-8 md:p-12 lg:p-16"><div><div className="mb-5 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#d9b877]/15 text-[#d9b877]"><Sparkles size={18} /></div><p className="section-kicker">Made slowly, loved forever</p><h2 className="font-serif text-4xl font-light leading-[.95] md:text-5xl">The beauty behind<br /><em className="text-[#d9b877]">every detail.</em></h2><p className="mt-5 max-w-md text-xs leading-6 text-white/55">From hand-selected stones to the final polish, every KIA piece passes through master artisans and generations of knowledge.</p><Link href="/category/signature" className="mt-7 inline-flex items-center gap-2 border-b border-[#d9b877] pb-1.5 text-[9px] font-bold uppercase tracking-[.22em]">Meet the craft <ArrowRight size={12} /></Link></div></div><div className="relative min-h-[320px] overflow-hidden md:min-h-[390px]"><img src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=1400&q=90" alt="Jewellery craftsmanship" className="h-full w-full object-cover transition duration-1000 hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-r from-[#241714]/35 to-transparent" /></div></div></section>

      <section className="mx-auto grid max-w-[1200px] grid-cols-2 gap-y-9 px-6 pb-16 pt-4 md:grid-cols-4 md:pb-20">{[[Gem, "Certified quality", "Purity you can trust"], [Truck, "Insured delivery", "Complimentary pan-India"], [RefreshCw, "Easy exchange", "Simple 15-day exchange"], [ShieldCheck, "Lifetime care", "Cleaning & repair support"]].map(([Icon, title, text]) => <div key={title} className="text-center"><div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-2xl border border-[#d9cdbd] bg-white/50 shadow-[0_8px_24px_rgba(79,54,38,.06)]"><Icon className="text-[#9a7136]" size={17} /></div><h3 className="text-[9px] font-bold uppercase tracking-[.2em]">{title}</h3><p className="mt-1.5 text-[10px] text-[#8a7566]">{text}</p></div>)}</section>
    </div>
  );
}
