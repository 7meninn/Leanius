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
    <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-[var(--border)] flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--ink)] rounded-xl flex items-center justify-center shadow-sm">
            <Music className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-[var(--ink)]">Leanius</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map(({ id, icon: Icon, label }) => (
            <li key={id}>
              <button
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-full transition-colors ${
                  activeTab === id
                    ? 'bg-[var(--ink)] text-white'
                    : 'text-[var(--muted-strong)] hover:bg-[var(--bg-muted)] hover:text-[var(--ink)]'
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
      <div className="p-4 border-t border-[var(--border)]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-[var(--muted)] hover:text-red-500 hover:bg-[var(--bg-muted)] rounded-full transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
