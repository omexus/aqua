import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  Grid
} from '@mui/material';
import {
  Google as GoogleIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useManagerAuth } from '../../contexts/ManagerAuthContext';

export const ManagerLogin: React.FC = () => {
  const { googleLogin, mockLogin, isLoading, error } = useManagerAuth();
  const [mockCredentials, setMockCredentials] = useState({
    email: 'manager@aqua.com',
    password: 'password'
  });

  const handleMockLogin = async () => {
    await mockLogin(mockCredentials);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2
      }}
    >
      <Card sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <BusinessIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              HOA Manager Portal
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to manage your condominiums
            </Typography>
          </Box>

          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Google Login */}
          <Button
            variant="outlined"
            fullWidth
            size="large"
            startIcon={<GoogleIcon />}
            onClick={googleLogin}
            disabled={isLoading}
            sx={{ mb: 3 }}
          >
            {isLoading ? 'Signing in...' : 'Sign in with Google'}
          </Button>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          {/* Mock Login for Development */}
          <Typography variant="h6" gutterBottom>
            Development Login
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Use mock credentials for testing
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={mockCredentials.email}
                onChange={(e) => setMockCredentials({
                  ...mockCredentials,
                  email: e.target.value
                })}
                disabled={isLoading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={mockCredentials.password}
                onChange={(e) => setMockCredentials({
                  ...mockCredentials,
                  password: e.target.value
                })}
                disabled={isLoading}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleMockLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  'Sign in with Mock Account'
                )}
              </Button>
            </Grid>
          </Grid>

          {/* Features List */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Manager Features
            </Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <Typography component="li" variant="body2" color="text.secondary">
                Manage multiple condominiums
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                Allocate shared utility costs
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                Track unit payments
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                Generate expense reports
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
