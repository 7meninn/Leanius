import React from 'react';
import { Upload, Key, Globe } from 'lucide-react';

interface Step {
  icon: React.FC<{ className?: string }>;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: Upload,
    title: 'Upload Your Music',
    description: 'Upload your audio files with title and artist. Our system automatically fetches and syncs lyrics for you.',
  },
  {
    icon: Key,
    title: 'Get Your Embed Code',
    description: 'One-click copy of your personalized embed code. Your unique API key is already integrated.',
  },
  {
    icon: Globe,
    title: 'Embed Anywhere',
    description: 'Paste the code on any website or blog. Your visitors enjoy beautiful synced lyrics playback instantly.',
  },
];

/**
 * How It Works section showing 3-step process
 */
export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-16 lg:py-24 bg-[var(--bg-muted)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold text-[var(--ink)] mb-4">
            How it works
          </h2>
          <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto">
            Get your music player up and running in three simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative card p-6"
            >
              {/* Step Number */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-[var(--ink)] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {index + 1}
              </div>

              {/* Icon */}
              <div className="w-12 h-12 bg-[var(--accent-soft)] rounded-xl flex items-center justify-center mb-4">
                <step.icon className="h-6 w-6 text-[var(--accent)]" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-[var(--ink)] mb-2">
                {step.title}
              </h3>
              <p className="text-[var(--muted)]">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Connection Lines (visual only on desktop) */}
        <div className="hidden md:flex justify-center mt-8">
          <div className="flex items-center text-[var(--muted)]">
            <div className="w-32 h-px bg-[var(--border)]" />
            <div className="px-2">to</div>
            <div className="w-32 h-px bg-[var(--border)]" />
            <div className="px-2">to</div>
            <div className="w-32 h-px bg-[var(--border)]" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
