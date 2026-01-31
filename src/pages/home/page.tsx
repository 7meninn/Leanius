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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />
      
      {/* Main Content */}
      <main>
        {/* Hero Section with Auth Forms Side by Side */}
        <section className="py-16 lg:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
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
  );
};

export default HomePage;
