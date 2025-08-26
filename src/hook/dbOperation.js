import supabase from '../dataBase/connectdb'
import { useState, useEffect, useCallback } from 'react'
import { useAppData } from '../zustand/appData'

export const useGetallAppointmentData = () => {
  // const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { setAppointments, refreshAppointments } = useAppData()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dayAfterTomorrow = new Date()
  dayAfterTomorrow.setDate(today.getDate() + 2)
  dayAfterTomorrow.setHours(23, 59, 59, 999)

  const oneDayAgo = new Date()
  oneDayAgo.setDate(oneDayAgo.getDate() - 1)

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const { data: appointments, error } = await supabase
        .from('appointment')
        .select('*')
        .neq('Booking Status', 'completed')
        .or(
          `Booking Status.neq.cancelled, and(Booking Status.eq.cancelled, Slot Date.gte.${oneDayAgo.toISOString()})`
        )
        .gte('Slot Date', today.toISOString())
        .lt('Slot Date', dayAfterTomorrow.toISOString())

        .order('Slot Date', { ascending: false })

      if (error) throw error

      // setData(appointments || [])
      setAppointments([...appointments] || [])
      return [...appointments]
    } catch (err) {
      console.error('Error fetching appointments:', err)
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [refreshAppointments])

  return { loading, error, refetch: fetchAppointments }
}

export const useUpdateAppointmentById = () => {
  const [loading, setLoading] = useState(false)
  const setRefreshAppointments = useAppData(
    (state) => state.setRefreshAppointments
  )

  const getAppointments = async (id, updates, onCancel) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('appointment')
        .update({
          ['Booking Status']: updates.bookingStatus,
          ['Staff Name']: updates.staffName,
          ['Staff Number']: updates.staffNumber,
          ['Slot Date']: updates.slotDate,
          ['Slot Time']: updates.slotTime,
          ['Slot Number']: updates.slotNumber,
        })
        .eq('id', id)
        .select()

      if (error) throw error
      setRefreshAppointments()
      onCancel()
    } catch (error) {
      console.error('Error updating appointment:', error)
      setLoading(false)
      onCancel()
    }
  }
  return { getAppointments, loading }
}

export const useGetStaffData = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStaffData = async () => {
    try {
      setLoading(true)
      const { data } = await supabase
        .from('staff_info')
        .select('status,mobile_number,staff_name,id,status')

      setData(data)
    } catch (error) {
      setError('Failed to load staff data')
      console.error('Error fetching staff data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaffData()
  }, [])

  return { data, loading, error, refetch: fetchStaffData }
}

export const useUpdateStaffStatus = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // const updateStaffStatusById = async (id, status = 'busy') => {
  //   try {
  //     setLoading(true)
  //     const { data, error } = await supabase
  //       .from('staff_info')
  //       .update({ status })
  //       .eq('id', id)
  //       .select()
  //     if (error) throw error
  //     return data
  //   } catch (err) {
  //     console.error('Error updating staff status:', err)
  //     setError(err.message)
  //     return null
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const updateStaffStatusByName = async (staff_id, status = 'Active') => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('staff_info')
        .update({ status })
        .ilike('id', staff_id)
        .select()

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error updating staff status by name:', err)
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { updateStaffStatusByName, loading, error }
}

export const usegetUserByPhoneNumber = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getUserByPhoneNumber = async (phoneNumber) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('customer_info')
        .select('id, customer_name, mobile_number')
        .ilike('mobile_number', phoneNumber)
      if (error) throw error
      return data
    } catch (err) {
      console.error('Error fetching user by phone number:', err)
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { getUserByPhoneNumber, loading, error }
}

export const useGetServicesList = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState([])

  const getServices = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('hair_service')
        .select('service_name, base_price,time_duration')
      if (error) throw error
      setData(data)
    } catch (err) {
      console.error('Error fetching services:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    getServices()
  }, [])

  return { loading, error, data }
}

