'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../Context/AuthContext.jsx';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';
import Booking from './Booking.jsx';
import DailyEntry from '../DailyEntry.jsx';
import StaffAttendance from '../StaffAttendance.jsx';
import Inventory from '../Inventory.jsx';
import Services from '../Services.jsx';
import StaffDB from '../StaffDb.jsx';
import StaffHistory from '../StaffHistory.jsx';
import PaymentCommission from '../payment-commission.jsx';
import DashboardHome from './DashboardHome.jsx';
// Import the new components
import CustomerDb from '../customer-db.jsx';
import PromoCard from '../promo-card.jsx';
import License from '../license.jsx';
import AppointmentHistory from '../AppointmentHistory.jsx';
import { useNavigate } from 'react-router-dom';
import Footer from './footer.jsx';
import OffersAndMemberships from './layout/Offers_&_Memberships.jsx';
import DailyExpenses from './dailyExpences/dailyExpences.jsx';
import WhatsappMessage from './whatsappMessage-component.jsx';

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
  dailyExpences: 'dailyexpences',
  paymentCommission: 'paymentcommission',
  customerDb: 'customers',
  promoCard: 'promocards',
  license: 'license',
  whatsapp: 'whatsapp',
};

// AccessDenied component moved outside for better performance
const AccessDenied = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-full p-6 text-center rounded-lg bg-red-50">
    <div className="flex items-center justify-center w-16 h-16 mb-4 text-red-500 bg-red-100 rounded-full">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-8 h-8"
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
    <p className="text-red-600">{message || "You don't have permission to view this component."}</p>
    <p className="mt-4 text-sm text-gray-600">
      Please contact your administrator if you believe this is a mistake.
    </p>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, hasPermission } = useAuth();


  // State management
  const [activeTab, setActiveTab] = useState('');

  const [activeStaffTab, setActiveStaffTab] = useState('staffAttendance');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Memoize permission checking function for better performance
  const isComponentAllowed = useCallback(
    (componentId) => {
      // Admins can see everything
      if (String(user?.role).toLowerCase() === 'admin') return true;

      // Staff baseline: always allow Appointment and Running Appointment
      if (String(user?.role).toLowerCase() === 'staff' && (componentId === 'booking' || componentId === 'dailyEntry')) {
        return true;
      }

      if (!user?.permissions) return false;

      // Special case: if user has 'all' permission, allow everything
      if (user?.permissions.includes('all')) {
        return true;
      }

      // Map component ID to permission name
      const permissionName = COMPONENT_PERMISSION_MAP[componentId];

      // Check if user has this specific permission
      return permissionName && user?.permissions.includes(permissionName);
    },
    [user?.permissions, user?.role]
  );

  // Memoize allowed tabs calculation
  const allowedTabs = useMemo(() => {
    const allPossibleTabs = [
      'dashboardHome',
      'booking',
      'dailyEntry',
      'appointmentHistory',
      'staff',
      'inventory',
      'dailyExpences',
      'services',
      'paymentCommission',
      'customerDb',
      'promoCard',
      'license',
      'whatsapp',
      
    ];

    // Admins automatically get all tabs
    if (String(user?.role).toLowerCase() === 'admin') return allPossibleTabs;

    // Staff baseline: if no permissions found, still show Appointment + Running Appointment
    if (String(user?.role).toLowerCase() === 'staff' && (!user?.permissions || user.permissions.length === 0)) {
      return ['booking','dailyEntry'];
    }

    if (!user?.permissions) return [];

    return allPossibleTabs.filter((tab) => isComponentAllowed(tab));
  }, [isComponentAllowed, user?.role, user?.permissions]);

  // Set initial active tab based on user role and permissions
  useEffect(() => {
    if (allowedTabs.length === 0) return;

    // Determine initial tab based on role and available permissions
    let initialTab = allowedTabs[0]; // fallback to first allowed tab

    // Prefer dashboardHome whenever it's permitted
    if (allowedTabs.includes('dashboardHome')) {
      initialTab = 'dashboardHome';
    } else if (user?.role === 'staff' && allowedTabs.includes('booking')) {
      // Fall back to booking for staff if dashboardHome isn't allowed
      initialTab = 'booking';
    }

    setActiveTab(initialTab);
  }, [allowedTabs, user?.role]);

  // Handle tab change - only allow changing to permitted tabs
  const handleTabChange = useCallback(
    (tabName) => {
      if (allowedTabs.includes(tabName)) {
        setActiveTab(tabName);
      }
    },
    [allowedTabs]
  );

  // Check if staff submenu items are allowed based on permissions
  const isStaffSubmenuAllowed = useCallback(
    (subTabName) => {
      if (!user?.permissions) return false;

      const permissionName = COMPONENT_PERMISSION_MAP[subTabName];
      return (
        permissionName &&
        (user?.permissions.includes(permissionName) ||
          user?.permissions.includes('all') ||
          user?.permissions.includes('staff'))
      );
    },
    [user?.permissions]
  );

  // Main content rendering function
  const renderContent = useCallback(() => {
    if (!activeTab) {
      return <AccessDenied message="Loading..." />;
    }

    if (activeTab === 'staff') {
      switch (activeStaffTab) {
        case 'staffAttendance':
          return isStaffSubmenuAllowed('staffAttendance') ? <StaffAttendance /> : <AccessDenied />;
        case 'staffDB':
          return isStaffSubmenuAllowed('staffDB') ? <StaffDB /> : <AccessDenied />;
        case 'staffHistory':
          return isStaffSubmenuAllowed('staffHistory') ? <StaffHistory /> : <AccessDenied />;
        default:
          return <AccessDenied />;
      }
    }

    const componentMap = {
      dashboardHome: () => (
        <DashboardHome isAdmin={user?.role === 'admin'} setActiveTab={setActiveTab} />
      ),
      booking: () => <Booking hideHistoryButton={user?.role === 'staff'} />,
      dailyEntry: () => (
        <DailyEntry hideHistoryButton={user?.role === 'staff'} setActiveTab={setActiveTab} />
      ),
      appointmentHistory: () => <AppointmentHistory />,
      inventory: () => <Inventory hideHistoryButton={user?.role === 'staff'} />,
      dailyExpences: () => <DailyExpenses />,
      services: () => <Services isAdmin={user?.role === 'admin'} />,
      paymentCommission: () => <PaymentCommission isAdmin={user?.role === 'admin'} />,
      customerDb: () => <CustomerDb />,
      promoCard: () => <OffersAndMemberships />,
      license: () => <License />,
      whatsapp: () => <WhatsappMessage />,
      
    };

    const ComponentRenderer = componentMap[activeTab];

    if (ComponentRenderer && allowedTabs.includes(activeTab)) {
      return <ComponentRenderer />;
    }

    return allowedTabs.length > 0 ? (
      <AccessDenied message="Component not found or not accessible" />
    ) : (
      <AccessDenied message="No components available with your permissions" />
    );
  }, [activeTab, activeStaffTab, user?.role, allowedTabs, isStaffSubmenuAllowed]);

  // Show loading or authentication check
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="mb-4 text-lg">Please log in to continue</div>
          <button
            className="px-4 py-2 text-white bg-blue-500 rounded"
            onClick={() => navigate('/auth')}
          >
            redirect to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100 md:flex-row">
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
          className="flex-1 p-4 overflow-y-auto md:p-6"
        >
          {renderContent()}
        </motion.main>
        <Footer />
      </div>
    </div>
  );
}
