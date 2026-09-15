import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FileEdit, MapPin, PawPrint, Plus, ShieldCheck, Sparkles, Stethoscope, Ticket, TramFront, Waves } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface DirectoryProps {
  onNavigateToAgent: () => void;
}

import { PLATFORM_CATEGORIES } from '../data/categories';

const iconMap: Record<string, any> = {
  medical: Stethoscope,
  pet: PawPrint,
  life: FileEdit,
  travel: TramFront,
  tour: Waves
};

const categories = PLATFORM_CATEGORIES.map(cat => ({
  id: cat.id,
  title: cat.name,
  icon: iconMap[cat.id] || Stethoscope,
  tone: cat.tone,
  heading: cat.fullName,
  detail: cat.detail,
  services: cat.subServices.map(s => s.name)
}));

export default function Directory({ onNavigateToAgent }: DirectoryProps) {
  const { currentCity } = useAppContext();
  const [activeId, setActiveId] = useState(categories[0].id);
  const [directoryMode, setDirectoryMode] = useState<'classic' | 'weekly'>('classic');
  const activeCategory = categories.find(category => category.id === activeId) || categories[0];
  const ActiveIcon = activeCategory.icon;
  const [cart, setCart] = useState<{ categoryId: string; items: string[] }>({ categoryId: '', items: [] });
  const serviceImages = [
    'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=300&q=80',
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=300&q=80',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=300&q=80',
    'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=300&q=80',
    'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=300&q=80'
  ];
  const addToCart = (service: string) => {
    if (cart.categoryId && cart.categoryId !== activeCategory.id) {
      alert('购物车一次只能选择一个一级分类的服务，请先清空当前购物车。');
      return;
    }
    setCart(prev => ({
      categoryId: activeCategory.id,
      items: prev.items.includes(service) ? prev.items : [...prev.items, service]
    }));
  };

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
            {activeCategory.services.map((service, index) => (
              <article key={service} className="directory-service">
                <img src={serviceImages[index % serviceImages.length]} alt="" />
                <span>
                  <strong>{service}</strong>
                  <small>{directoryMode === 'classic' ? '和伴陪伴服务' : '本周优惠项目'}</small>
                  <b>¥{[168, 120, 130, 200, 280][index % 5]} 起</b>
                </span>
                <button type="button" aria-label={`加入购物车：${service}`} onClick={() => addToCart(service)}><Plus /></button>
              </article>
            ))}
          </div>

          <button type="button" className="directory-ai-cta" onClick={onNavigateToAgent}>
            <Sparkles />
            <span>没有找到合适的服务？个性化定制点这~</span>
            <ChevronRight />
          </button>
        </section>
      </main>
      {cart.items.length > 0 && (
        <button type="button" className="directory-cart" onClick={() => {
          if (confirm(`购物车内有 ${cart.items.length} 项服务，进入下单？`)) onNavigateToAgent();
        }}>
        <span>🛒</span><b>{cart.items.length}</b><strong>¥{cart.items.length * 168}</strong>
        </button>
      )}
    </div>
  );
}
