import { motion } from 'framer-motion';
import {
    DollarSign,
    Scissors,
    TrendingUp,
    Users
} from 'lucide-react';
import { formatCurrency } from "../../utils/formatter"



export const SummaryStats = ({ services }) => {
  const activeServices = services.filter(service => !service.isDeleted);
  const totalServices = services.length;
  const deletedServices = services.length - activeServices.length;
  const averagePrice = activeServices.length > 0 
    ? activeServices.reduce((sum, service) => sum + service.price, 0) / activeServices.length
    : 0;

  const stats = [
    {
      name: 'Total Services',
      value: totalServices,
      change: '+12%',
      changeType: 'increase',
      icon: Scissors,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50'
    },
    {
      name: 'Active Services',
      value: activeServices.length,
      change: '+8%',
      changeType: 'increase',
      icon: TrendingUp,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50'
    },
    {
      name: 'Average Price',
      value: formatCurrency(averagePrice),
      change: '+15%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50'
    },
    {
      name: 'Deleted Services',
      value: deletedServices,
      change: '-3%',
      changeType: 'decrease',
      icon: Users,
      color: 'bg-red-500',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {typeof stat.value === 'string' ? stat.value : stat.value.toLocaleString()}
              </p>
              <div className={`flex items-center mt-2 text-sm ${
                stat.changeType === 'increase' ? 'text-emerald-600' : 'text-red-600'
              }`}>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  stat.changeType === 'increase' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {stat.change} from last month
                </span>
              </div>
            </div>
            <div className={`${stat.bgColor} p-3 rounded-lg`}>
              <stat.icon className={`w-6 h-6 text-white ${stat.color.replace('bg-', 'text-')}`} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};