import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Calendar,
  Clock,
  Key,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';


// Toast Notification Component
const Toast = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const getToastStyles = (type) => {
    const styles = {
      success: 'bg-green-500 text-white',
      error: 'bg-red-500 text-white',
      info: 'bg-blue-500 text-white'
    };
    return styles[type] || styles.info;
  };

  const getToastIcon = (type) => {
    const icons = {
      success: <CheckCircle size={20} />,
      error: <XCircle size={20} />,
      info: <Shield size={20} />
    };
    return icons[type] || icons.info;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -50, x: '-50%' }}
          className="fixed top-4 left-1/2 transform z-50"
        >
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${getToastStyles(type)}`}>
            {getToastIcon(type)}
            <span className="font-medium">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// License Key Display Component
const LicenseKeyDisplay = ({ licenseKey }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [showFullKey, setShowFullKey] = useState(false);

  const maskLicenseKey = (key) => {
    if (key.length < 8) return key;
    const parts = key.split('-');
    if (parts.length >= 3) {
      return `${parts[0]}-XXXX-${parts[parts.length - 1]}`;
    }
    return `${key.substring(0, 4)}-XXXX-${key.substring(key.length - 4)}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(licenseKey);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy license key');
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2 flex-1">
        <Key size={16} className="text-gray-500" />
        <code className="font-mono text-sm text-gray-900 bg-white px-2 py-1 rounded border">
          {showFullKey ? licenseKey : maskLicenseKey(licenseKey)}
        </code>
      </div>
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFullKey(!showFullKey)}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          {showFullKey ? 'Hide' : 'Show'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCopy}
          className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
          title="Copy license key"
        >
          {isCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        </motion.button>
      </div>
    </div>
  );
};

