"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, Boxes, ClipboardList, Layers, RefreshCw, Users } from "lucide-react";
import { adminFetch, formatDate, formatMoney, productImage, productPrice } from "./adminApi";

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const dashboard = await adminFetch("/api/admin/stats");
      setData(dashboard);
    } catch (err) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return <Panel>Loading live database stats...</Panel>;
  }

  if (error) {
    return (
      <Panel>
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle size={18} />
          <span className="font-semibold">{error}</span>
        </div>
      </Panel>
    );
  }

  const summary = data?.summary || {};
  const cards = [
    {
      label: "Products",
      value: summary.total_products || 0,
      note: `${summary.in_stock_products || 0} in stock`,
      icon: Boxes,
    },
    {
      label: "Orders",
      value: summary.total_orders || 0,
      note: `${summary.pending_orders || 0} pending`,
      icon: ClipboardList,
    },
    {
      label: "Revenue",
      value: formatMoney(summary.total_revenue),
      note: "From orders table",
      icon: Layers,
    },
    {
      label: "Customers",
      value: summary.customers || 0,
      note: `${summary.admin_users || 0} admins`,
      icon: Users,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, note, icon: Icon }) => (
          <div key={label} className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-stone-500">{label}</p>
                <p className="mt-2 text-2xl font-black text-stone-950">{value}</p>
                <p className="mt-1 text-xs font-semibold text-stone-500">{note}</p>
              </div>
              <div className="rounded-lg bg-amber-100 p-2 text-amber-800">
                <Icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel
          title="Recent Products"
          action={
            <Link href="/admin/manage" className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Manage
            </Link>
          }
        >
          <div className="divide-y divide-stone-100">
            {(data?.recentProducts || []).map((product) => (
              <div key={product.id} className="flex items-center gap-3 py-3">
                <ProductThumb product={product} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-stone-950">{product.name}</p>
                  <p className="text-xs font-semibold uppercase text-stone-500">
                    {product.category || "general"} / {product.sub_category || "general"}
                  </p>
                </div>
                <div className="text-sm font-black text-stone-800">{formatMoney(productPrice(product))}</div>
              </div>
            ))}
            {data?.recentProducts?.length === 0 && <EmptyText>No products in the database yet.</EmptyText>}
          </div>
        </Panel>

        <Panel
          title="Recent Orders"
          action={
            <Link href="/admin/orders" className="text-xs font-bold uppercase tracking-wider text-amber-700">
              View all
            </Link>
          }
        >
          <div className="divide-y divide-stone-100">
            {(data?.recentOrders || []).map((order) => (
              <div key={order.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-black text-stone-950">Order #{order.id}</p>
                  <p className="truncate text-xs font-semibold text-stone-500">
                    {order.user_name} / {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-stone-800">{formatMoney(order.total_amount)}</p>
                  <p className="text-xs font-bold uppercase text-emerald-700">{order.status}</p>
                </div>
              </div>
            ))}
            {data?.recentOrders?.length === 0 && <EmptyText>No orders found in the database.</EmptyText>}
          </div>
        </Panel>
      </div>

      <Panel
        title="Category Breakdown"
        action={
          <button
            type="button"
            onClick={loadDashboard}
            className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-3 py-2 text-xs font-bold uppercase tracking-wider text-stone-700 hover:bg-stone-50"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        }
      >
        <div className="grid gap-2 md:grid-cols-3">
          {(data?.categories || []).map((item) => (
            <div key={item.category} className="rounded-lg border border-stone-200 p-3">
              <p className="text-xs font-bold uppercase tracking-widest text-stone-500">{item.category}</p>
              <p className="mt-1 text-xl font-black text-stone-950">{item.count}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Panel({ title, action, children }) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {title && <h2 className="text-base font-black text-stone-950">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

function ProductThumb({ product }) {
  const src = productImage(product);

  if (!src) {
    return <div className="h-12 w-12 rounded-lg bg-stone-100" />;
  }

  return (
    <img
      src={src}
      alt={product.name}
      className="h-12 w-12 rounded-lg border border-stone-200 object-cover"
    />
  );
}

function EmptyText({ children }) {
  return <p className="py-6 text-center text-sm font-semibold text-stone-500">{children}</p>;
}
