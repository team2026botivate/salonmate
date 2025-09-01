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
  const [activeTimeouts, setActiveTimeouts] = useState(new Map())

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      activeTimeouts.forEach((timeoutId) => clearTimeout(timeoutId))
    }
  }, [activeTimeouts])

  const updateStaffStatus = async (staff_id, newStatus) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('staff_info')
        .update({ status: newStatus })
        .eq('id', staff_id)
        .select()

      if (error) throw error

      console.log(`Staff ${staff_id} status updated to: ${newStatus}`)
      return data
    } catch (err) {
      console.error('Error updating staff status:', err)
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const doStaffStatusActive = async (
    staff_id,
    serviceTimeMinutes,
    currentStatus
  ) => {
    try {
      // Input validation
      if (!staff_id) {
        throw new Error('Staff ID is required')
      }

      const minutes = parseInt(serviceTimeMinutes) || 0
      if (minutes <= 0) {
        throw new Error('Service time must be greater than 0')
      }

      // Clear any existing timeout for this staff member
      if (activeTimeouts.has(staff_id)) {
        clearTimeout(activeTimeouts.get(staff_id))
        setActiveTimeouts((prev) => {
          const newMap = new Map(prev)
          newMap.delete(staff_id)
          return newMap
        })
      }

      // Only proceed if staff is currently busy/active with a service
      if (currentStatus && currentStatus.toLowerCase() === 'active') {
        const timeInMilliseconds = minutes * 60 * 1000

        console.log(`Setting timer for staff ${staff_id}: ${minutes} minutes`)

        // Set timeout to change status back to available
        const timeoutId = setTimeout(async () => {
          try {
            await updateStaffStatus(staff_id, 'available')
            // Remove timeout from active list
            setActiveTimeouts((prev) => {
              const newMap = new Map(prev)
              newMap.delete(staff_id)
              return newMap
            })
          } catch (err) {
            console.error('Error in timeout callback:', err)
            setError(
              `Failed to update staff status after service completion: ${err.message}`
            )
          }
        }, timeInMilliseconds)

        // Store timeout ID for cleanup
        setActiveTimeouts((prev) => new Map(prev).set(staff_id, timeoutId))

        return { success: true, timeoutId, minutes }
      } else {
        throw new Error(
          `Staff status must be 'active' to set timer. Current status: ${currentStatus}`
        )
      }
    } catch (err) {
      console.error('doStaffStatusActive error:', err)
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  const cancelStaffTimer = (staff_id) => {
    if (activeTimeouts.has(staff_id)) {
      clearTimeout(activeTimeouts.get(staff_id))
      setActiveTimeouts((prev) => {
        const newMap = new Map(prev)
        newMap.delete(staff_id)
        return newMap
      })
      console.log(`Timer cancelled for staff ${staff_id}`)
      return true
    }
    return false
  }

  const getActiveTimers = () => {
    return Array.from(activeTimeouts.keys())
  }

  return {
    doStaffStatusActive,
    cancelStaffTimer,
    getActiveTimers,
    updateStaffStatus,
    loading,
    error,
  }
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

// getting the promoCard section

export const useGetPromoCardData = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getPromoCardData = async () => {
    try {
      setLoading(true)
      const { data: promoCardData, error } = await supabase
        .from('promo_card')
        .select('*')
      if (error) throw error

      const filteredPromoCardData = promoCardData.filter(
        (promoCard) =>
          promoCard.deleted === false &&
          new Date(promoCard.end_date) >= new Date()
      )

      setData(filteredPromoCardData)
    } catch (err) {
      console.error('Error fetching promo card data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getPromoCardData()
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

// Promo Card database operations
export const usePromoCardOperations = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [promoCards, setPromoCards] = useState([])

  // Fetch all promo cards
  const fetchPromoCards = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('promo_card')
        .select('*')
        .eq('deleted', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPromoCards(data || [])
      return data || []
    } catch (err) {
      console.error('Error fetching promo cards:', err)
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Add new promo card
  const addPromoCard = async (promoData) => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('promo_card')
        .insert({
          code: promoData.code,
          discount: parseInt(promoData.discount),
          description: promoData.description,
          start_date: promoData.startDate,
          end_date: promoData.endDate,
          created_at: new Date().toISOString(),
          deleted: false,
        })
        .select()
        .single()

      if (error) throw error

      // Update local state
      setPromoCards((prev) => [data, ...prev])
      return { success: true, data }
    } catch (err) {
      console.error('Error adding promo card:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Update promo card
  const updatePromoCard = async (id, promoData) => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('promo_card')
        .update({
          code: promoData.code,
          discount: parseInt(promoData.discount),
          description: promoData.description,
          start_date: promoData.startDate,
          end_date: promoData.endDate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Update local state
      setPromoCards((prev) =>
        prev.map((promo) => (promo.id === id ? data : promo))
      )
      return { success: true, data }
    } catch (err) {
      console.error('Error updating promo card:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Soft delete promo card
  const deletePromoCard = async (id) => {
    try {
      setLoading(true)
      setError(null)
      const { error } = await supabase
        .from('promo_card')
        .update({
          deleted: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error

      // Remove from local state
      setPromoCards((prev) => prev.filter((promo) => promo.id !== id))
      return { success: true }
    } catch (err) {
      console.error('Error deleting promo card:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Check if promo code exists
  const checkPromoCodeExists = async (code, excludeId = null) => {
    try {
      let query = supabase
        .from('promo_card')
        .select('id')
        .eq('code', code)
        .eq('deleted', false)

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data, error } = await query
      if (error) throw error

      return data && data.length > 0
    } catch (err) {
      console.error('Error checking promo code:', err)
      return false
    }
  }

  // Get active promo cards
  const getActivePromoCards = useCallback(() => {
    const today = new Date()
    return promoCards.filter((promo) => {
      if (!promo.start_date || !promo.end_date) return true
      const startDate = new Date(promo.start_date)
      const endDate = new Date(promo.end_date)
      return today >= startDate && today <= endDate
    })
  }, [promoCards])

  // Initialize data fetch
  useEffect(() => {
    fetchPromoCards()
  }, [])

  return {
    promoCards,
    loading,
    error,
    fetchPromoCards,
    addPromoCard,
    updatePromoCard,
    deletePromoCard,
    checkPromoCodeExists,
    getActivePromoCards,
  }
}

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

//* Service section started from here

// Get all services from hair_service table
export const useGetServices = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase
        .from('hair_service')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) throw err
      setServices(data || [])
    } catch (e) {
      console.error('fetchServices error:', e)
      setError(e.message || 'Failed to fetch services')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  return { services, loading, error, refetch: fetchServices }
}

// Add new service
export const useAddService = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const addService = async (serviceData) => {
    try {
      setLoading(true)
      setError(null)

      const payload = {
        service_name: serviceData.name,
        service_description: serviceData.description,
        base_price: parseFloat(serviceData.price),
        time_duration: serviceData.duration,
        delete_flag: false,
        created_at: new Date().toISOString(),
      }

      const { data, error: err } = await supabase
        .from('hair_service')
        .insert(payload)
        .select()
        .single()

      if (err) throw err
      return data
    } catch (e) {
      console.error('addService error:', e)
      setError(e.message || 'Failed to add service')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { addService, loading, error }
}

// Dashboard Home hooks
export const useDashboardSummary = () => {
  const [data, setData] = useState({
    upcomingBookings: 0,
    totalClients: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    weekGrowth: 0,
    monthGrowth: 0,
    activeServices: 0,
    inactiveServices: 0,
    totalStaff: 0,
    absentStaff: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboardSummary = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Get today's date range
      const today = new Date()
      const todayStart = new Date(today)
      todayStart.setHours(0, 0, 0, 0)
      const todayEnd = new Date(today)
      todayEnd.setHours(23, 59, 59, 999)

      // Get week date range
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay())
      weekStart.setHours(0, 0, 0, 0)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)

      // Get month date range
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      monthEnd.setHours(23, 59, 59, 999)

      // Get previous week and month for growth calculation
      const prevWeekStart = new Date(weekStart)
      prevWeekStart.setDate(weekStart.getDate() - 7)
      const prevWeekEnd = new Date(weekEnd)
      prevWeekEnd.setDate(weekEnd.getDate() - 7)

      const prevMonthStart = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1
      )
      const prevMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
      prevMonthEnd.setHours(23, 59, 59, 999)

      // Fetch upcoming bookings (today and future)
      const { data: upcomingBookings, error: bookingsError } = await supabase
        .from('appointment')
        .select('id')
        .gte('Slot Date', todayStart.toISOString())
        .in('Booking Status', ['confirmed', 'pending'])

      if (bookingsError) throw bookingsError

      // Fetch total unique clients
      const { data: totalClients, error: clientsError } = await supabase
        .from('customer_info')
        .select('id')

      if (clientsError) throw clientsError

      // Fetch week revenue
      const { data: weekRevenue, error: weekRevenueError } = await supabase
        .from('appointment')
        .select('transaction_final_amount')
        .gte('transactions_date', weekStart.toISOString())
        .lte('transactions_date', weekEnd.toISOString())
        .eq('transactions_status', 'paid')
        .not('transaction_final_amount', 'is', null)

      if (weekRevenueError) throw weekRevenueError

      // Fetch month revenue
      const { data: monthRevenue, error: monthRevenueError } = await supabase
        .from('appointment')
        .select('transaction_final_amount')
        .gte('transactions_date', monthStart.toISOString())
        .lte('transactions_date', monthEnd.toISOString())
        .eq('transactions_status', 'paid')
        .not('transaction_final_amount', 'is', null)

      if (monthRevenueError) throw monthRevenueError

      // Fetch previous week revenue for growth calculation
      const { data: prevWeekRevenue, error: prevWeekError } = await supabase
        .from('appointment')
        .select('transaction_final_amount')
        .gte('transactions_date', prevWeekStart.toISOString())
        .lte('transactions_date', prevWeekEnd.toISOString())
        .eq('transactions_status', 'paid')
        .not('transaction_final_amount', 'is', null)

      if (prevWeekError) throw prevWeekError

      // Fetch previous month revenue for growth calculation
      const { data: prevMonthRevenue, error: prevMonthError } = await supabase
        .from('appointment')
        .select('transaction_final_amount')
        .gte('transactions_date', prevMonthStart.toISOString())
        .lte('transactions_date', prevMonthEnd.toISOString())
        .eq('transactions_status', 'paid')
        .not('transaction_final_amount', 'is', null)

      if (prevMonthError) throw prevMonthError

      // Fetch services
      const { data: services, error: servicesError } = await supabase
        .from('hair_service')
        .select('id, delete_flag')

      if (servicesError) throw servicesError

      // Fetch staff
      const { data: staff, error: staffError } = await supabase
        .from('staff_info')
        .select('id, status, delete_flag')
        .neq('delete_flag', true)

      if (staffError) throw staffError

      // Fetch today's staff attendance
      const { data: attendance, error: attendanceError } = await supabase
        .from('staff_attendance')
        .select('staff_id, status')
        .eq('date', today.toISOString().split('T')[0])

      if (attendanceError) throw attendanceError

      // Calculate metrics
      const weekRevenueTotal = (weekRevenue || []).reduce(
        (sum, item) => sum + (parseFloat(item.transaction_final_amount) || 0),
        0
      )
      const monthRevenueTotal = (monthRevenue || []).reduce(
        (sum, item) => sum + (parseFloat(item.transaction_final_amount) || 0),
        0
      )
      const prevWeekRevenueTotal = (prevWeekRevenue || []).reduce(
        (sum, item) => sum + (parseFloat(item.transaction_final_amount) || 0),
        0
      )
      const prevMonthRevenueTotal = (prevMonthRevenue || []).reduce(
        (sum, item) => sum + (parseFloat(item.transaction_final_amount) || 0),
        0
      )

      const weekGrowth =
        prevWeekRevenueTotal > 0
          ? ((weekRevenueTotal - prevWeekRevenueTotal) / prevWeekRevenueTotal) *
            100
          : 0
      const monthGrowth =
        prevMonthRevenueTotal > 0
          ? ((monthRevenueTotal - prevMonthRevenueTotal) /
              prevMonthRevenueTotal) *
            100
          : 0

      const activeServices = (services || []).filter(
        (s) => !s.delete_flag
      ).length
      const inactiveServices = (services || []).filter(
        (s) => s.delete_flag
      ).length

      const totalStaff = (staff || []).length
      const attendanceMap = new Map(
        (attendance || []).map((a) => [a.staff_id, a.status])
      )
      const absentStaff = (staff || []).filter((s) => {
        const attendanceStatus = attendanceMap.get(s.id)
        return !attendanceStatus || attendanceStatus.toLowerCase() === 'absent'
      }).length

      setData({
        upcomingBookings: (upcomingBookings || []).length,
        totalClients: (totalClients || []).length,
        weekRevenue: Math.round(weekRevenueTotal),
        monthRevenue: Math.round(monthRevenueTotal),
        weekGrowth: Math.round(weekGrowth * 10) / 10,
        monthGrowth: Math.round(monthGrowth * 10) / 10,
        activeServices,
        inactiveServices,
        totalStaff,
        absentStaff,
      })
    } catch (e) {
      console.error('fetchDashboardSummary error:', e)
      setError(e.message || 'Failed to fetch dashboard summary')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardSummary()
  }, [fetchDashboardSummary])

  return { data, loading, error, refetch: fetchDashboardSummary }
}

export const useRecentBookings = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRecentBookings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const today = new Date()
      const threeDaysAgo = new Date(today)
      threeDaysAgo.setDate(today.getDate() - 3)

      const { data: bookings, error: bookingsError } = await supabase
        .from('appointment')
        .select(
          'id, "Customer Name", Services, "Slot Time", "Booking Status", "Service Price", "Slot Date"'
        )
        .gte('Slot Date', threeDaysAgo.toISOString())
        .order('Slot Date', { ascending: false })
        .limit(5)

      if (bookingsError) throw bookingsError

      const formattedBookings = (bookings || []).map((booking) => ({
        id: booking.id,
        clientName: booking['Customer Name'] || 'Unknown',
        service: booking.Services || 'No service',
        time: booking['Slot Time'] || 'No time',
        status: booking['Booking Status'] || 'pending',
        amount: parseFloat(booking['Service Price']) || 0,
      }))

      setData(formattedBookings)
    } catch (e) {
      console.error('fetchRecentBookings error:', e)
      setError(e.message || 'Failed to fetch recent bookings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRecentBookings()
  }, [fetchRecentBookings])

  return { data, loading, error, refetch: fetchRecentBookings }
}

export const useRecentTransactions = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRecentTransactions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: transactions, error: transactionsError } = await supabase
        .from('appointment')
        .select(
          'transaction_id, "Customer Name", payment_method, transactions_status, transaction_final_amount'
        )
        .not('transaction_id', 'is', null)
        .not('transactions_status', 'is', null)
        .order('transactions_date', { ascending: false })
        .limit(5)

      if (transactionsError) throw transactionsError

      const formattedTransactions = (transactions || []).map((transaction) => ({
        id:
          transaction.transaction_id ||
          `TXN${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        clientName: transaction['Customer Name'] || 'Unknown',
        paymentMethod: transaction.payment_method || 'cash',
        status:
          transaction.transactions_status === 'paid'
            ? 'completed'
            : transaction.transactions_status || 'pending',
        amount: parseFloat(transaction.transaction_final_amount) || 0,
      }))

      setData(formattedTransactions)
    } catch (e) {
      console.error('fetchRecentTransactions error:', e)
      setError(e.message || 'Failed to fetch recent transactions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRecentTransactions()
  }, [fetchRecentTransactions])

  return { data, loading, error, refetch: fetchRecentTransactions }
}

// Staff Payment/Commission hooks
export const useStaffPaymentData = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStaffPaymentData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current month for attendance calculation
      const now = new Date()
      const currentMonth = now.getMonth() + 1
      const currentYear = now.getFullYear()
      const monthStart = new Date(currentYear, currentMonth - 1, 1)
      const monthEnd = new Date(currentYear, currentMonth, 0)

      // Fetch all active staff
      const { data: staffList, error: staffError } = await supabase
        .from('staff_info')
        .select(
          'id, staff_name, mobile_number, position, base_salary, commission_rate, commission_type, payment_status'
        )
        .neq('delete_flag', true)
        .order('staff_name', { ascending: true })

      console.log(staffList)
      if (staffError) throw staffError

      // Fetch attendance data for current month for each staff member
      const staffWithPaymentData = await Promise.all(
        (staffList || []).map(async (staff) => {
          try {
            // Get attendance count for current month
            const { data: attendanceData, error: attendanceError } =
              await supabase
                .from('staff_attendance')
                .select('status')
                .eq('staff_id', staff.id)
                .gte('date', monthStart.toISOString().split('T')[0])
                .lte('date', monthEnd.toISOString().split('T')[0])
                .in('status', ['present', 'active', 'p'])

            if (attendanceError) {
              console.warn(
                `Error fetching attendance for ${staff.staff_name}:`,
                attendanceError
              )
            }

            const totalPresent = (attendanceData || []).length

            // Get total revenue generated by this staff member for commission calculation
            const { data: revenueData, error: revenueError } = await supabase
              .from('appointment')
              .select('transaction_final_amount')
              .eq('staff_id', staff.id)
              .eq('transactions_status', 'paid')
              .gte('transactions_date', monthStart.toISOString())
              .lte('transactions_date', monthEnd.toISOString())
              .not('transaction_final_amount', 'is', null)

            if (revenueError) {
              console.warn(
                `Error fetching revenue for ${staff.staff_name}:`,
                revenueError
              )
            }

            const totalRevenue = (revenueData || []).reduce(
              (sum, item) =>
                sum + (parseFloat(item.transaction_final_amount) || 0),
              0
            )

            // Get values from database columns
            const baseSalary = parseFloat(staff.base_salary) || 25000
            const commissionRate = parseFloat(staff.commission_rate) || 10
            const commissionType = staff.commission_type || 'percentage'

            // Calculate pro-rated salary based on attendance
            // Formula: (base_salary / total_days_in_month) * days_present
            const totalDaysInMonth = monthEnd.getDate()
            const proRatedSalary =
              (baseSalary / totalDaysInMonth) * totalPresent

            // Calculate commission based on type
            let calculatedCommission = 0
            if (commissionType === 'percentage') {
              calculatedCommission = totalRevenue * (commissionRate / 100)
            } else {
              calculatedCommission = commissionRate
            }

            return {
              id: staff.id,
              name: staff.staff_name,
              baseSalary: baseSalary,
              proRatedSalary: Math.round(proRatedSalary), // Attendance-based salary
              totalPresent: totalPresent,
              totalDaysInMonth: totalDaysInMonth,
              commission: commissionRate,
              commissionType: commissionType,
              calculatedCommission: calculatedCommission,
              totalRevenue: totalRevenue,
              paymentStatus: staff.payment_status || 'pending',
            }
          } catch (err) {
            console.error(`Error processing staff ${staff.staff_name}:`, err)
            const baseSalary = parseFloat(staff.base_salary) || 25000
            const totalDaysInMonth = monthEnd.getDate()
            const proRatedSalary = (baseSalary / totalDaysInMonth) * 0 // 0 days present in error case

            return {
              id: staff.id,
              name: staff.staff_name,
              baseSalary: baseSalary,
              proRatedSalary: Math.round(proRatedSalary),
              totalPresent: 0,
              totalDaysInMonth: totalDaysInMonth,
              commission: 10, // Default fallback
              commissionType: 'percentage',
              calculatedCommission: 0,
              totalRevenue: 0,
              paymentStatus: 'pending',
            }
          }
        })
      )

      setData(staffWithPaymentData)
    } catch (e) {
      console.error('fetchStaffPaymentData error:', e)
      setError(e.message || 'Failed to fetch staff payment data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStaffPaymentData()
  }, [fetchStaffPaymentData])

  return { data, loading, error, refetch: fetchStaffPaymentData }
}

export const useUpdateStaffPaymentStatus = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const updatePaymentStatus = async (staffData) => {
    try {
      setLoading(true)
      setError(null)

      const now = new Date()
      const currentMonth = now.toISOString().slice(0, 7) // YYYY-MM format
      const totalSalary =
        staffData.proRatedSalary + staffData.calculatedCommission

      // Insert payment record into staff_payments table
      const { data: paymentData, error: paymentError } = await supabase
        .from('staff_payments')
        .insert({
          staff_id: staffData.id,
          payment_date: now.toISOString().split('T')[0],
          salary_month: currentMonth,
          amount: totalSalary,
          payment_method: 'Bank Transfer',
          status: 'Paid',
          notes: `Salary: ₹${staffData.proRatedSalary} (${staffData.totalPresent}/${staffData.totalDaysInMonth} days) + Commission: ₹${staffData.calculatedCommission}`,
        })
        .select()
        .single()

      if (paymentError) throw paymentError

      // Update payment status in staff_info table
      const { error: statusError } = await supabase
        .from('staff_info')
        .update({ payment_status: 'paid' })
        .eq('id', staffData.id)

      if (statusError) throw statusError

      console.log(`Payment processed successfully for ${staffData.name}`)
      return paymentData
    } catch (e) {
      console.error('updatePaymentStatus error:', e)
      setError(e.message || 'Failed to update payment status')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { updatePaymentStatus, loading, error }
}

// Update service
export const useUpdateService = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const updateService = async (id, serviceData) => {
    try {
      setLoading(true)
      setError(null)

      const payload = {
        service_name: serviceData.name,
        service_description: serviceData.description,
        base_price: parseFloat(serviceData.price),
        time_duration: serviceData.duration,
        updated_at: new Date().toISOString(),
      }

      const { data, error: err } = await supabase
        .from('hair_service')
        .update(payload)
        .eq('id', id)
        .select()
        .single()

      if (err) throw err
      return data
    } catch (e) {
      console.error('updateService error:', e)
      setError(e.message || 'Failed to update service')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { updateService, loading, error }
}

// Soft delete/restore service
export const useToggleServiceDelete = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const toggleDelete = async (id, isDeleted) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: err } = await supabase
        .from('hair_service')
        .update({
          delete_flag: isDeleted,
        })
        .eq('id', id)
        .select()
        .single()

      if (err) throw err
      return data
    } catch (e) {
      console.error('toggleDelete error:', e)
      setError(e.message || 'Failed to update service status')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { toggleDelete, loading, error }
}

// Permanently delete service
export const useDeleteService = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const deleteService = async (id) => {
    try {
      setLoading(true)
      setError(null)

      const { error: err } = await supabase
        .from('hair_service')
        .delete()
        .eq('id', id)

      if (err) throw err
      return true
    } catch (e) {
      console.error('deleteService error:', e)
      setError(e.message || 'Failed to delete service')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { deleteService, loading, error }
}

//* customer db operation starting from here

export const useGetCustomerDataFetch = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getCustomerData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('customer_info').select('*')
      if (error) throw error
      setData(data)
    } catch (err) {
      console.error('Error fetching customer data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getCustomerData()
  }, [])

  return { loading, error, data }
}
