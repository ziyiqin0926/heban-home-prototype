import React, { useState } from 'react';
import {
  User as UserIcon,
  Phone,
  ShieldAlert,
  ChevronRight,
  MapPin,
  FileText,
  Sparkles,
  CheckCircle2,
  Database,
  RefreshCw,
  Clock,
  Timer,
  Coins,
  XCircle,
  AlertCircle,
  ArrowLeft,
  ClipboardList,
  Check,
  RotateCcw,
  FileEdit,
  ShieldCheck,
  Calendar,
  X,
  ExternalLink,
  ChevronDown,
  Ticket,
  Tag,
  BadgePercent,
  Camera,
  Heart,
  Settings,
  Headphones,
  Gift,
  WalletCards,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  ImagePlus,
  Award,
  Wallet,
  UserRound
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Order, OrderStatus, EscortProfile, UserAddress, CouponItem } from '../types';
import EscortProfileModal from '../components/EscortProfileModal';
import { getEscortProfile } from '../data/escortProfiles';
import MyCoupons from '../components/MyCoupons';
import ScheduleCalendar from '../components/ScheduleCalendar';
import FamilyProfiles from '../components/FamilyProfiles';

interface ProfileProps {
  onNavigateToAgent?: () => void;
  onNavigateToManual?: () => void;
  onNavigateToPartner?: () => void;
  initialView?: ViewMode;
  onViewChange?: (view: ViewMode) => void;
}

type FilterTab = 'all' | 'active' | 'completed' | 'cancelled';
type ViewMode = 'menu' | 'orders' | 'coupons' | 'favorites';

const CANCEL_REASONS = [
  '需求已自行解决 / 无需陪护',
  '就医或服务时间发生变动',
  '误操作 / 填写信息有误',
  '已找到其他陪护人员',
  '其他原因'
];

