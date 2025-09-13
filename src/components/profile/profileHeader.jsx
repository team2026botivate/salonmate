import React from 'react';
import { ArrowLeft, Edit3, Save, X, Users, User } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';

const ProfileHeader = ({
  onGoBack,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onStaffManagement,
  isLoading,
  showStaffManagement,
  staffGivePermission,
  setStaffGivePermission,
}) => {
  const { user } = useAuth();
  console.log(user, 'profile header');
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex flex-row-reverse items-center gap-5 space-x-8">
            <div className="items-center hidden sm:flex">
              <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-lg">
                <User size={18} className="text-white" />
              </div>
              <span className="ml-3 text-xl font-semibold text-gray-900">Profile</span>
            </div>

            <button
              onClick={onGoBack}
              className="flex items-center text-sm font-medium text-gray-800 transition-colors group hover:cursor-pointer hover:text-black"
            >
              <ArrowLeft
                size={16}
                className="mr-2 transition-transform duration-150 group-hover:text-black group-hover:-translate-x-1 group-hover:scale-125"
              />
              Dashboard
            </button>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-3">
            {showStaffManagement && onStaffManagement && (
              <button
                onClick={onStaffManagement}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Users size={16} className="mr-2" />
                Staff Management
              </button>
            )}

            {!isEditing ? (
              <button
                onClick={onEdit}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                <Edit3 size={16} className="mr-2 " />
                <span className="hidden sm:inline">Edit Profile</span>
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={onCancel}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <X size={16} className="mr-2" />
                  <span className="hidden sm:inline">Cancel</span>
                </button>
                <button
                  onClick={onSave}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-t-2 border-b-2 border-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      <span className="hidden sm:inline">Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {user?.role && user?.role === 'admin' && (
              <button
                onClick={() => setStaffGivePermission(!staffGivePermission)}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg md:w-45 w-36 hover:bg-gray-500 hover:cursor-pointer hover:text-white"
              >
                <Users size={16} className="hidden mr-2 sm:block" />
                {staffGivePermission ? 'Close Permission' : 'Give Permission'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
