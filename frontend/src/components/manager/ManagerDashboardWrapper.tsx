import React from 'react';
import { useLocation, BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <SimpleManagerLogin /> : <Navigate to="/" replace />} />
      <Route path="/" element={
        <ProtectedRoute>
          <SimpleManagerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/statements" element={
        <ProtectedRoute>
          <StatementAllocation />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Manager Dashboard Wrapper Component
const ManagerDashboardWrapper: React.FC = () => {
  return (
    <BrowserRouter>
      <ModalsProvider>
        <ManagerAuthProvider>
          <AppRoutes />
        </ManagerAuthProvider>
      </ModalsProvider>
    </BrowserRouter>
  );
};

export default ManagerDashboardWrapper;
