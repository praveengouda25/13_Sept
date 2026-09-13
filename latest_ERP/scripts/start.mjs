import { serve } from "srvx/node";
import server from "../dist/server/server.js";

const port = Number.parseInt(process.env.PORT ?? "", 10);
if (!Number.isInteger(port) || port <= 0) {
  throw new Error("PORT must be provided by the hosting platform");
}

serve({
  port,
  hostname: process.env.HOST ?? "0.0.0.0",
  fetch: server.fetch,
});
