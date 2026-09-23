export type Role = 'ROLE_ADMIN' | 'ROLE_LANDLORD' | 'ROLE_TENANT' | 'ROLE_USER' | 'ROLE_STUDENT' | 'ROLE_TEACHER';

export interface User {
  id: number;
  userCode?: string;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: string;
  bio?: string;
  role: Role;
  status?: string;
  enabled: boolean;
  createdAt?: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone?: string;
  role?: Role;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface HomeStats {
  projectTitle: string;
  description: string;
  studentName: string;
  studentId: string;
  instructorName: string;
  systemStatus: string;
  totalUsers: number;
  features: Record<string, string>;
}
