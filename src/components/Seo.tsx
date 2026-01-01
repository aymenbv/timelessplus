import { Helmet } from "react-helmet-async";
import { seoConfig } from "@/config/seo";

interface SeoProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "product" | "article";
  noIndex?: boolean;
  // Product-specific props for JSON-LD
  product?: {
    name: string;
    brand: string;
    description?: string;
    price: number;
    currency?: string;
    image?: string;
    sku?: string;
    inStock?: boolean;
    url?: string;
  };
}

const Seo = ({
  title = seoConfig.defaultTitle,
  description = seoConfig.defaultDescription,
  canonical,
  ogImage = seoConfig.defaultOgImage,
  ogType = "website",
  noIndex = false,
  product
}: SeoProps) => {
  // Build full canonical URL - always use siteUrl as base
  const fullCanonical = canonical 
    ? (canonical.startsWith("http") ? canonical : `${seoConfig.siteUrl}${canonical}`)
    : seoConfig.siteUrl;
  
  // Build full OG image URL - always use siteUrl as base
  const fullOgImage = ogImage.startsWith("http") 
    ? ogImage 
    : `${seoConfig.siteUrl}${ogImage.startsWith('/') ? ogImage : '/' + ogImage}`;

  // Organization JSON-LD
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: seoConfig.businessInfo.name,
    legalName: seoConfig.businessInfo.legalName,
    url: seoConfig.siteUrl,
    logo: `${seoConfig.siteUrl}${seoConfig.logo}`,
    foundingDate: seoConfig.businessInfo.foundingDate,
    address: {
      "@type": "PostalAddress",
      addressCountry: seoConfig.businessInfo.address.countryCode
    },
    sameAs: []
  };

  // WebSite JSON-LD with search action
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: seoConfig.storeName,
    url: seoConfig.siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${seoConfig.siteUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  // Product JSON-LD - Enhanced with full schema.org specs
  const productSchema = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: {
      "@type": "Brand",
      name: product.brand
    },
    description: product.description || description,
    image: product.image ? (product.image.startsWith("http") ? product.image : `${seoConfig.siteUrl}${product.image}`) : fullOgImage,
    sku: product.sku || `TP-${product.name.replace(/\s+/g, "-").toUpperCase().slice(0, 20)}`,
    mpn: product.sku || `TP-${product.name.replace(/\s+/g, "-").toUpperCase().slice(0, 20)}`,
    offers: {
      "@type": "Offer",
      url: product.url || fullCanonical,
      priceCurrency: product.currency || seoConfig.businessInfo.currency,
      price: product.price,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      availability: product.inStock !== false 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: seoConfig.businessInfo.name,
        url: seoConfig.siteUrl
      }
    }
  } : null;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullCanonical} />
      
      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* Open Graph */}
      <meta property="og:type" content={ogType === "product" ? "product" : "website"} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={seoConfig.storeName} />
      <meta property="og:locale" content="ar_DZ" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={seoConfig.twitterHandle} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />

      {/* Product-specific Open Graph */}
      {product && (
        <>
          <meta property="product:price:amount" content={product.price.toString()} />
          <meta property="product:price:currency" content={product.currency || seoConfig.businessInfo.currency} />
          <meta property="product:brand" content={product.brand} />
          <meta property="product:availability" content={product.inStock !== false ? "in stock" : "out of stock"} />
        </>
      )}

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      {productSchema && (
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      )}
    </Helmet>
  );
};

export default Seo;
