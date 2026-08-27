import { useRef, useState } from 'react';
import { api } from '../services/api';

function FilePicker() {
  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSelectFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length === 0) {
      return;
    }

    setFiles(selectedFiles);
    setMessage('');
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      return;
    }

    setUploading(true);
    setMessage('');

    let successful = 0;
    let failed = 0;

    for (const file of files) {
      try {
        await api.uploadFile(file);
        successful++;
      } catch (error) {
        console.error(
          `Failed to upload ${file.name}:`,
          error
        );

        failed++;
      }
    }

    setUploading(false);

    if (failed === 0) {
      setMessage(
        `${successful} file${successful !== 1 ? 's' : ''} uploaded successfully`
      );
      setFiles([]);
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
        <div className="mt-5 space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${file.size}-${index}`}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {file.name}
                </p>

                <p className="text-xs text-slate-500">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="mt-4 rounded-xl bg-emerald-500 px-5 py-3 font-medium text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading
            ? 'Uploading...'
            : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
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


export default FilePicker;