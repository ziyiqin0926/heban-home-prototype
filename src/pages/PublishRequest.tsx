import React, { FormEvent, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarClock, CheckCircle2, ChevronRight, MapPin, Mic, Search, Send, Share2, SlidersHorizontal, Sparkles, UserRound } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getDateValueMonthsLater, getUpcomingDates, servicePeriods } from './publishRequestSchedule';
import './PublishRequest.css';

const serviceTypes = [
  { id: 'medical', label: '医疗陪诊', detail: '就医陪同、检查引导', tone: 'blue', keywords: ['医院', '陪诊', '看病', '检查', '取药'] },
  { id: 'pet', label: '宠物陪伴', detail: '喂养、遛宠、日常照看', tone: 'green', keywords: ['宠物', '遛狗', '遛宠', '喂养', '猫', '狗'] },
  { id: 'life', label: '同城陪伴', detail: '跑腿、办事、出行陪同', tone: 'gold', keywords: ['跑腿', '代取', '代送', '办事', '出行', '排队'] },
];

const localDateValue = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const normalizePhone = (value: string) => value.replace(/\D/g, '').slice(0, 11);
const isValidPhone = (value: string) => /^1[3-9]\d{9}$/.test(value);
const customType = { id: 'custom', label: '自定义订单', detail: '未归类需求，补充信息后人工匹配', tone: 'custom' };
const eventTemplates = [
  {
    label: '陪父母看病',
    query: '10月4日 上午10:00，陪妈妈到北京协和医院东单院区门诊楼看病，帮忙取号、陪同检查、记录医嘱并陪她回家。',
    time: '10月4日 上午 10:00',
    location: '北京协和医院东单院区门诊楼',
    person: '妈妈',
    dayOffset: 0,
  },
  {
    label: '出差上门喂猫',
    query: '10月5日 下午18:30，到北京市朝阳区望京花园为出差中的我上门喂猫，换水添粮、清理猫砂并拍照反馈。',
    time: '10月5日 下午 18:30',
    location: '北京市朝阳区望京花园',
    person: '宠物',
    dayOffset: 1,
  },
];
const extractEventDetails = (text: string) => {
  const result: { time?: string; location?: string; person?: string } = {};
  if (/(今天|今日).*(下午|午后).*(14|2点|两点)/.test(text)) result.time = '今天 下午 14:00';
  else if (/(今天|今日).*(下午|午后).*(16|4点|四点)/.test(text)) result.time = '今天 下午 16:30';
  else if (/(今天|今日).*(上午|早上).*(10|十点)/.test(text)) result.time = '今天 上午 10:00';
  else if (/明天.*(下午|午后).*(14|2点|两点)/.test(text)) result.time = '明天 下午 14:00';
  else if (/明天.*(上午|早上)/.test(text)) result.time = '明天 上午 09:00';
  else if (/(尽快|马上|现在)/.test(text)) result.time = '尽快出发（1小时内）';
  const locationMatch = text.match(/(?:去|到|在)([^，。,.!?！？\s]{2,24}(?:医院|小区|街道|学校|车站|机场|商场|公司|家))/);
  if (locationMatch) result.location = locationMatch[1];
  const personMatch = text.match(/(妈妈|母亲|爸爸|父亲|爷爷|奶奶|孩子|女儿|儿子|狗狗|猫咪|宠物)/);
  if (personMatch) result.person = personMatch[1];
  return result;
};

interface PublishRequestProps {
  onBack: () => void;
  onNavigateToCommunity: () => void;
  onNavigateToProfile?: () => void;
  embedded?: boolean;
}

