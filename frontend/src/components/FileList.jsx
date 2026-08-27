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

            const result = await api.getFiles(getDeviceId());

            setFiles(result.files || []);
        } catch (error) {
            console.error(error);
            setError('Unable to load files');
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
            const blob = await api.downloadFile(
                fileId,
                getDeviceId(),
                (progress, loaded, total) => {
                    setDownloads((previous) => ({
                        ...previous,
                        [fileId]: {
                            progress,
                            status: 'downloading',
                            downloadedBytes: loaded,
                            totalBytes: total,
                        },
                    }));
                }
            );

            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');

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
            <div className="mt-8">
                <p className="text-sm text-slate-400">
                    Loading files...
                </p>
            </div>
        );
    }

    return (
        <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                    📥 Available Files
                </h2>

                <button
                    onClick={loadFiles}
                    className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                    Refresh
                </button>
            </div>

            {error && (
                <p className="text-sm text-red-400">
                    {error}
                </p>
            )}

            {!error && files.length === 0 && (
                <p className="text-sm text-slate-500">
                    No files available.
                </p>
            )}

            <div className="space-y-3">
                {files.map((file) => (
                    <div
                        key={file.file_id}
                        className="rounded-xl border border-slate-800 bg-slate-900 p-4"
                    >
                        <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                                <p className="truncate font-medium text-white">
                                    {file.filename}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    {formatFileSize(file.size)}
                                </p>
                            </div>

                            {!downloads[file.file_id] && (
                                <button
                                    onClick={() => handleDownload(file)}
                                    className="shrink-0 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-950 hover:bg-slate-200"
                                >
                                    Download
                                </button>
                            )}
                        </div>

                        {downloads[file.file_id] && (
                            <DownloadProgress
                                download={downloads[file.file_id]}
                            />
                        )}
                    </div>
                ))}
            </div>
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
        <div className="mt-3">
            <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">
                    {status === 'downloading' &&
                        `${formatFileSize(downloadedBytes)} / ${formatFileSize(totalBytes)}`}

                    {status === 'completed' &&
                        'Download complete'}

                    {status === 'failed' &&
                        'Download failed'}
                </span>

                <span className="text-slate-300">
                    {status === 'downloading' &&
                        `${Math.round(progress)}%`}

                    {status === 'completed' &&
                        '✓'}

                    {status === 'failed' &&
                        '✕'}
                </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-150"
                    style={{
                        width: `${progress}%`,
                    }}
                />
            </div>
        </div>
    );
}


function formatFileSize(bytes) {
    if (bytes === 0) {
        return '0 Bytes';
    }

    const units = [
        'Bytes',
        'KB',
        'MB',
        'GB',
        'TB',
    ];

    const index = Math.floor(
        Math.log(bytes) / Math.log(1024)
    );

    const size = bytes / Math.pow(1024, index);

    return `${size.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
}


export default FileList;