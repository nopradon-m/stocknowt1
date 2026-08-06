import type { Product } from "./products";

/** Same-origin proxy; the real Power Automate endpoint stays server-side. */
export const SEARCH_ENDPOINT = "/api/search";

/** Abort the request if the proxy takes longer than this. */
const TIMEOUT_MS = 20000;


export interface SearchResult {
  items: Product[];
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const n = Number(value.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  return toNumber(value);
}

function toProduct(raw: Record<string, unknown>): Product {
  return {
    MPN: String(raw["MPN"] ?? ""),
    "Product Descriptions": String(
      raw["Product Descriptions"] ?? raw["ProductDesc"] ?? raw["Product Description"] ?? "",
    ),
    "Brand Name": String(raw["Brand Name"] ?? raw["BrandName"] ?? raw["Brand"] ?? ""),
    Price: toNumber(raw["Price"] ?? raw["Price List2021"]),
    Lotsize: toNullableNumber(raw["Lotsize"] ?? raw["Lot size"]),
    "01-ST": toNumber(raw["01-ST"]),
  };
}


function normalize(payload: unknown): Product[] {
  if (Array.isArray(payload)) {
    return payload
      .filter((row): row is Record<string, unknown> => !!row && typeof row === "object")
      .map(toProduct);
  }
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    for (const key of ["value", "results", "items", "data", "products"]) {
      if (Array.isArray(obj[key])) return normalize(obj[key]);
    }
    const body = obj["body"];
    if (typeof body === "string") {
      try {
        return normalize(JSON.parse(body));
      } catch {
        return [];
      }
    }
    if (body) return normalize(body);
    if ("MPN" in obj || "Product Descriptions" in obj || "ProductDesc" in obj)
      return [toProduct(obj)];

  }
  return [];
}

/** Thrown for any failure the user should see a friendly message about. */
export class SearchError extends Error {}

export async function searchProducts(
  query: string,
  signal?: AbortSignal,
): Promise<SearchResult> {
  const q = query.trim();
  if (!q) return { items: [] };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new DOMException("Timeout", "TimeoutError")), TIMEOUT_MS);
  signal?.addEventListener("abort", () => controller.abort(signal.reason));

  let response: Response;
  try {
    response = await fetch(SEARCH_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ searchQuery: q }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    // Caller-initiated abort bubbles up untouched so it can be ignored.
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    if (err instanceof DOMException && err.name === "TimeoutError") {
      throw new SearchError("The search timed out. Please try again.");
    }
    throw new SearchError("Unable to connect to the database.");
  }
  clearTimeout(timer);

  if (!response.ok) {
    let message = `Unable to connect to the database (error ${response.status}).`;
    try {
      const body = (await response.json()) as { error?: unknown };
      if (typeof body.error === "string" && body.error) message = body.error;
    } catch {
      // keep the default message
    }
    throw new SearchError(message);
  }


  try {
    return { items: normalize(await response.json()) };
  } catch {
    throw new SearchError("Received an unexpected response from the database.");
  }
}
