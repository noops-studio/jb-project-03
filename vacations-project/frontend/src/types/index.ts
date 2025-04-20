// User types
export interface User {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Vacation types
export interface Vacation {
  vacationId: number;
  destination: string;
  description: string;
  startDate: string;
  endDate: string;
  price: number;
  imageFileName: string;
  followersCount: number;
  isFollowing: number;
}

export interface VacationRequest {
  destination: string;
  description: string;
  startDate: string;
  endDate: string;
  price: number;
  image?: File;
}

export interface VacationFilters {
  followed?: boolean;
  upcoming?: boolean;
  active?: boolean;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface VacationsResponse {
  vacations: Vacation[];
  pagination: PaginationInfo;
}

// Report types
export interface FollowerReport {
  destination: string;
  followersCount: number;
}