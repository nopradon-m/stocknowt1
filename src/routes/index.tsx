import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { ResultsDropdown } from "@/components/ResultsDropdown";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { searchProducts, SearchError } from "@/lib/search-api";
import type { Product } from "@/lib/products";
import logo from "@/assets/logo.png";

const TITLE = "Stock Finder — Product Search & Inventory Lookup";
const DESCRIPTION =
  "Search cables, conduit and electrical parts by MPN or description and see live price, lot size and warehouse quantities.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selected, setSelected] = useState<Product | null>(null);

  const debounced = useDebouncedValue(query, 300);
  const skipNextSearch = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }
    const q = debounced.trim();
    if (q.length < 3) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setOpen(true);

    searchProducts(q, controller.signal)
      .then((res) => {
        setResults(res.items);
        setActiveIndex(0);
        setOpen(true);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setResults([]);
        setError(
          err instanceof SearchError ? err.message : "Unable to connect to the database.",
        );
        setOpen(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [debounced]);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function select(product: Product) {
    skipNextSearch.current = true;
    setSelected(product);
    setQuery(product["Product Descriptions"] || product.MPN);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = results[activeIndex];
      if (item) select(item);
    }
  }

  function clear() {
    skipNextSearch.current = false;
    setQuery("");
    setSelected(null);
    setResults([]);
    setOpen(false);
  }

  return (
    <main className="min-h-screen bg-muted/40 pb-16">
      <div className="mx-auto w-full max-w-[480px] px-4">
        <header className="flex items-center gap-3 pt-8 pb-4">
          <img
            src={logo}
            alt="Stock Now company logo"
            width={512}
            height={512}
            className="h-11 w-11 shrink-0 rounded-xl object-contain"
          />
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">Stock Now</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Look up products, prices and warehouse quantities.
            </p>
          </div>
        </header>

        <div ref={containerRef} className="sticky top-0 z-20 -mx-4 bg-muted/40 px-4 py-3">
          <div className="relative">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                inputMode="search"
                autoComplete="off"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => results.length > 0 && setOpen(true)}
                onKeyDown={onKeyDown}
                placeholder="Search by MPN or description (min 3 characters)"
                aria-label="Search products"
                className="h-14 w-full rounded-2xl border border-border bg-card pl-11 pr-12 text-base text-foreground shadow-sm outline-none transition-shadow placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {loading ? (
                  <Loader2
                    className="h-4 w-4 animate-spin text-muted-foreground"
                    aria-label="Loading"
                  />
                ) : query ? (
                  <button
                    type="button"
                    onClick={clear}
                    aria-label="Clear search"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>

            {open && (
              <ResultsDropdown
                results={results}
                activeIndex={activeIndex}
                onSelect={select}
                onHover={setActiveIndex}
                loading={loading}
                error={error}
              />
            )}
          </div>
        </div>

        <section className="mt-4">
          {selected ? (
            <ProductCard product={selected} />
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
              <Search className="mx-auto h-6 w-6 text-muted-foreground" />
              <p className="mt-3 text-sm font-semibold text-foreground">No product selected</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Start typing above and pick a result to see full details.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
