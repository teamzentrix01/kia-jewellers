"use client";

import { useEffect, useState } from "react";
import { AlertCircle, KeyRound, Save, ShieldCheck, UserRound } from "lucide-react";
import { adminFetch, formatDate } from "../adminApi";

export default function AdminProfilePage() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [profileData, statsData] = await Promise.all([
          adminFetch("/api/admin/profile"),
          adminFetch("/api/admin/stats"),
        ]);

        setProfile(profileData.user);
        setStats(statsData.summary);
        setForm((current) => ({ ...current, email: profileData.user.email || "" }));
      } catch (err) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (form.password && form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        email: form.email,
        password: form.password || undefined,
      };
      const data = await adminFetch("/api/admin/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setProfile(data.user);
      setForm({ email: data.user.email || "", password: "", confirmPassword: "" });
      setMessage("Profile saved from the live database.");

      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...savedUser, email: data.user.email, role: data.user.role }));
    } catch (err) {
      setError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Panel>Loading admin profile from database...</Panel>;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <Panel title="Admin Profile">
        {error && <Notice tone="error">{error}</Notice>}
        {message && <Notice tone="success">{message}</Notice>}

        <div className="mb-5 flex items-center gap-4 rounded-lg border border-stone-200 bg-stone-50 p-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-stone-950 text-lg font-black text-white">
            {profile?.initials || "AD"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-black text-stone-950">{profile?.email}</p>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-700">{profile?.role}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-stone-500">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-semibold outline-none focus:border-stone-950"
              required
            />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-stone-500">New Password</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-semibold outline-none focus:border-stone-950"
                placeholder="Leave blank to keep current"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-stone-500">Confirm Password</span>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-semibold outline-none focus:border-stone-950"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-stone-950 px-4 py-2 text-sm font-bold text-white hover:bg-stone-800 disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </Panel>

      <div className="space-y-4">
        <Panel title="Database Account Details">
          <div className="grid gap-3 md:grid-cols-2">
            <InfoCard icon={UserRound} label="User ID" value={profile?.id || "N/A"} />
            <InfoCard icon={ShieldCheck} label="Role" value={profile?.role || "admin"} />
            <InfoCard icon={KeyRound} label="Created" value={formatDate(profile?.createdAt)} />
            <InfoCard icon={UserRound} label="Customers" value={stats?.customers || 0} />
          </div>
        </Panel>

        <Panel title="Admin Scope">
          <div className="grid gap-3 md:grid-cols-3">
            <MiniStat label="Products" value={stats?.total_products || 0} />
            <MiniStat label="Orders" value={stats?.total_orders || 0} />
            <MiniStat label="Users" value={stats?.total_users || 0} />
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      {title && <h2 className="mb-4 text-base font-black text-stone-950">{title}</h2>}
      {children}
    </section>
  );
}

function Notice({ tone, children }) {
  const isError = tone === "error";
  return (
    <div
      className={`mb-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${
        isError
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {isError && <AlertCircle size={16} />}
      {children}
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-stone-200 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-500">
        <Icon size={15} />
        {label}
      </div>
      <p className="text-sm font-black text-stone-950">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-lg bg-stone-950 p-3 text-white">
      <p className="text-xs font-bold uppercase tracking-widest text-amber-200">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}
