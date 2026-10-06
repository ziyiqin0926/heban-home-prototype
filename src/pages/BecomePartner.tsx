import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, BadgeCheck, BriefcaseBusiness, CalendarDays, Check, ChevronRight, Clock3, FileCheck2, ImagePlus, IdCard, MapPin, Phone, ShieldCheck, Sparkles, Upload, UserRound } from 'lucide-react';
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
const serviceCities = [
  '全国可接单', '北京', '上海', '天津', '重庆', '广州', '深圳', '杭州', '南京', '苏州',
  '成都', '武汉', '西安', '郑州', '长沙', '青岛', '厦门', '福州', '济南', '合肥',
  '昆明', '贵阳', '南宁', '海口', '沈阳', '大连', '长春', '哈尔滨', '南昌', '太原',
  '石家庄', '呼和浩特', '兰州', '乌鲁木齐', '银川', '西宁', '拉萨', '香港', '澳门'
];

export default function BecomePartner({ onBack }: BecomePartnerProps) {
  const { currentCity } = useAppContext();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', idNumber: '', wechat: '', skills: [] as string[] });
  const [serviceCity, setServiceCity] = useState(currentCity);
  const [identityFiles, setIdentityFiles] = useState<{ front: File | null; back: File | null; showcase: File | null }>({ front: null, back: null, showcase: null });
  const [identityPreviews, setIdentityPreviews] = useState<{ front: string; back: string; showcase: string }>({ front: '', back: '', showcase: '' });
  useEffect(() => {
    if (heroPaused) return;
    const timer = window.setInterval(() => setHeroSlide(current => (current + 1) % 2), 4000);
    return () => window.clearInterval(timer);
  }, [heroPaused]);

  const update = (key: keyof typeof form, value: string) => setForm(prev => ({ ...prev, [key]: value }));
  const cleanPhone = form.phone.replace(/\s+/g, '');
  const cleanIdNumber = form.idNumber.replace(/\s+/g, '').toUpperCase();
  const nameInvalid = form.name.trim().length > 0 && form.name.trim().length < 2;
  const phoneInvalid = form.phone.trim().length > 0 && !/^1[3-9]\d{9}$/.test(cleanPhone);
  const idNumberInvalid = form.idNumber.trim().length > 0 && !/^\d{17}[\dX]$/.test(cleanIdNumber);
  const phoneValid = /^1[3-9]\d{9}$/.test(cleanPhone);
  const toggleSkill = (id: string) => setForm(prev => ({
    ...prev,
    skills: prev.skills.includes(id) ? prev.skills.filter(item => item !== id) : [...prev.skills, id],
  }));
  const canContinue = step === 1
    ? Boolean(form.name.trim().length >= 2 && phoneValid && !idNumberInvalid && serviceCity && identityFiles.front && identityFiles.back && identityFiles.showcase)
    : form.skills.length > 0;
  const handleIdentityFile = (kind: keyof typeof identityFiles, file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const preview = URL.createObjectURL(file);
    setIdentityFiles(prev => ({ ...prev, [kind]: file }));
    setIdentityPreviews(prev => {
      if (prev[kind]) URL.revokeObjectURL(prev[kind]);
      return { ...prev, [kind]: preview };
    });
  };

  const renderUploadTile = (kind: keyof typeof identityFiles, title: string, hint: string, Icon: typeof IdCard) => (
    <label className={`partner-upload-tile ${identityFiles[kind] ? 'uploaded' : ''}`}>
      <input type="file" accept="image/*" onChange={event => handleIdentityFile(kind, event.target.files?.[0])} />
      {identityPreviews[kind] ? <img src={identityPreviews[kind]} alt={`${title}预览`} /> : <span className="partner-upload-icon"><Icon /></span>}
      <strong>{identityFiles[kind] ? '已上传' : title}</strong>
      <small>{identityFiles[kind] ? identityFiles[kind]?.name : hint}</small>
      <i><Upload /></i>
    </label>
  );

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
            <label className={nameInvalid ? 'partner-field-invalid' : ''}>
              真实姓名
              <input value={form.name} onChange={e => update('name', e.target.value)} placeholder="请输入本人姓名" aria-invalid={nameInvalid} />
              {nameInvalid && <small className="partner-error">姓名至少填写 2 个字符</small>}
            </label>
            <label className={idNumberInvalid ? 'partner-field-invalid' : ''}>
              身份证号（选填）
              <input value={form.idNumber} onChange={e => update('idNumber', e.target.value)} placeholder="照片清晰时可不填写" inputMode="text" maxLength={18} aria-invalid={idNumberInvalid} />
              {idNumberInvalid && <small className="partner-error">身份证号应为 18 位数字，末位可为 X</small>}
            </label>
            <div className="partner-upload-group">
              <div className="partner-upload-heading"><strong>身份证照片</strong><span>请上传身份证正反面，用于实名核验</span></div>
              <div className="partner-upload-grid">
                {renderUploadTile('front', '身份证正面', '人像面', IdCard)}
                {renderUploadTile('back', '身份证反面', '国徽面', IdCard)}
              </div>
            </div>
            <div className="partner-upload-group">
              <div className="partner-upload-heading"><strong>个人展示照片</strong><span>用于技能名片展示，可更换</span></div>
              <div className="partner-upload-grid partner-upload-grid-single">
                {renderUploadTile('showcase', '上传个人照片', '建议清晰半身照', ImagePlus)}
              </div>
            </div>
            <label className={phoneInvalid ? 'partner-field-invalid' : ''}>
              手机号码
              <input value={form.phone} onChange={e => update('phone', e.target.value.replace(/[^\d\s]/g, ''))} placeholder="请输入常用手机号" inputMode="tel" maxLength={13} aria-invalid={phoneInvalid} />
              {phoneInvalid && <small className="partner-error">请输入有效的 11 位手机号码</small>}
            </label>
            <label>
              服务地区
              <div className="partner-city-select">
                <MapPin />
                <select value={serviceCity} onChange={event => setServiceCity(event.target.value)} aria-label="选择服务地区">
                  {serviceCities.map(city => <option key={city} value={city}>{city === '全国可接单' ? city : `${city}市`}</option>)}
                </select>
                <ChevronRight />
              </div>
            </label>
          </div>}

          {step === 2 && <div className="partner-form-section">
            <div className="partner-section-title"><BadgeCheck /><div><h2>选择你的服务技能</h2><p>可多选，后续还可以继续申请认证。</p></div></div>
            <div className="partner-skill-grid">{skills.map(skill => <button type="button" key={skill.id} className={form.skills.includes(skill.id) ? 'selected' : ''} onClick={() => toggleSkill(skill.id)}><span><strong>{skill.label}</strong><small>{skill.detail}</small></span><i>{form.skills.includes(skill.id) ? <Check /> : '+'}</i></button>)}</div>
            <label>联系方式补充（选填）<input value={form.wechat} onChange={e => update('wechat', e.target.value)} placeholder="微信号或其他方便联系的方式" /></label>
          </div>}

          {step === 3 && <div className="partner-form-section">
            <div className="partner-section-title"><FileCheck2 /><div><h2>确认并提交申请</h2><p>请确认下面信息真实有效。</p></div></div>
            <div className="partner-summary"><p><span>姓名</span><strong>{form.name}</strong></p><p><span>联系电话</span><strong>{form.phone}</strong></p><p><span>服务地区</span><strong>{serviceCity === '全国可接单' ? serviceCity : `${serviceCity}市`}</strong></p><p><span>身份证照片</span><strong>{identityFiles.front && identityFiles.back ? '正反面已上传' : '未完成'}</strong></p><p><span>个人展示照片</span><strong>{identityFiles.showcase ? '已上传' : '未完成'}</strong></p><p><span>申请技能</span><strong>{form.skills.map(id => skills.find(skill => skill.id === id)?.label).join('、')}</strong></p></div>
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
