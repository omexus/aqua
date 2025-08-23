import { FileWithPath } from "@mantine/dropzone";
import axios from "axios";
import {
  PeriodResponse,
  PeriodSaveRequest,
  PeriodWithStatementsResponse,
  PresignedUrl,
  StatementSaveRequest,
} from "../types/StatementTypes";

// Mock authentication types
export interface MockLoginRequest {
  email: string;
  password: string;
}

export interface MockLoginResponse {
  success: boolean;
  user: {
    email: string;
    name: string;
    tenantId: string;
    condoName: string;
    condoPrefix: string;
  };
  token: string;
}

export interface MockUser {
  email: string;
  name: string;
  tenantId: string;
  condoName: string;
  condoPrefix: string;
}

// Type definitions
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
  prefix: string;
};

// Helper function to get tenant ID from localStorage or default
export const getTenantId = (): string => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.tenantId || "a2f02fa1-bbe4-46f8-90be-4aa43162400c"; // Default to Aqua
    } catch (err) {
      console.error("Error parsing user data:", err);
    }
  }
  return "a2f02fa1-bbe4-46f8-90be-4aa43162400c"; // Default to Aqua
};

// Helper function to get API base URL
const getApiBaseUrl = (): string => {
  const apiUrl = import.meta.env.VITE_AQUA_API || 'http://localhost:5001';
  console.log('getApiBaseUrl():', apiUrl);
  return apiUrl;
};

// Mock authentication functions
export const mockLogin = async (
  request: MockLoginRequest
): Promise<[success: boolean, response: MockLoginResponse | null]> => {
  try {
    const apiUrl = `${getApiBaseUrl()}/mock/auth/mock-login`;
    console.log('Mock login attempt to:', apiUrl);
    console.log('Request payload:', request);
    
    const { data } = await axios.post(apiUrl, request);

    console.log('Mock login response:', data);

    if (!data || !data.success) {
      console.error("Mock login failed:", data);
      return [false, null];
    }

    return [true, data];
  } catch (err: unknown) {
    console.error("Error in mockLogin", err);
    if (axios.isAxiosError(err)) {
      console.error("Axios error details:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url
      });
    }
    return [false, null];
  }
};

export const getCurrentUser = async (
  token: string
): Promise<[success: boolean, response: MockUser | null]> => {
  try {
    const { data } = await axios.get(
      `${getApiBaseUrl()}/mock/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!data) {
      console.error("No data returned from getCurrentUser endpoint");
      return [false, null];
    }

    return [true, data];
  } catch (err: unknown) {
    console.error("Error in getCurrentUser", err);
    return [false, null];
  }
};

// API functions with tenant support
export const requestPreSignedUrl = async (
  period: string,
  file: FileWithPath
): Promise<[sucess: boolean, url: PresignedUrl]> => {
  try {
    const tenantId = getTenantId();
    const { data } = await axios.get(
      getApiBaseUrl() +
        `/statements/${tenantId}/presign/${period}/${encodeURIComponent(
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
    const tenantId = getTenantId();
    const { data } = await axios.get(
      getApiBaseUrl() +
        `/units/${tenantId}/${unitId}`
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
    const tenantId = getTenantId();
    const { data } = await axios.get(
      getApiBaseUrl() +
        `/mock/units/${tenantId}`
    );

    if (!data) {
      const msg = "No data returned from getUnits endpoint";
      console.error(msg);
      return [false, []];
    }

    return [true, data];
  } catch (err: unknown) {
    console.error("Error in getUnits", err);
    return [false, []];
  }
};

export const getPeriods = async (): Promise<
  [sucess: boolean, response: PeriodResponse[]]
> => {
  try {
    const tenantId = getTenantId();
    const { data } = await axios.get(
      getApiBaseUrl() +
        `/mock/periods/${tenantId}`
    );

    if (!data) {
      const msg = "No data returned from getPeriods endpoint";
      console.error(msg);
      return [false, []];
    }

    return [true, data];
  } catch (err: unknown) {
    console.error("Error in getPeriods", err);
    return [false, []];
  }
};

export const getStatements = async (
  periodId: string
): Promise<[sucess: boolean, response: PeriodWithStatementsResponse]> => {
  try {
    const tenantId = getTenantId();
    const { data } = await axios.get<PeriodWithStatementsResponse>(
      getApiBaseUrl() +
        `/periods/${tenantId}/${periodId}/statements`
    );

    if (!data) {
      const msg = "No data returned from getStatements endpoint";
      console.error(msg);
      return [false, {} as PeriodWithStatementsResponse];
    }

    return [true, data];
  } catch (err: unknown) {
    console.error("Error in getStatements", err);
    return [false, {} as PeriodWithStatementsResponse];
  }
};

export const getCondo = async (
  unitId: string
): Promise<[sucess: boolean, response: CondoResponse | null]> => {
  try {
    const { data } = await axios.get(
      getApiBaseUrl() + `/mock/condos/${unitId}`
    );

    if (!data) {
      const msg = "No data returned from getCondo endpoint";
      console.error(msg);
      return [false, null];
    }

    return [true, data];
  } catch (err: unknown) {
    console.error("Error in getCondo", err);
    return [false, null];
  }
};

export const saveStatement = async (
  id: string,
  request: StatementSaveRequest
): Promise<[sucess: boolean, response: CondoResponse | null]> => {
  try {
    const { data } = await axios.post(
      getApiBaseUrl() + `/statements/${id}`,
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
    const url = `${getApiBaseUrl()}/mock/periods/${id}`;
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
    const tenantId = getTenantId();
    await axios.post(
      getApiBaseUrl() +
        `/periods/${tenantId}/send/${periodId}`,
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
    const tenantId = getTenantId();
    await axios.delete(
      getApiBaseUrl() +
        `/statements/${tenantId}/${periodId}${urlSuffix}`
    );
    return true;
  } catch (err: unknown) {
    console.error("Error in RemoveStatement", err);
    return false;
  }
};