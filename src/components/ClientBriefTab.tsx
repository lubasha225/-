import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ClipboardList,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Palette,
  Wallet,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  Share2,
  Eye,
  EyeOff,
  FolderOpen,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  MessageCircle,
  Clock,
  Send,
  Building,
  Users,
  CheckCircle2,
  ChevronDown,
  Info,
  Heart,
  FileCheck2,
  ListFilter,
  CheckSquare,
  Globe,
  RotateCcw,
  BadgeCheck,
  AlertCircle
} from 'lucide-react';
import { Project } from '../types';
import { ClientBriefForm } from './ClientBriefForm';
import { ClientBriefSummary } from './ClientBriefSummary';

interface ClientBriefTabProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (proj: Project | null) => void;
  onUpdateProject: (updated: Project) => void;
  showToast: (title: string, message: string, type: 'success' | 'info' | 'warning') => void;
  onOpenProjectCard?: (proj: Project) => void;
  initialClientPreview?: boolean;
}

// Preset color palettes for decorators & brides
const PRESET_PALETTES = [
  { name: 'Пудра & Шалфей', colors: ['#E8D5CE', '#D2C2B8', '#B7C4B0', '#F9F6F0'] },
  { name: 'Лаванда & Шампань', colors: ['#D6C7E8', '#9B72CF', '#F7E7CE', '#FFFFFF'] },
  { name: 'Золото & Изумруд', colors: ['#D4AF37', '#1B4D3E', '#F5F5DC', '#2E2D2F'] },
  { name: 'Пыльная роза & Марсала', colors: ['#C5828C', '#6E2639', '#F4EBE8', '#D6B4BC'] },
  { name: 'Бохо & Терракота', colors: ['#C86D51', '#E3A857', '#DFD3C3', '#685D55'] },
  { name: 'Монохром & Эвкалипт', colors: ['#FFFFFF', '#EAEAEA', '#586A5E', '#1F2421'] },
];

// Quick suggestions
const EVENT_TYPES = [
  'Свадьба',
  'Юбилей / День рождения',
  'Детский праздник',
  'Корпоратив',
  'Выпускной',
  'Гендер-пати / Baby Shower'
];

const EVENT_FORMATS = [
  'Банкет с выездной регистрацией',
  'Камерный ужин (до 25 чел)',
  'Фуршет / Коктейль',
  'Вечеринка на открытом воздухе',
  'Официальный прием'
];

const VENUE_TYPES = [
  'В помещении (ресторан, банкетный зал)',
  'Шатер на природе',
  'Открытая терраса / веранда',
  'Лофт с кирпичными стенами',
  'Загородный клуб / усадьба'
];

const ZONE_OPTIONS = [
  'Зона церемонии (арка, дорожка)',
  'Президиум (стол молодоженов, фон)',
  'Столы гостей (композиции, текстиль)',
  'Приветственная Welcome-зона',
  'План рассадки и полиграфия',
  'Фотозона для гостей',
  'Кэнди-бар / Чайный стол',
  'Оформление потолка (люстры, ткань)'
];

const STYLE_OPTIONS = [
  'Современная классика',
  'Бохо & Рустик',
  'Минимализм & Геометрия',
  'Романтический сад (Garden Style)',
  'Black Tie / Luxury Gold',
  'Эко & Ботаника',
  'Винтаж & Прованс'
];

const FLOWER_SUGGESTIONS = [
  'Пионовидные розы',
  'Гортензии',
  'Эвкалипт',
  'Гипсофила',
  'Дельфиниум',
  'Пыльная роза',
  'Ранункулюсы',
  'Пампасная трава',
  'Орхидеи'
];

