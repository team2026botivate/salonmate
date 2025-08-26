import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, User, Mail, Lock, Chrome, Shield } from 'lucide-react'
import supabase from '@/dataBase/connectdb'

const AuthPage = () => {
  const [isSignIn, setIsSignIn] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: false,
    role: 'admin',
  })

  const [errors, setErrors] = useState({})

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

  const validateForm = () => {
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

    if (!isSignIn) {
      if (!formData.role) {
        newErrors.role = 'Please select a role'
      }
      if (!formData.name) {
        newErrors.name = 'Name is required'
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      if (isSignIn) {
        // Login flow
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (error) return

        const user = data?.user
        if (user) {
          // Ensure profile exists for logged-in user
          const { data: existingProfile, error: profileFetchError } =
            await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .maybeSingle()

          if (profileFetchError) {
            console.error('Profile fetch error:', profileFetchError.message)
          }

          if (!existingProfile) {
            const { error: profileCreateError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: user.id,
                  role: formData.role || 'staff',
                },
              ])
            if (profileCreateError) {
              console.error(
                'Profile create (login) error:',
                profileCreateError.message
              )
            } else {
              console.log('Profile ensured on login')
            }
          }
        }
      } else {
        // Signup flow
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
              role: formData.role,
            },
          },
        })

        if (signUpError) {
          console.error('Signup error:', signUpError.message)
          return
        }

        const user = data?.user
        if (!user) return

        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: user.id,
            role: formData.role || 'staff',
          },
        ])

        if (profileError) {
          console.error('Profile insert error:', profileError.message)
        } else {
          console.log('Profile created successfully')
        }
      }
    } catch (err) {
      console.error('Auth handler error:', err)
    }
  }

  const toggleForm = () => {
    setIsSignIn(!isSignIn)
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      rememberMe: false,
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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Left Panel - Form Section */}
      <div className="flex flex-1 items-center justify-center p-8 lg:p-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo/Brand */}
          <div className="mb-8 text-center">
            <motion.h1
              className="mb-2 text-3xl font-bold text-slate-800"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Salon Mate
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

          {/* Form Toggle Header */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isSignIn ? 'signin' : 'signup'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mb-8 text-center"
            >
              <h2 className="mb-2 text-2xl font-semibold text-slate-800">
                {isSignIn ? 'Welcome back!' : 'Create your account'}
              </h2>
              <p className="text-slate-600">
                {isSignIn
                  ? 'Enter your credentials to access your dashboard'
                  : 'Fill in your details to get started'}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={isSignIn ? 'signin-form' : 'signup-form'}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Name Field (Sign Up only) */}
                {!isSignIn && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Full Name
                    </label>
                    <motion.div
                      className="relative"
                      variants={inputVariants}
                      whileFocus="focus"
                      whileTap="tap"
                    >
                      <User className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-slate-400" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        className={`w-full rounded-lg border py-3 pr-4 pl-11 transition-all focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
                          errors.name ? 'border-red-300' : 'border-slate-300'
                        }`}
                        placeholder="Enter your full name"
                      />
                    </motion.div>
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </motion.div>
                )}

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Email Address
                  </label>
                  <motion.div
                    className="relative"
                    variants={inputVariants}
                    whileFocus="focus"
                    whileTap="tap"
                  >
                    <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-slate-400" />
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

                {/* Role Selection Field (Sign Up only) */}
                {!isSignIn && (
                  <div>
                    <label
                      htmlFor="role"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Role
                    </label>
                    <motion.div
                      className="relative"
                      variants={inputVariants}
                      whileFocus="focus"
                      whileTap="tap"
                    >
                      <Shield className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-slate-400" />
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className={`w-full appearance-none rounded-lg border bg-white py-3 pr-4 pl-11 transition-all focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
                          errors.role ? 'border-red-300' : 'border-slate-300'
                        }`}
                      >
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                      </select>
                      {/* Custom dropdown arrow */}
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg
                          className="h-5 w-5 text-slate-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </motion.div>
                    {errors.role && (
                      <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                    )}
                  </div>
                )}

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>
                  <motion.div
                    className="relative"
                    variants={inputVariants}
                    whileFocus="focus"
                    whileTap="tap"
                  >
                    <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-slate-400" />
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
                      className="absolute top-1/2 right-3 -translate-y-1/2 transform text-slate-400 transition-colors hover:text-slate-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </motion.div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field (Sign Up only) */}
                {!isSignIn && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Confirm Password
                    </label>
                    <motion.div
                      className="relative"
                      variants={inputVariants}
                      whileFocus="focus"
                      whileTap="tap"
                    >
                      <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-slate-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword || ''}
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
                        className="absolute top-1/2 right-3 -translate-y-1/2 transform text-slate-400 transition-colors hover:text-slate-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </motion.div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </motion.div>
                )}

                {/* Remember Me & Forgot Password (Sign In only) */}
                {isSignIn && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="flex items-center justify-between"
                  >
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe || false}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
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
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="w-full rounded-lg bg-slate-800 px-4 py-3 font-medium text-white transition-colors hover:bg-slate-700 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:outline-none"
            >
              {isSignIn ? 'Sign In' : 'Create Account'}
            </motion.button>

            {/* Google Sign In (Sign In only) */}
            {isSignIn && (
              <motion.button
                type="button"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:outline-none"
              >
                <Chrome className="mr-2 h-5 w-5" />
                Sign in with Google
              </motion.button>
            )}

            {/* Toggle Link */}
            <div className="text-center">
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
          </form>
        </motion.div>
      </div>

      {/* Right Panel - Image Section */}
      <motion.div
        className="relative hidden flex-1 bg-gradient-to-br from-indigo-900 to-purple-900 lg:flex"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
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
              Streamline appointments, manage staff, and grow your business with
              our comprehensive admin dashboard.
            </p>
          </motion.div>

          {/* Decorative Elements */}
          <motion.div
            className="absolute top-8 right-8 h-20 w-20 rounded-full border border-white/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute bottom-8 left-8 h-12 w-12 rounded-full border border-white/20"
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </motion.div>
    </div>
  )
}

export default AuthPage
