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
      present: filteredData.filter(
        (staff) => normalizeStatus(staff.status) === 'present'
      ).length,
      absent: filteredData.filter(
        (staff) => normalizeStatus(staff.status) === 'absent'
      ).length,
      halfDay: filteredData.filter(
        (staff) => normalizeStatus(staff.status) === 'half_day'
      ).length,
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
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl bg-white p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="mb-2 h-4 w-20 rounded bg-gray-200"></div>
                <div className="h-8 w-12 rounded bg-gray-200"></div>
              </div>
              <div className="h-12 w-12 rounded-full bg-gray-200"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
        <div className="p-6">
          <div className="mb-4 h-6 w-32 rounded bg-gray-200"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-gray-100 p-4"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                  <div>
                    <div className="mb-1 h-4 w-24 rounded bg-gray-200"></div>
                    <div className="h-3 w-20 rounded bg-gray-200"></div>
                  </div>
                </div>
                <div className="h-8 w-20 rounded bg-gray-200"></div>
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
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <div className="mb-4 flex items-center justify-center">
              <Users className="mr-3 h-8 w-8 text-blue-600" />
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="mx-auto max-w-7xl overflow-x-hidden">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center">
            <Users className="mr-3 h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Staff Attendance
            </h1>
          </div>
          <p className="text-gray-600">
            Manage and track staff attendance efficiently
          </p>
        </div>

        {/* Date Picker and Controls */}
        <div className="mb-8 rounded-2xl bg-white p-6  shadow-lg md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col items-center  md:flex-row gap-4">
              <div className=' w-full flex items-center justify-between flex-col gap-3 sm:flex-row'>
                <div className="flex items-center gap-2 ">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <label className="text-sm font-medium text-gray-700">
                    Date:
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={fetchAttendance}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Refresh
                </button>
              </div>

              <button
                onClick={markAllPresent}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4" />
                Mark All Present
              </button>
            </div>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="mb-8 rounded-2xl bg-white md:p-6 p-2 shadow-lg">
          <div className="mb-6 flex items-center justify-between  flex-col gap-5">
            <h2 className="text-2xl font-bold text-gray-900">
              Attendance Summary
            </h2>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">
                Department:
              </label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
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
          <div className="mb-2 grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="rounded-2xl border-l-4 border-blue-500 bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Staff
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {summary.totalStaff}
                  </p>
                </div>
                <div className="rounded-full bg-blue-100 p-3">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border-l-4 border-green-500 bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Present</p>
                  <p className="text-3xl font-bold text-green-600">
                    {summary.present}
                  </p>
                </div>
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border-l-4 border-red-500 bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Absent</p>
                  <p className="text-3xl font-bold text-red-600">
                    {summary.absent}
                  </p>
                </div>
                <div className="rounded-full bg-red-100 p-3">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border-l-4 border-yellow-500 bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Half Day</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {summary.halfDay}
                  </p>
                </div>
                <div className="rounded-full bg-yellow-100 p-3">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          <div className="border-b border-gray-200 p-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
              <UserCheck className="h-6 w-6 text-blue-600" />
              Staff Attendance Details
            </h2>
            <p className="mt-1 text-gray-600">
              {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {/* Search and Status Filter */}
          <div className="flex flex-col gap-3 border-b border-gray-100 p-6 sm:flex-row">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:w-60"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:w-48"
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
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Staff Member
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Department
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Check-in Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredStaff.map((staff) => {
                  const config = statusConfig[staff.status]
                  const StatusIcon = config.icon
                  const initials = (staff.staff_name || '')
                    .split(' ')
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join('')

                  return (
                    <tr
                      key={staff.staff_id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 font-semibold text-white">
                            {initials}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {staff.staff_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
                          {staff.position}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-600">
                        {staff.in_time || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${config.bgColor} ${config.color} gap-1`}
                        >
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
                              const time =
                                val === 'absent'
                                  ? null
                                  : new Date().toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                              handleStatusUpdate(staff.staff_id, val)
                            }}
                            className="cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 pr-8 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="half_day">Half Day</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredStaff.length === 0 && (
            <div className="py-12 text-center">
              <Users className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <h3 className="mb-2 text-lg font-semibold text-gray-600">
                No staff found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StaffAttendance
