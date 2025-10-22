import React, { useState } from 'react';
import { Container, Title, Text, Button, Card, Group, Stack, Alert, Loader } from '@mantine/core';
import { IconAlertCircle, IconBuilding, IconCheck } from '@tabler/icons-react';
import { useManagerAuth } from '../../contexts/ManagerAuthContext';

interface Condo {
  id: string;
  name: string;
  prefix: string;
}

const CondoAssignmentScreen: React.FC = () => {
  const { user } = useManagerAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Mock available condos - in a real app, this would come from an API
  const availableCondos: Condo[] = [
    { id: 'a2f02fa1-bbe4-46f8-90be-4aa43162400c', name: 'Aqua Condominium', prefix: 'AQUA' },
    { id: 'b3f13fa2-cce5-47f9-91cf-5bb54273511d', name: 'Marina Towers', prefix: 'MARINA' },
    { id: 'c4f24fa3-ddf6-48fa-92df-6cc65384622e', name: 'Sunset Heights', prefix: 'SUNSET' }
  ];

  const handleRequestAssignment = async (condoId: string) => {
    setIsLoading(true);
    setMessage(null);

    try {
      // In a real app, this would make an API call to request condo assignment
      // For now, we'll simulate a successful assignment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage('Condo assignment request submitted successfully! An administrator will review your request.');
    } catch (error) {
      setMessage('Failed to submit condo assignment request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size="md" py="xl">
      <Stack spacing="xl">
        <div>
          <Title order={1} mb="md">
            Welcome, {user?.manager?.name}!
          </Title>
          <Text size="lg" color="dimmed">
            You need to be assigned to a condo before you can access the management dashboard.
          </Text>
        </div>

        <Alert icon={<IconAlertCircle size={16} />} color="blue">
          Please select a condo you would like to manage. An administrator will review your request and assign you to the appropriate condos.
        </Alert>

        <div>
          <Title order={2} mb="md">
            Available Condos
          </Title>
          <Stack spacing="md">
            {availableCondos.map((condo) => (
              <Card key={condo.id} shadow="sm" padding="lg" radius="md" withBorder>
                <Group position="apart" mb="xs">
                  <Group>
                    <IconBuilding size={20} />
                    <Title order={3}>{condo.name}</Title>
                  </Group>
                  <Text size="sm" color="dimmed">
                    {condo.prefix}
                  </Text>
                </Group>
                
                <Text size="sm" color="dimmed" mb="md">
                  Request access to manage this condo
                </Text>

                <Button
                  variant="light"
                  color="blue"
                  onClick={() => handleRequestAssignment(condo.id)}
                  loading={isLoading}
                  leftIcon={<IconCheck size={16} />}
                >
                  Request Assignment
                </Button>
              </Card>
            ))}
          </Stack>
        </div>

        {message && (
          <Alert 
            icon={<IconCheck size={16} />} 
            color="green"
            onClose={() => setMessage(null)}
            withCloseButton
          >
            {message}
          </Alert>
        )}

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={3} mb="md">
            Need Help?
          </Title>
          <Text size="sm" color="dimmed">
            If you don't see the condo you should manage, or if you have any questions, 
            please contact your system administrator.
          </Text>
        </Card>
      </Stack>
    </Container>
  );
};

export default CondoAssignmentScreen;
