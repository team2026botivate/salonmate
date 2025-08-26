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
import { Toaster } from 'react-hot-toast'
import AuthPage from './components/AuthPage.jsx'
function App() {
  return (
    <Router>
      <AuthProvider>
        <AnimatePresence>
          <Toaster />
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<AuthPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/admin-dashboard/*" element={<Dashboard />} />

              {/* Add other routes for different sections */}
            </Route>

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/auth" />} />
            <Route path="*" element={<Navigate to="/auth" />} />
          </Routes>
        </AnimatePresence>
      </AuthProvider>
    </Router>
  )
}

export default App
