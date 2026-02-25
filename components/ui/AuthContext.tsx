"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  getToken,
  setToken as setStorageToken,
  removeToken as removeStorageToken,
  decodeTokenPayload,
} from "@/lib/auth";
import { api } from "@/lib/api";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  role: string | null;
  userId: string | null;
  institutionName: string | null;
  address: string | null;
  tokens: number;
  login: (token: string, role?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  role: null,
  userId: null,
  institutionName: null,
  address: null,
  tokens: 0,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [institutionName, setInstitutionName] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [tokens, setTokens] = useState<number>(0);

  useEffect(() => {
    const initializeAuth = () => {
      const token = getToken();
      if (token) {
        try {
          const payload = decodeTokenPayload(token);
          // Verify expiration
          if (payload && payload.exp * 1000 > Date.now()) {
            setIsLoading(true);
            setIsAuthenticated(true);
            // We will fetch full profile info asynchronously
            fetchUserProfile(token);
            return;
          } else {
            removeStorageToken();
          }
        } catch {
          removeStorageToken();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const fetchUserProfile = async (token: string) => {
    try {
      const res = await api.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const user = res.data;
      setUserId(String(user.id));
      setRole(user.role || "teacher");
      setInstitutionName(user.institution_name);
      setAddress(user.address);
      setTokens(user.tokens || 0);
    } catch {
      removeStorageToken();
      setIsAuthenticated(false);
      setRole(null);
      setUserId(null);
      setInstitutionName(null);
      setAddress(null);
      setTokens(0);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (token: string, newRole?: string) => {
    setStorageToken(token);
    setIsLoading(true);
    setIsAuthenticated(true);
    if (newRole) {
      setRole(newRole);
    }
    fetchUserProfile(token);
  };

  const logout = () => {
    removeStorageToken();
    setIsAuthenticated(false);
    setRole(null);
    setUserId(null);
    setInstitutionName(null);
    setAddress(null);
    setTokens(0);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        role,
        userId,
        institutionName,
        address,
        tokens,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
