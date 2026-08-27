import { useEffect, useState } from 'react';
import { api } from './services/api';
import FilePicker from './components/FilePicker';
import DeviceList from './components/DeviceList';
import FileList from './components/FileList';
import IncomingFile from './components/IncomingFile';
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
              className={`h-2.5 w-2.5 rounded-full ${backendStatus === 'online'
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
        {/* Page heading */}

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
                  dismissIncomingFile(
                    file.file_id
                  )
                }
              />
            ))}
          </section>
        )}
        <section className="mb-10">
          <h2 className="text-4xl font-bold tracking-tight">
            Share files locally.
          </h2>

          <p className="mt-3 max-w-xl text-slate-400">
            Transfer files between devices connected to the same Wi-Fi
            network. No cloud storage required.
          </p>
        </section>

        <DeviceList
          refreshTrigger={deviceListVersion}
          selectedDevice={selectedDevice}
          onSelectDevice={setSelectedDevice}
          currentDeviceId={currentDeviceId}
        />

        <br></br>
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

            <FilePicker selectedDevice={selectedDevice} />
            <FileList />
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
      </main>
    </div>
  );
}

export default App;