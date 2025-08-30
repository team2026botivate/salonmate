# SalonMate License System Setup Guide

## Overview
This guide will help you set up the complete license management system for SalonMate with Supabase integration.

## Prerequisites
- Supabase project with database access
- Environment variables configured (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)

## Setup Steps

### 1. Database Setup
Run the SQL migration in your Supabase dashboard:

```sql
-- Execute the contents of sql/create_license_table.sql in your Supabase SQL editor
```

This will create:
- `license` table with proper schema
- RLS (Row Level Security) policies
- Auto-license creation trigger for new users
- License key generation function

### 2. Environment Variables
Ensure your `.env.local` file contains:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Integration in Your App

#### Wrap your app with providers:
```jsx
import { AuthProvider } from './Context/AuthContext'
import { LicenseProvider } from './Context/LicenseContext'

function App() {
  return (
    <AuthProvider>
      <LicenseProvider>
        {/* Your app content */}
      </LicenseProvider>
    </AuthProvider>
  )
}
```

#### Protect routes with license checking:
```jsx
import ProtectedRoute from './components/ProtectedRoute'

function Dashboard() {
  return (
    <ProtectedRoute>
      {/* Protected content */}
    </ProtectedRoute>
  )
}
```

## Features

### Automatic Trial Creation
- New users automatically get a 7-day trial license
- Trial starts immediately upon signup
- No payment required for trial period

### License Status Checking
- Real-time license validation
- Automatic redirect for expired licenses
- Warning notifications for expiring licenses

### License Management UI
- Complete license dashboard
- Renewal functionality
- License key display and management
- Status indicators and warnings

### Security
- Row Level Security (RLS) enabled
- Users can only access their own license data
- Secure license key generation
- Protected API endpoints

## Usage

### Check License Status
```jsx
import { useLicense } from '@/Context/LicenseContext'

function MyComponent() {
  const { isActive, isExpired, daysRemaining, planType } = useLicense()
  
  if (isExpired) {
    return <div>License expired</div>
  }
  
  return <div>License active: {daysRemaining} days remaining</div>
}
```

### Manual License Operations
```jsx
import { checkLicense, renewLicense } from '@/utils/chekcLicence'

// Check license
const status = await checkLicense(userId)

// Renew license
const renewed = await renewLicense(userId, 'premium', 12) // 12 months premium
```

## License Plans
- **Trial**: 7 days free trial for new users
- **Basic**: Monthly/yearly subscription
- **Premium**: Advanced features
- **Enterprise**: Custom enterprise solutions

## Troubleshooting

### Common Issues

1. **License not found error**
   - Ensure the user has signed up properly
   - Check if the trigger created the license automatically
   - Manually create trial license if needed

2. **RLS policy errors**
   - Verify user is authenticated
   - Check RLS policies are enabled
   - Ensure user ID matches license user_id

3. **Environment variables**
   - Verify VITE_ prefix for Vite projects
   - Restart development server after changes
   - Check Supabase project settings

### Manual License Creation
If automatic license creation fails:

```sql
INSERT INTO public.license (
  user_id,
  license_key,
  plan_type,
  is_active,
  trial_start,
  trial_end
) VALUES (
  'user-uuid-here',
  'SALON-XXXX-XXXX-XXXX-XXXX',
  'trial',
  true,
  NOW(),
  NOW() + INTERVAL '7 days'
);
```

## Support
For issues with the license system, check:
1. Browser console for JavaScript errors
2. Supabase dashboard for database errors
3. Network tab for API call failures
4. License management page for status details
