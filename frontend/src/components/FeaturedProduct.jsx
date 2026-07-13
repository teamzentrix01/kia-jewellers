"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import LoginModal from "@/components/LoginModal";
import { ShoppingBag, Check } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function FeaturedProducts({ category = "", limit = 8 }) {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(null);
  const [cartAdded, setCartAdded] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingId, setPendingId] = useState(null);

  useEffect(() => {
    let url = `${BASE_URL}/products?limit=${limit}`;
    if (category) url += `&category=${category}`;
    fetch(url)
      .then(r => r.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category, limit]);

  const doAddToCart = async (productId) => {
    setCartLoading(productId);
    const result = await addToCart(productId);
    setCartLoading(null);
    if (result.success) { setCartAdded(productId); setTimeout(() => setCartAdded(null), 2000); }
  };

  const handleAddToCart = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) { setPendingId(productId); setShowLoginModal(true); return; }
    doAddToCart(productId);
  };

  if (loading) return (
    <section className="w-full bg-[#0e0c0b]">
      <div className="flex items-center gap-4 px-6 py-4">
        <div className="h-px flex-1 bg-white/10" />
        <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
        <div className="h-px flex-1 bg-white/10" />
      </div>
      <div className="grid grid-cols-4 lg:grid-cols-8 gap-0">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-[2/3] bg-white/5 animate-pulse border-r border-white/5 last:border-r-0" />
        ))}
      </div>
    </section>
  );

  if (products.length === 0) return null;

  return (
    <>
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => { setShowLoginModal(false); setPendingId(null); }}
        onSuccess={() => { if (pendingId) { doAddToCart(pendingId); setPendingId(null); } }}
        message="Login first to add the product in cart!"
      />

      <section className="w-full bg-[#0e0c0b]">
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-4">
          <div className="h-px flex-1 bg-white/10" />
          <h2
            className="text-white/80 text-base tracking-widest uppercase font-light"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}
          >
            Shop the Look
          </h2>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="grid grid-cols-4 lg:grid-cols-8 gap-0">
          {products.slice(0, 8).map((product) => {
            const img = Array.isArray(product.images) && product.images.length > 0
              ? product.images[0]
              : product.image_url || '/placeholder.jpg';
            const price    = parseFloat(product.discounted_price || product.price || 0);
            const original = parseFloat(product.original_price || 0);
            const isAdded   = cartAdded === product.id;
            const isLoading = cartLoading === product.id;

            return (
              <div key={product.id} className="group block border-r border-white/5 last:border-r-0 relative">
                <Link href={`/product/${product.id}`}>
                  <div className="aspect-[2/3] overflow-hidden bg-gray-900">
                    <img
                      src={img}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>

                  <div className="px-1.5 py-1.5 bg-[#0e0c0b]">
                    <h4 className="text-[10px] font-medium text-white/70 truncate leading-tight">
                      {product.name}
                    </h4>
                    <div className="flex items-center gap-1 mt-0.5 mb-1.5">
                      <span className="text-[10px] font-bold text-white">₹{price.toLocaleString()}</span>
                      {original > price && (
                        <span className="text-[9px] text-white/30 line-through">₹{original.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Quick Add Button */}
                <button
                  onClick={e => handleAddToCart(e, product.id)}
                  disabled={isLoading || !product.in_stock}
                  className={`w-full py-1 text-[8px] font-bold uppercase tracking-widest flex items-center justify-center gap-1 transition duration-300 ${
                    isAdded ? 'bg-green-600 text-white' :
                    !product.in_stock ? 'bg-gray-600 text-gray-400 cursor-not-allowed' :
                    'bg-[#bda48c] text-white group-hover:bg-white group-hover:text-black'
                  }`}
                >
                  {isAdded ? <><Check size={10}/> Added</> :
                   isLoading ? 'Adding...' :
                   !product.in_stock ? 'Out of Stock' :
                   <><ShoppingBag size={10}/> Add to Cart</>}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}