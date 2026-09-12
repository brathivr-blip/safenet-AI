import axios from "axios";

const configuredUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
const api = axios.create({
  baseURL: configuredUrl ? `${configuredUrl.replace(/\/api$/, "")}/api` : "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export type HealthResponse = {
  status: string;
  env: string;
  demo_mode: boolean;
};

export async function getHealth(): Promise<HealthResponse> {
  const response = await api.get<HealthResponse>("/health");
  return response.data;
}

export type User = { id: string; name: string; role: string };
export type AuthResponse = { token: string; user: User };
export type Emergency = {
  id: string;
  description: string;
  category: string;
  latitude: number;
  longitude: number;
  priority: "CRITICAL" | "HIGH" | "MEDIUM";
  recommendation: string;
  notification: string;
  status: string;
  created_at: string;
  responder: { name: string; eta: string; status: string };
  hospital: { name: string; status: string };
  nearby_resources: Array<{ id: string; type: string; name: string; status: string; eta: string; distance_km: number }>;
  timeline: Array<{ label: string; time: string; done: boolean }>;
};
export type DashboardSummary = {
  active_incidents: number;
  critical_incidents: number;
  responders_available: number;
  hospitals_receiving: number;
  priority_counts: Record<string, number>;
  recent: Emergency[];
};

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/login", { email, password });
  return response.data;
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/register", { name, email, password });
  return response.data;
}

export async function reportEmergency(payload: {
  description: string;
  category: string;
  latitude: number;
  longitude: number;
}): Promise<Emergency> {
  const response = await api.post<Emergency>("/emergencies", payload);
  return response.data;
}

export async function getDashboard(): Promise<DashboardSummary> {
  const response = await api.get<DashboardSummary>("/dashboard/summary");
  return response.data;
}