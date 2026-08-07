import { createFileRoute } from "@tanstack/react-router";

/** Abort the upstream call if the flow takes longer than this. */
const UPSTREAM_TIMEOUT_MS = 15000;

/** How long a cached search result stays fresh. */
const CACHE_TTL_MS = 5 * 60 * 1000;
/** Keep the in-memory cache bounded. */
const CACHE_MAX_ENTRIES = 500;

type CacheEntry = { payload: unknown; timestamp: number };
const searchCache = new Map<string, CacheEntry>();

const cacheKey = (query: string) => query.trim().toLowerCase();

function readCache(key: string): unknown | undefined {
  const hit = searchCache.get(key);
  if (!hit) return undefined;
  if (Date.now() - hit.timestamp > CACHE_TTL_MS) {
    searchCache.delete(key);
    return undefined;
  }
  return hit.payload;
}

function writeCache(key: string, payload: unknown) {
  searchCache.set(key, { payload, timestamp: Date.now() });
  // Evict expired entries, then the oldest ones if still over the limit.
  const now = Date.now();
  for (const [k, v] of searchCache) {
    if (now - v.timestamp > CACHE_TTL_MS) searchCache.delete(k);
  }
  while (searchCache.size > CACHE_MAX_ENTRIES) {
    const oldest = searchCache.keys().next().value;
    if (oldest === undefined) break;
    searchCache.delete(oldest);
  }
}

export const Route = createFileRoute("/api/search")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const webhookUrl = process.env["POWER_AUTOMATE_WEBHOOK_URL"];
        const apiKey = process.env["POWER_AUTOMATE_API_KEY"];

        if (!webhookUrl) {
          console.error("POWER_AUTOMATE_WEBHOOK_URL is not configured");
          return Response.json({ error: "Search is not configured." }, { status: 500 });
        }

        let searchQuery = "";
        try {
          const body = (await request.json()) as { searchQuery?: unknown };
          if (typeof body.searchQuery === "string") searchQuery = body.searchQuery.trim();
        } catch {
          return Response.json({ error: "Invalid request body." }, { status: 400 });
        }

        if (searchQuery.length < 3 || searchQuery.length > 200) {
          return Response.json({ error: "Invalid search query." }, { status: 400 });
        }

        const key = cacheKey(searchQuery);
        const cached = readCache(key);
        if (cached !== undefined) {
          return Response.json(cached, { headers: { "x-cache": "HIT" } });
        }

        // Always sent; the flow checks this header in a Condition step.
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "x-api-key": apiKey ?? "",
        };


        try {
          const upstream = await fetch(webhookUrl, {
            method: "POST",
            headers,
            body: JSON.stringify({ searchQuery }),
            signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
          });

          if (!upstream.ok) {
            console.error("Search upstream failed with status", upstream.status);
            return Response.json(
              { error: `Unable to connect to the database (error ${upstream.status}).` },
              { status: 502 },
            );
          }

          const text = await upstream.text();
          let payload: unknown;
          try {
            payload = text ? JSON.parse(text) : [];
          } catch {
            return Response.json(
              { error: "Received an unexpected response from the database." },
              { status: 502 },
            );
          }
          writeCache(key, payload);
          return Response.json(payload, { headers: { "x-cache": "MISS" } });
        } catch (error) {
          const timedOut = error instanceof DOMException && error.name === "TimeoutError";
          console.error("Search upstream error:", error);
          return Response.json(
            {
              error: timedOut
                ? "The search timed out. Please try again."
                : "Unable to connect to the database.",
            },
            { status: timedOut ? 504 : 502 },
          );
        }
      },
    },
  },
});
