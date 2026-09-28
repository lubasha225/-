import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Trash2,
  Plus,
  ImageIcon,
  Calendar,
  User,
  Phone,
  MapPin,
  Palette,
  Wallet,
  Sparkles,
  Check,
  Pipette,
  X,
  RotateCcw
} from 'lucide-react';

interface ClientBriefFormProps {
  formData: Record<string, string>;
  handleFieldChange: (field: string, value: string) => void;
  customColors: string[];
  handleAddCustomColor: (color: string) => void;
  handleRemoveCustomColor: (index: number) => void;
  handleClearCustomColors?: () => void;
  handleGenerateHarmoniousPalette: () => void;
  referenceImages: string[];
  setReferenceImages: React.Dispatch<React.SetStateAction<string[]>>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filledCount: number;
}

const QUICK_COLOR_SWATCHES = [
  { name: 'Белый', hex: '#FFFFFF' },
  { name: 'Шампань', hex: '#F7F4EE' },
  { name: 'Айвори', hex: '#F2E8DC' },
  { name: 'Пудровый', hex: '#F5DDD6' },
  { name: 'Пыльная роза', hex: '#DCA7A6' },
  { name: 'Марсала', hex: '#782839' },
  { name: 'Лаванда', hex: '#8C52D0' },
  { name: 'Слива', hex: '#582F89' },
  { name: 'Шалфей', hex: '#8FA382' },
  { name: 'Эвкалипт', hex: '#5B7065' },
  { name: 'Изумруд', hex: '#1C4938' },
  { name: 'Олива', hex: '#7A843B' },
  { name: 'Небесный', hex: '#7CA1C2' },
  { name: 'Терракота', hex: '#C86D51' },
  { name: 'Золото', hex: '#D4AF37' },
  { name: 'Графит', hex: '#2A2B2A' },
];

