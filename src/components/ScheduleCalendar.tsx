import React, { useMemo, useState } from 'react';
import {
  Calendar, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Clock, Columns3, Grid3X3,
  List, MoreVertical, Plus, Rows3, Sparkles, UserCheck, X
} from 'lucide-react';
import { findInitialScheduleDate, formatDateKey } from './scheduleUtils';

type ScheduleView = 'month' | '3day' | 'day' | 'list';
type ScheduleStatus = 'pending' | 'accepted' | 'completed' | 'memo';

type ScheduleTask = {
  id: string;
  date: string;
  time: string;
  title: string;
  note: string;
  status: ScheduleStatus;
  statusLabel: string;
  demo?: boolean;
};

const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

function buildScheduleData(today: Date): Record<string, ScheduleTask[]> {
  const todayKey = formatDateKey(today);
  const tomorrowKey = formatDateKey(addDays(today, 1));
  const dayAfterKey = formatDateKey(addDays(today, 2));
  const nextWeekKey = formatDateKey(addDays(today, 6));
  return {
    [todayKey]: [
      { id: 'calendar-demo-1', date: todayKey, time: '14:30 - 17:00', title: '华西医院 · 母亲心内科门诊陪诊', note: '家庭档案：母亲 · AI示范日程', status: 'pending', statusLabel: '待履约', demo: true },
      { id: 'calendar-demo-2', date: todayKey, time: '18:30 - 19:30', title: '上门喂猫与专业照料', note: '家庭档案：雪球 · AI示范日程', status: 'accepted', statusLabel: '已接单锁定', demo: true },
    ],
    [tomorrowKey]: [
      { id: 'calendar-demo-3', date: tomorrowKey, time: '09:00 - 11:30', title: '同仁医院眼科术前检查陪诊', note: '家庭档案：父亲 · 可由 AI 调整', status: 'pending', statusLabel: '待履约', demo: true },
    ],
    [dayAfterKey]: [
      { id: 'calendar-demo-4', date: dayAfterKey, time: '15:00 - 18:00', title: '奥森公园周末轮椅陪伴散步', note: '家庭档案：外婆 · 可由 AI 调整', status: 'pending', statusLabel: '待履约', demo: true },
    ],
    [nextWeekKey]: [
      { id: 'calendar-demo-5', date: nextWeekKey, time: '10:00', title: '全家健康档案周度整理', note: '家庭备忘 · AI示范日程', status: 'memo', statusLabel: '随手记', demo: true },
    ],
  };
}

const viewOptions = [
  { id: 'list' as const, label: '列表', icon: List },
  { id: 'month' as const, label: '月', icon: Grid3X3 },
  { id: '3day' as const, label: '3日', icon: Columns3 },
  { id: 'day' as const, label: '日', icon: Rows3 },
];

interface ScheduleCalendarProps {
  onClose: () => void;
  onOpenAgent?: (prompt: string) => void;
  onOpenProfile?: () => void;
}

