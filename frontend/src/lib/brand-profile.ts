import { api } from "@/lib/api";
import { BrandProfile, BrandBrainContext } from "@/types";

export const brandProfileApi = {
  getProfile: async (workspaceId?: string): Promise<BrandProfile | null> => {
    try {
      const res = await api.get<BrandProfile>("/brand-profile", {
        params: workspaceId ? { workspace_id: workspaceId } : {},
      });
      return res.data;
    } catch (err: any) {
      if (err.response?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  createProfile: async (data: Partial<BrandProfile>, workspaceId?: string): Promise<BrandProfile> => {
    const res = await api.post<BrandProfile>("/brand-profile", data, {
      params: workspaceId ? { workspace_id: workspaceId } : {},
    });
    return res.data;
  },

  updateProfile: async (data: Partial<BrandProfile>, workspaceId?: string): Promise<BrandProfile> => {
    const res = await api.put<BrandProfile>("/brand-profile", data, {
      params: workspaceId ? { workspace_id: workspaceId } : {},
    });
    return res.data;
  },

  deleteProfile: async (workspaceId?: string): Promise<void> => {
    await api.delete("/brand-profile", {
      params: workspaceId ? { workspace_id: workspaceId } : {},
    });
  },

  getContext: async (workspaceId?: string): Promise<BrandBrainContext> => {
    const res = await api.get<BrandBrainContext>("/brand-profile/context", {
      params: workspaceId ? { workspace_id: workspaceId } : {},
    });
    return res.data;
  },
};
