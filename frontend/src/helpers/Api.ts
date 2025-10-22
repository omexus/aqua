import { FileWithPath } from "@mantine/dropzone";
import axios from "axios";
import {
  PeriodResponse,
  PeriodSaveRequest,
  PeriodWithStatementsResponse,
  PresignedUrl,
  StatementSaveRequest,
} from "../types/StatementTypes";
import { getApiBaseUrl, isUsingMockApi, getApiEndpoint } from "../config/environment";

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.token;
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  return null;
};

// Helper function to create axios instance with auth headers
const createAuthenticatedAxios = () => {
  const token = getAuthToken();
  return axios.create({
    headers: {
      ...(token && { Authorization: `Bearer ${token}` })
    }
  });
};

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
  console.log('🔍 getTenantId - user from localStorage:', user);
  
  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log('🔍 getTenantId - parsed userData:', userData);
      console.log('🔍 getTenantId - userData.userData:', userData.userData);
      console.log('🔍 getTenantId - userData.userData?.activeCondo:', userData.userData?.activeCondo);
      
      // Check for manager's active condo ID
      if (userData.userData?.activeCondo?.id && userData.userData.activeCondo.id !== 'undefined') {
        console.log('✅ getTenantId - using activeCondo.id:', userData.userData.activeCondo.id);
        return userData.userData.activeCondo.id;
      }
      // Fallback to legacy tenantId
      if (userData.tenantId && userData.tenantId !== 'undefined') {
        console.log('✅ getTenantId - using legacy tenantId:', userData.tenantId);
        return userData.tenantId;
      }
      // Fallback to userData.tenantId
      if (userData.userData?.tenantId && userData.userData.tenantId !== 'undefined') {
        console.log('✅ getTenantId - using userData.tenantId:', userData.userData.tenantId);
        return userData.userData.tenantId;
      }
    } catch (err) {
      console.error("Error parsing user data:", err);
    }
  }
  console.log('⚠️ getTenantId - using default tenantId');
  return "a2f02fa1-bbe4-46f8-90be-4aa43162400c"; // Default to Aqua
};



