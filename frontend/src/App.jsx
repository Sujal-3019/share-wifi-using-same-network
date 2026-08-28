import { useEffect, useState } from 'react';
import { api } from './services/api';
import FilePicker from './components/FilePicker';
import DeviceList from './components/DeviceList';
import FileList from './components/FileList';
import IncomingFile from './components/IncomingFile';
import QRCodeShare from './components/QRCodeShare';
import ThemeToggle from './components/ThemeToggle';
import {
  getDeviceId,
  getDeviceName,
} from './services/device';
function App() {
  const currentDeviceId = getDeviceId();
  const [backendStatus, setBackendStatus] = useState('checking');
  const [deviceListVersion, setDeviceListVersion] = useState(0);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [incomingFiles, setIncomingFiles] = useState([]);

  const handleIncomingDownload = async (file) => {
    try {
      const blob = await api.downloadFile(
        file.file_id,
        getDeviceId()
      );

      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');

      link.href = url;
      link.download = file.filename;

      document.body.appendChild(link);

      link.click();

      link.remove();

      URL.revokeObjectURL(url);

      // Remove the notification after download starts
      setIncomingFiles((previous) =>
        previous.filter(
          (item) => item.file_id !== file.file_id
        )
      );
    } catch (error) {
      console.error(
        'Failed to download incoming file:',
        error
      );
    }
  };

  const dismissIncomingFile = (fileId) => {
    setIncomingFiles((previous) =>
      previous.filter(
        (file) => file.file_id !== fileId
      )
    );
  };

  useEffect(() => {
    const ws = new WebSocket(
      'ws://192.168.1.36:8000/ws'
    );

    ws.onopen = () => {
      console.log('WebSocket connected');

      ws.send(
        JSON.stringify({
          device_id: getDeviceId(),
          device_name: getDeviceName(),
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        console.log(
          'WebSocket message:',
          message
        );

        if (
          message.type ===
          'device_list_changed'
        ) {
          setDeviceListVersion(
            (previous) => previous + 1
          );
        }

        if (
          message.type ===
          'device_registered'
        ) {
          console.log(
            message.message
          );
        }

        if (
          message.type ===
          'file_available'
        ) {
          setIncomingFiles((previous) => [
            ...previous,
            message.file,
          ]);
        }
      } catch (error) {
        console.error(
          'Invalid WebSocket message:',
          error
        );
      }
    };

    ws.onerror = (error) => {
      console.error(
        'WebSocket error:',
        error
      );
    };

    return () => {
      ws.close();
    };
  }, []);

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
  <div className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-7xl">

      {/* Header */}
      <header className="glass rounded-3xl px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-xl shadow-lg">
              ⚡
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight sm:text-xl">
                LocalShare
              </h1>

              <p className="text-xs text-secondary sm:text-sm">
                Fast local file sharing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-xl bg-emerald-400/10 px-3 py-2 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />

              <span className="text-xs font-medium text-emerald-400">
                {backendStatus === 'online'
                  ? 'Connected'
                  : backendStatus === 'checking'
                    ? 'Connecting'
                    : 'Offline'}
              </span>
            </div>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 text-center sm:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-medium text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Same Wi-Fi · No Cloud
          </div>

          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Share files.
            <span className="mt-2 block bg-linear-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Locally.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-secondary sm:text-base">
            Transfer photos, videos and documents directly
            between devices connected to the same Wi-Fi
            network.
          </p>
        </div>
      </section>

      {/* Incoming files */}
      {incomingFiles.length > 0 && (
        <section className="mb-6 space-y-3">
          {incomingFiles.map((file) => (
            <IncomingFile
              key={file.file_id}
              file={file}
              onDownload={() =>
                handleIncomingDownload(file)
              }
              onDismiss={() =>
                dismissIncomingFile(file.file_id)
              }
            />
          ))}
        </section>
      )}

      {/* Devices */}
      <DeviceList
        refreshTrigger={deviceListVersion}
        selectedDevice={selectedDevice}
        onSelectDevice={setSelectedDevice}
        currentDeviceId={currentDeviceId}
      />

      {/* Main actions */}
      <section className="mt-6 grid gap-6 lg:grid-cols-2">

        {/* Send */}
        <div className="glass rounded-3xl p-6 sm:p-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-2xl">
                📤
              </div>

              <h3 className="text-2xl font-semibold">
                Send Files
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-secondary">
                Choose a connected device and send files
                directly over your local network.
              </p>
            </div>

            <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-400">
              LAN
            </span>
          </div>

          <div className="mt-6">
            <FilePicker
              selectedDevice={selectedDevice}
            />
          </div>
        </div>

        {/* Received */}
        <div className="glass rounded-3xl p-6 sm:p-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-400/10 text-2xl">
                📥
              </div>

              <h3 className="text-2xl font-semibold">
                Received Files
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-secondary">
                Files shared with this device appear here
                automatically.
              </p>
            </div>

            <span className="rounded-full bg-purple-400/10 px-3 py-1 text-xs font-medium text-purple-400">
              Local
            </span>
          </div>

          <div className="mt-6">
            <FileList />
          </div>
        </div>

      </section>

      {/* QR */}
      <section className="mt-6">
        <QRCodeShare />
      </section>

      {/* Footer */}
      <footer className="py-8 text-center">
        <p className="text-xs text-muted">
          LocalShare · Files stay on your local network
        </p>
      </footer>

    </div>
  </div>
);
}

export default App;