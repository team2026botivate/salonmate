'use client';

import { AnimatePresence } from 'framer-motion';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext.jsx';
import ProtectedRoute from './Routes/ProtectedRoute.jsx';
import Dashboard from './components/Dashboard.jsx';
import ProfilePage from './components/profile/profilePage.jsx';
import './index.css';
// import TrialPage from "./Pages/trialpage.jsx"
import { Toaster } from 'react-hot-toast';
import AuthPage from './components/AuthPage.jsx';
import LicenseGuard from './components/license/licenseGuard.jsx';
import ForgetPassword from './Pages/forgetPassword.jsx';
import EcommerceStorePage from './Pages/ecommerce-store-page.jsx';
import Ecommerce_Add_product from './Pages/Ecommerce_Add_product.jsx';
function App() {
  return (
    <Router>
      <AuthProvider>
        <AnimatePresence>
          <Toaster />
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/forget-password" element={<ForgetPassword />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<LicenseGuard />}>
                <Route path="/admin-dashboard/*" element={<Dashboard />} />
                <Route path="/profile/:id" element={<ProfilePage />} />
              </Route>
              <Route path="/store" element={<EcommerceStorePage />} />
              <Route path="/store/add-product" element={<Ecommerce_Add_product />} />
            </Route>

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/auth" />} />
            <Route path="*" element={<Navigate to="/auth" />} />
          </Routes>
        </AnimatePresence>
      </AuthProvider>
    </Router>
  );
}

export default App;
