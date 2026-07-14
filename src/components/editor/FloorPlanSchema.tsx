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
  FileText
} from 'lucide-react';

export interface PlanElement {
  id: string;
  type: 'presidium' | 'roundTable' | 'buffetTable' | 'chair' | 'photozone' | 'socket' | 'door' | 'text';
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  label: string;
  capacity?: number; // For tables
}

interface FloorPlanSchemaProps {
  initialElements?: PlanElement[];
  onSave: (elements: PlanElement[]) => void;
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warn') => void;
}

const PALETTE_TEMPLATES = [
  { type: 'presidium', name: 'Стол Президиума', w: 140, h: 60, icon: Square, color: 'border-violet-400 bg-violet-500/10' },
  { type: 'roundTable', name: 'Круглый Стол (Гости)', w: 90, h: 90, icon: Circle, color: 'border-indigo-400 bg-indigo-500/10', capacity: 8 },
  { type: 'buffetTable', name: 'Фуршетный Стол', w: 120, h: 50, icon: Square, color: 'border-emerald-400 bg-emerald-500/10' },
  { type: 'chair', name: 'Стул', w: 32, h: 32, icon: Circle, color: 'border-zinc-400 bg-zinc-400/10' },
  { type: 'photozone', name: 'Зона Арки/Фотозоны', w: 150, h: 45, icon: Compass, color: 'border-rose-400 bg-rose-500/10' },
  { type: 'socket', name: 'Розетка 220V', w: 30, h: 30, icon: Zap, color: 'border-amber-400 bg-amber-500/20' },
  { type: 'door', name: 'Вход / Двери', w: 60, h: 20, icon: LogIn, color: 'border-sky-400 bg-sky-500/10' },
  { type: 'text', name: 'Текстовая Метка', w: 110, h: 40, icon: Type, color: 'border-teal-400 bg-teal-500/10' }
];

