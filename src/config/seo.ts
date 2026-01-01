// =====================================================
// SEO Configuration - Edit this file to update SEO values
// =====================================================

export const seoConfig = {
  // Site URLs
  siteUrl: "https://timelessplus.lovable.app",
  
  // Store Information
  storeName: "Timeless",
  storeNameArabic: "تايملس",
  
  // Default Meta Tags
  defaultTitle: "Timeless | ساعات فاخرة - أفخم الماركات العالمية",
  defaultDescription: "اكتشف مجموعتنا الحصرية من الساعات الفاخرة. ساعات أصلية من أشهر الماركات العالمية مع ضمان وتوصيل سريع لجميع أنحاء الجزائر.",
  
  // Default Images
  defaultOgImage: "/og-default.jpg",
  logo: "/logo.png",
  
  // Social Media
  twitterHandle: "@TimelessDZ",
  
  // Contact Information
  phone: "+213 XXX XXX XXX",
  email: "contact@timelessplus.lovable.app",
  
  // Business Information (for JSON-LD)
  businessInfo: {
    name: "Timeless",
    legalName: "Timeless Watches DZ",
    foundingDate: "2024",
    currency: "DZD",
    priceRange: "$$$$",
    address: {
      country: "Algeria",
      countryCode: "DZ"
    }
  },
  
  // Page-specific SEO (editable)
  pages: {
    home: {
      title: "Timeless | ساعات فاخرة - أفخم الماركات العالمية",
      description: "اكتشف مجموعتنا الحصرية من الساعات الفاخرة. ساعات أصلية من أشهر الماركات العالمية مع ضمان وتوصيل سريع لجميع أنحاء الجزائر."
    },
    products: {
      title: "جميع الساعات | Timeless",
      description: "تصفح مجموعتنا الكاملة من الساعات الفاخرة. فلترة حسب الماركة، النوع، والسعر. توصيل سريع لجميع الولايات."
    },
    categories: {
      men: {
        title: "ساعات رجالية فاخرة | Timeless",
        description: "اكتشف أفخم الساعات الرجالية من الماركات العالمية. تصاميم كلاسيكية وعصرية تناسب كل الأذواق."
      },
      women: {
        title: "ساعات نسائية فاخرة | Timeless",
        description: "تشكيلة راقية من الساعات النسائية الفاخرة. أناقة وفخامة تليق بكِ."
      },
      smart: {
        title: "ساعات ذكية | Timeless",
        description: "أحدث الساعات الذكية مع ميزات متطورة. تتبع صحتك ونشاطك بأناقة."
      },
      accessories: {
        title: "إكسسوارات الساعات | Timeless",
        description: "أحزمة وإكسسوارات أصلية لساعتك الفاخرة. جودة عالية وتصاميم مميزة."
      }
    },
    about: {
      title: "من نحن | Timeless",
      description: "تعرف على قصة Timeless ورؤيتنا في تقديم أفخم الساعات العالمية للسوق الجزائرية."
    },
    contact: {
      title: "اتصل بنا | Timeless",
      description: "تواصل معنا للاستفسارات والطلبات. فريقنا جاهز لمساعدتك على مدار الساعة."
    },
    cart: {
      title: "سلة التسوق | Timeless",
      description: "راجع مشترياتك وأكمل طلبك. توصيل سريع وآمن لجميع الولايات."
    },
    trackOrder: {
      title: "تتبع طلبك | Timeless",
      description: "تتبع حالة طلبك ومعرفة موعد التوصيل المتوقع."
    }
  }
};

// Helper function to generate product SEO
export const getProductSeo = (product: {
  name: string;
  brand: string;
  description?: string | null;
  price: number;
  image?: string | null;
  id: string;
}) => ({
  title: `${product.name} | ${product.brand} - Timeless`,
  description: product.description?.slice(0, 155) || 
    `اشترِ ${product.name} من ${product.brand} بأفضل سعر. ضمان أصالة وتوصيل سريع من Timeless.`,
  ogImage: product.image || seoConfig.defaultOgImage,
  canonical: `${seoConfig.siteUrl}/product/${product.id}`
});

// Helper function to generate category SEO
export const getCategorySeo = (category: string) => {
  const categoryKey = category.toLowerCase() as keyof typeof seoConfig.pages.categories;
  return seoConfig.pages.categories[categoryKey] || {
    title: `${category} | Timeless`,
    description: `تصفح مجموعة ${category} من الساعات الفاخرة في Timeless.`
  };
};