export default function Profile({ onNavigateToAgent, onNavigateToManual, onNavigateToPartner, initialView = 'menu', onViewChange }: ProfileProps) {
  const {
    userPhone,
    setUserPhone,
    backupPhone,
    setBackupPhone,
    userAddress,
    setUserAddress,
    orders,
    cancelOrder,
    completeOrder,
    syncAllToSupabase,
    setPrefilledPrompt,
    coupons,
    favoriteEscortIds,
    toggleFavoriteEscort,
    isEscortFavorite
  } = useAppContext();

  // Progressive Navigation State
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);
  const [profileRole, setProfileRole] = useState<'user' | 'escort'>('user');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<Order | null>(null);
  const [viewingEscortProfile, setViewingEscortProfile] = useState<EscortProfile | null>(null);

  // Settings modals
  const [isEditingContactAddress, setIsEditingContactAddress] = useState(false);
  const [unifiedPhone, setUnifiedPhone] = useState(userPhone);
  const [unifiedBackupPhone, setUnifiedBackupPhone] = useState(backupPhone);
  const [unifiedAddress, setUnifiedAddress] = useState<UserAddress>(userAddress);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  // Cancellation Modal State
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showScheduleCalendar, setShowScheduleCalendar] = useState(false);
  const [showFamilyProfiles, setShowFamilyProfiles] = useState(false);

  const changeViewMode = (nextView: ViewMode) => {
    setViewMode(nextView);
    onViewChange?.(nextView);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const openScheduleCalendar = () => setShowScheduleCalendar(true);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const count = await syncAllToSupabase();
      setSyncResult(`已成功同步 ${count} 条记录到 Supabase 云端数据库！`);
    } catch (e: any) {
      setSyncResult('同步异常: ' + (e.message || '网络异常'));
    } finally {
      setIsSyncing(false);
      setTimeout(() => {
        setSyncResult(null);
      }, 5000);
    }
  };

  const handleSaveContactAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (unifiedPhone.trim()) {
      setUserPhone(unifiedPhone.trim());
      setBackupPhone(unifiedBackupPhone.trim());
      setUserAddress(unifiedAddress);
      setIsEditingContactAddress(false);
      showToast('通讯地址信息已更新');
    }
  };

  const handleConfirmCancel = () => {
    if (cancellingOrder) {
      cancelOrder(cancellingOrder.id);
      showToast(`需求订单「${cancellingOrder.title}」已成功取消`);
      // Update selectedOrderDetail if currently viewed
      if (selectedOrderDetail && selectedOrderDetail.id === cancellingOrder.id) {
        setSelectedOrderDetail(prev => prev ? { ...prev, status: 'cancelled' } : null);
      }
      setCancellingOrder(null);
    }
  };

  const handleComplete = (order: Order) => {
    completeOrder(order.id);
    showToast(`需求订单「${order.title}」已标记为服务完成`);
    if (selectedOrderDetail && selectedOrderDetail.id === order.id) {
      setSelectedOrderDetail(prev => prev ? { ...prev, status: 'completed' } : null);
    }
  };

  const handleRepublish = (order: Order) => {
    const prompt = `${order.time}在${order.location}需要【${order.type}】服务：${order.description}，联系电话${order.phone || userPhone}`;
    setPrefilledPrompt(prompt);
    if (onNavigateToAgent) {
      onNavigateToAgent();
    }
  };

  // Filter orders based on active tab
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return order.status === 'pending' || order.status === 'accepted';
    if (activeTab === 'completed') return order.status === 'completed';
    if (activeTab === 'cancelled') return order.status === 'cancelled';
    return true;
  });

  const activeCount = orders.filter(o => o.status === 'pending' || o.status === 'accepted').length;
  const publishedCount = orders.filter(o => o.status !== 'cancelled').length;
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const fulfillingCount = orders.filter(o => o.status === 'accepted').length;
  const completedCount = orders.filter(o => o.status === 'completed').length;
  const cancelledCount = orders.filter(o => o.status === 'cancelled').length;
  const isEscortMode = profileRole === 'escort';
  const orderMetrics = isEscortMode
    ? [
        { label: '待接单', count: 0, icon: ClipboardList, color: 'text-amber-500' },
        { label: '已接单', count: 0, icon: BadgeCheck, color: 'text-emerald-500' },
        { label: '履约中', count: 0, icon: Clock, color: 'text-indigo-500' },
        { label: '已完成', count: 0, icon: Check, color: 'text-slate-500' }
      ]
    : [
        { label: '已发布', count: publishedCount, icon: ClipboardList, color: 'text-amber-500' },
        { label: '待接单', count: pendingCount, icon: Clock, color: 'text-orange-500' },
        { label: '履约中', count: fulfillingCount, icon: BadgeCheck, color: 'text-indigo-500' },
        { label: '已完成', count: completedCount, icon: Check, color: 'text-slate-500' }
      ];
  const serviceSpaceItems = isEscortMode
    ? [
        { label: '服务档案', hint: '技能与资质', icon: FileText, tone: 'bg-indigo-50 text-indigo-600', action: () => showToast('服务档案编辑入口已准备') },
        { label: '接单日程', hint: '可接时间', icon: CalendarDays, tone: 'bg-cyan-50 text-cyan-600', action: openScheduleCalendar },
        { label: '服务动态', hint: '案例与心得', icon: ImagePlus, tone: 'bg-rose-50 text-rose-500', action: () => showToast('服务动态发布入口已准备') },
        { label: '任务奖励', hint: '待领取', icon: Gift, tone: 'bg-amber-50 text-amber-600', action: () => showToast('任务与奖励中心即将开放') }
      ]
    : [
        { label: '个人档案', hint: '资料与联系人', icon: FileText, tone: 'bg-indigo-50 text-indigo-600', action: () => { setUnifiedPhone(userPhone); setUnifiedBackupPhone(backupPhone); setUnifiedAddress(userAddress); setIsEditingContactAddress(true); } },
        { label: '偏好日程', hint: '可约时间', icon: CalendarDays, tone: 'bg-cyan-50 text-cyan-600', action: openScheduleCalendar },
        { label: '收藏小伴', hint: `${favoriteEscortIds.length} 位`, icon: Heart, tone: 'bg-rose-50 text-rose-500', action: () => changeViewMode('favorites') },
        { label: '任务奖励', hint: '待领取', icon: Gift, tone: 'bg-amber-50 text-amber-600', action: () => showToast('任务与奖励中心即将开放') }
      ];
  const assetItems = isEscortMode
    ? [
        { label: '待结算', value: '0 元', icon: Wallet, tone: 'text-rose-500', action: () => showToast('服务结算明细正在接入') },
        { label: '平台积分', value: '0 分', icon: Award, tone: 'text-amber-500', action: () => showToast('积分明细正在接入') },
        { label: '分享奖励', value: '待领取', icon: Gift, tone: 'text-emerald-500', action: () => showToast('发布服务动态可获得平台奖励') },
        { label: '服务钱包', value: '查看', icon: WalletCards, tone: 'text-indigo-500', action: () => showToast('服务钱包入口已准备') }
      ]
    : [
        { label: '优惠券', value: `${coupons.filter(c => c.status === 'available').length} 张`, icon: Ticket, tone: 'text-rose-500', action: () => changeViewMode('coupons') },
        { label: '积分', value: '0 分', icon: Award, tone: 'text-amber-500', action: () => showToast('积分明细正在接入') },
        { label: '分享奖励', value: '待领取', icon: Gift, tone: 'text-emerald-500', action: () => showToast('分享订单可获得平台奖励') },
        { label: '服务钱包', value: '查看', icon: WalletCards, tone: 'text-indigo-500', action: () => showToast('服务钱包入口已准备') }
      ];

  return (
    <div className="profile-page min-h-full flex flex-col items-center">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs md:text-sm px-4 py-2.5 rounded-xl shadow-lg flex items-center space-x-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
      {showScheduleCalendar && (
        <ScheduleCalendar
          onClose={() => setShowScheduleCalendar(false)}
          onOpenAgent={(prompt) => {
            setShowScheduleCalendar(false);
            setPrefilledPrompt(prompt);
            onNavigateToAgent?.();
          }}
          onOpenProfile={() => { setShowScheduleCalendar(false); setShowFamilyProfiles(true); }}
        />
      )}
      {showFamilyProfiles && <FamilyProfiles onClose={() => setShowFamilyProfiles(false)} />}

      <div className="w-full max-w-4xl flex flex-col flex-1">
        {/* ============================================================ */}
        {/* VIEW 1: PROFILE MAIN MENU (递进式一级入口) */}
        {/* ============================================================ */}
        {viewMode === 'menu' ? (
          <>
            <header className="bg-slate-950 px-5 pt-5 pb-6 md:px-8 md:pt-7 md:pb-8 text-white relative overflow-hidden flex-shrink-0">
              <div className="absolute inset-x-0 bottom-0 h-20 bg-indigo-950/60 pointer-events-none"></div>
              <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-300 to-indigo-500 flex items-center justify-center shadow-lg flex-shrink-0">
                    <UserIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl md:text-2xl font-black tracking-tight">{isEscortMode ? '小伴师傅' : '和伴用户'}</h1>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 border border-emerald-300/30 px-2 py-0.5 text-[10px] font-bold text-emerald-200">
                        <BadgeCheck className="w-3 h-3" /> 已认证
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-300 truncate">
                      唯一 ID：HB-{userPhone ? userPhone.slice(-6) : '0826'} · {userPhone ? `${userPhone.slice(0, 3)}****${userPhone.slice(-4)}` : '待绑定手机号'}
                    </p>
                    <p className="mt-2 text-[11px] text-cyan-200">
                      {isEscortMode ? '展示真实技能，连接附近的服务需求' : '把需求交给和伴，把时间留给生活'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => showToast('个人主页编辑入口已保留，后续接入资料编辑')}
                  className="w-9 h-9 rounded-xl border border-white/15 bg-white/10 flex items-center justify-center text-slate-200 hover:bg-white/15 active:scale-95 transition-transform"
                  title="编辑个人主页"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>

              <div className="relative z-10 mt-5 grid grid-cols-3 gap-2.5 text-center">
                <div className="rounded-xl bg-white/8 border border-white/10 py-2.5">
                  <strong className="block text-lg font-black">{isEscortMode ? 0 : publishedCount}</strong>
                  <span className="text-[10px] text-slate-300">{isEscortMode ? '可接订单' : '已发布'}</span>
                </div>
                <div className="rounded-xl bg-white/8 border border-white/10 py-2.5">
                  <strong className="block text-lg font-black">{isEscortMode ? 0 : pendingCount}</strong>
                  <span className="text-[10px] text-slate-300">{isEscortMode ? '已接订单' : '待接单'}</span>
                </div>
                <div className="rounded-xl bg-white/8 border border-white/10 py-2.5">
                  <strong className="block text-lg font-black">{isEscortMode ? 0 : fulfillingCount}</strong>
                  <span className="text-[10px] text-slate-300">{isEscortMode ? '服务完成' : '履约中'}</span>
                </div>
              </div>

              <div className="relative z-10 mt-4 flex rounded-xl bg-white/10 p-1 border border-white/10">
                <button
                  type="button"
                  onClick={() => setProfileRole('user')}
                  className={`flex-1 rounded-lg py-2 text-xs font-bold transition-colors ${profileRole === 'user' ? 'bg-white text-slate-900' : 'text-slate-300 hover:text-white'}`}
                >
                  用户中心
                </button>
                <button
                  type="button"
                  onClick={() => setProfileRole('escort')}
                  className={`flex-1 rounded-lg py-2 text-xs font-bold transition-colors ${profileRole === 'escort' ? 'bg-cyan-300 text-slate-950' : 'text-slate-300 hover:text-white'}`}
                >
                  小伴师傅端
                </button>
              </div>
            </header>

            <div className="profile-body bg-slate-50 p-4 md:p-6 space-y-4 flex-1 pb-28 md:pb-12">
              <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="px-4 pt-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-black text-slate-900">订单中心</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isEscortMode ? '查看可接订单、已接单与履约进程' : '查看已发布、待接单与履约进程'}
                    </p>
                  </div>
                  <button type="button" onClick={() => changeViewMode('orders')} className="text-xs font-bold text-indigo-600 flex items-center gap-0.5">
                    全部订单 <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-4 divide-x divide-slate-100 mt-4 border-t border-slate-100">
                  {orderMetrics.map(({ label, count, icon: Icon, color }) => (
                    <button key={label} type="button" onClick={() => changeViewMode('orders')} className="py-3.5 flex flex-col items-center gap-1 hover:bg-slate-50 active:bg-slate-100 transition-colors">
                      <Icon className={`w-5 h-5 ${color}`} />
                      <strong className="text-sm text-slate-800">{count}</strong>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{label}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-sm font-black text-slate-900">{isEscortMode ? '我的接单空间' : '我的服务空间'}</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isEscortMode ? '服务档案、接单日程、动态与奖励' : '档案、偏好、日程和常用对象'}
                    </p>
                  </div>
                  <UserRound className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {serviceSpaceItems.map(({ label, hint, icon: Icon, tone, action }) => (
                    <button key={label} type="button" onClick={action} className="min-w-0 rounded-xl border border-slate-100 p-2.5 text-center hover:border-indigo-200 hover:bg-indigo-50/30 active:scale-[.98] transition-all">
                      <span className={`mx-auto flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}>
                        <Icon className={`w-4 h-4 ${label === '收藏小伴' ? 'fill-current' : ''}`} />
                      </span>
                      <strong className="mt-2 block truncate text-[11px] text-slate-800">{label}</strong>
                      <span className="mt-0.5 block truncate text-[10px] text-slate-400">{hint}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-sm font-black text-slate-900">权益与资产</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">优惠券、积分与平台奖励</p>
                  </div>
                  <Wallet className="w-4 h-4 text-amber-500" />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {assetItems.map(({ label, value, icon: Icon, tone, action }) => (
                    <button key={label} type="button" onClick={action} className="rounded-xl py-2 text-center hover:bg-slate-50 active:scale-[.98] transition-all">
                      <Icon className={`mx-auto w-5 h-5 ${tone}`} />
                      <strong className="mt-1.5 block text-xs text-slate-800">{value}</strong>
                      <span className="mt-0.5 block text-[10px] text-slate-400">{label}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button type="button" onClick={() => showToast('内容创作中心即将开放投稿与服务名片')} className="text-left rounded-2xl border border-cyan-200 bg-cyan-50/70 p-4 hover:bg-cyan-50 active:scale-[.99] transition-all">
                  <div className="flex items-center justify-between">
                    <span className="w-9 h-9 rounded-xl bg-cyan-500 text-white flex items-center justify-center"><ImagePlus className="w-4 h-4" /></span>
                    <ChevronRight className="w-4 h-4 text-cyan-600" />
                  </div>
                  <strong className="mt-3 block text-sm text-slate-900">{isEscortMode ? '服务内容创作中心' : '订单分享中心'}</strong>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                    {isEscortMode ? '发布服务案例、心得与个人名片，获得平台分享奖励' : '分享订单到朋友圈和群，加速匹配合适的小伴师傅'}
                  </p>
                </button>
                <button type="button" onClick={() => showToast('客服会尽快为你安排人工跟进')} className="text-left rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 hover:bg-indigo-50 active:scale-[.99] transition-all">
                  <div className="flex items-center justify-between">
                    <span className="w-9 h-9 rounded-xl bg-indigo-500 text-white flex items-center justify-center"><Headphones className="w-4 h-4" /></span>
                    <ChevronRight className="w-4 h-4 text-indigo-600" />
                  </div>
                  <strong className="mt-3 block text-sm text-slate-900">联系客服</strong>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500">订单、档案或匹配问题，可进入人工协助</p>
                </button>
              </section>

              <section className="rounded-2xl bg-slate-900 p-4 text-white flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <BriefcaseBusiness className="w-4 h-4 text-cyan-300" />
                    <strong className="text-sm">{isEscortMode ? '返回用户中心' : '成为小伴师傅'}</strong>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    {isEscortMode ? '切换回用户身份，发布和管理陪伴需求' : '认证技能，展示服务名片，连接更多真实需求'}
                  </p>
                </div>
                <button type="button" onClick={() => isEscortMode ? setProfileRole('user') : setProfileRole('escort')} className="flex-shrink-0 rounded-xl bg-cyan-300 px-3 py-2 text-xs font-black text-slate-950 hover:bg-cyan-200 active:scale-95 transition-transform">
                  {isEscortMode ? '返回用户端' : '进入师傅端'}
                </button>
              </section>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Database className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <strong className="block text-xs text-emerald-950">云端数据同步</strong>
                    <span className="block truncate text-[10px] text-emerald-700">订单与社区内容持续保存</span>
                  </div>
                </div>
                <button type="button" onClick={handleManualSync} disabled={isSyncing} className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[10px] font-bold text-white disabled:opacity-50 active:scale-95 transition-transform">
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? '同步中' : '立即同步'}
                </button>
              </div>
              {syncResult && <div className="rounded-xl bg-emerald-100 px-3 py-2 text-[11px] text-emerald-800">{syncResult}</div>}

              <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-[10px] leading-relaxed text-amber-800 border border-amber-200/70">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-600" />
                <span>和伴提供信息解析、需求发布与陪护撮合服务，服务劳务报酬请在服务完成后与陪护师线下结清。</span>
              </div>
            </div>
          </>
        ) : viewMode === 'coupons' ? (
          /* ============================================================ */
          /* VIEW 2: DEDICATED COUPONS VIEW (统一8折优惠券专区) */
          /* ============================================================ */
          <MyCoupons
            onBack={() => changeViewMode('menu')}
            onUseCoupon={(coupon) => {
              showToast(`已选「${coupon.name}」（${coupon.discount || '8折'}），已为您复制券码 ${coupon.code}`);
              if (onNavigateToAgent) {
                onNavigateToAgent();
              } else if (onNavigateToManual) {
                onNavigateToManual();
              }
            }}
          />
        ) : (
          /* ============================================================ */
          /* VIEW 3: DEDICATED ORDERS VIEW (递进式二级订单列表) */
          /* ============================================================ */
          <div className="flex flex-col flex-1 pb-28 md:pb-12">
            {/* Top Bar with Back Button */}
            <header className="bg-white px-4 py-3.5 md:px-6 md:py-4 sticky top-0 z-30 border-b border-slate-200/80 shadow-xs flex items-center justify-between gap-2">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => changeViewMode('menu')}
                  className="p-1.5 -ml-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center space-x-1"
                  title="返回个人中心"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-base md:text-lg font-bold text-slate-800">我的订单</h1>
                  <span className="text-xs text-slate-400">共 {orders.length} 笔订单记录</span>
                </div>
              </div>
            </header>

            {/* Filter Tabs */}
            <div className="bg-white border-b border-slate-200/80 px-4 pt-2 overflow-x-auto scrollbar-none sticky top-14 z-20 shadow-2xs">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'all'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  全部 ({orders.length})
                </button>
                <button
                  onClick={() => setActiveTab('active')}
                  className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
                    activeTab === 'active'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>进行中 / 待接单</span>
                  {activeCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  )}
                  <span className="text-xs text-slate-400 font-normal">({activeCount})</span>
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'completed'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  已完成 ({completedCount})
                </button>
                <button
                  onClick={() => setActiveTab('cancelled')}
                  className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'cancelled'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  已取消 ({cancelledCount})
                </button>
              </div>
            </div>

            {/* Orders List Content */}
            <div className="p-4 md:p-6 space-y-3.5 max-w-3xl w-full mx-auto">
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center space-y-3 border border-slate-200/80 shadow-xs">
                  <div className="w-14 h-14 mx-auto bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center">
                    <ClipboardList className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm md:text-base font-bold text-slate-700">暂无该状态下的订单</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    您可通过 AI 智能助手或手动表单发布陪护、陪诊需求，订单支持随时查看与取消。
                  </p>
                  <div className="flex justify-center space-x-2 pt-2">
                    {onNavigateToAgent && (
                      <button
                        onClick={onNavigateToAgent}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center space-x-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI 智能发需求</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                filteredOrders.map(order => {
                  const isPending = order.status === 'pending';
                  const isAccepted = order.status === 'accepted';
                  const isCompleted = order.status === 'completed';
                  const isCancelled = order.status === 'cancelled';

                  return (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrderDetail(order)}
                      className={`bg-white rounded-2xl p-4 md:p-5 border transition-all cursor-pointer hover:shadow-md relative overflow-hidden group ${
                        isCancelled
                          ? 'border-slate-200/80 bg-slate-50/50 opacity-80'
                          : isAccepted
                          ? 'border-emerald-200 bg-emerald-50/15 shadow-xs'
                          : 'border-slate-200 shadow-xs hover:border-blue-300'
                      }`}
                    >
                      {/* Top status bar */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="px-2.5 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-2xs">
                            {order.type}
                          </span>
                          {order.city && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-md">
                              {order.city}
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400 font-mono">
                            #{order.id}
                          </span>
                        </div>

                        {/* Status Tag */}
                        <div>
                          {isPending && (
                            <span className="inline-flex items-center px-2.5 py-0.8 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3.5 h-3.5 mr-1 text-amber-500" />
                              匹配中 / 待接单
                            </span>
                          )}
                          {isAccepted && (
                            <span className="inline-flex items-center px-2.5 py-0.8 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                              已匹配接单
                            </span>
                          )}
                          {isCompleted && (
                            <span className="inline-flex items-center px-2.5 py-0.8 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              <Check className="w-3.5 h-3.5 mr-1 text-slate-500" />
                              已完成
                            </span>
                          )}
                          {isCancelled && (
                            <span className="inline-flex items-center px-2.5 py-0.8 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <XCircle className="w-3.5 h-3.5 mr-1 text-rose-500" />
                              已取消
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Quick Info */}
                      <div className="mt-3">
                        <h3 className={`text-sm md:text-base font-bold group-hover:text-blue-600 transition-colors ${
                          isCancelled ? 'text-slate-500 line-through' : 'text-slate-800'
                        }`}>
                          {order.title}
                        </h3>

                        {/* Metadata Pills */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5 text-xs text-slate-600">
                          <div className="flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-600 flex-shrink-0" />
                            <span>时间：<strong>{order.time}</strong></span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-3.5 h-3.5 mr-1.5 text-blue-600 flex-shrink-0" />
                            <span className="truncate">地点：<strong>{order.location}</strong></span>
                          </div>
                          <div className="flex items-center">
                            <Coins className="w-3.5 h-3.5 mr-1.5 text-amber-500 flex-shrink-0" />
                            <span>期望报酬：<strong className="text-amber-600 font-bold">{order.budget || '150 元'}</strong></span>
                          </div>
                          <div className="flex items-center">
                            <Timer className="w-3.5 h-3.5 mr-1.5 text-blue-600 flex-shrink-0" />
                            <span>预估耗时：<strong>{order.estimatedDuration || '2 小时'}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Card Bottom CTA */}
                      <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[11px]">
                          {new Date(order.createdAt).toLocaleDateString('zh-CN')} 发布
                        </span>

                        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                          {(isPending || isAccepted) && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedReason(CANCEL_REASONS[0]);
                                setCancellingOrder(order);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors cursor-pointer flex items-center space-x-1"
                            >
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>取消订单</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedOrderDetail(order)}
                            className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs flex items-center space-x-1 transition-colors cursor-pointer"
                          >
                            <span>查看详情</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* VIEW 3: ORDER DETAIL MODAL / SHEET (递进式三级详细信息弹窗) */}
      {/* ============================================================ */}
      {selectedOrderDetail && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-2xs">
                  {selectedOrderDetail.type}
                </span>
                <h3 className="text-base font-bold text-slate-800">订单详细信息</h3>
                <span className="text-xs text-slate-400 font-mono">#{selectedOrderDetail.id}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderDetail(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700">
              
              {/* Status Banner */}
              <div className={`p-4 rounded-2xl border flex items-start space-x-3 ${
                selectedOrderDetail.status === 'pending'
                  ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                  : selectedOrderDetail.status === 'accepted'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : selectedOrderDetail.status === 'completed'
                  ? 'bg-slate-50 border-slate-200 text-slate-700'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                {selectedOrderDetail.status === 'pending' && <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />}
                {selectedOrderDetail.status === 'accepted' && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />}
                {selectedOrderDetail.status === 'completed' && <Check className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />}
                {selectedOrderDetail.status === 'cancelled' && <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />}
                
                <div>
                  <div className="font-bold text-sm">
                    {selectedOrderDetail.status === 'pending' && '智能匹配中 · 等待陪护师接单'}
                    {selectedOrderDetail.status === 'accepted' && '已匹配接单 · 陪护师准备中'}
                    {selectedOrderDetail.status === 'completed' && '服务已完成'}
                    {selectedOrderDetail.status === 'cancelled' && '需求订单已取消'}
                  </div>
                  <p className="text-xs opacity-80 mt-0.5">
                    {selectedOrderDetail.status === 'pending' && '系统正向同城匹配优质陪护师，您可随时在下方取消该需求。'}
                    {selectedOrderDetail.status === 'accepted' && '陪护师已接单，请保持手机畅通或直接电话联系确认细节。'}
                    {selectedOrderDetail.status === 'completed' && '本次服务已完结，劳务费用已线下当面结清。'}
                    {selectedOrderDetail.status === 'cancelled' && '该需求已停止匹配并从同城社区广场下架。'}
                  </p>
                </div>
              </div>

              {/* Order Title */}
              <div>
                <span className="text-xs font-bold text-slate-400 block mb-1">需求主题</span>
                <h2 className="text-base md:text-lg font-bold text-slate-800 leading-snug">
                  {selectedOrderDetail.title}
                </h2>
              </div>

              {/* Core Details Grid */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 text-[11px] block">服务时间</span>
                  <span className="font-bold text-slate-800 text-sm flex items-center mt-0.5">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-blue-600" />
                    {selectedOrderDetail.time}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] block">预估服务时长</span>
                  <span className="font-bold text-slate-800 text-sm flex items-center mt-0.5">
                    <Timer className="w-3.5 h-3.5 mr-1 text-blue-600" />
                    {selectedOrderDetail.estimatedDuration || '2 小时'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] block">期望劳务报酬 (线下结清)</span>
                  <span className="font-bold text-amber-600 text-sm flex items-center mt-0.5">
                    <Coins className="w-3.5 h-3.5 mr-1 text-amber-500" />
                    {selectedOrderDetail.budget || '150 元'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] block">联系手机</span>
                  <span className="font-bold text-slate-800 text-sm flex items-center mt-0.5">
                    <Phone className="w-3.5 h-3.5 mr-1 text-blue-600" />
                    {selectedOrderDetail.phone || userPhone}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-slate-400 text-[11px] block">集合/就诊地址</span>
                  <span className="font-bold text-slate-800 text-sm flex items-center mt-0.5">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-blue-600" />
                    {selectedOrderDetail.location} ({selectedOrderDetail.city || '同城'})
                  </span>
                </div>
              </div>

              {/* Requirements Description */}
              {selectedOrderDetail.description && (
                <div>
                  <span className="text-xs font-bold text-slate-400 block mb-1">需求详细说明与就医要求</span>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 leading-relaxed text-slate-700">
                    {selectedOrderDetail.description}
                  </div>
                </div>
              )}

              {/* Service Photos / Verification Photos */}
              <div>
                <span className="text-xs font-bold text-slate-400 block mb-1.5 flex items-center">
                  <Camera className="w-3.5 h-3.5 mr-1 text-blue-600" />
                  就诊地点与服务实拍图
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative rounded-xl overflow-hidden aspect-16/10 bg-slate-100 border border-slate-200 shadow-2xs group">
                    <img
                      src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80"
                      alt="服务就医现场"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md font-medium">
                      就诊服务现场
                    </span>
                  </div>
                  <div className="relative rounded-xl overflow-hidden aspect-16/10 bg-slate-100 border border-slate-200 shadow-2xs group">
                    <img
                      src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80"
                      alt="医院挂号导诊"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md font-medium">
                      门诊挂号导诊
                    </span>
                  </div>
                </div>
              </div>

              {/* Matched Escort Details Card */}
              {selectedOrderDetail.status === 'accepted' && selectedOrderDetail.matchedEscort && (() => {
                const escortProfile = getEscortProfile(selectedOrderDetail.matchedEscort);
                return (
                  <div className="p-4 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-blue-50/40 border border-emerald-200 rounded-2xl space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-xs font-bold text-emerald-950">已匹配接单陪护师</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="px-2 py-0.5 bg-emerald-100/90 text-emerald-800 text-[10px] font-bold rounded">
                          ⭐ 评分 {escortProfile.rating}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100/80 text-blue-800 text-[10px] font-bold rounded">
                          {escortProfile.yearsOfExperience}年陪护
                        </span>
                      </div>
                    </div>

                    {/* Clickable Escort Profile Mini-Card */}
                    <div
                      onClick={() => setViewingEscortProfile(escortProfile)}
                      className="p-3 bg-white rounded-xl border border-emerald-100 hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer group flex items-center justify-between gap-3"
                      title="点击查看陪护师详细主页、照片、资质证书与雇主评价"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="relative flex-shrink-0">
                          <img
                            src={escortProfile.avatar}
                            alt={escortProfile.name}
                            className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-400/50 shadow-xs group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full ring-1 ring-white" title="已实名认证">
                            <ShieldCheck className="w-3 h-3" />
                          </div>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                              {escortProfile.name}
                            </span>
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.2 rounded border border-emerald-200/50">
                              实名持证
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {escortProfile.title}
                          </p>
                          <p className="text-[11px] text-emerald-600 font-medium truncate">
                            {escortProfile.tag}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center text-xs font-bold text-emerald-700 group-hover:text-emerald-800 flex-shrink-0 pl-1">
                        <span className="hidden sm:inline">查看主页</span>
                        <ChevronRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setViewingEscortProfile(escortProfile)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center space-x-1 shadow-2xs"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>查看陪护师个人主页</span>
                      </button>

                      <a
                        href={`tel:${escortProfile.phone}`}
                        className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>电话联系</span>
                      </a>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedOrderDetail(null)}
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                返回列表
              </button>

              <div className="flex items-center space-x-2">
                {/* Cancel Button */}
                {(selectedOrderDetail.status === 'pending' || selectedOrderDetail.status === 'accepted') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedReason(CANCEL_REASONS[0]);
                      setCancellingOrder(selectedOrderDetail);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center space-x-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>取消此订单</span>
                  </button>
                )}

                {/* Complete Button */}
                {selectedOrderDetail.status === 'accepted' && (
                  <button
                    type="button"
                    onClick={() => handleComplete(selectedOrderDetail)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>确认服务完成</span>
                  </button>
                )}

                {/* Republish Button */}
                {(selectedOrderDetail.status === 'cancelled' || selectedOrderDetail.status === 'completed') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOrderDetail(null);
                      handleRepublish(selectedOrderDetail);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>以此需求再次发布</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* CANCEL ORDER CONFIRMATION MODAL */}
      {/* ============================================================ */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 sm:p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-rose-600 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">确认取消需求订单？</h3>
                <p className="text-xs text-slate-400">取消后该需求将从同城社区下架并停止匹配</p>
              </div>
            </div>

            {/* Target Order Summary */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 space-y-1 text-xs text-slate-600">
              <div className="font-bold text-slate-800 text-sm">{cancellingOrder.title}</div>
              <div>类型：{cancellingOrder.type} · 时间：{cancellingOrder.time}</div>
              <div>地点：{cancellingOrder.location}</div>
            </div>

            {/* Cancellation Reason Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">请选择取消原因：</label>
              <div className="space-y-1.5">
                {CANCEL_REASONS.map(reason => (
                  <label
                    key={reason}
                    onClick={() => setSelectedReason(reason)}
                    className={`flex items-center space-x-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                      selectedReason === reason
                        ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                        : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancel_reason"
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs md:text-sm hover:bg-slate-200 transition-colors cursor-pointer"
              >
                暂不取消
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs md:text-sm transition-colors shadow-sm cursor-pointer"
              >
                确认取消订单
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Contact & Address Modal */}
      {isEditingContactAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-center text-slate-800">编辑通讯与地址信息</h3>
            <form onSubmit={handleSaveContactAddress} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">默认联系手机号</label>
                <input
                  type="tel"
                  required
                  value={unifiedPhone}
                  onChange={(e) => setUnifiedPhone(e.target.value)}
                  placeholder="请输入默认手机号"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">备用联系手机号 (选填)</label>
                <input
                  type="tel"
                  value={unifiedBackupPhone}
                  onChange={(e) => setUnifiedBackupPhone(e.target.value)}
                  placeholder="请输入备用手机号"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">常用服务地址</label>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      required
                      value={unifiedAddress.province}
                      onChange={(e) => setUnifiedAddress({ ...unifiedAddress, province: e.target.value })}
                      placeholder="省份"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    />
                    <input
                      type="text"
                      required
                      value={unifiedAddress.city}
                      onChange={(e) => setUnifiedAddress({ ...unifiedAddress, city: e.target.value })}
                      placeholder="城市"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    />
                    <input
                      type="text"
                      required
                      value={unifiedAddress.district}
                      onChange={(e) => setUnifiedAddress({ ...unifiedAddress, district: e.target.value })}
                      placeholder="区/县"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={unifiedAddress.street}
                      onChange={(e) => setUnifiedAddress({ ...unifiedAddress, street: e.target.value })}
                      placeholder="街道/乡镇"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    />
                    <input
                      type="text"
                      required
                      value={unifiedAddress.detail}
                      onChange={(e) => setUnifiedAddress({ ...unifiedAddress, detail: e.target.value })}
                      placeholder="详细门牌号"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingContactAddress(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-xs cursor-pointer"
                >
                  保存修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
        {/* ============================================================ */}
        {/* VIEW 4: MY FAVORITES (我的收藏师傅专区) */}
        {/* ============================================================ */}
        {viewMode === "favorites" && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
            {/* 顶栏 */}
            <header className="bg-white px-4 py-3 border-b border-slate-200/80 flex items-center justify-between sticky top-0 z-10 shadow-2xs">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => changeViewMode("menu")}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center space-x-2">
                  <h1 className="text-base font-extrabold text-slate-800">我的收藏</h1>
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200">
                    {favoriteEscortIds.length} 位
                  </span>
                </div>
              </div>
            </header>

            {/* 列表内容 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
              {favoriteEscortIds.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
                  <Heart className="w-12 h-12 text-slate-300 mx-auto stroke-1" />
                  <p className="text-sm font-bold text-slate-700 mt-3">暂无收藏的师傅</p>
                  <p className="text-xs text-slate-400 mt-1">
                    在选师页面或师傅个人主页点击【收藏】，可在此快速回访与指定
                  </p>
                </div>
              ) : (
                favoriteEscortIds.map(id => {
                  const escort = getEscortProfile(id);
                  if (!escort) return null;
                  return (
                    <article
                      key={id}
                      onClick={() => setViewingEscortProfile(escort)}
                      className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all cursor-pointer flex space-x-3.5 items-start relative group"
                    >
                      <img
                        src={escort.avatar}
                        alt={escort.name}
                        className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 border border-slate-100 shadow-2xs"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-base font-black text-slate-900">{escort.name}</h3>
                            <span className="text-xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-100">
                              {escort.gender} · {escort.age}岁
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavoriteEscort(id);
                            }}
                            className="p-1.5 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all cursor-pointer"
                            title="取消收藏"
                          >
                            <Heart className="w-4 h-4 fill-rose-500" />
                          </button>
                        </div>

                        <p className="text-xs text-slate-600 font-medium mt-1 line-clamp-1">{escort.title}</p>

                        <div className="flex flex-wrap gap-1 mt-2">
                          {(escort.specialties || [escort.tag]).slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                          <span>已服务 <strong className="text-slate-800 font-bold">{escort.serviceCount}+</strong> 次 · 好评率 <strong className="text-emerald-600 font-bold">99.8%</strong></span>
                          <span className="text-blue-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
                            查看主页 <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
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
