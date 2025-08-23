import { ReactNode, useRef } from "react";
import { Text, Group, rem, useMantineTheme } from "@mantine/core";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { IconCloudUpload, IconX, IconDownload } from "@tabler/icons-react";
import classes from "./DropzoneButton.module.css";

type Props = {
  onUpload: (files: File[]) => void;
  dragAndDropMsg?: ReactNode;
  acceptMsg?: string;
  rejectMsg?: string;
  idleMsg?: string;
  minimal?: boolean;
};

export function DropzoneButton({ onUpload, minimal }: Props) {
  const theme = useMantineTheme();
  const openRef = useRef<() => void>(null);
  // console.log(classes);

  // function handleDrop(files: FileWithPath[]): void {
  //   console.log(files);
  // }

  return (
    <div className={classes.wrapper}>
      <Dropzone
        openRef={openRef}
        onDrop={onUpload}
        className={classes.dropzone}
        radius="md"
        accept={[MIME_TYPES.pdf]}
        maxSize={30 * 1024 ** 2}
      >
        <div style={{ pointerEvents: "none" }}>
        {!minimal && (
          <Group justify="center">
            <Dropzone.Accept>
              <IconDownload
                style={{ width: rem(50), height: rem(50) }}
                color={theme.colors.blue[6]}
                stroke={1.5}
              />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <IconX
                style={{ width: rem(50), height: rem(50) }}
                color={theme.colors.red[6]}
                stroke={1.5}
              />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <IconCloudUpload
                style={{ width: rem(50), height: rem(50) }}
                stroke={1.5}
              />
            </Dropzone.Idle>
          </Group>
            )}
          {!minimal && (
            <>
              <Text ta="center" fw={700} fz="lg" mt="xl">
                <Dropzone.Accept>Pon los archivos aquí</Dropzone.Accept>
                <Dropzone.Reject>Pdf file less than 30mb</Dropzone.Reject>
                <Dropzone.Idle>Agregar Estado de Cuenta</Dropzone.Idle>
              </Text>

              <Text ta="center" fz="sm" mt="xs" c="dimmed">
                Arrastra y suelta los archivos aquí. Sólo archivos <i>.pdf</i>{" "}
                menores a 30mb.
              </Text>
            </>
          )}
        </div>
      </Dropzone>
      {/* <Button size="md" radius="xl" onClick={() => openRef.current?.()}>
        Seleccionar archivos
      </Button> */}
      {/* </div> */}
    </div>
  );
}
