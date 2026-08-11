import React, { useState, useEffect, useRef } from 'react';
import { EditorSketchCanvasPreview } from './EditorSketchCanvasPreview';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ArrowLeft,
  Plus,
  Trash2,
  Check,
  Search,
  RotateCcw,
  Sliders,
  Eye,
  Lock,
  Sparkles,
  Info,
  Calendar,
  MapPin,
  User,
  Mail,
  Palette,
  FileText,
  Layout,
  Share2,
  FolderOpen,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Phone,
  HelpCircle,
  Zap,
  CheckCircle2,
  CheckCircle,
  Download,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  ChevronsRight,
  ChevronsLeft,
  CheckSquare,
  FileSpreadsheet,
  FileCheck,
  Send,
  Edit2,
  Image as ImageIcon,
  ArrowUpRight,
  Filter,
  MessageSquare,
  Layers,
  Award,
  Save,
  Flower2,
  Truck,
  ShieldCheck,
  FileSignature,
  Wallet,
  Receipt,
  CreditCard
} from 'lucide-react';
import { Project, EstimateItem } from '../types';
import DeleteConfirmModal from './DeleteConfirmModal';

interface ProjectDetailModalProps {
  project: Project | null;
  isOpen?: boolean;
  onClose: () => void;
  onUpdateProject: (updated: Project) => void;
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warn') => void;
  onOpenEditor?: () => void;
}

interface JournalEntry {
  id: string;
  timestamp: string;
  type: 'system' | 'user-note' | 'important' | 'client-agreed';
  text: string;
  linkedItemId: string | null;
}

