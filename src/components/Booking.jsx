'use client'

import { format, isValid, parse } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import { History, Plus, Search, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  useGetallAppointmentData,
  useUpdateAppointmentById,
  useGetAllAppointmentsHistory,
} from '../hook/dbOperation.js'
import BookingForm from './Booking/BookingForm'
import BookingHistoryModal from './Booking/BookingHistoryModal'
import BookingList from './Booking/BookingList'
import BookingStats from './Booking/BookingStats'
import Notification from './Booking/Notification'
import { useAppData } from '../zustand/appData'
import AddNewAppointment from './Booking/addNewAppointment.component.jsx'
import { useAuth } from '@/Context/AuthContext.jsx'

// Constants
const NOTIFICATION_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
}

const STATUS_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
}

const Booking = ({ hideHistoryButton = false }) => {
  const { user } = useAuth()
  const isStaff = user?.role === 'staff'

  // Global state
  const { appointments, setAppointments } = useAppData()

  // Local state - grouped by purpose
  const [dataState, setDataState] = useState({
    allAppointments: [],
    tableHeaders: [],
    staffData: [],
    serviceData: [],
    error: null,
  })

  const [uiState, setUiState] = useState({
    showNewAppointmentForm: false,
    showEditAppointmentForm: false,
    showHistoryModal: false,
    submitting: false,
    searchTerm: '',
    historySearchTerm: '',
  })

  const [formState, setFormState] = useState({
    newAppointment: {},
    editingAppointment: {},
  })

  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: '',
  })

  const { loading } = useGetallAppointmentData()

  // Memoized values
  const sheetConfig = useMemo(
    () => ({
      sheetId: user?.sheetId || '1ghSQ9d2dfSotfnh8yrkiqIT00kg_ej7n0pnygzP0B9w',
      scriptUrl:
        user?.appScriptUrl ||
        'https://script.google.com/macros/s/AKfycbx-5-79dRjYuTIBFjHTh3_Q8WQa0wWrRKm7ukq5854ET9OCHiAwno-gL1YmZ9juotMH/exec',
      sheetName: 'Booking DB',
      staffSheetName: 'Staff DB',
      serviceSheetName: 'Service DB',
    }),
    [user]
  )

  // Memoized stats calculation
  const stats = useMemo(() => {
    if (!appointments.length) {
      return { today: 0, upcoming: 0, totalClients: 0 }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const filteredRows = appointments.filter((row) => {
      const dateStr =
        row.date ||
        row['Slot Date'] ||
        row['Date'] ||
        row['Appointment Date'] ||
        row.slotDate ||
        ''
      if (!dateStr) return false

      const parsedDate = parse(dateStr, 'yyyy-MM-dd', new Date())
      if (!isValid(parsedDate)) return false

      parsedDate.setHours(0, 0, 0, 0)
      const isCurrentOrFuture = parsedDate >= today

      if (isStaff) {
        const staffName = (
          row.staffName ||
          row['Staff Name'] ||
          row.staff ||
          row['Assigned Staff'] ||
          ''
        )
          .toString()
          .trim()
          .toLowerCase()
        const userStaffName = (user.staffName || '')
          .toString()
          .trim()
          .toLowerCase()
        return (
          isCurrentOrFuture &&
          (staffName === userStaffName ||
            staffName.includes(userStaffName) ||
            userStaffName.includes(staffName))
        )
      }
      return isCurrentOrFuture
    })

    const todaysAppts = filteredRows.filter((row) => {
      const dateStr =
        row.date ||
        row['Slot Date'] ||
        row['Date'] ||
        row['Appointment Date'] ||
        row.slotDate ||
        ''
      const parsedDate = parse(dateStr, 'yyyy-MM-dd', new Date())
      return (
        isValid(parsedDate) &&
        parsedDate.toDateString() === today.toDateString()
      )
    }).length

    const upcomingAppts = filteredRows.filter((row) => {
      const dateStr =
        row.date ||
        row['Slot Date'] ||
        row['Date'] ||
        row['Appointment Date'] ||
        row.slotDate ||
        ''
      const parsedDate = parse(dateStr, 'yyyy-MM-dd', new Date())
      return isValid(parsedDate) && parsedDate > today
    }).length

    return {
      today: todaysAppts,
      upcoming: upcomingAppts,
      totalClients: todaysAppts + upcomingAppts,
    }
  }, [appointments, isStaff, user])

  // Memoized filtered appointments
  const filteredAppointments = useMemo(() => {
    if (!uiState.searchTerm) return appointments

    return appointments.filter((appointment) =>
      Object.values(appointment).some((value) =>
        value
          ?.toString()
          .toLowerCase()
          .includes(uiState.searchTerm.toLowerCase())
      )
    )
  }, [appointments, uiState.searchTerm])

  const { data: allHistoryAppointments, loading: historyLoading, error: historyError } = useGetAllAppointmentsHistory()

  const filteredHistoryAppointments = useMemo(() => {
    let baseAppointments = allHistoryAppointments || []

    // Show ALL appointments for history modal (no staff filtering for history)
    // Filter by search term only
    if (!uiState.historySearchTerm) return baseAppointments

    return baseAppointments.filter((appointment) =>
      Object.values(appointment).some((value) =>
        value
          ?.toString()
          .toLowerCase()
          .includes(uiState.historySearchTerm.toLowerCase())
      )
    )
  }, [allHistoryAppointments, uiState.historySearchTerm])

  // Create table headers from appointment data for history modal
  const historyTableHeaders = useMemo(() => {
    if (!allHistoryAppointments || allHistoryAppointments.length === 0) return []
    
    const sampleAppointment = allHistoryAppointments[0]
    return Object.keys(sampleAppointment)
      .filter(key => !key.startsWith('_') && key !== 'id' && key !== 'store_id')
      .map(key => ({
        id: key,
        label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
      }))
  }, [allHistoryAppointments])

  // Utility functions
  const getStaffNumberByName = useCallback(
    (staffName) => {
      const staff = dataState.staffData.find(
        (s) => s.name.toLowerCase() === staffName.toLowerCase()
      )
      return staff?.number || ''
    },
    [dataState.staffData]
  )

  const getServicePriceByName = useCallback(
    (serviceName) => {
      const service = dataState.serviceData.find(
        (s) => s.name.toLowerCase() === serviceName.toLowerCase()
      )
      return service?.price || ''
    },
    [dataState.serviceData]
  )

  const showNotification = useCallback((message, type) => {
    setNotification({ show: true, message, type })
    const duration =
      type === STATUS_TYPES.SUCCESS
        ? NOTIFICATION_DURATION.SUCCESS
        : NOTIFICATION_DURATION.ERROR
    setTimeout(
      () => setNotification({ show: false, message: '', type: '' }),
      duration
    )
  }, [])

  const formatForSheet = useCallback((value, header) => {
    if (!value) return ''

    if (header.type === 'date' || header.label.toLowerCase().includes('date')) {
      const parsed = parse(value, 'yyyy-MM-dd', new Date())
      return isValid(parsed) ? format(parsed, 'dd/MM/yyyy') : value
    }

    if (
      header.label.toLowerCase().includes('time') &&
      !header.label.toLowerCase().includes('timestamp')
    ) {
      const parsed = parse(value, 'HH:mm', new Date())
      return isValid(parsed) ? format(parsed, 'h:mm a') : value
    }

    return value
  }, [])

  const createEmptyAppointment = useCallback(() => {
    const emptyAppointment = {}
    dataState.tableHeaders.forEach((header) => {
      emptyAppointment[header.id] = header.label
        .toLowerCase()
        .includes('status')
        ? 'Confirmed'
        : ''

      if (
        header.label.toLowerCase().includes('date') &&
        !header.label.toLowerCase().includes('timestamp')
      ) {
        emptyAppointment[header.id] = format(new Date(), 'yyyy-MM-dd')
      }

      if (
        isStaff &&
        header.label.toLowerCase().includes('staff') &&
        header.label.toLowerCase().includes('name')
      ) {
        emptyAppointment[header.id] = user.staffName || ''
        const staffNumberHeader = dataState.tableHeaders.find(
          (h) =>
            h.label.toLowerCase().includes('staff') &&
            h.label.toLowerCase().includes('number')
        )
        if (staffNumberHeader) {
          const staff = dataState.staffData.find(
            (s) => s.name.toLowerCase() === user.staffName?.toLowerCase()
          )
          emptyAppointment[staffNumberHeader.id] = staff?.number || ''
        }
      }
    })
    return emptyAppointment
  }, [dataState.tableHeaders, dataState.staffData, isStaff, user])

  // Event handlers
  const handleNewAppointmentClick = useCallback(() => {
    const emptyAppointment = createEmptyAppointment()
    setFormState((prev) => ({ ...prev, newAppointment: emptyAppointment }))
    setUiState((prev) => ({ ...prev, showNewAppointmentForm: true }))
  }, [createEmptyAppointment])

  const handleInputChange = useCallback(
    (e, isEdit = false) => {
      const { name, value } = e.target
      const stateKey = isEdit ? 'editingAppointment' : 'newAppointment'

      setFormState((prev) => {
        const updated = { ...prev[stateKey], [name]: value }

        // Auto-populate staff number if staff name is selected
        const isStaffNameField = dataState.tableHeaders.some(
          (h) =>
            h.id === name &&
            h.label.toLowerCase().includes('staff') &&
            h.label.toLowerCase().includes('name')
        )
        if (isStaffNameField) {
          const staffNumberHeader = dataState.tableHeaders.find(
            (h) =>
              h.label.toLowerCase().includes('staff') &&
              h.label.toLowerCase().includes('number')
          )
          if (staffNumberHeader) {
            updated[staffNumberHeader.id] = getStaffNumberByName(value)
          }
        }

        // Auto-populate service price if service is selected
        const isServiceField = dataState.tableHeaders.some(
          (h) =>
            h.id === name &&
            h.label.toLowerCase().includes('services') &&
            !h.label.toLowerCase().includes('price')
        )
        if (isServiceField) {
          const servicePriceHeader = dataState.tableHeaders.find(
            (h) =>
              h.label.toLowerCase().includes('service') &&
              h.label.toLowerCase().includes('price')
          )
          if (servicePriceHeader) {
            updated[servicePriceHeader.id] = getServicePriceByName(value)
          }
        }

        return { ...prev, [stateKey]: updated }
      })
    },
    [dataState.tableHeaders, getStaffNumberByName, getServicePriceByName]
  )

  const handleEditClick = useCallback(
    (appointment) => {
      const prepared = { ...appointment }
      dataState.tableHeaders.forEach((header) => {
        if (
          header.type === 'date' ||
          header.label.toLowerCase().includes('date')
        ) {
          if (prepared[header.id]) {
            const parsed = parse(prepared[header.id], 'dd/MM/yyyy', new Date())
            prepared[header.id] = isValid(parsed)
              ? format(parsed, 'yyyy-MM-dd')
              : prepared[header.id]
          }
        }
        if (
          header.label.toLowerCase().includes('time') &&
          !header.label.toLowerCase().includes('timestamp')
        ) {
          if (prepared[header.id]) {
            const parsed = parse(prepared[header.id], 'h:mm a', new Date())
            prepared[header.id] = isValid(parsed)
              ? format(parsed, 'HH:mm')
              : prepared[header.id]
          }
        }
      })
      setFormState((prev) => ({ ...prev, editingAppointment: prepared }))
      setUiState((prev) => ({ ...prev, showEditAppointmentForm: true }))
    },
    [dataState.tableHeaders]
  )

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      setUiState((prev) => ({ ...prev, submitting: true }))

      try {
        const formattedAppointment = { ...formState.newAppointment }
        dataState.tableHeaders.forEach((header) => {
          formattedAppointment[header.id] = formatForSheet(
            formattedAppointment[header.id],
            header
          )
        })

        const rowData = dataState.tableHeaders.map(
          (header) => formattedAppointment[header.id] || ''
        )
        rowData[0] = format(new Date(), 'dd/MM/yyyy') // Timestamp

        const formData = new FormData()
        formData.append('rowData', JSON.stringify(rowData))

        


        const newAppointmentWithId = {
          ...formattedAppointment,
          _id: Math.random().toString(36).substring(2, 15),
        }
        setAppointments((prev) => [newAppointmentWithId, ...prev])

        // Reset form and close modal
        setUiState((prev) => ({
          ...prev,
          showNewAppointmentForm: false,
          submitting: false,
        }))
        setFormState((prev) => ({
          ...prev,
          newAppointment: createEmptyAppointment(),
        }))
        showNotification(
          'Appointment added successfully!',
          STATUS_TYPES.SUCCESS
        )
      } catch (error) {
        setUiState((prev) => ({ ...prev, submitting: false }))
        showNotification(
          `Failed to add appointment: ${error.message}`,
          STATUS_TYPES.ERROR
        )
      }
    },
    [
      formState.newAppointment,
      dataState.tableHeaders,
      formatForSheet,
      sheetConfig.scriptUrl,
      setAppointments,
      createEmptyAppointment,
      showNotification,
    ]
  )

  const handleEditSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      setUiState((prev) => ({ ...prev, submitting: true }))

      try {
        const { editingAppointment } = formState
        const idHeader = dataState.tableHeaders.find(
          (h) => h.label.toLowerCase() === 'id' || h.id === 'id'
        )
        const statusHeader = dataState.tableHeaders.find((h) =>
          h.label.toLowerCase().includes('status')
        )
        const staffNameHeader = dataState.tableHeaders.find(
          (h) =>
            h.label.toLowerCase().includes('staff') &&
            h.label.toLowerCase().includes('name')
        )
        const staffNumberHeader = dataState.tableHeaders.find(
          (h) =>
            h.label.toLowerCase().includes('staff') &&
            h.label.toLowerCase().includes('number')
        )

        const id =
          editingAppointment?.[idHeader?.id] ||
          editingAppointment?.id ||
          editingAppointment?.recordId
        if (!id) throw new Error('Missing ID')

        const statusRaw = statusHeader
          ? editingAppointment?.[statusHeader.id]
          : editingAppointment?.bookingStatus || ''
        const status = statusRaw ? String(statusRaw).toLowerCase() : undefined
        const staffName = staffNameHeader
          ? editingAppointment?.[staffNameHeader.id]
          : editingAppointment?.staffName
        const staffNumber = staffNumberHeader
          ? editingAppointment?.[staffNumberHeader.id]
          : editingAppointment?.staffNumber

        // Update appointments in state
        setAppointments((prev) =>
          prev.map((appt) => {
            if (appt._id !== editingAppointment._id) return appt
            const next = { ...appt }
            if (statusHeader && typeof statusRaw !== 'undefined') {
              next[statusHeader.id] =
                editingAppointment[statusHeader.id] ??
                editingAppointment.bookingStatus
            }
            if (staffNameHeader && staffName)
              next[staffNameHeader.id] = staffName.toString().trim()
            if (staffNumberHeader && staffNumber)
              next[staffNumberHeader.id] = staffNumber.toString().trim()
            return next
          })
        )

        setUiState((prev) => ({
          ...prev,
          showEditAppointmentForm: false,
          submitting: false,
        }))
        showNotification(
          'Appointment updated successfully!',
          STATUS_TYPES.SUCCESS
        )
      } catch (error) {
        setUiState((prev) => ({ ...prev, submitting: false }))
        showNotification(
          `Failed to update appointment: ${error.message}`,
          STATUS_TYPES.ERROR
        )
      }
    },
    [
      formState.editingAppointment,
      dataState.tableHeaders,
      setAppointments,
      showNotification,
    ]
  )

  // Data fetching effect
  useEffect(() => {
    const fetchGoogleSheetData = async () => {
      try {
        if (appointments && appointments.length > 0) {
          // Determine headers
          const headers = Object.keys(appointments[0])
            .map((key) => ({
              id: key,
              label: key,
              type: key.toLowerCase().includes('date') ? 'date' : 'text',
            }))
            .filter((header) => header.label)

          // Prepare row data
          const rowsData = appointments.map((row, index) => ({
            _id: row._id || Math.random().toString(36).substring(2, 15),
            _rowIndex: index + 2,
            ...row,
          }))

          // Update state in batch
          setDataState((prev) => ({
            ...prev,
            tableHeaders: headers,
            allAppointments: rowsData,
            error: null,
          }))
        }
      } catch (error) {
        setDataState((prev) => ({
          ...prev,
          error: 'Failed to load appointment data',
        }))
        console.error('Error fetching data:', error)
      }
    }

    fetchGoogleSheetData()
  }, [appointments.length])

  // Update form when headers changep
  useEffect(() => {
    if (dataState.tableHeaders.length > 0) {
      setFormState((prev) => ({
        ...prev,
        newAppointment: createEmptyAppointment(),
      }))
    }
  }, [dataState.tableHeaders, createEmptyAppointment])

  // UI update handlers
  const updateUiState = useCallback((updates) => {
    setUiState((prev) => ({ ...prev, ...updates }))
  }, [])

  const closeNotification = useCallback(() => {
    setNotification({ show: false, message: '', type: '' })
  }, [])

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
        <div className="flex flex-col gap-5 md:items-center md:justify-between lg:flex-row lg:gap-0">
          <h2 className="text-center text-2xl font-bold text-blue-800">
            Appointments
          </h2>
          <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row md:mt-0">
            <div className="relative">
              <Search
                className="absolute top-1/2 left-3 -translate-y-1/2 transform text-blue-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search appointments..."
                className="w-full rounded-md bg-white py-2 pr-4 pl-10 focus:outline-none"
                value={uiState.searchTerm}
                onChange={(e) => updateUiState({ searchTerm: e.target.value })}
              />
            </div>
            <div className="flex space-x-2">
              {!isStaff && (
                <button
                  className="flex items-center justify-center gap-3 rounded-md bg-blue-600 px-4 py-2 text-white hover:cursor-pointer hover:bg-blue-700"
                  onClick={handleNewAppointmentClick}
                >
                  <Plus className="hidden lg:inline" size={18} />
                  <span className="text-nowrap">New Appointment</span>
                </button>
              )}
              {!hideHistoryButton && (
                <button
                  className="flex items-center justify-center gap-3 rounded-md bg-red-600 px-4 py-2 text-white hover:cursor-pointer hover:bg-red-700"
                  onClick={() => updateUiState({ showHistoryModal: true })}
                >
                  <History size={18} className="hidden lg:inline" />
                  <span>History</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <BookingStats stats={stats} />

        {/* Main Content */}
        {loading ? (
          <div className="py-10 text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-blue-600">Loading appointments...</p>
          </div>
        ) : dataState.error ? (
          <div className="rounded-md p-4 text-center text-red-800">
            {dataState.error}
            <button
              className="ml-2 underline"
              onClick={() => window.location.reload()}
            >
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
                <div className="border-b p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-black">
                      Add New Appointment
                    </h3>
                    <button
                      className="text-red-500 transition-colors duration-200 hover:cursor-pointer hover:text-red-700"
                      onClick={() =>
                        updateUiState({ showNewAppointmentForm: false })
                      }
                    >
                      <X />
                    </button>
                  </div>
                </div>
                <div className="hideScrollBar flex-1 overflow-y-auto p-6">
                  <AddNewAppointment
                    tableHeaders={dataState.tableHeaders}
                    formData={formState.newAppointment}
                    onChange={(e) => handleInputChange(e, false)}
                    onSubmit={handleSubmit}
                    onCancel={() =>
                      updateUiState({ showNewAppointmentForm: false })
                    }
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
                <div className="border-b p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-black">
                      Edit Appointment
                    </h3>
                    <button
                      className="text-red-500 transition-colors duration-200 hover:cursor-pointer hover:text-red-700"
                      onClick={() =>
                        updateUiState({ showEditAppointmentForm: false })
                      }
                    >
                      <X />
                    </button>
                  </div>
                </div>
                <div className="hideScrollBar flex-1 overflow-y-auto p-6">
                  <BookingForm
                    tableHeaders={dataState.tableHeaders}
                    formData={formState.editingAppointment}
                    onChange={(e) => handleInputChange(e, true)}
                    onSubmit={handleEditSubmit}
                    onCancel={() =>
                      updateUiState({ showEditAppointmentForm: false })
                    }
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
          setHistorySearchTerm={(term) =>
            updateUiState({ historySearchTerm: term })
          }
          loading={historyLoading}
          error={historyError}
        />

        <AnimatePresence>
          {notification.show && (
            <Notification
              notification={notification}
              onClose={closeNotification}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}

export default Booking
