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
  EyeOff,
  Lock,
  Unlock,
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
  SlidersHorizontal,
  ChevronUp,
  FileSpreadsheet,
  FileCheck,
  Send
} from 'lucide-react';
import { Project, EstimateItem, ProjectStatus } from '../types';

interface ProjectDetailModalProps {
  project: Project | null;
  isOpen: boolean;
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
  isOpen,
  onClose,
  onUpdateProject,
  showToast
}: ProjectDetailModalProps) {
  if (!isOpen || !project) return null;

  // Tabs: 'all' | 'brief' | 'design' | 'calc' | 'journal' | 'docs'
  const [activeTab, setActiveTab] = useState<'all' | 'brief' | 'design' | 'calc' | 'journal' | 'docs'>('all');

  // Commercial & Profit settings state
  const [markupPercent, setMarkupPercent] = useState<number>(20);
  const [taxRate, setTaxRate] = useState<number>(6);
  const [finalPrice, setFinalPrice] = useState<number>(project.budget || 65000);

  // Active Hotspot selected element for 1:1 SVG arch spec
  const [activeArchPoint, setActiveArchPoint] = useState<string>('A-304');
  const [isSpecModalOpen, setIsSpecModalOpen] = useState<boolean>(false);
  const [isBriefEditOpen, setIsBriefEditOpen] = useState<boolean>(false);
  const [briefCollapsed, setBriefCollapsed] = useState<boolean>(false);
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'user-note' | 'system'>('all');

  // Interactive estimates local input fields
  const [newEstName, setNewEstName] = useState('');
  const [newEstCat, setNewEstCat] = useState('Декор');
  const [newEstPrice, setNewEstPrice] = useState(1500);
  const [newEstNotes, setNewEstNotes] = useState('');

  // Journal logs submission form
  const [journalInputText, setJournalInputText] = useState('');
  const [journalInputLink, setJournalInputLink] = useState('');
  const [journalInputType, setJournalInputType] = useState<'user-note' | 'important' | 'client-agreed'>('user-note');

  // Local state for chronologic timeline events
  const [journalLogs, setJournalLogs] = useState<JournalEntry[]>([
    { id: '1', timestamp: "15.08.2026, 10:12", type: "system", text: "Проект создан в системе", linkedItemId: null },
    { id: '2', timestamp: "15.08.2026, 11:30", type: "system", text: "Анна Соколова заполнила анкету технического брифа", linkedItemId: null },
    { id: '3', timestamp: "15.08.2026, 12:05", type: "system", text: "Резерв позиции A-304 подтвержден на основном складе", linkedItemId: "A-304" },
    { id: '4', timestamp: "15.08.2026, 13:45", type: "system", text: "Смета переведена в стадию калькуляции расценок", linkedItemId: null }
  ]);

  // Gallery Horizontal Slider Scrolling Ref
  const galleryRef = useRef<HTMLDivElement>(null);

  // Synchronize initial component loads
  useEffect(() => {
    if (project.budget) {
      setFinalPrice(project.budget);
    }
  }, [project]);

  // Specification labels mapped to hotspot IDs
  const pointSpecifications: Record<string, { title: string; desc: string }> = {
    'A-304': {
      title: "Конструктив фотозоны каркас",
      desc: "ID детали: A-304. Металлический устойчивый задник для крепления декоративных панелей. Находится на складе, тип источника: аренда."
    },
    'B-012': {
      title: "Навесные световые гирлянды",
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

  // Add event helper
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
    setNewEstNotes('');
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

  // Reset estimates list to mock defaults
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

  // Scroll Gallery items horizontally
  const handleScrollGallery = (direction: number) => {
    if (galleryRef.current) {
      const scrollAmount = 300;
      galleryRef.current.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Hotspot selective Spec modal opener
  const handleSelectHotspot = (pointId: string) => {
    setActiveArchPoint(pointId);
    setIsSpecModalOpen(true);
  };

  // Focused scrolling straight to target calc line item row
  const handleGoToCalcRow = (itemId: string) => {
    setActiveTab('calc');
    setIsSpecModalOpen(false);
    setTimeout(() => {
      const row = document.getElementById(`calc-row-${itemId}`);
      if (row) {
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        row.classList.add('bg-violet-100', 'dark:bg-violet-950/60', 'ring-2', 'ring-violet-500');
        setTimeout(() => {
          row.classList.remove('bg-violet-100', 'dark:bg-violet-950/60', 'ring-2', 'ring-violet-500');
        }, 2000);
      }
    }, 200);
  };

  // Budget progress percentage formulas
  const budgetRatio = Math.round((finalPrice / (project.budget || 60000)) * 100);

  // Filter journal entries
  const filteredLogs = journalLogs.filter(log => {
    if (timelineFilter === 'all') return true;
    return log.type === timelineFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Absolute Backdrop Glass layer blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md"
      />

      {/* Primary Workspace Panel Box */}
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="relative w-full max-w-7xl h-[92vh] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-3xl border border-zinc-200/50 dark:border-zinc-800/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-800 dark:text-zinc-200"
      >
        
        {/* TOAST PANEL SIMULATOR INSIDE VIEWPORT */}
        <header className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200/50 dark:border-zinc-800/50 p-5 shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-20">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
              <span className="hover:text-violet-600 transition-colors cursor-pointer" onClick={onClose}>Все проекты</span>
              <span>•</span>
              <span className="text-violet-600">Карточка проекта</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                value={project.name}
                onChange={(e) => onUpdateProject({ ...project, name: e.target.value })}
                className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 bg-transparent border-none border-b border-dashed border-zinc-300 hover:border-violet-500 focus:border-violet-500 focus:outline-none focus:ring-0 py-0.5 max-w-md w-full"
              />
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-400 border border-violet-500/15">
                <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" /> {steps[project.currentStep]}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-violet-500" /> Клиент: <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">{project.clientName}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-violet-500" /> Дата: <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">{project.date}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-violet-500" /> Локация: <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">{project.venue}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Overall visual dash progress */}
            <div className="flex items-center gap-2.5">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Общий прогресс</p>
                <p className="text-base font-bold text-zinc-900 dark:text-zinc-50">{progressPercentages[project.currentStep]}%</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center relative">
                <svg className="w-8 h-8 transform -rotate-90 absolute">
                  <circle cx="16" cy="16" r="13" fill="transparent" stroke="rgba(122,92,158,0.06)" strokeWidth="2" />
                  <circle
                    cx="16"
                    cy="16"
                    r="13"
                    fill="transparent"
                    stroke="#8B5CF6"
                    strokeWidth="2"
                    strokeDasharray="81.6"
                    strokeDashoffset={81.6 - (81.6 * progressPercentages[project.currentStep]) / 100}
                    className="transition-all duration-700"
                  />
                </svg>
                <span className="text-[10px] font-bold text-zinc-800 dark:text-zinc-100 relative z-10">{progressPercentages[project.currentStep]}%</span>
              </div>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://fleur-decor.ru/share/${project.id}`);
                showToast('Ссылка скопирована', 'Гостевая ссылка сохранена в буфер обмена.', 'success');
              }}
              className="px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700 hover:bg-zinc-50 text-zinc-800 dark:text-zinc-200 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-violet-500" /> Поделиться
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* STEPPER STEP HORIZONTAL TIMELINE NAV */}
        <nav className="bg-zinc-50/20 dark:bg-zinc-950/15 border-b border-zinc-100 dark:border-zinc-800/40 p-3 overflow-x-auto shrink-0 hide-scrollbar">
          <div className="flex items-center justify-between min-w-[700px] px-4">
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
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : isCurrent
                          ? 'bg-violet-600 text-white shadow-md ring-4 ring-violet-500/15'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 group-hover:text-zinc-600'
                      }`}
                    >
                      {isCompleted ? '✓' : idx + 1}
                    </span>
                    <div className="text-left leading-none">
                      <span className="block text-[8px] uppercase tracking-wider font-bold text-zinc-400">Этап {idx + 1}</span>
                      <span className={`text-xs font-bold transition-colors ${
                        isCurrent ? 'text-violet-600 dark:text-violet-400' : isCompleted ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-400 group-hover:text-zinc-600'
                      }`}>{label}</span>
                    </div>
                  </button>
                  {idx < steps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-4 rounded-full transition-all ${
                        idx < project.currentStep ? 'bg-emerald-400' : 'bg-zinc-200 dark:bg-zinc-800'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </nav>

        {/* TWO SIDED GRID WORKSPACE PANEL CONTENT */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT MINI RAIL MENU */}
          <aside className="w-56 shrink-0 border-r border-zinc-200/50 dark:border-zinc-800/40 p-4 bg-zinc-50/20 dark:bg-zinc-950/10 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-2">Навигация по карте</span>
              <nav className="space-y-1">
                {[
                  { id: 'all', label: 'Общий вид', icon: Layout, badge: '8' },
                  { id: 'brief', label: 'Бриф проекта', icon: Clipboard, badge: '4!' },
                  { id: 'design', label: 'Дизайн & Точки', icon: Palette, badge: 'OK' },
                  { id: 'calc', label: 'Расчет & Смета', icon: SlidersHorizontal, badge: project.estimate.length.toString() },
                  { id: 'journal', label: 'Журнал событий', icon: Clock, badge: journalLogs.length.toString() },
                  { id: 'docs', label: 'Документооборот', icon: FolderOpen, badge: '4' }
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-full text-xs font-bold transition-all text-left cursor-pointer ${
                        isActive
                          ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                        <span>{tab.label}</span>
                      </span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                        tab.id === 'brief' && tab.badge.includes('!')
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                      }`}>
                        {tab.badge}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Sidebar bottom overdrawn card */}
            <div className="bg-zinc-100/50 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/40 rounded-2xl p-3 space-y-2 mt-4 shrink-0">
              <span className="text-[9px] font-bold uppercase text-zinc-400 dark:text-zinc-500 block">Финансовый лимит</span>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">{finalPrice.toLocaleString('ru')} ₽</span>
                <span className="text-[9px] text-zinc-400">из 60к</span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    budgetRatio > 100 ? 'bg-rose-500' : 'bg-violet-600'
                  }`}
                  style={{ width: `${Math.min(budgetRatio, 100)}%` }}
                />
              </div>
            </div>
          </aside>

          {/* MAIN SCROLLABLE BODY PANEL */}
          <main className="flex-1 p-6 overflow-y-auto space-y-6">
            
            {/* ================= BRIEF SECTION ================= */}
            {(activeTab === 'all' || activeTab === 'brief') && (
              <section className="bg-white/80 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/40 rounded-3xl overflow-hidden shadow-sm">
                <div className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200/50 dark:border-zinc-800/50 px-5 py-4 flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Clipboard className="w-4 h-4 text-violet-500" />
                    <div>
                      <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Анкета и Бриф проекта</h2>
                      <p className="text-[10px] text-zinc-400">Заполнено: <strong className="text-violet-600 font-bold">78%</strong> (4 поля пустых)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setBriefCollapsed(!briefCollapsed)}
                      className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 dark:text-zinc-200 rounded-full text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <span>{briefCollapsed ? 'Развернуть' : 'Свернуть'}</span>
                      <ChevronUp className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${briefCollapsed ? 'transform rotate-180' : ''}`} />
                    </button>
                    <button
                      onClick={() => setIsBriefEditOpen(true)}
                      className="px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-full text-xs font-bold transition-all cursor-pointer"
                    >
                      Редактировать
                    </button>
                  </div>
                </div>

                {!briefCollapsed && (
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { key: "Имя клиента", val: project.clientName, client: true },
                        { key: "Телефон", val: "+7 905 •••• ••", client: true },
                        { key: "Событие", val: "Свадьба", client: true },
                        { key: "Дата проведения", val: project.date, client: true },
                        { key: "Гостей", val: project.brief.guestsCount, client: true },
                        { key: "Стиль оформления", val: project.brief.style, client: false },
                        { key: "Площадка", val: project.venue, client: true },
                        { key: "Адрес", val: "Москва, ул. Воробьевское шоссе, 2Б", client: true },
                        { key: "Крепеж к стенам", val: "Разрешено", client: false },
                        { key: "Крепеж к потолку", val: "До 15 кг", client: false },
                        { key: "Электричество у сцены", val: "Есть, в радиусе 5м", client: false },
                        { key: "Палитра оформления", val: project.brief.colors.join(', '), client: true }
                      ].map((item, i) => (
                        <div
                          key={i}
                          className={`p-3.5 rounded-2xl border ${
                            item.client
                              ? 'border-l-4 border-l-violet-500 border-zinc-100 dark:border-zinc-800/40 bg-zinc-50/40 dark:bg-zinc-950/15'
                              : 'border-l-4 border-l-zinc-300 border-zinc-100 dark:border-zinc-800/40 bg-zinc-50/40 dark:bg-zinc-950/15'
                          }`}
                        >
                          <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500 block mb-1">{item.key}</span>
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{item.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* ================= DESIGN & GALLERY VARIANTS ================= */}
            {(activeTab === 'all' || activeTab === 'design') && (
              <section className="bg-white/80 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/40 rounded-3xl overflow-hidden shadow-sm">
                <div className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200/50 dark:border-zinc-800/50 px-5 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-violet-500" />
                    <div>
                      <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Дизайн & Визуализация</h2>
                      <p className="text-[10px] text-zinc-400">Связан со сметой · кликните на точки</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-6">
                  {/* Gallery horizontal variants */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Галерея вариантов визуализаций</span>
                    
                    <div className="relative">
                      {/* Nav slider arrows */}
                      <button
                        onClick={() => handleScrollGallery(-1)}
                        className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 dark:bg-zinc-800/90 shadow-md border border-zinc-200 flex items-center justify-center text-zinc-700 hover:text-violet-600 transition-transform cursor-pointer hover:scale-105"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleScrollGallery(1)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 dark:bg-zinc-800/90 shadow-md border border-zinc-200 flex items-center justify-center text-zinc-700 hover:text-violet-600 transition-transform cursor-pointer hover:scale-105"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <div
                        ref={galleryRef}
                        className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory hide-scrollbar scroll-smooth"
                      >
                        {/* Variant 1: Active Interactive SVG Hotspots */}
                        <div className="snap-start shrink-0 w-80 aspect-square bg-violet-500/5 dark:bg-violet-950/10 rounded-2xl p-4 border border-violet-500/10 relative flex flex-col justify-between items-center">
                          <span className="absolute top-2 left-2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur shadow border border-zinc-200/50 text-[8.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-zinc-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 inline-block mr-1 animate-pulse" /> Нажми на точку
                          </span>
                          <span className="absolute bottom-2 right-2 text-[10px] text-zinc-400 font-mono font-bold">Каркас А</span>

                          {/* SVG interactive arch hotspots */}
                          <svg className="w-4/5 h-auto" viewBox="0 0 150 120" fill="none">
                            <path d="M30 115 L30 55 Q30 20 75 20 Q120 20 120 55 L120 115" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" fill="none" opacity="0.3" />
                            
                            {/* Hotspot A */}
                            <g onClick={() => handleSelectHotspot('A-304')} className="cursor-pointer group">
                              <circle cx="34" cy="52" r="9" fill="#8B5CF6" className="transition-transform group-hover:scale-110" stroke="#FFF" strokeWidth="1.5" />
                              <text x="34" y="55" fill="#FFF" fontSize="8" fontWeight="bold" textAnchor="middle">A</text>
                            </g>
                            {/* Hotspot B */}
                            <g onClick={() => handleSelectHotspot('B-012')} className="cursor-pointer group">
                              <circle cx="75" cy="22" r="9" fill="#10B981" className="transition-transform group-hover:scale-110" stroke="#FFF" strokeWidth="1.5" />
                              <text x="75" y="25" fill="#FFF" fontSize="8" fontWeight="bold" textAnchor="middle">B</text>
                            </g>
                            {/* Hotspot C */}
                            <g onClick={() => handleSelectHotspot('C-001')} className="cursor-pointer group">
                              <circle cx="116" cy="52" r="9" fill="#3B82F6" className="transition-transform group-hover:scale-110" stroke="#FFF" strokeWidth="1.5" />
                              <text x="116" y="55" fill="#FFF" fontSize="8" fontWeight="bold" textAnchor="middle">C</text>
                            </g>
                            {/* Hotspot D */}
                            <g onClick={() => handleSelectHotspot('D-210')} className="cursor-pointer group">
                              <circle cx="75" cy="85" r="9" fill="#F43F5E" className="transition-transform group-hover:scale-110" stroke="#FFF" strokeWidth="1.5" />
                              <text x="75" y="88" fill="#FFF" fontSize="8" fontWeight="bold" textAnchor="middle">D</text>
                            </g>
                          </svg>
                        </div>

                        {/* Variant 2: layout draft scheme */}
                        <div className="snap-start shrink-0 w-80 aspect-square bg-zinc-50 dark:bg-zinc-950/25 border border-zinc-200/50 dark:border-zinc-800/40 rounded-2xl p-4 flex flex-col justify-between">
                          <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider block mb-1">План расстановки</span>
                          <div className="h-2/3 bg-white/40 dark:bg-zinc-900/30 rounded-xl border border-zinc-200/40 dark:border-zinc-800/20 p-3 flex flex-col justify-around text-[11px] text-zinc-400">
                            <div className="flex justify-between items-center font-bold">
                              <span className="border border-dashed border-violet-500/40 rounded px-1.5 py-0.5 text-violet-600">Зона за столом</span>
                              <span>8×5м</span>
                            </div>
                            <div className="flex gap-1.5 justify-center items-center">
                              <div className="w-5 h-5 rounded-full bg-violet-100 text-violet-600 font-bold flex items-center justify-center text-[10px]">C1</div>
                              <div className="w-5 h-5 rounded-full bg-violet-100 text-violet-600 font-bold flex items-center justify-center text-[10px]">C2</div>
                              <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 rounded">Вход</span>
                            </div>
                          </div>
                          <span className="text-[9px] text-zinc-400 font-mono">Схема 1</span>
                        </div>

                        {/* Variant 3: color grid palette */}
                        <div className="snap-start shrink-0 w-80 aspect-square bg-gradient-to-br from-rose-50 to-indigo-50 dark:from-violet-950/10 dark:to-zinc-900 rounded-2xl p-4 border border-zinc-200/50 dark:border-zinc-800/40 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase block tracking-wide">Палитра цветов</span>
                            <span className="text-[11px] text-zinc-400">Сочетание нежной розы и пудровой лаванды</span>
                          </div>
                          <div className="grid grid-cols-4 gap-2.5 h-12">
                            <div className="bg-[#FFD3E2] rounded-lg border border-white" />
                            <div className="bg-[#F6EEFF] rounded-lg border border-white" />
                            <div className="bg-[#EBE5F3] rounded-lg border border-white" />
                            <div className="bg-[#A78BFA] rounded-lg border border-white" />
                          </div>
                          <span className="text-[9px] text-zinc-400 font-mono">Розовое Золото</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ================= ESTIMATE & COMMERCIAL ================= */}
            {(activeTab === 'all' || activeTab === 'calc') && (
              <section className="bg-white/80 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/40 rounded-3xl overflow-hidden shadow-sm">
                <div className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200/50 dark:border-zinc-800/50 px-5 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-violet-500" />
                    <div>
                      <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Смета декора и монтажа</h2>
                      <p className="text-[10px] text-zinc-400">Автоматический расчет прибыльности и наценки в реальном времени</p>
                    </div>
                  </div>
                  <button
                    onClick={handleResetCalculator}
                    className="px-3.5 py-1.5 text-xs font-bold text-zinc-400 hover:text-rose-500 hover:bg-rose-50/10 rounded-xl transition-all cursor-pointer"
                  >
                    Сбросить калькулятор
                  </button>
                </div>

                <div className="p-5 space-y-5">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-100 dark:border-zinc-800/60 text-zinc-400 font-bold pb-2">
                          <th className="pb-3 w-10 text-center font-bold">#</th>
                          <th className="pb-3 font-bold">Наименование декора</th>
                          <th className="pb-3 font-bold">Категория</th>
                          <th className="pb-3 text-center font-bold">Кол-во</th>
                          <th className="pb-3 text-right pr-4 font-bold">Цена (₽)</th>
                          <th className="pb-3 text-right font-bold">Сумма (₽)</th>
                          <th className="pb-3 w-10 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/40">
                        {project.estimate.map((item, idx) => (
                          <tr
                            key={item.id}
                            id={`calc-row-${item.id}`}
                            className="group hover:bg-zinc-100/50 dark:hover:bg-zinc-950/20 transition-all duration-150"
                          >
                            <td className="py-3 text-center text-zinc-400 font-mono text-[10px]">{idx + 1}</td>
                            <td className="py-3">
                              <span className="font-bold text-zinc-800 dark:text-zinc-200">{item.name}</span>
                            </td>
                            <td className="py-3">
                              <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-semibold px-2 py-0.5 rounded-full">
                                {item.category}
                              </span>
                            </td>
                            <td className="py-3 text-center">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => handleUpdateItemQty(item.id, Math.max(1, item.quantity - 1))}
                                  className="w-5 h-5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 flex items-center justify-center font-bold text-xs"
                                >
                                  -
                                </button>
                                <span className="font-bold font-mono text-zinc-800 dark:text-zinc-100">{item.quantity}</span>
                                <button
                                  onClick={() => handleUpdateItemQty(item.id, item.quantity + 1)}
                                  className="w-5 h-5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 flex items-center justify-center font-bold text-xs"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="py-3 text-right pr-4">
                              <input
                                type="number"
                                value={item.price}
                                onChange={(e) => handleUpdateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                                className="w-16 text-right bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded px-1.5 py-0.5 text-xs font-mono focus:outline-none"
                              />
                            </td>
                            <td className="py-3 text-right font-bold font-mono text-zinc-800 dark:text-zinc-100">
                              {(item.quantity * item.price).toLocaleString('ru')} ₽
                            </td>
                            <td className="py-3 text-center">
                              <button
                                onClick={() => handleRemoveEstimate(item.id, item.name)}
                                className="text-zinc-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Quick Add Position Form */}
                  <form onSubmit={handleAddEstimate} className="p-3 bg-zinc-50/50 dark:bg-zinc-950/20 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-2.5 items-center">
                    <div className="flex-1 min-w-[200px]">
                      <input
                        type="text"
                        placeholder="Название новой позиции..."
                        required
                        value={newEstName}
                        onChange={(e) => setNewEstName(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs py-1.5 px-3 rounded-lg focus:outline-none focus:border-violet-500 text-zinc-800 dark:text-zinc-100"
                      />
                    </div>
                    <div className="w-32">
                      <select
                        value={newEstCat}
                        onChange={(e) => setNewEstCat(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs py-1.5 px-2 rounded-lg focus:outline-none focus:border-violet-500 text-zinc-800 dark:text-zinc-100"
                      >
                        <option value="Декор">Декор</option>
                        <option value="Конструкции">Конструкции</option>
                        <option value="Флористика">Флористика</option>
                        <option value="Освещение">Освещение</option>
                        <option value="Работа">Работа</option>
                      </select>
                    </div>
                    <div className="w-24 relative">
                      <input
                        type="number"
                        placeholder="Цена (₽)"
                        value={newEstPrice}
                        onChange={(e) => setNewEstPrice(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs py-1.5 px-2 pr-6 rounded-lg focus:outline-none focus:border-violet-500 text-zinc-800 dark:text-zinc-100"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 font-mono text-[10px]">₽</span>
                    </div>
                    <button
                      type="submit"
                      className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Добавить
                    </button>
                  </form>

                  {/* Commercial markup calculations dashboard */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                    
                    {/* Raw metrics and totals */}
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-zinc-400">
                        <span>Себестоимость декора:</span>
                        <strong className="text-zinc-800 dark:text-zinc-200 font-bold">{decorCost.toLocaleString('ru-RU')} ₽</strong>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Монтаж и доставка:</span>
                        <strong className="text-zinc-800 dark:text-zinc-200 font-bold">{serviceCost.toLocaleString('ru-RU')} ₽</strong>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold">
                        <span>Итого себестоимость:</span>
                        <span>{totalCost.toLocaleString('ru-RU')} ₽</span>
                      </div>
                    </div>

                    {/* Desired markup slider percentage */}
                    <div className="bg-violet-500/5 dark:bg-violet-950/15 p-3.5 rounded-2xl border border-violet-500/10 space-y-2.5 shadow-inner">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold uppercase tracking-wider text-zinc-400">Желаемая наценка:</span>
                        <div className="flex items-center gap-1 font-bold text-zinc-800 dark:text-zinc-200">
                          <input
                            type="number"
                            value={markupPercent}
                            onChange={(e) => setMarkupPercent(parseFloat(e.target.value) || 0)}
                            className="w-10 text-center border-none bg-white dark:bg-zinc-800 rounded px-1.5 py-0.5"
                          />
                          <span>%</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={markupPercent}
                        onChange={(e) => setMarkupPercent(parseInt(e.target.value))}
                        className="w-full accent-violet-600 h-1 cursor-pointer"
                      />
                      <div className="text-[10px] text-zinc-400 flex justify-between">
                        <span>Рекомендуемая цена:</span>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">
                          {Math.round(recommendedPrice).toLocaleString('ru')} ₽
                        </span>
                      </div>
                    </div>

                    {/* Customer final bill output checklist */}
                    <div className="bg-zinc-50 dark:bg-zinc-950/30 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-1.5">
                        <div>
                          <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase leading-none">Чек клиента</h4>
                          <span className="text-[10px] text-zinc-400">уходит в смету и договор</span>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-violet-500 shrink-0" />
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          value={finalPrice}
                          onChange={(e) => setFinalPrice(parseFloat(e.target.value) || 0)}
                          className="w-full text-right text-base font-bold text-violet-600 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-1 px-2.5 pr-6"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-violet-600 font-mono">₽</span>
                      </div>
                    </div>
                  </div>

                  {/* Calculated clean margins efficiency gauge alert */}
                  <div className="bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/20 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div className="leading-tight">
                        <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Чистая прибыль студии</h4>
                        <p className="text-[10.5px] text-zinc-400 mt-0.5">С учетом налога {taxRate}% ({Math.round(taxAmount).toLocaleString('ru')} ₽)</p>
                      </div>
                    </div>
                    <div className="text-right sm:text-right">
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {Math.round(calculatedProfit).toLocaleString('ru-RU')} ₽
                      </span>
                      <span className="block text-[10px] font-bold text-emerald-500">Маржинальность: {profitMarginPercent}%</span>
                    </div>
                  </div>

                </div>
              </section>
            )}

            {/* ================= PROJECT JOURNAL ================= */}
            {(activeTab === 'all' || activeTab === 'journal') && (
              <section className="bg-white/80 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/40 rounded-3xl overflow-hidden shadow-sm">
                <div className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200/50 dark:border-zinc-800/50 px-5 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-violet-500" />
                    <div>
                      <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Журнал событий & Заметки</h2>
                      <p className="text-[10px] text-zinc-400">История автоматических операций и пользовательские лог-записи</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-5">
                  {/* Left Column event input form */}
                  <div className="md:col-span-4 bg-zinc-50/40 dark:bg-zinc-950/15 p-4 rounded-2xl border border-zinc-200/55 dark:border-zinc-800/40 space-y-3.5">
                    <h3 className="text-xs font-bold uppercase text-zinc-700 dark:text-zinc-300">Добавить событие</h3>
                    
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase text-zinc-400">Текст заметки</label>
                        <textarea
                          rows={3}
                          placeholder="Напишите решение или важный комментарий..."
                          value={journalInputText}
                          onChange={(e) => setJournalInputText(e.target.value)}
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-violet-500 resize-none text-zinc-800 dark:text-zinc-100"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase text-zinc-400">Связать с позицией сметы</label>
                        <select
                          value={journalInputLink}
                          onChange={(e) => setJournalInputLink(e.target.value)}
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs py-2 px-2.5 rounded-xl focus:outline-none text-zinc-800 dark:text-zinc-100"
                        >
                          <option value="">-- Без привязки --</option>
                          {project.estimate.map(item => (
                            <option key={item.id} value={item.id}>[{item.id}] {item.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase text-zinc-400">Категория события</label>
                        <select
                          value={journalInputType}
                          onChange={(e) => setJournalInputType(e.target.value as any)}
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs py-2 px-2.5 rounded-xl focus:outline-none text-zinc-800 dark:text-zinc-100"
                        >
                          <option value="user-note">📝 Пользовательская заметка</option>
                          <option value="important">⚠️ Важное решение</option>
                          <option value="client-agreed">🤝 Согласовано с клиентом</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={handleSubmitCustomJournal}
                        className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-colors cursor-pointer"
                      >
                        Записать событие
                      </button>
                    </div>
                  </div>

                  {/* Right Column chronologic entries list feed */}
                  <div className="md:col-span-8 flex flex-col justify-between">
                    <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800/40 gap-2 shrink-0">
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Хронологическая лента</span>
                      <div className="flex gap-1.5">
                        {[
                          { id: 'all', label: 'Все' },
                          { id: 'user-note', label: 'Заметки' },
                          { id: 'system', label: 'Система' }
                        ].map(f => (
                          <button
                            key={f.id}
                            onClick={() => setTimelineFilter(f.id as any)}
                            className={`text-[9.5px] uppercase tracking-wider font-bold px-2 py-1 rounded ${
                              timelineFilter === f.id
                                ? 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[300px] mt-3 pr-2">
                      {filteredLogs.map(log => {
                        const isSystem = log.type === 'system';
                        const isNote = log.type === 'user-note';
                        const isImportant = log.type === 'important';

                        return (
                          <div
                            key={log.id}
                            className="flex items-start gap-3 p-3 bg-zinc-50/40 dark:bg-zinc-950/20 border border-zinc-200/50 dark:border-zinc-800/20 rounded-xl"
                          >
                            <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                              <span className="text-xs">{isSystem ? '⚙️' : isImportant ? '⚠️' : '📝'}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center text-[10px] text-zinc-400">
                                <span>{log.timestamp}</span>
                                <span className="uppercase font-bold tracking-wider">{isSystem ? 'Система' : 'Заметка'}</span>
                              </div>
                              <p className="text-xs text-zinc-800 dark:text-zinc-200 mt-1">{log.text}</p>
                              
                              {log.linkedItemId && (
                                <button
                                  onClick={() => handleGoToCalcRow(log.linkedItemId!)}
                                  className="mt-1.5 inline-flex items-center gap-1 text-[9.5px] bg-violet-100 dark:bg-violet-950/50 hover:bg-violet-200 text-violet-700 dark:text-violet-400 font-bold px-2 py-0.5 rounded"
                                >
                                  Позиция {log.linkedItemId}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ================= DOCUMENTS ================= */}
            {(activeTab === 'all' || activeTab === 'docs') && (
              <section className="bg-white/80 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/40 rounded-3xl overflow-hidden shadow-sm">
                <div className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200/50 dark:border-zinc-800/50 px-5 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-violet-500" />
                    <div>
                      <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Документооборот по проекту</h2>
                      <p className="text-[10px] text-zinc-400">Связанные юридические документы для работы</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      showToast('Генерация PDF', 'Автоматические PDF договора успешно сгенерированы.', 'success');
                      addJournalLog("Сгенерирован новый пакет документов из брифа", "system");
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-violet-100 hover:bg-violet-200 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400 font-bold border border-violet-500/10 text-xs transition-colors cursor-pointer"
                  >
                    Сгенерировать договора
                  </button>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { title: "Договор на декор №СВ-2026", type: "PDF Договор", date: "15.08.2026", status: "Черновик", error: true },
                      { title: "Смета декора (Инвойс)", type: "Excel Сводная", date: "15.08.2026", status: "Готова", error: false },
                      { title: "Photo Release согласие", type: "Подписанный PDF", date: "15.08.2026", status: "Подписано", error: false },
                      { title: "Акт приема-передачи", type: "Акт монтажа", date: "Ожидание финала", status: "В обработке", error: true }
                    ].map((doc, idx) => (
                      <div
                        key={idx}
                        className="bg-zinc-50/40 dark:bg-zinc-950/20 border border-zinc-200/55 dark:border-zinc-800/20 p-4 rounded-2xl flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center text-lg">
                            {doc.title.includes('Договор') ? '📄' : doc.title.includes('Смета') ? '📊' : '📸'}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 leading-snug">{doc.title}</h4>
                            <span className="text-[10px] text-zinc-400">{doc.type} • {doc.date}</span>
                            <span className={`inline-block text-[8px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ml-2 ${
                              doc.error ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>{doc.status}</span>
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => showToast('Просмотр', `Открываем встроенную PDF копию документа: ${doc.title}`, 'info')}
                            className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-violet-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* LOWER SOLID PAYMENT METRIC CARD */}
            <div className="bg-zinc-900 text-white rounded-3xl p-6 relative overflow-hidden shadow-xl">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-violet-600/35 rounded-full blur-3xl pointer-events-none" />
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center relative z-10">
                <div className="md:col-span-5 space-y-1">
                  <span className="text-[10px] font-bold text-violet-300 uppercase tracking-widest block">Текущий платежный статус</span>
                  <div className="flex items-baseline gap-2.5 flex-wrap">
                    <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white">{finalPrice.toLocaleString('ru')} ₽</span>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/15">
                      Аванс 50% • Ожидает внесения
                    </span>
                  </div>
                </div>

                <div className="md:col-span-7 flex flex-wrap gap-3 justify-end">
                  <button
                    onClick={() => {
                      showToast('Оплата зафиксирована', 'Зачислена авансовая транзакция в размере 50%', 'success');
                      addJournalLog("Получена предоплата 50% от клиента", "client-agreed");
                      handleStepClick(3); // Move step to Согласовано
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    Отметить предоплату
                  </button>
                  <button
                    onClick={() => {
                      showToast('Отправлено', 'Ссылка на сметный расчет и визуализацию выслана клиенту.', 'success');
                      addJournalLog("Проект отправлен клиенту на утверждение", "client-agreed");
                    }}
                    className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow shadow-violet-600/15 flex items-center gap-1.5 cursor-pointer"
                  >
                    Отправить клиенту <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 mt-4 border-t border-white/5 text-[11px] text-zinc-400">
                <Info className="w-4 h-4 text-violet-400 shrink-0" />
                <span>Проект доступен клиенту по гостевой ссылке для моментального утверждения сметы.</span>
              </div>
            </div>

          </main>
        </div>

        {/* BOTTOM GLOBAL WORKSPACE FOOTER */}
        <footer className="bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 p-4 shrink-0 flex justify-end gap-3 z-10">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Закрыть карточку
          </button>
        </footer>

      </motion.div>

      {/* ========================================================================================= */}
      {/* ==================================== MODAL OVERLAYS ==================================== */}
      {/* ========================================================================================= */}

      {/* 1. HOTSPOT POINT SPECIFICATION POPUP */}
      <AnimatePresence>
        {isSpecModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-zinc-200/50 dark:border-zinc-800/50 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
                <span className="text-[10px] font-bold uppercase tracking-widest text-violet-700 dark:text-violet-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" /> Спецификация детали
                </span>
                <button
                  onClick={() => setIsSpecModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-500/10 flex items-center justify-center text-zinc-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-left">
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                    {pointSpecifications[activeArchPoint]?.title || 'Информационная точка'}
                  </h4>
                  <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                    {pointSpecifications[activeArchPoint]?.desc || 'Нет детального описания для этой точки.'}
                  </p>
                </div>

                <div className="bg-zinc-100/50 dark:bg-zinc-950/20 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 font-bold uppercase">Связанная цена:</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                      {project.estimate.find(item => item.id === activeArchPoint)?.price?.toLocaleString('ru') || 'Не задана'} ₽
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleGoToCalcRow(activeArchPoint)}
                      className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      Показать в смете
                    </button>
                    <button
                      onClick={() => setIsSpecModalOpen(false)}
                      className="px-4 py-2 bg-zinc-200/60 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Закрыть
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. BRIEF SPECIFIC EDIT POPUP */}
      <AnimatePresence>
        {isBriefEditOpen && (
          <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-xl w-full bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl text-left"
            >
              <div className="p-4 border-b border-zinc-200/50 dark:border-zinc-800/50 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
                <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-violet-500" /> Редактирование анкеты брифа
                </h3>
                <button
                  onClick={() => setIsBriefEditOpen(false)}
                  className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-500/10 flex items-center justify-center text-zinc-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[400px] overflow-y-auto">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500">Имя клиента</label>
                  <input
                    type="text"
                    value={project.clientName}
                    onChange={(e) => onUpdateProject({ ...project, clientName: e.target.value })}
                    className="w-full bg-zinc-100 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[var(--lavenderAccent)] text-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500">Стиль оформления</label>
                  <input
                    type="text"
                    value={project.brief.style}
                    onChange={(e) => onUpdateProject({
                      ...project,
                      brief: { ...project.brief, style: e.target.value }
                    })}
                    className="w-full bg-zinc-100 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[var(--lavenderAccent)] text-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500">Цветовая палитра (через запятую)</label>
                  <input
                    type="text"
                    value={project.brief.colors.join(', ')}
                    onChange={(e) => onUpdateProject({
                      ...project,
                      brief: { ...project.brief, colors: e.target.value.split(',').map(s => s.trim()) }
                    })}
                    className="w-full bg-zinc-100 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[var(--lavenderAccent)] text-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500">Количество гостей</label>
                    <input
                      type="number"
                      value={project.brief.guestsCount}
                      onChange={(e) => onUpdateProject({
                        ...project,
                        brief: { ...project.brief, guestsCount: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full bg-zinc-100 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[var(--lavenderAccent)] text-zinc-800 dark:text-zinc-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500">Площадка</label>
                    <input
                      type="text"
                      value={project.venue}
                      onChange={(e) => onUpdateProject({ ...project, venue: e.target.value })}
                      className="w-full bg-zinc-100 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[var(--lavenderAccent)] text-zinc-800 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500">Любимые цветы (через запятую)</label>
                  <input
                    type="text"
                    value={project.brief.flowers.join(', ')}
                    onChange={(e) => onUpdateProject({
                      ...project,
                      brief: { ...project.brief, flowers: e.target.value.split(',').map(s => s.trim()) }
                    })}
                    className="w-full bg-zinc-100 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[var(--lavenderAccent)] text-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500">Особые пожелания и примечания</label>
                  <textarea
                    rows={3}
                    value={project.brief.specialRequests}
                    onChange={(e) => onUpdateProject({
                      ...project,
                      brief: { ...project.brief, specialRequests: e.target.value }
                    })}
                    className="w-full bg-zinc-100 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[var(--lavenderAccent)] resize-none text-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-zinc-200/50 dark:border-zinc-800/50 flex justify-end gap-2 bg-zinc-50 dark:bg-zinc-900/50">
                <button
                  onClick={() => setIsBriefEditOpen(false)}
                  className="px-4 py-2 bg-zinc-200/60 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-full transition-all cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  onClick={() => {
                    setIsBriefEditOpen(false);
                    addJournalLog("Карточка брифа отредактирована декоратором", "system");
                    showToast('Обновлено!', 'Данные технического брифа сохранены.', 'success');
                  }}
                  className="px-5 py-2 bg-[var(--lavDeep)] hover:opacity-90 text-white text-xs font-bold rounded-full transition-all shadow-md cursor-pointer"
                >
                  Сохранить изменения
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
