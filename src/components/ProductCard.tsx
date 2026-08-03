import { Package } from "lucide-react";
import { formatPrice, formatQty, type Product } from "@/lib/products";

function stockTone(qty: number) {
  if (qty <= 0) return { label: "Out of stock", cls: "bg-destructive/10 text-destructive" };
  if (qty < 50) return { label: "Low stock", cls: "bg-warning/15 text-warning-foreground" };
  return { label: "In stock", cls: "bg-success/15 text-success-foreground" };
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/60 py-3 last:border-b-0">
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words text-right text-sm font-semibold tabular-nums text-foreground">
        {value}
      </span>
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const stock = stockTone(product["01-ST"]);

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-secondary/60 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground">
            <Package className="h-3 w-3 shrink-0" />
            <span className="truncate">{product["Brand Name"] || "Unbranded"}</span>
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${stock.cls}`}
          >
            {stock.label}
          </span>
        </div>
        <h2 className="mt-3 break-all font-mono text-xl font-black leading-snug text-foreground">
          {product.MPN || "—"}
        </h2>
        <p className="mt-1 break-words text-xs text-muted-foreground">
          <span className="font-semibold">Product Description : </span>
          {product["Product Descriptions"] || "—"}
        </p>
      </div>

      <div className="p-5 pb-0">
        <div className="rounded-xl border border-border bg-background p-4 text-center">
          <p className="text-xl font-semibold uppercase tracking-wide text-muted-foreground">
            Qty
          </p>
          <p className="mt-1 text-4xl font-black tabular-nums text-foreground">
            {formatQty(product["01-ST"])}
          </p>
        </div>
      </div>

      <div className="px-5 pb-4 pt-2">
        <Row label="MPN" value={product.MPN || "—"} />
        <Row label="Brand Name" value={product["Brand Name"] || "—"} />
        <Row label="Price" value={formatPrice(product.Price)} />
        <Row label="Lot size" value={formatQty(product.Lotsize)} />
      </div>
    </article>
  );
}
