const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export const getToken = () => localStorage.getItem("admin_token") || "";

export const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

// Auth
export const apiLogin = (creds) =>
  apiFetch("/auth/login", { method: "POST", body: JSON.stringify(creds) });
export const apiGetMe = () => apiFetch("/auth/me");

// Admin Analytics
export const apiGetAnalytics = () => apiFetch("/admin/analytics");

// Users
export const apiGetUsers = (params = "") =>
  apiFetch(`/admin/users${params ? `?${params}` : ""}`);
export const apiDeleteUser = (id) =>
  apiFetch(`/admin/users/${id}`, { method: "DELETE" });

// Vendors
export const apiGetVendors = (params = "") =>
  apiFetch(`/admin/vendors${params ? `?${params}` : ""}`);
export const apiApproveVendor = (id, approved) =>
  apiFetch(`/admin/vendors/${id}/approve`, {
    method: "PUT",
    body: JSON.stringify({ approved }),
  });
export const apiSuspendVendor = (id) =>
  apiFetch(`/admin/vendors/${id}/suspend`, { method: "PUT" });

// Products
export const apiGetProducts = (params = "") =>
  apiFetch(`/admin/products${params ? `?${params}` : ""}`);
export const apiDeleteProduct = (id) =>
  apiFetch(`/admin/products/${id}`, { method: "DELETE" });
export const apiUpdateProduct = (id, data) =>
  apiFetch(`/admin/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

// Orders
export const apiGetOrders = (params = "") =>
  apiFetch(`/admin/orders${params ? `?${params}` : ""}`);
export const apiUpdateOrderStatus = (id, data) =>
  apiFetch(`/admin/orders/${id}/status`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

// Categories
export const apiGetCategories = () => apiFetch("/admin/categories");
export const apiCreateCategory = (data) =>
  apiFetch("/admin/categories", { method: "POST", body: JSON.stringify(data) });
export const apiUpdateCategory = (id, data) =>
  apiFetch(`/admin/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const apiDeleteCategory = (id) =>
  apiFetch(`/admin/categories/${id}`, { method: "DELETE" });
