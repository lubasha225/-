import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Moon,
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
  Thermometer
} from 'lucide-react';
import { Project, EstimateItem } from '../types';
import { CATALOG_ASSETS, LibraryItem } from './editor/EditorLibraryData';
import FloorPlanSchema, { PlanElement } from './editor/FloorPlanSchema';

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
  isLocked: boolean;
  isVisible: boolean;
  isFlippedH: boolean;
  isFlippedV: boolean;
  svgMarkup: string;
  customImage?: string;
  groupId?: string;
  tintColor?: string;
  tintAmount?: number;
  tintMode?: 'color' | 'normal' | 'multiply' | 'overlay';
}

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
  { id: 'arches', title: 'Арки', icon: 'Layers' },
  { id: 'stands', title: 'Стойки', icon: 'Columns' },
  { id: 'tables', title: 'Столы', icon: 'Table' },
  { id: 'screens', title: 'Ширмы', icon: 'Grid' },
  { id: 'flowers', title: 'Цветы', icon: 'Flower2' },
  { id: 'compositions', title: 'Композиции', icon: 'Sparkles' },
  { id: 'vases', title: 'Вазы', icon: 'Tag' },
  { id: 'details', title: 'Детали', icon: 'Compass' },
  { id: 'textiles', title: 'Текстиль', icon: 'Layers' },
  { id: 'light', title: 'Свет', icon: 'Lightbulb' },
  { id: 'podiums', title: 'Подиумы', icon: 'Columns' },
  { id: 'furniture', title: 'Мебель', icon: 'Bookmark' },
  { id: 'balloons', title: 'Шары', icon: 'CircleDot' },
  { id: 'themes', title: 'Тематика', icon: 'Tag' }
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

  if (!imgError && iconSrc) {
    return (
      <img
        src={iconSrc}
        alt={cat.title}
        onError={() => setImgError(true)}
        className="w-4 h-4 object-contain transition-transform group-hover:scale-110"
      />
    );
  }

  // Fallback to default Lucide icons
  switch (cat.id) {
    case 'favorites': return <Heart className={`w-4 h-4 ${isSelected ? 'fill-[#5B3E88] text-[#5B3E88]' : 'text-rose-500 fill-rose-500'}`} />;
    case 'warehouse': return <Box className="w-4 h-4 text-amber-500" />;
    case 'arches': return <Layers className="w-4 h-4 text-indigo-500" />;
    case 'stands': return <Columns className="w-4 h-4 text-cyan-500" />;
    case 'tables': return <TableIcon className="w-4 h-4 text-emerald-500" />;
    case 'screens': return <GridIcon className="w-4 h-4 text-blue-500" />;
    case 'flowers': return <Flower2 className="w-4 h-4 text-pink-500" />;
    case 'compositions': return <Sparkles className="w-4 h-4 text-amber-400" />;
    case 'vases': return <Tag className="w-4 h-4 text-purple-500" />;
    case 'details': return <Compass className="w-4 h-4 text-teal-500" />;
    case 'textiles': return <AlignLeft className="w-4 h-4 text-sky-500" />;
    case 'light': return <Lightbulb className="w-4 h-4 text-yellow-500" />;
    case 'podiums': return <Columns className="w-4 h-4 text-orange-500" />;
    case 'furniture': return <Bookmark className="w-4 h-4 text-violet-500" />;
    case 'balloons': return <CircleDot className="w-4 h-4 text-rose-400" />;
    case 'themes': return <Sparkles className="w-4 h-4 text-emerald-600" />;
    default: return <Tag className="w-4 h-4 text-purple-500" />;
  }
};

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
  const [activeProjectId, setActiveProjectId] = useState<string>(initialProjectId || projects[0]?.id || '');

  useEffect(() => {
    if (initialProjectId) {
      setActiveProjectId(initialProjectId);
    }
  }, [initialProjectId]);
  const currentProject = projects.find(p => p.id === activeProjectId);

  // Core Scenes for the 2D collage workspace
  const [scenes, setScenes] = useState<EditorScene[]>(() => {
    const proj = projects.find(p => p.id === (initialProjectId || projects[0]?.id || ''));
    if (proj?.scenesData && proj.scenesData.length > 0) {
      return proj.scenesData;
    }
    return [
      {
        id: 'scene-1',
        name: 'Визуализация 1',
        elements: [],
        backdropImage: '',
        backdropColor: '#F3F4F6',
        backdropType: 'color'
      }
    ];
  });

  const activeSceneIndex = scenes.findIndex(s => s.id === activeWorkspaceTab);
  const activeScene = activeSceneIndex !== -1 ? scenes[activeSceneIndex] : (scenes[0] || { id: 'scene-1', name: 'Визуализация 1', elements: [], backdropImage: '', backdropColor: '#F3F4F6', backdropType: 'color' });

  const handleAddNewScene = () => {
    const newSceneNum = scenes.length + 1;
    const newSceneId = `scene-${Date.now()}`;
    const newScene: EditorScene = {
      id: newSceneId,
      name: `Визуализация ${newSceneNum}`,
      elements: [],
      backdropImage: '',
      backdropColor: '#F3F4F6',
      backdropType: 'color'
    };
    setScenes(prev => [...prev, newScene]);
    setActiveWorkspaceTab(newSceneId);
    setIsVisualizationsDropdownOpen(false);
    showToast('Новая визуализация', `Создана Виз. ${newSceneNum}`, 'info');
  };

  // Seating Arrangement Floor Plan
  const [floorPlanElements, setFloorPlanElements] = useState<PlanElement[]>(() => {
    const proj = projects.find(p => p.id === (initialProjectId || projects[0]?.id || ''));
    return proj?.floorPlanData || [];
  });

  // Track loaded project ID to re-sync canvas scenes when changing active project
  const loadedProjectIdRef = useRef<string | null>(initialProjectId || projects[0]?.id || null);

  useEffect(() => {
    if (!activeProjectId) return;
    if (loadedProjectIdRef.current !== activeProjectId) {
      loadedProjectIdRef.current = activeProjectId;
      const proj = projects.find(p => p.id === activeProjectId);
      if (proj) {
        if (proj.scenesData && proj.scenesData.length > 0) {
          setScenes(proj.scenesData);
          if (!proj.scenesData.some(s => s.id === activeWorkspaceTab)) {
            setActiveWorkspaceTab(proj.scenesData[0].id);
          }
        } else {
          setScenes([
            {
              id: 'scene-1',
              name: 'Визуализация 1',
              elements: [],
              backdropImage: '',
              backdropColor: '#F3F4F6',
              backdropType: 'color'
            }
          ]);
          setActiveWorkspaceTab('scene-1');
        }

        if (proj.floorPlanData) {
          setFloorPlanElements(proj.floorPlanData);
        } else {
          setFloorPlanElements([]);
        }
      }
    }
  }, [activeProjectId, projects, activeWorkspaceTab]);

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
  const [activeFilterTool, setActiveFilterTool] = useState<'brightness' | 'contrast' | 'saturate' | 'hue' | 'opacity' | 'temp' | 'zoom' | 'recolor' | null>(null);
  const [mobileDrawerTab, setMobileDrawerTab] = useState<'library' | 'layers' | null>(null);
  const [isBackdropPopoverOpen, setIsBackdropPopoverOpen] = useState<boolean>(false);

  // Collapsible toolbars states
  const [isLeftToolbarCollapsed, setIsLeftToolbarCollapsed] = useState<boolean>(false);
  const [isRightToolbarCollapsed, setIsRightToolbarCollapsed] = useState<boolean>(false);

  // Undo/Redo Stacking
  const [history, setHistory] = useState<EditorScene[][]>([JSON.parse(JSON.stringify(scenes))]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Library Category filtering
  const [selectedCategory, setSelectedCategory] = useState<string>('arches');
  const [libSearch, setLibSearch] = useState<string>('');
  const [favoritesList, setFavoritesList] = useState<string[]>(['text-1', 'arch-1']);
  const [showCategoryIconManager, setShowCategoryIconManager] = useState<boolean>(false);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Canvas Dimension Configurations
  const [canvasWidthMm, setCanvasWidthMm] = useState<number>(6500);
  const [canvasHeightMm, setCanvasHeightMm] = useState<number>(4400);
  const [gridVisible, setGridVisible] = useState<boolean>(true);
  const [humanVisible, setHumanVisible] = useState<boolean>(true);
  const [humanPos, setHumanPos] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingHuman, setIsDraggingHuman] = useState<boolean>(false);
  const [activeUnit, setActiveUnit] = useState<'mm' | 'cm' | 'm'>('cm');

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

  // General references
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic scaling state for canvas auto-fit
  const [canvasScale, setCanvasScale] = useState<number>(1);

  useEffect(() => {
    const updateScale = () => {
      if (!viewportRef.current) return;
      const parentWidth = viewportRef.current.clientWidth - 24;
      const parentHeight = viewportRef.current.clientHeight - 24;
      
      const canvasWidth = canvasWidthMm / 10;
      const canvasHeight = canvasHeightMm / 10;
      
      const scaleW = parentWidth / canvasWidth;
      const scaleH = parentHeight / canvasHeight;
      
      // Calculate a comfortable scale to fit the canvas inside the viewport
      const newScale = Math.min(scaleW, scaleH, 2.5);
      setCanvasScale(newScale > 0.1 ? newScale : 1);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    
    // Also use ResizeObserver to catch any layout changes (like sidebars expanding/collapsing)
    let observer: ResizeObserver | null = null;
    if (viewportRef.current) {
      observer = new ResizeObserver(() => {
        updateScale();
      });
      observer.observe(viewportRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateScale);
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

  // Dynamic cost summary
  const sceneTotalCost = activeScene.elements.reduce((sum, el) => sum + (el.isVisible ? el.price : 0), 0);

  // Library listing helper
  const getCategoryItems = (): LibraryItem[] => {
    let baseList: LibraryItem[] = [];
    
    if (selectedCategory === 'favorites') {
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
      const custom = CUSTOM_LIBRARY_ITEMS.filter(i => i.category === selectedCategory);
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
        case 'arches':
          assetItems = CATALOG_ASSETS.arches || [];
          break;
        case 'stands':
          assetItems = CATALOG_ASSETS.stands || [];
          break;
        case 'tables':
          assetItems = CATALOG_ASSETS.tables || [];
          break;
        case 'flowers':
          assetItems = CATALOG_ASSETS.flowers || [];
          break;
        case 'balloons':
          assetItems = CATALOG_ASSETS.balloons || [];
          break;
        case 'vases':
          assetItems = (CATALOG_ASSETS.decor || []).filter(i => i.name.toLowerCase().includes('ваз') || i.id.toLowerCase().includes('vase'));
          break;
        case 'details':
          assetItems = (CATALOG_ASSETS.decor || []).filter(i => !i.name.toLowerCase().includes('ваз') && !i.id.toLowerCase().includes('vase'));
          break;
        case 'textiles':
          assetItems = CATALOG_ASSETS.textiles || [];
          break;
        case 'light':
          assetItems = CATALOG_ASSETS.light || [];
          break;
        default:
          break;
      }
      baseList = [...custom, ...assetItems];
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
    
    // Spawn in Center of Canvas Workspace
    const newEl: CanvasElement = {
      id: `${item.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: item.name,
      type: item.category,
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
      svgMarkup: item.svgMarkup
    };

    updateActiveSceneElements(prev => [...prev, newEl]);
    setSelectedId(newEl.id);
    showToast('Добавлено', `Элемент "${item.name}" добавлен на сцену.`, 'success');
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

  // AI Background simulation
  const handleStartAiGeneration = () => {
    if (!aiPrompt.trim()) {
      showToast('Запрос пуст', 'Пожалуйста, опишите словами желаемый интерьер.', 'warn');
      return;
    }
    setIsAiGenerating(true);
    setAiGeneratingProgress(10);
    
    const interval = setInterval(() => {
      setAiGeneratingProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 20;
      });
    }, 450);

    setTimeout(() => {
      clearInterval(interval);
      setAiGeneratingProgress(100);
      
      // Select standard photo based on prompt
      const text = aiPrompt.toLowerCase();
      let selectedBg = 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1200'; // fallback banquet
      
      if (text.includes('лофт') || text.includes('кирпич')) {
        selectedBg = 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&q=80&w=1200';
      } else if (text.includes('дворец') || text.includes('классик') || text.includes('белый')) {
        selectedBg = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200';
      } else if (text.includes('лес') || text.includes('природа') || text.includes('зелен')) {
        selectedBg = 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=1200';
      } else if (text.includes('пляж') || text.includes('море') || text.includes('песок')) {
        selectedBg = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200';
      }

      handleCanvasBackdropChange('image', selectedBg);
      if (onAddAiImage) {
        onAddAiImage(selectedBg, aiPrompt, currentProject?.name || 'Основной проект');
      }
      setIsAiGenerating(false);
      setIsAiModalOpen(false);
      setAiPrompt('');
      showToast('ИИ генерация завершена', 'Фон обновлен и автоматически сохранен в «Мои изображения» в раздел ИИ.', 'success');
    }, 2400);
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

      const estimateItems: EstimateItem[] = (activeScene?.elements || []).map((el) => ({
        id: el.id,
        name: el.name,
        category: el.type,
        quantity: 1,
        price: el.price,
        comment: el.comment || 'Сгенерировано в 2D арках',
        photoUrl: el.customImage || ''
      }));

      onSaveToProject(activeProjectId, previewUrl, estimateItems, sceneTotalCost, scenes, floorPlanElements);

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
  const [activeAction, setActiveAction] = useState<'move' | 'resize' | 'rotate' | 'move-group' | null>(null);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [rotationInputId, setRotationInputId] = useState<string | null>(null);

  const rotateClickStartRef = useRef({ x: 0, y: 0, time: 0 });
  
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

    if (activeAction === 'move-group') {
      const dx = (e.clientX - dragGroupStartRef.current.mouseX) / canvasScale;
      const dy = (e.clientY - dragGroupStartRef.current.mouseY) / canvasScale;

      setScenes(prev => prev.map(s => {
        if (s.id === activeScene.id) {
          return {
            ...s,
            elements: s.elements.map(el => {
              const initial = dragGroupStartRef.current.items.find(i => i.id === el.id);
              if (initial) {
                return {
                  ...el,
                  x: Math.max(0, Math.min(canvasWidthMm / 10 - el.w, initial.x + dx)),
                  y: Math.max(0, Math.min(canvasHeightMm / 10 - el.h, initial.y + dy))
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
      
      setScenes(prev => prev.map(s => {
        if (s.id === activeScene.id) {
          return {
            ...s,
            elements: s.elements.map(el => {
              if (el.id === selectedId) {
                return {
                  ...el,
                  x: Math.max(0, Math.min(canvasWidthMm / 10 - el.w, dragStartRef.current.elX + dx)),
                  y: Math.max(0, Math.min(canvasHeightMm / 10 - el.h, dragStartRef.current.elY + dy))
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
                return {
                  ...item,
                  w: Math.round(finalW),
                  h: Math.round(finalH),
                  x: Math.round(nextX),
                  y: Math.round(nextY)
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
      recordHistory(scenes);
    }
  };

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
            onClick={() => setIsAiModalOpen(true)}
            style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
            className="flex items-center justify-center gap-1.5 px-3.5 h-9 rounded-full text-white text-xs font-bold hover:opacity-90 transition-all shadow-md shadow-[#582F89]/20 cursor-pointer whitespace-nowrap shrink-0 border border-purple-300/20 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-white fill-white animate-pulse" />
            <span className="whitespace-nowrap">ИИ макет</span>
          </button>
          
          <button
            onClick={() => handleSaveProjectCollage(false)}
            disabled={isSaving}
            title="Автосохранение каждые 5 мин. Нажмите для ручного сохранения."
            className={`flex items-center justify-center gap-1.5 px-3.5 h-9 rounded-full text-xs font-semibold transition-all shadow-xs cursor-pointer whitespace-nowrap shrink-0 border ${
              isSaving
                ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300'
                : 'bg-white dark:bg-zinc-900 hover:bg-zinc-50 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200'
            }`}
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 animate-spin shrink-0" />
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
  }, [setHeaderActions, activeProjectId, projects, showToast, onBackToProjectCard]);

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
              <div className="flex flex-col gap-1.5 p-1 bg-zinc-100/90 dark:bg-zinc-900/80 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shrink-0 overflow-y-auto overflow-x-hidden max-h-full scrollbar-none shadow-2xs">
                {NEW_CATALOG_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <div key={cat.id} className="relative group">
                      <button
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setLibSearch('');
                        }}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-[#EAE4F8] text-[#5B3E88] border-[#D4C5ED] dark:bg-purple-950 dark:text-purple-200 dark:border-purple-800 shadow-xs scale-105'
                            : 'bg-white/80 dark:bg-zinc-800/80 border-transparent text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 hover:shadow-2xs'
                        }`}
                        title={cat.title}
                      >
                        <CategoryIcon cat={cat} isSelected={isSelected} />
                      </button>

                      {/* Hover Tooltip showing category name */}
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 dark:bg-zinc-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-lg whitespace-nowrap border border-zinc-700/50">
                        {cat.title}
                      </div>
                    </div>
                  );
                })}

                {/* Button to manage category icons */}
                <div className="relative group pt-1 border-t border-zinc-200/60 dark:border-zinc-800 mt-1">
                  <button
                    onClick={() => setShowCategoryIconManager(true)}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer bg-white/60 dark:bg-zinc-800/60 text-zinc-400 hover:text-[#5B3E88] dark:hover:text-purple-300 hover:bg-white dark:hover:bg-zinc-800 border border-transparent hover:border-purple-200/50"
                    title="Управление иконками категорий (папка /public/category-icons/)"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 dark:bg-zinc-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-lg whitespace-nowrap border border-zinc-700/50">
                    Управление иконками
                  </div>
                </div>
              </div>

              {/* CARDS GRID AREA */}
              <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden max-h-full scrollbar-none pr-1">
                <div className="grid grid-cols-2 md:portrait:grid-cols-2 md:landscape:grid-cols-3 lg:grid-cols-4 lg:landscape:grid-cols-4 xl:grid-cols-4 gap-1.5 sm:gap-2">
                  {/* Plus item custom upload button */}
                  <label className="group relative aspect-square w-full rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-[#5B3E88] bg-white/60 dark:bg-zinc-900/60 cursor-pointer transition-all shadow-2xs flex flex-col items-center justify-center p-2 text-center">
                    <div className="w-8 h-8 rounded-full bg-[#EAE4F8] dark:bg-purple-950/80 text-[#5B3E88] dark:text-purple-300 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">Загрузить</span>
                    <input
                      type="file"
                      accept="image/png"
                      onChange={handleCustomPngUpload}
                      className="hidden"
                    />
                  </label>

                  {getCategoryItems().map((item) => {
                    const isFav = favoritesList.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleAddElementToScene(item)}
                        className="group relative aspect-square w-full rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#5B3E88] hover:shadow-md cursor-pointer transition-all p-1.5 flex items-center justify-center overflow-hidden"
                        title={item.name}
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
                              handleAddElementToScene(item);
                            }}
                            className="p-1 rounded-full bg-[#EAE4F8] dark:bg-purple-950 text-[#5B3E88] dark:text-purple-300 hover:scale-110 transition-transform cursor-pointer pointer-events-auto shadow-2xs"
                            title="Добавить на сцену"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Element Vector preview */}
                        <div className="w-full h-full p-2.5 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: item.svgMarkup }} />
                        </div>

                        {/* Title Caption overlay on hover */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/80 to-transparent p-1.5 pt-4 text-center opacity-0 group-hover:opacity-100 transition-opacity">
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
        {targetTab === 'layers' && (
          <div className="flex flex-col gap-2 flex-1 min-h-0 min-w-0 overflow-x-hidden">
            <div className="flex items-center justify-between px-1 shrink-0">
              <span className="text-xs font-bold text-zinc-500">Слои декора ({activeScene.elements.length})</span>
              <span className="text-[10px] text-zinc-400">Перетащите для порядка</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-0">
              {activeScene.elements.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-400 space-y-2">
                  <Box className="w-6 h-6 mx-auto text-zinc-300 dark:text-zinc-700" />
                  <p>На сцене пока нет декораций.</p>
                  <p className="text-[10px] text-zinc-400">Выберите элемент из Библиотеки слева для размещения.</p>
                </div>
              ) : (
                [...activeScene.elements].reverse().map((el, revIdx) => {
                  const actualIdx = activeScene.elements.length - 1 - revIdx;
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
                          ? 'border-[#5B3E88] dark:border-purple-400 border-2 bg-purple-50/80 dark:bg-purple-950/50 scale-[1.01]'
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
                          <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 mr-0.5">
                            {el.price > 0 ? `${el.price.toLocaleString('ru')} ₽` : '0 ₽'}
                          </span>

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
            <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800 shrink-0 mt-auto">
              <div className="p-3 rounded-2xl bg-[#EAE4F8]/80 dark:bg-purple-950/60 border border-[#D4C5ED]/80 dark:border-purple-800/60 flex items-center justify-between shadow-2xs">
                <div className="flex flex-col">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Итого элементов ({activeScene.elements.length})
                  </span>
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    Общая стоимость
                  </span>
                </div>
                <span className="text-sm font-black text-[#5B3E88] dark:text-purple-300 font-mono">
                  {activeScene.elements.reduce((sum, item) => sum + (item.price || 0), 0).toLocaleString('ru')} ₽
                </span>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="flex-1 min-h-0 min-w-0 h-full pb-0.5 print:pb-0 grid grid-cols-1 md:grid-cols-12 gap-1.5 sm:gap-3 print:hidden" onMouseMove={handleCanvasMouseMove} onMouseUp={handleCanvasMouseUp}>
      {/* Hidden File Input for Backdrop Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUploadCanvasBackdrop}
        className="hidden"
        accept="image/*"
      />
      
      {/* LEFT COLUMN: ACTIVE WORKSPACE & HEADER (70% WIDTH) */}
      <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-1 sm:gap-2.5 h-full min-h-0 min-w-0">

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
                    ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border-emerald-200/80 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300'
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 animate-spin shrink-0" />
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
                onClick={() => setIsAiModalOpen(true)}
                title="ИИ Генератор макета"
                aria-label="ИИ макет"
                style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
                className="h-9 sm:h-10 px-3.5 sm:px-4 rounded-full text-white flex items-center gap-1.5 shadow-md shadow-[#582F89]/20 cursor-pointer shrink-0 hover:opacity-90 active:scale-95 transition-all border border-purple-300/20 font-bold text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-white fill-white shrink-0 animate-pulse drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
                <span className="hidden sm:inline">ИИ макет</span>
                <span className="sm:hidden text-[11px]">ИИ</span>
              </button>

              {mobileNavButton && (
                <div className="md:hidden shrink-0">
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
            {activeWorkspaceTab === 'floorplan' ? (
              <div className="glass-panel rounded-3xl overflow-hidden h-full min-h-0 min-w-0">
                <FloorPlanSchema
                  initialElements={floorPlanElements}
                  onSave={setFloorPlanElements}
                  showToast={showToast}
                />
              </div>
            ) : (
              // COLLAGE CONSTRUCTOR STAGE WITH AUTO-SCALING VIEWPORT
              <div
                ref={viewportRef}
                onMouseDown={handleViewportMouseDown}
                className={`relative bg-zinc-950/60 dark:bg-black/40 rounded-3xl overflow-hidden flex items-center justify-center flex-1 h-[380px] sm:h-full min-h-[380px] sm:min-h-0 min-w-0 w-full border border-zinc-200/20 dark:border-zinc-800/20 select-none ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
              >
                {/* Floating Top-Left Scene Tabs Overlay (Matches Reference Screenshot 2 - Touch Friendly) */}
                <div className="absolute top-1.5 left-1.5 z-20 flex items-center gap-1 bg-white/80 dark:bg-black/50 backdrop-blur-md p-1 rounded-full border border-white/90 dark:border-zinc-800 shadow-md">
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
                      className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeWorkspaceTab !== 'floorplan'
                          ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/80'
                          : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900'
                      }`}
                    >
                      <span>
                        {activeWorkspaceTab === 'floorplan'
                          ? 'Визуализация'
                          : (activeScene?.name.startsWith('Визуализация')
                              ? activeScene.name.replace('Визуализация', 'Виз.')
                              : (activeScene?.name || 'Виз. 1'))}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${isVisualizationsDropdownOpen ? 'rotate-180' : ''}`} />
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
                            <div className="text-[10px] uppercase font-extrabold tracking-wider text-zinc-400 px-2.5 py-1">
                              Созданные визуализации
                            </div>
                            {scenes.map((scene) => {
                              const isSelected = activeWorkspaceTab === scene.id;
                              const displayName = scene.name.startsWith('Визуализация') ? scene.name.replace('Визуализация', 'Виз.') : scene.name;
                              return (
                                <button
                                  key={scene.id}
                                  onClick={() => {
                                    setActiveWorkspaceTab(scene.id);
                                    setIsVisualizationsDropdownOpen(false);
                                  }}
                                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                                    isSelected
                                      ? 'bg-[var(--lavDeep)] text-white shadow-xs'
                                      : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <Layout className="w-3.5 h-3.5 opacity-70" />
                                    <span>{displayName}</span>
                                  </div>
                                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                                </button>
                              );
                            })}

                            <div className="h-px bg-zinc-200/80 dark:bg-zinc-800 my-1" />

                            <button
                              onClick={handleAddNewScene}
                              className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold text-[var(--lavDeep)] dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-all flex items-center gap-2 cursor-pointer"
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
                    className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      activeWorkspaceTab === 'floorplan'
                        ? 'bg-[var(--lavDeep)] text-white shadow-xs'
                        : 'bg-[#A888DB]/80 text-white hover:bg-[#A888DB]'
                    }`}
                  >
                    <span>Схема</span>
                  </button>
                </div>

                {/* FLOATING TOP UNDO/REDO PILL */}
                <div className="absolute top-1.5 right-1.5 sm:right-2 z-30 pointer-events-auto">
                  <div className="p-0.5 sm:p-1 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-md border border-white/80 dark:border-zinc-700/60 flex items-center gap-1">
                    <button
                      onClick={handleUndo}
                      disabled={historyIndex <= 0}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 dark:bg-zinc-800/90 text-[#5B3E88] dark:text-purple-300 hover:bg-white hover:shadow-md flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:hover:shadow-none active:scale-95"
                      title="Отменить действие (Undo)"
                    >
                      <RotateCcw className="w-3.5 h-3.5 stroke-[2.2]" />
                    </button>

                    <button
                      onClick={handleRedo}
                      disabled={historyIndex >= history.length - 1}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 dark:bg-zinc-800/90 text-[#5B3E88] dark:text-purple-300 hover:bg-white hover:shadow-md flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:hover:shadow-none active:scale-95"
                      title="Повторить действие (Redo)"
                    >
                      <RotateCw className="w-3.5 h-3.5 stroke-[2.2]" />
                    </button>
                  </div>
                </div>

                {/* FLOATING ACTION TOOLBAR (LEFT POSITION BELOW TOP SCENE TABS) */}
                <div className="absolute top-13 sm:top-14 left-1.5 z-30 flex flex-col items-start pointer-events-none">
                  
                  {isLeftToolbarCollapsed ? (
                    /* COLLAPSED SINGLE BUTTON */
                    <div className="p-1 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-lg border border-white/80 dark:border-zinc-700/60 flex flex-col items-center pointer-events-auto animate-fadeIn">
                      <button
                        onClick={() => setIsLeftToolbarCollapsed(false)}
                        className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full bg-[var(--lavDeep)] text-white hover:bg-[#4a3271] flex items-center justify-center shadow-md cursor-pointer transition-all active:scale-95"
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
                            : 'bg-white/90 dark:bg-zinc-800/90 text-[#5B3E88] dark:text-purple-300 hover:bg-white hover:shadow-md'
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
                        }}
                        className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                          activeToolPopover === 'group'
                            ? 'bg-[var(--lavDeep)] text-white shadow-md'
                            : 'bg-white/90 dark:bg-zinc-800/90 text-[#5B3E88] dark:text-purple-300 hover:bg-white hover:shadow-md'
                        }`}
                        title="Группировка элементов"
                      >
                        <Group className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                      </button>

                      {/* Popover Group / Ungroup */}
                      {activeToolPopover === 'group' && (
                        <div
                          className="absolute left-10 sm:left-11 top-0 z-50 bg-white/45 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 border border-white/80 dark:border-zinc-700/80 p-2 rounded-2xl shadow-xl shadow-purple-950/10 flex flex-col gap-1 min-w-[175px] animate-fadeIn select-none"
                          style={{
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                            backgroundColor: 'rgba(255, 255, 255, 0.45)'
                          }}
                        >
                          <div className="flex items-center justify-between px-1 pb-1 border-b border-purple-200/50 dark:border-zinc-800 text-[11px] font-bold text-[#5B3E88] dark:text-purple-300">
                            <span>Группировка</span>
                            <button
                              onClick={() => setActiveToolPopover(null)}
                              className="p-1 rounded-full hover:bg-purple-500/20 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                              title="Закрыть"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            onClick={() => {
                              handleGroupSelectedElements();
                              setActiveToolPopover(null);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-purple-100/80 dark:hover:bg-purple-900/40 hover:text-[var(--lavDeep)] dark:hover:text-purple-300 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Group className="w-4 h-4 text-[var(--lavDeep)] dark:text-purple-400" />
                            <span>Сгруппировать</span>
                          </button>
                          <button
                            onClick={() => {
                              handleUngroupSelectedElements();
                              setActiveToolPopover(null);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-purple-100/80 dark:hover:bg-purple-900/40 hover:text-[var(--lavDeep)] dark:hover:text-purple-300 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Ungroup className="w-4 h-4 text-[var(--lavDeep)] dark:text-purple-400" />
                            <span>Разгруппировать</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 3. Копировать */}
                    <button
                      onClick={() => {
                        if (selectedIds.length > 1) {
                          const selectedElements = activeScene.elements.filter(el => selectedIds.includes(el.id) && el.isVisible);
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
                          showToast('Копирование группы', `Скопировано ${selectedElements.length} элементов`, 'success');
                        } else if (selectedId) {
                          const elem = activeScene.elements.find(el => el.id === selectedId);
                          if (elem) {
                            const dup = { ...elem, id: `${elem.type}-${Date.now()}`, x: elem.x + 20, y: elem.y + 20 };
                            updateActiveSceneElements(els => [...els, dup]);
                            setSelectedId(dup.id);
                            showToast('Копирование', 'Элемент продублирован', 'success');
                          }
                        } else {
                          showToast('Выберите элементы', 'Кликните на элемент или нажмите «Выбрать все»', 'info');
                        }
                      }}
                      className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full bg-white/90 dark:bg-zinc-800/90 text-[#5B3E88] dark:text-purple-300 hover:bg-white hover:shadow-md flex items-center justify-center transition-all cursor-pointer active:scale-95"
                      title="Копировать"
                    >
                      <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                    </button>

                    {/* 4. Слои */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          setActiveToolPopover(prev => prev === 'layers' ? null : 'layers');
                          setActiveFilterTool(null);
                        }}
                        className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                          activeToolPopover === 'layers'
                            ? 'bg-[var(--lavDeep)] text-white shadow-md'
                            : 'bg-white/90 dark:bg-zinc-800/90 text-[#5B3E88] dark:text-purple-300 hover:bg-white hover:shadow-md'
                        }`}
                        title="Слои элементов"
                      >
                        <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                      </button>

                      {/* Popover Layers */}
                      {activeToolPopover === 'layers' && (
                        <div
                          className="absolute left-10 sm:left-11 top-0 z-50 bg-white/45 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 border border-white/80 dark:border-zinc-700/80 p-2 rounded-2xl shadow-xl shadow-purple-950/10 flex flex-col gap-1 min-w-[175px] animate-fadeIn select-none"
                          style={{
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                            backgroundColor: 'rgba(255, 255, 255, 0.45)'
                          }}
                        >
                          <div className="flex items-center justify-between px-1 pb-1 border-b border-purple-200/50 dark:border-zinc-800 text-[11px] font-bold text-[#5B3E88] dark:text-purple-300">
                            <span>Порядок слоев</span>
                            <button
                              onClick={() => setActiveToolPopover(null)}
                              className="p-1 rounded-full hover:bg-purple-500/20 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                              title="Закрыть"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
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
                            className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-purple-50 dark:hover:bg-purple-900/40 hover:text-[var(--lavDeep)] dark:hover:text-purple-300 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <ArrowUpToLine className="w-4 h-4 text-[var(--lavDeep)] dark:text-purple-400" />
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
                            className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-purple-50 dark:hover:bg-purple-900/40 hover:text-[var(--lavDeep)] dark:hover:text-purple-300 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <ArrowUp className="w-4 h-4 text-[var(--lavDeep)] dark:text-purple-400" />
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
                            className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-purple-50 dark:hover:bg-purple-900/40 hover:text-[var(--lavDeep)] dark:hover:text-purple-300 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <ArrowDown className="w-4 h-4 text-[var(--lavDeep)] dark:text-purple-400" />
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
                            className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-purple-50 dark:hover:bg-purple-900/40 hover:text-[var(--lavDeep)] dark:hover:text-purple-300 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <ArrowDownToLine className="w-4 h-4 text-[var(--lavDeep)] dark:text-purple-400" />
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
                        }}
                        className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                          activeToolPopover === 'flip'
                            ? 'bg-[var(--lavDeep)] text-white shadow-md'
                            : 'bg-white/90 dark:bg-zinc-800/90 text-[#5B3E88] dark:text-purple-300 hover:bg-white hover:shadow-md'
                        }`}
                        title="Отразить элемент"
                      >
                        <FlipHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                      </button>

                      {/* Popover Flip */}
                      {activeToolPopover === 'flip' && (
                        <div
                          className="absolute left-10 sm:left-11 top-0 z-50 bg-white/45 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 border border-white/80 dark:border-zinc-700/80 p-2 rounded-2xl shadow-xl shadow-purple-950/10 flex flex-col gap-1 min-w-[175px] animate-fadeIn select-none"
                          style={{
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                            backgroundColor: 'rgba(255, 255, 255, 0.45)'
                          }}
                        >
                          <div className="flex items-center justify-between px-1 pb-1 border-b border-purple-200/50 dark:border-zinc-800 text-[11px] font-bold text-[#5B3E88] dark:text-purple-300">
                            <span>Отражение</span>
                            <button
                              onClick={() => setActiveToolPopover(null)}
                              className="p-1 rounded-full hover:bg-purple-500/20 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                              title="Закрыть"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            onClick={() => {
                              if (selectedId) {
                                updateActiveSceneElements(els => els.map(el => el.id === selectedId ? { ...el, isFlippedH: !el.isFlippedH } : el));
                                showToast('Отражение', 'Отражено по горизонтали', 'info');
                              } else showToast('Выберите элемент', 'Кликните на элемент', 'info');
                              setActiveToolPopover(null);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-purple-100/80 dark:hover:bg-purple-900/40 hover:text-[var(--lavDeep)] dark:hover:text-purple-300 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <FlipHorizontal className="w-4 h-4 text-[var(--lavDeep)] dark:text-purple-400" />
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
                            className="w-full px-2.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-purple-100/80 dark:hover:bg-purple-900/40 hover:text-[var(--lavDeep)] dark:hover:text-purple-300 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <FlipVertical className="w-4 h-4 text-[var(--lavDeep)] dark:text-purple-400" />
                            <span>По вертикали</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 6. Корзина (Удалить) */}
                    <button
                      onClick={() => {
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
                      }}
                      className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full bg-rose-500 text-white hover:bg-rose-600 flex items-center justify-center shadow-md cursor-pointer transition-all active:scale-95"
                      title="Удалить выбранный элемент"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                    </button>
                  </div>
                  )}
                </div>

                {/* BOTTOM RIGHT GROUP: Color Correction Tools & Zoom Button */}
                <div className="absolute bottom-1.5 right-1.5 z-30 flex flex-col items-end pointer-events-none pr-0.5 pb-0.5">
                  <div className="flex flex-col items-center gap-1.5 pointer-events-auto">
                    {isRightToolbarCollapsed ? (
                      /* COLLAPSED SINGLE BUTTON */
                      <div className="p-1 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-lg border border-white/80 dark:border-zinc-700/60 flex flex-col items-center pointer-events-auto animate-fadeIn">
                        <button
                          onClick={() => setIsRightToolbarCollapsed(false)}
                          className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full bg-[var(--lavDeep)] text-white hover:bg-[#4a3271] flex items-center justify-center shadow-md cursor-pointer transition-all active:scale-95"
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
                            setIsRightToolbarCollapsed(true);
                            setActiveFilterTool(null);
                          }}
                          className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 border-b border-zinc-200/60 dark:border-zinc-700/60 pb-0.5"
                          title="Свернуть панель цвета и масштаба"
                        >
                          <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                        </button>
                        
                        {/* POPUP ADJUSTMENT TOOL SLIDER OR ZOOM (Positioned directly next to bottom-right toolbar, semi-transparent & compact) */}
                      {activeFilterTool && (activeFilterTool === 'zoom' || selectedElem) && (
                        <div
                          className={`absolute ${activeFilterTool === 'recolor' ? 'right-full mr-2 bottom-0 w-56 p-2.5 bg-white/45 dark:bg-zinc-900/60' : 'bottom-full mb-2 right-0 w-12 sm:w-14 p-2 bg-white/45 dark:bg-zinc-900/60'} z-50 text-zinc-900 dark:text-zinc-100 border border-white/80 dark:border-zinc-700/80 rounded-2xl shadow-xl shadow-purple-950/10 flex flex-col items-center gap-2 animate-fadeIn pointer-events-auto transition-all select-none`}
                          style={{
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                            backgroundColor: 'rgba(255, 255, 255, 0.45)'
                          }}
                        >
                          
                          {/* Top Close Button */}
                          <button
                            onClick={() => setActiveFilterTool(null)}
                            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white p-0.5 rounded-full hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors cursor-pointer self-end"
                            title="Закрыть"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>

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
                            <div className="flex flex-col items-center gap-1.5 p-1 min-w-[52px]">
                              <button
                                onClick={() => setZoomScale(prev => Math.min(4.0, Number((prev + 0.15).toFixed(2))))}
                                className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-zinc-700 dark:text-zinc-200 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors shadow-2xs"
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
                                className="h-28 w-2 accent-[var(--lavDeep)] dark:accent-purple-400 cursor-pointer rounded-lg appearance-none bg-zinc-200 dark:bg-zinc-700 [writing-mode:vertical-lr] [direction:rtl]"
                              />
                              <button
                                onClick={() => setZoomScale(prev => Math.max(0.2, Number((prev - 0.15).toFixed(2))))}
                                className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-zinc-700 dark:text-zinc-200 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors shadow-2xs"
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
                                  className="text-[9px] font-bold text-zinc-400 hover:text-[#5B3E88] dark:hover:text-purple-300 underline cursor-pointer"
                                  title="Сбросить масштаб (100%)"
                                >
                                  Сброс
                                </button>
                              )}
                            </div>
                          )}

                          {/* Vertical Slider for Brightness */}
                          {activeFilterTool === 'brightness' && selectedElem && (
                            <div className="flex flex-col items-center gap-2">
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
                                className="h-28 w-2 accent-[var(--lavDeep)] dark:accent-purple-400 cursor-pointer rounded-lg appearance-none [writing-mode:vertical-lr] [direction:rtl]"
                                style={{ background: 'linear-gradient(to top, #27272a, #a1a1aa, #ffffff)' }}
                              />
                              <span className="text-[10px] font-bold font-mono text-[var(--lavDeep)] dark:text-purple-300">
                                {selectedElem.exposure > 0 ? `+${selectedElem.exposure}` : selectedElem.exposure}
                              </span>
                            </div>
                          )}

                          {/* Vertical Slider for Hue */}
                          {activeFilterTool === 'hue' && selectedElem && (
                            <div className="flex flex-col items-center gap-2">
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
                                className="h-28 w-2 accent-[var(--lavDeep)] dark:accent-purple-400 cursor-pointer rounded-lg appearance-none [writing-mode:vertical-lr] [direction:rtl]"
                                style={{ background: 'linear-gradient(to top, red, yellow, green, cyan, blue, magenta, red)' }}
                              />
                              <span className="text-[10px] font-bold font-mono text-[var(--lavDeep)] dark:text-purple-300">
                                {selectedElem.hue > 0 ? `+${selectedElem.hue}°` : `${selectedElem.hue}°`}
                              </span>
                            </div>
                          )}

                          {/* Vertical Slider for Temp */}
                          {activeFilterTool === 'temp' && selectedElem && (
                            <div className="flex flex-col items-center gap-2">
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
                                className="h-28 w-2 accent-[var(--lavDeep)] dark:accent-purple-400 cursor-pointer rounded-lg appearance-none [writing-mode:vertical-lr] [direction:rtl]"
                                style={{ background: 'linear-gradient(to top, #3b82f6, #eff6ff, #f59e0b)' }}
                              />
                              <span className="text-[10px] font-bold font-mono text-[var(--lavDeep)] dark:text-purple-300">
                                {(selectedElem.temp || 0) > 0 ? `+${selectedElem.temp}` : (selectedElem.temp || 0)}
                              </span>
                            </div>
                          )}

                          {/* Vertical Slider for Saturate */}
                          {activeFilterTool === 'saturate' && selectedElem && (
                            <div className="flex flex-col items-center gap-2">
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
                                className="h-28 w-2 accent-[var(--lavDeep)] dark:accent-purple-400 cursor-pointer rounded-lg appearance-none [writing-mode:vertical-lr] [direction:rtl]"
                                style={{ background: 'linear-gradient(to top, #a1a1aa, #c084fc, #8b5cf6)' }}
                              />
                              <span className="text-[10px] font-bold font-mono text-[var(--lavDeep)] dark:text-purple-300">
                                {selectedElem.saturate}%
                              </span>
                            </div>
                          )}

                          {/* Vertical Slider for Opacity */}
                          {activeFilterTool === 'opacity' && selectedElem && (
                            <div className="flex flex-col items-center gap-2">
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
                                className="h-28 w-2 accent-[var(--lavDeep)] dark:accent-purple-400 cursor-pointer rounded-lg appearance-none [writing-mode:vertical-lr] [direction:rtl]"
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
                          if (!selectedId && activeFilterTool !== 'recolor') {
                            showToast('Выберите элемент', 'Кликните на элемент для окрашивания в нужный цвет', 'info');
                          }
                          setActiveFilterTool(prev => prev === 'recolor' ? null : 'recolor');
                        }}
                        className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                          activeFilterTool === 'recolor'
                            ? 'bg-[var(--lavDeep)] text-white shadow-md'
                            : 'bg-white/90 dark:bg-zinc-800/90 text-[#5B3E88] dark:text-purple-300 hover:bg-white hover:shadow-md'
                        }`}
                        title="Замена цвета (Выбор точного тона HEX или палитры)"
                      >
                        <Pipette className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                      </button>

                      {/* 2. Яркость (Экспозиция) */}
                      <button
                        onClick={() => {
                          setActiveToolPopover(null);
                          if (!selectedId && activeFilterTool !== 'brightness') {
                            showToast('Выберите элемент', 'Кликните на элемент для настройки яркости', 'info');
                          }
                          setActiveFilterTool(prev => prev === 'brightness' ? null : 'brightness');
                        }}
                        className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                          activeFilterTool === 'brightness'
                            ? 'bg-[var(--lavDeep)] text-white shadow-md'
                            : 'bg-white/90 dark:bg-zinc-800/90 text-[#5B3E88] dark:text-purple-300 hover:bg-white hover:shadow-md'
                        }`}
                        title="Яркость (Экспозиция)"
                      >
                        <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                      </button>

                      {/* 2. Оттенок (Тон) */}
                      <button
                        onClick={() => {
                          setActiveToolPopover(null);
                          if (!selectedId && activeFilterTool !== 'hue') {
                            showToast('Выберите элемент', 'Кликните на элемент для настройки тона', 'info');
                          }
                          setActiveFilterTool(prev => prev === 'hue' ? null : 'hue');
                        }}
                        className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                          activeFilterTool === 'hue'
                            ? 'bg-[var(--lavDeep)] text-white shadow-md'
                            : 'bg-white/90 dark:bg-zinc-800/90 text-[#5B3E88] dark:text-purple-300 hover:bg-white hover:shadow-md'
                        }`}
                        title="Оттенок (Тон)"
                      >
                        <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                      </button>

                      {/* 3. Теплота (Температура) */}
                      <button
                        onClick={() => {
                          setActiveToolPopover(null);
                          if (!selectedId && activeFilterTool !== 'temp') {
                            showToast('Выберите элемент', 'Кликните на элемент для настройки температуры', 'info');
                          }
                          setActiveFilterTool(prev => prev === 'temp' ? null : 'temp');
                        }}
                        className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                          activeFilterTool === 'temp'
                            ? 'bg-[var(--lavDeep)] text-white shadow-md'
                            : 'bg-white/90 dark:bg-zinc-800/90 text-[#5B3E88] dark:text-purple-300 hover:bg-white hover:shadow-md'
                        }`}
                        title="Теплота (Температура)"
                      >
                        <Thermometer className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                      </button>

                      {/* 4. Насыщенность */}
                      <button
                        onClick={() => {
                          setActiveToolPopover(null);
                          if (!selectedId && activeFilterTool !== 'saturate') {
                            showToast('Выберите элемент', 'Кликните на элемент для настройки насыщенности', 'info');
                          }
                          setActiveFilterTool(prev => prev === 'saturate' ? null : 'saturate');
                        }}
                        className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                          activeFilterTool === 'saturate'
                            ? 'bg-[var(--lavDeep)] text-white shadow-md'
                            : 'bg-white/90 dark:bg-zinc-800/90 text-[#5B3E88] dark:text-purple-300 hover:bg-white hover:shadow-md'
                        }`}
                        title="Насыщенность"
                      >
                        <Contrast className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                      </button>

                      {/* 5. Прозрачность */}
                      <button
                        onClick={() => {
                          setActiveToolPopover(null);
                          if (!selectedId && activeFilterTool !== 'opacity') {
                            showToast('Выберите элемент', 'Кликните на элемент для настройки прозрачности', 'info');
                          }
                          setActiveFilterTool(prev => prev === 'opacity' ? null : 'opacity');
                        }}
                        className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                          activeFilterTool === 'opacity'
                            ? 'bg-[var(--lavDeep)] text-white shadow-md'
                            : 'bg-white/90 dark:bg-zinc-800/90 text-[#5B3E88] dark:text-purple-300 hover:bg-white hover:shadow-md'
                        }`}
                        title="Прозрачность"
                      >
                        <Droplet className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                      </button>

                      {/* 6. Лупа (Масштаб / Приближение с ползунком) */}
                      <button
                        onClick={() => {
                          setActiveToolPopover(null);
                          setActiveFilterTool(prev => prev === 'zoom' ? null : 'zoom');
                        }}
                        className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full transition-all cursor-pointer flex items-center justify-center active:scale-95 border-t border-zinc-200/60 dark:border-zinc-700/60 pt-0.5 mt-0.5 ${
                          activeFilterTool === 'zoom'
                            ? 'bg-[var(--lavDeep)] text-white shadow-md'
                            : 'bg-white/90 dark:bg-zinc-800/90 text-[#5B3E88] dark:text-purple-300 hover:bg-white hover:shadow-md'
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
                    className={`relative bg-white shadow-2xl rounded-2xl overflow-hidden shrink-0 select-none pointer-events-auto ${isPanning ? '' : 'transition-transform duration-200'}`}
                    style={{
                      width: `${canvasWidthMm / 10}px`,
                      height: `${canvasHeightMm / 10}px`,
                      transform: `translate(${panX}px, ${panY}px) scale(${canvasScale * zoomScale})`,
                    }}
                    onClick={(e) => {
                      if (e.target === e.currentTarget) {
                        setSelectedIds([]);
                      }
                    }}
                  >
                {/* Backdrop & Grid Clip Layer */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-0">
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

                {/* Draggable human metric silhouette scale reference (without transform controls) */}
                {humanVisible && (() => {
                  const canvasW = canvasWidthMm / 10;
                  const canvasH = canvasHeightMm / 10;
                  const humanW = 70;
                  const humanH = 175; // 175cm = 175px on canvas scale
                  const activeX = humanPos ? humanPos.x : (canvasW / 2 - humanW / 2);
                  const activeY = humanPos ? humanPos.y : (canvasH - humanH - 10);

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
                      title="Силуэт человека (рост 175 см) — зажмите мышью для перемещения по полю"
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
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
                          setHumanPos({ x: nextX, y: nextY });
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
                        {/* Небольшая плашка ростовки при наведении */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                          <span className="text-[9px] font-bold text-zinc-700 dark:text-zinc-200 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700 shadow-xs">
                            175 см
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Draggable Active Elements */}
                {activeScene.elements.map((el, idx) => {
                  if (!el.isVisible) return null;
                  const isSelected = el.id === selectedId;
                  
                  return (
                    <div
                      key={el.id}
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

                      {/* Image / SVG Graphics (Filters applied strictly to element graphic, preserving transparent background & UI controls) */}
                      <div
                        className="w-full h-full relative pointer-events-none select-none"
                        style={{
                          filter: `brightness(${100 + el.exposure}%) saturate(${el.saturate}%) hue-rotate(${el.hue}deg) sepia(${el.temp > 0 ? el.temp * 0.4 : 0}%)${el.tintColor ? ` url(#element-tint-${el.id})` : ''}`
                        }}
                      >
                        {el.customImage ? (
                          <img
                            src={el.customImage}
                            alt={el.name}
                            className="w-full h-full object-fill pointer-events-none select-none"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center pointer-events-none select-none [&_svg]:w-full [&_svg]:h-full [&_svg]:block"
                            dangerouslySetInnerHTML={{
                              __html: el.svgMarkup ? el.svgMarkup.replace(/<svg\b([^>]*)>/i, (match, p1) => {
                                const cleanP1 = p1.replace(/\b(width|height)=["'][^"']*["']/gi, '').replace(/\bpreserveAspectRatio=["'][^"']*["']/gi, '');
                                return `<svg ${cleanP1} preserveAspectRatio="none" style="width:100%;height:100%;">`;
                              }) : ''
                            }}
                          />
                        )}
                      </div>

                      {/* Dashed Outline for Group Member */}
                      {selectedIds.length > 1 && selectedIds.includes(el.id) && (
                        <div className="absolute -inset-1 border border-dashed border-purple-400/80 pointer-events-none rounded-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] z-20" />
                      )}

                      {/* Interactive Bounding Box & Handles */}
                      {isSelected && (
                        <>
                          {el.isLocked ? (
                            /* Pale Gray Dashed Outline for Locked Element */
                            <div className="absolute -inset-1 border border-dashed border-zinc-400/80 dark:border-zinc-500/80 pointer-events-none rounded-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] z-20" />
                          ) : (
                            <>
                              {/* Thin Purple Dashed Selection Bounding Box */}
                              <div className="absolute -inset-1 border border-dashed border-purple-500 dark:border-purple-300 pointer-events-none rounded-xs drop-shadow-[0_1px_3px_rgba(0,0,0,0.75)] z-20" />

                              {/* 8 Resizing handles */}
                              {[
                                { id: 'tl', cursor: 'nwse-resize', class: 'top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full w-2.5 h-2.5 bg-white border border-purple-600 dark:border-purple-300 shadow-sm' },
                                { id: 'tr', cursor: 'nesw-resize', class: 'top-0 right-0 translate-x-1/2 -translate-y-1/2 rounded-full w-2.5 h-2.5 bg-white border border-purple-600 dark:border-purple-300 shadow-sm' },
                                { id: 'bl', cursor: 'nesw-resize', class: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2 rounded-full w-2.5 h-2.5 bg-white border border-purple-600 dark:border-purple-300 shadow-sm' },
                                { id: 'br', cursor: 'nwse-resize', class: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2 rounded-full w-2.5 h-2.5 bg-white border border-purple-600 dark:border-purple-300 shadow-sm' },
                                { id: 't', cursor: 'ns-resize', class: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white border border-purple-600 dark:border-purple-300 shadow-xs' },
                                { id: 'b', cursor: 'ns-resize', class: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-white border border-purple-600 dark:border-purple-300 shadow-xs' },
                                { id: 'l', cursor: 'ew-resize', class: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white border border-purple-600 dark:border-purple-300 shadow-xs' },
                                { id: 'r', cursor: 'ew-resize', class: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white border border-purple-600 dark:border-purple-300 shadow-xs' }
                              ].map((handle) => (
                                <div
                                  key={handle.id}
                                  className={`absolute ${handle.class} z-30 hover:scale-125 transition-transform`}
                                  style={{ cursor: handle.cursor }}
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
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

                              {/* Rotation handle and line */}
                              <div className="absolute top-0 left-1/2 w-[1px] h-6 bg-purple-500 dark:bg-purple-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] -translate-x-1/2 -translate-y-6 pointer-events-none" />
                              <div
                                className="absolute top-0 left-1/2 w-5 h-5 rounded-full bg-white dark:bg-zinc-800 border border-purple-500 dark:border-purple-300 shadow-md -translate-x-1/2 -translate-y-9 flex items-center justify-center hover:bg-purple-50 dark:hover:bg-zinc-700 hover:scale-110 active:scale-95 transition-transform cursor-grab active:cursor-grabbing z-40"
                                title="Кликните для ввода точного градуса, или удерживайте для вращения мышью"
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
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
                                      // Single click -> toggle exact angle popover immediately
                                      setRotationInputId(prev => prev === targetId ? null : targetId);
                                    } else {
                                      recordHistory(scenes);
                                    }
                                  };

                                  window.addEventListener('mousemove', handleMouseMove);
                                  window.addEventListener('mouseup', handleMouseUp);
                                }}
                              >
                                <RefreshCw className="w-2.5 h-2.5 text-purple-600 dark:text-purple-300 animate-spin-slow" />
                              </div>

                              {/* Floating Exact Rotation Angle Popover */}
                              {rotationInputId === el.id && (() => {
                                const isNearTop = el.y < 160;
                                return (
                                  <div
                                    className={`absolute left-1/2 -translate-x-1/2 ${
                                      isNearTop ? 'top-full mt-4' : '-translate-y-[165px] top-0'
                                    } z-50 bg-white/45 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 p-3 rounded-2xl shadow-xl shadow-purple-950/10 border border-white/80 dark:border-zinc-700/80 flex flex-col items-center gap-2 pointer-events-auto min-w-[210px] animate-fadeIn select-none`}
                                    style={{
                                      transform: `rotate(${-el.rotation}deg) scaleX(${el.isFlippedH ? -1 : 1}) scaleY(${el.isFlippedV ? -1 : 1}) scale(${1 / ((canvasScale * zoomScale) || 1)})`,
                                      transformOrigin: isNearTop ? 'top center' : 'bottom center',
                                      WebkitFontSmoothing: 'antialiased',
                                      backdropFilter: 'blur(16px)',
                                      WebkitBackdropFilter: 'blur(16px)',
                                      backgroundColor: 'rgba(255, 255, 255, 0.45)'
                                    }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="flex items-center justify-between w-full pb-1 border-b border-purple-200/50 dark:border-zinc-800 text-xs font-bold text-[#5B3E88] dark:text-purple-300">
                                      <span className="flex items-center gap-1.5">
                                        <RotateCw className="w-3.5 h-3.5 text-[#5B3E88] dark:text-purple-400 stroke-[2.2]" />
                                        Угол поворота
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setRotationInputId(null);
                                        }}
                                        className="p-1 rounded-full hover:bg-purple-500/20 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                                        title="Закрыть"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>

                                    {/* Number Input & Step Buttons */}
                                    <div className="flex items-center gap-1.5 my-1">
                                      <button
                                        onClick={() => {
                                          const next = ((el.rotation - 15) % 360 + 360) % 360;
                                          updateActiveSceneElements(prev => prev.map(item => item.id === el.id ? { ...item, rotation: next } : item));
                                        }}
                                        className="px-2.5 py-1 bg-white/50 hover:bg-purple-100/80 dark:bg-zinc-800/60 dark:hover:bg-zinc-700/80 border border-purple-200/60 dark:border-zinc-700 rounded-xl text-xs font-bold text-[#5B3E88] dark:text-purple-300 cursor-pointer transition-colors shadow-xs"
                                        title="-15°"
                                      >
                                        -15°
                                      </button>

                                      <div className="relative flex items-center">
                                        <input
                                          type="number"
                                          value={el.rotation}
                                          onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            updateActiveSceneElements(prev => prev.map(item => item.id === el.id ? { ...item, rotation: isNaN(val) ? 0 : val } : item));
                                          }}
                                          className="w-16 px-2 py-1 text-center font-extrabold text-sm bg-white/70 dark:bg-zinc-950/70 border border-purple-300/80 dark:border-purple-600 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-[#5B3E88] focus:ring-1 focus:ring-[#5B3E88] shadow-xs"
                                        />
                                        <span className="absolute right-2 text-xs font-bold text-[#5B3E88] dark:text-purple-400 pointer-events-none">°</span>
                                      </div>

                                      <button
                                        onClick={() => {
                                          const next = ((el.rotation + 15) % 360 + 360) % 360;
                                          updateActiveSceneElements(prev => prev.map(item => item.id === el.id ? { ...item, rotation: next } : item));
                                        }}
                                        className="px-2.5 py-1 bg-white/50 hover:bg-purple-100/80 dark:bg-zinc-800/60 dark:hover:bg-zinc-700/80 border border-purple-200/60 dark:border-zinc-700 rounded-xl text-xs font-bold text-[#5B3E88] dark:text-purple-300 cursor-pointer transition-colors shadow-xs"
                                        title="+15°"
                                      >
                                        +15°
                                      </button>
                                    </div>

                                    {/* Preset Angle Pills */}
                                    <div className="flex items-center justify-between w-full gap-1 pt-1.5 border-t border-purple-200/50 dark:border-zinc-800">
                                      {[0, 45, 90, 180, 270].map((deg) => (
                                        <button
                                          key={deg}
                                          onClick={() => {
                                            updateActiveSceneElements(prev => prev.map(item => item.id === el.id ? { ...item, rotation: deg } : item));
                                          }}
                                          className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                            el.rotation === deg
                                              ? 'bg-[#5B3E88] text-white shadow-xs'
                                              : 'bg-white/50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 hover:bg-purple-100/80 hover:text-[#5B3E88]'
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

                          {/* FLOATING QUICK TOOLBAR - Translucent glass with 16px blur & sharp clear controls */}
                          {(() => {
                            const isRotationOpen = rotationInputId === el.id;
                            const isNearTop = el.y < 160;
                            const isNearBottom = (el.y + el.h) > (canvasHeightMm / 10 - 70);

                            // Anti-collision logic: if rotation popover is open, position toolbar on opposite side
                            let positionClass = isNearBottom ? 'bottom-[calc(100%+16px)]' : 'top-[calc(100%+16px)]';
                            if (isRotationOpen) {
                              positionClass = isNearTop ? 'bottom-[calc(100%+16px)]' : 'top-[calc(100%+16px)]';
                            }

                            return (
                              <div
                                className={`absolute left-1/2 -translate-x-1/2 ${positionClass} flex items-center gap-1.5 bg-white/45 dark:bg-zinc-900/60 text-zinc-800 dark:text-zinc-100 px-3.5 py-1.5 rounded-full shadow-lg shadow-purple-950/10 border border-white/80 dark:border-zinc-700/80 z-50 pointer-events-auto select-none`}
                                style={{
                                  transform: `rotate(${-el.rotation}deg) scaleX(${el.isFlippedH ? -1 : 1}) scaleY(${el.isFlippedV ? -1 : 1}) scale(${1 / ((canvasScale * zoomScale) || 1)})`,
                                  transformOrigin: isNearBottom ? 'bottom center' : 'top center',
                                  WebkitFontSmoothing: 'antialiased',
                                  backdropFilter: 'blur(16px)',
                                  WebkitBackdropFilter: 'blur(16px)',
                                  backgroundColor: 'rgba(255, 255, 255, 0.45)'
                                }}
                              >
                                {/* Lock Toggle */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateActiveSceneElements(prev => prev.map(item => item.id === el.id ? { ...item, isLocked: !item.isLocked } : item));
                                  }}
                                  className="p-1.5 rounded-full hover:bg-amber-500/20 active:scale-90 transition-all cursor-pointer flex items-center justify-center group"
                                  title={el.isLocked ? "Разблокировать" : "Заблокировать"}
                                >
                                  {el.isLocked ? (
                                    <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 stroke-[2.3] group-hover:scale-110 transition-transform" />
                                  ) : (
                                    <Unlock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.3] group-hover:scale-110 transition-transform" />
                                  )}
                                </button>

                                {/* Copy/Duplicate */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDuplicateElement(el);
                                  }}
                                  className="p-1.5 rounded-full hover:bg-purple-500/20 active:scale-90 transition-all cursor-pointer flex items-center justify-center group"
                                  title="Копировать"
                                >
                                  <Copy className="w-4 h-4 text-[#5B3E88] dark:text-purple-300 stroke-[2.3] group-hover:scale-110 transition-transform" />
                                </button>

                                <div className="w-[1px] h-4 bg-purple-300/50 dark:bg-zinc-700 mx-0.5 shrink-0" />

                                {/* Delete/Trash */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateActiveSceneElements(prev => prev.filter(item => item.id !== el.id));
                                    setSelectedId(null);
                                    showToast('Удалено', 'Элемент удален со сцены.', 'info');
                                  }}
                                  className="p-1.5 rounded-full hover:bg-rose-500/20 active:scale-90 transition-all cursor-pointer flex items-center justify-center group"
                                  title="Удалить со сцены"
                                >
                                  <Trash2 className="w-4 h-4 text-rose-500 dark:text-rose-400 stroke-[2.3] group-hover:scale-110 transition-transform" />
                                </button>

                                {/* Close / Deselect */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedId(null);
                                  }}
                                  className="p-1.5 rounded-full hover:bg-purple-500/20 active:scale-90 transition-all cursor-pointer flex items-center justify-center group"
                                  title="Закрыть панель"
                                >
                                  <X className="w-4 h-4 text-zinc-500 hover:text-zinc-900 dark:hover:text-white stroke-[2.3] group-hover:scale-110 transition-transform" />
                                </button>
                              </div>
                            );
                          })()}
                        </>
                      )}
                    </div>
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
                      <div className="absolute -inset-1.5 border-2 border-purple-500/90 dark:border-purple-400/90 bg-purple-500/10 rounded-sm shadow-xl pointer-events-none border-dashed" />

                      {/* Corner Resize/Decoration Markers */}
                      <div className="absolute -top-2 -left-2 w-3.5 h-3.5 bg-white border-2 border-purple-600 rounded-xs shadow-xs pointer-events-none" />
                      <div className="absolute -top-2 -right-2 w-3.5 h-3.5 bg-white border-2 border-purple-600 rounded-xs shadow-xs pointer-events-none" />
                      <div className="absolute -bottom-2 -left-2 w-3.5 h-3.5 bg-white border-2 border-purple-600 rounded-xs shadow-xs pointer-events-none" />
                      <div className="absolute -bottom-2 -right-2 w-3.5 h-3.5 bg-white border-2 border-purple-600 rounded-xs shadow-xs pointer-events-none" />

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
                          className="text-[10px] font-extrabold text-[#5B3E88] dark:text-purple-300 bg-white/60 dark:bg-zinc-900/60 px-2.5 py-1 rounded-full border border-white/80 dark:border-zinc-700/80 shadow-md flex items-center gap-1.5"
                          style={{
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                            backgroundColor: 'rgba(255, 255, 255, 0.55)'
                          }}
                        >
                          <BoxSelect className="w-3 h-3 text-[#5B3E88] dark:text-purple-300" />
                          Выделено элементов: {selectedElements.length}
                        </span>
                      </div>

                      {/* FLOATING GROUP TOOLBAR */}
                      <div
                        className={`absolute left-1/2 -translate-x-1/2 ${
                          isNearTop ? 'bottom-2' : '-top-14'
                        } flex items-center gap-1.5 bg-white/45 dark:bg-zinc-900/60 text-zinc-800 dark:text-zinc-100 px-3.5 py-1.5 rounded-full shadow-lg shadow-purple-950/10 border border-white/80 dark:border-zinc-700/80 z-50 pointer-events-auto select-none`}
                        style={{
                          transform: `scale(${1 / ((canvasScale * zoomScale) || 1)})`,
                          transformOrigin: isNearTop ? 'bottom center' : 'top center',
                          WebkitFontSmoothing: 'antialiased',
                          backdropFilter: 'blur(16px)',
                          WebkitBackdropFilter: 'blur(16px)',
                          backgroundColor: 'rgba(255, 255, 255, 0.45)'
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
                          className="p-1.5 rounded-full hover:bg-purple-500/20 active:scale-90 transition-all cursor-pointer flex items-center justify-center group"
                          title="Скопировать всю группу"
                        >
                          <Copy className="w-4 h-4 text-[#5B3E88] dark:text-purple-300 stroke-[2.3] group-hover:scale-110 transition-transform" />
                        </button>

                        {/* Persistent Group / Ungroup button */}
                        {selectedElements.some(el => el.groupId) ? (
                          <button
                            onClick={handleUngroupSelectedElements}
                            className="px-3 py-1 rounded-full bg-[#5B3E88] hover:bg-[#4A3172] text-xs font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                            title="Разгруппировать (сделать элементы независимыми)"
                          >
                            <Ungroup className="w-3.5 h-3.5" />
                            <span>Разгруппировать</span>
                          </button>
                        ) : (
                          <button
                            onClick={handleGroupSelectedElements}
                            className="px-3 py-1 rounded-full bg-[#5B3E88] hover:bg-[#4A3172] text-xs font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                            title="Сгруппировать в постоянную группу"
                          >
                            <Group className="w-3.5 h-3.5" />
                            <span>Сгруппировать</span>
                          </button>
                        )}

                        <div className="w-[1px] h-4 bg-purple-300/50 dark:bg-zinc-700 mx-0.5 shrink-0" />

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

                        {/* Deselect / Close */}
                        <button
                          onClick={() => setSelectedIds([])}
                          className="p-1.5 rounded-full hover:bg-purple-500/20 active:scale-90 transition-all cursor-pointer flex items-center justify-center group"
                          title="Закрыть панель (снять выделение)"
                        >
                          <X className="w-4 h-4 text-zinc-500 hover:text-zinc-900 dark:hover:text-white stroke-[2.3] group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </div>
                  );
                })()}
                  </div>
                </div>

                {/* FLOATING BOTTOM 2-TAB BUTTONS BAR & ANCHORED DRAWER */}
                {activeWorkspaceTab !== 'floorplan' && (
                  <>
                    {/* SLIDE-UP DRAWER ANCHORED DIRECTLY TO BOTTOM CANVAS EDGE */}
                    <AnimatePresence>
                      {mobileDrawerTab && (
                        <motion.div
                          initial={{ opacity: 0, y: '100%' }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: '100%' }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute bottom-0 inset-x-0 z-40 w-full max-h-[65%] sm:max-h-[420px] flex flex-col bg-white/45 dark:bg-zinc-900/50 border-t border-x border-white/70 dark:border-white/15 rounded-t-[28px] shadow-[0_-12px_35px_rgba(0,0,0,0.15)] backdrop-blur-[24px] overflow-hidden pointer-events-auto"
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
                                    ? 'bg-[#EAE4F8]/80 text-[#5B3E88] dark:bg-purple-950/80 dark:text-purple-200 shadow-xs border border-[#D4C5ED]/50 backdrop-blur-sm'
                                    : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/40 dark:hover:bg-white/10'
                                }`}
                              >
                                <BookOpen className="w-3.5 h-3.5 shrink-0 text-[#5B3E88] dark:text-purple-400" />
                                <span>Библиотека</span>
                              </button>
                              <button
                                onClick={() => {
                                  setMobileDrawerTab('layers');
                                  setActiveSidebarTab('layers');
                                }}
                                className={`py-1 px-3 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                  mobileDrawerTab === 'layers'
                                    ? 'bg-[#EAE4F8]/80 text-[#5B3E88] dark:bg-purple-950/80 dark:text-purple-200 shadow-xs border border-[#D4C5ED]/50 backdrop-blur-sm'
                                    : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/40 dark:hover:bg-white/10'
                                }`}
                              >
                                <Layers className="w-3.5 h-3.5 shrink-0 text-[#5B3E88] dark:text-purple-400" />
                                <span>Элементы</span>
                                <span className="px-1.5 py-0.5 rounded-full bg-[#5B3E88] text-white text-[9px] font-extrabold leading-none shrink-0">
                                  {activeScene.elements.length}
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

                    {/* FLOATING PILL BAR WITH 2 TABS WHEN CLOSED (MOBILE ONLY) */}
                    {!mobileDrawerTab && (
                      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex md:hidden items-center justify-center">
                        <div className="p-1 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md rounded-full border border-white/80 dark:border-zinc-700/60 shadow-lg flex items-center gap-1.5 text-xs">
                          <button
                            onClick={() => {
                              setMobileDrawerTab('library');
                              setActiveSidebarTab('library');
                            }}
                            className="py-1.5 px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10 active:scale-95"
                          >
                            <BookOpen className="w-3.5 h-3.5 shrink-0 text-[#5B3E88] dark:text-purple-400" />
                            <span className="truncate">Библиотека</span>
                          </button>
                          <button
                            onClick={() => {
                              setMobileDrawerTab('layers');
                              setActiveSidebarTab('layers');
                            }}
                            className="py-1.5 px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10 active:scale-95"
                          >
                            <Layers className="w-3.5 h-3.5 shrink-0 text-[#5B3E88] dark:text-purple-400" />
                            <span className="truncate">Элементы</span>
                            <span className="px-1.5 py-0.5 rounded-full bg-[#5B3E88] text-white text-[9px] font-extrabold leading-none shrink-0">
                              {activeScene.elements.length}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* BOTTOM PANELS IN LEFT COLUMN: DIMENSIONS/CONTROLS PANEL */}
          {activeWorkspaceTab !== 'floorplan' && (() => {
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
                          <span className="font-extrabold text-[#5B3E88] dark:text-purple-400 text-xs pl-0.5">Ш</span>
                          <input
                            type="number"
                            value={Math.round(selectedElem.w)}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val) && val > 0) {
                                updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, w: val } : item));
                              }
                            }}
                            className="w-11 sm:w-14 text-center font-bold text-xs bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-full px-1 py-0.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#5B3E88] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                        <span className="text-zinc-400 font-bold text-xs">×</span>
                        <div className="flex items-center gap-0.5">
                          <span className="font-extrabold text-[#5B3E88] dark:text-purple-400 text-xs pl-0.5">В</span>
                          <input
                            type="number"
                            value={Math.round(selectedElem.h)}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val) && val > 0) {
                                updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, h: val } : item));
                              }
                            }}
                            className="w-11 sm:w-14 text-center font-bold text-xs bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-full px-1 py-0.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#5B3E88] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <div className="flex items-center gap-0.5">
                          <span className="font-extrabold text-[#5B3E88] dark:text-purple-400 text-xs pl-0.5">Ш</span>
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
                            className="w-11 sm:w-14 text-center font-bold text-xs bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-full px-1 py-0.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#5B3E88] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                        <span className="text-zinc-400 font-bold text-xs">×</span>
                        <div className="flex items-center gap-0.5">
                          <span className="font-extrabold text-[#5B3E88] dark:text-purple-400 text-xs pl-0.5">В</span>
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
                            className="w-11 sm:w-14 text-center font-bold text-xs bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-full px-1 py-0.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#5B3E88] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                        className={`px-2.5 sm:px-3 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 border shadow-xs cursor-pointer transition-all ${
                          activeScene.backdropImage || (activeScene.backdropColor && activeScene.backdropColor !== '#F3F4F6')
                            ? 'bg-[#5B3E88] text-white border-[#5B3E88]'
                            : 'bg-white dark:bg-zinc-800 hover:bg-purple-50 dark:hover:bg-purple-950/50 text-zinc-700 dark:text-zinc-200 border-zinc-200/80 dark:border-zinc-700/80'
                        }`}
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
                              className="absolute right-0 bottom-full mb-2 w-56 bg-white/75 dark:bg-zinc-900/75 hover:bg-white/90 dark:hover:bg-zinc-900/90 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-700/80 rounded-2xl shadow-xl p-2.5 z-[70] flex flex-col gap-2.5 transition-all"
                            >
                              <div className="flex items-center justify-between pb-1 border-b border-zinc-200/60 dark:border-zinc-800">
                                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-1.5">
                                  <Palette className="w-3.5 h-3.5 text-[#5B3E88] dark:text-purple-400" />
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
                                className="w-full py-1.5 px-2.5 rounded-xl bg-purple-50/80 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/80 text-[#5B3E88] dark:text-purple-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-purple-200/50 dark:border-purple-800/40"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Загрузить изображение</span>
                              </button>

                              {/* Color Picker Option */}
                              <div className="flex items-center justify-between gap-2 pt-0.5">
                                <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
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
                                    className="w-16 px-1.5 py-0.5 rounded-md bg-zinc-100/80 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-[10px] font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase focus:outline-none focus:border-[#5B3E88]"
                                  />
                                </div>
                              </div>

                              {/* Background Image Scale Slider inside Popover */}
                              {activeScene.backdropImage && (
                                <div className="space-y-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800">
                                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-600 dark:text-zinc-300">
                                    <span className="flex items-center gap-1">
                                      <ZoomIn className="w-3.5 h-3.5 text-[#5B3E88] dark:text-purple-400" />
                                      Масштаб картинки
                                    </span>
                                    <span className="text-[#5B3E88] dark:text-purple-300 font-mono font-extrabold">
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
                                      className="w-full accent-[#5B3E88] dark:accent-purple-400 h-2 rounded-lg bg-zinc-200 dark:bg-zinc-700 cursor-pointer"
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
                                        className="text-[10px] font-bold text-zinc-400 hover:text-[#5B3E88] dark:hover:text-purple-300 cursor-pointer underline shrink-0 ml-0.5"
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
                                  className="w-full py-1.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-rose-200/50 dark:border-rose-800/40"
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
                      className={`px-3 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 border shadow-xs transition-all cursor-pointer ${
                        gridVisible
                          ? 'bg-[#5B3E88] text-white border-[#5B3E88]'
                          : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-700/80'
                      }`}
                      title="Показать / скрыть сетку"
                    >
                      <Grid className="w-3.5 h-3.5 shrink-0" />
                      <span className="hidden sm:inline">Сетка</span>
                    </button>

                    <button
                      onClick={() => setHumanVisible(!humanVisible)}
                      className={`px-3 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 border shadow-xs transition-all cursor-pointer ${
                        humanVisible
                          ? 'bg-[#5B3E88] text-white border-[#5B3E88]'
                          : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-700/80'
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

        {/* RIGHT COLUMN: CONTROL SIDE PANEL (30% WIDTH) - DESKTOP & TABLET */}
        <div className="hidden md:flex md:col-span-5 lg:col-span-4 flex-col bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs backdrop-blur-md h-full min-h-0 min-w-0">
          
          {/* TAB BAR SELECTORS IN A CLEAN ROUNDED CONTAINER */}
          <div className="p-1.5 bg-zinc-100/90 dark:bg-zinc-900/60 rounded-full m-3 mb-0 grid grid-cols-2 gap-1 border border-zinc-200/60 dark:border-zinc-800/60 shrink-0">
            <button
              onClick={() => setActiveSidebarTab('library')}
              className={`py-2 px-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeSidebarTab === 'library'
                  ? 'bg-[#EAE4F8] text-[#5B3E88] dark:bg-purple-950 dark:text-purple-200 shadow-xs border border-[#D4C5ED]/50'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Библиотека</span>
            </button>
            <button
              onClick={() => setActiveSidebarTab('layers')}
              className={`py-2 px-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeSidebarTab === 'layers'
                  ? 'bg-[#EAE4F8] text-[#5B3E88] dark:bg-purple-950 dark:text-purple-200 shadow-xs border border-[#D4C5ED]/50'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Элементы</span>
              <span className="px-1.5 py-0.5 rounded-full bg-[#5B3E88] text-white text-[9px] font-extrabold leading-none shrink-0">
                {activeScene.elements.length}
              </span>
            </button>
          </div>

          {/* TAB SCROLLABLE CONTENT BODY */}
          <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden p-3.5 space-y-3 min-w-0">
            {renderSidebarTabContent(activeSidebarTab)}
          </div>

        </div>

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
              {activeScene.elements.map((el) => (
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
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
              className="relative w-full max-w-lg bg-white/70 dark:bg-zinc-900/75 backdrop-blur-2xl rounded-3xl border border-white/80 dark:border-zinc-700/80 shadow-2xl p-6 overflow-hidden z-10"
              style={{
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[var(--lavDeep)]" />
                  <h3 className="font-extrabold text-[var(--ink)] text-base">ИИ-Визуализация интерьера</h3>
                </div>
                <button
                  onClick={() => setIsAiModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[var(--faint)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress loader */}
              {isAiGenerating ? (
                <div className="py-8 text-center space-y-4">
                  <RefreshCw className="w-8 h-8 text-[var(--lavDeep)] animate-spin mx-auto" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[var(--ink)]">ИИ Генерирует фон...</p>
                    <p className="text-xs text-[var(--faint)]">Создаем фотореалистичное пространство по вашему описанию.</p>
                  </div>
                  
                  {/* Visual Progress percentage slider line */}
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden max-w-xs mx-auto">
                    <div
                      className="bg-gradient-to-r from-[var(--lavDeep)] to-[var(--lavenderAccent)] h-full transition-all duration-300"
                      style={{ width: `${aiGeneratingProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-5 pt-4">
                  
                  {/* OPTION A: UPLOAD OWN REAL PHOTO */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200/50 space-y-2.5">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block">Вариант А</span>
                    <h4 className="text-xs font-bold text-[var(--ink)]">Загрузить фон реального проекта</h4>
                    <p className="text-[11px] text-[var(--faint)]">Используйте фотографию реального пустого зала ресторана, предоставленную клиентом, чтобы наложить вашу арку прямо в интерьер.</p>
                    
                    <label className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950/40 hover:border-[var(--lavDeep)] cursor-pointer transition-all text-xs font-bold text-[var(--lavDeep)]">
                      <FileImage className="w-4 h-4" />
                      <span>Выбрать фото зала</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          handleUploadCanvasBackdrop(e);
                          setIsAiModalOpen(false);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* OPTION B: WRITE PROMPT TO SIMULATE GENERATOR */}
                  <div className="p-4 rounded-2xl bg-[var(--lavenderSoft)] dark:bg-[var(--lavDeep)]/10 border border-[var(--lavBorder)] dark:border-[var(--lavDeep)]/30 space-y-3">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] block">Вариант Б</span>
                    <h4 className="text-xs font-bold text-[var(--ink)]">Сгенерировать подходящий фон ИИ</h4>
                    <p className="text-[11px] text-[var(--faint)]">Опишите стиль банкетного зала или локации. Нейросеть смоделирует идеальный интерьер для презентации вашего концепта.</p>
                    
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Например: классический белый зал с колоннами, кирпичный лофт со свечами..."
                        className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-[var(--ink)] placeholder:text-[var(--faint)] focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={handleStartAiGeneration}
                      style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
                      className="w-full py-2.5 rounded-full text-white text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#582F89]/20 active:scale-95"
                    >
                      <Wand2 className="w-3.5 h-3.5 text-white fill-white" />
                      <span>Сгенерировать интерьер</span>
                    </button>
                  </div>

                </div>
              )}

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
                  <div className="p-2 bg-[#EAE4F8] dark:bg-purple-950 rounded-xl text-[#5B3E88] dark:text-purple-300">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">Иконки категорий редактора</h3>
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
              <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/30 text-xs text-zinc-600 dark:text-zinc-300 space-y-1.5 shrink-0">
                <div className="font-bold text-[#5B3E88] dark:text-purple-300 flex items-center gap-1.5">
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
                          <div className="font-bold text-zinc-800 dark:text-zinc-200 truncate">{cat.title}</div>
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
                        <label className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#8C52D0] to-[#582F89] hover:opacity-90 text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs">
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
                                    localStorage.setItem(`cat_icon_${cat.id}`, event.target.result as string);
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
