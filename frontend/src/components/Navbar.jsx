"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useCart } from "@/context/CartContext";

const MENUS = {
  JEWELLERY: {
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=700&q=90",
    caption: "The Signature Edit",
    columns: [
      { title: "BY TYPE", links: [["Rings","rings"],["Earrings","earrings"],["Necklaces","necklaces"],["Bangles","bangles"],["Bracelets","bracelets"]] },
      { title: "TRADITIONAL", links: [["Kundan","kundan"],["Polki","polki"],["Temple Jewellery","temple-jewellery"],["Jhumkas","jhumkas"]] },
      { title: "MORE TO LOVE", links: [["Pendants","pendants"],["Anklets","anklets"],["Maang Tikka","maang-tikka"],["Men's Jewellery","mens-jewellery"]] }
    ]
  },
  COLLECTIONS: {
    image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=700&q=90",
    caption: "Made for Moments",
    columns: [
      { title: "THE EDITS", links: [["New Arrivals","new-arrivals"],["Bestsellers","bestsellers"],["Signature","signature"],["Everyday Fine","everyday-fine"]] },
      { title: "BRIDAL", links: [["Bridal Sets","bridal"],["Wedding Rings","wedding-rings"],["Heritage Polki","polki"],["Temple Bride","temple-jewellery"]] },
      { title: "SHOP BY STONE", links: [["Diamonds","diamonds"],["Emeralds","emeralds"],["Pearls","pearls"],["Ruby","ruby"]] }
    ]
  },
  GIFTING: {
    image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=700&q=90",
    caption: "Gifts to Remember",
    columns: [
      { title: "BY OCCASION", links: [["Anniversary","anniversary"],["Birthday","birthday"],["Wedding Gifts","wedding-gifts"],["Festive Gifts","festive-gifts"]] },
      { title: "FOR SOMEONE", links: [["For Her","for-her"],["For Him","for-him"],["For Mother","for-mother"],["For the Bride","bridal"]] },
      { title: "BY PRICE", links: [["Under ₹5,000","under-5000"],["₹5,000–₹15,000","5000-15000"],["Luxury Gifts","luxury-gifts"],["Gift Cards","gift-cards"]] }
    ]
  }
};

