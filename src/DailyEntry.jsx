import { Calendar, Edit, Search, X } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import MultiServiceSelector from './components/dailyEntry/dailyFromInput'
import { useGetRunningAppointment } from './hook/dbOperation'
import { calculatediscount } from './utils/calculatediscount'
import { useAppData } from './zustand/appData'

const DailyEntry = () => {
  const [isEditBoxOpen, SetIsEditBoxOpen] = useState(false)

  const { loading, error, data } = useGetRunningAppointment() // getting running appointments total data

  console.log(data)
  const [searchTerm, setSearchTerm] = useState('')
  const [dailyFromInputPropsData, setDailyFromInputPropsData] = useState({
    bookingId: '',
    bookingStatus: '',
    service: '',
  })



  const refreshExtraServicesHookRefresh = useAppData(
    (state) => state.refreshExtraServicesHookRefresh
  )

  useEffect(() => {}, [refreshExtraServicesHookRefresh])

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }


  const filteredAppointments = data.filter((appointment) => {
    const term = searchTerm.toLowerCase()
    const matchesSearch =
      appointment['Customer Name'].toLowerCase().includes(term) ||
      appointment['Booking ID'].toLowerCase().includes(term) ||
      appointment['Services'].toLowerCase().includes(term)
    return matchesSearch
  })

  const formatCurrency = (amount) => {
    const formattedAmount = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)

    return formattedAmount
  }

  const formateDiscount = useCallback((amount, discount = 0) => {
    const amt = Number(amount)
    const disc = Number(discount)

    if (isNaN(amt)) return '₹0.00'

    const netAmount = calculatediscount(amt, isNaN(disc) ? 0 : disc)

    const formattedAmount = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(netAmount)
    return formattedAmount
  }, [])

  // Compute total revenue after discount for visible (filtered) appointments
  const totalAfterDiscount = useMemo(() => {
    try {
      return filteredAppointments.reduce((sum, apt) => {
        const price = Number(apt['Service Price'] ?? apt.servicePrice ?? 0)
        const discount = Number(apt['Discount'] ?? apt.discount ?? 0)
        const net = calculatediscount(price, isNaN(discount) ? 0 : discount)
        return sum + (isNaN(net) ? 0 : net)
      }, 0)
    } catch (e) {
      return 0
    }
  }, [filteredAppointments])

  
  return (
    <div className="bg-white rounded-xl  shadow-lg overflow-hidden">
      <AnimatePresence>
        {!!isEditBoxOpen && (
          <motion.div
            className="fixed inset-0 z-10 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => SetIsEditBoxOpen(false)}
          >
            <motion.div
              className="absolute inset-0 flex items-start justify-center overflow-y-auto p-4 sm:p-6 hideScrollBar "
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <X
                className="fixed size-10 hover:text-red-700 z-60 top-10 right-10 cursor-pointer sm:top-15 sm:right-15  text-red-700 lg:text-white "
                onClick={() => SetIsEditBoxOpen(false)}
              />
              <motion.div className="w-full lg:max-w-6xl" initial={false}>
                <MultiServiceSelector
                  closeEditBox={SetIsEditBoxOpen}
                  appointmentId={dailyFromInputPropsData.bookingId}
                  bookingStatus={dailyFromInputPropsData.bookingStatus}
                  service={dailyFromInputPropsData.service}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 ">
        <div className="flex items-center justify-between flex-col md:flex-row gap-5">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Daily Appointments
            </h2>
            <p className="text-indigo-100 mt-1">
              Manage today's bookings and services
            </p>
          </div>
          <div className="flex items-center space-x-2 text-white">
            <Calendar className="h-5 w-5" />
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
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by customer name, booking ID, or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            />
          </div>
          {/* <div className="flex items-center space-x-3">
            <Filter className="h-4 w-4 text-gray-500" />
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
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Booking Details
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service Info
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Staff
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pricing
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-pink-500 mb-2"></div>
                  <p className="text-sm text-gray-500">
                    Loading appointments...
                  </p>
                </td>
              </tr>
            ) : (
              filteredAppointments.map((appointment) => (
                <tr
                  key={appointment['Booking ID']}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {appointment['Booking ID']}
                          </div>
                          <div className="text-sm text-gray-600 font-medium">
                            {appointment['Customer Name']}
                          </div>
                          <div className="text-xs text-gray-500">
                            {appointment['Slot Time']}
                          </div>
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
                          <div className="mt-1 flex items-center gap-2 flex-wrap">
                            <div className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full inline-block text-nowrap">
                              + {appointment.extra_Services[0]?.service_name}
                            </div>
                            {appointment.extra_Services.length > 1 && (
                              <span className="text-xs text-gray-500">
                                ...more
                              </span>
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
                        {formateDiscount(
                          appointment['Service Price'],
                          appointment.discount
                        )}
                      </div>
                      {appointment.discount > 0 && (
                        <div className="text-xs text-green-600 font-medium">
                          {appointment.discount}% discount
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${getStatusColor(
                        appointment['Booking Status']
                      )}`}
                    >
                      {(appointment['Booking Status'] || '').toString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <butto
                      onClick={() => {
                        setDailyFromInputPropsData((prev) => ({
                          ...prev,
                          bookingId: appointment.id,
                          bookingStatus: appointment['Booking Status'],
                          service: appointment['Services'],
                        }))
                        SetIsEditBoxOpen(true)
                      }}
                      className="p-1 hover:cursor-pointer text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </butto>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
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
  )
}

export default DailyEntry
