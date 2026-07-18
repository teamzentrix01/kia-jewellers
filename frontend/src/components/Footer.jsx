import Link from "next/link";
const columns = {
  Collections: [
    ["New Arrivals", "/category/new-arrivals"],
    ["Rings", "/category/rings"],
    ["Earrings", "/category/earrings"],
    ["Necklaces", "/category/necklaces"],
    ["Bridal", "/category/bridal"],
  ],
  Assistance: [
    ["My Account", "/dashboard"],
    ["Track Order", "/orders"],
    ["Shipping & Exchange", "#"],
    ["Jewellery Care", "#"],
    ["Contact Us", "#"],
  ],
};
export default function Footer() {
  return (
    <footer className="bg-[#1b110f] px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-14 text-[#baa99d] sm:px-6 md:px-14 md:pt-20">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-14 border-b border-white/10 pb-16 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <h2 className="font-serif text-4xl tracking-[.18em] text-white">
              KIA
            </h2>
            <p className="mt-1 text-[8px] uppercase tracking-[.6em] text-[#d5b77e]">
              Jewellers
            </p>
            <p className="mt-7 max-w-sm text-sm leading-7">
              Modern heirlooms, imagined in India and made by hand. Jewellery
              for stories worth keeping.
            </p>
            <div className="mt-8 flex max-w-md border-b border-white/25">
              <input
                placeholder="Your email address"
                className="w-full bg-transparent py-3 text-xs outline-none"
              />
              <button className="text-[9px] font-bold uppercase tracking-[.22em] text-white">
                Join us
              </button>
            </div>
          </div>
          {Object.entries(columns).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-6 text-[9px] font-bold uppercase tracking-[.3em] text-[#d5b77e]">
                {title}
              </h3>
              <div className="flex flex-col gap-4">
                {links.map(([name, path]) => (
                  <Link
                    key={name}
                    href={path}
                    className="text-xs hover:text-white"
                  >
                    {name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col justify-between gap-4 pt-7 text-[8px] uppercase tracking-[.2em] text-white/35 md:flex-row">
          <span>© 2026 KIA Fashion. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="#">Privacy</Link>
            <Link href="#">Terms</Link>
            <Link href="#">Instagram</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
