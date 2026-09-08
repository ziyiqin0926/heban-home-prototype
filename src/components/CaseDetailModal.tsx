import React, { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  Coins,
  Timer,
  ShieldCheck,
  Star,
  CheckCircle2,
  Sparkles,
  Building2,
  Camera,
  Maximize2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { CommunityPost } from '../types';

interface CaseDetailModalProps {
  post: CommunityPost | null;
  isOpen: boolean;
  onClose: () => void;
  onPostSimilar: (post: CommunityPost) => void;
}

const FALLBACK_SERVICE_IMAGES: Record<string, string[]> = {
  '医疗陪诊': [
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80'
  ],
  '宠物陪伴': [
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&auto=format&fit=crop&q=80'
  ],
  '同城陪伴': [
    'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&auto=format&fit=crop&q=80'
  ],
  '长者助医': [
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80'
  ],
  '代办跑腿': [
    'https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&auto=format&fit=crop&q=80'
  ]
};

function getImagesForPost(post: CommunityPost): string[] {
  if (post.images && post.images.length > 0) {
    return post.images;
  }
  if (post.coverImage) {
    return [post.coverImage];
  }
  if (FALLBACK_SERVICE_IMAGES[post.type]) {
    return FALLBACK_SERVICE_IMAGES[post.type];
  }
  return FALLBACK_SERVICE_IMAGES['医疗陪诊'];
}

export default function CaseDetailModal({
  post,
  isOpen,
  onClose,
  onPostSimilar,
}: CaseDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!isOpen || !post) return null;

  const galleryImages = getImagesForPost(post);
  const currentImg = galleryImages[activeImageIndex] || galleryImages[0];

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex(prev => (prev > 0 ? prev - 1 : galleryImages.length - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex(prev => (prev < galleryImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="bg-white rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          {/* Top Floating Action Bar */}
          <div className="px-4 py-3 bg-white/95 backdrop-blur-md border-b border-slate-100 flex items-center justify-between z-10 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200/60">
                {post.type}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                订单案例详情
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
            
            {/* Main Interactive Service Photo / Gallery */}
            <div className="space-y-2">
              <div 
                onClick={() => setIsLightboxOpen(true)}
                className="relative rounded-2xl overflow-hidden shadow-xs bg-slate-900 aspect-4/3 sm:aspect-16/10 w-full flex items-center justify-center cursor-pointer group"
                title="点击查看高清原图"
              >
                <img
                  src={currentImg}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
                  referrerPolicy="no-referrer"
                />

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                {/* Top Badges */}
                <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5">
                  <span className="bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                    <Camera className="w-3 h-3 text-blue-400" />
                    <span>实拍照片 {activeImageIndex + 1}/{galleryImages.length}</span>
                  </span>
                </div>

                <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>真实服务见证</span>
                </div>

                {/* Zoom Hint at bottom right */}
                <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-2 py-0.8 rounded-lg flex items-center space-x-1 opacity-90 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3 h-3" />
                  <span>查看大图</span>
                </div>

                {/* Switch arrows if multiple images */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer z-10"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer z-10"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Multi-Photo Thumbnails Strip */}
              {galleryImages.length > 1 && (
                <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-12 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-blue-600 ring-2 ring-blue-500/30 scale-102'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`缩略图 ${idx + 1}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Publisher Profile Bar */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
              <div className="flex items-center space-x-3">
                {post.publisherAvatar ? (
                  <img
                    src={post.publisherAvatar}
                    alt={post.publisherName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                    {post.publisherName.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-sm text-slate-800">
                      {post.publisherName}
                    </span>
                    <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.2 rounded-md">
                      实名已核验
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-1">
                    <span>{post.city || '同城'} · {post.district}</span>
                    <span>·</span>
                    <span>{post.publishedTimeAgo}</span>
                  </div>
                </div>
              </div>

              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/60 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>服务已完成</span>
              </span>
            </div>

            {/* Topic Title (订单主题) */}
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {post.title}
            </h2>

            {/* Key Order Parameters Grid */}
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-3.5 rounded-2xl border border-slate-200/80 space-y-2 text-xs text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-2 text-blue-600 flex-shrink-0" />
                  <span>服务时间：<strong className="text-slate-900">{post.time}</strong></span>
                </div>
                <div className="flex items-center">
                  <Coins className="w-3.5 h-3.5 mr-2 text-amber-500 flex-shrink-0" />
                  <span>服务费用：<strong className="text-amber-600 font-bold">{post.budget || '150 元'}</strong></span>
                </div>
                <div className="flex items-center">
                  <Timer className="w-3.5 h-3.5 mr-2 text-blue-600 flex-shrink-0" />
                  <span>预估耗时：<strong className="text-slate-900">{post.estimatedDuration || '2 小时'}</strong></span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-2 text-blue-600 flex-shrink-0" />
                  <span>服务区域：<strong className="text-slate-900">{post.city || '同城'} · {post.district}</strong></span>
                </div>
              </div>

              <div className="flex items-start pt-1 border-t border-slate-200/60">
                <Building2 className="w-3.5 h-3.5 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>就诊/服务地点：<strong className="text-slate-900">{post.location}</strong></span>
              </div>
            </div>

            {/* Matched Companion / Escort */}
            {post.escortName && (
              <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  {post.escortAvatar ? (
                    <img
                      src={post.escortAvatar}
                      alt={post.escortName}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                      师
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                      <span>承接陪护：{post.escortName}</span>
                      <span className="text-amber-500 flex items-center font-bold text-[11px]">
                        <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                        {post.escortRating || '4.99'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">已通过资质实名认证 · 专属服务保障</div>
                  </div>
                </div>
                <span className="text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg font-bold">
                  金牌履约
                </span>
              </div>
            )}

            {/* Full Case Notes / Diary (陪护全过程记录) */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-800 flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-blue-600" />
                陪护服务全过程记录
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/70">
                {post.description}
              </p>
            </div>

            {/* Client Feedback Review */}
            {post.serviceReview && (
              <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200/60 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 flex items-center">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 mr-1" />
                    客户服务评价
                  </span>
                  <span className="text-amber-600 font-bold">⭐⭐⭐⭐⭐ 5.0 满意</span>
                </div>
                <p className="text-slate-700 text-xs leading-relaxed italic">
                  “{post.serviceReview}”
                </p>
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {post.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Trust guarantee banner */}
            <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 text-[11px] text-blue-800 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>所有医疗陪诊与同城服务均支持全程实名认证保障与专业规范指引。</span>
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-2xl text-xs sm:text-sm font-bold border border-slate-200 shadow-2xs transition-all cursor-pointer"
            >
              关闭
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onPostSimilar(post);
              }}
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>我也要发类似需求</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen HD Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-between p-4 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="w-full flex items-center justify-between text-white py-2 z-10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold">{post.title}</span>
              <span className="text-xs text-slate-400">({activeImageIndex + 1}/{galleryImages.length})</span>
            </div>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative max-w-4xl max-h-[80vh] w-full flex items-center justify-center flex-1 my-auto" onClick={e => e.stopPropagation()}>
            <img
              src={currentImg}
              alt={post.title}
              className="max-w-full max-h-[78vh] object-contain rounded-xl shadow-2xl"
              referrerPolicy="no-referrer"
            />

            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-2 md:-left-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-2 md:-right-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="flex items-center space-x-2 py-3 overflow-x-auto z-10" onClick={e => e.stopPropagation()}>
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    activeImageIndex === idx ? 'border-blue-500 scale-105 ring-2 ring-blue-400/50' : 'border-transparent opacity-50'
                  }`}
                >
                  <img src={img} alt={`缩略图 ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
