const fs = require('fs');

let content = fs.readFileSync('/workspace/src/App.tsx', 'utf8');

const oldTabletBadgeAndButton = `                                  <span className={\`absolute top-1.5 left-1.5 text-xs font-medium px-2 py-0.5 rounded \${
                                    p.status === 'progress' ? 'bg-[var(--warnSoft)] text-[var(--warn)]' :
                                    p.status === 'waiting' ? 'bg-[var(--warnSoft)] text-[var(--warn)]' :
                                    p.status === 'approved' ? 'bg-[var(--sageSoft)] text-[var(--sage)]' :
                                    'bg-zinc-100/80 text-zinc-500 dark:bg-zinc-800/80 dark:text-zinc-400'
                                  }\`}>
                                    {p.status === 'progress' ? 'В работе' :
                                     p.status === 'waiting' ? 'Бриф' :
                                     p.status === 'approved' ? 'Согласован' : 'Архив'}
                                  </span>

                                  <button
                                    onClick={() => setSelectedProject(p)}
                                    className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/75 dark:bg-black/35 backdrop-blur flex items-center justify-center text-[var(--ink)] hover:text-[var(--lavenderAccent)] transition-colors z-10"
                                    title="Быстрый просмотр"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>`;

const newTabletBadgeAndButton = `                                  <span className={\`absolute top-1.5 left-1.5 text-xs font-medium px-2 py-0.5 rounded \${
                                    p.status === 'progress' ? 'bg-[var(--warnSoft)] text-[var(--warn)]' :
                                    p.status === 'waiting' ? 'bg-[var(--warnSoft)] text-[var(--warn)]' :
                                    p.status === 'approved' ? 'bg-[var(--sageSoft)] text-[var(--sage)]' :
                                    p.status === 'trash' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' :
                                    'bg-zinc-100/80 text-zinc-500 dark:bg-zinc-800/80 dark:text-zinc-400'
                                  }\`}>
                                    {p.status === 'progress' ? 'В работе' :
                                     p.status === 'waiting' ? 'Бриф' :
                                     p.status === 'approved' ? 'Согласован' :
                                     p.status === 'trash' ? 'Корзина' : 'Архив'}
                                  </span>

                                  <button
                                    onClick={() => handleTrashClick(p)}
                                    className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/75 dark:bg-black/35 backdrop-blur flex items-center justify-center text-[var(--ink)] hover:text-red-500 transition-colors z-10"
                                    title={p.status === 'trash' ? "Удалить навсегда" : "Переместить в корзину"}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>`;

const oldTabletButtons = `                                  {/* Action buttons */}
                                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                                    <button
                                      onClick={() => {
                                        setSelectedProject(p);
                                        setActiveTab('projects');
                                      }}
                                      className="flex-1 sm:flex-initial bg-[var(--lavDeep)] hover:opacity-90 text-white rounded-xl px-4 py-2 text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
                                    >
                                      Открыть проект
                                    </button>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(\`https://fleur-decor.ru/brief/\${p.id}\`);
                                        showToast('Бриф скопирован', 'Отправьте ссылку клиенту для прохождения опроса.', 'success');
                                      }}
                                      className="p-2 rounded-xl bg-white/30 hover:bg-white/50 dark:bg-white/5 border border-[var(--glass-edge)] text-[var(--ink)] transition-all flex items-center justify-center cursor-pointer shrink-0"
                                      title="Копировать бриф"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                  </div>`;

