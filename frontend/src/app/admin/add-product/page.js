"use client";

import { useState } from "react";
import { ImagePlus, PackagePlus, Save, Star } from "lucide-react";
import { adminFetch } from "../adminApi";
import MediaUpload from "@/components/MediaUpload";

const CATEGORIES = ["Fine Jewellery", "Bridal", "Gifting"];

const SUB_CATEGORIES = {
  "Fine Jewellery": ["Rings", "Earrings", "Necklaces", "Bangles", "Bracelets", "Pendants", "Anklets"],
  Bridal: ["Bridal Sets", "Polki", "Kundan", "Maang Tikka", "Nose Rings", "Temple Jewellery"],
  Gifting: ["Under ₹5,000", "Anniversary", "Birthday", "For Her", "For Him", "Gift Cards"],
};

const emptyForm = {
  name: "",
  category: "",
  subcategory: "",
  originalPrice: "",
  discountedPrice: "",
  inStock: true,
  shortDescription: "",
  fullDescription: "",
  images: ["", "", "", ""],
  reviewerName: "",
  rating: "",
  reviewText: "",
};

export default function AddProductPage() {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updateField = (name, value) => {
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "category" ? { subcategory: "" } : {}),
    }));
  };

  const updateImage = (index, value) => {
    setForm((current) => {
      const images = [...current.images];
      images[index] = value;
      return { ...current, images };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.name.trim() || !form.category || !form.subcategory) {
      setError("Product name, category, and sub-category are required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        category: form.category.toLowerCase(),
        images: form.images.map((image) => image.trim()).filter(Boolean),
      };

      const product = await adminFetch("/api/products", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setMessage(`Product #${product.id} saved to the database.`);
      setForm(emptyForm);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 xl:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <Panel title="Product Details" icon={PackagePlus}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Product Name" required>
              <input
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Silk Banarasi Saree"
                className={inputClass}
              />
            </Field>

            <Field label="Main Category" required>
              <select
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
                className={inputClass}
              >
                <option value="">Select category</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Field label="Sub-category" required>
              <select
                value={form.subcategory}
                onChange={(event) => updateField("subcategory", event.target.value)}
                disabled={!form.category}
                className={inputClass}
              >
                <option value="">Select sub-category</option>
                {(SUB_CATEGORIES[form.category] || []).map((subcategory) => (
                  <option key={subcategory} value={subcategory}>{subcategory}</option>
                ))}
              </select>
            </Field>

            <Field label="Original Price">
              <input
                type="number"
                value={form.originalPrice}
                onChange={(event) => updateField("originalPrice", event.target.value)}
                placeholder="1999"
                className={inputClass}
              />
            </Field>

            <Field label="Discounted Price">
              <input
                type="number"
                value={form.discountedPrice}
                onChange={(event) => updateField("discountedPrice", event.target.value)}
                placeholder="1499"
                className={inputClass}
              />
            </Field>
          </div>

          <label className="mt-4 flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-stone-300 px-3 py-2 text-sm font-bold text-stone-700">
            <input
              type="checkbox"
              checked={form.inStock}
              onChange={(event) => updateField("inStock", event.target.checked)}
              className="h-4 w-4"
            />
            In stock
          </label>

          <div className="mt-4 space-y-4">
            <Field label="Short Description">
              <input
                value={form.shortDescription}
                onChange={(event) => updateField("shortDescription", event.target.value)}
                placeholder="Premium festive wear"
                className={inputClass}
              />
            </Field>

            <Field label="Full Description">
              <textarea
                value={form.fullDescription}
                onChange={(event) => updateField("fullDescription", event.target.value)}
                rows={5}
                placeholder="Fabric, size, fit, care, and styling details"
                className={`${inputClass} resize-none`}
              />
            </Field>
          </div>
        </Panel>

        {/* ── IMAGES / MEDIA ── */}
        <Panel title="Product Images & Media" icon={ImagePlus}>
          <p className="text-xs text-stone-500 mb-4">
            Paste a URL or upload an image/video from your computer. The first image will be used as the main product image.
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            {form.images.map((image, index) => (
              <MediaUpload
                key={index}
                label="Media"
                index={index}
                value={image}
                onChange={(val) => updateImage(index, val)}
                accept="image/*,video/*"
              />
            ))}
          </div>

          {/* Preview strip */}
          {form.images.some(Boolean) && (
            <div className="mt-4 pt-4 border-t border-stone-100">
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Preview</p>
              <div className="flex gap-2">
                {form.images.filter(Boolean).map((img, i) => (
                  img.includes('video') || img.includes('.mp4') ? (
                    <video key={i} src={img} className="w-16 h-16 rounded object-cover border border-stone-200" />
                  ) : (
                    <img key={i} src={img} alt={`preview-${i}`} className="w-16 h-16 rounded object-cover border border-stone-200" onError={e => e.target.style.display='none'} />
                  )
                ))}
              </div>
            </div>
          )}
        </Panel>
      </div>

      <aside className="space-y-4">
        <Panel title="Optional Review" icon={Star}>
          <div className="space-y-3">
            <Field label="Reviewer Name">
              <input
                value={form.reviewerName}
                onChange={(event) => updateField("reviewerName", event.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Rating (1-5)">
              <input
                type="number"
                min="1"
                max="5"
                value={form.rating}
                onChange={(event) => updateField("rating", event.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Review Text">
              <textarea
                value={form.reviewText}
                onChange={(event) => updateField("reviewText", event.target.value)}
                rows={4}
                className={`${inputClass} resize-none`}
              />
            </Field>
          </div>
        </Panel>

        {(message || error) && (
          <div className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
            error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}>
            {error || message}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-stone-950 px-4 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-stone-800 disabled:opacity-60"
        >
          <Save size={17} />
          {saving ? "Saving..." : "Save Product"}
        </button>
      </aside>
    </form>
  );
}

const inputClass = "w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-950 outline-none focus:border-stone-950 disabled:bg-stone-100";

function Panel({ title, icon: Icon, children }) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        {Icon && <Icon size={18} />}
        <h2 className="text-base font-black text-stone-950">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-stone-500">
        {label}{required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}
