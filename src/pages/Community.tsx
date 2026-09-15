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
  Coins,
  Building2,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CommunityPost, EscortProfile } from '../types';
import CityLeaderboard from '../components/CityLeaderboard';
import EscortProfileModal from '../components/EscortProfileModal';
import CaseDetailModal from '../components/CaseDetailModal';

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

  // Split into left and right columns for natural Xiaohongshu waterfall distribution
  const leftColPosts = filteredPosts.filter((_, i) => i % 2 === 0);
  const rightColPosts = filteredPosts.filter((_, i) => i % 2 === 1);

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

    // Aspect ratio classes for responsive waterfall heights
    const aspectClass = post.aspectRatio === 'square'
      ? 'aspect-square'
      : post.aspectRatio === 'wide'
      ? 'aspect-[4/3]'
      : 'aspect-[3/4]';

    return (
      <div
        key={post.id}
        onClick={() => setSelectedPost(post)}
        className="group bg-white rounded-2xl md:rounded-3xl border border-slate-200/80 hover:border-blue-300 shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer flex flex-col"
      >
        {/* Cover Photo Container */}
        <div className={`relative w-full ${aspectClass} overflow-hidden bg-slate-100`}>
          <img
            src={cardCover}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />

          {/* Top Category Badge */}
          <div className="absolute top-2 left-2 z-10">
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold text-white bg-black/50 backdrop-blur-md border border-white/20 shadow-xs">
              {post.type}
            </span>
          </div>

          {/* City / District Tag */}
          <div className="absolute bottom-2 left-2 z-10">
            <span className="px-2 py-0.5 rounded-md text-[10px] text-white bg-black/40 backdrop-blur-xs font-medium">
              {post.district}
            </span>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-2.5 sm:p-3 flex flex-col flex-1 justify-between space-y-2">
          {/* Topic Title (订单主题) */}
          <h3 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
            {post.title}
          </h3>

          {/* Bottom Bar: Publisher Avatar + Username on Left, Published time on Right */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100/70 text-slate-500">
            {/* Publisher info */}
            <div className="flex items-center space-x-1.5 min-w-0 flex-1 pr-1">
              {post.publisherAvatar ? (
                <img
                  src={post.publisherAvatar}
                  alt={post.publisherName}
                  className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full object-cover border border-slate-200 flex-shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center flex-shrink-0">
                  {post.publisherName.charAt(0)}
                </div>
              )}
              <span className="text-[11px] sm:text-xs text-slate-600 font-medium truncate">
                {post.publisherName}
              </span>
            </div>

            <span className="text-[10px] text-slate-400 font-medium flex-shrink-0">
              {post.publishedTimeAgo || '刚刚'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="community-page min-h-full flex flex-col">
      {/* Top Header */}
      <header className="community-header page-header px-4 py-3.5 md:px-8 md:py-4 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="page-icon bg-[#10212b]">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h1 className="text-base md:text-lg font-bold text-slate-800">同城社区</h1>
                  
                  {/* City Switcher Pill */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                      className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold transition-colors cursor-pointer border border-blue-200/70"
                    >
                      <MapPin className="w-3 h-3 text-blue-600" />
                      <span>{currentCity}市</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    {isCityDropdownOpen && (
                      <div className="absolute left-0 mt-1.5 w-36 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                        <div className="px-3 py-1 text-[10px] font-bold text-slate-400 border-b border-slate-100">
                          切换当前城市
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {CITIES.map(city => (
                            <button
                              key={city}
                              type="button"
                              onClick={() => {
                                setCurrentCity(city);
                                setIsCityDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-blue-50 transition-colors cursor-pointer ${
                                currentCity === city ? 'font-bold text-blue-600 bg-blue-50/50' : 'text-slate-700'
                              }`}
                            >
                              <span>{city}市</span>
                              {currentCity === city && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-500">真实服务动态 · 邻里互助见证</p>
              </div>
            </div>
          </div>

          {/* Capsule Pill Tab Switcher */}
          <div className="flex items-center justify-center sm:justify-end">
            <div className="bg-slate-100/95 p-1 rounded-full inline-flex items-center shadow-inner border border-slate-200/80">
              <button
                type="button"
                onClick={() => setActiveMainTab('feed')}
                className={`px-5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeMainTab === 'feed'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                同城社区
              </button>
              <button
                type="button"
                onClick={() => setActiveMainTab('leaderboard')}
                className={`px-5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                  activeMainTab === 'leaderboard'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                <Trophy className={`w-3.5 h-3.5 ${activeMainTab === 'leaderboard' ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                <span>同城排行榜</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Community Content Body */}
      <div className="p-3.5 sm:p-5 md:p-7 flex-1 max-w-5xl mx-auto w-full pb-28 md:pb-12 space-y-5">
        
        {/* LEADERBOARD VIEW */}
        {activeMainTab === 'leaderboard' ? (
          <CityLeaderboard
            currentCity={currentCity}
            onSelectEscort={(profile) => setViewingEscortProfile(profile)}
            onNavigateToAgent={onNavigateToAgent}
          />
        ) : (
          /* CASE FEED VIEW (瀑布流展示) */
          <div className="space-y-4">
            <div className="community-intro">
              <div>
                <p className="community-eyebrow">CITY PULSE / {currentCity}市</p>
                <h2>看看身边正在发生的陪护需求</h2>
              </div>
              <div className="community-count">
                <strong>{filteredPosts.length}</strong>
                <span>条动态</span>
              </div>
            </div>

            {/* Search bar & AI Entry */}
            <div className="community-toolbar flex items-center gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索医院、案例主题或用户名..."
                  className="w-full pl-9 pr-3 py-2.5 bg-white hover:bg-slate-50/80 focus:bg-white border border-slate-200/80 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Categories Bar */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Waterfall Feed (Double Column Masonry) */}
            {filteredPosts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
                <div className="w-14 h-14 mx-auto bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">暂未搜索到符合条件的动态</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  您可以切换分类或更换关键词搜索，也可以通过 AI 智能发布您的陪护需求。
                </p>
                <button
                  type="button"
                  onClick={onNavigateToAgent}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-blue-700 cursor-pointer inline-flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>发布陪护需求</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4 items-start">
                {/* Left Waterfall Column */}
                <div className="flex flex-col gap-2.5 sm:gap-4">
                  {leftColPosts.map(post => renderCaseCard(post))}
                </div>

                {/* Right Waterfall Column */}
                <div className="flex flex-col gap-2.5 sm:gap-4">
                  {rightColPosts.map(post => renderCaseCard(post))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <button type="button" aria-label="发布服务动态" title="发布服务动态" onClick={() => { setPublishSubmitted(false); setIsPublishOpen(true); }} className="absolute bottom-24 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 p-0 text-white shadow-lg hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
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

