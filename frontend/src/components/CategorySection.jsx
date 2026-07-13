"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const GROUP_ACCENTS = {
  Men:   { color: "#8b7355", light: "#f5f0e8", href: "/men-store",   label: "HIS EDIT" },
  Women: { color: "#9b6b5a", light: "#fdf4f2", href: "/women-store", label: "HER EDIT" },
  Kids:  { color: "#5a7a6e", light: "#f0f7f5", href: "/kids-store",  label: "LITTLE ONES" },
};

export default function CategorySection() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/categories`)
      .then(r => r.json())
      .then(data => {
        const grouped = {};
        (Array.isArray(data) ? data : []).forEach(cat => {
          if (!grouped[cat.group_label]) grouped[cat.group_label] = [];
          grouped[cat.group_label].push(cat);
        });
        const order = ['Men', 'Women', 'Kids'];
        const result = order
          .filter(g => grouped[g])
          .map(g => ({
            label: g,
            accent: GROUP_ACCENTS[g]?.color || '#8b7355',
            light: GROUP_ACCENTS[g]?.light || '#fdfaf4',
            editLabel: GROUP_ACCENTS[g]?.label || g.toUpperCase(),
            href: GROUP_ACCENTS[g]?.href || `/${g.toLowerCase()}-store`,
            categories: grouped[g].map(cat => ({
              name: cat.name,
              img: cat.image_url || '/placeholder.jpg',
              href: `/${g.toLowerCase()}-store?subcategory=${cat.slug}`,
            })),
          }));
        setGroups(result);
        if (result.length > 0) setActiveGroup(result[0].label);
      })
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  }, []);

  // ── LOADING ──────────────────────────────────────────────────────────────
  if (loading) return (
    <section style={{ background: "#fdfaf4", padding: "56px 0" }}>
      <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "0 56px" }}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "40px" }}>
          {[80, 64, 72].map((w, i) => (
            <div key={i} style={{ height: "36px", width: `${w}px`, background: "rgba(26,20,16,0.08)", borderRadius: "2px" }} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "20px" }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "100px", height: "100px", borderRadius: "50%", background: "rgba(26,20,16,0.06)" }} />
              <div style={{ width: "60px", height: "10px", background: "rgba(26,20,16,0.06)", borderRadius: "2px" }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  if (groups.length === 0) return null;

  const active = groups.find(g => g.label === activeGroup) || groups[0];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

        .cat-section {
          background: #fdfaf4;
          padding: 56px 0 64px;
          position: relative;
          overflow: hidden;
        }

        /* faint diagonal texture */
        .cat-section::before {
          content: '';
          position: absolute; inset: 0;
          background-image: repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 40px,
            rgba(201,169,110,0.03) 40px,
            rgba(201,169,110,0.03) 41px
          );
          pointer-events: none;
        }

        .cat-inner {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 56px;
          position: relative;
        }

        @media (max-width: 768px) {
          .cat-inner { padding: 0 20px; }
          .cat-section { padding: 40px 0 48px; }
        }

        /* ── HEADER ── */
        .cat-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 36px;
        }

        .cat-title-block {}
        .cat-eyebrow {
          font-family: 'Jost', sans-serif;
          font-size: 9px; font-weight: 600;
          letter-spacing: 0.55em; text-transform: uppercase;
          color: #c9a96e; margin-bottom: 8px; display: block;
        }
        .cat-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.6rem, 3vw, 2.4rem);
          font-weight: 300; color: #1a1410; line-height: 1.1;
          margin: 0;
        }
        .cat-title em { font-style: italic; color: #8b7355; }

        /* ── TAB SWITCHER ── */
        .cat-tabs {
          display: flex;
          gap: 2px;
          background: rgba(26,20,16,0.06);
          padding: 3px;
          border-radius: 3px;
        }
        .cat-tab {
          font-family: 'Jost', sans-serif;
          font-size: 10px; font-weight: 600;
          letter-spacing: 0.3em; text-transform: uppercase;
          padding: 8px 20px; border: none; cursor: pointer;
          border-radius: 2px;
          transition: all 0.25s ease;
          position: relative;
          background: transparent;
          color: rgba(26,20,16,0.4);
        }
        .cat-tab.active {
          background: #1a1410;
          color: #f5efe6;
        }
        .cat-tab:not(.active):hover {
          color: #1a1410;
          background: rgba(26,20,16,0.06);
        }

        /* ── SECTION LABEL BAR ── */
        .cat-group-bar {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 28px;
        }
        .cat-group-label {
          font-family: 'Jost', sans-serif;
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.45em; text-transform: uppercase;
          white-space: nowrap;
        }
        .cat-group-line {
          flex: 1; height: 1px;
          background: linear-gradient(to right, rgba(26,20,16,0.15), transparent);
        }
        .cat-group-see-all {
          font-family: 'Jost', sans-serif;
          font-size: 9px; font-weight: 500;
          letter-spacing: 0.3em; text-transform: uppercase;
          color: rgba(26,20,16,0.3);
          text-decoration: none; white-space: nowrap;
          transition: color 0.2s;
          border-bottom: 1px solid transparent;
          padding-bottom: 1px;
        }
        .cat-group-see-all:hover {
          color: #c9a96e;
          border-bottom-color: #c9a96e;
        }

        /* ── GRID ── */
        .cat-grid {
          display: flex;
          flex-wrap: nowrap;
          justify-content: space-between;
          align-items: flex-start;
          overflow-x: auto;
          padding-bottom: 4px;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .cat-grid::-webkit-scrollbar { display: none; }

        .cat-grid > * {
          flex: 1;
          min-width: 80px;
          display: flex;
          justify-content: center;
        }

        @media (max-width: 640px) {
          .cat-grid {
            flex-wrap: wrap;
            justify-content: space-around;
            overflow-x: hidden;
            gap: 20px 0;
          }
          .cat-grid > * {
            flex: 0 0 25%;
            min-width: 0;
          }
        }

        /* ── CARD ── */
        .cat-card {
          display: flex; flex-direction: column;
          align-items: center; gap: 10px;
          text-decoration: none; cursor: pointer;
        }

        .cat-img-ring {
          position: relative;
          width: 96px; height: 96px;
          border-radius: 50%;
          overflow: hidden;
          transition: transform 0.4s cubic-bezier(.22,1,.36,1), box-shadow 0.4s ease;
          box-shadow: 0 4px 16px rgba(26,20,16,0.1);
        }

        @media (max-width: 640px) {
          .cat-img-ring { width: 76px; height: 76px; }
        }

        .cat-card:hover .cat-img-ring {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(26,20,16,0.18);
        }

        .cat-img-ring img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.6s cubic-bezier(.22,1,.36,1);
        }
        .cat-card:hover .cat-img-ring img {
          transform: scale(1.1);
        }

        /* gold ring on hover */
        .cat-img-ring::after {
          content: '';
          position: absolute; inset: 0;
          border-radius: 50%;
          border: 2px solid rgba(201,169,110,0);
          transition: border-color 0.3s ease, inset 0.3s ease;
        }
        .cat-card:hover .cat-img-ring::after {
          border-color: rgba(201,169,110,0.7);
          inset: 2px;
        }

        /* overlay shimmer */
        .cat-img-overlay {
          position: absolute; inset: 0;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(201,169,110,0.22), rgba(184,92,56,0.14));
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .cat-card:hover .cat-img-overlay { opacity: 1; }

        .cat-name {
          font-family: 'Jost', sans-serif;
          font-size: 10px; font-weight: 500;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: #1a1410; text-align: center;
          line-height: 1.3; max-width: 90px;
          transition: color 0.2s;
        }
        .cat-card:hover .cat-name { color: #c9a96e; }

        /* ── BOTTOM ORNAMENT ── */
        .cat-ornament {
          display: flex; align-items: center; gap: 16px;
          margin-top: 48px;
        }
        .cat-ornament-line {
          flex: 1; height: 1px;
          background: linear-gradient(to right, transparent, rgba(201,169,110,0.4), transparent);
        }
        .cat-ornament-diamond {
          width: 6px; height: 6px;
          background: #c9a96e;
          transform: rotate(45deg);
          opacity: 0.6;
        }

        /* ── MOBILE TABS ── */
        @media (max-width: 640px) {
          .cat-header { flex-direction: column; align-items: flex-start; gap: 16px; }
          .cat-tabs { width: 100%; }
          .cat-tab { flex: 1; text-align: center; padding: 8px 10px; }
        }
      `}</style>

      <section className="cat-section">
        <div className="cat-inner">

          {/* ── HEADER ── */}
          <div className="cat-header">
            <div className="cat-title-block">
              <span className="cat-eyebrow">Discover</span>
              <h2 className="cat-title">Shop by <em>Category</em></h2>
            </div>

            {/* Tab Switcher */}
            <div className="cat-tabs">
              {groups.map(g => (
                <button
                  key={g.label}
                  className={`cat-tab ${activeGroup === g.label ? 'active' : ''}`}
                  onClick={() => setActiveGroup(g.label)}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── ACTIVE GROUP ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Group Label Bar */}
              <div className="cat-group-bar">
                <span className="cat-group-label" style={{ color: active.accent }}>
                  {active.editLabel}
                </span>
                <div className="cat-group-line" />
                <Link href={active.href} className="cat-group-see-all">
                  View All →
                </Link>
              </div>

              {/* Category Grid */}
              <div className="cat-grid">
                {active.categories.map((cat, idx) => (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link href={cat.href} className="cat-card">
                      <div className="cat-img-ring">
                        <img src={cat.img} alt={cat.name} loading="lazy" />
                        <div className="cat-img-overlay" />
                      </div>
                      <span className="cat-name">{cat.name}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* ── BOTTOM ORNAMENT ── */}
          <div className="cat-ornament">
            <div className="cat-ornament-line" />
            <div className="cat-ornament-diamond" />
            <div className="cat-ornament-line" />
          </div>

        </div>
      </section>
    </>
  );
}