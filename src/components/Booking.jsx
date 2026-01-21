'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, History, Plus, Search, X, Phone, MapPin } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useGetallAppointmentData,
  useGetAllAppointmentsHistory,
  useGetStaffData,
} from '../hook/dbOperation.js';
import BookingForm from './Booking/BookingForm';
import BookingHistoryModal from './Booking/BookingHistoryModal';
import BookingList from './Booking/BookingList';
import Notification from './Booking/Notification';
import { useAppData } from '../zustand/appData';
import AddNewAppointment from './Booking/addNewAppointment.component.jsx';
import { useAuth } from '@/Context/AuthContext.jsx';

// Constants
const NOTIFICATION_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
};

const STATUS_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
};

const Booking = ({ hideHistoryButton = false }) => {
  const { user } = useAuth();
  const isStaff = user?.role === 'staff';
  const { data: staffData, loading: staffLoading } = useGetStaffData();

  // Global state
  const { appointments, setAppointments } = useAppData();

  // console.log(appointments, 'appointmentdat');

  // Local state - grouped by purpose
  const [dataState, setDataState] = useState({
    tableHeaders: [],
    error: null,
  });

  const [uiState, setUiState] = useState({
    showNewAppointmentForm: false,
    showEditAppointmentForm: false,
    showHistoryModal: false,
    submitting: false,
    searchTerm: '',
    historySearchTerm: '',
  });

  const [formState, setFormState] = useState({
    newAppointment: {},
    editingAppointment: {},
  });

  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: '',
  });

  // Notification helpers must be defined before hooks that depend on them
  const showNotification = useCallback((message, type) => {
    setNotification({ show: true, message, type });
    const duration =
      type === STATUS_TYPES.ERROR ? NOTIFICATION_DURATION.ERROR : NOTIFICATION_DURATION.SUCCESS;
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, duration);
  }, []);

  const { loading } = useGetallAppointmentData();

  // Staff-only filtering base list
  const staffFilteredAppointments = useMemo(() => {
    if (!Array.isArray(appointments)) return [];
    if (!isStaff) return appointments;
    if (staffLoading) return appointments;

    // Resolve staff identity from staff_info using email first, then id
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
      .filter(Boolean)
      .map((s) => String(s).trim().toLowerCase());

    const mobiles = [me?.mobile_number]
      .filter(Boolean)
      .map((s) => String(s).trim());

    const matchById = (apt) => {
      if (ids.length === 0) return false;
      // Prefer staff_information array
      if (Array.isArray(apt?.staff_information) && apt.staff_information.length > 0) {
        return apt.staff_information.some((s) => ids.includes(String(s?.id ?? '')));
      }
      // Fallback to legacy single staff_id
      return ids.includes(String(apt?.staff_id ?? ''));
    };

    const matchByName = (apt) => {
      if (names.length === 0) return false;
      // Prefer staff_information array
      if (Array.isArray(apt?.staff_information) && apt.staff_information.length > 0) {
        return apt.staff_information.some((s) =>
          names.includes(String(s?.staffName ?? '').trim().toLowerCase())
        );
      }
      const legacyStaffName = (
        apt?.staffName || apt?.['Staff Name'] || apt?.staff || apt?.['Assigned Staff'] || ''
      )
        .toString()
        .trim()
        .toLowerCase();
      return names.includes(legacyStaffName);
    };

    const matchByMobile = (apt) => {
      if (mobiles.length === 0) return false;
      // Prefer staff_information array
      if (Array.isArray(apt?.staff_information) && apt.staff_information.length > 0) {
        return apt.staff_information.some((s) =>
          mobiles.includes(String(s?.staffNumber ?? '').trim())
        );
      }
      const legacyNumber = String(apt?.['Staff Number'] ?? '').trim();
      return mobiles.includes(legacyNumber);
    };

    const filtered = appointments.filter(
      (apt) => matchById(apt) || matchByName(apt) || matchByMobile(apt)
    );

    // Debug logging to assist diagnosis if still empty
    if (filtered.length === 0) {
      // eslint-disable-next-line no-console
      console.log('[Staff Filter Debug]', {
        user: { id: user?.id, email: user?.email, staffName: user?.staffName },
        me,
        ids,
        names,
        mobiles,
        sampleAppointment: appointments[0],
      });
    }

    return filtered;
  }, [appointments, isStaff, user, staffData, staffLoading]);

  // Memoized filtered appointments (search on top of staff filter)
  const filteredAppointments = useMemo(() => {
    const base = staffFilteredAppointments;
    if (!uiState.searchTerm) return base;

    return base.filter((appointment) =>
      Object.values(appointment).some((value) =>
        value?.toString().toLowerCase().includes(uiState.searchTerm.toLowerCase())
      )
    );
  }, [staffFilteredAppointments, uiState.searchTerm]);

  const {
    data: allHistoryAppointments,
    loading: historyLoading,
    error: historyError,
  } = useGetAllAppointmentsHistory();

  const filteredHistoryAppointments = useMemo(() => {
    let baseAppointments = allHistoryAppointments || [];

    // Show ALL appointments for history modal (no staff filtering for history)
    // Filter by search term only
    if (!uiState.historySearchTerm) return baseAppointments;

    return baseAppointments.filter((appointment) =>
      Object.values(appointment).some((value) =>
        value?.toString().toLowerCase().includes(uiState.historySearchTerm.toLowerCase())
      )
    );
  }, [allHistoryAppointments, uiState.historySearchTerm]);

  // Create table headers from appointment data for history modal
  const historyTableHeaders = useMemo(() => {
    if (!allHistoryAppointments || allHistoryAppointments.length === 0) return [];

    const sampleAppointment = allHistoryAppointments[0];
    return Object.keys(sampleAppointment)
      .filter((key) => !key.startsWith('_') && key !== 'id' && key !== 'store_id')
      .map((key) => ({
        id: key,
        label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()),
      }));
  }, [allHistoryAppointments]);

  // Utility functions
  const createEmptyAppointment = useCallback(() => {
    // With Google Sheets removed, we keep a simple empty object as the form model
    return {};
  }, []);

  // Event handlers
  const handleNewAppointmentClick = useCallback(() => {
    const emptyAppointment = createEmptyAppointment();
    setFormState((prev) => ({ ...prev, newAppointment: emptyAppointment }));
    setUiState((prev) => ({ ...prev, showNewAppointmentForm: true }));
  }, [createEmptyAppointment]);

  const handleInputChange = useCallback((e, isEdit = false) => {
    const { name, value } = e.target;
    const stateKey = isEdit ? 'editingAppointment' : 'newAppointment';

    setFormState((prev) => {
      const updated = { ...prev[stateKey], [name]: value };
      return { ...prev, [stateKey]: updated };
    });
  }, []);

  const handleEditClick = useCallback((appointment) => {
    // Simplified: directly load the appointment into edit state
    const prepared = { ...appointment };
    setFormState((prev) => ({ ...prev, editingAppointment: prepared }));
    setUiState((prev) => ({ ...prev, showEditAppointmentForm: true }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setUiState((prev) => ({ ...prev, submitting: true }));

      try {
        const newAppointmentWithId = {
          ...formState.newAppointment,
          _id: Math.random().toString(36).substring(2, 15),
        };
        setAppointments((prev) => [newAppointmentWithId, ...prev]);

        // Reset form and close modal
        setUiState((prev) => ({
          ...prev,
          showNewAppointmentForm: false,
          submitting: false,
        }));
        setFormState((prev) => ({
          ...prev,
          newAppointment: createEmptyAppointment(),
        }));
        showNotification('Appointment added successfully!', STATUS_TYPES.SUCCESS);
      } catch (error) {
        setUiState((prev) => ({ ...prev, submitting: false }));
        showNotification(`Failed to add appointment: ${error.message}`, STATUS_TYPES.ERROR);
      }
    },
    [formState.newAppointment, setAppointments, createEmptyAppointment, showNotification]
  );

  const handleEditSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setUiState((prev) => ({ ...prev, submitting: true }));

      try {
        const { editingAppointment } = formState;
        const idHeader = dataState.tableHeaders.find(
          (h) => h.label.toLowerCase() === 'id' || h.id === 'id'
        );
        const statusHeader = dataState.tableHeaders.find((h) =>
          h.label.toLowerCase().includes('status')
        );
        const staffNameHeader = dataState.tableHeaders.find(
          (h) => h.label.toLowerCase().includes('staff') && h.label.toLowerCase().includes('name')
        );
        const staffNumberHeader = dataState.tableHeaders.find(
          (h) => h.label.toLowerCase().includes('staff') && h.label.toLowerCase().includes('number')
        );

        const id =
          editingAppointment?.[idHeader?.id] ||
          editingAppointment?.id ||
          editingAppointment?.recordId;
        if (!id) throw new Error('Missing ID');

        const statusRaw = statusHeader
          ? editingAppointment?.[statusHeader.id]
          : editingAppointment?.bookingStatus || '';
        const status = statusRaw ? String(statusRaw).toLowerCase() : undefined;
        const staffName = staffNameHeader
          ? editingAppointment?.[staffNameHeader.id]
          : editingAppointment?.staffName;
        const staffNumber = staffNumberHeader
          ? editingAppointment?.[staffNumberHeader.id]
          : editingAppointment?.staffNumber;

        // Update appointments in state
        setAppointments((prev) =>
          prev.map((appt) => {
            if (appt._id !== editingAppointment._id) return appt;
            const next = { ...appt };
            if (statusHeader && typeof statusRaw !== 'undefined') {
              next[statusHeader.id] =
                editingAppointment[statusHeader.id] ?? editingAppointment.bookingStatus;
            }
            if (staffNameHeader && staffName)
              next[staffNameHeader.id] = staffName.toString().trim();
            if (staffNumberHeader && staffNumber)
              next[staffNumberHeader.id] = staffNumber.toString().trim();
            return next;
          })
        );

        setUiState((prev) => ({
          ...prev,
          showEditAppointmentForm: false,
          submitting: false,
        }));
        showNotification('Appointment updated successfully!', STATUS_TYPES.SUCCESS);
      } catch (error) {
        setUiState((prev) => ({ ...prev, submitting: false }));
        showNotification(`Failed to update appointment: ${error.message}`, STATUS_TYPES.ERROR);
      }
    },
    [formState.editingAppointment, dataState.tableHeaders, setAppointments, showNotification]
  );

  // Update form when headers changep
  useEffect(() => {
    if (dataState.tableHeaders.length > 0) {
      setFormState((prev) => ({
        ...prev,
        newAppointment: createEmptyAppointment(),
      }));
    }
  }, [dataState.tableHeaders, createEmptyAppointment]);

  // UI update handlers
  const updateUiState = useCallback((updates) => {
    setUiState((prev) => ({ ...prev, ...updates }));
  }, []);

  const closeNotification = useCallback(() => {
    setNotification({ show: false, message: '', type: '' });
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="p-6 mb-6 bg-white border border-gray-200 shadow-lg rounded-2xl shadow-gray-200/50"
        >
          {/* Header Section with Gradient Background */}
          <div className="relative p-4 mb-6 -m-2 border rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100/50">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl"></div>
            <div className="relative flex items-center">
              <div className="flex items-center justify-center w-10 h-10 mr-4 shadow-lg rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 shadow-blue-500/25">
                <Calendar size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text">
                  Appointments
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Manage and track your salon appointments
                </p>
              </div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Section */}
            <div className="flex-1 max-w-md">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Search
                    size={18}
                    className="text-gray-400 transition-colors duration-300 group-focus-within:text-blue-500"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={uiState.searchTerm}
                  onChange={(e) => updateUiState({ searchTerm: e.target.value })}
                  className="w-full py-3 pl-12 pr-4 text-gray-900 placeholder-gray-500 transition-all duration-300 ease-out border border-gray-200 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white hover:bg-white hover:border-gray-300"
                  aria-label="Search appointments"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {!isStaff && (
                <motion.button
                  onClick={handleNewAppointmentClick}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-3 font-medium text-white transition-all duration-300 ease-out shadow-lg md:px-6 group bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Create new appointment"
                >
                  <Plus

                    className="transition-transform duration-300 group-hover:rotate-90 size-4 md:size-6"
                  />
                  <span className="text-sm whitespace-nowrap">New Appointment</span>
                </motion.button>
              )}

              {!hideHistoryButton && (
                <motion.button
                  onClick={() => updateUiState({ showHistoryModal: true })}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 px-6 py-3 font-medium text-gray-700 transition-all duration-300 ease-out bg-white border border-gray-200 shadow-md group rounded-xl shadow-gray-200/50 hover:bg-gray-50 hover:text-gray-900 hover:shadow-lg hover:shadow-gray-200/60 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  aria-label="View appointment history"
                >
                  <History

                    className="text-gray-500 transition-colors duration-300 group-hover:text-gray-700 size-4 md:size-6"
                  />
                  <span className="text-sm whitespace-nowrap">History</span>
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
        {/* BookingStats removed as Google Sheets-related stats are no longer used */}

        {/* Main Content */}
        {loading ? (
          <div className="py-10 text-center">
            <div className="inline-block w-8 h-8 mb-4 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
            <p className="text-blue-600">Loading appointments...</p>
          </div>
        ) : dataState.error ? (
          <div className="p-4 text-center text-red-800 rounded-md">
            {dataState.error}
            <button className="ml-2 underline" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        ) : (
          <BookingList
            tableHeaders={dataState.tableHeaders}
            filteredAppointments={filteredAppointments}
            hideHistoryButton={hideHistoryButton}
            handleEditClick={handleEditClick}
            searchTerm={uiState.searchTerm}
            loading={loading}
          />
        )}

        {/* Modals */}
        <AnimatePresence>
          {uiState.showNewAppointmentForm && (
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.6)] backdrop-blur-sm md:p-4">
              <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl">
                <div className="p-6 border-b">
                  <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    {/* Left: Title + Contact Info */}
                    <div className="flex flex-col gap-2">
                      <h3 className="text-xl font-bold text-black">
                        Add New Appointment
                      </h3>

                      {(user?.profile?.phone_number || user?.profile?.address) && (
                        <div
                          className="
            flex flex-col gap-2 text-sm text-gray-700
            sm:flex-row sm:items-center sm:gap-6
          "
                        >
                          {user?.profile?.phone_number && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 shrink-0 text-blue-600" />
                              <span className="font-medium">
                                {user.profile.phone_number}
                              </span>
                            </div>
                          )}

                          {user?.profile?.address && (
                            <div className="flex items-start gap-2 sm:items-center">
                              <MapPin className="h-4 w-4 shrink-0 text-green-600 mt-0.5 sm:mt-0" />
                              <span className="font-medium leading-snug">
                                {user.profile.address}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Close Button */}
                    <button
                      className="
        absolute right-0 top-0
        text-red-500 transition-colors duration-200 hover:text-red-700
        sm:static
      "
                      onClick={() => updateUiState({ showNewAppointmentForm: false })}
                    >
                      <X />
                    </button>
                  </div>
                </div>
                <div className="flex-1 p-6 overflow-y-auto hideScrollBar">
                  <AddNewAppointment
                    tableHeaders={dataState.tableHeaders}
                    formData={formState.newAppointment}
                    onChange={(e) => handleInputChange(e, false)}
                    onSubmit={handleSubmit}
                    onCancel={() => updateUiState({ showNewAppointmentForm: false })}
                    submitting={uiState.submitting}
                    isEdit={false}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {uiState.showEditAppointmentForm && (
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.6)] p-4 backdrop-blur-sm">
              <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-black">Edit Appointment</h3>
                    <button
                      className="text-red-500 transition-colors duration-200 hover:cursor-pointer hover:text-red-700"
                      onClick={() => updateUiState({ showEditAppointmentForm: false })}
                    >
                      <X />
                    </button>
                  </div>
                </div>
                <div className="flex-1 p-6 overflow-y-auto hideScrollBar">
                  <BookingForm
                    tableHeaders={dataState.tableHeaders}
                    formData={formState.editingAppointment}
                    onChange={(e) => handleInputChange(e, true)}
                    onSubmit={handleEditSubmit}
                    onCancel={() => updateUiState({ showEditAppointmentForm: false })}
                    submitting={uiState.submitting}
                    isEdit={true}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <BookingHistoryModal
          show={uiState.showHistoryModal}
          onClose={() => updateUiState({ showHistoryModal: false })}
          tableHeaders={historyTableHeaders}
          filteredHistoryAppointments={filteredHistoryAppointments}
          historySearchTerm={uiState.historySearchTerm}
          setHistorySearchTerm={(term) => updateUiState({ historySearchTerm: term })}
          loading={historyLoading}
          error={historyError}
        />

        <AnimatePresence>
          {notification.show && (
            <Notification notification={notification} onClose={closeNotification} />
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default Booking;
