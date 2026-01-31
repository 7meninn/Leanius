import React from 'react';
import { Link } from 'react-router-dom';
import { Music } from 'lucide-react';

/**
 * Footer component for the home page
 */
export const Footer: React.FC = () => {
  return (
    <footer className="py-12 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Music className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-white font-semibold">Leanius</span>
              <p className="text-slate-500 text-sm">
                {new Date().getFullYear()} Leanius. All rights reserved.
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link to="/terms" className="text-slate-400 hover:text-white transition-colors">
              Terms & Conditions
            </Link>
            <a 
              href="mailto:support@leanius.com" 
              className="text-slate-400 hover:text-white transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
