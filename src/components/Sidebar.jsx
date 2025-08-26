"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";

import { useAuth } from "../Context/AuthContext";

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
};

export default function Sidebar({
  activeTab,
  setActiveTab,
  activeStaffTab,
  setActiveStaffTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  allowedTabs = [], // Tabs that the user is allowed to access based on permissions in column H
}) {
  const [isStaffMenuOpen, setIsStaffMenuOpen] = useState(false);
  const { user, hasPermission } = useAuth();

  // Helper function to check if a specific component is allowed
  const isComponentAllowed = (componentId) => {
    // Check if it's in the allowedTabs list (which is already filtered based on permissions)
    return allowedTabs.includes(componentId);
  };

  // Helper function to check if a staff submenu item is allowed
  const isStaffSubmenuItemAllowed = (subItemId) => {
    // If the staff menu itself isn't allowed, no submenu items are allowed
    if (!isComponentAllowed("staff")) return false;

    // Check specific submenu permission
    const permissionName = COMPONENT_PERMISSION_MAP[subItemId];
    if (!permissionName) return false;

    // Allow if user has the specific permission or the general staff permission or all permission
    return (
      user?.permissions?.includes(permissionName) ||
      user?.permissions?.includes("staff") || // Having 'staff' permission grants access to all staff components
      user?.permissions?.includes("all") // Having 'all' permission grants access to everything
    );
  };

  // Toggle staff submenu
  const toggleStaffMenu = () => {
    // Only toggle if user has permission
    if (isComponentAllowed("staff")) {
      setIsStaffMenuOpen(!isStaffMenuOpen);
      if (!isStaffMenuOpen) {
        setActiveTab("staff");
      }
    }
  };

  // Handle clicking a staff submenu item
  const handleStaffItemClick = (tabName) => {
    // Only allow if the user has permission for this specific staff component
    if (isStaffSubmenuItemAllowed(tabName)) {
      setActiveStaffTab(tabName);
      setActiveTab("staff");
      setIsMobileMenuOpen(false);
    }
  };

  // Handle clicking a main menu item
  const handleTabClick = (tabName) => {
    // Only change tab if it's allowed for this user based on permissions
    if (isComponentAllowed(tabName)) {
      setActiveTab(tabName);
      setIsMobileMenuOpen(false);
    }
  };

  // Define menu items
  const menuItems = [
    { id: "dashboardHome", label: "Dashboard", icon: <Home size={20} /> },
    { id: "booking", label: "Appointment", icon: <Calendar size={20} /> },
    {
      id: "dailyEntry",
      label: "Running Appointment",
      icon: <ClipboardCheck size={20} />,
    },
    {
      id: "appointmentHistory",
      label: "Appointment History",
      icon: <BarChart2 size={20} />,
    },
    // Staff section with submenu
    {
      id: "staff",
      label: "Staff",
      icon: <UserCheck size={20} />,
      hasSubmenu: true,
      submenuItems: [
        {
          id: "staffAttendance",
          label: "Staff Attendance",
          icon: <UserCheck size={18} />,
        },
        { id: "staffDB", label: "Staff DB", icon: <Database size={18} /> },
        {
          id: "staffHistory",
          label: "Staff History",
          icon: <History size={18} />,
        },
      ],
    },
    { id: "inventory", label: "Inventory", icon: <Package size={20} /> },
    { id: "services", label: "Services", icon: <Scissors size={20} /> },
    {
      id: "paymentCommission",
      label: "Payment+Commission",
      icon: <DollarSign size={20} />,
    },
    { id: "customerDb", label: "Customers", icon: <Users size={20} /> },
    { id: "promoCard", label: "Promo Cards", icon: <Tag size={20} /> },
    { id: "license", label: "License", icon: <KeyRound size={20} /> },
    {
      id: "whatsappTemplate",
      label: "WhatsApp Template",
      icon: <MessageSquare size={20} />,
    },
  ];

  return (
    <motion.div
      className={`w-full md:w-64 bg-white overflow-y-auto hideScrollBar shadow-lg z-20 md:relative fixed inset-0 transform ${
        isMobileMenuOpen
          ? "translate-x-0"
          : "-translate-x-full md:translate-x-0"
      } transition-transform duration-300 ease-in-out`}
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 border-b">
        <h2 className="text-2xl font-bold text-indigo-700">Dashboard</h2>
        {user && (
          <p className="text-sm text-gray-500 mt-1">
            Logged in as: <span className="font-medium">{user.name}</span>
            <span className="ml-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-800 text-xs rounded-md">
              {user.role}
            </span>
          </p>
        )}
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            // Skip items that are not in allowed tabs based on user permissions in column H
            if (!isComponentAllowed(item.id)) {
              return null;
            }

            return (
              <li key={item.id}>
                {item.hasSubmenu ? (
                  <div>
                    <button
                      onClick={toggleStaffMenu}
                      className={`flex items-center justify-between w-full p-2 rounded-md hover:bg-indigo-50 ${
                        activeTab === item.id
                          ? "bg-indigo-100 text-indigo-700"
                          : ""
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="mr-3 text-gray-500">{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      {isStaffMenuOpen ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>

                    {/* Staff submenu - only show submenu items that the user has permission for */}
                    {isStaffMenuOpen && (
                      <ul className="ml-8 mt-2 space-y-1">
                        {item.submenuItems.map((subItem) => {
                          // Skip submenu items the user doesn't have permission for
                          if (!isStaffSubmenuItemAllowed(subItem.id)) {
                            return null;
                          }

                          return (
                            <li key={subItem.id}>
                              <button
                                onClick={() => handleStaffItemClick(subItem.id)}
                                className={`flex items-center w-full p-2 rounded-md hover:bg-indigo-50 ${
                                  activeTab === "staff" &&
                                  activeStaffTab === subItem.id
                                    ? "bg-indigo-100 text-indigo-700"
                                    : ""
                                }`}
                              >
                                <span className="mr-3 text-gray-500">
                                  {subItem.icon}
                                </span>
                                <span className="text-sm">{subItem.label}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleTabClick(item.id)}
                    className={`flex items-center w-full p-2 rounded-md hover:bg-indigo-50 ${
                      activeTab === item.id
                        ? "bg-indigo-100 text-indigo-700"
                        : ""
                    }`}
                  >
                    <span className="mr-3 text-gray-500">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </motion.div>
  );
}
