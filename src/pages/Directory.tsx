import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FileEdit, MapPin, PawPrint, Plus, ShieldCheck, Sparkles, Stethoscope, Ticket, TramFront, Waves } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface DirectoryProps {
  onNavigateToAgent: () => void;
}

const categories = [
  { id: 'medical', title: '医陪', icon: Stethoscope, tone: 'blue', heading: '医陪服务', detail: '陪诊护工取药 · 专业持证', services: ['医院陪诊', '排队取号', '取药代办', '检查陪同'] },
  { id: 'pet', title: '宠陪', icon: PawPrint, tone: 'green', heading: '宠陪服务', detail: '各类宠物 · 上门照顾 · 安心陪伴', services: ['上门喂养', '遛宠陪玩', '短期寄养', '基础护理'] },
  { id: 'life', title: '生活便捷', icon: FileEdit, tone: 'red', heading: '生活便捷', detail: '即时代办 · 任务跑腿', services: ['代取代送', '排队办事', '物品搬运', '临时跑腿'] },
  { id: 'travel', title: '旅陪', icon: TramFront, tone: 'amber', heading: '旅陪服务', detail: '出行陪同 · 行程协助', services: ['旅途陪同', '车站接送', '行程协助', '城市向导'] },
  { id: 'tour', title: '游陪', icon: Waves, tone: 'violet', heading: '游陪服务', detail: '休闲出游 · 轻松陪伴', services: ['景点陪游', '活动陪同', '城市漫游', '兴趣搭子'] }
];

export default function Directory({ onNavigateToAgent }: DirectoryProps) {
  const { currentCity } = useAppContext();
  const [activeId, setActiveId] = useState(categories[0].id);
  const [directoryMode, setDirectoryMode] = useState<'classic' | 'weekly'>('classic');
  const activeCategory = categories.find(category => category.id === activeId) || categories[0];
  const ActiveIcon = activeCategory.icon;

  return (
    <div className="directory-page min-h-full">
      <section className="directory-promo">
        <button type="button" className="directory-location">
          <MapPin />
          <strong>{currentCity}市</strong>
          <span>当前服务城市</span>
          <ChevronDown />
        </button>
        <div className="directory-coupons">
          <div className="directory-coupon"><Ticket /><strong>新人券</strong><b>8折</b><span>首单可用</span><em>使用</em></div>
          <div className="directory-coupon"><Ticket /><strong>服务券</strong><b>9.9元</b><span>指定项目</span><em>使用</em></div>
          <button type="button" className="directory-more-coupon">更多优惠 <ChevronRight /></button>
        </div>
        <div className="directory-mode-tabs">
          <button type="button" className={directoryMode === 'classic' ? 'active' : ''} onClick={() => setDirectoryMode('classic')}>经典项目</button>
          <button type="button" className={directoryMode === 'weekly' ? 'active' : ''} onClick={() => setDirectoryMode('weekly')}>定期特惠活动</button>
        </div>
      </section>

      <div className="directory-note">
        <ShieldCheck />
        <span>一级分类浏览，暂不设置二级标签；点击服务即可让 AI 生成需求单。</span>
      </div>

      <main className="directory-browser">
        <aside className="directory-sidebar" aria-label="服务分类">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                type="button"
                className={`directory-category ${category.tone} ${activeId === category.id ? 'active' : ''}`}
                onClick={() => setActiveId(category.id)}
              >
                <Icon />
                <span>{category.title}</span>
              </button>
            );
          })}
        </aside>

        <section className="directory-results">
          <div className="directory-results-heading">
            <div>
              <span className={`directory-results-icon ${activeCategory.tone}`}><ActiveIcon /></span>
              <div>
                <h2>{activeCategory.heading}</h2>
                <p>{activeCategory.detail}</p>
              </div>
            </div>
            <small>{directoryMode === 'classic' ? '热门服务' : '本周精选'}</small>
          </div>

          <div className="directory-service-list">
            {activeCategory.services.map(service => (
              <button key={service} type="button" className="directory-service" onClick={onNavigateToAgent}>
                <span>
                  <strong>{service}</strong>
                <small>{directoryMode === 'classic' ? '和伴陪伴服务' : '本周优惠项目'}</small>
                </span>
                <Plus />
              </button>
            ))}
          </div>

          <button type="button" className="directory-ai-cta" onClick={onNavigateToAgent}>
            <Sparkles />
            <span>没有找到合适的服务？个性化定制点这~</span>
            <ChevronRight />
          </button>
        </section>
      </main>
    </div>
  );
}
