import { useState } from 'react';
import { Upload, X } from 'lucide-react';

export function ImageUpload({ images, onImagesChange }) {


  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('Only JPEG, JPG, PNG files are allowed.');
      return false;
    }
    setError('');
    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(validateFile);
    if (validFiles.length > 0) {
      onImagesChange([...images, ...validFiles]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(validateFile);
      if (validFiles.length > 0) {
        onImagesChange([...images, ...validFiles]);
      }
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const mainImage = images[0];

  return (
    <div className="space-y-4">
      <div
        className={`relative rounded-2xl border-2 border-dashed transition-colors  ${
          dragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {mainImage ? (
          <div className="relative aspect-square">
            <img
              src={URL.createObjectURL(mainImage)}
              alt="Product preview"
              className="h-full w-full rounded-2xl object-cover"
            />
            <button
              onClick={() => removeImage(0)}
              className="absolute top-3 right-3 rounded-full bg-white p-2 shadow-lg transition-colors hover:bg-gray-100"
            >
              <X className="h-4 w-4 text-gray-700" />
            </button>
          </div>
        ) : (
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center">
            <Upload className="mb-3 h-12 w-12 text-gray-400" />
            <p className="mb-1 text-sm font-medium text-gray-700">
              Drop your image here, or browse
            </p>
            <p className="text-xs text-gray-500">JPEG, JPG, PNG only</p>
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/jpg,image/png"
              multiple
              onChange={handleFileInput}
            />
          </label>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.slice(1).map((image, index) => (
            <div key={index} className="relative flex-shrink-0">
              <img
                src={URL.createObjectURL(image)}
                alt={`Product ${index + 2}`}
                className="h-20 w-20 rounded-xl border-2 border-gray-200 object-cover"
              />
              <button
                onClick={() => removeImage(index + 1)}
                className="absolute -top-2 -right-2 rounded-full bg-white p-1 shadow-lg transition-colors hover:bg-gray-100"
              >
                <X className="h-3 w-3 text-gray-700" />
              </button>
            </div>
          ))}
          <label className="flex h-20 w-20 flex-shrink-0 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-300 transition-colors hover:border-green-500 hover:bg-green-50">
            <Upload className="h-5 w-5 text-gray-400" />
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/jpg,image/png"
              multiple
              onChange={handleFileInput}
            />
          </label>
        </div>
      )}
    </div>
  );
}
