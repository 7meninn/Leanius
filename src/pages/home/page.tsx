import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Features from './components/Features';
import Footer from './components/Footer';
import { AuthForms } from './components/AuthForms';

/**
 * Home Page - Landing page with auth forms
 * Cal.com-inspired design with hero + auth forms
 */
export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#eef2ff_0%,_transparent_55%)]" />
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/70 to-transparent" />
        <div className="relative">
          <Header />

          {/* Main Content */}
          <main>
            {/* Hero Section with Auth Forms Side by Side */}
            <section className="py-16 lg:py-24">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
                  {/* Left Side - Hero Content */}
                  <div>
                    <Hero />
                  </div>

                  {/* Right Side - Auth Forms */}
                  <div className="flex justify-center lg:justify-end">
                    <AuthForms />
                  </div>
                </div>
              </div>
            </section>

            <HowItWorks />
            <Features />
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
