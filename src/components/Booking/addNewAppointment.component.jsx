'use client'
import {
  ArrowRight,
  Calendar,
  Clock,
  CreditCard,
  Phone,
  User,
} from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import {
  useCreatenewAppointment,
  useGetServicesList,
  useGetStaffData,
  usegetUserByPhoneNumber,
  useDoStaffStatusActive,
} from '../../hook/dbOperation'
import { generateBookingId } from '../../utils/generateBookingId'
import { useAuth } from '../../Context/AuthContext'


const AddNewAppointment = ({
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
  const { doStaffStatusActive } = useDoStaffStatusActive()
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    bookingId: '',
    mobileNumber: '',
    customerName: '',
    slotDate: '',
    slotNumber: 1,
    slotTime: '',
    staffName: '',
    staffNumber: '',
    service: '',
    servicePrice: 0,
    bookingStatus: String('pending').toLowerCase(),
    timeStamp: '',
    created_at: '',
    recordId: '',
    id: '',
    serviceTime: '',
  })

  const { createNewAppointment, loading: isLoading } = useCreatenewAppointment()
  const { data: serviceslist, loading: servicesLoading } = useGetServicesList()
  const { data, loading } = useGetStaffData()
  const [isNewUser, setisNewUser] = useState(false)

  const { getUserByPhoneNumber } = usegetUserByPhoneNumber()

  const getBookingId = useMemo(() => generateBookingId(), [])

  // Set booking ID on mount
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      bookingId: getBookingId,
    }))
  }, [getBookingId])

  useEffect(() => {
    if (!formData.service || !serviceslist || !serviceslist.length) return
    const service = serviceslist.find(
      (service) => service.service_name === formData.service
    )
    setFormData((prev) => ({
      ...prev,
      servicePrice: service?.base_price,
      serviceTime: service?.time_duration,
    }))
  }, [formData.service, serviceslist])

  useEffect(() => {
    if (!formData.mobileNumber || formData.mobileNumber.length < 10) return
    const getUserData = async () => {
      const resp = await getUserByPhoneNumber(formData.mobileNumber)
      //todo start work form here

      setisNewUser(Array.isArray(resp) && resp.length === 0)

      if (resp?.data?.length === 0) return

      const number =
        resp.find((item) => item.mobile_number === formData.mobileNumber) ||
        formData.customerName
      setFormData((prev) => ({
        ...prev,
        customerName: number?.customer_name || formData.customerName,
      }))
    }
    getUserData()
  }, [formData.mobileNumber || formData.mobileNumber.length < 10])

  useEffect(() => {
    if (!data || !Array.isArray(data)) return

    // If staff user is logged in, resolve their staff_info row
    if (user?.role === 'staff') {
      // 1) Try to match by email first
      let me = null
      if (user?.email) {
        me = data.find((s) => String(s.email_id || '').toLowerCase() === String(user.email || '').toLowerCase())
      }
      // 2) Fallback to matching by id (if your auth id equals staff_info.id)
      if (!me) {
        me = data.find((s) => String(s.id) === String(user.id))
      }

      if (me) {
        setFormData((prev) => ({
          ...prev,
          staffName: me.staff_name,
          staffNumber: me.mobile_number,
          id: me.id,               // use staff_info.id as staff_id
          staffStatus: me.status,
        }))
        return
      } else {
        // Fall back: ensure staff_id is at least set to auth user id
        setFormData((prev) => ({
          ...prev,
          id: String(user.id || ''),
        }))
      }
    }

    // Non-staff or if staff didn't match, keep existing behavior
    if (!formData.staffName && data.length > 0) {
      setFormData((prev) => ({
        ...prev,
        staffName: data[0].staff_name,
        staffNumber: data[0].mobile_number,
        id: data[0].id,
        staffStatus: data[0].status,
      }))
      return
    }

    const selected = data.find((staff) => staff.staff_name === formData.staffName)
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        staffNumber: selected.mobile_number || '',
        id: selected.id || '',
        staffStatus: selected.status || '',
      }))
    }
  }, [formData.staffName, data, user])

  
  // Helper: format a Date to local yyyy-MM-dd string
  const toLocalYMD = (d) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const isStaffSelectionAllowed = () => {
    if (!formData.slotDate) return false

    // input[type=date] gives yyyy-MM-dd. Compare as local yyyy-MM-dd strings to avoid timezone drift
    const selectedStr = String(formData.slotDate)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    const todayStr = toLocalYMD(today)
    const tomorrowStr = toLocalYMD(tomorrow)

    return selectedStr === todayStr || selectedStr === tomorrowStr
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    
    // Clear staff selection if date is changed to future date
    if (name === 'slotDate') {
      // Compare as local yyyy-MM-dd strings to avoid timezone issues
      const selectedStr = String(value)
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(today.getDate() + 1)

      const todayStr = toLocalYMD(today)
      const tomorrowStr = toLocalYMD(tomorrow)

      const isAllowed = selectedStr === todayStr || selectedStr === tomorrowStr

      if (!isAllowed) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          staffName: '',
          staffNumber: '',
          id: '',
          staffStatus: '',
        }))
        return
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate required fields before submission (staff is now optional)
    if (
      !formData.customerName ||
      !formData.mobileNumber ||
      !formData.slotDate ||
      !formData.slotTime ||
      !formData.service
    ) {
      alert('Please fill in all required fields.')
      return
    }

    await createNewAppointment(formData, 'busy', onCancel, isNewUser)
    await doStaffStatusActive(
      formData.id,
      formData.serviceTime,
      formData.staffStatus
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 ">
      
      {/* Customer Information */}
      <div>
        <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
          <User className="w-5 h-5 mr-2" />
          Customer Information
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 top-1/2 left-3" />
              <input
                name="mobileNumber"
                type="tel"
                value={formData.mobileNumber}
                onChange={handleChange}
                pattern="[0-9]{10}"
                maxLength="10"
                className={`w-full rounded-lg border py-3 pr-4 pl-12 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                  errors.mobileNumber ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="12345-67890"
                required
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
              name="customerName"
              type="text"
              value={formData.customerName}
              onChange={handleChange}
              className={`focus:borer-transparent w-full rounded-lg border px-4 py-3 transition-all focus:ring-2 focus:ring-blue-500 ${
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
              className={`w-full rounded-lg border px-4 py-3 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                errors.slotDate ? 'border-red-300' : 'border-gray-300'
              }`}
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
              <Clock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 top-1/2 left-3" />
              <input
                type="time"
                name="slotTime"
                value={formData.slotTime}
                onChange={handleChange}
                className={`w-full rounded-lg border py-3 pr-4 pl-12 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                  errors.slotTime ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.slotTime && (
              <p className="mt-1 text-sm text-red-500">{errors.slotTime}</p>
            )}
          </div>
        </div>
      </div>

      {/* Staff Information */}
      <div>
        <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
          <User className="w-5 h-5 mr-2" />
          Staff Information
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Staff Name
            </label>
            <select
              name="staffName"
              disabled={user?.role === 'staff' || !isStaffSelectionAllowed() || loading}
              type="text"
              value={formData.staffName}
              onChange={handleChange}
              className={`w-full rounded-lg border px-4 py-3 transition-all ${
                !isStaffSelectionAllowed() 
                  ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : errors.staffName 
                    ? 'border-red-300' 
                    : 'border-gray-300'
              }`}
            >
              <option value="">
                {!isStaffSelectionAllowed() 
                  ? "Staff selection only available for today and tomorrow" 
                  : "Select Staff (Optional)"
                }
              </option>
              {isStaffSelectionAllowed() && loading && <option disabled>Loading staff...</option>}
              {isStaffSelectionAllowed() && !loading && data.length === 0 && (
                <option disabled>No staff found</option>
              )}
              {isStaffSelectionAllowed() && !loading &&
                data.map((staff) => (
                  <option
                    className="flex items-center justify-between bg-white rounded-md"
                    key={staff.staff_name}
                    value={staff.staff_name}
                    disabled={staff.status?.toLowerCase() === 'busy'}
                  >
                    {staff.staff_name}
                    <span className="inline-block ml-5 font-bold">{`(${staff.status})`}</span>
                  </option>
                ))}
            </select>
            {errors.staffName && (
              <p className="mt-1 text-sm text-red-500">{errors.staffName}</p>
            )}
          </div>
        </div>
      </div>

      {/* Service Information */}
      <div>
        <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
          <CreditCard className="w-5 h-5 mr-2" />
          Service Information
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Service
            </label>
            <select
              name="service"
              value={formData.service}
              onChange={handleChange}
              className={`w-full rounded-lg border px-4 py-3 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                errors.service ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={servicesLoading}
            >
              <option value="">Select Service</option>
              {serviceslist?.map((service) => (
                <option
                  className="bg-white rounded-md"
                  key={service.id}
                  value={service.service_name}
                >
                  {service.service_name}
                </option>
              ))}
            </select>

            {errors.service && (
              <p className="mt-1 text-sm text-red-500">{errors.service}</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end pt-6 space-x-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center px-8 py-3 space-x-2 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <span>{isLoading ? 'Creating...' : 'Create'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </form>
  )
}

export default AddNewAppointment
