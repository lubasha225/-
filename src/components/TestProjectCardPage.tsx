import React, { useState, useEffect, useRef } from 'react';
import { EditorSketchCanvasPreview } from './EditorSketchCanvasPreview';
import { SketchLightboxModal } from './SketchLightboxModal';
import { toJpeg } from 'html-to-image';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ArrowLeft,
  Plus,
  Trash2,
  Check,
  Search,
  RotateCcw,
  Sliders,
  Eye,
  Lock,
  Sparkles,
  Info,
  Calendar,
  MapPin,
  User,
  Mail,
  Palette,
  FileText,
  Layout,
  Share2,
  FolderOpen,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Phone,
  HelpCircle,
  Zap,
  CheckCircle2,
  CheckCircle,
  Download,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  ChevronsRight,
  ChevronsLeft,
  CheckSquare,
  FileSpreadsheet,
  FileCheck,
  Send,
  Edit2,
  Image as ImageIcon,
  ArrowUpRight,
  Filter,
  MessageSquare,
  Layers,
  Award,
  Save,
  Flower2,
  Truck,
  ShieldCheck,
  FileSignature,
  Wallet,
  Receipt,
  CreditCard,
  FlaskConical
} from 'lucide-react';
import { Project, EstimateItem } from '../types';
import DeleteConfirmModal from './DeleteConfirmModal';

interface TestProjectCardPageProps {
  project: Project | null;
  isOpen?: boolean;
  onClose?: () => void;
  onUpdateProject: (updated: Project) => void;
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warn') => void;
  onOpenEditor?: () => void;
}

interface JournalEntry {
  id: string;
  timestamp: string;
  type: 'system' | 'user-note' | 'important' | 'client-agreed';
  text: string;
  linkedItemId: string | null;
}

