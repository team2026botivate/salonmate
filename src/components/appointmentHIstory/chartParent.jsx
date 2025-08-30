import React from 'react'
import Chart from './chart'
import { useGetMonthlyEarnings } from '@/hook/dbOperation'
const ChartParent = () => {
  const { data, loading, error } = useGetMonthlyEarnings()

  if (loading)
    return (
      <div className="animate-pulse rounded-lg bg-white p-4 shadow">
        {/* Title skeleton */}
        <div className="mb-4 h-6 w-40 rounded bg-gray-300"></div>

        {/* Chart skeleton */}
        <div className="flex h-[300px] w-full items-end justify-between gap-2">
          {/* Simulated bars */}
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex-1 rounded-t bg-gray-300"
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