const newTabletButtons = `                                  {/* Action buttons */}
                                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                                    {p.status === 'trash' ? (
                                      <>
                                        <button
                                          onClick={() => {
                                            setProjects(prev => prev.map(item => item.id === p.id ? { ...item, status: 'progress' as const } : item));
                                            showToast('Проект восстановлен', \`Проект «\${p.name}» возвращен в работу.\`, 'success');
                                          }}
                                          className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2 text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
                                        >
                                          Восстановить
                                        </button>
                                        <button
                                          onClick={() => {
                                            setProjects(prev => prev.filter(item => item.id !== p.id));
                                            showToast('Удалено навсегда', \`Проект «\${p.name}» удален окончательно.\`, 'warn');
                                          }}
                                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 transition-all flex items-center justify-center cursor-pointer shrink-0"
                                          title="Удалить навсегда"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() => {
                                            setSelectedProject(p);
                                            setActiveTab('projects');
                                          }}
                                          className="flex-1 sm:flex-initial bg-[var(--lavDeep)] hover:opacity-90 text-white rounded-xl px-4 py-2 text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
                                        >
                                          Открыть проект
                                        </button>
                                        <button
                                          onClick={() => {
                                            navigator.clipboard.writeText(\`https://fleur-decor.ru/brief/\${p.id}\`);
                                            showToast('Бриф скопирован', 'Отправьте ссылку клиенту для прохождения опроса.', 'success');
                                          }}
                                          className="p-2 rounded-xl bg-white/30 hover:bg-white/50 dark:bg-white/5 border border-[var(--glass-edge)] text-[var(--ink)] transition-all flex items-center justify-center cursor-pointer shrink-0"
                                          title="Копировать бриф"
                                        >
                                          <Copy className="w-3.5 h-3.5" />
                                        </button>
                                      </>
                                    )}
                                  </div>`;

const oldDesktopBadgeAndButton = `                                  {/* Status Badge */}
                                  <span className={\`absolute top-3.5 left-3.5 text-[11px] font-bold px-3 py-1 rounded-full shadow-sm \${
                                    p.status === 'approved'
                                      ? 'bg-[#E8F8F2] text-[#0A7B5C]'
                                      : p.status === 'progress' || p.status === 'waiting'
                                      ? 'bg-[#FEF3C7] text-[#D97706]'
                                      : 'bg-zinc-100/90 text-zinc-500 dark:bg-zinc-800/90 dark:text-zinc-400'
                                  }\`}>
                                    {p.status === 'approved' ? 'Согласован' :
                                     p.status === 'progress' ? 'В работе' :
                                     p.status === 'waiting' ? 'Бриф' : 'Архив'}
                                  </span>

                                  <button
                                    onClick={() => setSelectedProject(p)}
                                    className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/75 dark:bg-black/35 backdrop-blur flex items-center justify-center text-[var(--ink)] hover:text-[var(--lavenderAccent)] transition-colors z-10"
                                    title="Быстрый просмотр"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>`;

const newDesktopBadgeAndButton = `                                  {/* Status Badge */}
                                  <span className={\`absolute top-3.5 left-3.5 text-[11px] font-bold px-3 py-1 rounded-full shadow-sm \${
                                    p.status === 'approved'
                                      ? 'bg-[#E8F8F2] text-[#0A7B5C]'
                                      : p.status === 'progress' || p.status === 'waiting'
                                      ? 'bg-[#FEF3C7] text-[#D97706]'
                                      : p.status === 'trash'
                                      ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 shadow-sm'
                                      : 'bg-zinc-100/90 text-zinc-500 dark:bg-zinc-800/90 dark:text-zinc-400'
                                  }\`}>
                                    {p.status === 'approved' ? 'Согласован' :
                                     p.status === 'progress' ? 'В работе' :
                                     p.status === 'waiting' ? 'Бриф' :
                                     p.status === 'trash' ? 'Корзина' : 'Архив'}
                                  </span>

                                  <button
                                    onClick={() => handleTrashClick(p)}
                                    className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/75 dark:bg-black/35 backdrop-blur flex items-center justify-center text-[var(--ink)] hover:text-red-500 transition-colors z-10"
                                    title={p.status === 'trash' ? "Удалить навсегда" : "Переместить в корзину"}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>`;

