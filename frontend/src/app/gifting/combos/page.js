"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, Gift, Loader2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import LoginModal from "@/components/LoginModal";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function CombosPage() {
  const { addToCart } = useCart();
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingId, setAddingId] = useState(null);
  const [addedId, setAddedId] = useState(null);
  const [pendingId, setPendingId] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/combos`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to load combos");
        setCombos(Array.isArray(data) ? data : []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const addCombo = async (id) => {
    setAddingId(id);
    const result = await addToCart(id);
    setAddingId(null);
    if (result.success) {
      setAddedId(id);
      window.setTimeout(() => setAddedId(null), 2000);
    } else setError(result.error || "Unable to add this combo to your bag.");
  };

  const requestAdd = (id) => {
    if (!localStorage.getItem("token")) {
      setPendingId(id);
      setShowLogin(true);
      return;
    }
    addCombo(id);
  };

  return (
    <main className="min-h-screen bg-[#faf8f4]">
      <LoginModal isOpen={showLogin} onClose={() => { setShowLogin(false); setPendingId(null); }}
        onSuccess={() => { if (pendingId) addCombo(pendingId); setPendingId(null); }}
        message="Please sign in to add this combo to your cart." />

      <header className="border-b border-stone-200 bg-[#201512] px-5 py-9 text-white md:px-12">
        <div className="mx-auto max-w-[1320px]">
          <nav className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/50">
            <Link href="/">Home</Link><ChevronRight size={11} /><span>Gifting</span><ChevronRight size={11} /><span className="text-white">Combos</span>
          </nav>
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[.35em] text-[#dcc293]">Curated together</p>
              <h1 className="font-serif text-3xl font-normal md:text-5xl">Jewellery Gift Combos</h1>
            </div>
            <Gift className="hidden text-[#dcc293] md:block" size={42} strokeWidth={1.2} />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1320px] px-5 py-8 md:px-12 md:py-12">
        {error && <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
        {loading && <div className="flex min-h-[320px] items-center justify-center"><Loader2 className="animate-spin text-stone-400" size={34} /></div>}
        {!loading && combos.length === 0 && (
          <div className="flex min-h-[320px] flex-col items-center justify-center border-y border-stone-200 text-center">
            <Gift size={32} strokeWidth={1.3} className="mb-4 text-stone-400" />
            <h2 className="font-serif text-2xl">New combinations are being curated</h2>
            <Link href="/category/gifting" className="mt-5 text-xs font-black uppercase tracking-widest text-amber-800">Explore gifting</Link>
          </div>
        )}
        <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {combos.map((combo) => {
            const price = Number(combo.discountedPrice || combo.price || 0);
            const original = Number(combo.originalPrice || 0);
            const image = combo.images?.[0] || combo.comboItems?.[0]?.images?.[0] || "/placeholder.jpg";
            const available = combo.inStock !== false && combo.comboItems.every((item) => item.inStock !== false);
            return (
              <article key={combo.id} className="group min-w-0">
                <Link href={`/product/${combo.id}`} className="relative block aspect-[4/5] overflow-hidden bg-stone-100">
                  <img src={image} alt={combo.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                  <span className="absolute left-3 top-3 bg-white px-2 py-1 text-[9px] font-black uppercase tracking-widest text-stone-900">{combo.comboItems.length} piece combo</span>
                </Link>
                <div className="pt-4">
                  <Link href={`/product/${combo.id}`}><h2 className="truncate font-serif text-xl text-stone-900">{combo.name}</h2></Link>
                  <p className="mt-1 truncate text-xs text-stone-500">{combo.comboItems.map((item) => `${item.name}${item.quantity > 1 ? ` x${item.quantity}` : ""}`).join(" + ")}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-lg font-black">₹{price.toLocaleString("en-IN")}</span>
                    {original > price && <span className="text-sm text-stone-400 line-through">₹{original.toLocaleString("en-IN")}</span>}
                  </div>
                  <button type="button" disabled={!available || addingId === combo.id} onClick={() => requestAdd(combo.id)}
                    className="mt-4 flex h-11 w-full items-center justify-center gap-2 bg-stone-950 px-4 text-xs font-black uppercase tracking-widest text-white transition hover:bg-amber-800 disabled:bg-stone-300 disabled:text-stone-500">
                    {addedId === combo.id ? <><Check size={16} />Added to bag</> : addingId === combo.id ? <><Loader2 size={16} className="animate-spin" />Adding</> : !available ? "Currently unavailable" : <><ShoppingBag size={16} />Add combo to bag</>}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
