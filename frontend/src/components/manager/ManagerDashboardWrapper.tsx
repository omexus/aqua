import React from 'react';
import { useLocation } from 'react-router-dom';
import { SimpleManagerDashboard } from './SimpleManagerDashboard';
import { StatementAllocation } from './StatementAllocation';
import { Loader, Center } from '@mantine/core';
import { useAuth } from '../../hooks/useAuth';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  if (!user) {
    return (
      <Center h="100vh">
        <div>
          <h2>Authentication Required</h2>
          <p>Please log in to access the Manager Dashboard.</p>
          <p>Use the Login button in the navigation menu.</p>
        </div>
      </Center>
    );
  }

  return <>{children}</>;
};

// Main App Routes
const AppRoutes: React.FC = () => {
  const location = useLocation();

  // Determine which component to render based on the current path
  if (location.pathname === '/manager-dashboard/statements') {
    return (
      <ProtectedRoute>
        <StatementAllocation />
      </ProtectedRoute>
    );
  }

  // Default to dashboard for /manager-dashboard
  return (
    <ProtectedRoute>
      <SimpleManagerDashboard />
    </ProtectedRoute>
  );
};

// Manager Dashboard Wrapper Component
const ManagerDashboardWrapper: React.FC = () => {
  return <AppRoutes />;
};

export default ManagerDashboardWrapper;
