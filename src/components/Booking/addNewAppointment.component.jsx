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
    <form onSubmit={handleSubmit} className="space-y-8 ">
      
      {/* Customer Information */}
      <div>
        <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
          <User className="mr-2 h-5 w-5" />
          Customer Information
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
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
            <label className="mb-2 block text-sm font-medium text-gray-700">
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
        <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
          <Calendar className="mr-2 h-5 w-5" />
          Appointment Schedule
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
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
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Slot Time
            </label>
            <div className="relative">
              <Clock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
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
        <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
          <User className="mr-2 h-5 w-5" />
          Staff Information
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Staff Name
            </label>
            <select
              name="staffName"
              // disabled={loading || updatingStaff}
              type="text"
              value={formData.staffName}
            
              onChange={handleChange}
              className={`w-full rounded-lg border border-gray-300 px-4 py-3 transition-all ${
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
                    className="flex items-center justify-between rounded-md bg-white"
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
              <p className="mt-1 text-sm text-red-500">{errors.staffName}</p>
            )}
          </div>
        </div>
      </div>

      {/* Service Information */}
      <div>
        <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
          <CreditCard className="mr-2 h-5 w-5" />
          Service Information
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
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
                  className="rounded-md bg-white"
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
      <div className="flex items-center justify-end space-x-4 border-t border-gray-200 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg bg-gray-100 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center space-x-2 rounded-lg bg-blue-600 px-8 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          <span>{isLoading ? 'Creating...' : 'Create'}</span>
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </form>
  )
}

export default AddNewAppointment
