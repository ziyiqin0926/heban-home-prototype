import React from 'react';
import { MapPin, Sparkles } from 'lucide-react';
import ManualPublishForm from '../components/ManualPublishForm';
import { useAppContext } from '../context/AppContext';

interface ManualPublishProps {
  onNavigateToCommunity: () => void;
  onNavigateToProfile?: () => void;
}

export default function ManualPublish({ onNavigateToCommunity, onNavigateToProfile }: ManualPublishProps) {
  const { currentCity } = useAppContext();

  return (
    <div className="manual-page flex flex-col h-full overflow-y-auto">
      {/* Top Header */}
      <header className="page-header px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-2.5">
          <div className="page-icon bg-blue-700">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-bold text-slate-900">发布需求</h1>
            <p className="text-[11px] text-slate-500">选择服务大类，快速生成一张清晰的服务单</p>
          </div>
        </div>
        <div className="city-status">
          <MapPin className="w-3.5 h-3.5" />
          <span>当前城市：{currentCity}市</span>
        </div>
      </header>

      {/* Main Form Body */}
      <div className="flex-1 pb-24 md:pb-12">
        <ManualPublishForm
          onPublishSuccess={() => {}}
          onNavigateToCommunity={onNavigateToCommunity}
          onNavigateToProfile={onNavigateToProfile}
        />
      </div>
    </div>
  );
}
