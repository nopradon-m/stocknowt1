import { MOCK_PRODUCTS, filterProducts, type Product } from "./products";

/**
 * Paste your Power Automate "When an HTTP request is received" URL here.
 * While this is left as the placeholder, the app falls back to mock data
 * so the UI stays fully usable.
 */
export const WEBHOOK_URL = "YOUR_POWER_AUTOMATE_WEBHOOK_URL";

const isConfigured = () => /^https?:\/\//i.test(WEBHOOK_URL);

export interface SearchResult {
  items: Product[];
  /** True when results came from local mock data instead of the webhook. */
  offline: boolean;
}

function normalize(payload: unknown): Product[] {
  if (Array.isArray(payload)) return payload as Product[];
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    for (const key of ["value", "results", "items", "data"]) {
      if (Array.isArray(obj[key])) return obj[key] as Product[];
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
  }
  return [];
}

const delay = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

export async function searchProducts(
  query: string,
  signal?: AbortSignal,
): Promise<SearchResult> {
  const q = query.trim();
  if (!q) return { items: [], offline: !isConfigured() };

  if (!isConfigured()) {
    await delay(250, signal);
    return { items: filterProducts(MOCK_PRODUCTS, q), offline: true };
  }

  const response = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ searchQuery: q }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Search failed (${response.status})`);
  }

  return { items: normalize(await response.json()), offline: false };
}