export const useCreatenewAppointment = () => {
  const setRefreshAppointments = useAppData(
    (state) => state.setRefreshAppointments
  )

  const [loading, setLoading] = useState(false)

  const createNewAppointment = async (
    appointmentData,
    newStatus,
    onCancel,
    isNewUser
  ) => {
    setLoading(true)

    try {
      // Validate that we have a valid staff ID before proceeding
      if (!appointmentData.id || appointmentData.id.trim() === '') {
        throw new Error('Staff ID is required and cannot be empty')
      }

      // Check if selected staff is busy
      const isStaffBusy = appointmentData.staffStatus?.toLowerCase() === 'busy'

      // Prepare appointment data with conditional staff_id
      const appointmentInsertData = {
        'Booking ID': appointmentData.bookingId,
        'Mobile Number': appointmentData.mobileNumber,
        'Customer Name': appointmentData.customerName,
        'Slot Date': appointmentData.slotDate,
        'Slot Number': appointmentData.slotNumber,
        'Slot Time': appointmentData.slotTime,
        'Staff Name': isStaffBusy ? '' : appointmentData.staffName,
        'Staff Number': isStaffBusy ? '' : appointmentData.staffNumber,
        Services: appointmentData.service,
        'Service Price': appointmentData.servicePrice,
        'Booking Status': appointmentData.bookingStatus,
        TimeStamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }

      // Only add staff_id if it's a valid UUID format
      if (appointmentData.id && appointmentData.id.trim() !== '') {
        appointmentInsertData.staff_id = appointmentData.id
      }
      if (isNewUser) {
        const { error } = await supabase.from('customer_info').insert({
          customer_name: appointmentData.customerName,
          mobile_number: appointmentData.mobileNumber,
          timestamp: new Date().toISOString(),
        })
        if (error) throw error
      }
      const { error } = await supabase
        .from('appointment')
        .insert(appointmentInsertData)

      if (!error) {
        setRefreshAppointments()
      }
      if (error) throw error

      // Only update staff status if we have a valid staff ID
      if (appointmentData.id && appointmentData.id.trim() !== '') {
        const { data: staffData, error: staffError } = await supabase
          .from('staff_info')
          .update({ status: newStatus })
          .eq('id', appointmentData.id)
        if (staffError) throw staffError
      }
    } catch (err) {
      console.error('Error creating new appointment:', err)
      return null
    } finally {
      setLoading(false)
      onCancel()
    }
  }

  return { createNewAppointment, loading }
}

export const useDoStaffStatusActive = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const dpApi = async (staff_id) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('staff_info')
        .update({ status: 'active' })
        .eq('id', staff_id)
        .select()
      if (error) throw error
      return data
    } catch (err) {
      console.error('Error updating staff status:', err)
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const doStaffStatusActive = async (staff_id, time, staffStatus) => {
    // Only proceed if staff is currently active and has a valid service time
    if (staffStatus.toLowerCase() === 'active') {
      const minutes = parseInt(time) || 0
      const timeInMilliseconds = minutes * 60 * 1000

      setTimeout(() => {
        dpApi(staff_id)
      }, timeInMilliseconds)
    }
  }

  return { doStaffStatusActive, loading, error }
}

//*  Running Appointment db operation starting form here

export const useGetRunningAppointment = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const refreshExtraServicesHookRefresh = useAppData(
    (state) => state.refreshExtraServicesHookRefresh
  )

  const getRunningAppointment = async () => {
    try {
      setLoading(true)
      // Define date range: from start of yesterday to start of day after tomorrow (exclusive)
      const now = new Date()
      const startOfYesterday = new Date(now)
      startOfYesterday.setDate(now.getDate() - 1)
      startOfYesterday.setHours(0, 0, 0, 0)

      const startOfDayAfterTomorrow = new Date(now)
      startOfDayAfterTomorrow.setDate(now.getDate() + 2)
      startOfDayAfterTomorrow.setHours(0, 0, 0, 0)

      const { data, error } = await supabase
        .from('appointment')
        .select('*')
        .eq('Booking Status', 'completed')
        .not('Staff Name', 'is', null)
        .neq('Staff Name', '')
        .or('status.is.null,status.neq.done') // ✅ null bhi allow aur 'done' ke alawa sab
        .gte('Slot Date', startOfYesterday.toISOString().split('T')[0])
        .lte('Slot Date', startOfDayAfterTomorrow.toISOString().split('T')[0])
        .order('Slot Date', { ascending: false })

      if (error) throw error
      setData(data)
    } catch (err) {
      console.error('Error fetching running appointments:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    getRunningAppointment()
  }, [refreshExtraServicesHookRefresh])

  return { loading, error, data }
}

