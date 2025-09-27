import { motion } from 'framer-motion';
import { Eye, Phone, User } from 'lucide-react';
import React, { useEffect } from 'react';
import { useAppData } from '../../zustand/appData';

const BookingList = ({
  tableHeaders, // for table header
  filteredAppointments, // for table data
  hideHistoryButton, // for history button
  handleEditClick, // for edit button
  searchTerm, // for search
  loading, // for loading
}) => {
  const refreshAppointments = useAppData((state) => state.refreshAppointments);

  

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  useEffect(() => {}, [refreshAppointments]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <>
      {/* Mobile Card View */}
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="block md:hidden"
        >
          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="inline-block w-6 h-6 mb-4 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500">Loading appointments...</p>
              </div>
            ) : filteredAppointments && filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 space-y-4 bg-white border border-gray-200 rounded-lg shadow-md"
                >
                  {/* Header with Booking ID and Status */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {appointment['Booking ID']}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        {formatDate(appointment.created_at)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        appointment['Booking Status']
                      )}`}
                    >
                      {appointment['Booking Status']}
                    </span>
                  </div>

                  {/* Customer Information */}
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {appointment['Customer Name']}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="flex-shrink-0 w-4 h-4 mr-1" />
                        <span className="truncate">{appointment['Mobile Number']}</span>
                      </div>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="mb-1 text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Appointment
                      </p>
                      <p className="font-medium text-gray-900">
                        {formatDate(appointment['Slot Date'])}
                      </p>
                      <p className="text-gray-500">{appointment['Slot Time']}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Service
                      </p>
                      <p className="font-medium text-gray-900">
                        {appointment.Services}
                      </p>
                      <p className="text-gray-500">
                        ₹{parseFloat(appointment['Service Price']).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Staff Information */}
                  <div>
                    <p className="mb-2 text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Staff
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {appointment.staff_information && appointment.staff_information.length > 0 ? (
                        appointment.staff_information.map((staff) => (
                          <span
                            key={staff.id}
                            className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full"
                          >
                            {staff.staffName}
                          </span>
                        ))
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-full">
                          Not Assigned
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleEditClick(appointment)}
                      className="flex items-center justify-center w-full px-4 py-2 space-x-2 text-sm font-medium text-blue-600 transition-colors border border-blue-200 rounded-md bg-blue-50 hover:bg-blue-100 hover:text-blue-700"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex items-center justify-center py-12 text-center">
                <p className="text-sm text-gray-500">Appointment not found</p>
              </div>
            )}
          </div>
        </motion.div>

      {/* Desktop Table View (unchanged) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="hidden overflow-hidden rounded-lg shadow-md md:block"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 table-fixed ">
            <thead className="bg-gray-50">
              <tr className="w-full">
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Booking Details
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Appointment
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Service
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Staff
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td className="px-6 py-8 text-center text-gray-500" colSpan={7}>
                    <div className="inline-block w-6 h-6 mb-2 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-500">Loading appointments...</p>
                  </td>
                </tr>
              ) : filteredAppointments && filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {appointment['Booking ID']}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(appointment.created_at)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10">
                          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment['Customer Name']}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="w-4 h-4 mr-1" />
                            {appointment['Mobile Number']}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(appointment['Slot Date'])}
                        </div>
                        <div className="text-sm text-gray-500">{appointment['Slot Time']}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.Services}
                        </div>
                        <div className="text-sm text-gray-500">
                          ₹{parseFloat(appointment['Service Price']).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-2 text-sm text-wrap w-50 ">
                        {appointment.staff_information && appointment.staff_information.length > 0 ? (
                          appointment.staff_information.map((staff) => (
                            <span
                              key={staff.id}
                              className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full "
                            >
                              {staff.staffName}
                            </span>
                          ))
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-full">
                            Not Assigned
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          appointment['Booking Status']
                        )}`}
                      >
                        {appointment['Booking Status']}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                      <button
                        onClick={() => handleEditClick(appointment)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-900 hover:cursor-pointer "
                      >
                        <Eye className="w-4 h-4 " />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-4 text-center text-gray-500" colSpan={7}>
                    Appointment not found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </>
  );
};

export default BookingList;

