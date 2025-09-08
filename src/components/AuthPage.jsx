import { useAuth } from '@/Context/AuthContext'
import supabase from '@/dataBase/connectdb'
import { useCreateShopId } from '@/hook/dbOperation'
import { useAppData } from '@/zustand/appData'
// eslint-disable-next-line no-unused-vars
import {
  checkLicense,
  checkLicenseByStoreId,
  createTrialLicense,
} from '@/utils/chekcLicence'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Chrome,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  User,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Building,
  Phone,
  MapPin,
} from 'lucide-react'
import React, { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const AuthPage = () => {
  const { login, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const { setStoreId } = useAppData()

  const { createShopId, loading: shopLoading } = useCreateShopId()

  const [isSignIn, setIsSignIn] = useState(true)
  const [currentSignupStep, setCurrentSignupStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    // Sign in fields
    email: '',
    password: '',
    rememberMe: false,

    // Shop information (Step 1)
    shopName: '',
    shopEmail: '',
    mobileNumber: '',
    address: '',

    // Admin signup (Step 2)
    name: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
    role: 'admin',
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [shopCreationLoading, setShopCreationLoading] = useState(false)
  const [shopId, setShopId] = useState(null)
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false)

  const signupSteps = ['Shop Details', 'Admin Setup']
  const totalSignupSteps = signupSteps.length

  // Redirect if already authenticated
  React.useEffect(() => {
    const maybeRedirect = async () => {
      if (user && !authLoading) {
        try {
          // Prefer store-based license check if we can derive store_id from profile
          const storeId = user?.profile?.store_id
          const licenseStatus = storeId
            ? await checkLicenseByStoreId(storeId)
            : await checkLicense(user.id)
          if (licenseStatus?.active) {
            navigate('/admin-dashboard')
          }
          // If not active, stay on /auth
        } catch (e) {
          // On error, stay on /auth
          console.error('License check failed on auth redirect:', e)
        }
      }
    }
    maybeRedirect()
  }, [user, navigate, authLoading])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  // Validation functions
  const validateShopInformation = () => {
    const newErrors = {}

    if (!formData.shopName.trim()) {
      newErrors.shopName = 'Shop name is required'
    }

    if (formData.shopEmail && !/\S+@\S+\.\S+/.test(formData.shopEmail)) {
      newErrors.shopEmail = 'Shop email is invalid'
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required'
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Mobile number must be 10 digits'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateAdminSignup = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required'
    }

    if (!formData.adminEmail.trim()) {
      newErrors.adminEmail = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.adminEmail)) {
      newErrors.adminEmail = 'Email is invalid'
    }

    if (!formData.adminPassword) {
      newErrors.adminPassword = 'Password is required'
    } else if (formData.adminPassword.length < 6) {
      newErrors.adminPassword = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.adminPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateSignIn = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignupNext = async () => {
    let isValid = false

    if (currentSignupStep === 1) {
      isValid = validateShopInformation()
      if (isValid) {
        // Create shop ID before moving to next step
        setShopCreationLoading(true)
        try {
          const shopData = await createShopId(
            formData.shopName,
            formData.address,
            formData.mobileNumber
          )

          setShopId(shopData)
          setCurrentSignupStep(currentSignupStep + 1)
        } catch (error) {
          console.error('Shop creation error:', error)
          setErrors({ submit: 'Failed to create shop. Please try again.' })
        } finally {
          setShopCreationLoading(false)
        }
      }
    } else if (currentSignupStep === 2) {
      isValid = validateAdminSignup()
      if (isValid) {
        handleSignupSubmit()
      }
    }
  }

  const handleSignupBack = () => {
    if (currentSignupStep > 1) {
      setCurrentSignupStep(currentSignupStep - 1)
    }
  }

  const isCurrentStepValid = () => {
    if (!isSignIn) {
      if (currentSignupStep === 1) {
        return (
          formData.shopName.trim() &&
          formData.mobileNumber.trim() &&
          /^\d{10}$/.test(formData.mobileNumber) &&
          formData.address.trim() &&
          (!formData.shopEmail || /\S+@\S+\.\S+/.test(formData.shopEmail))
        )
      } else if (currentSignupStep === 2) {
        return (
          formData.name.trim() &&
          formData.adminEmail.trim() &&
          /\S+@\S+\.\S+/.test(formData.adminEmail) &&
          formData.adminPassword.length >= 6 &&
          formData.confirmPassword &&
          formData.adminPassword === formData.confirmPassword
        )
      }
    }
    return false
  }

  const handleSignupSubmit = async () => {
    if (!validateAdminSignup()) return

    setLoading(true)
    try {
      // Shop is already created, use the stored shopId

      // Signup flow
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.adminEmail,
        password: formData.adminPassword,
        options: {
          data: {
            shopId: shopId.id,
            name: formData.name,
            role: formData.role,
            shopName: formData.shopName,
            shopEmail: formData.shopEmail,
            mobileNumber: formData.mobileNumber,
            address: formData.address,
          },
        },
      })

      if (signUpError) {
        setErrors({ submit: signUpError.message })
        return
      }

      const user = data?.user
      if (user) {
        // Create or update profile in database with available fields
        const payload = {
          id: user.id,
          email: user.email,
          role: formData.role || 'admin',
          full_name: formData.name,
          phone_number: formData.mobileNumber,
          address: formData.address,
          store_id: shopId.id,
          salon_name: shopId.name,
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(payload, { onConflict: 'id' })

        if (profileError) {
          console.error('Profile upsert error:', profileError.message)
        }

        // Create shop record

        //todo here i have to check the shop id is already created or not

        // const shopPayload = {
        //   user_id: user.id,
        //   shop_name: formData.shopName,
        //   shop_email: formData.shopEmail,
        //   mobile_number: formData.mobileNumber,
        //   address: formData.address,
        // }

        // const { error: shopError } = await supabase
        //   .from('shops')
        //   .insert(shopPayload)

        // if (shopError) {
        //   console.error('Shop creation error:', shopError.message)
        // }

        // Create trial license for new user (7 days)

        try {
          // Pass the freshly created shop/store id explicitly to avoid FK violations
          const trialLicense = await createTrialLicense(user.id, shopId?.id)
          if (trialLicense) {
          } else {
            console.warn('Failed to create trial license')
          }
        } catch (licenseError) {
          console.error('Trial license creation error:', licenseError)
          // Don't block signup if license creation fails
        }

        // Clear errors
        setErrors({})
        setIsRegistrationComplete(true)

        // Show success toast
        toast.success(
          'Account created successfully! You have a 7-day trial. Please check your email to confirm your account.',
          {
            duration: 8000,
            position: 'top-center',
          }
        )
      }
    } catch (err) {
      console.error('Signup error:', err)
      setErrors({ submit: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    if (!validateSignIn()) return

    setLoading(true)
    try {
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        setErrors({ submit: error.message })
        return
      }

      if (data?.user) {
        // Store session in localStorage
        localStorage.setItem('supabase_session', JSON.stringify(data.session))

        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        // Ensure profile row exists and contains available fields
        if (!profile) {
          const payload = {
            id: data.user.id,
            email: data.user.email,
            role: 'staff',
          }
          // Optional/available fields from user metadata
          const meta = data.user.user_metadata || {}
          if (meta.name) payload.full_name = meta.name
          if (meta.phone_number) payload.phone_number = meta.phone_number
          if (meta.address) payload.address = meta.address
          if (meta.bio) payload.bio = meta.bio
          if (meta.skills)
            payload.skills = Array.isArray(meta.skills)
              ? meta.skills.join(',')
              : String(meta.skills)
          if (meta.profile_image) payload.profile_image = meta.profile_image

          await supabase.from('profiles').upsert(payload, { onConflict: 'id' })
        }

        // Re-fetch profile after potential upsert
        const { data: ensuredProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        // Check license status (prefer by store)
        const licenseStatus = ensuredProfile?.store_id
          ? await checkLicenseByStoreId(ensuredProfile.store_id)
          : await checkLicense(data.user.id)

        // If license is expired or inactive, inform user and keep on /auth
        if (!licenseStatus.active) {
          toast.error('Your license has expired. Please renew to continue.')
        }

        // Create user data for context
        const userData = {
          ...data.user,
          role: (ensuredProfile || profile)?.role || 'staff',
          profile: ensuredProfile || profile,
        }

        // Get user's store_id from profile and set in Zustand
        if (ensuredProfile?.store_id) {
          setStoreId(ensuredProfile.store_id)
        }

        // Use context login to store user data
        login(userData)

        // Clear errors
        setErrors({})
        // Navigate only if license active; otherwise remain on /auth
        if (licenseStatus.active) {
          navigate('/admin-dashboard')
        }
      }
    } catch (err) {
      console.error('Auth handler error:', err)
      setErrors({ submit: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const toggleForm = () => {
    setIsSignIn(!isSignIn)
    setCurrentSignupStep(1)
    setFormData({
      email: '',
      password: '',
      rememberMe: false,
      shopName: '',
      shopEmail: '',
      mobileNumber: '',
      address: '',
      name: '',
      adminEmail: '',
      adminPassword: '',
      confirmPassword: '',
      role: 'admin',
    })
    setErrors({})
    setIsRegistrationComplete(false)
  }

  const resetRegistration = () => {
    setIsRegistrationComplete(false)
    setCurrentSignupStep(1)
    setFormData({
      email: '',
      password: '',
      rememberMe: false,
      shopName: '',
      shopEmail: '',
      mobileNumber: '',
      address: '',
      name: '',
      adminEmail: '',
      adminPassword: '',
      confirmPassword: '',
      role: 'admin',
    })
    setErrors({})
  }

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
    tap: { scale: 0.98 },
  }

  const buttonVariants = {
    hover: {
      scale: 1.02,
      transition: { duration: 0.2, ease: 'easeOut' },
    },
    tap: { scale: 0.98 },
  }

  // Registration Complete Component
  if (isRegistrationComplete) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center justify-center flex-1 p-8 lg:p-12">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="p-8 text-center bg-white shadow-xl rounded-2xl">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                Registration Complete!
              </h2>
              <p className="mb-6 text-gray-600">
                Your shop has been successfully registered. You have a 7-day
                trial. Please check your email to confirm your account.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setIsSignIn(true)
                    resetRegistration()
                  }}
                  className="w-full px-6 py-3 font-medium text-white transition-colors duration-200 bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  Go to Sign In
                </button>
                <button
                  onClick={resetRegistration}
                  className="w-full px-6 py-3 font-medium text-gray-700 transition-colors duration-200 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Register Another Shop
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Panel - Image Section */}
        <motion.div
          className="relative flex-1 hidden bg-gradient-to-br from-indigo-900 to-purple-900 lg:flex"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div
            className="absolute inset-0 bg-center bg-no-repeat bg-cover"
            style={{
              backgroundImage: `url('https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 to-indigo-900/60" />
          <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <h2 className="mb-6 text-4xl font-bold">
                Welcome to SaloonMate!
              </h2>
              <p className="max-w-md text-xl leading-relaxed text-slate-200">
                Your shop is now ready. Sign in to start managing your business.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Left Panel - Form Section */}
      <div className="flex items-center justify-center flex-1 p-8 lg:p-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo/Brand */}
          <div className="mb-8 text-center">
            <motion.h1
              className="flex items-center justify-center gap-3 mb-2 text-3xl font-extrabold"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="text-transparent bg-gradient-to-r from-slate-800 to-indigo-700 bg-clip-text">
                SaloonMate
              </span>
              <img
                src="/3.png"
                alt="SaloonMate logo"
                className="rounded-md shadow-sm size-12 ring-1 ring-slate-200/60 dark:ring-white/10"
              />
            </motion.h1>
            <motion.p
              className="text-slate-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Admin Dashboard
            </motion.p>
          </div>

          {/* Step Indicator for Signup */}
          {!isSignIn && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                {signupSteps.map((step, index) => (
                  <div key={index} className="flex items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                        index + 1 === currentSignupStep
                          ? 'bg-indigo-600 text-white'
                          : index + 1 < currentSignupStep
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                      } `}
                    >
                      {index + 1 < currentSignupStep ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    {index < signupSteps.length - 1 && (
                      <div
                        className={`mx-2 h-0.5 w-20 ${index + 1 < currentSignupStep ? 'bg-green-500' : 'bg-gray-200'} `}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                {signupSteps.map((step, index) => (
                  <span
                    key={index}
                    className={` ${index + 1 === currentSignupStep ? 'font-medium text-indigo-600' : ''} `}
                  >
                    {step}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Form Toggle Header */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isSignIn ? 'signin' : `signup-${currentSignupStep}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mb-8 text-center"
            >
              <h2 className="mb-2 text-2xl font-semibold text-slate-800">
                {isSignIn
                  ? 'Welcome back!'
                  : currentSignupStep === 1
                    ? 'Shop Information'
                    : 'Admin Account Setup'}
              </h2>
              <p className="text-slate-600">
                {isSignIn
                  ? 'Enter your credentials to access your dashboard'
                  : currentSignupStep === 1
                    ? 'Tell us about your shop to get started'
                    : 'Create your admin credentials to manage your shop'}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Sign In Form */}
          {isSignIn && (
            <form onSubmit={handleSignIn} className="space-y-6">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-slate-700"
                >
                  Email Address
                </label>
                <motion.div
                  className="relative"
                  variants={inputVariants}
                  whileFocus="focus"
                  whileTap="tap"
                >
                  <Mail className="absolute w-5 h-5 transform -translate-y-1/2 top-1/2 left-3 text-slate-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border py-3 pr-4 pl-11 transition-all focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
                      errors.email ? 'border-red-300' : 'border-slate-300'
                    }`}
                    placeholder="Enter your email"
                  />
                </motion.div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <motion.div
                  className="relative"
                  variants={inputVariants}
                  whileFocus="focus"
                  whileTap="tap"
                >
                  <Lock className="absolute w-5 h-5 transform -translate-y-1/2 top-1/2 left-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border py-3 pr-11 pl-11 transition-all focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
                      errors.password ? 'border-red-300' : 'border-slate-300'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute transition-colors transform -translate-y-1/2 top-1/2 right-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </motion.div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              {/*todo: after some time i have to fix it */}
              {/* <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe || false}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-slate-700">
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  className="text-sm text-indigo-600 transition-colors hover:text-indigo-500"
                >
                  Forgot password?
                </button>
              </div> */}

              {/* Submit Error */}
              {errors.submit && (
                <div className="text-center">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                disabled={loading}
                className={`flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-3 font-medium text-white transition-colors hover:bg-slate-700 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:outline-none ${loading ? 'cursor-not-allowed opacity-70' : ''} [background-color:#000000]`}
              >
                {loading && (
                  <span className="w-5 h-5 border-2 border-white rounded-full animate-spin border-t-transparent" />
                )}
                <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              </motion.button>

              {/* Google Sign In */}
              {/* <motion.button
                type="button"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="flex items-center justify-center w-full px-4 py-3 font-medium transition-colors bg-white border rounded-lg border-slate-300 text-slate-700 hover:bg-gray-50 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:outline-none"
              >
                <Chrome className="w-5 h-5 mr-2" />
                Sign in with Google
              </motion.button> */}
            </form>
          )}

          {/* Multi-Step Signup Form */}
          {!isSignIn && (
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {/* Step 1: Shop Information */}
                {currentSignupStep === 1 && (
                  <motion.div
                    key="shop-info"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-4"
                  >
                    {/* Shop Name */}
                    <div>
                      <label
                        htmlFor="shopName"
                        className="block mb-2 text-sm font-medium text-slate-700"
                      >
                        Shop Name <span className="text-red-500">*</span>
                      </label>
                      <motion.div
                        className="relative"
                        variants={inputVariants}
                        whileFocus="focus"
                        whileTap="tap"
                      >
                        <Building className="absolute w-5 h-5 transform -translate-y-1/2 top-1/2 left-3 text-slate-400" />
                        <input
                          type="text"
                          id="shopName"
                          name="shopName"
                          value={formData.shopName}
                          onChange={handleInputChange}
                          className={`w-full rounded-lg border py-3 pr-4 pl-11 transition-all focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
                            errors.shopName
                              ? 'border-red-300'
                              : 'border-slate-300'
                          }`}
                          placeholder="Enter your shop name"
                        />
                      </motion.div>
                      {errors.shopEmail && (
                        <p className="mt-1 text-sm text-red-600 animate-pulse">
                          {errors.shopEmail}
                        </p>
                      )}
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label
                        htmlFor="mobileNumber"
                        className="block mb-2 text-sm font-medium text-slate-700"
                      >
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <motion.div
                        className="relative"
                        variants={inputVariants}
                        whileFocus="focus"
                        whileTap="tap"
                      >
                        <Phone className="absolute w-5 h-5 transform -translate-y-1/2 top-1/2 left-3 text-slate-400" />
                        <input
                          type="tel"
                          id="mobileNumber"
                          name="mobileNumber"
                          value={formData.mobileNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '')
                            if (value.length <= 10) {
                              setFormData((prev) => ({
                                ...prev,
                                mobileNumber: value,
                              }))
                            }
                          }}
                          className={`w-full rounded-lg border py-3 pr-4 pl-11 transition-all focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
                            errors.mobileNumber
                              ? 'border-red-300'
                              : 'border-slate-300'
                          }`}
                          placeholder="1234567890"
                          maxLength={10}
                        />
                      </motion.div>
                      {errors.mobileNumber && (
                        <p className="mt-1 text-sm text-red-600 animate-pulse">
                          {errors.mobileNumber}
                        </p>
                      )}
                    </div>

                    {/* Address */}
                    <div>
                      <label
                        htmlFor="address"
                        className="block mb-2 text-sm font-medium text-slate-700"
                      >
                        Address <span className="text-red-500">*</span>
                      </label>
                      <motion.div
                        className="relative"
                        variants={inputVariants}
                        whileFocus="focus"
                        whileTap="tap"
                      >
                        <MapPin className="absolute w-5 h-5 top-3 left-3 text-slate-400" />
                        <textarea
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows={4}
                          className={`w-full resize-none rounded-lg border py-3 pr-4 pl-11 transition-all focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
                            errors.address
                              ? 'border-red-300'
                              : 'border-slate-300'
                          }`}
                          placeholder="Enter your shop address..."
                        />
                      </motion.div>
                      {errors.address && (
                        <p className="mt-1 text-sm text-red-600 animate-pulse">
                          {errors.address}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Admin Signup */}
                {currentSignupStep === 2 && (
                  <motion.div
                    key="admin-signup"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-4"
                  >
                    {/* Full Name */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block mb-2 text-sm font-medium text-slate-700"
                      >
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <motion.div
                        className="relative"
                        variants={inputVariants}
                        whileFocus="focus"
                        whileTap="tap"
                      >
                        <User className="absolute w-5 h-5 transform -translate-y-1/2 top-1/2 left-3 text-slate-400" />
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={`w-full rounded-lg border py-3 pr-4 pl-11 transition-all focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
                            errors.name ? 'border-red-300' : 'border-slate-300'
                          }`}
                          placeholder="Enter your full name"
                        />
                      </motion.div>
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600 animate-pulse">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Admin Email */}
                    <div>
                      <label
                        htmlFor="adminEmail"
                        className="block mb-2 text-sm font-medium text-slate-700"
                      >
                        Email ID <span className="text-red-500">*</span>
                      </label>
                      <motion.div
                        className="relative"
                        variants={inputVariants}
                        whileFocus="focus"
                        whileTap="tap"
                      >
                        <Mail className="absolute w-5 h-5 transform -translate-y-1/2 top-1/2 left-3 text-slate-400" />
                        <input
                          type="email"
                          id="adminEmail"
                          name="adminEmail"
                          value={formData.adminEmail}
                          onChange={handleInputChange}
                          className={`w-full rounded-lg border py-3 pr-4 pl-11 transition-all focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
                            errors.adminEmail
                              ? 'border-red-300'
                              : 'border-slate-300'
                          }`}
                          placeholder="admin@example.com"
                        />
                      </motion.div>
                      {errors.adminEmail && (
                        <p className="mt-1 text-sm text-red-600 animate-pulse">
                          {errors.adminEmail}
                        </p>
                      )}
                    </div>

                    {/* Admin Password */}
                    <div>
                      <label
                        htmlFor="adminPassword"
                        className="block mb-2 text-sm font-medium text-slate-700"
                      >
                        Password <span className="text-red-500">*</span>
                      </label>
                      <motion.div
                        className="relative"
                        variants={inputVariants}
                        whileFocus="focus"
                        whileTap="tap"
                      >
                        <Lock className="absolute w-5 h-5 transform -translate-y-1/2 top-1/2 left-3 text-slate-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="adminPassword"
                          name="adminPassword"
                          value={formData.adminPassword}
                          onChange={handleInputChange}
                          className={`w-full rounded-lg border py-3 pr-11 pl-11 transition-all focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
                            errors.adminPassword
                              ? 'border-red-300'
                              : 'border-slate-300'
                          }`}
                          placeholder="Enter password (min 6 characters)"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute transition-colors transform -translate-y-1/2 top-1/2 right-3 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </motion.div>
                      {errors.adminPassword && (
                        <p className="mt-1 text-sm text-red-600 animate-pulse">
                          {errors.adminPassword}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block mb-2 text-sm font-medium text-slate-700"
                      >
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <motion.div
                        className="relative"
                        variants={inputVariants}
                        whileFocus="focus"
                        whileTap="tap"
                      >
                        <Lock className="absolute w-5 h-5 transform -translate-y-1/2 top-1/2 left-3 text-slate-400" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`w-full rounded-lg border py-3 pr-11 pl-11 transition-all focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
                            errors.confirmPassword
                              ? 'border-red-300'
                              : 'border-slate-300'
                          }`}
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute transition-colors transform -translate-y-1/2 top-1/2 right-3 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </motion.div>
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600 animate-pulse">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Error */}
              {errors.submit && (
                <div className="text-center">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <motion.button
                  type="button"
                  onClick={handleSignupBack}
                  disabled={currentSignupStep === 1}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className={`flex items-center rounded-lg px-6 py-3 font-medium transition-all duration-200 ${
                    currentSignupStep === 1
                      ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Back
                </motion.button>

                <motion.button
                  type="button"
                  onClick={handleSignupNext}
                  disabled={
                    !isCurrentStepValid() || loading || shopCreationLoading
                  }
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className={`flex items-center rounded-lg px-8 py-3 font-medium transition-all duration-200 ${
                    isCurrentStepValid() && !loading && !shopCreationLoading
                      ? 'transform bg-indigo-600 text-white hover:scale-105 hover:bg-indigo-700 hover:shadow-lg'
                      : 'cursor-not-allowed bg-gray-300 text-gray-500'
                  }`}
                >
                  {(loading || shopCreationLoading) && (
                    <span className="w-5 h-5 mr-2 border-2 border-white rounded-full animate-spin border-t-transparent" />
                  )}
                  <span>
                    {shopCreationLoading
                      ? 'Creating Shop...'
                      : loading
                        ? 'Creating account...'
                        : currentSignupStep === totalSignupSteps
                          ? 'Complete Registration'
                          : 'Next'}
                  </span>
                  {!loading && !shopCreationLoading && (
                    <ChevronRight className="w-5 h-5 ml-2" />
                  )}
                </motion.button>
              </div>
            </div>
          )}

          {/* Toggle Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-600">
              {isSignIn
                ? "Don't have an account? "
                : 'Already have an account? '}
              <button
                type="button"
                onClick={toggleForm}
                className="font-medium text-indigo-600 transition-colors hover:text-indigo-500"
              >
                {isSignIn ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Image Section */}
      <motion.div
        className="relative flex-1 hidden bg-gradient-to-br from-indigo-900 to-purple-900 lg:flex"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-center bg-no-repeat bg-cover"
          style={{
            backgroundImage: `url('https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')`,
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 to-indigo-900/60" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h2 className="mb-6 text-4xl font-bold">
              Transform Your Salon Business
            </h2>
            <p className="max-w-md text-xl leading-relaxed text-slate-200">
              {isSignIn
                ? 'Streamline appointments, manage staff, and grow your business with our comprehensive admin dashboard.'
                : currentSignupStep === 1
                  ? 'Tell us about your shop and get started with your 7-day free trial.'
                  : 'Create your admin account to manage your salon business effectively.'}
            </p>
          </motion.div>

          {/* Decorative Elements */}
          <motion.div
            className="absolute w-20 h-20 border rounded-full top-8 right-8 border-white/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute w-12 h-12 border rounded-full bottom-8 left-8 border-white/20"
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </motion.div>

      {/* React Hot Toast */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // Define default options
          className: '',
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          // Default options for specific types
          success: {
            duration: 6000,
            theme: {
              primary: 'green',
              secondary: 'black',
            },
          },
        }}
      />
    </div>
  )
}

export default AuthPage
