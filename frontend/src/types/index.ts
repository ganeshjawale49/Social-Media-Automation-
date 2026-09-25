export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrandProfile {
  id: string;
  workspace_id: string;
  brand_name: string;
  industry?: string | null;
  products_services?: string | null;
  target_audience?: string | null;
  location?: string | null;
  brand_tone?: string | null;
  brand_colors?: string | null;
  website?: string | null;
  competitors?: string | null;
  usp?: string | null;
  business_goals?: string | null;
  preferred_language?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrandBrainContext {
  workspace_id: string;
  brand_name: string;
  industry: string;
  products_services: string;
  target_audience: string;
  location: string;
  brand_tone: string;
  brand_colors: string;
  website: string;
  competitors: string;
  usp: string;
  business_goals: string;
  preferred_language: string;
  is_ready: boolean;
  formatted_context_prompt: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ApiError {
  detail: string;
}
