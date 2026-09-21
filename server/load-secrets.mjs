import { spawn } from "node:child_process";
import { loadSecrets } from "./secret-bootstrap.mjs";

async function main() {
  const args = process.argv.slice(2);
  if (!args.length) {
    throw new Error("Usage: node server/load-secrets.mjs <command> [args...]");
  }

  await loadSecrets(process.env);

  const child = spawn(args[0], args.slice(1), {
    stdio: "inherit",
    env: process.env,
  });

  child.on("exit", (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    else process.exit(code ?? 1);
  });

  child.on("error", (error) => {
    console.error(`[load-secrets] failed to spawn child process: ${error.message}`);
    process.exit(1);
  });
}

main().catch((error) => {
  console.error(`[load-secrets] ${error.message}`);
  process.exit(1);
});
