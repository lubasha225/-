import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Trash2,
  RotateCw,
  Grid,
  Circle,
  Square,
  Zap,
  LogIn,
  Type,
  Users,
  Check,
  RefreshCw,
  Compass,
  FileText,
  DollarSign,
  Copy,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  ShoppingBag,
  Layers,
  ChevronRight,
  Maximize
} from 'lucide-react';

export interface PlanElement {
  id: string;
  type: 'presidium' | 'roundTable' | 'rectTable' | 'buffetTable' | 'chair' | 'photozone' | 'lounge' | 'stage' | 'socket' | 'door' | 'text';
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  label: string;
  capacity?: number; // Seats per table
  clothColor?: string;
  chairType?: string;
}

interface FloorPlanSchemaProps {
  initialElements?: PlanElement[];
  onSave: (elements: PlanElement[]) => void;
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warn') => void;
}

const PALETTE_TEMPLATES = [
  { type: 'roundTable', name: 'Круглый Стол', w: 100, h: 100, icon: Circle, color: 'border-indigo-400 bg-indigo-500/10 text-indigo-600', capacity: 8 },
  { type: 'rectTable', name: 'Прямоугольный Стол', w: 130, h: 65, icon: Square, color: 'border-blue-400 bg-blue-500/10 text-blue-600', capacity: 8 },
  { type: 'presidium', name: 'Стол Президиума', w: 150, h: 65, icon: Square, color: 'border-purple-400 bg-purple-500/10 text-purple-600', capacity: 2 },
  { type: 'buffetTable', name: 'Фуршет / Коктейль', w: 110, h: 50, icon: Square, color: 'border-emerald-400 bg-emerald-500/10 text-emerald-600', capacity: 0 },
  { type: 'lounge', name: 'Диван / Лаунж', w: 120, h: 60, icon: Layers, color: 'border-amber-400 bg-amber-500/10 text-amber-600', capacity: 4 },
  { type: 'stage', name: 'Сцена / DJ Подиум', w: 160, h: 80, icon: Square, color: 'border-zinc-400 bg-zinc-500/10 text-zinc-600', capacity: 0 },
  { type: 'photozone', name: 'Зона Декора / Арка', w: 140, h: 45, icon: Compass, color: 'border-rose-400 bg-rose-500/10 text-rose-600', capacity: 0 },
  { type: 'chair', name: 'Отдельный Стул', w: 32, h: 32, icon: Circle, color: 'border-slate-400 bg-slate-500/10 text-slate-600', capacity: 1 },
  { type: 'socket', name: 'Розетка 220V', w: 30, h: 30, icon: Zap, color: 'border-amber-400 bg-amber-500/20 text-amber-600', capacity: 0 },
  { type: 'door', name: 'Вход / Двери', w: 60, h: 22, icon: LogIn, color: 'border-sky-400 bg-sky-500/10 text-sky-600', capacity: 0 },
  { type: 'text', name: 'Текстовая Метка', w: 110, h: 40, icon: Type, color: 'border-teal-400 bg-teal-500/10 text-teal-600', capacity: 0 }
];

// Price configuration per item for automatic estimate calculation
const RENTAL_PRICES = {
  roundTable: 1500,     // ₽/шт
  rectTable: 1400,      // ₽/шт
  presidium: 3500,      // ₽/шт
  chair: 350,           // ₽/шт (Кьявари)
  tablecloth: 1200,     // ₽/скатерть
  napkin: 120,          // ₽/салфетка на гостя
  centerpiece: 4500,    // ₽/ваза с цветами на стол
  presidiumDecor: 18000 // ₽/декор президиума
};

