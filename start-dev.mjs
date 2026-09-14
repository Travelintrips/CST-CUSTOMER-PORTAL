import http from "http";
import net from "net";
import { spawn } from "child_process";

const GW_PORT = Number(process.env.CUSTOMER_PORT || process.env.PORT || 9000);
const VITE_PORT = Number(process.env.CUSTOMER_VITE_PORT || 23434);

process.env.PORT = String(VITE_PORT);
process.env.BASE_PATH = process.env.BASE_PATH || "/";

function tryProxy(req, res) {
  let retries = 0;
  function attempt() {
    const opts = {
      hostname: "127.0.0.1",
      port: VITE_PORT,
      path: req.url,
      method: req.method,
      headers: req.headers,
    };
    const p = http.request(opts, (pr) => {
      res.writeHead(pr.statusCode, pr.headers);
      pr.pipe(res, { end: true });
    });
    p.on("error", () => {
      if (++retries < 120) {
        setTimeout(attempt, 500);
      } else {
        if (!res.headersSent) res.writeHead(502);
        res.end("Customer Portal starting...");
      }
    });
    req.pipe(p, { end: true });
  }
  attempt();
}

const srv = http.createServer(tryProxy);

srv.on("upgrade", (req, socket, head) => {
  const client = net.createConnection({ port: VITE_PORT, host: "127.0.0.1" }, () => {
    client.write(`${req.method} ${req.url} HTTP/${req.httpVersion}\r\n`);
    for (let i = 0; i < req.rawHeaders.length; i += 2) {
      client.write(`${req.rawHeaders[i]}: ${req.rawHeaders[i + 1]}\r\n`);
    }
    client.write("\r\n");
    if (head && head.length) client.write(head);
    socket.pipe(client);
    client.pipe(socket);
  });
  client.on("error", () => socket.destroy());
  socket.on("error", () => client.destroy());
});

srv.listen(GW_PORT, "0.0.0.0", () => {
  console.log(`[PORT CHECK] PID=${process.pid} PORT=${GW_PORT} SERVICE=customer-portal`);
  console.log(`[customer-portal] proxy :${GW_PORT} -> :${VITE_PORT}`);
});

const vite = spawn(
  "node",
  ["node_modules/vite/bin/vite.js", "--config", "vite.config.ts", "--host", "0.0.0.0", "--port", String(VITE_PORT)],
  {
    stdio: "inherit",
    cwd: new URL(".", import.meta.url).pathname,
    env: { ...process.env },
  }
);

vite.on("exit", (code) => {
  console.log(`[customer-portal] vite exited (${code})`);
  srv.close();
  process.exit(code ?? 1);
});

process.on("SIGTERM", () => { vite.kill("SIGTERM"); srv.close(); });
process.on("SIGINT", () => { vite.kill("SIGINT"); srv.close(); });