export const useGetExtraServiceDataFetch = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const refreshExtraServicesHookRefresh = useAppData(
    (state) => state.refreshExtraServicesHookRefresh
  )

  const getExtraServiceData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('hair_service')
        .select('service_name,base_price')

      if (error) throw error
      setData(data)
    } catch (err) {
      console.error('Error fetching extra service data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    getExtraServiceData()
  }, [refreshExtraServicesHookRefresh])

  return { loading, error, data }
}

export const useCreateExtraService = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const setRefreshExtraServicesHookRefresh = useAppData(
    (state) => state.setRefreshExtraServicesHookRefresh
  )

  const createExtraService = async (appointmentId, updates, status) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('appointment')
        .update({
          status: status,
          extra_Services: updates,
        })
        .eq('id', appointmentId)
      if (error) throw error
      setRefreshExtraServicesHookRefresh()
      return data
    } catch (err) {
      console.error('Error updating running appointment:', err)
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { createExtraService, loading, error }
}

//* Appointment History

export const useGetSelectedExtraServiceDataForTransaction = () => {
  const refreshTransactionHookRefresh = useAppData(
    (state) => state.refreshTransactionHookRefresh
  )
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const getSelectedExtraServiceDataForTransaction = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('appointment')
        .select('*')
        .eq('status', 'done')
        .order('Slot Date', { ascending: false })
      if (error) throw error
      setData(data)
    } catch (err) {
      console.error('Error fetching selected extra service data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getSelectedExtraServiceDataForTransaction()
  }, [refreshTransactionHookRefresh])
  return { loading, error, data }
}

