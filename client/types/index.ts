// types/index.ts
// Shared TypeScript types, used across lib/, components/, and app/ pages.
// These mirror the backend's Mongoose schemas field-for-field, so what the
// API sends and what the frontend expects never drift apart silently.
import type {
  TemplateId,
  ThemeId,
  MotionId,
  PageId,
  SectionKey,
  ContentHome,
  ContentAbout,
  ContentServices,
  ContentContact,
  ContentNav,
  ContentFooter,
} from "@/lib/templateEngine";

export type {
  TemplateId,
  ThemeId,
  MotionId,
  PageId,
  SectionKey,
  ContentHome,
  ContentAbout,
  ContentServices,
  ContentContact,
  ContentNav,
  ContentFooter,
};

export type ProjectStatus = "draft" | "in_review" | "changes_requested" | "approved";

export type FileType = "image" | "pdf" | "other";

export interface ProjectFile {
  url: string;
  publicId: string;
  type: FileType;
  originalName?: string;
  uploadedAt?: string;
}

export type CommentAuthorType = "freelancer" | "client";

export interface ProjectComment {
  authorName: string;
  authorType: CommentAuthorType;
  text: string;
  createdAt: string;
}

/** Freelancer-edited copy, page by page — null/absent means "still using the template default." */
export interface ProjectContent {
  home?: ContentHome | null;
  about?: ContentAbout | null;
  services?: ContentServices | null;
  contact?: ContentContact | null;
  nav?: ContentNav | null;
  footer?: ContentFooter | null;
}

// Full project shape — what the freelancer sees (GET /api/projects, /api/projects/:id).
export interface Project {
  _id: string;
  freelancer: string;
  name: string;
  clientName: string;
  clientEmail?: string;
  description?: string;
  status: ProjectStatus;
  shareToken: string;
  templateId: TemplateId;
  themeId: ThemeId;
  motionId: MotionId;
  pages: PageId[];
  brandName?: string;
  sectionTemplates?: Partial<Record<SectionKey, TemplateId>>;
  content?: ProjectContent;
  files: ProjectFile[];
  comments: ProjectComment[];
  createdAt: string;
  updatedAt: string;
}

// Trimmed shape — what the PUBLIC /api/preview/:token endpoint returns.
export interface PublicProject {
  name: string;
  clientName: string;
  status: ProjectStatus;
  templateId: TemplateId;
  themeId: ThemeId;
  motionId: MotionId;
  pages: PageId[];
  brandName?: string;
  sectionTemplates?: Partial<Record<SectionKey, TemplateId>>;
  content?: ProjectContent;
  files: ProjectFile[];
  comments: ProjectComment[];
  createdAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface CreateProjectInput {
  name: string;
  clientName: string;
  clientEmail?: string;
  description?: string;
  templateId: TemplateId;
  themeId: ThemeId;
  motionId: MotionId;
  pages: PageId[];
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdateProfileInput {
  name?: string;
  email?: string;
}

export interface UpdatePasswordInput {
  currentPassword: string;
  newPassword: string;
}

// ---- analytics ----
export interface StatusCount {
  status: ProjectStatus;
  count: number;
}

export interface ClientGrowthPoint {
  month: string;
  clients: number;
}

export interface ProjectGrowthPoint {
  month: string;
  projects: number;
}

export interface AnalyticsOverview {
  totalProjects: number;
  approvedProjects: number;
  totalClients: number;
  statusBreakdown: StatusCount[];
  clientGrowth: ClientGrowthPoint[];
  projectGrowth: ProjectGrowthPoint[];
}
