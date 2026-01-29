import { User as UserIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '../../dataBase/connectdb';
import { validateImageFile } from '../../utils/imageutils';
import { useAuth } from '../../Context/AuthContext';
import { uploadProfileImage, deleteProfileImage } from '../../dataBase/dbOperations';
import ProfileHeader from './profileHeader';
import ProfileCard from './profileCard';
import SkillsSection from './skillSection';
import EditableField from './editableFiled';
import StaffPermissions from './givePermition.profile';

const DEFAULT_PROFILE_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23f0f0f0'/%3E%3Ccircle cx='75' cy='60' r='30' fill='%23d1d1d1'/%3E%3Ccircle cx='75' cy='150' r='60' fill='%23d1d1d1'/%3E%3C/svg%3E";

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  const [profileData, setProfileData] = useState({
    name: '',
    email: authUser?.email || '',
    phone: '',
    address: '',
    profile_image: DEFAULT_PROFILE_IMAGE,
    role: '',
    joinDate: '',
    bio: '',
    skills: [],
  });

  const [staffGivePermission, setStaffGivePermission] = useState(false);

  const getSafeProfileImage = (imageUrl) => {
    if (!imageUrl || imageUrl === 'null' || imageUrl === 'undefined' || imageUrl === null) {
      return DEFAULT_PROFILE_IMAGE;
    }
    return imageUrl;
  };

  useEffect(() => {
    if (authUser?.user_metadata?.name) {
      setProfileData((prev) => (prev.name ? prev : { ...prev, name: authUser.user_metadata.name }));
    }
  }, [authUser?.user_metadata?.name]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError('');

        const profileId = id || authUser?.id;
        if (!profileId) {
          setError('No user ID found');
          setIsLoading(false);
          return;
        }

        const { data, error: dbError } = await supabase
          .from('profiles')
          .select('id, full_name, email, phone_number, address, bio, skills, profile_image, role, join_date')
          .eq('id', profileId)
          .single();

        if (dbError) {
          if (dbError.code === 'PGRST116') {
            console.log('Profile not found');
            setIsLoading(false);
            return;
          }
          throw dbError;
        }

        const safeProfileImage = getSafeProfileImage(data?.profile_image);

        setProfileData({
          name: data?.full_name || authUser?.user_metadata?.name || '',
          email: data?.email || '',
          phone: data?.phone_number || '',
          address: data?.address || '',
          bio: data?.bio || '',
          skills: data?.skills
            ? Array.isArray(data.skills)
              ? data.skills
              : data.skills.split(',').map((s) => s.trim()).filter(s => s)
            : [],
          profile_image: safeProfileImage,
          role: data?.role || '',
          joinDate: data?.join_date || '',
        });
      } catch (e) {
        console.error('Error fetching profile from DB:', e);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [id, authUser?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setPreviewImage(imageUrl);

    setProfileData((prev) => ({
      ...prev,
      imageFile: file,
      profile_image: imageUrl,
    }));
  };

  const handleAddSkill = (skill) => {
    if (!skill.trim()) return;
    setProfileData((prev) => ({
      ...prev,
      skills: [...prev.skills.filter(s => s !== skill.trim()), skill.trim()], // Avoid duplicates
    }));
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfileData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleSave = async () => {
    const profileId = id || authUser?.id;
    if (!profileId) return;

    setIsLoading(true);
    setError('');
    try {
      const payload = { id: profileId, updated_at: new Date().toISOString() };
      const addIfPresent = (key, value) => {
        if (value !== undefined && value !== null && String(value).trim() !== '') {
          payload[key] = value;
        }
      };

      let imageUrl = profileData.profile_image;

      if (profileData.imageFile) {
        const uploadResult = await uploadProfileImage(profileData.imageFile, profileId);
        if (uploadResult.success) {
          imageUrl = uploadResult.url;
        } else {
          throw new Error(`Image upload failed: ${uploadResult.error}`);
        }
      }

      addIfPresent('full_name', profileData.name);
      addIfPresent('email', profileData.email);
      addIfPresent('phone_number', profileData.phone);
      addIfPresent('address', profileData.address);
      addIfPresent('bio', profileData.bio);
      if (Array.isArray(profileData.skills) && profileData.skills.length) {
        payload.skills = profileData.skills.join(',');
      }
      if (imageUrl && !imageUrl.startsWith('data:image')) {
        payload.profile_image = imageUrl;
      }
      addIfPresent('role', profileData.role);

      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' });

      if (upsertError) {
        if (upsertError.code === '23505') {
          throw new Error('Duplicate entry. This profile already exists.');
        }
        throw upsertError;
      }

      const { data: fresh } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone_number, address, bio, skills, profile_image, role')
        .eq('id', profileId)
        .single();

      if (fresh) {
        const safeProfileImage = getSafeProfileImage(fresh?.profile_image);
        
        setProfileData({
          name: fresh?.full_name || authUser?.user_metadata?.name || '',
          email: fresh?.email || '',
          phone: fresh?.phone_number || '',
          address: fresh?.address || '',
          bio: fresh?.bio || '',
          skills: fresh?.skills
            ? Array.isArray(fresh.skills)
              ? fresh.skills
              : fresh.skills.split(',').map((s) => s.trim()).filter(s => s)
            : [],
          profile_image: safeProfileImage,
          role: fresh?.role || '',
          joinDate: fresh?.join_date || profileData.joinDate,
        });
      }

      alert('Profile updated successfully!');
      setIsEditing(false);
      setPreviewImage(null);
    } catch (e) {
      console.error('Error updating profile:', e);
      setError('Failed to update profile. Please try again. ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    const profileId = id || authUser?.id;
    if (profileId) {
      (async () => {
        try {
          setIsLoading(true);
          const { data } = await supabase
            .from('profiles')
            .select('id, full_name, email, phone_number, address, bio, skills, profile_image, role, join_date')
            .eq('id', profileId)
            .single();
          
          if (data) {
            const safeProfileImage = getSafeProfileImage(data?.profile_image);
            
            setProfileData({
              name: data?.full_name || authUser?.user_metadata?.name || '',
              email: data?.email || '',
              phone: data?.phone_number || '',
              address: data?.address || '',
              bio: data?.bio || '',
              skills: data?.skills
                ? Array.isArray(data.skills)
                  ? data.skills
                  : data.skills.split(',').map((s) => s.trim()).filter(s => s)
                : [],
              profile_image: safeProfileImage,
              role: data?.role || '',
              joinDate: data?.join_date || '',
            });
          }
        } catch (error) {
          console.error('Error fetching profile on cancel:', error);
        } finally {
          setIsLoading(false);
        }
      })();
    }
    setPreviewImage(null);
    setIsEditing(false);
    setError('');
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50">
      <ProfileHeader
        onGoBack={() => navigate('/admin-dashboard')}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onSave={handleSave}
        onCancel={handleCancel}
        isLoading={isLoading}
        showStaffManagement={profileData.role === 'admin'}
        staffGivePermission={staffGivePermission}
        setStaffGivePermission={setStaffGivePermission}
      />
      {staffGivePermission && (
        <StaffPermissions
          setStaffGivePermission={setStaffGivePermission}
        />
      )}

      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {error && (
          <div className="px-4 py-3 mb-6 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <ProfileCard
              profileData={profileData}
              isEditing={isEditing}
              onImageChange={handleImageChange}
              previewImage={previewImage}
            />
          </div>

          <div className="space-y-6 lg:col-span-3">
            <div className="bg-white border border-gray-200 rounded-xl">
              <div className="p-6">
                <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                  <UserIcon size={20} className="mr-2 text-indigo-600" />
                  About
                </h3>
                <EditableField
                  label="Bio"
                  name="bio"
                  value={profileData.bio || ''}
                  onChange={handleChange}
                  isEditing={isEditing}
                  rows={4}
                />
              </div>
            </div>

            <SkillsSection
              skills={profileData.skills || []}
              isEditing={isEditing}
              onAddSkill={handleAddSkill}
              onRemoveSkill={handleRemoveSkill}
            />

            <div className="bg-white border border-gray-200 rounded-xl">
              <div className="p-6">
                <h3 className="mb-6 text-lg font-semibold text-gray-900">Personal Information</h3>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <EditableField
                    label="Full Name"
                    name="name"
                    value={profileData.name || ''}
                    onChange={handleChange}
                    isEditing={isEditing}
                  />

                  <EditableField
                    label="Email Address"
                    name="email"
                    value={profileData.email || ''}
                    onChange={handleChange}
                    isEditing={isEditing}
                    type="email"
                  />

                  <EditableField
                    label="Phone Number"
                    name="phone"
                    value={profileData.phone || ''}
                    onChange={handleChange}
                    maxLength={10}
                    isEditing={isEditing}
                    type="tel"
                  />

                  <EditableField
                    label="Role"
                    name="role"
                    value={profileData.role || ''}
                    onChange={handleChange}
                    isEditing={false}
                    readOnly
                  />

                  <div className="md:col-span-2">
                    <EditableField
                      label="Address"
                      name="address"
                      value={profileData.address || ''}
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

        <div className="pt-8 mt-16 border-t border-gray-200">
          <div className="text-center">
            <a
              href="https://www.botivate.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-gray-500 transition-colors hover:text-indigo-600"
            >
              Powered by Botivate
            </a>
            <p className="mt-2 text-xs text-gray-400">
              © 2025 Professional Profile. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;