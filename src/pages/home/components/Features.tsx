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
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Powerful features that make Leanius the best choice for embeddable music players
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-slate-800/30 border border-slate-700 rounded-lg p-6 hover:bg-slate-800/50 transition-colors group"
            >
              {/* Icon */}
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                <feature.icon className="h-5 w-5 text-blue-400" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-sm">
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
