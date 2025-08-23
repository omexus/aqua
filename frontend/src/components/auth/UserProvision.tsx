import React, { useState, useEffect } from 'react';
import { 
  Button, 
  TextInput, 
  Stack, 
  Text, 
  Paper, 
  Select, 
  Alert, 
  LoadingOverlay,
  Group,
  Divider
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { 
  provisionUser, 
  getAvailableCondos, 
  UserProvisionRequest, 
  CondoOption 
} from '../../helpers/Api';
import { useAuth } from '../../hooks/useAuth';

interface UserProvisionProps {
  onSuccess?: (userData: any) => void;
  onCancel?: () => void;
}

export const UserProvision: React.FC<UserProvisionProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [condos, setCondos] = useState<CondoOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [opened, handlers] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      name: (user?.userData?.name as string) || '',
      email: (user?.userData?.email as string) || '',
      condoId: '',
      unit: '',
      role: 'Owner'
    },
    validate: {
      name: (value: string) => value.trim().length < 2 ? 'Name must be at least 2 characters' : null,
      email: (value: string) => /^\S+@\S+$/.test(value) ? null : 'Invalid email address',
      condoId: (value: string) => !value ? 'Please select a condo' : null,
      unit: (value: string) => !value ? 'Please enter your unit number' : null,
      role: (value: string) => !value ? 'Please select your role' : null,
    },
  });

  useEffect(() => {
    loadCondos();
  }, []);

  const loadCondos = async () => {
    try {
      const [success, data] = await getAvailableCondos();
      if (success && data) {
        setCondos(data);
      } else {
        setError('Failed to load available condos');
      }
    } catch (err) {
      console.error('Error loading condos:', err);
      setError('Failed to load available condos');
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    if (!user?.userData?.email) {
      setError('No authenticated user found');
      return;
    }

    setIsLoading(true);
    setError(null);
    handlers.open();

    try {
      const request: UserProvisionRequest = {
        googleUserId: (user.userData.email as string), // Using email as Google User ID for now
        name: values.name,
        email: values.email,
        condoId: values.condoId,
        unit: values.unit,
        role: values.role
      };

      const [success, response] = await provisionUser(request);

      if (success && response) {
        console.log('User provisioned successfully:', response);
        if (onSuccess) {
          onSuccess(response.user);
        }
      } else {
        setError(response?.error || 'Failed to provision user');
      }
    } catch (err) {
      console.error('Error provisioning user:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
      handlers.close();
    }
  };

  const condoOptions = condos.map(condo => ({
    value: condo.id,
    label: `${condo.name} (${condo.prefix})`
  }));

  const roleOptions = [
    { value: 'Owner', label: 'Owner' },
    { value: 'Tenant', label: 'Tenant' },
    { value: 'Property Manager', label: 'Property Manager' },
    { value: 'Board Member', label: 'Board Member' }
  ];

  return (
    <Paper p="md" withBorder style={{ maxWidth: 500, margin: '0 auto' }}>
      <LoadingOverlay
        visible={opened}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
      />
      
      <Stack gap="md">
        <Text size="xl" fw={700} ta="center">
          🏠 Complete Your Profile
        </Text>
        
        <Text size="sm" c="dimmed" ta="center">
          Please provide your condo information to complete your account setup
        </Text>

        {user?.userData && (
          <Alert color="blue" variant="light">
            <Text size="sm">
              <strong>Authenticated as:</strong> {(user.userData.name as string)} ({(user.userData.email as string)})
            </Text>
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Full Name"
              placeholder="Enter your full name"
              {...form.getInputProps('name')}
              required
            />

            <TextInput
              label="Email Address"
              placeholder="your.email@example.com"
              {...form.getInputProps('email')}
              required
            />

            <Select
              label="Select Your Condo"
              placeholder="Choose your condo building..."
              data={condoOptions}
              {...form.getInputProps('condoId')}
              required
              searchable
            />

            <TextInput
              label="Unit Number"
              placeholder="e.g., 101, A1, 2B"
              {...form.getInputProps('unit')}
              required
            />

            <Select
              label="Your Role"
              placeholder="Select your role..."
              data={roleOptions}
              {...form.getInputProps('role')}
              required
            />

            {error && (
              <Alert color="red" variant="light">
                {error}
              </Alert>
            )}

            <Divider />

            <Group justify="space-between">
              {onCancel && (
                <Button variant="default" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" loading={isLoading}>
                Complete Setup
              </Button>
            </Group>
          </Stack>
        </form>

        <Text size="xs" c="dimmed" ta="center">
          This information will be used to associate your account with your condo building
          and provide you with access to relevant billing and management features.
        </Text>
      </Stack>
    </Paper>
  );
};

export default UserProvision;
