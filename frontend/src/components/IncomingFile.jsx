function IncomingFile({
    file,
    onDownload,
    onDismiss,
}) {
    return (
        <div className="glass-strong relative overflow-hidden rounded-3xl border border-emerald-400/20 p-5 sm:p-6">
            {/* Accent glow */}
            <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-400/10 blur-3xl" />

            <div className="relative">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/10 text-xl">
                            📥
                        </div>

                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="font-semibold text-primary">
                                    New File
                                </p>

                                <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                                    Incoming
                                </span>
                            </div>

                            <p
                                className="mt-2 truncate font-medium text-primary"
                                title={file.filename}
                            >
                                {file.filename}
                            </p>

                            <p className="mt-1 text-sm text-secondary">
                                {formatFileSize(file.size)}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onDismiss}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-white/5 hover:text-primary active:scale-95"
                        aria-label="Dismiss notification"
                    >
                        ✕
                    </button>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={onDownload}
                        className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/10 transition hover:bg-emerald-300 active:scale-[0.98]"
                    >
                        ↓ Download
                    </button>

                    <button
                        type="button"
                        onClick={onDismiss}
                        className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-secondary backdrop-blur-xl transition hover:bg-white/10 active:scale-[0.98]"
                    >
                        Dismiss
                    </button>
                </div>
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