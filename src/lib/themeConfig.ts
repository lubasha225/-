export interface ColorScheme {
  id: string;
  name: string;
  group?: 'vibrant' | 'pastel';
  from: string;      // Primary Gradient Start
  to: string;        // Primary Gradient End
  accent: string;    // Light mode accent color
  accentDark?: string; // Bright/luminous dark mode accent color
  deep: string;      // Deep primary color for light mode contrast
  comp1: string;     // Complementary Spot Color 1
  comp2: string;     // Complementary Spot Color 2
  comp3: string;     // Complementary Spot Color 3
  softLight: string; // Light mode soft background for icons/badges
  softDark: string;  // Dark mode soft background
  defaultBgId: string; // Default background preset for this scheme
}

export interface BgPreset {
  id: string;
  name: string;
  schemeId?: string; // Associated color scheme ID (if matching)
  type: 'gradient' | 'enhancing' | 'pastel' | 'classic';
  previewCss: string;
  lightBg: string;
  darkBg: string;
  hideBlobs?: boolean;
  spots?: {
    s1: string;
    s2: string;
    s3: string;
    s4: string;
  };
}

export interface FontPreset {
  id: string;
  name: string;
  fontFamily: string;
  category: string;
  description: string;
}

export const FONT_PRESETS: FontPreset[] = [
  {
    id: 'jost',
    name: 'Jost',
    fontFamily: '"Jost", sans-serif',
    category: 'Геометрический',
    description: 'Элегантный, чистый и сбалансированный гротеск',
  },
  {
    id: 'inter',
    name: 'Inter',
    fontFamily: '"Inter", sans-serif',
    category: 'Интерфейсный',
    description: 'Мировой эталон читаемости и нейтральной четкости',
  },
  {
    id: 'manrope',
    name: 'Manrope',
    fontFamily: '"Manrope", sans-serif',
    category: 'Премиальный',
    description: 'Современный мягкий гротеск с открытыми формами',
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    fontFamily: '"Montserrat", sans-serif',
    category: 'Выразительный',
    description: 'Четкие формы, высокая плотность и характерный стиль',
  },
  {
    id: 'golos',
    name: 'Golos Text',
    fontFamily: '"Golos Text", sans-serif',
    category: 'Эргономичный',
    description: 'Специально оптимизирован для удобства чтения кириллицы',
  },
];

export const COLOR_SCHEMES: ColorScheme[] = [
  // --- НАСЫЩЕННЫЕ ПАЛИТРЫ (Vibrant & Classic) ---
  {
    id: 'blackberry',
    name: 'Ежевика',
    group: 'vibrant',
    from: '#9D5CE8',
    to: '#682FA8',
    accent: '#6E2DAF',
    accentDark: '#C084FC',
    deep: '#58238F',
    comp1: '#F472B6', // Rose Pink
    comp2: '#7DD3FC', // Sky Blue
    comp3: '#FDBA74', // Warm Amber
    softLight: '#F3ECFC',
    softDark: '#2C1645',
    defaultBgId: 'bg-blackberry-gradient-1',
  },
  {
    id: 'orange',
    name: 'Апельсин',
    group: 'vibrant',
    from: '#FFA114',
    to: '#F25800',
    accent: '#E64A00',
    accentDark: '#FF9E2C',
    deep: '#BF360C',
    comp1: '#FB7185', // Coral Pink
    comp2: '#E879F9', // Soft Magenta
    comp3: '#FACC15', // Golden Sunshine
    softLight: '#FFF4E8',
    softDark: '#3A1705',
    defaultBgId: 'bg-orange-gradient-1',
  },
  {
    id: 'lime',
    name: 'Лайм',
    group: 'vibrant',
    from: '#82A800',
    to: '#4D7D00',
    accent: '#447200',
    accentDark: '#A3E635',
    deep: '#365900',
    comp1: '#2DD4BF', // Turquoise Aqua
    comp2: '#FACC15', // Sunny Yellow
    comp3: '#FB7185', // Soft Coral Pink
    softLight: '#F4F8E4',
    softDark: '#1A2603',
    defaultBgId: 'bg-lime-gradient-1',
  },
  {
    id: 'pine',
    name: 'Хвоя',
    group: 'vibrant',
    from: '#4AE06D',
    to: '#008C46',
    accent: '#007A3B',
    accentDark: '#4ADE80',
    deep: '#00572A',
    comp1: '#2DD4BF', // Mint Turquoise
    comp2: '#FDE047', // Sun Yellow
    comp3: '#C084FC', // Soft Violet
    softLight: '#E8F8ED',
    softDark: '#072E18',
    defaultBgId: 'bg-pine-gradient-1',
  },
  {
    id: 'azure',
    name: 'Лазурь',
    group: 'vibrant',
    from: '#00E8EC',
    to: '#009EA8',
    accent: '#007680',
    accentDark: '#22F2F8',
    deep: '#005E66',
    comp1: '#C084FC', // Soft Violet
    comp2: '#F472B6', // Rose Pink
    comp3: '#FDE047', // Golden Sunlight
    softLight: '#E4FAFB',
    softDark: '#022527',
    defaultBgId: 'bg-azure-gradient-1',
  },
  {
    id: 'sea',
    name: 'Море',
    group: 'vibrant',
    from: '#2688FF',
    to: '#0047BA',
    accent: '#0047BA',
    accentDark: '#60A5FA',
    deep: '#00338A',
    comp1: '#A78BFA', // Periwinkle Violet
    comp2: '#F472B6', // Soft Magenta
    comp3: '#2DD4BF', // Cyan Mint
    softLight: '#E8F2FF',
    softDark: '#061740',
    defaultBgId: 'bg-sea-gradient-1',
  },
  {
    id: 'raspberry',
    name: 'Малина',
    group: 'vibrant',
    from: '#FF24D6',
    to: '#B30075',
    accent: '#B30075',
    accentDark: '#FF66E2',
    deep: '#8A0059',
    comp1: '#FDBA74', // Warm Amber
    comp2: '#C084FC', // Soft Violet
    comp3: '#FDE047', // Golden Glow
    softLight: '#FFEAF7',
    softDark: '#3B0427',
    defaultBgId: 'bg-raspberry-gradient-1',
  },
  {
    id: 'night',
    name: 'Ночь',
    group: 'vibrant',
    from: '#8B5CF6',
    to: '#4C1D95',
    accent: '#6D28D9',
    accentDark: '#C4B5FD',
    deep: '#4C1D95',
    comp1: '#C084FC', // Violet Spark
    comp2: '#2DD4BF', // Teal Glow
    comp3: '#FB7185', // Coral Rose
    softLight: '#F0EAFA',
    softDark: '#221238',
    defaultBgId: 'bg-night-gradient-1',
  },

  // --- ПАСТЕЛЬНЫЕ И ПРИГЛУШЕННЫЕ ТОНА (Pastel Stack) ---
  {
    id: 'sage',
    name: 'Шалфей',
    group: 'pastel',
    from: '#86B596',
    to: '#4E8360',
    accent: '#3B6E4D',
    accentDark: '#86EFAC',
    deep: '#295238',
    comp1: '#B5D6C0', // Light Sage
    comp2: '#E2B696', // Warm Sand
    comp3: '#96B5AB', // Mint Sage
    softLight: '#EEF7F1',
    softDark: '#10281B',
    defaultBgId: 'bg-sage-gradient-1',
  },
  {
    id: 'denim',
    name: 'Джинс',
    group: 'pastel',
    from: '#4D82B8',
    to: '#1F4770',
    accent: '#275B8F',
    accentDark: '#93C5FD',
    deep: '#183E63',
    comp1: '#7FA8BD', // Soft Blue
    comp2: '#BD7F99', // Dusty Rose
    comp3: '#7FBD99', // Ocean Sage
    softLight: '#ECF3FA',
    softDark: '#0D2036',
    defaultBgId: 'bg-denim-gradient-1',
  },
  {
    id: 'lilac',
    name: 'Лиловый',
    group: 'pastel',
    from: '#B075B0',
    to: '#6B3D6B',
    accent: '#6B3D6B',
    accentDark: '#E9D5FF',
    deep: '#542C54',
    comp1: '#C299C2', // Soft Lilac
    comp2: '#999966', // Olive Accent
    comp3: '#669999', // Slate Teal
    softLight: '#F7EEF7',
    softDark: '#2B142B',
    defaultBgId: 'bg-lilac-gradient-1',
  },
  {
    id: 'powder',
    name: 'Пудра',
    group: 'pastel',
    from: '#D989B1',
    to: '#94446E',
    accent: '#8C3864',
    accentDark: '#F9A8D4',
    deep: '#73274E',
    comp1: '#E5B5CD', // Soft Pink
    comp2: '#ABCC8A', // Pale Sage
    comp3: '#8AABCC', // Soft Cornflower
    softLight: '#FBF0F5',
    softDark: '#301222',
    defaultBgId: 'bg-powder-gradient-1',
  },
  {
    id: 'lavender-soft',
    name: 'Лаванда',
    group: 'pastel',
    from: '#8C74AA',
    to: '#4E3E69',
    accent: '#574275',
    accentDark: '#DDD6FE',
    deep: '#42305C',
    comp1: '#A899C2', // Pastel Violet
    comp2: '#998A66', // Muted Gold
    comp3: '#66998A', // Eucalyptus
    softLight: '#F3EEF9',
    softDark: '#201630',
    defaultBgId: 'bg-lavender-soft-gradient-1',
  },
];

