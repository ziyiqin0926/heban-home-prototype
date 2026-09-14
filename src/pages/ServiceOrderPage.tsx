import { useAppContext } from '../context/AppContext';
import React, { useState } from 'react';
import {
  ArrowLeft,
  UserCheck,
  Trophy,
  Headphones,
  MapPin,
  Phone,
  Send,
  Check,
  ChevronRight,
  ShieldCheck,
  Star,
  Volume2,
  Clock,
  Calendar,
  Sparkles,
  Ticket,
  AlertCircle,
  Heart,
  Share2,
  ThumbsUp,
  MessageCircle,
  X,
  Award,
  Zap
} from 'lucide-react';
import { EscortProfile } from '../types';
import { getEscortsByCity } from '../data/escortProfiles';

interface ServiceOrderPageProps {
  type: 'medical' | 'pet';
  currentCity: string;
  onBack: () => void;
  onCompleteOrder: (orderInfo: any) => void;
  onNavigateToCommunity?: () => void;
}

export default function ServiceOrderPage({
  type,
  currentCity,
  onBack,
  onCompleteOrder,
  onNavigateToCommunity
}: ServiceOrderPageProps) {
  const { toggleFavoriteEscort, isEscortFavorite } = useAppContext();
  const isMedical = type === 'medical';
  const allEscorts = getEscortsByCity(currentCity || '北京');
  const filteredEscorts = allEscorts.filter(e =>
    isMedical ? e.category === '医疗陪诊' || !e.category : e.category === '宠物陪伴'
  );

  const [activeSort, setActiveSort] = useState<'rating' | 'orders' | 'all'>('rating');
  const [genderFilter, setGenderFilter] = useState<'all' | '女' | '男'>('all');
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<'list' | 'rank'>('list');

  const [selectedEscort, setSelectedEscort] = useState<EscortProfile | null>(null);
  const [viewingEscortProfile, setViewingEscortProfile] = useState<EscortProfile | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // 家庭档案库
  const familyProfiles = isMedical
    ? [
        {
          name: '母亲 (张阿姨)',
          age: '68岁',
          phone: '138****6621',
          condition: '母亲年过七旬腿脚不便，需要推轮椅进出；需协助排队拿心电图和化验单，陪同看诊并记录医生嘱咐。',
          defaultVenue: '北京协和医院门诊大楼一楼大厅'
        },
        {
          name: '父亲 (李大爷)',
          age: '72岁',
          phone: '139****1124',
          condition: '慢病随访与白内障术前检查，需提早取号排队协助散瞳。',
          defaultVenue: '同仁医院眼科门诊部'
        },
        {
          name: '本人',
          age: '29岁',
          phone: '136****8890',
          condition: '常规身体体检与专科就诊复查全流程陪同。',
          defaultVenue: '朝阳医院门诊楼'
        }
      ]
    : [
        {
          name: '布偶猫 (雪球)',
          age: '2岁',
          phone: '138****6621',
          condition: '备好主粮与冻干，换净水、清洁猫砂盆并互动梳毛，拍摄1分钟全流程视频发回。',
          defaultVenue: '朝阳区 望京金茂府'
        },
        {
          name: '柯基犬 (皮皮)',
          age: '3岁',
          phone: '138****6621',
          condition: '定时上门遛狗30分钟，牵紧牵引绳，避开大型犬打闹，备好拾便袋。',
          defaultVenue: '海淀区 中关村软件园'
        }
      ];

  // 快捷地点标签
  const quickLocations = isMedical
    ? ['市第一人民医院门诊大厅', '省中医院门诊大楼', '市妇幼保健院', '华西医院门诊部', '家中上门接送']
    : ['家中上门喂养', '同城宠物医院', '社区宠物公园', '接送至宠物洗护店', '指定寄养交接点'];

  // 快捷报酬金额档位
  const rewardOptions = isMedical
    ? ['50元', '60元', '80元', '100元', '150元', '200元', '300元', '面议 / 线下协商']
    : ['30元', '50元', '68元', '88元', '120元', '150元', '面议 / 线下协商'];

  // 完整标准下单表单（融合参考图字段）
  const [orderForm, setOrderForm] = useState({
    title: isMedical ? '就医门诊复查全程陪同与引导' : '上门宠物喂养与日常照料陪伴',
    subCategory: isMedical ? '门诊陪同' : '上门喂护',
    venue: familyProfiles[0].defaultVenue,
    serviceDate: '今天 上午 09:00',
    duration: '2.5 小时',
    reward: isMedical ? '300 元' : '68 元',
    phone: familyProfiles[0].phone,
    targetName: familyProfiles[0].name,
    details: familyProfiles[0].condition,
    useCoupon: true
  });

  // 一键迁入家庭档案
  const handleApplyProfile = (profile: any) => {
    setOrderForm(prev => ({
      ...prev,
      targetName: profile.name,
      phone: profile.phone,
      venue: profile.defaultVenue,
      details: profile.condition
    }));
  };

  const handleSelectEscortOrder = (escort: EscortProfile) => {
    setSelectedEscort(escort);
    setIsOrderModalOpen(true);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderSuccess(true);
    setTimeout(() => {
      setOrderSuccess(false);
      setIsOrderModalOpen(false);
      setIsDispatchModalOpen(false);
      onCompleteOrder({
        title: (selectedEscort ? `指定 ${selectedEscort.name} · ` : '人工派单 · ') + orderForm.title,
        venue: orderForm.venue,
        time: orderForm.serviceDate,
        target: orderForm.targetName,
        phone: orderForm.phone,
        requirements: orderForm.details,
        reward: orderForm.reward,
        escort: selectedEscort
      });
    }, 1200);
  };

  const displayedEscorts = [...filteredEscorts]
    .filter(e => (genderFilter === 'all' ? true : e.gender === genderFilter))
    .sort((a, b) => {
      if (activeSort === 'rating') return parseFloat(b.rating) - parseFloat(a.rating);
      if (activeSort === 'orders') return (b.serviceCount || 0) - (a.serviceCount || 0);
      return 0;
    });

  return (
    <div className="min-h-full bg-slate-50 flex flex-col pb-20 animate-fadeIn">
      {/* 顶部标题栏 */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-base text-slate-800">
          {isMedical ? '健康医陪 · 服务点单' : '宠物陪伴 · 金牌上门照顾'}
        </h1>
        <div className="flex items-center space-x-1 text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full font-medium">
          <MapPin className="w-3.5 h-3.5" />
          <span>{currentCity}</span>
        </div>
      </header>

      {/* 顶部紧凑型24小时排行榜窗口（直接联动社区排行榜） */}
      <section className="px-3 pt-2.5 pb-1 bg-white border-b border-slate-100">
        <div
          onClick={() => onNavigateToCommunity ? onNavigateToCommunity() : alert("前往社区查看完整24小时排行榜")}
          className="py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-blue-500/10 border border-amber-200/90 flex items-center justify-between hover:border-amber-400 hover:shadow-2xs transition-all active:scale-[0.99] cursor-pointer"
        >
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white shadow-2xs flex-shrink-0">
              <Trophy className="w-4 h-4 text-yellow-200" />
            </div>
            <div className="flex items-center space-x-2 truncate">
              <span className="font-extrabold text-xs text-slate-900">
                {isMedical ? "医陪24H口碑榜" : "宠陪24H口碑榜"}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500 text-white font-bold tracking-tight flex-shrink-0">
                实时更新
              </span>
              <span className="text-[11px] text-slate-500 truncate hidden xs:inline">
                100%持证认证 · 近24h服务满意度
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-0.5 text-xs text-amber-700 font-bold flex-shrink-0 ml-2">
            <span>社区榜单</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </section>

      {/* 筛选与排序工具栏 */}
      <div className="bg-white px-4 py-2.5 border-b border-slate-100 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setActiveSort('rating')}
            className={`font-medium transition-colors ${activeSort === 'rating' ? 'text-blue-600 font-bold' : ''}`}
          >
            好评最高
          </button>
          <button
            type="button"
            onClick={() => setActiveSort('orders')}
            className={`font-medium transition-colors ${activeSort === 'orders' ? 'text-blue-600 font-bold' : ''}`}
          >
            服务单量
          </button>
          <button
            type="button"
            onClick={() => setGenderFilter(genderFilter === '女' ? 'all' : '女')}
            className={`px-2 py-0.5 rounded-full border transition-all ${genderFilter === '女' ? 'border-pink-300 bg-pink-50 text-pink-700 font-bold' : 'border-slate-200 text-slate-500'}`}
          >
            女服务师
          </button>
          <button
            type="button"
            onClick={() => setGenderFilter(genderFilter === '男' ? 'all' : '男')}
            className={`px-2 py-0.5 rounded-full border transition-all ${genderFilter === '男' ? 'border-blue-300 bg-blue-50 text-blue-700 font-bold' : 'border-slate-200 text-slate-500'}`}
          >
            男服务师
          </button>
        </div>
        <div className="flex items-center space-x-1 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>官方实名认证</span>
        </div>
      </div>

      {/* 服务师点单列表 */}
      <main className="p-3 space-y-3">
        {/* 师傅列表第一项：手动填写需求 人工派单 */}
        <article
          onClick={(e) => {
            e.stopPropagation();
            setSelectedEscort(null);
            setIsDispatchModalOpen(true);
          }}
          className="bg-gradient-to-br from-amber-50/90 via-orange-50/60 to-white rounded-2xl p-4 border-2 border-orange-300 shadow-sm flex items-center justify-between hover:border-orange-500 hover:shadow-md transition-all active:scale-[0.99] cursor-pointer relative overflow-hidden group"
        >
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-orange-200/30 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center space-x-3.5 z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
              <Headphones className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-black text-base text-slate-900 tracking-tight">
                  手动填写需求 · 人工派单
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black shadow-xs">
                  极速安排
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                不纠结选谁，1分钟直接填需求，官方专属管家1对1协调最合适服务师
              </p>
              <div className="flex items-center space-x-2 mt-1.5 text-[10px] text-orange-700 font-bold">
                <span className="px-1.5 py-0.5 bg-orange-100/80 rounded">3分钟内极速响应</span>
                <span className="px-1.5 py-0.5 bg-orange-100/80 rounded">不满意随时退换</span>
                <span className="px-1.5 py-0.5 bg-orange-100/80 rounded">支持一键代入全家档案</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-extrabold text-xs flex items-center space-x-1 shadow-md shadow-orange-200 z-10 flex-shrink-0"
          >
            <span>直接填需求</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </article>
        {displayedEscorts.map((escort, idx) => (
          <article
            key={escort.id}
            onClick={() => setViewingEscortProfile(escort)}
            className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs flex space-x-3.5 items-start hover:border-blue-200 transition-all cursor-pointer"
          >
            <div className="relative flex-shrink-0">
              <img
                src={escort.avatar}
                alt={escort.name}
                className="w-18 h-18 rounded-2xl object-cover border border-slate-100"
              />
              <span className="absolute -top-1.5 -left-1.5 px-1.5 py-0.5 rounded-md bg-amber-500 text-white text-[9px] font-bold shadow-xs">
                {idx < 3 ? `TOP ${idx + 1}` : '持证严选'}
              </span>
              <div className="absolute -bottom-1 inset-x-0 mx-auto w-fit px-1.5 py-0.5 bg-blue-600/90 text-white rounded-full text-[9px] font-medium flex items-center space-x-0.5">
                <Volume2 className="w-2.5 h-2.5" />
                <span>实拍档案</span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-bold text-sm text-slate-900 truncate">{escort.name}</h3>
                  <span className="text-[10px] text-pink-500 font-bold">
                    {escort.gender === '女' ? '♀' : '♂'}
                  </span>
                  <span className="text-[10px] text-slate-400">{escort.age}岁</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{escort.rating}分</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mt-1">
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
                  {escort.title}
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-600 text-[10px]">
                  已服务 {escort.serviceCount}+ 次
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px]">
                  好评率 {escort.praiseRate}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-1 leading-snug">
                擅长：{escort.specialties ? escort.specialties.join(' · ') : escort.tag}
              </p>

              <div className="mt-2.5 pt-2 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-baseline space-x-1">
                  <span className="text-xs text-rose-500 font-bold">首单8折</span>
                  <span className="text-base font-extrabold text-rose-600">
                    ¥{isMedical ? '168' : '68'}
                  </span>
                  <span className="text-[10px] text-slate-400">/起</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectEscortOrder(escort)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-xs transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <span>立即点TA</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </main>

      {/* 完善需求下单弹窗（严格遵循参考页规范设计链路） */}
      {(isOrderModalOpen || isDispatchModalOpen) && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
          onClick={() => {
            setIsOrderModalOpen(false);
            setIsDispatchModalOpen(false);
          }}
        >
          <div
            className="w-full max-w-xl bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 shadow-2xl animate-slideUp"
            onClick={e => e.stopPropagation()}
          >
            {/* 顶栏与专属服务介绍 */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                  和
                </span>
                <h2 className="font-bold text-base text-slate-900">
                  完善【{isMedical ? '健康陪诊' : '宠物陪伴'}】需求
                </h2>
              </div>
              <button
                type="button"
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
                onClick={() => {
                  setIsOrderModalOpen(false);
                  setIsDispatchModalOpen(false);
                }}
              >
                ✕
              </button>
            </div>

            {/* 专属表单 · 规范履约卡 */}
            <div className="my-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-800">
                    {isMedical ? '健康陪诊' : '专业宠护陪伴'}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {isMedical
                      ? '门诊就医 · 排队挂号 · 检查引导 · 医嘱记录整理'
                      : '上门换粮 · 清洁猫砂 · 互动梳毛 · 全程摄录确认'}
                  </p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                  {selectedEscort ? `已指定: ${selectedEscort.name}` : '专属表单 · 规范履约'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(isMedical
                  ? ['#门诊陪同', '#排队挂号', '#长者就医', '#代取报告', '#轮椅推护']
                  : ['#上门喂猫', '#遛狗照料', '#清洁消毒', '#实拍视频', '#持证宠医']
                ).map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-white text-slate-600 border border-slate-200">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 一键导入全家档案 */}
            <div className="my-3 p-3 rounded-2xl bg-blue-50/70 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-900">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>一键导入全家档案（点击自动代填信息）：</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {familyProfiles.map(profile => (
                  <button
                    key={profile.name}
                    type="button"
                    onClick={() => handleApplyProfile(profile)}
                    className="px-2.5 py-1.5 rounded-xl bg-white text-[11px] font-medium text-slate-700 border border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center space-x-1"
                  >
                    <span>+ {profile.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 填写服务明细信息表单 */}
            <form onSubmit={handleSubmitOrder} className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-xs">填写服务明细信息</h4>
                <span className="text-rose-500 text-[10px] font-bold">* 为必填项</span>
              </div>

              {/* 1. 需求标题 */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">📄 1. 需求标题 *</label>
                <input
                  type="text"
                  required
                  value={orderForm.title}
                  onChange={e => setOrderForm({ ...orderForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>

              {/* 2. 集合或服务地点 + 快捷地点 */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">📍 2. 集合或服务地点 *</label>
                  <span className="text-slate-400 text-[10px]">当前城市: {currentCity}</span>
                </div>
                <input
                  type="text"
                  required
                  value={orderForm.venue}
                  onChange={e => setOrderForm({ ...orderForm, venue: e.target.value })}
                  placeholder="例如：市民医院门诊大楼一楼大厅 / 省中医院"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
                />
                <div className="flex items-center space-x-1 mt-1.5 overflow-x-auto py-1">
                  <span className="text-[10px] text-slate-400 flex-shrink-0">快捷地点:</span>
                  {quickLocations.map(loc => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setOrderForm({ ...orderForm, venue: loc })}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 text-[10px] flex-shrink-0 border border-slate-200 transition-colors"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3 & 4. 期望服务时间 与 预估耗时 */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">🕒 3. 期望服务时间 *</label>
                    <span className="text-blue-600 text-[10px]">自定义时间</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={orderForm.serviceDate}
                    onChange={e => setOrderForm({ ...orderForm, serviceDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">⏱️ 4. 预估耗时 *</label>
                  <select
                    value={orderForm.duration}
                    onChange={e => setOrderForm({ ...orderForm, duration: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
                  >
                    <option value="1 小时">1.0 小时</option>
                    <option value="2.0 小时">2.0 小时</option>
                    <option value="2.5 小时">2.5 小时</option>
                    <option value="4.0 小时 (半天)">4.0 小时 (半天)</option>
                    <option value="8.0 小时 (全天)">8.0 小时 (全天)</option>
                  </select>
                </div>
              </div>

              {/* 5 & 6. 期望报酬金额 与 联系手机号 */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">💰 5. 期望报酬金额</label>
                    <span className="text-slate-400 text-[10px]">线下完成当面结清</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={orderForm.reward}
                    onChange={e => setOrderForm({ ...orderForm, reward: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold text-slate-800"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {rewardOptions.map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setOrderForm({ ...orderForm, reward: r })}
                        className={`px-1.5 py-0.5 rounded text-[10px] border transition-all ${orderForm.reward === r ? 'border-amber-400 bg-amber-50 text-amber-800 font-bold' : 'border-slate-200 text-slate-500'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">📞 6. 联系手机号 *</label>
                  <input
                    type="tel"
                    required
                    value={orderForm.phone}
                    onChange={e => setOrderForm({ ...orderForm, phone: e.target.value })}
                    placeholder="用于服务人员对接联系"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">平台严格执行号码保护，仅匹配成功的服务人员可见</p>
                </div>
              </div>

              {/* 7. 需求详情与特殊要求 */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">📝 7. 需求详情与特殊要求 (选填)</label>
                <textarea
                  rows={2}
                  value={orderForm.details}
                  onChange={e => setOrderForm({ ...orderForm, details: e.target.value })}
                  placeholder="例如：母亲年过七旬腿脚不便，需要推轮椅进出；需协助排队拿心电图和化验单，陪同看诊并记录医生嘱咐。"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none resize-none leading-relaxed"
                />
              </div>

              {/* 优惠券立减抵扣 */}
              <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-800">
                    <Ticket className="w-4 h-4 text-rose-600" />
                    <span>优惠券立减抵扣</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-200 text-rose-900 font-bold">1 张可用</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setOrderForm({ ...orderForm, useCoupon: true })}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${orderForm.useCoupon ? 'bg-rose-500 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'}`}
                  >
                    8折 新人首单专属陪护券 (无门槛)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderForm({ ...orderForm, useCoupon: false })}
                    className={`px-2.5 py-1 rounded-xl text-xs transition-all ${!orderForm.useCoupon ? 'bg-slate-700 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}
                  >
                    不使用优惠券
                  </button>
                </div>
                <p className="text-[10px] text-rose-500 mt-1">已为您抵扣优惠，差额将由官方和伴基金补贴给陪护师，不影响服务质量</p>
              </div>

              {/* 发布与履约保障声明 */}
              <div className="flex items-start space-x-2 p-2.5 rounded-xl bg-slate-100 text-[11px] text-slate-600">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 text-blue-600 mt-0.5" />
                <span>发布后需求将同步公示至同城需求社区供合资格人员快速接单响应。服务产生的全部费用均在服务完成后由用户与服务人员在线下当面核对结清。</span>
              </div>

              {/* 底部动作按钮栏 */}
              <div className="pt-2 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOrderModalOpen(false);
                    setIsDispatchModalOpen(false);
                  }}
                  className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
                >
                  重选分类
                </button>

                <button
                  type="submit"
                  disabled={orderSuccess}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md disabled:bg-emerald-600"
                >
                  {orderSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>已成功建单并同步排期！</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>立即发布需求并锁定排期</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 师傅个人主页抽屉/大弹窗 (参考成熟点单/陪玩点单模式) */}
      {viewingEscortProfile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-center items-end sm:items-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-slate-50 w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            {/* 抽屉头部导航条 */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewingEscortProfile(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="font-bold text-sm text-slate-800">陪伴师主页</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => viewingEscortProfile && toggleFavoriteEscort(viewingEscortProfile.id)}
                  className={"w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer " + (viewingEscortProfile && isEscortFavorite(viewingEscortProfile.id) ? "bg-rose-50 text-rose-500" : "bg-slate-100 text-slate-600 hover:text-rose-500 hover:bg-rose-50")}
                  title={viewingEscortProfile && isEscortFavorite(viewingEscortProfile.id) ? "取消收藏" : "收藏师傅"}
                >
                  <Heart className={"w-4 h-4 " + (viewingEscortProfile && isEscortFavorite(viewingEscortProfile.id) ? "fill-rose-500" : "")} />
                </button>
                <button
                  type="button"
                  onClick={() => alert("主页链接已复制到剪贴板，可分享给好友")}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 主内容滚动区 */}
            <div className="overflow-y-auto flex-1 p-4 space-y-4">
              {/* 1. 顶部大卡片：头像、认证、声音、状态 */}
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs relative overflow-hidden">
                <div className="flex items-start space-x-4">
                  <div className="relative flex-shrink-0">
                    <img
                      src={viewingEscortProfile.avatar}
                      alt={viewingEscortProfile.name}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-sm"
                    />
                    <span className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-emerald-500 text-white font-extrabold text-[9px] shadow-xs flex items-center space-x-0.5">
                      <Zap className="w-2.5 h-2.5" />
                      <span>可秒接</span>
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-black text-slate-900 truncate">{viewingEscortProfile.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-100">
                        {viewingEscortProfile.gender} · {viewingEscortProfile.age}岁
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 mt-1.5">
                      <div className="flex items-center text-amber-500 font-black text-xs space-x-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{viewingEscortProfile.rating}分</span>
                      </div>
                      <span className="text-slate-300">|</span>
                      <span className="text-xs text-slate-500 font-medium">已履约 {viewingEscortProfile.serviceCount}次</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-xs text-emerald-600 font-bold">好评率 99.8%</span>
                    </div>

                    <div className="mt-2 flex items-center space-x-2">
                      <div className="px-2 py-1 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center space-x-1.5 text-xs text-emerald-700 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>平台实名认证</span>
                      </div>
                      <span className="text-[11px] text-slate-400">近30天履约率 100%</span>
                    </div>
                  </div>
                </div>

                {/* 标签 */}
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
                  {(viewingEscortProfile.specialties || [viewingEscortProfile.tag || "持证上岗"]).slice(0, 4).map((tag, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2.5 py-0.8 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-100/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

                            {/* 2. 价格与服务规格展示卡片（纯展示型看板，支持展示更多认证技能与板块） */}
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span className="font-extrabold text-sm text-slate-900">核心服务资费参考</span>
                  </div>
                  <span className="text-[11px] text-rose-500 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                    新客立减20% · 下单时选择
                  </span>
                </div>

                {/* 核心主打两大规格 (只读展示，不可点击，避免误触) */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/30 relative select-none">
                    <span className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] px-2 py-0.5 rounded-bl-lg font-bold">主流推荐</span>
                    <p className="font-bold text-xs text-slate-900">标准单次陪护 (半日)</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">门诊导引/上门照料 · 4小时</p>
                    <div className="mt-2 flex items-baseline space-x-1">
                      <span className="text-base font-black text-blue-600">¥168/半天</span>
                      <span className="text-[10px] text-slate-400 line-through">¥218</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 relative select-none">
                    <p className="font-bold text-xs text-slate-900">全天深度陪护</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">全程跟随陪护 · 8小时</p>
                    <div className="mt-2 flex items-baseline space-x-1">
                      <span className="text-base font-black text-slate-800">¥298</span>
                      <span className="text-[10px] text-slate-400">/全天</span>
                    </div>
                  </div>
                </div>

                {/* 师傅多板块认证与拓展技能标签小卡片 */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">师傅已认证跨板块技能：</span>
                    <span className="text-[10px] text-slate-400">点下方立即指定进入需求单自选</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(viewingEscortProfile.specialties || ["三甲医院全程陪诊", "异地代取化验单报告", "行动不便轮椅推护", "术后平稳看护复查"]).map((spec, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center space-x-1.5 text-slate-700"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span className="text-[11px] font-medium truncate">{spec}</span>
                      </div>
                    ))}
                    <div className="p-2 rounded-xl bg-slate-50 border border-dashed border-slate-300 flex items-center space-x-1.5 text-slate-500">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <span className="text-[11px] truncate">支持按需个性化定制</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-dashed border-slate-300 flex items-center space-x-1.5 text-slate-500">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                      <span className="text-[11px] truncate">平台责任险全程兜底</span>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1">
                  <div className="flex items-center space-x-1.5 text-emerald-700 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>和伴平台三重履约承诺</span>
                  </div>
                  <p>① 实名健康认证，持证上岗；② 爽约包赔，20分钟极速响应；③ 平台责任险全程保驾护航。</p>
                </div>
              </div>

              {/* 3. 师傅从业经历与服务特色 */}
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-2.5">
                <h4 className="font-extrabold text-sm text-slate-900">个人介绍与专长经历</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {viewingEscortProfile.bio}。曾为数百位家庭提供过细致、耐心的陪护与照料服务，熟悉本市各大三甲医院流程与不同宠物品种看护要点。细致踏实，沟通温和。
                </p>
              </div>

              {/* 4. 用户真实评价卡片列表 */}
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-extrabold text-sm text-slate-900">真实用户评价</h4>
                    <span className="text-xs font-bold text-slate-400">({viewingEscortProfile.serviceCount}+)</span>
                  </div>
                  <div className="flex items-center space-x-1 text-amber-500 font-black text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{viewingEscortProfile.rating} 超棒</span>
                  </div>
                </div>

                {/* 评价标签 */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">细心专业 (182)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">准时到达 (143)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">态度特别温和 (98)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">办事效率高 (76)</span>
                </div>

                {/* 评价项 */}
                <div className="space-y-2.5 pt-1">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800">王** (匿名用户)</span>
                        <span className="text-[10px] text-slate-400">北京协和医院门诊陪护</span>
                      </div>
                      <span className="text-[10px] text-slate-400">昨天</span>
                    </div>
                    <div className="flex items-center text-amber-400 space-x-0.5">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      师傅非常敬业，提前半小时就在门诊大厅等候，挂号、做心电图、拿药一条龙全部办得妥妥当当，家里老人直夸师傅有耐心！强烈推荐！
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800">林** (朝阳区)</span>
                        <span className="text-[10px] text-slate-400">上门宠照料与喂药</span>
                      </div>
                      <span className="text-[10px] text-slate-400">3天前</span>
                    </div>
                    <div className="flex items-center text-amber-400 space-x-0.5">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      出差临时找的，全程视频和照片实时同步，猫咪被照顾得很好，砂盆清理得很干净，让人特别放心。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 底部固定操作条 (参考游戏点单模版：聊一聊 + 立即指定TA) */}
            <div className="sticky bottom-0 bg-white border-t border-slate-100 px-4 py-3 flex items-center space-x-3 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  if (viewingEscortProfile) {
                    toggleFavoriteEscort(viewingEscortProfile.id);
                  }
                }}
                className={"px-4 py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer flex-shrink-0 border " + (viewingEscortProfile && isEscortFavorite(viewingEscortProfile.id) ? "bg-rose-50 border-rose-200 text-rose-600 shadow-2xs" : "bg-slate-100 border-transparent hover:bg-slate-200 text-slate-700")}
              >
                <Heart className={"w-4 h-4 " + (viewingEscortProfile && isEscortFavorite(viewingEscortProfile.id) ? "fill-rose-500 text-rose-500" : "text-slate-500")} />
                <span>{viewingEscortProfile && isEscortFavorite(viewingEscortProfile.id) ? "已收藏" : "收藏师傅"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const target = viewingEscortProfile;
                  setViewingEscortProfile(null);
                  setSelectedEscort(target);
                  setIsOrderModalOpen(true);
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>立即指定TA · 填写需求 (带入档案)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
