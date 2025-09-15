import {
  Text,
  Card,
  Group,
  RingProgress,
  useMantineTheme,
  NumberFormatter,
  Stack,
  Button,
  LoadingOverlay,
  Drawer,
} from "@mantine/core";
import React from "react";
import { useEffect, useState } from "react";
import classes from "./Periods.module.css";
import { useNavigate } from "react-router-dom";
import {
  formatDateToLongFormat,
  formatDateToMonthYr,
} from "../helpers/DateUtils";
import { IconFileImport } from "@tabler/icons-react";

import { NewPeriod } from "../components/periods/NewPeriod";
import CondoContext from "../contexts/CondoContext";
import { PeriodResponse } from "../types/StatementTypes";
import { getPeriods } from "../helpers/Api.ts";
import { useDisclosure } from "@mantine/hooks";
import { useAuth } from "../hooks/useAuth";
import { env } from "../config/environment";


interface Props {
  // Define your component's props here
}

const Periods: React.FC<Props> = () => {
  const [data, setData] = useState<PeriodResponse[]>([]);
  const [loadingOpened, { open, close }] = useDisclosure(false);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  

  const navigate = useNavigate();
  const { user } = useAuth();
  const { id : condoId } = CondoContext.useCondo();



  const getRandom = (min: number, max: number) => {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
  };

  const theme = useMantineTheme();
  // const completed = 1887
  const total = getRandom(80, 100);

  useEffect(() => {
    // Only fetch data if user is authenticated
    if (!user) {
      console.log("Periods: No authenticated user, not fetching data");
      setData([]);
      return;
    }

    console.log(`Periods: Fetching periods for authenticated user (${env.useMockApi ? 'MOCK' : 'LIVE'} API)`);
    open();
    getPeriods()
      .then(([, data]) => setData(data))
      .catch((error) => console.error(error))
      .finally(close);
  }, [user, open, close]);

  const onNewPeriod = (period: PeriodResponse) => {
    console.log("Periods.onNewPeriod", period);
    //add new period to the list
    setData([...data, period]);
    closeModal();
    navigate(`/statements/${encodeURIComponent(period.id)}`)
  };

  return (
    <>
      <Drawer
        opened={modalOpened}
        onClose={closeModal}
        title="Agregar Recibo"
        position="right"
        size="md"
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
        styles={{
          body: { 
            height: '100%',
            padding: 0,
          },
          content: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }
        }}
      >
        <div style={{ height: '100%', padding: '0 20px' }}>
          <NewPeriod 
            id={condoId || "1"} 
            actionOnCancel={closeModal}
            actionOnConfirm={onNewPeriod}
          />
        </div>
      </Drawer>
      
      <Stack key={"1"}>
        <LoadingOverlay
          visible={loadingOpened}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
        />
        {!user ? (
          <Card withBorder p="lg" radius="md">
            <Text ta="center" c="dimmed" size="lg">
              🔐 Please sign in to view billing periods
            </Text>
            <Text ta="center" c="dimmed" size="sm" mt="xs">
              You need to be authenticated to access this data
            </Text>
          </Card>
        ) : (
          <>
            <Group mt="md">
              <Button rightSection={<IconFileImport size={14} />} onClick={openModal}>
                Agregar Recibo
              </Button>
            </Group>
            <Stack key="1.2">
              {data.map((period, index) => (
            // <div key={`${period.attribute}-${index}`}>
              <Card
              key={`${period.id}-${index}`}
                withBorder
                p="lg"
                radius="md"
                className={classes.card}
                onClick={() =>
                  navigate(`/statements/${encodeURIComponent(period.id)}`)
                }
              >
                <div className={classes.inner}>
                  <div>
                    {/* <NavLink to="/statements/${encodeURIComponent(period.prefix)" className={classes.link}> */}
                    <Text fz="lg" fw={500} className={classes.label}>
                      {formatDateToMonthYr(period.id)}
                    </Text>
                    {/* </NavLink> */}
                    <div>
                      <Text className={classes.lead} mt={30}>
                        <NumberFormatter
                          prefix="$ "
                          value={period.amount}
                          thousandSeparator
                        />
                      </Text>
                      <Text fz="xs" c="dimmed">
                        Monto
                      </Text>
                    </div>
                    <Group mt="lg">
                      {
                        <div >
                          <Text className={classes.label}>{"Del"}</Text>
                          <Text size="xs" c="dimmed">
                            {formatDateToLongFormat(period.from)}
                          </Text>
                        </div>
                      }
                      ,
                      {
                        <div >
                          <Text className={classes.label}>{"Al"}</Text>
                          <Text size="xs" c="dimmed">
                            {formatDateToLongFormat(period.to)}
                          </Text>
                        </div>
                      }
                    </Group>
                  </div>
                  <div className={classes.ring}>
                    <RingProgress
                      roundCaps
                      thickness={6}
                      size={150}
                      sections={[
                        {
                          value: (getRandom(80, 100) / total) * 100,
                          color: theme.primaryColor,
                        },
                      ]}
                      label={
                        <div>
                          <Text ta="center" fz="lg" className={classes.label}>
                            {((getRandom(80, 100) / total) * 100).toFixed(0)}%
                          </Text>
                          <Text ta="center" fz="xs" c="dimmed">
                            Completed
                          </Text>
                        </div>
                      }
                    />
                  </div>
                </div>
              </Card>
            // </div>
          ))}
            </Stack>
          </>
        )}
      </Stack>    
    </>
  );
};
export default Periods;
