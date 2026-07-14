import React, { useState } from 'react';
import { Shield, Sparkles, Building, Phone, Globe, Lock, Mail, CheckCircle } from 'lucide-react';

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

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Профиль сохранен', 'Все настройки бренда и контакты успешно обновлены.', 'success');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Settings form */}
      <div className="lg:col-span-8">
        <form onSubmit={handleSaveProfile} className="glass-panel rounded-3xl p-6 space-y-5 border border-zinc-100 dark:border-zinc-800">
          <div className="pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-50">Параметры бренда</h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">Информация используется при экспорте смет, КП и генерации клиентских ссылок.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Название бренда</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  required
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-violet-500 text-xs font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Слоган студии</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-violet-500 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Email студии</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-violet-500 text-xs font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Контактный телефон</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-violet-500 text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Сайт компании</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-violet-500 text-xs font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Адрес студии / Склада</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-violet-500 text-xs font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold transition-all shadow-md shadow-violet-600/10 text-xs uppercase tracking-wider"
          >
            Сохранить настройки
          </button>
        </form>
      </div>

      {/* Subscription details card */}
      <div className="lg:col-span-4 space-y-5">
        <div className="glass-panel rounded-3xl p-5 space-y-4 border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Уровень подписки</span>
            <span className="text-[9.5px] font-semibold bg-violet-600 text-white px-2.5 py-0.5 rounded-full tracking-wide">PRO</span>
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
        <div className="glass-panel rounded-3xl p-5 border border-zinc-100 dark:border-zinc-800 flex items-start gap-3.5">
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
