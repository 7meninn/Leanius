import React, { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { MainContent } from './components/PreviewTab';
import RightSidebar from './components/RightSidebar';
import LyricsConfirmation from './components/LyricsConfirmation';
import Toast from '../../common/Toast';
import { useSongs } from '../../hooks/useSongs';

/**
 * Dashboard Page - Main user interface after login
 * 3-column layout: Left sidebar (nav), Center (content), Right sidebar (upload/songs)
 */
export const DashboardPage: React.FC = () => {
  const { fetchSongs } = useSongs();

  // Fetch songs on mount
  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Left Sidebar - Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <MainContent />
      </main>

      {/* Right Sidebar - Upload & Songs */}
      <RightSidebar />

      {/* Modals */}
      <LyricsConfirmation />
      
      {/* Toast Notifications */}
      <Toast />
    </div>
  );
};

export default DashboardPage;
