import React, { useState, useEffect } from 'react';
import { Search, Plus, Check, X, Layers, Percent, Package, ArrowUpRight, ArrowDownLeft, LayoutGrid, List, Pencil, Upload, Image as ImageIcon, Trash2, ChevronDown, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
  const [newItemCat, setNewItemCat] = useState('Конструкции');
  const [newItemQty, setNewItemQty] = useState<number | ''>(1);
  const [newItemPrice, setNewItemPrice] = useState<number | ''>(0);
  const [newItemImageUrl, setNewItemImageUrl] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const resetFormState = () => {
    setNewItemName('');
    setNewItemImageUrl('');
    setNewItemQty(1);
    setNewItemPrice(0);
    setIsAdding(false);
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

  // Inline Item Name Editing States
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [tempName, setTempName] = useState<string>('');

  // Delete item state
  const [deletingItem, setDeletingItem] = useState<{ id: string; name: string } | null>(null);

  // Active category dropdown and zoom lightbox states
  const [activeDropdownItemId, setActiveDropdownItemId] = useState<string | null>(null);
  const [zoomedWarehouseItem, setZoomedWarehouseItem] = useState<WarehouseItem | null>(null);

  // Zoom and pan state for modal lightbox
  const [modalZoom, setModalZoom] = useState<number>(1);
  const [modalPan, setModalPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Reset zoom and pan when opening a new item
  useEffect(() => {
    setModalZoom(1);
    setModalPan({ x: 0, y: 0 });
    setIsPanning(false);
  }, [zoomedWarehouseItem]);

  const handleModalWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const delta = e.deltaY < 0 ? 0.15 : -0.15;
    setModalZoom(prev => {
      const next = Math.min(Math.max(Number((prev + delta).toFixed(2)), 0.5), 5);
      if (next <= 1) setModalPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (modalZoom > 1) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - modalPan.x, y: e.clientY - modalPan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && modalZoom > 1) {
      e.preventDefault();
      setModalPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Custom categories state
  const [customCategories, setCustomCategories] = useState<CategoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('pop_warehouse_categories');
      return saved ? JSON.parse(saved) : DEFAULT_WAREHOUSE_CATEGORIES;
    } catch (e) {
      return DEFAULT_WAREHOUSE_CATEGORIES;
    }
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
    { key: 'all', label: 'Все PNG' },
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
    setNewItemCat(newCat.label);
    setNewItemQty(1);
    setNewItemPrice(0);
    showToast('Категория добавлена', `Категория «${newCat.label}» успешно создана.`, 'success');
  };

  // Rename category
  const handleRenameCategorySubmit = (e?: React.FormEvent, key?: string) => {
    if (e) e.preventDefault();
    const targetKey = key || editingCategoryKey;
    if (!targetKey) return;

    const newLabel = editingCategoryName.trim();
    if (!newLabel) {
      setEditingCategoryKey(null);
      return;
    }
    const oldCat = customCategories.find(c => c.key === targetKey);
    const oldLabel = oldCat ? oldCat.label : targetKey;

    const updatedCategories = customCategories.map(cat => 
      cat.key === targetKey ? { ...cat, label: newLabel } : cat
    );
    setCustomCategories(updatedCategories);

    // Update existing items with old category name or key
    const updatedItems = items.map(item => {
      if (item.category === targetKey || item.category === oldLabel) {
        return { ...item, category: newLabel };
      }
      return item;
    });
    onUpdateItems(updatedItems);

    setEditingCategoryKey(null);
    showToast('Категория изменена', `Название категории успешно обновлено на «${newLabel}».`, 'success');
  };

  // Save modified item name
  const handleSaveName = (itemId: string) => {
    const newName = tempName.trim();
    if (!newName) {
      showToast('Ошибка наименования', 'Название товара не может быть пустым.', 'warn');
      setEditingNameId(null);
      return;
    }

    const updated = items.map(item => {
      if (item.id === itemId) {
        return { ...item, name: newName };
      }
      return item;
    });

    onUpdateItems(updated);
    setEditingNameId(null);
    showToast('Товар переименован', `Новое название: «${newName}».`, 'success');
  };

  // Change category of an item
  const handleItemCategoryChange = (itemId: string, newCategory: string) => {
    const updated = items.map(item => item.id === itemId ? { ...item, category: newCategory } : item);
    onUpdateItems(updated);
    showToast('Категория изменена', `Категория позиции обновлена на «${newCategory}».`, 'success');
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
      name: newItemName.trim(),
      category: newItemCat,
      total: Number(newItemQty) || 1,
      rented: 0,
      available: Number(newItemQty) || 1,
      pricePerDay: Number(newItemPrice) || 0,
      imageUrl: newItemImageUrl || undefined
    };

    onUpdateItems([newItem, ...items]);
    resetFormState();
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
                  className="flex items-center gap-1 bg-white dark:bg-zinc-800 px-3 py-1 rounded-full border border-[var(--lavenderAccent)] shrink-0 shadow-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="text"
                    value={editingCategoryName}
                    onChange={(e) => setEditingCategoryName(e.target.value)}
                    className="text-xs bg-transparent text-[var(--ink)] focus:outline-none w-24 sm:w-28 font-semibold"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleRenameCategorySubmit(undefined, cat.key);
                      }
                      if (e.key === 'Escape') setEditingCategoryKey(null);
                    }}
                  />
                  <button
                    type="submit"
                    onMouseDown={(e) => e.preventDefault()}
                    className="text-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer p-0.5 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                    title="Сохранить новое название"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setEditingCategoryKey(null)}
                    className="text-rose-500 hover:text-rose-600 transition-colors cursor-pointer p-0.5 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    title="Отмена"
                  >
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
                    ? 'bg-gradient-to-r from-[var(--primary-grad-from,#8C52D0)] to-[var(--primary-grad-to,#582F89)] text-white shadow-xs px-3 py-1'
                    : 'bg-transparent text-[var(--soft)] hover:text-[var(--ink)] hover:bg-black/5 dark:hover:bg-white/5 border border-transparent px-2.5 py-1'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`inline-flex items-center justify-center rounded-full text-[10px] font-bold min-w-[18px] h-4.5 px-1.5 transition-all duration-200 text-white ${
                    isActive
                      ? 'bg-white/25 backdrop-blur-xs'
                      : 'shadow-2xs'
                  }`}
                  style={!isActive ? { background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' } : undefined}
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
        <div className="flex items-center justify-between gap-3 bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md p-2 rounded-full border border-zinc-200/50 dark:border-zinc-800/40 shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <input
              type="text"
              placeholder="Поиск по инвентарю..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 rounded-full text-xs bg-white/70 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 text-[var(--ink)] placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:outline-none focus:border-[var(--lavenderAccent)] w-full transition-colors shadow-2xs"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-black/60 backdrop-blur-md overflow-hidden pb-[calc(10px+env(safe-area-inset-bottom,0px))]">
          <div
            className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl rounded-[24px] sm:rounded-[32px] max-w-2xl w-full shadow-2xl border border-white/80 dark:border-zinc-700/80 relative animate-fadeIn max-h-[88vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
            style={{
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            {/* Pinned Header */}
            <div className="flex items-center justify-between px-4 sm:px-8 py-3.5 sm:py-5 border-b border-zinc-100 dark:border-zinc-800/60 shrink-0">
              <h3 className="text-base sm:text-lg font-semibold text-[var(--ink)] tracking-tight">Добавить PNG</h3>
              <button
                type="button"
                onClick={resetFormState}
                className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[var(--soft)] hover:text-[var(--ink)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="add-warehouse-item-form" onSubmit={handleAddNewItem} className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6 custom-scrollbar text-left">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-start">
                {/* Left Column: PNG Image Upload Area (Right under title) */}
                <div className="md:col-span-5 flex flex-col">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative aspect-4/3 sm:aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-3 sm:p-4 transition-all overflow-hidden ${
                      newItemImageUrl 
                        ? 'border-solid border-[var(--lavenderAccent)]/40 bg-zinc-50/50 dark:bg-zinc-950/40' 
                        : isDraggingOver
                          ? 'border-[var(--lavDeep)] bg-[var(--lavenderSoft)]/20 text-[var(--lavDeep)]'
                          : 'border-zinc-200/80 dark:border-zinc-800/80 hover:border-[var(--lavenderAccent)] bg-white/20 dark:bg-zinc-950/10'
                    }`}
                  >
                    {newItemImageUrl ? (
                      <div className="relative w-full h-full group flex items-center justify-center">
                        <div 
                          className="absolute inset-0 opacity-15 rounded-xl pointer-events-none"
                          style={{
                            backgroundImage: 'linear-gradient(45deg, #888 25%, transparent 25%), linear-gradient(-45deg, #888 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #888 75%), linear-gradient(-45deg, transparent 75%, #888 75%)',
                            backgroundSize: '16px 16px',
                            backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
                          }}
                        />
                        <img
                          src={newItemImageUrl}
                          alt="Uploaded preview"
                          className="relative z-10 w-full h-full object-contain rounded-xl p-1"
                        />
                        <button
                          type="button"
                          onClick={() => setNewItemImageUrl('')}
                          className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer shadow-sm"
                          title="Удалить фото"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center gap-1.5 cursor-pointer h-full w-full select-none text-center py-3 sm:py-6">
                        <div className="p-2 sm:p-2.5 rounded-full bg-[var(--lavenderSoft)]/50 dark:bg-purple-950/20 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]">
                          <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-[var(--ink)]">Загрузить фото</p>
                          <p className="text-[11px] text-[var(--soft)] max-w-[150px] leading-snug mx-auto">
                            Перетащите или нажмите для выбора готового PNG
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
                </div>

                {/* Right Column: Item Fields */}
                <div className="md:col-span-7 flex flex-col gap-3 sm:gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal block">
                      Наименование инвентаря
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="например, Круглая арка-кольцо 2.2м"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 text-[var(--ink)] focus:outline-none focus:border-[var(--lavenderAccent)] focus:ring-1 focus:ring-[var(--lavenderAccent)]/25 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal block">
                      Категория
                    </label>
                    <select
                      value={newItemCat}
                      onChange={(e) => setNewItemCat(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl bg-white/80 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 text-[var(--ink)] focus:outline-none focus:border-[var(--lavenderAccent)] transition-all cursor-pointer"
                    >
                      {customCategories.map(cat => (
                        <option key={cat.key} value={cat.label}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity & Price always on a single row (2 columns) */}
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal block truncate">
                        Количество всего
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={newItemQty === '' ? '' : newItemQty}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewItemQty(val === '' ? '' : parseInt(val) || 1);
                        }}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 text-[var(--ink)] focus:outline-none focus:border-[var(--lavenderAccent)] transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal block truncate">
                        Стоимость ₽
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={newItemPrice === '' ? '' : newItemPrice}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewItemPrice(val === '' ? '' : Number(val) || 0);
                        }}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 text-[var(--ink)] focus:outline-none focus:border-[var(--lavenderAccent)] transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* Pinned Bottom Actions Row (Safe from mobile browser navigation bars) */}
            <div className="px-4 sm:px-8 py-3 sm:py-4 border-t border-zinc-100 dark:border-zinc-800/60 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 pb-[calc(12px+env(safe-area-inset-bottom,0px))]">
              <button
                type="button"
                onClick={resetFormState}
                className="flex-1 sm:flex-initial bg-white/60 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 text-[var(--soft)] rounded-full py-2.5 sm:py-2 px-5 text-xs font-semibold border border-zinc-200/60 dark:border-zinc-700/60 cursor-pointer transition-colors text-center"
              >
                Отмена
              </button>
              <button
                type="submit"
                form="add-warehouse-item-form"
                style={{ background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)' }}
                className="flex-1 sm:flex-initial hover:opacity-95 text-white rounded-full py-2.5 sm:py-2 px-5 sm:px-6 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span className="truncate">Добавить позицию</span>
              </button>
            </div>
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
                  className={`glass-panel rounded-[24px] flex flex-col border border-[var(--glass-edge)]/70 hover:border-[var(--lavenderAccent)]/60 hover:shadow-xl hover:shadow-[var(--lavDeep)]/5 transition-all duration-300 group hover:-translate-y-1 w-full text-left bg-white dark:bg-zinc-900/25 ${
                    activeDropdownItemId === item.id ? 'z-30 overflow-visible' : 'overflow-hidden'
                  }`}
                >
                  {/* Image Cover Section (Top half) - 1:1 Aspect Ratio */}
                  <div className="aspect-square relative shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-800/40 rounded-t-[24px]">
                    <img
                      src={itemImage}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                      referrerPolicy="no-referrer"
                    />
                    {/* Subtle bottom dark overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />
                    
                    {/* Top-Left: Floating Quantity Capsule */}
                    {editingQtyId === item.id ? (
                      <div 
                        className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1 bg-black/90 backdrop-blur-md px-2 py-0.5 rounded-full shadow-lg border border-white/10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="number"
                          className="w-12 px-1.5 py-0.5 text-xs bg-white text-black rounded-full font-medium focus:outline-none"
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
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleSaveQty(item.id)}
                          className="p-0.5 text-emerald-400 hover:text-emerald-500 rounded-full cursor-pointer transition-colors"
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
                        className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full text-white select-none cursor-pointer hover:scale-105 transition-all duration-200 shadow-sm"
                        title="Изменить общее количество (нажмите для редактирования)"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#52D18D] shadow-[0_0_6px_#52D18D] shrink-0" />
                        <span className="text-[11px] font-medium tracking-wide">
                          {item.available} шт.
                        </span>
                        <Pencil className="w-2.5 h-2.5 text-zinc-300 hover:text-white shrink-0 ml-0.5" />
                      </div>
                    )}

                    {/* Top-Right: Magnifying Glass / Zoom Preview Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoomedWarehouseItem(item);
                      }}
                      className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-lg bg-black/60 hover:bg-black/85 text-white border border-white/15 backdrop-blur-md shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
                      title="Увеличить изображение"
                    >
                      <Search className="w-3.5 h-3.5" />
                    </button>

                    {/* Bottom-Left: Floating Category Dropdown Selector */}
                    <div className="absolute bottom-2.5 left-2.5 z-20 max-w-[85%] sm:max-w-[80%]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdownItemId(activeDropdownItemId === item.id ? null : item.id);
                        }}
                        className="text-[10px] sm:text-[11px] bg-black/60 hover:bg-black/80 text-white border border-white/10 backdrop-blur-md rounded-xl px-2.5 py-1 focus:outline-none font-medium cursor-pointer transition-all flex items-center justify-between gap-1 shadow-sm"
                      >
                        <span className="truncate max-w-[85px] sm:max-w-[105px]">
                          {customCategories.find(c => c.key === item.category || c.label === item.category)?.label || item.category}
                        </span>
                        <ChevronDown className={`w-3 h-3 text-white/70 transition-transform duration-200 shrink-0 ${activeDropdownItemId === item.id ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {activeDropdownItemId === item.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-40" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownItemId(null);
                              }} 
                            />
                            <motion.div
                              initial={{ opacity: 0, y: 5, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 5, scale: 0.95 }}
                              transition={{ duration: 0.15 }}
                              onClick={(e) => e.stopPropagation()}
                              className="absolute bottom-8 left-0 min-w-[130px] bg-zinc-900/95 dark:bg-zinc-950/95 backdrop-blur-md border border-white/10 rounded-xl p-1 shadow-2xl z-50 overflow-hidden max-h-40 overflow-y-auto"
                            >
                              {customCategories.map((cat) => {
                                const isSelected = item.category === cat.key || item.category === cat.label;
                                return (
                                  <button
                                    key={cat.key}
                                    type="button"
                                    onClick={() => {
                                      handleItemCategoryChange(item.id, cat.label);
                                      setActiveDropdownItemId(null);
                                    }}
                                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-medium transition-all flex items-center justify-between cursor-pointer ${
                                      isSelected
                                        ? 'bg-[var(--lavDeep)] text-white font-semibold'
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
                  </div>

                  {/* Body details - Tighter padding and lower height than the image */}
                  <div className="p-4 flex-1 flex flex-col justify-between min-h-0 bg-white/[0.01] dark:bg-zinc-900/[0.01]">
                    {/* Title and Description */}
                    <div className="space-y-1 min-h-0">
                      {editingNameId === item.id ? (
                        <div className="flex items-center gap-1.5 py-0.5" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            className="w-full px-2 py-1 text-xs bg-white dark:bg-zinc-900 border border-[var(--lavenderAccent)] rounded-lg font-medium focus:outline-none text-[var(--ink)]"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveName(item.id);
                              if (e.key === 'Escape') setEditingNameId(null);
                            }}
                            autoFocus
                          />
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSaveName(item.id)}
                            className="p-1 text-emerald-500 hover:text-emerald-600 rounded-full bg-emerald-500/10 shrink-0 cursor-pointer"
                            title="Сохранить название"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setEditingNameId(null)}
                            className="p-1 text-rose-500 hover:text-rose-600 rounded-full bg-rose-500/10 shrink-0 cursor-pointer"
                            title="Отмена"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          className="flex items-start justify-between gap-1 group/name cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingNameId(item.id);
                            setTempName(item.name);
                          }}
                          title="Нажмите для переименования товара"
                        >
                          <h4 className="font-medium text-[14px] sm:text-[15px] text-[var(--ink)] leading-snug tracking-tight line-clamp-2 group-hover/name:text-[var(--lavDeep)] dark:group-hover/name:text-[var(--lavenderAccent)] transition-colors duration-300 flex-1">
                            {item.name}
                          </h4>
                          <Pencil className="w-3 h-3 text-zinc-300 dark:text-zinc-600 group-hover/name:text-[var(--lavDeep)] dark:group-hover/name:text-[var(--lavenderAccent)] transition-colors shrink-0 mt-0.5" />
                        </div>
                      )}
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
                              onMouseDown={(e) => e.preventDefault()}
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
                            <span className="text-base sm:text-lg font-bold text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] tracking-tight">
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
                  className={`glass-panel rounded-[24px] flex flex-row items-stretch border border-zinc-200/85 dark:border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.03)] bg-white dark:bg-zinc-900/40 backdrop-blur-md min-h-[148px] sm:min-h-[156px] h-auto w-full relative group hover:border-[var(--lavenderAccent)]/50 transition-all duration-300 text-left ${
                    activeDropdownItemId === item.id ? 'z-30 overflow-visible' : 'overflow-hidden'
                  }`}
                >
                  {/* Left part - Image section without padding */}
                  <div className="w-[125px] sm:w-[155px] shrink-0 relative overflow-hidden bg-zinc-100 dark:bg-zinc-850 rounded-l-[24px]">
                    <img 
                      src={itemImage} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                      referrerPolicy="no-referrer" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />

                    {/* Top-Left: Quantity Badge */}
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingQtyId(item.id);
                        setTempQty(String(item.total));
                      }}
                      className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-full text-white select-none cursor-pointer shadow-sm text-[9px] sm:text-[10px]"
                      title="Изменить количество"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#52D18D] shadow-[0_0_4px_#52D18D] shrink-0" />
                      <span>{item.available} шт.</span>
                    </div>

                    {/* Top-Right: Zoom preview button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoomedWarehouseItem(item);
                      }}
                      className="absolute top-2 right-2 z-10 p-1 rounded-lg bg-black/60 hover:bg-black/85 text-white border border-white/15 backdrop-blur-md shadow-sm transition-all cursor-pointer hover:scale-105"
                      title="Увеличить фото"
                    >
                      <Search className="w-3 h-3" />
                    </button>

                    {/* Bottom-Left: Category dropdown */}
                    <div className="absolute bottom-2 left-2 z-20 max-w-[90%]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdownItemId(activeDropdownItemId === item.id ? null : item.id);
                        }}
                        className="text-[9px] sm:text-[10px] bg-black/60 hover:bg-black/80 text-white border border-white/10 backdrop-blur-md rounded-lg px-2 py-0.5 focus:outline-none font-medium cursor-pointer transition-all flex items-center justify-between gap-1 shadow-sm"
                      >
                        <span className="truncate max-w-[70px] sm:max-w-[90px]">
                          {customCategories.find(c => c.key === item.category || c.label === item.category)?.label || item.category}
                        </span>
                        <ChevronDown className={`w-2.5 h-2.5 text-white/70 transition-transform duration-200 shrink-0 ${activeDropdownItemId === item.id ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {activeDropdownItemId === item.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-40" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownItemId(null);
                              }} 
                            />
                            <motion.div
                              initial={{ opacity: 0, y: 5, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 5, scale: 0.95 }}
                              transition={{ duration: 0.15 }}
                              onClick={(e) => e.stopPropagation()}
                              className="absolute bottom-6 left-0 min-w-[120px] bg-zinc-900/95 dark:bg-zinc-950/95 backdrop-blur-md border border-white/10 rounded-xl p-1 shadow-2xl z-50 overflow-hidden max-h-36 overflow-y-auto"
                            >
                              {customCategories.map((cat) => {
                                const isSelected = item.category === cat.key || item.category === cat.label;
                                return (
                                  <button
                                    key={cat.key}
                                    type="button"
                                    onClick={() => {
                                      handleItemCategoryChange(item.id, cat.label);
                                      setActiveDropdownItemId(null);
                                    }}
                                    className={`w-full text-left px-2 py-1 rounded-lg text-[9px] sm:text-[10px] font-medium transition-all flex items-center justify-between cursor-pointer ${
                                      isSelected
                                        ? 'bg-[var(--lavDeep)] text-white font-semibold'
                                        : 'text-zinc-200 hover:bg-[var(--lavDeep)]/40 hover:text-white'
                                    }`}
                                  >
                                    <span className="truncate">{cat.label}</span>
                                    {isSelected && <Check className="w-2.5 h-2.5 text-white shrink-0" />}
                                  </button>
                                );
                              })}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Right part - Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between p-3 sm:p-4 h-full w-full">
                    <div className="space-y-1">
                      {editingNameId === item.id ? (
                        <div className="flex items-center gap-1.5 py-0.5" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            className="w-full px-2 py-1 text-xs bg-white dark:bg-zinc-900 border border-[var(--lavenderAccent)] rounded-lg font-medium focus:outline-none text-[var(--ink)]"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveName(item.id);
                              if (e.key === 'Escape') setEditingNameId(null);
                            }}
                            autoFocus
                          />
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSaveName(item.id)}
                            className="p-1 text-emerald-500 hover:text-emerald-600 rounded-full bg-emerald-500/10 shrink-0 cursor-pointer"
                            title="Сохранить название"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setEditingNameId(null)}
                            className="p-1 text-rose-500 hover:text-rose-600 rounded-full bg-rose-500/10 shrink-0 cursor-pointer"
                            title="Отмена"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          className="flex items-start justify-between gap-1 group/name cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingNameId(item.id);
                            setTempName(item.name);
                          }}
                          title="Нажмите для переименования товара"
                        >
                          <h4 className="font-bold text-[14px] sm:text-[15px] text-[var(--ink)] leading-snug tracking-tight line-clamp-2 group-hover/name:text-[var(--lavDeep)] dark:group-hover/name:text-[var(--lavenderAccent)] transition-colors duration-300 flex-1">
                            {item.name}
                          </h4>
                          <Pencil className="w-3 h-3 text-zinc-300 dark:text-zinc-600 group-hover/name:text-[var(--lavDeep)] dark:group-hover/name:text-[var(--lavenderAccent)] transition-colors shrink-0 mt-0.5" />
                        </div>
                      )}

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
                              onMouseDown={(e) => e.preventDefault()}
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
                              onMouseDown={(e) => e.preventDefault()}
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
                            <span className="text-sm sm:text-base font-bold text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] tracking-tight">
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

      {/* Zoom Modal for PNG preview */}
      <AnimatePresence>
        {zoomedWarehouseItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setZoomedWarehouseItem(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative max-w-5xl w-full h-[90vh] max-h-[92vh] bg-zinc-950/95 backdrop-blur-2xl rounded-3xl border border-white/20 dark:border-zinc-700/80 overflow-hidden flex flex-col shadow-2xl z-10 select-none"
              style={{
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setZoomedWarehouseItem(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/85 text-white/80 hover:text-white border border-white/15 backdrop-blur-md transition-all cursor-pointer z-30 shadow-md"
                title="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Image Container with Full Height & Interactive Wheel Zoom */}
              <div 
                className={`flex-1 w-full overflow-hidden flex items-center justify-center bg-zinc-950/80 p-4 sm:p-6 min-h-0 relative select-none ${
                  modalZoom > 1 ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
                }`}
                onWheel={handleModalWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onDoubleClick={() => {
                  if (modalZoom > 1) {
                    setModalZoom(1);
                    setModalPan({ x: 0, y: 0 });
                  } else {
                    setModalZoom(2);
                  }
                }}
              >
                {/* Transparency Grid Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#383838_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

                {/* Zoom Controls Floating Toolbar */}
                <div 
                  className="absolute top-3 left-3 z-30 flex items-center gap-1.5 bg-black/70 hover:bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 text-white shadow-lg text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setModalZoom(prev => Math.max(Number((prev - 0.25).toFixed(2)), 0.5))}
                    className="p-1 rounded-md hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                    title="Уменьшить"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-semibold px-1 text-[11px] tabular-nums text-zinc-200 min-w-[36px] text-center">
                    {Math.round(modalZoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setModalZoom(prev => Math.min(Number((prev + 0.25).toFixed(2)), 5))}
                    className="p-1 rounded-md hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                    title="Увеличить"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  {modalZoom !== 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setModalZoom(1);
                        setModalPan({ x: 0, y: 0 });
                      }}
                      className="p-1 ml-0.5 rounded-md hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                      title="Сбросить масштаб"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Zoomable Image Element */}
                <div 
                  className="relative flex items-center justify-center max-w-full max-h-full transition-transform duration-75 ease-out"
                  style={{
                    transform: `translate(${modalPan.x}px, ${modalPan.y}px) scale(${modalZoom})`,
                    transformOrigin: 'center center',
                  }}
                >
                  <img
                    src={zoomedWarehouseItem.imageUrl || getCategoryPhoto(zoomedWarehouseItem.category, zoomedWarehouseItem.name)}
                    alt={zoomedWarehouseItem.name}
                    className="max-w-full max-h-[calc(90vh-140px)] object-contain rounded-lg shadow-2xl pointer-events-none select-none"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Footer / Description with high-contrast light theme accent price */}
              <div className="bg-zinc-900/95 px-6 py-4 border-t border-zinc-800 text-left shrink-0 z-20">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h4 className="text-base sm:text-lg font-semibold text-zinc-100 truncate">
                      {zoomedWarehouseItem.name}
                    </h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400">
                      <span>Категория: <strong className="text-zinc-200">{zoomedWarehouseItem.category}</strong></span>
                      <span>•</span>
                      <span>В наличии: <strong className="text-emerald-400">{zoomedWarehouseItem.available} шт.</strong></span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span 
                      className="text-lg sm:text-xl font-bold tracking-tight"
                      style={{ color: 'var(--primary-grad-from, #C084FC)' }}
                    >
                      {zoomedWarehouseItem.pricePerDay.toLocaleString('ru')} ₽
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