const oldDesktopButtons = `                                  {/* Row 3: Metadata chips on left, "Открыть проект" on right */}
                                  <div className="flex items-center justify-between gap-4 mt-1.5">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="text-[11px] text-zinc-600 dark:text-zinc-400 bg-[#F8F9FA] dark:bg-zinc-850 px-3 py-1.5 rounded-xl border border-zinc-100 dark:border-zinc-800/40 truncate">
                                        {new Date(p.date).toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' })}
                                      </span>
                                      <span className="text-[11px] text-zinc-600 dark:text-zinc-400 bg-[#F8F9FA] dark:bg-zinc-850 px-3 py-1.5 rounded-xl border border-zinc-100 dark:border-zinc-800/40 font-bold truncate">
                                        Бюджет: {displayPrice.toLocaleString('ru')} ₽
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => {
                                        setSelectedProject(p);
                                        setActiveTab('projects');
                                      }}
                                      className="bg-[#5D3E8D] hover:bg-[#4E3175] text-white rounded-full font-semibold text-[12px] py-2 px-5.5 shadow-sm transition-colors cursor-pointer shrink-0"
                                    >
                                      Открыть проект
                                    </button>
                                  </div>`;

const newDesktopButtons = `                                  {/* Row 3: Metadata chips on left, "Открыть проект" on right */}
                                  <div className="flex items-center justify-between gap-4 mt-1.5">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="text-[11px] text-zinc-600 dark:text-zinc-400 bg-[#F8F9FA] dark:bg-zinc-850 px-3 py-1.5 rounded-xl border border-zinc-100 dark:border-zinc-800/40 truncate">
                                        {new Date(p.date).toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' })}
                                      </span>
                                      <span className="text-[11px] text-zinc-600 dark:text-zinc-400 bg-[#F8F9FA] dark:bg-zinc-850 px-3 py-1.5 rounded-xl border border-zinc-100 dark:border-zinc-800/40 font-bold truncate">
                                        Бюджет: {displayPrice.toLocaleString('ru')} ₽
                                      </span>
                                    </div>
                                    {p.status === 'trash' ? (
                                      <div className="flex gap-2 shrink-0">
                                        <button
                                          onClick={() => {
                                            setProjects(prev => prev.map(item => item.id === p.id ? { ...item, status: 'progress' as const } : item));
                                            showToast('Проект восстановлен', \`Проект «\${p.name}» возвращен в работу.\`, 'success');
                                          }}
                                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold text-[12px] py-2 px-5.5 shadow-sm transition-colors cursor-pointer"
                                        >
                                          Восстановить
                                        </button>
                                        <button
                                          onClick={() => {
                                            setProjects(prev => prev.filter(item => item.id !== p.id));
                                            showToast('Удалено навсегда', \`Проект «\${p.name}» удален окончательно.\`, 'warn');
                                          }}
                                          className="bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold text-[12px] py-2 px-3 shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                                        >
                                          <Trash2 className="w-4 h-4" /> Удалить
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          setSelectedProject(p);
                                          setActiveTab('projects');
                                        }}
                                        className="bg-[#5D3E8D] hover:bg-[#4E3175] text-white rounded-full font-semibold text-[12px] py-2 px-5.5 shadow-sm transition-colors cursor-pointer shrink-0"
                                      >
                                        Открыть проект
                                      </button>
                                    )}
                                  </div>`;

if (!content.includes(oldTabletBadgeAndButton)) {
  console.error("Could not find oldTabletBadgeAndButton in App.tsx!");
} else {
  content = content.replace(oldTabletBadgeAndButton, newTabletBadgeAndButton);
  console.log("Successfully replaced oldTabletBadgeAndButton!");
}

if (!content.includes(oldTabletButtons)) {
  console.error("Could not find oldTabletButtons in App.tsx!");
} else {
  content = content.replace(oldTabletButtons, newTabletButtons);
  console.log("Successfully replaced oldTabletButtons!");
}

if (!content.includes(oldDesktopBadgeAndButton)) {
  console.error("Could not find oldDesktopBadgeAndButton in App.tsx!");
} else {
  content = content.replace(oldDesktopBadgeAndButton, newDesktopBadgeAndButton);
  console.log("Successfully replaced oldDesktopBadgeAndButton!");
}

if (!content.includes(oldDesktopButtons)) {
  console.error("Could not find oldDesktopButtons in App.tsx!");
} else {
  content = content.replace(oldDesktopButtons, newDesktopButtons);
  console.log("Successfully replaced oldDesktopButtons!");
}

fs.writeFileSync('/workspace/src/App.tsx', content, 'utf8');
console.log("App.tsx has been updated successfully.");