export const BG_PRESETS: BgPreset[] = [
  // Чистый серый градиент без пятен (Универсальный 5-й пресет для всех тем)
  {
    id: 'bg-pure-grey-gradient',
    name: 'Серый градиент (Без пятен)',
    type: 'gradient',
    hideBlobs: true,
    previewCss: 'linear-gradient(145deg, #8E8E93 0%, #3A3A3C 100%)',
    lightBg: 'linear-gradient(145deg, #FAFAFC 0%, #EEEEF2 50%, #DFE1E6 100%)',
    darkBg: 'linear-gradient(145deg, #323236 0%, #202024 50%, #111114 100%)',
  },

  // Ежевика (Blackberry / Purple) Presets
  {
    id: 'bg-blackberry-gradient-1',
    name: 'Субли Аврора (Ежевика)',
    schemeId: 'blackberry',
    type: 'gradient',
    spots: { s1: '#C084FC', s2: '#F472B6', s3: '#FDBA74', s4: '#7DD3FC' },
    previewCss: 'radial-gradient(at 0% 0%, #C084FC 0px, transparent 55%), radial-gradient(at 100% 0%, #F472B6 0px, transparent 55%), radial-gradient(at 100% 100%, #FDBA74 0px, transparent 55%), radial-gradient(at 0% 100%, #7DD3FC 0px, transparent 55%), #F6F4FA',
    lightBg: 'radial-gradient(at 0% 0%, rgba(192, 132, 252, 0.45) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(244, 114, 182, 0.4) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(253, 186, 116, 0.35) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(125, 211, 252, 0.4) 0px, transparent 50%), #F6F4FA',
    darkBg: 'radial-gradient(at 0% 0%, rgba(126, 34, 206, 0.4) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(219, 39, 119, 0.35) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(217, 119, 6, 0.25) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(2, 132, 199, 0.3) 0px, transparent 50%), #0A0612',
  },
  {
    id: 'bg-blackberry-gradient-2',
    name: 'Аметистовый туман',
    schemeId: 'blackberry',
    type: 'gradient',
    spots: { s1: '#2DD4BF', s2: '#34D399', s3: '#FACC15', s4: '#E879F9' },
    previewCss: 'radial-gradient(at 15% 15%, #2DD4BF 0px, transparent 55%), radial-gradient(at 85% 15%, #34D399 0px, transparent 55%), radial-gradient(at 85% 85%, #FACC15 0px, transparent 55%), radial-gradient(at 15% 85%, #E879F9 0px, transparent 55%), #F7F4FB',
    lightBg: 'radial-gradient(at 15% 15%, rgba(45, 212, 191, 0.45) 0px, transparent 50%), radial-gradient(at 85% 15%, rgba(52, 211, 153, 0.4) 0px, transparent 50%), radial-gradient(at 85% 85%, rgba(250, 204, 21, 0.35) 0px, transparent 50%), radial-gradient(at 15% 85%, rgba(232, 121, 249, 0.38) 0px, transparent 50%), #F7F4FB',
    darkBg: 'radial-gradient(at 15% 15%, rgba(15, 118, 110, 0.4) 0px, transparent 50%), radial-gradient(at 85% 15%, rgba(5, 150, 105, 0.35) 0px, transparent 50%), radial-gradient(at 85% 85%, rgba(161, 98, 7, 0.3) 0px, transparent 50%), radial-gradient(at 15% 85%, rgba(147, 51, 234, 0.35) 0px, transparent 50%), #0D0714',
  },
  {
    id: 'bg-blackberry-enhancing',
    name: 'Ежевичный усиливающий',
    schemeId: 'blackberry',
    type: 'enhancing',
    spots: { s1: '#8C52D0', s2: '#A855F7', s3: '#EC4899', s4: '#8C52D0' },
    previewCss: 'radial-gradient(at 0% 0%, #8C52D0 0px, transparent 50%), radial-gradient(at 100% 0%, #A855F7 0px, transparent 50%), radial-gradient(at 100% 100%, #EC4899 0px, transparent 50%), radial-gradient(at 0% 100%, #8C52D0 0px, transparent 50%), #F0EBF9',
    lightBg: 'radial-gradient(at 0% 0%, rgba(140, 82, 208, 0.5) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(168, 85, 247, 0.45) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(236, 72, 153, 0.4) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(140, 82, 208, 0.45) 0px, transparent 50%), #F0EBF9',
    darkBg: 'radial-gradient(at 0% 0%, rgba(140, 82, 208, 0.5) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(168, 85, 247, 0.45) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(236, 72, 153, 0.4) 0px, transparent 50%), #1B0E2A',
  },
  {
    id: 'bg-blackberry-pastel',
    name: 'Ежевичный пастель (Однотонный)',
    schemeId: 'blackberry',
    type: 'pastel',
    previewCss: '#F6F4FA',
    lightBg: '#F6F4FA',
    darkBg: '#0E0817',
  },

  // Апельсин (Orange) Presets
  {
    id: 'bg-orange-gradient-1',
    name: 'Солнечный рассвет',
    schemeId: 'orange',
    type: 'gradient',
    spots: { s1: '#F97316', s2: '#FB7185', s3: '#FACC15', s4: '#E879F9' },
    previewCss: 'radial-gradient(at 0% 0%, #F97316 0px, transparent 55%), radial-gradient(at 100% 0%, #FB7185 0px, transparent 55%), radial-gradient(at 100% 100%, #FACC15 0px, transparent 55%), radial-gradient(at 0% 100%, #E879F9 0px, transparent 55%), #FFFBF7',
    lightBg: 'radial-gradient(at 0% 0%, rgba(249, 115, 22, 0.45) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(251, 113, 133, 0.4) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(250, 204, 21, 0.45) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(232, 121, 249, 0.35) 0px, transparent 50%), #FFFBF7',
    darkBg: 'radial-gradient(at 0% 0%, rgba(194, 65, 12, 0.4) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(190, 18, 60, 0.35) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(161, 98, 7, 0.32) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(162, 28, 175, 0.28) 0px, transparent 50%), #120803',
  },
  {
    id: 'bg-orange-gradient-2',
    name: 'Цитрусовый фреш',
    schemeId: 'orange',
    type: 'gradient',
    spots: { s1: '#2DD4BF', s2: '#A3E635', s3: '#C084FC', s4: '#FDBA74' },
    previewCss: 'radial-gradient(at 15% 15%, #2DD4BF 0px, transparent 55%), radial-gradient(at 85% 15%, #A3E635 0px, transparent 55%), radial-gradient(at 85% 85%, #C084FC 0px, transparent 55%), radial-gradient(at 15% 85%, #FDBA74 0px, transparent 55%), #FFFDF9',
    lightBg: 'radial-gradient(at 15% 15%, rgba(45, 212, 191, 0.45) 0px, transparent 50%), radial-gradient(at 85% 15%, rgba(163, 230, 53, 0.42) 0px, transparent 50%), radial-gradient(at 85% 85%, rgba(192, 132, 252, 0.38) 0px, transparent 50%), radial-gradient(at 15% 85%, rgba(253, 186, 116, 0.35) 0px, transparent 50%), #FFFDF9',
    darkBg: 'radial-gradient(at 15% 15%, rgba(15, 118, 110, 0.38) 0px, transparent 50%), radial-gradient(at 85% 15%, rgba(77, 124, 15, 0.35) 0px, transparent 50%), radial-gradient(at 85% 85%, rgba(126, 34, 206, 0.35) 0px, transparent 50%), radial-gradient(at 15% 85%, rgba(194, 65, 12, 0.3) 0px, transparent 50%), #120902',
  },
  {
    id: 'bg-orange-enhancing',
    name: 'Апельсиновый усиливающий',
    schemeId: 'orange',
    type: 'enhancing',
    spots: { s1: '#F35B04', s2: '#FCA001', s3: '#F43F5E', s4: '#F35B04' },
    previewCss: 'radial-gradient(at 0% 0%, #F35B04 0px, transparent 50%), radial-gradient(at 100% 0%, #FCA001 0px, transparent 50%), radial-gradient(at 100% 100%, #F43F5E 0px, transparent 50%), radial-gradient(at 0% 100%, #F35B04 0px, transparent 50%), #FFF4E5',
    lightBg: 'radial-gradient(at 0% 0%, rgba(243, 91, 4, 0.5) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(252, 160, 1, 0.45) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(244, 63, 94, 0.4) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(243, 91, 4, 0.45) 0px, transparent 50%), #FFF4E5',
    darkBg: 'radial-gradient(at 0% 0%, rgba(243, 91, 4, 0.5) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(252, 160, 1, 0.45) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(244, 63, 94, 0.4) 0px, transparent 50%), #3A1804',
  },
  {
    id: 'bg-orange-pastel',
    name: 'Апельсиновый пастель (Однотонный)',
    schemeId: 'orange',
    type: 'pastel',
    previewCss: '#FFF8F0',
    lightBg: '#FFF8F0',
    darkBg: '#180E05',
  },

  // Лайм (Lime) Presets
  {
    id: 'bg-lime-gradient-1',
    name: 'Лаймовая свежесть',
    schemeId: 'lime',
    type: 'gradient',
    spots: { s1: '#BBCC00', s2: '#66BF00', s3: '#2DD4BF', s4: '#FB7185' },
    previewCss: 'radial-gradient(at 0% 0%, #BBCC00 0px, transparent 55%), radial-gradient(at 100% 0%, #66BF00 0px, transparent 55%), radial-gradient(at 100% 100%, #2DD4BF 0px, transparent 55%), radial-gradient(at 0% 100%, #FB7185 0px, transparent 55%), #FAFDF5',
    lightBg: 'radial-gradient(at 0% 0%, rgba(187, 204, 0, 0.45) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(102, 191, 0, 0.42) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(45, 212, 191, 0.38) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(251, 113, 133, 0.35) 0px, transparent 50%), #FAFDF5',
    darkBg: 'radial-gradient(at 0% 0%, rgba(102, 191, 0, 0.38) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(78, 142, 0, 0.35) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(15, 118, 110, 0.3) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(190, 18, 60, 0.28) 0px, transparent 50%), #0A0F05',
  },
  {
    id: 'bg-lime-gradient-2',
    name: 'Мятный бриз',
    schemeId: 'lime',
    type: 'gradient',
    spots: { s1: '#38BDF8', s2: '#C084FC', s3: '#BBCC00', s4: '#66BF00' },
    previewCss: 'radial-gradient(at 20% 20%, #38BDF8 0px, transparent 55%), radial-gradient(at 80% 20%, #C084FC 0px, transparent 55%), radial-gradient(at 85% 85%, #BBCC00 0px, transparent 55%), radial-gradient(at 15% 85%, #66BF00 0px, transparent 55%), #F8FCF3',
    lightBg: 'radial-gradient(at 20% 15%, rgba(56, 189, 248, 0.42) 0px, transparent 50%), radial-gradient(at 80% 20%, rgba(192, 132, 252, 0.45) 0px, transparent 50%), radial-gradient(at 85% 85%, rgba(187, 204, 0, 0.38) 0px, transparent 50%), radial-gradient(at 15% 85%, rgba(102, 191, 0, 0.32) 0px, transparent 50%), #F8FCF3',
    darkBg: 'radial-gradient(at 20% 15%, rgba(2, 132, 199, 0.38) 0px, transparent 50%), radial-gradient(at 80% 20%, rgba(126, 34, 206, 0.38) 0px, transparent 50%), radial-gradient(at 85% 85%, rgba(102, 191, 0, 0.3) 0px, transparent 50%), radial-gradient(at 15% 85%, rgba(78, 142, 0, 0.28) 0px, transparent 50%), #081004',
  },
  {
    id: 'bg-lime-enhancing',
    name: 'Лаймовый усиливающий',
    schemeId: 'lime',
    type: 'enhancing',
    spots: { s1: '#66BF00', s2: '#BBCC00', s3: '#10B981', s4: '#66BF00' },
    previewCss: 'radial-gradient(at 0% 0%, #66BF00 0px, transparent 50%), radial-gradient(at 100% 0%, #BBCC00 0px, transparent 50%), radial-gradient(at 100% 100%, #10B981 0px, transparent 50%), radial-gradient(at 0% 100%, #66BF00 0px, transparent 50%), #F7FBE6',
    lightBg: 'radial-gradient(at 0% 0%, rgba(102, 191, 0, 0.5) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(187, 204, 0, 0.45) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.4) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(102, 191, 0, 0.45) 0px, transparent 50%), #F7FBE6',
    darkBg: 'radial-gradient(at 0% 0%, rgba(102, 191, 0, 0.5) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(187, 204, 0, 0.45) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.4) 0px, transparent 50%), #1C2903',
  },
  {
    id: 'bg-lime-pastel',
    name: 'Лаймовый пастель (Однотонный)',
    schemeId: 'lime',
    type: 'pastel',
    previewCss: '#FAFCF0',
    lightBg: '#FAFCF0',
    darkBg: '#0F1608',
  },

  // Хвоя (Pine) Presets
  {
    id: 'bg-pine-gradient-1',
    name: 'Лесная сказка',
    schemeId: 'pine',
    type: 'gradient',
    spots: { s1: '#46D13E', s2: '#008241', s3: '#38BDF8', s4: '#C084FC' },
    previewCss: 'radial-gradient(at 0% 0%, #46D13E 0px, transparent 55%), radial-gradient(at 100% 0%, #008241 0px, transparent 55%), radial-gradient(at 100% 100%, #38BDF8 0px, transparent 55%), radial-gradient(at 0% 100%, #C084FC 0px, transparent 55%), #F3FAF4',
    lightBg: 'radial-gradient(at 0% 0%, rgba(70, 209, 62, 0.48) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(0, 130, 65, 0.4) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(56, 189, 248, 0.38) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(192, 132, 252, 0.35) 0px, transparent 50%), #F3FAF4',
    darkBg: 'radial-gradient(at 0% 0%, rgba(0, 130, 65, 0.38) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(0, 99, 49, 0.3) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(2, 132, 199, 0.3) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(126, 34, 206, 0.28) 0px, transparent 50%), #040E05',
  },
  {
    id: 'bg-pine-gradient-2',
    name: 'Хвойный туман',
    schemeId: 'pine',
    type: 'gradient',
    spots: { s1: '#46D13E', s2: '#F472B6', s3: '#2DD4BF', s4: '#008241' },
    previewCss: 'radial-gradient(at 20% 20%, #46D13E 0px, transparent 55%), radial-gradient(at 80% 20%, #F472B6 0px, transparent 55%), radial-gradient(at 80% 80%, #2DD4BF 0px, transparent 55%), radial-gradient(at 20% 80%, #008241 0px, transparent 55%), #F4FAF5',
    lightBg: 'radial-gradient(at 15% 20%, rgba(70, 209, 62, 0.42) 0px, transparent 50%), radial-gradient(at 85% 15%, rgba(244, 114, 182, 0.45) 0px, transparent 50%), radial-gradient(at 80% 80%, rgba(45, 212, 191, 0.35) 0px, transparent 50%), radial-gradient(at 20% 80%, rgba(0, 130, 65, 0.32) 0px, transparent 50%), #F4FAF5',
    darkBg: 'radial-gradient(at 15% 20%, rgba(0, 130, 65, 0.38) 0px, transparent 50%), radial-gradient(at 85% 15%, rgba(190, 24, 93, 0.38) 0px, transparent 50%), radial-gradient(at 80% 80%, rgba(15, 118, 110, 0.3) 0px, transparent 50%), radial-gradient(at 20% 80%, rgba(0, 99, 49, 0.28) 0px, transparent 50%), #030B03',
  },
  {
    id: 'bg-pine-enhancing',
    name: 'Хвойный усиливающий',
    schemeId: 'pine',
    type: 'enhancing',
    spots: { s1: '#008241', s2: '#46D13E', s3: '#059669', s4: '#008241' },
    previewCss: 'radial-gradient(at 0% 0%, #008241 0px, transparent 50%), radial-gradient(at 100% 0%, #46D13E 0px, transparent 50%), radial-gradient(at 100% 100%, #059669 0px, transparent 50%), radial-gradient(at 0% 100%, #008241 0px, transparent 50%), #E8F8ED',
    lightBg: 'radial-gradient(at 0% 0%, rgba(0, 130, 65, 0.5) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(70, 209, 62, 0.45) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(5, 150, 105, 0.4) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(0, 130, 65, 0.45) 0px, transparent 50%), #E8F8ED',
    darkBg: 'radial-gradient(at 0% 0%, rgba(0, 130, 65, 0.5) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(70, 209, 62, 0.45) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(5, 150, 105, 0.4) 0px, transparent 50%), #042614',
  },
  {
    id: 'bg-pine-pastel',
    name: 'Хвойный пастель (Однотонный)',
    schemeId: 'pine',
    type: 'pastel',
    previewCss: '#F2FAF2',
    lightBg: '#F2FAF2',
    darkBg: '#061604',
  },

  // Лазурь (Azure) Presets
  {
    id: 'bg-azure-gradient-1',
    name: 'Лазурный берег',
    schemeId: 'azure',
    type: 'gradient',
    spots: { s1: '#00E2E6', s2: '#00A0AB', s3: '#FDE047', s4: '#F472B6' },
    previewCss: 'radial-gradient(at 0% 0%, #00E2E6 0px, transparent 55%), radial-gradient(at 100% 0%, #00A0AB 0px, transparent 55%), radial-gradient(at 100% 100%, #FDE047 0px, transparent 55%), radial-gradient(at 0% 100%, #F472B6 0px, transparent 55%), #F0FDFF',
    lightBg: 'radial-gradient(at 0% 0%, rgba(0, 226, 230, 0.48) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(0, 160, 171, 0.45) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(253, 224, 71, 0.42) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(244, 114, 182, 0.38) 0px, transparent 50%), #F0FDFF',
    darkBg: 'radial-gradient(at 0% 0%, rgba(0, 160, 171, 0.42) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(0, 120, 130, 0.38) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(161, 98, 7, 0.3) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(190, 24, 93, 0.32) 0px, transparent 50%), #021014',
  },
  {
    id: 'bg-azure-gradient-2',
    name: 'Аквамарин',
    schemeId: 'azure',
    type: 'gradient',
    spots: { s1: '#00E2E6', s2: '#FB7185', s3: '#818CF8', s4: '#00A0AB' },
    previewCss: 'radial-gradient(at 15% 15%, #00E2E6 0px, transparent 55%), radial-gradient(at 85% 15%, #FB7185 0px, transparent 55%), radial-gradient(at 85% 85%, #818CF8 0px, transparent 55%), radial-gradient(at 15% 85%, #00A0AB 0px, transparent 55%), #F2FCFD',
    lightBg: 'radial-gradient(at 15% 15%, rgba(0, 226, 230, 0.42) 0px, transparent 50%), radial-gradient(at 85% 15%, rgba(251, 113, 133, 0.45) 0px, transparent 50%), radial-gradient(at 85% 85%, rgba(129, 140, 248, 0.35) 0px, transparent 50%), radial-gradient(at 15% 85%, rgba(0, 160, 171, 0.4) 0px, transparent 50%), #F2FCFD',
    darkBg: 'radial-gradient(at 15% 15%, rgba(0, 160, 171, 0.38) 0px, transparent 50%), radial-gradient(at 85% 15%, rgba(190, 18, 60, 0.38) 0px, transparent 50%), radial-gradient(at 85% 85%, rgba(67, 56, 202, 0.3) 0px, transparent 50%), radial-gradient(at 15% 85%, rgba(0, 120, 130, 0.35) 0px, transparent 50%), #010C0F',
  },
  {
    id: 'bg-azure-enhancing',
    name: 'Лазурный усиливающий',
    schemeId: 'azure',
    type: 'enhancing',
    spots: { s1: '#00A0AB', s2: '#00E2E6', s3: '#3B82F6', s4: '#00A0AB' },
    previewCss: 'radial-gradient(at 0% 0%, #00A0AB 0px, transparent 50%), radial-gradient(at 100% 0%, #00E2E6 0px, transparent 50%), radial-gradient(at 100% 100%, #3B82F6 0px, transparent 50%), radial-gradient(at 0% 100%, #00A0AB 0px, transparent 50%), #E6FBFC',
    lightBg: 'radial-gradient(at 0% 0%, rgba(0, 160, 171, 0.5) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(0, 226, 230, 0.45) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(59, 130, 246, 0.4) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(0, 160, 171, 0.45) 0px, transparent 50%), #E6FBFC',
    darkBg: 'radial-gradient(at 0% 0%, rgba(0, 160, 171, 0.5) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(0, 226, 230, 0.45) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(59, 130, 246, 0.4) 0px, transparent 50%), #022426',
  },
  {
    id: 'bg-azure-pastel',
    name: 'Лазурный пастель (Однотонный)',
    schemeId: 'azure',
    type: 'pastel',
    previewCss: '#F0FCFD',
    lightBg: '#F0FCFD',
    darkBg: '#03171B',
  },

  // Море (Sea) Presets
  {
    id: 'bg-sea-gradient-1',
    name: 'Морская глубина',
    schemeId: 'sea',
    type: 'gradient',
    spots: { s1: '#38BDF8', s2: '#C084FC', s3: '#F472B6', s4: '#2DD4BF' },
    previewCss: 'radial-gradient(at 0% 0%, #38BDF8 0px, transparent 55%), radial-gradient(at 100% 0%, #C084FC 0px, transparent 55%), radial-gradient(at 100% 100%, #F472B6 0px, transparent 55%), radial-gradient(at 0% 100%, #2DD4BF 0px, transparent 55%), #F0F6FF',
    lightBg: 'radial-gradient(at 0% 0%, rgba(56, 189, 248, 0.48) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(192, 132, 252, 0.42) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(244, 114, 182, 0.35) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(45, 212, 191, 0.38) 0px, transparent 50%), #F0F6FF',
    darkBg: 'radial-gradient(at 0% 0%, rgba(2, 132, 199, 0.42) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(126, 34, 206, 0.38) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(190, 24, 93, 0.3) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(15, 118, 110, 0.3) 0px, transparent 50%), #02081B',
  },
  {
    id: 'bg-sea-gradient-2',
    name: 'Океанский бриз',
    schemeId: 'sea',
    type: 'gradient',
    spots: { s1: '#818CF8', s2: '#34D399', s3: '#F97316', s4: '#A78BFA' },
    previewCss: 'radial-gradient(at 20% 20%, #818CF8 0px, transparent 55%), radial-gradient(at 80% 20%, #34D399 0px, transparent 55%), radial-gradient(at 85% 85%, #F97316 0px, transparent 55%), radial-gradient(at 15% 85%, #A78BFA 0px, transparent 55%), #F2F7FE',
    lightBg: 'radial-gradient(at 20% 15%, rgba(129, 140, 248, 0.42) 0px, transparent 50%), radial-gradient(at 80% 20%, rgba(52, 211, 153, 0.4) 0px, transparent 50%), radial-gradient(at 85% 85%, rgba(249, 115, 22, 0.35) 0px, transparent 50%), radial-gradient(at 15% 85%, rgba(167, 139, 250, 0.32) 0px, transparent 50%), #F2F7FE',
    darkBg: 'radial-gradient(at 20% 15%, rgba(67, 56, 202, 0.4) 0px, transparent 50%), radial-gradient(at 80% 20%, rgba(5, 150, 105, 0.38) 0px, transparent 50%), radial-gradient(at 85% 85%, rgba(194, 65, 12, 0.32) 0px, transparent 50%), radial-gradient(at 15% 85%, rgba(109, 40, 217, 0.28) 0px, transparent 50%), #020921',
  },
  {
    id: 'bg-sea-enhancing',
    name: 'Морской усиливающий',
    schemeId: 'sea',
    type: 'enhancing',
    spots: { s1: '#0055DD', s2: '#0077FF', s3: '#6366F1', s4: '#0055DD' },
    previewCss: 'radial-gradient(at 0% 0%, #0055DD 0px, transparent 50%), radial-gradient(at 100% 0%, #0077FF 0px, transparent 50%), radial-gradient(at 100% 100%, #6366F1 0px, transparent 50%), radial-gradient(at 0% 100%, #0055DD 0px, transparent 50%), #E8F2FF',
    lightBg: 'radial-gradient(at 0% 0%, rgba(0, 85, 221, 0.5) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(0, 119, 255, 0.45) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(99, 102, 241, 0.4) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(0, 85, 221, 0.45) 0px, transparent 50%), #E8F2FF',
    darkBg: 'radial-gradient(at 0% 0%, rgba(0, 85, 221, 0.5) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(0, 119, 255, 0.45) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(99, 102, 241, 0.4) 0px, transparent 50%), #020C38',
  },
  {
    id: 'bg-sea-pastel',
    name: 'Морской пастель (Однотонный)',
    schemeId: 'sea',
    type: 'pastel',
    previewCss: '#F0F6FF',
    lightBg: '#F0F6FF',
    darkBg: '#030A24',
  },

  // Малина (Raspberry) Presets
  {
    id: 'bg-raspberry-gradient-1',
    name: 'Малиновый закат',
    schemeId: 'raspberry',
    type: 'gradient',
    spots: { s1: '#E879F9', s2: '#FDBA74', s3: '#FDE047', s4: '#C084FC' },
    previewCss: 'radial-gradient(at 0% 0%, #E879F9 0px, transparent 55%), radial-gradient(at 100% 0%, #FDBA74 0px, transparent 55%), radial-gradient(at 100% 100%, #FDE047 0px, transparent 55%), radial-gradient(at 0% 100%, #C084FC 0px, transparent 55%), #FCF0F7',
    lightBg: 'radial-gradient(at 0% 0%, rgba(232, 121, 249, 0.48) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(253, 186, 116, 0.45) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(253, 224, 71, 0.4) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(192, 132, 252, 0.4) 0px, transparent 50%), #FCF0F7',
    darkBg: 'radial-gradient(at 0% 0%, rgba(192, 38, 211, 0.4) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(194, 65, 12, 0.35) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(161, 98, 7, 0.3) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(126, 34, 206, 0.35) 0px, transparent 50%), #13000D',
  },
  {
    id: 'bg-raspberry-gradient-2',
    name: 'Ягодный мусс',
    schemeId: 'raspberry',
    type: 'gradient',
    spots: { s1: '#38BDF8', s2: '#2DD4BF', s3: '#A3E635', s4: '#F472B6' },
    previewCss: 'radial-gradient(at 20% 20%, #38BDF8 0px, transparent 55%), radial-gradient(at 80% 20%, #2DD4BF 0px, transparent 55%), radial-gradient(at 85% 85%, #A3E635 0px, transparent 55%), radial-gradient(at 15% 85%, #F472B6 0px, transparent 55%), #FDF2F9',
    lightBg: 'radial-gradient(at 20% 15%, rgba(56, 189, 248, 0.45) 0px, transparent 50%), radial-gradient(at 80% 20%, rgba(45, 212, 191, 0.4) 0px, transparent 50%), radial-gradient(at 85% 85%, rgba(163, 230, 53, 0.38) 0px, transparent 50%), radial-gradient(at 15% 85%, rgba(244, 114, 182, 0.35) 0px, transparent 50%), #FDF2F9',
    darkBg: 'radial-gradient(at 20% 15%, rgba(2, 132, 199, 0.38) 0px, transparent 50%), radial-gradient(at 80% 20%, rgba(15, 118, 110, 0.32) 0px, transparent 50%), radial-gradient(at 85% 85%, rgba(77, 124, 15, 0.35) 0px, transparent 50%), radial-gradient(at 15% 85%, rgba(190, 24, 93, 0.28) 0px, transparent 50%), #17000F',
  },
  {
    id: 'bg-raspberry-enhancing',
    name: 'Малиновый усиливающий',
    schemeId: 'raspberry',
    type: 'enhancing',
    spots: { s1: '#D800AE', s2: '#FF00D0', s3: '#F43F5E', s4: '#D800AE' },
    previewCss: 'radial-gradient(at 0% 0%, #D800AE 0px, transparent 50%), radial-gradient(at 100% 0%, #FF00D0 0px, transparent 50%), radial-gradient(at 100% 100%, #F43F5E 0px, transparent 50%), radial-gradient(at 0% 100%, #D800AE 0px, transparent 50%), #FFEBF8',
    lightBg: 'radial-gradient(at 0% 0%, rgba(216, 0, 174, 0.5) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(255, 0, 208, 0.45) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(244, 63, 94, 0.4) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(216, 0, 174, 0.45) 0px, transparent 50%), #FFEBF8',
    darkBg: 'radial-gradient(at 0% 0%, rgba(216, 0, 174, 0.5) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(255, 0, 208, 0.45) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(244, 63, 94, 0.4) 0px, transparent 50%), #330021',
  },
  {
    id: 'bg-raspberry-pastel',
    name: 'Малиновый пастель (Однотонный)',
    schemeId: 'raspberry',
    type: 'pastel',
    previewCss: '#FCF0F8',
    lightBg: '#FCF0F8',
    darkBg: '#1C0012',
  },

  // Ночь (Night) Presets
  {
    id: 'bg-night-gradient-1',
    name: 'Ночной бархат',
    schemeId: 'night',
    type: 'gradient',
    spots: { s1: '#818CF8', s2: '#C084FC', s3: '#2DD4BF', s4: '#FB7185' },
    previewCss: 'radial-gradient(at 0% 0%, #818CF8 0px, transparent 55%), radial-gradient(at 100% 0%, #C084FC 0px, transparent 55%), radial-gradient(at 100% 100%, #2DD4BF 0px, transparent 55%), radial-gradient(at 0% 100%, #FB7185 0px, transparent 55%), #F3F0F8',
    lightBg: 'radial-gradient(at 0% 0%, rgba(129, 140, 248, 0.45) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(192, 132, 252, 0.42) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(45, 212, 191, 0.38) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(251, 113, 133, 0.35) 0px, transparent 50%), #F3F0F8',
    darkBg: 'radial-gradient(at 0% 0%, rgba(67, 56, 202, 0.45) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(126, 34, 206, 0.4) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(15, 118, 110, 0.35) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(190, 18, 60, 0.32) 0px, transparent 50%), #06020E',
  },
  {
    id: 'bg-night-gradient-2',
    name: 'Полуночный блик',
    schemeId: 'night',
    type: 'gradient',
    spots: { s1: '#A78BFA', s2: '#38BDF8', s3: '#FDE047', s4: '#F472B6' },
    previewCss: 'radial-gradient(at 20% 20%, #A78BFA 0px, transparent 55%), radial-gradient(at 80% 20%, #38BDF8 0px, transparent 55%), radial-gradient(at 80% 80%, #FDE047 0px, transparent 55%), radial-gradient(at 20% 80%, #F472B6 0px, transparent 55%), #F2F0F6',
    lightBg: 'radial-gradient(at 20% 20%, rgba(167, 139, 250, 0.42) 0px, transparent 50%), radial-gradient(at 80% 20%, rgba(56, 189, 248, 0.4) 0px, transparent 50%), radial-gradient(at 80% 80%, rgba(253, 224, 71, 0.35) 0px, transparent 50%), radial-gradient(at 20% 80%, rgba(244, 114, 182, 0.3) 0px, transparent 50%), #F2F0F6',
    darkBg: 'radial-gradient(at 20% 20%, rgba(109, 40, 217, 0.4) 0px, transparent 50%), radial-gradient(at 80% 20%, rgba(2, 132, 199, 0.38) 0px, transparent 50%), radial-gradient(at 80% 80%, rgba(161, 98, 7, 0.3) 0px, transparent 50%), radial-gradient(at 20% 80%, rgba(190, 24, 93, 0.22) 0px, transparent 50%), #05010B',
  },
  {
    id: 'bg-night-enhancing',
    name: 'Ночной усиливающий',
    schemeId: 'night',
    type: 'enhancing',
    spots: { s1: '#7B4BB0', s2: '#3B1C63', s3: '#8B5CF6', s4: '#7B4BB0' },
    previewCss: 'radial-gradient(at 0% 0%, #7B4BB0 0px, transparent 50%), radial-gradient(at 100% 0%, #3B1C63 0px, transparent 50%), radial-gradient(at 100% 100%, #8B5CF6 0px, transparent 50%), radial-gradient(at 0% 100%, #7B4BB0 0px, transparent 50%), #EFE8F8',
    lightBg: 'radial-gradient(at 0% 0%, rgba(123, 75, 176, 0.5) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(59, 28, 99, 0.45) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.4) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(123, 75, 176, 0.45) 0px, transparent 50%), #EFE8F8',
    darkBg: 'radial-gradient(at 0% 0%, rgba(123, 75, 176, 0.5) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(59, 28, 99, 0.45) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.4) 0px, transparent 50%), #1B0E2A',
  },
  {
    id: 'bg-night-pastel',
    name: 'Ночной пастель (Однотонный)',
    schemeId: 'night',
    type: 'pastel',
    previewCss: '#F4F2F7',
    lightBg: '#F4F2F7',
    darkBg: '#08020F',
  },

  // Шалфей (Sage) Presets
  {
    id: 'bg-sage-gradient-1',
    name: 'Шалфейная дымка',
    schemeId: 'sage',
    type: 'gradient',
    spots: { s1: '#86B596', s2: '#5C946E', s3: '#B5D6C0', s4: '#E2B696' },
    previewCss: 'radial-gradient(at 0% 0%, #86B596 0px, transparent 55%), radial-gradient(at 100% 0%, #5C946E 0px, transparent 55%), radial-gradient(at 100% 100%, #B5D6C0 0px, transparent 55%), radial-gradient(at 0% 100%, #E2B696 0px, transparent 55%), #F4F8F5',
    lightBg: 'radial-gradient(at 0% 0%, rgba(134, 181, 150, 0.45) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(92, 148, 110, 0.4) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(181, 214, 192, 0.38) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(226, 182, 150, 0.32) 0px, transparent 50%), #F4F8F5',
    darkBg: 'radial-gradient(at 0% 0%, rgba(92, 148, 110, 0.38) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(61, 105, 75, 0.35) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(40, 75, 55, 0.28) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(120, 95, 75, 0.22) 0px, transparent 50%), #0A140E',
  },
  {
    id: 'bg-sage-gradient-2',
    name: 'Эвкалиптовый сад',
    schemeId: 'sage',
    type: 'gradient',
    spots: { s1: '#A3D9C9', s2: '#C2E0C6', s3: '#E8D5B5', s4: '#86B596' },
    previewCss: 'radial-gradient(at 20% 20%, #A3D9C9 0px, transparent 55%), radial-gradient(at 80% 20%, #C2E0C6 0px, transparent 55%), radial-gradient(at 85% 85%, #E8D5B5 0px, transparent 55%), radial-gradient(at 15% 85%, #86B596 0px, transparent 55%), #F6F9F6',
    lightBg: 'radial-gradient(at 20% 15%, rgba(163, 217, 201, 0.42) 0px, transparent 50%), radial-gradient(at 80% 20%, rgba(194, 224, 198, 0.4) 0px, transparent 50%), radial-gradient(at 85% 85%, rgba(232, 213, 181, 0.35) 0px, transparent 50%), radial-gradient(at 15% 85%, rgba(134, 181, 150, 0.38) 0px, transparent 50%), #F6F9F6',
    darkBg: 'radial-gradient(at 20% 15%, rgba(55, 110, 95, 0.35) 0px, transparent 50%), radial-gradient(at 80% 20%, rgba(65, 105, 75, 0.32) 0px, transparent 50%), radial-gradient(at 85% 85%, rgba(115, 95, 65, 0.25) 0px, transparent 50%), radial-gradient(at 15% 85%, rgba(92, 148, 110, 0.3) 0px, transparent 50%), #08120C',
  },
  {
    id: 'bg-sage-enhancing',
    name: 'Шалфейный акцент',
    schemeId: 'sage',
    type: 'enhancing',
    spots: { s1: '#5C946E', s2: '#86B596', s3: '#3D694B', s4: '#5C946E' },
    previewCss: 'radial-gradient(at 0% 0%, #5C946E 0px, transparent 50%), radial-gradient(at 100% 0%, #86B596 0px, transparent 50%), radial-gradient(at 100% 100%, #3D694B 0px, transparent 50%), radial-gradient(at 0% 100%, #5C946E 0px, transparent 50%), #F1F7F3',
    lightBg: 'radial-gradient(at 0% 0%, rgba(92, 148, 110, 0.48) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(134, 181, 150, 0.45) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(61, 105, 75, 0.4) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(92, 148, 110, 0.45) 0px, transparent 50%), #F1F7F3',
    darkBg: 'radial-gradient(at 0% 0%, rgba(92, 148, 110, 0.45) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(134, 181, 150, 0.38) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(61, 105, 75, 0.4) 0px, transparent 50%), #13251A',
  },
  {
    id: 'bg-sage-pastel',
    name: 'Шалфейный пастель (Однотонный)',
    schemeId: 'sage',
    type: 'pastel',
    previewCss: '#F1F7F3',
    lightBg: '#F1F7F3',
    darkBg: '#0B150F',
  },

  // Джинс (Denim) Presets
  {
    id: 'bg-denim-gradient-1',
    name: 'Индиго & Деним',
    schemeId: 'denim',
    type: 'gradient',
    spots: { s1: '#2A527A', s2: '#427FBD', s3: '#7FA8BD', s4: '#BD7F99' },
    previewCss: 'radial-gradient(at 0% 0%, #2A527A 0px, transparent 55%), radial-gradient(at 100% 0%, #427FBD 0px, transparent 55%), radial-gradient(at 100% 100%, #7FA8BD 0px, transparent 55%), radial-gradient(at 0% 100%, #BD7F99 0px, transparent 55%), #F2F5F8',
    lightBg: 'radial-gradient(at 0% 0%, rgba(42, 82, 122, 0.42) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(66, 127, 189, 0.4) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(127, 168, 189, 0.35) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(189, 127, 153, 0.3) 0px, transparent 50%), #F2F5F8',
    darkBg: 'radial-gradient(at 0% 0%, rgba(30, 62, 95, 0.45) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(66, 127, 189, 0.38) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(40, 80, 110, 0.3) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(100, 50, 75, 0.25) 0px, transparent 50%), #0A121A',
  },
  {
    id: 'bg-denim-gradient-2',
    name: 'Морской шторм',
    schemeId: 'denim',
    type: 'gradient',
    spots: { s1: '#427FBD', s2: '#7FA8BD', s3: '#85A8A0', s4: '#2A527A' },
    previewCss: 'radial-gradient(at 20% 20%, #427FBD 0px, transparent 55%), radial-gradient(at 80% 20%, #7FA8BD 0px, transparent 55%), radial-gradient(at 85% 85%, #85A8A0 0px, transparent 55%), radial-gradient(at 15% 85%, #2A527A 0px, transparent 55%), #F4F7FA',
    lightBg: 'radial-gradient(at 20% 15%, rgba(66, 127, 189, 0.42) 0px, transparent 50%), radial-gradient(at 80% 20%, rgba(127, 168, 189, 0.38) 0px, transparent 50%), radial-gradient(at 85% 85%, rgba(133, 168, 160, 0.32) 0px, transparent 50%), radial-gradient(at 15% 85%, rgba(42, 82, 122, 0.38) 0px, transparent 50%), #F4F7FA',
    darkBg: 'radial-gradient(at 20% 15%, rgba(66, 127, 189, 0.35) 0px, transparent 50%), radial-gradient(at 80% 20%, rgba(40, 85, 110, 0.32) 0px, transparent 50%), radial-gradient(at 85% 85%, rgba(45, 90, 80, 0.25) 0px, transparent 50%), radial-gradient(at 15% 85%, rgba(30, 62, 95, 0.38) 0px, transparent 50%), #081017',
  },
  {
    id: 'bg-denim-enhancing',
    name: 'Джинсовый акцент',
    schemeId: 'denim',
    type: 'enhancing',
    spots: { s1: '#427FBD', s2: '#2A527A', s3: '#1E3E5F', s4: '#427FBD' },
    previewCss: 'radial-gradient(at 0% 0%, #427FBD 0px, transparent 50%), radial-gradient(at 100% 0%, #2A527A 0px, transparent 50%), radial-gradient(at 100% 100%, #1E3E5F 0px, transparent 50%), radial-gradient(at 0% 100%, #427FBD 0px, transparent 50%), #EEF4FA',
    lightBg: 'radial-gradient(at 0% 0%, rgba(66, 127, 189, 0.48) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(42, 82, 122, 0.45) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(30, 62, 95, 0.4) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(66, 127, 189, 0.45) 0px, transparent 50%), #EEF4FA',
    darkBg: 'radial-gradient(at 0% 0%, rgba(66, 127, 189, 0.45) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(42, 82, 122, 0.4) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(30, 62, 95, 0.45) 0px, transparent 50%), #0D1C2C',
  },
  {
    id: 'bg-denim-pastel',
    name: 'Джинсовый пастель (Однотонный)',
    schemeId: 'denim',
    type: 'pastel',
    previewCss: '#EEF4FA',
    lightBg: '#EEF4FA',
    darkBg: '#09131C',
  },

  // Лиловый (Lilac) Presets
  {
    id: 'bg-lilac-gradient-1',
    name: 'Лиловый рассвет',
    schemeId: 'lilac',
    type: 'gradient',
    spots: { s1: '#996699', s2: '#805480', s3: '#C299C2', s4: '#999966' },
    previewCss: 'radial-gradient(at 0% 0%, #996699 0px, transparent 55%), radial-gradient(at 100% 0%, #805480 0px, transparent 55%), radial-gradient(at 100% 100%, #C299C2 0px, transparent 55%), radial-gradient(at 0% 100%, #999966 0px, transparent 55%), #F8F4F8',
    lightBg: 'radial-gradient(at 0% 0%, rgba(153, 102, 153, 0.45) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(128, 84, 128, 0.4) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(194, 153, 194, 0.38) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(153, 153, 102, 0.28) 0px, transparent 50%), #F8F4F8',
    darkBg: 'radial-gradient(at 0% 0%, rgba(128, 84, 128, 0.4) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(96, 59, 96, 0.38) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(153, 102, 153, 0.3) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(90, 90, 50, 0.22) 0px, transparent 50%), #140C14',
  },
  {
    id: 'bg-lilac-gradient-2',
    name: 'Сиреневый туман',
    schemeId: 'lilac',
    type: 'gradient',
    spots: { s1: '#C299C2', s2: '#805480', s3: '#669999', s4: '#996699' },
    previewCss: 'radial-gradient(at 20% 20%, #C299C2 0px, transparent 55%), radial-gradient(at 80% 20%, #805480 0px, transparent 55%), radial-gradient(at 85% 85%, #669999 0px, transparent 55%), radial-gradient(at 15% 85%, #996699 0px, transparent 55%), #FAF6FA',
    lightBg: 'radial-gradient(at 20% 15%, rgba(194, 153, 194, 0.42) 0px, transparent 50%), radial-gradient(at 80% 20%, rgba(128, 84, 128, 0.4) 0px, transparent 50%), radial-gradient(at 85% 85%, rgba(102, 153, 153, 0.32) 0px, transparent 50%), radial-gradient(at 15% 85%, rgba(153, 102, 153, 0.38) 0px, transparent 50%), #FAF6FA',
    darkBg: 'radial-gradient(at 20% 15%, rgba(153, 102, 153, 0.35) 0px, transparent 50%), radial-gradient(at 80% 20%, rgba(96, 59, 96, 0.35) 0px, transparent 50%), radial-gradient(at 85% 85%, rgba(50, 95, 95, 0.25) 0px, transparent 50%), radial-gradient(at 15% 85%, rgba(128, 84, 128, 0.3) 0px, transparent 50%), #120912',
  },
  {
    id: 'bg-lilac-enhancing',
    name: 'Лиловый акцент',
    schemeId: 'lilac',
    type: 'enhancing',
    spots: { s1: '#996699', s2: '#805480', s3: '#603B60', s4: '#996699' },
    previewCss: 'radial-gradient(at 0% 0%, #996699 0px, transparent 50%), radial-gradient(at 100% 0%, #805480 0px, transparent 50%), radial-gradient(at 100% 100%, #603B60 0px, transparent 50%), radial-gradient(at 0% 100%, #996699 0px, transparent 50%), #F8F2F8',
    lightBg: 'radial-gradient(at 0% 0%, rgba(153, 102, 153, 0.48) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(128, 84, 128, 0.45) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(96, 59, 96, 0.4) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(153, 102, 153, 0.45) 0px, transparent 50%), #F8F2F8',
    darkBg: 'radial-gradient(at 0% 0%, rgba(153, 102, 153, 0.45) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(128, 84, 128, 0.4) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(96, 59, 96, 0.45) 0px, transparent 50%), #241424',
  },
  {
    id: 'bg-lilac-pastel',
    name: 'Лиловый пастель (Однотонный)',
    schemeId: 'lilac',
    type: 'pastel',
    previewCss: '#F8F2F8',
    lightBg: '#F8F2F8',
    darkBg: '#130A13',
  },

  // Пудра (Powder) Presets
  {
    id: 'bg-powder-gradient-1',
    name: 'Пудровый шелк',
    schemeId: 'powder',
    type: 'gradient',
    spots: { s1: '#CC8AAB', s2: '#B0648A', s3: '#E5B5CD', s4: '#8AABCC' },
    previewCss: 'radial-gradient(at 0% 0%, #CC8AAB 0px, transparent 55%), radial-gradient(at 100% 0%, #B0648A 0px, transparent 55%), radial-gradient(at 100% 100%, #E5B5CD 0px, transparent 55%), radial-gradient(at 0% 100%, #8AABCC 0px, transparent 55%), #FAF4F7',
    lightBg: 'radial-gradient(at 0% 0%, rgba(204, 138, 171, 0.45) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(176, 100, 138, 0.4) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(229, 181, 205, 0.38) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(138, 171, 204, 0.3) 0px, transparent 50%), #FAF4F7',
    darkBg: 'radial-gradient(at 0% 0%, rgba(176, 100, 138, 0.4) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(140, 69, 105, 0.38) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(180, 110, 145, 0.28) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(60, 90, 120, 0.22) 0px, transparent 50%), #170A12',
  },
  {
    id: 'bg-powder-gradient-2',
    name: 'Винтажный румянец',
    schemeId: 'powder',
    type: 'gradient',
    spots: { s1: '#E5B5CD', s2: '#B0648A', s3: '#ABCC8A', s4: '#CC8AAB' },
    previewCss: 'radial-gradient(at 20% 20%, #E5B5CD 0px, transparent 55%), radial-gradient(at 80% 20%, #B0648A 0px, transparent 55%), radial-gradient(at 85% 85%, #ABCC8A 0px, transparent 55%), radial-gradient(at 15% 85%, #CC8AAB 0px, transparent 55%), #FCF6F9',
    lightBg: 'radial-gradient(at 20% 15%, rgba(229, 181, 205, 0.42) 0px, transparent 50%), radial-gradient(at 80% 20%, rgba(176, 100, 138, 0.4) 0px, transparent 50%), radial-gradient(at 85% 85%, rgba(171, 204, 138, 0.28) 0px, transparent 50%), radial-gradient(at 15% 85%, rgba(204, 138, 171, 0.38) 0px, transparent 50%), #FCF6F9',
    darkBg: 'radial-gradient(at 20% 15%, rgba(176, 100, 138, 0.35) 0px, transparent 50%), radial-gradient(at 80% 20%, rgba(140, 69, 105, 0.35) 0px, transparent 50%), radial-gradient(at 85% 85%, rgba(85, 115, 65, 0.22) 0px, transparent 50%), radial-gradient(at 15% 85%, rgba(176, 100, 138, 0.3) 0px, transparent 50%), #140810',
  },
  {
    id: 'bg-powder-enhancing',
    name: 'Пудровый акцент',
    schemeId: 'powder',
    type: 'enhancing',
    spots: { s1: '#B0648A', s2: '#CC8AAB', s3: '#8C4569', s4: '#B0648A' },
    previewCss: 'radial-gradient(at 0% 0%, #B0648A 0px, transparent 50%), radial-gradient(at 100% 0%, #CC8AAB 0px, transparent 50%), radial-gradient(at 100% 100%, #8C4569 0px, transparent 50%), radial-gradient(at 0% 100%, #B0648A 0px, transparent 50%), #FCF3F7',
    lightBg: 'radial-gradient(at 0% 0%, rgba(176, 100, 138, 0.48) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(204, 138, 171, 0.45) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(140, 69, 105, 0.4) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(176, 100, 138, 0.45) 0px, transparent 50%), #FCF3F7',
    darkBg: 'radial-gradient(at 0% 0%, rgba(176, 100, 138, 0.45) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(204, 138, 171, 0.4) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(140, 69, 105, 0.45) 0px, transparent 50%), #2B121F',
  },
  {
    id: 'bg-powder-pastel',
    name: 'Пудровый пастель (Однотонный)',
    schemeId: 'powder',
    type: 'pastel',
    previewCss: '#FCF3F7',
    lightBg: '#FCF3F7',
    darkBg: '#150911',
  },

  // Лаванда пастельная (Lavender Soft) Presets
  {
    id: 'bg-lavender-soft-gradient-1',
    name: 'Лавандовая нега',
    schemeId: 'lavender-soft',
    type: 'gradient',
    spots: { s1: '#7D6699', s2: '#625480', s3: '#A899C2', s4: '#998A66' },
    previewCss: 'radial-gradient(at 0% 0%, #7D6699 0px, transparent 55%), radial-gradient(at 100% 0%, #625480 0px, transparent 55%), radial-gradient(at 100% 100%, #A899C2 0px, transparent 55%), radial-gradient(at 0% 100%, #998A66 0px, transparent 55%), #F6F4F9',
    lightBg: 'radial-gradient(at 0% 0%, rgba(125, 102, 153, 0.45) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(98, 84, 128, 0.4) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(168, 153, 194, 0.38) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(153, 138, 102, 0.28) 0px, transparent 50%), #F6F4F9',
    darkBg: 'radial-gradient(at 0% 0%, rgba(125, 102, 153, 0.4) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(78, 62, 105, 0.38) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(140, 115, 175, 0.3) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(90, 80, 50, 0.22) 0px, transparent 50%), #110D18',
  },
  {
    id: 'bg-lavender-soft-gradient-2',
    name: 'Прованский вечер',
    schemeId: 'lavender-soft',
    type: 'gradient',
    spots: { s1: '#A899C2', s2: '#625480', s3: '#66998A', s4: '#7D6699' },
    previewCss: 'radial-gradient(at 20% 20%, #A899C2 0px, transparent 55%), radial-gradient(at 80% 20%, #625480 0px, transparent 55%), radial-gradient(at 85% 85%, #66998A 0px, transparent 55%), radial-gradient(at 15% 85%, #7D6699 0px, transparent 55%), #F8F6FA',
    lightBg: 'radial-gradient(at 20% 15%, rgba(168, 153, 194, 0.42) 0px, transparent 50%), radial-gradient(at 80% 20%, rgba(98, 84, 128, 0.4) 0px, transparent 50%), radial-gradient(at 85% 85%, rgba(102, 153, 138, 0.3) 0px, transparent 50%), radial-gradient(at 15% 85%, rgba(125, 102, 153, 0.38) 0px, transparent 50%), #F8F6FA',
    darkBg: 'radial-gradient(at 20% 15%, rgba(140, 115, 175, 0.35) 0px, transparent 50%), radial-gradient(at 80% 20%, rgba(78, 62, 105, 0.35) 0px, transparent 50%), radial-gradient(at 85% 85%, rgba(50, 95, 80, 0.25) 0px, transparent 50%), radial-gradient(at 15% 85%, rgba(125, 102, 153, 0.3) 0px, transparent 50%), #0F0A15',
  },
  {
    id: 'bg-lavender-soft-enhancing',
    name: 'Лавандовый акцент',
    schemeId: 'lavender-soft',
    type: 'enhancing',
    spots: { s1: '#7D6699', s2: '#625480', s3: '#4E3E69', s4: '#7D6699' },
    previewCss: 'radial-gradient(at 0% 0%, #7D6699 0px, transparent 50%), radial-gradient(at 100% 0%, #625480 0px, transparent 50%), radial-gradient(at 100% 100%, #4E3E69 0px, transparent 50%), radial-gradient(at 0% 100%, #7D6699 0px, transparent 50%), #F5F2F9',
    lightBg: 'radial-gradient(at 0% 0%, rgba(125, 102, 153, 0.48) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(98, 84, 128, 0.45) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(78, 62, 105, 0.4) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(125, 102, 153, 0.45) 0px, transparent 50%), #F5F2F9',
    darkBg: 'radial-gradient(at 0% 0%, rgba(125, 102, 153, 0.45) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(98, 84, 128, 0.4) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(78, 62, 105, 0.45) 0px, transparent 50%), #1E1729',
  },
  {
    id: 'bg-lavender-soft-pastel',
    name: 'Лавандовый пастель (Однотонный)',
    schemeId: 'lavender-soft',
    type: 'pastel',
    previewCss: '#F5F2F9',
    lightBg: '#F5F2F9',
    darkBg: '#0F0B15',
  },

  // Графит / Монохром (Graphite / Monochrome Grey Gradient) Presets
  {
    id: 'bg-graphite-gradient',
    name: 'Серый градиент (Без акцентов)',
    schemeId: 'graphite',
    type: 'gradient',
    previewCss: 'linear-gradient(145deg, #71717A 0%, #27272A 100%)',
    lightBg: 'linear-gradient(145deg, #F4F4F5 0%, #E4E4E7 50%, #D4D4D8 100%)',
    darkBg: 'linear-gradient(145deg, #27272A 0%, #18181B 50%, #09090B 100%)',
  },
  {
    id: 'bg-graphite-deep',
    name: 'Графитовая глубина',
    schemeId: 'graphite',
    type: 'gradient',
    previewCss: 'radial-gradient(at 0% 0%, #52525B 0px, transparent 60%), radial-gradient(at 100% 100%, #18181B 0px, transparent 60%), #27272A',
    lightBg: 'radial-gradient(at 0% 0%, rgba(212, 212, 216, 0.7) 0px, transparent 60%), radial-gradient(at 100% 100%, rgba(161, 161, 170, 0.5) 0px, transparent 60%), #F4F4F5',
    darkBg: 'radial-gradient(at 0% 0%, rgba(63, 63, 70, 0.7) 0px, transparent 60%), radial-gradient(at 100% 100%, rgba(24, 24, 27, 0.9) 0px, transparent 60%), #09090B',
  },
  {
    id: 'bg-graphite-enhancing',
    name: 'Монохромный контраст',
    schemeId: 'graphite',
    type: 'enhancing',
    previewCss: 'linear-gradient(135deg, #52525B 0%, #18181B 100%)',
    lightBg: 'linear-gradient(135deg, #E4E4E7 0%, #D4D4D8 100%)',
    darkBg: 'linear-gradient(135deg, #27272A 0%, #09090B 100%)',
  },
  {
    id: 'bg-graphite-pastel',
    name: 'Пастельный серый (Монохром)',
    schemeId: 'graphite',
    type: 'pastel',
    previewCss: '#E4E4E7',
    lightBg: '#F4F4F5',
    darkBg: '#121214',
  },

  // Classic Universal Preset
  {
    id: 'bg-classic-neutral',
    name: 'Классический нейтральный',
    type: 'classic',
    previewCss: 'linear-gradient(145deg, #F5F3F8, #EDEAF2)',
    lightBg: 'radial-gradient(1100px 600px at 0% 0%, #FAF9FC 0, transparent 55%), radial-gradient(900px 600px at 100% 100%, #EDEAF2 0, transparent 55%), linear-gradient(145deg, #F5F3F8, #EDEAF2 60%, #F5F3F8)',
    darkBg: 'radial-gradient(1100px 600px at 0% 0%, #09090B 0, transparent 55%), radial-gradient(900px 600px at 100% 100%, #18181B 0, transparent 55%), linear-gradient(145deg, #121214, #18181B 60%, #121214)',
  },
];

