import React from 'react';
import { ArrowLeft, Edit3, Save, X, Users, User } from 'lucide-react';



const ProfileHeader = ({
  onGoBack,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onStaffManagement,
  isLoading,
  showStaffManagement
}) => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-8 flex-row-reverse gap-5">
            <div className="sm:flex items-centern hidden">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <User size={18} className="text-white" />
              </div>
              <span className="ml-3 text-xl font-semibold text-gray-900">Profile</span>
            </div>
            
            <button
              onClick={onGoBack}
              className="flex  items-center group hover:cursor-pointer  text-gray-800 hover:text-black transition-colors text-sm font-medium"
            >
              <ArrowLeft size={16} className="mr-2 group-hover:text-black group-hover:-translate-x-1 group-hover:scale-125  transition-transform duration-150" />
              Dashboard
            </button>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-3">
            {showStaffManagement && onStaffManagement && (
              <button
                onClick={onStaffManagement}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Users size={16} className="mr-2" />
                Staff Management
              </button>
            )}

            {!isEditing ? (
              <button
                onClick={onEdit}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                <Edit3 size={16} className="mr-2" />
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={onCancel}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <X size={16} className="mr-2" />
                  Cancel
                </button>
                <button
                  onClick={onSave}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;