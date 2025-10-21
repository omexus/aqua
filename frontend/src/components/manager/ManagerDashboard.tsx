import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Divider
} from '@mui/material';
import {
  Business as BusinessIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useManagerAuth } from '../../contexts/ManagerAuthContext';
import { CondoSelector } from './CondoSelector';

interface DashboardStats {
  totalCondos: number;
  totalUnits: number;
  totalStatements: number;
  totalAllocations: number;
}

export const ManagerDashboard: React.FC = () => {
  const { user, isAuthenticated, hasCondos, requiresCondoAssignment } = useManagerAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.activeCondo) {
      loadDashboardStats();
    }
  }, [user?.activeCondo]);

  const loadDashboardStats = async () => {
    if (!user?.activeCondo) return;

    setLoading(true);
    try {
      // TODO: Implement actual API calls to get dashboard stats
      // For now, using mock data
      setStats({
        totalCondos: user.condos.length,
        totalUnits: 10, // Mock data
        totalStatements: 5, // Mock data
        totalAllocations: 25 // Mock data
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Please log in to access the manager dashboard.
        </Alert>
      </Box>
    );
  }

  if (requiresCondoAssignment) {
    return (
      <Box sx={{ p: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              No Condos Assigned
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              You don't have any condos assigned to your account. Please contact your administrator to get condo access.
            </Typography>
            <Button variant="contained" color="primary">
              Request Condo Assignment
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Manager Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {user?.manager.name}
          </Typography>
        </Box>
        <CondoSelector />
      </Box>

      {/* Active Condo Info */}
      {user?.activeCondo && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <BusinessIcon color="primary" />
              <Box>
                <Typography variant="h6">
                  {user.activeCondo.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Prefix: {user.activeCondo.prefix}
                </Typography>
              </Box>
              <Chip label="Active" color="success" size="small" />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Stats */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <BusinessIcon color="primary" />
                  <Box>
                    <Typography variant="h4">
                      {stats?.totalCondos || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Managed Condos
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PeopleIcon color="secondary" />
                  <Box>
                    <Typography variant="h4">
                      {stats?.totalUnits || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Units
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ReceiptIcon color="success" />
                  <Box>
                    <Typography variant="h4">
                      {stats?.totalStatements || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Statements
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TrendingUpIcon color="warning" />
                  <Box>
                    <Typography variant="h4">
                      {stats?.totalAllocations || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Allocations
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Quick Actions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Quick Actions
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              startIcon={<ReceiptIcon />}
              onClick={() => {/* TODO: Navigate to statements */}}
            >
              Manage Statements
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              startIcon={<PeopleIcon />}
              onClick={() => {/* TODO: Navigate to units */}}
            >
              Manage Units
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              startIcon={<TrendingUpIcon />}
              onClick={() => {/* TODO: Navigate to allocations */}}
            >
              View Allocations
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              startIcon={<BusinessIcon />}
              onClick={() => {/* TODO: Navigate to reports */}}
            >
              Generate Reports
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};
