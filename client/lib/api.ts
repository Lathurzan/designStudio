// lib/api.ts
// Single fetch wrapper for every backend call. Reads the API base URL from
// NEXT_PUBLIC_API_URL and attaches the JWT (if present) automatically.
import type {
  AuthResponse,
  AuthUser,
  Project,
  PublicProject,
  ProjectFile,
  ProjectStatus,
  CreateProjectInput,
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
  UpdatePasswordInput,
  AnalyticsOverview,
  TemplateId,
  SectionKey,
} from "@/types";
import { getToken } from "./auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api";

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  isFormData?: boolean;
  auth?: boolean;
}

async function request<T>(
  path: string,
  { method = "GET", body, isFormData = false, auth = true }: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {};
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
  });

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // no JSON body (e.g. 204) — that's fine
  }

  if (!res.ok) {
    const message =
      (data as { message?: string } | null)?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

export const api = {
  // ---- auth ----
  register: (payload: RegisterInput) =>
    request<AuthResponse>("/auth/register", { method: "POST", body: payload, auth: false }),
  login: (payload: LoginInput) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: payload, auth: false }),
  me: () => request<AuthUser>("/auth/me"),
  updateProfile: (payload: UpdateProfileInput) =>
    request<AuthUser>("/auth/me", { method: "PUT", body: payload }),
  updatePassword: (payload: UpdatePasswordInput) =>
    request<{ message: string }>("/auth/password", { method: "PUT", body: payload }),

  // ---- projects (freelancer, protected) ----
  listProjects: () => request<Project[]>("/projects"),
  getProject: (id: string) => request<Project>(`/projects/${id}`),
  createProject: (payload: CreateProjectInput) =>
    request<Project>("/projects", { method: "POST", body: payload }),
  updateProject: (
    id: string,
    payload: Partial <
      CreateProjectInput & {
        status: ProjectStatus;
        brandName: string;
        sectionTemplates: Partial<Record<SectionKey, TemplateId>>;
      }
    >
  ) => request<Project>(`/projects/${id}`, { method: "PUT", body: payload }),
  deleteProject: (id: string) =>
    request<{ message: string }>(`/projects/${id}`, { method: "DELETE" }),
  regenerateLink: (id: string) =>
    request<Project>(`/projects/${id}/regenerate-link`, { method: "POST" }),
  addFreelancerComment: (id: string, text: string) =>
    request<Project>(`/projects/${id}/comments`, { method: "POST", body: { text } }),
  updatePageContent: <T>(
    id: string,
    page: "home" | "about" | "services" | "contact" | "nav" | "footer",
    content: T
  ) => request<Project>(`/projects/${id}/content/${page}`, { method: "PUT", body: content }),

  // ---- uploads (protected) ----
  uploadFiles: (id: string, formData: FormData) =>
    request<{ files: ProjectFile[] }>(`/projects/${id}/upload`, {
      method: "POST",
      body: formData,
      isFormData: true,
    }),

  // ---- public client preview (no auth) ----
  getPreview: (token: string) => request<PublicProject>(`/preview/${token}`, { auth: false }),
  addClientComment: (token: string, payload: { authorName: string; text: string }) =>
    request<PublicProject>(`/preview/${token}/comment`, {
      method: "POST",
      body: payload,
      auth: false,
    }),
  approveProject: (token: string) =>
    request<PublicProject>(`/preview/${token}/approve`, { method: "POST", auth: false }),
  requestChanges: (token: string) =>
    request<PublicProject>(`/preview/${token}/request-changes`, { method: "POST", auth: false }),

  // ---- analytics (protected) ----
  getAnalytics: () => request<AnalyticsOverview>("/analytics/overview"),
};
