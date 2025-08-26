export const exportToCSV = (data, filename = 'staff_attendance') => {
  const headers = [
    'Staff Name',
    'Position',
    'Attendance Status',
    'Check-in Time',
    'Check-out Time',
    'Date',
  ]

  const csvContent = [
    headers.join(','),
    ...data.map((staff) =>
      [
        `"${staff.name}"`,
        `"${staff.position}"`,
        `"${staff.status}"`,
        `"${staff.checkInTime || '-'}"`,
        `"${staff.checkOutTime || '-'}"`,
        `"${staff.date}"`,
      ].join(',')
    ),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
