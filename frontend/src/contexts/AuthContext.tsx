import { createContext, useState, ReactNode, useEffect } from 'react';
import { useGoogleLogin, CodeResponse } from '@react-oauth/google';
import axios from 'axios';
import { mockLogin, MockLoginRequest, getCurrentUserProfile } from '../helpers/Api';

// Define a type for the user state
type User = {
  token: string;
  userData?: Record<string, unknown>; // More specific than 'any'
  tenantId?: string; // Add tenant ID support
} | null;

// Define a type for the context
export interface AuthContextType {
  user: User;
  googleLogin: () => void;
  directGoogleLogin: () => void;
  mockLogin: (credentials: MockLoginRequest) => Promise<boolean>;
  logout: () => void;
  profile: GoogleProfile | null;
  isLoading: boolean;
  error: string | null;
  isUserProvisioned: boolean;
  checkUserProvisioning: () => Promise<boolean>;
}

// Create the context with a default undefined value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

type GoogleProfile = {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User>(null);
  const [profile, setProfile] = useState<GoogleProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUserProvisioned, setIsUserProvisioned] = useState(false);

  // Mock login function
  const handleMockLogin = async (credentials: MockLoginRequest): Promise<boolean> => {
    console.log('AuthContext: Starting mock login with credentials:', credentials);
    setIsLoading(true);
    setError(null);

    try {
      const [success, response] = await mockLogin(credentials);
      console.log('AuthContext: Mock login result:', { success, response });
      
      if (success && response) {
        const userData = {
          token: response.token,
          userData: response.user,
          tenantId: response.user.tenantId
        };
        
        console.log('AuthContext: Setting user data:', userData);
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        setIsLoading(false);
        return true;
      } else {
        console.log('AuthContext: Login failed - invalid response');
        setError('Invalid credentials. Please try again.');
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      console.error('AuthContext: Mock login error:', err);
      setError('Login failed. Please try again.');
      setIsLoading(false);
      return false;
    }
  };

  // Fallback login for direct Google OAuth when backend is not available
  const directGoogleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log('Direct Google login successful:', tokenResponse);
      const userData = {
        token: tokenResponse.access_token,
        userData: {
          access_token: tokenResponse.access_token,
          token_type: tokenResponse.token_type,
          expires_in: tokenResponse.expires_in,
          scope: tokenResponse.scope
        }
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Direct Google login failed:', error);
      setError('Authentication failed. Please try again.');
      setIsLoading(false);
    }
  });

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Error parsing saved user:', err);
        localStorage.removeItem('user');
      }
    }
  }, []);

  useEffect(() => {
    if (user?.userData?.access_token) {
      setIsLoading(true);
      setError(null);
      
      axios
        .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.userData.access_token}`, {
          headers: {
            Authorization: `Bearer ${user.userData.access_token}`,
            Accept: 'application/json'
          }
        })
        .then((res) => {
          setProfile(res.data);
        })
        .catch((err) => {
          console.error('Error fetching profile:', err);
          setError('Failed to fetch user profile');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [user]);

  const googleLogin = useGoogleLogin({    
    onSuccess: (tokenResponse: CodeResponse) => {
      setIsLoading(true);
      setError(null);
      
      // Try to exchange code with backend first
      fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: tokenResponse.code }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Login successful, backend response:', data);
        
        // Update user state with the response from your backend
        const userData = {
          token: data.access_token || data.token || tokenResponse.code,
          userData: {
            access_token: data.access_token || data.token,
            user: data.user || data,
            ...data
          }
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      })
      .catch(error => {
        console.error('Backend auth failed, using mock authentication for development:', error);
        
        // For development, create a mock user when backend fails
        const mockUserData = {
          token: 'mock-jwt-token-' + Date.now(),
          userData: {
            id: 'mock-google-id',
            email: 'user@example.com',
            name: 'Mock Google User',
            picture: '',
            googleUserId: 'mock-google-id'
          }
        };
        
        setUser(mockUserData);
        localStorage.setItem('user', JSON.stringify(mockUserData));
      })
      .catch(error => {
        console.error('Backend auth failed, falling back to direct Google auth:', error);
        
        // Fallback: Use direct Google login
        directGoogleLogin();
      })
      .finally(() => {
        setIsLoading(false);
      });
    },
    onError: (errorResponse: Pick<CodeResponse, "error" | "error_description" | "error_uri">) => {
      console.error('Login Error:', errorResponse);
      setError('Google login failed. Please try again.');
    },
    flow: 'auth-code',
  });

  const logout = () => {
    setUser(null);
    setProfile(null);
    setError(null);
    setIsUserProvisioned(false);
    localStorage.removeItem('user');
  };

  const checkUserProvisioning = async (): Promise<boolean> => {
    if (!user?.token) {
      return false;
    }

    try {
      const [success, response] = await getCurrentUserProfile(user.token);
      if (success && response) {
        setIsUserProvisioned(true);
        return true;
      } else {
        setIsUserProvisioned(false);
        return false;
      }
    } catch (err) {
      console.error('Error checking user provisioning:', err);
      setIsUserProvisioned(false);
      return false;
    }
  };

  const value = { 
    user, 
    googleLogin, 
    directGoogleLogin, 
    mockLogin: handleMockLogin,
    logout, 
    profile, 
    isLoading, 
    error,
    isUserProvisioned,
    checkUserProvisioning
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
