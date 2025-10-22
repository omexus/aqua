import React from 'react';
import { useLocation } from 'react-router-dom';
import { ModalsProvider } from '@mantine/modals';
import { ManagerAuthProvider, useManagerAuth } from '../../contexts/ManagerAuthContext';
import { SimpleManagerDashboard } from './SimpleManagerDashboard';
import { SimpleManagerLogin } from './SimpleManagerLogin';
import { CondoAssignmentPrompt } from './CondoAssignmentPrompt';
import { StatementAllocation } from './StatementAllocation';
import { Loader, Center } from '@mantine/core';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, requiresCondoAssignment } = useManagerAuth();

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/manager-dashboard/login" replace />;
  }

  if (requiresCondoAssignment) {
    return <CondoAssignmentPrompt />;
  }

  return <>{children}</>;
};

// Main App Routes
const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useManagerAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  // Determine which component to render based on the current path
  if (location.pathname === '/manager-dashboard/login') {
    return !isAuthenticated ? <SimpleManagerLogin /> : <SimpleManagerDashboard />;
  }

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
  return (
    <ModalsProvider>
      <ManagerAuthProvider>
        <AppRoutes />
      </ManagerAuthProvider>
    </ModalsProvider>
  );
};

export default ManagerDashboardWrapper;
