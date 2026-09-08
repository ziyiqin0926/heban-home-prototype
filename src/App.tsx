/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import AiAgent from './pages/AiAgent';
import Directory from './pages/Directory';
import Community from './pages/Community';
import Profile from './pages/Profile';

type ProfileView = 'menu' | 'orders' | 'coupons';

function MainApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [profileView, setProfileView] = useState<ProfileView>('menu');

  const navigateToProfile = (view: ProfileView = 'menu') => {
    setProfileView(view);
    setActiveTab('profile');
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'home' && (
        <Home
          onNavigateToAgent={() => setActiveTab('agent')}
          onNavigateToCommunity={() => setActiveTab('community')}
          onNavigateToProfile={navigateToProfile}
        />
      )}
      {activeTab === 'agent' && (
        <AiAgent
          onNavigateToCommunity={() => setActiveTab('community')}
          onNavigateToProfile={() => setActiveTab('profile')}
        />
      )}
      {activeTab === 'directory' && (
        <Directory onNavigateToAgent={() => setActiveTab('agent')} />
      )}
      {activeTab === 'community' && <Community onNavigateToAgent={() => setActiveTab('agent')} />}
      {activeTab === 'profile' && (
        <Profile
          onNavigateToAgent={() => setActiveTab('agent')}
          onNavigateToManual={() => setActiveTab('agent')}
          initialView={profileView}
          onViewChange={setProfileView}
        />
      )}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
