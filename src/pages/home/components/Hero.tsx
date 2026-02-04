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
        <div className="badge mb-6 w-fit">
          <Zap className="h-4 w-4" />
          <span>The Future of Music Players</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-[var(--ink)] mb-6 leading-tight">
          Embeddable music player with{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-blue-600 to-indigo-500">
            real-time lyrics sync
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg text-[var(--muted)] mb-8 max-w-xl">
          Upload your music, we handle the rest. Get beautifully synced lyric players
          you can embed anywhere with a single line of code.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => openAuthModal('signup')}
            className="btn-primary px-8 py-4"
          >
            Get Started Free
          </button>
          <a
            href="#how-it-works"
            className="btn-secondary px-8 py-4 text-center"
          >
            See How It Works
          </a>
        </div>

        {/* Feature Pills */}
        <div className="mt-12 flex flex-wrap gap-3">
          {[
            { icon: Music, text: 'Auto Lyrics Sync' },
            { icon: Headphones, text: 'Beautiful Player' },
            { icon: Code, text: 'Easy Embed' },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="pill"
            >
              <Icon className="h-4 w-4 text-[var(--muted-strong)]" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
  );
};

export default Hero;
