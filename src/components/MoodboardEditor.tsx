import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getStorageItem, getSyncStorageItem } from '../lib/asyncStorage';
import { motion, AnimatePresence } from 'motion/react';
import { toJpeg } from 'html-to-image';
import {
  X,
  Plus,
  Check,
  Loader2,
  Search,
  RotateCcw,
  RotateCw,
  Save,
  Download,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  Trash2,
  Wand2,
  FileImage,
  Sparkles,
  RefreshCw,
  Layout,
  Sliders,
  Info,
  Layers,
  FlipHorizontal,
  DollarSign,
  Upload,
  Grid,
  Heart,
  Type,
  Tv,
  Table as TableIcon,
  Grid as GridIcon,
  Flower2,
  Compass,
  Bookmark,
  BookOpen,
  Columns,
  Box,
  CircleDot,
  Tag,
  Lightbulb,
  Moon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Volume2,
  GripVertical,
  Sun,
  Contrast,
  Palette,
  Target,
  Droplet,
  Folder,
  ZoomIn,
  Pipette,
  Bell,
  CheckCircle2,
  FolderPlus,
  ArrowLeft,
  Pencil,
  Undo2,
  Redo2,
  ArrowUp,
  ArrowDown,
  ArrowUpToLine,
  ArrowDownToLine,
  User,
  Calendar,
  MapPin,
  Paperclip,
  Maximize2,
  Group,
  Ungroup,
  BoxSelect,
  FlipVertical,
  Thermometer,
  Zap,
  AlignJustify,
  Shapes,
  DoorOpen,
  Ruler,
  Move,
  Utensils
} from 'lucide-react';
import { Project, EstimateItem } from '../types';
import { CATALOG_ASSETS, LibraryItem } from './editor/EditorLibraryData';
import FloorPlanSchema, { PlanElement } from './editor/FloorPlanSchema';

