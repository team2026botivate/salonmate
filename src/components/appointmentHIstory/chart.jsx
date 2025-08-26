import React, { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'

const EarningsChart = ({ transactions }) => {
  const [monthlyData, setMonthlyData] = useState([])

  useEffect(() => {
    if (!transactions || transactions.length === 0) return

    // Group data by month
    const earningsByMonth = {}

    transactions.forEach((txn) => {
      const date = new Date(txn.created_at)
      const month = date.toLocaleString('default', { month: 'short' }) // e.g. Jan, Feb
      const year = date.getFullYear()
      const key = `${month} ${year}`

      if (!earningsByMonth[key]) {
        earningsByMonth[key] = 0
      }
      earningsByMonth[key] += txn.transaction_final_amount
    })

    // Convert to array for Recharts
    const chartData = Object.keys(earningsByMonth).map((key) => ({
      month: key,
      earnings: earningsByMonth[key],
    }))

    setMonthlyData(chartData)
  }, [transactions])

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Monthly Earnings</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => `₹${value}`} />
          <Bar dataKey="earnings" fill="#4CAF50" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default EarningsChart
