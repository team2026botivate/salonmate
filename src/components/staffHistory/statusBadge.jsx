export const StatusBadge = ({ status }) => {
  // Normalize incoming status to canonical labels used by UI
  const canonical = (() => {
    const s = String(status || '').trim().toLowerCase()
    if (s === 'present' || s === 'active' || s === 'p') return 'Present'
    if (s === 'absent' || s === 'a') return 'Absent'
    if (
      s === 'on leave' ||
      s === 'leave' ||
      s === 'half_day' ||
      s === 'half day' ||
      s === 'l'
    )
        return 'Half Day'
    return 'Unknown'
  })()

  const getStatusConfig = () => {
    switch (canonical) {
      case 'Present':
        return { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' }
      case 'Absent':
        return { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' }
      case 'Half Day':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' }
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' }
    }
  }

  const config = getStatusConfig()

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot}`}></span>
      {canonical === 'Unknown' ? String(status || 'Unknown') : canonical}
    </span>
  )
}
