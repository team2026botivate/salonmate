import { motion } from 'framer-motion';
import { Scissors } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AddServiceForm } from './components/service/AddServiceForm';
import { ConfirmationModal } from './components/service/conformationModel';
import  ServicesTable  from './components/service/ServicesTable';
import { SummaryStats } from './components/service/SummaryStats';
import {
  useGetServices,
  useAddService,
  useToggleServiceDelete,
  useDeleteService,
  useGetCategories
} from './hook/dbOperation';

const ServicesDashboard = () => {
  // Supabase hooks
  const { services: rawServices, loading, error, refetch } = useGetServices();
  const { addService, loading: addLoading } = useAddService();
  const { toggleDelete, loading: toggleLoading } = useToggleServiceDelete();
  const { deleteService, loading: deleteLoading } = useDeleteService();
  const { categories, loading: loadingCategories } = useGetCategories();

  // Transform Supabase data to match UI format
  const services = rawServices.map((service) => ({
    id: service.id,
    name: service.service_name,
    duration: service.time_duration,
    price: service.base_price,
    description: service.description,
    isDeleted: service.delete_flag,
    createdAt: new Date(service.created_at),
    categoryId: service.category_id,
    categoryName: service.category_name || 'Uncategorized',
  }));
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: 'delete',
    serviceId: '',
    serviceName: '',
  });

  // Trigger to refresh ServicesTable
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddService = (newService) => {
    // Service is already added by AddServiceForm, trigger refresh
    console.log('New service added:', newService);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleToggleDelete = (id) => {
    const service = services.find((s) => s.id === id);
    if (service) {
      setConfirmationModal({
        isOpen: true,
        type: service.isDeleted ? 'restore' : 'delete',
        serviceId: id,
        serviceName: service.name,
      });
    }
  };

  const handleDeletePermanently = (id) => {
    const service = services.find((s) => s.id === id);
    if (service) {
      setConfirmationModal({
        isOpen: true,
        type: 'delete',
        serviceId: id,
        serviceName: service.name,
      });
    }
  };

  const confirmAction = async () => {
    if (confirmationModal.type === 'delete') {
      // Check if this is permanent delete or soft delete
      const service = services.find((s) => s.id === confirmationModal.serviceId);
      if (service?.isDeleted) {
        // Permanent delete
        const result = await deleteService(confirmationModal.serviceId);
        if (result) {
          setRefreshTrigger(prev => prev + 1);
        }
      } else {
        // Soft delete
        const result = await toggleDelete(confirmationModal.serviceId, true);
        if (result) {
          setRefreshTrigger(prev => prev + 1);
        }
      }
    } else {
      // Restore
      const result = await toggleDelete(confirmationModal.serviceId, false);
      if (result) {
        setRefreshTrigger(prev => prev + 1);
      }
    }

    setConfirmationModal({
      isOpen: false,
      type: 'delete',
      serviceId: '',
      serviceName: '',
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-indigo-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="mb-4 text-red-600">Error loading services: {error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200 shadow-sm"
      >
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-600 rounded-xl">
              <Scissors className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Salon Admin Dashboard</h1>
              <p className="mt-1 text-gray-600">Manage your salon services and pricing</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Summary Stats */}
        <SummaryStats services={services} />

        {/* Add New Service Form */}
        <div className="mb-8">
          <AddServiceForm onAddService={handleAddService} loading={addLoading} />
        </div>

        {/* Services Table */}
        <ServicesTable
          onToggleDelete={handleToggleDelete}
          onDeletePermanently={handleDeletePermanently}
          refreshTrigger={refreshTrigger}
        />
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmAction}
        title={
          confirmationModal.type === 'restore'
            ? 'Restore Service'
            : services.find((s) => s.id === confirmationModal.serviceId)?.isDeleted
              ? 'Delete Permanently'
              : 'Soft Delete Service'
        }
        message={
          confirmationModal.type === 'restore'
            ? `Are you sure you want to restore "${confirmationModal.serviceName}"? This service will become active again.`
            : services.find((s) => s.id === confirmationModal.serviceId)?.isDeleted
              ? `Are you sure you want to permanently delete "${confirmationModal.serviceName}"? This action cannot be undone.`
              : `Are you sure you want to soft delete "${confirmationModal.serviceName}"? You can restore it later if needed.`
        }
        confirmText={confirmationModal.type === 'restore' ? 'Restore' : 'Delete'}
        type={confirmationModal.type === 'restore' ? 'info' : 'danger'}
      />
    </div>
  );
};

export default ServicesDashboard;
