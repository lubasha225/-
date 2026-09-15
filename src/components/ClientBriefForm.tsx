import React, { useState } from 'react';
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
  Check
} from 'lucide-react';

interface ClientBriefFormProps {
  formData: Record<string, string>;
  handleFieldChange: (field: string, value: string) => void;
  customColors: string[];
  handleAddCustomColor: (color: string) => void;
  handleRemoveCustomColor: (index: number) => void;
  handleSelectPresetPalette: (colors: string[], name: string) => void;
  referenceImages: string[];
  setReferenceImages: React.Dispatch<React.SetStateAction<string[]>>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filledCount: number;
}

const PRESET_PALETTES = [
  { name: 'Лавандовый закат', colors: ['#8C52D0', '#D8B4F8', '#F5E8C7', '#4A154B'] },
  { name: 'Эвкалипт и золото', colors: ['#5F7161', '#D4AF37', '#EFEAD8', '#6D8B74'] },
  { name: 'Пыльная роза', colors: ['#DDA7A5', '#F7ECE1', '#8C52D0', '#B5838D'] },
  { name: 'Терракота и песок', colors: ['#C86D51', '#E0A96D', '#F4E0C8', '#4A2810'] },
  { name: 'Изумруд и крем', colors: ['#1B4332', '#2D6A4F', '#D8F3DC', '#F8F9FA'] },
  { name: 'Монохром и шампань', colors: ['#1E1E24', '#F4F1DE', '#E07A5F', '#81B29A'] },
];

export const ClientBriefForm: React.FC<ClientBriefFormProps> = ({
  formData,
  handleFieldChange,
  customColors,
  handleAddCustomColor,
  handleRemoveCustomColor,
  handleSelectPresetPalette,
  referenceImages,
  setReferenceImages,
  handleImageUpload,
  filledCount,
}) => {
  const [showPalettePresets, setShowPalettePresets] = useState(false);

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
        <div className="p-3.5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 border-l-[3px] border-l-[var(--primary-accent)] bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md shadow-2xs flex flex-col justify-between hover:border-[var(--primary-accent)]/50 transition-all">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal block">
                11. ПАЛИТРА ОФОРМЛЕНИЯ
              </label>
              <button
                type="button"
                onClick={() => setShowPalettePresets(prev => !prev)}
                className="text-[9px] font-medium text-[var(--primary-accent)] hover:underline cursor-pointer"
              >
                {showPalettePresets ? 'Скрыть гаммы' : 'Готовые гаммы'}
              </button>
            </div>

            {/* Color swatches with add button */}
            <div className="flex items-center gap-1.5 flex-wrap min-h-[32px] p-1 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
              {customColors.map((hex, idx) => (
                <div
                  key={idx}
                  className="group relative w-6 h-6 rounded-full border border-black/10 dark:border-white/20 shadow-2xs flex items-center justify-center shrink-0 cursor-pointer"
                  style={{ backgroundColor: hex }}
                  title={`Цвет: ${hex}. Нажмите, чтобы удалить`}
                  onClick={() => handleRemoveCustomColor(idx)}
                >
                  <Trash2 className="w-2.5 h-2.5 text-white drop-shadow opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}

              {/* Add color button */}
              <label className="w-6 h-6 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-600 hover:border-[var(--primary-accent)] flex items-center justify-center text-zinc-500 hover:text-[var(--primary-accent)] transition-all cursor-pointer shrink-0">
                <Plus className="w-3 h-3" />
                <input
                  type="color"
                  className="sr-only"
                  onChange={(e) => handleAddCustomColor(e.target.value)}
                />
              </label>
            </div>

            {/* Presets dropdown */}
            {showPalettePresets && (
              <div className="mt-2 space-y-1 pt-1.5 border-t border-zinc-200/60 dark:border-zinc-700/60 max-h-36 overflow-y-auto">
                {PRESET_PALETTES.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      handleSelectPresetPalette(preset.colors, preset.name);
                      setShowPalettePresets(false);
                    }}
                    className="w-full flex items-center justify-between p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[10px] text-zinc-700 dark:text-zinc-300 cursor-pointer transition-colors"
                  >
                    <span className="truncate pr-1">{preset.name}</span>
                    <div className="flex -space-x-1 shrink-0">
                      {preset.colors.map((c, ci) => (
                        <span
                          key={ci}
                          className="w-3.5 h-3.5 rounded-full border border-white dark:border-zinc-900 shadow-2xs"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}
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
