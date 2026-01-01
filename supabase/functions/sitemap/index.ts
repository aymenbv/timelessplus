import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8',
}

const SITE_URL = 'https://timelessplus.lovable.app'

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
  { path: '/search', priority: 0.5, changefreq: 'weekly' },
  { path: '/install', priority: 0.4, changefreq: 'monthly' },
  { path: '/privacy-policy', priority: 0.3, changefreq: 'yearly' },
  { path: '/terms-conditions', priority: 0.3, changefreq: 'yearly' },
]

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Generating dynamic sitemap...')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch all in-stock products
    const { data: products, error } = await supabase
      .from('products')
      .select('id, updated_at, name')
      .eq('in_stock', true)

    if (error) {
      console.error('Error fetching products:', error)
      throw error
    }

    console.log(`Found ${products?.length || 0} products`)

    const today = new Date().toISOString().split('T')[0]

    // Build XML sitemap
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`

    // Add static routes
    for (const route of staticRoutes) {
      xml += `  <url>
    <loc>${SITE_URL}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>
`
    }

    // Add product routes
    if (products && products.length > 0) {
      for (const product of products) {
        const lastmod = product.updated_at 
          ? new Date(product.updated_at).toISOString().split('T')[0]
          : today

        xml += `  <url>
    <loc>${SITE_URL}/product/${product.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`
      }
    }

    xml += `</urlset>`

    console.log(`Sitemap generated with ${staticRoutes.length + (products?.length || 0)} URLs`)

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })

  } catch (error) {
    console.error('Error generating sitemap:', error)
    
    // Return a basic sitemap on error
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`

    return new Response(fallbackXml, {
      headers: corsHeaders,
    })
  }
})
