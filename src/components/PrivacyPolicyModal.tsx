import React from 'react';
import { X, ShieldCheck, FileText, Lock, Check } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-[28px] sm:rounded-[32px] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="p-5 sm:p-6 border-b border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[var(--lavenderSoft)] rounded-xl shrink-0">
              <ShieldCheck className="w-5 h-5 text-[var(--lavDeep)] dark:text-[var(--lavenderAccent)]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Политика конфиденциальности
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-normal">
                Согласие на обработку персональных данных (ФЗ № 152-ФЗ)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
          <div className="p-3.5 bg-emerald-500/10 dark:bg-emerald-950/30 rounded-2xl border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200 font-normal leading-relaxed flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              Настоящий документ регламентирует порядок сбора, хранения и обработки персональных данных клиентов студии декора при заполнении интерактивной анкеты (брифа).
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8C52D0]" />
              1. Общие положения и оператор данных
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 pl-4">
              При заполнении формы брифа на данном домене клиент (субъект персональных данных) передает информацию непосредственно оператору. Оператор обязуется обеспечивать конфиденциальность и безопасность полученных сведений в соответствии с Федеральным законом РФ № 152-ФЗ «О персональных данных».
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8C52D0]" />
              2. Цели обработки персональных данных
            </h3>
            <ul className="text-xs text-zinc-600 dark:text-zinc-400 pl-4 space-y-1 list-disc list-inside">
              <li>Подготовка индивидуального технического задания, концепции и сметы оформления;</li>
              <li>Связь с заказчиком для уточнения параметров площадки, даты и бюджета мероприятия;</li>
              <li>Оформление договорных документов и согласий на производство декорационных работ.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8C52D0]" />
              3. Состав обрабатываемых сведений
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 pl-4">
              К обрабатываемым данным относятся: ФИО/имя заказчика, контактный номер телефона, наименование и адрес площадки проведения, параметры и тайминг монтажа, индивидуальные пожелания по декору и бюджет.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8C52D0]" />
              4. Защита и передача данных
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 pl-4">
              Оператор принимает необходимые организационные и технические меры для защиты персональных данных от неправомерного доступа. Передача данных третьим лицам не осуществляется, за исключением случаев, прямо предусмотренных законодательством РФ.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8C52D0]" />
              5. Права субъекта персональных данных
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 pl-4">
              Субъект персональных данных имеет право отозвать согласие на обработку ПДн, направив письменное заявление оператору, а также требовать уточнения или удаления своих персональных данных.
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 sm:p-5 border-t border-zinc-200/60 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-end">
          <button
            onClick={onClose}
            style={{ background: 'linear-gradient(135deg, #8C52D0 0%, #582F89 100%)' }}
            className="px-6 py-2 rounded-full text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all hover:opacity-95 cursor-pointer shadow-sm"
          >
            <Check className="w-4 h-4 text-white" />
            <span>Понятно, закрыть</span>
          </button>
        </div>
      </div>
    </div>
  );
};
