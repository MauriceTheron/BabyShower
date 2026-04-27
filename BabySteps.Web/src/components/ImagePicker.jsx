import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import ImageCropper from './ImageCropper';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BYTES = 5 * 1024 * 1024;

export default function ImagePicker({ value, onChange, label = 'Image', aspect }) {
  const inputRef = useRef(null);
  const [cropFile, setCropFile] = useState(null);
  const [error, setError] = useState('');

  const pickFile = (file) => {
    if (!file) return;
    setError('');
    if (!ALLOWED.includes(file.type)) {
      setError('Only JPG, PNG, WebP and GIF are allowed.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('File exceeds 5 MB limit.');
      return;
    }
    setCropFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    pickFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-600">{label}</p>

      {value && (
        <div className="relative inline-block w-full">
          <img
            src={value}
            alt="preview"
            className="w-full max-h-40 object-cover rounded-xl border border-gray-200"
            onError={e => { e.target.style.display = 'none'; }}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-1.5 right-1.5 bg-white/90 rounded-full p-1 shadow text-gray-600 hover:text-red-500"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-5 cursor-pointer hover:border-header/50 hover:bg-header/5 transition-colors"
      >
        <Upload size={20} className="text-gray-400" />
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-header">Click to upload</span> or drag & drop
        </p>
        <p className="text-xs text-gray-400">JPG, PNG, WebP — max 5 MB</p>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={e => { pickFile(e.target.files[0]); e.target.value = ''; }}
      />

      {cropFile && (
        <ImageCropper
          file={cropFile}
          aspect={aspect}
          onDone={(url) => { onChange(url); setCropFile(null); }}
          onCancel={() => setCropFile(null)}
        />
      )}
    </div>
  );
}
