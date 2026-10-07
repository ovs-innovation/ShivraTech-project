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

export const apiUploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  const token = getToken();
  const response = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Image upload failed");
  if (!data.data?.url) throw new Error("Image upload did not return an image URL");
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
export const apiGetVendorById = (id) =>
  apiFetch(`/admin/vendors/${id}`);
export const apiApproveVendor = (id) =>
  apiFetch(`/admin/vendors/${id}/approve`, {
    method: "PUT",
  });
export const apiRejectVendor = (id, reason) =>
  apiFetch(`/admin/vendors/${id}/reject`, {
    method: "PUT",
    body: JSON.stringify({ reason }),
  });
export const apiSuspendVendor = (id, reason) =>
  apiFetch(`/admin/vendors/${id}/suspend`, {
    method: "PUT",
    body: JSON.stringify({ reason }),
  });
export const apiReactivateVendor = (id) =>
  apiFetch(`/admin/vendors/${id}/reactivate`, {
    method: "PUT",
  });
export const apiUpdateVendorStoreStatus = (id, storeStatus, reason) =>
  apiFetch(`/admin/vendors/${id}/store-status`, {
    method: "PUT",
    body: JSON.stringify({ storeStatus, reason }),
  });
export const apiVerifyVendorDocument = (id, status, reason) =>
  apiFetch(`/admin/vendors/${id}/verify-document`, {
    method: "PUT",
    body: JSON.stringify({ status, reason }),
  });

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

// Payments & Transactions
export const apiGetTransactions = (params = "") =>
  apiFetch(`/admin/transactions${params ? `?${params}` : ""}`);
export const apiGetTransactionById = (id) =>
  apiFetch(`/admin/transactions/${id}`);
export const apiRefundTransaction = (id, data) =>
  apiFetch(`/admin/transactions/${id}/refund`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const apiUpdateTransactionStatus = (id, data) =>
  apiFetch(`/admin/transactions/${id}/status`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

// Coupons & Offers
export const apiGetCoupons = (params = "") =>
  apiFetch(`/admin/coupons${params ? `?${params}` : ""}`);
export const apiCreateCoupon = (data) =>
  apiFetch("/admin/coupons", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const apiUpdateCoupon = (id, data) =>
  apiFetch(`/admin/coupons/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const apiDeleteCoupon = (id) =>
  apiFetch(`/admin/coupons/${id}`, { method: "DELETE" });
export const apiToggleCouponStatus = (id) =>
  apiFetch(`/admin/coupons/${id}/toggle`, { method: "PATCH" });

// Banners & Homepage Content Management
export const apiGetBanners = (params = "") =>
  apiFetch(`/admin/banners${params ? `?${params}` : ""}`);
export const apiCreateBanner = (data) =>
  apiFetch("/admin/banners", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const apiUpdateBanner = (id, data) =>
  apiFetch(`/admin/banners/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const apiDeleteBanner = (id) =>
  apiFetch(`/admin/banners/${id}`, { method: "DELETE" });
export const apiToggleBanner = (id) =>
  apiFetch(`/admin/banners/${id}/toggle`, { method: "PATCH" });
export const apiReorderBanners = (orders) =>
  apiFetch("/admin/banners/reorder", {
    method: "PATCH",
    body: JSON.stringify({ orders }),
  });

export const apiGetHomepageOverview = () =>
  apiFetch("/admin/homepage/overview");
export const apiToggleCategoryFeatured = (id) =>
  apiFetch(`/admin/categories/${id}/featured`, { method: "PATCH" });
export const apiUpdateProductShowcase = (id, flags) =>
  apiFetch(`/admin/products/${id}/showcase`, {
    method: "PATCH",
    body: JSON.stringify(flags),
  });

// Support & Disputes / Tickets
export const apiGetTickets = (params = "") =>
  apiFetch(`/tickets${params ? `?${params}` : ""}`);
export const apiGetTicketById = (id) =>
  apiFetch(`/tickets/${id}`);
export const apiCreateTicket = (data) =>
  apiFetch("/tickets", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const apiUpdateTicket = (id, data) =>
  apiFetch(`/tickets/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const apiDeleteTicket = (id) =>
  apiFetch(`/tickets/${id}`, { method: "DELETE" });
