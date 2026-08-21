import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart2,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter,
  CheckCircle2,
  Zap,
  FolderKanban,
  Award,
  Maximize2,
  MoreHorizontal
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Project } from '../types';

interface StatisticsTabProps {
  projects: Project[];
  showToast?: (title: string, msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function StatisticsTab({ projects, showToast }: StatisticsTabProps) {
  const [periodMode, setPeriodMode] = useState<'month' | 'halfyear' | 'year' | 'custom'>('month');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08'); // format: YYYY-MM
  const [startDate, setStartDate] = useState<string>('2026-08-01');
  const [endDate, setEndDate] = useState<string>('2026-08-31');

  // Month list helper
  const monthsList = [
    { value: '2026-08', label: 'Август 2026' },
    { value: '2026-07', label: 'Июль 2026' },
    { value: '2026-06', label: 'Июнь 2026' },
    { value: '2026-05', label: 'Май 2026' },
    { value: '2026-04', label: 'Апрель 2026' },
    { value: '2026-03', label: 'Март 2026' },
    { value: '2026-02', label: 'Февраль 2026' },
    { value: '2026-01', label: 'Январь 2026' },
    { value: '2025-12', label: 'Декабрь 2025' },
    { value: '2025-11', label: 'Ноябрь 2025' },
  ];

  const getMonthNameByValue = (val: string) => {
    const found = monthsList.find(m => m.value === val);
    if (found) return found.label;
    const [y, m] = val.split('-');
    const mNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    return `${mNames[parseInt(m, 10) - 1] || 'Месяц'} ${y}`;
  };

  // Dynamic revenue / project counts computed from props
  const approvedSum = projects.filter(p => p.status === 'approved').reduce((sum, p) => sum + (p.budget || 0), 0);
  const inProgressSum = projects.filter(p => p.status === 'progress').reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalRevenue = approvedSum + inProgressSum;
  const estimatedCosts = Math.round(totalRevenue * 0.58);
  const netProfit = totalRevenue - estimatedCosts;

  // Generate dynamic chart data based on selected mode
  const getTrendData = () => {
    if (periodMode === 'month') {
      const monthLabel = getMonthNameByValue(selectedMonth).split(' ')[0].toLowerCase().slice(0, 3);
      return [
        { name: `1-7 ${monthLabel}`, income: 240, expense: 130, profit: 110 },
        { name: `8-14 ${monthLabel}`, income: 380, expense: 210, profit: 170 },
        { name: `15-21 ${monthLabel}`, income: 450, expense: 260, profit: 190 },
        { name: `22-28 ${monthLabel}`, income: 520, expense: 290, profit: 230 },
        { name: `29-31 ${monthLabel}`, income: 310, expense: 170, profit: 140 },
      ];
    }
    if (periodMode === 'halfyear') {
      return [
        { name: 'Март', income: 820, expense: 480, profit: 340 },
        { name: 'Апрель', income: 950, expense: 540, profit: 410 },
        { name: 'Май', income: 1240, expense: 710, profit: 530 },
        { name: 'Июнь', income: 1680, expense: 920, profit: 760 },
        { name: 'Июль', income: 1920, expense: 1050, profit: 870 },
        { name: 'Август', income: 1900, expense: 1060, profit: 840 },
      ];
    }
    if (periodMode === 'year') {
      return [
        { name: 'I Кв', income: 2100, expense: 1200, profit: 900 },
        { name: 'II Кв', income: 3870, expense: 2170, profit: 1700 },
        { name: 'III Кв', income: 5100, expense: 2850, profit: 2250 },
        { name: 'IV Кв (прогноз)', income: 4200, expense: 2300, profit: 1900 },
      ];
    }
    // Custom range
    const formatD = (dStr: string) => {
      if (!dStr) return '';
      const parts = dStr.split('-');
      return parts.length === 3 ? `${parts[2]}.${parts[1]}` : dStr;
    };
    return [
      { name: formatD(startDate) || 'Старт', income: 180, expense: 100, profit: 80 },
      { name: 'Период 1', income: 340, expense: 190, profit: 150 },
      { name: 'Период 2', income: 490, expense: 280, profit: 210 },
      { name: formatD(endDate) || 'Финиш', income: 620, expense: 350, profit: 270 },
    ];
  };

  const trendData = getTrendData();

  const pieData = [
    { name: 'Свадебный декор', value: 45, color: '#A78BFA' }, // Soft Lavender
    { name: 'Корпоративы', value: 25, color: '#6EE7B7' },     // Soft Mint
    { name: 'Дни рождения', value: 18, color: '#93C5FD' },    // Soft Powder Blue
    { name: 'Фотозоны и аренда', value: 12, color: '#FDBA74' }, // Soft Peach / Amber
  ];

  const categoryExpenses = [
    { label: 'Закупка цветов и флористика', percent: 82, amount: '480 тыс. ₽', color: 'from-purple-300 to-indigo-300 dark:from-purple-400 dark:to-indigo-400', badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200' },
    { label: 'Конструкции и свет', percent: 64, amount: '310 тыс. ₽', color: 'from-emerald-300 to-teal-300 dark:from-emerald-400 dark:to-teal-400', badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200' },
    { label: 'Текстиль и полиграфия', percent: 48, amount: '190 тыс. ₽', color: 'from-amber-200 to-orange-300 dark:from-amber-300 dark:to-orange-400', badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200' },
    { label: 'Логистика и монтаж', percent: 35, amount: '120 тыс. ₽', color: 'from-sky-300 to-blue-300 dark:from-sky-400 dark:to-blue-400', badgeBg: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Controls: Period selector + Custom month/range pickers + Export button */}
      <div className="flex items-center justify-end gap-2.5 flex-wrap">
          {/* Main Mode Toggles */}
          <div className="flex bg-white/80 dark:bg-zinc-800/80 p-1 rounded-full border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs flex-wrap">
            <button
              onClick={() => setPeriodMode('month')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                periodMode === 'month'
                  ? 'bg-gradient-to-r from-[var(--primary-grad-from,#8C52D0)] to-[var(--primary-grad-to,#582F89)] text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              За месяц
            </button>
            <button
              onClick={() => setPeriodMode('halfyear')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                periodMode === 'halfyear'
                  ? 'bg-gradient-to-r from-[var(--primary-grad-from,#8C52D0)] to-[var(--primary-grad-to,#582F89)] text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              За полгода
            </button>
            <button
              onClick={() => setPeriodMode('year')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                periodMode === 'year'
                  ? 'bg-gradient-to-r from-[var(--primary-grad-from,#8C52D0)] to-[var(--primary-grad-to,#582F89)] text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              За год
            </button>
            <button
              onClick={() => setPeriodMode('custom')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                periodMode === 'custom'
                  ? 'bg-gradient-to-r from-[var(--primary-grad-from,#8C52D0)] to-[var(--primary-grad-to,#582F89)] text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Произвольный период
            </button>
          </div>

          {/* Conditional Month Picker */}
          {periodMode === 'month' && (
            <div className="flex items-center gap-1.5 bg-white/80 dark:bg-zinc-800/80 px-3 py-1.5 rounded-full border border-zinc-200/80 dark:border-zinc-700/80 text-xs shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]" />
              <span className="text-zinc-600 dark:text-zinc-400 font-medium hidden sm:inline">Месяц:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent font-semibold text-zinc-900 dark:text-zinc-100 outline-none cursor-pointer pr-1"
              >
                {monthsList.map((m) => (
                  <option key={m.value} value={m.value} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                    {m.label}
                  </option>
                ))}
              </select>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                title="Выбрать любой другой месяц"
                className="bg-transparent font-semibold text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] dark:text-purple-300 outline-none cursor-pointer w-7 h-5 opacity-80 hover:opacity-100"
              />
            </div>
          )}

          {/* Conditional Date Range Picker (От ... до ...) */}
          {periodMode === 'custom' && (
            <div className="flex items-center gap-2 bg-white/80 dark:bg-zinc-800/80 px-3 py-1.5 rounded-full border border-zinc-200/80 dark:border-zinc-700/80 text-xs shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]" />
              <span className="text-zinc-600 dark:text-zinc-400 font-medium">С:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent font-semibold text-zinc-900 dark:text-zinc-100 outline-none cursor-pointer"
              />
              <span className="text-zinc-600 dark:text-zinc-400 font-medium">по:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent font-semibold text-zinc-900 dark:text-zinc-100 outline-none cursor-pointer"
              />
            </div>
          )}

          <button
            onClick={() => showToast && showToast('Экспорт отчета', 'Отчет сформирован и отправлен в загрузки.', 'success')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-700 transition-all cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]" />
            <span>Экспорт</span>
          </button>
        </div>

      {/* Top Metric Cards (Pastel Tone Theme - 2 columns on mobile, 4 on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4">
        {/* Metric 1 - Soft Periwinkle/Indigo (ОБЩАЯ ВЫРУЧКА) */}
        <div className="relative overflow-hidden bg-[#b8c6fa]/70 dark:bg-indigo-950/60 backdrop-blur-md p-3 sm:p-3.5 md:p-4 rounded-[22px] flex flex-col justify-between border border-[#9cb1f8]/80 dark:border-indigo-800/40 shadow-xs hover:shadow-md transition-all duration-300 group">
          {/* Background Large Cut-off Decorative Icon */}
          <DollarSign className="absolute -right-4 -bottom-4 sm:-right-5 sm:-bottom-5 w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 text-indigo-950/15 dark:text-white/10 pointer-events-none select-none -rotate-12 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6" />

          {/* Header Row: Icon Left, Dots Right */}
          <div className="relative z-10 flex items-center justify-between gap-2 mb-1">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-900/10 dark:bg-white/10 flex items-center justify-center text-indigo-900 dark:text-indigo-200 shrink-0">
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-900/10 dark:bg-white/10 flex items-center justify-center text-indigo-900/70 dark:text-indigo-200/70">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Title */}
          <span className="relative z-10 text-[10px] sm:text-xs font-semibold text-indigo-950/80 dark:text-indigo-200/90 tracking-wide uppercase truncate mb-0.5">
            Общая выручка
          </span>

          {/* Large Number */}
          <div className="relative z-10 my-0.5 flex items-baseline gap-1 flex-wrap">
            <span className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-indigo-950 dark:text-white tracking-tight leading-none">
              {(totalRevenue / 1000).toLocaleString('ru-RU')}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-indigo-900/80 dark:text-indigo-300">
              тыс. ₽
            </span>
          </div>

          {/* Bottom Row: Trend label */}
          <div className="relative z-10 flex items-center gap-1 mt-1 pt-0.5 text-[10px] sm:text-[11px] font-medium text-indigo-900/80 dark:text-indigo-300/80 truncate">
            <ArrowUpRight className="w-3 h-3 shrink-0" />
            <span className="truncate">+18.4% к прошлому</span>
          </div>
        </div>

        {/* Metric 2 - Soft Mint (ЧИСТАЯ ПРИБЫЛЬ) */}
        <div className="relative overflow-hidden bg-[#d8f2b2]/70 dark:bg-emerald-950/60 backdrop-blur-md p-3 sm:p-3.5 md:p-4 rounded-[22px] flex flex-col justify-between border border-[#c3e895]/80 dark:border-emerald-800/40 shadow-xs hover:shadow-md transition-all duration-300 group">
          {/* Background Large Cut-off Decorative Icon */}
          <TrendingUp className="absolute -right-4 -bottom-4 sm:-right-5 sm:-bottom-5 w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 text-emerald-950/15 dark:text-white/10 pointer-events-none select-none -rotate-12 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6" />

          {/* Header Row: Icon Left, Dots Right */}
          <div className="relative z-10 flex items-center justify-between gap-2 mb-1">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-900/10 dark:bg-white/10 flex items-center justify-center text-emerald-900 dark:text-emerald-200 shrink-0">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-900/10 dark:bg-white/10 flex items-center justify-center text-emerald-900/70 dark:text-emerald-200/70">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Title */}
          <span className="relative z-10 text-[10px] sm:text-xs font-semibold text-emerald-950/80 dark:text-emerald-200/90 tracking-wide uppercase truncate mb-0.5">
            Чистая прибыль
          </span>

          {/* Large Number */}
          <div className="relative z-10 my-0.5 flex items-baseline gap-1 flex-wrap">
            <span className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-emerald-950 dark:text-white tracking-tight leading-none">
              {(netProfit / 1000).toLocaleString('ru-RU')}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-emerald-900/80 dark:text-emerald-300">
              тыс. ₽
            </span>
          </div>

          {/* Bottom Row: Trend label */}
          <div className="relative z-10 flex items-center gap-1 mt-1 pt-0.5 text-[10px] sm:text-[11px] font-medium text-emerald-900/80 dark:text-emerald-300/80 truncate">
            <ArrowUpRight className="w-3 h-3 shrink-0" />
            <span className="truncate">Рентабельность ~ 42%</span>
          </div>
        </div>

        {/* Metric 3 - Soft Teal (АКТИВНЫЕ ПРОЕКТЫ) */}
        <div className="relative overflow-hidden bg-[#a4e5d9]/70 dark:bg-teal-950/60 backdrop-blur-md p-3 sm:p-3.5 md:p-4 rounded-[22px] flex flex-col justify-between border border-[#83d4c3]/80 dark:border-teal-800/40 shadow-xs hover:shadow-md transition-all duration-300 group">
          {/* Background Large Cut-off Decorative Icon */}
          <FolderKanban className="absolute -right-4 -bottom-4 sm:-right-5 sm:-bottom-5 w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 text-teal-950/15 dark:text-white/10 pointer-events-none select-none -rotate-12 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6" />

          {/* Header Row: Icon Left, Dots Right */}
          <div className="relative z-10 flex items-center justify-between gap-2 mb-1">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-teal-900/10 dark:bg-white/10 flex items-center justify-center text-teal-900 dark:text-teal-200 shrink-0">
              <FolderKanban className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-teal-900/10 dark:bg-white/10 flex items-center justify-center text-teal-900/70 dark:text-teal-200/70">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Title */}
          <span className="relative z-10 text-[10px] sm:text-xs font-semibold text-teal-950/80 dark:text-teal-200/90 tracking-wide uppercase truncate mb-0.5">
            Активные проекты
          </span>

          {/* Large Number */}
          <div className="relative z-10 my-0.5 flex items-baseline gap-1 flex-wrap">
            <span className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-teal-950 dark:text-white tracking-tight leading-none">
              {projects.length}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-teal-900/80 dark:text-teal-300">
              смет
            </span>
          </div>

          {/* Bottom Row: Trend label */}
          <div className="relative z-10 flex items-center gap-1 mt-1 pt-0.5 text-[10px] sm:text-[11px] font-medium text-teal-900/80 dark:text-teal-300/80 truncate">
            <span className="truncate">{projects.filter(p => p.status === 'progress').length} в монтаже · {projects.filter(p => p.status === 'approved').length} зак.</span>
          </div>
        </div>

        {/* Metric 4 - Soft Coral/Rose (КОНВЕРСИЯ СОГЛАСОВАНИЙ) */}
        <div className="relative overflow-hidden bg-[#f8c5c8]/70 dark:bg-rose-950/60 backdrop-blur-md p-3 sm:p-3.5 md:p-4 rounded-[22px] flex flex-col justify-between border border-[#f4a8ac]/80 dark:border-rose-800/40 shadow-xs hover:shadow-md transition-all duration-300 group">
          {/* Background Large Cut-off Decorative Icon */}
          <Award className="absolute -right-4 -bottom-4 sm:-right-5 sm:-bottom-5 w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 text-rose-950/15 dark:text-white/10 pointer-events-none select-none -rotate-12 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6" />

          {/* Header Row: Icon Left, Dots Right */}
          <div className="relative z-10 flex items-center justify-between gap-2 mb-1">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-900/10 dark:bg-white/10 flex items-center justify-center text-rose-900 dark:text-rose-200 shrink-0">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-900/10 dark:bg-white/10 flex items-center justify-center text-rose-900/70 dark:text-rose-200/70">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Title */}
          <span className="relative z-10 text-[10px] sm:text-xs font-semibold text-rose-950/80 dark:text-rose-200/90 tracking-wide uppercase truncate mb-0.5">
            Конверсия
          </span>

          {/* Large Number */}
          <div className="relative z-10 my-0.5 flex items-baseline gap-1 flex-wrap">
            <span className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-rose-950 dark:text-white tracking-tight leading-none">
              78.5%
            </span>
          </div>

          {/* Bottom Row: Trend label */}
          <div className="relative z-10 flex items-center gap-1 mt-1 pt-0.5 text-[10px] sm:text-[11px] font-medium text-rose-900/80 dark:text-rose-300/80 truncate">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            <span className="truncate">Высокая лояльность</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Line Area Chart - Yearly/Period Revenue Growth */}
        <div className="lg:col-span-2 bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] border border-zinc-200/50 dark:border-zinc-800/40 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Динамика доходов и расходов (тыс. ₽)
                </h2>
                <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-100/80 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full">
                  {periodMode === 'month' && getMonthNameByValue(selectedMonth)}
                  {periodMode === 'halfyear' && 'За 6 месяцев'}
                  {periodMode === 'year' && 'За год'}
                  {periodMode === 'custom' && `${startDate.split('-').reverse().join('.')} — ${endDate.split('-').reverse().join('.')}`}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-normal text-zinc-700 dark:text-zinc-300 leading-relaxed mt-0.5">
                Соотношение общей выручки, прямых себестоимостей и чистой прибыли
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#A78BFA]" />
                <span className="text-zinc-700 dark:text-zinc-300">Доходы</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#6EE7B7]" />
                <span className="text-zinc-700 dark:text-zinc-300">Прибыль</span>
              </div>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#A78BFA" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6EE7B7" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#6EE7B7" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150, 150, 150, 0.15)" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#888' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#888' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '16px',
                    border: '1px solid rgba(200, 200, 200, 0.3)',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                    color: '#111'
                  }}
                />
                <Area type="monotone" dataKey="income" name="Доход" stroke="#A78BFA" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="profit" name="Прибыль" stroke="#6EE7B7" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart - Project Category Breakdown */}
        <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] border border-zinc-200/50 dark:border-zinc-800/40 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Распределение по типам мероприятий
            </h2>
            <p className="text-xs sm:text-sm font-normal text-zinc-700 dark:text-zinc-300 leading-relaxed mt-0.5">
              Доля выручки в разрезе категорий декора
            </p>
          </div>

          <div className="h-48 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '14px',
                    border: '1px solid rgba(200, 200, 200, 0.3)',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend list */}
          <div className="space-y-2">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-zinc-700 dark:text-zinc-300 truncate">{item.name}</span>
                </div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Expense Progress Bars & Work Efficiency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Expense Category Progress */}
        <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] border border-zinc-200/50 dark:border-zinc-800/40 p-5 sm:p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Исполнение статей расходов
            </h2>
            <p className="text-xs sm:text-sm font-normal text-zinc-700 dark:text-zinc-300 leading-relaxed mt-0.5">
              Текущий лимит и фактически потраченные бюджеты
            </p>
          </div>