/**
 * Apply CSS custom properties to root element for buttons, borders, and accents
 */
export function applyColorSchemeVariables(scheme: ColorScheme, isDark: boolean) {
  const root = document.documentElement;

  const accentColor = isDark ? (scheme.accentDark || scheme.from) : (scheme.deep || scheme.accent);
  const softBg = isDark ? scheme.softDark : scheme.softLight;

  root.style.setProperty('--primary-grad-from', scheme.from);
  root.style.setProperty('--primary-grad-to', scheme.to);
  root.style.setProperty('--primary-accent', accentColor);
  root.style.setProperty('--primary-deep', scheme.deep);

  root.style.setProperty('--comp-color-1', scheme.comp1);
  root.style.setProperty('--comp-color-2', scheme.comp2);
  root.style.setProperty('--comp-color-3', scheme.comp3);

  // Default background spot colors match the scheme
  root.style.setProperty('--bg-spot-1', scheme.from);
  root.style.setProperty('--bg-spot-2', scheme.comp1);
  root.style.setProperty('--bg-spot-3', scheme.comp2);
  root.style.setProperty('--bg-spot-4', scheme.comp3);

  root.style.setProperty('--lavenderAccent', accentColor);
  root.style.setProperty('--lavenderSoft', softBg);
  root.style.setProperty('--lavDeep', accentColor);
}

