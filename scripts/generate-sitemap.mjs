#!/usr/bin/env node
/**
 * Sitemap Generator Script
 * -------------------------
 * This script generates a dynamic sitemap.xml by fetching products from Supabase.
 * 
 * Usage:
 *   node scripts/generate-sitemap.mjs
 * 
 * The script will:
 * 1. Fetch all products from Supabase
 * 2. Generate sitemap.xml with all static and dynamic routes
 * 3. Save to public/sitemap.xml
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SITE_URL = 'https://timelessplus.lovable.app';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://poebjmtaqmxotwwblkai.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvZWJqbXRhcW14b3R3d2Jsa2FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MDk4NTEsImV4cCI6MjA4MTk4NTg1MX0.juQyEd70d1UAv-JGvjCKmAb7d2i7Lmuj9893yEZrDlY';

// Static routes with their priorities and change frequencies
const staticRoutes = [
  { path: '/', priority: 1.0, changefreq: 'daily' },
  { path: '/products', priority: 0.9, changefreq: 'daily' },
  { path: '/products?category=men', priority: 0.8, changefreq: 'weekly' },
  { path: '/products?category=women', priority: 0.8, changefreq: 'weekly' },
  { path: '/products?category=smart', priority: 0.8, changefreq: 'weekly' },
  { path: '/products?category=accessories', priority: 0.8, changefreq: 'weekly' },
  { path: '/about', priority: 0.6, changefreq: 'monthly' },
  { path: '/contact', priority: 0.6, changefreq: 'monthly' },
  { path: '/privacy-policy', priority: 0.3, changefreq: 'yearly' },
  { path: '/terms-conditions', priority: 0.3, changefreq: 'yearly' },
  { path: '/search', priority: 0.5, changefreq: 'weekly' },
  { path: '/install', priority: 0.4, changefreq: 'monthly' },
];

// Fetch products from Supabase
async function fetchProducts() {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/products?select=id,updated_at&in_stock=eq.true`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error.message);
    return [];
  }
}

// Generate XML sitemap
function generateSitemap(products) {
  const today = new Date().toISOString().split('T')[0];
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  // Add static routes
  for (const route of staticRoutes) {
    xml += `  <url>
    <loc>${SITE_URL}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>
`;
  }

  // Add product routes
  for (const product of products) {
    const lastmod = product.updated_at 
      ? new Date(product.updated_at).toISOString().split('T')[0]
      : today;
    
    xml += `  <url>
    <loc>${SITE_URL}/product/${product.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  }

  xml += `</urlset>`;
  return xml;
}

// Main function
async function main() {
  console.log('🔍 Fetching products from Supabase...');
  const products = await fetchProducts();
  console.log(`✅ Found ${products.length} products`);

  console.log('📝 Generating sitemap...');
  const sitemap = generateSitemap(products);

  const outputPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(outputPath, sitemap, 'utf-8');
  console.log(`✅ Sitemap saved to ${outputPath}`);

  // Also generate a sitemap index if needed in the future
  console.log(`📊 Total URLs in sitemap: ${staticRoutes.length + products.length}`);
}

main().catch(console.error);
