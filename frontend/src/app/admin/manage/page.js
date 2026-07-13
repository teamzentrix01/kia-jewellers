"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Edit3, Eye, RefreshCw, Search, Trash2, X, ImagePlus } from "lucide-react";
import {
  API_BASE,
  adminFetch,
  formatMoney,
  productImage,
  productOriginalPrice,
  productPrice,
  productStock,
} from "../adminApi";
import MediaUpload from "@/components/MediaUpload";

export default function ManageProductsPage() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/api/products`);
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category).filter(Boolean))), [products]);

  const filtered = useMemo(() => products.filter(product => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = `${product.name} ${product.category} ${product.sub_category}`.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  }), [products, search, selectedCategory]);

  const confirmDelete = async () => {
    if (!deleteProduct) return;
    try {
      await adminFetch(`/api/products/${deleteProduct.id}`, { method: "DELETE" });
      setDeleteProduct(null);
      fetchProducts();
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  };

  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-black text-stone-950">Products From Database</h2>
          <p className="mt-1 text-xs font-semibold text-stone-500">{filtered.length} products shown</p>
        </div>
        <button type="button" onClick={fetchProducts}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-stone-300 px-3 py-2 text-xs font-bold uppercase tracking-wider text-stone-700 hover:bg-stone-50">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px]">
        <label className="relative block">
          <Search className="absolute left-3 top-2.5 text-stone-400" size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products"
            className="w-full rounded-lg border border-stone-300 py-2 pl-9 pr-3 text-sm font-semibold outline-none focus:border-stone-950" />
        </label>
        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm font-semibold outline-none focus:border-stone-950">
          <option value="all">All categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {error && <EmptyText>{error}</EmptyText>}
      {loading && <EmptyText>Loading products...</EmptyText>}

      {!loading && !error && (
        <div className="space-y-2">
          {filtered.map(product => (
            <div key={product.id} className="grid gap-3 rounded-lg border border-stone-200 p-3 md:grid-cols-[56px_1fr_auto] md:items-center">
              <ProductThumb product={product} />
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-stone-950">{product.name}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-stone-500">
                  #{product.id} / {product.category || "general"} / {product.sub_category || "general"}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-bold text-stone-600">
                  <span>{formatMoney(productPrice(product))}</span>
                  {productOriginalPrice(product) > productPrice(product) && (
                    <span className="text-stone-400 line-through">{formatMoney(productOriginalPrice(product))}</span>
                  )}
                  <span className={productStock(product) ? "text-emerald-700" : "text-red-700"}>
                    {productStock(product) ? "In stock" : "Out of stock"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/product/${product.id}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50" title="View">
                  <Eye size={16} />
                </Link>
                <button type="button" onClick={() => setEditProduct(product)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-amber-300 text-amber-800 hover:bg-amber-50" title="Edit">
                  <Edit3 size={16} />
                </button>
                <button type="button" onClick={() => setDeleteProduct(product)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-300 text-red-700 hover:bg-red-50" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <EmptyText>No matching products found.</EmptyText>}
        </div>
      )}

      {editProduct && (
        <EditProductModal product={editProduct} onClose={() => setEditProduct(null)}
          onSaved={() => { setEditProduct(null); fetchProducts(); }} />
      )}
      {deleteProduct && (
        <ConfirmDeleteModal product={deleteProduct} onClose={() => setDeleteProduct(null)} onConfirm={confirmDelete} />
      )}
    </section>
  );
}

function ProductThumb({ product }) {
  const src = productImage(product);
  if (!src) return <div className="h-14 w-14 rounded-lg bg-stone-100" />;
  return <img src={src} alt={product.name} className="h-14 w-14 rounded-lg border border-stone-200 object-cover" />;
}

function EditProductModal({ product, onClose, onSaved }) {
  const parseImages = (p) => {
    try {
      const imgs = Array.isArray(p.images) ? p.images : JSON.parse(p.images || '[]');
      const arr = [...imgs, '', '', '', ''];
      return arr.slice(0, 4);
    } catch { return ['', '', '', '']; }
  };

  const [form, setForm] = useState({
    name: product.name || "",
    originalPrice: String(productOriginalPrice(product)),
    discountedPrice: String(productPrice(product)),
    inStock: productStock(product),
    images: parseImages(product),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showImages, setShowImages] = useState(false);

  const updateImage = (index, val) => {
    setForm(f => { const imgs = [...f.images]; imgs[index] = val; return { ...f, images: imgs }; });
  };

  const saveProduct = async () => {
    setSaving(true);
    setError("");
    try {
      await adminFetch(`/api/products/${product.id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...form,
          images: form.images.filter(Boolean),
        }),
      });
      onSaved();
    } catch (err) {
      setError(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between gap-3 border-b border-stone-200 p-4">
        <h3 className="font-black text-stone-950">Edit Product #{product.id}</h3>
        <button type="button" onClick={onClose} className="rounded-lg p-2 text-stone-500 hover:bg-stone-100"><X size={17} /></button>
      </div>
      <div className="space-y-4 p-4 max-h-[70vh] overflow-y-auto">
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}

        <Field label="Name">
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputClass} />
        </Field>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Original Price">
            <input type="number" value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))} className={inputClass} />
          </Field>
          <Field label="Discounted Price">
            <input type="number" value={form.discountedPrice} onChange={e => setForm(f => ({ ...f, discountedPrice: e.target.value }))} className={inputClass} />
          </Field>
        </div>

        <label className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-stone-300 px-3 py-2 text-sm font-bold">
          <input type="checkbox" checked={form.inStock} onChange={e => setForm(f => ({ ...f, inStock: e.target.checked }))} />
          In stock
        </label>

        {/* Images toggle */}
        <button type="button" onClick={() => setShowImages(p => !p)}
          className="flex items-center gap-2 text-xs font-bold text-stone-600 border border-stone-200 px-3 py-2 rounded-lg hover:bg-stone-50 transition w-full">
          <ImagePlus size={14} />
          {showImages ? 'Hide' : 'Edit'} Images & Media ({form.images.filter(Boolean).length} set)
        </button>

        {showImages && (
          <div className="space-y-4 p-3 bg-stone-50 rounded-lg border border-stone-200">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Images & Media</p>
            {form.images.map((img, i) => (
              <MediaUpload key={i} label="Media" index={i} value={img} onChange={val => updateImage(i, val)} />
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2 border-t border-stone-200 p-4">
        <button type="button" onClick={onClose} className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-bold">Cancel</button>
        <button type="button" onClick={saveProduct} disabled={saving}
          className="rounded-lg bg-stone-950 px-4 py-2 text-sm font-bold text-white hover:bg-stone-800 disabled:opacity-60">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </Modal>
  );
}

function ConfirmDeleteModal({ product, onClose, onConfirm }) {
  return (
    <Modal onClose={onClose}>
      <div className="p-5">
        <h3 className="text-lg font-black text-stone-950">Delete product?</h3>
        <p className="mt-2 text-sm font-semibold text-stone-600">Product #{product.id} will be removed from the database.</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-bold">Cancel</button>
          <button type="button" onClick={onConfirm}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl" onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-stone-500">{label}</span>
      {children}
    </label>
  );
}

function EmptyText({ children }) {
  return <p className="rounded-lg border border-dashed border-stone-300 p-6 text-center text-sm font-semibold text-stone-500">{children}</p>;
}

const inputClass = "w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-950 outline-none focus:border-stone-950";