import { createFileRoute } from "@tanstack/react-router";
import { appendFile, access } from "fs/promises";
import path from "path";

const LOG_FILE = path.join(process.cwd(), "search_log.csv");
const HEADER = "Date,Time,MPN,QTY\n";

/** Format the current instant in UTC+7 (Thailand). */
function nowInBangkok(): { dateStr: string; timeStr: string } {
  const shifted = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return {
    dateStr: `${shifted.getUTCFullYear()}-${p(shifted.getUTCMonth() + 1)}-${p(shifted.getUTCDate())}`,
    timeStr: `${p(shifted.getUTCHours())}:${p(shifted.getUTCMinutes())}:${p(shifted.getUTCSeconds())}`,
  };
}

export const Route = createFileRoute("/api/log-selection")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let mpn = "";
        let qty = 0;
        try {
          const body = (await request.json()) as { mpn?: unknown; qty?: unknown };
          if (typeof body.mpn === "string") mpn = body.mpn.trim().slice(0, 200);
          if (typeof body.qty === "number" && Number.isFinite(body.qty)) qty = body.qty;
        } catch {
          return Response.json({ error: "Invalid request body." }, { status: 400 });
        }

        if (!mpn) return Response.json({ error: "Missing mpn." }, { status: 400 });

        const { dateStr, timeStr } = nowInBangkok();
        const safeMpn = mpn.replace(/"/g, '""');

        try {
          let needsHeader = false;
          try {
            await access(LOG_FILE);
          } catch {
            needsHeader = true;
          }
          const line = `${dateStr},${timeStr},"${safeMpn}",${qty}\n`;
          await appendFile(LOG_FILE, needsHeader ? HEADER + line : line, "utf8");
        } catch (error) {
          console.error("Failed to write selection log:", error);
          return Response.json({ error: "Unable to log selection." }, { status: 500 });
        }

        return Response.json({ ok: true });
      },
    },
  },
});
