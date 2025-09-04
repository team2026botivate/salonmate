import { User as UserIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import supabase from '../../dataBase/connectdb'
import { validateImageFile } from '../../utils/imageutils'
import { useAuth } from '../../Context/AuthContext'
import {
  uploadProfileImage,
  deleteProfileImage,
} from '../../dataBase/dbOperations'
import ProfileHeader from './profileHeader'
import ProfileCard from './profileCard'
import SkillsSection from './skillSection'
import EditableField from './editableFiled'

const ProfilePage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: authUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [previewImage, setPreviewImage] = useState(null)


  

  const [profileData, setProfileData] = useState({  
    name: '',
    email: authUser?.email || '',
    phone: '',
    address: '',
    profileImage:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23f0f0f0'/%3E%3Ccircle cx='75' cy='60' r='30' fill='%23d1d1d1'/%3E%3Ccircle cx='75' cy='150' r='60' fill='%23d1d1d1'/%3E%3C/svg%3E",
    role: '',
    joinDate: '',
    bio: '',
    skills: [],
  })

  // If authUser name arrives later, sync it to local state when name is empty
  useEffect(() => {
    if (authUser?.user_metadata?.name) {
      setProfileData((prev) => (
        prev.name ? prev : { ...prev, name: authUser.user_metadata.name }
      ))
    }
  }, [authUser?.user_metadata?.name])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        setError('')

        // Use the authenticated user's ID or the route param ID
        const profileId = id || authUser?.id
        if (!profileId) {
          setError('No user ID found')
          return
        }

        const { data, error: dbError } = await supabase
          .from('profiles')
          .select(
            'id, full_name, email, phone_number, address, bio, skills, profile_image, role'
          )
          .eq('id', profileId)
          .single()

        if (dbError) throw dbError

        setProfileData((prev) => ({
          ...prev,
          name: data?.full_name || authUser?.user_metadata?.name || prev.name,
          email: data?.email || '',
          phone: data?.phone_number || '',
          address: data?.address || '',
          bio: data?.bio || '',
          skills: data?.skills
            ? Array.isArray(data.skills)
              ? data.skills
              : data.skills.split(',').map((s) => s.trim())
            : [],
          profileImage: data?.profile_image || prev.profileImage,
          role: data?.role || '',
          joinDate: data?.join_date || '',
        }))
      } catch (e) {
        console.error('Error fetching profile from DB:', e)
        setError('Failed to load profile data')
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [id, authUser?.id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    const imageUrl = URL.createObjectURL(file)
    setPreviewImage(imageUrl)

    // Store the file for upload during save
    setProfileData((prev) => ({
      ...prev,
      imageFile: file,
      profileImage: imageUrl, // Show preview
    }))
  }

  const handleAddSkill = (skill) => {
    setProfileData((prev) => ({
      ...prev,
      skills: [...prev.skills, skill],
    }))
  }

  const handleRemoveSkill = (skillToRemove) => {
    setProfileData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }))
  }



  const handleSave = async () => {
    const profileId = id || authUser?.id
    if (!profileId) return

    setIsLoading(true)
    setError('')
    try {
      // Build payload with only non-empty fields (optional fields)
      const payload = { id: profileId, updated_at: new Date().toISOString() }
      const addIfPresent = (key, value) => {
        if (
          value !== undefined &&
          value !== null &&
          String(value).trim() !== ''
        ) {
          payload[key] = value
        }
      }

      // Handle image upload if new image is selected
      let imageUrl = profileData.profileImage
      if (profileData.imageFile) {
        const uploadResult = await uploadProfileImage(
          profileData.imageFile,
          profileId
        )
        if (uploadResult.success) {
          imageUrl = uploadResult.url
        } else {
          throw new Error(`Image upload failed: ${uploadResult.error}`)
        }
      }

      addIfPresent('full_name', profileData.name)
      addIfPresent('email', profileData.email)
      addIfPresent('phone_number', profileData.phone)
      addIfPresent('address', profileData.address)
      addIfPresent('bio', profileData.bio)
      if (Array.isArray(profileData.skills) && profileData.skills.length) {
        payload.skills = profileData.skills.join(',')
      }
      if (imageUrl && !imageUrl.startsWith('data:image')) {
        payload.profile_image = imageUrl
      }
      addIfPresent('role', profileData.role)

      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })

      if (upsertError) throw upsertError

      // Re-fetch to sync UI with DB state
      const { data: fresh } = await supabase
        .from('profiles')
        .select(
          'id, full_name, email, phone_number, address, bio, skills, profile_image, role'
        )
        .eq('id', profileId)
        .single()

      if (fresh) {
        setProfileData((prev) => ({
          ...prev,
          name: fresh?.full_name || authUser?.user_metadata?.name || prev.name,
          email: fresh?.email || '',
          phone: fresh?.phone_number || '',
          address: fresh?.address || '',
          bio: fresh?.bio || '',
          skills: fresh?.skills
            ? Array.isArray(fresh.skills)
              ? fresh.skills
              : fresh.skills.split(',').map((s) => s.trim())
            : [],
          profileImage: fresh?.profile_image || prev.profileImage,
          role: fresh?.role || '',
          imageFile: null, // Clear file after successful save
        }))
      }

      alert('Profile updated successfully!')
      setIsEditing(false)
      setPreviewImage(null)
    } catch (e) {
      console.error('Error updating profile:', e)
      setError('Failed to update profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    const profileId = id || authUser?.id
    if (profileId) {
      ;(async () => {
        try {
          setIsLoading(true)
          const { data } = await supabase
            .from('profiles')
            .select(
              'id, full_name, email, phone_number, address, bio, skills, profile_image, role'
            )
            .eq('id', profileId)
            .single()
          setProfileData((prev) => ({
            ...prev,
            name: data?.full_name || authUser?.user_metadata?.name || prev.name,
            email: data?.email || '',
            phone: data?.phone_number || '',
            address: data?.address || '',
            bio: data?.bio || '',
            skills: data?.skills
              ? Array.isArray(data.skills)
                ? data.skills
                : data.skills.split(',').map((s) => s.trim())
              : [],
            profileImage: data?.profile_image || prev.profileImage,
            role: data?.role || '',
            joinDate: data?.join_date || '',
          }))
        } catch {
        } finally {
          setIsLoading(false)
        }
      })()
    }
    setPreviewImage(null)
    setIsEditing(false)
    setError('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileHeader
        onGoBack={() => navigate('/admin-dashboard')}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onSave={handleSave}
        onCancel={handleCancel}
        isLoading={isLoading}
        showStaffManagement={profileData.role === 'admin'}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
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
          <div className="space-y-6 lg:col-span-3">
            {/* About Section */}
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="p-6">
                <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
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
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="p-6">
                <h3 className="mb-6 text-lg font-semibold text-gray-900">
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                    maxLength={10}
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
        <div className="mt-16 border-t border-gray-200 pt-8">
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
  )
}

export default ProfilePage
