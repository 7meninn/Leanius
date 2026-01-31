import React from 'react';
import UploadForm from './UploadForm';
import SongsList from './SongsList';

/**
 * Right Sidebar - Upload form and songs list
 */
export const RightSidebar: React.FC = () => {
  return (
    <aside className="w-80 bg-slate-800/50 border-l border-slate-700 flex flex-col h-screen">
      <UploadForm />
      <SongsList />
    </aside>
  );
};

export default RightSidebar;
