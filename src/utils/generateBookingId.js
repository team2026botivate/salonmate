let series = 1

export const generateBookingId = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const lastSeries = String(series).padStart(2, '0')
  series++
  return `BKG-${year}${month}${day}-${lastSeries}`
}


