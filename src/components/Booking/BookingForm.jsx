'use client'
import {
  Calendar,
  Clock,
  CreditCard,
  Phone,
  Save,
  User,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
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
  })

  const { getAppointments, loading: isLoading } = useUpdateAppointmentById()
  const { data, loading } = useGetStaffData()
  // const { updateStaffStatusByName, loading: updatingStaff } =
  //   useUpdateStaffStatus()


  useEffect(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return
    const selected = data.find(
      (staff) => staff.staff_name === formData.staffName
    )
    setFormData((prev) => ({
      ...prev,
      staffNumber: selected?.mobile_number || '',
      id: selected?.id || '',
    }))
  }, [formData.staffName, data])

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
    // try {
    //   // Update selected staff status to busy on submit
    //   if (formData.staffName && Array.isArray(data)) {
    //     const selected = data.find((s) => s.staff_name === formData.staffName)
    //     if (selected?.id) {
    //       await updateStaffStatusByName(selected.id, 'Active')
    //     }
    //   }
    // } catch (err) {
    //   console.error('Failed to update staff status on submit:', err)
    // } finally {
    //   // Proceed to update the appointment
    // }
    getAppointments(formData.recordId, formData, onCancel)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Booking Status */}
      <div className="flex items-center justify-end">
        <div className="w-full md:w-64">
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Customer Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
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
              <p className="text-red-500 text-sm mt-1">{errors.mobileNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
            )}
          </div>
        </div>
      </div>

      {/* Appointment Schedule */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Appointment Schedule
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <p className="text-red-500 text-sm mt-1">{errors.slotDate}</p>
            )}
          </div>

          

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slot Time
            </label>
            <div className="relative">
              <Clock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
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
              <p className="text-red-500 text-sm mt-1">{errors.slotTime}</p>
            )}
          </div>
        </div>
      </div>

      {/* Staff Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Staff Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Staff Name
            </label>
            <select
              name="staffName"
              disabled={loading || user?.role === 'staff'}
              type="text"
              value={formData.staffName}
              onChange={handleChange}
              className={cn(
                'w-full px-4 py-3 rounded-lg border transition-all',
                errors.staffName ? 'border-red-300' : 'border-gray-300',
                user?.role === 'staff' && 'cursor-not-allowed hover:cursor-not-allowed'
              )}
            >
              <option value="">Select a staff member</option>
              {loading && <option disabled>Loading staff...</option>}
              {!loading && data.length === 0 && (
                <option disabled>No staff found</option>
              )}
              {!loading &&
                data.map((staff) => (
                  <option
                    className="bg-white rounded-md flex items-center justify-between "
                    key={staff.staff_name}
                    value={staff.staff_name}
                    disabled={staff.status?.toLowerCase() === 'busy'}
                  >
                    {staff.staff_name}
                    <span className="ml-5 inline-block font-bold">{`(${staff.status})`}</span>
                  </option>
                ))}
            </select>
            {errors.staffName && (
              <p className="text-red-500 text-sm mt-1">{errors.staffName}</p>
            )}
          </div>

          
        </div>
      </div>

      {/* Service Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Service Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service
            </label>
            <input
              disabled
              name="service"
              value={formData.service}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:cursor-not-allowed transition-all ${
                errors.service ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.service && (
              <p className="text-red-500 text-sm mt-1">{errors.service}</p>
            )}
          </div>

          
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center space-x-2 transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>
    </form>
  )
}

export default BookingForm