// Main License Management Component
const LicenseManagement = ({
  licenseKey,
  expirationDate,
  isActive
}) => {
  const [licenseStatus, setLicenseStatus] = useState(null);
  const [isRenewing, setIsRenewing] = useState(false);
  const [toast, setToast] = useState({
    message: '',
    type: 'success',
    isVisible: false
  });

  // Calculate license status and time remaining
  useEffect(() => {
    const calculateLicenseStatus = () => {
      const now = new Date();
      const expiration = new Date(expirationDate);
      const timeDiff = expiration.getTime() - now.getTime();
      const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

      let status;
      let statusColor;
      let statusIcon;
      let statusBg;

      if (!isActive || daysRemaining < 0) {
        status = 'Expired';
        statusColor = 'text-red-600';
        statusIcon = <XCircle size={20} />;
        statusBg = 'bg-red-100';
      } else if (daysRemaining <= 10) {
        status = 'Expiring Soon';
        statusColor = 'text-yellow-600';
        statusIcon = <AlertTriangle size={20} />;
        statusBg = 'bg-yellow-100';
      } else {
        status = 'Active';
        statusColor = 'text-green-600';
        statusIcon = <CheckCircle size={20} />;
        statusBg = 'bg-green-100';
      }

      // Calculate time remaining string
      let timeRemaining;
      if (daysRemaining < 0) {
        timeRemaining = `Expired ${Math.abs(daysRemaining)} days ago`;
      } else if (daysRemaining === 0) {
        const hoursRemaining = Math.ceil(timeDiff / (1000 * 3600));
        timeRemaining = hoursRemaining > 0 ? `${hoursRemaining} hours` : 'Expires today';
      } else if (daysRemaining === 1) {
        timeRemaining = '1 day';
      } else {
        timeRemaining = `${daysRemaining} days`;
      }

      return {
        status,
        daysRemaining,
        timeRemaining,
        statusColor,
        statusIcon,
        statusBg
      };
    };

    setLicenseStatus(calculateLicenseStatus());
  }, [expirationDate, isActive]);
  const formatExpirationDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleRenewLicense = async () => {
    setIsRenewing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsRenewing(false);
    setToast({
      message: 'License renewal request submitted successfully!',
      type: 'success',
      isVisible: true
    });
  };

  const isRenewDisabled = () => {
    if (!licenseStatus) return true;
    return licenseStatus.status === 'Active' && licenseStatus.daysRemaining > 30;
  };

  if (!licenseStatus) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-300 rounded w-1/3"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">License Management</h1>
          <p className="text-gray-600">Manage your SalonMate software license and subscription</p>
        </motion.div>

        {/* License Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-6 border border-gray-100"
        >
          {/* Status Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${licenseStatus.statusBg}`}>
                <Shield size={24} className={licenseStatus.statusColor} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">License Status</h2>
                <div className="flex items-center gap-2 mt-1">
                  {licenseStatus.statusIcon}
                  <span className={`font-medium ${licenseStatus.statusColor}`}>
                    {licenseStatus.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={`px-4 py-2 rounded-full font-medium text-sm ${
                licenseStatus.status === 'Active'
                  ? 'bg-green-100 text-green-700'
                  : licenseStatus.status === 'Expiring Soon'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {licenseStatus.status}
            </motion.div>
          </div>

          {/* License Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* License Key */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">License Key</label>
              <LicenseKeyDisplay licenseKey={licenseKey} />
            </div>

            {/* Expiration Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Expiration Date</label>
              <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                <Calendar size={16} className="text-gray-500" />
                <span className="font-medium text-gray-900">
                  {formatExpirationDate(expirationDate)}
                </span>
              </div>
            </div>

            {/* Days Remaining */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Days Remaining</label>
              <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                <Clock size={16} className="text-gray-500" />
                <span className={`font-semibold ${
                  licenseStatus.daysRemaining < 0
                    ? 'text-red-600'
                    : licenseStatus.daysRemaining <= 10
                    ? 'text-yellow-600'
                    : 'text-green-600'
                }`}>
                  {licenseStatus.daysRemaining < 0 
                    ? `Expired ${Math.abs(licenseStatus.daysRemaining)} days ago`
                    : `${licenseStatus.daysRemaining} days`
                  }
                </span>
              </div>
            </div>

            {/* Time Remaining */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Time Remaining</label>
              <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                <AlertTriangle size={16} className={
                  licenseStatus.daysRemaining < 0
                    ? 'text-red-500'
                    : licenseStatus.daysRemaining <= 10
                    ? 'text-yellow-500'
                    : 'text-green-500'
                } />
                <span className={`font-medium ${
                  licenseStatus.daysRemaining < 0
                    ? 'text-red-600'
                    : licenseStatus.daysRemaining <= 10
                    ? 'text-yellow-600'
                    : 'text-green-600'
                }`}>
                  {licenseStatus.timeRemaining}
                </span>
              </div>
            </div>
          </div>

          {/* Warning Messages */}
          <AnimatePresence>
            {licenseStatus.status === 'Expired' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <XCircle size={20} className="text-red-600" />
                  <div>
                    <p className="font-medium text-red-800">Your license has expired</p>
                    <p className="text-sm text-red-600 mt-1">
                      Please renew your license to continue using SalonMate features.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {licenseStatus.status === 'Expiring Soon' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle size={20} className="text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-800">License expiring soon</p>
                    <p className="text-sm text-yellow-600 mt-1">
                      Your license will expire in {licenseStatus.timeRemaining}. Consider renewing to avoid service interruption.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRenewLicense}
              disabled={isRenewDisabled() || isRenewing}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                isRenewDisabled()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : licenseStatus.status === 'Expired'
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl'
                  : licenseStatus.status === 'Expiring Soon'
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {isRenewing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  {licenseStatus.status === 'Expired' ? 'Renew License Now' : 'Renew License'}
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setToast({
                message: 'Support team will contact you within 24 hours',
                type: 'info',
                isVisible: true
              })}
              className="flex-1 sm:flex-none px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
            >
              Contact Support
            </motion.button>
          </div>

          {/* Additional Info */}
          {isRenewDisabled() && licenseStatus.status === 'Active' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> License renewal is available 30 days before expiration.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* License Features Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-8 border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">License Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Customer Management System',
              'Appointment Scheduling',
              'Staff Management',
              'Inventory Tracking',
              'Financial Reports',
              'SMS & Email Notifications',
              'Multi-location Support',
              '24/7 Customer Support'
            ].map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                className="flex items-center gap-2"
              >
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-gray-700">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Toast Notification */}
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
        />
      </div>
    </div>
  );
};

export default LicenseManagement;