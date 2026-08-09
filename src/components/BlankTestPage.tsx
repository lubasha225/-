import React, { useState, useRef, useLayoutEffect, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BriefBlock, DesignBlock, CalcBlock, JournalBlock, DocsBlock } from './BlankTestTabBlocks';
import { Project } from '../types';
import { 
  Sparkles, 
  Layout, 
  Clipboard, 
  Palette, 
  SlidersHorizontal, 
  CheckSquare, 
  FolderOpen, 
  RefreshCw, 
  CheckCircle2, 
  Plus,
  Send,
  Copy,
  Check,
  X,
  Share2,
  FileText,
  User,
  Phone,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Pencil,
  Bell,
  Save,
  Wallet,
  CreditCard,
  Trash2,
  RotateCcw,
  DollarSign,
  Truck,
  FileSpreadsheet,
  TrendingUp,
  AlertCircle,
  Award,
  Clock,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  FileCheck,
  FileSignature,
  Eye,
  Download,
  Hand
} from 'lucide-react';

interface BlankTestPageProps {
  project?: Project;
  onClose?: () => void;
  onUpdateProject?: (updatedProject: Project) => void;
  showToast?: (title: string, message: string, type?: 'success' | 'info' | 'warn') => void;
  onOpenEditor?: () => void;
}

const baseBriefFieldDefinitions: { key: string; filledBy: 'client' | 'designer'; multiline?: boolean }[] = [
  // --- 1. КЛИЕНТСКИЙ БЛОК (24 поля) ---
  { key: "ИМЯ КЛИЕНТА", filledBy: 'client' },
  { key: "ТЕЛЕФОН", filledBy: 'client' },
  { key: "РЕКВИЗИТЫ ПЛАТЕЛЬЩИКА", filledBy: 'client' },
  { key: "СОБЫТИЕ", filledBy: 'client' },
  { key: "ДАТА", filledBy: 'client' },
  { key: "ГОСТЕЙ", filledBy: 'client' },
  { key: "ФОРМАТ СОБЫТИЯ", filledBy: 'client' },
  { key: "ПЛОЩАДКА", filledBy: 'client' },
  { key: "АДРЕС", filledBy: 'client' },
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

  // --- 2. БЛОК ДЕКОРАТОРА (3 базовых поля) ---
  { key: "ДОСТУП НА МОНТАЖ", filledBy: 'designer' },
  { key: "ОКНО МОНТАЖА", filledBy: 'designer' },
  { key: "КОНСТРУКЦИИ ДЕКОРА", filledBy: 'designer', multiline: true },
];

