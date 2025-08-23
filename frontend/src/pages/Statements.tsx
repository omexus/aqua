import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Table,
  Anchor,
  NumberFormatter,
  Text,
  Group,
  Button,
  LoadingOverlay,
  Stack,
  Card,
  useMantineTheme,
  ActionIcon,
  Checkbox,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { PeriodWithStatementsResponse } from "../types/StatementTypes";
// import CondoContext from "../contexts/CondoContext";
import stmtClasses from "./Statements.module.css";
import { UploadStatements } from "../components/uploads/UploadStatements";
import {
  IconFileImport,
  IconMailForward,
  IconTrash,
} from "@tabler/icons-react";
import { getStatements, RemoveStatement, SendEmails } from "../helpers/Api.ts";
import {
  formatDateToLongFormat,
  formatDateToMonthYr,
} from "../helpers/DateUtils";
import { modals } from "@mantine/modals";


export function Statements() {
  //read the id from the url params
  const { id: periodId } = useParams();
  // const { id: condoId } = CondoContext.useCondo();
  const theme = useMantineTheme();

  const [isMouseOver, setIsMouseOver] = useState(false);
  const [uploadInitiated, setUploadInitiated] = useState(false);
  const [files, setFiles] = useState<FileList>();
  const [filesUploaded, setFilesUploaded] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const [opened, handlers] = useDisclosure(false, {
    onOpen: () => console.log("Opened"),
    onClose: () => console.log("Closed"),
  });

  const openModal = (
    text: string,
    confirmDanger: boolean = false,
    onConfirmAction: () => void
  ) =>
    modals.openConfirmModal({
      title: "Confirmar",
      size: "sm",
      radius: "md",
      withCloseButton: false,
      confirmProps: confirmDanger ? { color: "red" } : {},
      children: <Text size="sm">{text}</Text>,
      labels: { confirm: "Confirmar", cancel: "Cancelar" },
      onCancel: () => console.log("Cancel"),
      onConfirm: () => onConfirmAction(),
    });

  const sendEmails = async () => {
    if (!periodId) {
      console.error("No periodId");
      return;
    }
    handlers.open();
    await SendEmails(periodId, selectedRows);
    handlers.close();
  };

  //   console.log(id)
  const [data, setData] = useState<PeriodWithStatementsResponse>({
    period: {
      from: "",
      to: "",
      amount: 0,
    },
    statements: [],
  } as unknown as PeriodWithStatementsResponse);

  useEffect(() => {
    if (!periodId) {
      console.error("No periodId");
      return;
    }
    handlers.open();
    getStatements(periodId)
      .then(([success, data]) => {
        console.log("getStatements", success, data);
        if (success) {
          setData(data);
        }
      })
      .catch((error) => console.error(error))
      .finally(() => {handlers.close(); setFilesUploaded(false)});
  }, [periodId, filesUploaded]);

  const rows = data?.statements?.map((row) => {
    return (
      <Table.Tr key={row.id}>
        <Table.Td>
          <Checkbox
            aria-label="Select row"
            checked={selectedRows.includes(row.id)}
            onChange={(event) =>
              setSelectedRows(
                event.currentTarget.checked
                  ? [...selectedRows, row.id]
                  : selectedRows.filter((id) => id !== row.id)
              )
            }
          />
        </Table.Td>
        <Table.Td>{row.unit}</Table.Td>
        <Table.Td align="left">{row.name}</Table.Td>
        <Table.Td align="right">
          <NumberFormatter prefix="$ " value={row.amount} thousandSeparator />
        </Table.Td>
        <Table.Td align="left">
          <Group justify="left">
            <Anchor flex="1" component="button" fz="sm">
              {row.fileName}
            </Anchor>
          </Group>
        </Table.Td>
        <Table.Td align="left">{row.email}</Table.Td>
        <Table.Td>
          <ActionIcon
            onClick={() => handleRemove(row.id)}
            title="Remover"
            variant="transparent"
            color="red"
            radius="sm"
          >
            <IconTrash />
          </ActionIcon>
        </Table.Td>
      </Table.Tr>
    );
  });

  const handleRemove = async (index: string) => {
    handlers.open();

    //index look like: STMT#PER#20240101#01-PaseosDelBosque-Liebre-02-2024.pdf
    const stmtId = index ? index.split("#")[3] : "";

    await RemoveStatement(periodId || "", stmtId);

    if (stmtId === "") {
      //remove all rows from the table
      setData({
        ...data,
        statements: [],
      });
    } else {
      //remove the row from the table
      setData({
        ...data,
        statements: data.statements.filter((row) => row.id !== index),
      });
    }

    handlers.close();
  };

  const handleOnDrop = async (files: FileList) => {
    console.log("files >>>> ", files);
    setUploadInitiated(true);
    setFiles(files);
  };
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section withBorder inheritPadding py="xs">
        {/* <Image
          src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png"
          height={160}
          alt="Norway"
        /> */}
        <Group justify="space-between">
          <Text
            fw={700}
            tt="uppercase"
            // variant="gradient"
            // gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
            c={theme.primaryColor}
          >{`Estados de Cuenta ${formatDateToMonthYr(periodId || "")}`}</Text>
          
            {//add a button to go back to previous page
            }
            <Button
              component="a"
              // variant="link"
              // color="gray"
              onClick={() => window.history.back()}
            >
              Regresar
            </Button>
          
        </Group>
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {`Del ${formatDateToLongFormat(
              data?.period?.from
            )} al ${formatDateToLongFormat(data?.period?.to)}`}
          </Text>
          <Text size="sm" c="dimmed">
            {`Monto: $ ${data.statements.reduce(
              (acc, row) => acc + row.amount,
              0
            )}`}
          </Text>
        </Group>
      </Card.Section>
      {!uploadInitiated && (
        <Stack
          id="statement-flex"
          className={isMouseOver ? stmtClasses.dragdropzone : ""}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsMouseOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsMouseOver(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsMouseOver(false);
            handleOnDrop(e.dataTransfer.files);
          }}
          // mih="100%"
          //   bg="rgba(0, 0, 0, .3)"
          // gap="md"
          justify={data?.statements?.length > 0 ? "flex-start" : "center"}
          align="center"
          // direction="column"
          // h="100EM"
        >
          <LoadingOverlay
            visible={opened}
            zIndex={1000}
            overlayProps={{ radius: "sm", blur: 2 }}
          />
          <Stack
            id="statements-header-content"
            // mih={50}
            // bg="rgba(0, 0, 0, .3)"
            gap="md"
            // justify={data?.statements?.length > 0 ? "flex-start" : "center"}
            justify="center"
            align="inherit"
          >
            <Group mt="md" id="statements_header" justify={data?.statements?.length > 0 ? "space-between" : "center"} align="flex-end">
              {data?.statements?.length > 0 && (
                <Button
                  variant="filled"
                  color="red"
                  rightSection={<IconTrash size={14} />}
                  onClick={() =>
                    openModal(
                      "Esto removerá TODOS los estados de cuenta para el periodo seleccionado. ¿Estás seguro?",
                      true,
                      () => handleRemove("")
                    )
                  }
                >
                  Reiniciar
                </Button>
              )}
              <Group mt="md" justify="flex-end">
                {data?.statements?.length > 0 && (
                  <>
                    <Button
                      rightSection={<IconMailForward size={14} />}
                      onClick={() =>
                        openModal(
                          "Esto enviará los estados de cuenta a los propietarios a los correos electrónicos asociados para el periodo seleccionado. ¿Estás seguro?",
                          false,
                          sendEmails
                        )
                      }
                    >
                      Enviar Emails
                    </Button>
                  </>
                )}
                <Button
                  rightSection={<IconFileImport size={14} />}
                  onClick={() => setUploadInitiated(true)}
                >
                  Agregar Estados de Cuenta
                </Button>
              </Group>
            </Group>
            {data?.statements?.length === 0 && (
              <Stack justify="center" align="center">
                <Text c="dimmed" mt="md">
                  No hay estados de cuenta cargados.
                </Text>
                <Text c="dimmed">
                  Arrastra y suelta los archivos de los estados de cuenta aquí
                </Text>
              </Stack>
            )}
            {data?.statements?.length > 0 && (
              <Table.ScrollContainer minWidth={800}>
                <Table verticalSpacing="xs">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>
                      <Checkbox
                        aria-label="Select row"
                        // checked={selectedRows.includes(row.id)}
                        onChange={(event) =>
                          setSelectedRows(
                            event.currentTarget.checked
                              ? data.statements.map((row) => row.id)
                              : []
                          )
                        }
                      />
                      </Table.Th>
                      <Table.Th>Unidad</Table.Th>
                      <Table.Th>Propietario</Table.Th>
                      <Table.Th>Monto</Table.Th>
                      <Table.Th>Archivo</Table.Th>
                      <Table.Th>Email</Table.Th>
                      {/* <Table.Th>Reviews distribution</Table.Th> */}
                      <Table.Td>
                        {/* <ActionIcon
                          onClick={() => handleRemove("")}
                          title="Remover Todos"
                          variant="transparent"
                          color="red"
                          radius="xl"
                        >
                          <IconTrash />
                        </ActionIcon> */}
                      </Table.Td>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>{rows}</Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
            {/* <Demo></Demo> */}
          </Stack>
        </Stack>
      )}
      {uploadInitiated && (
        <Stack align="center" justify="flex-end">
          <UploadStatements
            files={Array.from(files || [])}
            setUploadInitiated={setUploadInitiated}
            setFilesUploaded={setFilesUploaded}
          ></UploadStatements>
        </Stack>
      )}
    </Card>
  );
}
export default Statements;
