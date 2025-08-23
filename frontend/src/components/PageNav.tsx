import { useState } from "react";
import { Group, Code, NavLink } from "@mantine/core";
import {
  // IconBellRinging,
  // IconFingerprint,
  // IconKey,
  // IconSettings,
  // Icon2fa,
  // IconDatabaseImport,
  // IconReceipt2,
  // IconSwitchHorizontal,
  IconLogout,
  IconFileInvoice,
  // IconLogin,
} from "@tabler/icons-react";
// import { MantineLogo } from '@mantinex/mantine-logo';
import classes from "./PageNav.module.css";
import { UserButton } from "./UserButton/UserButton";
import { useAuth } from "../hooks/useAuth";
// import { useAuth  } from "../hooks/useAuth.tsx.old";

const data = [
  {
    link: "/statements",
    label: "Recibos",
    description: "Gestión de Recibos",
    icon: IconFileInvoice,
  },
  // { link: '/billing', label: 'Billing', icon: IconReceipt2 },
  // { link: '#3', label: 'Security', icon: IconFingerprint },
  // { link: '#4', label: 'SSH Keys', icon: IconKey },
  // { link: '#5', label: 'Databases', icon: IconDatabaseImport },
  // { link: '#6', label: 'Authentication', icon: Icon2fa },
  // { link: '#7', label: 'Other Settings', icon: IconSettings },
];

const PageNav = () => {
  const [active, setActive] = useState(0);
  const { user, directGoogleLogin, profile, logout } = useAuth(); // Using AuthContext to set user

  const links = data.map((item, index) => (
    <NavLink
      href={item.link}
      key={item.label}
      active={index === active}
      label={item.label}
      description={item.description}
      // rightSection={item.rightSection}
      leftSection={<item.icon size="1rem" stroke={1.5} />}
      onClick={() => {
        // console.log('clicked ' + item.label);
        setActive(() => index);
        // event.preventDefault();
        // router(item.link);
      }}
    />
    // <a
    //   className={classes.link}
    //   data-active={item.label === active || undefined}
    //   href={item.link}
    //   key={item.label}
    //   onClick={(event) => {
    //     // event.preventDefault();
    //     console.log('clicked ' + item.label);
    //     setActive(item.label);
    //             event.preventDefault();
    //   }}
    // >
    //   <item.icon className={classes.linkIcon} stroke={1.5} />
    //   <span>{item.label}</span>
    // </a>
  ));

  // function googleLogin(): void {
  //   throw new Error("Function not implemented.");
  // }

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Group className={classes.header} justify="space-between">
          {/* <MantineLogo size={28} /> */}
          <Code fw={700}>v0.9.9</Code>
        </Group>
        {links}
      </div>
      <div className={classes.footer}>
        {user && (
          <>
            <UserButton user={{
              name: profile?.name || "",
              email:profile?.email || "",
              picture: profile?.picture || "",
            }} />
            <a
              href="#"
              className={classes.link}
              onClick={(event) => event.preventDefault()}
            >
              {/* <IconSwitchHorizontal className={classes.linkIcon} stroke={1.5} /> */}
              {/* <span>Cambiar de Usuario</span> */}
            </a>
            <a
              href="#"
              className={classes.link}
              onClick={() => logout()}
            >
              <IconLogout className={classes.linkIcon} stroke={1.5} />
              <span>Salir</span>
            </a>
          </>
        )}
        {!user && (
          <a
            href="#"
            className={classes.link}
            onClick={() => directGoogleLogin()}
          >
            <IconLogout className={classes.linkIcon} stroke={1.5} />
            <span>Login</span>
          </a>
        )}
      </div>
    </nav>
  );
};

export default PageNav;
