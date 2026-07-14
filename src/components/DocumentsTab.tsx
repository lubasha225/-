import { useState } from 'react';
import { FileText, Download, CheckCircle, Search, Clock, FileSpreadsheet, FilePlus, Sparkles } from 'lucide-react';
import { DocumentItem } from '../types';

interface DocumentsTabProps {
  documents: DocumentItem[];
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warn') => void;
}

export default function DocumentsTab({ documents, showToast }: DocumentsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);

  const handleDownload = (docId: string, docName: string) => {
    setDownloadingDocId(docId);
    setTimeout(() => {
      setDownloadingDocId(null);
      showToast('Документ сгенерирован', `Файл "${docName}" успешно скомпилирован в PDF и скачан.`, 'success');
    }, 1500);
  };

  const filteredDocs = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.projectRelation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search and generate doc */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Поиск документов по названию..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white/40 dark:bg-zinc-800/30 border border-zinc-200/50 dark:border-zinc-800/40 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-violet-500"
          />
        </div>

        <button
          onClick={() => showToast('Новый документ', 'Автоматическая генерация договоров по брифу будет доступна в PRO.', 'info')}
          className="bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5 transition-all w-full sm:w-auto justify-center shadow-sm"
        >
          <FilePlus className="w-4 h-4" />
          Сгенерировать договор с ИИ
        </button>
      </div>

      {/* Docs checklist table */}
      <div className="border border-zinc-100 dark:border-zinc-800/80 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-950/40 text-zinc-400 font-semibold border-b border-zinc-100 dark:border-zinc-800">
                <th className="p-4 pl-5">Название документа</th>
                <th className="p-4">Связанный проект</th>
                <th className="p-4">Дата создания</th>
                <th className="p-4">Статус</th>
                <th className="p-4 text-right">Сумма договора</th>
                <th className="p-4 text-center">Скачать</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-400">Документы не найдены.</td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const isDownloading = downloadingDocId === doc.id;
                  return (
                    <tr key={doc.id} className="border-b border-zinc-100 dark:border-zinc-800/40 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10 transition-colors">
                      <td className="p-4 pl-5">
                        <div className="flex items-center gap-2.5">
                          {doc.type === 'estimate' ? (
                            <FileSpreadsheet className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                          ) : (
                            <FileText className="w-4.5 h-4.5 text-violet-500 shrink-0" />
                          )}
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200 leading-snug">{doc.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-zinc-500 font-medium">{doc.projectRelation}</td>
                      <td className="p-4 text-zinc-400">{new Date(doc.date).toLocaleDateString('ru')}</td>
                      <td className="p-4">
                        {doc.status === 'signed' ? (
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">
                            ✓ Подписан
                          </span>
                        ) : doc.status === 'paid' ? (
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-sky-600 bg-sky-50 dark:bg-sky-950/20 px-2 py-0.5 rounded-full">
                            ● Оплачен
                          </span>
                        ) : doc.status === 'sent' ? (
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" /> На согласовании
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                            Черновик
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right font-bold text-zinc-800 dark:text-zinc-200">
                        {doc.amount > 0 ? `${doc.amount.toLocaleString('ru')} ₽` : '—'}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          disabled={isDownloading}
                          onClick={() => handleDownload(doc.id, doc.name)}
                          className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-violet-100 dark:hover:bg-violet-950/40 text-zinc-500 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 flex items-center justify-center transition-colors mx-auto"
                        >
                          {isDownloading ? (
                            <div className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-violet-500 rounded-full animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
