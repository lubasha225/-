import React, { useState } from 'react';
import { TrendingUp, Maximize2, DollarSign, PieChart as PieChartIcon, ArrowUpRight, Calendar } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { Project } from '../types';

interface SidebarStatisticsWidgetProps {
  projects: Project[];
  onOpenFullScreen: () => void;
}

export default function SidebarStatisticsWidget({ projects, onOpenFullScreen }: SidebarStatisticsWidgetProps) {
  const [periodMode, setPeriodMode] = useState<'month' | 'halfyear' | 'year' | 'custom'>('month');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');
  const [startDate, setStartDate] = useState<string>('2026-08-01');
  const [endDate, setEndDate] = useState<string>('2026-08-31');

  // Month options
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
  ];

  const getMonthLabel = (val: string) => {
    const found = monthsList.find(m => m.value === val);
    if (found) return found.label;
    const parts = val.split('-');
    return `${parts[1]}.${parts[0]}`;
  };

  // Computed metrics
  const approvedSum = projects.filter(p => p.status === 'approved').reduce((sum, p) => sum + (p.budget || 0), 0);
  const inProgressSum = projects.filter(p => p.status === 'progress').reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalRevenue = approvedSum + inProgressSum;
  const netProfit = Math.round(totalRevenue * 0.42);

  const getMiniTrendData = () => {
    if (periodMode === 'month') {
      return [
        { name: '1-7', val: 240 },
        { name: '8-14', val: 380 },
        { name: '15-21', val: 450 },
        { name: '22-28', val: 520 },
        { name: '29-31', val: 310 },
      ];
    }
    if (periodMode === 'halfyear') {
      return [
        { name: 'Мар', val: 820 },
        { name: 'Апр', val: 950 },
        { name: 'Май', val: 1240 },
        { name: 'Июн', val: 1680 },
        { name: 'Июл', val: 1920 },
        { name: 'Авг', val: 1900 },
      ];
    }
    if (periodMode === 'year') {
      return [
        { name: 'Q1', val: 2100 },
        { name: 'Q2', val: 3870 },
        { name: 'Q3', val: 5100 },
        { name: 'Q4', val: 4200 },
      ];
    }
    // Custom
    const formatSmall = (dStr: string) => {
      if (!dStr) return '';
      const p = dStr.split('-');
      return p.length === 3 ? `${p[2]}.${p[1]}` : dStr;
    };
    return [
      { name: formatSmall(startDate), val: 180 },
      { name: 'П1', val: 340 },
      { name: 'П2', val: 490 },
      { name: formatSmall(endDate), val: 620 },
    ];
  };

  const currentMiniData = getMiniTrendData();

  const categories = [
    { label: 'Свадьбы', percent: 45, color: '#A78BFA' },     // Soft Lavender
    { label: 'Корпоративы', percent: 25, color: '#6EE7B7' }, // Soft Mint
    { label: 'Частный декор', percent: 18, color: '#93C5FD' },// Soft Blue
    { label: 'Фотозоны', percent: 12, color: '#FDBA74' },     // Soft Peach
  ];

  return (
    <div className="space-y-3.5 select-none animate-fadeIn">
      {/* Widget Header with Fullscreen button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-[var(--lavenderAccent)]" />
          <h2 className="text-sm font-bold text-[var(--ink)] tracking-tight">Статистика</h2>
        </div>

        <button
          onClick={onOpenFullScreen}
          title="Открыть статистику на всю страницу"
          className="flex items-center gap-1 text-[11px] font-semibold text-[#8C52D0] dark:text-purple-300 bg-purple-100/80 dark:bg-purple-950/60 hover:bg-purple-200/80 dark:hover:bg-purple-900/80 px-2.5 py-1 rounded-full transition-all cursor-pointer shadow-2xs"
        >
          <Maximize2 className="w-3 h-3" />
          <span>На весь экран</span>
        </button>
      </div>

      {/* Period Filter Toggle */}
      <div className="flex bg-zinc-100 dark:bg-zinc-800/80 p-0.5 rounded-full border border-zinc-200/80 dark:border-zinc-700/80 text-[10px] flex-wrap">
        <button
          onClick={() => setPeriodMode('month')}
          className={`flex-1 py-1 px-1.5 rounded-full font-semibold transition-all cursor-pointer text-center ${
            periodMode === 'month'
              ? 'bg-[#8C52D0] text-white shadow-2xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          Месяц
        </button>
        <button
          onClick={() => setPeriodMode('halfyear')}
          className={`flex-1 py-1 px-1.5 rounded-full font-semibold transition-all cursor-pointer text-center ${
            periodMode === 'halfyear'
              ? 'bg-[#8C52D0] text-white shadow-2xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          6 мес.
        </button>
        <button
          onClick={() => setPeriodMode('year')}
          className={`flex-1 py-1 px-1.5 rounded-full font-semibold transition-all cursor-pointer text-center ${
            periodMode === 'year'
              ? 'bg-[#8C52D0] text-white shadow-2xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          За год
        </button>
        <button
          onClick={() => setPeriodMode('custom')}
          className={`flex-1 py-1 px-1.5 rounded-full font-semibold transition-all cursor-pointer text-center ${
            periodMode === 'custom'
              ? 'bg-[#8C52D0] text-white shadow-2xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          Период
        </button>
      </div>

      {/* Conditional Specific Month Selection */}
      {periodMode === 'month' && (
        <div className="flex items-center gap-1.5 bg-white/80 dark:bg-zinc-900/80 p-2 rounded-[16px] border border-zinc-200/60 dark:border-zinc-800/60 text-xs">
          <Calendar className="w-3.5 h-3.5 text-[#8C52D0] shrink-0" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 outline-none w-full cursor-pointer"
          >
            {monthsList.map(m => (
              <option key={m.value} value={m.value} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                {m.label}
              </option>
            ))}
          </select>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-5 h-5 bg-transparent cursor-pointer opacity-70 hover:opacity-100"
            title="Выбрать конкретный месяц"
          />
        </div>
      )}

      {/* Conditional Custom Date Range Picker */}
      {periodMode === 'custom' && (
        <div className="bg-white/80 dark:bg-zinc-900/80 p-2 rounded-[16px] border border-zinc-200/60 dark:border-zinc-800/60 text-[11px] space-y-1.5">
          <div className="flex items-center justify-between gap-1">
            <span className="text-zinc-600 dark:text-zinc-400 font-medium">С:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent font-semibold text-zinc-900 dark:text-zinc-100 outline-none cursor-pointer text-[11px]"
            />
          </div>
          <div className="flex items-center justify-between gap-1 border-t border-zinc-200/40 dark:border-zinc-800/40 pt-1">
            <span className="text-zinc-600 dark:text-zinc-400 font-medium">По:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent font-semibold text-zinc-900 dark:text-zinc-100 outline-none cursor-pointer text-[11px]"
            />
          </div>
        </div>
      )}

      {/* Primary Revenue Card with Mini Trend Line (Pastel Lavender Theme) */}
      <div className="bg-[#F3F0FF] dark:bg-purple-950/30 backdrop-blur-md p-3.5 rounded-[22px] border border-[#DDD6FE]/60 dark:border-purple-800/40 shadow-xs flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-purple-800/70 dark:text-purple-300/80 uppercase tracking-wide truncate max-w-[140px]">
            {periodMode === 'month' && `Выручка: ${getMonthLabel(selectedMonth)}`}
            {periodMode === 'halfyear' && 'Выручка за 6 месяцев'}
            {periodMode === 'year' && 'Выручка за год'}
            {periodMode === 'custom' && 'Выручка за период'}
          </span>
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-200/60 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
            <ArrowUpRight className="w-2.5 h-2.5" /> +18.4%
          </span>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-xl sm:text-2xl font-extrabold text-purple-950 dark:text-purple-100 tracking-tight">
            {(totalRevenue / 1000).toLocaleString('ru-RU')}
          </span>
          <span className="text-xs font-semibold text-purple-700/80 dark:text-purple-300/80">тыс. ₽</span>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-16 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={currentMiniData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="miniColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#A78BFA" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '10px',
                  border: '1px solid rgba(200, 200, 200, 0.3)',
                  padding: '2px 8px',
                  fontSize: '10px'
                }}
              />
              <Area type="monotone" dataKey="val" name="Выручка" stroke="#A78BFA" strokeWidth={2.5} fillOpacity={1} fill="url(#miniColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Net Profit & Projects quick summary (Pastel Mint & Soft Teal) */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#ECFDF5] dark:bg-emerald-950/30 p-2.5 rounded-[18px] border border-[#A7F3D0]/50 dark:border-emerald-800/40 text-left">
          <span className="text-[10px] font-semibold text-emerald-800/70 dark:text-emerald-300/80 block mb-0.5">Прибыль</span>
          <span className="text-sm font-extrabold text-emerald-900 dark:text-emerald-100">
            {(netProfit / 1000).toLocaleString('ru-RU')} тыс. ₽
          </span>
        </div>
        <div className="bg-[#F0FDFA] dark:bg-teal-950/30 p-2.5 rounded-[18px] border border-[#BAE6FD]/50 dark:border-teal-800/40 text-left">
          <span className="text-[10px] font-semibold text-teal-800/70 dark:text-teal-300/80 block mb-0.5">В работе</span>
          <span className="text-sm font-extrabold text-teal-900 dark:text-teal-100">
            {projects.filter(p => p.status === 'progress').length} смет
          </span>
        </div>
      </div>

      {/* Category distribution bars */}
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-3 rounded-[20px] border border-zinc-200/60 dark:border-zinc-800/60 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-800 dark:text-zinc-200">
          <span>Категории проектов</span>
          <PieChartIcon className="w-3.5 h-3.5 text-[#8C52D0]" />
        </div>

        <div className="space-y-2 pt-1">
          {categories.map((cat, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-700 dark:text-zinc-300 font-medium">{cat.label}</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{cat.percent}%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${cat.percent}%`, backgroundColor: cat.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Open full dashboard CTA button */}
      <button
        onClick={onOpenFullScreen}
        className="w-full py-2 px-3 rounded-full bg-gradient-to-r from-[#8C52D0] to-[#582F89] text-white text-xs font-semibold hover:opacity-95 transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
      >
        <Maximize2 className="w-3.5 h-3.5" />
        <span>Полный финансовый отчет</span>
      </button>
    </div>
  );
}
