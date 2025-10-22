import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Table,
  Text,
  Group,
  Button,
  LoadingOverlay,
  ActionIcon,
  Stack,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import {
  getUnits,
  MappedUnit,
  requestPreSignedUrl,
  saveStatement,
  UnitResponse,
  uploadFile,
} from "../../helpers/Api.ts";
import { DropzoneButton } from "../DropzoneButton";
import { IconTrash } from "@tabler/icons-react";
import { StatementSaveRequest } from "../../types/StatementTypes";

type Props = {
  files: File[];
  setUploadInitiated: (value: boolean) => void;
  setFilesUploaded: (value: boolean) => void;
};

const getMappedUnits = (files: File[], unitsInDb: UnitResponse[]) => {
  return files.map((file) => {
    const [unitId] = file.name.split("-");
    const unitIdNumber = (+unitId).toString();
    const u = unitsInDb.find((u) => u.unit === unitIdNumber);
    return { ...u, file: file } as MappedUnit;
  });
};

export const UploadStatements = ({ files, setUploadInitiated, setFilesUploaded }: Props) => {
  //   console.log("UploadStatements.files", files);

  //   read the id from the url params
  const { id: periodId } = useParams();
  // const { id: condoId } = CondoContext.useCondo();
  // const [fileAdded, setFileAdded] = useState(false);
  const [unitsInDb, setUnitsInDb] = useState<UnitResponse[]>([]);
  const [mappedUnits, setMappedUnits] = useState<MappedUnit[]>([]);
  const uploadForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      files: [] as MappedUnit[],
    },
    validate: {
      files: (value) => {
        if (!value || value.length === 0) {
          return "Debe agregar al menos un archivo";
        }
        
        for (let i = 0; i < value.length; i++) {
          const file = value[i];
          if (!file.unit || file.unit.trim() === '') {
            return `Unidad es requerida para el archivo ${i + 1}`;
          }
          if (!file.name || file.name.trim() === '') {
            return `Nombre del propietario es requerido para el archivo ${i + 1}`;
          }
          if (!file.email || file.email.trim() === '') {
            return `Email es requerido para el archivo ${i + 1}`;
          }
          if (!/^\S+@\S+$/.test(file.email)) {
            return `Email inválido para el archivo ${i + 1}`;
          }
        }
        return null;
      },
    },
  });
  const [opened, handlers] = useDisclosure(false, {
    onOpen: () => console.log("Opened"),
    onClose: () => console.log("Closed"),
  });

  useEffect(() => {
    async function loadUnits() {
      const [, uDbs] = await getUnits();
      setUnitsInDb(uDbs);
    }
    loadUnits();
  }, []);

  useEffect(() => {
    console.log("files.useEffect", files);
    const units = getMappedUnits(files, unitsInDb);
    setMappedUnits(units);
    uploadForm.setFieldValue("files", units);
  }, [files, unitsInDb]);

  const selectedFiles = uploadForm.getValues().files.map((file, index) => (
    <Table.Tr key={`${file.name}${index}`}>
      <Table.Td>
        <TextInput
          value={file.unit}
          onChange={(e) => {
            const newFiles = [...uploadForm.getValues().files];
            newFiles[index] = { ...newFiles[index], unit: e.target.value };
            uploadForm.setFieldValue("files", newFiles);
          }}
          placeholder="Ej: 101"
          size="sm"
        />
      </Table.Td>
      <Table.Td align="left">
        <TextInput
          value={file.name}
          onChange={(e) => {
            const newFiles = [...uploadForm.getValues().files];
            newFiles[index] = { ...newFiles[index], name: e.target.value };
            uploadForm.setFieldValue("files", newFiles);
          }}
          placeholder="Nombre del propietario"
          size="sm"
        />
      </Table.Td>
      <Table.Td align="left">
        <TextInput
          value={file.email}
          onChange={(e) => {
            const newFiles = [...uploadForm.getValues().files];
            newFiles[index] = { ...newFiles[index], email: e.target.value };
            uploadForm.setFieldValue("files", newFiles);
          }}
          placeholder="email@ejemplo.com"
          size="sm"
        />
      </Table.Td>
      <Table.Td align="left">{file.file?.name}</Table.Td>
      <Table.Td>
        <ActionIcon
          color="red"
          onClick={() => uploadForm.removeListItem("files", index)}
        >
          <IconTrash size="1rem" />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  ));

  const handleOnDrop = async (files: File[]) => {
    try {
      //for each file (with format unitId-month-year.pdf) in files, get unitId, month and year into a list of objects
      const units = getMappedUnits(files, unitsInDb);

      console.log("units", units);
      setMappedUnits(units);
      console.log(files);
      files.map((file) => {
        console.log(file.lastModified);
      });
      uploadForm.setFieldValue("files", units);
    } catch (error) {
      console.log(error);
    } finally {
      //   setIsUploading(false);
    }
  };

  const handleOnSubmit = async (fileUnits: MappedUnit[]) => {
    console.log("🚀 handleOnSubmit called with fileUnits:", fileUnits);
    handlers.open();
    console.log("handleOnSubmit... values", fileUnits);
    
    if (!periodId) {
      console.log("periodId is undefined");
      return;
    }

    //get preSignedUrl promises for each file
    const presignedPromises = fileUnits.map(
      (v) =>
        v.file && {
          url: requestPreSignedUrl(periodId, v.file),
          file: v.file,
        }
    );

    //get promises for each unit with file to save request (StatementSaveRequest)
    const saveMetadaPromises = fileUnits.map((unit) => {
      return saveStatement(unit.id, {
        from: "",
        to: "",
        period: encodeURIComponent(periodId || ""),
        fileName: unit.file?.name,
        email: unit.email,
        amount: 0,
        name: unit.name,
        unit: unit.unit,
      } as StatementSaveRequest);
    });

    //execute all presignedPromises and get the urls then upload the files
    Promise.all(presignedPromises.map((p) => p && p.url)).then(
      (response) => {
        console.log("presignedPromises.response", response);
        //put all url's into a promise array
        const urlPromises = response.map(
          (url) => url && uploadFile(url[1].url, url[1].file)
        );

        //upload all files
        Promise.all(urlPromises).then((responses) => {
          console.log("urlPromises.responses", responses);

          Promise.all(saveMetadaPromises).then((responses) => {
            console.log("saveMetadaPromises.responses", responses);
            handlers.close();
            setUploadInitiated(false);
            setFilesUploaded(true);
            // setFilesUploaded(false);
          });
        });
      }
    );
  };

  return (
    <Stack
      mih={50}
      gap="md"
      justify="flex-start"
      align="center"
    >
      <LoadingOverlay
        visible={opened}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
      />
      <h2>{`Estados de Cuenta ${periodId}`}</h2>
      <form
        onSubmit={uploadForm.onSubmit((values) => {
          console.log('Form submitted with values:', values);
          console.log('Form files:', values.files);
          handleOnSubmit(values.files);
        })}
      >
        <DropzoneButton onUpload={handleOnDrop} />
        {uploadForm.errors.files && (
          <Text c="red" mt={5} size="sm">
            {uploadForm.errors.files}
          </Text>
        )}
        <>
          {selectedFiles.length > 0 && (
          <Table.ScrollContainer minWidth={800}>
            <Table verticalSpacing="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Unidad</Table.Th>
                  <Table.Th>Propietario</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Archivo</Table.Th>
                  <Table.Th>Remover</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{selectedFiles}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>
          )}
        </>
        <Group mt="xl" justify="flex-end">
          <Button onClick={() => setUploadInitiated(false)}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={mappedUnits.length == 0}
            onClick={(e) => {
              console.log('🔴 Guardar button clicked!');
              console.log('mappedUnits.length:', mappedUnits.length);
              console.log('uploadForm.getValues().files:', uploadForm.getValues().files);
              console.log('Form valid:', uploadForm.isValid());
              console.log('Form errors:', uploadForm.errors);
              console.log('Event:', e);
            }}
          >
            Guardar ({mappedUnits.length})
          </Button>
        </Group>
      </form>
    </Stack>
  );
};
export default UploadStatements;
