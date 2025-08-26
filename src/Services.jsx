import { motion } from 'framer-motion';
import { Scissors } from 'lucide-react';
import { useState } from 'react';
import { AddServiceForm } from './components/service/AddServiceForm';
import { ConfirmationModal } from './components/service/conformationModel';
import { ServicesTable } from './components/service/ServicesTable';
import { SummaryStats } from './components/service/SummaryStats';

// Mock initial data
const initialServices = [
  {
    id: '1',
    name: 'Haircut & Style',
    duration: '1 hour',
    price: 85.00,
    description: 'Professional cut and styling',
    isDeleted: false,
    createdAt: new Date('2024-01-15T10:00:00')
  },
  {
    id: '2',
    name: 'Hair Coloring',
    duration: '2 hours',
    price: 150.00,
    description: 'Full hair color treatment',
    isDeleted: false,
    createdAt: new Date('2024-01-14T14:30:00')
  },
  {
    id: '3',
    name: 'Manicure',
    duration: '45 min',
    price: 35.00,
    description: 'Classic nail care service',
    isDeleted: false,
    createdAt: new Date('2024-01-13T09:15:00')
  },
  {
    id: '4',
    name: 'Deep Conditioning',
    duration: '30 min',
    price: 45.00,
    description: 'Intensive hair treatment',
    isDeleted: true,
    createdAt: new Date('2024-01-12T16:45:00')
  },
  {
    id: '5',
    name: 'Eyebrow Threading',
    duration: '15 min',
    price: 25.00,
    description: 'Precise eyebrow shaping',
    isDeleted: false,
    createdAt: new Date('2024-01-11T11:20:00')
  },
  {
    id: '6',
    name: 'Facial Treatment',
    duration: '1.5 hours',
    price: 120.00,
    description: 'Relaxing skin care treatment',
    isDeleted: false,
    createdAt: new Date('2024-01-10T13:00:00')
  }
];

 const ServicesDashboard = () => {
  const [services, setServices] = useState(initialServices);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: 'delete',
    serviceId: '',
    serviceName: ''
  });

  const handleAddService = (data) => {
    const newService = {
      id: Date.now().toString(),
      name: data.name,
      duration: data.duration,
      price: parseFloat(data.price),
      description: data.description,
      isDeleted: false,
      createdAt: new Date()
    };
    
    setServices(prev => [newService, ...prev]);
  };

  const handleToggleDelete = (id) => {
    const service = services.find(s => s.id === id);
    if (service) {
      setConfirmationModal({
        isOpen: true,
        type: service.isDeleted ? 'restore' : 'delete',
        serviceId: id,
        serviceName: service.name
      });
    }
  };

  const handleDeletePermanently = (id) => {
    const service = services.find(s => s.id === id);
    if (service) {
      setConfirmationModal({
        isOpen: true,
        type: 'delete',
        serviceId: id,
        serviceName: service.name
      });
    }
  };

  const confirmAction = () => {
    if (confirmationModal.type === 'delete') {
      // Check if this is permanent delete or soft delete
      const service = services.find(s => s.id === confirmationModal.serviceId);
      if (service?.isDeleted) {
        // Permanent delete
        setServices(prev => prev.filter(s => s.id !== confirmationModal.serviceId));
      } else {
        // Soft delete
        setServices(prev => 
          prev.map(s => 
            s.id === confirmationModal.serviceId 
              ? { ...s, isDeleted: true }
              : s
          )
        );
      }
    } else {
      // Restore
      setServices(prev => 
        prev.map(s => 
          s.id === confirmationModal.serviceId 
            ? { ...s, isDeleted: false }
            : s
        )
      );
    }
    
    setConfirmationModal({
      isOpen: false,
      type: 'delete',
      serviceId: '',
      serviceName: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-600 p-3 rounded-xl">
              <Scissors className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Salon Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your salon services and pricing</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <SummaryStats services={services} />

        {/* Add New Service Form */}
        <div className="mb-8">
          <AddServiceForm onAddService={handleAddService} />
        </div>

        {/* Services Table */}
        <ServicesTable 
          services={services}
          onToggleDelete={handleToggleDelete}
          onDeletePermanently={handleDeletePermanently}
        />
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmAction}
        title={
          confirmationModal.type === 'restore' 
            ? 'Restore Service' 
            : services.find(s => s.id === confirmationModal.serviceId)?.isDeleted
              ? 'Delete Permanently'
              : 'Soft Delete Service'
        }
        message={
          confirmationModal.type === 'restore'
            ? `Are you sure you want to restore "${confirmationModal.serviceName}"? This service will become active again.`
            : services.find(s => s.id === confirmationModal.serviceId)?.isDeleted
              ? `Are you sure you want to permanently delete "${confirmationModal.serviceName}"? This action cannot be undone.`
              : `Are you sure you want to soft delete "${confirmationModal.serviceName}"? You can restore it later if needed.`
        }
        confirmText={
          confirmationModal.type === 'restore' 
            ? 'Restore' 
            : 'Delete'
        }
        type={confirmationModal.type === 'restore' ? 'info' : 'danger'}
      />
    </div>
  );
};


export default ServicesDashboard
