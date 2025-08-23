import React, { useState } from 'react';
import { Button, Stack, Text, Paper, Select, Alert } from '@mantine/core';
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
          🔐 Sign Up / Login
        </Text>
        
        <Text size="sm" c="dimmed" ta="center">
          Choose your condo and sign up for HOA management access
        </Text>

        <Select
          label="Select Your Condo & User"
          placeholder="Choose your condo and user account..."
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
          {isLoading ? 'Signing up...' : 'Sign Up / Login'}
        </Button>

        <Text size="xs" c="dimmed" ta="center">
          This simulates the signup/login process. After authentication, you'll be prompted to complete your profile with your condo details.
        </Text>
      </Stack>
    </Paper>
  );
};
