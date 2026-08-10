import React, { useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FolderKanban,
  FolderOpen,
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
  Edit,
  Palette,
  LayoutGrid,
  List,
  MapPin,
  Settings,
  Menu,
  X,
  FlaskConical
} from 'lucide-react';

import { Project, WarehouseItem, Task, DocumentItem, ImageItem, ProjectStatus, EstimateItem } from './types';
import { initialProjects, initialWarehouseItems, initialTasks, initialDocuments, initialImages } from './mockData';

// Subcomponents
import Toast from './components/Toast';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import NewProjectModal from './components/NewProjectModal';
import ProjectDetailModal from './components/ProjectDetailModal';
import TestProjectCardPage from './components/TestProjectCardPage';
import MoodboardEditor from './components/MoodboardEditor';
import WarehouseTab from './components/WarehouseTab';
import ImagesTab from './components/ImagesTab';
import DocumentsTab from './components/DocumentsTab';
import ProfileTab from './components/ProfileTab';
import SettingsTab from './components/SettingsTab';
import BlankTestPage from './components/BlankTestPage';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved as 'light' | 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Background style state (Subly Aurora vs Classic)
  const [bgTheme, setBgTheme] = useState<'aurora' | 'default'>(() => {
    const saved = localStorage.getItem('bg_theme');
    return (saved as 'aurora' | 'default') || 'aurora';
  });

  // Main active tab state
  const [activeTab, setActiveTab] = useState<'projects' | 'projectCard' | 'testCard' | 'testPage' | 'warehouse' | 'images' | 'documents' | 'profile' | 'moodboard' | 'calendar' | 'settings'>('projects');

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

  // Global Project Tasks and Notes state synchronized with project modals
  const [globalProjectTasksNotes, setGlobalProjectTasksNotes] = useState<any[]>(() => {
    const saved = localStorage.getItem('pop_project_tasks_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      {
        id: 'ptn_101',
        projectId: 'p2',
        projectName: 'День рождения · 30 лет',
        type: 'task',
        title: 'Заполнить бриф с именинником и согласовать неоновый стиль',
        dueDate: '2026-07-18',
        completed: false,
        category: 'Клиент',
        createdAt: '12.07.2026'
      },
      {
        id: 'ptn_102',
        projectId: 'p2',
        projectName: 'День рождения · 30 лет',
        type: 'task',
        title: 'Подготовить мудборд световой арки и задника фотозоны',
        dueDate: '2026-07-18',
        completed: true,
        category: 'Монтаж',
        createdAt: '13.07.2026'
      },
      {
        id: 'ptn_103',
        projectId: 'p2',
        projectName: 'День рождения · 30 лет',
        type: 'note',
        title: 'Заказчик попросил золотые подсвечники и серые текстильные салфетки',
        dueDate: '2026-07-18',
        category: 'Закупка',
        createdAt: '14.07.2026'
      },
      {
        id: 'ptn_104',
        projectId: 'p1',
        projectName: 'Свадьба · Ролл',
        type: 'task',
        title: 'Заехать к флористу и забрать пионовидные розы',
        dueDate: '2026-07-20',
        completed: false,
        category: 'Закупка',
        createdAt: '14.07.2026'
      },
      {
        id: 'ptn_105',
        projectId: 'p1',
        projectName: 'Свадьба · Ролл',
        type: 'note',
        title: 'Везд на площадки «Ролл Резорт» через КПП №2 только с 14:00',
        dueDate: '2026-07-20',
        category: 'Логистика',
        createdAt: '15.07.2026'
      },
      {
        id: 'ptn_106',
        projectId: 'p3',
        projectName: 'Корпоратив · Бренд X',
        type: 'task',
        title: 'Проверить состояние текстиля и чехлов перед погрузкой',
        dueDate: '2026-08-02',
        completed: true,
        category: 'Логистика',
        createdAt: '28.07.2026'
      },
      {
        id: 'ptn_107',
        projectId: 'p1',
        projectName: 'Свадьба · Ролл',
        type: 'task',
        title: 'Согласовать схему расстановки столов и арки с менеджером площадки',
        dueDate: '2026-08-15',
        completed: false,
        category: 'Монтаж',
        createdAt: '01.08.2026'
      },
      {
        id: 'ptn_108',
        projectId: 'p1',
        projectName: 'Свадьба · Ролл',
        type: 'note',
        title: 'Площадка просит демонтировать конструкции не позднее 02:00 ночи',
        dueDate: '2026-08-15',
        category: 'Важное',
        createdAt: '02.08.2026'
      }
    ];
  });

  const [sidebarTaskFilter, setSidebarTaskFilter] = useState<'date' | 'all'>('date');

  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [images, setImages] = useState<ImageItem[]>(initialImages);

  // Search & Filters on Projects
  const [projectQuery, setProjectQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState<'all' | 'progress' | 'waiting' | 'approved' | 'archive' | 'trash'>('all');
  const [projectSort, setProjectSort] = useState<'date' | 'status' | 'name'>('date');

  // Premium collapsible layout and calendar states
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [isLeftSidebarExpanded, setIsLeftSidebarExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1280;
    }
    return false;
  });
  const [isRightSidebarExpanded, setIsRightSidebarExpanded] = useState(false);

  // Collapse left menu sidebar and right calendar sidebar automatically when entering moodboard editor
  useEffect(() => {
    if (activeTab === 'moodboard') {
      setIsLeftSidebarExpanded(false);
      setIsRightSidebarExpanded(false);
    }
  }, [activeTab]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280) {
        setIsLeftSidebarExpanded(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [calendarYear, setCalendarYear] = useState<number>(2026);
  const [calendarMonth, setCalendarMonth] = useState<number>(6); // 0 = Jan, 6 = July
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(18);

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const monthNamesGenitive = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(prev => prev - 1);
    } else {
      setCalendarMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(prev => prev + 1);
    } else {
      setCalendarMonth(prev => prev + 1);
    }
  };
  const [moodboardHeaderActions, setMoodboardHeaderActions] = useState<ReactNode | null>(null);
  const [imagesHeaderActions, setImagesHeaderActions] = useState<ReactNode | null>(null);

  // Modals & overlay states
  const [isNewProjOpen, setIsNewProjOpen] = useState(false);
  const [isWarehouseAdding, setIsWarehouseAdding] = useState(false);
  const [projectViewMode, setProjectViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isHeaderCalendarOpen, setIsHeaderCalendarOpen] = useState(false);
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
    localStorage.setItem('pop_project_tasks_v2', JSON.stringify(globalProjectTasksNotes));
  }, [globalProjectTasksNotes]);

  useEffect(() => {
    const handleSyncTasks = () => {
      const saved = localStorage.getItem('pop_project_tasks_v2');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setGlobalProjectTasksNotes(parsed);
          }
        } catch (e) {}
      }
    };
    window.addEventListener('project_tasks_updated', handleSyncTasks);
    window.addEventListener('storage', handleSyncTasks);
    return () => {
      window.removeEventListener('project_tasks_updated', handleSyncTasks);
      window.removeEventListener('storage', handleSyncTasks);
    };
  }, []);

  // Toggle tasks and notes from the right sidebar
  const handleToggleGlobalTaskNote = (id: string) => {
    let completedTitle = '';
    setGlobalProjectTasksNotes(prev => {
      return prev.map(item => {
        if (item.id === id && item.type === 'task') {
          const nextVal = !item.completed;
          if (nextVal) {
            completedTitle = item.title;
          }
          return { ...item, completed: nextVal };
        }
        return item;
      });
    });
    if (completedTitle) {
      showToast('Задача выполнена', `Отмечено как выполнено: "${completedTitle}"`, 'success');
    }
  };

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

  useEffect(() => {
    localStorage.setItem('bg_theme', bgTheme);
    if (bgTheme === 'aurora') {
      document.body.classList.add('bg-aurora');
      document.body.classList.remove('bg-default');
    } else {
      document.body.classList.add('bg-default');
      document.body.classList.remove('bg-aurora');
    }
  }, [bgTheme]);

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
      scenesData: [
        {
          id: 'scene-1',
          name: 'Визуализация 1',
          elements: [],
          backdropImage: '',
          backdropColor: '#F3F4F6',
          backdropType: 'color'
        }
      ],
      briefValues: {
        "ИМЯ КЛИЕНТА": newProj.clientName && newProj.clientName !== 'Не указан' ? newProj.clientName : "",
        "ТЕЛЕФОН": newProj.clientPhone || "",
        "СОБЫТИЕ": newProj.name && !newProj.name.startsWith('proj_') ? newProj.name : "",
        "ДАТА": newProj.date || "",
        "ПЛОЩАДКА": newProj.venue && newProj.venue !== 'Площадка не указана' ? newProj.venue : "",
        "ОРИЕНТИРОВОЧНЫЙ БЮДЖЕТ": newProj.budget ? `${newProj.budget.toLocaleString('ru')} ₽` : "",
      },
      brief: {
        style: 'Не выбран',
        colors: ['#FFFFFF'],
        flowers: [],
        guestsCount: 50,
        specialRequests: 'Нет примечаний.'
      }
    };

    setProjects([created, ...projects]);
    setSelectedProject(created);
    setActiveTab('projectCard');

    // Automatically focus calendar on newly created project date
    if (created.date) {
      const parts = created.date.split('T')[0].split('-');
      if (parts.length >= 3) {
        const py = parseInt(parts[0], 10);
        const pm = parseInt(parts[1], 10) - 1;
        const pd = parseInt(parts[2], 10);
        if (!isNaN(py) && !isNaN(pm) && !isNaN(pd)) {
          setCalendarYear(py);
          setCalendarMonth(pm);
          setSelectedCalendarDay(pd);
        }
      }
    }
    
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

  // Global Delete Confirmation state
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    title?: string;
    itemName?: string;
    description?: string;
    confirmText?: string;
    isDangerous?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    onConfirm: () => {}
  });

  const handleTrashClick = (p: Project) => {
    if (p.status === 'trash') {
      setDeleteConfirmState({
        isOpen: true,
        title: 'Удалить проект навсегда?',
        itemName: p.name,
        description: `Вы действительно хотите окончательно удалить проект «${p.name}»? Восстановить его будет невозможно.`,
        confirmText: 'Удалить навсегда',
        isDangerous: true,
        onConfirm: () => {
          setProjects(prev => prev.filter(item => item.id !== p.id));
          showToast('Удалено навсегда', `Проект «${p.name}» удален окончательно.`, 'warn');
          setDeleteConfirmState(prev => ({ ...prev, isOpen: false }));
        }
      });
    } else {
      setDeleteConfirmState({
        isOpen: true,
        title: 'Переместить в корзину?',
        itemName: p.name,
        description: `Проект «${p.name}» будет перемещен в раздел «Корзина». Вы сможете восстановить его в любой момент.`,
        confirmText: 'В корзину',
        isDangerous: true,
        onConfirm: () => {
          setProjects(prev => prev.map(item => item.id === p.id ? { ...item, status: 'trash' as const } : item));
          showToast('Перемещено в корзину', `Проект «${p.name}» перемещен в корзину.`, 'info');
          setDeleteConfirmState(prev => ({ ...prev, isOpen: false }));
        }
      });
    }
  };

  // Visualizer editor attachment: updates project image mock, estimate list, budget, scenes and floor plan
  const handleAttachVisualizerToProject = useCallback((
    projectId: string,
    imageUrl: string,
    estimateItems?: EstimateItem[],
    budget?: number,
    scenesData?: any[],
    floorPlanData?: any[]
  ) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const updated = { ...p, imageUrl, updatedAt: new Date().toISOString() };
        if (estimateItems) {
          updated.estimate = estimateItems;
        }
        if (scenesData) {
          updated.scenesData = scenesData;
        }
        if (floorPlanData) {
          updated.floorPlanData = floorPlanData;
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

  const stepsList = ['Бриф', 'Визуал', 'Смета', 'Согласование'];
  const stageOrdinals = ['первый этап', 'второй этап', 'третий этап', 'четвертый этап'];

    // Dynamic Calendar Events derived strictly from active Projects
  const calendarEvents = useMemo(() => {
    const eventsMap: Record<number, Array<{
      id: string;
      title: string;
      desc: string;
      time: string;
      type: 'warn' | 'sage' | 'indigo' | 'lavender';
      project: Project;
    }>> = {};

    projects.filter(p => p.status !== 'trash').forEach(p => {
      if (!p.date) return;
      const parts = p.date.split('T')[0].split('-');
      if (parts.length < 3) return;
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0-indexed
      const day = parseInt(parts[2], 10);

      if (year === calendarYear && month === calendarMonth && !isNaN(day)) {
        if (!eventsMap[day]) eventsMap[day] = [];

        let type: 'warn' | 'sage' | 'indigo' | 'lavender' = 'lavender';
        if (p.status === 'approved') type = 'sage';
        else if (p.status === 'waiting') type = 'indigo';
        else if (p.status === 'archive') type = 'warn';

        const stepNames = ['Бриф', 'Визуализация', 'Смета', 'Согласование'];
        const stepText = stepNames[p.currentStep] || 'Проект';

        eventsMap[day].push({
          id: p.id,
          title: p.name,
          desc: `${p.venue} · ${p.clientName}`,
          time: stepText,
          type,
          project: p
        });
      }
    });

    return eventsMap;
  }, [projects, calendarYear, calendarMonth]);

  // Dynamic Month Calendar Grid Generator
  const calendarDays = useMemo(() => {
    const days: Array<{ num: number; currentMonth: boolean; eventType?: 'warn' | 'sage' | 'indigo' | 'lavender' }> = [];
    
    const firstDay = new Date(calendarYear, calendarMonth, 1);
    let startDayOfWeek = firstDay.getDay(); // 0 = Sun, 1 = Mon...
    const startDayMon = (startDayOfWeek === 0 ? 7 : startDayOfWeek) - 1; // 0 = Mon

    const prevMonthLastDay = new Date(calendarYear, calendarMonth, 0).getDate();
    const currentMonthDays = new Date(calendarYear, calendarMonth + 1, 0).getDate();

    // Prev month trailing days
    for (let i = startDayMon - 1; i >= 0; i--) {
      days.push({ num: prevMonthLastDay - i, currentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= currentMonthDays; d++) {
      const dayEvents = calendarEvents[d];
      const eventType = dayEvents && dayEvents.length > 0 ? dayEvents[0].type : undefined;
      days.push({ num: d, currentMonth: true, eventType });
    }

    // Next month leading days
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      days.push({ num: d, currentMonth: false });
    }

    return days;
  }, [calendarYear, calendarMonth, calendarEvents]);

  const getProjectImage = (p: Project | string) => {
    const proj = typeof p === 'string' ? projects.find(item => item.id === p) : p;
    if (proj?.imageUrl) {
      return proj.imageUrl;
    }
    const id = typeof p === 'string' ? p : p.id;
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

  const renderMobileNavButton = () => (
    <div className="relative">
      <button
        onClick={() => {
          setIsMobileNavOpen(!isMobileNavOpen);
          setIsMobileProfileMenuOpen(false);
        }}
        aria-label="Навигация"
        title="Открыть меню навигации"
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-[#8C52D0] to-[#582F89] hover:opacity-95 text-white transition-all cursor-pointer shadow-md border border-white/20 shrink-0"
      >
        {isMobileNavOpen ? (
          <X className="w-4.5 h-4.5 text-white stroke-[2.5] shrink-0" />
        ) : (
          <Menu className="w-4.5 h-4.5 text-white stroke-[2.5] shrink-0" />
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
              className="absolute right-0 top-full mt-2 w-56 bg-white/90 dark:bg-zinc-900/95 backdrop-blur-2xl border border-white/80 dark:border-zinc-700/60 rounded-2xl shadow-2xl p-1.5 z-[100] overflow-hidden"
            >
              {[
                { value: 'projects', label: 'Мои проекты', icon: <FolderKanban className="w-4 h-4" /> },
                { value: 'projectCard', label: 'Карточка проекта', icon: <FolderOpen className="w-4 h-4" /> },
                { value: 'moodboard', label: 'Редактор', icon: <Layout className="w-4 h-4" /> },
                { value: 'calendar', label: 'Календарь', icon: <Calendar className="w-4 h-4" /> },
                { value: 'warehouse', label: 'Мой склад', icon: <Warehouse className="w-4 h-4" /> },
                { value: 'images', label: 'Мои изображения', icon: <ImageIcon className="w-4 h-4" /> },
                { value: 'documents', label: 'Мои документы', icon: <FileText className="w-4 h-4" /> },
                { value: 'profile', label: 'Профиль бренда', icon: <User className="w-4 h-4" /> },
                { value: 'settings', label: 'Настройки', icon: <Settings className="w-4 h-4" /> }
              ].map((item) => {
                const isSelected = activeTab === item.value;
                return (
                  <button
                    key={item.value}
                    onClick={() => {
                      setSelectedProject(null);
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
  );

  const renderNotificationsButton = () => (
    <div className="relative">
      <button
        onClick={() => {
          setIsNotificationsOpen(!isNotificationsOpen);
          setIsHeaderCalendarOpen(false);
        }}
        aria-label="Уведомления"
        title="Уведомления"
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full glass-panel flex items-center justify-center text-[var(--ink)] hover:text-[var(--lavDeep)] hover:bg-white/90 dark:hover:bg-zinc-800 transition-all shadow-xs cursor-pointer relative"
      >
        <Bell className="w-4 h-4 text-[var(--ink)] dark:text-zinc-200" />
        {unreadNotificationsCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--warn)] shadow-xs ring-2 ring-white dark:ring-zinc-900" />
        )}
      </button>

      <AnimatePresence>
        {isNotificationsOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setIsNotificationsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-80 bg-white/90 dark:bg-zinc-900/95 backdrop-blur-2xl border border-white/80 dark:border-zinc-700/80 rounded-2xl shadow-2xl p-4 z-40 space-y-3"
            >
              <div className="flex justify-between items-center pb-2 border-b border-[var(--glass-edge)]">
                <span className="text-xs font-semibold text-[var(--ink)]">События клиентов</span>
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={handleMarkAllNotificationsAsRead}
                    className="text-xs text-[var(--lavenderAccent)] font-medium hover:underline cursor-pointer"
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
  );

  const renderHeaderCalendarButton = () => (
    <div className="relative">
      <button
        onClick={() => {
          setIsHeaderCalendarOpen(!isHeaderCalendarOpen);
          setIsNotificationsOpen(false);
        }}
        aria-label="Календарь"
        title="Календарь событий декоратора"
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full glass-panel flex items-center justify-center transition-all shadow-xs cursor-pointer ${
          activeTab === 'calendar' || isHeaderCalendarOpen
            ? 'bg-gradient-to-r from-[#8C52D0] to-[#582F89] text-white'
            : 'text-[var(--ink)] hover:text-[var(--lavDeep)] hover:bg-white/90 dark:hover:bg-zinc-800'
        }`}
      >
        <Calendar className={`w-4 h-4 shrink-0 ${activeTab === 'calendar' || isHeaderCalendarOpen ? 'text-white' : 'text-[var(--ink)] dark:text-zinc-200'}`} />
      </button>

      <AnimatePresence>
        {isHeaderCalendarOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setIsHeaderCalendarOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-80 bg-white/90 dark:bg-zinc-900/95 backdrop-blur-2xl border border-white/80 dark:border-zinc-700/80 rounded-2xl shadow-2xl p-4 z-40 space-y-3"
            >
              <div className="flex justify-between items-center pb-2 border-b border-[var(--glass-edge)]">
                <span className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[var(--lavenderAccent)]" /> {monthNames[calendarMonth]} {calendarYear}
                </span>
                <button
                  onClick={() => {
                    setActiveTab('calendar');
                    setIsHeaderCalendarOpen(false);
                  }}
                  className="text-xs text-[var(--lavenderAccent)] font-semibold hover:underline cursor-pointer"
                >
                  Открыть весь календарь
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {Object.entries(calendarEvents).length === 0 ? (
                  <p className="text-xs text-[var(--soft)] italic py-3 text-center">В этом месяце нет проектов с датами.</p>
                ) : (
                  Object.entries(calendarEvents).map(([dayNum, events]) => (
                    <div
                      key={dayNum}
                      onClick={() => {
                        setSelectedCalendarDay(Number(dayNum));
                        setActiveTab('calendar');
                        setIsHeaderCalendarOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-white/60 dark:bg-zinc-800/60 border border-[var(--glass-edge)] hover:border-[var(--lavenderAccent)] cursor-pointer transition-all space-y-1 text-left"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-[var(--lavDeep)] dark:text-purple-300">{dayNum} {monthNamesGenitive[calendarMonth]} {calendarYear}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--lavenderSoft)] text-[var(--lavDeep)]">
                          {events[0]?.time}
                        </span>
                      </div>
                      <div className="font-semibold text-xs text-[var(--ink)]">{events[0]?.title}</div>
                      <p className="text-[11px] text-[var(--soft)] line-clamp-1">{events[0]?.desc}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );

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
        className={`shrink-0 hidden md:flex flex-col gap-4 sticky top-0 h-screen border-r backdrop-blur-xl z-20 transition-all duration-300 ${
          isLeftSidebarExpanded ? 'w-56 p-4' : 'w-14 items-center py-4 px-1.5'
        }`}
        style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)' }}
      >
        {/* Unified Sidebar Header */}
        {isLeftSidebarExpanded ? (
          <div className="flex items-center justify-between w-full min-h-[36px]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--lavDeep)] to-[var(--lavenderAccent)] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                Ф
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-[#1B0E20] dark:text-zinc-100 text-[14px] tracking-tight leading-tight block">Флёр Деко</span>
                <span className="text-[10px] text-[var(--faint)] leading-none mt-0.5 block">премиум</span>
              </div>
            </div>
            <button
              onClick={() => setIsLeftSidebarExpanded(false)}
              title="Свернуть боковое меню"
              className="w-7 h-7 rounded-full hover:bg-white/20 dark:hover:bg-black/20 flex items-center justify-center text-[var(--soft)] hover:text-[var(--ink)] cursor-pointer"
            >
              <ChevronsLeft className="w-3.5 h-3.5 text-[var(--soft)]" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 w-full">
            <div
              onClick={() => setIsLeftSidebarExpanded(true)}
              title="Флёр Деко · премиальный декор"
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--lavDeep)] to-[var(--lavenderAccent)] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm cursor-pointer hover:scale-105 transition-transform"
            >
              Ф
            </div>
            <button
              onClick={() => setIsLeftSidebarExpanded(true)}
              title="Развернуть боковое меню"
              className="w-7 h-7 rounded-full hover:bg-white/20 dark:hover:bg-black/20 flex items-center justify-center text-[var(--soft)] hover:text-[var(--lavDeep)] transition-all cursor-pointer"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Sidebar Navigation */}
        <nav className={`flex flex-col gap-0.5 w-full ${!isLeftSidebarExpanded ? 'items-center' : ''}`}>
          {[
            { key: 'projects', label: 'Мои проекты', icon: <FolderKanban className="w-[17px] h-[17px] shrink-0" /> },
            { key: 'moodboard', label: 'Редактор', icon: <Layout className="w-[17px] h-[17px] shrink-0" /> },
            { key: 'warehouse', label: 'Мой склад', icon: <Warehouse className="w-[17px] h-[17px] shrink-0" /> },
            { key: 'images', label: 'Мои изображения', icon: <ImageIcon className="w-[17px] h-[17px] shrink-0" /> },
            { key: 'documents', label: 'Мои документы', icon: <FileText className="w-[17px] h-[17px] shrink-0" /> },
            { key: 'profile', label: 'Профиль бренда', icon: <User className="w-[17px] h-[17px] shrink-0" /> },
            { key: 'settings', label: 'Настройки', icon: <Settings className="w-[17px] h-[17px] shrink-0" /> }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setSelectedProject(null);
                setActiveTab(tab.key as any);
              }}
              title={!isLeftSidebarExpanded ? tab.label : undefined}
              className={`flex items-center gap-2.5 rounded-xl text-[14px] transition-all cursor-pointer ${
                isLeftSidebarExpanded ? 'px-3 py-1.5 w-full justify-start' : 'p-1.5 w-8 h-8 justify-center'
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
                <div className="w-8 h-8 rounded-full bg-[var(--lavenderSoft)] text-[var(--lavDeep)] flex items-center justify-center font-medium text-xs shrink-0">ДС</div>
                <div className="min-w-0">
                  <p className="font-medium text-[var(--ink)] text-xs truncate">Денис С.</p>
                  <p className="text-[10px] text-[var(--faint)] truncate">denis@example.com</p>
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-[var(--faint)] transition-transform duration-300 ${isProfileExpanded ? 'rotate-180' : ''}`} />
            </div>

            {/* Always Visible Tariff Block */}
            <div className="flex items-center justify-between text-xs border-t border-[var(--glass-edge)] pt-2 mt-2" style={{ borderTopColor: 'var(--line)' }}>
              <div className="flex items-center gap-1.5">
                <span className="text-[var(--soft)] text-[11px]">Тариф</span>
                <span className="text-[10px] font-semibold bg-[var(--lavDeep)] text-white px-1.5 py-0.5 rounded-full tracking-wide">PRO</span>
              </div>
              <button
                onClick={() => showToast('Смена плана', 'Раздел управления тарифом появится совсем скоро.', 'info')}
                className="text-[11px] text-[var(--lavenderAccent)] hover:underline font-medium"
              >
                сменить
              </button>
            </div>

            {/* Collapsible Body Details */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out flex flex-col gap-3 mt-0 ${isProfileExpanded ? 'max-h-[350px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
              <div className="h-px bg-[var(--glass-edge)] mt-2" style={{ background: 'var(--line)' }} />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[var(--soft)]">Лимиты на месяц</span>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[11px] text-[var(--soft)] mb-1">
                    <span>ИИ-визуализация</span>
                    <span className="font-medium text-[var(--ink)]">2 / 10</span>
                  </div>
                  <div className="w-full h-1 bg-[var(--glass)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--lavenderAccent)]" style={{ width: '20%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-[var(--soft)] mb-1">
                    <span>Обрезка фона</span>
                    <span className="font-medium text-[var(--ink)]">12 / 20</span>
                  </div>
                  <div className="w-full h-1 bg-[var(--glass)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--sage)]" style={{ width: '60%' }} />
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-[var(--faint)] -mt-1">обновится 3 авг</div>

              <button
                onClick={() => showToast('До встречи!', 'Вы вышли из личного кабинета.', 'info')}
                className="w-full glass-interactive bg-white/30 hover:bg-white/50 rounded-xl py-1.5 text-xs font-medium text-[var(--ink)] flex items-center justify-center gap-2"
              >
                Выйти
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsLeftSidebarExpanded(true)}
            title="Денис С. (Тариф PRO)"
            className="w-8 h-8 rounded-full bg-[var(--lavenderSoft)] text-[var(--lavDeep)] flex items-center justify-center font-semibold text-xs shrink-0 hover:scale-105 transition-transform cursor-pointer"
          >
            ДС
          </button>
        )}
      </aside>

      {/* 2. DYNAMIC MAIN CONTAINER WRAPPER WITH RIGHT SIDEBAR */}
      <div className="flex-1 flex flex-row min-w-0 h-full overflow-hidden">
        
        {/* CENTRAL WORKSPACE */}
        <main className={`flex-1 relative flex flex-col min-w-0 ${
          activeTab === 'moodboard'
            ? 'p-2 sm:p-3 space-y-1.5 h-full overflow-hidden'
            : 'px-3 sm:px-6 pt-2 pb-6 space-y-4 h-full overflow-y-auto overflow-x-hidden'
        }`}>
          
          {/* MAIN PANEL TOP NAVBAR HEADER (ALL PAGES) */}
          {activeTab !== 'moodboard' && activeTab !== 'projectCard' && (
            <div className="flex flex-col gap-2 shrink-0 pt-0">
              {/* Top Row: Title on Left, Notifications + Calendar + Hamburger Menu on Right */}
              <div className="flex items-center justify-between gap-3 w-full">
                <div className="flex items-center gap-2.5 min-w-0">
                  {(selectedProject || activeTab === 'testPage') && (
                    <button
                      onClick={() => {
                        setSelectedProject(null);
                        setActiveTab('projects');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-panel hover:bg-white/80 dark:hover:bg-zinc-800 text-xs font-semibold text-[var(--ink)] transition-all cursor-pointer shadow-xs shrink-0"
                    >
                      <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                      <span>К проектам</span>
                    </button>
                  )}

                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-[var(--ink)] truncate">
                    {activeTab === 'projects' && (selectedProject ? selectedProject.name : 'Мои проекты')}
                    {activeTab === 'calendar' && 'Календарь мероприятий'}
                    {activeTab === 'warehouse' && 'Складской инвентарь'}
                    {activeTab === 'images' && 'Галерея'}
                    {activeTab === 'documents' && 'Мои документы'}
                    {activeTab === 'profile' && 'Профиль бренда'}
                    {activeTab === 'settings' && 'Настройки'}
                    {activeTab === 'testPage' && (selectedProject ? selectedProject.name : 'Тестовая страница')}
                  </h1>
                </div>

                {/* Right Actions Cluster: Notification Bell + Calendar + Hamburger (Mobile) + Primary Action */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {/* Primary Action Desktop buttons */}
                  {activeTab === 'projects' && !selectedProject && (
                    <button
                      onClick={() => setIsNewProjOpen(true)}
                      className="hidden sm:flex bg-gradient-to-r from-[#8C52D0] to-[#582F89] hover:opacity-95 text-white rounded-full px-3.5 sm:px-4 py-1.5 text-xs font-semibold shadow-md transition-all items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Новый проект</span>
                    </button>
                  )}

                  {activeTab === 'warehouse' && (
                    <button
                      onClick={() => setIsWarehouseAdding(true)}
                      className="hidden sm:flex bg-gradient-to-r from-[#8C52D0] to-[#582F89] hover:opacity-95 text-white rounded-full px-3.5 sm:px-4 py-1.5 text-xs font-semibold shadow-md transition-all items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Новый товар</span>
                    </button>
                  )}

                  {activeTab === 'images' && imagesHeaderActions && (
                    <div className="hidden sm:flex items-center gap-2">
                      {imagesHeaderActions}
                    </div>
                  )}

                  {/* Notification Bell Button */}
                  {renderNotificationsButton()}

                  {/* Calendar Button */}
                  {renderHeaderCalendarButton()}

                  {/* Hamburger Menu Button (Mobile) */}
                  <div className="md:hidden">
                    {renderMobileNavButton()}
                  </div>
                </div>
              </div>

              {/* Subtitle / Description & Mobile Primary Action Buttons */}
              {activeTab !== 'projectCard' && activeTab !== 'testPage' && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p className="text-[var(--soft)] text-xs sm:text-sm font-normal leading-relaxed">
                    {activeTab === 'projects' && !selectedProject && 'Создавайте макеты, открывайте сметный калькулятор и возвращайтесь к ним в любой момент.'}
                    {activeTab === 'calendar' && 'График монтажей, сдачи проектов, выездов команды и встреч с клиентами.'}
                    {activeTab === 'warehouse' && 'Каталог вашего декора, флористики и оборудования. Учет остатков и задействованных в проектах позиций.'}
                    {activeTab === 'images' && 'Ваша галерея загруженных референсов, сгенерированных ИИ фонов, элементов флористики и декора для оформления.'}
                    {activeTab === 'documents' && 'Реквизиты, на кого оформляется договор, шаблоны договора и акта. Только автоматическая генерация и печать, оплата не принимается в сервисе.'}
                    {activeTab === 'profile' && 'Настройки реквизитов и контактов студии для формирования коммерческих предложений.'}
                    {activeTab === 'settings' && 'Управление параметрами оформления и цветовой темой интерфейса.'}
                  </p>

                  {/* Mobile Primary Action Buttons */}
                  {activeTab === 'projects' && !selectedProject && (
                    <button
                      onClick={() => setIsNewProjOpen(true)}
                      className="sm:hidden w-full bg-gradient-to-r from-[#8C52D0] to-[#582F89] hover:opacity-95 text-white rounded-full px-4 py-2.5 text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Новый проект
                    </button>
                  )}

                  {activeTab === 'warehouse' && (
                    <button
                      onClick={() => setIsWarehouseAdding(true)}
                      className="sm:hidden w-full bg-gradient-to-r from-[#8C52D0] to-[#582F89] hover:opacity-95 text-white rounded-full px-4 py-2.5 text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Новый товар
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* QUICK METRICS DASHBOARD ROW */}
          {activeTab === 'projects' && !selectedProject && (
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
                  <>
                      {/* Header controls */}
                  <div className="space-y-2.5">
                    {/* Row 1: Categories / Status Filter pills */}
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1 max-w-full sm:flex-wrap">
                      {[
                        { key: 'all', label: 'Все проекты', count: counts.all, badgeStyle: 'bg-amber-500/15 text-amber-700 dark:text-amber-300' },
                        { key: 'progress', label: 'В работе', count: counts.progress, badgeStyle: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' },
                        { key: 'waiting', label: 'Ждут ответа', count: counts.waiting, badgeStyle: 'bg-sky-500/15 text-sky-700 dark:text-sky-300' },
                        { key: 'approved', label: 'Согласованы', count: counts.approved, badgeStyle: 'bg-violet-500/15 text-violet-700 dark:text-violet-300' },
                        { key: 'archive', label: 'Архив', count: counts.archive, badgeStyle: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-300' },
                        { key: 'trash', label: 'Корзина', count: counts.trash, badgeStyle: 'bg-rose-500/15 text-rose-700 dark:text-rose-300' }
                      ].map((pill) => {
                        const isActive = projectFilter === pill.key;

                        return (
                          <button
                            key={pill.key}
                            onClick={() => setProjectFilter(pill.key as any)}
                            className={`rounded-full text-xs font-semibold tracking-tight transition-all duration-200 cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap ${
                              isActive
                                ? 'bg-gradient-to-r from-[#8C52D0] to-[#582F89] text-white shadow-xs px-2.5 py-1'
                                : 'bg-transparent text-[var(--soft)] hover:text-[var(--ink)] hover:bg-black/5 dark:hover:bg-white/5 border border-transparent px-2 py-1'
                            }`}
                          >
                            <span>{pill.label}</span>
                            <span className={`inline-flex items-center justify-center rounded-full text-[10px] font-bold min-w-[16px] h-4 px-1 transition-all duration-200 ${
                              isActive
                                ? 'bg-white/20 text-white backdrop-blur-xs'
                                : pill.badgeStyle
                            }`}>
                              {pill.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Row 2: Search Input, Sorting Select, and View Mode Switcher */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 bg-white/10 dark:bg-zinc-900/5 p-1.5 rounded-2xl sm:rounded-full border border-[var(--glass-edge)]/40">
                      <div className="flex flex-1 items-center gap-2 max-w-xl w-full sm:w-auto">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                          <input
                            type="text"
                            placeholder="Поиск по клиенту, площадке..."
                            value={projectQuery}
                            onChange={(e) => setProjectQuery(e.target.value)}
                            className="pl-8 pr-3 py-1 rounded-full text-xs bg-white/30 dark:bg-zinc-900/20 border border-zinc-200/50 dark:border-zinc-800/50 text-[var(--ink)] placeholder:text-zinc-400 focus:outline-none focus:border-[var(--lavenderAccent)] w-full transition-colors"
                          />
                        </div>

                        <select
                          value={projectSort}
                          onChange={(e) => setProjectSort(e.target.value as any)}
                          className="text-xs bg-white/30 dark:bg-zinc-900/20 border border-zinc-200/50 dark:border-zinc-800/50 rounded-full py-1 px-2.5 text-[var(--ink)] focus:outline-none focus:border-[var(--lavenderAccent)] font-medium transition-colors shrink-0"
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
                            <div className="aspect-[16/10] sm:aspect-[4/3] w-full relative shrink-0 overflow-hidden bg-white dark:bg-zinc-900">
                              <img
                                src={getProjectImage(p)}
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
                              
                              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(`https://fleur-decor.ru/brief/${p.id}`);
                                    showToast('Бриф скопирован', 'Отправьте ссылку клиенту для прохождения опроса.', 'success');
                                  }}
                                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/70 dark:bg-black/30 backdrop-blur flex items-center justify-center text-[var(--ink)] hover:text-purple-600 transition-colors cursor-pointer"
                                  title="Копировать бриф"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTrashClick(p);
                                  }}
                                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/70 dark:bg-black/30 backdrop-blur flex items-center justify-center text-[var(--ink)] hover:text-red-500 transition-colors cursor-pointer"
                                  title={p.status === 'trash' ? "Удалить навсегда" : "Переместить в корзину"}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Info area - Compact padding & tight margins */}
                            <div className="p-2.5 sm:p-3 space-y-1 sm:space-y-1.5 flex-1 flex flex-col justify-between">
                              <div className="space-y-0.5">
                                {p.client && (
                                  <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] uppercase tracking-wider truncate">
                                    <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 opacity-75" />
                                    <span className="truncate">{p.client}</span>
                                  </div>
                                )}
                                <h3 className="font-bold text-[var(--ink)] text-xs sm:text-sm leading-tight truncate">{p.name}</h3>
                                <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-[var(--faint)] truncate">
                                  <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 text-zinc-400" />
                                  <span className="truncate">{p.venue}</span>
                                </div>
                              </div>

                              {/* Custom Stepper with connecting line and dots */}
                              <div className="stepper py-1">
                                <div className="relative flex items-center justify-between px-2">
                                  {/* Horizontal track line */}
                                  <div className="absolute top-1/2 -translate-y-1/2 left-3 right-3 h-[2px] bg-zinc-200 dark:bg-zinc-800/60 z-0 rounded-full" />
                                  {/* Filled track line progress */}
                                  <div
                                    className="absolute top-1/2 -translate-y-1/2 left-3 h-[2px] bg-[var(--sage)] z-0 rounded-full transition-all duration-500"
                                    style={{ width: `${(Math.min(p.currentStep, 3) / 3) * 90}%` }}
                                  />
                                  
                                  {stepsList.map((_, idx) => {
                                    const isDone = idx < p.currentStep;
                                    const isCurrent = idx === p.currentStep;
                                    return (
                                      <div key={idx} className="step flex flex-col items-center relative z-10">
                                        <div
                                          className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                                            isDone
                                              ? 'bg-[var(--sage)] border-[var(--sage)]'
                                              : isCurrent
                                              ? 'bg-[#8C52D0] border-[#8C52D0] shadow-[0_0_0_3px_rgba(140,82,208,0.25)]'
                                              : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700'
                                          }`}
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                                {/* Clean Stage Label underneath */}
                                <div className="text-center mt-1.5 leading-snug">
                                  <span className="block text-[10px] text-zinc-400 dark:text-zinc-500 font-medium lowercase">
                                    {['первый этап', 'второй этап', 'третий этап', 'четвертый этап'][p.currentStep] || 'этап'}
                                  </span>
                                  <span className="block text-xs font-bold text-stone-800 dark:text-stone-100 lowercase">
                                    {['бриф', 'визуал', 'смета', 'согласование'][p.currentStep] || '—'}
                                  </span>
                                </div>
                              </div>

                              {/* Footer stats metadata */}
                              <div className="flex items-center justify-between gap-2 pt-0.5 border-t border-zinc-100 dark:border-zinc-800/40">
                                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-[var(--soft)]">
                                  <Calendar className="w-3 h-3 text-zinc-400 shrink-0" />
                                  <span>{new Date(p.date).toLocaleDateString('ru', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </span>
                                <span className="inline-flex items-center text-[10px] sm:text-xs text-[var(--lavDeep)] dark:text-purple-300 bg-[var(--lavenderSoft)]/80 dark:bg-purple-950/40 px-2 py-0.5 rounded-full font-bold">
                                  {displayPrice.toLocaleString('ru')} ₽
                                </span>
                              </div>

                              {/* Buttons */}
                              <div className="flex gap-1.5 pt-0.5">
                                {p.status === 'trash' ? (
                                  <>
                                    <button
                                      onClick={() => {
                                        setProjects(prev => prev.map(item => item.id === p.id ? { ...item, status: 'progress' as const } : item));
                                        showToast('Проект восстановлен', `Проект «${p.name}» возвращен в работу.`, 'success');
                                      }}
                                      className="flex-1 bg-[var(--sage)] hover:opacity-90 text-white rounded-full py-1.5 sm:py-2 text-xs font-semibold transition-all cursor-pointer text-center"
                                    >
                                      Восстановить
                                    </button>
                                    <button
                                      onClick={() => {
                                        setProjects(prev => prev.filter(item => item.id !== p.id));
                                        showToast('Удалено навсегда', `Проект «${p.name}» удален окончательно.`, 'warn');
                                      }}
                                      className="w-8 sm:w-9 shrink-0 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 transition-all flex items-center justify-center cursor-pointer"
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
                                        setActiveTab('projectCard');
                                      }}
                                      style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
                                      className="flex-1 text-white rounded-full py-1.5 sm:py-2 text-xs font-semibold shadow-xs hover:shadow-md hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center justify-center gap-1"
                                    >
                                      <FolderKanban className="w-3.5 h-3.5 shrink-0" />
                                      <span>Проект</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedProject(p);
                                        setActiveTab('moodboard');
                                      }}
                                      style={{ border: '1px solid #8C52D0' }}
                                      className="flex-1 bg-transparent text-[#8C52D0] rounded-full py-1.5 sm:py-2 text-xs font-semibold hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center justify-center gap-1 hover:bg-[#8C52D0]/10"
                                    >
                                      <Palette className="w-3.5 h-3.5 shrink-0 text-[#8C52D0]" />
                                      <span className="bg-gradient-to-r from-[#8C52D0] to-[#582F89] bg-clip-text text-transparent font-semibold">Редактор</span>
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
                        const projectImg = getProjectImage(p);

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

                                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 z-10">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigator.clipboard.writeText(`https://fleur-decor.ru/brief/${p.id}`);
                                      showToast('Бриф скопирован', 'Отправьте ссылку клиенту для прохождения опроса.', 'success');
                                    }}
                                    className="w-7 h-7 rounded-full bg-white/75 dark:bg-black/35 backdrop-blur flex items-center justify-center text-[var(--ink)] hover:text-purple-600 transition-colors cursor-pointer"
                                    title="Копировать бриф"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleTrashClick(p)}
                                    className="w-7 h-7 rounded-full bg-white/75 dark:bg-black/35 backdrop-blur flex items-center justify-center text-[var(--ink)] hover:text-red-500 transition-colors z-10"
                                    title={p.status === 'trash' ? "Удалить навсегда" : "Переместить в корзину"}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
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

                                </div>

                                {/* Row 2: Custom Compact Stepper */}
                                <div className="flex flex-col items-center">
                                  <div className="relative flex items-center justify-between w-32 py-1">
                                    {/* Background Line */}
                                    <div className="absolute left-1 right-1 top-1/2 -translate-y-1/2 h-[2px] bg-zinc-100 dark:bg-zinc-800" />
                                    {/* Progress Line */}
                                    <div
                                      className="absolute left-1 top-1/2 -translate-y-1/2 h-[2px] bg-[#0A7B5C] transition-all duration-500"
                                      style={{ width: `${(Math.min(p.currentStep, 3) / 3) * 100}%` }}
                                    />
                                    {Array.from({ length: 4 }).map((_, idx) => {
                                      const isDone = idx < p.currentStep;
                                      const isCurrent = idx === p.currentStep;
                                      return (
                                        <div key={idx} className="relative z-10 flex items-center justify-center">
                                          <div
                                            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                                              isDone
                                                ? 'bg-[#0A7B5C]'
                                                : isCurrent
                                                ? 'bg-[#8C52D0] ring-[3px] ring-[#8C52D0]/20'
                                                : 'bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800'
                                            }`}
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <span className="text-[10px] font-bold text-stone-700 dark:text-stone-300 lowercase mt-0.5">
                                    {['первый этап: бриф', 'второй этап: визуал', 'третий этап: смета', 'четвертый этап: согласование'][p.currentStep] || ''}
                                  </span>
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
                                        setActiveTab('projectCard');
                                      }}
                                      style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }} className="text-white rounded-full font-semibold text-[11px] py-1.5 px-5 shadow-sm transition-all duration-300 hover:shadow-md hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
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
                                       style={{ width: `${(Math.min(p.currentStep, 3) / 3) * 92}%` }}
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
                                     ['первый этап: бриф', 'второй этап: визуал', 'третий этап: смета', 'четвертый этап: согласование'][p.currentStep] || ''
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
                                           setActiveTab('projectCard');
                                         }}
                                         style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }} className="flex-1 sm:flex-initial text-white rounded-full px-5 py-2 text-xs font-semibold shadow-sm transition-all duration-300 hover:shadow-md hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] cursor-pointer whitespace-nowrap"
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

                                 {/* Date Tag Removed */}
                                 <span className="hidden">
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
                                     className="hidden"
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
                                     style={{ width: `${(Math.min(p.currentStep, 3) / 3) * 92}%` }}
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
                                     <div className="flex items-center gap-2 shrink-0">
                                       <button
                                         onClick={() => {
                                           setSelectedProject(p);
                                           setActiveTab('projectCard');
                                         }}
                                         style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
                                         className="text-white rounded-full font-semibold text-[12px] py-2 px-3.5 shadow-sm transition-all duration-300 hover:shadow-md hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0 flex items-center gap-1.5"
                                       >
                                         <FolderKanban className="w-3.5 h-3.5 shrink-0" />
                                         <span>Проект</span>
                                       </button>
                                       <button
                                         onClick={() => {
                                           setSelectedProject(p);
                                           setActiveTab('moodboard');
                                         }}
                                         style={{ border: '1px solid #8C52D0' }}
                                         className="bg-transparent text-[#8C52D0] rounded-full font-semibold text-[12px] py-2 px-3.5 shadow-xs transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0 flex items-center gap-1.5 hover:bg-[#8C52D0]/10"
                                       >
                                         <Palette className="w-3.5 h-3.5 shrink-0 text-[#8C52D0]" />
                                         <span className="bg-gradient-to-r from-[#8C52D0] to-[#582F89] bg-clip-text text-transparent font-semibold">Редактор</span>
                                       </button>
                                     </div>
                                   )}
                                 </div>
                               </div>
                             </div>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  )}
                    </>
                </motion.div>
              )}

              {/* PROJECT CARD TAB */}
              {activeTab === 'projectCard' && (
                <motion.div
                  key="project-card-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <BlankTestPage
                    project={selectedProject || projects[0]}
                    onClose={() => {
                      setSelectedProject(null);
                      setActiveTab('projects');
                    }}
                    onUpdateProject={handleUpdateProject}
                    showToast={showToast}
                    onOpenEditor={() => setActiveTab('moodboard')}
                  />
                </motion.div>
              )}

              {/* TEST PROJECT CARD TAB */}
              {activeTab === 'testCard' && (
                <motion.div
                  key="test-card-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <BlankTestPage
                    project={selectedProject || projects[0]}
                    onClose={() => {
                      setSelectedProject(null);
                      setActiveTab('projects');
                    }}
                    onUpdateProject={handleUpdateProject}
                    showToast={showToast}
                    onOpenEditor={() => setActiveTab('moodboard')}
                  />
                </motion.div>
              )}

              {/* BLANK TEST PAGE TAB */}
              {activeTab === 'testPage' && (
                <motion.div
                  key="blank-test-page-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  <BlankTestPage
                    project={selectedProject || projects[0]}
                    onClose={() => setActiveTab('projects')}
                    onUpdateProject={handleUpdateProject}
                    showToast={showToast}
                    onOpenEditor={() => setActiveTab('moodboard')}
                  />
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
                    initialProjectId={selectedProject?.id}
                    onSaveToProject={handleAttachVisualizerToProject}
                    onBackToProjectCard={(projId) => {
                      const targetProj = (projId && projects.find(p => p.id === projId)) || selectedProject || projects[0];
                      if (targetProj) {
                        setSelectedProject(targetProj);
                      }
                      setActiveTab('projectCard');
                    }}
                    showToast={showToast}
                    setHeaderActions={setMoodboardHeaderActions}
                    mobileNavButton={renderMobileNavButton()}
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

              {/* CALENDAR & EVENT SCHEDULE TAB */}
              {activeTab === 'calendar' && (
                <motion.div
                  key="calendar-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="glass-panel p-6 rounded-3xl space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
                      <div>
                        <h2 className="text-xl font-bold text-[var(--ink)] flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-[var(--lavDeep)]" /> Календарь мероприятий & событий
                        </h2>
                        <p className="text-xs text-[var(--soft)]">График монтажей, сдачи проектов и выездов команды</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handlePrevMonth}
                          className="p-1.5 rounded-full bg-white/60 dark:bg-zinc-800/60 hover:bg-white dark:hover:bg-zinc-700 text-[var(--soft)] hover:text-[var(--ink)] transition-colors cursor-pointer"
                          title="Предыдущий месяц"
                        >
                          <ChevronDown className="w-4 h-4 rotate-90" />
                        </button>
                        <span className="px-3 py-1 bg-[var(--lavenderSoft)] text-[var(--lavDeep)] rounded-full text-xs font-semibold">
                          {monthNames[calendarMonth]} {calendarYear}
                        </span>
                        <button
                          onClick={handleNextMonth}
                          className="p-1.5 rounded-full bg-white/60 dark:bg-zinc-800/60 hover:bg-white dark:hover:bg-zinc-700 text-[var(--soft)] hover:text-[var(--ink)] transition-colors cursor-pointer"
                          title="Следующий месяц"
                        >
                          <ChevronDown className="w-4 h-4 -rotate-90" />
                        </button>
                      </div>
                    </div>

                    {/* Main Interactive Grid Calendar */}
                    <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-[var(--faint)] mb-2">
                      {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d, i) => (
                        <div key={i} className="py-1">{d}</div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                      {calendarDays.map((day, idx) => {
                        const isSelected = selectedCalendarDay === day.num && day.currentMonth;
                        const hasEvent = day.currentMonth && calendarEvents[day.num];

                        let bgStyle = 'bg-white/40 dark:bg-zinc-800/40 hover:bg-white/80 dark:hover:bg-zinc-700/80';
                        let textStyle = day.currentMonth ? 'text-[var(--ink)]' : 'text-[var(--faint)] opacity-30';
                        let dotStyle = '';

                        if (day.currentMonth && day.eventType) {
                          if (day.eventType === 'warn') {
                            bgStyle = 'bg-rose-100/80 text-rose-800 dark:bg-rose-950/70 dark:text-rose-200 border border-rose-400/40 font-medium';
                            dotStyle = 'bg-rose-600';
                          } else if (day.eventType === 'indigo') {
                            bgStyle = 'bg-indigo-100/80 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-200 border border-indigo-400/40 font-medium';
                            dotStyle = 'bg-indigo-600';
                          } else if (day.eventType === 'lavender') {
                            bgStyle = 'bg-purple-100/80 text-purple-800 dark:bg-purple-950/70 dark:text-purple-200 border border-purple-400/40 font-medium';
                            dotStyle = 'bg-purple-600';
                          } else if (day.eventType === 'sage') {
                            bgStyle = 'bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200 border border-emerald-400/40 font-medium';
                            dotStyle = 'bg-emerald-600';
                          }
                        }

                        return (
                          <div
                            key={idx}
                            onClick={() => day.currentMonth && setSelectedCalendarDay(day.num)}
                            className={`min-h-[64px] p-2 rounded-2xl border border-[var(--glass-edge)] cursor-pointer transition-all flex flex-col items-center justify-between ${bgStyle} ${textStyle} ${
                              isSelected ? 'ring-2 ring-[var(--lavDeep)] scale-[1.02] shadow-md' : ''
                            }`}
                          >
                            <span className="font-bold text-sm">{day.num}</span>
                            {hasEvent && (
                              <div className="w-full space-y-1">
                                <span className={`w-2 h-2 rounded-full mx-auto block ${dotStyle || 'bg-[var(--lavDeep)]'}`} />
                                <span className="text-[9px] font-semibold truncate block max-w-full px-1 text-center opacity-90">
                                  {calendarEvents[day.num][0]?.title}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Detailed Event Log for selected day */}
                    <div className="pt-4 border-t border-[var(--line)]">
                      <h3 className="text-sm font-bold text-[var(--ink)] mb-3">
                        Детализация расписания на {selectedCalendarDay} {monthNamesGenitive[calendarMonth]} {calendarYear}:
                      </h3>
                      {calendarEvents[selectedCalendarDay] ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {calendarEvents[selectedCalendarDay].map((ev, i) => (
                            <div
                              key={i}
                              onClick={() => {
                                setSelectedProject(ev.project);
                                setActiveTab('projectCard');
                              }}
                              className="p-4 rounded-2xl bg-white/60 dark:bg-zinc-800/60 border border-[var(--glass-edge)] hover:border-[var(--lavenderAccent)] cursor-pointer transition-all shadow-xs group"
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-sm text-[var(--ink)] group-hover:text-[var(--lavDeep)] transition-colors">
                                  {ev.title}
                                </span>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--lavenderSoft)] text-[var(--lavDeep)]">
                                  {ev.time}
                                </span>
                              </div>
                              <p className="text-xs text-[var(--soft)] mb-2">{ev.desc}</p>
                              <div className="text-[11px] font-semibold text-[var(--lavenderAccent)] flex items-center gap-1">
                                <span>Открыть карточку проекта</span>
                                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[var(--soft)] italic">На эту дату нет запланированных проектов и монтажей.</p>
                      )}
                    </div>
                  </div>
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

              {/* SETTINGS TAB */}
              {activeTab === 'settings' && (
                <motion.div
                  key="settings-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  <SettingsTab
                    theme={theme}
                    toggleTheme={toggleTheme}
                    bgTheme={bgTheme}
                    setBgTheme={setBgTheme}
                    showToast={showToast}
                  />
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </main>

        {/* RIGHT SIDEBAR (Collapsible, dynamic panel) */}
        <aside
          className={`shrink-0 hidden xl:flex flex-col sticky top-0 h-screen border-l backdrop-blur-xl z-20 transition-all duration-300 overflow-hidden ${
            isRightSidebarExpanded ? 'w-64 p-4' : 'w-14 items-center py-4 px-1.5'
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
                    <span className="text-xs font-semibold text-[var(--ink)]">{monthNames[calendarMonth]} {calendarYear}</span>
                    <div className="flex gap-1">
                      <button onClick={handlePrevMonth} title="Предыдущий месяц" className="p-1 text-[var(--faint)] hover:text-[var(--ink)] text-xs focus:outline-none cursor-pointer"><ChevronDown className="w-3 h-3 rotate-90" /></button>
                      <button onClick={handleNextMonth} title="Следующий месяц" className="p-1 text-[var(--faint)] hover:text-[var(--ink)] text-xs focus:outline-none cursor-pointer"><ChevronDown className="w-3 h-3 -rotate-90" /></button>
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
                    События: {selectedCalendarDay} {monthNamesGenitive[calendarMonth]} {calendarYear}
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
                            onClick={() => {
                              setSelectedProject(ev.project);
                              setActiveTab('projectCard');
                            }}
                            className="p-2.5 rounded-xl border-l-2 text-[var(--ink)] transition-all duration-300 hover:translate-x-1 cursor-pointer"
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

              {/* Synchronized Project Tasks and Notes list filtered by selected calendar date */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <h2 className="text-sm font-semibold text-[var(--ink)] tracking-tight flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-[var(--lavenderAccent)]" />
                    <span>Задачи и заметки</span>
                  </h2>

                  {/* Filter toggle: Selected Date vs All */}
                  <div className="flex bg-stone-100 dark:bg-zinc-800 p-0.5 rounded-full border border-stone-200 dark:border-zinc-700 text-[10px]">
                    <button
                      onClick={() => setSidebarTaskFilter('date')}
                      className={`px-2 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
                        sidebarTaskFilter === 'date'
                          ? 'bg-[#582F89] text-white shadow-2xs'
                          : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                      }`}
                      title={`Задачи на ${selectedCalendarDay} ${monthNamesGenitive[calendarMonth]}`}
                    >
                      {selectedCalendarDay} {monthNamesGenitive[calendarMonth]?.slice(0, 3)}
                    </button>
                    <button
                      onClick={() => setSidebarTaskFilter('all')}
                      className={`px-2 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
                        sidebarTaskFilter === 'all'
                          ? 'bg-[#582F89] text-white shadow-2xs'
                          : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                      }`}
                      title="Показать все записи"
                    >
                      Все ({globalProjectTasksNotes.length})
                    </button>
                  </div>
                </div>

                {/* Filter computation */}
                {(() => {
                  const dayStr = selectedCalendarDay < 10 ? `0${selectedCalendarDay}` : `${selectedCalendarDay}`;
                  const monthStr = (calendarMonth + 1) < 10 ? `0${calendarMonth + 1}` : `${calendarMonth + 1}`;
                  const selectedFullDate = `${calendarYear}-${monthStr}-${dayStr}`;

                  const itemsForDate = globalProjectTasksNotes.filter((item: any) => {
                    if (!item.dueDate) return false;
                    return item.dueDate === selectedFullDate || item.dueDate.endsWith(`-${monthStr}-${dayStr}`);
                  });

                  const activeList = sidebarTaskFilter === 'date' ? itemsForDate : globalProjectTasksNotes;

                  if (activeList.length === 0) {
                    return (
                      <div className="glass-panel p-3.5 rounded-xl text-center space-y-2">
                        <CheckSquare className="w-5 h-5 mx-auto text-[var(--soft)] opacity-40" />
                        <p className="text-xs text-[var(--soft)]">
                          {sidebarTaskFilter === 'date'
                            ? `На ${selectedCalendarDay} ${monthNamesGenitive[calendarMonth]} нет задач или заметок.`
                            : 'Журнал задач пуст.'}
                        </p>
                        {sidebarTaskFilter === 'date' && globalProjectTasksNotes.length > 0 && (
                          <button
                            onClick={() => setSidebarTaskFilter('all')}
                            className="text-[10px] font-bold text-[#8C52D0] hover:underline cursor-pointer"
                          >
                            Показать все записи ({globalProjectTasksNotes.length})
                          </button>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5 custom-scrollbar">
                      {activeList.map((item: any) => {
                        const isTask = item.type === 'task';
                        const isCompleted = item.completed;

                        // Category styles
                        const categoryBadges: Record<string, string> = {
                          'Монтаж': 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
                          'Закупка': 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
                          'Смета': 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
                          'Логистика': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300',
                          'Клиент': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
                          'Важное': 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
                          'Общее': 'bg-stone-100 text-stone-700 dark:bg-zinc-800 dark:text-stone-300'
                        };
                        const catClass = categoryBadges[item.category] || categoryBadges['Общее'];

                        return (
                          <div
                            key={item.id}
                            className={`glass-panel p-2.5 rounded-xl border transition-all duration-300 hover:scale-[1.01] ${
                              isCompleted ? 'opacity-50' : ''
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {/* Left Icon or Checkbox */}
                              {isTask ? (
                                <button
                                  type="button"
                                  onClick={() => handleToggleGlobalTaskNote(item.id)}
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 cursor-pointer transition-all ${
                                    isCompleted
                                      ? 'bg-emerald-500 border-emerald-500 text-white'
                                      : 'border-zinc-400 dark:border-zinc-600 hover:border-[#8C52D0] bg-white/50'
                                  }`}
                                >
                                  {isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                                </button>
                              ) : (
                                <div className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                                  <FileText className="w-2.5 h-2.5" />
                                </div>
                              )}

                              {/* Main Content */}
                              <div className="flex-1 min-w-0 space-y-1">
                                <p className={`text-xs font-medium text-[var(--ink)] leading-tight ${isCompleted ? 'line-through text-[var(--faint)]' : ''}`}>
                                  {item.title}
                                </p>

                                <div className="flex items-center flex-wrap gap-1 text-[9px] font-medium">
                                  {/* Project badge */}
                                  <button
                                    onClick={() => {
                                      const found = projects.find(p => p.id === item.projectId || p.name === item.projectName);
                                      if (found) {
                                        setSelectedProject(found);
                                        setActiveTab('projectCard');
                                      }
                                    }}
                                    className="px-1.5 py-0.5 rounded bg-purple-100/80 dark:bg-purple-900/40 text-[#582F89] dark:text-purple-300 hover:underline truncate max-w-[120px] cursor-pointer"
                                  >
                                    {item.projectName || 'Проект'}
                                  </button>

                                  {/* Category */}
                                  <span className={`px-1.5 py-0.5 rounded ${catClass}`}>
                                    {item.category}
                                  </span>

                                  {/* Type pill */}
                                  <span className="text-stone-400 dark:text-stone-500">
                                    • {isTask ? 'Задача' : 'Заметка'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

            </div>
          ) : (
            /* COLLAPSED CONTENT (Shown only when sidebar is w-14) */
            <div className="flex flex-col items-center gap-3.5 w-full">
              {/* Collapsed Toggle Button aligned analogously to left sidebar */}
              <button
                onClick={() => setIsRightSidebarExpanded(true)}
                title="Развернуть боковую панель"
                className="w-7 h-7 rounded-full hover:bg-white/20 dark:hover:bg-black/20 flex items-center justify-center text-[var(--soft)] hover:text-[var(--ink)] cursor-pointer transition-all mb-0.5"
              >
                <ChevronsLeft className="w-3.5 h-3.5 text-[var(--soft)]" />
              </button>

              <div className="w-6 h-px bg-[var(--glass-edge)]" style={{ background: 'var(--line)' }} />

              {/* Collapsed Task Indicator with Badge */}
              <button
                onClick={() => setIsRightSidebarExpanded(true)}
                title={`Задачи на сегодня (${tasks.filter(t => !t.completed).length} активных)`}
                className="relative w-8 h-8 rounded-full bg-white/20 dark:bg-black/20 hover:bg-[var(--lavenderSoft)] dark:hover:bg-zinc-800 flex items-center justify-center text-[var(--soft)] hover:text-[var(--lavDeep)] transition-all cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                {tasks.filter(t => !t.completed).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[var(--warn)] text-[8px] font-bold text-white flex items-center justify-center shadow-sm">
                    {tasks.filter(t => !t.completed).length}
                  </span>
                )}
              </button>

              {/* Collapsed Calendar Trigger */}
              <button
                onClick={() => setIsRightSidebarExpanded(true)}
                title="Календарь на Июль"
                className="w-8 h-8 rounded-full bg-white/20 dark:bg-black/20 hover:bg-[var(--lavenderSoft)] dark:hover:bg-zinc-800 flex items-center justify-center text-[var(--soft)] hover:text-[var(--lavDeep)] transition-all cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
              </button>
              
              {/* Quick Statistics Trigger */}
              <button
                onClick={() => showToast('Статистика', 'Раздел отчетов сейчас формируется.', 'info')}
                title="Статистика за месяц"
                className="w-8 h-8 rounded-full bg-white/20 dark:bg-black/20 hover:bg-[var(--lavenderSoft)] dark:hover:bg-zinc-800 flex items-center justify-center text-[var(--soft)] hover:text-[var(--lavDeep)] transition-all cursor-pointer"
              >
                <TrendingUp className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </aside>

      </div>

      {/* 4. MODALS OVERLAYS */}
      {/* Add new project modal & Project Detail Card Modal */}
      <AnimatePresence>
        {isNewProjOpen && (
          <NewProjectModal
            isOpen={isNewProjOpen}
            onClose={() => setIsNewProjOpen(false)}
            onSubmit={handleCreateProject}
          />
        )}
      </AnimatePresence>

      {/* Global Delete Confirmation Dialog */}
      <DeleteConfirmModal
        isOpen={deleteConfirmState.isOpen}
        title={deleteConfirmState.title}
        itemName={deleteConfirmState.itemName}
        description={deleteConfirmState.description}
        confirmText={deleteConfirmState.confirmText}
        isDangerous={deleteConfirmState.isDangerous}
        onClose={() => setDeleteConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={deleteConfirmState.onConfirm}
      />

    </div>
  );
}