import React, { useEffect, useState } from 'react';
import {
  Bell,
  ChevronRight,
  ClipboardList,
  FileEdit,
  Heart,
  PawPrint,
  Plus,
  Search,
  ShieldCheck,
  Stethoscope,
  Ticket,
  UserRoundCheck
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface HomeProps {
  onNavigateToAgent: () => void;
  onNavigateToCommunity: () => void;
  onNavigateToProfile: (view?: 'menu' | 'orders' | 'coupons') => void;
}

const services = [
  { title: '健康医陪', subtitle: '陪诊 护工 取药报告等', icon: Stethoscope, prompt: '我需要健康陪诊服务，请帮我生成需求单' },
  { title: '宠物陪伴', subtitle: '各类宠物 上门照顾', icon: PawPrint, prompt: '我需要宠物陪伴服务，请帮我生成需求单' },
  { title: '自定义服务+', subtitle: '即时代办  任务跑腿等', icon: FileEdit, prompt: '我有一项自定义服务需求，请帮我生成需求单' }
];

export default function Home({ onNavigateToAgent, onNavigateToCommunity, onNavigateToProfile }: HomeProps) {
  const { currentCity, orders, coupons, setPrefilledPrompt } = useAppContext();
  const [slide, setSlide] = useState(0);
  const availableCoupon = coupons.find(coupon => coupon.status === 'available');
  const activeOrders = orders.filter(order => order.status === 'pending' || order.status === 'accepted').length;

  useEffect(() => {
    const timer = window.setInterval(() => setSlide(value => (value + 1) % 3), 4200);
    return () => window.clearInterval(timer);
  }, []);

  const openAgent = (prompt: string) => {
    setPrefilledPrompt(prompt);
    onNavigateToAgent();
  };

  const heroCopies = [
    ['XXXX · 和伴首测', '有人陪你', '事情就好办', '健康陪诊、宠物陪伴、自定义服务', '立即查看'],
    ['XXXX · 陪伴服务', '把需要说清楚', '把陪伴交给我们', 'XXXX 认证服务 · XXXX 保障 · XXXX 响应', '开始匹配'],
    ['XXXX · 版本首测', '首测全场', '八折优惠', '领取 XXXX 优惠卡，开启你的第一次陪伴。', '立即领取']
  ];

  return (
    <div className="home-page min-h-full">
      <div className="statusbar"><span>9:41</span><span>● ● ●</span></div>
      <header className="topbar">
        <div className="brand"><span className="brand-mark">和</span><span>和伴 情绪服务资源共享</span></div>
        <div className="top-actions">
          <button type="button" className="circle-button" aria-label="搜索"><Search /></button>
          <button type="button" className="circle-button" aria-label="消息"><Bell /></button>
        </div>
      </header>

      <section className="hero" aria-label="Banner">
        <div className="hero-track" style={{ transform: `translateX(-${slide * 100}%)` }}>
          {[0, 1, 2].map(index => (
            <article className="hero-slide" key={index}>
              <div className="hero-kicker">{heroCopies[index][0]}</div>
              <h1>{heroCopies[index][1]}<br />{heroCopies[index][2]}</h1>
              <p className="hero-copy">{heroCopies[index][3]}<br />{index === 0 && `XXXX ${currentCity}市现已开放。`}</p>
              <button type="button" className="hero-cta" onClick={() => openAgent('请帮我推荐适合我的陪护服务')}>
                {heroCopies[index][4]} <span aria-hidden="true">›</span>
              </button>
              <div className="missing-media"><span className="missing-label">XXXX 图片位</span></div>
            </article>
          ))}
        </div>
        <div className="dots" aria-label="Banner 切换">
          {[0, 1, 2].map(index => (
            <button key={index} type="button" className={`dot ${slide === index ? 'active' : ''}`} aria-label={`第 ${index + 1} 张`} onClick={() => setSlide(index)} />
          ))}
        </div>
      </section>

      <section className="welcome"><span className="avatar">IP</span><span>Hey，来跟幸福打个招呼！</span></section>

      <section className="surface">
        <div className="service-grid">
          {services.map(service => {
            const Icon = service.icon;
            return (
              <button key={service.title} type="button" className="service-card" onClick={() => openAgent(service.prompt)}>
                <span className="service-visual"><Icon className="icon icon-lg" /></span>
                <strong>{service.title}</strong>
                <small>{service.subtitle}</small>
              </button>
            );
          })}
        </div>
        <div className="quick-grid">
          <button type="button" className="quick-card" onClick={() => onNavigateToProfile('orders')}><span className="quick-icon"><ClipboardList className="icon" /></span><strong>进程订单</strong><small>{activeOrders ? `${activeOrders} 笔进行中` : '查看进度'}</small></button>
          <button type="button" className="quick-card" onClick={() => onNavigateToProfile('coupons')}><span className="quick-icon"><Ticket className="icon" /></span><strong>优惠卡兑换</strong><small>{availableCoupon ? '权益卡 积分兑换' : '暂无优惠'}</small></button>
          <button type="button" className="quick-card" onClick={() => onNavigateToProfile('menu')}><span className="quick-icon"><UserRoundCheck className="icon" /></span><strong>偏好档案</strong><small>家庭成员档案记录</small></button>
          <button type="button" className="quick-card" onClick={() => openAgent('我需要情绪陪伴服务，请帮我生成需求单')}><span className="quick-icon"><Heart className="icon" /></span><strong>情绪照顾</strong><small>各类服务目录</small></button>
        </div>
      </section>

      <section className="section">
        <div className="promo-grid">
          <article className="promo-card primary">
            <h2>首测城市开放<br />全场 8 折</h2>
            <p>1.0版本 · 上海、成都、西安等城市</p>
            <button type="button" className="promo-button" onClick={() => onNavigateToProfile('coupons')}>立即领取</button>
            <div className="missing-media"><span className="missing-label">XXXX 图片位</span></div>
          </article>
          <div className="promo-stack">
            <button type="button" className="promo-card" onClick={onNavigateToCommunity}><h2>邀请好友</h2><p>立得 XXXX</p><div className="missing-media"><span className="missing-label">XXXX 图片位</span></div></button>
            <button type="button" className="promo-card" onClick={() => onNavigateToProfile('menu')}><h2>XXXX 专属权益</h2><p>一键查看 ›</p><div className="missing-media"><span className="missing-label">XXXX 图片位</span></div></button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading"><h2>热门服务</h2><button type="button" onClick={onNavigateToAgent}>更多 ›</button></div>
        <div className="service-list">
          <article className="recommend-card" onClick={() => openAgent(services[0].prompt)}>
            <div className="missing-media"><span className="missing-label">XXXX 图片位</span></div>
            <div className="recommend-body"><h3>XXXX 陪诊服务</h3><p>专业人员全程陪同，XXXX 就医流程。</p><div className="recommend-foot"><span className="price">¥ XXXX</span><button type="button" className="add" aria-label="添加服务"><Plus /></button></div></div>
          </article>
          <article className="recommend-card" onClick={() => openAgent(services[1].prompt)}>
            <div className="missing-media"><span className="missing-label">XXXX 图片位</span></div>
            <div className="recommend-body"><h3>XXXX 宠物陪伴</h3><p>喂养、遛宠、陪伴，XXXX 更安心。</p><div className="recommend-foot"><span className="price">¥ XXXX</span><button type="button" className="add" aria-label="添加服务"><Plus /></button></div></div>
          </article>
        </div>
      </section>

      <div className="trust"><ShieldCheck className="trust-icon" /><span>XXXX 实名认证服务 · XXXX 隐私保障 · XXXX 全程可追踪</span></div>
    </div>
  );
}
