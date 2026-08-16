export interface ColorScheme {
  id: string;
  name: string;
  from: string;      // Primary Gradient Start
  to: string;        // Primary Gradient End
  accent: string;    // Light mode accent color
  deep: string;      // Deep primary color
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
  spots?: {
    s1: string;
    s2: string;
    s3: string;
    s4: string;
  };
}

export const COLOR_SCHEMES: ColorScheme[] = [
  {
    id: 'orange',
    name: 'Апельсин',
    from: '#FCA001',
    to: '#F35B04',
    accent: '#F35B04',
    deep: '#C84000',
    comp1: '#FB7185', // Coral Pink
    comp2: '#E879F9', // Soft Magenta
    comp3: '#FACC15', // Golden Sunshine
    softLight: '#FFF4E5',
    softDark: '#3A1804',
    defaultBgId: 'bg-orange-gradient-1',
  },
  {
    id: 'lime',
    name: 'Лайм',
    from: '#FCE668',
    to: '#99CC66',
    accent: '#82B34B',
    deep: '#5B8A26',
    comp1: '#2DD4BF', // Turquoise Aqua
    comp2: '#FACC15', // Sunny Yellow
    comp3: '#FB7185', // Soft Coral Pink
    softLight: '#F8FDE8',
    softDark: '#1E2C0C',
    defaultBgId: 'bg-lime-gradient-1',
  },
  {
    id: 'pine',
    name: 'Хвоя',
    from: '#89EB84',
    to: '#298F17',
    accent: '#298F17',
    deep: '#1C680E',
    comp1: '#2DD4BF', // Mint Turquoise
    comp2: '#FDE047', // Sun Yellow
    comp3: '#C084FC', // Soft Violet
    softLight: '#EBFCEB',
    softDark: '#0A2906',
    defaultBgId: 'bg-pine-gradient-1',
  },
  {
    id: 'azure',
    name: 'Лазурь',
    from: '#4BF9FC',
    to: '#0093AD',
    accent: '#0093AD',
    deep: '#006B7E',
    comp1: '#C084FC', // Soft Violet
    comp2: '#F472B6', // Rose Pink
    comp3: '#FDE047', // Golden Sunlight
    softLight: '#E6FDFF',
    softDark: '#02252E',
    defaultBgId: 'bg-azure-gradient-1',
  },
  {
    id: 'sea',
    name: 'Море',
    from: '#0077FF',
    to: '#0006AD',
    accent: '#0055DD',
    deep: '#00058A',
    comp1: '#A78BFA', // Periwinkle Violet
    comp2: '#F472B6', // Soft Magenta
    comp3: '#2DD4BF', // Cyan Mint
    softLight: '#E8F2FF',
    softDark: '#020C38',
    defaultBgId: 'bg-sea-gradient-1',
  },
  {
    id: 'blackberry',
    name: 'Ежевика',
    from: '#8C52D0',
    to: '#582F89',
    accent: '#8C52D0',
    deep: '#582F89',
    comp1: '#F472B6', // Rose Pink
    comp2: '#7DD3FC', // Sky Blue
    comp3: '#FDBA74', // Warm Amber
    softLight: '#F0EBF9',
    softDark: '#281B3A',
    defaultBgId: 'bg-blackberry-gradient-1',
  },
  {
    id: 'raspberry',
    name: 'Малина',
    from: '#FF00D0',
    to: '#A3006A',
    accent: '#D800AE',
    deep: '#8A0059',
    comp1: '#FDBA74', // Warm Amber
    comp2: '#C084FC', // Soft Violet
    comp3: '#FDE047', // Golden Glow
    softLight: '#FFEBF8',
    softDark: '#330021',
    defaultBgId: 'bg-raspberry-gradient-1',
  },
  {
    id: 'night',
    name: 'Ночь',
    from: '#3B1C63',
    to: '#0F031C',
    accent: '#7B4BB0',
    deep: '#0F031C',
    comp1: '#C084FC', // Violet Spark
    comp2: '#2DD4BF', // Teal Glow
    comp3: '#FB7185', // Coral Rose
    softLight: '#EFE8F8',
    softDark: '#1B0E2A',
    defaultBgId: 'bg-night-gradient-1',
  },
];