// Mock authentication functions
export const mockLogin = async (
  request: MockLoginRequest
): Promise<[success: boolean, response: MockLoginResponse | null]> => {
  try {
    const apiUrl = getApiEndpoint('/auth/mock-login');
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

export const createUnits = async (unitsData: any): Promise<[success: boolean, response: any]> => {
  try {
    const tenantId = getTenantId();
    const authenticatedAxios = createAuthenticatedAxios();
    const { data } = await authenticatedAxios.post(
      getApiEndpoint(`/units/${tenantId}/bulk`),
      unitsData
    );

    if (!data) {
      console.error("No data returned from createUnits endpoint");
    }

    return [true, data];
  } catch (err: unknown) {
    console.error("Error in createUnits", err);
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
      getApiEndpoint('/auth/me'),
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

export const createUnits = async (unitsData: any): Promise<[success: boolean, response: any]> => {
  try {
    const tenantId = getTenantId();
    const authenticatedAxios = createAuthenticatedAxios();
    const { data } = await authenticatedAxios.post(
      getApiEndpoint(`/units/${tenantId}/bulk`),
      unitsData
    );

    if (!data) {
      console.error("No data returned from createUnits endpoint");
    }

    return [true, data];
  } catch (err: unknown) {
    console.error("Error in createUnits", err);
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

// API functions with tenant support
export const requestPreSignedUrl = async (
  period: string,
  file: FileWithPath
): Promise<[sucess: boolean, url: PresignedUrl]> => {
  try {
    const tenantId = getTenantId();
    const authenticatedAxios = createAuthenticatedAxios();
    const { data } = await authenticatedAxios.get(
      getApiEndpoint(`/statements/${tenantId}/presign/${period}/${encodeURIComponent(
        file.name
      )}`)
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
    const authenticatedAxios = createAuthenticatedAxios();
    const { data } = await authenticatedAxios.get(
      getApiEndpoint(`/units/${tenantId}/${unitId}`)
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

export const createUnits = async (unitsData: any): Promise<[success: boolean, response: any]> => {
  try {
    const tenantId = getTenantId();
    const authenticatedAxios = createAuthenticatedAxios();
    const { data } = await authenticatedAxios.post(
      getApiEndpoint(`/units/${tenantId}/bulk`),
      unitsData
    );

    if (!data) {
      console.error("No data returned from createUnits endpoint");
    }

    return [true, data];
  } catch (err: unknown) {
    console.error("Error in createUnits", err);
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

export const getUnits = async (): Promise<
  [sucess: boolean, response: UnitResponse[]]
> => {
  try {
    const tenantId = getTenantId();
    const authenticatedAxios = createAuthenticatedAxios();
    const { data } = await authenticatedAxios.get(
      getApiEndpoint(`/units/${tenantId}`)
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
    const authenticatedAxios = createAuthenticatedAxios();
    const { data } = await authenticatedAxios.get(
      getApiEndpoint(`/periods/${tenantId}`)
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
    const authenticatedAxios = createAuthenticatedAxios();
    const { data } = await authenticatedAxios.get<PeriodWithStatementsResponse>(
      getApiEndpoint(`/periods/${tenantId}/${periodId}/statements`)
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
    const authenticatedAxios = createAuthenticatedAxios();
    const { data } = await authenticatedAxios.get(
      getApiEndpoint(`/condos/${unitId}`)
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

export const createUnits = async (unitsData: any): Promise<[success: boolean, response: any]> => {
  try {
    const tenantId = getTenantId();
    const authenticatedAxios = createAuthenticatedAxios();
    const { data } = await authenticatedAxios.post(
      getApiEndpoint(`/units/${tenantId}/bulk`),
      unitsData
    );

    if (!data) {
      console.error("No data returned from createUnits endpoint");
    }

    return [true, data];
  } catch (err: unknown) {
    console.error("Error in createUnits", err);
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

export const saveStatement = async (
  id: string,
  request: StatementSaveRequest
): Promise<[sucess: boolean, response: CondoResponse | null]> => {
  console.log('🔍 saveStatement - request:', request);
  try {
    const authenticatedAxios = createAuthenticatedAxios();
    const { data } = await authenticatedAxios.post(
      getApiEndpoint(`/statements/${id}`),
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

export const createUnits = async (unitsData: any): Promise<[success: boolean, response: any]> => {
  try {
    const tenantId = getTenantId();
    const authenticatedAxios = createAuthenticatedAxios();
    const { data } = await authenticatedAxios.post(
      getApiEndpoint(`/units/${tenantId}/bulk`),
      unitsData
    );

    if (!data) {
      console.error("No data returned from createUnits endpoint");
    }

    return [true, data];
  } catch (err: unknown) {
    console.error("Error in createUnits", err);
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

export const savePeriod = async (
  id: string,
  request: PeriodSaveRequest
): Promise<[sucess: boolean, response: PeriodResponse | null]> => {
  try {
    const url = getApiEndpoint(`/periods/${id}`);
    const authenticatedAxios = createAuthenticatedAxios();
    const { data } = await authenticatedAxios.post(url, request);

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

export const createUnits = async (unitsData: any): Promise<[success: boolean, response: any]> => {
  try {
    const tenantId = getTenantId();
    const authenticatedAxios = createAuthenticatedAxios();
    const { data } = await authenticatedAxios.post(
      getApiEndpoint(`/units/${tenantId}/bulk`),
      unitsData
    );

    if (!data) {
      console.error("No data returned from createUnits endpoint");
    }

    return [true, data];
  } catch (err: unknown) {
    console.error("Error in createUnits", err);
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

// Google OAuth authentication
export interface GoogleAuthRequest {
  code: string;
  redirectUri?: string;
}

export interface GoogleAuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    userId: string;
    name: string;
    email: string;
    unit: string;
    role: string;
    condoId: string;
    condoName: string;
    condoPrefix: string;
  };
  error?: string;
}

// Google OAuth authentication function
export const authenticateWithGoogle = async (
  request: GoogleAuthRequest
): Promise<[success: boolean, response: GoogleAuthResponse | null]> => {
  try {
    const { data } = await axios.post(
      getApiEndpoint('/auth/google'),
      request
    );

    if (!data || !data.success) {
      console.error("Google authentication failed:", data);
      return [false, null];
    }

    return [true, data];
  } catch (err: unknown) {
    console.error("Error in authenticateWithGoogle", err);
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

export const createUnits = async (unitsData: any): Promise<[success: boolean, response: any]> => {
  try {
    const tenantId = getTenantId();
    const authenticatedAxios = createAuthenticatedAxios();
    const { data } = await authenticatedAxios.post(
      getApiEndpoint(`/units/${tenantId}/bulk`),
      unitsData
    );

    if (!data) {
      console.error("No data returned from createUnits endpoint");
    }

    return [true, data];
  } catch (err: unknown) {
    console.error("Error in createUnits", err);
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

// User provisioning types
export interface UserProvisionRequest {
  googleUserId: string;
  name: string;
  email: string;
  condoId: string;
  unit: string;
  role: string;
}

export interface UserProvisionResponse {
  success: boolean;
  user?: {
    id: string;
    userId: string;
    name: string;
    email: string;
    unit: string;
    role: string;
    condoId: string;
    condoName: string;
    condoPrefix: string;
  };
  error?: string;
}

export interface CondoOption {
  id: string;
  name: string;
  prefix: string;
}

export interface CondoCreateRequest {
  name: string;
  prefix: string;
  numberOfUnits: number;
}

export interface CondoCreateResponse {
  success: boolean;
  condo?: CondoOption;
  error?: string;
}

// User provisioning functions
export const provisionUser = async (
  request: UserProvisionRequest
): Promise<[success: boolean, response: UserProvisionResponse | null]> => {
  try {
    const { data } = await axios.post(
      getApiEndpoint('/users/provision'),
      request
    );

    if (!data || !data.success) {
      console.error("User provisioning failed:", data);
      return [false, null];
    }

    return [true, data];
  } catch (err: unknown) {
    console.error("Error in provisionUser", err);
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

export const createUnits = async (unitsData: any): Promise<[success: boolean, response: any]> => {
  try {
    const tenantId = getTenantId();
    const authenticatedAxios = createAuthenticatedAxios();
    const { data } = await authenticatedAxios.post(
      getApiEndpoint(`/units/${tenantId}/bulk`),
      unitsData
    );

    if (!data) {
      console.error("No data returned from createUnits endpoint");
    }

    return [true, data];
  } catch (err: unknown) {
    console.error("Error in createUnits", err);
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

export const getCurrentUserProfile = async (
  token: string,
  email?: string
): Promise<[success: boolean, response: any | null]> => {
  try {
    const url = email ? `${getApiEndpoint('/users/me')}?email=${encodeURIComponent(email)}` : getApiEndpoint('/users/me');
    
    const { data } = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!data) {
      console.error("No data returned from getCurrentUserProfile endpoint");
      return [false, null];
    }

    return [true, data];
  } catch (err: unknown) {
    console.error("Error in getCurrentUserProfile", err);
    return [false, null];
  }
};

export const createUnits = async (unitsData: any): Promise<[success: boolean, response: any]> => {
  try {
    const tenantId = getTenantId();
    const authenticatedAxios = createAuthenticatedAxios();
    const { data } = await authenticatedAxios.post(
      getApiEndpoint(`/units/${tenantId}/bulk`),
      unitsData
    );

    if (!data) {
      console.error("No data returned from createUnits endpoint");
    }

    return [true, data];
  } catch (err: unknown) {
    console.error("Error in createUnits", err);
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

export const getAvailableCondos = async (): Promise<[success: boolean, response: CondoOption[] | null]> => {
  try {
    const authenticatedAxios = createAuthenticatedAxios();
    const { data } = await authenticatedAxios.get(
      getApiEndpoint('/users/condos')
    );

    if (!data) {
      console.error("No data returned from getAvailableCondos endpoint");
      return [false, null];
    }

    return [true, data];
  } catch (err: unknown) {
    console.error("Error in getAvailableCondos", err);
    return [false, null];
  }
};

export const createUnits = async (unitsData: any): Promise<[success: boolean, response: any]> => {
  try {
    const tenantId = getTenantId();
    const authenticatedAxios = createAuthenticatedAxios();
    const { data } = await authenticatedAxios.post(
      getApiEndpoint(`/units/${tenantId}/bulk`),
      unitsData
    );

    if (!data) {
      console.error("No data returned from createUnits endpoint");
    }

    return [true, data];
  } catch (err: unknown) {
    console.error("Error in createUnits", err);
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

export const createCondo = async (
  request: CondoCreateRequest
): Promise<[success: boolean, response: CondoCreateResponse | null]> => {
  try {
    const authenticatedAxios = createAuthenticatedAxios();
    const { data } = await authenticatedAxios.post(
      getApiEndpoint('/condos'),
      request
    );

    if (!data || !data.success) {
      console.error("Condo creation failed:", data);
      return [false, null];
    }

    return [true, data];
  } catch (err: unknown) {
    console.error("Error in createCondo", err);
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

export const createUnits = async (unitsData: any): Promise<[success: boolean, response: any]> => {
  try {
    const tenantId = getTenantId();
    const authenticatedAxios = createAuthenticatedAxios();
    const { data } = await authenticatedAxios.post(
      getApiEndpoint(`/units/${tenantId}/bulk`),
      unitsData
    );

    if (!data) {
      console.error("No data returned from createUnits endpoint");
    }

    return [true, data];
  } catch (err: unknown) {
    console.error("Error in createUnits", err);
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