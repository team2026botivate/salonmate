import React from 'react'
import { motion } from 'framer-motion'
import { DivideIcon as LucideIcon } from 'lucide-react'

 const SummaryCard = ({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  index,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className={`${bgColor} rounded-xl p-6 shadow-lg border border-white/20 backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-')}/10`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </motion.div>
  )
}

export default SummaryCard
