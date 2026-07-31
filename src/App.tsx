import React, { useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FolderKanban,
  Warehouse,
  Image as ImageIcon,
  FileText,
  User,
  Plus,
  Moon,
  Sun,
  Bell,
  Check,
  Layout,
  Search,
  Sparkles,
  DollarSign,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Zap,
  Calendar,
  Eye,
  Trash2,
  Copy,
  LayoutGrid,
  List,
  MapPin,
  Settings,
  Menu,
  X
} from 'lucide-react';

import { Project, WarehouseItem, Task, DocumentItem, ImageItem, ProjectStatus, EstimateItem } from './types';
import { initialProjects, initialWarehouseItems, initialTasks, initialDocuments, initialImages } from './mockData';

// Subcomponents
import Toast from './components/Toast';
import NewProjectModal from './components/NewProjectModal';
import ProjectDetailModal from './components/ProjectDetailModal';
import MoodboardEditor from './components/MoodboardEditor';
import WarehouseTab from './components/WarehouseTab';
import ImagesTab from './components/ImagesTab';
import DocumentsTab from './components/DocumentsTab';
import ProfileTab from './components/ProfileTab';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved as 'light' | 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Main active tab state
  const [activeTab, setActiveTab] = useState<'projects' | 'warehouse' | 'images' | 'documents' | 'profile' | 'moodboard'>('projects');

  // Core database states with local persistence
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('pop_projects');
    return saved ? JSON.parse(saved) : initialProjects;
  });

  const [warehouseItems, setWarehouseItems] = useState<WarehouseItem[]>(() => {
    const saved = localStorage.getItem('pop_warehouse');
    return saved ? JSON.parse(saved) : initialWarehouseItems;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('pop_tasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [images, setImages] = useState<ImageItem[]>(initialImages);

  // Search & Filters on Projects
  const [projectQuery, setProjectQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState<'all' | 'progress' | 'waiting' | 'approved' | 'archive' | 'trash'>('all');
  const [projectSort, setProjectSort] = useState<'date' | 'status' | 'name'>('date');

  // Premium collapsible layout and calendar states
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [isLeftSidebarExpanded, setIsLeftSidebarExpanded] = useState(true);
  const [isRightSidebarExpanded, setIsRightSidebarExpanded] = useState(true);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(18);
  const [moodboardHeaderActions, setMoodboardHeaderActions] = useState<ReactNode | null>(null);
  const [imagesHeaderActions, setImagesHeaderActions] = useState<ReactNode | null>(null);

  // Modals & overlay states
  const [isNewProjOpen, setIsNewProjOpen] = useState(false);
  const [isWarehouseAdding, setIsWarehouseAdding] = useState(false);
  const [projectViewMode, setProjectViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(2);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobileProfileMenuOpen, setIsMobileProfileMenuOpen] = useState(false);

  // Brand Logo state (sync with Brand Profile)
  const [brandLogoUrl, setBrandLogoUrl] = useState<string | null>(() => {
    return localStorage.getItem('fleur_studio_logo') || null;
  });

  useEffect(() => {
    const checkLogo = () => {
      setBrandLogoUrl(localStorage.getItem('fleur_studio_logo') || null);
    };
    window.addEventListener('storage', checkLogo);
    checkLogo();
    return () => window.removeEventListener('storage', checkLogo);
  }, [activeTab]);

  // Notification lists
  const [notifications, setNotifications] = useState([
    { id: 'n1', title: 'Заполнен бриф', msg: 'Елизавета и Павел отправили пожелания к стилю.', time: '10 мин назад', read: false, projectId: 'p1' },
    { id: 'n2', title: 'Оплата получена', msg: 'Предоплата 50% по проекту Бренд Х зачислена.', time: '2 ч назад', read: false, projectId: 'p3' },
    { id: 'n3', title: 'Смета готова', msg: 'Юбилей компании · 10 лет: добавлена новая позиция.', time: 'Вчера', read: true, projectId: 'p4' }
  ]);

  // Toast alert state
  const [toast, setToast] = useState<{ visible: boolean; title: string; message: string; type?: 'success' | 'info' | 'warn' } | null>(null);

  // Synchronize localStorage
  useEffect(() => {
    localStorage.setItem('pop_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('pop_warehouse', JSON.stringify(warehouseItems));
  }, [warehouseItems]);

  useEffect(() => {
    localStorage.setItem('pop_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('dark-theme');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark-theme');
    }
  }, [theme]);

  // Toast triggering utility
  const showToast = useCallback((title: string, message: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToast({ visible: true, title, message, type });
    // Auto closing
    setTimeout(() => {
      setToast(prev => prev ? { ...prev, visible: false } : null);
    }, 4000);
  }, []);

  // Toggle Theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
    showToast('Тема изменена', 'Цветовая схема панели управления переключена.', 'info');
  };

  // Create new project
  const handleCreateProject = (newProj: Omit<Project, 'id' | 'estimate' | 'brief'>) => {
    const created: Project = {
      ...newProj,
      id: `proj_${Date.now()}`,
      estimate: [],
      brief: {
        style: 'Не выбран',
        colors: ['#FFFFFF'],
        flowers: [],
        guestsCount: 50,
        specialRequests: 'Нет примечаний.'
      }
    };

    setProjects([created, ...projects]);
    
    // Also generate mock invoice/contract for this
    const newDoc: DocumentItem = {
      id: `doc_${Date.now()}`,
      name: `Предварительный Договор · ${created.name}`,
      type: 'contract',
      date: new Date().toISOString().split('T')[0],
      status: 'draft',
      amount: created.budget,
      projectRelation: created.name
    };
    setDocuments([newDoc, ...documents]);

    showToast('Проект создан', `Проект «${created.name}» успешно добавлен в базу и готов к работе.`, 'success');
  };

  // Edit / Update existing project from detailed drawer
  const handleUpdateProject = (updated: Project) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    if (selectedProject?.id === updated.id) {
      setSelectedProject(updated);
    }
  };

  const handleTrashClick = (p: Project) => {
    if (p.status === 'trash') {
      setProjects(prev => prev.filter(item => item.id !== p.id));
      showToast('Удалено навсегда', `Проект «${p.name}» удален окончательно.`, 'warn');
    } else {
      setProjects(prev => prev.map(item => item.id === p.id ? { ...item, status: 'trash' as const } : item));
      showToast('Перемещено в корзину', `Проект «${p.name}» перемещен в корзину.`, 'info');
    }
  };

  // Visualizer editor attachment: updates project image mock, estimate list and budget
  const handleAttachVisualizerToProject = useCallback((projectId: string, imageUrl: string, estimateItems?: EstimateItem[], budget?: number) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const updated = { ...p, imageUrl };
        if (estimateItems) {
          updated.estimate = estimateItems;
        }
        if (budget !== undefined) {
          updated.budget = budget;
        }
        return updated;
      }
      return p;
    }));
  }, []);

  // Checklist tasks toggling
  const handleToggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextState = !t.completed;
        if (nextState) {
          showToast('Задача выполнена', `Ура! Вы завершили задачу: "${t.title}"`, 'success');
        }
        return { ...t, completed: nextState };
      }
      return t;
    }));
  };

  // Mark all notifications as read
  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadNotificationsCount(0);
    showToast('Уведомления', 'Все уведомления отмечены как прочитанные.', 'info');
  };

  const handleNotificationClick = (projectId: string, notifId: string) => {
    // Mark this single notification as read
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
    setUnreadNotificationsCount(prev => Math.max(0, prev - 1));
    
    // Open project
    const found = projects.find(p => p.id === projectId);
    if (found) {
      setSelectedProject(found);
    }
    setIsNotificationsOpen(false);
  };

  // Interactive search & filter computations for projects
  const processedProjects = useMemo(() => {
    let list = [...projects];

    // Filter
    if (projectFilter === 'all') {
      list = list.filter(p => p.status !== 'trash');
    } else {
      list = list.filter(p => p.status === projectFilter);
    }

    // Search query
    if (projectQuery.trim() !== '') {
      const q = projectQuery.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q) ||
        p.venue.toLowerCase().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      if (projectSort === 'name') {
        return a.name.localeCompare(b.name, 'ru');
      }
      if (projectSort === 'status') {
        return a.status.localeCompare(b.status);
      }
      // date descending
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return list;
  }, [projects, projectQuery, projectFilter, projectSort]);

  // Counting badges for filter pills
  const counts = useMemo(() => {
    return {
      all: projects.filter(p => p.status !== 'trash').length,
      progress: projects.filter(p => p.status === 'progress').length,
      waiting: projects.filter(p => p.status === 'waiting').length,
      approved: projects.filter(p => p.status === 'approved').length,
      archive: projects.filter(p => p.status === 'archive').length,
      trash: projects.filter(p => p.status === 'trash').length
    };
  }, [projects]);

  // Dynamic quick metrics calculators
  const metrics = useMemo(() => {
    const activeProjects = projects.filter(p => p.status !== 'trash');
    const inProgress = activeProjects.filter(p => p.status === 'progress').length;
    const waiting = activeProjects.filter(p => p.status === 'waiting').length;
    const totalBudget = activeProjects.reduce((sum, p) => sum + p.budget, 0);
    const approvedCount = activeProjects.filter(p => p.status === 'approved').length;
    const successPercent = Math.round((approvedCount / (activeProjects.length || 1)) * 100);

    return { inProgress, waiting, totalBudget, successPercent };
  }, [projects]);

  const stepsList = ['Бриф', 'Визуал', 'Смета', 'Согл.', 'Финал'];

  // July 2026 Calendar Events Data
  const calendarEvents: Record<number, Array<{ title: string; desc: string; time: string; type: 'warn' | 'sage' | 'indigo' | 'lavender' }>> = {
    6: [
      { title: 'Свадьба · Ролл', desc: 'Заполнение брифа клиентом', time: '12:00', type: 'warn' }
    ],
    14: [
      { title: 'Открытие шоурума · ARTEL', desc: 'Встреча для согласования сметы', time: '15:30', type: 'indigo' }
    ],
    18: [
      { title: 'День рождения · 30 лет', desc: 'Монтаж декора в Лофт «Верх», Краснодар', time: '08:00', type: 'lavender' }
    ],
    25: [
      { title: 'Юбилей компании · 10 лет', desc: 'Получение предоплаты / Аванс', time: '11:00', type: 'sage' }
    ]
  };

  const calendarDays = [
    { num: 29, currentMonth: false },
    { num: 30, currentMonth: false },
    { num: 1, currentMonth: true },
    { num: 2, currentMonth: true },
    { num: 3, currentMonth: true },
    { num: 4, currentMonth: true },
    { num: 5, currentMonth: true },
    { num: 6, currentMonth: true, eventType: 'warn' },
    { num: 7, currentMonth: true },
    { num: 8, currentMonth: true },
    { num: 9, currentMonth: true },
    { num: 10, currentMonth: true },
    { num: 11, currentMonth: true },
    { num: 12, currentMonth: true },
    { num: 13, currentMonth: true },
    { num: 14, currentMonth: true, eventType: 'indigo' },
    { num: 15, currentMonth: true },
    { num: 16, currentMonth: true },
    { num: 17, currentMonth: true },
    { num: 18, currentMonth: true, eventType: 'lavender' },
    { num: 19, currentMonth: true },
    { num: 20, currentMonth: true },
    { num: 21, currentMonth: true },
    { num: 22, currentMonth: true },
    { num: 23, currentMonth: true },
    { num: 24, currentMonth: true },
    { num: 25, currentMonth: true, eventType: 'sage' },
    { num: 26, currentMonth: true },
    { num: 27, currentMonth: true },
    { num: 28, currentMonth: true },
    { num: 29, currentMonth: true },
    { num: 30, currentMonth: true },
    { num: 31, currentMonth: true },
    { num: 1, currentMonth: false },
    { num: 2, currentMonth: false },
  ];

  const getProjectImage = (id: string) => {
    const imagesMap: Record<string, string> = {
      p1: 'https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&w=600&q=80',
      p2: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=600&q=80',
      p3: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80',
      p4: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
      p5: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
      p6: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    };
    return imagesMap[id] || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80';
  };

  const inProgressSum = useMemo(() => {
    return projects
      .filter(p => p.status === 'progress' || p.status === 'waiting')
      .reduce((sum, p) => {
        const totalSum = p.estimate.reduce((s, item) => s + (item.quantity * item.price), 0);
        return sum + (totalSum > 0 ? totalSum : p.budget);
      }, 0);
  }, [projects]);

  const approvedSum = useMemo(() => {
    return projects
      .filter(p => p.status === 'approved')
      .reduce((sum, p) => {
        const totalSum = p.estimate.reduce((s, item) => s + (item.quantity * item.price), 0);
        return sum + (totalSum > 0 ? totalSum : p.budget);
      }, 0);
  }, [projects]);

  const profitSum = useMemo(() => {
    return Math.round(approvedSum * 0.35);
  }, [approvedSum]);

  return (
    <div className="flex relative w-screen h-screen overflow-hidden bg-transparent font-sans transition-colors duration-300">
      
      {/* Background Decorative Abstract Soft Spheres/Blobs for Glassmorphism */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 select-none">
        {/* Top Lilac Sphere */}
        <div className="absolute top-[2%] left-[8%] w-[32vw] h-[32vw] max-w-[480px] max-h-[480px] rounded-full bg-[var(--lavBorder)]/35 dark:bg-[var(--lavDeep)]/20 blur-[60px] animate-float-slow" />
        {/* Pearl Sphere right next to it for a visible transition */}
        <div className="absolute top-[5%] left-[32%] w-[28vw] h-[28vw] max-w-[420px] max-h-[420px] rounded-full bg-[#EBE7F1]/65 dark:bg-white/10 blur-[50px] animate-float-medium" />
        {/* Pale Sand Sphere */}
        <div className="absolute top-[10%] right-[12%] w-[30vw] h-[30vw] max-w-[460px] max-h-[460px] rounded-full bg-[#FAF2E5]/50 dark:bg-zinc-800/10 blur-[55px] animate-float-diagonal" />
        {/* Small Pearl Core for a high-contrast central gleam */}
        <div className="absolute top-[16%] left-[25%] w-[18vw] h-[18vw] max-w-[240px] max-h-[240px] rounded-full bg-white/55 dark:bg-white/5 blur-[35px] animate-float-slow" />
        {/* Mid-right lilac-purple accent */}
        <div className="absolute top-[28%] right-[25%] w-[22vw] h-[22vw] max-w-[320px] max-h-[320px] rounded-full bg-purple-200/30 dark:bg-purple-950/15 blur-[45px] animate-float-orbit" />
        {/* Soft bottom-left Turquoise/Lavender Sphere */}
        <div className="absolute bottom-[12%] left-[15%] w-[36vw] h-[36vw] max-w-[550px] max-h-[550px] rounded-full bg-sky-200/20 dark:bg-indigo-950/10 blur-[75px] animate-float-diagonal" />
        {/* Soft bottom-right Sand/Pearl Sphere */}
        <div className="absolute bottom-[5%] right-[5%] w-[28vw] h-[28vw] max-w-[420px] max-h-[420px] rounded-full bg-[#FAF4EA]/45 dark:bg-zinc-800/10 blur-[65px] animate-float-medium" />
      </div>

      {/* Toast alert system */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* 1. BRAND SIDEBAR (LEFT) */}
      <aside
        className={`shrink-0 p-5 hidden lg:flex flex-col gap-5 sticky top-0 h-screen border-r backdrop-blur-xl z-20 transition-all duration-300 ${
          isLeftSidebarExpanded ? 'w-64' : 'w-20 items-center px-3'
        }`}
        style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)' }}
      >
        {/* Unified Sidebar Header */}
        {isLeftSidebarExpanded ? (
          <div className="flex items-center justify-between w-full min-h-[36px]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--lavDeep)] to-[var(--lavenderAccent)] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                Ф
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-[#1B0E20] dark:text-zinc-100 text-[15px] tracking-tight leading-tight block">Флёр Деко</span>
                <span className="text-xs text-[var(--faint)] leading-none mt-0.5 block">премиум</span>
              </div>
            </div>
            <button
              onClick={() => setIsLeftSidebarExpanded(false)}
              title="Свернуть боковое меню"
              className="w-8 h-8 rounded-full hover:bg-white/20 dark:hover:bg-black/20 flex items-center justify-center text-[var(--soft)] hover:text-[var(--ink)] cursor-pointer"
            >
              <ChevronsLeft className="w-4 h-4 text-[var(--soft)]" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3.5 w-full">
            <div
              onClick={() => setIsLeftSidebarExpanded(true)}
              title="Флёр Деко · премиальный декор"
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--lavDeep)] to-[var(--lavenderAccent)] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm cursor-pointer hover:scale-105 transition-transform"
            >
              Ф
            </div>
            <button
              onClick={() => setIsLeftSidebarExpanded(true)}
              title="Развернуть боковое меню"
              className="w-8 h-8 rounded-full hover:bg-white/20 dark:hover:bg-black/20 flex items-center justify-center text-[var(--soft)] hover:text-[var(--lavDeep)] transition-all cursor-pointer"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Sidebar Navigation */}
        <nav className={`flex flex-col gap-0.5 w-full ${!isLeftSidebarExpanded ? 'items-center' : ''}`}>
          {[
            { key: 'projects', label: 'Мои проекты', icon: <FolderKanban className="w-[18px] h-[18px] shrink-0" /> },
            { key: 'moodboard', label: 'Редактор', icon: <Layout className="w-[18px] h-[18px] shrink-0" /> },
            { key: 'warehouse', label: 'Мой склад', icon: <Warehouse className="w-[18px] h-[18px] shrink-0" /> },
            { key: 'images', label: 'Мои изображения', icon: <ImageIcon className="w-[18px] h-[18px] shrink-0" /> },
            { key: 'documents', label: 'Мои документы', icon: <FileText className="w-[18px] h-[18px] shrink-0" /> },
            { key: 'profile', label: 'Профиль бренда', icon: <User className="w-[18px] h-[18px] shrink-0" /> }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              title={!isLeftSidebarExpanded ? tab.label : undefined}
              className={`flex items-center gap-3 rounded-xl text-[15px] transition-all cursor-pointer ${
                isLeftSidebarExpanded ? 'px-3.5 py-2 w-full justify-start' : 'p-2 w-9 h-9 justify-center'
              } ${
                activeTab === tab.key
                  ? 'bg-[var(--glass-strong)] border border-[var(--glass-edge)] text-[#1B0D22] dark:text-zinc-100 font-normal shadow-sm'
                  : 'text-[#1B0D22] dark:text-zinc-300 hover:bg-white/30 dark:hover:bg-zinc-800/20 border border-transparent font-normal'
              }`}
            >
              {tab.icon}
              {isLeftSidebarExpanded && <span>{tab.label}</span>}
            </button>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Collapsible User Profile Card */}
        {isLeftSidebarExpanded ? (
          <div className="glass-panel rounded-2xl p-3 flex flex-col transition-all duration-300" id="user-profile-card">
            {/* Toggle Header (always visible) */}
            <div
              onClick={() => setIsProfileExpanded(!isProfileExpanded)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[var(--lavenderSoft)] text-[var(--lavDeep)] flex items-center justify-center font-medium text-xs shrink-0">ДС</div>
                <div className="min-w-0">
                  <p className="font-medium text-[var(--ink)] text-sm truncate">Денис С.</p>
                  <p className="text-xs text-[var(--faint)] truncate">denis@example.com</p>
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-[var(--faint)] transition-transform duration-300 ${isProfileExpanded ? 'rotate-180' : ''}`} />
            </div>

            {/* Always Visible Tariff Block */}
            <div className="flex items-center justify-between text-xs border-t border-[var(--glass-edge)] pt-2.5 mt-2.5" style={{ borderTopColor: 'var(--line)' }}>
              <div className="flex items-center gap-1.5">
                <span className="text-[var(--soft)]">Тариф</span>
                <span className="text-xs font-semibold bg-[var(--lavDeep)] text-white px-2 py-0.5 rounded-full tracking-wide">PRO</span>
              </div>
              <button
                onClick={() => showToast('Смена плана', 'Раздел управления тарифом появится совсем скоро.', 'info')}
                className="text-xs text-[var(--lavenderAccent)] hover:underline font-medium"
              >
                сменить
              </button>
            </div>

            {/* Collapsible Body Details */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out flex flex-col gap-3.5 mt-0 ${isProfileExpanded ? 'max-h-[350px] opacity-100 mt-2.5' : 'max-h-0 opacity-0'}`}>
              <div className="h-px bg-[var(--glass-edge)] mt-2.5" style={{ background: 'var(--line)' }} />

              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--soft)]">Лимиты на месяц</span>
              </div>

              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-xs text-[var(--soft)] mb-1">
                    <span>ИИ-визуализация</span>
                    <span className="font-medium text-[var(--ink)]">2 / 10</span>
                  </div>
                  <div className="w-full h-1 bg-[var(--glass)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--lavenderAccent)]" style={{ width: '20%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-[var(--soft)] mb-1">
                    <span>Обрезка фона</span>
                    <span className="font-medium text-[var(--ink)]">12 / 20</span>
                  </div>
                  <div className="w-full h-1 bg-[var(--glass)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--sage)]" style={{ width: '60%' }} />
                  </div>
                </div>
              </div>
              <div className="text-xs text-[var(--faint)] -mt-1.5">обновится 3 авг</div>

              <button
                onClick={() => showToast('До встречи!', 'Вы вышли из личного кабинета.', 'info')}
                className="w-full glass-interactive bg-white/30 hover:bg-white/50 rounded-xl py-2 text-xs font-medium text-[var(--ink)] flex items-center justify-center gap-2"
              >
                Выйти
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsLeftSidebarExpanded(true)}
            title="Денис С. (Тариф PRO)"
            className="w-10 h-10 rounded-full bg-[var(--lavenderSoft)] text-[var(--lavDeep)] flex items-center justify-center font-semibold text-xs shrink-0 hover:scale-105 transition-transform cursor-pointer"
          >
            ДС
          </button>
        )}
      </aside>

      {/* 2. DYNAMIC MAIN CONTAINER WRAPPER WITH RIGHT SIDEBAR */}
      <div className="flex-1 flex flex-col lg:flex-row min-w-0 h-full overflow-hidden">
        
        {/* CENTRAL WORKSPACE */}
        <main className={`flex-1 relative flex flex-col min-w-0 ${
          activeTab === 'moodboard'
            ? 'p-1 sm:p-1.5 space-y-1 h-full overflow-hidden'
            : 'p-5 sm:p-8 space-y-6 h-full overflow-y-auto overflow-x-hidden'
        }`}>
          
          {/* Responsive Mobile / Tablet Header Tab Bar switcher */}
          <div className="lg:hidden flex items-center justify-between bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/60 dark:border-zinc-800/60 px-2.5 py-1 sm:p-2.5 rounded-xl sm:rounded-2xl shrink-0 gap-2 shadow-xs relative z-30">
            {/* Left Group: Logo + Hamburger Navigation Switcher Menu */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* 1. Brand Logo (Image from profile if uploaded, or fallback 'Ф') */}
              <div
                onClick={() => setActiveTab('profile')}
                title="Профиль бренда (Флёр Деко)"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[var(--lavDeep)] to-[var(--lavenderAccent)] flex items-center justify-center text-white font-bold text-base shrink-0 shadow-xs cursor-pointer hover:scale-105 transition-transform overflow-hidden"
              >
                {brandLogoUrl ? (
                  <img src={brandLogoUrl} alt="Логотип бренда" className="w-full h-full object-cover" />
                ) : (
                  'Ф'
                )}
              </div>

              {/* 2. Hamburger Navigation Switcher Menu (Round button without text label) */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsMobileNavOpen(!isMobileNavOpen);
                    setIsMobileProfileMenuOpen(false);
                  }}
                  aria-label="Навигация"
                  title="Открыть меню навигации"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-zinc-100/80 dark:bg-zinc-800/80 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 border border-zinc-200/50 dark:border-zinc-700/50 text-[var(--ink)] transition-all cursor-pointer shadow-2xs"
                >
                  {isMobileNavOpen ? (
                    <X className="w-5 h-5 text-[var(--lavDeep)] dark:text-purple-300 shrink-0" />
                  ) : (
                    <Menu className="w-5 h-5 text-[var(--ink)] shrink-0" />
                  )}
                </button>

                <AnimatePresence>
                  {isMobileNavOpen && (
                    <>
                      <div className="fixed inset-0 z-[90]" onClick={() => setIsMobileNavOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full mt-2 w-56 bg-white/75 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/60 dark:border-zinc-700/60 rounded-2xl shadow-2xl p-1.5 z-[100] overflow-hidden"
                      >
                        {[
                          { value: 'projects', label: 'Мои проекты', icon: <FolderKanban className="w-4 h-4" /> },
                          { value: 'moodboard', label: 'Редактор', icon: <Layout className="w-4 h-4" /> },
                          { value: 'warehouse', label: 'Мой склад', icon: <Warehouse className="w-4 h-4" /> },
                          { value: 'images', label: 'Мои изображения', icon: <ImageIcon className="w-4 h-4" /> },
                          { value: 'documents', label: 'Мои документы', icon: <FileText className="w-4 h-4" /> },
                          { value: 'profile', label: 'Профиль бренда', icon: <User className="w-4 h-4" /> }
                        ].map((item) => {
                          const isSelected = activeTab === item.value;
                          return (
                            <button
                              key={item.value}
                              onClick={() => {
                                setActiveTab(item.value as any);
                                setIsMobileNavOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                                isSelected
                                  ? 'bg-[var(--lavDeep)] text-white shadow-xs'
                                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                {item.icon}
                                <span>{item.label}</span>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                            </button>
                          );
                        })}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Corner: Tariff Badge + User Initials */}
            <div className="flex items-center gap-2 sm:gap-2.5 relative">
              {/* Tariff Tag */}
              <span className="text-[10px] sm:text-xs font-bold bg-[var(--lavDeep)] text-white px-2.5 py-1 rounded-full tracking-wider shadow-2xs">
                PRO
              </span>

              {/* User Initials Avatar in Circle (Opens profile & settings menu) */}
              <button
                onClick={() => {
                  setIsMobileProfileMenuOpen(!isMobileProfileMenuOpen);
                  setIsMobileNavOpen(false);
                }}
                title="Пользователь (Денис С.)"
                className="w-9 h-9 rounded-full bg-[var(--lavenderSoft)] text-[var(--lavDeep)] flex items-center justify-center font-bold text-xs shrink-0 cursor-pointer hover:scale-105 transition-transform shadow-2xs border border-[var(--lavenderAccent)]/20"
              >
                ДС
              </button>

              {/* Mobile Profile & Settings Dropdown */}
              <AnimatePresence>
                {isMobileProfileMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-[90]" onClick={() => setIsMobileProfileMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-white/75 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/60 dark:border-zinc-700/60 rounded-2xl shadow-2xl p-4 z-[100] text-xs space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--lavenderSoft)] text-[var(--lavDeep)] flex items-center justify-center font-bold text-sm shrink-0">
                          ДС
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[var(--ink)] text-sm truncate">Денис С.</p>
                          <p className="text-[11px] text-[var(--faint)] truncate">denis@example.com</p>
                        </div>
                      </div>

                      <div className="h-px bg-zinc-200/60 dark:bg-zinc-800/60" />

                      <div className="flex items-center justify-between">
                        <span className="text-[var(--soft)] font-medium">Текущий тариф</span>
                        <span className="font-extrabold bg-[var(--lavDeep)] text-white px-2 py-0.5 rounded-full text-[10px]">PRO</span>
                      </div>

                      <div className="space-y-2 pt-1">
                        <div>
                          <div className="flex justify-between text-[11px] text-[var(--soft)] mb-1">
                            <span>ИИ-визуализация</span>
                            <span className="font-bold text-[var(--ink)]">2 / 10</span>
                          </div>
                          <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-[var(--lavenderAccent)]" style={{ width: '20%' }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] text-[var(--soft)] mb-1">
                            <span>Обрезка фона</span>
                            <span className="font-bold text-[var(--ink)]">12 / 20</span>
                          </div>
                          <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-[var(--sage)]" style={{ width: '60%' }} />
                          </div>
                        </div>
                      </div>

                      <div className="h-px bg-zinc-200/60 dark:bg-zinc-800/60" />

                      <button
                        onClick={() => {
                          setIsMobileProfileMenuOpen(false);
                          showToast('До встречи!', 'Вы вышли из личного кабинета.', 'info');
                        }}
                        className="w-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 py-2 rounded-xl font-semibold text-[var(--ink)] transition-colors cursor-pointer text-center"
                      >
                        Выйти
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* MAIN PANEL TOP NAVBAR Header (Shown on tabs except Moodboard Editor) */}
          {activeTab !== 'moodboard' && (
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 shrink-0">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-semibold tracking-tight text-[var(--ink)]">
                    {activeTab === 'projects' && 'Мои проекты'}
                    {activeTab === 'warehouse' && 'Складской инвентарь'}
                    {activeTab === 'images' && 'Галерея'}
                    {activeTab === 'documents' && 'Мои документы'}
                    {activeTab === 'profile' && 'Профиль бренда'}
                  </h1>
                  
                  {/* Notification Badge Bell */}
                  <div className="relative">
                    <button
                      onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                      className="w-9 h-9 rounded-full glass-panel flex items-center justify-center text-[var(--soft)] hover:text-[var(--ink)] transition-all shadow-sm cursor-pointer"
                    >
                      <Bell className="w-4 h-4" />
                      {unreadNotificationsCount > 0 && (
                        <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-[var(--warn)] shadow-sm" />
                      )}
                    </button>

                    {/* Notifications overlay menu */}
                    <AnimatePresence>
                      {isNotificationsOpen && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setIsNotificationsOpen(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-80 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-[var(--glass-edge)] rounded-2xl shadow-2xl p-4 z-40 space-y-3"
                          >
                            <div className="flex justify-between items-center pb-2 border-b border-[var(--glass-edge)]">
                              <span className="text-xs font-semibold text-[var(--ink)]">События клиентов</span>
                              {unreadNotificationsCount > 0 && (
                                <button
                                  onClick={handleMarkAllNotificationsAsRead}
                                  className="text-xs text-[var(--lavenderAccent)] font-medium hover:underline"
                                >
                                  Прочитать все
                                </button>
                              )}
                            </div>

                            <div className="space-y-2.5 max-h-60 overflow-y-auto">
                              {notifications.map(notif => (
                                <div
                                  key={notif.id}
                                  onClick={() => handleNotificationClick(notif.projectId, notif.id)}
                                  className={`p-2.5 rounded-xl text-left transition-colors cursor-pointer text-xs ${
                                    notif.read ? 'bg-zinc-50/55 dark:bg-zinc-950/20' : 'bg-[var(--lavenderSoft)] border-l-2 border-[var(--lavDeep)]'
                                  }`}
                                >
                                  <div className="flex justify-between font-medium text-[var(--ink)]">
                                    <span>{notif.title}</span>
                                    <span className="text-xs text-[var(--faint)] font-normal">{notif.time}</span>
                                  </div>
                                  <p className="text-[var(--soft)] text-xs mt-0.5 leading-snug">{notif.msg}</p>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Theme Toggle Button */}
                  <button
                    onClick={toggleTheme}
                    className="w-9 h-9 rounded-full glass-panel flex items-center justify-center text-[var(--soft)] hover:text-[var(--lavenderAccent)] transition-colors shadow-sm cursor-pointer"
                  >
                    {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  </button>
                </div>
                
                <p className="text-[var(--soft)] mt-1 text-[13px] leading-relaxed">
                  {activeTab === 'projects' && 'Создавайте макеты, открывайте сметный калькулятор и возвращайтесь к ним в любой момент.'}
                  {activeTab === 'warehouse' && 'Каталог вашего декора, флористики и оборудования. Учет остатков и задействованных в проектах позиций.'}
                  {activeTab === 'images' && 'Ваша галерея загруженных референсов, сгенерированных ИИ фонов, элементов флористики и декора для оформления.'}
                  {activeTab === 'documents' && 'Реквизиты, на кого оформляется договор, шаблоны договора и акта. Только автоматическая генерация и печать, оплата не принимается в сервисе.'}
                  {activeTab === 'profile' && 'Настройки реквизитов и контактов студии для формирования коммерческих предложений.'}
                </p>
              </div>

              {activeTab === 'projects' && (
                <button
                  onClick={() => setIsNewProjOpen(true)}
                  className="shrink-0 bg-[var(--lavDeep)] hover:bg-[var(--lavDeep)]/90 text-white rounded-full px-6 py-3 text-[13px] font-medium shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Новый проект
                </button>
              )}

              {activeTab === 'warehouse' && (
                <button
                  onClick={() => setIsWarehouseAdding(true)}
                  className="shrink-0 bg-[var(--lavDeep)] hover:bg-[var(--lavDeep)]/90 text-white rounded-full px-6 py-3 text-[13px] font-medium shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Новый товар
                </button>
              )}

              {activeTab === 'images' && imagesHeaderActions && (
                <div className="shrink-0 flex items-center gap-2">
                  {imagesHeaderActions}
                </div>
              )}
            </div>
          )}

          {/* QUICK METRICS DASHBOARD ROW */}
          {activeTab === 'projects' && (
            <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              
              {/* Metric 1: В РАБОТЕ */}
              <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md p-2.5 sm:p-3.5 md:p-4 rounded-2xl flex flex-col justify-between border border-[var(--glass-edge)]/60 shadow-2xs hover:bg-white/60 dark:hover:bg-zinc-900/40 transition-all duration-300">
                <div className="flex items-center gap-1.5 text-[var(--faint)] mb-1">
                  <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 shrink-0" />
                  <span className="text-[10px] sm:text-xs font-semibold tracking-wider uppercase truncate">В работе</span>
                </div>
                <div className="my-auto">
                  <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-[var(--ink)] tracking-tight leading-none">{metrics.inProgress}</span>
                </div>
                <span className="text-[10px] sm:text-xs text-[var(--soft)] mt-1 truncate">+1 на неделе</span>
              </div>
              
              {/* Metric 2: СУММА В РАБОТЕ */}
              <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md p-2.5 sm:p-3.5 md:p-4 rounded-2xl flex flex-col justify-between border border-[var(--glass-edge)]/60 shadow-2xs hover:bg-white/60 dark:hover:bg-zinc-900/40 transition-all duration-300">
                <div className="flex items-center gap-1.5 text-[var(--faint)] mb-1">
                  <FolderKanban className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-400 shrink-0" />
                  <span className="text-[10px] sm:text-xs font-semibold tracking-wider uppercase truncate">Сумма</span>
                </div>
                <div className="my-auto flex items-baseline gap-1 flex-wrap">
                  <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-[var(--ink)] tracking-tight leading-none">{(inProgressSum / 1000).toFixed(0)}</span>
                  <span className="text-[10px] sm:text-xs font-medium text-[var(--soft)]">тыс. ₽</span>
                </div>
                <span className="text-[10px] sm:text-xs text-[var(--soft)] mt-1 truncate">активные сметы</span>
              </div>
              
              {/* Metric 3: ВЫПОЛНЕНО */}
              <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md p-2.5 sm:p-3.5 md:p-4 rounded-2xl flex flex-col justify-between border border-[var(--glass-edge)]/60 shadow-2xs hover:bg-white/60 dark:hover:bg-zinc-900/40 transition-all duration-300">
                <div className="flex items-center gap-1.5 text-[var(--faint)] mb-1">
                  <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500 shrink-0" />
                  <span className="text-[10px] sm:text-xs font-semibold tracking-wider uppercase truncate">Выполнено</span>
                </div>
                <div className="my-auto flex items-baseline gap-1 flex-wrap">
                  <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-[var(--ink)] tracking-tight leading-none">{(approvedSum / 1000).toFixed(0)}</span>
                  <span className="text-[10px] sm:text-xs font-medium text-[var(--soft)]">тыс. ₽</span>
                </div>
                <span className="text-[10px] sm:text-xs text-[var(--soft)] mt-1 truncate">закрыто: {projects.filter(p => p.status === 'approved').length}</span>
              </div>
              
              {/* Metric 4: ПРИБЫЛЬ */}
              <div className="bg-emerald-500/10 dark:bg-emerald-950/20 backdrop-blur-md p-2.5 sm:p-3.5 md:p-4 rounded-2xl flex flex-col justify-between border border-emerald-500/20 shadow-2xs hover:bg-emerald-500/15 transition-all duration-300">
                <div className="flex items-center gap-1.5 mb-1 text-emerald-700 dark:text-emerald-300">
                  <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  <span className="text-[10px] sm:text-xs font-semibold tracking-wider uppercase truncate">Прибыль</span>
                </div>
                <div className="my-auto flex items-baseline gap-1 flex-wrap text-emerald-800 dark:text-emerald-200">
                  <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight leading-none">{(profitSum / 1000).toFixed(0)}</span>
                  <span className="text-[10px] sm:text-xs font-medium opacity-90">тыс. ₽</span>
                </div>
                <span className="text-[10px] sm:text-xs text-emerald-700/80 dark:text-emerald-300/80 mt-1 truncate">чистая прибыль</span>
              </div>

            </div>
          )}

          {/* 3. DYNAMIC CONTENT SECTION BY ACTIVE TAB */}
          <div className={`flex-1 ${activeTab === 'moodboard' ? 'flex flex-col min-h-0 h-full overflow-hidden' : ''}`}>
            <AnimatePresence mode="wait">
              
              {/* PROJECTS TAB */}
              {activeTab === 'projects' && (
                <motion.div
                  key="projects-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Header controls */}
                  <div className="space-y-4">
                    {/* Row 1: Categories / Status Filter pills */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        {[
                          { key: 'all', label: 'Все проекты', count: counts.all, dotColor: 'bg-amber-400', badgeStyle: 'bg-amber-500/15 text-amber-700 dark:text-amber-300' },
                          { key: 'progress', label: 'В работе', count: counts.progress, dotColor: 'bg-emerald-500', badgeStyle: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' },
                          { key: 'waiting', label: 'Ждут ответа', count: counts.waiting, dotColor: 'bg-sky-500', badgeStyle: 'bg-sky-500/15 text-sky-700 dark:text-sky-300' },
                          { key: 'approved', label: 'Согласованы', count: counts.approved, dotColor: 'bg-violet-500', badgeStyle: 'bg-violet-500/15 text-violet-700 dark:text-violet-300' },
                          { key: 'archive', label: 'Архив', count: counts.archive, dotColor: 'bg-zinc-400', badgeStyle: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-300' },
                          { key: 'trash', label: 'Корзина', count: counts.trash, dotColor: 'bg-rose-500', badgeStyle: 'bg-rose-500/15 text-rose-700 dark:text-rose-300' }
                        ].map((pill) => {
                          const isActive = projectFilter === pill.key;

                          return (
                            <button
                              key={pill.key}
                              onClick={() => setProjectFilter(pill.key as any)}
                              className={`rounded-full text-xs font-medium tracking-wide transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                                isActive
                                  ? 'bg-[var(--lavDeep)] text-white border border-[var(--lavDeep)] shadow-md shadow-[var(--lavDeep)]/20 px-3.5 py-1.5 scale-[1.02]'
                                  : 'bg-transparent text-[var(--soft)] hover:text-[var(--ink)] border border-transparent px-2 py-1'
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full ${pill.dotColor} shrink-0 ring-2 ring-white/20`} />
                              <span>{pill.label}</span>
                              <span className={`inline-flex items-center justify-center rounded-full text-[11px] font-bold min-w-[20px] h-5 px-1.5 transition-all duration-200 ${
                                isActive
                                  ? 'bg-white/20 text-white backdrop-blur-sm'
                                  : pill.badgeStyle
                              }`}>
                                {pill.count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Row 2: Search Input, Sorting Select, and View Mode Switcher */}
                    <div className="flex items-center justify-between gap-3 bg-white/10 dark:bg-zinc-900/5 p-2 rounded-full border border-[var(--glass-edge)]/40">
                      <div className="flex flex-1 items-center gap-3 max-w-xl">
                        <div className="relative flex-1">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                          <input
                            type="text"
                            placeholder="Поиск по клиенту, площадке..."
                            value={projectQuery}
                            onChange={(e) => setProjectQuery(e.target.value)}
                            className="pl-9 pr-4 py-1.5 rounded-full text-xs bg-white/30 dark:bg-zinc-900/20 border border-zinc-200/50 dark:border-zinc-800/50 text-[var(--ink)] placeholder:text-zinc-400 focus:outline-none focus:border-[var(--lavenderAccent)] w-full transition-colors"
                          />
                        </div>

                        <select
                          value={projectSort}
                          onChange={(e) => setProjectSort(e.target.value as any)}
                          className="text-xs bg-white/30 dark:bg-zinc-900/20 border border-zinc-200/50 dark:border-zinc-800/50 rounded-full py-1.5 px-3.5 text-[var(--ink)] focus:outline-none focus:border-[var(--lavenderAccent)] font-medium transition-colors"
                        >
                          <option value="date">По дате события</option>
                          <option value="name">По алфавиту</option>
                          <option value="status">По статусу</option>
                        </select>
                      </div>

                      {/* View Mode Switcher */}
                      <div className="flex items-center gap-1 bg-zinc-100/80 dark:bg-zinc-800/60 p-1 rounded-full border border-zinc-200/30 dark:border-zinc-800/30 shrink-0">
                        <button
                          onClick={() => setProjectViewMode('grid')}
                          className={`p-1.5 rounded-full transition-all cursor-pointer ${
                            projectViewMode === 'grid'
                              ? 'bg-white dark:bg-zinc-900 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] shadow-sm'
                              : 'text-[var(--soft)] hover:text-[var(--ink)]'
                          }`}
                          title="Отображение карточками"
                        >
                          <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setProjectViewMode('list')}
                          className={`p-1.5 rounded-full transition-all cursor-pointer ${
                            projectViewMode === 'list'
                              ? 'bg-white dark:bg-zinc-900 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] shadow-sm'
                              : 'text-[var(--soft)] hover:text-[var(--ink)]'
                          }`}
                          title="Отображение списком"
                        >
                          <List className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Projects List/Grid Containers */}
                  {processedProjects.length === 0 ? (
                    <div className="py-16 flex flex-col items-center justify-center text-center gap-3 bg-white/40 dark:bg-zinc-900/10 rounded-3xl border border-[var(--glass-edge)]">
                      <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                        <FolderKanban className="w-6 h-6" />
                      </div>
                      <p className="text-[var(--ink)] font-bold text-sm">Ничего не найдено</p>
                      <p className="text-xs text-[var(--faint)] max-w-xs">Попробуйте изменить запрос поиска или выбрать другой фильтр.</p>
                    </div>
                  ) : projectViewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5 w-full animate-fadeIn">
                      {processedProjects.map((p) => {
                        const totalSum = p.estimate.reduce((sum, item) => sum + (item.quantity * item.price), 0);
                        const displayPrice = totalSum > 0 ? totalSum : p.budget;
                        
                        return (
                          <div
                            key={p.id}
                            className="glass-panel glass-interactive rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col justify-between h-full transition-all duration-300 hover:shadow-lg"
                          >
                            {/* Top Image Visual Cover box - Aspect ratio adapted for mobile/tablet */}
                            <div className="aspect-[16/10] sm:aspect-[4/3] w-full relative shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-800/40">
                              <img
                                src={getProjectImage(p.id)}
                                alt={p.name}
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                referrerPolicy="no-referrer"
                              />
                              {/* Overlay Status Badge */}
                              <span className={`absolute top-2.5 left-2.5 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 sm:py-1 rounded-full backdrop-blur-md border flex items-center gap-1 shadow-xs ${
                                p.status === 'progress' ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30' :
                                p.status === 'waiting' ? 'bg-sky-950/40 text-sky-300 border-sky-500/30' :
                                p.status === 'approved' ? 'bg-violet-950/40 text-violet-300 border-violet-500/30' :
                                p.status === 'trash' ? 'bg-rose-950/40 text-rose-300 border-rose-500/30' :
                                'bg-zinc-900/40 text-zinc-300 border-zinc-500/30'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  p.status === 'progress' ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]' :
                                  p.status === 'waiting' ? 'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.9)]' :
                                  p.status === 'approved' ? 'bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.9)]' :
                                  p.status === 'trash' ? 'bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.9)]' : 'bg-zinc-300'
                                }`} />
                                <span>
                                  {p.status === 'progress' ? 'В работе' :
                                   p.status === 'waiting' ? 'Ждет ответа' :
                                   p.status === 'approved' ? 'Согласован' :
                                   p.status === 'trash' ? 'Корзина' : 'Архив'}
                                </span>
                              </span>
                              
                              <button
                                onClick={() => handleTrashClick(p)}
                                className="absolute top-2.5 right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/70 dark:bg-black/30 backdrop-blur flex items-center justify-center text-[var(--ink)] hover:text-red-500 transition-colors z-10"
                                title={p.status === 'trash' ? "Удалить навсегда" : "Переместить в корзину"}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Date Tag */}
                              <span className="absolute bottom-2.5 right-2.5 text-[10px] sm:text-xs bg-zinc-900/60 backdrop-blur-md text-white font-medium px-2.5 py-0.5 sm:py-1 rounded-full border border-white/10 flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-white/80 shrink-0" />
                                <span>{new Date(p.date).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}</span>
                              </span>
                            </div>

                            {/* Info area */}
                            <div className="p-3.5 sm:p-4 md:p-5 space-y-2.5 sm:space-y-3.5 flex-1 flex flex-col justify-between">
                              <div className="space-y-1">
                                {p.client && (
                                  <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] uppercase tracking-wider truncate">
                                    <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 opacity-75" />
                                    <span className="truncate">{p.client}</span>
                                  </div>
                                )}
                                <h3 className="font-bold text-[var(--ink)] text-sm sm:text-base leading-snug truncate">{p.name}</h3>
                                <div className="flex items-center gap-1 text-[11px] sm:text-xs text-[var(--faint)] truncate">
                                  <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 text-zinc-400" />
                                  <span className="truncate">{p.venue}</span>
                                </div>
                              </div>

                              {/* Custom Stepper with connecting line and dots */}
                              <div className="stepper py-1 sm:py-1.5">
                                <div className="relative flex items-center justify-between">
                                  {/* Horizontal track line */}
                                  <div className="absolute top-1/2 -translate-y-1/2 left-2 right-2 h-[2px] bg-zinc-200 dark:bg-zinc-800/60 z-0 rounded-full" />
                                  {/* Filled track line progress */}
                                  <div
                                    className="absolute top-1/2 -translate-y-1/2 left-2 h-[2px] bg-[var(--sage)] z-0 rounded-full transition-all duration-500"
                                    style={{ width: `${(p.currentStep / 4) * 96}%` }}
                                  />
                                  
                                  {stepsList.map((stepName, idx) => {
                                    const isDone = idx < p.currentStep;
                                    const isCurrent = idx === p.currentStep;
                                    return (
                                      <div key={idx} className="step flex flex-col items-center relative z-10 flex-1">
                                        <div
                                          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 transition-all duration-300 ${
                                            isDone
                                              ? 'bg-[var(--sage)] border-[var(--sage)]'
                                              : isCurrent
                                              ? 'bg-[var(--lavenderAccent)] border-[var(--lavenderAccent)] shadow-[0_0_0_3px_rgba(192,142,244,0.25)]'
                                              : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700'
                                          }`}
                                        />
                                        <span
                                          className={`hidden sm:block text-[10px] sm:text-xs font-medium tracking-tight mt-1 transition-colors duration-300 truncate ${
                                            isDone || isCurrent
                                              ? 'text-[var(--ink)] font-medium'
                                              : 'text-[var(--faint)]'
                                          }`}
                                        >
                                          {stepName}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                                {/* Compact Mobile Stage Label */}
                                <div className="sm:hidden text-center text-[10px] font-semibold text-[var(--soft)] mt-1.5">
                                  Этап {p.currentStep + 1}/4: <span className="text-[var(--ink)]">{stepsList[p.currentStep] || 'Завершено'}</span>
                                </div>
                              </div>

                              {/* Footer stats metadata */}
                              <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/40">
                                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-[var(--soft)]">
                                  <Calendar className="w-3 h-3 text-zinc-400 shrink-0" />
                                  <span>{new Date(p.date).toLocaleDateString('ru', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </span>
                                <span className="inline-flex items-center text-[10px] sm:text-xs text-[var(--lavDeep)] dark:text-purple-300 bg-[var(--lavenderSoft)]/80 dark:bg-purple-950/40 px-2 py-0.5 rounded-full font-bold">
                                  {displayPrice.toLocaleString('ru')} ₽
                                </span>
                              </div>

                              {/* Buttons */}
                              <div className="flex gap-2 pt-1">
                                {p.status === 'trash' ? (
                                  <>
                                    <button
                                      onClick={() => {
                                        setProjects(prev => prev.map(item => item.id === p.id ? { ...item, status: 'progress' as const } : item));
                                        showToast('Проект восстановлен', `Проект «${p.name}» возвращен в работу.`, 'success');
                                      }}
                                      className="flex-1 bg-[var(--sage)] hover:opacity-90 text-white rounded-xl sm:rounded-full py-2 sm:py-2.5 text-xs font-semibold transition-all cursor-pointer text-center"
                                    >
                                      Восстановить
                                    </button>
                                    <button
                                      onClick={() => {
                                        setProjects(prev => prev.filter(item => item.id !== p.id));
                                        showToast('Удалено навсегда', `Проект «${p.name}» удален окончательно.`, 'warn');
                                      }}
                                      className="w-8 sm:w-10 shrink-0 rounded-xl sm:rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 transition-all flex items-center justify-center cursor-pointer"
                                      title="Удалить навсегда"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => {
                                        setSelectedProject(p);
                                        setActiveTab('projects');
                                      }}
                                      className="flex-1 bg-[var(--lavDeep)] hover:opacity-90 text-white rounded-xl sm:rounded-full py-2 sm:py-2.5 text-xs font-semibold transition-all cursor-pointer"
                                    >
                                      Открыть проект
                                    </button>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(`https://fleur-decor.ru/brief/${p.id}`);
                                        showToast('Бриф скопирован', 'Отправьте ссылку клиенту для прохождения опроса.', 'success');
                                      }}
                                      className="w-8 sm:w-10 shrink-0 rounded-xl sm:rounded-full bg-white/30 hover:bg-white/50 dark:bg-white/5 border border-[var(--glass-edge)] text-[var(--ink)] transition-all flex items-center justify-center cursor-pointer"
                                      title="Копировать бриф"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 animate-fadeIn">
                      {processedProjects.map((p) => {
                        const totalSum = p.estimate.reduce((sum, item) => sum + (item.quantity * item.price), 0);
                        const displayPrice = totalSum > 0 ? totalSum : p.budget;
                        const projectImg = getProjectImage(p.id);

                        return (
                          <React.Fragment key={p.id}>
                            {/* Mobile Card Layout (Strict adherence to Figma screenshot) */}
                            <div
                              className="md:hidden flex flex-row items-stretch border border-white/90 dark:border-zinc-800/90 shadow-lg text-left bg-white/75 dark:bg-zinc-900/75 h-[142px] rounded-[24px] overflow-hidden w-full relative"
                            >
                              {/* Left Image Section */}
                              <div className="w-[135px] shrink-0 relative overflow-hidden bg-zinc-100 dark:bg-zinc-850">
                                <img
                                  src={projectImg}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                {/* Status Badge */}
                                <span className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-lg border flex items-center gap-1.5 shadow-md ${
                                  p.status === 'progress' ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30' :
                                  p.status === 'waiting' ? 'bg-sky-950/40 text-sky-300 border-sky-500/30' :
                                  p.status === 'approved' ? 'bg-violet-950/40 text-violet-300 border-violet-500/30' :
                                  p.status === 'trash' ? 'bg-rose-950/40 text-rose-300 border-rose-500/30' :
                                  'bg-zinc-900/40 text-zinc-300 border-zinc-500/30'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                    p.status === 'progress' ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]' :
                                    p.status === 'waiting' ? 'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.9)]' :
                                    p.status === 'approved' ? 'bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.9)]' :
                                    p.status === 'trash' ? 'bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.9)]' : 'bg-zinc-300'
                                  }`} />
                                  <span>
                                    {p.status === 'approved' ? 'Согласован' :
                                     p.status === 'progress' ? 'В работе' :
                                     p.status === 'waiting' ? 'Ждет ответа' :
                                     p.status === 'trash' ? 'Корзина' : 'Архив'}
                                  </span>
                                </span>

                                <button
                                  onClick={() => handleTrashClick(p)}
                                  className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/75 dark:bg-black/35 backdrop-blur flex items-center justify-center text-[var(--ink)] hover:text-red-500 transition-colors z-10"
                                  title={p.status === 'trash' ? "Удалить навсегда" : "Переместить в корзину"}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>

                                {/* Date Tag */}
                                <span className="absolute bottom-2.5 left-2.5 text-[10px] bg-black/50 backdrop-blur-md text-white font-medium px-2 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
                                  <Calendar className="w-2.5 h-2.5 text-white/80 shrink-0" />
                                  <span>{new Date(p.date).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}</span>
                                </span>
                              </div>

                              {/* Right Content Section */}
                              <div className="p-3.5 pr-4 flex flex-col justify-between flex-1 min-w-0">
                                {/* Row 1: Title, Venue, Copy button */}
                                <div className="flex items-start justify-between gap-1">
                                  <div className="min-w-0 space-y-0.5">
                                    {p.client && (
                                      <div className="flex items-center gap-1 text-[10px] font-semibold text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] uppercase tracking-wider truncate">
                                        <User className="w-3 h-3 shrink-0 opacity-75" />
                                        <span className="truncate">{p.client}</span>
                                      </div>
                                    )}
                                    <h3 className="font-bold text-[14px] text-[var(--ink)] leading-tight truncate">
                                      {p.name}
                                    </h3>
                                    <div className="flex items-center gap-1 text-[11px] text-[var(--soft)] truncate">
                                      <MapPin className="w-3 h-3 shrink-0 text-zinc-400" />
                                      <span className="truncate">{p.venue}</span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(`https://fleur-decor.ru/brief/${p.id}`);
                                      showToast('Бриф скопирован', 'Отправьте ссылку клиенту для прохождения опроса.', 'success');
                                    }}
                                    className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[var(--ink)] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                                    title="Копировать бриф"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Row 2: Custom Compact Stepper */}
                                <div className="relative flex items-center justify-between w-32 py-1">
                                  {/* Background Line */}
                                  <div className="absolute left-1 right-1 top-1/2 -translate-y-1/2 h-[2px] bg-zinc-100 dark:bg-zinc-800" />
                                  {/* Progress Line */}
                                  <div
                                    className="absolute left-1 top-1/2 -translate-y-1/2 h-[2px] bg-[#0A7B5C] transition-all duration-500"
                                    style={{ width: `${(p.currentStep / 4) * 100}%` }}
                                  />
                                  {Array.from({ length: 5 }).map((_, idx) => {
                                    const isDone = idx < p.currentStep;
                                    const isCurrent = idx === p.currentStep;
                                    return (
                                      <div key={idx} className="relative z-10 flex items-center justify-center">
                                        <div
                                          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                                            isDone
                                              ? 'bg-[#0A7B5C]'
                                              : isCurrent
                                              ? 'bg-[#8B5CF6] ring-[4px] ring-[#8B5CF6]/20'
                                              : 'bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800'
                                          }`}
                                        />
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Row 3: Metadata tags on left, Open button on right */}
                                <div className="flex items-end justify-between gap-2 mt-1">
                                  <div className="flex flex-col gap-0.5 min-w-0">
                                    <span className="text-[9px] text-[var(--soft)] bg-zinc-100/70 dark:bg-zinc-800/40 px-2.5 py-0.5 rounded-full w-max truncate">
                                      {new Date(p.date).toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                    <span className="text-[9px] text-[var(--soft)] bg-zinc-100/70 dark:bg-zinc-800/40 px-2.5 py-0.5 rounded-full w-max font-semibold truncate">
                                      Бюджет: {displayPrice.toLocaleString('ru')} ₽
                                    </span>
                                  </div>
                                  {p.status === 'trash' ? (
                                    <div className="flex gap-1.5 shrink-0">
                                      <button
                                        onClick={() => {
                                          setProjects(prev => prev.map(item => item.id === p.id ? { ...item, status: 'progress' as const } : item));
                                          showToast('Проект восстановлен', `Проект «${p.name}» возвращен в работу.`, 'success');
                                        }}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold text-[10px] py-1.5 px-3 shadow-sm transition-colors cursor-pointer"
                                      >
                                        Восст.
                                      </button>
                                      <button
                                        onClick={() => {
                                          setProjects(prev => prev.filter(item => item.id !== p.id));
                                          showToast('Удалено навсегда', `Проект «${p.name}» удален окончательно.`, 'warn');
                                        }}
                                        className="bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold text-[10px] py-1.5 px-2 shadow-sm transition-colors cursor-pointer"
                                        title="Удалить навсегда"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setSelectedProject(p);
                                        setActiveTab('projects');
                                      }}
                                      className="bg-[#5D3E8D] hover:bg-[#4E3175] text-white rounded-full font-semibold text-[11px] py-1.5 px-5 shadow-sm transition-colors cursor-pointer shrink-0"
                                    >
                                      Открыть
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>

                             {/* Tablet Card Layout (Unchanged structure, shown only on tablet) */}
                             <div
                               className="glass-panel p-4 rounded-[20px] hidden md:flex lg:hidden items-center gap-5 border border-[var(--glass-edge)]/70 hover:border-[var(--lavenderAccent)]/50 transition-all duration-300 w-full text-left bg-white dark:bg-zinc-900/25 group"
                             >
                               {/* Left part - Small preview - horizontal 4:3 Ratio */}
                               <div className="w-24 sm:w-32 aspect-[4/3] rounded-xl overflow-hidden shrink-0 relative bg-zinc-100/10 dark:bg-zinc-800/20 border border-[var(--glass-edge)]/40">
                                 <img
                                   src={projectImg}
                                   alt={p.name}
                                   className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                   referrerPolicy="no-referrer"
                                 />
                                 <span className={`absolute top-1.5 left-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-lg border flex items-center gap-1 shadow-md ${
                                   p.status === 'progress' ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30' :
                                   p.status === 'waiting' ? 'bg-sky-950/40 text-sky-300 border-sky-500/30' :
                                   p.status === 'approved' ? 'bg-violet-950/40 text-violet-300 border-violet-500/30' :
                                   p.status === 'trash' ? 'bg-rose-950/40 text-rose-300 border-rose-500/30' :
                                   'bg-zinc-900/40 text-zinc-300 border-zinc-500/30'
                                 }`}>
                                   <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                     p.status === 'progress' ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]' :
                                     p.status === 'waiting' ? 'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.9)]' :
                                     p.status === 'approved' ? 'bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.9)]' :
                                     p.status === 'trash' ? 'bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.9)]' : 'bg-zinc-300'
                                   }`} />
                                   <span>
                                     {p.status === 'progress' ? 'В работе' :
                                      p.status === 'waiting' ? 'Ждет ответа' :
                                      p.status === 'approved' ? 'Согласован' :
                                      p.status === 'trash' ? 'Корзина' : 'Архив'}
                                   </span>
                                 </span>

                                 <button
                                   onClick={() => handleTrashClick(p)}
                                   className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/75 dark:bg-black/35 backdrop-blur flex items-center justify-center text-[var(--ink)] hover:text-red-500 transition-colors z-10"
                                   title={p.status === 'trash' ? "Удалить навсегда" : "Переместить в корзину"}
                                 >
                                   <Trash2 className="w-3.5 h-3.5" />
                                 </button>
                               </div>

                               {/* Right part - Details */}
                               <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                                 <div className="space-y-1 min-w-0">
                                   <h3 className="font-medium text-[var(--ink)] text-base leading-tight truncate group-hover:text-[var(--lavDeep)] dark:group-hover:text-[var(--lavenderAccent)] transition-colors duration-300">{p.name}</h3>
                                   <p className="text-xs text-[var(--faint)] truncate">{p.venue}</p>
                                   <div className="flex flex-wrap items-center gap-2 mt-1">
                                     <span className="text-xs text-[var(--soft)] bg-zinc-100 dark:bg-zinc-800/60 px-2 py-0.5 rounded">
                                       {new Date(p.date).toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' })}
                                     </span>
                                     <span className="text-xs text-[var(--soft)] bg-zinc-100 dark:bg-zinc-800/60 px-2 py-0.5 rounded font-medium">
                                       Бюджет: {displayPrice.toLocaleString('ru')} ₽
                                     </span>
                                   </div>
                                 </div>
                                 
                                 {/* Stepper progress in the middle (only on medium screens or wider) */}
                                 <div className="hidden md:block w-48 shrink-0">
                                   <div className="flex items-center justify-between relative py-1">
                                     <div className="absolute top-[8px] left-1 right-1 h-[2px] bg-zinc-100 dark:bg-zinc-800/60 z-0 rounded-full" />
                                     <div
                                       className="absolute top-[8px] left-1 h-[2px] bg-[var(--sage)] z-0 rounded-full transition-all duration-500"
                                       style={{ width: `${(p.currentStep / 4) * 92}%` }}
                                     />
                                     {stepsList.map((stepName, idx) => {
                                       const isDone = idx < p.currentStep;
                                       const isCurrent = idx === p.currentStep;
                                       return (
                                         <div key={idx} className="flex flex-col items-center gap-1 relative z-10 flex-1">
                                           <div
                                             className={`w-[8px] h-[8px] rounded-full border transition-all duration-300 ${
                                               isDone
                                                 ? 'bg-[var(--sage)] border-[var(--sage)]'
                                                 : isCurrent
                                                 ? 'bg-[var(--lavenderAccent)] border-[var(--lavenderAccent)]'
                                                 : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700'
                                             }`}
                                             title={stepName}
                                           />
                                         </div>
                                       );
                                     })}
                                   </div>
                                   <div className="text-center text-xs text-[var(--faint)] mt-1">
                                     Этап: {stepsList[p.currentStep] || 'Завершен'}
                                   </div>
                                 </div>

                                 {/* Action buttons */}
                                 <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                                   {p.status === 'trash' ? (
                                     <>
                                       <button
                                         onClick={() => {
                                           setProjects(prev => prev.map(item => item.id === p.id ? { ...item, status: 'progress' as const } : item));
                                           showToast('Проект восстановлен', `Проект «${p.name}» возвращен в работу.`, 'success');
                                         }}
                                         className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2 text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
                                       >
                                         Восстановить
                                       </button>
                                       <button
                                         onClick={() => {
                                           setProjects(prev => prev.filter(item => item.id !== p.id));
                                           showToast('Удалено навсегда', `Проект «${p.name}» удален окончательно.`, 'warn');
                                         }}
                                         className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 transition-all flex items-center justify-center cursor-pointer shrink-0"
                                         title="Удалить навсегда"
                                       >
                                         <Trash2 className="w-3.5 h-3.5" />
                                       </button>
                                     </>
                                   ) : (
                                     <>
                                       <button
                                         onClick={() => {
                                           setSelectedProject(p);
                                           setActiveTab('projects');
                                         }}
                                         className="flex-1 sm:flex-initial bg-[var(--lavDeep)] hover:opacity-90 text-white rounded-xl px-4 py-2 text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
                                       >
                                         Открыть проект
                                       </button>
                                       <button
                                         onClick={() => {
                                           navigator.clipboard.writeText(`https://fleur-decor.ru/brief/${p.id}`);
                                           showToast('Бриф скопирован', 'Отправьте ссылку клиенту для прохождения опроса.', 'success');
                                         }}
                                         className="p-2 rounded-xl bg-white/30 hover:bg-white/50 dark:bg-white/5 border border-[var(--glass-edge)] text-[var(--ink)] transition-all flex items-center justify-center cursor-pointer shrink-0"
                                         title="Копировать бриф"
                                       >
                                         <Copy className="w-3.5 h-3.5" />
                                       </button>
                                     </>
                                   )}
                                 </div>
                               </div>
                             </div>

                             {/* Desktop Card Layout (Strictly matches the layout in the second screenshot) */}
                             <div
                               className="hidden lg:flex flex-row items-stretch border border-zinc-200/85 dark:border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.03)] bg-white dark:bg-zinc-900/40 backdrop-blur-md h-[168px] rounded-[24px] overflow-hidden w-full relative group hover:border-[var(--lavenderAccent)]/40 transition-all duration-300 text-left"
                             >
                               {/* Left Image Section */}
                               <div className="w-[180px] shrink-0 relative overflow-hidden bg-zinc-100 dark:bg-zinc-850">
                                 <img
                                   src={projectImg}
                                   alt={p.name}
                                   className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                                   referrerPolicy="no-referrer"
                                 />
                                 {/* Status Badge */}
                                 <span className={`absolute top-3.5 left-3.5 text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-lg border flex items-center gap-1.5 shadow-md ${
                                   p.status === 'progress' ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30' :
                                   p.status === 'waiting' ? 'bg-sky-950/40 text-sky-300 border-sky-500/30' :
                                   p.status === 'approved' ? 'bg-violet-950/40 text-violet-300 border-violet-500/30' :
                                   p.status === 'trash' ? 'bg-rose-950/40 text-rose-300 border-rose-500/30' :
                                   'bg-zinc-900/40 text-zinc-300 border-zinc-500/30'
                                 }`}>
                                   <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                     p.status === 'progress' ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]' :
                                     p.status === 'waiting' ? 'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.9)]' :
                                     p.status === 'approved' ? 'bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.9)]' :
                                     p.status === 'trash' ? 'bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.9)]' : 'bg-zinc-300'
                                   }`} />
                                   <span>
                                     {p.status === 'approved' ? 'Согласован' :
                                      p.status === 'progress' ? 'В работе' :
                                      p.status === 'waiting' ? 'Ждет ответа' :
                                      p.status === 'trash' ? 'Корзина' : 'Архив'}
                                   </span>
                                 </span>

                                 <button
                                   onClick={() => handleTrashClick(p)}
                                   className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/75 dark:bg-black/35 backdrop-blur flex items-center justify-center text-[var(--ink)] hover:text-red-500 transition-colors z-10"
                                   title={p.status === 'trash' ? "Удалить навсегда" : "Переместить в корзину"}
                                 >
                                   <Trash2 className="w-3.5 h-3.5" />
                                 </button>

                                 {/* Date Tag on Bottom Right */}
                                 <span className="absolute bottom-3.5 right-3.5 text-[11px] bg-black/50 backdrop-blur-md text-white font-medium px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                                   <Calendar className="w-3 h-3 text-white/80 shrink-0" />
                                   <span>{new Date(p.date).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}</span>
                                 </span>
                               </div>

                               {/* Right Content Section */}
                               <div className="p-4 pr-5 flex flex-col justify-between flex-1 min-w-0">
                                 {/* Row 1: Title, Venue on left, copy brief button on right */}
                                 <div className="flex items-start justify-between gap-3">
                                   <div className="min-w-0 space-y-0.5">
                                     {p.client && (
                                       <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] uppercase tracking-wider truncate">
                                         <User className="w-3.5 h-3.5 shrink-0 opacity-75" />
                                         <span className="truncate">{p.client}</span>
                                       </div>
                                     )}
                                     <h3 className="font-bold text-[16px] text-[var(--ink)] leading-tight truncate">
                                       {p.name}
                                     </h3>
                                     <div className="flex items-center gap-1.5 text-[12px] text-[var(--soft)] truncate">
                                       <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                                       <span className="truncate">{p.venue}</span>
                                     </div>
                                   </div>
                                   <button
                                     onClick={() => {
                                       navigator.clipboard.writeText(`https://fleur-decor.ru/brief/${p.id}`);
                                       showToast('Бриф скопирован', 'Отправьте ссылку клиенту для прохождения опроса.', 'success');
                                     }}
                                     className="w-[38px] h-[38px] rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors shrink-0 cursor-pointer shadow-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                                     title="Копировать бриф"
                                   >
                                     <Copy className="w-4 h-4" />
                                   </button>
                                 </div>

                                 {/* Row 2: Custom Horizontal Stepper with labels underneath */}
                                 <div className="relative px-[10px] mt-1">
                                   {/* Background Line */}
                                   <div className="absolute left-[15px] right-[15px] top-[5px] h-[2px] bg-zinc-200 dark:bg-zinc-800/80" />
                                   {/* Progress Line */}
                                   <div
                                     className="absolute left-[15px] top-[5px] h-[2px] bg-[#0A7B5C] transition-all duration-500"
                                     style={{ width: `${p.currentStep * 25}%` }}
                                   />
                                   <div className="flex items-center justify-between relative z-10">
                                     {stepsList.map((stepName, idx) => {
                                       const isDone = idx < p.currentStep;
                                       const isCurrent = idx === p.currentStep;
                                       return (
                                         <div key={idx} className="flex flex-col items-center select-none">
                                           <div
                                             className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                                               isDone
                                                 ? 'bg-[#0A7B5C]'
                                                 : isCurrent
                                                 ? 'bg-[#8B5CF6] ring-[4px] ring-[#8B5CF6]/20'
                                                 : 'bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800'
                                             }`}
                                           />
                                           <span className={`text-[10px] mt-1.5 font-bold transition-colors ${
                                             isCurrent
                                               ? 'text-[#8B5CF6]'
                                               : isDone
                                               ? 'text-zinc-700 dark:text-zinc-300'
                                               : 'text-zinc-400 dark:text-zinc-500'
                                           }`}>
                                             {stepName}
                                           </span>
                                         </div>
                                       );
                                     })}
                                   </div>
                                 </div>

                                 {/* Row 3: Metadata chips on left, "Открыть проект" on right */}
                                 <div className="flex items-center justify-between gap-4 mt-1.5">
                                   <div className="flex items-center gap-2 min-w-0">
                                     <span className="text-[11px] text-zinc-600 dark:text-zinc-400 bg-[#F8F9FA] dark:bg-zinc-850 px-3 py-1.5 rounded-xl border border-zinc-100 dark:border-zinc-800/40 truncate">
                                       {new Date(p.date).toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' })}
                                     </span>
                                     <span className="text-[11px] text-zinc-600 dark:text-zinc-400 bg-[#F8F9FA] dark:bg-zinc-850 px-3 py-1.5 rounded-xl border border-zinc-100 dark:border-zinc-800/40 font-bold truncate">
                                       Бюджет: {displayPrice.toLocaleString('ru')} ₽
                                     </span>
                                   </div>
                                   {p.status === 'trash' ? (
                                     <div className="flex gap-2 shrink-0">
                                       <button
                                         onClick={() => {
                                           setProjects(prev => prev.map(item => item.id === p.id ? { ...item, status: 'progress' as const } : item));
                                           showToast('Проект восстановлен', `Проект «${p.name}» возвращен в работу.`, 'success');
                                         }}
                                         className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold text-[12px] py-2 px-5.5 shadow-sm transition-colors cursor-pointer"
                                       >
                                         Восстановить
                                       </button>
                                       <button
                                         onClick={() => {
                                           setProjects(prev => prev.filter(item => item.id !== p.id));
                                           showToast('Удалено навсегда', `Проект «${p.name}» удален окончательно.`, 'warn');
                                         }}
                                         className="bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold text-[12px] py-2 px-3 shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                                       >
                                         <Trash2 className="w-4 h-4" /> Удалить
                                       </button>
                                     </div>
                                   ) : (
                                     <button
                                       onClick={() => {
                                         setSelectedProject(p);
                                         setActiveTab('projects');
                                       }}
                                       className="bg-[#5D3E8D] hover:bg-[#4E3175] text-white rounded-full font-semibold text-[12px] py-2 px-5.5 shadow-sm transition-colors cursor-pointer shrink-0"
                                     >
                                       Открыть проект
                                     </button>
                                   )}
                                 </div>
                               </div>
                             </div>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* MOODBOARD ARCH VISUAL CONSTRUCTOR */}
              {activeTab === 'moodboard' && (
                <motion.div
                  key="moodboard-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 flex flex-col min-h-0 h-full"
                >
                  <MoodboardEditor
                    projects={projects}
                    onSaveToProject={handleAttachVisualizerToProject}
                    showToast={showToast}
                    setHeaderActions={setMoodboardHeaderActions}
                    onAddAiImage={(url: string, prompt: string, projectName: string) => {
                      const newImage: ImageItem = {
                        id: 'ai_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
                        title: `ИИ: ${prompt.trim()}`,
                        category: 'render',
                        url: url,
                        bgRemoved: false,
                        isAiGenerated: true,
                        projectName: projectName
                      };
                      setImages(prev => [newImage, ...prev]);
                    }}
                  />
                </motion.div>
              )}

              {/* WAREHOUSE INVENTORY TAB */}
              {activeTab === 'warehouse' && (
                <motion.div
                  key="warehouse-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  <WarehouseTab
                    items={warehouseItems}
                    onUpdateItems={setWarehouseItems}
                    showToast={showToast}
                    isAdding={isWarehouseAdding}
                    setIsAdding={setIsWarehouseAdding}
                  />
                </motion.div>
              )}

              {/* IMAGES & AI BG REMOVER TAB */}
              {activeTab === 'images' && (
                <motion.div
                  key="images-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  <ImagesTab
                    images={images}
                    onUpdateImages={setImages}
                    showToast={showToast}
                    setHeaderActions={setImagesHeaderActions}
                  />
                </motion.div>
              )}

              {/* DOCUMENTS CHECKLIST TAB */}
              {activeTab === 'documents' && (
                <motion.div
                  key="documents-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  <DocumentsTab
                    showToast={showToast}
                  />
                </motion.div>
              )}

              {/* BRAND PROFILE SETTINGS TAB */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProfileTab
                    showToast={showToast}
                  />
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </main>

        {/* RIGHT SIDEBAR (Collapsible, dynamic panel - Narrowed to w-72 to fit perfectly) */}
        <aside
          className={`shrink-0 hidden lg:flex flex-col sticky top-0 h-screen border-l backdrop-blur-xl z-20 transition-all duration-300 overflow-hidden ${
            isRightSidebarExpanded ? 'w-72 p-5' : 'w-20 items-center py-5 px-3'
          }`}
          style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)' }}
        >
          {/* EXPANDED CONTENT (Calendar First, then Tasks) */}
          {isRightSidebarExpanded ? (
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-6 select-none pr-1 custom-scrollbar">
              
              {/* Calendar Widget (Top Section) */}
              <div className="space-y-3">
                <h2 className="text-base font-semibold text-[var(--ink)] tracking-tight flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[var(--lavenderAccent)]" />
                    <span>Календарь событий</span>
                  </div>
                  <button
                    onClick={() => setIsRightSidebarExpanded(false)}
                    title="Свернуть боковую панель"
                    className="w-8 h-8 rounded-full hover:bg-white/20 dark:hover:bg-black/20 flex items-center justify-center text-[var(--soft)] hover:text-[var(--ink)] cursor-pointer transition-colors shrink-0"
                  >
                    <ChevronsRight className="w-4 h-4 text-[var(--soft)]" />
                  </button>
                </h2>
                
                <div className="glass-panel p-4 rounded-2xl flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--ink)]">Июль 2026</span>
                    <div className="flex gap-1">
                      <button onClick={() => showToast('Календарь', 'Прошлый месяц', 'info')} className="p-1 text-[var(--faint)] hover:text-[var(--ink)] text-xs focus:outline-none"><ChevronDown className="w-3 h-3 rotate-90" /></button>
                      <button onClick={() => showToast('Календарь', 'Следующий месяц', 'info')} className="p-1 text-[var(--faint)] hover:text-[var(--ink)] text-xs focus:outline-none"><ChevronDown className="w-3 h-3 -rotate-90" /></button>
                    </div>
                  </div>
                  
                  {/* Week days */}
                  <div className="grid grid-cols-7 text-center text-xs font-semibold text-[var(--faint)] border-b pb-1.5" style={{ borderColor: 'var(--line)' }}>
                    <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
                  </div>
                  
                  {/* Days grid with prominent marks and dynamic click event */}
                  <div className="grid grid-cols-7 text-center gap-y-2 text-xs font-medium text-[var(--soft)] mt-1">
                    {calendarDays.map((day, idx) => {
                      const isSelected = selectedCalendarDay === day.num && day.currentMonth;
                      const hasEvent = day.currentMonth && calendarEvents[day.num];
                      
                      let bgStyle = '';
                      let textStyle = day.currentMonth ? 'text-[var(--soft)]' : 'text-[var(--faint)] opacity-30';
                      let dotStyle = '';

                      if (day.currentMonth && day.eventType) {
                        if (day.eventType === 'warn') {
                          bgStyle = 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-200 border border-rose-500/40 font-medium';
                          dotStyle = 'bg-rose-600';
                        } else if (day.eventType === 'indigo') {
                          bgStyle = 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-200 border border-indigo-500/40 font-medium';
                          dotStyle = 'bg-indigo-600';
                        } else if (day.eventType === 'lavender') {
                          bgStyle = 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-200 border border-purple-500/40 font-medium';
                          dotStyle = 'bg-purple-600';
                        } else if (day.eventType === 'sage') {
                          bgStyle = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200 border border-emerald-500/40 font-medium';
                          dotStyle = 'bg-emerald-600';
                        }
                      }

                      return (
                        <div
                          key={idx}
                          onClick={() => day.currentMonth && setSelectedCalendarDay(day.num)}
                          className={`calendar-day-cell relative cursor-pointer p-1.5 rounded-xl transition-all flex flex-col items-center justify-center hover:bg-white/40 dark:hover:bg-black/30 ${bgStyle} ${textStyle} ${
                            isSelected ? 'ring-2 ring-[var(--lavenderAccent)] scale-[1.04]' : ''
                          }`}
                        >
                          {day.num}
                          {hasEvent && <span className={`w-1 h-1 rounded-full mt-0.5 ${dotStyle || 'bg-[var(--lavDeep)]'}`} />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Dynamic event display area */}
                <div className="glass-panel p-3.5 rounded-2xl bg-white/20 dark:bg-black/20 border border-[var(--glass-edge)] mt-2">
                  <p className="text-xs font-semibold text-[var(--ink)] uppercase tracking-wider mb-2">
                    События: {selectedCalendarDay} июля 2026
                  </p>
                  {calendarEvents[selectedCalendarDay] ? (
                    <div className="space-y-2">
                      {calendarEvents[selectedCalendarDay].map((ev, i) => {
                        let borderCol = 'var(--lavenderAccent)';
                        let bgCol = 'var(--lavenderSoft)';
                        if (ev.type === 'warn') { borderCol = 'var(--warn)'; bgCol = 'var(--warnSoft)'; }
                        if (ev.type === 'sage') { borderCol = 'var(--sage)'; bgCol = 'var(--sageSoft)'; }
                        if (ev.type === 'indigo') { borderCol = '#6366F1'; bgCol = 'rgba(99, 102, 241, 0.1)'; }

                        return (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl border-l-2 text-[var(--ink)] transition-all duration-300 hover:translate-x-1"
                            style={{ borderLeftColor: borderCol, backgroundColor: bgCol }}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-xs">{ev.title}</span>
                              <span className="text-xs font-medium opacity-85">{ev.time}</span>
                            </div>
                            <p className="text-xs text-[var(--soft)]">{ev.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[11px] text-[var(--soft)] italic py-1">Нет запланированных событий.</p>
                  )}
                </div>
              </div>

              <div className="h-px bg-[var(--glass-edge)]" style={{ background: 'var(--line)' }} />

              {/* Tasks list (styled ultra-compactly matching the screenshot) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-[var(--ink)] tracking-tight flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-[var(--lavenderAccent)]" />
                    <span>Задачи</span>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-[var(--lavenderSoft)] text-[var(--lavDeep)] dark:bg-purple-950/40 dark:text-[var(--lavenderAccent)] rounded-full select-none shrink-0">
                      {tasks.filter(t => !t.completed).length}
                    </span>
                  </h2>
                </div>

                <div className="space-y-2.5">
                  {tasks.map(task => (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(task.id)}
                      className={`glass-panel py-2 px-3 rounded-xl flex items-center gap-3 transition-all duration-300 hover:scale-[1.01] cursor-pointer ${
                        task.completed ? 'opacity-40 scale-[0.98]' : ''
                      }`}
                    >
                      {/* Circular Checkbox */}
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          task.completed 
                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                            : 'border-zinc-300 dark:border-zinc-700 bg-white/50 dark:bg-black/10 hover:border-[var(--lavenderAccent)]'
                        }`}
                      >
                        {task.completed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                      </div>

                      {/* Text details */}
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-xs font-medium text-[var(--ink)] leading-snug truncate ${task.completed ? 'line-through text-[var(--faint)]' : ''}`}>
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-[var(--soft)] mt-0.5 font-medium">
                          <span className="truncate">{task.projectRelation}</span>
                          <span>•</span>
                          <span 
                            className="px-1.5 py-0.5 rounded text-xs font-medium shrink-0"
                            style={{
                              backgroundColor: task.color === 'warn' ? 'var(--warnSoft)' : task.color === 'sage' ? 'var(--sageSoft)' : 'var(--lavenderSoft)',
                              color: task.color === 'warn' ? 'var(--warn)' : task.color === 'sage' ? 'var(--sage)' : 'var(--lavDeep)'
                            }}
                          >
                            {task.dueDate}
                          </span>
                        </div>
                      </div>

                      {/* Right category indicator dot */}
                      <span 
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          task.color === 'warn' ? 'bg-[var(--warn)]' : task.color === 'sage' ? 'bg-[var(--sage)]' : 'bg-[var(--lavenderAccent)]'
                        }`} 
                      />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            /* COLLAPSED CONTENT (Shown only when sidebar is w-20) */
            <div className="flex flex-col items-center gap-4.5 w-full">
              {/* Collapsed Toggle Button aligned analogously to left sidebar */}
              <button
                onClick={() => setIsRightSidebarExpanded(true)}
                title="Развернуть боковую панель"
                className="w-8 h-8 rounded-full hover:bg-white/20 dark:hover:bg-black/20 flex items-center justify-center text-[var(--soft)] hover:text-[var(--ink)] cursor-pointer transition-all mb-1"
              >
                <ChevronsLeft className="w-4 h-4 text-[var(--soft)]" />
              </button>

              <div className="w-8 h-px bg-[var(--glass-edge)]" style={{ background: 'var(--line)' }} />

              {/* Collapsed Task Indicator with Badge */}
              <button
                onClick={() => setIsRightSidebarExpanded(true)}
                title={`Задачи на сегодня (${tasks.filter(t => !t.completed).length} активных)`}
                className="relative w-10 h-10 rounded-full bg-white/20 dark:bg-black/20 hover:bg-[var(--lavenderSoft)] dark:hover:bg-zinc-800 flex items-center justify-center text-[var(--soft)] hover:text-[var(--lavDeep)] transition-all cursor-pointer"
              >
                <CheckSquare className="w-4 h-4" />
                {tasks.filter(t => !t.completed).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--warn)] text-[9px] font-bold text-white flex items-center justify-center shadow-sm">
                    {tasks.filter(t => !t.completed).length}
                  </span>
                )}
              </button>

              {/* Collapsed Calendar Trigger */}
              <button
                onClick={() => setIsRightSidebarExpanded(true)}
                title="Календарь на Июль"
                className="w-10 h-10 rounded-full bg-white/20 dark:bg-black/20 hover:bg-[var(--lavenderSoft)] dark:hover:bg-zinc-800 flex items-center justify-center text-[var(--soft)] hover:text-[var(--lavDeep)] transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
              </button>
              
              {/* Quick Statistics Trigger */}
              <button
                onClick={() => showToast('Статистика', 'Раздел отчетов сейчас формируется.', 'info')}
                title="Статистика за месяц"
                className="w-10 h-10 rounded-full bg-white/20 dark:bg-black/20 hover:bg-[var(--lavenderSoft)] dark:hover:bg-zinc-800 flex items-center justify-center text-[var(--soft)] hover:text-[var(--lavDeep)] transition-all cursor-pointer"
              >
                <TrendingUp className="w-4 h-4" />
              </button>
            </div>
          )}
        </aside>

      </div>

      {/* 4. MODALS OVERLAYS */}
      {/* Detail drawer popup modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectDetailModal
            project={selectedProject}
            isOpen={selectedProject !== null}
            onClose={() => setSelectedProject(null)}
            onUpdateProject={handleUpdateProject}
            showToast={showToast}
          />
        )}
      </AnimatePresence>

      {/* Add new project modal */}
      <AnimatePresence>
        {isNewProjOpen && (
          <NewProjectModal
            isOpen={isNewProjOpen}
            onClose={() => setIsNewProjOpen(false)}
            onSubmit={handleCreateProject}
          />
        )}
      </AnimatePresence>

    </div>
  );
}