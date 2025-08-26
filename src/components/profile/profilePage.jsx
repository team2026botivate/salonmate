import { User as UserIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { validateImageFile } from '../../utils/imageutils';
import ProfileHeader from './profileHeader';
import ProfileCard from './profileCard';
import SkillsSection from './skillSection';
import EditableField from './editableFiled';
import { convertGoogleDriveImageUrl } from '../../utils/imageutils';





const ProfilePage = ({
  user,
  updateUserProfile,
  onGoBack,
  onStaffManagement
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: user?.email || '',
    phone: '',
    address: '',
    profileImage: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23f0f0f0'/%3E%3Ccircle cx='75' cy='60' r='30' fill='%23d1d1d1'/%3E%3Ccircle cx='75' cy='150' r='60' fill='%23d1d1d1'/%3E%3C/svg%3E",
    role: '',
    joinDate: '',
    bio: '',
    skills: [],
  });

  useEffect(() => {
    if (user) {
      fetchUserProfileData(user?.email);
    }
  }, [user]);

  const fetchUserProfileData = async (userEmail) => {
    try {
      setIsLoading(true);
      const sheetId = "1zEik6_I7KhRQOucBhk1FW_67IUEdcSfEHjCaR37aK_U";
      const sheetName = "Clients";
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch data: ${response.status}`);

      const text = await response.text();
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");
      const jsonString = text.substring(jsonStart, jsonEnd + 1);
      const data = JSON.parse(jsonString);

      if (!data.table?.rows) throw new Error("Invalid data format");

      const userRow = data.table.rows.find((row) =>
        row.c?.[2]?.v?.toString().trim().toLowerCase() === userEmail.toLowerCase()
      );

      if (userRow) {
        const extractValue = (index) =>
          userRow.c[index]?.v?.toString().trim() || '';

        const skillsString = extractValue(14);
        const skills = skillsString ? skillsString.split(",").map(s => s.trim()) : [];

        setProfileData(prev => ({
          ...prev,
          name: extractValue(9) || prev.name,
          email: extractValue(10) || prev.email,
          phone: extractValue(11) || prev.phone,
          address: extractValue(12) || prev.address,
          bio: extractValue(13) || prev.bio,
          skills: skills.length > 0 ? skills : prev.skills,
          profileImage: extractValue(15) || prev.profileImage,
          role: extractValue(8) || prev.role,
        }));
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      setError("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setPreviewImage(imageUrl);

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileData(prev => ({
        ...prev,
        profileImage: reader.result ,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddSkill = (skill) => {
    setProfileData(prev => ({
      ...prev,
      skills: [...prev.skills, skill],
    }));
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove),
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError("");

    try {
      const scriptUrl = "https://script.google.com/macros/s/AKfycbz6-tMsYOC4lbu4XueMyMLccUryF9HkY7HZLC22FB9QeB5NxqCcxedWKS8drwgVwlM/exec";
      
      const formData = new FormData();
      formData.append("action", "updateProfile");
      formData.append("email", user.email);
      formData.append("fullName", profileData.name);
      formData.append("emailAddress", profileData.email);
      formData.append("phone", profileData.phone);
      formData.append("address", profileData.address);
      formData.append("bio", profileData.bio);
      formData.append("skills", profileData.skills.join(","));
      formData.append("profileImage", profileData.profileImage);
      formData.append("isNewImage", profileData.profileImage.startsWith("data:image") ? "true" : "false");

      const response = await fetch(scriptUrl, {
        method: "POST",
        body: formData,
      });

      if (updateUserProfile) {
        updateUserProfile(profileData);
      }

      alert("Profile updated successfully!");
      setIsEditing(false);
      setPreviewImage(null);
      fetchUserProfileData(user.email);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    fetchUserProfileData(user.email);
    setPreviewImage(null);
    setIsEditing(false);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileHeader
        onGoBack={onGoBack}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onSave={handleSave}
        onCancel={handleCancel}
        onStaffManagement={onStaffManagement}
        isLoading={isLoading}
        showStaffManagement={profileData.role === "admin"}
      />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-1">
            <ProfileCard
              profileData={profileData}
              isEditing={isEditing}
              onImageChange={handleImageChange}
              previewImage={previewImage}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <UserIcon size={20} className="mr-2 text-indigo-600" />
                  About
                </h3>
                <EditableField
                  label="Bio"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleChange}
                  isEditing={isEditing}
                  rows={4}
                />
              </div>
            </div>

            {/* Skills Section */}
            <SkillsSection
              skills={profileData.skills}
              isEditing={isEditing}
              onAddSkill={handleAddSkill}
              onRemoveSkill={handleRemoveSkill}
            />

            {/* Personal Information */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <EditableField
                    label="Full Name"
                    name="name"
                    value={profileData.name}
                    onChange={handleChange}
                    isEditing={isEditing}
                  />
                  
                  <EditableField
                    label="Email Address"
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    isEditing={isEditing}
                    type="email"
                  />
                  
                  <EditableField
                    label="Phone Number"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleChange}
                    isEditing={isEditing}
                    type="tel"
                  />
                  
                  <EditableField
                    label="Role"
                    name="role"
                    value={profileData.role}
                    onChange={handleChange}
                    isEditing={false}
                    readOnly
                  />
                  
                  <div className="md:col-span-2">
                    <EditableField
                      label="Address"
                      name="address"
                      value={profileData.address}
                      onChange={handleChange}
                      isEditing={isEditing}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="text-center">
            <a 
              href="https://www.botivate.in/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-indigo-600 transition-colors text-sm font-medium"
            >
              Powered by Botivate
            </a>
            <p className="mt-2 text-gray-400 text-xs">© 2025 Professional Profile. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;