// =====================================================
// SEO Configuration - Edit this file to update SEO values
// =====================================================
// 
// لتغيير إعدادات SEO، عدّل القيم أدناه:
// - siteUrl: رابط الموقع
// - storeName: اسم المتجر
// - defaultDescription: الوصف الافتراضي
// - pages: عناوين وأوصاف الصفحات
// =====================================================

export const seoConfig = {
  // Site URLs
  siteUrl: "https://timelessplus.lovable.app",
  
  // Store Information
  storeName: "TimelessPlus",
  storeNameArabic: "تايملس بلس",
  
  // Default Meta Tags
  defaultTitle: "TimelessPlus | ساعات فاخرة - أفخم الماركات العالمية",
  defaultDescription: "اكتشف مجموعتنا الحصرية من الساعات الفاخرة. ساعات أصلية من أشهر الماركات العالمية مع ضمان وتوصيل سريع لجميع أنحاء الجزائر.",
  
  // Default Images
  defaultOgImage: "/og-default.jpg",
  logo: "/logo.png",
  
  // Social Media
  twitterHandle: "@TimelessPlusDZ",
  
  // Contact Information
  phone: "+213 562 341 417",
  email: "contact@timelessplus.lovable.app",
  
  // Business Information (for JSON-LD)
  businessInfo: {
    name: "TimelessPlus",
    legalName: "TimelessPlus Watches DZ",
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
      title: "TimelessPlus | ساعات فاخرة - أفخم الماركات العالمية",
      description: "اكتشف مجموعتنا الحصرية من الساعات الفاخرة. ساعات أصلية من أشهر الماركات العالمية مع ضمان وتوصيل سريع لجميع أنحاء الجزائر."
    },
    products: {
      title: "جميع الساعات | TimelessPlus",
      description: "تصفح مجموعتنا الكاملة من الساعات الفاخرة. فلترة حسب الماركة، النوع، والسعر. توصيل سريع لجميع الولايات."
    },
    categories: {
      men: {
        title: "ساعات رجالية فاخرة | TimelessPlus",
        description: "اكتشف أفخم الساعات الرجالية من الماركات العالمية. تصاميم كلاسيكية وعصرية تناسب كل الأذواق."
      },
      women: {
        title: "ساعات نسائية فاخرة | TimelessPlus",
        description: "تشكيلة راقية من الساعات النسائية الفاخرة. أناقة وفخامة تليق بكِ."
      },
      smart: {
        title: "ساعات ذكية | TimelessPlus",
        description: "أحدث الساعات الذكية مع ميزات متطورة. تتبع صحتك ونشاطك بأناقة."
      },
      accessories: {
        title: "إكسسوارات الساعات | TimelessPlus",
        description: "أحزمة وإكسسوارات أصلية لساعتك الفاخرة. جودة عالية وتصاميم مميزة."
      }
    },
    about: {
      title: "من نحن | TimelessPlus",
      description: "تعرف على قصة TimelessPlus ورؤيتنا في تقديم أفخم الساعات العالمية للسوق الجزائرية."
    },
    contact: {
      title: "اتصل بنا | TimelessPlus",
      description: "تواصل معنا للاستفسارات والطلبات. فريقنا جاهز لمساعدتك على مدار الساعة."
    },
    cart: {
      title: "سلة التسوق | TimelessPlus",
      description: "راجع مشترياتك وأكمل طلبك. توصيل سريع وآمن لجميع الولايات."
    },
    trackOrder: {
      title: "تتبع طلبك | TimelessPlus",
      description: "تتبع حالة طلبك ومعرفة موعد التوصيل المتوقع."
    },
    privacyPolicy: {
      title: "سياسة الخصوصية | TimelessPlus",
      description: "اطلع على سياسة الخصوصية وكيفية حماية بياناتك الشخصية."
    },
    termsConditions: {
      title: "الشروط والأحكام | TimelessPlus",
      description: "اقرأ شروط وأحكام استخدام متجر TimelessPlus."
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
}) => {
  // Truncate description to 155 chars max for meta description
  const truncatedDescription = product.description 
    ? product.description.slice(0, 155) + (product.description.length > 155 ? '...' : '')
    : `اشترِ ${product.name} من ${product.brand} بأفضل سعر. ضمان أصالة وتوصيل سريع من ${seoConfig.storeName}.`;
  
  return {
    title: `${product.name} | ${product.brand} - ${seoConfig.storeName}`,
    description: truncatedDescription,
    ogImage: product.image || seoConfig.defaultOgImage,
    canonical: `${seoConfig.siteUrl}/product/${product.id}`
  };
};

// Helper function to generate category SEO
export const getCategorySeo = (category: string) => {
  const categoryKey = category.toLowerCase() as keyof typeof seoConfig.pages.categories;
  return seoConfig.pages.categories[categoryKey] || {
    title: `${category} | ${seoConfig.storeName}`,
    description: `تصفح مجموعة ${category} من الساعات الفاخرة في ${seoConfig.storeName}.`
  };
};
