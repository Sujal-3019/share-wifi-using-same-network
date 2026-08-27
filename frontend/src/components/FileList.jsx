import { useEffect, useState } from 'react';
import { api } from '../services/api';

function FileList() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError('');

      const result = await api.getFiles();

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

  const handleDownload = (fileId) => {
    const downloadUrl =
      `${import.meta.env.VITE_API_URL}/api/files/${fileId}/download`;

    window.location.href = downloadUrl;
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
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-4"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-white">
                {file.filename}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {formatFileSize(file.size)}
              </p>
            </div>

            <button
              onClick={() =>
                handleDownload(file.file_id)
              }
              className="ml-4 shrink-0 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-950 hover:bg-slate-200"
            >
              Download
            </button>
          </div>
        ))}
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