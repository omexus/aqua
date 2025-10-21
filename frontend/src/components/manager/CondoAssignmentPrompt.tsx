import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { useManagerAuth } from '../../contexts/ManagerAuthContext';

export const CondoAssignmentPrompt: React.FC = () => {
  const { user, logout } = useManagerAuth();

  const handleRequestAssignment = () => {
    // TODO: Implement condo assignment request
    console.log('Requesting condo assignment for manager:', user?.manager.id);
  };

  const handleContactSupport = () => {
    // TODO: Implement support contact
    console.log('Contacting support');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        p: 2
      }}
    >
      <Card sx={{ maxWidth: 600, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <BusinessIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              No Condos Assigned
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You don't have any condominiums assigned to your account yet.
            </Typography>
          </Box>

          {/* Manager Info */}
          {user && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Manager:</strong> {user.manager.name} ({user.manager.email})
              </Typography>
            </Alert>
          )}

          {/* What's Next */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              What happens next?
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Request Condo Assignment"
                  secondary="Contact your administrator to get access to condominiums"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PhoneIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Wait for Approval"
                  secondary="Your administrator will assign condos to your account"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <BusinessIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Start Managing"
                  secondary="Once assigned, you can manage statements and allocations"
                />
              </ListItem>
            </List>
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleRequestAssignment}
              startIcon={<EmailIcon />}
            >
              Request Condo Assignment
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={handleContactSupport}
              startIcon={<HelpIcon />}
            >
              Contact Support
            </Button>
            <Button
              variant="text"
              size="large"
              onClick={logout}
            >
              Sign Out
            </Button>
          </Box>

          {/* Support Info */}
          <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Need help?</strong> Contact your system administrator or support team to get 
              condominiums assigned to your manager account. You'll need to provide your manager 
              email address and the condominiums you should have access to.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