export default function ScheduleCalendar({ onClose, onOpenAgent, onOpenProfile }: ScheduleCalendarProps) {
  const today = useMemo(() => new Date(), []);
  const scheduleData = useMemo(() => buildScheduleData(today), [today]);
  const initialDate = useMemo(() => findInitialScheduleDate(today, Object.keys(scheduleData)), [scheduleData, today]);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [cursorMonth, setCursorMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  const [view, setView] = useState<ScheduleView>('day');
  const [showMonthMenu, setShowMonthMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [aiDraft, setAiDraft] = useState('帮我安排一个陪妈妈去医院复查的档期');
  const [showDemoHint, setShowDemoHint] = useState(true);

  const todayKey = formatDateKey(today);
  const selectedKey = formatDateKey(selectedDate);
  const allTasks: ScheduleTask[] = Object.keys(scheduleData).flatMap(key => scheduleData[key]).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  const visibleDates = view === '3day' ? [selectedDate, addDays(selectedDate, 1), addDays(selectedDate, 2)] : [selectedDate];
  const monthDays = new Date(cursorMonth.getFullYear(), cursorMonth.getMonth() + 1, 0).getDate();
  const monthOffset = (new Date(cursorMonth.getFullYear(), cursorMonth.getMonth(), 1).getDay() + 6) % 7;
  const monthCells = Array.from({ length: Math.ceil((monthOffset + monthDays) / 7) * 7 }, (_, index) => {
    const day = index - monthOffset + 1;
    return day > 0 && day <= monthDays ? new Date(cursorMonth.getFullYear(), cursorMonth.getMonth(), day) : null;
  });

  const dateLabel = (date: Date) => `${date.getMonth() + 1}月${date.getDate()}日${formatDateKey(date) === todayKey ? ' · 今天' : ''}`;
  const tasksFor = (date: Date) => scheduleData[formatDateKey(date)] || [];
  const setDate = (date: Date) => {
    setSelectedDate(date);
    setCursorMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  };
  const moveDate = (amount: number) => setDate(addDays(selectedDate, amount));
  const goToday = () => {
    setDate(today);
    setView('day');
  };
  const submitAI = () => {
    const prompt = aiDraft.trim() || '请帮我新增一个档期任务';
    setShowQuickAdd(false);
    onOpenAgent?.(prompt);
  };

  return (
    <div className="schedule-modal-overlay" onClick={onClose}>
      <section className="schedule-modal-sheet schedule-calendar-workspace" onClick={event => event.stopPropagation()} aria-label="档案与档期日历">
        <div className="schedule-sheet-header">
          <div className="schedule-sheet-title">
            <Calendar className="schedule-title-icon" />
            <div><h3>档案与档期</h3><p>发单、接单与家庭安排统一管理</p></div>
          </div>
          <button type="button" className="schedule-close-btn" onClick={onClose} aria-label="关闭"><X /></button>
        </div>

        <div className="schedule-calendar-toolbar">
          <button type="button" className="schedule-month-select" onClick={() => setShowMonthMenu(value => !value)}>
            <span>{cursorMonth.getFullYear()}年 {cursorMonth.getMonth() + 1}月</span>{showMonthMenu ? <ChevronUp /> : <ChevronDown />}
          </button>
          <div className="schedule-toolbar-actions">
            <button type="button" className="schedule-today-btn" onClick={goToday}>今天</button>
            <button type="button" className="schedule-icon-btn schedule-add-btn" aria-label="快速新增日程" onClick={() => setShowQuickAdd(true)}><Plus /></button>
            <button type="button" className="schedule-icon-btn" aria-label="切换视图" onClick={() => setShowViewMenu(value => !value)}><MoreVertical /></button>
          </div>
        </div>

        {showMonthMenu && (
          <div className="schedule-dropdown-content">
            <button type="button" className="schedule-dropdown-item active" onClick={() => { setView('month'); setShowMonthMenu(false); }}><span>{cursorMonth.getFullYear()}年{cursorMonth.getMonth() + 1}月 · 月视图</span><span>查看</span></button>
            <button type="button" className="schedule-dropdown-item" onClick={() => { setView('day'); setShowMonthMenu(false); }}><span>{dateLabel(selectedDate)}</span><span>查看当天</span></button>
          </div>
        )}

        <div className="schedule-view-switcher">
          {viewOptions.map(({ id, label, icon: Icon }) => <button key={id} type="button" className={view === id ? 'active' : ''} onClick={() => setView(id)}><Icon /><span>{label}</span></button>)}
        </div>

        {showViewMenu && (
          <div className="schedule-view-menu">
            {viewOptions.map(({ id, label, icon: Icon }) => <button key={id} type="button" className={view === id ? 'active' : ''} onClick={() => { setView(id); setShowViewMenu(false); }}><Icon /><span>{label === '月' ? '月视图' : label === '3日' ? '三日视图' : label === '日' ? '单日视图' : '列表视图'}</span>{view === id && <span>✓</span>}</button>)}
          </div>
        )}

        {view === 'month' && (
          <div className="schedule-month-grid">
            <div className="schedule-week-labels">{['一', '二', '三', '四', '五', '六', '日'].map(day => <span key={day}>{day}</span>)}</div>
            <div className="schedule-month-cells">
              {monthCells.map((date, index) => {
                if (!date) return <span key={`empty-${index}`} className="schedule-month-cell schedule-month-cell-empty" />;
                const count = tasksFor(date).length;
                const key = formatDateKey(date);
                return <button key={key} type="button" className={`schedule-month-cell ${selectedKey === key ? 'active' : ''} ${key === todayKey ? 'today' : ''}`} onClick={() => { setDate(date); setView('day'); }}><b>{date.getDate()}</b>{count > 0 && <span className="schedule-cell-bars"><i /><i className={count > 1 ? 'warm' : ''} /><i className={count > 2 ? 'green' : ''} /></span>}</button>;
              })}
            </div>
          </div>
        )}

        {view !== 'month' && view !== 'list' && (
          <div className="schedule-timeline">
            <div className="schedule-day-navigation">
              <button type="button" aria-label="前一天" onClick={() => moveDate(-1)}><ChevronLeft /></button>
              <div><strong>{dateLabel(selectedDate)}</strong><span>{selectedKey === todayKey ? '今天的安排' : '可前后移动查看日程'}</span></div>
              <button type="button" aria-label="后一天" onClick={() => moveDate(1)}><ChevronRight /></button>
            </div>
            {visibleDates.map(date => {
              const tasks = tasksFor(date);
              return <section key={formatDateKey(date)} className="schedule-timeline-day">
                {view === '3day' && <button type="button" className={`schedule-timeline-date ${formatDateKey(date) === selectedKey ? 'active' : ''}`} onClick={() => setDate(date)}><strong>{date.getDate()}</strong><span>{dateLabel(date)}</span></button>}
                {tasks.length === 0 ? <div className="schedule-empty">当天暂无排期，可向 AI 说一句话快速安排。</div> : tasks.map(task => <div key={task.id} className={`schedule-timeline-row ${task.status === 'accepted' ? 'green' : task.status === 'completed' ? 'gray' : ''}`}><span className="schedule-time-label">{task.time.split(' ')[0]}</span><div className="schedule-timeline-card"><strong>{task.title}</strong><span>{task.note}</span><em>{task.statusLabel}{task.demo ? ' · 示例' : ''}</em></div></div>)}
              </section>;
            })}
            {showDemoHint && tasksFor(selectedDate).some(task => task.demo) && <div className="schedule-demo-hint"><Sparkles /><span>这是新用户示范日程，告诉 AI 你的事情，它会自动补全日期、时间和家庭成员。</span><button type="button" onClick={() => setShowDemoHint(false)} aria-label="关闭提示"><X /></button></div>}
          </div>
        )}

        {view === 'list' && <div className="schedule-list schedule-list-view"><div className="schedule-section-label"><span>全部日程 · {allTasks.length} 项</span><span className="schedule-tag">按日期排列</span></div>{allTasks.map(task => <div key={task.id} className={`schedule-card ${task.status === 'accepted' ? 'schedule-card-green' : task.status === 'completed' ? 'schedule-card-gray' : 'schedule-card-blue'} schedule-clickable`}><div className="schedule-card-time"><Clock className="schedule-card-time-icon" /><span>{dateLabel(new Date(`${task.date}T00:00:00`))} · {task.time}</span><span className="schedule-status-tag">{task.statusLabel}</span></div><div className="schedule-card-main"><h4>{task.title}</h4><p>{task.note}</p></div></div>)}</div>}

        <div className="schedule-list schedule-bottom-content">
          <div className="schedule-archive-box">
            <div className="schedule-archive-header"><UserCheck className="schedule-archive-icon" /><strong>家庭成员档案库 · 3位已建档</strong><button type="button" className="schedule-archive-link" onClick={onOpenProfile}>管理档案 <ChevronRight /></button></div>
            <div className="schedule-archive-tags"><span className="schedule-member-chip">母亲 · 就诊陪护</span><span className="schedule-member-chip">父亲 · 慢病随访</span><span className="schedule-member-chip">雪球 · 宠物照护</span></div>
          </div>
        </div>

        <div className="schedule-sheet-footer">
          <button type="button" className="schedule-ai-btn" onClick={() => setShowQuickAdd(true)}><Sparkles className="schedule-ai-icon" /><span>AI 智能排期</span><ChevronRight className="schedule-ai-arrow" /></button>
        </div>

        {showQuickAdd && (
          <div className="schedule-quick-add-overlay" onClick={() => setShowQuickAdd(false)}>
            <section className="schedule-quick-add-sheet" onClick={event => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="快速新增日程">
              <header><div><strong>快速新增日程</strong><small>先说一句，AI 会帮你补全排期</small></div><button type="button" onClick={() => setShowQuickAdd(false)} aria-label="关闭"><X /></button></header>
              <textarea value={aiDraft} onChange={event => setAiDraft(event.target.value)} placeholder="例如：明天下午陪妈妈去医院复查" />
              <div className="schedule-quick-chips"><button type="button" onClick={() => setAiDraft('明天下午陪妈妈去医院复查')}>陪家人就医</button><button type="button" onClick={() => setAiDraft('今晚去家里上门喂猫')}>宠物照护</button><button type="button" onClick={() => setAiDraft('周末安排一次同城陪伴')}>同城陪伴</button></div>
              <button type="button" className="schedule-quick-primary" onClick={submitAI}><Sparkles />让 AI 智能排期 <ChevronRight /></button>
              <button type="button" className="schedule-quick-manual" onClick={() => { setShowQuickAdd(false); onOpenAgent?.('请帮我手动新增一个档期任务，我需要填写日期、时间、提醒和重复设置'); }}>手动填写日期、时间与提醒</button>
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