export default function FloorPlanSchema({ initialElements = [], onSave, showToast }: FloorPlanSchemaProps) {
  const [elements, setElements] = useState<PlanElement[]>(initialElements);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [gridVisible, setGridVisible] = useState<boolean>(true);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'palette' | 'estimate'>('palette');
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setElements(initialElements);
  }, [initialElements]);

  const updateElements = (nextElements: PlanElement[]) => {
    setElements(nextElements);
    onSave(nextElements);
  };

  const handleAddTemplate = (template: typeof PALETTE_TEMPLATES[0]) => {
    const sameTypeCount = elements.filter(el => el.type === template.type).length + 1;
    let label = '';
    
    if (template.type === 'roundTable' || template.type === 'rectTable') {
      label = `Стол №${sameTypeCount}`;
    } else if (template.type === 'presidium') {
      label = 'Президиум';
    } else if (template.type === 'socket') {
      label = '220V';
    } else if (template.type === 'door') {
      label = 'Вход';
    } else if (template.type === 'text') {
      label = 'Метка';
    } else {
      label = template.name;
    }

    const newElem: PlanElement = {
      id: `${template.type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: template.type as any,
      name: template.name,
      x: 100 + (sameTypeCount * 25) % 250,
      y: 100 + (sameTypeCount * 25) % 250,
      w: template.w,
      h: template.h,
      rotation: 0,
      label,
      capacity: template.capacity,
      clothColor: '#FFFFFF',
      chairType: 'Кьявари'
    };

    const nextElements = [...elements, newElem];
    updateElements(nextElements);
    setSelectedId(newElem.id);
    showToast('Добавлено на схему', `"${newElem.name}" успешно добавлен на план.`, 'success');
  };

  // Dragging mechanics
  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    setSelectedId(id);
    setDraggedId(id);

    const elem = elements.find(el => el.id === id);
    if (elem) {
      dragOffset.current = {
        x: e.clientX - elem.x * zoomScale,
        y: e.clientY - elem.y * zoomScale
      };
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggedId || !canvasRef.current) return;
    
    const elem = elements.find(el => el.id === draggedId);
    if (!elem) return;

    let nextX = (e.clientX - dragOffset.current.x) / zoomScale;
    let nextY = (e.clientY - dragOffset.current.y) / zoomScale;

    if (gridVisible) {
      nextX = Math.round(nextX / 10) * 10;
      nextY = Math.round(nextY / 10) * 10;
    }

    const canvasBounds = canvasRef.current.getBoundingClientRect();
    const maxX = (canvasBounds.width / zoomScale) - elem.w;
    const maxY = (canvasBounds.height / zoomScale) - elem.h;

    nextX = Math.max(0, Math.min(nextX, maxX));
    nextY = Math.max(0, Math.min(nextY, maxY));

    updateElements(elements.map(el => el.id === draggedId ? { ...el, x: nextX, y: nextY } : el));
  };

  const handlePointerUp = () => {
    setDraggedId(null);
  };

  const handleDeleteSelected = () => {
    if (!selectedId) return;
    const nextElements = elements.filter(el => el.id !== selectedId);
    updateElements(nextElements);
    setSelectedId(null);
    showToast('Удалено со схемы', 'Выбранный объект убран с плана расстановки.', 'info');
  };

  const handleRotateSelected = (angle = 45) => {
    if (!selectedId) return;
    updateElements(elements.map(el => {
      if (el.id === selectedId) {
        return { ...el, rotation: (el.rotation + angle) % 360 };
      }
      return el;
    }));
  };

  const handleDuplicateSelected = () => {
    if (!selectedId) return;
    const elem = elements.find(el => el.id === selectedId);
    if (!elem) return;

    const dup: PlanElement = {
      ...elem,
      id: `${elem.type}-${Date.now()}`,
      x: elem.x + 20,
      y: elem.y + 20,
      label: `${elem.label} (копия)`
    };

    updateElements([...elements, dup]);
    setSelectedId(dup.id);
    showToast('Скопировано', 'Создан дубликат объекта.', 'info');
  };

  const handleLabelChange = (val: string) => {
    if (!selectedId) return;
    updateElements(elements.map(el => el.id === selectedId ? { ...el, label: val } : el));
  };

  const handleCapacityChange = (val: number) => {
    if (!selectedId) return;
    updateElements(elements.map(el => el.id === selectedId ? { ...el, capacity: val } : el));
  };

  const handleClearAll = () => {
    if (window.confirm('Вы действительно хотите очистить всю схему расстановки?')) {
      updateElements([]);
      setSelectedId(null);
      showToast('Схема очищена', 'Все объекты удалены.', 'info');
    }
  };

  const selectedElem = elements.find(el => el.id === selectedId);

  // Statistics computations
  const roundTablesCount = elements.filter(el => el.type === 'roundTable').length;
  const rectTablesCount = elements.filter(el => el.type === 'rectTable').length;
  const presidiumsCount = elements.filter(el => el.type === 'presidium').length;
  const standaloneChairsCount = elements.filter(el => el.type === 'chair').length;

  const totalGuestsCapacity = elements.reduce((sum, el) => {
    if (el.type === 'roundTable' || el.type === 'rectTable') {
      return sum + (el.capacity || 8);
    }
    if (el.type === 'presidium') {
      return sum + (el.capacity || 2);
    }
    if (el.type === 'chair') {
      return sum + 1;
    }
    if (el.type === 'lounge') {
      return sum + (el.capacity || 4);
    }
    return sum;
  }, 0);

  const totalTableChairsCount = elements.reduce((sum, el) => {
    if (el.type === 'roundTable' || el.type === 'rectTable') {
      return sum + (el.capacity || 8);
    }
    if (el.type === 'presidium') {
      return sum + (el.capacity || 2);
    }
    return sum;
  }, 0) + standaloneChairsCount;

  // Auto Estimate Costs Calculation
  const tablesCost = (roundTablesCount * RENTAL_PRICES.roundTable) + (rectTablesCount * RENTAL_PRICES.rectTable) + (presidiumsCount * RENTAL_PRICES.presidium);
  const chairsCost = totalTableChairsCount * RENTAL_PRICES.chair;
  const tableclothsCost = (roundTablesCount + rectTablesCount + presidiumsCount) * RENTAL_PRICES.tablecloth;
  const napkinsCost = totalGuestsCapacity * RENTAL_PRICES.napkin;
  const centerpiecesCost = (roundTablesCount + rectTablesCount) * RENTAL_PRICES.centerpiece;
  const presidiumDecorCost = presidiumsCount * RENTAL_PRICES.presidiumDecor;

  const grandTotalEstimate = tablesCost + chairsCost + tableclothsCost + napkinsCost + centerpiecesCost + presidiumDecorCost;

  // Render individual seat dots/icons around round table top-down
  const renderRoundSeats = (capacity: number, w: number, h: number) => {
    const seats = [];
    const radius = (w / 2) + 12; // Radius outside table edge
    const centerX = w / 2;
    const centerY = h / 2;

    for (let i = 0; i < capacity; i++) {
      const angle = (i * 360 / capacity) * (Math.PI / 180);
      const sx = centerX + radius * Math.cos(angle);
      const sy = centerY + radius * Math.sin(angle);

      seats.push(
        <div
          key={i}
          className="absolute w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-400/80 text-[8px] font-extrabold text-indigo-700 dark:text-indigo-300 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 shadow-xs"
          style={{ left: `${sx}px`, top: `${sy}px` }}
          title={`Место ${i + 1}`}
        >
          {i + 1}
        </div>
      );
    }
    return seats;
  };

  // Render rectangular seats around rectangular table
  const renderRectSeats = (capacity: number, w: number, h: number) => {
    const seats = [];
    const sideCount = Math.max(1, Math.floor(capacity / 2));
    
    // Top side seats
    for (let i = 0; i < sideCount; i++) {
      const step = w / (sideCount + 1);
      const sx = step * (i + 1);
      seats.push(
        <div
          key={`top-${i}`}
          className="absolute w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-950/80 border border-blue-400/80 text-[8px] font-extrabold text-blue-700 dark:text-blue-300 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 shadow-xs"
          style={{ left: `${sx}px`, top: `-10px` }}
        >
          {i + 1}
        </div>
      );
    }

    // Bottom side seats
    for (let i = 0; i < sideCount; i++) {
      const step = w / (sideCount + 1);
      const sx = step * (i + 1);
      seats.push(
        <div
          key={`bottom-${i}`}
          className="absolute w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-950/80 border border-blue-400/80 text-[8px] font-extrabold text-blue-700 dark:text-blue-300 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 shadow-xs"
          style={{ left: `${sx}px`, top: `${h + 10}px` }}
        >
          {sideCount + i + 1}
        </div>
      );
    }

    return seats;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-full min-h-0 min-w-0 w-full overflow-hidden">
      
      {/* 1. LEFT TOOLBOX & PALETTE / ESTIMATE SWITCHER PANEL */}
      <div className="lg:col-span-3 flex flex-col bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 p-3 rounded-3xl shadow-xs backdrop-blur-md h-full min-h-0 overflow-y-auto">
        
        {/* TAB HEADERS */}
        <div className="p-1 bg-zinc-100/90 dark:bg-zinc-800/90 rounded-2xl mb-3 grid grid-cols-2 gap-1 border border-zinc-200/60 dark:border-zinc-700/60 shrink-0">
          <button
            onClick={() => setActiveTab('palette')}
            className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'palette'
                ? 'bg-[#EAE4F8] text-[#5B3E88] dark:bg-purple-950 dark:text-purple-200 shadow-xs border border-[#D4C5ED]/50'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <Circle className="w-3.5 h-3.5 shrink-0" />
            <span>Палитра</span>
          </button>
          <button
            onClick={() => setActiveTab('estimate')}
            className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'estimate'
                ? 'bg-[#EAE4F8] text-[#5B3E88] dark:bg-purple-950 dark:text-purple-200 shadow-xs border border-[#D4C5ED]/50'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 shrink-0" />
            <span>Смета</span>
          </button>
        </div>

        {activeTab === 'palette' ? (
          <div className="flex-1 flex flex-col min-h-0 space-y-3">
            <div className="pb-1 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 tracking-tight">Элементы зала</h3>
              <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400">Кликните для добавления на план расстановки</p>
            </div>

            <div className="grid grid-cols-1 gap-1.5 overflow-y-auto flex-1 pr-1 scrollbar-none">
              {PALETTE_TEMPLATES.map((tmpl) => {
                const Icon = tmpl.icon;
                return (
                  <button
                    key={tmpl.type}
                    onClick={() => handleAddTemplate(tmpl)}
                    className="flex items-center gap-2.5 p-2 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:border-[#5B3E88] hover:shadow-sm transition-all text-left cursor-pointer group"
                  >
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 shadow-xs ${tmpl.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-[#5B3E88] transition-colors">{tmpl.name}</p>
                      <p className="text-[9.5px] text-zinc-500 font-semibold leading-none mt-0.5">
                        {tmpl.w / 10}м × {tmpl.h / 10}м {tmpl.capacity > 0 ? `· ${tmpl.capacity} мест` : ''}
                      </p>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 group-hover:bg-[#EAE4F8] group-hover:text-[#5B3E88] flex items-center justify-center transition-all shrink-0">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Guest Capacity Indicator */}
            <div className="pt-3 border-t border-zinc-200/80 dark:border-zinc-800 space-y-2 bg-[#EAE4F8]/40 dark:bg-purple-950/20 p-3 rounded-2xl border border-[#D4C5ED]/40 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-extrabold text-[#5B3E88] dark:text-purple-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Вместимость зала
                </span>
                <span className="text-xs font-black font-mono text-[#5B3E88] bg-white dark:bg-zinc-900 px-2 py-0.5 rounded-full shadow-2xs">
                  {totalGuestsCapacity} гостей
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <div className="bg-white/80 dark:bg-zinc-900/80 p-1.5 px-2 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
                  <span className="text-zinc-500 block text-[9px]">Гостевые столы</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">{roundTablesCount + rectTablesCount} шт.</span>
                </div>
                <div className="bg-white/80 dark:bg-zinc-900/80 p-1.5 px-2 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
                  <span className="text-zinc-500 block text-[9px]">Всего стульев</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">{totalTableChairsCount} шт.</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* TAB 2: AUTO ESTIMATE BREAKDOWN */
          <div className="flex-1 flex flex-col min-h-0 space-y-3">
            <div className="pb-1 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 tracking-tight flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Авторасчет сметы
              </h3>
              <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400">Аренда мебели, текстиль и сервировка на план</p>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto pr-1 text-xs">
              
              <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-1">
                <div className="flex justify-between items-center font-bold text-zinc-800 dark:text-zinc-200">
                  <span>Аренда столов</span>
                  <span className="font-mono text-[#5B3E88] font-black">{tablesCost.toLocaleString('ru')} ₽</span>
                </div>
                <p className="text-[10px] text-zinc-500">
                  Круглые: {roundTablesCount} шт, Прямоугольные: {rectTablesCount} шт, Президиум: {presidiumsCount} шт.
                </p>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-1">
                <div className="flex justify-between items-center font-bold text-zinc-800 dark:text-zinc-200">
                  <span>Стулья (Кьявари/Феникс)</span>
                  <span className="font-mono text-[#5B3E88] font-black">{chairsCost.toLocaleString('ru')} ₽</span>
                </div>
                <p className="text-[10px] text-zinc-500">
                  {totalTableChairsCount} шт × {RENTAL_PRICES.chair} ₽/шт
                </p>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-1">
                <div className="flex justify-between items-center font-bold text-zinc-800 dark:text-zinc-200">
                  <span>Скатерти в пол</span>
                  <span className="font-mono text-[#5B3E88] font-black">{tableclothsCost.toLocaleString('ru')} ₽</span>
                </div>
                <p className="text-[10px] text-zinc-500">
                  {roundTablesCount + rectTablesCount + presidiumsCount} шт × {RENTAL_PRICES.tablecloth} ₽/шт
                </p>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-1">
                <div className="flex justify-between items-center font-bold text-zinc-800 dark:text-zinc-200">
                  <span>Текстильные салфетки</span>
                  <span className="font-mono text-[#5B3E88] font-black">{napkinsCost.toLocaleString('ru')} ₽</span>
                </div>
                <p className="text-[10px] text-zinc-500">
                  {totalGuestsCapacity} персон × {RENTAL_PRICES.napkin} ₽/шт
                </p>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-1">
                <div className="flex justify-between items-center font-bold text-zinc-800 dark:text-zinc-200">
                  <span>Композиции на столы</span>
                  <span className="font-mono text-[#5B3E88] font-black">{centerpiecesCost.toLocaleString('ru')} ₽</span>
                </div>
                <p className="text-[10px] text-zinc-500">
                  {roundTablesCount + rectTablesCount} столов × {RENTAL_PRICES.centerpiece.toLocaleString('ru')} ₽
                </p>
              </div>

              {presidiumsCount > 0 && (
                <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-1">
                  <div className="flex justify-between items-center font-bold text-zinc-800 dark:text-zinc-200">
                    <span>Декор президиума</span>
                    <span className="font-mono text-[#5B3E88] font-black">{presidiumDecorCost.toLocaleString('ru')} ₽</span>
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    Композиции & Вазы президиума
                  </p>
                </div>
              )}
            </div>

            {/* Total Footer Banner */}
            <div className="pt-3 border-t border-zinc-200/80 dark:border-zinc-800 space-y-2 bg-[#5B3E88] text-white p-3.5 rounded-2xl shadow-md shrink-0">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wide">Итого сметы схемы:</span>
                <span className="text-base font-black font-mono">{grandTotalEstimate.toLocaleString('ru')} ₽</span>
              </div>
              <button
                onClick={() => {
                  showToast('Смета обновлена', 'Расчет мебели и текстиля со схемы добавлен в общую смету проекта.', 'success');
                }}
                className="w-full py-2 bg-white text-[#5B3E88] hover:bg-zinc-100 rounded-xl text-xs font-black transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Добавить в смету проекта</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. CENTRAL INTERACTIVE 2D CANVAS */}
      <div className="lg:col-span-6 flex flex-col gap-2.5 relative h-full min-h-0 min-w-0">
        
        {/* Canvas Top Controls Toolbar */}
        <div className="flex items-center justify-between bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 p-2 px-3.5 rounded-full text-xs shrink-0 backdrop-blur-md shadow-2xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setGridVisible(!gridVisible)}
              className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase flex items-center gap-1.5 border transition-all cursor-pointer ${
                gridVisible
                  ? 'bg-[#5B3E88] text-white border-[#5B3E88] shadow-2xs'
                  : 'bg-white dark:bg-zinc-800 text-zinc-600 border-zinc-200 dark:border-zinc-700'
              }`}
            >
              <Grid className="w-3.5 h-3.5" /> Сетка {gridVisible ? 'ВКЛ' : 'ВЫКЛ'}
            </button>
            <span className="text-[10.5px] text-zinc-500 font-medium">Зал: 12.0 × 9.0 м</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoomScale(z => Math.max(0.6, z - 0.15))}
              className="w-7 h-7 rounded-full bg-white dark:bg-zinc-800 hover:bg-zinc-100 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-200 cursor-pointer shadow-2xs"
              title="Уменьшить"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono font-bold text-zinc-600 px-1">{Math.round(zoomScale * 100)}%</span>
            <button
              onClick={() => setZoomScale(z => Math.min(1.8, z + 0.15))}
              className="w-7 h-7 rounded-full bg-white dark:bg-zinc-800 hover:bg-zinc-100 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-200 cursor-pointer shadow-2xs"
              title="Увеличить"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomScale(1)}
              className="w-7 h-7 rounded-full bg-white dark:bg-zinc-800 hover:bg-zinc-100 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-200 cursor-pointer shadow-2xs ml-1"
              title="Сбросить масштаб"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />

            <button
              onClick={handleClearAll}
              disabled={elements.length === 0}
              className="px-3 py-1 rounded-full border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 text-[10px] font-bold uppercase transition-colors cursor-pointer disabled:opacity-30"
            >
              Очистить
            </button>
          </div>
        </div>

        {/* Viewport Box container */}
        <div
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onClick={() => setSelectedId(null)}
          className="flex-1 bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 relative overflow-hidden h-full shadow-inner select-none cursor-default"
          style={{
            backgroundImage: gridVisible
              ? 'radial-gradient(#A888DB 1px, transparent 1px), radial-gradient(#5B3E88 0.6px, transparent 0.6px)'
              : 'none',
            backgroundSize: `${20 * zoomScale}px ${20 * zoomScale}px, ${40 * zoomScale}px ${40 * zoomScale}px`,
            backgroundPosition: '0 0, 10px 10px'
          }}
        >
          {elements.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none text-zinc-400">
              <Compass className="w-12 h-12 text-zinc-300 dark:text-zinc-800 mb-2 animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">Схема расстановки пуста</p>
              <p className="text-[11px] text-zinc-400 max-w-[220px] mt-1">Добавьте столы, президиум или зоны из панели слева.</p>
            </div>
          )}

          {elements.map((el) => {
            const isSelected = selectedId === el.id;
            const borderStyle = isSelected
              ? 'ring-2 ring-[#5B3E88] ring-offset-2 dark:ring-offset-zinc-950 z-30 shadow-md'
              : 'hover:border-[#5B3E88]/80 z-20';

            return (
              <div
                key={el.id}
                onPointerDown={(e) => handlePointerDown(e, el.id)}
                className={`absolute p-1 bg-white/95 dark:bg-zinc-900/95 border border-zinc-300 dark:border-zinc-700 rounded-2xl flex flex-col items-center justify-center text-center select-none cursor-move transition-shadow ${borderStyle}`}
                style={{
                  left: `${el.x * zoomScale}px`,
                  top: `${el.y * zoomScale}px`,
                  width: `${el.w * zoomScale}px`,
                  height: `${el.h * zoomScale}px`,
                  transform: `rotate(${el.rotation}deg)`
                }}
              >
                {/* INNER GRAPHIC TOP-DOWN SHAPE */}
                <div className="absolute inset-1 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-center overflow-visible">
                  
                  {/* ROUND TABLE */}
                  {el.type === 'roundTable' && (
                    <div className="relative w-[82%] h-[82%] rounded-full border-2 border-indigo-500/80 bg-indigo-50 dark:bg-indigo-950/30 flex flex-col items-center justify-center shadow-xs">
                      <span className="text-[10px] font-black text-indigo-900 dark:text-indigo-200 leading-none">{el.label}</span>
                      <span className="text-[8px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">{el.capacity || 8} мест</span>
                      {renderRoundSeats(el.capacity || 8, el.w * zoomScale * 0.8, el.h * zoomScale * 0.8)}
                    </div>
                  )}

                  {/* RECTANGULAR TABLE */}
                  {el.type === 'rectTable' && (
                    <div className="relative w-[88%] h-[80%] rounded-lg border-2 border-blue-500/80 bg-blue-50 dark:bg-blue-950/30 flex flex-col items-center justify-center shadow-xs">
                      <span className="text-[9.5px] font-black text-blue-900 dark:text-blue-200 leading-none">{el.label}</span>
                      <span className="text-[8px] font-bold text-blue-600 dark:text-blue-400 mt-0.5">{el.capacity || 8} мест</span>
                      {renderRectSeats(el.capacity || 8, el.w * zoomScale * 0.88, el.h * zoomScale * 0.8)}
                    </div>
                  )}

                  {/* PRESIDIUM */}
                  {el.type === 'presidium' && (
                    <div className="w-[92%] h-[85%] rounded-lg border-2 border-purple-500 bg-purple-50 dark:bg-purple-950/40 flex flex-col items-center justify-center shadow-xs relative">
                      <span className="text-[10px] font-black text-purple-900 dark:text-purple-200 leading-none">{el.label}</span>
                      <span className="text-[8px] font-bold text-purple-600 dark:text-purple-300 mt-0.5">Президиум ({el.capacity || 2} VIP)</span>
                    </div>
                  )}

                  {/* BUFFET / COCKTAIL */}
                  {el.type === 'buffetTable' && (
                    <div className="w-[90%] h-[85%] rounded-lg border-2 border-emerald-500/80 bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                      <span className="text-[9.5px] font-black text-emerald-800 dark:text-emerald-300">{el.label}</span>
                    </div>
                  )}

                  {/* LOUNGE */}
                  {el.type === 'lounge' && (
                    <div className="w-[90%] h-[85%] rounded-xl border-2 border-amber-500/80 bg-amber-50 dark:bg-amber-950/30 flex flex-col items-center justify-center">
                      <span className="text-[9.5px] font-black text-amber-900 dark:text-amber-300">{el.label}</span>
                      <span className="text-[8px] text-amber-600 font-bold">Лаунж зона</span>
                    </div>
                  )}

                  {/* STAGE */}
                  {el.type === 'stage' && (
                    <div className="w-[92%] h-[88%] rounded-lg border-2 border-zinc-500 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                      <span className="text-[10px] font-black uppercase text-zinc-700 dark:text-zinc-200 tracking-wider">{el.label}</span>
                    </div>
                  )}

                  {/* PHOTOZONE / ARCH */}
                  {el.type === 'photozone' && (
                    <div className="w-[92%] h-[85%] border-2 border-rose-500/80 bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center rounded-lg">
                      <span className="text-[9px] font-black text-rose-800 dark:text-rose-300 uppercase tracking-wide">{el.label}</span>
                    </div>
                  )}

                  {/* STANDALONE CHAIR */}
                  {el.type === 'chair' && (
                    <div className="w-5 h-5 rounded-full border border-slate-400 bg-slate-200/50 flex items-center justify-center text-[8px] font-bold text-slate-600">
                      ст
                    </div>
                  )}

                  {/* SOCKET */}
                  {el.type === 'socket' && (
                    <div className="flex items-center gap-1 text-amber-500">
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span className="text-[8.5px] font-extrabold font-mono text-zinc-700 dark:text-zinc-300">{el.label}</span>
                    </div>
                  )}

                  {/* DOOR */}
                  {el.type === 'door' && (
                    <div className="w-full h-full bg-sky-100 dark:bg-sky-950/50 flex items-center justify-center border-b-2 border-sky-500">
                      <span className="text-[8px] uppercase tracking-wide font-black text-sky-700 dark:text-sky-300">{el.label}</span>
                    </div>
                  )}

                  {/* TEXT */}
                  {el.type === 'text' && (
                    <div className="w-full px-1 text-center truncate">
                      <span className="text-[10.5px] font-extrabold text-zinc-800 dark:text-zinc-200">{el.label}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. RIGHT SIDEBAR: OBJECT PROPERTIES & SEATING TWEAKS */}
      <div className="lg:col-span-3 flex flex-col bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 p-3 rounded-3xl shadow-xs backdrop-blur-md h-full min-h-0 overflow-y-auto">
        <div className="pb-2 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <h3 className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 tracking-tight flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#5B3E88]" /> Свойства объекта
          </h3>
        </div>

        {selectedElem ? (
          <div className="flex-1 flex flex-col justify-between py-2 space-y-3">
            <div className="space-y-3">
              
              {/* Type and Name badge */}
              <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-2.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{selectedElem.name}</span>
                <span className="text-[9px] font-mono font-extrabold bg-[#EAE4F8] text-[#5B3E88] px-2 py-0.5 rounded-full">
                  {selectedElem.type}
                </span>
              </div>

              {/* Editable Label */}
              <div>
                <label className="block text-[9.5px] font-bold text-zinc-500 uppercase tracking-wide mb-1">Метка на схеме</label>
                <input
                  type="text"
                  value={selectedElem.label}
                  onChange={(e) => handleLabelChange(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-3.5 py-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#5B3E88] transition-all shadow-2xs"
                />
              </div>

              {/* Capacity Selector */}
              {(selectedElem.type === 'roundTable' || selectedElem.type === 'rectTable' || selectedElem.type === 'presidium' || selectedElem.type === 'lounge') && (
                <div>
                  <label className="block text-[9.5px] font-bold text-zinc-500 uppercase tracking-wide mb-1">Количество мест (стульев)</label>
                  <select
                    value={selectedElem.capacity || 8}
                    onChange={(e) => handleCapacityChange(parseInt(e.target.value))}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-3.5 py-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#5B3E88] transition-all cursor-pointer shadow-2xs"
                  >
                    {[2, 4, 6, 8, 10, 12, 14, 16].map(n => (
                      <option key={n} value={n}>{n} мест</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Rotation & Geometry */}
              <div className="space-y-1">
                <span className="block text-[9.5px] font-bold text-zinc-500 uppercase tracking-wide">Угол поворота</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleRotateSelected(45)}
                    className="flex items-center justify-center gap-1 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:border-[#5B3E88] hover:text-[#5B3E88] transition-all cursor-pointer bg-white dark:bg-zinc-900 shadow-2xs"
                  >
                    <RotateCw className="w-3.5 h-3.5" /> +45°
                  </button>
                  <button
                    onClick={handleDuplicateSelected}
                    className="flex items-center justify-center gap-1 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:border-[#5B3E88] hover:text-[#5B3E88] transition-all cursor-pointer bg-white dark:bg-zinc-900 shadow-2xs"
                  >
                    <Copy className="w-3.5 h-3.5" /> Копия
                  </button>
                </div>
              </div>

            </div>

            <button
              onClick={handleDeleteSelected}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-500 hover:text-white border border-rose-200 dark:border-rose-900 text-rose-600 text-xs font-bold transition-all cursor-pointer mt-auto shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" /> Удалить со схемы
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-zinc-400 h-full">
            <Compass className="w-8 h-8 text-zinc-300 dark:text-zinc-800 mb-2" />
            <p className="text-[10px] uppercase font-bold tracking-wide">Ничего не выбрано</p>
            <p className="text-[10px] text-zinc-400 mt-1">Кликните на любой стол или объект в зале для настройки его свойств.</p>
          </div>
        )}
      </div>

    </div>
  );
}
