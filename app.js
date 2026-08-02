// Startup file for Plesk (Phusion Passenger) / PM2.
// The production build (`npm run build:node`) emits a self-contained Node
// server at .output/server/index.mjs — this file just boots it.
import("./.output/server/index.mjs").catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
