import { createContext, useContext, useEffect, useState } from "react";
import api, { setAccessToken } from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const applySession = ({ user, accessToken }) => {
    setAccessToken(accessToken);
    setUser(user);
    return user;
  };

  // On page load: try to restore the session from the refresh cookie
  useEffect(() => {
    api
      .post("/auth/refresh")
      .then((res) => applySession(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) =>
    applySession((await api.post("/auth/login", { email, password })).data);

  const register = async (form) =>
    applySession((await api.post("/auth/register", form)).data);

  const becomeSeller = async (profile) =>
    applySession((await api.post("/auth/become-seller", profile)).data);

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  const hasRole = (role) => !!user?.roles?.includes(role);
  const updateUser = (updated) => setUser(updated);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, becomeSeller, updateUser, logout, hasRole }}>
      {children}
    </AuthContext.Provider>

  );
}

export const useAuth = () => useContext(AuthContext);