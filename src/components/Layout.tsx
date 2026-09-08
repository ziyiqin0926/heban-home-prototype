import React from 'react';
import { Home as HomeIcon, Users, User, Sparkles, Grid2X2 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'home', label: '首页', icon: HomeIcon },
  { id: 'directory', label: '目录', icon: Grid2X2 },
  { id: 'community', label: '社区', icon: Users },
  { id: 'profile', label: '个人中心', icon: User },
];

export default function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  return (
    <div className="app-shell h-full w-full overflow-hidden select-none">
      <main className="app-frame flex h-full w-full flex-col overflow-hidden">
        <div className="app-scroll flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </div>
        <div className="bottom-dock">
          <button
            type="button"
            className={`ai-entry ${activeTab === 'agent' ? 'active' : ''}`}
            onClick={() => onTabChange('agent')}
            aria-label="AI发布"
          >
            <Sparkles className="ai-entry-icon" />
            <span>AI</span>
          </button>
          <nav className="bottom-nav" aria-label="底部导航">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon className="nav-icon" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </main>
    </div>
  );
}
