import React, { useState } from 'react';
import { ArrowRight, ChevronDown, ChevronRight, FileEdit, MapPin, PawPrint, ShieldCheck, ShoppingCart, Sparkles, Stethoscope, Ticket, TramFront, Waves, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import ManualPublishForm from '../components/ManualPublishForm';

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
  services: cat.subServices
}));

type DirectoryService = (typeof categories)[number]['services'][number];

export default function Directory({ onNavigateToAgent }: DirectoryProps) {
  const { currentCity } = useAppContext();
  const [activeId, setActiveId] = useState(categories[0].id);
  const [directoryMode, setDirectoryMode] = useState<'classic' | 'weekly'>('classic');
  const [customPublishOpen, setCustomPublishOpen] = useState(false);
  const [detailService, setDetailService] = useState<DirectoryService | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const activeCategory = categories.find(category => category.id === activeId) || categories[0];
  const ActiveIcon = activeCategory.icon;
  const [cart, setCart] = useState<{ categoryId: string; items: DirectoryService[] }>({ categoryId: '', items: [] });
  const serviceImages = [
    'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=300&q=80',
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=300&q=80',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=300&q=80',
    'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=300&q=80',
    'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=300&q=80'
  ];
  const addToCart = (service: DirectoryService) => {
    if (cart.categoryId && cart.categoryId !== activeCategory.id) {
      alert('购物车一次只能选择一个一级分类的服务，请先清空当前购物车。');
      return;
    }
    setCart(prev => ({
      categoryId: activeCategory.id,
      items: prev.items.some(item => item.id === service.id) ? prev.items : [...prev.items, service]
    }));
  };
  const serviceImage = (index: number) => serviceImages[index % serviceImages.length];
  const servicePrice = (index: number) => [168, 120, 130, 200, 280][index % 5];
  const closeDetail = () => setDetailService(null);

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
        <div>
          <strong>不确定选哪项？</strong>
          <span>自定义发布任务，直接说清楚你的需求。</span>
        </div>
        <button type="button" onClick={() => setCustomPublishOpen(true)}>
          自定义发布任务
          <ArrowRight />
        </button>
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
              <article key={service.id} className="directory-service" onClick={() => setDetailService(service)}>
                <img src={serviceImage(index)} alt="" />
                <span>
                  <strong>{service.name}</strong>
                  <small>{service.desc}</small>
                  <em>#{service.tag}</em>
                  <b>¥{servicePrice(index)} 起</b>
                </span>
                <button type="button" className="directory-service-arrow" aria-label={`查看${service.name}详情`} onClick={event => { event.stopPropagation(); setDetailService(service); }}><ChevronRight /></button>
              </article>
            ))}
          </div>

          <button type="button" className="directory-ai-cta" onClick={() => setCustomPublishOpen(true)}>
            <Sparkles />
            <span>没有找到合适的服务？发布自定义任务</span>
            <ChevronRight />
          </button>
        </section>
      </main>
      {cart.items.length > 0 && (
        <button type="button" className="directory-cart" onClick={() => setCartOpen(true)}>
        <ShoppingCart /><b>{cart.items.length}</b><strong>¥{cart.items.reduce((sum, _, index) => sum + servicePrice(index), 0)}</strong><ChevronRight />
        </button>
      )}
      {detailService && (
        <div className="directory-modal-backdrop" onClick={closeDetail}>
          <section className="directory-detail-modal" role="dialog" aria-modal="true" onClick={event => event.stopPropagation()}>
            <header><h3>{detailService.name}</h3><button type="button" aria-label="关闭详情" onClick={closeDetail}><X /></button></header>
            <img src={serviceImage(activeCategory.services.findIndex(service => service.id === detailService.id))} alt="" />
            <p>{detailService.desc}</p>
            <div className="directory-detail-meta"><span>#{detailService.tag}</span><strong>平台参考价 ¥{servicePrice(activeCategory.services.findIndex(service => service.id === detailService.id))} 起</strong></div>
            <div className="directory-detail-actions">
              <button type="button" onClick={() => { addToCart(detailService); closeDetail(); }}>加入购物车</button>
              <button type="button" onClick={() => { addToCart(detailService); closeDetail(); onNavigateToAgent(); }}>立即下单<ArrowRight /></button>
            </div>
          </section>
        </div>
      )}
      {cartOpen && (
        <div className="directory-modal-backdrop" onClick={() => setCartOpen(false)}>
          <section className="directory-cart-modal" role="dialog" aria-modal="true" onClick={event => event.stopPropagation()}>
            <header><div><h3>服务购物车</h3><small>{activeCategory.heading} · {cart.items.length} 项</small></div><button type="button" aria-label="关闭购物车" onClick={() => setCartOpen(false)}><X /></button></header>
            <div className="directory-cart-items">{cart.items.map(item => <div key={item.id}><span>{item.name}</span><strong>已选</strong></div>)}</div>
            <div className="directory-cart-footer"><button type="button" onClick={() => { setCart({ categoryId: '', items: [] }); setCartOpen(false); }}>清空</button><button type="button" onClick={() => { setCartOpen(false); onNavigateToAgent(); }}>去下单<ArrowRight /></button></div>
          </section>
        </div>
      )}
      {customPublishOpen && (
        <div className="directory-modal-backdrop" onClick={() => setCustomPublishOpen(false)}>
          <section className="directory-custom-modal" role="dialog" aria-modal="true" onClick={event => event.stopPropagation()}>
            <header><div><h3>自定义发布任务</h3><small>把需求说清楚，平台帮你匹配合适的小伴</small></div><button type="button" aria-label="关闭自定义发布任务" onClick={() => setCustomPublishOpen(false)}><X /></button></header>
            <ManualPublishForm onPublishSuccess={() => {}} onNavigateToCommunity={onNavigateToAgent} onNavigateToProfile={onNavigateToAgent} />
          </section>
        </div>
      )}
    </div>
  );
}
