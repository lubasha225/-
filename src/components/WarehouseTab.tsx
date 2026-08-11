import React, { useState, useEffect } from 'react';
import { Search, Plus, Check, X, Layers, Percent, Package, ArrowUpRight, ArrowDownLeft, LayoutGrid, List, Pencil, Upload, Image as ImageIcon, Trash2, Sparkles, Sliders, RotateCcw, Loader2 } from 'lucide-react';
import { WarehouseItem } from '../types';
import DeleteConfirmModal from './DeleteConfirmModal';

interface CategoryItem {
  key: string;
  label: string;
}

const DEFAULT_WAREHOUSE_CATEGORIES: CategoryItem[] = [
  { key: 'Конструкции', label: 'Конструкции' },
  { key: 'Вазы и посуда', label: 'Вазы и посуда' },
  { key: 'Текстиль', label: 'Текстиль' },
  { key: 'Освещение', label: 'Освещение' },
  { key: 'Декор', label: 'Декор' }
];

interface WarehouseTabProps {
  items: WarehouseItem[];
  onUpdateItems: (updated: WarehouseItem[]) => void;
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warn') => void;
  isAdding?: boolean;
  setIsAdding?: (val: boolean) => void;
}

const getCategoryPhoto = (category: string, name: string) => {
  const normCat = category.toLowerCase();
  const normName = name.toLowerCase();
  
  if (normCat.includes('конструк') || normName.includes('арка')) {
    return 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400';
  }
  if (normCat.includes('ваз') || normCat.includes('посуд') || normName.includes('кашпо') || normName.includes('ваза')) {
    return 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&q=80&w=400';
  }
  if (normCat.includes('текстиль') || normName.includes('скатерть') || normName.includes('салфет')) {
    return 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400';
  }
  if (normCat.includes('освещ') || normName.includes('гирлянд') || normName.includes('прожект') || normName.includes('неон')) {
    return 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=400';
  }
  return 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=400';
};

const removeBackgroundWithCanvas = (
  base64OrUrl: string,
  tolerance: number,
  onComplete: (transparentBase64: string) => void,
  onError?: (err: any) => void
) => {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Sample average of 4 corners as background color
      const cornerPixels = [
        { r: data[0], g: data[1], b: data[2] },
        { r: data[(canvas.width - 1) * 4], g: data[(canvas.width - 1) * 4 + 1], b: data[(canvas.width - 1) * 4 + 2] },
        { r: data[(canvas.height - 1) * canvas.width * 4], g: data[(canvas.height - 1) * canvas.width * 4 + 1], b: data[(canvas.height - 1) * canvas.width * 4 + 2] },
        { r: data[(canvas.height * canvas.width - 1) * 4], g: data[(canvas.height * canvas.width - 1) * 4 + 1], b: data[(canvas.height * canvas.width - 1) * 4 + 2] }
      ];

      const targetR = cornerPixels[0].r;
      const targetG = cornerPixels[0].g;
      const targetB = cornerPixels[0].b;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const distance = Math.sqrt(
          (r - targetR) ** 2 +
          (g - targetG) ** 2 +
          (b - targetB) ** 2
        );

        if (distance < tolerance) {
          data[i + 3] = 0; // Set transparent
        }
      }

      ctx.putImageData(imageData, 0, 0);
      onComplete(canvas.toDataURL('image/png'));
    } catch (e) {
      if (onError) onError(e);
    }
  };
  img.onerror = (e) => {
    if (onError) onError(e);
  };
  img.src = base64OrUrl;
};

