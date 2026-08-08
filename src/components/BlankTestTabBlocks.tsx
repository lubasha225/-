import React from 'react';
import {
  Clipboard,
  Send,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Palette,
  SlidersHorizontal,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  Trash2,
  CheckSquare,
  FolderOpen,
  FileText,
  ShieldCheck,
  FileCheck,
  FileSignature,
  Eye,
  Download,
  FileSpreadsheet,
  TrendingUp,
  AlertCircle,
  Award,
  Truck,
  Wallet,
  CreditCard
} from 'lucide-react';

interface BriefBlockProps {
  isOverview?: boolean;
  overviewCollapsed: { brief: boolean; design: boolean; calc: boolean; journal: boolean; docs: boolean };
  toggleOverviewSection: (key: 'brief' | 'design' | 'calc' | 'journal' | 'docs') => void;
  briefFilledPercentage: number;
  filledBriefCount: number;
  totalBriefCount: number;
  showToast?: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  briefFieldDefinitions: Array<{ key: string; filledBy: 'client' | 'designer'; multiline?: boolean }>;
  briefValues: Record<string, string>;
  handleUpdateBriefField: (key: string, value: string) => void;
  customDecoratorFields: Array<{ id: string; key: string }>;
  setCustomDecoratorFields: React.Dispatch<React.SetStateAction<Array<{ id: string; key: string }>>>;
  setBriefValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isAddingCustomField: boolean;
  setIsAddingCustomField: (val: boolean) => void;
  newFieldName: string;
  setNewFieldName: (val: string) => void;
}