// Custom SVG icon for Shadow tool (drop shadow effect)
export const ShadowToolIcon = ({ className = "w-3.5 h-3.5 sm:w-4 sm:h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="8" width="13" height="13" rx="2.5" fill="currentColor" opacity="0.35" stroke="none" />
    <rect x="8" y="8" width="13" height="13" rx="2.5" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
    <rect x="3" y="3" width="13" height="13" rx="2.5" />
  </svg>
);

// Custom SVG icon for Opacity / Transparency tool (checkered transparency pattern)
export const OpacityToolIcon = ({ className = "w-3.5 h-3.5 sm:w-4 sm:h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <line x1="3" y1="12" x2="21" y2="12" strokeWidth="1.2" opacity="0.4" />
    <line x1="12" y1="3" x2="12" y2="21" strokeWidth="1.2" opacity="0.4" />
    <rect x="3" y="3" width="9" height="9" rx="1" fill="currentColor" opacity="0.45" stroke="none" />
    <rect x="12" y="12" width="9" height="9" rx="1" fill="currentColor" opacity="0.45" stroke="none" />
  </svg>
);

interface MoodboardEditorProps {
  projects: Project[];
  initialProjectId?: string;
  onSaveToProject: (
    projectId: string,
    imageUrl: string,
    estimateItems?: EstimateItem[],
    budget?: number,
    scenesData?: EditorScene[],
    floorPlanData?: PlanElement[]
  ) => void;
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warn') => void;
  setHeaderActions?: (actions: React.ReactNode) => void;
  onAddAiImage?: (url: string, prompt: string, projectName: string) => void;
  mobileNavButton?: React.ReactNode;
  onBackToProjectCard?: (projectId?: string) => void;
}

export interface CanvasElement {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  exposure: number;
  contrast?: number;
  hue: number;
  temp: number;
  saturate: number;
  opacity: number;
  price: number;
  comment: string;
  code?: string;
  sourceType?: string;
  caption?: string;
  captionOffsetX?: number;
  captionOffsetY?: number;
  measurementValue?: string;
  isLocked: boolean;
  isVisible: boolean;
  isFlippedH: boolean;
  isFlippedV: boolean;
  svgMarkup: string;
  customImage?: string;
  aspectRatioAdjusted?: boolean;
  groupId?: string;
  tintColor?: string;
  tintAmount?: number;
  tintMode?: 'color' | 'normal' | 'multiply' | 'overlay';
  shadowEnabled?: boolean;
  shadowX?: number;
  shadowY?: number;
  shadowBlur?: number;
  shadowOpacity?: number;
  shadowColor?: string;
}

const hexToRgba = (hex: string = '#000000', alpha: number = 0.5) => {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(0, 0, 0, ${alpha})`;
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
};

interface EditorScene {
  id: string;
  name: string;
  elements: CanvasElement[];
  backdropImage: string;
  backdropColor: string;
  backdropType: 'image' | 'color';
  backdropScale?: number;
  backdropX?: number;
  backdropY?: number;
}

const NEW_CATALOG_CATEGORIES = [
  { id: 'favorites', title: 'Избранное', icon: 'Heart' },
  { id: 'warehouse', title: 'Склад', icon: 'Box' },
  { id: 'construction', title: 'Конструкция', icon: 'Layers' },
  { id: 'podiums', title: 'Подиумы', icon: 'Columns' },
  { id: 'textiles', title: 'Текстиль', icon: 'AlignLeft' },
  { id: 'flowers', title: 'Флористика', icon: 'Flower2' },
  { id: 'balloons', title: 'Шары', icon: 'CircleDot' },
  { id: 'decor', title: 'Декор', icon: 'Compass' },
  { id: 'sequins', title: 'Пайетки', icon: 'Sparkles' },
  { id: 'light', title: 'Свет', icon: 'Lightbulb' },
  { id: 'furniture', title: 'Мебель', icon: 'Table' },
  { id: 'tableware', title: 'Сервировка', icon: 'Utensils' },
  { id: 'themes', title: 'Тематика', icon: 'Palette' },
  { id: 'text', title: 'Текст', icon: 'Type' }
];

const SCHEMA_CATALOG_CATEGORIES = [
  { id: 'favorites', title: 'Избранное', icon: 'Heart' },
  { id: 'schema_furniture', title: 'Мебель', icon: 'Bookmark' },
  { id: 'schema_podiums', title: 'Подиумы', icon: 'Columns' },
  { id: 'schema_compositions', title: 'Композиции', icon: 'Grid' },
  { id: 'schema_balloons', title: 'Шары', icon: 'CircleDot' },
  { id: 'schema_flowers', title: 'Цветы', icon: 'Flower2' },
  { id: 'schema_textiles', title: 'Текстиль', icon: 'AlignLeft' },
  { id: 'schema_neon', title: 'Неон и надписи', icon: 'Type' },
  { id: 'schema_light', title: 'Свет', icon: 'Lightbulb' },
  { id: 'schema_electricity', title: 'Электрика', icon: 'Zap' },
  { id: 'schema_pathways', title: 'Дорожки', icon: 'AlignJustify' },
  { id: 'schema_shapes', title: 'Фигуры', icon: 'Shapes' },
  { id: 'schema_entrance_exit', title: 'Вход/Выход', icon: 'DoorOpen' }
];

const CategoryIcon: React.FC<{
  cat: { id: string; title: string };
  isSelected?: boolean;
}> = ({ cat, isSelected }) => {
  const [imgError, setImgError] = useState(false);
  const [customUserIcon, setCustomUserIcon] = useState<string | null>(() => {
    return localStorage.getItem(`cat_icon_${cat.id}`) || null;
  });

  useEffect(() => {
    const handleUpdate = () => {
      setCustomUserIcon(localStorage.getItem(`cat_icon_${cat.id}`) || null);
      setImgError(false);
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('cat_icons_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('cat_icons_updated', handleUpdate);
    };
  }, [cat.id]);

  const iconSrc = customUserIcon || `/category-icons/${cat.id}.svg`;

  useEffect(() => {
    if (!iconSrc) {
      setImgError(true);
      return;
    }
    setImgError(false);
    const img = new Image();
    img.src = iconSrc;
    img.onload = () => setImgError(false);
    img.onerror = () => setImgError(true);
  }, [iconSrc]);

  if (!imgError && iconSrc) {
    return (
      <div
        style={{
          maskImage: `url("${iconSrc}")`,
          WebkitMaskImage: `url("${iconSrc}")`,
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
        }}
        className="w-5 h-5 bg-[var(--lavDeep)] dark:bg-[var(--lavenderAccent)] transition-transform group-hover:scale-110 shrink-0"
        role="img"
        aria-label={cat.title}
      />
    );
  }

  const iconClass = "w-5 h-5 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]";

  // Fallback to default Lucide icons
  switch (cat.id) {
    case 'favorites': return <Heart className={`w-5 h-5 ${isSelected ? 'fill-[var(--lavDeep)] text-[var(--lavDeep)] dark:fill-[var(--lavenderAccent)] dark:text-[var(--lavenderAccent)]' : 'text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]'}`} />;
    case 'warehouse': return <Box className={iconClass} />;
    case 'construction': return <Layers className={iconClass} />;
    case 'podiums': return <Columns className={iconClass} />;
    case 'textiles': return <AlignLeft className={iconClass} />;
    case 'flowers': return <Flower2 className={iconClass} />;
    case 'balloons': return <CircleDot className={iconClass} />;
    case 'decor': return <Compass className={iconClass} />;
    case 'sequins': return <Sparkles className={iconClass} />;
    case 'light': return <Lightbulb className={iconClass} />;
    case 'furniture': return <TableIcon className={iconClass} />;
    case 'tableware': return <Utensils className={iconClass} />;
    case 'themes': return <Palette className={iconClass} />;
    case 'text': return <Type className={iconClass} />;
    // Legacy & Schema categories
    case 'arches': return <Layers className={iconClass} />;
    case 'stands': return <Columns className={iconClass} />;
    case 'tables': return <TableIcon className={iconClass} />;
    case 'screens': return <GridIcon className={iconClass} />;
    case 'compositions': return <Sparkles className={iconClass} />;
    case 'vases': return <Tag className={iconClass} />;
    case 'details': return <Compass className={iconClass} />;
    case 'schema_furniture': return <Bookmark className={iconClass} />;
    case 'schema_podiums': return <Columns className={iconClass} />;
    case 'schema_compositions': return <GridIcon className={iconClass} />;
    case 'schema_balloons': return <CircleDot className={iconClass} />;
    case 'schema_flowers': return <Flower2 className={iconClass} />;
    case 'schema_textiles': return <AlignLeft className={iconClass} />;
    case 'schema_neon': return <Type className={iconClass} />;
    case 'schema_light': return <Lightbulb className={iconClass} />;
    case 'schema_electricity': return <Zap className={iconClass} />;
    case 'schema_pathways': return <AlignJustify className={iconClass} />;
    case 'schema_shapes': return <Shapes className={iconClass} />;
    case 'schema_entrance_exit': return <DoorOpen className={iconClass} />;
    default: return <Tag className={iconClass} />;
  }
};

// Specialized Schema library elements for the Floorplan / Schema tab
const SCHEMA_LIBRARY_ITEMS: LibraryItem[] = [
  // 1. Мебель (Furniture)
  {
    id: "schema-table-rect",
    name: "Стол (Прямоугольный)",
    code: "ST-01",
    category: "schema_furniture",
    price: 3000,
    width: 100,
    height: 55,
    caption: "Стол",
    svgMarkup: `<svg viewBox="0 0 100 55" class="w-full h-full"><rect x="4" y="4" width="92" height="47" rx="8" ry="8" fill="#F8FAFC" stroke="#475569" stroke-width="2"/></svg>`
  },
  {
    id: "schema-table-oval",
    name: "Стол (Овальный)",
    code: "ST-02",
    category: "schema_furniture",
    price: 3500,
    width: 100,
    height: 55,
    caption: "Стол",
    svgMarkup: `<svg viewBox="0 0 100 55" class="w-full h-full"><rect x="4" y="4" width="92" height="47" rx="23.5" ry="23.5" fill="#F8FAFC" stroke="#475569" stroke-width="2"/></svg>`
  },
  {
    id: "schema-table-round",
    name: "Стол (Круглый)",
    code: "ST-03",
    category: "schema_furniture",
    price: 2500,
    width: 70,
    height: 70,
    caption: "Стол",
    svgMarkup: `<svg viewBox="0 0 70 70" class="w-full h-full"><circle cx="35" cy="35" r="30" fill="#F8FAFC" stroke="#475569" stroke-width="2"/></svg>`
  },
  {
    id: "schema-sofa-curved",
    name: "Диван (Изогнутый)",
    code: "ST-04",
    category: "schema_furniture",
    price: 4000,
    width: 80,
    height: 80,
    caption: "Диван",
    svgMarkup: `<svg viewBox="0 0 80 80" class="w-full h-full"><path d="M 10 70 A 60 60 0 0 1 70 10 L 55 10 A 45 45 0 0 0 10 55 Z" fill="#F8FAFC" stroke="#475569" stroke-width="2"/></svg>`
  },
  {
    id: "schema-chair",
    name: "Стул",
    code: "ST-05",
    category: "schema_furniture",
    price: 800,
    width: 45,
    height: 45,
    caption: "Стул",
    svgMarkup: `<svg viewBox="0 0 50 50" class="w-full h-full"><circle cx="25" cy="25" r="20" fill="#F8FAFC" stroke="#475569" stroke-width="2"/><path d="M 12 25 A 13 13 0 0 1 38 25" fill="none" stroke="#475569" stroke-width="1.5"/></svg>`
  },

  // 2. Подиумы (Podiums)
  {
    id: "schema-podium-semicircle",
    name: "Подиум (Полукруглый)",
    code: "POD-01",
    category: "schema_podiums",
    price: 8000,
    width: 100,
    height: 55,
    caption: "Подиум",
    svgMarkup: `<svg viewBox="0 0 100 55" class="w-full h-full"><path d="M 0 55 A 50 55 0 0 1 100 55 Z" fill="#F8FAFC" stroke="#475569" stroke-width="2"/><path d="M 15 55 A 35 38 0 0 1 85 55" fill="none" stroke="#475569" stroke-width="1.5" stroke-dasharray="3,3"/></svg>`
  },
  {
    id: "schema-podium-rect",
    name: "Подиум (Прямоугольный)",
    code: "POD-02",
    category: "schema_podiums",
    price: 10000,
    width: 100,
    height: 55,
    caption: "Подиум",
    svgMarkup: `<svg viewBox="0 0 100 55" class="w-full h-full"><rect x="0" y="0" width="100" height="55" rx="4" fill="#F8FAFC" stroke="#475569" stroke-width="2"/><rect x="12" y="10" width="76" height="35" rx="2" fill="none" stroke="#475569" stroke-width="1.5"/></svg>`
  },
  {
    id: "schema-stairs",
    name: "Лестница",
    code: "POD-03",
    category: "schema_podiums",
    price: 4000,
    width: 90,
    height: 50,
    caption: "Лестница",
    svgMarkup: `<svg viewBox="0 0 90 50" class="w-full h-full"><rect x="0" y="0" width="90" height="50" rx="2" fill="#F8FAFC" stroke="#475569" stroke-width="2"/><line x1="0" y1="12" x2="90" y2="12" stroke="#475569" stroke-width="1.5"/><line x1="0" y1="25" x2="90" y2="25" stroke="#475569" stroke-width="1.5"/><line x1="0" y1="37" x2="90" y2="37" stroke="#475569" stroke-width="1.5"/></svg>`
  },

  // 3. Композиции (Compositions)
  {
    id: "schema-screen-zigzag",
    name: "Ширма",
    code: "KOMP-01",
    category: "schema_compositions",
    price: 5000,
    width: 100,
    height: 35,
    caption: "Ширма",
    svgMarkup: `<svg viewBox="0 0 100 35" class="w-full h-full"><path d="M 5 22 L 23 8 L 41 22 L 59 8 L 77 22 L 95 8" fill="none" stroke="#475569" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  },
  {
    id: "schema-arch-arc",
    name: "Арка",
    code: "KOMP-02",
    category: "schema_compositions",
    price: 6000,
    width: 100,
    height: 40,
    caption: "Арка",
    svgMarkup: `<svg viewBox="0 0 100 40" class="w-full h-full"><path d="M 8 32 Q 50 2 92 32" fill="none" stroke="#475569" stroke-width="3" stroke-linecap="round"/></svg>`
  },
  {
    id: "schema-stand-bar",
    name: "Стойка",
    code: "KOMP-03",
    category: "schema_compositions",
    price: 3500,
    width: 100,
    height: 35,
    caption: "Стойка",
    svgMarkup: `<svg viewBox="0 0 100 35" class="w-full h-full"><line x1="15" y1="15" x2="85" y2="15" stroke="#475569" stroke-width="2.5"/><line x1="15" y1="5" x2="15" y2="25" stroke="#475569" stroke-width="2.5"/><line x1="85" y1="5" x2="85" y2="25" stroke="#475569" stroke-width="2.5"/></svg>`
  },
  {
    id: "schema-frame-rect",
    name: "Каркас (Прямоугольный)",
    code: "KOMP-04",
    category: "schema_compositions",
    price: 4000,
    width: 90,
    height: 50,
    caption: "Каркас",
    svgMarkup: `<svg viewBox="0 0 90 50" class="w-full h-full"><rect x="4" y="4" width="82" height="42" rx="3" fill="none" stroke="#475569" stroke-width="2.5" stroke-dasharray="6,3"/><rect x="8" y="8" width="74" height="34" rx="2" fill="none" stroke="#94A3B8" stroke-width="1.5"/></svg>`
  },
  {
    id: "schema-frame-circle",
    name: "Каркас (Круглый)",
    code: "KOMP-05",
    category: "schema_compositions",
    price: 4000,
    width: 70,
    height: 70,
    caption: "Каркас",
    svgMarkup: `<svg viewBox="0 0 70 70" class="w-full h-full"><circle cx="35" cy="35" r="28" fill="none" stroke="#475569" stroke-width="2.5" stroke-dasharray="6,3"/><circle cx="35" cy="35" r="23" fill="none" stroke="#94A3B8" stroke-width="1.5"/></svg>`
  },
  {
    id: "schema-sequin-wall",
    name: "Панели пайетки",
    code: "KOMP-06",
    category: "schema_compositions",
    price: 8000,
    width: 90,
    height: 50,
    caption: "Пайетки",
    svgMarkup: `<svg viewBox="0 0 90 50" class="w-full h-full"><rect x="4" y="4" width="82" height="42" rx="4" fill="#FEF3C7" stroke="#F59E0B" stroke-width="2"/><g fill="#FBBF24" opacity="0.8"><circle cx="15" cy="14" r="3"/><circle cx="27" cy="14" r="3"/><circle cx="39" cy="14" r="3"/><circle cx="51" cy="14" r="3"/><circle cx="63" cy="14" r="3"/><circle cx="75" cy="14" r="3"/><circle cx="21" cy="25" r="3"/><circle cx="33" cy="25" r="3"/><circle cx="45" cy="25" r="3"/><circle cx="57" cy="25" r="3"/><circle cx="69" cy="25" r="3"/><circle cx="15" cy="36" r="3"/><circle cx="27" cy="36" r="3"/><circle cx="39" cy="36" r="3"/><circle cx="51" cy="36" r="3"/><circle cx="63" cy="36" r="3"/><circle cx="75" cy="36" r="3"/></g></svg>`
  },

  // 4. Текстиль (Textiles)
  {
    id: "schema-textile-curtains",
    name: "Шторы / Портьеры",
    code: "TXT-01",
    category: "schema_textiles",
    price: 4500,
    width: 90,
    height: 40,
    caption: "Шторы",
    svgMarkup: `<svg viewBox="0 0 90 40" class="w-full h-full"><path d="M 5 8 Q 15 28 25 8 Q 35 28 45 8 Q 55 28 65 8 Q 75 28 85 8" fill="none" stroke="#A855F7" stroke-width="3" stroke-linecap="round"/><line x1="5" y1="8" x2="85" y2="8" stroke="#7E22CE" stroke-width="2.5"/></svg>`
  },
  {
    id: "schema-textile-drape",
    name: "Драпировка фона",
    code: "TXT-02",
    category: "schema_textiles",
    price: 6000,
    width: 100,
    height: 45,
    caption: "Драпировка",
    svgMarkup: `<svg viewBox="0 0 100 45" class="w-full h-full"><rect x="5" y="5" width="90" height="35" rx="4" fill="#F3E8FF" stroke="#C084FC" stroke-width="2"/><path d="M 10 5 Q 25 35 40 5 Q 55 35 70 5 Q 85 35 95 5" fill="none" stroke="#A855F7" stroke-width="1.5" stroke-dasharray="4,2"/></svg>`
  },
  {
    id: "schema-textile-tablecloth",
    name: "Скатерть / Юбка стола",
    code: "TXT-03",
    category: "schema_textiles",
    price: 3000,
    width: 95,
    height: 45,
    caption: "Скатерть",
    svgMarkup: `<svg viewBox="0 0 95 45" class="w-full h-full"><rect x="5" y="8" width="85" height="30" rx="6" fill="#FCE7F3" stroke="#EC4899" stroke-width="2"/><path d="M 10 38 Q 17 28 24 38 Q 31 28 38 38 Q 45 28 52 38 Q 59 28 66 38 Q 73 28 80 38 Q 87 28 90 38" fill="none" stroke="#DB2777" stroke-width="1.5"/></svg>`
  },

  // 5. Неон и надписи (Neon & Lettering)
  {
    id: "schema-neon-happy",
    name: "Неоновая надпись",
    code: "NEON-01",
    category: "schema_neon",
    price: 5000,
    width: 90,
    height: 45,
    caption: "Неон",
    svgMarkup: `<svg viewBox="0 0 90 45" class="w-full h-full"><rect x="4" y="4" width="82" height="37" rx="6" fill="#18181B" stroke="#F43F5E" stroke-width="2"/><path d="M 15 23 Q 22 13 30 23 T 45 23 T 60 23 T 75 23" fill="none" stroke="#FB7185" stroke-width="2.5" stroke-linecap="round"/></svg>`
  },
  {
    id: "schema-neon-initials",
    name: "Объемные буквы",
    code: "NEON-02",
    category: "schema_neon",
    price: 6000,
    width: 85,
    height: 45,
    caption: "Буквы",
    svgMarkup: `<svg viewBox="0 0 85 45" class="w-full h-full"><rect x="4" y="4" width="77" height="37" rx="5" fill="#F8FAFC" stroke="var(--lavDeep, #8C52D0)" stroke-width="2"/><text x="42.5" y="28" font-family="sans-serif" font-size="16" font-weight="800" fill="var(--lavDeep, #8C52D0)" text-anchor="middle" letter-spacing="3">A &amp; B</text></svg>`
  },
  {
    id: "schema-neon-flex",
    name: "Гибкий неон",
    code: "NEON-03",
    category: "schema_neon",
    price: 3500,
    width: 90,
    height: 40,
    caption: "Неон",
    svgMarkup: `<svg viewBox="0 0 90 40" class="w-full h-full"><path d="M 8 20 C 25 5, 35 35, 50 20 C 65 5, 75 35, 82 20" fill="none" stroke="#38BDF8" stroke-width="3.5" stroke-linecap="round"/></svg>`
  },

  // 6. Шары (Balloons)
  {
    id: "schema-balloons-cluster",
    name: "Шары (Кластер)",
    code: "SHAR-01",
    category: "schema_balloons",
    price: 3000,
    width: 75,
    height: 65,
    caption: "Шары",
    svgMarkup: `<svg viewBox="0 0 75 65" class="w-full h-full"><circle cx="24" cy="22" r="16" fill="#F3E8FF" stroke="#A855F7" stroke-width="2"/><circle cx="20" cy="18" r="4" fill="#FFFFFF" opacity="0.6"/><circle cx="51" cy="22" r="17" fill="#FAE8FF" stroke="#D946EF" stroke-width="2"/><circle cx="47" cy="18" r="4.5" fill="#FFFFFF" opacity="0.6"/><circle cx="37.5" cy="38" r="18" fill="#EDE9FE" stroke="#8B5CF6" stroke-width="2"/><circle cx="33" cy="33" r="5" fill="#FFFFFF" opacity="0.7"/></svg>`
  },
  {
    id: "schema-balloons-row",
    name: "Шары (Ряд)",
    code: "SHAR-02",
    category: "schema_balloons",
    price: 3500,
    width: 95,
    height: 50,
    caption: "Шары",
    svgMarkup: `<svg viewBox="0 0 95 50" class="w-full h-full"><circle cx="20" cy="25" r="15" fill="#F3E8FF" stroke="#A855F7" stroke-width="2"/><circle cx="16" cy="21" r="3.5" fill="#FFFFFF" opacity="0.6"/><circle cx="47.5" cy="25" r="16" fill="#FAE8FF" stroke="#EC4899" stroke-width="2"/><circle cx="43" cy="20" r="4" fill="#FFFFFF" opacity="0.6"/><circle cx="75" cy="25" r="15" fill="#E0E7FF" stroke="#6366F1" stroke-width="2"/><circle cx="71" cy="21" r="3.5" fill="#FFFFFF" opacity="0.6"/></svg>`
  },

  // 5. Цветы (Flowers)
  {
    id: "schema-flower-rosette",
    name: "Цветы",
    code: "FL-01",
    category: "schema_flowers",
    price: 4000,
    width: 70,
    height: 70,
    caption: "Цветы",
    svgMarkup: `<svg viewBox="0 0 70 70" class="w-full h-full"><path d="M 22 22 Q 10 35 22 48 Q 35 60 48 48 Q 60 35 48 22 Q 35 10 22 22 Z" fill="#DCFCE7" stroke="#22C55E" stroke-width="1.5"/><g stroke="#E879F9" stroke-width="1.8" fill="#FDF4FF"><circle cx="35" cy="20" r="9"/><circle cx="21" cy="30" r="9"/><circle cx="49" cy="30" r="9"/><circle cx="26" cy="45" r="9"/><circle cx="44" cy="45" r="9"/></g><circle cx="35" cy="34" r="8" fill="#FACC15" stroke="#EAB308" stroke-width="1.8"/></svg>`
  },
  {
    id: "schema-garland",
    name: "Гирлянда",
    code: "FL-02",
    category: "schema_flowers",
    price: 7000,
    width: 110,
    height: 55,
    caption: "Гирлянда",
    svgMarkup: `<svg viewBox="0 0 110 55" class="w-full h-full"><path d="M 10 28 Q 55 45 100 28" fill="none" stroke="#16A34A" stroke-width="3" stroke-linecap="round"/><path d="M 15 24 Q 20 12 28 24 Q 20 36 15 24 Z" fill="#86EFAC" stroke="#16A34A" stroke-width="1"/><path d="M 82 24 Q 90 12 95 24 Q 90 36 82 24 Z" fill="#86EFAC" stroke="#16A34A" stroke-width="1"/><g fill="#FDF4FF" stroke="#C084FC" stroke-width="1.5"><circle cx="20" cy="28" r="6"/><circle cx="35" cy="32" r="7"/><circle cx="55" cy="35" r="9"/><circle cx="75" cy="32" r="7"/><circle cx="90" cy="28" r="6"/></g><g fill="#FACC15"><circle cx="20" cy="28" r="2.5"/><circle cx="35" cy="32" r="3"/><circle cx="55" cy="35" r="3.5"/><circle cx="75" cy="32" r="3"/><circle cx="90" cy="28" r="2.5"/></g></svg>`
  },

  // 6. Свет (Light)
  {
    id: "schema-diodes",
    name: "Диоды",
    code: "LGT-01",
    category: "schema_light",
    price: 2000,
    width: 100,
    height: 40,
    caption: "Диоды",
    svgMarkup: `<svg viewBox="0 0 100 40" class="w-full h-full"><rect x="5" y="8" width="90" height="14" rx="3" fill="#FFF7ED" stroke="#FB923C" stroke-width="2"/><circle cx="15" cy="15" r="2" fill="#EA580C"/><circle cx="27" cy="15" r="2" fill="#EA580C"/><circle cx="39" cy="15" r="2" fill="#EA580C"/><circle cx="50" cy="15" r="2" fill="#EA580C"/><circle cx="61" cy="15" r="2" fill="#EA580C"/><circle cx="73" cy="15" r="2" fill="#EA580C"/><circle cx="85" cy="15" r="2" fill="#EA580C"/></svg>`
  },
  {
    id: "schema-spotlight-sun",
    name: "Свет (Солнце)",
    code: "LGT-02",
    category: "schema_light",
    price: 3000,
    width: 65,
    height: 65,
    caption: "Свет",
    svgMarkup: `<svg viewBox="0 0 65 65" class="w-full h-full"><circle cx="32.5" cy="26" r="11" fill="#FFF7ED" stroke="#FB923C" stroke-width="2.5"/><line x1="32.5" y1="8" x2="32.5" y2="12" stroke="#FB923C" stroke-width="2" stroke-linecap="round"/><line x1="32.5" y1="40" x2="32.5" y2="44" stroke="#FB923C" stroke-width="2" stroke-linecap="round"/><line x1="14.5" y1="26" x2="18.5" y2="26" stroke="#FB923C" stroke-width="2" stroke-linecap="round"/><line x1="46.5" y1="26" x2="50.5" y2="26" stroke="#FB923C" stroke-width="2" stroke-linecap="round"/><line x1="19.5" y1="13" x2="22.5" y2="16" stroke="#FB923C" stroke-width="2" stroke-linecap="round"/><line x1="42.5" y1="36" x2="45.5" y2="39" stroke="#FB923C" stroke-width="2" stroke-linecap="round"/><line x1="19.5" y1="39" x2="22.5" y2="36" stroke="#FB923C" stroke-width="2" stroke-linecap="round"/><line x1="42.5" y1="16" x2="45.5" y2="13" stroke="#FB923C" stroke-width="2" stroke-linecap="round"/></svg>`
  },
  {
    id: "schema-light-rays",
    name: "Свет (Лучи)",
    code: "LGT-03",
    category: "schema_light",
    price: 3500,
    width: 70,
    height: 65,
    caption: "Свет",
    svgMarkup: `<svg viewBox="0 0 70 65" class="w-full h-full"><line x1="22" y1="42" x2="30" y2="10" stroke="#FB923C" stroke-width="2.5" stroke-linecap="round"/><line x1="48" y1="42" x2="40" y2="10" stroke="#FB923C" stroke-width="2.5" stroke-linecap="round"/></svg>`
  },
  {
    id: "schema-light-truss",
    name: "Ферма (Трасс)",
    code: "LGT-04",
    category: "schema_light",
    price: 5000,
    width: 100,
    height: 35,
    caption: "Ферма",
    svgMarkup: `<svg viewBox="0 0 100 35" class="w-full h-full"><line x1="5" y1="8" x2="95" y2="8" stroke="#475569" stroke-width="2.5"/><line x1="5" y1="22" x2="95" y2="22" stroke="#475569" stroke-width="2.5"/><path d="M 5 8 L 20 22 L 35 8 L 50 22 L 65 8 L 80 22 L 95 8" fill="none" stroke="#64748B" stroke-width="1.5"/></svg>`
  },
  {
    id: "schema-light-sofit",
    name: "Софит / Прожектор",
    code: "LGT-05",
    category: "schema_light",
    price: 4000,
    width: 60,
    height: 60,
    caption: "Софит",
    svgMarkup: `<svg viewBox="0 0 60 60" class="w-full h-full"><polygon points="20,12 40,12 48,32 12,32" fill="#FFF7ED" stroke="#F97316" stroke-width="2.5"/><polygon points="12,32 48,32 55,50 5,50" fill="#FFEDD5" opacity="0.6" stroke="#FB923C" stroke-width="1.5" stroke-dasharray="3,2"/><circle cx="30" cy="12" r="4" fill="#C2410C"/></svg>`
  },
  {
    id: "schema-light-smoke",
    name: "Генератор дыма",
    code: "LGT-06",
    category: "schema_light",
    price: 7000,
    width: 65,
    height: 65,
    caption: "Дым-машина",
    svgMarkup: `<svg viewBox="0 0 65 65" class="w-full h-full"><rect x="10" y="24" width="45" height="30" rx="4" fill="#F1F5F9" stroke="#475569" stroke-width="2"/><circle cx="20" cy="39" r="5" fill="#94A3B8"/><path d="M 40 22 C 38 14, 48 10, 44 4 C 52 8, 56 16, 50 22 Z" fill="#E2E8F0" stroke="#64748B" stroke-width="1.5"/></svg>`
  },

  // 7. Электрика (Electricity)
  {
    id: "schema-socket",
    name: "Розетка",
    code: "EL-01",
    category: "schema_electricity",
    price: 500,
    width: 55,
    height: 55,
    caption: "Розетка",
    svgMarkup: `<svg viewBox="0 0 55 55" class="w-full h-full"><circle cx="27.5" cy="27.5" r="18" fill="#FEF2F2" stroke="#EF4444" stroke-width="2.5"/><circle cx="21" cy="27.5" r="3" fill="#EF4444"/><circle cx="34" cy="27.5" r="3" fill="#EF4444"/></svg>`
  },
  {
    id: "schema-split",
    name: "Сплит",
    code: "EL-02",
    category: "schema_electricity",
    price: 15000,
    width: 55,
    height: 55,
    caption: "Сплит",
    svgMarkup: `<svg viewBox="0 0 55 55" class="w-full h-full"><g stroke="#2563EB" stroke-width="2" stroke-linecap="round"><line x1="27.5" y1="6" x2="27.5" y2="48"/><line x1="6.5" y1="27.5" x2="48.5" y2="27.5"/><line x1="12.5" y1="12.5" x2="42.5" y2="42.5"/><line x1="12.5" y1="42.5" x2="42.5" y2="12.5"/></g></svg>`
  },

  // 8. Дорожки (Pathways)
  {
    id: "schema-pathway-straight",
    name: "Дорожка (Прямая)",
    code: "PATH-01",
    category: "schema_pathways",
    price: 2000,
    width: 100,
    height: 40,
    caption: "Дорожка",
    svgMarkup: `<svg viewBox="0 0 100 40" class="w-full h-full"><line x1="5" y1="12" x2="95" y2="12" stroke="#475569" stroke-width="2.5"/><line x1="5" y1="28" x2="95" y2="28" stroke="#475569" stroke-width="2.5"/></svg>`
  },
  {
    id: "schema-pathway-curved",
    name: "Дорожка (Изогнутая)",
    code: "PATH-02",
    category: "schema_pathways",
    price: 2500,
    width: 80,
    height: 75,
    caption: "Дорожка",
    svgMarkup: `<svg viewBox="0 0 80 75" class="w-full h-full"><path d="M 10 60 Q 10 15 65 15" fill="none" stroke="#475569" stroke-width="2.5"/><path d="M 22 60 Q 22 27 65 27" fill="none" stroke="#475569" stroke-width="2.5"/></svg>`
  },

  // 9. Фигуры (Shapes)
  {
    id: "schema-shape-star",
    name: "Звезда",
    code: "SHP-01",
    category: "schema_shapes",
    price: 1000,
    width: 60,
    height: 60,
    caption: "",
    svgMarkup: `<svg viewBox="0 0 60 60" class="w-full h-full"><polygon points="30,5 37.5,20 54,22.5 42,34.5 45,51 30,43 15,51 18,34.5 6,22.5 22.5,20" fill="#F8FAFC" stroke="#475569" stroke-width="2.5" stroke-linejoin="round"/></svg>`
  },
  {
    id: "schema-shape-hexagon",
    name: "Шестиугольник",
    code: "SHP-02",
    category: "schema_shapes",
    price: 1000,
    width: 60,
    height: 60,
    caption: "",
    svgMarkup: `<svg viewBox="0 0 60 60" class="w-full h-full"><polygon points="30,6 52,18 52,42 30,54 8,42 8,18" fill="#F8FAFC" stroke="#475569" stroke-width="2.5" stroke-linejoin="round"/></svg>`
  },
  {
    id: "schema-shape-circle",
    name: "Круг",
    code: "SHP-03",
    category: "schema_shapes",
    price: 1000,
    width: 60,
    height: 60,
    caption: "",
    svgMarkup: `<svg viewBox="0 0 60 60" class="w-full h-full"><circle cx="30" cy="30" r="24" fill="#F8FAFC" stroke="#475569" stroke-width="2.5"/></svg>`
  },
  {
    id: "schema-shape-square",
    name: "Квадрат",
    code: "SHP-04",
    category: "schema_shapes",
    price: 1000,
    width: 60,
    height: 60,
    caption: "",
    svgMarkup: `<svg viewBox="0 0 60 60" class="w-full h-full"><rect x="8" y="8" width="44" height="44" rx="2" fill="#F8FAFC" stroke="#475569" stroke-width="2.5"/></svg>`
  },
  {
    id: "schema-shape-triangle",
    name: "Треугольник",
    code: "SHP-05",
    category: "schema_shapes",
    price: 1000,
    width: 60,
    height: 60,
    caption: "",
    svgMarkup: `<svg viewBox="0 0 60 60" class="w-full h-full"><polygon points="30,8 52,50 8,50" fill="#F8FAFC" stroke="#475569" stroke-width="2.5" stroke-linejoin="round"/></svg>`
  },
  {
    id: "schema-shape-arrow",
    name: "Стрелка",
    code: "SHP-06",
    category: "schema_shapes",
    price: 500,
    width: 80,
    height: 40,
    caption: "",
    svgMarkup: `<svg viewBox="0 0 80 40" class="w-full h-full"><line x1="8" y1="20" x2="68" y2="20" stroke="#475569" stroke-width="3" stroke-linecap="round"/><polygon points="68,20 54,12 56,20 54,28" fill="#475569"/></svg>`
  },
  {
    id: "schema-shape-line",
    name: "Прямая линия",
    code: "SHP-07",
    category: "schema_shapes",
    price: 500,
    width: 80,
    height: 30,
    caption: "",
    svgMarkup: `<svg viewBox="0 0 80 30" class="w-full h-full"><line x1="6" y1="15" x2="74" y2="15" stroke="#475569" stroke-width="3" stroke-linecap="round"/></svg>`
  },
  {
    id: "schema-shape-measurement",
    name: "Размерный замер",
    code: "MEAS-01",
    category: "schema_shapes",
    price: 0,
    width: 160,
    height: 30,
    caption: "250 см",
    svgMarkup: `<svg viewBox="0 0 160 30" class="w-full h-full text-zinc-700 dark:text-zinc-200"><line x1="4" y1="4" x2="4" y2="26" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="156" y1="4" x2="156" y2="26" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="4" y1="15" x2="156" y2="15" stroke="currentColor" stroke-width="1.5"/><polygon points="4,15 12,11 12,19" fill="currentColor"/><polygon points="156,15 148,11 148,19" fill="currentColor"/><rect x="55" y="5" width="50" height="20" rx="10" fill="#FFFFFF" stroke="currentColor" stroke-width="1.2"/><text x="80" y="19" font-size="10" font-weight="bold" fill="currentColor" text-anchor="middle">250 см</text></svg>`
  },

  // 10. Вход/Выход (Entrance/Exit)
  {
    id: "schema-entrance",
    name: "Вход",
    code: "INOUT-01",
    category: "schema_entrance_exit",
    price: 500,
    width: 90,
    height: 45,
    caption: "Вход",
    svgMarkup: `<svg viewBox="0 0 90 45" class="w-full h-full"><rect x="4" y="4" width="82" height="37" rx="4" fill="#F8FAFC" stroke="#475569" stroke-width="2"/><rect x="60" y="12" width="20" height="20" rx="3" fill="none" stroke="#475569" stroke-width="1.5"/><path d="M 77 15 L 67 25 M 67 25 H 73 M 67 25 V 19" fill="none" stroke="#475569" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  },
  {
    id: "schema-exit",
    name: "Выход",
    code: "INOUT-02",
    category: "schema_entrance_exit",
    price: 500,
    width: 90,
    height: 45,
    caption: "Выход",
    svgMarkup: `<svg viewBox="0 0 90 45" class="w-full h-full"><rect x="4" y="4" width="82" height="37" rx="4" fill="#F8FAFC" stroke="#475569" stroke-width="2"/><rect x="60" y="12" width="20" height="20" rx="3" fill="none" stroke="#475569" stroke-width="1.5"/><path d="M 67 25 L 77 15 M 77 15 H 71 M 77 15 V 21" fill="none" stroke="#475569" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  }
];

// Simple customized items for categories not extensively in EditorLibraryData
const CUSTOM_LIBRARY_ITEMS: LibraryItem[] = [
  {
    id: "text-1",
    name: "Вывеска «Happily Ever After»",
    code: "T-101",
    category: "text",
    price: 15000,
    width: 200,
    height: 60,
    svgMarkup: `
      <svg viewBox="0 0 150 50" class="w-full h-full text-violet-500">
        <text x="75" y="32" font-family="sans-serif" font-size="12" font-weight="bold" fill="currentColor" text-anchor="middle">Happily Ever After</text>
      </svg>
    `
  },
  {
    id: "text-2",
    name: "Вывеска «Вместе Навсегда»",
    code: "T-102",
    category: "text",
    price: 14000,
    width: 180,
    height: 50,
    svgMarkup: `
      <svg viewBox="0 0 150 50" class="w-full h-full text-pink-500">
        <text x="75" y="32" font-family="sans-serif" font-size="14" font-weight="extrabold" fill="currentColor" text-anchor="middle">Вместе Навсегда</text>
      </svg>
    `
  },
  {
    id: "scene-prem-1",
    name: "Подиум с бэкдропом «Дымчатый»",
    code: "S-201",
    category: "scenes",
    price: 45000,
    width: 320,
    height: 180,
    svgMarkup: `
      <svg viewBox="0 0 160 90" class="w-full h-full text-indigo-950">
        <rect x="5" y="5" width="150" height="80" fill="currentColor" rx="4" opacity="0.8" />
        <circle cx="20" cy="20" r="1.5" fill="#FFF" />
        <circle cx="80" cy="15" r="1.5" fill="#FFF" />
        <circle cx="140" cy="20" r="1.5" fill="#FFF" />
      </svg>
    `
  },
  {
    id: "screen-wood",
    name: "Резная ширма «Ажур»",
    code: "SH-301",
    category: "screens",
    price: 18000,
    width: 200,
    height: 220,
    svgMarkup: `
      <svg viewBox="0 0 100 110" class="w-full h-full text-amber-900/60">
        <rect x="5" y="5" width="28" height="100" stroke="currentColor" stroke-width="3" fill="none" />
        <rect x="36" y="5" width="28" height="100" stroke="currentColor" stroke-width="3" fill="none" />
        <rect x="67" y="5" width="28" height="100" stroke="currentColor" stroke-width="3" fill="none" />
      </svg>
    `
  },
  {
    id: "comp-rose",
    name: "Цветочная стойка «Каскад Роз»",
    code: "C-401",
    category: "compositions",
    price: 35000,
    width: 100,
    height: 240,
    svgMarkup: `
      <svg viewBox="0 0 50 120" class="w-full h-full text-rose-300">
        <line x1="25" y1="40" x2="25" y2="115" stroke="#999" stroke-width="3" />
        <circle cx="25" cy="30" r="18" fill="currentColor" />
        <circle cx="20" cy="25" r="5" fill="#F43F5E" />
        <circle cx="30" cy="35" r="5" fill="#F43F5E" />
      </svg>
    `
  },
  {
    id: "rogati-safari",
    name: "Рогатая арка «Сафари»",
    code: "R-601",
    category: "rogati",
    price: 22000,
    width: 200,
    height: 240,
    svgMarkup: `
      <svg viewBox="0 0 100 120" class="w-full h-full text-amber-800">
        <path d="M20 115 L45 25 L80 115" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" />
        <path d="M45 25 L35 10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
        <path d="M45 25 L55 10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
      </svg>
    `
  },
  {
    id: "chek-classic",
    name: "Колонна Чекман «Классик»",
    code: "CH-701",
    category: "chekmans",
    price: 15000,
    width: 80,
    height: 220,
    svgMarkup: `
      <svg viewBox="0 0 40 100" class="w-full h-full text-zinc-300">
        <rect x="10" y="15" width="20" height="75" fill="currentColor" stroke="#777" stroke-width="1.5" />
        <rect x="6" y="8" width="28" height="7" fill="#AAA" />
        <rect x="6" y="90" width="28" height="7" fill="#AAA" />
      </svg>
    `
  },
  {
    id: "book-guest",
    name: "Книга пожеланий бархатная",
    code: "B-801",
    category: "books",
    price: 5500,
    width: 80,
    height: 60,
    svgMarkup: `
      <svg viewBox="0 0 60 40" class="w-full h-full text-violet-800">
        <rect x="5" y="5" width="23" height="30" fill="currentColor" rx="1" />
        <rect x="32" y="5" width="23" height="30" fill="currentColor" rx="1" />
        <line x1="29" y1="5" x2="29" y2="35" stroke="#FFF" stroke-width="2" />
      </svg>
    `
  },
  {
    id: "theme-forest",
    name: "Вывеска «Лесная Сказка» с рогами",
    code: "TM-301",
    category: "themes",
    price: 18000,
    width: 200,
    height: 110,
    svgMarkup: `
      <svg viewBox="0 0 100 60" class="w-full h-full text-green-700">
        <rect x="15" y="15" width="70" height="30" fill="#F5F5DC" stroke="currentColor" stroke-width="2" />
        <text x="50" y="34" font-size="7" font-weight="bold" fill="currentColor" text-anchor="middle">Лесная Сказка</text>
      </svg>
    `
  },
  {
    id: "stoyka-arka",
    name: "Стойка Арка",
    code: "A-304",
    category: "stands",
    price: 0, // введите цену
    width: 120,
    height: 220,
    svgMarkup: `
      <svg viewBox="0 0 80 120" class="w-full h-full text-violet-400">
        <path d="M15 115 L15 45 Q15 15 40 15 Q65 15 65 45 L65 115" stroke="currentColor" stroke-width="3" fill="none" />
        <line x1="15" y1="115" x2="65" y2="115" stroke="currentColor" stroke-width="2" />
      </svg>
    `
  },
  {
    id: "stoyka-kvadrat",
    name: "Стойка Квадрат",
    code: "CC-001",
    category: "stands",
    price: 2000,
    width: 140,
    height: 200,
    svgMarkup: `
      <svg viewBox="0 0 80 120" class="w-full h-full text-zinc-400">
        <rect x="15" y="15" width="50" height="90" stroke="currentColor" stroke-width="3" fill="none" />
      </svg>
    `
  },
  {
    id: "kruglaya-osnova",
    name: "Круглая основа",
    code: "CC-002",
    category: "stands",
    price: 3500,
    width: 200,
    height: 200,
    svgMarkup: `
      <svg viewBox="0 0 100 100" class="w-full h-full text-zinc-400">
        <circle cx="50" cy="50" r="42" stroke="currentColor" stroke-width="3.5" fill="none" />
        <line x1="25" y1="85" x2="75" y2="85" stroke="currentColor" stroke-width="2" />
      </svg>
    `
  },
  {
    id: "konsol",
    name: "Консоль",
    code: "CC-003",
    category: "stands",
    price: 2000,
    width: 180,
    height: 90,
    svgMarkup: `
      <svg viewBox="0 0 100 60" class="w-full h-full text-zinc-400">
        <rect x="10" y="15" width="80" height="8" fill="currentColor" />
        <line x1="20" y1="23" x2="20" y2="55" stroke="currentColor" stroke-width="2.5" />
        <line x1="80" y1="23" x2="80" y2="55" stroke="currentColor" stroke-width="2.5" />
        <line x1="15" y1="55" x2="85" y2="55" stroke="currentColor" stroke-width="1.5" />
      </svg>
    `
  },
  {
    id: "stoyka-metall",
    name: "Стойка Металл",
    code: "CC-004",
    category: "stands",
    price: 2000,
    width: 100,
    height: 220,
    svgMarkup: `
      <svg viewBox="0 0 60 120" class="w-full h-full text-zinc-500">
        <rect x="15" y="10" width="30" height="100" stroke="currentColor" stroke-width="2" fill="none" />
        <line x1="10" y1="110" x2="50" y2="110" stroke="currentColor" stroke-width="3" />
      </svg>
    `
  },
  {
    id: "arka-dvoynaya",
    name: "Арка Двойная",
    code: "CC-005",
    category: "stands",
    price: 2000,
    width: 220,
    height: 240,
    svgMarkup: `
      <svg viewBox="0 0 100 120" class="w-full h-full text-violet-400">
        <path d="M15 115 L15 45 Q15 15 50 15 Q85 15 85 45 L85 115" stroke="currentColor" stroke-width="2.5" fill="none" />
        <path d="M25 115 L25 50 Q25 25 50 25 Q75 25 75 50 L75 115" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.6" />
      </svg>
    `
  },
  {
    id: "shirma-klassika",
    name: "Ширма Классика",
    code: "CC-006",
    category: "screens",
    price: 2000,
    width: 240,
    height: 220,
    svgMarkup: `
      <svg viewBox="0 0 120 100" class="w-full h-full text-zinc-400">
        <rect x="10" y="10" width="30" height="80" stroke="currentColor" stroke-width="2" fill="none" />
        <rect x="45" y="10" width="30" height="80" stroke="currentColor" stroke-width="2" fill="none" />
        <rect x="80" y="10" width="30" height="80" stroke="currentColor" stroke-width="2" fill="none" />
      </svg>
    `
  }
];

export default function MoodboardEditor({ projects, initialProjectId, onSaveToProject, showToast, setHeaderActions, onAddAiImage, mobileNavButton, onBackToProjectCard }: MoodboardEditorProps) {
  // Top Active Mode / Scene Tabs: "scene-1" | "scene-2" | "floorplan"
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<string>('scene-1');
  const [isVisualizationsDropdownOpen, setIsVisualizationsDropdownOpen] = useState<boolean>(false);

  // Sidebar Controls Tabs: 1 = Library, 2 = Layers
  const [activeSidebarTab, setActiveSidebarTab] = useState<'library' | 'layers'>('library');

  // Selected Project and Data binding
  const [activeProjectId, setActiveProjectId] = useState<string>(initialProjectId || '');

  useEffect(() => {
    if (initialProjectId !== undefined) {
      setActiveProjectId(initialProjectId || '');
    }
  }, [initialProjectId]);
  const currentProject = projects.find(p => p.id === activeProjectId);

  // Core Scenes for the 2D collage workspace
  const [scenes, setScenes] = useState<EditorScene[]>(() => {
    const proj = activeProjectId ? projects.find(p => p.id === activeProjectId) : (initialProjectId ? projects.find(p => p.id === initialProjectId) : null);
    let baseScenes = (proj?.scenesData && proj.scenesData.length > 0)
      ? [...proj.scenesData]
      : [
          {
            id: 'scene-1',
            name: 'Визуализация 1',
            elements: [],
            backdropImage: '',
            backdropColor: '#F3F4F6',
            backdropType: 'color'
          }
        ];
    if (!baseScenes.some(s => s.id === 'floorplan')) {
      baseScenes.push({
        id: 'floorplan',
        name: 'Схема расстановки',
        elements: [],
        backdropImage: '',
        backdropColor: '#F3F4F6',
        backdropType: 'color'
      });
    }
    return baseScenes;
  });

  const activeSceneIndex = scenes.findIndex(s => s.id === activeWorkspaceTab);
  const activeScene = activeSceneIndex !== -1 ? scenes[activeSceneIndex] : (scenes.find(s => s.id === 'floorplan') || scenes[0] || { id: 'scene-1', name: 'Визуализация 1', elements: [], backdropImage: '', backdropColor: '#F3F4F6', backdropType: 'color' });

  const handleAddNewScene = () => {
    const vizScenes = scenes.filter(s => s.id !== 'floorplan');
    const newSceneNum = vizScenes.length + 1;
    const newSceneId = `scene-${Date.now()}`;
    const newScene: EditorScene = {
      id: newSceneId,
      name: `Визуализация ${newSceneNum}`,
      elements: [],
      backdropImage: '',
      backdropColor: '#F3F4F6',
      backdropType: 'color'
    };
    setScenes(prev => {
      const floorplanScene = prev.find(s => s.id === 'floorplan');
      const otherScenes = prev.filter(s => s.id !== 'floorplan');
      return floorplanScene
        ? [...otherScenes, newScene, floorplanScene]
        : [...otherScenes, newScene];
    });
    setActiveWorkspaceTab(newSceneId);
    setIsVisualizationsDropdownOpen(false);
    showToast('Новая визуализация', `Создана Виз. ${newSceneNum}`, 'info');
  };

  const handleDeleteScene = (sceneId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const vizScenes = scenes.filter(s => s.id !== 'floorplan');
    if (vizScenes.length <= 1) {
      const newSceneId = `scene-${Date.now()}`;
      const newScene: EditorScene = {
        id: newSceneId,
        name: 'Визуализация 1',
        elements: [],
        backdropImage: '',
        backdropColor: '#F3F4F6',
        backdropType: 'color'
      };
      setScenes(prev => {
        const floorplan = prev.find(s => s.id === 'floorplan');
        return floorplan ? [newScene, floorplan] : [newScene];
      });
      setActiveWorkspaceTab(newSceneId);
      showToast('Визуализация удалена', 'Создана новая чистая визуализация.', 'info');
      return;
    }

    const remainingViz = vizScenes.filter(s => s.id !== sceneId);
    setScenes(prev => prev.filter(s => s.id !== sceneId));

    if (activeWorkspaceTab === sceneId) {
      setActiveWorkspaceTab(remainingViz[0].id);
    }
    showToast('Визуализация удалена', 'Выбранная визуализация успешно удалена.', 'info');
  };

  // Seating Arrangement Floor Plan
  const [floorPlanElements, setFloorPlanElements] = useState<PlanElement[]>(() => {
    const proj = activeProjectId ? projects.find(p => p.id === activeProjectId) : (initialProjectId ? projects.find(p => p.id === initialProjectId) : null);
    return proj?.floorPlanData || [];
  });

  // Track loaded project ID to re-sync canvas scenes when changing active project
  const loadedProjectIdRef = useRef<string | null>(initialProjectId || null);

  useEffect(() => {
    if (loadedProjectIdRef.current !== activeProjectId) {
      loadedProjectIdRef.current = activeProjectId || null;
      setIsLeftToolbarCollapsed(true);
      setIsRightToolbarCollapsed(false);
      const proj = activeProjectId ? projects.find(p => p.id === activeProjectId) : null;
      let loadedScenes = (proj?.scenesData && proj.scenesData.length > 0)
        ? [...proj.scenesData]
        : [
            {
              id: 'scene-1',
              name: 'Визуализация 1',
              elements: [],
              backdropImage: '',
              backdropColor: '#F3F4F6',
              backdropType: 'color'
            }
          ];
      if (!loadedScenes.some(s => s.id === 'floorplan')) {
        loadedScenes.push({
          id: 'floorplan',
          name: 'Схема расстановки',
          elements: [],
          backdropImage: '',
          backdropColor: '#F3F4F6',
          backdropType: 'color'
        });
      }
      setScenes(loadedScenes);
      setActiveWorkspaceTab(prev => (loadedScenes.some(s => s.id === prev)) ? prev : loadedScenes[0].id);

      if (proj?.floorPlanData) {
        setFloorPlanElements(proj.floorPlanData);
      } else {
        setFloorPlanElements([]);
      }
    }
  }, [activeProjectId, projects]);

  // Selection IDs on the Canvas (Supports multi-selection group)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedId = selectedIds.length === 1 ? selectedIds[0] : null;

  const setSelectedId = (id: string | null) => {
    if (id === null) {
      setSelectedIds([]);
    } else {
      setSelectedIds([id]);
    }
  };

  // Drag and Drop ordering state for sidebar layers
  const [draggedLayerIdx, setDraggedLayerIdx] = useState<number | null>(null);
  const [dragOverLayerIdx, setDragOverLayerIdx] = useState<number | null>(null);

  // Expanded project element in right sidebar
  const [expandedElementId, setExpandedElementId] = useState<string | null>(null);
  const [draftPrice, setDraftPrice] = useState<string>('');
  const [draftNote, setDraftNote] = useState<string>('');

  // Active popovers & adjustment floating tools
  const [activeToolPopover, setActiveToolPopover] = useState<'group' | 'layers' | 'flip' | null>(null);
  const [showQuickLayerMenu, setShowQuickLayerMenu] = useState<boolean>(false);
  const [activeFilterTool, setActiveFilterTool] = useState<'brightness' | 'contrast' | 'saturate' | 'hue' | 'opacity' | 'temp' | 'zoom' | 'recolor' | 'shadow' | null>(null);
  const [mobileDrawerTab, setMobileDrawerTab] = useState<'library' | 'layers' | null>(null);
  const [isBackdropPopoverOpen, setIsBackdropPopoverOpen] = useState<boolean>(false);

  // Collapsible toolbars states (Left toolbar expanded by default now)
  const [isLeftToolbarCollapsed, setIsLeftToolbarCollapsed] = useState<boolean>(false);
  const [isRightToolbarCollapsed, setIsRightToolbarCollapsed] = useState<boolean>(false);
  const [isColorZoomToolbarCollapsed, setIsColorZoomToolbarCollapsed] = useState<boolean>(false);

  // Undo/Redo Stacking
  const [history, setHistory] = useState<EditorScene[][]>([JSON.parse(JSON.stringify(scenes))]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Library Category filtering
  const [selectedCategory, setSelectedCategory] = useState<string>('construction');
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
  const [editingCaptionText, setEditingCaptionText] = useState<string>('');
  const [libSearch, setLibSearch] = useState<string>('');
  const [favoritesList, setFavoritesList] = useState<string[]>(['text-1', 'arch-1']);
  const [showCategoryIconManager, setShowCategoryIconManager] = useState<boolean>(false);
  const [itemToPreview, setItemToPreview] = useState<LibraryItem | null>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const adjustedAspectIdsRef = useRef<Set<string>>(new Set());

  // Sync with Admin Cabinet decor library items from IndexedDB / storage
  const [adminDecorItems, setAdminDecorItems] = useState<any[]>(() => {
    return getSyncStorageItem('admin_decor_library', []);
  });

  useEffect(() => {
    getStorageItem<any[]>('admin_decor_library', []).then(items => {
      setAdminDecorItems(items);
    });

    const handleUpdate = () => {
      getStorageItem<any[]>('admin_decor_library', []).then(items => {
        setAdminDecorItems(items);
      });
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('admin_library_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('admin_library_updated', handleUpdate);
    };
  }, []);

  // Auto-sync selected category when switching between visualization and schema tabs
  useEffect(() => {
    if (activeWorkspaceTab === 'floorplan') {
      if (!SCHEMA_CATALOG_CATEGORIES.some(c => c.id === selectedCategory) && selectedCategory !== 'favorites') {
        setSelectedCategory(SCHEMA_CATALOG_CATEGORIES[0]?.id || 'schema_furniture');
      }
    } else {
      if (SCHEMA_CATALOG_CATEGORIES.some(c => c.id === selectedCategory)) {
        setSelectedCategory('construction');
      }
    }
  }, [activeWorkspaceTab]);

  // Canvas Dimension Configurations
  const [canvasWidthMm, setCanvasWidthMm] = useState<number>(6500);
  const [canvasHeightMm, setCanvasHeightMm] = useState<number>(4400);
  const [gridVisible, setGridVisible] = useState<boolean>(true);
  
  // Per-scene human host silhouette settings (unlinked between Visualization and Scheme)
  const activeHumanVisible = activeScene?.humanVisible ?? true;
  const activeHumanPos = activeScene?.humanPos || null;
  const activeHumanHeightCm = activeScene?.humanHeightCm || 175;

  const updateActiveSceneHuman = (updates: { humanVisible?: boolean; humanPos?: { x: number; y: number } | null; humanHeightCm?: number }) => {
    setScenes(prev => prev.map(s => {
      if (s.id === activeScene.id) {
        return {
          ...s,
          humanVisible: updates.humanVisible !== undefined ? updates.humanVisible : (s.humanVisible ?? true),
          humanPos: updates.humanPos !== undefined ? (updates.humanPos !== null ? updates.humanPos : undefined) : s.humanPos,
          humanHeightCm: updates.humanHeightCm !== undefined ? updates.humanHeightCm : (s.humanHeightCm || 175),
        };
      }
      return s;
    }));
  };

  const [isDraggingHuman, setIsDraggingHuman] = useState<boolean>(false);
  const [activeUnit, setActiveUnit] = useState<'mm' | 'cm' | 'm'>('cm');

  // Measurement Tool States
  const [isDrawingMeasurement, setIsDrawingMeasurement] = useState<boolean>(false);
  const [measureSubMode, setMeasureSubMode] = useState<'auto' | 'manual'>('auto');
  const [measureStartPos, setMeasureStartPos] = useState<{ x: number; y: number } | null>(null);
  const [measureCurrentPos, setMeasureCurrentPos] = useState<{ x: number; y: number } | null>(null);
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false);
  const [editingMeasurementId, setEditingMeasurementId] = useState<string | null>(null);
  const [editingMeasurementValue, setEditingMeasurementValue] = useState<string>('');
  const [areMeasurementsVisible, setAreMeasurementsVisible] = useState<boolean>(true);

  // Dynamic scaling state for canvas auto-fit
  const [canvasScale, setCanvasScale] = useState<number>(1);

  // Zooming & Panning states
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });

  // Aspect ratio lock for tools
  const [isRatioLocked, setIsRatioLocked] = useState<boolean>(true);

  // Draft inputs for bottom canvas sizes
  const [canvasWidthInput, setCanvasWidthInput] = useState<string>('');
  const [canvasHeightInput, setCanvasHeightInput] = useState<string>('');

  useEffect(() => {
    setCanvasWidthInput(toDisplayValue(canvasWidthMm).toString());
    setCanvasHeightInput(toDisplayValue(canvasHeightMm).toString());
  }, [canvasWidthMm, canvasHeightMm, activeUnit]);

  // AI visualization modal state
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [aiGeneratingProgress, setAiGeneratingProgress] = useState<number>(0);
  const [isAiResultModalOpen, setIsAiResultModalOpen] = useState<boolean>(false);
  const [aiGeneratedResultUrl, setAiGeneratedResultUrl] = useState<string | null>(null);

  // General references
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Point-to-point drawing listener for measurement tool
  useEffect(() => {
    if (!isMeasuring) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (canvasContainerRef.current) {
        const rect = canvasContainerRef.current.getBoundingClientRect();
        const currentScale = canvasScale * zoomScale;
        const currentX = (e.clientX - rect.left) / currentScale;
        const currentY = (e.clientY - rect.top) / currentScale;
        setMeasureCurrentPos({ x: currentX, y: currentY });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (measureStartPos && canvasContainerRef.current) {
        const rect = canvasContainerRef.current.getBoundingClientRect();
        const currentScale = canvasScale * zoomScale;
        const endX = (e.clientX - rect.left) / currentScale;
        const endY = (e.clientY - rect.top) / currentScale;

        const dx = endX - measureStartPos.x;
        const dy = endY - measureStartPos.y;
        const distancePx = Math.hypot(dx, dy);

        if (distancePx > 10) {
          const valCm = Math.round(distancePx);
          const valStr = activeUnit === 'm' ? `${(valCm / 100).toFixed(1)} м` : `${valCm} см`;
          const len = Math.max(20, Math.round(distancePx));
          const angle = Math.round((Math.atan2(dy, dx) * 180) / Math.PI);

          const newElem: CanvasElement = {
            id: `measurement-${Date.now()}`,
            name: `Замер (${valStr})`,
            type: 'measurement',
            x: Math.round(measureStartPos.x),
            y: Math.round(measureStartPos.y - 15),
            w: Math.round(len),
            h: 30,
            rotation: angle,
            exposure: 0,
            hue: 0,
            temp: 0,
            saturate: 100,
            opacity: 100,
            price: 0,
            comment: '',
            code: 'MEAS-01',
            caption: valStr,
            measurementValue: valStr,
            isLocked: false,
            isVisible: true,
            isFlippedH: false,
            isFlippedV: false,
            svgMarkup: ''
          };

          updateActiveSceneElements(prev => [...prev, newElem]);
          setSelectedId(newElem.id);
          setAreMeasurementsVisible(true);
          showToast('Замер нанесен', `Длина: ${valStr}. Кликните в центр для изменения.`, 'success');
        }
      }
      setIsMeasuring(false);
      setMeasureStartPos(null);
      setMeasureCurrentPos(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isMeasuring, measureStartPos, canvasScale, zoomScale, activeUnit]);

  useEffect(() => {
    let rafId: number;
    const updateScale = () => {
      if (!viewportRef.current) return;
      const parentWidth = Math.max(viewportRef.current.clientWidth - 24, 100);
      const parentHeight = Math.max(viewportRef.current.clientHeight - 24, 100);
      
      const canvasWidth = canvasWidthMm / 10;
      const canvasHeight = canvasHeightMm / 10;
      
      const scaleW = parentWidth / canvasWidth;
      const scaleH = parentHeight / canvasHeight;
      
      const newScale = Math.min(scaleW, scaleH, 2.5);
      const targetScale = newScale > 0.1 ? newScale : 1;
      setCanvasScale(prev => (Math.abs(prev - targetScale) > 0.01 ? targetScale : prev));
    };

    const handleResizeObs = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateScale);
    };

    updateScale();
    window.addEventListener('resize', handleResizeObs);
    
    let observer: ResizeObserver | null = null;
    if (viewportRef.current) {
      observer = new ResizeObserver(() => {
        handleResizeObs();
      });
      observer.observe(viewportRef.current);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResizeObs);
      if (observer) observer.disconnect();
    };
  }, [canvasWidthMm, canvasHeightMm]);

  // Mouse Wheel Zooming on Canvas Viewport
  useEffect(() => {
    const viewportEl = viewportRef.current;
    if (!viewportEl) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY;
      const zoomFactor = delta > 0 ? 1.08 : 0.92;
      setZoomScale(prev => {
        const next = prev * zoomFactor;
        return Math.min(Math.max(next, 0.2), 4.0);
      });
    };

    viewportEl.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      viewportEl.removeEventListener('wheel', handleWheel);
    };
  }, [activeWorkspaceTab]);

  // Undo / Redo registration
  const recordHistory = (updatedScenes: EditorScene[]) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    setHistory([...nextHistory, JSON.parse(JSON.stringify(updatedScenes))]);
    setHistoryIndex(nextHistory.length);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const nextIdx = historyIndex - 1;
      setHistoryIndex(nextIdx);
      setScenes(JSON.parse(JSON.stringify(history[nextIdx])));
      showToast('Отмена', 'Предыдущее действие отменено.', 'info');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setScenes(JSON.parse(JSON.stringify(history[nextIdx])));
      showToast('Повтор', 'Действие повторено.', 'info');
    }
  };

  // Convert unit displaying
  const toDisplayValue = (valMm: number) => {
    if (activeUnit === 'cm') return Math.round(valMm / 10);
    if (activeUnit === 'm') return parseFloat((valMm / 1000).toFixed(2));
    return valMm;
  };

  const fromDisplayValue = (displayVal: number) => {
    if (activeUnit === 'cm') return displayVal * 10;
    if (activeUnit === 'm') return displayVal * 1000;
    return displayVal;
  };

  // Set selected element properties
  const handleSelectElement = (id: string) => {
    const targetEl = activeScene.elements.find(el => el.id === id);
    if (targetEl && targetEl.groupId) {
      const groupElIds = activeScene.elements
        .filter(el => el.groupId === targetEl.groupId && el.isVisible)
        .map(el => el.id);
      setSelectedIds(groupElIds);
    } else {
      setSelectedId(id);
    }
  };

  // Grouping & Ungrouping persistent logic
  const handleGroupSelectedElements = () => {
    if (selectedIds.length < 2) {
      showToast('Группировка', 'Для объединения в постоянную группу выберите 2 или более элементов', 'info');
      return;
    }

    const newGroupId = `group-${Date.now()}`;
    updateActiveSceneElements(elements =>
      elements.map(el =>
        selectedIds.includes(el.id) ? { ...el, groupId: newGroupId } : el
      )
    );

    showToast('Сгруппировано', `${selectedIds.length} элементов сгруппированы. Теперь они перемещаются вместе!`, 'success');
  };

  const handleUngroupSelectedElements = () => {
    if (selectedIds.length === 0) {
      showToast('Разгруппировка', 'Выберите элементы для разгруппировки', 'info');
      return;
    }

    const selectedElements = activeScene.elements.filter(el => selectedIds.includes(el.id));
    const targetGroupIds = new Set(selectedElements.map(el => el.groupId).filter(Boolean));

    if (targetGroupIds.size === 0) {
      showToast('Разгруппировка', 'Выбранные элементы не состоят в группе', 'info');
      return;
    }

    updateActiveSceneElements(elements =>
      elements.map(el =>
        el.groupId && targetGroupIds.has(el.groupId) ? { ...el, groupId: undefined } : el
      )
    );

    showToast('Разгруппировано', 'Элементы разгруппированы и теперь независимы.', 'info');
  };

  // Modifying active scene helper
  const updateActiveSceneElements = (updater: (elements: CanvasElement[]) => CanvasElement[]) => {
    const updated = scenes.map(s => {
      if (s.id === activeScene.id) {
        return { ...s, elements: updater(s.elements) };
      }
      return s;
    });
    setScenes(updated);
    recordHistory(updated);
  };

  const isInteractingWithElementRef = useRef(false);

  // Deselect all active tools and selections on empty area click
  const deselectAllAndTools = () => {
    setSelectedIds([]);
    setSelectedId(null);
    setActiveToolPopover(null);
    setActiveFilterTool(null);
    setIsDrawingMeasurement(false);
    setRotationInputId(null);
    setEditingMeasurementId(null);
    setIsBackdropPopoverOpen(false);
  };

  const handleDeselectIfEmptySpace = (e: React.MouseEvent) => {
    if (isInteractingWithElementRef.current) return;
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('select') ||
      target.closest('textarea') ||
      target.closest('label') ||
      target.closest('[role="dialog"]') ||
      target.closest('[data-tool-popover]') ||
      target.closest('[data-toolbar]')
    ) {
      return;
    }
    deselectAllAndTools();
  };

  // Helper to apply automatic width & height measurement lines for a canvas element
  const applyAutoMeasurements = (el: CanvasElement) => {
    const wCm = Math.round(el.w);
    const hCm = Math.round(el.h);
    const wStr = activeUnit === 'm' ? `${(wCm / 100).toFixed(1)} м` : `${wCm} см`;
    const hStr = activeUnit === 'm' ? `${(hCm / 100).toFixed(1)} м` : `${hCm} см`;

    const horizY = Math.max(10, Math.round(el.y - 35));
    const horizX = Math.round(el.x);
    const vertX = Math.max(10, Math.round(el.x - 35));
    const vertY = Math.round(el.y - 15);

    const horizElem: CanvasElement = {
      id: `measurement-${Date.now()}-h`,
      name: `Ширина: ${wStr}`,
      type: 'measurement',
      x: horizX,
      y: horizY,
      w: Math.max(20, wCm),
      h: 30,
      rotation: 0,
      exposure: 0, hue: 0, temp: 0, saturate: 100, opacity: 100, price: 0, comment: '', code: 'MEAS-01',
      caption: wStr,
      measurementValue: wStr,
      isLocked: false, isVisible: true, isFlippedH: false, isFlippedV: false, svgMarkup: ''
    };

    const vertElem: CanvasElement = {
      id: `measurement-${Date.now()}-v`,
      name: `Высота: ${hStr}`,
      type: 'measurement',
      x: vertX,
      y: vertY,
      w: Math.max(20, hCm),
      h: 30,
      rotation: 90,
      exposure: 0, hue: 0, temp: 0, saturate: 100, opacity: 100, price: 0, comment: '', code: 'MEAS-01',
      caption: hStr,
      measurementValue: hStr,
      isLocked: false, isVisible: true, isFlippedH: false, isFlippedV: false, svgMarkup: ''
    };

    updateActiveSceneElements(prev => [...prev, horizElem, vertElem]);
    setAreMeasurementsVisible(true);
    showToast('Автозамер нанесен', `${el.name || 'Объект'}: ${wStr} × ${hStr}`, 'success');
  };

  const applyAutoMeasurementsForSelection = () => {
    if (selectedIds.length > 1) {
      const selectedElements = activeScene.elements.filter(el => selectedIds.includes(el.id) && el.isVisible);
      if (selectedElements.length === 0) return;
      const minX = Math.min(...selectedElements.map(el => el.x));
      const maxX = Math.max(...selectedElements.map(el => el.x + el.w));
      const minY = Math.min(...selectedElements.map(el => el.y));
      const maxY = Math.max(...selectedElements.map(el => el.y + el.h));
      const totalW = Math.round(maxX - minX);
      const totalH = Math.round(maxY - minY);

      const syntheticElem: CanvasElement = {
        ...selectedElements[0],
        x: minX,
        y: minY,
        w: totalW,
        h: totalH,
        name: 'Группа объектов'
      };
      applyAutoMeasurements(syntheticElem);
    } else if (selectedId) {
      const elem = activeScene.elements.find(el => el.id === selectedId);
      if (elem) {
        applyAutoMeasurements(elem);
      }
    } else {
      showToast('Выберите объект', 'Кликните на объект на холсте для нанесения замеров', 'info');
    }
  };

  // Helper for deleting currently selected elements
  const handleDeleteSelected = () => {
    if (selectedIds.length > 0) {
      const count = selectedIds.length;
      updateActiveSceneElements(els => els.filter(el => !selectedIds.includes(el.id)));
      setSelectedIds([]);
      showToast('Удалено', count > 1 ? `Удалено ${count} элементов с холста` : 'Элемент удален с холста', 'info');
    } else if (selectedId) {
      updateActiveSceneElements(els => els.filter(el => el.id !== selectedId));
      setSelectedId(null);
      showToast('Удалено', 'Элемент удален с холста', 'info');
    } else {
      showToast('Удаление', 'Выберите элементы для удаления', 'info');
    }
  };

  // Helper for copying/duplicating currently selected elements
  const handleCopySelected = () => {
    if (selectedIds.length > 1) {
      const selectedElements = activeScene.elements.filter(el => selectedIds.includes(el.id) && el.isVisible);
      if (selectedElements.length === 0) return;
      const newElements: CanvasElement[] = [];
      const newIds: string[] = [];
      selectedElements.forEach(el => {
        const dupId = `${el.type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        newIds.push(dupId);
        newElements.push({
          ...el,
          id: dupId,
          x: Math.min(canvasWidthMm / 10 - el.w, el.x + 20),
          y: Math.min(canvasHeightMm / 10 - el.h, el.y + 20)
        });
      });
      updateActiveSceneElements(prev => [...prev, ...newElements]);
      setSelectedIds(newIds);
      showToast('Копирование группы', `Скопировано ${selectedElements.length} элементов`, 'success');
    } else if (selectedId) {
      const elem = activeScene.elements.find(el => el.id === selectedId);
      if (elem) {
        const dup = { ...elem, id: `${elem.type}-${Date.now()}`, x: Math.min(canvasWidthMm / 10 - elem.w, elem.x + 20), y: Math.min(canvasHeightMm / 10 - elem.h, elem.y + 20) };
        updateActiveSceneElements(els => [...els, dup]);
        setSelectedId(dup.id);
        showToast('Копирование', 'Элемент продублирован', 'success');
      }
    } else {
      showToast('Выберите элементы', 'Кликните на элемент для копирования', 'info');
    }
  };

  // Helper for moving/nudging selected elements with arrow keys
  const handleNudgeSelected = (dx: number, dy: number) => {
    if (selectedIds.length > 0) {
      updateActiveSceneElements(els =>
        els.map(el => (selectedIds.includes(el.id) && !el.isLocked ? { ...el, x: Math.max(0, Math.min(canvasWidthMm / 10 - el.w, el.x + dx)), y: Math.max(0, Math.min(canvasHeightMm / 10 - el.h, el.y + dy)) } : el))
      );
    } else if (selectedId) {
      updateActiveSceneElements(els =>
        els.map(el => (el.id === selectedId && !el.isLocked ? { ...el, x: Math.max(0, Math.min(canvasWidthMm / 10 - el.w, el.x + dx)), y: Math.max(0, Math.min(canvasHeightMm / 10 - el.h, el.y + dy)) } : el))
      );
    }
  };

  // Global Keyboard Shortcuts (Delete, Ctrl+C / Cmd+C, Arrow Keys movement)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keydown if focus is inside an input, textarea, or contenteditable element
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
         target.tagName === 'TEXTAREA' ||
         target.isContentEditable ||
         target.closest('input') ||
         target.closest('textarea'))
      ) {
        return;
      }

      const hasSelection = selectedIds.length > 0 || selectedId !== null;

      // 1. Delete or Backspace key
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (hasSelection) {
          e.preventDefault();
          handleDeleteSelected();
        }
        return;
      }

      // 2. Ctrl+C or Cmd+C (also Ctrl+V, Ctrl+D) for copying / duplicating
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C' || e.key === 'v' || e.key === 'V' || e.key === 'd' || e.key === 'D')) {
        if (hasSelection) {
          e.preventDefault();
          handleCopySelected();
        }
        return;
      }

      // 3. Arrow keys for moving objects on the scene
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        if (hasSelection) {
          e.preventDefault();
          const step = e.shiftKey ? 10 : 2;
          let dx = 0;
          let dy = 0;
          if (e.key === 'ArrowLeft') dx = -step;
          if (e.key === 'ArrowRight') dx = step;
          if (e.key === 'ArrowUp') dy = -step;
          if (e.key === 'ArrowDown') dy = step;
          handleNudgeSelected(dx, dy);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedIds, selectedId, activeScene, canvasWidthMm, canvasHeightMm]);

  // Dynamic cost summary
  const sceneTotalCost = activeScene.elements.reduce((sum, el) => sum + (el.isVisible ? el.price : 0), 0);

  // Library listing helper
  const getCategoryItems = (): LibraryItem[] => {
    let baseList: LibraryItem[] = [];

    if (activeWorkspaceTab === 'floorplan') {
      if (selectedCategory === 'favorites') {
        baseList = SCHEMA_LIBRARY_ITEMS.filter(item => favoritesList.includes(item.id));
      } else {
        baseList = SCHEMA_LIBRARY_ITEMS.filter(i => i.category === selectedCategory);
      }
    } else if (selectedCategory === 'favorites') {
      baseList = [
        ...CUSTOM_LIBRARY_ITEMS,
        ...(CATALOG_ASSETS.arches || []),
        ...(CATALOG_ASSETS.tables || []),
        ...(CATALOG_ASSETS.flowers || []),
        ...(CATALOG_ASSETS.stands || []),
        ...(CATALOG_ASSETS.balloons || []),
        ...(CATALOG_ASSETS.decor || []),
        ...(CATALOG_ASSETS.light || []),
        ...(CATALOG_ASSETS.textiles || [])
      ].filter(item => favoritesList.includes(item.id));
    } else {
      let custom = CUSTOM_LIBRARY_ITEMS.filter(i => i.category === selectedCategory);
      if (selectedCategory === 'construction') {
        custom = CUSTOM_LIBRARY_ITEMS.filter(i => ['construction', 'arches', 'stands', 'screens', 'compositions'].includes(i.category));
      } else if (selectedCategory === 'decor') {
        custom = CUSTOM_LIBRARY_ITEMS.filter(i => ['decor', 'details', 'vases'].includes(i.category));
      } else if (selectedCategory === 'furniture') {
        custom = CUSTOM_LIBRARY_ITEMS.filter(i => ['furniture', 'tables'].includes(i.category));
      }

      let assetItems: LibraryItem[] = [];
      switch (selectedCategory) {
        case 'warehouse':
          assetItems = [
            ...(CATALOG_ASSETS.arches || []),
            ...(CATALOG_ASSETS.stands || []),
            ...(CATALOG_ASSETS.tables || []),
            ...(CATALOG_ASSETS.flowers || []),
            ...(CATALOG_ASSETS.decor || [])
          ];
          break;
        case 'construction':
        case 'arches':
        case 'stands':
        case 'screens':
          assetItems = [
            ...(CATALOG_ASSETS.arches || []),
            ...(CATALOG_ASSETS.stands || [])
          ];
          break;
        case 'podiums':
          assetItems = [];
          break;
        case 'textiles':
          assetItems = CATALOG_ASSETS.textiles || [];
          break;
        case 'flowers':
          assetItems = CATALOG_ASSETS.flowers || [];
          break;
        case 'balloons':
          assetItems = CATALOG_ASSETS.balloons || [];
          break;
        case 'decor':
        case 'details':
        case 'vases':
          assetItems = CATALOG_ASSETS.decor || [];
          break;
        case 'sequins':
          assetItems = (CATALOG_ASSETS.decor || []).filter(i => i.name.toLowerCase().includes('пайетк') || i.id.toLowerCase().includes('sequin'));
          break;
        case 'light':
          assetItems = CATALOG_ASSETS.light || [];
          break;
        case 'furniture':
        case 'tables':
          assetItems = CATALOG_ASSETS.tables || [];
          break;
        case 'tableware':
        case 'serving':
          assetItems = (CATALOG_ASSETS.decor || []).filter(i => i.name.toLowerCase().includes('сервировк') || i.name.toLowerCase().includes('посуд') || i.name.toLowerCase().includes('бокал') || i.name.toLowerCase().includes('тарелк'));
          break;
        case 'themes':
          assetItems = [];
          break;
        case 'text':
          assetItems = [];
          break;
        default:
          break;
      }

      // Convert user uploaded items from Admin Cabinet decor library
      const isItemInCategory = (itemCat: string, selCat: string) => {
        if (!itemCat || !selCat) return false;
        const ic = itemCat.toLowerCase().trim();
        const sc = selCat.toLowerCase().trim();

        if (ic === sc) return true;

        const synonymsMap: Record<string, string[]> = {
          construction: ['конструкции', 'конструкция', 'arches', 'stands', 'screens', 'арки', 'каркасы', 'стойки'],
          podiums: ['подиумы', 'подиум', 'сцена', 'тумбы'],
          textiles: ['текстиль', 'ткани', 'драпировки', 'скатерти'],
          flowers: ['флористика', 'цветы', 'цветочные композиции', 'гирлянды'],
          balloons: ['шары', 'аэродизайн', 'воздушные шары'],
          decor: ['декор', 'аксессуары', 'вазы', 'детали'],
          sequins: ['пайетки', 'паетку', 'зеркальные панели'],
          light: ['свет', 'освещение', 'прожекторы', 'свечи'],
          furniture: ['мебель', 'столы', 'стулья', 'диваны'],
          tableware: ['сервировка', 'посуда', 'канделябры', 'бокалы'],
          themes: ['тематика', 'концепт-зоны'],
          text: ['текст', 'неон', 'вывески', 'буквы'],
          warehouse: ['склад', 'инвентарь']
        };

        if (synonymsMap[sc]) {
          if (synonymsMap[sc].some(syn => ic.includes(syn) || syn.includes(ic))) return true;
        }

        for (const [id, synonyms] of Object.entries(synonymsMap)) {
          if (synonyms.includes(sc) || id === sc) {
            if (ic === id || synonyms.some(syn => ic.includes(syn) || syn.includes(ic))) return true;
          }
        }

        return false;
      };

      const convertedAdminItems: LibraryItem[] = adminDecorItems
        .filter((item: any) => isItemInCategory(item.category || '', selectedCategory))
        .map((item: any) => {
          const isImg = item.imageUrl && (item.imageUrl.startsWith('data:') || item.imageUrl.startsWith('http'));
          const markup = isImg
            ? `<img src="${item.imageUrl}" alt="${item.name}" class="w-full h-full object-contain pointer-events-none" />`
            : item.imageUrl || `<svg viewBox="0 0 100 100" class="w-full h-full"><rect width="100" height="100" fill="#F3E8FF"/><text x="50" y="55" text-anchor="middle" font-size="12" fill="var(--lavDeep, #8C52D0)">${item.name}</text></svg>`;

          return {
            id: item.id,
            name: item.name,
            code: item.sku || `SKU-${item.id.slice(-4)}`,
            category: selectedCategory,
            price: item.price || 0,
            width: item.widthCm || 100,
            height: item.heightCm || 100,
            svgMarkup: markup,
            customImage: isImg ? item.imageUrl : undefined,
            caption: undefined
          } as LibraryItem;
        });

      baseList = [...convertedAdminItems, ...custom, ...assetItems];
    }

    if (libSearch) {
      baseList = baseList.filter(item =>
        item.name.toLowerCase().includes(libSearch.toLowerCase()) ||
        item.code.toLowerCase().includes(libSearch.toLowerCase())
      );
    }
    return baseList;
  };

  const toggleFavorite = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (favoritesList.includes(itemId)) {
      setFavoritesList(prev => prev.filter(id => id !== itemId));
    } else {
      setFavoritesList(prev => [...prev, itemId]);
    }
  };

  // Add Item to Canvas
  const handleAddElementToScene = (item: LibraryItem) => {
    const defaultW = item.width;
    const defaultH = item.height;
    const isMeasurementItem = item.id === 'schema-shape-measurement' || item.code === 'MEAS-01';
    
    const extractedImage = item.customImage || (item.svgMarkup && item.svgMarkup.startsWith('<img') ? item.svgMarkup.match(/src="([^"]+)"/)?.[1] : undefined);

    // Spawn in Center of Canvas Workspace
    const newEl: CanvasElement = {
      id: `${item.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: item.name,
      type: isMeasurementItem ? 'measurement' : item.category,
      caption: isMeasurementItem ? (item.caption || '250 см') : undefined,
      measurementValue: isMeasurementItem ? (item.caption || '250 см') : undefined,
      x: 180,
      y: 100,
      w: defaultW,
      h: defaultH,
      rotation: 0,
      exposure: 0,
      hue: 0,
      temp: 0,
      saturate: 100,
      opacity: 100,
      price: item.price,
      comment: '',
      isLocked: false,
      isVisible: true,
      isFlippedH: false,
      isFlippedV: false,
      svgMarkup: item.svgMarkup,
      customImage: extractedImage
    };

    updateActiveSceneElements(prev => [...prev, newEl]);
    setSelectedId(newEl.id);
    showToast('Добавлено', `Элемент "${item.name}" добавлен на сцену.`, 'success');
  };

  // Add Item to Canvas at dropped coordinates
  const handleAddElementAtPosition = (item: LibraryItem, posX: number, posY: number) => {
    const defaultW = item.width;
    const defaultH = item.height;
    const isMeasurementItem = item.id === 'schema-shape-measurement' || item.code === 'MEAS-01';
    
    const extractedImage = item.customImage || (item.svgMarkup && item.svgMarkup.startsWith('<img') ? item.svgMarkup.match(/src="([^"]+)"/)?.[1] : undefined);

    const newEl: CanvasElement = {
      id: `${item.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: item.name,
      type: isMeasurementItem ? 'measurement' : item.category,
      caption: isMeasurementItem ? (item.caption || '250 см') : undefined,
      measurementValue: isMeasurementItem ? (item.caption || '250 см') : undefined,
      x: posX,
      y: posY,
      w: defaultW,
      h: defaultH,
      rotation: 0,
      exposure: 0,
      hue: 0,
      temp: 0,
      saturate: 100,
      opacity: 100,
      price: item.price,
      comment: '',
      isLocked: false,
      isVisible: true,
      isFlippedH: false,
      isFlippedV: false,
      svgMarkup: item.svgMarkup,
      customImage: extractedImage
    };

    updateActiveSceneElements(prev => [...prev, newEl]);
    setSelectedId(newEl.id);
    showToast('Перенесено', `Элемент "${item.name}" размещен на сцене.`, 'success');
  };

  // Upload own PNG onto Canvas
  const handleCustomPngUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      const newCustomEl: CanvasElement = {
        id: `custom-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ""),
        type: 'custom',
        x: 150,
        y: 100,
        w: 200,
        h: 200,
        rotation: 0,
        exposure: 0,
        hue: 0,
        temp: 0,
        saturate: 100,
        opacity: 100,
        price: 5000,
        comment: 'Пользовательская картинка',
        isLocked: false,
        isVisible: true,
        isFlippedH: false,
        isFlippedV: false,
        svgMarkup: '',
        customImage: base64Url
      };
      updateActiveSceneElements(prev => [...prev, newCustomEl]);
      setSelectedId(newCustomEl.id);
      showToast('Загружено', 'Собственная картинка успешно размещена на холсте.', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Layers Up/Down Ordering Logic
  const handleMoveLayer = (idx: number, direction: 'up' | 'down') => {
    const updated = [...activeScene.elements];
    if (direction === 'up' && idx < updated.length - 1) {
      const temp = updated[idx];
      updated[idx] = updated[idx + 1];
      updated[idx + 1] = temp;
    } else if (direction === 'down' && idx > 0) {
      const temp = updated[idx];
      updated[idx] = updated[idx - 1];
      updated[idx - 1] = temp;
    }
    updateActiveSceneElements(() => updated);
  };

  const handleReorderLayer = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0) return;
    updateActiveSceneElements(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIdx, 1);
      updated.splice(toIdx, 0, moved);
      return updated;
    });
  };

  // Alignment transformations
  const handleAlignSelected = (alignment: 'left' | 'center' | 'right') => {
    if (!selectedId) return;
    const canvasWidthPx = canvasWidthMm / 10;
    
    updateActiveSceneElements(elements => elements.map(el => {
      if (el.id === selectedId) {
        let nextX = el.x;
        if (alignment === 'left') nextX = 10;
        else if (alignment === 'center') nextX = (canvasWidthPx - el.w) / 2;
        else if (alignment === 'right') nextX = canvasWidthPx - el.w - 10;
        return { ...el, x: Math.round(nextX) };
      }
      return el;
    }));
  };

  // Color & backdrop selections
  const handleCanvasBackdropChange = (type: 'color' | 'image', value: string) => {
    const updated = scenes.map(s => {
      if (s.id === activeScene.id) {
        return {
          ...s,
          backdropType: type,
          backdropColor: type === 'color' ? value : s.backdropColor,
          backdropImage: type === 'image' ? value : s.backdropImage,
          backdropScale: s.backdropScale || 1,
          backdropX: s.backdropX || 0,
          backdropY: s.backdropY || 0
        };
      }
      return s;
    });
    setScenes(updated);
    recordHistory(updated);
  };

  const updateActiveSceneBackdropScale = (newScale: number) => {
    const clampedScale = Math.max(0.5, Math.min(3.5, newScale));
    const updated = scenes.map(s => {
      if (s.id === activeScene.id) {
        return {
          ...s,
          backdropScale: parseFloat(clampedScale.toFixed(2))
        };
      }
      return s;
    });
    setScenes(updated);
    recordHistory(updated);
  };

  const handleUploadCanvasBackdrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      handleCanvasBackdropChange('image', base64Url);
      showToast('Фон обновлен', 'Собственное изображение применено как фон.', 'success');
    };
    reader.readAsDataURL(file);
    // Reset input value so re-selecting same file triggers onChange again
    e.target.value = '';
  };

  // AI Background & Photorealistic Render simulation
  const handleStartAiGeneration = () => {
    setIsAiGenerating(true);
    setAiGeneratingProgress(15);
    
    const interval = setInterval(() => {
      setAiGeneratingProgress(prev => {
        if (prev >= 92) {
          clearInterval(interval);
          return 92;
        }
        return prev + 18;
      });
    }, 400);

    setTimeout(async () => {
      clearInterval(interval);
      setAiGeneratingProgress(100);
      
      const hasCustomBackdrop = activeScene.backdropType === 'image' && Boolean(activeScene.backdropImage);
      
      // Clean vacant white room with plain white walls and clean floor (no decorations or furniture)
      const vacantWhiteRoomBg = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200';
      
      let finalBg = hasCustomBackdrop ? activeScene.backdropImage : vacantWhiteRoomBg;

      if (!hasCustomBackdrop && aiPrompt.trim()) {
        const text = aiPrompt.toLowerCase();
        if (text.includes('лофт') || text.includes('кирпич')) {
          finalBg = 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&q=80&w=1200';
        } else if (text.includes('дворец') || text.includes('классик') || text.includes('белый')) {
          finalBg = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200';
        } else if (text.includes('лес') || text.includes('природа') || text.includes('зелен')) {
          finalBg = 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=1200';
        } else if (text.includes('пляж') || text.includes('море') || text.includes('песок')) {
          finalBg = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200';
        }
      }

      // Capture the composition snapshot from canvas or fallback to background URL
      let capturedResultUrl = '';
      try {
        capturedResultUrl = await captureCanvasPreview();
      } catch (e) {
        capturedResultUrl = finalBg;
      }

      // DO NOT CHANGE the editor's canvas backdrop!
      // The canvas background in the editor remains untouched as requested.

      const renderResultUrl = (capturedResultUrl && !capturedResultUrl.includes('unsplash')) 
        ? capturedResultUrl 
        : finalBg;

      setAiGeneratedResultUrl(renderResultUrl);
      setIsAiGenerating(false);
      setIsAiModalOpen(false);
      setIsAiResultModalOpen(true);
      showToast('3D-рендер готов', 'Нажмите «Сохранить в карточку проекта», чтобы добавить макет в проект.', 'success');
    }, 2200);
  };

  const handleSaveGeneratedToProject = () => {
    if (!aiGeneratedResultUrl || !activeProjectId) return;

    // Update scene image / previewUrl with the generated render
    const updatedScenes = scenes.map((sc) => {
      if (sc.id === activeScene.id) {
        return {
          ...sc,
          previewUrl: aiGeneratedResultUrl,
          image: aiGeneratedResultUrl,
          imageUrl: aiGeneratedResultUrl,
        };
      }
      return sc;
    });

    setScenes(updatedScenes);

    const estimateItems: EstimateItem[] = (activeScene?.elements || []).map((el) => ({
      id: el.id,
      name: el.name,
      category: el.type,
      quantity: 1,
      price: el.price,
      comment: el.comment || 'Сгенерировано в 2D арках',
      photoUrl: el.customImage || ''
    }));

    // Save directly to project card
    onSaveToProject(activeProjectId, aiGeneratedResultUrl, estimateItems, sceneTotalCost, updatedScenes, floorPlanElements);

    // Also add to My Images -> AI category
    if (onAddAiImage) {
      onAddAiImage(aiGeneratedResultUrl, aiPrompt || 'Фотореалистичный 3D-рендер', currentProject?.name || 'Основной проект');
    }

    showToast('Сохранено в проект', 'Визуализация успешно добавлена в карточку проекта.', 'success');
    setIsAiResultModalOpen(false);
  };

  const handleDownloadGeneratedResult = () => {
    if (!aiGeneratedResultUrl) return;
    const link = document.createElement('a');
    link.href = aiGeneratedResultUrl;
    link.download = `3d-render-${currentProject?.name || 'project'}-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Скачивание', 'Сохранение визуализации на ваш компьютер...', 'info');
  };

  // Saving & Autosave States
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Helper to capture high-quality canvas snapshot image without zoom/pan distortion or black letterboxing
  const captureCanvasPreview = async (): Promise<string> => {
    if (canvasContainerRef.current) {
      try {
        const dataUrl = await toJpeg(canvasContainerRef.current, {
          quality: 0.95,
          pixelRatio: 2,
          backgroundColor: activeScene?.backdropColor || '#FFFFFF',
          style: {
            transform: 'none',
            margin: '0',
            position: 'relative',
            top: '0',
            left: '0',
            boxShadow: 'none',
            borderRadius: '0',
          },
          cacheBust: true,
        });
        if (dataUrl && dataUrl.length > 200) {
          return dataUrl;
        }
      } catch (err) {
        console.warn('Canvas snapshot capture warning:', err);
      }
    }
    return activeScene?.backdropImage || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80';
  };

  // Core Actions
  const handleSaveProjectCollage = useCallback(async (isAutoSave = false) => {
    if (isSaving || !activeProjectId) return;
    setIsSaving(true);

    // Save previous selections & clear them so tools/handles don't render in snapshot
    const prevSelectedId = selectedId;
    const prevSelectedIds = selectedIds;
    setSelectedId(null);
    setSelectedIds([]);

    // Give React 50ms to unrender selection boxes and toolbars
    await new Promise((r) => setTimeout(r, 50));

    try {
      const previewUrl = await captureCanvasPreview();

      const updatedScenes = scenes.map((sc) => {
        if (sc.id === activeScene.id) {
          return {
            ...sc,
            previewUrl,
            image: previewUrl,
            imageUrl: previewUrl,
          };
        }
        return sc;
      });

      setScenes(updatedScenes);

      const estimateItems: EstimateItem[] = (activeScene?.elements || []).map((el) => ({
        id: el.id,
        name: el.name,
        category: el.type,
        quantity: 1,
        price: el.price,
        comment: el.comment || 'Сгенерировано в 2D арках',
        photoUrl: el.customImage || ''
      }));

      onSaveToProject(activeProjectId, previewUrl, estimateItems, sceneTotalCost, updatedScenes, floorPlanElements);

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSavedTime(timeStr);

      if (isAutoSave) {
        showToast('Автосохранение', `Проект и превью визуализации сохранены (${timeStr})`, 'info');
      } else {
        showToast('Сохранено в проект', `Визуализация, объекты канваса и смета сохранены.`, 'success');
      }
    } catch (err) {
      console.error('Error saving project:', err);
    } finally {
      // Restore selections
      setSelectedId(prevSelectedId);
      setSelectedIds(prevSelectedIds);
      setIsSaving(false);
    }
  }, [activeProjectId, activeScene, sceneTotalCost, onSaveToProject, showToast, isSaving, selectedId, selectedIds, scenes, floorPlanElements]);

  // 5-minute Auto-save timer (300,000 ms = 5 minutes)
  useEffect(() => {
    const AUTOSAVE_INTERVAL_MS = 5 * 60 * 1000;
    const intervalId = setInterval(() => {
      handleSaveProjectCollage(true);
    }, AUTOSAVE_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [handleSaveProjectCollage]);

  const handleDownloadLayout = () => {
    showToast('Загрузка', 'Файл спецификации и PDF-версия эскиза подготовлены.', 'success');
    window.print();
  };

  // Drag, Resize and Rotate implementation
  interface AlignmentLine {
    type: 'v' | 'h';
    pos: number;
    label?: string;
  }
  const [alignmentLines, setAlignmentLines] = useState<AlignmentLine[]>([]);
  const [activeAction, setActiveAction] = useState<'move' | 'resize' | 'rotate' | 'move-group' | 'move-caption' | null>(null);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [rotationInputId, setRotationInputId] = useState<string | null>(null);

  const rotateClickStartRef = useRef({ x: 0, y: 0, time: 0 });
  const isCaptionDraggingRef = useRef<boolean>(false);

  const dragCaptionStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    initialOffsetX: number;
    initialOffsetY: number;
    elementId: string;
    elementRotation: number;
  }>({
    mouseX: 0,
    mouseY: 0,
    initialOffsetX: 0,
    initialOffsetY: 0,
    elementId: '',
    elementRotation: 0
  });

  const handleCaptionMouseDown = (e: React.MouseEvent, el: CanvasElement) => {
    e.stopPropagation();
    isInteractingWithElementRef.current = true;
    isCaptionDraggingRef.current = false;
    handleSelectElement(el.id);
    setActiveAction('move-caption');
    setActiveHandle(null);
    dragCaptionStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialOffsetX: el.captionOffsetX || 0,
      initialOffsetY: el.captionOffsetY || 0,
      elementId: el.id,
      elementRotation: el.rotation
    };
  };
  
  const dragStartRef = useRef({
    x: 0,
    y: 0,
    elX: 0,
    elY: 0,
    elW: 0,
    elH: 0,
    rotation: 0
  });

  const dragGroupStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    items: { id: string; x: number; y: number }[];
  }>({ mouseX: 0, mouseY: 0, items: [] });

  const rotateStartRef = useRef({
    startAngle: 0,
    startRotation: 0,
    centerX: 0,
    centerY: 0
  });

  const handleCanvasMouseDown = (e: React.MouseEvent, el: CanvasElement) => {
    e.stopPropagation();
    isInteractingWithElementRef.current = true;

    // Auto-measurement mode trigger on object click
    if (isDrawingMeasurement && measureSubMode === 'auto') {
      applyAutoMeasurements(el);
      setSelectedId(el.id);
      return;
    }

    // Multi-select with Shift/Ctrl
    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      if (selectedIds.includes(el.id)) {
        setSelectedIds(prev => prev.filter(id => id !== el.id));
      } else {
        setSelectedIds(prev => [...prev, el.id]);
      }
      return;
    }

    // Determine target selection list (persistent groupId or currently selected group)
    let targetIds: string[] = [];
    if (el.groupId) {
      targetIds = activeScene.elements.filter(item => item.groupId === el.groupId && item.isVisible).map(i => i.id);
    } else if (selectedIds.length > 1 && selectedIds.includes(el.id)) {
      targetIds = selectedIds;
    }

    if (targetIds.length > 1) {
      setSelectedIds(targetIds);
      const selectedElements = activeScene.elements.filter(item => targetIds.includes(item.id) && item.isVisible);
      if (selectedElements.some(item => item.isLocked)) {
        setActiveAction(null);
        setActiveHandle(null);
        return;
      }
      setActiveAction('move-group');
      setActiveHandle(null);
      dragGroupStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        items: selectedElements.map(item => ({ id: item.id, x: item.x, y: item.y }))
      };
      return;
    }

    handleSelectElement(el.id);
    if (el.isLocked) {
      setActiveAction(null);
      setActiveHandle(null);
      return;
    }
    setActiveAction('move');
    setActiveHandle(null);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      elX: el.x,
      elY: el.y,
      elW: el.w,
      elH: el.h,
      rotation: el.rotation
    };
  };

  const handleDuplicateElement = (el: CanvasElement) => {
    const duplicated: CanvasElement = {
      ...el,
      id: `${el.type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: `${el.name} (Копия)`,
      x: Math.min(canvasWidthMm / 10 - el.w, el.x + 30),
      y: Math.min(canvasHeightMm / 10 - el.h, el.y + 30),
      isLocked: false
    };
    updateActiveSceneElements(prev => [...prev, duplicated]);
    setSelectedId(duplicated.id);
    showToast('Скопировано', `Элемент "${el.name}" продублирован.`, 'success');
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!activeAction) return;

    if (activeAction === 'move-caption') {
      const currentScale = canvasScale * zoomScale;
      const rawDx = (e.clientX - dragCaptionStartRef.current.mouseX) / currentScale;
      const rawDy = (e.clientY - dragCaptionStartRef.current.mouseY) / currentScale;

      if (Math.hypot(rawDx, rawDy) > 3) {
        isCaptionDraggingRef.current = true;
      }

      const rotRad = (dragCaptionStartRef.current.elementRotation * Math.PI) / 180;
      const localDx = rawDx * Math.cos(rotRad) + rawDy * Math.sin(rotRad);
      const localDy = -rawDx * Math.sin(rotRad) + rawDy * Math.cos(rotRad);

      const newOffsetX = Math.round(dragCaptionStartRef.current.initialOffsetX + localDx);
      const newOffsetY = Math.round(dragCaptionStartRef.current.initialOffsetY + localDy);

      setScenes(prev => prev.map(s => {
        if (s.id === activeScene.id) {
          return {
            ...s,
            elements: s.elements.map(item => {
              if (item.id === dragCaptionStartRef.current.elementId) {
                return {
                  ...item,
                  captionOffsetX: newOffsetX,
                  captionOffsetY: newOffsetY
                };
              }
              return item;
            })
          };
        }
        return s;
      }));
      return;
    }

    if (activeAction === 'move-group') {
      const dx = (e.clientX - dragGroupStartRef.current.mouseX) / canvasScale;
      const dy = (e.clientY - dragGroupStartRef.current.mouseY) / canvasScale;

      const groupItems = dragGroupStartRef.current.items;
      const canvasW = canvasWidthMm / 10;
      const canvasH = canvasHeightMm / 10;
      const SNAP_THRESHOLD = 7;

      let shiftDx = dx;
      let shiftDy = dy;
      const newLines: AlignmentLine[] = [];

      if (groupItems.length > 0) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        groupItems.forEach(gi => {
          const itemEl = activeScene.elements.find(i => i.id === gi.id);
          const w = itemEl ? itemEl.w : 50;
          const h = itemEl ? itemEl.h : 50;
          const currX = gi.x + dx;
          const currY = gi.y + dy;
          minX = Math.min(minX, currX);
          minY = Math.min(minY, currY);
          maxX = Math.max(maxX, currX + w);
          maxY = Math.max(maxY, currY + h);
        });

        const groupW = maxX - minX;
        const groupH = maxY - minY;

        // Targets: Canvas edges and center
        const vTargets: { pos: number; label?: string }[] = [
          { pos: 0, label: 'Край' },
          { pos: canvasW / 2, label: 'Центр' },
          { pos: canvasW, label: 'Край' }
        ];
        const hTargets: { pos: number; label?: string }[] = [
          { pos: 0, label: 'Край' },
          { pos: canvasH / 2, label: 'Центр' },
          { pos: canvasH, label: 'Край' }
        ];

        // Grid targets if grid is active
        if (gridVisible) {
          for (let gx = 50; gx < canvasW; gx += 50) {
            if (Math.abs(gx - canvasW / 2) > 2) vTargets.push({ pos: gx });
          }
          for (let gy = 50; gy < canvasH; gy += 50) {
            if (Math.abs(gy - canvasH / 2) > 2) hTargets.push({ pos: gy });
          }
        }

        // Other elements not in group
        const groupIds = new Set(groupItems.map(g => g.id));
        const otherElements = activeScene.elements.filter(el => !groupIds.has(el.id) && el.isVisible);

        otherElements.forEach(other => {
          vTargets.push({ pos: other.x }, { pos: other.x + other.w / 2, label: 'Центр' }, { pos: other.x + other.w });
          hTargets.push({ pos: other.y }, { pos: other.y + other.h / 2, label: 'Центр' }, { pos: other.y + other.h });
        });

        // Group points along X and Y
        const gXPoints = [
          { val: minX, offset: 0 },
          { val: minX + groupW / 2, offset: groupW / 2 },
          { val: maxX, offset: groupW }
        ];
        const gYPoints = [
          { val: minY, offset: 0 },
          { val: minY + groupH / 2, offset: groupH / 2 },
          { val: maxY, offset: groupH }
        ];

        let minVDiff = SNAP_THRESHOLD + 1;
        let snapVLine: AlignmentLine | null = null;
        let snapXOffset: number | null = null;

        for (const xp of gXPoints) {
          for (const vt of vTargets) {
            const diff = Math.abs(xp.val - vt.pos);
            if (diff < minVDiff) {
              minVDiff = diff;
              snapXOffset = vt.pos - xp.val;
              snapVLine = { type: 'v', pos: Math.round(vt.pos), label: vt.label };
            }
          }
        }

        if (snapXOffset !== null && snapVLine) {
          shiftDx += snapXOffset;
          newLines.push(snapVLine);
        }

        let minHDiff = SNAP_THRESHOLD + 1;
        let snapHLine: AlignmentLine | null = null;
        let snapYOffset: number | null = null;

        for (const yp of gYPoints) {
          for (const ht of hTargets) {
            const diff = Math.abs(yp.val - ht.pos);
            if (diff < minHDiff) {
              minHDiff = diff;
              snapYOffset = ht.pos - yp.val;
              snapHLine = { type: 'h', pos: Math.round(ht.pos), label: ht.label };
            }
          }
        }

        if (snapYOffset !== null && snapHLine) {
          shiftDy += snapYOffset;
          newLines.push(snapHLine);
        }
      }

      setAlignmentLines(newLines);

      setScenes(prev => prev.map(s => {
        if (s.id === activeScene.id) {
          return {
            ...s,
            elements: s.elements.map(el => {
              const initial = dragGroupStartRef.current.items.find(i => i.id === el.id);
              if (initial) {
                return {
                  ...el,
                  x: Math.max(0, Math.min(canvasW - el.w, Math.round(initial.x + shiftDx))),
                  y: Math.max(0, Math.min(canvasH - el.h, Math.round(initial.y + shiftDy)))
                };
              }
              return el;
            })
          };
        }
        return s;
      }));
      return;
    }

    if (!selectedId) return;

    if (activeAction === 'move') {
      const dx = (e.clientX - dragStartRef.current.x) / canvasScale;
      const dy = (e.clientY - dragStartRef.current.y) / canvasScale;
      
      const rawX = dragStartRef.current.elX + dx;
      const rawY = dragStartRef.current.elY + dy;
      const elW = dragStartRef.current.elW;
      const elH = dragStartRef.current.elH;

      const canvasW = canvasWidthMm / 10;
      const canvasH = canvasHeightMm / 10;

      const clampedX = Math.max(0, Math.min(canvasW - elW, rawX));
      const clampedY = Math.max(0, Math.min(canvasH - elH, rawY));

      const SNAP_THRESHOLD = 7;

      // Targets: Canvas edges and center
      const vTargets: { pos: number; label?: string }[] = [
        { pos: 0, label: '0' },
        { pos: canvasW / 2, label: 'Центр' },
        { pos: canvasW, label: `${canvasW}` }
      ];
      const hTargets: { pos: number; label?: string }[] = [
        { pos: 0, label: '0' },
        { pos: canvasH / 2, label: 'Центр' },
        { pos: canvasH, label: `${canvasH}` }
      ];

      // Grid targets if grid is enabled
      if (gridVisible) {
        for (let gx = 50; gx < canvasW; gx += 50) {
          if (Math.abs(gx - canvasW / 2) > 2) vTargets.push({ pos: gx });
        }
        for (let gy = 50; gy < canvasH; gy += 50) {
          if (Math.abs(gy - canvasH / 2) > 2) hTargets.push({ pos: gy });
        }
      }

      // Other visible elements on canvas
      const otherElements = activeScene.elements.filter(
        item => item.id !== selectedId && item.isVisible
      );

      otherElements.forEach(other => {
        vTargets.push(
          { pos: other.x },
          { pos: other.x + other.w / 2, label: 'Центр' },
          { pos: other.x + other.w }
        );
        hTargets.push(
          { pos: other.y },
          { pos: other.y + other.h / 2, label: 'Центр' },
          { pos: other.y + other.h }
        );
      });

      // Dragged element's points along X and Y
      const xPoints = [
        { val: clampedX, offset: 0 },
        { val: clampedX + elW / 2, offset: elW / 2 },
        { val: clampedX + elW, offset: elW }
      ];

      const yPoints = [
        { val: clampedY, offset: 0 },
        { val: clampedY + elH / 2, offset: elH / 2 },
        { val: clampedY + elH, offset: elH }
      ];

      let bestX = clampedX;
      let bestY = clampedY;
      const newLines: AlignmentLine[] = [];

      // Check V alignment
      let minVDiff = SNAP_THRESHOLD + 1;
      let snapVLine: AlignmentLine | null = null;
      let snapXVal: number | null = null;

      for (const xp of xPoints) {
        for (const vt of vTargets) {
          const diff = Math.abs(xp.val - vt.pos);
          if (diff < minVDiff) {
            minVDiff = diff;
            snapXVal = vt.pos - xp.offset;
            snapVLine = { type: 'v', pos: Math.round(vt.pos), label: vt.label };
          }
        }
      }

      if (snapXVal !== null && snapVLine) {
        bestX = snapXVal;
        newLines.push(snapVLine);
      }

      // Check H alignment
      let minHDiff = SNAP_THRESHOLD + 1;
      let snapHLine: AlignmentLine | null = null;
      let snapYVal: number | null = null;

      for (const yp of yPoints) {
        for (const ht of hTargets) {
          const diff = Math.abs(yp.val - ht.pos);
          if (diff < minHDiff) {
            minHDiff = diff;
            snapYVal = ht.pos - yp.offset;
            snapHLine = { type: 'h', pos: Math.round(ht.pos), label: ht.label };
          }
        }
      }

      if (snapYVal !== null && snapHLine) {
        bestY = snapYVal;
        newLines.push(snapHLine);
      }

      const finalX = Math.max(0, Math.min(canvasW - elW, Math.round(bestX)));
      const finalY = Math.max(0, Math.min(canvasH - elH, Math.round(bestY)));

      setAlignmentLines(newLines);

      setScenes(prev => prev.map(s => {
        if (s.id === activeScene.id) {
          return {
            ...s,
            elements: s.elements.map(el => {
              if (el.id === selectedId) {
                return {
                  ...el,
                  x: finalX,
                  y: finalY
                };
              }
              return el;
            })
          };
        }
        return s;
      }));
    } else if (activeAction === 'resize' && activeHandle) {
      const dx = (e.clientX - dragStartRef.current.x) / canvasScale;
      const dy = (e.clientY - dragStartRef.current.y) / canvasScale;
      
      const el = activeScene.elements.find(item => item.id === selectedId);
      if (!el) return;

      const rotationRad = (dragStartRef.current.rotation * Math.PI) / 180;
      
      // Calculate local mouse movement vector
      const localDx = dx * Math.cos(rotationRad) + dy * Math.sin(rotationRad);
      const localDy = -dx * Math.sin(rotationRad) + dy * Math.cos(rotationRad);

      let dw = 0;
      let dh = 0;
      let localShiftX = 0;
      let localShiftY = 0;

      const originalW = dragStartRef.current.elW;
      const originalH = dragStartRef.current.elH;
      const aspect = originalW / (originalH || 1);

      let finalW = originalW;
      let finalH = originalH;
      let actualLocalShiftX = 0;
      let actualLocalShiftY = 0;

      switch (activeHandle) {
        // Corner handles -> Proportional scaling
        case 'br': {
          const delta = (localDx + localDy * aspect) / 2;
          finalW = Math.max(20, originalW + delta);
          finalH = Math.max(20, finalW / aspect);
          break;
        }
        case 'tr': {
          const delta = (localDx - localDy * aspect) / 2;
          finalW = Math.max(20, originalW + delta);
          finalH = Math.max(20, finalW / aspect);
          actualLocalShiftY = -(finalH - originalH);
          break;
        }
        case 'bl': {
          const delta = (-localDx + localDy * aspect) / 2;
          finalW = Math.max(20, originalW + delta);
          finalH = Math.max(20, finalW / aspect);
          actualLocalShiftX = -(finalW - originalW);
          break;
        }
        case 'tl': {
          const delta = (-localDx - localDy * aspect) / 2;
          finalW = Math.max(20, originalW + delta);
          finalH = Math.max(20, finalW / aspect);
          actualLocalShiftX = -(finalW - originalW);
          actualLocalShiftY = -(finalH - originalH);
          break;
        }
        // Side handles -> Non-proportional directional stretching
        case 'r':
          finalW = Math.max(20, originalW + localDx);
          finalH = originalH;
          break;
        case 'b':
          finalW = originalW;
          finalH = Math.max(20, originalH + localDy);
          break;
        case 't':
          finalW = originalW;
          finalH = Math.max(20, originalH - localDy);
          actualLocalShiftY = -(finalH - originalH);
          break;
        case 'l':
          finalW = Math.max(20, originalW - localDx);
          finalH = originalH;
          actualLocalShiftX = -(finalW - originalW);
          break;
      }

      const globalShiftX = actualLocalShiftX * Math.cos(rotationRad) - actualLocalShiftY * Math.sin(rotationRad);
      const globalShiftY = actualLocalShiftX * Math.sin(rotationRad) + actualLocalShiftY * Math.cos(rotationRad);

      const nextX = Math.max(0, Math.min(canvasWidthMm / 10 - finalW, dragStartRef.current.elX + globalShiftX));
      const nextY = Math.max(0, Math.min(canvasHeightMm / 10 - finalH, dragStartRef.current.elY + globalShiftY));

      setScenes(prev => prev.map(s => {
        if (s.id === activeScene.id) {
          return {
            ...s,
            elements: s.elements.map(item => {
              if (item.id === selectedId) {
                const roundedW = Math.round(finalW);
                const roundedH = Math.round(finalH);
                let updatedMeasurementVal = item.measurementValue;
                let updatedCaption = item.caption;

                if (item.type === 'measurement') {
                  const valCm = roundedW;
                  const autoValStr = activeUnit === 'm' ? `${(valCm / 100).toFixed(1)} м` : `${valCm} см`;
                  updatedMeasurementVal = autoValStr;
                  updatedCaption = autoValStr;
                }

                return {
                  ...item,
                  w: roundedW,
                  h: roundedH,
                  x: Math.round(nextX),
                  y: Math.round(nextY),
                  measurementValue: updatedMeasurementVal,
                  caption: updatedCaption
                };
              }
              return item;
            })
          };
        }
        return s;
      }));
    } else if (activeAction === 'rotate') {
      const el = activeScene.elements.find(item => item.id === selectedId);
      if (!el) return;

      const dx = e.clientX - rotateStartRef.current.centerX;
      const dy = e.clientY - rotateStartRef.current.centerY;

      const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);
      const angleDiff = currentAngle - rotateStartRef.current.startAngle;
      let newRotation = Math.round(rotateStartRef.current.startRotation + angleDiff);

      if (e.shiftKey) {
        newRotation = Math.round(newRotation / 15) * 15;
      }

      if (newRotation > 180) newRotation -= 360;
      if (newRotation < -180) newRotation += 360;

      setScenes(prev => prev.map(s => {
        if (s.id === activeScene.id) {
          return {
            ...s,
            elements: s.elements.map(item => {
              if (item.id === selectedId) {
                return {
                  ...item,
                  rotation: newRotation
                };
              }
              return item;
            })
          };
        }
        return s;
      }));
    }
  };

  const handleCanvasMouseUp = () => {
    if (activeAction) {
      setActiveAction(null);
      setActiveHandle(null);
      setAlignmentLines([]);
      recordHistory(scenes);
    }
    setTimeout(() => {
      isInteractingWithElementRef.current = false;
    }, 150);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isInteractingWithElementRef.current) {
        setTimeout(() => {
          isInteractingWithElementRef.current = false;
        }, 150);
      }
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  useEffect(() => {
    if (!activeAction) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      handleCanvasMouseMove(e as unknown as React.MouseEvent);
    };

    const handleWindowMouseUp = () => {
      handleCanvasMouseUp();
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [activeAction, selectedId, scenes, activeScene]);

  // Zooming & Panning logic
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheelEvent = (e: WheelEvent) => {
      // Prevent browser zoom and page scroll
      e.preventDefault();
      const zoomIntensity = 0.08;
      const direction = e.deltaY < 0 ? 1 : -1;
      setZoomScale(prev => {
        const next = prev + direction * zoomIntensity;
        return Math.max(0.1, Math.min(6, next));
      });
    };

    viewport.addEventListener('wheel', handleWheelEvent, { passive: false });
    return () => {
      viewport.removeEventListener('wheel', handleWheelEvent);
    };
  }, []);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        const nextX = e.clientX - panStartRef.current.x;
        const nextY = e.clientY - panStartRef.current.y;
        setPanX(nextX);
        setPanY(nextY);
      }
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (e.button === 1) {
        setIsPanning(false);
      }
    };

    const handleAuxClick = (e: MouseEvent) => {
      if (e.button === 1) {
        e.preventDefault();
      }
    };

    if (isPanning) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }
    window.addEventListener('mousedown', handleAuxClick, { passive: false });

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mousedown', handleAuxClick);
    };
  }, [isPanning]);

  const handleViewportMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1) {
      // Middle click
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - panX, y: e.clientY - panY };
    }
  };

  useEffect(() => {
    if (setHeaderActions) {
      setHeaderActions(
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
          <button
            onClick={() => {
              deselectAllAndTools();
              setIsAiModalOpen(true);
            }}
            style={{ background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' }}
            className="flex items-center justify-center gap-1.5 px-3.5 h-9 rounded-full text-white text-xs font-semibold hover:opacity-90 transition-all shadow-xs cursor-pointer whitespace-nowrap shrink-0 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-white fill-white" />
            <span className="whitespace-nowrap">ИИ макет</span>
          </button>
          
          <button
            onClick={() => handleSaveProjectCollage(false)}
            disabled={isSaving}
            title="Автосохранение каждые 5 мин. Нажмите для ручного сохранения."
            className={`flex items-center justify-center gap-1.5 px-3.5 h-9 rounded-full text-xs font-semibold transition-all shadow-xs cursor-pointer whitespace-nowrap shrink-0 border ${
              isSaving
                ? 'bg-[var(--lavenderSoft)] border-[var(--lavenderAccent)]/40 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]'
                : 'bg-white dark:bg-zinc-900 hover:bg-zinc-50 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200'
            }`}
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] animate-spin shrink-0" />
            ) : (
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            )}
            <span className="whitespace-nowrap">
              {isSaving ? 'Сохранение...' : lastSavedTime ? `Сохранено ${lastSavedTime}` : 'Сохранено'}
            </span>
          </button>

          <button
            onClick={handleDownloadLayout}
            className="flex items-center justify-center gap-1.5 px-3.5 h-9 rounded-full bg-white dark:bg-zinc-900 hover:bg-zinc-50 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-semibold transition-all shadow-xs cursor-pointer whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="whitespace-nowrap">Скачать</span>
          </button>

          <button
            onClick={async () => {
              await handleSaveProjectCollage(true);
              if (onBackToProjectCard) {
                onBackToProjectCard(activeProjectId);
              } else if (window.history.length > 1) {
                window.history.back();
              } else {
                showToast('Проект', 'Возврат к карточке проекта', 'info');
              }
            }}
            className="flex items-center justify-center gap-1.5 px-3.5 h-9 rounded-full bg-white dark:bg-zinc-900 hover:bg-zinc-50 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-semibold transition-all shadow-xs cursor-pointer whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="whitespace-nowrap">в проект</span>
          </button>
        </div>
      );
    }
    return () => {
      if (setHeaderActions) {
        setHeaderActions(null);
      }
    };
  }, [setHeaderActions, isSaving, lastSavedTime, activeProjectId]);

  const selectedElem = activeScene.elements.find(el => el.id === selectedId);

  const renderSidebarTabContent = (targetTab: 'library' | 'layers') => {
    return (
      <>
        {/* TAB 1: LIBRARY CATALOG LISTING */}
        {targetTab === 'library' && (
          <div className="flex flex-col gap-3 flex-1 min-h-0 min-w-0 overflow-x-hidden">
            
            {/* Filter / Search Bar */}
            <div className="relative shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Найти элемент..."
                value={libSearch}
                onChange={(e) => setLibSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none shadow-xs"
              />
            </div>

            {/* Vertical Categories (Left) + Catalog Cards Grid (Right) */}
            <div className="flex gap-2.5 flex-1 min-h-0 items-start overflow-hidden min-w-0">
              
              {/* VERTICAL CATEGORY BAR */}
              <div className="flex flex-col gap-1 p-1.5 bg-zinc-100/90 dark:bg-zinc-900/80 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shrink-0 overflow-y-auto overflow-x-hidden max-h-full scrollbar-none shadow-2xs items-center w-[72px] sm:w-[76px]">
                {(activeWorkspaceTab === 'floorplan' ? SCHEMA_CATALOG_CATEGORIES : NEW_CATALOG_CATEGORIES).map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <React.Fragment key={cat.id}>
                      <button
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setLibSearch('');
                        }}
                        className={`w-full py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer border group ${
                          isSelected
                            ? 'bg-[var(--lavenderSoft)] text-[var(--lavDeep)] border-[var(--lavenderAccent)]/40 dark:text-[var(--lavenderAccent)] shadow-xs'
                            : 'bg-transparent hover:bg-white/70 dark:hover:bg-zinc-800/70 border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                        }`}
                        title={cat.title}
                      >
                        <div className="flex items-center justify-center mb-1 transition-transform group-hover:scale-110">
                          <CategoryIcon cat={cat} isSelected={isSelected} />
                        </div>
                        <span className={`text-[10px] leading-tight text-center truncate max-w-full px-0.5 tracking-tight ${
                          isSelected ? 'font-bold text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]' : 'font-medium text-zinc-600 dark:text-zinc-400'
                        }`}>
                          {cat.title}
                        </span>
                      </button>
                      {cat.id === 'warehouse' && activeWorkspaceTab !== 'floorplan' && (
                        <div className="w-10 my-1 border-b border-zinc-300/80 dark:border-zinc-700/80 shrink-0" />
                      )}
                    </React.Fragment>
                  );
                })}

                {/* Button to manage category icons */}
                <div className="pt-1 border-t border-zinc-200/60 dark:border-zinc-800 mt-0.5 w-full flex justify-center">
                  <button
                    onClick={() => setShowCategoryIconManager(true)}
                    className="w-full py-1.5 px-0.5 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer bg-white/60 dark:bg-zinc-800/60 text-zinc-400 hover:text-[var(--lavDeep)] dark:hover:text-[var(--lavenderAccent)] hover:bg-white dark:hover:bg-zinc-800 border border-transparent hover:border-[var(--lavenderAccent)]/30"
                    title="Управление иконками категорий (папка /public/category-icons/)"
                  >
                    <Sliders className="w-4 h-4 mb-0.5" />
                    <span className="text-[9px] font-medium text-center text-zinc-400">Иконки</span>
                  </button>
                </div>
              </div>

              {/* CARDS GRID AREA */}
              <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden max-h-full scrollbar-none pr-1">
                <div className="grid grid-cols-2 md:portrait:grid-cols-2 md:landscape:grid-cols-3 lg:grid-cols-4 lg:landscape:grid-cols-4 xl:grid-cols-4 gap-1.5 sm:gap-2">
                  {getCategoryItems().map((item) => {
                    const isFav = favoritesList.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('application/json', JSON.stringify(item));
                          e.dataTransfer.effectAllowed = 'copy';
                        }}
                        onClick={() => setItemToPreview(item)}
                        className="group relative aspect-square w-full rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[var(--lavenderAccent)] hover:shadow-md cursor-grab active:cursor-grabbing transition-all p-1.5 flex items-center justify-center overflow-hidden"
                        title={`${item.name} (нажмите для просмотра или перетащите на холст)`}
                      >
                        {/* Overlay Header Mini Actions */}
                        <div className="absolute top-1.5 left-1.5 right-1.5 flex justify-between items-center z-10 pointer-events-none">
                          <button
                            onClick={(e) => toggleFavorite(item.id, e)}
                            className="p-1 rounded-full bg-white/85 dark:bg-zinc-800/85 text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer pointer-events-auto shadow-2xs"
                            title="В избранное"
                          >
                            <Heart className={`w-3 h-3 ${isFav ? 'text-rose-500 fill-rose-500' : ''}`} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setItemToPreview(item);
                            }}
                            className="p-1 rounded-full bg-[var(--lavenderSoft)] text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] hover:scale-110 transition-transform cursor-pointer pointer-events-auto shadow-2xs"
                            title="Открыть просмотр и добавить"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Element Vector preview */}
                        <div className="w-full h-full p-2.5 flex items-center justify-center group-hover:scale-105 transition-transform pointer-events-none">
                          <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: item.svgMarkup }} />
                        </div>

                        {/* Title Caption overlay on hover */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/80 to-transparent p-1.5 pt-4 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <span className="text-[9px] font-bold text-white truncate block">
                            {item.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: SCENE ELEMENTS / LAYERS LIST */}
        {targetTab === 'layers' && (() => {
          // Filter out measurements — measurements are auxiliary tools and shouldn't appear in elements list or price
          const decorElements = activeScene.elements.filter(el => el.type !== 'measurement');
          const totalDecorPrice = decorElements.reduce((sum, item) => sum + (item.price || 0), 0);

          return (
          <div className="flex flex-col gap-2 flex-1 min-h-0 min-w-0 overflow-x-hidden">
            <div className="flex items-center justify-between px-1 shrink-0">
              <span className="text-xs font-bold text-zinc-500">Слои декора ({decorElements.length})</span>
              <span className="text-[10px] text-zinc-400">Перетащите для порядка</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-0">
              {decorElements.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-400 space-y-2">
                  <Box className="w-6 h-6 mx-auto text-zinc-300 dark:text-zinc-700" />
                  <p>На сцене пока нет декораций.</p>
                  <p className="text-[10px] text-zinc-400">Выберите элемент из Библиотеки слева для размещения.</p>
                </div>
              ) : (
                [...decorElements].reverse().map((el, revIdx) => {
                  const actualIdx = activeScene.elements.findIndex(item => item.id === el.id);
                  const isExpanded = expandedElementId === el.id;
                  const isDraggingThis = draggedLayerIdx === actualIdx;
                  const isDragOverThis = dragOverLayerIdx === actualIdx;

                  return (
                    <div
                      key={el.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', String(actualIdx));
                        e.dataTransfer.effectAllowed = 'move';
                        setDraggedLayerIdx(actualIdx);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        if (dragOverLayerIdx !== actualIdx) {
                          setDragOverLayerIdx(actualIdx);
                        }
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        if (dragOverLayerIdx === actualIdx) {
                          setDragOverLayerIdx(null);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const fromIdxStr = e.dataTransfer.getData('text/plain');
                        const fromIdx = parseInt(fromIdxStr, 10);
                        if (!isNaN(fromIdx) && fromIdx !== actualIdx) {
                          handleReorderLayer(fromIdx, actualIdx);
                        }
                        setDragOverLayerIdx(null);
                        setDraggedLayerIdx(null);
                      }}
                      className={`rounded-2xl border transition-all overflow-hidden ${
                        isDragOverThis
                          ? 'border-[var(--lavDeep)] dark:border-[var(--lavenderAccent)] border-2 bg-[var(--lavenderSoft)] scale-[1.01]'
                          : isDraggingThis
                          ? 'opacity-40 border-dashed border-zinc-400'
                          : el.id === selectedId
                          ? 'border-[var(--lavDeep)] dark:border-[var(--lavenderAccent)] bg-white dark:bg-zinc-900 shadow-xs'
                          : 'border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60'
                      }`}
                    >
                      {/* Main Layer Header Strip */}
                      <div
                        onClick={() => {
                          setSelectedId(el.id);
                          if (isExpanded) {
                            setExpandedElementId(null);
                          } else {
                            setExpandedElementId(el.id);
                            setDraftPrice(el.price.toString());
                            setDraftNote(el.comment || '');
                          }
                        }}
                        className={`flex items-center justify-between p-2.5 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-colors ${
                          el.id === selectedId ? 'bg-[var(--lavenderSoft)] dark:bg-[var(--lavDeep)]/20' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {/* Grip Handle */}
                          <GripVertical className="w-4 h-4 text-zinc-400 shrink-0 cursor-grab active:cursor-grabbing hover:text-zinc-600 dark:hover:text-zinc-200" />

                          {/* Thumbnail preview */}
                          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden border border-zinc-200/50 p-0.5 relative">
                            <div
                              className="w-full h-full flex items-center justify-center"
                              style={{
                                filter: el.tintColor ? `url(#element-tint-${el.id})` : undefined
                              }}
                            >
                              {el.customImage ? (
                                <img src={el.customImage} className="w-full h-full object-contain pointer-events-none" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center pointer-events-none" dangerouslySetInnerHTML={{ __html: el.svgMarkup }} />
                              )}
                            </div>
                          </div>

                          {/* Title */}
                          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 truncate flex-1">
                            {el.name}
                          </span>

                          {/* Chevron Arrow */}
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          )}
                        </div>

                        {/* Price badge, Lock toggle, and Visibility */}
                        <div className="flex items-center gap-1.5 shrink-0 pl-2">
                          {activeWorkspaceTab !== 'floorplan' && (
                            <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 mr-0.5">
                              {el.price > 0 ? `${el.price.toLocaleString('ru')} ₽` : '0 ₽'}
                            </span>
                          )}

                          {/* Lock / Unlock Toggle Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateActiveSceneElements(prev => prev.map(item => item.id === el.id ? { ...item, isLocked: !item.isLocked } : item));
                              showToast('Блокировка', el.isLocked ? `Элемент "${el.name}" разблокирован` : `Элемент "${el.name}" заблокирован`, 'info');
                            }}
                            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer rounded-md hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
                            title={el.isLocked ? "Заблокировано (кликните для разблокировки)" : "Заблокировать элемент"}
                          >
                            {el.isLocked ? (
                              <Lock className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                            ) : (
                              <Unlock className="w-3.5 h-3.5 text-zinc-400 hover:text-emerald-500" />
                            )}
                          </button>

                          {/* Visibility Toggle Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateActiveSceneElements(prev => prev.map(item => item.id === el.id ? { ...item, isVisible: !item.isVisible } : item));
                            }}
                            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer rounded-md hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
                            title="Показать / скрыть"
                          >
                            {el.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-rose-500" />}
                          </button>
                        </div>
                      </div>

                      {/* EXPANDED DETAIL CARD */}
                      {isExpanded && (
                        <div className="p-3.5 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-black/20 space-y-3">
                          <div className="flex gap-3">
                            {/* Left Large Preview */}
                            <div className="w-16 h-16 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center p-1 shrink-0">
                              {el.customImage ? (
                                <img src={el.customImage} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: el.svgMarkup }} />
                              )}
                            </div>

                            {/* Right Meta information */}
                            <div className="flex-1 min-w-0 space-y-1">
                              <h4 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">{el.name}</h4>
                              <p className="text-[10px] text-zinc-500 leading-tight">
                                ID детали: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{el.code || 'ЦК0155'}</span>. Готовые сцены.
                              </p>
                              <p className="text-[10px] text-zinc-500 leading-tight">
                                Тип источника: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{el.sourceType || 'аренда'}</span>.
                              </p>
                            </div>
                          </div>

                          {/* Price input field */}
                          {activeWorkspaceTab !== 'floorplan' && (
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-zinc-500">Сумма (₽)</label>
                              <input
                                type="number"
                                value={draftPrice}
                                onChange={(e) => setDraftPrice(e.target.value)}
                                placeholder="Введите стоимость..."
                                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-[var(--lavDeep)]"
                              />
                            </div>
                          )}

                          {/* Note comment field */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500">Заметка</label>
                            <input
                              type="text"
                              value={draftNote}
                              onChange={(e) => setDraftNote(e.target.value)}
                              placeholder="Заметка к элементу..."
                              className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-[var(--lavDeep)]"
                            />
                          </div>

                          {/* Actions bar: Save price/note & Layer move controls */}
                          <div className="flex items-center justify-between pt-1 border-t border-zinc-200/50 dark:border-zinc-800">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleMoveLayer(actualIdx, 'up')}
                                disabled={actualIdx === activeScene.elements.length - 1}
                                className="p-1 rounded bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 disabled:opacity-30 cursor-pointer"
                                title="Переместить выше"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleMoveLayer(actualIdx, 'down')}
                                disabled={actualIdx === 0}
                                className="p-1 rounded bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 disabled:opacity-30 cursor-pointer"
                                title="Переместить ниже"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  updateActiveSceneElements(prev => prev.filter(item => item.id !== el.id));
                                  setSelectedId(null);
                                  showToast('Удалено', 'Элемент удален со сцены', 'info');
                                }}
                                className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                                title="Удалить"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  const priceNum = parseFloat(draftPrice) || 0;
                                  updateActiveSceneElements(prev => prev.map(item => item.id === el.id ? { ...item, price: priceNum, comment: draftNote } : item));
                                  setExpandedElementId(null);
                                  showToast('Сохранено', 'Параметры элемента обновлены', 'success');
                                }}
                                className="px-3 py-1 rounded-xl bg-[var(--lavDeep)] text-white text-xs font-bold hover:bg-[var(--lavenderAccent)] transition-colors cursor-pointer"
                              >
                                Сохранить
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Total Cost Summary Card in bottom of Layers tab */}
            {activeWorkspaceTab !== 'floorplan' && (
              <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800 shrink-0 mt-auto">
                <div className="p-3 rounded-2xl bg-[var(--lavenderSoft)] border border-[var(--lavenderAccent)]/30 flex items-center justify-between shadow-2xs">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Итого элементов ({decorElements.length})
                    </span>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      Общая стоимость
                    </span>
                  </div>
                  <span className="text-sm font-black text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] font-mono">
                    {totalDecorPrice.toLocaleString('ru')} ₽
                  </span>
                </div>
              </div>
            )}
          </div>
          );
        })()}
      </>
    );
  };

  return (
    <div className="flex-1 min-h-0 min-w-0 h-full pb-0.5 print:pb-0 grid grid-cols-1 landscape:md:grid-cols-12 xl:grid-cols-12 gap-1.5 sm:gap-3 print:hidden" onMouseMove={handleCanvasMouseMove} onMouseUp={handleCanvasMouseUp}>
      {/* Hidden File Input for Backdrop Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUploadCanvasBackdrop}
        className="hidden"
        accept="image/*"
      />
      
      {/* LEFT COLUMN: ACTIVE WORKSPACE & HEADER */}
      <div className={`flex flex-col gap-1 sm:gap-2.5 h-full min-h-0 min-w-0 transition-all duration-300 ${
        isRightToolbarCollapsed
          ? 'col-span-1 landscape:md:col-span-12 xl:col-span-12'
          : 'col-span-1 landscape:md:col-span-7 xl:col-span-8'
      }`}>

        {/* TOP EDITOR HEADER BAR - WITH ELEGANT PADDING */}
        <div className="flex flex-col gap-1 pt-1.5 pb-1 px-1 sm:px-2 shrink-0 print:hidden">
          {/* Top Row: Back button & Title on Left, Action Buttons on Right */}
          <div className="flex items-center justify-between gap-2 w-full">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={async () => {
                  await handleSaveProjectCollage(true);
                  if (onBackToProjectCard) {
                    onBackToProjectCard(activeProjectId);
                  } else if (window.history.length > 1) {
                    window.history.back();
                  } else {
                    showToast('Проект', 'Возврат к карточке проекта', 'info');
                  }
                }}
                title="Назад в карточку проекта"
                aria-label="Назад в карточку проекта"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md hover:bg-white dark:hover:bg-zinc-700 border border-white/80 dark:border-zinc-700/80 text-[var(--ink)] flex items-center justify-center transition-all shadow-md cursor-pointer shrink-0 hover:scale-105 active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 text-[var(--ink)]" />
              </button>

              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-[var(--ink)] truncate">
                {currentProject?.name || 'Проект 1'}
              </h1>
            </div>

            {/* Right Action Buttons on the same top line */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
              <button
                onClick={() => handleSaveProjectCollage(false)}
                disabled={isSaving}
                title="Автосохранение каждые 5 мин. Нажмите для ручного сохранения."
                aria-label="Сохранить проект"
                className={`h-9 sm:h-10 px-3 sm:px-3.5 rounded-full flex items-center gap-2 shadow-xs shrink-0 cursor-pointer transition-all border font-semibold text-xs active:scale-95 ${
                  isSaving
                    ? 'bg-[var(--lavenderSoft)] border-[var(--lavenderAccent)]/40 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border-emerald-200/80 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300'
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] animate-spin shrink-0" />
                    <span className="hidden sm:inline">Сохранение...</span>
                    <span className="sm:hidden text-[11px]">Сохранение</span>
                  </>
                ) : (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.9)] shrink-0 animate-pulse" />
                    <span className="hidden sm:inline">
                      {lastSavedTime ? `Сохранено ${lastSavedTime}` : 'Сохранено'}
                    </span>
                    <span className="sm:hidden text-[11px]">
                      {lastSavedTime ? lastSavedTime : 'Сохранено'}
                    </span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  deselectAllAndTools();
                  setIsAiModalOpen(true);
                }}
                title="ИИ Генератор макета"
                aria-label="ИИ макет"
                style={{ background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' }}
                className="h-9 sm:h-10 px-3.5 sm:px-4 rounded-full text-white flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0 hover:opacity-90 active:scale-95 transition-all font-semibold text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-white fill-white shrink-0" />
                <span className="hidden sm:inline">ИИ макет</span>
                <span className="sm:hidden text-[11px]">ИИ</span>
              </button>

              {mobileNavButton && (
                <div className="landscape:md:hidden xl:hidden shrink-0">
                  {mobileNavButton}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row: Client info (Hidden per user request) */}
          {/* <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-[var(--soft)] font-medium"> ... </div> */}
        </div>

          {/* MAIN CANVAS AREA / SEATING ARRANGEMENT VIEW */}
          <div className="flex-1 min-h-0 min-w-0 relative h-full flex flex-col">
            {/* COLLAGE CONSTRUCTOR STAGE WITH AUTO-SCALING VIEWPORT */}
            <div
              ref={viewportRef}
              onMouseDown={handleViewportMouseDown}
              onClick={handleDeselectIfEmptySpace}
              className={`relative bg-zinc-950/60 dark:bg-black/40 rounded-3xl overflow-hidden flex items-center justify-center flex-1 h-[380px] sm:h-full min-h-[380px] sm:min-h-0 min-w-0 w-full border border-zinc-200/20 dark:border-zinc-800/20 select-none ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
            >
              {/* Floating Top-Left Scene Tabs Overlay (Matches Reference Screenshot 2 - Touch Friendly) */}
              <div className="absolute top-1.5 left-1.5 z-20 flex items-center gap-1 bg-white/80 dark:bg-black/50 backdrop-blur-md p-1 rounded-full border border-white/90 dark:border-zinc-800 shadow-md" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={handleAddNewScene}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-zinc-800 hover:bg-zinc-100 flex items-center justify-center text-zinc-700 dark:text-zinc-200 transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Добавить визуализацию"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setIsVisualizationsDropdownOpen(!isVisualizationsDropdownOpen)}
                    className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeWorkspaceTab !== 'floorplan'
                        ? 'bg-[var(--lavenderSoft)] text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] border border-[var(--lavenderAccent)]/40 shadow-xs'
                        : 'bg-white/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-700'
                    }`}
                  >
                    <span>
                      {activeWorkspaceTab === 'floorplan'
                        ? 'Визуализации'
                        : (activeScene?.name.startsWith('Визуализация')
                            ? activeScene.name.replace('Визуализация', 'Виз.')
                            : (activeScene?.name || 'Виз. 1'))}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isVisualizationsDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isVisualizationsDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-[80]" onClick={() => setIsVisualizationsDropdownOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 4, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 top-full mt-1.5 w-52 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-zinc-200/80 dark:border-zinc-700/80 rounded-2xl shadow-xl p-1.5 z-[90] overflow-hidden"
                        >
                          <div className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 px-2.5 py-1">
                            Созданные визуализации
                          </div>
                          {scenes.filter(s => s.id !== 'floorplan').map((scene) => {
                            const isSelected = activeWorkspaceTab === scene.id;
                            const displayName = scene.name.startsWith('Визуализация') ? scene.name.replace('Визуализация', 'Виз.') : scene.name;
                            return (
                              <div
                                key={scene.id}
                                onClick={() => {
                                  setActiveWorkspaceTab(scene.id);
                                  setIsVisualizationsDropdownOpen(false);
                                }}
                                className={`w-full group px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                                  isSelected
                                    ? 'bg-[var(--lavenderSoft)] text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] shadow-xs border border-[var(--lavenderAccent)]/30'
                                    : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <Layout className="w-3.5 h-3.5 opacity-70 shrink-0" />
                                  <span className="truncate">{displayName}</span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                                  <button
                                    onClick={(e) => handleDeleteScene(scene.id, e)}
                                    className={`p-1 rounded-lg transition-colors cursor-pointer ${
                                      isSelected
                                        ? 'text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] hover:bg-white/40'
                                        : 'text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40'
                                    }`}
                                    title="Удалить визуализацию"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}

                          <div className="h-px bg-zinc-200/80 dark:bg-zinc-800 my-1" />

                          <button
                            onClick={handleAddNewScene}
                            className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] hover:bg-[var(--lavenderSoft)] transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Новая визуализация</span>
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={() => {
                    setActiveWorkspaceTab('floorplan');
                    setSelectedId(null);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeWorkspaceTab === 'floorplan'
                      ? 'bg-[var(--lavenderSoft)] text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] border border-[var(--lavenderAccent)]/40 shadow-xs'
                      : 'bg-white/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-700 shadow-xs'
                  }`}
                >
                  <span>Схема</span>
                </button>
              </div>

                {/* FLOATING TOP UNDO/REDO PILL & RIGHT SIDEBAR TOGGLE */}
                <div className="absolute top-1.5 right-1.5 sm:right-2 z-30 pointer-events-auto flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  {/* Expand Right Sidebar button when collapsed */}
                  {isRightToolbarCollapsed && (
                    <button
                      onClick={() => setIsRightToolbarCollapsed(false)}
                      style={{ background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' }}
                      className="hidden landscape:md:flex xl:flex px-3.5 py-1.5 sm:py-2 rounded-full text-white shadow-xs hover:opacity-90 items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer active:scale-95 animate-fadeIn"
                      title="Развернуть боковую панель (Библиотека и элементы)"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-white shrink-0" />
                      <span className="hidden sm:inline">Библиотека</span>
                      <ChevronLeft className="w-3.5 h-3.5 text-white shrink-0" />
                    </button>
                  )}

                  <div className="p-0.5 sm:p-1 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-md border border-white/80 dark:border-zinc-700/60 flex items-center gap-1">
                    <button
                      onClick={handleUndo}
                      disabled={historyIndex <= 0}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 dark:bg-zinc-800/90 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] hover:bg-white hover:shadow-md flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:hover:shadow-none active:scale-95"
                      title="Отменить действие (Undo)"
                    >
                      <RotateCcw className="w-3.5 h-3.5 stroke-[2.2]" />
                    </button>

                    <button
                      onClick={handleRedo}
                      disabled={historyIndex >= history.length - 1}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 dark:bg-zinc-800/90 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] hover:bg-white hover:shadow-md flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:hover:shadow-none active:scale-95"
                      title="Повторить действие (Redo)"
                    >
                      <RotateCw className="w-3.5 h-3.5 stroke-[2.2]" />
                    </button>
                  </div>
                </div>

                {/* FLOATING ACTION TOOLBAR (LEFT POSITION BELOW TOP SCENE TABS) */}
                <div className="absolute top-13 sm:top-14 left-1.5 z-30 flex flex-col items-start pointer-events-none" onClick={(e) => e.stopPropagation()}>
                  
                  {isLeftToolbarCollapsed ? (
                    /* COLLAPSED SINGLE BUTTON */
                    <div className="p-1 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-lg border border-white/80 dark:border-zinc-700/60 flex flex-col items-center pointer-events-auto animate-fadeIn">
                      <button
                        onClick={() => setIsLeftToolbarCollapsed(false)}
                        style={{ background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' }}
                        className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full text-white hover:opacity-90 flex items-center justify-center shadow-xs cursor-pointer transition-all active:scale-95"
                        title="Развернуть инструменты редактирования"
                      >
                        <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                      </button>
                    </div>
                  ) : (
                    /* EXPANDED FULL TOOLBAR */
                    <div className="p-1 rounded-full bg-white/80 dark:bg-zinc-900/80 shadow-lg border border-white/80 dark:border-zinc-700/60 flex flex-col items-center gap-1 pointer-events-auto animate-fadeIn">
                      
                      {/* 0. Свернуть панель */}
                      <button
                        onClick={() => {
                          setIsLeftToolbarCollapsed(true);
                          setActiveToolPopover(null);
                        }}
                        className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 border-b border-zinc-200/60 dark:border-zinc-700/60 pb-0.5"
                        title="Свернуть панель инструментов"
                      >
                        <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                      </button>

                      {/* 1. Выбрать все на холсте */}
                      <button
                        onClick={() => {
                          const selectable = activeScene.elements.filter(el => el.isVisible && !el.isLocked);
                          if (selectable.length > 0) {
                            const allIds = selectable.map(el => el.id);
                            setSelectedIds(allIds);
                            showToast('Выделено всё', `Все элементы (${allIds.length} шт.) помещены в общую рамку`, 'success');
                          } else if (activeScene.elements.length > 0) {
                            const allIds = activeScene.elements.filter(el => el.isVisible).map(el => el.id);
                            setSelectedIds(allIds);
                            showToast('Выделено всё', `Выделены элементы холста (${allIds.length} шт.)`, 'info');
                          } else {
                            showToast('Холст пуст', 'Нет элементов для выбора', 'info');
                          }
                        }}
                        className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                          selectedIds.length > 1
                            ? 'bg-[var(--lavDeep)] text-white shadow-md'
                            : 'bg-white/90 dark:bg-zinc-800/90 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] hover:bg-white hover:shadow-md'
                        }`}
                        title="Выбрать все на холсте (общая рамка)"
                      >
                        <BoxSelect className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                      </button>

                    {/* 2. Сгруппировать */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          setActiveToolPopover(prev => prev === 'group' ? null : 'group');
                          setActiveFilterTool(null);
                          setIsDrawingMeasurement(false);
                          setRotationInputId(null);
                        }}
                        className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                          activeToolPopover === 'group'
                            ? 'bg-[var(--lavDeep)] text-white shadow-md'
                            : 'bg-white/90 dark:bg-zinc-800/90 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] hover:bg-white hover:shadow-md'
                        }`}
                        title="Группировка элементов"
                      >
                        <Group className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                      </button>

                      {/* Popover Group / Ungroup */}
                      {activeToolPopover === 'group' && (
                        <div
                          data-tool-popover="true"
                          className="absolute left-10 sm:left-11 top-0 z-50 bg-white/60 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 border border-white/80 dark:border-zinc-700/80 p-2 rounded-2xl shadow-xl shadow-purple-950/10 flex flex-col gap-1 min-w-[175px] animate-fadeIn select-none backdrop-blur-md"
                        >
                          <div className="flex items-center justify-between px-1 pb-1 border-b border-[var(--lavenderAccent)]/30 dark:border-zinc-800 text-[11px] font-bold text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]">
                            <span>Группировка</span>
                          </div>
                          <button
                            onClick={() => {
                              handleGroupSelectedElements();
                              setActiveToolPopover(null);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-[var(--lavenderSoft)] hover:text-[var(--lavDeep)] dark:hover:text-[var(--lavenderAccent)] flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Group className="w-4 h-4 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]" />
                            <span>Сгруппировать</span>
                          </button>
                          <button
                            onClick={() => {
                              handleUngroupSelectedElements();
                              setActiveToolPopover(null);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-[var(--lavenderSoft)] hover:text-[var(--lavDeep)] dark:hover:text-[var(--lavenderAccent)] flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Ungroup className="w-4 h-4 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]" />
                            <span>Разгруппировать</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 3. Копировать */}
                    <button
                      onClick={handleCopySelected}
                      className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full bg-white/90 dark:bg-zinc-800/90 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] hover:bg-white hover:shadow-md flex items-center justify-center transition-all cursor-pointer active:scale-95"
                      title="Копировать (Ctrl+C)"
                    >
                      <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                    </button>

                    {/* 4. Слои */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          setActiveToolPopover(prev => prev === 'layers' ? null : 'layers');
                          setActiveFilterTool(null);
                          setIsDrawingMeasurement(false);
                          setRotationInputId(null);
                        }}
                        className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                          activeToolPopover === 'layers'
                            ? 'bg-[var(--lavDeep)] text-white shadow-md'
                            : 'bg-white/90 dark:bg-zinc-800/90 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] hover:bg-white hover:shadow-md'
                        }`}
                        title="Слои элементов"
                      >
                        <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                      </button>

                      {/* Popover Layers */}
                      {activeToolPopover === 'layers' && (
                        <div
                          data-tool-popover="true"
                          className="absolute left-10 sm:left-11 top-0 z-50 bg-white/60 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 border border-white/80 dark:border-zinc-700/80 p-2 rounded-2xl shadow-xl shadow-purple-950/10 flex flex-col gap-1 min-w-[175px] animate-fadeIn select-none backdrop-blur-md"
                        >
                          <div className="flex items-center justify-between px-1 pb-1 border-b border-[var(--lavenderAccent)]/30 dark:border-zinc-800 text-[11px] font-bold text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]">
                            <span>Порядок слоев</span>
                          </div>
                          <button
                            onClick={() => {
                              if (selectedId) {
                                updateActiveSceneElements(els => {
                                  const idx = els.findIndex(el => el.id === selectedId);
                                  if (idx !== -1 && idx < els.length - 1) {
                                    const newEls = [...els];
                                    const [moved] = newEls.splice(idx, 1);
                                    newEls.push(moved);
                                    return newEls;
                                  }
                                  return els;
                                });
                                showToast('Слои', 'Перемещено на самый верх', 'success');
                              } else showToast('Выберите элемент', 'Кликните на элемент', 'info');
                              setActiveToolPopover(null);
                            }}
                            className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-[var(--lavenderSoft)] hover:text-[var(--lavDeep)] dark:hover:text-[var(--lavenderAccent)] flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <ArrowUpToLine className="w-4 h-4 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]" />
                            <span>На самый верх</span>
                          </button>

                          <button
                            onClick={() => {
                              if (selectedId) {
                                updateActiveSceneElements(els => {
                                  const idx = els.findIndex(el => el.id === selectedId);
                                  if (idx !== -1 && idx < els.length - 1) {
                                    const newEls = [...els];
                                    const [moved] = newEls.splice(idx, 1);
                                    newEls.splice(idx + 1, 0, moved);
                                    return newEls;
                                  }
                                  return els;
                                });
                                showToast('Слои', 'Перемещено выше', 'info');
                              } else showToast('Выберите элемент', 'Кликните на элемент', 'info');
                              setActiveToolPopover(null);
                            }}
                            className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-[var(--lavenderSoft)] hover:text-[var(--lavDeep)] dark:hover:text-[var(--lavenderAccent)] flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <ArrowUp className="w-4 h-4 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]" />
                            <span>Поднять выше</span>
                          </button>

                          <button
                            onClick={() => {
                              if (selectedId) {
                                updateActiveSceneElements(els => {
                                  const idx = els.findIndex(el => el.id === selectedId);
                                  if (idx > 0) {
                                    const newEls = [...els];
                                    const [moved] = newEls.splice(idx, 1);
                                    newEls.splice(idx - 1, 0, moved);
                                    return newEls;
                                  }
                                  return els;
                                });
                                showToast('Слои', 'Перемещено ниже', 'info');
                              } else showToast('Выберите элемент', 'Кликните на элемент', 'info');
                              setActiveToolPopover(null);
                            }}
                            className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-[var(--lavenderSoft)] hover:text-[var(--lavDeep)] dark:hover:text-[var(--lavenderAccent)] flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <ArrowDown className="w-4 h-4 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]" />
                            <span>Опустить ниже</span>
                          </button>

                          <button
                            onClick={() => {
                              if (selectedId) {
                                updateActiveSceneElements(els => {
                                  const idx = els.findIndex(el => el.id === selectedId);
                                  if (idx > 0) {
                                    const newEls = [...els];
                                    const [moved] = newEls.splice(idx, 1);
                                    newEls.unshift(moved);
                                    return newEls;
                                  }
                                  return els;
                                });
                                showToast('Слои', 'Перемещено на самый низ', 'info');
                              } else showToast('Выберите элемент', 'Кликните на элемент', 'info');
                              setActiveToolPopover(null);
                            }}
                            className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-[var(--lavenderSoft)] hover:text-[var(--lavDeep)] dark:hover:text-[var(--lavenderAccent)] flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <ArrowDownToLine className="w-4 h-4 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]" />
                            <span>На самый низ</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 5. Отзеркалить */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          setActiveToolPopover(prev => prev === 'flip' ? null : 'flip');
                          setActiveFilterTool(null);
                          setIsDrawingMeasurement(false);
                          setRotationInputId(null);
                        }}
                        className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                          activeToolPopover === 'flip'
                            ? 'bg-[var(--lavDeep)] text-white shadow-md'
                            : 'bg-white/90 dark:bg-zinc-800/90 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] hover:bg-white hover:shadow-md'
                        }`}
                        title="Отразить элемент"
                      >
                        <FlipHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                      </button>

                      {/* Popover Flip */}
                      {activeToolPopover === 'flip' && (
                        <div
                          data-tool-popover="true"
                          className="absolute left-10 sm:left-11 top-0 z-50 bg-white/60 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 border border-white/80 dark:border-zinc-700/80 p-2 rounded-2xl shadow-xl shadow-purple-950/10 flex flex-col gap-1 min-w-[175px] animate-fadeIn select-none backdrop-blur-md"
                        >
                          <div className="flex items-center justify-between px-1 pb-1 border-b border-[var(--lavenderAccent)]/30 dark:border-zinc-800 text-[11px] font-bold text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]">
                            <span>Отражение</span>
                          </div>
                          <button
                            onClick={() => {
                              if (selectedId) {
                                updateActiveSceneElements(els => els.map(el => el.id === selectedId ? { ...el, isFlippedH: !el.isFlippedH } : el));
                                showToast('Отражение', 'Отражено по горизонтали', 'info');
                              } else showToast('Выберите элемент', 'Кликните на элемент', 'info');
                              setActiveToolPopover(null);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-[var(--lavenderSoft)] hover:text-[var(--lavDeep)] dark:hover:text-[var(--lavenderAccent)] flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <FlipHorizontal className="w-4 h-4 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]" />
                            <span>По горизонтали</span>
                          </button>

                          <button
                            onClick={() => {
                              if (selectedId) {
                                updateActiveSceneElements(els => els.map(el => el.id === selectedId ? { ...el, isFlippedV: !el.isFlippedV } : el));
                                showToast('Отражение', 'Отражено по вертикали', 'info');
                              } else showToast('Выберите элемент', 'Кликните на элемент', 'info');
                              setActiveToolPopover(null);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-[var(--lavenderSoft)] hover:text-[var(--lavDeep)] dark:hover:text-[var(--lavenderAccent)] flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <FlipVertical className="w-4 h-4 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]" />
                            <span>По вертикали</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 6. Замеры (Измерительные стрелки) */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          setIsDrawingMeasurement(prev => !prev);
                          setActiveToolPopover(null);
                          setActiveFilterTool(null);
                          setRotationInputId(null);
                        }}
                        className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full transition-all cursor-pointer flex items-center justify-center active:scale-95 relative ${
                          isDrawingMeasurement
                            ? 'bg-[var(--lavDeep)] text-white shadow-md ring-2 ring-[var(--lavenderAccent)]/60'
                            : !areMeasurementsVisible
                            ? 'bg-zinc-200/80 dark:bg-zinc-800/80 text-zinc-400 dark:text-zinc-500 hover:bg-white hover:shadow-md'
                            : 'bg-white/90 dark:bg-zinc-800/90 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] hover:bg-white hover:shadow-md'
                        }`}
                        title={areMeasurementsVisible ? "Замеры (Автоматический и Ручной режимы)" : "Замеры на холсте выключены (Нажмите для включения)"}
                      >
                        <Ruler className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                        {!areMeasurementsVisible && (
                          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 border border-white dark:border-zinc-900" title="Замеры скрыты" />
                        )}
                      </button>

                      {/* Popover options for Measurement (Auto & Manual) */}
                      {isDrawingMeasurement && (
                        <div
                          className="absolute left-10 sm:left-11 top-0 z-50 bg-white/95 dark:bg-zinc-900/95 text-zinc-900 dark:text-zinc-100 border border-white/80 dark:border-zinc-700/80 p-2.5 rounded-2xl shadow-xl shadow-purple-950/10 flex flex-col gap-2 min-w-[220px] max-w-[250px] animate-fadeIn select-none backdrop-blur-md"
                        >
                          <div className="flex items-center justify-between px-1 pb-1 border-b border-[var(--lavenderAccent)]/30 dark:border-zinc-800 text-[11px] font-bold text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]">
                            <span className="flex items-center gap-1">
                              <Ruler className="w-3.5 h-3.5" />
                              Замеры
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setAreMeasurementsVisible(prev => !prev)}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                                  areMeasurementsVisible
                                    ? 'bg-emerald-500 text-white shadow-2xs'
                                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                                }`}
                                title={areMeasurementsVisible ? 'Скрыть замеры на холсте' : 'Показать замеры на холсте'}
                              >
                                {areMeasurementsVisible ? 'Включены' : 'Выкл'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsDrawingMeasurement(false)}
                                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs cursor-pointer font-normal p-0.5"
                                title="Закрыть"
                              >
                                ✕
                              </button>
                            </div>
                          </div>

                          {/* Mode Tabs */}
                          <div className="grid grid-cols-2 gap-1 p-0.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl text-[10px] font-semibold">
                            <button
                              type="button"
                              onClick={() => setMeasureSubMode('auto')}
                              className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                measureSubMode === 'auto'
                                  ? 'bg-[var(--lavDeep)] text-white shadow-xs'
                                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                              }`}
                            >
                              <Zap className="w-3 h-3" />
                              <span>Авто</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setMeasureSubMode('manual')}
                              className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                measureSubMode === 'manual'
                                  ? 'bg-[var(--lavDeep)] text-white shadow-xs'
                                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                              }`}
                            >
                              <Ruler className="w-3 h-3" />
                              <span>Ручной</span>
                            </button>
                          </div>

                          {/* Auto Mode Content */}
                          {measureSubMode === 'auto' && (
                            <div className="flex flex-col gap-1.5 pt-0.5">
                              <p className="text-[10px] text-zinc-600 dark:text-zinc-300 px-0.5 leading-snug">
                                Кликните по любому объекту на холсте для автозамера его ширины и высоты.
                              </p>

                              {(selectedId || selectedIds.length > 0) && (
                                <button
                                  type="button"
                                  onClick={applyAutoMeasurementsForSelection}
                                  style={{ background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' }}
                                  className="w-full px-2 py-1.5 rounded-xl text-xs font-semibold text-white hover:opacity-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                                >
                                  <Zap className="w-3.5 h-3.5" />
                                  <span>Замерить выделенное</span>
                                </button>
                              )}
                            </div>
                          )}

                          {/* Manual Mode Content */}
                          {measureSubMode === 'manual' && (
                            <div className="flex flex-col gap-1.5 pt-0.5">
                              <p className="text-[10px] text-zinc-600 dark:text-zinc-300 px-0.5 leading-snug">
                                Зажмите мышь на холсте и потяните от точки к точке.
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  const newElem: CanvasElement = {
                                    id: `measurement-${Date.now()}`,
                                    name: `Замер (250 см)`,
                                    type: 'measurement',
                                    x: Math.round(canvasWidthMm / 20 - 100),
                                    y: Math.round(canvasHeightMm / 20 - 15),
                                    w: 200,
                                    h: 30,
                                    rotation: 0,
                                    exposure: 0, hue: 0, temp: 0, saturate: 100, opacity: 100, price: 0, comment: '', code: 'MEAS-01',
                                    caption: '250 см',
                                    measurementValue: '250 см',
                                    isLocked: false, isVisible: true, isFlippedH: false, isFlippedV: false, svgMarkup: ''
                                  };
                                  updateActiveSceneElements(prev => [...prev, newElem]);
                                  setSelectedId(newElem.id);
                                  setAreMeasurementsVisible(true);
                                  showToast('Замер создан', 'Кликните в центр замера для изменения значения', 'success');
                                }}
                                className="w-full px-2 py-1.5 rounded-xl text-xs font-semibold bg-[var(--lavenderSoft)] text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5 shrink-0" />
                                <span>Быстрый замер (250 см)</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 7. Корзина (Удалить) */}
                    <button
                      onClick={handleDeleteSelected}
                      className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full bg-rose-500 text-white hover:bg-rose-600 flex items-center justify-center shadow-md cursor-pointer transition-all active:scale-95"
                      title="Удалить выбранный элемент (Delete / Backspace)"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                    </button>
                  </div>
                  )}
                </div>

                {/* BOTTOM RIGHT GROUP: Color Correction Tools & Zoom Button */}
                <div className="absolute bottom-1.5 right-1.5 z-[60] flex flex-col items-end pointer-events-none pr-0.5 pb-0.5" onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-col items-center gap-1.5 pointer-events-auto">
                    {isColorZoomToolbarCollapsed ? (
                      /* COLLAPSED SINGLE BUTTON */
                      <div className="p-1 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-lg border border-white/80 dark:border-zinc-700/60 flex flex-col items-center pointer-events-auto animate-fadeIn">
                        <button
                          onClick={() => setIsColorZoomToolbarCollapsed(false)}
                          style={{ background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' }}
                          className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full text-white hover:opacity-90 flex items-center justify-center shadow-xs cursor-pointer transition-all active:scale-95"
                          title="Развернуть настройки цвета и масштаба"
                        >
                          <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                        </button>
                      </div>
                    ) : (
                      /* Color Correction & Zoom Pill Block */
                      <div className="p-1 rounded-full bg-white/80 dark:bg-zinc-900/80 shadow-lg border border-white/80 dark:border-zinc-700/60 flex flex-col items-center gap-1 relative animate-fadeIn">
                        
                        {/* 0. Свернуть панель */}
                        <button
                          onClick={() => {
                            setIsColorZoomToolbarCollapsed(true);
                            setActiveFilterTool(null);
                          }}
                          className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 border-b border-zinc-200/60 dark:border-zinc-700/60 pb-0.5"
                          title="Свернуть панель цвета и масштаба"
                        >
                          <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                        </button>
                        
                        {/* POPUP ADJUSTMENT TOOL SLIDER OR ZOOM (Positioned to the left of bottom-right toolbar, semi-transparent & compact) */}
                      {activeFilterTool && (activeFilterTool === 'zoom' || selectedElem) && (
                        <div
                          data-tool-popover="true"
                          className={`absolute ${
                            activeFilterTool === 'recolor' || activeFilterTool === 'shadow'
                              ? 'right-full mr-2 bottom-0 w-56 sm:w-60 max-w-[calc(100vw-60px)] p-2.5 sm:p-3 bg-white/95 dark:bg-zinc-900/95'
                              : 'bottom-full mb-2 right-0 w-12 sm:w-14 p-2 bg-white/60 dark:bg-zinc-900/60'
                          } z-50 text-zinc-900 dark:text-zinc-100 border border-white/80 dark:border-zinc-700/80 rounded-2xl shadow-xl shadow-purple-950/10 flex flex-col items-center gap-1.5 animate-fadeIn pointer-events-auto transition-all select-none backdrop-blur-md`}
                        >
                          
                          {/* Shadow Tool Panel */}
                          {activeFilterTool === 'shadow' && selectedElem && (
                            <div className="flex flex-col gap-2 w-full text-xs">
                              {/* Header & Toggle */}
                              <div className="flex items-center justify-between pb-1 border-b border-zinc-200/60 dark:border-zinc-800/60">
                                <div className="flex items-center gap-1 font-bold text-zinc-800 dark:text-zinc-100 text-[11px]">
                                  <ShadowToolIcon className="w-3.5 h-3.5 text-[var(--lavDeep)] dark:text-purple-400" />
                                  <span>Тень</span>
                                </div>
                                <button
                                  onClick={() => {
                                    const currentEnabled = !!selectedElem.shadowEnabled;
                                    updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? {
                                      ...item,
                                      shadowEnabled: !currentEnabled,
                                      shadowBlur: item.shadowBlur ?? 12,
                                      shadowOpacity: item.shadowOpacity ?? 50,
                                      shadowX: item.shadowX ?? 0,
                                      shadowY: item.shadowY ?? 8,
                                      shadowColor: item.shadowColor ?? '#000000'
                                    } : item));
                                  }}
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                                    selectedElem.shadowEnabled
                                      ? 'bg-emerald-500 text-white shadow-2xs'
                                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                                  }`}
                                >
                                  {selectedElem.shadowEnabled ? 'Включена' : 'Выкл'}
                                </button>
                              </div>

                              {selectedElem.shadowEnabled ? (
                                <>
                                  {/* Blur / Размытие */}
                                  <div className="space-y-0.5">
                                    <div className="flex justify-between text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
                                      <span>Размытие</span>
                                      <span className="font-mono text-[var(--lavDeep)] dark:text-purple-300">{selectedElem.shadowBlur ?? 12}px</span>
                                    </div>
                                    <input
                                      type="range"
                                      min="0"
                                      max="60"
                                      value={selectedElem.shadowBlur ?? 12}
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, shadowBlur: val } : item));
                                      }}
                                      className="w-full accent-[var(--lavDeep)] dark:accent-purple-400 h-1 rounded-lg bg-zinc-200 dark:bg-zinc-700 cursor-pointer"
                                    />
                                  </div>

                                  {/* Opacity / Прозрачность */}
                                  <div className="space-y-0.5">
                                    <div className="flex justify-between text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
                                      <span>Прозрачность</span>
                                      <span className="font-mono text-[var(--lavDeep)] dark:text-purple-300">{selectedElem.shadowOpacity ?? 50}%</span>
                                    </div>
                                    <input
                                      type="range"
                                      min="0"
                                      max="100"
                                      value={selectedElem.shadowOpacity ?? 50}
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, shadowOpacity: val } : item));
                                      }}
                                      className="w-full accent-[var(--lavDeep)] dark:accent-purple-400 h-1 rounded-lg bg-zinc-200 dark:bg-zinc-700 cursor-pointer"
                                    />
                                  </div>

                                  {/* Side-by-side Offset X & Y */}
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-0.5">
                                      <div className="flex justify-between text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
                                        <span>Смещение X</span>
                                        <span className="font-mono text-[var(--lavDeep)] dark:text-purple-300">
                                          {(selectedElem.shadowX ?? 0) > 0 ? `+${selectedElem.shadowX}` : (selectedElem.shadowX ?? 0)}
                                        </span>
                                      </div>
                                      <input
                                        type="range"
                                        min="-40"
                                        max="40"
                                        value={selectedElem.shadowX ?? 0}
                                        onChange={(e) => {
                                          const val = parseInt(e.target.value);
                                          updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, shadowX: val } : item));
                                        }}
                                        className="w-full accent-[var(--lavDeep)] dark:accent-purple-400 h-1 rounded-lg bg-zinc-200 dark:bg-zinc-700 cursor-pointer"
                                      />
                                    </div>

                                    <div className="space-y-0.5">
                                      <div className="flex justify-between text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
                                        <span>Смещение Y</span>
                                        <span className="font-mono text-[var(--lavDeep)] dark:text-purple-300">
                                          {(selectedElem.shadowY ?? 8) > 0 ? `+${selectedElem.shadowY}` : (selectedElem.shadowY ?? 8)}
                                        </span>
                                      </div>
                                      <input
                                        type="range"
                                        min="-40"
                                        max="40"
                                        value={selectedElem.shadowY ?? 8}
                                        onChange={(e) => {
                                          const val = parseInt(e.target.value);
                                          updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, shadowY: val } : item));
                                        }}
                                        className="w-full accent-[var(--lavDeep)] dark:accent-purple-400 h-1 rounded-lg bg-zinc-200 dark:bg-zinc-700 cursor-pointer"
                                      />
                                    </div>
                                  </div>

                                  {/* Color & Presets combined row */}
                                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                                    <div className="flex items-center gap-1">
                                      {['#000000', '#27272a', '#3f2e21'].map(preset => (
                                        <button
                                          key={preset}
                                          onClick={() => updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, shadowColor: preset } : item))}
                                          className={`w-3.5 h-3.5 rounded-full border cursor-pointer transition-transform ${
                                            (selectedElem.shadowColor || '#000000') === preset ? 'ring-2 ring-[var(--lavDeep)] scale-110' : 'border-zinc-300'
                                          }`}
                                          style={{ backgroundColor: preset }}
                                          title={`Цвет: ${preset}`}
                                        />
                                      ))}
                                      <input
                                        type="color"
                                        value={selectedElem.shadowColor || '#000000'}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, shadowColor: val } : item));
                                        }}
                                        className="w-4 h-4 rounded cursor-pointer overflow-hidden p-0 border border-zinc-300 bg-transparent"
                                        title="Выбрать цвет тени"
                                      />
                                    </div>

                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? {
                                          ...item,
                                          shadowEnabled: true,
                                          shadowX: 0,
                                          shadowY: 8,
                                          shadowBlur: 14,
                                          shadowOpacity: 40,
                                          shadowColor: '#000000'
                                        } : item))}
                                        className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-[9px] font-bold cursor-pointer transition-colors"
                                      >
                                        Мягкий пол
                                      </button>
                                      <button
                                        onClick={() => updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? {
                                          ...item,
                                          shadowEnabled: true,
                                          shadowX: 12,
                                          shadowY: 10,
                                          shadowBlur: 10,
                                          shadowOpacity: 50,
                                          shadowColor: '#000000'
                                        } : item))}
                                        className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-[9px] font-bold cursor-pointer transition-colors"
                                      >
                                        Свет
                                      </button>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 text-center py-1">
                                  Нажмите «Включить» для добавления тени.
                                </p>
                              )}
                            </div>
                          )}
                          
                          {/* Recolor Tool Panel */}
                          {activeFilterTool === 'recolor' && selectedElem && (
                            <div className="flex flex-col gap-2 w-full text-xs">
                              <div className="flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-100 pb-1 border-b border-zinc-200/60 dark:border-zinc-800/60 text-[11px]">
                                <Pipette className="w-3.5 h-3.5 text-[var(--lavDeep)] dark:text-purple-400" />
                                <span>Замена цвета</span>
                              </div>

                              {/* Custom HEX / Color Picker */}
                              <div className="flex items-center justify-between gap-1.5 pt-0.5">
                                <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">Цвет (HEX):</span>
                                <div className="flex items-center gap-1">
                                  <input
                                    type="color"
                                    value={selectedElem.tintColor || '#5B3E88'}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? {
                                        ...item,
                                        tintColor: val,
                                        tintAmount: item.tintAmount || 75,
                                        tintMode: item.tintMode || 'color'
                                      } : item));
                                    }}
                                    className="w-6 h-6 rounded-md border border-zinc-200 dark:border-zinc-700 cursor-pointer overflow-hidden p-0 bg-transparent"
                                  />
                                  <input
                                    type="text"
                                    value={selectedElem.tintColor || ''}
                                    placeholder="#HEX..."
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, tintColor: val } : item));
                                    }}
                                    className="w-16 px-1.5 py-0.5 rounded-md bg-zinc-100/80 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-[10px] font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase focus:outline-none focus:border-[var(--lavDeep)]"
                                  />
                                </div>
                              </div>

                              {/* Options when color is chosen */}
                              {selectedElem.tintColor && (
                                <>
                                  {/* Intensity Slider */}
                                  <div className="space-y-1 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                                    <div className="flex items-center justify-between text-[11px] font-bold text-zinc-600 dark:text-zinc-300">
                                      <span>Интенсивность</span>
                                      <span className="text-[var(--lavDeep)] dark:text-purple-300 font-mono">
                                        {selectedElem.tintAmount ?? 75}%
                                      </span>
                                    </div>
                                    <input
                                      type="range"
                                      min="10"
                                      max="100"
                                      value={selectedElem.tintAmount ?? 75}
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, tintAmount: val } : item));
                                      }}
                                      className="w-full accent-[var(--lavDeep)] dark:accent-purple-400 h-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-700 cursor-pointer"
                                    />
                                  </div>

                                  {/* Blend Mode Selector */}
                                  <div className="grid grid-cols-4 gap-1 text-[10px] font-bold">
                                    <button
                                      onClick={() => updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, tintMode: 'color' } : item))}
                                      className={`py-1 rounded-lg border text-center transition-colors cursor-pointer ${
                                        (selectedElem.tintMode || 'color') === 'color'
                                          ? 'bg-[var(--lavDeep)] text-white border-[var(--lavDeep)]'
                                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                                      }`}
                                      title="Тон с сохранением светотени"
                                    >
                                      Тон
                                    </button>
                                    <button
                                      onClick={() => updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, tintMode: 'normal' } : item))}
                                      className={`py-1 rounded-lg border text-center transition-colors cursor-pointer ${
                                        selectedElem.tintMode === 'normal'
                                          ? 'bg-[var(--lavDeep)] text-white border-[var(--lavDeep)]'
                                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                                      }`}
                                      title="Плотная цветная заливка"
                                    >
                                      Заливка
                                    </button>
                                    <button
                                      onClick={() => updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, tintMode: 'multiply' } : item))}
                                      className={`py-1 rounded-lg border text-center transition-colors cursor-pointer ${
                                        selectedElem.tintMode === 'multiply'
                                          ? 'bg-[var(--lavDeep)] text-white border-[var(--lavDeep)]'
                                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                                      }`}
                                      title="Затемнение (глубокий цвет)"
                                    >
                                      Тень
                                    </button>
                                    <button
                                      onClick={() => updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, tintMode: 'overlay' } : item))}
                                      className={`py-1 rounded-lg border text-center transition-colors cursor-pointer ${
                                        selectedElem.tintMode === 'overlay'
                                          ? 'bg-[var(--lavDeep)] text-white border-[var(--lavDeep)]'
                                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                                      }`}
                                      title="Контрастное перекрытие"
                                    >
                                      Блик
                                    </button>
                                  </div>

                                  {/* Reset Tint Button */}
                                  <button
                                    onClick={() => {
                                      updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, tintColor: undefined } : item));
                                    }}
                                    className="w-full py-1 text-center text-[11px] font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer mt-0.5"
                                  >
                                    Сбросить цвет
                                  </button>
                                </>
                              )}
                            </div>
                          )}

                          {/* Vertical Slider & Controls for Canvas Zoom */}
                          {activeFilterTool === 'zoom' && (
                            <div className="flex flex-col items-center gap-1 p-0.5 w-full">
                              <button
                                onClick={() => setZoomScale(prev => Math.min(4.0, Number((prev + 0.15).toFixed(2))))}
                                className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-zinc-700 dark:text-zinc-200 flex items-center justify-center font-bold text-xs cursor-pointer transition-colors shadow-2xs shrink-0"
                                title="Увеличить масштаб холста"
                              >
                                +
                              </button>
                              <input
                                type="range"
                                orient="vertical"
                                min="20"
                                max="300"
                                step="5"
                                value={Math.round(zoomScale * 100)}
                                onChange={(e) => {
                                  setZoomScale(parseFloat(e.target.value) / 100);
                                }}
                                className="h-20 w-1.5 accent-[var(--lavDeep)] dark:accent-purple-400 cursor-pointer rounded-lg appearance-none bg-zinc-200 dark:bg-zinc-700 [writing-mode:vertical-lr] [direction:rtl]"
                              />
                              <button
                                onClick={() => setZoomScale(prev => Math.max(0.2, Number((prev - 0.15).toFixed(2))))}
                                className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-zinc-700 dark:text-zinc-200 flex items-center justify-center font-bold text-xs cursor-pointer transition-colors shadow-2xs shrink-0"
                                title="Уменьшить масштаб холста"
                              >
                                -
                              </button>
                              <span className="text-[10px] font-bold font-mono text-[var(--lavDeep)] dark:text-purple-300">
                                {Math.round(zoomScale * 100)}%
                              </span>
                              {zoomScale !== 1 && (
                                <button
                                  onClick={() => { setZoomScale(1); setPanX(0); setPanY(0); }}
                                  className="text-[9px] font-bold text-zinc-400 hover:text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] dark:hover:text-purple-300 underline cursor-pointer"
                                  title="Сбросить масштаб (100%)"
                                >
                                  Сброс
                                </button>
                              )}
                            </div>
                          )}

                          {/* Vertical Slider for Brightness */}
                          {activeFilterTool === 'brightness' && selectedElem && (
                            <div className="flex flex-col items-center gap-1.5 py-1">
                              <input
                                type="range"
                                orient="vertical"
                                min="-50"
                                max="50"
                                value={selectedElem.exposure}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, exposure: val } : item));
                                }}
                                className="h-24 w-1.5 accent-[var(--lavDeep)] dark:accent-purple-400 cursor-pointer rounded-lg appearance-none [writing-mode:vertical-lr] [direction:rtl]"
                                style={{ background: 'linear-gradient(to top, #27272a, #a1a1aa, #ffffff)' }}
                              />
                              <span className="text-[10px] font-bold font-mono text-[var(--lavDeep)] dark:text-purple-300">
                                {selectedElem.exposure > 0 ? `+${selectedElem.exposure}` : selectedElem.exposure}
                              </span>
                            </div>
                          )}

                          {/* Vertical Slider for Hue */}
                          {activeFilterTool === 'hue' && selectedElem && (
                            <div className="flex flex-col items-center gap-1.5 py-1">
                              <input
                                type="range"
                                orient="vertical"
                                min="-180"
                                max="180"
                                value={selectedElem.hue}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, hue: val } : item));
                                }}
                                className="h-24 w-1.5 accent-[var(--lavDeep)] dark:accent-purple-400 cursor-pointer rounded-lg appearance-none [writing-mode:vertical-lr] [direction:rtl]"
                                style={{ background: 'linear-gradient(to top, red, yellow, green, cyan, blue, magenta, red)' }}
                              />
                              <span className="text-[10px] font-bold font-mono text-[var(--lavDeep)] dark:text-purple-300">
                                {selectedElem.hue > 0 ? `+${selectedElem.hue}°` : `${selectedElem.hue}°`}
                              </span>
                            </div>
                          )}

                          {/* Vertical Slider for Temp */}
                          {activeFilterTool === 'temp' && selectedElem && (
                            <div className="flex flex-col items-center gap-1.5 py-1">
                              <input
                                type="range"
                                orient="vertical"
                                min="-50"
                                max="50"
                                value={selectedElem.temp || 0}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, temp: val } : item));
                                }}
                                className="h-24 w-1.5 accent-[var(--lavDeep)] dark:accent-purple-400 cursor-pointer rounded-lg appearance-none [writing-mode:vertical-lr] [direction:rtl]"
                                style={{ background: 'linear-gradient(to top, #3b82f6, #eff6ff, #f59e0b)' }}
                              />
                              <span className="text-[10px] font-bold font-mono text-[var(--lavDeep)] dark:text-purple-300">
                                {(selectedElem.temp || 0) > 0 ? `+${selectedElem.temp}` : (selectedElem.temp || 0)}
                              </span>
                            </div>
                          )}

                          {/* Vertical Slider for Saturate */}
                          {activeFilterTool === 'saturate' && selectedElem && (
                            <div className="flex flex-col items-center gap-1.5 py-1">
                              <input
                                type="range"
                                orient="vertical"
                                min="0"
                                max="200"
                                value={selectedElem.saturate}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, saturate: val } : item));
                                }}
                                className="h-24 w-1.5 accent-[var(--lavDeep)] dark:accent-purple-400 cursor-pointer rounded-lg appearance-none [writing-mode:vertical-lr] [direction:rtl]"
                                style={{ background: 'linear-gradient(to top, #a1a1aa, #c084fc, #8b5cf6)' }}
                              />
                              <span className="text-[10px] font-bold font-mono text-[var(--lavDeep)] dark:text-purple-300">
                                {selectedElem.saturate}%
                              </span>
                            </div>
                          )}

                          {/* Vertical Slider for Opacity */}
                          {activeFilterTool === 'opacity' && selectedElem && (
                            <div className="flex flex-col items-center gap-1.5 py-1">
                              <input
                                type="range"
                                orient="vertical"
                                min="10"
                                max="100"
                                value={selectedElem.opacity}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, opacity: val } : item));
                                }}
                                className="h-24 w-1.5 accent-[var(--lavDeep)] dark:accent-purple-400 cursor-pointer rounded-lg appearance-none [writing-mode:vertical-lr] [direction:rtl]"
                                style={{ background: 'linear-gradient(to top, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 1))' }}
                              />
                              <span className="text-[10px] font-bold font-mono text-[var(--lavDeep)] dark:text-purple-300">
                                {selectedElem.opacity}%
                              </span>
                            </div>
                          )}

                        </div>
                      )}

                      {/* 1. Замена цвета (Пипетка / Окрашивание) */}
                      <button
                        onClick={() => {
                          setActiveToolPopover(null);
                          setIsDrawingMeasurement(false);
                          setRotationInputId(null);
                          if (!selectedId && activeFilterTool !== 'recolor') {
                            showToast('Выберите элемент', 'Кликните на элемент для окрашивания в нужный цвет', 'info');
                          }
                          setActiveFilterTool(prev => prev === 'recolor' ? null : 'recolor');
                        }}
                        className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                          activeFilterTool === 'recolor'
                            ? 'bg-[var(--lavDeep)] text-white shadow-md'
                            : 'bg-white/90 dark:bg-zinc-800/90 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] dark:text-purple-300 hover:bg-white hover:shadow-md'
                        }`}
                        title="Замена цвета (Выбор точного тона HEX или палитры)"
                      >
                        <Pipette className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                      </button>

                      {/* 2. Яркость (Экспозиция) */}
                      <button
                        onClick={() => {
                          setActiveToolPopover(null);
                          setIsDrawingMeasurement(false);
                          setRotationInputId(null);
                          if (!selectedId && activeFilterTool !== 'brightness') {
                            showToast('Выберите элемент', 'Кликните на элемент для настройки яркости', 'info');
                          }
                          setActiveFilterTool(prev => prev === 'brightness' ? null : 'brightness');
                        }}
                        className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                          activeFilterTool === 'brightness'
                            ? 'bg-[var(--lavDeep)] text-white shadow-md'
                            : 'bg-white/90 dark:bg-zinc-800/90 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] dark:text-purple-300 hover:bg-white hover:shadow-md'
                        }`}
                        title="Яркость (Экспозиция)"
                      >
                        <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                      </button>

                      {/* 2. Оттенок (Тон) */}
                      <button
                        onClick={() => {
                          setActiveToolPopover(null);
                          setIsDrawingMeasurement(false);
                          setRotationInputId(null);
                          if (!selectedId && activeFilterTool !== 'hue') {
                            showToast('Выберите элемент', 'Кликните на элемент для настройки тона', 'info');
                          }
                          setActiveFilterTool(prev => prev === 'hue' ? null : 'hue');
                        }}
                        className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                          activeFilterTool === 'hue'
                            ? 'bg-[var(--lavDeep)] text-white shadow-md'
                            : 'bg-white/90 dark:bg-zinc-800/90 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] dark:text-purple-300 hover:bg-white hover:shadow-md'
                        }`}
                        title="Оттенок (Тон)"
                      >
                        <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                      </button>

                      {/* 3. Теплота (Температура) */}
                      <button
                        onClick={() => {
                          setActiveToolPopover(null);
                          setIsDrawingMeasurement(false);
                          setRotationInputId(null);
                          if (!selectedId && activeFilterTool !== 'temp') {
                            showToast('Выберите элемент', 'Кликните на элемент для настройки температуры', 'info');
                          }
                          setActiveFilterTool(prev => prev === 'temp' ? null : 'temp');
                        }}
                        className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                          activeFilterTool === 'temp'
                            ? 'bg-[var(--lavDeep)] text-white shadow-md'
                            : 'bg-white/90 dark:bg-zinc-800/90 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] dark:text-purple-300 hover:bg-white hover:shadow-md'
                        }`}
                        title="Теплота (Температура)"
                      >
                        <Thermometer className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                      </button>

                      {/* 4. Насыщенность */}
                      <button
                        onClick={() => {
                          setActiveToolPopover(null);
                          setIsDrawingMeasurement(false);
                          setRotationInputId(null);
                          if (!selectedId && activeFilterTool !== 'saturate') {
                            showToast('Выберите элемент', 'Кликните на элемент для настройки насыщенности', 'info');
                          }
                          setActiveFilterTool(prev => prev === 'saturate' ? null : 'saturate');
                        }}
                        className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                          activeFilterTool === 'saturate'
                            ? 'bg-[var(--lavDeep)] text-white shadow-md'
                            : 'bg-white/90 dark:bg-zinc-800/90 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] dark:text-purple-300 hover:bg-white hover:shadow-md'
                        }`}
                        title="Насыщенность"
                      >
                        <Contrast className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                      </button>

                      {/* 5. Прозрачность */}
                      <button
                        onClick={() => {
                          setActiveToolPopover(null);
                          setIsDrawingMeasurement(false);
                          setRotationInputId(null);
                          if (!selectedId && activeFilterTool !== 'opacity') {
                            showToast('Выберите элемент', 'Кликните на элемент для настройки прозрачности', 'info');
                          }
                          setActiveFilterTool(prev => prev === 'opacity' ? null : 'opacity');
                        }}
                        className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                          activeFilterTool === 'opacity'
                            ? 'bg-[var(--lavDeep)] text-white shadow-md'
                            : 'bg-white/90 dark:bg-zinc-800/90 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] dark:text-purple-300 hover:bg-white hover:shadow-md'
                        }`}
                        title="Прозрачность"
                      >
                        <OpacityToolIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>

                      {/* 6. Тень (Photoshop-стиль: размытие, прозрачность, смещение) */}
                      <button
                        onClick={() => {
                          setActiveToolPopover(null);
                          setIsDrawingMeasurement(false);
                          setRotationInputId(null);
                          if (!selectedId && activeFilterTool !== 'shadow') {
                            showToast('Выберите элемент', 'Кликните на элемент для настройки тени', 'info');
                          }
                          setActiveFilterTool(prev => prev === 'shadow' ? null : 'shadow');
                        }}
                        className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                          activeFilterTool === 'shadow'
                            ? 'bg-[var(--lavDeep)] text-white shadow-md'
                            : 'bg-white/90 dark:bg-zinc-800/90 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] dark:text-purple-300 hover:bg-white hover:shadow-md'
                        }`}
                        title="Тень (Размытие, прозрачность, смещение X/Y)"
                      >
                        <ShadowToolIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>

                      {/* 6. Лупа (Масштаб / Приближение с ползунком) */}
                      <button
                        onClick={() => {
                          setActiveToolPopover(null);
                          setIsDrawingMeasurement(false);
                          setRotationInputId(null);
                          setActiveFilterTool(prev => prev === 'zoom' ? null : 'zoom');
                        }}
                        className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full transition-all cursor-pointer flex items-center justify-center active:scale-95 border-t border-zinc-200/60 dark:border-zinc-700/60 pt-0.5 mt-0.5 ${
                          activeFilterTool === 'zoom'
                            ? 'bg-[var(--lavDeep)] text-white shadow-md'
                            : 'bg-white/90 dark:bg-zinc-800/90 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] dark:text-purple-300 hover:bg-white hover:shadow-md'
                        }`}
                        title="Масштаб холста (Приближение/Отдаление)"
                      >
                        <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                      </button>
                    </div>
                    )}
                  </div>
                </div>

                {/* Absolute centering wrapper so canvas element unscaled width/height never expands grid/flex layout */}
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none p-4">
                  <div
                    ref={canvasContainerRef}
                    className={`relative bg-white shadow-2xl rounded-2xl overflow-hidden shrink-0 select-none pointer-events-auto ${
                      isDrawingMeasurement ? 'cursor-crosshair' : ''
                    } ${isPanning ? '' : 'transition-transform duration-200'}`}
                    style={{
                      width: `${canvasWidthMm / 10}px`,
                      height: `${canvasHeightMm / 10}px`,
                      transform: `translate(${panX}px, ${panY}px) scale(${canvasScale * zoomScale})`,
                    }}
                    onMouseDown={(e) => {
                      if (isDrawingMeasurement && measureSubMode === 'manual') {
                        e.stopPropagation();
                        e.preventDefault();
                        if (canvasContainerRef.current) {
                          const rect = canvasContainerRef.current.getBoundingClientRect();
                          const currentScale = canvasScale * zoomScale;
                          const startX = (e.clientX - rect.left) / currentScale;
                          const startY = (e.clientY - rect.top) / currentScale;
                          setMeasureStartPos({ x: startX, y: startY });
                          setMeasureCurrentPos({ x: startX, y: startY });
                          setIsMeasuring(true);
                        }
                      }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'copy';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      try {
                        const rawData = e.dataTransfer.getData('application/json');
                        if (rawData) {
                          const item: LibraryItem = JSON.parse(rawData);
                          if (canvasContainerRef.current) {
                            const rect = canvasContainerRef.current.getBoundingClientRect();
                            const dropX = (e.clientX - rect.left) / (canvasScale * zoomScale);
                            const dropY = (e.clientY - rect.top) / (canvasScale * zoomScale);
                            handleAddElementAtPosition(
                              item,
                              Math.max(10, Math.round(dropX - item.width / 2)),
                              Math.max(10, Math.round(dropY - item.height / 2))
                            );
                          } else {
                            handleAddElementToScene(item);
                          }
                        }
                      } catch (err) {
                        console.error('Failed to parse dropped element JSON', err);
                      }
                    }}
                    onClick={handleDeselectIfEmptySpace}
                  >
                {/* Backdrop & Grid Clip Layer */}
                <div
                  className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-auto z-0"
                  onClick={handleDeselectIfEmptySpace}
                >
                  {activeScene.backdropType === 'image' && activeScene.backdropImage ? (
                    <img
                      src={activeScene.backdropImage}
                      alt="Backdrop"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-75 origin-center"
                      style={{
                        opacity: 0.82,
                        transform: `scale(${activeScene.backdropScale || 1}) translate(${activeScene.backdropX || 0}px, ${activeScene.backdropY || 0}px)`
                      }}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 transition-colors duration-500"
                      style={{ backgroundColor: activeScene.backdropColor }}
                    />
                  )}

                  {gridVisible && (
                    <div
                      className="absolute inset-0 z-10"
                      style={{
                        backgroundImage: `
                          linear-gradient(to right, rgba(107, 114, 128, 0.45) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(107, 114, 128, 0.45) 1px, transparent 1px),
                          linear-gradient(to right, rgba(156, 163, 175, 0.22) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(156, 163, 175, 0.22) 1px, transparent 1px)
                        `,
                        backgroundSize: `100px 100px, 100px 100px, 10px 10px, 10px 10px`
                      }}
                    />
                  )}
                </div>

                {/* Live Drawing Measurement Overlay */}
                {isMeasuring && measureStartPos && measureCurrentPos && (() => {
                  const dx = measureCurrentPos.x - measureStartPos.x;
                  const dy = measureCurrentPos.y - measureStartPos.y;
                  const dist = Math.round(Math.hypot(dx, dy));
                  const distStr = activeUnit === 'm' ? `${(dist / 100).toFixed(1)} м` : `${dist} см`;
                  const midX = (measureStartPos.x + measureCurrentPos.x) / 2;
                  const midY = (measureStartPos.y + measureCurrentPos.y) / 2;
                  const currentScale = canvasScale * zoomScale;
                  const scaleInv = 1 / (currentScale || 1);

                  return (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-40 overflow-visible">
                      <line
                        x1={measureStartPos.x}
                        y1={measureStartPos.y}
                        x2={measureCurrentPos.x}
                        y2={measureCurrentPos.y}
                        stroke="#4B5563"
                        strokeWidth={1.2 * scaleInv}
                        strokeDasharray={`${4 * scaleInv} ${2 * scaleInv}`}
                      />
                      <circle cx={measureStartPos.x} cy={measureStartPos.y} r={2.5 * scaleInv} fill="#4B5563" />
                      <circle cx={measureCurrentPos.x} cy={measureCurrentPos.y} r={2.5 * scaleInv} fill="#4B5563" />
                      
                      <foreignObject
                        x={midX - 50}
                        y={midY - 15}
                        width="100"
                        height="30"
                        className="overflow-visible"
                      >
                        <div className="flex items-center justify-center w-full h-full" style={{ transform: `scale(${scaleInv})`, transformOrigin: 'center center' }}>
                          <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-white text-xs font-bold shadow-md whitespace-nowrap animate-pulse">
                            {distStr}
                          </span>
                        </div>
                      </foreignObject>
                    </svg>
                  );
                })()}

                {/* Dynamic Smart Alignment Guides Overlay */}
                {alignmentLines.length > 0 && (() => {
                  const currentScale = canvasScale * zoomScale;
                  const scaleInv = 1 / (currentScale || 1);
                  const strokeW = 0.85 * scaleInv;
                  const dashStr = `${3 * scaleInv} ${3 * scaleInv}`;
                  const dotR = 2 * scaleInv;

                  return (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-35 overflow-visible">
                      {alignmentLines.map((line, i) => {
                        const canvasW = canvasWidthMm / 10;
                        const canvasH = canvasHeightMm / 10;
                        if (line.type === 'v') {
                          return (
                            <g key={`v-${i}-${line.pos}`}>
                              <line
                                x1={line.pos}
                                y1={0}
                                x2={line.pos}
                                y2={canvasH}
                                stroke="#2563EB"
                                strokeWidth={strokeW}
                                strokeDasharray={dashStr}
                                strokeOpacity="0.95"
                              />
                              <circle cx={line.pos} cy="0" r={dotR} fill="#2563EB" />
                              <circle cx={line.pos} cy={canvasH} r={dotR} fill="#2563EB" />
                              {line.label && (
                                <foreignObject
                                  x={line.pos - 35}
                                  y={8 * scaleInv}
                                  width="70"
                                  height="20"
                                  className="overflow-visible"
                                >
                                  <div className="flex justify-center" style={{ transform: `scale(${scaleInv})`, transformOrigin: 'top center' }}>
                                    <span className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] font-bold shadow-xs whitespace-nowrap">
                                      {line.label}
                                    </span>
                                  </div>
                                </foreignObject>
                              )}
                            </g>
                          );
                        } else {
                          return (
                            <g key={`h-${i}-${line.pos}`}>
                              <line
                                x1={0}
                                y1={line.pos}
                                x2={canvasW}
                                y2={line.pos}
                                stroke="#2563EB"
                                strokeWidth={strokeW}
                                strokeDasharray={dashStr}
                                strokeOpacity="0.95"
                              />
                              <circle cx="0" cy={line.pos} r={dotR} fill="#2563EB" />
                              <circle cx={canvasW} cy={line.pos} r={dotR} fill="#2563EB" />
                              {line.label && (
                                <foreignObject
                                  x={8 * scaleInv}
                                  y={line.pos - 10}
                                  width="70"
                                  height="20"
                                  className="overflow-visible"
                                >
                                  <div className="flex items-center" style={{ transform: `scale(${scaleInv})`, transformOrigin: 'left center' }}>
                                    <span className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] font-bold shadow-xs whitespace-nowrap">
                                      {line.label}
                                    </span>
                                  </div>
                                </foreignObject>
                              )}
                            </g>
                          );
                        }
                      })}
                    </svg>
                  );
                })()}

                {/* Draggable human metric silhouette scale reference (without transform controls) */}
                {activeHumanVisible && (() => {
                  const canvasW = canvasWidthMm / 10;
                  const canvasH = canvasHeightMm / 10;
                  const humanH = activeHumanHeightCm;
                  const humanW = Math.round(humanH * (70 / 175));
                  const activeX = activeHumanPos ? activeHumanPos.x : (canvasW / 2 - humanW / 2);
                  const activeY = activeHumanPos ? activeHumanPos.y : (canvasH - humanH - 10);

                  return (
                    <div
                      className={`absolute z-20 cursor-grab active:cursor-grabbing select-none group transition-opacity ${
                        isDraggingHuman ? 'cursor-grabbing opacity-90' : 'hover:opacity-100'
                      }`}
                      style={{
                        left: `${activeX}px`,
                        top: `${activeY}px`,
                        width: `${humanW}px`,
                        height: `${humanH}px`,
                      }}
                      title={`Силуэт человека (рост ${activeHumanHeightCm} см) — зажмите мышью для перемещения по полю`}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        isInteractingWithElementRef.current = true;
                        setIsDraggingHuman(true);
                        const startMouseX = e.clientX;
                        const startMouseY = e.clientY;
                        const startX = activeX;
                        const startY = activeY;
                        const currentScale = canvasScale * zoomScale;

                        const handleMouseMove = (moveEv: MouseEvent) => {
                          const dx = (moveEv.clientX - startMouseX) / currentScale;
                          const dy = (moveEv.clientY - startMouseY) / currentScale;
                          const nextX = Math.max(-30, Math.min(canvasW - 40, startX + dx));
                          const nextY = Math.max(-30, Math.min(canvasH - 40, startY + dy));
                          updateActiveSceneHuman({ humanPos: { x: nextX, y: nextY } });
                        };

                        const handleMouseUp = () => {
                          setIsDraggingHuman(false);
                          window.removeEventListener('mousemove', handleMouseMove);
                          window.removeEventListener('mouseup', handleMouseUp);
                        };

                        window.addEventListener('mousemove', handleMouseMove);
                        window.addEventListener('mouseup', handleMouseUp);
                      }}
                    >
                      <div className="relative w-full h-full flex flex-col items-center">
                        <svg
                          viewBox="0 0 100 240"
                          className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
                        >
                          <path
                            fill="#C0D4E5"
                            fillOpacity="0.88"
                            stroke="#8CA8C2"
                            strokeWidth="1"
                            strokeLinejoin="round"
                            fillRule="evenodd"
                            d="
                              M 50 10
                              C 43 10 36 15 36 25
                              C 35 32 38 42 34 48
                              C 29 50 22 55 20 62
                              C 17 71 18 80 15 88
                              C 13 94 17 101 22 102
                              C 28 103 33 97 36 88
                              C 37 83 36 74 38 68
                              C 37 82 34 100 22 162
                              C 20 166 23 168 28 168
                              L 42 168
                              L 43 232
                              C 42 236 47 238 49 238
                              C 50 238 50 234 49 228
                              L 48 172
                              L 52 172
                              L 51 228
                              C 50 234 50 238 51 238
                              C 53 238 58 236 57 232
                              L 58 168
                              L 72 168
                              C 77 168 80 166 78 162
                              C 66 100 63 82 62 68
                              C 64 74 63 83 64 88
                              C 67 97 72 103 78 102
                              C 83 101 87 94 85 88
                              C 82 80 83 71 80 62
                              C 78 55 71 50 66 48
                              C 62 42 65 32 64 25
                              C 64 15 57 10 50 10 Z

                              M 36 68
                              C 32 74 25 84 24 90
                              C 27 93 32 89 34 82
                              C 35 78 36 73 36 68 Z

                              M 64 68
                              C 64 73 65 78 66 82
                              C 68 89 73 93 76 90
                              C 75 84 68 74 64 68 Z
                            "
                          />
                        </svg>
                        {/* Interactive height badge */}
                        <div className="opacity-90 hover:opacity-100 transition-opacity duration-200 pointer-events-auto absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap z-30">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-700 dark:text-zinc-200 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700 shadow-md">
                            <span>Рост:</span>
                            <input
                              type="number"
                              min={80}
                              max={250}
                              value={activeHumanHeightCm}
                              onChange={(evt) => {
                                const val = Math.max(50, Math.min(250, Number(evt.target.value) || 175));
                                updateActiveSceneHuman({ humanHeightCm: val });
                              }}
                              onClick={(evt) => evt.stopPropagation()}
                              className="w-9 text-center font-bold bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-300 dark:border-zinc-600 px-0.5 py-0 text-[10px] focus:outline-none focus:ring-1 focus:ring-[var(--lavenderAccent)]"
                            />
                            <span>см</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Draggable Active Elements */}
                {activeScene.elements.map((el, idx) => {
                  if (!el.isVisible) return null;
                  if (el.type === 'measurement' && !areMeasurementsVisible) return null;
                  const isSelected = el.id === selectedId;

                  return (
                    <React.Fragment key={el.id}>
                      <div
                        onMouseDown={(e) => handleCanvasMouseDown(e, el)}
                        onClick={(e) => e.stopPropagation()}
                      className={`absolute group transition-shadow ${
                        el.isLocked ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'
                      } ${
                        isSelected ? 'z-20' : 'hover:ring-1 hover:ring-purple-400/50'
                      }`}
                      style={{
                        left: `${el.x}px`,
                        top: `${el.y}px`,
                        width: `${el.w}px`,
                        height: `${el.h}px`,
                        transform: `rotate(${el.rotation}deg) scaleX(${el.isFlippedH ? -1 : 1}) scaleY(${el.isFlippedV ? -1 : 1})`,
                        transformOrigin: el.type === 'measurement' ? '0 50%' : 'center center',
                        opacity: el.opacity / 100
                      }}
                    >
                      {/* SVG Filter for alpha-channel pixel recoloring */}
                      {el.tintColor && (
                        <svg className="absolute w-0 h-0 pointer-events-none overflow-hidden" aria-hidden="true">
                          <defs>
                            <filter id={`element-tint-${el.id}`} x="-10%" y="-10%" width="120%" height="120%">
                              <feFlood floodColor={el.tintColor} floodOpacity={(el.tintAmount ?? 75) / 100} result="flood" />
                              <feComposite in="flood" in2="SourceAlpha" operator="in" result="tintMask" />
                              {el.tintMode === 'multiply' ? (
                                <feBlend in="tintMask" in2="SourceGraphic" mode="multiply" result="blended" />
                              ) : el.tintMode === 'overlay' ? (
                                <feBlend in="tintMask" in2="SourceGraphic" mode="overlay" result="blended" />
                              ) : el.tintMode === 'normal' ? (
                                <feComposite in="tintMask" in2="SourceGraphic" operator="atop" result="blended" />
                              ) : (
                                <feBlend in="tintMask" in2="SourceGraphic" mode="color" result="blended" />
                              )}
                              <feComposite in="blended" in2="SourceAlpha" operator="in" />
                            </filter>
                          </defs>
                        </svg>
                      )}

                      {/* Image / SVG Graphics */}
                      <div
                        className="w-full h-full relative pointer-events-none select-none"
                        style={{
                          filter: `brightness(${100 + el.exposure}%) saturate(${el.saturate}%) hue-rotate(${el.hue}deg) sepia(${el.temp > 0 ? el.temp * 0.4 : 0}%)${
                            el.shadowEnabled
                              ? ` drop-shadow(${el.shadowX ?? 0}px ${el.shadowY ?? 8}px ${el.shadowBlur ?? 12}px ${hexToRgba(el.shadowColor || '#000000', (el.shadowOpacity ?? 50) / 100)})`
                              : ''
                          }${el.tintColor ? ` url(#element-tint-${el.id})` : ''}`
                        }}
                      >
                        {el.type === 'measurement' ? (() => {
                          const currentScale = canvasScale * zoomScale;
                          const scaleInv = 1 / (currentScale || 1);
                          const strokeW = 1.1 * scaleInv;
                          const tickH = 9 * scaleInv;
                          const centerY = Math.max(10, el.h / 2);
                          const elW = Math.max(30, el.w);
                          const leftX = 2 * scaleInv;
                          const rightX = elW - 2 * scaleInv;
                          const arrowLen = 7 * scaleInv;
                          const arrowWidth = 3 * scaleInv;

                          return (
                            <div className="w-full h-full relative flex items-center justify-center select-none pointer-events-auto">
                              {/* SVG Dimension Line with Double-Ended Arrows and End Ticks */}
                              <svg viewBox={`0 0 ${elW} ${Math.max(20, el.h)}`} className="w-full h-full overflow-visible pointer-events-none text-zinc-700 dark:text-zinc-200">
                                {/* End Ticks */}
                                <line x1={leftX} y1={centerY - tickH} x2={leftX} y2={centerY + tickH} stroke="currentColor" strokeWidth={strokeW} strokeLinecap="round" />
                                <line x1={rightX} y1={centerY - tickH} x2={rightX} y2={centerY + tickH} stroke="currentColor" strokeWidth={strokeW} strokeLinecap="round" />
                                
                                {/* Main Dimension Line */}
                                <line x1={leftX} y1={centerY} x2={rightX} y2={centerY} stroke="currentColor" strokeWidth={strokeW} />
                                
                                {/* Left Arrow Head */}
                                <polygon points={`${leftX},${centerY} ${leftX + arrowLen},${centerY - arrowWidth} ${leftX + arrowLen},${centerY + arrowWidth}`} fill="currentColor" />
                                
                                {/* Right Arrow Head */}
                                <polygon points={`${rightX},${centerY} ${rightX - arrowLen},${centerY - arrowWidth} ${rightX - arrowLen},${centerY + arrowWidth}`} fill="currentColor" />
                              </svg>

                              {/* Centered Editable Value Badge */}
                              <div
                                className="absolute top-1/2 left-1/2 z-30 pointer-events-auto cursor-text"
                                style={{ transform: `translate(-50%, -50%) scale(${scaleInv})`, transformOrigin: 'center center' }}
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {editingMeasurementId === el.id ? (
                                  <input
                                    type="text"
                                    autoFocus
                                    value={editingMeasurementValue}
                                    onChange={(e) => setEditingMeasurementValue(e.target.value)}
                                    onBlur={() => {
                                      const val = editingMeasurementValue.trim() || '0 см';
                                      updateActiveSceneElements(prev => prev.map(item => item.id === el.id ? { ...item, measurementValue: val, caption: val } : item));
                                      setEditingMeasurementId(null);
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        const val = editingMeasurementValue.trim() || '0 см';
                                        updateActiveSceneElements(prev => prev.map(item => item.id === el.id ? { ...item, measurementValue: val, caption: val } : item));
                                        setEditingMeasurementId(null);
                                      }
                                    }}
                                    className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-2 border-zinc-500 dark:border-zinc-400 rounded-full px-2.5 py-0.5 text-xs font-bold text-center outline-none shadow-md min-w-[75px]"
                                  />
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingMeasurementId(el.id);
                                      setEditingMeasurementValue(el.measurementValue || el.caption || `${el.w} см`);
                                    }}
                                    className="px-2.5 py-0.5 rounded-full bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-400 dark:border-zinc-600 shadow-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold transition-all flex items-center gap-1 active:scale-95 whitespace-nowrap cursor-pointer"
                                    title="Кликните для ввода нужного замера"
                                  >
                                    <span>{el.measurementValue || el.caption || `${el.w} см`}</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })() : el.customImage ? (
                          <img
                            src={el.customImage}
                            alt={el.name}
                            onLoad={(e) => {
                              const img = e.currentTarget;
                              if (img.naturalWidth && img.naturalHeight && !el.aspectRatioAdjusted && !adjustedAspectIdsRef.current.has(el.id)) {
                                adjustedAspectIdsRef.current.add(el.id);
                                const aspect = img.naturalWidth / img.naturalHeight;
                                const currentAspect = el.w / el.h;
                                if (Math.abs(currentAspect - aspect) > 0.02) {
                                  const newW = Math.max(20, Math.round(el.h * aspect));
                                  requestAnimationFrame(() => {
                                    updateActiveSceneElements(prev => prev.map(item => item.id === el.id ? { ...item, w: newW, aspectRatioAdjusted: true } : item));
                                  });
                                } else {
                                  requestAnimationFrame(() => {
                                    updateActiveSceneElements(prev => prev.map(item => item.id === el.id ? { ...item, aspectRatioAdjusted: true } : item));
                                  });
                                }
                              }
                            }}
                            className="w-full h-full object-fill pointer-events-none select-none block"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center pointer-events-none select-none [&_svg]:w-full [&_svg]:h-full [&_svg]:block"
                            dangerouslySetInnerHTML={{
                              __html: el.svgMarkup ? el.svgMarkup
                                .replace(/<svg\b([^>]*)>/i, (match, p1) => {
                                  const cleanP1 = p1.replace(/\b(width|height)=["'][^"']*["']/gi, '').replace(/\bpreserveAspectRatio=["'][^"']*["']/gi, '');
                                  return `<svg ${cleanP1} preserveAspectRatio="none" style="width:100%;height:100%;">`;
                                })
                                .replace(/<(rect|circle|ellipse|line|polyline|polygon|path)\b/g, '<$1 vector-effect="non-scaling-stroke" ')
                                : ''
                            }}
                          />
                        )}
                      </div>

                      {/* Editable & Draggable Caption Label with Leader Line (ONLY IN SCHEMA MODE) */}
                      {activeWorkspaceTab === 'floorplan' && el.type !== 'measurement' && Boolean(
                        el.caption &&
                        el.caption.trim() &&
                        el.caption !== el.name &&
                        !el.caption.startsWith('Загружен в') &&
                        !el.caption.startsWith('Пакетная') &&
                        !el.caption.includes('каркас для украшения')
                      ) && (() => {
                        const offX = el.captionOffsetX || 0;
                        const offY = el.captionOffsetY || 0;
                        const hasOffset = Math.hypot(offX, offY) > 3;

                        const startX = el.w / 2;
                        const startY = el.h / 2;
                        const endX = el.w / 2 + offX;
                        const endY = el.h + 8 + offY;

                        return (
                          <>
                            {hasOffset && (() => {
                              const currentScale = canvasScale * zoomScale;
                              const scaleInv = 1 / (currentScale || 1);
                              return (
                                <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-20">
                                  <line
                                    x1={startX}
                                    y1={startY}
                                    x2={endX}
                                    y2={endY}
                                    stroke="#52525B"
                                    strokeWidth={0.85 * scaleInv}
                                    strokeDasharray={`${3 * scaleInv} ${3 * scaleInv}`}
                                  />
                                  <circle cx={startX} cy={startY} r={2.5 * scaleInv} fill="#52525B" />
                                </svg>
                              );
                            })()}

                            <div
                              className="absolute z-30 pointer-events-auto select-none group/caption cursor-grab active:cursor-grabbing"
                              style={{
                                left: `${endX}px`,
                                top: `${endY}px`,
                                transform: `translate(-50%, -50%) rotate(${-el.rotation}deg) scaleX(${el.isFlippedH ? -1 : 1}) scaleY(${el.isFlippedV ? -1 : 1})`
                              }}
                              onMouseDown={(e) => handleCaptionMouseDown(e, el)}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {editingCaptionId === el.id ? (
                                <input
                                  type="text"
                                  autoFocus
                                  value={editingCaptionText}
                                  onChange={(e) => setEditingCaptionText(e.target.value)}
                                  onBlur={() => {
                                    updateActiveSceneElements(prev => prev.map(item => item.id === el.id ? { ...item, caption: editingCaptionText } : item));
                                    setEditingCaptionId(null);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      updateActiveSceneElements(prev => prev.map(item => item.id === el.id ? { ...item, caption: editingCaptionText } : item));
                                      setEditingCaptionId(null);
                                    }
                                  }}
                                  onMouseDown={(e) => e.stopPropagation()}
                                  className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-[var(--lavDeep)] dark:border-[var(--lavenderAccent)] rounded-full h-5.5 sm:h-6 px-2 text-[10px] sm:text-[11px] font-semibold text-center outline-none shadow-xs min-w-[60px]"
                                />
                              ) : (
                                <div className="relative group/badge flex items-center gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (isCaptionDraggingRef.current) {
                                        isCaptionDraggingRef.current = false;
                                        return;
                                      }
                                      setEditingCaptionId(el.id);
                                      setEditingCaptionText(el.caption || '');
                                    }}
                                    className="h-5.5 sm:h-6 px-2 py-0.5 rounded-full bg-white/95 dark:bg-zinc-900/95 hover:bg-white dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-[var(--lavenderAccent)]/60 hover:border-[var(--lavDeep)] dark:hover:border-[var(--lavenderAccent)] shadow-xs text-[10px] sm:text-[11px] font-semibold transition-all flex items-center gap-1 whitespace-nowrap active:scale-95 cursor-pointer"
                                    title="Зажмите и перетащите для перемещения подписи. Кликните для редактирования."
                                  >
                                    <Move className="w-2.5 h-2.5 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] opacity-80 group-hover/caption:opacity-100 shrink-0" />
                                    <span>{el.caption || 'Подпись...'}</span>
                                  </button>

                                  {hasOffset && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateActiveSceneElements(prev => prev.map(item => item.id === el.id ? { ...item, captionOffsetX: 0, captionOffsetY: 0 } : item));
                                      }}
                                      className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full bg-white/90 dark:bg-zinc-800/90 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 border border-zinc-200 dark:border-zinc-700 transition-colors shadow-xs flex items-center justify-center shrink-0 cursor-pointer"
                                      title="Сбросить положение подписи"
                                    >
                                      <X className="w-2.5 h-2.5" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </>
                        );
                      })()}

                      {/* Dashed Outline for Group Member */}
                      {selectedIds.length > 1 && selectedIds.includes(el.id) && (() => {
                        const currentScale = canvasScale * zoomScale;
                        const scaleInv = 1 / (currentScale || 1);
                        return (
                          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-20">
                            <rect
                              x="0"
                              y="0"
                              width="100%"
                              height="100%"
                              fill="none"
                              stroke="var(--lavenderAccent, #C084FC)"
                              strokeWidth={0.85 * scaleInv}
                              strokeDasharray={`${3 * scaleInv} ${3 * scaleInv}`}
                            />
                          </svg>
                        );
                      })()}

                      {/* Interactive Bounding Box & Handles */}
                      {isSelected && (() => {
                        const currentScale = canvasScale * zoomScale;
                        const scaleInv = 1 / (currentScale || 1);

                        return (
                          <>
                            {el.isLocked ? (
                              /* Pale Gray Dashed Outline for Locked Element */
                              <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-20">
                                <rect
                                  x="0"
                                  y="0"
                                  width="100%"
                                  height="100%"
                                  fill="none"
                                  stroke="#A1A1AA"
                                  strokeWidth={0.85 * scaleInv}
                                  strokeDasharray={`${3 * scaleInv} ${3 * scaleInv}`}
                                />
                              </svg>
                            ) : (
                              <>
                                {/* Thin Purple Dashed Selection Bounding Box - Snapped to exact outer edges */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-20">
                                  <rect
                                    x="0"
                                    y="0"
                                    width="100%"
                                    height="100%"
                                    fill="none"
                                    stroke="var(--lavDeep, #8C52D0)"
                                    strokeWidth={0.85 * scaleInv}
                                    strokeDasharray={`${3 * scaleInv} ${3 * scaleInv}`}
                                  />
                                </svg>

                                {/* 8 Resizing handles - Fixed screen visual size */}
                                {[
                                  { id: 'tl', cursor: 'nwse-resize', pos: { top: 0, left: 0 }, baseTranslate: 'translate(-50%, -50%)', class: 'rounded-full w-2.5 h-2.5 bg-white border border-[var(--lavDeep)] dark:border-[var(--lavenderAccent)] shadow-sm' },
                                  { id: 'tr', cursor: 'nesw-resize', pos: { top: 0, right: 0 }, baseTranslate: 'translate(50%, -50%)', class: 'rounded-full w-2.5 h-2.5 bg-white border border-[var(--lavDeep)] dark:border-[var(--lavenderAccent)] shadow-sm' },
                                  { id: 'bl', cursor: 'nesw-resize', pos: { bottom: 0, left: 0 }, baseTranslate: 'translate(-50%, 50%)', class: 'rounded-full w-2.5 h-2.5 bg-white border border-[var(--lavDeep)] dark:border-[var(--lavenderAccent)] shadow-sm' },
                                  { id: 'br', cursor: 'nwse-resize', pos: { bottom: 0, right: 0 }, baseTranslate: 'translate(50%, 50%)', class: 'rounded-full w-2.5 h-2.5 bg-white border border-[var(--lavDeep)] dark:border-[var(--lavenderAccent)] shadow-sm' },
                                  { id: 't', cursor: 'ns-resize', pos: { top: 0, left: '50%' }, baseTranslate: 'translate(-50%, -50%)', class: 'w-2 h-2 bg-white border border-[var(--lavDeep)] dark:border-[var(--lavenderAccent)] shadow-xs' },
                                  { id: 'b', cursor: 'ns-resize', pos: { bottom: 0, left: '50%' }, baseTranslate: 'translate(-50%, 50%)', class: 'w-2 h-2 bg-white border border-[var(--lavDeep)] dark:border-[var(--lavenderAccent)] shadow-xs' },
                                  { id: 'l', cursor: 'ew-resize', pos: { top: '50%', left: 0 }, baseTranslate: 'translate(-50%, -50%)', class: 'w-2 h-2 bg-white border border-[var(--lavDeep)] dark:border-[var(--lavenderAccent)] shadow-xs' },
                                  { id: 'r', cursor: 'ew-resize', pos: { top: '50%', right: 0 }, baseTranslate: 'translate(50%, -50%)', class: 'w-2 h-2 bg-white border border-[var(--lavDeep)] dark:border-[var(--lavenderAccent)] shadow-xs' }
                                ].map((handle) => (
                                  <div
                                    key={handle.id}
                                    className={`absolute ${handle.class} z-30 hover:scale-125 transition-transform`}
                                    style={{
                                      ...handle.pos,
                                      cursor: handle.cursor,
                                      transform: `${handle.baseTranslate} scale(${scaleInv})`,
                                      transformOrigin: 'center center'
                                    }}
                                    onMouseDown={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      isInteractingWithElementRef.current = true;
                                      setActiveAction('resize');
                                      setActiveHandle(handle.id);
                                      dragStartRef.current = {
                                        x: e.clientX,
                                        y: e.clientY,
                                        elX: el.x,
                                        elY: el.y,
                                        elW: el.w,
                                        elH: el.h,
                                        rotation: el.rotation
                                      };
                                    }}
                                  />
                                ))}

                                {/* Rotation handle line and button - Fixed screen visual size */}
                                <div
                                  className="absolute top-0 left-1/2 bg-[var(--lavDeep)] dark:bg-[var(--lavenderAccent)] drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] pointer-events-none z-30"
                                  style={{
                                    width: `${1.5 * scaleInv}px`,
                                    height: `${22 * scaleInv}px`,
                                    transform: 'translate(-50%, -100%)',
                                    transformOrigin: 'bottom center'
                                  }}
                                />
                                <div
                                  className="absolute top-0 left-1/2 w-6.5 h-6.5 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-[var(--lavDeep)] dark:border-[var(--lavenderAccent)] shadow-md flex items-center justify-center hover:bg-[var(--lavenderSoft)] dark:hover:bg-zinc-800 hover:scale-110 active:scale-95 transition-transform cursor-grab active:cursor-grabbing z-40"
                                  title="Кликните для ввода точного градуса, или удерживайте для вращения мышью"
                                  style={{
                                    transform: `translate(-50%, -100%) translateY(${-22 * scaleInv}px) scale(${scaleInv})`,
                                    transformOrigin: 'center center'
                                  }}
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    isInteractingWithElementRef.current = true;
                                    const targetId = el.id;
                                    setSelectedId(targetId);
                                    setActiveAction('rotate');
                                    
                                    const startX = e.clientX;
                                    const startY = e.clientY;
                                    let isDragging = false;

                                    const rect = canvasContainerRef.current?.getBoundingClientRect();
                                    let startAngle = 0;
                                    let startRotation = el.rotation;
                                    let centerAbsX = 0;
                                    let centerAbsY = 0;

                                    if (rect) {
                                      const elCenterX = el.x + el.w / 2;
                                      const elCenterY = el.y + el.h / 2;
                                      centerAbsX = rect.left + elCenterX;
                                      centerAbsY = rect.top + elCenterY;
                                      startAngle = Math.atan2(e.clientY - centerAbsY, e.clientX - centerAbsX) * (180 / Math.PI);
                                      rotateStartRef.current = {
                                        startAngle,
                                        startRotation,
                                        centerX: centerAbsX,
                                        centerY: centerAbsY
                                      };
                                    }

                                    const handleMouseMove = (moveEvent: MouseEvent) => {
                                      const dist = Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY);
                                      if (dist > 3) {
                                        isDragging = true;
                                      }
                                      if (isDragging) {
                                        const dx = moveEvent.clientX - centerAbsX;
                                        const dy = moveEvent.clientY - centerAbsY;
                                        const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);
                                        const angleDiff = currentAngle - startAngle;
                                        let newRotation = Math.round(startRotation + angleDiff);

                                        if (moveEvent.shiftKey) {
                                          newRotation = Math.round(newRotation / 15) * 15;
                                        }
                                        if (newRotation > 180) newRotation -= 360;
                                        if (newRotation < -180) newRotation += 360;

                                        updateActiveSceneElements(prev => prev.map(item => item.id === targetId ? { ...item, rotation: newRotation } : item));
                                      }
                                    };

                                    const handleMouseUp = () => {
                                      window.removeEventListener('mousemove', handleMouseMove);
                                      window.removeEventListener('mouseup', handleMouseUp);
                                      setActiveAction(null);
                                      setActiveHandle(null);

                                      if (!isDragging) {
                                        setRotationInputId(prev => prev === targetId ? null : targetId);
                                      } else {
                                        recordHistory(scenes);
                                      }
                                    };

                                    window.addEventListener('mousemove', handleMouseMove);
                                    window.addEventListener('mouseup', handleMouseUp);
                                  }}
                                >
                                  <RefreshCw className="w-3.5 h-3.5 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]" />
                                </div>

                                {/* Floating Exact Rotation Angle Popover - Single Compact Horizontal Row */}
                                {rotationInputId === el.id && (() => {
                                  const rad = (el.rotation || 0) * Math.PI / 180;
                                  const cos = Math.cos(rad);
                                  const halfH = el.h / 2;
                                  const centerAbsY = el.y + halfH;
                                  
                                  // Exact world Y of the rotation handle
                                  const localHandleOffsetY = -halfH - 34 * scaleInv;
                                  const rotHandleWorldY = centerAbsY + localHandleOffsetY * cos;

                                  // Place popup towards center only if the rotation handle is close to the top of the canvas
                                  const placeBelowHandle = rotHandleWorldY < 60;

                                  return (
                                    <div
                                      className="absolute left-1/2 z-50 bg-white/80 dark:bg-zinc-900/80 text-zinc-800 dark:text-zinc-100 px-3 h-8 sm:h-9 rounded-full shadow-lg border border-zinc-200/60 dark:border-zinc-700/60 flex items-center gap-1.5 pointer-events-auto animate-fadeIn select-none backdrop-blur-md"
                                      style={{
                                        top: 0,
                                        transform: `translate(-50%, -100%) translateY(${placeBelowHandle ? `${26 * scaleInv}px` : `${-58 * scaleInv}px`}) rotate(${-el.rotation}deg) scaleX(${el.isFlippedH ? -1 : 1}) scaleY(${el.isFlippedV ? -1 : 1}) scale(${scaleInv})`,
                                        transformOrigin: placeBelowHandle ? 'top center' : 'bottom center',
                                        WebkitFontSmoothing: 'antialiased'
                                      }}
                                      onMouseDown={(e) => e.stopPropagation()}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {/* Manual Number Input Box */}
                                      <div className="relative flex items-center shrink-0">
                                        <input
                                          type="number"
                                          value={el.rotation}
                                          onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            updateActiveSceneElements(prev => prev.map(item => item.id === el.id ? { ...item, rotation: isNaN(val) ? 0 : val } : item));
                                          }}
                                          className="w-12 text-center font-semibold text-xs bg-white/70 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 rounded-full py-0.5 pr-3 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[var(--lavDeep)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                        <span className="absolute right-1.5 text-[10px] font-semibold text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] pointer-events-none">°</span>
                                      </div>

                                      <div className="w-[1px] h-3.5 bg-zinc-300/40 dark:bg-zinc-700/60 shrink-0 mx-0.5" />

                                      {/* Quick Preset Angles: 0, 45, 90 */}
                                      <div className="flex items-center gap-1 shrink-0">
                                        {[0, 45, 90].map((deg) => (
                                          <button
                                            key={deg}
                                            onClick={() => {
                                              updateActiveSceneElements(prev => prev.map(item => item.id === el.id ? { ...item, rotation: deg } : item));
                                            }}
                                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                                              el.rotation === deg
                                                ? 'bg-[var(--lavDeep)] text-white shadow-xs'
                                                : 'bg-white/50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:bg-white/80 hover:text-[var(--lavDeep)]'
                                            }`}
                                          >
                                            {deg}°
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })()}
                              </>
                            )}
                          </>
                        );
                      })()}
                    </div>

                    {/* UNROTATED FLOATING QUICK TOOLBAR (Canvas Level - Always Horizontal & Below/Above Bounding Box) */}
                    {isSelected && selectedIds.length === 1 && (() => {
                      const rad = (el.rotation || 0) * Math.PI / 180;
                      const cos = Math.cos(rad);
                      const sin = Math.sin(rad);

                      const halfW = el.w / 2;
                      const halfH = el.h / 2;

                      const localCorners = [
                        { x: -halfW, y: -halfH },
                        { x: halfW, y: -halfH },
                        { x: halfW, y: halfH },
                        { x: -halfW, y: halfH }
                      ];

                      const rotatedYCorners = localCorners.map(pt => (pt.x * sin) + (pt.y * cos));

                      const centerAbsX = el.x + halfW;
                      const centerAbsY = el.y + halfH;

                      const boxMinY = centerAbsY + Math.min(...rotatedYCorners);
                      const boxMaxY = centerAbsY + Math.max(...rotatedYCorners);

                      const currentScale = canvasScale * zoomScale;
                      const scaleInv = 1 / (currentScale || 1);

                      const canvasMaxY = canvasHeightMm / 10;
                      const toolbarHeight = 44 * scaleInv;

                      // Calculate where the rotation handle is pointing in world coordinates
                      // Rotation handle is located on the local top of the element (-halfH)
                      const rotHandleOffsetY = -(halfH + 24 * scaleInv) * cos;
                      const isRotHandleAtBottom = rotHandleOffsetY > 5 * scaleInv;
                      const isRotHandleAtTop = rotHandleOffsetY < -5 * scaleInv;

                      // Preferred side: opposite to rotation handle so they never collide
                      let showBelow = !isRotHandleAtBottom;

                      // Boundary safety checks
                      const overflowBottom = (boxMaxY + toolbarHeight + 20 * scaleInv) > canvasMaxY;
                      const overflowTop = (boxMinY - toolbarHeight - 20 * scaleInv) < 0;

                      if (showBelow && overflowBottom && !overflowTop) {
                        showBelow = false;
                      } else if (!showBelow && overflowTop && !overflowBottom) {
                        showBelow = true;
                      }

                      const targetY = showBelow ? boxMaxY : boxMinY;

                      // Clearance: if forced onto the same side as the rotation handle due to boundaries, give extra margin
                      let gapPx: number;
                      if (showBelow) {
                        gapPx = (isRotHandleAtBottom ? 44 : 16) * scaleInv;
                      } else {
                        gapPx = (isRotHandleAtTop ? -44 : -16) * scaleInv;
                      }

                      const currentElIdx = activeScene.elements.findIndex(item => item.id === el.id);

                      return (
                        <div
                          className="absolute z-50 pointer-events-auto select-none flex items-center gap-1.5 bg-white/40 dark:bg-zinc-900/40 text-zinc-800 dark:text-zinc-100 px-2.5 h-8 sm:h-9 rounded-full shadow-lg shadow-purple-950/10 border border-white/50 dark:border-zinc-700/50 backdrop-blur-md"
                          style={{
                            left: `${centerAbsX}px`,
                            top: `${targetY}px`,
                            transform: `translate(-50%, ${showBelow ? '0%' : '-100%'}) translateY(${gapPx}px) scale(${scaleInv})`,
                            transformOrigin: showBelow ? 'top center' : 'bottom center',
                            WebkitFontSmoothing: 'antialiased'
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Lock Toggle */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateActiveSceneElements(prev => prev.map(item => item.id === el.id ? { ...item, isLocked: !item.isLocked } : item));
                            }}
                            className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-full hover:bg-amber-500/20 active:scale-90 transition-all cursor-pointer flex items-center justify-center shrink-0 group"
                            title={el.isLocked ? "Разблокировать" : "Заблокировать"}
                          >
                            {el.isLocked ? (
                              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400 stroke-[2.3] group-hover:scale-110 transition-transform" />
                            ) : (
                              <Unlock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.3] group-hover:scale-110 transition-transform" />
                            )}
                          </button>

                          {/* Copy/Duplicate */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateElement(el);
                            }}
                            className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-full hover:bg-[var(--lavenderSoft)] active:scale-90 transition-all cursor-pointer flex items-center justify-center shrink-0 group"
                            title="Копировать"
                          >
                            <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] stroke-[2.3] group-hover:scale-110 transition-transform" />
                          </button>

                          <div className="w-[1px] h-3.5 sm:h-4 bg-[var(--lavenderAccent)]/30 dark:bg-zinc-700/60 mx-0.5 shrink-0" />

                          {/* Layers Quick Access */}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowQuickLayerMenu(!showQuickLayerMenu);
                              }}
                              className={`w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-full active:scale-90 transition-all cursor-pointer flex items-center justify-center shrink-0 group ${
                                showQuickLayerMenu
                                  ? 'bg-[var(--lavDeep)] dark:bg-[var(--lavenderAccent)] text-white dark:text-zinc-900 shadow-xs'
                                  : 'hover:bg-[var(--lavenderSoft)] text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]'
                              }`}
                              title="Управление слоями"
                            >
                              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.3] group-hover:scale-110 transition-transform" />
                            </button>

                            {/* Floating Layer Actions Dropdown */}
                            {showQuickLayerMenu && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className={`absolute ${showBelow ? 'bottom-full mb-2' : 'top-full mt-2'} left-1/2 -translate-x-1/2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-1.5 rounded-2xl border border-white/60 dark:border-zinc-700/60 shadow-xl flex items-center gap-1 z-50 whitespace-nowrap animate-fadeIn`}
                              >
                                <button
                                  onClick={() => {
                                    if (currentElIdx >= 0) {
                                      handleReorderLayer(currentElIdx, activeScene.elements.length - 1);
                                      setShowQuickLayerMenu(false);
                                      showToast('Слой', 'Перемещено на передний план', 'info');
                                    }
                                  }}
                                  className="p-1.5 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-[var(--lavenderSoft)] hover:text-[var(--lavDeep)] dark:hover:text-[var(--lavenderAccent)] transition-colors cursor-pointer"
                                  title="На самый передний план"
                                >
                                  <ArrowUpToLine className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (currentElIdx >= 0) {
                                      handleMoveLayer(currentElIdx, 'up');
                                      showToast('Слой', 'Перемещено на слой выше', 'info');
                                    }
                                  }}
                                  className="p-1.5 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-[var(--lavenderSoft)] hover:text-[var(--lavDeep)] dark:hover:text-[var(--lavenderAccent)] transition-colors cursor-pointer"
                                  title="На слой выше"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (currentElIdx >= 0) {
                                      handleMoveLayer(currentElIdx, 'down');
                                      showToast('Слой', 'Перемещено на слой ниже', 'info');
                                    }
                                  }}
                                  className="p-1.5 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-[var(--lavenderSoft)] hover:text-[var(--lavDeep)] dark:hover:text-[var(--lavenderAccent)] transition-colors cursor-pointer"
                                  title="На слой ниже"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                                <div className="w-[1px] h-3.5 bg-zinc-300/60 dark:bg-zinc-700/60 mx-0.5" />
                                <button
                                  onClick={() => {
                                    if (currentElIdx >= 0) {
                                      handleReorderLayer(currentElIdx, 0);
                                      setShowQuickLayerMenu(false);
                                      showToast('Слой', 'Перемещено на задний план', 'info');
                                    }
                                  }}
                                  className="p-1.5 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-[var(--lavenderSoft)] hover:text-[var(--lavDeep)] dark:hover:text-[var(--lavenderAccent)] transition-colors cursor-pointer"
                                  title="На самый задний план"
                                >
                                  <ArrowDownToLine className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </React.Fragment>
                );
              })}

                {/* MULTI-SELECT GROUP BOUNDING BOX */}
                {selectedIds.length > 1 && (() => {
                  const selectedElements = activeScene.elements.filter(el => selectedIds.includes(el.id) && el.isVisible);
                  if (selectedElements.length <= 1) return null;

                  const minX = Math.min(...selectedElements.map(el => el.x));
                  const minY = Math.min(...selectedElements.map(el => el.y));
                  const maxX = Math.max(...selectedElements.map(el => el.x + el.w));
                  const maxY = Math.max(...selectedElements.map(el => el.y + el.h));
                  const groupW = maxX - minX;
                  const groupH = maxY - minY;

                  const isNearTop = minY < 50;

                  return (
                    <div
                      className="absolute z-30 cursor-grab active:cursor-grabbing group/groupbox pointer-events-auto"
                      style={{
                        left: `${minX}px`,
                        top: `${minY}px`,
                        width: `${groupW}px`,
                        height: `${groupH}px`,
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        isInteractingWithElementRef.current = true;
                        setActiveAction('move-group');
                        setActiveHandle(null);
                        dragGroupStartRef.current = {
                          mouseX: e.clientX,
                          mouseY: e.clientY,
                          items: selectedElements.map(item => ({ id: item.id, x: item.x, y: item.y }))
                        };
                      }}
                    >
                      {/* Outer Solid Bounding Frame */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-20">
                        <rect
                          x="0"
                          y="0"
                          width="100%"
                          height="100%"
                          fill="rgba(140, 82, 208, 0.08)"
                          stroke="var(--lavDeep)"
                          strokeWidth={0.85 / ((canvasScale * zoomScale) || 1)}
                          strokeDasharray={`${3 / ((canvasScale * zoomScale) || 1)} ${3 / ((canvasScale * zoomScale) || 1)}`}
                        />
                      </svg>

                      {/* Corner Resize/Decoration Markers */}
                      <div className="absolute top-0 left-0 w-3.5 h-3.5 bg-white border-2 border-[var(--lavDeep)] rounded-xs shadow-xs pointer-events-none" style={{ transform: `translate(-50%, -50%) scale(${1 / ((canvasScale * zoomScale) || 1)})`, transformOrigin: 'center center' }} />
                      <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-white border-2 border-[var(--lavDeep)] rounded-xs shadow-xs pointer-events-none" style={{ transform: `translate(50%, -50%) scale(${1 / ((canvasScale * zoomScale) || 1)})`, transformOrigin: 'center center' }} />
                      <div className="absolute bottom-0 left-0 w-3.5 h-3.5 bg-white border-2 border-[var(--lavDeep)] rounded-xs shadow-xs pointer-events-none" style={{ transform: `translate(-50%, 50%) scale(${1 / ((canvasScale * zoomScale) || 1)})`, transformOrigin: 'center center' }} />
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-white border-2 border-[var(--lavDeep)] rounded-xs shadow-xs pointer-events-none" style={{ transform: `translate(50%, 50%) scale(${1 / ((canvasScale * zoomScale) || 1)})`, transformOrigin: 'center center' }} />

                      {/* Badge Count Tag */}
                      <div
                        className={`absolute left-1/2 -translate-x-1/2 ${
                          isNearTop ? 'top-2' : '-top-9'
                        } pointer-events-none whitespace-nowrap z-40`}
                        style={{
                          transform: `scale(${1 / ((canvasScale * zoomScale) || 1)})`,
                          transformOrigin: isNearTop ? 'top center' : 'bottom center'
                        }}
                      >
                        <span
                          className="text-[10px] font-semibold text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] bg-white/95 dark:bg-zinc-900/95 px-2.5 py-1 rounded-full border border-white/80 dark:border-zinc-700/80 shadow-md flex items-center gap-1.5 backdrop-blur-md"
                        >
                          <BoxSelect className="w-3 h-3 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]" />
                          Выделено элементов: {selectedElements.length}
                        </span>
                      </div>

                      {/* FLOATING GROUP TOOLBAR */}
                      <div
                        className={`absolute left-1/2 -translate-x-1/2 ${
                          isNearTop ? 'bottom-2' : '-top-14'
                        } flex items-center gap-1.5 bg-white/40 dark:bg-zinc-900/40 text-zinc-800 dark:text-zinc-100 px-3.5 py-1.5 rounded-full shadow-lg shadow-purple-950/10 border border-white/50 dark:border-zinc-700/50 z-50 pointer-events-auto select-none backdrop-blur-md`}
                        style={{
                          transform: `scale(${1 / ((canvasScale * zoomScale) || 1)})`,
                          transformOrigin: isNearTop ? 'bottom center' : 'top center',
                          WebkitFontSmoothing: 'antialiased'
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Lock / Unlock all */}
                        <button
                          onClick={() => {
                            const allLocked = selectedElements.every(el => el.isLocked);
                            updateActiveSceneElements(prev => prev.map(el => selectedIds.includes(el.id) ? { ...el, isLocked: !allLocked } : el));
                            showToast('Группа', allLocked ? 'Группа разблокирована' : 'Группа заблокирована', 'info');
                          }}
                          className="p-1.5 rounded-full hover:bg-amber-500/20 active:scale-90 transition-all cursor-pointer flex items-center justify-center group"
                          title="Заблокировать / Разблокировать группу"
                        >
                          {selectedElements.every(el => el.isLocked) ? (
                            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 stroke-[2.3] group-hover:scale-110 transition-transform" />
                          ) : (
                            <Unlock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.3] group-hover:scale-110 transition-transform" />
                          )}
                        </button>

                        {/* Duplicate group */}
                        <button
                          onClick={() => {
                            const newElements: CanvasElement[] = [];
                            const newIds: string[] = [];
                            selectedElements.forEach(el => {
                              const dupId = `${el.type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                              newIds.push(dupId);
                              newElements.push({
                                ...el,
                                id: dupId,
                                x: Math.min(canvasWidthMm / 10 - el.w, el.x + 30),
                                y: Math.min(canvasHeightMm / 10 - el.h, el.y + 30)
                              });
                            });
                            updateActiveSceneElements(prev => [...prev, ...newElements]);
                            setSelectedIds(newIds);
                            showToast('Копия группы', `Скопировано ${selectedElements.length} элементов`, 'success');
                          }}
                          className="p-1.5 rounded-full hover:bg-[var(--lavenderSoft)] active:scale-90 transition-all cursor-pointer flex items-center justify-center group"
                          title="Скопировать всю группу"
                        >
                          <Copy className="w-4 h-4 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] stroke-[2.3] group-hover:scale-110 transition-transform" />
                        </button>

                        {/* Persistent Group / Ungroup button */}
                        {selectedElements.some(el => el.groupId) ? (
                          <button
                            onClick={handleUngroupSelectedElements}
                            style={{ background: 'linear-gradient(135deg, var(--primary-grad-from) 0%, var(--primary-grad-to) 100%)' }}
                            className="px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 hover:opacity-90"
                            title="Разгруппировать (сделать элементы независимыми)"
                          >
                            <Ungroup className="w-3.5 h-3.5" />
                            <span>Разгруппировать</span>
                          </button>
                        ) : (
                          <button
                            onClick={handleGroupSelectedElements}
                            style={{ background: 'linear-gradient(135deg, var(--primary-grad-from) 0%, var(--primary-grad-to) 100%)' }}
                            className="px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 hover:opacity-90"
                            title="Сгруппировать в постоянную группу"
                          >
                            <Group className="w-3.5 h-3.5" />
                            <span>Сгруппировать</span>
                          </button>
                        )}

                        <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-700 mx-0.5 shrink-0" />

                        {/* Delete group */}
                        <button
                          onClick={() => {
                            updateActiveSceneElements(prev => prev.filter(el => !selectedIds.includes(el.id)));
                            setSelectedIds([]);
                            showToast('Удалено', `Удалено ${selectedElements.length} элементов`, 'info');
                          }}
                          className="p-1.5 rounded-full hover:bg-rose-500/20 active:scale-90 transition-all cursor-pointer flex items-center justify-center group"
                          title="Удалить группу со сцены"
                        >
                          <Trash2 className="w-4 h-4 text-rose-500 dark:text-rose-400 stroke-[2.3] group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </div>
                  );
                })()}
                  </div>
                </div>

                {/* FLOATING BOTTOM 2-TAB BUTTONS BAR & ANCHORED DRAWER */}
                <>
                  {/* SLIDE-UP DRAWER ANCHORED DIRECTLY TO BOTTOM CANVAS EDGE */}
                    <AnimatePresence>
                      {mobileDrawerTab && (
                        <motion.div
                          initial={{ opacity: 0, y: '100%' }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: '100%' }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute bottom-0 inset-x-0 z-[70] w-full max-h-[65%] sm:max-h-[420px] flex flex-col bg-white/95 dark:bg-zinc-900/95 border-t border-x border-white/70 dark:border-white/15 rounded-t-[28px] shadow-[0_-12px_35px_rgba(0,0,0,0.15)] backdrop-blur-[24px] overflow-hidden pointer-events-auto"
                        >
                          {/* Drawer Header with Tabs at the Top */}
                          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/40 dark:border-white/10 bg-white/25 dark:bg-zinc-900/30 backdrop-blur-md shrink-0">
                            {/* Tabs Bar inside Top Header */}
                            <div className="p-0.5 bg-white/40 dark:bg-zinc-800/40 backdrop-blur-md rounded-full border border-white/50 dark:border-white/10 flex items-center gap-1 text-xs">
                              <button
                                onClick={() => {
                                  setMobileDrawerTab('library');
                                  setActiveSidebarTab('library');
                                }}
                                className={`py-1 px-3 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                  mobileDrawerTab === 'library'
                                    ? 'bg-[var(--lavenderSoft)] text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] shadow-xs border border-[var(--lavenderAccent)]/40 backdrop-blur-sm'
                                    : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/40 dark:hover:bg-white/10'
                                }`}
                              >
                                <BookOpen className="w-3.5 h-3.5 shrink-0 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]" />
                                <span>Библиотека</span>
                              </button>
                              <button
                                onClick={() => {
                                  setMobileDrawerTab('layers');
                                  setActiveSidebarTab('layers');
                                }}
                                className={`py-1 px-3 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                  mobileDrawerTab === 'layers'
                                    ? 'bg-[var(--lavenderSoft)] text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] shadow-xs border border-[var(--lavenderAccent)]/40 backdrop-blur-sm'
                                    : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/40 dark:hover:bg-white/10'
                                }`}
                              >
                                <Layers className="w-3.5 h-3.5 shrink-0 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]" />
                                <span>Элементы</span>
                                <span className="px-1.5 py-0.5 rounded-full bg-[var(--lavDeep)] dark:bg-[var(--lavenderAccent)] text-white text-[9px] font-extrabold leading-none shrink-0">
                                  {activeScene.elements.filter(el => el.type !== 'measurement').length}
                                </span>
                              </button>
                            </div>

                            <button
                              onClick={() => setMobileDrawerTab(null)}
                              className="p-1.5 rounded-full bg-white/50 dark:bg-zinc-800/50 hover:bg-white/80 dark:hover:bg-zinc-700 text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white border border-white/60 dark:border-white/10 transition-colors cursor-pointer"
                              title="Закрыть шторку"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Drawer Body Content */}
                          <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-3 min-w-0">
                            {renderSidebarTabContent(mobileDrawerTab)}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* FLOATING PILL BAR WITH 2 TABS WHEN CLOSED (MOBILE & TABLET PORTRAIT) */}
                    {!mobileDrawerTab && (
                      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex landscape:md:hidden xl:hidden items-center justify-center">
                        <div className="p-1 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md rounded-full border border-white/80 dark:border-zinc-700/60 shadow-lg flex items-center gap-1.5 text-xs">
                          <button
                            onClick={() => {
                              setMobileDrawerTab('library');
                              setActiveSidebarTab('library');
                            }}
                            className="py-1.5 px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10 active:scale-95"
                          >
                            <BookOpen className="w-3.5 h-3.5 shrink-0 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]" />
                            <span className="truncate">Библиотека</span>
                          </button>
                          <button
                            onClick={() => {
                              setMobileDrawerTab('layers');
                              setActiveSidebarTab('layers');
                            }}
                            className="py-1.5 px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10 active:scale-95"
                          >
                            <Layers className="w-3.5 h-3.5 shrink-0 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]" />
                            <span className="truncate">Элементы</span>
                            <span className="px-1.5 py-0.5 rounded-full bg-[var(--lavDeep)] dark:bg-[var(--lavenderAccent)] text-white text-[9px] font-extrabold leading-none shrink-0">
                              {activeScene.elements.filter(el => el.type !== 'measurement').length}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
              </div>
          </div>

          {/* BOTTOM PANELS IN LEFT COLUMN: DIMENSIONS/CONTROLS PANEL */}
          {(() => {
            const selectedElem = activeScene.elements.find(el => el.id === selectedId);
            return (
              <div className="shrink-0 relative z-30 pt-0.5">
                {/* PANEL: FIELD DIMENSIONS & TOGGLES (Single row compact layout) */}
                <div className="flex items-center justify-between gap-1 text-xs py-0.5 w-full flex-nowrap">
                  
                  {/* Dynamic Dimensions Block ("Размер поля" / "Размер элемента" on desktop, compact on mobile) */}
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 bg-white/80 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 rounded-full px-2 sm:px-3 py-1 shadow-xs">
                    <span className="hidden sm:inline-block text-[11px] font-extrabold text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                      {selectedElem ? 'Размер элемента' : 'Размер поля'}
                    </span>

                    {selectedElem ? (
                      <div className="flex items-center gap-1">
                        <div className="flex items-center gap-0.5">
                          <span className="font-extrabold text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] text-xs pl-0.5">Ш</span>
                          <input
                            type="number"
                            value={Math.round(selectedElem.w)}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val) && val > 0) {
                                updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, w: val } : item));
                              }
                            }}
                            className="w-11 sm:w-14 text-center font-bold text-xs bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-full px-1 py-0.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[var(--lavenderAccent)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                        <span className="text-zinc-400 font-bold text-xs">×</span>
                        <div className="flex items-center gap-0.5">
                          <span className="font-extrabold text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] text-xs pl-0.5">В</span>
                          <input
                            type="number"
                            value={Math.round(selectedElem.h)}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val) && val > 0) {
                                updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, h: val } : item));
                              }
                            }}
                            className="w-11 sm:w-14 text-center font-bold text-xs bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-full px-1 py-0.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[var(--lavenderAccent)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <div className="flex items-center gap-0.5">
                          <span className="font-extrabold text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] text-xs pl-0.5">Ш</span>
                          <input
                            type="number"
                            value={canvasWidthInput}
                            onChange={(e) => {
                              setCanvasWidthInput(e.target.value);
                              const parsed = parseFloat(e.target.value);
                              if (!isNaN(parsed) && parsed > 0) {
                                setCanvasWidthMm(fromDisplayValue(parsed));
                              }
                            }}
                            className="w-11 sm:w-14 text-center font-bold text-xs bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-full px-1 py-0.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[var(--lavenderAccent)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                        <span className="text-zinc-400 font-bold text-xs">×</span>
                        <div className="flex items-center gap-0.5">
                          <span className="font-extrabold text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] text-xs pl-0.5">В</span>
                          <input
                            type="number"
                            value={canvasHeightInput}
                            onChange={(e) => {
                              setCanvasHeightInput(e.target.value);
                              const parsed = parseFloat(e.target.value);
                              if (!isNaN(parsed) && parsed > 0) {
                                setCanvasHeightMm(fromDisplayValue(parsed));
                              }
                            }}
                            className="w-11 sm:w-14 text-center font-bold text-xs bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-full px-1 py-0.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[var(--lavenderAccent)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Action Toggles: Backdrop Popover, Grid, Human */}
                  <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-auto">
                    {/* Backdrop Button & Popover Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setIsBackdropPopoverOpen(!isBackdropPopoverOpen)}
                        style={{ background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' }}
                        className="px-3.5 py-1.5 rounded-full font-semibold text-xs flex items-center gap-1.5 text-white hover:opacity-90 shadow-xs cursor-pointer transition-all active:scale-95"
                        title="Настройки фона (Цвет, картинка, масштаб, сброс)"
                      >
                        <Upload className="w-3.5 h-3.5 shrink-0" />
                        <span>Фон</span>
                        {activeScene.backdropImage && activeScene.backdropScale && activeScene.backdropScale !== 1 && (
                          <span className="text-[10px] bg-white/20 px-1 rounded font-mono">
                            {Math.round(activeScene.backdropScale * 100)}%
                          </span>
                        )}
                      </button>

                      <AnimatePresence>
                        {isBackdropPopoverOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-[60]"
                              onClick={() => setIsBackdropPopoverOpen(false)}
                            />
                            <motion.div
                              initial={{ opacity: 0, y: 8, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 8, scale: 0.95 }}
                              transition={{ duration: 0.15 }}
                              className="absolute right-0 bottom-full mb-2 w-56 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-700/80 rounded-2xl shadow-xl p-2.5 z-[70] flex flex-col gap-2.5 transition-all"
                            >
                              <div className="flex items-center justify-between pb-1 border-b border-zinc-200/60 dark:border-zinc-800">
                                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 flex items-center gap-1.5">
                                  <Palette className="w-3.5 h-3.5 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]" />
                                  Настройка фона
                                </span>
                                <button
                                  onClick={() => setIsBackdropPopoverOpen(false)}
                                  className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Upload Image Option */}
                              <button
                                onClick={() => {
                                  fileInputRef.current?.click();
                                  setIsBackdropPopoverOpen(false);
                                }}
                                className="w-full py-1.5 px-2.5 rounded-xl bg-[var(--lavenderSoft)] hover:opacity-90 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-[var(--lavenderAccent)]/30"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Загрузить изображение</span>
                              </button>

                              {/* Color Picker Option */}
                              <div className="flex items-center justify-between gap-2 pt-0.5">
                                <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                                  Цвет фона:
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="color"
                                    value={activeScene.backdropColor || '#F3F4F6'}
                                    onChange={(e) => {
                                      handleCanvasBackdropChange('color', e.target.value);
                                      const updated = scenes.map(s => s.id === activeScene.id ? { ...s, backdropImage: '', backdropType: 'color' as const, backdropColor: e.target.value } : s);
                                      setScenes(updated);
                                      recordHistory(updated);
                                    }}
                                    className="w-7 h-7 rounded-lg border border-zinc-200 dark:border-zinc-700 cursor-pointer overflow-hidden p-0 bg-transparent"
                                    title="Выбрать цвет фона"
                                  />
                                  <input
                                    type="text"
                                    value={(activeScene.backdropColor || '#F3F4F6').toUpperCase()}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      handleCanvasBackdropChange('color', val);
                                      const updated = scenes.map(s => s.id === activeScene.id ? { ...s, backdropImage: '', backdropType: 'color' as const, backdropColor: val } : s);
                                      setScenes(updated);
                                      recordHistory(updated);
                                    }}
                                    className="w-16 px-1.5 py-0.5 rounded-md bg-zinc-100/80 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-[10px] font-mono font-semibold text-zinc-800 dark:text-zinc-200 uppercase focus:outline-none focus:border-[var(--lavDeep)]"
                                  />
                                </div>
                              </div>

                              {/* Background Image Scale Slider inside Popover */}
                              {activeScene.backdropImage && (
                                <div className="space-y-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800">
                                  <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">
                                    <span className="flex items-center gap-1">
                                      <ZoomIn className="w-3.5 h-3.5 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]" />
                                      Масштаб картинки
                                    </span>
                                    <span className="text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] font-mono font-semibold">
                                      {Math.round((activeScene.backdropScale || 1) * 100)}%
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => updateActiveSceneBackdropScale((activeScene.backdropScale || 1) - 0.1)}
                                      className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-200 font-bold text-xs transition-colors cursor-pointer shrink-0"
                                      title="Уменьшить масштаб"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="range"
                                      min="50"
                                      max="300"
                                      step="5"
                                      value={Math.round((activeScene.backdropScale || 1) * 100)}
                                      onChange={(e) => updateActiveSceneBackdropScale(parseFloat(e.target.value) / 100)}
                                      className="w-full accent-[var(--lavDeep)] dark:accent-[var(--lavenderAccent)] h-2 rounded-lg bg-zinc-200 dark:bg-zinc-700 cursor-pointer"
                                    />
                                    <button
                                      onClick={() => updateActiveSceneBackdropScale((activeScene.backdropScale || 1) + 0.1)}
                                      className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-200 font-bold text-xs transition-colors cursor-pointer shrink-0"
                                      title="Увеличить масштаб"
                                    >
                                      +
                                    </button>
                                    {(activeScene.backdropScale && activeScene.backdropScale !== 1) && (
                                      <button
                                        onClick={() => updateActiveSceneBackdropScale(1)}
                                        className="text-[10px] font-semibold text-zinc-400 hover:text-[var(--lavDeep)] dark:hover:text-[var(--lavenderAccent)] cursor-pointer underline shrink-0 ml-0.5"
                                        title="Сбросить на 100%"
                                      >
                                        100%
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Remove Background Option */}
                              {(activeScene.backdropImage || (activeScene.backdropColor && activeScene.backdropColor !== '#F3F4F6')) && (
                                <button
                                  onClick={() => {
                                    const updated = scenes.map(s => s.id === activeScene.id ? { ...s, backdropImage: '', backdropColor: '#F3F4F6', backdropType: 'color' as const } : s);
                                    setScenes(updated);
                                    recordHistory(updated);
                                    setIsBackdropPopoverOpen(false);
                                    showToast('Фон сброшен', 'Фон возвращен к стандартному прозрачно-светлому.', 'info');
                                  }}
                                  className="w-full py-1.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-rose-200/50 dark:border-rose-800/40"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Удалить / сбросить фон</span>
                                </button>
                              )}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>

                    <button
                      onClick={() => setGridVisible(!gridVisible)}
                      style={gridVisible ? { background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' } : undefined}
                      className={`px-3.5 py-1.5 rounded-full font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95 ${
                        gridVisible
                          ? 'text-white'
                          : 'bg-white/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80 hover:bg-white dark:hover:bg-zinc-700'
                      }`}
                      title="Показать / скрыть сетку"
                    >
                      <Grid className="w-3.5 h-3.5 shrink-0" />
                      <span className="hidden sm:inline">Сетка</span>
                    </button>

                    <button
                      onClick={() => updateActiveSceneHuman({ humanVisible: !activeHumanVisible })}
                      style={activeHumanVisible ? { background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' } : undefined}
                      className={`px-3.5 py-1.5 rounded-full font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95 ${
                        activeHumanVisible
                          ? 'text-white'
                          : 'bg-white/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80 hover:bg-white dark:hover:bg-zinc-700'
                      }`}
                      title="Показать / скрыть силуэт человека"
                    >
                      <User className="w-3.5 h-3.5 shrink-0" />
                      <span className="hidden sm:inline">Человек</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* RIGHT COLUMN: CONTROL SIDE PANEL - DESKTOP & TABLET LANDSCAPE */}
        {!isRightToolbarCollapsed && (
          <div className="hidden landscape:md:flex xl:flex landscape:md:col-span-5 xl:col-span-4 flex-col bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs backdrop-blur-md h-full min-h-0 min-w-0 transition-all duration-300 animate-fadeIn">
            
            {/* TAB BAR SELECTORS WITH COLLAPSE BUTTON */}
            <div className="p-1.5 bg-zinc-100/90 dark:bg-zinc-900/60 rounded-full m-3 mb-0 flex items-center gap-1 border border-zinc-200/60 dark:border-zinc-800/60 shrink-0">
              <div className="flex-1 grid grid-cols-2 gap-1">
                <button
                  onClick={() => setActiveSidebarTab('library')}
                  className={`py-2 px-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeSidebarTab === 'library'
                      ? 'bg-[var(--lavenderSoft)] text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] shadow-xs border border-[var(--lavenderAccent)]/40'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Библиотека</span>
                </button>
                <button
                  onClick={() => setActiveSidebarTab('layers')}
                  className={`py-2 px-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeSidebarTab === 'layers'
                      ? 'bg-[var(--lavenderSoft)] text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] shadow-xs border border-[var(--lavenderAccent)]/40'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Элементы</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-[var(--lavDeep)] dark:bg-[var(--lavenderAccent)] text-white text-[9px] font-semibold leading-none shrink-0">
                    {activeScene.elements.filter(el => el.type !== 'measurement').length}
                  </span>
                </button>
              </div>
              <button
                onClick={() => setIsRightToolbarCollapsed(true)}
                className="p-1.5 rounded-full hover:bg-zinc-200/80 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer shrink-0"
                title="Свернуть боковую панель"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* TAB SCROLLABLE CONTENT BODY */}
            <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden p-3.5 space-y-3 min-w-0">
              {renderSidebarTabContent(activeSidebarTab)}
            </div>

          </div>
        )}

      {/* DETAILED PRINT SPECIFICATION ONLY */}
      <div className="hidden print:block bg-white text-zinc-900 p-8 space-y-8 min-h-screen">
        <div className="flex justify-between items-start pb-4 border-b-2 border-zinc-300">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Спецификация декора и фотозоны</h1>
            <p className="text-xs text-zinc-500 mt-1">Сгенерировано в интерактивном конструкторе арок. Проект: {currentProject?.name || 'Основной'}</p>
          </div>
          <div className="text-right text-xs">
            <p className="font-bold">Клиент: {currentProject?.clientName || 'Елизавета'}</p>
            <p className="text-zinc-500">Зал: {currentProject?.venue || 'Основной банкетный зал'}</p>
          </div>
        </div>

        {/* Visual mock */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500">1. Визуальный эскиз (2D Коллаж)</h2>
          <div className="w-full h-[320px] bg-zinc-100 rounded-xl border border-zinc-200 relative overflow-hidden flex items-center justify-center">
            {activeScene.backdropType === 'image' && activeScene.backdropImage ? (
              <img src={activeScene.backdropImage} className="absolute inset-0 w-full h-full object-cover opacity-60" referrerPolicy="no-referrer" />
            ) : (
              <div className="absolute inset-0" style={{ backgroundColor: activeScene.backdropColor }} />
            )}
            {activeScene.elements.map((el) => {
              if (!el.isVisible) return null;
              if (el.type === 'measurement' && !areMeasurementsVisible) return null;
              return (
                <div
                  key={el.id}
                  className="absolute"
                  style={{
                    left: `${el.x}px`,
                    top: `${el.y}px`,
                    width: `${el.w}px`,
                    height: `${el.h}px`,
                    transform: `rotate(${el.rotation}deg) scaleX(${el.isFlippedH ? -1 : 1})`,
                    transformOrigin: el.type === 'measurement' ? '0 50%' : 'center center',
                    opacity: el.opacity / 100
                  }}
                  dangerouslySetInnerHTML={{ __html: el.svgMarkup }}
                />
              );
            })}
          </div>
        </div>

        {/* Details Spec Table */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500">2. Перечень декораций и расчет стоимости</h2>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-zinc-300 text-zinc-500 bg-zinc-50">
                <th className="py-2 px-3">Наименование элемента</th>
                <th className="py-2 px-3">Код/Категория</th>
                <th className="py-2 px-3">Размеры</th>
                <th className="py-2 px-3 text-right">Стоимость</th>
              </tr>
            </thead>
            <tbody>
              {activeScene.elements.filter(el => el.type !== 'measurement').map((el) => (
                <tr key={el.id} className="border-b border-zinc-200">
                  <td className="py-2.5 px-3 font-semibold">{el.name}</td>
                  <td className="py-2.5 px-3 text-zinc-500">{el.type}</td>
                  <td className="py-2.5 px-3">{el.w * 10} x {el.h * 10} мм</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold">{el.price.toLocaleString('ru')} ₽</td>
                </tr>
              ))}
              <tr className="border-t-2 border-zinc-300 font-bold bg-zinc-50">
                <td colSpan={3} className="py-3 px-3 text-right uppercase">Итого спецификация:</td>
                <td className="py-3 px-3 text-right text-base text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] font-mono">{sceneTotalCost.toLocaleString('ru')} ₽</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>



      {/* ✨ ИИ ВИЗУАЛИЗАЦИЯ MODAL */}
      <AnimatePresence>
        {isAiModalOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            
            {/* Modal Glass Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAiModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />

            {/* Modal Body Card */}
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative w-full max-w-md bg-white/80 dark:bg-zinc-900/85 backdrop-blur-2xl rounded-[28px] border border-white/80 dark:border-zinc-700/80 shadow-2xl p-5 sm:p-6 overflow-hidden z-10 space-y-4"
              style={{
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[var(--lavenderSoft)] rounded-xl shrink-0">
                    <Sparkles className="w-5 h-5 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-base leading-tight">
                      ИИ-Визуализация концепта
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal">
                      Фотореалистичный 3D-макет с физикой света и теней
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAiModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress loader */}
              {isAiGenerating ? (
                <div className="py-8 text-center space-y-4">
                  <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
                    <RefreshCw className="w-10 h-10 text-[var(--lavDeep)] animate-spin" />
                    <Sparkles className="w-4 h-4 text-purple-400 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Нейросеть рендерит макет...</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
                      {activeScene.backdropType === 'image' && activeScene.backdropImage
                        ? 'Интегрируем декорации напрямую в ваш загруженный фон помещения.'
                        : 'Моделируем светлый интерьер помещения и рассчитываем глубокие мягкие тени.'}
                    </p>
                  </div>
                  
                  {/* Visual Progress percentage bar */}
                  <div className="space-y-1 max-w-xs mx-auto">
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[var(--lavDeep)] to-[var(--lavenderAccent)] h-full transition-all duration-300"
                        style={{ width: `${aiGeneratingProgress}%` }}
                      />
                    </div>
                    <p className="text-[10px] font-mono font-bold text-[var(--lavDeep)] dark:text-purple-300 text-right">
                      {aiGeneratingProgress}%
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-1">
                  
                  {/* BACKGROUND STATUS CARD */}
                  {(() => {
                    const hasCustomBg = activeScene.backdropType === 'image' && Boolean(activeScene.backdropImage);
                    const defaultBgPreview = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=300';
                    const displayImage = hasCustomBg ? activeScene.backdropImage : defaultBgPreview;

                    return (
                      <div className="p-3.5 bg-white/50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl overflow-hidden border border-zinc-200/80 dark:border-zinc-700/80 shrink-0 bg-zinc-100 dark:bg-zinc-800 relative">
                          <img
                            src={displayImage}
                            alt="Фон"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                              {hasCustomBg ? 'Ваш загруженный фон' : 'Пустой светлый белый зал'}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase ${
                              hasCustomBg
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                                : 'bg-[var(--lavenderSoft)] text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] border border-[var(--lavenderAccent)]/30'
                            }`}>
                              {hasCustomBg ? 'Свой фон' : 'По умолчанию'}
                            </span>
                          </div>

                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal leading-tight">
                            {hasCustomBg
                              ? 'Генерация произойдет с использованием вашего собственного загруженного фона.'
                              : 'Фон не загружен — композиция будет помещена в пустой светлый белый зал без сторонней мебели и декораций.'}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* PRESET PROMPT SUGGESTIONS */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-semibold uppercase text-zinc-400 tracking-wider">
                      <span>Стиль освещения и атмосфера</span>
                      <span className="text-zinc-400 font-normal">Необязательно</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {[
                        '☀️ Естественный дневной свет',
                        '🕯 Вечерний свет и свечи',
                        '✨ Панорамные окна',
                        '🌿 Мягкий рассеянный свет'
                      ].map(preset => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setAiPrompt(preset)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer border ${
                            aiPrompt === preset
                              ? 'bg-[var(--lavenderSoft)] text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] border-[var(--lavenderAccent)]/40 shadow-xs'
                              : 'bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200/60 dark:border-zinc-700/60 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Например: добавив естественные тени и теплое свечение..."
                      className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-[var(--lavDeep)]"
                    />
                  </div>

                  {/* NOTICE BOX */}
                  <div className="p-3 bg-emerald-500/10 dark:bg-emerald-950/30 rounded-2xl border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200 font-normal leading-relaxed flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-[11px]">
                      Нейросеть сбалансирует контрасты, добавит реалистичные тени от композиции на пол и сгенерирует готовый фото-рендер.
                    </p>
                  </div>

                  {/* GENERATE PRIMARY BUTTON */}
                  <button
                    onClick={handleStartAiGeneration}
                    style={{ background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' }}
                    className="w-full py-3 rounded-full text-white text-xs sm:text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
                  >
                    <Wand2 className="w-4 h-4 text-white fill-white" />
                    <span>Сгенерировать реалистичный рендер</span>
                  </button>

                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🌟 ИИ ВИЗУАЛИЗАЦИЯ RESULT PREVIEW MODAL */}
      <AnimatePresence>
        {isAiResultModalOpen && aiGeneratedResultUrl && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAiResultModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-[28px] border border-zinc-200 dark:border-zinc-800 shadow-2xl p-5 sm:p-6 overflow-hidden z-10 space-y-4 max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[var(--lavenderSoft)] rounded-xl shrink-0">
                    <Sparkles className="w-5 h-5 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base sm:text-lg leading-tight">
                      Результат ИИ-визуализации
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">
                      Готовый фотореалистичный 3D-макет с физикой света и теней
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAiResultModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Generated Image Box */}
              <div className="relative flex-1 min-h-0 bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 group flex items-center justify-center p-2">
                <img
                  src={aiGeneratedResultUrl}
                  alt="Результат визуализации"
                  className="w-full h-full max-h-[50vh] sm:max-h-[55vh] object-contain rounded-xl"
                />
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold text-white flex items-center gap-1.5 border border-white/20 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--lavenderAccent)]" />
                  <span>3D Фотореализм</span>
                </div>
              </div>

              {/* Info notice */}
              <div className="p-3 bg-emerald-500/10 dark:bg-emerald-950/30 rounded-2xl border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200 font-normal leading-relaxed flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    {activeScene.backdropType === 'image' && activeScene.backdropImage
                      ? 'Визуализация создана на базе вашего загруженного фона помещения.'
                      : 'Визуализация размещена в светлом белом зале без сторонних декораций.'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
                {/* Secondary Outline: Скачать */}
                <button
                  onClick={handleDownloadGeneratedResult}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-[var(--lavDeep)] text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] hover:bg-[var(--lavenderSoft)] text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Download className="w-4 h-4 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]" />
                  <span>Скачать</span>
                </button>

                {/* Primary Gradient: Сохранить в карточку проекта */}
                <button
                  onClick={handleSaveGeneratedToProject}
                  style={{ background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full text-white text-xs sm:text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
                >
                  <FolderPlus className="w-4 h-4 text-white" />
                  <span>Сохранить в карточку проекта</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ENLARGED ELEMENT PREVIEW & CONFIRMATION MODAL */}
      <AnimatePresence>
        {itemToPreview && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setItemToPreview(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="relative w-full max-w-md bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl rounded-3xl border border-white/80 dark:border-zinc-700/80 shadow-2xl p-6 overflow-hidden z-10 flex flex-col gap-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-zinc-800">
                <div>
                  <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
                    {itemToPreview.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Артикул / Код: <span className="font-mono font-semibold text-zinc-600 dark:text-zinc-300">{itemToPreview.code}</span>
                  </p>
                </div>
                <button
                  onClick={() => setItemToPreview(null)}
                  className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                  title="Закрыть окно"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Enlarged Vector Preview */}
              <div className="w-full h-64 bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 p-6 flex items-center justify-center relative overflow-hidden group">
                <div
                  className="w-full h-full flex items-center justify-center drop-shadow-md"
                  dangerouslySetInnerHTML={{ __html: itemToPreview.svgMarkup }}
                />
              </div>

              {/* Specifications/Details */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-[var(--lavenderSoft)]/50 dark:bg-zinc-800/40 p-3.5 rounded-2xl border border-[var(--lavenderAccent)]/20 dark:border-zinc-800">
                <div className={activeWorkspaceTab === 'floorplan' ? 'col-span-2' : ''}>
                  <span className="text-zinc-400 text-[11px] block font-medium">Габариты (Ш × В):</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {itemToPreview.width * 10} × {itemToPreview.height * 10} мм ({toDisplayValue(itemToPreview.width * 10)} × {toDisplayValue(itemToPreview.height * 10)} {activeUnit})
                  </span>
                </div>
                {activeWorkspaceTab !== 'floorplan' && (
                  <div>
                    <span className="text-zinc-400 text-[11px] block font-medium">Стоимость:</span>
                    <span className="font-semibold text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]">
                      {itemToPreview.price.toLocaleString('ru')} ₽
                    </span>
                  </div>
                )}
              </div>

              {/* Modal Buttons: Primary (Gradient) and Secondary (Outline 1px) */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-200/80 dark:border-zinc-800">
                <button
                  onClick={() => setItemToPreview(null)}
                  className="px-5 py-2.5 rounded-full text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer border border-zinc-300 dark:border-zinc-700 bg-transparent active:scale-95"
                >
                  Отмена
                </button>
                <button
                  onClick={() => {
                    handleAddElementToScene(itemToPreview);
                    setItemToPreview(null);
                  }}
                  style={{ background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' }}
                  className="px-6 py-2.5 rounded-full text-white text-xs font-semibold hover:opacity-90 transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>ОК</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CATEGORY ICON MANAGER MODAL */}
      <AnimatePresence>
        {showCategoryIconManager && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 rounded-[28px] p-6 max-w-xl w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-5 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[var(--lavenderSoft)] rounded-xl text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">Иконки категорий редактора</h3>
                    <p className="text-xs text-zinc-400">Настройка значков боковой панели</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCategoryIconManager(false)}
                  className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Instructions Box */}
              <div className="p-3.5 rounded-2xl bg-[var(--lavenderSoft)]/50 dark:bg-zinc-800/40 border border-[var(--lavenderAccent)]/20 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 space-y-1.5 shrink-0">
                <div className="font-semibold text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] flex items-center gap-1.5">
                  <Folder className="w-4 h-4" />
                  <span>Папка в проекте: /public/category-icons/</span>
                </div>
                <p className="leading-relaxed text-[11px]">
                  Вы можете поместить файлы своих иконок (в формате <strong>.svg</strong> или <strong>.png</strong>) в папку <code>/public/category-icons/</code> с соответствующими именами (напр. <code>favorites.svg</code>, <code>warehouse.svg</code>, <code>arches.svg</code>, <code>tables.svg</code> и др.).
                </p>
                <p className="leading-relaxed text-[11px]">
                  Также вы можете загрузить любую иконку прямо отсюда кнопкой «Загрузить».
                </p>
              </div>

              {/* Categories list */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {NEW_CATALOG_CATEGORIES.map((cat) => {
                  const hasCustom = !!localStorage.getItem(`cat_icon_${cat.id}`);
                  return (
                    <div key={cat.id} className="pt-2.5 first:pt-0 flex items-center justify-between text-xs gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-200/50 dark:border-zinc-700/50">
                          <CategoryIcon cat={cat} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">{cat.title}</div>
                          <div className="text-[10px] text-zinc-400 font-mono">/public/category-icons/{cat.id}.svg</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {hasCustom && (
                          <button
                            onClick={() => {
                              localStorage.removeItem(`cat_icon_${cat.id}`);
                              window.dispatchEvent(new Event('cat_icons_updated'));
                              showToast('Сброшено', `Иконка категории "${cat.title}" возвращена к файлу в папке/стандарту.`, 'info');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-600 dark:text-zinc-300 text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            Сбросить
                          </button>
                        )}
                        <label
                          style={{ background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' }}
                          className="px-3.5 py-1.5 rounded-full hover:opacity-90 text-white text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <Upload className="w-3 h-3" />
                          <span>Загрузить</span>
                          <input
                            type="file"
                            accept="image/svg+xml,image/png,image/jpeg"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  if (event.target?.result) {
                                    try {
                                      localStorage.setItem(`cat_icon_${cat.id}`, event.target.result as string);
                                    } catch (e) {
                                      console.warn('Failed to save category icon:', e);
                                    }
                                    window.dispatchEvent(new Event('cat_icons_updated'));
                                    showToast('Иконка обновлена', `Иконка категории "${cat.title}" сохранена.`, 'success');
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                <button
                  onClick={() => setShowCategoryIconManager(false)}
                  className="px-5 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 font-bold text-xs transition-colors cursor-pointer"
                >
                  Закрыть
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
