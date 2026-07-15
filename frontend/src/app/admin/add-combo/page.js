"use client";

import { useEffect, useMemo, useState } from "react";
import { Gift, ImagePlus, Minus, Plus, Save, Search, X } from "lucide-react";
import MediaUpload from "@/components/MediaUpload";
import { adminFetch, formatMoney, productImage, productPrice } from "../adminApi";

const emptyForm = {
  name: "",
  discountedPrice: "",
  inStock: true,
  shortDescription: "",
  fullDescription: "",
  images: ["", "", "", ""],
};

export default function AddComboPage() {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState({});
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch("/api/combo-candidates")
      .then(setProducts)
      .catch((err) => setError(err.message || "Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  const selectedProducts = useMemo(
    () => products.filter((product) => selected[product.id]),
    [products, selected]
  );
  const componentTotal = selectedProducts.reduce(
    (sum, product) => sum + productPrice(product) * selected[product.id], 0
  );
  const visibleProducts = products.filter((product) =>
    `${product.name} ${product.category} ${product.sub_category}`.toLowerCase().includes(search.toLowerCase())
  );

  const setQuantity = (productId, quantity) => {
    setSelected((current) => {
      if (quantity < 1) {
        const next = { ...current };
        delete next[productId];
        return next;
      }
      return { ...current, [productId]: quantity };
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!form.name.trim()) return setError("Combo name is required.");
    if (selectedProducts.length < 2) return setError("Select at least two different products.");
    const salePrice = Number(form.discountedPrice);
    if (!salePrice || salePrice < 0 || salePrice > componentTotal) {
      return setError("Enter a sale price greater than zero and no more than the component total.");
    }

    setSaving(true);
    try {
      const combo = await adminFetch("/api/combos", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          originalPrice: componentTotal,
          images: form.images.map((image) => image.trim()).filter(Boolean),
          items: selectedProducts.map((product) => ({
            productId: product.id,
            quantity: selected[product.id],
          })),
        }),
      });
      setMessage(`Combo #${combo.id} created with ${combo.comboItems.length} products.`);
      setForm(emptyForm);
      setSelected({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message || "Failed to create combo");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-4 xl:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <Panel title="Combo Details" icon={Gift}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Combo Name" required>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="The Celebration Pair" className={inputClass} />
            </Field>
            <Field label="Combo Sale Price" required>
              <input type="number" min="1" max={componentTotal || undefined} value={form.discountedPrice}
                onChange={(e) => setForm({ ...form, discountedPrice: e.target.value })}
                placeholder="Select products first" className={inputClass} />
            </Field>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Short Description">
              <input value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                placeholder="A ready-to-gift jewellery pairing" className={inputClass} />
            </Field>
            <label className="flex items-end gap-2 pb-2 text-sm font-bold text-stone-700">
              <input type="checkbox" checked={form.inStock}
                onChange={(e) => setForm({ ...form, inStock: e.target.checked })} className="h-4 w-4" />
              Available for purchase
            </label>
          </div>
          <div className="mt-4">
            <Field label="Full Description">
              <textarea rows={4} value={form.fullDescription}
                onChange={(e) => setForm({ ...form, fullDescription: e.target.value })}
                className={`${inputClass} resize-none`} />
            </Field>
          </div>
        </Panel>

        <Panel title="Choose Products" icon={Search}>
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-3 text-stone-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search created products" className={`${inputClass} pl-9`} />
          </div>
          {loading && <p className="py-8 text-center text-sm font-semibold text-stone-500">Loading products...</p>}
          {!loading && visibleProducts.length === 0 && (
            <p className="py-8 text-center text-sm font-semibold text-stone-500">No matching products.</p>
          )}
          <div className="grid max-h-[520px] gap-2 overflow-y-auto pr-1 md:grid-cols-2">
            {visibleProducts.map((product) => {
              const quantity = selected[product.id] || 0;
              return (
                <div key={product.id} className={`grid grid-cols-[52px_1fr_auto] items-center gap-3 rounded-lg border p-2 ${quantity ? "border-amber-600 bg-amber-50" : "border-stone-200"}`}>
                  <img src={productImage(product)} alt={product.name} className="h-13 w-13 rounded-md object-cover" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-stone-900">{product.name}</p>
                    <p className="text-xs font-semibold text-stone-500">{formatMoney(productPrice(product))}</p>
                  </div>
                  {quantity ? (
                    <div className="flex items-center gap-1">
                      <IconButton label="Decrease quantity" onClick={() => setQuantity(product.id, quantity - 1)}><Minus size={14} /></IconButton>
                      <span className="w-6 text-center text-sm font-black">{quantity}</span>
                      <IconButton label="Increase quantity" onClick={() => setQuantity(product.id, quantity + 1)}><Plus size={14} /></IconButton>
                    </div>
                  ) : (
                    <IconButton label={`Add ${product.name}`} onClick={() => setQuantity(product.id, 1)}><Plus size={16} /></IconButton>
                  )}
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="Combo Images" icon={ImagePlus}>
          <div className="grid gap-5 md:grid-cols-2">
            {form.images.map((image, index) => (
              <MediaUpload key={index} label="Media" index={index} value={image}
                onChange={(value) => setForm((current) => ({
                  ...current,
                  images: current.images.map((item, itemIndex) => itemIndex === index ? value : item),
                }))} accept="image/*" />
            ))}
          </div>
        </Panel>
      </div>

      <aside className="space-y-4">
        <Panel title={`Selected (${selectedProducts.length})`} icon={Gift}>
          {selectedProducts.length === 0 && <p className="text-sm text-stone-500">Choose at least two products.</p>}
          <div className="space-y-2">
            {selectedProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-2 border-b border-stone-100 pb-2 text-sm">
                <span className="min-w-0 flex-1 truncate font-bold">{product.name} x{selected[product.id]}</span>
                <span className="font-semibold text-stone-500">{formatMoney(productPrice(product) * selected[product.id])}</span>
                <button type="button" title="Remove product" onClick={() => setQuantity(product.id, 0)} className="p-1 text-stone-400 hover:text-red-600"><X size={15} /></button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-stone-200 pt-3 font-black">
            <span>Component total</span><span>{formatMoney(componentTotal)}</span>
          </div>
        </Panel>
        {(error || message) && (
          <div className={`rounded-lg border px-3 py-2 text-sm font-semibold ${error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
            {error || message}
          </div>
        )}
        <button type="submit" disabled={saving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-stone-950 px-4 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-stone-800 disabled:opacity-60">
          <Save size={17} />{saving ? "Creating..." : "Create Combo"}
        </button>
      </aside>
    </form>
  );
}

const inputClass = "w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-950 outline-none focus:border-stone-950 disabled:bg-stone-100";

function Panel({ title, icon: Icon, children }) {
  return <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm"><div className="mb-4 flex items-center gap-2">{Icon && <Icon size={18} />}<h2 className="text-base font-black">{title}</h2></div>{children}</section>;
}

function Field({ label, required, children }) {
  return <label className="block"><span className="mb-1 block text-xs font-bold uppercase tracking-widest text-stone-500">{label}{required ? " *" : ""}</span>{children}</label>;
}

function IconButton({ label, onClick, children }) {
  return <button type="button" title={label} aria-label={label} onClick={onClick} className="flex h-8 w-8 items-center justify-center rounded-md border border-stone-300 bg-white hover:border-stone-900">{children}</button>;
}