export const BriefBlock: React.FC<BriefBlockProps> = ({
  isOverview = false,
  overviewCollapsed,
  toggleOverviewSection,
  briefFilledPercentage,
  filledBriefCount,
  totalBriefCount,
  showToast,
  briefFieldDefinitions,
  briefValues,
  handleUpdateBriefField,
  customDecoratorFields,
  setCustomDecoratorFields,
  setBriefValues,
  isAddingCustomField,
  setIsAddingCustomField,
  newFieldName,
  setNewFieldName
}) => {
  const isCollapsed = isOverview && overviewCollapsed.brief;

  return (
    <div className={isOverview ? "bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] border border-zinc-200/50 dark:border-zinc-800/40 p-5 sm:p-6 shadow-xs transition-all space-y-6" : "space-y-6"}>
      {/* BRIEF HEADER */}
      <div className={`flex items-center justify-between gap-4 ${isCollapsed ? '' : 'pb-4 border-b border-zinc-200/40 dark:border-zinc-800/40'}`}>
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="p-2 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-xl shrink-0">
            <Clipboard className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Анкета и Бриф проекта
            </h3>
            <p className="text-xs sm:text-sm font-normal text-zinc-700 dark:text-zinc-300 leading-relaxed truncate">
              Техническое задание, детали локации и пожелания заказчика
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isCollapsed && (
            <button
              type="button"
              onClick={() => {
                showToast?.('Бриф отправлен', 'Ссылка на бриф скопирована и отправлена клиенту', 'success');
              }}
              style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
              className="w-8 h-8 rounded-full text-white flex items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-105 active:scale-95 shadow-xs shrink-0"
              title="Отправить бриф клиенту"
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          )}

          {isOverview && (
            <button
              type="button"
              onClick={() => toggleOverviewSection('brief')}
              className="w-8 h-8 rounded-full text-zinc-700 dark:text-zinc-300 bg-white/70 dark:bg-zinc-800/70 border border-zinc-200/60 dark:border-zinc-700/60 hover:bg-purple-50 dark:hover:bg-purple-950/60 transition-all cursor-pointer flex items-center justify-center shrink-0"
              title={isCollapsed ? 'Развернуть' : 'Свернуть'}
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4 text-[#8C52D0]" /> : <ChevronUp className="w-4 h-4 text-[#8C52D0]" />}
            </button>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <div className="space-y-6">
          {/* SECTION 1: CLIENT FIELDS */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-purple-100 dark:border-purple-950/60 pb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8C52D0] shrink-0" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Поля клиента
              </h3>
              <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/80 px-2 py-0.5 rounded-full">
                {briefFieldDefinitions.filter(f => f.filledBy === 'client').length} полей
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {briefFieldDefinitions.filter(f => f.filledBy === 'client').map((field) => {
                const val = briefValues[field.key] || '';
                const isEmpty = !val.trim() || val === "(требует заполнения)";

                return (
                  <div
                    key={field.key}
                    className={`p-2.5 rounded-xl border border-l-2 text-left transition-all flex flex-col justify-between shadow-2xs ${
                      isEmpty
                        ? 'border-dashed border-purple-300 border-l-[#8C52D0] dark:border-purple-800 bg-purple-50/40 dark:bg-purple-950/20'
                        : 'border-purple-200/80 border-l-[#8C52D0] dark:border-purple-900/50 bg-white/80 dark:bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal truncate">
                        {field.key}
                      </span>
                    </div>

                    {field.multiline ? (
                      <textarea
                        rows={2}
                        value={val === "(требует заполнения)" ? "" : val}
                        onChange={(e) => handleUpdateBriefField(field.key, e.target.value)}
                        placeholder="Заполните информацию..."
                        className={`w-full text-xs font-semibold rounded-lg p-1.5 border transition-all focus:outline-none focus:ring-1 focus:ring-[#8C52D0] resize-none ${
                          isEmpty
                            ? 'bg-purple-50/60 text-[#582F89] italic font-medium border-purple-200 dark:bg-purple-950/40 dark:text-purple-300'
                            : 'bg-white/90 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800'
                        }`}
                      />
                    ) : (
                      <input
                        type="text"
                        value={val === "(требует заполнения)" ? "" : val}
                        onChange={(e) => handleUpdateBriefField(field.key, e.target.value)}
                        placeholder="Заполните значение..."
                        className={`w-full text-xs font-semibold rounded-lg px-2 py-1 border transition-all focus:outline-none focus:ring-1 focus:ring-[#8C52D0] ${
                          isEmpty
                            ? 'bg-purple-50/60 text-[#582F89] italic font-medium border-purple-200 dark:bg-purple-950/40 dark:text-purple-300'
                            : 'bg-white/90 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: DECORATOR FIELDS */}
          <div className="space-y-3 pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60">
            <div className="flex items-center gap-2 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 dark:bg-zinc-500 shrink-0" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Поля декоратора
              </h3>
              <span className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                {briefFieldDefinitions.filter(f => f.filledBy === 'designer').length} полей
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {briefFieldDefinitions.filter(f => f.filledBy === 'designer').map((field) => {
                const val = briefValues[field.key] || '';
                const isEmpty = !val.trim() || val === "(требует заполнения)";
                const isCustom = customDecoratorFields.some(cf => cf.key === field.key);

                return (
                  <div
                    key={field.key}
                    className={`p-2.5 rounded-xl border border-l-2 text-left transition-all flex flex-col justify-between shadow-2xs relative group ${
                      isEmpty
                        ? 'border-dashed border-zinc-300 border-l-zinc-400 dark:border-zinc-700 bg-zinc-50/60 dark:bg-zinc-900/30'
                        : 'border-zinc-200/80 border-l-zinc-400 dark:border-l-zinc-500 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal truncate">
                        {field.key}
                      </span>
                      {isCustom && (
                        <button
                          onClick={() => {
                            setCustomDecoratorFields(prev => prev.filter(cf => cf.key !== field.key));
                            setBriefValues(prev => {
                              const copy = { ...prev };
                              delete copy[field.key];
                              return copy;
                            });
                            showToast?.('Удалено', `Поле ${field.key} удалено`, 'info');
                          }}
                          title="Удалить поле"
                          className="text-zinc-400 hover:text-rose-500 transition-colors p-0.5 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {field.multiline ? (
                      <textarea
                        rows={2}
                        value={val === "(требует заполнения)" ? "" : val}
                        onChange={(e) => handleUpdateBriefField(field.key, e.target.value)}
                        placeholder="Заполните информацию..."
                        className={`w-full text-xs font-semibold rounded-lg p-1.5 border transition-all focus:outline-none focus:ring-1 focus:ring-[#8C52D0] resize-none ${
                          isEmpty
                            ? 'bg-zinc-100/60 text-zinc-600 italic font-medium border-zinc-200 dark:bg-zinc-800/60 dark:text-zinc-400'
                            : 'bg-white/90 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800'
                        }`}
                      />
                    ) : (
                      <input
                        type="text"
                        value={val === "(требует заполнения)" ? "" : val}
                        onChange={(e) => handleUpdateBriefField(field.key, e.target.value)}
                        placeholder="Заполните значение..."
                        className={`w-full text-xs font-semibold rounded-lg px-2 py-1 border transition-all focus:outline-none focus:ring-1 focus:ring-[#8C52D0] ${
                          isEmpty
                            ? 'bg-zinc-100/60 text-zinc-600 italic font-medium border-zinc-200 dark:bg-zinc-800/60 dark:text-zinc-400'
                            : 'bg-white/90 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800'
                        }`}
                      />
                    )}
                  </div>
                );
              })}

              {/* ADD CUSTOM FIELD BUTTON / FORM */}
              {isAddingCustomField ? (
                <div className="p-2.5 rounded-xl border border-l-2 border-dashed border-purple-300 border-l-[#8C52D0] dark:border-purple-800 bg-purple-50/40 dark:bg-purple-950/20 text-left flex flex-col justify-between gap-2 shadow-2xs">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-[#582F89] dark:text-purple-300">
                    Новое поле декоратора
                  </span>
                  <input
                    type="text"
                    autoFocus
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    placeholder="Название поля..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newFieldName.trim()) {
                        const keyUpper = newFieldName.trim().toUpperCase();
                        setCustomDecoratorFields(prev => [...prev, { id: Date.now().toString(), key: keyUpper }]);
                        setBriefValues(prev => ({ ...prev, [keyUpper]: '' }));
                        setNewFieldName('');
                        setIsAddingCustomField(false);
                        showToast?.('Поле добавлено', `Добавлено поле: ${keyUpper}`, 'success');
                      }
                    }}
                    className="w-full text-xs font-semibold rounded-lg px-2 py-1 border border-purple-200 dark:border-purple-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#8C52D0]"
                  />
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <button
                      onClick={() => {
                        if (newFieldName.trim()) {
                          const keyUpper = newFieldName.trim().toUpperCase();
                          setCustomDecoratorFields(prev => [...prev, { id: Date.now().toString(), key: keyUpper }]);
                          setBriefValues(prev => ({ ...prev, [keyUpper]: '' }));
                          setNewFieldName('');
                          setIsAddingCustomField(false);
                          showToast?.('Поле добавлено', `Добавлено поле: ${keyUpper}`, 'success');
                        }
                      }}
                      className="flex-1 py-1 px-2 text-white rounded-full text-[11px] font-bold transition-all cursor-pointer hover:opacity-95"
                      style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
                    >
                      Сохранить
                    </button>
                    <button
                      onClick={() => {
                        setNewFieldName('');
                        setIsAddingCustomField(false);
                      }}
                      className="px-2 py-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 text-[11px] font-medium cursor-pointer"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingCustomField(true)}
                  className="p-3 rounded-xl border border-l-2 border-dashed border-zinc-200 border-l-zinc-400 dark:border-zinc-700/60 hover:border-purple-300 bg-white/40 dark:bg-zinc-900/30 hover:bg-purple-50/40 text-zinc-600 hover:text-[#582F89] dark:text-zinc-400 dark:hover:text-purple-300 text-xs font-semibold transition-all duration-300 flex flex-col items-center justify-center gap-1.5 min-h-[82px] cursor-pointer group"
                >
                  <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
                    <Plus className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300 group-hover:text-[#8C52D0]" />
                  </div>
                  <span className="text-[11px] font-bold">+ Добавить поле</span>
                </button>
              )}
            </div>
          </div>

          {/* BOTTOM LEGEND */}
          <div className="pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-4 text-zinc-700 dark:text-zinc-300">
              <span className="flex items-center gap-1.5 font-normal">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8C52D0]" /> Поля клиента
              </span>
              <span className="flex items-center gap-1.5 font-normal">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-400" /> Поля декоратора
              </span>
            </div>
            <span className="text-zinc-600 dark:text-zinc-400 italic">
              Все изменения сохраняются автоматически
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

interface DesignBlockProps {
  isOverview?: boolean;
  overviewCollapsed: { brief: boolean; design: boolean; calc: boolean; journal: boolean; docs: boolean };
  toggleOverviewSection: (key: 'brief' | 'design' | 'calc' | 'journal' | 'docs') => void;
  venuePhotos: string[];
  setVenuePhotos: React.Dispatch<React.SetStateAction<string[]>>;
  showToast?: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handlePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  vizIndex: number;
  setVizIndex: React.Dispatch<React.SetStateAction<number>>;
  visualizations: Array<{ title: string; subtitle: string; image: string }>;
  aiVizIndex: number;
  setAiVizIndex: React.Dispatch<React.SetStateAction<number>>;
  aiVisualizations: Array<{ title: string; subtitle: string; image: string }>;
}

export const DesignBlock: React.FC<DesignBlockProps> = ({
  isOverview = false,
  overviewCollapsed,
  toggleOverviewSection,
  venuePhotos,
  setVenuePhotos,
  showToast,
  fileInputRef,
  handlePhotoUpload,
  vizIndex,
  setVizIndex,
  visualizations,
  aiVizIndex,
  setAiVizIndex,
  aiVisualizations
}) => {
  const isCollapsed = isOverview && overviewCollapsed.design;

  return (
    <div className={isOverview ? "bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] border border-zinc-200/50 dark:border-zinc-800/40 p-5 sm:p-6 shadow-xs transition-all space-y-6" : "space-y-6"}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />

      {/* DESIGN HEADER */}
      <div className={`flex items-center justify-between gap-4 ${isCollapsed ? '' : 'pb-4 border-b border-zinc-200/40 dark:border-zinc-800/40'}`}>
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
            <Palette className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Дизайн & Визуализация
            </h3>
            <p className="text-xs sm:text-sm font-normal text-zinc-700 dark:text-zinc-300 leading-relaxed truncate">
              Эскизы, концепции, 3D визуализации и материалы проекта
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {!isCollapsed && (
            <button
              onClick={() => {
                showToast?.('Редактор дизайна', 'Переход в встроенный графический редактор...', 'info');
              }}
              style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
              className="rounded-full px-4 py-1.5 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer transition-all duration-300 hover:shadow-md hover:opacity-95 active:scale-[0.98] shadow-xs shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">Редактор</span>
            </button>
          )}

          {isOverview && (
            <button
              type="button"
              onClick={() => toggleOverviewSection('design')}
              className="w-8 h-8 rounded-full text-zinc-700 dark:text-zinc-300 bg-white/70 dark:bg-zinc-800/70 border border-zinc-200/60 dark:border-zinc-700/60 hover:bg-purple-50 dark:hover:bg-purple-950/60 transition-all cursor-pointer flex items-center justify-center shrink-0"
              title={isCollapsed ? 'Развернуть' : 'Свернуть'}
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4 text-[#8C52D0]" /> : <ChevronUp className="w-4 h-4 text-[#8C52D0]" />}
            </button>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <div className="space-y-6">
          {/* CAROUSEL SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* CAROUSEL 1: DRAFT VISUALIZATION */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#8C52D0] dark:text-purple-300 uppercase tracking-wider">
                  Эскизы декоратора ({vizIndex + 1}/{visualizations.length})
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setVizIndex(prev => (prev === 0 ? visualizations.length - 1 : prev - 1))}
                    className="p-1 rounded-lg bg-white/60 dark:bg-zinc-800/60 hover:bg-purple-100 text-zinc-700 dark:text-zinc-300 cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setVizIndex(prev => (prev === visualizations.length - 1 ? 0 : prev + 1))}
                    className="p-1 rounded-lg bg-white/60 dark:bg-zinc-800/60 hover:bg-purple-100 text-zinc-700 dark:text-zinc-300 cursor-pointer transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="relative aspect-16/10 rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 shadow-xs group cursor-pointer">
                <img
                  src={visualizations[vizIndex].image}
                  alt={visualizations[vizIndex].title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />

                {/* HOVER EDIT OVERLAY BUTTON */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-3 z-10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      showToast?.('Редактор эскизов', 'Открытие эскиза декоратора в графическом редакторе...', 'info');
                    }}
                    style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
                    className="rounded-full px-4 py-2 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-105"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-white" />
                    <span>Редактировать</span>
                  </button>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white z-20 pointer-events-none">
                  <span className="text-[10px] font-mono tracking-wider opacity-80 block">{visualizations[vizIndex].title}</span>
                  <p className="text-xs font-semibold">{visualizations[vizIndex].subtitle}</p>
                </div>
              </div>
            </div>

            {/* CAROUSEL 2: AI VISUALIZATION */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> ИИ Концепции ({aiVizIndex + 1}/{aiVisualizations.length})
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setAiVizIndex(prev => (prev === 0 ? aiVisualizations.length - 1 : prev - 1))}
                    className="p-1 rounded-lg bg-white/60 dark:bg-zinc-800/60 hover:bg-indigo-100 text-zinc-700 dark:text-zinc-300 cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setAiVizIndex(prev => (prev === aiVisualizations.length - 1 ? 0 : prev + 1))}
                    className="p-1 rounded-lg bg-white/60 dark:bg-zinc-800/60 hover:bg-indigo-100 text-zinc-700 dark:text-zinc-300 cursor-pointer transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="relative aspect-16/10 rounded-2xl overflow-hidden border border-indigo-200/80 dark:border-indigo-900/60 shadow-xs group cursor-pointer">
                <img
                  src={aiVisualizations[aiVizIndex].image}
                  alt={aiVisualizations[aiVizIndex].title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />

                {/* HOVER EDIT OVERLAY BUTTON */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-3 z-10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      showToast?.('Редактор концепта', 'Открытие ИИ концепта в графическом редакторе...', 'info');
                    }}
                    style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
                    className="rounded-full px-4 py-2 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-105"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-white" />
                    <span>Редактировать</span>
                  </button>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white z-20 pointer-events-none">
                  <span className="text-[10px] font-mono tracking-wider opacity-80 block">{aiVisualizations[aiVizIndex].title}</span>
                  <p className="text-xs font-semibold">{aiVisualizations[aiVizIndex].subtitle}</p>
                </div>
              </div>
            </div>
          </div>

          {/* VENUE GALLERY STRIP */}
          <div className="pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                Фотографии площадки и замёры ({venuePhotos.length}/6)
              </span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-[#8C52D0] hover:text-[#582F89] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> <span>Загрузить фото</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {venuePhotos.map((img, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 shadow-2xs"
                >
                  <img src={img} alt={`Площадка ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <button
                    onClick={() => {
                      setVenuePhotos(prev => prev.filter((_, i) => i !== idx));
                      showToast?.('Удалено', 'Фотография удалена из галереи', 'info');
                    }}
                    className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Удалить"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface CalcBlockProps {
  isOverview?: boolean;
  overviewCollapsed: { brief: boolean; design: boolean; calc: boolean; journal: boolean; docs: boolean };
  toggleOverviewSection: (key: 'brief' | 'design' | 'calc' | 'journal' | 'docs') => void;
  finalPrice: number;
  setFinalPrice?: (val: number) => void;
  handleResetCalculator: () => void;
  visualizationScenes: Array<{ id: string; name: string; subtitle?: string; defaultPrice?: number; elements?: Array<{ name: string; price: number }> }>;
  setVisualizationScenes?: React.Dispatch<React.SetStateAction<any[]>>;
  disabledSceneIds: string[];
  getSceneCost: (scene: any) => number;
  handleToggleSceneInEstimate: (id: string) => void;
  handleUpdateScenePrice: (id: string, price: number) => void;
  handleUpdateSceneName?: (id: string, name: string) => void;
  handleDeleteScene: (id: string) => void;
  serviceEstimate: Array<{ id: string; name: string; category?: string; price: number; quantity: number }>;
  setServiceEstimate: React.Dispatch<React.SetStateAction<Array<any>>>;
  handleUpdateEstimateItemName?: (id: string, name: string) => void;
  handleUpdateEstimateItemPrice?: (id: string, price: number) => void;
  handleDeleteEstimateItem?: (id: string) => void;
  showAddWorkRow: boolean;
  setShowAddWorkRow: (val: boolean) => void;
  newWorkName: string;
  setNewWorkName: (val: string) => void;
  newWorkPrice: number | '';
  setNewWorkPrice: (val: number | '') => void;
  handleAddWorkPosition: () => void;
  totalCost: number;
  profitMarginPercent: number;
  calculatedProfit: number;
  showToast?: (title: string, message: string, type?: 'success' | 'info' | 'warn' | 'error') => void;
}

export const CalcBlock: React.FC<CalcBlockProps> = ({
  isOverview = false,
  overviewCollapsed,
  toggleOverviewSection,
  finalPrice,
  setFinalPrice,
  handleResetCalculator,
  visualizationScenes,
  setVisualizationScenes,
  disabledSceneIds,
  getSceneCost,
  handleToggleSceneInEstimate,
  handleUpdateScenePrice,
  handleUpdateSceneName,
  handleDeleteScene,
  serviceEstimate,
  setServiceEstimate,
  handleUpdateEstimateItemName,
  handleUpdateEstimateItemPrice,
  handleDeleteEstimateItem,
  showAddWorkRow,
  setShowAddWorkRow,
  newWorkName,
  setNewWorkName,
  newWorkPrice,
  setNewWorkPrice,
  handleAddWorkPosition,
  totalCost,
  profitMarginPercent,
  calculatedProfit,
  showToast
}) => {
  const isCollapsed = isOverview && overviewCollapsed.calc;

  const decorCost = visualizationScenes.reduce((sum: number, sc: any) => {
    if (disabledSceneIds.includes(sc.id)) return sum;
    return sum + getSceneCost(sc);
  }, 0);

  const serviceCost = serviceEstimate.reduce((sum: number, item: any) => sum + (Number(item.price) || 0) * (item.quantity || 1), 0);

  return (
    <div className={isOverview ? "bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] border border-zinc-200/50 dark:border-zinc-800/40 p-5 sm:p-6 shadow-xs transition-all space-y-6" : "space-y-6"}>
      {/* HEADER */}
      <div className={`flex items-center justify-between gap-4 ${isCollapsed ? '' : 'pb-4 border-b border-zinc-200/40 dark:border-zinc-800/40'}`}>
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Смета и расчет стоимости
            </h3>
            <p className="text-xs sm:text-sm font-normal text-zinc-700 dark:text-zinc-300 leading-relaxed truncate">
              Калькуляция флористики, текстиля и монтажных работ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {!isCollapsed && (
            <button
              onClick={handleResetCalculator}
              className="px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-rose-500 dark:hover:text-rose-400 cursor-pointer flex items-center gap-1.5 border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs transition-colors shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Сбросить</span>
            </button>
          )}

          {isOverview && (
            <button
              type="button"
              onClick={() => toggleOverviewSection('calc')}
              className="w-8 h-8 rounded-full text-zinc-700 dark:text-zinc-300 bg-white/70 dark:bg-zinc-800/70 border border-zinc-200/60 dark:border-zinc-700/60 hover:bg-purple-50 dark:hover:bg-purple-950/60 transition-all cursor-pointer flex items-center justify-center shrink-0"
              title={isCollapsed ? 'Развернуть' : 'Свернуть'}
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4 text-[#8C52D0]" /> : <ChevronUp className="w-4 h-4 text-[#8C52D0]" />}
            </button>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <div className="space-y-5">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs border-collapse min-w-[320px]">
              <thead>
                <tr className="border-b border-zinc-200/80 dark:border-zinc-800">
                  <th className="pb-3 pt-1 px-1 sm:px-3 w-8 sm:w-12 text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal">Превью</th>
                  <th className="pb-3 pt-1 px-1.5 sm:px-3 text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal">Визуализация / Позиция</th>
                  <th className="pb-3 pt-1 px-1 sm:px-3 text-center text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal">
                    <span className="hidden sm:inline">Включение в смету</span>
                    <span className="sm:hidden">В смету</span>
                  </th>
                  <th className="pb-3 pt-1 px-1.5 sm:px-3 text-right text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal">Стоимость (₽)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-zinc-800/80">
                {/* SECTION TITLE: VISUALIZATIONS */}
                <tr className="bg-purple-50/60 dark:bg-purple-950/40 border-y border-purple-200/50 dark:border-purple-900/50">
                  <td colSpan={4} className="py-2.5 px-2 sm:px-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-[#F3E8FF] dark:bg-purple-900/50 rounded-lg text-[#8C52D0] dark:text-purple-300 shrink-0">
                        <Sparkles className="w-4 h-4 stroke-[2]" />
                      </div>
                      <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-normal text-zinc-800 dark:text-zinc-200">
                        Визуализации декора (общая стоимость)
                      </span>
                    </div>
                  </td>
                </tr>

                {/* VISUALIZATIONS SUMMARY ROWS */}
                {visualizationScenes.length > 0 ? (
                  visualizationScenes.map((sc, idx) => {
                    const isIncluded = !disabledSceneIds.includes(sc.id);
                    const cost = getSceneCost(sc);

                    return (
                      <tr
                        key={sc.id || idx}
                        className={`group transition-colors ${
                          isIncluded
                            ? 'hover:bg-purple-50/30 dark:hover:bg-purple-950/20'
                            : 'opacity-50 bg-stone-50/60 dark:bg-zinc-900/40'
                        }`}
                      >
                        {/* PREVIEW ICON */}
                        <td className="py-2.5 px-1 sm:px-3">
                          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shadow-2xs border ${
                            isIncluded
                              ? 'bg-purple-100/80 dark:bg-purple-900/50 border-purple-200 dark:border-purple-800 text-[#8C52D0] dark:text-purple-300'
                              : 'bg-stone-200/60 dark:bg-zinc-800 border-stone-300 dark:border-zinc-700 text-stone-400'
                          }`}>
                            <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                          </div>
                        </td>

                        {/* SCENE NAME & SUBTITLE */}
                        <td className="py-2.5 px-1.5 sm:px-3">
                          <div className="flex flex-col min-w-0">
                            {handleUpdateSceneName ? (
                              <input
                                type="text"
                                value={sc.name || `Декор ${idx + 1}`}
                                onChange={(e) => handleUpdateSceneName(sc.id, e.target.value)}
                                className={`font-semibold text-xs sm:text-sm bg-transparent border-b border-transparent hover:border-purple-300 focus:border-[#8C52D0] focus:outline-none transition-colors w-full ${
                                  isIncluded ? 'text-stone-900 dark:text-stone-100' : 'line-through text-stone-400 dark:text-zinc-500'
                                }`}
                              />
                            ) : (
                              <span className={`font-semibold text-xs sm:text-sm truncate ${isIncluded ? 'text-stone-900 dark:text-stone-100' : 'line-through text-stone-400 dark:text-zinc-500'}`}>
                                {sc.name || `Декор ${idx + 1}`}
                              </span>
                            )}
                            <span className="text-[10px] sm:text-[11px] text-zinc-600 dark:text-zinc-400 font-normal truncate">
                              {sc.subtitle || 'Отдельный элемент декора'}
                            </span>
                          </div>
                        </td>

                        {/* TOGGLE CHECKMARK */}
                        <td className="py-2.5 px-1 sm:px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleSceneInEstimate(sc.id)}
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full inline-flex items-center justify-center transition-all cursor-pointer ${
                              isIncluded
                                ? 'bg-emerald-500 text-white shadow-2xs hover:bg-emerald-600'
                                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 hover:bg-zinc-300 dark:hover:bg-zinc-700'
                            }`}
                            title={isIncluded ? 'Включено в смету (нажмите чтобы исключить)' : 'Исключено из сметы (нажмите чтобы включить)'}
                          >
                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                          </button>
                        </td>

                        {/* COST INPUT & DELETE */}
                        <td className="py-2.5 px-1.5 sm:px-3 text-right">
                          <div className="inline-flex items-center gap-1 sm:gap-2 justify-end">
                            <input
                              type="number"
                              disabled={!isIncluded}
                              value={cost}
                              onChange={(e) => handleUpdateScenePrice(sc.id, Number(e.target.value))}
                              className={`w-20 sm:w-28 text-right font-bold text-xs sm:text-sm bg-white dark:bg-zinc-800 border rounded-xl px-1.5 sm:px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#8C52D0] ${
                                isIncluded
                                  ? 'border-purple-200 dark:border-purple-800 text-stone-900 dark:text-stone-100'
                                  : 'border-stone-200 text-stone-400 bg-stone-100/50'
                              }`}
                            />
                            <span className="font-semibold text-stone-700 dark:text-stone-300 text-xs sm:text-sm">₽</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteScene(sc.id)}
                              className="p-1 text-stone-400 hover:text-rose-500 transition-colors cursor-pointer shrink-0"
                              title="Удалить позицию"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-stone-400 text-xs">
                      Нет добавленных элементов декора
                    </td>
                  </tr>
                )}

                {/* SECTION TITLE: LOGISTICS & SERVICES */}
                <tr className="bg-stone-100/80 dark:bg-zinc-800/50 border-y border-stone-200/80 dark:border-zinc-800">
                  <td colSpan={4} className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-stone-200 dark:bg-zinc-700 rounded-lg text-stone-700 dark:text-stone-200">
                        <Truck className="w-4 h-4 stroke-[2]" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-normal text-zinc-800 dark:text-zinc-200">
                        Монтажные работы, логистика и сервисы
                      </span>
                    </div>
                  </td>
                </tr>

                {/* SERVICES ROWS */}
                {serviceEstimate.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-2.5 px-1 sm:px-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-stone-300 flex items-center justify-center shadow-2xs">
                        <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                    </td>

                    <td className="py-2.5 px-1.5 sm:px-3">
                      <div className="flex flex-col min-w-0">
                        {handleUpdateEstimateItemName ? (
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleUpdateEstimateItemName(item.id, e.target.value)}
                            className="font-semibold text-xs sm:text-sm bg-transparent text-stone-900 dark:text-stone-100 border-b border-transparent hover:border-stone-300 focus:border-[#8C52D0] focus:outline-none w-full"
                          />
                        ) : (
                          <span className="font-semibold text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate">{item.name}</span>
                        )}
                        <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-normal truncate">
                          {item.category || 'Услуга'} • {item.quantity || 1} шт.
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 px-1 sm:px-3 text-center"></td>

                    <td className="py-2.5 px-1.5 sm:px-3 text-right">
                      <div className="inline-flex items-center gap-1 sm:gap-2 justify-end">
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => handleUpdateEstimateItemPrice ? handleUpdateEstimateItemPrice(item.id, Number(e.target.value)) : setServiceEstimate(prev => prev.map(i => i.id === item.id ? { ...i, price: Number(e.target.value) } : i))}
                          className="w-20 sm:w-28 text-right font-bold text-xs sm:text-sm bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl px-1.5 sm:px-2.5 py-1 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#8C52D0]"
                        />
                        <span className="font-semibold text-stone-700 dark:text-stone-300 text-xs sm:text-sm">₽</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteEstimateItem ? handleDeleteEstimateItem(item.id) : setServiceEstimate(prev => prev.filter(i => i.id !== item.id))}
                          className="p-1 text-stone-400 hover:text-rose-500 transition-colors cursor-pointer shrink-0"
                          title="Удалить работу"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* ADD WORK ROW INPUT */}
                {showAddWorkRow && (
                  <tr className="bg-purple-50/40 dark:bg-purple-950/20">
                    <td className="py-2.5 px-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-[#8C52D0] flex items-center justify-center">
                        <Plus className="w-4 h-4" />
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-col gap-1">
                        <input
                          type="text"
                          placeholder="Название работы или доставки..."
                          value={newWorkName}
                          onChange={(e) => setNewWorkName(e.target.value)}
                          className="bg-white dark:bg-zinc-800 border border-[#8C52D0]/50 rounded-xl px-2.5 py-1 text-xs text-stone-900 dark:text-stone-100 focus:outline-none"
                        />
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-[10px] text-stone-400">Новая позиция</span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <input
                          type="number"
                          placeholder="0"
                          value={newWorkPrice}
                          onChange={(e) => setNewWorkPrice(e.target.value ? Number(e.target.value) : '')}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddWorkPosition();
                          }}
                          className="w-28 border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-stone-800 dark:text-stone-100 placeholder:text-stone-400 px-2.5 py-1 rounded-xl text-right font-bold text-sm focus:outline-none shadow-2xs"
                        />
                        <span className="font-semibold text-stone-700 dark:text-stone-300 text-sm">₽</span>
                        <button
                          type="button"
                          onClick={() => setShowAddWorkRow(false)}
                          className="p-1 text-stone-300 hover:text-rose-500 transition-colors cursor-pointer"
                          title="Отмена"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ACTION BUTTONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                if (setVisualizationScenes) {
                  const newNum = visualizationScenes.length + 1;
                  const newScene = {
                    id: `scene-${Date.now()}`,
                    name: `Декор ${newNum}`,
                    subtitle: `Отдельный элемент декора`,
                    defaultPrice: 0,
                    elements: []
                  };
                  setVisualizationScenes(prev => [...prev, newScene]);
                  showToast?.('Добавлен декор', `Создана новая позиция: Декор ${newNum}`, 'success');
                }
              }}
              className="w-full py-3 px-5 rounded-full bg-[#F3E8FF] dark:bg-purple-950/40 hover:bg-[#E9D5FF] dark:hover:bg-purple-900/50 border border-[#8C52D0]/50 dark:border-purple-600/50 flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 active:scale-[0.98] shadow-xs"
            >
              <Palette className="w-4 h-4 stroke-[2.2] text-[#8C52D0] dark:text-purple-300" />
              <span className="bg-gradient-to-r from-[#8C52D0] to-[#582F89] dark:from-purple-300 dark:to-purple-200 bg-clip-text text-transparent font-semibold text-xs sm:text-sm">
                + Добавить декор
              </span>
            </button>

            <button
              type="button"
              onClick={handleAddWorkPosition}
              className="w-full py-3 px-5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/80 border border-zinc-300/60 dark:border-zinc-700/60 flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 active:scale-[0.98] shadow-2xs"
            >
              <Truck className="w-4 h-4 stroke-[2] text-zinc-600 dark:text-zinc-400" />
              <span className="font-semibold text-xs sm:text-sm text-zinc-700 dark:text-zinc-200">
                + Работа / Доставка
              </span>
            </button>
          </div>

          {/* 3 FINANCIAL CALCULATION PANELS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-4 border-t border-stone-200/70 dark:border-zinc-800">
            {/* CARD 1: COST BREAKDOWN */}
            <div className="p-4 bg-white/80 dark:bg-zinc-900/80 rounded-2xl border border-stone-200/80 dark:border-zinc-800 shadow-2xs flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-stone-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300 flex items-center justify-center">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <span className="text-stone-500 dark:text-stone-400 font-bold uppercase text-[10px] tracking-wider">
                    Себестоимость
                  </span>
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-500 dark:text-stone-400">
                  <span>Декор:</span>
                  <strong className="text-stone-800 dark:text-stone-200 font-mono font-semibold">
                    {decorCost.toLocaleString('ru')} ₽
                  </strong>
                </div>
                <div className="flex justify-between text-stone-500 dark:text-stone-400">
                  <span>Работы:</span>
                  <strong className="text-stone-800 dark:text-stone-200 font-mono font-semibold">
                    {serviceCost.toLocaleString('ru')} ₽
                  </strong>
                </div>
              </div>
              <div className="pt-2.5 border-t border-stone-200 dark:border-zinc-800 bg-stone-100/70 dark:bg-zinc-800/60 -mx-4 -mb-4 p-3 rounded-b-2xl">
                <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Итого себестоимость:
                </div>
                <div className="pt-1 font-mono text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight whitespace-nowrap">
                  {totalCost.toLocaleString('ru')} ₽
                </div>
              </div>
            </div>

            {/* CARD 2: NET PROFIT */}
            {(() => {
              const isProfitPositive = calculatedProfit >= 0;
              return (
                <div className={`p-4 rounded-2xl border shadow-2xs flex flex-col justify-between space-y-2 transition-all ${
                  isProfitPositive
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800/50'
                    : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-800/50'
                }`}>
                  <div className="flex items-center gap-2 pb-1 border-b border-emerald-100/60 dark:border-emerald-900/40">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isProfitPositive
                        ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                    }`}>
                      {isProfitPositive ? <TrendingUp className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    </div>
                    <span className={`font-bold uppercase text-[10px] tracking-wider ${
                      isProfitPositive ? 'text-emerald-900 dark:text-emerald-300' : 'text-rose-900 dark:text-rose-300'
                    }`}>
                      Чистая прибыль
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">С учетом себестоимости и налога 6%</p>
                  <div className="pt-1">
                    <p className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${
                      isProfitPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {calculatedProfit.toLocaleString('ru')} ₽
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* CARD 3: CLIENT CHECK */}
            <div className="p-4 bg-gradient-to-br from-purple-50/90 via-purple-50/50 to-white dark:from-purple-950/40 dark:via-purple-950/20 dark:to-zinc-900 rounded-2xl border border-purple-200/90 dark:border-purple-800/60 shadow-2xs flex flex-col justify-between space-y-2">
              <div className="flex items-center gap-2 pb-1 border-b border-purple-100 dark:border-purple-900/50">
                <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-[#8C52D0] dark:text-purple-300 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <span className="text-[#582F89] dark:text-purple-300 font-bold uppercase text-[10px] tracking-wider">Чек клиента</span>
              </div>
              <p className="text-[11px] text-purple-800/80 dark:text-purple-300/80 font-medium">Сумма для сметы и договора:</p>
              <div className="pt-1">
                <div className="relative flex items-center">
                  {setFinalPrice ? (
                    <input
                      type="number"
                      value={finalPrice === 0 ? '' : finalPrice}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : Number(e.target.value);
                        setFinalPrice(val);
                      }}
                      className="w-full bg-white dark:bg-zinc-800 border border-[#8C52D0]/50 dark:border-purple-500/50 rounded-xl px-3 py-1.5 font-black font-mono text-xl sm:text-2xl text-[#582F89] dark:text-purple-100 focus:outline-none focus:ring-1 focus:ring-[#8C52D0] shadow-2xs transition-all"
                    />
                  ) : (
                    <div className="w-full bg-white dark:bg-zinc-800 border border-[#8C52D0]/50 dark:border-purple-500/50 rounded-xl px-3 py-1.5 font-black font-mono text-xl sm:text-2xl text-[#582F89] dark:text-purple-100 shadow-2xs">
                      {finalPrice.toLocaleString('ru')}
                    </div>
                  )}
                  <span className="absolute right-3 font-bold text-stone-500 dark:text-stone-300 text-lg sm:text-xl pointer-events-none">
                    ₽
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface JournalBlockProps {
  isOverview?: boolean;
  overviewCollapsed: { brief: boolean; design: boolean; calc: boolean; journal: boolean; docs: boolean };
  toggleOverviewSection: (key: 'brief' | 'design' | 'calc' | 'journal' | 'docs') => void;
  taskNoteList: any[];
  newType: 'task' | 'note';
  setNewType: (type: 'task' | 'note') => void;
  newTitle: string;
  setNewTitle: (title: string) => void;
  newDueDate: string;
  setNewDueDate: (date: string) => void;
  newCategory?: string;
  setNewCategory?: (cat: any) => void;
  journalFilterType?: 'all' | 'task' | 'note';
  setJournalFilterType?: (type: 'all' | 'task' | 'note') => void;
  selectedCalendarDate?: string;
  setSelectedCalendarDate?: (date: string) => void;
  handleAddTaskNote: () => void;
  handleToggleTaskNote: (id: string) => void;
  handleDeleteTaskNote: (id: string) => void;
}

export const JournalBlock: React.FC<JournalBlockProps> = ({
  isOverview = false,
  overviewCollapsed,
  toggleOverviewSection,
  taskNoteList,
  newType,
  setNewType,
  newTitle,
  setNewTitle,
  newDueDate,
  setNewDueDate,
  newCategory,
  setNewCategory,
  journalFilterType,
  setJournalFilterType,
  selectedCalendarDate,
  setSelectedCalendarDate,
  handleAddTaskNote,
  handleToggleTaskNote,
  handleDeleteTaskNote
}) => {
  const isCollapsed = isOverview && overviewCollapsed.journal;

  const [localCategory, setLocalCategory] = React.useState('Монтаж');
  const [localFilterType, setLocalFilterType] = React.useState<'all' | 'task' | 'note'>('all');
  const [localCalendarDate, setLocalCalendarDate] = React.useState('all');

  const currentCategory = newCategory !== undefined ? newCategory : localCategory;
  const changeCategory = setNewCategory || setLocalCategory;

  const currentFilterType = journalFilterType !== undefined ? journalFilterType : localFilterType;
  const changeFilterType = setJournalFilterType || setLocalFilterType;

  const currentCalendarDate = selectedCalendarDate !== undefined ? selectedCalendarDate : localCalendarDate;
  const changeCalendarDate = setSelectedCalendarDate || setLocalCalendarDate;

  const getCategoryStyle = (cat?: string) => {
    switch (cat) {
      case 'Монтаж': return 'bg-purple-100 text-[#582F89] dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/80';
      case 'Закупка': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/80';
      case 'Клиент': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/80';
      case 'Логистика': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/80';
      case 'Важное': return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/80';
      default: return 'bg-stone-100 text-stone-700 dark:bg-zinc-800 dark:text-zinc-300 border-stone-200';
    }
  };

  return (
    <div className={isOverview ? "bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] border border-zinc-200/50 dark:border-zinc-800/40 p-5 sm:p-6 shadow-xs transition-all space-y-6" : "space-y-6"}>
      {/* JOURNAL HEADER */}
      <div className={`flex items-center justify-between gap-4 ${isCollapsed ? '' : 'pb-4 border-b border-zinc-200/40 dark:border-zinc-800/40'}`}>
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="p-2 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Заметки и журнал задач
            </h3>
            <p className="text-xs sm:text-sm font-normal text-zinc-700 dark:text-zinc-300 leading-relaxed truncate">
              Чек-лист монтажа и оперативные поручения команде
            </p>
          </div>
        </div>

        {isOverview && (
          <button
            type="button"
            onClick={() => toggleOverviewSection('journal')}
            className="w-8 h-8 rounded-full text-zinc-700 dark:text-zinc-300 bg-white/70 dark:bg-zinc-800/70 border border-zinc-200/60 dark:border-zinc-700/60 hover:bg-purple-50 dark:hover:bg-purple-950/60 transition-all cursor-pointer flex items-center justify-center shrink-0"
            title={isCollapsed ? 'Развернуть' : 'Свернуть'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4 text-[#8C52D0]" /> : <ChevronUp className="w-4 h-4 text-[#8C52D0]" />}
          </button>
        )}
      </div>

      {!isCollapsed && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT COLUMN (~40% WIDTH): FORM TO CREATE TASK OR NOTE */}
          <div className="lg:col-span-5 bg-white/60 dark:bg-zinc-950/40 p-4 sm:p-5 rounded-2xl border border-stone-200/80 dark:border-zinc-800 backdrop-blur-xs space-y-4">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200/60 dark:border-zinc-800">
                <span className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-[#8C52D0]" /> Создать запись
                </span>
                {/* Type toggle */}
                <div className="flex bg-stone-100 dark:bg-zinc-800 p-0.5 rounded-full border border-stone-200 dark:border-zinc-700">
                  <button
                    type="button"
                    onClick={() => setNewType('task')}
                    style={newType === 'task' ? { background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' } : {}}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      newType === 'task'
                        ? 'text-white shadow-2xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                    }`}
                  >
                    Задача
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType('note')}
                    style={newType === 'note' ? { background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' } : {}}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      newType === 'note'
                        ? 'text-white shadow-2xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                    }`}
                  >
                    Заметка
                  </button>
                </div>
              </div>

              {/* Title input */}
              <div>
                <label className="block text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal mb-1">
                  {newType === 'task' ? 'Текст задачи' : 'Содержание заметки'}
                </label>
                <textarea
                  rows={3}
                  placeholder={newType === 'task' ? 'Заехать к флористу, подготовить неоновую вывеску, заказать декор...' : 'Важные примечания по монтажу, пожелания заказчика...'}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#8C52D0]"
                />
              </div>

              {/* Date and Category row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal mb-1">Дата выполнения</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-stone-800 dark:text-stone-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal mb-1">Категория</label>
                  <select
                    value={currentCategory}
                    onChange={(e) => changeCategory(e.target.value as any)}
                    className="w-full bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-stone-800 dark:text-stone-100 focus:outline-none cursor-pointer"
                  >
                    <option value="Монтаж">Монтаж</option>
                    <option value="Закупка">Закупка</option>
                    <option value="Смета">Смета</option>
                    <option value="Логистика">Логистика</option>
                    <option value="Клиент">Клиент</option>
                    <option value="Важное">Важное</option>
                    <option value="Общее">Общее</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit button - sits directly under the inputs */}
            <button
              type="button"
              onClick={handleAddTaskNote}
              className="w-full py-2.5 text-white rounded-full text-xs font-semibold transition-all duration-300 hover:shadow-md hover:opacity-95 active:scale-[0.99] cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
              style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Добавить {newType === 'task' ? 'задачу' : 'заметку'}</span>
            </button>
          </div>

          {/* RIGHT COLUMN (~60% WIDTH): FILTER TABS & TASK/NOTE RECORDS LIST */}
          <div className="lg:col-span-7 bg-white/40 dark:bg-zinc-950/20 p-4 sm:p-5 rounded-2xl border border-stone-200/80 dark:border-zinc-800 backdrop-blur-xs space-y-3.5 flex flex-col">
            
            {/* Filter Controls Header */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-stone-200/60 dark:border-zinc-800">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full">
                <button
                  type="button"
                  onClick={() => changeFilterType('all')}
                  style={currentFilterType === 'all' ? { background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' } : {}}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    currentFilterType === 'all'
                      ? 'text-white shadow-2xs'
                      : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                  }`}
                >
                  Все записи ({taskNoteList.length})
                </button>
                <button
                  type="button"
                  onClick={() => changeFilterType('task')}
                  style={currentFilterType === 'task' ? { background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' } : {}}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    currentFilterType === 'task'
                      ? 'text-white shadow-2xs'
                      : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                  }`}
                >
                  Задачи ({taskNoteList.filter(i => i.type === 'task').length})
                </button>
                <button
                  type="button"
                  onClick={() => changeFilterType('note')}
                  style={currentFilterType === 'note' ? { background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' } : {}}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    currentFilterType === 'note'
                      ? 'text-white shadow-2xs'
                      : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                  }`}
                >
                  Заметки ({taskNoteList.filter(i => i.type === 'note').length})
                </button>
              </div>

              {currentCalendarDate !== 'all' && (
                <button
                  type="button"
                  onClick={() => changeCalendarDate('all')}
                  className="text-[10px] font-bold text-[#582F89] dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-800 hover:bg-purple-100 cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-2.5 h-2.5" /> Сбросить дату: {currentCalendarDate}
                </button>
              )}
            </div>

            {/* Scrollable Records List */}
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1 flex-1 custom-scrollbar">
              {(() => {
                const filtered = taskNoteList.filter(item => {
                  if (currentFilterType !== 'all' && item.type !== currentFilterType) return false;
                  if (currentCalendarDate !== 'all') {
                    const dayPart = currentCalendarDate.split('-')[2];
                    if (item.dueDate) {
                      return item.dueDate.endsWith(dayPart) || item.dueDate === currentCalendarDate;
                    }
                    return false;
                  }
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-8 text-center bg-stone-50/50 dark:bg-zinc-950/20 rounded-2xl border border-dashed border-stone-200 dark:border-zinc-800 text-stone-400 space-y-1">
                      <CheckSquare className="w-6 h-6 mx-auto opacity-40 mb-1" />
                      <p className="text-xs font-semibold">Нет записей в журнале</p>
                    </div>
                  );
                }

                return filtered.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex flex-col gap-2.5 ${
                      item.completed
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200/50 dark:border-emerald-900/30'
                        : 'bg-white/80 dark:bg-zinc-900/80 border-stone-200/80 dark:border-zinc-800 shadow-2xs hover:border-purple-300'
                    }`}
                  >
                    {/* Top row: Checkbox/Icon + full-width text */}
                    <div className="flex items-start gap-2.5 min-w-0 w-full">
                      {item.type === 'task' ? (
                        <button
                          type="button"
                          onClick={() => handleToggleTaskNote(item.id)}
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer mt-0.5 ${
                            item.completed
                              ? 'bg-emerald-500 text-white'
                              : 'bg-stone-100 dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 text-transparent hover:border-[#8C52D0]'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </button>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                          <FileText className="w-3 h-3" />
                        </div>
                      )}

                      <p className={`text-xs font-medium leading-snug flex-1 min-w-0 ${item.completed ? 'line-through text-stone-400 dark:text-stone-500' : 'text-stone-800 dark:text-stone-100'}`}>
                        {item.title}
                      </p>
                    </div>

                    {/* Bottom row: Badges on left, Trash button on bottom right */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-100 dark:border-zinc-800/60">
                      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${
                          item.type === 'task' ? 'bg-purple-50 text-[#582F89] border-purple-200 dark:bg-purple-950/40 dark:text-purple-300' : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                        }`}>
                          {item.type === 'task' ? 'Задача' : 'Заметка'}
                        </span>

                        {item.category && (
                          <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryStyle(item.category)}`}>
                            {item.category}
                          </span>
                        )}

                        {item.dueDate && (
                          <span className="text-[9px] font-normal text-stone-600 dark:text-stone-400">
                            🕒 {item.dueDate}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteTaskNote(item.id)}
                        className="p-1 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-all cursor-pointer shrink-0"
                        title="Удалить запись"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface DocsBlockProps {
  isOverview?: boolean;
  overviewCollapsed: { brief: boolean; design: boolean; calc: boolean; journal: boolean; docs: boolean };
  toggleOverviewSection: (key: 'brief' | 'design' | 'calc' | 'journal' | 'docs') => void;
  showToast?: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export const DocsBlock: React.FC<DocsBlockProps> = ({
  isOverview = false,
  overviewCollapsed,
  toggleOverviewSection,
  showToast
}) => {
  const isCollapsed = isOverview && overviewCollapsed.docs;

  return (
    <div className={isOverview ? "bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] border border-zinc-200/50 dark:border-zinc-800/40 p-5 sm:p-6 shadow-xs transition-all space-y-6" : "space-y-6"}>
      {/* DOCS HEADER */}
      <div className={`flex items-center justify-between gap-4 ${isCollapsed ? '' : 'pb-4 border-b border-zinc-200/40 dark:border-zinc-800/40'}`}>
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="p-2 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Документы и договоры
            </h3>
            <p className="text-xs sm:text-sm font-normal text-zinc-700 dark:text-zinc-300 leading-relaxed truncate">
              Договоры, акты приема-передачи и чеки оплаты
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isCollapsed && (
            <button
              onClick={() => showToast?.('Генерация пакета', 'Создается комплект документов в PDF...', 'success')}
              className="w-8 h-8 rounded-full text-white flex items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-105 active:scale-95 shadow-xs shrink-0"
              style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
              title="Сгенерировать документы"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </button>
          )}

          {isOverview && (
            <button
              type="button"
              onClick={() => toggleOverviewSection('docs')}
              className="w-8 h-8 rounded-full text-zinc-700 dark:text-zinc-300 bg-white/70 dark:bg-zinc-800/70 border border-zinc-200/60 dark:border-zinc-700/60 hover:bg-purple-50 dark:hover:bg-purple-950/60 transition-all cursor-pointer flex items-center justify-center shrink-0"
              title={isCollapsed ? 'Развернуть' : 'Свернуть'}
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4 text-[#8C52D0]" /> : <ChevronUp className="w-4 h-4 text-[#8C52D0]" />}
            </button>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              id: 'decor-contract',
              title: 'Договор на декор',
              code: '№ ДК-2026/08',
              date: '01.08.2026',
              size: '2.4 МБ',
              desc: 'Договор оказания услуг по оформлению и декорированию площадки',
              icon: FileText,
              iconBg: 'bg-purple-100 dark:bg-purple-950/80 text-[#8C52D0] dark:text-purple-300 border-purple-200 dark:border-purple-800',
              accentColor: 'from-purple-500/10 to-transparent'
            },
            {
              id: 'deposit-agreement',
              title: 'Соглашение о задатке',
              code: '№ СЗ-2026/08',
              date: '01.08.2026',
              size: '1.1 МБ',
              desc: 'Гарантийная сумма бронирования даты (30 000 ₽)',
              icon: ShieldCheck,
              iconBg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
              accentColor: 'from-amber-500/10 to-transparent'
            },
            {
              id: 'acceptance-act',
              title: 'Акт сдачи-приёмки',
              code: '№ АКТ-2026/15',
              date: 'В процессе',
              size: '850 КБ',
              desc: 'Акт приемки выполненных декораторских работ',
              icon: FileCheck,
              iconBg: 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
              accentColor: 'from-blue-500/10 to-transparent'
            },
            {
              id: 'pd-consent',
              title: 'Согласие на обработку ПД',
              code: '№ ОПД-2026/01',
              date: '01.08.2026',
              size: '420 КБ',
              desc: 'Согласие 152-ФЗ и разрешение на фотосъемку декора',
              icon: FileSignature,
              iconBg: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
              accentColor: 'from-indigo-500/10 to-transparent'
            }
          ].map((doc) => {
            const DocIcon = doc.icon;
            return (
              <div
                key={doc.id}
                className="group relative p-4 bg-white/80 dark:bg-zinc-950/60 rounded-2xl border border-stone-200/80 dark:border-zinc-800 flex flex-col justify-between gap-3 text-left backdrop-blur-xs transition-all duration-300 hover:shadow-md hover:border-purple-300/80 dark:hover:border-purple-800 overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${doc.accentColor} rounded-bl-full pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity`} />

                <div className="space-y-2.5 relative z-10">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs ${doc.iconBg}`}>
                      <DocIcon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400 font-normal uppercase tracking-normal block leading-tight mb-0.5">
                        {doc.code}
                      </span>
                      <h4 className="font-semibold text-sm text-stone-900 dark:text-stone-100 group-hover:text-[#8C52D0] dark:group-hover:text-purple-300 transition-colors leading-snug">
                        {doc.title}
                      </h4>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-700 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                    {doc.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 dark:border-zinc-800/80 flex items-center justify-between gap-2 relative z-10">
                  <div className="text-[10px] text-stone-400 font-mono space-x-1.5">
                    <span className="font-bold text-stone-500 dark:text-stone-400">PDF</span>
                    <span>•</span>
                    <span>{doc.size}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => showToast?.('Просмотр документа', `Открываем ${doc.title}...`, 'info')}
                      className="p-1.5 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-stone-500 hover:text-[#582F89] dark:hover:text-purple-300 rounded-lg transition-colors cursor-pointer"
                      title="Просмотреть"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => showToast?.('Скачивание', `Загрузка файла ${doc.title}...`, 'success')}
                      className="p-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-stone-500 hover:text-emerald-600 dark:hover:text-emerald-300 rounded-lg transition-colors cursor-pointer"
                      title="Скачать PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
