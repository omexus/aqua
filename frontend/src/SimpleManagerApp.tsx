import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import { ModalsProvider } from '@mantine/modals';
import { ManagerAuthProvider, useManagerAuth } from './contexts/ManagerAuthContext';
import { SimpleManagerDashboard } from './components/manager/SimpleManagerDashboard';
import { SimpleManagerLogin } from './components/manager/SimpleManagerLogin';
import { CondoAssignmentPrompt } from './components/manager/CondoAssignmentPrompt';
import { StatementAllocation } from './components/manager/StatementAllocation';
import { Container, Loader, Center } from '@mantine/core';

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
    return <Navigate to="/login" replace />;
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

// Main Manager App Component
const SimpleManagerApp: React.FC = () => {
  return (
    <MantineProvider>
      <ModalsProvider>
        <ManagerAuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ManagerAuthProvider>
      </ModalsProvider>
    </MantineProvider>
  );
};

export default SimpleManagerApp;
