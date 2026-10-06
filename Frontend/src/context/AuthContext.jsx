import { createContext, useContext, useEffect, useState } from "react";
import { apiGetMe, apiLogin, apiRegister, apiUpdateProfile } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("shivratech_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("shivratech_token") || "");
  const [loading, setLoading] = useState(true);

  // Sync token & user profile
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await apiGetMe();
          if (res.data) {
            setUser(res.data);
            localStorage.setItem("shivratech_user", JSON.stringify(res.data));
          }
        } catch (err) {
          console.warn("[Auth] Token invalid or expired:", err.message);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await apiLogin({ email, password });
    if (res.data) {
      const { user: userData, token: userToken } = res.data;
      setUser(userData);
      setToken(userToken);
      localStorage.setItem("shivratech_token", userToken);
      localStorage.setItem("shivratech_user", JSON.stringify(userData));
      return userData;
    }
  };

  const register = async (formData) => {
    const res = await apiRegister(formData);
    if (res.data) {
      const { user: userData, token: userToken } = res.data;
      setUser(userData);
      setToken(userToken);
      localStorage.setItem("shivratech_token", userToken);
      localStorage.setItem("shivratech_user", JSON.stringify(userData));
      return userData;
    }
  };

  const logout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("shivratech_token");
    localStorage.removeItem("shivratech_user");
  };

  const updateProfile = async (profileData) => {
    const res = await apiUpdateProfile(profileData);
    if (res.data) {
      setUser(res.data);
      localStorage.setItem("shivratech_user", JSON.stringify(res.data));
      return res.data;
    }
  };

  const isVendor = user?.role === "seller" || user?.role === "admin";
  const isCustomer = user?.role === "customer";
  const isAdmin = user?.role === "admin";
  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isVendor,
        isCustomer,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
