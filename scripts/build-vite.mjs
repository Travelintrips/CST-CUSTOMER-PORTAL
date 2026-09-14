#!/usr/bin/env node
import { spawnSync } from "node:child_process";
const result = spawnSync("pnpm", ["exec", "vite", "build", "--config", "vite.config.ts"], {
  stdio: "inherit",
  cwd: new URL("..", import.meta.url),
  env: process.env,
});
process.exit(result.status ?? 1);
