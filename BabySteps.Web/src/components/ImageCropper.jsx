import { useState, useRef, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X } from 'lucide-react';
import api from '../api/client';

function initCrop(width, height, aspect) {
  if (aspect) {
    return centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, aspect, width, height),
      width,
      height,
    );
  }
  return { unit: '%', x: 5, y: 5, width: 90, height: 90 };
}

export default function ImageCropper({ file, aspect, onDone, onCancel }) {
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const imgRef = useRef(null);

  useEffect(() => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImgSrc(reader.result?.toString() || '');
    reader.readAsDataURL(file);
  }, [file]);

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    setCrop(initCrop(width, height, aspect));
  };

  const handleConfirm = () => {
    const img = imgRef.current;
    if (!img || !completedCrop?.width || !completedCrop?.height) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    canvas.width = Math.round(completedCrop.width * scaleX);
    canvas.height = Math.round(completedCrop.height * scaleY);

    ctx.drawImage(
      img,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0, 0,
      canvas.width,
      canvas.height,
    );

    setUploading(true);
    setError('');
    canvas.toBlob(async (blob) => {
      if (!blob) { setUploading(false); return; }
      const form = new FormData();
      form.append('file', blob, 'image.jpg');
      try {
        const { data } = await api.post('/uploads', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        onDone(data.url);
      } catch (err) {
        setError(err.response?.data || 'Upload failed.');
        setUploading(false);
      }
    }, 'image/jpeg', 0.92);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <p className="font-bold text-gray-800">Crop Image</p>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Crop area */}
        <div className="flex items-center justify-center bg-gray-900 overflow-auto" style={{ maxHeight: '55vh' }}>
          {imgSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, pct) => setCrop(pct)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              minWidth={30}
              minHeight={30}
            >
              <img
                ref={imgRef}
                src={imgSrc}
                alt="crop preview"
                onLoad={onImageLoad}
                style={{ maxHeight: '55vh', maxWidth: '100%', display: 'block' }}
              />
            </ReactCrop>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex-shrink-0 space-y-3">
          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-semibold text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={uploading || !completedCrop?.width}
              className="flex-1 py-3 rounded-2xl bg-header text-white font-bold text-sm disabled:opacity-40"
            >
              {uploading ? 'Uploading…' : 'Crop & Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
