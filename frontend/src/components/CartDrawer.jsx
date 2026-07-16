"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartDrawer() {
  const { items, cartOpen, setCartOpen, totalItems, totalPrice, updateQuantity, removeItem } = useCart();

  return (
    <AnimatePresence>
      {cartOpen && (
        <div className="fixed inset-0 z-[300]">
          <motion.button aria-label="Close cart" className="absolute inset-0 bg-[#241914]/45 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCartOpen(false)} />
          <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 260 }} className="absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col bg-[#fffdf9] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e5dacd] px-5 py-5">
              <div><p className="section-kicker">Your selection</p><h2 className="font-serif text-2xl">Shopping bag <span className="text-sm text-[#9a8779]">({totalItems})</span></h2></div>
              <button onClick={() => setCartOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-[#ddd0c0]"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {!items.length ? <div className="grid h-full place-items-center text-center"><div><ShoppingBag className="mx-auto mb-4 text-[#b49874]" size={34}/><h3 className="font-serif text-2xl">Your bag is waiting</h3><p className="mt-2 text-xs text-[#88766b]">Discover a piece worth keeping.</p><Link href="/category/new-arrivals" onClick={() => setCartOpen(false)} className="lux-button lux-button-gold mt-6">Explore jewellery</Link></div></div> : <div className="space-y-4">{items.map(({ cartId, quantity, product }) => <div key={cartId} className="grid grid-cols-[82px_1fr] gap-3 border-b border-[#ece3d8] pb-4"><Link href={`/product/${product.id}`} onClick={() => setCartOpen(false)} className="h-24 overflow-hidden rounded-xl bg-[#eee7de]"><img src={product.images?.[0] || "/placeholder.jpg"} alt={product.name} className="h-full w-full object-cover"/></Link><div className="min-w-0"><div className="flex justify-between gap-2"><div><Link href={`/product/${product.id}`} onClick={() => setCartOpen(false)} className="font-serif text-base line-clamp-2">{product.name}</Link><p className="mt-1 text-[9px] uppercase tracking-widest text-[#998577]">{product.category}</p></div><button onClick={() => removeItem(cartId)} aria-label="Remove item" className="text-[#a7978d] hover:text-[#9e554e]"><Trash2 size={14}/></button></div><div className="mt-3 flex items-center justify-between"><div className="flex items-center rounded-full border border-[#ddd0c0]"><button className="p-1.5" onClick={() => quantity > 1 ? updateQuantity(cartId, quantity - 1) : removeItem(cartId)}><Minus size={12}/></button><span className="w-7 text-center text-xs">{quantity}</span><button className="p-1.5" onClick={() => updateQuantity(cartId, quantity + 1)}><Plus size={12}/></button></div><p className="text-sm font-semibold">₹{(product.discountedPrice * quantity).toLocaleString("en-IN")}</p></div></div></div>)}</div>}
            </div>
            {!!items.length && <div className="border-t border-[#e5dacd] bg-[#faf5ed] p-5"><div className="mb-1 flex justify-between font-serif text-xl"><span>Subtotal</span><span>₹{totalPrice.toLocaleString("en-IN")}</span></div><p className="mb-4 text-[10px] text-[#88766b]">Shipping and taxes calculated at checkout.</p><Link href="/checkout" onClick={() => setCartOpen(false)} className="flex w-full justify-center rounded-full bg-[#3d2d25] py-3.5 text-[10px] font-bold uppercase tracking-[.24em] text-white hover:bg-[#a77b43]">Checkout securely</Link><Link href="/cart" onClick={() => setCartOpen(false)} className="mt-3 block text-center text-[9px] font-bold uppercase tracking-widest text-[#766156]">View full bag</Link></div>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
