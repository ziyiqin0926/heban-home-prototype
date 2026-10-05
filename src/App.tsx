/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import Layout from './components/Layout';
import AiAgent from './pages/AiAgent';
import Directory from './pages/Directory';
import Community from './pages/Community';
import Profile from './pages/Profile';
import HomeNearbyPreview from './pages/HomeNearbyPreview';
import BecomePartner from './pages/BecomePartner';
import PublishRequest from './pages/PublishRequest';
import './pages/HomeNearbyPreview.css';

type ProfileView = 'menu' | 'orders' | 'coupons';

function MainApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [profileView, setProfileView] = useState<ProfileView>('menu');
  const [directorySearch, setDirectorySearch] = useState('');
  const { setPrefilledPrompt } = useAppContext();

  const navigateToProfile = (view: ProfileView = 'menu') => {
    setProfileView(view);
    setActiveTab('profile');
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'home' && (
        <HomeNearbyPreview
          embedded
          onNavigateToPublish={() => setActiveTab('publish')}
          onNavigateToDirectory={(query = '') => {
            setDirectorySearch(query);
            setActiveTab('directory');
          }}
          onNavigateToPartner={() => setActiveTab('partner')}
          onNavigateToCommunity={() => setActiveTab('community')}
          onNavigateToAgent={() => {
            setPrefilledPrompt('请根据我的档案和日程，帮我智能规划近期陪伴与服务安排');
            setActiveTab('agent');
          }}
          onNavigateToProfile={navigateToProfile}
        />
      )}
      {activeTab === 'partner' && <BecomePartner onBack={() => setActiveTab('home')} />}
      {activeTab === 'publish' && <PublishRequest onBack={() => setActiveTab('home')} onNavigateToCommunity={() => setActiveTab('community')} onNavigateToProfile={() => navigateToProfile('menu')} />}
      {activeTab === 'agent' && (
        <AiAgent
          onNavigateToCommunity={() => setActiveTab('community')}
          onNavigateToProfile={() => setActiveTab('profile')}
        />
      )}
      {activeTab === 'directory' && (
        <Directory initialQuery={directorySearch} onNavigateToAgent={() => setActiveTab('agent')} onNavigateToProfile={() => navigateToProfile('orders')} />
      )}
      {activeTab === 'community' && <Community onNavigateToAgent={() => setActiveTab('agent')} />}
      {activeTab === 'profile' && (
        <Profile
          onNavigateToAgent={() => setActiveTab('agent')}
          onNavigateToManual={() => setActiveTab('agent')}
          onNavigateToPartner={() => setActiveTab('partner')}
          initialView={profileView}
          onViewChange={setProfileView}
        />
      )}
    </Layout>
  );
}

export default function App() {
  if (window.location.pathname === '/preview/home-nearby') {
    return (
      <AppProvider>
        <PreviewHome />
      </AppProvider>
    );
  }

  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

function PreviewHome() {
  const [view, setView] = useState<'home' | 'publish' | 'partner' | 'community' | 'profile'>('home');
  if (view === 'publish') {
    return <PublishRequest onBack={() => setView('home')} onNavigateToCommunity={() => setView('community')} onNavigateToProfile={() => setView('profile')} />;
  }
  if (view === 'community') {
    return <Community onNavigateToAgent={() => setView('home')} />;
  }
  if (view === 'profile') {
    return <Profile onNavigateToAgent={() => setView('home')} onNavigateToPartner={() => setView('partner')} initialView="menu" />;
  }
  if (view === 'partner') {
    return <BecomePartner onBack={() => setView('home')} />;
  }
  return <HomeNearbyPreview onNavigateToPublish={() => setView('publish')} onNavigateToPartner={() => setView('partner')} onNavigateToProfile={() => setView('profile')} />;
}
