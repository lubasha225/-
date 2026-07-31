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
  ChevronLeft,
  ChevronRight,
  Volume2,
  GripVertical,
  Sun,
  Contrast,
  Palette,
  Target,
  Droplet,
  ZoomIn,
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

  // Expanded project element in right sidebar
  const [expandedElementId, setExpandedElementId] = useState<string | null>(null);
  const [draftPrice, setDraftPrice] = useState<string>('');
  const [draftNote, setDraftNote] = useState<string>('');

  // Active popovers & adjustment floating tools
  const [activeToolPopover, setActiveToolPopover] = useState<'group' | 'layers' | 'flip' | null>(null);
  const [activeFilterTool, setActiveFilterTool] = useState<'brightness' | 'contrast' | 'saturate' | 'hue' | 'opacity' | 'temp' | null>(null);
  const [mobileDrawerTab, setMobileDrawerTab] = useState<'library' | 'layers' | 'tools' | null>(null);

  // Undo/Redo Stacking
  const [history, setHistory] = useState<EditorScene[][]>([JSON.parse(JSON.stringify(scenes))]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Library Category filtering
  const [selectedCategory, setSelectedCategory] = useState<string>('arches');
  const [libSearch, setLibSearch] = useState<string>('');
  const [favoritesList, setFavoritesList] = useState<string[]>(['text-1', 'arch-1']);
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
    const targetEl = activeScene.elements.find(el => el.id === id);
    if (targetEl && targetEl.groupId) {
      const groupElIds = activeScene.elements
        .filter(el => el.groupId === targetEl.groupId && el.isVisible)
        .map(el => el.id);
      setSelectedIds(groupElIds);
    } else {
      setSelectedId(id);
    }
    setActiveSidebarTab('tools');
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
            className="flex items-center justify-center gap-1.5 px-3.5 h-9 rounded-full bg-[var(--lavDeep)] hover:bg-[var(--lavenderAccent)] text-white text-xs font-bold transition-all shadow-md shadow-[var(--lavDeep)]/20 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">ИИ Макет</span>
          </button>
          
          <button
            onClick={handleSaveProjectCollage}
            className="flex items-center justify-center gap-1.5 px-3.5 h-9 rounded-full bg-white dark:bg-zinc-900 hover:bg-zinc-50 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-semibold transition-all shadow-xs cursor-pointer whitespace-nowrap shrink-0"
          >
            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="whitespace-nowrap">Сохранено</span>
          </button>

          <button
            onClick={handleDownloadLayout}
            className="flex items-center justify-center gap-1.5 px-3.5 h-9 rounded-full bg-white dark:bg-zinc-900 hover:bg-zinc-50 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-semibold transition-all shadow-xs cursor-pointer whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="whitespace-nowrap">Скачать</span>
          </button>

          <button
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                showToast('Проект', 'Возврат к списку проектов', 'info');
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
  }, [setHeaderActions, activeProjectId, projects, showToast]);

  const selectedElem = activeScene.elements.find(el => el.id === selectedId);

  const renderSidebarTabContent = (targetTab: 'library' | 'layers' | 'tools') => {
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
                        {cat.id === 'favorites' && <Heart className={`w-4 h-4 ${isSelected ? 'fill-[#5B3E88] text-[#5B3E88]' : 'text-rose-500 fill-rose-500'}`} />}
                        {cat.id === 'warehouse' && <Box className="w-4 h-4 text-amber-500" />}
                        {cat.id === 'arches' && <Layers className="w-4 h-4 text-indigo-500" />}
                        {cat.id === 'stands' && <Columns className="w-4 h-4 text-cyan-500" />}
                        {cat.id === 'tables' && <TableIcon className="w-4 h-4 text-emerald-500" />}
                        {cat.id === 'screens' && <GridIcon className="w-4 h-4 text-blue-500" />}
                        {cat.id === 'flowers' && <Flower2 className="w-4 h-4 text-pink-500" />}
                        {cat.id === 'compositions' && <Sparkles className="w-4 h-4 text-amber-400" />}
                        {cat.id === 'vases' && <Tag className="w-4 h-4 text-purple-500" />}
                        {cat.id === 'details' && <Compass className="w-4 h-4 text-teal-500" />}
                        {cat.id === 'textiles' && <AlignLeft className="w-4 h-4 text-sky-500" />}
                        {cat.id === 'light' && <Lightbulb className="w-4 h-4 text-yellow-500" />}
                        {cat.id === 'podiums' && <Columns className="w-4 h-4 text-orange-500" />}
                        {cat.id === 'furniture' && <Bookmark className="w-4 h-4 text-violet-500" />}
                        {cat.id === 'balloons' && <CircleDot className="w-4 h-4 text-rose-400" />}
                        {cat.id === 'themes' && <Sparkles className="w-4 h-4 text-emerald-600" />}
                      </button>

                      {/* Hover Tooltip showing category name */}
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 dark:bg-zinc-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-lg whitespace-nowrap border border-zinc-700/50">
                        {cat.title}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CARDS GRID AREA */}
              <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden max-h-full scrollbar-none pr-1">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(70px,1fr))] gap-2">
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
            <div className="flex items-center justify-between px-1">
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

                  return (
                    <div
                      key={el.id}
                      className={`rounded-2xl border transition-all overflow-hidden ${
                        el.id === selectedId
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
                          <GripVertical className="w-4 h-4 text-zinc-400 shrink-0 cursor-grab" />

                          {/* Thumbnail preview */}
                          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden border border-zinc-200/50 p-0.5">
                            {el.customImage ? (
                              <img src={el.customImage} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: el.svgMarkup }} />
                            )}
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

                        {/* Price badge and Visibility */}
                        <div className="flex items-center gap-2 shrink-0 pl-3">
                          <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                            {el.price > 0 ? `${el.price.toLocaleString('ru')} ₽` : '0 ₽'}
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateActiveSceneElements(prev => prev.map(item => item.id === el.id ? { ...item, isVisible: !item.isVisible } : item));
                            }}
                            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
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
          </div>
        )}

        {/* TAB 3: SELECTED ELEMENT TOOLS & ADJUSTMENTS */}
        {targetTab === 'tools' && (
          <div className="flex flex-col gap-3 flex-1 min-h-0 min-w-0 overflow-x-hidden">
            {selectedElem ? (
              <div className="space-y-4">
                
                {/* 1. Header with Selected Thumbnail */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-1 flex items-center justify-center shrink-0">
                    {selectedElem.customImage ? (
                      <img src={selectedElem.customImage} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: selectedElem.svgMarkup }} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-extrabold text-[var(--ink)] truncate">{selectedElem.name}</h3>
                    <p className="text-[10px] text-[var(--soft)]">Текущие размеры и положение</p>
                  </div>

                  <button
                    onClick={() => {
                      updateActiveSceneElements(prev => prev.filter(item => item.id !== selectedElem.id));
                      setSelectedId(null);
                    }}
                    className="p-1.5 rounded-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer shrink-0"
                    title="Удалить со сцены"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* 2. Position & Size Inputs (Ш x В) */}
                <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[var(--ink)]">
                    <span>Размеры объекта ({activeUnit})</span>
                    <button
                      onClick={() => setIsRatioLocked(!isRatioLocked)}
                      className={`p-1 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                        isRatioLocked ? 'bg-[var(--lavenderSoft)] text-[var(--lavDeep)] dark:bg-[var(--lavDeep)]/30 dark:text-[var(--lavenderAccent)]' : 'text-zinc-400 hover:text-zinc-600'
                      }`}
                      title={isRatioLocked ? 'Пропорции заблокированы' : 'Пропорции свободны'}
                    >
                      {isRatioLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      <span className="text-[10px]">Пропорции</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Width */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--soft)]">Ширина ({activeUnit})</label>
                      <input
                        type="number"
                        value={toDisplayValue(selectedElem.w * 10)}
                        onChange={(e) => {
                          const parsed = parseFloat(e.target.value);
                          if (isNaN(parsed)) return;
                          const newWMm = fromDisplayValue(parsed);
                          const newW = Math.max(10, Math.round(newWMm / 10));

                          if (isRatioLocked && selectedElem.w > 0) {
                            const ratio = selectedElem.h / selectedElem.w;
                            const newH = Math.max(10, Math.round(newW * ratio));
                            updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, w: newW, h: newH } : item));
                          } else {
                            updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, w: newW } : item));
                          }
                        }}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 text-xs font-bold text-[var(--ink)] focus:outline-none focus:border-[var(--lavDeep)]"
                      />
                    </div>

                    {/* Height */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--soft)]">Высота ({activeUnit})</label>
                      <input
                        type="number"
                        value={toDisplayValue(selectedElem.h * 10)}
                        onChange={(e) => {
                          const parsed = parseFloat(e.target.value);
                          if (isNaN(parsed)) return;
                          const newHMm = fromDisplayValue(parsed);
                          const newH = Math.max(10, Math.round(newHMm / 10));

                          if (isRatioLocked && selectedElem.h > 0) {
                            const ratio = selectedElem.w / selectedElem.h;
                            const newW = Math.max(10, Math.round(newH * ratio));
                            updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, w: newW, h: newH } : item));
                          } else {
                            updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, h: newH } : item));
                          }
                        }}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 text-xs font-bold text-[var(--ink)] focus:outline-none focus:border-[var(--lavDeep)]"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Quick Flip & Alignment Actions */}
                <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
                  <span className="text-xs font-bold text-[var(--ink)] block">Трансформация</span>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, isFlippedH: !item.isFlippedH } : item));
                      }}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        selectedElem.isFlippedH
                          ? 'bg-[var(--lavenderSoft)] text-[var(--lavDeep)] border-[var(--lavBorder)] dark:bg-[var(--lavDeep)]/30 dark:text-[var(--lavenderAccent)]'
                          : 'bg-zinc-50 dark:bg-zinc-850 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100'
                      }`}
                    >
                      <FlipHorizontal className="w-3.5 h-3.5" />
                      <span>Отразить по Г.</span>
                    </button>

                    <button
                      onClick={() => {
                        updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, isFlippedV: !item.isFlippedV } : item));
                      }}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        selectedElem.isFlippedV
                          ? 'bg-[var(--lavenderSoft)] text-[var(--lavDeep)] border-[var(--lavBorder)] dark:bg-[var(--lavDeep)]/30 dark:text-[var(--lavenderAccent)]'
                          : 'bg-zinc-50 dark:bg-zinc-850 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100'
                      }`}
                    >
                      <FlipVertical className="w-3.5 h-3.5" />
                      <span>Отразить по В.</span>
                    </button>
                  </div>

                  {/* Alignment buttons */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-bold text-[var(--soft)]">Выравнивание:</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleAlignSelected('left')}
                        className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 cursor-pointer"
                        title="По левому краю"
                      >
                        <AlignLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleAlignSelected('center')}
                        className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 cursor-pointer"
                        title="По центру"
                      >
                        <AlignCenter className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleAlignSelected('right')}
                        className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 cursor-pointer"
                        title="По правому краю"
                      >
                        <AlignRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. Color Corrections Sliders */}
                <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
                  <span className="text-xs font-bold text-[var(--ink)] block">Цветокоррекция элемента</span>

                  {/* Exposure / Brightness */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-[var(--soft)]">
                      <span>Экспозиция (Яркость):</span>
                      <span>{selectedElem.exposure > 0 ? `+${selectedElem.exposure}` : selectedElem.exposure}</span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={selectedElem.exposure}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, exposure: val } : item));
                      }}
                      className="w-full h-1 bg-zinc-200 dark:bg-zinc-850 rounded appearance-none cursor-pointer accent-[var(--lavDeep)]"
                      style={{ background: 'linear-gradient(to right, #27272a, #a1a1aa, #ffffff)' }}
                    />
                  </div>

                  {/* Hue Tone */}
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
                      className="w-full h-1 rounded appearance-none cursor-pointer"
                      style={{ background: 'linear-gradient(to right, red, yellow, green, cyan, blue, magenta, red)' }}
                    />
                  </div>

                  {/* Temperature */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-[var(--soft)]">
                      <span>Теплота (Температура):</span>
                      <span>{selectedElem.temp > 0 ? `+${selectedElem.temp}` : selectedElem.temp || 0}</span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={selectedElem.temp || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, temp: val } : item));
                      }}
                      className="w-full h-1 bg-zinc-200 dark:bg-zinc-850 rounded appearance-none cursor-pointer accent-[var(--lavDeep)]"
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
                      className="w-full h-1 bg-zinc-200 dark:bg-zinc-850 rounded appearance-none cursor-pointer accent-[var(--lavDeep)]"
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
                      className="w-full h-1 bg-zinc-200 dark:bg-zinc-850 rounded appearance-none cursor-pointer accent-[var(--lavDeep)]"
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
      </>
    );
  };

  return (
    <div className="flex-1 min-h-0 min-w-0 h-full pb-0.5 print:pb-0 grid grid-cols-1 lg:grid-cols-12 gap-1.5 sm:gap-3 print:hidden" onMouseMove={handleCanvasMouseMove} onMouseUp={handleCanvasMouseUp}>
      
      {/* LEFT COLUMN: ACTIVE WORKSPACE & HEADER (70% WIDTH) */}
      <div className="lg:col-span-8 flex flex-col gap-1 sm:gap-2.5 h-full min-h-0 min-w-0">

        {/* TOP EDITOR HEADER BAR - ULTRA COMPACT FOR MOBILE */}
        <div className="flex flex-col gap-0.5 py-0 px-0.5 shrink-0 print:hidden">
          {/* Top Row: Title on Left, Buttons aligned to Right Edge */}
          <div className="flex items-center justify-between gap-2 w-full">
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-[var(--ink)] truncate">
              {currentProject?.name || 'Проект 1'}
            </h1>

            {/* Right Action Buttons on the same top line */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
              <div
                title="Сохранено"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/40 flex items-center justify-center shadow-xs shrink-0 cursor-default"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              </div>

              <button
                onClick={() => setIsAiModalOpen(true)}
                title="ИИ Макет"
                aria-label="ИИ Макет"
                className="flex items-center justify-center gap-1.5 px-3 h-7 sm:h-8 rounded-full bg-[#5B3E88] hover:bg-[#4A3073] text-white text-xs font-bold transition-all shadow-md shadow-[#5B3E88]/20 cursor-pointer shrink-0 hover:scale-105"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0" />
                <span>ИИ Макет</span>
              </button>

              <button
                onClick={() => {
                  if (window.history.length > 1) {
                    window.history.back();
                  } else {
                    showToast('Проект', 'Возврат к списку проектов', 'info');
                  }
                }}
                title="Назад в проект"
                aria-label="Назад в проект"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center justify-center transition-all shadow-xs cursor-pointer shrink-0 hover:scale-105"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
              </button>
            </div>
          </div>

          {/* Bottom Row: Client info */}
          <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-[var(--soft)] font-medium">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-zinc-400" />
              Клиент: <strong className="text-[var(--ink)] font-semibold">{currentProject?.clientName || 'Анна Соколова'}</strong>
            </span>
            <span className="hidden sm:inline text-zinc-300">·</span>
            <span className="hidden sm:flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              Дата: <strong className="text-[var(--ink)] font-semibold">{currentProject?.date ? new Date(currentProject.date).toLocaleDateString('ru-RU') : '15.08.2026'}</strong>
            </span>
            <span className="hidden sm:inline text-zinc-300">·</span>
            <span className="hidden sm:flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              Локация: <strong className="text-[var(--ink)] font-semibold">{currentProject?.venue || 'Ресторан «Сафиса», Москва'}</strong>
            </span>
          </div>
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
                    onClick={() => showToast('Новая сцена', 'Создана новая визуализация', 'info')}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-zinc-800 hover:bg-zinc-100 flex items-center justify-center text-zinc-700 dark:text-zinc-200 transition-all cursor-pointer shadow-xs active:scale-95"
                    title="Добавить визуализацию"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setActiveWorkspaceTab('scene-1')}
                    className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      activeWorkspaceTab === 'scene-1'
                        ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/80'
                        : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900'
                    }`}
                  >
                    <span>Виз. 1</span>
                    <Paperclip className="w-3 h-3 text-zinc-400" />
                  </button>
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

                {/* FLOATING TOP UNDO/REDO PILL (Shifted left to leave room for the vertical toolbar) */}
                <div className="absolute top-1.5 right-12 sm:right-13 z-30 pointer-events-auto">
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

                {/* FLOATING RIGHT TOOLBAR - PRESSED TO CANVAS EDGES */}
                <div className="absolute top-1.5 right-1.5 bottom-1.5 z-30 flex flex-col items-end justify-between pointer-events-none pr-0.5 pb-0.5">
                  
                  {/* TOP ITEM: Standalone Zoom/Magnifier Button (Same size as Trash button) */}
                  <div className="p-0.5 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-lg border border-white/80 dark:border-zinc-700/60 pointer-events-auto">
                    <button
                      onClick={() => { setZoomScale(1); setPanX(0); setPanY(0); showToast('Масштаб', 'Сброшен к 100%', 'info'); }}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 dark:bg-zinc-800/90 text-[#5B3E88] dark:text-purple-300 hover:bg-white hover:shadow-md flex items-center justify-center transition-all cursor-pointer active:scale-95"
                      title="Вписать по размеру / Масштаб"
                    >
                      <ZoomIn className="w-4 h-4 stroke-[2.2]" />
                    </button>
                  </div>

                  {/* MIDDLE MAIN GROUP: Transformation & Layer Tools */}
                  <div className="p-1 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-lg border border-white/80 dark:border-zinc-700/60 flex flex-col items-center gap-1 pointer-events-auto my-auto">
                    
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
                        <div className="absolute right-9 top-0 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-1.5 rounded-xl shadow-xl flex flex-col gap-1 min-w-[170px]">
                          <button
                            onClick={() => {
                              handleGroupSelectedElements();
                              setActiveToolPopover(null);
                            }}
                            className="w-full px-3 py-2 rounded-lg text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-[var(--lavDeep)] flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Group className="w-4 h-4" />
                            <span>Сгруппировать</span>
                          </button>
                          <button
                            onClick={() => {
                              handleUngroupSelectedElements();
                              setActiveToolPopover(null);
                            }}
                            className="w-full px-3 py-2 rounded-lg text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-[var(--lavDeep)] flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Ungroup className="w-4 h-4" />
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
                        <div className="absolute right-9 top-0 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-1.5 rounded-xl shadow-xl flex flex-col gap-1 min-w-[160px]">
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
                            className="w-full px-3 py-2 rounded-lg text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-[var(--lavDeep)] flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <ArrowUpToLine className="w-4 h-4" />
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
                            className="w-full px-3 py-2 rounded-lg text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-[var(--lavDeep)] flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <ArrowUp className="w-4 h-4" />
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
                            className="w-full px-3 py-2 rounded-lg text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-[var(--lavDeep)] flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <ArrowDown className="w-4 h-4" />
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
                            className="w-full px-3 py-2 rounded-lg text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-[var(--lavDeep)] flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <ArrowDownToLine className="w-4 h-4" />
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
                        <div className="absolute right-9 top-0 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-1.5 rounded-xl shadow-xl flex flex-col gap-1 min-w-[155px]">
                          <button
                            onClick={() => {
                              if (selectedId) {
                                updateActiveSceneElements(els => els.map(el => el.id === selectedId ? { ...el, isFlippedH: !el.isFlippedH } : el));
                                showToast('Отражение', 'Отражено по горизонтали', 'info');
                              } else showToast('Выберите элемент', 'Кликните на элемент', 'info');
                              setActiveToolPopover(null);
                            }}
                            className="w-full px-3 py-2 rounded-lg text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-[var(--lavDeep)] flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <FlipHorizontal className="w-4 h-4" />
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
                            className="w-full px-3 py-2 rounded-lg text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-[var(--lavDeep)] flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <FlipVertical className="w-4 h-4" />
                            <span>По вертикали</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* BOTTOM GROUP: Color Correction & Trash Button (Always 100% visible at bottom right) */}
                  <div className="flex flex-col items-center gap-1.5 pointer-events-auto">
                    {/* Color Correction Tools Pill Block */}
                    <div className="p-1 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-lg border border-white/80 dark:border-zinc-700/60 flex flex-col items-center gap-1 relative">
                      
                      {/* 1. Яркость (Экспозиция) */}
                      <button
                        onClick={() => {
                          setActiveToolPopover(null);
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
                    </div>

                    {/* ALWAYS VISIBLE TRASH BUTTON AT BOTTOM RIGHT */}
                    <div className="p-0.5 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-lg border border-white/80 dark:border-zinc-700/60">
                      <button
                        onClick={() => {
                          if (selectedIds.length > 0) {
                            const count = selectedIds.length;
                            updateActiveSceneElements(els => els.filter(el => !selectedIds.includes(el.id)));
                            setSelectedIds([]);
                            showToast('Удалено', count > 1 ? `Удалено ${count} элементов с холста` : 'Элемент удален с холста', 'info');
                          } else {
                            showToast('Удаление', 'Выберите элементы для удаления', 'info');
                          }
                        }}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-rose-500 text-white hover:bg-rose-600 flex items-center justify-center shadow-md border border-rose-400/80 cursor-pointer transition-all active:scale-95"
                        title="Удалить выбранный элемент"
                      >
                        <Trash2 className="w-4 h-4 stroke-[2.2]" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Absolute centering wrapper so canvas element unscaled width/height never expands grid/flex layout */}
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none p-4">
                  <div
                    ref={canvasContainerRef}
                    className={`relative bg-zinc-900/90 rounded-2xl shadow-2xl border border-zinc-950/85 shrink-0 select-none pointer-events-auto ${isPanning ? '' : 'transition-transform duration-200'}`}
                    style={{
                      width: `${canvasWidthMm / 10}px`,
                      height: `${canvasHeightMm / 10}px`,
                      transform: `translate(${panX}px, ${panY}px) scale(${canvasScale * zoomScale})`,
                    }}
                    onClick={() => setSelectedIds([])}
                  >
                {/* Backdrop & Grid Clip Layer */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-0">
                  {activeScene.backdropType === 'image' && activeScene.backdropImage ? (
                    <img
                      src={activeScene.backdropImage}
                      alt="Backdrop"
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ opacity: 0.75 }}
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
                                      isNearTop ? 'top-full mt-4' : '-translate-y-[155px] top-0'
                                    } z-50 bg-zinc-900/95 dark:bg-zinc-900/95 text-white p-3 rounded-2xl shadow-2xl border border-purple-500/50 backdrop-blur-md flex flex-col items-center gap-2 pointer-events-auto min-w-[210px] animate-fadeIn`}
                                    style={{
                                      transform: `rotate(${-el.rotation}deg) scaleX(${el.isFlippedH ? -1 : 1}) scaleY(${el.isFlippedV ? -1 : 1}) scale(${1 / ((canvasScale * zoomScale) || 1)})`,
                                      transformOrigin: isNearTop ? 'top center' : 'bottom center'
                                    }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="flex items-center justify-between w-full pb-1 border-b border-white/10 text-xs font-bold text-purple-300">
                                      <span className="flex items-center gap-1.5">
                                        <RotateCw className="w-3.5 h-3.5 text-purple-400" />
                                        Угол поворота
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setRotationInputId(null);
                                        }}
                                        className="p-1 rounded-full hover:bg-white/15 text-zinc-400 hover:text-white transition-colors cursor-pointer"
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
                                        className="px-2 py-1 bg-zinc-800 hover:bg-purple-900/60 border border-zinc-700/80 rounded-lg text-xs font-bold text-purple-300 cursor-pointer transition-colors"
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
                                          className="w-16 px-2 py-1 text-center font-bold text-sm bg-zinc-950 border border-purple-500/50 rounded-lg text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                                        />
                                        <span className="absolute right-2 text-xs font-bold text-purple-400 pointer-events-none">°</span>
                                      </div>

                                      <button
                                        onClick={() => {
                                          const next = ((el.rotation + 15) % 360 + 360) % 360;
                                          updateActiveSceneElements(prev => prev.map(item => item.id === el.id ? { ...item, rotation: next } : item));
                                        }}
                                        className="px-2 py-1 bg-zinc-800 hover:bg-purple-900/60 border border-zinc-700/80 rounded-lg text-xs font-bold text-purple-300 cursor-pointer transition-colors"
                                        title="+15°"
                                      >
                                        +15°
                                      </button>
                                    </div>

                                    {/* Preset Angle Pills */}
                                    <div className="flex items-center justify-between w-full gap-1 pt-1.5 border-t border-white/10">
                                      {[0, 45, 90, 180, 270].map((deg) => (
                                        <button
                                          key={deg}
                                          onClick={() => {
                                            updateActiveSceneElements(prev => prev.map(item => item.id === el.id ? { ...item, rotation: deg } : item));
                                          }}
                                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                            el.rotation === deg
                                              ? 'bg-purple-600 text-white shadow-xs'
                                              : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white'
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

                          {/* FLOATING QUICK TOOLBAR - Adaptive position at bottom or top with rounded-full bg-black/40 backdrop-blur */}
                          {(() => {
                            const isNearBottom = (el.y + el.h) > (canvasHeightMm / 10 - 70);
                            return (
                              <div
                                className={`absolute left-1/2 -translate-x-1/2 ${
                                  isNearBottom ? 'bottom-[calc(100%+16px)]' : 'top-[calc(100%+16px)]'
                                } flex items-center gap-1.5 bg-black/40 dark:bg-black/50 text-white px-2.5 py-1 rounded-full shadow-2xl border border-white/20 backdrop-blur-md z-50 pointer-events-auto`}
                                style={{
                                  transform: `rotate(${-el.rotation}deg) scaleX(${el.isFlippedH ? -1 : 1}) scaleY(${el.isFlippedV ? -1 : 1}) scale(${1 / ((canvasScale * zoomScale) || 1)})`,
                                  transformOrigin: isNearBottom ? 'bottom center' : 'top center'
                                }}
                              >
                                {/* Lock Toggle */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateActiveSceneElements(prev => prev.map(item => item.id === el.id ? { ...item, isLocked: !item.isLocked } : item));
                                  }}
                                  className="p-1.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
                                  title={el.isLocked ? "Разблокировать" : "Заблокировать"}
                                >
                                  {el.isLocked ? (
                                    <Lock className="w-3.5 h-3.5 text-rose-400" />
                                  ) : (
                                    <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                                  )}
                                </button>

                                {/* Copy/Duplicate */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDuplicateElement(el);
                                  }}
                                  className="p-1.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
                                  title="Копировать"
                                >
                                  <Copy className="w-3.5 h-3.5 text-cyan-300" />
                                </button>

                                <div className="w-[1px] h-3.5 bg-white/40" />

                                {/* Delete/Trash */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateActiveSceneElements(prev => prev.filter(item => item.id !== el.id));
                                    setSelectedId(null);
                                    showToast('Удалено', 'Элемент удален с холста.', 'info');
                                  }}
                                  className="p-1.5 rounded-full hover:bg-rose-500/40 transition-colors cursor-pointer"
                                  title="Удалить со сцены"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
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
                      >
                        <span className="text-[10px] font-extrabold text-white bg-purple-600/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-purple-400/50 shadow-md flex items-center gap-1.5">
                          <BoxSelect className="w-3 h-3 text-purple-200" />
                          Выделено элементов: {selectedElements.length}
                        </span>
                      </div>

                      {/* FLOATING GROUP TOOLBAR */}
                      <div
                        className={`absolute left-1/2 -translate-x-1/2 ${
                          isNearTop ? 'bottom-2' : '-top-14'
                        } flex items-center gap-1.5 bg-zinc-900/95 text-white px-3 py-1.5 rounded-full shadow-2xl border border-purple-500/50 backdrop-blur-md z-50 pointer-events-auto`}
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
                          className="p-1.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer text-zinc-300 hover:text-white"
                          title="Заблокировать / Разблокировать группу"
                        >
                          {selectedElements.every(el => el.isLocked) ? (
                            <Lock className="w-3.5 h-3.5 text-rose-400" />
                          ) : (
                            <Unlock className="w-3.5 h-3.5 text-emerald-400" />
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
                          className="p-1.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer text-zinc-300 hover:text-white"
                          title="Скопировать всю группу"
                        >
                          <Copy className="w-3.5 h-3.5 text-cyan-300" />
                        </button>

                        {/* Persistent Group / Ungroup button */}
                        {selectedElements.some(el => el.groupId) ? (
                          <button
                            onClick={handleUngroupSelectedElements}
                            className="px-2.5 py-1 rounded-full bg-purple-600/90 hover:bg-purple-500 text-xs font-bold text-white flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                            title="Разгруппировать (сделать элементы независимыми)"
                          >
                            <Ungroup className="w-3.5 h-3.5" />
                            <span>Разгруппировать</span>
                          </button>
                        ) : (
                          <button
                            onClick={handleGroupSelectedElements}
                            className="px-2.5 py-1 rounded-full bg-purple-600/90 hover:bg-purple-500 text-xs font-bold text-white flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                            title="Сгруппировать в постоянную группу"
                          >
                            <Group className="w-3.5 h-3.5" />
                            <span>Сгруппировать</span>
                          </button>
                        )}

                        <div className="w-[1px] h-3.5 bg-white/30" />

                        {/* Delete group */}
                        <button
                          onClick={() => {
                            updateActiveSceneElements(prev => prev.filter(el => !selectedIds.includes(el.id)));
                            setSelectedIds([]);
                            showToast('Удалено', `Удалено ${selectedElements.length} элементов`, 'info');
                          }}
                          className="p-1.5 rounded-full hover:bg-rose-500/40 transition-colors cursor-pointer text-rose-400 hover:text-rose-200"
                          title="Удалить группу со сцены"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Deselect / Close */}
                        <button
                          onClick={() => setSelectedIds([])}
                          className="p-1.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer text-zinc-400 hover:text-white"
                          title="Снять выделение"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })()}
                  </div>

                  {/* SLIDER POPUP FOR SELECTED ADJUSTMENT TOOL (Fixed Screen Viewport Overlay) */}
                  {selectedElem && activeFilterTool && (
                    <div className="absolute right-6 top-6 z-50 bg-zinc-900/95 dark:bg-zinc-900/95 text-white border border-zinc-700/80 p-3.5 rounded-2xl shadow-2xl flex flex-col gap-2.5 w-60 backdrop-blur-xl pointer-events-auto animate-fadeIn">
                      <div className="flex justify-between items-center text-xs font-bold text-zinc-100 pb-1.5 border-b border-white/10">
                        <span className="flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-purple-400" />
                          {activeFilterTool === 'brightness' && 'Яркость (Экспозиция)'}
                          {activeFilterTool === 'hue' && 'Оттенок (Тон)'}
                          {activeFilterTool === 'temp' && 'Теплота (Температура)'}
                          {activeFilterTool === 'saturate' && 'Насыщенность'}
                          {activeFilterTool === 'opacity' && 'Прозрачность'}
                        </span>
                        <button onClick={() => setActiveFilterTool(null)} className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {activeFilterTool === 'brightness' && (
                        <input
                          type="range"
                          min="-50"
                          max="50"
                          value={selectedElem.exposure}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, exposure: val } : item));
                          }}
                          className="w-full accent-purple-400 cursor-pointer"
                        />
                      )}

                      {activeFilterTool === 'hue' && (
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={selectedElem.hue}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, hue: val } : item));
                          }}
                          className="w-full accent-purple-400 cursor-pointer"
                        />
                      )}

                      {activeFilterTool === 'temp' && (
                        <input
                          type="range"
                          min="-50"
                          max="50"
                          value={selectedElem.temp || 0}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, temp: val } : item));
                          }}
                          className="w-full accent-purple-400 cursor-pointer"
                        />
                      )}

                      {activeFilterTool === 'saturate' && (
                        <input
                          type="range"
                          min="0"
                          max="200"
                          value={selectedElem.saturate}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, saturate: val } : item));
                          }}
                          className="w-full accent-purple-400 cursor-pointer"
                        />
                      )}

                      {activeFilterTool === 'opacity' && (
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={selectedElem.opacity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            updateActiveSceneElements(prev => prev.map(item => item.id === selectedElem.id ? { ...item, opacity: val } : item));
                          }}
                          className="w-full accent-purple-400 cursor-pointer"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* BOTTOM PANELS IN LEFT COLUMN: TAB BAR + DIMENSIONS/CONTROLS PANEL */}
          {activeWorkspaceTab !== 'floorplan' && (
            <div className="shrink-0 relative z-30 space-y-1.5 pt-0.5">
              {/* SLIDE-UP DRAWER WHEN A TAB IS EXPANDED */}
              <AnimatePresence>
                {mobileDrawerTab && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.98 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute bottom-full left-0 right-0 mb-1 z-50 max-h-[50vh] sm:max-h-[380px] flex flex-col bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden"
                  >
                    {/* Drawer Header */}
                    <div className="flex items-center justify-between px-3.5 py-2 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md shrink-0">
                      <div className="flex items-center gap-2 text-xs font-bold text-[var(--ink)]">
                        {mobileDrawerTab === 'library' && <BookOpen className="w-4 h-4 text-[#5B3E88] dark:text-purple-400" />}
                        {mobileDrawerTab === 'layers' && <Layers className="w-4 h-4 text-[#5B3E88] dark:text-purple-400" />}
                        {mobileDrawerTab === 'tools' && <Sliders className="w-4 h-4 text-[#5B3E88] dark:text-purple-400" />}
                        <span>
                          {mobileDrawerTab === 'library' && 'Библиотека декора'}
                          {mobileDrawerTab === 'layers' && `Элементы на сцене (${activeScene.elements.length})`}
                          {mobileDrawerTab === 'tools' && 'Инструменты редактирования'}
                        </span>
                      </div>
                      <button
                        onClick={() => setMobileDrawerTab(null)}
                        className="p-1 rounded-full hover:bg-zinc-200/80 dark:hover:bg-zinc-800/80 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
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

              {/* PANEL 1: 3-TAB BUTTONS BAR */}
              <div className="p-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-full border border-zinc-200/80 dark:border-zinc-800/80 grid grid-cols-3 gap-1 shadow-xs text-xs">
                <button
                  onClick={() => {
                    setMobileDrawerTab(prev => prev === 'library' ? null : 'library');
                    setActiveSidebarTab('library');
                  }}
                  className={`py-1.5 px-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    mobileDrawerTab === 'library'
                      ? 'bg-[#EAE4F8] text-[#5B3E88] dark:bg-purple-950 dark:text-purple-200 shadow-xs border border-[#D4C5ED]/50'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Библиотека</span>
                </button>
                <button
                  onClick={() => {
                    setMobileDrawerTab(prev => prev === 'layers' ? null : 'layers');
                    setActiveSidebarTab('layers');
                  }}
                  className={`py-1.5 px-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    mobileDrawerTab === 'layers'
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
                <button
                  onClick={() => {
                    setMobileDrawerTab(prev => prev === 'tools' ? null : 'tools');
                    setActiveSidebarTab('tools');
                  }}
                  className={`py-1.5 px-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    mobileDrawerTab === 'tools'
                      ? 'bg-[#EAE4F8] text-[#5B3E88] dark:bg-purple-950 dark:text-purple-200 shadow-xs border border-[#D4C5ED]/50'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Инструменты</span>
                </button>
              </div>

              {/* PANEL 2: FIELD DIMENSIONS & TOGGLES (Ш 650 x В 440 | Фон | Сетка | Человек) */}
              <div className="flex items-center justify-between gap-1.5 text-xs overflow-x-auto no-scrollbar py-0.5">
                {/* Dimensions Inputs */}
                <div className="flex items-center gap-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs shrink-0">
                  <div className="flex items-center gap-0.5">
                    <span className="font-extrabold text-[#5B3E88] dark:text-purple-400 text-xs">Ш</span>
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
                      className="w-10 text-center font-bold text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md py-0.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#5B3E88]"
                    />
                  </div>
                  <span className="text-zinc-400 font-bold text-xs">×</span>
                  <div className="flex items-center gap-0.5">
                    <span className="font-extrabold text-[#5B3E88] dark:text-purple-400 text-xs">В</span>
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
                      className="w-10 text-center font-bold text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md py-0.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#5B3E88]"
                    />
                  </div>
                </div>

                {/* Right Action Toggles: Backdrop, Grid, Human */}
                <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1.5 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md hover:bg-purple-50 dark:hover:bg-purple-950/50 text-zinc-700 dark:text-zinc-200 font-bold text-xs flex items-center gap-1 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs cursor-pointer transition-colors"
                    title="Загрузить изображение фона"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#5B3E88] dark:text-purple-400 shrink-0" />
                    <span>Фон</span>
                  </button>

                  <button
                    onClick={() => setGridVisible(!gridVisible)}
                    className={`px-2.5 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 border shadow-xs transition-all cursor-pointer ${
                      gridVisible
                        ? 'bg-[#EAE4F8] text-[#5B3E88] border-[#D4C5ED] dark:bg-purple-950 dark:text-purple-200'
                        : 'bg-white/90 dark:bg-zinc-900/90 text-zinc-600 border-zinc-200/80 dark:border-zinc-800/80'
                    }`}
                    title="Показать / скрыть сетку"
                  >
                    <Grid className="w-3.5 h-3.5 shrink-0" />
                    <div className={`w-7 h-4 rounded-full relative p-0.5 transition-colors duration-200 flex items-center ${
                      gridVisible ? 'bg-[#5B3E88]' : 'bg-zinc-300 dark:bg-zinc-700'
                    }`}>
                      <div className={`w-3 h-3 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                        gridVisible ? 'translate-x-3' : 'translate-x-0'
                      }`} />
                    </div>
                  </button>

                  <button
                    onClick={() => setHumanVisible(!humanVisible)}
                    className={`px-2.5 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 border shadow-xs transition-all cursor-pointer ${
                      humanVisible
                        ? 'bg-[#EAE4F8] text-[#5B3E88] border-[#D4C5ED] dark:bg-purple-950 dark:text-purple-200'
                        : 'bg-white/90 dark:bg-zinc-900/90 text-zinc-600 border-zinc-200/80 dark:border-zinc-800/80'
                    }`}
                    title="Показать / скрыть силуэт человека"
                  >
                    <User className="w-3.5 h-3.5 shrink-0" />
                    <div className={`w-7 h-4 rounded-full relative p-0.5 transition-colors duration-200 flex items-center ${
                      humanVisible ? 'bg-[#5B3E88]' : 'bg-zinc-300 dark:bg-zinc-700'
                    }`}>
                      <div className={`w-3 h-3 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                        humanVisible ? 'translate-x-3' : 'translate-x-0'
                      }`} />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}


        </div>

        {/* RIGHT COLUMN: CONTROL SIDE PANEL (30% WIDTH) - DESKTOP ONLY */}
        <div className="hidden lg:flex lg:col-span-4 flex-col bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs backdrop-blur-md h-full min-h-0 min-w-0">
          
          {/* TAB BAR SELECTORS IN A CLEAN ROUNDED CONTAINER */}
          <div className="p-1.5 bg-zinc-100/90 dark:bg-zinc-900/60 rounded-full m-3 mb-0 grid grid-cols-3 gap-1 border border-zinc-200/60 dark:border-zinc-800/60 shrink-0">
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
            <button
              onClick={() => setActiveSidebarTab('tools')}
              className={`py-2 px-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeSidebarTab === 'tools'
                  ? 'bg-[#EAE4F8] text-[#5B3E88] dark:bg-purple-950 dark:text-purple-200 shadow-xs border border-[#D4C5ED]/50'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Инструменты</span>
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
