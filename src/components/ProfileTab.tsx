import React, { useState } from 'react';
import { Sparkles, Building, Phone, Globe, Lock, Mail, CheckCircle, Upload, Trash2 } from 'lucide-react';

interface ProfileTabProps {
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warn') => void;
}

export default function ProfileTab({ showToast }: ProfileTabProps) {
  const [studioName, setStudioName] = useState(() => localStorage.getItem('fleur_studio_name') || 'Студия «IQ Deko»');
  const [ownerName, setOwnerName] = useState(() => localStorage.getItem('fleur_user_name') || 'Денис С.');
  const [tagline, setTagline] = useState(() => localStorage.getItem('fleur_studio_tagline') || 'премиальный декор и концептуальная флористика');
  const [email, setEmail] = useState(() => localStorage.getItem('fleur_user_email') || 'denis@fleur-decor.ru');
  const [phone, setPhone] = useState(() => localStorage.getItem('fleur_studio_phone') || '+7 (999) 456-78-90');
  const [website, setWebsite] = useState(() => localStorage.getItem('fleur_studio_website') || 'www.iq-deko.ru');
  const [location, setLocation] = useState(() => localStorage.getItem('fleur_studio_location') || 'Москва, Пресненская наб. 12');
  const [logoUrl, setLogoUrl] = useState<string | null>(() => {
    return localStorage.getItem('fleur_studio_logo') || null;
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Файл слишком большой', 'Максимальный размер логотипа — 2 МБ.', 'warn');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogoUrl(base64String);
        try {
          localStorage.setItem('fleur_studio_logo', base64String);
        } catch (e) {
          console.warn('Failed to save logo:', e);
        }
        window.dispatchEvent(new Event('storage'));
        showToast('Логотип загружен', 'Аватар / логотип бренда успешно обновлен.', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl(null);
    localStorage.removeItem('fleur_studio_logo');
    window.dispatchEvent(new Event('storage'));
    showToast('Логотип удален', 'Установлены стандартные инициалы.', 'info');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('fleur_studio_name', studioName);
      localStorage.setItem('fleur_user_name', ownerName);
      localStorage.setItem('fleur_user_email', email);
      localStorage.setItem('fleur_studio_tagline', tagline);
      localStorage.setItem('fleur_studio_phone', phone);
      localStorage.setItem('fleur_studio_website', website);
      localStorage.setItem('fleur_studio_location', location);
    } catch (e) {
      console.warn('Failed to save profile fields:', e);
    }
    window.dispatchEvent(new Event('storage'));
    showToast('Профиль сохранен', 'Все настройки бренда и контакты успешно обновлены.', 'success');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Settings form */}
      <div className="lg:col-span-8">
        <form onSubmit={handleSaveProfile} className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 space-y-5 border border-zinc-200/50 dark:border-zinc-800/40 shadow-xs">
          {/* Card Header with Icon */}
          <div className="flex items-start gap-3 pb-5 border-b border-zinc-200/50 dark:border-zinc-800/50">
            <div className="p-2 bg-[var(--lavenderSoft)] rounded-xl text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <h3 className="font-semibold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 tracking-tight">
                Параметры бренда
              </h3>
              <p className="text-xs sm:text-sm font-normal text-zinc-700 dark:text-zinc-300 leading-relaxed">
                Загрузите логотип вашей студии. Он будет отображаться в шапке экспортируемых смет, договоров, актов, а также в интерактивном гостевом мудборде.
              </p>
            </div>
          </div>

          {/* Logo Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-2">
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-center overflow-hidden transition-all group-hover:border-[#8C52D0]/60 relative shadow-xs">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-zinc-400 p-2 text-center">
                    <Building className="w-7 h-7 mb-1 text-zinc-300 dark:text-zinc-600" />
                    <span className="text-[10px] font-normal uppercase tracking-normal text-zinc-500">Логотип</span>
                  </div>
                )}
                
                {/* Overlay controls */}
                <div className="absolute inset-0 bg-black/45 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <label className="p-2 bg-white/90 dark:bg-zinc-950/90 rounded-full text-zinc-700 dark:text-zinc-200 hover:text-[#8C52D0] dark:hover:text-[#985DE0] cursor-pointer shadow-xs transition-colors">
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                  </label>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="p-2 bg-white/90 dark:bg-zinc-950/90 rounded-full text-rose-500 hover:text-rose-600 cursor-pointer shadow-xs transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="text-center sm:text-left space-y-2 flex-1">
              <span className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal block">
                Фирменный логотип
              </span>
              <p className="text-xs font-normal text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Рекомендуемый формат PNG или JPG, максимальный размер до 2 МБ.
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <label className="relative group px-3.5 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-all duration-300 hover:opacity-85 active:scale-[0.98] cursor-pointer bg-transparent">
                  <span
                    className="absolute inset-0 rounded-full pointer-events-none p-[1px]"
                    style={{
                      background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)',
                      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      WebkitMaskComposite: 'xor',
                      maskComposite: 'exclude',
                    }}
                  />
                  <Upload className="w-3.5 h-3.5 text-[#8C52D0] dark:text-[#985DE0] relative z-10 shrink-0" />
                  <span
                    className="bg-clip-text text-transparent relative z-10"
                    style={{ backgroundImage: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
                  >
                    Выбрать логотип
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                </label>

                {logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-all duration-300 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100/80 dark:hover:bg-rose-900/40 active:scale-[0.98] cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Удалить логотип</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal block">
                Название бренда
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  required
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-950/30 border border-zinc-200/80 dark:border-zinc-800/80 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#8C52D0] text-sm font-normal placeholder:text-zinc-400 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal block">
                Имя декоратора / руководителя
              </label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-950/30 border border-zinc-200/80 dark:border-zinc-800/80 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#8C52D0] text-sm font-normal placeholder:text-zinc-400 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal block">
                Слоган студии
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-950/30 border border-zinc-200/80 dark:border-zinc-800/80 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#8C52D0] text-sm font-normal placeholder:text-zinc-400 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal block">
                Email руководителя / студии
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-950/30 border border-zinc-200/80 dark:border-zinc-800/80 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#8C52D0] text-sm font-normal placeholder:text-zinc-400 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal block">
                Контактный телефон
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-950/30 border border-zinc-200/80 dark:border-zinc-800/80 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#8C52D0] text-sm font-normal placeholder:text-zinc-400 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal block">
                Сайт компании
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-950/30 border border-zinc-200/80 dark:border-zinc-800/80 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#8C52D0] text-sm font-normal placeholder:text-zinc-400 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal block">
              Адрес студии / Склада
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-950/30 border border-zinc-200/80 dark:border-zinc-800/80 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#8C52D0] text-sm font-normal placeholder:text-zinc-400 transition-colors"
            />
          </div>

          <div className="flex justify-center pt-3">
            <button
              type="submit"
              style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
              className="px-6 py-2.5 rounded-full text-white font-semibold text-xs sm:text-sm shadow-sm transition-all duration-300 hover:shadow-md hover:opacity-90 active:scale-[0.98] cursor-pointer"
            >
              Сохранить настройки
            </button>
          </div>
        </form>
      </div>

      {/* Right Column Cards */}
      <div className="lg:col-span-4 space-y-6">
        {/* Subscription details card */}
        <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 space-y-4 border border-zinc-200/50 dark:border-zinc-800/40 shadow-xs w-full">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-zinc-200/50 dark:border-zinc-800/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[var(--lavenderSoft)] rounded-xl text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-normal text-zinc-600 dark:text-zinc-400 uppercase tracking-normal">
                Уровень подписки
              </span>
            </div>
            <span
              style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
              className="text-[10px] font-semibold text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0"
            >
              PRO
            </span>
          </div>

          <div className="space-y-1">
            <h4 className="font-semibold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 tracking-tight">
              Бизнес-Тариф «Флёр»
            </h4>
            <p className="text-xs sm:text-sm font-normal text-zinc-700 dark:text-zinc-300 leading-relaxed">
              Продлен автоматически до 03 авг 2026. Месячный лимит обновлен.
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-xs sm:text-sm font-normal text-zinc-700 dark:text-zinc-300 leading-relaxed">
                Безлимитный конструктор арок
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-xs sm:text-sm font-normal text-zinc-700 dark:text-zinc-300 leading-relaxed">
                Удаление фона (до 20 фото/мес)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-xs sm:text-sm font-normal text-zinc-700 dark:text-zinc-300 leading-relaxed">
                Генерация PDF договоров и смет
              </span>
            </div>
          </div>
        </div>

        {/* Security / Auth info */}
        <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 border border-zinc-200/50 dark:border-zinc-800/40 space-y-3.5 shadow-xs w-full">
          <div className="flex items-start gap-2.5">
            <div className="p-2 bg-[var(--lavenderSoft)] rounded-xl text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)] shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <h4 className="font-semibold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 tracking-tight">
                Учетные данные защищены
              </h4>
              <p className="text-xs sm:text-sm font-normal text-zinc-700 dark:text-zinc-300 leading-relaxed">
                Все клиентские брифы и сметы хранятся в зашифрованной локальной базе данных.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-500/10 dark:bg-emerald-950/30 rounded-2xl border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200 font-normal leading-relaxed">
            <p>
              Локальное хранилище гарантирует полную конфиденциальность ваших коммерческих данных.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