          <div className="space-y-3.5">
            {categoryExpenses.map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-800 dark:text-zinc-200">{cat.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 dark:text-zinc-400 font-normal">{cat.amount}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${cat.badgeBg}`}>{cat.percent}%</span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${cat.color} rounded-full transition-all duration-500`}
                    style={{ width: `${cat.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Work Efficiency Circular Gauges */}
        <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] border border-zinc-200/50 dark:border-zinc-800/40 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Эффективность команды и сроки
            </h2>
            <p className="text-xs sm:text-sm font-normal text-zinc-700 dark:text-zinc-300 leading-relaxed mt-0.5">
              Показатели выполнения монтажей, смет и взаимодействия с клиентами
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4">
            {[
              { label: 'Смет в срок', percent: '94%', color: 'border-emerald-300 text-emerald-800 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/30' },
              { label: 'Монтажи', percent: '88%', color: 'border-purple-300 text-purple-800 dark:text-purple-300 bg-purple-50/60 dark:bg-purple-950/30' },
              { label: 'Оплата смет', percent: '91%', color: 'border-sky-300 text-sky-800 dark:text-sky-300 bg-sky-50/60 dark:bg-sky-950/30' },
              { label: 'Аренда возвращена', percent: '96%', color: 'border-amber-300 text-amber-800 dark:text-amber-300 bg-amber-50/60 dark:bg-amber-950/30' }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-800/40 text-center">
                <div className={`w-14 h-14 rounded-full border-4 ${stat.color} flex items-center justify-center font-extrabold text-base mb-2 shadow-2xs`}>
                  {stat.percent}
                </div>
                <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-emerald-500/10 dark:bg-emerald-950/30 rounded-2xl border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200 font-normal leading-relaxed flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Все проекты выполняются в графике. Нет просроченных монтажей.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
