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

    const visibleDevices = devices.filter(
        (device) =>
            device.device_id !== currentDeviceId
    );

    return (
        <section className="glass mt-6 rounded-3xl p-5 sm:p-6">
            {/* Header */}
            <div className="mb-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-lg">
                            🟢
                        </span>

                        <h3 className="text-lg font-semibold text-primary sm:text-xl">
                            Devices on Network
                        </h3>
                    </div>

                    <p className="mt-2 text-sm text-secondary">
                        Select a connected device to send files.
                    </p>
                </div>

                <button
                    onClick={loadDevices}
                    disabled={loading}
                    type="button"
                    className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-secondary backdrop-blur-xl transition hover:bg-white/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                >
                    {loading ? 'Loading...' : 'Refresh'}
                </button>
            </div>

            {/* Loading */}
            {loading && (
                <div className="space-y-3">
                    <DeviceSkeleton />
                    <DeviceSkeleton />
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <div className="rounded-2xl border border-red-400/20 bg-red-400/5 px-4 py-4">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">
                            ⚠️
                        </span>

                        <div>
                            <p className="font-medium text-red-400">
                                Unable to load devices
                            </p>

                            <p className="mt-1 text-xs text-secondary">
                                Check the LocalShare connection and try again.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* No devices */}
            {!loading &&
                !error &&
                visibleDevices.length === 0 && (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-8 text-center">
                        <div className="text-3xl">
                            📡
                        </div>

                        <p className="mt-3 font-medium text-primary">
                            No other devices connected
                        </p>

                        <p className="mt-1 text-sm text-secondary">
                            Open LocalShare on another device using the same Wi-Fi.
                        </p>
                    </div>
                )}

            {/* Devices */}
            {!loading &&
                !error &&
                visibleDevices.length > 0 && (
                    <div className="space-y-3">
                        {visibleDevices.map((device) => {
                            const isSelected =
                                selectedDevice?.device_id ===
                                device.device_id;

                            return (
                                <button
                                    key={device.device_id}
                                    type="button"
                                    onClick={() =>
                                        onSelectDevice(device)
                                    }
                                    className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition duration-200 active:scale-[0.99] ${
                                        isSelected
                                            ? 'border-emerald-400/40 bg-emerald-400/10 shadow-lg shadow-emerald-500/5'
                                            : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                                    }`}
                                >
                                    {/* Icon */}
                                    <div
                                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl transition ${
                                            isSelected
                                                ? 'bg-emerald-400/15'
                                                : 'bg-white/5 group-hover:bg-white/10'
                                        }`}
                                    >
                                        {getDeviceIcon(
                                            device.device_name
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-semibold text-primary">
                                            {device.device_name}
                                        </p>

                                        <div className="mt-1.5 flex items-center gap-2">
                                            <span className="relative flex h-2 w-2">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />

                                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                                            </span>

                                            <span className="text-xs text-secondary">
                                                Connected
                                            </span>
                                        </div>
                                    </div>

                                    {/* Selection */}
                                    {isSelected ? (
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-sm font-bold text-slate-950">
                                            ✓
                                        </div>
                                    ) : (
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 text-sm text-muted transition group-hover:border-white/20 group-hover:text-primary">
                                            →
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}

            {/* Selected Device */}
            {selectedDevice && (
                <div className="glass-soft mt-4 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-lg">
                            {getDeviceIcon(
                                selectedDevice.device_name
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-secondary">
                                Ready to send to
                            </p>

                            <p className="mt-0.5 truncate font-semibold text-primary">
                                {selectedDevice.device_name}
                            </p>
                        </div>

                        <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
                            Selected
                        </span>
                    </div>
                </div>
            )}
        </section>
    );
}


function DeviceSkeleton() {
    return (
        <div className="glass-soft flex items-center gap-4 rounded-2xl p-4">
            <div className="h-12 w-12 animate-pulse rounded-2xl bg-white/10" />

            <div className="flex-1 space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
                <div className="h-3 w-20 animate-pulse rounded bg-white/5" />
            </div>
        </div>
    );
}


function getDeviceIcon(deviceName = '') {
    const name = deviceName.toLowerCase();

    if (
        name.includes('android') ||
        name.includes('phone') ||
        name.includes('mobile')
    ) {
        return '📱';
    }

    if (
        name.includes('iphone') ||
        name.includes('ipad')
    ) {
        return '🍎';
    }

    if (
        name.includes('mac')
    ) {
        return '💻';
    }

    if (
        name.includes('windows') ||
        name.includes('pc')
    ) {
        return '💻';
    }

    if (
        name.includes('linux')
    ) {
        return '🖥️';
    }

    return '💻';
}


export default DeviceList;