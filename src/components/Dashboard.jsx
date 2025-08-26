"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "../Context/AuthContext.jsx"
import Navbar from "./Navbar.jsx"
import Sidebar from "./Sidebar.jsx"
import Booking from "./Booking.jsx"
import DailyEntry from "../DailyEntry.jsx"
import StaffAttendance from "../StaffAttendance.jsx"
import Inventory from "../Inventory.jsx"
import Services from "../Services.jsx"
import StaffDB from "../StaffDb.jsx"
import StaffHistory from "../StaffHistory.jsx"
import PaymentCommission from "../payment-commission.jsx"
import DashboardHome from "./DashboardHome.jsx"
// Import the new components
import CustomerDb from "../customer-db.jsx"
import PromoCard from "../promo-card.jsx"
import License from "../license.jsx"
import AppointmentHistory from "../AppointmentHistory.jsx"
import WhatsappTemplate from "../WhattsappTemplate.jsx"

// Map component names to identifiers used in permissions
const COMPONENT_PERMISSION_MAP = {
  dashboardHome: "dashboard",
  booking: "appointment",
  dailyEntry: "runningappointment",
  appointmentHistory: "appointmenthistory",
  staff: "staff",
  staffAttendance: "staffattendance",
  staffDB: "staffdb",
  staffHistory: "staffhistory",
  inventory: "inventory",
  services: "services",
  paymentCommission: "paymentcommission",
  customerDb: "customers",
  promoCard: "promocards",
  license: "license",
  whatsappTemplate: "whatsapptemplate",
}

