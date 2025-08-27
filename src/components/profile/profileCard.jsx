import { Calendar, Mail, MapPin, Phone, Shield } from 'lucide-react';
import React from 'react';
import ProfileImage from './profileImage';



const ProfileCard = ({
  profileData,
  isEditing,
  onImageChange,
  previewImage
}) => {


  console.log(profileData, 'profileData')
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Profile Header */}
      <div className="px-6 pt-6 pb-4 text-center">
        <div className="flex justify-center mb-4">
          <ProfileImage
            src={profileData.profileImage}
            alt={profileData.name || "User"}
            name={profileData.name}
            isEditing={isEditing}
            onImageChange={onImageChange}
            previewImage={previewImage}
          />
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-1">
          {profileData.name || 'User Name'}
        </h2>
        
        {profileData.role && (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Shield size={14} className="mr-1" />
            {profileData.role}
          </div>
        )}
      </div>

      {/* Contact Information */}
      <div className="px-6 pb-6 space-y-3">
        {profileData.email && (
          <div className="flex items-center text-sm text-gray-600">
            <Mail size={16} className="mr-3 text-gray-400 flex-shrink-0" />
            <span className="truncate">{profileData.email}</span>
          </div>
        )}
        
        {profileData.phone && (
          <div className="flex items-center text-sm text-gray-600">
            <Phone size={16} className="mr-3 text-gray-400 flex-shrink-0" />
            <span>{profileData.phone}</span>
          </div>
        )}
        
        {profileData.address && (
          <div className="flex items-start text-sm text-gray-600">
            <MapPin size={16} className="mr-3 text-gray-400 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{profileData.address}</span>
          </div>
        )}
        
        {profileData.joinDate && (
          <div className="flex items-center text-sm text-gray-600">
            <Calendar size={16} className="mr-3 text-gray-400 flex-shrink-0" />
            <span>Joined {profileData.joinDate}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;