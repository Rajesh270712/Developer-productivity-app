{/* Update routes to include Reports page */}
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

// Layouts
import AppLayout from '../layout/AppLayout';

// Auth Pages
import LoginPage from '../auth/LoginPage';

// Developer Features
import DeveloperDashboard from '../features/developer/DeveloperDashboard';
import LogForm from '../features/developer/LogForm';
import LogList from '../features/developer/LogList';
import LogDetail from '../features/developer/LogDetail';
import ProductivityChart from '../features/developer/ProductivityChart';

// Manager Features
import ManagerDashboard from '../features/manager/ManagerDashboard';
import TeamLogList from '../features/manager/TeamLogList';
import LogReview from '../features/manager/LogReview';
import Reports from '../features/manager/Reports';

// Other Pages
const SettingsPage = () => (
  <div className="text-center py-10">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
    <p className="text-gray-600">Settings page is under construction.</p>
  </div>
);

const NotFoundPage = () => (
  <div className="text-center py-10">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
    <p className="text-gray-600">The page you're looking for doesn't exist.</p>
  </div>
);

// Route Guards
interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: 'developer' | 'manager';
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-solid border-blue-600 border-r-transparent"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Check role if required
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  const isManager = user?.role === 'manager';
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Private Routes */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" />} />
        
        <Route
          path="dashboard"
          element={
            isManager ? (
              <PrivateRoute requiredRole="manager">
                <ManagerDashboard />
              </PrivateRoute>
            ) : (
              <PrivateRoute requiredRole="developer">
                <DeveloperDashboard />
              </PrivateRoute>
            )
          }
        />
        
        {/* Developer Routes */}
        <Route
          path="logs"
          element={
            <PrivateRoute requiredRole="developer">
              <LogList />
            </PrivateRoute>
          }
        />
        <Route
          path="logs/new"
          element={
            <PrivateRoute requiredRole="developer">
              <LogForm />
            </PrivateRoute>
          }
        />
        <Route
          path="logs/:logId"
          element={
            <PrivateRoute requiredRole="developer">
              <LogDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="logs/edit/:logId"
          element={
            <PrivateRoute requiredRole="developer">
              <LogForm />
            </PrivateRoute>
          }
        />
        <Route
          path="stats"
          element={
            <PrivateRoute requiredRole="developer">
              <ProductivityChart />
            </PrivateRoute>
          }
        />
        
        {/* Manager Routes */}
        <Route
          path="team"
          element={
            <PrivateRoute requiredRole="manager">
              <TeamLogList />
            </PrivateRoute>
          }
        />
        <Route
          path="team/logs/:logId"
          element={
            <PrivateRoute requiredRole="manager">
              <LogReview />
            </PrivateRoute>
          }
        />
        <Route
          path="reports"
          element={
            <PrivateRoute requiredRole="manager">
              <Reports />
            </PrivateRoute>
          }
        />
        
        {/* Common Routes */}
        <Route
          path="settings"
          element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          }
        />
        
        {/* Fallback Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      
      {/* Catch-all Route */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default AppRoutes;