export default function ClientBriefTab({
  projects,
  selectedProject,
  onSelectProject,
  onUpdateProject,
  showToast,
  onOpenProjectCard,
  initialClientPreview = false
}: ClientBriefTabProps) {
  // Brand Profile state pulled dynamically from brand profile (localStorage)
  const [brandLogo, setBrandLogo] = useState<string | null>(() => {
    return localStorage.getItem('fleur_studio_logo') || '/logo_iq_deko.svg';
  });
  const [studioName, setStudioName] = useState<string>(() => {
    return localStorage.getItem('fleur_studio_name') || 'IQ DECO';
  });
  const [studioTagline, setStudioTagline] = useState<string>(() => {
    return localStorage.getItem('fleur_studio_tagline') || 'Студия авторского декора и концептуальной флористики';
  });
  const [studioPhone, setStudioPhone] = useState<string>(() => {
    return localStorage.getItem('fleur_studio_phone') || '+7 (995) 123-45-67';
  });
  const [studioEmail, setStudioEmail] = useState<string>(() => {
    return localStorage.getItem('fleur_user_email') || 'info@iqdeco.ru';
  });
  const [studioWebsite, setStudioWebsite] = useState<string>(() => {
    return localStorage.getItem('fleur_studio_website') || 'iqdeco.ru';
  });

  // Keep brand profile fresh in real-time if updated in ProfileTab
  useEffect(() => {
    const handleStorage = () => {
      setBrandLogo(localStorage.getItem('fleur_studio_logo') || '/logo_iq_deko.svg');
      setStudioName(localStorage.getItem('fleur_studio_name') || 'IQ DECO');
      setStudioTagline(localStorage.getItem('fleur_studio_tagline') || 'Студия авторского декора и концептуальной флористики');
      setStudioPhone(localStorage.getItem('fleur_studio_phone') || '+7 (995) 123-45-67');
      setStudioEmail(localStorage.getItem('fleur_user_email') || 'info@iqdeco.ru');
      setStudioWebsite(localStorage.getItem('fleur_studio_website') || 'iqdeco.ru');
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Active project selection
  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    return selectedProject?.id || (projects.length > 0 ? projects[0].id : '');
  });

  // Client view mode toggle (Decorator admin vs Preview as Client)
  const [isClientPreviewMode, setIsClientPreviewMode] = useState<boolean>(initialClientPreview);

  // Sub-view inside Preview mode: interactive questionnaire vs summary card of all filled answers
  const [previewSubMode, setPreviewSubMode] = useState<'form' | 'summary'>('form');

  // Form submission animation state for client
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState<boolean>(false);

  // Synchronize when selectedProject prop changes
  useEffect(() => {
    if (selectedProject?.id && selectedProject.id !== activeProjectId) {
      setActiveProjectId(selectedProject.id);
    }
  }, [selectedProject?.id]);

  const currentProject = useMemo(() => {
    return projects.find(p => p.id === activeProjectId) || projects[0] || null;
  }, [projects, activeProjectId]);

  // Helper to extract reliable, full form data from project
  const extractFormData = (proj: Project | null) => {
    if (!proj) return {};
    const bVals = proj.briefValues || {};
    const bObj = proj.brief || {
      style: 'Не выбран',
      colors: [],
      flowers: [],
      guestsCount: 50,
      specialRequests: ''
    };

    return {
      "ИМЯ КЛИЕНТА": bVals["ИМЯ КЛИЕНТА"] || (proj.clientName && proj.clientName !== 'Не указан' ? proj.clientName : "Елизавета и Павел"),
      "ТЕЛЕФОН": bVals["ТЕЛЕФОН"] || proj.clientPhone || "+7 (905) 123-45-67",
      "EMAIL": bVals["EMAIL"] || proj.clientEmail || "liza.pavel@example.com",
      "КТО ПРИНИМАЕТ РАБОТЫ": bVals["КТО ПРИНИМАЕТ РАБОТЫ"] || "Ольга Смирнова (координатор)",
      "СОБЫТИЕ": bVals["СОБЫТИЕ"] || (proj.name && !proj.name.startsWith('proj_') ? proj.name : "Свадьба · Ролл"),
      "ДАТА": bVals["ДАТА"] || proj.date || "2026-07-20",
      "ФОРМАТ СОБЫТИЯ": bVals["ФОРМАТ СОБЫТИЯ"] || "Банкет с выездной регистрацией",
      "ГОСТЕЙ": bVals["ГОСТЕЙ"] || (bObj.guestsCount ? String(bObj.guestsCount) : "60"),
      "АДРЕС ПЛОЩАДКИ/НАЗВАНИЕ": bVals["АДРЕС ПЛОЩАДКИ/НАЗВАНИЕ"] || (proj.venue && proj.venue !== 'Площадка не указана' ? proj.venue : "Загородная усадьба «Ролл Резорт»"),
      "КОНТАКТ ПЛОЩАДКИ": bVals["КОНТАКТ ПЛОЩАДКИ"] || "Банкетный менеджер Артем, +7 (918) 555-44-33",
      "ПРАЗДНИК НА УЛИЦЕ": bVals["ПРАЗДНИК НА УЛИЦЕ"] || "В помещении (ресторан, банкетный зал)",
      "ЗОНЫ ОФОРМЛЕНИЯ": bVals["ЗОНЫ ОФОРМЛЕНИЯ"] || "Президиум (стол молодоженов, фон), Зона церемонии (арка, дорожка), Столы гостей (композиции, текстиль), Фотозона для гостей",
      "СТИЛЬ ОФОРМЛЕНИЯ": bVals["СТИЛЬ ОФОРМЛЕНИЯ"] || (bObj.style && bObj.style !== 'Не выбран' ? bObj.style : "Бохо-шик с классическими элементами"),
      "ПАЛИТРА ОФОРМЛЕНИЯ": bVals["ПАЛИТРА ОФОРМЛЕНИЯ"] || (bObj.colors && bObj.colors.length > 0 && bObj.colors[0] !== '#FFFFFF' ? bObj.colors.join(', ') : "#F6EEFF, #E2D4F0, #C08EF4, #FFFFFF"),
      "ФЛОРИСТИКА": bVals["ФЛОРИСТИКА"] || (bObj.flowers && bObj.flowers.length > 0 ? bObj.flowers.join(', ') : "Пионовидные розы, Пыльная роза, Эвкалипт, Гипсофила"),
      "НЕЖЕЛАТЕЛЬНЫЕ ЦВЕТЫ": bVals["НЕЖЕЛАТЕЛЬНЫЕ ЦВЕТЫ"] || "Гвоздики, лилии (из-за сильного запаха)",
      "ОРИЕНТИРОВОЧНЫЙ БЮДЖЕТ": bVals["ОРИЕНТИРОВОЧНЫЙ БЮДЖЕТ"] || (proj.budget ? `${proj.budget.toLocaleString('ru')} ₽` : "350 000 ₽"),
      "ССЫЛКА НА РЕФЕРЕНСЫ": bVals["ССЫЛКА НА РЕФЕРЕНСЫ"] || "https://pinterest.com/wedding-inspiration",
      "ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ": bVals["ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ"] || (bObj.specialRequests && bObj.specialRequests !== 'Нет примечаний.' ? bObj.specialRequests : "Обязательно нужна светодиодная гирлянда-роса на заднем фоне арки и много насыпных свечей вдоль дорожки."),
    };
  };

  // Brief values dictionary synced with project
  const [formData, setFormData] = useState<Record<string, string>>(() => extractFormData(currentProject));
  const [customColors, setCustomColors] = useState<string[]>(() => {
    if (currentProject?.brief?.colors && currentProject.brief.colors.length > 0 && currentProject.brief.colors[0] !== '#FFFFFF') {
      return currentProject.brief.colors;
    }
    return ['#F6EEFF', '#E2D4F0', '#C08EF4', '#FFFFFF'];
  });
  const [selectedZones, setSelectedZones] = useState<string[]>(() => [
    'Президиум (стол молодоженов, фон)',
    'Зона церемонии (арка, дорожка)',
    'Столы гостей (композиции, текстиль)'
  ]);
  const [referenceImages, setReferenceImages] = useState<string[]>(() => currentProject?.photos || []);
  const [showPalettePresets, setShowPalettePresets] = useState<boolean>(false);

  // Load project's brief on project change
  useEffect(() => {
    if (!currentProject) return;

    const data = extractFormData(currentProject);
    setFormData(data);

    // Parse colors
    if (currentProject.brief?.colors && currentProject.brief.colors.length > 0 && currentProject.brief.colors[0] !== '#FFFFFF') {
      setCustomColors(currentProject.brief.colors);
    } else if (data["ПАЛИТРА ОФОРМЛЕНИЯ"]) {
      const parsed = data["ПАЛИТРА ОФОРМЛЕНИЯ"].split(',').map(s => s.trim()).filter(s => s.startsWith('#'));
      setCustomColors(parsed.length > 0 ? parsed : ['#F6EEFF', '#E2D4F0', '#C08EF4', '#FFFFFF']);
    } else {
      setCustomColors(['#E8D5CE', '#B7C4B0', '#F9F6F0']);
    }

    // Parse zones
    if (data["ЗОНЫ ОФОРМЛЕНИЯ"]) {
      setSelectedZones(data["ЗОНЫ ОФОРМЛЕНИЯ"].split(',').map(z => z.trim()).filter(Boolean));
    } else {
      setSelectedZones(['Президиум (стол молодоженов, фон)', 'Столы гостей (композиции, текстиль)']);
    }

    // Photos
    setReferenceImages(currentProject.photos && currentProject.photos.length > 0 ? currentProject.photos : []);
    setIsSubmittedSuccess(false);
  }, [currentProject?.id]);

  // Handle single field change
  const handleFieldChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Toggle zone selection
  const handleToggleZone = (zone: string) => {
    setSelectedZones(prev => {
      const next = prev.includes(zone) ? prev.filter(z => z !== zone) : [...prev, zone];
      handleFieldChange("ЗОНЫ ОФОРМЛЕНИЯ", next.join(', '));
      return next;
    });
  };

  // Quick preset palette apply
  const handleSelectPresetPalette = (colors: string[], name: string) => {
    setCustomColors(colors);
    handleFieldChange("ПАЛИТРА ОФОРМЛЕНИЯ", colors.join(', '));
    showToast('Палитра выбрана', `Применена цветовая гамма «${name}».`, 'info');
  };

  // Add custom hex color
  const handleAddCustomColor = (colorHex: string) => {
    if (customColors.includes(colorHex)) return;
    const next = [...customColors, colorHex];
    setCustomColors(next);
    handleFieldChange("ПАЛИТРА ОФОРМЛЕНИЯ", next.join(', '));
  };

  // Remove custom color
  const handleRemoveCustomColor = (index: number) => {
    const next = customColors.filter((_, i) => i !== index);
    setCustomColors(next);
    handleFieldChange("ПАЛИТРА ОФОРМЛЕНИЯ", next.join(', '));
  };

  // Upload reference image via file reader
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const res = reader.result;
          setReferenceImages(prev => [...prev, res]);
          showToast('Фото добавлено', 'Референс прикреплен к брифу.', 'success');
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Populate sample luxury wedding data so preview is instantly rich
  const handleFillDemoData = () => {
    const demoData = {
      "ИМЯ КЛИЕНТА": "Елизавета и Павел",
      "ТЕЛЕФОН": "+7 (905) 123-45-67",
      "СОБЫТИЕ": "Свадьба · Ролл Резорт",
      "ДАТА": "2026-07-20",
      "ГОСТЕЙ": "60 гостей",
      "ФОРМАТ СОБЫТИЯ": "Банкет с выездной регистрацией",
      "АДРЕС ПЛОЩАДКИ/НАЗВАНИЕ": "Загородная усадьба «Ролл Резорт», зал «Оранжерея»",
      "КОНТАКТ ПЛОЩАДКИ": "Менеджер Артем, +7 (918) 555-44-33",
      "ПРАЗДНИК НА УЛИЦЕ": "В помещении (ресторан, банкетный зал)",
      "КТО ПРИНИМАЕТ РАБОТЫ": "Ольга Смирнова (координатор площадки)",
      "ПАЛИТРА ОФОРМЛЕНИЯ": "#F6EEFF, #E2D4F0, #C08EF4, #FFFFFF",
      "СТИЛЬ ОФОРМЛЕНИЯ": "Бохо-шик с классическими элементами",
      "ОРИЕНТИРОВОЧНЫЙ БЮДЖЕТ": "350 000 ₽",
      "ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ": "Обязательно нужна светодиодная гирлянда-роса на заднем фоне арки и много насыпных свечей вдоль дорожки. Стоп-лист: гвоздики и пахучие лилии."
    };
    setFormData(demoData);
    setCustomColors(['#F6EEFF', '#E2D4F0', '#C08EF4', '#FFFFFF']);
    showToast('Демо-данные заполнены', 'Все 14 полей брифа заполнены эталонными ответами.', 'success');
  };

  // 14 key client fields from brief screenshot
  const keyFields = [
    "ИМЯ КЛИЕНТА",
    "ТЕЛЕФОН",
    "СОБЫТИЕ",
    "ДАТА",
    "ГОСТЕЙ",
    "ФОРМАТ СОБЫТИЯ",
    "АДРЕС ПЛОЩАДКИ/НАЗВАНИЕ",
    "КОНТАКТ ПЛОЩАДКИ",
    "ПРАЗДНИК НА УЛИЦЕ",
    "КТО ПРИНИМАЕТ РАБОТЫ",
    "ПАЛИТРА ОФОРМЛЕНИЯ",
    "СТИЛЬ ОФОРМЛЕНИЯ",
    "ОРИЕНТИРОВОЧНЫЙ БЮДЖЕТ",
    "ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ"
  ];
  const filledCount = keyFields.filter(k => formData[k] && formData[k].trim().length > 0).length;
  const completionPercent = Math.round((filledCount / keyFields.length) * 100);

  // Save changes to current project
  const handleSaveBrief = (isSubmitByClient: boolean = false) => {
    if (!currentProject) return;

    const updatedBriefValues = {
      ...currentProject.briefValues,
      ...formData,
      "ПАЛИТРА ОФОРМЛЕНИЯ": customColors.join(', '),
      "ЗОНЫ ОФОРМЛЕНИЯ": selectedZones.join(', ')
    };

    const budgetNum = parseInt(formData["ОРИЕНТИРОВОЧНЫЙ БЮДЖЕТ"]?.replace(/\D/g, '') || '0', 10);
    const guestsNum = parseInt(formData["ГОСТЕЙ"]?.replace(/\D/g, '') || '50', 10);

    const updatedProject: Project = {
      ...currentProject,
      clientName: formData["ИМЯ КЛИЕНТА"] || currentProject.clientName,
      clientPhone: formData["ТЕЛЕФОН"] || currentProject.clientPhone,
      clientEmail: formData["EMAIL"] || currentProject.clientEmail,
      name: formData["СОБЫТИЕ"] || currentProject.name,
      date: formData["ДАТА"] || currentProject.date,
      venue: formData["АДРЕС ПЛОЩАДКИ/НАЗВАНИЕ"] || currentProject.venue,
      budget: budgetNum > 0 ? budgetNum : currentProject.budget,
      photos: referenceImages,
      briefValues: updatedBriefValues,
      brief: {
        ...currentProject.brief,
        style: formData["СТИЛЬ ОФОРМЛЕНИЯ"] || currentProject.brief?.style || 'Не выбран',
        colors: customColors.length > 0 ? customColors : (currentProject.brief?.colors || []),
        guestsCount: guestsNum > 0 ? guestsNum : (currentProject.brief?.guestsCount || 50),
        specialRequests: formData["ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ"] || currentProject.brief?.specialRequests || 'Нет примечаний.',
        flowers: formData["ФЛОРИСТИКА"] ? formData["ФЛОРИСТИКА"].split(',').map(s => s.trim()).filter(Boolean) : []
      }
    };

    onUpdateProject(updatedProject);

    if (isSubmitByClient) {
      setIsSubmittedSuccess(true);
      showToast('Бриф отправлен!', 'Спасибо! Ответы сохранены и переданы декоратору проекта.', 'success');
    } else {
      showToast('Бриф сохранен', 'Данные проекта успешно синхронизированы.', 'success');
    }
  };

  // Copy link for client
  const clientBriefUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/brief/${currentProject?.id || 'new'}`
    : '';

  const handleCopyLink = () => {
    if (navigator.clipboard && clientBriefUrl) {
      navigator.clipboard.writeText(clientBriefUrl);
      showToast('Ссылка скопирована', 'Персональная ссылка на бриф скопирована в буфер обмена.', 'success');
    }
  };

  // WhatsApp share
  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Здравствуйте! Пожалуйста, заполните бриф на оформление мероприятия «${formData["СОБЫТИЕ"] || currentProject?.name || 'Праздник'}»: ${clientBriefUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (!currentProject) {
    return (
      <div className="p-8 text-center bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] sm:rounded-[32px] border border-zinc-200/50 dark:border-zinc-800/40">
        <ClipboardList className="w-12 h-12 mx-auto text-[var(--primary-accent)] mb-3 opacity-60" />
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Нет доступных проектов</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Создайте проект в разделе «Проекты», чтобы сформировать клиентский бриф.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-2.5 sm:space-y-3 pb-12">
      {/* 1. TOP CONTROL BAR / PREVIEW BANNER */}
      {isClientPreviewMode ? (
        /* CLIENT PREVIEW TOP BAR - ULTRA COMPACT */
        <div className="p-2 sm:p-2.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 backdrop-blur-md border border-amber-500/25 shadow-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span className="text-[11px] sm:text-xs font-bold text-amber-950 dark:text-amber-100 truncate">
              Предпросмотр клиента
            </span>
            <span className="hidden md:inline text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-200 font-medium">
              {studioName}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Toggle view: Interactive Form vs Summary Card */}
            <div className="flex items-center p-0.5 rounded-full bg-white/80 dark:bg-zinc-800/80 border border-amber-500/30">
              <button
                type="button"
                onClick={() => setPreviewSubMode('form')}
                className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold transition-all cursor-pointer ${
                  previewSubMode === 'form'
                    ? 'bg-[var(--primary-accent)] text-white shadow-2xs'
                    : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-900'
                }`}
              >
                Анкета
              </button>
              <button
                type="button"
                onClick={() => setPreviewSubMode('summary')}
                className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold transition-all cursor-pointer ${
                  previewSubMode === 'summary'
                    ? 'bg-[var(--primary-accent)] text-white shadow-2xs'
                    : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-900'
                }`}
              >
                Сводка
              </button>
            </div>

            {/* Quick Demo Data Fill Button */}
            <button
              type="button"
              onClick={handleFillDemoData}
              className="rounded-full px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold bg-white/80 dark:bg-zinc-800/80 border border-amber-500/40 text-amber-900 dark:text-amber-200 hover:bg-white flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
              title="Заполнить демо-данными"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span className="hidden sm:inline">Демо</span>
            </button>

            {/* Exit Preview Button */}
            <button
              type="button"
              onClick={() => setIsClientPreviewMode(false)}
              className="rounded-full px-3 py-1 text-[10px] sm:text-[11px] font-bold bg-amber-500 text-white hover:bg-amber-600 flex items-center gap-1 transition-all cursor-pointer shadow-xs shrink-0"
            >
              <EyeOff className="w-3 h-3" />
              <span>Выйти</span>
            </button>
          </div>
        </div>
      ) : (
        /* DECORATOR ADMIN WORKSPACE BAR */
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 sm:p-2.5 rounded-2xl bg-white/50 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200/60 dark:border-zinc-800/50 shadow-xs">
          {/* Project Selector */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] uppercase font-normal text-zinc-600 dark:text-zinc-400 tracking-normal shrink-0">
              Проект:
            </span>
            <div className="relative min-w-[160px] sm:min-w-[220px] max-w-[300px]">
              <select
                value={activeProjectId}
                onChange={(e) => {
                  setActiveProjectId(e.target.value);
                  const p = projects.find(item => item.id === e.target.value);
                  if (p) onSelectProject(p);
                }}
                className="w-full appearance-none bg-white/90 dark:bg-zinc-800/90 border border-zinc-200/80 dark:border-zinc-700/70 rounded-full px-3 py-1 pr-7 text-xs font-semibold text-zinc-900 dark:text-zinc-100 cursor-pointer shadow-2xs hover:border-[var(--primary-accent)] transition-all focus:outline-none truncate"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                    {p.name} {p.clientName ? `(${p.clientName})` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--primary-accent)] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Action Pills */}
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            {/* Quick Demo Data Fill */}
            <button
              type="button"
              onClick={handleFillDemoData}
              className="rounded-full px-2.5 py-1 text-[11px] font-semibold border border-[var(--primary-accent)]/30 text-[var(--primary-accent)] dark:text-[var(--lavenderAccent)] bg-white/70 dark:bg-zinc-800/70 hover:bg-[var(--lavenderSoft)] flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
              title="Заполнить бриф готовым примером свадьбы"
            >
              <Sparkles className="w-3 h-3" />
              <span className="hidden sm:inline">Демо-данные</span>
            </button>

            {/* Client Preview Mode Switch */}
            <button
              type="button"
              onClick={() => {
                setIsClientPreviewMode(true);
                setPreviewSubMode('form');
              }}
              className="rounded-full px-3 py-1 text-[11px] font-bold text-white flex items-center gap-1 transition-all cursor-pointer shadow-xs"
              style={{
                background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)'
              }}
              title="Открыть интерактивный предпросмотр глазами клиента"
            >
              <Eye className="w-3 h-3" />
              <span>Предпросмотр</span>
            </button>

            {/* Copy Link button */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="rounded-full px-2.5 py-1 text-[11px] font-semibold border border-zinc-300/80 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-300 bg-white/70 dark:bg-zinc-800/70 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
              title="Скопировать ссылку для отправки клиенту"
            >
              <Copy className="w-3 h-3" />
              <span className="hidden sm:inline">Ссылка</span>
            </button>

            {/* WhatsApp share */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="rounded-full px-2.5 py-1 text-[11px] font-semibold border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/50 hover:bg-emerald-100/70 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
              title="Отправить бриф в WhatsApp"
            >
              <MessageCircle className="w-3 h-3" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. OFFICIAL BRAND HEADER (МАКСИМАЛЬНО УЗКАЯ ВВЕРХУ: ТОЛЬКО НАЗВАНИЕ, ЛОГОТИП И КОНТАКТЫ) */}
      <div className="relative overflow-hidden bg-white/60 dark:bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-zinc-200/60 dark:border-zinc-800/50 shadow-xs px-3 py-1.5 sm:px-4 sm:py-2">
        <div className="flex items-center justify-between gap-2.5 min-w-0">
          {/* Brand Logo, Studio Identity & Contacts in a single compact row */}
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Circular Logo */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs flex items-center justify-center overflow-hidden shrink-0 p-0.5">
              {brandLogo ? (
                <img
                  src={brandLogo}
                  alt={studioName}
                  className="w-full h-full object-cover rounded-full"
                  onError={() => setBrandLogo(null)}
                />
              ) : (
                <div className="w-full h-full rounded-full bg-[var(--lavenderSoft)] flex items-center justify-center text-[var(--primary-accent)] font-bold text-xs sm:text-sm">
                  {studioName.charAt(0)}
                </div>
              )}
            </div>

            {/* Studio Name + Inline Contacts */}
            <div className="min-w-0 flex flex-col sm:flex-row sm:items-center sm:gap-3">
              <h1 className="text-xs sm:text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 truncate leading-tight">
                {studioName}
              </h1>

              {/* Contact info */}
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[10px] sm:text-[11px] text-zinc-600 dark:text-zinc-400">
                {studioPhone && (
                  <a href={`tel:${studioPhone}`} className="hover:text-[var(--primary-accent)] flex items-center gap-1 font-medium transition-colors">
                    <Phone className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-zinc-400 shrink-0" />
                    <span>{studioPhone}</span>
                  </a>
                )}
                {studioEmail && (
                  <a href={`mailto:${studioEmail}`} className="hover:text-[var(--primary-accent)] flex items-center gap-1 font-medium transition-colors">
                    <Mail className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-zinc-400 shrink-0" />
                    <span className="truncate max-w-[130px] sm:max-w-none">{studioEmail}</span>
                  </a>
                )}
                {studioWebsite && (
                  <a
                    href={studioWebsite.startsWith('http') ? studioWebsite : `https://${studioWebsite}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[var(--primary-accent)] font-medium hover:underline transition-colors"
                  >
                    <Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                    <span className="truncate max-w-[100px] sm:max-w-none">{studioWebsite}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Discreet counter pill on the right */}
          <div className="shrink-0 flex items-center gap-1 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100/90 dark:bg-zinc-800/80 px-2 py-0.5 rounded-full">
            <span>{filledCount}/14</span>
          </div>
        </div>

        {/* Ultra-slim 1.5px progress indicator on the very bottom border of the header */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-200/50 dark:bg-zinc-800/50">
          <motion.div
            className="h-full"
            style={{
              background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)'
            }}
            initial={{ width: 0 }}
            animate={{ width: `${completionPercent}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* 3. SUCCESS SUBMISSION FEEDBACK */}
      <AnimatePresence>
        {isSubmittedSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 sm:p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-400/40 text-center space-y-1.5 shadow-sm"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>
            <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-100">
              Бриф успешно отправлен в студию!
            </h3>
            <p className="text-xs text-emerald-800 dark:text-emerald-200 max-w-md mx-auto leading-relaxed">
              Благодарим вас за заполнение анкеты! Мы уже получили ответы и приступаем к разработке оформления.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. MAIN CONTENT: INTERACTIVE FORM vs STRUCTURED SUMMARY CARD */}
      {isClientPreviewMode && previewSubMode === "summary" ? (
        <ClientBriefSummary
          formData={formData}
          customColors={customColors}
          referenceImages={referenceImages}
          onSwitchToEdit={() => setPreviewSubMode("form")}
        />
      ) : (
        <ClientBriefForm
          formData={formData}
          handleFieldChange={handleFieldChange}
          customColors={customColors}
          handleAddCustomColor={handleAddCustomColor}
          handleRemoveCustomColor={handleRemoveCustomColor}
          handleSelectPresetPalette={handleSelectPresetPalette}
          referenceImages={referenceImages}
          setReferenceImages={setReferenceImages}
          handleImageUpload={handleImageUpload}
          filledCount={filledCount}
        />
      )}

      {/* 6. BOTTOM ACTION BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60">
        <div className="text-xs text-zinc-600 dark:text-zinc-400">
          Все изменения автоматически сохраняются в карточке проекта «{currentProject.name}».
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Secondary Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="rounded-full px-4 py-2.5 text-xs font-semibold border border-[var(--primary-accent)]/30 text-[var(--primary-accent)] dark:text-[var(--lavenderAccent)] bg-white/60 dark:bg-zinc-800/60 hover:bg-[var(--lavenderSoft)] transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Поделиться ссылкой</span>
          </button>

          {/* Primary Submit Button */}
          <button
            type="button"
            onClick={() => handleSaveBrief(isClientPreviewMode)}
            style={{
              background: 'linear-gradient(135deg, var(--primary-grad-from, #8C52D0) 0%, var(--primary-grad-to, #582F89) 100%)'
            }}
            className="rounded-full px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:opacity-95 active:scale-95"
          >
            {isClientPreviewMode ? (
              <>
                <Send className="w-4 h-4" />
                <span>Отправить бриф в студию</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Сохранить и синхронизировать</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
