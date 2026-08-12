import React, { useState, useEffect } from 'react';
import { UploadCloud, Trash2, Plus, Pencil, Check, X, ChevronDown, Sparkles, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageItem } from '../types';
import DeleteConfirmModal from './DeleteConfirmModal';

interface CategoryItem {
  key: string;
  label: string;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { key: 'arches', label: 'Арки и фотозоны' },
  { key: 'tables', label: 'Гостевые столы' },
  { key: 'bouquets', label: 'Флористика' },
  { key: 'render', label: '3D Эскизы' }
];

interface ImagesTabProps {
  images: ImageItem[];
  onUpdateImages: (updated: ImageItem[]) => void;
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warn') => void;
  setHeaderActions?: (actions: React.ReactNode) => void;
}

export default function ImagesTab({ images, onUpdateImages, showToast, setHeaderActions }: ImagesTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeDropdownImageId, setActiveDropdownImageId] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<ImageItem | null>(null);

  // Delete confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    title?: string;
    itemName?: string;
    description?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    onConfirm: () => {}
  });
  
  // Custom categories state
  const [customCategories, setCustomCategories] = useState<CategoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('pop_image_categories');
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch (e) {
      return DEFAULT_CATEGORIES;
    }
  });

  // Adding/Editing categories state
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryKey, setEditingCategoryKey] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  // Persist categories
  useEffect(() => {
    try {
      localStorage.setItem('pop_image_categories', JSON.stringify(customCategories));
    } catch (e) {
      console.warn('Failed to save image categories:', e);
    }
  }, [customCategories]);

  const handleCategoryChange = (imgId: string, newCategory: string) => {
    const updated = images.map(img => img.id === imgId ? { ...img, category: newCategory } : img);
    onUpdateImages(updated);
    showToast('Категория изменена', 'Категория изображения успешно обновлена.', 'success');
  };

  const handleDeleteImage = (img: ImageItem) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Удалить изображение?',
      itemName: img.title || 'Изображение',
      description: 'Вы действительно хотите удалить это изображение из галереи? Действие нельзя отменить.',
      onConfirm: () => {
        const updated = images.filter(i => i.id !== img.id);
        onUpdateImages(updated);
        showToast('Изображение удалено', 'Изображение успешно удалено из галереи.', 'info');
        setDeleteConfirm(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      
      // Determine what category key to assign (use first custom category if 'all' is active)
      let fallbackCat = 'arches';
      if (customCategories.length > 0) {
        fallbackCat = customCategories[0].key;
      }

      const newImage: ImageItem = {
        id: 'img_' + Date.now(),
        title: file.name.split('.')[0] || 'Новое фото',
        url: url,
        category: selectedCategory === 'all' ? fallbackCat : selectedCategory,
        bgRemoved: false
      };
      onUpdateImages([newImage, ...images]);
      showToast('Фото загружено', 'Новое изображение добавлено в вашу галерею.', 'success');
    }
  };

  // Bind/Update Header Action button
  useEffect(() => {
    if (setHeaderActions) {
      setHeaderActions(
        <label className="shrink-0 bg-gradient-to-r from-[#8C52D0] to-[#582F89] hover:opacity-95 text-white rounded-full px-5 py-3 text-[13px] font-medium shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">
          <UploadCloud className="w-4 h-4 shrink-0" />
          <span>Загрузить фото</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUploadPhoto}
          />
        </label>
      );
    }
    return () => {
      if (setHeaderActions) {
        setHeaderActions(null);
      }
    };
  }, [setHeaderActions]);

  // Add new category
  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const key = 'cat_' + Date.now();
    const newCat: CategoryItem = {
      key,
      label: newCategoryName.trim()
    };
    const updated = [...customCategories, newCat];
    setCustomCategories(updated);
    setNewCategoryName('');
    setIsAddingCategory(false);
    setSelectedCategory(key);
    showToast('Категория добавлена', `Категория "${newCat.label}" успешно создана.`, 'success');
  };

  // Rename category
  const handleRenameCategorySubmit = (e: React.FormEvent, key: string) => {
    e.preventDefault();
    if (!editingCategoryName.trim()) {
      setEditingCategoryKey(null);
      return;
    }
    const updated = customCategories.map(cat => 
      cat.key === key ? { ...cat, label: editingCategoryName.trim() } : cat
    );
    setCustomCategories(updated);
    setEditingCategoryKey(null);
    showToast('Категория изменена', 'Название категории успешно обновлено.', 'success');
  };

  // Delete category
  const handleDeleteCategory = (key: string, label: string) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Удалить категорию?',
      itemName: label,
      description: `Вы действительно хотите удалить категорию «${label}»? Изображения из нее будут перемещены в общую галерею.`,
      onConfirm: () => {
        const updatedCats = customCategories.filter(cat => cat.key !== key);
        setCustomCategories(updatedCats);
        
        const fallbackCat = updatedCats.length > 0 ? updatedCats[0].key : 'all';
        const updatedImages = images.map(img => 
          img.category === key ? { ...img, category: fallbackCat } : img
        );
        onUpdateImages(updatedImages);
        if (selectedCategory === key) {
          setSelectedCategory('all');
        }
        showToast('Категория удалена', `Категория "${label}" была удалена.`, 'info');
        setDeleteConfirm(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const getCategoryCount = (catKey: string) => {
    if (catKey === 'all') return images.length;
    if (catKey === 'ai_fiolet') return images.filter(img => img.isAiGenerated).length;
    return images.filter(img => img.category === catKey).length;
  };

  const filteredImages = images.filter(img => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'ai_fiolet') return img.isAiGenerated === true;
    return img.category === selectedCategory;
  });

  // Helper list to map categories for rendering tabs
  const allCategoriesList: { key: string; label: string; isSpecial?: boolean }[] = [
    { key: 'all', label: 'Все фото' },
    { key: 'ai_fiolet', label: 'Создано ИИ', isSpecial: true },
    ...customCategories
  ];

  return (
    <div className="space-y-6">
      {/* Categories Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full sm:flex-wrap">
          {allCategoriesList.map((cat) => {
            const count = getCategoryCount(cat.key);
            const isActive = selectedCategory === cat.key;
            const isEditing = editingCategoryKey === cat.key;

            if (isEditing) {
              return (
                <form
                  key={cat.key}
                  onSubmit={(e) => handleRenameCategorySubmit(e, cat.key)}
                  className="flex items-center gap-1 bg-white dark:bg-zinc-800 px-3 py-1 rounded-full border border-[var(--lavenderAccent)] shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="text"
                    value={editingCategoryName}
                    onChange={(e) => setEditingCategoryName(e.target.value)}
                    className="text-xs bg-transparent text-[var(--ink)] focus:outline-none w-20 font-semibold"
                    autoFocus
                    onBlur={() => setEditingCategoryKey(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setEditingCategoryKey(null);
                    }}
                  />
                  <button type="submit" className="text-green-500 hover:text-green-600 transition-colors cursor-pointer">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => setEditingCategoryKey(null)} className="text-rose-500 hover:text-rose-600 transition-colors cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              );
            }

            if (cat.isSpecial) {
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`rounded-full text-xs font-semibold tracking-tight transition-all flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap shadow-xs px-3 py-1 bg-white dark:bg-zinc-900 border ${
                    isActive
                      ? 'border-[#8C52D0] ring-2 ring-[#8C52D0]/30 text-[#8C52D0]'
                      : 'border-zinc-200 dark:border-zinc-800 text-[#8C52D0] hover:border-[#8C52D0]/60'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#8C52D0] shrink-0" />
                  <span>Создано ИИ</span>
                  <span className="inline-flex items-center justify-center rounded-full text-[10px] font-bold min-w-[18px] h-4.5 px-1.5 bg-[#8C52D0]/10 text-[#8C52D0]">
                    {count}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`rounded-full text-xs font-semibold tracking-tight transition-all flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-[#8C52D0] to-[#582F89] text-white shadow-xs px-3 py-1'
                    : 'bg-transparent border-transparent text-[var(--soft)] hover:text-[var(--ink)] hover:bg-black/5 dark:hover:bg-white/5 px-2.5 py-1'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`inline-flex items-center justify-center rounded-full text-[10px] font-bold min-w-[18px] h-4.5 px-1.5 transition-all ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-[var(--lavenderSoft)] text-[var(--lavDeep)] dark:bg-purple-950/60 dark:text-[var(--lavenderAccent)]'
                }`}>
                  {count}
                </span>

                {/* Inline Editing Controls for active custom category */}
                {isActive && cat.key !== 'all' && !cat.isSpecial && (
                  <div className="flex items-center gap-1 border-l border-white/20 dark:border-zinc-300/30 pl-1.5 ml-0.5">
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCategoryKey(cat.key);
                        setEditingCategoryName(cat.label);
                      }}
                      className="p-0.5 hover:bg-white/20 dark:hover:bg-black/10 rounded transition-all text-white/80 hover:text-white dark:text-zinc-800/80 dark:hover:text-zinc-900"
                      title="Редактировать название"
                    >
                      <Pencil className="w-3 h-3" />
                    </span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(cat.key, cat.label);
                      }}
                      className="p-0.5 hover:bg-rose-500/30 rounded transition-all text-rose-300 hover:text-rose-100 dark:text-rose-600 dark:hover:text-rose-800"
                      title="Удалить категорию"
                    >
                      <Trash2 className="w-3 h-3" />
                    </span>
                  </div>
                )}
              </button>
            );
          })}

          {/* Add Category inline button */}
          {isAddingCategory ? (
            <form onSubmit={handleAddCategorySubmit} className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 animate-fadeIn">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Новая категория..."
                className="text-xs bg-transparent text-[var(--ink)] focus:outline-none w-28 font-medium px-1"
                autoFocus
                onBlur={() => {
                  // Slight delay to allow clicking checkmark before blur removes field
                  setTimeout(() => {
                    if (!newCategoryName.trim()) {
                      setIsAddingCategory(false);
                    }
                  }, 200);
                }}
              />
              <button type="submit" className="text-green-500 hover:text-green-600 p-0.5 cursor-pointer">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button type="button" onClick={() => setIsAddingCategory(false)} className="text-rose-500 hover:text-rose-600 p-0.5 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingCategory(true)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold border border-dashed border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Категория</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid containing cards */}
      {filteredImages.length === 0 ? (
        <div className="py-16 text-center text-[var(--faint)] text-xs tracking-wide">
          В выбранной категории нет изображений.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full animate-fadeIn">
          {filteredImages.map((img) => (
            <div
              key={img.id}
              className={`glass-panel rounded-2xl border border-zinc-100 dark:border-zinc-800 relative aspect-square group transition-all duration-300 ${
                activeDropdownImageId === img.id ? 'z-30 overflow-visible' : 'overflow-hidden'
              }`}
            >
              {/* Top badges and actions */}
              <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between pointer-events-none gap-2">
                {img.projectName ? (
                  <span className="bg-black/65 backdrop-blur-md text-white text-[9px] font-semibold px-2 py-0.5 rounded-md truncate shadow-sm">
                    {img.projectName}
                  </span>
                ) : <div />}
                <div className="flex items-center gap-1.5 pointer-events-auto">
                  {img.isAiGenerated && (
                    <span className="bg-violet-600/90 backdrop-blur-md text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 shrink-0">
                      <Sparkles className="w-2.5 h-2.5 text-white animate-pulse" />
                      <span>ИИ</span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setZoomedImage(img);
                    }}
                    className="p-1.5 rounded-lg bg-black/60 hover:bg-black/85 text-white border border-white/15 backdrop-blur-md shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
                    title="Увеличить"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Photo Box (1:1 aspect square) */}
              <div className="absolute inset-0 w-full h-full overflow-hidden bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center rounded-2xl">
                {img.bgRemoved ? (
                  <div className="absolute inset-0 bg-[radial-gradient(#ddd_1px,transparent_1px)] dark:bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:12px_12px] bg-white dark:bg-zinc-950 z-0" />
                ) : null}

                <img
                  src={img.url}
                  alt={img.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover relative z-5 transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Overlay controls - absolute positioned at the bottom, transparent container with floating styled elements */}
              <div className="absolute bottom-0 inset-x-0 p-2.5 z-10 flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0 relative">
                  <button
                    type="button"
                    onClick={() => setActiveDropdownImageId(activeDropdownImageId === img.id ? null : img.id)}
                    className="text-[11px] bg-black/55 hover:bg-black/75 text-white border border-white/10 backdrop-blur-md rounded-xl px-2.5 py-1.5 focus:outline-none font-semibold cursor-pointer w-full transition-all flex items-center justify-between gap-1 text-left"
                  >
                    <span className="truncate">
                      {customCategories.find(c => c.key === img.category)?.label || img.category}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-white/70 transition-transform duration-200 shrink-0 ${activeDropdownImageId === img.id ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {activeDropdownImageId === img.id && (
                      <>
                        {/* Overlay to catch clicks outside to close */}
                        <div className="fixed inset-0 z-40" onClick={() => setActiveDropdownImageId(null)} />
                        <motion.div
                          initial={{ opacity: 0, y: 5, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute bottom-10 left-0 right-0 bg-zinc-900/90 dark:bg-zinc-950/90 backdrop-blur-md border border-white/10 rounded-xl p-1 shadow-xl z-50 overflow-hidden max-h-36 overflow-y-auto"
                        >
                          {customCategories.map((cat) => {
                            const isSelected = img.category === cat.key;
                            return (
                              <button
                                key={cat.key}
                                type="button"
                                onClick={() => {
                                  handleCategoryChange(img.id, cat.key);
                                  setActiveDropdownImageId(null);
                                }}
                                className={`w-full text-left px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-all flex items-center justify-between cursor-pointer ${
                                  isSelected
                                    ? 'bg-[var(--lavDeep)] text-white'
                                    : 'text-zinc-200 hover:bg-[var(--lavDeep)]/40 hover:text-white'
                                }`}
                              >
                                <span className="truncate">{cat.label}</span>
                                {isSelected && <Check className="w-3 h-3 text-white shrink-0" />}
                              </button>
                            );
                          })}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={() => handleDeleteImage(img)}
                  className="p-2 text-rose-200 hover:text-white bg-black/50 hover:bg-rose-600/70 rounded-full border border-white/10 backdrop-blur-md transition-all cursor-pointer shrink-0"
                  title="Удалить"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      <AnimatePresence>
        {zoomedImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setZoomedImage(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative max-w-4xl w-full max-h-[85vh] bg-zinc-950/80 backdrop-blur-2xl rounded-3xl border border-white/20 dark:border-zinc-700/80 overflow-hidden flex flex-col shadow-2xl z-10"
              style={{
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setZoomedImage(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white/80 hover:text-white border border-white/10 backdrop-blur-md transition-all cursor-pointer z-20"
                title="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Image Container */}
              <div className="flex-1 overflow-auto flex items-center justify-center bg-zinc-950 p-4 min-h-0">
                <img
                  src={zoomedImage.url}
                  alt={zoomedImage.title}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg select-none"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Footer / Description */}
              <div className="bg-zinc-900 px-6 py-4 border-t border-zinc-800 text-left">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-100 truncate">
                      {zoomedImage.title || 'Изображение'}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      Категория: {customCategories.find(c => c.key === zoomedImage.category)?.label || zoomedImage.category}
                    </p>
                    {zoomedImage.projectName && (
                      <span className="inline-block mt-1 text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-medium">
                        Проект: {zoomedImage.projectName}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {zoomedImage.isAiGenerated && (
                      <span className="bg-violet-600/90 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 shrink-0">
                        <Sparkles className="w-3 h-3 text-white animate-pulse" />
                        <span>Сгенерировано ИИ</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        isOpen={deleteConfirm.isOpen}
        title={deleteConfirm.title}
        itemName={deleteConfirm.itemName}
        description={deleteConfirm.description}
        onClose={() => setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}
        onConfirm={deleteConfirm.onConfirm}
      />
    </div>
  );
}
