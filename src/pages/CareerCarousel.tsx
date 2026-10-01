import { useEffect, useState } from 'react';
import { Pause, Play } from 'lucide-react';

const careers = [
  { id: 'caregiver', title: '医陪陪诊', image: 'pony-caregiver.png', eyebrow: '和伴 · 医陪陪诊', lines: ['就医路上有伴', '每一步都安心'], detail: '门诊陪同 · 检查引导 · 医嘱记录' },
  { id: 'city-task', title: '同城特殊负责任务', image: 'pony-city-task.png', eyebrow: '和伴 · 情绪服务资源共享', lines: ['把需求说清楚', '把陪伴交给我们'], detail: '认证服务 · 真实响应 · 过程可追踪' },
  { id: 'pet-companion', title: '宠物陪伴', image: 'pony-pet-companion.png', eyebrow: '和伴 · 宠物陪伴', lines: ['你忙碌的日常', '有我陪它度过'], detail: '上门照料 · 日常遛宠 · 陪伴互动' },
];

export default function CareerCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(() => !document.hidden);
  const suspended = paused || hovered || focused;

  useEffect(() => {
    const updateVisibility = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => {
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (suspended || !visible) return;
    const timer = window.setInterval(() => setActive(index => (index + 1) % careers.length), 4000);
    return () => window.clearInterval(timer);
  }, [suspended, visible]);

  const togglePlayback = () => {
    if (suspended) {
      // An explicit play command takes precedence over existing hover/focus.
      setPaused(false);
      setHovered(false);
      setFocused(false);
    } else {
      setPaused(true);
    }
  };

  return <div className="np-career-carousel" role="region" aria-roledescription="轮播图" aria-label="小伴职业"
    data-playback={!visible ? 'hidden' : suspended ? 'paused' : 'playing'}
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)}
    onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}>
    <div className="np-career-viewport">
      {careers.map((career, index) => <figure key={career.id} className={`np-career-slide ${index === active ? 'is-active' : ''}`}
        aria-hidden={index !== active} data-career={career.id}>
        <figcaption className="np-career-copy"><span>{career.eyebrow}</span><h1>{career.lines[0]}<br />{career.lines[1]}</h1><p>{career.detail}</p></figcaption>
        <div className="np-career-art"><img src={`${import.meta.env.BASE_URL}ip/careers/${career.image}`} alt={`${career.title}职业小马`} width="512" height="512" draggable={false} /></div>
      </figure>)}
    </div>
    <div className="np-career-controls">
      {careers.map((career, index) => <button key={career.id} type="button" className="np-career-dot"
        aria-label={`查看${career.title}`} aria-pressed={active === index} title={career.title} onClick={() => setActive(index)}><span /></button>)}
      <button type="button" className="np-career-toggle" aria-label={suspended ? '播放职业轮播' : '暂停职业轮播'}
        title={suspended ? '播放职业轮播' : '暂停职业轮播'} onClick={togglePlayback}>
        {suspended ? <Play size={14} /> : <Pause size={14} />}
      </button>
    </div>
  </div>;
}
