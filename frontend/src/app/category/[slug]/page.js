"use client";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Filter, X, Heart, ShoppingBag, Check, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import LoginModal from "@/components/LoginModal";
import { wishlistApi } from "@/lib/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function CategoryPageContent() {
  const { slug } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subcategory = searchParams.get("subcategory");

  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [sortBy, setSortBy] = useState("popularity");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 });
  const [appliedPrice, setAppliedPrice] = useState({ min: 0, max: 50000 });
  const [cartLoading, setCartLoading] = useState(null);
  const [cartAdded, setCartAdded] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingId, setPendingId] = useState(null);
  const [pendingWishlistId, setPendingWishlistId] = useState(null);

  // Fetch category info + products
  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    const fetchData = async () => {
      try {
        // Try to find which group this slug belongs to
        const catRes = await fetch(`${BASE_URL}/categories`);
        const cats = await catRes.json();
        setAllCategories(Array.isArray(cats) ? cats : []);
        const matched = Array.isArray(cats) ? cats.find(c => c.slug === slug || c.name.toLowerCase() === slug.toLowerCase()) : null;
        setCategoryInfo(matched || { name: slug.replace(/-/g, ' '), slug });

        // Fetch products by subcategory slug
        let url = `${BASE_URL}/products?subcategory=${slug}`;
        if (subcategory) url = `${BASE_URL}/products?subcategory=${subcategory}`;

        const res = await fetch(url);
        let data = await res.json();
        const relatedRes = await fetch(`${BASE_URL}/products?limit=12`);
        const relatedData = await relatedRes.json();
        setRelatedProducts((Array.isArray(relatedData) ? relatedData : [])
          .filter(p => !Array.isArray(data) || !data.some(current => current.id === p.id))
          .slice(0, 4)
          .map(p => ({ ...p, images: Array.isArray(p.images) ? p.images : JSON.parse(p.images || "[]"), price: parseFloat(p.discounted_price || p.price || 0) })));
        if (localStorage.getItem("token")) {
          const wishlistData = await wishlistApi.get();
          setWishlist((wishlistData.items || []).map(item => item.product.id));
        }
        if (!Array.isArray(data) || data.length === 0) {
          const featuredRes = await fetch(`${BASE_URL}/products?limit=12`);
          data = await featuredRes.json();
        }
        setProducts((Array.isArray(data) ? data : []).map(p => ({
          ...p,
          images: Array.isArray(p.images) ? p.images : JSON.parse(p.images || "[]"),
          price: parseFloat(p.discounted_price || p.price || 0),
          original_price: parseFloat(p.original_price || 0),
        })));
      } catch (err) {
        console.error(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, subcategory]);

  const filteredProducts = useMemo(() => products
    .filter(p => p.price >= appliedPrice.min && p.price <= appliedPrice.max)
    .sort((a, b) => {
      if (sortBy === "low") return a.price - b.price;
      if (sortBy === "high") return b.price - a.price;
      if (sortBy === "new") return b.id - a.id;
      return 0;
    }), [products, appliedPrice, sortBy]);

  const doAddToCart = async (productId) => {
    setCartLoading(productId);
    const result = await addToCart(productId);
    setCartLoading(null);
    if (result.success) { setCartAdded(productId); setTimeout(() => setCartAdded(null), 2000); }
    else alert(result.error || 'Unable to add this item to your cart.');
  };

  const handleAddToCart = (e, productId) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) { setPendingId(productId); setShowLoginModal(true); return; }
    doAddToCart(productId);
  };

  const doToggleWishlist = async (productId) => {
    try {
      const result = await wishlistApi.toggle(productId);
      setWishlist(current => result.wishlisted
        ? [...new Set([...current, productId])]
        : current.filter(id => id !== productId));
    } catch (error) {
      alert(error.message || "Unable to update your wishlist.");
    }
  };

  const handleWishlist = (event, productId) => {
    event.stopPropagation();
    if (!localStorage.getItem("token")) {
      setPendingWishlistId(productId);
      setShowLoginModal(true);
      return;
    }
    doToggleWishlist(productId);
  };

  const displayName = categoryInfo?.name || slug?.replace(/-/g, ' ') || 'Category';

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => { setShowLoginModal(false); setPendingId(null); }}
        onSuccess={() => {
          if (pendingWishlistId) { doToggleWishlist(pendingWishlistId); setPendingWishlistId(null); }
          else if (pendingId) { doAddToCart(pendingId); setPendingId(null); }
        }}
        message={pendingWishlistId ? "Please sign in to use your wishlist." : "Please sign in to add this product to your cart."}
      />

      {/* TOP BAR */}
      <div className="bg-[#1a1410] text-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-14 py-5 flex items-center justify-between">
          <div>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest mb-1">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={10} />
              <span className="text-white/70 capitalize">{displayName}</span>
            </nav>
            <h1 className="font-serif text-xl md:text-2xl italic text-white font-light capitalize">
              {displayName}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="bg-white/10 text-white text-[10px] uppercase tracking-widest px-3 py-2 border border-white/10 outline-none rounded">
              <option value="popularity" className="bg-[#1a1410]">Popularity</option>
              <option value="new" className="bg-[#1a1410]">Newest</option>
              <option value="low" className="bg-[#1a1410]">Price: Low</option>
              <option value="high" className="bg-[#1a1410]">Price: High</option>
            </select>
            <button onClick={() => setIsFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 bg-white/10 px-3 py-2 text-[10px] uppercase tracking-widest border border-white/10 rounded">
              <Filter size={13} /> Filter
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-14 py-8 flex gap-8">

        {/* SIDEBAR */}
        <aside className="hidden lg:block w-[220px] shrink-0">
          <div className="sticky top-24 bg-white rounded-xl border border-[#ede8e0] p-5 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-[#ede8e0]">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#1a1410]">Filters</span>
              <button onClick={() => setAppliedPrice({ min: 0, max: 50000 })}
                className="text-[10px] text-[#b85c38] hover:underline">Reset</button>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#b85c38] mb-3">Categories</p>
              <div className="space-y-2.5 pb-5 border-b border-[#ede8e0]">
                {allCategories.slice(0, 10).map(cat => (
                  <Link key={cat.id} href={`/category/${cat.slug}`}
                    className={`flex items-center justify-between text-[11px] capitalize transition ${cat.slug === slug ? 'font-bold text-[#b85c38]' : 'text-[#6f625a] hover:text-[#1a1410]'}`}>
                    <span className="flex items-center gap-2"><span className={`w-3 h-3 border rounded-sm ${cat.slug === slug ? 'bg-[#1a1410] border-[#1a1410]' : 'border-[#cfc5ba]'}`} />{cat.name}</span>
                    <ChevronRight size={10} />
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#b85c38] mb-3">Price Range</p>
              <div className="flex gap-2 mb-3">
                <input type="number" value={priceRange.min}
                  onChange={e => setPriceRange(p => ({ ...p, min: +e.target.value }))}
                  placeholder="Min" className="w-full border border-[#ede8e0] rounded-lg px-2 py-1.5 text-xs outline-none bg-[#fdfaf4]" />
                <input type="number" value={priceRange.max}
                  onChange={e => setPriceRange(p => ({ ...p, max: +e.target.value }))}
                  placeholder="Max" className="w-full border border-[#ede8e0] rounded-lg px-2 py-1.5 text-xs outline-none bg-[#fdfaf4]" />
              </div>
              <button onClick={() => setAppliedPrice(priceRange)}
                className="w-full bg-[#1a1410] text-white text-[10px] uppercase tracking-widest py-2 rounded-lg hover:bg-[#b85c38] transition">
                Apply
              </button>
            </div>
          </div>
        </aside>

        {/* MOBILE FILTER */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-[200] bg-white p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg tracking-widest uppercase">Filters</h2>
              <X onClick={() => setIsFilterOpen(false)} size={22} className="cursor-pointer" />
            </div>
            <div className="space-y-4">
              <p className="text-sm font-bold">Categories</p>
              <div className="grid grid-cols-2 gap-2 pb-5 border-b">
                {allCategories.map(cat => <Link key={cat.id} href={`/category/${cat.slug}`} onClick={() => setIsFilterOpen(false)}
                  className={`border rounded-lg px-3 py-2 text-xs ${cat.slug === slug ? 'bg-[#1a1410] text-white' : 'text-[#6f625a]'}`}>{cat.name}</Link>)}
              </div>
              <p className="text-sm font-bold">Price Range</p>
              <div className="flex gap-3">
                <input type="number" value={priceRange.min} onChange={e => setPriceRange(p => ({ ...p, min: +e.target.value }))}
                  placeholder="Min" className="w-full border rounded-lg px-3 py-2 text-sm outline-none" />
                <input type="number" value={priceRange.max} onChange={e => setPriceRange(p => ({ ...p, max: +e.target.value }))}
                  placeholder="Max" className="w-full border rounded-lg px-3 py-2 text-sm outline-none" />
              </div>
            </div>
            <button onClick={() => { setAppliedPrice(priceRange); setIsFilterOpen(false); }}
              className="w-full bg-[#1a1410] text-white py-3 mt-8 uppercase tracking-widest text-sm rounded-lg font-bold">
              Apply & Close
            </button>
          </div>
        )}

        {/* PRODUCT GRID */}
        <section className="flex-1">
          <p className="text-[11px] text-[#9a8a7a] mb-6 uppercase tracking-widest">
            <span className="font-bold text-[#1a1410] text-base">{filteredProducts.length}</span> results
          </p>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-[#f0ece4] animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-lg font-bold text-[#1a1410] mb-2 capitalize">No products found in {displayName}</h2>
              <p className="text-[#9a8a7a] text-sm mb-6">There are currently no products available in this category.</p>
              <Link href="/" className="inline-block bg-[#1a1410] text-white px-8 py-3 rounded-lg text-sm font-bold hover:bg-[#b85c38] transition">
                Go to Home
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product, idx) => {
                const isAdded   = cartAdded === product.id;
                const isLoading = cartLoading === product.id;
                const discount  = product.original_price > product.price
                  ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
                  : 0;

                return (
                  <div key={product.id}
                    onClick={() => router.push(`/product/${product.id}`)}
                    className="group cursor-pointer bg-white border border-[#f0ece4] rounded-xl overflow-hidden hover:shadow-md transition-all">

                    <div className="aspect-[3/4] overflow-hidden relative">
                      <img
                        src={product.images?.[0] || '/placeholder.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {discount > 0 && (
                        <span className="absolute top-2 left-2 bg-[#b85c38] text-white text-[9px] font-bold px-2 py-0.5 rounded">
                          {discount}% OFF
                        </span>
                      )}
                      <button onClick={e => handleWishlist(e, product.id)}
                        className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm">
                        <Heart size={14} className={wishlist.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-400"} />
                      </button>

                      {/* Quick Add */}
                      <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <button onClick={e => handleAddToCart(e, product.id)} disabled={isLoading || !product.in_stock}
                          className={`w-full py-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                            isAdded ? 'bg-green-600 text-white' :
                            !product.in_stock ? 'bg-gray-300 text-gray-500 cursor-not-allowed' :
                            'bg-[#1a1410] text-white hover:bg-[#b85c38]'
                          }`}>
                          {isAdded ? <><Check size={13} /> Added!</> :
                           isLoading ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Adding...</> :
                           !product.in_stock ? 'Out of Stock' :
                           <><ShoppingBag size={13} /> Quick Add</>}
                        </button>
                      </div>
                    </div>

                    <div className="p-3">
                      <h3 className="text-[12px] font-semibold text-[#1a1410] truncate">{product.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-bold text-sm text-[#1a1410]">₹{product.price.toLocaleString()}</span>
                        {discount > 0 && (
                          <span className="text-[11px] text-gray-400 line-through">₹{product.original_price.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && <aside className="hidden xl:block w-[230px] shrink-0">
          <div className="sticky top-28">
            <p className="text-[9px] font-bold uppercase tracking-[.3em] text-[#b85c38]">Complete the look</p>
            <h2 className="font-serif text-xl italic mt-1 mb-5">You may also like</h2>
            <div className="space-y-4">
              {relatedProducts.map(product => <Link href={`/product/${product.id}`} key={product.id} className="group flex gap-3 border-b border-[#e9e2d9] pb-4">
                <div className="w-20 h-24 shrink-0 overflow-hidden rounded-lg bg-[#eee7de]"><img src={product.images?.[0] || '/placeholder.jpg'} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /></div>
                <div className="min-w-0 py-1"><p className="text-[11px] font-semibold leading-4 line-clamp-2">{product.name}</p><p className="text-[9px] uppercase tracking-wider text-[#a18c7c] mt-1">{product.subCategory?.replaceAll('-', ' ')}</p><p className="font-bold text-xs mt-2">₹{product.price.toLocaleString('en-IN')}</p><span className="text-[8px] uppercase tracking-widest text-[#b85c38] mt-2 block">View piece →</span></div>
              </Link>)}
            </div>
          </div>
        </aside>}
      </div>

      {relatedProducts.length > 0 && <section className="xl:hidden px-6 md:px-14 pb-12 max-w-[1440px] mx-auto">
        <div className="flex items-end justify-between mb-4"><div><p className="text-[9px] font-bold uppercase tracking-[.3em] text-[#b85c38]">Recommended</p><h2 className="font-serif text-2xl italic">You may also like</h2></div></div>
        <div className="flex gap-4 overflow-x-auto pb-3">{relatedProducts.map(product => <Link href={`/product/${product.id}`} key={product.id} className="min-w-[160px] w-[160px]"><div className="aspect-[3/4] overflow-hidden rounded-xl"><img src={product.images?.[0] || '/placeholder.jpg'} alt={product.name} className="w-full h-full object-cover" /></div><p className="mt-2 text-xs font-semibold truncate">{product.name}</p><p className="text-xs font-bold mt-1">₹{product.price.toLocaleString('en-IN')}</p></Link>)}</div>
      </section>}
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-[#9a8a7a] text-sm tracking-widest uppercase">
        Loading...
      </div>
    }>
      <CategoryPageContent />
    </Suspense>
  );
}
