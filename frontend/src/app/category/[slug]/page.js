"use client";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Filter,
  X,
  Heart,
  ShoppingBag,
  Check,
  ChevronRight,
  Eye,
} from "lucide-react";
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
  const searchQuery = searchParams.get("search");

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
  const [quickView, setQuickView] = useState(null);
  const [sortOpen, setSortOpen] = useState(false);

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
        const matched = Array.isArray(cats)
          ? cats.find(
              (c) =>
                c.slug === slug || c.name.toLowerCase() === slug.toLowerCase(),
            )
          : null;
        setCategoryInfo(matched || { name: slug.replace(/-/g, " "), slug });

        // Fetch products by subcategory slug
        let url = searchQuery
          ? `${BASE_URL}/products?search=${encodeURIComponent(searchQuery)}`
          : `${BASE_URL}/products?subcategory=${subcategory || slug}`;

        const res = await fetch(url);
        let data = await res.json();
        const relatedRes = await fetch(`${BASE_URL}/products?limit=12`);
        const relatedData = await relatedRes.json();
        setRelatedProducts(
          (Array.isArray(relatedData) ? relatedData : [])
            .filter(
              (p) =>
                !Array.isArray(data) ||
                !data.some((current) => current.id === p.id),
            )
            .slice(0, 4)
            .map((p) => ({
              ...p,
              images: Array.isArray(p.images)
                ? p.images
                : JSON.parse(p.images || "[]"),
              price: parseFloat(p.discounted_price || p.price || 0),
            })),
        );
        if (localStorage.getItem("token")) {
          const wishlistData = await wishlistApi.get();
          setWishlist(
            (wishlistData.items || []).map((item) => item.product.id),
          );
        }
        if (!Array.isArray(data) || data.length === 0) {
          const featuredRes = await fetch(`${BASE_URL}/products?limit=12`);
          data = await featuredRes.json();
        }
        setProducts(
          (Array.isArray(data) ? data : []).map((p) => ({
            ...p,
            images: Array.isArray(p.images)
              ? p.images
              : JSON.parse(p.images || "[]"),
            price: parseFloat(p.discounted_price || p.price || 0),
            original_price: parseFloat(p.original_price || 0),
          })),
        );
      } catch (err) {
        console.error(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, subcategory, searchQuery]);

  const filteredProducts = useMemo(
    () =>
      products
        .filter(
          (p) => p.price >= appliedPrice.min && p.price <= appliedPrice.max,
        )
        .sort((a, b) => {
          if (sortBy === "low") return a.price - b.price;
          if (sortBy === "high") return b.price - a.price;
          if (sortBy === "new") return b.id - a.id;
          return 0;
        }),
    [products, appliedPrice, sortBy],
  );

  const doAddToCart = async (productId) => {
    setCartLoading(productId);
    const result = await addToCart(productId);
    setCartLoading(null);
    if (result.success) {
      setCartAdded(productId);
      setTimeout(() => setCartAdded(null), 2000);
    } else alert(result.error || "Unable to add this item to your cart.");
  };

  const handleAddToCart = (e, productId) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      setPendingId(productId);
      setShowLoginModal(true);
      return;
    }
    doAddToCart(productId);
  };

  const doToggleWishlist = async (productId) => {
    try {
      const result = await wishlistApi.toggle(productId);
      setWishlist((current) =>
        result.wishlisted
          ? [...new Set([...current, productId])]
          : current.filter((id) => id !== productId),
      );
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

  const displayName =
    categoryInfo?.name || slug?.replace(/-/g, " ") || "Category";

  return (
    <div className="store-shell min-h-screen bg-[#faf7f1]">
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          setPendingId(null);
          setPendingWishlistId(null);
        }}
        onSuccess={() => {
          if (pendingWishlistId) {
            doToggleWishlist(pendingWishlistId);
            setPendingWishlistId(null);
          } else if (pendingId) {
            doAddToCart(pendingId);
            setPendingId(null);
            setQuickView(null);
          }
        }}
        message={
          pendingWishlistId
            ? "Please sign in to use your wishlist."
            : "Please sign in to add this product to your cart."
        }
      />
      {quickView && (
        <div
          className="fixed inset-0 z-[250] grid place-items-center overflow-y-auto bg-[#2b1f19]/50 p-3 backdrop-blur-sm sm:p-4"
          onClick={() => setQuickView(null)}
        >
          <div
            className="relative grid max-h-[calc(100svh-1.5rem)] w-full max-w-3xl overflow-y-auto rounded-[1.5rem] bg-[#fffdf9] shadow-2xl md:grid-cols-2"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={() => setQuickView(null)}
              className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/85 shadow"
            >
              <X size={17} />
            </button>
            <div className="aspect-square bg-[#eee7de]">
              <img
                src={quickView.images?.[0] || "/placeholder.jpg"}
                alt={quickView.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-center p-7 md:p-9">
              <p className="section-kicker">Quick view</p>
              <h2 className="font-serif text-3xl leading-tight">
                {quickView.name}
              </h2>
              <p className="mt-3 text-xl">
                ₹{quickView.price.toLocaleString("en-IN")}
              </p>
              <p className="mt-4 text-xs leading-6 text-[#7a685e]">
                {quickView.short_description ||
                  "A modern heirloom, thoughtfully crafted and finished by hand."}
              </p>
              <div className="mt-6 flex gap-2">
                <button
                  onClick={(event) => handleAddToCart(event, quickView.id)}
                  className="flex-1 rounded-full bg-[#3d2d25] px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-white"
                >
                  Add to bag
                </button>
                <Link
                  href={`/product/${quickView.id}`}
                  className="flex-1 rounded-full border border-[#cdbfae] px-4 py-3 text-center text-[9px] font-bold uppercase tracking-widest"
                >
                  View details
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOP BAR */}
      <div className="border-y border-[#e4dacd] bg-[#f1e9de] text-[#33261f]">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6 md:px-14">
          <div>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-[9px] text-[#998577] uppercase tracking-widest mb-1">
              <Link href="/" className="hover:text-white transition">
                Home
              </Link>
              <ChevronRight size={10} />
              <span className="text-[#6f5b50] capitalize">{displayName}</span>
            </nav>
            <h1 className="font-serif text-2xl md:text-3xl text-[#33261f] font-light capitalize">
              {displayName}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setSortOpen((open) => !open)}
                aria-expanded={sortOpen}
                className="flex min-w-[145px] items-center justify-between gap-3 rounded-full border border-[#cdbb9f] bg-[#fffdf9] px-4 py-2.5 text-[9px] font-bold uppercase tracking-[.16em] text-[#4a382f] shadow-sm"
              >
                <span>
                  {
                    {
                      popularity: "Popularity",
                      new: "Newest",
                      low: "Price: Low",
                      high: "Price: High",
                    }[sortBy]
                  }
                </span>
                <ChevronRight
                  size={13}
                  className={`transition ${sortOpen ? "-rotate-90" : "rotate-90"}`}
                />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-[calc(100%+.45rem)] z-40 w-44 overflow-hidden rounded-xl border border-[#ded1c1] bg-[#fffdf9] p-1.5 shadow-[0_18px_45px_rgba(56,38,26,.14)]">
                  {[
                    ["popularity", "Popularity"],
                    ["new", "Newest"],
                    ["low", "Price: Low"],
                    ["high", "Price: High"],
                  ].map(([value, label]) => (
                    <button
                      type="button"
                      key={value}
                      onClick={() => {
                        setSortBy(value);
                        setSortOpen(false);
                      }}
                      className={`block w-full rounded-lg px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-[.14em] transition ${sortBy === value ? "bg-[#ede2d3] text-[#6f4f2d]" : "text-[#68564b] hover:bg-[#f5eee5]"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setIsFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 rounded-full border border-[#cdbb9f] bg-[#fffdf9] px-3 py-2 text-[9px] font-bold uppercase tracking-widest text-[#4a382f]"
            >
              <Filter size={13} /> Filter
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1440px] gap-8 px-4 py-6 sm:px-6 md:px-14 md:py-8">
        {/* SIDEBAR */}
        <aside className="hidden lg:block w-[220px] shrink-0">
          <div className="sticky top-24 bg-white rounded-xl border border-[#ede8e0] p-5 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-[#ede8e0]">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#1a1410]">
                Filters
              </span>
              <button
                onClick={() => setAppliedPrice({ min: 0, max: 50000 })}
                className="text-[10px] text-[#b85c38] hover:underline"
              >
                Reset
              </button>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#b85c38] mb-3">
                Categories
              </p>
              <div className="space-y-2.5 pb-5 border-b border-[#ede8e0]">
                {allCategories.slice(0, 10).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className={`flex items-center justify-between text-[11px] capitalize transition ${cat.slug === slug ? "font-bold text-[#b85c38]" : "text-[#6f625a] hover:text-[#1a1410]"}`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-3 h-3 border rounded-sm ${cat.slug === slug ? "bg-[#1a1410] border-[#1a1410]" : "border-[#cfc5ba]"}`}
                      />
                      {cat.name}
                    </span>
                    <ChevronRight size={10} />
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#b85c38] mb-3">
                Price Range
              </p>
              <div className="flex gap-2 mb-3">
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange((p) => ({ ...p, min: +e.target.value }))
                  }
                  placeholder="Min"
                  className="w-full border border-[#ede8e0] rounded-lg px-2 py-1.5 text-xs outline-none bg-[#fdfaf4]"
                />
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange((p) => ({ ...p, max: +e.target.value }))
                  }
                  placeholder="Max"
                  className="w-full border border-[#ede8e0] rounded-lg px-2 py-1.5 text-xs outline-none bg-[#fdfaf4]"
                />
              </div>
              <button
                onClick={() => setAppliedPrice(priceRange)}
                className="w-full bg-[#1a1410] text-white text-[10px] uppercase tracking-widest py-2 rounded-lg hover:bg-[#b85c38] transition"
              >
                Apply
              </button>
            </div>
          </div>
        </aside>

        {/* MOBILE FILTER */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-[200] bg-white p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg tracking-widest uppercase">
                Filters
              </h2>
              <X
                onClick={() => setIsFilterOpen(false)}
                size={22}
                className="cursor-pointer"
              />
            </div>
            <div className="space-y-4">
              <p className="text-sm font-bold">Categories</p>
              <div className="grid grid-cols-2 gap-2 pb-5 border-b">
                {allCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    onClick={() => setIsFilterOpen(false)}
                    className={`border rounded-lg px-3 py-2 text-xs ${cat.slug === slug ? "bg-[#1a1410] text-white" : "text-[#6f625a]"}`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
              <p className="text-sm font-bold">Price Range</p>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange((p) => ({ ...p, min: +e.target.value }))
                  }
                  placeholder="Min"
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                />
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange((p) => ({ ...p, max: +e.target.value }))
                  }
                  placeholder="Max"
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                />
              </div>
            </div>
            <button
              onClick={() => {
                setAppliedPrice(priceRange);
                setIsFilterOpen(false);
              }}
              className="w-full bg-[#1a1410] text-white py-3 mt-8 uppercase tracking-widest text-sm rounded-lg font-bold"
            >
              Apply & Close
            </button>
          </div>
        )}

        {/* PRODUCT GRID */}
        <section className="flex-1">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <p className="text-[11px] text-[#9a8a7a] uppercase tracking-widest">
              <span className="font-bold text-[#1a1410] text-base">
                {filteredProducts.length}
              </span>{" "}
              results
            </p>
            {(appliedPrice.min > 0 || appliedPrice.max < 50000) && (
              <button
                onClick={() => {
                  setAppliedPrice({ min: 0, max: 50000 });
                  setPriceRange({ min: 0, max: 50000 });
                }}
                className="rounded-full border border-[#d8c9b7] bg-white px-3 py-1 text-[8px] font-bold uppercase tracking-wider"
              >
                ₹{appliedPrice.min}–₹{appliedPrice.max} ×
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/5] bg-[#f0ece4] animate-pulse rounded-[1.15rem]"
                />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-lg font-bold text-[#1a1410] mb-2 capitalize">
                No products found in {displayName}
              </h2>
              <p className="text-[#9a8a7a] text-sm mb-6">
                There are currently no products available in this category.
              </p>
              <Link
                href="/"
                className="inline-block bg-[#1a1410] text-white px-8 py-3 rounded-lg text-sm font-bold hover:bg-[#b85c38] transition"
              >
                Go to Home
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product, idx) => {
                const isAdded = cartAdded === product.id;
                const isLoading = cartLoading === product.id;
                const discount =
                  product.original_price > product.price
                    ? Math.round(
                        ((product.original_price - product.price) /
                          product.original_price) *
                          100,
                      )
                    : 0;

                return (
                  <div
                    key={product.id}
                    onClick={() => router.push(`/product/${product.id}`)}
                    className="group cursor-pointer bg-white border border-[#ece4da] rounded-[1.15rem] overflow-hidden hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(69,44,29,.1)] transition-all duration-300"
                  >
                    <div className="aspect-[4/5] overflow-hidden relative bg-[#eee8df]">
                      <img
                        src={product.images?.[0] || "/placeholder.jpg"}
                        alt={product.name}
                        className={`w-full h-full object-cover transition duration-500 ${product.images?.[1] ? "group-hover:opacity-0" : "group-hover:scale-105"}`}
                      />
                      {product.images?.[1] && (
                        <img
                          src={product.images[1]}
                          alt={`${product.name} alternate view`}
                          className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                        />
                      )}
                      {discount > 0 && (
                        <span className="absolute top-2 left-2 bg-[#b85c38] text-white text-[9px] font-bold px-2 py-0.5 rounded">
                          {discount}% OFF
                        </span>
                      )}
                      <button
                        onClick={(e) => handleWishlist(e, product.id)}
                        className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm"
                      >
                        <Heart
                          size={14}
                          className={
                            wishlist.includes(product.id)
                              ? "fill-red-500 text-red-500"
                              : "text-gray-400"
                          }
                        />
                      </button>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          setQuickView(product);
                        }}
                        className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-[#3d2d25] opacity-0 shadow transition group-hover:opacity-100"
                        aria-label={`Quick view ${product.name}`}
                      >
                        <Eye size={15} />
                      </button>

                      {/* Quick Add */}
                      <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <button
                          onClick={(e) => handleAddToCart(e, product.id)}
                          disabled={isLoading || !product.in_stock}
                          className={`w-full py-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                            isAdded
                              ? "bg-green-600 text-white"
                              : !product.in_stock
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-[#1a1410] text-white hover:bg-[#b85c38]"
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check size={13} /> Added!
                            </>
                          ) : isLoading ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                              Adding...
                            </>
                          ) : !product.in_stock ? (
                            "Out of Stock"
                          ) : (
                            <>
                              <ShoppingBag size={13} /> Quick Add
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="p-3">
                      <h3 className="text-[12px] font-semibold text-[#1a1410] truncate">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-bold text-sm text-[#1a1410]">
                          ₹{product.price.toLocaleString()}
                        </span>
                        {discount > 0 && (
                          <span className="text-[11px] text-gray-400 line-through">
                            ₹{product.original_price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {relatedProducts.length > 0 && (
        <section className="recommendation-grid border-t border-[#e4dacd] px-6 py-12 md:px-14 max-w-[1440px] mx-auto">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[.3em] text-[#b85c38]">
                Recommended
              </p>
              <h2 className="font-serif text-2xl italic">You may also like</h2>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-3">
            {relatedProducts.map((product) => (
              <Link
                href={`/product/${product.id}`}
                key={product.id}
                className="min-w-[160px] w-[160px]"
              >
                <div className="aspect-[4/5] overflow-hidden rounded-xl">
                  <img
                    src={product.images?.[0] || "/placeholder.jpg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="mt-2 text-xs font-semibold truncate">
                  {product.name}
                </p>
                <p className="text-xs font-bold mt-1">
                  ₹{product.price.toLocaleString("en-IN")}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-[#9a8a7a] text-sm tracking-widest uppercase">
          Loading...
        </div>
      }
    >
      <CategoryPageContent />
    </Suspense>
  );
}
