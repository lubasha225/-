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
  Coins,
  UserCheck,
  Receipt
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
  const [consentType, setConsentType] = useState<'standard' | 'custom'>(() => {
    return (localStorage.getItem('pop_consent_template_type') as 'standard' | 'custom') || 'standard';
  });
  const [depositType, setDepositType] = useState<'standard' | 'custom'>(() => {
    return (localStorage.getItem('pop_deposit_template_type') as 'standard' | 'custom') || 'standard';
  });

  const [customContractFile, setCustomContractFile] = useState<string | null>(() => {
    return localStorage.getItem('pop_custom_contract_filename') || 'shablon_dogovora.docx';
  });
  const [customActFile, setCustomActFile] = useState<string | null>(() => {
    return localStorage.getItem('pop_custom_act_filename') || 'shablon_akta.docx';
  });
  const [customConsentFile, setCustomConsentFile] = useState<string | null>(() => {
    return localStorage.getItem('pop_custom_consent_filename') || 'soglasiye_na_obrabotku_pd.docx';
  });
  const [customDepositFile, setCustomDepositFile] = useState<string | null>(() => {
    return localStorage.getItem('pop_custom_deposit_filename') || 'soglasheniye_o_zadatke.docx';
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

  useEffect(() => {
    localStorage.setItem('pop_consent_template_type', consentType);
  }, [consentType]);

  useEffect(() => {
    localStorage.setItem('pop_deposit_template_type', depositType);
  }, [depositType]);

  const handleFileUpload = (type: 'contract' | 'act' | 'consent' | 'deposit', e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === 'contract') {
        setCustomContractFile(file.name);
        localStorage.setItem('pop_custom_contract_filename', file.name);
        showToast('Шаблон договора загружен', `Файл "${file.name}" успешно привязан.`, 'success');
      } else if (type === 'act') {
        setCustomActFile(file.name);
        localStorage.setItem('pop_custom_act_filename', file.name);
        showToast('Шаблон акта загружен', `Файл "${file.name}" успешно привязан.`, 'success');
      } else if (type === 'consent') {
        setCustomConsentFile(file.name);
        localStorage.setItem('pop_custom_consent_filename', file.name);
        showToast('Шаблон согласия ПД загружен', `Файл "${file.name}" успешно привязан.`, 'success');
      } else if (type === 'deposit') {
        setCustomDepositFile(file.name);
        localStorage.setItem('pop_custom_deposit_filename', file.name);
        showToast('Шаблон соглашения о задатке загружен', `Файл "${file.name}" успешно привязан.`, 'success');
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
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[var(--lavenderSoft)] rounded-xl text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 tracking-tight">Профиль исполнителя</h3>
                </div>
                <p className="text-xs sm:text-sm font-normal text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Юридические реквизиты, используемые при генерации договоров и актов выполненных услуг.
                </p>
              </div>
            </div>

            {/* Entity Selector (Premium Pill Design) */}
            <div className="space-y-2">
              <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal block">Организационно-правовая форма</label>
              <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-100/50 dark:bg-zinc-950/30 rounded-full border border-zinc-200/30 dark:border-zinc-800/20">
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
                      className={`py-2 px-1 rounded-full text-xs font-medium tracking-wide transition-all cursor-pointer text-center ${
                        isActive
                          ? 'bg-[linear-gradient(135deg,#8C52D0_0%,#582F89_100%)] text-white font-semibold shadow-xs'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium'
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
                  <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal">Официальное наименование</label>
                  <span className="text-xs text-zinc-600 dark:text-zinc-300 font-normal italic">Для первого абзаца договора</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={requisites.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder="ИП Сагидуллина Алина Александровна"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white/40 dark:bg-zinc-950/10 border border-zinc-200/60 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[var(--lavDeep)] dark:focus:border-[var(--lavenderAccent)] focus:ring-1 focus:ring-[var(--lavDeep)]/20 text-[14px] font-medium transition-all"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Triple Row: INN, OGRN, Phone */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal">ИНН</label>
                  <input
                    type="text"
                    value={requisites.inn}
                    onChange={(e) => handleFieldChange('inn', e.target.value)}
                    placeholder="12 или 10 цифр"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/40 dark:bg-zinc-950/10 border border-zinc-200/60 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[var(--lavDeep)] dark:focus:border-[var(--lavenderAccent)] focus:ring-1 focus:ring-[var(--lavDeep)]/20 text-[14px] font-medium transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal">
                    {requisites.entityType === 'OOO' ? 'ОГРН' : 'ОГРНИП'}
                  </label>
                  <input
                    type="text"
                    value={requisites.ogrn}
                    onChange={(e) => handleFieldChange('ogrn', e.target.value)}
                    placeholder="Номер регистрации"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/40 dark:bg-zinc-950/10 border border-zinc-200/60 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[var(--lavDeep)] dark:focus:border-[var(--lavenderAccent)] focus:ring-1 focus:ring-[var(--lavDeep)]/20 text-[14px] font-medium transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal">Телефон контакта</label>
                  <input
                    type="text"
                    value={requisites.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    placeholder="+7 900 000-00-00"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/40 dark:bg-zinc-950/10 border border-zinc-200/60 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[var(--lavDeep)] dark:focus:border-[var(--lavenderAccent)] focus:ring-1 focus:ring-[var(--lavDeep)]/20 text-[14px] font-medium transition-all"
                  />
                </div>
              </div>

              {/* Legal Address */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal">Юридический адрес регистрации</label>
                <input
                  type="text"
                  value={requisites.address}
                  onChange={(e) => handleFieldChange('address', e.target.value)}
                  placeholder="Индекс, город, улица, дом..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/40 dark:bg-zinc-950/10 border border-zinc-200/60 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[var(--lavDeep)] dark:focus:border-[var(--lavenderAccent)] focus:ring-1 focus:ring-[var(--lavDeep)]/20 text-[14px] font-medium transition-all"
                />
              </div>

              {/* Banking details block */}
              <div className="p-4 bg-zinc-50/50 dark:bg-zinc-950/10 rounded-2xl border border-zinc-100 dark:border-zinc-800/40 space-y-3">
                <span className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal block">Банковские реквизиты</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal">Расчётный счёт</label>
                    <input
                      type="text"
                      value={requisites.account}
                      onChange={(e) => handleFieldChange('account', e.target.value)}
                      placeholder="408..."
                      className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal">Название банка</label>
                    <input
                      type="text"
                      value={requisites.bank}
                      onChange={(e) => handleFieldChange('bank', e.target.value)}
                      placeholder="ПАО Сбербанк"
                      className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 tracking-normal">БИК банка</label>
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
                <h4 className="font-semibold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                  <Coins className="w-4.5 h-4.5 text-[var(--sage)]" />
                  <span>Налоговый режим</span>
                </h4>
                <p className="text-xs sm:text-sm font-normal text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Параметры налогообложения для автоматического вычета при расчетах рентабельности смет.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* VAT */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal">Налог на добавленную стоимость (НДС)</label>
                  <select
                    value={requisites.vat}
                    onChange={(e) => handleFieldChange('vat', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/40 dark:bg-zinc-950/10 border border-zinc-200/60 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none text-[14px] font-medium cursor-pointer [&>option]:bg-zinc-900 [&>option]:text-white"
                  >
                    <option value="Без НДС">Без НДС</option>
                    <option value="5%">5%</option>
                    <option value="7%">7%</option>
                    <option value="10%">10%</option>
                    <option value="20%">20%</option>
                  </select>
                  <p className="text-xs font-normal text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    Если вы плательщик НДС — выберите вашу ставку.
                  </p>
                </div>

                {/* USN */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal">Упрощенная система (УСН)</label>
                  <select
                    value={requisites.usn}
                    onChange={(e) => handleFieldChange('usn', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/40 dark:bg-zinc-950/10 border border-zinc-200/60 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none text-[14px] font-medium cursor-pointer [&>option]:bg-zinc-900 [&>option]:text-white"
                  >
                    <option value="Нет">Нет</option>
                    <option value="6% (Доходы)">6% (Доходы)</option>
                    <option value="15% (Доходы минус расходы)">15% (Доходы минус расходы)</option>
                  </select>
                  <p className="text-xs font-normal text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    Применяется совместно или отдельно от НДС.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-500/10 dark:bg-emerald-950/30 rounded-2xl border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200 font-normal leading-relaxed">
                На патентной системе (ПСН) и для самозанятых (НПД) поля НДС и УСН оставьте пустыми — эти режимы не выставляют НДС, а налог не считается процентом с проекта.
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Document Templates (3 separate cards) + Auto-completion Card */}
        <div className="space-y-6 w-full">
          
          {/* Card 1: Contract Template */}
          <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] p-5 sm:p-6 border border-zinc-200/50 dark:border-zinc-800/40 space-y-3.5 shadow-xs w-full">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[var(--lavenderSoft)] rounded-xl text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 truncate">Шаблон Договора</h4>
            </div>

            <p className="text-xs sm:text-sm font-normal text-zinc-700 dark:text-zinc-300">
              Формат шаблона .docx для автозаполнения
            </p>

            <div className="flex items-center gap-1.5 bg-zinc-100/80 dark:bg-zinc-950/40 p-1 rounded-full border border-zinc-200/40 dark:border-zinc-800/40 w-fit">
              <button
                onClick={() => setContractType('standard')}
                style={contractType === 'standard' ? { background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' } : {}}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  contractType === 'standard'
                    ? 'text-white shadow-xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 bg-transparent border border-transparent'
                }`}
              >
                Типовой
              </button>
              <button
                onClick={() => setContractType('custom')}
                style={contractType === 'custom' ? { background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' } : {}}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  contractType === 'custom'
                    ? 'text-white shadow-xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 bg-transparent border border-transparent'
                }`}
              >
                Свой
              </button>
            </div>

            {contractType === 'standard' ? (
              <div className="space-y-3 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/40">
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-200 leading-relaxed font-normal">
                  Базовый договор на оказание декораторских услуг. Содержит все необходимые пункты, форс-мажоры и порядок расчетов.
                </p>
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-xs text-zinc-600 dark:text-zinc-300 font-normal">Готов к генерации</span>
                  <button 
                    onClick={() => showToast('Образец загружен', 'Типовой договор отправлен на скачивание.', 'success')}
                    className="relative group px-3.5 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-all duration-300 hover:opacity-85 active:scale-[0.98] cursor-pointer bg-transparent"
                  >
                    <span
                      className="absolute inset-0 rounded-full pointer-events-none p-[1px]"
                      style={{
                        background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)',
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                      }}
                    />
                    <Download className="w-3.5 h-3.5 text-[#8C52D0] dark:text-[#985DE0] relative z-10 shrink-0" />
                    <span
                      className="bg-clip-text text-transparent relative z-10"
                      style={{ backgroundImage: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
                    >
                      Скачать образец
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/40">
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
          <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] p-5 sm:p-6 border border-zinc-200/50 dark:border-zinc-800/40 space-y-3.5 shadow-xs w-full">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[var(--lavenderSoft)] rounded-xl text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 truncate">Шаблон Акта выполненных работ</h4>
            </div>

            <p className="text-xs sm:text-sm font-normal text-zinc-700 dark:text-zinc-300">
              Формат шаблона .docx для автозаполнения
            </p>

            <div className="flex items-center gap-1.5 bg-zinc-100/80 dark:bg-zinc-950/40 p-1 rounded-full border border-zinc-200/40 dark:border-zinc-800/40 w-fit">
              <button
                onClick={() => setActType('standard')}
                style={actType === 'standard' ? { background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' } : {}}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  actType === 'standard'
                    ? 'text-white shadow-xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 bg-transparent border border-transparent'
                }`}
              >
                Типовой
              </button>
              <button
                onClick={() => setActType('custom')}
                style={actType === 'custom' ? { background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' } : {}}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  actType === 'custom'
                    ? 'text-white shadow-xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 bg-transparent border border-transparent'
                }`}
              >
                Свой
              </button>
            </div>

            {actType === 'standard' ? (
              <div className="space-y-3 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/40">
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-200 leading-relaxed font-normal">
                  Стандартный одностраничный акт сдачи-приемки оказанных услуг. Подтверждает выполнение всех обязательств по проекту.
                </p>
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-xs text-zinc-600 dark:text-zinc-300 font-normal">Готов к генерации</span>
                  <button 
                    onClick={() => showToast('Образец загружен', 'Типовой акт отправлен на скачивание.', 'success')}
                    className="relative group px-3.5 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-all duration-300 hover:opacity-85 active:scale-[0.98] cursor-pointer bg-transparent"
                  >
                    <span
                      className="absolute inset-0 rounded-full pointer-events-none p-[1px]"
                      style={{
                        background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)',
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                      }}
                    />
                    <Download className="w-3.5 h-3.5 text-[#8C52D0] dark:text-[#985DE0] relative z-10 shrink-0" />
                    <span
                      className="bg-clip-text text-transparent relative z-10"
                      style={{ backgroundImage: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
                    >
                      Скачать образец
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/40">
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

          {/* Card 3: Consent Template */}
          <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] p-5 sm:p-6 border border-zinc-200/50 dark:border-zinc-800/40 space-y-3.5 shadow-xs w-full">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[var(--lavenderSoft)] rounded-xl text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 truncate">Согласие на обработку ПД</h4>
            </div>

            <p className="text-xs sm:text-sm font-normal text-zinc-700 dark:text-zinc-300">
              Формат шаблона .docx для автозаполнения
            </p>

            <div className="flex items-center gap-1.5 bg-zinc-100/80 dark:bg-zinc-950/40 p-1 rounded-full border border-zinc-200/40 dark:border-zinc-800/40 w-fit">
              <button
                onClick={() => setConsentType('standard')}
                style={consentType === 'standard' ? { background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' } : {}}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  consentType === 'standard'
                    ? 'text-white shadow-xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 bg-transparent border border-transparent'
                }`}
              >
                Типовой
              </button>
              <button
                onClick={() => setConsentType('custom')}
                style={consentType === 'custom' ? { background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' } : {}}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  consentType === 'custom'
                    ? 'text-white shadow-xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 bg-transparent border border-transparent'
                }`}
              >
                Свой
              </button>
            </div>

            {consentType === 'standard' ? (
              <div className="space-y-3 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/40">
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-200 leading-relaxed font-normal">
                  Официальное согласие клиента на хранение и обработку персональных данных (152-ФЗ) и разрешение на фотосъемку объектов декора.
                </p>
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-xs text-zinc-600 dark:text-zinc-300 font-normal">Готов к генерации</span>
                  <button 
                    onClick={() => showToast('Образец загружен', 'Типовое согласие на обработку ПД отправлено на скачивание.', 'success')}
                    className="relative group px-3.5 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-all duration-300 hover:opacity-85 active:scale-[0.98] cursor-pointer bg-transparent"
                  >
                    <span
                      className="absolute inset-0 rounded-full pointer-events-none p-[1px]"
                      style={{
                        background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)',
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                      }}
                    />
                    <Download className="w-3.5 h-3.5 text-[#8C52D0] dark:text-[#985DE0] relative z-10 shrink-0" />
                    <span
                      className="bg-clip-text text-transparent relative z-10"
                      style={{ backgroundImage: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
                    >
                      Скачать образец
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/40">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Активный файл:</span>
                  <span className="inline-flex items-center gap-1 font-medium text-[var(--metricGreenText)] dark:text-[var(--sage)] text-xs uppercase tracking-wide bg-[var(--sageSoft)] px-2 rounded-full">
                    ✓ загружен
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200/50 dark:border-zinc-800/40 text-xs font-mono text-zinc-600 dark:text-zinc-300 truncate">
                  {customConsentFile}
                </div>
                <label className="border border-dashed border-zinc-200 dark:border-zinc-800 hover:border-[var(--lavenderAccent)]/60 hover:bg-[var(--lavenderSoft)]/10 rounded-2xl p-4 text-center flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer">
                  <Upload className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Загрузить новое согласие (.docx)</span>
                  <input type="file" accept=".docx" className="hidden" onChange={(e) => handleFileUpload('consent', e)} />
                </label>
              </div>
            )}
          </div>

          {/* Card 4: Deposit Agreement Template */}
          <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] p-5 sm:p-6 border border-zinc-200/50 dark:border-zinc-800/40 space-y-3.5 shadow-xs w-full">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[var(--lavenderSoft)] rounded-xl text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] shrink-0">
                <Receipt className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 truncate">Соглашение о задатке</h4>
            </div>

            <p className="text-xs sm:text-sm font-normal text-zinc-700 dark:text-zinc-300">
              Формат шаблона .docx для автозаполнения
            </p>

            <div className="flex items-center gap-1.5 bg-zinc-100/80 dark:bg-zinc-950/40 p-1 rounded-full border border-zinc-200/40 dark:border-zinc-800/40 w-fit">
              <button
                onClick={() => setDepositType('standard')}
                style={depositType === 'standard' ? { background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' } : {}}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  depositType === 'standard'
                    ? 'text-white shadow-xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 bg-transparent border border-transparent'
                }`}
              >
                Типовой
              </button>
              <button
                onClick={() => setDepositType('custom')}
                style={depositType === 'custom' ? { background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' } : {}}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  depositType === 'custom'
                    ? 'text-white shadow-xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 bg-transparent border border-transparent'
                }`}
              >
                Свой
              </button>
            </div>

            {depositType === 'standard' ? (
              <div className="space-y-3 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/40">
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-200 leading-relaxed font-normal">
                  Юридическое соглашение о внесении задатка для гарантийного бронирования даты мероприятия и обеспечения обязательств сторон.
                </p>
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-xs text-zinc-600 dark:text-zinc-300 font-normal">Готов к генерации</span>
                  <button 
                    onClick={() => showToast('Образец загружен', 'Типовое соглашение о задатке отправлено на скачивание.', 'success')}
                    className="relative group px-3.5 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-all duration-300 hover:opacity-85 active:scale-[0.98] cursor-pointer bg-transparent"
                  >
                    <span
                      className="absolute inset-0 rounded-full pointer-events-none p-[1px]"
                      style={{
                        background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)',
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                      }}
                    />
                    <Download className="w-3.5 h-3.5 text-[#8C52D0] dark:text-[#985DE0] relative z-10 shrink-0" />
                    <span
                      className="bg-clip-text text-transparent relative z-10"
                      style={{ backgroundImage: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
                    >
                      Скачать образец
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/40">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Активный файл:</span>
                  <span className="inline-flex items-center gap-1 font-medium text-[var(--metricGreenText)] dark:text-[var(--sage)] text-xs uppercase tracking-wide bg-[var(--sageSoft)] px-2 rounded-full">
                    ✓ загружен
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200/50 dark:border-zinc-800/40 text-xs font-mono text-zinc-600 dark:text-zinc-300 truncate">
                  {customDepositFile}
                </div>
                <label className="border border-dashed border-zinc-200 dark:border-zinc-800 hover:border-[var(--lavenderAccent)]/60 hover:bg-[var(--lavenderSoft)]/10 rounded-2xl p-4 text-center flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer">
                  <Upload className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Загрузить новое соглашение (.docx)</span>
                  <input type="file" accept=".docx" className="hidden" onChange={(e) => handleFileUpload('deposit', e)} />
                </label>
              </div>
            )}
          </div>

          {/* Card 3: Auto-completion Card */}
          <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[24px] p-4.5 border border-zinc-200/50 dark:border-zinc-800/40 space-y-3.5 shadow-xs w-full">
            <div className="space-y-1">
              <span className="font-semibold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 tracking-tight block">Переменная автозаполнения</span>
              <p className="text-xs sm:text-sm font-normal text-zinc-700 dark:text-zinc-300 leading-relaxed">
                Вставьте эту метку в ваш шаблон для автоматической подстановки данных.
              </p>
            </div>

            {/* Tag Copy Block */}
            <div 
              onClick={() => handleCopyTag('{{Реквизиты заказчика}}')}
              className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 hover:border-[#8C52D0]/50 hover:bg-[#8C52D0]/5 transition-all cursor-pointer group"
            >
              <div className="space-y-1 min-w-0">
                <code className="text-xs font-mono font-semibold text-[#8C52D0] dark:text-[#985DE0] bg-[#8C52D0]/10 dark:bg-[#8C52D0]/20 px-2 py-1 rounded-md inline-block truncate">
                  {"{{Реквизиты заказчика}}"}
                </code>
                <p className="text-xs font-normal text-zinc-600 dark:text-zinc-300">
                  Кликните, чтобы скопировать
                </p>
              </div>
              <span className="text-zinc-500 group-hover:text-[#8C52D0] transition-colors shrink-0 ml-2">
                {copiedTag === '{{Реквизиты заказчика}}' ? (
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4 opacity-60 group-hover:opacity-100" />
                )}
              </span>
            </div>

            {/* How it works guidance */}
            <div className="p-3.5 bg-emerald-500/10 dark:bg-emerald-950/30 rounded-2xl border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200 font-normal leading-relaxed">
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
