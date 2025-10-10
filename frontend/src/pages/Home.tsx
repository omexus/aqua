import { AppShell, Burger, Group, Button, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState } from 'react';
// import { AppHeader } from '../components/Header';
import PageNav from '../components/PageNav';
import { Outlet } from 'react-router-dom';
import { MantineLogo } from '@mantinex/mantine-logo';
import { MockLogin } from '../components/auth/MockLogin';
import { UserProvision } from '../components/auth/UserProvision';
import { GoogleSignUp } from '../components/auth/GoogleSignUp';
import { useAuth } from '../hooks/useAuth';
import { env } from '../config/environment';

export function Home() {
  const [opened, { toggle }] = useDisclosure();
  const [mockLoginOpened, { open: openMockLogin, close: closeMockLogin }] = useDisclosure();
  const [googleSignUpOpened, { open: openGoogleSignUp, close: closeGoogleSignUp }] = useDisclosure();
  const [userProvisionOpened, { open: openUserProvision, close: closeUserProvision }] = useDisclosure();
  const [userProvisionCancelled, setUserProvisionCancelled] = useState(false);
  const { user, logout, isUserProvisioned, checkUserProvisioning, forceCheckUserProvisioning } = useAuth();

  // Check user provisioning when user logs in (only once per session)
  useEffect(() => {
    if (user && !isUserProvisioned && !userProvisionOpened && !userProvisionCancelled) {
      checkUserProvisioning().then((provisioned) => {
        if (!provisioned) {
          openUserProvision();
        }
      });
    }
  }, [user, isUserProvisioned, checkUserProvisioning, openUserProvision, userProvisionOpened, userProvisionCancelled]);

  // Reset userProvisionOpened when user changes or when user becomes provisioned
  useEffect(() => {
    if (isUserProvisioned && userProvisionOpened) {
      closeUserProvision();
    }
  }, [isUserProvisioned, userProvisionOpened, closeUserProvision]);

  // Reset cancelled flag when user logs out (not when they log in)
  useEffect(() => {
    if (!user) {
      setUserProvisionCancelled(false);
    }
  }, [user]); // Reset when user becomes null (logout)

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
                Logout ({(user.userData?.email as string) || 'User'})
              </Button>
            ) : (
              <>
                <Button 
                  variant="filled" 
                  size="sm" 
                  onClick={openGoogleSignUp}
                >
                  🔐 Sign Up / Login
                </Button>
                {env.enableMockLogin && (
                  <Button 
                    variant="light" 
                    size="sm" 
                    onClick={openMockLogin}
                  >
                    🧪 Mock Login
                  </Button>
                )}
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
        title="🧪 Mock Login - Multi-Tenant HOA Management"
        size="md"
      >
        <MockLogin />
      </Modal>

      <Modal 
        opened={googleSignUpOpened} 
        onClose={closeGoogleSignUp}
        title="🔐 Sign Up with Google - Multi-Tenant HOA Management"
        size="lg"
      >
        <GoogleSignUp 
          onSuccess={(userData) => {
            console.log('Google signup successful:', userData);
            closeGoogleSignUp();
          }}
          onError={(error) => {
            console.error('Google signup error:', error);
          }}
          onCancel={() => {
            closeGoogleSignUp();
          }}
        />
      </Modal>

      <Modal 
        opened={userProvisionOpened} 
        onClose={() => {
          console.log('Modal onClose triggered');
          closeUserProvision();
        }}
        title="🏠 Complete Your Profile"
        size="lg"
        closeOnClickOutside={false}
        closeOnEscape={false}
        withCloseButton={false}
      >
        <UserProvision 
          onSuccess={(userData) => {
            console.log('User provisioned successfully:', userData);
            // The UserProvision component will handle closing the modal
            // Just force re-check user provisioning status
            forceCheckUserProvisioning();
          }}
          onCancel={() => {
            // Just close the modal, don't logout the user
            console.log('Cancel button clicked, closing modal');
            setUserProvisionCancelled(true);
            closeUserProvision();
          }}
        />
      </Modal>
    </AppShell>
  );
}

export default Home;