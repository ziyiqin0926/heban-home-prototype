import React, { useState } from 'react';
import {
  Users,
  Plus,
  MapPin,
  Sparkles,
  Search,
  CheckCircle2,
  ChevronDown,
  Trophy,
  Clock,
  Heart
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CommunityPost, EscortProfile } from '../types';
import CityLeaderboard from '../components/CityLeaderboard';
import EscortProfileModal from '../components/EscortProfileModal';
import CaseDetailModal from '../components/CaseDetailModal';
import './Community.css';

interface CommunityProps {
  onNavigateToAgent: () => void;
}

const CITIES = ['北京', '西安', '上海', '成都', '福州', '昆明', '乌鲁木齐'];
const CATEGORIES = ['全部', '医疗陪诊', '宠物陪伴', '同城陪伴'];

export default function Community({ onNavigateToAgent }: CommunityProps) {
  const {
    communityPosts,
    currentCity,
    setCurrentCity,
    setPrefilledPrompt
  } = useAppContext();
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [publishText, setPublishText] = useState('');
  const [publishSubmitted, setPublishSubmitted] = useState(false);

  const [activeMainTab, setActiveMainTab] = useState<'feed' | 'leaderboard'>('feed');
  const [activeCategory, setActiveCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [viewingEscortProfile, setViewingEscortProfile] = useState<EscortProfile | null>(null);

  // Filter posts by current city, category, and search query
  const filteredPosts = communityPosts.filter(post => {
    if (post.status === 'cancelled') return false;
    const matchesCity = post.city ? post.city === currentCity : true;
    const matchesCategory = activeCategory === '全部' || post.type === activeCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.publisherName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesCategory && matchesSearch;
  });

  const handlePostSimilar = (post: CommunityPost) => {
    const prompt = `我也需要在【${post.city || currentCity}】发布一个类似的【${post.type}】需求：地点在${post.location}，预计需要${post.estimatedDuration || '2-3小时'}，主要需求内容是：${post.description.slice(0, 45)}... 请帮我生成需求单`;
    setPrefilledPrompt(prompt);
    onNavigateToAgent();
  };

  const renderCaseCard = (post: CommunityPost) => {
    const fallbackImage = post.type === '医疗陪诊'
      ? 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80'
      : post.type === '宠物陪伴'
      ? 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=800&auto=format&fit=crop&q=80';

    const cardCover = post.coverImage || fallbackImage;

    return (
      <article
        key={post.id}
        onClick={() => setSelectedPost(post)}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') setSelectedPost(post);
        }}
        role="button"
        tabIndex={0}
        className="community-card"
      >
        <div className="community-card-media">
          <img
            src={cardCover}
            alt={post.title}
            className="community-card-image"
            referrerPolicy="no-referrer"
          />
          <span className="community-card-type">{post.type}</span>
          <span className="community-card-place"><MapPin size={11} />{post.district}</span>
        </div>
        <div className="community-card-body">
          <h3>
            {post.title}
          </h3>
          <p>{post.description}</p>
          <div className="community-card-meta">
            <div className="community-card-author">
              {post.publisherAvatar ? (
                <img
                  src={post.publisherAvatar}
                  alt={post.publisherName}
                  className="community-avatar"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="community-avatar community-avatar-fallback">
                  {post.publisherName.charAt(0)}
                </div>
              )}
              <span>{post.publisherName}</span>
            </div>
            <span className="community-card-stats"><Heart size={12} />{post.likesCount}<Clock size={12} />{post.publishedTimeAgo || '刚刚'}</span>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="community-page community-redesign min-h-full">
      <header className="community-topbar">
        <div className="community-topbar-row">
          <div className="community-brand">
            <span className="community-brand-icon"><Users size={18} /></span>
            <div><h1>同城社区</h1><p>真实服务动态 · 邻里互助见证</p></div>
          </div>
          <div className="relative">
            <button type="button" onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)} className="community-city-button">
              <MapPin size={14} /><span>{currentCity}市</span><ChevronDown size={14} />
            </button>
            {isCityDropdownOpen && (
              <div className="community-city-menu">
                <strong>切换当前城市</strong>
                {CITIES.map(city => (
                  <button key={city} type="button" onClick={() => { setCurrentCity(city); setIsCityDropdownOpen(false); }}>
                    <span>{city}市</span>{currentCity === city && <CheckCircle2 size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="community-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={activeMainTab === 'feed'} className={activeMainTab === 'feed' ? 'active' : ''} onClick={() => setActiveMainTab('feed')}>同城动态</button>
          <button type="button" role="tab" aria-selected={activeMainTab === 'leaderboard'} className={activeMainTab === 'leaderboard' ? 'active' : ''} onClick={() => setActiveMainTab('leaderboard')}><Trophy size={14} />同城排行榜</button>
        </div>
      </header>

      <main className="community-main">
        
        {/* LEADERBOARD VIEW */}
        {activeMainTab === 'leaderboard' ? (
          <CityLeaderboard
            currentCity={currentCity}
            onSelectEscort={(profile) => setViewingEscortProfile(profile)}
            onNavigateToAgent={onNavigateToAgent}
          />
        ) : (
          <div className="community-feed">
            <section className="community-pulse">
              <div><span className="community-pulse-kicker">附近动态</span><h2>{currentCity} · 真实陪伴正在发生</h2><p>看看邻里如何完成一次安心的陪伴服务</p></div>
              <div className="community-count"><strong>{filteredPosts.length}</strong><span>条动态</span></div>
            </section>

            <div className="community-search">
              <Search size={17} />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="搜索医院、服务主题或发布者" />
            </div>
            <div className="community-category-row">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={activeCategory === cat ? 'active' : ''}
                >
                  {cat}
                </button>
              ))}
            </div>

            {filteredPosts.length === 0 ? (
              <div className="community-empty">
                <Search size={26} />
                <h3>暂未搜索到相关动态</h3>
                <p>换个关键词或切换服务分类试试。</p>
                <button type="button" onClick={onNavigateToAgent}><Sparkles size={15} />发布陪护需求</button>
              </div>
            ) : (
              <div className="community-grid">{filteredPosts.map(post => renderCaseCard(post))}</div>
            )}
          </div>
        )}
      </main>

      <button type="button" aria-label="发布服务动态" title="发布服务动态" onClick={() => { setPublishSubmitted(false); setIsPublishOpen(true); }} className="community-publish-fab">
        <Plus className="h-6 w-6" aria-hidden="true" />
      </button>

      {isPublishOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/35 sm:items-center" onClick={() => setIsPublishOpen(false)}>
          <div className="w-full max-w-xl rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-black text-slate-900">发布服务动态</h2><button type="button" onClick={() => setIsPublishOpen(false)} aria-label="关闭" className="text-2xl text-slate-400">×</button></div>
            {publishSubmitted ? <div className="py-12 text-center text-sm font-bold text-blue-600">已提交平台审核，审核通过后将展示在同城社区</div> : <form onSubmit={e => { e.preventDefault(); setPublishSubmitted(true); }} className="space-y-3">
              <textarea required value={publishText} onChange={e => setPublishText(e.target.value)} rows={7} placeholder="分享你的服务经历、真实案例或服务心得..." className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 focus:bg-white" />
              <div className="grid grid-cols-3 gap-2">{[1, 2, 3].map(i => <div key={i} className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-slate-300 text-slate-400">＋ 图片</div>)}</div>
              <p className="text-xs text-slate-400">内容提交后由平台审核，审核通过后公开展示。</p><button type="submit" className="w-full rounded-xl bg-blue-600 py-3 text-sm font-black text-white">提交平台审核</button>
            </form>}
          </div>
        </div>
      )}
      {/* Case Details Modal */}
      {selectedPost && (
        <CaseDetailModal
          post={selectedPost}
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          onPostSimilar={handlePostSimilar}
        />
      )}

      {/* Escort Profile Modal */}
      {viewingEscortProfile && (
        <EscortProfileModal
          profile={viewingEscortProfile}
          isOpen={!!viewingEscortProfile}
          onClose={() => setViewingEscortProfile(null)}
        />
      )}
    </div>
  );
}

