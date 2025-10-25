import React, { useEffect, useState } from 'react';
import { Check, Loader2, Scissors, Sparkles } from 'lucide-react';
import { useCreateExtraService, useGetExtraServiceDataFetch } from '../../hook/dbOperation';
import { formateCurrency } from '../../utils/formateCurrency.utils';
import { motion } from 'framer-motion';
import supabase from '../../dataBase/connectdb';

// Match BookingForm.jsx status styles
const statusOptions = [
  {
    value: 'completed',
    label: 'Completed',
    color: 'bg-green-100 text-yellow-800',
  },
  {
    value: 'done',
    label: 'done',
    color: 'bg-blue-100 text-blue-800',
  },
];

const MultiServiceSelector = ({ appointmentId, bookingStatus, closeEditBox, service, staffId }) => {
  const {
    createExtraService,
    loading: loadingCreate,
    error: errorCreate,
  } = useCreateExtraService();
  const { data, loading, error } = useGetExtraServiceDataFetch(appointmentId);
  const [selectedServices, setSelectedServices] = useState([]);
  const [status, setStatus] = useState('completed');
  const [filterdService, setfilterdService] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleServiceChange = (service) => {
    setSelectedServices((prev) => {
      const isSelected = prev.some((s) => s.service_name === service.service_name);
      if (isSelected) {
        return prev.filter((s) => s.service_name !== service.service_name);
      } else {
        return [...prev, service];
      }
    });
  };

  const getTotalPrice = () => {
    return selectedServices.reduce(
      (total, service) => total + (Number(service.base_price) || 0),
      0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!appointmentId) {
      console.error('No appointment ID provided');
      return;
    }

    if (isSubmitting) return; // Prevent double submission

    setIsSubmitting(true);
    try {
      
      closeEditBox(false);

    
      await createExtraService(
        appointmentId,
        selectedServices,
        status === 'done' ? 'done' : null
      );

    
      if (status === 'done' && staffId) {
        const ids = Array.isArray(staffId)
          ? staffId
              .map((v) => (typeof v === 'string' ? v : v?.id))
              .filter(Boolean)
          : [typeof staffId === 'string' ? staffId : staffId?.id].filter(Boolean);
        for (const id of ids) {
          try {
            const { error: staffUpdateError } = await supabase
              .from('staff_info')
              .update({ status: 'active' })
              .eq('id', id);
            if (staffUpdateError) throw staffUpdateError;
          } catch (staffErr) {
            console.error('Failed to set staff status active:', staffErr);
          }
        }
      }
    } catch (error) {
      console.error('Error submitting extra services:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  // Memoize filtered services to avoid unnecessary re-renders
  useEffect(() => {
    setStatus(bookingStatus);
  }, [bookingStatus]);

  useEffect(() => {
    if (data) {
      const filteredService = data.filter((s) => s.service_name !== service);
      setfilterdService(filteredService);
    }
  }, [service, data]);

  if (loading) {
    return (
      <div className="w-full max-w-5xl p-3 mx-auto sm:p-4">
        <div className="max-w-4xl mx-auto">
          <div className="p-6 bg-white shadow-lg rounded-2xl">
            <div className="space-y-4 animate-pulse">
              <div className="w-1/3 h-6 bg-gray-200 rounded" />
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="p-4 border rounded-xl">
                    <div className="w-2/3 h-4 mb-3 bg-gray-200 rounded" />
                    <div className="w-1/3 h-4 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-5xl p-3 mx-auto sm:p-4">
        <div className="max-w-4xl mx-auto">
          <div className="p-6 text-red-600 bg-white shadow-lg rounded-2xl">
            Failed to load services: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="w-full max-w-5xl p-3 mx-auto sm:p-4"
      initial={{ opacity: 0, y: 12, scale: 0.995 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.995 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Services Selection */}
          <div className="lg:col-span-2">
            <div className="p-4 bg-white shadow-lg rounded-2xl">
              <h2 className="flex items-center mb-6 text-xl font-semibold text-gray-800">
                <Sparkles className="w-5 h-5 mr-2 text-rose-600" />
                Available Services
              </h2>

              <div className="space-y-4">
                <div className="mb-6">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Booking Status
                  </label>
                  <select
                    required
                    name="bookingStatus"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={`w-full rounded-lg border border-gray-200 px-4 py-3 outline-none ${
                      statusOptions.find((o) => o.value === status)?.color || ''
                    }`}
                  >
                    {statusOptions.map((option) => (
                      <option className="bg-white w-fit" key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <h1 className="flex items-center text-xl font-semibold text-gray-800">
                  Extra Services
                </h1>
                <div className="grid gap-4 md:grid-cols-2">
                  {filterdService.map((service, inx) => {
                    const isSelected = selectedServices.some(
                      (s) => s.service_name === service.service_name
                    );
                    return (
                      <motion.label
                        key={service.service_name || inx}
                        className={`relative flex cursor-pointer items-center rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        layout
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 24,
                        }}
                      >
                        <div className="flex items-center flex-1">
                          <div className="relative">
                            <input
                              type="checkbox"
                              value={service.service_name}
                              checked={isSelected}
                              onChange={() => handleServiceChange(service)}
                              className="sr-only"
                            />
                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all duration-200 ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-gray-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                          </div>

                          <div className="flex-1 ml-3">
                            <div className="flex items-center justify-between">
                              <span
                                className={`font-medium ${
                                  isSelected ? 'text-blue-900' : 'text-gray-800'
                                }`}
                              >
                                {service.service_name}
                              </span>
                              <span
                                className={`text-sm font-semibold ${
                                  isSelected ? 'text-blue-700' : 'text-gray-600'
                                }`}
                              >
                                {formateCurrency(service.base_price)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Selected Services Summary */}
          <div className="hideScrollBar max-h-[calc(100vh-10rem)] overflow-y-auto rounded-2xl lg:col-span-1">
            <div className="p-6 bg-white shadow-lg rounded-2xl lg:sticky lg:top-6">
              <h3 className="mb-4 text-xl font-semibold text-gray-800">Your Selection</h3>

              {selectedServices.length > 0 ? (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {selectedServices.map((service) => (
                      <motion.div
                        key={service.service_name}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                        layout
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 26,
                        }}
                      >
                        <span className="text-sm text-gray-700">{service.service_name}</span>
                        <span className="font-semibold text-gray-800">
                          {formateCurrency(service.base_price)}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-800">Total</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {formateCurrency(getTotalPrice())}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {selectedServices.length} service
                      {selectedServices.length !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
                    <Scissors className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">No services selected</p>
                  <p className="mt-1 text-xs text-gray-400">Choose services to see your total</p>
                </div>
              )}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loadingCreate || isSubmitting}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold shadow-lg transition-all duration-200 ${
                    loadingCreate || isSubmitting
                      ? 'cursor-not-allowed bg-gray-400'
                      : 'transform bg-gradient-to-r from-blue-600 to-blue-600 hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-700 hover:shadow-xl'
                  } text-white`}
                >
                  {loadingCreate || isSubmitting ? 'Processing...' : 'Done'}
                  {(loadingCreate || isSubmitting) && <Loader2 className="w-5 h-5 animate-spin" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MultiServiceSelector;
