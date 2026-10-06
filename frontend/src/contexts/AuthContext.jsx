import axios from "axios";
import httpStatus from "http-status";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../environment";

export const AuthContext = createContext({});

const client = axios.create({
  baseURL: `${server}/api/v1/users`,
});

export const AuthProvider = ({ children }) => {
  const authContext = useContext(AuthContext);
  const [userData, setUserData] = useState(authContext || null);
  const router = useNavigate();

  const getAuthToken = useCallback(() => localStorage.getItem("token"), []);

  const handleRegister = useCallback(async (name, username, password) => {
    try {
      const request = await client.post("/register", {
        name,
        username,
        password,
      });

      if (request.status === httpStatus.CREATED) {
        return request.data.message;
      }
    } catch (err) {
      throw err;
    }
  }, []);

  const handleLogin = useCallback(async (username, password) => {
    try {
      const request = await client.post("/login", {
        username,
        password,
      });

      if (request.status === httpStatus.OK) {
        const token = request.data.token;
        localStorage.setItem("token", token);
        setUserData(request.data.user || { username });
        router("/home");
        return request.data;
      }
    } catch (err) {
      throw err;
    }
  }, [router]);

  const getHistoryOfUser = useCallback(async () => {
    try {
      const token = getAuthToken();
      const request = await client.get("/get_all_activity", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return request.data;
    } catch (err) {
      throw err;
    }
  }, [getAuthToken]);

  const addToUserHistory = useCallback(async (meetingCode) => {
    try {
      const token = getAuthToken();
      const request = await client.post(
        "/add_to_activity",
        { meeting_code: meetingCode },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return request;
    } catch (e) {
      throw e;
    }
  }, [getAuthToken]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUserData(null);
    router("/auth");
  }, [router]);

  const value = useMemo(
    () => ({
      userData,
      setUserData,
      addToUserHistory,
      getHistoryOfUser,
      handleRegister,
      handleLogin,
      logout,
    }),
    [userData, addToUserHistory, getHistoryOfUser, handleRegister, handleLogin, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
