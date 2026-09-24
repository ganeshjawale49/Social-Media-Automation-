"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Workspace, AuthResponse } from "@/types";
import { api } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  workspace: Workspace | null;
  workspaces: Workspace[];
  loading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshWorkspace: () => Promise<void>;
  createWorkspace: (name: string, description?: string) => Promise<Workspace>;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  updateWorkspace: (name: string, description?: string) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUserAndWorkspaces = async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setUser(null);
        setWorkspace(null);
        setWorkspaces([]);
        setLoading(false);
        return;
      }

      // 1. Validate session & fetch user profile
      const userRes = await api.get<User>("/auth/me");
      setUser(userRes.data);

      // 2. Fetch workspace data (graceful error handling)
      try {
        const [wsCurrentRes, wsListRes] = await Promise.all([
          api.get<Workspace>("/workspaces/current"),
          api.get<Workspace[]>("/workspaces"),
        ]);
        setWorkspace(wsCurrentRes.data);
        setWorkspaces(wsListRes.data);
      } catch (wsErr) {
        console.warn("Could not load workspaces:", wsErr);
        setWorkspace(null);
        setWorkspaces([]);
      }
    } catch (err) {
      console.error("Session validation failed:", err);
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      setUser(null);
      setWorkspace(null);
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUserAndWorkspaces();
  }, []);

  const login = async (data: any) => {
    setLoading(true);
    try {
      const res = await api.post<AuthResponse>("/auth/login", data);
      if (typeof window !== "undefined") {
        localStorage.setItem("token", res.data.access_token);
      }
      setUser(res.data.user);

      try {
        const [wsRes, wsListRes] = await Promise.all([
          api.get<Workspace>("/workspaces/current"),
          api.get<Workspace[]>("/workspaces"),
        ]);
        setWorkspace(wsRes.data);
        setWorkspaces(wsListRes.data);
      } catch (wsErr) {
        console.warn("Could not load workspaces after login:", wsErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any) => {
    setLoading(true);
    try {
      const res = await api.post<AuthResponse>("/auth/register", data);
      if (typeof window !== "undefined") {
        localStorage.setItem("token", res.data.access_token);
      }
      setUser(res.data.user);

      try {
        const [wsRes, wsListRes] = await Promise.all([
          api.get<Workspace>("/workspaces/current"),
          api.get<Workspace[]>("/workspaces"),
        ]);
        setWorkspace(wsRes.data);
        setWorkspaces(wsListRes.data);
      } catch (wsErr) {
        console.warn("Could not load workspaces after registration:", wsErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      // Ignore network/server errors during logout
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      setUser(null);
      setWorkspace(null);
      setWorkspaces([]);
      setLoading(false);
      window.location.href = "/login";
    }
  };

  const refreshWorkspace = async () => {
    try {
      const [wsRes, wsListRes] = await Promise.all([
        api.get<Workspace>("/workspaces/current"),
        api.get<Workspace[]>("/workspaces"),
      ]);
      setWorkspace(wsRes.data);
      setWorkspaces(wsListRes.data);
    } catch (e) {
      console.error("Failed refreshing workspace:", e);
    }
  };

  const createWorkspace = async (name: string, description?: string): Promise<Workspace> => {
    const res = await api.post<Workspace>("/workspaces", { name, description });
    const newWs = res.data;
    setWorkspace(newWs);
    setWorkspaces((prev) => [...prev.filter((w) => w.id !== newWs.id), newWs]);
    return newWs;
  };

  const switchWorkspace = async (workspaceId: string) => {
    const res = await api.get<Workspace>(`/workspaces/current?workspace_id=${workspaceId}`);
    setWorkspace(res.data);
  };

  const updateWorkspace = async (name: string, description?: string) => {
    if (!workspace) return;
    const res = await api.patch<Workspace>(`/workspaces/${workspace.id}`, { name, description });
    const updatedWs = res.data;
    setWorkspace(updatedWs);
    setWorkspaces((prev) => prev.map((w) => (w.id === updatedWs.id ? updatedWs : w)));
  };

  const deleteWorkspace = async (workspaceId: string) => {
    await api.delete(`/workspaces/${workspaceId}`);
    const remaining = workspaces.filter((w) => w.id !== workspaceId);
    setWorkspaces(remaining);

    if (workspace?.id === workspaceId) {
      if (remaining.length > 0) {
        setWorkspace(remaining[0]);
      } else {
        setWorkspace(null);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        workspace,
        workspaces,
        loading,
        login,
        register,
        logout,
        refreshWorkspace,
        createWorkspace,
        switchWorkspace,
        updateWorkspace,
        deleteWorkspace,
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
