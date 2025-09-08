'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  ClipboardCheck,
  UserCheck,
  Package,
  Scissors,
  ChevronDown,
  ChevronUp,
  Database,
  History,
  DollarSign,
  Users,
  Tag,
  Home,
  KeyRound,
  MessageSquare,
  BarChart2,
} from 'lucide-react'

import { useAuth } from '../Context/AuthContext'

// Map component names to identifiers used in permissions
const COMPONENT_PERMISSION_MAP = {
  dashboardHome: 'dashboard',
  booking: 'appointment',
  dailyEntry: 'runningappointment',
  appointmentHistory: 'appointmenthistory',
  staff: 'staff',
  staffAttendance: 'staffattendance',
  staffDB: 'staffdb',
  staffHistory: 'staffhistory',
  inventory: 'inventory',
  services: 'services',
  paymentCommission: 'paymentcommission',
  customerDb: 'customers',
  promoCard: 'promocards',
  license: 'license',
  whatsappTemplate: 'whatsapptemplate',
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  activeStaffTab,
  setActiveStaffTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  allowedTabs = [], // Tabs that the user is allowed to access based on permissions in column H
}) {
  const [isStaffMenuOpen, setIsStaffMenuOpen] = useState(false)
  const { user, hasPermission } = useAuth()

  // Helper function to check if a specific component is allowed
  const isComponentAllowed = (componentId) => {
    // Check if it's in the allowedTabs list (which is already filtered based on permissions)
    return allowedTabs.includes(componentId)
  }

  // Helper function to check if a staff submenu item is allowed
  const isStaffSubmenuItemAllowed = (subItemId) => {
    // If the staff menu itself isn't allowed, no submenu items are allowed
    if (!isComponentAllowed('staff')) return false

    // Check specific submenu permission
    const permissionName = COMPONENT_PERMISSION_MAP[subItemId]
    if (!permissionName) return false

    // Allow if user has the specific permission or the general staff permission or all permission
    return (
      user?.permissions?.includes(permissionName) ||
      user?.permissions?.includes('staff') || // Having 'staff' permission grants access to all staff components
      user?.permissions?.includes('all') // Having 'all' permission grants access to everything
    )
  }

  // Toggle staff submenu
  const toggleStaffMenu = () => {
    // Only toggle if user has permission
    if (isComponentAllowed('staff')) {
      setIsStaffMenuOpen(!isStaffMenuOpen)
      if (!isStaffMenuOpen) {
        setActiveTab('staff')
      }
    }
  }

  // Handle clicking a staff submenu item
  const handleStaffItemClick = (tabName) => {
    // Only allow if the user has permission for this specific staff component
    if (isStaffSubmenuItemAllowed(tabName)) {
      setActiveStaffTab(tabName)
      setActiveTab('staff')
      setIsMobileMenuOpen(false)
    }
  }

  // Handle clicking a main menu item
  const handleTabClick = (tabName) => {
    // Only change tab if it's allowed for this user based on permissions
    if (isComponentAllowed(tabName)) {
      setActiveTab(tabName)
      setIsMobileMenuOpen(false)
    }
  }

  // Define menu items
  const menuItems = [
    { id: 'dashboardHome', label: 'Dashboard', icon: <Home size={20} /> },
    { id: 'booking', label: 'Appointment', icon: <Calendar size={20} /> },
    {
      id: 'dailyEntry',
      label: 'Running Appointment',
      icon: <ClipboardCheck size={20} />,
    },
    {
      id: 'appointmentHistory',
      label: 'Appointment History',
      icon: <BarChart2 size={20} />,
    },
    // Staff section with submenu
    {
      id: 'staff',
      label: 'Staff',
      icon: <UserCheck size={20} />,
      hasSubmenu: true,
      submenuItems: [
        {
          id: 'staffAttendance',
          label: 'Staff Attendance',
          icon: <UserCheck size={18} />,
        },
        { id: 'staffDB', label: 'Staff DB', icon: <Database size={18} /> },
        {
          id: 'staffHistory',
          label: 'Staff History',
          icon: <History size={18} />,
        },
      ],
    },
    { id: 'inventory', label: 'Inventory', icon: <Package size={20} /> },
    { id: 'services', label: 'Services', icon: <Scissors size={20} /> },
    {
      id: 'paymentCommission',
      label: 'Payment+Commission',
      icon: <DollarSign size={20} />,
    },
    { id: 'customerDb', label: 'Customers', icon: <Users size={20} /> },
    { id: 'promoCard', label: 'Promo Cards', icon: <Tag size={20} /> },
    { id: 'license', label: 'License', icon: <KeyRound size={20} /> },

    //todo i have to add this in future
    // Temporarily hidden - uncomment when needed in future
    // {
    //   id: "whatsappTemplate",
    //   label: "WhatsApp Template",
    //   icon: <MessageSquare size={20} />,
    // },
  ]

  return (
    <motion.div
      className={`hideScrollBar fixed inset-0 z-20 w-full transform overflow-y-auto bg-white shadow-xl border-r border-gray-200 md:relative md:w-72 ${
        isMobileMenuOpen
          ? 'translate-x-0'
          : '-translate-x-full md:translate-x-0'
      } transition-all duration-500 ease-out`}
      initial={{ opacity:0 }}
      animate={{ opacity:1 }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      {/* Header Section */}
      <div className="relative p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5"></div>
        <div className="relative">
          <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text">
            Dashboard
          </h2>
          {user && (
            <div className="mt-3 space-y-1 ">
              <p className="text-sm text-gray-600">
                Welcome back,{' '}
                <span className="font-semibold text-gray-900">{user.name}</span>
              </p>
              <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 border border-blue-200 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100">
                {user.role}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            // Additional UI rule: hide certain sections for staff regardless of permissions
            const staffHidden = new Set([
              'staff',
              'services',
              'paymentCommission',
              'customerDb',
              'promoCard',
              'license',
              'whatsappTemplate',
              "dashboardHome",
              "appointmentHistory"
            ])

            if (user?.role === 'staff' && staffHidden.has(item.id)) {
              return null
            }

            // Skip items that are not in allowed tabs based on user permissions in column H
            if (!isComponentAllowed(item.id)) {
              return null
            }

            return (
              <li key={item.id}>
                {item.hasSubmenu ? (
                  <div className="space-y-1">
                    <motion.button
                      onClick={toggleStaffMenu}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`group flex w-full items-center justify-between rounded-xl p-3 transition-all duration-300 ease-out ${
                        activeTab === item.id
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md hover:shadow-gray-200/50'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className={`mr-3 transition-colors duration-300 ${
                          activeTab === item.id 
                            ? 'text-white' 
                            : 'text-gray-500 group-hover:text-blue-500'
                        }`}>
                          {item.icon}
                        </span>
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <motion.div
                        animate={{ rotate: isStaffMenuOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className={`transition-colors duration-300 ${
                          activeTab === item.id 
                            ? 'text-white' 
                            : 'text-gray-500 group-hover:text-blue-500'
                        }`}
                      >
                        <ChevronDown size={16} />
                      </motion.div>
                    </motion.button>

                    {/* Staff submenu - only show submenu items that the user has permission for */}
                    <motion.div
                      initial={false}
                      animate={{ 
                        height: isStaffMenuOpen ? 'auto' : 0,
                        opacity: isStaffMenuOpen ? 1 : 0
                      }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      {isStaffMenuOpen && (
                        <ul className="pl-4 mt-2 ml-6 space-y-1 border-l-2 border-gray-200">
                          {item.submenuItems.map((subItem) => {
                            // Skip submenu items the user doesn't have permission for
                            if (!isStaffSubmenuItemAllowed(subItem.id)) {
                              return null
                            }

                            return (
                              <li key={subItem.id}>
                                <motion.button
                                  onClick={() => handleStaffItemClick(subItem.id)}
                                  whileHover={{ scale: 1.02, x: 4 }}
                                  whileTap={{ scale: 0.98 }}
                                  className={`group flex w-full items-center rounded-lg p-2.5 transition-all duration-300 ${
                                    activeTab === 'staff' &&
                                    activeStaffTab === subItem.id
                                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20'
                                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                  }`}
                                >
                                  <span className={`mr-3 transition-colors duration-300 ${
                                    activeTab === 'staff' && activeStaffTab === subItem.id
                                      ? 'text-white'
                                      : 'text-gray-500 group-hover:text-emerald-500'
                                  }`}>
                                    {subItem.icon}
                                  </span>
                                  <span className="text-sm font-medium">{subItem.label}</span>
                                </motion.button>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </motion.div>
                  </div>
                ) : (
                  <motion.button
                    onClick={() => handleTabClick(item.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group flex w-full items-center rounded-xl p-3 transition-all duration-300 ease-out ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md hover:shadow-gray-200/50'
                    }`}
                  >
                    <span className={`mr-3 transition-colors duration-300 ${
                      activeTab === item.id 
                        ? 'text-white' 
                        : 'text-gray-500 group-hover:text-blue-500'
                    }`}>
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.label}</span>
                  </motion.button>
                )}
              </li>
            )
          })}
        </ul>
      </nav>
      
    
    
    </motion.div>
  )
}