export const BG_PRESETS: BgPreset[] = [
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
    spots: { s1: '#A3E635', s2: '#FACC15', s3: '#2DD4BF', s4: '#FB7185' },
    previewCss: 'radial-gradient(at 0% 0%, #A3E635 0px, transparent 55%), radial-gradient(at 100% 0%, #FACC15 0px, transparent 55%), radial-gradient(at 100% 100%, #2DD4BF 0px, transparent 55%), radial-gradient(at 0% 100%, #FB7185 0px, transparent 55%), #FAFDF5',
    lightBg: 'radial-gradient(at 0% 0%, rgba(163, 230, 53, 0.48) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(250, 204, 21, 0.42) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(45, 212, 191, 0.38) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(251, 113, 133, 0.35) 0px, transparent 50%), #FAFDF5',
    darkBg: 'radial-gradient(at 0% 0%, rgba(77, 124, 15, 0.38) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(161, 98, 7, 0.35) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(15, 118, 110, 0.3) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(190, 18, 60, 0.28) 0px, transparent 50%), #0A0F05',
  },
  {
    id: 'bg-lime-gradient-2',
    name: 'Мятный бриз',
    schemeId: 'lime',
    type: 'gradient',
    spots: { s1: '#38BDF8', s2: '#C084FC', s3: '#FDE047', s4: '#34D399' },
    previewCss: 'radial-gradient(at 20% 20%, #38BDF8 0px, transparent 55%), radial-gradient(at 80% 20%, #C084FC 0px, transparent 55%), radial-gradient(at 85% 85%, #FDE047 0px, transparent 55%), radial-gradient(at 15% 85%, #34D399 0px, transparent 55%), #F8FCF3',
    lightBg: 'radial-gradient(at 20% 15%, rgba(56, 189, 248, 0.42) 0px, transparent 50%), radial-gradient(at 80% 20%, rgba(192, 132, 252, 0.45) 0px, transparent 50%), radial-gradient(at 85% 85%, rgba(253, 224, 71, 0.38) 0px, transparent 50%), radial-gradient(at 15% 85%, rgba(52, 211, 153, 0.32) 0px, transparent 50%), #F8FCF3',
    darkBg: 'radial-gradient(at 20% 15%, rgba(2, 132, 199, 0.38) 0px, transparent 50%), radial-gradient(at 80% 20%, rgba(126, 34, 206, 0.38) 0px, transparent 50%), radial-gradient(at 85% 85%, rgba(161, 98, 7, 0.3) 0px, transparent 50%), radial-gradient(at 15% 85%, rgba(5, 150, 105, 0.28) 0px, transparent 50%), #081004',
  },
  {
    id: 'bg-lime-enhancing',
    name: 'Лаймовый усиливающий',
    schemeId: 'lime',
    type: 'enhancing',
    spots: { s1: '#82B34B', s2: '#FCE668', s3: '#10B981', s4: '#82B34B' },
    previewCss: 'radial-gradient(at 0% 0%, #82B34B 0px, transparent 50%), radial-gradient(at 100% 0%, #FCE668 0px, transparent 50%), radial-gradient(at 100% 100%, #10B981 0px, transparent 50%), radial-gradient(at 0% 100%, #82B34B 0px, transparent 50%), #F8FDE8',
    lightBg: 'radial-gradient(at 0% 0%, rgba(130, 179, 75, 0.5) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(252, 230, 104, 0.45) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.4) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(130, 179, 75, 0.45) 0px, transparent 50%), #F8FDE8',
    darkBg: 'radial-gradient(at 0% 0%, rgba(130, 179, 75, 0.5) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(252, 230, 104, 0.45) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.4) 0px, transparent 50%), #1E2C0C',
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
    spots: { s1: '#34D399', s2: '#FDE047', s3: '#38BDF8', s4: '#C084FC' },
    previewCss: 'radial-gradient(at 0% 0%, #34D399 0px, transparent 55%), radial-gradient(at 100% 0%, #FDE047 0px, transparent 55%), radial-gradient(at 100% 100%, #38BDF8 0px, transparent 55%), radial-gradient(at 0% 100%, #C084FC 0px, transparent 55%), #F3FAF4',
    lightBg: 'radial-gradient(at 0% 0%, rgba(52, 211, 153, 0.48) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(253, 224, 71, 0.4) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(56, 189, 248, 0.38) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(192, 132, 252, 0.35) 0px, transparent 50%), #F3FAF4',
    darkBg: 'radial-gradient(at 0% 0%, rgba(5, 150, 105, 0.38) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(161, 98, 7, 0.3) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(2, 132, 199, 0.3) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(126, 34, 206, 0.28) 0px, transparent 50%), #040E05',
  },
  {
    id: 'bg-pine-gradient-2',
    name: 'Хвойный туман',
    schemeId: 'pine',
    type: 'gradient',
    spots: { s1: '#FDBA74', s2: '#F472B6', s3: '#2DD4BF', s4: '#A3E635' },
    previewCss: 'radial-gradient(at 20% 20%, #FDBA74 0px, transparent 55%), radial-gradient(at 80% 20%, #F472B6 0px, transparent 55%), radial-gradient(at 80% 80%, #2DD4BF 0px, transparent 55%), radial-gradient(at 20% 80%, #A3E635 0px, transparent 55%), #F4FAF5',
    lightBg: 'radial-gradient(at 15% 20%, rgba(253, 186, 116, 0.42) 0px, transparent 50%), radial-gradient(at 85% 15%, rgba(244, 114, 182, 0.45) 0px, transparent 50%), radial-gradient(at 80% 80%, rgba(45, 212, 191, 0.35) 0px, transparent 50%), radial-gradient(at 20% 80%, rgba(163, 230, 53, 0.32) 0px, transparent 50%), #F4FAF5',
    darkBg: 'radial-gradient(at 15% 20%, rgba(194, 65, 12, 0.38) 0px, transparent 50%), radial-gradient(at 85% 15%, rgba(190, 24, 93, 0.38) 0px, transparent 50%), radial-gradient(at 80% 80%, rgba(15, 118, 110, 0.3) 0px, transparent 50%), radial-gradient(at 20% 80%, rgba(77, 124, 15, 0.28) 0px, transparent 50%), #030B03',
  },
  {
    id: 'bg-pine-enhancing',
    name: 'Хвойный усиливающий',
    schemeId: 'pine',
    type: 'enhancing',
    spots: { s1: '#298F17', s2: '#89EB84', s3: '#059669', s4: '#298F17' },
    previewCss: 'radial-gradient(at 0% 0%, #298F17 0px, transparent 50%), radial-gradient(at 100% 0%, #89EB84 0px, transparent 50%), radial-gradient(at 100% 100%, #059669 0px, transparent 50%), radial-gradient(at 0% 100%, #298F17 0px, transparent 50%), #EBFCEB',
    lightBg: 'radial-gradient(at 0% 0%, rgba(41, 143, 23, 0.5) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(137, 235, 132, 0.45) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(5, 150, 105, 0.4) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(41, 143, 23, 0.45) 0px, transparent 50%), #EBFCEB',
    darkBg: 'radial-gradient(at 0% 0%, rgba(41, 143, 23, 0.5) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(137, 235, 132, 0.45) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(5, 150, 105, 0.4) 0px, transparent 50%), #0A2906',
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
    spots: { s1: '#38BDF8', s2: '#C084FC', s3: '#FDE047', s4: '#F472B6' },
    previewCss: 'radial-gradient(at 0% 0%, #38BDF8 0px, transparent 55%), radial-gradient(at 100% 0%, #C084FC 0px, transparent 55%), radial-gradient(at 100% 100%, #FDE047 0px, transparent 55%), radial-gradient(at 0% 100%, #F472B6 0px, transparent 55%), #F0FDFF',
    lightBg: 'radial-gradient(at 0% 0%, rgba(56, 189, 248, 0.48) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(192, 132, 252, 0.45) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(253, 224, 71, 0.42) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(244, 114, 182, 0.38) 0px, transparent 50%), #F0FDFF',
    darkBg: 'radial-gradient(at 0% 0%, rgba(8, 145, 178, 0.42) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(126, 34, 206, 0.38) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(161, 98, 7, 0.3) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(190, 24, 93, 0.32) 0px, transparent 50%), #021014',
  },
  {
    id: 'bg-azure-gradient-2',
    name: 'Аквамарин',
    schemeId: 'azure',
    type: 'gradient',
    spots: { s1: '#2DD4BF', s2: '#FB7185', s3: '#818CF8', s4: '#FACC15' },
    previewCss: 'radial-gradient(at 15% 15%, #2DD4BF 0px, transparent 55%), radial-gradient(at 85% 15%, #FB7185 0px, transparent 55%), radial-gradient(at 85% 85%, #818CF8 0px, transparent 55%), radial-gradient(at 15% 85%, #FACC15 0px, transparent 55%), #F2FCFD',
    lightBg: 'radial-gradient(at 15% 15%, rgba(45, 212, 191, 0.42) 0px, transparent 50%), radial-gradient(at 85% 15%, rgba(251, 113, 133, 0.45) 0px, transparent 50%), radial-gradient(at 85% 85%, rgba(129, 140, 248, 0.35) 0px, transparent 50%), radial-gradient(at 15% 85%, rgba(250, 204, 21, 0.4) 0px, transparent 50%), #F2FCFD',
    darkBg: 'radial-gradient(at 15% 15%, rgba(15, 118, 110, 0.38) 0px, transparent 50%), radial-gradient(at 85% 15%, rgba(190, 18, 60, 0.38) 0px, transparent 50%), radial-gradient(at 85% 85%, rgba(67, 56, 202, 0.3) 0px, transparent 50%), radial-gradient(at 15% 85%, rgba(161, 98, 7, 0.35) 0px, transparent 50%), #010C0F',
  },
  {
    id: 'bg-azure-enhancing',
    name: 'Лазурный усиливающий',
    schemeId: 'azure',
    type: 'enhancing',
    spots: { s1: '#0093AD', s2: '#4BF9FC', s3: '#3B82F6', s4: '#0093AD' },
    previewCss: 'radial-gradient(at 0% 0%, #0093AD 0px, transparent 50%), radial-gradient(at 100% 0%, #4BF9FC 0px, transparent 50%), radial-gradient(at 100% 100%, #3B82F6 0px, transparent 50%), radial-gradient(at 0% 100%, #0093AD 0px, transparent 50%), #E6FDFF',
    lightBg: 'radial-gradient(at 0% 0%, rgba(0, 147, 173, 0.5) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(75, 249, 252, 0.45) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(59, 130, 246, 0.4) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(0, 147, 173, 0.45) 0px, transparent 50%), #E6FDFF',
    darkBg: 'radial-gradient(at 0% 0%, rgba(0, 147, 173, 0.5) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(75, 249, 252, 0.45) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(59, 130, 246, 0.4) 0px, transparent 50%), #02252E',
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

  root.style.setProperty('--primary-grad-from', scheme.from);
  root.style.setProperty('--primary-grad-to', scheme.to);
  root.style.setProperty('--primary-accent', scheme.accent);
  root.style.setProperty('--primary-deep', scheme.deep);

  root.style.setProperty('--comp-color-1', scheme.comp1);
  root.style.setProperty('--comp-color-2', scheme.comp2);
  root.style.setProperty('--comp-color-3', scheme.comp3);

  // Default background spot colors match the scheme
  root.style.setProperty('--bg-spot-1', scheme.from);
  root.style.setProperty('--bg-spot-2', scheme.comp1);
  root.style.setProperty('--bg-spot-3', scheme.comp2);
  root.style.setProperty('--bg-spot-4', scheme.comp3);

  if (isDark) {
    root.style.setProperty('--lavenderAccent', scheme.from);
    root.style.setProperty('--lavenderSoft', scheme.softDark);
    root.style.setProperty('--lavDeep', scheme.from);
  } else {
    root.style.setProperty('--lavenderAccent', scheme.accent);
    root.style.setProperty('--lavenderSoft', scheme.softLight);
    root.style.setProperty('--lavDeep', scheme.deep);
  }
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
