"use client"

import React, { useState, useEffect } from 'react';
import { Tag, Search, Edit, Trash2, Plus, Save, X, Percent, Calendar } from 'lucide-react';

const PromoCard = () => {
  // State for promo data and UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [promoList, setPromoList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPromoId, setEditingPromoId] = useState(null);
  const [newPromo, setNewPromo] = useState({
    code: '',
    discount: '',
    description: '',
    startDate: '',
    endDate: '',
    createdAt: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: ""
  });
  
  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [promoToDelete, setPromoToDelete] = useState(null);
  
  // State for edit form modal
  const [showEditForm, setShowEditForm] = useState(false);

  // TODO: Replace with Supabase data fetching
  const fetchPromoData = async () => {
    try {
      setLoading(true);
      
      // TODO: Implement Supabase fetch
      // const { data, error } = await supabase
      //   .from('promo_cards')
      //   .select('*')
      //   .eq('deleted', false)
      //   .order('created_at', { ascending: false });
      
      // Placeholder data structure for now
      const data = [];
      
      if (error) {
        throw error;
      }
      
      setPromoList(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching promo data:", error);
      setError("Failed to load promo data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoData();
  }, []);

  // Filter promos by search term
  const filteredPromos = promoList.filter(promo => {
    const searchString = `${promo.code} ${promo.description}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  // Handle input change for forms
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPromo({
      ...newPromo,
      [name]: value
    });
  };

  // Handle adding new promo
  const handleAddPromo = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // TODO: Implement Supabase insert
      // const { data, error } = await supabase
      //   .from('promo_cards')
      //   .insert([{
      //     code: newPromo.code,
      //     discount: parseInt(newPromo.discount),
      //     description: newPromo.description,
      //     start_date: newPromo.startDate,
      //     end_date: newPromo.endDate,
      //     created_at: new Date().toISOString()
      //   }]);

      // if (error) throw error;

      // For now, just add to local state
      const newPromoWithId = {
        ...newPromo,
        id: Math.random().toString(36).substring(2, 15),
        createdAt: new Date().toISOString()
      };
      
      setPromoList(prev => [newPromoWithId, ...prev]);
      setShowAddForm(false);
      
      // Reset form
      setNewPromo({
        code: '',
        discount: '',
        description: '',
        startDate: '',
        endDate: '',
        createdAt: ''
      });
      
      setNotification({
        show: true,
        message: "Promo card added successfully!",
        type: "success"
      });
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 3000);
    } catch (error) {
      console.error("Error adding promo:", error);
      
      setNotification({
        show: true,
        message: `Failed to add promo card: ${error.message}`,
        type: "error"
      });
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 5000);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle opening add form
  const handleAddPromoClick = () => {
    // Auto-fill creation date and generate promo code
    const today = new Date().toISOString().split('T')[0];
    const promoCode = `PROMO${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    
    setNewPromo({
      code: promoCode,
      discount: '',
      description: '',
      startDate: today,
      endDate: '',
      createdAt: today
    });
    
    setShowAddForm(true);
  };

  // Handle editing a promo
  const handleEditPromo = (promo) => {
    setEditingPromoId(promo.id);
    setNewPromo({
      ...promo,
      startDate: promo.startDate || '',
      endDate: promo.endDate || ''
    });
    setShowEditForm(true);
  };

  // Handle updating a promo
  const handleUpdatePromo = async (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    
    try {
      // TODO: Implement Supabase update
      // const { error } = await supabase
      //   .from('promo_cards')
      //   .update({
      //     code: newPromo.code,
      //     discount: parseInt(newPromo.discount),
      //     description: newPromo.description,
      //     start_date: newPromo.startDate,
      //     end_date: newPromo.endDate
      //   })
      //   .eq('id', editingPromoId);

      // if (error) throw error;
      
      setPromoList(prev => 
        prev.map(promo => 
          promo.id === editingPromoId ? { ...newPromo, id: editingPromoId } : promo
        )
      );
      
      setEditingPromoId(null);
      setShowEditForm(false);
      
      setNotification({
        show: true,
        message: "Promo card updated successfully!",
        type: "success"
      });
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 3000);
    } catch (error) {
      console.error("Error updating promo:", error);
        
      setNotification({
        show: true,
        message: `Failed to update promo card: ${error.message}`,
        type: "error"
      });
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 5000);
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
      
      // TODO: Implement Supabase soft delete
      // const { error } = await supabase
      //   .from('promo_cards')
      //   .update({ deleted: true })
      //   .eq('id', promoToDelete.id);

      // if (error) throw error;
      
      // Remove from UI
      setPromoList(prev => prev.filter(p => p.id !== promoToDelete.id));
      
      setNotification({
        show: true,
        message: "Promo card removed successfully!",
        type: "success"
      });
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 3000);
    } catch (error) {
      console.error("Error deleting promo:", error);
        
      setNotification({
        show: true,
        message: `Failed to remove promo card: ${error.message}`,
        type: "error"
      });
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 5000);
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

  // Check if promo is currently active
  const isPromoActive = (promo) => {
    if (!promo.startDate || !promo.endDate) return true;
    
    const today = new Date();
    const startDate = new Date(promo.startDate);
    const endDate = new Date(promo.endDate);
    
    return today >= startDate && today <= endDate;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Promo Cards</h2>
      
      {/* Search and Add Bar */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search promos..."
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
        
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors duration-300"
          onClick={handleAddPromoClick}
        >
          <Plus size={18} />
          <span>Add Promo Card</span>
        </button>
      </div>
      
      {/* Active Promo Cards Grid */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Active Promotions</h3>
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500 mb-4"></div>
            <p className="text-orange-600">Loading promo data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md text-red-800 text-center">
            {error} <button className="underline ml-2" onClick={fetchPromoData}>Try again</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPromos.filter(isPromoActive).length > 0 ? (
              filteredPromos.filter(isPromoActive).map(promo => (
                <div key={promo.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-orange-200 hover:shadow-lg transition-shadow">
                  <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 text-white">
                    <div className="flex justify-between items-center">
                      <h4 className="text-lg font-bold">{promo.code}</h4>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditPromo(promo)}
                          className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(promo)}
                          className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center mb-3">
                      <Percent className="text-orange-500 mr-2" size={20} />
                      <span className="text-2xl font-bold text-orange-600">
                        {promo.discount || 0}%
                      </span>
                      <span className="ml-2 text-gray-600">discount</span>
                    </div>
                    <p className="text-gray-600 mb-4">
                      {promo.description || 'No description available'}
                    </p>
                    {promo.endDate && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="mr-1" size={14} />
                        <span>Expires: {formatDate(promo.endDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-orange-50 p-4 rounded-md text-orange-800 text-center">
                No active promotions found
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* All Promo Cards Table */}
      <div>
        <h3 className="text-xl font-semibold mb-4">All Promotions</h3>
        <div className="bg-white rounded-md shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPromos.length > 0 ? (
                  filteredPromos.map((promo) => (
                    <tr key={promo.id} className={!isPromoActive(promo) ? "bg-gray-50" : ""}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <Tag className="text-orange-600" size={20} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{promo.code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {promo.discount}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {promo.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(promo.startDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(promo.endDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isPromoActive(promo) ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-orange-600 hover:text-orange-800 mr-3"
                          onClick={() => handleEditPromo(promo)}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDeleteClick(promo)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No promo cards found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Promo Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-orange-800">Add New Promo Card</h3>
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowAddForm(false)}
                >
                  <X size={24} />
                </button>
              </div>
      
              <form onSubmit={handleAddPromo} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-orange-700 mb-1">
                      Promo Code
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={newPromo.code}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-orange-700 mb-1">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      name="discount"
                      value={newPromo.discount}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-orange-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={newPromo.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-orange-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={newPromo.startDate}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-orange-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={newPromo.endDate}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                </div>
          
                <div className="flex justify-end space-x-3 pt-4 border-t border-orange-100">
                  <button
                    type="button"
                    className="px-4 py-2 border border-orange-300 rounded-md shadow-sm text-orange-700 bg-white hover:bg-orange-50"
                    onClick={() => setShowAddForm(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-600 text-white rounded-md shadow-sm hover:bg-orange-700 flex items-center"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} className="mr-2" />
                        Save Promo
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-orange-800">Edit Promo Card</h3>
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingPromoId(null);
                  }}
                >
                  <X size={24} />
                </button>
              </div>
      
              <form onSubmit={handleUpdatePromo} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-orange-700 mb-1">
                      Promo Code
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={newPromo.code}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-orange-700 mb-1">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      name="discount"
                      value={newPromo.discount}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-orange-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={newPromo.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-orange-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={newPromo.startDate}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-orange-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={newPromo.endDate}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                </div>
          
                <div className="flex justify-end space-x-3 pt-4 border-t border-orange-100">
                  <button
                    type="button"
                    className="px-4 py-2 border border-orange-300 rounded-md shadow-sm text-orange-700 bg-white hover:bg-orange-50"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingPromoId(null);
                    }}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-600 text-white rounded-md shadow-sm hover:bg-orange-700 flex items-center"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save size={18} className="mr-2" />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 p-2 rounded-full mr-3">
                  <Trash2 className="text-red-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Confirm Deletion</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to remove this promo card? This action cannot be undone.
                {promoToDelete && (
                  <span className="font-medium block mt-2">
                    Promo Code: {promoToDelete.code}
                  </span>
                )}
              </p>
        
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                  onClick={cancelDelete}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 flex items-center"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} className="mr-2" />
                      Delete Promo
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 ${
          notification.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          <p className="font-medium">{notification.message}</p>
        </div>
      )}
    </div>
  );
};

export default PromoCard;