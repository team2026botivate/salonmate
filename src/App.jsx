'use client'

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from './Context/AuthContext.jsx'
import Dashboard from './components/Dashboard.jsx'
import ProtectedRoute from './Routes/ProtectedRoute.jsx'
import LoginPage from './Pages/LoginPage.jsx'
import Booking from './components/Booking.jsx'
import DailyEntry from './DailyEntry.jsx'
import AppointmentHistory from './AppointmentHistory.jsx'
import StaffManagement from './StaffUser.jsx'
import './index.css'
import TrialPage from './Pages/trialpage.jsx'
import ProfilePage from './components/profile/profilePage.jsx'
// import TrialPage from "./Pages/trialpage.jsx"
import { Toaster } from 'react-hot-toast';


function App() {
  return (
    <Router>
      <AuthProvider>
        <AnimatePresence>
          <Toaster />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/trial" element={<TrialPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/admin-dashboard/*" element={<Dashboard />} />
              <Route
                path="/booking"
                element={<Booking hideHistoryButton={false} />}
              />
              <Route
                path="/daily-entry"
                element={<DailyEntry hideHistoryButton={false} />}
              />
              <Route
                path="/appointment-history"
                element={<AppointmentHistory />}
              />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/staff-management" element={<StaffManagement />} />
              {/* Add other routes for different sections */}
            </Route>

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </AnimatePresence>
      </AuthProvider>
    </Router>
  )
}

export default App
