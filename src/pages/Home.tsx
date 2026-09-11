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
  UserRoundCheck,
  Calendar,
  Clock,
  Sparkles,
  UserCheck,
  Users,
  X
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
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCommunityGroupModal, setShowCommunityGroupModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(12);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);

  const [scheduleData, setScheduleData] = useState<Record<number, any[]>>({
    9: [
      { id: 't9-1', time: '09:30 - 11:00', title: '西城区社区医院常规血糖复查', note: '已按期履约完成，老人空腹血糖正常', status: 'completed', statusLabel: '已完成', canEdit: false }
    ],
    10: [
      { id: 't10-1', time: '14:00 - 15:30', title: '宠物疫苗与健康驱虫随访', note: '英短猫咪疫苗完成记录', status: 'completed', statusLabel: '已完成', canEdit: false }
    ],
    11: [
      { id: 't11-1', time: '16:00', title: '代取协和医院病理切片报告', note: '报告已送达并由家属签收', status: 'completed', statusLabel: '已完成', canEdit: false }
    ],
    12: [
      {
        id: 't12-1',
        time: '14:30 - 17:00',
        title: '华西医院 · 母亲心内科门诊陪诊',
        note: '档案：母亲（张阿姨 · 68岁）| 陪护师：王建国（主治护师）',
        details: '全流程协助：挂号就诊、心电图检查、代取药报告',
        status: 'pending',
        statusLabel: '待履约',
        canEdit: true
      },
      {
        id: 't12-2',
        time: '18:30 - 19:30',
        title: '上门喂猫与专业照料',
        note: '档案：布偶猫（雪球 · 2岁）| 宠护师：李晨（持证宠医已接单）',
        details: '全流程摄录确认 · 包含换水喂粮、清洁与互动梳毛',
        status: 'accepted',
        statusLabel: '已接单锁定',
        canEdit: false
      },
      {
        id: 't12-3',
        time: '20:30',
        title: '自记备忘：提醒父亲晚间测血压',
        note: '用户个人备忘录，睡前记录入家庭档案卡',
        details: '若收缩压高于140需留意微信随访',
        status: 'memo',
        statusLabel: '随手记备忘',
        canEdit: true
      }
    ],
    13: [
      {
        id: 't13-1',
        time: '09:00 - 11:30',
        title: '同仁医院眼科白内障术前检查陪诊',
        note: '档案：父亲（李大爷 · 72岁）| 待履约',
        details: '协助挂号排队，检查陪护',
        status: 'pending',
        statusLabel: '待履约',
        canEdit: true
      },
      {
        id: 't13-2',
        time: '19:00',
        title: '自记备忘：检查浴室防滑垫与扶手',
        note: '适老化改造备忘事项',
        details: '已网购防滑脚垫，等待安装',
        status: 'memo',
        statusLabel: '随手记备忘',
        canEdit: true
      }
    ],
    14: [
      {
        id: 't14-1',
        time: '15:00 - 18:00',
        title: '奥森公园周末轮椅陪伴散步',
        note: '档案：外婆（85岁）| 陪护师：张敏',
        details: '户外散步赏花与聊天倾听',
        status: 'pending',
        statusLabel: '待履约',
        canEdit: true
      }
    ],
    15: [
      {
        id: 't15-1',
        time: '10:00',
        title: '全家健康档案周度数据整理汇总',
        note: '整理血糖与血压数据至家庭共享群',
        details: '例行家庭健康管理',
        status: 'memo',
        statusLabel: '随手记备忘',
        canEdit: true
      }
    ]
  });

  const weekDays = [
    { name: '一', day: 9, isPast: true },
    { name: '二', day: 10, isPast: true },
    { name: '三', day: 11, isPast: true },
    { name: '四', day: 12, isToday: true },
    { name: '五', day: 13 },
    { name: '六', day: 14 },
    { name: '日', day: 15 }
  ];

  const handleUpdateTask = (updated: any) => {
    setScheduleData(prev => {
      const list = prev[selectedDay] || [];
      return {
        ...prev,
        [selectedDay]: list.map(item => item.id === updated.id ? updated : item)
      };
    });
    setEditingTask(null);
  };

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

      <section className="welcome">
        <div className="welcome-left">
          <span className="avatar">IP</span>
          <span>Hey，来跟幸福打个招呼！</span>
        </div>
        <button
          type="button"
          className="welcome-schedule-pill"
          onClick={() => setShowScheduleModal(true)}
          aria-label="查看今日AI排期档期"
        >
          <span className="schedule-pill-badge">今日档期</span>
          <span className="schedule-pill-text">2 项待履约</span>
          <ChevronRight className="schedule-pill-arrow" />
        </button>
      </section>

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
          <button
            type="button"
            className="quick-card quick-card-highlight"
            onClick={() => setShowScheduleModal(true)}
            aria-label="档案与档期日历"
          >
            <span className="quick-icon quick-icon-calendar">
              <Calendar className="icon" />
              <span className="quick-icon-dot" />
            </span>
            <strong>档案与档期</strong>
            <small>家庭日历 · 履约排期</small>
          </button>
          <button type="button" className="quick-card" onClick={() => onNavigateToProfile('orders')}>
            <span className="quick-icon"><ClipboardList className="icon" /></span>
            <strong>进程订单</strong>
            <small>{activeOrders ? `${activeOrders} 笔进行中` : '查看进度'}</small>
          </button>
          <button type="button" className="quick-card" onClick={() => onNavigateToProfile('coupons')}>
            <span className="quick-icon"><Ticket className="icon" /></span>
            <strong>优惠卡兑换</strong>
            <small>{availableCoupon ? '权益卡 积分兑换' : '暂无优惠'}</small>
          </button>
          <button type="button" className="quick-card" onClick={() => setShowCommunityGroupModal(true)}>
            <span className="quick-icon"><Users className="icon" /></span>
            <strong>官方内测群</strong>
            <small>意见反馈 扫码进群</small>
          </button>
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
    
      {/* AI 档案日历排期抽屉 / 弹层 */}
      {showScheduleModal && (
        <div className="schedule-modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="schedule-modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="schedule-sheet-header">
              <div className="schedule-sheet-title">
                <Calendar className="schedule-title-icon" />
                <div>
                  <h3>AI 档案与排期日历</h3>
                  <p>家庭成员就医 · 宠物照护 · 智能档期管家</p>
                </div>
              </div>
              <button
                type="button"
                className="schedule-close-btn"
                onClick={() => setShowScheduleModal(false)}
                aria-label="关闭"
              >
                <X />
              </button>
            </div>

            {/* 日历周视图 */}
            <div className="schedule-week-bar">
              <div className="schedule-week-day past"><span>一</span><b>9</b></div>
              <div className="schedule-week-day past"><span>二</span><b>10</b></div>
              <div className="schedule-week-day past"><span>三</span><b>11</b></div>
              <div className="schedule-week-day active">
                <span>四</span><b>12</b><span className="schedule-dot" />
              </div>
              <div className="schedule-week-day">
                <span>五</span><b>13</b><span className="schedule-dot dot-future" />
              </div>
              <div className="schedule-week-day"><span>六</span><b>14</b></div>
              <div className="schedule-week-day"><span>日</span><b>15</b></div>
            </div>

            {/* 当日档案与已排期任务 */}
            <div className="schedule-list">
              <div className="schedule-section-label">
                <span>3月12日 今天 · 履约排期 (2)</span>
                <span className="schedule-tag">AI 已锁定专业陪护</span>
              </div>

              <div className="schedule-card schedule-card-blue">
                <div className="schedule-card-time">
                  <Clock className="schedule-card-time-icon" />
                  <span>14:30 - 17:00</span>
                  <span className="schedule-status-tag">待履约</span>
                </div>
                <div className="schedule-card-main">
                  <h4>华西医院 · 母亲心内科门诊陪诊</h4>
                  <p>档案：母亲（张阿姨 · 68岁）| 陪护师：王建国（主治护师）</p>
                </div>
                <div className="schedule-card-foot">
                  <span>全流程协助：挂号就诊、心电图检查、代取药报告</span>
                </div>
              </div>

              <div className="schedule-card schedule-card-green">
                <div className="schedule-card-time">
                  <Clock className="schedule-card-time-icon" />
                  <span>18:30 - 19:30</span>
                  <span className="schedule-status-tag green">已接单</span>
                </div>
                <div className="schedule-card-main">
                  <h4>上门喂猫与专业照料</h4>
                  <p>档案：布偶猫（雪球 · 2岁）| 宠护师：李晨（持证宠医）</p>
                </div>
                <div className="schedule-card-foot">
                  <span>全流程摄录确认 · 包含换水喂粮、清洁与互动梳毛</span>
                </div>
              </div>

              {/* 家庭档案快捷卡 */}
              <div className="schedule-archive-box">
                <div className="schedule-archive-header">
                  <UserCheck className="schedule-archive-icon" />
                  <strong>家庭成员档案库 (3位已建档)</strong>
                  <button
                    type="button"
                    className="schedule-archive-link"
                    onClick={() => {
                      setShowScheduleModal(false);
                      onNavigateToProfile('menu');
                    }}
                  >
                    管理档案 ›
                  </button>
                </div>
                <div className="schedule-archive-tags">
                  <span className="schedule-member-chip">母亲 (就诊陪护/高血压)</span>
                  <span className="schedule-member-chip">父亲 (慢病随访备忘)</span>
                  <span className="schedule-member-chip">布偶猫 (疫苗与喂护档案)</span>
                </div>
              </div>
            </div>

            {/* 底部 AI 排期唤起 */}
            <div className="schedule-sheet-footer">
              <button
                type="button"
                className="schedule-ai-btn"
                onClick={() => {
                  setShowScheduleModal(false);
                  openAgent('请根据我家庭成员档案已记录的需求，为接下来一周智能规划就医与照料档期');
                }}
              >
                <Sparkles className="schedule-ai-icon" />
                <span>让 AI 助手为我智能排档期</span>
                <ChevronRight className="schedule-ai-arrow" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
