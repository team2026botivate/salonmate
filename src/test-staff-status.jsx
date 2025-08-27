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
    console.log('Test result:', result)
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
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Test Staff Status Hook</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Staff ID:</label>
          <input
            type="text"
            value={testStaffId}
            onChange={(e) => setTestStaffId(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter staff ID"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Service Time (minutes):</label>
          <input
            type="number"
            value={serviceTime}
            onChange={(e) => setServiceTime(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Current Status:</label>
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
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Start Timer'}
          </button>

          <button
            onClick={handleCancel}
            disabled={!testStaffId}
            className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
          >
            Cancel Timer
          </button>

          <button
            onClick={handleStatusUpdate}
            disabled={loading || !testStaffId}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
          >
            Set Available
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            Error: {error}
          </div>
        )}

        {result && (
          <div className="p-3 bg-gray-100 border rounded">
            <h3 className="font-medium mb-2">Result:</h3>
            <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}

        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-medium mb-2">Active Timers:</h3>
          <p className="text-sm">{getActiveTimers().join(', ') || 'None'}</p>
        </div>
      </div>
    </div>
  )
}

export default TestStaffStatus
