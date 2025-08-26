import React, { useState, useEffect } from 'react'
import { useStaffInfo } from './hook/dbOperation'
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Save,
  Phone,
  Mail,
  Calendar,
  User,
  Shield,
  Building,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  EyeOff,
} from 'lucide-react'

const StaffDatabase = () => {
  const {
    staff: staffRecords,
    loading,
    error,
    fetchStaff,
    addStaff,
    updateStaff,
    softDeleteStaff,
    deleteStaff,
  } = useStaffInfo()

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState('created_at')
  const [sortDirection, setSortDirection] = useState('desc')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showDeleted, setShowDeleted] = useState(false)

  const [formData, setFormData] = useState({
    staffName: '',
    mobileNumber: '',
    emailId: '',
    position: '',
    idProof: [],
    joiningDate: '',
    status: 'Active',
    deleteFlag: false,
  })

  const [errors, setErrors] = useState({})

  const positions = [
    'Hair Stylist',
    'Nail Technician',
    'Esthetician',
    'Massage Therapist',
    'Receptionist',
    'Manager',
    'Assistant Manager',
    'Makeup Artist',
    'Barber',
    'Salon Assistant',
  ]

  const idProofOptions = [
    'Aadhaar Card',
    'Voter ID',
    'Driving Licence',
    'PAN Card',
    'Bank Passbook',
  ]

  // Load from DB on mount
  useEffect(() => {
    fetchStaff()
  }, [fetchStaff])

  // Validation
  const validateForm = () => {
    const newErrors = {}

    if (!formData.staffName.trim()) {
      newErrors.staffName = 'Staff name is required'
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required'
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Mobile number must be exactly 10 digits'
    }

    if (!formData.emailId.trim()) {
      newErrors.emailId = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailId)) {
      newErrors.emailId = 'Please enter a valid email address'
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Position is required'
    }

    if (formData.idProof.length === 0) {
      newErrors.idProof = 'At least one ID proof is required'
    }

    if (!formData.joiningDate) {
      newErrors.joiningDate = 'Joining date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return

    const payload = {
      staff_name: formData.staffName,
      mobile_number: formData.mobileNumber,
      email_id: formData.emailId,
      position: formData.position,
      id_proof: formData.idProof, // expects text[] in DB
      joining_date: formData.joiningDate, // expects date in DB
      status: formData.status,
      delete_flag: formData.deleteFlag,
    }

    try {
      if (editingId) {
        await updateStaff(editingId, payload)
      } else {
        await addStaff(payload)
      }
      resetForm()
    } catch (e) {
      console.error('Save staff error:', e)
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      staffName: '',
      mobileNumber: '',
      emailId: '',
      position: '',
      idProof: [],
      joiningDate: '',
      status: 'Active',
      deleteFlag: false,
    })
    setErrors({})
    setShowForm(false)
    setEditingId(null)
  }

  // Handle edit
  const handleEdit = (record) => {
    setFormData({
      staffName: record.staff_name,
      mobileNumber: record.mobile_number,
      emailId: record.email_id,
      position: record.position,
      idProof: record.id_proof || [],
      joiningDate: record.joining_date || '',
      status: record.status,
      deleteFlag: record.delete_flag,
    })
    setEditingId(record.id)
    setShowForm(true)
  }

  // Handle delete (soft delete)
  const handleDelete = async (id) => {
    try {
      await softDeleteStaff(id, true)
    } catch (e) {
      console.error('Soft delete error:', e)
    }
  }

  // Handle permanent delete
  const handlePermanentDelete = async (id) => {
    if (
      window.confirm('Are you sure you want to permanently delete this record?')
    ) {
      try {
        await deleteStaff(id)
      } catch (e) {
        console.error('Hard delete error:', e)
      }
    }
  }

  // Handle ID proof selection
  const handleIdProofChange = (proof) => {
    const currentProofs = formData.idProof
    if (currentProofs.includes(proof)) {
      setFormData({
        ...formData,
        idProof: currentProofs.filter((p) => p !== proof),
      })
    } else {
      setFormData({
        ...formData,
        idProof: [...currentProofs, proof],
      })
    }
  }

  // Filter and sort records
  const getFilteredAndSortedRecords = () => {
    let filtered = staffRecords.filter((record) => {
      // Show deleted filter
      if (!showDeleted && record.delete_flag) return false

      // Status filter
      if (statusFilter !== 'all') {
        const normalizedStatus =
          record.status === 'On Leave' ? 'Half Day' : record.status
        if (normalizedStatus !== statusFilter) return false
      }

      // Search filter
      const searchLower = searchTerm.toLowerCase()
      return (
        (record.staff_name || '').toLowerCase().includes(searchLower) ||
        (record.email_id || '').toLowerCase().includes(searchLower) ||
        record.position.toLowerCase().includes(searchLower) ||
        (record.mobile_number || '').includes(searchTerm)
      )
    })

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      if (sortField === 'created_at' || sortField === 'joining_date') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredRecords = getFilteredAndSortedRecords()

  const getStatusBadge = (status) => {
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-semibold'
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'busy':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'Half_Day':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'absent':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      default:
        return baseClasses
    }
  }

  // Ensure any value is treated as an array for safe mapping
  const toArray = (val) => (Array.isArray(val) ? val : val ? [val] : [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              Staff Database Management
            </h1>
          </div>
          <p className="text-gray-600">
            Manage your salon staff records efficiently
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="Half_Day">Half Day</option>
                <option value="absent">Absent</option>
                <option value="busy">Busy</option>
              </select>

              {/* Show Deleted Toggle */}
              <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDeleted}
                  onChange={(e) => setShowDeleted(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 flex items-center gap-1">
                  {showDeleted ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                  Show Deleted
                </span>
              </label>
            </div>

            {/* Add New Button */}
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add New Staff
            </button>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingId ? 'Edit Staff Member' : 'Add New Staff Member'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Staff Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="h-4 w-4 inline mr-1" />
                      Staff Name *
                    </label>
                    <input
                      type="text"
                      value={formData.staffName}
                      onChange={(e) =>
                        setFormData({ ...formData, staffName: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.staffName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter staff name"
                    />
                    {errors.staffName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.staffName}
                      </p>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="h-4 w-4 inline mr-1" />
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.mobileNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mobileNumber: e.target.value
                            .replace(/\D/g, '')
                            .slice(0, 10),
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.mobileNumber
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                      placeholder="Enter 10-digit mobile number"
                    />
                    {errors.mobileNumber && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.mobileNumber}
                      </p>
                    )}
                  </div>

                  {/* Email ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Email ID *
                    </label>
                    <input
                      type="email"
                      value={formData.emailId}
                      onChange={(e) =>
                        setFormData({ ...formData, emailId: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.emailId ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter email address"
                    />
                    {errors.emailId && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.emailId}
                      </p>
                    )}
                  </div>

                  {/* Position */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Building className="h-4 w-4 inline mr-1" />
                      Position *
                    </label>
                    <select
                      value={formData.position}
                      onChange={(e) =>
                        setFormData({ ...formData, position: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.position ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Position</option>
                      {positions.map((position) => (
                        <option key={position} value={position}>
                          {position}
                        </option>
                      ))}
                    </select>
                    {errors.position && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.position}
                      </p>
                    )}
                  </div>

                  {/* Joining Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Joining Date *
                    </label>
                    <input
                      type="date"
                      value={formData.joiningDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          joiningDate: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.joiningDate
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                    {errors.joiningDate && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.joiningDate}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2  ">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Active">Active</option>
                      <option value="busy">busy</option>
                      <option value="Half Day">Half Day</option>
                    </select>
                  </div>
                </div>

                {/* ID Proof */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Shield className="h-4 w-4 inline mr-1" />
                    ID Proof * (Select multiple)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {idProofOptions.map((proof) => (
                      <label
                        key={proof}
                        className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={formData.idProof.includes(proof)}
                          onChange={() => handleIdProofChange(proof)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">{proof}</span>
                      </label>
                    ))}
                  </div>
                  {errors.idProof && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.idProof}
                    </p>
                  )}
                </div>

                {/* Delete Flag */}
                <div className="mt-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.deleteFlag}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deleteFlag: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">
                      Mark as deleted
                    </span>
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 mt-8">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    {editingId ? 'Update Staff' : 'Add Staff'}
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="h-6 w-48 bg-gray-200 rounded"></div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Table Head */}
                <thead className="bg-gray-50">
                  <tr>
                    {Array(10)
                      .fill(0)
                      .map((_, idx) => (
                        <th
                          key={idx}
                          className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                        >
                          <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        </th>
                      ))}
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array(5)
                    .fill(0)
                    .map((_, rowIdx) => (
                      <tr
                        key={rowIdx}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* Created At */}
                        <td className="px-6 py-4">
                          <div className="h-4 w-28 bg-gray-200 rounded"></div>
                        </td>

                        {/* Staff Name with Avatar */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-200 mr-3"></div>
                            <div className="h-4 w-32 bg-gray-200 rounded"></div>
                          </div>
                        </td>

                        {/* Mobile */}
                        <td className="px-6 py-4">
                          <div className="h-4 w-28 bg-gray-200 rounded"></div>
                        </td>

                        {/* Email */}
                        <td className="px-6 py-4">
                          <div className="h-4 w-36 bg-gray-200 rounded"></div>
                        </td>

                        {/* Position */}
                        <td className="px-6 py-4">
                          <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        </td>

                        {/* ID Proof */}
                        <td className="px-6 py-4">
                          <div className="flex gap-1">
                            <div className="h-5 w-12 bg-gray-200 rounded"></div>
                            <div className="h-5 w-10 bg-gray-200 rounded"></div>
                          </div>
                        </td>

                        {/* Joining Date */}
                        <td className="px-6 py-4">
                          <div className="h-4 w-28 bg-gray-200 rounded"></div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
                        </td>

                        {/* Deleted */}
                        <td className="px-6 py-4">
                          <div className="h-4 w-10 bg-gray-200 rounded"></div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <div className="h-6 w-6 bg-gray-200 rounded"></div>
                            <div className="h-6 w-6 bg-gray-200 rounded"></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Staff Records ({filteredRecords.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      { key: 'created_at', label: 'Created At' },
                      { key: 'staff_name', label: 'Staff Name' },
                      { key: 'mobile_number', label: 'Mobile' },
                      { key: 'email_id', label: 'Email' },
                      { key: 'position', label: 'Position' },
                      { key: 'id_proof', label: 'ID Proof' },
                      { key: 'joining_date', label: 'Joining Date' },
                      { key: 'status', label: 'Status' },
                      { key: 'delete_flag', label: 'Deleted' },
                    ].map(({ key, label }) => (
                      <th
                        key={key}
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort(key)}
                      >
                        <div className="flex items-center gap-1">
                          {label}
                          {sortField === key &&
                            (sortDirection === 'asc' ? (
                              <SortAsc className="h-3 w-3" />
                            ) : (
                              <SortDesc className="h-3 w-3" />
                            ))}
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map((record) => (
                    <tr
                      key={record.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        record.delete_flag ? 'opacity-60' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {record.created_at
                          ? new Date(record.created_at).toLocaleString()
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold mr-3">
                            {(record.staff_name || '')
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {record.staff_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {record.mobile_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {record.email_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {record.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex flex-wrap gap-1">
                          {toArray(record.id_proof).map((proof) => (
                            <span
                              key={proof}
                              className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                            >
                              {proof}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {record.joining_date
                          ? new Date(record.joining_date).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={getStatusBadge(
                            record.status === 'On Leave'
                              ? 'Half Day'
                              : record.status
                          )}
                        >
                          {record.status === 'On Leave'
                            ? 'Half Day'
                            : record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {record.delete_flag ? (
                          <span className="text-red-600 font-semibold">
                            Yes
                          </span>
                        ) : (
                          <span className="text-green-600 font-semibold">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(record)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {record.delete_flag ? (
                            <button
                              onClick={() => handlePermanentDelete(record.id)}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDelete(record.id)}
                              className="p-1 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredRecords.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No staff records found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default StaffDatabase
