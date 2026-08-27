import { useRef, useState } from 'react';
import { api } from '../services/api';

function FilePicker({ selectedDevice }) {
    const fileInputRef = useRef(null);

    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSelectFiles = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(
            event.target.files || []
        );

        if (selectedFiles.length === 0) {
            return;
        }

        const filesWithProgress = selectedFiles.map(
            (file) => ({
                file,
                progress: 0,
                status: 'waiting',
                uploadedBytes: 0,
                totalBytes: file.size,
            })
        );

        setFiles(filesWithProgress);
        setMessage('');
    };



    const handleUpload = async () => {
        if (files.length === 0 || uploading || !selectedDevice) {
            return;
        }
        setMessage(
            `Sending to ${selectedDevice.device_name}...`
        );
        setUploading(true);
        setMessage('');

        let successful = 0;
        let failed = 0;

        for (let index = 0; index < files.length; index++) {
            const currentFile = files[index];

            setFiles((previousFiles) =>
                previousFiles.map((item, itemIndex) =>
                    itemIndex === index
                        ? {
                            ...item,
                            status: 'uploading',
                            progress: 0,
                        }
                        : item
                )
            );

            try {
                await api.uploadFile(
                    currentFile.file,
                    selectedDevice.device_id,
                    (progress, loaded, total) => {
                        setFiles((previousFiles) =>
                            previousFiles.map(
                                (item, itemIndex) =>
                                    itemIndex === index
                                        ? {
                                            ...item,
                                            progress,
                                            uploadedBytes: loaded,
                                            totalBytes: total,
                                            status: 'uploading',
                                        }
                                        : item
                            )
                        );
                    }
                );

                successful++;

                setFiles((previousFiles) =>
                    previousFiles.map((item, itemIndex) =>
                        itemIndex === index
                            ? {
                                ...item,
                                progress: 100,
                                uploadedBytes: item.totalBytes,
                                status: 'completed',
                            }
                            : item
                    )
                );
            } catch (error) {
                console.error(
                    `Failed to upload ${currentFile.file.name}:`,
                    error
                );

                failed++;

                setFiles((previousFiles) =>
                    previousFiles.map((item, itemIndex) =>
                        itemIndex === index
                            ? {
                                ...item,
                                status: 'failed',
                            }
                            : item
                    )
                );
            }
        }

        setUploading(false);

        if (failed === 0) {
            setMessage(
                `${successful} file${successful !== 1 ? 's' : ''
                } uploaded successfully`
            );
        } else {
            setMessage(
                `${successful} uploaded, ${failed} failed`
            );
        }
    };

    return (
        <div>
            <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
            />

            <button
                onClick={handleSelectFiles}
                disabled={uploading}
                className="mt-6 rounded-xl bg-white px-5 py-3 font-medium text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {uploading ? 'Uploading...' : 'Select Files'}
            </button>

            {files.length > 0 && (
                <div className="mt-5 space-y-3">
                    {files.map((item, index) => (
                        <FileProgressItem
                            key={`${item.file.name}-${item.file.size}-${index}`}
                            item={item}
                        />
                    ))}
                </div>
            )}

            {files.length > 0 && !uploading && (
                <button
                    onClick={handleUpload}
                    className="mt-4 rounded-xl bg-emerald-500 px-5 py-3 font-medium text-white transition hover:bg-emerald-400"
                >
                    Upload {files.length} File
                    {files.length !== 1 ? 's' : ''}
                </button>
            )}

            {message && (
                <p className="mt-4 text-sm text-slate-400">
                    {message}
                </p>
            )}
        </div>
    );
}


function FileProgressItem({ item }) {
    const {
        file,
        progress,
        status,
        uploadedBytes,
        totalBytes,
    } = item;

    return (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <p className="truncate font-medium text-white">
                        {file.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        {formatFileSize(uploadedBytes)} /{' '}
                        {formatFileSize(totalBytes)}
                    </p>
                </div>

                <div className="shrink-0 text-sm">
                    {status === 'waiting' && (
                        <span className="text-slate-500">
                            Waiting...
                        </span>
                    )}

                    {status === 'uploading' && (
                        <span className="text-slate-300">
                            {Math.round(progress)}%
                        </span>
                    )}

                    {status === 'completed' && (
                        <span className="text-emerald-400">
                            ✓ Complete
                        </span>
                    )}

                    {status === 'failed' && (
                        <span className="text-red-400">
                            Failed
                        </span>
                    )}
                </div>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
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


export default FilePicker;