import React from 'react'
import ProfilePage from './components/ProfilePage'

// Mock data for demonstration
const mockUser = {
  email: 'john.doe@example.com',
  name: 'John Doe',
  role: 'admin',
}

function ProfilePage() {
  const handleGoBack = () => {
    console.log('Navigate back to dashboard')
  }

  const handleStaffManagement = () => {
    console.log('Navigate to staff management')
  }

  const handleUpdateProfile = (profileData) => {
    console.log('Profile updated:', profileData)
  }

  return (
    <ProfilePage
      user={mockUser}
      onGoBack={handleGoBack}
      onStaffManagement={handleStaffManagement}
      updateUserProfile={handleUpdateProfile}
    />
  )
}

export default ProfilePage
