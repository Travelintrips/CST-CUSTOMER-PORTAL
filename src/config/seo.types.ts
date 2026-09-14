/**
 * SEO Types — foundation for dynamic per-route metadata.
 *
 * Static routes use PageSeo + seo.ts config.
 * Dynamic routes (/jasa/:slug, /vendor/:slug, /marketplace/:slug) use
 * PageSeoDynamic + a SeoResolver to fetch/compute metadata at runtime.
 */

// ── Static config (already in seo.ts) ───────────────────────────────────────

export interface PageSeoConfig {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogType?: string;
  /** true → robots noindex,nofollow */
  noindex?: boolean;
}

// ── Dynamic config ───────────────────────────────────────────────────────────

/**
 * Params extracted from a dynamic route pattern.
 * e.g. /jasa/:slug → { slug: "freight-forwarding-udara" }
 */
export type DynamicSeoParams = Record<string, string>;

/**
 * A SeoResolver takes route params and returns the SEO config for that page.
 * It may be synchronous (static lookup) or async (API fetch).
 *
 * Usage:
 *   const resolver: SeoResolver<{ slug: string }> = async ({ slug }) => {
 *     const vendor = await fetchVendor(slug);
 *     return {
 *       title: `${vendor.name} — ${SITE_NAME}`,
 *       description: vendor.description,
 *       canonical: `${BASE_URL}/vendor/${slug}`,
 *     };
 *   };
 */
export type SeoResolver<P extends DynamicSeoParams = DynamicSeoParams> = (
  params: P,
) => PageSeoConfig | Promise<PageSeoConfig>;

/**
 * Registry of resolvers keyed by route pattern.
 * Populate this as dynamic routes are implemented.
 *
 * Example:
 *   export const seoResolvers: SeoResolverRegistry = {
 *     "/jasa/:slug":        jasaSlugResolver,
 *     "/vendor/:slug":      vendorSlugResolver,
 *     "/marketplace/:slug": marketplaceSlugResolver,
 *   };
 */
export type SeoResolverRegistry = Record<string, SeoResolver>;

/**
 * Result from a resolver — same shape as PageSeoConfig with loading state.
 */
export interface DynamicSeoState {
  config: PageSeoConfig | null;
  loading: boolean;
  error: Error | null;
}

// ── JSON-LD types ────────────────────────────────────────────────────────────

export interface WebPageSchema {
  "@context": "https://schema.org";
  "@type": "WebPage";
  "@id": string;
  url: string;
  name: string;
  isPartOf: { "@id": string };
  description: string;
  inLanguage: string;
  about?: { "@id": string };
}

export interface BreadcrumbItem {
  "@type": "ListItem";
  position: number;
  name: string;
  item: string;
}

export interface BreadcrumbListSchema {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: BreadcrumbItem[];
}