export const ClientBriefForm: React.FC<ClientBriefFormProps> = ({
  formData,
  handleFieldChange,
  customColors,
  handleAddCustomColor,
  handleRemoveCustomColor,
  handleClearCustomColors,
  handleGenerateHarmoniousPalette,
  referenceImages,
  setReferenceImages,
  handleImageUpload,
  filledCount,
}) => {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [tempColor, setTempColor] = useState('#8C52D0');
  const colorPickerRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside or pressing Escape
  useEffect(() => {
    if (!isColorPickerOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setIsColorPickerOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsColorPickerOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isColorPickerOpen]);
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* 14 QUESTIONS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
        {/* 1. ИМЯ КЛИЕНТА */}
        <div className="p-3.5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 border-l-[3px] border-l-[var(--primary-accent)] bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md shadow-2xs flex flex-col justify-between hover:border-[var(--primary-accent)]/50 transition-all">
          <div>
            <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal mb-1.5 block">
              1. ИМЯ КЛИЕНТА <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData["ИМЯ КЛИЕНТА"] || ''}
              onChange={(e) => handleFieldChange("ИМЯ КЛИЕНТА", e.target.value)}
              placeholder="ФИО / пара (Елизавета и Павел)"
              className="w-full bg-white/90 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[var(--primary-accent)] transition-all placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* 2. ТЕЛЕФОН */}
        <div className="p-3.5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 border-l-[3px] border-l-[var(--primary-accent)] bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md shadow-2xs flex flex-col justify-between hover:border-[var(--primary-accent)]/50 transition-all">
          <div>
            <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal mb-1.5 block">
              2. ТЕЛЕФОН <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              value={formData["ТЕЛЕФОН"] || ''}
              onChange={(e) => handleFieldChange("ТЕЛЕФОН", e.target.value)}
              placeholder="+7 (900) 000-00-00"
              className="w-full bg-white/90 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[var(--primary-accent)] transition-all placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* 3. СОБЫТИЕ */}
        <div className="p-3.5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 border-l-[3px] border-l-[var(--primary-accent)] bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md shadow-2xs flex flex-col justify-between hover:border-[var(--primary-accent)]/50 transition-all">
          <div>
            <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal mb-1.5 block">
              3. СОБЫТИЕ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData["СОБЫТИЕ"] || ''}
              onChange={(e) => handleFieldChange("СОБЫТИЕ", e.target.value)}
              placeholder="Свадьба, юбилей, выпускной..."
              className="w-full bg-white/90 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[var(--primary-accent)] transition-all placeholder:text-zinc-400"
            />
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {['Свадьба', 'Юбилей', 'День рождения', 'Корпоратив'].map(item => (
              <button
                key={item}
                type="button"
                onClick={() => handleFieldChange("СОБЫТИЕ", item)}
                className="text-[9px] px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-[var(--lavenderSoft)] text-zinc-600 dark:text-zinc-400 hover:text-[var(--primary-accent)] transition-colors cursor-pointer"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* 4. ДАТА */}
        <div className="p-3.5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 border-l-[3px] border-l-[var(--primary-accent)] bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md shadow-2xs flex flex-col justify-between hover:border-[var(--primary-accent)]/50 transition-all">
          <div>
            <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal mb-1.5 block">
              4. ДАТА <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={formData["ДАТА"] || ''}
              onChange={(e) => handleFieldChange("ДАТА", e.target.value)}
              className="w-full bg-white/90 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[var(--primary-accent)] transition-all cursor-pointer"
            />
          </div>
        </div>

        {/* 5. ГОСТЕЙ */}
        <div className="p-3.5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 border-l-[3px] border-l-[var(--primary-accent)] bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md shadow-2xs flex flex-col justify-between hover:border-[var(--primary-accent)]/50 transition-all">
          <div>
            <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal mb-1.5 block">
              5. ГОСТЕЙ
            </label>
            <input
              type="text"
              value={formData["ГОСТЕЙ"] || ''}
              onChange={(e) => handleFieldChange("ГОСТЕЙ", e.target.value)}
              placeholder="Например: 50 человек"
              className="w-full bg-white/90 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[var(--primary-accent)] transition-all placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* 6. ФОРМАТ СОБЫТИЯ */}
        <div className="p-3.5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 border-l-[3px] border-l-[var(--primary-accent)] bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md shadow-2xs flex flex-col justify-between hover:border-[var(--primary-accent)]/50 transition-all">
          <div>
            <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal mb-1.5 block">
              6. ФОРМАТ СОБЫТИЯ
            </label>
            <input
              type="text"
              value={formData["ФОРМАТ СОБЫТИЯ"] || ''}
              onChange={(e) => handleFieldChange("ФОРМАТ СОБЫТИЯ", e.target.value)}
              placeholder="Банкет, фуршет, ужин..."
              className="w-full bg-white/90 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[var(--primary-accent)] transition-all placeholder:text-zinc-400"
            />
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {['Банкет', 'Фуршет', 'Церемония'].map(item => (
              <button
                key={item}
                type="button"
                onClick={() => handleFieldChange("ФОРМАТ СОБЫТИЯ", item)}
                className="text-[9px] px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-[var(--lavenderSoft)] text-zinc-600 dark:text-zinc-400 hover:text-[var(--primary-accent)] transition-colors cursor-pointer"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* 7. АДРЕС ПЛОЩАДКИ/НАЗВАНИЕ */}
        <div className="p-3.5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 border-l-[3px] border-l-[var(--primary-accent)] bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md shadow-2xs flex flex-col justify-between hover:border-[var(--primary-accent)]/50 transition-all">
          <div>
            <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal mb-1.5 block">
              7. АДРЕС ПЛОЩАДКИ/НАЗВАНИЕ
            </label>
            <input
              type="text"
              value={formData["АДРЕС ПЛОЩАДКИ/НАЗВАНИЕ"] || ''}
              onChange={(e) => handleFieldChange("АДРЕС ПЛОЩАДКИ/НАЗВАНИЕ", e.target.value)}
              placeholder="Ресторан, зал, усадьба..."
              className="w-full bg-white/90 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[var(--primary-accent)] transition-all placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* 8. КОНТАКТ ПЛОЩАДКИ */}
        <div className="p-3.5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 border-l-[3px] border-l-[var(--primary-accent)] bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md shadow-2xs flex flex-col justify-between hover:border-[var(--primary-accent)]/50 transition-all">
          <div>
            <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal mb-1.5 block">
              8. КОНТАКТ ПЛОЩАДКИ
            </label>
            <input
              type="text"
              value={formData["КОНТАКТ ПЛОЩАДКИ"] || ''}
              onChange={(e) => handleFieldChange("КОНТАКТ ПЛОЩАДКИ", e.target.value)}
              placeholder="Менеджер Артем, +7..."
              className="w-full bg-white/90 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[var(--primary-accent)] transition-all placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* 9. ПРАЗДНИК НА УЛИЦЕ */}
        <div className="p-3.5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 border-l-[3px] border-l-[var(--primary-accent)] bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md shadow-2xs flex flex-col justify-between hover:border-[var(--primary-accent)]/50 transition-all">
          <div>
            <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal mb-1.5 block">
              9. ПРАЗДНИК НА УЛИЦЕ
            </label>
            <input
              type="text"
              value={formData["ПРАЗДНИК НА УЛИЦЕ"] || ''}
              onChange={(e) => handleFieldChange("ПРАЗДНИК НА УЛИЦЕ", e.target.value)}
              placeholder="В помещении, шатер, веранда..."
              className="w-full bg-white/90 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[var(--primary-accent)] transition-all placeholder:text-zinc-400"
            />
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {['В помещении', 'Шатер', 'Веранда', 'На открытом воздухе'].map(item => (
              <button
                key={item}
                type="button"
                onClick={() => handleFieldChange("ПРАЗДНИК НА УЛИЦЕ", item)}
                className="text-[9px] px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-[var(--lavenderSoft)] text-zinc-600 dark:text-zinc-400 hover:text-[var(--primary-accent)] transition-colors cursor-pointer"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* 10. КТО ПРИНИМАЕТ РАБОТЫ */}
        <div className="p-3.5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 border-l-[3px] border-l-[var(--primary-accent)] bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md shadow-2xs flex flex-col justify-between hover:border-[var(--primary-accent)]/50 transition-all">
          <div>
            <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal mb-1.5 block">
              10. КТО ПРИНИМАЕТ РАБОТЫ
            </label>
            <input
              type="text"
              value={formData["КТО ПРИНИМАЕТ РАБОТЫ"] || ''}
              onChange={(e) => handleFieldChange("КТО ПРИНИМАЕТ РАБОТЫ", e.target.value)}
              placeholder="ФИО координатора или доверенного лица"
              className="w-full bg-white/90 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[var(--primary-accent)] transition-all placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* 11. ПАЛИТРА ОФОРМЛЕНИЯ */}
        <div className={`p-3.5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 border-l-[3px] border-l-[var(--primary-accent)] bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md shadow-2xs flex flex-col justify-between hover:border-[var(--primary-accent)]/50 transition-all ${isColorPickerOpen ? 'relative z-40' : 'relative z-0'}`}>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal block">
                11. ПАЛИТРА ОФОРМЛЕНИЯ
              </label>
              {customColors.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-zinc-500 dark:text-zinc-400">
                    {customColors.length} {customColors.length === 1 ? 'оттенок' : customColors.length < 5 ? 'оттенка' : 'оттенков'}
                  </span>
                  {handleClearCustomColors && (
                    <button
                      type="button"
                      onClick={handleClearCustomColors}
                      className="text-[9px] text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Очистить все выбранные оттенки"
                    >
                      Очистить
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Color swatches with add button */}
            <div className="relative">
              <div className="flex items-center gap-1.5 flex-wrap min-h-[36px] p-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
                {customColors.map((hex, idx) => (
                  <div
                    key={idx}
                    className="group relative w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full border border-black/10 dark:border-white/20 shadow-2xs flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 transition-transform"
                    style={{ backgroundColor: hex }}
                    title={`Цвет: ${hex}. Нажмите, чтобы удалить`}
                    onClick={() => handleRemoveCustomColor(idx)}
                  >
                    <Trash2 className="w-2.5 h-2.5 text-white drop-shadow opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}

                {/* Add color button */}
                <button
                  type="button"
                  onClick={() => {
                    setTempColor('#8C52D0');
                    setIsColorPickerOpen(prev => !prev);
                  }}
                  className="w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-600 hover:border-[var(--primary-accent)] flex items-center justify-center text-zinc-500 hover:text-[var(--primary-accent)] transition-all cursor-pointer shrink-0"
                  title="Добавить оттенок (открыть выбор цвета)"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Popover: Выбор цвета */}
              {isColorPickerOpen && (
                <div
                  ref={colorPickerRef}
                  className="absolute left-0 top-full mt-2 z-50 w-72 max-w-[calc(100vw-48px)] p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-700/90 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      Добавить цвет
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsColorPickerOpen(false)}
                      className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Picker row with OK button */}
                  <div className="pt-2.5 space-y-2">
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      Выберите оттенок и нажмите «ОК»:
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Swatch preview */}
                      <div
                        className="w-8 h-8 rounded-xl border border-black/10 dark:border-white/20 shadow-xs shrink-0 transition-colors"
                        style={{ backgroundColor: tempColor }}
                      />

                      {/* Native color picker launcher */}
                      <label className="relative flex-1 flex items-center justify-between px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-[var(--primary-accent)] bg-zinc-50 dark:bg-zinc-800/80 cursor-pointer text-xs font-medium text-zinc-700 dark:text-zinc-200 transition-all">
                        <div className="flex items-center gap-1.5">
                          <Pipette className="w-3.5 h-3.5 text-zinc-400" />
                          <span className="font-mono text-[11px] uppercase font-semibold text-zinc-800 dark:text-zinc-200">
                            {tempColor}
                          </span>
                        </div>
                        <span className="text-[10px] text-[var(--primary-accent)] font-semibold">
                          Палитра
                        </span>
                        <input
                          type="color"
                          value={tempColor}
                          onChange={(e) => setTempColor(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                      </label>

                      {/* OK Button */}
                      <button
                        type="button"
                        onClick={() => {
                          handleAddCustomColor(tempColor);
                          setIsColorPickerOpen(false);
                        }}
                        className="btn-primary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer shadow-xs active:scale-95"
                        title="Подтвердить и добавить этот цвет"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>ОК</span>
                      </button>
                    </div>

                    {/* Quick swatches */}
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-1.5">
                        Или щёлкните готовый оттенок:
                      </div>
                      <div className="grid grid-cols-8 gap-1.5">
                        {QUICK_COLOR_SWATCHES.map((swatch) => (
                          <button
                            key={swatch.hex}
                            type="button"
                            onClick={() => {
                              handleAddCustomColor(swatch.hex);
                              setIsColorPickerOpen(false);
                            }}
                            className="w-6 h-6 rounded-full border border-black/10 dark:border-white/20 shadow-2xs hover:scale-115 active:scale-95 transition-transform cursor-pointer shrink-0"
                            style={{ backgroundColor: swatch.hex }}
                            title={`${swatch.name} (${swatch.hex})`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Button: Создать гамму на основе выбранных цветов */}
            <button
              type="button"
              disabled={customColors.length === 0}
              onClick={handleGenerateHarmoniousPalette}
              className={`w-full mt-2 py-1.5 px-2.5 rounded-xl text-[10px] sm:text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                customColors.length > 0
                  ? 'bg-[var(--lavenderSoft)] text-[var(--primary-accent)] dark:text-[var(--lavenderAccent)] hover:opacity-90 border border-[var(--primary-accent)]/30 shadow-2xs active:scale-[0.98]'
                  : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-400 dark:text-zinc-500 border border-zinc-200/50 dark:border-zinc-700/50 cursor-not-allowed opacity-50'
              }`}
              title={
                customColors.length > 0
                  ? 'Сформировать красивую гармоничную гамму на основе выбранных цветов'
                  : 'Сначала выберите хотя бы один цвет через «+»'
              }
            >
              <Sparkles className="w-3 h-3 shrink-0" />
              <span>Создать гамму на основе выбранных цветов</span>
            </button>
          </div>
        </div>

        {/* 12. СТИЛЬ ОФОРМЛЕНИЯ */}
        <div className="p-3.5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 border-l-[3px] border-l-[var(--primary-accent)] bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md shadow-2xs flex flex-col justify-between hover:border-[var(--primary-accent)]/50 transition-all">
          <div>
            <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal mb-1.5 block">
              12. СТИЛЬ ОФОРМЛЕНИЯ
            </label>
            <input
              type="text"
              value={formData["СТИЛЬ ОФОРМЛЕНИЯ"] || ''}
              onChange={(e) => handleFieldChange("СТИЛЬ ОФОРМЛЕНИЯ", e.target.value)}
              placeholder="Бохо, классика, модерн..."
              className="w-full bg-white/90 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[var(--primary-accent)] transition-all placeholder:text-zinc-400"
            />
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {['Классика', 'Бохо-шик', 'Минимализм', 'Garden / Сад'].map(item => (
              <button
                key={item}
                type="button"
                onClick={() => handleFieldChange("СТИЛЬ ОФОРМЛЕНИЯ", item)}
                className="text-[9px] px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-[var(--lavenderSoft)] text-zinc-600 dark:text-zinc-400 hover:text-[var(--primary-accent)] transition-colors cursor-pointer"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* 13. ОРИЕНТИРОВОЧНЫЙ БЮДЖЕТ */}
        <div className="p-3.5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 border-l-[3px] border-l-[var(--primary-accent)] bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md shadow-2xs flex flex-col justify-between hover:border-[var(--primary-accent)]/50 transition-all">
          <div>
            <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal mb-1.5 block">
              13. ОРИЕНТИРОВОЧНЫЙ БЮДЖЕТ
            </label>
            <input
              type="text"
              value={formData["ОРИЕНТИРОВОЧНЫЙ БЮДЖЕТ"] || ''}
              onChange={(e) => handleFieldChange("ОРИЕНТИРОВОЧНЫЙ БЮДЖЕТ", e.target.value)}
              placeholder="350 000 ₽"
              className="w-full bg-white/90 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[var(--primary-accent)] transition-all placeholder:text-zinc-400"
            />
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {['До 150 000 ₽', '150 – 300 тыс. ₽', '300 – 500 тыс. ₽'].map(item => (
              <button
                key={item}
                type="button"
                onClick={() => handleFieldChange("ОРИЕНТИРОВОЧНЫЙ БЮДЖЕТ", item)}
                className="text-[9px] px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-[var(--lavenderSoft)] text-zinc-600 dark:text-zinc-400 hover:text-[var(--primary-accent)] transition-colors cursor-pointer"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* 14. ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ (FULL WIDTH) */}
        <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4 p-3.5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 border-l-[3px] border-l-[var(--primary-accent)] bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md shadow-2xs flex flex-col justify-between hover:border-[var(--primary-accent)]/50 transition-all">
          <div>
            <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal mb-1.5 block">
              14. ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ
            </label>
            <textarea
              rows={3}
              value={formData["ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ"] || ''}
              onChange={(e) => handleFieldChange("ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ", e.target.value)}
              placeholder="Особые пожелания, стоп-лист цветов, ссылка на Pinterest или облачный диск с референсами..."
              className="w-full bg-white/90 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[var(--primary-accent)] transition-all placeholder:text-zinc-400 resize-none leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* REFERENCES & PHOTO ATTACHMENTS */}
      <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[24px] sm:rounded-[28px] border border-zinc-200/50 dark:border-zinc-800/40 p-4 sm:p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[var(--primary-accent)]" />
            <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Фотографии и референсы оформления
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Загружено: {referenceImages.length}
          </span>
        </div>

        <label className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-[var(--primary-accent)] rounded-2xl p-4 text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-white/30 dark:bg-zinc-800/30 hover:bg-white/60 transition-all">
          <div className="w-8 h-8 rounded-full bg-[var(--lavenderSoft)] text-[var(--primary-accent)] dark:text-[var(--lavenderAccent)] flex items-center justify-center shadow-2xs">
            <Upload className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
            Загрузить фотографии или эскизы
          </span>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
            Перетащите файлы сюда или нажмите для выбора
          </span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="sr-only"
          />
        </label>

        {referenceImages.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
            {referenceImages.map((img, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 group shadow-2xs"
              >
                <img
                  src={img}
                  alt={`Референс ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <button
                  type="button"
                  onClick={() => setReferenceImages(prev => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600 cursor-pointer"
                  title="Удалить фото"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
