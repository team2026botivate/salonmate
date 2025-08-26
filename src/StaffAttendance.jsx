import React, { useState } from 'react'
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  ChevronDown,
  Loader2,
  UserCheck,
  Building2,
  Filter,
  Search,
  RefreshCw,
} from 'lucide-react'
import { useStaffAttendance } from './hook/dbOperation'

// Import your actual hook

const StaffAttendance = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const { attendance, loading, updateStatus, fetchAttendance } =
    useStaffAttendance(selectedDate)

  // Normalize any legacy status values
  const normalizeStatus = (s) => (s === 'on_leave' ? 'half_day' : s)

  

  // Get filtered staff based on search and filters
  const getFilteredStaff = () => {
    return attendance.filter((staff) => {
      const matchesSearch =
        staff.staff_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.position.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDepartment =
        departmentFilter === 'all' || staff.position === departmentFilter
      const matchesStatus =
        statusFilter === 'all' || normalizeStatus(staff.status) === statusFilter

      return matchesSearch && matchesDepartment && matchesStatus
    })
  }

  // Get unique departments
  const getDepartments = () => {
    const departments = [...new Set(attendance.map((staff) => staff.position))]
    return departments.sort()
  }

  // Calculate attendance summary
  const getAttendanceSummary = () => {
    const filteredData = getFilteredStaff()
    return {
      totalStaff: filteredData.length,
      present: filteredData.filter((staff) => normalizeStatus(staff.status) === 'present')
        .length,
      absent: filteredData.filter((staff) => normalizeStatus(staff.status) === 'absent').length,
      halfDay: filteredData.filter((staff) => normalizeStatus(staff.status) === 'half_day')
        .length,
    }
  }

  // Mark all staff as present
  const markAllPresent = () => {
    const currentTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })

    getFilteredStaff().forEach((staff) => {
      if (staff.status !== 'present') {
        updateStatus(staff.staff_id, 'present', currentTime)
      }
    })
  }

  // Update staff status
  const handleStatusUpdate = (staffId, newStatus) => {
    const currentTime =
      newStatus === 'absent'
        ? null
        : new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
    updateStatus(staffId, newStatus, currentTime)
  }

  // Status configuration
  const statusConfig = {
    present: {
      label: 'Present',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200',
    },
    absent: {
      label: 'Absent',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-200',
    },
    half_day: {
      label: 'Half Day',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-200',
    },
    on_leave: {
      label: 'Half Day',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-200',
    },
  }

  const summary = getAttendanceSummary()
  const filteredStaff = getFilteredStaff()

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {/* Summary skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-lg p-6 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border border-gray-100 rounded-xl"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">
                Staff Attendance
              </h1>
            </div>
            <p className="text-gray-600">Loading attendance data...</p>
          </div>
          <LoadingSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              Staff Attendance
            </h1>
          </div>
          <p className="text-gray-600">
            Manage and track staff attendance efficiently
          </p>
        </div>

        {/* Date Picker and Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">
                  Date:
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={fetchAttendance}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </button>

              <button
                onClick={markAllPresent}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                Mark All Present
              </button>
            </div>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Attendance Summary</h2>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">Department:</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Departments</option>
                {getDepartments().map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Staff</p>
                  <p className="text-3xl font-bold text-gray-900">{summary.totalStaff}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Present</p>
                  <p className="text-3xl font-bold text-green-600">{summary.present}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Absent</p>
                  <p className="text-3xl font-bold text-red-600">{summary.absent}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Half Day</p>
                  <p className="text-3xl font-bold text-yellow-600">{summary.halfDay}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <UserCheck className="h-6 w-6 text-blue-600" />
              Staff Attendance Details
            </h2>
            <p className="text-gray-600 mt-1">
              {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {/* Search and Status Filter */}
          <div className="p-6 flex flex-col sm:flex-row gap-3 border-b border-gray-100">
            <div className="relative">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-60"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-48"
            >
              <option value="all">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="half_day">Half Day</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Department
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Check-in Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStaff.map((staff) => {
                  const config = statusConfig[staff.status]
                  const StatusIcon = config.icon
                  const initials = (staff.staff_name || '')
                    .split(' ')
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join('')

                  return (
                    <tr key={staff.staff_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                            {initials}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{staff.staff_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {staff.position}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {staff.in_time || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color} gap-1`}>
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative">
                          <select
                            value={normalizeStatus(staff.status)}
                            onChange={(e) => {
                              const val = e.target.value
                              const time = val === 'absent'
                                ? null
                                : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              handleStatusUpdate(staff.staff_id, val)
                            }}
                            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                          >
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="half_day">Half Day</option>
                          </select>
                          <ChevronDown className="h-4 w-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredStaff.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No staff found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StaffAttendance
