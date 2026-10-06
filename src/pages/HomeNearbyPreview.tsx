import React, { useEffect, useRef, useState } from 'react';
import { Bell, CalendarDays, ChevronDown, ChevronRight, FilePenLine, Home, MapPin, Plus, Search, Send, ShieldCheck, Sparkles, UserRound, X, BadgeCheck, BriefcaseBusiness, WalletCards, MessageCircle, Star, RefreshCw, Gift, Trophy } from 'lucide-react';
import './HomeNearbyPreview.css';
import './HomeNearbyBlueStage.css';
import CareerCarousel from './CareerCarousel';
import ScheduleCalendar from '../components/ScheduleCalendar';
import FamilyProfiles from '../components/FamilyProfiles';

const providers = [
  { name: '林师傅', distance: .8, service: '医院陪诊 · 已服务 328 次', tag: '可即时响应', price: '168', tone: 'blue' },
  { name: '周老师', distance: 1.7, service: '宠物陪伴 · 上门照顾', tag: '今日可约', price: '98', tone: 'green' },
  { name: '陈师傅', distance: 3.4, service: '同城跑腿 · 代办取送', tag: '3 分钟响应', price: '45', tone: 'gold' },
];
const radiusStats: Record<number, { active: number; available: number; rating: number; label: string }> = {
  1: { active: 186, available: 24, rating: 4.8, label: '1公里内' }, 3: { active: 428, available: 68, rating: 4.8, label: '3公里内' },
  5: { active: 1286, available: 328, rating: 4.9, label: '5公里内' }, 99: { active: 3680, available: 726, rating: 4.9, label: '全城' },
};
const getAvailability = (available: number) => available < 50 ? { tone: 'critical', label: '服务者不足' } : available < 120 ? { tone: 'warning', label: '服务者紧张' } : { tone: 'ready', label: '服务者充足' };

function ActionIllustration({ kind }: { kind: 'publish' | 'join' }) {
  return <span className={`np-action-art ${kind}`} aria-hidden="true">
    <span className="np-art-orbit" />
    <span className="np-art-object">{kind === 'publish' ? <FilePenLine size={43} strokeWidth={1.8} /> : <BriefcaseBusiness size={43} strokeWidth={1.8} />}</span>
    <span className="np-art-seal">{kind === 'publish' ? <Plus size={18} strokeWidth={3} /> : <BadgeCheck size={23} strokeWidth={2.2} />}</span>
    <Sparkles className="np-art-spark" size={18} />
  </span>;
}

