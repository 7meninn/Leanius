import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { DashboardTab, AuthModalType } from '../types';

interface UIContextType {
  // Dashboard
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  
  // Auth Modal
  authModalType: AuthModalType;
  openAuthModal: (type: AuthModalType) => void;
  closeAuthModal: () => void;
  
  // Lyrics Confirmation Modal
  showLyricsConfirmation: boolean;
  setShowLyricsConfirmation: (show: boolean) => void;
  
  // General UI state
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  
  // Toast/Notification messages
  toastMessage: { type: 'success' | 'error' | 'info'; message: string } | null;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
  clearToast: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

interface UIProviderProps {
  children: ReactNode;
}

export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
  // Dashboard tab state
  const [activeTab, setActiveTab] = useState<DashboardTab>('preview');
  
  // Auth modal state
  const [authModalType, setAuthModalType] = useState<AuthModalType>(null);
  
  // Lyrics confirmation modal
  const [showLyricsConfirmation, setShowLyricsConfirmation] = useState(false);
  
  // Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Toast state
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const openAuthModal = useCallback((type: AuthModalType) => {
    setAuthModalType(type);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalType(null);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);

  const showToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setToastMessage({ type, message });
    
    // Auto-clear after 5 seconds
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  }, []);

  const clearToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  const value: UIContextType = {
    activeTab,
    setActiveTab,
    authModalType,
    openAuthModal,
    closeAuthModal,
    showLyricsConfirmation,
    setShowLyricsConfirmation,
    isSidebarCollapsed,
    toggleSidebar,
    toastMessage,
    showToast,
    clearToast,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUIContext = (): UIContextType => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUIContext must be used within a UIProvider');
  }
  return context;
};

export default UIContext;
