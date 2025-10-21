import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Table,
  Modal,
  TextInput,
  Stack,
  Group,
  Alert,
  Badge,
  ActionIcon,
  Tooltip,
  Divider,
  Card,
  Grid,
  Loader
} from '@mantine/core';
import {
  IconPlus,
  IconTrash,
  IconBuilding,
  IconUser,
  IconMail,
  IconKey,
  IconCheck,
  IconX
} from '@tabler/icons-react';

interface Manager {
  id: string;
  email: string;
  name: string;
  role: string;
  googleUserId?: string;
  createdAt: string;
  updatedAt: string;
}

interface Condo {
  id: string;
  name: string;
  prefix: string;
}

interface ManagerManagementProps {
  onClose: () => void;
}

export const ManagerManagement: React.FC<ManagerManagementProps> = ({ onClose }) => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [condos, setCondos] = useState<Condo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newManager, setNewManager] = useState({
    email: '',
    name: '',
    googleUserId: '',
    role: 'Manager'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [managersResponse, condosResponse] = await Promise.all([
        fetch('http://localhost:5001/api/managers'),
        fetch('http://localhost:5001/api/condos')
      ]);

      if (managersResponse.ok) {
        const managersData = await managersResponse.json();
        setManagers(managersData);
      }

      if (condosResponse.ok) {
        const condosData = await condosResponse.json();
        setCondos(condosData);
      }
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const createManager = async () => {
    if (!newManager.email || !newManager.name) {
      setError('Email and name are required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/managers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newManager),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setNewManager({ email: '', name: '', googleUserId: '', role: 'Manager' });
        await loadData();
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create manager');
      }
    } catch (err) {
      setError('Failed to create manager');
      console.error('Error creating manager:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteManager = async (managerId: string) => {
    if (!confirm('Are you sure you want to delete this manager?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/api/managers/${managerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadData();
        setError(null);
      } else {
        setError('Failed to delete manager');
      }
    } catch (err) {
      setError('Failed to delete manager');
      console.error('Error deleting manager:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && managers.length === 0) {
    return (
      <Container size="xl" py="xl">
        <Group justify="center" py="xl">
          <Loader size="lg" />
        </Group>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={2}>Manager Management</Title>
            <Text color="dimmed">Manage HOA managers and their condo assignments</Text>
          </div>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setShowCreateModal(true)}
          >
            Add Manager
          </Button>
        </Group>

        {/* Error Display */}
        {error && (
          <Alert color="red" onClose={() => setError(null)} withCloseButton>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder radius="md">
              <Group>
                <IconUser size={32} color="var(--mantine-color-blue-6)" />
                <div>
                  <Text size="xl" fw={700}>
                    {managers.length}
                  </Text>
                  <Text size="sm" color="dimmed">
                    Total Managers
                  </Text>
                </div>
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder radius="md">
              <Group>
                <IconBuilding size={32} color="var(--mantine-color-green-6)" />
                <div>
                  <Text size="xl" fw={700}>
                    {condos.length}
                  </Text>
                  <Text size="sm" color="dimmed">
                    Available Condos
                  </Text>
                </div>
              </Group>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Managers Table */}
        <Paper withBorder radius="md">
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Google ID</Table.Th>
                <Table.Th>Created</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {managers.map((manager) => (
                <Table.Tr key={manager.id}>
                  <Table.Td>
                    <Group gap="sm">
                      <IconUser size={16} />
                      <Text fw={500}>{manager.name}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="sm">
                      <IconMail size={16} />
                      <Text>{manager.email}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge color="blue" variant="light">
                      {manager.role}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {manager.googleUserId ? (
                      <Group gap="sm">
                        <IconKey size={16} />
                        <Text size="sm" color="dimmed">
                          {manager.googleUserId.substring(0, 8)}...
                        </Text>
                      </Group>
                    ) : (
                      <Text size="sm" color="dimmed">Not set</Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" color="dimmed">
                      {new Date(manager.createdAt).toLocaleDateString()}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Tooltip label="Delete Manager">
                        <ActionIcon
                          color="red"
                          variant="light"
                          onClick={() => deleteManager(manager.id)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>

        {/* Create Manager Modal */}
        <Modal
          opened={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Manager"
          size="md"
        >
          <Stack gap="md">
            <TextInput
              label="Email"
              placeholder="manager@example.com"
              leftSection={<IconMail size={16} />}
              value={newManager.email}
              onChange={(e) => setNewManager({ ...newManager, email: e.target.value })}
              required
            />
            <TextInput
              label="Full Name"
              placeholder="John Manager"
              leftSection={<IconUser size={16} />}
              value={newManager.name}
              onChange={(e) => setNewManager({ ...newManager, name: e.target.value })}
              required
            />
            <TextInput
              label="Google User ID"
              placeholder="google-user-id-123"
              leftSection={<IconKey size={16} />}
              value={newManager.googleUserId}
              onChange={(e) => setNewManager({ ...newManager, googleUserId: e.target.value })}
            />
            <TextInput
              label="Role"
              placeholder="Manager"
              value={newManager.role}
              onChange={(e) => setNewManager({ ...newManager, role: e.target.value })}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={createManager} loading={loading}>
                Create Manager
              </Button>
            </Group>
          </Stack>
        </Modal>

        {/* Close Button */}
        <Group justify="center" mt="xl">
          <Button variant="outline" onClick={onClose}>
            Close Manager Management
          </Button>
        </Group>
      </Stack>
    </Container>
  );
};
