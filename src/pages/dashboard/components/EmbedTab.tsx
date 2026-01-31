import React, { useState } from 'react';
import { Copy, Check, Code } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useUI } from '../../../hooks/useUI';

/**
 * Embed Tab - Shows embed instructions and code
 */
export const EmbedTab: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useUI();
  const [copied, setCopied] = useState(false);

  const embedCode = `<iframe
  src="https://leanius.com/embed?key=${user?.apiKey || 'YOUR_API_KEY'}"
  width="400"
  height="600"
  frameborder="0"
  allow="autoplay"
></iframe>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      showToast('success', 'Embed code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('error', 'Failed to copy to clipboard');
    }
  };

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-white mb-2">Embed Your Player</h1>
      <p className="text-slate-400 mb-8">
        Copy the embed code below and paste it into your website's HTML to display your music player.
      </p>

      {/* Steps */}
      <div className="space-y-6 mb-8">
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            1
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Copy the embed code</h3>
            <p className="text-slate-400 text-sm">
              Click the "Copy Code" button below to copy your personalized embed code.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            2
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Paste into your website</h3>
            <p className="text-slate-400 text-sm">
              Add the code to your website's HTML where you want the player to appear.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            3
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Enjoy!</h3>
            <p className="text-slate-400 text-sm">
              Your visitors can now enjoy your music with synced lyrics.
            </p>
          </div>
        </div>
      </div>

      {/* Embed Code Block */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center gap-2 text-slate-400">
            <Code className="h-4 w-4" />
            <span className="text-sm">Embed Code</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Code
              </>
            )}
          </button>
        </div>
        <pre className="p-4 text-sm text-slate-300 overflow-x-auto">
          <code>{embedCode}</code>
        </pre>
      </div>

      {/* API Key Display */}
      <div className="mt-6 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
        <h3 className="text-white font-semibold mb-2">Your API Key</h3>
        <p className="text-slate-400 text-sm mb-2">
          This key is automatically included in your embed code. Keep it private.
        </p>
        <code className="text-blue-400 text-sm bg-slate-900 px-3 py-1 rounded">
          {user?.apiKey || 'Loading...'}
        </code>
      </div>

      {/* Preview Section */}
      <div className="mt-8">
        <h3 className="text-white font-semibold mb-4">Preview</h3>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 flex items-center justify-center">
          <div className="text-center text-slate-500">
            <p className="mb-2">Player preview will appear here</p>
            <p className="text-sm">(Coming soon)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmbedTab;
