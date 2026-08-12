import React, { useState, useEffect } from 'react';
import {
  FileText,
  ShieldCheck,
  FileCheck,
  FileSignature,
  Building2,
  Upload,
  Download,
  Eye,
  Save,
  X,
  FileCode2,
  UserCheck,
  HelpCircle,
  Landmark,
  Percent,
  CheckCircle2
} from 'lucide-react';

interface DocumentsTabProps {
  showToast: (title: string, message: string, type?: 'success' | 'error' | 'info' | 'warn') => void;
}

type DecoratorEntityType = 'ip' | 'ooo' | 'selfEmployed';

interface TemplateDoc {
  id: string;
  title: string;
  code: string;
  size: string;
  desc: string;
  icon: React.ElementType;
  version: string;
  updatedAt: string;
  templateContent: string;
}

export default function DocumentsTab({ showToast }: DocumentsTabProps) {
  // Check migration from deprecated 'fiz' / 'individual'
  const [entityType, setEntityType] = useState<DecoratorEntityType>(() => {
    const saved = localStorage.getItem('fleur_decorator_entity_type');
    if (saved === 'fiz' || saved === 'individual' || saved === 'fizlic') {
      localStorage.setItem('fleur_decorator_entity_type', 'selfEmployed');
      return 'selfEmployed';
    }
    if (saved === 'ip' || saved === 'ooo' || saved === 'selfEmployed') {
      return saved as DecoratorEntityType;
    }
    return 'ip';
  });

  useEffect(() => {
    const rawSaved = localStorage.getItem('fleur_decorator_entity_type_raw');
    if (rawSaved === 'fiz' || rawSaved === 'individual') {
      localStorage.setItem('fleur_decorator_entity_type_raw', 'migrated');
      showToast(
        'Статус обновлён',
        'Статус «Физлицо» устарел. Ваш профиль автоматически переведён в «Самозанятый».',
        'info'
      );
    }
  }, [showToast]);

  // ИП Requisites State
  const [ipData, setIpData] = useState(() => {
    try {
      const saved = localStorage.getItem('fleur_decorator_ip');
      return saved ? JSON.parse(saved) : {
        name: 'ИП Иванов Иван Иванович',
        inn: '772812345678',
        ogrnip: '320774600123456',
        phone: '+7 (999) 456-78-90',
        email: 'denis@fleur-decor.ru',
        address: 'г. Москва, ул. Вавилова, д. 15, оф. 402',
        bankName: 'ПАО Сбербанк',
        bik: '044525225',
        account: '40802810138000012345',
        taxSystem: 'УСН «Доходы» (6%)',
        vatRate: '22%'
      };
    } catch (e) {
      return {
        name: 'ИП Иванов Иван Иванович',
        inn: '772812345678',
        ogrnip: '320774600123456',
        phone: '+7 (999) 456-78-90',
        email: 'denis@fleur-decor.ru',
        address: 'г. Москва, ул. Вавилова, д. 15, оф. 402',
        bankName: 'ПАО Сбербанк',
        bik: '044525225',
        account: '40802810138000012345',
        taxSystem: 'УСН «Доходы» (6%)',
        vatRate: '22%'
      };
    }
  });

  // ООО Requisites State
  const [oooData, setOooData] = useState(() => {
    try {
      const saved = localStorage.getItem('fleur_decorator_ooo');
      return saved ? JSON.parse(saved) : {
        name: 'ООО «Флёр Деко Студио»',
        inn: '7728987654',
        kpp: '772801001',
        ogrn: '1207700987654',
        signatoryName: 'Иванов Иван Иванович',
        signatoryPosition: 'Генеральный директор',
        phone: '+7 (495) 123-45-67',
        email: 'info@fleur-decor.ru',
        address: 'г. Москва, Пресненская наб., д. 12, этаж 35',
        bankName: 'АО «Альфа-Банк»',
        bik: '044525593',
        account: '40702810901230009988',
        taxSystem: 'УСН «Доходы» (6%)',
        vatRate: '22%'
      };
    } catch (e) {
      return {
        name: 'ООО «Флёр Деко Студио»',
        inn: '7728987654',
        kpp: '772801001',
        ogrn: '1207700987654',
        signatoryName: 'Иванов Иван Иванович',
        signatoryPosition: 'Генеральный директор',
        phone: '+7 (495) 123-45-67',
        email: 'info@fleur-decor.ru',
        address: 'г. Москва, Пресненская наб., д. 12, этаж 35',
        bankName: 'АО «Альфа-Банк»',
        bik: '044525593',
        account: '40702810901230009988',
        taxSystem: 'УСН «Доходы» (6%)',
        vatRate: '22%'
      };
    }
  });

  // Самозанятый Requisites State
  const [selfEmployedData, setSelfEmployedData] = useState(() => {
    try {
      const saved = localStorage.getItem('fleur_decorator_self');
      return saved ? JSON.parse(saved) : {
        fullName: 'Иванов Иван Иванович',
        inn: '772812345678',
        phone: '+7 (999) 456-78-90',
        email: 'denis@fleur-decor.ru',
        address: 'г. Москва, ул. Ленина, д. 10, кв. 45',
        bankName: 'ПАО Сбербанк',
        bik: '044525225',
        bankAccount: '40817810500001234567',
        taxSystem: 'НПД (Налог на профессиональный доход)',
        vatRate: 'Без НДС'
      };
    } catch (e) {
      return {
        fullName: 'Иванов Иван Иванович',
        inn: '772812345678',
        phone: '+7 (999) 456-78-90',
        email: 'denis@fleur-decor.ru',
        address: 'г. Москва, ул. Ленина, д. 10, кв. 45',
        bankName: 'ПАО Сбербанк',
        bik: '044525225',
        bankAccount: '40817810500001234567',
        taxSystem: 'НПД (Налог на профессиональный доход)',
        vatRate: 'Без НДС'
      };
    }
  });

  // Modal preview template state
  const [previewTemplate, setPreviewTemplate] = useState<TemplateDoc | null>(null);

  // Template definitions
  const [templates, setTemplates] = useState<TemplateDoc[]>([
    {
      id: 'decor-contract',
      title: 'Договор на декор',
      code: '№ ДК-2026/08',
      size: '2.4 МБ',
      desc: 'Договор оказания услуг по оформлению и декорированию площадки с приложениями и спецификацией',
      icon: FileText,
      version: 'Версия 2.4 (Стандарт 2026)',
      updatedAt: '10.08.2026',
      templateContent: `ДОГОВОР ОКАЗАНИЯ ДЕКОРАТОРСКИХ УСЛУГ {КОД_ДОКУМЕНТА}

г. Москва                                                      «{ДАТА_ОФОРМЛЕНИЯ}»

1. СТОРОНЫ ДОГОВОРА:
Исполнитель: {ИСПОЛНИТЕЛЬ_НАИМЕНОВАНИЕ}, ИНН: {ИСПОЛНИТЕЛЬ_ИНН}, {ИСПОЛНИТЕЛЬ_РЕКВИЗИТЫ_ОГРН}, в лице {ИСПОЛНИТЕЛЬ_ПОДПИСАНТ}, с одной стороны, и
Заказчик: {ЗАКАЗЧИК_ФИО_НАИМЕНОВАНИЕ}, Телефон: {ЗАКАЗЧИК_ТЕЛЕФОН}, Паспорт/ИНН: {ЗАКАЗЧИК_РЕКВИЗИТЫ}, с другой стороны.

2. ПРЕДМЕТ ДОГОВОРА:
2.1. Исполнитель обязуется оказать комплекс декораторских и флористических услуг по оформлению мероприятия "{НАЗВАНИЕ_ПРОЕКТА}", а Заказчик обязуется принять и оплатить оказанные услуги.
2.2. Площадка проведения: {АДРЕС_ПЛОЩАДКИ}.
2.3. Общая стоимость услуг по Договору составляет: {СУММА_ПРОЕКТА} рублей (в т.ч. НДС: {СТАВКА_НДС}).

3. ПОРЯДОК ОПЛАТЫ:
3.1. Задаток за бронирование даты составляет: {СУММА_ЗАДАТКА} рублей.
3.2. Окончательный расчет производится не позднее дня проведения монтажа.`
    },
    {
      id: 'deposit-agreement',
      title: 'Соглашение о задатке',
      code: '№ СЗ-2026/08',
      size: '1.1 МБ',
      desc: 'Соглашение о гарантийной сумме бронирования даты проведения мероприятия',
      icon: ShieldCheck,
      version: 'Версия 1.8 (Стандарт)',
      updatedAt: '05.08.2026',
      templateContent: `СОГЛАШЕНИЕ О ЗАДАТКЕ {КОД_ДОКУМЕНТА}

г. Москва                                                      «{ДАТА_ОФОРМЛЕНИЯ}»

Исполнитель: {ИСПОЛНИТЕЛЬ_НАИМЕНОВАНИЕ} (ИНН: {ИСПОЛНИТЕЛЬ_ИНН})
Заказчик: {ЗАКАЗЧИК_ФИО_НАИМЕНОВАНИЕ} (Телефон: {ЗАКАЗЧИК_ТЕЛЕФОН})

1. Заказчик передает Исполнителю сумму задатка в размере {СУММА_ЗАДАТКА} рублей в счет обеспечения исполнения обязательств по бронированию даты проведения мероприятия ({ДАТА_МЕРОПРИЯТИЯ}).
2. Сумма задатка засчитывается в общую стоимость услуг по договору на декор.`
    },
    {
      id: 'acceptance-act',
      title: 'Акт сдачи-приёмки',
      code: '№ АКТ-2026/15',
      size: '850 КБ',
      desc: 'Акт приема-передачи выполненных декораторских работ и арендованного имущества',
      icon: FileCheck,
      version: 'Версия 2.1 (Стандарт 2026)',
      updatedAt: '01.08.2026',
      templateContent: `АКТ СДАЧИ-ПРИЁМКИ ВЫПОЛНЕННЫХ РАБОТ {КОД_ДОКУМЕНТА}

г. Москва                                                      «{ДАТА_ОФОРМЛЕНИЯ}»

Исполнитель: {ИСПОЛНИТЕЛЬ_НАИМЕНОВАНИЕ}
Заказчик: {ЗАКАЗЧИК_ФИО_НАИМЕНОВАНИЕ}

Настоящий Акт составлен о том, что Исполнитель выполнил в полном объеме и с надлежащим качеством работы по декорированию объекта "{НАЗВАНИЕ_ПРОЕКТА}".
Стороны претензий друг к другу по объёму и качеству выполненных работ не имеют.`
    },
    {
      id: 'pd-consent',
      title: 'Согласие на обработку ПД',
      code: '№ ОПД-2026/01',
      size: '420 КБ',
      desc: 'Согласие на обработку персональных данных (152-ФЗ) и фото/видеосъемку оформления',
      icon: FileSignature,
      version: 'Версия 1.2 (152-ФЗ)',
      updatedAt: '15.07.2026',
      templateContent: `СОГЛАСИЕ НА ОБРАБОТКУ ПЕРСОНАЛЬНЫХ ДАННЫХ {КОД_ДОКУМЕНТА}

Я, {ЗАКАЗЧИК_ФИО_НАИМЕНОВАНИЕ}, выражаю свое согласие Исполнителю {ИСПОЛНИТЕЛЬ_НАИМЕНОВАНИЕ} на обработку моих персональных данных в целях исполнения договора на оказание декораторских услуг, а также на использование фото- и видеоматериалов оформленного интерьера в портфолио студии.`
    }
  ]);

  // Validation function
  const validateForm = (): boolean => {
    const onlyDigits = (str: string) => str.replace(/\D/g, '');

    if (entityType === 'ip') {
      if (!ipData.name.trim()) {
        showToast('Ошибка валидации', 'Укажите официальное наименование ИП', 'error');
        return false;
      }
      const innDigits = onlyDigits(ipData.inn);
      if (innDigits.length !== 12) {
        showToast('Ошибка валидации', 'ИНН ИП должен содержать ровно 12 цифр', 'error');
        return false;
      }
      const ogrnipDigits = onlyDigits(ipData.ogrnip);
      if (ogrnipDigits.length !== 15) {
        showToast('Ошибка валидации', 'ОГРНИП ИП должен содержать ровно 15 цифр', 'error');
        return false;
      }
      if (!ipData.phone.trim()) {
        showToast('Ошибка валидации', 'Укажите контактный телефон', 'error');
        return false;
      }
      if (!ipData.address.trim()) {
        showToast('Ошибка валидации', 'Укажите адрес регистрации ИП', 'error');
        return false;
      }
      if (ipData.account.trim()) {
        const accDigits = onlyDigits(ipData.account);
        if (accDigits.length !== 20) {
          showToast('Ошибка валидации', 'Расчётный счёт должен содержать ровно 20 цифр (номер карты вводить нельзя)', 'error');
          return false;
        }
      }
      if (ipData.bik.trim()) {
        const bikDigits = onlyDigits(ipData.bik);
        if (bikDigits.length !== 9) {
          showToast('Ошибка валидации', 'БИК банка должен содержать ровно 9 цифр', 'error');
          return false;
        }
      }
    } else if (entityType === 'ooo') {
      if (!oooData.name.trim()) {
        showToast('Ошибка валидации', 'Укажите наименование организации (ООО)', 'error');
        return false;
      }
      const innDigits = onlyDigits(oooData.inn);
      if (innDigits.length !== 10) {
        showToast('Ошибка валидации', 'ИНН юридического лица должен содержать ровно 10 цифр', 'error');
        return false;
      }
      const kppDigits = onlyDigits(oooData.kpp);
      if (kppDigits.length !== 9) {
        showToast('Ошибка валидации', 'КПП организации должен содержать ровно 9 цифр', 'error');
        return false;
      }
      const ogrnDigits = onlyDigits(oooData.ogrn);
      if (ogrnDigits.length !== 13) {
        showToast('Ошибка валидации', 'ОГРН организации должен содержать ровно 13 цифр', 'error');
        return false;
      }
      if (!oooData.signatoryName.trim()) {
        showToast('Ошибка валидации', 'Укажите ФИО подписанта от ООО', 'error');
        return false;
      }
      if (!oooData.signatoryPosition.trim()) {
        showToast('Ошибка валидации', 'Укажите должность подписанта', 'error');
        return false;
      }
      if (!oooData.phone.trim()) {
        showToast('Ошибка валидации', 'Укажите контактный телефон', 'error');
        return false;
      }
      if (!oooData.address.trim()) {
        showToast('Ошибка валидации', 'Укажите юридический адрес ООО', 'error');
        return false;
      }
      const accDigits = onlyDigits(oooData.account);
      if (accDigits.length !== 20) {
        showToast('Ошибка валидации', 'Для ООО расчётный счёт обязателен и должен содержать ровно 20 цифр', 'error');
        return false;
      }
      if (!oooData.bankName.trim()) {
        showToast('Ошибка валидации', 'Укажите название банка для ООО', 'error');
        return false;
      }
      const bikDigits = onlyDigits(oooData.bik);
      if (bikDigits.length !== 9) {
        showToast('Ошибка валидации', 'БИК банка должен содержать ровно 9 цифр', 'error');
        return false;
      }
    } else if (entityType === 'selfEmployed') {
      if (!selfEmployedData.fullName.trim()) {
        showToast('Ошибка валидации', 'Укажите ФИО самозанятого', 'error');
        return false;
      }
      const innDigits = onlyDigits(selfEmployedData.inn);
      if (innDigits.length !== 12) {
        showToast('Ошибка валидации', 'ИНН самозанятого должен содержать ровно 12 цифр', 'error');
        return false;
      }
      if (!selfEmployedData.phone.trim()) {
        showToast('Ошибка валидации', 'Укажите контактный телефон', 'error');
        return false;
      }
      if (!selfEmployedData.address.trim()) {
        showToast('Ошибка валидации', 'Укажите адрес регистрации самозанятого', 'error');
        return false;
      }
      if (selfEmployedData.bankAccount.trim()) {
        const accDigits = onlyDigits(selfEmployedData.bankAccount);
        if (accDigits.length !== 20) {
          showToast('Ошибка валидации', 'Расчётный счёт должен содержать ровно 20 цифр (номер карты вводить нельзя)', 'error');
          return false;
        }
      }
      if (selfEmployedData.bik.trim()) {
        const bikDigits = onlyDigits(selfEmployedData.bik);
        if (bikDigits.length !== 9) {
          showToast('Ошибка валидации', 'БИК банка должен содержать ровно 9 цифр', 'error');
          return false;
        }
      }
    }

    return true;
  };

  // Save requisites action
  const handleSaveRequisites = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    localStorage.setItem('fleur_decorator_entity_type', entityType);
    localStorage.setItem('fleur_decorator_ip', JSON.stringify(ipData));
    localStorage.setItem('fleur_decorator_ooo', JSON.stringify(oooData));
    localStorage.setItem('fleur_decorator_self', JSON.stringify(selfEmployedData));
    showToast('Реквизиты сохранены', 'Данные исполнителя успешно сохранены и будут подставляться в документы.', 'success');
  };

  // Custom template upload simulation
  const handleCustomTemplateUpload = (templateId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTemplates(prev =>
        prev.map(t => {
          if (t.id === templateId) {
            return {
              ...t,
              version: `Пользовательский (${file.name})`,
              updatedAt: new Date().toLocaleDateString('ru-RU')
            };
          }
          return t;
        })
      );
      showToast('Шаблон загружен', `Файл "${file.name}" установлен в качестве активного шаблона.`, 'success');
    }
  };

  // Download template blank
  const handleDownloadTemplateBlank = (template: TemplateDoc) => {
    const blob = new Blob([template.templateContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Шаблон_${template.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Бланк скачан', `Скачан шаблон "${template.title}".`, 'info');
  };

  const RequiredBadge = () => (
    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-purple-100 dark:bg-purple-950/80 text-[#8C52D0] dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
      Обязательно
    </span>
  );

  const OptionalBadge = () => (
    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
      Можно позже
    </span>
  );

  // VAT rates updated for 2026
  const vatOptions = [
    { value: 'Без НДС', label: 'Без НДС' },
    { value: '0%', label: '0%' },
    { value: '5%', label: '5% (УСН доход 20–272,5 млн ₽)' },
    { value: '7%', label: '7% (УСН доход 272,5–490,5 млн ₽)' },
    { value: '10%', label: '10%' },
    { value: '22%', label: '22% (Базовая ставка с 2026 года)' },
    { value: '20%', label: '20% (для договоров до 2026 года)' }
  ];

  return (
    <div className="space-y-6">
      {/* 1. БЛОК: РЕКВИЗИТЫ ИСПОЛНИТЕЛЯ (ДЕКОРАТОРА) */}
      <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] border border-zinc-200/50 dark:border-zinc-800/40 p-5 sm:p-6 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-[var(--lavenderSoft)] rounded-xl text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                Реквизиты исполнителя
              </h3>
              <p className="text-xs sm:text-sm font-normal text-zinc-700 dark:text-zinc-300 leading-relaxed">
                Данные вашей студии для подстановки в шаблоны договоров и актов
              </p>
            </div>
          </div>

          {/* ENTITY SELECTOR SWITCH (ONLY IP / OOO / SELF-EMPLOYED) */}
          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-full border border-zinc-200/60 dark:border-zinc-700/60 self-start overflow-x-auto no-scrollbar max-w-full touch-pan-x sm:w-full sm:grid sm:grid-cols-3 lg:w-auto lg:flex lg:self-auto shrink-0">
            {[
              { id: 'ip', label: 'ИП' },
              { id: 'ooo', label: 'ООО' },
              { id: 'selfEmployed', label: 'Самозанятый' }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setEntityType(item.id as DecoratorEntityType)}
                className={`px-3 py-1.5 rounded-full text-xs transition-all duration-200 cursor-pointer text-center flex items-center justify-center ${
                  entityType === item.id
                    ? 'bg-[#8C52D0] text-white font-semibold shadow-xs'
                    : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* REQUISITES FORM */}
        <form onSubmit={handleSaveRequisites} className="space-y-6">
          {/* SECTION A: ОСНОВНЫЕ РЕКВИЗИТЫ ОРГАНИЗАЦИИ / СТУДИИ */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              Основные реквизиты
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* --- ИП FIELDS --- */}
              {entityType === 'ip' && (
                <>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal block">
                        ОФИЦИАЛЬНОЕ НАИМЕНОВАНИЕ
                      </label>
                      <RequiredBadge />
                    </div>
                    <input
                      type="text"
                      value={ipData.name}
                      onChange={(e) => setIpData({ ...ipData, name: e.target.value })}
                      placeholder="ИП Иванов Иван Иванович"
                      className="w-full px-3.5 py-2.5 bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#8C52D0]/30 focus:border-[#8C52D0] outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal block">
                        ИНН (12 ЦИФР)
                      </label>
                      <RequiredBadge />
                    </div>
                    <input
                      type="text"
                      maxLength={12}
                      value={ipData.inn}
                      onChange={(e) => setIpData({ ...ipData, inn: e.target.value })}
                      placeholder="772812345678"
                      className="w-full px-3.5 py-2.5 bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#8C52D0]/30 focus:border-[#8C52D0] outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal block">
                        ОГРНИП (15 ЦИФР)
                      </label>
                      <RequiredBadge />
                    </div>
                    <input
                      type="text"
                      maxLength={15}
                      value={ipData.ogrnip}
                      onChange={(e) => setIpData({ ...ipData, ogrnip: e.target.value })}
                      placeholder="320774600123456"
                      className="w-full px-3.5 py-2.5 bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#8C52D0]/30 focus:border-[#8C52D0] outline-none transition-all"
                    />
                  </div>
                </>
              )}

              {/* --- ООО FIELDS --- */}
              {entityType === 'ooo' && (
                <>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal block">
                        ОФИЦИАЛЬНОЕ НАИМЕНОВАНИЕ
                      </label>
                      <RequiredBadge />
                    </div>
                    <input
                      type="text"
                      value={oooData.name}
                      onChange={(e) => setOooData({ ...oooData, name: e.target.value })}
                      placeholder="ООО «Название»"
                      className="w-full px-3.5 py-2.5 bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#8C52D0]/30 focus:border-[#8C52D0] outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal block">
                        ИНН (10 ЦИФР)
                      </label>
                      <RequiredBadge />
                    </div>
                    <input
                      type="text"
                      maxLength={10}
                      value={oooData.inn}
                      onChange={(e) => setOooData({ ...oooData, inn: e.target.value })}
                      placeholder="7728987654"
                      className="w-full px-3.5 py-2.5 bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#8C52D0]/30 focus:border-[#8C52D0] outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal block">
                        КПП (9 ЦИФР)
                      </label>
                      <RequiredBadge />
                    </div>
                    <input
                      type="text"
                      maxLength={9}
                      value={oooData.kpp}
                      onChange={(e) => setOooData({ ...oooData, kpp: e.target.value })}
                      placeholder="772801001"
                      className="w-full px-3.5 py-2.5 bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#8C52D0]/30 focus:border-[#8C52D0] outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal block">
                        ОГРН (13 ЦИФР)
                      </label>
                      <RequiredBadge />
                    </div>
                    <input
                      type="text"
                      maxLength={13}
                      value={oooData.ogrn}
                      onChange={(e) => setOooData({ ...oooData, ogrn: e.target.value })}
                      placeholder="1207700987654"
                      className="w-full px-3.5 py-2.5 bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#8C52D0]/30 focus:border-[#8C52D0] outline-none transition-all"
                    />
                  </div>
                </>
              )}

              {/* --- САМОЗАНЯТЫЙ FIELDS --- */}
              {entityType === 'selfEmployed' && (
                <>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal block">
                        ФИО
                      </label>
                      <RequiredBadge />
                    </div>
                    <input
                      type="text"
                      value={selfEmployedData.fullName}
                      onChange={(e) => setSelfEmployedData({ ...selfEmployedData, fullName: e.target.value })}
                      placeholder="Иванов Иван Иванович"
                      className="w-full px-3.5 py-2.5 bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#8C52D0]/30 focus:border-[#8C52D0] outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal block">
                        ИНН (12 ЦИФР)
                      </label>
                      <RequiredBadge />
                    </div>
                    <input
                      type="text"
                      maxLength={12}
                      value={selfEmployedData.inn}
                      onChange={(e) => setSelfEmployedData({ ...selfEmployedData, inn: e.target.value })}
                      placeholder="772812345678"
                      className="w-full px-3.5 py-2.5 bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#8C52D0]/30 focus:border-[#8C52D0] outline-none transition-all"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* SECTION B: БЛОК «ПОДПИСАНТ» (ТОЛЬКО ДЛЯ ООО) */}
          {entityType === 'ooo' && (
            <div className="p-4 bg-purple-50/40 dark:bg-purple-950/20 rounded-2xl border border-purple-200/50 dark:border-purple-900/40 space-y-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#8C52D0]" />
                <h4 className="text-xs sm:text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Подписант
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal block">
                      ФИО ПОДПИСАНТА
                    </label>
                    <RequiredBadge />
                  </div>
                  <input
                    type="text"
                    value={oooData.signatoryName}
                    onChange={(e) => setOooData({ ...oooData, signatoryName: e.target.value })}
                    placeholder="Иванов Иван Иванович"
                    className="w-full px-3.5 py-2.5 bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#8C52D0]/30 focus:border-[#8C52D0] outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal block">
                      ДОЛЖНОСТЬ ПОДПИСАНТА
                    </label>
                    <RequiredBadge />
                  </div>
                  <input
                    type="text"
                    value={oooData.signatoryPosition}
                    onChange={(e) => setOooData({ ...oooData, signatoryPosition: e.target.value })}
                    placeholder="Генеральный директор"
                    className="w-full px-3.5 py-2.5 bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#8C52D0]/30 focus:border-[#8C52D0] outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION C: АДРЕС И КОНТАКТЫ */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Адрес и контакты
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal block">
                    ТЕЛЕФОН КОНТАКТА
                  </label>
                  <RequiredBadge />
                </div>
                <input
                  type="text"
                  value={
                    entityType === 'ip'
                      ? ipData.phone
                      : entityType === 'ooo'
                      ? oooData.phone
                      : selfEmployedData.phone
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (entityType === 'ip') setIpData({ ...ipData, phone: val });
                    else if (entityType === 'ooo') setOooData({ ...oooData, phone: val });
                    else setSelfEmployedData({ ...selfEmployedData, phone: val });
                  }}
                  placeholder="+7 (999) 000-00-00"
                  className="w-full px-3.5 py-2.5 bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#8C52D0]/30 focus:border-[#8C52D0] outline-none transition-all"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <div className="flex items-center justify-between gap-1">
                  <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal block">
                    {entityType === 'ooo' ? 'ЮРИДИЧЕСКИЙ АДРЕС' : 'АДРЕС РЕГИСТРАЦИИ'}
                  </label>
                  <RequiredBadge />
                </div>
                <input
                  type="text"
                  value={
                    entityType === 'ip'
                      ? ipData.address
                      : entityType === 'ooo'
                      ? oooData.address
                      : selfEmployedData.address
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (entityType === 'ip') setIpData({ ...ipData, address: val });
                    else if (entityType === 'ooo') setOooData({ ...oooData, address: val });
                    else setSelfEmployedData({ ...selfEmployedData, address: val });
                  }}
                  placeholder="г. Москва, ул. Ленина, д. 10"
                  className="w-full px-3.5 py-2.5 bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#8C52D0]/30 focus:border-[#8C52D0] outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* SECTION D: БАНКОВСКИЕ РЕКВИЗИТЫ */}
          <div className="space-y-3 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
            <div>
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-[#8C52D0]" />
                <h4 className="text-xs sm:text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Банковские реквизиты
                </h4>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                Нужны, если работаете с юрлицами по безналу. Для переводов на карту можно не заполнять.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal block">
                    РАСЧЁТНЫЙ СЧЁТ
                  </label>
                  {entityType === 'ooo' ? <RequiredBadge /> : <OptionalBadge />}
                </div>
                <input
                  type="text"
                  maxLength={20}
                  value={
                    entityType === 'ip'
                      ? ipData.account
                      : entityType === 'ooo'
                      ? oooData.account
                      : selfEmployedData.bankAccount
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (entityType === 'ip') setIpData({ ...ipData, account: val });
                    else if (entityType === 'ooo') setOooData({ ...oooData, account: val });
                    else setSelfEmployedData({ ...selfEmployedData, bankAccount: val });
                  }}
                  placeholder="40802810..."
                  className="w-full px-3.5 py-2.5 bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#8C52D0]/30 focus:border-[#8C52D0] outline-none transition-all"
                />
                <p className="text-[10px] text-zinc-500 leading-tight">
                  Расчётный счёт, 20 цифр. Номер карты вводить нельзя.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal block">
                    НАИМЕНОВАНИЕ БАНКА
                  </label>
                  {entityType === 'ooo' ? <RequiredBadge /> : <OptionalBadge />}
                </div>
                <input
                  type="text"
                  value={
                    entityType === 'ip'
                      ? ipData.bankName
                      : entityType === 'ooo'
                      ? oooData.bankName
                      : selfEmployedData.bankName
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (entityType === 'ip') setIpData({ ...ipData, bankName: val });
                    else if (entityType === 'ooo') setOooData({ ...oooData, bankName: val });
                    else setSelfEmployedData({ ...selfEmployedData, bankName: val });
                  }}
                  placeholder="ПАО Сбербанк"
                  className="w-full px-3.5 py-2.5 bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#8C52D0]/30 focus:border-[#8C52D0] outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal block">
                    БИК БАНКА (9 ЦИФР)
                  </label>
                  {entityType === 'ooo' ? <RequiredBadge /> : <OptionalBadge />}
                </div>
                <input
                  type="text"
                  maxLength={9}
                  value={
                    entityType === 'ip'
                      ? ipData.bik
                      : entityType === 'ooo'
                      ? oooData.bik
                      : selfEmployedData.bik
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (entityType === 'ip') setIpData({ ...ipData, bik: val });
                    else if (entityType === 'ooo') setOooData({ ...oooData, bik: val });
                    else setSelfEmployedData({ ...selfEmployedData, bik: val });
                  }}
                  placeholder="044525225"
                  className="w-full px-3.5 py-2.5 bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#8C52D0]/30 focus:border-[#8C52D0] outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* SECTION E: НАЛОГОВЫЙ БЛОК */}
          <div className="space-y-3 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
            <div>
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-[#8C52D0]" />
                <h4 className="text-xs sm:text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Налоговый режим и НДС (Актуально на 2026 год)
                </h4>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal block">
                    СИСТЕМА НАЛОГООБЛОЖЕНИЯ
                  </label>
                  <RequiredBadge />
                </div>
                {entityType === 'selfEmployed' ? (
                  <input
                    type="text"
                    disabled
                    value="НПД (Налог на профессиональный доход)"
                    className="w-full px-3.5 py-2.5 bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium cursor-not-allowed"
                  />
                ) : (
                  <select
                    value={entityType === 'ip' ? ipData.taxSystem : oooData.taxSystem}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (entityType === 'ip') setIpData({ ...ipData, taxSystem: val });
                      else setOooData({ ...oooData, taxSystem: val });
                    }}
                    className="w-full px-3.5 py-2.5 bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#8C52D0]/30 focus:border-[#8C52D0] outline-none transition-all cursor-pointer"
                  >
                    <option value="УСН «Доходы» (6%)">УСН «Доходы» (6%)</option>
                    <option value="УСН «Доходы минус расходы» (15%)">УСН «Доходы минус расходы» (15%)</option>
                    <option value="ПСН (Патентная система)">ПСН (Патентная система)</option>
                    <option value="ОСНО (Общая система)">ОСНО (Общая система)</option>
                  </select>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal block">
                    СТАВКА НДС
                  </label>
                  <RequiredBadge />
                </div>
                {entityType === 'selfEmployed' ? (
                  <input
                    type="text"
                    disabled
                    value="Без НДС (НПД)"
                    className="w-full px-3.5 py-2.5 bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium cursor-not-allowed"
                  />
                ) : (
                  <select
                    value={entityType === 'ip' ? ipData.vatRate : oooData.vatRate}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (entityType === 'ip') setIpData({ ...ipData, vatRate: val });
                      else setOooData({ ...oooData, vatRate: val });
                    }}
                    className="w-full px-3.5 py-2.5 bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#8C52D0]/30 focus:border-[#8C52D0] outline-none transition-all cursor-pointer"
                  >
                    {vatOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>


          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 text-white rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] shadow-xs"
              style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
            >
              <Save className="w-4 h-4" /> Сохранить реквизиты
            </button>
          </div>
        </form>
      </div>

      {/* 2. БЛОК: 4 ШАБЛОНА ДОКУМЕНТОВ ДЕКОРАТОРА */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Шаблоны документов декоратора (4)
            </h3>
            <p className="text-xs sm:text-sm font-normal text-zinc-700 dark:text-zinc-300 leading-relaxed">
              Главные базовые шаблоны студии. Вы можете просмотреть текст, скачать бланк или загрузить свой собственный файл
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <div
                key={template.id}
                className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] border border-zinc-200/50 dark:border-zinc-800/40 p-5 shadow-xs flex flex-col justify-between gap-4 transition-all hover:border-purple-300/60 dark:hover:border-purple-800/60"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2 bg-[var(--lavenderSoft)] rounded-xl text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 block mb-0.5">
                          {template.code}
                        </span>
                        <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                          {template.title}
                        </h4>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                      {template.version}
                    </span>
                  </div>

                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {template.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-200/40 dark:border-zinc-800/40 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-mono">
                    Обновлено: {template.updatedAt} • {template.size}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* View Button */}
                    <button
                      type="button"
                      onClick={() => setPreviewTemplate(template)}
                      className="px-3 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-700 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-zinc-700 dark:text-zinc-300 hover:text-[#8C52D0] dark:hover:text-purple-300 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Просмотреть
                    </button>

                    {/* Download Blank */}
                    <button
                      type="button"
                      onClick={() => handleDownloadTemplateBlank(template)}
                      className="px-3 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Скачать шаблон"
                    >
                      <Download className="w-3.5 h-3.5" /> Скачать
                    </button>

                    {/* Upload custom template */}
                    <label className="px-3 py-1.5 rounded-full border border-purple-200 dark:border-purple-800/60 bg-purple-50/50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-[#582F89] dark:text-purple-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" /> Загрузить файл
                      <input
                        type="file"
                        accept=".docx,.pdf,.txt"
                        className="hidden"
                        onChange={(e) => handleCustomTemplateUpload(template.id, e)}
                      />
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. ИНФОРМАЦИОННАЯ ПЛАШКА В СООТВЕТСТВИИ С AGENTS.MD */}
      <div className="p-3.5 bg-emerald-500/10 dark:bg-emerald-950/30 rounded-2xl border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200 font-normal leading-relaxed flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <div>
          <span className="font-semibold">Автоматическое объединение данных:</span> При генерации документов в карточках проектов система автоматически берет реквизиты вашей студии отсюда и объединяет их с данными конкретного клиента. Все юридические бланки формируются локально на вашем устройстве.
        </div>
      </div>

      {/* MODAL: PREVIEW TEMPLATE TEXT */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-zinc-200/80 dark:border-zinc-800 max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <FileCode2 className="w-5 h-5 text-[#8C52D0]" />
                <div>
                  <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
                    {previewTemplate.title} ({previewTemplate.code})
                  </h3>
                  <p className="text-xs text-zinc-500">Просмотр структуры шаблона с тегами автозамены</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 font-mono text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap select-text">
              {previewTemplate.templateContent}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 rounded-full border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
              >
                Закрыть
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDownloadTemplateBlank(previewTemplate);
                  setPreviewTemplate(null);
                }}
                className="px-4 py-2 text-white rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all hover:opacity-95"
                style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
              >
                <Download className="w-3.5 h-3.5" /> Скачать бланк
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