export default function Dashboard() {
  const { user, isAuthenticated, hasPermission } = useAuth()
  const [activeTab, setActiveTab] = useState("booking") // Changed default to booking
  const [activeStaffTab, setActiveStaffTab] = useState("staffAttendance")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [allowedTabs, setAllowedTabs] = useState([])

  // Set initial active tab and allowed tabs based on user role and permissions
  useEffect(() => {
    // Function to check if a component is allowed based on user permissions
    const isComponentAllowed = (componentId) => {
      // Special case: if user has 'all' permission, allow everything
      if (user?.permissions?.includes("all")) {
        return true
      }

      // Map component ID to permission name
      const permissionName = COMPONENT_PERMISSION_MAP[componentId]

      // Check if user has this specific permission
      return permissionName && user?.permissions?.includes(permissionName)
    }

    // Calculate allowed tabs based on permissions in column H
    const permissionBasedTabs = []

    // All possible tabs to check
    const allPossibleTabs = [
      "dashboardHome",
      "booking",
      "dailyEntry",
      "appointmentHistory",
      "staff",
      "inventory",
      "services",
      "paymentCommission",
      "customerDb",
      "promoCard",
      "license",
      "whatsappTemplate",
    ]

    // Check each tab against user permissions
    allPossibleTabs.forEach((tab) => {
      if (isComponentAllowed(tab)) {
        permissionBasedTabs.push(tab)
      }
    })

    setAllowedTabs(permissionBasedTabs)

    // Set initial active tab - try to find the first allowed tab
    if (permissionBasedTabs.length > 0) {
      // Try to use booking as default for staff, dashboardHome for admin if available
      if (user?.role === "staff" && permissionBasedTabs.includes("booking")) {
        setActiveTab("booking")
      } else if (user?.role === "admin" && permissionBasedTabs.includes("dashboardHome")) {
        setActiveTab("dashboardHome")
      } else {
        // Otherwise use the first allowed tab
        setActiveTab(permissionBasedTabs[0])
      }
    }
  }, [user])

  // Handle tab change - only allow changing to permitted tabs
  const handleTabChange = (tabName) => {
    if (allowedTabs.includes(tabName)) {
      setActiveTab(tabName)
    }
  }

  // Check if staff submenu items are allowed based on permissions
  const isStaffSubmenuAllowed = (subTabName) => {
    const permissionName = COMPONENT_PERMISSION_MAP[subTabName]
    return (
      permissionName &&
      (user?.permissions?.includes(permissionName) ||
        user?.permissions?.includes("all") ||
        user?.permissions?.includes("staff"))
    )
  }

  // This function handles the main content rendering based on permissions
  const renderContent = () => {
    // For admin users with staff tab selected
    if (activeTab === "staff") {
      // Check if the specific staff submenu is allowed
      switch (activeStaffTab) {
        case "staffAttendance":
          return isStaffSubmenuAllowed("staffAttendance") ? <StaffAttendance /> : <AccessDenied />
        case "staffDB":
          return isStaffSubmenuAllowed("staffDB") ? <StaffDB /> : <AccessDenied />
        case "staffHistory":
          return isStaffSubmenuAllowed("staffHistory") ? <StaffHistory /> : <AccessDenied />
        default:
          return <AccessDenied />
      }
    }

    // Handle other main tabs (available to both admin and staff where permitted)
    // For each tab, check if user has appropriate permission
    switch (activeTab) {
      case "dashboardHome":
        return allowedTabs.includes("dashboardHome") ? (
          <DashboardHome isAdmin={user?.role === "admin"} setActiveTab={setActiveTab} />
        ) : (
          <AccessDenied />
        )
      case "booking":
        return allowedTabs.includes("booking") ? (
          <Booking hideHistoryButton={user?.role === "staff"} />
        ) : (
          <AccessDenied />
        )
      case "dailyEntry":
        return allowedTabs.includes("dailyEntry") ? (
          <DailyEntry hideHistoryButton={user?.role === "staff"} setActiveTab={setActiveTab} />
        ) : (
          <AccessDenied />
        )
      case "appointmentHistory":
        return allowedTabs.includes("appointmentHistory") ? <AppointmentHistory /> : <AccessDenied />
      case "inventory":
        return allowedTabs.includes("inventory") ? (
          <Inventory hideHistoryButton={user?.role === "staff"} />
        ) : (
          <AccessDenied />
        )
      case "services":
        return allowedTabs.includes("services") ? <Services isAdmin={user?.role === "admin"} /> : <AccessDenied />
      case "paymentCommission":
        return allowedTabs.includes("paymentCommission") ? (
          <PaymentCommission isAdmin={user?.role === "admin"} />
        ) : (
          <AccessDenied />
        )
      case "customerDb":
        return allowedTabs.includes("customerDb") ? <CustomerDb /> : <AccessDenied />
      case "promoCard":
        return allowedTabs.includes("promoCard") ? <PromoCard /> : <AccessDenied />
      case "license":
        return allowedTabs.includes("license") ? <License /> : <AccessDenied />
      case "whatsappTemplate":
        return allowedTabs.includes("whatsappTemplate") ? <WhatsappTemplate /> : <AccessDenied />
      default:
        // Fallback to first allowed tab
        return allowedTabs.length > 0 ? (
          renderContent(allowedTabs[0])
        ) : (
          <AccessDenied message="No components available with your permissions" />
        )
    }
  }

  // AccessDenied component to show when user doesn't have permission
  const AccessDenied = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-red-50 rounded-lg">
      <div className="w-16 h-16 mb-4 text-red-500 flex items-center justify-center rounded-full bg-red-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3V6a3 3 0 00-3-3H6a3 3 0 00-3 3v6a3 3 0 003 3h6a3 3 0 003-3z"
          />
        </svg>
      </div>
      <h2 className="mb-2 text-xl font-semibold text-red-700">Access Denied</h2>
      <p className="text-red-600">{message || "You don't have permission to view this component."}</p>
      <p className="mt-4 text-sm text-gray-600">Please contact your administrator if you believe this is a mistake.</p>
    </div>
  )

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} userRole={user?.role} />
        <motion.main
          key={activeTab === "staff" ? activeStaffTab : activeTab}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-y-auto p-4 md:p-6"
        >
          {renderContent()}
        </motion.main>
        <footer className="w-full py-1 px-3 text-center text-xs text-black bg-blue-300 border-t border-gray-200 shadow-sm">
          <a
            href="https://botivate.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition-colors duration-200"
          >
            Powered By-Botivate
          </a>
        </footer>
      </div>
    </div>
  )
}
