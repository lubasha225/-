import React, { useState, useEffect, useRef } from 'react';
import { getStorageItem, setStorageItem, getSyncStorageItem } from '../lib/asyncStorage';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Upload,
  FolderPlus,
  Trash2,
  Edit,
  Plus,
  Search,
  Check,
  RotateCcw,
  Download,
  Image as ImageIcon,
  Layers,
  Palette,
  Sliders,
  Sparkles,
  Package,
  X,
  FileJson,
  Tag,
  ArrowLeft,
  Box,
  Columns,
  AlignLeft,
  Flower2,
  CircleDot,
  Compass,
  Lightbulb,
  Table as TableIcon,
  Utensils,
  Type,
  UploadCloud,
  Eye,
  CheckCircle2,
  FolderOpen,
  AlertCircle,
  DollarSign,
  Save
} from 'lucide-react';

interface ToolIconItem {
  id: string;
  toolName: string;
  category: string;
  customIconUrl?: string;
  svgCode?: string;
  isCustom: boolean;
}

export interface DecorLibraryItem {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  widthCm: number;
  heightCm: number;
  price?: number;
  sku?: string;
  description?: string;
  needsNaming?: boolean;
  isBatchUploaded?: boolean;
}

export interface AdminLibraryCategory {
  id: string;
  title: string;
  description: string;
}

interface AdminCabinetTabProps {
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warn') => void;
}

const DEFAULT_TOOL_ICONS: ToolIconItem[] = [
  { id: 't_layers', toolName: 'Панель слоев', category: 'Инструменты холста', isCustom: false },
  { id: 't_measure', toolName: 'Замеры и линейки', category: 'Инструменты холста', isCustom: false },
  { id: 't_filters', toolName: 'Цветокоррекция и яркость', category: 'Обработка', isCustom: false },
  { id: 't_recolor', toolName: 'Замена цвета объекта', category: 'Обработка', isCustom: false },
  { id: 't_flip', toolName: 'Отражение элементов', category: 'Инструменты холста', isCustom: false },
  { id: 't_group', toolName: 'Группировка элементов', category: 'Инструменты холста', isCustom: false },
  { id: 't_bg_remove', toolName: 'Удаление фона ИИ', category: 'ИИ функции', isCustom: false },
  { id: 't_text', toolName: 'Текстовая надпись', category: 'Контент', isCustom: false },
  { id: 't_draw', toolName: 'Карандаш / Разметка', category: 'Контент', isCustom: false },
];

const DEFAULT_EDITOR_CATEGORIES: AdminLibraryCategory[] = [
  { id: 'construction', title: 'Конструкции', description: 'Арки, каркасы, хупы, павильоны и задники' },
  { id: 'podiums', title: 'Подиумы', description: 'Подиумы, сцена, тумбы и колонны' },
  { id: 'textiles', title: 'Текстиль', description: 'Скатерти, драпировки, салфетки и шторы' },
  { id: 'flowers', title: 'Флористика', description: 'Живые и искусственные цветы, гирлянды, композиции' },
  { id: 'balloons', title: 'Шары', description: 'Аэродизайн, связки шаров и гирлянды' },
  { id: 'decor', title: 'Декор', description: 'Аксессуары, фигуры, интерьерный декор' },
  { id: 'sequins', title: 'Пайетки', description: 'Пайетки, зеркальные панели, мерцающие фотозоны' },
  { id: 'light', title: 'Свет', description: 'Прожекторы, гирлянды, неон, свечи' },
  { id: 'furniture', title: 'Мебель', description: 'Столы, стулья, мягкая мебель, диваны' },
  { id: 'tableware', title: 'Сервировка', description: 'Вазы, канделябры, тарелки, подсвечники' },
  { id: 'themes', title: 'Тематика', description: 'Тематические декорации и концепт-зоны' },
  { id: 'text', title: 'Текст', description: 'Неоновые вывески, хэштеги, буквы' },
  { id: 'warehouse', title: 'Склад', description: 'Складские единицы и инвентарь проекта' }
];

const INITIAL_DECOR_ITEMS: DecorLibraryItem[] = [
  {
    id: 'dec_1',
    name: 'Арка полукруглая «Классика» (металл)',
    category: 'Конструкции',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600',
    widthCm: 220,
    heightCm: 240,
    sku: 'ARC-001',
    description: 'Металлический разборный каркас для украшения цветами и тканью'
  },
  {
    id: 'dec_2',
    name: 'Круглая арка-кольцо 2.2м (золото)',
    category: 'Конструкции',
    imageUrl: 'https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=600',
    widthCm: 220,
    heightCm: 220,
    sku: 'ARC-002',
    description: 'Легкий прочный сплав с золотым напылением'
  },
  {
    id: 'dec_3',
    name: 'Ваза высокая стеклянная «Мартинка» 70см',
    category: 'Сервировка',
    imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=600',
    widthCm: 30,
    heightCm: 70,
    sku: 'VASE-070',
    description: 'Прозрачное стекло для высоких композиций на столах гостей'
  },
  {
    id: 'dec_4',
    name: 'Неоновая надпись «Better Together»',
    category: 'Свет',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=600',
    widthCm: 120,
    heightCm: 45,
    sku: 'NEON-012',
    description: 'Теплый гибкий неон на акриловой подложке'
  },
  {
    id: 'dec_5',
    name: 'Подсвечник металлический на 5 свечей (золото)',
    category: 'Декор',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600',
    widthCm: 35,
    heightCm: 60,
    sku: 'CANDLE-05',
    description: 'Торжественный канделябр для тонких свечей'
  },
  {
    id: 'dec_6',
    name: 'Композиция из гортензий и роз (премиум)',
    category: 'Флористика',
    imageUrl: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&q=80&w=600',
    widthCm: 80,
    heightCm: 50,
    sku: 'FLW-104',
    description: 'Пышная аранжировка в нежных пастельных тонах'
  }
];

