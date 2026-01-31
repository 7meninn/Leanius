import React from 'react';
import { Music, Headphones, Code, Zap } from 'lucide-react';
import { useUI } from '../../../hooks/useUI';

/**
 * Hero section content for the home page (left side)
 */
export const Hero: React.FC = () => {
  const { openAuthModal } = useUI();

  return (
    <div className="flex flex-col">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm mb-6 w-fit">
        <Zap className="h-4 w-4" />
        <span>The Future of Music Players</span>
      </div>

      {/* Headline */}
      <h1 className="text-4xl sm:text-5xl lg:text-5xl font-bold text-white mb-6 leading-tight">
        Embeddable Music Player with{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          Real-Time Lyrics Sync
        </span>
      </h1>

      {/* Subheadline */}
      <p className="text-lg text-slate-300 mb-8">
        Upload your music, we handle the rest. Get beautiful synced lyrics players 
        that you can embed anywhere with a single line of code.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => openAuthModal('signup')}
          className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all hover:scale-105"
        >
          Get Started Free
        </button>
        <a
          href="#how-it-works"
          className="px-8 py-4 border border-slate-600 text-slate-200 font-semibold rounded-lg hover:bg-slate-800/50 transition-all text-center"
        >
          See How It Works
        </a>
      </div>

      {/* Feature Pills */}
      <div className="mt-12 flex flex-wrap gap-4">
        {[
          { icon: Music, text: 'Auto Lyrics Sync' },
          { icon: Headphones, text: 'Beautiful Player' },
          { icon: Code, text: 'Easy Embed' },
        ].map(({ icon: Icon, text }) => (
          <div
            key={text}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full"
          >
            <Icon className="h-4 w-4 text-blue-400" />
            <span className="text-slate-300 text-sm">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hero;
