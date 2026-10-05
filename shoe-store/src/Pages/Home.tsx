import { useEffect, useState, type SyntheticEvent } from "react";
import { NavLink } from "react-router-dom";
import ProductCard from "../Components/ProductCard";
import SkelentonCard from "../Components/SkelentonCard";
import Pagination from "../Components/Pagination";
import Reveal from "../Components/Reveal";
import api from "../api/api";
import type { Product } from "../types/product";

// Shown only for the second before the API answers, so the page never opens
// on empty boxes. These files already live in /public/images.
const FALLBACKS = [
  "/images/Air-Max-270.jpg",
  "/images/Ultraboost.jpg",
  "/images/RS-Dreamer.jpg",
  "/images/Blazer-Mid.jfif",
];

// A couple of the seeded Unsplash URLs are dead (they 404). Rather than
// letting the browser draw its broken-image icon, hide the <img> and let
// the grey panel behind it show through.
const hideOnError = (event: SyntheticEvent<HTMLImageElement>) => {
  event.currentTarget.style.visibility = "hidden";
};

function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all products once when the Home page first mounts (empty `[]`
  // dependency array). `loading` flips to false in `finally` so it's
  // cleared whether the request succeeds or fails.
  useEffect(() => {
    const getProducts = async () => {
      try {
        const res = await api.get<Product[]>("/products");
        setProducts(res.data);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, []);

  const start = (currentPage - 1) * itemsPerPage;
  const paged = products.slice(start, start + itemsPerPage);

  // Every product carries four photos. Flattening them gives ~80 images to
  // build the page out of, so nothing here is a stock photo — it is all
  // stock that is genuinely in the shop.
  // flatMap maps each product to its `images` array, then flattens all
  // those arrays into one single array (instead of an array of arrays).
  const allImages: string[] = products.flatMap((p) => p.images || []);

  // ONE width for every image on the page, on purpose.
  //
  // The seed reuses only ~18 distinct photos across all 80 image slots, so
  // asking for a single size means the browser fetches each one once and
  // reuses it everywhere else. Requesting a "perfect" width per slot looks
  // like an optimisation but splits those 18 files into ~50 separate URLs,
  // none of which can share a cache entry — and Unsplash starts dropping
  // requests well before the last one arrives.
  const sized = (url: string | undefined): string | undefined =>
    typeof url === "string" && url.includes("images.unsplash.com")
      ? url.replace(/([?&])w=\d+/, "$1w=800")
      : url;

  const pick = (index: number, fallbackIndex = 0): string =>
    sized(allImages[index]) || FALLBACKS[fallbackIndex % FALLBACKS.length];

  const firstOf = (category: string): string | undefined =>
    sized(products.find((p) => p.category === category)?.images?.[0]);

  const countOf = (category: string): number =>
    products.filter((p) => p.category === category).length;

  const brands = [...new Set(products.map((p) => p.brand))];

  const scrollToProducts = () =>
    document.getElementById("all-sneakers")?.scrollIntoView({ behavior: "smooth" });

  // Each entry is a fixed-size [value, label] pair (a "tuple"). Written as
  // an array of arrays here purely so it can be `.map()`-ed over in the JSX
  // below instead of repeating near-identical markup three times.
  const stats: Array<[string | number, string]> = [
    [loading ? "—" : products.length, "Styles in stock"],
    ["2 days", "Average delivery"],
    ["30 days", "Free returns"],
  ];

  const whyBother: Array<[string, string]> = [
    ["Checked by hand", "Every single box, before it ships."],
    ["Ships same day", "If you order before 2pm on a weekday."],
    ["Wear them in", "30 days to change your mind. We pay postage."],
  ];

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="mx-auto max-w-7xl overflow-hidden px-6 pt-14 pb-20 lg:px-20 lg:pt-24 lg:pb-28">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-red-600">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
              New season drop
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-[1.03] tracking-tight text-gray-900 text-balance sm:text-5xl lg:text-6xl">
              Sneakers that
              <br />
              keep up with you.
            </h1>

            <p className="mt-5 max-w-md text-lg leading-relaxed text-gray-500">
              Every pair checked by hand before it leaves us. If they don't feel
              right on your feet, send them back — we'll cover it.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={scrollToProducts}
                className="rounded-lg bg-red-500 px-8 py-3.5 font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/25 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                Shop all
              </button>

              <NavLink
                to="/category/men"
                className="group inline-flex items-center gap-2 rounded-lg border border-gray-300 px-8 py-3.5 font-semibold text-gray-900 transition-colors hover:border-gray-900"
              >
                Browse men's
                <span className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none">
                  &rarr;
                </span>
              </NavLink>
            </div>

            <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-5 border-t border-gray-100 pt-8">
              {stats.map(([value, label]) => (
                <div key={label}>
                  <dt className="text-2xl font-bold text-gray-900">{value}</dt>
                  <dd className="mt-0.5 text-sm text-gray-500">{label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          {/* Three real product photos, drifting at different speeds so the
              cluster never lines up the same way twice. */}
          <Reveal delay={120}>
            <div className="relative h-[380px] sm:h-[460px] lg:h-[520px]">
              <div className="absolute -right-6 top-6 h-44 w-44 rounded-full bg-red-100 blur-2xl sm:h-64 sm:w-64" />

              <img
                src={pick(0, 0)}
                alt="Featured sneaker"
                onError={hideOnError}
                className="absolute left-0 top-6 w-[58%] animate-float rounded-3xl object-cover shadow-2xl motion-reduce:animate-none aspect-square"
              />
              <img
                src={pick(5, 1)}
                alt=""
                aria-hidden="true"
                onError={hideOnError}
                className="absolute right-0 top-0 w-[44%] animate-float rounded-3xl object-cover shadow-xl [animation-delay:1.4s] motion-reduce:animate-none aspect-[4/5]"
              />
              <img
                src={pick(9, 2)}
                alt=""
                aria-hidden="true"
                onError={hideOnError}
                className="absolute bottom-0 right-[8%] w-[46%] animate-float rounded-3xl object-cover shadow-xl [animation-delay:2.8s] motion-reduce:animate-none aspect-[5/4]"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ MARQUEE ============ */}
      <section className="overflow-hidden border-y border-gray-100 bg-gray-50 py-8">
        {/* The list is rendered twice and the animation stops at -50%, so the
            loop restarts on an identical frame and never visibly jumps. */}
        <div className="flex w-max animate-marquee gap-4 hover:[animation-play-state:paused] motion-reduce:animate-none">
          {[...Array(2)].map((_, copy) => (
            <div key={copy} className="flex shrink-0 gap-4" aria-hidden={copy === 1}>
              {(allImages.length ? allImages.slice(0, 10) : FALLBACKS).map((src, i) => (
                <img
                  key={`${copy}-${i}`}
                  src={sized(src)}
                  alt=""
                  loading="lazy"
                  onError={hideOnError}
                  className="h-28 w-36 shrink-0 rounded-xl object-cover grayscale transition-all duration-500 hover:grayscale-0 sm:h-36 sm:w-48"
                />
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ============ CATEGORIES ============ */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-20 lg:py-28">
        <Reveal>
          <div className="mb-10 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-500">
              Shop by category
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
              Find your fit
            </h2>
          </div>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2">
          {[
            { to: "/category/men", label: "Men", copy: "Runners, court classics and everyday trainers.", img: firstOf("men") },
            { to: "/category/women", label: "Women", copy: "Lightweight silhouettes built for long days.", img: firstOf("women") },
          ].map((cat, i) => (
            <Reveal key={cat.to} delay={i * 110}>
              <NavLink
                to={cat.to}
                className="group relative block h-72 overflow-hidden rounded-3xl bg-gray-900 shadow-lg shadow-gray-900/5 ring-1 ring-gray-900/5 transition-shadow duration-300 hover:shadow-xl hover:shadow-red-500/10 sm:h-96"
              >
                <img
                  src={cat.img || FALLBACKS[i]}
                  alt=""
                  onError={hideOnError}
                  className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-700 ease-out group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
                {/* Gradient rather than a flat tint, so the type stays legible
                    at the bottom without dulling the whole photo. */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                {!loading && (
                  <span className="absolute right-5 top-5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm ring-1 ring-white/20">
                    {countOf(cat.label.toLowerCase())} styles
                  </span>
                )}

                <div className="absolute inset-x-0 bottom-0 p-7 sm:p-9">
                  <h3 className="text-3xl font-bold text-white sm:text-4xl">{cat.label}</h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-gray-200">
                    {cat.copy}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/95 px-5 py-2.5 text-sm font-semibold text-gray-900 transition-colors duration-200 group-hover:bg-red-500 group-hover:text-white">
                    Shop {cat.label.toLowerCase()}
                    <span className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none">
                      &rarr;
                    </span>
                  </span>
                </div>
              </NavLink>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ LOOKBOOK ============ */}
      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-20 lg:pb-28">
        <Reveal>
          <div className="mb-10 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-500">
              On rotation
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
              What we're wearing this month
            </h2>
            <p className="mt-3 leading-relaxed text-gray-500">
              No styling, no studio. Just the pairs coming off our own shelves
              most often.
            </p>
          </div>
        </Reveal>

        {/* Deliberately uneven: a tall anchor on the left, four smaller frames
            beside it. An even grid of six would read as a catalogue page. */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:grid-rows-2">
          {[
            { i: 2, cls: "col-span-2 row-span-2 aspect-square sm:aspect-auto" },
            { i: 7, cls: "aspect-square" },
            { i: 12, cls: "aspect-square" },
            { i: 17, cls: "aspect-square" },
            { i: 21, cls: "aspect-square" },
          ].map((cell, n) => (
            <Reveal key={cell.i} delay={n * 90} className={cell.cls}>
              <div className="group h-full w-full overflow-hidden rounded-2xl bg-gray-100">
                <img
                  src={pick(cell.i, n)}
                  alt=""
                  loading="lazy"
                  onError={hideOnError}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ BRANDS ============ */}
      {!loading && brands.length > 0 && (
        <section className="border-y border-gray-100 bg-white py-14">
          <div className="mx-auto max-w-7xl px-6 lg:px-20">
            <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              Brands we stock
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {brands.map((brand) => (
                <span
                  key={brand}
                  className="text-lg font-bold text-gray-300 transition-colors duration-200 hover:text-gray-900 sm:text-xl"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ ALL SNEAKERS ============ */}
      <section id="all-sneakers" className="scroll-mt-8 bg-gray-50 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-20">
          <Reveal>
            <div className="mb-10">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                All sneakers
              </h2>
              <p className="mt-1.5 text-gray-500">
                {loading
                  ? "Loading the latest drops…"
                  : `${products.length} styles available right now`}
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-7">
            {loading
              ? Array.from({ length: itemsPerPage }).map((_, i) => (
                  <SkelentonCard key={i} />
                ))
              : paged.map((product, i) => (
                  <Reveal key={product._id} delay={i * 60}>
                    <ProductCard product={product} />
                  </Reveal>
                ))}
          </div>

          {!loading && products.length === 0 && (
            <p className="py-16 text-center text-gray-400">
              No sneakers in the store yet.
            </p>
          )}

          {!loading && products.length > itemsPerPage && (
            <div className="mt-10">
              <Pagination
                currentPage={currentPage}
                totalItems={products.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </section>

      {/* ============ THE HUMAN BIT ============ */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-20 lg:py-32">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className="order-2 lg:order-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-500">
              Why we bother
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl text-balance">
              We got tired of guessing whether a pair was real.
            </h2>
            <div className="mt-5 space-y-4 leading-relaxed text-gray-500">
              <p>
                Everyone has a story about the trainers that arrived with the
                stitching already going. We started this shop so there is one
                place you don't have to squint at the photos and hope.
              </p>
              <p>
                Every pair comes straight from the brand. We open the box, check
                it, and put it back. If something is off, it doesn't get listed.
              </p>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {whyBother.map(([title, copy]) => (
                <div key={title}>
                  <div className="mb-3 h-0.5 w-8 bg-red-500" />
                  <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">{copy}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120} className="order-1 lg:order-2">
            <div className="grid grid-cols-2 gap-4">
              <img
                src={pick(3, 0)}
                alt=""
                loading="lazy"
                onError={hideOnError}
                className="mt-8 aspect-[3/4] w-full rounded-2xl object-cover shadow-lg"
              />
              <img
                src={pick(14, 1)}
                alt=""
                loading="lazy"
                onError={hideOnError}
                className="aspect-[3/4] w-full rounded-2xl object-cover shadow-lg"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ FOOTER CTA ============ */}
      <section className="relative overflow-hidden bg-gray-900">
        <img
          src={pick(19, 3)}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onError={hideOnError}
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />

        <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-6 px-6 py-20 lg:flex-row lg:items-center lg:justify-between lg:px-20">
          <div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl text-balance">
              Get first look at new drops
            </h2>
            <p className="mt-2 max-w-md text-gray-300">
              We email when something good lands. A few times a month, never
              more.
            </p>
          </div>

          <NavLink
            to="/contact"
            className="shrink-0 rounded-lg bg-red-500 px-8 py-3.5 font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/25 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            Get in touch
          </NavLink>
        </div>
      </section>
    </>
  );
}

export default Home;
