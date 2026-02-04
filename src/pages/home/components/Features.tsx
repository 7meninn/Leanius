import React from 'react';
import { Music2, Sparkles, Shuffle, Palette, Zap, Shield } from 'lucide-react';

interface Feature {
  icon: React.FC<{ className?: string }>;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Music2,
    title: 'Auto Lyrics Sync',
    description: 'Upload your music and we automatically fetch and synchronize lyrics perfectly.',
  },
  {
    icon: Sparkles,
    title: 'Beautiful Player UI',
    description: 'Modern, responsive player design that looks great on any website.',
  },
  {
    icon: Shuffle,
    title: 'Smart Shuffle',
    description: 'Weighted random playback with session-based repeat avoidance.',
  },
  {
    icon: Palette,
    title: 'Easy Integration',
    description: 'Simple iframe embed code that works on any platform.',
  },
  {
    icon: Zap,
    title: 'Fast & Reliable',
    description: 'Audio streamed from Azure cloud for lightning-fast playback.',
  },
  {
    icon: Shield,
    title: 'Secure',
    description: 'Your API key keeps your music library private and secure.',
  },
];

/**
 * Features section showcasing key capabilities
 */
export const Features: React.FC = () => {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold text-[var(--ink)] mb-4">
            Everything you need
          </h2>
          <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto">
            Powerful features that make Leanius the best choice for embeddable music players.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="card p-6 transition-transform duration-300 hover:-translate-y-1"
            >
              {/* Icon */}
              <div className="w-11 h-11 bg-[var(--bg-muted)] rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="h-5 w-5 text-[var(--accent)]" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-[var(--ink)] mb-2">
                {feature.title}
              </h3>
              <p className="text-[var(--muted)] text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
