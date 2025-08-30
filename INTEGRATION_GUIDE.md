# License Management Integration Guide

## 🚀 Quick Setup

### 1. Run Supabase Schema
Execute the SQL in your Supabase dashboard:
```sql
-- Copy and paste the contents of sql/licenses_schema.sql
```

### 2. Wrap Your App
```jsx
// App.jsx
import { AuthProvider } from './Context/AuthContext'
import { LicenseProvider } from './Context/LicenseContext'
import LicenseGuard from './components/LicenseGuard'

function App() {
  return (
    <AuthProvider>
      <LicenseProvider>
        <LicenseGuard>
          {/* Your dashboard components */}
        </LicenseGuard>
      </LicenseProvider>
    </AuthProvider>
  )
}
```

### 3. Use License Hook
```jsx
// In any component
import { useLicense } from '@/hooks/useLicense'

function MyComponent() {
  const { 
    isActive, 
    isExpired, 
    daysRemaining, 
    formattedLicenseType 
  } = useLicense()
  
  return (
    <div>
      License: {formattedLicenseType} 
      ({daysRemaining} days remaining)
    </div>
  )
}
```

## 📊 Key Supabase Queries

### Insert Trial License (Auto-triggered on signup)
```sql
INSERT INTO public.licenses (
  user_id,
  license_type,
  status,
  start_date,
  end_date
) VALUES (
  $1, -- user_id
  'trial',
  'active',
  NOW(),
  NOW() + INTERVAL '7 days'
);
```

### Check License Status
```sql
SELECT 
  id,
  user_id,
  license_type,
  status,
  start_date,
  end_date,
  created_at,
  updated_at
FROM public.licenses 
WHERE user_id = $1;
```

### Renew License
```sql
UPDATE public.licenses 
SET 
  license_type = $2,    -- 'basic', 'premium', 'enterprise'
  status = 'active',
  start_date = NOW(),
  end_date = NOW() + INTERVAL '$3 months',
  updated_at = NOW()
WHERE user_id = $1
RETURNING *;
```

### Update Expired Licenses
```sql
UPDATE public.licenses 
SET status = 'expired'
WHERE end_date < NOW() 
AND status = 'active';
```

## 🔧 Component Usage Examples

### Dashboard Protection
```jsx
import LicenseGuard from './components/LicenseGuard'

function Dashboard() {
  return (
    <LicenseGuard>
      {/* Dashboard content - only accessible with active license */}
      <DashboardContent />
    </LicenseGuard>
  )
}
```

### License Status Display
```jsx
import LicenseStatus from './components/LicenseStatus'

function Sidebar() {
  return (
    <div>
      {/* Compact version for headers */}
      <LicenseStatus compact />
      
      {/* Full version for dedicated license page */}
      <LicenseStatus />
    </div>
  )
}
```

### Manual License Operations
```jsx
import { useLicense } from '@/hooks/useLicense'

function LicenseManager() {
  const { renewUserLicense, createTrial } = useLicense()
  
  const handleRenew = async () => {
    await renewUserLicense('premium', 12) // 12 months premium
  }
  
  const handleCreateTrial = async (userId) => {
    await createTrial(userId)
  }
  
  return (
    <div>
      <button onClick={handleRenew}>Renew License</button>
      <button onClick={() => handleCreateTrial(user.id)}>Create Trial</button>
    </div>
  )
}
```

## 🔐 Security Features

- **Row Level Security (RLS)** enabled
- Users can only access their own license data
- Automatic license expiry checking
- Secure license status validation

## 🎯 Workflow Summary

1. **User Signs Up** → Trial license auto-created (7 days)
2. **User Logs In** → License status checked
3. **Dashboard Access** → LicenseGuard validates access
4. **License Expires** → User blocked, renewal required
5. **License Renewed** → Full access restored

## 📱 UI States

- **Loading**: Skeleton loaders while checking license
- **Active**: Full dashboard access with status display
- **Expiring Soon**: Warning banners (≤10 days remaining)
- **Expired**: Blocked access with renewal options
- **Error**: Retry mechanisms for failed checks

## 🛠 Customization

### License Types
Edit in `utils/chekcLicence.js`:
```js
export const formatLicenseType = (licenseType) => {
  const types = {
    trial: 'Trial',
    basic: 'Basic',
    premium: 'Premium',
    enterprise: 'Enterprise',
    custom: 'Custom Plan' // Add your own
  }
  return types[licenseType] || licenseType
}
```

### Trial Duration
Modify in schema or utilities:
```sql
-- Change trial duration in schema
NOW() + INTERVAL '14 days'  -- 14 days instead of 7
```

### Warning Threshold
Adjust in `useLicense.js`:
```js
export const isLicenseExpiringSoon = (endDate) => {
  const daysRemaining = calculateDaysRemaining(endDate)
  return daysRemaining <= 5 && daysRemaining > 0  // 5 days instead of 10
}
```

## 🚨 Important Notes

- License checking happens automatically on login
- Expired licenses are updated via database function
- All components are production-ready with error handling
- Caching implemented for performance (5-minute cache)
- Real-time updates when license status changes
