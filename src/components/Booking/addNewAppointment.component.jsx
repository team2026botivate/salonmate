'use client'
import {
  ArrowRight,
  Calendar,
  Clock,
  CreditCard,
  Phone,
  Tag,
  User,
} from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import {
  useCreatenewAppointment,
  useGetServicesList,
  useGetStaffData,
  usegetUserByPhoneNumber,
  useUpdateAppointmentById,
  useUpdateStaffStatus,
  useDoStaffStatusActive,
} from '../../hook/dbOperation'
import { generateBookingId } from '../../utils/generateBookingId'
const statusOptions = {
  value: 'pending',
  label: 'Pending',
  color: 'bg-yellow-100 text-yellow-800',
}

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

  const { updateStaffStatusByName, loading: updatingStaff } =
    useUpdateStaffStatus()

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

    const selected = data.find(
      (staff) => staff.staff_name === formData.staffName
    )
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        staffNumber: selected.mobile_number || '',
        id: selected.id || '',
        staffStatus: selected.status || '',
      }))
    }
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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Tag className="w-5 h-5 mr-2" />
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Booking ID
            </label>
            <input
              disabled
              type="text"
              value={formData.bookingId}
              name="bookingId"
              onChange={handleChange}
              className={`w-full px-4 py-3 border hover:cursor-not-allowed rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.bookingId ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter booking ID"
            />
            {errors.bookingId && (
              <p className="text-red-500 text-sm mt-1">{errors.bookingId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Booking Status
            </label>
            <input
              name="bookingStatus"
              value={formData.bookingStatus}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg outline-none border-none bg-yellow-100 `}
            />
          </div>
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
              Customer Name
            </label>
            <input
              name="customerName"
              type="text"
              value={formData.customerName}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:borer-transparent  transition-all ${
                errors.customerName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter customer name"
            />
            {errors.customerName && (
              <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                name="mobileNumber"
                type="tel"
                value={formData.mobileNumber}
                onChange={handleChange}
                pattern="[0-9]{10}"
                maxlength="10"
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.mobileNumber ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="12345-67890"
                required
              />
            </div>
            {errors.mobileNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.mobileNumber}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slot Date
            </label>
            <input
              name="slotDate"
              type="date"
              value={formData.slotDate}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.slotDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.slotDate && (
              <p className="text-red-500 text-sm mt-1">{errors.slotDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slot Number
            </label>
            <input
              name="slotNumber"
              type="number"
              value={formData.slotNumber}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1"
            />
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
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.slotTime ? 'border-red-300' : 'border-gray-300'
                }`}
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
              // disabled={loading || updatingStaff}
              type="text"
              value={formData.staffName}
              onChange={handleChange}
              className={`w-full px-4 py-3  rounded-lg  border-gray-300 border transition-all ${
                errors.staffName ? 'border-red-300' : 'border-gray-300'
              }`}
            >
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Staff Number
            </label>
            <input
              name="staffNumber"
              type="text"
              value={formData.staffNumber}
              className={`w-full px-4 py-3 border rounded-lg hover:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-transparent  transition-all ${
                errors.staffNumber ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter staff number"
            />
            {errors.staffNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.staffNumber}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service
            </label>
            <select
              name="service"
              value={formData.service}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.service ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={servicesLoading}
            >
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
              <p className="text-red-500 text-sm mt-1">{errors.service}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Time (minutes)
            </label>
            <div className="relative">
              <Clock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                name="serviceTime"
                disabled
                type="number"
                value={parseInt(formData.serviceTime)}
                onChange={handleChange}
                min="0"
                className={`w-full pl-12 pr-4 py-3 border hover:cursor-not-allowed rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.serviceTime ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="30"
              />
            </div>
            {errors.serviceTime && (
              <p className="text-red-500 text-sm mt-1">{errors.serviceTime}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Price ($)
            </label>
            <input
              disabled
              name="servicePrice"
              type="number"
              value={formData.servicePrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={`w-full px-4 py-3 border hover:cursor-not-allowed rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.servicePrice ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.servicePrice && (
              <p className="text-red-500 text-sm mt-1">{errors.servicePrice}</p>
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
          <span>{isLoading ? 'Creating...' : 'Create'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </form>
  )
}

export default AddNewAppointment
