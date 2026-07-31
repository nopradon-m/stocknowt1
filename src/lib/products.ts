export interface Product {
  MPN: string;
  "Product No.": string;
  ProductDesc: string;
  BrandName: string;
  "Price List2021": number;
  "01-ST": number;
  "01plus03": number;
  Lotsize: number;
}

/** Mock catalogue used until the Power Automate webhook URL is configured. */
export const MOCK_PRODUCTS: Product[] = [
  {
    MPN: "10030",
    "Product No.": "2143862",
    ProductDesc: "OZ-500 SPECIAL-PVC CONTROL CABLE 2 X 0.75MM²",
    BrandName: "HELUKABEL",
    "Price List2021": 22.34,
    "01-ST": 90,
    "01plus03": 90,
    Lotsize: 0,
  },
  {
    MPN: "10095",
    "Product No.": "2143888",
    ProductDesc: "JZ-500 SPECIAL-PVC CONTROL CABLE 5G X 1.5MM²",
    BrandName: "HELUKABEL",
    "Price List2021": 85.6,
    "01-ST": 5170,
    "01plus03": 5170,
    Lotsize: 0,
  },
  {
    MPN: "1125CM BK",
    "Product No.": "2100535",
    ProductDesc: "CONDUIT PVC CORRUGATED 25MM OD 40M BLACK",
    BrandName: "UPC",
    "Price List2021": 840.0,
    "01-ST": 18,
    "01plus03": 18,
    Lotsize: 1,
  },
];

export function filterProducts(items: Product[], query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return items.filter((p) =>
    [p.MPN, p.ProductDesc, p.BrandName, p["Product No."]]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(q)),
  );
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatQty(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}
