import { api } from "@/lib/api";
import { SocialConnectionListResponse, ConnectUrlResponse } from "@/types";

export const getSocialConnections = async (workspaceId?: string): Promise<SocialConnectionListResponse> => {
  const query = workspaceId ? `?workspace_id=${workspaceId}` : "";
  const res = await api.get<SocialConnectionListResponse>(`/social-connections${query}`);
  return res.data;
};

export const connectSocialProvider = async (provider: string, workspaceId?: string): Promise<ConnectUrlResponse> => {
  const query = workspaceId ? `?workspace_id=${workspaceId}` : "";
  const res = await api.get<ConnectUrlResponse>(`/social-connections/${provider}/connect${query}`);
  return res.data;
};

export const disconnectSocialProvider = async (provider: string, workspaceId?: string): Promise<{ message: string }> => {
  const query = workspaceId ? `?workspace_id=${workspaceId}` : "";
  const res = await api.delete<{ message: string }>(`/social-connections/${provider}${query}`);
  return res.data;
};