export const useCreateTransaction = () => {
  const setRefreshTransactionHookRefresh = useAppData(
    (state) => state.setRefreshTransactionHookRefresh
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createTransaction = async (payload) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('appointment')
        .update({
          transactions_status: payload.transactionStatus,
          transaction_note: payload.notes,
          transaction_id: payload.transactionId,
          transaction_final_amount: payload.totalDue,
          payment_method: payload.payment.method,
          transactions_date: new Date().toISOString(),
        })
        .eq('id', payload.appointmentId)
      if (error) throw error
      setRefreshTransactionHookRefresh()
      return data
    } catch (err) {
      console.error('Error updating running appointment:', err)
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { createTransaction, loading, error }
}

export const useGetHeaderCardData = () => {
  const refreshTransactionHookRefresh = useAppData(
    (state) => state.refreshTransactionHookRefresh
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState({ total: 0, average: 0, count: 0 })

  const getTotalRevenueAndAverageSale = async () => {
    try {
      setLoading(true)
      // Fetch amounts only; aggregate client-side to avoid PostgREST aggregate restriction
      const { data: rows, error } = await supabase
        .from('appointment')
        .select('transaction_final_amount')
        .not('transaction_final_amount', 'is', null)

      if (error) throw error
      const amounts = (rows || []).map(
        (r) => Number(r.transaction_final_amount) || 0
      )
      const total = amounts.reduce((acc, n) => acc + n, 0)
      const count = amounts.length
      const average = count ? total / count : 0
      setData({ total, average, count })
    } catch (err) {
      console.error('Error fetching selected extra service data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getTotalRevenueAndAverageSale()
  }, [refreshTransactionHookRefresh])
  return { loading, error, data }
}

export const useGetMonthlyEarnings = () => {
  const refreshTransactionHookRefresh = useAppData(
    (state) => state.refreshTransactionHookRefresh
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState()

  const getMonthlyEarnings = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('appointment')
        // Only fetch the amount for now; if date is needed later, use:
        // .select('transaction_final_amount, "Slot Date" as slot_date')
        .select('transaction_final_amount,created_at')
        .not('transaction_final_amount', 'is', null)

      if (error) throw error
      setData(data)
    } catch (err) {
      console.error('Error fetching selected extra service data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getMonthlyEarnings()
  }, [refreshTransactionHookRefresh])
  return { loading, error, data }
}

export const useGetSelectedExtraServiceDataForTransactionHistory = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const getSelectedExtraServiceDataForTransaction = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('appointment')
        .select('*')
        .eq('transactions_status', 'paid')
        .order('Slot Date', { ascending: false })
      if (error) throw error
      setData(data)
    } catch (err) {
      console.error('Error fetching selected extra service data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getSelectedExtraServiceDataForTransaction()
  }, [])
  return { loading, error, data }
}

//managing thie staff attendance

export const useStaffAttendance = (selectedDate) => {
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch attendance for selected date (show all staff even if no attendance yet)
  const fetchAttendance = async () => {
    setLoading(true)
    try {
      // 1) Fetch all staff
      const { data: staffList, error: staffErr } = await supabase
        .from('staff_info')
        .select('id, staff_name, position')
        .neq('delete_flag', true)
        .order('staff_name', { ascending: true })
      if (staffErr) throw staffErr

      // 2) Fetch attendance for the selected date
      const { data: attRows, error: attErr } = await supabase
        .from('staff_attendance')
        .select('staff_id, status, in_time, out_time, remark')
        .eq('date', selectedDate)
      if (attErr) throw attErr

      const attMap = new Map((attRows || []).map((r) => [r.staff_id, r]))

      // 3) Merge so every staff member appears
      const merged = (staffList || []).map((s) => {
        const a = attMap.get(s.id)
        return {
          id: a?.id, // attendance row id may be undefined if none
          staff_id: s.id,
          staff_name: s.staff_name,
          position: s.position,
          status: a?.status || 'absent',
          in_time: a?.in_time || null,
          out_time: a?.out_time || null,
          remark: a?.remark || '',
        }
      })

      setAttendance(merged)
    } catch (err) {
      console.error('Error fetching attendance:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  // Update staff status
  const updateStatus = async (
    staffId,
    newStatus,
    inTime = null,
    outTime = null,
    remark = ''
  ) => {
    try {
      // Try update first
      const { data: upd, error: updErr } = await supabase
        .from('staff_attendance')
        .update({
          status: newStatus,
          in_time: inTime,
          out_time: outTime,
          remark,
          update_at: new Date().toISOString(),
        })
        .eq('staff_id', staffId)
        .eq('date', selectedDate)
        .select('staff_id')

      if (updErr) throw updErr

      // If no row updated, insert a new one
      if (!upd || upd.length === 0) {
        const { error: insErr } = await supabase
          .from('staff_attendance')
          .insert({
            staff_id: staffId,
            date: selectedDate,
            status: newStatus,
            in_time: inTime,
            out_time: outTime,
            remark,
            update_at: new Date().toISOString(),
          })
        if (insErr) throw insErr
      }

      // Optimistically update local state
      setAttendance((prev) =>
        prev.map((item) =>
          item.staff_id === staffId
            ? {
                ...item,
                status: newStatus,
                in_time: inTime,
                out_time: outTime,
                remark,
              }
            : item
        )
      )
    } catch (err) {
      console.error('Error updating attendance:', err)
    }
  }

  useEffect(() => {
    fetchAttendance()
  }, [selectedDate])

  return { attendance, loading, error, fetchAttendance, updateStatus }
}

// CRUD for staff_info
export const useStaffInfo = () => {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchStaff = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('staff_info')
        .select(
          `id, staff_name, mobile_number, email_id, position, id_proof, joining_date, status, delete_flag, created_at`
        )
        .order('staff_name', { ascending: true })
      if (err) throw err

      setStaff(data || [])
    } catch (e) {
      console.error('fetchStaff error:', e)
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [])

  const addStaff = async (payload) => {
    // payload keys expected in DB shape
    try {
      const { data, error: err } = await supabase
        .from('staff_info')
        .insert(payload)
        .select()
      if (err) throw err
      // append
      setStaff((prev) => [...prev, ...(data || [])])
      return data?.[0]
    } catch (e) {
      console.error('addStaff error:', e)
      throw e
    }
  }

  const updateStaff = async (id, updates) => {
    try {
      const { data, error: err } = await supabase
        .from('staff_info')
        .update({ ...updates })
        .eq('id', id)
        .select()
      if (err) throw err
      const row = data?.[0]
      setStaff((prev) => prev.map((s) => (s.id === id ? row : s)))
      return row
    } catch (e) {
      console.error('updateStaff error:', e)
      throw e
    }
  }

  const softDeleteStaff = async (id, flag = true) => {
    return updateStaff(id, { delete_flag: flag })
  }

  const deleteStaff = async (id) => {
    try {
      const { error: err } = await supabase
        .from('staff_info')
        .delete()
        .eq('id', id)
      if (err) throw err
      setStaff((prev) => prev.filter((s) => s.id !== id))
    } catch (e) {
      console.error('deleteStaff error:', e)
      throw e
    }
  }

  return {
    staff,
    loading,
    error,
    fetchStaff,
    addStaff,
    updateStaff,
    softDeleteStaff,
    deleteStaff,
  }
}

// Fetch staff attendance/history for a specific date and map to UI-friendly shape
export const useStaffHistory = (selectedDate) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchForDate = useCallback(async () => {
    if (!selectedDate) return
    setLoading(true)
    setError(null)
    try {
      // 1) Fetch all staff (include even deleted? default exclude deleted)
      const { data: staffList, error: staffErr } = await supabase
        .from('staff_info')
        .select('id, staff_name, position, delete_flag')
        .order('staff_name', { ascending: true })
      if (staffErr) throw staffErr

      // 2) Fetch attendance rows for that date
      const { data: attRows, error: attErr } = await supabase
        .from('staff_attendance')
        .select('id, staff_id, status, in_time, out_time, remark, date')
        .eq('date', selectedDate)
      if (attErr) throw attErr

      const attMap = new Map()
      ;(attRows || []).forEach((a) => attMap.set(a.staff_id, a))

      // 3) Merge and map for UI
      const merged = (staffList || [])
        .filter((s) => s.delete_flag !== true) // hide soft-deleted by default
        .map((s) => {
          const a = attMap.get(s.id)
          const normalizeStatus = (val) => {
            const sv = String(val || '')
              .trim()
              .toLowerCase()
            if (sv === 'present' || sv === 'active' || sv === 'p')
              return 'Present'
            if (sv === 'absent' || sv === 'a') return 'Absent'
            if (
              sv === 'leave' ||
              sv === 'onleave' ||
              sv === 'half_day' ||
              sv === 'l'
            )
              return 'Half Day'
            return 'Absent' // default to Absent if undefined or unknown
          }
          return {
            id: s.id,
            name: s.staff_name,
            position: s.position,
            status: normalizeStatus(a?.status),
            checkInTime: a?.in_time || null,
            checkOutTime: a?.out_time || null,
            date: selectedDate,
            remark: a?.remark || '',
          }
        })

      setData(merged)
    } catch (e) {
      console.error('useStaffHistory error:', e)
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  useEffect(() => {
    fetchForDate()
  }, [fetchForDate])

  return { data, loading, error, refetch: fetchForDate }
}

//* inventory db operation starting from here

export const useGetInventoryData = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchInventoryData = async () => {
    try {
      setLoading(true)
      const { data } = await supabase.from('inventory').select('*')
      setData(data)
    } catch (error) {
      setError('Failed to load inventory data')
      console.error('Error fetching inventory data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventoryData()
  }, [])

  return { data, loading, error, refetch: fetchInventoryData }
}

// Create/Update inventory items
export const useInventoryMutations = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // uiProduct: { name, stockQuantity, purchaseDate, costPrice, stockStatus }
  const addProduct = async (uiProduct) => {
    try {
      setLoading(true)
      setError(null)
      const payload = {
        product_name: uiProduct.name,
        stock_quantity: uiProduct.stockQuantity,
        purchase_date: uiProduct.purchaseDate, // expect 'YYYY-MM-DD'
        cost_price: uiProduct.costPrice,
        stock_status: uiProduct.stockStatus,
      }
      const { data, error } = await supabase
        .from('inventory')
        .insert(payload)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (e) {
      console.error('addProduct error:', e)
      setError(e.message || 'Failed to add product')
      return null
    } finally {
      setLoading(false)
    }
  }

  // uiProduct: must include id (maps to product_id)
  const updateProduct = async (uiProduct) => {
    try {
      setLoading(true)
      setError(null)
      const payload = {
        product_name: uiProduct.name,
        stock_quantity: uiProduct.stockQuantity,
        purchase_date: uiProduct.purchaseDate,
        cost_price: uiProduct.costPrice,
        stock_status: uiProduct.stockStatus,
      }
      const { data, error } = await supabase
        .from('inventory')
        .update(payload)
        .eq('product_id', uiProduct.id)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (e) {
      console.error('updateProduct error:', e)
      setError(e.message || 'Failed to update product')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { addProduct, updateProduct, loading, error }
}
