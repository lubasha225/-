import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Check,
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
  Volume2
} from 'lucide-react';
import { Project, EstimateItem } from '../types';
import { CATALOG_ASSETS, LibraryItem } from './editor/EditorLibraryData';
import FloorPlanSchema, { PlanElement } from './editor/FloorPlanSchema';

interface MoodboardEditorProps {
  projects: Project[];
  onSaveToProject: (projectId: string, imageUrl: string, estimateItems?: EstimateItem[], budget?: number) => void;
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warn') => void;
  setHeaderActions?: (actions: React.ReactNode) => void;
  onAddAiImage?: (url: string, prompt: string, projectName: string) => void;
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
  hue: number;
  temp: number;
  saturate: number;
  opacity: number;
  price: number;
  comment: string;
  isLocked: boolean;
  isVisible: boolean;
  isFlippedH: boolean;
  isFlippedV: boolean;
  svgMarkup: string;
  customImage?: string;
}

interface EditorScene {
  id: string;
  name: string;
  elements: CanvasElement[];
  backdropImage: string;
  backdropColor: string;
  backdropType: 'image' | 'color';
}

const NEW_CATALOG_CATEGORIES = [
  { id: 'favorites', title: 'Избранное', icon: 'Heart' },
  { id: 'text', title: 'Текст', icon: 'Type' },
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

export default function MoodboardEditor({ projects, onSaveToProject, showToast, setHeaderActions, onAddAiImage }: MoodboardEditorProps) {
  // Top Active Mode / Scene Tabs: "scene-1" | "scene-2" | "floorplan"
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<string>('scene-1');

  // Sidebar Controls Tabs: 1 = Library, 2 = Layers, 3 = Tools
  const [activeSidebarTab, setActiveSidebarTab] = useState<'library' | 'layers' | 'tools'>('library');

  // Selected Project and Data binding
  const [activeProjectId, setActiveProjectId] = useState<string>(projects[0]?.id || '');
  const currentProject = projects.find(p => p.id === activeProjectId);

  // Core Scenes for the 2D collage workspace
  const [scenes, setScenes] = useState<EditorScene[]>([
    {
      id: 'scene-1',
      name: 'Визуализация 1',
      elements: [
        {
          id: "A-101-main",
          name: "Круглая арка «Оливия»",
          type: "arches",
          x: 180,
          y: 40,
          w: 220,
          h: 220,
          rotation: 0,
          exposure: 0,
          hue: 0,
          temp: 0,
          saturate: 100,
          opacity: 100,
          price: 25000,
          comment: "Центральная арка для молодоженов",
          isLocked: false,
          isVisible: true,
          isFlippedH: false,
          isFlippedV: false,
          svgMarkup: CATALOG_ASSETS.arches[0].svgMarkup
        },
        {
          id: "F-201-top",
          name: "Гирлянда «Королевская роза»",
          type: "flowers",
          x: 150,
          y: 20,
          w: 280,
          h: 60,
          rotation: 0,
          exposure: 0,
          hue: 0,
          temp: 0,
          saturate: 100,
          opacity: 100,
          price: 45000,
          comment: "Разместить поверх арки «Оливия»",
          isLocked: false,
          isVisible: true,
          isFlippedH: false,
          isFlippedV: false,
          svgMarkup: CATALOG_ASSETS.flowers[0].svgMarkup
        }
      ],
      backdropImage: '',
      backdropColor: '#F3F4F6',
      backdropType: 'color'
    },
    {
      id: 'scene-2',
      name: 'Визуализация 2',
      elements: [],
      backdropImage: '',
      backdropColor: '#F3F4F6',
      backdropType: 'color'
    }
  ]);

  const activeSceneIndex = scenes.findIndex(s => s.id === activeWorkspaceTab);
  const activeScene = activeSceneIndex !== -1 ? scenes[activeSceneIndex] : scenes[0];

  // Seating Arrangement Floor Plan
  const [floorPlanElements, setFloorPlanElements] = useState<PlanElement[]>([]);

  // Selection ID on the Canvas
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Undo/Redo Stacking
  const [history, setHistory] = useState<EditorScene[][]>([JSON.parse(JSON.stringify(scenes))]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Library Category filtering
  const [selectedCategory, setSelectedCategory] = useState<string>('arches');
  const [libSearch, setLibSearch] = useState<string>('');
  const [favoritesList, setFavoritesList] = useState<string[]>(['text-1', 'arch-1']);

  // Canvas Dimension Configurations
  const [canvasWidthMm, setCanvasWidthMm] = useState<number>(6500);
  const [canvasHeightMm, setCanvasHeightMm] = useState<number>(4400);
  const [gridVisible, setGridVisible] = useState<boolean>(true);
  const [humanVisible, setHumanVisible] = useState<boolean>(true);
  const [activeUnit, setActiveUnit] = useState<'mm' | 'cm' | 'm'>('mm');

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

  // Set selected element properties and automatically switches to Tools Tab
  const handleSelectElement = (id: string) => {
    setSelectedId(id);
    setActiveSidebarTab('tools');
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
    setActiveSidebarTab('tools');
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
      setActiveSidebarTab('tools');
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
          backdropImage: type === 'image' ? value : s.backdropImage
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

  // Core Actions
  const handleSaveProjectCollage = () => {
    // Generate simple mock estimate item entries
    const estimateItems: EstimateItem[] = activeScene.elements.map((el, i) => ({
      id: el.id,
      name: el.name,
      category: el.type,
      quantity: 1,
      price: el.price,
      comment: el.comment || 'Сгенерировано в 2D арках',
      photoUrl: el.customImage || ''
    }));

    onSaveToProject(activeProjectId, activeScene.backdropImage || '', estimateItems, sceneTotalCost);
    showToast('Сохранено в проект', `Спецификация и концепт "${activeScene.name}" привязаны к активному проекту.`, 'success');
  };

  const handleDownloadLayout = () => {
    showToast('Загрузка', 'Файл спецификации и PDF-версия эскиза подготовлены.', 'success');
    window.print();
  };

  // Drag, Resize and Rotate implementation
  const [activeAction, setActiveAction] = useState<'move' | 'resize' | 'rotate' | null>(null);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  
  const dragStartRef = useRef({
    x: 0,
    y: 0,
    elX: 0,
    elY: 0,
    elW: 0,
    elH: 0,
    rotation: 0
  });

  const rotateStartRef = useRef({
    startAngle: 0,
    startRotation: 0,
    centerX: 0,
    centerY: 0
  });

  const handleCanvasMouseDown = (e: React.MouseEvent, el: CanvasElement) => {
    if (el.isLocked) return;
    e.stopPropagation();
    handleSelectElement(el.id);
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
    if (!activeAction || !selectedId) return;

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

      switch (activeHandle) {
        case 'br':
          dw = localDx;
          dh = localDy;
          break;
        case 'r':
          dw = localDx;
          break;
        case 'b':
          dh = localDy;
          break;
        case 'tl':
          dw = -localDx;
          dh = -localDy;
          localShiftX = localDx;
          localShiftY = localDy;
          break;
        case 't':
          dh = -localDy;
          localShiftY = localDy;
          break;
        case 'l':
          dw = -localDx;
          localShiftX = localDx;
          break;
        case 'tr':
          dw = localDx;
          dh = -localDy;
          localShiftY = localDy;
          break;
        case 'bl':
          dw = -localDx;
          dh = localDy;
          localShiftX = localDx;
          break;
      }

      const finalW = Math.max(20, originalW + dw);
      const finalH = Math.max(20, originalH + dh);

      const actualDw = finalW - originalW;
      const actualDh = finalH - originalH;

      let actualLocalShiftX = 0;
      let actualLocalShiftY = 0;

      if (activeHandle === 'tl' || activeHandle === 'l' || activeHandle === 'bl') {
        actualLocalShiftX = -actualDw;
      }
      if (activeHandle === 'tl' || activeHandle === 't' || activeHandle === 'tr') {
        actualLocalShiftY = -actualDh;
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
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 bg-white/50 dark:bg-black/20 p-1.5 rounded-xl border border-[var(--glass-edge)]">
            <span className="text-[10px] font-semibold px-1.5 text-[var(--faint)]">Проект:</span>
            <select
              value={activeProjectId}
              onChange={(e) => {
                setActiveProjectId(e.target.value);
                showToast('Смена проекта', `Активный проект переключен.`, 'info');
              }}
              className="text-xs font-bold bg-transparent text-[var(--ink)] focus:outline-none cursor-pointer pr-4"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id} className="dark:bg-zinc-950 text-xs font-medium text-black dark:text-zinc-100">{p.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 hover:opacity-90 text-white text-xs font-bold transition-all shadow-md shadow-violet-500/10 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>ИИ визуализация</span>
          </button>
          
          <button
            onClick={handleSaveProjectCollage}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-white/60 dark:bg-zinc-900/60 hover:bg-white/90 border border-[var(--glass-edge)] text-[var(--ink)] text-xs font-bold transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-blue-500" />
            <span>Сохранить</span>
          </button>

          <button
            onClick={handleDownloadLayout}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-white/60 dark:bg-zinc-900/60 hover:bg-white/90 border border-[var(--glass-edge)] text-[var(--ink)] text-xs font-bold transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            <span>Скачать</span>
          </button>
        </div>
      );
    }
    return () => {
      if (setHeaderActions) {
        setHeaderActions(null);
      }
    };
  }, [setHeaderActions, activeProjectId, projects, showToast]);

  const selectedElem = activeScene.elements.find(el => el.id === selectedId);

  return (
    <div className="flex-1 flex flex-col gap-4 min-h-0 h-full pb-1 print:pb-0" onMouseMove={handleCanvasMouseMove} onMouseUp={handleCanvasMouseUp}>

      {/* MAIN TWO-COLUMN SPLIT */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 print:hidden">
        
        {/* LEFT COLUMN: ACTIVE WORKSPACE (70% WIDTH) */}
        <div className="lg:col-span-8 flex flex-col gap-3 h-full min-h-0">
          
          {/* Top workspace navigation bar */}
          <div className="flex items-center justify-between bg-white/30 dark:bg-zinc-900/5 border border-[var(--glass-edge)] p-2 rounded-2xl shrink-0">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveWorkspaceTab('scene-1')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeWorkspaceTab === 'scene-1'
                    ? 'bg-[var(--lavDeep)] text-white shadow-sm'
                    : 'text-[var(--soft)] hover:text-[var(--ink)] hover:bg-white/40 dark:hover:bg-black/20'
                }`}
              >
                Визуализация 1
              </button>
              <button
                onClick={() => setActiveWorkspaceTab('scene-2')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeWorkspaceTab === 'scene-2'
                    ? 'bg-[var(--lavDeep)] text-white shadow-sm'
                    : 'text-[var(--soft)] hover:text-[var(--ink)] hover:bg-white/40 dark:hover:bg-black/20'
                }`}
              >
                Визуализация 2
              </button>
              <button
                onClick={() => {
                  setActiveWorkspaceTab('floorplan');
                  setSelectedId(null);
                }}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeWorkspaceTab === 'floorplan'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-[var(--soft)] hover:text-[var(--ink)] hover:bg-white/40 dark:hover:bg-black/20'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Схема рассадки</span>
              </button>
            </div>

            {/* Undo/Redo Controls */}
            {activeWorkspaceTab !== 'floorplan' && (
              <div className="flex items-center gap-1 pr-1">
                <button
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className="p-1.5 rounded-lg hover:bg-white/40 dark:hover:bg-black/20 text-[var(--soft)] disabled:opacity-30 cursor-pointer"
                  title="Отменить действие (Ctrl+Z)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-1.5 rounded-lg hover:bg-white/40 dark:hover:bg-black/20 text-[var(--soft)] disabled:opacity-30 cursor-pointer"
                  title="Повторить действие"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* MAIN CANVAS AREA / SEATING ARRANGEMENT VIEW */}
          <div className="flex-1 min-h-0 relative">
            {activeWorkspaceTab === 'floorplan' ? (
              <div className="glass-panel rounded-3xl overflow-hidden h-full min-h-0">
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
                className={`relative bg-zinc-950/60 dark:bg-black/40 rounded-3xl overflow-hidden flex items-center justify-center h-full min-h-0 border border-zinc-200/20 dark:border-zinc-800/20 select-none p-4 ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
              >
                {/* Zoom Controls Overlay */}
                <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/10 text-white text-[11px] font-semibold">
                  <span>Масштаб: {Math.round(zoomScale * 100)}%</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setZoomScale(1);
                      setPanX(0);
                      setPanY(0);
                    }}
                    className="ml-1.5 bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded-full text-[10px] transition-colors cursor-pointer"
                    title="Сбросить масштаб и положение"
                  >
                    Сбросить
                  </button>
                </div>

                <div
                  ref={canvasContainerRef}
                  className={`relative bg-zinc-900/90 rounded-2xl shadow-2xl border border-zinc-950/85 overflow-hidden shrink-0 select-none ${isPanning ? '' : 'transition-transform duration-200'}`}
                  style={{
                    width: `${canvasWidthMm / 10}px`,
                    height: `${canvasHeightMm / 10}px`,
                    transform: `translate(${panX}px, ${panY}px) scale(${canvasScale * zoomScale})`,
                  }}
                  onClick={() => setSelectedId(null)}
                >
                {/* Backdrop Layer */}
                {activeScene.backdropType === 'image' && activeScene.backdropImage ? (
                  <img
                    src={activeScene.backdropImage}
                    alt="Backdrop"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    style={{ opacity: 0.75 }}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div
                    className="absolute inset-0 transition-colors duration-500"
                    style={{ backgroundColor: activeScene.backdropColor }}
                  />
                )}

                {/* Grid Overlay */}
                {gridVisible && (
                  <div className="absolute inset-0 pointer-events-none opacity-15" style={{
                    backgroundImage: 'radial-gradient(circle, #8B5CF6 1.2px, transparent 1.2px)',
                    backgroundSize: '24px 24px'
                  }} />
                )}

                {/* Optional human metric silhouette scale reference */}
                {humanVisible && (
                  <div className="absolute bottom-4 left-6 pointer-events-none opacity-40 z-10 flex flex-col items-center">
                    {/* SVG Human icon silhouette */}
                    <svg viewBox="0 0 24 60" className="w-8 h-20 text-zinc-400">
                      <circle cx="12" cy="8" r="6" fill="currentColor" />
                      <path d="M4 18 L20 18 L18 40 L16 58 L12 58 L12 42 L8 42 L8 58 L4 58 Z" fill="currentColor" />
                    </svg>
                    <span className="text-[9px] font-mono text-zinc-400 bg-black/50 px-1.5 py-0.5 rounded mt-1">Рост ~1.75м</span>
                  </div>
                )}

                {/* Draggable Active Elements */}
                {activeScene.elements.map((el, idx) => {
                  if (!el.isVisible) return null;
                  const isSelected = el.id === selectedId;
                  
                  return (
                    <div
                      key={el.id}
                      onMouseDown={(e) => handleCanvasMouseDown(e, el)}
                      className={`absolute group cursor-grab active:cursor-grabbing transition-shadow ${
                        isSelected ? 'ring-2 ring-[var(--lavenderAccent)] ring-offset-2 ring-offset-zinc-900 shadow-xl z-20' : 'hover:ring-1 hover:ring-white/40'
                      }`}
                      style={{
                        left: `${el.x}px`,
                        top: `${el.y}px`,
                        width: `${el.w}px`,
                        height: `${el.h}px`,
                        transform: `rotate(${el.rotation}deg) scaleX(${el.isFlippedH ? -1 : 1}) scaleY(${el.isFlippedV ? -1 : 1})`,
                        opacity: el.opacity / 100,
                        filter: `brightness(${100 + el.exposure}%) saturate(${el.saturate}%) hue-rotate(${el.hue}deg) sepia(${el.temp > 0 ? el.temp * 0.4 : 0}%)`
                      }}
                    >
                      {/* Image / SVG Graphics */}
                      {el.customImage ? (
                        <img
                          src={el.customImage}
                          alt={el.name}
                          className="w-full h-full object-contain pointer-events-none"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          dangerouslySetInnerHTML={{ __html: el.svgMarkup }}
                        />
                      )}

                      {/* Interactive Bounding Box & Handles */}
                      {isSelected && (
                        <>
                          {/* Outer Border Outline */}
                          <div className="absolute inset-0 border border-violet-600 pointer-events-none" />

                          {/* 8 Resizing handles */}
                          {[
                            { id: 'tl', cursor: 'nwse-resize', class: 'top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full w-3 h-3 bg-white border-2 border-violet-600' },
                            { id: 'tr', cursor: 'nesw-resize', class: 'top-0 right-0 translate-x-1/2 -translate-y-1/2 rounded-full w-3 h-3 bg-white border-2 border-violet-600' },
                            { id: 'bl', cursor: 'nesw-resize', class: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2 rounded-full w-3 h-3 bg-white border-2 border-violet-600' },
                            { id: 'br', cursor: 'nwse-resize', class: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2 rounded-full w-3 h-3 bg-white border-2 border-violet-600' },
                            { id: 't', cursor: 'ns-resize', class: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border border-violet-600' },
                            { id: 'b', cursor: 'ns-resize', class: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 bg-white border border-violet-600' },
                            { id: 'l', cursor: 'ew-resize', class: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border border-violet-600' },
                            { id: 'r', cursor: 'ew-resize', class: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border border-violet-600' }
                          ].map((handle) => (
                            <div
                              key={handle.id}
                              className={`absolute ${handle.class} z-30 shadow-xs hover:scale-125 transition-transform`}
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
                          <div className="absolute top-0 left-1/2 w-[1.5px] h-6 bg-violet-600 -translate-x-1/2 -translate-y-6 pointer-events-none" />
                          <div
                            className="absolute top-0 left-1/2 w-5 h-5 rounded-full bg-white border-2 border-violet-600 shadow-md -translate-x-1/2 -translate-y-9 flex items-center justify-center hover:bg-violet-50 hover:scale-110 active:scale-95 transition-transform cursor-grab active:cursor-grabbing z-40"
                            title="Повернуть"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setActiveAction('rotate');
                              const rect = canvasContainerRef.current?.getBoundingClientRect();
                              if (rect) {
                                const elCenterX = el.x + el.w / 2;
                                const elCenterY = el.y + el.h / 2;
                                const centerAbsX = rect.left + elCenterX;
                                const centerAbsY = rect.top + elCenterY;
                                const startAngle = Math.atan2(e.clientY - centerAbsY, e.clientX - centerAbsX) * (180 / Math.PI);
                                rotateStartRef.current = {
                                  startAngle,
                                  startRotation: el.rotation,
                                  centerX: centerAbsX,
                                  centerY: centerAbsY
                                };
                              }
                            }}
                          >
                            <RefreshCw className="w-2.5 h-2.5 text-violet-600 animate-spin-slow" />
                          </div>

                          {/* FLOATING QUICK TOOLBAR */}
                          <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-zinc-950/90 text-white px-2 py-1 rounded-xl shadow-xl border border-zinc-700/50 z-50">
                            {/* Lock Toggle */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateActiveSceneElements(prev => prev.map(item => item.id === el.id ? { ...item, isLocked: !item.isLocked } : item));
                              }}
                              className="p-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                              title={el.isLocked ? "Разблокировать" : "Заблокировать"}
                            >
                              {el.isLocked ? <Lock className="w-3.5 h-3.5 text-rose-400" /> : <Unlock className="w-3.5 h-3.5 text-emerald-400" />}
                            </button>

                            {/* Copy/Duplicate */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicateElement(el);
                              }}
                              className="p-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                              title="Копировать"
                            >
                              <Copy className="w-3.5 h-3.5 text-blue-400" />
                            </button>

                            <div className="w-[1px] h-3 bg-zinc-700" />

                            {/* Delete/Trash */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateActiveSceneElements(prev => prev.filter(item => item.id !== el.id));
                                setSelectedId(null);
                                showToast('Удалено', 'Элемент удален с холста.', 'info');
                              }}
                              className="p-1.5 rounded hover:bg-rose-950/60 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                              title="Удалить со сцены"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
                </div>
              </div>
            )}
          </div>

          {/* CANVAS BOTTOM TOOLBAR (Width/Height mm configurations, grid toggling) */}
          {activeWorkspaceTab !== 'floorplan' && (
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white/40 dark:bg-zinc-900/10 border border-[var(--glass-edge)] p-4 rounded-2xl backdrop-blur-md">
              
              {/* Width and Height dimensions */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-[var(--soft)]">Ш:</span>
                  <input
                    type="text"
                    value={canvasWidthInput}
                    onChange={(e) => setCanvasWidthInput(e.target.value)}
                    onBlur={() => {
                      const parsed = parseFloat(canvasWidthInput);
                      if (!isNaN(parsed)) {
                        const mm = fromDisplayValue(parsed);
                        const validated = Math.max(1000, Math.min(15000, mm));
                        setCanvasWidthMm(validated);
                      } else {
                        setCanvasWidthInput(toDisplayValue(canvasWidthMm).toString());
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const parsed = parseFloat(canvasWidthInput);
                        if (!isNaN(parsed)) {
                          const mm = fromDisplayValue(parsed);
                          const validated = Math.max(1000, Math.min(15000, mm));
                          setCanvasWidthMm(validated);
                        } else {
                          setCanvasWidthInput(toDisplayValue(canvasWidthMm).toString());
                        }
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    className="w-20 px-2 py-1 rounded-lg bg-white/60 dark:bg-zinc-950/40 border border-[var(--glass-edge)] text-xs font-semibold text-[var(--ink)] focus:outline-none"
                    title="Ширина сцены в выбранных единицах"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-[var(--soft)]">В:</span>
                  <input
                    type="text"
                    value={canvasHeightInput}
                    onChange={(e) => setCanvasHeightInput(e.target.value)}
                    onBlur={() => {
                      const parsed = parseFloat(canvasHeightInput);
                      if (!isNaN(parsed)) {
                        const mm = fromDisplayValue(parsed);
                        const validated = Math.max(1000, Math.min(10000, mm));
                        setCanvasHeightMm(validated);
                      } else {
                        setCanvasHeightInput(toDisplayValue(canvasHeightMm).toString());
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const parsed = parseFloat(canvasHeightInput);
                        if (!isNaN(parsed)) {
                          const mm = fromDisplayValue(parsed);
                          const validated = Math.max(1000, Math.min(10000, mm));
                          setCanvasHeightMm(validated);
                        } else {
                          setCanvasHeightInput(toDisplayValue(canvasHeightMm).toString());
                        }
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    className="w-20 px-2 py-1 rounded-lg bg-white/60 dark:bg-zinc-950/40 border border-[var(--glass-edge)] text-xs font-semibold text-[var(--ink)] focus:outline-none"
                    title="Высота сцены в выбранных единицах"
                  />
                </div>
                
                {/* Unit Selector dropdown */}
                <select
                  value={activeUnit}
                  onChange={(e) => setActiveUnit(e.target.value as any)}
                  className="px-2 py-1 rounded-lg bg-white/60 dark:bg-zinc-950/40 border border-[var(--glass-edge)] text-xs font-semibold text-[var(--ink)] focus:outline-none cursor-pointer"
                >
                  <option value="mm">мм</option>
                  <option value="cm">см</option>
                  <option value="m">м</option>
                </select>
              </div>

              {/* Dynamic backdrop triggers */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-white/30 dark:bg-black/10 p-1 rounded-lg border border-[var(--glass-edge)]">
                  <span className="text-[10px] font-semibold text-[var(--faint)] px-1.5">Фон:</span>
                  <input
                    type="color"
                    value={activeScene.backdropColor}
                    onChange={(e) => handleCanvasBackdropChange('color', e.target.value)}
                    className="w-6 h-6 rounded-md border border-zinc-300 dark:border-zinc-700 cursor-pointer overflow-hidden"
                    title="Выбрать заливку цвета"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1 text-[var(--soft)] hover:text-[var(--ink)] rounded-md hover:bg-white/40 dark:hover:bg-zinc-800 transition-colors"
                    title="Загрузить собственное изображение фона"
                  >
                    <Upload className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleUploadCanvasBackdrop}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {/* Toggles */}
                <button
                  onClick={() => setGridVisible(!gridVisible)}
                  className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                    gridVisible
                      ? 'bg-[var(--lavSoft)] border-[var(--lavenderAccent)] text-[var(--lavDeep)]'
                      : 'border-[var(--glass-edge)] text-[var(--faint)] hover:text-[var(--ink)]'
                  }`}
                  title="Показать/скрыть сетку"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setHumanVisible(!humanVisible)}
                  className={`px-2.5 py-1 rounded-full border transition-all text-[11px] font-bold cursor-pointer ${
                    humanVisible
                      ? 'bg-[var(--lavSoft)] border-[var(--lavenderAccent)] text-[var(--lavDeep)]'
                      : 'border-[var(--glass-edge)] text-[var(--faint)] hover:text-[var(--ink)]'
                  }`}
                  title="Масштабная фигура человека"
                >
                  Человек
                </button>
              </div>

            </div>
          )}

        </div>

        {/* RIGHT COLUMN: CONTROL SIDE PANEL (30% WIDTH) */}
        <div className="lg:col-span-4 flex flex-col bg-white/40 dark:bg-zinc-900/10 border border-[var(--glass-edge)] rounded-3xl overflow-hidden shadow-sm backdrop-blur-md h-full min-h-0">
          
          {/* TAB BAR SELECTORS */}
          <div className="grid grid-cols-3 border-b border-[var(--glass-edge)] bg-white/20 dark:bg-black/10">
            <button
              onClick={() => setActiveSidebarTab('library')}
              className={`py-3.5 text-xs font-bold transition-all cursor-pointer border-b-2 flex items-center justify-center gap-1.5 ${
                activeSidebarTab === 'library'
                  ? 'border-violet-600 text-violet-600 bg-white/20 dark:bg-white/5'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <span>Библиотека</span>
            </button>
            <button
              onClick={() => setActiveSidebarTab('layers')}
              className={`py-3.5 text-xs font-bold transition-all cursor-pointer border-b-2 flex items-center justify-center gap-1.5 ${
                activeSidebarTab === 'layers'
                  ? 'border-violet-600 text-violet-600 bg-white/20 dark:bg-white/5'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <span>Элементы проекта</span>
              <span className="px-1.5 py-0.5 rounded-full bg-violet-600 text-white text-[9px] font-extrabold leading-none">
                {activeScene.elements.length}
              </span>
            </button>
            <button
              onClick={() => setActiveSidebarTab('tools')}
              className={`py-3.5 text-xs font-bold transition-all cursor-pointer border-b-2 flex items-center justify-center gap-1.5 ${
                activeSidebarTab === 'tools'
                  ? 'border-violet-600 text-violet-600 bg-white/20 dark:bg-white/5'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <span>Инструменты</span>
            </button>
          </div>

          {/* TAB SCROLLABLE CONTENT BODY */}
          <div className="flex-1 flex flex-col overflow-y-auto p-5">
            
            {/* TAB 1: LIBRARY CATALOG LISTING */}
            {activeSidebarTab === 'library' && (
              <div className="space-y-4">
                
                {/* Category Horizontal Scrolling List */}
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none snap-x -mx-5 px-5">
                  {NEW_CATALOG_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setLibSearch('');
                        }}
                        className="flex flex-col items-center gap-1 shrink-0 snap-start transition-all cursor-pointer group"
                      >
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${
                            isSelected
                              ? 'bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-500/20 scale-105'
                              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-violet-600 hover:border-violet-300 dark:hover:bg-zinc-850'
                          }`}
                        >
                          {cat.id === 'favorites' && <Heart className={`w-5 h-5 ${isSelected ? 'fill-white text-white' : 'text-rose-500 fill-rose-500'}`} />}
                          {cat.id === 'text' && <Type className="w-5 h-5" />}
                          {cat.id === 'arches' && <Layers className="w-5 h-5" />}
                          {cat.id === 'stands' && <Columns className="w-5 h-5" />}
                          {cat.id === 'tables' && <TableIcon className="w-5 h-5" />}
                          {cat.id === 'screens' && <GridIcon className="w-5 h-5" />}
                          {cat.id === 'flowers' && <Flower2 className="w-5 h-5" />}
                          {cat.id === 'compositions' && <Sparkles className="w-5 h-5" />}
                          {cat.id === 'vases' && <Tag className="w-5 h-5" />}
                          {cat.id === 'details' && <Compass className="w-5 h-5" />}
                          {cat.id === 'textiles' && <Layers className="w-5 h-5" />}
                          {cat.id === 'light' && <Lightbulb className="w-5 h-5" />}
                          {cat.id === 'podiums' && <Columns className="w-5 h-5" />}
                          {cat.id === 'furniture' && <Bookmark className="w-5 h-5" />}
                          {cat.id === 'balloons' && <CircleDot className="w-5 h-5" />}
                          {cat.id === 'themes' && <Tag className="w-5 h-5" />}
                        </div>
                        <span className={`text-[10px] font-semibold text-center transition-colors ${isSelected ? 'text-violet-600 dark:text-violet-400 font-bold' : 'text-zinc-500 group-hover:text-zinc-800 dark:group-hover:text-zinc-300'}`}>
                          {cat.title}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Filter / Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--faint)]" />
                  <input
                    type="text"
                    placeholder="Найти элемент..."
                    value={libSearch}
                    onChange={(e) => setLibSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/50 dark:bg-black/20 border border-[var(--glass-edge)] text-xs text-[var(--ink)] placeholder:text-[var(--faint)] focus:outline-none"
                  />
                </div>

                {/* Grid of Catalog items */}
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* Plus item custom upload button */}
                  <label className="flex flex-col items-center justify-center p-3 h-28 rounded-2xl border border-dashed border-[var(--lavenderAccent)] hover:border-[var(--lavDeep)] bg-[var(--lavSoft)]/30 cursor-pointer transition-all">
                    <Plus className="w-5 h-5 text-[var(--lavDeep)] mb-1" />
                    <span className="text-[10px] font-bold text-[var(--lavDeep)] text-center">Загрузить PNG</span>
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
                        className="group relative flex flex-col justify-between p-2.5 h-28 rounded-2xl border border-[var(--glass-edge)] bg-white/50 dark:bg-zinc-950/20 hover:border-[var(--lavenderAccent)] hover:shadow-sm cursor-pointer transition-all text-left"
                      >
                        {/* Header Mini Actions */}
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-[8.5px] font-bold text-[var(--faint)] truncate max-w-[80px]">{item.code}</span>
                          <button
                            onClick={(e) => toggleFavorite(item.id, e)}
                            className="p-1 text-[var(--faint)] hover:text-rose-500 transition-colors"
                          >
                            <Heart className={`w-3.5 h-3.5 ${isFav ? 'text-rose-500 fill-rose-500' : ''}`} />
                          </button>
                        </div>

                        {/* Middle Vector Preview Box */}
                        <div className="h-12 flex items-center justify-center py-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <div className="w-12 h-12 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: item.svgMarkup }} />
                        </div>

                        {/* Price footer bar */}
                        <div className="flex justify-between items-end gap-1.5 mt-1">
                          <span className="text-[9.5px] font-bold text-[var(--ink)] leading-tight truncate flex-1">{item.name}</span>
                          {item.price === 0 ? (
                            <span className="text-[8px] font-bold text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/60 px-1.5 py-0.5 rounded-lg leading-none shrink-0">
                              введите цену
                            </span>
                          ) : (
                            <span className="text-[9px] font-extrabold text-white bg-violet-600 dark:bg-violet-500 px-2 py-0.5 rounded-full leading-none shrink-0">
                              {item.price.toLocaleString('ru')} ₽
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* TAB 2: ACTIVE LAYERS LAYER MANAGER */}
            {activeSidebarTab === 'layers' && (
              <div className="flex flex-col justify-between h-full space-y-4">
                
                {activeScene.elements.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[var(--faint)] space-y-2">
                    <Info className="w-5 h-5 mx-auto text-[var(--faint)]" />
                    <p>На сцене пока нет элементов.</p>
                    <p className="text-[10px]">Выберите любой декор из вкладки "Библиотека".</p>
                  </div>
                ) : (
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[420px] pr-1">
                    {activeScene.elements.map((el, idx) => (
                      <div
                        key={el.id}
                        onClick={() => setSelectedId(el.id)}
                        className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                          el.id === selectedId
                            ? 'bg-[var(--lavSoft)] border-[var(--lavenderAccent)] text-[var(--lavDeep)] shadow-xs'
                            : 'bg-white/40 dark:bg-black/10 border-[var(--glass-edge)]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          
                          {/* Mini Graphics Visual representation */}
                          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-200/40 p-0.5">
                            {el.customImage ? (
                              <img src={el.customImage} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: el.svgMarkup }} />
                            )}
                          </div>

                          {/* Editable Details */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <input
                              type="text"
                              value={el.name}
                              onChange={(e) => {
                                const nextVal = e.target.value;
                                updateActiveSceneElements(prev => prev.map(item => item.id === el.id ? { ...item, name: nextVal } : item));
                              }}
                              className="w-full text-xs font-bold text-[var(--ink)] bg-transparent focus:underline focus:outline-none py-0 truncate"
                            />
                            
                            {/* Cost Input Field */}
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-[var(--faint)]">Стоимость:</span>
                              <input
                                type="number"
                                value={el.price}
                                onChange={(e) => {
                                  const nextPrice = parseInt(e.target.value) || 0;
                                  updateActiveSceneElements(prev => prev.map(item => item.id === el.id ? { ...item, price: nextPrice } : item));
                                }}
                                className="w-16 text-[10px] font-extrabold text-[var(--lavDeep)] bg-transparent focus:underline focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Order & visibility control panel */}
                        <div className="flex items-center gap-1.5 shrink-0 pl-2">
                          
                          {/* Arrow buttons for precise z-index stacked reordering */}
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleMoveLayer(idx, 'up'); }}
                              disabled={idx === activeScene.elements.length - 1}
                              className="p-0.5 rounded hover:bg-white/40 dark:hover:bg-zinc-800 text-[var(--faint)] hover:text-[var(--ink)] disabled:opacity-20"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleMoveLayer(idx, 'down'); }}
                              disabled={idx === 0}
                              className="p-0.5 rounded hover:bg-white/40 dark:hover:bg-zinc-800 text-[var(--faint)] hover:text-[var(--ink)] disabled:opacity-20"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Lock Trigger */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateActiveSceneElements(prev => prev.map(item => item.id === el.id ? { ...item, isLocked: !item.isLocked } : item));
                            }}
                            className="p-1.5 text-[var(--faint)] hover:text-[var(--ink)]"
                            title={el.isLocked ? "Заблокировано" : "Активно"}
                          >
                            {el.isLocked ? <Lock className="w-3.5 h-3.5 text-rose-500" /> : <Unlock className="w-3.5 h-3.5 text-zinc-400" />}
                          </button>

                          {/* Visibility Trigger */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateActiveSceneElements(prev => prev.map(item => item.id === el.id ? { ...item, isVisible: !item.isVisible } : item));
                            }}
                            className="p-1.5 text-[var(--faint)] hover:text-[var(--ink)]"
                          >
                            {el.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-rose-500" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sticky summary cost calculator footer */}
                <div className="pt-4 border-t border-[var(--glass-edge)]">
                  <div className="bg-[var(--lavDeep)] text-white p-4 rounded-2xl flex items-center justify-between shadow-lg shadow-violet-500/10">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-violet-200 uppercase tracking-wider">ИТОГО К ОПЛАТЕ:</span>
                      <span className="text-lg font-extrabold font-mono tracking-tight">
                        {sceneTotalCost.toLocaleString('ru')} ₽
                      </span>
                    </div>
                    <button 
                      onClick={handleSaveProjectCollage}
                      className="px-4 py-2 rounded-full bg-white hover:bg-zinc-100 text-[var(--lavDeep)] font-extrabold text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      Сохранить
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: OBJECT PROPERTIES & EDITING TOOLS */}
            {activeSidebarTab === 'tools' && (
              <div className="space-y-5">
                
                {selectedElem ? (
                  <div className="space-y-4">
                    
                    {/* Item title */}
                    <div className="flex items-center justify-between border-b border-[var(--glass-edge)] pb-2">
                      <span className="text-xs font-bold text-[var(--ink)]">{selectedElem.name}</span>
                      <span className="text-[10px] font-bold text-[var(--faint)]">{selectedElem.type}</span>
                    </div>

                    {/* Numeric sizing transformations in mm/cm/m */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-[var(--faint)] block">Габариты элемента</span>
                      <div className="flex items-center gap-2">
                        {/* Width */}
                        <div className="flex-1 space-y-1">
                          <label className="text-[10px] font-bold text-[var(--soft)] flex items-center gap-1">
                            <span>Ш ({activeUnit}):</span>
                          </label>
                          <input
                            type="number"
                            value={toDisplayValue(selectedElem.w * 10)}
                            onChange={(e) => {
                              const valMm = fromDisplayValue(parseFloat(e.target.value) || 10);
                              const nextW = Math.max(10, valMm / 10);
                              updateActiveSceneElements(prev => prev.map(item => {
                                if (item.id === selectedElem.id) {
                                  const ratio = item.h / item.w;
                                  const nextH = isRatioLocked ? nextW * ratio : item.h;
                                  return { ...item, w: nextW, h: nextH };
                                }
                                return item;
                              }));
                            }}
                            className="w-full px-2.5 py-1.5 rounded-xl bg-white/50 dark:bg-black/20 border border-[var(--glass-edge)] text-xs font-semibold text-[var(--ink)] focus:outline-none"
                          />
                        </div>

                        {/* Lock Ratio Button */}
                        <div className="flex items-center justify-center pt-5">
                          <button
                            type="button"
                            onClick={() => setIsRatioLocked(!isRatioLocked)}
                            className={`p-2 rounded-full border transition-all ${
                              isRatioLocked
                                ? 'bg-violet-50 dark:bg-violet-950/40 border-violet-300 text-violet-600'
                                : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-600'
                            }`}
                            title="Сохранять пропорции"
                          >
                            <Link className={`w-4 h-4 ${isRatioLocked ? 'rotate-45' : ''}`} />
                          </button>
                        </div>

                        {/* Height */}
                        <div className="flex-1 space-y-1">
                          <label className="text-[10px] font-bold text-[var(--soft)] flex items-center gap-1">
                            <span>В ({activeUnit}):</span>
                          </label>
                          <input
                            type="number"
                            value={toDisplayValue(selectedElem.h * 10)}
                            onChange={(e) => {
                              const valMm = fromDisplayValue(parseFloat(e.target.value) || 10);
                              const nextH = Math.max(10, valMm / 10);
                              updateActiveSceneElements(prev => prev.map(item => {
                                if (item.id === selectedElem.id) {
                                  const ratio = item.w / item.h;
                                  const nextW = isRatioLocked ? nextH * ratio : item.w;
                                  return { ...item, w: nextW, h: nextH };
                                }
                                return item;
                              }));
                            }}
                            className="w-full px-2.5 py-1.5 rounded-xl bg-white/50 dark:bg-black/20 border border-[var(--glass-edge)] text-xs font-semibold text-[var(--ink)] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Key Action Tools Grid (3x2 format) */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-[var(--faint)] block">Операции</span>
                      <div className="grid grid-cols-3 gap-2">
                        {/* Undo / Redo */}
                        <div className="flex rounded-full overflow-hidden border border-[var(--glass-edge)] bg-white dark:bg-zinc-900">
                          <button
                            onClick={handleUndo}
                            disabled={historyIndex === 0}
                            className="flex-1 py-2 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[var(--soft)] hover:text-[var(--ink)] disabled:opacity-20 cursor-pointer"
                            title="Отменить"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          <div className="w-[1px] bg-[var(--glass-edge)]" />
                          <button
                            onClick={handleRedo}
                            disabled={historyIndex >= history.length - 1}
                            className="flex-1 py-2 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[var(--soft)] hover:text-[var(--ink)] disabled:opacity-20 cursor-pointer"
                            title="Повторить"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Alignment (Center) */}
                        <button
                          onClick={() => handleAlignSelected('center')}
                          className="py-2 rounded-full border border-[var(--glass-edge)] bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex flex-col items-center justify-center gap-1 text-[var(--soft)] hover:text-[var(--ink)] cursor-pointer"
                          title="Центрировать"
                        >
                          <AlignCenter className="w-4 h-4" />
                          <span className="text-[8px] font-bold uppercase tracking-wider">центр</span>
                        </button>

                        {/* Mirror / Flip */}
                        <button
                          onClick={() => {
                            updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, isFlippedH: !item.isFlippedH } : item));
                          }}
                          className="py-2 rounded-full border border-[var(--glass-edge)] bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex flex-col items-center justify-center gap-1 text-[var(--soft)] hover:text-[var(--ink)] cursor-pointer"
                          title="Отразить зеркально"
                        >
                          <FlipHorizontal className="w-4 h-4" />
                          <span className="text-[8px] font-bold uppercase tracking-wider">зеркало</span>
                        </button>

                        {/* Lock / Unlock */}
                        <button
                          onClick={() => {
                            updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, isLocked: !item.isLocked } : item));
                            setSelectedId(null);
                          }}
                          className="py-2 rounded-full border border-[var(--glass-edge)] bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex flex-col items-center justify-center gap-1 text-[var(--soft)] hover:text-[var(--ink)] cursor-pointer"
                          title="Заблокировать"
                        >
                          {selectedElem.isLocked ? <Lock className="w-4 h-4 text-rose-500" /> : <Unlock className="w-4 h-4" />}
                          <span className="text-[8px] font-bold uppercase tracking-wider">замок</span>
                        </button>

                        {/* Copy / Duplicate */}
                        <button
                          onClick={() => {
                            const copyEl: CanvasElement = {
                              ...selectedElem,
                              id: `${selectedElem.id}-copy-${Date.now()}`,
                              x: selectedElem.x + 20,
                              y: selectedElem.y + 20
                            };
                            updateActiveSceneElements(prev => [...prev, copyEl]);
                            setSelectedId(copyEl.id);
                            showToast('Дублировано', 'Создан дубликат выбранного декора.', 'success');
                          }}
                          className="py-2 rounded-full border border-[var(--glass-edge)] bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex flex-col items-center justify-center gap-1 text-[var(--soft)] hover:text-[var(--ink)] cursor-pointer"
                          title="Дублировать"
                        >
                          <Copy className="w-4 h-4" />
                          <span className="text-[8px] font-bold uppercase tracking-wider">копия</span>
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => {
                            updateActiveSceneElements(prev => prev.filter(item => item.id !== selectedElem.id));
                            setSelectedId(null);
                            showToast('Удалено', 'Элемент удален с холста.', 'info');
                          }}
                          className="py-2 rounded-full border border-rose-100 bg-rose-50 dark:border-rose-950/40 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 flex flex-col items-center justify-center gap-1 text-rose-600 dark:text-rose-400 cursor-pointer"
                          title="Удалить со сцены"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-[8px] font-bold uppercase tracking-wider">удалить</span>
                        </button>
                      </div>
                    </div>

                    {/* Rotation slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-[var(--soft)]">
                        <span>Поворот:</span>
                        <span>{selectedElem.rotation}°</span>
                      </div>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={selectedElem.rotation}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, rotation: val } : item));
                        }}
                        className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-600"
                      />
                    </div>

                    {/* Color Filter Adjustments sliders */}
                    <div className="space-y-3.5 bg-zinc-50 dark:bg-zinc-950/20 p-3.5 rounded-2xl border border-[var(--glass-edge)]">
                      <span className="text-[11px] font-bold text-[var(--faint)] block">Цветовые эффекты</span>
                      
                      {/* Exposure */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-bold text-[var(--soft)]">
                          <span>Яркость (Экспозиция):</span>
                          <span>{selectedElem.exposure}%</span>
                        </div>
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          value={selectedElem.exposure}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, exposure: val } : item));
                          }}
                          className="w-full h-1 bg-zinc-200 dark:bg-zinc-850 rounded appearance-none cursor-pointer accent-violet-600"
                          style={{ background: 'linear-gradient(to right, #3f3f46, #a1a1aa, #fef08a)' }}
                        />
                      </div>

                      {/* Hue */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-bold text-[var(--soft)]">
                          <span>Оттенок (Тон):</span>
                          <span>{selectedElem.hue}°</span>
                        </div>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={selectedElem.hue}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, hue: val } : item));
                          }}
                          className="w-full h-1 bg-zinc-200 dark:bg-zinc-850 rounded appearance-none cursor-pointer accent-violet-600"
                          style={{ background: 'linear-gradient(to right, #ef4444, #eab308, #22c55e, #06b6d4, #3b82f6, #a855f7, #ef4444)' }}
                        />
                      </div>

                      {/* Temperature */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-bold text-[var(--soft)]">
                          <span>Теплота (Температура):</span>
                          <span>{selectedElem.temp}%</span>
                        </div>
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          value={selectedElem.temp}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, temp: val } : item));
                          }}
                          className="w-full h-1 bg-zinc-200 dark:bg-zinc-850 rounded appearance-none cursor-pointer accent-violet-600"
                          style={{ background: 'linear-gradient(to right, #3b82f6, #eff6ff, #f59e0b)' }}
                        />
                      </div>

                      {/* Saturation */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-bold text-[var(--soft)]">
                          <span>Насыщенность:</span>
                          <span>{selectedElem.saturate}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          value={selectedElem.saturate}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, saturate: val } : item));
                          }}
                          className="w-full h-1 bg-zinc-200 dark:bg-zinc-850 rounded appearance-none cursor-pointer accent-violet-600"
                          style={{ background: 'linear-gradient(to right, #a1a1aa, #c084fc, #8b5cf6)' }}
                        />
                      </div>

                      {/* Opacity */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-bold text-[var(--soft)]">
                          <span>Прозрачность:</span>
                          <span>{selectedElem.opacity}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={selectedElem.opacity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, opacity: val } : item));
                          }}
                          className="w-full h-1 bg-zinc-200 dark:bg-zinc-850 rounded appearance-none cursor-pointer accent-violet-600"
                          style={{ background: 'linear-gradient(to right, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 1))' }}
                        />
                      </div>

                    </div>

                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-[var(--faint)] space-y-3">
                    <Info className="w-5 h-5 mx-auto text-[var(--faint)]" />
                    <p>Ни один элемент не выбран.</p>
                    <p className="text-[10px]">Нажмите на любую арку или декор на сцене для настройки их размеров и цветокоррекции.</p>
                  </div>
                )}

              </div>
            )}

          </div>

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
                <td className="py-3 px-3 text-right text-base text-violet-700 font-mono">{sceneTotalCost.toLocaleString('ru')} ₽</td>
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
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal Body Card */}
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-[var(--glass-edge)] shadow-2xl p-6 overflow-hidden z-10"
            >
              
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-600" />
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
                  <RefreshCw className="w-8 h-8 text-violet-600 animate-spin mx-auto" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[var(--ink)]">ИИ Генерирует фон...</p>
                    <p className="text-xs text-[var(--faint)]">Создаем фотореалистичное пространство по вашему описанию.</p>
                  </div>
                  
                  {/* Visual Progress percentage slider line */}
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden max-w-xs mx-auto">
                    <div
                      className="bg-gradient-to-r from-violet-600 to-pink-600 h-full transition-all duration-300"
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
                    
                    <label className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950/40 hover:border-violet-500 cursor-pointer transition-all text-xs font-bold text-[var(--lavDeep)]">
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
                  <div className="p-4 rounded-2xl bg-violet-50/40 dark:bg-violet-950/10 border border-violet-100 dark:border-violet-900/40 space-y-3">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-violet-500 block">Вариант Б</span>
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
                      className="w-full py-2.5 rounded-full bg-[var(--lavDeep)] hover:opacity-90 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Сгенерировать интерьер</span>
                    </button>
                  </div>

                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
