import React, { useState } from 'react';
import { Settings, Sun, Moon, Check, Sparkles, Palette, Layers, RefreshCw, Paintbrush } from 'lucide-react';
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
  const [bgFilterTab, setBgFilterTab] = useState<'matching' | 'enhancing' | 'pastel' | 'all'>('matching');

  // Find active scheme and active preset
  const activeScheme = COLOR_SCHEMES.find(s => s.id === colorSchemeId) || COLOR_SCHEMES[5]; // default blackberry
  const activePreset = BG_PRESETS.find(p => p.id === bgPresetId) || BG_PRESETS[0];

  // Handler when selecting a color scheme:
  // Updates scheme AND automatically sets the matching default background!
  const handleSelectScheme = (scheme: ColorScheme) => {
    setColorSchemeId(scheme.id);
    setBgPresetId(scheme.defaultBgId);
    if (showToast) {
      showToast(
        'Цветовая схема обновлена',
        `Активирована схема «${scheme.name}» с соответствующим фоновым градиентом`,
        'success'
      );
    }
  };

  // Handler when selecting background preset independently:
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

  // Filtered background presets for selection
  const matchingPresets = BG_PRESETS.filter(p => p.schemeId === activeScheme.id);
  const enhancingPresets = BG_PRESETS.filter(p => p.type === 'enhancing');
  const pastelPresets = BG_PRESETS.filter(p => p.type === 'pastel');
  
  let displayedPresets = BG_PRESETS;
  if (bgFilterTab === 'matching') {
    displayedPresets = matchingPresets.length > 0 ? matchingPresets : BG_PRESETS;
  } else if (bgFilterTab === 'enhancing') {
    displayedPresets = enhancingPresets;
  } else if (bgFilterTab === 'pastel') {
    displayedPresets = pastelPresets;
  }

  return (
    <div className="w-full max-w-4xl space-y-6 animate-fadeIn pb-16">
      
      {/* CARD 1: THEME & COLOR SCHEME */}
      <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] sm:rounded-[32px] border border-zinc-200/50 dark:border-zinc-800/40 shadow-xs p-5 sm:p-6 space-y-6">
        
        {/* CARD HEADER */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-zinc-200/40 dark:border-zinc-800/40">
          <div className="p-2 bg-[var(--lavenderSoft)] rounded-xl shrink-0">
            <Palette className="w-5 h-5 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Тема и цветовая палитра
            </h3>
            <p className="text-xs sm:text-sm font-normal text-zinc-700 dark:text-zinc-300 leading-relaxed">
              Выберите светлый/тёмный режим и фирменную акцентную палитру
            </p>
          </div>
        </div>

        {/* SECTION 1: LIGHT / DARK MODE */}
        <div>
          <span className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal uppercase block mb-3">
            РЕЖИМ ОТОБРАЖЕНИЯ (СВЕТЛАЯ / ТЁМНАЯ)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* LIGHT THEME CARD */}
            <div
              onClick={() => {
                if (theme !== 'light') toggleTheme();
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                theme === 'light'
                  ? 'bg-white/80 border-[var(--primary-accent)] shadow-md ring-2 ring-[var(--primary-accent)]/20'
                  : 'bg-white/20 dark:bg-zinc-800/20 border-zinc-200/60 dark:border-zinc-800/60 hover:bg-white/40 dark:hover:bg-zinc-800/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 rounded-xl shrink-0">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Светлая тема
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Классический светлый интерфейс
                    </p>
                  </div>
                </div>
                {theme === 'light' && (
                  <div
                    style={{ background: 'linear-gradient(135deg, var(--primary-grad-from) 0%, var(--primary-grad-to) 100%)' }}
                    className="w-5 h-5 rounded-full text-white flex items-center justify-center shrink-0 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* MOCK PREVIEW BOX */}
              <div className="w-full h-16 rounded-xl bg-slate-100 border border-slate-200/80 p-2 flex flex-col justify-between overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <div className="w-12 h-1.5 rounded-full bg-slate-300" />
                </div>
                <div className="w-full h-6 rounded-lg bg-white border border-slate-200 flex items-center px-2">
                  <div
                    style={{ background: `linear-gradient(135deg, ${activeScheme.from} 0%, ${activeScheme.to} 100%)` }}
                    className="w-16 h-1.5 rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* DARK THEME CARD */}
            <div
              onClick={() => {
                if (theme !== 'dark') toggleTheme();
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                theme === 'dark'
                  ? 'bg-zinc-900/80 border-[var(--primary-accent)] shadow-md ring-2 ring-[var(--primary-accent)]/20'
                  : 'bg-white/20 dark:bg-zinc-800/20 border-zinc-200/60 dark:border-zinc-800/60 hover:bg-white/40 dark:hover:bg-zinc-800/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-900/50 text-indigo-300 rounded-xl shrink-0">
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Тёмная тема
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Глубокие графитовые тона
                    </p>
                  </div>
                </div>
                {theme === 'dark' && (
                  <div
                    style={{ background: 'linear-gradient(135deg, var(--primary-grad-from) 0%, var(--primary-grad-to) 100%)' }}
                    className="w-5 h-5 rounded-full text-white flex items-center justify-center shrink-0 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* MOCK PREVIEW BOX */}
              <div className="w-full h-16 rounded-xl bg-zinc-950 border border-zinc-800 p-2 flex flex-col justify-between overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <div className="w-12 h-1.5 rounded-full bg-zinc-700" />
                </div>
                <div className="w-full h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center px-2">
                  <div
                    style={{ background: `linear-gradient(135deg, ${activeScheme.from} 0%, ${activeScheme.to} 100%)` }}
                    className="w-16 h-1.5 rounded-full"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 2: COLOR SCHEMES SELECTION */}
        <div className="pt-4 border-t border-zinc-200/40 dark:border-zinc-800/40">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal uppercase">
              ЦВЕТОВАЯ СХЕМА КНОПОК И АКЦЕНТОВ (COLOR PALETTE)
            </span>
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              Выбрано: <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">{activeScheme.name}</strong>
            </span>
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
            При выборе схемы автоматически устанавливаются гармоничные кнопки и соответствующий фоновый градиент.
          </p>

          {/* PALETTE GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {COLOR_SCHEMES.map((scheme) => {
              const isSelected = scheme.id === colorSchemeId;
              return (
                <div
                  key={scheme.id}
                  onClick={() => handleSelectScheme(scheme)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 relative overflow-hidden ${
                    isSelected
                      ? 'bg-white/90 dark:bg-zinc-800/90 border-[var(--primary-accent)] shadow-md ring-2 ring-[var(--primary-accent)]/20 scale-[1.02]'
                      : 'bg-white/30 dark:bg-zinc-800/30 border-zinc-200/60 dark:border-zinc-800/60 hover:bg-white/50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {scheme.name}
                    </span>
                    {isSelected && (
                      <div
                        style={{ background: `linear-gradient(135deg, ${scheme.from} 0%, ${scheme.to} 100%)` }}
                        className="w-4 h-4 rounded-full text-white flex items-center justify-center shrink-0 shadow-xs"
                      >
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* GRADIENT CAPSULE (PILL) PREVIEW AS IN IMAGE */}
                  <div
                    style={{ background: `linear-gradient(135deg, ${scheme.from} 0%, ${scheme.to} 100%)` }}
                    className="w-full h-8 rounded-full shadow-inner flex items-center justify-between px-2.5 text-[9px] font-mono text-white/90"
                  >
                    <span>{scheme.from}</span>
                    {scheme.from !== scheme.to && <span>{scheme.to}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* CARD 2: BACKGROUND CANVAS SELECTOR */}
      <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] sm:rounded-[32px] border border-zinc-200/50 dark:border-zinc-800/40 shadow-xs p-5 sm:p-6 space-y-5">
        
        {/* CARD HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200/40 dark:border-zinc-800/40">
          <div className="flex items-center gap-3.5">
            <div className="p-2 bg-[var(--lavenderSoft)] rounded-xl shrink-0">
              <Layers className="w-5 h-5 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Фоновый стиль приложения</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-normal bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {activePreset.name}
                </span>
              </h3>
              <p className="text-xs sm:text-sm font-normal text-zinc-700 dark:text-zinc-300 leading-relaxed">
                Вы можете сохранить рекомендуемый градиент схемы или самостоятельно выбрать любой другой
              </p>
            </div>
          </div>

          {/* RESET TO SCHEME DEFAULT BUTTON */}
          {activePreset.id !== activeScheme.defaultBgId && (
            <button
              type="button"
              onClick={() => {
                const defaultPreset = BG_PRESETS.find(p => p.id === activeScheme.defaultBgId);
                if (defaultPreset) handleSelectBg(defaultPreset);
              }}
              className="text-xs font-semibold text-[var(--primary-accent)] hover:underline flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Вернуть рекомендуемый фон</span>
            </button>
          )}
        </div>

        {/* TABS FOR BACKGROUND CATEGORIES */}
        <div className="flex flex-wrap items-center gap-2 p-1 bg-white/40 dark:bg-zinc-800/40 rounded-full border border-zinc-200/50 dark:border-zinc-800/40 w-fit">
          <button
            type="button"
            onClick={() => setBgFilterTab('matching')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              bgFilterTab === 'matching'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            Все 4 фона для «{activeScheme.name}»
          </button>
          <button
            type="button"
            onClick={() => setBgFilterTab('enhancing')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              bgFilterTab === 'enhancing'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            Усиливающие
          </button>
          <button
            type="button"
            onClick={() => setBgFilterTab('pastel')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              bgFilterTab === 'pastel'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            Однотонные пастельные
          </button>
          <button
            type="button"
            onClick={() => setBgFilterTab('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              bgFilterTab === 'all'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            Все пресеты
          </button>
        </div>

        {/* BACKGROUND PRESETS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
          {displayedPresets.map((preset) => {
            const isSelected = preset.id === bgPresetId;
            const isRecommended = preset.id === activeScheme.defaultBgId;

            return (
              <div
                key={preset.id}
                onClick={() => handleSelectBg(preset)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
                  isSelected
                    ? 'bg-white/90 dark:bg-zinc-900/90 border-[var(--primary-accent)] shadow-md ring-2 ring-[var(--primary-accent)]/20'
                    : 'bg-white/30 dark:bg-zinc-800/30 border-zinc-200/60 dark:border-zinc-800/60 hover:bg-white/50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <span>{preset.name}</span>
                      {isRecommended && (
                        <span className="px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300/40">
                          Рекомендуем
                        </span>
                      )}
                    </h4>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 capitalize">
                      {preset.type === 'pastel'
                        ? 'Пастельный однотонный'
                        : preset.type === 'enhancing'
                        ? 'Усиливающий акцент'
                        : preset.type === 'classic'
                        ? 'Классический'
                        : 'Разноцветный градиент'}
                    </span>
                  </div>
                  {isSelected && (
                    <div
                      style={{ background: 'linear-gradient(135deg, var(--primary-grad-from) 0%, var(--primary-grad-to) 100%)' }}
                      className="w-4 h-4 rounded-full text-white flex items-center justify-center shrink-0 shadow-xs"
                    >
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* PREVIEW MINI CANVAS */}
                <div
                  style={{ background: preset.previewCss }}
                  className="w-full h-16 rounded-xl border border-zinc-200/60 dark:border-zinc-800 p-2 relative overflow-hidden flex flex-col justify-between shadow-2xs"
                >
                  <div className="flex items-center justify-between z-10">
                    <div className="w-10 h-1 rounded-full bg-zinc-800/30 dark:bg-white/30" />
                    <div className="w-3 h-3 rounded-full bg-white/70 dark:bg-zinc-800/70 border border-white/60" />
                  </div>
                  <div className="w-full h-7 rounded-lg bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm border border-white/80 dark:border-zinc-800 flex items-center px-2 justify-between z-10">
                    <div
                      style={{ background: `linear-gradient(135deg, ${activeScheme.from} 0%, ${activeScheme.to} 100%)` }}
                      className="w-12 h-1.5 rounded-full"
                    />
                    <div className="w-6 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* NOTICE BOX */}
        <div className="p-3.5 bg-emerald-500/10 dark:bg-emerald-950/30 rounded-2xl border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200 font-normal leading-relaxed flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Все настройки палитры и фона сохраняются автоматически в вашем браузере.</span>
        </div>

      </div>

    </div>
  );
}
