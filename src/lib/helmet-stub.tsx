/**
 * No-op stub for react-helmet-async.
 * Used when the package is not installed in the current environment.
 * SEO meta tags are inert; all page content renders normally.
 */
import React from "react";

export function HelmetProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Helmet({ children }: { children?: React.ReactNode }) {
  return null;
}