export default function ProjectDetailModal({
  project,
  onClose,
  onUpdateProject,
  showToast,
  onOpenEditor
}: ProjectDetailModalProps) {
  if (!project) return null;

  // Tabs for Variant 1: 'all' | 'brief' | 'design' | 'calc' | 'journal' | 'docs' | 'calendar'
  const [activeTab, setActiveTab] = useState<'all' | 'brief' | 'design' | 'calc' | 'journal' | 'docs' | 'calendar'>('all');

  // Commercial financial calculation settings
  const [markupPercent, setMarkupPercent] = useState<number>(20);
  const [taxRate, setTaxRate] = useState<number>(6);
  const [finalPrice, setFinalPrice] = useState<number>(() => project.clientPrice !== undefined ? project.clientPrice : (project.budget || 95000));
  const [prepayment, setPrepayment] = useState<number>(30000);

  // Hotspot modal state
  const [activeArchPoint, setActiveArchPoint] = useState<string>('A-304');
  const [isSpecModalOpen, setIsSpecModalOpen] = useState<boolean>(false);
  const [briefCollapsed, setBriefCollapsed] = useState<boolean>(false);
  const [journalCollapsed, setJournalCollapsed] = useState<boolean>(false);

  // Delete confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    title?: string;
    itemName?: string;
    description?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    onConfirm: () => {}
  });

  // Custom decorator fields dynamically added by user
  const [customDecoratorFields, setCustomDecoratorFields] = useState<{ id: string; key: string }[]>([]);
  const [isAddingCustomField, setIsAddingCustomField] = useState<boolean>(false);
  const [newFieldName, setNewFieldName] = useState<string>('');

  // Brief values state for direct inline editing on cards
  const [briefValues, setBriefValues] = useState<Record<string, string>>(() => {
    const saved = project.briefValues || {};
    return {
      "ИМЯ КЛИЕНТА": project.clientName && project.clientName !== 'Не указан' ? project.clientName : (saved["ИМЯ КЛИЕНТА"] || ""),
      "ТЕЛЕФОН": project.clientPhone || saved["ТЕЛЕФОН"] || "",
      "СОБЫТИЕ": project.name && !project.name.startsWith('proj_') ? project.name : (saved["СОБЫТИЕ"] || ""),
      "ДАТА": project.date || saved["ДАТА"] || "",
      "ГОСТЕЙ": project.brief?.guestsCount ? String(project.brief.guestsCount) : (saved["ГОСТЕЙ"] || ""),
      "ФОРМАТ СОБЫТИЯ": saved["ФОРМАТ СОБЫТИЯ"] || "",
      "АДРЕС ПЛОЩАДКИ/НАЗВАНИЕ": project.venue && project.venue !== 'Площадка не указана' ? project.venue : (saved["АДРЕС ПЛОЩАДКИ/НАЗВАНИЕ"] || saved["ПЛОЩАДКА"] || ""),
      "КОНТАКТ ПЛОЩАДКИ": saved["КОНТАКТ ПЛОЩАДКИ"] || "",
      "РАЗМЕР ЗОНЫ МОНТАЖА": saved["РАЗМЕР ЗОНЫ МОНТАЖА"] || "",
      "КРЕПЕЖ К СТЕНАМ": saved["КРЕПЕЖ К СТЕНАМ"] || "",
      "КРЕПЕЖ К ПОТОЛКУ": saved["КРЕПЕЖ К ПОТОЛКУ"] || "",
      "СОГЛАСОВАНИЕ ОФОРМЛЕНИЯ": saved["СОГЛАСОВАНИЕ ОФОРМЛЕНИЯ"] || "",
      "ЭЛЕКТРИЧЕСТВО У СЦЕНЫ": saved["ЭЛЕКТРИЧЕСТВО У СЦЕНЫ"] || "",
      "ПОДЪЕЗД / ГРУЗОВОЙ ЛИФТ": saved["ПОДЪЕЗД / ГРУЗОВОЙ ЛИФТ"] || "",
      "ПРАЗДНИК НА УЛИЦЕ": saved["ПРАЗДНИК НА УЛИЦЕ"] || "",
      "ДОСТУП НА МОНТАЖ": saved["ДОСТУП НА МОНТАЖ"] || "",
      "ОКНО МОНТАЖА": saved["ОКНО МОНТАЖА"] || "",
      "ХРАНЕНИЕ НА ПЛОЩАДКЕ": saved["ХРАНЕНИЕ НА ПЛОЩАДКЕ"] || "",
      "ДЕМОНТАЖ / ВЫВОЗ": saved["ДЕМОНТАЖ / ВЫВОЗ"] || "",
      "КТО ПРИНИМАЕТ РАБОТЫ": saved["КТО ПРИНИМАЕТ РАБОТЫ"] || "",
      "ПАЛИТРА ОФОРМЛЕНИЯ": project.brief?.colors && project.brief.colors.length > 0 && project.brief.colors[0] !== '#FFFFFF' ? project.brief.colors.join(', ') : (saved["ПАЛИТРА ОФОРМЛЕНИЯ"] || ""),
      "СТИЛЬ ОФОРМЛЕНИЯ": project.brief?.style && project.brief.style !== 'Не выбран' ? project.brief.style : (saved["СТИЛЬ ОФОРМЛЕНИЯ"] || ""),
      "КОНСТРУКЦИИ ДЕКОРА": saved["КОНСТРУКЦИИ ДЕКОРА"] || "",
      "ОРИЕНТИРОВОЧНЫЙ БЮДЖЕТ": project.budget ? `${project.budget.toLocaleString('ru')} ₽` : (saved["ОРИЕНТИРОВОЧНЫЙ БЮДЖЕТ"] || ""),
      "ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ": project.brief?.specialRequests && project.brief.specialRequests !== 'Нет примечаний.' ? project.brief.specialRequests : (saved["ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ"] || ""),
    };
  });

  const handleUpdateBriefField = (key: string, value: string) => {
    setBriefValues(prev => {
      const next = { ...prev, [key]: value };
      let updatedBudget = project.budget;
      let updatedClientPrice = project.clientPrice;

      if (key === "ОРИЕНТИРОВОЧНЫЙ БЮДЖЕТ") {
        const digits = value.replace(/\D/g, '');
        if (digits) {
          const num = parseInt(digits, 10);
          if (!isNaN(num)) {
            updatedBudget = num;
            if (project.clientPrice === undefined) {
              updatedClientPrice = num;
              setFinalPrice(num);
            }
          }
        }
      }

      onUpdateProject({
        ...project,
        briefValues: next,
        budget: updatedBudget,
        clientPrice: updatedClientPrice
      });
      return next;
    });
  };
  const [calendarCollapsed, setCalendarCollapsed] = useState<boolean>(false);
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'user-note' | 'system'>('all');

  // Interactive estimates local input fields
  const [newEstName, setNewEstName] = useState('');
  const [newEstCat, setNewEstCat] = useState('Декор');
  const [newEstPrice, setNewEstPrice] = useState(1500);

  // Dedicated Decor & Work inputs
  const [newDecorName, setNewDecorName] = useState('');
  const [newDecorPrice, setNewDecorPrice] = useState<number | ''>('');
  const [newWorkName, setNewWorkName] = useState('');
  const [newWorkPrice, setNewWorkPrice] = useState<number | ''>('');
  const [showAddDecorRow, setShowAddDecorRow] = useState(false);
  const [showAddWorkRow, setShowAddWorkRow] = useState(false);

  // Journal tasks and notes interface & state
  interface ProjectTaskNoteItem {
    id: string;
    projectId?: string;
    projectName?: string;
    type: 'task' | 'note';
    title: string;
    dueDate: string; // e.g. "2026-08-15"
    completed?: boolean;
    category: 'Закупка' | 'Монтаж' | 'Смета' | 'Логистика' | 'Клиент' | 'Важное' | 'Общее';
    createdAt: string;
  }

  const [taskNoteList, setTaskNoteList] = useState<ProjectTaskNoteItem[]>(() => {
    const saved = localStorage.getItem('pop_project_tasks_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const hasRecord = parsed.some((item: any) => item.projectId === project.id || item.projectName === project.name || item._projectTouch === project.id);
          if (hasRecord) {
            return parsed.filter((item: any) => item.projectId === project.id || item.projectName === project.name);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Default sample items ONLY for initial mock projects 'p1' or 'p2'
    if (project.id === 'p1' || project.id === 'p2') {
      const defaultDate = project.date?.split('T')[0] || '2026-08-15';
      return [
        {
          id: `tn_${project.id}_1`,
          projectId: project.id,
          projectName: project.name,
          type: 'task',
          title: 'Заехать к флористу и подтвердить поставку пионовидных роз',
          dueDate: defaultDate,
          completed: true,
          category: 'Закупка',
          createdAt: '12.08.2026'
        },
        {
          id: `tn_${project.id}_2`,
          projectId: project.id,
          projectName: project.name,
          type: 'task',
          title: 'Согласовать схему расстановки столов и арки с менеджером площадки',
          dueDate: defaultDate,
          completed: false,
          category: 'Монтаж',
          createdAt: '13.08.2026'
        },
        {
          id: `tn_${project.id}_3`,
          projectId: project.id,
          projectName: project.name,
          type: 'task',
          title: 'Проверить состояние текстиля и чехлов перед погрузкой в автомобиль',
          dueDate: defaultDate,
          completed: false,
          category: 'Логистика',
          createdAt: '14.08.2026'
        },
        {
          id: `tn_${project.id}_4`,
          projectId: project.id,
          projectName: project.name,
          type: 'note',
          title: 'Заказчик просила использовать золотые подсвечники вместо серебряных',
          dueDate: defaultDate,
          category: 'Клиент',
          createdAt: '14.08.2026'
        },
        {
          id: `tn_${project.id}_5`,
          projectId: project.id,
          projectName: project.name,
          type: 'note',
          title: 'Везд на площадку через КПП №2 только с 14:00, при себе иметь паспорт',
          dueDate: defaultDate,
          category: 'Важное',
          createdAt: '15.08.2026'
        }
      ];
    }

    // For any new project, start with an empty journal list
    return [];
  });

  // Helper to persist taskNoteList locally and globally for right sidebar synchronization
  const syncGlobalProjectTasks = (updatedProjectTasks: ProjectTaskNoteItem[]) => {
    setTaskNoteList(updatedProjectTasks);
    const saved = localStorage.getItem('pop_project_tasks_v2');
    let allGlobalTasks: any[] = [];
    if (saved) {
      try { allGlobalTasks = JSON.parse(saved); } catch (e) { }
    }
    const otherTasks = allGlobalTasks.filter(item => item.projectId !== project.id && item.projectName !== project.name && item._projectTouch !== project.id);
    const touchMarker = { _projectTouch: project.id, projectId: project.id, projectName: project.name };
    const newGlobalList = [...updatedProjectTasks, ...otherTasks, touchMarker];
    localStorage.setItem('pop_project_tasks_v2', JSON.stringify(newGlobalList));
    window.dispatchEvent(new Event('project_tasks_updated'));
  };

  // Form input states for adding task/note
  const [newType, setNewType] = useState<'task' | 'note'>('task');
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('2026-08-15');
  const [newCategory, setNewCategory] = useState<'Закупка' | 'Монтаж' | 'Смета' | 'Логистика' | 'Клиент' | 'Важное' | 'Общее'>('Монтаж');

  // Filter states
  const [journalFilterType, setJournalFilterType] = useState<'all' | 'task' | 'note'>('all');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>('all'); // 'all' or '2026-08-15'

  // Auto-save & Manual Save state
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSaveProject = (isAuto = false) => {
    setIsSaving(true);
    const updatedProject: Project = {
      ...project,
      budget: finalPrice,
      updatedAt: new Date().toISOString()
    };
    onUpdateProject(updatedProject);

    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastSavedTime(formattedTime);

    setTimeout(() => {
      setIsSaving(false);
      if (!isAuto) {
        showToast('Проект сохранен', `Все изменения проекта успешно сохранены в ${formattedTime}`, 'success');
      }
    }, 400);
  };

  // Auto-save every 5 minutes (300,000 ms)
  useEffect(() => {
    const timer = setInterval(() => {
      handleSaveProject(true);
    }, 300000); // 5 minutes

    return () => clearInterval(timer);
  }, [project, finalPrice]);

  // Carousel state for Visualizations
  const [vizIndex, setVizIndex] = useState<number>(0);
  const visualizations = (project?.scenesData && project.scenesData.length > 0)
    ? project.scenesData.map((sc: any, i: number) => {
        const rawImg = sc.backdropImage || sc.image || sc.imageUrl || '';
        const img = (rawImg && !rawImg.includes('unsplash')) ? rawImg : '';
        return {
          id: sc.id || i + 1,
          title: sc.name ? sc.name.toUpperCase() : `ВИЗУАЛИЗАЦИЯ ${i + 1}`,
          subtitle: sc.subtitle || 'Эскиз оформления',
          image: img,
          sceneIndex: i,
          sceneData: sc,
          elements: sc.elements
        };
      })
    : [
        {
          id: 1,
          title: 'ВИЗУАЛИЗАЦИЯ 1',
          subtitle: 'Концепция декор-арки и зоны церемонии',
          image: '',
          sceneIndex: 0,
          sceneData: null,
          elements: []
        },
        {
          id: 2,
          title: 'ВИЗУАЛИЗАЦИЯ 2',
          subtitle: 'Президиум и стол молодоженов',
          image: '',
          sceneIndex: 1,
          sceneData: null,
          elements: []
        }
      ];

  // Carousel state for AI Visualizations
  const [aiVizIndex, setAiVizIndex] = useState<number>(0);
  const aiVisualizations = [
    {
      id: 1,
      title: 'ИИ ВИЗУАЛИЗАЦИЯ 1 (ЗОНА ЦЕРЕМОНИИ)',
      subtitle: 'Генерация ИИ: Цветочная арка и зеркальный подиум',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 2,
      title: 'ИИ ВИЗУАЛИЗАЦИЯ 2 (ВЕЧЕРНЕЕ ОСВЕЩЕНИЕ)',
      subtitle: 'Генерация ИИ: Подсветка столов и ретро-гирлянды',
      image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 3,
      title: 'ИИ ВИЗУАЛИЗАЦИЯ 3 (ФОТОЗОНА & ТЕКСТИЛЬ)',
      subtitle: 'Генерация ИИ: Сервировка стола и драпировка ткани',
      image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80'
    }
  ];

  // Venue photos array with default venue photos + uploaded photos support
  const [venuePhotos, setVenuePhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=600&q=80'
  ]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (venuePhotos.length >= 6) {
      showToast('Лимит достигнут', 'Максимальное количество фото в галерее — 6', 'info');
      if (e.target) e.target.value = '';
      return;
    }
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setVenuePhotos(prev => prev.length < 6 ? [...prev, event.target!.result as string] : prev);
          showToast('Фото загружено', 'Новое фото площадки успешно добавлено в проект', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  // Horizontal gallery drag-to-scroll & navigation arrow handlers
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!galleryRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - galleryRef.current.offsetLeft);
    setScrollLeft(galleryRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !galleryRef.current) return;
    e.preventDefault();
    const x = e.pageX - galleryRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    galleryRef.current.scrollLeft = scrollLeft - walk;
  };

  const scrollGallery = (direction: 'left' | 'right') => {
    if (galleryRef.current) {
      const amount = direction === 'left' ? -220 : 220;
      galleryRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (project) {
      const priceToSet = project.clientPrice !== undefined
        ? project.clientPrice
        : (project.budget || 95000);
      setFinalPrice(priceToSet);
    }
  }, [project.id]);

  // Point specs mapping
  const pointSpecifications: Record<string, { title: string; desc: string }> = {
    'A-304': {
      title: "Конструктив фотозоны каркас",
      desc: "ID детали: A-304. Металлический устойчивый задник для крепления декоративных панелей. Находится на складе, тип источника: аренда."
    },
    'B-012': {
      title: "Наполнение гирляндами из шаров",
      desc: "ID детали: B-012. Нитевой теплый занавес, вешается на каркас арки. Потребуется бережный монтаж на тросах, арендная позиция."
    },
    'C-001': {
      title: "Шары световые (набор 50 шт)",
      desc: "ID детали: C-001. Одноразовый декоративный расходник со встроенными светодиодами. Для работы необходимо задать цену в смете."
    },
    'D-210': {
      title: "Живая сортовая флористика (розы)",
      desc: "ID детали: D-210. Натуральные премиальные цветы. Расходный материал, требующий ручного внесения рыночной стоимости флориста."
    }
  };

  const addJournalLog = (text: string, type: 'system' | 'user-note' | 'important' | 'client-agreed', linkedId: string | null = null) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newEntry: ProjectTaskNoteItem = {
      id: `tn_${Date.now()}`,
      type: 'note',
      title: text,
      dueDate: todayStr,
      category: 'Общее',
      createdAt: new Date().toLocaleDateString('ru-RU')
    };
    setTaskNoteList(prev => [newEntry, ...prev]);
  };

  // Stepper labels
  const steps = ['Бриф', 'Визуализация', 'Смета', 'Согласовано'];
  const progressPercentages = [25, 50, 75, 100];

  const handleStepClick = (stepIndex: number) => {
    const updated = { ...project, currentStep: stepIndex };
    onUpdateProject(updated);
    addJournalLog(`Статус проекта изменен на «${steps[stepIndex]}»`, 'system');
    showToast('Этап изменен', `Проект переведен в статус: ${steps[stepIndex]}`, 'success');
  };

  // Disabled scenes state & custom scene prices
  const [disabledSceneIds, setDisabledSceneIds] = useState<string[]>(() => project.disabledSceneIds || []);
  const [customScenePrices, setCustomScenePrices] = useState<Record<string, number>>(() => project.customScenePrices || {});

  // Sync state if project props change
  useEffect(() => {
    if (project.disabledSceneIds) {
      setDisabledSceneIds(project.disabledSceneIds);
    }
    if (project.customScenePrices) {
      setCustomScenePrices(project.customScenePrices);
    }
  }, [project.id]);

  // Construct visualization scenes list
  const defaultVisualizationScenes = [
    {
      id: 'scene-1',
      name: 'Визуализация 1',
      subtitle: 'Декор-арка и зона торжественной церемонии',
      defaultPrice: 70000,
      elements: [
        { name: 'Конструктив фотозоны каркас', price: 25000 },
        { name: 'Живая сортовая флористика (розы)', price: 45000 }
      ]
    },
    {
      id: 'scene-2',
      name: 'Визуализация 2',
      subtitle: '3D Эскиз оформления президиума и столов',
      defaultPrice: 45000,
      elements: [
        { name: 'Оформление президиума текстилем', price: 20000 },
        { name: 'Композиция из цветов на стол', price: 25000 }
      ]
    },
    {
      id: 'scene-3',
      name: 'Визуализация 3',
      subtitle: 'Приветственная Welcome-зона и план рассадки',
      defaultPrice: 35000,
      elements: [
        { name: 'Приветственный задекорированный стенд', price: 15000 },
        { name: 'Декоративные свечи и стойки', price: 20000 }
      ]
    }
  ];

  const visualizationScenes = (project.scenesData && Array.isArray(project.scenesData))
    ? project.scenesData
    : (project.id && project.id.startsWith('p') ? defaultVisualizationScenes : []);

  // Helper function to calculate total cost for a scene
  const getSceneCost = (sc: any) => {
    if (customScenePrices[sc.id] !== undefined) {
      return customScenePrices[sc.id];
    }
    if (sc.elements && Array.isArray(sc.elements) && sc.elements.length > 0) {
      return sc.elements.reduce((sum: number, el: any) => sum + (Number(el.price) || 0), 0);
    }
    return sc.defaultPrice || 0;
  };

  // Service estimate (Work & Delivery)
  const rawServiceEstimate = project.estimate ? project.estimate.filter(item => item.category === 'Работа' || item.category === 'Доставка') : [];
  const serviceEstimate = (project.estimate && project.estimate.length > 0)
    ? rawServiceEstimate
    : (project.id && project.id.startsWith('p') ? [
        { id: 'def_work_1', name: 'Монтаж и демонтаж конструкций', category: 'Работа', quantity: 1, price: 12000 },
        { id: 'def_work_2', name: 'Транспортная доставка (Грузовой авто)', category: 'Доставка', quantity: 1, price: 5000 }
      ] : []);

  const decorCost = visualizationScenes.reduce((sum: number, sc: any) => {
    if (disabledSceneIds.includes(sc.id)) return sum;
    return sum + getSceneCost(sc);
  }, 0);

  const serviceCost = serviceEstimate.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1), 0);
  const totalCost = decorCost + serviceCost;

  const recommendedPrice = totalCost * (1 + (markupPercent / 100));
  const taxAmount = finalPrice * (taxRate / 100);
  const calculatedProfit = finalPrice - totalCost - taxAmount;
  const profitMarginPercent = finalPrice > 0 ? Math.round((calculatedProfit / finalPrice) * 100) : 0;

  // Toggle visualization scene (Вкл / Выкл) in estimate
  const handleToggleSceneInEstimate = (sceneId: string) => {
    const isCurrentlyDisabled = disabledSceneIds.includes(sceneId);
    let nextDisabled: string[];
    if (isCurrentlyDisabled) {
      nextDisabled = disabledSceneIds.filter(id => id !== sceneId);
    } else {
      nextDisabled = [...disabledSceneIds, sceneId];
    }
    setDisabledSceneIds(nextDisabled);

    onUpdateProject({
      ...project,
      disabledSceneIds: nextDisabled
    });

    const sceneObj = visualizationScenes.find((sc: any) => sc.id === sceneId);
    const sceneName = sceneObj?.name || sceneId;
    if (isCurrentlyDisabled) {
      showToast('Включено в смету', `«${sceneName}» включена в расчет сметы`, 'success');
    } else {
      showToast('Исключено из сметы', `«${sceneName}» отключена и не учитывается в расчете`, 'info');
    }
  };

  // Update scene price directly in table
  const handleUpdateScenePrice = (sceneId: string, newPrice: number) => {
    const nextCustom = { ...customScenePrices, [sceneId]: newPrice };
    setCustomScenePrices(nextCustom);

    onUpdateProject({
      ...project,
      customScenePrices: nextCustom
    });
  };

  const handleUpdateSceneName = (sceneId: string, name: string) => {
    const updatedScenes = visualizationScenes.map((sc: any) =>
      sc.id === sceneId ? { ...sc, name } : sc
    );
    onUpdateProject({ ...project, scenesData: updatedScenes });
  };

  const handleDeleteScene = (sceneId: string) => {
    const sceneObj = visualizationScenes.find((sc: any) => sc.id === sceneId);
    const sceneName = sceneObj?.name || 'Позиция декора';
    setDeleteConfirm({
      isOpen: true,
      title: 'Удалить декор из сметы?',
      itemName: sceneName,
      description: `Вы действительно хотите безвозвратно удалить «${sceneName}» из сметного расчета?`,
      onConfirm: () => {
        const updatedScenes = visualizationScenes.filter((sc: any) => sc.id !== sceneId);
        const nextCustom = { ...customScenePrices };
        delete nextCustom[sceneId];
        setCustomScenePrices(nextCustom);

        onUpdateProject({
          ...project,
          scenesData: updatedScenes,
          customScenePrices: nextCustom
        });
        showToast('Декор удален', 'Позиция декора удалена из сметы', 'info');
        setDeleteConfirm(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleUpdateEstimateItemName = (id: string, name: string) => {
    const updatedEstimate = serviceEstimate.map(item => item.id === id ? { ...item, name } : item);
    onUpdateProject({ ...project, estimate: updatedEstimate });
  };

  const handleUpdateEstimateItemPrice = (id: string, price: number) => {
    const updatedEstimate = serviceEstimate.map(item => item.id === id ? { ...item, price } : item);
    onUpdateProject({ ...project, estimate: updatedEstimate });
  };

  const handleDeleteEstimateItem = (id: string) => {
    const item = serviceEstimate.find(i => i.id === id);
    const itemName = item?.name || 'Позиция';
    setDeleteConfirm({
      isOpen: true,
      title: 'Удалить позицию?',
      itemName,
      description: `Вы действительно хотите удалить «${itemName}» из сметы?`,
      onConfirm: () => {
        const updatedEstimate = serviceEstimate.filter(i => i.id !== id);
        onUpdateProject({ ...project, estimate: updatedEstimate });
        showToast('Позиция удалена', 'Позиция удалена из сметы', 'info');
        setDeleteConfirm(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleAddWorkPosition = () => {
    if (!showAddWorkRow) {
      setShowAddWorkRow(true);
      return;
    }
    const nameToAdd = newWorkName.trim() || 'Новые монтажные работы';
    const priceToAdd = newWorkPrice !== '' ? Number(newWorkPrice) : 0;
    const newItem: EstimateItem = {
      id: `work_${Date.now()}`,
      name: nameToAdd,
      category: 'Доставка',
      quantity: 1,
      price: priceToAdd
    };
    const updatedEstimate = [...serviceEstimate, newItem];
    onUpdateProject({ ...project, estimate: updatedEstimate });
    setNewWorkName('');
    setNewWorkPrice('');
    setShowAddWorkRow(false);
    showToast('Работа добавлена', `Добавлена позиция «${nameToAdd}» (${priceToAdd.toLocaleString('ru')} ₽)`, 'success');
  };

  // Add Estimate Item via Form
  const handleAddEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEstName.trim()) return;

    const newItem: EstimateItem = {
      id: `est_${Date.now()}`,
      name: newEstName,
      category: newEstCat,
      quantity: 1,
      price: Number(newEstPrice) || 0
    };

    const nextEstimate = [...project.estimate, newItem];

    const updated = {
      ...project,
      estimate: nextEstimate
    };

    onUpdateProject(updated);
    addJournalLog(`Добавлена новая позиция сметы: «${newEstName}»`, 'system', newItem.id);

    setNewEstName('');
    showToast('Добавлено', 'Создана новая строчка в калькуляционном блоке.', 'success');
  };

  // Remove item
  const handleRemoveEstimate = (itemId: string, name: string) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Удалить из сметы?',
      itemName: name,
      description: `Вы действительно хотите удалить «${name}» из сметы?`,
      onConfirm: () => {
        const nextEstimate = project.estimate.filter(item => item.id !== itemId);
        const updated = {
          ...project,
          estimate: nextEstimate
        };
        onUpdateProject(updated);
        addJournalLog(`Позиция «${name}» удалена из сметы`, 'system');
        showToast('Удалено', 'Строка сметы исключена из расчетов.', 'info');
        setDeleteConfirm(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Edit item quantity/price inline
  const handleUpdateItemPrice = (itemId: string, price: number) => {
    const nextEstimate = project.estimate.map(item => item.id === itemId ? { ...item, price } : item);

    const updated = {
      ...project,
      estimate: nextEstimate
    };
    onUpdateProject(updated);
  };

  const handleUpdateItemQty = (itemId: string, quantity: number) => {
    const nextEstimate = project.estimate.map(item => item.id === itemId ? { ...item, quantity } : item);

    const updated = {
      ...project,
      estimate: nextEstimate
    };
    onUpdateProject(updated);
  };

  // Reset estimates list
  const handleResetCalculator = () => {
    const defaultEstimate: EstimateItem[] = [
      { id: "A-304", name: "Конструктив фотозоны каркас", category: "Конструкции", quantity: 1, price: 8000 },
      { id: "B-012", name: "Наполнение гирляндами из шаров", category: "Декор", quantity: 1, price: 3000 },
      { id: "C-001", name: "Шары световые (набор 50 шт)", category: "Декор", quantity: 1, price: 1500 },
      { id: "D-210", name: "Живая сортовая флористика (розы)", category: "Флористика", quantity: 1, price: 24000 },
      { id: "S-001", name: "Монтаж · 4 ч × 2 декоратора", category: "Работа", quantity: 1, price: 6000 },
      { id: "S-002", name: "Транспортная доставка (Грузовой борт)", category: "Доставка", quantity: 1, price: 2500 }
    ];

    const updated = {
      ...project,
      estimate: defaultEstimate
    };

    onUpdateProject(updated);
    setMarkupPercent(20);
    addJournalLog("Выполнен полный сброс калькулятора сметы к изначальным спецификациям", "system");
    showToast('Сброшено', 'Смета переустановлена к изначальным спецификациям.', 'info');
  };

  // Add Custom Task/Note Handler
  const handleAddTaskNote = () => {
    if (!newTitle.trim()) {
      showToast('Заполните название', 'Пожалуйста, введите текст задачи или заметки.', 'warn');
      return;
    }

    const newItem: ProjectTaskNoteItem = {
      id: `tn_${Date.now()}`,
      projectId: project.id,
      projectName: project.name,
      type: newType,
      title: newTitle.trim(),
      dueDate: newDueDate || project.date?.split('T')[0] || '2026-08-15',
      completed: newType === 'task' ? false : undefined,
      category: newCategory,
      createdAt: new Date().toLocaleDateString('ru-RU')
    };

    const nextList = [newItem, ...taskNoteList];
    syncGlobalProjectTasks(nextList);
    setNewTitle('');
    showToast(
      newType === 'task' ? 'Задача добавлена' : 'Заметка добавлена',
      `Запись успешно привязана к дате ${newItem.dueDate} и синхронизирована с календарем`,
      'success'
    );
  };

  const handleToggleTaskNote = (id: string) => {
    const nextList = taskNoteList.map(item => {
      if (item.id === id && item.type === 'task') {
        const nextVal = !item.completed;
        if (nextVal) {
          showToast('Задача выполнена', `Отмечено как выполнено: "${item.title}"`, 'success');
        }
        return { ...item, completed: nextVal };
      }
      return item;
    });
    syncGlobalProjectTasks(nextList);
  };

  const handleDeleteTaskNote = (id: string) => {
    const item = taskNoteList.find(i => i.id === id);
    const itemTitle = item?.title || 'Запись';
    const isTask = item?.type === 'task';
    setDeleteConfirm({
      isOpen: true,
      title: isTask ? 'Удалить задачу?' : 'Удалить заметку?',
      itemName: itemTitle,
      description: `Вы действительно хотите удалить ${isTask ? 'задачу' : 'заметку'} «${itemTitle}» из журнала?`,
      onConfirm: () => {
        const nextList = taskNoteList.filter(i => i.id !== id);
        syncGlobalProjectTasks(nextList);
        showToast('Удалено', 'Запись удалена из журнала проекта.', 'info');
        setDeleteConfirm(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Hotspot selective Spec modal opener
  const handleSelectHotspot = (pointId: string) => {
    setActiveArchPoint(pointId);
    setIsSpecModalOpen(true);
  };

  // Brief field dataset grouped systematically: Client fields first, then Decorator fields
  const baseBriefFieldDefinitions: { key: string; filledBy: 'client' | 'designer'; multiline?: boolean }[] = [
    // --- 1. КЛИЕНТСКИЙ БЛОК (22 поля) ---
    { key: "ИМЯ КЛИЕНТА", filledBy: 'client' },
    { key: "ТЕЛЕФОН", filledBy: 'client' },
    { key: "СОБЫТИЕ", filledBy: 'client' },
    { key: "ДАТА", filledBy: 'client' },
    { key: "ГОСТЕЙ", filledBy: 'client' },
    { key: "ФОРМАТ СОБЫТИЯ", filledBy: 'client' },
    { key: "АДРЕС ПЛОЩАДКИ/НАЗВАНИЕ", filledBy: 'client' },
    { key: "КОНТАКТ ПЛОЩАДКИ", filledBy: 'client' },
    { key: "РАЗМЕР ЗОНЫ МОНТАЖА", filledBy: 'client' },
    { key: "КРЕПЕЖ К СТЕНАМ", filledBy: 'client' },
    { key: "КРЕПЕЖ К ПОТОЛКУ", filledBy: 'client' },
    { key: "СОГЛАСОВАНИЕ ОФОРМЛЕНИЯ", filledBy: 'client' },
    { key: "ЭЛЕКТРИЧЕСТВО У СЦЕНЫ", filledBy: 'client' },
    { key: "ПОДЪЕЗД / ГРУЗОВОЙ ЛИФТ", filledBy: 'client' },
    { key: "ПРАЗДНИК НА УЛИЦЕ", filledBy: 'client' },
    { key: "ХРАНЕНИЕ НА ПЛОЩАДКЕ", filledBy: 'client' },
    { key: "ДЕМОНТАЖ / ВЫВОЗ", filledBy: 'client' },
    { key: "КТО ПРИНИМАЕТ РАБОТЫ", filledBy: 'client' },
    { key: "ПАЛИТРА ОФОРМЛЕНИЯ", filledBy: 'client' },
    { key: "СТИЛЬ ОФОРМЛЕНИЯ", filledBy: 'client' },
    { key: "ОРИЕНТИРОВОЧНЫЙ БЮДЖЕТ", filledBy: 'client' },
    { key: "ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ", filledBy: 'client', multiline: true },

    // --- 2. БЛОК ДЕКОРАТОРА (базовые + пользовательские поля) ---
    { key: "ДОСТУП НА МОНТАЖ", filledBy: 'designer' },
    { key: "ОКНО МОНТАЖА", filledBy: 'designer' },
    { key: "КОНСТРУКЦИИ ДЕКОРА", filledBy: 'designer' },
  ];

  const briefFieldDefinitions = [
    ...baseBriefFieldDefinitions,
    ...customDecoratorFields.map(f => ({ key: f.key, filledBy: 'designer' as const }))
  ];

  const filledBriefCount = briefFieldDefinitions.filter(f => {
    const v = briefValues[f.key];
    return v && v.trim() !== "" && v !== "(требует заполнения)";
  }).length;
  const totalBriefCount = briefFieldDefinitions.length;
  const briefFilledPercentage = Math.round((filledBriefCount / totalBriefCount) * 100);
  const briefEmptyCount = totalBriefCount - filledBriefCount;

  return (
    <div className="w-full max-w-full min-w-0 overflow-hidden space-y-6 transition-all">
      {/* 1. TOP HEADER NAVIGATION BAR (Full Width at Top) */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 shrink-0 px-1 w-full min-w-0">
        <div className="flex-1 min-w-0 w-full space-y-2.5">
          {/* Title & Status / Progress Badges */}
          <div className="flex flex-wrap items-center gap-3 w-full min-w-0">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 dark:text-stone-50 truncate max-w-full">
              {project.name}
            </h1>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-100/90 dark:bg-purple-950/60 text-[#582F89] dark:text-purple-200 border border-purple-200/80 dark:border-purple-800/60 shadow-2xs shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#8C52D0]" /> {steps[project.currentStep]?.toUpperCase()}
            </span>
          </div>

          {/* Client & Project Info */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-xs text-stone-600 dark:text-stone-400 w-full min-w-0">
            <span className="flex items-center gap-1.5 font-medium text-stone-800 dark:text-stone-200 shrink-0">
              <User className="w-3.5 h-3.5 text-[#8C52D0]" /> Клиент: <strong className="font-bold text-stone-900 dark:text-stone-100">{project.clientName}</strong>
            </span>
            <span className="text-stone-300 dark:text-stone-700 hidden sm:inline">•</span>
            <a href={`tel:${project.clientPhone || briefValues["ТЕЛЕФОН"] || '+7 905 123 45 67'}`} className="flex items-center gap-1.5 font-medium text-stone-700 dark:text-stone-300 hover:text-[#8C52D0] transition-colors shrink-0">
              <Phone className="w-3.5 h-3.5 text-[#8C52D0]" /> {project.clientPhone || briefValues["ТЕЛЕФОН"] || '+7 905 123 45 67'}
            </a>
            <span className="text-stone-300 dark:text-stone-700 hidden sm:inline">•</span>
            <a href={`mailto:${project.clientEmail || 'socolova.design@mail.ru'}`} className="flex items-center gap-1.5 font-medium text-stone-700 dark:text-stone-300 hover:text-[#8C52D0] transition-colors truncate max-w-[220px]">
              <Mail className="w-3.5 h-3.5 text-[#8C52D0] shrink-0" /> {project.clientEmail || 'socolova.design@mail.ru'}
            </a>
            <span className="text-stone-300 dark:text-stone-700 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-[#8C52D0]" /> {project.date}
            </span>
            <span className="text-stone-300 dark:text-stone-700 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-[#8C52D0]" /> {project.venue}
            </span>
          </div>
        </div>

        {/* Action Buttons Block */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start xl:self-center w-full sm:w-auto">
          <button
            onClick={() => {
              const briefUrl = `${window.location.origin}/brief/${project.id}`;
              navigator.clipboard.writeText(briefUrl);
              showToast('Ссылка отправлена клиенту', `Ссылка для клиента ${project.clientName} скопирована в буфер обмена: ${briefUrl}`, 'success');
            }}
            className="h-9 px-5 text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-300 hover:shadow-lg hover:opacity-95 active:scale-[0.98] cursor-pointer shrink-0 shadow-md flex-1 sm:flex-none"
            style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
          >
            <Share2 className="w-3.5 h-3.5" /> Отправить клиенту
          </button>

          <button
            onClick={() => handleSaveProject(false)}
            disabled={isSaving}
            title={lastSavedTime ? `Последнее сохранение: ${lastSavedTime} (автосохранение каждые 5 мин)` : 'Автосохранение каждые 5 минут'}
            className="h-9 px-4 border border-emerald-600 dark:border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer disabled:opacity-70 shrink-0 flex-1 sm:flex-none"
          >
            <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
            {isSaving ? 'Сохранение...' : lastSavedTime ? `Сохранено (${lastSavedTime})` : 'Сохранить'}
          </button>
        </div>
      </header>

      {/* 2-COLUMN MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 sm:gap-5 min-w-0 w-full items-start overflow-hidden">
        {/* LEFT SIDEBAR (STICKY FROM TOP ON DESKTOP, SIDE-BY-SIDE 2-COLUMN GRID ON MOBILE/TABLET) */}
        <aside className="w-full lg:w-60 shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-col gap-3 sm:gap-4 lg:sticky lg:top-4 z-20 self-start min-w-0">
          {/* SIDEBAR NAVIGATION CARD */}
          <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-[var(--glass-edge)] rounded-3xl p-3.5 sm:p-4 shadow-sm w-full min-w-0 flex flex-col justify-center">
            {/* MOBILE & TABLET LAYOUT (3 ROWS x 2 COLUMNS GRID, HORIZONTAL ITEM: ICON + TEXT + BADGE) */}
            <nav className="grid grid-cols-2 lg:hidden gap-2 w-full">
              {[
                { id: 'all', label: 'Обзор', icon: Layout, badge: '7', badgeColor: 'bg-stone-200/80 text-stone-700 dark:bg-zinc-800 dark:text-stone-300' },
                { id: 'brief', label: 'Бриф', icon: Clipboard, badge: '4!', badgeColor: 'bg-rose-100/90 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' },
                { id: 'design', label: 'Дизайн', icon: Palette, badge: 'OK', badgeColor: 'bg-emerald-100/90 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' },
                { id: 'calc', label: 'Смета', icon: SlidersHorizontal, badge: '2!', badgeColor: 'bg-purple-100/90 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' },
                { id: 'journal', label: 'Заметки', icon: CheckSquare, badge: taskNoteList.filter(t => t.type === 'task' && !t.completed).length.toString(), badgeColor: 'bg-purple-100/90 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' },
                { id: 'docs', label: 'Документы', icon: FolderOpen, badge: '4', badgeColor: 'bg-stone-200/80 text-stone-700 dark:bg-zinc-800 dark:text-stone-300' }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center justify-between gap-1.5 px-3 py-2.5 rounded-2xl transition-all duration-200 cursor-pointer min-w-0 ${
                      isActive
                        ? 'border border-[#8C52D0] dark:border-purple-400 text-[#582F89] dark:text-purple-200 bg-purple-50/50 dark:bg-purple-950/30 shadow-[0_0_12px_rgba(140,82,208,0.25)]'
                        : 'border border-stone-200/80 dark:border-zinc-800 text-[#1B0D22] dark:text-zinc-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100/70 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#8C52D0]' : 'text-stone-500 dark:text-stone-400'}`} />
                      <span className="text-[14px] font-normal leading-tight truncate">
                        {tab.label}
                      </span>
                    </div>
                    <span className={`text-[14px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                      isActive ? 'bg-purple-100 dark:bg-purple-950 text-[#582F89] dark:text-purple-200' : tab.badgeColor
                    }`}>
                      {tab.badge}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* DESKTOP LAYOUT (VERTICAL SIDEBAR MENU) */}
            <nav className="hidden lg:flex lg:flex-col space-y-1">
              {[
                { id: 'all', label: 'Обзор', icon: Layout, badge: '7', badgeColor: 'bg-stone-200/80 text-stone-700 dark:bg-zinc-800 dark:text-stone-300' },
                { id: 'brief', label: 'Бриф', icon: Clipboard, badge: '4!', badgeColor: 'bg-rose-100/90 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' },
                { id: 'design', label: 'Дизайн', icon: Palette, badge: 'OK', badgeColor: 'bg-emerald-100/90 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' },
                { id: 'calc', label: 'Смета', icon: SlidersHorizontal, badge: '2!', badgeColor: 'bg-purple-100/90 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' },
                { id: 'journal', label: 'Заметки', icon: CheckSquare, badge: taskNoteList.filter(t => t.type === 'task' && !t.completed).length.toString(), badgeColor: 'bg-purple-100/90 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' },
                { id: 'docs', label: 'Документы', icon: FolderOpen, badge: '4', badgeColor: 'bg-stone-200/80 text-stone-700 dark:bg-zinc-800 dark:text-stone-300' }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center justify-between gap-2 p-2.5 rounded-full text-[14px] transition-all duration-300 text-left cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-[#8C52D0] to-[#582F89] text-white shadow-xs'
                        : 'text-[#1B0D22] dark:text-zinc-300 hover:bg-stone-200/60 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#582F89] dark:text-purple-400'}`} />
                      <span className="font-normal">{tab.label}</span>
                    </span>
                    <span className={`text-[14px] px-2.5 py-0.5 rounded-full font-bold ${tab.badgeColor}`}>
                      {tab.badge}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

            {/* FINANCIAL CHECKLIST CARD - SLEEK COMPACT STYLE */}
            <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-[var(--glass-edge)] rounded-3xl p-4 space-y-3.5 shadow-sm transition-all duration-300">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-zinc-800/80 gap-2">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#582F89] dark:text-purple-300 flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-[#8C52D0]" />
                  Чек-лист
                </span>
                <span className="text-[12px] font-medium text-purple-700 dark:text-purple-300 bg-purple-100/70 dark:bg-purple-900/50 px-2.5 py-0.5 rounded-full">
                  Инфо
                </span>
              </div>

              {/* Clean Row Data without inner frames */}
              <div className="space-y-3">
                {/* 1. СТОИМОСТЬ */}
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 dark:text-stone-400 text-[12px] font-normal flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-[#8C52D0]" /> Стоимость:
                  </span>
                  <span className="font-mono font-black text-base text-[#582F89] dark:text-purple-200">
                    {finalPrice.toLocaleString('ru')} ₽
                  </span>
                </div>

                {/* 2. ПРЕДОПЛАТА */}
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 dark:text-stone-400 text-[12px] font-normal flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Предоплата:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      {finalPrice > 0 ? Math.round((prepayment / finalPrice) * 100) : 0}%
                    </span>
                    <span className="font-mono font-black text-base text-emerald-600 dark:text-emerald-400">
                      {prepayment.toLocaleString('ru')} ₽
                    </span>
                  </div>
                </div>

                {/* 3. ОСТАТОК */}
                <div className="flex items-center justify-between pt-1 border-t border-stone-100 dark:border-zinc-800/80">
                  <span className="text-stone-500 dark:text-stone-400 text-[12px] font-normal flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-amber-500" /> Остаток:
                  </span>
                  <span className="font-mono font-black text-base text-amber-600 dark:text-amber-400">
                    {Math.max(0, finalPrice - prepayment).toLocaleString('ru')} ₽
                  </span>
                </div>
              </div>

              {/* Single smooth progress bar */}
              <div className="w-full h-1.5 bg-amber-100 dark:bg-amber-950/40 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${finalPrice > 0 ? Math.min(100, Math.round((prepayment / finalPrice) * 100)) : 0}%` }}
                />
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 min-w-0 max-w-full space-y-4 w-full">
            
            {/* STEPPER PROGRESS BAR (BACKGROUND STRIP ON DESKTOP) */}
            <nav className="w-full min-w-0 p-3.5 sm:p-4 rounded-3xl lg:bg-white/70 dark:lg:bg-zinc-900/70 lg:backdrop-blur-md lg:border lg:border-[var(--glass-edge)] lg:shadow-sm transition-all">
              <div className="flex items-center justify-between w-full min-w-0">
                {steps.map((label, idx) => {
                  const isCompleted = idx < project.currentStep;
                  const isCurrent = idx === project.currentStep;

                  return (
                    <React.Fragment key={idx}>
                      <button
                        onClick={() => handleStepClick(idx)}
                        className="flex-1 flex flex-col items-center text-center outline-none group cursor-pointer min-w-0"
                      >
                        {/* 1. ВВЕРХУ ЭТАП */}
                        <span className="block text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold text-stone-400 dark:text-zinc-500 truncate mb-1">
                          {isCurrent ? 'Текущий' : `Этап ${idx + 1}`}
                        </span>

                        {/* 2. ДАЛЬШЕ КРУЖОЧЕК */}
                        <span
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-black transition-all shrink-0 ${
                            isCompleted
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : isCurrent
                              ? 'bg-[#582F89] text-white shadow-md ring-2 ring-purple-300 dark:ring-purple-900'
                              : 'bg-stone-200 dark:bg-zinc-800 text-stone-400 group-hover:text-stone-600'
                          }`}
                        >
                          {isCompleted ? '✓' : idx + 1}
                        </span>

                        {/* 3. СНИЗУ ПОДПИСЬ */}
                        <span className={`block text-xs sm:text-sm font-bold transition-colors truncate w-full mt-1 ${
                          isCurrent ? 'text-[#582F89] dark:text-purple-300' : isCompleted ? 'text-stone-800 dark:text-stone-200' : 'text-stone-400 group-hover:text-stone-600'
                        }`}>
                          {label}
                        </span>
                      </button>

                      {/* АККУРАТНАЯ ТОНКАЯ ЛИНИЯ (1.5px) НА ВСЕХ ЭКРАНАХ */}
                      {idx < steps.length - 1 && (
                        <div
                          className={`h-[1.5px] flex-1 min-w-[12px] max-w-[100px] mx-1 sm:mx-2 rounded-full transition-all shrink-0 ${
                            idx < project.currentStep ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-zinc-700'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </nav>
            
            {/* BRIEF GRID */}
            {(activeTab === 'all' || activeTab === 'brief') && (
              <section className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-[var(--glass-edge)] rounded-3xl overflow-hidden shadow-sm w-full min-w-0">
                <div className="bg-[#F0EBF9]/80 dark:bg-[#20152B]/80 backdrop-blur-md border-b border-[#D8C7F0] dark:border-[#3D2554] px-4 sm:px-5 py-3.5 flex justify-between items-center flex-wrap gap-2.5 w-full min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <Clipboard className="w-4 h-4 text-[#582F89] shrink-0" />
                    <div className="min-w-0">
                      <h2 className="font-bold text-sm text-stone-900 dark:text-stone-100 truncate">Анкета и Бриф проекта</h2>
                      <p className="text-[10px] text-stone-400 truncate">
                        Заполнено: <strong className="text-emerald-600 font-bold">{briefFilledPercentage}%</strong> {briefEmptyCount > 0 ? `(${briefEmptyCount} полей требует заполнения)` : '(Все поля заполнены)'}
                      </p>
                    </div>
                  </div>

                  {/* Header Actions: Send Brief button directly before Collapse button */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        const briefUrl = `${window.location.origin}/brief/${project.id}`;
                        navigator.clipboard.writeText(briefUrl);
                        showToast('Ссылка на бриф скопирована', `Ссылка для клиента ${project.clientName} скопирована в буфер обмена: ${briefUrl}`, 'success');
                      }}
                      className="relative group px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all duration-300 hover:opacity-85 active:scale-[0.98] cursor-pointer bg-transparent"
                    >
                      {/* 1px Gradient Border Overlay */}
                      <span
                        className="absolute inset-0 rounded-full pointer-events-none p-[1px]"
                        style={{
                          background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)',
                          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                          WebkitMaskComposite: 'xor',
                          maskComposite: 'exclude',
                        }}
                      />
                      <Send className="w-3.5 h-3.5 stroke-[2.2] relative z-10 shrink-0" style={{ stroke: 'url(#purple-gradient-send-btn)' }} />
                      <span
                        className="bg-clip-text text-transparent relative z-10"
                        style={{ backgroundImage: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
                      >
                        Отправить бриф
                      </span>
                      <svg width="0" height="0" className="absolute w-0 h-0 pointer-events-none">
                        <defs>
                          <linearGradient id="purple-gradient-send-btn" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8C52D0" />
                            <stop offset="100%" stopColor="#582F89" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </button>

                    <button
                      onClick={() => setBriefCollapsed(!briefCollapsed)}
                      className="px-3.5 py-1.5 border border-stone-300 dark:border-zinc-700 hover:border-stone-400 dark:hover:border-zinc-600 bg-white/50 dark:bg-zinc-800/50 text-stone-700 dark:text-stone-300 rounded-full text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all duration-300 hover:bg-stone-100 dark:hover:bg-zinc-800"
                    >
                      {briefCollapsed ? (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" /> Развернуть
                        </>
                      ) : (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" /> Свернуть
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {!briefCollapsed && (
                  <div className="p-4 sm:p-5 space-y-6">
                    {/* SECTION 1: CLIENT FIELDS */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 border-b border-purple-100 dark:border-purple-950/60 pb-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#8C52D0] shrink-0" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#582F89] dark:text-purple-300">
                          Поля клиента
                        </h3>
                        <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/80 px-2 py-0.5 rounded-full">
                          {briefFieldDefinitions.filter(f => f.filledBy === 'client').length} полей
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                        {briefFieldDefinitions.filter(f => f.filledBy === 'client').map((field) => {
                          const val = briefValues[field.key] || '';
                          const isEmpty = !val.trim() || val === "(требует заполнения)";

                          return (
                            <div
                              key={field.key}
                              className={`p-2.5 rounded-xl border border-l-2 text-left transition-all flex flex-col justify-between shadow-2xs ${
                                isEmpty
                                  ? 'border-dashed border-purple-300/80 border-l-[#8C52D0] dark:border-purple-900/40 dark:border-l-purple-500/70 bg-purple-50/30 dark:bg-zinc-900/40'
                                  : 'border-purple-200/60 border-l-[#8C52D0] dark:border-zinc-800 dark:border-l-purple-500/70 bg-purple-50/10 dark:bg-zinc-900/60'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-1.5">
                                <span className="text-[9px] uppercase tracking-wider font-bold text-stone-500 dark:text-stone-400 truncate">
                                  {field.key}
                                </span>
                              </div>

                              {field.multiline ? (
                                <textarea
                                  rows={2}
                                  value={val === "(требует заполнения)" ? "" : val}
                                  onChange={(e) => handleUpdateBriefField(field.key, e.target.value)}
                                  placeholder=""
                                  className={`w-full text-[15px] font-semibold rounded-lg p-1.5 border transition-all focus:outline-none focus:ring-1 focus:ring-[#8C52D0] resize-none ${
                                    isEmpty
                                      ? 'bg-purple-50/50 text-[#582F89] italic font-medium border-purple-200/60 dark:bg-zinc-900/90 dark:text-purple-300/80 dark:border-zinc-800'
                                      : 'bg-white/90 dark:bg-zinc-900 text-stone-800 dark:text-stone-100 border-stone-200 dark:border-zinc-800'
                                  }`}
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={val === "(требует заполнения)" ? "" : val}
                                  onChange={(e) => handleUpdateBriefField(field.key, e.target.value)}
                                  placeholder=""
                                  className={`w-full text-[15px] font-semibold rounded-lg px-2 py-1 border transition-all focus:outline-none focus:ring-1 focus:ring-[#8C52D0] ${
                                    isEmpty
                                      ? 'bg-purple-50/50 text-[#582F89] italic font-medium border-purple-200/60 dark:bg-zinc-900/90 dark:text-purple-300/80 dark:border-zinc-800'
                                      : 'bg-white/90 dark:bg-zinc-900 text-stone-800 dark:text-stone-100 border-stone-200 dark:border-zinc-800'
                                  }`}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* SECTION 2: DECORATOR FIELDS */}
                    <div className="space-y-3 pt-2 border-t border-stone-200/60 dark:border-zinc-800/80">
                      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-zinc-800 pb-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-stone-400 dark:bg-zinc-400 shrink-0" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                          Поля декоратора
                        </h3>
                        <span className="text-[10px] font-semibold text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                          {briefFieldDefinitions.filter(f => f.filledBy === 'designer').length} полей
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                        {briefFieldDefinitions.filter(f => f.filledBy === 'designer').map((field) => {
                          const val = briefValues[field.key] || '';
                          const isEmpty = !val.trim() || val === "(требует заполнения)";
                          const isCustom = customDecoratorFields.some(cf => cf.key === field.key);

                          return (
                            <div
                              key={field.key}
                              className={`p-2.5 rounded-xl border border-l-2 text-left transition-all flex flex-col justify-between shadow-2xs relative group ${
                                isEmpty
                                  ? 'border-dashed border-zinc-300 border-l-zinc-400 dark:border-zinc-800 dark:border-l-zinc-600 bg-zinc-50/60 dark:bg-zinc-900/30'
                                  : 'border-stone-200/80 border-l-stone-400 dark:border-l-zinc-500 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-1.5">
                                <span className="text-[9px] uppercase tracking-wider font-bold text-stone-500 dark:text-stone-400 truncate">
                                  {field.key}
                                </span>
                                {isCustom && (
                                  <button
                                    onClick={() => {
                                      setCustomDecoratorFields(prev => prev.filter(cf => cf.key !== field.key));
                                      setBriefValues(prev => {
                                        const copy = { ...prev };
                                        delete copy[field.key];
                                        return copy;
                                      });
                                    }}
                                    title="Удалить поле"
                                    className="text-stone-300 hover:text-rose-500 transition-colors p-0.5 cursor-pointer"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </div>

                              {field.multiline ? (
                                <textarea
                                  rows={2}
                                  value={val === "(требует заполнения)" ? "" : val}
                                  onChange={(e) => handleUpdateBriefField(field.key, e.target.value)}
                                  placeholder=""
                                  className={`w-full text-[15px] font-semibold rounded-lg p-1.5 border transition-all focus:outline-none focus:ring-1 focus:ring-[#8C52D0] resize-none ${
                                    isEmpty
                                      ? 'bg-zinc-100/50 text-zinc-600 italic font-medium border-zinc-200 dark:bg-zinc-900/80 dark:text-zinc-400 dark:border-zinc-800'
                                      : 'bg-white/90 dark:bg-zinc-900 text-stone-800 dark:text-stone-100 border-stone-200 dark:border-zinc-800'
                                  }`}
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={val === "(требует заполнения)" ? "" : val}
                                  onChange={(e) => handleUpdateBriefField(field.key, e.target.value)}
                                  placeholder=""
                                  className={`w-full text-[15px] font-semibold rounded-lg px-2 py-1 border transition-all focus:outline-none focus:ring-1 focus:ring-[#8C52D0] ${
                                    isEmpty
                                      ? 'bg-zinc-100/50 text-zinc-600 italic font-medium border-zinc-200 dark:bg-zinc-900/80 dark:text-zinc-400 dark:border-zinc-800'
                                      : 'bg-white/90 dark:bg-zinc-900 text-stone-800 dark:text-stone-100 border-stone-200 dark:border-zinc-800'
                                  }`}
                                />
                              )}
                            </div>
                          );
                        })}

                        {/* DASHED CARD TO ADD A CUSTOM DECORATOR FIELD */}
                        {isAddingCustomField ? (
                          <div className="p-2.5 rounded-xl border border-l-2 border-dashed border-purple-300 border-l-stone-400 dark:border-zinc-800 dark:border-l-zinc-600 bg-purple-50/30 dark:bg-zinc-900/30 text-left flex flex-col justify-between gap-2 shadow-2xs">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[9px] uppercase tracking-wider font-bold text-[#582F89] dark:text-purple-300">
                                Новое поле декоратора
                              </span>
                            </div>
                            <input
                              type="text"
                              autoFocus
                              value={newFieldName}
                              onChange={(e) => setNewFieldName(e.target.value)}
                              placeholder="Название поля..."
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && newFieldName.trim()) {
                                  const keyUpper = newFieldName.trim().toUpperCase();
                                  setCustomDecoratorFields(prev => [...prev, { id: Date.now().toString(), key: keyUpper }]);
                                  setBriefValues(prev => ({ ...prev, [keyUpper]: '' }));
                                  setNewFieldName('');
                                  setIsAddingCustomField(false);
                                  showToast('Поле добавлено', `Добавлено новое поле: ${keyUpper}`, 'success');
                                }
                              }}
                              className="w-full text-xs font-semibold rounded-lg px-2 py-1 border border-purple-200 dark:border-purple-800 bg-white dark:bg-zinc-900 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#8C52D0]"
                            />
                            <div className="flex items-center gap-1.5 pt-0.5">
                              <button
                                onClick={() => {
                                  if (newFieldName.trim()) {
                                    const keyUpper = newFieldName.trim().toUpperCase();
                                    setCustomDecoratorFields(prev => [...prev, { id: Date.now().toString(), key: keyUpper }]);
                                    setBriefValues(prev => ({ ...prev, [keyUpper]: '' }));
                                    setNewFieldName('');
                                    setIsAddingCustomField(false);
                                    showToast('Поле добавлено', `Добавлено новое поле: ${keyUpper}`, 'success');
                                  }
                                }}
                                className="flex-1 py-1 px-2 text-white rounded-full text-[11px] font-bold transition-all cursor-pointer hover:opacity-95"
                                style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
                              >
                                Сохранить
                              </button>
                              <button
                                onClick={() => {
                                  setNewFieldName('');
                                  setIsAddingCustomField(false);
                                }}
                                className="px-2 py-1 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 text-[11px] font-medium cursor-pointer"
                              >
                                Отмена
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setIsAddingCustomField(true)}
                            className="p-3 rounded-xl border border-l-2 border-dashed border-stone-300 border-l-stone-400 dark:border-zinc-700 hover:border-[#8C52D0] dark:hover:border-[#8C52D0] bg-stone-50/40 dark:bg-zinc-900/30 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 text-stone-500 hover:text-[#582F89] dark:text-stone-400 dark:hover:text-purple-300 text-xs font-semibold transition-all duration-300 flex flex-col items-center justify-center gap-1.5 min-h-[82px] cursor-pointer group"
                          >
                            <div className="w-6 h-6 rounded-full bg-stone-200/80 dark:bg-zinc-800 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/60 flex items-center justify-center transition-colors">
                              <Plus className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300 group-hover:text-[#582F89] dark:group-hover:text-purple-200" />
                            </div>
                            <span className="text-[11px] font-bold">+ Добавить поле</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* BOTTOM LEGEND AT THE VERY BOTTOM OF BRIEF CARD */}
                    <div className="pt-4 border-t border-stone-200/60 dark:border-zinc-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#582F89] dark:text-purple-300 font-semibold bg-purple-100/90 dark:bg-purple-950/70 px-3 py-1 rounded-full border border-purple-200/70 dark:border-purple-800/50">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#8C52D0] shadow-xs" /> Заполняет клиент
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300 font-semibold bg-stone-100 dark:bg-zinc-800 px-3 py-1 rounded-full border border-stone-200 dark:border-zinc-700">
                          <span className="w-2.5 h-2.5 rounded-full bg-stone-400 dark:bg-zinc-400 shadow-xs" /> Декоратор
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-stone-400">
                        Всего полей в брифе: {totalBriefCount}
                      </span>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* DESIGN & VISUALIZATION */}
            {(activeTab === 'all' || activeTab === 'design') && (
              <section className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-[var(--glass-edge)] rounded-3xl overflow-hidden shadow-sm">
                <div className="bg-[#F0EBF9]/80 dark:bg-[#20152B]/80 backdrop-blur-md border-b border-[#D8C7F0] dark:border-[#3D2554] px-5 py-3.5 flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#582F89]" />
                    <h2 className="font-bold text-sm text-stone-900 dark:text-stone-100">Дизайн & Визуализация</h2>
                  </div>
                  <button
                    onClick={() => {
                      showToast('Редактор дизайна', 'Переход в встроенный графический редактор...', 'info');
                      if (onOpenEditor) onOpenEditor();
                    }}
                    style={{ border: '1px solid #8C52D0' }}
                    className="bg-transparent px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] hover:bg-[#8C52D0]/10"
                  >
                    <SlidersHorizontal className="w-3 h-3 text-[#8C52D0]" />
                    <span className="bg-gradient-to-r from-[#8C52D0] to-[#582F89] bg-clip-text text-transparent font-semibold">Редактор</span>
                  </button>
                </div>

                <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* LEFT CAROUSEL VISUALIZATION CARD (EDITOR) */}
                  <div className="bg-white/40 dark:bg-zinc-950/30 rounded-2xl p-4 border border-stone-200/80 dark:border-zinc-800 flex flex-col justify-between items-center relative min-h-[260px] backdrop-blur-xs select-none">
                    
                    {/* LEFT & RIGHT NAVIGATION ARROWS */}
                    <button
                      type="button"
                      onClick={() => setVizIndex((prev) => (prev === 0 ? visualizations.length - 1 : prev - 1))}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full border border-[#8C52D0] bg-white/90 dark:bg-zinc-900/90 text-[#582F89] dark:text-purple-300 shadow-md flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-[#F0EBF9] dark:hover:bg-[#20152B] active:scale-95 cursor-pointer"
                      title="Предыдущая визуализация"
                    >
                      <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setVizIndex((prev) => (prev === visualizations.length - 1 ? 0 : prev + 1))}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full border border-[#8C52D0] bg-white/90 dark:bg-zinc-900/90 text-[#582F89] dark:text-purple-300 shadow-md flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-[#F0EBF9] dark:hover:bg-[#20152B] active:scale-95 cursor-pointer"
                      title="Следующая визуализация"
                    >
                      <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                    </button>

                    {/* CARD TITLE */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300 truncate max-w-[200px]">
                        {visualizations[vizIndex].title}
                      </span>
                      <span className="text-[9px] bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold shrink-0">
                        {vizIndex + 1} / {visualizations.length}
                      </span>
                    </div>

                    {/* VISUALIZATION CONTENT AREA (CLICKABLE -> OPENS EDITOR) */}
                    <div
                      onClick={() => {
                        showToast('Редактор визуализации', `Переход в редактор: ${visualizations[vizIndex].title}`, 'info');
                        if (onOpenEditor) onOpenEditor();
                      }}
                      className="w-full flex-1 flex items-center justify-center my-1 px-1 cursor-pointer group"
                      title="Нажмите, чтобы открыть визуализацию в редакторе"
                    >
                      <div className="aspect-square w-full max-w-[280px] sm:max-w-[300px] overflow-hidden rounded-2xl border border-stone-200/80 dark:border-zinc-800 shadow-xs relative transition-all duration-300 group-hover:shadow-md group-hover:border-[#8C52D0]">
                        <EditorSketchCanvasPreview
                          title={visualizations[vizIndex % visualizations.length]?.title}
                          subtitle={visualizations[vizIndex % visualizations.length]?.subtitle}
                          sceneIndex={visualizations[vizIndex % visualizations.length]?.sceneIndex ?? (vizIndex % visualizations.length)}
                          image={visualizations[vizIndex % visualizations.length]?.image}
                          sceneData={visualizations[vizIndex % visualizations.length]?.sceneData}
                          elements={visualizations[vizIndex % visualizations.length]?.elements}
                        />
                        {/* HOVER BADGE */}
                        <div className="absolute top-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/60 dark:bg-black/75 backdrop-blur-md text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 border border-white/20">
                          <Edit2 className="w-2.5 h-2.5" /> Редактировать
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT CAROUSEL VISUALIZATION CARD (AI VISUALIZATION) */}
                  <div className="bg-white/40 dark:bg-zinc-950/30 rounded-2xl p-4 border border-stone-200/80 dark:border-zinc-800 flex flex-col justify-between items-center relative min-h-[260px] backdrop-blur-xs select-none">
                    
                    {/* LEFT & RIGHT NAVIGATION ARROWS */}
                    <button
                      type="button"
                      onClick={() => setAiVizIndex((prev) => (prev === 0 ? aiVisualizations.length - 1 : prev - 1))}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full border border-[#8C52D0] bg-white/90 dark:bg-zinc-900/90 text-[#582F89] dark:text-purple-300 shadow-md flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-[#F0EBF9] dark:hover:bg-[#20152B] active:scale-95 cursor-pointer"
                      title="Предыдущая ИИ визуализация"
                    >
                      <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setAiVizIndex((prev) => (prev === aiVisualizations.length - 1 ? 0 : prev + 1))}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full border border-[#8C52D0] bg-white/90 dark:bg-zinc-900/90 text-[#582F89] dark:text-purple-300 shadow-md flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-[#F0EBF9] dark:hover:bg-[#20152B] active:scale-95 cursor-pointer"
                      title="Следующая ИИ визуализация"
                    >
                      <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                    </button>

                    {/* CARD TITLE */}
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                        <Sparkles className="w-3.5 h-3.5 text-[#8C52D0] shrink-0" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300 truncate">
                          {aiVisualizations[aiVizIndex].title}
                        </span>
                      </div>
                      <span className="text-[9px] bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold shrink-0">
                        {aiVizIndex + 1} / {aiVisualizations.length}
                      </span>
                    </div>

                    {/* AI VISUALIZATION CONTENT AREA */}
                    <div
                      onClick={() => {
                        showToast('ИИ Визуализация', `Просмотр генерации ИИ: ${aiVisualizations[aiVizIndex].title}`, 'info');
                      }}
                      className="w-full flex-1 flex items-center justify-center my-1 px-1 cursor-pointer group"
                      title="ИИ Визуализация проекта"
                    >
                      <div className="aspect-square w-full max-w-[280px] sm:max-w-[300px] overflow-hidden rounded-2xl border border-stone-200/80 dark:border-zinc-800 shadow-xs relative transition-all duration-300 group-hover:shadow-md group-hover:border-[#8C52D0]">
                        <img
                          src={aiVisualizations[aiVizIndex].image}
                          alt={aiVisualizations[aiVizIndex].title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-3 transition-opacity">
                          <span className="text-[11px] text-white font-bold leading-tight drop-shadow-xs flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
                            {aiVisualizations[aiVizIndex].subtitle}
                          </span>
                        </div>
                        {/* BADGE TOP RIGHT */}
                        <div className="absolute top-2 right-2 bg-black/60 dark:bg-black/75 backdrop-blur-md text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 border border-white/20">
                          <Sparkles className="w-2.5 h-2.5 text-amber-300" /> ИИ Визуализация
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* HORIZONTAL PHOTO GALLERY STRIP FOR ALL PROJECT PHOTOS */}
                <div className="mx-4 sm:mx-5 mb-4 sm:mb-5 pt-3.5 border-t border-stone-200/60 dark:border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                      Все загруженные фото проекта ({venuePhotos.length} / 6)
                    </span>
                    <span className="text-[10px] text-stone-400 font-medium hidden sm:inline">
                      Перетягивайте мышкой или используйте стрелки &lt;&gt;
                    </span>
                  </div>
                  
                  {/* GALLERY STRIP WITH NAVIGATION ARROWS & DRAG TO SCROLL */}
                  <div className="relative flex items-center gap-2.5">
                    {/* LEFT ARROW (NO BORDER, LARGER ICON) */}
                    <button
                      type="button"
                      onClick={() => scrollGallery('left')}
                      className="shrink-0 w-8 h-8 rounded-full text-[#582F89] dark:text-purple-300 hover:bg-[#F0EBF9] dark:hover:bg-[#20152B] flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer z-10"
                      title="Прокрутить влево"
                    >
                      <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                    </button>

                    {/* STATIC UPLOAD CARD OUTSIDE SCROLLABLE CONTAINER */}
                    <button
                      type="button"
                      disabled={venuePhotos.length >= 6}
                      onClick={() => {
                        if (venuePhotos.length < 6) {
                          fileInputRef.current?.click();
                        }
                      }}
                      className={`shrink-0 w-16 sm:w-20 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-1 transition-all group shadow-2xs z-10 ${
                        venuePhotos.length >= 6
                          ? 'border-stone-300 dark:border-zinc-700 bg-stone-100 dark:bg-zinc-800/50 text-stone-400 dark:text-zinc-500 cursor-not-allowed opacity-60'
                          : 'border-[#8C52D0]/60 hover:border-[#8C52D0] bg-[#F0EBF9]/40 dark:bg-[#20152B]/40 hover:bg-[#F0EBF9] dark:hover:bg-[#20152B] cursor-pointer'
                      }`}
                      title={venuePhotos.length >= 6 ? 'Максимум 6 фото (лимит достигнут)' : 'Загрузить фото'}
                    >
                      <Plus className={`w-4 h-4 stroke-[2.5] ${
                        venuePhotos.length >= 6
                          ? 'text-stone-400 dark:text-zinc-500'
                          : 'text-[#582F89] dark:text-purple-300 group-hover:scale-110 transition-transform'
                      }`} />
                      <span className={`text-[8px] sm:text-[9px] font-bold mt-0.5 text-center leading-tight ${
                        venuePhotos.length >= 6
                          ? 'text-stone-400 dark:text-zinc-500'
                          : 'text-[#582F89] dark:text-purple-300'
                      }`}>
                        {venuePhotos.length >= 6 ? 'Лимит 6/6' : 'Загрузить'}
                      </span>
                    </button>

                    {/* DRAGGABLE GALLERY CONTAINER (PHOTO THUMBNAILS ONLY) */}
                    <div
                      ref={galleryRef}
                      onMouseDown={handleMouseDown}
                      onMouseLeave={handleMouseLeave}
                      onMouseUp={handleMouseUp}
                      onMouseMove={handleMouseMove}
                      className="flex-1 flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-none cursor-grab active:cursor-grabbing select-none"
                      style={{ scrollBehavior: 'smooth' }}
                    >
                      {/* PHOTO THUMBNAILS */}
                      {venuePhotos.map((photoUrl, idx) => (
                        <div
                          key={idx}
                          className="shrink-0 w-28 h-20 rounded-xl overflow-hidden border border-stone-200/80 dark:border-zinc-800 bg-stone-100 dark:bg-zinc-900 relative group cursor-pointer shadow-2xs hover:border-[#8C52D0] transition-all"
                        >
                          <img
                            src={photoUrl}
                            alt={`Превью ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 pointer-events-none"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between p-1.5">
                            <span className="text-[8px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded-md">
                              #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setVenuePhotos(prev => prev.filter((_, i) => i !== idx));
                                showToast('Фото удалено', `Фотография #${idx + 1} удалена из галереи`, 'info');
                              }}
                              className="p-1 rounded-full bg-red-600/80 hover:bg-red-600 text-white transition-transform hover:scale-110"
                              title="Удалить фото"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* RIGHT ARROW (NO BORDER, LARGER ICON) */}
                    <button
                      type="button"
                      onClick={() => scrollGallery('right')}
                      className="shrink-0 w-8 h-8 rounded-full text-[#582F89] dark:text-purple-300 hover:bg-[#F0EBF9] dark:hover:bg-[#20152B] flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer z-10"
                      title="Прокрутить вправо"
                    >
                      <ChevronRight className="w-6 h-6 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* ESTIMATE SHEET */}
            {(activeTab === 'all' || activeTab === 'calc') && (
              <section className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-[var(--glass-edge)] rounded-3xl overflow-hidden shadow-sm">
                <div className="bg-[#F0EBF9]/80 dark:bg-[#20152B]/80 backdrop-blur-md border-b border-[#D8C7F0] dark:border-[#3D2554] px-5 py-3.5 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#582F89]" />
                    <h2 className="font-bold text-sm text-stone-900 dark:text-stone-100">Смета декора и монтажа</h2>
                  </div>
                  <button onClick={handleResetCalculator} className="text-xs text-stone-400 hover:text-rose-500 cursor-pointer flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" /> Сбросить
                  </button>
                </div>

                <div className="p-4 sm:p-5 space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-stone-200/80 dark:border-zinc-800 text-stone-400 font-medium">
                          <th className="pb-3 pt-1 px-3 w-12 text-stone-400 font-normal">Превью</th>
                          <th className="pb-3 pt-1 px-3 text-stone-400 font-normal">Визуализация / Позиция</th>
                          <th className="pb-3 pt-1 px-3 text-center text-stone-400 font-normal">Включение в смету</th>
                          <th className="pb-3 pt-1 px-3 text-right text-stone-400 font-normal">Общая стоимость (₽)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 dark:divide-zinc-800/80">
                        {/* SECTION TITLE: VISUALIZATIONS */}
                        <tr className="bg-purple-50/60 dark:bg-purple-950/40 text-[#582F89] dark:text-purple-300 font-bold">
                          <td colSpan={4} className="py-2 px-3 text-[11px] uppercase tracking-wider font-extrabold">
                            ✨ Визуализации декора (общая стоимость по объектам)
                          </td>
                        </tr>

                        {/* VISUALIZATIONS SUMMARY ROWS */}
                        {visualizationScenes.length > 0 ? (
                          visualizationScenes.map((sc: any, idx: number) => {
                            const isIncluded = !disabledSceneIds.includes(sc.id);
                            const cost = getSceneCost(sc);

                            return (
                              <tr
                                key={sc.id || idx}
                                className={`group transition-colors ${
                                  isIncluded
                                    ? 'hover:bg-purple-50/30 dark:hover:bg-purple-950/20'
                                    : 'opacity-50 bg-stone-50/60 dark:bg-zinc-900/40'
                                }`}
                              >
                                {/* PREVIEW ICON */}
                                <td className="py-3 px-3">
                                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-2xs border ${
                                    isIncluded
                                      ? 'bg-purple-100/80 dark:bg-purple-900/50 border-purple-200 dark:border-purple-800 text-[#8C52D0] dark:text-purple-300'
                                      : 'bg-stone-200/60 dark:bg-zinc-800 border-stone-300 dark:border-zinc-700 text-stone-400'
                                  }`}>
                                    <Palette className="w-4 h-4 stroke-[2]" />
                                  </div>
                                </td>

                                {/* SCENE NAME & SUBTITLE */}
                                <td className="py-3 px-3">
                                  <div className="flex flex-col">
                                    <input
                                      type="text"
                                      value={sc.name || `Декор ${idx + 1}`}
                                      onChange={(e) => handleUpdateSceneName(sc.id, e.target.value)}
                                      className={`font-bold text-xs bg-transparent border-b border-transparent hover:border-purple-300 focus:border-[#8C52D0] focus:outline-none transition-colors ${
                                        isIncluded ? 'text-stone-900 dark:text-stone-100' : 'line-through text-stone-400 dark:text-zinc-500'
                                      }`}
                                    />
                                    <span className="text-[10px] text-stone-400 dark:text-stone-500 font-medium">
                                      {sc.subtitle || (sc.elements && sc.elements.length > 0 ? `${sc.elements.length} элементов декора в составе` : 'Отдельный элемент декора')}
                                    </span>
                                  </div>
                                </td>

                                {/* TOGGLE BUTTON (ВКЛ / ВЫКЛ) */}
                                <td className="py-3 px-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSceneInEstimate(sc.id)}
                                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 transition-all duration-300 cursor-pointer shadow-2xs ${
                                      isIncluded
                                        ? 'bg-purple-50/40 hover:bg-purple-100/70 dark:bg-purple-950/30 dark:hover:bg-purple-900/50 text-[#8C52D0] dark:text-purple-300 border border-[#8C52D0] dark:border-purple-400 active:scale-[0.98]'
                                        : 'bg-stone-200/70 hover:bg-stone-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-500 dark:text-stone-400 border border-stone-300 dark:border-zinc-700'
                                    }`}
                                    title={isIncluded ? 'Нажмите, чтобы исключить из расчета сметы' : 'Нажмите, чтобы включить в расчет сметы'}
                                  >
                                    {isIncluded ? (
                                      <>
                                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                                        <span>Включено</span>
                                      </>
                                    ) : (
                                      <>
                                        <X className="w-3.5 h-3.5 stroke-[2.5]" />
                                        <span>Выключено</span>
                                      </>
                                    )}
                                  </button>
                                </td>

                                {/* TOTAL COST & DELETE */}
                                <td className="py-3 px-3 text-right">
                                  <div className="inline-flex items-center gap-1.5 justify-end">
                                    {isIncluded ? (
                                      <input
                                        type="number"
                                        value={cost || ''}
                                        placeholder="0"
                                        onChange={(e) => handleUpdateScenePrice(sc.id, Number(e.target.value) || 0)}
                                        className="w-28 bg-white dark:bg-zinc-800 border border-purple-200 dark:border-purple-800 px-2.5 py-1 rounded-xl text-right font-black text-xs text-[#582F89] dark:text-purple-200 focus:outline-none focus:ring-1 focus:ring-[#8C52D0] shadow-2xs"
                                      />
                                    ) : (
                                      <span className="font-mono font-bold text-xs line-through text-stone-400 dark:text-zinc-600">
                                        {cost.toLocaleString('ru')} ₽
                                      </span>
                                    )}
                                    <span className={`font-medium text-xs ${isIncluded ? 'text-stone-500' : 'text-stone-400'}`}>₽</span>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteScene(sc.id)}
                                      title="Удалить позицию декора"
                                      className="text-stone-300 hover:text-rose-500 transition-colors p-1 cursor-pointer ml-1"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  {!isIncluded && (
                                    <span className="block text-[9px] text-rose-500 dark:text-rose-400 font-bold mt-0.5">
                                      Не учитывается в смете
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-xs text-stone-400 dark:text-zinc-500 italic">
                              В смете пока нет позиций декора. Нажмите «+ Добавить декор», чтобы внести элемент.
                            </td>
                          </tr>
                        )}

                        {/* SECTION TITLE: WORK & DELIVERY */}
                        <tr className="bg-stone-100/90 dark:bg-zinc-800/80 text-stone-700 dark:text-stone-300 font-bold">
                          <td colSpan={4} className="py-2 px-3 text-[11px] uppercase tracking-wider font-extrabold">
                            🚚 Монтаж, логистика и сервисные работы
                          </td>
                        </tr>

                        {/* SERVICE / WORK ROWS */}
                        {serviceEstimate.map((item) => (
                          <tr key={item.id} className="group hover:bg-stone-100/60 dark:hover:bg-zinc-800/60 transition-colors">
                            <td className="py-2.5 px-3">
                              <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-stone-300 flex items-center justify-center shadow-2xs">
                                <Truck className="w-4 h-4 stroke-[2]" />
                              </div>
                            </td>
                            <td className="py-2.5 px-3 font-bold text-stone-800 dark:text-stone-100">
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => handleUpdateEstimateItemName(item.id, e.target.value)}
                                className="bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-stone-400 rounded px-1 py-0.5 w-full font-bold text-stone-800 dark:text-stone-100 text-xs"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-zinc-700">
                                Обязательно
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="inline-flex items-center gap-1.5 justify-end">
                                <input
                                  type="number"
                                  value={item.price || ''}
                                  onChange={(e) => handleUpdateEstimateItemPrice(item.id, Number(e.target.value) || 0)}
                                  className="w-28 bg-white dark:bg-zinc-800 border border-stone-200/90 dark:border-zinc-700 px-2.5 py-1 rounded-xl text-right font-bold text-xs text-stone-800 dark:text-stone-100 focus:outline-none focus:border-stone-400 shadow-2xs"
                                />
                                <span className="font-medium text-stone-500 dark:text-stone-400 text-xs">₽</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEstimateItem(item.id)}
                                  className="p-1 text-stone-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Удалить"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                        {/* NEW WORK INPUT ROW (CONDITIONAL) */}
                        {showAddWorkRow && (
                          <tr className="bg-stone-200/60 dark:bg-zinc-700/60 transition-colors">
                            <td className="py-2.5 px-3">
                              <div className="w-8 h-8 rounded-xl bg-white/90 dark:bg-zinc-800 border border-stone-300 dark:border-zinc-600 text-stone-700 dark:text-stone-300 flex items-center justify-center shadow-2xs">
                                <Truck className="w-4 h-4 stroke-[2]" />
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                autoFocus
                                placeholder="Введите название работ..."
                                value={newWorkName}
                                onChange={(e) => setNewWorkName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleAddWorkPosition();
                                }}
                                className="w-full bg-transparent border-none focus:outline-none placeholder:text-stone-400 text-xs font-bold text-stone-800 dark:text-stone-100"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="text-[10px] text-stone-400">Новая запись</span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="inline-flex items-center gap-1.5 justify-end">
                                <input
                                  type="number"
                                  placeholder="0"
                                  value={newWorkPrice}
                                  onChange={(e) => setNewWorkPrice(e.target.value ? Number(e.target.value) : '')}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddWorkPosition();
                                  }}
                                  className="w-28 border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-stone-800 dark:text-stone-100 placeholder:text-stone-400 px-2.5 py-1 rounded-xl text-right font-bold text-xs focus:outline-none shadow-2xs"
                                />
                                <span className="font-medium text-stone-500 dark:text-stone-400 text-xs">₽</span>
                                <button
                                  type="button"
                                  onClick={() => setShowAddWorkRow(false)}
                                  className="p-1 text-stone-300 hover:text-rose-500 transition-colors"
                                  title="Отмена"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const newNum = visualizationScenes.length + 1;
                        const newScene = {
                          id: `scene-${Date.now()}`,
                          name: `Декор ${newNum}`,
                          subtitle: `Отдельный элемент декора`,
                          defaultPrice: 0,
                          elements: []
                        };
                        const updatedScenes = [...visualizationScenes, newScene];
                        onUpdateProject({ ...project, scenesData: updatedScenes });
                        showToast('Добавлен декор', `Создана новая позиция: Декор ${newNum}`, 'success');
                      }}
                      className="w-full py-3 px-5 rounded-full text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:shadow-md hover:opacity-95 active:scale-[0.98]"
                      style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>+ Добавить декор</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAddWorkPosition}
                      className="w-full py-3 px-5 rounded-full text-stone-700 dark:text-stone-200 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-stone-300 dark:border-zinc-600 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:shadow-md active:scale-[0.98]"
                    >
                      <Truck className="w-4 h-4 stroke-[2.5] text-stone-700 dark:text-stone-300" />
                      <span>+ Работа / Доставка</span>
                    </button>
                  </div>

                  {/* 3 FINANCIAL CALCULATION PANELS (MODERN DESIGN) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-4 border-t border-stone-200/70 dark:border-zinc-800">
                    {/* CARD 1: COST BREAKDOWN */}
                    <div className="p-4 bg-white/80 dark:bg-zinc-900/80 rounded-2xl border border-stone-200/80 dark:border-zinc-800 shadow-2xs flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between pb-1.5 border-b border-stone-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300 flex items-center justify-center">
                            <FileSpreadsheet className="w-4 h-4" />
                          </div>
                          <span className="text-stone-500 dark:text-stone-400 font-bold uppercase text-[10px] tracking-wider">Себестоимость</span>
                        </div>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-stone-500 dark:text-stone-400">
                          <span>Декор:</span>
                          <strong className="text-stone-800 dark:text-stone-200 font-mono font-semibold">{decorCost.toLocaleString('ru')} ₽</strong>
                        </div>
                        <div className="flex justify-between text-stone-500 dark:text-stone-400">
                          <span>Работы:</span>
                          <strong className="text-stone-800 dark:text-stone-200 font-mono font-semibold">{serviceCost.toLocaleString('ru')} ₽</strong>
                        </div>
                      </div>
                      <div className="flex justify-between items-center font-bold pt-2.5 border-t border-stone-200/60 dark:border-zinc-800 text-stone-900 dark:text-stone-100 text-xs bg-stone-50/80 dark:bg-zinc-800/50 -mx-4 -mb-4 p-3 rounded-b-2xl">
                        <span>Итого себестоимость:</span>
                        <strong className="font-mono text-sm">{totalCost.toLocaleString('ru')} ₽</strong>
                      </div>
                    </div>

                    {/* CARD 2: NET PROFIT */}
                    {(() => {
                      const isProfitPositive = calculatedProfit >= 0;
                      return (
                        <div className={`p-4 rounded-2xl border shadow-2xs flex flex-col justify-between space-y-2 transition-all ${
                          isProfitPositive
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800/50'
                            : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-800/50'
                        }`}>
                          <div className="flex justify-between items-center pb-1">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                isProfitPositive
                                  ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                              }`}>
                                {isProfitPositive ? <TrendingUp className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                              </div>
                              <span className={`font-bold uppercase text-[10px] tracking-wider ${
                                isProfitPositive ? 'text-emerald-900 dark:text-emerald-300' : 'text-rose-900 dark:text-rose-300'
                              }`}>
                                Чистая прибыль
                              </span>
                            </div>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-2xs ${
                              isProfitPositive
                                ? 'text-emerald-800 dark:text-emerald-200 bg-emerald-100/90 dark:bg-emerald-900/80 border border-emerald-200/80 dark:border-emerald-700/60'
                                : 'text-rose-800 dark:text-rose-200 bg-rose-100/90 dark:bg-rose-900/80 border border-rose-200/80 dark:border-rose-700/60'
                            }`}>
                              {isProfitPositive ? `Эффективность ${profitMarginPercent}%` : `Убыток ${profitMarginPercent}%`}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400">С учетом себестоимости и налога 6%</p>
                          <div className="pt-1">
                            <p className={`text-2xl font-black font-mono tracking-tight ${
                              isProfitPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}>
                              {calculatedProfit.toLocaleString('ru')} ₽
                            </p>
                          </div>
                        </div>
                      );
                    })()}

                    {/* CARD 3: CLIENT CHECK */}
                    <div className="p-4 bg-gradient-to-br from-purple-50/90 via-purple-50/50 to-white dark:from-purple-950/40 dark:via-purple-950/20 dark:to-zinc-900 rounded-2xl border border-purple-200/90 dark:border-purple-800/60 shadow-2xs flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between pb-1 border-b border-purple-100 dark:border-purple-900/50">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-[#8C52D0] dark:text-purple-300 flex items-center justify-center">
                            <Award className="w-4 h-4" />
                          </div>
                          <span className="text-[#582F89] dark:text-purple-300 font-bold uppercase text-[10px] tracking-wider">Чек клиента</span>
                        </div>
                        <span className="text-[10px] font-bold text-white bg-gradient-to-r from-[#8C52D0] to-[#582F89] px-2.5 py-0.5 rounded-full shadow-2xs">
                          Ручной ввод
                        </span>
                      </div>
                      <p className="text-[11px] text-purple-800/80 dark:text-purple-300/80 font-medium">Сумма для сметы и договора:</p>
                      <div className="pt-1">
                        <div className="relative flex items-center">
                          <input
                            type="number"
                            value={finalPrice === 0 ? '' : finalPrice}
                            onChange={(e) => {
                              const val = e.target.value === '' ? 0 : Number(e.target.value);
                              setFinalPrice(val);
                              onUpdateProject({ ...project, clientPrice: val });
                            }}
                            className="w-full bg-white dark:bg-zinc-800 border border-[#8C52D0]/50 dark:border-purple-500/50 rounded-xl px-3 py-1.5 font-black font-mono text-xl sm:text-2xl text-[#582F89] dark:text-purple-100 focus:outline-none focus:ring-1 focus:ring-[#8C52D0] shadow-2xs transition-all"
                            placeholder="0"
                          />
                          <span className="absolute right-3.5 font-black font-mono text-lg text-[#8C52D0] dark:text-purple-300 pointer-events-none">
                            ₽
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}



            {/* JOURNAL OF TASKS AND NOTES CARD */}
            {(activeTab === 'all' || activeTab === 'journal') && (
              <section className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-[var(--glass-edge)] rounded-3xl overflow-hidden shadow-sm">
                <div className="bg-[#F0EBF9]/80 dark:bg-[#20152B]/80 backdrop-blur-md border-b border-[#D8C7F0] dark:border-[#3D2554] px-5 py-3.5 flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#582F89]/10 dark:bg-purple-900/40 text-[#582F89] dark:text-purple-300 flex items-center justify-center">
                      <CheckSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-bold text-sm text-stone-900 dark:text-stone-100">Журнал задач и заметок</h2>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400">Оперативные задачи и заметки декоратора с привязкой к датам</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setJournalCollapsed(!journalCollapsed)}
                    className="px-3.5 py-1.5 border border-stone-300 dark:border-zinc-700 hover:border-stone-400 dark:hover:border-zinc-600 bg-white/50 dark:bg-zinc-800/50 text-stone-700 dark:text-stone-300 rounded-full text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all duration-300 hover:bg-stone-100 dark:hover:bg-zinc-800"
                  >
                    {journalCollapsed ? (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" /> Развернуть
                      </>
                    ) : (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" /> Свернуть
                      </>
                    )}
                  </button>
                </div>

                {!journalCollapsed && (
                  <div className="p-4 sm:p-5">
                    {/* TWO-COLUMN LAYOUT: 40% FORM / 60% RECORDS LIST */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      
                      {/* LEFT COLUMN (~40% WIDTH): FORM TO CREATE TASK OR NOTE */}
                      <div className="lg:col-span-5 bg-white/60 dark:bg-zinc-950/40 p-4 sm:p-5 rounded-2xl border border-stone-200/80 dark:border-zinc-800 backdrop-blur-xs space-y-4 flex flex-col justify-between">
                        <div className="space-y-3.5">
                          <div className="flex items-center justify-between pb-2 border-b border-stone-200/60 dark:border-zinc-800">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#582F89] dark:text-purple-300 flex items-center gap-1.5">
                              <Plus className="w-3.5 h-3.5" /> Создать запись для проекта
                            </span>
                            {/* Type toggle */}
                            <div className="flex bg-stone-100 dark:bg-zinc-800 p-0.5 rounded-full border border-stone-200 dark:border-zinc-700">
                              <button
                                type="button"
                                onClick={() => setNewType('task')}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                  newType === 'task'
                                    ? 'bg-[#582F89] text-white shadow-2xs'
                                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                                }`}
                              >
                                Задача
                              </button>
                              <button
                                type="button"
                                onClick={() => setNewType('note')}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                  newType === 'note'
                                    ? 'bg-[#582F89] text-white shadow-2xs'
                                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                                }`}
                              >
                                Заметка
                              </button>
                            </div>
                          </div>

                          {/* Title input */}
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">
                              {newType === 'task' ? 'Текст задачи' : 'Содержание заметки'}
                            </label>
                            <textarea
                              rows={3}
                              placeholder={newType === 'task' ? 'Заехать к флористу, подготовить неоновую вывеску, заказать декор...' : 'Важные примечания по монтажу, пожелания заказчика...'}
                              value={newTitle}
                              onChange={(e) => setNewTitle(e.target.value)}
                              className="w-full bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#8C52D0]"
                            />
                          </div>

                          {/* Date and Category row */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Дата выполнения</label>
                              <input
                                type="date"
                                value={newDueDate}
                                onChange={(e) => setNewDueDate(e.target.value)}
                                className="w-full bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-stone-800 dark:text-stone-100 focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Категория</label>
                              <select
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value as any)}
                                className="w-full bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-stone-800 dark:text-stone-100 focus:outline-none cursor-pointer"
                              >
                                <option value="Монтаж">Монтаж</option>
                                <option value="Закупка">Закупка</option>
                                <option value="Смета">Смета</option>
                                <option value="Логистика">Логистика</option>
                                <option value="Клиент">Клиент</option>
                                <option value="Важное">Важное</option>
                                <option value="Общее">Общее</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Submit button following required gradient and pill style */}
                        <button
                          type="button"
                          onClick={handleAddTaskNote}
                          className="w-full mt-3 py-2.5 text-white rounded-full text-xs font-bold transition-all duration-300 hover:shadow-md hover:opacity-95 active:scale-[0.99] cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                          style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Добавить {newType === 'task' ? 'задачу' : 'заметку'}</span>
                        </button>
                      </div>

                      {/* RIGHT COLUMN (~60% WIDTH): FILTER TABS & TASK/NOTE RECORDS LIST */}
                      <div className="lg:col-span-7 bg-white/40 dark:bg-zinc-950/20 p-4 sm:p-5 rounded-2xl border border-stone-200/80 dark:border-zinc-800 backdrop-blur-xs space-y-3.5 flex flex-col">
                        
                        {/* Filter Controls Header */}
                        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-stone-200/60 dark:border-zinc-800">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setJournalFilterType('all')}
                              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                journalFilterType === 'all'
                                  ? 'bg-[#582F89] text-white shadow-2xs'
                                  : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                              }`}
                            >
                              Все записи ({taskNoteList.length})
                            </button>
                            <button
                              type="button"
                              onClick={() => setJournalFilterType('task')}
                              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                journalFilterType === 'task'
                                  ? 'bg-[#582F89] text-white shadow-2xs'
                                  : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                              }`}
                            >
                              Задачи ({taskNoteList.filter(i => i.type === 'task').length})
                            </button>
                            <button
                              type="button"
                              onClick={() => setJournalFilterType('note')}
                              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                journalFilterType === 'note'
                                  ? 'bg-[#582F89] text-white shadow-2xs'
                                  : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                              }`}
                            >
                              Заметки ({taskNoteList.filter(i => i.type === 'note').length})
                            </button>
                          </div>

                          {selectedCalendarDate !== 'all' && (
                            <button
                              onClick={() => setSelectedCalendarDate('all')}
                              className="text-[10px] font-bold text-[#582F89] dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-800 hover:bg-purple-100 cursor-pointer flex items-center gap-1"
                            >
                              <RotateCcw className="w-2.5 h-2.5" /> Сбросить дату: {selectedCalendarDate}
                            </button>
                          )}
                        </div>

                        {/* Scrollable Records List */}
                        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 flex-1 custom-scrollbar">
                          {(() => {
                            const filtered = taskNoteList.filter(item => {
                              // Type filter
                              if (journalFilterType !== 'all' && item.type !== journalFilterType) return false;
                              
                              // Date filter from side calendar if active
                              if (selectedCalendarDate !== 'all') {
                                const dayPart = selectedCalendarDate.split('-')[2];
                                if (item.dueDate) {
                                  return item.dueDate.endsWith(dayPart) || item.dueDate === selectedCalendarDate;
                                }
                                return false;
                              }
                              return true;
                            });

                            if (filtered.length === 0) {
                              return (
                                <div className="p-8 text-center bg-stone-50/50 dark:bg-zinc-950/20 rounded-2xl border border-dashed border-stone-200 dark:border-zinc-800 text-stone-400 space-y-1">
                                  <CheckSquare className="w-6 h-6 mx-auto opacity-40 mb-1" />
                                  <p className="text-xs font-semibold">Нет записей в журнале</p>
                                  <p className="text-[10px]">Создайте первую задачу или заметку в форме слева.</p>
                                </div>
                              );
                            }

                            return filtered.map((item) => {
                              const isTask = item.type === 'task';

                              // Category styling
                              const categoryStyles: Record<string, string> = {
                                'Монтаж': 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200',
                                'Закупка': 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200',
                                'Смета': 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200',
                                'Логистика': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200',
                                'Клиент': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200',
                                'Важное': 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200',
                                'Общее': 'bg-stone-100 text-stone-700 dark:bg-zinc-800 dark:text-stone-300 border-stone-200'
                              };

                              const catClass = categoryStyles[item.category] || categoryStyles['Общее'];

                              return (
                                <div
                                  key={item.id}
                                  className={`p-3 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 ${
                                    isTask && item.completed
                                      ? 'bg-stone-50/70 dark:bg-zinc-950/30 border-stone-200/60 dark:border-zinc-800 opacity-60'
                                      : 'bg-white/90 dark:bg-zinc-900/90 border-stone-200 dark:border-zinc-800 hover:border-purple-300 shadow-2xs'
                                  }`}
                                >
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {/* Task Checkbox or Note Icon */}
                                    {isTask ? (
                                      <button
                                        type="button"
                                        onClick={() => handleToggleTaskNote(item.id)}
                                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                                          item.completed
                                            ? 'bg-emerald-500 border-emerald-500 text-white'
                                            : 'border-stone-300 dark:border-zinc-600 hover:border-[#8C52D0] bg-white dark:bg-zinc-800'
                                        }`}
                                      >
                                        {item.completed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                                      </button>
                                    ) : (
                                      <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                        <FileText className="w-3 h-3" />
                                      </div>
                                    )}

                                    {/* Title & details */}
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-xs font-medium text-stone-800 dark:text-stone-200 leading-snug ${
                                        isTask && item.completed ? 'line-through text-stone-400 dark:text-stone-500' : ''
                                      }`}>
                                        {item.title}
                                      </p>
                                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        {/* Type badge */}
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                          isTask
                                            ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                        }`}>
                                          {isTask ? 'Задача' : 'Заметка'}
                                        </span>

                                        {/* Category badge */}
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${catClass}`}>
                                          {item.category}
                                        </span>

                                        {/* Due Date badge */}
                                        <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono flex items-center gap-1">
                                          <Clock className="w-2.5 h-2.5" />
                                          {item.dueDate}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Delete Action */}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTaskNote(item.id)}
                                    className="text-stone-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all cursor-pointer shrink-0"
                                    title="Удалить запись"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </section>
            )}

            {/* DOCUMENTS WORKFLOW CARD */}
            {(activeTab === 'all' || activeTab === 'docs') && (
              <section className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-[var(--glass-edge)] rounded-3xl overflow-hidden shadow-sm">
                <div className="bg-[#F0EBF9]/80 dark:bg-[#20152B]/80 backdrop-blur-md border-b border-[#D8C7F0] dark:border-[#3D2554] px-5 py-3.5 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-[#582F89]" />
                    <div>
                      <h2 className="font-bold text-sm text-stone-900 dark:text-stone-100">Документооборот по проекту</h2>
                      <p className="text-[10px] text-stone-400">Связанные юридические документы для работы</p>
                    </div>
                  </div>
                  <button
                    onClick={() => showToast('Генерация пакета', 'Создается комплект документов в PDF...', 'success')}
                    className="px-3.5 py-1.5 text-white rounded-full text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all duration-300 hover:shadow-md hover:opacity-95 active:scale-[0.98] shadow-xs"
                    style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Сгенерировать
                  </button>
                </div>

                <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      id: 'decor-contract',
                      title: 'Договор на декор',
                      code: '№ ДК-2026/08',
                      date: '01.08.2026',
                      size: '2.4 МБ',
                      status: 'Подписан',
                      statusBadge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
                      desc: 'Договор оказания услуг по оформлению и декорированию площадки',
                      icon: FileText,
                      iconBg: 'bg-purple-100 dark:bg-purple-950/80 text-[#8C52D0] dark:text-purple-300 border-purple-200 dark:border-purple-800',
                      accentColor: 'from-purple-500/10 to-transparent'
                    },
                    {
                      id: 'deposit-agreement',
                      title: 'Соглашение о задатке',
                      code: '№ СЗ-2026/08',
                      date: '01.08.2026',
                      size: '1.1 МБ',
                      status: 'Подтвержден',
                      statusBadge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800',
                      desc: 'Гарантийная сумма бронирования даты (30 000 ₽)',
                      icon: ShieldCheck,
                      iconBg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
                      accentColor: 'from-amber-500/10 to-transparent'
                    },
                    {
                      id: 'acceptance-act',
                      title: 'Акт сдачи-приёмки',
                      code: '№ АКТ-2026/15',
                      date: 'В процессе',
                      size: '850 КБ',
                      status: 'Черновик',
                      statusBadge: 'bg-stone-100 text-stone-700 dark:bg-zinc-800 dark:text-stone-300 border-stone-200 dark:border-zinc-700',
                      desc: 'Акт приемки выполненных декораторских работ',
                      icon: FileCheck,
                      iconBg: 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                      accentColor: 'from-blue-500/10 to-transparent'
                    },
                    {
                      id: 'pd-consent',
                      title: 'Согласие на обработку ПД',
                      code: '№ ОПД-2026/01',
                      date: '01.08.2026',
                      size: '420 КБ',
                      status: 'Активен',
                      statusBadge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
                      desc: 'Согласие 152-ФЗ и разрешение на фотосъемку декора',
                      icon: FileSignature,
                      iconBg: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
                      accentColor: 'from-indigo-500/10 to-transparent'
                    }
                  ].map((doc) => {
                    const DocIcon = doc.icon;
                    return (
                      <div
                        key={doc.id}
                        className="group relative p-4 bg-white/80 dark:bg-zinc-950/60 rounded-2xl border border-stone-200/80 dark:border-zinc-800 flex flex-col justify-between gap-3 text-left backdrop-blur-xs transition-all duration-300 hover:shadow-md hover:border-purple-300/80 dark:hover:border-purple-800 overflow-hidden"
                      >
                        {/* ACCENT BACKGROUND SHIMMER */}
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${doc.accentColor} rounded-bl-full pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity`} />

                        <div className="space-y-2.5 relative z-10">
                          {/* TOP HEADER: ICON + STATUS */}
                          <div className="flex items-start justify-between gap-2">
                            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs ${doc.iconBg}`}>
                              <DocIcon className="w-4 h-4 stroke-[2.2]" />
                            </div>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-2xs ${doc.statusBadge}`}>
                              {doc.status}
                            </span>
                          </div>

                          {/* TITLE & CODE */}
                          <div>
                            <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500 font-semibold block">{doc.code}</span>
                            <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100 group-hover:text-[#582F89] dark:group-hover:text-purple-300 transition-colors">
                              {doc.title}
                            </h4>
                          </div>

                          {/* DESCRIPTION */}
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                            {doc.desc}
                          </p>
                        </div>

                        {/* BOTTOM METADATA & ACTIONS */}
                        <div className="pt-3 border-t border-stone-100 dark:border-zinc-800/80 flex items-center justify-between gap-2 relative z-10">
                          <div className="text-[10px] text-stone-400 font-mono space-x-1.5">
                            <span className="font-bold text-stone-500 dark:text-stone-400">PDF</span>
                            <span>•</span>
                            <span>{doc.size}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => showToast('Просмотр документа', `Открываем ${doc.title}...`, 'info')}
                              className="p-1.5 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-stone-500 hover:text-[#582F89] dark:hover:text-purple-300 rounded-lg transition-colors cursor-pointer"
                              title="Просмотреть"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => showToast('Скачивание', `Загрузка файла ${doc.title}...`, 'success')}
                              className="p-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-stone-500 hover:text-emerald-600 dark:hover:text-emerald-300 rounded-lg transition-colors cursor-pointer"
                              title="Скачать PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* BOTTOM FLOATING ACTION BAR */}
            <div 
              className="px-6 py-4 rounded-3xl flex flex-col lg:flex-row items-center justify-between gap-4 shadow-2xl text-white border border-white/20 transition-all"
              style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
            >
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full lg:w-auto">
                {/* METRIC 1: СТОИМОСТЬ */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/15 text-white border border-white/25 flex items-center justify-center shrink-0 shadow-2xs">
                    <Wallet className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-200 block">
                      Итоговая стоимость
                    </span>
                    <span className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
                      {finalPrice.toLocaleString('ru')} ₽
                    </span>
                  </div>
                </div>

                <div className="h-8 w-px bg-white/20 hidden sm:block" />

                {/* METRIC 2: ПРЕДОПЛАТА */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/15 text-white border border-white/25 flex items-center justify-center shrink-0 shadow-2xs">
                    <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-200">
                        Предоплата:
                      </span>
                      {/* Presets 30%, 50%, 100% without extra background frame */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPrepayment(Math.round(finalPrice * 0.3))}
                          className={`text-xs font-black px-3 py-0.5 rounded-full transition-all duration-200 cursor-pointer shadow-xs ${
                            prepayment === Math.round(finalPrice * 0.3) && finalPrice > 0
                              ? 'bg-white text-[#582F89] ring-2 ring-white shadow-md scale-105'
                              : 'bg-white text-[#582F89] hover:bg-purple-50 active:scale-95 opacity-90 hover:opacity-100'
                          }`}
                          title="Выбрать 30% предоплаты"
                        >
                          30%
                        </button>
                        <button
                          type="button"
                          onClick={() => setPrepayment(Math.round(finalPrice * 0.5))}
                          className={`text-xs font-black px-3 py-0.5 rounded-full transition-all duration-200 cursor-pointer shadow-xs ${
                            prepayment === Math.round(finalPrice * 0.5) && finalPrice > 0
                              ? 'bg-amber-200 text-amber-950 ring-2 ring-amber-300 shadow-md scale-105'
                              : 'bg-amber-100 text-amber-900 hover:bg-amber-200 active:scale-95 opacity-90 hover:opacity-100'
                          }`}
                          title="Выбрать 50% предоплаты"
                        >
                          50%
                        </button>
                        <button
                          type="button"
                          onClick={() => setPrepayment(finalPrice)}
                          className={`text-xs font-black px-3 py-0.5 rounded-full transition-all duration-200 cursor-pointer shadow-xs ${
                            prepayment === finalPrice && finalPrice > 0
                              ? 'bg-emerald-300 text-emerald-950 ring-2 ring-emerald-300 shadow-md scale-105'
                              : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 active:scale-95 opacity-90 hover:opacity-100'
                          }`}
                          title="Выбрать 100% предоплаты"
                        >
                          100%
                        </button>
                      </div>
                    </div>

                    {/* Manual Input */}
                    <div className="relative w-full mt-1.5 flex items-center">
                      <input
                        type="number"
                        value={prepayment === 0 ? '' : prepayment}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : Number(e.target.value);
                          setPrepayment(val);
                        }}
                        className="w-full pl-3 pr-7 py-1 bg-white border border-stone-200 rounded-xl text-xs font-black font-mono text-[#582F89] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-sm"
                        placeholder="Ручной ввод..."
                      />
                      <span className="absolute right-2.5 text-xs font-black font-mono text-[#8C52D0] pointer-events-none">
                        ₽
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/30 rounded-full text-xs font-bold transition-all cursor-pointer hover:shadow-xs active:scale-[0.98]"
                >
                  Отменить
                </button>
                <button
                  onClick={() => {
                    showToast('Проект завершен', 'Статус проекта обновлен на «Выполнено»', 'success');
                    onClose();
                  }}
                  className="px-6 py-2.5 bg-white text-[#582F89] hover:bg-purple-50 rounded-full text-xs font-black transition-all duration-300 hover:shadow-lg active:scale-[0.98] cursor-pointer flex items-center gap-2 shadow-md"
                >
                  <CheckCircle className="w-4 h-4 text-[#8C52D0] stroke-[2.5]" />
                  <span>Заказ сдан</span>
                </button>
              </div>
            </div>
          </main>
        </div>

      {/* SPECIFICATION HOTSPOT MODAL */}
      <AnimatePresence>
        {isSpecModalOpen && pointSpecifications[activeArchPoint] && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-xl text-left"
            >
              <div className="flex justify-between items-center border-b border-stone-100 dark:border-zinc-800 pb-3">
                <span className="text-xs font-bold uppercase text-[#582F89]">Спецификация точки #{activeArchPoint}</span>
                <button onClick={() => setIsSpecModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                {pointSpecifications[activeArchPoint].title}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-300">
                {pointSpecifications[activeArchPoint].desc}
              </p>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setIsSpecModalOpen(false)}
                  className="px-4 py-2 text-white rounded-full text-xs font-bold transition-all duration-300 hover:shadow-lg hover:opacity-95 active:scale-[0.98] cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
                >
                  Закрыть
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirm modal */}
      <DeleteConfirmModal
        isOpen={deleteConfirm.isOpen}
        title={deleteConfirm.title}
        itemName={deleteConfirm.itemName}
        description={deleteConfirm.description}
        onClose={() => setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}
        onConfirm={deleteConfirm.onConfirm}
      />
    </div>
  );
}
