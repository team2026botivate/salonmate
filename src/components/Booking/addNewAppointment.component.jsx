'use client';
import {
  ArrowRight,
  Calendar,
  Clock,
  CreditCard,
  Phone,
  User,
  X,
  ChevronDown,
  Check,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import {
  useCreatenewAppointment,
  useGetServicesList,
  useGetStaffData,
  usegetUserByPhoneNumber,
  useDoStaffStatusActive,
} from '../../hook/dbOperation';
import { generateBookingId } from '../../utils/generateBookingId';
import { useAuth } from '../../Context/AuthContext';
import { useSendWhatsappAfterAppointment } from '@/hook/sendWhatsapp-after-appointmen';
import Toast from '../ui/tost.Components.ui';

const AddNewAppointment = ({
  tableHeaders,
  formData: appointment,
  onChange,
  onSubmit,
  onCancel,
  isEdit = false,
  renderFormField,
}) => {
  const { user } = useAuth();

  const { doStaffStatusActive } = useDoStaffStatusActive();
  const { sendWhatsappAfterAppointment } = useSendWhatsappAfterAppointment();
  const [errors, setErrors] = useState({});
  const [isStaffDropdownOpen, setIsStaffDropdownOpen] = useState(false);

  const [formData, setFormData] = useState({
    bookingId: '',
    mobileNumber: '',
    customerName: '',
    slotDate: '',
    slotNumber: 1,
    slotTime: '',
    staff: [], // Changed from single staff to array
    service: '',
    servicePrice: 0,
    bookingStatus: String('pending').toLowerCase(),
    timeStamp: '',
    created_at: '',
    recordId: '',
    serviceTime: '',
  });

  const { createNewAppointment, loading: isLoading } = useCreatenewAppointment();
  const { data: serviceslist, loading: servicesLoading } = useGetServicesList();
  const { data, loading } = useGetStaffData();
  const [isNewUser, setisNewUser] = useState(false);

  const { getUserByPhoneNumber } = usegetUserByPhoneNumber();

  const getBookingId = useMemo(() => generateBookingId(), []);

  // Set booking ID on mount
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      bookingId: getBookingId,
    }));
  }, [getBookingId]);

  useEffect(() => {
    if (!formData.service || !serviceslist || !serviceslist.length) return;
    const service = serviceslist.find((service) => service.service_name === formData.service);
    setFormData((prev) => ({
      ...prev,
      servicePrice: service?.base_price,
      serviceTime: service?.time_duration,
    }));
  }, [formData.service, serviceslist]);

  useEffect(() => {
    if (!formData.mobileNumber || formData.mobileNumber.length < 10) return;
    const getUserData = async () => {
      const resp = await getUserByPhoneNumber(formData.mobileNumber);
      setisNewUser(Array.isArray(resp) && resp.length === 0);

      if (resp?.data?.length === 0) return;

      const number =
        resp.find((item) => item.mobile_number === formData.mobileNumber) || formData.customerName;
      setFormData((prev) => ({
        ...prev,
        customerName: number?.customer_name || formData.customerName,
      }));
    };
    getUserData();
  }, [formData.mobileNumber || formData.mobileNumber.length < 10]);

  useEffect(() => {
    if (!data || !Array.isArray(data)) return;

    // If staff user is logged in, auto-select them
    if (user?.role === 'staff') {
      let me = null;
      if (user?.email) {
        me = data.find(
          (s) => String(s.email_id || '').toLowerCase() === String(user.email || '').toLowerCase()
        );
      }
      if (!me) {
        me = data.find((s) => String(s.id) === String(user.id));
      }

      if (me) {
        const staffMember = {
          id: me.id,
          staffName: me.staff_name,
          staffNumber: me.mobile_number,
          staffStatus: me.status,
        };
        setFormData((prev) => ({
          ...prev,
          staff: [staffMember], // Auto-select the logged-in staff member
        }));
        return;
      }
    }
  }, [data, user]);

  // Helper: format a Date to local yyyy-MM-dd string
  const toLocalYMD = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isStaffSelectionAllowed = () => {
    if (!formData.slotDate) return false;

    const selectedStr = String(formData.slotDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todayStr = toLocalYMD(today);
    const tomorrowStr = toLocalYMD(tomorrow);

    return selectedStr === todayStr || selectedStr === tomorrowStr;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear staff selection if date is changed to future date
    if (name === 'slotDate') {
      const selectedStr = String(value);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const todayStr = toLocalYMD(today);
      const tomorrowStr = toLocalYMD(tomorrow);

      const isAllowed = selectedStr === todayStr || selectedStr === tomorrowStr;

      if (!isAllowed) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          staff: [], // Clear staff selection
        }));
        return;
      }
    }
  };

  const handleStaffSelection = (selectedStaff) => {
    const isSelected = formData.staff.some((staff) => staff.id === selectedStaff.id);

    if (isSelected) {
      // Remove staff if already selected
      setFormData((prev) => ({
        ...prev,
        staff: prev.staff.filter((staff) => staff.id !== selectedStaff.id),
      }));
    } else {
      // Add staff if not selected and not busy
      if (selectedStaff.status?.toLowerCase() !== 'busy') {
        const staffMember = {
          id: selectedStaff.id,
          staffName: selectedStaff.staff_name,
          staffNumber: selectedStaff.mobile_number,
          staffStatus: selectedStaff.status,
        };
        setFormData((prev) => ({
          ...prev,
          staff: [...prev.staff, staffMember],
        }));
      }
    }
  };

  const removeStaffMember = (staffId) => {
    setFormData((prev) => ({
      ...prev,
      staff: prev.staff.filter((staff) => staff.id !== staffId),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields before submission
    if (
      !formData.customerName ||
      !formData.mobileNumber ||
      !formData.slotDate ||
      !formData.slotTime ||
      !formData.service
    ) {
      alert('Please fill in all required fields.');
      return;
    }

    await createNewAppointment(formData, 'busy', onCancel, isNewUser);
    await sendWhatsappAfterAppointment(
      user.profile.store_id,
      user?.profile?.salon_name || 'Botivate',
      formData.mobileNumber,
      formData.customerName
    );
  };
  const availableStaff =
    data?.filter(
      (staff) => isStaffSelectionAllowed() && !loading && staff.status?.toLowerCase() !== 'busy'
    ) || [];

  const busyStaff =
    data?.filter(
      (staff) => isStaffSelectionAllowed() && !loading && staff.status?.toLowerCase() === 'busy'
    ) || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Customer Information */}
      <div>
        <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
          <User className="mr-2 h-5 w-5" />
          Customer Information
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Mobile Number</label>
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
            <label className="mb-2 block text-sm font-medium text-gray-700">Customer Name</label>
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
            <label className="mb-2 block text-sm font-medium text-gray-700">Slot Date</label>
            <input
              name="slotDate"
              type="date"
              value={formData.slotDate}
              onChange={handleChange}
              className={`w-full rounded-lg border px-4 py-3 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                errors.slotDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.slotDate && <p className="mt-1 text-sm text-red-500">{errors.slotDate}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Slot Time</label>
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
            {errors.slotTime && <p className="mt-1 text-sm text-red-500">{errors.slotTime}</p>}
          </div>
        </div>
      </div>

      {/* Staff Information - Multi-Select */}
      <div>
        <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
          <User className="mr-2 h-5 w-5" />
          Staff Information
        </h3>

        {/* Selected Staff Display */}
        {formData.staff.length > 0 && (
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Selected Staff ({formData.staff.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {formData.staff.map((staff) => (
                <div
                  key={staff.id}
                  className="flex items-center rounded-lg border border-blue-200 bg-blue-100 px-3 py-2 text-sm"
                >
                  <span className="text-blue-800">
                    {staff.staffName} ({staff.staffStatus})
                  </span>
                  {user?.role !== 'staff' && (
                    <button
                      type="button"
                      onClick={() => removeStaffMember(staff.id)}
                      className="ml-2 text-blue-600 transition-colors hover:text-blue-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Staff Selection Dropdown */}
        <div className="relative">
          <label className="mb-2 block text-sm font-medium text-gray-700">Add Staff Members</label>
          <button
            type="button"
            disabled={user?.role === 'staff' || !isStaffSelectionAllowed() || loading}
            onClick={() => setIsStaffDropdownOpen(!isStaffDropdownOpen)}
            className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-all ${
              !isStaffSelectionAllowed()
                ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                : 'border-gray-300 hover:border-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500'
            }`}
          >
            <span>
              {!isStaffSelectionAllowed()
                ? 'Staff selection only available for today and tomorrow'
                : loading
                  ? 'Loading staff...'
                  : 'Select staff members (Optional)'}
            </span>
            {isStaffSelectionAllowed() && !loading && (
              <ChevronDown
                className={`h-5 w-5 transition-transform ${
                  isStaffDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            )}
          </button>

          {/* Dropdown Options */}
          {isStaffDropdownOpen && isStaffSelectionAllowed() && !loading && (
            <div className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg">
              {/* Available Staff */}
              {availableStaff.length > 0 && (
                <div className="p-2">
                  <div className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
                    Available Staff
                  </div>
                  {availableStaff.map((staff) => {
                    const isSelected = formData.staff.some((s) => s.id === staff.id);
                    return (
                      <button
                        key={staff.id}
                        type="button"
                        onClick={() => handleStaffSelection(staff)}
                        className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left transition-colors ${
                          isSelected
                            ? 'border border-blue-200 bg-blue-50 text-blue-700'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className="flex items-center">
                          <span className="font-medium">{staff.staff_name}</span>
                          <span className="ml-2 text-sm font-medium text-green-600">
                            ({staff.status})
                          </span>
                        </span>
                        {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Busy Staff */}
              {busyStaff.length > 0 && (
                <div className="border-t border-gray-100 p-2">
                  <div className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
                    Unavailable Staff
                  </div>
                  {busyStaff.map((staff) => (
                    <div
                      key={staff.id}
                      className="flex cursor-not-allowed items-center justify-between px-3 py-2 text-gray-400"
                    >
                      <span className="flex items-center">
                        <span className="font-medium">{staff.staff_name}</span>
                        <span className="ml-2 text-sm font-medium text-red-500">
                          ({staff.status})
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {availableStaff.length === 0 && busyStaff.length === 0 && (
                <div className="p-4 text-center text-gray-500">No staff members found</div>
              )}
            </div>
          )}
        </div>

        {/* Click outside to close dropdown */}
        {isStaffDropdownOpen && (
          <div className="fixed inset-0 z-5" onClick={() => setIsStaffDropdownOpen(false)} />
        )}

        {errors.staff && <p className="mt-1 text-sm text-red-500">{errors.staff}</p>}
      </div>

      {/* Service Information */}
      <div>
        <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
          <CreditCard className="mr-2 h-5 w-5" />
          Service Information
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Service</label>
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

            {errors.service && <p className="mt-1 text-sm text-red-500">{errors.service}</p>}
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
  );
};

export default AddNewAppointment;
