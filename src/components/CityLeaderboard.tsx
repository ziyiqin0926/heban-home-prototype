import React, { useState } from 'react';
import {
  Trophy,
  Medal,
  Award,
  Star,
  ShieldCheck,
  Phone,
  Flame,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Sparkles,
  MapPin,
  Clock,
  UserCheck,
  Zap,
  ChevronDown
} from 'lucide-react';
import { EscortProfile } from '../types';
import { getEscortsByCity } from '../data/escortProfiles';

interface CityLeaderboardProps {
  currentCity: string;
  onSelectEscort: (profile: EscortProfile) => void;
  onNavigateToAgent?: () => void;
}

type PeriodType = 'total' | 'monthly' | 'weekly';

export default function CityLeaderboard({
  currentCity,
  onSelectEscort,
  onNavigateToAgent
}: CityLeaderboardProps) {
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [period, setPeriod] = useState<PeriodType>('total');

  // Dynamic escorts filtered by the selected city
  const cityEscorts = getEscortsByCity(currentCity);

  // Filter by category
  const filteredEscorts = cityEscorts.filter((escort) => {
    if (activeCategory === '全部') return true;
    return escort.category === activeCategory;
  });

  // Sort based on period
  const sortedEscorts = [...filteredEscorts].sort((a, b) => {
    if (period === 'monthly') {
      return (b.monthlyOrders || 0) - (a.monthlyOrders || 0);
    }
    if (period === 'weekly') {
      return (b.weeklyOrders || 0) - (a.weeklyOrders || 0);
    }
    return b.serviceCount - a.serviceCount;
  });

  const top1 = sortedEscorts[0];
  const top2 = sortedEscorts[1];
  const top3 = sortedEscorts[2];

  const getOrdersCount = (escort: EscortProfile) => {
    if (period === 'monthly') return `${escort.monthlyOrders || Math.round(escort.serviceCount / 10)} 单`;
    if (period === 'weekly') return `${escort.weeklyOrders || Math.round(escort.serviceCount / 35)} 单`;
    return `${escort.serviceCount} 单`;
  };

  const getPeriodLabel = () => {
    if (period === 'monthly') return '本月接单量';
    if (period === 'weekly') return '本周接单量';
    return '累计接单量';
  };

  return (
    <div className="space-y-4">
      {/* City Leaderboard Top Banner Card */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-4 sm:p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute top-0 right-12 opacity-15 pointer-events-none">
          <Trophy className="w-32 h-32 text-white" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold border border-white/20 text-white">
              <Flame className="w-3.5 h-3.5 text-amber-200 fill-amber-200 animate-pulse" />
              <span>【{currentCity}市】陪诊师傅接单排行榜</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {currentCity} · 金牌服务之星榜
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 max-w-md">
              根据{currentCity}本地平台真实履约接单量、服务准时率与雇主五星好评率实时排行
            </p>
          </div>

          {/* Time Period Capsule Switcher */}
          <div className="bg-black/20 p-1 rounded-2xl flex items-center self-start sm:self-center border border-white/10 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setPeriod('total')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                period === 'total'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              总接单榜
            </button>
            <button
              type="button"
              onClick={() => setPeriod('monthly')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                period === 'monthly'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              月度热榜
            </button>
            <button
              type="button"
              onClick={() => setPeriod('weekly')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                period === 'weekly'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              本周冲榜
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills & Total Summary */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center space-x-2">
          {['全部', '医疗陪诊', '宠物陪伴', '同城陪伴'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 whitespace-nowrap hidden sm:inline">
          {currentCity}市共收录 {sortedEscorts.length} 位金牌师傅
        </span>
      </div>

      {/* Top 3 Podium Cards (领奖台视觉) */}
      {sortedEscorts.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2">
          
          {/* Top 2: Silver 银牌 (Left) */}
          {top2 && (
            <div
              onClick={() => onSelectEscort(top2)}
              className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col items-center text-center relative group mt-4 sm:mt-6"
            >
              <div className="absolute -top-3.5 bg-gradient-to-r from-slate-400 to-slate-500 text-white text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full shadow-sm flex items-center space-x-0.5">
                <span>🥈 TOP 2</span>
              </div>

              <div className="relative mt-2">
                <img
                  src={top2.avatar}
                  alt={top2.name}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-3 ring-slate-300 shadow-xs group-hover:scale-105 transition-transform"
                />
                <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-0.5 rounded-full ring-1 ring-white">
                  <ShieldCheck className="w-3 h-3" />
                </div>
              </div>

              <div className="mt-2 w-full">
                <h4 className="font-bold text-xs sm:text-sm text-slate-800 truncate">
                  {top2.name}
                </h4>
                <p className="text-[10px] text-slate-400 truncate">{top2.category || '医疗陪诊'}</p>
                
                <div className="mt-2 py-1 px-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-xs sm:text-sm font-black text-slate-800">
                    {getOrdersCount(top2)}
                  </div>
                  <div className="text-[9px] text-slate-400 font-medium">{getPeriodLabel()}</div>
                </div>

                <div className="mt-1.5 flex items-center justify-center space-x-1 text-[10px] text-amber-600 font-bold">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{top2.rating} · 好评{top2.praiseRate}</span>
                </div>
              </div>
            </div>
          )}

          {/* Top 1: Gold 冠军 金牌 (Center - Higher & Prominent) */}
          {top1 && (
            <div
              onClick={() => onSelectEscort(top1)}
              className="bg-gradient-to-b from-amber-50/70 via-white to-amber-50/30 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border-2 border-amber-300 hover:border-amber-400 shadow-md hover:shadow-lg transition-all cursor-pointer flex flex-col items-center text-center relative group"
            >
              <div className="absolute -top-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] sm:text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center space-x-1 ring-2 ring-white">
                <Trophy className="w-3.5 h-3.5 fill-white text-white" />
                <span>🥇 榜首冠军</span>
              </div>

              <div className="relative mt-2">
                <img
                  src={top1.avatar}
                  alt={top1.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl object-cover ring-4 ring-amber-400 shadow-md group-hover:scale-105 transition-transform"
                />
                <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-1 rounded-full ring-2 ring-white shadow-xs">
                  <Trophy className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="mt-2.5 w-full">
                <h4 className="font-bold text-sm sm:text-base text-slate-900 truncate">
                  {top1.name}
                </h4>
                <p className="text-[10px] sm:text-xs text-amber-700 font-bold truncate">
                  {top1.tag.split('·')[0]}
                </p>
                
                <div className="mt-2 py-1.5 px-2.5 rounded-xl bg-amber-100/70 border border-amber-200">
                  <div className="text-sm sm:text-base font-black text-amber-900">
                    {getOrdersCount(top1)}
                  </div>
                  <div className="text-[10px] text-amber-800 font-bold">{getPeriodLabel()}</div>
                </div>

                <div className="mt-1.5 flex items-center justify-center space-x-1 text-[11px] text-amber-700 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{top1.rating} · 好评{top1.praiseRate}</span>
                </div>
              </div>
            </div>
          )}

          {/* Top 3: Bronze 铜牌 (Right) */}
          {top3 && (
            <div
              onClick={() => onSelectEscort(top3)}
              className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col items-center text-center relative group mt-4 sm:mt-6"
            >
              <div className="absolute -top-3.5 bg-gradient-to-r from-amber-700 to-amber-800 text-white text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full shadow-sm flex items-center space-x-0.5">
                <span>🥉 TOP 3</span>
              </div>

              <div className="relative mt-2">
                <img
                  src={top3.avatar}
                  alt={top3.name}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-3 ring-amber-600/60 shadow-xs group-hover:scale-105 transition-transform"
                />
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full ring-1 ring-white">
                  <ShieldCheck className="w-3 h-3" />
                </div>
              </div>

              <div className="mt-2 w-full">
                <h4 className="font-bold text-xs sm:text-sm text-slate-800 truncate">
                  {top3.name}
                </h4>
                <p className="text-[10px] text-slate-400 truncate">{top3.category || '宠物陪伴'}</p>
                
                <div className="mt-2 py-1 px-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-xs sm:text-sm font-black text-slate-800">
                    {getOrdersCount(top3)}
                  </div>
                  <div className="text-[9px] text-slate-400 font-medium">{getPeriodLabel()}</div>
                </div>

                <div className="mt-1.5 flex items-center justify-center space-x-1 text-[10px] text-amber-600 font-bold">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{top3.rating} · 好评{top3.praiseRate}</span>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Ranked List: 1st to Nth */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs font-bold text-slate-400">
          <div className="flex items-center space-x-4 pl-1">
            <span>{currentCity}市 排名 / 陪护师</span>
          </div>
          <div className="flex items-center space-x-6 pr-2">
            <span>评分与好评</span>
            <span className="text-right w-20">{getPeriodLabel()}</span>
          </div>
        </div>

        {sortedEscorts.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            该分类下暂无已上榜陪护师
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sortedEscorts.map((escort, index) => {
              const rank = index + 1;
              return (
                <div
                  key={escort.id || escort.name}
                  onClick={() => onSelectEscort(escort)}
                  className="py-3 sm:py-3.5 px-2 rounded-2xl hover:bg-slate-50/80 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  {/* Left: Rank & Avatar & Info */}
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                    {/* Rank Number Badge */}
                    <div className="w-6 sm:w-7 text-center flex-shrink-0">
                      {rank === 1 ? (
                        <span className="w-6 h-6 rounded-full bg-amber-400 text-white font-black text-xs flex items-center justify-center shadow-xs">
                          1
                        </span>
                      ) : rank === 2 ? (
                        <span className="w-6 h-6 rounded-full bg-slate-400 text-white font-black text-xs flex items-center justify-center shadow-xs">
                          2
                        </span>
                      ) : rank === 3 ? (
                        <span className="w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center shadow-xs">
                          3
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">
                          {rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={escort.avatar}
                        alt={escort.name}
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover shadow-2xs group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full ring-1 ring-white">
                        <ShieldCheck className="w-2.5 h-2.5" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                          {escort.name}
                        </span>
                        {escort.category && (
                          <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 text-[10px] font-bold rounded">
                            {escort.category}
                          </span>
                        )}
                        <span className="hidden sm:inline text-[10px] text-slate-400 font-mono">
                          {escort.yearsOfExperience}年经验
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 truncate mt-0.5 max-w-[180px] sm:max-w-xs">
                        {escort.title}
                      </p>

                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                        <span className="flex items-center text-emerald-600">
                          <Zap className="w-2.5 h-2.5 mr-0.5" />
                          平均 {escort.avgResponseMinutes || 3} 分钟响应
                        </span>
                        <span className="hidden sm:inline text-slate-300">·</span>
                        <span className="hidden sm:inline text-slate-400 truncate max-w-[140px]">
                          {escort.serviceArea.split('（')[0]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Orders Count & Rating */}
                  <div className="flex items-center space-x-3 sm:space-x-6 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="flex items-center justify-end text-xs font-bold text-amber-500">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                        {escort.rating}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        好评率 {escort.praiseRate}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm sm:text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                        {getOrdersCount(escort)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {getPeriodLabel()}
                      </div>
                    </div>

                    <div className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
