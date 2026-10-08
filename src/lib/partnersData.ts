export interface Partner {
  id: string;
  name: string;
  category: string;
  discount: string;
  badgeText: string;
  badgeColor?: string;
  shortDesc: string;
  fullDesc?: string;
  terms?: string;
  logoText: string;
  logoUrl?: string;
  bannerImage: string;
  promoCode: string;
  website: string;
  telegram?: string;
  max?: string;
  wildberries?: string;
  ozon?: string;
  yandexMarket?: string;
  city: string;
  validUntil: string;
}

export const INITIAL_PARTNERS_DATA: Partner[] = [
  {
    id: "sol-air",
    name: "SolaAir",
    category: "Панели с пайетками",
    discount: "-5%",
    badgeText: "ПАНЕЛИ С ПАЙЕТКАМИ ДЛЯ ФОТОЗОН",
    badgeColor: "from-cyan-500 to-blue-600",
    shortDesc: "Декоративные панели с пайетками SolaAir — эффектное решение для праздничного декора.",
    fullDesc: "Оригинальные запатентованные живые панели с пайетками SolaAir для создания мерцающих фотозон, праздничных стендов и сценических задников. Легкий монтаж, долговечность и яркий визуальный эффект при малейшем движении воздуха.",
    terms: "Скидка предоставляется по промокоду при заказе через сайт или менеджера.",
    logoText: "SA",
    logoUrl: "/logos/solaair.svg",
    bannerImage: "https://static.tildacdn.com/tild3238-3135-4536-a664-313861623832/Sleekshot_2026-09-28.webp",
    promoCode: "PAYETKI-IQPRO15",
    website: "https://solaair.com",
    telegram: "https://t.me/solaair",
    max: "https://max.ru",
    city: "Производство в Краснодаре",
    validUntil: "Бессрочно для подписчиков"
  },
  {
    id: "agura",
    name: "AGURA",
    category: "Шары & Аэродизайн",
    discount: "WB",
    badgeText: "ФОЛЬГИРОВАННЫЕ ШАРЫ СОБСТВЕННОГО ПРОИЗВОДСТВА",
    badgeColor: "from-rose-500 to-pink-600",
    shortDesc: "Agura — крупнейший и единственный производитель фольгированных шаров на территории России.",
    fullDesc: "В нашем каталоге фольгированных воздушных шаров — сотни моделей на любой праздник: цифры, фигуры, шары с дизайном, сезонные коллекции и лимитированные выпуски. Наша компания оснащена высокотехнологичным оборудованием.",
    terms: "Скидка действует при оформлении заказа на сайте или через менеджера компании по промокоду. Скидка не суммируется с другими специальными акциями.",
    logoText: "AGURA",
    logoUrl: "/logos/agura.svg",
    bannerImage: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80",
    promoCode: "AGURA-DECO2026",
    website: "https://agura.ru",
    telegram: "https://t.me/agura_balloons",
    wildberries: "https://www.wildberries.ru/brands/agura",
    ozon: "https://www.ozon.ru/brand/agura",
    yandexMarket: "https://market.yandex.ru/search?text=agura",
    city: "фабрика в Яхроме Московской области",
    validUntil: "Бессрочно для подписчиков"
  },
  {
    id: "7flowers",
    name: "7ЦВЕТОВ",
    category: "Флористика & Оазис",
    discount: "-15%",
    badgeText: "СКИДКА НА ОАЗИСЫ И ЗЕЛЕНЬ",
    badgeColor: "from-emerald-500 to-teal-600",
    shortDesc: "Крупнейший оптовый склад живых цветов, экзотики и флористических расходников. Прямые поставки из Голландии и Эквадора.",
    fullDesc: "Ведущий оптовый поставщик свежесрезанных цветов, горшечных растений и аксессуаров для профессиональных флористов и декораторов. Огромный ассортимент стойкой зелени, пионовидных роз, гортензий и качественных флористических губок Oasis.",
    terms: "Действует на заказ от 10 000 ₽ при самовывозе с оптового склада или доставке к утреннему монтажу.",
    logoText: "7F",
    logoUrl: "/logos/7flowers.svg",
    bannerImage: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&q=80",
    promoCode: "IQDECO-7FLOWERS",
    website: "https://7flowers.ru",
    telegram: "https://t.me/flowers7_opt",
    max: "https://max.ru",
    ozon: "https://ozon.ru",
    yandexMarket: "https://market.yandex.ru",
    city: "Москва, Санкт-Петербург + РФ",
    validUntil: "Бессрочно для подписчиков"
  }
];

export const PARTNERS_STORAGE_KEY = 'pop_partners_data_v4';

let memoryPartnersCache: Partner[] | null = null;

// Initial server synchronization to guarantee published version has identical data
export async function syncPartnersWithServer(): Promise<Partner[]> {
  try {
    const res = await fetch('/api/partners');
    if (res.ok) {
      const serverData = await res.json();
      if (Array.isArray(serverData) && serverData.length > 0) {
        memoryPartnersCache = serverData;
        try {
          localStorage.setItem(PARTNERS_STORAGE_KEY, JSON.stringify(serverData));
        } catch {}
        window.dispatchEvent(new CustomEvent('partners_updated', { detail: serverData }));
        return serverData;
      }
    }
  } catch (err) {
    console.warn('Initial server partners sync error, using local fallback:', err);
  }
  return getStoredPartners();
}

export function getStoredPartners(): Partner[] {
  try {
    const raw = localStorage.getItem(PARTNERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryPartnersCache = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load partners from storage:', e);
  }
  if (memoryPartnersCache) {
    return memoryPartnersCache;
  }
  return INITIAL_PARTNERS_DATA;
}

export function saveStoredPartners(partners: Partner[]): void {
  memoryPartnersCache = [...partners];
  try {
    localStorage.setItem(PARTNERS_STORAGE_KEY, JSON.stringify(partners));
  } catch (e) {
    console.error('Failed to save partners to storage:', e);
  }

  // Persist to server JSON storage
  try {
    fetch('/api/partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memoryPartnersCache || partners)
    }).catch(err => console.warn('Could not sync partners with server:', err));
  } catch {}

  // Broadcast to all tabs/components
  try {
    window.dispatchEvent(new CustomEvent('partners_updated', { detail: memoryPartnersCache || partners }));
  } catch {
    window.dispatchEvent(new Event('partners_updated'));
  }
}

// Auto-run sync on module initialization in browser environment
if (typeof window !== 'undefined') {
  syncPartnersWithServer();
}