function RollingNumber({ value }: { value: number }) {
  const [shown, setShown] = useState(0);
  const current = useRef(0);
  useEffect(() => {
    const start = performance.now();
    const from = current.current;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 720);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(from + (value - from) * eased);
      current.current = next;
      setShown(next);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <b className="np-rolling-number">{shown.toLocaleString()}</b>;
}

interface HomeNearbyPreviewProps {
  embedded?: boolean;
  onNavigateToDirectory?: (query?: string) => void;
  onNavigateToPublish?: () => void;
  onNavigateToPartner?: () => void;
  onNavigateToSchedule?: () => void;
  onNavigateToCommunity?: () => void;
  onNavigateToAgent?: () => void;
  onNavigateToProfile?: (view?: 'menu' | 'orders' | 'coupons') => void;
}

export default function HomeNearbyPreview({ embedded = false, onNavigateToDirectory, onNavigateToPublish, onNavigateToPartner, onNavigateToSchedule, onNavigateToCommunity, onNavigateToAgent, onNavigateToProfile }: HomeNearbyPreviewProps) {
  const [distance, setDistance] = useState(5);
  const [city, setCity] = useState('成都 · 玉林片区');
  const [dialog, setDialog] = useState('');
  const [sent, setSent] = useState(false);
  const [draft, setDraft] = useState('');
  const [serviceQuery, setServiceQuery] = useState('');
  const [showScheduleCalendar, setShowScheduleCalendar] = useState(false);
  const [showFamilyProfiles, setShowFamilyProfiles] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(() => Date.now() - 5 * 60 * 1000);
  const [, setClock] = useState(() => Date.now());
  const visible = providers.filter(p => distance === 99 || p.distance <= distance);
  const radius = radiusStats[distance];
  const availability = getAvailability(radius.available);
  useEffect(() => {
    const refreshTimer = window.setInterval(() => setLastUpdatedAt(Date.now()), 5 * 60 * 1000);
    const clockTimer = window.setInterval(() => setClock(Date.now()), 60 * 1000);
    return () => {
      window.clearInterval(refreshTimer);
      window.clearInterval(clockTimer);
    };
  }, []);
  const updatedMinutes = Math.max(0, Math.floor((Date.now() - lastUpdatedAt) / 60000));
  const updatedLabel = updatedMinutes === 0 ? '刚刚更新' : `${updatedMinutes}分钟前更新`;
  const open = (title: string) => { setDialog(title); setSent(false); };
  const openSchedule = () => onNavigateToSchedule ? onNavigateToSchedule() : setShowScheduleCalendar(true);
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return <div className={`nearby-preview${embedded ? ' nearby-preview-embedded' : ''}`}>
    <header className="np-header"><div className="np-brand"><span>和</span><strong>和伴</strong></div><button className="np-place" onClick={() => open('切换片区')}><MapPin size={14} />{city}<ChevronDown size={13} /></button><div className="np-head-actions"><button className="np-icon" aria-label="消息" title="消息" onClick={() => open('消息')}><Bell size={19} /></button></div></header>
    <main>
      <section className="np-fusion-home" aria-label="和伴首页核心区域">
        <form className="np-home-search" role="search" onSubmit={event => { event.preventDefault(); onNavigateToDirectory ? onNavigateToDirectory(serviceQuery.trim()) : open('服务搜索'); }}>
          <Search size={17} aria-hidden="true" />
          <input value={serviceQuery} onChange={event => setServiceQuery(event.target.value)} placeholder="输入服务关键词" aria-label="输入服务关键词" />
          {serviceQuery && <button type="button" aria-label="清空搜索" onClick={() => setServiceQuery('')}><X size={14} /></button>}
        </form>
        <div className="np-blue-stage">
        <section className="np-fusion-hero"><CareerCarousel /></section>
        <section className="np-presence" aria-label="附近服务数据">
          <div className="np-service-status"><strong>附近服务</strong><span className="np-availability-label"><i className={`np-live ${availability.tone}`} />{availability.label}</span><div className="np-status-legend" aria-label="服务者供给状态说明"><span><i className="ready" />充足</span><span><i className="warning" />紧张</span><span><i className="critical" />不足</span></div></div>
          <div className="np-reach-row">
            <div className="np-presence-stats"><span><RollingNumber value={radius.active} /><small>正在使用和伴</small></span><span><RollingNumber value={radius.available} /><small>今日可约小伴</small></span></div>
            <div className="np-distance" aria-label="服务范围">{[5, 99].map(value => <button key={value} aria-pressed={distance === value} className={distance === value ? 'active' : ''} onClick={() => setDistance(value)}>{value === 99 ? '全城' : '附近5公里'}</button>)}</div>
          </div>
          <div className="np-presence-meta" aria-label="附近服务信任信息">
            <span><ShieldCheck size={11} />服务者 {radius.available} 位</span>
            <span><Star size={11} fill="currentColor" />综合评分 {radius.rating}</span>
            <span><RefreshCw size={11} />{updatedLabel}</span>
          </div>
        </section>
        </div>
        <section className="np-fusion-welcome"><span className="np-fusion-avatar">和</span><strong>嗨，把今天交给好陪伴</strong><button onClick={openSchedule}>我的日程<ChevronRight size={14} /></button></section>
        <section className="np-fusion-actions" aria-label="核心操作">
          <button className="np-fusion-action blue" onClick={() => onNavigateToPublish ? onNavigateToPublish() : onNavigateToDirectory ? onNavigateToDirectory() : open('发布需求')}><ActionIllustration kind="publish" /><strong>发布需求<span className="np-action-arrow" aria-hidden="true"><ChevronRight size={16} /></span></strong><small>说清需要，找到合适小伴师傅</small></button>
          <button className="np-fusion-action green" onClick={() => onNavigateToPartner ? onNavigateToPartner() : open('成为小伴')}><ActionIllustration kind="join" /><strong>成为小伴<span className="np-action-arrow" aria-hidden="true"><ChevronRight size={16} /></span></strong><small>认证你的技能，欢迎各位自由职业者来到发挥热爱价值</small></button>
        </section>
        <section className="np-fusion-quick" aria-label="快捷功能"><button onClick={openSchedule}><CalendarDays size={22} /><strong>档案与档期</strong><small>AI 助手智能排期，发单接单都能安排</small></button><button onClick={() => onNavigateToProfile ? onNavigateToProfile('orders') : open('进程订单')}><FilePenLine size={22} /><strong>进程订单</strong><small>1 笔进行中</small></button><button onClick={() => onNavigateToProfile ? onNavigateToProfile('coupons') : open('优惠卡兑换')}><WalletCards size={22} /><strong>优惠卡兑换</strong><small>权益与积分兑换</small></button><button onClick={() => open('意见反馈群')}><MessageCircle size={22} /><strong>意见反馈群</strong><small>反馈扫码进群</small></button></section>
      </section>
      <section className="np-providers" id="np-providers"><div className="np-section-heading"><div><h2>就近可约</h2><small>真实服务案例 · 选择合适的小伴</small></div><button onClick={() => onNavigateToCommunity ? onNavigateToCommunity() : open('附近小伴')}>查看全部<ChevronRight size={14} /></button></div><div className="np-provider-grid">{visible.map((p, index) => <button className={`np-provider ${index === 0 ? 'np-provider-priority' : ''}`} key={p.name} onClick={() => open(p.name)}><span className={`np-case-media ${p.tone}`}><b>{index === 0 ? '陪诊' : index === 1 ? '宠陪' : '跑腿'}</b><small>{index === 0 ? '医院全程陪伴' : index === 1 ? '上门照护记录' : '同城代办服务'}</small></span><span className="np-provider-info"><strong>{p.name}<em>{p.tag}</em></strong><span>{p.service}</span><small><MapPin size={12} />{p.distance} 公里 · <ShieldCheck size={12} />平台认证</small></span><span className="np-order-cta"><b>¥{p.price}起</b><i>{index === 0 ? '立即选TA' : '查看详情'}</i></span></button>)}</div></section>
      <section className="np-activity-zone" aria-label="活动专区">
        <div className="np-activity-heading"><div><span>活动专区</span><strong>新版本上线 · 平台订阅全场免费</strong><small>零费用使用和伴服务，参与社区活动还有机会领取奖励</small></div><Gift size={20} /></div>
        <div className="np-activity-rewards">
          <span><Trophy size={13} />本周投稿榜</span>
          <span>第1名 · 免单机会</span>
          <span>第2-3名 · 平台奖励</span>
        </div>
        <button type="button" className="np-activity-link" onClick={() => onNavigateToCommunity ? onNavigateToCommunity() : open('社区活动')}>查看排行榜与活动规则<ChevronRight size={14} /></button>
      </section>
      <section className="np-community-contribute" aria-label="社区投稿">
        <div className="np-community-contribute-head">
          <span className="np-community-contribute-icon"><Sparkles size={18} /></span>
          <div><strong>记录一次值得分享的陪伴 · 投稿拿奖励</strong><small>集齐任意平台 52 个赞，即可获免单机会</small></div>
          <button onClick={() => onNavigateToCommunity ? onNavigateToCommunity() : open('社区投稿')}>去投稿<ChevronRight size={14} /></button>
        </div>
        <div className="np-community-contribute-tags"><span>订单故事</span><span>52赞免单</span><span>每周选题</span><small>平台运营跟进</small></div>
      </section>
      <section className="np-income"><div><span className="np-income-icon"><Sparkles size={20} /></span><span><strong>技能变现中心</strong><small>把已认证技能转成可报价服务</small></span></div><button onClick={() => open('技能钱包')}>查看收益<ChevronRight size={15} /></button></section>
    </main>
    <div className="np-fixed"><button className="np-publish" aria-label="发布需求" onClick={() => onNavigateToPublish ? onNavigateToPublish() : open('发布需求')}><Plus size={24} /></button><nav className="np-nav">{[{ label: '首页', icon: Home, id: '' }, { label: '附近', icon: MapPin, id: 'np-providers' }, { label: '发布', icon: Plus, id: '' }, { label: '我的', icon: UserRound, id: 'np-personal' }].map(({ label, icon: Icon, id }) => <button key={label} className={label === '首页' ? 'active' : ''} onClick={() => id ? scrollTo(id) : label === '发布' ? onNavigateToPublish ? onNavigateToPublish() : open('发布需求') : document.querySelector('.nearby-preview')?.scrollTo({ top: 0, behavior: 'smooth' })}><Icon size={21} /><span>{label}</span></button>)}</nav></div>
    {dialog && <div className="np-overlay" onClick={() => setDialog('')}><section role="dialog" aria-modal="true" className="np-sheet" onClick={e => e.stopPropagation()}><header><h2>{dialog}</h2><button className="np-icon" aria-label="关闭" onClick={() => setDialog('')}><X size={20} /></button></header>{dialog === '切换片区' ? <div className="np-city-options">{['成都 · 玉林片区', '成都 · 高新区', '北京 · 朝阳区'].map(place => <button key={place} onClick={() => { setCity(place); setDistance(99); setDialog(''); }}>{place}<ChevronRight size={16} /></button>)}</div> : dialog === '发布需求' ? sent ? <p role="status">已完成本地预览，未向平台提交。</p> : <form onSubmit={e => { e.preventDefault(); setSent(true); }}><textarea required value={draft} onChange={e => setDraft(e.target.value)} placeholder="说说你需要什么帮助…" /><small>独立预览，不产生真实订单。</small><button className="np-primary" type="submit"><Send size={16} />预览提交</button></form> : <><p>当前为首页独立体验稿，此入口尚未连接正式业务。</p><button className="np-primary" onClick={() => setDialog('')}>返回首页</button></>}</section></div>}
    {showScheduleCalendar && <ScheduleCalendar onClose={() => setShowScheduleCalendar(false)} onOpenAgent={prompt => { setShowScheduleCalendar(false); if (onNavigateToAgent) onNavigateToAgent(); else open(prompt); }} onOpenProfile={() => { setShowScheduleCalendar(false); setShowFamilyProfiles(true); }} />}
    {showFamilyProfiles && <FamilyProfiles onClose={() => setShowFamilyProfiles(false)} />}
  </div>;
}
