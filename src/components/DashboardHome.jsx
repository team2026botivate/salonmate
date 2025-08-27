import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  DollarSign,
  Scissors,
  Users,
  TrendingUp,
  TrendingDown,
  Eye,
  ChevronRight,
  Building2,
  Clock,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useDashboardSummary, useRecentBookings, useRecentTransactions } from '../hook/dbOperation';






// Summary Card Component
const SummaryCard = ({
  title,
  primaryValue,
  primaryLabel,
  secondaryValue,
  secondaryLabel,
  icon,
  growth,
  colorScheme,
  delay
}) => {
  const getColorClasses = (scheme) => {
    const schemes = {
      blue: 'from-blue-500 to-blue-600 bg-blue-50 text-blue-600',
      green: 'from-green-500 to-green-600 bg-green-50 text-green-600',
      purple: 'from-purple-500 to-purple-600 bg-purple-50 text-purple-600',
      orange: 'from-orange-500 to-orange-600 bg-orange-50 text-orange-600'
    };
    return schemes[scheme] || schemes.blue;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
        <div className={`p-2 rounded-lg ${getColorClasses(colorScheme).split(' ')[2]} ${getColorClasses(colorScheme).split(' ')[3]}`}>
          {icon}
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="text-2xl font-bold text-gray-900">{primaryValue}</div>
          <div className="text-sm text-gray-500">{primaryLabel}</div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-gray-700">{secondaryValue}</div>
            <div className="text-xs text-gray-500">{secondaryLabel}</div>
          </div>
          
          {growth !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
              growth >= 0 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
            }`}>
              {growth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(growth)}%
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Hero Banner Component
const HeroBanner = ({ isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="animate-pulse flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
            <div>
              <div className="h-6 bg-gray-300 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-32"></div>
            </div>
          </div>
          <div className="h-10 bg-gray-300 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 text-white"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-full">
            <Building2 size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Salon Mate</h1>
            <p className="text-purple-100">Welcome back! Here's your salon overview</p>
          </div>
        </div>
        
        
      </div>
    </motion.div>
  );
};

// Data Table Component
const DataTable = ({ title, data, columns, isLoading, delay }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-300 rounded w-48 animate-pulse"></div>
          <div className="h-8 bg-gray-300 rounded w-24 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-4">
              {columns.map((_, j) => (
                <div key={j} className="h-4 bg-gray-300 rounded flex-1"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 text-sm"
        >
          View All
          <ChevronRight size={16} />
        </motion.button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {columns.map((column) => (
                <th key={column.key} className="text-left py-3 px-2 text-sm font-medium text-gray-600">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: delay + 0.1 * index }}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                {columns.map((column) => (
                  <td key={column.key} className="py-3 px-2 text-sm">
                    {column.render ? column.render(item[column.key], item) : item[column.key]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

// Status Badge Component
const StatusBadge = ({ status, type }) => {
  const getStatusStyles = (status, type) => {
    if (type === 'booking') {
      const styles = {
        confirmed: 'bg-green-100 text-green-700',
        pending: 'bg-yellow-100 text-yellow-700',
        completed: 'bg-blue-100 text-blue-700',
        cancelled: 'bg-red-100 text-red-700'
      };
      return styles[status] || styles.pending;
    } else {
      const styles = {
        completed: 'bg-green-100 text-green-700',
        pending: 'bg-yellow-100 text-yellow-700',
        failed: 'bg-red-100 text-red-700'
      };
      return styles[status] || styles.pending;
    }
  };

  const getStatusIcon = (status, type) => {
    if (type === 'booking') {
      const icons = {
        confirmed: <CheckCircle size={12} />,
        pending: <Clock size={12} />,
        completed: <CheckCircle size={12} />,
        cancelled: <XCircle size={12} />
      };
      return icons[status] || icons.pending;
    } else {
      const icons = {
        completed: <CheckCircle size={12} />,
        pending: <AlertCircle size={12} />,
        failed: <XCircle size={12} />
      };
      return icons[status] || icons.pending;
    }
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusStyles(status, type)}`}>
      {getStatusIcon(status, type)}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Main Dashboard Component
const DashboardHome = ({ isAdmin, setActiveTab }) => {
  // Use real database hooks
  const { data: summaryData, loading: summaryLoading, error: summaryError } = useDashboardSummary();
  const { data: recentBookings, loading: bookingsLoading, error: bookingsError } = useRecentBookings();
  const { data: recentTransactions, loading: transactionsLoading, error: transactionsError } = useRecentTransactions();

  // Combined loading state
  const isLoading = summaryLoading || bookingsLoading || transactionsLoading;
  
  // Handle errors
  useEffect(() => {
    if (summaryError) console.error('Summary error:', summaryError);
    if (bookingsError) console.error('Bookings error:', bookingsError);
    if (transactionsError) console.error('Transactions error:', transactionsError);
  }, [summaryError, bookingsError, transactionsError]);

  // Column definitions for tables
  const bookingColumns = [
    { key: 'clientName', label: 'Client Name' },
    { key: 'service', label: 'Service' },
    { key: 'time', label: 'Time' },
    {
      key: 'status',
      label: 'Status',
      render: (status) => <StatusBadge status={status} type="booking" />
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (amount) => <span className="font-semibold text-gray-900">₹{amount}</span>
    }
  ];

  const transactionColumns = [
    { key: 'id', label: 'Transaction ID' },
    { key: 'clientName', label: 'Client Name' },
    {
      key: 'paymentMethod',
      label: 'Payment Method',
      render: (method) => (
        <div className="flex items-center gap-2">
          <CreditCard size={16} className="text-gray-500" />
          <span className="capitalize">{method}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => <StatusBadge status={status} type="transaction" />
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (amount) => <span className="font-semibold text-gray-900">₹{amount}</span>
    }
  ];

  // Show error state if there are critical errors
  if (summaryError && bookingsError && transactionsError) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h2>
            <p className="text-red-600">Unable to load dashboard data. Please try refreshing the page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Section */}
        <HeroBanner isLoading={isLoading} />
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="animate-pulse space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                    <div className="w-8 h-8 bg-gray-300 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-8 bg-gray-300 rounded w-16"></div>
                    <div className="h-4 bg-gray-300 rounded w-20"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="h-6 bg-gray-300 rounded w-12 mb-1"></div>
                      <div className="h-3 bg-gray-300 rounded w-16"></div>
                    </div>
                    <div className="h-6 bg-gray-300 rounded w-12"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            summaryData && (
              <>
                <SummaryCard
                  title="Today's Bookings"
                  primaryValue={summaryData.upcomingBookings.toString()}
                  primaryLabel="Upcoming Bookings"
                  secondaryValue={summaryData.totalClients.toString()}
                  secondaryLabel="Total Clients"
                  icon={<Calendar size={20} />}
                  colorScheme="blue"
                  delay={0.1}
                />
                
                <SummaryCard
                  title="Revenue"
                  primaryValue={`₹${summaryData.weekRevenue.toLocaleString()}`}
                  primaryLabel="This Week"
                  secondaryValue={`₹${summaryData.monthRevenue.toLocaleString()}`}
                  secondaryLabel="This Month"
                  icon={<DollarSign size={20} />}
                  growth={summaryData.monthGrowth}
                  colorScheme="green"
                  delay={0.2}
                />
                
                <SummaryCard
                  title="Services"
                  primaryValue={summaryData.activeServices.toString()}
                  primaryLabel="Active Services"
                  secondaryValue={summaryData.inactiveServices.toString()}
                  secondaryLabel="Inactive Services"
                  icon={<Scissors size={20} />}
                  colorScheme="purple"
                  delay={0.3}
                />
                
                <SummaryCard
                  title="Staff"
                  primaryValue={summaryData.totalStaff.toString()}
                  primaryLabel="Total Staff"
                  secondaryValue={summaryData.absentStaff.toString()}
                  secondaryLabel="Absent Today"
                  icon={<Users size={20} />}
                  colorScheme="orange"
                  delay={0.4}
                />
              </>
            )
          )}
        </div>
        
        {/* Data Tables */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <DataTable
            title="Recent Bookings"
            data={recentBookings}
            columns={bookingColumns}
            isLoading={isLoading}
            delay={0.5}
          />
          
          <DataTable
            title="Recent Transactions"
            data={recentTransactions}
            columns={transactionColumns}
            isLoading={isLoading}
            delay={0.6}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;