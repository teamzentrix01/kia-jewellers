"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, Users } from "lucide-react";
import { adminFetch, formatDate } from "../adminApi";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCustomers = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await adminFetch("/api/admin/customers");
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filtered = useMemo(() => {
    return customers.filter((user) => {
      const matchesSearch = `${user.email} ${user.displayName}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesRole = role === "all" || user.role === role;
      return matchesSearch && matchesRole;
    });
  }, [customers, role, search]);

  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users size={18} />
            <h2 className="text-base font-black text-stone-950">Users From Database</h2>
          </div>
          <p className="mt-1 text-xs font-semibold text-stone-500">{filtered.length} users shown</p>
        </div>

        <button
          type="button"
          onClick={loadCustomers}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-stone-300 px-3 py-2 text-xs font-bold uppercase tracking-wider text-stone-700 hover:bg-stone-50"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px]">
        <label className="relative block">
          <Search className="absolute left-3 top-2.5 text-stone-400" size={16} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search email"
            className="w-full rounded-lg border border-stone-300 py-2 pl-9 pr-3 text-sm font-semibold outline-none focus:border-stone-950"
          />
        </label>

        <select
          value={role}
          onChange={(event) => setRole(event.target.value)}
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm font-semibold outline-none focus:border-stone-950"
        >
          <option value="all">All roles</option>
          <option value="admin">Admins</option>
          <option value="user">Customers</option>
        </select>
      </div>

      {loading && <EmptyText>Loading users...</EmptyText>}
      {error && <EmptyText>{error}</EmptyText>}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-xs font-black uppercase tracking-widest text-stone-500">
                <th className="px-3 py-3">ID</th>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3">Role</th>
                <th className="px-3 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((user) => (
                <tr key={user.id} className="text-sm">
                  <td className="px-3 py-3 font-bold text-stone-500">#{user.id}</td>
                  <td className="px-3 py-3">
                    <p className="font-black text-stone-950">{user.email}</p>
                    <p className="text-xs font-semibold text-stone-500">{user.displayName}</p>
                  </td>
                  <td className="px-3 py-3">
                    <span className="rounded-lg bg-stone-100 px-2 py-1 text-xs font-black uppercase text-stone-700">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-semibold text-stone-600">{formatDate(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && <EmptyText>No matching users found.</EmptyText>}
        </div>
      )}
    </section>
  );
}

function EmptyText({ children }) {
  return <p className="rounded-lg border border-dashed border-stone-300 p-6 text-center text-sm font-semibold text-stone-500">{children}</p>;
}
