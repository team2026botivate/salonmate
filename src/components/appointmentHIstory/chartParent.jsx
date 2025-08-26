import React from 'react'
import Chart from './chart'
import { useGetMonthlyEarnings } from '@/hook/dbOperation'
const ChartParent = () => {
  const { data, loading, error } = useGetMonthlyEarnings()
  console.log(data, 'data')

  if (loading)
    return (
      <div className="bg-white rounded-lg shadow p-4 animate-pulse">
        {/* Title skeleton */}
        <div className="h-6 w-40 bg-gray-300 rounded mb-4"></div>

        {/* Chart skeleton */}
        <div className="w-full h-[300px] flex items-end justify-between gap-2">
          {/* Simulated bars */}
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex-1 bg-gray-300 rounded-t"
              style={{ height: `${Math.random() * (250 - 80) + 80}px` }}
            ></div>
          ))}
        </div>
      </div>
    )

  return (
    <div>
      <Chart transactions={data} />
    </div>
  )
}

export default ChartParent
