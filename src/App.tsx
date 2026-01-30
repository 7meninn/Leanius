import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white">
            🎵 Leanius
          </h1>
          <p className="mt-2 text-slate-400">
            Embeddable Music Player with Lyrics Sync
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="rounded-lg border border-slate-700 bg-slate-800/50 p-8 backdrop-blur-sm">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Left Content */}
            <div className="flex flex-col justify-center">
              <h2 className="text-4xl font-bold text-white">
                Create. Upload. Share.
              </h2>
              <p className="mt-4 text-lg text-slate-300">
                A modern platform for uploading music with synchronized lyrics and embedding players on your website.
              </p>
              
              <div className="mt-8 flex gap-4">
                <button className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700 active:scale-95">
                  Get Started
                </button>
                <button className="rounded-lg border border-slate-600 px-6 py-3 font-semibold text-slate-200 transition-all hover:border-slate-400 hover:bg-slate-700/50">
                  Learn More
                </button>
              </div>
            </div>

            {/* Right Content - Feature Preview */}
            <div className="rounded-lg border border-slate-600 bg-slate-900/50 p-6">
              <h3 className="text-lg font-semibold text-white">Key Features</h3>
              <ul className="mt-4 space-y-3 text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-blue-400">✓</span>
                  <span>Upload and manage your music library</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-blue-400">✓</span>
                  <span>Automatic lyrics fetching and synchronization</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-blue-400">✓</span>
                  <span>Customizable embeddable player</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-blue-400">✓</span>
                  <span>Real-time lyrics display with playback</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Demo Counter */}
        <section className="mt-12 rounded-lg border border-slate-700 bg-slate-800/50 p-8 backdrop-blur-sm text-center">
          <h3 className="text-2xl font-bold text-white">React + Vite + TypeScript</h3>
          <p className="mt-2 text-slate-400">
            This starter includes Tailwind CSS v4 for rapid UI development
          </p>
          
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setCount((count) => count + 1)}
              className="rounded-lg bg-emerald-600 px-8 py-4 font-semibold text-white transition-all hover:bg-emerald-700 active:scale-95"
            >
              Count is: {count}
            </button>
          </div>
        </section>

        {/* Project Structure */}
        <section className="mt-12 rounded-lg border border-slate-700 bg-slate-800/50 p-8 backdrop-blur-sm">
          <h3 className="text-2xl font-bold text-white">Next Steps</h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-900/50 p-4">
              <h4 className="font-semibold text-blue-400">Backend Setup</h4>
              <p className="mt-2 text-sm text-slate-400">
                Create Express.js server with MongoDB integration
              </p>
            </div>
            <div className="rounded-lg bg-slate-900/50 p-4">
              <h4 className="font-semibold text-blue-400">Authentication</h4>
              <p className="mt-2 text-sm text-slate-400">
                Implement JWT-based user authentication
              </p>
            </div>
            <div className="rounded-lg bg-slate-900/50 p-4">
              <h4 className="font-semibold text-blue-400">Upload System</h4>
              <p className="mt-2 text-sm text-slate-400">
                Build audio file upload and storage functionality
              </p>
            </div>
            <div className="rounded-lg bg-slate-900/50 p-4">
              <h4 className="font-semibold text-blue-400">Lyrics Sync</h4>
              <p className="mt-2 text-sm text-slate-400">
                Integrate lyrics API and real-time synchronization
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
