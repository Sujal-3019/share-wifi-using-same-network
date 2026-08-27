import { useEffect, useState } from 'react';
import { api } from './services/api';
import FilePicker from './components/FilePicker';

function App() {
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    api.health()
      .then(() => {
        setBackendStatus('online');
      })
      .catch(() => {
        setBackendStatus('offline');
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold">
              LocalShare
            </h1>

            <p className="text-sm text-slate-400">
              Fast local file sharing
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                backendStatus === 'online'
                  ? 'bg-emerald-400'
                  : backendStatus === 'offline'
                    ? 'bg-red-400'
                    : 'bg-yellow-400'
              }`}
            />

            <span className="text-sm text-slate-300">
              Backend {backendStatus}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="mb-10">
          <h2 className="text-4xl font-bold tracking-tight">
            Share files locally.
          </h2>

          <p className="mt-3 max-w-xl text-slate-400">
            Transfer files between devices connected to the same Wi-Fi
            network. No cloud storage required.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5 text-4xl">
              📤
            </div>

            <h3 className="text-xl font-semibold">
              Send Files
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Select files and send them to another connected device.
            </p>

            <FilePicker />
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5 text-4xl">
              📥
            </div>

            <h3 className="text-xl font-semibold">
              Received Files
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              View and download files received from other devices.
            </p>

            <button className="mt-6 rounded-xl border border-slate-700 px-5 py-3 font-medium transition hover:bg-slate-800">
              View Files
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-xl font-semibold">
            Backend Connection
          </h3>

          <p className="mt-2 text-slate-400">
            FastAPI status:
            <span className="ml-2 font-medium text-white">
              {backendStatus}
            </span>
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;