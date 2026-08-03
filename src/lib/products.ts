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


export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatQty(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}
