import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  Upload, 
  Info, 
  Check, 
  Copy, 
  Download, 
  ShieldCheck, 
  User, 
  Coins 
} from 'lucide-react';

interface DocumentsTabProps {
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warn') => void;
}

type EntityType = 'IP' | 'OOO' | 'Self' | 'Individual';

interface Requisites {
  entityType: EntityType;
  name: string;
  inn: string;
  ogrn: string;
  phone: string;
  address: string;
  account: string;
  bank: string;
  bik: string;
  vat: string;
  usn: string;
}

export default function DocumentsTab({ showToast }: DocumentsTabProps) {
  // Load requisites from localStorage or defaults
  const [requisites, setRequisites] = useState<Requisites>(() => {
    const saved = localStorage.getItem('pop_contract_requisites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      entityType: 'IP',
      name: 'ИП Сагидуллина Алина Александровна',
      inn: '230000000000',
      ogrn: '320230000000000',
      phone: '+7 900 000-00-00',
      address: 'г. Краснодар, ул. Примерная, д. 1, кв. 1',
      account: '40802810000000000000',
      bank: 'ПАО Сбербанк',
      bik: '040349602',
      vat: 'Без НДС',
      usn: 'Нет'
    };
  });

  // Templates states
  const [contractType, setContractType] = useState<'standard' | 'custom'>(() => {
    return (localStorage.getItem('pop_contract_template_type') as 'standard' | 'custom') || 'standard';
  });
  const [actType, setActType] = useState<'standard' | 'custom'>(() => {
    return (localStorage.getItem('pop_act_template_type') as 'standard' | 'custom') || 'standard';
  });

  const [customContractFile, setCustomContractFile] = useState<string | null>(() => {
    return localStorage.getItem('pop_custom_contract_filename') || 'shablon_dogovora.docx';
  });
  const [customActFile, setCustomActFile] = useState<string | null>(() => {
    return localStorage.getItem('pop_custom_act_filename') || 'shablon_akta.docx';
  });

  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  // Save requisites helper
  const handleSaveRequisites = (updated: Requisites) => {
    setRequisites(updated);
    localStorage.setItem('pop_contract_requisites', JSON.stringify(updated));
  };

  const handleFieldChange = (field: keyof Requisites, value: string) => {
    const updated = { ...requisites, [field]: value };
    handleSaveRequisites(updated);
  };

  const handleEntityTypeChange = (type: EntityType) => {
    const updated = { ...requisites, entityType: type };
    handleSaveRequisites(updated);
    showToast('Тип лица изменен', `Установлен тип лица: ${
      type === 'IP' ? 'ИП' : type === 'OOO' ? 'ООО' : type === 'Self' ? 'Самозанятый' : 'Физлицо'
    }`, 'info');
  };

  // Persist template choices
  useEffect(() => {
    localStorage.setItem('pop_contract_template_type', contractType);
  }, [contractType]);

  useEffect(() => {
    localStorage.setItem('pop_act_template_type', actType);
  }, [actType]);

  const handleFileUpload = (type: 'contract' | 'act', e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === 'contract') {
        setCustomContractFile(file.name);
        localStorage.setItem('pop_custom_contract_filename', file.name);
        showToast('Шаблон договора загружен', `Файл "${file.name}" успешно привязан.`, 'success');
      } else {
        setCustomActFile(file.name);
        localStorage.setItem('pop_custom_act_filename', file.name);
        showToast('Шаблон акта загружен', `Файл "${file.name}" успешно привязан.`, 'success');
      }
    }
  };

  const handleCopyTag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    showToast('Тег скопирован', `Переменная ${tag} добавлена в буфер обмена.`, 'success');
    setTimeout(() => setCopiedTag(null), 2000);
  };

  return (
    <div className="space-y-6 mx-auto pb-16 animate-fadeIn w-full max-w-none px-4 md:px-6">
      
      {/* RENDER THE IDEAL OPTION (VARIANT 3) */}
      <div className="grid grid-cols-1 xl:grid-cols-[65%_35%] gap-8 items-start w-full animate-fadeIn">
        
        {/* LEFT COLUMN: Requisites & Taxation */}
        <div className="space-y-6 w-full">
          
          {/* Card 1: Requisites & Taxation */}
          <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[32px] p-7 border border-zinc-200/50 dark:border-zinc-800/40 space-y-6 shadow-xs w-full">
            
            <div className="flex items-start justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-[var(--lavenderSoft)] rounded-lg text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <h3 className="font-medium text-base text-zinc-900 dark:text-zinc-50 tracking-tight">Профиль исполнителя</h3>
                </div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-normal">
                  Юридические реквизиты, используемые при генерации договоров и актов выполненных услуг.
                </p>
              </div>
            </div>

            {/* Entity Selector (Premium Pill Design) */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Организационно-правовая форма</label>
              <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-100/50 dark:bg-zinc-950/30 rounded-xl border border-zinc-200/30 dark:border-zinc-800/20">
                {(['IP', 'OOO', 'Self', 'Individual'] as EntityType[]).map((type) => {
                  const labels: Record<EntityType, string> = {
                    IP: 'ИП',
                    OOO: 'ООО',
                    Self: 'Самозанятый',
                    Individual: 'Физлицо'
                  };
                  const isActive = requisites.entityType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleEntityTypeChange(type)}
                      className={`py-2 px-1 rounded-lg text-xs font-medium tracking-wide transition-all cursor-pointer text-center ${
                        isActive
                          ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-xs'
                          : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                      }`}
                    >
                      {labels[type]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Grid */}
            <div className="space-y-4">
              
              {/* Full Legal Name */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Официальное наименование</label>
                  <span className="text-xs text-zinc-400 italic">Для первого абзаца договора</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={requisites.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder="ИП Сагидуллина Алина Александровна"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white/40 dark:bg-zinc-950/10 border border-zinc-200/60 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[var(--lavDeep)] dark:focus:border-[var(--lavenderAccent)] focus:ring-1 focus:ring-[var(--lavDeep)]/20 text-xs font-medium transition-all"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Triple Row: INN, OGRN, Phone */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">ИНН</label>
                  <input
                    type="text"
                    value={requisites.inn}
                    onChange={(e) => handleFieldChange('inn', e.target.value)}
                    placeholder="12 или 10 цифр"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/40 dark:bg-zinc-950/10 border border-zinc-200/60 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[var(--lavDeep)] dark:focus:border-[var(--lavenderAccent)] focus:ring-1 focus:ring-[var(--lavDeep)]/20 text-xs font-medium transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    {requisites.entityType === 'OOO' ? 'ОГРН' : 'ОГРНИП'}
                  </label>
                  <input
                    type="text"
                    value={requisites.ogrn}
                    onChange={(e) => handleFieldChange('ogrn', e.target.value)}
                    placeholder="Номер регистрации"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/40 dark:bg-zinc-950/10 border border-zinc-200/60 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[var(--lavDeep)] dark:focus:border-[var(--lavenderAccent)] focus:ring-1 focus:ring-[var(--lavDeep)]/20 text-xs font-medium transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Телефон контакта</label>
                  <input
                    type="text"
                    value={requisites.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    placeholder="+7 900 000-00-00"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/40 dark:bg-zinc-950/10 border border-zinc-200/60 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[var(--lavDeep)] dark:focus:border-[var(--lavenderAccent)] focus:ring-1 focus:ring-[var(--lavDeep)]/20 text-xs font-medium transition-all"
                  />
                </div>
              </div>

              {/* Legal Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Юридический адрес регистрации</label>
                <input
                  type="text"
                  value={requisites.address}
                  onChange={(e) => handleFieldChange('address', e.target.value)}
                  placeholder="Индекс, город, улица, дом..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/40 dark:bg-zinc-950/10 border border-zinc-200/60 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[var(--lavDeep)] dark:focus:border-[var(--lavenderAccent)] focus:ring-1 focus:ring-[var(--lavDeep)]/20 text-xs font-medium transition-all"
                />
              </div>

              {/* Banking details block */}
              <div className="p-4 bg-zinc-50/50 dark:bg-zinc-950/10 rounded-2xl border border-zinc-100 dark:border-zinc-800/40 space-y-3">
                <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Банковские реквизиты</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400">Расчётный счёт</label>
                    <input
                      type="text"
                      value={requisites.account}
                      onChange={(e) => handleFieldChange('account', e.target.value)}
                      placeholder="408..."
                      className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400">Название банка</label>
                    <input
                      type="text"
                      value={requisites.bank}
                      onChange={(e) => handleFieldChange('bank', e.target.value)}
                      placeholder="ПАО Сбербанк"
                      className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400">БИК банка</label>
                    <input
                      type="text"
                      value={requisites.bik}
                      onChange={(e) => handleFieldChange('bik', e.target.value)}
                      placeholder="040..."
                      className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Dynamic Taxation Section inside the same panel */}
            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/50 space-y-4">
              <div className="space-y-1">
                <h4 className="font-medium text-sm text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
                  <Coins className="w-4 h-4 text-[var(--sage)]" />
                  <span>Налоговый режим</span>
                </h4>
                <p className="text-xs text-zinc-400 leading-normal">
                  Параметры налогообложения для автоматического вычета при расчетах рентабельности смет.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* VAT */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Налог на добавленную стоимость (НДС)</label>
                  <select
                    value={requisites.vat}
                    onChange={(e) => handleFieldChange('vat', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/40 dark:bg-zinc-950/10 border border-zinc-200/60 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none text-xs font-medium cursor-pointer [&>option]:bg-zinc-900 [&>option]:text-white"
                  >
                    <option value="Без НДС">Без НДС</option>
                    <option value="5%">5%</option>
                    <option value="7%">7%</option>
                    <option value="10%">10%</option>
                    <option value="20%">20%</option>
                  </select>
                  <p className="text-xs text-zinc-400 leading-normal">
                    Если вы плательщик НДС — выберите вашу ставку.
                  </p>
                </div>

                {/* USN */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Упрощенная система (УСН)</label>
                  <select
                    value={requisites.usn}
                    onChange={(e) => handleFieldChange('usn', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/40 dark:bg-zinc-950/10 border border-zinc-200/60 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none text-xs font-medium cursor-pointer [&>option]:bg-zinc-900 [&>option]:text-white"
                  >
                    <option value="Нет">Нет</option>
                    <option value="6% (Доходы)">6% (Доходы)</option>
                    <option value="15% (Доходы минус расходы)">15% (Доходы минус расходы)</option>
                  </select>
                  <p className="text-xs text-zinc-400 leading-normal">
                    Применяется совместно или отдельно от НДС.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-[var(--sageSoft)] rounded-2xl border border-[var(--sage)]/10 text-xs text-[var(--metricGreenText)] dark:text-[var(--sage)] leading-relaxed">
                На патентной системе (ПСН) и для самозанятых (НПД) поля НДС и УСН оставьте пустыми — эти режимы не выставляют НДС, а налог не считается процентом с проекта.
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Document Templates (2 separate cards) + Auto-completion Card */}
        <div className="space-y-6 w-full">
          
          {/* Card 1: Contract Template */}
          <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[32px] p-6 border border-zinc-200/50 dark:border-zinc-800/40 space-y-4 shadow-xs w-full">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[var(--lavenderSoft)] rounded-xl text-[var(--lavDeep)] shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Шаблон Договора</h4>
                  <p className="text-xs text-zinc-400">Формат шаблона .docx для автозаполнения</p>
                </div>
              </div>
              <div className="flex bg-zinc-100/80 dark:bg-zinc-950/40 p-0.5 rounded-lg border border-zinc-200/40 dark:border-zinc-800/40 shrink-0">
                <button
                  onClick={() => setContractType('standard')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    contractType === 'standard'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                  }`}
                >
                  Типовой
                </button>
                <button
                  onClick={() => setContractType('custom')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    contractType === 'custom'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                  }`}
                >
                  Свой
                </button>
              </div>
            </div>

            {contractType === 'standard' ? (
              <div className="space-y-3 pt-1">
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Базовый договор на оказание декораторских услуг. Содержит все необходимые пункты, форс-мажоры и порядок расчетов.
                </p>
                <div className="flex items-center justify-between pt-2 text-xs">
                  <span className="text-zinc-400 font-medium">Готов к генерации</span>
                  <button 
                    onClick={() => showToast('Образец загружен', 'Типовой договор отправлен на скачивание.', 'success')}
                    className="text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] hover:opacity-85 font-medium inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Скачать образец</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Активный файл:</span>
                  <span className="inline-flex items-center gap-1 font-medium text-[var(--metricGreenText)] dark:text-[var(--sage)] text-xs uppercase tracking-wide bg-[var(--sageSoft)] px-2 rounded-full">
                    ✓ загружен
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200/50 dark:border-zinc-800/40 text-xs font-mono text-zinc-600 dark:text-zinc-300 truncate">
                  {customContractFile}
                </div>
                <label className="border border-dashed border-zinc-200 dark:border-zinc-800 hover:border-[var(--lavenderAccent)]/60 hover:bg-[var(--lavenderSoft)]/10 rounded-2xl p-4 text-center flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer">
                  <Upload className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Загрузить новый договор (.docx)</span>
                  <input type="file" accept=".docx" className="hidden" onChange={(e) => handleFileUpload('contract', e)} />
                </label>
              </div>
            )}
          </div>

          {/* Card 2: Act Template */}
          <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[32px] p-6 border border-zinc-200/50 dark:border-zinc-800/40 space-y-4 shadow-xs w-full">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[var(--lavenderSoft)] rounded-xl text-[var(--lavDeep)] shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Шаблон Акта выполненных работ</h4>
                  <p className="text-xs text-zinc-400">Формат шаблона .docx для автозаполнения</p>
                </div>
              </div>
              <div className="flex bg-zinc-100/80 dark:bg-zinc-950/40 p-0.5 rounded-lg border border-zinc-200/40 dark:border-zinc-800/40 shrink-0">
                <button
                  onClick={() => setActType('standard')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    actType === 'standard'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                  }`}
                >
                  Типовой
                </button>
                <button
                  onClick={() => setActType('custom')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    actType === 'custom'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                  }`}
                >
                  Свой
                </button>
              </div>
            </div>

            {actType === 'standard' ? (
              <div className="space-y-3 pt-1">
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Стандартный одностраничный акт сдачи-приемки оказанных услуг. Подтверждает выполнение всех обязательств по проекту.
                </p>
                <div className="flex items-center justify-between pt-2 text-xs">
                  <span className="text-zinc-400 font-medium">Готов к генерации</span>
                  <button 
                    onClick={() => showToast('Образец загружен', 'Типовой акт отправлен на скачивание.', 'success')}
                    className="text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] hover:opacity-85 font-medium inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Скачать образец</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Активный файл:</span>
                  <span className="inline-flex items-center gap-1 font-medium text-[var(--metricGreenText)] dark:text-[var(--sage)] text-xs uppercase tracking-wide bg-[var(--sageSoft)] px-2 rounded-full">
                    ✓ загружен
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200/50 dark:border-zinc-800/40 text-xs font-mono text-zinc-600 dark:text-zinc-300 truncate">
                  {customActFile}
                </div>
                <label className="border border-dashed border-zinc-200 dark:border-zinc-800 hover:border-[var(--lavenderAccent)]/60 hover:bg-[var(--lavenderSoft)]/10 rounded-2xl p-4 text-center flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer">
                  <Upload className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Загрузить новый акт (.docx)</span>
                  <input type="file" accept=".docx" className="hidden" onChange={(e) => handleFileUpload('act', e)} />
                </label>
              </div>
            )}
          </div>

          {/* Card 3: Auto-completion Card (Now placed below the Act card in Right Column, with super compact spacing) */}
          <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[24px] p-4.5 border border-zinc-200/50 dark:border-zinc-800/40 space-y-3.5 shadow-xs w-full">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider block">Переменная автозаполнения</span>
              <p className="text-xs text-zinc-400 leading-normal">
                Вставьте эту метку в ваш шаблон для автоматической подстановки данных.
              </p>
            </div>

            {/* Tag Copy Block */}
            <div 
              onClick={() => handleCopyTag('{{Реквизиты заказчика}}')}
              className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/15 border border-zinc-100/40 dark:border-zinc-800/30 hover:border-[var(--lavenderAccent)]/40 hover:bg-[var(--lavenderSoft)]/20 dark:hover:bg-[var(--lavenderSoft)]/10 transition-all cursor-pointer group"
            >
              <div className="space-y-0.5 min-w-0">
                <code className="text-xs font-mono text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] font-medium bg-[var(--lavenderSoft)]/50 dark:bg-[var(--lavenderSoft)]/30 px-1.5 py-0.5 rounded block truncate">
                  {"{{Реквизиты заказчика}}"}
                </code>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Кликните, чтобы скопировать
                </p>
              </div>
              <span className="text-zinc-400 group-hover:text-[var(--lavDeep)] transition-colors shrink-0 ml-2">
                {copiedTag === '{{Реквизиты заказчика}}' ? (
                  <Check className="w-3.5 h-3.5 text-[var(--sage)]" />
                ) : (
                  <Copy className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                )}
              </span>
            </div>

            {/* How it works guidance */}
            <div className="p-3 rounded-xl bg-[var(--sageSoft)]/30 border border-[var(--sage)]/5 space-y-1.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              <p>
                Реквизиты заказчика подставятся из брифа целиком, а исполнителя — из формы слева.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
