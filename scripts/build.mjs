import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const npmCli = process.env.npm_execpath ?? resolve("node_modules/npm/bin/npm-cli.js");
const environment = { ...process.env, NITRO_PRESET: "node-server" };

for (const script of ["build:website", "build:erp"]) {
  const result = spawnSync(process.execPath, [npmCli, "run", script], {
    env: environment,
    stdio: "inherit",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
