import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  Grid,
  Card,
  Group,
  Button,
  Alert,
  Loader,
  Badge,
  Stack,
  Divider,
  Modal,
  TextInput
} from '@mantine/core';
import {
  IconBuilding,
  IconUsers,
  IconReceipt,
  IconTrendingUp,
  IconPlus,
  IconSettings,
  IconAlertCircle
} from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';
import { ManagerManagement } from './ManagerManagement';
// Removed React Router dependency

interface DashboardStats {
  totalCondos: number;
  totalUnits: number;
  totalStatements: number;
  totalAllocations: number;
}

export const SimpleManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [showManagerManagement, setShowManagerManagement] = useState(false);
  const [showCondoSwitch, setShowCondoSwitch] = useState(false);
  const [showCreateCondo, setShowCreateCondo] = useState(false);
  const [createCondoForm, setCreateCondoForm] = useState({
    name: '',
    prefix: ''
  });
  const [creatingCondo, setCreatingCondo] = useState(false);
  // Removed React Router navigation

  useEffect(() => {
    // TODO: Load dashboard stats when manager-specific data is available
    // For now, just load basic stats
    loadDashboardStats();
  }, [user]);

  const loadDashboardStats = async () => {
    setLoading(true);
    try {
      // Get condo data from user context
      const condos = (user?.userData as any)?.condos || [];
      const activeCondo = (user?.userData as any)?.activeCondo;
      
      console.log('🔍 loadDashboardStats - user:', user);
      console.log('🔍 loadDashboardStats - condos:', condos);
      console.log('🔍 loadDashboardStats - activeCondo:', activeCondo);
      
      setStats({
        totalCondos: condos.length,
        totalUnits: 0, // TODO: Get from API
        totalStatements: 0, // TODO: Get from API
        totalAllocations: 0 // TODO: Get from API
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // TODO: Implement condo switching logic with unified auth

  const handleCreateCondo = async () => {
    if (!createCondoForm.name || !createCondoForm.prefix) {
      alert('Please fill in at least the condo name and prefix');
      return;
    }

    setCreatingCondo(true);
    try {
      const response = await fetch('http://localhost:5001/api/managerauth/create-condo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createCondoForm)
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update the user context with new token and condos
        if (data.token && data.condos) {
          const updatedUser = {
            ...user,
            token: data.token,
            condos: data.condos,
            activeCondo: data.condos.find((c: any) => c.isDefault) || data.condos[0]
          };
          localStorage.setItem('managerUser', JSON.stringify(updatedUser));
          window.location.reload(); // Simple refresh to update context
        }
        setShowCreateCondo(false);
        // Reset form
        setCreateCondoForm({
          name: '',
          prefix: ''
        });
      } else {
        console.error('Failed to create condo');
        alert('Failed to create condo. Please try again.');
      }
    } catch (error) {
      console.error('Error creating condo:', error);
      alert('Error creating condo. Please try again.');
    } finally {
      setCreatingCondo(false);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'statements':
        window.location.href = '/manager-dashboard/statements';
        break;
      case 'units':
        window.location.href = '/manager-dashboard/units';
        break;
      case 'allocations':
        // TODO: Navigate to allocations page when created
        console.log('Navigate to allocations');
        break;
      case 'reports':
        // TODO: Navigate to reports page when created
        console.log('Navigate to reports');
        break;
      default:
        break;
    }
  };

  if (!user) {
    return (
      <Container size="md" py="xl">
        <Alert color="blue" title="Authentication Required">
          Please log in to access the manager dashboard.
        </Alert>
      </Container>
    );
  }

  // For now, show a simplified manager dashboard
  // TODO: Implement manager-specific logic based on user role

  if (showManagerManagement) {
    return <ManagerManagement onClose={() => setShowManagerManagement(false)} />;
  }

  return (
    <Container size="xl" py="xl">
      {/* Header */}
      <Stack gap="lg" mb="xl">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1}>Manager Dashboard</Title>
            <Text color="dimmed" size="lg">
              Welcome back, {(user?.userData as any)?.email || 'Manager'}
            </Text>
          </div>
        </Group>

        {/* Manager Info */}
        <Paper p="md" radius="md" withBorder>
          <Group justify="space-between">
            <Group>
              <IconBuilding size={24} color="var(--mantine-color-blue-6)" />
              <div>
                <Text fw={500} size="lg">
                  Manager Dashboard
                </Text>
                <Text size="sm" color="dimmed">
                  Access level: Manager
                </Text>
              </div>
              <Badge color="blue" variant="light">
                Manager
              </Badge>
            </Group>
            <Group gap="xs">
              <Button
                variant="outline"
                size="sm"
                leftSection={<IconPlus size={16} />}
                onClick={() => setShowCreateCondo(true)}
              >
                Create Condo
              </Button>
            </Group>
          </Group>
        </Paper>

        {/* Active Condo Info */}
        {(user?.userData as any)?.activeCondo && (
          <Paper p="md" radius="md" withBorder>
            <Group>
              <IconBuilding size={20} color="var(--mantine-color-green-6)" />
              <div>
                <Text fw={500} size="md">
                  Active Condo: {(user?.userData as any)?.activeCondo?.name}
                </Text>
                <Text size="sm" color="dimmed">
                  Prefix: {(user?.userData as any)?.activeCondo?.prefix}
                </Text>
              </div>
              <Badge color="green" variant="light">
                Active
              </Badge>
            </Group>
          </Paper>
        )}

        {/* All Condos */}
        {(user?.userData as any)?.condos && (user?.userData as any)?.condos.length > 0 && (
          <Paper p="md" radius="md" withBorder>
            <Text fw={500} size="md" mb="sm">
              Managed Condos ({(user?.userData as any)?.condos.length})
            </Text>
            <Stack gap="xs">
              {(user?.userData as any)?.condos.map((condo: any, index: number) => (
                <Group key={condo.id} justify="space-between" p="xs" style={{ backgroundColor: condo.id === (user?.userData as any)?.activeCondo?.id ? 'var(--mantine-color-blue-0)' : 'transparent' }}>
                  <Group>
                    <IconBuilding size={16} color="var(--mantine-color-blue-6)" />
                    <div>
                      <Text size="sm" fw={500}>{condo.name}</Text>
                      <Text size="xs" color="dimmed">Prefix: {condo.prefix}</Text>
                    </div>
                  </Group>
                  {condo.id === (user?.userData as any)?.activeCondo?.id && (
                    <Badge color="green" variant="light" size="sm">
                      Active
                    </Badge>
                  )}
                </Group>
              ))}
            </Stack>
          </Paper>
        )}
      </Stack>

      {/* Dashboard Stats */}
      {loading ? (
        <Group justify="center" py="xl">
          <Loader size="lg" />
        </Group>
      ) : (
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder radius="md">
              <Group>
                <IconBuilding size={32} color="var(--mantine-color-blue-6)" />
                <div>
                  <Text size="xl" fw={700}>
                    {stats?.totalCondos || 0}
                  </Text>
                  <Text size="sm" color="dimmed">
                    Managed Condos
                  </Text>
                </div>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder radius="md">
              <Group>
                <IconUsers size={32} color="var(--mantine-color-green-6)" />
                <div>
                  <Text size="xl" fw={700}>
                    {stats?.totalUnits || 0}
                  </Text>
                  <Text size="sm" color="dimmed">
                    Total Units
                  </Text>
                </div>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder radius="md">
              <Group>
                <IconReceipt size={32} color="var(--mantine-color-orange-6)" />
                <div>
                  <Text size="xl" fw={700}>
                    {stats?.totalStatements || 0}
                  </Text>
                  <Text size="sm" color="dimmed">
                    Statements
                  </Text>
                </div>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder radius="md">
              <Group>
                <IconTrendingUp size={32} color="var(--mantine-color-purple-6)" />
                <div>
                  <Text size="xl" fw={700}>
                    {stats?.totalAllocations || 0}
                  </Text>
                  <Text size="sm" color="dimmed">
                    Allocations
                  </Text>
                </div>
              </Group>
            </Card>
          </Grid.Col>
        </Grid>
      )}

      {/* Quick Actions */}
      <Stack gap="md" mt="xl">
        <Title order={3}>Quick Actions</Title>
        <Divider />
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Button
              variant="outline"
              fullWidth
              leftSection={<IconReceipt size={16} />}
              onClick={() => handleQuickAction('statements')}
            >
              Manage Statements
            </Button>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Button
              variant="outline"
              fullWidth
              leftSection={<IconUsers size={16} />}
              onClick={() => handleQuickAction('units')}
            >
              Manage Units
            </Button>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Button
              variant="outline"
              fullWidth
              leftSection={<IconTrendingUp size={16} />}
              onClick={() => handleQuickAction('allocations')}
            >
              View Allocations
            </Button>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Button
              variant="outline"
              fullWidth
              leftSection={<IconBuilding size={16} />}
              onClick={() => handleQuickAction('reports')}
            >
              Generate Reports
            </Button>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Button
              variant="outline"
              fullWidth
              leftSection={<IconSettings size={16} />}
              onClick={() => setShowManagerManagement(true)}
            >
              Manage Managers
            </Button>
          </Grid.Col>
        </Grid>
      </Stack>

      {/* Condo Switch Modal */}
      <Modal
        opened={showCondoSwitch}
        onClose={() => setShowCondoSwitch(false)}
        title="Switch Active Condo"
        size="md"
        centered
      >
        <Stack gap="lg">
          <Text size="sm" color="dimmed">
            Select which condo you want to work with. This will become your active condo:
          </Text>
          
          <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light">
            <Text size="sm">Manager condo management will be implemented with the unified authentication system.</Text>
          </Alert>
        </Stack>
      </Modal>

      {/* Create Condo Modal */}
      <Modal
        opened={showCreateCondo}
        onClose={() => setShowCreateCondo(false)}
        title="Create New Condo"
        size="lg"
        centered
      >
        <Stack gap="lg">
          <Text size="sm" color="dimmed">
            Create a new condo building. Fill in the details below:
          </Text>
          
          <Grid>
            <Grid.Col span={12}>
              <TextInput
                label="Condo Name"
                placeholder="e.g., Sunset Towers"
                value={createCondoForm.name}
                onChange={(e) => setCreateCondoForm({...createCondoForm, name: e.target.value})}
                required
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput
                label="Prefix"
                placeholder="e.g., ST"
                value={createCondoForm.prefix}
                onChange={(e) => setCreateCondoForm({...createCondoForm, prefix: e.target.value})}
                required
              />
            </Grid.Col>
          </Grid>
          
          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={() => setShowCreateCondo(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateCondo}
              loading={creatingCondo}
              leftSection={<IconPlus size={16} />}
            >
              Create Condo
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};
