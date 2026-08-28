import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { getDeviceId } from '../services/device';

function FileList() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [downloads, setDownloads] = useState({});

    const loadFiles = async () => {
        try {
            setLoading(true);
            setError('');

            const result =
                await api.getFiles(getDeviceId());

            setFiles(result.files || []);
        } catch (error) {
            console.error(error);

            setError(
                'Unable to load received files'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFiles();
    }, []);

    const handleDownload = async (file) => {
        const fileId = file.file_id;

        setDownloads((previous) => ({
            ...previous,
            [fileId]: {
                progress: 0,
                status: 'downloading',
                downloadedBytes: 0,
                totalBytes: file.size,
            },
        }));

        try {
            const blob =
                await api.downloadFile(
                    fileId,
                    getDeviceId(),
                    (
                        progress,
                        loaded,
                        total
                    ) => {
                        setDownloads(
                            (previous) => ({
                                ...previous,
                                [fileId]: {
                                    progress,
                                    status:
                                        'downloading',
                                    downloadedBytes:
                                        loaded,
                                    totalBytes:
                                        total,
                                },
                            })
                        );
                    }
                );

            const url =
                URL.createObjectURL(blob);

            const link =
                document.createElement('a');

            link.href = url;
            link.download = file.filename;

            document.body.appendChild(link);

            link.click();

            link.remove();

            URL.revokeObjectURL(url);

            setDownloads((previous) => ({
                ...previous,
                [fileId]: {
                    progress: 100,
                    status: 'completed',
                    downloadedBytes: file.size,
                    totalBytes: file.size,
                },
            }));
        } catch (error) {
            console.error(
                `Failed to download ${file.filename}:`,
                error
            );

            setDownloads((previous) => ({
                ...previous,
                [fileId]: {
                    progress: 0,
                    status: 'failed',
                    downloadedBytes: 0,
                    totalBytes: file.size,
                },
            }));
        }
    };

    if (loading) {
        return (
            <div className="mt-5 space-y-3">
                <FileSkeleton />
                <FileSkeleton />
            </div>
        );
    }

    return (
        <div className="mt-5">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-primary">
                        Received Files
                    </h2>

                    <p className="mt-1 text-xs text-secondary">
                        Files shared with this device.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadFiles}
                    disabled={loading}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-secondary transition hover:bg-white/10 active:scale-95 disabled:opacity-50"
                >
                    ↻ Refresh
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-2xl border border-red-400/20 bg-red-400/5 px-4 py-3">
                    <p className="text-sm text-red-400">
                        {error}
                    </p>
                </div>
            )}

            {/* Empty state */}
            {!error && files.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-8 text-center">
                    <div className="text-3xl">
                        📂
                    </div>

                    <p className="mt-3 font-medium text-primary">
                        No received files
                    </p>

                    <p className="mt-1 text-sm text-secondary">
                        Files sent to this device will appear here.
                    </p>
                </div>
            )}

            {/* File list */}
            {!error && files.length > 0 && (
                <div className="space-y-3">
                    {files.map((file) => {
                        const download =
                            downloads[file.file_id];

                        return (
                            <div
                                key={file.file_id}
                                className="glass-soft rounded-2xl p-4 transition hover:bg-white/[0.06]"
                            >
                                <div className="flex items-center gap-3">
                                    {/* File icon */}
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-lg">
                                        {getFileIcon(
                                            file.filename
                                        )}
                                    </div>

                                    {/* File details */}
                                    <div className="min-w-0 flex-1">
                                        <p
                                            className="truncate font-medium text-primary"
                                            title={file.filename}
                                        >
                                            {file.filename}
                                        </p>

                                        <p className="mt-1 text-xs text-secondary">
                                            {formatFileSize(
                                                file.size
                                            )}
                                        </p>
                                    </div>

                                    {/* Download */}
                                    {!download && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDownload(
                                                    file
                                                )
                                            }
                                            className="shrink-0 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold text-primary transition hover:bg-white/15 active:scale-95 sm:text-sm"
                                        >
                                            ↓ Download
                                        </button>
                                    )}
                                </div>

                                {/* Progress */}
                                {download && (
                                    <DownloadProgress
                                        download={download}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}


function DownloadProgress({ download }) {
    const {
        progress,
        status,
        downloadedBytes,
        totalBytes,
    } = download;

    return (
        <div className="mt-4 border-t border-white/5 pt-4">
            <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-secondary">
                    {status === 'downloading' &&
                        `${formatFileSize(
                            downloadedBytes
                        )} / ${formatFileSize(
                            totalBytes
                        )}`}

                    {status === 'completed' &&
                        'Download complete'}

                    {status === 'failed' &&
                        'Download failed'}
                </span>

                <span
                    className={
                        status === 'failed'
                            ? 'text-red-400'
                            : status === 'completed'
                                ? 'text-emerald-400'
                                : 'text-primary'
                    }
                >
                    {status === 'downloading' &&
                        `${Math.round(
                            progress
                        )}%`}

                    {status === 'completed' &&
                        '✓'}

                    {status === 'failed' &&
                        '✕'}
                </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
                <div
                    className={`h-full rounded-full transition-all duration-150 ${
                        status === 'failed'
                            ? 'bg-red-400'
                            : 'bg-emerald-400'
                    }`}
                    style={{
                        width: `${progress}%`,
                    }}
                />
            </div>
        </div>
    );
}


function FileSkeleton() {
    return (
        <div className="glass-soft flex items-center gap-3 rounded-2xl p-4">
            <div className="h-11 w-11 animate-pulse rounded-xl bg-white/10" />

            <div className="flex-1 space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
                <div className="h-3 w-20 animate-pulse rounded bg-white/5" />
            </div>

            <div className="h-9 w-24 animate-pulse rounded-xl bg-white/5" />
        </div>
    );
}


function getFileIcon(filename = '') {
    const extension =
        filename
            .split('.')
            .pop()
            ?.toLowerCase();

    if (
        ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
            .includes(extension)
    ) {
        return '🖼️';
    }

    if (
        ['mp4', 'mov', 'avi', 'mkv', 'webm']
            .includes(extension)
    ) {
        return '🎬';
    }

    if (
        ['mp3', 'wav', 'ogg', 'm4a']
            .includes(extension)
    ) {
        return '🎵';
    }

    if (
        ['pdf']
            .includes(extension)
    ) {
        return '📕';
    }

    if (
        ['doc', 'docx', 'txt']
            .includes(extension)
    ) {
        return '📄';
    }

    if (
        ['zip', 'rar', '7z']
            .includes(extension)
    ) {
        return '🗜️';
    }

    return '📁';
}


function formatFileSize(bytes) {
    if (!bytes || bytes === 0) {
        return '0 Bytes';
    }

    const units = [
        'Bytes',
        'KB',
        'MB',
        'GB',
        'TB',
    ];

    const index = Math.min(
        Math.floor(
            Math.log(bytes) / Math.log(1024)
        ),
        units.length - 1
    );

    const size =
        bytes / Math.pow(1024, index);

    return `${size.toFixed(
        index === 0 ? 0 : 2
    )} ${units[index]}`;
}


export default FileList;