import { AppShell, Burger, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
// import { AppHeader } from '../components/Header';
import PageNav from '../components/PageNav';
import { Outlet } from 'react-router-dom';
import { MantineLogo } from '@mantinex/mantine-logo';


export function Home() {
  // const [opened, { toggle }] = useDisclosure();
  // const [opened] = useDisclosure();
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      layout="alt"
      header={{ height: 60 }}
      footer={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      // aside={{ width: 300, breakpoint: 'md', collapsed: { desktop: false, mobile: true } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <MantineLogo size={30} />
        </Group>
      </AppShell.Header>
      <AppShell.Navbar >
        {/* <Group>
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Text>Navbar</Text>
        </Group>
        {Array(15)
          .fill(0)
          .map((_, index) => (
            <Skeleton key={index} h={28} mt="sm" animate={false} />
          ))} */}
        <PageNav/>          
      </AppShell.Navbar>
      <AppShell.Main>
        <Outlet></Outlet>
      </AppShell.Main>
      {/* <AppShell.Aside p="md">Aside</AppShell.Aside> */}
      {/* <AppShell.Footer p="md">Footer</AppShell.Footer> */}
    </AppShell>
  );
}

export default Home;