interface SpeechRecognitionLike {
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

export default function PublishRequest({ onBack, onNavigateToCommunity, onNavigateToProfile, embedded = false }: PublishRequestProps) {
  const { addOrder, addOfficialCommunityPost, currentCity, userPhone, userAddress, orders } = useAppContext();
  const recentSchedule = orders.find(order => order.status === 'pending' || order.status === 'accepted');
  const commonAddress = [userAddress.city, userAddress.district, userAddress.street, userAddress.detail].filter(Boolean).join('');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [query, setQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => localDateValue(new Date()));
  const [selectedPeriod, setSelectedPeriod] = useState<(typeof servicePeriods)[number]['id']>('morning');
  const [timeSlot, setTimeSlot] = useState('10:00');
  const [time, setTime] = useState('今天 上午 10:00');
  const [location, setLocation] = useState(recentSchedule?.location || commonAddress);
  const [serviceTarget, setServiceTarget] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState(userPhone);
  const [contactPhoneError, setContactPhoneError] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [listening, setListening] = useState(false);
  const [timeTouched, setTimeTouched] = useState(false);
  const [locationTouched, setLocationTouched] = useState(false);
  const [personTouched, setPersonTouched] = useState(false);
  const [profilePickerOpen, setProfilePickerOpen] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState('');
  const [formError, setFormError] = useState('');

  const inferredType = useMemo(() => {
    const text = query.trim();
    return text ? serviceTypes.find(item => item.keywords.some(keyword => text.includes(keyword))) : undefined;
  }, [query]);
  const effectiveType = inferredType || customType;
  const marketRange = effectiveType.id === 'medical' ? [120, 220] : effectiveType.id === 'pet' ? [80, 160] : effectiveType.id === 'life' ? [60, 140] : [80, 200];
  const dateOptions = useMemo(() => getUpcomingDates(), []);
  const maxSelectableDate = useMemo(() => getDateValueMonthsLater(new Date(), 3), []);
  const selectedDateOption = dateOptions.find(option => option.value === selectedDate);
  const selectedPeriodOption = servicePeriods.find(period => period.id === selectedPeriod) || servicePeriods[0];

  const updateQuery = (value: string) => {
    setQuery(value);
    const extracted = extractEventDetails(value);
    if (extracted.time && !timeTouched) {
      const offset = /后天/.test(extracted.time) ? 2 : /明天/.test(extracted.time) ? 1 : 0;
      const period = /夜|晚/.test(extracted.time) ? 'night' : /下午|午后/.test(extracted.time) ? 'afternoon' : 'morning';
      const slot = extracted.time.match(/\d{1,2}:\d{2}/)?.[0] || servicePeriods.find(item => item.id === period)?.slots[0] || timeSlot;
      updateSchedule(localDateValue(new Date(Date.now() + offset * 86400000)), period, slot);
    }
    if (extracted.location && !locationTouched) setLocation(extracted.location);
    if (extracted.person && !personTouched) setServiceTarget(extracted.person);
  };
  const applyEventTemplate = (template: typeof eventTemplates[number]) => {
    const templateDate = getUpcomingDates(new Date(), template.dayOffset + 1)[template.dayOffset]?.value || selectedDate;
    const [, month, day] = templateDate.split('-').map(Number);
    const dynamicQuery = template.query.replace(/\d{1,2}月\d{1,2}日/, `${month}月${day}日`);
    setQuery(dynamicQuery);
    const period = /夜|晚|18:|19:|20:|21:/.test(template.time) ? 'night' : /下午|13:|14:|15:|16:|17:/.test(template.time) ? 'afternoon' : 'morning';
    const slot = template.time.match(/\d{1,2}:\d{2}/)?.[0] || servicePeriods.find(item => item.id === period)?.slots[0] || timeSlot;
    updateSchedule(templateDate, period, slot);
    setLocation(template.location);
    setServiceTarget(template.person);
    setLocationTouched(true);
    setPersonTouched(true);
    setFormError('');
  };
  const updateSchedule = (nextDate: string, nextPeriod: typeof selectedPeriod, nextTimeSlot: string) => {
    const dateOption = dateOptions.find(option => option.value === nextDate);
    const dateLabel = dateOption?.label || dateOption?.dateLabel || nextDate;
    const periodLabel = servicePeriods.find(period => period.id === nextPeriod)?.label || '上午';
    setSelectedDate(nextDate);
    setSelectedPeriod(nextPeriod);
    setTimeSlot(nextTimeSlot);
    setTime(`${dateLabel} ${periodLabel} ${nextTimeSlot}`);
    setTimeTouched(true);
  };
  const toggleVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setListening(false);
      return;
    }
    const speechWindow = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setFormError('当前浏览器暂不支持语音输入，请改用文字填写。');
      return;
    }
    const recognition = new Recognition();
    if (!recognition) return;
    recognition.lang = 'zh-CN';
    recognition.onresult = event => {
      const transcript = Array.from(event.results).map(result => result[0]?.transcript || '').join('');
      if (transcript) updateQuery(`${query}${query ? '，' : ''}${transcript}`);
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
    };
    recognition.onerror = () => {
      recognitionRef.current = null;
      setListening(false);
      setFormError('语音没有识别成功，请再试一次或改用文字填写。');
    };
    recognitionRef.current = recognition;
    setFormError('');
    setListening(true);
    recognition.start();
  };

  const commit = () => {
    const title = query.trim() || `${effectiveType.label}服务需求`;
    const privateDescription = [
      `联系人：${contactName.trim()}（${contactPhone.trim()}）`,
      serviceTarget.trim() && `服务对象：${serviceTarget.trim()}`,
      description.trim(),
    ].filter(Boolean).join('\n');
    const communityDescription = [
      serviceTarget.trim() && `服务对象：${serviceTarget.trim()}`,
      description.trim(),
    ].filter(Boolean).join('\n');
    const draft = {
      title,
      type: effectiveType.label,
      city: currentCity,
      time,
      location: location.trim(),
      phone: contactPhone.trim(),
      description: privateDescription,
      estimatedDuration: '待确认',
      ...(budget.trim() ? { budget: `¥${budget.trim()}` } : {}),
      tips: ['订单已进入社区广场匹配', '请保持电话畅通，等待服务人员响应'],
    };
    const newOrder = addOrder(draft);
    setSubmittedOrderId(newOrder.id);
    addOfficialCommunityPost({
      title,
      type: effectiveType.label,
      city: currentCity,
      district: '玉林片区',
      location: location.trim(),
      time,
      description: communityDescription,
      publisherName: '和伴用户',
      status: 'pending',
      likesCount: 0,
      isMine: true,
      estimatedDuration: '待确认',
      ...(budget.trim() ? { budget: `¥${budget.trim()}` } : {}),
      tags: [effectiveType.label, '待匹配'],
      aspectRatio: 'wide',
    });
    setReviewing(false);
    setSubmitted(true);
  };
  const shareOrder = async () => {
    const shareText = `和伴服务订单：${title}｜${time}｜${location}｜${serviceTarget}`;
    const shareHint = '分享至朋友圈和群，进入高曝光率高速匹配通道。';
    try {
      if (navigator.share) {
        await navigator.share({ title: '和伴服务订单', text: `${shareText}\n${shareHint}` });
        setFormError(shareHint);
      } else {
        await navigator.clipboard?.writeText(shareText);
        setFormError(`${shareHint} 订单信息已复制。`);
      }
    } catch {
      setFormError('分享已取消，订单仍保留在匹配大厅。');
    }
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setFormError('');
    if (!query.trim()) {
      setFormError('请先用一句话写清楚要做什么，系统才能帮你归类。');
      return;
    }
    if (!location.trim() || !contactName.trim() || !contactPhone.trim()) {
      setFormError('请补充服务地点、联系人称呼和联系电话。');
      return;
    }
    if (!isValidPhone(contactPhone.trim())) {
      const message = '联系电话需为11位手机号，请核对后再提交。';
      setContactPhoneError(message);
      setFormError(message);
      return;
    }
    setReviewing(true);
  };
  const applyProfilePerson = (person: string) => {
    setServiceTarget(person);
    setPersonTouched(true);
    setProfilePickerOpen(false);
  };
  const applyProfileSchedule = () => {
    if (!recentSchedule) return;
    const dateOffset = /后天/.test(recentSchedule.time) ? 2 : /明天/.test(recentSchedule.time) ? 1 : 0;
    const profileDate = localDateValue(new Date(Date.now() + dateOffset * 86400000));
    const matchedTime = recentSchedule.time.match(/(\d{1,2}:\d{2})/);
    const profileSlot = matchedTime?.[1] || timeSlot;
    const profilePeriod = /夜|晚|18:|19:|20:|21:/.test(recentSchedule.time) ? 'night' : /下午|13:|14:|15:|16:|17:/.test(recentSchedule.time) ? 'afternoon' : 'morning';
    updateSchedule(profileDate, profilePeriod, profileSlot);
    setLocation(recentSchedule.location);
    setLocationTouched(true);
    setProfilePickerOpen(false);
  };
  const applyProfileAddress = () => {
    setLocation(commonAddress);
    setLocationTouched(true);
    setProfilePickerOpen(false);
  };
  const handleDateChange = (nextDate: string) => updateSchedule(nextDate, selectedPeriod, timeSlot);
  const handlePeriodChange = (nextPeriod: typeof selectedPeriod) => {
    const nextPeriodOption = servicePeriods.find(period => period.id === nextPeriod);
    updateSchedule(selectedDate, nextPeriod, nextPeriodOption?.slots[0] || timeSlot);
  };
  const handleTimeChange = (nextTimeSlot: string) => updateSchedule(selectedDate, selectedPeriod, nextTimeSlot);

  const title = query.trim() || `${effectiveType.label}服务需求`;
  const submittedOrder = submittedOrderId ? orders.find(order => order.id === submittedOrderId) : undefined;
  const orderStatusIndex = submittedOrder?.status === 'completed' ? 3 : submittedOrder?.status === 'accepted' ? 1 : 0;
  const orderStatusCopy = submittedOrder?.status === 'completed'
    ? '服务订单已完成。'
    : submittedOrder?.status === 'accepted'
    ? '已有小伴师傅接单，订单进入履约准备。'
    : '订单已发布，正在匹配合适的小伴师傅。';
  const orderSteps = ['已发布', '已接单', '履约中', '已完成'];
  const receiptRows = [
    ['事件', title],
    ['期望时间', time],
    ...(serviceTarget.trim() ? [['服务对象', serviceTarget.trim()]] : []),
    ['联系人', contactName || '待补充'],
    ['联系电话', contactPhone || '待补充'],
    ['服务地点', location || '待补充'],
    ...(budget.trim() ? [['预算参考', `¥${budget.trim()}`]] : []),
  ];

  if (submitted) {
    return (
      <div className={`publish-request${embedded ? ' embedded' : ''}`}>
        <header className="publish-request-header">
          <button type="button" aria-label="返回首页" onClick={onBack}><ArrowLeft size={18} /></button>
          <strong>发布需求</strong>
          <span />
        </header>
        <main className="publish-result">
          <div className="publish-result-icon"><CheckCircle2 size={32} /></div>
          <h1>需求已进入匹配</h1>
          <p>订单已推送到社区广场，系统会根据事件内容、时间、地点和人物自动匹配合适的小伴师傅。</p>
          <div className="publish-order-status" aria-label="订单进程">
            <div className="publish-order-status-track">
              {orderSteps.map((step, index) => <div key={step} className={`publish-order-step${index <= orderStatusIndex ? ' complete' : ''}${index === orderStatusIndex ? ' current' : ''}`}><span>{index < orderStatusIndex ? <CheckCircle2 size={13} /> : index + 1}</span><small>{step}</small></div>)}
            </div>
            <p>{orderStatusCopy}</p>
          </div>
          <div className="publish-result-card">
            <span>已生成服务订单</span>
            <strong>{title}</strong>
            <small>{time} · {location} · {serviceTarget}</small>
            {description.trim() && <p>{description.trim()}</p>}
            {budget.trim() && <b>预算参考 ¥{budget.trim()}</b>}
          </div>
          {formError && <p className="publish-share-message" role="status">{formError}</p>}
          <button type="button" className="publish-secondary" onClick={shareOrder}><Share2 size={15} />分享订单</button>
          <button type="button" className="publish-primary" onClick={onNavigateToCommunity}>去社区查看匹配<ArrowRight size={16} /></button>
          <button type="button" className="publish-secondary" onClick={() => setSubmitted(false)}>调整需求再发一条</button>
        </main>
      </div>
    );
  }

  if (reviewing) {
    return (
      <div className={`publish-request${embedded ? ' embedded' : ''}`}>
        <header className="publish-request-header">
          <button type="button" aria-label="返回修改" onClick={() => setReviewing(false)}><ArrowLeft size={18} /></button>
          <div><strong>确认订单小票</strong><small>确认无误后，再推送到社区匹配</small></div>
          <span className="publish-city"><MapPin size={13} />{currentCity}</span>
        </header>
        <div className="publish-review-backdrop" role="dialog" aria-modal="true" aria-label="确认订单小票">
          <main className="publish-review">
          <div className="publish-receipt">
            <div className="publish-receipt-head"><span>和伴 · 服务订单预览</span><b>待确认</b></div>
            <h1>{title}</h1>
            <div className="publish-receipt-list">{receiptRows.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
            {description.trim() && <div className="publish-receipt-note"><span>备注需求</span><p>{description.trim()}</p></div>}
          </div>
          <p className="publish-review-tip"><Sparkles size={13} />确认后将生成订单并推送到社区，等待合适的小伴师傅响应。</p>
          <button type="button" className="publish-primary" onClick={commit}><Send size={15} />确认并推送到社区</button>
          <button type="button" className="publish-secondary" onClick={() => setReviewing(false)}>返回修改</button>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={`publish-request${embedded ? ' embedded' : ''}`}>
      <header className="publish-request-header">
        <button type="button" aria-label="返回首页" onClick={onBack}><ArrowLeft size={18} /></button>
        <div><strong>发布需求</strong><small>把需要说清楚，等待合适的小伴师傅</small></div>
        <span className="publish-city"><MapPin size={13} />{currentCity}</span>
      </header>
      <form className="publish-request-form" onSubmit={submit}>
        <section className="publish-event">
          <div className="publish-event-topline"><Search size={16} /><button type="button" className={`publish-voice-button${listening ? ' listening' : ''}`} onClick={toggleVoiceInput} aria-label={listening ? '停止语音输入' : '语音输入'}><Mic size={15} />{listening ? '正在听' : '语音输入'}</button></div>
          <div className="publish-event-copy"><strong>事件</strong><small>描述具体需要的陪伴，把时间、地点、人物写清楚</small></div>
          <textarea required value={query} onChange={event => updateQuery(event.target.value)} placeholder="例如：10月4日 10:00，陪妈妈到北京协和医院东单院区门诊楼看病" aria-label="事件描述" />
          <div className="publish-template-row" aria-label="事件模板">
            <span>快速套用</span>
            {eventTemplates.map(template => <button type="button" key={template.label} onClick={() => applyEventTemplate(template)}>{template.label}<ChevronRight size={12} /></button>)}
          </div>
        </section>

        <section className="publish-section">
          <div className="publish-section-title">
            <span>01</span>
            <div><strong>时间、地点和人物</strong><small>事件内容会自动提取，个人档案可补充其他人信息</small></div>
            <button type="button" className="publish-profile-entry" onClick={() => setProfilePickerOpen(open => !open)} aria-expanded={profilePickerOpen}><UserRound size={12} />进入档案<ChevronRight size={12} /></button>
            {onNavigateToProfile && <button type="button" className="publish-profile-direct" onClick={onNavigateToProfile}><UserRound size={12} />我的档案</button>}
          </div>
          {profilePickerOpen && <div className="publish-profile-picker">
            <div><strong>从个人档案带入</strong><button type="button" onClick={() => setProfilePickerOpen(false)} aria-label="关闭档案选择">×</button></div>
            <button type="button" onClick={() => applyProfilePerson('家人')}>家人档案</button>
            <button type="button" onClick={() => applyProfilePerson('宠物')}>宠物档案</button>
            <button type="button" onClick={applyProfileAddress}>常用地址</button>
            {recentSchedule && <button type="button" onClick={applyProfileSchedule}>最近档期</button>}
          </div>}
          <div className="publish-field-row">
            <div className="publish-schedule-field">
              <span className="publish-field-label"><CalendarClock size={15} />期望时间</span>
              <div className="publish-date-strip" role="group" aria-label="选择服务日期">
                {dateOptions.slice(0, 3).map(option => <button type="button" key={option.value} className={selectedDate === option.value ? 'active' : ''} aria-pressed={selectedDate === option.value} onClick={() => handleDateChange(option.value)}><strong>{option.label || option.weekday}</strong><small>{option.dateLabel}</small></button>)}
                <label className={`publish-more-date${dateOptions.slice(0, 3).some(option => option.value === selectedDate) ? '' : ' active'}`} aria-label="选择未来三个月内的日期"><CalendarClock size={15} /><span>{dateOptions.slice(0, 3).some(option => option.value === selectedDate) ? '日历' : selectedDate.slice(5).replace('-', '/')}</span><input type="date" min={dateOptions[0]?.value} max={maxSelectableDate} value={dateOptions.slice(0, 3).some(option => option.value === selectedDate) ? '' : selectedDate} onChange={event => event.target.value && handleDateChange(event.target.value)} /></label>
              </div>
              <div className="publish-period-tabs" role="group" aria-label="选择服务时段">{servicePeriods.map(period => <button type="button" key={period.id} className={selectedPeriod === period.id ? 'active' : ''} aria-pressed={selectedPeriod === period.id} onClick={() => handlePeriodChange(period.id)}>{period.label}<small>{period.id === 'night' ? '非工作时段' : '正常工作时段'}</small></button>)}</div>
              <div className="publish-time-slots" role="group" aria-label="选择具体时间">{selectedPeriodOption.slots.map(slot => <button type="button" key={slot} className={timeSlot === slot ? 'active' : ''} aria-pressed={timeSlot === slot} onClick={() => handleTimeChange(slot)}>{slot}</button>)}</div>
            </div>
            <label><span className="publish-field-label"><MapPin size={15} />服务地点</span><input required value={location} onChange={event => { setLocationTouched(true); setLocation(event.target.value); }} placeholder="输入地点" /></label>
            <label><span className="publish-field-label"><Sparkles size={15} />服务对象<small>选填</small></span><input value={serviceTarget} onChange={event => { setPersonTouched(true); setServiceTarget(event.target.value); }} placeholder="例如：家人姓名、宠物昵称" /></label>
            <div className="publish-contact-fields">
              <label><span className="publish-field-label"><UserRound size={15} />联系人昵称</span><input required autoComplete="name" value={contactName} onChange={event => setContactName(event.target.value)} placeholder="填写便于联系的称呼" /></label>
              <label><span className="publish-field-label"><MapPin size={15} />联系电话</span><input required type="tel" inputMode="numeric" autoComplete="tel" maxLength={11} aria-invalid={Boolean(contactPhoneError)} className={contactPhoneError ? 'publish-input-invalid' : ''} value={contactPhone} onChange={event => { const value = normalizePhone(event.target.value); setContactPhone(value); setContactPhoneError(value && !isValidPhone(value) ? '请输入11位手机号' : ''); }} onBlur={() => setContactPhoneError(contactPhone && !isValidPhone(contactPhone) ? '请输入11位手机号' : '')} placeholder="请输入11位手机号" />{contactPhoneError && <small className="publish-input-error">{contactPhoneError}</small>}</label>
            </div>
            <label className="publish-budget-field">
              <span className="publish-field-label"><SlidersHorizontal size={15} />预算参考<small>可不填</small></span>
              <div className="publish-budget-panel">
                <div className="publish-budget-summary"><span>体验参考区间</span><strong>¥{marketRange[0]}–¥{marketRange[1]}</strong></div>
                <div className="publish-budget-input-row"><input aria-label="调整预算参考" type="range" min={marketRange[0]} max={marketRange[1]} step="10" value={budget || marketRange[0]} onChange={event => setBudget(event.target.value)} /><div className="publish-budget-number"><small>我的预算</small><b>¥</b><input aria-label="预算金额" inputMode="numeric" value={budget} onChange={event => setBudget(event.target.value.replace(/[^\d]/g, ''))} placeholder="不填写" /></div></div>
                <small className="publish-market-hint">当前为体验参考范围，正式市场价待服务价格规则接入后展示</small>
              </div>
            </label>
          </div>
        </section>

        <section className="publish-section">
          <div className="publish-section-title"><span>02</span><div><strong>特殊备注</strong><small>补充必须提前知道的情况</small></div></div>
          <textarea value={description} onChange={event => setDescription(event.target.value)} placeholder="例如：行动不便需要轮椅，或希望服务人员提前十分钟到达……" />
        </section>

        {formError && <p className="publish-form-error" role="alert">{formError}</p>}
        <button type="submit" className="publish-submit"><Send size={17} />生成订单，推送匹配大厅<ArrowRight size={16} /></button>
        <p className="publish-note"><Sparkles size={13} />提交后会先生成订单小票，确认无误再推送社区</p>
      </form>
    </div>
  );
}
