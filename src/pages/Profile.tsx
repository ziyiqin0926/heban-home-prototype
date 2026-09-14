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
  Heart
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Order, OrderStatus, EscortProfile, UserAddress, CouponItem } from '../types';
import EscortProfileModal from '../components/EscortProfileModal';
import { getEscortProfile } from '../data/escortProfiles';
import MyCoupons from '../components/MyCoupons';

interface ProfileProps {
  onNavigateToAgent?: () => void;
  onNavigateToManual?: () => void;
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

export default function Profile({ onNavigateToAgent, onNavigateToManual, initialView = 'menu', onViewChange }: ProfileProps) {
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
  const completedCount = orders.filter(o => o.status === 'completed').length;
  const cancelledCount = orders.filter(o => o.status === 'cancelled').length;

  return (
    <div className="profile-page min-h-full flex flex-col items-center">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs md:text-sm px-4 py-2.5 rounded-xl shadow-lg flex items-center space-x-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="w-full max-w-4xl flex flex-col flex-1">
        {/* ============================================================ */}
        {/* VIEW 1: PROFILE MAIN MENU (递进式一级入口) */}
        {/* ============================================================ */}
        {viewMode === 'menu' ? (
          <>
            {/* User Card Header */}
            <header className="profile-hero px-6 py-8 md:px-10 md:py-10 md:rounded-b-3xl text-white relative overflow-hidden shadow-md flex-shrink-0">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30 shadow-inner flex-shrink-0 relative">
                    <UserIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <h1 className="text-xl md:text-2xl font-bold">
                        和伴用户
                      </h1>
                      <span className="bg-white/25 text-[11px] font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                        {userPhone ? `${userPhone.slice(0, 3)}****${userPhone.slice(-4)}` : '已绑定手机'}
                      </span>
                    </div>
                    <p className="text-blue-100 text-xs md:text-sm mt-1">
                      专业陪诊 · 长者就医陪伴 · 邻里互助服务
                    </p>
                  </div>
                </div>
              </div>
            </header>

            {/* Main Profile Body */}
            <div className="profile-body p-4 md:p-6 space-y-4 -mt-3 md:-mt-6 relative z-20 flex-1 pb-28 md:pb-12">
              
              {/* Progressive Menu Items List */}
              <div className="profile-menu-card bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden divide-y divide-slate-100">
                
                {/* 1. Primary Entry: 我的需求订单 (Clickable into Dedicated Orders Page) */}
                <button
                  type="button"
                  onClick={() => changeViewMode('orders')}
                  className="w-full p-3.5 sm:p-4 md:p-5 flex items-center justify-between hover:bg-blue-50/40 active:bg-blue-50 transition-all cursor-pointer group text-left"
                >
                  <div className="flex items-center space-x-3 sm:space-x-3.5 min-w-0 flex-1 pr-2">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center flex-wrap gap-1.5">
                        <span className="text-sm md:text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors whitespace-nowrap">
                          我的订单
                        </span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[11px] md:text-xs font-bold rounded-full border border-blue-200 whitespace-nowrap">
                          {orders.length} 笔订单
                        </span>
                        {activeCount > 0 && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[11px] md:text-xs font-bold rounded-full border border-amber-200 whitespace-nowrap animate-pulse">
                            {activeCount} 进行中
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 sm:mt-1 truncate">
                        查看已发布订单与陪诊接单进展
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-blue-600 font-bold text-xs flex-shrink-0">
                    <span className="hidden sm:inline">查看全部</span>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>

                {/* 2. Primary Entry: 我的优惠券 (统一8折福利专享) */}
                <button
                  type="button"
                  onClick={() => changeViewMode('coupons')}
                  className="w-full p-3.5 sm:p-4 md:p-5 flex items-center justify-between hover:bg-rose-50/40 active:bg-rose-50 transition-all cursor-pointer group text-left"
                >
                  <div className="flex items-center space-x-3 sm:space-x-3.5 min-w-0 flex-1 pr-2">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-rose-500 via-orange-500 to-amber-500 text-white flex items-center justify-center shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Ticket className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center flex-wrap gap-1.5">
                        <span className="text-sm md:text-base font-bold text-slate-800 group-hover:text-rose-600 transition-colors whitespace-nowrap">
                          我的优惠券
                        </span>
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[11px] md:text-xs font-bold rounded-full border border-rose-200 whitespace-nowrap">
                          {coupons.filter(c => c.status === 'available').length} 张可用
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 sm:mt-1 truncate">
                        专属陪护优惠券 · 发布订单时可直接抵扣
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-rose-600 font-bold text-xs flex-shrink-0">
                    <span className="hidden sm:inline">查看</span>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>

                                {/* 3. Primary Entry: 我的收藏师傅 (关注金牌陪护师) */}
                <button
                  type="button"
                  onClick={() => changeViewMode("favorites")}
                  className="w-full p-3.5 sm:p-4 md:p-5 flex items-center justify-between hover:bg-rose-50/40 active:bg-rose-50 transition-all cursor-pointer group text-left border-t border-slate-100"
                >
                  <div className="flex items-center space-x-3 sm:space-x-3.5 min-w-0 flex-1 pr-2">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Heart className="w-5 h-5 fill-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center flex-wrap gap-1.5">
                        <span className="text-sm md:text-base font-bold text-slate-800 group-hover:text-rose-600 transition-colors whitespace-nowrap">
                          我的收藏
                        </span>
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[11px] md:text-xs font-bold rounded-full border border-rose-200 whitespace-nowrap">
                          {favoriteEscortIds.length} 位金牌师傅
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 sm:mt-1 truncate">
                        已收藏的常约师傅 · 点单时优先指派
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-rose-600 font-bold text-xs flex-shrink-0">
                    <span className="hidden sm:inline">查看</span>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>

                {/* 3. Unified Contact & Address Entry */}
                <button
                  type="button"
                  onClick={() => {
                    setUnifiedPhone(userPhone);
                    setUnifiedBackupPhone(backupPhone);
                    setUnifiedAddress(userAddress);
                    setIsEditingContactAddress(true);
                  }}
                  className="w-full p-3.5 sm:p-4 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer text-left border-t border-slate-100/80"
                >
                  <div className="flex items-center space-x-3 sm:space-x-3.5 min-w-0 flex-1 pr-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs sm:text-sm font-bold block text-slate-800 whitespace-nowrap">通讯地址</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
                        主号: {userPhone} {backupPhone ? `| 备用: ${backupPhone}` : ''} | 地址: {userAddress.province}{userAddress.city}{userAddress.district}{userAddress.street} {userAddress.detail}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <span className="text-xs font-medium text-slate-500 hidden sm:inline">管理</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </button>

                {/* 5. Family Health Profile */}
                <div className="w-full p-3.5 sm:p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-3 sm:space-x-3.5 min-w-0 flex-1 pr-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs sm:text-sm font-bold block text-slate-800 whitespace-nowrap">就诊人与长者健康备注</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5 truncate">已保存 2 位家庭就医成员档案信息</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </div>

                {/* 6. Supabase Cloud Database Status */}
                <div className="w-full p-3.5 sm:p-4 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-3 sm:space-x-3.5 min-w-0 flex-1 pr-2">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 flex-shrink-0">
                        <Database className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center flex-wrap gap-1.5">
                          <span className="text-xs sm:text-sm font-bold block text-slate-800 whitespace-nowrap">
                            Supabase 云端数据库
                          </span>
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-md border border-emerald-300 whitespace-nowrap">
                            已连接
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
                          需求订单与社区帖子实时持久化
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleManualSync}
                      disabled={isSyncing}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 transition-all flex-shrink-0 ml-auto sm:ml-0"
                      title="点击将当前所有需求与数据立即推送到 Supabase"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? '同步中...' : '立即同步'}</span>
                    </button>
                  </div>

                  {syncResult && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between animate-in fade-in duration-150">
                      <div className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className="font-medium">{syncResult}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Disclaimer & Offline Settlement */}
              <div className="bg-amber-50 rounded-2xl p-4 flex items-start space-x-3 border border-amber-200/60 shadow-xs">
                <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-amber-900 text-xs md:text-sm font-bold mb-1">信息撮合与线下结算保障</h4>
                  <p className="text-amber-800 text-xs leading-relaxed font-medium">
                    和伴仅提供信息智能解析、需求发布与陪护撮合服务，平台内不设任何线上资金充值或抽成。所有服务劳务报酬请您在服务完成后与陪护师在线下当面结清。
                  </p>
                </div>
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
