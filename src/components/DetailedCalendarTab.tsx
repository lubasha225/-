import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Clock,
  MapPin,
  Sparkles,
  CheckCircle2,
  X,
  FileText,
  FolderKanban,
  CheckSquare,
  Users,
  Check,
  Trash2,
  ArrowUpRight,
  RotateCcw,
  CalendarDays,
  ListTodo,
  Tag,
  AlertCircle
} from 'lucide-react';
import { Project } from '../types';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string;
  endTime?: string;
  category: 'montage' | 'client' | 'procurement' | 'demontage' | 'meeting' | 'general';
  categoryLabel: string;
  status: 'planned' | 'in_progress' | 'completed' | 'urgent';
  projectId?: string;
  projectName?: string;
  venue?: string;
  teamMembers?: string[];
  weatherForecast?: string;
  notes?: string;
  type?: 'event' | 'task' | 'note' | 'project_milestone';
  completed?: boolean;
  colorBg: string;
  colorText: string;
  colorBorder: string;
}

export interface ProjectTaskNoteItem {
  id: string;
  projectId?: string;
  projectName?: string;
  type: 'task' | 'note';
  title: string;
  dueDate: string; // YYYY-MM-DD
  completed?: boolean;
  category: 'Закупка' | 'Монтаж' | 'Смета' | 'Логистика' | 'Клиент' | 'Важное' | 'Общее';
  createdAt: string;
}

interface DetailedCalendarTabProps {
  projects: Project[];
  tasks: any[];
  onSelectProject: (project: Project) => void;
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warn') => void;
}

const getInitialEvents = (): CalendarEvent[] => {
  const now = new Date();
  const y = now.getFullYear();
  const m = (now.getMonth() + 1).toString().padStart(2, '0');
  const d = now.getDate();
  const pad = (n: number) => Math.max(1, Math.min(28, n)).toString().padStart(2, '0');

  const todayStr = `${y}-${m}-${pad(d)}`;
  const dayPlus2 = `${y}-${m}-${pad(d + 2)}`;
  const dayMinus3 = `${y}-${m}-${pad(d - 3)}`;
  const dayPlus5 = `${y}-${m}-${pad(d + 5)}`;
  const dayMinus7 = `${y}-${m}-${pad(d - 7)}`;

  return [
    {
      id: 'ev_1',
      title: 'Заезд & Монтаж главной арки',
      date: todayStr,
      time: '08:00',
      endTime: '12:00',
      category: 'montage',
      categoryLabel: 'Монтаж',
      status: 'in_progress',
      type: 'event',
      projectId: 'p2',
      projectName: 'День рождения · 30 лет',
      venue: 'Лофт «Верх», Краснодар',
      teamMembers: ['Денис С.', 'Михаил (бригадир)', '2 монтажника'],
      weatherForecast: '☀️ 28°C · Ясно',
      notes: 'Привезти неоновые конструкции и страховочные тросы.',
      colorBg: 'bg-purple-100 dark:bg-purple-950/60',
      colorText: 'text-purple-900 dark:text-purple-200',
      colorBorder: 'border-purple-300 dark:border-purple-700/60'
    },
    {
      id: 'ev_2',
      title: 'Встреча с организатором',
      date: todayStr,
      time: '14:30',
      endTime: '15:30',
      category: 'meeting',
      categoryLabel: 'Встреча',
      status: 'planned',
      type: 'event',
      projectId: 'p2',
      projectName: 'День рождения · 30 лет',
      venue: 'Кофейня Loft, ул. Красная 12',
      teamMembers: ['Анна Котова', 'Денис С.'],
      notes: 'Передать тайминг выноса торта и зажигания свечей.',
      colorBg: 'bg-blue-100 dark:bg-blue-950/60',
      colorText: 'text-blue-900 dark:text-blue-200',
      colorBorder: 'border-blue-300 dark:border-blue-700/60'
    },
    {
      id: 'ev_3',
      title: 'Закупка свежей флористики',
      date: dayMinus3,
      time: '06:00',
      endTime: '09:00',
      category: 'procurement',
      categoryLabel: 'Закупка',
      status: 'completed',
      type: 'event',
      projectId: 'p1',
      projectName: 'Свадьба · Ролл',
      venue: 'Оптовый центр «ФлораМаркет»',
      teamMembers: ['Елена (флорист)'],
      notes: 'Забрать пионовидные розы и эвкалипт.',
      colorBg: 'bg-emerald-100 dark:bg-emerald-950/60',
      colorText: 'text-emerald-900 dark:text-emerald-200',
      colorBorder: 'border-emerald-300 dark:border-emerald-700/60'
    },
    {
      id: 'ev_4',
      title: 'Демонтаж фотозоны и сдача декора',
      date: dayPlus2,
      time: '23:00',
      endTime: '01:30',
      category: 'demontage',
      categoryLabel: 'Демонтаж',
      status: 'planned',
      type: 'event',
      projectId: 'p4',
      projectName: 'Юбилей компании · 10 лет',
      venue: 'Банкетный холл «Олимп»',
      teamMembers: ['Михаил (бригадир)', '2 ночных сборщика'],
      weatherForecast: '🌙 20°C · Без осадков',
      notes: 'Упаковать световые балки в кофры.',
      colorBg: 'bg-rose-100 dark:bg-rose-950/60',
      colorText: 'text-rose-900 dark:text-rose-200',
      colorBorder: 'border-rose-300 dark:border-rose-700/60'
    },
    {
      id: 'ev_5',
      title: 'Показ площадки и замеры сцены',
      date: dayMinus7,
      time: '11:00',
      endTime: '12:30',
      category: 'client',
      categoryLabel: 'Клиент',
      status: 'completed',
      type: 'event',
      projectId: 'p3',
      projectName: 'Корпоратив · Бренд X',
      venue: 'Отель «Марриотт», Конференц-зал',
      teamMembers: ['Денис С.'],
      colorBg: 'bg-indigo-100 dark:bg-indigo-950/60',
      colorText: 'text-indigo-900 dark:text-indigo-200',
      colorBorder: 'border-indigo-300 dark:border-indigo-700/60'
    },
    {
      id: 'ev_6',
      title: 'Приемка текстиля из химчистки',
      date: dayPlus5,
      time: '16:00',
      endTime: '17:00',
      category: 'general',
      categoryLabel: 'Общее',
      status: 'planned',
      type: 'event',
      venue: 'Склад декора',
      teamMembers: ['Кладовщик Роман'],
      colorBg: 'bg-amber-100 dark:bg-amber-950/60',
      colorText: 'text-amber-900 dark:text-amber-200',
      colorBorder: 'border-amber-300 dark:border-amber-700/60'
    }
  ];
};

