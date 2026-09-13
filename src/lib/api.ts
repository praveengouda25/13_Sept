const API_BASE_URL =
  import.meta.env["VITE_API_BASE_URL"] || (import.meta.env.DEV ? "http://localhost:5000/api" : "");
export const ERP_BASE_PATH = "/erp";

function normalizeErpUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return `${ERP_BASE_PATH}/auth`;
  return `${trimmed.replace(/\/$/, "")}/auth`;
}

// Keep local development and the bundled Vercel deployment on the same-origin
// ERP by default. A separately deployed ERP can provide an absolute
// VITE_ERP_URL without changing application code.
export const ERP_AUTH_URL = normalizeErpUrl(import.meta.env["VITE_ERP_URL"] || ERP_BASE_PATH);

export type AuthUser = { id: number; name: string; email: string; role: string; status: string };
export const getAccessToken = () =>
  typeof window === "undefined" ? null : localStorage.getItem("svrst_access_token");
export const saveAuth = (accessToken: string, user: AuthUser) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("svrst_access_token", accessToken);
  localStorage.setItem("svrst_auth_user", JSON.stringify(user));
  window.dispatchEvent(new Event("svrst-auth-changed"));
};
export const clearAuth = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("svrst_access_token");
  localStorage.removeItem("svrst_auth_user");
  window.dispatchEvent(new Event("svrst-auth-changed"));
};
export const getStoredUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem("svrst_auth_user");
    return value ? (JSON.parse(value) as AuthUser) : null;
  } catch {
    return null;
  }
};
export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const endpoint = path;
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const payload = (await response.json().catch(() => null)) as {
    message?: string;
    data?: T;
  } | null;
  if (!response.ok) throw new Error(payload?.message || "Request failed. Please try again.");
  return (payload?.data ?? payload) as T;
}
export { API_BASE_URL };
