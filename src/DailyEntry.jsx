import { Calendar, Edit, Search, X } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MultiServiceSelector from './components/dailyEntry/dailyFromInput';
import { useGetRunningAppointment, useGetStaffData } from './hook/dbOperation';
import { calculatediscount } from './utils/calculatediscount';
import { useAppData } from './zustand/appData';
import { useAuth } from './Context/AuthContext.jsx';

const DailyEntry = () => {
  const [isEditBoxOpen, SetIsEditBoxOpen] = useState(false);

  const { loading, error, data } = useGetRunningAppointment(); // getting running appointments total data
  const { user } = useAuth();
  const { data: staffData, loading: staffLoading } = useGetStaffData();

  console.log(data, 'data');

  const [searchTerm, setSearchTerm] = useState('');
  const [dailyFromInputPropsData, setDailyFromInputPropsData] = useState({
    bookingId: '',
    bookingStatus: '',
    service: '',
    staffId: '',
  });

  const refreshExtraServicesHookRefresh = useAppData(
    (state) => state.refreshExtraServicesHookRefresh
  );

  useEffect(() => {
    // Force close modal when data refreshes to prevent stuck overlay
    SetIsEditBoxOpen(false);
  }, [refreshExtraServicesHookRefresh]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  //todo: i have to check it

  console.log(data, 'data');
  const staffFilteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    if (!user || (user.role && String(user.role).toLowerCase() !== 'staff')) {
      return data;
    }
    if (staffLoading) return data;

    // Resolve current staff from staff_info via email first, then id
    let me = null;
    if (user?.email && Array.isArray(staffData)) {
      me = staffData.find(
        (s) => String(s.email_id || '').toLowerCase() === String(user.email || '').toLowerCase()
      );
    }
    if (!me && Array.isArray(staffData)) {
      me = staffData.find((s) => String(s.id) === String(user?.id));
    }

    const ids = [user?.staffId, user?.id, me?.id]
      .filter((v) => v !== undefined && v !== null)
      .map((v) => String(v));
    const names = [user?.staffName, user?.name, user?.email, me?.staff_name]
      .filter((v) => !!v)
      .map((s) => String(s).trim().toLowerCase());
    const mobiles = [me?.mobile_number].filter(Boolean).map((s) => String(s).trim());

    const isMatchById = (apt) => ids.length > 0 && ids.includes(String(apt?.staff_id ?? ''));
    const isMatchByName = (apt) => {
      const aptStaffName = String(apt?.['Staff Name'] ?? apt?.staff_name ?? '')
        .trim()
        .toLowerCase();
      return names.length > 0 && names.includes(aptStaffName);
    };
    const isMatchByMobile = (apt) => {
      const staffNumber = String(apt?.['Staff Number'] ?? '').trim();
      return mobiles.length > 0 && mobiles.includes(staffNumber);
    };

    const filtered = data.filter(
      (apt) => isMatchById(apt) || isMatchByName(apt) || isMatchByMobile(apt)
    );

    if (filtered.length === 0) {
      console.log('[DailyEntry Staff Filter Debug]', {
        user: { id: user?.id, email: user?.email, staffName: user?.staffName },
        me,
        ids,
        names,
        mobiles,
        sample: data[0],
      });
    }

    return filtered;
  }, [data, user, staffData, staffLoading]);

  const filteredAppointments = staffFilteredData.filter((appointment) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      appointment['Customer Name'].toLowerCase().includes(term) ||
      appointment['Booking ID'].toLowerCase().includes(term) ||
      appointment['Services'].toLowerCase().includes(term);
    return matchesSearch;
  });

  console.log(filteredAppointments, 'filteredAppointments');
  const formatCurrency = (amount) => {
    const formattedAmount = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);

    return formattedAmount;
  };

  const formateDiscount = useCallback((amount, discount = 0) => {
    const amt = Number(amount);
    const disc = Number(discount);

    if (isNaN(amt)) return '₹0.00';

    const netAmount = calculatediscount(amt, isNaN(disc) ? 0 : disc);

    const formattedAmount = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(netAmount);
    return formattedAmount;
  }, []);

  // Compute total revenue after discount for visible (filtered) appointments
  const totalAfterDiscount = useMemo(() => {
    try {
      return filteredAppointments.reduce((sum, apt) => {
        const price = Number(apt['Service Price'] ?? apt.servicePrice ?? 0);
        const discount = Number(apt['Discount'] ?? apt.discount ?? 0);
        const net = calculatediscount(price, isNaN(discount) ? 0 : discount);
        return sum + (isNaN(net) ? 0 : net);
      }, 0);
    } catch (e) {
      return 0;
    }
  }, [filteredAppointments]);

  return (
    <div className="overflow-hidden bg-white shadow-lg rounded-xl">
      <AnimatePresence>
        {!!isEditBoxOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, pointerEvents: 'none' }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            onClick={() => SetIsEditBoxOpen(false)}
          >
            <motion.div
              className="absolute inset-0 flex items-start justify-center p-4 overflow-y-auto hideScrollBar sm:p-6"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <X
                className="fixed text-red-700 cursor-pointer top-10 right-10 z-60 size-10 hover:text-red-700 sm:top-15 sm:right-15 lg:text-white"
                onClick={() => SetIsEditBoxOpen(false)}
              />
              <motion.div className="w-full lg:max-w-6xl" initial={false}>
                <MultiServiceSelector
                  closeEditBox={SetIsEditBoxOpen}
                  appointmentId={dailyFromInputPropsData.bookingId}
                  bookingStatus={dailyFromInputPropsData.bookingStatus}
                  service={dailyFromInputPropsData.service}
                  staffId={dailyFromInputPropsData.staffId}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="flex flex-col items-center justify-between gap-5 md:flex-row">
          <div>
            <h2 className="text-2xl font-bold text-white">Daily Appointments</h2>
            <p className="mt-1 text-indigo-100">Manage today's bookings and services</p>
          </div>
          <div className="flex items-center space-x-2 text-white">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 top-1/2 left-3" />
            <input
              type="text"
              placeholder="Search by customer name, booking ID, or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-4 transition-all duration-200 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {/* <div className="flex items-center space-x-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div> */}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Booking Details
              </th>
              <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Service Info
              </th>
              <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Staff
              </th>
              <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Pricing
              </th>
              <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  <div className="inline-block w-6 h-6 mb-2 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-500">Loading appointments...</p>
                </td>
              </tr>
            ) : (
              filteredAppointments.map((appointment) => (
                <tr
                  key={appointment['Booking ID']}
                  className="transition-colors duration-150 hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {appointment['Booking ID']}
                          </div>
                          <div className="text-sm font-medium text-gray-600">
                            {appointment['Customer Name']}
                          </div>
                          <div className="text-xs text-gray-500">{appointment['Slot Time']}</div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {appointment['Services']}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatCurrency(appointment['Service Price'])}
                      </div>
                      {Array.isArray(appointment.extra_Services) &&
                        appointment.extra_Services.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <div className="inline-block px-2 py-1 text-xs text-indigo-600 rounded-full bg-indigo-50 text-nowrap">
                              + {appointment.extra_Services[0]?.service_name}
                            </div>
                            {appointment.extra_Services.length > 1 && (
                              <span className="text-xs text-gray-500">...more</span>
                            )}
                          </div>
                        )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {appointment['Staff Name']}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-bold text-gray-900">
                        {formateDiscount(appointment['Service Price'], appointment.discount)}
                      </div>
                      {appointment.discount > 0 && (
                        <div className="text-xs font-medium text-green-600">
                          {appointment.discount}% discount
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColor(
                        appointment['Booking Status']
                      )}`}
                    >
                      {(appointment['Booking Status'] || '').toString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setDailyFromInputPropsData((prev) => ({
                          ...prev,
                          bookingId: appointment.id,
                          bookingStatus: appointment['Booking Status'],
                          service: appointment['Services'],
                          staffId: appointment.staff_id,
                        }));
                        SetIsEditBoxOpen(true);
                      }}
                      className="p-1 text-gray-400 transition-colors hover:cursor-pointer hover:text-blue-600"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Showing {filteredAppointments.length} of {data.length} appointments
          </div>
          <div className="flex items-center space-x-4">
            <div>
              Total Revenue:{' '}
              <span className="font-semibold text-green-600">
                {formatCurrency(totalAfterDiscount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyEntry;