/**
 * Apply Background Preset to body element
 */
export function applyBgPresetStyle(preset: BgPreset, isDark: boolean) {
  const body = document.body;
  const root = document.documentElement;
  const bgValue = isDark ? preset.darkBg : preset.lightBg;

  body.classList.remove('bg-aurora', 'bg-default');

  if (preset.spots) {
    root.style.setProperty('--bg-spot-1', preset.spots.s1);
    root.style.setProperty('--bg-spot-2', preset.spots.s2);
    root.style.setProperty('--bg-spot-3', preset.spots.s3);
    root.style.setProperty('--bg-spot-4', preset.spots.s4);
  }

  root.dataset.bgType = preset.type;

  if (preset.type === 'pastel') {
    body.style.backgroundImage = 'none';
    body.style.backgroundColor = bgValue;
  } else {
    body.style.backgroundImage = bgValue;
    body.style.backgroundColor = isDark ? '#09090B' : '#FAF9FC';
  }
  body.style.backgroundAttachment = 'fixed';
  body.style.backgroundSize = 'cover';
  body.style.backgroundRepeat = 'no-repeat';
}

/**
 * Apply selected font preset to document
 */
export function applyFontPreset(preset: FontPreset) {
  const root = document.documentElement;
  const body = document.body;
  root.style.setProperty('--app-font-family', preset.fontFamily);
  body.style.fontFamily = preset.fontFamily;
}
