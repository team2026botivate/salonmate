import React, { useState, useEffect } from 'react'
import { useCreateStaff, useStaffInfo } from './hook/dbOperation'
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
  Lock,
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
  const [currentStep, setCurrentStep] = useState(1) // Multi-step state
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState('created_at')
  const [sortDirection, setSortDirection] = useState('desc')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showDeleted, setShowDeleted] = useState(false)

  const { createStaff, loading: staffCreationLoading } = useCreateStaff()

  // Auth creation state (Step 1 -> Supabase Auth)
  const [accountCreated, setAccountCreated] = useState(false)
  const [authUserId, setAuthUserId] = useState(null)
  const [authError, setAuthError] = useState(null)

  const [formData, setFormData] = useState({
    staffName: '',
    password: '',
    mobileNumber: '',
    emailId: '',
    position: '',
    idProof: [],
    joiningDate: '',
    status: 'Active',
    deleteFlag: false,
    // New fields for staff_info schema
    baseSalary: '',
    commissionRate: 10,
    commissionType: 'percentage',
    staffCustomId: '',
  })

  const [errors, setErrors] = useState({})

  //todo ye data staff se ayega
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

  const totalSteps = 2

  // Load from DB on mount
  useEffect(() => {
    fetchStaff()
  }, [fetchStaff])

  // Validation for Step 1 (Basic Info)
  const validateStep1 = () => {
    const newErrors = {}

    if (!formData.staffName.trim()) {
      newErrors.staffName = 'Staff name is required'
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password is required (min 6 characters)'
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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Validation for Step 2 (Additional Info)
  const validateStep2 = () => {
    const newErrors = {}

    if (formData.idProof.length === 0) {
      newErrors.idProof = 'At least one ID proof is required'
    }

    if (!formData.joiningDate) {
      newErrors.joiningDate = 'Joining date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Check if current step is valid
  const isCurrentStepValid = () => {
    if (currentStep === 1) {
      return (
        formData.staffName.trim() &&
        formData.mobileNumber.trim() &&
        /^\d{10}$/.test(formData.mobileNumber) &&
        formData.emailId.trim() &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailId) &&
        formData.position.trim()
      )
    } else if (currentStep === 2) {
      return formData.idProof.length > 0 && formData.joiningDate
    }
    return false
  }

  // Handle next step
  const handleNext = async () => {
    let isValid = false

    if (currentStep === 1) {
      isValid = validateStep1()
      if (isValid) {
        // If editing existing staff, skip auth creation and go to step 2
        if (editingId) {
          setCurrentStep(2)
          return
        }
        // Create Supabase Auth user if not already created
        try {
          setAuthError(null)
          if (!accountCreated) {
            const result = await createStaff({
              email: formData.emailId,
              password: formData.password,
            })
            // If sign up succeeds, proceed to step 2
            if (result && result.user) {
              setAuthUserId(result.user.id)
              setAccountCreated(true)
              setCurrentStep(2)
              return
            } else {
              // If API didn't return user but no thrown error, show a generic error
              setAuthError('Unable to create staff user. Please try again or use a different email.')
              return
            }
          } else {
            // Already created, just move forward
            setCurrentStep(2)
            return
          }
        } catch (e) {
          setAuthError(e?.message || 'Failed to create staff user. The email may already be registered.')
          return
        }
      }
      return
    } else if (currentStep === 2) {
      isValid = validateStep2()
    }

    if (isValid) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1)
      } else {
        handleSubmit()
      }
    }
  }

  // Handle back step
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep2()) return

    const payload = {
      staff_name: formData.staffName,
      mobile_number: formData.mobileNumber,
      email_id: formData.emailId,
      position: formData.position,
      id_proof: formData.idProof,
      joining_date: formData.joiningDate,
      status: formData.status,
      // Map new fields to DB columns
      base_salary: formData.baseSalary ? Number(formData.baseSalary) : null,
      commission_rate:
        formData.commissionRate !== '' ? Number(formData.commissionRate) : 10,
      commission_type: formData.commissionType || 'percentage',
      // Link to created auth user (store in staff_id text column)
      staff_id: authUserId || formData.staffCustomId || null,
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
      password: '',
      mobileNumber: '',
      emailId: '',
      position: '',
      idProof: [],
      joiningDate: '',
      status: 'Active',
      baseSalary: '',
      commissionRate: 10,
      commissionType: 'percentage',
      staffCustomId: '',
    })
    setErrors({})
    setShowForm(false)
    setEditingId(null)
    setCurrentStep(2) // Reset to first step
    setAccountCreated(false)
    setAuthUserId(null)
    setAuthError(null)
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
    setCurrentStep(1) // Start from first step when editing
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center">
            <Users className="mr-3 h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Staff Database Management
            </h1>
          </div>
          <p className="text-gray-600">
            Manage your salon staff records efficiently
          </p>
        </div>
        {/* Controls */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-4 sm:flex-row">
              {/* Search */}
              <div className="relative max-w-md flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="Half_Day">Half Day</option>
                <option value="absent">Absent</option>
                <option value="busy">Busy</option>
              </select>

              {/* Show Deleted Toggle */}
              <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                <input
                  type="checkbox"
                  checked={showDeleted}
                  onChange={(e) => setShowDeleted(e.target.checked)}
                  className="rounded"
                />
                <span className="flex items-center gap-1 text-sm text-gray-700">
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
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add New Staff
            </button>
          </div>
        </div>
        {/* Multi-Step Form Modal create new staff */}
        {showForm && (
          <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
              <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingId ? 'Edit Staff Member' : 'Add New Staff Member'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {/* Progress Indicator */}
                <div className="mb-6">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-blue-600">
                      Step {currentStep} of {totalSteps}
                    </span>
                    <span className="text-xs text-gray-500">
                      {currentStep === 1
                        ? 'Basic Information'
                        : 'Additional Details'}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-blue-600 transition-all duration-300 ease-out"
                      style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Staff Name */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        <User className="mr-1 inline h-4 w-4" />
                        Staff Name *
                      </label>
                      <input
                        type="text"
                        value={formData.staffName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            staffName: e.target.value,
                          })
                        }
                        className={`w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                          errors.staffName
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                        placeholder="Enter staff name"
                      />
                      {errors.staffName && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.staffName}
                        </p>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        <Lock className="mr-1 inline h-4 w-4" />
                        Password *
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className={`w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                          errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter a password (min 6 characters)"
                        autoComplete="new-password"
                      />
                      {errors.password && (
                        <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                      )}
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        <Phone className="mr-1 inline h-4 w-4" />
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
                        className={`w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                          errors.mobileNumber
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                        placeholder="Enter 10-digit mobile number"
                      />
                      {errors.mobileNumber && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.mobileNumber}
                        </p>
                      )}
                    </div>

                    {/* Email ID */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        <Mail className="mr-1 inline h-4 w-4" />
                        Email ID *
                      </label>
                      <input
                        type="email"
                        value={formData.emailId}
                        onChange={(e) =>
                          setFormData({ ...formData, emailId: e.target.value })
                        }
                        className={`w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                          errors.emailId ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter email address"
                      />
                      {errors.emailId && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.emailId}
                        </p>
                      )}
                    </div>

                    {/* Position */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        <Building className="mr-1 inline h-4 w-4" />
                        Position *
                      </label>
                      <select
                        value={formData.position}
                        onChange={(e) =>
                          setFormData({ ...formData, position: e.target.value })
                        }
                        className={`w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
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
                        <p className="mt-1 text-xs text-red-500">
                          {errors.position}
                        </p>
                      )}
                    </div>
                    {/* Auth creation feedback */}
                    <div className="md:col-span-2">
                      {authError && (
                        <p className="mt-2 text-sm text-red-600">{authError}</p>
                      )}
                      {accountCreated && (
                        <div className="mt-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                          Staff account created successfully for <span className="font-semibold">{formData.emailId}</span>.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Additional Details */}
                {currentStep === 2 && (
                  <div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      {/* Joining Date */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          <Calendar className="mr-1 inline h-4 w-4" />
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
                          className={`w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                            errors.joiningDate
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                        />
                        {errors.joiningDate && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.joiningDate}
                          </p>
                        )}
                      </div>
                      {/* Base Salary */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Base Salary
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={formData.baseSalary}
                          onChange={(e) =>
                            setFormData({ ...formData, baseSalary: e.target.value })
                          }
                          className="w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g. 20000"
                        />
                      </div>
                      {/* Commission Rate */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Commission Rate
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.commissionRate}
                          onChange={(e) =>
                            setFormData({ ...formData, commissionRate: e.target.value })
                          }
                          className="w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g. 10"
                        />
                      </div>
                      {/* Commission Type */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Commission Type
                        </label>
                        <select
                          value={formData.commissionType}
                          onChange={(e) =>
                            setFormData({ ...formData, commissionType: e.target.value })
                          }
                          className="w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="percentage">Percentage</option>
                          <option value="fixed">Fixed</option>
                        </select>
                      </div>
                      
                    </div>

                    {/* ID Proof */}
                    <div className="mt-6">
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        <Shield className="mr-1 inline h-4 w-4" />
                        ID Proof * (Select multiple)
                      </label>
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                        {idProofOptions.map((proof) => (
                          <label
                            key={proof}
                            className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              checked={formData.idProof.includes(proof)}
                              onChange={() => handleIdProofChange(proof)}
                              className="rounded"
                            />
                            <span className="text-sm text-gray-700">
                              {proof}
                            </span>
                          </label>
                        ))}
                      </div>
                      {errors.idProof && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.idProof}
                        </p>
                      )}
                    </div>

                   
                  
                  </div>
                )}

                {/* Form Actions */}
                <div className="mt-8 flex justify-between border-t border-gray-200 pt-6">
                  <button
                    type="button"
                    onClick={currentStep === 1 ? resetForm : handleBack}
                    className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    {currentStep === 1 ? 'Cancel' : 'Back'}
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={staffCreationLoading}
                    className={`rounded-lg px-8 py-3 font-medium transition-colors ${
                      staffCreationLoading
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : isCurrentStepValid()
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-400 text-white hover:bg-blue-500'
                    }`}
                  >
                    {staffCreationLoading
                      ? 'Creating account...'
                      : currentStep === totalSteps
                      ? editingId
                        ? 'Update Staff'
                        : 'Add Staff'
                      : 'Next Step'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Table - Rest of your existing table code remains exactly the same */}
        {loading ? (
          <div className="animate-pulse overflow-hidden rounded-2xl bg-white shadow-lg">
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
              <div className="h-6 w-48 rounded bg-gray-200"></div>
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
                          className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase"
                        >
                          <div className="h-4 w-24 rounded bg-gray-200"></div>
                        </th>
                      ))}
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-gray-200 bg-white">
                  {Array(5)
                    .fill(0)
                    .map((_, rowIdx) => (
                      <tr
                        key={rowIdx}
                        className="transition-colors hover:bg-gray-50"
                      >
                        {/* Created At */}
                        <td className="px-6 py-4">
                          <div className="h-4 w-28 rounded bg-gray-200"></div>
                        </td>

                        {/* Staff Name with Avatar */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="mr-3 h-8 w-8 rounded-full bg-gray-200"></div>
                            <div className="h-4 w-32 rounded bg-gray-200"></div>
                          </div>
                        </td>

                        {/* Mobile */}
                        <td className="px-6 py-4">
                          <div className="h-4 w-28 rounded bg-gray-200"></div>
                        </td>

                        {/* Email */}
                        <td className="px-6 py-4">
                          <div className="h-4 w-36 rounded bg-gray-200"></div>
                        </td>

                        {/* Position */}
                        <td className="px-6 py-4">
                          <div className="h-4 w-24 rounded bg-gray-200"></div>
                        </td>

                        {/* ID Proof */}
                        <td className="px-6 py-4">
                          <div className="flex gap-1">
                            <div className="h-5 w-12 rounded bg-gray-200"></div>
                            <div className="h-5 w-10 rounded bg-gray-200"></div>
                          </div>
                        </td>

                        {/* Joining Date */}
                        <td className="px-6 py-4">
                          <div className="h-4 w-28 rounded bg-gray-200"></div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <div className="h-5 w-20 rounded-full bg-gray-200"></div>
                        </td>

                        {/* Deleted */}
                        <td className="px-6 py-4">
                          <div className="h-4 w-10 rounded bg-gray-200"></div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <div className="h-6 w-6 rounded bg-gray-200"></div>
                            <div className="h-6 w-6 rounded bg-gray-200"></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
            <div className="border-b border-gray-200 p-6">
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
                        className="cursor-pointer px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase hover:bg-gray-100"
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
                    <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredRecords.map((record) => (
                    <tr
                      key={record.id}
                      className={`transition-colors hover:bg-gray-50 ${
                        record.delete_flag ? 'opacity-60' : ''
                      }`}
                    >
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-600">
                        {record.created_at
                          ? new Date(record.created_at).toLocaleString()
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-xs font-semibold text-white">
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
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-600">
                        {record.mobile_number}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-600">
                        {record.email_id}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-600">
                        {record.position}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-600">
                        <div className="flex flex-wrap gap-1">
                          {toArray(record.id_proof).map((proof) => (
                            <span
                              key={proof}
                              className="inline-block rounded bg-blue-100 px-2 py-1 text-xs text-blue-800"
                            >
                              {proof}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-600">
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
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-600">
                        {record.delete_flag ? (
                          <span className="font-semibold text-red-600">
                            Yes
                          </span>
                        ) : (
                          <span className="font-semibold text-green-600">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-600">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(record)}
                            className="rounded p-1 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {record.delete_flag ? (
                            <button
                              onClick={() => handlePermanentDelete(record.id)}
                              className="rounded p-1 text-red-600 transition-colors hover:bg-red-50 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDelete(record.id)}
                              className="rounded p-1 text-orange-600 transition-colors hover:bg-orange-50 hover:text-orange-800"
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
              <div className="py-12 text-center">
                <Users className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <h3 className="mb-2 text-lg font-semibold text-gray-600">
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
