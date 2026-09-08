import React, { useState } from 'react';
import {
  Ticket,
  Clock,
  ArrowLeft,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CouponItem } from '../types';

interface MyCouponsProps {
  onBack: () => void;
  onUseCoupon?: (coupon: CouponItem) => void;
}

export default function MyCoupons({ onBack, onUseCoupon }: MyCouponsProps) {
  const {
    coupons,
    syncCouponsWithSupabase,
    isCouponsSyncing
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<'available' | 'used' | 'expired'>('available');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const availableCoupons = coupons.filter(c => c.status === 'available');
  const usedCoupons = coupons.filter(c => c.status === 'used');
  const expiredCoupons = coupons.filter(c => c.status === 'expired');

  const displayedCoupons = coupons.filter(c => c.status === activeTab);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  return (
    <div className="flex flex-col flex-1 pb-28 md:pb-12 bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="bg-white px-4 py-3.5 md:px-6 md:py-4 sticky top-0 z-30 border-b border-slate-200/80 shadow-xs flex items-center justify-between gap-2">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 -ml-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center space-x-1"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-bold text-slate-700 hidden sm:inline">返回个人中心</span>
          </button>
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-xs">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold text-slate-800">
                我的优惠券
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => syncCouponsWithSupabase()}
            disabled={isCouponsSyncing}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
            title="刷新与同步"
          >
            <RefreshCw className={`w-4 h-4 ${isCouponsSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <div className="p-4 md:p-6 max-w-3xl w-full mx-auto space-y-4">
        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('available')}
            className={`flex-1 py-2 text-center text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'available'
                ? 'bg-rose-50 text-rose-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            可使用 ({availableCoupons.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('used')}
            className={`flex-1 py-2 text-center text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'used'
                ? 'bg-slate-100 text-slate-800 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            已使用 ({usedCoupons.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('expired')}
            className={`flex-1 py-2 text-center text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'expired'
                ? 'bg-slate-100 text-slate-800 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            已失效 ({expiredCoupons.length})
          </button>
        </div>

        {/* Coupons List */}
        {displayedCoupons.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-slate-200/80 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Ticket className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-700">暂无相关优惠券</h4>
            <p className="text-xs text-slate-400">
              新用户初始享有一张专属 8 折优惠券；可在发单时直接抵扣使用。
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedCoupons.map((coupon) => {
              const isAvailable = coupon.status === 'available';

              return (
                <div
                  key={coupon.id}
                  className={`bg-white rounded-2xl sm:rounded-3xl border transition-all overflow-hidden flex flex-row relative group ${
                    isAvailable
                      ? 'border-rose-200/90 hover:border-rose-400 hover:shadow-md'
                      : 'border-slate-200 opacity-60 bg-slate-50/50'
                  }`}
                >
                  {/* Left: 8折 Stamp Section */}
                  <div
                    className={`w-20 sm:w-36 p-2.5 sm:p-5 flex flex-col justify-center items-center text-center relative border-r border-dashed flex-shrink-0 ${
                      isAvailable
                        ? 'bg-gradient-to-br from-rose-500 via-orange-500 to-amber-500 text-white border-rose-200'
                        : 'bg-slate-200 text-slate-600 border-slate-300'
                    }`}
                  >
                    {/* Circle notches for ticket appearance */}
                    <div className="absolute -top-2.5 -right-2.5 sm:-top-3 sm:-right-3 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-50 border border-slate-200/80"></div>
                    <div className="absolute -bottom-2.5 -right-2.5 sm:-bottom-3 sm:-right-3 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-50 border border-slate-200/80"></div>

                    <div className="flex items-baseline justify-center">
                      <span className="text-2xl sm:text-4xl font-black tracking-tight">
                        {coupon.discount?.replace('折', '') || '8'}
                      </span>
                      <span className="text-sm sm:text-xl font-bold ml-0.5">折</span>
                    </div>

                    <span
                      className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full mt-1 whitespace-nowrap ${
                        isAvailable
                          ? 'bg-white/25 text-white backdrop-blur-xs'
                          : 'bg-slate-300 text-slate-700'
                      }`}
                    >
                      {coupon.minSpend || '无门槛'}
                    </span>
                  </div>

                  {/* Center: Details Section */}
                  <div className="p-3 sm:p-5 flex-1 min-w-0 flex flex-col justify-between space-y-1.5">
                    <div>
                      <div className="flex items-center flex-wrap gap-1.5">
                        <span
                          className={`px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold whitespace-nowrap ${
                            isAvailable
                              ? 'bg-rose-50 text-rose-600 border border-rose-200'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {coupon.category}
                        </span>
                        <h3 className="font-bold text-xs sm:text-base text-slate-800 truncate">
                          {coupon.name}
                        </h3>
                      </div>

                      <p className="text-[11px] sm:text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {coupon.description}
                      </p>
                    </div>

                    <div className="pt-1.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5 text-[10px] sm:text-[11px] text-slate-400">
                      <div className="flex items-center space-x-1 truncate">
                        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">
                          {isAvailable
                            ? `至 ${coupon.validUntil}`
                            : coupon.usedDate || `已失效`}
                        </span>
                      </div>

                      {/* Coupon Code & Copy */}
                      <div className="flex items-center space-x-1">
                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 text-[9px] sm:text-[10px]">
                          {coupon.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(coupon.code)}
                          className="text-slate-500 hover:text-rose-600 p-0.5 rounded transition-colors cursor-pointer"
                          title="复制券码"
                        >
                          {copiedCode === coupon.code ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right: Action Button */}
                  <div className="p-2 sm:p-4 bg-slate-50/50 w-16 sm:w-32 flex flex-col justify-center items-center border-l border-slate-100 flex-shrink-0">
                    {isAvailable ? (
                      <button
                        type="button"
                        onClick={() => onUseCoupon?.(coupon)}
                        className="w-full py-1.5 sm:py-2 px-1.5 sm:px-3 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 active:scale-95 text-white font-bold text-[11px] sm:text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center space-x-0.5 sm:space-x-1"
                      >
                        <span>去使用</span>
                        <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                    ) : (
                      <span className="text-[10px] sm:text-xs font-bold text-slate-400 py-1 px-1.5 sm:px-3 bg-slate-200/70 rounded-xl whitespace-nowrap">
                        {coupon.status === 'used' ? '已用' : '失效'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Unified 80% Off Rules Card */}
        <div className="bg-slate-100/80 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-2 text-xs text-slate-600">
          <div className="flex items-center space-x-2 font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-rose-600" />
            <span>【新人专享 8 折】优惠券使用规则</span>
          </div>
          <ul className="space-y-1.5 text-slate-500 list-disc list-inside leading-relaxed text-[11px] sm:text-xs">
            <li>每个新用户初始配发一张 <strong className="text-slate-800 font-bold">8折新人专属陪护券</strong>。</li>
            <li>在发布就医陪诊或同城陪伴需求时，可在订单中直接抵扣 8 折优惠。</li>
            <li>优惠减免金额由平台官方和伴专项补贴基金承担，金牌陪护师傅实收报酬不受影响。</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
