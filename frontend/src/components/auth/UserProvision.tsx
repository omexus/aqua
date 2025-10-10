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
  Divider,
  NumberInput,
  Modal
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { 
  provisionUser, 
  getAvailableCondos, 
  createCondo,
  UserProvisionRequest, 
  CondoOption,
  CondoCreateRequest
} from '../../helpers/Api';
import { useAuth } from '../../hooks/useAuth';

interface UserProvisionProps {
  onSuccess?: (userData: any) => void;
  onCancel?: () => void;
}

export const UserProvision: React.FC<UserProvisionProps> = ({ onSuccess, onCancel }) => {
  const { user, forceCheckUserProvisioning } = useAuth();
  const [condos, setCondos] = useState<CondoOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [opened, handlers] = useDisclosure(false);
  const [showNewCondoModal, setShowNewCondoModal] = useState(false);

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
      unit: (value: string) => {
        // Only validate unit if role is Tenant
        if (form.values.role === 'Tenant' && !value) {
          return 'Please enter your unit number';
        }
        return null;
      },
      role: (value: string) => !value ? 'Please select your role' : null,
    },
  });

  const newCondoForm = useForm({
    initialValues: {
      name: '',
      prefix: '',
      numberOfUnits: 1
    },
    validate: {
      name: (value: string) => value.trim().length < 2 ? 'Condo name must be at least 2 characters' : null,
      prefix: (value: string) => value.trim().length < 1 ? 'Prefix is required' : null,
      numberOfUnits: (value: number) => value < 1 ? 'Must have at least 1 unit' : null,
    },
  });

  useEffect(() => {
    loadCondos();
  }, []);

  // Update validation when role changes
  useEffect(() => {
    form.validateField('unit');
  }, [form.values.role]);

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

  const handleCreateCondo = async (values: typeof newCondoForm.values) => {
    setIsLoading(true);
    setError(null);

    try {
      const request: CondoCreateRequest = {
        name: values.name,
        prefix: values.prefix,
        numberOfUnits: values.numberOfUnits
      };

      const [success, response] = await createCondo(request);

      if (success && response?.condo) {
        // Add the new condo to the list and select it
        setCondos(prev => [...prev, response.condo!]);
        form.setFieldValue('condoId', response.condo.id);
        setShowNewCondoModal(false);
        newCondoForm.reset();
      } else {
        setError(response?.error || 'Failed to create condo');
      }
    } catch (err) {
      console.error('Error creating condo:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    // Get user email from various possible locations in the user data structure
    const userEmail = user?.userData?.email || 
                     user?.userData?.user?.email || 
                     user?.userData?.name;
    
    if (!userEmail) {
      setError('No authenticated user found');
      return;
    }

    setIsLoading(true);
    setError(null);
    handlers.open();

    try {
      const request: UserProvisionRequest = {
        googleUserId: userEmail as string, // Using email as Google User ID for now
        name: values.name,
        email: values.email,
        condoId: values.condoId,
        unit: values.unit,
        role: values.role
      };

      const [success, response] = await provisionUser(request);

      if (success && response) {
        console.log('User provisioned successfully:', response);
        
        // Update the user provisioning status
        await forceCheckUserProvisioning();
        
        if (onSuccess) {
          onSuccess(response.user);
        }
        // Close the modal only on success
        handlers.close();
      } else {
        setError(response?.error || 'Failed to provision user');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error provisioning user:', err);
      setError('An unexpected error occurred');
      setIsLoading(false);
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

  const isTenantRole = form.values.role === 'Tenant';

  return (
    <>
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

              <Group gap="xs" align="end">
                <Select
                  label="Select Your Condo"
                  placeholder="Choose your condo building..."
                  data={condoOptions}
                  {...form.getInputProps('condoId')}
                  required
                  searchable
                  style={{ flex: 1 }}
                />
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewCondoModal(true)}
                  style={{ marginBottom: 4 }}
                >
                  Add New
                </Button>
              </Group>

              {isTenantRole && (
                <TextInput
                  label="Unit Number"
                  placeholder="e.g., 101, A1, 2B"
                  {...form.getInputProps('unit')}
                  required
                />
              )}

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
                  <Button variant="default" onClick={() => {
                    console.log('Cancel button clicked in UserProvision component');
                    onCancel();
                  }}>
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

      {/* New Condo Modal */}
      <Modal
        opened={showNewCondoModal}
        onClose={() => setShowNewCondoModal(false)}
        title="Add New Condo"
        size="md"
      >
        <form onSubmit={newCondoForm.onSubmit(handleCreateCondo)}>
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              Create a new condo building and specify the number of units for management purposes.
            </Text>

            <TextInput
              label="Condo Name"
              placeholder="e.g., Sunset Towers, Ocean View Condos"
              {...newCondoForm.getInputProps('name')}
              required
            />

            <TextInput
              label="Prefix"
              placeholder="e.g., ST, OV, AQUA"
              description="Short identifier for the condo (used in billing references)"
              {...newCondoForm.getInputProps('prefix')}
              required
            />

            <NumberInput
              label="Number of Units"
              placeholder="Enter total number of units"
              min={1}
              max={1000}
              {...newCondoForm.getInputProps('numberOfUnits')}
              required
            />

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={() => setShowNewCondoModal(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={isLoading}>
                Create Condo
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
};

export default UserProvision;
