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
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Music className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Leanius</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-slate-400 hover:text-white transition-colors">
              How It Works
            </a>
            <Link to="/terms" className="text-slate-400 hover:text-white transition-colors">
              Terms
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => openAuthModal('login')}
              className="text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuthModal('signup')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
