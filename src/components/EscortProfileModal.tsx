import React, { useState } from 'react';
import {
  X,
  Phone,
  ShieldCheck,
  Award,
  Calendar,
  MapPin,
  Clock,
  Heart,
  CheckCircle2,
  Copy,
  Check,
  Star,
  UserCheck,
  FileCheck,
  Camera,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { EscortProfile } from '../types';

interface EscortProfileModalProps {
  profile: EscortProfile;
  isOpen: boolean;
  onClose: () => void;
}

export default function EscortProfileModal({ profile, isOpen, onClose }: EscortProfileModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'certificates' | 'photos' | 'reviews'>('profile');
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; caption: string } | null>(null);

  if (!isOpen) return null;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(profile.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto border border-slate-100">
        
        {/* Sticky Top Header Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-700">陪护师认证档案主页</span>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-full border border-emerald-200/60">
              平台核验认证
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto">
          
          {/* Hero Banner with Avatar & Basic Info */}
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-5 sm:p-7 relative overflow-hidden">
            {/* Background glowing shapes */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              
              {/* Large Avatar Photo with Verification Badge */}
              <div className="relative flex-shrink-0 mx-auto sm:mx-0">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl object-cover ring-4 ring-white/20 shadow-xl"
                />
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full ring-2 ring-slate-900 shadow-md" title="已通过平台权威实名认证">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              {/* Text Info */}
              <div className="flex-1 text-center sm:text-left space-y-1.5 w-full">
                <div className="flex items-center justify-center sm:justify-start space-x-2.5 flex-wrap gap-y-1">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    {profile.name}
                  </h2>
                  <span className="bg-white/15 text-blue-100 text-xs px-2.5 py-0.5 rounded-full font-medium backdrop-blur-xs">
                    {profile.gender} · {profile.age}岁
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] px-2 py-0.5 rounded-full font-bold">
                    实名持证
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-blue-100 font-medium leading-snug">
                  {profile.title}
                </p>

                <p className="text-[11px] sm:text-xs text-slate-300 flex items-center justify-center sm:justify-start pt-0.5">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-blue-400 flex-shrink-0" />
                  <span>常驻服务：{profile.serviceArea}</span>
                </p>
              </div>
            </div>

            {/* Metric Stats Banner */}
            <div className="grid grid-cols-4 gap-2 mt-5 pt-4 border-t border-white/10 text-center">
              <div className="p-2 rounded-xl bg-white/5 backdrop-blur-xs">
                <div className="text-amber-400 font-bold text-sm sm:text-base flex items-center justify-center">
                  <Star className="w-3.5 h-3.5 mr-0.5 fill-amber-400 text-amber-400" />
                  {profile.rating}
                </div>
                <div className="text-[10px] text-slate-300 mt-0.5">综合评分</div>
              </div>

              <div className="p-2 rounded-xl bg-white/5 backdrop-blur-xs">
                <div className="text-white font-bold text-sm sm:text-base">
                  {profile.serviceCount}+
                </div>
                <div className="text-[10px] text-slate-300 mt-0.5">服务单数</div>
              </div>

              <div className="p-2 rounded-xl bg-white/5 backdrop-blur-xs">
                <div className="text-emerald-400 font-bold text-sm sm:text-base">
                  {profile.praiseRate}
                </div>
                <div className="text-[10px] text-slate-300 mt-0.5">好评率</div>
              </div>

              <div className="p-2 rounded-xl bg-white/5 backdrop-blur-xs">
                <div className="text-blue-300 font-bold text-sm sm:text-base">
                  {profile.yearsOfExperience} 年
                </div>
                <div className="text-[10px] text-slate-300 mt-0.5">从业经验</div>
              </div>
            </div>
          </div>

          {/* Verification Badge Grid (安全认证承诺) */}
          <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-100">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-800">公安实名核验</div>
                  <div className="text-[10px] text-slate-400">二代身份证比对</div>
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center space-x-2">
                <Award className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-800">专业资质持证</div>
                  <div className="text-[10px] text-slate-400">官方证书核验</div>
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-800">健康体检合格</div>
                  <div className="text-[10px] text-slate-400">持有效健康证</div>
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-800">无犯罪背调</div>
                  <div className="text-[10px] text-slate-400">平台安全审核</div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white border-b border-slate-100 px-4 sm:px-6 sticky top-0 z-20 shadow-2xs">
            <div className="flex space-x-3 sm:space-x-6 text-xs sm:text-sm font-bold overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`py-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'profile'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                简介与专长
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('certificates')}
                className={`py-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'certificates'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>资格证书</span>
                <span className="px-1.5 py-0.2 bg-blue-50 text-blue-600 text-[10px] rounded-full">
                  {profile.certificates.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('photos')}
                className={`py-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'photos'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>工作风采</span>
                <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 text-[10px] rounded-full">
                  {profile.workPhotos.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className={`py-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'reviews'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>雇主评价</span>
                <span className="px-1.5 py-0.2 bg-amber-50 text-amber-700 text-[10px] rounded-full font-bold">
                  {profile.reviews.length}条
                </span>
              </button>
            </div>
          </div>

          {/* Tab 1: Profile & Specialties & Bio */}
          {activeTab === 'profile' && (
            <div className="p-4 sm:p-6 space-y-6 animate-in fade-in duration-150 text-slate-700">
              
              {/* Bio Description */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
                  <h3 className="text-sm font-bold text-slate-900">个人自我介绍</h3>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs sm:text-sm leading-relaxed whitespace-pre-line text-slate-700">
                  {profile.bio}
                </div>
              </div>

              {/* Specialties & Skills */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-4 bg-emerald-600 rounded-full"></div>
                  <h3 className="text-sm font-bold text-slate-900">服务专长与擅长场景</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.specialties.map((spec) => (
                    <span
                      key={spec}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-xl border border-blue-200/70 flex items-center space-x-1.5"
                    >
                      <Sparkles className="w-3 h-3 text-blue-500" />
                      <span>{spec}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Service Commitments */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-4 bg-amber-500 rounded-full"></div>
                  <h3 className="text-sm font-bold text-slate-900">服务承诺与履约守则</h3>
                </div>
                <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200/70 space-y-2 text-xs sm:text-sm">
                  {profile.serviceCommitment.map((comm, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{comm}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Card in Profile */}
              <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200/70 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-3 text-left w-full sm:w-auto">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">陪护师认证联络电话</div>
                    <div className="text-sm font-mono font-bold text-blue-700">{profile.phone}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copied ? '已复制' : '复制号码'}</span>
                  </button>

                  <a
                    href={`tel:${profile.phone}`}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center space-x-1 shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>立即拨打</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Official Certificates */}
          {activeTab === 'certificates' && (
            <div className="p-4 sm:p-6 space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center">
                  <Award className="w-4 h-4 mr-1.5 text-blue-600" />
                  平台已查验认证资质证书 ({profile.certificates.length})
                </h3>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                  全部有效
                </span>
              </div>

              <div className="space-y-3">
                {profile.certificates.map((cert, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-blue-300 transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Award className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                            {cert.name}
                          </h4>
                          {cert.verified && (
                            <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded flex items-center">
                              <Check className="w-2.5 h-2.5 mr-0.5" />
                              已核验
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          颁发机构：{cert.issuer}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          有效期/取得时间：{cert.date}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 text-[11px] text-slate-500 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>以上全部从业人员资质及健康证明均已由「和伴」平台安全合规团队人工原件核验备案。</span>
              </div>
            </div>
          )}

          {/* Tab 3: Work Photos & Moments */}
          {activeTab === 'photos' && (
            <div className="p-4 sm:p-6 space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center">
                  <Camera className="w-4 h-4 mr-1.5 text-blue-600" />
                  陪护师工作风采与服务实拍
                </h3>
                <span className="text-xs text-slate-400">共 {profile.workPhotos.length} 张实拍</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.workPhotos.map((photo, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedPhoto(photo)}
                    className="group relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-2xs bg-slate-100 cursor-pointer hover:shadow-md transition-all"
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3 text-white">
                      <p className="text-xs font-medium leading-snug line-clamp-2">
                        {photo.caption}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Photo Lightbox Popup */}
              {selectedPhoto && (
                <div
                  className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
                  onClick={() => setSelectedPhoto(null)}
                >
                  <div className="max-w-xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
                    <img
                      src={selectedPhoto.url}
                      alt={selectedPhoto.caption}
                      className="w-full h-auto max-h-[70vh] object-cover rounded-xl"
                    />
                    <div className="p-3 flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-800">{selectedPhoto.caption}</p>
                      <button
                        type="button"
                        onClick={() => setSelectedPhoto(null)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                      >
                        关闭
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Employer Reviews */}
          {activeTab === 'reviews' && (
            <div className="p-4 sm:p-6 space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold text-slate-900">{profile.rating}</div>
                  <div>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <div className="text-[10px] text-slate-400">好评率 {profile.praiseRate}</div>
                  </div>
                </div>

                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                  {profile.serviceCount} 笔真实服务评价
                </span>
              </div>

              {/* Review Cards */}
              <div className="space-y-3">
                {profile.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2 text-slate-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        {rev.avatar ? (
                          <img
                            src={rev.avatar}
                            alt={rev.author}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-600">
                            {rev.author[0]}
                          </div>
                        )}
                        <div>
                          <div className="text-xs font-bold text-slate-800">{rev.author}</div>
                          <div className="text-[10px] text-slate-400">{rev.serviceType}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex text-amber-400 justify-end">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400">{rev.date}</span>
                      </div>
                    </div>

                    <p className="text-xs leading-relaxed text-slate-600 pt-1">
                      {rev.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Floating Action Bar */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 sticky bottom-0 z-30">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            返回订单详情
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCopyPhone}
              className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors flex items-center space-x-1 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copied ? '已复制' : '复制手机号'}</span>
            </button>

            <a
              href={`tel:${profile.phone}`}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-md transition-all flex items-center space-x-1.5"
            >
              <Phone className="w-4 h-4" />
              <span>立即电话联系陪护师</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