export default function BlankTestPage({ project, onClose, onUpdateProject, showToast, onOpenEditor }: BlankTestPageProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'brief' | 'design' | 'calc' | 'journal' | 'docs'>('overview');

  // Interactive project header state
  const [projectName, setProjectName] = useState<string>("Свадьба «Свет и Грация»");
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [titleInput, setTitleInput] = useState<string>("Свадьба «Свет и Грация»");
  const [hasNotifications, setHasNotifications] = useState<boolean>(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isStepMenuOpen, setIsStepMenuOpen] = useState<boolean>(false);
  const steps = ['Бриф', 'Визуализация', 'Смета', 'Согласовано'];

  // Brief interactive state filled with realistic test data from project card
  const [briefValues, setBriefValues] = useState<Record<string, string>>({
    "ИМЯ КЛИЕНТА": "Анна Соколова",
    "ТЕЛЕФОН": "+7 (905) 123-45-67",
    "РЕКВИЗИТЫ ПЛАТЕЛЬЩИКА": "ИП Соколова А. В. / ИНН 77123456789",
    "СОБЫТИЕ": "Свадьба Артёма и Анны",
    "ДАТА": "15 сентября 2026",
    "ГОСТЕЙ": "85 человек",
    "ФОРМАТ СОБЫТИЯ": "Банкет и выездная регистрация",
    "ПЛОЩАДКА": "Ресторан «Royal Hall»",
    "АДРЕС": "г. Москва, Набережная Трапезникова, д. 12",
    "КОНТАКТ ПЛОЩАДКИ": "Виктория (менеджер): +7 (916) 987-65-43",
    "РАЗМЕР ЗОНЫ МОНТАЖА": "Сцена 6×4м, президиум 4×3м, 10 столов",
    "КРЕПЕЖ К СТЕНАМ": "Запрещен (только самонесущие конструкции)",
    "КРЕПЕЖ К ПОТОЛКУ": "Разрешен по фермам (высота 4.5м)",
    "СОГЛАСОВАНИЕ ОФОРМЛЕНИЯ": "Требуется за 5 дней до монтажа",
    "ЭЛЕКТРИЧЕСТВО У СЦЕНЫ": "220V, 3 розетки, 5 кВт",
    "ПОДЪЕЗД / ГРУЗОВОЙ ЛИФТ": "Есть грузовой лифт 2×1.5м",
    "ПРАЗДНИК НА УЛИЦЕ": "Выездная регистрация на веранде",
    "ХРАНЕНИЕ НА ПЛОЩАДКЕ": "Есть гримерка для декораторов",
    "ДЕМОНТАЖ / ВЫВОЗ": "Ночной демонтаж с 23:00 до 03:00",
    "КТО ПРИНИМАЕТ РАБОТЫ": "Организатор Ксения",
    "ПАЛИТРА ОФОРМЛЕНИЯ": "Шампань, лаванда, пудрово-розовый, золото",
    "СТИЛЬ ОФОРМЛЕНИЯ": "Современный органический шик",
    "ОРИЕНТИРОВОЧНЫЙ БЮДЖЕТ": "450 000 ₽",
    "ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ": "Особое внимание выездной арке — живые цветы и легкая вуаль. Понадобятся свечи в колбах вдоль прохода.",
    "ДОСТУП НА МОНТАЖ": "с 07:00 в день мероприятия",
    "ОКНО МОНТАЖА": "6 часов (с 07:00 до 13:00)",
    "КОНСТРУКЦИИ ДЕКОРА": "Металлическая арка 2.5м, стойки под композиции, текстиль",
  });

  // Synchronize state if project prop is passed
  useEffect(() => {
    if (project) {
      setProjectName(project.name || "Свадьба «Свет и Грация»");
      setTitleInput(project.name || "Свадьба «Свет и Грация»");
      if (project.currentStep !== undefined) {
        setCurrentStep(project.currentStep);
      }
      if (project.status === 'trash' || project.status === 'progress' || project.status === 'approved') {
        setProjectStatus(project.status === 'approved' ? 'completed' : 'in_progress');
      }

      const formattedDate = project.date
        ? (project.date.includes('T') ? new Date(project.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : project.date)
        : "15 сентября 2026";

      const formattedBudget = project.budget
        ? `${project.budget.toLocaleString('ru')} ₽`
        : "450 000 ₽";

      setBriefValues(prev => ({
        ...prev,
        "ИМЯ КЛИЕНТА": project.clientName && project.clientName !== 'Не указан' ? project.clientName : (prev["ИМЯ КЛИЕНТА"] || "Анна Соколова"),
        "ТЕЛЕФОН": project.clientPhone || prev["ТЕЛЕФОН"] || "+7 (905) 123-45-67",
        "СОБЫТИЕ": project.name || prev["СОБЫТИЕ"] || "Свадьба Артёма и Анны",
        "ДАТА": formattedDate,
        "ПЛОЩАДКА": project.venue || prev["ПЛОЩАДКА"] || "Ресторан «Royal Hall»",
        "ОРИЕНТИРОВОЧНЫЙ БЮДЖЕТ": formattedBudget,
        "СТИЛЬ ОФОРМЛЕНИЯ": project.brief?.style || prev["СТИЛЬ ОФОРМЛЕНИЯ"] || "Современный органический шик",
        "ГОСТЕЙ": project.brief?.guestsCount ? `${project.brief.guestsCount} человек` : (prev["ГОСТЕЙ"] || "85 человек"),
        "ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ": project.brief?.specialRequests || prev["ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ"] || "",
        ...(project.briefData || {})
      }));

      if (project.budget) setFinalPrice(project.budget);
      if (project.advance !== undefined) setAdvanceAmount(project.advance);
      if (project.scenesData && project.scenesData.length > 0) setVisualizationScenes(project.scenesData);
      if (project.estimate && project.estimate.length > 0) setServiceEstimate(project.estimate);
      if (project.disabledSceneIds) setDisabledSceneIds(project.disabledSceneIds);
      if (project.customScenePrices) setCustomScenePrices(project.customScenePrices);
      if (project.photos && project.photos.length > 0) setVenuePhotos(project.photos);
    }
  }, [project]);

  const [customDecoratorFields, setCustomDecoratorFields] = useState<{ id: string; key: string }[]>([]);
  const [isAddingCustomField, setIsAddingCustomField] = useState<boolean>(false);
  const [newFieldName, setNewFieldName] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Overview collapse states for each section block
  const [overviewCollapsed, setOverviewCollapsed] = useState<Record<string, boolean>>({
    brief: false,
    design: false,
    calc: false,
    journal: false,
    docs: false,
  });

  const toggleOverviewSection = (key: string) => {
    setOverviewCollapsed(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Carousel state for Visualizations
  const [vizIndex, setVizIndex] = useState<number>(0);
  const visualizations = [
    {
      id: 1,
      title: 'ВИЗУАЛИЗАЦИЯ 1 (АРКА И ЦВЕТОЧНАЯ ЗОНА)',
      subtitle: 'Концепция декор-арки и зоны церемонии',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 2,
      title: 'ВИЗУАЛИЗАЦИЯ 2 (ПРЕЗИДИУМ & СТОЛ)',
      subtitle: '3D Эскиз оформления центрального стола',
      image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 3,
      title: 'ВИЗУАЛИЗАЦИЯ 3 (WELCOME-ЗОНА)',
      subtitle: 'Приветственный стенд и композиции у входа',
      image: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=800&q=80'
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
      showToast?.('Лимит достигнут', 'Максимальное количество фото в галерее — 6', 'info');
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
          showToast?.('Фото загружено', 'Новое фото площадки успешно добавлено в проект', 'success');
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

  // Estimate interactive state
  const [visualizationScenes, setVisualizationScenes] = useState([
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
  ]);

  const [disabledSceneIds, setDisabledSceneIds] = useState<string[]>([]);
  const [customScenePrices, setCustomScenePrices] = useState<Record<string, number>>({});
  const [serviceEstimate, setServiceEstimate] = useState<Array<{ id: string; name: string; category: string; quantity: number; price: number }>>([
    { id: 'def_work_1', name: 'Монтаж и демонтаж конструкций', category: 'Работа', quantity: 1, price: 12000 },
    { id: 'def_work_2', name: 'Транспортная доставка (Грузовой авто)', category: 'Доставка', quantity: 1, price: 5000 }
  ]);

  const [newWorkName, setNewWorkName] = useState('');
  const [newWorkPrice, setNewWorkPrice] = useState<number | ''>('');
  const [showAddWorkRow, setShowAddWorkRow] = useState(false);

  // Financial & status persistent state
  const [advanceAmount, setAdvanceAmount] = useState<number>(135000);
  const [isEditingClientPrice, setIsEditingClientPrice] = useState<boolean>(false);
  const [isEditingAdvance, setIsEditingAdvance] = useState<boolean>(false);
  const [projectStatus, setProjectStatus] = useState<'in_progress' | 'completed' | 'cancelled'>('in_progress');

  const [markupPercent] = useState<number>(20);
  const [taxRate] = useState<number>(6);
  const [finalPrice, setFinalPrice] = useState<number>(450000);

  const getSceneCost = (sc: any) => {
    if (customScenePrices[sc.id] !== undefined) {
      return customScenePrices[sc.id];
    }
    if (sc.elements && Array.isArray(sc.elements) && sc.elements.length > 0) {
      return sc.elements.reduce((sum: number, el: any) => sum + (Number(el.price) || 0), 0);
    }
    return sc.defaultPrice || 0;
  };

  const decorCost = visualizationScenes.reduce((sum: number, sc: any) => {
    if (disabledSceneIds.includes(sc.id)) return sum;
    return sum + getSceneCost(sc);
  }, 0);

  const serviceCost = serviceEstimate.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1), 0);
  const totalCost = decorCost + serviceCost;

  const taxAmount = finalPrice * (taxRate / 100);
  const calculatedProfit = finalPrice - totalCost - taxAmount;
  const profitMarginPercent = finalPrice > 0 ? Math.round((calculatedProfit / finalPrice) * 100) : 0;

  const handleToggleSceneInEstimate = (sceneId: string) => {
    const isCurrentlyDisabled = disabledSceneIds.includes(sceneId);
    const nextDisabled = isCurrentlyDisabled
      ? disabledSceneIds.filter(id => id !== sceneId)
      : [...disabledSceneIds, sceneId];
    setDisabledSceneIds(nextDisabled);

    const sceneObj = visualizationScenes.find(sc => sc.id === sceneId);
    const sceneName = sceneObj?.name || sceneId;
    if (isCurrentlyDisabled) {
      showToast?.('Включено в смету', `«${sceneName}» включена в расчет сметы`, 'success');
    } else {
      showToast?.('Исключено из сметы', `«${sceneName}» отключена и не учитывается в расчете`, 'info');
    }
  };

  const handleUpdateScenePrice = (sceneId: string, newPrice: number) => {
    setCustomScenePrices(prev => ({ ...prev, [sceneId]: newPrice }));
  };

  const handleUpdateSceneName = (sceneId: string, name: string) => {
    setVisualizationScenes(prev => prev.map(sc => sc.id === sceneId ? { ...sc, name } : sc));
  };

  const handleDeleteScene = (sceneId: string) => {
    const sceneObj = visualizationScenes.find(sc => sc.id === sceneId);
    const sceneName = sceneObj?.name || 'Позиция декора';
    setVisualizationScenes(prev => prev.filter(sc => sc.id !== sceneId));
    setCustomScenePrices(prev => {
      const next = { ...prev };
      delete next[sceneId];
      return next;
    });
    showToast?.('Декор удален', `«${sceneName}» удалена из сметы`, 'info');
  };

  const handleUpdateEstimateItemName = (id: string, name: string) => {
    setServiceEstimate(prev => prev.map(item => item.id === id ? { ...item, name } : item));
  };

  const handleUpdateEstimateItemPrice = (id: string, price: number) => {
    setServiceEstimate(prev => prev.map(item => item.id === id ? { ...item, price } : item));
  };

  const handleDeleteEstimateItem = (id: string) => {
    const item = serviceEstimate.find(i => i.id === id);
    const itemName = item?.name || 'Позиция';
    setServiceEstimate(prev => prev.filter(i => i.id !== id));
    showToast?.('Позиция удалена', `«${itemName}» удалена из сметы`, 'info');
  };

  const handleAddWorkPosition = () => {
    if (!showAddWorkRow) {
      setShowAddWorkRow(true);
      return;
    }
    const nameToAdd = newWorkName.trim() || 'Новые монтажные работы';
    const priceToAdd = newWorkPrice !== '' ? Number(newWorkPrice) : 0;
    const newItem = {
      id: `work_${Date.now()}`,
      name: nameToAdd,
      category: 'Доставка',
      quantity: 1,
      price: priceToAdd
    };
    setServiceEstimate(prev => [...prev, newItem]);
    setNewWorkName('');
    setNewWorkPrice('');
    setShowAddWorkRow(false);
    showToast?.('Работа добавлена', `Добавлена позиция «${nameToAdd}» (${priceToAdd.toLocaleString('ru')} ₽)`, 'success');
  };

  const handleResetCalculator = () => {
    setVisualizationScenes([
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
    ]);
    setServiceEstimate([
      { id: 'def_work_1', name: 'Монтаж и демонтаж конструкций', category: 'Работа', quantity: 1, price: 12000 },
      { id: 'def_work_2', name: 'Транспортная доставка (Грузовой авто)', category: 'Доставка', quantity: 1, price: 5000 }
    ]);
    setDisabledSceneIds([]);
    setCustomScenePrices({});
    setFinalPrice(450000);
    showToast?.('Сброс сметы', 'Параметры сметы восстановлены к исходным', 'info');
  };

  // Journal / Tasks & Notes State
  const [journalCollapsed, setJournalCollapsed] = useState(false);
  const [newType, setNewType] = useState<'task' | 'note'>('task');
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newCategory, setNewCategory] = useState<'Монтаж' | 'Закупка' | 'Смета' | 'Логистика' | 'Клиент' | 'Важное' | 'Общее'>('Монтаж');
  const [journalFilterType, setJournalFilterType] = useState<'all' | 'task' | 'note'>('all');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>('all');

  const [taskNoteList, setTaskNoteList] = useState<Array<{
    id: string;
    type: 'task' | 'note';
    title: string;
    dueDate: string;
    completed?: boolean;
    category: string;
    createdAt?: string;
  }>>([
    {
      id: 'tn_1',
      type: 'task',
      title: 'Заказать каркас круглого президиума у сварщиков',
      dueDate: '2026-08-10',
      completed: true,
      category: 'Монтаж',
      createdAt: '01.08.2026'
    },
    {
      id: 'tn_2',
      type: 'task',
      title: 'Согласовать палитру роз с флористом (голландская поставка)',
      dueDate: '2026-08-12',
      completed: false,
      category: 'Закупка',
      createdAt: '02.08.2026'
    },
    {
      id: 'tn_3',
      type: 'note',
      title: 'Площадка просит сделать защитное покрытие под свечи на столах',
      dueDate: '2026-08-15',
      category: 'Клиент',
      createdAt: '03.08.2026'
    },
    {
      id: 'tn_4',
      type: 'task',
      title: 'Забронировать грузовой борт на ночной демонтаж (23:00)',
      dueDate: '2026-08-14',
      completed: false,
      category: 'Логистика',
      createdAt: '04.08.2026'
    },
    {
      id: 'tn_5',
      type: 'note',
      title: 'Высота потолков в Royal Hall ровно 4.5м, нужны стремянки 3м+',
      dueDate: '2026-08-15',
      category: 'Важное',
      createdAt: '05.08.2026'
    }
  ]);

  const handleAddTaskNote = () => {
    if (!newTitle.trim()) {
      showToast?.('Заполните название', 'Пожалуйста, введите текст задачи или заметки.', 'warn');
      return;
    }

    const newItem = {
      id: `tn_${Date.now()}`,
      type: newType,
      title: newTitle.trim(),
      dueDate: newDueDate || '2026-08-15',
      completed: newType === 'task' ? false : undefined,
      category: newCategory,
      createdAt: new Date().toLocaleDateString('ru-RU')
    };

    setTaskNoteList(prev => [newItem, ...prev]);
    setNewTitle('');
    showToast?.(
      newType === 'task' ? 'Задача добавлена' : 'Заметка добавлена',
      `Запись успешно создана и привязана к дате ${newItem.dueDate}`,
      'success'
    );
  };

  const handleToggleTaskNote = (id: string) => {
    setTaskNoteList(prev => prev.map(item => {
      if (item.id === id && item.type === 'task') {
        const nextVal = !item.completed;
        if (nextVal) {
          showToast?.('Задача выполнена', `Отмечено как выполнено: «${item.title}»`, 'success');
        }
        return { ...item, completed: nextVal };
      }
      return item;
    }));
  };

  const handleDeleteTaskNote = (id: string) => {
    const item = taskNoteList.find(i => i.id === id);
    const itemTitle = item?.title || 'Запись';
    const isTask = item?.type === 'task';
    setTaskNoteList(prev => prev.filter(i => i.id !== id));
    showToast?.('Удалено', `${isTask ? 'Задача' : 'Заметка'} «${itemTitle}» удалена.`, 'info');
  };

  const handleUpdateBriefField = (key: string, value: string) => {
    setBriefValues(prev => ({ ...prev, [key]: value }));
  };

  const briefFieldDefinitions = useMemo(() => [
    ...baseBriefFieldDefinitions,
    ...customDecoratorFields.map(f => ({ key: f.key, filledBy: 'designer' as const }))
  ], [customDecoratorFields]);

  const filledBriefCount = useMemo(() => {
    return briefFieldDefinitions.filter(f => {
      const v = briefValues[f.key];
      return v && v.trim() !== "" && v !== "(требует заполнения)";
    }).length;
  }, [briefFieldDefinitions, briefValues]);

  const totalBriefCount = briefFieldDefinitions.length;
  const briefFilledPercentage = Math.round((filledBriefCount / totalBriefCount) * 100);

  const tabs = [
    { id: 'overview', label: 'Обзор', icon: Layout, color: 'text-purple-600 dark:text-purple-400' },
    { id: 'brief', label: 'Бриф', icon: Clipboard, color: 'text-rose-600 dark:text-rose-400' },
    { id: 'design', label: 'Дизайн', icon: Palette, color: 'text-indigo-600 dark:text-indigo-400' },
    { id: 'calc', label: 'Смета', icon: SlidersHorizontal, color: 'text-emerald-600 dark:text-emerald-400' },
    { id: 'journal', label: 'Заметки', icon: CheckSquare, color: 'text-amber-600 dark:text-amber-400' },
    { id: 'docs', label: 'Документы', icon: FolderOpen, color: 'text-blue-600 dark:text-blue-400' },
  ] as const;

  // Measurement refs for seamless SVG path generation & mobile scroll indicator
  const containerRef = useRef<HTMLDivElement>(null);
  const tabScrollRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const [dimensions, setDimensions] = useState({ width: 900, height: 480 });
  const [activeTabRect, setActiveTabRect] = useState({ x1: 0, x2: 130 });
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);

  const checkScrollable = () => {
    if (tabScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabScrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  const updateBounds = () => {
    if (!containerRef.current) return;
    const cRect = containerRef.current.getBoundingClientRect();
    setDimensions({ width: cRect.width, height: cRect.height });

    const activeBtn = tabRefs.current[activeTab];
    if (activeBtn) {
      const btnRect = activeBtn.getBoundingClientRect();
      const x1 = Math.max(0, btnRect.left - cRect.left);
      const x2 = Math.min(cRect.width, x1 + btnRect.width);
      setActiveTabRect({ x1, x2 });
    }
  };

  const handleTabScroll = () => {
    checkScrollable();
    updateBounds();
  };

  useLayoutEffect(() => {
    updateBounds();
    checkScrollable();

    // Scroll active tab into view smoothly on mobile/tablet
    const activeBtn = tabRefs.current[activeTab];
    if (activeBtn && tabScrollRef.current) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    window.addEventListener('resize', updateBounds);
    window.addEventListener('resize', checkScrollable);
    const ro = new ResizeObserver(() => {
      updateBounds();
      checkScrollable();
    });
    if (containerRef.current) ro.observe(containerRef.current);
    if (tabScrollRef.current) ro.observe(tabScrollRef.current);

    return () => {
      window.removeEventListener('resize', updateBounds);
      window.removeEventListener('resize', checkScrollable);
      ro.disconnect();
    };
  }, [activeTab, customDecoratorFields, briefValues]);

  // Generate seamless single SVG path for active tab + card body
  const svgPathD = useMemo(() => {
    const W = dimensions.width;
    const H = dimensions.height;
    const x1 = activeTabRect.x1;
    const x2 = activeTabRect.x2;

    const H_t = 44;     // Tab height
    const R_top = 18;   // Active tab top corner radius
    const R_conc = 16;  // Inverted concave transition fillet radius
    const R_card = 28;  // Outer card corner radius

    const isFirst = x1 <= 16;
    const isLast = x2 >= W - 16;

    let path = '';

    if (isFirst) {
      // ACTIVE TAB IS FLUSH WITH LEFT WALL (e.g. "Обзор")
      path = `M 0,${R_top} `;
      path += `A ${R_top},${R_top} 0 0,1 ${R_top},0 `;
      path += `L ${Math.max(R_top, x2 - R_top)},0 `;
      path += `A ${R_top},${R_top} 0 0,1 ${x2},${R_top} `;
      path += `L ${x2},${H_t - R_conc} `;
      path += `A ${R_conc},${R_conc} 0 0,0 ${x2 + R_conc},${H_t} `;
      path += `L ${W - R_card},${H_t} `;
      path += `A ${R_card},${R_card} 0 0,1 ${W},${H_t + R_card} `;
      path += `L ${W},${H - R_card} `;
      path += `A ${R_card},${R_card} 0 0,1 ${W - R_card},${H} `;
      path += `L ${R_card},${H} `;
      path += `A ${R_card},${R_card} 0 0,1 0,${H - R_card} `;
      path += `Z`;
    } else if (isLast) {
      // ACTIVE TAB IS FLUSH WITH RIGHT WALL
      path = `M 0,${H_t + R_card} `;
      path += `A ${R_card},${R_card} 0 0,1 ${R_card},${H_t} `;
      path += `L ${x1 - R_conc},${H_t} `;
      path += `A ${R_conc},${R_conc} 0 0,0 ${x1},${H_t - R_conc} `;
      path += `L ${x1},${R_top} `;
      path += `A ${R_top},${R_top} 0 0,1 ${x1 + R_top},0 `;
      path += `L ${W - R_top},0 `;
      path += `A ${R_top},${R_top} 0 0,1 ${W},${R_top} `;
      path += `L ${W},${H - R_card} `;
      path += `A ${R_card},${R_card} 0 0,1 ${W - R_card},${H} `;
      path += `L ${R_card},${H} `;
      path += `A ${R_card},${R_card} 0 0,1 0,${H - R_card} `;
      path += `Z`;
    } else {
      // MIDDLE ACTIVE TAB (e.g. "Бриф", "Дизайн", "Смета")
      path = `M 0,${H_t + R_card} `;
      path += `A ${R_card},${R_card} 0 0,1 ${R_card},${H_t} `;
      path += `L ${x1 - R_conc},${H_t} `;
      path += `A ${R_conc},${R_conc} 0 0,0 ${x1},${H_t - R_conc} `;
      path += `L ${x1},${R_top} `;
      path += `A ${R_top},${R_top} 0 0,1 ${x1 + R_top},0 `;
      path += `L ${x2 - R_top},0 `;
      path += `A ${R_top},${R_top} 0 0,1 ${x2},${R_top} `;
      path += `L ${x2},${H_t - R_conc} `;
      path += `A ${R_conc},${R_conc} 0 0,0 ${x2 + R_conc},${H_t} `;
      path += `L ${W - R_card},${H_t} `;
      path += `A ${R_card},${R_card} 0 0,1 ${W},${H_t + R_card} `;
      path += `L ${W},${H - R_card} `;
      path += `A ${R_card},${R_card} 0 0,1 ${W - R_card},${H} `;
      path += `L ${R_card},${H} `;
      path += `A ${R_card},${R_card} 0 0,1 0,${H - R_card} `;
      path += `Z`;
    }

    return path;
  }, [dimensions, activeTabRect]);

  const tabStylesMap: Record<string, {
    lightGlow: string;
    darkGlow: string;
    strokeClass: string;
  }> = {
    overview: {
      lightGlow: 'rgba(168, 85, 247, 0.20)',
      darkGlow: 'rgba(168, 85, 247, 0.15)',
      strokeClass: 'stroke-purple-300/80 dark:stroke-purple-800/80',
    },
    brief: {
      lightGlow: 'rgba(244, 63, 94, 0.20)',
      darkGlow: 'rgba(244, 63, 94, 0.15)',
      strokeClass: 'stroke-rose-300/80 dark:stroke-rose-800/80',
    },
    design: {
      lightGlow: 'rgba(99, 102, 241, 0.20)',
      darkGlow: 'rgba(99, 102, 241, 0.15)',
      strokeClass: 'stroke-indigo-300/80 dark:stroke-indigo-800/80',
    },
    calc: {
      lightGlow: 'rgba(16, 185, 129, 0.20)',
      darkGlow: 'rgba(16, 185, 129, 0.15)',
      strokeClass: 'stroke-emerald-300/80 dark:stroke-emerald-800/80',
    },
    journal: {
      lightGlow: 'rgba(245, 158, 11, 0.20)',
      darkGlow: 'rgba(245, 158, 11, 0.15)',
      strokeClass: 'stroke-amber-300/80 dark:stroke-amber-800/80',
    },
    docs: {
      lightGlow: 'rgba(59, 130, 246, 0.20)',
      darkGlow: 'rgba(59, 130, 246, 0.15)',
      strokeClass: 'stroke-blue-300/80 dark:stroke-blue-800/80',
    },
  };

  const activeTabCXPercent = useMemo(() => {
    if (!dimensions.width || dimensions.width === 0) return 20;
    const center = (activeTabRect.x1 + activeTabRect.x2) / 2;
    const pct = Math.round((center / dimensions.width) * 100);
    return Math.max(6, Math.min(94, pct));
  }, [dimensions.width, activeTabRect]);

  const currentTabStyle = tabStylesMap[activeTab] || tabStylesMap.overview;

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-16 max-w-6xl mx-auto">
      {/* TOP HEADER SECTION / UNFRAMED PROJECT HEADER (MATCHING PAGE HEADERS) */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        
        {/* LEFT SIDE: TITLE + EDIT PENCIL + NOTIFICATION BELL + INFO PILLS */}
        <div className="space-y-2.5 min-w-0 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full bg-white/80 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:border-[#8C52D0] text-zinc-600 dark:text-zinc-300 hover:text-[#8C52D0] transition-all cursor-pointer shadow-2xs shrink-0"
                title="Назад к списку проектов"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
            )}
            {/* INTERACTIVE PROJECT NAME */}
            {isEditingTitle ? (
              <div className="flex items-center gap-2 max-w-full">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setProjectName(titleInput.trim() || 'Без названия');
                      setIsEditingTitle(false);
                      showToast?.('Название обновлено', `Новое название проекта: ${titleInput}`, 'success');
                    }
                  }}
                  autoFocus
                  className="text-xl sm:text-2xl font-[800] tracking-tight text-[var(--foreground)] bg-white dark:bg-zinc-800 border-2 border-[#8C52D0] rounded-xl px-3 py-1 shadow-2xs focus:outline-none"
                />
                <button
                  onClick={() => {
                    setProjectName(titleInput.trim() || 'Без названия');
                    setIsEditingTitle(false);
                    showToast?.('Название обновлено', `Новое название проекта: ${titleInput}`, 'success');
                  }}
                  className="p-2 bg-[#8C52D0] text-white rounded-full hover:bg-[#582F89] transition-colors cursor-pointer shadow-2xs"
                  title="Сохранить название"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 min-w-0 group flex-wrap">
                <h1 className="text-xl sm:text-2xl font-[800] tracking-tight text-[var(--foreground)] leading-snug break-words">
                  {projectName}
                </h1>
                {/* PENCIL ICON BUTTON */}
                <button
                  onClick={() => {
                    setTitleInput(projectName);
                    setIsEditingTitle(true);
                  }}
                  className="p-1.5 rounded-full hover:bg-purple-100 dark:hover:bg-purple-950/80 text-zinc-400 group-hover:text-[#8C52D0] transition-colors cursor-pointer shrink-0"
                  title="Редактировать название проекта"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* NOTIFICATION BELL ICON BUTTON */}
            <div className="relative shrink-0">
              <button
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setHasNotifications(false);
                }}
                className="p-1.5 rounded-full bg-white/80 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:border-[#8C52D0] text-zinc-600 dark:text-zinc-300 hover:text-[#8C52D0] transition-all cursor-pointer relative shadow-2xs"
                title="Уведомления проекта"
              >
                <Bell className="w-4 h-4" />
                {hasNotifications && (
                  <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-zinc-900 animate-pulse" />
                )}
              </button>

              {/* NOTIFICATION POPOVER */}
              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 z-50 w-72 p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-purple-200 dark:border-purple-900/60 shadow-2xl space-y-2"
                    >
                      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                          <Bell className="w-3.5 h-3.5 text-[#8C52D0]" /> Уведомления
                        </span>
                        <span className="text-[10px] text-zinc-400">2 новых</span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
                          <div className="font-semibold text-zinc-800 dark:text-zinc-200">Клиент согласовал смету</div>
                          <div className="text-[11px] text-zinc-500">Сегодня, 14:20</div>
                        </div>
                        <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
                          <div className="font-semibold text-zinc-800 dark:text-zinc-200">Новый коммент к брифу</div>
                          <div className="text-[11px] text-zinc-500">Вчера, 18:45</div>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* CLIENT & PROJECT INFO PILLS */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 w-full min-w-0">
            <span className="flex items-center gap-1 font-medium bg-white/80 dark:bg-zinc-800/80 px-2.5 py-0.5 rounded-full border border-white/90 dark:border-zinc-700/60 shadow-2xs text-[11px] shrink-0">
              <User className="w-3 h-3 text-[#8C52D0]" /> <strong className="font-bold text-zinc-900 dark:text-zinc-100">{briefValues["ИМЯ КЛИЕНТА"] || 'Анна Соколова'}</strong>
            </span>

            <a href={`tel:${briefValues["ТЕЛЕФОН"] || '+7 (905) 123-45-67'}`} className="flex items-center gap-1 font-medium bg-white/80 dark:bg-zinc-800/80 px-2.5 py-0.5 rounded-full border border-white/90 dark:border-zinc-700/60 shadow-2xs text-[11px] hover:border-[#8C52D0] hover:text-[#8C52D0] transition-colors shrink-0">
              <Phone className="w-3 h-3 text-[#8C52D0]" /> {briefValues["ТЕЛЕФОН"] || '+7 (905) 123-45-67'}
            </a>

            <span className="flex items-center gap-1 font-medium bg-white/80 dark:bg-zinc-800/80 px-2.5 py-0.5 rounded-full border border-white/90 dark:border-zinc-700/60 shadow-2xs text-[11px] shrink-0">
              <Calendar className="w-3 h-3 text-[#8C52D0]" /> {briefValues["ДАТА"] || '15 сент 2026'}
            </span>

            <span className="flex items-center gap-1 font-medium bg-white/80 dark:bg-zinc-800/80 px-2.5 py-0.5 rounded-full border border-white/90 dark:border-zinc-700/60 shadow-2xs text-[11px] shrink-0">
              <MapPin className="w-3 h-3 text-[#8C52D0]" /> {briefValues["ПЛОЩАДКА"] || '«Royal Hall»'}
            </span>
          </div>
        </div>

        {/* RIGHT SIDE: COMPACT ACTION BUTTONS */}
        <div className="flex items-center gap-2 shrink-0 self-start xl:self-center">
          
          {/* STEP BADGE POPUP BUTTON */}
          <div className="relative shrink-0 z-30">
            <button
              onClick={() => setIsStepMenuOpen(!isStepMenuOpen)}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-purple-100/90 dark:bg-purple-950/90 text-[#582F89] dark:text-purple-200 border border-purple-300 dark:border-purple-700/60 shadow-xs hover:bg-purple-200/80 transition-all cursor-pointer"
              title="Этап проекта"
            >
              <span className="w-2 h-2 rounded-full bg-[#8C52D0] animate-pulse shrink-0" />
              <span>{steps[currentStep]}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 text-[#8C52D0] shrink-0 ${isStepMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isStepMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsStepMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 z-50 w-64 p-2 rounded-2xl bg-white dark:bg-zinc-900 border border-purple-300 dark:border-purple-800 shadow-2xl space-y-1"
                  >
                    <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                      Выберите этап проекта
                    </div>
                    {steps.map((label, idx) => {
                      const isCompleted = idx < currentStep;
                      const isCurrent = idx === currentStep;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setCurrentStep(idx);
                            setIsStepMenuOpen(false);
                            showToast?.('Этап изменен', `Статус проекта переведен на: ${label}`, 'success');
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                            isCurrent
                              ? 'bg-gradient-to-r from-[#8C52D0] to-[#582F89] text-white shadow-xs'
                              : isCompleted
                              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                          }`}
                        >
                          <span className="flex items-center gap-2 truncate">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                              isCurrent ? 'bg-white text-[#582F89]' : isCompleted ? 'bg-emerald-500 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'
                            }`}>
                              {isCompleted ? '✓' : idx + 1}
                            </span>
                            <span className="truncate">{label}</span>
                          </span>
                          {isCurrent && <span className="text-[10px] opacity-80 font-bold shrink-0 ml-1">Текущий</span>}
                        </button>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* SHARE / SEND TO CLIENT BUTTON */}
          <button
            onClick={() => {
              const briefUrl = `${window.location.origin}/brief/test-project`;
              navigator.clipboard.writeText(briefUrl);
              showToast?.('Ссылка скопирована', `Ссылка для клиента скопирована в буфер обмена: ${briefUrl}`, 'success');
            }}
            className="w-8 h-8 sm:w-auto sm:h-8 sm:px-3.5 rounded-full text-white flex items-center justify-center gap-1.5 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shrink-0 shadow-md"
            style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
            title="Отправить клиенту (Поделиться)"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs font-semibold">Поделиться</span>
          </button>

          {/* SAVE BUTTON */}
          <button
            onClick={() => {
              showToast?.('Сохранено', 'Все изменения проекта успешно сохранены.', 'success');
            }}
            className="w-8 h-8 sm:w-auto sm:h-8 sm:px-3.5 border border-emerald-500/80 bg-white/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 rounded-full flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer shrink-0 shadow-2xs hover:scale-105 active:scale-95"
            title="Сохранить изменения"
          >
            <Save className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline text-xs font-semibold">Сохранено</span>
          </button>

        </div>

      </div>

      {/* 2. FOLDER TABS & CONTENT CONTAINER WITH DYNAMIC SVG FRAME */}
      <div ref={containerRef} className="relative w-full">
        {/* SOFT ACCENT HALO SPOT UNDER ACTIVE TAB (LOCKED STRICTLY TO TOP HALF OF CARD) */}
        <div
          className="absolute top-0 left-0 right-0 h-1/2 rounded-t-[28px] pointer-events-none transition-all duration-500 opacity-60 dark:opacity-30 z-0 overflow-hidden"
          style={{
            background: `radial-gradient(ellipse 80% 100% at ${activeTabCXPercent}% 0%, ${currentTabStyle.lightGlow} 0%, rgba(255, 255, 255, 0) 100%)`,
          }}
        />

        {/* SVG BACKGROUND FRAME */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300 z-0 overflow-visible"
          viewBox={`0 0 ${dimensions.width || 900} ${dimensions.height || 480}`}
          preserveAspectRatio="none"
        >
          <path
            d={svgPathD}
            style={{
              filter: `drop-shadow(0 2px 4px rgba(0, 0, 0, 0.03))`,
              fill: 'rgba(255, 255, 255, 0.50)',
            }}
            className={`dark:hidden transition-all duration-300 ${currentTabStyle.strokeClass}`}
            strokeWidth="1"
          />
          <path
            d={svgPathD}
            style={{
              filter: `drop-shadow(0 2px 6px rgba(0, 0, 0, 0.20))`,
              fill: 'rgba(24, 24, 27, 0.40)',
            }}
            className={`hidden dark:block transition-all duration-300 ${currentTabStyle.strokeClass}`}
            strokeWidth="1"
          />
        </svg>

        {/* TAB NAVIGATION BUTTONS CONTAINER */}
        <div className="relative z-10 w-full">
          {/* MOBILE FINGER TOUCH INDICATOR FOR EXTRA SCROLLABLE TABS */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => {
                if (tabScrollRef.current) {
                  tabScrollRef.current.scrollBy({ left: 120, behavior: 'smooth' });
                }
              }}
              className="md:hidden absolute right-1 -top-1 z-20 w-8 h-8 rounded-full bg-zinc-900/80 dark:bg-zinc-800/80 border border-white/20 shadow-lg text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer backdrop-blur-md"
              title="Листайте вкладки"
            >
              <Hand className="w-4 h-4 text-purple-300 animate-bounce" />
            </button>
          )}

          <div
            ref={tabScrollRef}
            onScroll={handleTabScroll}
            className="flex items-center justify-between sm:justify-start gap-0.5 sm:gap-1 md:gap-2 px-1 sm:px-2 md:px-4 pt-1 overflow-x-auto no-scrollbar scroll-smooth snap-x"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={(el) => (tabRefs.current[tab.id] = el)}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-1 sm:py-1.5 px-1 sm:px-2 md:px-3 lg:px-4 text-[10px] sm:text-xs md:text-sm font-bold flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-2 transition-all duration-200 cursor-pointer shrink-1 md:shrink-0 ${
                    isActive
                      ? 'text-zinc-900 dark:text-zinc-100'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-white/20 dark:hover:bg-zinc-800/20 rounded-t-xl'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isActive ? tab.color : 'text-zinc-400'}`} />
                  <span className="whitespace-nowrap tracking-tight leading-none text-[10px] sm:text-xs md:text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CARD BODY WITH ANIMATED TAB TRANSITIONS */}
        <div className="relative z-10 p-4 sm:p-6 pt-6">
          <AnimatePresence mode="wait">
            {/* TAB 1: ОБЗОР */}
            {activeTab === 'overview' && (
              <motion.div
                key="tab-overview"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
          {/* 2. FINANCIAL SUMMARY CARDS IN A SINGLE ROW */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
        
        {/* CARD 1: СМЕТНАЯ СТОИМОСТЬ / ЧЕК КЛИЕНТА */}
        <div className="bg-gradient-to-r from-purple-100/70 via-white/70 to-purple-100/70 dark:from-purple-950/70 dark:via-zinc-900/70 dark:to-purple-950/70 backdrop-blur-md border border-purple-300/80 dark:border-purple-800/60 rounded-2xl p-2 sm:p-3 flex flex-col justify-between shadow-xs hover:border-purple-400 transition-all min-h-[90px] sm:min-h-[100px]">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] sm:text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal truncate">
              Смета
            </span>
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-purple-100/90 dark:bg-purple-950/80 text-[#8C52D0] dark:text-purple-300 flex items-center justify-center shrink-0">
              <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2]" />
            </div>
          </div>

          <div className="my-1">
            <div className="text-sm sm:text-lg md:text-xl font-[800] text-[#582F89] dark:text-purple-200 tracking-tight leading-none font-mono">
              {finalPrice.toLocaleString('ru')} ₽
            </div>
          </div>

          <div className="pt-1 border-t border-purple-200/50 dark:border-purple-900/50 flex items-center justify-between text-[9px] sm:text-[10px]">
            <span className="text-zinc-600 dark:text-zinc-400 font-normal truncate hidden sm:inline">Бюджет</span>
            <span className="font-bold text-[#8C52D0] ml-auto">100%</span>
          </div>
        </div>

        {/* CARD 2: ПОЛУЧЕННАЯ ПРЕДОПЛАТА */}
        <div className="bg-gradient-to-r from-emerald-100/70 via-white/70 to-emerald-100/70 dark:from-emerald-950/70 dark:via-zinc-900/70 dark:to-emerald-950/70 backdrop-blur-md border border-emerald-300/80 dark:border-emerald-800/60 rounded-2xl p-2 sm:p-3 flex flex-col justify-between shadow-xs hover:border-emerald-400 transition-all min-h-[90px] sm:min-h-[100px]">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] sm:text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal truncate">
              Аванс
            </span>
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2]" />
            </div>
          </div>

          <div className="my-1">
            <div className="text-sm sm:text-lg md:text-xl font-[800] text-[#059669] dark:text-emerald-300 tracking-tight leading-none font-mono">
              {advanceAmount.toLocaleString('ru')} ₽
            </div>
          </div>

          <div className="pt-1 border-t border-emerald-200/50 dark:border-emerald-900/50 flex items-center justify-between text-[9px] sm:text-[10px]">
            <span className="text-zinc-600 dark:text-zinc-400 font-normal truncate hidden sm:inline">Внесено</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 ml-auto">
              {finalPrice > 0 ? Math.round((advanceAmount / finalPrice) * 100) : 0}% ✓
            </span>
          </div>
        </div>

        {/* CARD 3: ОСТАТОК (ЖЕЛТЫЙ / ЯНТАРНЫЙ) */}
        <div className="bg-gradient-to-r from-amber-100/70 via-white/70 to-amber-100/70 dark:from-amber-950/70 dark:via-zinc-900/70 dark:to-amber-950/70 backdrop-blur-md border border-amber-300/80 dark:border-amber-800/60 rounded-2xl p-2 sm:p-3 flex flex-col justify-between shadow-xs hover:border-amber-400 transition-all min-h-[90px] sm:min-h-[100px]">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] sm:text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal truncate">
              Остаток
            </span>
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-amber-100/90 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <CreditCard className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2]" />
            </div>
          </div>

          <div className="my-1">
            <div className="text-sm sm:text-lg md:text-xl font-[800] text-[#EA580C] dark:text-amber-300 tracking-tight leading-none font-mono">
              {Math.max(0, finalPrice - advanceAmount).toLocaleString('ru')} ₽
            </div>
          </div>

          <div className="pt-1 border-t border-amber-200/50 dark:border-amber-900/50 flex items-center justify-between text-[9px] sm:text-[10px]">
            <span className="text-zinc-600 dark:text-zinc-400 font-normal truncate hidden sm:inline">К оплате</span>
            <span className="font-bold text-[#EA580C] dark:text-amber-300 ml-auto">
              {finalPrice > 0 ? Math.max(0, 100 - Math.round((advanceAmount / finalPrice) * 100)) : 0}%
            </span>
          </div>
        </div>
      </div>

      <BriefBlock
                    isOverview={true}
                    overviewCollapsed={overviewCollapsed}
                    toggleOverviewSection={toggleOverviewSection}
                    briefFilledPercentage={briefFilledPercentage}
                    filledBriefCount={filledBriefCount}
                    totalBriefCount={totalBriefCount}
                    showToast={showToast}
                    briefFieldDefinitions={briefFieldDefinitions}
                    briefValues={briefValues}
                    handleUpdateBriefField={handleUpdateBriefField}
                    customDecoratorFields={customDecoratorFields}
                    setCustomDecoratorFields={setCustomDecoratorFields}
                    setBriefValues={setBriefValues}
                    isAddingCustomField={isAddingCustomField}
                    setIsAddingCustomField={setIsAddingCustomField}
                    newFieldName={newFieldName}
                    setNewFieldName={setNewFieldName}
                  />

                  <DesignBlock
                    isOverview={true}
                    overviewCollapsed={overviewCollapsed}
                    toggleOverviewSection={toggleOverviewSection}
                    venuePhotos={venuePhotos}
                    setVenuePhotos={setVenuePhotos}
                    showToast={showToast}
                    fileInputRef={fileInputRef}
                    handlePhotoUpload={handlePhotoUpload}
                    vizIndex={vizIndex}
                    setVizIndex={setVizIndex}
                    visualizations={visualizations}
                    aiVizIndex={aiVizIndex}
                    setAiVizIndex={setAiVizIndex}
                    aiVisualizations={aiVisualizations}
                  />

                  <CalcBlock
                    isOverview={true}
                    overviewCollapsed={overviewCollapsed}
                    toggleOverviewSection={toggleOverviewSection}
                    finalPrice={finalPrice}
                    setFinalPrice={setFinalPrice}
                    handleResetCalculator={handleResetCalculator}
                    visualizationScenes={visualizationScenes}
                    setVisualizationScenes={setVisualizationScenes}
                    disabledSceneIds={disabledSceneIds}
                    getSceneCost={getSceneCost}
                    handleToggleSceneInEstimate={handleToggleSceneInEstimate}
                    handleUpdateScenePrice={handleUpdateScenePrice}
                    handleUpdateSceneName={handleUpdateSceneName}
                    handleDeleteScene={handleDeleteScene}
                    serviceEstimate={serviceEstimate}
                    setServiceEstimate={setServiceEstimate}
                    handleUpdateEstimateItemName={handleUpdateEstimateItemName}
                    handleUpdateEstimateItemPrice={handleUpdateEstimateItemPrice}
                    handleDeleteEstimateItem={handleDeleteEstimateItem}
                    showAddWorkRow={showAddWorkRow}
                    setShowAddWorkRow={setShowAddWorkRow}
                    newWorkName={newWorkName}
                    setNewWorkName={setNewWorkName}
                    newWorkPrice={newWorkPrice}
                    setNewWorkPrice={setNewWorkPrice}
                    handleAddWorkPosition={handleAddWorkPosition}
                    totalCost={totalCost}
                    profitMarginPercent={profitMarginPercent}
                    calculatedProfit={calculatedProfit}
                    showToast={showToast}
                  />

                  <JournalBlock
                    isOverview={true}
                    overviewCollapsed={overviewCollapsed}
                    toggleOverviewSection={toggleOverviewSection}
                    taskNoteList={taskNoteList}
                    newType={newType}
                    setNewType={setNewType}
                    newTitle={newTitle}
                    setNewTitle={setNewTitle}
                    newDueDate={newDueDate}
                    setNewDueDate={setNewDueDate}
                    newCategory={newCategory}
                    setNewCategory={setNewCategory}
                    journalFilterType={journalFilterType}
                    setJournalFilterType={setJournalFilterType}
                    selectedCalendarDate={selectedCalendarDate}
                    setSelectedCalendarDate={setSelectedCalendarDate}
                    handleAddTaskNote={handleAddTaskNote}
                    handleToggleTaskNote={handleToggleTaskNote}
                    handleDeleteTaskNote={handleDeleteTaskNote}
                  />

                  <DocsBlock
                    isOverview={true}
                    overviewCollapsed={overviewCollapsed}
                    toggleOverviewSection={toggleOverviewSection}
                    showToast={showToast}
                  />
                </motion.div>
              )}

              {/* TAB 2: БРИФ */}
              {activeTab === 'brief' && (
                <motion.div
                  key="tab-brief"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <BriefBlock
                    isOverview={false}
                    overviewCollapsed={overviewCollapsed}
                    toggleOverviewSection={toggleOverviewSection}
                    briefFilledPercentage={briefFilledPercentage}
                    filledBriefCount={filledBriefCount}
                    totalBriefCount={totalBriefCount}
                    showToast={showToast}
                    briefFieldDefinitions={briefFieldDefinitions}
                    briefValues={briefValues}
                    handleUpdateBriefField={handleUpdateBriefField}
                    customDecoratorFields={customDecoratorFields}
                    setCustomDecoratorFields={setCustomDecoratorFields}
                    setBriefValues={setBriefValues}
                    isAddingCustomField={isAddingCustomField}
                    setIsAddingCustomField={setIsAddingCustomField}
                    newFieldName={newFieldName}
                    setNewFieldName={setNewFieldName}
                  />
                </motion.div>
              )}

              {/* TAB 3: ДИЗАЙН */}
              {activeTab === 'design' && (
                <motion.div
                  key="tab-design"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <DesignBlock
                    isOverview={false}
                    overviewCollapsed={overviewCollapsed}
                    toggleOverviewSection={toggleOverviewSection}
                    venuePhotos={venuePhotos}
                    setVenuePhotos={setVenuePhotos}
                    showToast={showToast}
                    fileInputRef={fileInputRef}
                    handlePhotoUpload={handlePhotoUpload}
                    vizIndex={vizIndex}
                    setVizIndex={setVizIndex}
                    visualizations={visualizations}
                    aiVizIndex={aiVizIndex}
                    setAiVizIndex={setAiVizIndex}
                    aiVisualizations={aiVisualizations}
                  />
                </motion.div>
              )}

              {/* TAB 4: СМЕТА */}
              {activeTab === 'calc' && (
                <motion.div
                  key="tab-calc"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <CalcBlock
                    isOverview={false}
                    overviewCollapsed={overviewCollapsed}
                    toggleOverviewSection={toggleOverviewSection}
                    finalPrice={finalPrice}
                    setFinalPrice={setFinalPrice}
                    handleResetCalculator={handleResetCalculator}
                    visualizationScenes={visualizationScenes}
                    setVisualizationScenes={setVisualizationScenes}
                    disabledSceneIds={disabledSceneIds}
                    getSceneCost={getSceneCost}
                    handleToggleSceneInEstimate={handleToggleSceneInEstimate}
                    handleUpdateScenePrice={handleUpdateScenePrice}
                    handleUpdateSceneName={handleUpdateSceneName}
                    handleDeleteScene={handleDeleteScene}
                    serviceEstimate={serviceEstimate}
                    setServiceEstimate={setServiceEstimate}
                    handleUpdateEstimateItemName={handleUpdateEstimateItemName}
                    handleUpdateEstimateItemPrice={handleUpdateEstimateItemPrice}
                    handleDeleteEstimateItem={handleDeleteEstimateItem}
                    showAddWorkRow={showAddWorkRow}
                    setShowAddWorkRow={setShowAddWorkRow}
                    newWorkName={newWorkName}
                    setNewWorkName={setNewWorkName}
                    newWorkPrice={newWorkPrice}
                    setNewWorkPrice={setNewWorkPrice}
                    handleAddWorkPosition={handleAddWorkPosition}
                    totalCost={totalCost}
                    profitMarginPercent={profitMarginPercent}
                    calculatedProfit={calculatedProfit}
                    showToast={showToast}
                  />
                </motion.div>
              )}

              {/* TAB 5: ЗАМЕТКИ */}
              {activeTab === 'journal' && (
                <motion.div
                  key="tab-journal"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <JournalBlock
                    isOverview={false}
                    overviewCollapsed={overviewCollapsed}
                    toggleOverviewSection={toggleOverviewSection}
                    taskNoteList={taskNoteList}
                    newType={newType}
                    setNewType={setNewType}
                    newTitle={newTitle}
                    setNewTitle={setNewTitle}
                    newDueDate={newDueDate}
                    setNewDueDate={setNewDueDate}
                    newCategory={newCategory}
                    setNewCategory={setNewCategory}
                    journalFilterType={journalFilterType}
                    setJournalFilterType={setJournalFilterType}
                    selectedCalendarDate={selectedCalendarDate}
                    setSelectedCalendarDate={setSelectedCalendarDate}
                    handleAddTaskNote={handleAddTaskNote}
                    handleToggleTaskNote={handleToggleTaskNote}
                    handleDeleteTaskNote={handleDeleteTaskNote}
                  />
                </motion.div>
              )}

              {/* TAB 6: ДОКУМЕНТЫ */}
              {activeTab === 'docs' && (
                <motion.div
                  key="tab-docs"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between gap-4 pb-4 border-b border-zinc-200/40 dark:border-zinc-800/40">
                    <div className="flex items-center gap-3.5">
                      <div className="p-2 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
                        <FolderOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                          Документы и договоры
                        </h3>
                        <p className="text-xs sm:text-sm font-normal text-zinc-700 dark:text-zinc-300 leading-relaxed">
                          Договоры, акты приема-передачи и чеки оплаты
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => showToast?.('Генерация пакета', 'Создается комплект документов в PDF...', 'success')}
                      className="w-8 h-8 rounded-full text-white flex items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-105 active:scale-95 shadow-xs shrink-0"
                      style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
                      title="Сгенерировать документы"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>

                  {/* DOCUMENTS CONTENT BODY */}
                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        {
                          id: 'decor-contract',
                          title: 'Договор на декор',
                          code: '№ ДК-2026/08',
                          date: '01.08.2026',
                          size: '2.4 МБ',
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
                              {/* TOP HEADER: ICON + TITLE & CODE */}
                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs ${doc.iconBg}`}>
                                  <DocIcon className="w-5 h-5 stroke-[2.2]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400 font-normal uppercase tracking-normal block leading-tight mb-0.5">
                                    {doc.code}
                                  </span>
                                  <h4 className="font-semibold text-sm text-stone-900 dark:text-stone-100 group-hover:text-[#8C52D0] dark:group-hover:text-purple-300 transition-colors leading-snug">
                                    {doc.title}
                                  </h4>
                                </div>
                              </div>

                              {/* DESCRIPTION */}
                              <p className="text-xs text-zinc-700 dark:text-zinc-300 line-clamp-2 leading-relaxed">
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
                                  type="button"
                                  onClick={() => showToast?.('Просмотр документа', `Открываем ${doc.title}...`, 'info')}
                                  className="p-1.5 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-stone-500 hover:text-[#582F89] dark:hover:text-purple-300 rounded-lg transition-colors cursor-pointer"
                                  title="Просмотреть"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => showToast?.('Скачивание', `Загрузка файла ${doc.title}...`, 'success')}
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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      {/* 3. EXECUTIVE FINANCIAL & PROJECT MANAGEMENT VIOLET BAR */}
      <div className="mt-6 p-4 sm:p-5 bg-gradient-to-r from-[#8C52D0] via-[#733cb3] to-[#582F89] rounded-[28px] sm:rounded-[32px] text-white shadow-lg border border-purple-400/30">
        
        {/* SINGLE RESPONSIVE GRID CONTAINER */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-4 md:gap-y-0 items-center">

          {/* SECTION 1: ИТОГОВАЯ СТОИМОСТЬ */}
          <div className="md:col-span-4 flex flex-col justify-between pr-0 md:pr-6 border-b md:border-b-0 md:border-r border-white/20 pb-4 md:pb-0 space-y-2">
            {/* Top Row: Icon + Label opposite each other + Pencil edit button */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center shrink-0 shadow-2xs">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-white">
                  Итоговая стоимость
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingClientPrice(!isEditingClientPrice)}
                className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Редактировать стоимость"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Cost Value Aligned Left Below */}
            <div className="py-1 flex justify-start items-center">
              {isEditingClientPrice ? (
                <div className="flex items-center gap-2 justify-start w-full">
                  <input
                    type="number"
                    value={finalPrice === 0 ? '' : finalPrice}
                    onChange={(e) => setFinalPrice(e.target.value === '' ? 0 : Number(e.target.value))}
                    className="w-full max-w-[200px] bg-white text-zinc-900 border border-purple-300 rounded-full px-3 py-1 font-extrabold font-mono text-base text-left focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingClientPrice(false);
                      showToast?.('Обновлено', `Общая стоимость: ${finalPrice.toLocaleString('ru')} ₽`, 'success');
                    }}
                    className="p-1.5 bg-white text-[#582F89] rounded-full hover:bg-purple-100 transition-colors cursor-pointer shrink-0"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              ) : (
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight leading-none text-left">
                  {finalPrice.toLocaleString('ru')} ₽
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: ПРЕДОПЛАТА */}
          <div className="md:col-span-5 flex flex-col justify-between px-0 md:px-6 border-b md:border-b-0 md:border-r border-white/20 pb-4 md:pb-0 space-y-2">
            {/* Top Row: Icon + Label opposite each other + Pencil edit button + Preset Pills */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center shrink-0 shadow-2xs">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-white">
                  Предоплата:
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingAdvance(!isEditingAdvance)}
                  className="p-0.5 rounded-full text-white/70 hover:text-white transition-colors cursor-pointer"
                  title="Редактировать аванс"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </div>

              {/* Preset Pills */}
              <div className="flex items-center gap-1">
                {[30, 50, 100].map((pct) => {
                  const calculatedValue = Math.round(finalPrice * (pct / 100));
                  const isActive = advanceAmount === calculatedValue;
                  return (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        setAdvanceAmount(calculatedValue);
                        showToast?.('Аванс рассчитан', `Предоплата ${pct}% (${calculatedValue.toLocaleString('ru')} ₽)`, 'info');
                      }}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-white text-[#582F89] shadow-2xs'
                          : 'bg-white/20 hover:bg-white/30 text-white'
                      }`}
                    >
                      {pct}%
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Advance Amount Display / Input Pill */}
            <div className="py-0.5 flex justify-center items-center">
              {isEditingAdvance ? (
                <div className="flex items-center gap-2 justify-center w-full">
                  <input
                    type="number"
                    value={advanceAmount === 0 ? '' : advanceAmount}
                    onChange={(e) => setAdvanceAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                    className="w-full bg-white text-zinc-900 border border-purple-300 rounded-full px-4 py-1.5 font-extrabold font-mono text-base text-center focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingAdvance(false);
                      showToast?.('Аванс обновлен', `Аванс сохранен: ${advanceAmount.toLocaleString('ru')} ₽`, 'success');
                    }}
                    className="p-1.5 bg-white text-[#582F89] rounded-full hover:bg-purple-100 transition-colors cursor-pointer shrink-0"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              ) : (
                <div className="w-full bg-white/95 dark:bg-zinc-900/90 text-zinc-900 dark:text-white px-4 py-1.5 rounded-full flex items-center justify-between shadow-inner">
                  <span className="text-lg sm:text-xl font-extrabold font-mono text-[#582F89] dark:text-purple-300">
                    {advanceAmount.toLocaleString('ru')} ₽
                  </span>
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                    {finalPrice > 0 ? Math.round((advanceAmount / finalPrice) * 100) : 0}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: ACTION BUTTONS STACKED VERTICALLY IN TWO ROWS */}
          <div className="md:col-span-3 flex flex-col justify-center items-stretch gap-2 pl-0 md:pl-6 w-full">
            {/* Primary Button: Заказ сдан */}
            <button
              type="button"
              onClick={() => {
                const newStatus = projectStatus === 'completed' ? 'in_progress' : 'completed';
                setProjectStatus(newStatus);
                if (newStatus === 'completed') {
                  showToast?.('Проект сдан!', 'Проект успешно завершен и сдан клиенту 🎉', 'success');
                } else {
                  showToast?.('Статус проекта', 'Проект возвращен в работу', 'info');
                }
              }}
              className="w-full py-2 px-4 rounded-full bg-white hover:bg-purple-50 text-[#582F89] text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer text-center justify-center flex items-center gap-1.5 whitespace-nowrap"
            >
              <Check className="w-4 h-4 stroke-[3] text-[#8C52D0]" />
              <span>{projectStatus === 'completed' ? 'Заказ сдан ✓' : 'Заказ сдан'}</span>
            </button>

            {/* Secondary Button: Отменить */}
            <button
              type="button"
              onClick={() => {
                const newStatus = projectStatus === 'cancelled' ? 'in_progress' : 'cancelled';
                setProjectStatus(newStatus);
                if (newStatus === 'cancelled') {
                  showToast?.('Статус проекта', 'Проект переведен в статус «Отменён»', 'warn');
                } else {
                  showToast?.('Статус проекта', 'Проект возвращен в работу', 'info');
                }
              }}
              className="w-full py-2 px-4 rounded-full border border-white/40 hover:border-white bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer text-center justify-center flex items-center gap-1.5 whitespace-nowrap"
            >
              <X className="w-4 h-4" />
              <span>{projectStatus === 'cancelled' ? 'Отменён (Вернуть)' : 'Отменить'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

