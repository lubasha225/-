import React, { useState, useMemo } from 'react';
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
  User,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  MoreHorizontal,
  X,
  FileText,
  FolderKanban,
  Zap,
  ArrowRight,
  Sun,
  CloudRain,
  Tag,
  Users,
  Maximize2
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
  colorBg: string;
  colorText: string;
  colorBorder: string;
}

interface DetailedCalendarTabProps {
  projects: Project[];
  tasks: any[];
  onSelectProject: (project: Project) => void;
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warn') => void;
}

export default function DetailedCalendarTab({
  projects,
  tasks,
  onSelectProject,
  showToast
}: DetailedCalendarTabProps) {
  // Current month & year state
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(6); // 0 = Jan, 6 = July 2026

  // View mode
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Selected event or date state
  const [selectedDayNum, setSelectedDayNum] = useState<number | null>(18);
  const [activeEventDetail, setActiveEventDetail] = useState<CalendarEvent | null>(null);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [selectedDateForNewEvent, setSelectedDateForNewEvent] = useState<string>('2026-07-18');

  // Initial rich events state with local persistence
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('pop_calendar_events_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      {
        id: 'ev_1',
        title: 'Заезд & Монтаж главной арки',
        date: '2026-07-18',
        time: '08:00',
        endTime: '12:00',
        category: 'montage',
        categoryLabel: 'Монтаж',
        status: 'in_progress',
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
        date: '2026-07-18',
        time: '14:30',
        endTime: '15:30',
        category: 'meeting',
        categoryLabel: 'Встреча',
        status: 'planned',
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
        date: '2026-07-14',
        time: '06:00',
        endTime: '09:00',
        category: 'procurement',
        categoryLabel: 'Закупка',
        status: 'completed',
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
        date: '2026-07-25',
        time: '23:00',
        endTime: '01:30',
        category: 'demontage',
        categoryLabel: 'Демонтаж',
        status: 'planned',
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
        date: '2026-07-08',
        time: '11:00',
        endTime: '12:30',
        category: 'client',
        categoryLabel: 'Клиент',
        status: 'completed',
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
        date: '2026-07-22',
        time: '16:00',
        endTime: '17:00',
        category: 'general',
        categoryLabel: 'Общее',
        status: 'planned',
        venue: 'Склад декора',
        teamMembers: ['Кладовщик Роман'],
        colorBg: 'bg-amber-100 dark:bg-amber-950/60',
        colorText: 'text-amber-900 dark:text-amber-200',
        colorBorder: 'border-amber-300 dark:border-amber-700/60'
      }
    ];
  });

  // Save to localStorage on change
  React.useEffect(() => {
    localStorage.setItem('pop_calendar_events_v2', JSON.stringify(events));
  }, [events]);

  // Unscheduled drafts pool
  const [unscheduledDrafts, setUnscheduledDrafts] = useState([
    { id: 'ud_1', title: 'Запросить схему розеток у лофта', category: 'Встреча', project: 'День рождения · 30 лет' },
    { id: 'ud_2', title: 'Проверить исправность неоновой надписи', category: 'Склад', project: 'Корпоратив · Бренд X' },
    { id: 'ud_3', title: 'Согласовать время въезда грузовика', category: 'Логистика', project: 'Свадьба · Ролл' }
  ]);

  // New Event Form fields
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('10:00');
  const [newEventCategory, setNewEventCategory] = useState<'montage' | 'client' | 'procurement' | 'demontage' | 'meeting' | 'general'>('montage');
  const [newEventProjectId, setNewEventProjectId] = useState<string>('');
  const [newEventVenue, setNewEventVenue] = useState('');
  const [newEventNotes, setNewEventNotes] = useState('');

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const monthNamesGenitive = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];

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
    setCurrentMonth(6); // July
    setCurrentYear(2026);
    setSelectedDayNum(18);
  };

  // Generate days matrix for calendar grid
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    // In Russian calendar, week starts on Monday (0 = Mon, 6 = Sun)
    const startingDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const days: Array<{
      num: number;
      currentMonth: boolean;
      fullDateStr: string;
      isToday: boolean;
    }> = [];

    // Previous month padding
    for (let i = startingDay - 1; i >= 0; i--) {
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
      const isToday = currentYear === 2026 && currentMonth === 6 && d === 18; // 18 July 2026

      days.push({
        num: d,
        currentMonth: true,
        fullDateStr,
        isToday
      });
    }

    // Next month padding to complete 35 or 42 cells
    const remainingCells = 35 - days.length >= 0 ? 35 - days.length : 42 - days.length;
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

  // Group events by full date string
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach(ev => {
      if (
        (selectedCategory === 'all' || ev.category === selectedCategory) &&
        (selectedStatus === 'all' || ev.status === selectedStatus) &&
        (!searchQuery || ev.title.toLowerCase().includes(searchQuery.toLowerCase()) || ev.projectName?.toLowerCase().includes(searchQuery.toLowerCase()))
      ) {
        if (!map[ev.date]) map[ev.date] = [];
        map[ev.date].push(ev);
      }
    });
    return map;
  }, [events, selectedCategory, selectedStatus, searchQuery]);

  // Handle Add New Event Submit
  const handleCreateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) {
      showToast('Внимание', 'Введите название события', 'warn');
      return;
    }

    const selectedProjObj = projects.find(p => p.id === newEventProjectId);

    let colorBg = 'bg-purple-100 dark:bg-purple-950/60';
    let colorText = 'text-purple-900 dark:text-purple-200';
    let colorBorder = 'border-purple-300 dark:border-purple-700/60';
    let categoryLabel = 'Монтаж';

    if (newEventCategory === 'procurement') {
      colorBg = 'bg-emerald-100 dark:bg-emerald-950/60';
      colorText = 'text-emerald-900 dark:text-emerald-200';
      colorBorder = 'border-emerald-300 dark:border-emerald-700/60';
      categoryLabel = 'Закупка';
    } else if (newEventCategory === 'meeting') {
      colorBg = 'bg-blue-100 dark:bg-blue-950/60';
      colorText = 'text-blue-900 dark:text-blue-200';
      colorBorder = 'border-blue-300 dark:border-blue-700/60';
      categoryLabel = 'Встреча';
    } else if (newEventCategory === 'demontage') {
      colorBg = 'bg-rose-100 dark:bg-rose-950/60';
      colorText = 'text-rose-900 dark:text-rose-200';
      colorBorder = 'border-rose-300 dark:border-rose-700/60';
      categoryLabel = 'Демонтаж';
    } else if (newEventCategory === 'client') {
      colorBg = 'bg-indigo-100 dark:bg-indigo-950/60';
      colorText = 'text-indigo-900 dark:text-indigo-200';
      colorBorder = 'border-indigo-300 dark:border-indigo-700/60';
      categoryLabel = 'Клиент';
    } else if (newEventCategory === 'general') {
      colorBg = 'bg-amber-100 dark:bg-amber-950/60';
      colorText = 'text-amber-900 dark:text-amber-200';
      colorBorder = 'border-amber-300 dark:border-amber-700/60';
      categoryLabel = 'Общее';
    }

    const newEv: CalendarEvent = {
      id: 'ev_' + Date.now(),
      title: newEventTitle.trim(),
      date: selectedDateForNewEvent,
      time: newEventTime || '10:00',
      category: newEventCategory,
      categoryLabel,
      status: 'planned',
      projectId: selectedProjObj?.id,
      projectName: selectedProjObj?.name,
      venue: newEventVenue.trim() || selectedProjObj?.venue,
      notes: newEventNotes.trim(),
      colorBg,
      colorText,
      colorBorder
    };

    setEvents(prev => [...prev, newEv]);
    showToast('Событие добавлено', `Запланировано на ${newEv.date}: «${newEv.title}»`, 'success');

    // Reset form
    setNewEventTitle('');
    setNewEventVenue('');
    setNewEventNotes('');
    setIsAddEventModalOpen(false);
  };

  // Schedule a draft into selected date
  const handleScheduleDraft = (draft: typeof unscheduledDrafts[0]) => {
    const mStr = (currentMonth + 1).toString().padStart(2, '0');
    const dStr = (selectedDayNum || 18).toString().padStart(2, '0');
    const dateStr = `${currentYear}-${mStr}-${dStr}`;

    const newEv: CalendarEvent = {
      id: 'ev_' + Date.now(),
      title: draft.title,
      date: dateStr,
      time: '12:00',
      category: 'general',
      categoryLabel: draft.category,
      status: 'planned',
      projectName: draft.project,
      colorBg: 'bg-amber-100 dark:bg-amber-950/60',
      colorText: 'text-amber-900 dark:text-amber-200',
      colorBorder: 'border-amber-300 dark:border-amber-700/60'
    };

    setEvents(prev => [...prev, newEv]);
    setUnscheduledDrafts(prev => prev.filter(d => d.id !== draft.id));
    showToast('Черновик запланирован', `Запись перенесена на ${selectedDayNum} ${monthNamesGenitive[currentMonth]}`, 'success');
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 1. TOP HEADER TOOLBAR: Controls, Search, Category Filters & View Selectors */}
      <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] border border-zinc-200/50 dark:border-zinc-800/40 p-4 sm:p-5 shadow-xs flex flex-col gap-4">
        
        {/* Row 1: Left Title & Prev/Today/Next Navigation | Right Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Month & Year Title with Quick Nav buttons */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white/70 dark:bg-zinc-800/70 p-1 rounded-full border border-zinc-200/60 dark:border-zinc-700/60 shadow-2xs">
              <button
                onClick={handlePrevMonth}
                className="w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                title="Предыдущий месяц"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleGoToday}
                className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/80 text-[var(--lavDeep)] dark:text-purple-300 font-bold text-xs hover:opacity-90 transition-all cursor-pointer"
              >
                Сегодня
              </button>
              <button
                onClick={handleNextMonth}
                className="w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                title="Следующий месяц"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {monthNames[currentMonth]} {currentYear}
            </h2>
          </div>

          {/* Search, Add Event & View Mode Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Search Input */}
            <div className="relative flex-1 sm:w-52">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Поиск событий..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/70 dark:bg-zinc-800/70 border border-zinc-200/60 dark:border-zinc-700/60 rounded-full pl-8 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#8C52D0]/40"
              />
            </div>

            {/* Add Event Button */}
            <button
              onClick={() => {
                const mStr = (currentMonth + 1).toString().padStart(2, '0');
                const dStr = (selectedDayNum || 18).toString().padStart(2, '0');
                setSelectedDateForNewEvent(`${currentYear}-${mStr}-${dStr}`);
                setIsAddEventModalOpen(true);
              }}
              style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
              className="text-white rounded-full px-4 py-1.5 text-xs font-semibold shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить событие</span>
            </button>
          </div>
        </div>

        {/* Row 2: Category Filter Pills & Workload Overview */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-zinc-200/40 dark:border-zinc-800/40">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { key: 'all', label: 'Все категории' },
              { key: 'montage', label: '💜 Монтажи' },
              { key: 'procurement', label: '🌿 Закупки' },
              { key: 'meeting', label: '💙 Встречи' },
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

          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Свободно
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500" /> Занято
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Пиковый монтаж
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN FULL-WIDTH CALENDAR GRID + UNSCHEDULED DRAFTS SIDE POOL */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* LEFT 3 COLUMNS: MAIN DETAILED CALENDAR MATRIX */}
        <div className="lg:col-span-3 bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[32px] border border-zinc-200/50 dark:border-zinc-800/40 p-4 sm:p-6 shadow-xs flex flex-col justify-between">
          
          {/* Weekday Labels Header */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, i) => (
              <div key={i} className="py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid Container */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 mt-3 min-h-[520px]">
            {calendarDays.map((day, idx) => {
              const dayEvents = eventsByDate[day.fullDateStr] || [];
              const isSelected = selectedDayNum === day.num && day.currentMonth;
              const isPeakDay = dayEvents.length >= 2;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (day.currentMonth) setSelectedDayNum(day.num);
                  }}
                  className={`min-h-[90px] sm:min-h-[105px] p-1.5 sm:p-2 rounded-2xl border transition-all duration-200 flex flex-col justify-between group relative cursor-pointer ${
                    !day.currentMonth
                      ? 'bg-zinc-100/30 dark:bg-zinc-900/10 border-transparent opacity-30 select-none'
                      : isSelected
                      ? 'bg-purple-50/90 dark:bg-purple-950/40 border-[#8C52D0] dark:border-purple-500 shadow-xs'
                      : 'bg-white/60 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800/80 border-zinc-200/50 dark:border-zinc-800/50'
                  }`}
                >
                  {/* Top Cell Row: Day Number + Quick Add '+' icon on hover */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`inline-flex items-center justify-center text-xs sm:text-sm font-extrabold w-6 h-6 rounded-full ${
                        day.isToday
                          ? 'bg-gradient-to-r from-[#8C52D0] to-[#582F89] text-white shadow-2xs'
                          : isSelected
                          ? 'text-[#8C52D0] dark:text-purple-300'
                          : day.currentMonth
                          ? 'text-zinc-800 dark:text-zinc-200'
                          : 'text-zinc-400'
                      }`}
                    >
                      {day.num}
                    </span>

                    {/* Quick Add Button on Hover */}
                    {day.currentMonth && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDateForNewEvent(day.fullDateStr);
                          setIsAddEventModalOpen(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-purple-200/60 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 transition-opacity"
                        title="Добавить событие на этот день"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Cell Events List */}
                  <div className="flex-1 space-y-1 overflow-y-auto no-scrollbar max-h-[75px]">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveEventDetail(ev);
                        }}
                        className={`px-1.5 py-1 rounded-xl border text-[10px] leading-tight font-semibold transition-all hover:scale-[1.02] shadow-2xs cursor-pointer flex items-center justify-between gap-1 truncate ${ev.colorBg} ${ev.colorText} ${ev.colorBorder}`}
                      >
                        <div className="truncate min-w-0">
                          <span className="font-extrabold mr-1">{ev.time}</span>
                          <span className="truncate">{ev.title}</span>
                        </div>
                      </div>
                    ))}

                    {/* Overflow Badge if > 2 events */}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100/80 dark:bg-purple-900/50 px-1.5 py-0.5 rounded-lg text-center">
                        Ещё +{dayEvents.length - 2} события
                      </div>
                    )}
                  </div>

                  {/* Workload Indicator Pill at Bottom */}
                  {day.currentMonth && dayEvents.length > 0 && (
                    <div className="mt-1 pt-0.5 flex items-center justify-between text-[9px] font-bold text-zinc-500">
                      <span className={`w-1.5 h-1.5 rounded-full ${isPeakDay ? 'bg-rose-500 animate-pulse' : 'bg-purple-500'}`} />
                      <span className="truncate text-[9px] opacity-70">
                        {isPeakDay ? '⚡ Пик' : `${dayEvents.length} соб.`}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: SELECTED DAY DETAILS & UNSCHEDULED DRAFTS POOL */}
        <div className="space-y-4">
          
          {/* Box 1: Selected Day Schedule Breakdown */}
          <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] border border-zinc-200/50 dark:border-zinc-800/40 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200/40 dark:border-zinc-800/40">
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  {selectedDayNum ? `${selectedDayNum} ${monthNamesGenitive[currentMonth]} ${currentYear}` : 'Выберите день'}
                </h3>
                <p className="text-xs text-zinc-500">Детальный график на дату</p>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                {(eventsByDate[`${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${(selectedDayNum || 18).toString().padStart(2, '0')}`] || []).length} записей
              </span>
            </div>

            {/* Event list for selected date */}
            {(() => {
              const selectedDateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${(selectedDayNum || 18).toString().padStart(2, '0')}`;
              const dayEvs = eventsByDate[selectedDateStr] || [];

              if (dayEvs.length === 0) {
                return (
                  <div className="py-8 text-center space-y-2">
                    <CalendarIcon className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-600" />
                    <p className="text-xs text-zinc-500 font-medium">
                      На {selectedDayNum} {monthNamesGenitive[currentMonth]} ничего не запланировано.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedDateForNewEvent(selectedDateStr);
                        setIsAddEventModalOpen(true);
                      }}
                      className="text-xs text-[#8C52D0] dark:text-purple-300 font-bold hover:underline cursor-pointer"
                    >
                      + Назначить время
                    </button>
                  </div>
                );
              }

              return (
                <div className="space-y-2.5">
                  {dayEvs.map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => setActiveEventDetail(ev)}
                      className={`p-3.5 rounded-2xl border transition-all hover:scale-[1.01] cursor-pointer space-y-2 ${ev.colorBg} ${ev.colorBorder}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 dark:bg-black/30 ${ev.colorText}`}>
                          {ev.time} {ev.endTime ? `— ${ev.endTime}` : ''}
                        </span>
                        <span className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-300">
                          {ev.categoryLabel}
                        </span>
                      </div>

                      <h4 className={`font-bold text-xs ${ev.colorText} leading-snug`}>
                        {ev.title}
                      </h4>

                      {ev.projectName && (
                        <div className="flex items-center gap-1 text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                          <FolderKanban className="w-3 h-3 text-purple-600 shrink-0" />
                          <span className="truncate">{ev.projectName}</span>
                        </div>
                      )}

                      {ev.venue && (
                        <div className="flex items-center gap-1 text-[10px] text-zinc-600 dark:text-zinc-400">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{ev.venue}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Box 2: Unscheduled Drafts & Tasks Pool */}
          <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] border border-zinc-200/50 dark:border-zinc-800/40 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Черновики к распределению</h3>
              </div>
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                {unscheduledDrafts.length}
              </span>
            </div>

            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Быстрые задачи, которым ещё не назначена дата. Нажмите «Запланировать», чтобы отправить на {selectedDayNum} {monthNamesGenitive[currentMonth]}.
            </p>

            <div className="space-y-2">
              {unscheduledDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="bg-white/70 dark:bg-zinc-800/60 p-3 rounded-2xl border border-zinc-200/50 dark:border-zinc-700/50 flex items-center justify-between gap-2 shadow-2xs"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                      {draft.title}
                    </p>
                    <p className="text-[10px] text-zinc-500 truncate">
                      {draft.project}
                    </p>
                  </div>

                  <button
                    onClick={() => handleScheduleDraft(draft)}
                    className="px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-200 font-bold text-[10px] hover:bg-purple-200 transition-colors cursor-pointer shrink-0"
                  >
                    Запланировать
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* 3. EVENT DETAILS DRAWER / MODAL */}
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
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                    {activeEventDetail.title}
                  </h3>
                </div>

                <button
                  onClick={() => setActiveEventDetail(null)}
                  className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
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

                {activeEventDetail.teamMembers && activeEventDetail.teamMembers.length > 0 && (
                  <div className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300">
                    <Users className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block mb-0.5">Команда / Состав:</span>
                      <div className="flex flex-wrap gap-1">
                        {activeEventDetail.teamMembers.map((m, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
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
                      const proj = projects.find(p => p.id === activeEventDetail.projectId);
                      if (proj) {
                        onSelectProject(proj);
                      }
                      setActiveEventDetail(null);
                    }}
                    style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
                    className="text-white rounded-full px-5 py-2 text-xs font-semibold shadow-xs hover:opacity-90 transition-all cursor-pointer"
                  >
                    Перейти к карточке проекта
                  </button>
                )}

                <button
                  onClick={() => {
                    setEvents(prev => prev.filter(e => e.id !== activeEventDetail.id));
                    setActiveEventDetail(null);
                    showToast('Удалено', 'Событие удалено из календаря', 'info');
                  }}
                  className="px-4 py-2 rounded-full border border-rose-300 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-50 cursor-pointer"
                >
                  Удалить
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. MODAL: ADD NEW CALENDAR EVENT */}
      <AnimatePresence>
        {isAddEventModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
                <h3 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-100">
                  Новое событие
                </h3>
                <button
                  onClick={() => setIsAddEventModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateEventSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Название события *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Например: Заезд бригады и сборка арки"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#8C52D0]/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Дата
                    </label>
                    <input
                      type="date"
                      value={selectedDateForNewEvent}
                      onChange={(e) => setSelectedDateForNewEvent(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#8C52D0]/50"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Время начала
                    </label>
                    <input
                      type="time"
                      value={newEventTime}
                      onChange={(e) => setNewEventTime(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#8C52D0]/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Категория события
                  </label>
                  <select
                    value={newEventCategory}
                    onChange={(e) => setNewEventCategory(e.target.value as any)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#8C52D0]/50"
                  >
                    <option value="montage">💜 Монтаж & Заезд</option>
                    <option value="procurement">🌿 Закупка флористики/декора</option>
                    <option value="meeting">💙 Встреча с клиентом / замеры</option>
                    <option value="demontage">🌹 Демонтаж</option>
                    <option value="client">🔮 Оплата / согласование</option>
                    <option value="general">Общие задачи</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Привязать к проекту (опционально)
                  </label>
                  <select
                    value={newEventProjectId}
                    onChange={(e) => setNewEventProjectId(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#8C52D0]/50"
                  >
                    <option value="">Без привязки</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name} {p.clientName ? `(${p.clientName})` : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Место / Локация
                  </label>
                  <input
                    type="text"
                    placeholder="Локация или название площадки"
                    value={newEventVenue}
                    onChange={(e) => setNewEventVenue(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#8C52D0]/50"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddEventModalOpen(false)}
                    className="px-4 py-2 rounded-full border border-zinc-300 text-zinc-600 dark:text-zinc-400 font-semibold"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
                    className="text-white rounded-full px-5 py-2 text-xs font-semibold shadow-xs hover:opacity-90 transition-all cursor-pointer"
                  >
                    Сохранить событие
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
