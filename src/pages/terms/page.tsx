import React from 'react';
import { Link } from 'react-router-dom';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <Link to="/" className="text-2xl font-semibold text-[var(--ink)] hover:text-[var(--accent)] transition-colors">
            Leanius
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="card p-8">
          <h1 className="text-3xl font-semibold text-[var(--ink)] mb-8">Terms & Conditions</h1>
          
          <div className="space-y-8 text-[var(--muted)]">
            <section>
              <h2 className="text-xl font-semibold text-[var(--ink)] mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Leanius ("the Service"), you accept and agree to be bound by 
                the terms and provisions of this agreement. If you do not agree to abide by these 
                terms, please do not use this Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink)] mb-4">2. Description of Service</h2>
              <p>
                Leanius is a SaaS platform that provides embeddable music players with real-time 
                lyrics synchronization. The Service allows users to upload audio files, manage 
                their music library, and embed customizable players on external websites.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink)] mb-4">3. User Account</h2>
              <p className="mb-3">
                To use certain features of the Service, you must register for an account. 
                You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate and complete information during registration</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink)] mb-4">4. Content and Ownership</h2>
              <p className="mb-3">
                You retain ownership of all content you upload to the Service. However, by 
                uploading content, you grant Leanius a non-exclusive, worldwide license to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Store and process your content to provide the Service</li>
                <li>Display your content through the embeddable player</li>
                <li>Create backup copies for data recovery purposes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink)] mb-4">5. Acceptable Use</h2>
              <p className="mb-3">You agree not to use the Service to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Upload content that infringes on intellectual property rights</li>
                <li>Distribute malware or malicious code</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use the Service for any illegal purposes</li>
                <li>Upload content that is defamatory, obscene, or harmful</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink)] mb-4">6. Copyright Policy</h2>
              <p>
                You must have the legal right to upload and share any audio content through the 
                Service. This includes owning the copyright, having a valid license, or the 
                content being in the public domain. We reserve the right to remove any content 
                that infringes on copyright and to terminate accounts of repeat infringers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink)] mb-4">7. Privacy</h2>
              <p>
                Your use of the Service is also governed by our Privacy Policy. By using the 
                Service, you consent to the collection and use of your information as described 
                in our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink)] mb-4">8. Service Availability</h2>
              <p>
                We strive to provide continuous access to the Service but do not guarantee 
                uninterrupted availability. We may suspend or terminate the Service temporarily 
                or permanently for maintenance, updates, or other reasons without prior notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink)] mb-4">9. Limitation of Liability</h2>
              <p>
                The Service is provided "as is" without warranties of any kind. We shall not be 
                liable for any indirect, incidental, special, consequential, or punitive damages 
                arising from your use of or inability to use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink)] mb-4">10. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of 
                significant changes via email or through the Service. Continued use of the Service 
                after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink)] mb-4">11. Termination</h2>
              <p>
                We may terminate or suspend your account and access to the Service at our sole 
                discretion, without prior notice, for conduct that we believe violates these 
                terms or is harmful to other users, us, or third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--ink)] mb-4">12. Contact Information</h2>
              <p>
                If you have any questions about these Terms & Conditions, please contact us 
                through our support channels.
              </p>
            </section>

            <div className="pt-8 border-t border-[var(--border)]">
              <p className="text-sm text-[var(--muted)]">
                Last updated: January 2026
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="mt-8 text-center">
          <Link 
            to="/" 
            className="text-[var(--accent)] hover:text-[var(--ink)] transition-colors"
          >
            &larr; Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
};

export default TermsPage;
