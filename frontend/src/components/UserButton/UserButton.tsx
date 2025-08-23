import { UnstyledButton, Group, Avatar, Text } from '@mantine/core';
// import { IconChevronRight } from '@tabler/icons-react';
import classes from './UserButton.module.css';
// import { User } from '../../hooks/useUser.tsx.old';

export interface UserButtonProps {
  user: {
    picture: string;
    name: string;
    email: string;
  };
}

export function UserButton(props: UserButtonProps) {
  const { user } = props;

  return (
    <UnstyledButton className={classes.user}>
      <Group>
        <Avatar
          src={user.picture}
          radius="xl"
        />

        <div style={{ flex: 1 }}>
          <Text size="sm" fw={500}>
            {user.name}
          </Text>

          <Text c="dimmed" size="xs">
            {user.email}
          </Text>
        </div>

        {/* <IconChevronRight style={{ width: rem(14), height: rem(14) }} stroke={1.5} /> */}
      </Group>
    </UnstyledButton>
  );
}
