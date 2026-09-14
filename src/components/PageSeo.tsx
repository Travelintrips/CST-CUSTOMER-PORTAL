import { Helmet } from "@/lib/helmet-stub";
import { getSeoConfig, OG_IMAGE, OG_IMAGE_ALT, SITE_NAME } from "@/config/seo";

interface PageSeoProps {
  /** Route path, e.g. "/services". Defaults to current pathname. */
  path?: string;
  /** Override title */
  title?: string;
  /** Override description */
  description?: string;
  /** Override canonical URL (absolute) */
  canonical?: string;
  /** Override OG image URL (absolute) */
  ogImage?: string;
  /** Override OG image alt */
  ogImageAlt?: string;
  /** Force noindex */
  noindex?: boolean;
}

export default function PageSeo({
  path,
  title,
  description,
  canonical,
  ogImage,
  ogImageAlt,
  noindex = false,
}: PageSeoProps) {
  const resolvedPath =
    path ?? (typeof window !== "undefined" ? window.location.pathname : "/");
  const config = getSeoConfig(resolvedPath);

  const resolvedTitle = title ?? config.title;
  const resolvedDesc = description ?? config.description;
  const resolvedCanonical = canonical ?? config.canonical;
  const resolvedOgTitle = config.ogTitle ?? resolvedTitle;
  const resolvedOgDesc = config.ogDescription ?? resolvedDesc;
  const resolvedOgImage = ogImage ?? config.ogImage ?? OG_IMAGE;
  const resolvedOgImageAlt = ogImageAlt ?? config.ogImageAlt ?? OG_IMAGE_ALT;
  const resolvedNoindex = noindex || config.noindex || false;
  const robots = resolvedNoindex ? "noindex, nofollow" : "index, follow";

  return (
    <Helmet>
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDesc} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={resolvedCanonical} />

      {/* Open Graph */}
      <meta property="og:type" content={config.ogType ?? "website"} />
      <meta property="og:url" content={resolvedCanonical} />
      <meta property="og:title" content={resolvedOgTitle} />
      <meta property="og:description" content={resolvedOgDesc} />
      <meta property="og:image" content={resolvedOgImage} />
      <meta property="og:image:secure_url" content={resolvedOgImage} />
      <meta property="og:image:type" content="image/webp" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={resolvedOgImageAlt} />
      <meta property="og:locale" content="id_ID" />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedOgTitle} />
      <meta name="twitter:description" content={resolvedOgDesc} />
      <meta name="twitter:image" content={resolvedOgImage} />
      <meta name="twitter:image:alt" content={resolvedOgImageAlt} />
    </Helmet>
  );
}
