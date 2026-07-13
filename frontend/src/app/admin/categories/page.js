'use client';
import { useState, useEffect } from 'react';
import { getStoredAuth } from '../adminApi';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import MediaUpload from '@/components/MediaUpload';

const GROUPS = ['Fine Jewellery', 'Bridal', 'Gifting'];
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const EMPTY_FORM = { name: '', slug: '', group_label: 'Fine Jewellery', image_url: '', sort_order: 0, is_active: true };

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [filterGroup, setFilterGroup] = useState('All');

    const { token } = getStoredAuth();

    useEffect(() => { fetchCategories(); }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${BASE_URL}/categories/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setCategories(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); };
    const openEdit = (cat) => { setForm({ name: cat.name, slug: cat.slug, group_label: cat.group_label, image_url: cat.image_url || '', sort_order: cat.sort_order || 0, is_active: cat.is_active }); setEditId(cat.id); setShowForm(true); };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = editId ? `${BASE_URL}/categories/${editId}` : `${BASE_URL}/categories`;
            const method = editId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                await fetchCategories();
                setShowForm(false);
                setEditId(null);
            }
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Delete the category "${name}"?`)) return;
        try {
            await fetch(`${BASE_URL}/categories/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            setCategories(prev => prev.filter(c => c.id !== id));
        } catch (err) { console.error(err); }
    };

    const toggleActive = async (cat) => {
        try {
            await fetch(`${BASE_URL}/categories/${cat.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ ...cat, is_active: !cat.is_active }),
            });
            setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, is_active: !c.is_active } : c));
        } catch (err) { console.error(err); }
    };

    const filtered = filterGroup === 'All' ? categories : categories.filter(c => c.group_label === filterGroup);

    const stats = {
        total: categories.length,
        fine: categories.filter(c => c.group_label === 'Fine Jewellery').length,
        bridal: categories.filter(c => c.group_label === 'Bridal').length,
        gifting: categories.filter(c => c.group_label === 'Gifting').length,
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800" /></div>;

    return (
        <div className="space-y-6">

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Total', value: stats.total, color: 'bg-stone-800 text-white' },
                    { label: 'Fine Jewellery', value: stats.fine, color: 'bg-amber-50 text-amber-700' },
                    { label: 'Bridal', value: stats.bridal, color: 'bg-rose-50 text-rose-700' },
                    { label: 'Gifting', value: stats.gifting, color: 'bg-teal-50 text-teal-700' },
                ].map(s => (
                    <div key={s.label} className={`rounded-xl p-4 ${s.color} border border-black/5`}>
                        <p className="text-2xl font-black">{s.value}</p>
                        <p className="text-xs font-semibold opacity-70 mt-0.5 uppercase tracking-wider">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-xl border border-stone-200 p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex gap-2">
                    {['All', ...GROUPS].map(g => (
                        <button key={g} onClick={() => setFilterGroup(g)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${filterGroup === g ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
                            {g}
                        </button>
                    ))}
                </div>
                <button onClick={openAdd}
                    className="flex items-center gap-2 bg-stone-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-stone-700 transition">
                    <Plus size={16} /> Add Category
                </button>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white rounded-xl border border-stone-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-black text-stone-800 uppercase tracking-wider text-sm">
                            {editId ? 'Edit Category' : 'Add New Category'}
                        </h3>
                        <button onClick={() => setShowForm(false)} className="text-stone-400 hover:text-stone-600"><X size={18} /></button>
                    </div>
                    <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Name *</label>
                            <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                placeholder="e.g. Diamond Rings"
                                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Slug *</label>
                            <input required value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                                placeholder="e.g. diamond-rings"
                                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Group *</label>
                            <select required value={form.group_label} onChange={e => setForm(p => ({ ...p, group_label: e.target.value }))}
                                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300">
                                {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <MediaUpload
                                label="Category Image"
                                value={form.image_url}
                                onChange={val => setForm(p => ({ ...p, image_url: val }))}
                                accept="image/*"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Sort Order</label>
                            <input type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: +e.target.value }))}
                                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300" />
                        </div>

                        <div className="sm:col-span-full flex gap-3">
                            <button type="submit" disabled={saving}
                                className="bg-stone-800 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-stone-700 transition disabled:opacity-60 flex items-center gap-2">
                                <Check size={16} /> {saving ? 'Saving...' : editId ? 'Update' : 'Add Category'}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)}
                                className="border border-stone-200 px-6 py-2 rounded-lg text-sm font-bold text-stone-600 hover:bg-stone-50 transition">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Categories Table */}
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-stone-50 border-b border-stone-200">
                            {['Image', 'Name', 'Slug', 'Group', 'Sort', 'Active', 'Actions'].map(h => (
                                <th key={h} className="text-left px-4 py-3 text-xs font-black uppercase tracking-wider text-stone-500">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {filtered.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-10 text-stone-400">No categories found.</td></tr>
                        ) : filtered.map(cat => (
                            <tr key={cat.id} className="hover:bg-stone-50 transition">
                                <td className="px-4 py-3">
                                    {cat.image_url ? (
                                        <img src={cat.image_url} alt={cat.name} className="w-10 h-10 rounded-full object-cover border border-stone-200" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 text-xs">No img</div>
                                    )}
                                </td>
                                <td className="px-4 py-3 font-semibold text-stone-800">{cat.name}</td>
                                <td className="px-4 py-3 text-stone-500 text-xs font-mono">{cat.slug}</td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                        cat.group_label === 'Men' ? 'bg-amber-100 text-amber-700' :
                                        cat.group_label === 'Women' ? 'bg-rose-100 text-rose-700' :
                                        'bg-teal-100 text-teal-700'
                                    }`}>{cat.group_label}</span>
                                </td>
                                <td className="px-4 py-3 text-stone-500">{cat.sort_order}</td>
                                <td className="px-4 py-3">
                                    <button onClick={() => toggleActive(cat)}
                                        className={`w-10 h-5 rounded-full transition-all relative ${cat.is_active ? 'bg-green-500' : 'bg-stone-200'}`}>
                                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${cat.is_active ? 'left-5' : 'left-0.5'}`} />
                                    </button>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button onClick={() => openEdit(cat)}
                                            className="text-stone-400 hover:text-stone-700 border border-stone-200 p-1.5 rounded-lg hover:border-stone-400 transition">
                                            <Pencil size={13} />
                                        </button>
                                        <button onClick={() => handleDelete(cat.id, cat.name)}
                                            className="text-stone-400 hover:text-red-600 border border-stone-200 p-1.5 rounded-lg hover:border-red-300 transition">
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="px-4 py-3 border-t border-stone-100 bg-stone-50">
                    <p className="text-xs text-stone-400">{filtered.length} categories shown</p>
                </div>
            </div>
        </div>
    );
}
