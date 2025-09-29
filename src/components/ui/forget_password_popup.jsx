import React, { useState } from 'react';
import { ArrowLeft, Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import supabase from '@/dataBase/connectdb';
import { useNavigate } from 'react-router-dom';
function Forget_password_popup({ isForgetPasswrod, setIsForgetPasswrod }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setError('Email address is required');
      return;
    }
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      const {  error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/forget-password`,
      });
      if (error) {
        setError(error.message);
        return;
      }
      navigate('/forget-password');
    } catch (e) {
      setError(e.message);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
    // Simulate API call
  };

  const handleBackToLogin = () => {
    // Reset form state when going back
    setEmail('');
    setError('');
    // In a real app, this would navigate to login page
    setIsForgetPasswrod(false);
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="absolute flex items-center justify-center transition-colors duration-200 top-4 right-4 hover:cursor-pointer ">
        <button onClick={() => setIsForgetPasswrod(false)}>
          <ArrowLeft size={24} />
        </button>
      </div>
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
          {/* Header Section */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 shadow-lg bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-blue-500/25">
              <Mail size={28} className="text-white" />
            </div>
            <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900">
              Forgot Your Password?
            </h1>
            <p className="leading-relaxed text-gray-600">
              No worries! Enter your email address and we'll send you a secure link to reset your
              password.
            </p>
          </div>
          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white ${
                    error
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={isLoading}
                  aria-describedby={error ? 'email-error' : undefined}
                />
              </div>
              {error && (
                <div id="email-error" className="flex items-center mt-2 text-sm text-red-600">
                  <AlertCircle size={16} className="flex-shrink-0 mr-2" />
                  {error}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 mr-3 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                  continue Forgetting...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Send size={18} className="mr-3" />
                  continue Forgetting
                </div>
              )}
            </button>
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
        </div>
      </div>
    </div>
  );
}

export default Forget_password_popup;
