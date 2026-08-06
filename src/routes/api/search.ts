import { createFileRoute } from "@tanstack/react-router";

/** Abort the upstream call if the flow takes longer than this. */
const UPSTREAM_TIMEOUT_MS = 15000;

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
          return Response.json(payload);
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