export default function FloorPlanSchema({ initialElements = [], onSave, showToast }: FloorPlanSchemaProps) {
  const [elements, setElements] = useState<PlanElement[]>(initialElements);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [gridVisible, setGridVisible] = useState<boolean>(true);
  const [canvasScale, setCanvasScale] = useState<number>(1); // Zoom
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Update elements when parent changes (e.g. project switch)
  useEffect(() => {
    setElements(initialElements);
  }, [initialElements]);

  // Handle saving whenever elements change
  const updateElements = (nextElements: PlanElement[]) => {
    setElements(nextElements);
    onSave(nextElements);
  };

  const handleAddTemplate = (template: typeof PALETTE_TEMPLATES[0]) => {
    const nextNum = elements.filter(el => el.type === template.type).length + 1;
    let label = '';
    
    if (template.type === 'roundTable') {
      label = `Стол №${nextNum}`;
    } else if (template.type === 'socket') {
      label = '220V';
    } else if (template.type === 'door') {
      label = 'Вход';
    } else if (template.type === 'text') {
      label = 'Подпись';
    } else {
      label = template.name;
    }

    const newElem: PlanElement = {
      id: `${template.type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: template.type as any,
      name: template.name,
      x: 100 + Math.random() * 80,
      y: 100 + Math.random() * 80,
      w: template.w,
      h: template.h,
      rotation: 0,
      label,
      capacity: template.capacity
    };

    const nextElements = [...elements, newElem];
    updateElements(nextElements);
    setSelectedId(newElem.id);
    showToast('Добавлено на схему', `Элемент "${newElem.name}" успешно размещен на плане.`, 'success');
  };

  // Drag and drop mechanics for elements on canvas
  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    setSelectedId(id);
    setDraggedId(id);

    const elem = elements.find(el => el.id === id);
    if (elem) {
      dragOffset.current = {
        x: e.clientX - elem.x,
        y: e.clientY - elem.y
      };
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggedId || !canvasRef.current) return;
    
    const elem = elements.find(el => el.id === draggedId);
    if (!elem) return;

    let nextX = e.clientX - dragOffset.current.x;
    let nextY = e.clientY - dragOffset.current.y;

    // Grid snapping if grid visible (snap to 10px)
    if (gridVisible) {
      nextX = Math.round(nextX / 10) * 10;
      nextY = Math.round(nextY / 10) * 10;
    }

    // Boundary clamping
    const canvasBounds = canvasRef.current.getBoundingClientRect();
    const maxX = canvasBounds.width - elem.w;
    const maxY = canvasBounds.height - elem.h;

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

  const handleRotateSelected = () => {
    if (!selectedId) return;
    updateElements(elements.map(el => {
      if (el.id === selectedId) {
        return { ...el, rotation: (el.rotation + 45) % 360 };
      }
      return el;
    }));
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
  const totalTables = elements.filter(el => el.type === 'roundTable').length;
  const totalPresidiums = elements.filter(el => el.type === 'presidium').length;
  const guestCapacity = elements.reduce((sum, el) => {
    if (el.type === 'roundTable') {
      return sum + (el.capacity || 8);
    }
    if (el.type === 'presidium') {
      return sum + 2; // Typically newlyweds
    }
    return sum;
  }, 0);
  const totalChairs = elements.filter(el => el.type === 'chair').length;
  const totalSockets = elements.filter(el => el.type === 'socket').length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-190px)] min-h-[480px]">
      
      {/* 1. LEFT TOOLBOX PALETTE */}
      <div className="lg:col-span-3 flex flex-col gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 p-4 rounded-2xl shadow-sm overflow-y-auto max-h-full">
        <div className="space-y-1 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-xs font-bold uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Палитра расстановки</h3>
          <p className="text-[10px] text-zinc-400">Нажимайте для добавления на план</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
          {PALETTE_TEMPLATES.map((tmpl) => {
            const Icon = tmpl.icon;
            return (
              <button
                key={tmpl.type}
                onClick={() => handleAddTemplate(tmpl)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-950/20 hover:border-violet-500 hover:bg-violet-500/5 dark:hover:bg-violet-500/10 transition-all text-left cursor-pointer text-xs font-semibold text-zinc-700 dark:text-zinc-200 group"
              >
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 shadow-sm ${tmpl.color}`}>
                  <Icon className="w-4 h-4 text-zinc-600 dark:text-zinc-300 group-hover:text-violet-600 dark:group-hover:text-violet-400" />
                </div>
                <div className="min-w-0">
                  <p className="truncate">{tmpl.name}</p>
                  <p className="text-[9px] text-zinc-400 font-mono leading-none mt-0.5">
                    {tmpl.w / 10}м × {tmpl.h / 10}м
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Statistics Panel */}
        <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2.5 bg-violet-500/5 dark:bg-violet-950/10 p-3.5 rounded-2xl border border-violet-500/10">
          <span className="text-[9px] uppercase tracking-wider font-bold text-violet-700 dark:text-violet-400 flex items-center gap-1.5 leading-none">
            <Users className="w-3.5 h-3.5" /> Спецификация рассадки
          </span>

          <div className="grid grid-cols-2 gap-2 text-[10.5px]">
            <div className="bg-white/80 dark:bg-zinc-900/60 p-2 rounded-xl border border-zinc-200/20 shadow-sm">
              <span className="text-zinc-400 block text-[9px] uppercase">Всего мест</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-100 text-sm font-mono">{guestCapacity} чел.</span>
            </div>
            <div className="bg-white/80 dark:bg-zinc-900/60 p-2 rounded-xl border border-zinc-200/20 shadow-sm">
              <span className="text-zinc-400 block text-[9px] uppercase">Гостевые столы</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-100 text-sm font-mono">{totalTables} шт.</span>
            </div>
            <div className="bg-white/80 dark:bg-zinc-900/60 p-2 rounded-xl border border-zinc-200/20 shadow-sm">
              <span className="text-zinc-400 block text-[9px] uppercase">Президиумы</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-100 text-sm font-mono">{totalPresidiums} шт.</span>
            </div>
            <div className="bg-white/80 dark:bg-zinc-900/60 p-2 rounded-xl border border-zinc-200/20 shadow-sm">
              <span className="text-zinc-400 block text-[9px] uppercase">Точки питания</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-100 text-sm font-mono">{totalSockets} шт.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CENTRAL INTERACTIVE 2D CANVAS */}
      <div className="lg:col-span-6 flex flex-col gap-3 relative">
        {/* Canvas Toolbar Controls */}
        <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 p-2.5 rounded-xl text-xs shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setGridVisible(!gridVisible)}
              className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase flex items-center gap-1.5 border transition-all cursor-pointer ${
                gridVisible
                  ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                  : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
              }`}
            >
              <Grid className="w-3.5 h-3.5" /> Сетка {gridVisible ? 'ВКЛ' : 'ВЫКЛ'}
            </button>
            <span className="text-[10px] text-zinc-400 font-mono">Размер зала: 12.0 × 9.0 метров</span>
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={handleClearAll}
              disabled={elements.length === 0}
              className="px-2.5 py-1.5 rounded-lg border border-rose-500/10 hover:bg-rose-500/10 text-rose-600 font-bold text-[10px] uppercase transition-colors cursor-pointer disabled:opacity-40"
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
          className="flex-1 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 relative overflow-hidden h-full shadow-inner select-none cursor-default"
          style={{
            backgroundImage: gridVisible
              ? 'radial-gradient(#C08EF4 1px, transparent 1px), radial-gradient(#6366F1 0.7px, transparent 0.7px)'
              : 'none',
            backgroundSize: '20px 20px, 40px 40px',
            backgroundPosition: '0 0, 10px 10px'
          }}
        >
          {elements.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none text-zinc-400 dark:text-zinc-500">
              <Compass className="w-10 h-10 text-zinc-300 dark:text-zinc-800 mb-2 animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-wide">Схема расстановки пуста</p>
              <p className="text-[10px] text-zinc-400 max-w-[200px] mt-1">Добавьте столы, розетки или зоны декора из панели слева.</p>
            </div>
          )}

          {elements.map((el) => {
            const isSelected = selectedId === el.id;
            const borderStyle = isSelected
              ? 'ring-2 ring-violet-500 ring-offset-2 dark:ring-offset-zinc-950 z-30 shadow-lg'
              : 'hover:border-violet-500/80 z-20';

            return (
              <div
                key={el.id}
                onPointerDown={(e) => handlePointerDown(e, el.id)}
                className={`absolute p-1 bg-white/90 dark:bg-zinc-900/90 border border-zinc-300 dark:border-zinc-700 rounded-xl flex flex-col items-center justify-center text-center select-none cursor-move transition-shadow ${borderStyle}`}
                style={{
                  left: `${el.x}px`,
                  top: `${el.y}px`,
                  width: `${el.w}px`,
                  height: `${el.h}px`,
                  transform: `rotate(${el.rotation}deg)`
                }}
              >
                {/* Visual shapes for top down presentation */}
                <div className="absolute inset-1 border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-center justify-center overflow-hidden">
                  {el.type === 'roundTable' && (
                    <div className="w-[85%] h-[85%] rounded-full border-2 border-dashed border-indigo-400/60 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 leading-none">{el.label}</span>
                      <span className="text-[8px] text-zinc-400 font-bold mt-0.5">{el.capacity} чел</span>
                    </div>
                  )}

                  {el.type === 'presidium' && (
                    <div className="w-[90%] h-[90%] rounded border-2 border-violet-400/60 flex items-center justify-center bg-violet-500/5">
                      <span className="text-[9.5px] font-bold text-violet-700 dark:text-violet-400 leading-none">{el.label}</span>
                    </div>
                  )}

                  {el.type === 'buffetTable' && (
                    <div className="w-[90%] h-[90%] rounded border-2 border-emerald-400/60 flex items-center justify-center bg-emerald-500/5">
                      <span className="text-[9.5px] font-bold text-emerald-700 dark:text-emerald-400 leading-none">{el.label}</span>
                    </div>
                  )}

                  {el.type === 'chair' && (
                    <div className="w-5 h-5 rounded-full border border-zinc-400 flex items-center justify-center bg-zinc-200/20">
                      <span className="text-[7px] text-zinc-400 leading-none">ст</span>
                    </div>
                  )}

                  {el.type === 'photozone' && (
                    <div className="w-[90%] h-[90%] border-2 border-rose-400/60 flex items-center justify-center bg-rose-500/5 rounded-md">
                      <span className="text-[9px] font-extrabold text-rose-700 dark:text-rose-400 tracking-wider text-center px-1 uppercase leading-snug">{el.label}</span>
                    </div>
                  )}

                  {el.type === 'socket' && (
                    <div className="flex items-center gap-0.5 text-amber-500">
                      <Zap className="w-3.5 h-3.5 fill-current animate-pulse" />
                      <span className="text-[8.5px] font-extrabold font-mono text-zinc-500">{el.label}</span>
                    </div>
                  )}

                  {el.type === 'door' && (
                    <div className="w-full h-full bg-sky-500/10 flex items-center justify-center border-b-2 border-sky-400">
                      <span className="text-[8px] uppercase tracking-wide font-extrabold text-sky-600">{el.label}</span>
                    </div>
                  )}

                  {el.type === 'text' && (
                    <div className="w-full px-1 text-center truncate">
                      <span className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-200">{el.label}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. RIGHT SIDEBAR DETAILS PANEL */}
      <div className="lg:col-span-3 flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 p-4 rounded-2xl shadow-sm max-h-full overflow-y-auto">
        <div className="space-y-1 pb-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <h3 className="text-xs font-bold uppercase text-zinc-400 dark:text-zinc-500 tracking-wider flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" /> Свойства объекта
          </h3>
        </div>

        {selectedElem ? (
          <div className="flex-1 flex flex-col justify-between py-3 space-y-4">
            <div className="space-y-3.5">
              {/* Type and Name ID tags */}
              <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-950 p-2 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
                <span className="text-[10px] font-bold text-zinc-500">{selectedElem.name}</span>
                <span className="text-[8.5px] font-mono font-bold bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600">
                  ID: {selectedElem.id.split('-')[0]}
                </span>
              </div>

              {/* Editable Label value */}
              <div>
                <label className="block text-[8.5px] font-bold text-zinc-400 uppercase tracking-wide mb-1">Метка на схеме</label>
                <input
                  type="text"
                  value={selectedElem.label}
                  onChange={(e) => handleLabelChange(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-800 dark:text-zinc-100 font-semibold focus:outline-none focus:border-violet-500 transition-all"
                />
              </div>

              {/* Table capacity counter (only for roundTable templates) */}
              {selectedElem.type === 'roundTable' && (
                <div>
                  <label className="block text-[8.5px] font-bold text-zinc-400 uppercase tracking-wide mb-1">Гостей за столом</label>
                  <select
                    value={selectedElem.capacity || 8}
                    onChange={(e) => handleCapacityChange(parseInt(e.target.value))}
                    className="w-full bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-800 dark:text-zinc-100 font-semibold focus:outline-none focus:border-violet-500 transition-all cursor-pointer"
                  >
                    {[4, 6, 8, 10, 12].map(n => (
                      <option key={n} value={n}>{n} мест</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Rotate and Positioning tweaks */}
              <div className="space-y-1.5">
                <span className="block text-[8.5px] font-bold text-zinc-400 uppercase tracking-wide">Геометрия</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleRotateSelected}
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:border-violet-500 hover:text-violet-500 transition-all cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" /> Поворот 45°
                  </button>
                  <div className="flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-[11px] font-mono font-bold text-zinc-500">
                    Угол: {selectedElem.rotation}°
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleDeleteSelected}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/10 hover:border-rose-500 text-rose-600 text-xs font-bold transition-all cursor-pointer mt-auto"
            >
              <Trash2 className="w-3.5 h-3.5" /> Удалить объект
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-zinc-400 h-full mt-10">
            <Compass className="w-8 h-8 text-zinc-200 dark:text-zinc-800 mb-2" />
            <p className="text-[10px] uppercase font-bold tracking-wide">Ничего не выбрано</p>
            <p className="text-[9px] text-zinc-400 mt-1">Кликните на любой объект в зале для редактирования свойств.</p>
          </div>
        )}
      </div>

    </div>
  );
}
