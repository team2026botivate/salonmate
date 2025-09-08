import React, { useState } from 'react'
import { useDoStaffStatusActive } from './hook/dbOperation'

const TestStaffStatus = () => {
  const { 
    doStaffStatusActive, 
    cancelStaffTimer, 
    getActiveTimers,
    updateStaffStatus,
    loading, 
    error 
  } = useDoStaffStatusActive()

  const [testStaffId, setTestStaffId] = useState('')
  const [serviceTime, setServiceTime] = useState('30')
  const [currentStatus, setCurrentStatus] = useState('active')
  const [result, setResult] = useState(null)

  const handleTest = async () => {
    const result = await doStaffStatusActive(testStaffId, serviceTime, currentStatus)
    setResult(result)
  }

  const handleCancel = () => {
    const cancelled = cancelStaffTimer(testStaffId)
    setResult({ cancelled, message: cancelled ? 'Timer cancelled' : 'No timer found' })
  }

  const handleStatusUpdate = async () => {
    const result = await updateStaffStatus(testStaffId, 'available')
    setResult({ statusUpdate: result })
  }

  return (
    <div className="max-w-md p-6 mx-auto bg-white rounded-lg shadow-md">
      <h2 className="mb-4 text-xl font-bold">Test Staff Status Hook</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Staff ID:</label>
          <input
            type="text"
            value={testStaffId}
            onChange={(e) => setTestStaffId(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter staff ID"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Service Time (minutes):</label>
          <input
            type="number"
            value={serviceTime}
            onChange={(e) => setServiceTime(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Current Status:</label>
          <select
            value={currentStatus}
            onChange={(e) => setCurrentStatus(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="active">Active</option>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
          </select>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleTest}
            disabled={loading || !testStaffId}
            className="px-4 py-2 text-white bg-blue-500 rounded disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Start Timer'}
          </button>

          <button
            onClick={handleCancel}
            disabled={!testStaffId}
            className="px-4 py-2 text-white bg-red-500 rounded disabled:opacity-50"
          >
            Cancel Timer
          </button>

          <button
            onClick={handleStatusUpdate}
            disabled={loading || !testStaffId}
            className="px-4 py-2 text-white bg-green-500 rounded disabled:opacity-50"
          >
            Set Available
          </button>
        </div>

        {error && (
          <div className="p-3 text-red-700 bg-red-100 border border-red-400 rounded">
            Error: {error}
          </div>
        )}

        {result && (
          <div className="p-3 bg-gray-100 border rounded">
            <h3 className="mb-2 font-medium">Result:</h3>
            <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}

        <div className="p-3 border border-blue-200 rounded bg-blue-50">
          <h3 className="mb-2 font-medium">Active Timers:</h3>
          <p className="text-sm">{getActiveTimers().join(', ') || 'None'}</p>
        </div>
      </div>
    </div>
  )
}

export default TestStaffStatus
