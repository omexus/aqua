import React, { useState } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  Button,
  Stack,
  Group,
  Divider,
  Alert,
  Loader
} from '@mantine/core';
import {
  IconBuilding,
  IconMail,
  IconLock,
  IconBrandGoogle
} from '@tabler/icons-react';
import { useManagerAuth } from '../../contexts/ManagerAuthContext';

export const SimpleManagerLogin: React.FC = () => {
  const { googleLogin, mockLogin, isLoading, error } = useManagerAuth();
  const [mockCredentials, setMockCredentials] = useState({
    email: 'hl.morales@gmail.com',
    password: 'password'
  });

  const handleMockLogin = async () => {
    await mockLogin(mockCredentials);
  };

  return (
    <Container size={420} py="xl">
      <Paper p="xl" radius="md" withBorder>
        {/* Header */}
        <Stack align="center" mb="xl">
          <IconBuilding size={48} color="var(--mantine-color-blue-6)" />
          <Title order={2}>HOA Manager Portal</Title>
          <Text color="dimmed" ta="center">
            Sign in to manage your condominiums
          </Text>
        </Stack>

        {/* Error Display */}
        {error && (
          <Alert color="red" mb="md">
            {error}
          </Alert>
        )}

        {/* Google Login */}
        <Button
          variant="outline"
          fullWidth
          leftSection={<IconBrandGoogle size={16} />}
          onClick={googleLogin}
          disabled={isLoading}
          mb="md"
        >
          {isLoading ? 'Signing in...' : 'Sign in with Google'}
        </Button>

        <Divider label="OR" labelPosition="center" my="md" />

        {/* Mock Login for Development */}
        <Stack gap="md">
          <Title order={4}>Development Login</Title>
          <Text size="sm" color="dimmed">
            Use mock credentials for testing
          </Text>

          <TextInput
            label="Email"
            placeholder="Enter your email"
            leftSection={<IconMail size={16} />}
            value={mockCredentials.email}
            onChange={(e) => setMockCredentials({
              ...mockCredentials,
              email: e.target.value
            })}
            disabled={isLoading}
          />

          <TextInput
            label="Password"
            type="password"
            placeholder="Enter your password"
            leftSection={<IconLock size={16} />}
            value={mockCredentials.password}
            onChange={(e) => setMockCredentials({
              ...mockCredentials,
              password: e.target.value
            })}
            disabled={isLoading}
          />

          <Button
            fullWidth
            onClick={handleMockLogin}
            disabled={isLoading}
            leftSection={isLoading ? <Loader size="xs" /> : undefined}
          >
            {isLoading ? 'Signing in...' : 'Sign in with Mock Account'}
          </Button>
        </Stack>

        {/* Features List */}
        <Stack gap="sm" mt="xl">
          <Title order={5}>Manager Features</Title>
          <Text size="sm" color="dimmed">
            • Manage multiple condominiums
          </Text>
          <Text size="sm" color="dimmed">
            • Allocate shared utility costs
          </Text>
          <Text size="sm" color="dimmed">
            • Track unit payments
          </Text>
          <Text size="sm" color="dimmed">
            • Generate expense reports
          </Text>
        </Stack>
      </Paper>
    </Container>
  );
};
