import { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { api } from '../services/api';

function QRCodeShare() {
  const [frontendUrl, setFrontendUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadNetworkInfo = async () => {
      try {
        setLoading(true);
        setError('');

        const result = await api.getNetworkInfo();

        setFrontendUrl(result.frontend_url);
      } catch (error) {
        console.error(error);
        setError('Unable to generate QR code');
      } finally {
        setLoading(false);
      }
    };

    loadNetworkInfo();
  }, []);

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-sm text-slate-400">
          Preparing connection QR code...
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-sm text-red-400">
          {error}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div>
        <h3 className="text-xl font-semibold text-white">
          📱 Connect a Device
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Scan this QR code from a device connected to the same Wi-Fi.
        </p>
      </div>

      <div className="mt-6 flex flex-col items-center">
        <div className="rounded-2xl bg-white p-4">
          <QRCodeCanvas
            value={frontendUrl}
            size={220}
            level="M"
          />
        </div>

        <p className="mt-4 break-all text-center text-sm text-slate-400">
          {frontendUrl}
        </p>
      </div>
    </section>
  );
}

export default QRCodeShare;