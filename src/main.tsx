import { createRoot } from "react-dom/client";
import * as React from "react";
import { HelmetProvider } from "@/lib/helmet-stub";
import App from "./App";
import "./index.css";

// ── Global error capture (catches module-level throws and unhandled rejections)
if (typeof window !== "undefined") {
  window.onerror = (msg, src, line, col, err) => {
    showFatalError(`JS Error: ${msg}\n${src}:${line}:${col}\n${err?.stack ?? ""}`);
    return false;
  };
  window.addEventListener("unhandledrejection", (e) => {
    showFatalError(`Unhandled Promise: ${e.reason}`);
  });
}

function showFatalError(message: string) {
  // Also POST to server so we can read it in deployment logs
  try {
    fetch("/api/logs/client-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, url: window.location.href, ts: Date.now() }),
    }).catch(() => {});
  } catch {}
  // Show on screen so a screenshot captures it
  const el = document.getElementById("root");
  if (el && !el.dataset.errShown) {
    el.dataset.errShown = "1";
    el.innerHTML = `<pre style="color:red;padding:16px;white-space:pre-wrap;font-size:12px;max-width:100%;overflow:auto">${message}</pre>`;
  }
}

// ── React Error Boundary (catches render-phase throws) ────────────────────────
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: { componentStack: string }) {
    showFatalError(`React render error: ${error.message}\n${error.stack}\nComponent stack:${info.componentStack}`);
  }
  render() {
    if (this.state.error) return null; // showFatalError already wrote to #root
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  React.createElement(
    ErrorBoundary,
    null,
    React.createElement(HelmetProvider, null, React.createElement(App)),
  ),
);
