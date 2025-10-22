import { createContext, useState, ReactNode, useEffect, useContext } from 'react';
import { useGoogleLogin, CodeResponse } from '@react-oauth/google';
import axios from 'axios';

// Manager types
interface Manager {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role: 'MANAGER';
}

interface Condo {
  id: string;
  name: string;
  prefix: string;
  isDefault: boolean;
}

interface ManagerUser {
  token: string;
  manager: Manager;
  condos: Condo[];
  activeCondo: Condo | null;
}

// Auth context type
export interface ManagerAuthContextType {
  user: ManagerUser | null;
  googleLogin: () => void;
  mockLogin: (credentials: MockLoginRequest) => Promise<boolean>;
  logout: () => void;
  switchCondo: (condoId: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  hasCondos: boolean;
  requiresCondoAssignment: boolean;
}

// Create the context
export const ManagerAuthContext = createContext<ManagerAuthContextType | undefined>(undefined);

interface ManagerAuthProviderProps {
  children: ReactNode;
}

interface MockLoginRequest {
  email: string;
  password: string;
}

export const ManagerAuthProvider = ({ children }: ManagerAuthProviderProps) => {
  const [user, setUser] = useState<ManagerUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Google OAuth login
  const googleLogin = useGoogleLogin({
    onSuccess: async (codeResponse: CodeResponse) => {
      console.log('ManagerAuthContext: Google OAuth success, code:', codeResponse.code);
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.post('http://localhost:5001/api/managerauth/google', {
          code: codeResponse.code,
          redirectUri: 'http://localhost:5173/callback'  // Use the configured redirect URI
        });

        if (response.data.success) {
          const { token, manager, condos } = response.data;
          
          const managerUser: ManagerUser = {
            token,
            manager,
            condos,
            activeCondo: condos.find((c: Condo) => c.isDefault) || condos[0] || null
          };

          setUser(managerUser);
          localStorage.setItem('managerUser', JSON.stringify(managerUser));
          setIsLoading(false);
        } else if (response.data.requiresCondoAssignment) {
          // Handle case where manager needs condo assignment
          const { manager } = response.data;
          const managerUser: ManagerUser = {
            token: null,
            manager,
            condos: [],
            activeCondo: null
          };

          setUser(managerUser);
          localStorage.setItem('managerUser', JSON.stringify(managerUser));
          setIsLoading(false);
          // Don't set error - let the component handle the condo assignment flow
        } else {
          setError(response.data.error || 'Authentication failed');
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('ManagerAuthContext: Google OAuth error:', err);
        setError(err.response?.data?.error || 'Authentication failed');
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error('ManagerAuthContext: Google OAuth error:', error);
      setError('Google authentication failed');
      setIsLoading(false);
    },
    flow: 'auth-code',
  });

  // Mock login for development
  const mockLogin = async (credentials: MockLoginRequest): Promise<boolean> => {
    console.log('ManagerAuthContext: Mock login with credentials:', credentials);
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5001/api/mock/auth/mock-login', credentials);
      
      if (response.data.success) {
        const { token, user: userData } = response.data;
        
        // Create mock manager user
        const managerUser: ManagerUser = {
          token,
          manager: {
            id: userData.tenantId,
            email: userData.email,
            name: userData.name,
            role: 'MANAGER'
          },
          condos: [{
            id: userData.tenantId,
            name: userData.condoName,
            prefix: userData.condoPrefix,
            isDefault: true
          }],
          activeCondo: {
            id: userData.tenantId,
            name: userData.condoName,
            prefix: userData.condoPrefix,
            isDefault: true
          }
        };

        setUser(managerUser);
        localStorage.setItem('managerUser', JSON.stringify(managerUser));
        setIsLoading(false);
        return true;
      } else {
        setError('Invalid credentials');
        setIsLoading(false);
        return false;
      }
    } catch (err: any) {
      console.error('ManagerAuthContext: Mock login error:', err);
      setError('Login failed');
      setIsLoading(false);
      return false;
    }
  };

  // Switch active condo
  const switchCondo = async (condoId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await axios.post('http://localhost:5001/api/managerauth/switch-condo', {
        condoId
      }, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.data.success) {
        const newActiveCondo = user.condos.find(c => c.id === condoId);
        if (newActiveCondo) {
          const updatedUser = {
            ...user,
            activeCondo: newActiveCondo,
            token: response.data.token // Update token with new condo context
          };
          setUser(updatedUser);
          localStorage.setItem('managerUser', JSON.stringify(updatedUser));
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('ManagerAuthContext: Error switching condo:', err);
      return false;
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('managerUser');
    setError(null);
  };

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('managerUser');
    if (savedUser) {
      try {
        const managerUser = JSON.parse(savedUser);
        setUser(managerUser);
      } catch (err) {
        console.error('ManagerAuthContext: Error parsing saved user:', err);
        localStorage.removeItem('managerUser');
      }
    }
  }, []);

  // Computed properties
  const isAuthenticated = !!user;
  const hasCondos = user?.condos && user.condos.length > 0;
  const requiresCondoAssignment = isAuthenticated && !hasCondos;

  const contextValue: ManagerAuthContextType = {
    user,
    googleLogin,
    mockLogin,
    logout,
    switchCondo,
    isLoading,
    error,
    isAuthenticated,
    hasCondos,
    requiresCondoAssignment
  };

  return (
    <ManagerAuthContext.Provider value={contextValue}>
      {children}
    </ManagerAuthContext.Provider>
  );
};

// Hook to use manager auth context
export const useManagerAuth = () => {
  const context = useContext(ManagerAuthContext);
  if (context === undefined) {
    throw new Error('useManagerAuth must be used within a ManagerAuthProvider');
  }
  return context;
};
