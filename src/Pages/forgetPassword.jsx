import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Lock, Check, X, Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import supabase from '@/dataBase/connectdb';
function ForgetPassword() {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [canReset, setCanReset] = useState(false);
  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({
    newPassword: '',
    confirmPassword: '',
    general: '',
  });

  const navigate = useNavigate();

  // Ensure we have a valid recovery session before allowing password update
  useEffect(() => {
    let isMounted = true;
    // Check existing session (Supabase creates a recovery session when user clicks the email link)
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      if (data?.session) setCanReset(true);
    });

    // Also listen for auth state changes (e.g., when the hash is processed)
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        setCanReset(true);
      }
    });

    return () => {
      isMounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  // Password strength calculation
  const getPasswordStrength = (password) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
//       uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    score = Object.values(checks).filter(Boolean).length;

    if (score < 2) return { strength: 'weak', color: 'bg-red-500', width: '20%' };
    if (score < 4) return { strength: 'medium', color: 'bg-yellow-500', width: '60%' };
    return { strength: 'strong', color: 'bg-green-500', width: '100%' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  // console.log(passwordStrength, 'passwordStrength');

  const validateForm = () => {
    const newErrors = {
      newPassword: '',
      confirmPassword: '',
      general: '',
    };

    // console.log('validate form');

    // Validate new password
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== '');
  };

  const handleSubmit = async (e) => {
    // console.log('submit');
    e.preventDefault();

    if (!validateForm()) return;

    if (!canReset) {
      setErrors((prev) => ({ ...prev, general: 'Invalid or missing recovery session. Please use the password reset link sent to your email.' }));
      return;
    }

    setIsLoading(true);
    // setErrors({ newPassword: '', confirmPassword: '', general: '' });

    // Simulate API call
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });

      // console.log(data, 'data');
      // console.log(error, 'error');
      if (error) {
        setErrors((prev) => ({ ...prev, general: error.message }));
        return;
      }

      setIsSubmitted(true);
    } catch (error) {
      setIsLoading(false);
      setErrors((prev) => ({ ...prev, general: error.message }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleBackToLogin = () => {
    // Reset form state
    
    navigate('/auth');
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute rounded-full -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 blur-3xl"></div>
        <div className="absolute rounded-full -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 blur-3xl"></div>
        <div className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-600/10 blur-3xl"></div>

        {/* Floating Shapes */}
        <div className="absolute w-4 h-4 rounded-full top-20 left-20 bg-blue-400/30 animate-pulse"></div>
        <div className="absolute w-6 h-6 delay-1000 rounded-full top-40 right-32 bg-indigo-400/30 animate-pulse"></div>
        <div className="absolute w-3 h-3 rounded-full bottom-32 left-32 bg-purple-400/30 animate-pulse delay-2000"></div>
        <div className="absolute w-5 h-5 delay-500 rounded-full bottom-20 right-20 bg-pink-400/30 animate-pulse"></div>
      </div>

      {/* Main Card Container */}
      <div className="relative z-10 w-full max-w-md">
        <div className="p-8 border shadow-2xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-black/10 border-white/20 sm:p-10">
          {!isSubmitted ? (
            <>
              {/* Header Section */}
              <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-6 shadow-lg bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-blue-500/25">
                  <Shield size={28} className="text-white" />
                </div>
                <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900">
                  Reset Your Password
                </h1>
                <p className="leading-relaxed text-gray-600">
                  Create a new secure password for your account. Make sure it's strong and unique.
                </p>
              </div>

              {/* Form Section */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password Field */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block mb-2 text-sm font-semibold text-gray-700"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <Lock size={18} className="text-gray-400" />
                    </div>
                    <input
                      id="newPassword"
                      type={showPassword.new ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      placeholder="Enter your new password"
                      className={`w-full pl-12 pr-12 py-4 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white ${
                        errors.newPassword
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      disabled={isLoading}
                      aria-describedby={errors.newPassword ? 'newPassword-error' : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 transition-colors duration-200 hover:text-gray-600"
                      aria-label={showPassword.new ? 'Hide password' : 'Show password'}
                    >
                      {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {formData.newPassword && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">Password Strength</span>
                        <span
                          className={`text-xs font-semibold capitalize ${
                            passwordStrength.strength === 'weak'
                              ? 'text-red-600'
                              : passwordStrength.strength === 'medium'
                                ? 'text-yellow-600'
                                : 'text-green-600'
                          }`}
                        >
                          {passwordStrength.strength}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: passwordStrength.width }}
                        ></div>
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center text-xs text-gray-600">
                          {formData.newPassword.length >= 8 ? (
                            <Check size={12} className="mr-1 text-green-500" />
                          ) : (
                            <X size={12} className="mr-1 text-red-500" />
                          )}
                          At least 8 characters
                        </div>
                       
                        <div className="flex items-center text-xs text-gray-600">
                          {/\d/.test(formData.newPassword) ? (
                            <Check size={12} className="mr-1 text-green-500" />
                          ) : (
                            <X size={12} className="mr-1 text-red-500" />
                          )}
                          One number
                        </div>
                      </div>
                    </div>
                  )}

                  {errors.newPassword && (
                    <div
                      id="newPassword-error"
                      className="flex items-center mt-2 text-sm text-red-600"
                    >
                      <X size={16} className="flex-shrink-0 mr-2" />
                      {errors.newPassword}
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block mb-2 text-sm font-semibold text-gray-700"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <Lock size={18} className="text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showPassword.confirm ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Confirm your new password"
                      className={`w-full pl-12 pr-12 py-4 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white ${
                        errors.confirmPassword
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      disabled={isLoading}
                      aria-describedby={
                        errors.confirmPassword ? 'confirmPassword-error' : undefined
                      }
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 transition-colors duration-200 hover:text-gray-600"
                      aria-label={showPassword.confirm ? 'Hide password' : 'Show password'}
                    >
                      {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Password Match Indicator */}
                  {formData.confirmPassword && (
                    <div className="flex items-center mt-2 text-sm">
                      {formData.newPassword === formData.confirmPassword ? (
                        <>
                          <Check size={16} className="mr-2 text-green-500" />
                          <span className="text-green-600">Passwords match</span>
                        </>
                      ) : (
                        <>
                          <X size={16} className="mr-2 text-red-500" />
                          <span className="text-red-600">Passwords do not match</span>
                        </>
                      )}
                    </div>
                  )}

                  {errors.confirmPassword && (
                    <div
                      id="confirmPassword-error"
                      className="flex items-center mt-2 text-sm text-red-600"
                    >
                      <X size={16} className="flex-shrink-0 mr-2" />
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 mr-3 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                      Updating Password...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Shield size={18} className="mr-3" />
                      Update Password
                    </div>
                  )}
                </button>
                {errors.general && (
                  <div className="flex items-center mt-2 text-sm text-red-600">
                    <X size={16} className="flex-shrink-0 mr-2" />
                    {errors.general}
                  </div>
                )}
              </form>

              {/* Back to Login Link */}
              <div className="mt-8 text-center">
                <button
                  onClick={handleBackToLogin}
                  className="inline-flex items-center font-medium text-gray-600 transition-colors duration-200 hover:text-gray-900 group"
                >
                  <ArrowLeft
                    size={16}
                    className="mr-2 transition-transform duration-200 group-hover:-translate-x-1"
                  />
                  Back to Login
                </button>
              </div>
            </>
          ) : (
            /* Success State */
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-green-500/25">
                <Check size={28} className="text-white" />
              </div>
              <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900">
                Password Updated!
              </h1>
              <p className="mb-8 leading-relaxed text-gray-600">
                Your password has been successfully updated. You can now use your new password to
                sign in to your account.
              </p>

              <button
                onClick={handleBackToLogin}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Continue to Login
              </button>
            </div>
          )}
        </div>

        {/* Footer Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact our{' '}
            <a
              href="#"
              className="font-medium text-blue-600 transition-colors duration-200 hover:text-blue-700"
            >
              support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgetPassword;
