import React from 'react'
import { IndianRupee, Scissors, TrendingUp } from 'lucide-react'
import { useGetHeaderCardData } from '../../hook/dbOperation'

const DailyEntryHeader = () => {
  const { data, loading, error } = useGetHeaderCardData()
  const total = Number(data?.total || 0)
  const average = Number(data?.average || 0)
  const count = Number(data?.count || 0)

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow p-4 flex items-center">
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <IndianRupee size={24} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Revenue</p>
            {loading ? (
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-2xl font-bold text-gray-800">
                ₹{total.toFixed(2)}
              </p>
            )}
          </div>
        </div>

        {/* Services */}
        <div className="bg-white rounded-lg shadow p-4 flex items-center">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <Scissors size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Services</p>
            {loading ? (
              <div className="h-6 w-12 bg-gray-200 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-2xl font-bold text-gray-800">{count}</p>
            )}
          </div>
        </div>

        {/* Average Sale */}
        <div className="bg-white rounded-lg shadow p-4 flex items-center">
          <div className="rounded-full bg-yellow-100 p-3 mr-4">
            <TrendingUp size={24} className="text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Average Sale</p>
            {loading ? (
              <div className="h-6 w-20 bg-gray-200 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-2xl font-bold text-gray-800">
                ₹{Math.round(average)}
              </p>
            )}
            {error && (
              <p className="text-xs text-red-600 mt-1">{String(error)}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
      <div className="bg-white rounded-lg shadow p-4 flex items-center">
        <div className="rounded-full bg-green-100 p-3 mr-4">
          <IndianRupee size={24} className="text-green-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-800">
            {loading ? 'Loading...' : `₹${total.toFixed(2)}`}
          </p>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-4 flex items-center">
        <div className="rounded-full bg-blue-100 p-3 mr-4">
          <Scissors size={24} className="text-blue-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Services</p>
          <p className="text-2xl font-bold text-gray-800">
            {loading ? 'Loading...' : count}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 flex items-center">
        <div className="rounded-full bg-yellow-100 p-3 mr-4">
          <TrendingUp size={24} className="text-yellow-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Average Sale</p>
          <p className="text-2xl font-bold text-gray-800">
            {loading ? 'Loading...' : `₹${Math.round(average)}`}
          </p>
          {error && (
            <p className="text-xs text-red-600 mt-1">{String(error)}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default DailyEntryHeader
