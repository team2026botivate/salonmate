import { motion } from 'framer-motion'
import { Calendar, Clock, User } from 'lucide-react'
import React from 'react'

const BookingStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-md p-4 flex items-center hover:scale-105 transition-transform duration-200"
      >
        <div className="rounded-full bg-blue-100 p-3 mr-4">
          <Calendar size={24} className="text-blue-600" />
        </div>
        <div>
          <p className="text-sm text-blue-500">Today's Appointments</p>
          <p className="text-2xl font-bold text-blue-800">{stats.today}</p>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-md p-4 flex items-center hover:scale-105 transition-transform duration-200"
      >
        <div className="rounded-full bg-indigo-100 p-3 mr-4">
          <Clock size={24} className="text-indigo-600" />
        </div>
        <div>
          <p className="text-sm text-indigo-500">Upcoming</p>
          <p className="text-2xl font-bold text-indigo-800">{stats.upcoming}</p>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg shadow-md p-4 flex items-center hover:scale-105 transition-transform duration-200"
      >
        <div className="rounded-full bg-purple-100 p-3 mr-4">
          <User size={24} className="text-purple-600" />
        </div>
        <div>
          <p className="text-sm text-purple-500">Total Clients</p>
          <p className="text-2xl font-bold text-purple-800">
            {stats.totalClients}
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default BookingStats
