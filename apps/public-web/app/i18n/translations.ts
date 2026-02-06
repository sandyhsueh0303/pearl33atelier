export type Language = 'zh' | 'en'

export const translations = {
  // Navigation
  nav: {
    home: { zh: '首頁', en: 'Home' },
    products: { zh: '產品系列', en: 'Collection' },
    about: { zh: '關於我們', en: 'About' },
    careGuide: { zh: '保養指南', en: 'Care Guide' },
    customServices: { zh: '客製服務', en: 'Custom' },
    faq: { zh: '常見問題', en: 'FAQ' },
    blog: { zh: '珠寶知識', en: 'Journal' },
    contact: { zh: '聯絡我們', en: 'Contact' },
  },

  // Homepage
  home: {
    subtitle: { 
      zh: 'Fine Pearl Jewelry', 
      en: 'Fine Pearl Jewelry' 
    },
    title: { 
      zh: '33 Pearl Atelier', 
      en: '33 Pearl Atelier' 
    },
    description: { 
      zh: '純手工訂製珍珠首飾系列\n每一件作品都是獨特的藝術品', 
      en: 'Handcrafted Pearl Jewelry Collection\nEach piece is a unique work of art' 
    },
    cta: { 
      zh: '探索系列', 
      en: 'Explore Collection' 
    },
    scroll: { 
      zh: '向下探索', 
      en: 'Scroll to Discover' 
    },

    // Features section
    featuresTitle: { 
      zh: '珍珠的藝術', 
      en: 'The Art of Pearls' 
    },
    feature1Title: { 
      zh: '精選珍珠', 
      en: 'Selected Pearls' 
    },
    feature1Desc: { 
      zh: '嚴選來自世界各地的優質珍珠\n每顆都經過專業鑑定', 
      en: 'Carefully selected premium pearls from around the world\nEach professionally certified' 
    },
    feature2Title: { 
      zh: '手工訂製', 
      en: 'Handcrafted' 
    },
    feature2Desc: { 
      zh: '專業工藝師純手工打造\n為您量身訂製專屬首飾', 
      en: 'Crafted by master artisans\nCustom-made jewelry tailored for you' 
    },
    feature3Title: { 
      zh: '永恆品質', 
      en: 'Timeless Quality' 
    },
    feature3Desc: { 
      zh: '使用頂級材質與工藝\n確保經久不衰的美麗', 
      en: 'Premium materials and craftsmanship\nEnsuring lasting beauty' 
    },

    // CTA section
    ctaSectionTitle: { 
      zh: '開始您的訂製之旅', 
      en: 'Begin Your Custom Journey' 
    },
    ctaSectionDesc: { 
      zh: '我們提供完整的客製化服務，從選珠到設計，\n每一個環節都為您精心打造', 
      en: 'We offer complete customization services, from pearl selection to design,\nevery step is carefully crafted for you' 
    },
    ctaSectionButton: { 
      zh: '了解客製服務', 
      en: 'Learn About Custom Services' 
    },
  },

  // Products page
  products: {
    title: { zh: '產品系列', en: 'Collection' },
    subtitle: { zh: '精選珍珠首飾系列', en: 'Curated Pearl Jewelry Collection' },
    viewDetails: { zh: '查看詳情', en: 'View Details' },
    noProducts: { zh: '目前沒有產品', en: 'No products available' },
    noProductsDesc: { zh: '敬請期待我們即將推出的精選珠寶系列', en: 'Stay tuned for our upcoming curated jewelry collection' },
    inquire: { zh: '詢問此商品', en: 'Inquire About This Item' },
    materials: { zh: '材質', en: 'Materials' },
    description: { zh: '商品描述', en: 'Description' },
    inStock: { zh: '現貨', en: 'In Stock' },
    preOrder: { zh: '預購', en: 'Pre-order' },
    backToProducts: { zh: '← 返回產品列表', en: '← Back to Products' },
    specifications: { zh: '產品規格', en: 'Specifications' },
    shape: { zh: '形狀', en: 'Shape' },
    material: { zh: '材質', en: 'Material' },
    productCode: { zh: '產品編號', en: 'Product Code' },
    originalPrice: { zh: '原價', en: 'Original Price' },
    preorderNote: { zh: '預購說明', en: 'Pre-order Note' },
    interested: { zh: '對此商品感興趣？', en: 'Interested in this item?' },
    contactUs: { zh: '聯繫我們了解更多', en: 'Contact us to learn more' },
    browseMore: { zh: '瀏覽更多產品', en: 'Browse More Products' },
  },

  // Footer
  footer: {
    copyright: { 
      zh: '© 2026 33 Pearl Atelier. 保留所有權利。', 
      en: '© 2026 33 Pearl Atelier. All rights reserved.' 
    },
    followUs: { zh: '關注我們', en: 'Follow Us' },
  },

  // Common
  common: {
    loading: { zh: '載入中...', en: 'Loading...' },
    error: { zh: '發生錯誤', en: 'An error occurred' },
    backToHome: { zh: '返回首頁', en: 'Back to Home' },
  },
}

export type TranslationKey = keyof typeof translations
