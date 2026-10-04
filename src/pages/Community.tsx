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
  Heart,
  Share2,
  Sparkle,
  BadgeCheck,
  Gift,
  PenLine
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
  const [publishTitle, setPublishTitle] = useState('');
  const [publishType, setPublishType] = useState(CATEGORIES[1]);
  const [publishMode, setPublishMode] = useState<'story' | 'card'>('story');
  const [publishSubmitted, setPublishSubmitted] = useState(false);
  const [localPosts, setLocalPosts] = useState<CommunityPost[]>([]);
  const [shareNotice, setShareNotice] = useState('');

  const [activeMainTab, setActiveMainTab] = useState<'feed' | 'leaderboard'>('feed');
  const [activeCategory, setActiveCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [viewingEscortProfile, setViewingEscortProfile] = useState<EscortProfile | null>(null);

  // Filter posts by current city, category, and search query
  const allPosts = [...localPosts, ...communityPosts];
  const filteredPosts = allPosts.filter(post => {
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

  const showShareNotice = (message: string) => {
    setShareNotice(message);
    window.setTimeout(() => setShareNotice(''), 2600);
  };

  const handleSharePost = async (post: CommunityPost) => {
    const shareText = `${post.title}｜${post.description.slice(0, 55)}...`;
    try {
      await navigator.clipboard?.writeText(shareText);
    } catch {
      // Clipboard permission is optional in the local prototype.
    }
    showShareNotice('分享内容已生成，分享奖励 +3 积分');
  };

  const openPublish = (mode: 'story' | 'card' = 'story') => {
    setPublishMode(mode);
    setPublishSubmitted(false);
    setPublishTitle('');
    setPublishText('');
    setIsPublishOpen(true);
  };

  const submitPublish = (event: React.FormEvent) => {
    event.preventDefault();
    const title = publishTitle.trim() || (publishMode === 'card' ? '我的陪伴服务名片' : '记录一次值得分享的陪伴');
    const newPost: CommunityPost = {
      id: `local-${Date.now()}`,
      title,
      type: publishType,
      city: currentCity,
      district: `${currentCity} · 同城`,
      location: '和伴同城社区',
      time: '本周',
      description: publishText.trim(),
      publisherName: '和伴用户',
      publishedTimeAgo: '刚刚',
      status: 'completed',
      likesCount: 0,
      isMine: true,
      tags: [publishMode === 'card' ? '服务名片' : '服务心得', '可分享'],
      aspectRatio: 'square'
    };
    setLocalPosts(prev => [newPost, ...prev]);
    setPublishSubmitted(true);
    showShareNotice('内容已生成，分享后可获得 +3 积分');
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
        className={`community-card${post.isOrder ? ' community-card-order' : ''}`}
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
          {post.isOrder && <span className="community-order-badge">我的待匹配订单</span>}
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
            <div className="community-card-actions">
              <button type="button" onClick={event => { event.stopPropagation(); handlePostSimilar(post); }}><PenLine size={12} />转发同类需求</button>
              <button type="button" onClick={event => { event.stopPropagation(); handleSharePost(post); }}><Share2 size={12} />分享名片</button>
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
              <div><span className="community-pulse-kicker">附近动态 · 每日更新</span><h2>{currentCity} · 真实陪伴正在发生</h2><p>案例、心得和官方消息，都从这里开始流动</p></div>
              <div className="community-count"><strong>{filteredPosts.length}</strong><span>条动态</span></div>
            </section>

            <section className="community-creator-hub" aria-label="社区创作中心">
              <div className="community-creator-heading">
                <span className="community-creator-icon"><Sparkle size={16} /></span>
                <div><strong>把一次服务，变成你的名片</strong><small>分享真实案例、服务心得和可复用经验</small></div>
                <span className="community-reward-badge"><Gift size={12} />分享 +3</span>
              </div>
              <div className="community-creator-actions">
                <button type="button" onClick={() => openPublish('story')}><PenLine size={14} />发布服务故事</button>
                <button type="button" onClick={() => openPublish('card')}><BadgeCheck size={14} />制作服务名片</button>
                <button type="button" onClick={() => showShareNotice('分享你的服务内容，获得 +3 积分')}><Share2 size={14} />分享得积分</button>
              </div>
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

      <button type="button" aria-label="发布服务动态" title="发布服务动态" onClick={() => openPublish('story')} className="community-publish-fab">
        <Plus className="h-6 w-6" aria-hidden="true" />
      </button>

      {isPublishOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/35 sm:items-center" onClick={() => setIsPublishOpen(false)}>
          <div className="w-full max-w-xl rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-black text-slate-900">发布服务动态</h2><button type="button" onClick={() => setIsPublishOpen(false)} aria-label="关闭" className="text-2xl text-slate-400">×</button></div>
            {publishSubmitted ? <div className="community-publish-success"><BadgeCheck size={26} /><strong>{publishMode === 'card' ? '服务名片已生成' : '服务故事已发布'}</strong><span>内容已加入本地社区预览，分享后可获得 +3 积分。</span><button type="button" onClick={() => setIsPublishOpen(false)}>回到社区</button></div> : <form onSubmit={submitPublish} className="community-publish-form">
              <div className="community-publish-tabs"><button type="button" className={publishMode === 'story' ? 'active' : ''} onClick={() => setPublishMode('story')}>服务故事</button><button type="button" className={publishMode === 'card' ? 'active' : ''} onClick={() => setPublishMode('card')}>服务名片</button></div>
              <input required value={publishTitle} onChange={e => setPublishTitle(e.target.value)} placeholder={publishMode === 'card' ? '例如：林师傅 · 医院陪诊与医嘱记录' : '给这次服务起个标题'} />
              <select value={publishType} onChange={e => setPublishType(e.target.value)}>{CATEGORIES.slice(1).map(category => <option key={category}>{category}</option>)}</select>
              <textarea required value={publishText} onChange={e => setPublishText(e.target.value)} rows={6} placeholder={publishMode === 'card' ? '写下你的技能、服务范围和客户最在意的细节...' : '分享你的服务经历、真实案例或服务心得...'} />
              <p>发布后可生成可转发内容，分享给同城用户并积累信任。</p><button type="submit">生成并发布<Share2 size={15} /></button>
            </form>}
          </div>
        </div>
      )}
      {shareNotice && <div className="community-share-notice" role="status"><Gift size={15} />{shareNotice}</div>}
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

