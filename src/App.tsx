import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'

// Auth pages
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'

// App pages
import DashboardPage from '@/pages/DashboardPage'
import DebtsPage from '@/pages/DebtsPage'
import DebtDetailPage from '@/pages/DebtDetailPage'
import RequestsPage from '@/pages/RequestsPage'
import ProfilePage from '@/pages/ProfilePage'

// Layout
import AppLayout from '@/components/AppLayout'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Protected routes */}
        <Route path="/app" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="debts" element={<DebtsPage />} />
          <Route path="debts/:id" element={<DebtDetailPage />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
