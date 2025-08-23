import { FileWithPath } from "@mantine/dropzone";
import axios from "axios";
import {
  PeriodResponse,
  PeriodSaveRequest,
  PeriodWithStatementsResponse,
  PresignedUrl,
  StatementSaveRequest,
} from "../types/StatementTypes";

export const requestPreSignedUrl = async (
  period: string,
  file: FileWithPath
): Promise<[sucess: boolean, url: PresignedUrl]> => {
  try {
    const { data } = await axios.get(
      import.meta.env.VITE_AQUA_API +
        `/statements/a2f02fa1-bbe4-46f8-90be-4aa43162400c/presign/${period}/${encodeURIComponent(
          file.name
        )}`
    );

    if (!data) {
      console.error("No data returned from requestPreSignedUrl endpoint");
    }

    return [true, { url: data, file: file }];
  } catch (err: unknown) {
    console.error("Error in requestPreSignedUrl", err);
    return [false, { url: "", file: file }];
  }
};

export const uploadFile = async (presignedUrl: string, file: FileWithPath) => {
  const { data } = await axios.put(presignedUrl, file, {
    withCredentials: true,
  });
  return data;
};

export const getUnit = async (
  unitId: string
): Promise<[sucess: boolean, response: UnitResponse | null]> => {
  try {
    const { data } = await axios.get(
      import.meta.env.VITE_AQUA_API +
        `/units/a2f02fa1-bbe4-46f8-90be-4aa43162400c/${unitId}`
    );

    if (!data) {
      const msg = "No data returned from getUnit endpoint";
      console.error(msg);
      return [false, null];
    }

    return [true, data];
  } catch (err: unknown) {
    console.error("Error in getUnit", err);
    return [false, null];
  }
};

export const getUnits = async (): Promise<
  [sucess: boolean, response: UnitResponse[]]
> => {
  try {
    const { data } = await axios.get(
      import.meta.env.VITE_AQUA_API +
        `/units/a2f02fa1-bbe4-46f8-90be-4aa43162400c`
    );

    if (!data) {
      const msg = "No data returned from getUnit endpoint";
      console.error(msg);
      return [false, []];
    }

    return [true, data];
  } catch (err: unknown) {
    console.error("Error in getUnit", err);
    return [false, []];
  }
};

export const getPeriods = async (): Promise<
  [sucess: boolean, response: PeriodResponse[]]
> => {
  try {
    const { data } = await axios.get(
      import.meta.env.VITE_AQUA_API +
        `/periods/a2f02fa1-bbe4-46f8-90be-4aa43162400c`
    );

    if (!data) {
      const msg = "No data returned from getPeriods endpoint";
      console.error(msg);
      return [false, []];
    }

    return [true, data];
  } catch (err: unknown) {
    console.error("Error in getUnit", err);
    return [false, []];
  }
};

export const getStatements = async (
  periodId: string
): Promise<[sucess: boolean, response: PeriodWithStatementsResponse]> => {
  try {
    const { data } = await axios.get<PeriodWithStatementsResponse>(
      import.meta.env.VITE_AQUA_API +
        `/periods/a2f02fa1-bbe4-46f8-90be-4aa43162400c/${periodId}/statements`
    );

    if (!data) {
      const msg = "No data returned from getPeriods endpoint";
      console.error(msg);
      return [false, {} as PeriodWithStatementsResponse];
    }

    return [true, data];
  } catch (err: unknown) {
    console.error("Error in getUnit", err);
    return [false, {} as PeriodWithStatementsResponse];
  }
};

export const getCondo = async (
  unitId: string
): Promise<[sucess: boolean, response: CondoResponse | null]> => {
  try {
    const { data } = await axios.get(
      import.meta.env.VITE_AQUA_API + `/condos/${unitId}`
    );

    if (!data) {
      const msg = "No data returned from geCondos endpoint";
      console.error(msg);
      return [false, null];
    }

    return [true, data];
  } catch (err: unknown) {
    console.error("Error in geCondos", err);
    return [false, null];
  }
};

export const saveStatement = async (
  id: string,
  request: StatementSaveRequest
): Promise<[sucess: boolean, response: CondoResponse | null]> => {
  try {
    const { data } = await axios.post(
      import.meta.env.VITE_AQUA_API + `/statements/${id}`,
      request
    );

    if (!data) {
      const msg = "No data returned from saveStatement endpoint";
      console.error(msg);
      return [false, null];
    }

    return [true, data];
  } catch (err: unknown) {
    console.error("Error in saveStatement", err);
    return [false, null];
  }
};

export const savePeriod = async (
  id: string,
  request: PeriodSaveRequest
): Promise<[sucess: boolean, response: PeriodResponse | null]> => {
  try {
    const url = `${import.meta.env.VITE_AQUA_API}/periods/${id}`;
    const { data } = await axios.post(url, request);

    if (!data) {
      const msg = "No data returned from savePeriod endpoint";
      console.error(msg);
      return [false, null];
    }

    return [true, data];
  } catch (err: unknown) {
    console.error("Error in savePeriod", err);
    return [false, null];
  }
};

export const SendEmails = async (periodId: string, selectedRows: string[]): Promise<boolean> => {
  try {
    await axios.post(
      import.meta.env.VITE_AQUA_API +
        `/periods/a2f02fa1-bbe4-46f8-90be-4aa43162400c/send/${periodId}`,
      selectedRows
    );

    return true;
  } catch (err: unknown) {
    console.error("Error in SendEmails", err);
    return false;
  }
};

export const RemoveStatement = async (
  periodId: string,
  statementId: string
): Promise<boolean> => {
  const urlSuffix = statementId ? `/${statementId}` : "";

  try {
    await axios.delete(
      import.meta.env.VITE_AQUA_API +
        `/statements/a2f02fa1-bbe4-46f8-90be-4aa43162400c/${periodId}${urlSuffix}`
    );
    return true;
  } catch (err: unknown) {
    console.error("Error in RemoveStatement", err);
    return false;
  }
};

export type PreSignedUrlsRequestResponse = {
  fileId: string;
  fileName: string;
  uploadId: string;
  eTags: string[];
};

export type UnitResponse = {
  unit: string;
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
};

export interface MappedUnit extends UnitResponse {
  file: FileWithPath | null;
}

export type CondoResponse = {
  id: string;
  name: string;
  attribute: string;
  prefix: string;
};
