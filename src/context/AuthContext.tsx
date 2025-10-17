import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  login: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

function decodeJWT(token: string): any {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join("")
    );
    return JSON.parse(json);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

function isTokenValid(token: string): boolean {
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) {
      return false;
    }
    return decoded.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("authToken");
    if (token && isTokenValid(token)) {
      const decoded = decodeJWT(token);
      setUser({
        id: decoded.id || decoded.userId || decoded.sub || "1",
        email: decoded.email || decoded.username || "user@example.com",
        name: decoded.name || decoded.username || "User",
        role: decoded.role?.toLowerCase() || "user",
      });
    } else {
      Cookies.remove("authToken");
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await axios.post("http://localhost:8080/auth/login", {
        username,
        password,
      });

      const token = response.data.token;

      if (!token) {
        return {
          success: false,
          error: "No token received from server",
        };
      }

      if (!isTokenValid(token)) {
        return {
          success: false,
          error: "Invalid or expired token received",
        };
      }

      Cookies.set("authToken", token, { expires: 7 });

      const decoded = decodeJWT(token);
      setUser({
        id: decoded.id || decoded.userId || decoded.sub || "1",
        email: decoded.email || decoded.username || username,
        name: decoded.name || decoded.username || username,
        role: decoded.role?.toLowerCase() || "user",
      });

      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error.response?.data || error.message);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Login failed. Please check your credentials.",
      };
    }
  };

  const logout = () => {
    Cookies.remove("authToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isLoading, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};
