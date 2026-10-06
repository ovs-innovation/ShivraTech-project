import { createContext, useContext, useEffect, useState } from "react";
import { apiGetMe, apiLogin, getToken } from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("admin_token") || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      if (token) {
        try {
          const res = await apiGetMe();
          if (res.data?.role === "admin") {
            setAdmin(res.data);
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    verify();
  }, [token]);

  const login = async (email, password) => {
    const res = await apiLogin({ email, password });
    const { user, token: t } = res.data;
    if (user.role !== "admin") throw new Error("Access denied. Admins only.");
    setAdmin(user);
    setToken(t);
    localStorage.setItem("admin_token", t);
    localStorage.setItem("admin_user", JSON.stringify(user));
    return user;
  };

  const logout = () => {
    setAdmin(null);
    setToken("");
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
  };

  return (
    <AuthContext.Provider value={{ admin, token, loading, login, logout, isAdmin: admin?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
