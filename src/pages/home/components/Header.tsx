import React from 'react';
import { Link } from 'react-router-dom';
import { Music } from 'lucide-react';
import { useUI } from '../../../hooks/useUI';

/**
 * Header component for the home page
 */
export const Header: React.FC = () => {
  const { openAuthModal } = useUI();

  return (
    <header className="border-b border-[var(--border)] bg-white/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[var(--ink)] rounded-xl flex items-center justify-center shadow-sm">
              <Music className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-semibold text-[var(--ink)] tracking-tight">Leanius</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
              How It Works
            </a>
            <Link to="/terms" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
              Terms
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => openAuthModal('login')}
              className="btn-ghost"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuthModal('signup')}
              className="btn-primary"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
