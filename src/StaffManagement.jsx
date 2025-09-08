"use client"

import { useState } from "react"
import Sidebar from "./components/Sidebar"
// Make sure these file paths and component names match your actual files
import StaffAttendance from "./StaffAttendance"
import StaffDB from "./StaffDb" // Check the exact filename case here
import StaffHistory from "./StaffHistory" // Check the exact filename case here
import { Menu } from "lucide-react"

const StaffManagement = () => {
  const [activeTab, setActiveTab] = useState("staffAttendance")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Function to render the active tab content
  const renderContent = () => {
    switch (activeTab) {
      case "staffAttendance":
        return <StaffAttendance />
      case "staffDb":
        return <StaffDB />
      case "staffHistory":
        return <StaffHistory />
      default:
        return <StaffAttendance /> // Default to staff attendance
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top mobile header with menu button */}
        <header className="flex items-center h-16 bg-white shadow-sm md:hidden">
          <button
            className="p-4 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} className="text-blue-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Salon Dashboard</h1>
        </header>

        {/* Main content area */}
        <main className="flex-1 p-4 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

export default StaffManagement