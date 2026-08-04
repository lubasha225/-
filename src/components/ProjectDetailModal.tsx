import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
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
  Award
} from 'lucide-react';
import { Project, EstimateItem } from '../types';

interface ProjectDetailModalProps {
  project: Project | null;
  isOpen?: boolean;
  onClose: () => void;
  onUpdateProject: (updated: Project) => void;
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warn') => void;
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
  showToast
}: ProjectDetailModalProps) {
  if (!project) return null;

  // Variant Switcher: 1 = Classic Structured Grid (1:1 Figma), 2 = Modern Ergonomic Workspace
  const [designVariant, setDesignVariant] = useState<1 | 2>(1);

  // Tabs for Variant 1 & 2: 'all' | 'brief' | 'design' | 'calc' | 'journal' | 'docs' | 'calendar'
  const [activeTab, setActiveTab] = useState<'all' | 'brief' | 'design' | 'calc' | 'journal' | 'docs' | 'calendar'>('all');

  // Commercial financial calculation settings
  const [markupPercent, setMarkupPercent] = useState<number>(20);
  const [taxRate, setTaxRate] = useState<number>(6);
  const [finalPrice, setFinalPrice] = useState<number>(project.budget || 65000);
  const [prepayment, setPrepayment] = useState<number>(30000);

  // Hotspot modal state
  const [activeArchPoint, setActiveArchPoint] = useState<string>('A-304');
  const [isSpecModalOpen, setIsSpecModalOpen] = useState<boolean>(false);
  const [isBriefEditOpen, setIsBriefEditOpen] = useState<boolean>(false);
  const [briefCollapsed, setBriefCollapsed] = useState<boolean>(false);
  const [journalCollapsed, setJournalCollapsed] = useState<boolean>(false);
  const [calendarCollapsed, setCalendarCollapsed] = useState<boolean>(false);
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'user-note' | 'system'>('all');

  // Interactive estimates local input fields
  const [newEstName, setNewEstName] = useState('');
  const [newEstCat, setNewEstCat] = useState('Декор');
  const [newEstPrice, setNewEstPrice] = useState(1500);

  // Journal logs submission form
  const [journalInputText, setJournalInputText] = useState('');
  const [journalInputLink, setJournalInputLink] = useState('');
  const [journalInputType, setJournalInputType] = useState<'user-note' | 'important' | 'client-agreed'>('user-note');

  // Local state for chronologic timeline events
  const [journalLogs, setJournalLogs] = useState<JournalEntry[]>([
    { id: '1', timestamp: "15.08.2026, 13:45", type: "system", text: "Смета переведена в стадию калькуляции расценок", linkedItemId: null },
    { id: '2', timestamp: "15.08.2026, 11:30", type: "system", text: "Анна Соколова заполнила анкету технического брифа", linkedItemId: null },
    { id: '3', timestamp: "15.08.2026, 10:12", type: "system", text: "Проект создан в системе", linkedItemId: null }
  ]);

  // Carousel state for Visualizations
  const [vizIndex, setVizIndex] = useState<number>(0);
  const visualizations = [
    {
      id: 1,
      title: 'ВИЗУАЛИЗАЦИЯ 1 (Арка A-D)',
      subtitle: 'Кликните контрольную точку A, B, C, D',
      type: 'svg-arc'
    },
    {
      id: 2,
      title: 'ВИЗУАЛИЗАЦИЯ 2 (Президиум & Стол)',
      subtitle: '3D Эскиз оформления центрального стола',
      type: 'image',
      image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 3,
      title: 'ВИЗУАЛИЗАЦИЯ 3 (Welcome-зона)',
      subtitle: 'Приветственный стенд и композиции у входа',
      type: 'image',
      image: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=800&q=80'
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
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setVenuePhotos(prev => [...prev, event.target!.result as string]);
          showToast('Фото загружено', 'Новое фото площадки успешно добавлено в проект', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
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
    if (project.budget) {
      setFinalPrice(project.budget);
    }
  }, [project]);

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
    const now = new Date();
    const timestampStr = `${now.toLocaleDateString('ru-RU')}, ${now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    const newEntry: JournalEntry = {
      id: `${Date.now()}`,
      timestamp: timestampStr,
      type,
      text,
      linkedItemId: linkedId
    };
    setJournalLogs(prev => [newEntry, ...prev]);
  };

  // Stepper labels
  const steps = ['Бриф', 'Визуализация', 'Смета', 'Согласовано', 'Выполнено'];
  const progressPercentages = [20, 45, 64, 85, 100];

  const handleStepClick = (stepIndex: number) => {
    const updated = { ...project, currentStep: stepIndex };
    onUpdateProject(updated);
    addJournalLog(`Статус проекта изменен на «${steps[stepIndex]}»`, 'system');
    showToast('Этап изменен', `Проект переведен в статус: ${steps[stepIndex]}`, 'success');
  };

  // Cost calculations
  const decorEstimate = project.estimate.filter(item => item.category !== 'Работа' && item.category !== 'Доставка');
  const serviceEstimate = project.estimate.filter(item => item.category === 'Работа' || item.category === 'Доставка');

  const decorCost = decorEstimate.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const serviceCost = serviceEstimate.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalCost = decorCost + serviceCost;

  const recommendedPrice = totalCost * (1 + (markupPercent / 100));
  const taxAmount = finalPrice * (taxRate / 100);
  const calculatedProfit = finalPrice - totalCost - taxAmount;
  const profitMarginPercent = finalPrice > 0 ? Math.round((calculatedProfit / finalPrice) * 100) : 0;

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
    const nextBudget = nextEstimate.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const updated = {
      ...project,
      estimate: nextEstimate,
      budget: nextBudget
    };

    onUpdateProject(updated);
    setFinalPrice(nextBudget);
    addJournalLog(`Добавлена новая позиция сметы: «${newEstName}»`, 'system', newItem.id);

    setNewEstName('');
    showToast('Добавлено', 'Создана новая строчка в калькуляционном блоке.', 'success');
  };

  // Remove item
  const handleRemoveEstimate = (itemId: string, name: string) => {
    const nextEstimate = project.estimate.filter(item => item.id !== itemId);
    const nextBudget = nextEstimate.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const updated = {
      ...project,
      estimate: nextEstimate,
      budget: nextBudget
    };

    onUpdateProject(updated);
    setFinalPrice(nextBudget);
    addJournalLog(`Позиция «${name}» удалена из сметы`, 'system');
    showToast('Удалено', 'Строка сметы исключена из расчетов.', 'info');
  };

  // Edit item quantity/price inline
  const handleUpdateItemPrice = (itemId: string, price: number) => {
    const nextEstimate = project.estimate.map(item => item.id === itemId ? { ...item, price } : item);
    const nextBudget = nextEstimate.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const updated = {
      ...project,
      estimate: nextEstimate,
      budget: nextBudget
    };
    onUpdateProject(updated);
    setFinalPrice(nextBudget);
  };

  const handleUpdateItemQty = (itemId: string, quantity: number) => {
    const nextEstimate = project.estimate.map(item => item.id === itemId ? { ...item, quantity } : item);
    const nextBudget = nextEstimate.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const updated = {
      ...project,
      estimate: nextEstimate,
      budget: nextBudget
    };
    onUpdateProject(updated);
    setFinalPrice(nextBudget);
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

    const nextBudget = defaultEstimate.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const updated = {
      ...project,
      estimate: defaultEstimate,
      budget: nextBudget
    };

    onUpdateProject(updated);
    setFinalPrice(nextBudget);
    setMarkupPercent(20);
    addJournalLog("Выполнен полный сброс калькулятора сметы к изначальным спецификациям", "system");
    showToast('Сброшено', 'Смета переустановлена к изначальным спецификациям.', 'info');
  };

  // Add Custom Event from Journal block
  const handleSubmitCustomJournal = () => {
    if (!journalInputText.trim()) {
      showToast('Ошибка ввода', 'Пожалуйста, введите текст заметки.', 'warn');
      return;
    }

    addJournalLog(journalInputText.trim(), journalInputType, journalInputLink || null);
    setJournalInputText('');
    setJournalInputLink('');
    showToast('Запись внесена', 'Событие успешно зарегистрировано в журнале проекта.', 'success');
  };

  // Hotspot selective Spec modal opener
  const handleSelectHotspot = (pointId: string) => {
    setActiveArchPoint(pointId);
    setIsSpecModalOpen(true);
  };

  // Complete Brief field dataset matching screenshot exactly (27 items)
  const briefFields = [
    { key: "ИМЯ КЛИЕНТА", val: project.clientName || "Анна Соколова", filled: true },
    { key: "ТЕЛЕФОН", val: "+7 905 123 45 67", filled: true },
    { key: "РЕКВИЗИТЫ ПЛАТЕЛЬЩИКА", val: "ФИО Соколова А. В., ИНН 7712345678", filled: true },
    { key: "СОБЫТИЕ", val: "Свадьба", filled: true },
    { key: "ДАТА", val: project.date || "15.08.2026", filled: true },
    { key: "ГОСТЕЙ", val: `${project.brief?.guestsCount || 80}`, filled: true },
    { key: "ФОРМАТ СОБЫТИЯ", val: "Выездная регистрация", filled: true },
    { key: "ПЛОЩАДКА", val: project.venue || "Ресторан «Сафиса»", filled: true },
    { key: "АДРЕС", val: "Москва, ул. Воробьевское шоссе, 2Б", filled: true },
    { key: "КОНТАКТ ПЛОЩАДКИ", val: "Менеджер Игорь (+7 916 555-44-33)", filled: true },
    { key: "РАЗМЕР ЗОНЫ МОНТАЖА", val: "8 х 5 м", filled: true },
    { key: "КРЕПЕЖ К СТЕНАМ", val: "Да", filled: true },
    { key: "КРЕПЕЖ К ПОТОЛКУ", val: "Да, до 15 кг", filled: true },
    { key: "СОГЛАСОВАНИЕ ОФОРМЛЕНИЯ", val: "(требует заполнения)", filled: false },
    { key: "ЭЛЕКТРИЧЕСТВО У СЦЕНЫ", val: "Есть, в радиусе 5м", filled: true },
    { key: "ПОДЪЕЗД / ГРУЗОВОЙ ЛИФТ", val: "(требует заполнения)", filled: false },
    { key: "ПРАЗДНИК НА УЛИЦЕ", val: "(требует заполнения)", filled: false },
    { key: "ДОСТУП НА МОНТАЖ", val: "14.08, с 18:00", filled: true },
    { key: "ОКНО МОНТАЖА", val: "4 часа", filled: true },
    { key: "ХРАНЕНИЕ НА ПЛОЩАДКЕ", val: "Можно, до утра", filled: true },
    { key: "ДЕМОНТАЖ / ВЫВОЗ", val: "(требует заполнения)", filled: false },
    { key: "КТО ПРИНИМАЕТ РАБОТЫ", val: "Заказчик", filled: true },
    { key: "ПАЛИТРА ОФОРМЛЕНИЯ", val: project.brief?.colors?.join(', ') || "Розовое золото - айвори", filled: true },
    { key: "СТИЛЬ ОФОРМЛЕНИЯ", val: project.brief?.style || "Романтика, классика", filled: true },
    { key: "КОНСТРУКЦИИ ДЕКОРА", val: "Арка, фотозона, столы", filled: true },
    { key: "ОРИЕНТИРОВОЧНЫЙ БЮДЖЕТ", val: `${(project.budget || 60000).toLocaleString('ru')} ₽`, filled: true },
    { key: "ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ", val: project.brief?.specialRequests || "Предпочтение живым розам нежно-розового оттенка", filled: true },
  ];

  return (
    <div className="w-full flex flex-col bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-stone-200/80 dark:border-zinc-800/80 rounded-3xl shadow-xl overflow-hidden transition-all">
      
      {/* 0. DESIGN VARIANT COMPARISON SWITCHER BAR */}
      <div className="bg-stone-900/90 backdrop-blur-md text-stone-100 p-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-stone-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-200 uppercase tracking-wider">Выбор формата карточки</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                Сравнение
              </span>
            </div>
            <p className="text-[11px] text-stone-400 font-normal">
              Выберите удобный для вас вариант отображения данных проекта
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-[#2A1224] p-1 rounded-full border border-[#4A1D3D] shrink-0">
          <button
            onClick={() => setDesignVariant(1)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
              designVariant === 1
                ? 'bg-gradient-to-r from-[#8C52D0] to-[#582F89] text-white shadow-sm'
                : 'text-stone-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Вариант 1 (Классика)</span>
          </button>
          <button
            onClick={() => setDesignVariant(2)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
              designVariant === 2
                ? 'bg-gradient-to-r from-[#8C52D0] to-[#582F89] text-white shadow-sm'
                : 'text-stone-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-purple-200" />
            <span>Вариант 2 (Современный Рабочий Стенд)</span>
          </button>
        </div>
      </div>

      {/* 1. TOP HEADER NAVIGATION BAR */}
      <header className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border-b border-stone-200 dark:border-zinc-800 p-4 sm:p-5 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 shrink-0">
        <div className="flex-1 min-w-0 space-y-2.5">
          {/* Title & Status / Progress Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
              {project.name}
            </h1>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 border border-purple-300/40">
              <span className="w-2 h-2 rounded-full bg-[#582F89]" /> {steps[project.currentStep]?.toUpperCase()}
            </span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-zinc-700 text-xs font-semibold">
              <span className="text-[10px] uppercase font-bold text-stone-400">Прогресс:</span>
              <span className="text-purple-900 dark:text-purple-300 font-bold">{progressPercentages[project.currentStep]}%</span>
            </div>
          </div>

          {/* Client & Project Info */}
          <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-stone-600 dark:text-stone-400">
            <span className="flex items-center gap-1.5 font-medium text-stone-800 dark:text-stone-200">
              <User className="w-3.5 h-3.5 text-[#582F89]" /> Клиент: <strong className="font-bold">{project.clientName}</strong>
            </span>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <a href="tel:+79051234567" className="flex items-center gap-1.5 font-medium text-stone-800 dark:text-stone-200 hover:text-[#582F89] transition-colors">
              <Phone className="w-3.5 h-3.5 text-[#582F89]" /> +7 905 123 45 67
            </a>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <a href="mailto:socolova.design@mail.ru" className="flex items-center gap-1.5 font-medium text-stone-800 dark:text-stone-200 hover:text-[#582F89] transition-colors truncate">
              <Mail className="w-3.5 h-3.5 text-[#582F89]" /> socolova.design@mail.ru
            </a>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#582F89]" /> {project.date}
            </span>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#582F89]" /> {project.venue}
            </span>
          </div>
        </div>

        {/* Action Buttons Block with Gradient background & fully rounded corners */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 self-start xl:self-center">
          <button
            onClick={() => showToast('Звонок клиенту', `Набираем номер клиента ${project.clientName} (+7 905 123 45 67)...`, 'info')}
            className="px-3.5 py-1.5 text-white rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all duration-300 hover:shadow-md hover:opacity-95 active:scale-[0.98] cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
          >
            <Phone className="w-3.5 h-3.5" /> Позвонить
          </button>

          <button
            onClick={() => showToast('Сообщение', `Открываем диалог с ${project.clientName}...`, 'info')}
            className="px-3.5 py-1.5 text-white rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all duration-300 hover:shadow-md hover:opacity-95 active:scale-[0.98] cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Написать
          </button>

          <button
            onClick={() => showToast('Бриф отправлен', `Ссылка на бриф отправлена клиенту ${project.clientName}`, 'success')}
            className="px-3.5 py-1.5 text-white rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all duration-300 hover:shadow-md hover:opacity-95 active:scale-[0.98] cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
          >
            <Send className="w-3.5 h-3.5" /> Отправить бриф
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText(`https://fleur-decor.ru/share/${project.id}`);
              showToast('Ссылка скопирована', 'Гостевая ссылка сохранена в буфер обмена.', 'success');
            }}
            className="px-3 py-1.5 border border-stone-300 dark:border-zinc-700 hover:border-[#582F89] text-stone-700 dark:text-stone-300 hover:text-[#582F89] dark:hover:text-purple-300 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" /> Поделиться
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* VARIANT 1: CLASSIC FULL GRID SCREENSHOT REPRODUCTION                      */}
      {/* ========================================================================= */}
      {designVariant === 1 && (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* LEFT SIDEBAR */}
          <aside className="w-full lg:w-60 shrink-0 border-r border-stone-200/80 dark:border-zinc-800 p-4 bg-white/40 dark:bg-zinc-950/20 backdrop-blur-md flex flex-col justify-between space-y-4 overflow-y-auto">
            <div className="space-y-3">
              <nav className="space-y-1">
                {[
                  { id: 'all', label: 'Общий вид', icon: Layout, badge: '8', badgeColor: 'bg-stone-200/80 text-stone-700 dark:bg-zinc-800 dark:text-stone-300' },
                  { id: 'brief', label: 'Бриф', icon: Clipboard, badge: '4!', badgeColor: 'bg-rose-100/90 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' },
                  { id: 'design', label: 'Дизайн', icon: Palette, badge: 'OK', badgeColor: 'bg-emerald-100/90 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' },
                  { id: 'calc', label: 'Расчет & Смета', icon: SlidersHorizontal, badge: '2!', badgeColor: 'bg-purple-100/90 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' },
                  { id: 'calendar', label: 'Календарь', icon: Calendar, badge: '02.08', badgeColor: 'bg-blue-100/90 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' },
                  { id: 'journal', label: 'Заметки', icon: Clock, badge: journalLogs.length.toString(), badgeColor: 'bg-stone-200/80 text-stone-700 dark:bg-zinc-800 dark:text-stone-300' },
                  { id: 'docs', label: 'Документы', icon: FolderOpen, badge: '4', badgeColor: 'bg-stone-200/80 text-stone-700 dark:bg-zinc-800 dark:text-stone-300' }
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-full text-xs font-semibold transition-all duration-300 text-left cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-[#8C52D0] to-[#582F89] text-white shadow-xs'
                          : 'text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="w-4 h-4 shrink-0 text-[#582F89]" />
                        <span>{tab.label}</span>
                      </span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${tab.badgeColor}`}>
                        {tab.badge}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* FINANCIAL CHECKLIST */}
            <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-stone-200/80 dark:border-zinc-800 rounded-2xl p-3.5 space-y-2.5 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                Финансовый чек-лист
              </span>
              <div className="space-y-1.5 text-xs font-medium">
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Полная стоимость:</span>
                  <span className="font-bold text-stone-900 dark:text-stone-100">{finalPrice.toLocaleString('ru')} ₽</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Предоплата:</span>
                  <span className="font-bold text-emerald-600">{prepayment.toLocaleString('ru')} ₽</span>
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t border-stone-100 dark:border-zinc-800">
                  <span className="text-stone-500 font-semibold">Остаток к оплате:</span>
                  <span className="font-bold text-purple-800 dark:text-purple-300">{Math.max(0, finalPrice - prepayment).toLocaleString('ru')} ₽</span>
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 p-4 sm:p-6 pt-0 sm:pt-0 overflow-y-auto space-y-6 relative">
            
            {/* STEPPER PROGRESS BAR (STICKY WITH BACKDROP BLUR OVER SCROLLING CARDS) */}
            <nav className="sticky top-0 z-30 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl border-b border-stone-200/80 dark:border-zinc-800/80 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 shadow-xs overflow-x-auto hide-scrollbar">
              <div className="flex items-center justify-between min-w-[650px] px-2">
                {steps.map((label, idx) => {
                  const isCompleted = idx < project.currentStep;
                  const isCurrent = idx === project.currentStep;

                  return (
                    <React.Fragment key={idx}>
                      <button
                        onClick={() => handleStepClick(idx)}
                        className="flex items-center gap-2 outline-none group cursor-pointer"
                      >
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isCompleted
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : isCurrent
                              ? 'bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-950 shadow-md'
                              : 'bg-stone-200 dark:bg-zinc-800 text-stone-400 group-hover:text-stone-600'
                          }`}
                        >
                          {isCompleted ? '✓' : idx + 1}
                        </span>
                        <div className="text-left leading-tight">
                          <span className="block text-[9px] uppercase tracking-wider font-bold text-stone-400">
                            {isCurrent ? 'Текущий' : isCompleted ? `Этап ${idx + 1}` : `Этап ${idx + 1}`}
                          </span>
                          <span className={`text-xs font-bold transition-colors ${
                            isCurrent ? 'text-purple-800 dark:text-purple-300' : isCompleted ? 'text-stone-800 dark:text-stone-200' : 'text-stone-400 group-hover:text-stone-600'
                          }`}>{label}</span>
                        </div>
                      </button>
                      {idx < steps.length - 1 && (
                        <div
                          className={`h-0.5 flex-1 mx-3 rounded-full transition-all ${
                            idx < project.currentStep ? 'bg-emerald-500' : 'bg-stone-200 dark:bg-zinc-800'
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
              <section className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-stone-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-xs">
                <div className="bg-[#F0EBF9]/80 dark:bg-[#20152B]/80 backdrop-blur-md border-b border-[#D8C7F0] dark:border-[#3D2554] px-5 py-3.5 flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Clipboard className="w-4 h-4 text-[#582F89]" />
                    <div>
                      <h2 className="font-bold text-sm text-stone-900 dark:text-stone-100">Анкета и Бриф проекта</h2>
                      <p className="text-[10px] text-stone-400">
                        Заполнено: <strong className="text-emerald-600 font-bold">85%</strong> (4 критических полей пусто)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsBriefEditOpen(true)}
                      className="px-3.5 py-1.5 text-white rounded-full text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all duration-300 hover:shadow-md hover:opacity-95 active:scale-[0.98] shadow-xs"
                      style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
                    >
                      <Edit2 className="w-3 h-3" /> Редактировать бриф
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
                  <div className="p-4 sm:p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                      {briefFields.map((field, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            !field.filled
                              ? 'border-dashed border-rose-300 bg-rose-50/50 dark:bg-rose-950/30 backdrop-blur-xs'
                              : 'border-stone-200/70 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/30 backdrop-blur-xs'
                          }`}
                        >
                          <span className="text-[9px] uppercase tracking-wider font-bold text-stone-400 block mb-0.5">
                            {field.key}
                          </span>
                          <span className={`text-xs font-bold block truncate ${
                            !field.filled ? 'text-rose-600 dark:text-rose-400 italic' : 'text-stone-800 dark:text-stone-100'
                          }`}>
                            {field.val}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* DESIGN & VISUALIZATION */}
            {(activeTab === 'all' || activeTab === 'design') && (
              <section className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-stone-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-xs">
                <div className="bg-[#F0EBF9]/80 dark:bg-[#20152B]/80 backdrop-blur-md border-b border-[#D8C7F0] dark:border-[#3D2554] px-5 py-3.5 flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#582F89]" />
                    <h2 className="font-bold text-sm text-stone-900 dark:text-stone-100">Дизайн & Визуализация</h2>
                  </div>
                  <button
                    onClick={() => showToast('Редактор дизайна', 'Открытие встроенного графического редактора...', 'info')}
                    className="px-3.5 py-1.5 text-white rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all duration-300 hover:shadow-md hover:opacity-95 active:scale-[0.98] shadow-xs"
                    style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
                  >
                    <SlidersHorizontal className="w-3 h-3" /> Редактор
                  </button>
                </div>

                <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* LEFT CAROUSEL VISUALIZATION CARD */}
                  <div className="bg-white/40 dark:bg-zinc-950/30 rounded-2xl p-4 border border-stone-200/80 dark:border-zinc-800 flex flex-col justify-between items-center relative min-h-[240px] backdrop-blur-xs select-none">
                    
                    {/* LEFT & RIGHT NAVIGATION ARROWS (1px border) */}
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
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300">
                        {visualizations[vizIndex].title}
                      </span>
                      <span className="text-[9px] bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold">
                        {vizIndex + 1} / {visualizations.length}
                      </span>
                    </div>

                    {/* VISUALIZATION CONTENT AREA */}
                    <div className="w-full flex-1 flex items-center justify-center my-2 px-10 min-h-[150px]">
                      {visualizations[vizIndex].type === 'svg-arc' ? (
                        <svg className="w-4/5 max-h-[140px] h-auto my-1" viewBox="0 0 150 120" fill="none">
                          <path d="M30 115 L30 55 Q30 20 75 20 Q120 20 120 55 L120 115" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" fill="none" opacity="0.25" />
                          
                          <g onClick={() => handleSelectHotspot('A-304')} className="cursor-pointer group">
                            <circle cx="34" cy="52" r="9" fill="#582F89" className="transition-transform group-hover:scale-110" stroke="#FFF" strokeWidth="1.5" />
                            <text x="34" y="55" fill="#FFF" fontSize="8" fontWeight="bold" textAnchor="middle">A</text>
                          </g>
                          <g onClick={() => handleSelectHotspot('B-012')} className="cursor-pointer group">
                            <circle cx="75" cy="22" r="9" fill="#059669" className="transition-transform group-hover:scale-110" stroke="#FFF" strokeWidth="1.5" />
                            <text x="75" y="25" fill="#FFF" fontSize="8" fontWeight="bold" textAnchor="middle">B</text>
                          </g>
                          <g onClick={() => handleSelectHotspot('C-001')} className="cursor-pointer group">
                            <circle cx="116" cy="52" r="9" fill="#2563EB" className="transition-transform group-hover:scale-110" stroke="#FFF" strokeWidth="1.5" />
                            <text x="116" y="55" fill="#FFF" fontSize="8" fontWeight="bold" textAnchor="middle">C</text>
                          </g>
                          <g onClick={() => handleSelectHotspot('D-210')} className="cursor-pointer group">
                            <circle cx="75" cy="85" r="9" fill="#E11D48" className="transition-transform group-hover:scale-110" stroke="#FFF" strokeWidth="1.5" />
                            <text x="75" y="88" fill="#FFF" fontSize="8" fontWeight="bold" textAnchor="middle">D</text>
                          </g>
                        </svg>
                      ) : (
                        <div className="w-full h-full max-h-[150px] overflow-hidden rounded-xl border border-stone-200/80 dark:border-zinc-800 shadow-xs relative group">
                          <img
                            src={visualizations[vizIndex].image}
                            alt={visualizations[vizIndex].title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-2.5">
                            <span className="text-[10px] text-white font-semibold drop-shadow-xs">
                              {visualizations[vizIndex].subtitle}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] text-stone-400 font-medium text-center">
                      {visualizations[vizIndex].subtitle}
                    </span>
                  </div>

                  {/* RIGHT VENUE PHOTOS CARD WITH MULTIPLE WINDOWS & UPLOAD */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                        ФОТО ПЛОЩАДКИ
                      </span>
                      <span className="text-[10px] font-semibold text-[#582F89] dark:text-purple-300">
                        {venuePhotos.length} фото
                      </span>
                    </div>

                    {/* Hidden file input for uploading new photos */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    {/* 4 WINDOWS (2x2 GRID) - SHOWS 4 SELECTED PHOTOS */}
                    <div className="grid grid-cols-2 gap-2.5">
                      {venuePhotos.slice(0, 4).map((photoUrl, idx) => (
                        <div
                          key={idx}
                          className="relative group rounded-xl aspect-4/3 overflow-hidden border border-stone-200/80 dark:border-zinc-800 bg-stone-100 dark:bg-zinc-950/40 shadow-2xs"
                        >
                          <img
                            src={photoUrl}
                            alt={`Площадка ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                            <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-full">
                              Окно {idx + 1}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* HORIZONTAL PHOTO GALLERY STRIP FOR ALL PROJECT PHOTOS */}
                <div className="mx-4 sm:mx-5 mb-4 sm:mb-5 pt-3.5 border-t border-stone-200/60 dark:border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                      Все загруженные фото проекта ({venuePhotos.length})
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
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="shrink-0 w-28 h-20 rounded-xl border-2 border-dashed border-[#8C52D0]/60 hover:border-[#8C52D0] bg-[#F0EBF9]/40 dark:bg-[#20152B]/40 hover:bg-[#F0EBF9] dark:hover:bg-[#20152B] flex flex-col items-center justify-center p-1 cursor-pointer transition-all group shadow-2xs z-10"
                    >
                      <Plus className="w-4 h-4 text-[#582F89] dark:text-purple-300 group-hover:scale-110 transition-transform stroke-[2.5]" />
                      <span className="text-[9px] font-bold text-[#582F89] dark:text-purple-300 mt-0.5">
                        Загрузить
                      </span>
                    </div>

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
                          onClick={() => {
                            // Swap clicked photo to top window position if not already top
                            if (idx >= 4) {
                              setVenuePhotos(prev => {
                                const updated = [...prev];
                                const temp = updated[0];
                                updated[0] = updated[idx];
                                updated[idx] = temp;
                                return updated;
                              });
                              showToast(`Фото #${idx + 1}`, 'Фотография перемещена в верхнюю панель', 'info');
                            } else {
                              showToast(`Фото #${idx + 1}`, 'Отображается в верхней панели', 'info');
                            }
                          }}
                        >
                          <img
                            src={photoUrl}
                            alt={`Превью ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 pointer-events-none"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1">
                            <span className="text-[8px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded-md">
                              #{idx + 1}
                            </span>
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
              <section className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-stone-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-xs">
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
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-stone-200 dark:border-zinc-800 text-stone-400 font-bold pb-2">
                          <th className="pb-2">Наименование</th>
                          <th className="pb-2">Категория</th>
                          <th className="pb-2 text-center">Кол-во</th>
                          <th className="pb-2 text-right">Цена (₽)</th>
                          <th className="pb-2 text-right">Сумма (₽)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
                        {project.estimate.map((item) => (
                          <tr key={item.id} id={`calc-row-${item.id}`}>
                            <td className="py-2.5 font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-[#582F89] shrink-0" />
                              {item.name}
                            </td>
                            <td className="py-2.5 text-stone-500">{item.category}</td>
                            <td className="py-2.5 text-center font-bold">{item.quantity}</td>
                            <td className="py-2.5 text-right font-mono">{item.price.toLocaleString('ru')} ₽</td>
                            <td className="py-2.5 text-right font-bold font-mono">{(item.quantity * item.price).toLocaleString('ru')} ₽</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 3 FINANCIAL CALCULATION PANELS (FIGMA MATCH) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-stone-100 dark:border-zinc-800">
                    <div className="p-3.5 bg-white/50 dark:bg-zinc-950/40 rounded-xl border border-stone-200/80 dark:border-zinc-800 space-y-1 text-xs backdrop-blur-xs">
                      <div className="flex justify-between text-stone-500">
                        <span>Себестоимость декора:</span>
                        <strong className="text-stone-800 dark:text-stone-200 font-mono">{decorCost.toLocaleString('ru')} ₽</strong>
                      </div>
                      <div className="flex justify-between text-stone-500">
                        <span>Себестоимость работ:</span>
                        <strong className="text-stone-800 dark:text-stone-200 font-mono">{serviceCost.toLocaleString('ru')} ₽</strong>
                      </div>
                      <div className="flex justify-between font-bold pt-1 border-t border-stone-200/60 dark:border-zinc-800 text-stone-900 dark:text-stone-100">
                        <span>Итого себестоимость:</span>
                        <strong className="font-mono">{totalCost.toLocaleString('ru')} ₽</strong>
                      </div>
                    </div>

                    <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-300/40 space-y-1 text-xs backdrop-blur-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-800 dark:text-emerald-300 font-bold uppercase text-[10px]">Чистая прибыль</span>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                          Эффективность {profitMarginPercent}%
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80">С учетом себестоимости и налога 6%</p>
                      <p className="text-lg font-bold font-mono text-emerald-800 dark:text-emerald-300 pt-0.5">
                        {calculatedProfit.toLocaleString('ru')} ₽
                      </p>
                    </div>

                    <div className="p-3.5 bg-purple-50/70 dark:bg-purple-950/40 rounded-xl border border-purple-300/40 space-y-1 text-xs backdrop-blur-xs">
                      <span className="text-purple-900 dark:text-purple-200 font-bold uppercase text-[10px] block">Чек клиента</span>
                      <p className="text-[10px] text-purple-700/80 dark:text-purple-300/80">Уходит в смету и финальный договор</p>
                      <p className="text-lg font-bold font-mono text-purple-900 dark:text-purple-200 pt-0.5">
                        {finalPrice.toLocaleString('ru')} ₽
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* CALENDAR & TIMELINE CARD */}
            {(activeTab === 'all' || activeTab === 'calendar') && (
              <section className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-stone-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-xs">
                <div className="bg-[#F0EBF9]/80 dark:bg-[#20152B]/80 backdrop-blur-md border-b border-[#D8C7F0] dark:border-[#3D2554] px-5 py-3.5 flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#582F89]" />
                    <div>
                      <h2 className="font-bold text-sm text-stone-900 dark:text-stone-100">Календарь & График этапов</h2>
                      <p className="text-[10px] text-stone-400">График монтажа, демонтажа и контрольные даты проекта</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => showToast('Новый этап', 'Открытие формы добавления этапа в календарь...', 'info')}
                      className="px-3.5 py-1.5 text-white rounded-full text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all duration-300 hover:shadow-md hover:opacity-95 active:scale-[0.98] shadow-xs"
                      style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
                    >
                      <Plus className="w-3.5 h-3.5" /> Добавить этап
                    </button>
                    <button
                      onClick={() => setCalendarCollapsed(!calendarCollapsed)}
                      className="px-3.5 py-1.5 border border-stone-300 dark:border-zinc-700 hover:border-stone-400 dark:hover:border-zinc-600 bg-transparent text-stone-700 dark:text-stone-300 rounded-full text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all duration-300 hover:bg-stone-100 dark:hover:bg-zinc-800"
                    >
                      {calendarCollapsed ? (
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

                {!calendarCollapsed && (
                  <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* MINI CALENDAR GRID */}
                    <div className="p-4 bg-white/50 dark:bg-zinc-950/30 rounded-xl border border-stone-200/80 dark:border-zinc-800 space-y-3 backdrop-blur-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-stone-800 dark:text-stone-200">Август 2026</span>
                        <div className="flex gap-1">
                          <button className="p-1 hover:bg-stone-200 dark:hover:bg-zinc-800 rounded-md text-stone-600 cursor-pointer">
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1 hover:bg-stone-200 dark:hover:bg-zinc-800 rounded-md text-stone-600 cursor-pointer">
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* DAYS OF WEEK */}
                      <div className="grid grid-cols-7 text-center text-[10px] font-bold text-stone-400">
                        <span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Вс</span>
                      </div>

                      {/* CALENDAR DAYS */}
                      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold">
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                          const isEvent = day === 2;
                          const isMontage = day === 14;
                          const isDemontage = day === 15;

                          return (
                            <button
                              key={day}
                              onClick={() => showToast('Дата выбранного этапа', `События на ${day} августа 2026`, 'info')}
                              className={`h-7 rounded-lg flex items-center justify-center text-[11px] transition-all cursor-pointer ${
                                isEvent
                                  ? 'bg-[#582F89] text-white font-bold shadow-xs'
                                  : isMontage
                                  ? 'bg-amber-500 text-white font-bold'
                                  : isDemontage
                                  ? 'bg-purple-200 text-purple-900 font-bold dark:bg-purple-900 dark:text-purple-100'
                                  : 'hover:bg-stone-200/60 dark:hover:bg-zinc-800 text-stone-700 dark:text-stone-300'
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>

                      {/* LEGEND */}
                      <div className="pt-2 border-t border-stone-200/60 dark:border-zinc-800 space-y-1 text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#582F89]" />
                          <span className="text-stone-600 dark:text-stone-400">День мероприятия (02.08)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          <span className="text-stone-600 dark:text-stone-400">Монтаж площадки (14.08)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-300 dark:bg-purple-800" />
                          <span className="text-stone-600 dark:text-stone-400">Демонтаж (15.08)</span>
                        </div>
                      </div>
                    </div>

                    {/* KEY TIMELINE STAGES */}
                    <div className="md:col-span-2 space-y-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">План-график выполнения</span>
                      <div className="space-y-2">
                        {[
                          { date: '01 Августа, 12:00', title: 'Финальная сборка конструкций на складе', status: 'Выполнено', statusBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300', icon: CheckCircle },
                          { date: '02 Августа, 10:00', title: 'День мероприятия • Отель «Марин Парк»', status: 'Главная дата', statusBg: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300', icon: Calendar },
                          { date: '14 Августа, 18:00', title: 'Заезд команды декораторов и монтаж сцены', status: 'Запланировано', statusBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300', icon: Clock },
                          { date: '15 Августа, 02:00', title: 'Ночной демонтаж и вывоз флористики', status: 'В очереди', statusBg: 'bg-stone-100 text-stone-700 dark:bg-zinc-800 dark:text-stone-300', icon: Sparkles }
                        ].map((stage, idx) => {
                          const StageIcon = stage.icon;
                          return (
                            <div key={idx} className="p-3 bg-white/50 dark:bg-zinc-950/40 rounded-xl border border-stone-200/70 dark:border-zinc-800 flex items-center justify-between gap-3 backdrop-blur-xs">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 rounded-lg bg-white/80 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-[#582F89]">
                                  <StageIcon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-bold text-xs text-stone-800 dark:text-stone-200 truncate">{stage.title}</h4>
                                  <p className="text-[10px] text-stone-400">{stage.date}</p>
                                </div>
                              </div>
                              <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full shrink-0 ${stage.statusBg}`}>
                                {stage.status}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* JOURNAL NOTES CARD */}
            {(activeTab === 'all' || activeTab === 'journal') && (
              <section className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-stone-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-xs">
                <div className="bg-[#F0EBF9]/80 dark:bg-[#20152B]/80 backdrop-blur-md border-b border-[#D8C7F0] dark:border-[#3D2554] px-5 py-3.5 flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#582F89]" />
                    <div>
                      <h2 className="font-bold text-sm text-stone-900 dark:text-stone-100">Журнал заметок</h2>
                      <p className="text-[10px] text-stone-400">История операций и рабочие записи декораторов</p>
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
                  <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-3 bg-white/50 dark:bg-zinc-950/30 p-4 rounded-xl border border-stone-200/80 dark:border-zinc-800 backdrop-blur-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Добавить событие</span>
                      <textarea
                        rows={3}
                        placeholder="Опишите событие или добавьте заметку..."
                        value={journalInputText}
                        onChange={(e) => setJournalInputText(e.target.value)}
                        className="w-full bg-white/80 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl p-2.5 text-xs text-stone-800 dark:text-stone-100 focus:outline-none"
                      />
                      <button
                        onClick={handleSubmitCustomJournal}
                        className="w-full py-2 text-white rounded-full text-xs font-bold transition-all duration-300 hover:shadow-md hover:opacity-95 active:scale-[0.99] cursor-pointer shadow-xs"
                        style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
                      >
                        Добавить запись
                      </button>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-2">Хронологическая лента</span>
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {journalLogs.map((log) => (
                          <div key={log.id} className="p-3 bg-white/50 dark:bg-zinc-950/40 rounded-xl border border-stone-200/60 dark:border-zinc-800 flex items-start gap-3 text-xs backdrop-blur-xs">
                            <span className="w-2 h-2 rounded-full bg-[#582F89] mt-1.5 shrink-0" />
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-0.5">
                                <strong className="text-stone-800 dark:text-stone-200 font-semibold">{log.text}</strong>
                                <span className="text-[10px] text-stone-400 font-mono">{log.timestamp}</span>
                              </div>
                              <span className="text-[10px] uppercase font-bold text-stone-400">{log.type}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* DOCUMENTS WORKFLOW CARD */}
            {(activeTab === 'all' || activeTab === 'docs') && (
              <section className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-stone-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-xs">
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

                <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { title: 'Договор на декор №CB-2026', status: 'Черновик', statusColor: 'bg-purple-100/90 text-purple-800' },
                    { title: 'Смета декора (Инвойс)', status: 'Готово', statusColor: 'bg-emerald-100/90 text-emerald-800' },
                    { title: 'Акт приемки работ', status: 'Ожидание финала', statusColor: 'bg-stone-100/90 text-stone-600' },
                    { title: 'Photo Release', status: 'Подписано', statusColor: 'bg-emerald-100/90 text-emerald-800' }
                  ].map((doc, i) => (
                    <div key={i} className="p-3.5 bg-white/50 dark:bg-zinc-950/40 rounded-xl border border-stone-200/80 dark:border-zinc-800 flex flex-col justify-between gap-3 text-left backdrop-blur-xs">
                      <div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mb-1.5 ${doc.statusColor}`}>
                          {doc.status}
                        </span>
                        <h4 className="font-bold text-xs text-stone-800 dark:text-stone-200">{doc.title}</h4>
                      </div>
                      <div className="flex justify-end gap-1.5 pt-2 border-t border-stone-200/50 dark:border-zinc-800">
                        <button onClick={() => showToast('Просмотр', `Открываем ${doc.title}...`, 'info')} className="p-1.5 hover:bg-stone-200 dark:hover:bg-zinc-800 rounded-lg text-stone-500 cursor-pointer">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => showToast('Скачивание', `Загрузка ${doc.title}...`, 'success')} className="p-1.5 hover:bg-stone-200 dark:hover:bg-zinc-800 rounded-lg text-stone-500 cursor-pointer">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* BOTTOM FLOATING ACTION BAR (LIGHT LAVENDER THEME) */}
            <div className="bg-[#F0EBF9]/80 dark:bg-[#20152B]/80 backdrop-blur-md border border-[#D8C7F0] dark:border-[#3D2554] p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#6A6375] dark:text-purple-300 block">Полная стоимость</span>
                  <span className="text-lg font-bold font-mono text-[#2A1224] dark:text-white">{finalPrice.toLocaleString('ru')} ₽</span>
                </div>
                <div className="h-8 w-px bg-[#D8C7F0] dark:bg-[#3D2554] hidden sm:block" />
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#6A6375] dark:text-purple-300 block">Предоплата</span>
                  <span className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400">{prepayment.toLocaleString('ru')} ₽</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-white/80 hover:bg-purple-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[#3B1C32] dark:text-purple-200 border border-[#D8C7F0] dark:border-[#3D2554] rounded-full text-xs font-bold transition-colors cursor-pointer"
                >
                  Отменить
                </button>
                <button
                  onClick={() => {
                    showToast('Проект завершен', 'Статус проекта обновлен на «Выполнено»', 'success');
                    onClose();
                  }}
                  className="px-5 py-2 text-white rounded-full text-xs font-bold transition-all duration-300 hover:shadow-lg hover:opacity-95 active:scale-[0.98] cursor-pointer flex items-center gap-1.5 shadow-md"
                  style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
                >
                  <CheckCircle className="w-4 h-4" /> Заказ сдан
                </button>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VARIANT 2: ERGONOMIC INTERACTIVE WORKSPACE                                */}
      {/* ========================================================================= */}
      {designVariant === 2 && (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-transparent">
          
          {/* LEFT STICKY SIDEBAR */}
          <aside className="w-full lg:w-80 shrink-0 border-r border-stone-200/80 dark:border-zinc-800 p-4 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md flex flex-col justify-between space-y-4 overflow-y-auto">
            <div className="space-y-4">
              
              {/* CARD 2: FINANCIAL SUMMARY WIDGET */}
              <div className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-stone-200/80 dark:border-zinc-800 space-y-3 shadow-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Экономика проекта
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300/40">
                    +{profitMarginPercent}% Маржа
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-left">
                  <div className="p-2.5 rounded-xl bg-white/50 dark:bg-zinc-950/40 border border-stone-200/80 dark:border-zinc-800 backdrop-blur-xs">
                    <span className="text-[9px] text-stone-400 uppercase font-bold block">Смета</span>
                    <span className="text-sm font-bold font-mono text-stone-900 dark:text-stone-100">
                      {finalPrice.toLocaleString('ru')} ₽
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300/40 backdrop-blur-xs">
                    <span className="text-[9px] text-emerald-700 dark:text-emerald-400 uppercase font-bold block">Прибыль</span>
                    <span className="text-sm font-bold font-mono text-emerald-700 dark:text-emerald-400">
                      {calculatedProfit.toLocaleString('ru')} ₽
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-stone-500 font-medium">Наценка на себестоимость:</span>
                    <strong className="text-purple-800 dark:text-purple-300 font-bold">{markupPercent}%</strong>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    value={markupPercent}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setMarkupPercent(val);
                      setFinalPrice(Math.round(totalCost * (1 + val / 100)));
                    }}
                    className="w-full accent-[#582F89] cursor-pointer"
                  />
                </div>

                <div className="pt-2 border-t border-stone-100 dark:border-zinc-800 flex justify-between items-center text-xs">
                  <span className="text-stone-400 font-medium">Предоплата полученная:</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">{prepayment.toLocaleString('ru')} ₽</span>
                </div>
              </div>

              {/* CARD 3: DOCUMENT EXPORT ACTIONS */}
              <div className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-stone-200/80 dark:border-zinc-800 space-y-2 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  Печать и Выгрузка
                </span>
                <div className="space-y-1.5">
                  <button
                    onClick={() => showToast('Генерация КП', 'Формируем КП в PDF формате...', 'success')}
                    className="w-full py-2 px-3 bg-white/50 dark:bg-zinc-800/60 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-stone-200 dark:border-zinc-700/60 text-stone-800 dark:text-stone-200 rounded-full text-xs font-semibold flex items-center justify-between transition-all cursor-pointer backdrop-blur-xs"
                  >
                    <span className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-[#582F89]" />
                      <span>Коммерческое предложение (КП)</span>
                    </span>
                    <Download className="w-3 h-3 text-stone-400" />
                  </button>

                  <button
                    onClick={() => showToast('Договор готов', 'Печатная форма договора создана.', 'success')}
                    className="w-full py-2 px-3 bg-white/50 dark:bg-zinc-800/60 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-stone-200 dark:border-zinc-700/60 text-stone-800 dark:text-stone-200 rounded-full text-xs font-semibold flex items-center justify-between transition-all cursor-pointer backdrop-blur-xs"
                  >
                    <span className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span>Договор и Спецификации</span>
                    </span>
                    <Download className="w-3 h-3 text-stone-400" />
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT WORKSPACE AREA */}
          <main className="flex-1 p-4 sm:p-6 pt-0 sm:pt-0 overflow-y-auto space-y-6 relative">
            
            {/* STEPPER PROGRESS BAR (STICKY WITH BACKDROP BLUR OVER SCROLLING CARDS) */}
            <nav className="sticky top-0 z-30 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl border-b border-stone-200/80 dark:border-zinc-800/80 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 shadow-xs overflow-x-auto hide-scrollbar">
              <div className="flex items-center justify-between min-w-[650px] px-2">
                {steps.map((label, idx) => {
                  const isCompleted = idx < project.currentStep;
                  const isCurrent = idx === project.currentStep;

                  return (
                    <React.Fragment key={idx}>
                      <button
                        onClick={() => handleStepClick(idx)}
                        className="flex items-center gap-2 outline-none group cursor-pointer"
                      >
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isCompleted
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : isCurrent
                              ? 'bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-950 shadow-md'
                              : 'bg-stone-200 dark:bg-zinc-800 text-stone-400 group-hover:text-stone-600'
                          }`}
                        >
                          {isCompleted ? '✓' : idx + 1}
                        </span>
                        <div className="text-left leading-tight">
                          <span className="block text-[9px] uppercase tracking-wider font-bold text-stone-400">
                            {isCurrent ? 'Текущий' : isCompleted ? `Этап ${idx + 1}` : `Этап ${idx + 1}`}
                          </span>
                          <span className={`text-xs font-bold transition-colors ${
                            isCurrent ? 'text-purple-800 dark:text-purple-300' : isCompleted ? 'text-stone-800 dark:text-stone-200' : 'text-stone-400 group-hover:text-stone-600'
                          }`}>{label}</span>
                        </div>
                      </button>
                      {idx < steps.length - 1 && (
                        <div
                          className={`h-0.5 flex-1 mx-3 rounded-full transition-all ${
                            idx < project.currentStep ? 'bg-emerald-500' : 'bg-stone-200 dark:bg-zinc-800'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </nav>
            
            {/* COMPLETE 27-FIELD BRIEF GRID */}
            <section className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-stone-200/80 dark:border-zinc-800/80 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex justify-between items-center flex-wrap gap-2 pb-3 border-b border-stone-100 dark:border-zinc-800">
                <div>
                  <h2 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Clipboard className="w-4 h-4 text-[#582F89]" /> Технический Бриф Проекта
                  </h2>
                  <p className="text-[10px] text-stone-400">Полный реестр 27 параметров с площадки</p>
                </div>
                <button
                  onClick={() => setIsBriefEditOpen(true)}
                  className="px-3.5 py-1.5 text-white rounded-full text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all duration-300 hover:shadow-md hover:opacity-95"
                  style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
                >
                  <Edit2 className="w-3 h-3" /> Заполнить поля
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {briefFields.map((field, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      !field.filled
                        ? 'border-dashed border-rose-300 bg-rose-50/50 dark:bg-rose-950/30 backdrop-blur-xs'
                        : 'border-stone-200/80 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/30 backdrop-blur-xs'
                    }`}
                  >
                    <span className="text-[9px] uppercase tracking-wider font-bold text-stone-400 block mb-0.5">
                      {field.key}
                    </span>
                    <span className={`text-xs font-bold block truncate ${
                      !field.filled ? 'text-rose-600 dark:text-rose-400 italic' : 'text-stone-800 dark:text-stone-100'
                    }`}>
                      {field.val}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* VISUALIZER + CALCULATION SHEET */}
            <section className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-stone-200/80 dark:border-zinc-800/80 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex justify-between items-center pb-3 border-b border-stone-100 dark:border-zinc-800">
                <h2 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#582F89]" /> Интерактивная Калькуляция и Смета
                </h2>
                <button onClick={handleResetCalculator} className="text-xs text-stone-400 hover:text-rose-500 cursor-pointer">
                  Сбросить к исходным
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 dark:border-zinc-800 text-stone-400 font-bold pb-2">
                      <th className="pb-2 w-8">#</th>
                      <th className="pb-2">Позиция</th>
                      <th className="pb-2">Категория</th>
                      <th className="pb-2 text-center">Количество</th>
                      <th className="pb-2 text-right">Цена за ед. (₽)</th>
                      <th className="pb-2 text-right">Сумма (₽)</th>
                      <th className="pb-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
                    {project.estimate.map((item, idx) => (
                      <tr key={item.id} id={`calc-row-${item.id}`}>
                        <td className="py-2.5 text-stone-400 font-mono text-[10px]">{idx + 1}</td>
                        <td className="py-2.5 font-bold text-stone-800 dark:text-stone-200">{item.name}</td>
                        <td className="py-2.5">
                          <span className="text-[10px] bg-stone-100 dark:bg-zinc-800 text-stone-600 font-semibold px-2 py-0.5 rounded-full">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-2.5 text-center">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleUpdateItemQty(item.id, Math.max(1, item.quantity - 1))}
                              className="w-5 h-5 rounded hover:bg-stone-200 dark:hover:bg-zinc-800 text-stone-500 font-bold"
                            >
                              -
                            </button>
                            <span className="font-bold font-mono text-stone-800 dark:text-stone-100 w-5 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateItemQty(item.id, item.quantity + 1)}
                              className="w-5 h-5 rounded hover:bg-stone-200 dark:hover:bg-zinc-800 text-stone-500 font-bold"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 text-right">
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => handleUpdateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                            className="w-20 text-right bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded px-1.5 py-0.5 text-xs font-mono focus:outline-none"
                          />
                        </td>
                        <td className="py-2.5 text-right font-bold font-mono text-stone-800 dark:text-stone-100">
                          {(item.quantity * item.price).toLocaleString('ru')} ₽
                        </td>
                        <td className="py-2.5 text-center">
                          <button
                            onClick={() => handleRemoveEstimate(item.id, item.name)}
                            className="text-stone-400 hover:text-rose-500 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Form to add row */}
              <form onSubmit={handleAddEstimate} className="p-3 bg-stone-50 dark:bg-zinc-950 rounded-xl border border-dashed border-stone-200 dark:border-zinc-800 flex flex-wrap gap-2 items-center">
                <input
                  type="text"
                  placeholder="+ Наименование позиций"
                  required
                  value={newEstName}
                  onChange={(e) => setNewEstName(e.target.value)}
                  className="flex-1 min-w-[180px] bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-xs py-1.5 px-3 rounded-lg focus:outline-none"
                />
                <select
                  value={newEstCat}
                  onChange={(e) => setNewEstCat(e.target.value)}
                  className="w-28 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-xs py-1.5 px-2 rounded-lg focus:outline-none"
                >
                  <option value="Декор">Декор</option>
                  <option value="Конструкции">Конструкции</option>
                  <option value="Флористика">Флористика</option>
                  <option value="Работа">Работа</option>
                </select>
                <input
                  type="number"
                  placeholder="Цена ₽"
                  value={newEstPrice}
                  onChange={(e) => setNewEstPrice(parseFloat(e.target.value) || 0)}
                  className="w-20 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-xs py-1.5 px-2 text-right rounded-lg focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#8C52D0] to-[#582F89] hover:opacity-95 text-white font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Добавить
                </button>
              </form>
            </section>

            {/* JOURNAL TIMELINE LOGS */}
            <section className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
              <h2 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#582F89]" /> Журнал Событий и Историй Изменений
              </h2>

              <div className="space-y-2">
                {journalLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-stone-50 dark:bg-zinc-950/40 rounded-xl border border-stone-200/60 dark:border-zinc-800 flex items-start gap-3 text-xs">
                    <span className="w-2 h-2 rounded-full bg-[#582F89] mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-0.5">
                        <strong className="text-stone-800 dark:text-stone-200 font-semibold">{log.text}</strong>
                        <span className="text-[10px] text-stone-400 font-mono">{log.timestamp}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-stone-400">{log.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      )}

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
                  className="px-4 py-2 bg-gradient-to-r from-[#8C52D0] to-[#582F89] hover:opacity-95 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Закрыть
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BRIEF EDITING MODAL */}
      <AnimatePresence>
        {isBriefEditOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 p-6 rounded-3xl max-w-lg w-full space-y-4 shadow-xl text-left"
            >
              <div className="flex justify-between items-center border-b border-stone-100 dark:border-zinc-800 pb-3">
                <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">Редактирование параметров брифа</h3>
                <button onClick={() => setIsBriefEditOpen(false)} className="text-stone-400 hover:text-stone-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-stone-500">
                Все изменения сохраняются в режиме реального времени и передаются декораторам на объекте.
              </p>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setIsBriefEditOpen(false);
                    showToast('Сохранено', 'Бриф проекта обновлен.', 'success');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-[#8C52D0] to-[#582F89] hover:opacity-95 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Сохранить Бриф
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
