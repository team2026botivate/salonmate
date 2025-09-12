import React, { useState } from 'react';
import {
  Crown,
  Search,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  DollarSign,
  Clock,
  CheckCircle2,
  Filter,
  Grid3X3,
  List,
  Star,
  IndianRupee,
} from 'lucide-react';
import NotificationSystem from './notificationSystem';

const Membership = () => {
  // Mock data
  const mockMemberships = [
    {
      id: 1,
      name: 'Gold Membership',
      price: 499,
      duration: '3 Months',
      benefits: ['Priority Support', 'Exclusive Content', 'Advanced Features', 'Monthly Webinars'],
      featured: true,
    },
    {
      id: 2,
      name: 'Silver Membership',
      price: 299,
      duration: '2 Months',
      benefits: ['Standard Support', 'Basic Features', 'Community Access'],
    },
    {
      id: 3,
      name: 'Platinum Membership',
      price: 999,
      duration: '6 Months',
      benefits: [
        '24/7 Priority Support',
        'All Premium Features',
        'Personal Account Manager',
        'Custom Integrations',
      ],
      featured: true,
    },
  ];

  // State
  const [memberships] = useState(mockMemberships);
  const [loading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingMembershipId, setEditingMembershipId] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [newMembership, setNewMembership] = useState({
    name: '',
    price: '',
    duration: '',
    benefits: [''],
  });
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [membershipToDelete, setMembershipToDelete] = useState(null);
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

  // Filter memberships by search term
  const filteredMemberships = memberships.filter(
    (membership) =>
      membership.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      membership.benefits.some((benefit) =>
        benefit.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // Handle input change for forms
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMembership({ ...newMembership, [name]: value });
  };

  // Handle benefits array changes
  const handleBenefitChange = (index, value) => {
    const updatedBenefits = [...newMembership.benefits];
    updatedBenefits[index] = value;
    setNewMembership({ ...newMembership, benefits: updatedBenefits });
  };

  const addBenefit = () => {
    setNewMembership({
      ...newMembership,
      benefits: [...newMembership.benefits, ''],
    });
  };

  const removeBenefit = (index) => {
    if (newMembership.benefits.length > 1) {
      const updatedBenefits = newMembership.benefits.filter((_, i) => i !== index);
      setNewMembership({ ...newMembership, benefits: updatedBenefits });
    }
  };

  // Handle adding new membership
  const handleAddMembership = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Filter out empty benefits
      const filteredBenefits = newMembership.benefits.filter((benefit) => benefit.trim() !== '');

      if (filteredBenefits.length === 0) {
        showNotification('Please add at least one benefit.', 'error');
        return;
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setShowAddForm(false);
      setNewMembership({
        name: '',
        price: '',
        duration: '',
        benefits: [''],
      });
      showNotification('Membership plan created successfully!');
    } catch (error) {
      showNotification('Failed to create membership plan.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle opening add form
  const handleAddMembershipClick = () => {
    setNewMembership({
      name: '',
      price: '',
      duration: '',
      benefits: [''],
    });
    setShowAddForm(true);
  };

  // Handle editing a membership
  const handleEditMembership = (membership) => {
    setEditingMembershipId(membership.id);
    setNewMembership({
      name: membership.name,
      price: membership.price.toString(),
      duration: membership.duration,
      benefits: [...membership.benefits],
    });
    setShowEditForm(true);
  };

  // Handle updating a membership
  const handleUpdateMembership = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Filter out empty benefits
      const filteredBenefits = newMembership.benefits.filter((benefit) => benefit.trim() !== '');

      if (filteredBenefits.length === 0) {
        showNotification('Please add at least one benefit.', 'error');
        return;
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setEditingMembershipId(null);
      setShowEditForm(false);
      showNotification('Membership plan updated successfully!');
    } catch (error) {
      showNotification('Failed to update membership plan.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (membership) => {
    setMembershipToDelete(membership);
    setShowDeleteModal(true);
  };

  // Confirm delete membership
  const confirmDelete = async () => {
    try {
      setSubmitting(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      showNotification('Membership plan removed successfully!');
    } catch (error) {
      showNotification('Failed to remove membership plan.', 'error');
    } finally {
      setSubmitting(false);
      setShowDeleteModal(false);
      setMembershipToDelete(null);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setMembershipToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Membership Plans</h2>
          <p className="mt-1 text-sm text-gray-600">
            Create and manage subscription plans and membership tiers
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List size={16} />
            </button>
          </div>
          <button
            onClick={handleAddMembershipClick}
            className="flex items-center px-4 py-2 space-x-2 text-white transition-colors duration-200 bg-orange-600 rounded-lg shadow-sm hover:bg-orange-700"
          >
            <Plus size={18} />
            <span>Add Membership</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="relative max-w-md">
          <Search
            className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
            size={18}
          />
          <input
            type="text"
            placeholder="Search memberships..."
            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-12 text-center bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="inline-block w-8 h-8 mb-4 border-2 border-orange-600 rounded-full border-t-transparent animate-spin"></div>
          <p className="text-gray-600">Loading membership plans...</p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredMemberships.length > 0 ? (
                filteredMemberships.map((membership) => (
                  <div
                    key={membership.id}
                    className={`relative bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow duration-200 ${
                      membership.featured
                        ? 'border-orange-200 ring-2 ring-orange-100'
                        : 'border-gray-200'
                    }`}
                  >
                    {membership.featured && (
                      <div className="absolute top-0 right-0 px-3 py-1 text-xs font-medium text-white bg-orange-500 rounded-bl-lg">
                        <Star size={12} className="inline mr-1" />
                        Featured
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center mb-2 space-x-2">
                            <div className="bg-orange-100 p-1.5 rounded-lg">
                              <Crown className="text-orange-600" size={16} />
                            </div>
                            <h3 className="font-semibold text-gray-900">{membership.name}</h3>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleEditMembership(membership)}
                            className="p-1.5 text-gray-400 hover:text-orange-600 rounded-md hover:bg-orange-50 transition-colors"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(membership)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-baseline mb-4">
                        <DollarSign className="text-green-600" size={20} />
                        <span className="text-3xl font-bold text-gray-900">{membership.price}</span>
                        <span className="ml-2 text-gray-600">/ {membership.duration}</span>
                      </div>

                      <div className="mb-4 space-y-2">
                        {membership.benefits.slice(0, 3).map((benefit, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <CheckCircle2 size={14} className="flex-shrink-0 mr-2 text-green-500" />
                            <span>{benefit}</span>
                          </div>
                        ))}
                        {membership.benefits.length > 3 && (
                          <div className="text-sm text-gray-500">
                            +{membership.benefits.length - 3} more benefits
                          </div>
                        )}
                      </div>

                      <div className="flex items-center text-xs text-gray-500">
                        <Clock size={12} className="mr-1" />
                        <span>Duration: {membership.duration}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center bg-white border border-gray-200 rounded-lg shadow-sm col-span-full">
                  <Crown className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="mb-2 text-lg font-medium text-gray-900">
                    No membership plans found
                  </h3>
                  <p className="mb-4 text-gray-600">
                    Get started by creating your first membership plan.
                  </p>
                  <button
                    onClick={handleAddMembershipClick}
                    className="px-4 py-2 text-white transition-colors duration-200 bg-orange-600 rounded-lg hover:bg-orange-700"
                  >
                    Add Membership
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
                        Plan
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Price
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Benefits
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredMemberships.length > 0 ? (
                      filteredMemberships.map((membership) => (
                        <tr key={membership.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="bg-orange-100 p-1.5 rounded-lg mr-3">
                                <Crown className="text-orange-600" size={14} />
                              </div>
                              <div>
                                <div className="flex items-center font-medium text-gray-900">
                                  {membership.name}
                                  {membership.featured && (
                                    <Star size={12} className="ml-2 text-orange-500" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <DollarSign className="mr-1 text-green-600" size={14} />
                              <span className="font-semibold text-gray-900">
                                {membership.price}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            {membership.duration}
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-xs text-sm text-gray-900">
                              {membership.benefits.slice(0, 2).join(', ')}
                              {membership.benefits.length > 2 && (
                                <span className="text-gray-500">
                                  {' '}
                                  +{membership.benefits.length - 2} more
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleEditMembership(membership)}
                                className="p-1 text-orange-600 transition-colors rounded hover:text-orange-900 hover:bg-orange-50"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(membership)}
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
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                          <Crown className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <div>No membership plans found</div>
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

      {/* Add Membership Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowAddForm(false)}
            ></div>

            <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Create New Membership Plan</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 transition-colors hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddMembership} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Plan Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newMembership.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Gold Membership"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Price</label>
                    <div className="relative">
                      <input
                        type="number"
                        name="price"
                        value={newMembership.price}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                      <IndianRupee
                        className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
                        size={16}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-gray-700">Duration</label>
                    <input
                      type="text"
                      name="duration"
                      value={newMembership.duration}
                      onChange={handleInputChange}
                      placeholder="e.g., 3 Months, 1 Year"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-gray-700">Benefits</label>
                    <div className="space-y-3">
                      {newMembership.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={benefit}
                            onChange={(e) => handleBenefitChange(index, e.target.value)}
                            placeholder="Enter benefit"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                          {newMembership.benefits.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeBenefit(index)}
                              className="p-2 text-red-600 rounded-md hover:text-red-800 hover:bg-red-50"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addBenefit}
                        className="flex items-center px-3 py-2 text-orange-600 transition-colors border border-orange-300 rounded-lg hover:bg-orange-50"
                      >
                        <Plus size={16} className="mr-2" />
                        Add Benefit
                      </button>
                    </div>
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
                    className="flex items-center px-4 py-2 text-white transition-colors bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50"
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
                        Create Plan
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Membership Modal */}
      {showEditForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowEditForm(false)}
            ></div>

            <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Edit Membership Plan</h3>
                <button
                  onClick={() => setShowEditForm(false)}
                  className="text-gray-400 transition-colors hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleUpdateMembership} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Plan Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newMembership.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Gold Membership"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Price</label>
                    <div className="relative">
                      <input
                        type="number"
                        name="price"
                        value={newMembership.price}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                      <DollarSign
                        className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
                        size={16}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-gray-700">Duration</label>
                    <input
                      type="text"
                      name="duration"
                      value={newMembership.duration}
                      onChange={handleInputChange}
                      placeholder="e.g., 3 Months, 1 Year"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-gray-700">Benefits</label>
                    <div className="space-y-3">
                      {newMembership.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={benefit}
                            onChange={(e) => handleBenefitChange(index, e.target.value)}
                            placeholder="Enter benefit"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                          {newMembership.benefits.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeBenefit(index)}
                              className="p-2 text-red-600 rounded-md hover:text-red-800 hover:bg-red-50"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addBenefit}
                        className="flex items-center px-3 py-2 text-orange-600 transition-colors border border-orange-300 rounded-lg hover:bg-orange-50"
                      >
                        <Plus size={16} className="mr-2" />
                        Add Benefit
                      </button>
                    </div>
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
                    className="flex items-center px-4 py-2 text-white transition-colors bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50"
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
                        Update Plan
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
                <h3 className="mb-2 text-lg font-medium text-gray-900">Delete Membership Plan</h3>
                <p className="mb-6 text-sm text-gray-500">
                  Are you sure you want to delete this membership plan? This action cannot be
                  undone.
                  {membershipToDelete && (
                    <span className="block mt-2 font-medium text-gray-900">
                      Plan: {membershipToDelete.name}
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

export default Membership;
