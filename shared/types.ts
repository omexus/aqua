// Shared types between frontend and API

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Condo {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface Unit {
  id: string;
  condoId: string;
  unitNumber: string;
  floor: number;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  createdAt: string;
  updatedAt: string;
}

export interface Period {
  id: string;
  condoId: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Statement {
  id: string;
  periodId: string;
  unitId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
  status: 'pending' | 'processed' | 'error';
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  unitId: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Auth types
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleAuthRequest {
  idToken: string;
}

// File upload types
export interface FileUploadResponse {
  fileName: string;
  fileUrl: string;
  fileSize: number;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}
