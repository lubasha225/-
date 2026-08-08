import React from 'react';
import { Settings, Sun, Moon, Check, Sparkles, Palette, Layers } from 'lucide-react';

interface SettingsTabProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  bgTheme: 'aurora' | 'default';
  setBgTheme: (bg: 'aurora' | 'default') => void;
  showToast?: (title: string, message: string, type?: 'success' | 'info' | 'warn') => void;
}

export default function SettingsTab({ theme, toggleTheme, bgTheme, setBgTheme, showToast }: SettingsTabProps) {
  const handleSelectBg = (mode: 'aurora' | 'default') => {
    if (bgTheme !== mode) {
      setBgTheme(mode);
      if (showToast) {
        showToast(
          'Фоновый стиль обновлен',
          mode === 'aurora'
            ? 'Активирован фоновый стиль «Subly Aurora» с мягкими пастельными бликами'
            : 'Активирован «Классический» минималистичный фон',
          'success'
        );
      }
    }
  };

  return (
    <div className="w-full max-w-4xl space-y-6 animate-fadeIn pb-16">
      {/* CARD 1: THEME & APPEARANCE */}
      <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] sm:rounded-[32px] border border-zinc-200/50 dark:border-zinc-800/40 shadow-xs p-5 sm:p-6 space-y-6">
        
        {/* CARD HEADER */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-zinc-200/40 dark:border-zinc-800/40">
          <div className="p-2 bg-[var(--lavenderSoft)] rounded-xl shrink-0">
            <Settings className="w-5 h-5 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Оформление и тема
            </h3>
            <p className="text-xs sm:text-sm font-normal text-zinc-700 dark:text-zinc-300 leading-relaxed">
              Выберите предпочтительный визуальный режим панели управления
            </p>
          </div>
        </div>

        {/* SECTION 1: THEME MODE */}
        <div>
          <span className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal uppercase block mb-3">
            РЕЖИМ ОТОБРАЖЕНИЯ (СВЕТЛАЯ / ТЁМНАЯ)
          </span>

          {/* THEME CARDS SELECTION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* LIGHT THEME CARD */}
            <div
              onClick={() => {
                if (theme !== 'light') toggleTheme();
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                theme === 'light'
                  ? 'bg-white/80 border-[#8C52D0] dark:border-purple-500 shadow-md ring-2 ring-[#8C52D0]/20'
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
                  <div className="w-5 h-5 rounded-full bg-[#8C52D0] text-white flex items-center justify-center shrink-0">
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
                  <div className="w-16 h-1.5 rounded-full bg-purple-400" />
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
                  ? 'bg-zinc-900/80 border-[#8C52D0] dark:border-purple-400 shadow-md ring-2 ring-[#8C52D0]/20'
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
                  <div className="w-5 h-5 rounded-full bg-[#8C52D0] text-white flex items-center justify-center shrink-0">
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
                  <div className="w-16 h-1.5 rounded-full bg-purple-500" />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 2: BACKGROUND STYLE SELECTION */}
        <div className="pt-4 border-t border-zinc-200/40 dark:border-zinc-800/40">
          <span className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal uppercase block mb-3">
            ФОНОВЫЙ СТИЛЬ ПРИЛОЖЕНИЯ (BACKGROUND CANVAS)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* BACKGROUND OPTION 1: SUBLY AURORA */}
            <div
              onClick={() => handleSelectBg('aurora')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                bgTheme === 'aurora'
                  ? 'bg-white/80 dark:bg-zinc-900/80 border-[#8C52D0] dark:border-purple-400 shadow-md ring-2 ring-[#8C52D0]/20'
                  : 'bg-white/20 dark:bg-zinc-800/20 border-zinc-200/60 dark:border-zinc-800/60 hover:bg-white/40 dark:hover:bg-zinc-800/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300 rounded-xl shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <span>Subly Aurora</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-100 dark:bg-purple-900/60 text-[#8C52D0] dark:text-purple-200">
                        Из макета
                      </span>
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Пастельный градиент с мягкими лавандовыми и персиковыми бликами
                    </p>
                  </div>
                </div>
                {bgTheme === 'aurora' && (
                  <div className="w-5 h-5 rounded-full bg-[#8C52D0] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* MOCK PREVIEW BOX WITH AURORA GLOWS */}
              <div className="w-full h-20 rounded-xl relative overflow-hidden border border-purple-200/60 dark:border-purple-900/40 p-2 flex flex-col justify-between bg-[#F5F4F9] dark:bg-[#0C0A10]">
                {/* Simulated ambient glows */}
                <div className="absolute top-0 left-0 w-16 h-16 rounded-full bg-purple-300/50 dark:bg-purple-700/30 blur-md pointer-events-none" />
                <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-rose-200/60 dark:bg-rose-800/30 blur-md pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-14 h-14 rounded-full bg-sky-200/60 dark:bg-sky-900/30 blur-md pointer-events-none" />
                
                <div className="relative z-10 flex items-center justify-between">
                  <div className="w-12 h-1.5 rounded-full bg-zinc-800/20 dark:bg-white/20" />
                  <div className="w-4 h-4 rounded-full bg-white/70 dark:bg-zinc-800/70 border border-white/80" />
                </div>
                <div className="relative z-10 w-full h-8 rounded-lg bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-white/80 dark:border-zinc-800 flex items-center px-2.5 justify-between">
                  <div className="w-16 h-1.5 rounded-full bg-[#8C52D0]" />
                  <div className="w-8 h-2 rounded-full bg-purple-200 dark:bg-purple-900" />
                </div>
              </div>
            </div>

            {/* BACKGROUND OPTION 2: CLASSIC */}
            <div
              onClick={() => handleSelectBg('default')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                bgTheme === 'default'
                  ? 'bg-white/80 dark:bg-zinc-900/80 border-[#8C52D0] dark:border-purple-400 shadow-md ring-2 ring-[#8C52D0]/20'
                  : 'bg-white/20 dark:bg-zinc-800/20 border-zinc-200/60 dark:border-zinc-800/60 hover:bg-white/40 dark:hover:bg-zinc-800/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 rounded-xl shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Классический фон
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Лаконичный нейтринный градиент без акцентных цветовых бликов
                    </p>
                  </div>
                </div>
                {bgTheme === 'default' && (
                  <div className="w-5 h-5 rounded-full bg-[#8C52D0] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* MOCK PREVIEW BOX FOR CLASSIC */}
              <div className="w-full h-20 rounded-xl relative overflow-hidden border border-zinc-200/80 dark:border-zinc-800 p-2 flex flex-col justify-between bg-stone-100 dark:bg-zinc-950">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-1.5 rounded-full bg-zinc-400/30" />
                  <div className="w-4 h-4 rounded-full bg-zinc-300 dark:bg-zinc-800" />
                </div>
                <div className="w-full h-8 rounded-lg bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 flex items-center px-2.5 justify-between">
                  <div className="w-16 h-1.5 rounded-full bg-zinc-500" />
                  <div className="w-8 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* PRIMARY TOGGLE BUTTON */}
        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-zinc-200/40 dark:border-zinc-800/40">
          <button
            type="button"
            onClick={toggleTheme}
            style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
            className="rounded-full text-white font-semibold text-xs sm:text-sm px-6 py-2.5 flex items-center gap-2 cursor-pointer transition-transform active:scale-[0.98] shadow-md hover:opacity-95"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-4 h-4" />
                <span>Переключить на тёмную тему</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4" />
                <span>Переключить на светлую тему</span>
              </>
            )}
          </button>
        </div>

        {/* NOTICE BOX */}
        <div className="p-3.5 bg-emerald-500/10 dark:bg-emerald-950/30 rounded-2xl border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200 font-normal leading-relaxed flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Настройки темы и фонового стиля сохраняются автоматически в вашем браузере.</span>
        </div>

      </div>
    </div>
  );
}