// Helper Component: Renders category icon (Custom uploaded base64 icon or default Lucide icon)
const CategoryIconDisplay: React.FC<{
  catId: string;
  catTitle: string;
  className?: string;
}> = ({ catId, catTitle, className = "w-5 h-5 text-[var(--primary-accent)] dark:text-purple-400" }) => {
  const [customIcon, setCustomIcon] = useState<string | null>(() => {
    return localStorage.getItem(`cat_icon_${catId}`) || null;
  });
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setCustomIcon(localStorage.getItem(`cat_icon_${catId}`) || null);
      setImgError(false);
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('cat_icons_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('cat_icons_updated', handleUpdate);
    };
  }, [catId]);

  const iconSrc = customIcon || `/category-icons/${catId}.svg`;

  useEffect(() => {
    if (!iconSrc) {
      setImgError(true);
      return;
    }
    setImgError(false);
    const img = new Image();
    img.src = iconSrc;
    img.onload = () => setImgError(false);
    img.onerror = () => setImgError(true);
  }, [iconSrc]);

  if (!imgError && iconSrc) {
    if (customIcon) {
      return (
        <img
          src={customIcon}
          alt={catTitle}
          className={`w-5 h-5 object-contain shrink-0 transition-transform group-hover:scale-110 ${className}`}
        />
      );
    }
    return (
      <div
        style={{
          maskImage: `url("${iconSrc}")`,
          WebkitMaskImage: `url("${iconSrc}")`,
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
        }}
        className={`w-5 h-5 bg-[var(--primary-accent)] dark:bg-purple-400 shrink-0 transition-transform group-hover:scale-110 ${className}`}
        role="img"
        aria-label={catTitle}
      />
    );
  }

  // Fallback Lucide icons based on catId
  switch (catId) {
    case 'construction': return <Layers className={className} />;
    case 'podiums': return <Columns className={className} />;
    case 'textiles': return <AlignLeft className={className} />;
    case 'flowers': return <Flower2 className={className} />;
    case 'balloons': return <CircleDot className={className} />;
    case 'decor': return <Compass className={className} />;
    case 'sequins': return <Sparkles className={className} />;
    case 'light': return <Lightbulb className={className} />;
    case 'furniture': return <TableIcon className={className} />;
    case 'tableware': return <Utensils className={className} />;
    case 'themes': return <Palette className={className} />;
    case 'text': return <Type className={className} />;
    case 'warehouse': return <Box className={className} />;
    default: return <Package className={className} />;
  }
};

