import supabase from '@/dataBase/connectdb'

// Check license status for a user
export const checkLicense = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('License check error:', error)
      return {
        active: false,
        reason: 'License not found',
        error: error.message,
      }
    }

    const now = new Date()
    let expiryDate

    // Use trial_end for expiry (or could be subscription_end in future)
    expiryDate = new Date(data.trial_end)

    // Check if license is expired
    const isExpired = now > expiryDate
    const daysRemaining = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24)
    )

    return {
      active: data.is_active && !isExpired,
      expired: isExpired,
      licenseType: data.plan,
      status: data.is_active ? 'active' : 'inactive',
      license: data,
      daysRemaining,
      expiryDate: expiryDate.toISOString(),
      startDate: data.trial_start,
      reason: isExpired ? `${data.plan} license expired` : null,
    }
  } catch (err) {
    console.error('License check failed:', err)
    return { active: false, reason: 'License check failed', error: err.message }
  }
}

// Get license data for a user
export const getLicenseData = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Get license data error:', error)
      return null
    }

    return data
  } catch (err) {
    console.error('Get license data failed:', err)
    return null
  }
}

// Create trial license for new user
export const createTrialLicense = async (userId) => {
  try {
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 7) // 7 days from now

    const { data, error } = await supabase
      .from('licenses')
      .insert({
        id: userId,
        plan: 'trial',
        trial_start: startDate.toISOString(),
        trial_end: endDate.toISOString(),
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Create trial license error:', error)
      return null
    }

    return data
  } catch (err) {
    console.error('Create trial license failed:', err)
    return null
  }
}

// Calculate days remaining until license expires
export const calculateDaysRemaining = (endDate) => {
  const now = new Date()
  const expiry = new Date(endDate)
  const timeDiff = expiry.getTime() - now.getTime()
  return Math.ceil(timeDiff / (1000 * 3600 * 24))
}

// Check if license is expiring soon (within 10 days)
export const isLicenseExpiringSoon = (endDate) => {
  const daysRemaining = calculateDaysRemaining(endDate)
  return daysRemaining <= 10 && daysRemaining > 0
}

// Format license type for display
export const formatLicenseType = (licenseType) => {
  const types = {
    trial: 'Trial',
    basic: 'Basic',
    premium: 'Premium',
    enterprise: 'Enterprise',
  }
  return types[licenseType] || licenseType
}

// Renew license (upgrade from trial to paid)
export const renewLicense = async (
  userId,
  licenseType = 'basic',
  months = 12
) => {
  try {
    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + months)

    const { data, error } = await supabase
      .from('licenses')
      .update({
        plan: licenseType,
        is_active: true,
        trial_start: startDate.toISOString(),
        trial_end: endDate.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Renew license error:', error)
      return null
    }

    return data
  } catch (err) {
    console.error('Renew license failed:', err)
    return null
  }
}

// Update expired licenses status
export const updateExpiredLicenses = async () => {
  try {
    const { error } = await supabase.rpc('update_expired_licenses')
    if (error) {
      console.error('Update expired licenses error:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('Update expired licenses failed:', err)
    return false
  }
}

// Legacy export for backward compatibility
export const checkLicence = checkLicense
