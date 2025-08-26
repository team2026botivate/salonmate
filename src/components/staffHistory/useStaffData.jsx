import { useMemo, useState } from 'react'
import { useStaffHistory } from '../../hook/dbOperation'

export const  useStaffData = () => {
  // Filters and sorting UI state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [sortField, setSortField] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')

  // Default to today if no date selected
  const today = useMemo(() => new Date().toISOString().split('T')[0], [])
  const selectedDate = dateFilter || today

  // Fetch live data from DB via hook
  const { data: rawData } = useStaffHistory(selectedDate)
  

  const filteredAndSortedData = useMemo(() => {
    const base = Array.isArray(rawData) ? rawData : []
    let filtered = base.filter((staff) => {
      const matchesSearch =
        (staff.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (staff.position || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus =
        statusFilter === 'all' || staff.status === statusFilter
      const matchesDate = !selectedDate || staff.date === selectedDate

      return matchesSearch && matchesStatus && matchesDate
    })

    if (sortField) {
      filtered.sort((a, b) => {
        const aVal = a[sortField]
        const bVal = b[sortField]

        if (sortOrder === 'asc') {
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
        } else {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
        }
      })
    }

    return filtered
  }, [rawData, searchTerm, statusFilter, selectedDate, sortField, sortOrder])

  const summary = useMemo(() => {
    const base = Array.isArray(rawData) ? rawData : []
    const todayData = base.filter((staff) => staff.date === today)

    return {
      totalStaff: base.length,
      presentStaff: todayData.filter((staff) => staff.status === 'Present')
        .length,
      absentStaff: todayData.filter((staff) => staff.status === 'Absent')
        .length,
      onLeaveStaff: todayData.filter((staff) => staff.status === 'Half Day')
        .length,
    }
  }, [rawData, today])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  return {
    staffData: filteredAndSortedData,
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
  }
}
