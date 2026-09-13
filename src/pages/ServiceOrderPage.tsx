import React, { useState } from 'react';
import {
  ArrowLeft,
  UserCheck,
  Trophy,
  Headphones,
  Sparkles,
  Search,
  Filter,
  Star,
  CheckCircle2,
  Volume2,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Send,
  Check,
  ChevronRight,
  ShieldCheck,
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
}

export default function ServiceOrderPage({
  type,
  currentCity,
  onBack,
  onCompleteOrder
}: ServiceOrderPageProps) {
  const isMedical = type === 'medical';
  const allEscorts = getEscortsByCity(currentCity || '北京');
  const filteredEscorts = allEscorts.filter(e =>
    isMedical ? e.category === '医疗陪诊' || !e.category : e.category === '宠物陪伴'
  );

  // 排序与筛选状态
  const [activeSort, setActiveSort] = useState<'rating' | 'orders' | 'all'>('rating');
  const [genderFilter, setGenderFilter] = useState<'all' | '女' | '男'>('all');
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<'list' | 'rank'>('list');

  // 下单抽屉状态
  const [selectedEscort, setSelectedEscort] = useState<EscortProfile | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // 家庭档案库模拟
  const familyProfiles = isMedical
    ? [
        { name: '母亲 (张阿姨)', age: '68岁', phone: '138****6621', condition: '高血压/心内科复诊', defaultVenue: '北京协和医院门诊楼' },
        { name: '父亲 (李大爷)', age: '72岁', phone: '139****1124', condition: '白内障术后复查/需轮椅', defaultVenue: '同仁医院眼科' },
        { name: '本人', age: '29岁', phone: '136****8890', condition: '日常门诊陪同/代取报告', defaultVenue: '朝阳医院' }
      ]
    : [
        { name: '布偶猫 (雪球)', age: '2岁', phone: '138****6621', condition: '换粮喂水/需摄录确认/温顺', defaultVenue: '朝阳区 望京金茂府' },
        { name: '柯基犬 (皮皮)', age: '3岁', phone: '138****6621', condition: '定时遛狗30分钟/喜好草坪', defaultVenue: '海淀区 中关村软件园' }
      ];

  // 下单表单状态
  const [orderForm, setOrderForm] = useState({
    subCategory: isMedical ? '全程就诊陪护' : '上门喂养陪伴',
    targetName: familyProfiles[0].name,
    phone: '138****6621',
    serviceDate: '2026-03-14',
    serviceTime: '09:30',
    venue: familyProfiles[0].defaultVenue,
    requirements: isMedical ? '老人走路较慢，需协助挂号、心电图排队并代取报告' : '备好干粮冻干，换水清洗食盆，拍摄1分钟视频发回'
  });

  // 一键迁入家庭档案
  const handleApplyProfile = (profile: any) => {
    setOrderForm(prev => ({
      ...prev,
      targetName: profile.name,
      phone: profile.phone,
      venue: profile.defaultVenue,
      requirements: (isMedical ? '【档案要点】：' : '【宠护重点】：') + profile.condition
    }));
  };

  // 处理直接针对某个服务者点单
  const handleSelectEscortOrder = (escort: EscortProfile) => {
    setSelectedEscort(escort);
    setIsOrderModalOpen(true);
  };

  // 提交订单
  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderSuccess(true);
    setTimeout(() => {
      setOrderSuccess(false);
      setIsOrderModalOpen(false);
      setIsDispatchModalOpen(false);
      onCompleteOrder({
        title: (selectedEscort ? `指定 ${selectedEscort.name} · ` : '人工智能派单 · ') + orderForm.subCategory,
        venue: orderForm.venue,
        time: `${orderForm.serviceDate} ${orderForm.serviceTime}`,
        target: orderForm.targetName,
        phone: orderForm.phone,
        requirements: orderForm.requirements,
        escort: selectedEscort
      });
    }, 1200);
  };

  // 排序列表
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
          {isMedical ? '健康医陪 · 专业陪护挑选' : '宠物陪伴 · 金牌上门照顾'}
        </h1>
        <div className="flex items-center space-x-1 text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full font-medium">
          <MapPin className="w-3.5 h-3.5" />
          <span>{currentCity}</span>
        </div>
      </header>

      {/* 核心双通道金刚位：放大版「人工派单」与「排行榜」 */}
      <section className="p-3.5 bg-white border-b border-slate-100">
        <div className="grid grid-cols-2 gap-3">
          {/* 人工派单 (放大版) */}
          <button
            type="button"
            onClick={() => {
              setSelectedEscort(null);
              setIsDispatchModalOpen(true);
            }}
            className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-200/80 flex items-center space-x-3 text-left hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-sm text-slate-900">人工派单</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-200/80 text-amber-900 font-bold">专人接待</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">管家1对1统筹安排 · 极速出单</p>
            </div>
          </button>

          {/* 排行榜 (放大版，替换原一键安排) */}
          <button
            type="button"
            onClick={() => setActiveLeaderboardTab(activeLeaderboardTab === 'rank' ? 'list' : 'rank')}
            className={`p-4 rounded-2xl border flex items-center space-x-3 text-left hover:shadow-md transition-all active:scale-[0.98] cursor-pointer ${activeLeaderboardTab === 'rank' ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300' : 'bg-gradient-to-br from-blue-50/50 to-slate-50 border-blue-100'}`}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <Trophy className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-sm text-slate-900">
                  {isMedical ? '医陪排行榜' : '宠陪金牌榜'}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold">Top口碑</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">实名持证好评严选 · 榜单直约</p>
            </div>
          </button>
        </div>
      </section>

      {/* 筛选与排序工具栏 (参考点单平台设计) */}
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
          <span>官方实名持证认证</span>
        </div>
      </div>

      {/* 服务师点单列表 */}
      <main className="p-3 space-y-3">
        {displayedEscorts.map((escort, idx) => (
          <article
            key={escort.id}
            className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs flex space-x-3.5 items-start hover:border-blue-200 transition-all"
          >
            {/* 头像与标签 */}
            <div className="relative flex-shrink-0">
              <img
                src={escort.avatar}
                alt={escort.name}
                className="w-18 h-18 rounded-2xl object-cover border border-slate-100"
              />
              <span className="absolute -top-1.5 -left-1.5 px-1.5 py-0.5 rounded-md bg-amber-500 text-white text-[9px] font-bold shadow-xs">
                {idx < 3 ? `TOP ${idx + 1}` : '平台认证'}
              </span>
              <div className="absolute -bottom-1 inset-x-0 mx-auto w-fit px-1.5 py-0.5 bg-blue-600/90 text-white rounded-full text-[9px] font-medium flex items-center space-x-0.5">
                <Volume2 className="w-2.5 h-2.5" />
                <span>实拍档案</span>
              </div>
            </div>

            {/* 详细信息 */}
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

              {/* 身份段位标签 */}
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

              {/* 业务专长 */}
              <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-1 leading-snug">
                擅长：{escort.specialties ? escort.specialties.join(' · ') : escort.tag}
              </p>

              {/* 价格与下单动作按钮 */}
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

      {/* 下单抽屉弹窗 (支持档案一键迁移导入、二级项目、时间、地点填写) */}
      {(isOrderModalOpen || isDispatchModalOpen) && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
          onClick={() => {
            setIsOrderModalOpen(false);
            setIsDispatchModalOpen(false);
          }}
        >
          <div
            className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto p-5 shadow-2xl animate-slideUp"
            onClick={e => e.stopPropagation()}
          >
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="font-bold text-base text-slate-900">
                  {selectedEscort ? `预约指定服务师 · ${selectedEscort.name}` : '官方人工极速派单 · 快速建单'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  支持调用全家档案一键带入，系统自动匹配并锁定档期
                </p>
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

            {/* 一键导入家庭档案捷径区 */}
            <div className="my-3.5 p-3 rounded-2xl bg-blue-50/70 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-900">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>一键导入家庭档案（点击自动代填信息）：</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {familyProfiles.map(profile => (
                  <button
                    key={profile.name}
                    type="button"
                    onClick={() => handleApplyProfile(profile)}
                    className="px-2.5 py-1.5 rounded-xl bg-white text-[11px] font-medium text-slate-700 border border-blue-200 hover:border-blue-400 hover:bg-blue-50/80 transition-all flex items-center space-x-1"
                  >
                    <span>+ {profile.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 下单填写表单 */}
            <form onSubmit={handleSubmitOrder} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">1. 服务二级类别 *</label>
                <div className="grid grid-cols-2 gap-2">
                  {(isMedical
                    ? ['全程就诊陪护', '住院照护陪伴', '就诊排队/取药报告', '检查陪同/绿通']
                    : ['上门喂养陪伴', '遛狗互动照护', '洗护接送陪护', '绝育/体检就医陪伴']
                  ).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setOrderForm({ ...orderForm, subCategory: cat })}
                      className={`p-2 rounded-xl border text-left font-medium transition-all ${orderForm.subCategory === cat ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold' : 'border-slate-200 bg-slate-50 text-slate-600'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">2. 服务对象 / 姓名 *</label>
                  <input
                    type="text"
                    required
                    value={orderForm.targetName}
                    onChange={e => setOrderForm({ ...orderForm, targetName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">3. 联系手机 *</label>
                  <input
                    type="tel"
                    required
                    value={orderForm.phone}
                    onChange={e => setOrderForm({ ...orderForm, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">4. 预定服务日期 *</label>
                  <input
                    type="date"
                    required
                    value={orderForm.serviceDate}
                    onChange={e => setOrderForm({ ...orderForm, serviceDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">5. 开始时间 *</label>
                  <input
                    type="time"
                    required
                    value={orderForm.serviceTime}
                    onChange={e => setOrderForm({ ...orderForm, serviceTime: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">6. 履约地点 / 医院社区 *</label>
                <input
                  type="text"
                  required
                  value={orderForm.venue}
                  onChange={e => setOrderForm({ ...orderForm, venue: e.target.value })}
                  placeholder="如：北京协和医院门诊楼二层"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">7. 特别注意事项与交代</label>
                <textarea
                  rows={2}
                  value={orderForm.requirements}
                  onChange={e => setOrderForm({ ...orderForm, requirements: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={orderSuccess}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md disabled:bg-emerald-600"
                >
                  {orderSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>建单成功！已直接生成订单并锁定排期</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>确认提交订单并排入日历档期</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
