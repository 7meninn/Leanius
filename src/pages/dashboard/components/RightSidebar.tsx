import React from 'react';
import UploadForm from './UploadForm';
import SongsList from './SongsList';

/**
 * Right Sidebar - Upload form and songs list
 */
export const RightSidebar: React.FC = () => {
  return (
    <aside className="w-80 bg-white/80 backdrop-blur-xl border-l border-[var(--border)] flex flex-col h-screen">
      <UploadForm />
      <SongsList />
    </aside>
  );
};

export default RightSidebar;
