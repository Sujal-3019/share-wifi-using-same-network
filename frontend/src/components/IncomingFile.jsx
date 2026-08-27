function IncomingFile({ file, onDownload, onDismiss }) {
    return (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">
                            📥
                        </span>

                        <p className="font-semibold text-white">
                            New File
                        </p>
                    </div>

                    <p className="mt-3 truncate font-medium text-white">
                        {file.filename}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                        {formatFileSize(file.size)}
                    </p>
                </div>

                <button
                    onClick={onDismiss}
                    className="text-slate-500 transition hover:text-white"
                    aria-label="Dismiss notification"
                >
                    ✕
                </button>
            </div>

            <div className="mt-4 flex gap-3">
                <button
                    onClick={onDownload}
                    className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-400"
                >
                    Download
                </button>

                <button
                    onClick={onDismiss}
                    className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
                >
                    Dismiss
                </button>
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


export default IncomingFile;