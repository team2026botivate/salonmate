import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Edit3,
  Check,
  Clock,
  DollarSign,
  Users,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { useStaffPaymentData, useUpdateStaffPaymentStatus } from './hook/dbOperation';
import { formatCurrency } from './utils/formatter';

// StaffPaymentSection component
const StaffPaymentSection = () => {
  // Use real database hooks (assumed to exist)
  const { data: staffDataRaw, loading: isLoading, error, refetch } = useStaffPaymentData();
  const { updatePaymentStatus, loading: updateLoading } = useUpdateStaffPaymentStatus();

  // Normalize staff data to array to avoid crashes
  const staffData = Array.isArray(staffDataRaw) ? staffDataRaw : [];

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedStaffForPayment, setSelectedStaffForPayment] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Keep track of toast timeout so we can clear it on unmount
  const toastTimeout = useRef(null);

  // Handle errors: log
  useEffect(() => {
    if (error) {
      console.error('Staff payment data error:', error);
    }
  }, [error]);

  useEffect(() => {
    return () => {
      if (toastTimeout.current) {
        clearTimeout(toastTimeout.current);
      }
    };
  }, []);

  // Calculate total salary for each staff member safely
  const calculateTotalSalary = (staff = {}) => {
    const attendanceBasedSalary = Number(staff.proRatedSalary) || 0;
    const commission = Number(staff.calculatedCommission) || 0;
    return attendanceBasedSalary + commission;
  };

  // Filter and search functionality (defensive)
  const filteredStaffData = useMemo(() => {
    const term = (searchTerm || '').toString().trim().toLowerCase();
    return staffData.filter((staff = {}) => {
      const name = (staff.name || '').toString().toLowerCase();
      const matchesSearch = name.includes(term);
      const matchesStatus =
        statusFilter === 'all' || (staff.paymentStatus || '').toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [staffData, searchTerm, statusFilter]);

  console.log(filteredStaffData, 'filter staff data ');
  // Calculate summary data defensively
  const summaryData = useMemo(() => {
    const totalStaff = staffData.length;
    const totalSalaryToBePaid = staffData.reduce(
      (sum, staff) => sum + calculateTotalSalary(staff),
      0
    );
    const totalPaid = staffData
      .filter((staff) => (staff.paymentStatus || '').toLowerCase() === 'paid')
      .reduce((sum, staff) => sum + calculateTotalSalary(staff), 0);
    const totalPending = staffData
      .filter((staff) => (staff.paymentStatus || '').toLowerCase() === 'pending')
      .reduce((sum, staff) => sum + calculateTotalSalary(staff), 0);

    return {
      totalStaff,
      totalSalaryToBePaid,
      totalPaid,
      totalPending,
    };
  }, [staffData]);

  // Handler to open modal and prepare payment
  const handleMarkAsPaid = async (staffId) => {
    try {
      const selected = staffData.find((s) => s && s.id === staffId);
      if (!selected) {
        showError('Staff data not found');
        return;
      }
      setSelectedStaffForPayment(selected);
      setShowPaymentModal(true);
    } catch (err) {
      console.error('Error preparing payment:', err);
      showError('Failed to prepare payment. Please try again.');
    }
  };

  // Close modal helper
  const handleCloseModal = () => {
    setShowPaymentModal(false);
    setSelectedStaffForPayment(null);
  };

  // Keyboard: close modal on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        handleCloseModal();
      }
    };
    if (showPaymentModal) {
      window.addEventListener('keydown', onKey);
    }
    return () => window.removeEventListener('keydown', onKey);
  }, [showPaymentModal]);

  // When user selects a payment method
  const handlePaymentMethodSelect = async (paymentMethod) => {
    if (!selectedStaffForPayment) {
      showError('No staff selected for payment');
      return;
    }

    try {
      const payload = {
        ...selectedStaffForPayment,
        paymentMethod: paymentMethod,
      };

      const result = await updatePaymentStatus(payload); // <- adapt this line to your hook
      if (result) {
        await refetch?.();
        setShowPaymentModal(false);
        setSelectedStaffForPayment(null);
        showSuccess(
          `Payment processed successfully for ${selectedStaffForPayment.name} via ${paymentMethod}`
        );
      } else {
        showError('Failed to process payment. Please try again.');
      }
    } catch (err) {
      console.error('Error updating payment status:', err);
      showError('Failed to update payment status. Please try again.');
    }
  };

  // Toast helpers
  const showToast = (message, type = 'success') => {
    if (toastTimeout.current) {
      clearTimeout(toastTimeout.current);
    }
    setToast({ show: true, message, type });
    toastTimeout.current = setTimeout(
      () => setToast({ show: false, message: '', type: 'success' }),
      3000
    );
  };

  const showError = (message) => {
    console.error(message);
    showToast(message, 'error');
  };

  const showSuccess = (message) => {
    showToast(message, 'success');
  };


  // Format payment method for display
  const formatPaymentMethod = (method) => {
    if (!method) return 'N/A';

    const methodMap = {
      'cash': 'Cash',
      'online': 'Online',
      'bank_transfer': 'Bank Transfer',
      'Bank Transfer': 'Bank Transfer',
      'card': 'Card',
      'upi': 'UPI',
    };

    return methodMap[method.toLowerCase()] || method;
  };

  // Animation variants for framer-motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  };

  return (
    <>
      <div className="min-h-screen p-4 bg-gray-50 lg:p-8">
        <div className="mx-auto space-y-8 max-w-7xl">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center lg:text-left"
          >
            <h1 className="mb-2 text-3xl font-bold text-gray-900 lg:text-4xl">
              Staff Payment Dashboard
            </h1>
            <p className="text-lg text-gray-600">Manage and track staff payments efficiently</p>
          </motion.div>

          {/* Summary Cards Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6"
          >
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => <SummaryCardSkeleton key={index} />)
            ) : (
              <>
                {/* Total Staff Card */}
                <motion.div
                  variants={itemVariants}
                  className="p-6 transition-shadow duration-300 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="mb-1 text-sm font-medium text-gray-500">Total Staff</p>
                      <p className="text-2xl font-bold text-gray-900">{summaryData.totalStaff}</p>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </motion.div>

                {/* Total Salary Card */}
                <motion.div
                  variants={itemVariants}
                  className="p-6 transition-shadow duration-300 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="mb-1 text-sm font-medium text-gray-500">Total Salary</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(summaryData.totalSalaryToBePaid)}
                      </p>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                </motion.div>

                {/* Total Paid Card */}
                <motion.div
                  variants={itemVariants}
                  className="p-6 transition-shadow duration-300 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="mb-1 text-sm font-medium text-gray-500">Total Paid</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(summaryData.totalPaid)}
                      </p>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </motion.div>

                {/* Total Pending Card */}
                <motion.div
                  variants={itemVariants}
                  className="p-6 transition-shadow duration-300 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="mb-1 text-sm font-medium text-gray-500">Total Pending</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {formatCurrency(summaryData.totalPending)}
                      </p>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </motion.div>

          {/* Search and Filter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 top-1/2 left-3" />
                <input
                  type="text"
                  placeholder="Search staff by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-2 pl-10 pr-4 transition-all duration-200 border border-gray-200 rounded-lg focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Filter Dropdown */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 transition-all duration-200 border border-gray-200 rounded-lg focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Staff Payment Table Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-xl"
          >
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Staff Payment Details</h2>
            </div>

            {/* Desktop Table View */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Staff Name
                    </th>
                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Base Salary
                    </th>
                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Total Present
                    </th>
                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Commission
                    </th>
                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Total Salary
                    </th>
                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Actions
                    </th>
                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Payment Method
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => <TableRowSkeleton key={index} />)
                  ) : (
                    <AnimatePresence>
                      {filteredStaffData.map((staff, index) => {
                        const name = staff?.name || '—';
                        const initial = name ? String(name).charAt(0).toUpperCase() : '?';
                        const paymentStatus = (staff?.paymentStatus || 'pending')
                          .toString()
                          .toLowerCase();
                        return (
                          <motion.tr
                            key={staff.id || index}
                            variants={rowVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{ delay: index * 0.05 }}
                            className="transition-colors duration-200 hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex items-center justify-center w-10 h-10 mr-3 text-sm font-medium text-white rounded-full bg-gradient-to-br from-blue-400 to-purple-500">
                                  {initial}
                                </div>
                                <div className="text-sm font-medium text-gray-900">{name}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                              <div>
                                <div className="font-medium">
                                  {formatCurrency(staff?.proRatedSalary || staff?.baseSalary || 0)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Base: {formatCurrency(staff?.baseSalary || 0)} (
                                  {staff?.totalPresent ?? 0}/{staff?.totalDaysInMonth ?? 0} days)
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                              {staff?.totalPresent ?? 0} days
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                              {staff?.commissionType === 'percentage'
                                ? `${staff?.commission ?? 0}% (₹${(Number(staff?.calculatedCommission) || 0).toFixed(2)})`
                                : formatCurrency(staff?.calculatedCommission || 0)}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                              {formatCurrency(calculateTotalSalary(staff))}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  paymentStatus === 'paid'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-orange-100 text-orange-800'
                                }`}
                              >
                                {paymentStatus === 'paid' ? (
                                  <>
                                    <Check className="w-3 h-3 mr-1" />
                                    Paid
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 mr-1" />
                                    Pending
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                {paymentStatus === 'pending' && (
                                  <button
                                    onClick={() => handleMarkAsPaid(staff.id)}
                                    disabled={updateLoading}
                                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white transition-all duration-200 bg-green-600 rounded-lg hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    title="Mark as Paid"
                                  >
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Pay Now
                                  </button>
                                )}
                                {paymentStatus === 'paid' && (
                                  <button
                                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 transition-all duration-200 bg-gray-100 rounded-lg cursor-not-allowed hover:bg-gray-200"
                                    disabled
                                  >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Paid
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">
                                {formatPaymentMethod(staff?.paymentMethod)}
                              </span>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden">
              {isLoading ? (
                <div className="p-4 space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="p-4 rounded-lg animate-pulse bg-gray-50">
                      <div className="flex items-center mb-4 space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="w-32 h-4 mb-2 bg-gray-200 rounded"></div>
                          <div className="w-24 h-3 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="w-full h-3 bg-gray-200 rounded"></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <AnimatePresence>
                  <div className="p-4 space-y-4">
                    {filteredStaffData.map((staff, index) => {
                      const name = staff?.name || '—';
                      const initial = name ? String(name).charAt(0).toUpperCase() : '?';
                      const paymentStatus = (staff?.paymentStatus || 'pending')
                        .toString()
                        .toLowerCase();
                      return (
                        <motion.div
                          key={staff.id || index}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          transition={{ delay: index * 0.05 }}
                          className="p-4 transition-colors duration-200 rounded-lg bg-gray-50 hover:bg-gray-100"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              <div className="flex items-center justify-center w-12 h-12 mr-3 font-medium text-white rounded-full bg-gradient-to-br from-blue-400 to-purple-500">
                                {initial}
                              </div>
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">{name}</h3>
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                    paymentStatus === 'paid'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-orange-100 text-orange-800'
                                  }`}
                                >
                                  {paymentStatus === 'paid' ? (
                                    <>
                                      <Check className="w-3 h-3 mr-1" />
                                      Paid
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="w-3 h-3 mr-1" />
                                      Pending
                                    </>
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button className="p-2 text-gray-400 transition-all duration-200 rounded-lg hover:bg-blue-50 hover:text-blue-600">
                                <Edit3 className="w-4 h-4" />
                              </button>
                              {paymentStatus === 'pending' && (
                                <button
                                  onClick={() => handleMarkAsPaid(staff.id)}
                                  disabled={updateLoading}
                                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-white transition-all duration-200 bg-green-600 rounded-lg hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <CreditCard className="w-4 h-4 mr-2" />
                                  Pay Now
                                </button>
                              )}
                              {paymentStatus === 'paid' && (
                                <button
                                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 transition-all duration-200 bg-gray-100 rounded-lg cursor-not-allowed hover:bg-gray-200"
                                  disabled
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Paid
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Attendance Salary:</span>
                              <p className="font-medium text-gray-900">
                                {formatCurrency(staff?.proRatedSalary || 0)}
                              </p>
                              <p className="text-xs text-gray-500">
                                Base: {formatCurrency(staff?.baseSalary || 0)} (
                                {staff?.totalPresent ?? 0}/{staff?.totalDaysInMonth ?? 0} days)
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">Total Present:</span>
                              <p className="font-medium text-gray-900">
                                {staff?.totalPresent ?? 0} days
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">Commission:</span>
                              <p className="font-medium text-gray-900">
                                {staff?.commissionType === 'percentage'
                                  ? `${staff?.commission ?? 0}% (₹${(Number(staff?.calculatedCommission) || 0).toFixed(2)})`
                                  : formatCurrency(staff?.calculatedCommission || 0)}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">Payment Method:</span>
                              <p className="font-medium text-gray-900">
                                {formatPaymentMethod(staff?.paymentMethod)}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </AnimatePresence>
              )}
            </div>

            {/* Error State */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 text-center"
              >
                <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">Error Loading Data</h3>
                <p className="mb-4 text-gray-500">{String(error)}</p>
                <button
                  onClick={refetch}
                  className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Try Again
                </button>
              </motion.div>
            )}

            {/* Empty State */}
            {!isLoading && !error && filteredStaffData.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 text-center"
              >
                <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">No staff found</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'No staff members have been added yet'}
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Payment Method Selection Modal */}
        <AnimatePresence>
          {showPaymentModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
              onClick={handleCloseModal}
              aria-hidden={!showPaymentModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-md p-6 mx-4 bg-white shadow-xl rounded-xl"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Select Payment Method</h3>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {selectedStaffForPayment && (
                  <div className="mb-6">
                    <div className="p-4 rounded-lg bg-gray-50">
                      <div className="flex items-center mb-2">
                        <div className="flex items-center justify-center w-10 h-10 mr-3 text-white rounded-full bg-gradient-to-br from-blue-400 to-purple-500">
                          {(selectedStaffForPayment.name || '—').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {selectedStaffForPayment.name}
                          </p>
                          <p className="text-sm text-gray-500">Payment Amount</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(
                            (Number(selectedStaffForPayment.proRatedSalary) || 0) +
                              (Number(selectedStaffForPayment.calculatedCommission) || 0)
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <p className="mb-4 text-sm text-gray-600">How would you like to pay?</p>
                  <div className="space-y-3">
                    <button
                      onClick={() => handlePaymentMethodSelect('cash')}
                      disabled={updateLoading}
                      className="flex items-center justify-between w-full p-4 transition-all duration-200 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-10 h-10 mr-3 bg-green-100 rounded-lg">
                          <span className="text-xl">💰</span>
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Cash</p>
                          <p className="text-sm text-gray-500">Physical cash payment</p>
                        </div>
                      </div>
                      <div className="text-green-600">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    </button>

                    <button
                      onClick={() => handlePaymentMethodSelect('online')}
                      disabled={updateLoading}
                      className="flex items-center justify-between w-full p-4 transition-all duration-200 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-10 h-10 mr-3 bg-blue-100 rounded-lg">
                          <span className="text-xl">💳</span>
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Online</p>
                          <p className="text-sm text-gray-500">UPI, Bank Transfer, etc.</p>
                        </div>
                      </div>
                      <div className="text-blue-600">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed z-50 right-4 bottom-4"
          >
            <div
              className={`flex items-center space-x-3 rounded-lg px-6 py-3 shadow-lg ${
                toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StaffPaymentSection;

//* ...................................................................................................................................................................

// Skeleton loader component for table rows
const TableRowSkeleton = () => (
  <tr className="border-b border-gray-100 animate-pulse">
    {Array.from({ length: 7 }).map((_, index) => (
      <td key={index} className="px-6 py-4">
        <div className="w-full h-4 bg-gray-200 rounded"></div>
      </td>
    ))}
  </tr>
);

// Skeleton loader for summary cards
const SummaryCardSkeleton = () => (
  <div className="p-6 bg-white border border-gray-100 shadow-sm animate-pulse rounded-xl">
    <div className="flex items-center justify-between">
      <div>
        <div className="w-24 h-4 mb-2 bg-gray-200 rounded"></div>
        <div className="w-16 h-6 bg-gray-200 rounded"></div>
      </div>
      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
    </div>
  </div>
);
