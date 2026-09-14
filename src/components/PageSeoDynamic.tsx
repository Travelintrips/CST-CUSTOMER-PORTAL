/**
 * PageSeoDynamic — SEO component for dynamic routes.
 *
 * Use this for routes like /jasa/:slug, /vendor/:slug, /marketplace/:slug
 * where metadata must be computed from route params (and optionally fetched
 * from the API).
 *
 * Usage:
 *   import PageSeoDynamic from "@/components/PageSeoDynamic";
 *   import { jasaSlugResolver } from "@/config/seo.resolvers";
 *
 *   function JasaDetail() {
 *     const params = useParams<{ slug: string }>();
 *     return (
 *       <>
 *         <PageSeoDynamic resolver={jasaSlugResolver} params={params} />
 *         ...page content...
 *       </>
 *     );
 *   }
 *
 * To implement a resolver, see src/config/seo.types.ts and
 * src/config/seo.resolvers.ts (create when needed).
 */

import { useEffect, useState } from "react";
import { Helmet } from "@/lib/helmet-stub";
import type { PageSeoConfig, SeoResolver, DynamicSeoParams, DynamicSeoState } from "@/config/seo.types";
import { OG_IMAGE, OG_IMAGE_ALT, SITE_NAME, BASE_URL } from "@/config/seo";

// ── Hook ─────────────────────────────────────────────────────────────────────

function useDynamicSeo<P extends DynamicSeoParams>(
  resolver: SeoResolver<P>,
  params: P,
): DynamicSeoState {
  const [state, setState] = useState<DynamicSeoState>({
    config: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    setState({ config: null, loading: true, error: null });

    Promise.resolve(resolver(params))
      .then((config) => {
        if (!cancelled) setState({ config, loading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled) setState({ config: null, loading: false, error: err });
      });

    return () => { cancelled = true; };
    // Serialize params to avoid unnecessary re-runs on object identity change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolver, JSON.stringify(params)]);

  return state;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface PageSeoDynamicProps<P extends DynamicSeoParams> {
  /** A function that takes route params and returns PageSeoConfig (or Promise). */
  resolver: SeoResolver<P>;
  /** Route params from useParams(). */
  params: P;
  /**
   * Fallback config shown while the resolver is loading.
   * If omitted, falls back to the generic site metadata.
   */
  fallback?: Partial<PageSeoConfig>;
}

export default function PageSeoDynamic<P extends DynamicSeoParams>({
  resolver,
  params,
  fallback,
}: PageSeoDynamicProps<P>) {
  const { config, loading } = useDynamicSeo(resolver, params);

  // While loading, show fallback or generic site metadata
  const active: PageSeoConfig = config ?? {
    title: fallback?.title ?? SITE_NAME,
    description:
      fallback?.description ??
      `${SITE_NAME} — platform logistik terpadu Indonesia. Layanan ekspor impor, freight forwarding udara & laut, customs clearance PPJK, dan trucking untuk bisnis Anda.`,
    canonical: fallback?.canonical ?? BASE_URL,
    ...fallback,
  };

  const resolvedTitle     = active.title;
  const resolvedDesc      = active.description;
  const resolvedCanonical = active.canonical;
  const resolvedOgTitle   = active.ogTitle ?? resolvedTitle;
  const resolvedOgDesc    = active.ogDescription ?? resolvedDesc;
  const resolvedOgImage   = active.ogImage ?? OG_IMAGE;
  const resolvedOgImgAlt  = active.ogImageAlt ?? OG_IMAGE_ALT;
  const robots            = active.noindex ? "noindex, nofollow" : "index, follow";

  // Suppress rendering while loading to avoid flash of wrong canonical
  if (loading && !fallback) return null;

  return (
    <Helmet>
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDesc} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={resolvedCanonical} />

      {/* Open Graph */}
      <meta property="og:type" content={active.ogType ?? "website"} />
      <meta property="og:url" content={resolvedCanonical} />
      <meta property="og:title" content={resolvedOgTitle} />
      <meta property="og:description" content={resolvedOgDesc} />
      <meta property="og:image" content={resolvedOgImage} />
      <meta property="og:image:secure_url" content={resolvedOgImage} />
      <meta property="og:image:type" content="image/webp" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={resolvedOgImgAlt} />
      <meta property="og:locale" content="id_ID" />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedOgTitle} />
      <meta name="twitter:description" content={resolvedOgDesc} />
      <meta name="twitter:image" content={resolvedOgImage} />
      <meta name="twitter:image:alt" content={resolvedOgImgAlt} />
    </Helmet>
  );
}

// ── Resolver helpers (for common dynamic patterns) ───────────────────────────

/**
 * Create a simple static lookup resolver.
 * Useful for a small known set of slugs (e.g. service categories).
 *
 * Example:
 *   export const serviceResolver = createStaticResolver(serviceMap, {
 *     fallbackTitle: `Jasa Logistik — ${SITE_NAME}`,
 *     fallbackDescription: "...",
 *     canonicalBase: `${BASE_URL}/jasa`,
 *   });
 */
export function createStaticResolver<P extends DynamicSeoParams>(
  map: Record<string, PageSeoConfig>,
  fallback: { fallbackTitle: string; fallbackDescription: string; canonicalBase: string },
): SeoResolver<P & { slug: string }> {
  return (params) => {
    const hit = map[params.slug];
    if (hit) return hit;
    return {
      title: fallback.fallbackTitle,
      description: fallback.fallbackDescription,
      canonical: `${fallback.canonicalBase}/${params.slug}`,
    };
  };
}

/**
 * Create a resolver that fetches metadata from a JSON API endpoint.
 * The endpoint should return { title, description, canonical, ... }.
 *
 * Example:
 *   export const vendorResolver = createApiResolver<{ slug: string }>(
 *     (params) => `/api/public/vendors/${params.slug}/seo`,
 *   );
 */
export function createApiResolver<P extends DynamicSeoParams>(
  urlFn: (params: P) => string,
): SeoResolver<P> {
  return async (params) => {
    const url = urlFn(params);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`SEO API ${url} returned ${res.status}`);
    return res.json() as Promise<PageSeoConfig>;
  };
}
