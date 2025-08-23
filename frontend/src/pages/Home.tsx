import { AppShell, Burger, Group, Button, Modal, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
// import { AppHeader } from '../components/Header';
import PageNav from '../components/PageNav';
import { Outlet } from 'react-router-dom';
import { MantineLogo } from '@mantinex/mantine-logo';
import { MockLogin } from '../components/auth/MockLogin';
import { ApiTest } from '../components/auth/ApiTest';
import { useAuth } from '../hooks/useAuth';

export function Home() {
  const [opened, { toggle }] = useDisclosure();
  const [mockLoginOpened, { open: openMockLogin, close: closeMockLogin }] = useDisclosure();
  const { user, logout } = useAuth();

  return (
    <AppShell
      layout="alt"
      header={{ height: 60 }}
      footer={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <MantineLogo size={30} />
          </Group>
          
          <Group>
            {user ? (
              <Button 
                variant="light" 
                size="sm" 
                onClick={logout}
              >
                Logout ({user.userData?.email || 'User'})
              </Button>
            ) : (
              <>
                <Button 
                  variant="light" 
                  size="sm" 
                  onClick={openMockLogin}
                >
                  🧪 Mock Login
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.href = '/api-test'}
                >
                  🔧 API Test
                </Button>
              </>
            )}
          </Group>
        </Group>
      </AppShell.Header>
      
      <AppShell.Navbar>
        <PageNav/>          
      </AppShell.Navbar>
      
      <AppShell.Main>
        <Outlet></Outlet>
      </AppShell.Main>

      <Modal 
        opened={mockLoginOpened} 
        onClose={closeMockLogin}
        title="🧪 Mock Login - Test Multi-Tenant"
        size="md"
      >
        <MockLogin />
      </Modal>
    </AppShell>
  );
}

export default Home;