export default function AdminCabinetTab({ showToast }: AdminCabinetTabProps) {
  const [adminTab, setAdminTab] = useState<'library' | 'icons' | 'categories' | 'logo' | 'backup'>('library');

  // App Logo State
  const [appLogo, setAppLogo] = useState<string>(() => {
    return localStorage.getItem('app_custom_logo') || '/logo_iq_deko.svg';
  });

  useEffect(() => {
    const handleLogoSync = () => {
      setAppLogo(localStorage.getItem('app_custom_logo') || '/logo_iq_deko.svg');
    };
    window.addEventListener('storage', handleLogoSync);
    window.addEventListener('app_logo_updated', handleLogoSync);
    return () => {
      window.removeEventListener('storage', handleLogoSync);
      window.removeEventListener('app_logo_updated', handleLogoSync);
    };
  }, []);

  // Icons state
  const [toolIcons, setToolIcons] = useState<ToolIconItem[]>(() => {
    try {
      const saved = localStorage.getItem('admin_custom_icons');
      return saved ? JSON.parse(saved) : DEFAULT_TOOL_ICONS;
    } catch (e) {
      return DEFAULT_TOOL_ICONS;
    }
  });

  // Decor library state with IndexedDB fallback
  const [decorItems, setDecorItems] = useState<DecorLibraryItem[]>(() => {
    return getSyncStorageItem('admin_decor_library', INITIAL_DECOR_ITEMS);
  });

  useEffect(() => {
    getStorageItem<DecorLibraryItem[]>('admin_decor_library', INITIAL_DECOR_ITEMS).then(items => {
      setDecorItems(items);
    });
  }, []);

  // Categories state
  const [libraryCategories, setLibraryCategories] = useState<AdminLibraryCategory[]>(() => {
    try {
      const saved = localStorage.getItem('admin_editor_categories_def');
      return saved ? JSON.parse(saved) : DEFAULT_EDITOR_CATEGORIES;
    } catch (e) {
      return DEFAULT_EDITOR_CATEGORIES;
    }
  });

  // Currently opened category in Library tab (null = view all category cards)
  const [openedCategory, setOpenedCategory] = useState<AdminLibraryCategory | null>(null);
  const [initialCategorySnapshot, setInitialCategorySnapshot] = useState<string>('');
  const [initialCategoryIcon, setInitialCategoryIcon] = useState<string | null>(null);

  // Single Upload Modal state
  const [isSingleUploadModalOpen, setIsSingleUploadModalOpen] = useState(false);
  const [singleUploadName, setSingleUploadName] = useState('');
  const [singleUploadPrice, setSingleUploadPrice] = useState<string>('');
  const [singleUploadImageUrl, setSingleUploadImageUrl] = useState<string>('');

  // Search states
  const [iconSearch, setIconSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [fileSearch, setFileSearch] = useState('');

  // Modals
  const [isAddIconModalOpen, setIsAddIconModalOpen] = useState(false);
  const [isAddDecorModalOpen, setIsAddDecorModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DecorLibraryItem | null>(null);

  // Drag over dropzone state
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // New Icon Form
  const [newIconName, setNewIconName] = useState('');
  const [newIconCategory, setNewIconCategory] = useState('Инструменты холста');
  const [newIconFile, setNewIconFile] = useState<string | null>(null);

  // New Decor Item Form
  const [newDecorName, setNewDecorName] = useState('');
  const [newDecorCategory, setNewDecorCategory] = useState('Конструкции');
  const [newDecorWidth, setNewDecorWidth] = useState<number>(100);
  const [newDecorHeight, setNewDecorHeight] = useState<number>(150);
  const [newDecorSku, setNewDecorSku] = useState('');
  const [newDecorDesc, setNewDecorDesc] = useState('');
  const [newDecorImageUrl, setNewDecorImageUrl] = useState('');

  // New Category Form
  const [newCatTitle, setNewCatTitle] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem('admin_custom_icons', JSON.stringify(toolIcons));
    } catch (e) {
      console.warn('Failed to save toolIcons:', e);
    }
  }, [toolIcons]);

  useEffect(() => {
    setStorageItem('admin_decor_library', decorItems).then(() => {
      window.dispatchEvent(new Event('admin_library_updated'));
    });
  }, [decorItems]);

  useEffect(() => {
    try {
      localStorage.setItem('admin_editor_categories_def', JSON.stringify(libraryCategories));
    } catch (e) {
      console.warn('Failed to save libraryCategories:', e);
    }
  }, [libraryCategories]);

  // Open / Close category handlers with change tracking
  const handleOpenCategory = (cat: AdminLibraryCategory) => {
    setOpenedCategory(cat);
    const itemsInCat = decorItems.filter(i =>
      i.category.toLowerCase() === cat.title.toLowerCase() ||
      i.category.toLowerCase() === cat.id.toLowerCase()
    );
    setInitialCategorySnapshot(JSON.stringify(itemsInCat));
    setInitialCategoryIcon(localStorage.getItem(`cat_icon_${cat.id}`) || null);
  };

  const handleCloseCategory = () => {
    setOpenedCategory(null);
    setInitialCategorySnapshot('');
    setInitialCategoryIcon(null);
  };

  // Check if current category has unsaved changes
  const currentCategoryFiles = openedCategory
    ? decorItems.filter(item =>
        item.category.toLowerCase() === openedCategory.title.toLowerCase() ||
        item.category.toLowerCase() === openedCategory.id.toLowerCase()
      )
    : [];

  const compressDataUrl = (dataUrl: string, maxDim = 1000, quality = 0.85): Promise<string> => {
    return new Promise((resolve) => {
      if (!dataUrl || (!dataUrl.startsWith('data:image') && !dataUrl.startsWith('data:application/octet-stream'))) {
        resolve(dataUrl);
        return;
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;
        if (!width || !height) {
          resolve(dataUrl);
          return;
        }
        if (width <= maxDim && height <= maxDim && dataUrl.length < 250000) {
          resolve(dataUrl);
          return;
        }
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const isPng = dataUrl.includes('image/png');
        try {
          const compressed = canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', quality);
          resolve(compressed.length < dataUrl.length ? compressed : dataUrl);
        } catch (e) {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const currentCategoryIcon = openedCategory ? (localStorage.getItem(`cat_icon_${openedCategory.id}`) || null) : null;

  const hasCategoryChanges = openedCategory ? (
    JSON.stringify(currentCategoryFiles) !== initialCategorySnapshot ||
    currentCategoryIcon !== initialCategoryIcon
  ) : false;

  const handleSaveCategoryChanges = () => {
    if (!openedCategory) return;
    setStorageItem('admin_decor_library', decorItems).then(() => {
      window.dispatchEvent(new Event('admin_library_updated'));
    });
    setInitialCategorySnapshot(JSON.stringify(currentCategoryFiles));
    setInitialCategoryIcon(currentCategoryIcon);
    showToast('Сохранено', `Все изменения в категории «${openedCategory.title}» успешно сохранены.`, 'success');
  };

  const handleCancelCategoryChanges = () => {
    if (!openedCategory) return;
    try {
      const originalItems: DecorLibraryItem[] = JSON.parse(initialCategorySnapshot || '[]');
      setDecorItems(prev => {
        const otherItems = prev.filter(i =>
          i.category.toLowerCase() !== openedCategory.title.toLowerCase() &&
          i.category.toLowerCase() !== openedCategory.id.toLowerCase()
        );
        return [...otherItems, ...originalItems];
      });
      if (initialCategoryIcon) {
        localStorage.setItem(`cat_icon_${openedCategory.id}`, initialCategoryIcon);
      } else {
        localStorage.removeItem(`cat_icon_${openedCategory.id}`);
      }
      window.dispatchEvent(new Event('cat_icons_updated'));
      showToast('Отмена', `Изменения в категории «${openedCategory.title}» отменены.`, 'info');
    } catch (e) {
      console.error(e);
    }
  };

  // Handlers for Category Icons
  const handleUploadCategoryIcon = (catId: string, catTitle: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        localStorage.setItem(`cat_icon_${catId}`, e.target.result as string);
        window.dispatchEvent(new Event('cat_icons_updated'));
        showToast('Иконка категории обновлена', `Иконка для «${catTitle}» сохранена.`, 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetCategoryIcon = (catId: string, catTitle: string) => {
    localStorage.removeItem(`cat_icon_${catId}`);
    window.dispatchEvent(new Event('cat_icons_updated'));
    showToast('Иконка сброшена', `Иконка категории «${catTitle}» возвращена к стандартной.`, 'info');
  };

  // Handlers for App Platform Logo
  const handleUploadAppLogo = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const result = e.target.result as string;
        localStorage.setItem('app_custom_logo', result);
        setAppLogo(result);
        window.dispatchEvent(new Event('app_logo_updated'));
        showToast('Логотип обновлен', 'Новый логотип приложения (SVG/PNG) успешно загружен!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetAppLogo = () => {
    localStorage.removeItem('app_custom_logo');
    setAppLogo('/logo_iq_deko.svg');
    window.dispatchEvent(new Event('app_logo_updated'));
    showToast('Сброс логотипа', 'Восстановлен оригинальный логотип IQ DECO.', 'info');
  };

  // Handlers for Files Upload inside Opened Category (Single upload with Modal / Batch upload with red badge)
  const handleFilesToCategory = (cat: AdminLibraryCategory, filesList: FileList | File[]) => {
    const files = Array.from(filesList);
    if (files.length === 0) return;

    if (files.length === 1) {
      // Single file upload -> Open modal to specify name and price
      const file = files[0];
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target?.result) {
          const rawName = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
          const rawDataUrl = e.target.result as string;
          const optimizedUrl = await compressDataUrl(rawDataUrl);
          setSingleUploadImageUrl(optimizedUrl);
          setSingleUploadName(rawName);
          setSingleUploadPrice('');
          setIsSingleUploadModalOpen(true);
        }
      };
      reader.readAsDataURL(file);
      return;
    }

    // Batch upload -> Multi files uploaded with needsNaming: true flag and red highlight
    let processedCount = 0;
    const newItems: DecorLibraryItem[] = [];

    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target?.result) {
          const rawDataUrl = e.target.result as string;
          const dataUrl = await compressDataUrl(rawDataUrl);
          const rawName = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");

          const img = new Image();
          img.onload = () => {
            const aspect = (img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : 1;
            const h = 100;
            const w = Math.round(h * aspect);

            const item: DecorLibraryItem = {
              id: `dec_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`,
              name: rawName || `Объект ${decorItems.length + index + 1}`,
              category: cat.title,
              imageUrl: dataUrl,
              widthCm: w,
              heightCm: h,
              sku: `SKU-${Math.floor(Math.random() * 9000 + 1000)}`,
              description: '',
              needsNaming: true,
              isBatchUploaded: true
            };
            newItems.push(item);
            processedCount++;

            if (processedCount === files.length) {
              setDecorItems(prev => [...newItems, ...prev]);
              showToast('Пакетная загрузка', `Загружено ${files.length} файл(ов). Отмечены красной рамкой — кликните для переименования и указания цены.`, 'info');
            }
          };
          img.onerror = () => {
            const item: DecorLibraryItem = {
              id: `dec_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`,
              name: rawName || `Объект ${decorItems.length + index + 1}`,
              category: cat.title,
              imageUrl: dataUrl,
              widthCm: 100,
              heightCm: 100,
              sku: `SKU-${Math.floor(Math.random() * 9000 + 1000)}`,
              description: '',
              needsNaming: true,
              isBatchUploaded: true
            };
            newItems.push(item);
            processedCount++;

            if (processedCount === files.length) {
              setDecorItems(prev => [...newItems, ...prev]);
              showToast('Пакетная загрузка', `Загружено ${files.length} файл(ов). Отмечены красной рамкой — кликните для переименования и указания цены.`, 'info');
            }
          };
          img.src = dataUrl;
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Submit single uploaded file from modal
  const handleSaveSingleUploadedFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleUploadName.trim()) {
      showToast('Ошибка', 'Введите название файла', 'warn');
      return;
    }
    if (!openedCategory) return;

    const img = new Image();
    img.onload = () => {
      const aspect = (img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : 1;
      const h = 100;
      const w = Math.round(h * aspect);

      const newItem: DecorLibraryItem = {
        id: `dec_${Date.now()}`,
        name: singleUploadName.trim(),
        category: openedCategory.title,
        imageUrl: singleUploadImageUrl,
        widthCm: w,
        heightCm: h,
        price: singleUploadPrice ? Number(singleUploadPrice) : undefined,
        sku: `SKU-${Math.floor(Math.random() * 9000 + 1000)}`,
        description: '',
        needsNaming: false
      };

      setDecorItems(prev => [newItem, ...prev]);
      setIsSingleUploadModalOpen(false);
    };
    img.onerror = () => {
      const newItem: DecorLibraryItem = {
        id: `dec_${Date.now()}`,
        name: singleUploadName.trim(),
        category: openedCategory.title,
        imageUrl: singleUploadImageUrl,
        widthCm: 100,
        heightCm: 100,
        price: singleUploadPrice ? Number(singleUploadPrice) : undefined,
        sku: `SKU-${Math.floor(Math.random() * 9000 + 1000)}`,
        description: '',
        needsNaming: false
      };

      setDecorItems(prev => [newItem, ...prev]);
      setIsSingleUploadModalOpen(false);
    };
    if (singleUploadImageUrl) {
      img.src = singleUploadImageUrl;
    } else {
      img.onerror(new Event('error'));
    }
    setSingleUploadName('');
    setSingleUploadPrice('');
    setSingleUploadImageUrl('');
    showToast('Файл добавлен', `Объект «${singleUploadName.trim()}» успешно добавлен в категорию «${openedCategory?.title || ''}».`, 'success');
  };

  // Create new decor item manually via modal
  const handleCreateDecorItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDecorName.trim()) {
      showToast('Ошибка', 'Укажите название элемента', 'warn');
      return;
    }
    const newItem: DecorLibraryItem = {
      id: `dec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: newDecorName.trim(),
      category: newDecorCategory,
      sku: newDecorSku || `SKU-${Math.floor(Math.random() * 9000 + 1000)}`,
      widthCm: newDecorWidth,
      heightCm: newDecorHeight,
      description: newDecorDesc || undefined,
      imageUrl: newDecorImageUrl || undefined,
    };
    setDecorItems(prev => [newItem, ...prev]);
    setIsAddDecorModalOpen(false);
    setNewDecorName('');
    setNewDecorSku('');
    setNewDecorDesc('');
    setNewDecorImageUrl('');
    showToast('Успешно', `Объект «${newItem.name}» добавлен в библиотеку`, 'success');
  };

  // Update item
  const handleSaveEditedItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const updatedItem = {
      ...editingItem,
      needsNaming: false // Clear naming highlight when saved
    };
    setDecorItems(prev => prev.map(item => item.id === editingItem.id ? updatedItem : item));
    setEditingItem(null);
    showToast('Сохранено', `Параметры объекта «${updatedItem.name}» успешно обновлены.`, 'success');
  };

  // Create new category
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatTitle.trim()) return;
    const id = newCatTitle.trim().toLowerCase().replace(/\s+/g, '_');
    if (libraryCategories.some(c => c.title.toLowerCase() === newCatTitle.trim().toLowerCase())) {
      showToast('Внимание', 'Такая категория уже существует', 'warn');
      return;
    }
    const newCat: AdminLibraryCategory = {
      id,
      title: newCatTitle.trim(),
      description: newCatDesc.trim() || 'Пользовательская категория библиотеки'
    };
    setLibraryCategories(prev => [...prev, newCat]);
    setIsAddCategoryModalOpen(false);
    setNewCatTitle('');
    setNewCatDesc('');
    showToast('Категория добавлена', `Категория «${newCat.title}» создана.`, 'success');
  };

  // Delete category
  const handleDeleteCategory = (catId: string, catTitle: string) => {
    setLibraryCategories(prev => prev.filter(c => c.id !== catId));
    if (openedCategory?.id === catId) setOpenedCategory(null);
    showToast('Категория удалена', `Категория «${catTitle}» удалена из каталога.`, 'info');
  };

  // Delete single file/decor item
  const handleDeleteDecorItem = (id: string, name: string) => {
    setDecorItems(prev => prev.filter(item => item.id !== id));
    showToast('Удалено', `Файл «${name}» удален из библиотеки.`, 'info');
  };

  // Create tool icon
  const handleCreateIcon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIconName.trim()) {
      showToast('Ошибка', 'Введите название инструмента', 'warn');
      return;
    }
    const newItem: ToolIconItem = {
      id: `custom_icon_${Date.now()}`,
      toolName: newIconName.trim(),
      category: newIconCategory,
      customIconUrl: newIconFile || undefined,
      isCustom: true
    };
    setToolIcons(prev => [newItem, ...prev]);
    setIsAddIconModalOpen(false);
    setNewIconName('');
    setNewIconFile(null);
    showToast('Иконка добавлена', `Иконка для инструмента «${newItem.toolName}» создана.`, 'success');
  };

  const handleExportBackup = () => {
    const backupData = {
      icons: toolIcons,
      categories: libraryCategories,
      decorLibrary: decorItems,
      exportDate: new Date().toISOString()
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fleur_admin_library_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Экспорт завершен', 'Полный бэкап базы библиотеки скачан.', 'success');
  };

  // Filtered categories
  const filteredCategories = libraryCategories.filter(cat =>
    cat.title.toLowerCase().includes(categorySearch.toLowerCase()) ||
    cat.description.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Files belonging to opened category
  const openedCategoryFiles = openedCategory
    ? decorItems.filter(item =>
        (item.category.toLowerCase() === openedCategory.title.toLowerCase() ||
         item.category.toLowerCase() === openedCategory.id.toLowerCase()) &&
        (item.name.toLowerCase().includes(fileSearch.toLowerCase()) ||
         (item.sku && item.sku.toLowerCase().includes(fileSearch.toLowerCase())))
      )
    : [];

  return (
    <div className="space-y-6">
      {/* 1. GLASSMORPHISM HEADER CANVAS (AGENTS_md Standard) */}
      <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] sm:rounded-[32px] border border-zinc-200/50 dark:border-zinc-800/40 shadow-xs p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-[var(--lavenderSoft)] rounded-xl shrink-0">
            <ShieldCheck className="w-6 h-6 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Кабинет администратора
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--primary-accent)]/10 text-[var(--primary-accent)] dark:text-purple-300 border border-[var(--primary-accent)]/20">
                ADMIN V2
              </span>
            </div>
            <p className="text-sm font-normal text-zinc-700 dark:text-zinc-300 leading-relaxed mt-0.5">
              Управление библиотекой редактора: категории, иконки категорий и загрузка файлов
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleExportBackup}
          className="bg-transparent border border-zinc-300 dark:border-zinc-700 hover:border-[var(--primary-accent)] rounded-full px-4 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-[var(--primary-accent)]" />
          <span>Скачать бэкап JSON</span>
        </button>
      </div>

      {/* 2. ADMIN TABS SWITCHER */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { key: 'library', label: 'Библиотека редактора', icon: <Package className="w-4 h-4" />, count: decorItems.length },
          { key: 'icons', label: 'Иконки инструментов', icon: <Palette className="w-4 h-4" />, count: toolIcons.length },
          { key: 'categories', label: 'Категории каталога', icon: <Tag className="w-4 h-4" />, count: libraryCategories.length },
          { key: 'logo', label: 'Логотип приложения', icon: <Sparkles className="w-4 h-4" /> },
          { key: 'backup', label: 'Резервные копии', icon: <FileJson className="w-4 h-4" /> }
        ].map(tab => {
          const isActive = adminTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setAdminTab(tab.key as any);
                if (tab.key !== 'library') setOpenedCategory(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? 'text-white shadow-md'
                  : 'bg-white/40 dark:bg-zinc-900/30 text-zinc-700 dark:text-zinc-300 hover:bg-white/60 dark:hover:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-800/40'
              }`}
              style={isActive ? { background: 'linear-gradient(135deg, var(--primary-grad-from) 0%, var(--primary-grad-to) 100%)' } : undefined}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. TAB 1: LIBRARY MANAGER (CATEGORIES GRID OR OPENED CATEGORY FILES) */}
      {adminTab === 'library' && (
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {!openedCategory ? (
              /* ================= VIEW A: CATEGORIES OVERVIEW ================= */
              <motion.div
                key="categories-overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] border border-zinc-200/50 dark:border-zinc-800/40 shadow-xs p-5 sm:p-6 space-y-5"
              >
                {/* Header controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200/50 dark:border-zinc-800/40">
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                      Категории библиотеки
                    </h2>
                    <p className="text-xs sm:text-sm font-normal text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      Нажмите на категорию, чтобы открыть список ее файлов или изменить иконку категории
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        value={categorySearch}
                        onChange={e => setCategorySearch(e.target.value)}
                        placeholder="Поиск категории..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-full text-xs bg-white/60 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary-accent)]/40"
                      />
                    </div>

                    <button
                      onClick={() => setIsAddCategoryModalOpen(true)}
                      style={{ background: 'linear-gradient(135deg, var(--primary-grad-from) 0%, var(--primary-grad-to) 100%)' }}
                      className="rounded-full px-4 py-1.5 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md hover:opacity-90 transition-all cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Категория</span>
                    </button>
                  </div>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCategories.map(cat => {
                    const itemCount = decorItems.filter(i =>
                      i.category.toLowerCase() === cat.title.toLowerCase() ||
                      i.category.toLowerCase() === cat.id.toLowerCase()
                    ).length;
                    const hasCustomIcon = !!localStorage.getItem(`cat_icon_${cat.id}`);

                    return (
                      <div
                        key={cat.id}
                        className="group relative bg-white/60 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/50 rounded-2xl p-4 transition-all hover:border-[var(--primary-accent)]/50 hover:shadow-md flex flex-col justify-between gap-3"
                      >
                        {/* Top Row: Icon + Title + Count */}
                        <div
                          onClick={() => handleOpenCategory(cat)}
                          className="flex items-start gap-3 cursor-pointer"
                        >
                          <div className="p-2.5 bg-[var(--lavenderSoft)] rounded-xl shrink-0 group-hover:scale-105 transition-transform">
                            <CategoryIconDisplay catId={cat.id} catTitle={cat.title} className="w-6 h-6 text-[var(--primary-accent)] dark:text-[#C084FC]" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-[var(--primary-accent)] transition-colors">
                                {cat.title}
                              </h3>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--primary-accent)]/10 text-[var(--primary-accent)] dark:text-purple-300 shrink-0">
                                {itemCount} файл.
                              </span>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-0.5">
                              {cat.description}
                            </p>
                          </div>
                        </div>

                        {/* Bottom Row: Actions (Change Icon opposite icon, Open Category) */}
                        <div className="pt-2 border-t border-zinc-200/40 dark:border-zinc-700/40 flex items-center justify-between gap-2 text-xs">
                          {/* Icon upload button directly opposite/next to category icon */}
                          <div className="flex items-center gap-1.5">
                            <label
                              title="Загрузить пользовательскую иконку для этой категории (SVG / PNG)"
                              className="px-2.5 py-1 rounded-full border border-[var(--primary-accent)]/30 hover:bg-[var(--primary-accent)]/10 text-[var(--primary-accent)] dark:text-purple-300 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Upload className="w-3 h-3" />
                              <span>{hasCustomIcon ? 'Иконка ✓' : 'Иконка'}</span>
                              <input
                                type="file"
                                accept="image/svg+xml,image/png,image/jpeg"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleUploadCategoryIcon(cat.id, cat.title, e.target.files[0]);
                                  }
                                }}
                              />
                            </label>

                            {hasCustomIcon && (
                              <button
                                onClick={() => handleResetCategoryIcon(cat.id, cat.title)}
                                title="Сбросить иконку к стандартной"
                                className="p-1 rounded-full hover:bg-rose-500/10 text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                              >
                                <RotateCcw className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          {/* Open Category Button */}
                          <button
                            onClick={() => handleOpenCategory(cat)}
                            className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-700/80 hover:bg-[var(--primary-accent)] hover:text-white dark:hover:bg-[var(--primary-accent)] text-zinc-700 dark:text-zinc-200 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                          >
                            <span>Открыть</span>
                            <FolderOpen className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              /* ================= VIEW B: OPENED CATEGORY FILES ================= */
              <motion.div
                key="opened-category-files"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] border border-zinc-200/50 dark:border-zinc-800/40 shadow-xs p-5 sm:p-6 space-y-5"
              >
                {/* Category Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200/50 dark:border-zinc-800/40">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCloseCategory}
                      className="p-2 rounded-full bg-white/80 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-all cursor-pointer shadow-xs"
                      title="Назад ко всем категориям"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="p-2.5 bg-[var(--lavenderSoft)] rounded-xl shrink-0">
                      <CategoryIconDisplay catId={openedCategory.id} catTitle={openedCategory.title} className="w-6 h-6 text-[var(--primary-accent)] dark:text-[#C084FC]" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                          Категория: {openedCategory.title}
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--primary-accent)]/10 text-[var(--primary-accent)] dark:text-purple-300">
                          {openedCategoryFiles.length} файл(ов)
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                        {openedCategory.description}
                      </p>
                    </div>
                  </div>

                  {/* Top Action Controls inside Opened Category (Strictly 2 buttons) */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Button 1: Upload Category Icon */}
                    <label
                      title="Загрузить / изменить иконку категории"
                      className="px-3.5 py-2 rounded-full border border-[var(--primary-accent)]/40 bg-white/50 dark:bg-zinc-800/50 hover:bg-[var(--primary-accent)]/10 text-[var(--primary-accent)] dark:text-purple-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Изменить иконку</span>
                      <input
                        type="file"
                        accept="image/svg+xml,image/png,image/jpeg"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleUploadCategoryIcon(openedCategory.id, openedCategory.title, e.target.files[0]);
                          }
                        }}
                      />
                    </label>

                    {/* Button 2: Primary Upload Files to Category */}
                    <label
                      style={{ background: 'linear-gradient(135deg, var(--primary-grad-from) 0%, var(--primary-grad-to) 100%)' }}
                      className="rounded-full px-4 py-2 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md hover:opacity-90 transition-all cursor-pointer"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Загрузить файлы в категорию</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files) {
                            handleFilesToCategory(openedCategory, e.target.files);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(true);
                  }}
                  onDragLeave={() => setIsDraggingOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(false);
                    if (e.dataTransfer.files) {
                      handleFilesToCategory(openedCategory, e.dataTransfer.files);
                    }
                  }}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                    isDraggingOver
                      ? 'border-[var(--primary-accent)] bg-[var(--primary-accent)]/10'
                      : 'border-zinc-300/80 dark:border-zinc-700/80 bg-white/30 dark:bg-zinc-800/20'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 bg-[var(--lavenderSoft)] rounded-full text-[var(--primary-accent)]">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      Перетащите сюда файлы изображений (PNG, JPG, WebP, SVG)
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Все добавленные файлы моментально появятся в категории «{openedCategory.title}»
                    </p>
                  </div>
                </div>

                {/* Search in opened category */}
                <div className="flex items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={fileSearch}
                      onChange={e => setFileSearch(e.target.value)}
                      placeholder={`Поиск объектов в «${openedCategory.title}»...`}
                      className="w-full pl-8 pr-3 py-1.5 rounded-full text-xs bg-white/60 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary-accent)]/40"
                    />
                  </div>
                </div>

                {/* Files Grid inside Category */}
                {openedCategoryFiles.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {openedCategoryFiles.map((item) => {
                      const isUnnamed = item.needsNaming;
                      return (
                        <div
                          key={item.id}
                          className={`group bg-white/70 dark:bg-zinc-800/50 border rounded-2xl p-2.5 flex flex-col justify-between hover:shadow-md transition-all ${
                            isUnnamed
                              ? 'border-2 border-rose-500 bg-rose-500/5 dark:border-rose-500/80 dark:bg-rose-950/20'
                              : 'border-zinc-200/60 dark:border-zinc-700/50 hover:border-[var(--primary-accent)]/50'
                          }`}
                        >
                          {/* Thumbnail */}
                          <div className="aspect-square rounded-xl bg-zinc-100/80 dark:bg-zinc-900/80 overflow-hidden relative border border-zinc-200/50 dark:border-zinc-700/30 flex items-center justify-center p-2">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform"
                            />
                            {isUnnamed ? (
                              <button
                                onClick={() => setEditingItem(item)}
                                className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center gap-1 shadow-md hover:bg-rose-600 transition-colors cursor-pointer animate-pulse"
                                title="Кликните, чтобы назвать объект и указать цену"
                              >
                                <AlertCircle className="w-3 h-3" /> Имя и цена
                              </button>
                            ) : item.sku && (
                              <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-zinc-900/70 text-white text-[9px] font-mono">
                                {item.sku}
                              </span>
                            )}
                          </div>

                          {/* Title & Price */}
                          <div className="mt-2 space-y-1">
                            <p className={`text-xs font-semibold line-clamp-2 leading-tight ${isUnnamed ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-zinc-900 dark:text-zinc-100'}`}>
                              {item.name}
                            </p>
                            <p className="text-[11px] font-semibold text-[#8C52D0] dark:text-purple-300">
                              {item.price ? `${item.price.toLocaleString('ru-RU')} ₽` : 'Цена не указана'}
                            </p>
                          </div>

                          {/* File Action buttons */}
                          <div className="pt-2 mt-2 border-t border-zinc-200/40 dark:border-zinc-700/40 flex items-center justify-between gap-1">
                            <button
                              onClick={() => setEditingItem(item)}
                              className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-semibold"
                              title="Редактировать параметры"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Правка</span>
                            </button>

                            <button
                              onClick={() => handleDeleteDecorItem(item.id, item.name)}
                              className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors cursor-pointer"
                              title="Удалить из категории"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                      <FolderOpen className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      В категории «{openedCategory.title}» пока нет файлов
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                      Нажмите кнопку «Загрузить файлы в категорию» или перетащите изображения в область выше
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 4. TAB 2: TOOL ICON MANAGER */}
      {adminTab === 'icons' && (
        <div className="space-y-4">
          <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] border border-zinc-200/50 dark:border-zinc-800/40 shadow-xs p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200/50 dark:border-zinc-800/40">
              <div>
                <h2 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Иконки инструментов программы
                </h2>
                <p className="text-xs sm:text-sm font-normal text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Загружайте пользовательские SVG/PNG иконки для инструментов холста и панелей
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={iconSearch}
                    onChange={e => setIconSearch(e.target.value)}
                    placeholder="Поиск инструмента..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-full text-xs bg-white/60 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary-accent)]/40"
                  />
                </div>

                <button
                  onClick={() => setIsAddIconModalOpen(true)}
                  style={{ background: 'linear-gradient(135deg, var(--primary-grad-from) 0%, var(--primary-grad-to) 100%)' }}
                  className="rounded-full px-4 py-1.5 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md hover:opacity-90 transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Загрузить иконку</span>
                </button>
              </div>
            </div>

            {/* Grid of tool icons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {toolIcons.filter(i =>
                i.toolName.toLowerCase().includes(iconSearch.toLowerCase()) ||
                i.category.toLowerCase().includes(iconSearch.toLowerCase())
              ).map(icon => (
                <div
                  key={icon.id}
                  className="p-3.5 rounded-2xl bg-white/60 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/50 flex items-center justify-between gap-3 hover:border-[var(--primary-accent)]/40 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[var(--lavenderSoft)] flex items-center justify-center shrink-0 border border-[var(--primary-accent)]/20 p-2 overflow-hidden">
                      {icon.customIconUrl ? (
                        <img src={icon.customIconUrl} alt={icon.toolName} className="w-full h-full object-contain" />
                      ) : (
                        <Sliders className="w-5 h-5 text-[var(--primary-accent)] dark:text-[#C084FC]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {icon.toolName}
                      </p>
                      <p className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400">
                        {icon.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {icon.isCustom ? (
                      <button
                        onClick={() => {
                          setToolIcons(prev => prev.map(item => item.id === icon.id ? { ...item, customIconUrl: undefined, isCustom: false } : item));
                          showToast('Сброс', 'Стандартная иконка восстановлена.', 'info');
                        }}
                        title="Сбросить к системной"
                        className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-700 hover:bg-rose-500/10 text-rose-500 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Системная
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 3: CATEGORIES LIST MANAGER */}
      {adminTab === 'categories' && (
        <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] border border-zinc-200/50 dark:border-zinc-800/40 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200/50 dark:border-zinc-800/40">
            <div>
              <h2 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                Категории библиотечного каталога
              </h2>
              <p className="text-xs sm:text-sm font-normal text-zinc-700 dark:text-zinc-300 leading-relaxed">
                Добавляйте новые разделы каталога и привязывайте к ним специфические декорации
              </p>
            </div>

            <button
              onClick={() => setIsAddCategoryModalOpen(true)}
              style={{ background: 'linear-gradient(135deg, var(--primary-grad-from) 0%, var(--primary-grad-to) 100%)' }}
              className="rounded-full px-4 py-2 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md hover:opacity-90 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Создать новую категорию</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {libraryCategories.map(cat => {
              const count = decorItems.filter(i => i.category.toLowerCase() === cat.title.toLowerCase() || i.category.toLowerCase() === cat.id.toLowerCase()).length;
              return (
                <div
                  key={cat.id}
                  className="p-4 rounded-2xl bg-white/60 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/50 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 bg-[var(--lavenderSoft)] rounded-xl shrink-0">
                      <CategoryIconDisplay catId={cat.id} catTitle={cat.title} className="w-5 h-5 text-[var(--primary-accent)] dark:text-[#C084FC]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {cat.title}
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {cat.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--primary-accent)]/10 text-[var(--primary-accent)] dark:text-purple-300">
                      {count} об.
                    </span>
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.title)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors cursor-pointer"
                      title="Удалить категорию"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: APP LOGO MANAGEMENT */}
      {adminTab === 'logo' && (
        <motion.div
          key="logo-management"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] sm:rounded-[32px] border border-zinc-200/50 dark:border-zinc-800/40 shadow-xs p-5 sm:p-6 space-y-6"
        >
          {/* Header */}
          <div className="flex items-center gap-3.5 pb-4 border-b border-zinc-200/40 dark:border-zinc-800/40">
            <div className="p-2 bg-[var(--lavenderSoft)] rounded-xl shrink-0">
              <Sparkles className="w-5 h-5 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                Логотип и брендинг приложения
              </h3>
              <p className="text-xs sm:text-sm font-normal text-zinc-700 dark:text-zinc-300 leading-relaxed">
                Загрузите фирменный логотип платформы в формате SVG или PNG для отображения в боковом меню и шапке приложения
              </p>
            </div>
          </div>

          {/* Grid Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Light Preview */}
            <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-700">Отображение в светлой теме</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                  {localStorage.getItem('app_custom_logo') ? 'Пользовательский' : 'Стандартный'}
                </span>
              </div>
              <div className="h-24 rounded-xl bg-zinc-50 border border-zinc-200/60 p-4 flex items-center justify-center">
                <img src={appLogo} alt="App Logo Light Preview" className="max-h-16 max-w-full object-contain" />
              </div>
            </div>

            {/* Dark Preview */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200">Отображение в тёмной теме</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300">
                  {localStorage.getItem('app_custom_logo') ? 'Пользовательский' : 'Стандартный'}
                </span>
              </div>
              <div className="h-24 rounded-xl bg-zinc-950 border border-zinc-800 p-4 flex items-center justify-center">
                <img src={appLogo} alt="App Logo Dark Preview" className="max-h-16 max-w-full object-contain" />
              </div>
            </div>
          </div>

          {/* Upload Controls */}
          <div className="p-5 rounded-2xl bg-white/60 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/50 space-y-4">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Загрузить новый файл логотипа (SVG / PNG)
            </h4>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <label className="flex-1 cursor-pointer">
                <div className="px-5 py-3.5 rounded-2xl border-2 border-dashed border-[var(--primary-accent)]/40 hover:border-[var(--primary-accent)] bg-[var(--lavenderSoft)]/30 dark:bg-purple-950/20 text-[var(--primary-accent)] dark:text-purple-300 text-xs font-semibold transition-all flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span>Выбрать логотип в формате SVG или PNG</span>
                </div>
                <input
                  type="file"
                  accept="image/svg+xml,image/png,image/jpeg"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleUploadAppLogo(e.target.files[0]);
                    }
                  }}
                />
              </label>

              {localStorage.getItem('app_custom_logo') && (
                <button
                  type="button"
                  onClick={handleResetAppLogo}
                  className="px-4 py-3.5 rounded-2xl border border-rose-300 dark:border-rose-800/60 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Сбросить логотип</span>
                </button>
              )}
            </div>

            {/* Notice Box per AGENTS_md instructions */}
            <div className="p-3.5 bg-emerald-500/10 dark:bg-emerald-950/30 rounded-2xl border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200 font-normal leading-relaxed flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong>Поддержка форматов:</strong> Рекомендуется загружать файлы <strong>SVG</strong> для маштабируемой векторной четкости на Retina-экранах или <strong>PNG</strong> с прозрачным фоном. Логотип сразу же обновится в боковом меню и во всём приложении.
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 5: BACKUP & RESTORE */}
      {adminTab === 'backup' && (
        <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] border border-zinc-200/50 dark:border-zinc-800/40 shadow-xs p-5 sm:p-6 space-y-4">
          <h2 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Резервные копии и синхронизация
          </h2>
          <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            Вы можете экспортировать полную базу данных объектов, кастомных иконок и категорий в единый JSON-файл для восстановления на другом устройстве.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={handleExportBackup}
              style={{ background: 'linear-gradient(135deg, var(--primary-grad-from) 0%, var(--primary-grad-to) 100%)' }}
              className="rounded-full px-5 py-2.5 text-white font-semibold text-xs flex items-center gap-2 shadow-md hover:opacity-90 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Скачать резервную копию JSON</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= MODALS ================= */}

      {/* Modal 1: Add Category */}
      <AnimatePresence>
        {isAddCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[28px] p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Создание новой категории
                </h3>
                <button
                  onClick={() => setIsAddCategoryModalOpen(false)}
                  className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal block mb-1">
                    НАЗВАНИЕ КАТЕГОРИИ
                  </label>
                  <input
                    type="text"
                    required
                    value={newCatTitle}
                    onChange={e => setNewCatTitle(e.target.value)}
                    placeholder="Например: Фотозоны"
                    className="w-full px-4 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary-accent)]/40"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal block mb-1">
                    ОПИСАНИЕ КАТЕГОРИИ
                  </label>
                  <input
                    type="text"
                    value={newCatDesc}
                    onChange={e => setNewCatDesc(e.target.value)}
                    placeholder="Краткое описание содержимого"
                    className="w-full px-4 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary-accent)]/40"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddCategoryModalOpen(false)}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    style={{ background: 'linear-gradient(135deg, var(--primary-grad-from) 0%, var(--primary-grad-to) 100%)' }}
                    className="px-5 py-2 rounded-full text-xs font-semibold text-white shadow-md hover:opacity-90"
                  >
                    Создать
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 2: Add Single Decor File */}
      <AnimatePresence>
        {isAddDecorModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[28px] p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Добавление объекта в библиотеку
                </h3>
                <button
                  onClick={() => setIsAddDecorModalOpen(false)}
                  className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateDecorItem} className="space-y-4">
                <div>
                  <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal block mb-1">
                    НАЗВАНИЕ ЭЛЕМЕНТА *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDecorName}
                    onChange={e => setNewDecorName(e.target.value)}
                    placeholder="Например: Арка кольцо 2.2м"
                    className="w-full px-4 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal block mb-1">
                      КАТЕГОРИЯ
                    </label>
                    <select
                      value={newDecorCategory}
                      onChange={e => setNewDecorCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                    >
                      {libraryCategories.map(cat => (
                        <option key={cat.id} value={cat.title}>
                          {cat.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal block mb-1">
                      АРТИКУЛ (SKU)
                    </label>
                    <input
                      type="text"
                      value={newDecorSku}
                      onChange={e => setNewDecorSku(e.target.value)}
                      placeholder="ARC-001"
                      className="w-full px-4 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal block mb-1">
                      ШИРИНА (СМ)
                    </label>
                    <input
                      type="number"
                      value={newDecorWidth}
                      onChange={e => setNewDecorWidth(Number(e.target.value))}
                      className="w-full px-4 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal block mb-1">
                      ВЫСОТА (СМ)
                    </label>
                    <input
                      type="number"
                      value={newDecorHeight}
                      onChange={e => setNewDecorHeight(Number(e.target.value))}
                      className="w-full px-4 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal block mb-1">
                    ФАЙЛ ИЗОБРАЖЕНИЯ
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="px-4 py-2 rounded-xl border border-[var(--primary-accent)]/40 text-[var(--primary-accent)] dark:text-purple-300 text-xs font-semibold cursor-pointer hover:bg-[var(--primary-accent)]/10 flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Выбрать файл</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              if (ev.target?.result) setNewDecorImageUrl(ev.target.result as string);
                            };
                            reader.readAsDataURL(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                    {newDecorImageUrl && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Файл загружен
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddDecorModalOpen(false)}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-zinc-600 dark:text-zinc-300"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    style={{ background: 'linear-gradient(135deg, var(--primary-grad-from) 0%, var(--primary-grad-to) 100%)' }}
                    className="px-5 py-2 rounded-full text-xs font-semibold text-white shadow-md hover:opacity-90"
                  >
                    Сохранить объект
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 3: Add Custom Tool Icon */}
      <AnimatePresence>
        {isAddIconModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[28px] p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Загрузка иконки инструмента
                </h3>
                <button
                  onClick={() => setIsAddIconModalOpen(false)}
                  className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateIcon} className="space-y-4">
                <div>
                  <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal block mb-1">
                    НАЗВАНИЕ ИНСТРУМЕНТА
                  </label>
                  <input
                    type="text"
                    required
                    value={newIconName}
                    onChange={e => setNewIconName(e.target.value)}
                    placeholder="Например: Панель слоев"
                    className="w-full px-4 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal block mb-1">
                    ФАЙЛ ИКОНКИ (SVG или PNG)
                  </label>
                  <label className="px-4 py-2 rounded-xl border border-[var(--primary-accent)]/40 text-[var(--primary-accent)] dark:text-purple-300 text-xs font-semibold cursor-pointer hover:bg-[var(--primary-accent)]/10 flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>Загрузить SVG/PNG</span>
                    <input
                      type="file"
                      accept="image/svg+xml,image/png,image/jpeg"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) setNewIconFile(ev.target.result as string);
                          };
                          reader.readAsDataURL(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                  {newIconFile && (
                    <div className="mt-2 flex items-center gap-2 p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                      <img src={newIconFile} alt="Preview" className="w-6 h-6 object-contain" />
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Иконка выбрана</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddIconModalOpen(false)}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-zinc-600 dark:text-zinc-300"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    style={{ background: 'linear-gradient(135deg, var(--primary-grad-from) 0%, var(--primary-grad-to) 100%)' }}
                    className="px-5 py-2 rounded-full text-xs font-semibold text-white shadow-md hover:opacity-90"
                  >
                    Сохранить иконку
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 4: Edit Decor Item */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[28px] p-6 max-w-lg w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Редактирование параметров файла
                </h3>
                <button
                  onClick={() => setEditingItem(null)}
                  className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditedItem} className="space-y-4">
                <div>
                  <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal block mb-1">
                    НАЗВАНИЕ ФАЙЛА / ОБЪЕКТА
                  </label>
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal block mb-1">
                      ШИРИНА (СМ)
                    </label>
                    <input
                      type="number"
                      value={editingItem.widthCm}
                      onChange={e => setEditingItem({ ...editingItem, widthCm: Number(e.target.value) })}
                      className="w-full px-4 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal block mb-1">
                      ВЫСОТА (СМ)
                    </label>
                    <input
                      type="number"
                      value={editingItem.heightCm}
                      onChange={e => setEditingItem({ ...editingItem, heightCm: Number(e.target.value) })}
                      className="w-full px-4 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal block mb-1">
                      СТОИМОСТЬ (₽)
                    </label>
                    <input
                      type="number"
                      value={editingItem.price || ''}
                      onChange={e => setEditingItem({ ...editingItem, price: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="Укажите цену"
                      className="w-full px-4 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal block mb-1">
                      АРТИКУЛ (SKU)
                    </label>
                    <input
                      type="text"
                      value={editingItem.sku || ''}
                      onChange={e => setEditingItem({ ...editingItem, sku: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-zinc-600 dark:text-zinc-300"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    style={{ background: 'linear-gradient(135deg, var(--primary-grad-from) 0%, var(--primary-grad-to) 100%)' }}
                    className="px-5 py-2 rounded-full text-xs font-semibold text-white shadow-md hover:opacity-90 cursor-pointer"
                  >
                    Сохранить изменения
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 5: Single File Upload Modal (Name + Price) */}
      <AnimatePresence>
        {isSingleUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[28px] p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Загрузка файла в «{openedCategory?.title}»
                </h3>
                <button
                  onClick={() => setIsSingleUploadModalOpen(false)}
                  className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSingleUploadedFile} className="space-y-4">
                {/* Image Preview */}
                {singleUploadImageUrl && (
                  <div className="w-full h-40 rounded-2xl bg-zinc-100 dark:bg-zinc-800 p-2 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                    <img src={singleUploadImageUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal block mb-1">
                    НАЗВАНИЕ ФАЙЛА / ОБЪЕКТА *
                  </label>
                  <input
                    type="text"
                    required
                    value={singleUploadName}
                    onChange={e => setSingleUploadName(e.target.value)}
                    placeholder="Например: Арка золотая полукруглая"
                    className="w-full px-4 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary-accent)]/40"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal block mb-1">
                    СТОИМОСТЬ (₽)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={singleUploadPrice}
                      onChange={e => setSingleUploadPrice(e.target.value)}
                      placeholder="Например: 1500"
                      className="w-full px-4 py-2 pr-8 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary-accent)]/40"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">₽</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSingleUploadModalOpen(false)}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    style={{ background: 'linear-gradient(135deg, var(--primary-grad-from) 0%, var(--primary-grad-to) 100%)' }}
                    className="px-5 py-2 rounded-full text-xs font-semibold text-white shadow-md hover:opacity-90 transition-all cursor-pointer"
                  >
                    Сохранить файл
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Action Bar for Unsaved Changes inside Opened Category */}
      <AnimatePresence>
        {openedCategory && hasCategoryChanges && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50 bg-zinc-900/95 dark:bg-zinc-950/95 text-white backdrop-blur-md rounded-2xl px-5 py-3.5 border border-zinc-700/60 shadow-2xl flex flex-wrap items-center gap-4"
          >
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <span>Есть несохраненные изменения в категории «{openedCategory.title}»</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCancelCategoryChanges}
                className="px-4 py-1.5 rounded-full border border-zinc-600 hover:border-zinc-400 text-zinc-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
              >
                Отмена
              </button>

              <button
                onClick={handleSaveCategoryChanges}
                style={{ background: 'linear-gradient(135deg, var(--primary-grad-from) 0%, var(--primary-grad-to) 100%)' }}
                className="px-5 py-1.5 text-white text-xs font-semibold rounded-full shadow-md hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Сохранить</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
