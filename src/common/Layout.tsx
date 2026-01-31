import React, { ReactNode } from 'react';
import Toast from './Toast';

interface LayoutProps {
  children: ReactNode;
}

/**
 * Main layout wrapper component
 * Provides consistent styling and includes global components like Toast
 */
export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {children}
      <Toast />
    </div>
  );
};

export default Layout;
