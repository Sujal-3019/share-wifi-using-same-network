import { useEffect, useState } from 'react';
import { api } from '../services/api';

function DeviceList({
    refreshTrigger,
    selectedDevice,
    onSelectDevice,
    currentDeviceId,
}) {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadDevices = async () => {
        try {
            setLoading(true);
            setError('');

            const result = await api.getDevices();

            setDevices(result.devices || []);
        } catch (error) {
            console.error(error);
            setError('Unable to load devices');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDevices();
    }, [refreshTrigger]);

    return (
        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-semibold text-white">
                        🟢 Devices on Network
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Select a device to send files
                    </p>
                </div>

                <button
                    onClick={loadDevices}
                    className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
                >
                    Refresh
                </button>
            </div>

            {loading && (
                <p className="text-sm text-slate-400">
                    Loading devices...
                </p>
            )}

            {error && (
                <p className="text-sm text-red-400">
                    {error}
                </p>
            )}

            {!loading &&
                !error &&
                devices.length === 0 && (
                    <p className="text-sm text-slate-500">
                        No devices connected.
                    </p>
                )}

            <div className="space-y-3">
                {devices
                    .filter(
                        (device) =>
                            device.device_id !== currentDeviceId
                    )
                    .map((device) => {
                        const isSelected =
                            selectedDevice?.device_id ===
                            device.device_id;

                        return (
                            <button
                                key={device.device_id}
                                onClick={() =>
                                    onSelectDevice(device)
                                }
                                className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${isSelected
                                        ? 'border-emerald-500 bg-emerald-500/10'
                                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                                    }`}
                            >
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-xl">
                                    💻
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium text-white">
                                        {device.device_name}
                                    </p>

                                    <div className="mt-1 flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-emerald-400" />

                                        <span className="text-xs text-slate-500">
                                            Connected
                                        </span>
                                    </div>
                                </div>

                                {isSelected && (
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-sm text-white">
                                        ✓
                                    </div>
                                )}
                            </button>
                        );
                    })}
            </div>

            {selectedDevice && (
                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
                    <p className="text-xs text-slate-500">
                        Selected device
                    </p>

                    <p className="mt-1 font-medium text-white">
                        {selectedDevice.device_name}
                    </p>
                </div>
            )}
        </section>
    );
}

export default DeviceList;