import React, { FormEvent, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarClock, CheckCircle2, MapPin, Search, Send, Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import './PublishRequest.css';

const serviceTypes = [
  { id: '医疗陪诊', label: '医疗陪诊', detail: '就医陪同、检查引导', tone: 'blue' },
  { id: '宠物陪伴', label: '宠物陪伴', detail: '喂养、遛宠、日常照看', tone: 'green' },
  { id: '同城陪伴', label: '同城陪伴', detail: '跑腿、办事、出行陪同', tone: 'gold' },
];

const timeOptions = ['今天 上午 10:00', '今天 下午 14:00', '今天 下午 16:30', '明天 上午 09:00', '明天 下午 14:00', '尽快出发（1小时内）'];

interface PublishRequestProps {
  onBack: () => void;
  onNavigateToCommunity: () => void;
}

export default function PublishRequest({ onBack, onNavigateToCommunity }: PublishRequestProps) {
  const { addOrder, addOfficialCommunityPost, currentCity, userPhone } = useAppContext();
  const [query, setQuery] = useState('');
  const [type, setType] = useState(serviceTypes[0].id);
  const [time, setTime] = useState(timeOptions[0]);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState(150);
  const [submitted, setSubmitted] = useState(false);

  const selectedType = serviceTypes.find(item => item.id === type) || serviceTypes[0];
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!location.trim() || !description.trim()) return;

    const title = query.trim() || `${selectedType.label}服务需求`;
    const draft = {
      title,
      type: selectedType.id,
      city: currentCity,
      time,
      location: location.trim(),
      phone: userPhone,
      description: description.trim(),
      estimatedDuration: '待确认',
      budget: `¥${budget}`,
      tips: ['订单已进入社区广场匹配', '请保持电话畅通，等待服务人员响应'],
    };
    addOrder(draft);
    addOfficialCommunityPost({
      title,
      type: selectedType.id,
      city: currentCity,
      district: '玉林片区',
      location: location.trim(),
      time,
      description: description.trim(),
      publisherName: '和伴用户',
      status: 'pending',
      likesCount: 0,
      isMine: true,
      estimatedDuration: '待确认',
      budget: `¥${budget}`,
      tags: [selectedType.label, '待匹配'],
      aspectRatio: 'wide',
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="publish-request">
        <header className="publish-request-header">
          <button type="button" aria-label="返回首页" onClick={onBack}><ArrowLeft size={18} /></button>
          <strong>发布需求</strong>
          <span />
        </header>
        <main className="publish-result">
          <div className="publish-result-icon"><CheckCircle2 size={32} /></div>
          <h1>需求已进入匹配</h1>
          <p>订单已推送到社区广场，系统会根据服务类型、时间和预算反馈合适的小伴师傅。</p>
          <div className="publish-result-card">
            <span>{selectedType.label}</span>
            <strong>{query.trim() || `${selectedType.label}服务需求`}</strong>
            <small>{time} · {location}</small>
            <b>预算 ¥{budget}</b>
          </div>
          <button type="button" className="publish-primary" onClick={onNavigateToCommunity}>去社区查看匹配<ArrowRight size={16} /></button>
          <button type="button" className="publish-secondary" onClick={() => setSubmitted(false)}>继续调整需求</button>
        </main>
      </div>
    );
  }

  return (
    <div className="publish-request">
      <header className="publish-request-header">
        <button type="button" aria-label="返回首页" onClick={onBack}><ArrowLeft size={18} /></button>
        <div><strong>发布需求</strong><small>把需要说清楚，等待合适的小伴师傅</small></div>
        <span className="publish-city"><MapPin size={13} />{currentCity}</span>
      </header>
      <form className="publish-request-form" onSubmit={submit}>
        <div className="publish-search">
          <Search size={16} />
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索服务关键词，如：陪诊、遛狗、取药" />
        </div>

        <section className="publish-section">
          <div className="publish-section-title"><span>01</span><div><strong>选择服务类型</strong><small>先选一个方向，方便系统匹配</small></div></div>
          <div className="publish-type-grid">
            {serviceTypes.map(item => (
              <button type="button" key={item.id} className={`publish-type ${item.tone} ${type === item.id ? 'active' : ''}`} onClick={() => setType(item.id)}>
                <strong>{item.label}</strong><small>{item.detail}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="publish-section">
          <div className="publish-section-title"><span>02</span><div><strong>期望时间与地点</strong><small>必填，便于小伴师傅确认距离</small></div></div>
          <div className="publish-field-row">
            <label><CalendarClock size={15} />期望时间<select required value={time} onChange={event => setTime(event.target.value)}>{timeOptions.map(item => <option key={item}>{item}</option>)}</select></label>
            <label><MapPin size={15} />服务地点<input required value={location} onChange={event => setLocation(event.target.value)} placeholder="输入地点" /></label>
          </div>
        </section>

        <section className="publish-section">
          <div className="publish-section-title"><span>03</span><div><strong>自定义需求</strong><small>描述越清楚，匹配越准确</small></div></div>
          <textarea required value={description} onChange={event => setDescription(event.target.value)} placeholder="例如：需要陪同老人去医院做检查，协助取号、陪同检查并记录医嘱……" />
        </section>

        <section className="publish-section publish-budget">
          <div className="publish-section-title"><span>04</span><div><strong>预算调整</strong><small>可在平台参考区间内灵活调整</small></div><b>¥{budget}</b></div>
          <input aria-label="预算金额" type="range" min="50" max="500" step="10" value={budget} onChange={event => setBudget(Number(event.target.value))} />
          <div className="publish-range-label"><span>¥50 起</span><span>参考 ¥150</span><span>¥500</span></div>
        </section>

        <button type="submit" className="publish-submit"><Send size={17} />提交并推送到社区<ArrowRight size={16} /></button>
        <p className="publish-note"><Sparkles size={13} />系统会按关键词、服务时间、距离和预算匹配服务人员</p>
      </form>
    </div>
  );
}
