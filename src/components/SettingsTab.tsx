import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  Monitor,
  Check,
  Sparkles,
  RefreshCw,
  Search,
  Plus,
  Users,
  FolderKanban,
  Zap,
  Calendar,
  Layers
} from 'lucide-react';
import { COLOR_SCHEMES, BG_PRESETS, ColorScheme, BgPreset } from '../lib/themeConfig';

interface SettingsTabProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  colorSchemeId: string;
  setColorSchemeId: (id: string) => void;
  bgPresetId: string;
  setBgPresetId: (id: string) => void;
  showToast?: (title: string, message: string, type?: 'success' | 'info' | 'warn') => void;
}

export default function SettingsTab({
  theme,
  toggleTheme,
  colorSchemeId,
  setColorSchemeId,
  bgPresetId,
  setBgPresetId,
  showToast,
}: SettingsTabProps) {
  const [bgTab, setBgTab] = useState<'recommended' | 'all'>('recommended');
  const [smoothAnimations, setSmoothAnimations] = useState<boolean>(() => {
    return localStorage.getItem('pref_smooth_anim') !== 'false';
  });
  const [boldFocusRings, setBoldFocusRings] = useState<boolean>(() => {
    return localStorage.getItem('pref_bold_focus') === 'true';
  });
  const [autoTheme, setAutoTheme] = useState<boolean>(false);

  // Sync focus rings attribute to HTML document root
  useEffect(() => {
    if (boldFocusRings) {
      document.documentElement.setAttribute('data-bold-focus', 'true');
    } else {
      document.documentElement.removeAttribute('data-bold-focus');
    }
  }, [boldFocusRings]);

  // Sync preference toggles
  const handleToggleAnimations = () => {
    const next = !smoothAnimations;
    setSmoothAnimations(next);
    localStorage.setItem('pref_smooth_anim', String(next));
    if (showToast) {
      showToast('Настройки обновлены', next ? 'Плавные анимации включены' : 'Анимации минимизированы', 'info');
    }
  };

  const handleToggleFocusRings = () => {
    const next = !boldFocusRings;
    setBoldFocusRings(next);
    localStorage.setItem('pref_bold_focus', String(next));
    if (next) {
      document.documentElement.setAttribute('data-bold-focus', 'true');
    } else {
      document.documentElement.removeAttribute('data-bold-focus');
    }
    if (showToast) {
      showToast('Контрастные рамки', next ? 'Включены контрастные рамки фокуса' : 'Стандартные рамки', 'info');
    }
  };

  // Find active scheme and preset
  const activeScheme = COLOR_SCHEMES.find(s => s.id === colorSchemeId) || COLOR_SCHEMES[0];
  const activePreset = BG_PRESETS.find(p => p.id === bgPresetId) || BG_PRESETS[0];

  const handleSelectScheme = (scheme: ColorScheme) => {
    setColorSchemeId(scheme.id);
    setBgPresetId(scheme.defaultBgId);
    if (showToast) {
      showToast(
        'Цветовая схема обновлена',
        `Активирована палитра «${scheme.name}» с фоновым градиентом`,
        'success'
      );
    }
  };

  const handleSelectBg = (preset: BgPreset) => {
    setBgPresetId(preset.id);
    if (showToast) {
      showToast(
        'Фоновый стиль обновлен',
        `Установлен фоновый стиль «${preset.name}»`,
        'success'
      );
    }
  };

  // Universal 5th pure grey gradient preset (without color spots)
  const pureGreyPreset = BG_PRESETS.find(p => p.id === 'bg-pure-grey-gradient') || {
    id: 'bg-pure-grey-gradient',
    name: 'Серый градиент (Без пятен)',
    type: 'gradient' as const,
    hideBlobs: true,
    previewCss: 'linear-gradient(145deg, #8E8E93 0%, #3A3A3C 100%)',
    lightBg: 'linear-gradient(145deg, #FAFAFC 0%, #EEEEF2 50%, #DFE1E6 100%)',
    darkBg: 'linear-gradient(145deg, #323236 0%, #202024 50%, #111114 100%)',
  };

  // Exactly 5 recommended presets for the active scheme (4 scheme-specific + 1 pure grey gradient)
  const schemeSpecificPresets = BG_PRESETS.filter(p => p.schemeId === activeScheme.id);
  const recommendedPresets: BgPreset[] = [
    ...schemeSpecificPresets,
    pureGreyPreset,
  ];

  const displayedPresets = bgTab === 'recommended' ? recommendedPresets : BG_PRESETS;

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-16">

      {/* TWO COLUMN WORKSPACE LAYOUT (Controls on Left, Live Mockup on Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: THEME CONTROLS (7 Cols on XL) */}
        <div className="xl:col-span-7 bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] sm:rounded-[32px] border border-zinc-200/50 dark:border-zinc-800/40 shadow-xs p-5 sm:p-6 space-y-6">
          
          {/* TOP ROW: SEGMENTED THEME SWITCHER (Light / Dark / Auto) */}
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-zinc-200/40 dark:border-zinc-800/40">
            <div>
              <span className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal uppercase block">
                РЕЖИМ ОТОБРАЖЕНИЯ (THEME MODE)
              </span>
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                {autoTheme ? 'Системный (Авто)' : theme === 'dark' ? 'Тёмная тема' : 'Светлая тема'}
              </span>
            </div>

            {/* Compact Segmented Switcher with Icons & Light Text */}
            <div className="inline-flex items-center p-1 bg-zinc-200/60 dark:bg-zinc-950/70 rounded-full border border-zinc-300/40 dark:border-zinc-800/60 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setAutoTheme(true);
                  const isDarkPref = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if ((isDarkPref && theme === 'light') || (!isDarkPref && theme === 'dark')) {
                    toggleTheme();
                  }
                }}
                style={autoTheme ? { background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' } : undefined}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  autoTheme
                    ? 'text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Авто</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAutoTheme(false);
                  if (theme !== 'light') toggleTheme();
                }}
                style={!autoTheme && theme === 'light' ? { background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' } : undefined}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  !autoTheme && theme === 'light'
                    ? 'text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Светлая</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAutoTheme(false);
                  if (theme !== 'dark') toggleTheme();
                }}
                style={!autoTheme && theme === 'dark' ? { background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' } : undefined}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  !autoTheme && theme === 'dark'
                    ? 'text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Тёмная</span>
              </button>
            </div>
          </div>

          {/* 1. ACCENT COLOR PICKER (Vibrant Color Gradient Swatches) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal uppercase">
                АКЦЕНТНЫЙ ЦВЕТ (ACCENT COLOR)
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  {activeScheme.name}
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  ({activeScheme.from})
                </span>
              </div>
            </div>

            {/* Row of Swatch Circles with Glow */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 p-3 bg-white/30 dark:bg-zinc-950/40 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/40">
              {COLOR_SCHEMES.map((scheme) => {
                const isSelected = scheme.id === colorSchemeId;
                return (
                  <button
                    key={scheme.id}
                    type="button"
                    onClick={() => handleSelectScheme(scheme)}
                    className="group relative flex flex-col items-center cursor-pointer outline-none focus:scale-110 transition-transform"
                    title={scheme.name}
                  >
                    <div
                      style={{
                        background: `linear-gradient(135deg, ${scheme.from} 0%, ${scheme.to} 100%)`,
                        boxShadow: isSelected
                          ? `0 0 0 3px var(--bg-card, rgba(255,255,255,0.9)), 0 0 16px ${scheme.from}`
                          : undefined,
                      }}
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isSelected
                          ? 'scale-110 ring-2 ring-[var(--lavDeep)] dark:ring-[var(--lavenderAccent)]'
                          : 'hover:scale-110 opacity-85 hover:opacity-100'
                      }`}
                    >
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-white stroke-[3] drop-shadow-xs" />
                      )}
                    </div>
                    
                    {/* Micro caption */}
                    <span className={`text-[10px] font-medium mt-1.5 transition-colors whitespace-nowrap ${
                      isSelected
                        ? 'text-zinc-900 dark:text-zinc-100 font-semibold'
                        : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'
                    }`}>
                      {scheme.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. BACKGROUND PRESETS (5 Recommended Square Tiles + Clean Tabs) */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal uppercase block">
                  ФОНОВЫЙ СТИЛЬ ОТОБРАЖЕНИЯ (BACKGROUND PRESETS)
                </span>
                <span className="text-xs text-zinc-600 dark:text-zinc-400 leading-snug">
                  Квадратные пресеты градиентов и чистого серого фона
                </span>
              </div>

              {/* 2 FILTER TABS ONLY: Рекомендуемые («Ежевика») and Все стили */}
              <div className="flex items-center gap-1.5 p-1 bg-white/40 dark:bg-zinc-950/60 rounded-full border border-zinc-200/50 dark:border-zinc-800/40 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setBgTab('recommended')}
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    bgTab === 'recommended'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  Рекомендуемые ({activeScheme.name})
                </button>
                <button
                  type="button"
                  onClick={() => setBgTab('all')}
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    bgTab === 'all'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  Все стили
                </button>
              </div>
            </div>

            {/* SQUARE TILES GRID */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 p-3 bg-white/30 dark:bg-zinc-950/40 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/40">
              {displayedPresets.map((preset) => {
                const isSelected = preset.id === bgPresetId;
                const isRecommended = preset.id === activeScheme.defaultBgId;

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectBg(preset)}
                    className="group relative flex flex-col items-center cursor-pointer outline-none"
                    title={preset.name}
                  >
                    {/* Square gradient preview box */}
                    <div
                      style={{ background: preset.previewCss }}
                      className={`w-full aspect-square rounded-[18px] sm:rounded-[20px] border relative overflow-hidden transition-all duration-200 shadow-xs flex flex-col justify-between p-2 ${
                        isSelected
                          ? 'border-[var(--lavDeep)] dark:border-[var(--lavenderAccent)] ring-2 ring-[var(--lavDeep)] dark:ring-[var(--lavenderAccent)] scale-[1.03] shadow-md'
                          : 'border-zinc-200/70 dark:border-zinc-800/70 hover:scale-[1.02] hover:border-zinc-400 dark:hover:border-zinc-600'
                      }`}
                    >
                      {/* Top indicator tag */}
                      <div className="flex items-center justify-between w-full">
                        {isRecommended ? (
                          <span className="px-1 py-0.5 rounded-md text-[7px] font-bold bg-white/90 dark:bg-zinc-900/90 text-amber-600 dark:text-amber-300 shadow-2xs backdrop-blur-xs">
                            ★
                          </span>
                        ) : <div />}

                        {isSelected && (
                          <div
                            style={{ background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' }}
                            className="w-4 h-4 rounded-full text-white flex items-center justify-center shadow-xs"
                          >
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      {/* Bottom mock pill */}
                      <div className="w-full h-2.5 rounded-md bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xs border border-white/60 dark:border-zinc-800/60 flex items-center px-1">
                        <div
                          style={{ background: `linear-gradient(135deg, ${activeScheme.from} 0%, ${activeScheme.to} 100%)` }}
                          className="w-3.5 h-1 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Preset Label below */}
                    <span className={`text-[10px] text-center mt-1.5 line-clamp-1 transition-colors px-1 ${
                      isSelected
                        ? 'text-zinc-900 dark:text-zinc-100 font-semibold'
                        : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 font-normal'
                    }`}>
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* RESET TO SCHEME DEFAULT BUTTON */}
            {activePreset.id !== activeScheme.defaultBgId && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const defaultPreset = BG_PRESETS.find(p => p.id === activeScheme.defaultBgId);
                    if (defaultPreset) handleSelectBg(defaultPreset);
                  }}
                  className="text-xs font-semibold text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Вернуть рекомендуемый фон для «{activeScheme.name}»</span>
                </button>
              </div>
            )}
          </div>

          {/* 3. ADDITIONAL COMPACT TOGGLES */}
          <div className="pt-4 border-t border-zinc-200/40 dark:border-zinc-800/40 space-y-3">
            <span className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal uppercase block">
              ДОПОЛНИТЕЛЬНЫЕ НАСТРОЙКИ ИНТЕРФЕЙСА
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Smooth animations toggle */}
              <div
                onClick={handleToggleAnimations}
                className="p-3.5 bg-white/30 dark:bg-zinc-950/40 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/40 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/50 dark:hover:bg-zinc-950/60 transition-all"
              >
                <div>
                  <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Плавные анимации
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                    Мягкие переходы между экранами и деталями
                  </p>
                </div>

                <div
                  style={smoothAnimations ? { background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' } : undefined}
                  className={`w-10 h-6 rounded-full p-1 transition-all flex items-center ${
                    smoothAnimations
                      ? 'justify-end shadow-xs'
                      : 'bg-zinc-300 dark:bg-zinc-800 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                </div>
              </div>

              {/* Bold focus rings toggle */}
              <div
                onClick={handleToggleFocusRings}
                className="p-3.5 bg-white/30 dark:bg-zinc-950/40 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/40 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/50 dark:hover:bg-zinc-950/60 transition-all"
              >
                <div>
                  <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Контрастные рамки фокуса
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                    Усиленная видимость выделенных слоев и кнопок
                  </p>
                </div>

                <div
                  style={boldFocusRings ? { background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' } : undefined}
                  className={`w-10 h-6 rounded-full p-1 transition-all flex items-center ${
                    boldFocusRings
                      ? 'justify-end shadow-xs'
                      : 'bg-zinc-300 dark:bg-zinc-800 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                </div>
              </div>
            </div>

            {/* Test field for testing focus ring immediately */}
            {boldFocusRings && (
              <div className="p-3 bg-white/40 dark:bg-zinc-900/60 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between gap-3 animate-fadeIn">
                <span className="text-xs text-zinc-600 dark:text-zinc-300">
                  Проверьте фокус: кликните на кнопку или поле справа:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Тест фокуса..."
                    className="w-28 px-2 py-1 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                  <button
                    type="button"
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    Тест
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* NOTICE BOX */}
          <div className="p-3.5 bg-emerald-500/10 dark:bg-emerald-950/30 rounded-2xl border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200 font-normal leading-relaxed flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Все выбранные параметры оформления, цвет и фоновые стили сохраняются мгновенно.</span>
          </div>

        </div>

        {/* RIGHT COLUMN: LIVE MOCKUP PREVIEW WINDOW (Matching screenshot reference) */}
        <div className="xl:col-span-5 sticky top-6 bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] sm:rounded-[32px] border border-zinc-200/50 dark:border-zinc-800/40 shadow-xs p-5 sm:p-6 space-y-4">
          
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200/40 dark:border-zinc-800/40">
            <div>
              <span className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal uppercase block">
                ПРЕДПРОСМОТР РАБОЧЕГО ПРОСТРАНСТВА
              </span>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Стиль: «{activeScheme.name}»
              </h3>
            </div>

            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white shadow-xs" style={{ background: `linear-gradient(135deg, ${activeScheme.from} 0%, ${activeScheme.to} 100%)` }}>
              Live Preview
            </span>
          </div>

          {/* MOCKUP INTERFACE WINDOW */}
          <div
            style={{ background: theme === 'dark' ? activePreset.darkBg : activePreset.lightBg }}
            className="w-full rounded-[22px] border border-zinc-200/70 dark:border-zinc-800/70 p-3 sm:p-4 shadow-inner space-y-3 transition-colors duration-300 relative overflow-hidden"
          >
            {/* Top Toolbar in Mockup */}
            <div className="flex items-center justify-between gap-2">
              {/* Search bar */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm border border-zinc-200/60 dark:border-zinc-700/60 text-[11px] text-zinc-500 dark:text-zinc-400 flex-1 max-w-[150px]">
                <Search className="w-3 h-3" />
                <span className="truncate">Поиск проектов...</span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  style={{ background: `linear-gradient(135deg, ${activeScheme.from} 0%, ${activeScheme.to} 100%)` }}
                  className="px-2.5 py-1 rounded-full text-white text-[10px] font-semibold flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3 h-3" />
                  <span>Проект</span>
                </button>

                <div className="p-1 rounded-full bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/60 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-300">
                  <Users className="w-3 h-3" />
                </div>
              </div>
            </div>

            {/* Grid of Mini Project Cards */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {/* Card 1 */}
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/60 dark:border-zinc-800/60 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-[var(--lavenderSoft)] text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]">
                    В работе
                  </span>
                  <Zap className="w-3 h-3 text-amber-500" />
                </div>
                <div>
                  <h5 className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                    Свадьба в усадьбе
                  </h5>
                  <p className="text-[9px] text-zinc-500 dark:text-zinc-400">12 сентября • 450 000 ₽</p>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    style={{ background: `linear-gradient(135deg, ${activeScheme.from} 0%, ${activeScheme.to} 100%)`, width: '70%' }}
                    className="h-full rounded-full"
                  />
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/60 dark:border-zinc-800/60 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                    Согласован
                  </span>
                  <Calendar className="w-3 h-3 text-emerald-500" />
                </div>
                <div>
                  <h5 className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                    Юбилей «Villa Verde»
                  </h5>
                  <p className="text-[9px] text-zinc-500 dark:text-zinc-400">28 сентября • 280 000 ₽</p>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    style={{ background: `linear-gradient(135deg, ${activeScheme.from} 0%, ${activeScheme.to} 100%)`, width: '95%' }}
                    className="h-full rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Mini Status Bar */}
            <div className="p-2 rounded-xl bg-white/75 dark:bg-zinc-900/75 backdrop-blur-md border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <FolderKanban className="w-3.5 h-3.5 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]" />
                <span className="text-[10px] font-medium text-zinc-700 dark:text-zinc-300">
                  Всего 8 активных проектов
                </span>
              </div>

              {/* Status pill matching screenshot */}
              <div
                style={{ background: `linear-gradient(135deg, ${activeScheme.from} 0%, ${activeScheme.to} 100%)` }}
                className="px-2 py-0.5 rounded-full text-[9px] font-bold text-white shadow-2xs flex items-center gap-1"
              >
                <Check className="w-2.5 h-2.5 stroke-[3]" />
                <span>Стиль активен</span>
              </div>
            </div>

          </div>

          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 text-center leading-relaxed">
            Интерактивный предпросмотр обновляется в реальном времени при выборе схемы, градиента или темы.
          </p>

        </div>

      </div>

    </div>
  );
}
