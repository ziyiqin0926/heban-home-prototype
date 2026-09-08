import React, { useState } from 'react';
import {
  Sparkles,
  MapPin,
  Clock,
  Coins,
  Phone,
  Timer,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  ChevronRight,
  Sparkle,
  Ticket
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { DraftOrder, CouponItem } from '../types';

interface ManualPublishFormProps {
  onPublishSuccess: () => void;
  onNavigateToCommunity: () => void;
  onNavigateToProfile?: () => void;
}

export type MainCategory = '医疗陪诊' | '宠物陪伴' | '同城陪伴';

interface CategoryConfig {
  id: MainCategory;
  name: string;
  categoryLabel: string;
  tagline: string;
  icon: string;
  badge: string;
  colorTheme: {
    bgLight: string;
    border: string;
    borderHover: string;
    accentBg: string;
    accentText: string;
    tagBg: string;
    tagText: string;
    buttonBg: string;
  };
  description: string;
  tags: string[];
  defaultTitle: string;
  defaultBudget: string;
  defaultDuration: string;
  locationPlaceholder: string;
  quickLocations: string[];
  descPlaceholder: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    id: '医疗陪诊',
    name: '医疗陪诊',
    categoryLabel: '医疗',
    tagline: '门诊就医 · 排队挂号 · 检查引导 · 医嘱记录',
    icon: '🏥',
    badge: '专业医疗就医',
    colorTheme: {
      bgLight: 'bg-blue-50/50',
      border: 'border-blue-100',
      borderHover: 'hover:border-blue-400 hover:shadow-md hover:bg-blue-50/80',
      accentBg: 'bg-blue-600',
      accentText: 'text-blue-600',
      tagBg: 'bg-blue-50',
      tagText: 'text-blue-700',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
    },
    description: '专业门诊就医全程陪同、排队缴费取药、协助推轮椅、长者引导及重要医嘱记录整理',
    tags: ['门诊陪同', '排队挂号', '长者就医', '代取报告', '轮椅推护'],
    defaultTitle: '就医门诊复查全程陪同与引导',
    defaultBudget: '150 元',
    defaultDuration: '2.5 小时',
    locationPlaceholder: '例如: 市人民医院门诊大楼一楼大厅 / 省中医院',
    quickLocations: ['市第一人民医院门诊大厅', '省中医院门诊大楼', '市妇幼保健院', '华西医院门诊部', '家中上门接送'],
    descPlaceholder: '例如: 母亲年过七旬腿脚不便，需要推轮椅进出；需协助排队拿心电图和化验单，陪同看诊并记录医生嘱咐。',
  },
  {
    id: '宠物陪伴',
    name: '宠物陪伴',
    categoryLabel: '宠物',
    tagline: '上门喂养 · 户外遛狗 · 定时照看 · 宠物代送',
    icon: '🐾',
    badge: '萌宠生活照护',
    colorTheme: {
      bgLight: 'bg-amber-50/50',
      border: 'border-amber-100',
      borderHover: 'hover:border-amber-400 hover:shadow-md hover:bg-amber-50/80',
      accentBg: 'bg-amber-500',
      accentText: 'text-amber-600',
      tagBg: 'bg-amber-50',
      tagText: 'text-amber-700',
      buttonBg: 'bg-amber-500 hover:bg-amber-600',
    },
    description: '宠物定时喂养换水、早晚户外遛狗散步、日常互动陪伴照看、就医代送陪护',
    tags: ['户外遛狗', '定时喂养', '日常互动', '宠物代送', '就医代看'],
    defaultTitle: '宠物遛狗散步与定时照看陪伴',
    defaultBudget: '60 元',
    defaultDuration: '1.5 小时',
    locationPlaceholder: '例如: 绿城花园3号院南门 / 滨江社区公园正门',
    quickLocations: ['就近社区公园大门', '小区绿化广场中庭', '宠物医院门口集合', '家中上门接护'],
    descPlaceholder: '例如: 金毛犬一只，性格温顺听话，已接种疫苗；需带至小区公园散步40分钟，随后添粮换水，自备牵引绳。',
  },
  {
    id: '同城陪伴',
    name: '同城陪伴',
    categoryLabel: '同城',
    tagline: '长者散步 · 谈心聊天 · 邻里互助 · 出行陪同',
    icon: '🤝',
    badge: '长者同城关怀',
    colorTheme: {
      bgLight: 'bg-emerald-50/50',
      border: 'border-emerald-100',
      borderHover: 'hover:border-emerald-400 hover:shadow-md hover:bg-emerald-50/80',
      accentBg: 'bg-emerald-600',
      accentText: 'text-emerald-600',
      tagBg: 'bg-emerald-50',
      tagText: 'text-emerald-700',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-700',
    },
    description: '长者户外散步聊天解闷、同城出行陪同、日常就餐购物辅助、邻里助老互助关怀',
    tags: ['长者散步', '谈心聊天', '同城出行', '办事陪同', '生活照看'],
    defaultTitle: '长者户外散步与日常谈心解闷陪伴',
    defaultBudget: '100 元',
    defaultDuration: '2 小时',
    locationPlaceholder: '例如: 阳光社区长者活动中心 / 和平公园东门',
    quickLocations: ['社区长者服务中心', '和平公园东门长廊', '就近便民商超入口', '家中上门集合'],
    descPlaceholder: '例如: 陪同独居老人去附近公园散散步、聊聊天，老人思维清晰、步速较慢，需随身带保温杯并注意防滑。',
  },
];