export default function TestProjectCardPage({
  project,
  onClose,
  onUpdateProject,
  showToast,
  onOpenEditor
}: TestProjectCardPageProps) {
  if (!project) return null;

  // Tabs for Variant 1: 'all' | 'brief' | 'design' | 'calc' | 'journal' | 'docs' | 'calendar'
  const [activeTab, setActiveTab] = useState<'all' | 'brief' | 'design' | 'calc' | 'journal' | 'docs' | 'calendar'>('all');

  // Commercial financial calculation settings
  const [markupPercent, setMarkupPercent] = useState<number>(20);
  const [taxRate, setTaxRate] = useState<number>(6);
  const [finalPrice, setFinalPrice] = useState<number>(() => project.clientPrice !== undefined ? project.clientPrice : (project.budget || 95000));
  const [prepayment, setPrepayment] = useState<number>(30000);

  // Hotspot modal state
  const [activeArchPoint, setActiveArchPoint] = useState<string>('A-304');
  const [isSpecModalOpen, setIsSpecModalOpen] = useState<boolean>(false);
  const [briefCollapsed, setBriefCollapsed] = useState<boolean>(false);
  const [journalCollapsed, setJournalCollapsed] = useState<boolean>(false);
  const [isStepMenuOpen, setIsStepMenuOpen] = useState<boolean>(false);

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

  // Custom decorator fields dynamically added by user
  const [customDecoratorFields, setCustomDecoratorFields] = useState<{ id: string; key: string }[]>([]);
  const [isAddingCustomField, setIsAddingCustomField] = useState<boolean>(false);
  const [newFieldName, setNewFieldName] = useState<string>('');

  // Brief values state for direct inline editing on cards
  const [briefValues, setBriefValues] = useState<Record<string, string>>(() => {
    const saved = project.briefValues || {};
    return {
      "ИМЯ КЛИЕНТА": project.clientName && project.clientName !== 'Не указан' ? project.clientName : (saved["ИМЯ КЛИЕНТА"] || ""),
      "ТЕЛЕФОН": project.clientPhone || saved["ТЕЛЕФОН"] || "",
      "СОБЫТИЕ": project.name && !project.name.startsWith('proj_') ? project.name : (saved["СОБЫТИЕ"] || ""),
      "ДАТА": project.date || saved["ДАТА"] || "",
      "ГОСТЕЙ": project.brief?.guestsCount ? String(project.brief.guestsCount) : (saved["ГОСТЕЙ"] || ""),
      "ФОРМАТ СОБЫТИЯ": saved["ФОРМАТ СОБЫТИЯ"] || "",
      "АДРЕС ПЛОЩАДКИ/НАЗВАНИЕ": project.venue && project.venue !== 'Площадка не указана' ? project.venue : (saved["АДРЕС ПЛОЩАДКИ/НАЗВАНИЕ"] || saved["ПЛОЩАДКА"] || ""),
      "КОНТАКТ ПЛОЩАДКИ": saved["КОНТАКТ ПЛОЩАДКИ"] || "",
      "РАЗМЕР ЗОНЫ МОНТАЖА": saved["РАЗМЕР ЗОНЫ МОНТАЖА"] || "",
      "КРЕПЕЖ К СТЕНАМ": saved["КРЕПЕЖ К СТЕНАМ"] || "",
      "КРЕПЕЖ К ПОТОЛКУ": saved["КРЕПЕЖ К ПОТОЛКУ"] || "",
      "СОГЛАСОВАНИЕ ОФОРМЛЕНИЯ": saved["СОГЛАСОВАНИЕ ОФОРМЛЕНИЯ"] || "",
      "ЭЛЕКТРИЧЕСТВО У СЦЕНЫ": saved["ЭЛЕКТРИЧЕСТВО У СЦЕНЫ"] || "",
      "ПОДЪЕЗД / ГРУЗОВОЙ ЛИФТ": saved["ПОДЪЕЗД / ГРУЗОВОЙ ЛИФТ"] || "",
      "ПРАЗДНИК НА УЛИЦЕ": saved["ПРАЗДНИК НА УЛИЦЕ"] || "",
      "ДОСТУП НА МОНТАЖ": saved["ДОСТУП НА МОНТАЖ"] || "",
      "ОКНО МОНТАЖА": saved["ОКНО МОНТАЖА"] || "",
      "ХРАНЕНИЕ НА ПЛОЩАДКЕ": saved["ХРАНЕНИЕ НА ПЛОЩАДКЕ"] || "",
      "ДЕМОНТАЖ / ВЫВОЗ": saved["ДЕМОНТАЖ / ВЫВОЗ"] || "",
      "КТО ПРИНИМАЕТ РАБОТЫ": saved["КТО ПРИНИМАЕТ РАБОТЫ"] || "",
      "ПАЛИТРА ОФОРМЛЕНИЯ": project.brief?.colors && project.brief.colors.length > 0 && project.brief.colors[0] !== '#FFFFFF' ? project.brief.colors.join(', ') : (saved["ПАЛИТРА ОФОРМЛЕНИЯ"] || ""),
      "СТИЛЬ ОФОРМЛЕНИЯ": project.brief?.style && project.brief.style !== 'Не выбран' ? project.brief.style : (saved["СТИЛЬ ОФОРМЛЕНИЯ"] || ""),
      "КОНСТРУКЦИИ ДЕКОРА": saved["КОНСТРУКЦИИ ДЕКОРА"] || "",
      "ОРИЕНТИРОВОЧНЫЙ БЮДЖЕТ": project.budget ? `${project.budget.toLocaleString('ru')} ₽` : (saved["ОРИЕНТИРОВОЧНЫЙ БЮДЖЕТ"] || ""),
      "ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ": project.brief?.specialRequests && project.brief.specialRequests !== 'Нет примечаний.' ? project.brief.specialRequests : (saved["ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ"] || ""),
    };
  });

  // Interactive project title editing
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [titleInput, setTitleInput] = useState<string>(project.name);

  useEffect(() => {
    setTitleInput(project.name);
  }, [project.name]);

  const daysUntilEvent = React.useMemo(() => {
    const targetDateStr = project.date || briefValues["ДАТА"];
    if (!targetDateStr) return null;
    const eventDate = new Date(targetDateStr);
    if (isNaN(eventDate.getTime())) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    const diffMs = eventDate.getTime() - today.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }, [project.date, briefValues]);

  const handleUpdateBriefField = (key: string, value: string) => {
    setBriefValues(prev => {
      const next = { ...prev, [key]: value };
      let updatedBudget = project.budget;
      let updatedClientPrice = project.clientPrice;

      if (key === "ОРИЕНТИРОВОЧНЫЙ БЮДЖЕТ") {
        const digits = value.replace(/\D/g, '');
        if (digits) {
          const num = parseInt(digits, 10);
          if (!isNaN(num)) {
            updatedBudget = num;
            if (project.clientPrice === undefined) {
              updatedClientPrice = num;
              setFinalPrice(num);
            }
          }
        }
      }

      onUpdateProject({
        ...project,
        briefValues: next,
        budget: updatedBudget,
        clientPrice: updatedClientPrice
      });
      return next;
    });
  };
  const [calendarCollapsed, setCalendarCollapsed] = useState<boolean>(false);
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'user-note' | 'system'>('all');

  // Interactive estimates local input fields
  const [newEstName, setNewEstName] = useState('');
  const [newEstCat, setNewEstCat] = useState('Декор');
  const [newEstPrice, setNewEstPrice] = useState(1500);

  // Dedicated Decor & Work inputs
  const [newDecorName, setNewDecorName] = useState('');
  const [newDecorPrice, setNewDecorPrice] = useState<number | ''>('');
  const [newWorkName, setNewWorkName] = useState('');
  const [newWorkPrice, setNewWorkPrice] = useState<number | ''>('');
  const [showAddDecorRow, setShowAddDecorRow] = useState(false);
  const [showAddWorkRow, setShowAddWorkRow] = useState(false);

  // Journal tasks and notes interface & state
  interface ProjectTaskNoteItem {
    id: string;
    projectId?: string;
    projectName?: string;
    type: 'task' | 'note';
    title: string;
    dueDate: string; // e.g. "2026-08-15"
    completed?: boolean;
    category: 'Закупка' | 'Монтаж' | 'Смета' | 'Логистика' | 'Клиент' | 'Важное' | 'Общее';
    createdAt: string;
  }

  const [taskNoteList, setTaskNoteList] = useState<ProjectTaskNoteItem[]>(() => {
    const saved = localStorage.getItem('pop_project_tasks_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const hasRecord = parsed.some((item: any) => item.projectId === project.id || item.projectName === project.name || item._projectTouch === project.id);
          if (hasRecord) {
            return parsed.filter((item: any) => item.projectId === project.id || item.projectName === project.name);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Default sample items ONLY for initial mock projects 'p1' or 'p2'
    if (project.id === 'p1' || project.id === 'p2') {
      const defaultDate = project.date?.split('T')[0] || '2026-08-15';
      return [
        {
          id: `tn_${project.id}_1`,
          projectId: project.id,
          projectName: project.name,
          type: 'task',
          title: 'Заехать к флористу и подтвердить поставку пионовидных роз',
          dueDate: defaultDate,
          completed: true,
          category: 'Закупка',
          createdAt: '12.08.2026'
        },
        {
          id: `tn_${project.id}_2`,
          projectId: project.id,
          projectName: project.name,
          type: 'task',
          title: 'Согласовать схему расстановки столов и арки с менеджером площадки',
          dueDate: defaultDate,
          completed: false,
          category: 'Монтаж',
          createdAt: '13.08.2026'
        },
        {
          id: `tn_${project.id}_3`,
          projectId: project.id,
          projectName: project.name,
          type: 'task',
          title: 'Проверить состояние текстиля и чехлов перед погрузкой в автомобиль',
          dueDate: defaultDate,
          completed: false,
          category: 'Логистика',
          createdAt: '14.08.2026'
        },
        {
          id: `tn_${project.id}_4`,
          projectId: project.id,
          projectName: project.name,
          type: 'note',
          title: 'Заказчик просила использовать золотые подсвечники вместо серебряных',
          dueDate: defaultDate,
          category: 'Клиент',
          createdAt: '14.08.2026'
        },
        {
          id: `tn_${project.id}_5`,
          projectId: project.id,
          projectName: project.name,
          type: 'note',
          title: 'Везд на площадку через КПП №2 только с 14:00, при себе иметь паспорт',
          dueDate: defaultDate,
          category: 'Важное',
          createdAt: '15.08.2026'
        }
      ];
    }

    // For any new project, start with an empty journal list
    return [];
  });

  // Helper to persist taskNoteList locally and globally for right sidebar synchronization
  const syncGlobalProjectTasks = (updatedProjectTasks: ProjectTaskNoteItem[]) => {
    setTaskNoteList(updatedProjectTasks);
    const saved = localStorage.getItem('pop_project_tasks_v2');
    let allGlobalTasks: any[] = [];
    if (saved) {
      try { allGlobalTasks = JSON.parse(saved); } catch (e) { }
    }
    const otherTasks = allGlobalTasks.filter(item => item.projectId !== project.id && item.projectName !== project.name && item._projectTouch !== project.id);
    const touchMarker = { _projectTouch: project.id, projectId: project.id, projectName: project.name };
    const newGlobalList = [...updatedProjectTasks, ...otherTasks, touchMarker];
    localStorage.setItem('pop_project_tasks_v2', JSON.stringify(newGlobalList));
    window.dispatchEvent(new Event('project_tasks_updated'));
  };

  // Form input states for adding task/note
  const [newType, setNewType] = useState<'task' | 'note'>('task');
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('2026-08-15');
  const [newCategory, setNewCategory] = useState<'Закупка' | 'Монтаж' | 'Смета' | 'Логистика' | 'Клиент' | 'Важное' | 'Общее'>('Монтаж');

  // Filter states
  const [journalFilterType, setJournalFilterType] = useState<'all' | 'task' | 'note'>('all');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>('all'); // 'all' or '2026-08-15'

  // Auto-save & Manual Save state
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSaveProject = (isAuto = false) => {
    setIsSaving(true);
    const updatedProject: Project = {
      ...project,
      budget: finalPrice,
      updatedAt: new Date().toISOString()
    };
    onUpdateProject(updatedProject);

    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastSavedTime(formattedTime);

    setTimeout(() => {
      setIsSaving(false);
      if (!isAuto) {
        showToast('Проект сохранен', `Все изменения проекта успешно сохранены в ${formattedTime}`, 'success');
      }
    }, 400);
  };

  // Auto-save every 5 minutes (300,000 ms)
  useEffect(() => {
    const timer = setInterval(() => {
      handleSaveProject(true);
    }, 300000); // 5 minutes

    return () => clearInterval(timer);
  }, [project, finalPrice]);

  // Carousel state for Visualizations
  const [vizIndex, setVizIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const pageSketchRef = useRef<HTMLDivElement>(null);

  const handleDownloadPageSketch = async (item: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const title = item?.title || 'эскиз_декоратора';
    const filename = `${title.toLowerCase().replace(/\s+/g, '_')}.jpg`;

    if (item?.image && (item.image.startsWith('data:') || item.image.startsWith('http'))) {
      const link = document.createElement('a');
      link.href = item.image;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Скачивание', 'Сохранение эскиза на ваш компьютер...', 'success');
      return;
    }

    if (pageSketchRef.current) {
      try {
        const capturedDataUrl = await toJpeg(pageSketchRef.current, { quality: 0.95, cacheBust: true });
        const link = document.createElement('a');
        link.href = capturedDataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Скачивание', 'Эскиз сохранен на ваш компьютер', 'success');
        return;
      } catch (err) {
        console.error('Error capturing sketch for download:', err);
      }
    }

    if (item?.image) {
      const link = document.createElement('a');
      link.href = item.image;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Скачивание', 'Сохранение эскиза на ваш компьютер...', 'success');
    }
  };
  // Dynamic Visualizations
  const visualizations = (project.scenesData && project.scenesData.length > 0)
    ? project.scenesData.map((sc: any, i: number) => {
        const rawImg = sc.previewUrl || sc.image || sc.imageUrl || sc.backdropImage || '';
        const img = (rawImg && !rawImg.includes('unsplash')) ? rawImg : (project?.imageUrl && !project.imageUrl.includes('unsplash') ? project.imageUrl : '');
        return {
          id: sc.id || i + 1,
          title: sc.name ? sc.name.toUpperCase() : `ВИЗУАЛИЗАЦИЯ ${i + 1}`,
          subtitle: sc.subtitle || 'Эскиз оформления',
          image: img,
          sceneIndex: i,
          sceneData: sc,
          elements: sc.elements
        };
      })
    : [
        {
          id: 1,
          title: 'ВИЗУАЛИЗАЦИЯ 1',
          subtitle: 'Концепция декор-арки и зоны церемонии',
          image: '',
          sceneIndex: 0,
          sceneData: null,
          elements: []
        },
        {
          id: 2,
          title: 'ВИЗУАЛИЗАЦИЯ 2',
          subtitle: 'Президиум и стол молодоженов',
          image: '',
          sceneIndex: 1,
          sceneData: null,
          elements: []
        }
      ];

  // Carousel state for AI Visualizations
  const [aiVizIndex, setAiVizIndex] = useState<number>(0);
  const aiVisualizations = (project.id === 'p1' || project.id === 'p2') ? [
    {
      id: 1,
      title: 'ИИ ВИЗУАЛИЗАЦИЯ 1 (ЗОНА ЦЕРЕМОНИИ)',
      subtitle: 'Генерация ИИ: Цветочная арка и зеркальный подиум',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 2,
      title: 'ИИ ВИЗУАЛИЗАЦИЯ 2 (ВЕЧЕРНЕЕ ОСВЕЩЕНИЕ)',
      subtitle: 'Генерация ИИ: Подсветка столов и ретро-гирлянды',
      image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 3,
      title: 'ИИ ВИЗУАЛИЗАЦИЯ 3 (ФОТОЗОНА & ТЕКСТИЛЬ)',
      subtitle: 'Генерация ИИ: Сервировка стола и драпировка ткани',
      image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80'
    }
  ] : [];

  // Venue photos array with project photos or sample photos for mock p1/p2
  const [venuePhotos, setVenuePhotos] = useState<string[]>(() => {
    if (project.photos && project.photos.length > 0) {
      return project.photos;
    }
    if (project.id === 'p1' || project.id === 'p2') {
      return [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=600&q=80'
      ];
    }
    return [];
  });

  // Sync state if project props change
  useEffect(() => {
    if (!project) return;

    setTitleInput(project.name);

    const saved = project.briefValues || {};
    setBriefValues({
      "ИМЯ КЛИЕНТА": project.clientName && project.clientName !== 'Не указан' ? project.clientName : (saved["ИМЯ КЛИЕНТА"] || ""),
      "ТЕЛЕФОН": project.clientPhone || saved["ТЕЛЕФОН"] || "",
      "СОБЫТИЕ": project.name && !project.name.startsWith('proj_') ? project.name : (saved["СОБЫТИЕ"] || ""),
      "ДАТА": project.date || saved["ДАТА"] || "",
      "ГОСТЕЙ": (project.brief?.guestsCount && project.brief.guestsCount > 0) ? String(project.brief.guestsCount) : (saved["ГОСТЕЙ"] || ""),
      "ФОРМАТ СОБЫТИЯ": saved["ФОРМАТ СОБЫТИЯ"] || "",
      "АДРЕС ПЛОЩАДКИ/НАЗВАНИЕ": project.venue && project.venue !== 'Площадка не указана' ? project.venue : (saved["АДРЕС ПЛОЩАДКИ/НАЗВАНИЕ"] || saved["ПЛОЩАДКА"] || ""),
      "КОНТАКТ ПЛОЩАДКИ": saved["КОНТАКТ ПЛОЩАДКИ"] || "",
      "РАЗМЕР ЗОНЫ МОНТАЖА": saved["РАЗМЕР ЗОНЫ МОНТАЖА"] || "",
      "КРЕПЕЖ К СТЕНАМ": saved["КРЕПЕЖ К СТЕНАМ"] || "",
      "КРЕПЕЖ К ПОТОЛКУ": saved["КРЕПЕЖ К ПОТОЛКУ"] || "",
      "СОГЛАСОВАНИЕ ОФОРМЛЕНИЯ": saved["СОГЛАСОВАНИЕ ОФОРМЛЕНИЯ"] || "",
      "ЭЛЕКТРИЧЕСТВО У СЦЕНЫ": saved["ЭЛЕКТРИЧЕСТВО У СЦЕНЫ"] || "",
      "ПОДЪЕЗД / ГРУЗОВОЙ ЛИФТ": saved["ПОДЪЕЗД / ГРУЗОВОЙ ЛИФТ"] || "",
      "ПРАЗДНИК НА УЛИЦЕ": saved["ПРАЗДНИК НА УЛИЦЕ"] || "",
      "ДОСТУП НА МОНТАЖ": saved["ДОСТУП НА МОНТАЖ"] || "",
      "ОКНО МОНТАЖА": saved["ОКНО МОНТАЖА"] || "",
      "ХРАНЕНИЕ НА ПЛОЩАДКЕ": saved["ХРАНЕНИЕ НА ПЛОЩАДКЕ"] || "",
      "ДЕМОНТАЖ / ВЫВОЗ": saved["ДЕМОНТАЖ / ВЫВОЗ"] || "",
      "КТО ПРИНИМАЕТ РАБОТЫ": saved["КТО ПРИНИМАЕТ РАБОТЫ"] || "",
      "ПАЛИТРА ОФОРМЛЕНИЯ": (project.brief?.colors && project.brief.colors.length > 0 && project.brief.colors[0] !== '#FFFFFF') ? project.brief.colors.join(', ') : (saved["ПАЛИТРА ОФОРМЛЕНИЯ"] || ""),
      "СТИЛЬ ОФОРМЛЕНИЯ": (project.brief?.style && project.brief.style !== 'Не выбран') ? project.brief.style : (saved["СТИЛЬ ОФОРМЛЕНИЯ"] || ""),
      "КОНСТРУКЦИИ ДЕКОРА": saved["КОНСТРУКЦИИ ДЕКОРА"] || "",
      "ОРИЕНТИРОВОЧНЫЙ БЮДЖЕТ": project.budget ? `${project.budget.toLocaleString('ru')} ₽` : (saved["ОРИЕНТИРОВОЧНЫЙ БЮДЖЕТ"] || ""),
      "ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ": (project.brief?.specialRequests && project.brief.specialRequests !== 'Нет примечаний.') ? project.brief.specialRequests : (saved["ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ"] || ""),
    });

    if (project.photos && project.photos.length > 0) {
      setVenuePhotos(project.photos);
    } else if (project.id === 'p1' || project.id === 'p2') {
      setVenuePhotos([
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=600&q=80'
      ]);
    } else {
      setVenuePhotos([]);
    }

    const savedTasks = localStorage.getItem('pop_project_tasks_v2');
    let loaded = false;
    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks);
        if (Array.isArray(parsed)) {
          const matched = parsed.filter((item: any) => item.projectId === project.id || item.projectName === project.name);
          if (matched.length > 0) {
            setTaskNoteList(matched);
            loaded = true;
          }
        }
      } catch (e) {}
    }

    if (!loaded) {
      if (project.id === 'p1' || project.id === 'p2') {
        const defaultDate = project.date?.split('T')[0] || '2026-08-15';
        setTaskNoteList([
          { id: `tn_${project.id}_1`, projectId: project.id, projectName: project.name, type: 'task', title: 'Заехать к флористу и подтвердить поставку пионовидных роз', dueDate: defaultDate, completed: true, category: 'Закупка', createdAt: '12.08.2026' },
          { id: `tn_${project.id}_2`, projectId: project.id, projectName: project.name, type: 'task', title: 'Согласовать схему расстановки столов и арки с менеджером площадки', dueDate: defaultDate, completed: false, category: 'Монтаж', createdAt: '13.08.2026' },
          { id: `tn_${project.id}_3`, projectId: project.id, projectName: project.name, type: 'task', title: 'Проверить состояние текстиля и чехлов перед погрузкой в автомобиль', dueDate: defaultDate, completed: false, category: 'Логистика', createdAt: '14.08.2026' },
          { id: `tn_${project.id}_4`, projectId: project.id, projectName: project.name, type: 'note', title: 'Заказчик просила использовать золотые подсвечники вместо серебряных', dueDate: defaultDate, category: 'Клиент', createdAt: '14.08.2026' },
          { id: `tn_${project.id}_5`, projectId: project.id, projectName: project.name, type: 'note', title: 'Везд на площадку через КПП №2 только с 14:00, при себе иметь паспорт', dueDate: defaultDate, category: 'Важное', createdAt: '15.08.2026' }
        ]);
      } else {
        setTaskNoteList([]);
      }
    }

    setFinalPrice(project.clientPrice !== undefined ? project.clientPrice : (project.budget || 0));
    setDisabledSceneIds(project.disabledSceneIds || []);
    setCustomScenePrices(project.customScenePrices || {});
    setVizIndex(0);
    setAiVizIndex(0);
  }, [project.id]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (venuePhotos.length >= 6) {
      showToast('Лимит достигнут', 'Максимальное количество фото в галерее — 6', 'info');
      if (e.target) e.target.value = '';
      return;
    }
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setVenuePhotos(prev => prev.length < 6 ? [...prev, event.target!.result as string] : prev);
          showToast('Фото загружено', 'Новое фото площадки успешно добавлено в проект', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  // Horizontal gallery drag-to-scroll & navigation arrow handlers
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!galleryRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - galleryRef.current.offsetLeft);
    setScrollLeft(galleryRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !galleryRef.current) return;
    e.preventDefault();
    const x = e.pageX - galleryRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    galleryRef.current.scrollLeft = scrollLeft - walk;
  };

  const scrollGallery = (direction: 'left' | 'right') => {
    if (galleryRef.current) {
      const amount = direction === 'left' ? -220 : 220;
      galleryRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (project) {
      const priceToSet = project.clientPrice !== undefined
        ? project.clientPrice
        : (project.budget || 95000);
      setFinalPrice(priceToSet);
    }
  }, [project.id]);

  // Point specs mapping
  const pointSpecifications: Record<string, { title: string; desc: string }> = {
    'A-304': {
      title: "Конструктив фотозоны каркас",
      desc: "ID детали: A-304. Металлический устойчивый задник для крепления декоративных панелей. Находится на складе, тип источника: аренда."
    },
    'B-012': {
      title: "Наполнение гирляндами из шаров",
      desc: "ID детали: B-012. Нитевой теплый занавес, вешается на каркас арки. Потребуется бережный монтаж на тросах, арендная позиция."
    },
    'C-001': {
      title: "Шары световые (набор 50 шт)",
      desc: "ID детали: C-001. Одноразовый декоративный расходник со встроенными светодиодами. Для работы необходимо задать цену в смете."
    },
    'D-210': {
      title: "Живая сортовая флористика (розы)",
      desc: "ID детали: D-210. Натуральные премиальные цветы. Расходный материал, требующий ручного внесения рыночной стоимости флориста."
    }
  };

  const addJournalLog = (text: string, type: 'system' | 'user-note' | 'important' | 'client-agreed', linkedId: string | null = null) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newEntry: ProjectTaskNoteItem = {
      id: `tn_${Date.now()}`,
      type: 'note',
      title: text,
      dueDate: todayStr,
      category: 'Общее',
      createdAt: new Date().toLocaleDateString('ru-RU')
    };
    setTaskNoteList(prev => [newEntry, ...prev]);
  };

  // Stepper labels
  const steps = ['Бриф', 'Визуализация', 'Смета', 'Согласовано'];
  const progressPercentages = [25, 50, 75, 100];

  const handleStepClick = (stepIndex: number) => {
    const updated = { ...project, currentStep: stepIndex };
    onUpdateProject(updated);
    addJournalLog(`Статус проекта изменен на «${steps[stepIndex]}»`, 'system');
    showToast('Этап изменен', `Проект переведен в статус: ${steps[stepIndex]}`, 'success');
  };

  // Disabled scenes state & custom scene prices
  const [disabledSceneIds, setDisabledSceneIds] = useState<string[]>(() => project.disabledSceneIds || []);
  const [customScenePrices, setCustomScenePrices] = useState<Record<string, number>>(() => project.customScenePrices || {});

  // Sync state if project props change
  useEffect(() => {
    if (project.disabledSceneIds) {
      setDisabledSceneIds(project.disabledSceneIds);
    }
    if (project.customScenePrices) {
      setCustomScenePrices(project.customScenePrices);
    }
  }, [project.id]);

  // Construct visualization scenes list
  const defaultVisualizationScenes = [
    {
      id: 'scene-1',
      name: 'Визуализация 1',
      subtitle: 'Декор-арка и зона торжественной церемонии',
      defaultPrice: 70000,
      elements: [
        { name: 'Конструктив фотозоны каркас', price: 25000 },
        { name: 'Живая сортовая флористика (розы)', price: 45000 }
      ]
    },
    {
      id: 'scene-2',
      name: 'Визуализация 2',
      subtitle: '3D Эскиз оформления президиума и столов',
      defaultPrice: 45000,
      elements: [
        { name: 'Оформление президиума текстилем', price: 20000 },
        { name: 'Композиция из цветов на стол', price: 25000 }
      ]
    },
    {
      id: 'scene-3',
      name: 'Визуализация 3',
      subtitle: 'Приветственная Welcome-зона и план рассадки',
      defaultPrice: 35000,
      elements: [
        { name: 'Приветственный задекорированный стенд', price: 15000 },
        { name: 'Декоративные свечи и стойки', price: 20000 }
      ]
    }
  ];

  const visualizationScenes = (project.scenesData && Array.isArray(project.scenesData) && project.scenesData.length > 0)
    ? project.scenesData
    : (project.id === 'p1' || project.id === 'p2' ? defaultVisualizationScenes : []);

  // Helper function to calculate total cost for a scene
  const getSceneCost = (sc: any) => {
    if (customScenePrices[sc.id] !== undefined) {
      return customScenePrices[sc.id];
    }
    if (sc.elements && Array.isArray(sc.elements) && sc.elements.length > 0) {
      return sc.elements.reduce((sum: number, el: any) => sum + (Number(el.price) || 0), 0);
    }
    return sc.defaultPrice || 0;
  };

  // Service estimate (Work & Delivery)
  const rawServiceEstimate = project.estimate ? project.estimate.filter(item => item.category === 'Работа' || item.category === 'Доставка') : [];
  const serviceEstimate = (project.estimate && project.estimate.length > 0)
    ? rawServiceEstimate
    : (project.id === 'p1' || project.id === 'p2' ? [
        { id: 'def_work_1', name: 'Монтаж и демонтаж конструкций', category: 'Работа', quantity: 1, price: 12000 },
        { id: 'def_work_2', name: 'Транспортная доставка (Грузовой авто)', category: 'Доставка', quantity: 1, price: 5000 }
      ] : []);

  const decorCost = visualizationScenes.reduce((sum: number, sc: any) => {
    if (disabledSceneIds.includes(sc.id)) return sum;
    return sum + getSceneCost(sc);
  }, 0);

  const serviceCost = serviceEstimate.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1), 0);
  const totalCost = decorCost + serviceCost;

  const recommendedPrice = totalCost * (1 + (markupPercent / 100));
  const taxAmount = finalPrice * (taxRate / 100);
  const calculatedProfit = finalPrice - totalCost - taxAmount;
  const profitMarginPercent = finalPrice > 0 ? Math.round((calculatedProfit / finalPrice) * 100) : 0;

  // Toggle visualization scene (Вкл / Выкл) in estimate
  const handleToggleSceneInEstimate = (sceneId: string) => {
    const isCurrentlyDisabled = disabledSceneIds.includes(sceneId);
    let nextDisabled: string[];
    if (isCurrentlyDisabled) {
      nextDisabled = disabledSceneIds.filter(id => id !== sceneId);
    } else {
      nextDisabled = [...disabledSceneIds, sceneId];
    }
    setDisabledSceneIds(nextDisabled);

    onUpdateProject({
      ...project,
      disabledSceneIds: nextDisabled
    });

    const sceneObj = visualizationScenes.find((sc: any) => sc.id === sceneId);
    const sceneName = sceneObj?.name || sceneId;
    if (isCurrentlyDisabled) {
      showToast('Включено в смету', `«${sceneName}» включена в расчет сметы`, 'success');
    } else {
      showToast('Исключено из сметы', `«${sceneName}» отключена и не учитывается в расчете`, 'info');
    }
  };

  // Update scene price directly in table
  const handleUpdateScenePrice = (sceneId: string, newPrice: number) => {
    const nextCustom = { ...customScenePrices, [sceneId]: newPrice };
    setCustomScenePrices(nextCustom);

    onUpdateProject({
      ...project,
      customScenePrices: nextCustom
    });
  };

  const handleUpdateSceneName = (sceneId: string, name: string) => {
    const updatedScenes = visualizationScenes.map((sc: any) =>
      sc.id === sceneId ? { ...sc, name } : sc
    );
    onUpdateProject({ ...project, scenesData: updatedScenes });
  };

  const handleDeleteScene = (sceneId: string) => {
    const sceneObj = visualizationScenes.find((sc: any) => sc.id === sceneId);
    const sceneName = sceneObj?.name || 'Позиция декора';
    setDeleteConfirm({
      isOpen: true,
      title: 'Удалить декор из сметы?',
      itemName: sceneName,
      description: `Вы действительно хотите безвозвратно удалить «${sceneName}» из сметного расчета?`,
      onConfirm: () => {
        const updatedScenes = visualizationScenes.filter((sc: any) => sc.id !== sceneId);
        const nextCustom = { ...customScenePrices };
        delete nextCustom[sceneId];
        setCustomScenePrices(nextCustom);

        onUpdateProject({
          ...project,
          scenesData: updatedScenes,
          customScenePrices: nextCustom
        });
        showToast('Декор удален', 'Позиция декора удалена из сметы', 'info');
        setDeleteConfirm(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleUpdateEstimateItemName = (id: string, name: string) => {
    const updatedEstimate = serviceEstimate.map(item => item.id === id ? { ...item, name } : item);
    onUpdateProject({ ...project, estimate: updatedEstimate });
  };

  const handleUpdateEstimateItemPrice = (id: string, price: number) => {
    const updatedEstimate = serviceEstimate.map(item => item.id === id ? { ...item, price } : item);
    onUpdateProject({ ...project, estimate: updatedEstimate });
  };

  const handleDeleteEstimateItem = (id: string) => {
    const item = serviceEstimate.find(i => i.id === id);
    const itemName = item?.name || 'Позиция';
    setDeleteConfirm({
      isOpen: true,
      title: 'Удалить позицию?',
      itemName,
      description: `Вы действительно хотите удалить «${itemName}» из сметы?`,
      onConfirm: () => {
        const updatedEstimate = serviceEstimate.filter(i => i.id !== id);
        onUpdateProject({ ...project, estimate: updatedEstimate });
        showToast('Позиция удалена', 'Позиция удалена из сметы', 'info');
        setDeleteConfirm(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleAddWorkPosition = () => {
    if (!showAddWorkRow) {
      setShowAddWorkRow(true);
      return;
    }
    const nameToAdd = newWorkName.trim() || 'Новые монтажные работы';
    const priceToAdd = newWorkPrice !== '' ? Number(newWorkPrice) : 0;
    const newItem: EstimateItem = {
      id: `work_${Date.now()}`,
      name: nameToAdd,
      category: 'Доставка',
      quantity: 1,
      price: priceToAdd
    };
    const updatedEstimate = [...serviceEstimate, newItem];
    onUpdateProject({ ...project, estimate: updatedEstimate });
    setNewWorkName('');
    setNewWorkPrice('');
    setShowAddWorkRow(false);
    showToast('Работа добавлена', `Добавлена позиция «${nameToAdd}» (${priceToAdd.toLocaleString('ru')} ₽)`, 'success');
  };

  // Add Estimate Item via Form
  const handleAddEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEstName.trim()) return;

    const newItem: EstimateItem = {
      id: `est_${Date.now()}`,
      name: newEstName,
      category: newEstCat,
      quantity: 1,
      price: Number(newEstPrice) || 0
    };

    const nextEstimate = [...project.estimate, newItem];

    const updated = {
      ...project,
      estimate: nextEstimate
    };

    onUpdateProject(updated);
    addJournalLog(`Добавлена новая позиция сметы: «${newEstName}»`, 'system', newItem.id);

    setNewEstName('');
    showToast('Добавлено', 'Создана новая строчка в калькуляционном блоке.', 'success');
  };

  // Remove item
  const handleRemoveEstimate = (itemId: string, name: string) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Удалить из сметы?',
      itemName: name,
      description: `Вы действительно хотите удалить «${name}» из сметы?`,
      onConfirm: () => {
        const nextEstimate = project.estimate.filter(item => item.id !== itemId);
        const updated = {
          ...project,
          estimate: nextEstimate
        };
        onUpdateProject(updated);
        addJournalLog(`Позиция «${name}» удалена из сметы`, 'system');
        showToast('Удалено', 'Строка сметы исключена из расчетов.', 'info');
        setDeleteConfirm(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Edit item quantity/price inline
  const handleUpdateItemPrice = (itemId: string, price: number) => {
    const nextEstimate = project.estimate.map(item => item.id === itemId ? { ...item, price } : item);

    const updated = {
      ...project,
      estimate: nextEstimate
    };
    onUpdateProject(updated);
  };

  const handleUpdateItemQty = (itemId: string, quantity: number) => {
    const nextEstimate = project.estimate.map(item => item.id === itemId ? { ...item, quantity } : item);

    const updated = {
      ...project,
      estimate: nextEstimate
    };
    onUpdateProject(updated);
  };

  // Reset estimates list
  const handleResetCalculator = () => {
    const defaultEstimate: EstimateItem[] = [
      { id: "A-304", name: "Конструктив фотозоны каркас", category: "Конструкции", quantity: 1, price: 8000 },
      { id: "B-012", name: "Наполнение гирляндами из шаров", category: "Декор", quantity: 1, price: 3000 },
      { id: "C-001", name: "Шары световые (набор 50 шт)", category: "Декор", quantity: 1, price: 1500 },
      { id: "D-210", name: "Живая сортовая флористика (розы)", category: "Флористика", quantity: 1, price: 24000 },
      { id: "S-001", name: "Монтаж · 4 ч × 2 декоратора", category: "Работа", quantity: 1, price: 6000 },
      { id: "S-002", name: "Транспортная доставка (Грузовой борт)", category: "Доставка", quantity: 1, price: 2500 }
    ];

    const updated = {
      ...project,
      estimate: defaultEstimate
    };

    onUpdateProject(updated);
    setMarkupPercent(20);
    addJournalLog("Выполнен полный сброс калькулятора сметы к изначальным спецификациям", "system");
    showToast('Сброшено', 'Смета переустановлена к изначальным спецификациям.', 'info');
  };

  // Add Custom Task/Note Handler
  const handleAddTaskNote = () => {
    if (!newTitle.trim()) {
      showToast('Заполните название', 'Пожалуйста, введите текст задачи или заметки.', 'warn');
      return;
    }

    const newItem: ProjectTaskNoteItem = {
      id: `tn_${Date.now()}`,
      projectId: project.id,
      projectName: project.name,
      type: newType,
      title: newTitle.trim(),
      dueDate: newDueDate || project.date?.split('T')[0] || '2026-08-15',
      completed: newType === 'task' ? false : undefined,
      category: newCategory,
      createdAt: new Date().toLocaleDateString('ru-RU')
    };

    const nextList = [newItem, ...taskNoteList];
    syncGlobalProjectTasks(nextList);
    setNewTitle('');
    showToast(
      newType === 'task' ? 'Задача добавлена' : 'Заметка добавлена',
      `Запись успешно привязана к дате ${newItem.dueDate} и синхронизирована с календарем`,
      'success'
    );
  };

  const handleToggleTaskNote = (id: string) => {
    const nextList = taskNoteList.map(item => {
      if (item.id === id && item.type === 'task') {
        const nextVal = !item.completed;
        if (nextVal) {
          showToast('Задача выполнена', `Отмечено как выполнено: "${item.title}"`, 'success');
        }
        return { ...item, completed: nextVal };
      }
      return item;
    });
    syncGlobalProjectTasks(nextList);
  };

  const handleDeleteTaskNote = (id: string) => {
    const item = taskNoteList.find(i => i.id === id);
    const itemTitle = item?.title || 'Запись';
    const isTask = item?.type === 'task';
    setDeleteConfirm({
      isOpen: true,
      title: isTask ? 'Удалить задачу?' : 'Удалить заметку?',
      itemName: itemTitle,
      description: `Вы действительно хотите удалить ${isTask ? 'задачу' : 'заметку'} «${itemTitle}» из журнала?`,
      onConfirm: () => {
        const nextList = taskNoteList.filter(i => i.id !== id);
        syncGlobalProjectTasks(nextList);
        showToast('Удалено', 'Запись удалена из журнала проекта.', 'info');
        setDeleteConfirm(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Hotspot selective Spec modal opener
  const handleSelectHotspot = (pointId: string) => {
    setActiveArchPoint(pointId);
    setIsSpecModalOpen(true);
  };

  // Brief field dataset grouped systematically: Client fields first, then Decorator fields
  const baseBriefFieldDefinitions: { key: string; filledBy: 'client' | 'designer'; multiline?: boolean }[] = [
    // --- 1. КЛИЕНТСКИЙ БЛОК (22 поля) ---
    { key: "ИМЯ КЛИЕНТА", filledBy: 'client' },
    { key: "ТЕЛЕФОН", filledBy: 'client' },
    { key: "СОБЫТИЕ", filledBy: 'client' },
    { key: "ДАТА", filledBy: 'client' },
    { key: "ГОСТЕЙ", filledBy: 'client' },
    { key: "ФОРМАТ СОБЫТИЯ", filledBy: 'client' },
    { key: "АДРЕС ПЛОЩАДКИ/НАЗВАНИЕ", filledBy: 'client' },
    { key: "КОНТАКТ ПЛОЩАДКИ", filledBy: 'client' },
    { key: "РАЗМЕР ЗОНЫ МОНТАЖА", filledBy: 'client' },
    { key: "КРЕПЕЖ К СТЕНАМ", filledBy: 'client' },
    { key: "КРЕПЕЖ К ПОТОЛКУ", filledBy: 'client' },
    { key: "СОГЛАСОВАНИЕ ОФОРМЛЕНИЯ", filledBy: 'client' },
    { key: "ЭЛЕКТРИЧЕСТВО У СЦЕНЫ", filledBy: 'client' },
    { key: "ПОДЪЕЗД / ГРУЗОВОЙ ЛИФТ", filledBy: 'client' },
    { key: "ПРАЗДНИК НА УЛИЦЕ", filledBy: 'client' },
    { key: "ХРАНЕНИЕ НА ПЛОЩАДКЕ", filledBy: 'client' },
    { key: "ДЕМОНТАЖ / ВЫВОЗ", filledBy: 'client' },
    { key: "КТО ПРИНИМАЕТ РАБОТЫ", filledBy: 'client' },
    { key: "ПАЛИТРА ОФОРМЛЕНИЯ", filledBy: 'client' },
    { key: "СТИЛЬ ОФОРМЛЕНИЯ", filledBy: 'client' },
    { key: "ОРИЕНТИРОВОЧНЫЙ БЮДЖЕТ", filledBy: 'client' },
    { key: "ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ", filledBy: 'client', multiline: true },

    // --- 2. БЛОК ДЕКОРАТОРА (базовые + пользовательские поля) ---
    { key: "ДОСТУП НА МОНТАЖ", filledBy: 'designer' },
    { key: "ОКНО МОНТАЖА", filledBy: 'designer' },
    { key: "КОНСТРУКЦИИ ДЕКОРА", filledBy: 'designer' },
  ];

  const briefFieldDefinitions = [
    ...baseBriefFieldDefinitions,
    ...customDecoratorFields.map(f => ({ key: f.key, filledBy: 'designer' as const }))
  ];

  const filledBriefCount = briefFieldDefinitions.filter(f => {
    const v = briefValues[f.key];
    return v && v.trim() !== "" && v !== "(требует заполнения)";
  }).length;
  const totalBriefCount = briefFieldDefinitions.length;
  const briefFilledPercentage = Math.round((filledBriefCount / totalBriefCount) * 100);
  const briefEmptyCount = totalBriefCount - filledBriefCount;

  return (
    <div className="relative w-full max-w-full min-w-0 space-y-6 transition-all p-3 sm:p-5 lg:p-7 rounded-[36px] bg-white/30 dark:bg-zinc-950/30 backdrop-blur-2xl border border-white/80 dark:border-white/10 shadow-[0_20px_50px_rgba(140,82,208,0.12)] overflow-hidden">
      
      {/* 🌸 AMBIENT BACKGROUND GLOW BLOBS (GLASSMORPHISM ATMOSPHERE FROM REFERENCED SCREENSHOTS) */}
      <div className="absolute top-0 -left-10 w-96 h-96 bg-purple-300/30 dark:bg-purple-900/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-32 right-0 w-96 h-96 bg-teal-200/30 dark:bg-teal-900/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-1/3 w-[30rem] h-[30rem] bg-amber-200/30 dark:bg-amber-900/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* 1. TOP HEADER NAVIGATION BAR (Full Width Glass Header) */}
      <header className="p-5 sm:p-6 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/80 dark:border-white/10 rounded-[32px] shadow-xs flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 shrink-0 w-full min-w-0 relative z-30">
        <div className="flex-1 min-w-0 w-full space-y-3">
          {/* Title & Compact Popover Stepper */}
          <div className="flex flex-wrap items-center gap-3 w-full min-w-0">
            {isEditingTitle ? (
              <div className="flex items-center gap-2 max-w-full">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      project.name = titleInput || 'Без названия';
                      setIsEditingTitle(false);
                      showToast('Название обновлено', `Новое название проекта: ${titleInput}`, 'success');
                    } else if (e.key === 'Escape') {
                      setTitleInput(project.name);
                      setIsEditingTitle(false);
                    }
                  }}
                  autoFocus
                  className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 border-2 border-[#8C52D0] rounded-xl px-3 py-1 shadow-2xs focus:outline-none"
                />
                <button
                  onClick={() => {
                    project.name = titleInput || 'Без названия';
                    setIsEditingTitle(false);
                    showToast('Название обновлено', `Новое название проекта: ${titleInput}`, 'success');
                  }}
                  className="p-2 bg-[#8C52D0] text-white rounded-full hover:bg-[#582F89] transition-colors cursor-pointer shadow-2xs"
                  title="Сохранить название"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 max-w-full min-w-0 group">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
                  {titleInput || project.name}
                </h1>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="p-1.5 rounded-full hover:bg-purple-100 dark:hover:bg-purple-950/80 text-zinc-400 group-hover:text-[#8C52D0] transition-colors cursor-pointer shrink-0"
                  title="Редактировать название проекта"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* COMPACT STEP POPOVER SELECTOR (HIGH-VISIBILITY BADGE) */}
            <div className="relative shrink-0 z-30">
              <button
                onClick={() => setIsStepMenuOpen(!isStepMenuOpen)}
                className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full bg-purple-100/90 dark:bg-purple-950/90 text-[#582F89] dark:text-purple-200 border border-purple-300 dark:border-purple-700/60 shadow-xs hover:bg-purple-200/80 transition-all cursor-pointer"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#8C52D0] animate-pulse shrink-0" />
                <span>Этап {project.currentStep + 1} из {steps.length}: <strong className="text-[#582F89] dark:text-purple-100">{steps[project.currentStep]}</strong></span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 text-[#8C52D0] shrink-0 ${isStepMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isStepMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsStepMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute left-0 top-full mt-2 z-50 w-64 p-2 rounded-2xl bg-white dark:bg-zinc-900 border border-purple-300 dark:border-purple-800 shadow-2xl space-y-1"
                    >
                      <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                        Выберите этап проекта
                      </div>
                      {steps.map((label, idx) => {
                        const isCompleted = idx < project.currentStep;
                        const isCurrent = idx === project.currentStep;
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              handleStepClick(idx);
                              setIsStepMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                              isCurrent
                                ? 'bg-gradient-to-r from-[#8C52D0] to-[#582F89] text-white shadow-xs'
                                : isCompleted
                                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                            }`}
                          >
                            <span className="flex items-center gap-2 truncate">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                                isCurrent ? 'bg-white text-[#582F89]' : isCompleted ? 'bg-emerald-500 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'
                              }`}>
                                {isCompleted ? '✓' : idx + 1}
                              </span>
                              <span className="truncate">{label}</span>
                            </span>
                            {isCurrent && <span className="text-[10px] opacity-80 font-bold shrink-0 ml-1">Текущий</span>}
                          </button>
                        );
                      })}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Client & Project Info (White Floating Pill Caps) */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 w-full min-w-0">
            <span className="flex items-center gap-1.5 font-medium bg-white/80 dark:bg-zinc-800/80 px-3 py-1 rounded-full border border-white/90 dark:border-zinc-700/60 shadow-2xs shrink-0">
              <User className="w-3.5 h-3.5 text-[#8C52D0]" /> Клиент: <strong className="font-bold text-zinc-900 dark:text-zinc-100">{project.clientName}</strong>
            </span>

            <a href={`tel:${project.clientPhone || briefValues["ТЕЛЕФОН"] || '+7 905 123 45 67'}`} className="flex items-center gap-1.5 font-medium bg-white/80 dark:bg-zinc-800/80 px-3 py-1 rounded-full border border-white/90 dark:border-zinc-700/60 shadow-2xs hover:border-[#8C52D0] hover:text-[#8C52D0] transition-colors shrink-0">
              <Phone className="w-3.5 h-3.5 text-[#8C52D0]" /> {project.clientPhone || briefValues["ТЕЛЕФОН"] || '+7 905 123 45 67'}
            </a>

            <a href={`mailto:${project.clientEmail || 'socolova.design@mail.ru'}`} className="flex items-center gap-1.5 font-medium bg-white/80 dark:bg-zinc-800/80 px-3 py-1 rounded-full border border-white/90 dark:border-zinc-700/60 shadow-2xs hover:border-[#8C52D0] hover:text-[#8C52D0] transition-colors truncate max-w-[220px]">
              <Mail className="w-3.5 h-3.5 text-[#8C52D0] shrink-0" /> {project.clientEmail || 'socolova.design@mail.ru'}
            </a>

            <span className="flex items-center gap-1.5 font-medium bg-white/80 dark:bg-zinc-800/80 px-3 py-1 rounded-full border border-white/90 dark:border-zinc-700/60 shadow-2xs shrink-0">
              <Calendar className="w-3.5 h-3.5 text-[#8C52D0]" /> {project.date}
            </span>

            <span className="flex items-center gap-1.5 font-medium bg-white/80 dark:bg-zinc-800/80 px-3 py-1 rounded-full border border-white/90 dark:border-zinc-700/60 shadow-2xs shrink-0">
              <MapPin className="w-3.5 h-3.5 text-[#8C52D0]" /> {project.venue}
            </span>
          </div>
        </div>

        {/* Action Buttons Block */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start xl:self-center w-full sm:w-auto">
          <button
            onClick={() => {
              const briefUrl = `${window.location.origin}/brief/${project.id}`;
              navigator.clipboard.writeText(briefUrl);
              showToast('Ссылка отправлена клиенту', `Ссылка для клиента ${project.clientName} скопирована в буфер обмена: ${briefUrl}`, 'success');
            }}
            className="h-10 px-6 text-white rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:opacity-95 active:scale-[0.98] cursor-pointer shrink-0 shadow-md flex-1 sm:flex-none"
            style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
          >
            <Share2 className="w-4 h-4" /> Отправить клиенту
          </button>

          <button
            onClick={() => handleSaveProject(false)}
            disabled={isSaving}
            title={lastSavedTime ? `Последнее сохранение: ${lastSavedTime} (автосохранение каждые 5 мин)` : 'Автосохранение каждые 5 минут'}
            className="h-10 px-5 border border-emerald-500/80 bg-white/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer disabled:opacity-70 shrink-0 shadow-2xs flex-1 sm:flex-none"
          >
            <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
            {isSaving ? 'Сохранение...' : lastSavedTime ? `Сохранено (${lastSavedTime})` : 'Сохранить'}
          </button>
        </div>
      </header>

      {/* 2. 3 COMPACT FINANCIAL METRIC CARDS (HIGH CONTRAST & RESTORED DETAILS) */}
      {(activeTab === 'all' || activeTab === 'calc') && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full relative z-10">
          {/* CARD 1: СТОИМОСТЬ */}
          <div className="bg-gradient-to-br from-purple-100/90 via-white/80 to-indigo-50/70 dark:from-purple-950/40 dark:via-zinc-900/60 dark:to-zinc-900/60 backdrop-blur-xl border border-purple-200/80 dark:border-purple-900/50 rounded-[24px] p-4 shadow-2xs flex flex-col justify-between gap-3 relative overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase font-normal text-zinc-600 dark:text-zinc-400 tracking-normal truncate">
                Общая сметная стоимость
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/90 dark:bg-zinc-800/90 text-[10px] font-semibold text-[#582F89] dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40 shadow-2xs shrink-0">
                Стоимость
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-200/90 dark:bg-purple-900/70 text-[#8C52D0] rounded-xl shrink-0">
                <Wallet className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-[#582F89] dark:text-purple-200 tracking-tight truncate">
                {finalPrice.toLocaleString('ru')} ₽
              </div>
            </div>
            <div className="pt-2 border-t border-purple-200/60 dark:border-purple-900/40 flex items-center justify-between text-xs text-zinc-800 dark:text-zinc-200">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">Фиксированный бюджет</span>
              <span className="font-extrabold text-[#582F89] dark:text-purple-300">100% сметы</span>
            </div>
          </div>

          {/* CARD 2: ПРЕДОПЛАТА */}
          <div className="bg-gradient-to-br from-emerald-100/90 via-white/80 to-teal-50/70 dark:from-emerald-950/40 dark:via-zinc-900/60 dark:to-zinc-900/60 backdrop-blur-xl border border-emerald-200/80 dark:border-emerald-900/50 rounded-[24px] p-4 shadow-2xs flex flex-col justify-between gap-3 relative overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase font-normal text-zinc-600 dark:text-zinc-400 tracking-normal truncate">
                Полученная предоплата
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100/90 dark:bg-emerald-900/80 text-[10px] font-semibold text-emerald-800 dark:text-emerald-200 border border-emerald-300/60 dark:border-emerald-700/40 shadow-2xs shrink-0">
                {finalPrice > 0 ? Math.round((prepayment / finalPrice) * 100) : 0}% внесено
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-200/90 dark:bg-emerald-900/70 text-emerald-600 rounded-xl shrink-0">
                <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-tight truncate">
                {prepayment.toLocaleString('ru')} ₽
              </div>
            </div>
            <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-between text-xs text-zinc-800 dark:text-zinc-200">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">Аванс забронирован</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">Подтверждено ✓</span>
            </div>
          </div>

          {/* CARD 3: ОСТАТОК И ДНИ ДО МОНТАЖА */}
          <div className="bg-gradient-to-br from-amber-100/90 via-white/80 to-orange-50/70 dark:from-amber-950/40 dark:via-zinc-900/60 dark:to-zinc-900/60 backdrop-blur-xl border border-amber-200/80 dark:border-amber-900/50 rounded-[24px] p-4 shadow-2xs flex flex-col justify-between gap-3 relative overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase font-normal text-zinc-600 dark:text-zinc-400 tracking-normal truncate">
                Остаток на день монтажа
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100/90 dark:bg-amber-900/80 text-[10px] font-semibold text-amber-800 dark:text-amber-200 border border-amber-300/60 dark:border-amber-700/40 shadow-2xs shrink-0">
                К оплате
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-200/90 dark:bg-amber-900/70 text-amber-600 rounded-xl shrink-0">
                <CreditCard className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-amber-600 dark:text-amber-400 tracking-tight truncate">
                {Math.max(0, finalPrice - prepayment).toLocaleString('ru')} ₽
              </div>
            </div>
            <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-xs text-zinc-800 dark:text-zinc-200">
              <span className="font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                До монтажа: <strong className="font-extrabold text-amber-800 dark:text-amber-200">
                  {daysUntilEvent !== null
                    ? (daysUntilEvent > 0 ? `${daysUntilEvent} дн.` : daysUntilEvent === 0 ? 'Сегодня!' : 'Завершено')
                    : 'В день монтажа'}
                </strong>
              </span>
              <span className="font-bold text-amber-700 dark:text-amber-300 truncate max-w-[110px]">
                {project.date || 'Дата не указана'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. BROWSER-STYLE SEAMLESS CONNECTED TABS NAVIGATION */}
      <div className="w-full min-w-0 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pt-2 px-3 sm:px-6 flex items-end gap-1.5 sm:gap-2 relative z-20 shrink-0">
        {[
          {
            id: 'all',
            label: 'Обзор',
            icon: Layout,
            activeStyle: 'bg-white dark:bg-zinc-900 text-[#582F89] dark:text-purple-200 border-t border-x border-purple-300/80 dark:border-purple-800/60 rounded-t-2xl shadow-2xs z-30 relative -mb-[1px] pb-3 pt-2.5 px-4 sm:px-5',
            inactiveStyle: 'bg-white/40 dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400 hover:bg-white/70 hover:text-zinc-900 dark:hover:bg-zinc-800/60 border-t border-x border-purple-100/60 dark:border-zinc-800/60 z-10 rounded-t-xl pb-2 pt-2 px-3.5 sm:px-4'
          },
          {
            id: 'brief',
            label: 'Бриф',
            icon: Clipboard,
            activeStyle: 'bg-white dark:bg-zinc-900 text-rose-700 dark:text-rose-200 border-t border-x border-rose-300/80 dark:border-rose-800/60 rounded-t-2xl shadow-2xs z-30 relative -mb-[1px] pb-3 pt-2.5 px-4 sm:px-5',
            inactiveStyle: 'bg-white/40 dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400 hover:bg-rose-50/50 hover:text-rose-700 dark:hover:bg-rose-950/30 border-t border-x border-rose-100/60 dark:border-zinc-800/60 z-10 rounded-t-xl pb-2 pt-2 px-3.5 sm:px-4'
          },
          {
            id: 'design',
            label: 'Дизайн',
            icon: Palette,
            activeStyle: 'bg-white dark:bg-zinc-900 text-indigo-700 dark:text-indigo-200 border-t border-x border-indigo-300/80 dark:border-indigo-800/60 rounded-t-2xl shadow-2xs z-30 relative -mb-[1px] pb-3 pt-2.5 px-4 sm:px-5',
            inactiveStyle: 'bg-white/40 dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400 hover:bg-indigo-50/50 hover:text-indigo-700 dark:hover:bg-indigo-950/30 border-t border-x border-indigo-100/60 dark:border-zinc-800/60 z-10 rounded-t-xl pb-2 pt-2 px-3.5 sm:px-4'
          },
          {
            id: 'calc',
            label: 'Смета',
            icon: SlidersHorizontal,
            activeStyle: 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-200 border-t border-x border-emerald-300/80 dark:border-emerald-800/60 rounded-t-2xl shadow-2xs z-30 relative -mb-[1px] pb-3 pt-2.5 px-4 sm:px-5',
            inactiveStyle: 'bg-white/40 dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400 hover:bg-emerald-50/50 hover:text-emerald-700 dark:hover:bg-emerald-950/30 border-t border-x border-emerald-100/60 dark:border-zinc-800/60 z-10 rounded-t-xl pb-2 pt-2 px-3.5 sm:px-4'
          },
          {
            id: 'journal',
            label: 'Заметки',
            icon: CheckSquare,
            activeStyle: 'bg-white dark:bg-zinc-900 text-amber-700 dark:text-amber-200 border-t border-x border-amber-300/80 dark:border-amber-800/60 rounded-t-2xl shadow-2xs z-30 relative -mb-[1px] pb-3 pt-2.5 px-4 sm:px-5',
            inactiveStyle: 'bg-white/40 dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400 hover:bg-amber-50/50 hover:text-amber-700 dark:hover:bg-amber-950/30 border-t border-x border-amber-100/60 dark:border-zinc-800/60 z-10 rounded-t-xl pb-2 pt-2 px-3.5 sm:px-4'
          },
          {
            id: 'docs',
            label: 'Документы',
            icon: FolderOpen,
            activeStyle: 'bg-white dark:bg-zinc-900 text-blue-700 dark:text-blue-200 border-t border-x border-blue-300/80 dark:border-blue-800/60 rounded-t-2xl shadow-2xs z-30 relative -mb-[1px] pb-3 pt-2.5 px-4 sm:px-5',
            inactiveStyle: 'bg-white/40 dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400 hover:bg-blue-50/50 hover:text-blue-700 dark:hover:bg-blue-950/30 border-t border-x border-blue-100/60 dark:border-zinc-800/60 z-10 rounded-t-xl pb-2 pt-2 px-3.5 sm:px-4'
          }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 relative ${
                isActive ? tab.activeStyle : tab.inactiveStyle
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute -bottom-[2px] left-0 right-0 h-[3px] bg-white dark:bg-zinc-900 z-40 pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>

      {/* 4. MAIN WORKSPACE CONTENT */}
      <main className="flex-1 min-w-0 max-w-full space-y-5 w-full relative z-10">
            
            {/* BRIEF GRID (SUBTLE ROSE CORNER HIGHLIGHT WITH CLEAN GLASS CARDS) */}
            {(activeTab === 'all' || activeTab === 'brief') && (
              <section className="bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-rose-100/50 via-white/40 to-white/40 dark:from-rose-950/30 dark:via-zinc-900/30 dark:to-zinc-900/30 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/40 rounded-[28px] overflow-hidden shadow-xs w-full min-w-0">
                <div className="bg-white/40 dark:bg-zinc-900/30 border-b border-zinc-200/50 dark:border-zinc-800/40 px-4 sm:px-6 py-4 flex justify-between items-center flex-wrap gap-2.5 w-full min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 bg-[#F3E8FF] dark:bg-purple-950/60 text-[#8C52D0] dark:text-[#985DE0] rounded-xl shrink-0">
                      <Clipboard className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 truncate">Анкета и Бриф проекта</h2>
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 font-normal leading-relaxed truncate mt-0.5">
                        Заполнено: <strong className="text-emerald-600 font-semibold">{briefFilledPercentage}%</strong> {briefEmptyCount > 0 ? `(${briefEmptyCount} полей требует заполнения)` : '(Все поля заполнены)'}
                      </p>
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        const briefUrl = `${window.location.origin}/brief/${project.id}`;
                        navigator.clipboard.writeText(briefUrl);
                        showToast('Ссылка на бриф скопирована', `Ссылка для клиента ${project.clientName} скопирована в буфер обмена: ${briefUrl}`, 'success');
                      }}
                      className="relative group px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 hover:opacity-85 active:scale-[0.98] cursor-pointer bg-white/80 dark:bg-zinc-800/80 shadow-2xs"
                    >
                      {/* 1px Gradient Border Overlay */}
                      <span
                        className="absolute inset-0 rounded-full pointer-events-none p-[1px]"
                        style={{
                          background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)',
                          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                          WebkitMaskComposite: 'xor',
                          maskComposite: 'exclude',
                        }}
                      />
                      <Send className="w-3.5 h-3.5 stroke-[2.2] relative z-10 shrink-0 text-[#8C52D0]" />
                      <span
                        className="bg-clip-text text-transparent relative z-10"
                        style={{ backgroundImage: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
                      >
                        Отправить бриф
                      </span>
                    </button>

                    <button
                      onClick={() => setBriefCollapsed(!briefCollapsed)}
                      className="px-3.5 py-1.5 border border-white/80 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 rounded-full text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all duration-300 hover:bg-white shadow-2xs"
                    >
                      {briefCollapsed ? (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" /> Развернуть
                        </>
                      ) : (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" /> Свернуть
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {!briefCollapsed && (
                  <div className="p-4 sm:p-5 space-y-6">
                    {/* SECTION 1: CLIENT FIELDS */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 border-b border-purple-100 dark:border-purple-950/60 pb-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#8C52D0] shrink-0" />
                        <h3 className="text-xs font-normal uppercase tracking-normal text-zinc-600 dark:text-zinc-400">
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
                                  ? 'border-dashed border-purple-300/80 border-l-[#8C52D0] dark:border-purple-900/40 dark:border-l-purple-500/70 bg-purple-50/30 dark:bg-zinc-900/40'
                                  : 'border-purple-200/60 border-l-[#8C52D0] dark:border-zinc-800 dark:border-l-purple-500/70 bg-purple-50/10 dark:bg-zinc-900/60'
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
                                  placeholder=""
                                  className={`w-full text-sm font-semibold rounded-lg p-1.5 border transition-all focus:outline-none focus:ring-1 focus:ring-[#8C52D0] resize-none ${
                                    isEmpty
                                      ? 'bg-purple-50/50 text-[#582F89] italic font-medium border-purple-200/60 dark:bg-zinc-900/90 dark:text-purple-300/80 dark:border-zinc-800'
                                      : 'bg-white/90 dark:bg-zinc-900 text-stone-800 dark:text-stone-100 border-stone-200 dark:border-zinc-800'
                                  }`}
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={val === "(требует заполнения)" ? "" : val}
                                  onChange={(e) => handleUpdateBriefField(field.key, e.target.value)}
                                  placeholder=""
                                  className={`w-full text-sm font-semibold rounded-lg px-2 py-1 border transition-all focus:outline-none focus:ring-1 focus:ring-[#8C52D0] ${
                                    isEmpty
                                      ? 'bg-purple-50/50 text-[#582F89] italic font-medium border-purple-200/60 dark:bg-zinc-900/90 dark:text-purple-300/80 dark:border-zinc-800'
                                      : 'bg-white/90 dark:bg-zinc-900 text-stone-800 dark:text-stone-100 border-stone-200 dark:border-zinc-800'
                                  }`}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* SECTION 2: DECORATOR FIELDS */}
                    <div className="space-y-3 pt-2 border-t border-stone-200/60 dark:border-zinc-800/80">
                      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-zinc-800 pb-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-stone-400 dark:bg-zinc-400 shrink-0" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                          Поля декоратора
                        </h3>
                        <span className="text-[10px] font-semibold text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
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
                                  ? 'border-dashed border-zinc-300 border-l-zinc-400 dark:border-zinc-800 dark:border-l-zinc-600 bg-zinc-50/60 dark:bg-zinc-900/30'
                                  : 'border-stone-200/80 border-l-stone-400 dark:border-l-zinc-500 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60'
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
                                    }}
                                    title="Удалить поле"
                                    className="text-stone-300 hover:text-rose-500 transition-colors p-0.5 cursor-pointer"
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
                                  placeholder=""
                                  className={`w-full text-sm font-semibold rounded-lg p-1.5 border transition-all focus:outline-none focus:ring-1 focus:ring-[#8C52D0] resize-none ${
                                    isEmpty
                                      ? 'bg-zinc-100/50 text-zinc-600 italic font-medium border-zinc-200 dark:bg-zinc-900/80 dark:text-zinc-400 dark:border-zinc-800'
                                      : 'bg-white/90 dark:bg-zinc-900 text-stone-800 dark:text-stone-100 border-stone-200 dark:border-zinc-800'
                                  }`}
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={val === "(требует заполнения)" ? "" : val}
                                  onChange={(e) => handleUpdateBriefField(field.key, e.target.value)}
                                  placeholder=""
                                  className={`w-full text-sm font-semibold rounded-lg px-2 py-1 border transition-all focus:outline-none focus:ring-1 focus:ring-[#8C52D0] ${
                                    isEmpty
                                      ? 'bg-zinc-100/50 text-zinc-600 italic font-medium border-zinc-200 dark:bg-zinc-900/80 dark:text-zinc-400 dark:border-zinc-800'
                                      : 'bg-white/90 dark:bg-zinc-900 text-stone-800 dark:text-stone-100 border-stone-200 dark:border-zinc-800'
                                  }`}
                                />
                              )}
                            </div>
                          );
                        })}

                        {/* DASHED CARD TO ADD A CUSTOM DECORATOR FIELD */}
                        {isAddingCustomField ? (
                          <div className="p-2.5 rounded-xl border border-l-2 border-dashed border-purple-300 border-l-stone-400 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-950/20 text-left flex flex-col justify-between gap-2 shadow-2xs">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[9px] uppercase tracking-wider font-bold text-[#582F89] dark:text-purple-300">
                                Новое поле декоратора
                              </span>
                            </div>
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
                                  showToast('Поле добавлено', `Добавлено новое поле: ${keyUpper}`, 'success');
                                }
                              }}
                              className="w-full text-xs font-semibold rounded-lg px-2 py-1 border border-purple-200 dark:border-purple-800 bg-white dark:bg-zinc-900 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#8C52D0]"
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
                                    showToast('Поле добавлено', `Добавлено новое поле: ${keyUpper}`, 'success');
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
                                className="px-2 py-1 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 text-[11px] font-medium cursor-pointer"
                              >
                                Отмена
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setIsAddingCustomField(true)}
                            className="p-3 rounded-xl border border-l-2 border-dashed border-stone-300 border-l-stone-400 dark:border-zinc-700 hover:border-[#8C52D0] dark:hover:border-[#8C52D0] bg-stone-50/40 dark:bg-zinc-900/30 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 text-stone-500 hover:text-[#582F89] dark:text-stone-400 dark:hover:text-purple-300 text-xs font-semibold transition-all duration-300 flex flex-col items-center justify-center gap-1.5 min-h-[82px] cursor-pointer group"
                          >
                            <div className="w-6 h-6 rounded-full bg-stone-200/80 dark:bg-zinc-800 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/60 flex items-center justify-center transition-colors">
                              <Plus className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300 group-hover:text-[#582F89] dark:group-hover:text-purple-200" />
                            </div>
                            <span className="text-[11px] font-bold">+ Добавить поле</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* BOTTOM LEGEND AT THE VERY BOTTOM OF BRIEF CARD */}
                    <div className="pt-4 border-t border-stone-200/60 dark:border-zinc-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#582F89] dark:text-purple-300 font-semibold bg-purple-100/90 dark:bg-purple-950/70 px-3 py-1 rounded-full border border-purple-200/70 dark:border-purple-800/50">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#8C52D0] shadow-xs" /> Заполняет клиент
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300 font-semibold bg-stone-100 dark:bg-zinc-800 px-3 py-1 rounded-full border border-stone-200 dark:border-zinc-700">
                          <span className="w-2.5 h-2.5 rounded-full bg-stone-400 dark:bg-zinc-400 shadow-xs" /> Декоратор
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-stone-400">
                        Всего полей в брифе: {totalBriefCount}
                      </span>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* DESIGN & VISUALIZATION (PASTEL PURPLE/LAVENDER GLASS CARD) */}
            {(activeTab === 'all' || activeTab === 'design') && (
              <section className="bg-gradient-to-br from-purple-50/70 via-white/60 to-indigo-50/50 dark:from-purple-950/30 dark:via-zinc-900/60 dark:to-zinc-900/60 backdrop-blur-xl border border-indigo-200/60 dark:border-indigo-900/40 rounded-[28px] overflow-hidden shadow-xs">
                <div className="bg-white dark:bg-zinc-900 border-b border-indigo-200/60 dark:border-indigo-900/40 px-5 py-4 flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/50 text-[#8C52D0] rounded-2xl shrink-0">
                      <Palette className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Дизайн & Визуализация</h2>
                  </div>
                  <button
                    onClick={() => {
                      showToast('Редактор дизайна', 'Переход в встроенный графический редактор...', 'info');
                      if (onOpenEditor) onOpenEditor();
                    }}
                    style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
                    className="px-4 py-1.5 rounded-full text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer transition-all duration-300 hover:shadow-md hover:opacity-95 active:scale-[0.98] shadow-2xs"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-white" />
                    <span>Редактор</span>
                  </button>
                </div>

                <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* LEFT CAROUSEL VISUALIZATION CARD (EDITOR) */}
                  {visualizations.length > 0 ? (
                    <div className="bg-white/40 dark:bg-zinc-950/30 rounded-2xl p-4 border border-stone-200/80 dark:border-zinc-800 flex flex-col justify-between items-center relative min-h-[260px] backdrop-blur-xs select-none">
                      
                      {/* LEFT & RIGHT NAVIGATION ARROWS */}
                      {visualizations.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() => setVizIndex((prev) => (prev === 0 ? visualizations.length - 1 : prev - 1))}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full border border-[#8C52D0] bg-white/90 dark:bg-zinc-900/90 text-[#582F89] dark:text-purple-300 shadow-md flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-[#F0EBF9] dark:hover:bg-[#20152B] active:scale-95 cursor-pointer"
                            title="Предыдущая визуализация"
                          >
                            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setVizIndex((prev) => (prev === visualizations.length - 1 ? 0 : prev + 1))}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full border border-[#8C52D0] bg-white/90 dark:bg-zinc-900/90 text-[#582F89] dark:text-purple-300 shadow-md flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-[#F0EBF9] dark:hover:bg-[#20152B] active:scale-95 cursor-pointer"
                            title="Следующая визуализация"
                          >
                            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                          </button>
                        </>
                      )}

                      {/* CARD TITLE */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300 truncate max-w-[200px]">
                          {visualizations[vizIndex % visualizations.length]?.title || 'ВИЗУАЛИЗАЦИЯ'}
                        </span>
                        <span className="text-[9px] bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold shrink-0">
                          {(vizIndex % visualizations.length) + 1} / {visualizations.length}
                        </span>
                      </div>

                      {/* VISUALIZATION CONTENT AREA (CLICKABLE -> OPENS LIGHTBOX VIEWER) */}
                      <div
                        onClick={() => {
                          setLightboxIndex(vizIndex % visualizations.length);
                          setIsLightboxOpen(true);
                        }}
                        className="w-full flex-1 flex items-center justify-center my-1 px-1 cursor-pointer group"
                        title="Нажмите, чтобы развернуть эскиз во весь экран"
                      >
                        <div className="aspect-square w-full max-w-[280px] sm:max-w-[300px] overflow-hidden rounded-2xl border border-stone-200/80 dark:border-zinc-800 shadow-xs relative transition-all duration-300 group-hover:shadow-md group-hover:border-[#8C52D0]">
                          <div ref={pageSketchRef} className="w-full h-full">
                            <EditorSketchCanvasPreview
                              title={visualizations[vizIndex % visualizations.length]?.title}
                              subtitle={visualizations[vizIndex % visualizations.length]?.subtitle}
                              sceneIndex={visualizations[vizIndex % visualizations.length]?.sceneIndex ?? (vizIndex % visualizations.length)}
                              image={visualizations[vizIndex % visualizations.length]?.image}
                              sceneData={visualizations[vizIndex % visualizations.length]?.sceneData}
                              elements={visualizations[vizIndex % visualizations.length]?.elements}
                              showHuman={!!visualizations[vizIndex % visualizations.length]?.sceneData?.humanVisible}
                            />
                          </div>
                          {/* HOVER BADGES */}
                          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 p-3 z-30">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                showToast('Редактор визуализации', `Переход в редактор: ${visualizations[vizIndex % visualizations.length]?.title}`, 'info');
                                if (onOpenEditor) onOpenEditor();
                              }}
                              style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
                              className="rounded-full px-3.5 py-1.5 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shadow-lg hover:scale-105 transition-all"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-white" />
                              <span>Редактировать</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleDownloadPageSketch(visualizations[vizIndex % visualizations.length], e)}
                              className="rounded-full px-3.5 py-1.5 text-xs font-bold text-zinc-900 dark:text-white bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-700 flex items-center gap-1.5 cursor-pointer shadow-lg hover:scale-105 transition-all border border-zinc-200 dark:border-zinc-700"
                            >
                              <Download className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-200" />
                              <span>Скачать</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/40 dark:bg-zinc-950/30 rounded-2xl p-6 border border-stone-200/80 dark:border-zinc-800 flex flex-col items-center justify-center text-center space-y-3 min-h-[260px] backdrop-blur-xs">
                      <div className="w-12 h-12 rounded-2xl bg-purple-100/80 dark:bg-purple-950/60 text-[#8C52D0] dark:text-purple-300 flex items-center justify-center">
                        <Palette className="w-6 h-6 stroke-[2]" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Визуализация еще не создана</h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xs leading-relaxed">
                          Нажмите «Редактор», чтобы составить 3D концепт, задрапировать арку и собрать эскиз.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          showToast('Редактор дизайна', 'Переход в графический редактор...', 'info');
                          if (onOpenEditor) onOpenEditor();
                        }}
                        style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
                        className="px-4 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer shadow-sm hover:opacity-90 transition-all active:scale-[0.98]"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Создать визуализацию</span>
                      </button>
                    </div>
                  )}

                  {/* RIGHT CAROUSEL VISUALIZATION CARD (AI VISUALIZATION) */}
                  {aiVisualizations.length > 0 ? (
                    <div className="bg-white/40 dark:bg-zinc-950/30 rounded-2xl p-4 border border-stone-200/80 dark:border-zinc-800 flex flex-col justify-between items-center relative min-h-[260px] backdrop-blur-xs select-none">
                      
                      {/* LEFT & RIGHT NAVIGATION ARROWS */}
                      {aiVisualizations.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() => setAiVizIndex((prev) => (prev === 0 ? aiVisualizations.length - 1 : prev - 1))}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full border border-[#8C52D0] bg-white/90 dark:bg-zinc-900/90 text-[#582F89] dark:text-purple-300 shadow-md flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-[#F0EBF9] dark:hover:bg-[#20152B] active:scale-95 cursor-pointer"
                            title="Предыдущая ИИ визуализация"
                          >
                            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setAiVizIndex((prev) => (prev === aiVisualizations.length - 1 ? 0 : prev + 1))}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full border border-[#8C52D0] bg-white/90 dark:bg-zinc-900/90 text-[#582F89] dark:text-purple-300 shadow-md flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-[#F0EBF9] dark:hover:bg-[#20152B] active:scale-95 cursor-pointer"
                            title="Следующая ИИ визуализация"
                          >
                            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                          </button>
                        </>
                      )}

                      {/* CARD TITLE */}
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                          <Sparkles className="w-3.5 h-3.5 text-[#8C52D0] shrink-0" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300 truncate">
                            {aiVisualizations[aiVizIndex % aiVisualizations.length]?.title || 'ИИ ВИЗУАЛИЗАЦИЯ'}
                          </span>
                        </div>
                        <span className="text-[9px] bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold shrink-0">
                          {(aiVizIndex % aiVisualizations.length) + 1} / {aiVisualizations.length}
                        </span>
                      </div>

                      {/* AI VISUALIZATION CONTENT AREA */}
                      <div
                        onClick={() => {
                          const item = aiVisualizations[aiVizIndex % aiVisualizations.length];
                          if (item) {
                            showToast('ИИ Визуализация', `Просмотр генерации ИИ: ${item.title}`, 'info');
                          }
                        }}
                        className="w-full flex-1 flex items-center justify-center my-1 px-1 cursor-pointer group"
                        title="ИИ Визуализация проекта"
                      >
                        <div className="aspect-square w-full max-w-[280px] sm:max-w-[300px] overflow-hidden rounded-2xl border border-stone-200/80 dark:border-zinc-800 shadow-xs relative transition-all duration-300 group-hover:shadow-md group-hover:border-[#8C52D0]">
                          <img
                            src={aiVisualizations[aiVizIndex % aiVisualizations.length]?.image}
                            alt={aiVisualizations[aiVizIndex % aiVisualizations.length]?.title || 'ИИ Визуализация'}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-3 transition-opacity">
                            <span className="text-[11px] text-white font-bold leading-tight drop-shadow-xs flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
                              {aiVisualizations[aiVizIndex % aiVisualizations.length]?.subtitle}
                            </span>
                          </div>
                          {/* BADGE TOP RIGHT */}
                          <div className="absolute top-2 right-2 bg-black/60 dark:bg-black/75 backdrop-blur-md text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 border border-white/20">
                            <Sparkles className="w-2.5 h-2.5 text-amber-300" /> ИИ Визуализация
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/40 dark:bg-zinc-950/30 rounded-2xl p-6 border border-stone-200/80 dark:border-zinc-800 flex flex-col items-center justify-center text-center space-y-3 min-h-[260px] backdrop-blur-xs">
                      <div className="w-12 h-12 rounded-2xl bg-amber-100/80 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 stroke-[2]" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">ИИ Генерации отсутствуют</h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xs leading-relaxed">
                          Сгенерируйте реалистичный 3D рендер площадки с помощью ИИ стилиста.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          showToast('ИИ Генератор', 'Открытие генератора вариантов ИИ...', 'info');
                          if (onOpenEditor) onOpenEditor();
                        }}
                        className="px-4 py-2 rounded-full text-xs font-semibold text-[#582F89] dark:text-purple-300 bg-purple-100/80 hover:bg-purple-200 dark:bg-purple-950/60 dark:hover:bg-purple-900/80 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-[0.98]"
                      >
                        <Sparkles className="w-4 h-4 text-[#8C52D0]" />
                        <span>Сгенерировать в ИИ</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* HORIZONTAL PHOTO GALLERY STRIP FOR ALL PROJECT PHOTOS */}
                <div className="mx-4 sm:mx-5 mb-4 sm:mb-5 pt-3.5 border-t border-stone-200/60 dark:border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                      Все загруженные фото проекта ({venuePhotos.length} / 6)
                    </span>
                    <span className="text-[10px] text-stone-400 font-medium hidden sm:inline">
                      Перетягивайте мышкой или используйте стрелки &lt;&gt;
                    </span>
                  </div>
                  
                  {/* GALLERY STRIP WITH NAVIGATION ARROWS & DRAG TO SCROLL */}
                  <div className="relative flex items-center gap-2.5">
                    {/* LEFT ARROW (NO BORDER, LARGER ICON) */}
                    <button
                      type="button"
                      onClick={() => scrollGallery('left')}
                      className="shrink-0 w-8 h-8 rounded-full text-[#582F89] dark:text-purple-300 hover:bg-[#F0EBF9] dark:hover:bg-[#20152B] flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer z-10"
                      title="Прокрутить влево"
                    >
                      <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                    </button>

                    {/* STATIC UPLOAD CARD OUTSIDE SCROLLABLE CONTAINER */}
                    <button
                      type="button"
                      disabled={venuePhotos.length >= 6}
                      onClick={() => {
                        if (venuePhotos.length < 6) {
                          fileInputRef.current?.click();
                        }
                      }}
                      className={`shrink-0 w-16 sm:w-20 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-1 transition-all group shadow-2xs z-10 ${
                        venuePhotos.length >= 6
                          ? 'border-stone-300 dark:border-zinc-700 bg-stone-100 dark:bg-zinc-800/50 text-stone-400 dark:text-zinc-500 cursor-not-allowed opacity-60'
                          : 'border-[#8C52D0]/60 hover:border-[#8C52D0] bg-[#F0EBF9]/40 dark:bg-[#20152B]/40 hover:bg-[#F0EBF9] dark:hover:bg-[#20152B] cursor-pointer'
                      }`}
                      title={venuePhotos.length >= 6 ? 'Максимум 6 фото (лимит достигнут)' : 'Загрузить фото'}
                    >
                      <Plus className={`w-4 h-4 stroke-[2.5] ${
                        venuePhotos.length >= 6
                          ? 'text-stone-400 dark:text-zinc-500'
                          : 'text-[#582F89] dark:text-purple-300 group-hover:scale-110 transition-transform'
                      }`} />
                      <span className={`text-[8px] sm:text-[9px] font-bold mt-0.5 text-center leading-tight ${
                        venuePhotos.length >= 6
                          ? 'text-stone-400 dark:text-zinc-500'
                          : 'text-[#582F89] dark:text-purple-300'
                      }`}>
                        {venuePhotos.length >= 6 ? 'Лимит 6/6' : 'Загрузить'}
                      </span>
                    </button>

                    {/* DRAGGABLE GALLERY CONTAINER (PHOTO THUMBNAILS ONLY) */}
                    <div
                      ref={galleryRef}
                      onMouseDown={handleMouseDown}
                      onMouseLeave={handleMouseLeave}
                      onMouseUp={handleMouseUp}
                      onMouseMove={handleMouseMove}
                      className="flex-1 flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-none cursor-grab active:cursor-grabbing select-none"
                      style={{ scrollBehavior: 'smooth' }}
                    >
                      {/* PHOTO THUMBNAILS */}
                      {venuePhotos.map((photoUrl, idx) => (
                        <div
                          key={idx}
                          className="shrink-0 w-28 h-20 rounded-xl overflow-hidden border border-stone-200/80 dark:border-zinc-800 bg-stone-100 dark:bg-zinc-900 relative group cursor-pointer shadow-2xs hover:border-[#8C52D0] transition-all"
                        >
                          <img
                            src={photoUrl}
                            alt={`Превью ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 pointer-events-none"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between p-1.5">
                            <span className="text-[8px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded-md">
                              #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setVenuePhotos(prev => prev.filter((_, i) => i !== idx));
                                showToast('Фото удалено', `Фотография #${idx + 1} удалена из галереи`, 'info');
                              }}
                              className="p-1 rounded-full bg-red-600/80 hover:bg-red-600 text-white transition-transform hover:scale-110"
                              title="Удалить фото"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* RIGHT ARROW (NO BORDER, LARGER ICON) */}
                    <button
                      type="button"
                      onClick={() => scrollGallery('right')}
                      className="shrink-0 w-8 h-8 rounded-full text-[#582F89] dark:text-purple-300 hover:bg-[#F0EBF9] dark:hover:bg-[#20152B] flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer z-10"
                      title="Прокрутить вправо"
                    >
                      <ChevronRight className="w-6 h-6 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* ESTIMATE SHEET (PASTEL EMERALD GLASS CARD) */}
            {(activeTab === 'all' || activeTab === 'calc') && (
              <section className="bg-gradient-to-br from-emerald-50/70 via-white/60 to-teal-50/50 dark:from-emerald-950/30 dark:via-zinc-900/60 dark:to-zinc-900/60 backdrop-blur-xl border border-emerald-200/60 dark:border-emerald-900/40 rounded-[28px] overflow-hidden shadow-xs">
                <div className="bg-white dark:bg-zinc-900 border-b border-emerald-200/60 dark:border-emerald-900/40 px-5 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 rounded-2xl shrink-0">
                      <DollarSign className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Смета декора и монтажа</h2>
                  </div>
                  <button onClick={handleResetCalculator} className="px-3 py-1.5 rounded-full bg-white/80 dark:bg-zinc-800/80 text-xs font-bold text-zinc-500 hover:text-rose-500 cursor-pointer flex items-center gap-1 shadow-2xs transition-colors">
                    <RotateCcw className="w-3.5 h-3.5" /> Сбросить
                  </button>
                </div>

                <div className="p-4 sm:p-5 space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-200/80 dark:border-zinc-800">
                          <th className="pb-3 pt-1 px-3 w-12 text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal">Превью</th>
                          <th className="pb-3 pt-1 px-3 text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal">Визуализация / Позиция</th>
                          <th className="pb-3 pt-1 px-3 text-center text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal">Включение в смету</th>
                          <th className="pb-3 pt-1 px-3 text-right text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal">Общая стоимость (₽)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 dark:divide-zinc-800/80">
                        {/* SECTION TITLE: VISUALIZATIONS */}
                        <tr className="bg-purple-50/60 dark:bg-purple-950/40 border-y border-purple-200/50 dark:border-purple-900/50">
                          <td colSpan={4} className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-[#F3E8FF] dark:bg-purple-900/50 rounded-lg text-[#8C52D0] dark:text-purple-300">
                                <Sparkles className="w-4 h-4 stroke-[2]" />
                              </div>
                              <span className="text-xs font-semibold uppercase tracking-normal text-zinc-800 dark:text-zinc-200">
                                Визуализации декора (общая стоимость по объектам)
                              </span>
                            </div>
                          </td>
                        </tr>

                        {/* VISUALIZATIONS SUMMARY ROWS */}
                        {visualizationScenes.length > 0 ? (
                          visualizationScenes.map((sc: any, idx: number) => {
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
                                <td className="py-3 px-3">
                                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-2xs border ${
                                    isIncluded
                                      ? 'bg-purple-100/80 dark:bg-purple-900/50 border-purple-200 dark:border-purple-800 text-[#8C52D0] dark:text-purple-300'
                                      : 'bg-stone-200/60 dark:bg-zinc-800 border-stone-300 dark:border-zinc-700 text-stone-400'
                                  }`}>
                                    <Palette className="w-4 h-4 stroke-[2]" />
                                  </div>
                                </td>

                                {/* SCENE NAME & SUBTITLE */}
                                <td className="py-3 px-3">
                                  <div className="flex flex-col">
                                    <input
                                      type="text"
                                      value={sc.name || `Декор ${idx + 1}`}
                                      onChange={(e) => handleUpdateSceneName(sc.id, e.target.value)}
                                      className={`font-semibold text-sm bg-transparent border-b border-transparent hover:border-purple-300 focus:border-[#8C52D0] focus:outline-none transition-colors ${
                                        isIncluded ? 'text-stone-900 dark:text-stone-100' : 'line-through text-stone-400 dark:text-zinc-500'
                                      }`}
                                    />
                                    <span className="text-[10px] text-zinc-600 dark:text-zinc-300 font-normal leading-normal">
                                      {sc.subtitle || (sc.elements && sc.elements.length > 0 ? `${sc.elements.length} элементов декора в составе` : 'Отдельный элемент декора')}
                                    </span>
                                  </div>
                                </td>

                                {/* TOGGLE BUTTON (CIRCLE WITH CHECKMARK) */}
                                <td className="py-3 px-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSceneInEstimate(sc.id)}
                                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-xs active:scale-95 mx-auto ${
                                      isIncluded
                                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                        : 'bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-400 dark:text-zinc-500'
                                    }`}
                                    title={isIncluded ? 'Включено в смету (нажмите, чтобы исключить)' : 'Исключено из сметы (нажмите, чтобы включить)'}
                                  >
                                    <Check className="w-4 h-4 stroke-[2.5]" />
                                  </button>
                                </td>

                                {/* TOTAL COST & DELETE */}
                                <td className="py-3 px-3 text-right">
                                  <div className="inline-flex items-center gap-1.5 justify-end">
                                    {isIncluded ? (
                                      <input
                                        type="number"
                                        value={cost || ''}
                                        placeholder="0"
                                        onChange={(e) => handleUpdateScenePrice(sc.id, Number(e.target.value) || 0)}
                                        className="w-28 bg-white dark:bg-zinc-800 border border-purple-200 dark:border-purple-800 px-2.5 py-1 rounded-xl text-right font-bold text-sm text-[#582F89] dark:text-purple-200 focus:outline-none focus:ring-1 focus:ring-[#8C52D0] shadow-2xs"
                                      />
                                    ) : (
                                      <span className="font-mono font-bold text-sm line-through text-stone-400 dark:text-zinc-600">
                                        {cost.toLocaleString('ru')} ₽
                                      </span>
                                    )}
                                    <span className={`font-semibold text-sm ${isIncluded ? 'text-stone-700 dark:text-stone-300' : 'text-stone-400'}`}>₽</span>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteScene(sc.id)}
                                      title="Удалить позицию декора"
                                      className="text-stone-300 hover:text-rose-500 transition-colors p-1 cursor-pointer ml-1"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  {!isIncluded && (
                                    <span className="block text-[9px] text-rose-500 dark:text-rose-400 font-bold mt-0.5">
                                      Не учитывается в смете
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-xs text-stone-400 dark:text-zinc-500 italic">
                              В смете пока нет позиций декора. Нажмите «+ Добавить декор», чтобы внести элемент.
                            </td>
                          </tr>
                        )}

                        {/* SECTION TITLE: WORK & DELIVERY */}
                        <tr className="bg-stone-100/90 dark:bg-zinc-800/80 border-y border-zinc-200/60 dark:border-zinc-700/60">
                          <td colSpan={4} className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-zinc-200/80 dark:bg-zinc-700/60 rounded-lg text-zinc-700 dark:text-zinc-300">
                                <Truck className="w-4 h-4 stroke-[2]" />
                              </div>
                              <span className="text-xs font-semibold uppercase tracking-normal text-zinc-800 dark:text-zinc-200">
                                Монтаж, логистика и сервисные работы
                              </span>
                            </div>
                          </td>
                        </tr>

                        {/* SERVICE / WORK ROWS */}
                        {serviceEstimate.map((item) => (
                          <tr key={item.id} className="group hover:bg-stone-100/60 dark:hover:bg-zinc-800/60 transition-colors">
                            <td className="py-2.5 px-3">
                              <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-stone-300 flex items-center justify-center shadow-2xs">
                                <Truck className="w-4 h-4 stroke-[2]" />
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex flex-col">
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) => handleUpdateEstimateItemName(item.id, e.target.value)}
                                  className="font-semibold text-sm bg-transparent border-b border-transparent hover:border-purple-300 focus:border-[#8C52D0] focus:outline-none transition-colors text-stone-900 dark:text-stone-100"
                                />
                                <span className="text-[10px] text-zinc-600 dark:text-zinc-300 font-normal leading-normal">
                                  Сервисная позиция / услуга
                                </span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-zinc-700">
                                Обязательно
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="inline-flex items-center gap-1.5 justify-end">
                                <input
                                  type="number"
                                  value={item.price || ''}
                                  onChange={(e) => handleUpdateEstimateItemPrice(item.id, Number(e.target.value) || 0)}
                                  className="w-28 bg-white dark:bg-zinc-800 border border-stone-200/90 dark:border-zinc-700 px-2.5 py-1 rounded-xl text-right font-bold text-sm text-stone-800 dark:text-stone-100 focus:outline-none focus:border-stone-400 shadow-2xs"
                                />
                                <span className="font-semibold text-stone-700 dark:text-stone-300 text-sm">₽</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEstimateItem(item.id)}
                                  className="p-1 text-stone-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                  title="Удалить"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                        {/* NEW WORK INPUT ROW (CONDITIONAL) */}
                        {showAddWorkRow && (
                          <tr className="bg-stone-200/60 dark:bg-zinc-700/60 transition-colors">
                            <td className="py-2.5 px-3">
                              <div className="w-8 h-8 rounded-xl bg-white/90 dark:bg-zinc-800 border border-stone-300 dark:border-zinc-600 text-stone-700 dark:text-stone-300 flex items-center justify-center shadow-2xs">
                                <Truck className="w-4 h-4 stroke-[2]" />
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex flex-col">
                                <input
                                  type="text"
                                  autoFocus
                                  placeholder="Введите название работ..."
                                  value={newWorkName}
                                  onChange={(e) => setNewWorkName(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddWorkPosition();
                                  }}
                                  className="font-semibold text-sm bg-transparent border-b border-transparent hover:border-purple-300 focus:border-[#8C52D0] focus:outline-none transition-colors text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
                                />
                                <span className="text-[10px] text-zinc-600 dark:text-zinc-300 font-normal leading-normal">
                                  Новая позиция работ
                                </span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="text-[10px] text-stone-400">Новая запись</span>
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
                        const newNum = visualizationScenes.length + 1;
                        const newScene = {
                          id: `scene-${Date.now()}`,
                          name: `Декор ${newNum}`,
                          subtitle: `Отдельный элемент декора`,
                          defaultPrice: 0,
                          elements: []
                        };
                        const updatedScenes = [...visualizationScenes, newScene];
                        onUpdateProject({ ...project, scenesData: updatedScenes });
                        showToast('Добавлен декор', `Создана новая позиция: Декор ${newNum}`, 'success');
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
                      className="w-full py-3 px-5 rounded-full text-stone-700 dark:text-stone-200 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-stone-300 dark:border-zinc-600 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:shadow-md active:scale-[0.98]"
                    >
                      <Truck className="w-4 h-4 stroke-[2.2] text-stone-700 dark:text-stone-300" />
                      <span>+ Работа / Доставка</span>
                    </button>
                  </div>

                  {/* 3 FINANCIAL CALCULATION PANELS (MODERN DESIGN) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-4 border-t border-stone-200/70 dark:border-zinc-800">
                    {/* CARD 1: COST BREAKDOWN */}
                    <div className="p-4 bg-white/80 dark:bg-zinc-900/80 rounded-2xl border border-stone-200/80 dark:border-zinc-800 shadow-2xs flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between pb-1.5 border-b border-stone-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300 flex items-center justify-center">
                            <FileSpreadsheet className="w-4 h-4" />
                          </div>
                          <span className="text-stone-500 dark:text-stone-400 font-bold uppercase text-[10px] tracking-wider">Себестоимость</span>
                        </div>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-stone-500 dark:text-stone-400">
                          <span>Декор:</span>
                          <strong className="text-stone-800 dark:text-stone-200 font-mono font-semibold">{decorCost.toLocaleString('ru')} ₽</strong>
                        </div>
                        <div className="flex justify-between text-stone-500 dark:text-stone-400">
                          <span>Работы:</span>
                          <strong className="text-stone-800 dark:text-stone-200 font-mono font-semibold">{serviceCost.toLocaleString('ru')} ₽</strong>
                        </div>
                      </div>
                      <div className="flex justify-between items-center font-bold pt-2.5 border-t border-stone-200/60 dark:border-zinc-800 text-stone-900 dark:text-stone-100 text-xs bg-stone-50/80 dark:bg-zinc-800/50 -mx-4 -mb-4 p-3 rounded-b-2xl">
                        <span>Итого себестоимость:</span>
                        <strong className="font-mono text-sm">{totalCost.toLocaleString('ru')} ₽</strong>
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
                          <div className="flex justify-between items-center pb-1">
                            <div className="flex items-center gap-2">
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
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-2xs ${
                              isProfitPositive
                                ? 'text-emerald-800 dark:text-emerald-200 bg-emerald-100/90 dark:bg-emerald-900/80 border border-emerald-200/80 dark:border-emerald-700/60'
                                : 'text-rose-800 dark:text-rose-200 bg-rose-100/90 dark:bg-rose-900/80 border border-rose-200/80 dark:border-rose-700/60'
                            }`}>
                              {isProfitPositive ? `Эффективность ${profitMarginPercent}%` : `Убыток ${profitMarginPercent}%`}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400">С учетом себестоимости и налога 6%</p>
                          <div className="pt-1">
                            <p className={`text-2xl font-black font-mono tracking-tight ${
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
                      <div className="flex items-center justify-between pb-1 border-b border-purple-100 dark:border-purple-900/50">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-[#8C52D0] dark:text-purple-300 flex items-center justify-center">
                            <Award className="w-4 h-4" />
                          </div>
                          <span className="text-[#582F89] dark:text-purple-300 font-bold uppercase text-[10px] tracking-wider">Чек клиента</span>
                        </div>
                        <span className="text-[10px] font-bold text-white bg-gradient-to-r from-[#8C52D0] to-[#582F89] px-2.5 py-0.5 rounded-full shadow-2xs">
                          Ручной ввод
                        </span>
                      </div>
                      <p className="text-[11px] text-purple-800/80 dark:text-purple-300/80 font-medium">Сумма для сметы и договора:</p>
                      <div className="pt-1">
                        <div className="relative flex items-center">
                          <input
                            type="number"
                            value={finalPrice === 0 ? '' : finalPrice}
                            onChange={(e) => {
                              const val = e.target.value === '' ? 0 : Number(e.target.value);
                              setFinalPrice(val);
                              onUpdateProject({ ...project, clientPrice: val });
                            }}
                            className="w-full bg-white dark:bg-zinc-800 border border-[#8C52D0]/50 dark:border-purple-500/50 rounded-xl px-3 py-1.5 font-black font-mono text-xl sm:text-2xl text-[#582F89] dark:text-purple-100 focus:outline-none focus:ring-1 focus:ring-[#8C52D0] shadow-2xs transition-all"
                            placeholder="0"
                          />
                          <span className="absolute right-3.5 font-black font-mono text-lg text-[#8C52D0] dark:text-purple-300 pointer-events-none">
                            ₽
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}



            {/* JOURNAL OF TASKS AND NOTES CARD (PASTEL AMBER GLASS CARD) */}
            {(activeTab === 'all' || activeTab === 'journal') && (
              <section className="bg-gradient-to-br from-amber-50/70 via-white/60 to-orange-50/50 dark:from-amber-950/30 dark:via-zinc-900/60 dark:to-zinc-900/60 backdrop-blur-xl border border-amber-200/60 dark:border-amber-900/40 rounded-[28px] overflow-hidden shadow-xs">
                <div className="bg-white dark:bg-zinc-900 border-b border-amber-200/60 dark:border-amber-900/40 px-5 py-4 flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/50 text-amber-600 rounded-2xl shrink-0">
                      <CheckSquare className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Журнал заметок и задач</h2>
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 font-normal leading-relaxed mt-0.5">Оперативные задачи и заметки декоратора с привязкой к датам</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setJournalCollapsed(!journalCollapsed)}
                    className="px-3.5 py-1.5 border border-white/80 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer transition-all duration-300 hover:bg-white shadow-2xs"
                  >
                    {journalCollapsed ? (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" /> Развернуть
                      </>
                    ) : (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" /> Свернуть
                      </>
                    )}
                  </button>
                </div>

                {!journalCollapsed && (
                  <div className="p-4 sm:p-5">
                    {/* TWO-COLUMN LAYOUT: 40% FORM / 60% RECORDS LIST */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      
                      {/* LEFT COLUMN (~40% WIDTH): FORM TO CREATE TASK OR NOTE */}
                      <div className="lg:col-span-5 bg-white/60 dark:bg-zinc-950/40 p-4 sm:p-5 rounded-2xl border border-stone-200/80 dark:border-zinc-800 backdrop-blur-xs space-y-4 flex flex-col justify-between">
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
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value as any)}
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

                        {/* Submit button following required gradient and pill style */}
                        <button
                          type="button"
                          onClick={handleAddTaskNote}
                          className="w-full mt-3 py-2.5 text-white rounded-full text-xs font-semibold transition-all duration-300 hover:shadow-md hover:opacity-95 active:scale-[0.99] cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
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
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setJournalFilterType('all')}
                              style={journalFilterType === 'all' ? { background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' } : {}}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                                journalFilterType === 'all'
                                  ? 'text-white shadow-2xs'
                                  : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                              }`}
                            >
                              Все записи ({taskNoteList.length})
                            </button>
                            <button
                              type="button"
                              onClick={() => setJournalFilterType('task')}
                              style={journalFilterType === 'task' ? { background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' } : {}}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                                journalFilterType === 'task'
                                  ? 'text-white shadow-2xs'
                                  : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                              }`}
                            >
                              Задачи ({taskNoteList.filter(i => i.type === 'task').length})
                            </button>
                            <button
                              type="button"
                              onClick={() => setJournalFilterType('note')}
                              style={journalFilterType === 'note' ? { background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' } : {}}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                                journalFilterType === 'note'
                                  ? 'text-white shadow-2xs'
                                  : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                              }`}
                            >
                              Заметки ({taskNoteList.filter(i => i.type === 'note').length})
                            </button>
                          </div>

                          {selectedCalendarDate !== 'all' && (
                            <button
                              onClick={() => setSelectedCalendarDate('all')}
                              className="text-[10px] font-bold text-[#582F89] dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-800 hover:bg-purple-100 cursor-pointer flex items-center gap-1"
                            >
                              <RotateCcw className="w-2.5 h-2.5" /> Сбросить дату: {selectedCalendarDate}
                            </button>
                          )}
                        </div>

                        {/* Scrollable Records List */}
                        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 flex-1 custom-scrollbar">
                          {(() => {
                            const filtered = taskNoteList.filter(item => {
                              // Type filter
                              if (journalFilterType !== 'all' && item.type !== journalFilterType) return false;
                              
                              // Date filter from side calendar if active
                              if (selectedCalendarDate !== 'all') {
                                const dayPart = selectedCalendarDate.split('-')[2];
                                if (item.dueDate) {
                                  return item.dueDate.endsWith(dayPart) || item.dueDate === selectedCalendarDate;
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
                                  <p className="text-[10px]">Создайте первую задачу или заметку в форме слева.</p>
                                </div>
                              );
                            }

                            return filtered.map((item) => {
                              const isTask = item.type === 'task';

                              // Category styling
                              const categoryStyles: Record<string, string> = {
                                'Монтаж': 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200',
                                'Закупка': 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200',
                                'Смета': 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200',
                                'Логистика': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200',
                                'Клиент': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200',
                                'Важное': 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200',
                                'Общее': 'bg-stone-100 text-stone-700 dark:bg-zinc-800 dark:text-stone-300 border-stone-200'
                              };

                              const catClass = categoryStyles[item.category] || categoryStyles['Общее'];

                              return (
                                <div
                                  key={item.id}
                                  className={`p-3 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 ${
                                    isTask && item.completed
                                      ? 'bg-stone-50/70 dark:bg-zinc-950/30 border-stone-200/60 dark:border-zinc-800 opacity-60'
                                      : 'bg-white/90 dark:bg-zinc-900/90 border-stone-200 dark:border-zinc-800 hover:border-purple-300 shadow-2xs'
                                  }`}
                                >
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {/* Task Checkbox or Note Icon */}
                                    {isTask ? (
                                      <button
                                        type="button"
                                        onClick={() => handleToggleTaskNote(item.id)}
                                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                                          item.completed
                                            ? 'bg-emerald-500 border-emerald-500 text-white'
                                            : 'border-stone-300 dark:border-zinc-600 hover:border-[#8C52D0] bg-white dark:bg-zinc-800'
                                        }`}
                                      >
                                        {item.completed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                                      </button>
                                    ) : (
                                      <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                        <FileText className="w-3 h-3" />
                                      </div>
                                    )}

                                    {/* Title & details */}
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-xs font-medium text-stone-800 dark:text-stone-200 leading-snug ${
                                        isTask && item.completed ? 'line-through text-stone-400 dark:text-stone-500' : ''
                                      }`}>
                                        {item.title}
                                      </p>
                                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        {/* Type badge */}
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                          isTask
                                            ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                        }`}>
                                          {isTask ? 'Задача' : 'Заметка'}
                                        </span>

                                        {/* Category badge */}
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${catClass}`}>
                                          {item.category}
                                        </span>

                                        {/* Due Date badge */}
                                        <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono flex items-center gap-1">
                                          <Clock className="w-2.5 h-2.5" />
                                          {item.dueDate}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Delete Action */}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTaskNote(item.id)}
                                    className="text-stone-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all cursor-pointer shrink-0"
                                    title="Удалить запись"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </section>
            )}

            {/* DOCUMENTS WORKFLOW CARD (PASTEL BLUE GLASS CARD) */}
            {(activeTab === 'all' || activeTab === 'docs') && (
              <section className="bg-gradient-to-br from-blue-50/70 via-white/60 to-cyan-50/50 dark:from-blue-950/30 dark:via-zinc-900/60 dark:to-zinc-900/60 backdrop-blur-xl border border-blue-200/60 dark:border-blue-900/40 rounded-[28px] overflow-hidden shadow-xs">
                <div className="bg-white dark:bg-zinc-900 border-b border-blue-200/60 dark:border-blue-900/40 px-5 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 rounded-2xl shrink-0">
                      <FolderOpen className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Документооборот по проекту</h2>
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 font-normal leading-relaxed mt-0.5">Связанные юридические документы для работы</p>
                    </div>
                  </div>
                  <button
                    onClick={() => showToast('Генерация пакета', 'Создается комплект документов в PDF...', 'success')}
                    className="px-4 py-1.5 text-white rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all duration-300 hover:shadow-md hover:opacity-95 active:scale-[0.98] shadow-xs"
                    style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Сгенерировать
                  </button>
                </div>

                <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                        {/* ACCENT BACKGROUND SHIMMER */}
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${doc.accentColor} rounded-bl-full pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity`} />

                        <div className="space-y-2.5 relative z-10">
                          {/* TOP HEADER: ICON + TITLE & CODE */}
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

                          {/* DESCRIPTION */}
                          <p className="text-xs text-zinc-700 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                            {doc.desc}
                          </p>
                        </div>

                        {/* BOTTOM METADATA & ACTIONS */}
                        <div className="pt-3 border-t border-stone-100 dark:border-zinc-800/80 flex items-center justify-between gap-2 relative z-10">
                          <div className="text-[10px] text-stone-400 font-mono space-x-1.5">
                            <span className="font-bold text-stone-500 dark:text-stone-400">PDF</span>
                            <span>•</span>
                            <span>{doc.size}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => showToast('Просмотр документа', `Открываем ${doc.title}...`, 'info')}
                              className="p-1.5 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-stone-500 hover:text-[#582F89] dark:hover:text-purple-300 rounded-lg transition-colors cursor-pointer"
                              title="Просмотреть"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => showToast('Скачивание', `Загрузка файла ${doc.title}...`, 'success')}
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
              </section>
            )}

            {/* BOTTOM FLOATING ACTION BAR */}
            <div 
              className="px-6 py-4 rounded-3xl flex flex-col lg:flex-row items-center justify-between gap-4 shadow-2xl text-white border border-white/20 transition-all"
              style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
            >
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full lg:w-auto">
                {/* METRIC 1: СТОИМОСТЬ */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/15 text-white border border-white/25 flex items-center justify-center shrink-0 shadow-2xs">
                    <Wallet className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-200 block">
                      Итоговая стоимость
                    </span>
                    <span className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
                      {finalPrice.toLocaleString('ru')} ₽
                    </span>
                  </div>
                </div>

                <div className="h-8 w-px bg-white/20 hidden sm:block" />

                {/* METRIC 2: ПРЕДОПЛАТА */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/15 text-white border border-white/25 flex items-center justify-center shrink-0 shadow-2xs">
                    <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-200">
                        Предоплата:
                      </span>
                      {/* Presets 30%, 50%, 100% without extra background frame */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPrepayment(Math.round(finalPrice * 0.3))}
                          className={`text-xs font-black px-3 py-0.5 rounded-full transition-all duration-200 cursor-pointer shadow-xs ${
                            prepayment === Math.round(finalPrice * 0.3) && finalPrice > 0
                              ? 'bg-white text-[#582F89] ring-2 ring-white shadow-md scale-105'
                              : 'bg-white text-[#582F89] hover:bg-purple-50 active:scale-95 opacity-90 hover:opacity-100'
                          }`}
                          title="Выбрать 30% предоплаты"
                        >
                          30%
                        </button>
                        <button
                          type="button"
                          onClick={() => setPrepayment(Math.round(finalPrice * 0.5))}
                          className={`text-xs font-black px-3 py-0.5 rounded-full transition-all duration-200 cursor-pointer shadow-xs ${
                            prepayment === Math.round(finalPrice * 0.5) && finalPrice > 0
                              ? 'bg-amber-200 text-amber-950 ring-2 ring-amber-300 shadow-md scale-105'
                              : 'bg-amber-100 text-amber-900 hover:bg-amber-200 active:scale-95 opacity-90 hover:opacity-100'
                          }`}
                          title="Выбрать 50% предоплаты"
                        >
                          50%
                        </button>
                        <button
                          type="button"
                          onClick={() => setPrepayment(finalPrice)}
                          className={`text-xs font-black px-3 py-0.5 rounded-full transition-all duration-200 cursor-pointer shadow-xs ${
                            prepayment === finalPrice && finalPrice > 0
                              ? 'bg-emerald-300 text-emerald-950 ring-2 ring-emerald-300 shadow-md scale-105'
                              : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 active:scale-95 opacity-90 hover:opacity-100'
                          }`}
                          title="Выбрать 100% предоплаты"
                        >
                          100%
                        </button>
                      </div>
                    </div>

                    {/* Manual Input */}
                    <div className="relative w-full mt-1.5 flex items-center">
                      <input
                        type="number"
                        value={prepayment === 0 ? '' : prepayment}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : Number(e.target.value);
                          setPrepayment(val);
                        }}
                        className="w-full pl-3 pr-7 py-1 bg-white border border-stone-200 rounded-xl text-xs font-black font-mono text-[#582F89] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-sm"
                        placeholder="Ручной ввод..."
                      />
                      <span className="absolute right-2.5 text-xs font-black font-mono text-[#8C52D0] pointer-events-none">
                        ₽
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/30 rounded-full text-xs font-bold transition-all cursor-pointer hover:shadow-xs active:scale-[0.98]"
                >
                  Отменить
                </button>
                <button
                  onClick={() => {
                    showToast('Проект завершен', 'Статус проекта обновлен на «Выполнено»', 'success');
                    onClose();
                  }}
                  className="px-6 py-2.5 bg-white text-[#582F89] hover:bg-purple-50 rounded-full text-xs font-black transition-all duration-300 hover:shadow-lg active:scale-[0.98] cursor-pointer flex items-center gap-2 shadow-md"
                >
                  <CheckCircle className="w-4 h-4 text-[#8C52D0] stroke-[2.5]" />
                  <span>Заказ сдан</span>
                </button>
              </div>
            </div>
          </main>

      {/* SPECIFICATION HOTSPOT MODAL */}
      <AnimatePresence>
        {isSpecModalOpen && pointSpecifications[activeArchPoint] && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-xl text-left"
            >
              <div className="flex justify-between items-center border-b border-stone-100 dark:border-zinc-800 pb-3">
                <span className="text-xs font-bold uppercase text-[#582F89]">Спецификация точки #{activeArchPoint}</span>
                <button onClick={() => setIsSpecModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                {pointSpecifications[activeArchPoint].title}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-300">
                {pointSpecifications[activeArchPoint].desc}
              </p>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setIsSpecModalOpen(false)}
                  className="px-4 py-2 text-white rounded-full text-xs font-bold transition-all duration-300 hover:shadow-lg hover:opacity-95 active:scale-[0.98] cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
                >
                  Закрыть
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirm modal */}
      <DeleteConfirmModal
        isOpen={deleteConfirm.isOpen}
        title={deleteConfirm.title}
        itemName={deleteConfirm.itemName}
        description={deleteConfirm.description}
        onClose={() => setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}
        onConfirm={deleteConfirm.onConfirm}
      />

      <SketchLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        visualizations={visualizations}
        currentIndex={lightboxIndex}
        onIndexChange={(idx) => {
          setLightboxIndex(idx);
          setVizIndex(idx);
        }}
        onOpenEditor={onOpenEditor}
        showToast={showToast}
      />
    </div>
  );
}
