import { Container, Burger, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
// import { MantineLogo } from '@mantinex/mantine-logo';
import classes from './Header.module.css';
// import { useContext } from 'react';
// import { CondoContext } from '../contexts/CondoContext';
import Context from '../contexts/CondoContext'

// const links = [
//   { link: '/about', label: 'Features' },
//   { link: '/pricing', label: 'Pricing' },
//   { link: '/learn', label: 'Learn' },
//   { link: '/community', label: 'Community' },
// ];

export function AppHeader() {
  const [opened, { toggle }] = useDisclosure(false);
  // const [active, setActive] = useState(links[0].link);

  // const items = links.map((link) => (
  //   <a
  //     key={link.label}
  //     href={link.link}
  //     className={classes.link}
  //     data-active={active === link.link || undefined}
  //     onClick={(event) => {
  //       event.preventDefault();
  //       setActive(link.link);
  //     }}
  //   >
  //     {link.label}
  //   </a>
  // ));

  const context = Context.useCondo();

  console.log('context',context);
  
  return (
    <>
      <Container size="md" className={classes.inner}>
        {/* <MantineLogo size={28} /> */}
        {/* <Group gap={5} visibleFrom="xs">
          {items}
        </Group> */}
        <div>
          <Text >{`${context.name}` } </Text>
        </div>
        <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />
      </Container>
    </>
  );
}