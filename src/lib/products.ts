export interface Product {
  MPN: string;
  "Product Descriptions": string;
  "Brand Name": string;
  Price: number;
  Lotsize: number | null;
  "01-ST": number;
}

export function formatPrice(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatQty(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US").format(value);
}
