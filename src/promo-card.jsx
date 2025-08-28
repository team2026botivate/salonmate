'use client'

import React, { useState } from 'react'
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
} from 'lucide-react'
import { usePromoCardOperations } from './hook/dbOperation'

const PromoCard = () => {
  // Use custom hook for database operations
  const {
    promoCards,
    loading,
    error,
    addPromoCard,
    updatePromoCard,
    deletePromoCard,
    checkPromoCodeExists,
    getActivePromoCards
  } = usePromoCardOperations()

  // UI state
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPromoId, setEditingPromoId] = useState(null)
  const [newPromo, setNewPromo] = useState({
    code: '',
    discount: '',
    description: '',
    startDate: '',
    endDate: '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: '',
  })

  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [promoToDelete, setPromoToDelete] = useState(null)

  // State for edit form modal
  const [showEditForm, setShowEditForm] = useState(false)

  // Show notification helper
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' })
    }, type === 'error' ? 5000 : 3000)
  }

  // Filter promos by search term
  const filteredPromos = promoCards.filter((promo) => {
    const searchString = `${promo.code} ${promo.description}`.toLowerCase()
    return searchString.includes(searchTerm.toLowerCase())
  })

  // Handle input change for forms
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewPromo({
      ...newPromo,
      [name]: value,
    })
  }

  // Handle adding new promo
  const handleAddPromo = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Check if promo code already exists
      const codeExists = await checkPromoCodeExists(newPromo.code)
      if (codeExists) {
        showNotification('Promo code already exists. Please use a different code.', 'error')
        return
      }

      // Validate dates
      const startDate = new Date(newPromo.startDate)
      const endDate = new Date(newPromo.endDate)
      if (startDate >= endDate) {
        showNotification('End date must be after start date.', 'error')
        return
      }

      const result = await addPromoCard(newPromo)
      
      if (result.success) {
        setShowAddForm(false)
        // Reset form
        setNewPromo({
          code: '',
          discount: '',
          description: '',
          startDate: '',
          endDate: '',
        })
        showNotification('Promo card added successfully!')
      } else {
        showNotification(`Failed to add promo card: ${result.error}`, 'error')
      }
    } catch (error) {
      console.error('Error adding promo:', error)
      showNotification(`Failed to add promo card: ${error.message}`, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle opening add form
  const handleAddPromoClick = () => {
    // Auto-fill creation date and generate promo code
    const today = new Date().toISOString().split('T')[0]
    const promoCode = `PROMO${Math.random().toString(36).substring(2, 7).toUpperCase()}`

    setNewPromo({
      code: promoCode,
      discount: '',
      description: '',
      startDate: today,
      endDate: '',
    })

    setShowAddForm(true)
  }

  // Handle editing a promo
  const handleEditPromo = (promo) => {
    setEditingPromoId(promo.id)
    setNewPromo({
      code: promo.code,
      discount: promo.discount,
      description: promo.description,
      startDate: promo.start_date || '',
      endDate: promo.end_date || '',
    })
    setShowEditForm(true)
  }

  // Handle updating a promo
  const handleUpdatePromo = async (e) => {
    if (e) e.preventDefault()
    setSubmitting(true)

    try {
      // Check if promo code already exists (excluding current promo)
      const codeExists = await checkPromoCodeExists(newPromo.code, editingPromoId)
      if (codeExists) {
        showNotification('Promo code already exists. Please use a different code.', 'error')
        return
      }

      // Validate dates
      const startDate = new Date(newPromo.startDate)
      const endDate = new Date(newPromo.endDate)
      if (startDate >= endDate) {
        showNotification('End date must be after start date.', 'error')
        return
      }

      const result = await updatePromoCard(editingPromoId, newPromo)
      
      if (result.success) {
        setEditingPromoId(null)
        setShowEditForm(false)
        showNotification('Promo card updated successfully!')
      } else {
        showNotification(`Failed to update promo card: ${result.error}`, 'error')
      }
    } catch (error) {
      console.error('Error updating promo:', error)
      showNotification(`Failed to update promo card: ${error.message}`, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle delete confirmation
  const handleDeleteClick = (promo) => {
    setPromoToDelete(promo)
    setShowDeleteModal(true)
  }

  // Confirm delete promo
  const confirmDelete = async () => {
    try {
      setSubmitting(true)

      const result = await deletePromoCard(promoToDelete.id)
      
      if (result.success) {
        showNotification('Promo card removed successfully!')
      } else {
        showNotification(`Failed to remove promo card: ${result.error}`, 'error')
      }
    } catch (error) {
      console.error('Error deleting promo:', error)
      showNotification(`Failed to remove promo card: ${error.message}`, 'error')
    } finally {
      setSubmitting(false)
      setShowDeleteModal(false)
      setPromoToDelete(null)
    }
  }

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false)
    setPromoToDelete(null)
  }

  // Check if promo is currently active
  const isPromoActive = (promo) => {
    if (!promo.start_date || !promo.end_date) return true

    const today = new Date()
    const startDate = new Date(promo.start_date)
    const endDate = new Date(promo.end_date)

    return today >= startDate && today <= endDate
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Promo Cards</h2>

      {/* Search and Add Bar */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search promos..."
            className="w-full rounded-md border py-2 pr-4 pl-10 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute top-2.5 left-3 text-gray-400" size={18} />
        </div>

        <button
          className="flex items-center gap-2 rounded-md bg-orange-600 px-4 py-2 text-white transition-colors duration-300 hover:bg-orange-700"
          onClick={handleAddPromoClick}
        >
          <Plus size={18} />
          <span>Add Promo Card</span>
        </button>
      </div>

      {/* Active Promo Cards Grid */}
      <div className="mb-8">
        <h3 className="mb-4 text-xl font-semibold">Active Promotions</h3>
        {loading ? (
          <div className="py-10 text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-orange-500"></div>
            <p className="text-orange-600">Loading promo cards...</p>
          </div>
        ) : error ? (
          <div className="rounded-md bg-red-50 p-4 text-center text-red-800">
            {error}{' '}
            <button className="ml-2 underline" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPromos.filter(isPromoActive).length > 0 ? (
              filteredPromos.filter(isPromoActive).map((promo) => (
                <div
                  key={promo.id}
                  className="overflow-hidden rounded-lg border border-orange-200 bg-white shadow-md transition-shadow hover:shadow-lg"
                >
                  <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 text-white">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold">{promo.code}</h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditPromo(promo)}
                          className="hover:bg-opacity-20 rounded p-1 hover:bg-white"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(promo)}
                          className="hover:bg-opacity-20 rounded p-1 hover:bg-white"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="mb-3 flex items-center">
                      <Percent className="mr-2 text-orange-500" size={20} />
                      <span className="text-2xl font-bold text-orange-600">
                        {promo.discount || 0}%
                      </span>
                      <span className="ml-2 text-gray-600">discount</span>
                    </div>
                    <p className="mb-4 text-gray-600">
                      {promo.description || 'No description available'}
                    </p>
                    {promo.end_date && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="mr-1" size={14} />
                        <span>Expires: {formatDate(promo.end_date)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full rounded-md bg-orange-50 p-4 text-center text-orange-800">
                No active promotions found
              </div>
            )}
          </div>
        )}
      </div>

      {/* All Promo Cards Table */}
      <div>
        <h3 className="mb-4 text-xl font-semibold">All Promotions</h3>
        <div className="overflow-hidden rounded-md bg-white shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPromos.length > 0 ? (
                  filteredPromos.map((promo) => (
                    <tr
                      key={promo.id}
                      className={!isPromoActive(promo) ? 'bg-gray-50' : ''}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-100">
                            <Tag className="text-orange-600" size={20} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {promo.code}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                        {promo.discount}%
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                        {promo.description}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                        {formatDate(promo.start_date)}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                        {formatDate(promo.end_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isPromoActive(promo) ? (
                          <span className="inline-flex rounded-full bg-green-100 px-2 text-xs leading-5 font-semibold text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-gray-100 px-2 text-xs leading-5 font-semibold text-gray-800">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                        <button
                          className="mr-3 text-orange-600 hover:text-orange-800"
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
                    <td
                      colSpan={7}
                      className="px-6 py-4 text-center text-gray-500"
                    >
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
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg bg-white shadow-xl">
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-orange-800">
                  Add New Promo Card
                </h3>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowAddForm(false)}
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddPromo} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-orange-700">
                      Promo Code
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={newPromo.code}
                      onChange={handleInputChange}
                      className="w-full rounded-md border p-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-orange-700">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      name="discount"
                      value={newPromo.discount}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className="w-full rounded-md border p-2"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-orange-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={newPromo.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full rounded-md border p-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-orange-700">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={newPromo.startDate}
                      onChange={handleInputChange}
                      className="w-full rounded-md border p-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-orange-700">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={newPromo.endDate}
                      onChange={handleInputChange}
                      className="w-full rounded-md border p-2"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 border-t border-orange-100 pt-4">
                  <button
                    type="button"
                    className="rounded-md border border-orange-300 bg-white px-4 py-2 text-orange-700 shadow-sm hover:bg-orange-50"
                    onClick={() => setShowAddForm(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center rounded-md bg-orange-600 px-4 py-2 text-white shadow-sm hover:bg-orange-700"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-white"></div>
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
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg bg-white shadow-xl">
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-orange-800">
                  Edit Promo Card
                </h3>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    setShowEditForm(false)
                    setEditingPromoId(null)
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleUpdatePromo} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-orange-700">
                      Promo Code
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={newPromo.code}
                      onChange={handleInputChange}
                      className="w-full rounded-md border p-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-orange-700">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      name="discount"
                      value={newPromo.discount}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className="w-full rounded-md border p-2"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-orange-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={newPromo.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full rounded-md border p-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-orange-700">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={newPromo.startDate}
                      onChange={handleInputChange}
                      className="w-full rounded-md border p-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-orange-700">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={newPromo.endDate}
                      onChange={handleInputChange}
                      className="w-full rounded-md border p-2"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 border-t border-orange-100 pt-4">
                  <button
                    type="button"
                    className="rounded-md border border-orange-300 bg-white px-4 py-2 text-orange-700 shadow-sm hover:bg-orange-50"
                    onClick={() => {
                      setShowEditForm(false)
                      setEditingPromoId(null)
                    }}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center rounded-md bg-orange-600 px-4 py-2 text-white shadow-sm hover:bg-orange-700"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-white"></div>
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
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl">
            <div className="p-6">
              <div className="mb-4 flex items-center">
                <div className="mr-3 rounded-full bg-red-100 p-2">
                  <Trash2 className="text-red-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Confirm Deletion
                </h3>
              </div>

              <p className="mb-6 text-gray-600">
                Are you sure you want to remove this promo card? This action
                cannot be undone.
                {promoToDelete && (
                  <span className="mt-2 block font-medium">
                    Promo Code: {promoToDelete.code}
                  </span>
                )}
              </p>

              <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50"
                  onClick={cancelDelete}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex items-center rounded-md bg-red-600 px-4 py-2 text-white shadow-sm hover:bg-red-700"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-white"></div>
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
        <div
          className={`fixed top-4 right-4 z-50 rounded-lg px-6 py-4 shadow-lg ${
            notification.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          <p className="font-medium">{notification.message}</p>
        </div>
      )}
    </div>
  )
}

export default PromoCard