export default function WarehouseTab({
  items,
  onUpdateItems,
  showToast,
  isAdding: isAddingProp,
  setIsAdding: setIsAddingProp
}: WarehouseTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [localIsAdding, setLocalIsAdding] = useState(false);
  const isAdding = isAddingProp !== undefined ? isAddingProp : localIsAdding;
  const setIsAdding = setIsAddingProp !== undefined ? setIsAddingProp : setLocalIsAdding;
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // New item states
  const [newItemName, setNewItemName] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemCat, setNewItemCat] = useState('Конструкции');
  const [newItemQty, setNewItemQty] = useState(10);
  const [newItemPrice, setNewItemPrice] = useState(1000);
  const [newItemImageUrl, setNewItemImageUrl] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // AI Background Removal states
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [originalImgBeforeBgRemoval, setOriginalImgBeforeBgRemoval] = useState('');
  const [bgRemovalTolerance, setBgRemovalTolerance] = useState(30);
  const [hasRemovedBg, setHasRemovedBg] = useState(false);

  const handleBgRemoval = () => {
    if (!newItemImageUrl) return;
    setIsRemovingBg(true);
    
    const orig = originalImgBeforeBgRemoval || newItemImageUrl;
    if (!originalImgBeforeBgRemoval) {
      setOriginalImgBeforeBgRemoval(newItemImageUrl);
    }

    setTimeout(() => {
      removeBackgroundWithCanvas(orig, bgRemovalTolerance, (transparentBase64) => {
        setNewItemImageUrl(transparentBase64);
        setIsRemovingBg(false);
        setHasRemovedBg(true);
        showToast('Фон удален', 'ИИ успешно очистил фоновый цвет изображения.', 'success');
      }, (err) => {
        setIsRemovingBg(false);
        showToast('Сбой удаления фона', 'Для удаления фона используйте загруженное фото (с ПК/телефона), а не внешнюю ссылку.', 'warn');
      });
    }, 1500);
  };

  const handleRestoreOriginal = () => {
    if (originalImgBeforeBgRemoval) {
      setNewItemImageUrl(originalImgBeforeBgRemoval);
      setOriginalImgBeforeBgRemoval('');
      setHasRemovedBg(false);
      showToast('Сброшено', 'Восстановлено исходное изображение.', 'info');
    }
  };

  const handleToleranceChange = (newVal: number) => {
    setBgRemovalTolerance(newVal);
    if (originalImgBeforeBgRemoval) {
      removeBackgroundWithCanvas(originalImgBeforeBgRemoval, newVal, (transparentBase64) => {
        setNewItemImageUrl(transparentBase64);
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItemImageUrl(reader.result as string);
        showToast('Изображение загружено', 'Превью успешно добавлено.', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItemImageUrl(reader.result as string);
        showToast('Изображение загружено', 'Превью успешно добавлено.', 'success');
      };
      reader.readAsDataURL(file);
    } else {
      showToast('Ошибка', 'Пожалуйста, перетащите файл изображения.', 'warn');
    }
  };

  // Inline Price Editing States
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');

  // Inline Quantity Editing States
  const [editingQtyId, setEditingQtyId] = useState<string | null>(null);
  const [tempQty, setTempQty] = useState<string>('');

  // Delete item state
  const [deletingItem, setDeletingItem] = useState<{ id: string; name: string } | null>(null);

  // Custom categories state
  const [customCategories, setCustomCategories] = useState<CategoryItem[]>(() => {
    const saved = localStorage.getItem('pop_warehouse_categories');
    return saved ? JSON.parse(saved) : DEFAULT_WAREHOUSE_CATEGORIES;
  });

  // Adding/Editing categories state
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryKey, setEditingCategoryKey] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [deleteCategoryConfirm, setDeleteCategoryConfirm] = useState<{ key: string; label: string } | null>(null);

  // Persist categories
  useEffect(() => {
    localStorage.setItem('pop_warehouse_categories', JSON.stringify(customCategories));
  }, [customCategories]);

  const allCategoriesList: CategoryItem[] = [
    { key: 'all', label: 'Все товары' },
    ...customCategories
  ];

  const getCategoryCount = (catKey: string) => {
    if (catKey === 'all') return items.length;
    const catObj = customCategories.find(c => c.key === catKey);
    const catLabel = catObj ? catObj.label : catKey;
    return items.filter(item => item.category === catKey || item.category === catLabel).length;
  };

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
    showToast('Категория добавлена', `Категория «${newCat.label}» успешно создана.`, 'success');
  };

  // Rename category
  const handleRenameCategorySubmit = (e: React.FormEvent, key: string) => {
    e.preventDefault();
    if (!editingCategoryName.trim()) {
      setEditingCategoryKey(null);
      return;
    }
    const oldCat = customCategories.find(c => c.key === key);
    const oldLabel = oldCat ? oldCat.label : key;
    const newLabel = editingCategoryName.trim();

    const updatedCategories = customCategories.map(cat => 
      cat.key === key ? { ...cat, label: newLabel } : cat
    );
    setCustomCategories(updatedCategories);

    // Update existing items with old category name or key
    const updatedItems = items.map(item => {
      if (item.category === key || item.category === oldLabel) {
        return { ...item, category: newLabel };
      }
      return item;
    });
    onUpdateItems(updatedItems);

    setEditingCategoryKey(null);
    showToast('Категория изменена', 'Название категории успешно обновлено.', 'success');
  };

  // Delete category
  const handleDeleteCategory = (key: string, label: string) => {
    setDeleteCategoryConfirm({ key, label });
  };

  const confirmDeleteCategory = () => {
    if (!deleteCategoryConfirm) return;
    const { key, label } = deleteCategoryConfirm;

    const updatedCats = customCategories.filter(cat => cat.key !== key);
    setCustomCategories(updatedCats);

    if (selectedCategory === key) {
      setSelectedCategory('all');
    }

    setDeleteCategoryConfirm(null);
    showToast('Категория удалена', `Категория «${label}» успешно удалена.`, 'info');
  };

  // Rent out / Return simulation (In projects / on shelves)
  const handleRentToggle = (itemId: string, action: 'rent' | 'return') => {
    const updated = items.map(item => {
      if (item.id === itemId) {
        if (action === 'rent' && item.available > 0) {
          return { ...item, rented: item.rented + 1, available: item.available - 1 };
        } else if (action === 'return' && item.rented > 0) {
          return { ...item, rented: item.rented - 1, available: item.available + 1 };
        }
      }
      return item;
    });

    onUpdateItems(updated);
    const affectedItem = items.find(item => item.id === itemId);
    if (action === 'rent') {
      showToast('Задействовано в проекте', `1 ед. "${affectedItem?.name}" теперь используется в проектах.`, 'success');
    } else {
      showToast('Возвращено на склад', `1 ед. "${affectedItem?.name}" успешно возвращена на склад.`, 'info');
    }
  };

  // Save modified price
  const handleSavePrice = (itemId: string) => {
    const newPrice = Number(tempPrice);
    if (isNaN(newPrice) || newPrice < 0) {
      showToast('Ошибка изменения цены', 'Пожалуйста, введите корректную сумму.', 'warn');
      return;
    }

    const updated = items.map(item => {
      if (item.id === itemId) {
        return { ...item, pricePerDay: newPrice };
      }
      return item;
    });

    onUpdateItems(updated);
    setEditingPriceId(null);
    const affectedItem = items.find(item => item.id === itemId);
    showToast('Цена изменена', `Для "${affectedItem?.name}" установлена стоимость: ${newPrice.toLocaleString('ru')} ₽.`, 'success');
  };

  // Save modified quantity
  const handleSaveQty = (itemId: string) => {
    const newQty = parseInt(tempQty);
    if (isNaN(newQty) || newQty < 1) {
      showToast('Ошибка изменения количества', 'Количество должно быть не менее 1.', 'warn');
      return;
    }

    const updated = items.map(item => {
      if (item.id === itemId) {
        const rented = item.rented || 0;
        // Available cannot exceed new total or go below 0
        const newAvailable = Math.max(0, newQty - rented);
        return { 
          ...item, 
          total: newQty, 
          available: newAvailable 
        };
      }
      return item;
    });

    onUpdateItems(updated);
    setEditingQtyId(null);
    const affectedItem = items.find(item => item.id === itemId);
    showToast('Количество изменено', `Для "${affectedItem?.name}" установлено общее количество: ${newQty} шт.`, 'success');
  };

  // Delete item from warehouse
  const handleDeleteItem = (itemId: string, itemName: string) => {
    setDeletingItem({ id: itemId, name: itemName });
  };

  const confirmDeleteItem = () => {
    if (!deletingItem) return;
    const { id, name } = deletingItem;
    const updated = items.filter(item => item.id !== id);
    onUpdateItems(updated);
    setDeletingItem(null);
    showToast('Удалено', `Товар "${name}" удален из базы склада.`, 'info');
  };

  // Add Item
  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: WarehouseItem = {
      id: `wh_${Date.now()}`,
      name: newItemName,
      category: newItemCat,
      total: Number(newItemQty) || 1,
      rented: 0,
      available: Number(newItemQty) || 1,
      pricePerDay: Number(newItemPrice) || 0,
      description: newItemDescription.trim() || undefined,
      imageUrl: newItemImageUrl || undefined
    };

    onUpdateItems([newItem, ...items]);
    setNewItemName('');
    setNewItemDescription('');
    setNewItemImageUrl('');
    setIsAdding(false);
    showToast('Склад пополнен', `Товар "${newItem.name}" успешно занесен в базу.`, 'success');
  };

  const filteredItems = items.filter(item => {
    const activeCatObj = customCategories.find(c => c.key === selectedCategory);
    const matchesCategory = selectedCategory === 'all' || 
      item.category === selectedCategory || 
      (activeCatObj && item.category === activeCatObj.label);
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="space-y-4">
        {/* Row 1: Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1 max-w-full sm:flex-wrap">
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

            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`rounded-full text-xs font-semibold tracking-tight transition-all duration-200 cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-[#8C52D0] to-[#582F89] text-white shadow-xs px-3 py-1'
                    : 'bg-transparent text-[var(--soft)] hover:text-[var(--ink)] hover:bg-black/5 dark:hover:bg-white/5 border border-transparent px-2.5 py-1'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`inline-flex items-center justify-center rounded-full text-[10px] font-bold min-w-[18px] h-4.5 px-1.5 transition-all duration-200 ${
                    isActive
                      ? 'bg-white/20 text-white backdrop-blur-xs'
                      : 'bg-[var(--lavenderSoft)] text-[var(--lavDeep)] dark:bg-purple-950/60 dark:text-[var(--lavenderAccent)]'
                  }`}
                >
                  {count}
                </span>

                {/* Inline Editing Controls for active category (except 'all') */}
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
            <form onSubmit={handleAddCategorySubmit} className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 animate-fadeIn shrink-0">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Новая категория..."
                className="text-xs bg-transparent text-[var(--ink)] focus:outline-none w-28 font-medium px-1"
                autoFocus
                onBlur={() => {
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
              className="px-3 py-1 rounded-full text-xs font-semibold border border-dashed border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-all flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Категория</span>
            </button>
          )}
        </div>

        {/* Row 2: Search Input and View Mode Switcher */}
        <div className="flex items-center justify-between gap-3 bg-white/40 dark:bg-zinc-900/60 p-2 rounded-2xl border border-[var(--glass-edge)]">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <input
              type="text"
              placeholder="Поиск по инвентарю..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 rounded-xl text-xs bg-white/70 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 text-[var(--ink)] placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:outline-none focus:border-[var(--lavenderAccent)] w-full transition-colors shadow-2xs"
            />
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-zinc-100/80 dark:bg-zinc-800/60 p-1 rounded-full border border-zinc-200/30 dark:border-zinc-800/30 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-zinc-900 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] shadow-sm'
                  : 'text-[var(--soft)] hover:text-[var(--ink)]'
              }`}
              title="Отображение карточками"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-zinc-900 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] shadow-sm'
                  : 'text-[var(--soft)] hover:text-[var(--ink)]'
              }`}
              title="Отображение списком"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add item collapsible form */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md overflow-y-auto">
          <style>{`
            @keyframes scanLine {
              0% { top: 0%; opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { top: 100%; opacity: 0; }
            }
            .animate-scan {
              animation: scanLine 1.5s ease-in-out infinite;
            }
          `}</style>
          
          <div
            className="bg-white/70 dark:bg-zinc-900/75 backdrop-blur-2xl rounded-[32px] max-w-4xl w-full p-6 md:p-8 shadow-2xl border border-white/80 dark:border-zinc-700/80 relative animate-fadeIn max-h-[90vh] overflow-y-auto"
            style={{
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-100 dark:border-zinc-800/60">
              <h3 className="text-lg font-semibold text-[var(--ink)] tracking-tight">Добавить новый товар</h3>
              <button
                type="button"
                onClick={() => {
                  setNewItemName('');
                  setNewItemDescription('');
                  setNewItemImageUrl('');
                  setOriginalImgBeforeBgRemoval('');
                  setHasRemovedBg(false);
                  setIsAdding(false);
                }}
                className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[var(--soft)] hover:text-[var(--ink)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewItem} className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 text-left animate-fadeIn">
              {/* Left Column: Image Area */}
              <div className="md:col-span-5 flex flex-col gap-4">
                <span className="text-xs font-medium text-[var(--soft)] uppercase tracking-wider block">
                  Изображение товара
                </span>
                
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 transition-all overflow-hidden ${
                    newItemImageUrl 
                      ? 'border-solid border-[var(--lavenderAccent)]/40 bg-zinc-50 dark:bg-zinc-950/40' 
                      : isDraggingOver
                        ? 'border-[var(--lavDeep)] bg-[var(--lavenderSoft)]/20 text-[var(--lavDeep)]'
                        : 'border-zinc-200/80 dark:border-zinc-800/80 hover:border-[var(--lavenderAccent)] bg-white/20 dark:bg-zinc-950/10'
                  }`}
                >
                  {newItemImageUrl ? (
                    <div className="relative w-full h-full group">
                      <img
                        src={newItemImageUrl}
                        alt="Uploaded preview"
                        className="w-full h-full object-contain rounded-xl"
                      />
                      {isRemovingBg && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex flex-col items-center justify-center gap-3">
                          <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--lavenderAccent)] to-transparent shadow-[0_0_15px_var(--lavenderAccent)] animate-scan" />
                          <Loader2 className="w-8 h-8 text-[var(--lavenderAccent)] animate-spin" />
                          <span className="text-xs font-medium text-white tracking-wider animate-pulse">ИИ убирает фон...</span>
                        </div>
                      )}
                      
                      {!isRemovingBg && (
                        <button
                          type="button"
                          onClick={() => {
                            setNewItemImageUrl('');
                            setOriginalImgBeforeBgRemoval('');
                            setHasRemovedBg(false);
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
                          title="Удалить photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-2 cursor-pointer h-full w-full select-none text-center py-8">
                      <div className="p-3 rounded-full bg-[var(--lavenderSoft)]/50 dark:bg-purple-950/20 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-[var(--ink)]">Загрузить фото</p>
                        <p className="text-xs text-[var(--soft)] max-w-[150px] leading-relaxed mx-auto">
                          Перетащите или нажмите для выбора
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* AI Background Removal Action Button and Slider */}
                {newItemImageUrl && !isRemovingBg && (
                  <div className="space-y-3 bg-zinc-50 dark:bg-zinc-950/20 p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-800/40">
                    {!hasRemovedBg ? (
                      <button
                        type="button"
                        onClick={handleBgRemoval}
                        className="w-full bg-gradient-to-r from-[var(--lavenderAccent)] to-[var(--lavDeep)] hover:opacity-90 text-white text-xs font-medium py-2.5 px-4 rounded-full flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-95 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        Удалить фон с помощью ИИ
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5" />
                            Точность удаления (допуск)
                          </span>
                          <span className="text-xs font-semibold text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]">{bgRemovalTolerance}</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="150"
                          value={bgRemovalTolerance}
                          onChange={(e) => handleToleranceChange(Number(e.target.value))}
                          className="w-full accent-[var(--lavDeep)] cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={handleRestoreOriginal}
                          className="w-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs py-2 px-4 rounded-full flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Восстановить оригинал
                        </button>
                      </div>
                    )}
                  </div>
                )}


              </div>

              {/* Right Column: Item Fields */}
              <div className="md:col-span-7 flex flex-col justify-between gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                  <div className="sm:col-span-6 space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--soft)] uppercase tracking-wider block">Наименование инвентаря</label>
                    <input
                      type="text"
                      required
                      placeholder="например, Круглая арка-кольцо 2.2м"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      className="w-full text-xs px-3.5 py-2 rounded-xl bg-white/80 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 text-[var(--ink)] focus:outline-none focus:border-[var(--lavenderAccent)] focus:ring-1 focus:ring-[var(--lavenderAccent)]/25 transition-all"
                    />
                  </div>

                  <div className="sm:col-span-6 space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--soft)] uppercase tracking-wider block">Краткое описание</label>
                    <textarea
                      placeholder="например, Классический декор, золото"
                      value={newItemDescription}
                      onChange={(e) => setNewItemDescription(e.target.value)}
                      rows={3}
                      className="w-full text-xs px-3.5 py-2 rounded-xl bg-white/80 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 text-[var(--ink)] focus:outline-none focus:border-[var(--lavenderAccent)] focus:ring-1 focus:ring-[var(--lavenderAccent)]/25 transition-all resize-none"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--soft)] uppercase tracking-wider block">Категория</label>
                    <select
                      value={newItemCat}
                      onChange={(e) => setNewItemCat(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl bg-white/80 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 text-[var(--ink)] focus:outline-none focus:border-[var(--lavenderAccent)] transition-all cursor-pointer"
                    >
                      {customCategories.map(cat => (
                        <option key={cat.key} value={cat.label}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--soft)] uppercase tracking-wider block">Количество всего</label>
                    <input
                      type="number"
                      min="1"
                      value={newItemQty}
                      onChange={(e) => setNewItemQty(Number(e.target.value))}
                      className="w-full text-xs px-3.5 py-2 rounded-xl bg-white/80 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 text-[var(--ink)] focus:outline-none focus:border-[var(--lavenderAccent)] transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--soft)] uppercase tracking-wider block">Стоимость ₽</label>
                    <input
                      type="number"
                      min="0"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(Number(e.target.value))}
                      className="w-full text-xs px-3.5 py-2 rounded-xl bg-white/80 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 text-[var(--ink)] focus:outline-none focus:border-[var(--lavenderAccent)] transition-all"
                    />
                  </div>
                </div>

                {/* Bottom Actions Row */}
                <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800/40 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setNewItemName('');
                      setNewItemDescription('');
                      setNewItemImageUrl('');
                      setOriginalImgBeforeBgRemoval('');
                      setHasRemovedBg(false);
                      setIsAdding(false);
                    }}
                    className="bg-white/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-[var(--soft)] rounded-full py-2.5 px-5 text-xs font-medium border border-zinc-200/40 dark:border-zinc-800/40 cursor-pointer transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-[#8C52D0] to-[#582F89] hover:opacity-95 text-white rounded-full py-2.5 px-6 text-xs font-medium flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Добавить позицию
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Warehouse Items Container */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 justify-center sm:justify-start animate-fadeIn w-full">
          {filteredItems.length === 0 ? (
            <div className="col-span-full py-16 text-center text-[var(--faint)] text-xs tracking-wide">
              На складе нет товаров по выбранному критерию.
            </div>
          ) : (
            filteredItems.map((item) => {
              const itemImage = item.imageUrl || getCategoryPhoto(item.category, item.name);
              return (
                <div 
                  key={item.id} 
                  className="glass-panel rounded-[24px] overflow-hidden flex flex-col border border-[var(--glass-edge)]/70 hover:border-[var(--lavenderAccent)]/60 hover:shadow-xl hover:shadow-[var(--lavDeep)]/5 transition-all duration-300 group hover:-translate-y-1 w-full text-left bg-white dark:bg-zinc-900/25"
                >
                  {/* Image Cover Section (Top half) - 1:1 Aspect Ratio */}
                  <div className="aspect-square relative shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-800/40">
                    <img
                      src={itemImage}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                      referrerPolicy="no-referrer"
                    />
                    {/* Subtle bottom dark overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
                    
                    {/* Floating Category Badge (matching transparent/blur capsule in top-right) */}
                    <span className="absolute top-3 right-3 text-[10px] font-light tracking-wider text-white bg-black/60 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-full uppercase select-none">
                      {item.category}
                    </span>

                    {/* Floating Quantity Capsule on Bottom Right (matching screenshot style with dot and edit) */}
                    {editingQtyId === item.id ? (
                       <div 
                        className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-lg border border-white/10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="number"
                          className="w-14 px-2 py-0.5 text-xs bg-white text-black rounded-full font-medium focus:outline-none"
                          value={tempQty}
                          onChange={(e) => setTempQty(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveQty(item.id);
                            if (e.key === 'Escape') setEditingQtyId(null);
                          }}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveQty(item.id)}
                          className="p-1 text-emerald-400 hover:text-emerald-500 rounded-full cursor-pointer transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingQtyId(item.id);
                          setTempQty(String(item.total));
                        }}
                        className="absolute bottom-3 right-3 flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-3.5 py-2 rounded-full text-white select-none cursor-pointer hover:bg-black/75 hover:scale-105 transition-all duration-200 shadow-md shadow-black/20"
                        title="Изменить общее количество (нажмите для редактирования)"
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-[#52D18D] shadow-[0_0_8px_#52D18D]" />
                        <span className="text-xs font-medium tracking-wide">
                          {item.available} шт.
                        </span>
                        <Pencil className="w-3 h-3 text-zinc-200 hover:text-white shrink-0 ml-0.5" />
                      </div>
                    )}
                  </div>

                  {/* Body details - Tighter padding and lower height than the image */}
                  <div className="p-4 flex-1 flex flex-col justify-between min-h-0 bg-white/[0.01] dark:bg-zinc-900/[0.01]">
                    {/* Title and Description */}
                    <div className="space-y-1 min-h-0">
                      <h4 className="font-medium text-[14px] sm:text-[15px] text-[var(--ink)] leading-snug tracking-tight line-clamp-2 hover:text-[var(--lavDeep)] transition-colors duration-300">
                        {item.name}
                      </h4>
                      <p className="text-xs sm:text-xs text-zinc-500 dark:text-zinc-400 font-light leading-snug line-clamp-2">
                        {item.description || 'Классический элемент оформления для создания великолепных свадебных концепций.'}
                      </p>
                    </div>

                    {/* Bottom row - bold violet price & trash icon */}
                    <div className="pt-3 mt-3 border-t border-[var(--glass-edge)]/15 flex items-center justify-between">
                      {/* Price Section */}
                      <div className="min-w-0">
                        {editingPriceId === item.id ? (
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="number"
                              className="w-20 px-2 py-0.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-left font-medium focus:outline-none text-[var(--ink)] focus:border-[var(--lavenderAccent)]"
                              value={tempPrice}
                              onChange={(e) => setTempPrice(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSavePrice(item.id);
                                if (e.key === 'Escape') setEditingPriceId(null);
                              }}
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSavePrice(item.id)}
                              className="p-1 text-emerald-500 hover:text-emerald-600 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 shrink-0 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div 
                            className="flex items-center gap-1 hover:text-[var(--lavDeep)] dark:hover:text-[var(--lavenderAccent)] cursor-pointer group/price"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPriceId(item.id);
                              setTempPrice(String(item.pricePerDay));
                            }}
                            title="Изменить стоимость"
                          >
                            <span className="text-base sm:text-lg font-semibold text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] tracking-tight">
                              {item.pricePerDay.toLocaleString('ru')} ₽
                            </span>
                            <Pencil className="w-3 h-3 text-zinc-400 dark:text-zinc-500 group-hover/price:text-[var(--lavDeep)] dark:group-hover/price:text-[var(--lavenderAccent)] transition-colors shrink-0" />
                          </div>
                        )}
                      </div>

                      {/* Trash bin icon (matching screenshot style) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item.id, item.name);
                        }}
                        className="p-1.5 text-rose-400 dark:text-rose-500/80 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-full border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30 transition-all cursor-pointer"
                        title="Удалить позицию"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fadeIn">
          {filteredItems.length === 0 ? (
            <div className="col-span-full py-16 text-center text-[var(--faint)] text-xs tracking-wide">
              На складе нет товаров по выбранному критерию.
            </div>
          ) : (
            filteredItems.map((item) => {
              const itemImage = item.imageUrl || getCategoryPhoto(item.category, item.name);
              return (
                <div 
                  key={item.id} 
                  className="glass-panel rounded-[24px] overflow-hidden flex flex-row items-stretch border border-zinc-200/85 dark:border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.03)] bg-white dark:bg-zinc-900/40 backdrop-blur-md min-h-[148px] sm:min-h-[156px] h-auto w-full relative group hover:border-[var(--lavenderAccent)]/50 transition-all duration-300 text-left"
                >
                  {/* Left part - Image section without padding */}
                  <div className="w-[115px] sm:w-[150px] shrink-0 relative overflow-hidden bg-zinc-100 dark:bg-zinc-850">
                    <img 
                      src={itemImage} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                      referrerPolicy="no-referrer" 
                    />
                    {/* Category overlay label */}
                    <span className="absolute top-2.5 left-2.5 text-[9px] sm:text-[10px] font-light tracking-wider text-white bg-black/60 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-full uppercase select-none">
                      {item.category}
                    </span>
                  </div>

                  {/* Right part - Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between p-3 sm:p-4 h-full w-full">
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-[14px] sm:text-[15px] text-[var(--ink)] leading-snug tracking-tight line-clamp-2 group-hover:text-[var(--lavDeep)] dark:group-hover:text-[var(--lavenderAccent)] transition-colors duration-300" title={item.name}>
                          {item.name}
                        </h4>
                      </div>
                      
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light leading-snug line-clamp-1 sm:line-clamp-2 mt-0.5">
                        {item.description || 'Классический элемент оформления для создания великолепных свадебных концепций.'}
                      </p>

                      {/* Quantity field inside a pill badge */}
                      <div className="mt-1.5 sm:mt-2">
                        {editingQtyId === item.id ? (
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="number"
                              className="w-14 px-1.5 py-0.5 text-xs bg-white text-black border border-zinc-300 rounded font-medium focus:outline-none"
                              value={tempQty}
                              onChange={(e) => setTempQty(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveQty(item.id);
                                if (e.key === 'Escape') setEditingQtyId(null);
                              }}
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveQty(item.id)}
                              className="p-1 text-emerald-500 hover:text-emerald-600 rounded-full bg-emerald-500/10 shrink-0 cursor-pointer animate-scaleIn"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingQtyId(item.id);
                              setTempQty(String(item.total));
                            }}
                            className="inline-flex items-center gap-1.5 bg-zinc-100/70 dark:bg-zinc-800/40 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/40 px-2.5 py-0.5 sm:py-1 rounded-full cursor-pointer hover:text-[var(--lavDeep)] dark:hover:text-[var(--lavenderAccent)] transition-colors select-none text-[10px] sm:text-xs text-[var(--soft)]"
                            title="Изменить общее количество (нажмите для редактирования)"
                          >
                            <span>Количество: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{item.total}</span> шт.</span>
                            <Pencil className="w-2.5 h-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 shrink-0" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--glass-edge)]/15">
                      {/* Price section */}
                      <div className="min-w-0">
                        {editingPriceId === item.id ? (
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="number"
                              className="w-20 px-2 py-0.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-left font-medium focus:outline-none text-[var(--ink)] focus:border-[var(--lavenderAccent)]"
                              value={tempPrice}
                              onChange={(e) => setTempPrice(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSavePrice(item.id);
                                if (e.key === 'Escape') setEditingPriceId(null);
                              }}
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSavePrice(item.id)}
                              className="p-1 text-emerald-500 hover:text-emerald-600 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 shrink-0 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div 
                            className="flex items-center gap-1.5 hover:text-[var(--lavDeep)] dark:hover:text-[var(--lavenderAccent)] cursor-pointer group/price"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPriceId(item.id);
                              setTempPrice(String(item.pricePerDay));
                            }}
                            title="Изменить стоимость"
                          >
                            <span className="text-sm sm:text-base font-semibold text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] tracking-tight">
                              {item.pricePerDay.toLocaleString('ru')} ₽
                            </span>
                            <Pencil className="w-3 h-3 text-zinc-400 dark:text-zinc-500 group-hover/price:text-[var(--lavDeep)] dark:group-hover/price:text-[var(--lavenderAccent)] transition-colors shrink-0" />
                          </div>
                        )}
                      </div>

                      {/* Trash bin button in list view */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item.id, item.name);
                        }}
                        className="p-1.5 text-rose-400 dark:text-rose-500/80 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-full border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30 transition-all cursor-pointer"
                        title="Удалить позицию"
                      >
                        <Trash2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Item Delete Confirmation Dialog */}
      <DeleteConfirmModal
        isOpen={!!deletingItem}
        title="Удалить позицию со склада?"
        itemName={deletingItem?.name}
        description="Вы собираетесь безвозвратно удалить эту позицию из базы складского инвентаря. Это действие нельзя отменить."
        confirmText="Удалить позицию"
        isDangerous={true}
        onClose={() => setDeletingItem(null)}
        onConfirm={confirmDeleteItem}
      />

      {/* Category Delete Confirmation Dialog */}
      <DeleteConfirmModal
        isOpen={!!deleteCategoryConfirm}
        title="Удалить категорию?"
        itemName={deleteCategoryConfirm?.label}
        description={`Вы действительно хотите удалить категорию «${deleteCategoryConfirm?.label}»? Товары из нее останутся на складе.`}
        confirmText="Удалить категорию"
        isDangerous={true}
        onClose={() => setDeleteCategoryConfirm(null)}
        onConfirm={confirmDeleteCategory}
      />
    </div>
  );
}
