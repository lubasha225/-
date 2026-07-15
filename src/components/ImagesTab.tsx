import React, { useState, useEffect } from 'react';
import { UploadCloud, Trash2, Plus, Pencil, Check, X } from 'lucide-react';
import { ImageItem } from '../types';

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
  
  // Custom categories state
  const [customCategories, setCustomCategories] = useState<CategoryItem[]>(() => {
    const saved = localStorage.getItem('pop_image_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  // Adding/Editing categories state
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryKey, setEditingCategoryKey] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  // Persist categories
  useEffect(() => {
    localStorage.setItem('pop_image_categories', JSON.stringify(customCategories));
  }, [customCategories]);

  const getCategoryCount = (catKey: string) => {
    if (catKey === 'all') return images.length;
    return images.filter(img => img.category === catKey).length;
  };

  const handleCategoryChange = (imgId: string, newCategory: string) => {
    const updated = images.map(img => img.id === imgId ? { ...img, category: newCategory } : img);
    onUpdateImages(updated);
    showToast('Категория изменена', 'Категория изображения успешно обновлена.', 'success');
  };

  const handleDeleteImage = (imgId: string) => {
    const updated = images.filter(img => img.id !== imgId);
    onUpdateImages(updated);
    showToast('Изображение удалено', 'Изображение успешно удалено из галереи.', 'info');
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
        <label className="shrink-0 bg-[var(--lavDeep)] hover:bg-[var(--lavDeep)]/90 text-white rounded-xl px-5 py-3 text-[13px] font-medium shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">
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
  }, [setHeaderActions, images, selectedCategory, customCategories]);

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
    const updatedCats = customCategories.filter(cat => cat.key !== key);
    setCustomCategories(updatedCats);
    
    // Reset images belonging to this deleted category to general or another valid category
    const fallbackCat = updatedCats.length > 0 ? updatedCats[0].key : 'all';
    const updatedImages = images.map(img => 
      img.category === key ? { ...img, category: fallbackCat } : img
    );
    onUpdateImages(updatedImages);
    setSelectedCategory('all');
    showToast('Категория удалена', `Категория "${label}" была удалена.`, 'info');
  };

  const filteredImages = images.filter(img => selectedCategory === 'all' || img.category === selectedCategory);

  // Helper list to map categories for rendering tabs
  const allCategoriesList = [
    { key: 'all', label: 'Все фото' },
    ...customCategories
  ];

  return (
    <div className="space-y-6">
      {/* Categories Bar */}
      <div className="flex flex-wrap gap-2 items-center bg-white/10 dark:bg-zinc-900/5 p-3 rounded-2xl border border-[var(--glass-edge)]/40 justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          {allCategoriesList.map((cat) => {
            const count = getCategoryCount(cat.key);
            const isActive = selectedCategory === cat.key;
            const isEditing = editingCategoryKey === cat.key;

            if (isEditing) {
              return (
                <form
                  key={cat.key}
                  onSubmit={(e) => handleRenameCategorySubmit(e, cat.key)}
                  className="flex items-center gap-1.5 bg-white dark:bg-zinc-800 px-3.5 py-1.5 rounded-full border border-[var(--lavenderAccent)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="text"
                    value={editingCategoryName}
                    onChange={(e) => setEditingCategoryName(e.target.value)}
                    className="text-xs bg-transparent text-[var(--ink)] focus:outline-none w-24 font-semibold"
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

            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border-zinc-900 dark:border-zinc-100'
                    : 'bg-white/30 dark:bg-zinc-800/30 border-zinc-200/50 dark:border-zinc-800/40 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`inline-flex items-center justify-center rounded-full text-[10px] font-bold min-w-[18px] h-[18px] px-1.5 transition-all ${
                  isActive
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white'
                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}>
                  {count}
                </span>

                {/* Inline Editing Controls for active custom category */}
                {isActive && cat.key !== 'all' && (
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
              className="glass-panel rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 relative aspect-square group"
            >
              {/* Photo Box (1:1 aspect square) */}
              <div className="absolute inset-0 w-full h-full overflow-hidden bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center">
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
                <div className="flex-1 min-w-0">
                  <select
                    value={img.category}
                    onChange={(e) => handleCategoryChange(img.id, e.target.value)}
                    className="text-[11px] bg-black/50 hover:bg-black/70 text-white border border-white/10 backdrop-blur-md rounded-xl px-2 py-1.5 focus:outline-none focus:border-[var(--lavenderAccent)] font-medium cursor-pointer w-full transition-all [&>option]:bg-zinc-950 [&>option]:text-white"
                  >
                    {customCategories.map((cat) => (
                      <option key={cat.key} value={cat.key}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => handleDeleteImage(img.id)}
                  className="p-2 text-rose-200 hover:text-white bg-black/50 hover:bg-rose-600/70 rounded-xl border border-white/10 backdrop-blur-md transition-all cursor-pointer shrink-0"
                  title="Удалить"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
