# Fix: debounce timer aborts the in-flight 3-character search

## What's happening

The search effect in `src/routes/index.tsx` lists `debouncedQuery` in its dependency array. When you type exactly 3 characters, the effect runs and starts the fetch. One second later the debounce hook updates `debouncedQuery`, the effect re-runs, and React first runs the previous cleanup — `controller.abort()` — killing the still-pending request. Nothing replaces it (the query is unchanged, so no new fetch starts), so the UI falls back to the empty/"no results" state. When the backend is cache-warm and answers in under a second, the response lands before the abort, which is why the second attempt works.

## The fix

Stop tying the request's lifetime to effect re-runs.

1. Keep one `AbortController` in a ref that represents "the current search".
2. Abort it only when a genuinely newer search is about to start (the search term changed), not in the effect cleanup.
3. Remove `controller.abort()` from the effect cleanup; on unmount only, abort whatever is in flight.
4. Keep the existing `searchIdRef` guard so a stale response can never overwrite a newer one.

Net behaviour:
- Type 3 chars and stop: one request, never aborted, result renders whenever the backend answers (2-3s is fine).
- Keep typing past 3 chars: the 3-char request is aborted the moment the new debounced request fires — no flicker, no stale overwrite.
- Drop below 3 chars: in-flight request is aborted and results cleared.

## Technical notes

- File touched: `src/routes/index.tsx` only.
- `abortRef.current?.abort()` moves from the cleanup function into the branch that starts a new fetch, plus into the `< 3 characters` reset branch.
- Effect cleanup becomes a no-op for aborting; a separate unmount-only effect aborts `abortRef.current`.
- `pendingQueryRef` / `lastSearchedQuery` de-duplication stays as-is so the debounce tick doesn't re-issue the same 3-char search.

## Verification

Headless browser run against the preview: type `555`, hold, and confirm exactly one `/api/search` request that completes (no `net::ERR_ABORTED`) and renders results even with a slow response.
