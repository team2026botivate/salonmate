import React, { useState } from 'react';
import { Camera, User } from 'lucide-react';
import { convertGoogleDriveImageUrl, generateInitials } from '../../utils/imageutils';



const ImageWithFallback= ({ src, alt, name }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [loadFailed, setLoadFailed] = useState(false);

  const handleError = () => {
    if (imgSrc === src && src.includes("drive.google.com")) {
      const urls = convertGoogleDriveImageUrl(src);
      if (Array.isArray(urls) && urls.length > 1) {
        setImgSrc(urls[1]);
        return;
      }
    }
    setLoadFailed(true);
  };

  if (loadFailed) {
    const initials = generateInitials(name);
    return (
      <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
        <span className="text-white text-xl font-semibold">{initials}</span>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className="h-full w-full object-cover"
      onError={handleError}
    />
  );
};

const ProfileImage= ({
  src,
  alt,
  name,
  isEditing,
  onImageChange,
  previewImage
}) => {
  const renderImage = () => {
    if (previewImage) {
      return (
        <img
          src={previewImage}
          alt={alt}
          className="h-full w-full object-cover"
        />
      );
    }

    if (src && !src.startsWith("data:image/svg")) {
      return <ImageWithFallback src={src} alt={alt} name={name} />;
    }

    return (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
        <User size={32} className="text-gray-400" />
      </div>
    );
  };

  return (
    <div className="relative">
      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 bg-white">
        {renderImage()}
      </div>
      {isEditing && (
        <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer transition-opacity hover:bg-opacity-60">
          <Camera size={18} className="text-white" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onImageChange}
          />
        </label>
      )}
    </div>
  );
};

export default ProfileImage;