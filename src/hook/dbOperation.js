import supabase from '../dataBase/connectdb';
import { useState, useEffect, useCallback } from 'react';
import { useAppData } from '../zustand/appData';

export const useGetallAppointmentData = () => {
  // const [data, setData] = useState([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setAppointments, refreshAppointments, store_id } = useAppData();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(today.getDate() + 2);
  dayAfterTomorrow.setHours(23, 59, 59, 999);

  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const fetchAppointments = async () => {
    if (!store_id) {
      console.warn('No store_id available, skipping appointment fetch');
      setLoading(false);
      return [];
    }
    try {
      setLoading(true);
      const { data: appointments, error } = await supabase
        .from('appointment')
        .select('*')
        .eq('store_id', store_id)
        .neq('"Booking Status"', 'completed')
        .or(
          `"Booking Status".neq.cancelled, and("Booking Status".eq.cancelled, "Slot Date".gte.${oneDayAgo.toISOString()})`
        )
        .gte('"Slot Date"', today.toISOString())
        .lt('"Slot Date"', dayAfterTomorrow.toISOString())

        .order('"Slot Date"', { ascending: false });

      if (error) throw error;

      // setData(appointments || [])
      setAppointments([...appointments] || []);
      return [...appointments];
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [refreshAppointments]);

  return { loading, error, refetch: fetchAppointments };
};

// Daily Expenses hooks
export const useGetDailyExpenses = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { store_id } = useAppData();

  const fetchDailyExpenses = async () => {
    if (!store_id) {
      setLoading(false);
      return [];
    }
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('daily_expenses')
        .select('*')
        .eq('store_id', store_id)
        .order('expense_date', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      setData(data || []);
      return data || [];
    } catch (e) {
      console.error('fetchDailyExpenses error:', e);
      setError(e.message || 'Failed to load daily expenses');
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyExpenses();
  }, [store_id]);

  return { data, loading, error, refetch: fetchDailyExpenses };
};