export default function Navbar(){
  const [active,setActive]=useState(null),[mobile,setMobile]=useState(false),[search,setSearch]=useState(false),[query,setQuery]=useState(""),[user,setUser]=useState(null),[storeCategories,setStoreCategories]=useState([]);
  const router=useRouter(); const {totalItems}=useCart();
  useEffect(()=>{const sync=()=>{try{setUser(JSON.parse(localStorage.getItem("user")))}catch{setUser(null)}};sync();window.addEventListener("userLoggedIn",sync);return()=>window.removeEventListener("userLoggedIn",sync)},[]);
  useEffect(()=>{fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/categories`).then(r=>r.json()).then(data=>setStoreCategories(Array.isArray(data)?data:[])).catch(()=>setStoreCategories([]))},[]);
  const menuColumns=tab=>{
    if(!storeCategories.length)return MENUS[tab].columns;
    const group=tab==="JEWELLERY"?"Fine Jewellery":tab==="COLLECTIONS"?"Bridal":"Gifting";
    const links=storeCategories.filter(cat=>cat.group_label===group).map(cat=>[cat.name,cat.slug]);
    const chunks=[]; for(let i=0;i<links.length;i+=5)chunks.push({title:i===0?group.toUpperCase():"MORE COLLECTIONS",links:links.slice(i,i+5)});
    return chunks.length?chunks:MENUS[tab].columns;
  };
  const submit=e=>{e.preventDefault();if(query.trim())router.push(`/category/new-arrivals?search=${encodeURIComponent(query.trim())}`);setSearch(false)};
  return <><header className="fixed inset-x-0 top-0 z-50" onMouseLeave={()=>setActive(null)}>
    <div className="bg-[#201512] px-4 py-2 text-center text-[8px] font-semibold uppercase tracking-[.28em] text-[#dcc293]">Complimentary insured shipping across India</div>
    <nav className="border-b border-[#ded5ca] bg-[#fbf8f2]/98 backdrop-blur-xl"><div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 md:px-10">
      <button onClick={()=>setMobile(true)} className="lg:hidden"><Menu size={21}/></button>
      <Link href="/" className="text-center"><span className="block font-serif text-2xl tracking-[.22em]">KIA</span><span className="block text-[7px] font-semibold tracking-[.48em] text-[#a67c3d]">JEWELLERS</span></Link>
      <div className="hidden h-full items-center gap-11 lg:flex">{Object.keys(MENUS).map(tab=><button key={tab} onMouseEnter={()=>setActive(tab)} className={`relative flex h-full items-center gap-1 text-[10px] font-bold tracking-[.2em] ${active===tab?"text-[#a67c3d]":""}`}>{tab}<ChevronDown size={11}/>{active===tab&&<motion.span layoutId="navline" className="absolute inset-x-0 bottom-0 h-[2px] bg-[#a67c3d]"/>}</button>)}</div>
      <div className="flex items-center gap-4"><button onClick={()=>setSearch(!search)}><Search size={18}/></button><Link href={user?.role==="admin"?"/admin":user?"/dashboard":"/login"}><User size={18}/></Link><button onClick={()=>router.push(user?"/dashboard?tab=Wishlist":"/login")} className="hidden sm:block"><Heart size={18}/></button><Link href="/cart" className="relative"><ShoppingBag size={18}/>{totalItems>0&&<span className="absolute -right-2 -top-2 rounded-full bg-[#a67c3d] px-1 text-[8px] text-white">{totalItems}</span>}</Link></div>
    </div>{search&&<form onSubmit={submit} className="border-t px-5 py-4"><div className="mx-auto flex max-w-xl border-b"><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search rings, earrings, bridal..." className="w-full bg-transparent py-3 text-sm outline-none"/><button className="text-[9px] font-bold tracking-widest">SEARCH</button></div></form>}</nav>
    <AnimatePresence>{active&&<motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} onMouseEnter={()=>setActive(active)} className="hidden overflow-hidden border-b bg-[#fffdf9] shadow-2xl lg:block"><div className="mx-auto grid max-w-[1440px] grid-cols-[260px_repeat(3,1fr)] gap-12 px-10 py-12"><Link href={`/category/${menuColumns(active)[0].links[0][1]}`} className="group relative h-[300px] overflow-hidden rounded-t-full"><img src={MENUS[active].image} alt={MENUS[active].caption} className="h-full w-full object-cover transition duration-700 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent"/><div className="absolute bottom-0 p-6 text-white"><p className="font-serif text-2xl italic">{MENUS[active].caption}</p><span className="mt-2 block text-[8px] font-bold tracking-[.25em]">DISCOVER NOW →</span></div></Link>{menuColumns(active).map(col=><div key={col.title}><h3 className="mb-7 border-l-2 border-[#b48a4b] pl-4 text-[10px] font-black tracking-[.24em]">{col.title}</h3><div className="space-y-4">{col.links.map(([label,slug])=><Link key={`${label}-${slug}`} href={`/category/${slug}`} className="block text-[11px] font-semibold uppercase tracking-[.08em] text-[#76685f] transition hover:translate-x-1 hover:text-[#a67c3d]">{label}</Link>)}</div></div>)}</div></motion.div>}</AnimatePresence>
  </header>
  {mobile&&<div className="fixed inset-0 z-[100] overflow-y-auto bg-[#fbf8f2] p-7 lg:hidden"><div className="flex justify-between"><span className="font-serif text-xl tracking-[.2em]">KIA JEWELLERS</span><button onClick={()=>setMobile(false)}><X/></button></div>{Object.keys(MENUS).map(tab=><div key={tab} className="mt-9"><p className="text-[9px] font-bold tracking-[.3em] text-[#a67c3d]">{tab}</p>{menuColumns(tab).flatMap(c=>c.links).map(([label,slug])=><Link key={`${tab}-${label}`} onClick={()=>setMobile(false)} href={`/category/${slug}`} className="block border-b py-3 font-serif text-xl">{label}</Link>)}</div>)}</div>}
  </>;
}
