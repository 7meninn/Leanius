import React from 'react';
import { useUI } from '../../../hooks/useUI';
import PlayerPreview from './PlayerPreview';
import SettingsTab from './SettingsTab';
import EmbedTab from './EmbedTab';

/**
 * Preview Tab - Shows the player preview component
 */
export const PreviewTab: React.FC = () => {
  const { activeTab } = useUI();

  if (activeTab !== 'preview') return null;

  return (
    <div className="h-full p-8">
      <PlayerPreview />
    </div>
  );
};

/**
 * Main content area that switches between tabs
 */
export const MainContent: React.FC = () => {
  const { activeTab } = useUI();

  return (
    <div className="flex-1 overflow-auto">
      {activeTab === 'preview' && <PreviewTab />}
      {activeTab === 'settings' && <SettingsTab />}
      {activeTab === 'embed' && <EmbedTab />}
    </div>
  );
};

export default MainContent;
