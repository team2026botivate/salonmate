import React, { useState } from 'react';
import {
  Tag,
  Search,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  Percent,
  Calendar,
  Filter,
  Grid3X3,
  List,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import NotificationSystem from './notificationSystem';
import { usePromoCardOperations } from '../../hook/dbOperation';

const PromoCard = () => {
  const {
    promoCards,
    loading,
    error,
    addPromoCard,
    updatePromoCard,
    deletePromoCard,
    checkPromoCodeExists,
    getActivePromoCards,
  } = usePromoCardOperations();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingPromoId, setEditingPromoId] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [filterStatus, setFilterStatus] = useState('active'); // 'all', 'active', 'expired'
  const [newPromo, setNewPromo] = useState({
    code: '',
    discount: '',
    description: '',
    startDate: '',
    endDate: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [promoToDelete, setPromoToDelete] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Show notification helper
  const showNotification = (message, type = 'success') => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications((prev) => [...prev, notification]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Filter promos by search term and status
  const filteredPromos = promoCards.filter((promo) => {
    const matchesSearch = `${promo.code} ${promo.description}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    const isActive = isPromoActive(promo);
    // By default, hide expired promos even in 'all'
    if (filterStatus === 'all') return isActive;

    return filterStatus === 'active' ? isActive : !isActive;
  });

  // Handle input change for forms
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPromo({ ...newPromo, [name]: value });
  };

  // Handle adding new promo
  const handleAddPromo = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Check if promo code already exists
      const codeExists = await checkPromoCodeExists(newPromo.code);
      if (codeExists) {
        showNotification(
          'Promo code already exists. Please use a different code.',
          'error'
        );
        return;
      }

      // Validate dates
      const startDate = new Date(newPromo.startDate);
      const endDate = new Date(newPromo.endDate);
      if (startDate >= endDate) {
        showNotification('End date must be after start date.', 'error');
        return;
      }

      const result = await addPromoCard(newPromo);

      if (result.success) {
        setShowAddForm(false);
        // Reset form
        setNewPromo({
          code: '',
          discount: '',
          description: '',
          startDate: '',
          endDate: '',
        });
        showNotification('Promoal card created successfully!');
      } else {
        showNotification(`Failed to create Promoal card: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error adding promo:', error);
      showNotification(`Failed to create Promoal card: ${error.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle opening add form
  const handleAddPromoClick = () => {
    const today = new Date().toISOString().split('T')[0];
    const promoCode = `PROMO${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    setNewPromo({
      code: promoCode,
      discount: '',
      description: '',
      startDate: today,
      endDate: '',
    });
    setShowAddForm(true);
  };

  // Handle editing a promo
  const handleEditPromo = (promo) => {
    setEditingPromoId(promo.id);
    setNewPromo({
      code: promo.code,
      discount: promo.discount.toString(),
      description: promo.description,
      startDate: promo.start_date || '',
      endDate: promo.end_date || '',
    });
    setShowEditForm(true);
  };

  // Handle updating a promo
  const handleUpdatePromo = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Check if promo code already exists (excluding current promo)
      const codeExists = await checkPromoCodeExists(
        newPromo.code,
        editingPromoId
      );
      if (codeExists) {
        showNotification(
          'Promo code already exists. Please use a different code.',
          'error'
        );
        return;
      }

      // Validate dates
      const startDate = new Date(newPromo.startDate);
      const endDate = new Date(newPromo.endDate);
      if (startDate >= endDate) {
        showNotification('End date must be after start date.', 'error');
        return;
      }

      const result = await updatePromoCard(editingPromoId, newPromo);

      if (result.success) {
        setEditingPromoId(null);
        setShowEditForm(false);
        showNotification('Promoal card updated successfully!');
      } else {
        showNotification(
          `Failed to update Promoal card: ${result.error}`,
          'error'
        );
      }
    } catch (error) {
      console.error('Error updating promo:', error);
      showNotification(`Failed to update Promoal card: ${error.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (promo) => {
    setPromoToDelete(promo);
    setShowDeleteModal(true);
  };

  // Confirm delete promo
  const confirmDelete = async () => {
    try {
      setSubmitting(true);

      const result = await deletePromoCard(promoToDelete.id);

      if (result.success) {
        showNotification('Promo card removed successfully!');
      } else {  
        showNotification(
          `Failed to remove Promo card: ${result.error}`,
          'error'
        );
      }
    } catch (error) {
      console.error('Error deleting promo:', error);
      showNotification(`Failed to remove promo card: ${error.message}`, 'error');
    } finally {
      setSubmitting(false);
      setShowDeleteModal(false);
      setPromoToDelete(null);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPromoToDelete(null);
  };

  // Check if promo is currently active (function declaration so it is hoisted)
  function isPromoActive(promo) {
    if (!promo.start_date || !promo.end_date) return true;

    // Normalize to start of day to avoid time-of-day issues
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(promo.start_date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(promo.end_date);
    endDate.setHours(0, 0, 0, 0);

    // Consider end date equal to today as expired (strictly before end)
    return today >= startDate && today < endDate;
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (promo) => {
    const isActive = isPromoActive(promo);
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle2 size={12} className="mr-1" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <Clock size={12} className="mr-1" />
        Expired
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Promo Cards</h2>
          <p className="mt-1 text-sm text-gray-600">
            Create and manage discount codes and Promo cards
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List size={16} />
            </button>
          </div>
          <button
            onClick={handleAddPromoClick}
            className="flex items-center px-4 py-2 space-x-2 text-white transition-colors duration-200 bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700"
          >
            <Plus size={18} />
            <span>Add Promo</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
              size={18}
            />
            <input
              type="text"
              placeholder="Search Promos..."
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="expired">Expired Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-12 text-center bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="inline-block w-8 h-8 mb-4 border-2 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          <p className="text-gray-600">Loading Promoal cards...</p>
        </div>
      ) : error ? (
        <div className="p-4 text-center text-red-800 rounded-md bg-red-50">
          {error}
          <button
            className="ml-2 underline"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPromos?.length > 0 ? (
                filteredPromos?.map((promo) => (
                  <div
                    key={promo.id}
                    className="overflow-hidden transition-shadow duration-200 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center mb-2 space-x-2">
                            <div className="bg-blue-100 p-1.5 rounded-lg">
                              <Tag className="text-blue-600" size={16} />
                            </div>
                            <h3 className="font-semibold text-gray-900">{promo.code}</h3>
                          </div>
                          {getStatusBadge(promo)}
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleEditPromo(promo)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(promo)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center mb-3">
                        <Percent className="mr-2 text-green-600" size={18} />
                        <span className="text-2xl font-bold text-green-600">{promo.discount}%</span>
                        <span className="ml-2 text-sm text-gray-600">discount</span>
                      </div>

                      <p className="mb-4 text-sm text-gray-600 line-clamp-2">{promo.description}</p>

                      {promo.end_date && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar size={12} className="mr-1" />
                          <span>Expires: {formatDate(promo.end_date)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center bg-white border border-gray-200 rounded-lg shadow-sm col-span-full">
                  <Tag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="mb-2 text-lg font-medium text-gray-900">No Promos found</h3>
                  <p className="mb-4 text-gray-600">
                    Get started by creating your first Promoal campaign.
                  </p>
                  <button
                    onClick={handleAddPromoClick}
                    className="px-4 py-2 text-white transition-colors duration-200 bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Add Promo
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Code
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Discount
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Description
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Period
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredPromos.length > 0 ? (
                      filteredPromos.map((promo) => (
                        <tr key={promo.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="bg-blue-100 p-1.5 rounded-lg mr-3">
                                <Tag className="text-blue-600" size={14} />
                              </div>
                              <span className="font-medium text-gray-900">{promo.code}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Percent className="mr-1 text-green-600" size={14} />
                              <span className="font-semibold text-green-600">
                                {promo.discount}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-xs text-sm text-gray-900 truncate">
                              {promo.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            {formatDate(promo.start_date)} - {formatDate(promo.end_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(promo)}</td>
                          <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleEditPromo(promo)}
                                className="p-1 text-blue-600 transition-colors rounded hover:text-blue-900 hover:bg-blue-50"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(promo)}
                                className="p-1 text-red-600 transition-colors rounded hover:text-red-900 hover:bg-red-50"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          <Tag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <div>No Promoal cards found</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Promo Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowAddForm(false)}
            ></div>

            <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Create New Promo</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 transition-colors hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddPromo} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Promo Code
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={newPromo.code}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Discount Percentage
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="discount"
                        value={newPromo.discount}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <Percent
                        className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2"
                        size={16}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={newPromo.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={newPromo.startDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={newPromo.endDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6 space-x-3 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        Create Promo
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Promo Modal */}
      {showEditForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowEditForm(false)}
            ></div>

            <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Edit Promo</h3>
                <button
                  onClick={() => setShowEditForm(false)}
                  className="text-gray-400 transition-colors hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleUpdatePromo} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Promo Code
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={newPromo.code}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Discount Percentage
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="discount"
                        value={newPromo.discount}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <Percent
                        className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2"
                        size={16}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={newPromo.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={newPromo.startDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={newPromo.endDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6 space-x-3 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowEditForm(false)}
                    className="px-4 py-2 text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        Update Promo
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={cancelDelete}
            ></div>

            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
              </div>

              <div className="text-center">
                <h3 className="mb-2 text-lg font-medium text-gray-900">Delete Promo</h3>
                <p className="mb-6 text-sm text-gray-500">
                  Are you sure you want to delete this Promoal card? This action cannot be
                  undone.
                  {promoToDelete && (
                    <span className="block mt-2 font-medium text-gray-900">
                      Code: {promoToDelete.code}
                    </span>
                  )}
                </p>
              </div>

              <div className="flex justify-center space-x-3">
                <button
                  type="button"
                  onClick={cancelDelete}
                  className="px-4 py-2 text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex items-center px-4 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} className="mr-2" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification System */}
      <NotificationSystem notifications={notifications} removeNotification={removeNotification} />
    </div>
  );
};

export default PromoCard;
