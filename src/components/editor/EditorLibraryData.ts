export interface LibraryItem {
  id: string;
  name: string;
  code: string;
  category: string;
  price: number;
  width: number;
  height: number;
  svgMarkup: string;
  caption?: string;
  customImage?: string;
}

export const CATALOG_CATEGORIES = [
  { id: 'arches', title: 'Арки', icon: 'Arch' },
  { id: 'flowers', title: 'Флористика', icon: 'Flower2' },
  { id: 'light', title: 'Освещение', icon: 'Lightbulb' },
  { id: 'stands', title: 'Стойки и подиумы', icon: 'Columns' },
  { id: 'tables', title: 'Мебель и столы', icon: 'Table' },
  { id: 'textiles', title: 'Текстиль', icon: 'Layers' },
  { id: 'balloons', title: 'Воздушные шары', icon: 'CircleDot' },
  { id: 'decor', title: 'Декор и вазы', icon: 'Sparkles' }
];

export const CATALOG_ASSETS: Record<string, LibraryItem[]> = {
  arches: [
    {
      id: "A-101",
      name: "Классическая круглая арка «Оливия»",
      code: "A-101",
      category: "arches",
      price: 25000,
      width: 220,
      height: 220,
      svgMarkup: `
        <svg viewBox="0 0 100 100" class="w-full h-full text-violet-400 dark:text-violet-300">
          <circle cx="50" cy="50" r="48" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="1 1" opacity="0.3" />
          <circle cx="50" cy="50" r="46" stroke="currentColor" stroke-width="2.5" fill="none" opacity="0.8" />
          <!-- Small foliage/flower accents -->
          <path d="M5 50 Q10 45 15 50 Z" fill="#6E8276" />
          <path d="M85 25 Q90 20 95 25 Z" fill="#6E8276" />
          <circle cx="10" cy="48" r="4" fill="#E2D4F0" />
          <circle cx="90" cy="23" r="4" fill="#E2D4F0" />
        </svg>
      `
    },
    {
      id: "A-102",
      name: "Стрельчатая готическая арка",
      code: "A-102",
      category: "arches",
      price: 32000,
      width: 180,
      height: 270,
      svgMarkup: `
        <svg viewBox="0 0 100 140" class="w-full h-full text-zinc-400 dark:text-zinc-500">
          <path d="M3 138 L3 65 Q3 15 50 3 Q97 15 97 65 L97 138" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" fill="none" opacity="0.9" />
          <path d="M15 138 L15 70 Q15 25 50 15 Q85 25 85 70 L85 138" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.5" />
          <path d="M42 12 L50 3 L58 12" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none" />
        </svg>
      `
    },
    {
      id: "A-103",
      name: "Прямоугольный портал «Президиум»",
      code: "A-103",
      category: "arches",
      price: 38000,
      width: 280,
      height: 240,
      svgMarkup: `
        <svg viewBox="0 0 140 100" class="w-full h-full text-amber-800/80">
          <rect x="3" y="3" width="134" height="94" stroke="currentColor" stroke-width="5" fill="none" rx="2" />
          <rect x="13" y="13" width="114" height="84" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 3" fill="none" opacity="0.6" />
        </svg>
      `
    },
    {
      id: "A-104",
      name: "Гексагональная арка «Винтаж»",
      code: "A-104",
      category: "arches",
      price: 29000,
      width: 240,
      height: 220,
      svgMarkup: `
        <svg viewBox="0 0 100 100" class="w-full h-full text-amber-700/70">
          <polygon points="50,2 98,26 98,74 50,98 2,74 2,26" stroke="currentColor" stroke-width="4.5" fill="none" stroke-linejoin="round" />
          <path d="M2 26 Q7 18 12 26 Z" fill="#6E8276" />
          <circle cx="7" cy="24" r="3" fill="#FFF" />
        </svg>
      `
    },
    {
      id: "A-105",
      name: "Неоновая двойная арка-аркада",
      code: "A-105",
      category: "arches",
      price: 45000,
      width: 200,
      height: 240,
      svgMarkup: `
        <svg viewBox="0 0 100 120" class="w-full h-full text-violet-500">
          <path d="M3 118 L3 45 Q3 3 50 3 Q97 3 97 45 L97 118" stroke="currentColor" stroke-width="5" stroke-linecap="round" fill="none" style="filter: drop-shadow(0 0 4px #C08EF4)" />
          <path d="M18 118 L18 52 Q18 18 50 18 Q82 18 82 52 L82 118" stroke="#F472B6" stroke-width="3.5" stroke-linecap="round" fill="none" style="filter: drop-shadow(0 0 3px #F472B6)" />
        </svg>
      `
    }
  ],
  flowers: [
    {
      id: "F-201",
      name: "Гирлянда «Королевская роза»",
      code: "F-201",
      category: "flowers",
      price: 45000,
      width: 240,
      height: 40,
      svgMarkup: `
        <svg viewBox="0 0 120 30" class="w-full h-full text-rose-400">
          <path d="M10 15 Q30 5 60 15 T110 15" stroke="#4D7C0F" stroke-width="3" fill="none" opacity="0.6" />
          <circle cx="20" cy="12" r="7" fill="currentColor" />
          <circle cx="20" cy="12" r="4" fill="#F43F5E" />
          <circle cx="45" cy="18" r="8" fill="currentColor" />
          <circle cx="45" cy="18" r="4" fill="#F43F5E" />
          <circle cx="70" cy="10" r="9" fill="currentColor" />
          <circle cx="70" cy="10" r="5" fill="#F43F5E" />
          <circle cx="95" cy="15" r="7" fill="currentColor" />
          <circle cx="95" cy="15" r="3" fill="#F43F5E" />
          <!-- Green leaves -->
          <path d="M30 10 Q35 5 32 15 Z" fill="#4D7C0F" />
          <path d="M80 15 Q85 10 82 20 Z" fill="#4D7C0F" />
        </svg>
      `
    },
    {
      id: "F-202",
      name: "Свадебный венок из пампасной травы",
      code: "F-202",
      category: "flowers",
      price: 32000,
      width: 140,
      height: 140,
      svgMarkup: `
        <svg viewBox="0 0 100 100" class="w-full h-full text-amber-100/90 dark:text-amber-200/50">
          <circle cx="50" cy="50" r="35" stroke="#E5E7EB" stroke-width="1.5" fill="none" />
          <!-- Pampas fluffy lines -->
          <path d="M50 15 Q65 5 70 18" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.8" />
          <path d="M85 50 Q95 65 82 70" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.8" />
          <path d="M50 85 Q35 95 30 82" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.8" />
          <path d="M15 50 Q5 35 18 30" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.8" />
          <!-- Soft center points -->
          <circle cx="50" cy="15" r="2.5" fill="#F59E0B" />
          <circle cx="85" cy="50" r="2.5" fill="#F59E0B" />
          <circle cx="50" cy="85" r="2.5" fill="#F59E0B" />
          <circle cx="15" cy="50" r="2.5" fill="#F59E0B" />
        </svg>
      `
    },
    {
      id: "F-203",
      name: "Каскад цветов белой глицинии",
      code: "F-203",
      category: "flowers",
      price: 28000,
      width: 100,
      height: 180,
      svgMarkup: `
        <svg viewBox="0 0 60 120" class="w-full h-full text-zinc-100 dark:text-zinc-200">
          <line x1="30" y1="10" x2="30" y2="100" stroke="#4D7C0F" stroke-width="2" />
          <!-- Drooping elements -->
          <path d="M30 20 Q15 35 30 50" fill="currentColor" opacity="0.8"/>
          <path d="M30 35 Q45 50 30 65" fill="currentColor" opacity="0.9"/>
          <path d="M30 55 Q10 75 30 90" fill="currentColor"/>
          <path d="M30 75 Q48 90 30 105" fill="currentColor" opacity="0.85"/>
          <circle cx="30" cy="112" r="3" fill="currentColor" />
        </svg>
      `
    },
    {
      id: "F-204",
      name: "Куст эвкалипта с пионами (напольный)",
      code: "F-204",
      category: "flowers",
      price: 18000,
      width: 80,
      height: 100,
      svgMarkup: `
        <svg viewBox="0 0 80 100" class="w-full h-full text-emerald-700/80">
          <!-- Leaves -->
          <ellipse cx="40" cy="70" rx="30" ry="25" fill="currentColor" opacity="0.7" />
          <ellipse cx="30" cy="45" rx="22" ry="20" fill="currentColor" opacity="0.8" />
          <ellipse cx="50" cy="40" rx="20" ry="18" fill="currentColor" opacity="0.75" />
          <!-- Peonies -->
          <circle cx="35" cy="50" r="10" fill="#FDE2E4" />
          <circle cx="35" cy="50" r="6" fill="#FFB3C1" />
          <circle cx="55" cy="42" r="11" fill="#FDE2E4" />
          <circle cx="55" cy="42" r="7" fill="#FFB3C1" />
        </svg>
      `
    }
  ],
  light: [
    {
      id: "L-301",
      name: "Теплая ретро-гирлянда (подвес)",
      code: "L-301",
      category: "light",
      price: 8000,
      width: 200,
      height: 60,
      svgMarkup: `
        <svg viewBox="0 0 100 50" class="w-full h-full text-amber-300 dark:text-amber-200">
          <path d="M5 15 C30 35, 70 35, 95 15" stroke="currentColor" stroke-width="2" fill="none" opacity="0.5" />
          <!-- Bulb hangers -->
          <line x1="25" y1="23" x2="25" y2="30" stroke="currentColor" stroke-width="1.5" />
          <circle cx="25" cy="32" r="4.5" fill="currentColor" style="filter: drop-shadow(0 0 3px #FCD34D)" />
          <line x1="50" y1="26" x2="50" y2="33" stroke="currentColor" stroke-width="1.5" />
          <circle cx="50" cy="35" r="4.5" fill="currentColor" style="filter: drop-shadow(0 0 3px #FCD34D)" />
          <line x1="75" y1="23" x2="75" y2="30" stroke="currentColor" stroke-width="1.5" />
          <circle cx="75" cy="32" r="4.5" fill="currentColor" style="filter: drop-shadow(0 0 3px #FCD34D)" />
        </svg>
      `
    },
    {
      id: "L-302",
      name: "Неоновая вывеска «Together»",
      code: "L-302",
      category: "light",
      price: 15000,
      width: 120,
      height: 40,
      svgMarkup: `
        <svg viewBox="0 0 100 40" class="w-full h-full text-pink-400">
          <text x="50" y="26" font-family="'Caveat', cursive, sans-serif" font-size="20" font-weight="bold" fill="none" stroke="currentColor" stroke-width="1" text-anchor="middle" style="filter: drop-shadow(0 0 3px #F472B6)">Together</text>
          <text x="50" y="26" font-family="'Caveat', cursive, sans-serif" font-size="20" font-weight="bold" fill="currentColor" text-anchor="middle">Together</text>
        </svg>
      `
    },
    {
      id: "L-303",
      name: "Светодиодные диско-шары (подвес)",
      code: "L-303",
      category: "light",
      price: 18000,
      width: 100,
      height: 120,
      svgMarkup: `
        <svg viewBox="0 0 60 100" class="w-full h-full text-violet-300">
          <line x1="30" y1="5" x2="30" y2="50" stroke="currentColor" stroke-width="1.5" />
          <circle cx="30" cy="65" r="15" fill="currentColor" stroke="currentColor" stroke-width="1" opacity="0.9" style="filter: drop-shadow(0 0 5px #A78BFA)" />
          <!-- Disco facets -->
          <line x1="20" y1="65" x2="40" y2="65" stroke="#FFF" stroke-width="0.8" opacity="0.5" />
          <line x1="30" y1="50" x2="30" y2="80" stroke="#FFF" stroke-width="0.8" opacity="0.5" />
        </svg>
      `
    },
    {
      id: "L-304",
      name: "Комплект насыпных восковых свечей",
      code: "L-304",
      category: "light",
      price: 7500,
      width: 60,
      height: 80,
      svgMarkup: `
        <svg viewBox="0 0 60 80" class="w-full h-full text-amber-500">
          <!-- Glass 1 -->
          <rect x="5" y="30" width="14" height="45" stroke="currentColor" stroke-width="1.5" fill="none" rx="1" />
          <rect x="7" y="45" width="10" height="30" fill="currentColor" opacity="0.4" />
          <path d="M12 40 Q14 36 12 32 Q10 36 12 40 Z" fill="#FBBF24" />
          <!-- Glass 2 -->
          <rect x="23" y="15" width="14" height="60" stroke="currentColor" stroke-width="1.5" fill="none" rx="1" />
          <rect x="25" y="35" width="10" height="40" fill="currentColor" opacity="0.4" />
          <path d="M30 30 Q32 26 30 22 Q28 26 30 30 Z" fill="#FBBF24" />
          <!-- Glass 3 -->
          <rect x="41" y="40" width="14" height="35" stroke="currentColor" stroke-width="1.5" fill="none" rx="1" />
          <rect x="43" y="52" width="10" height="23" fill="currentColor" opacity="0.4" />
          <path d="M48 48 Q50 44 48 40 Q46 44 48 48 Z" fill="#FBBF24" />
        </svg>
      `
    }
  ],
  stands: [
    {
      id: "S-401",
      name: "Прозрачный акриловый куб",
      code: "S-401",
      category: "stands",
      price: 4500,
      width: 50,
      height: 100,
      svgMarkup: `
        <svg viewBox="0 0 60 120" class="w-full h-full text-zinc-400 dark:text-zinc-500">
          <rect x="5" y="15" width="50" height="100" stroke="currentColor" stroke-width="2.5" fill="none" opacity="0.8" />
          <!-- Reflections -->
          <line x1="12" y1="25" x2="12" y2="105" stroke="currentColor" stroke-width="0.8" opacity="0.3" />
          <line x1="48" y1="25" x2="48" y2="105" stroke="currentColor" stroke-width="0.8" opacity="0.3" />
        </svg>
      `
    },
    {
      id: "S-402",
      name: "Золотая металлическая стойка",
      code: "S-402",
      category: "stands",
      price: 5500,
      width: 40,
      height: 120,
      svgMarkup: `
        <svg viewBox="0 0 50 120" class="w-full h-full text-amber-500/80">
          <rect x="10" y="10" width="30" height="105" stroke="currentColor" stroke-width="2" fill="none" />
          <!-- Top plate -->
          <line x1="5" y1="10" x2="45" y2="10" stroke="currentColor" stroke-width="3" />
          <line x1="5" y1="115" x2="45" y2="115" stroke="currentColor" stroke-width="3" />
        </svg>
      `
    },
    {
      id: "S-403",
      name: "Премиум зеркальная колонна (серебро)",
      code: "S-403",
      category: "stands",
      price: 8500,
      width: 60,
      height: 110,
      svgMarkup: `
        <svg viewBox="0 0 60 110" class="w-full h-full text-zinc-300 dark:text-zinc-600">
          <rect x="5" y="5" width="50" height="100" fill="currentColor" opacity="0.35" stroke="currentColor" stroke-width="2" />
          <!-- Diagonal mirror slashes -->
          <line x1="15" y1="5" x2="45" y2="105" stroke="#FFF" stroke-width="2" opacity="0.6" />
          <line x1="25" y1="5" x2="55" y2="105" stroke="#FFF" stroke-width="1" opacity="0.4" />
        </svg>
      `
    }
  ],
  tables: [
    {
      id: "T-501",
      name: "Круглый стол гостей (Банкетный)",
      code: "T-501",
      category: "tables",
      price: 12000,
      width: 150,
      height: 80,
      svgMarkup: `
        <svg viewBox="0 0 120 80" class="w-full h-full text-zinc-300 dark:text-zinc-700">
          <!-- Table cover drape -->
          <path d="M10 35 L10 75 Q20 80 30 75 T50 75 T70 75 T90 75 T110 75 L110 35 Z" fill="currentColor" stroke="currentColor" stroke-width="1.5" />
          <ellipse cx="60" cy="35" rx="50" ry="15" fill="#F3F4F6" stroke="currentColor" stroke-width="2" />
          <!-- Table decoration center vase -->
          <ellipse cx="60" cy="32" rx="4" ry="2" fill="#D1D5DB" />
          <line x1="60" y1="32" x2="60" y2="20" stroke="#9CA3AF" stroke-width="1" />
          <circle cx="60" cy="18" r="4.5" fill="#FCA5A5" />
        </svg>
      `
    },
    {
      id: "T-502",
      name: "Дизайнерский стул Кьявари (серебро)",
      code: "T-502",
      category: "tables",
      price: 450,
      width: 45,
      height: 90,
      svgMarkup: `
        <svg viewBox="0 0 45 90" class="w-full h-full text-zinc-400 dark:text-zinc-500">
          <!-- Backrest -->
          <line x1="10" y1="10" x2="10" y2="50" stroke="currentColor" stroke-width="2" />
          <line x1="35" y1="10" x2="35" y2="50" stroke="currentColor" stroke-width="2" />
          <line x1="10" y1="15" x2="35" y2="15" stroke="currentColor" stroke-width="1.5" />
          <line x1="10" y1="25" x2="35" y2="25" stroke="currentColor" stroke-width="1.5" />
          <line x1="10" y1="35" x2="35" y2="35" stroke="currentColor" stroke-width="1.5" />
          <!-- Vertical struts -->
          <line x1="18" y1="15" x2="18" y2="35" stroke="currentColor" stroke-width="1" />
          <line x1="27" y1="15" x2="27" y2="35" stroke="currentColor" stroke-width="1" />
          <!-- Seat cushion -->
          <rect x="8" y="45" width="29" height="6" fill="#F3F4F6" stroke="currentColor" stroke-width="2" rx="1.5" />
          <!-- Legs -->
          <line x1="12" y1="51" x2="10" y2="88" stroke="currentColor" stroke-width="2" />
          <line x1="33" y1="51" x2="35" y2="88" stroke="currentColor" stroke-width="2" />
          <line x1="10" y1="70" x2="35" y2="70" stroke="currentColor" stroke-width="1" />
        </svg>
      `
    },
    {
      id: "T-503",
      name: "Стол Президиум (Прямоугольный)",
      code: "T-503",
      category: "tables",
      price: 28000,
      width: 260,
      height: 85,
      svgMarkup: `
        <svg viewBox="0 0 160 70" class="w-full h-full text-zinc-100 dark:text-zinc-700">
          <!-- Drape skirt folds -->
          <rect x="10" y="25" width="140" height="42" fill="currentColor" stroke="#D1D5DB" stroke-width="2" rx="1" />
          <!-- Folds lines -->
          <line x1="30" y1="25" x2="30" y2="67" stroke="#E5E7EB" stroke-width="1.5" />
          <line x1="55" y1="25" x2="55" y2="67" stroke="#E5E7EB" stroke-width="1.5" />
          <line x1="80" y1="25" x2="80" y2="67" stroke="#E5E7EB" stroke-width="1.5" />
          <line x1="105" y1="25" x2="105" y2="67" stroke="#E5E7EB" stroke-width="1.5" />
          <line x1="130" y1="25" x2="130" y2="67" stroke="#E5E7EB" stroke-width="1.5" />
          <!-- Table top -->
          <rect x="5" y="18" width="150" height="8" fill="#F9FAFB" stroke="#9CA3AF" stroke-width="1.5" rx="2" />
        </svg>
      `
    }
  ],
  textiles: [
    {
      id: "TX-601",
      name: "Воздушный фатин (драпировка)",
      code: "TX-601",
      category: "textiles",
      price: 14000,
      width: 160,
      height: 220,
      svgMarkup: `
        <svg viewBox="0 0 100 140" class="w-full h-full text-violet-100/70">
          <path d="M10 10 Q35 25 50 10 T90 10 L80 135 Q50 125 20 135 Z" fill="currentColor" opacity="0.6" stroke="currentColor" stroke-width="1" />
          <path d="M25 15 C40 30, 60 0, 75 15 L65 130 C50 120, 35 130, 35 130 Z" fill="#FFF" opacity="0.4" />
          <path d="M10 10 C20 40, 20 80, 20 135" stroke="currentColor" stroke-width="1" opacity="0.4" fill="none" />
          <path d="M90 10 C80 40, 80 80, 80 135" stroke="currentColor" stroke-width="1" opacity="0.4" fill="none" />
        </svg>
      `
    },
    {
      id: "TX-602",
      name: "Тяжелая портьера (бархат, пыльная роза)",
      code: "TX-602",
      category: "textiles",
      price: 19500,
      width: 80,
      height: 260,
      svgMarkup: `
        <svg viewBox="0 0 50 150" class="w-full h-full text-rose-300 dark:text-rose-400">
          <path d="M5 5 L45 5 L40 145 L15 145 Z" fill="currentColor" />
          <!-- Folds dark and light ridges -->
          <path d="M15 5 C15 50 20 100 20 145" stroke="#BE123C" stroke-width="2.5" opacity="0.3" fill="none" />
          <path d="M30 5 C30 50 32 100 32 145" stroke="#BE123C" stroke-width="2.5" opacity="0.3" fill="none" />
          <path d="M10 5 C11 50 12 100 15 145" stroke="#FFF" stroke-width="1.5" opacity="0.25" fill="none" />
          <path d="M40 5 C38 50 35 100 33 145" stroke="#FFF" stroke-width="1.5" opacity="0.25" fill="none" />
        </svg>
      `
    }
  ],
  balloons: [
    {
      id: "B-701",
      name: "Разнокалиберная арка из шаров",
      code: "B-701",
      category: "balloons",
      price: 22000,
      width: 200,
      height: 200,
      svgMarkup: `
        <svg viewBox="0 0 120 120" class="w-full h-full text-violet-300">
          <!-- Clusters of balloons -->
          <circle cx="20" cy="100" r="14" fill="currentColor" stroke="#C08EF4" stroke-width="1" />
          <circle cx="34" cy="92" r="9" fill="#FFF" stroke="#C08EF4" stroke-width="1" opacity="0.9" />
          <circle cx="15" cy="80" r="11" fill="#F472B6" stroke="#F472B6" stroke-width="1" />
          <circle cx="25" cy="65" r="15" fill="currentColor" stroke="#C08EF4" stroke-width="1" />
          <circle cx="40" cy="55" r="10" fill="#FFF" stroke="#C08EF4" stroke-width="1" opacity="0.9" />
          <circle cx="32" cy="40" r="14" fill="#F472B6" stroke="#F472B6" stroke-width="1" />
          <circle cx="50" cy="30" r="16" fill="currentColor" stroke="#C08EF4" stroke-width="1" />
          <circle cx="68" cy="24" r="11" fill="#FFF" stroke="#C08EF4" stroke-width="1" opacity="0.9" />
          <circle cx="82" cy="32" r="15" fill="#F472B6" stroke="#F472B6" stroke-width="1" />
          <circle cx="95" cy="48" r="13" fill="currentColor" stroke="#C08EF4" stroke-width="1" />
          <circle cx="102" cy="68" r="16" fill="#FFF" stroke="#C08EF4" stroke-width="1" opacity="0.9" />
        </svg>
      `
    },
    {
      id: "B-702",
      name: "Связка шаров «Фонтан» (золото)",
      code: "B-702",
      category: "balloons",
      price: 6000,
      width: 60,
      height: 140,
      svgMarkup: `
        <svg viewBox="0 0 60 140" class="w-full h-full text-amber-400">
          <!-- Balloon strings -->
          <path d="M30 135 L30 60" stroke="#9CA3AF" stroke-width="1.5" />
          <path d="M30 135 L18 50" stroke="#9CA3AF" stroke-width="1" />
          <path d="M30 135 L42 52" stroke="#9CA3AF" stroke-width="1" />
          <!-- Balloons -->
          <ellipse cx="18" cy="45" rx="9" ry="12" fill="currentColor" style="filter: drop-shadow(0 0 2px rgba(245,158,11,0.3))" />
          <ellipse cx="42" cy="47" rx="9" ry="12" fill="currentColor" style="filter: drop-shadow(0 0 2px rgba(245,158,11,0.3))" />
          <ellipse cx="30" cy="30" rx="11" ry="15" fill="#FEF3C7" stroke="currentColor" stroke-width="1.5" style="filter: drop-shadow(0 0 3px rgba(245,158,11,0.5))" />
          <!-- Ties at the bottom -->
          <polygon points="30,45 27,50 33,50" fill="currentColor" />
        </svg>
      `
    }
  ],
  decor: [
    {
      id: "D-801",
      name: "Высокая хрустальная ваза",
      code: "D-801",
      category: "decor",
      price: 3500,
      width: 40,
      height: 100,
      svgMarkup: `
        <svg viewBox="0 0 40 100" class="w-full h-full text-zinc-300 dark:text-zinc-600">
          <ellipse cx="20" cy="15" rx="14" ry="5" stroke="currentColor" stroke-width="2" fill="none" />
          <path d="M6 15 C10 35, 14 65, 14 85 L26 85 C26 65, 30 35, 34 15 Z" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity="0.1" />
          <ellipse cx="20" cy="85" rx="10" ry="4" stroke="currentColor" stroke-width="2" fill="currentColor" />
          <!-- Reflection lines -->
          <line x1="20" y1="25" x2="20" y2="75" stroke="#FFF" stroke-width="1.5" opacity="0.5" />
        </svg>
      `
    },
    {
      id: "D-802",
      name: "Свечной канделябр пятирожковый",
      code: "D-802",
      category: "decor",
      price: 5800,
      width: 50,
      height: 90,
      svgMarkup: `
        <svg viewBox="0 0 60 90" class="w-full h-full text-amber-600">
          <line x1="30" y1="20" x2="30" y2="80" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" />
          <ellipse cx="30" cy="80" rx="14" ry="6" fill="currentColor" />
          <!-- Branches -->
          <path d="M12 35 C12 55, 30 55, 30 55 C30 55, 48 55, 48 35" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" />
          <!-- Cups for candles -->
          <rect x="9" y="27" width="6" height="8" fill="currentColor" />
          <rect x="27" y="12" width="6" height="8" fill="currentColor" />
          <rect x="45" y="27" width="6" height="8" fill="currentColor" />
          <!-- White candles -->
          <rect x="11" y="15" width="2.5" height="12" fill="#F3F4F6" />
          <rect x="29" y="0" width="2.5" height="12" fill="#F3F4F6" />
          <rect x="47" y="15" width="2.5" height="12" fill="#F3F4F6" />
          <!-- Flames -->
          <circle cx="12" cy="11" r="2" fill="#F59E0B" style="filter: drop-shadow(0 0 1.5px #EF4444)" />
          <circle cx="30" cy="-4" r="2.5" fill="#F59E0B" style="filter: drop-shadow(0 0 2px #EF4444)" />
          <circle cx="48" cy="11" r="2" fill="#F59E0B" style="filter: drop-shadow(0 0 1.5px #EF4444)" />
        </svg>
      `
    }
  ]
};
