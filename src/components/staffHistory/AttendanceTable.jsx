import React from 'react'
import { motion } from 'framer-motion'
import { ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react'
import { StatusBadge } from './statusBadge'

const AttendanceTable = ({ data, sortField, sortOrder, onSort }) => {
  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-blue-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-blue-600" />
    )
  }

  const columns = [
    { key: 'name', label: 'Staff Name' },
    { key: 'position', label: 'Position' },
    { key: 'status', label: 'Status' },
    { key: 'checkInTime', label: 'Check-in' },
    { key: 'checkOutTime', label: 'Check-out' },
    { key: 'date', label: 'Date' },
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => onSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((staff, index) => (
              <motion.tr
                key={staff.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{staff.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-700">{staff.position}</div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={staff.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-700">
                    {staff.checkInTime || '-'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-700">
                    {staff.checkOutTime || '-'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-700">{staff.date}</div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {data.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No staff records found</p>
            <p className="text-gray-400 text-sm mt-1">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AttendanceTable
