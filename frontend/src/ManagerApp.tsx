import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import { ModalsProvider } from '@mantine/modals';
import { ManagerAuthProvider, useManagerAuth } from './contexts/ManagerAuthContext';
import { ManagerDashboard } from './components/manager/ManagerDashboard';
import { StatementAllocation } from './components/manager/StatementAllocation';
import { ManagerLogin } from './components/manager/ManagerLogin';
import { CondoAssignmentPrompt } from './components/manager/CondoAssignmentPrompt';
import { Box, CircularProgress, Alert } from '@mui/material';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, requiresCondoAssignment } = useManagerAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <ManagerLogin /> : <Navigate to="/" replace />} />
      <Route path="/" element={
        <ProtectedRoute>
          <ManagerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/statements" element={
        <ProtectedRoute>
          <StatementAllocation />
        </ProtectedRoute>
      } />
      <Route path="/allocations" element={
        <ProtectedRoute>
          <StatementAllocation />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Main Manager App Component
const ManagerApp: React.FC = () => {
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

export default ManagerApp;
