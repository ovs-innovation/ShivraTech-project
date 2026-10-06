const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("shivratech_token") || "";
  }
  return "";
};

export const apiFetch = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "An error occurred with the request");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// ==================== AUTH APIs ====================
export const apiLogin = (credentials) => {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
};

export const apiRegister = (userData) => {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

export const apiGetMe = () => {
  return apiFetch("/auth/me");
};

export const apiUpdateProfile = (profileData) => {
  return apiFetch("/auth/update-profile", {
    method: "PUT",
    body: JSON.stringify(profileData),
  });
};

// ==================== PRODUCT APIs ====================
export const apiGetProducts = (params = "") => {
  return apiFetch(`/products${params ? `?${params}` : ""}`);
};

export const apiGetProductBySlug = (slug) => {
  return apiFetch(`/products/${slug}`);
};

export const apiCreateProduct = (productData) => {
  return apiFetch("/products", {
    method: "POST",
    body: JSON.stringify(productData),
  });
};

export const apiUpdateProduct = (id, productData) => {
  return apiFetch(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(productData),
  });
};

export const apiDeleteProduct = (id) => {
  return apiFetch(`/products/${id}`, {
    method: "DELETE",
  });
};

export const apiGetSellerProducts = () => {
  return apiFetch("/products/seller/my-products");
};

export const apiAddProductReview = (productId, reviewData) => {
  return apiFetch(`/products/${productId}/reviews`, {
    method: "POST",
    body: JSON.stringify(reviewData),
  });
};

// ==================== ORDER APIs ====================
export const apiCreateOrder = (orderData) => {
  return apiFetch("/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
};

export const apiGetMyOrders = () => {
  return apiFetch("/orders/my-orders");
};

export const apiGetOrderById = (id) => {
  return apiFetch(`/orders/${id}`);
};

export const apiCancelOrder = (id, reason) => {
  return apiFetch(`/orders/${id}/cancel`, {
    method: "PUT",
    body: JSON.stringify({ reason }),
  });
};

export const apiReturnOrder = (id, reason) => {
  return apiFetch(`/orders/${id}/return`, {
    method: "PUT",
    body: JSON.stringify({ reason }),
  });
};

// ==================== VENDOR APIs ====================
export const apiGetSellerOrders = () => {
  return apiFetch("/orders/seller/my-orders");
};

export const apiUpdateOrderStatus = (orderId, statusData) => {
  return apiFetch(`/orders/${orderId}/status`, {
    method: "PUT",
    body: JSON.stringify(statusData),
  });
};

export const apiGetSellerAnalytics = () => {
  return apiFetch("/orders/seller/analytics");
};

// ==================== UPLOAD API ====================
export const apiUploadImage = async (file) => {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to upload image");
  }
  return data;
};

export const apiUploadMultipleImages = async (files) => {
  const token = getAuthToken();
  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append("images", file);
  });

  const response = await fetch(`${API_BASE_URL}/upload/multiple`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to upload images");
  }
  return data;
};

// ==================== ADMIN APIs ====================

// Analytics
export const apiAdminGetAnalytics = () => apiFetch("/admin/analytics");

// Users
export const apiAdminGetUsers = (params = "") =>
  apiFetch(`/admin/users${params ? `?${params}` : ""}`);
export const apiAdminGetUserById = (id) => apiFetch(`/admin/users/${id}`);
export const apiAdminUpdateUser = (id, data) =>
  apiFetch(`/admin/users/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const apiAdminDeleteUser = (id) =>
  apiFetch(`/admin/users/${id}`, { method: "DELETE" });

// Vendors
export const apiAdminGetVendors = (params = "") =>
  apiFetch(`/admin/vendors${params ? `?${params}` : ""}`);
export const apiAdminApproveVendor = (id, approved) =>
  apiFetch(`/admin/vendors/${id}/approve`, {
    method: "PUT",
    body: JSON.stringify({ approved }),
  });
export const apiAdminSuspendVendor = (id) =>
  apiFetch(`/admin/vendors/${id}/suspend`, { method: "PUT" });

// Products
export const apiAdminGetProducts = (params = "") =>
  apiFetch(`/admin/products${params ? `?${params}` : ""}`);
export const apiAdminUpdateProduct = (id, data) =>
  apiFetch(`/admin/products/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const apiAdminDeleteProduct = (id) =>
  apiFetch(`/admin/products/${id}`, { method: "DELETE" });

// Orders
export const apiAdminGetOrders = (params = "") =>
  apiFetch(`/admin/orders${params ? `?${params}` : ""}`);
export const apiAdminUpdateOrderStatus = (id, data) =>
  apiFetch(`/admin/orders/${id}/status`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

// Categories
export const apiAdminGetCategories = () => apiFetch("/admin/categories");
export const apiAdminCreateCategory = (data) =>
  apiFetch("/admin/categories", { method: "POST", body: JSON.stringify(data) });
export const apiAdminUpdateCategory = (id, data) =>
  apiFetch(`/admin/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const apiAdminDeleteCategory = (id) =>
  apiFetch(`/admin/categories/${id}`, { method: "DELETE" });

