import React, { useState } from 'react';
import { Button, TextInput, Stack, Text, Paper, Select, Alert } from '@mantine/core';
import { useAuth } from '../../hooks/useAuth';

// Predefined test users for different tenants
const TEST_USERS = [
  { value: 'john.doe@aqua.com', label: 'John Doe (Aqua Condominium - Owner)', tenant: 'Aqua' },
  { value: 'jane.smith@aqua.com', label: 'Jane Smith (Aqua Condominium - Tenant)', tenant: 'Aqua' },
  { value: 'bob.johnson@aqua.com', label: 'Bob Johnson (Aqua Condominium - Owner)', tenant: 'Aqua' },
  { value: 'alice.brown@marina.com', label: 'Alice Brown (Marina Towers - Owner)', tenant: 'Marina' },
  { value: 'charlie.wilson@marina.com', label: 'Charlie Wilson (Marina Towers - Tenant)', tenant: 'Marina' },
  { value: 'diana.garcia@sunset.com', label: 'Diana Garcia (Sunset Heights - Owner)', tenant: 'Sunset' },
];

export const MockLogin: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { mockLogin, error } = useAuth();

  const handleLogin = async () => {
    if (!selectedUser) return;

    console.log('MockLogin component: Starting login for user:', selectedUser);
    setIsLoading(true);
    
    // Use a dummy password for mock login
    const credentials = {
      email: selectedUser,
      password: 'test123'
    };
    
    console.log('MockLogin component: Sending credentials:', credentials);
    const success = await mockLogin(credentials);

    setIsLoading(false);

    if (success) {
      // Login successful - the AuthContext will handle the rest
      console.log('MockLogin component: Login successful for:', selectedUser);
    } else {
      console.log('MockLogin component: Login failed for:', selectedUser);
    }
  };

  const selectedUserInfo = TEST_USERS.find(user => user.value === selectedUser);

  return (
    <Paper p="md" withBorder style={{ maxWidth: 400, margin: '0 auto' }}>
      <Stack gap="md">
        <Text size="xl" fw={700} ta="center">
          🧪 Mock Login
        </Text>
        
        <Text size="sm" c="dimmed" ta="center">
          Test the multi-tenant functionality with different user accounts
        </Text>

        <Select
          label="Select Test User"
          placeholder="Choose a user to login as..."
          data={TEST_USERS}
          value={selectedUser}
          onChange={(value) => {
            console.log('MockLogin: User selected:', value);
            setSelectedUser(value || '');
          }}
          searchable
        />

        {selectedUserInfo && (
          <Alert color="blue" variant="light">
            <Text size="sm">
              <strong>Tenant:</strong> {selectedUserInfo.tenant}
            </Text>
            <Text size="sm">
              <strong>Email:</strong> {selectedUserInfo.value}
            </Text>
          </Alert>
        )}

        {error && (
          <Alert color="red" variant="light">
            {error}
          </Alert>
        )}

        <Button
          onClick={() => {
            console.log('MockLogin: Button clicked!');
            console.log('MockLogin: selectedUser =', selectedUser);
            handleLogin();
          }}
          loading={isLoading}
          disabled={!selectedUser}
          fullWidth
        >
          {isLoading ? 'Logging in...' : 'Login with Mock User'}
        </Button>

        <Text size="xs" c="dimmed" ta="center">
          This is a development feature for testing multi-tenant functionality.
          In production, users would authenticate through Google OAuth.
        </Text>
      </Stack>
    </Paper>
  );
};
