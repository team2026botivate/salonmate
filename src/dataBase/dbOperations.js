import supabase from './connectdb'

/**
 * Upload image to Supabase storage bucket and return public URL
 * @param {File} file - Image file to upload
 * @param {string} userId - User ID for file naming
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export const uploadProfileImage = async (file, userId) => {
  
  try {
    // Ensure user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `profile_${userId}_${Date.now()}.${fileExt}`
    const filePath = `profiles/${fileName}`

    // Upload file to salonmate bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('salonmate')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      })


    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { success: false, error: uploadError.message }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('salonmate')
      .getPublicUrl(filePath)

    if (!urlData?.publicUrl) {
      return { success: false, error: 'Failed to get public URL' }
    }

    return { success: true, url: urlData.publicUrl }
  } catch (error) {
    console.error('Image upload error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Delete image from Supabase storage bucket
 * @param {string} imageUrl - Full URL of the image to delete
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteProfileImage = async (imageUrl) => {
  try {
    // Extract file path from URL
    const urlParts = imageUrl.split('/storage/v1/object/public/salonmate/')
    if (urlParts.length < 2) {
      return { success: false, error: 'Invalid image URL format' }
    }

    const filePath = urlParts[1]

    const { error } = await supabase.storage
      .from('salonmate')
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Image delete error:', error)
    return { success: false, error: error.message }
  }
}
