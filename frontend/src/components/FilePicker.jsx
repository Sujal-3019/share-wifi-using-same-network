import { useRef, useState } from 'react';
import { api } from '../services/api';

function FilePicker() {
  const fileInputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploading(true);
      setMessage(`Uploading ${file.name}...`);

      const result = await api.uploadFile(file);

      setMessage(
        `${result.filename} uploaded successfully`
      );
    } catch (error) {
      console.error(error);

      setMessage('Upload failed');
    } finally {
      setUploading(false);

      event.target.value = '';
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        onClick={handleSelectFile}
        disabled={uploading}
        className="mt-6 rounded-xl bg-white px-5 py-3 font-medium text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Select File'}
      </button>

      {message && (
        <p className="mt-4 text-sm text-slate-400">
          {message}
        </p>
      )}
    </div>
  );
}

export default FilePicker;