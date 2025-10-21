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
  Divider
} from '@mantine/core';
import {
  IconBuilding,
  IconUsers,
  IconReceipt,
  IconTrendingUp,
  IconPlus,
  IconSettings
} from '@tabler/icons-react';
import { useManagerAuth } from '../../contexts/ManagerAuthContext';
import { ManagerManagement } from './ManagerManagement';

interface DashboardStats {
  totalCondos: number;
  totalUnits: number;
  totalStatements: number;
  totalAllocations: number;
}

export const SimpleManagerDashboard: React.FC = () => {
  const { user, isAuthenticated, hasCondos, requiresCondoAssignment } = useManagerAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [showManagerManagement, setShowManagerManagement] = useState(false);

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
      <Container size="md" py="xl">
        <Alert color="blue" title="Authentication Required">
          Please log in to access the manager dashboard.
        </Alert>
      </Container>
    );
  }

  if (requiresCondoAssignment) {
    return (
      <Container size="md" py="xl">
        <Paper p="xl" radius="md" withBorder>
          <Title order={2} mb="md">
            No Condos Assigned
          </Title>
          <Text color="dimmed" mb="lg">
            You don't have any condos assigned to your account. Please contact your administrator to get condo access.
          </Text>
          <Group>
            <Button leftSection={<IconPlus size={16} />}>
              Request Condo Assignment
            </Button>
            <Button 
              variant="outline" 
              leftSection={<IconSettings size={16} />}
              onClick={() => setShowManagerManagement(true)}
            >
              Manage Managers
            </Button>
          </Group>
        </Paper>
      </Container>
    );
  }

  if (showManagerManagement) {
    return <ManagerManagement onClose={() => setShowManagerManagement(false)} />;
  }

  return (
    <Container size="xl" py="xl">
      {/* Header */}
      <Stack gap="lg" mb="xl">
        <div>
          <Title order={1}>Manager Dashboard</Title>
          <Text color="dimmed" size="lg">
            Welcome back, {user?.manager.name}
          </Text>
        </div>

        {/* Active Condo Info */}
        {user?.activeCondo && (
          <Paper p="md" radius="md" withBorder>
            <Group>
              <IconBuilding size={24} color="var(--mantine-color-blue-6)" />
              <div>
                <Text fw={500} size="lg">
                  {user.activeCondo.name}
                </Text>
                <Text size="sm" color="dimmed">
                  Prefix: {user.activeCondo.prefix}
                </Text>
              </div>
              <Badge color="green" variant="light">
                Active
              </Badge>
            </Group>
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
              onClick={() => {/* TODO: Navigate to statements */}}
            >
              Manage Statements
            </Button>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Button
              variant="outline"
              fullWidth
              leftSection={<IconUsers size={16} />}
              onClick={() => {/* TODO: Navigate to units */}}
            >
              Manage Units
            </Button>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Button
              variant="outline"
              fullWidth
              leftSection={<IconTrendingUp size={16} />}
              onClick={() => {/* TODO: Navigate to allocations */}}
            >
              View Allocations
            </Button>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Button
              variant="outline"
              fullWidth
              leftSection={<IconBuilding size={16} />}
              onClick={() => {/* TODO: Navigate to reports */}}
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
    </Container>
  );
};
