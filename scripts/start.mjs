import { serve } from "srvx/node";
import server from "../dist/server/server.js";
import erpServer from "../latest_ERP/dist/server/server.js";

const port = Number.parseInt(process.env.PORT ?? "", 10);
if (!Number.isInteger(port) || port <= 0) {
  throw new Error("PORT must be provided by the hosting platform");
}

serve({
  port,
  hostname: process.env.HOST ?? "0.0.0.0",
  fetch: (request) => {
    const pathname = new URL(request.url).pathname;
    return pathname === "/erp" || pathname.startsWith("/erp/")
      ? erpServer.fetch(request)
      : server.fetch(request);
  },
});
