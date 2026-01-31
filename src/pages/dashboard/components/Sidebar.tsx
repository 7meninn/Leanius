import React from 'react';
import { Music, Eye, Settings, Code, LogOut } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useUI } from '../../../hooks/useUI';
import { DashboardTab } from '../../../types';

interface NavItem {
  id: DashboardTab;
  icon: React.FC<{ className?: string }>;
  label: string;
}

const navItems: NavItem[] = [
  { id: 'preview', icon: Eye, label: 'Preview' },
  { id: 'settings', icon: Settings, label: 'Settings' },
  { id: 'embed', icon: Code, label: 'Embed' },
];

/**
 * Left sidebar navigation for the dashboard
 */
export const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const { activeTab, setActiveTab } = useUI();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className="w-64 bg-slate-800/50 border-r border-slate-700 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Music className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Leanius</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map(({ id, icon: Icon, label }) => (
            <li key={id}>
              <button
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