export const useDailyExpenseMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { store_id } = useAppData();

  const addExpense = async (payload) => {
    try {
      setLoading(true);
      setError(null);
      const insertPayload = {
        expense_date: payload.date, // YYYY-MM-DD
        amount: Number(payload.amount),
        product_name: payload.title || payload.product_name || null,
        qty: Number(payload.qty || 1),
        title: payload.title || null,
        note: payload.notes || null,
        store_id,
      };
      const { data, error } = await supabase
        .from('daily_expenses')
        .insert(insertPayload)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.error('addExpense error:', e);
      setError(e.message || 'Failed to add expense');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateExpense = async (id, payload) => {
    try {
      setLoading(true);
      setError(null);
      const updatePayload = {
        expense_date: payload.date,
        amount: Number(payload.amount),
        product_name: payload.title || payload.product_name || null,
        qty: Number(payload.qty || 1),
        title: payload.title || null,
        note: payload.notes || null,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from('daily_expenses')
        .update(updatePayload)
        .eq('id', id)
        .eq('store_id', store_id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.error('updateExpense error:', e);
      setError(e.message || 'Failed to update expense');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase
        .from('daily_expenses')
        .delete()
        .eq('id', id)
        .eq('store_id', store_id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('deleteExpense error:', e);
      setError(e.message || 'Failed to delete expense');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { addExpense, updateExpense, deleteExpense, loading, error };
};

export const useUpdateAppointmentById = () => {
  const [loading, setLoading] = useState(false);
  const setRefreshAppointments = useAppData((state) => state.setRefreshAppointments);

  const getAppointments = async (id, updates, onCancel) => {
    try {
      setLoading(true);

      // 1) Update the appointment row
      const { data: updated, error: updateErr } = await supabase
        .from('appointment')
        .update({
          'Booking Status': updates.bookingStatus,
          'Slot Date': updates.slotDate,
          'Slot Time': updates.slotTime,
          'Slot Number': updates.slotNumber,
          staff_information: updates.staff_information,
        })
        .eq('id', id)
        .select();

      if (updateErr) throw updateErr;

      // 2) Mark assigned staff as 'busy' (if any)
      if (Array.isArray(updates?.staff_information) && updates.staff_information.length > 0) {
        for (const s of updates.staff_information) {
          const staffId = s?.id;
          if (!staffId) continue;
          const { error: staffErr } = await supabase
            .from('staff_info')
            .update({ status: 'busy' })
            .eq('id', staffId);
          if (staffErr) throw staffErr;
        }
      }

      setRefreshAppointments();
      onCancel();
    } catch (error) {
      console.error('Error updating appointment:', error);
      setLoading(false);
      onCancel();
    }
  };
  return { getAppointments, loading };
};

export const useGetStaffData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { store_id } = useAppData();

  const fetchStaffData = async () => {
    if (!store_id) {
      console.warn('No store_id available, skipping staff data fetch');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data } = await supabase
        .from('staff_info')
        .select('status,mobile_number,staff_name,id,email_id,status')
        .eq('store_id', store_id);

      setData(data);
    } catch (error) {
      setError('Failed to load staff data');
      console.error('Error fetching staff data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  return { data, loading, error, refetch: fetchStaffData };
};

export const useUpdateStaffStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      setLoading(true);
      const { data, error } = await supabase
        .from('staff_info')
        .update({ status })
        .ilike('id', staff_id)
        .select();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error updating staff status by name:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateStaffStatusByName, loading, error };
};

export const usegetUserByPhoneNumber = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { store_id } = useAppData();

  const getUserByPhoneNumber = async (phoneNumber) => {
    if (!store_id) {
      console.warn('No store_id available');
      return null;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customer_info')
        .select('id, customer_name, mobile_number')
        .eq('store_id', store_id)
        .ilike('mobile_number', phoneNumber);
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching user by phone number:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { getUserByPhoneNumber, loading, error };
};

export const useGetServicesList = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const { store_id } = useAppData();

  const getServices = async () => {
    if (!store_id) {
      console.warn('No store_id available, skipping services fetch');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hair_service')
        .select('service_name, base_price,time_duration')
        .eq('store_id', store_id);
      if (error) throw error;
      setData(data);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getServices();
  }, []);

  return { loading, error, data };
};

export const useCreatenewAppointment = () => {
  const setRefreshAppointments = useAppData((state) => state.setRefreshAppointments);
  const { store_id } = useAppData();

  const [loading, setLoading] = useState(false);

  const createNewAppointment = async (appointmentData, newStatus, onCancel, isNewUser) => {
    setLoading(true);

    try {
      // Check if staff is provided and validate only if provided
      const hasStaff = appointmentData.staff[0] && appointmentData.staff[0].id.trim() !== '';

      // Check if selected staff is busy (only if staff is provided)
      const isStaffBusy = hasStaff && appointmentData.staffStatus?.toLowerCase() === 'busy';

      const appointmentInsertData = {
        'Booking ID': appointmentData.bookingId,
        'Mobile Number': appointmentData.mobileNumber,
        'Customer Name': appointmentData.customerName,
        'Slot Date': appointmentData.slotDate,
        'Slot Number': appointmentData.slotNumber,
        'Slot Time': appointmentData.slotTime,
        staff_information: appointmentData.staff,
        Services: appointmentData.service,
        'Service Price': appointmentData.servicePrice,
        'Booking Status': appointmentData.bookingStatus,
        TimeStamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
        store_id: store_id,
      };

      if (hasStaff) {
        appointmentInsertData.staff_id = appointmentData.staff[0].id;
      }
      if (isNewUser) {
        const { error } = await supabase.from('customer_info').insert({
          customer_name: appointmentData.customerName,
          mobile_number: appointmentData.mobileNumber,
          timestamp: new Date().toISOString(),
          store_id: store_id,
        });
        if (error) throw error;
      }
      const { error } = await supabase.from('appointment').insert(appointmentInsertData);

      console.log(error, 'error form the appointment');
      if (!error) {
        setRefreshAppointments();
      }
      if (error) throw error;

      if (hasStaff) {
        appointmentData.staff.forEach(async (staff) => {
          const { error: staffError } = await supabase
            .from('staff_info')
            .update({ status: newStatus })
            .eq('id', staff.id);
          if (staffError) throw staffError;
        });
      }
    } catch (err) {
      console.error('Error creating new appointment:', err);
      return null;
    } finally {
      setLoading(false);
      onCancel();
    }
  };

  return { createNewAppointment, loading };
};

export const useDoStaffStatusActive = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTimeouts, setActiveTimeouts] = useState(new Map());

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      activeTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    };
  }, [activeTimeouts]);

  const updateStaffStatus = async (staff_id, newStatus) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('staff_info')
        .update({ status: newStatus })
        .eq('id', staff_id)
        .select();

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('Error updating staff status:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const doStaffStatusActive = async (staff_id, serviceTimeMinutes, currentStatus) => {
    try {
      // Input validation
      if (!staff_id) {
        throw new Error('Staff ID is required');
      }

      const minutes = parseInt(serviceTimeMinutes) || 0;
      if (minutes <= 0) {
        throw new Error('Service time must be greater than 0');
      }

      // Clear any existing timeout for this staff member
      if (activeTimeouts.has(staff_id)) {
        clearTimeout(activeTimeouts.get(staff_id));
        setActiveTimeouts((prev) => {
          const newMap = new Map(prev);
          newMap.delete(staff_id);
          return newMap;
        });
      }

      // Only proceed if staff is currently busy/active with a service
      if (currentStatus && currentStatus.toLowerCase() === 'active') {
        const timeInMilliseconds = minutes * 60 * 1000;

        // Set timeout to change status back to available
        const timeoutId = setTimeout(async () => {
          try {
            await updateStaffStatus(staff_id, 'available');
            // Remove timeout from active list
            setActiveTimeouts((prev) => {
              const newMap = new Map(prev);
              newMap.delete(staff_id);
              return newMap;
            });
          } catch (err) {
            console.error('Error in timeout callback:', err);
            setError(`Failed to update staff status after service completion: ${err.message}`);
          }
        }, timeInMilliseconds);

        // Store timeout ID for cleanup
        setActiveTimeouts((prev) => new Map(prev).set(staff_id, timeoutId));

        return { success: true, timeoutId, minutes };
      } else {
        throw new Error(
          `Staff status must be 'active' to set timer. Current status: ${currentStatus}`
        );
      }
    } catch (err) {
      console.error('doStaffStatusActive error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const cancelStaffTimer = (staff_id) => {
    if (activeTimeouts.has(staff_id)) {
      clearTimeout(activeTimeouts.get(staff_id));
      setActiveTimeouts((prev) => {
        const newMap = new Map(prev);
        newMap.delete(staff_id);
        return newMap;
      });
      return true;
    }
    return false;
  };

  const getActiveTimers = () => {
    return Array.from(activeTimeouts.keys());
  };

  return {
    doStaffStatusActive,
    cancelStaffTimer,
    getActiveTimers,
    updateStaffStatus,
    loading,
    error,
  };
};

//*  Running Appointment db operation starting form here

export const useGetRunningAppointment = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const refreshExtraServicesHookRefresh = useAppData(
    (state) => state.refreshExtraServicesHookRefresh
  );
  const { store_id } = useAppData();

  const getRunningAppointment = async () => {
    if (!store_id) {
      console.warn('No store_id available, skipping running appointments fetch');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      // Define date range: from start of yesterday to start of day after tomorrow (exclusive)
      const now = new Date();
      const startOfYesterday = new Date(now);
      startOfYesterday.setDate(now.getDate() - 1);
      startOfYesterday.setHours(0, 0, 0, 0);

      const startOfDayAfterTomorrow = new Date(now);
      startOfDayAfterTomorrow.setDate(now.getDate() + 2);
      startOfDayAfterTomorrow.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('appointment')
        .select('*')
        .eq('store_id', store_id)
        .eq('"Booking Status"', 'completed')
        .not('staff_information', 'is', null)
        .neq('staff_information', '[]')
        .or('status.is.null,status.neq.done') // ✅ null bhi allow aur 'done' ke alawa sab
        .gte('"Slot Date"', startOfYesterday.toISOString().split('T')[0])
        .lte('"Slot Date"', startOfDayAfterTomorrow.toISOString().split('T')[0])
        .order('"Slot Date"', { ascending: false });

      if (error) throw error;
      setData(data);
    } catch (err) {
      console.error('Error fetching running appointments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getRunningAppointment();
  }, [refreshExtraServicesHookRefresh]);

  return { loading, error, data };
};

export const useGetExtraServiceDataFetch = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const refreshExtraServicesHookRefresh = useAppData(
    (state) => state.refreshExtraServicesHookRefresh
  );
  const { store_id } = useAppData();

  const getExtraServiceData = async () => {
    if (!store_id) {
      console.warn('No store_id available, skipping extra services fetch');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hair_service')
        .select('service_name,base_price')
        .eq('store_id', store_id);

      if (error) throw error;
      setData(data);
    } catch (err) {
      console.error('Error fetching extra service data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getExtraServiceData();
  }, [refreshExtraServicesHookRefresh]);

  return { loading, error, data };
};

export const useCreateExtraService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const setRefreshExtraServicesHookRefresh = useAppData(
    (state) => state.setRefreshExtraServicesHookRefresh
  );

  const createExtraService = async (appointmentId, updates, status) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointment')
        .update({
          status: status,
          extra_Services: updates,
        })
        .eq('id', appointmentId);
      if (error) throw error;

      setRefreshExtraServicesHookRefresh();
      return data;
    } catch (err) {
      console.error('Error updating running appointment:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createExtraService, loading, error };
};

//* Appointment History

export const useGetSelectedExtraServiceDataForTransaction = () => {
  const refreshTransactionHookRefresh = useAppData((state) => state.refreshTransactionHookRefresh);
  const { store_id } = useAppData();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const getSelectedExtraServiceDataForTransaction = async () => {
    if (!store_id) {
      console.warn('No store_id available, skipping transaction data fetch');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointment')
        .select('*')
        .eq('store_id', store_id)
        .eq('status', 'done')
        .order('"Slot Date"', { ascending: false });
      if (error) throw error;
      setData(data);
    } catch (err) {
      console.error('Error fetching selected extra service data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSelectedExtraServiceDataForTransaction();
  }, [refreshTransactionHookRefresh]);
  return { loading, error, data };
};

export const useCreateTransaction = () => {
  const setRefreshTransactionHookRefresh = useAppData(
    (state) => state.setRefreshTransactionHookRefresh
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createTransaction = async (payload) => {
    try {
      setLoading(true);
      // Coerce and round to satisfy integer column type in DB
      const finalAmountInt = (() => {
        const n = Number(payload?.totalDue);
        if (!Number.isFinite(n)) return 0;
        // Ensure integer as a true number, not a string
        return parseInt(n.toFixed(0), 10);
      })();

      const updateData = {
        transactions_status: payload?.transactionStatus || 'paid',
        transaction_note: payload?.notes || null,
        transaction_id: payload?.transactionId || null,
        transaction_final_amount: finalAmountInt, // DB expects integer
        payment_method: payload?.payment?.method || null,
        transactions_date: new Date().toISOString(),
        gst_amount: payload?.gst_amount || null,
      };

      const { data, error } = await supabase
        .from('appointment')
        .update(updateData)
        .eq('id', payload.appointmentId);

      if (error) {
        console.error('Error updating running appointment:', error);
        setError(error.message);
        throw new Error('Error while payment ');
      }
      setRefreshTransactionHookRefresh();
      return data;
    } catch (err) {
      console.error('Error updating running appointment:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createTransaction, loading, error };
};

export const useGetHeaderCardData = () => {
  const refreshTransactionHookRefresh = useAppData((state) => state.refreshTransactionHookRefresh);
  const { store_id } = useAppData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ total: 0, average: 0, count: 0 });

  const getTotalRevenueAndAverageSale = async () => {
    if (!store_id) {
      console.warn('No store_id available, skipping header card data fetch');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      // Fetch amounts only; aggregate client-side to avoid PostgREST aggregate restriction
      const { data: rows, error } = await supabase
        .from('appointment')
        .select('transaction_final_amount')
        .eq('store_id', store_id)
        .not('transaction_final_amount', 'is', null);

      if (error) throw error;
      const amounts = (rows || []).map((r) => Number(r.transaction_final_amount) || 0);
      const total = amounts.reduce((acc, n) => acc + n, 0);
      const count = amounts.length;
      const average = count ? total / count : 0;
      setData({ total, average, count });
    } catch (err) {
      console.error('Error fetching selected extra service data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTotalRevenueAndAverageSale();
  }, [refreshTransactionHookRefresh]);
  return { loading, error, data };
};

export const useGetMonthlyEarnings = () => {
  const refreshTransactionHookRefresh = useAppData((state) => state.refreshTransactionHookRefresh);
  const { store_id } = useAppData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState();

  const getMonthlyEarnings = async () => {
    if (!store_id) {
      console.warn('No store_id available, skipping monthly earnings fetch');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointment')
        // Only fetch the amount for now; if date is needed later, use:
        // .select('transaction_final_amount, "Slot Date" as slot_date')
        .select('transaction_final_amount,created_at')
        .eq('store_id', store_id)
        .not('transaction_final_amount', 'is', null);

      if (error) throw error;
      setData(data);
    } catch (err) {
      console.error('Error fetching selected extra service data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMonthlyEarnings();
  }, [refreshTransactionHookRefresh]);
  return { loading, error, data };
};

export const useGetSelectedExtraServiceDataForTransactionHistory = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { store_id } = useAppData();
  const getSelectedExtraServiceDataForTransaction = async () => {
    if (!store_id) {
      console.warn('No store_id available, skipping transaction history fetch');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointment')
        .select('*')
        .eq('store_id', store_id)
        .eq('transactions_status', 'paid')
        .order('"Slot Date"', { ascending: false });
      if (error) throw error;
      setData(data);
    } catch (err) {
      console.error('Error fetching selected extra service data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSelectedExtraServiceDataForTransaction();
  }, []);
  return { loading, error, data };
};

// Hook to get ALL appointments history for the store
export const useGetAllAppointmentsHistory = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { store_id } = useAppData();

  const getAllAppointmentsHistory = async () => {
    if (!store_id) {
      console.warn('No store_id available, skipping all appointments history fetch');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointment')
        .select('*')
        .eq('store_id', store_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setData(data);
    } catch (err) {
      console.error('Error fetching all appointments history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllAppointmentsHistory();
  }, [store_id]);

  return { loading, error, data, refetch: getAllAppointmentsHistory };
};

// getting the promoCard section

export const useGetPromoCardData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { store_id } = useAppData();

  const getPromoCardData = useCallback(async () => {
    if (!store_id) {
      console.warn('No store_id available, skipping promo card data fetch');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data: promoCardData, error } = await supabase
        .from('promo_card')
        .select('*')
        .eq('store_id', store_id);
      if (error) throw error;

      const filteredPromoCardData = promoCardData.filter(
        (promoCard) => promoCard.deleted === false && new Date(promoCard.end_date) >= new Date()
      );

      setData(filteredPromoCardData);
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [store_id]);

  useEffect(() => {
    getPromoCardData();
  }, [getPromoCardData]);

  return { loading, error, data };
};
//managing thie staff attendance

export const useStaffAttendance = (selectedDate) => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { store_id } = useAppData();

  // Fetch attendance for selected date (show all staff even if no attendance yet)
  const fetchAttendance = async () => {
    if (!store_id) {
      console.warn('No store_id available, skipping attendance fetch');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // 1) Fetch all staff
      const { data: staffList, error: staffErr } = await supabase
        .from('staff_info')
        .select('id, staff_name, position')
        .eq('store_id', store_id)
        .neq('delete_flag', true)
        .order('staff_name', { ascending: true });
      if (staffErr) throw staffErr;

      // 2) Fetch attendance for the selected date
      const { data: attRows, error: attErr } = await supabase
        .from('staff_attendance')
        .select('staff_id, status, in_time, out_time, remark')
        .eq('store_id', store_id)
        .eq('date', selectedDate);
      if (attErr) throw attErr;

      const attMap = new Map((attRows || []).map((r) => [r.staff_id, r]));

      // 3) Merge so every staff member appears
      const merged = (staffList || []).map((s) => {
        const a = attMap.get(s.id);
        return {
          id: a?.id, // attendance row id may be undefined if none
          staff_id: s.id,
          staff_name: s.staff_name,
          position: s.position,
          status: a?.status || 'absent',
          in_time: a?.in_time || null,
          out_time: a?.out_time || null,
          remark: a?.remark || '',
        };
      });

      setAttendance(merged);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Update staff status
  const updateStatus = async (staffId, newStatus, inTime = null, outTime = null, remark = '') => {
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
        .select('staff_id');

      if (updErr) throw updErr;

      // If no row updated, insert a new one
      if (!upd || upd.length === 0) {
        const { error: insErr } = await supabase.from('staff_attendance').insert({
          staff_id: staffId,
          date: selectedDate,
          status: newStatus,
          in_time: inTime,
          out_time: outTime,
          remark,
          update_at: new Date().toISOString(),
        });
        if (insErr) throw insErr;
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
      );
    } catch (err) {
      console.error('Error updating attendance:', err);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  return { attendance, loading, error, fetchAttendance, updateStatus };
};

// CRUD for staff_info
export const useStaffInfo = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { store_id } = useAppData();

  const fetchStaff = useCallback(async () => {
    if (!store_id) {
      console.warn('No store_id available, skipping staff info fetch');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('staff_info')
        .select(
          `id, staff_name, mobile_number, email_id, position, id_proof, joining_date, status, delete_flag, created_at`
        )
        .eq('store_id', store_id)
        .order('staff_name', { ascending: true });
      if (err) throw err;

      setStaff(data || []);
    } catch (e) {
      console.error('fetchStaff error:', e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const addStaff = async (payload) => {
    // payload keys expected in DB shape
    try {
      const { data, error: err } = await supabase
        .from('staff_info')
        .insert({ ...payload, store_id: store_id })
        .select();
      if (err) throw err;
      // append
      setStaff((prev) => [...prev, ...(data || [])]);
      return data?.[0];
    } catch (e) {
      console.error('addStaff error:', e);
      throw e;
    }
  };

  const updateStaff = async (id, updates) => {
    try {
      const { data, error: err } = await supabase
        .from('staff_info')
        .update({ ...updates })
        .eq('id', id)
        .select();
      if (err) throw err;
      const row = data?.[0];
      setStaff((prev) => prev.map((s) => (s.id === id ? row : s)));
      return row;
    } catch (e) {
      console.error('updateStaff error:', e);
      throw e;
    }
  };

  const softDeleteStaff = async (id, flag = true) => {
    return updateStaff(id, { delete_flag: flag });
  };

  const deleteStaff = async (id) => {
    try {
      const { error: err } = await supabase.from('staff_info').delete().eq('id', id);
      if (err) throw err;
      setStaff((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      console.error('deleteStaff error:', e);
      throw e;
    }
  };

  return {
    staff,
    loading,
    error,
    fetchStaff,
    addStaff,
    updateStaff,
    softDeleteStaff,
    deleteStaff,
  };
};

// Fetch staff attendance/history for a specific date and map to UI-friendly shape
export const useStaffHistory = (selectedDate) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { store_id } = useAppData();

  const fetchForDate = useCallback(async () => {
    if (!selectedDate || !store_id) return;
    setLoading(true);
    setError(null);
    try {
      // 1) Fetch all staff (include even deleted? default exclude deleted)
      const { data: staffList, error: staffErr } = await supabase
        .from('staff_info')
        .select('id, staff_name, position, delete_flag')
        .eq('store_id', store_id)
        .order('staff_name', { ascending: true });
      if (staffErr) throw staffErr;

      // 2) Fetch attendance rows for that date
      const { data: attRows, error: attErr } = await supabase
        .from('staff_attendance')
        .select('id, staff_id, status, in_time, out_time, remark, date')
        .eq('date', selectedDate);
      if (attErr) throw attErr;

      const attMap = new Map();
      (attRows || []).forEach((a) => attMap.set(a.staff_id, a));

      // 3) Merge and map for UI
      const merged = (staffList || [])
        .filter((s) => s.delete_flag !== true) // hide soft-deleted by default
        .map((s) => {
          const a = attMap.get(s.id);
          const normalizeStatus = (val) => {
            const sv = String(val || '')
              .trim()
              .toLowerCase();
            if (sv === 'present' || sv === 'active' || sv === 'p') return 'Present';
            if (sv === 'absent' || sv === 'a') return 'Absent';
            if (sv === 'leave' || sv === 'onleave' || sv === 'half_day' || sv === 'l')
              return 'Half Day';
            return 'Absent'; // default to Absent if undefined or unknown
          };
          return {
            id: s.id,
            name: s.staff_name,
            position: s.position,
            status: normalizeStatus(a?.status),
            checkInTime: a?.in_time || null,
            checkOutTime: a?.out_time || null,
            date: selectedDate,
            remark: a?.remark || '',
          };
        });

      setData(merged);
    } catch (e) {
      console.error('useStaffHistory error:', e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchForDate();
  }, [fetchForDate]);

  return { data, loading, error, refetch: fetchForDate };
};

//* inventory db operation starting from here

// Hook for Promo Card operations
export const usePromoCardOperations = () => {
  const [promoCards, setPromoCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { store_id } = useAppData();

  // Fetch all promo cards
  const fetchPromoCards = useCallback(async () => {
    if (!store_id) {
      console.warn('No store_id available, skipping promo cards fetch');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('promo_card')
        .select('*')
        .eq('store_id', store_id)
        .eq('deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromoCards(data || []);
      return data || [];
    } catch (err) {
      console.error('Error fetching promo cards:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [store_id]);

  // Add new promo card
  const addPromoCard = async (promoData) => {
    try {
      setLoading(true);
      setError(null);
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
          store_id: store_id,
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setPromoCards((prev) => [data, ...prev]);
      return { success: true, data };
    } catch (err) {
      console.error('Error adding promo card:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update promo card
  const updatePromoCard = async (id, promoData) => {
    try {
      setLoading(true);
      setError(null);
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
        .eq('store_id', store_id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setPromoCards((prev) => prev.map((promo) => (promo.id === id ? data : promo)));
      return { success: true, data };
    } catch (err) {
      console.error('Error updating promo card:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Soft delete promo card
  const deletePromoCard = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase
        .from('promo_card')
        .update({
          deleted: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      // Remove from local state
      setPromoCards((prev) => prev.filter((promo) => promo.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting promo card:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Check if promo code exists
  const checkPromoCodeExists = async (code, excludeId = null) => {
    try {
      let query = supabase
        .from('promo_card')
        .select('id')
        .eq('store_id', store_id)
        .eq('code', code)
        .eq('deleted', false);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data && data.length > 0;
    } catch (err) {
      console.error('Error checking promo code:', err);
      return false;
    }
  };

  // Get active promo cards
  const getActivePromoCards = useCallback(() => {
    const today = new Date();
    return promoCards.filter((promo) => {
      if (!promo.start_date || !promo.end_date) return true;
      const startDate = new Date(promo.start_date);
      const endDate = new Date(promo.end_date);
      return today >= startDate && today <= endDate;
    });
  }, [promoCards]);

  // Initialize data fetch
  useEffect(() => {
    fetchPromoCards();
  }, [fetchPromoCards]);

  return {
    promoCards,
    loading,
    error,
    addPromoCard,
    updatePromoCard,
    deletePromoCard,
    checkPromoCodeExists,
    getActivePromoCards,
  };
};

// Membership operations
export const useMembershipOperations = () => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { store_id } = useAppData();

  // Fetch memberships for current store
  const fetchMemberships = useCallback(async () => {
    if (!store_id) {
      console.warn('No store_id available, skipping memberships fetch');
      setLoading(false);
      return [];
    }
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('membership')
        .select('*')
        .eq('store_id', store_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMemberships(data || []);
      return data || [];
    } catch (err) {
      console.error('Error fetching memberships:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [store_id]);

  // Add a membership
  const addMembership = async (payload) => {
    try {
      setLoading(true);
      setError(null);
      const insertData = {
        name: payload.name,
        price: parseInt(payload.price, 10) || 0,
        duration: payload.duration,
        benefits: Array.isArray(payload.benefits) ? payload.benefits : [],
        featured: Boolean(payload.featured) || false,
        is_active: payload.is_active === undefined ? true : Boolean(payload.is_active),
        store_id: store_id,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('membership')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      setMemberships((prev) => [data, ...prev]);
      return { success: true, data };
    } catch (err) {
      console.error('Error adding membership:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update a membership
  const updateMembership = async (id, payload) => {
    try {
      setLoading(true);
      setError(null);
      const updateData = {
        name: payload.name,
        price: parseInt(payload.price, 10) || 0,
        duration: payload.duration,
        benefits: Array.isArray(payload.benefits) ? payload.benefits : [],
        featured: payload.featured === undefined ? undefined : Boolean(payload.featured),
        is_active: payload.is_active === undefined ? undefined : Boolean(payload.is_active),
      };

      // Remove undefined keys to avoid overwriting with null
      Object.keys(updateData).forEach((k) => updateData[k] === undefined && delete updateData[k]);

      const { data, error } = await supabase
        .from('membership')
        .update(updateData)
        .eq('id', id)
        .eq('store_id', store_id)
        .select()
        .single();

      if (error) throw error;
      setMemberships((prev) => prev.map((m) => (m.id === id ? data : m)));
      return { success: true, data };
    } catch (err) {
      console.error('Error updating membership:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete a membership (hard delete)
  const deleteMembership = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase
        .from('membership')
        .delete()
        .eq('id', id)
        .eq('store_id', store_id);
      if (error) throw error;
      setMemberships((prev) => prev.filter((m) => m.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting membership:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Initialize
  useEffect(() => {
    fetchMemberships();
  }, [fetchMemberships]);

  return {
    memberships,
    loading,
    error,
    fetchMemberships,
    addMembership,
    updateMembership,
    deleteMembership,
  };
};

export const useGetInventoryData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { store_id } = useAppData();

  const fetchInventoryData = async () => {
    if (!store_id) {
      console.warn('No store_id available, skipping inventory data fetch');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data } = await supabase.from('inventory').select('*').eq('store_id', store_id);
      setData(data);
    } catch (error) {
      setError('Failed to load inventory data');
      console.error('Error fetching inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  return { data, loading, error, refetch: fetchInventoryData };
};

// Create/Update inventory items
export const useInventoryMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { store_id } = useAppData();

  // uiProduct: { name, stockQuantity, purchaseDate, costPrice, stockStatus }
  const addProduct = async (uiProduct) => {
    try {
      setLoading(true);
      setError(null);
      const payload = {
        product_name: uiProduct.name,
        stock_quantity: uiProduct.stockQuantity,
        purchase_date: uiProduct.purchaseDate, // expect 'YYYY-MM-DD'
        cost_price: uiProduct.costPrice,
        stock_status: uiProduct.stockStatus,
        store_id: store_id,
      };
      const { data, error } = await supabase.from('inventory').insert(payload).select().single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.error('addProduct error:', e);
      setError(e.message || 'Failed to add product');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // uiProduct: must include id (maps to product_id)
  const updateProduct = async (uiProduct) => {
    try {
      setLoading(true);
      setError(null);
      const payload = {
        product_name: uiProduct.name,
        stock_quantity: uiProduct.stockQuantity,
        purchase_date: uiProduct.purchaseDate,
        cost_price: uiProduct.costPrice,
        stock_status: uiProduct.stockStatus,
      };
      const { data, error } = await supabase
        .from('inventory')
        .update(payload)
        .eq('product_id', uiProduct.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.error('updateProduct error:', e);
      setError(e.message || 'Failed to update product');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { addProduct, updateProduct, loading, error };
};

// Record product usage and decrement inventory stock
export const useRecordInventoryUsage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { store_id } = useAppData();

  const recordUsage = async ({ productId, productName, quantity, staffId, staffName, note }) => {
    if (!store_id) {
      throw new Error('store_id not available');
    }
    if (!productId || !quantity || quantity <= 0) {
      throw new Error('Invalid product or quantity');
    }

    try {
      setLoading(true);
      setError(null);

      // 1) Insert usage row
      const usagePayload = {
        product_id: productId,
        quantity_used: quantity,
        staff_id: staffId || null,
        note: note || null,
        // used_at has a default now(), but we can still pass it
        used_at: new Date().toISOString(),
        store_id,
      };
      const { error: insertErr } = await supabase.from('inventory_usage').insert(usagePayload);
      if (insertErr) throw insertErr;

      // 2) Decrement stock in inventory table without RPC (optimistic concurrency with retry)
      let attempts = 0;
      const maxAttempts = 3;
      let updated = false;

      while (!updated && attempts < maxAttempts) {
        attempts += 1;

        // Read current stock
        const { data: rows, error: readErr } = await supabase
          .from('inventory')
          .select('stock_quantity')
          .eq('product_id', productId)
          .eq('store_id', store_id)
          .single();
        if (readErr) throw readErr;

        const currentQty = Number(rows?.stock_quantity) || 0;
        const newQty = Math.max(currentQty - Number(quantity), 0);

        // Conditional update ensures no race condition (stock not changed between read & write)
        const { error: updErr } = await supabase
          .from('inventory')
          .update({ stock_quantity: newQty })
          .eq('product_id', productId)
          .eq('store_id', store_id)
          .eq('stock_quantity', currentQty);

        if (updErr) throw updErr;

        // Check if update actually took place by re-reading
        const { data: verifyRow, error: verifyErr } = await supabase
          .from('inventory')
          .select('stock_quantity')
          .eq('product_id', productId)
          .eq('store_id', store_id)
          .single();
        if (verifyErr) throw verifyErr;
        updated = Number(verifyRow?.stock_quantity) === newQty;
      }

      if (!updated) {
        throw new Error('Failed to decrement stock after multiple attempts');
      }

      return true;
    } catch (e) {
      console.error('recordUsage error:', e);
      setError(e.message || 'Failed to record usage');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { recordUsage, loading, error };
};

//* Service section started from here

// Get all services from hair_service table
export const useGetServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { store_id } = useAppData();

  const fetchServices = useCallback(async () => {
    if (!store_id) {
      console.warn('No store_id available, skipping services fetch');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('hair_service')
        .select('*')
        .eq('store_id', store_id)
        .order('created_at', { ascending: false });

      if (err) throw err;
      setServices(data || []);
    } catch (e) {
      console.error('fetchServices error:', e);
      setError(e.message || 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return { services, loading, error, refetch: fetchServices };
};

// Add new service
export const useAddService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { store_id } = useAppData();

  const addService = async (serviceData) => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        service_name: serviceData.name,
        description: serviceData.description,
        base_price: parseFloat(serviceData.price),
        time_duration: serviceData.duration,
        delete_flag: false,
        created_at: new Date().toISOString(),
        store_id: store_id,
      };

      const { data, error: err } = await supabase
        .from('hair_service')
        .insert(payload)
        .select()
        .single();

      if (err) throw err;
      return data;
    } catch (e) {
      console.error('addService error:', e);
      setError(e.message || 'Failed to add service');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { addService, loading, error };
};

// Dashboard Home hooks
export const useDashboardSummary = () => {
  const { store_id } = useAppData();
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
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardSummary = useCallback(async () => {
    if (!store_id) {
      console.warn('No store_id available, skipping dashboard summary fetch');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      // Get today's date range
      const today = new Date();
      const todayStart = new Date(today);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 999);

      // Get week date range
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      // Get month date range
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);

      // Get previous week and month for growth calculation
      const prevWeekStart = new Date(weekStart);
      prevWeekStart.setDate(weekStart.getDate() - 7);
      const prevWeekEnd = new Date(weekEnd);
      prevWeekEnd.setDate(weekEnd.getDate() - 7);

      const prevMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const prevMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      prevMonthEnd.setHours(23, 59, 59, 999);

      // Fetch upcoming bookings (today and future)
      const { data: upcomingBookings, error: bookingsError } = await supabase
        .from('appointment')
        .select('id')
        .eq('store_id', store_id)
        .gte('"Slot Date"', todayStart.toISOString())
        .in('"Booking Status"', ['confirmed', 'pending']);

      if (bookingsError) throw bookingsError;

      // Fetch total unique clients
      const { data: totalClients, error: clientsError } = await supabase
        .from('customer_info')
        .select('id')
        .eq('store_id', store_id);

      if (clientsError) throw clientsError;

      // Fetch week revenue
      const { data: weekRevenue, error: weekRevenueError } = await supabase
        .from('appointment')
        .select('transaction_final_amount')
        .eq('store_id', store_id)
        .gte('transactions_date', weekStart.toISOString())
        .lte('transactions_date', weekEnd.toISOString())
        .eq('transactions_status', 'paid')
        .not('transaction_final_amount', 'is', null);

      if (weekRevenueError) throw weekRevenueError;

      // Fetch month revenue
      const { data: monthRevenue, error: monthRevenueError } = await supabase
        .from('appointment')
        .select('transaction_final_amount')
        .eq('store_id', store_id)
        .gte('transactions_date', monthStart.toISOString())
        .lte('transactions_date', monthEnd.toISOString())
        .eq('transactions_status', 'paid')
        .not('transaction_final_amount', 'is', null);

      if (monthRevenueError) throw monthRevenueError;

      // Fetch previous week revenue for growth calculation
      const { data: prevWeekRevenue, error: prevWeekError } = await supabase
        .from('appointment')
        .select('transaction_final_amount')
        .eq('store_id', store_id)
        .gte('transactions_date', prevWeekStart.toISOString())
        .lte('transactions_date', prevWeekEnd.toISOString())
        .eq('transactions_status', 'paid')
        .not('transaction_final_amount', 'is', null);

      if (prevWeekError) throw prevWeekError;

      // Fetch previous month revenue for growth calculation
      const { data: prevMonthRevenue, error: prevMonthError } = await supabase
        .from('appointment')
        .select('transaction_final_amount')
        .eq('store_id', store_id)
        .gte('transactions_date', prevMonthStart.toISOString())
        .lte('transactions_date', prevMonthEnd.toISOString())
        .eq('transactions_status', 'paid')
        .not('transaction_final_amount', 'is', null);

      if (prevMonthError) throw prevMonthError;

      // Fetch services
      const { data: services, error: servicesError } = await supabase
        .from('hair_service')
        .select('id, delete_flag')
        .eq('store_id', store_id);

      if (servicesError) throw servicesError;

      // Fetch staff
      const { data: staff, error: staffError } = await supabase
        .from('staff_info')
        .select('id, status, delete_flag')
        .eq('store_id', store_id)
        .neq('delete_flag', true);

      if (staffError) throw staffError;

      // Fetch today's staff attendance
      const { data: attendance, error: attendanceError } = await supabase
        .from('staff_attendance')
        .select('staff_id, status')
        .eq('store_id', store_id)
        .eq('date', today.toISOString().split('T')[0]);

      if (attendanceError) throw attendanceError;

      // Calculate metrics
      const weekRevenueTotal = (weekRevenue || []).reduce(
        (sum, item) => sum + (parseFloat(item.transaction_final_amount) || 0),
        0
      );
      const monthRevenueTotal = (monthRevenue || []).reduce(
        (sum, item) => sum + (parseFloat(item.transaction_final_amount) || 0),
        0
      );
      const prevWeekRevenueTotal = (prevWeekRevenue || []).reduce(
        (sum, item) => sum + (parseFloat(item.transaction_final_amount) || 0),
        0
      );
      const prevMonthRevenueTotal = (prevMonthRevenue || []).reduce(
        (sum, item) => sum + (parseFloat(item.transaction_final_amount) || 0),
        0
      );

      const weekGrowth =
        prevWeekRevenueTotal > 0
          ? ((weekRevenueTotal - prevWeekRevenueTotal) / prevWeekRevenueTotal) * 100
          : 0;
      const monthGrowth =
        prevMonthRevenueTotal > 0
          ? ((monthRevenueTotal - prevMonthRevenueTotal) / prevMonthRevenueTotal) * 100
          : 0;

      const activeServices = (services || []).filter((s) => !s.delete_flag).length;
      const inactiveServices = (services || []).filter((s) => s.delete_flag).length;

      const totalStaff = (staff || []).length;
      const attendanceMap = new Map((attendance || []).map((a) => [a.staff_id, a.status]));
      const absentStaff = (staff || []).filter((s) => {
        const attendanceStatus = attendanceMap.get(s.id);
        return !attendanceStatus || attendanceStatus.toLowerCase() === 'absent';
      }).length;

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
      });
    } catch (e) {
      console.error('fetchDashboardSummary error:', e);
      setError(e.message || 'Failed to fetch dashboard summary');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardSummary();
  }, [fetchDashboardSummary]);

  return { data, loading, error, refetch: fetchDashboardSummary };
};

export const useRecentBookings = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { store_id } = useAppData();

  const fetchRecentBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const today = new Date();
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(today.getDate() - 3);

      const { data: bookings, error: bookingsError } = await supabase
        .from('appointment')
        .select(
          'id, "Customer Name", "Services", "Slot Time", "Booking Status", "Service Price", "Slot Date"'
        )
        .eq('store_id', store_id)
        .gte('"Slot Date"', threeDaysAgo.toISOString())
        .order('"Slot Date"', { ascending: false })
        .limit(5);

      if (bookingsError) throw bookingsError;

      const formattedBookings = (bookings || []).map((booking) => ({
        id: booking.id,
        clientName: booking['Customer Name'] || 'Unknown',
        service: booking['Services'] || 'No service',
        time: booking['Slot Time'] || 'No time',
        status: booking['Booking Status'] || 'pending',
        amount: parseFloat(booking['Service Price']) || 0,
      }));

      setData(formattedBookings);
    } catch (e) {
      console.error('fetchRecentBookings error:', e);
      setError(e.message || 'Failed to fetch recent bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentBookings();
  }, [fetchRecentBookings]);

  return { data, loading, error, refetch: fetchRecentBookings };
};

export const useRecentTransactions = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { store_id } = useAppData();

  const fetchRecentTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: transactions, error: transactionsError } = await supabase
        .from('appointment')
        .select(
          'transaction_id, "Customer Name", payment_method, transactions_status, transaction_final_amount'
        )
        .eq('store_id', store_id)
        .not('transaction_id', 'is', null)
        .not('transactions_status', 'is', null)
        .order('transactions_date', { ascending: false })
        .limit(5);

      if (transactionsError) throw transactionsError;

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
      }));

      setData(formattedTransactions);
    } catch (e) {
      console.error('fetchRecentTransactions error:', e);
      setError(e.message || 'Failed to fetch recent transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentTransactions();
  }, [fetchRecentTransactions]);

  return { data, loading, error, refetch: fetchRecentTransactions };
};

// Staff Payment/Commission hooks
export const useStaffPaymentData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { store_id } = useAppData();

  const fetchStaffPaymentData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current month for attendance calculation
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const monthStart = new Date(currentYear, currentMonth - 1, 1);
      const monthEnd = new Date(currentYear, currentMonth, 0);

      // Fetch all active staff
      const { data: staffList, error: staffError } = await supabase
        .from('staff_info')
        .select(
          'id, staff_name, mobile_number, position, base_salary, commission_rate, commission_type, payment_status'
        )
        .neq('delete_flag', true)
        .order('staff_name', { ascending: true })
        .eq('store_id', store_id);

      if (staffError) throw staffError;

      // Fetch attendance data for current month for each staff member
      const staffWithPaymentData = await Promise.all(
        (staffList || []).map(async (staff) => {
          try {
            // Get attendance count for current month
            const { data: attendanceData, error: attendanceError } = await supabase
              .from('staff_attendance')
              .select('status')
              .eq('staff_id', staff.id)
              .gte('date', monthStart.toISOString().split('T')[0])
              .lte('date', monthEnd.toISOString().split('T')[0])
              .in('status', ['present', 'active', 'p']);

            if (attendanceError) {
              console.warn(`Error fetching attendance for ${staff.staff_name}:`, attendanceError);
            }

            const totalPresent = (attendanceData || []).length;

            // Get total revenue generated by this staff member for commission calculation
            const { data: revenueData, error: revenueError } = await supabase
              .from('appointment')
              .select('transaction_final_amount')
              .eq('staff_id', staff.id)
              .eq('transactions_status', 'paid')
              .gte('transactions_date', monthStart.toISOString())
              .lte('transactions_date', monthEnd.toISOString())
              .not('transaction_final_amount', 'is', null);

            if (revenueError) {
              console.warn(`Error fetching revenue for ${staff.staff_name}:`, revenueError);
            }

            const totalRevenue = (revenueData || []).reduce(
              (sum, item) => sum + (parseFloat(item.transaction_final_amount) || 0),
              0
            );

            // Get values from database columns
            const baseSalary = parseFloat(staff.base_salary) || 25000;
            const commissionRate = parseFloat(staff.commission_rate) || 10;
            const commissionType = staff.commission_type || 'percentage';

            // Calculate pro-rated salary based on attendance
            // Formula: (base_salary / total_days_in_month) * days_present
            const totalDaysInMonth = monthEnd.getDate();
            const proRatedSalary = (baseSalary / totalDaysInMonth) * totalPresent;

            // Calculate commission based on type
            let calculatedCommission = 0;
            if (commissionType === 'percentage') {
              calculatedCommission = totalRevenue * (commissionRate / 100);
            } else {
              calculatedCommission = commissionRate;
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
            };
          } catch (err) {
            console.error(`Error processing staff ${staff.staff_name}:`, err);
            const baseSalary = parseFloat(staff.base_salary) || 25000;
            const totalDaysInMonth = monthEnd.getDate();
            const proRatedSalary = (baseSalary / totalDaysInMonth) * 0; // 0 days present in error case

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
            };
          }
        })
      );

      setData(staffWithPaymentData);
    } catch (e) {
      console.error('fetchStaffPaymentData error:', e);
      setError(e.message || 'Failed to fetch staff payment data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffPaymentData();
  }, [fetchStaffPaymentData]);

  return { data, loading, error, refetch: fetchStaffPaymentData };
};

export const useUpdateStaffPaymentStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { store_id } = useAppData();

  const updatePaymentStatus = async (staffData) => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM format
      const totalSalary = staffData.proRatedSalary + staffData.calculatedCommission;

      // Insert payment record into staff_payments table
      const { data: paymentData, error: paymentError } = await supabase
        .from('staff_payments')
        .insert({
          store_id: store_id,
          staff_id: staffData.id,
          payment_date: now.toISOString().split('T')[0],
          salary_month: currentMonth,
          amount: totalSalary,
          payment_method: 'Bank Transfer',
          status: 'Paid',
          notes: `Salary: ₹${staffData.proRatedSalary} (${staffData.totalPresent}/${staffData.totalDaysInMonth} days) + Commission: ₹${staffData.calculatedCommission}`,
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Update payment status in staff_info table
      const { error: statusError } = await supabase
        .from('staff_info')
        .update({ payment_status: 'paid' })
        .eq('id', staffData.id);

      if (statusError) throw statusError;

      return paymentData;
    } catch (e) {
      console.error('updatePaymentStatus error:', e);
      setError(e.message || 'Failed to update payment status');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updatePaymentStatus, loading, error };
};

// Update service
export const useUpdateService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateService = async (id, serviceData) => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        service_name: serviceData.name,
        service_description: serviceData.description,
        base_price: parseFloat(serviceData.price),
        time_duration: serviceData.duration,
        updated_at: new Date().toISOString(),
      };

      const { data, error: err } = await supabase
        .from('hair_service')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (err) throw err;
      return data;
    } catch (e) {
      console.error('updateService error:', e);
      setError(e.message || 'Failed to update service');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateService, loading, error };
};

// Soft delete/restore service
export const useToggleServiceDelete = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleDelete = async (id, isDeleted) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('hair_service')
        .update({
          delete_flag: isDeleted,
        })
        .eq('id', id)
        .select();

      if (err) throw err;
      return { success: true, data };
    } catch (e) {
      console.error('toggleDelete error:', e);
      setError(e.message || 'Failed to toggle service delete status');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { toggleDelete, loading, error };
};

export const useDeleteService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteService = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const { error: err } = await supabase.from('hair_service').delete().eq('id', id);

      if (err) throw err;
      return true;
    } catch (e) {
      console.error('deleteService error:', e);
      setError(e.message || 'Failed to delete service');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteService, loading, error };
};

//* customer db operation starting from here

export const useGetCustomerDataFetch = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { store_id } = useAppData();

  const getCustomerData = async () => {
    if (!store_id) {
      console.warn('No store_id available, skipping customer data fetch');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customer_info')
        .select('*')
        .eq('store_id', store_id);
      if (error) throw error;
      setData(data);
    } catch (err) {
      console.error('Error fetching customer data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCustomerData();
  }, []);

  return { loading, error, data };
};

//* create the shoap id

export const useCreateShopId = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createShopId = async (shoapName, address, mobileNumber) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stores')
        .insert({
          name: shoapName,
          shop_number: mobileNumber,
          shop_address: address,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error creating shop ID:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { createShopId, loading, error };
};

//* create staff

export const useCreateStaff = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { store_id } = useAppData();

  // Creates Supabase Auth user for staff and upserts into profiles table (like Admin signup)
  const createStaff = async (staffData) => {
    try {
      setLoading(true);

      // Be flexible with input keys coming from StaffDb form
      const email = staffData.email || staffData.emailId;
      const password = staffData.password;
      const fullName = staffData.name || staffData.staffName || '';
      const phone = staffData.mobileNumber || staffData.phone_number || '';
      const address = staffData.address || '';

      if (!email || !password) {
        throw new Error('Email and password are required to create staff user');
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'staff',
            name: fullName,
            phone_number: phone,
            address,
            store_id: store_id || null,
          },
        },
      });

      if (signUpError) throw signUpError;

      const user = data?.user;
      if (user) {
        // Upsert into profiles like in AuthPage.jsx
        const profilePayload = {
          id: user.id,
          email: user.email,
          role: 'staff',
          full_name: fullName,
          phone_number: phone,
          address,
          store_id: store_id || null,
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(profilePayload, { onConflict: 'id' });

        if (profileError) {
          // Log but do not block; caller can still proceed to Step 2
          console.error('Profile upsert error (staff):', profileError.message);
        }
      }

      return data;
    } catch (err) {
      console.error('Error creating staff:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createStaff, loading, error };
};

//* membership section

// Membership assignment operations (membership_users table)
export const useMembershipUserOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { store_id } = useAppData();

  // Assign membership to a customer
  // payload: { customer_id, membership_id | membership, start_date?: string, end_date?: string, is_active?: boolean }
  const assignMembershipToUser = async (payload) => {
    try {
      if (!store_id) throw new Error('Missing store_id');
      if (!payload?.customer_id) throw new Error('customer_id is required');
      if (!payload?.membership_id && !payload?.membership)
        throw new Error('membership id is required');

      setLoading(true);
      setError(null);

      // Coerce to 'date' (YYYY-MM-DD) because table columns are date types
      const toDateOnly = (d) => {
        if (!d) return null;
        const dt = new Date(d);
        if (isNaN(dt)) return null;
        return dt.toISOString().split('T')[0];
      };

      const insertData = {
        customer_id: payload.customer_id,
        // DB column is 'membership' (bigint) not 'membership_id'
        membership: payload.membership ?? payload.membership_id,
        start_date: toDateOnly(payload.start_date) || toDateOnly(new Date()),
        end_date: toDateOnly(payload.end_date),
        is_active: payload.is_active === undefined ? true : Boolean(payload.is_active),
        store_id: store_id,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('membership_users')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('assignMembershipToUser error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Get current active membership(s) for a customer
  const getActiveMembershipsForCustomer = async (customer_id) => {
    try {
      if (!store_id) throw new Error('Missing store_id');
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('membership_users')
        .select('*')
        .eq('store_id', store_id)
        .eq('customer_id', customer_id)
        .eq('is_active', true)
        .order('start_date', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('getActiveMembershipsForCustomer error:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { assignMembershipToUser, getActiveMembershipsForCustomer, loading, error };
};

// List recent membership assignments for the current store
export const useRecentMembershipAssignments = (limit = 25) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { store_id } = useAppData();

  const fetchRecentAssignments = useCallback(async () => {
    if (!store_id) {
      setLoading(false);
      setData([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('membership_users')
        .select(
          `id, created_at, start_date, end_date, is_active,
           customer:customer_info(id, customer_name, mobile_number),
           membership:membership(id, name, price, duration)`
        )
        .eq('store_id', store_id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Normalize for UI
      const rows = (data || []).map((row) => ({
        id: row.id,
        created_at: row.created_at,
        start_date: row.start_date,
        end_date: row.end_date,
        is_active: !!row.is_active,
        customer: row.customer || {},
        membership: row.membership || {},
      }));
      setData(rows);
    } catch (e) {
      console.error('fetchRecentAssignments error:', e);
      setError(e.message || 'Failed to load membership assignments');
    } finally {
      setLoading(false);
    }
  }, [store_id, limit]);

  useEffect(() => {
    fetchRecentAssignments();
  }, [fetchRecentAssignments]);

  return { data, loading, error, refetch: fetchRecentAssignments };
};