const TIME_OPTIONS = [
  '今天 上午 08:30',
  '今天 上午 09:00',
  '今天 上午 10:00',
  '今天 下午 14:00',
  '今天 下午 15:30',
  '今天 傍晚 16:30 前',
  '明天 上午 08:00',
  '明天 上午 08:30',
  '明天 上午 09:00',
  '明天 上午 09:30',
  '明天 上午 10:00',
  '明天 下午 14:00',
  '明天 下午 15:30',
  '明天 下午 16:30 前',
  '后天 上午 08:30',
  '后天 上午 09:00',
  '后天 上午 10:00',
  '后天 下午 14:30',
  '本周六 上午 09:00',
  '本周六 上午 09:30',
  '本周日 上午 09:00',
  '下周一 上午 08:30',
  '尽快出发 (1小时内)',
];

const BUDGET_PRESETS = ['50 元', '60 元', '100 元', '150 元', '200 元', '300 元', '面议 / 线下协商'];
const DURATION_PRESETS = ['1 小时', '1.5 小时', '2 小时', '2.5 小时', '3 小时', '半天 (4小时)', '全天 (8小时)'];

export default function ManualPublishForm({ onPublishSuccess, onNavigateToCommunity, onNavigateToProfile }: ManualPublishFormProps) {
  const { userPhone, addOrder, currentCity, coupons, useCoupon } = useAppContext();

  // Step state: 'select_category' | 'fill_form'
  const [step, setStep] = useState<'select_category' | 'fill_form'>('select_category');
  const [selectedCategory, setSelectedCategory] = useState<CategoryConfig>(CATEGORIES[0]);

  // Available coupons
  const availableCoupons = coupons.filter(c => c.status === 'available');
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(() => {
    return availableCoupons.length > 0 ? availableCoupons[0].id : null;
  });

  // Form fields
  const [title, setTitle] = useState('');
  const [time, setTime] = useState(TIME_OPTIONS[2]);
  const [customTime, setCustomTime] = useState('');
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('150 元');
  const [estimatedDuration, setEstimatedDuration] = useState('2.5 小时');
  const [phone, setPhone] = useState(userPhone);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState<any | null>(null);

  // When user picks a category from Step 1
  const handlePickCategory = (cat: CategoryConfig) => {
    setSelectedCategory(cat);
    setTitle(cat.defaultTitle);
    setBudget(cat.defaultBudget);
    setEstimatedDuration(cat.defaultDuration);
    setLocation('');
    setDescription('');
    if (availableCoupons.length > 0 && !selectedCouponId) {
      setSelectedCouponId(availableCoupons[0].id);
    }
    setStep('fill_form');
  };

  const handleBackToCategories = () => {
    setStep('select_category');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) {
      alert('请填写服务或集合地点');
      return;
    }

    setIsSubmitting(true);

    const chosenCoupon = availableCoupons.find(c => c.id === selectedCouponId);

    const draft: DraftOrder = {
      title: title.trim() || `${selectedCategory.name}需求`,
      type: selectedCategory.id,
      city: currentCity,
      time: isCustomTime && customTime.trim() ? customTime.trim() : time,
      location: location.trim(),
      phone: phone.trim() || userPhone,
      description: description.trim() || `发布【${selectedCategory.name}】需求，地点位于${location}，期望时间为${time}。要求服务人员守时耐心，熟悉流程。`,
      estimatedDuration,
      budget: budget.trim() || selectedCategory.defaultBudget,
      tips: [
        chosenCoupon ? `已使用「${chosenCoupon.name}」享受${chosenCoupon.discount}结算立减` : '线下核验结清',
        '请保持电话畅通，服务人员将主动与您确认细节'
      ],
    };

    setTimeout(() => {
      const created = addOrder(draft);
      if (chosenCoupon) {
        useCoupon(chosenCoupon.id, created.title);
      }
      setSuccessOrder(created);
      setIsSubmitting(false);
      onPublishSuccess();
    }, 350);
  };

  const handleReset = () => {
    setSuccessOrder(null);
    setStep('select_category');
    setTitle('');
    setLocation('');
    setDescription('');
  };

  // -------------------------------------------------------------
  // SUCCESS VIEW
  // -------------------------------------------------------------
  if (successOrder) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-6 my-4 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center space-y-2 pt-2">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-100/70 shadow-xs">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="text-lg md:text-xl font-bold text-slate-800">
            需求订单已成功发布！
          </h2>
          <p className="text-xs md:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            您的订单已收录至【个人中心 - 我的订单】，系统正在为您就近撮合合资格的陪护师。
          </p>
        </div>

        {/* Order Details Preview Card */}
        <div className="bg-slate-50 rounded-2xl p-4 md:p-5 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-500">订单编号：{successOrder.id}</span>
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg border border-blue-200/60">
              {successOrder.type}
            </span>
          </div>

          <h3 className="text-sm md:text-base font-bold text-slate-800">
            {successOrder.title}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0" />
              <span>服务时间：<strong className="text-slate-800">{successOrder.time}</strong></span>
            </div>
            <div className="flex items-center">
              <Coins className="w-4 h-4 mr-2 text-amber-500 flex-shrink-0" />
              <span>期望金额：<strong className="text-amber-600 font-bold">{successOrder.budget}</strong></span>
            </div>
            <div className="flex items-center">
              <Timer className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0" />
              <span>预估耗时：<strong className="text-slate-800">{successOrder.estimatedDuration}</strong></span>
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0" />
              <span>联系电话：<strong className="text-slate-800">{successOrder.phone}</strong></span>
            </div>
            <div className="flex items-center sm:col-span-2">
              <MapPin className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0" />
              <span>服务地点：<strong className="text-slate-800">{successOrder.location}</strong></span>
            </div>
          </div>
        </div>

        {/* Friendly Tips */}
        <div className="bg-blue-50/70 rounded-2xl p-3.5 border border-blue-200/60 flex items-start space-x-2.5 text-xs text-blue-800">
          <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-blue-900">安全与结算提示</div>
            <p className="text-[11px] text-blue-700 leading-relaxed mt-0.5">
              平台不经手任何服务资金，请在服务人员按约到达且服务验收完成后，当面通过微信/支付宝直接结清费用。
            </p>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs md:text-sm transition-colors cursor-pointer text-center"
          >
            继续发布新需求
          </button>
          <button
            type="button"
            onClick={onNavigateToProfile || onNavigateToCommunity}
            className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs md:text-sm flex items-center justify-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <span>前往个人中心查看订单</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STEP 1: CATEGORY SELECTION ONLY (留出留白，只有三大类)
  // -------------------------------------------------------------
  if (step === 'select_category') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-8 animate-in fade-in duration-200">
        {/* Clean Header & Guidance with generous whitespace */}
        <div className="text-center space-y-2.5 max-w-lg mx-auto">
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold border border-blue-200/60">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span>当前城市：{currentCity}市</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
            请选择发布服务类型
          </h2>
          <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
            和伴提供三大核心陪伴与互助场景，点击进入完善具体需求信息
          </p>
        </div>

        {/* 3 Major Categories: 医疗, 宠物, 同城 */}
        <div className="space-y-4 md:space-y-5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handlePickCategory(cat)}
              className={`w-full p-5 md:p-6 rounded-3xl bg-white border ${cat.colorTheme.border} ${cat.colorTheme.borderHover} shadow-xs text-left transition-all duration-200 cursor-pointer group relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
            >
              {/* Left Content Area */}
              <div className="flex items-start space-x-4 md:space-x-5 flex-1">
                {/* Large Icon */}
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl ${cat.colorTheme.bgLight} border ${cat.colorTheme.border} flex items-center justify-center text-3xl md:text-4xl flex-shrink-0 group-hover:scale-105 transition-transform`}>
                  {cat.icon}
                </div>

                {/* Text Details */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                    <h3 className="text-base md:text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {cat.name}
                    </h3>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${cat.colorTheme.tagBg} ${cat.colorTheme.tagText} border border-slate-200/50`}>
                      {cat.badge}
                    </span>
                  </div>

                  <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                    {cat.description}
                  </p>

                  {/* Feature Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {cat.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100/80 text-slate-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Action Arrow Button */}
              <div className="flex items-center justify-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className={`px-3.5 py-2 rounded-xl text-xs font-bold ${cat.colorTheme.accentText} bg-slate-50 group-hover:bg-blue-50 group-hover:text-blue-600 flex items-center space-x-1.5 transition-colors`}>
                  <span>去完善信息</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Bottom Guarantee Note */}
        <div className="text-center pt-4 text-xs text-slate-400">
          <span>🛡️ 全程实名认证服务 · 线下当面结清 · 平台严格保护隐私</span>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STEP 2: FILL INFORMATION FORM (点击大类后继续完善其他信息)
  // -------------------------------------------------------------
  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-4 md:p-6 space-y-5 animate-in fade-in duration-200">
      {/* Top Category Badge & Back Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 md:p-4 shadow-2xs flex items-center justify-between">
        <button
          type="button"
          onClick={handleBackToCategories}
          className="inline-flex items-center space-x-1.5 text-xs md:text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer py-1 px-2 -ml-1 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回重新选择分类</span>
        </button>

        {/* Selected Category Tag */}
        <div className="flex items-center space-x-2">
          <span className="text-lg">{selectedCategory.icon}</span>
          <span className="text-xs md:text-sm font-bold text-slate-800">
            {selectedCategory.name}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedCategory.colorTheme.tagBg} ${selectedCategory.colorTheme.tagText}`}>
            {selectedCategory.badge}
          </span>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/80 shadow-xs p-4 md:p-6 space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base md:text-lg font-bold text-slate-800">
            完善【{selectedCategory.name}】需求信息
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {selectedCategory.tagline}
          </p>
        </div>

        {/* 1. Requirement Title */}
        <div>
          <label className="block text-xs md:text-sm font-bold text-slate-800 mb-1.5 flex items-center">
            <FileText className="w-4 h-4 mr-1.5 text-blue-600" />
            1. 需求标题 <span className="text-rose-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={selectedCategory.defaultTitle}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs md:text-sm text-slate-800"
          />
        </div>

        {/* 2. Location */}
        <div>
          <label className="block text-xs md:text-sm font-bold text-slate-800 mb-1.5 flex items-center justify-between">
            <span className="flex items-center">
              <MapPin className="w-4 h-4 mr-1.5 text-blue-600" />
              2. 集合或服务地点 <span className="text-rose-500 ml-0.5">*</span>
            </span>
            <span className="text-[11px] font-normal text-slate-400">当前城市：{currentCity}市</span>
          </label>
          <input
            type="text"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={selectedCategory.locationPlaceholder}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs md:text-sm text-slate-800"
          />
          {/* Quick Location Chips tailored to this category */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-[11px] text-slate-400 self-center mr-1">快捷地点:</span>
            {selectedCategory.quickLocations.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setLocation(loc)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Service Time & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs md:text-sm font-bold text-slate-800 flex items-center">
                <Clock className="w-4 h-4 mr-1.5 text-blue-600" />
                3. 期望服务时间 <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomTime(!isCustomTime)}
                className="text-[11px] text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
              >
                {isCustomTime ? '选择预设时段' : '自定义时间'}
              </button>
            </div>

            {isCustomTime ? (
              <input
                type="text"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                placeholder="如: 本周日 下午 15:00"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs md:text-sm text-slate-800"
              />
            ) : (
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs md:text-sm text-slate-800 cursor-pointer"
              >
                {TIME_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs md:text-sm font-bold text-slate-800 mb-1.5 flex items-center">
              <Timer className="w-4 h-4 mr-1.5 text-blue-600" />
              4. 预估耗时
            </label>
            <select
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs md:text-sm text-slate-800 cursor-pointer"
            >
              {DURATION_PRESETS.map((dur) => (
                <option key={dur} value={dur}>
                  {dur}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4. Budget & Contact Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs md:text-sm font-bold text-slate-800 flex items-center">
                <Coins className="w-4 h-4 mr-1.5 text-amber-500" />
                5. 期望报酬金额
              </label>
              <span className="text-[10px] text-slate-400">线下完成当面结清</span>
            </div>
            <input
              type="text"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="如: 150 元 或 面议/线下协商"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs md:text-sm text-slate-800 font-medium"
            />
            {/* Budget Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {BUDGET_PRESETS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBudget(b)}
                  className={`text-[11px] px-2 py-0.8 rounded-lg border transition-colors cursor-pointer ${
                    budget === b
                      ? 'bg-amber-50 text-amber-700 border-amber-300 font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs md:text-sm font-bold text-slate-800 mb-1.5 flex items-center">
              <Phone className="w-4 h-4 mr-1.5 text-blue-600" />
              6. 联系手机号 <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="用于服务人员对接联系"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs md:text-sm text-slate-800"
            />
            <p className="text-[10px] text-slate-400 mt-1.5">
              平台严格执行号码保护，仅匹配成功的服务人员可见
            </p>
          </div>
        </div>

        {/* 5. Requirement Description */}
        <div>
          <label className="block text-xs md:text-sm font-bold text-slate-800 mb-1.5 flex items-center justify-between">
            <span className="flex items-center">
              <FileText className="w-4 h-4 mr-1.5 text-blue-600" />
              7. 需求详情与特殊要求
            </span>
            <span className="text-[11px] font-normal text-slate-400">选填</span>
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={selectedCategory.descPlaceholder}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs md:text-sm text-slate-800 leading-relaxed"
          />
        </div>

        {/* 6. Coupon Discount Selection (统一8折初始优惠券) */}
        <div className="bg-rose-50/70 rounded-2xl p-3.5 border border-rose-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs md:text-sm font-bold text-slate-800 flex items-center">
              <Ticket className="w-4 h-4 mr-1.5 text-rose-600" />
              <span>道具与优惠券抵扣</span>
            </label>
            <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
              {availableCoupons.length > 0 ? `${availableCoupons.length} 张可用` : '暂无可用券'}
            </span>
          </div>

          {availableCoupons.length > 0 ? (
            <div className="space-y-1.5">
              <div className="flex flex-wrap gap-2">
                {availableCoupons.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCouponId(selectedCouponId === c.id ? null : c.id)}
                    className={`text-xs px-3 py-2 rounded-xl border flex items-center space-x-2 transition-all cursor-pointer ${
                      selectedCouponId === c.id
                        ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white border-transparent shadow-xs font-bold'
                        : 'bg-white text-slate-700 border-rose-200 hover:border-rose-300'
                    }`}
                  >
                    <span className="font-black">{c.discount || '8折'}</span>
                    <span className="truncate max-w-[140px]">{c.name}</span>
                    <span className="text-[10px] opacity-80">({c.minSpend || '无门槛'})</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedCouponId(null)}
                  className={`text-xs px-2.5 py-2 rounded-xl border transition-all cursor-pointer ${
                    selectedCouponId === null
                      ? 'bg-slate-800 text-white border-slate-800 font-bold'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  不使用优惠券
                </button>
              </div>
              <p className="text-[10px] text-rose-800/80">
                {selectedCouponId
                  ? '已为您抵扣 8 折优惠，差额将由官方和伴基金补贴给陪护师，不影响服务质量'
                  : '您也可以选择本次不使用，保留在个人中心用于后续大额订单'}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              当前暂无可用的优惠券，您可在「个人中心 - 我的优惠券」兑换或由管理员在后台发放。
            </p>
          )}
        </div>

        {/* Notice Card */}
        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/70 text-xs text-slate-600 space-y-1">
          <div className="font-bold text-slate-800 flex items-center">
            <ShieldCheck className="w-4 h-4 mr-1.5 text-blue-600" />
            发布与履约保障声明
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            发布后需求将同步公示至同城需求社区供合资格人员快速接单响应。服务产生的全部费用均在服务完成后由用户与服务人员在线下当面核对结清。
          </p>
        </div>

        {/* Submit Button & Back Action */}
        <div className="pt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={handleBackToCategories}
            className="py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs md:text-sm transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
          >
            重选分类
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span>{isSubmitting ? '正在发布...' : '立即发布'}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
