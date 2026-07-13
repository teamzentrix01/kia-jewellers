"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  Home,
  LogOut,
  Mail,
  MapPin,
  Package,
  Phone,
  Save,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  UserRound,
} from "lucide-react";
import { addressApi, userApi, wishlistApi } from "@/lib/api";

const formatDate = (value) => {
  if (!value) return "Not available";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatMoney = (value) => `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const loadProfile = async () => {
      try {
        const [profileData, ordersData, wishlistData, addressData] = await Promise.all([
          userApi.getProfile(),
          userApi.getOrders(),
          wishlistApi.get(),
          addressApi.get(),
        ]);

        setUser(profileData);
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setWishlist(Array.isArray(wishlistData?.items) ? wishlistData.items : []);
        setAddresses(Array.isArray(addressData) ? addressData : []);
        setForm({
          name: profileData?.name || "",
          phone: profileData?.phone || "",
          email: profileData?.email || "",
          password: "",
        });
      } catch (err) {
        if (err.message?.includes("401")) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }
        setError(err.message || "Unable to load profile details.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const initials = useMemo(() => {
    const source = user?.name || user?.email || "KIA";
    return source
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }, [user]);

  const defaultAddress = addresses.find((address) => address.is_default) || addresses[0];
  const latestOrder = orders[0];
  const totalSpend = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);

  const handleSave = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);

    try {
      const payload = { ...form, password: form.password || undefined };
      const updated = await userApi.updateProfile(payload);
      setUser(updated);
      setForm((current) => ({ ...current, password: "" }));
      setMessage("Profile details saved.");

      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...savedUser, ...updated }));
      window.dispatchEvent(new Event("userLoggedIn"));
    } catch (err) {
      setError(err.message || "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("userLoggedIn"));
    router.push("/login");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8f4ed] px-5 py-16">
        <div className="mx-auto flex min-h-[420px] max-w-6xl items-center justify-center">
          <div className="h-11 w-11 animate-spin rounded-full border-2 border-[#d9c09a] border-t-[#201713]" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f4ed] text-[#201713]">
      <section className="border-b border-[#ded5ca] bg-[#fffdf9]">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[1fr_auto] md:items-end md:px-8">
          <div>
            <p className="section-kicker">My Account</p>
            <h1 className="section-title max-w-3xl">Profile Details</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#76685f]">
              Manage your personal details, saved addresses, orders, and wishlist in one refined account space.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#cdbb9f] px-4 text-xs font-bold uppercase tracking-[.18em] text-[#7b2e24] transition hover:border-[#7b2e24] hover:bg-[#fff7f2]"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-8 md:px-8 xl:grid-cols-[0.85fr_1.15fr]">
        <aside className="space-y-6">
          <section className="rounded-lg border border-[#ded5ca] bg-[#fffdf9] p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#201713] font-serif text-2xl text-[#dcc293]">
                {initials}
              </div>
              <div className="min-w-0">
                <h2 className="truncate font-serif text-2xl">{user?.name || "KIA Customer"}</h2>
                <p className="mt-1 truncate text-sm text-[#76685f]">{user?.email}</p>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-[.24em] text-[#a67c3d]">
                  Member since {formatDate(user?.created_at)}
                </p>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <Metric icon={Package} label="Orders" value={orders.length} />
            <Metric icon={Heart} label="Wishlist" value={wishlist.length} />
            <Metric icon={MapPin} label="Addresses" value={addresses.length} />
            <Metric icon={ShoppingBag} label="Total Spend" value={formatMoney(totalSpend)} compact />
          </section>

          <section className="rounded-lg border border-[#ded5ca] bg-[#fffdf9] p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-[#a67c3d]">
              <ShieldCheck size={16} />
              Account Details
            </div>
            <div className="space-y-3">
              <Detail icon={UserRound} label="Customer ID" value={user?.id} />
              <Detail icon={Mail} label="Email" value={user?.email} />
              <Detail icon={Phone} label="Phone" value={user?.phone || "Not added"} />
              <Detail icon={Sparkles} label="Joined" value={formatDate(user?.created_at)} />
            </div>
          </section>
        </aside>

        <div className="space-y-6">
          <section className="rounded-lg border border-[#ded5ca] bg-[#fffdf9] p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="section-kicker">Personal</p>
                <h2 className="font-serif text-2xl">Edit Profile</h2>
              </div>
            </div>

            {message && <Notice tone="success">{message}</Notice>}
            {error && <Notice tone="error">{error}</Notice>}

            <form onSubmit={handleSave} className="grid gap-4 md:grid-cols-2">
              <Field label="Full Name">
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="profile-input"
                  placeholder="Your name"
                />
              </Field>
              <Field label="Phone Number">
                <input
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  className="profile-input"
                  placeholder="10-digit number"
                />
              </Field>
              <Field label="Email Address">
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="profile-input"
                  placeholder="you@example.com"
                  required
                />
              </Field>
              <Field label="New Password">
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  className="profile-input"
                  placeholder="Leave blank to keep current"
                />
              </Field>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#201713] px-5 text-xs font-bold uppercase tracking-[.18em] text-white transition hover:bg-[#3a2923] disabled:opacity-60"
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <InfoPanel title="Default Address" actionHref="/dashboard?tab=Addresses" actionLabel="Manage">
              {defaultAddress ? (
                <div className="space-y-2 text-sm leading-6 text-[#5f554f]">
                  <p className="font-bold text-[#201713]">{defaultAddress.name}</p>
                  <p>{defaultAddress.address}, {defaultAddress.locality}</p>
                  <p>{defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}</p>
                  <p>{defaultAddress.phone}</p>
                </div>
              ) : (
                <EmptyCopy icon={Home} text="No saved address yet." href="/dashboard?tab=Addresses" label="Add address" />
              )}
            </InfoPanel>

            <InfoPanel title="Latest Order" actionHref="/orders" actionLabel="View All">
              {latestOrder ? (
                <div className="space-y-2 text-sm leading-6 text-[#5f554f]">
                  <p className="font-bold text-[#201713]">Order #{latestOrder.id}</p>
                  <p>{latestOrder.items_count} item{latestOrder.items_count === 1 ? "" : "s"} placed on {formatDate(latestOrder.created_at)}</p>
                  <p className="font-bold text-[#a67c3d]">{formatMoney(latestOrder.total_amount)}</p>
                  <span className="inline-flex rounded-full bg-[#f0e4d2] px-3 py-1 text-[10px] font-bold uppercase tracking-[.16em] text-[#725225]">
                    {latestOrder.status || "Pending"}
                  </span>
                </div>
              ) : (
                <EmptyCopy icon={Package} text="No orders placed yet." href="/" label="Start shopping" />
              )}
            </InfoPanel>
          </section>

          <section className="rounded-lg border border-[#ded5ca] bg-[#fffdf9] p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="font-serif text-2xl">Wishlist Preview</h2>
              <Link href="/dashboard?tab=Wishlist" className="text-xs font-bold uppercase tracking-[.18em] text-[#a67c3d]">
                View Wishlist
              </Link>
            </div>
            {wishlist.length ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {wishlist.slice(0, 3).map(({ wishlistId, product }) => (
                  <Link
                    key={wishlistId}
                    href={`/product/${product.id}`}
                    className="group rounded-lg border border-[#eadfce] bg-[#fbf8f2] p-3 transition hover:border-[#a67c3d]"
                  >
                    <div className="aspect-square overflow-hidden rounded-lg bg-[#eee4d5]">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[#a67c3d]">
                          <Heart size={32} />
                        </div>
                      )}
                    </div>
                    <p className="mt-3 truncate text-sm font-bold text-[#201713]">{product.name}</p>
                    <p className="mt-1 text-xs font-bold text-[#a67c3d]">{formatMoney(product.discountedPrice)}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyCopy icon={Heart} text="Your wishlist is waiting for a first favorite." href="/" label="Browse jewellery" />
            )}
          </section>
        </div>
      </div>

      <style jsx>{`
        .profile-input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #cdbb9f;
          background: #fbf8f2;
          padding: 0.75rem 0.85rem;
          font-size: 0.9rem;
          color: #201713;
          outline: none;
        }
        .profile-input:focus {
          border-color: #a67c3d;
          box-shadow: 0 0 0 3px rgba(166, 124, 61, 0.16);
        }
      `}</style>
    </main>
  );
}

function Metric({ icon: Icon, label, value, compact = false }) {
  return (
    <div className="rounded-lg border border-[#ded5ca] bg-[#fffdf9] p-4 shadow-sm">
      <Icon size={18} className="mb-3 text-[#a67c3d]" />
      <p className={`font-serif ${compact ? "text-xl" : "text-3xl"} leading-tight`}>{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-[.2em] text-[#76685f]">{label}</p>
    </div>
  );
}

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-[#fbf8f2] p-3">
      <Icon size={17} className="mt-0.5 shrink-0 text-[#a67c3d]" />
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#8c7a6e]">{label}</p>
        <p className="truncate text-sm font-semibold text-[#201713]">{value || "Not available"}</p>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[.2em] text-[#76685f]">{label}</span>
      {children}
    </label>
  );
}

function Notice({ tone, children }) {
  const styles = tone === "success"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-red-200 bg-red-50 text-red-700";

  return <div className={`mb-4 rounded-lg border px-3 py-2 text-sm font-semibold ${styles}`}>{children}</div>;
}

function InfoPanel({ title, actionHref, actionLabel, children }) {
  return (
    <section className="rounded-lg border border-[#ded5ca] bg-[#fffdf9] p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-serif text-2xl">{title}</h2>
        <Link href={actionHref} className="text-[10px] font-bold uppercase tracking-[.18em] text-[#a67c3d]">
          {actionLabel}
        </Link>
      </div>
      {children}
    </section>
  );
}

function EmptyCopy({ icon: Icon, text, href, label }) {
  return (
    <div className="rounded-lg border border-dashed border-[#cdbb9f] bg-[#fbf8f2] p-5 text-center">
      <Icon size={28} className="mx-auto mb-3 text-[#a67c3d]" />
      <p className="text-sm font-semibold text-[#76685f]">{text}</p>
      <Link href={href} className="mt-3 inline-block text-[10px] font-bold uppercase tracking-[.18em] text-[#201713]">
        {label}
      </Link>
    </div>
  );
}
