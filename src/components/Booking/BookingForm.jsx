import React, { useEffect, useState } from 'react'
import { Calendar, Clock, Phone, Save, User, X, Check, ChevronDown } from 'lucide-react'

import { useGetStaffData, useUpdateAppointmentById } from '../../hook/dbOperation'
import { useAuth } from '@/Context/AuthContext'
import { cn } from '@/utils/cn'

const statusOptions = [
  {
    value: 'pending',
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
  },
  {
    value: 'completed',
    label: 'Completed',
    color: 'bg-blue-100 text-blue-800',
  },

  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
]

const BookingForm = ({
  tableHeaders,
  formData: appointment,
  onChange,
  onSubmit,
  onCancel,
  // submitting: isLoading,
  isEdit = false,
  renderFormField,

}) => {
  const { user } = useAuth()
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    bookingId: appointment?.['Booking ID'] || '',
    mobileNumber: appointment?.['Mobile Number'] || '',
    customerName: appointment?.['Customer Name'] || '',
    slotDate: appointment?.['Slot Date'] || '',
    slotNumber: appointment?.['Slot Number'] ?? 1,
    slotTime: appointment?.['Slot Time'] || '',
    // Legacy single-staff fields retained for backward compatibility but not used for submit
    staffName: appointment?.['Staff Name'] || '',
    staffNumber: appointment?.['Staff Number'] || '',
    service: appointment?.['Services'] || '',
    servicePrice: appointment?.['Service Price'] ?? 0,
    bookingStatus: String(
      appointment?.['Booking Status'] ?? 'pending'
    ).toLowerCase(),
    actions: appointment?.['Actions'] || '',
    jobCart: appointment?.['Job Cart'] || '',
    timeStamp: appointment?.['TimeStamp'] || '',
    created_at: appointment?.['created_at'] || '',
    recordId: appointment?.['id'] || '',
    id: appointment?.['id'] || '',
    // Initialize from new JSON column
    staff_information: Array.isArray(appointment?.staff_information)
      ? appointment.staff_information
      : [],
  })

  const { getAppointments, loading: isLoading } = useUpdateAppointmentById()
  const { data: staffList = [], loading } = useGetStaffData()
  const [isStaffDropdownOpen, setIsStaffDropdownOpen] = useState(false)

  // Multi-select handlers for staff_information
  const toggleStaffSelection = (staff) => {
    if (user?.role === 'staff') return; // Staff cannot reassign
    setFormData((prev) => {
      const exists = prev.staff_information?.some((s) => String(s.id) === String(staff.id))
      const next = exists
        ? prev.staff_information.filter((s) => String(s.id) !== String(staff.id))
        : [
            ...prev.staff_information,
            {
              id: staff.id,
              staffName: staff.staff_name,
              staffNumber: staff.mobile_number,
              staffStatus: staff.status,
            },
          ]
      return { ...prev, staff_information: next }
    })
  }

  const removeStaffChip = (staffId) => {
    if (user?.role === 'staff') return
    setFormData((prev) => ({
      ...prev,
      staff_information: prev.staff_information.filter((s) => String(s.id) !== String(staffId)),
    }))
  }

  // API call moved to onSubmit to avoid firing on each change

  // Keep staffNumber in sync when staffName changes
  // useEffect(() => {
  //   if (!data || !Array.isArray(data)) return
  //   const selected = data.find((staff) => staff.staff_name === formData.staffName)
  //   setFormData((prev) => ({
  //     ...prev,
  //     staffNumber: selected?.mobile_number || '',
  //   }))
  // }, [formData.staffName, data])

  // const validateForm = () => {
  //   const newErrors = {};

  //   if (!formData.bookingId.trim()) newErrors.bookingId = 'Booking ID is required';
  //   if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';
  //   if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required';
  //   if (!formData.slotDate) newErrors.slotDate = 'Slot date is required';
  //   if (!formData.slotTime) newErrors.slotTime = 'Slot time is required';
  //   if (!formData.staffName.trim()) newErrors.staffName = 'Staff name is required';
  //   if (!formData.staffNumber.trim()) newErrors.staffNumber = 'Staff number is required';
  //   if (!formData.service) newErrors.service = 'Service is required';
  //   if (formData.servicePrice <= 0) newErrors.servicePrice = 'Service price must be greater than 0';

  //   // Validate mobile number format
  //   const mobileRegex = /^\+?[1-9]\d{1,14}$/;
  //   if (formData.mobileNumber && !mobileRegex.test(formData.mobileNumber.replace(/\s/g, ''))) {
  //     newErrors.mobileNumber = 'Please enter a valid mobile number';
  //   }

  //   setErrors(newErrors);
  //   return Object.keys(newErrors).length === 0;
  // };

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Only update editable fields including new multi-staff assignment
    const updates = {
      bookingStatus: formData.bookingStatus,
      slotDate: formData.slotDate,
      slotTime: formData.slotTime,
      slotNumber: formData.slotNumber,
      staff_information: formData.staff_information,
    }
    getAppointments(formData.recordId, updates, onCancel)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Booking Status */}
      <div className="flex items-center justify-end">
        <div className="w-full md:w-64">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Booking Status
          </label>
          <select
            name="bookingStatus"
            value={formData.bookingStatus}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statusOptions.map((option) => (
              <option className="bg-white rounded-md" key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Customer Information */}
      <div>
        <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
          <User className="w-5 h-5 mr-2" />
          Customer Information
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                disabled
                name="mobileNumber"
                type="tel"
                value={formData.mobileNumber}
                onChange={handleChange}
                maxLength="10"
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:cursor-not-allowed transition-all ${
                  errors.mobileNumber ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter mobile number"
              />
            </div>
            {errors.mobileNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.mobileNumber}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Customer Name
            </label>
            <input
              disabled
              name="customerName"
              type="text"
              value={formData.customerName}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:borer-transparent hover:cursor-not-allowed transition-all ${
                errors.customerName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter customer name"
            />
            {errors.customerName && (
              <p className="mt-1 text-sm text-red-500">{errors.customerName}</p>
            )}
          </div>
        </div>
      </div>

      {/* Appointment Schedule */}
      <div>
        <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
          <Calendar className="w-5 h-5 mr-2" />
          Appointment Schedule
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Slot Date
            </label>
            <input
              name="slotDate"
              type="date"
              value={formData.slotDate}
              onChange={handleChange}
              disabled={user?.role === 'staff'}
              className={cn(
                'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
                errors.slotDate ? 'border-red-300' : 'border-gray-300',
                user?.role === 'staff' && 'cursor-not-allowed hover:cursor-not-allowed'
              )}
            />
            {errors.slotDate && (
              <p className="mt-1 text-sm text-red-500">{errors.slotDate}</p>
            )}
          </div>

          

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Slot Time
            </label>
            <div className="relative">
              <Clock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="time"
                name="slotTime"
                value={formData.slotTime}
                onChange={handleChange}
                disabled={user?.role === 'staff'}
                className={cn(
                  'w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
                  errors.slotTime ? 'border-red-300' : 'border-gray-300',
                  user?.role === 'staff' && 'cursor-not-allowed hover:cursor-not-allowed'
                )}
              />
            </div>
            {errors.slotTime && (
              <p className="mt-1 text-sm text-red-500">{errors.slotTime}</p>
            )}
          </div>
        </div>
      </div>

      {/* Staff Information - Multi Select for Admin (Dropdown like AddNewAppointment) */}
      <div>
        <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
          <User className="w-5 h-5 mr-2" />
          Staff Information
        </h3>
        {/* Selected staff chips */}
        {Array.isArray(formData.staff_information) && formData.staff_information.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {formData.staff_information.map((s) => (
              <span
                key={s.id}
                className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full"
              >
                {s.staffName}
                {user?.role !== 'staff' && (
                  <button
                    type="button"
                    onClick={() => removeStaffChip(s.id)}
                    className="text-green-700/80 hover:text-green-900"
                  >
                    <X size={14} />
                  </button>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Staff Selection Dropdown */}
        <div className="relative">
          <label className="block mb-2 text-sm font-medium text-gray-700">Add Staff Members</label>
          <button
            type="button"
            disabled={user?.role === 'staff' || loading}
            onClick={() => setIsStaffDropdownOpen((v) => !v)}
            className={cn(
              'w-full flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-all',
              user?.role === 'staff'
                ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 hover:border-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500'
            )}
          >
            <span>
              {loading ? 'Loading staff...' : 'Select staff members (Optional)'}
            </span>
            {!loading && (
              <ChevronDown className={cn('w-5 h-5 transition-transform', isStaffDropdownOpen && 'rotate-180')} />
            )}
          </button>

          {/* Dropdown */}
          {isStaffDropdownOpen && !loading && (
            <div className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg max-h-64">
              {/* Available Staff */}
              {staffList.filter((s) => String(s.status).toLowerCase() !== 'busy').length > 0 && (
                <div className="p-2">
                  <div className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
                    Available Staff
                  </div>
                  {staffList
                    .filter((s) => String(s.status).toLowerCase() !== 'busy')
                    .map((staff) => {
                      const isSelected = formData.staff_information?.some((x) => String(x.id) === String(staff.id))
                      return (
                        <button
                          key={staff.id}
                          type="button"
                          onClick={() => toggleStaffSelection(staff)}
                          className={cn(
                            'w-full flex items-center justify-between px-3 py-2 text-left rounded-md transition-colors',
                            isSelected ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'hover:bg-gray-50'
                          )}
                        >
                          <span className="flex items-center">
                            <span className="font-medium">{staff.staff_name}</span>
                            <span className="ml-2 text-sm font-medium text-green-600">({staff.status})</span>
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                        </button>
                      )
                    })}
                </div>
              )}

              {/* Busy Staff */}
              {staffList.filter((s) => String(s.status).toLowerCase() === 'busy').length > 0 && (
                <div className="p-2 border-t border-gray-100">
                  <div className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
                    Unavailable Staff
                  </div>
                  {staffList
                    .filter((s) => String(s.status).toLowerCase() === 'busy')
                    .map((staff) => (
                      <div
                        key={staff.id}
                        className="flex items-center justify-between px-3 py-2 text-gray-400 cursor-not-allowed"
                      >
                        <span className="flex items-center">
                          <span className="font-medium">{staff.staff_name}</span>
                          <span className="ml-2 text-sm font-medium text-red-500">({staff.status})</span>
                        </span>
                      </div>
                    ))}
                </div>
              )}

              {staffList.length === 0 && (
                <div className="p-4 text-center text-gray-500">No staff members found</div>
              )}
            </div>
          )}
        </div>

        {/* Click outside to close dropdown */}
        {isStaffDropdownOpen && (
          <div className="fixed inset-0 z-5" onClick={() => setIsStaffDropdownOpen(false)} />
        )}
      </div>
      {/* Action Buttons */}
      <div className="flex items-center justify-end pt-6 space-x-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}          className="px-6 py-3 font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center px-8 py-3 space-x-2 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>
    </form>
  )
}

export default BookingForm
