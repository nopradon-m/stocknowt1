import type { Product } from "@/lib/products";

interface Props {
  results: Product[];
  activeIndex: number;
  onSelect: (product: Product) => void;
  onHover: (index: number) => void;
  loading: boolean;
  error: string | null;
}

export function ResultsDropdown({
  results,
  activeIndex,
  onSelect,
  onHover,
  loading,
  error,
}: Props) {
  return (
    <div
      role="listbox"
      className="absolute inset-x-0 top-full z-30 mt-2 max-h-[60vh] overflow-y-auto overscroll-contain rounded-2xl border border-border bg-popover shadow-xl"
    >
      {error && (
        <p className="border-b border-border px-4 py-2 text-xs text-destructive">{error}</p>
      )}

      {results.length === 0 ? (
        <p className="px-4 py-5 text-center text-sm text-muted-foreground">
          {loading ? "Searching…" : "No matching products"}
        </p>
      ) : (
        <ul>
          {results.map((product, i) => (
            <li key={`${product.MPN}-${product["Product No."]}`}>
              <button
                type="button"
                role="option"
                aria-selected={i === activeIndex}
                onMouseEnter={() => onHover(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSelect(product)}
                className={`block w-full border-b border-border/60 px-4 py-3 text-left last:border-b-0 transition-colors ${
                  i === activeIndex ? "bg-accent" : "bg-transparent"
                }`}
              >
                <p className="line-clamp-2 text-sm font-bold leading-snug text-foreground">
                  {product.ProductDesc}
                </p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {product.MPN} · {product.BrandName}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
