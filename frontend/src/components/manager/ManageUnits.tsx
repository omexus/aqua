import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  NumberInput,
  Button,
  Group,
  Stack,
  Card,
  Alert,
  Loader,
  Grid,
  ActionIcon,
  Divider,
  Badge
} from '@mantine/core';
import {
  IconPlus,
  IconTrash,
  IconBuilding,
  IconUsers,
  IconCheck,
  IconAlertCircle
} from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';
import { createAuthenticatedAxios, getTenantId } from '../../helpers/Api';

interface UnitFormData {
  unit: string;
  name: string;
  email: string;
  squareFootage?: number;
}

interface CreateUnitsRequest {
  prefix: string;
  units: UnitFormData[];
}

export const ManageUnits: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [units, setUnits] = useState<UnitFormData[]>([]);
  const [prefix, setPrefix] = useState('');
  const [unitCount, setUnitCount] = useState(1);

  useEffect(() => {
    if (user?.userData?.activeCondo) {
      setPrefix((user.userData as any).activeCondo.prefix);
    }
  }, [user]);

  const addUnits = () => {
    if (unitCount > 10) {
      setError('Cannot add more than 10 units at once');
      return;
    }

    const newUnits: UnitFormData[] = [];
    for (let i = 1; i <= unitCount; i++) {
      newUnits.push({
        unit: i.toString().padStart(2, '0'), // 01, 02, 03, etc.
        name: '',
        email: '',
        squareFootage: undefined
      });
    }
    setUnits(newUnits);
    setError(null);
  };

  const updateUnit = (index: number, field: keyof UnitFormData, value: string | number) => {
    const updatedUnits = [...units];
    updatedUnits[index] = { ...updatedUnits[index], [field]: value };
    setUnits(updatedUnits);
  };

  const removeUnit = (index: number) => {
    const updatedUnits = units.filter((_, i) => i !== index);
    setUnits(updatedUnits);
  };

  const handleCreateUnits = async () => {
    if (!user?.userData?.activeCondo) {
      setError('No active condo selected');
      return;
    }

    if (units.length === 0) {
      setError('Please add at least one unit');
      return;
    }

    // Validate required fields
    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      if (!unit.name || !unit.email) {
        setError(`Unit ${unit.unit}: Name and email are required`);
        return;
      }
      if (!/^\S+@\S+$/.test(unit.email)) {
        setError(`Unit ${unit.unit}: Invalid email format`);
        return;
      }
    }

    setCreating(true);
    setError(null);
    setSuccess(false);

    try {
      const tenantId = getTenantId();
      const authenticatedAxios = createAuthenticatedAxios();
      
      const request: CreateUnitsRequest = {
        prefix: prefix,
        units: units
      };

      console.log('🚀 Creating units:', request);

      const response = await authenticatedAxios.post(
        `http://localhost:5001/api/units/${tenantId}/bulk`,
        request
      );

      if (response.data) {
        setSuccess(true);
        setUnits([]);
        setUnitCount(1);
        console.log('✅ Units created successfully:', response.data);
      }
    } catch (err: any) {
      console.error('❌ Error creating units:', err);
      setError(err.response?.data?.error || 'Failed to create units');
    } finally {
      setCreating(false);
    }
  };

  if (!user) {
    return (
      <Container size="md" py="xl">
        <Alert color="blue" title="Authentication Required">
          Please log in to manage units.
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Paper p="md" radius="md" withBorder>
          <Group>
            <IconBuilding size={24} color="var(--mantine-color-blue-6)" />
            <div>
              <Title order={2}>Manage Units</Title>
              <Text color="dimmed">
                Add units to {(user?.userData as any)?.activeCondo?.name || 'your condo'}
              </Text>
            </div>
          </Group>
        </Paper>

        {/* Success Message */}
        {success && (
          <Alert color="green" icon={<IconCheck size={16} />}>
            Units created successfully!
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert color="red" icon={<IconAlertCircle size={16} />}>
            {error}
          </Alert>
        )}

        {/* Add Units Section */}
        <Card withBorder p="md">
          <Stack gap="md">
            <Title order={3}>Add Units</Title>
            
            <Grid>
              <Grid.Col span={6}>
                <NumberInput
                  label="Number of Units"
                  placeholder="Enter number of units to create"
                  min={1}
                  max={10}
                  value={unitCount}
                  onChange={(value) => setUnitCount(Number(value) || 1)}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Prefix"
                  placeholder="e.g., AQUA"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  disabled
                />
              </Grid.Col>
            </Grid>

            <Button
              leftSection={<IconPlus size={16} />}
              onClick={addUnits}
              disabled={unitCount < 1 || unitCount > 10}
            >
              Generate {unitCount} Unit{unitCount > 1 ? 's' : ''}
            </Button>
          </Stack>
        </Card>

        {/* Units Form */}
        {units.length > 0 && (
          <Card withBorder p="md">
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={3}>Unit Details</Title>
                <Badge color="blue" variant="light">
                  {units.length} Unit{units.length > 1 ? 's' : ''}
                </Badge>
              </Group>

              <Divider />

              {units.map((unit, index) => (
                <Card key={index} withBorder p="md" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Text fw={500}>Unit {unit.unit}</Text>
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => removeUnit(index)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>

                    <Grid>
                      <Grid.Col span={6}>
                        <TextInput
                          label="Unit Number"
                          value={unit.unit}
                          disabled
                          size="sm"
                        />
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <NumberInput
                          label="Square Footage"
                          placeholder="e.g., 1200"
                          value={unit.squareFootage}
                          onChange={(value) => updateUnit(index, 'squareFootage', Number(value) || 0)}
                          size="sm"
                        />
                      </Grid.Col>
                      <Grid.Col span={12}>
                        <TextInput
                          label="Owner Name"
                          placeholder="Enter owner name"
                          value={unit.name}
                          onChange={(e) => updateUnit(index, 'name', e.target.value)}
                          required
                          size="sm"
                        />
                      </Grid.Col>
                      <Grid.Col span={12}>
                        <TextInput
                          label="Email"
                          placeholder="Enter owner email"
                          value={unit.email}
                          onChange={(e) => updateUnit(index, 'email', e.target.value)}
                          required
                          size="sm"
                        />
                      </Grid.Col>
                    </Grid>
                  </Stack>
                </Card>
              ))}

              <Group justify="flex-end" mt="md">
                <Button
                  variant="outline"
                  onClick={() => {
                    setUnits([]);
                    setError(null);
                    setSuccess(false);
                  }}
                >
                  Clear All
                </Button>
                <Button
                  leftSection={<IconUsers size={16} />}
                  onClick={handleCreateUnits}
                  loading={creating}
                  disabled={units.length === 0}
                >
                  Create {units.length} Unit{units.length > 1 ? 's' : ''}
                </Button>
              </Group>
            </Stack>
          </Card>
        )}
      </Stack>
    </Container>
  );
};