const monthNames = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const monthNamesGenitive = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];

const dayOfWeekNames = [
  'воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'
];

export default function DetailedCalendarTab({
  projects,
  tasks,
  onSelectProject,
  showToast
}: DetailedCalendarTabProps) {
  // Current month & year state (dynamically synced to actual current date)
  const [currentYear, setCurrentYear] = useState<number>(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => new Date().getMonth());

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [itemTypeFilter, setItemTypeFilter] = useState<'all' | 'events' | 'tasks'>('all');

  // Selected date state
  const [selectedDayNum, setSelectedDayNum] = useState<number>(() => new Date().getDate());
  const [activeEventDetail, setActiveEventDetail] = useState<CalendarEvent | null>(null);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [modalEntryType, setModalEntryType] = useState<'event' | 'task' | 'note'>('event');

  const [selectedDateForNewEvent, setSelectedDateForNewEvent] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  });

  // 1. Calendar Standalone Events state with local persistence
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('pop_calendar_events_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return getInitialEvents();
  });

  // Save standalone events to localStorage
  useEffect(() => {
    localStorage.setItem('pop_calendar_events_v3', JSON.stringify(events));
  }, [events]);

  // 2. Synchronized Project Tasks and Notes from Project Cards
  const [projectTasksNotes, setProjectTasksNotes] = useState<ProjectTaskNoteItem[]>(() => {
    const saved = localStorage.getItem('pop_project_tasks_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter((item: any) => item.id && !item._projectTouch);
      } catch (e) {}
    }
    return [];
  });

  // Reload tasks & notes when updated elsewhere in the app (e.g. ProjectDetailModal)
  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem('pop_project_tasks_v2');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setProjectTasksNotes(parsed.filter((item: any) => item.id && !item._projectTouch));
          }
        } catch (e) {}
      }
    };

    window.addEventListener('project_tasks_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('project_tasks_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Helper to update project tasks locally and globally
  const updateGlobalProjectTasks = (updated: ProjectTaskNoteItem[]) => {
    setProjectTasksNotes(updated);
    localStorage.setItem('pop_project_tasks_v2', JSON.stringify(updated));
    window.dispatchEvent(new Event('project_tasks_updated'));
  };

  // Convert project tasks/notes and project milestones into unified calendar items
  const unifiedCalendarItems = useMemo<CalendarEvent[]>(() => {
    const items: CalendarEvent[] = [...events];

    // Add project tasks and notes from project cards
    projectTasksNotes.forEach(ptn => {
      if (!ptn.dueDate) return;

      const isTask = ptn.type === 'task';
      let category: CalendarEvent['category'] = 'general';
      let colorBg = 'bg-stone-100 dark:bg-zinc-800/80';
      let colorText = 'text-stone-800 dark:text-stone-200';
      let colorBorder = 'border-stone-300 dark:border-zinc-700';

      if (ptn.category === 'Монтаж') {
        category = 'montage';
        colorBg = 'bg-purple-100 dark:bg-purple-950/60';
        colorText = 'text-purple-900 dark:text-purple-200';
        colorBorder = 'border-purple-300 dark:border-purple-700/60';
      } else if (ptn.category === 'Закупка') {
        category = 'procurement';
        colorBg = 'bg-emerald-100 dark:bg-emerald-950/60';
        colorText = 'text-emerald-900 dark:text-emerald-200';
        colorBorder = 'border-emerald-300 dark:border-emerald-700/60';
      } else if (ptn.category === 'Логистика' || ptn.category === 'Смета') {
        category = 'meeting';
        colorBg = 'bg-blue-100 dark:bg-blue-950/60';
        colorText = 'text-blue-900 dark:text-blue-200';
        colorBorder = 'border-blue-300 dark:border-blue-700/60';
      } else if (ptn.category === 'Клиент') {
        category = 'client';
        colorBg = 'bg-indigo-100 dark:bg-indigo-950/60';
        colorText = 'text-indigo-900 dark:text-indigo-200';
        colorBorder = 'border-indigo-300 dark:border-indigo-700/60';
      } else if (ptn.category === 'Важное') {
        category = 'demontage';
        colorBg = 'bg-rose-100 dark:bg-rose-950/60';
        colorText = 'text-rose-900 dark:text-rose-200';
        colorBorder = 'border-rose-300 dark:border-rose-700/60';
      }

      items.push({
        id: ptn.id,
        title: ptn.title,
        date: ptn.dueDate,
        time: isTask ? 'Задача' : 'Заметка',
        category,
        categoryLabel: ptn.category || (isTask ? 'Задача проекта' : 'Заметка проекта'),
        status: ptn.completed ? 'completed' : 'planned',
        type: ptn.type,
        completed: ptn.completed,
        projectId: ptn.projectId,
        projectName: ptn.projectName,
        colorBg,
        colorText,
        colorBorder
      });
    });

    // Add main project dates / milestones
    projects.forEach(proj => {
      if (proj.date) {
        const pDate = proj.date.split('T')[0];
        // Check if not duplicate
        const alreadyExists = items.some(i => i.projectId === proj.id && i.type === 'project_milestone');
        if (!alreadyExists) {
          items.push({
            id: `proj_date_${proj.id}`,
            title: `Событие: ${proj.name}`,
            date: pDate,
            time: 'Главный день',
            category: 'montage',
            categoryLabel: 'Мероприятие проекта',
            status: proj.status === 'approved' ? 'completed' : 'planned',
            type: 'project_milestone',
            projectId: proj.id,
            projectName: proj.name,
            venue: proj.venue,
            notes: `Клиент: ${proj.clientName || 'Не указан'}`,
            colorBg: 'bg-purple-100 dark:bg-purple-950/80',
            colorText: 'text-purple-950 dark:text-purple-100 font-bold',
            colorBorder: 'border-purple-400 dark:border-purple-600'
          });
        }
      }
    });

    return items;
  }, [events, projectTasksNotes, projects]);

  // Form Fields for Adding Event / Task
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('10:00');
  const [newCategory, setNewCategory] = useState<'montage' | 'procurement' | 'meeting' | 'demontage' | 'client' | 'general'>('montage');
  const [newProjectId, setNewProjectId] = useState<string>('');
  const [newVenue, setNewVenue] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleGoToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDayNum(today.getDate());
  };

  // Generate days matrix for calendar grid
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // 0 = Mon, 6 = Sun
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const todayDate = new Date();
    const realYear = todayDate.getFullYear();
    const realMonth = todayDate.getMonth();
    const realDay = todayDate.getDate();

    const days: Array<{
      num: number;
      currentMonth: boolean;
      fullDateStr: string;
      isToday: boolean;
    }> = [];

    // Previous month padding
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      const pNum = prevMonthDays - i;
      const prevM = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
      const mStr = (prevM + 1).toString().padStart(2, '0');
      const dStr = pNum.toString().padStart(2, '0');
      days.push({
        num: pNum,
        currentMonth: false,
        fullDateStr: `${prevY}-${mStr}-${dStr}`,
        isToday: false
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const mStr = (currentMonth + 1).toString().padStart(2, '0');
      const dStr = d.toString().padStart(2, '0');
      const fullDateStr = `${currentYear}-${mStr}-${dStr}`;
      const isToday = currentYear === realYear && currentMonth === realMonth && d === realDay;

      days.push({
        num: d,
        currentMonth: true,
        fullDateStr,
        isToday
      });
    }

    // Next month padding to complete 35 or 42 cells
    const remainingCells = (35 - days.length >= 0) ? (35 - days.length) : (42 - days.length);
    for (let n = 1; n <= remainingCells; n++) {
      const nextM = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
      const mStr = (nextM + 1).toString().padStart(2, '0');
      const dStr = n.toString().padStart(2, '0');
      days.push({
        num: n,
        currentMonth: false,
        fullDateStr: `${nextY}-${mStr}-${dStr}`,
        isToday: false
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Group filtered events by date
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    unifiedCalendarItems.forEach(ev => {
      // Category filter
      if (selectedCategory !== 'all' && ev.category !== selectedCategory) return;

      // Type filter
      if (itemTypeFilter === 'events' && ev.type !== 'event' && ev.type !== 'project_milestone') return;
      if (itemTypeFilter === 'tasks' && ev.type !== 'task' && ev.type !== 'note') return;

      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = ev.title.toLowerCase().includes(q);
        const matchProject = ev.projectName?.toLowerCase().includes(q);
        const matchVenue = ev.venue?.toLowerCase().includes(q);
        if (!matchTitle && !matchProject && !matchVenue) return;
      }

      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    return map;
  }, [unifiedCalendarItems, selectedCategory, itemTypeFilter, searchQuery]);

  // Selected date string
  const selectedDateStr = useMemo(() => {
    const mStr = (currentMonth + 1).toString().padStart(2, '0');
    const dStr = (selectedDayNum || 1).toString().padStart(2, '0');
    return `${currentYear}-${mStr}-${dStr}`;
  }, [currentYear, currentMonth, selectedDayNum]);

  // Day of week for selected date
  const selectedDayOfWeek = useMemo(() => {
    const d = new Date(currentYear, currentMonth, selectedDayNum || 1);
    return dayOfWeekNames[d.getDay()];
  }, [currentYear, currentMonth, selectedDayNum]);

  // Events on selected day
  const selectedDayItems = useMemo(() => {
    return eventsByDate[selectedDateStr] || [];
  }, [eventsByDate, selectedDateStr]);

  // Toggle Task Completion
  const handleToggleTask = (itemId: string) => {
    // Check if it's in projectTasksNotes
    const existsInProjectTasks = projectTasksNotes.find(t => t.id === itemId);
    if (existsInProjectTasks) {
      const updated = projectTasksNotes.map(t =>
        t.id === itemId ? { ...t, completed: !t.completed } : t
      );
      updateGlobalProjectTasks(updated);
      showToast('Статус обновлен', 'Статус задачи синхронизирован с карточкой проекта.', 'info');
      return;
    }

    // Check if it's standalone event
    setEvents(prev => prev.map(e =>
      e.id === itemId ? { ...e, status: e.status === 'completed' ? 'planned' : 'completed', completed: !e.completed } : e
    ));
  };

  // Delete an item
  const handleDeleteItem = (item: CalendarEvent) => {
    if (item.type === 'task' || item.type === 'note') {
      const updated = projectTasksNotes.filter(t => t.id !== item.id);
      updateGlobalProjectTasks(updated);
      showToast('Удалено', 'Запись удалена из карточки проекта и календаря.', 'info');
    } else if (item.type === 'project_milestone') {
      showToast('Информация', 'Дата мероприятия проекта управляется в карточке проекта.', 'info');
    } else {
      setEvents(prev => prev.filter(e => e.id !== item.id));
      showToast('Удалено', 'Событие удалено из календаря.', 'info');
    }
    setActiveEventDetail(null);
  };

  // Handle Add Form Submit
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Внимание', 'Введите название', 'warn');
      return;
    }

    const selectedProjObj = projects.find(p => p.id === newProjectId);

    if (modalEntryType === 'task' || modalEntryType === 'note') {
      // Add to Project Tasks / Notes
      const catLabels: Record<string, ProjectTaskNoteItem['category']> = {
        montage: 'Монтаж',
        procurement: 'Закупка',
        meeting: 'Смета',
        demontage: 'Важное',
        client: 'Клиент',
        general: 'Общее'
      };

      const newPtn: ProjectTaskNoteItem = {
        id: `ptn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        projectId: selectedProjObj?.id || 'p1',
        projectName: selectedProjObj?.name || 'Общий проект',
        type: modalEntryType,
        title: newTitle.trim(),
        dueDate: selectedDateForNewEvent,
        completed: false,
        category: catLabels[newCategory] || 'Общее',
        createdAt: new Date().toLocaleDateString('ru-RU')
      };

      updateGlobalProjectTasks([...projectTasksNotes, newPtn]);
      showToast(
        modalEntryType === 'task' ? 'Задача создана' : 'Заметка сохранена',
        `Синхронизировано с карточкой проекта «${newPtn.projectName}» на ${selectedDateForNewEvent}`,
        'success'
      );
    } else {
      // Add as Calendar Event
      let colorBg = 'bg-purple-100 dark:bg-purple-950/60';
      let colorText = 'text-purple-900 dark:text-purple-200';
      let colorBorder = 'border-purple-300 dark:border-purple-700/60';
      let categoryLabel = 'Монтаж';

      if (newCategory === 'procurement') {
        colorBg = 'bg-emerald-100 dark:bg-emerald-950/60';
        colorText = 'text-emerald-900 dark:text-emerald-200';
        colorBorder = 'border-emerald-300 dark:border-emerald-700/60';
        categoryLabel = 'Закупка';
      } else if (newCategory === 'meeting') {
        colorBg = 'bg-blue-100 dark:bg-blue-950/60';
        colorText = 'text-blue-900 dark:text-blue-200';
        colorBorder = 'border-blue-300 dark:border-blue-700/60';
        categoryLabel = 'Встреча';
      } else if (newCategory === 'demontage') {
        colorBg = 'bg-rose-100 dark:bg-rose-950/60';
        colorText = 'text-rose-900 dark:text-rose-200';
        colorBorder = 'border-rose-300 dark:border-rose-700/60';
        categoryLabel = 'Демонтаж';
      } else if (newCategory === 'client') {
        colorBg = 'bg-indigo-100 dark:bg-indigo-950/60';
        colorText = 'text-indigo-900 dark:text-indigo-200';
        colorBorder = 'border-indigo-300 dark:border-indigo-700/60';
        categoryLabel = 'Клиент';
      } else if (newCategory === 'general') {
        colorBg = 'bg-amber-100 dark:bg-amber-950/60';
        colorText = 'text-amber-900 dark:text-amber-200';
        colorBorder = 'border-amber-300 dark:border-amber-700/60';
        categoryLabel = 'Общее';
      }

      const newEv: CalendarEvent = {
        id: 'ev_' + Date.now(),
        title: newTitle.trim(),
        date: selectedDateForNewEvent,
        time: newTime || '10:00',
        category: newCategory,
        categoryLabel,
        status: 'planned',
        type: 'event',
        projectId: selectedProjObj?.id,
        projectName: selectedProjObj?.name,
        venue: newVenue.trim() || selectedProjObj?.venue,
        notes: newNotes.trim(),
        colorBg,
        colorText,
        colorBorder
      };

      setEvents(prev => [...prev, newEv]);
      showToast('Событие добавлено', `Запланировано на ${newEv.date}: «${newEv.title}»`, 'success');
    }

    // Reset Form
    setNewTitle('');
    setNewVenue('');
    setNewNotes('');
    setIsAddEventModalOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-fadeIn">
      {/* 1. TOP HEADER TOOLBAR: Controls & Filters */}
      <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] sm:rounded-[32px] border border-zinc-200/50 dark:border-zinc-800/40 p-4 sm:p-5 shadow-xs flex flex-col gap-3.5">
        
        {/* Row 1: Month Title & Navigation | Search | Add Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Month & Year Title with Nav buttons */}
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <div className="flex items-center gap-1 bg-white/70 dark:bg-zinc-800/70 p-1 rounded-full border border-zinc-200/60 dark:border-zinc-700/60 shadow-2xs">
              <button
                onClick={handlePrevMonth}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                title="Предыдущий месяц"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleGoToday}
                className="px-2.5 sm:px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/80 text-[var(--lavDeep)] dark:text-purple-300 font-bold text-xs hover:opacity-90 transition-all cursor-pointer"
              >
                Сегодня
              </button>
              <button
                onClick={handleNextMonth}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                title="Следующий месяц"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-lg sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {monthNames[currentMonth]} {currentYear}
            </h2>
          </div>

          {/* Search, Filter & Quick Add Action */}
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Поиск по событиям и задачам..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/70 dark:bg-zinc-800/70 border border-zinc-200/60 dark:border-zinc-700/60 rounded-full pl-8 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--lavenderAccent)]/40"
              />
            </div>

            {/* Main Add Button using active theme gradient */}
            <button
              onClick={() => {
                setSelectedDateForNewEvent(selectedDateStr);
                setIsAddEventModalOpen(true);
              }}
              style={{ background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' }}
              className="text-white rounded-full px-3.5 sm:px-4 py-1.5 text-xs font-semibold shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Добавить событие / задачу</span>
              <span className="sm:hidden">Добавить</span>
            </button>
          </div>
        </div>

        {/* Row 2: Category Filter Pills & Item Type Switches */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-zinc-200/40 dark:border-zinc-800/40">
          
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
            {[
              { key: 'all', label: 'Все категории' },
              { key: 'montage', label: '💜 Монтажи' },
              { key: 'procurement', label: '🌿 Закупки' },
              { key: 'meeting', label: '💙 Встречи / Сметы' },
              { key: 'client', label: '🔮 Клиенты' },
              { key: 'demontage', label: '🌹 Демонтаж' }
            ].map(cat => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.key
                    ? 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200 border border-purple-300 dark:border-purple-700'
                    : 'bg-white/50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 border border-transparent'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Type Toggle: All / Events / Tasks */}
          <div className="flex items-center gap-1 bg-white/60 dark:bg-zinc-800/60 p-0.5 rounded-full border border-zinc-200/60 dark:border-zinc-700/60 text-[11px] font-semibold">
            <button
              onClick={() => setItemTypeFilter('all')}
              className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                itemTypeFilter === 'all'
                  ? 'bg-purple-100 dark:bg-purple-900/80 text-[var(--lavDeep)] dark:text-purple-200 shadow-2xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              Все
            </button>
            <button
              onClick={() => setItemTypeFilter('events')}
              className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                itemTypeFilter === 'events'
                  ? 'bg-purple-100 dark:bg-purple-900/80 text-[var(--lavDeep)] dark:text-purple-200 shadow-2xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              События
            </button>
            <button
              onClick={() => setItemTypeFilter('tasks')}
              className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                itemTypeFilter === 'tasks'
                  ? 'bg-purple-100 dark:bg-purple-900/80 text-[var(--lavDeep)] dark:text-purple-200 shadow-2xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              Задачи из проектов
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN CALENDAR GRID (Clean, Aesthetic, Compact on Mobile, Spacious on Desktop) */}
      <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] sm:rounded-[32px] border border-zinc-200/50 dark:border-zinc-800/40 p-3 sm:p-6 shadow-xs">
        
        {/* Weekday Labels Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[11px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pb-2.5 border-b border-zinc-200/50 dark:border-zinc-800/50">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, i) => (
            <div key={i} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid Container: Clean, uncluttered circular/rounded cells with indicator dots */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mt-2.5">
          {calendarDays.map((day, idx) => {
            const dayEvents = eventsByDate[day.fullDateStr] || [];
            const isSelected = selectedDayNum === day.num && day.currentMonth;
            const hasEvents = dayEvents.length > 0;

            // Categories present on this date for colored dots
            const hasMontage = dayEvents.some(e => e.category === 'montage');
            const hasProcurement = dayEvents.some(e => e.category === 'procurement');
            const hasMeeting = dayEvents.some(e => e.category === 'meeting');
            const hasDemontage = dayEvents.some(e => e.category === 'demontage');
            const hasClient = dayEvents.some(e => e.category === 'client');

            return (
              <div
                key={idx}
                onClick={() => {
                  if (day.currentMonth) setSelectedDayNum(day.num);
                }}
                className={`min-h-[46px] sm:min-h-[64px] lg:min-h-[76px] p-1 sm:p-2 rounded-2xl sm:rounded-3xl border transition-all duration-200 flex flex-col items-center justify-between group relative cursor-pointer ${
                  !day.currentMonth
                    ? 'bg-zinc-100/20 dark:bg-zinc-900/10 border-transparent opacity-25 select-none'
                    : isSelected
                    ? 'bg-purple-50/95 dark:bg-purple-950/50 border-[var(--lavDeep)] dark:border-purple-500 shadow-xs ring-2 ring-[var(--lavenderAccent)]/30'
                    : hasEvents
                    ? 'bg-white/70 dark:bg-zinc-800/60 hover:bg-white dark:hover:bg-zinc-800/90 border-purple-200/60 dark:border-purple-900/40'
                    : 'bg-white/40 dark:bg-zinc-800/30 hover:bg-white/80 dark:hover:bg-zinc-800/70 border-zinc-200/40 dark:border-zinc-800/40'
                }`}
              >
                {/* Day Number Badge */}
                <div className="flex items-center justify-center">
                  <span
                    className={`inline-flex items-center justify-center text-xs sm:text-sm font-extrabold w-6 h-6 sm:w-7 sm:h-7 rounded-full transition-transform group-hover:scale-105 ${
                      day.isToday
                        ? 'bg-gradient-to-r from-[var(--primary-grad-from,#8C52D0)] to-[var(--primary-grad-to,#582F89)] text-white shadow-2xs'
                        : isSelected
                        ? 'bg-purple-200/80 dark:bg-purple-800 text-[var(--lavDeep)] dark:text-purple-100'
                        : day.currentMonth
                        ? 'text-zinc-800 dark:text-zinc-200'
                        : 'text-zinc-400'
                    }`}
                  >
                    {day.num}
                  </span>
                </div>

                {/* Event Indicators (Clean Dots for Mobile & Desktop) */}
                {day.currentMonth && hasEvents && (
                  <div className="flex items-center justify-center gap-1 mt-1 flex-wrap px-0.5">
                    {hasMontage && <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-2xs" title="Монтаж" />}
                    {hasProcurement && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-2xs" title="Закупка" />}
                    {hasMeeting && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-2xs" title="Встреча / Смета" />}
                    {hasDemontage && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-2xs" title="Демонтаж" />}
                    {hasClient && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-2xs" title="Клиент" />}
                    
                    {/* Count badge on desktop screens */}
                    <span className="hidden sm:inline text-[9px] font-bold text-zinc-500 dark:text-zinc-400 ml-0.5">
                      {dayEvents.length > 1 ? `(${dayEvents.length})` : ''}
                    </span>
                  </div>
                )}

                {/* Empty spacer if no events to keep layout consistent */}
                {(!hasEvents || !day.currentMonth) && <div className="h-2" />}
              </div>
            );
          })}
        </div>

        {/* Legend bar below the calendar */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-4 pt-3 border-t border-zinc-200/40 dark:border-zinc-800/40">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500" /> Монтажи и декор
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Закупки флористики
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> Встречи и логистика
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" /> Задачи клиентов
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Демонтаж / Срочно
          </span>
        </div>
      </div>

      {/* 3. SELECTED DAY SCHEDULE & TASKS CARD (Placed below the calendar for perfect mobile viewing) */}
      <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] sm:rounded-[32px] border border-zinc-200/50 dark:border-zinc-800/40 p-4 sm:p-6 shadow-xs space-y-4">
        
        {/* Header of the Selected Day Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[var(--lavenderSoft)] rounded-xl shrink-0 text-[var(--primary-accent)] dark:text-[var(--lavenderAccent)]">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>{selectedDayNum} {monthNamesGenitive[currentMonth]} {currentYear}</span>
                <span className="text-xs font-normal text-zinc-500">({selectedDayOfWeek})</span>
              </h3>
              <p className="text-xs sm:text-sm font-normal text-zinc-700 dark:text-zinc-300 leading-relaxed">
                События, монтажи и задачи декоратора на выбранный день
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200 border border-purple-200 dark:border-purple-800">
              {selectedDayItems.length} {selectedDayItems.length === 1 ? 'запись' : selectedDayItems.length >= 2 && selectedDayItems.length <= 4 ? 'записи' : 'записей'}
            </span>

            {/* Quick Add Button directly in day section */}
            <button
              onClick={() => {
                setSelectedDateForNewEvent(selectedDateStr);
                setIsAddEventModalOpen(true);
              }}
              style={{ background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' }}
              className="text-white rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-xs hover:opacity-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Добавить</span>
            </button>
          </div>
        </div>

        {/* List of items on this selected date */}
        {selectedDayItems.length === 0 ? (
          <div className="py-10 text-center space-y-3 bg-white/30 dark:bg-zinc-800/20 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300 flex items-center justify-center mx-auto">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                На {selectedDayNum} {monthNamesGenitive[currentMonth]} пока нет записей
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Запланируйте монтаж, встречу с клиентом, закупку или задачу проекта.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedDateForNewEvent(selectedDateStr);
                setIsAddEventModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white dark:bg-zinc-800 border border-[var(--primary-accent)]/30 text-[var(--primary-accent)] dark:text-[var(--lavenderAccent)] text-xs font-semibold hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-all cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" /> Запланировать на этот день
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {selectedDayItems.map((item) => {
              const isTask = item.type === 'task';
              const isProjectMilestone = item.type === 'project_milestone';

              return (
                <div
                  key={item.id}
                  onClick={() => setActiveEventDetail(item)}
                  className={`p-4 rounded-2xl border transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between gap-3 ${
                    item.completed
                      ? 'bg-white/40 dark:bg-zinc-900/40 border-zinc-200/60 dark:border-zinc-800 opacity-75'
                      : `${item.colorBg} ${item.colorBorder}`
                  }`}
                >
                  {/* Card Header: Category & Type Badge + Time / Completion Checkbox */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Category Label */}
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/80 dark:bg-black/30 text-zinc-800 dark:text-zinc-200 border border-black/5 dark:border-white/10 shadow-2xs">
                        {item.categoryLabel}
                      </span>

                      {/* Item Type Pill */}
                      {item.type && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.type === 'task'
                            ? 'bg-purple-200/80 dark:bg-purple-900/70 text-purple-900 dark:text-purple-200'
                            : item.type === 'note'
                            ? 'bg-amber-200/80 dark:bg-amber-900/70 text-amber-900 dark:text-amber-200'
                            : item.type === 'project_milestone'
                            ? 'bg-rose-200/80 dark:bg-rose-900/70 text-rose-900 dark:text-rose-200'
                            : 'bg-blue-200/80 dark:bg-blue-900/70 text-blue-900 dark:text-blue-200'
                        }`}>
                          {item.type === 'task' ? 'Задача' : item.type === 'note' ? 'Заметка' : item.type === 'project_milestone' ? 'Проект' : 'Событие'}
                        </span>
                      )}
                    </div>

                    {/* Time / Task Status */}
                    <div className="flex items-center gap-2">
                      {isTask ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleTask(item.id);
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                            item.completed
                              ? 'bg-emerald-500 text-white shadow-2xs'
                              : 'bg-white/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-600 hover:border-purple-500'
                          }`}
                        >
                          <Check className={`w-3.5 h-3.5 ${item.completed ? 'stroke-[3]' : 'opacity-40'}`} />
                          <span>{item.completed ? 'Выполнено' : 'Сделать'}</span>
                        </button>
                      ) : (
                        <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 opacity-70" />
                          {item.time} {item.endTime ? `– ${item.endTime}` : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Notes */}
                  <div className="space-y-1">
                    <h4 className={`text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug ${
                      item.completed ? 'line-through text-zinc-500 dark:text-zinc-400' : ''
                    }`}>
                      {item.title}
                    </h4>
                    {item.notes && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2">
                        {item.notes}
                      </p>
                    )}
                  </div>

                  {/* Project & Venue Footers */}
                  <div className="pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between gap-2 text-xs">
                    {item.projectName ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const proj = projects.find(p => p.id === item.projectId || p.name === item.projectName);
                          if (proj) {
                            onSelectProject(proj);
                          }
                        }}
                        className="flex items-center gap-1 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] font-semibold hover:underline truncate"
                      >
                        <FolderKanban className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{item.projectName}</span>
                        <ArrowUpRight className="w-3 h-3 shrink-0" />
                      </button>
                    ) : item.venue ? (
                      <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400 text-[11px] truncate">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-purple-500" />
                        <span className="truncate">{item.venue}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-zinc-400">Общая запись</span>
                    )}

                    {/* Quick Delete button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item);
                      }}
                      className="p-1 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Удалить"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. MODAL: ADD EVENT / TASK / NOTE */}
      <AnimatePresence>
        {isAddEventModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-zinc-900 dark:text-zinc-100">
                    Добавить в календарь
                  </h3>
                  <p className="text-xs text-zinc-500">Событие, монтаж или задача с привязкой к проекту</p>
                </div>
                <button
                  onClick={() => setIsAddEventModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Type Switcher: Событие / Задача проекта / Заметка */}
              <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-full border border-zinc-200 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => setModalEntryType('event')}
                  className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer text-center ${
                    modalEntryType === 'event'
                      ? 'bg-[var(--lavDeep)] text-white shadow-2xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                  }`}
                >
                  📅 Событие
                </button>
                <button
                  type="button"
                  onClick={() => setModalEntryType('task')}
                  className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer text-center ${
                    modalEntryType === 'task'
                      ? 'bg-[var(--lavDeep)] text-white shadow-2xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                  }`}
                >
                  ☑️ Задача проекта
                </button>
                <button
                  type="button"
                  onClick={() => setModalEntryType('note')}
                  className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer text-center ${
                    modalEntryType === 'note'
                      ? 'bg-[var(--lavDeep)] text-white shadow-2xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                  }`}
                >
                  📝 Заметка
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
                {/* Title */}
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    {modalEntryType === 'task' ? 'Текст задачи *' : modalEntryType === 'note' ? 'Содержание заметки *' : 'Название события *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      modalEntryType === 'task'
                        ? 'Например: Заказать пионы у оптовика, упаковать балки...'
                        : modalEntryType === 'note'
                        ? 'Например: Въезд через ворота №2, заказчик просит золотые подсвечники...'
                        : 'Например: Заезд бригады & сборка арки'
                    }
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--lavenderAccent)]/50"
                  />
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Дата
                    </label>
                    <input
                      type="date"
                      value={selectedDateForNewEvent}
                      onChange={(e) => setSelectedDateForNewEvent(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--lavenderAccent)]/50"
                    />
                  </div>

                  {modalEntryType === 'event' ? (
                    <div>
                      <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Время начала
                      </label>
                      <input
                        type="time"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--lavenderAccent)]/50"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Приоритет
                      </label>
                      <div className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                        Синхронно с проектом
                      </div>
                    </div>
                  )}
                </div>

                {/* Category & Project Binding */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Категория
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
                    >
                      <option value="montage">💜 Монтаж & Заезд</option>
                      <option value="procurement">🌿 Закупка флористики/декора</option>
                      <option value="meeting">💙 Встреча / Смета / Логистика</option>
                      <option value="client">🔮 Клиент / Согласование</option>
                      <option value="demontage">🌹 Демонтаж / Важное</option>
                      <option value="general">Общие задачи</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Привязать к проекту
                    </label>
                    <select
                      value={newProjectId}
                      onChange={(e) => setNewProjectId(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
                    >
                      <option value="">{modalEntryType === 'task' ? 'Выберите проект (рекомендуется)' : 'Без привязки'}</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name} {p.clientName ? `(${p.clientName})` : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Venue */}
                {modalEntryType === 'event' && (
                  <div>
                    <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Место / Локация
                    </label>
                    <input
                      type="text"
                      placeholder="Локация площадки или адрес"
                      value={newVenue}
                      onChange={(e) => setNewVenue(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                    />
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Примечания и детали
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Дополнительные комментарии для команды декораторов..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-3 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>

                {/* Submit Actions */}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
                  <button
                    type="button"
                    onClick={() => setIsAddEventModalOpen(false)}
                    className="px-4 py-2 rounded-full border border-zinc-300 text-zinc-600 dark:text-zinc-400 font-semibold cursor-pointer"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    style={{ background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' }}
                    className="text-white rounded-full px-5 py-2 text-xs font-semibold shadow-xs hover:opacity-95 transition-all cursor-pointer"
                  >
                    Сохранить в календарь
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. EVENT DETAILS DIALOG */}
      <AnimatePresence>
        {activeEventDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 p-6 max-w-lg w-full shadow-2xl space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-full inline-block mb-2 ${activeEventDetail.colorBg} ${activeEventDetail.colorText}`}>
                    {activeEventDetail.categoryLabel} · {activeEventDetail.time}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                    {activeEventDetail.title}
                  </h3>
                </div>

                <button
                  onClick={() => setActiveEventDetail(null)}
                  className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                  <CalendarIcon className="w-4 h-4 text-purple-600 shrink-0" />
                  <span className="font-semibold">Дата: {activeEventDetail.date}</span>
                </div>

                {activeEventDetail.venue && (
                  <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                    <MapPin className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Площадка: {activeEventDetail.venue}</span>
                  </div>
                )}

                {activeEventDetail.projectName && (
                  <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                    <FolderKanban className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Проект: {activeEventDetail.projectName}</span>
                  </div>
                )}

                {activeEventDetail.notes && (
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60">
                    <span className="font-bold block mb-1 text-zinc-800 dark:text-zinc-200">Заметки и инструкции:</span>
                    <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">{activeEventDetail.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                {activeEventDetail.projectId && (
                  <button
                    onClick={() => {
                      const proj = projects.find(p => p.id === activeEventDetail.projectId || p.name === activeEventDetail.projectName);
                      if (proj) {
                        onSelectProject(proj);
                      }
                      setActiveEventDetail(null);
                    }}
                    style={{ background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' }}
                    className="text-white rounded-full px-5 py-2 text-xs font-semibold shadow-xs hover:opacity-90 transition-all cursor-pointer"
                  >
                    Перейти к карточке проекта
                  </button>
                )}

                <button
                  onClick={() => handleDeleteItem(activeEventDetail)}
                  className="px-4 py-2 rounded-full border border-rose-300 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-50 cursor-pointer"
                >
                  Удалить
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
