import React, { useState } from 'react';
import { Shield, Sparkles, Building, Phone, Globe, Lock, Mail, CheckCircle, Upload, Trash2 } from 'lucide-react';

interface ProfileTabProps {
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warn') => void;
}

export default function ProfileTab({ showToast }: ProfileTabProps) {
  const [studioName, setStudioName] = useState('Студия «Флёр»');
  const [tagline, setTagline] = useState('премиальный декор и концептуальная флористика');
  const [email, setEmail] = useState('denis@fleur-decor.ru');
  const [phone, setPhone] = useState('+7 (999) 456-78-90');
  const [website, setWebsite] = useState('www.fleur-decor.ru');
  const [location, setLocation] = useState('Москва, Пресненская наб. 12');
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
        localStorage.setItem('fleur_studio_logo', base64String);
        window.dispatchEvent(new Event('storage'));
        showToast('Логотип загружен', 'Логотип бренда успешно обновлен.', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl(null);
    localStorage.removeItem('fleur_studio_logo');
    window.dispatchEvent(new Event('storage'));
    showToast('Логотип удален', 'Установлен стандартный логотип.', 'info');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Профиль сохранен', 'Все настройки бренда и контакты успешно обновлены.', 'success');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Settings form */}
      <div className="lg:col-span-8">
        <form onSubmit={handleSaveProfile} className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[32px] p-6 space-y-5 border border-zinc-200/50 dark:border-zinc-800/40 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center gap-5 pb-5 border-b border-zinc-100 dark:border-zinc-800/60">
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-center overflow-hidden transition-all group-hover:border-[var(--lavenderAccent)] relative shadow-sm">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-zinc-400 p-2 text-center">
                    <Building className="w-7 h-7 mb-1 text-zinc-300 dark:text-zinc-600" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Логотип</span>
                  </div>
                )}
                
                {/* Overlay controls */}
                <div className="absolute inset-0 bg-black/45 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                  <label className="p-1.5 bg-white/90 dark:bg-zinc-950/90 rounded-full text-zinc-700 dark:text-zinc-200 hover:text-[var(--lavDeep)] dark:hover:text-[var(--lavenderAccent)] cursor-pointer shadow-sm transition-colors">
                    <Upload className="w-3.5 h-3.5" />
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
                      className="p-1.5 bg-white/90 dark:bg-zinc-950/90 rounded-full text-rose-500 hover:text-rose-600 cursor-pointer shadow-sm transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="text-center sm:text-left space-y-1.5 flex-1">
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-50">Параметры бренда</h3>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                Загрузите логотип вашей студии. Он будет отображаться в шапке экспортируемых смет, договоров, актов, а также в интерактивном гостевом мудборде.
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <label className="px-3.5 py-1.5 bg-[var(--lavSoft)] hover:opacity-90 border border-[var(--lavenderAccent)] text-[var(--lavDeep)] dark:text-violet-300 rounded-full text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  <span>Выбрать логотип</span>
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
                    className="px-3.5 py-1.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 rounded-full text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Удалить</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-normal text-[#6B6B6B] dark:text-[#6B6B6B]/90 uppercase tracking-wider block">Название бренда</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  required
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[var(--lavenderAccent)] text-[14px] font-medium placeholder:text-[14px] placeholder:font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-normal text-[#6B6B6B] dark:text-[#6B6B6B]/90 uppercase tracking-wider block">Слоган студии</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[var(--lavenderAccent)] text-[14px] font-medium placeholder:text-[14px] placeholder:font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-normal text-[#6B6B6B] dark:text-[#6B6B6B]/90 uppercase tracking-wider block">Email студии</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[var(--lavenderAccent)] text-[14px] font-medium placeholder:text-[14px] placeholder:font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-normal text-[#6B6B6B] dark:text-[#6B6B6B]/90 uppercase tracking-wider block">Контактный телефон</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[var(--lavenderAccent)] text-[14px] font-medium placeholder:text-[14px] placeholder:font-medium"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-normal text-[#6B6B6B] dark:text-[#6B6B6B]/90 uppercase tracking-wider block">Сайт компании</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[var(--lavenderAccent)] text-[14px] font-medium placeholder:text-[14px] placeholder:font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-normal text-[#6B6B6B] dark:text-[#6B6B6B]/90 uppercase tracking-wider block">Адрес студии / Склада</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[var(--lavenderAccent)] text-[14px] font-medium placeholder:text-[14px] placeholder:font-medium"
              />
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              className="px-8 py-2.5 rounded-full bg-[var(--lavDeep)] hover:opacity-90 text-white font-medium transition-all shadow-md shadow-[var(--lavDeep)]/10 text-xs tracking-wide cursor-pointer"
            >
              Сохранить настройки
            </button>
          </div>
        </form>
      </div>

      {/* Subscription details card */}
      <div className="lg:col-span-4 space-y-5">
        <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[32px] p-5 space-y-4 border border-zinc-200/50 dark:border-zinc-800/40 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Уровень подписки</span>
            <span className="text-[9.5px] font-semibold bg-[var(--lavDeep)] text-white px-2.5 py-0.5 rounded-full tracking-wide">PRO</span>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-50">Бизнес-Тариф «Флёр»</h4>
            <p className="text-[11px] text-zinc-400">Продлен автоматически до 03 авг 2026. Месячный лимит обновлен.</p>
          </div>

          <div className="space-y-3 pt-1 text-xs text-zinc-600 dark:text-zinc-300">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Безлимитный конструктор арок</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Удаление фона (до 20 фото/мес)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Генерация PDF договоров и смет</span>
            </div>
          </div>
        </div>

        {/* Security / Auth info */}
        <div className="bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md rounded-[32px] p-5 border border-zinc-200/50 dark:border-zinc-800/40 shadow-xs flex items-start gap-3.5">
          <Lock className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-50">Учетные данные защищены</h4>
            <p className="text-[11px] text-zinc-400 leading-normal">
              Все клиентские брифы и сметы хранятся в зашифрованной локальной базе данных.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
