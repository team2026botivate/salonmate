'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../Context/AuthContext.jsx'
import Navbar from './Navbar.jsx'
import Sidebar from './Sidebar.jsx'
import Booking from './Booking.jsx'
import DailyEntry from '../DailyEntry.jsx'
import StaffAttendance from '../StaffAttendance.jsx'
import Inventory from '../Inventory.jsx'
import Services from '../Services.jsx'
import StaffDB from '../StaffDb.jsx'
import StaffHistory from '../StaffHistory.jsx'
import PaymentCommission from '../payment-commission.jsx'
import DashboardHome from './DashboardHome.jsx'
// Import the new components
import CustomerDb from '../customer-db.jsx'
import PromoCard from '../promo-card.jsx'
import License from '../license.jsx'
import AppointmentHistory from '../AppointmentHistory.jsx'
import WhatsappTemplate from '../WhattsappTemplate.jsx'

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

// AccessDenied component moved outside for better performance
const AccessDenied = ({ message }) => (
  <div className="flex h-full flex-col items-center justify-center rounded-lg bg-red-50 p-6 text-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
        />
      </svg>
    </div>
    <h2 className="mb-2 text-xl font-semibold text-red-700">Access Denied</h2>
    <p className="text-red-600">
      {message || "You don't have permission to view this component."}
    </p>
    <p className="mt-4 text-sm text-gray-600">
      Please contact your administrator if you believe this is a mistake.
    </p>
  </div>
)

export default function Dashboard() {
  const { user, isAuthenticated, hasPermission } = useAuth()

  console.log(user,"permissions")
  
  // State management
  const [activeTab, setActiveTab] = useState('')
  const [activeStaffTab, setActiveStaffTab] = useState('staffAttendance')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Memoize permission checking function for better performance
  const isComponentAllowed = useCallback((componentId) => {
    if (!user?.permissions) return false
    
    // Special case: if user has 'all' permission, allow everything
    if (user.permissions.includes('all')) {
      return true
    }

    // Map component ID to permission name
    const permissionName = COMPONENT_PERMISSION_MAP[componentId]
    
    // Check if user has this specific permission
    return permissionName && user.permissions.includes(permissionName)
  }, [user?.permissions])

  // Memoize allowed tabs calculation
  const allowedTabs = useMemo(() => {
    if (!user?.permissions) return []

    const allPossibleTabs = [
      'dashboardHome',
      'booking',
      'dailyEntry',
      'appointmentHistory',
      'staff',
      'inventory',
      'services',
      'paymentCommission',
      'customerDb',
      'promoCard',
      'license',
      'whatsappTemplate',
    ]

    return allPossibleTabs.filter(tab => isComponentAllowed(tab))
  }, [isComponentAllowed])

  // Set initial active tab based on user role and permissions
  useEffect(() => {
    if (allowedTabs.length === 0) return

    // Determine initial tab based on role and available permissions
    let initialTab = allowedTabs[0] // fallback to first allowed tab

    // Prefer dashboardHome whenever it's permitted
    if (allowedTabs.includes('dashboardHome')) {
      initialTab = 'dashboardHome'
    } else if (user?.role === 'staff' && allowedTabs.includes('booking')) {
      // Fall back to booking for staff if dashboardHome isn't allowed
      initialTab = 'booking'
    }

    setActiveTab(initialTab)
  }, [allowedTabs, user?.role])

  // Handle tab change - only allow changing to permitted tabs
  const handleTabChange = useCallback((tabName) => {
    if (allowedTabs.includes(tabName)) {
      setActiveTab(tabName)
    }
  }, [allowedTabs])

  // Check if staff submenu items are allowed based on permissions
  const isStaffSubmenuAllowed = useCallback((subTabName) => {
    if (!user?.permissions) return false
    
    const permissionName = COMPONENT_PERMISSION_MAP[subTabName]
    return (
      permissionName &&
      (user.permissions.includes(permissionName) ||
        user.permissions.includes('all') ||
        user.permissions.includes('staff'))
    )
  }, [user?.permissions])

  // Main content rendering function
  const renderContent = useCallback(() => {
    if (!activeTab) {
      return <AccessDenied message="Loading..." />
    }

    // For admin users with staff tab selected
    if (activeTab === 'staff') {
      switch (activeStaffTab) {
        case 'staffAttendance':
          return isStaffSubmenuAllowed('staffAttendance') ? (
            <StaffAttendance />
          ) : (
            <AccessDenied />
          )
        case 'staffDB':
          return isStaffSubmenuAllowed('staffDB') ? (
            <StaffDB />
          ) : (
            <AccessDenied />
          )
        case 'staffHistory':
          return isStaffSubmenuAllowed('staffHistory') ? (
            <StaffHistory />
          ) : (
            <AccessDenied />
          )
        default:
          return <AccessDenied />
      }
    }

    // Handle other main tabs
    const componentMap = {
      dashboardHome: () => (
        <DashboardHome
          isAdmin={user?.role === 'admin'}
          setActiveTab={setActiveTab}
        />
      ),
      booking: () => (
        <Booking hideHistoryButton={user?.role === 'staff'} />
      ),
      dailyEntry: () => (
        <DailyEntry
          hideHistoryButton={user?.role === 'staff'}
          setActiveTab={setActiveTab}
        />
      ),
      appointmentHistory: () => <AppointmentHistory />,
      inventory: () => (
        <Inventory hideHistoryButton={user?.role === 'staff'} />
      ),
      services: () => <Services isAdmin={user?.role === 'admin'} />,
      paymentCommission: () => (
        <PaymentCommission isAdmin={user?.role === 'admin'} />
      ),
      customerDb: () => <CustomerDb />,
      promoCard: () => <PromoCard />,
      license: () => <License />,
      whatsappTemplate: () => <WhatsappTemplate />,
    }

    const ComponentRenderer = componentMap[activeTab]
    
    if (ComponentRenderer && allowedTabs.includes(activeTab)) {
      return <ComponentRenderer />
    }

    return allowedTabs.length > 0 ? (
      <AccessDenied message="Component not found or not accessible" />
    ) : (
      <AccessDenied message="No components available with your permissions" />
    )
  }, [
    activeTab,
    activeStaffTab,
    user?.role,
    allowedTabs,
    isStaffSubmenuAllowed
  ])

  // Show loading or authentication check
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="mb-4 text-lg">Please log in to continue</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-100 md:flex-row ">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        activeStaffTab={activeStaffTab}
        setActiveStaffTab={setActiveStaffTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        allowedTabs={allowedTabs}
        userRole={user?.role}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          userRole={user?.role}
        />
        <motion.main
          key={activeTab === 'staff' ? activeStaffTab : activeTab}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-y-auto p-4 md:p-6"
        >
          {renderContent()}
        </motion.main>
        <footer className="w-full border-t border-gray-200 bg-blue-300 px-3 py-1 text-center text-xs text-black shadow-sm">
          <a
            href="https://botivate.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors duration-200 hover:text-blue-600"
          >
            Powered By-Botivate
          </a>
        </footer>
      </div>
    </div>
  )
}