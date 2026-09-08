import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Palette, Check, Pipette, Trash2 } from 'lucide-react';

interface PaletteColorPickerProps {
  value: string;
  onChange: (newValue: string) => void;
}

// Popular event and wedding decor colors
const PRESET_EVENT_COLORS = [
  { name: 'Белый', hex: '#FFFFFF' },
  { name: 'Айвори', hex: '#FAF0E6' },
  { name: 'Шампань', hex: '#F7E7CE' },
  { name: 'Пудровый', hex: '#FAD2E1' },
  { name: 'Нежная роза', hex: '#F4ACB7' },
  { name: 'Персик', hex: '#FFD1BA' },
  { name: 'Золото', hex: '#D4AF37' },
  { name: 'Шалфей', hex: '#9CAF88' },
  { name: 'Эвкалипт', hex: '#5F8575' },
  { name: 'Изумруд', hex: '#1B4D3E' },
  { name: 'Небесный', hex: '#B0E0E6' },
  { name: 'Пыльно-синий', hex: '#4A6B82' },
  { name: 'Лаванда', hex: '#E2D4F0' },
  { name: 'Сиреневый', hex: '#C08EF4' },
  { name: 'Пурпур', hex: '#8C52D0' },
  { name: 'Марсала', hex: '#722F37' },
  { name: 'Терракота', hex: '#E07A5F' },
  { name: 'Бордо', hex: '#800020' },
  { name: 'Серебро', hex: '#D1D5DB' },
  { name: 'Графит', hex: '#374151' },
];

// Helper to extract clean hex colors from string
export function parsePaletteColors(value: string): string[] {
  if (!value || value === "(требует заполнения)" || value === "null" || value === "undefined") {
    return [];
  }
  
  if (value.startsWith('[') && value.endsWith(']')) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(c => String(c).trim()).filter(Boolean);
    } catch {
      // fallback
    }
  }

  const tokens = value.split(/[,;\s]+/).map(t => t.trim()).filter(Boolean);
  return tokens
    .map(t => (t.startsWith('#') ? t : `#${t}`))
    .filter(t => /^#[0-9A-Fa-f]{3,8}$/.test(t));
}

