import React from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  UserCheck,
  UserX,
  Calendar,
  Search,
  Filter,
  Download,
} from 'lucide-react'
import SummaryCard from './components/staffHistory/SummaryCard'
import AttendanceTable from './components/staffHistory/AttendanceTable'
import { useStaffData } from './components/staffHistory/useStaffData'

import { exportToCSV } from './utils/exportToCSV'

const StaffHistory = () => {
  const {
    staffData,
    summary,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    sortField,
    sortOrder,
    handleSort,
  } = useStaffData()

  const handleExportCSV = () => {
    exportToCSV(
      staffData,
      `staff_attendance_${new Date().toISOString().split('T')[0]}`
    )
  }

  const summaryCards = [
    {
      title: 'Total Staff',
      value: summary.totalStaff,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
    },
    {
      title: 'Present Today',
      value: summary.presentStaff,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
    },
    {
      title: 'Absent Today',
      value: summary.absentStaff,
      icon: UserX,
      color: 'text-red-600',
      bgColor: 'bg-gradient-to-br from-red-50 to-red-100',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Staff History Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor and manage staff attendance records
          </p>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {summaryCards.map((card, index) => (
            <SummaryCard key={card.title} {...card} index={index} />
          ))}
        </div>

        {/* Filters and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full lg:w-auto">
              {/* Search */}
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search staff members..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white min-w-[160px]"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Half Day">Half Day</option>
                </select>
              </div>

              {/* Date Filter */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-w-[160px]"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
            </div>

            {/* Export Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </motion.button>
          </div>
        </motion.div>

        {/* Attendance Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <AttendanceTable
            data={staffData}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        </motion.div>
      </div>
    </div>
  )
}

export default StaffHistory
