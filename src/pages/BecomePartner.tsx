import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, BadgeCheck, BriefcaseBusiness, CalendarDays, Check, ChevronRight, Clock3, FileCheck2, MapPin, Phone, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import './BecomePartner.css';

interface BecomePartnerProps {
  onBack: () => void;
}

const skills = [
  { id: 'medical', label: '医陪陪诊', detail: '陪诊、取药、检查引导' },
  { id: 'pet', label: '宠物陪伴', detail: '喂养、遛宠、日常照护' },
  { id: 'city', label: '同城任务', detail: '代办、跑腿、陪同协助' },
  { id: 'travel', label: '旅陪出行', detail: '接送、随行、路线协助' },
];

export default function BecomePartner({ onBack }: BecomePartnerProps) {
  const { currentCity } = useAppContext();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', idNumber: '', wechat: '', skills: [] as string[] });
  useEffect(() => {
    if (heroPaused) return;
    const timer = window.setInterval(() => setHeroSlide(current => (current + 1) % 2), 4000);
    return () => window.clearInterval(timer);
  }, [heroPaused]);

  const update = (key: keyof typeof form, value: string) => setForm(prev => ({ ...prev, [key]: value }));
  const toggleSkill = (id: string) => setForm(prev => ({
    ...prev,
    skills: prev.skills.includes(id) ? prev.skills.filter(item => item !== id) : [...prev.skills, id],
  }));
  const canContinue = step === 1
    ? Boolean(form.name.trim() && /^1[3-9]\d{9}$/.test(form.phone.replace(/\s+/g, '')) && form.idNumber.trim())
    : form.skills.length > 0;

  if (submitted) {
    return (
      <div className="partner-page">
        <header className="partner-header"><button type="button" onClick={onBack} aria-label="返回首页"><ArrowLeft /></button><strong>申请成为小伴</strong><span /></header>
        <main className="partner-success">
          <span className="partner-success-icon"><Check /></span>
          <h1>认证申请已提交</h1>
          <p>我们会先核验你的实名与联系方式，后续再逐步完善技能学习和平台规则流程。</p>
          <div className="partner-review-card"><ShieldCheck /><span><strong>当前状态：待平台审核</strong><small>这是本地预览状态，暂未连接正式审核接口。</small></span></div>
          <button type="button" className="partner-primary" onClick={onBack}>返回首页</button>
        </main>
      </div>
    );
  }

  return (
    <div className="partner-page">
      <header className="partner-header"><button type="button" onClick={onBack} aria-label="返回首页"><ArrowLeft /></button><strong>申请成为小伴</strong><span className="partner-header-status">平台认证</span></header>
      <main className="partner-main">
        <section className="partner-hero-carousel" aria-label="成为小伴介绍" onMouseEnter={() => setHeroPaused(true)} onMouseLeave={() => setHeroPaused(false)} onFocusCapture={() => setHeroPaused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHeroPaused(false); }}>
          <div className={`partner-hero partner-hero-slide ${heroSlide === 0 ? 'active' : ''}`}>
            <span className="partner-hero-icon"><BriefcaseBusiness /></span>
            <div><span>和伴小伴师傅入驻</span><h1>把你的真实技能<br />展示给大家，变成可持续的服务</h1><p>完善技能名片，让每一项真实能力都被看见。</p></div>
            <div className="partner-skill-card" aria-hidden="true"><BadgeCheck size={14} /><strong>技能名片</strong><small>陪诊 · 宠陪 · 同城任务</small><i>已认证</i></div>
          </div>
          <div className={`partner-hero partner-hero-slide ${heroSlide === 1 ? 'active' : ''}`}>
            <span className="partner-hero-icon"><CalendarDays /></span>
            <div><span>和伴小伴师傅入驻</span><h1>多技能灵活接单<br />让每个时段都能创造价值</h1><p>按自己的时间安排服务，逐步积累口碑与收入。</p></div>
            <div className="partner-calendar-card" aria-hidden="true"><CalendarDays size={42} /><div><span><Clock3 size={12} />上午 陪诊</span><span><Sparkles size={12} />下午 宠陪</span><span><Check size={12} />晚间 同城</span></div><img src={`${import.meta.env.BASE_URL}ip/heban-pony-transparent.png`} alt="" /></div>
          </div>
          <div className="partner-hero-dots">{[0, 1].map(index => <button key={index} type="button" aria-label={`查看第${index + 1}张介绍`} aria-pressed={heroSlide === index} onClick={() => setHeroSlide(index)}><span /></button>)}</div>
        </section>

        <div className="partner-steps" aria-label="入驻进度">
          {['实名信息', '服务技能', '提交审核'].map((label, index) => <React.Fragment key={label}>
            <span className={step >= index + 1 ? 'active' : ''}><b>{index + 1}</b>{label}</span>
            {index < 2 && <i className={step > index + 1 ? 'active' : ''} />}
          </React.Fragment>)}
        </div>

        <section className="partner-form-card">
          {step === 1 && <div className="partner-form-section">
            <div className="partner-section-title"><UserRound /><div><h2>填写实名信息</h2><p>用于平台身份核验，不会公开展示。</p></div></div>
            <label>真实姓名<input value={form.name} onChange={e => update('name', e.target.value)} placeholder="请输入本人姓名" /></label>
            <label>身份证号<input value={form.idNumber} onChange={e => update('idNumber', e.target.value)} placeholder="请输入身份证号码" /></label>
            <label>手机号码<input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="请输入常用手机号" inputMode="tel" /></label>
            {form.phone && !/^1[3-9]\d{9}$/.test(form.phone.replace(/\s+/g, '')) && <small className="partner-error">请输入有效的 11 位手机号码</small>}
            <label>当前服务城市<div className="partner-readonly"><MapPin />{currentCity}市<ChevronRight /></div></label>
          </div>}

          {step === 2 && <div className="partner-form-section">
            <div className="partner-section-title"><BadgeCheck /><div><h2>选择你的服务技能</h2><p>可多选，后续还可以继续申请认证。</p></div></div>
            <div className="partner-skill-grid">{skills.map(skill => <button type="button" key={skill.id} className={form.skills.includes(skill.id) ? 'selected' : ''} onClick={() => toggleSkill(skill.id)}><span><strong>{skill.label}</strong><small>{skill.detail}</small></span><i>{form.skills.includes(skill.id) ? <Check /> : '+'}</i></button>)}</div>
            <label>联系方式补充（选填）<input value={form.wechat} onChange={e => update('wechat', e.target.value)} placeholder="微信号或其他方便联系的方式" /></label>
          </div>}

          {step === 3 && <div className="partner-form-section">
            <div className="partner-section-title"><FileCheck2 /><div><h2>确认并提交申请</h2><p>请确认下面信息真实有效。</p></div></div>
            <div className="partner-summary"><p><span>姓名</span><strong>{form.name}</strong></p><p><span>联系电话</span><strong>{form.phone}</strong></p><p><span>服务城市</span><strong>{currentCity}市</strong></p><p><span>申请技能</span><strong>{form.skills.map(id => skills.find(skill => skill.id === id)?.label).join('、')}</strong></p></div>
            <div className="partner-consent"><ShieldCheck /><span>我确认提交的信息真实有效，并同意平台后续联系我完成认证。</span></div>
          </div>}

          <div className="partner-form-actions">
            {step > 1 && <button type="button" className="partner-secondary" onClick={() => setStep(prev => prev - 1)}><ArrowLeft />上一步</button>}
            <button type="button" className="partner-primary" disabled={!canContinue} onClick={() => step < 3 ? setStep(prev => prev + 1) : setSubmitted(true)}>{step < 3 ? '下一步' : '提交认证申请'}<ArrowRight /></button>
          </div>
        </section>
        <p className="partner-footnote">后续将逐步完善技能学习、平台规则与接单流程。</p>
      </main>
    </div>
  );
}
