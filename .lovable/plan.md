# Verify the search webhook end to end

Confirm the live Power Automate connection works through the server proxy, without exposing the webhook URL or key.

## Steps

1. Send a real search (a 3+ character MPN fragment) through `/api/search` in the running app and record the HTTP status and response shape.
2. If the flow returns 400 or 502, log the upstream status and the first part of the upstream body server-side to identify whether the `x-api-key` condition step or the payload schema is rejecting the request.
3. Report findings: whether results come back, and if not, the precise failure point (proxy validation, upstream auth, or payload mismatch).
4. Only if a fix is needed: adjust the request payload/headers in `src/routes/api/search.ts` and re-test.

## Notes

- No secret values will be printed in chat, logs, or code.
- Frontend code stays unchanged unless the response shape differs from what `src/lib/search-api.ts` normalizes.
