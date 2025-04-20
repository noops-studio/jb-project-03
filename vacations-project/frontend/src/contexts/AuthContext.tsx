import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, LoginRequest, RegisterRequest, AuthResponse } from '../types';
import api from '../services/api';

// Define context shape
interface AuthContextType {
  auth: AuthState;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  auth: { user: null, token: null, isAuthenticated: false, isLoading: true },
  login: async () => {},
  register: async () => {},
  logout: () => {},
  isLoading: true,
});

// Context provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const [isLoading, setIsLoading] = useState(false);

  // Load user from localStorage on init
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedAuth = localStorage.getItem('auth');
        if (storedAuth) {
          const parsedAuth = JSON.parse(storedAuth);
          setAuth({
            user: parsedAuth.user,
            token: parsedAuth.token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer \${parsedAuth.token}`;
        } else {
          setAuth(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        setAuth(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await api.post<AuthResponse>('/auth/login', data);
      
      const { user, token } = response.data;
      
      // Update state
      setAuth({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      // Store in localStorage
      localStorage.setItem('auth', JSON.stringify({ user, token }));
      
      // Set token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer \${token}`;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      
      const { user, token } = response.data;
      
      // Update state
      setAuth({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      // Store in localStorage
      localStorage.setItem('auth', JSON.stringify({ user, token }));
      
      // Set token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Clear state
    setAuth({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });

    // Remove from localStorage
    localStorage.removeItem('auth');
    
    // Remove token from API headers
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ auth, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);