export default function PaletteColorPicker({ value, onChange }: PaletteColorPickerProps) {
  const colors = parsePaletteColors(value);
  
  // State for popover
  const [isOpen, setIsOpen] = useState(false);
  // Mode: null (closed), 'add' (adding new color), or number (editing color at index)
  const [activeMode, setActiveMode] = useState<'add' | number | null>(null);
  const [tempColor, setTempColor] = useState('#8C52D0');
  
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setActiveMode(null);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const updateColors = (nextColors: string[]) => {
    onChange(nextColors.join(', '));
  };

  const handleOpenAdd = () => {
    setTempColor('#8C52D0');
    setActiveMode('add');
    setIsOpen(true);
  };

  const handleOpenEdit = (index: number) => {
    setTempColor(colors[index] || '#8C52D0');
    setActiveMode(index);
    setIsOpen(true);
  };

  // Commit color choice ONLY on explicit action (click on preset or click "Добавить")
  const handleSelectColor = (hex: string) => {
    if (activeMode === 'add') {
      updateColors([...colors, hex]);
    } else if (typeof activeMode === 'number') {
      const next = [...colors];
      next[activeMode] = hex;
      updateColors(next);
    }
    setIsOpen(false);
    setActiveMode(null);
  };

  const handleRemoveColor = (index: number) => {
    const next = colors.filter((_, i) => i !== index);
    updateColors(next);
    if (activeMode === index) {
      setIsOpen(false);
      setActiveMode(null);
    }
  };

  const handleClearAll = () => {
    updateColors([]);
    setIsOpen(false);
    setActiveMode(null);
  };

  return (
    <div className="relative w-full py-1">
      <div className="flex flex-wrap items-center gap-2 min-h-[32px]">
        {colors.map((color, idx) => (
          <div
            key={`${color}-${idx}`}
            className="relative group w-7 h-7 rounded-full shrink-0 shadow-xs border border-black/15 dark:border-white/20 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
            style={{ backgroundColor: color }}
            title={`Цвет ${idx + 1}: ${color} (нажмите для смены)`}
            onClick={() => handleOpenEdit(idx)}
          >
            {/* Delete icon button visible on hover */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRemoveColor(idx);
              }}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-zinc-800 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow hover:bg-rose-500 z-10"
              title="Удалить этот цвет"
            >
              <X className="w-2.5 h-2.5 pointer-events-none" />
            </button>
          </div>
        ))}

        {/* Plus Button - opens popover */}
        <button
          ref={triggerRef}
          type="button"
          onClick={handleOpenAdd}
          className="w-7 h-7 rounded-full border-2 border-dashed border-purple-300 dark:border-purple-700/80 hover:border-[var(--primary-accent)] dark:hover:border-purple-400 bg-purple-50/50 dark:bg-purple-950/30 flex items-center justify-center text-purple-600 dark:text-purple-300 cursor-pointer hover:scale-105 transition-all shrink-0 shadow-2xs"
          title="Добавить цвет в палитру"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        {colors.length === 0 && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="text-[11px] text-zinc-600 dark:text-zinc-400 font-normal hover:text-[var(--primary-accent)] transition-colors text-left"
          >
            Нажмите +, чтобы выбрать цвет
          </button>
        )}

        {colors.length > 5 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-[10px] text-zinc-600 hover:text-rose-500 dark:text-zinc-400 ml-auto transition-colors"
            title="Очистить все цвета"
          >
            Очистить
          </button>
        )}
      </div>

      {/* Floating Color Picker Popover */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute z-50 left-0 top-full mt-2 w-72 sm:w-80 p-4 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xl space-y-3.5 text-left animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
            <div className="flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-[var(--primary-accent)]" />
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                {activeMode === 'add' ? 'Добавить цвет в палитру' : 'Изменить цвет'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setActiveMode(null);
              }}
              className="p-1 text-zinc-600 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Preset Colors (Single Click to add!) */}
          <div>
            <div className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
              Популярные оттенки декора
            </div>
            <div className="grid grid-cols-10 gap-1.5">
              {PRESET_EVENT_COLORS.map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => handleSelectColor(preset.hex)}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-black/15 dark:border-white/20 hover:scale-125 transition-transform shrink-0 shadow-2xs relative group focus:outline-none focus:ring-1 focus:ring-[var(--primary-accent)]"
                  style={{ backgroundColor: preset.hex }}
                  title={`${preset.name} (${preset.hex})`}
                />
              ))}
            </div>
          </div>

          {/* Custom Color Selector (Native spectrum / pipette, but commits ONLY on button click) */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
            <div className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
              Выбрать произвольный цвет
            </div>

            <div className="flex items-center gap-3">
              {/* Live Preview Circle with hidden native color input */}
              <label
                className="relative w-9 h-9 rounded-full shrink-0 border-2 border-zinc-200 dark:border-zinc-700 shadow-sm cursor-pointer flex items-center justify-center group overflow-hidden transition-transform hover:scale-105"
                style={{ backgroundColor: tempColor }}
                title="Нажмите, чтобы открыть палитру или пипетку"
              >
                {/* Visual pipette icon on hover */}
                <Pipette className="w-3.5 h-3.5 text-white drop-shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                
                {/* Native color input: changing updates ONLY local preview state, NEVER adds! */}
                <input
                  type="color"
                  value={tempColor.length === 7 ? tempColor : '#8C52D0'}
                  onInput={(e) => setTempColor((e.target as HTMLInputElement).value)}
                  onChange={(e) => setTempColor(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </label>

              {/* Hex Code Display */}
              <div className="flex-1">
                <input
                  type="text"
                  value={tempColor}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTempColor(val);
                  }}
                  placeholder="#FFFFFF"
                  className="w-full text-xs font-mono px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[var(--primary-accent)] uppercase"
                />
              </div>

              {/* Commit Button */}
              <button
                type="button"
                onClick={() => handleSelectColor(tempColor)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[var(--primary-grad-from,#8C52D0)] to-[var(--primary-grad-to,#582F89)] hover:opacity-90 active:scale-95 transition-all shadow-xs shrink-0 flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{activeMode === 'add' ? 'Добавить' : 'Сохранить'}</span>
              </button>
            </div>
          </div>

          {/* Delete Action if in edit mode */}
          {typeof activeMode === 'number' && (
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => handleRemoveColor(activeMode)}
                className="text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Удалить этот цвет</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
