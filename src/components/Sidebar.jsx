'use client'

import { useState, useEffect } from 'react'
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
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  activeStaffTab,
  setActiveStaffTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  allowedTabs = [], 
}) {
  const [isStaffMenuOpen, setIsStaffMenuOpen] = useState(false)
  const { user, hasPermission } = useAuth()

  
  const [isLegacy, setIsLegacy] = useState(false)
  useEffect(() => {
    try {
      const ua = navigator.userAgent || ''
      const legacyMatch = /MSIE|Trident|Windows NT 6\.1/.test(ua)
      setIsLegacy(legacyMatch)
    } catch (_) {
      setIsLegacy(false)
    }
  }, [])

  const isComponentAllowed = (componentId) => {
    return allowedTabs.includes(componentId)
  }

  const isStaffSubmenuItemAllowed = (subItemId) => {
    if (!isComponentAllowed('staff')) return false
    const permissionName = COMPONENT_PERMISSION_MAP[subItemId]
    if (!permissionName) return false

    return (
      user?.permissions?.includes(permissionName) ||
      user?.permissions?.includes('staff') || 
      user?.permissions?.includes('all') 
    )
  }

  const toggleStaffMenu = () => {
    if (isComponentAllowed('staff')) {
      setIsStaffMenuOpen(!isStaffMenuOpen)
      if (!isStaffMenuOpen) {
        setActiveTab('staff')
      }
    }
  }

  const handleStaffItemClick = (tabName) => {
    if (isStaffSubmenuItemAllowed(tabName)) {
      setActiveStaffTab(tabName)
      setActiveTab('staff')
      setIsMobileMenuOpen(false)
    }
  }

  const handleTabClick = (tabName) => {
    if (isComponentAllowed(tabName)) {
      setActiveTab(tabName)
      setIsMobileMenuOpen(false)
    }
  }

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
    { id: 'promoCard', label: 'Offers & Membership', icon: <Tag size={20} /> },
    { id: 'license', label: 'License', icon: <KeyRound size={20} /> },

  
  ]

  if (isLegacy) {
    return (
      <div className="flex flex-col w-full h-screen p-4 bg-white border-r border-gray-200 md:w-64">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
          {user && (
            <p className="mt-1 text-sm text-gray-600">Welcome, <span className="font-semibold text-gray-900">{user.name}</span></p>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto hideScrollBar">
          <ul>
            {menuItems.map((item) => {
              const staffHidden = new Set(['staff','services','paymentCommission','customerDb','promoCard','license','dashboardHome'])
              if (user?.role === 'staff' && staffHidden.has(item.id)) {
                const perm = COMPONENT_PERMISSION_MAP[item.id]
                const canSee = user?.permissions?.includes('all') || (perm && user?.permissions?.includes(perm))
                if (!canSee) return null
              }
              if (!isComponentAllowed(item.id)) return null
              return (
                <li key={item.id} className="mb-2">
                  <button
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full text-left px-3 py-2 rounded border border-gray-300 ${activeTab === item.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'} hover:bg-gray-100`}
                  >
                    <span className="inline-block mr-2 align-middle">•</span>
                    <span className="align-middle">{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    )
  }

  return (
    <motion.div
      className={`hideScrollBar fixed inset-0 z-20 w-full h-screen transform bg-white shadow-xl border-r border-gray-200 md:relative md:w-72 flex flex-col ${
        isMobileMenuOpen
          ? 'translate-x-0'
          : '-translate-x-full md:translate-x-0'
      } transition-all duration-500 ease-out`}
      initial={{ opacity:0 }}
      animate={{ opacity:1 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
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
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto hideScrollBar">
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
              "dashboardHome"
            ])

            if (user?.role === 'staff' && staffHidden.has(item.id)) {
              const perm = COMPONENT_PERMISSION_MAP[item.id]
              const canSee = user?.permissions?.includes('all') || (perm && user?.permissions?.includes(perm))
              if (!canSee) {
                return null
              }
            }

            // Skip items that are not in allowed tabs based on user permissions in column H
            if (!isComponentAllowed(item.id)) {
              return null
            }

            return (
              <li key={item.id}>
                {item.hasSubmenu ? (
                  <div className="space-y-1 ">
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