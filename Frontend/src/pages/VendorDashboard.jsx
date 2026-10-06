import React, { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit3,
  ExternalLink,
  Eye,
  Filter,
  ImagePlus,
  Layers,
  Loader2,
  Package,
  PackageCheck,
  Plus,
  RefreshCcw,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Trash2,
  TrendingUp,
  Truck,
  UploadCloud,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  apiCreateProduct,
  apiDeleteProduct,
  apiGetSellerAnalytics,
  apiGetSellerOrders,
  apiGetSellerProducts,
  apiUpdateOrderStatus,
  apiUpdateProduct,
  apiUploadImage,
  apiUploadMultipleImages,
} from "../services/api";

const PRIMARY = "#4A0D4F";
const ACCENT = "#B35FA3";

const formatRupees = (amount = 0) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const VendorDashboard = () => {
  const { user, isVendor, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'orders', 'products'
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef(null);

  // Quick Media Upload Modal for any product
  const [quickUploadProduct, setQuickUploadProduct] = useState(null);
  const quickFileInputRef = useRef(null);

  // Product Modal State (Add / Edit)
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    title: "",
    shortDescription: "",
    description: "",
    sku: "",
    brand: "",
    subcategory: "",
    price: "",
    mrp: "",
    categorySlug: "audio",
    categoryName: "Audio",
    stock: "10",
    spec: "",
    weight: "",
    warranty: "",
    returnPolicy: "",
    images: "",
    tags: "",
    isFeatured: false,
    isFlashSale: false,
    isNewArrival: true,
  });

  // Tracking Dispatch Modal State
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [dispatchOrder, setDispatchOrder] = useState(null);
  const [courierName, setCourierName] = useState("Delhivery Express");
  const [trackingNumber, setTrackingNumber] = useState("");

  // Filters
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isVendor)) {
      navigate("/login");
    }
  }, [isAuthenticated, isVendor, authLoading, navigate]);

  const fetchVendorData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, ordersRes, productsRes] = await Promise.all([
        apiGetSellerAnalytics().catch(() => ({ data: null })),
        apiGetSellerOrders().catch(() => ({ data: [] })),
        apiGetSellerProducts().catch(() => ({ data: [] })),
      ]);

      if (analyticsRes?.data) setAnalytics(analyticsRes.data);
      if (ordersRes?.data) setOrders(ordersRes.data);
      if (productsRes?.data) setProducts(productsRes.data);
    } catch (err) {
      console.error("[VendorDashboard Error]", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isVendor) {
      fetchVendorData();
    }
  }, [isAuthenticated, isVendor]);

  const triggerNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3500);
  };

  // Upload multiple or single files to backend
  const uploadFileList = async (files) => {
    if (!files || files.length === 0) return [];
    const validFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (validFiles.length === 0) {
      alert("Please select valid image files (JPG, PNG, WEBP, SVG)");
      return [];
    }

    setIsUploadingImage(true);
    try {
      if (validFiles.length === 1) {
        const res = await apiUploadImage(validFiles[0]);
        return res.data?.url ? [res.data.url] : [];
      } else {
        const res = await apiUploadMultipleImages(validFiles);
        return res.data?.urls || [];
      }
    } catch (err) {
      alert(err.message || "Failed to upload image. Please try again.");
      return [];
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Image Upload handler for Add/Edit Product Modal
  const handleImageFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const uploadedUrls = await uploadFileList(files);
    if (uploadedUrls.length > 0) {
      setProductForm((prev) => {
        const existingImages = prev.images
          ? prev.images.split(",").map((s) => s.trim()).filter(Boolean)
          : [];
        const updated = [...existingImages, ...uploadedUrls].join(", ");
        return { ...prev, images: updated };
      });
      triggerNotification(`${uploadedUrls.length} image(s) uploaded successfully!`);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Drag and Drop handlers for Modal
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const uploadedUrls = await uploadFileList(files);
    if (uploadedUrls.length > 0) {
      setProductForm((prev) => {
        const existingImages = prev.images
          ? prev.images.split(",").map((s) => s.trim()).filter(Boolean)
          : [];
        const updated = [...existingImages, ...uploadedUrls].join(", ");
        return { ...prev, images: updated };
      });
      triggerNotification(`${uploadedUrls.length} image(s) uploaded successfully!`);
    }
  };

  const removeImageAtIndex = (indexToRemove) => {
    setProductForm((prev) => {
      const existingImages = prev.images
        ? prev.images.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      const filtered = existingImages.filter((_, idx) => idx !== indexToRemove);
      return { ...prev, images: filtered.join(", ") };
    });
  };

  const setPrimaryImage = (indexToPrimary) => {
    setProductForm((prev) => {
      const existingImages = prev.images
        ? prev.images.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      if (indexToPrimary < 0 || indexToPrimary >= existingImages.length) return prev;
      const target = existingImages[indexToPrimary];
      const rest = existingImages.filter((_, idx) => idx !== indexToPrimary);
      return { ...prev, images: [target, ...rest].join(", ") };
    });
    triggerNotification("Primary cover image updated!");
  };

  // Quick Direct Upload to existing product
  const handleQuickUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !quickUploadProduct) return;

    const uploadedUrls = await uploadFileList(files);
    if (uploadedUrls.length > 0) {
      try {
        const existing = quickUploadProduct.images || [];
        const mainImage = quickUploadProduct.mainImage || existing[0] || uploadedUrls[0];
        const updatedImages = [
          ...existing.filter((image) => image !== mainImage),
          ...uploadedUrls.filter((image) => image !== mainImage),
        ];
        await apiUpdateProduct(quickUploadProduct._id, {
          images: updatedImages,
          mainImage,
        });
        triggerNotification(`Uploaded ${uploadedUrls.length} image(s) to ${quickUploadProduct.title}`);
        await fetchVendorData();
        setQuickUploadProduct(null);
      } catch (err) {
        alert(err.message || "Failed to update product images");
      }
    }

    if (quickFileInputRef.current) {
      quickFileInputRef.current.value = "";
    }
  };

  // Status progression action for orders
  const handleUpdateStatus = async (orderId, nextStatus, extraPayload = {}) => {
    setActionLoading(true);
    try {
      await apiUpdateOrderStatus(orderId, {
        orderStatus: nextStatus,
        ...extraPayload,
      });
      triggerNotification(`Order status updated to "${nextStatus}"`);
      await fetchVendorData();
      setShowDispatchModal(false);
    } catch (err) {
      alert(err.message || "Failed to update order status");
    } finally {
      setActionLoading(false);
    }
  };

  // Product creation / update submit
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const imageUrls = productForm.images
      .split(",")
      .map((image) => image.trim())
      .filter(Boolean);

    if (imageUrls.length < 3) {
      alert("Add a main image and at least 2 gallery images before publishing.");
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        mrp: Number(productForm.mrp),
        stock: Number(productForm.stock),
        mainImage: imageUrls[0],
        images: imageUrls.slice(1),
        keySpecifications: productForm.spec,
        tags: productForm.tags
          ? productForm.tags.split(",").map((s) => s.trim())
          : [],
      };

      if (editingProduct) {
        await apiUpdateProduct(editingProduct._id, payload);
        triggerNotification("Product updated successfully!");
      } else {
        await apiCreateProduct(payload);
        triggerNotification("New product published successfully!");
      }

      setShowProductModal(false);
      setEditingProduct(null);
      await fetchVendorData();
    } catch (err) {
      alert(err.message || "Failed to save product");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product listing?")) return;
    try {
      await apiDeleteProduct(id);
      triggerNotification("Product deleted successfully");
      await fetchVendorData();
    } catch (err) {
      alert(err.message || "Failed to delete product");
    }
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    const galleryImages = Array.isArray(p.images) ? p.images : [];
    const mainImage = p.mainImage || galleryImages[0] || "";
    setProductForm({
      title: p.title || "",
      shortDescription: p.shortDescription || "",
      description: p.description || "",
      sku: p.sku || "",
      brand: p.brand || "",
      subcategory: p.subcategory || "",
      price: p.price || "",
      mrp: p.mrp || "",
      categorySlug: p.categorySlug || "audio",
      categoryName: p.categoryName || "Audio",
      stock: p.stock !== undefined ? String(p.stock) : "10",
      spec: p.keySpecifications || p.spec || "",
      weight: p.weight || "",
      warranty: p.warranty || "",
      returnPolicy: p.returnPolicy || "",
      images: [mainImage, ...galleryImages.filter((image) => image !== mainImage)]
        .filter(Boolean)
        .join(", "),
      tags: p.tags ? p.tags.join(", ") : "",
      isFeatured: Boolean(p.isFeatured),
      isFlashSale: Boolean(p.isFlashSale),
      isNewArrival: Boolean(p.isNewArrival),
    });
    setShowProductModal(true);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setProductForm({
      title: "",
      shortDescription: "",
      description: "",
      sku: "",
      brand: "",
      subcategory: "",
      price: "",
      mrp: "",
      categorySlug: "audio",
      categoryName: "Audio",
      stock: "15",
      spec: "",
      weight: "",
      warranty: "",
      returnPolicy: "",
      images: "",
      tags: "",
      isFeatured: false,
      isFlashSale: false,
      isNewArrival: true,
    });
    setShowProductModal(true);
  };

  const filteredOrders = orders.filter((ord) => {
    if (orderStatusFilter === "All") return true;
    return ord.orderStatus === orderStatusFilter;
  });

  const filteredProducts = products.filter((p) => {
    if (!productSearch.trim()) return true;
    return (
      p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.categoryName?.toLowerCase().includes(productSearch.toLowerCase())
    );
  });

  if (authLoading || (loading && !analytics && orders.length === 0)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-[#4A0D4F]" />
          <p className="text-sm font-semibold text-slate-600">Loading Vendor Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF8FC] py-6 sm:py-10">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">

        {/* Toast Notification */}
        {notification && (
          <div className="fixed top-20 right-4 z-50 flex items-center gap-2.5 rounded-2xl border border-purple-200 bg-white px-4 py-3 text-xs sm:text-sm font-bold text-slate-800 shadow-xl backdrop-blur-xl animate-bounce">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <span>{notification}</span>
          </div>
        )}

        {/* Dashboard Header Banner */}
        <div className="relative overflow-hidden rounded-[28px] border border-purple-200/80 bg-white p-5 sm:p-7 shadow-[0_12px_40px_rgba(74,13,79,0.06)] mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4A0D4F] to-[#B35FA3] text-white shadow-md">
                <Store size={26} strokeWidth={2.2} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                    {user?.storeName || user?.name || "Vendor Store"}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-700">
                    <ShieldCheck size={12} />
                    <span>Verified Vendor</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Logged in as <span className="font-semibold text-slate-700">{user?.email}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 rounded-full bg-[#4A0D4F] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition hover:bg-[#380B3C] active:scale-95"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Add New Product</span>
              </button>
              <button
                type="button"
                onClick={fetchVendorData}
                className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-purple-50 transition"
                title="Refresh data"
              >
                <RefreshCcw size={14} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-6 flex gap-2 border-t border-purple-100 pt-4 overflow-x-auto scrollbar-none">
            {[
              { id: "overview", label: "Overview & Analytics", icon: TrendingUp },
              { id: "orders", label: `Customer Orders (${orders.length})`, icon: ShoppingBag },
              { id: "products", label: `My Products (${products.length})`, icon: Package },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-xs sm:text-sm font-bold transition ${isActive
                    ? "bg-[#4A0D4F] text-white shadow-sm"
                    : "text-slate-600 hover:bg-purple-50 hover:text-slate-900"
                    }`}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & SALES ANALYTICS                                         */}
        {/* ========================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="rounded-2xl border border-purple-100 bg-white p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Total Earnings</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-[#4A0D4F]">
                    <DollarSign size={16} />
                  </div>
                </div>
                <p className="mt-2 text-xl sm:text-2xl font-black text-slate-900">
                  {formatRupees(analytics?.totalEarnings || 0)}
                </p>
                <p className="mt-0.5 text-[10px] sm:text-xs text-emerald-600 font-semibold">
                  From delivered orders
                </p>
              </div>

              <div className="rounded-2xl border border-purple-100 bg-white p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Total Orders</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-[#4A0D4F]">
                    <ShoppingBag size={16} />
                  </div>
                </div>
                <p className="mt-2 text-xl sm:text-2xl font-black text-slate-900">
                  {analytics?.totalOrders || orders.length}
                </p>
                <p className="mt-0.5 text-[10px] sm:text-xs text-slate-500 font-semibold">
                  {analytics?.completedOrders || 0} Delivered
                </p>
              </div>

              <div className="rounded-2xl border border-purple-100 bg-white p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Pending Dispatch</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <Clock size={16} />
                  </div>
                </div>
                <p className="mt-2 text-xl sm:text-2xl font-black text-amber-600">
                  {analytics?.pendingOrders || 0}
                </p>
                <p className="mt-0.5 text-[10px] sm:text-xs text-slate-500 font-semibold">
                  Needs packing/shipping
                </p>
              </div>

              <div className="rounded-2xl border border-purple-100 bg-white p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Active Listings</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-[#4A0D4F]">
                    <Boxes size={16} />
                  </div>
                </div>
                <p className="mt-2 text-xl sm:text-2xl font-black text-slate-900">
                  {products.length}
                </p>
                <p className="mt-0.5 text-[10px] sm:text-xs text-purple-700 font-semibold">
                  Live on marketplace
                </p>
              </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-[24px] border border-purple-100 bg-white p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Recent Customer Orders
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab("orders")}
                    className="text-xs font-bold text-[#4A0D4F] hover:underline"
                  >
                    View All Orders →
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Package size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-semibold">No orders received yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 4).map((order) => (
                      <div
                        key={order._id || order.orderId}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-[#FAF8FC] p-3.5 transition hover:border-purple-200"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#4A0D4F]">
                              #{order.orderId || order._id?.slice(-8)}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              • {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {order.items?.map((i) => `${i.title} (x${i.quantity})`).join(", ")}
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                          <span className="text-xs font-black text-slate-900">
                            {formatRupees(order.totalAmount)}
                          </span>
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10.5px] font-bold ${order.orderStatus === "Delivered"
                            ? "bg-emerald-100 text-emerald-800"
                            : order.orderStatus === "Shipped"
                              ? "bg-blue-100 text-blue-800"
                              : order.orderStatus === "Cancelled"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}>
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Vendor Quick Info */}
              <div className="rounded-[24px] border border-purple-100 bg-gradient-to-b from-[#FAF8FC] to-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[#4A0D4F] mb-2 font-bold text-xs uppercase tracking-wider">
                    <Sparkles size={15} />
                    <span>Vendor Fulfillment Guide</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mb-2">
                    5-Step Order Lifecycle
                  </h3>
                  <ol className="space-y-2 text-xs text-slate-600 leading-relaxed list-decimal list-inside">
                    <li><strong className="text-slate-800">Accept:</strong> Confirm inventory is ready.</li>
                    <li><strong className="text-slate-800">Pack:</strong> Secure package with Shivra seals.</li>
                    <li><strong className="text-slate-800">Dispatch:</strong> Handover to courier partner.</li>
                    <li><strong className="text-slate-800">Track:</strong> Add tracking ID for customer.</li>
                    <li><strong className="text-slate-800">Deliver:</strong> Earnings credited to your wallet.</li>
                  </ol>
                </div>

                <button
                  type="button"
                  onClick={openCreateModal}
                  className="mt-4 w-full rounded-full border border-purple-200 bg-white py-2.5 text-xs font-bold text-[#4A0D4F] hover:bg-purple-50 transition text-center"
                >
                  + Add New Product Listing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: INCOMING ORDERS & FULFILLMENT MANAGEMENT                           */}
        {/* ========================================================================= */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-purple-100 bg-white p-3.5 shadow-xs">
              <div className="flex items-center gap-2">
                <Filter size={15} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-700">Filter Status:</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  "All",
                  "Placed",
                  "Accepted",
                  "Packed",
                  "Ready for Dispatch",
                  "Shipped",
                  "Delivered",
                  "Cancelled",
                  "Returned",
                ].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setOrderStatusFilter(st)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${orderStatusFilter === st
                      ? "bg-[#4A0D4F] text-white"
                      : "bg-purple-50/70 text-slate-600 hover:bg-purple-100"
                      }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="rounded-[28px] border border-purple-100 bg-white py-12 text-center text-slate-400">
                <ShoppingBag size={36} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm font-bold text-slate-700">No orders matching &quot;{orderStatusFilter}&quot;</p>
                <p className="text-xs text-slate-400 mt-1">Customer orders will appear here when placed.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredOrders.map((order) => (
                  <div
                    key={order._id || order.orderId}
                    className="rounded-[24px] border border-purple-100/90 bg-white p-4 sm:p-6 shadow-xs transition hover:shadow-sm"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-purple-50">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-black text-[#4A0D4F]">
                            Order #{order.orderId || order._id?.slice(-8)}
                          </span>
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${order.orderStatus === "Delivered"
                            ? "bg-emerald-100 text-emerald-800"
                            : order.orderStatus === "Shipped"
                              ? "bg-blue-100 text-blue-800"
                              : order.orderStatus === "Cancelled"
                                ? "bg-rose-100 text-rose-800"
                                : order.orderStatus === "Returned"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-amber-100 text-amber-800"
                            }`}>
                            {order.orderStatus}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Placed on {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-sm font-black text-slate-900">
                          {formatRupees(order.totalAmount)}
                        </span>
                        <p className="text-[11px] font-semibold text-slate-500">
                          Payment: {order.paymentMethod} ({order.paymentStatus})
                        </p>
                      </div>
                    </div>

                    {/* Customer & Shipping Details */}
                    <div className="py-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 bg-[#FAF8FC] rounded-xl p-3 my-3">
                      <div>
                        <strong className="block text-slate-800 mb-0.5">Customer & Delivery:</strong>
                        <p>{order.shippingAddress?.fullName || order.customerName}</p>
                        <p>{order.shippingAddress?.address}, {order.shippingAddress?.city} - {order.shippingAddress?.postalCode}</p>
                        <p className="text-slate-500">Phone: {order.shippingAddress?.phone}</p>
                      </div>
                      <div>
                        <strong className="block text-slate-800 mb-0.5">Fulfillment & Tracking:</strong>
                        {order.courierName ? (
                          <>
                            <p>Courier: <span className="font-bold text-slate-800">{order.courierName}</span></p>
                            <p>Tracking No: <span className="font-mono font-bold text-[#4A0D4F]">{order.trackingNumber}</span></p>
                          </>
                        ) : (
                          <p className="text-slate-400 italic">No tracking info assigned yet.</p>
                        )}
                        {order.cancelReason && (
                          <p className="text-rose-600 font-bold mt-1">Cancellation Reason: {order.cancelReason}</p>
                        )}
                        {order.returnReason && (
                          <p className="text-purple-700 font-bold mt-1">Return Reason: {order.returnReason}</p>
                        )}
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-2 mb-4">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs py-1">
                          <div className="flex items-center gap-2">
                            {item.img && (
                              <img src={item.img} alt={item.title} className="h-8 w-8 object-contain rounded-md bg-purple-50" />
                            )}
                            <span className="font-bold text-slate-800">{item.title}</span>
                            <span className="text-slate-400">x {item.quantity}</span>
                          </div>
                          <span className="font-bold text-slate-700">{formatRupees(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Order Action Buttons for Vendor Progression */}
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-purple-50">
                      {order.orderStatus === "Placed" && (
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleUpdateStatus(order._id, "Accepted")}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#4A0D4F] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#380B3C] transition"
                        >
                          <CheckCircle2 size={14} />
                          <span>Accept Order</span>
                        </button>
                      )}

                      {order.orderStatus === "Accepted" && (
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleUpdateStatus(order._id, "Packed")}
                          className="inline-flex items-center gap-1.5 rounded-full bg-purple-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-800 transition"
                        >
                          <PackageCheck size={14} />
                          <span>Mark as Packed</span>
                        </button>
                      )}

                      {order.orderStatus === "Packed" && (
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleUpdateStatus(order._id, "Ready for Dispatch")}
                          className="inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition"
                        >
                          <Truck size={14} />
                          <span>Ready for Dispatch</span>
                        </button>
                      )}

                      {order.orderStatus === "Ready for Dispatch" && (
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => {
                            setDispatchOrder(order);
                            setCourierName("Delhivery Express");
                            setTrackingNumber(`SHV-${Math.floor(10000000 + Math.random() * 90000000)}`);
                            setShowDispatchModal(true);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
                        >
                          <Truck size={14} />
                          <span>Add Tracking & Mark Shipped</span>
                        </button>
                      )}

                      {order.orderStatus === "Shipped" && (
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleUpdateStatus(order._id, "Delivered")}
                          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                        >
                          <CheckCircle2 size={14} />
                          <span>Mark as Delivered</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: MY PRODUCTS / INVENTORY CATALOG                                    */}
        {/* ========================================================================= */}
        {activeTab === "products" && (
          <div className="space-y-4">
            {/* Search & Add Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-purple-100 bg-white p-3.5 shadow-xs">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search your inventory..."
                  className="w-full rounded-full border border-purple-100 bg-purple-50/30 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#B35FA3] focus:bg-white"
                />
              </div>

              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#4A0D4F] px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[#380B3C] transition"
              >
                <Plus size={15} strokeWidth={2.5} />
                <span>Add Product</span>
              </button>
            </div>

            {/* Products Grid / Table */}
            {filteredProducts.length === 0 ? (
              <div className="rounded-[28px] border border-purple-100 bg-white py-12 text-center text-slate-400">
                <Package size={36} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm font-bold text-slate-700">No products found</p>
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#4A0D4F] px-4 py-2 text-xs font-bold text-white shadow-sm"
                >
                  <Plus size={14} />
                  <span>Add First Product</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod._id}
                    className="flex flex-col justify-between rounded-2xl border border-purple-100 bg-white p-4 shadow-xs transition hover:shadow-md"
                  >
                    <div>
                      {/* Image & Badges */}
                      <div className="relative flex h-36 w-full items-center justify-center rounded-xl bg-purple-50/40 p-2 mb-3">
                        <img
                          src={prod.mainImage || (prod.images && prod.images[0])}
                          alt={prod.title}
                          className="h-full w-full object-contain drop-shadow-xs"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                        <span className="absolute top-2 right-2 rounded-full bg-white/90 border border-purple-100 px-2 py-0.5 text-[10px] font-bold text-[#4A0D4F]">
                          Stock: {prod.stock}
                        </span>
                      </div>

                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#B35FA3]">
                        {prod.categoryName}
                      </span>
                      <h4 className="line-clamp-2 text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                        {prod.title}
                      </h4>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm font-black text-slate-900">
                          {formatRupees(prod.price)}
                        </span>
                        {prod.mrp && (
                          <span className="text-xs text-slate-400 line-through">
                            {formatRupees(prod.mrp)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between border-t border-purple-50 pt-3 mt-3">
                      <Link
                        to={`/product/${prod.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-[#4A0D4F]"
                      >
                        <Eye size={13} />
                        <span>View Store Page</span>
                      </Link>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setQuickUploadProduct(prod)}
                          className="flex h-7 items-center gap-1 px-2 rounded-lg border border-purple-200 bg-purple-50/60 text-[11px] font-bold text-[#4A0D4F] hover:bg-purple-100 transition"
                          title="Upload more images to this product"
                        >
                          <ImagePlus size={13} />
                          <span className="hidden sm:inline">Upload</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(prod)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-purple-200 text-slate-600 hover:bg-purple-50 hover:text-[#4A0D4F] transition"
                          title="Edit Product"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(prod._id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 transition"
                          title="Delete Product"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT PRODUCT                                               */}
      {/* ========================================================================= */}
      {showProductModal && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative my-auto max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-purple-200 bg-white p-5 shadow-2xl sm:p-7">
            <button
              type="button"
              onClick={() => setShowProductModal(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-slate-500 hover:bg-purple-100"
            >
              <X size={18} />
            </button>

            <h3 className="text-xl font-black text-slate-900 mb-1">
              {editingProduct ? "Edit Product Listing" : "Add New Gadget Listing"}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Fill in product details, pricing, inventory stock, and media images.
            </p>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  placeholder="e.g. Aura Studio Wireless ANC Headphones"
                  className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[#B35FA3] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Brand *</label>
                  <input
                    type="text"
                    required
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    placeholder="e.g. Shivra"
                    className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[#B35FA3] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subcategory *</label>
                  <input
                    type="text"
                    required
                    value={productForm.subcategory}
                    onChange={(e) => setProductForm({ ...productForm, subcategory: e.target.value })}
                    placeholder="e.g. Wireless Headphones"
                    className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[#B35FA3] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    placeholder="e.g. SH-AUD-001"
                    className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[#B35FA3] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Selling Price (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="18999"
                    className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[#B35FA3] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    MRP (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={productForm.mrp}
                    onChange={(e) => setProductForm({ ...productForm, mrp: e.target.value })}
                    placeholder="22999"
                    className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[#B35FA3] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={productForm.categorySlug}
                    onChange={(e) => {
                      const slug = e.target.value;
                      const names = {
                        audio: "Audio",
                        "mobile-accessories": "Mobile Accessories",
                        "pc-accessories": "PC Accessories",
                        "car-accessories": "Car Accessories",
                        lifestyle: "Lifestyle",
                      };
                      setProductForm({
                        ...productForm,
                        categorySlug: slug,
                        categoryName: names[slug] || "Audio",
                      });
                    }}
                    className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[#B35FA3] focus:bg-white"
                  >
                    <option value="audio">Audio</option>
                    <option value="mobile-accessories">Mobile Accessories</option>
                    <option value="pc-accessories">PC Accessories</option>
                    <option value="car-accessories">Car Accessories</option>
                    <option value="lifestyle">Lifestyle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[#B35FA3] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Weight *</label>
                  <input
                    type="text"
                    required
                    value={productForm.weight}
                    onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })}
                    placeholder="e.g. 350 g"
                    className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[#B35FA3] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Warranty *</label>
                  <input
                    type="text"
                    required
                    value={productForm.warranty}
                    onChange={(e) => setProductForm({ ...productForm, warranty: e.target.value })}
                    placeholder="e.g. 1 year manufacturer warranty"
                    className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[#B35FA3] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Return Policy *</label>
                  <input
                    type="text"
                    required
                    value={productForm.returnPolicy}
                    onChange={(e) => setProductForm({ ...productForm, returnPolicy: e.target.value })}
                    placeholder="e.g. 7-day replacement"
                    className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[#B35FA3] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Key Specifications *</label>
                <textarea
                  required
                  rows={3}
                  value={productForm.spec}
                  onChange={(e) => setProductForm({ ...productForm, spec: e.target.value })}
                  placeholder="List the key product specifications"
                  className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[#B35FA3] focus:bg-white"
                />
              </div>

              {/* Product Images: Direct File Upload & URL Previews */}
              <div className="space-y-2.5 rounded-2xl border border-purple-100 bg-[#FAF8FC] p-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                    <UploadCloud size={16} className="text-[#4A0D4F]" />
                    <span>Main Image and Gallery Images *</span>
                  </label>
                  <span className="text-[11px] font-semibold text-[#B35FA3]">
                    Main image plus at least 2 gallery images
                  </span>
                </div>

                {/* Hidden Native File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileUpload}
                  multiple
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                  className="hidden"
                />

                {/* Interactive Drag & Drop Upload Zone */}
                <div
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition cursor-pointer ${isDraggingOver
                    ? "border-[#4A0D4F] bg-purple-100 scale-[1.01] shadow-md"
                    : "border-purple-300 bg-white hover:border-[#4A0D4F] hover:bg-purple-50/40"
                    }`}
                >
                  {isUploadingImage ? (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <Loader2 size={28} className="animate-spin text-[#4A0D4F]" />
                      <p className="text-xs font-bold text-slate-800">
                        Uploading image(s) to server...
                      </p>
                      <p className="text-[10.5px] text-slate-400">Processing media file</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-[#4A0D4F] shadow-xs transition group-hover:scale-110 group-hover:bg-[#4A0D4F] group-hover:text-white">
                        <UploadCloud size={24} />
                      </div>
                      <div className="mt-1">
                        <span className="text-xs font-black text-[#4A0D4F] underline">
                          Click to browse device
                        </span>
                        <span className="text-xs text-slate-600"> or drag & drop files here</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Supports PNG, JPG, JPEG, WEBP, SVG • Select multiple files
                      </p>
                    </div>
                  )}
                </div>

                {/* Uploaded Images Gallery with Cover selector & Delete */}
                {productForm.images && productForm.images.trim() && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                      <span>Uploaded Product Media:</span>
                      <span className="text-slate-400">
                        {Math.max(0, productForm.images.split(",").filter((s) => s.trim()).length - 1)} gallery image(s), 2 required
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      {productForm.images
                        .split(",")
                        .map((url) => url.trim())
                        .filter(Boolean)
                        .map((imgUrl, idx) => (
                          <div
                            key={idx}
                            className="group relative h-20 w-20 rounded-xl border-2 border-purple-200 bg-white p-1 shadow-xs flex-shrink-0 transition hover:border-[#4A0D4F]"
                          >
                            <img
                              src={imgUrl}
                              alt={`Product preview ${idx + 1}`}
                              className="h-full w-full object-contain rounded-lg"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImageAtIndex(idx);
                              }}
                              className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white shadow-md transition hover:scale-110"
                              title="Delete image"
                            >
                              <X size={12} strokeWidth={3} />
                            </button>

                            {/* Main Cover Badge / Button */}
                            {idx === 0 ? (
                              <span className="absolute bottom-0 inset-x-0 bg-gradient-to-r from-[#4A0D4F] to-[#B35FA3] text-[9px] font-bold text-white text-center py-0.5 rounded-b-lg">
                                Main Image
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPrimaryImage(idx);
                                }}
                                className="absolute bottom-0 inset-x-0 bg-slate-800/90 text-[8.5px] font-bold text-white text-center py-0.5 rounded-b-lg opacity-0 group-hover:opacity-100 transition"
                                title="Make cover image"
                              >
                                Set Cover
                              </button>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Optional Manual URL Fallback */}
                <div className="pt-1">
                  <label className="block text-[10.5px] font-bold text-slate-500 mb-1">
                    Paste image URLs in order: main image first, then gallery images (comma separated)
                  </label>
                  <input
                    type="text"
                    value={productForm.images}
                    onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                    placeholder="https://images.unsplash.com/... or relative image path"
                    className="w-full rounded-xl border border-purple-200/80 bg-white px-3.5 py-2 text-xs outline-none focus:border-[#B35FA3] text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Short Description *</label>
                <textarea
                  required
                  rows={2}
                  value={productForm.shortDescription}
                  onChange={(e) => setProductForm({ ...productForm, shortDescription: e.target.value })}
                  placeholder="A concise summary for product listings"
                  className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[#B35FA3] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Describe product features, materials, compatibility, and usage..."
                  className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[#B35FA3] focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isFeatured}
                    onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                    className="rounded text-[#4A0D4F]"
                  />
                  <span>Featured Product</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isFlashSale}
                    onChange={(e) => setProductForm({ ...productForm, isFlashSale: e.target.checked })}
                    className="rounded text-[#4A0D4F]"
                  />
                  <span>Flash Sale Product</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-purple-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="rounded-full px-5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-full bg-[#4A0D4F] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#380B3C] transition disabled:opacity-50"
                >
                  {actionLoading ? "Saving..." : editingProduct ? "Update Product" : "Publish Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: QUICK IMAGE UPLOAD FOR EXISTING PRODUCT                          */}
      {/* ========================================================================= */}
      {quickUploadProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-[28px] border border-purple-200 bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setQuickUploadProduct(null)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-slate-500 hover:bg-purple-100"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 text-[#4A0D4F] mb-1.5 font-bold text-xs uppercase tracking-wider">
              <ImagePlus size={16} />
              <span>Quick Image Uploader</span>
            </div>

            <h3 className="text-base font-black text-slate-900 line-clamp-1 mb-1">
              {quickUploadProduct.title}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Select product photos to instantly attach and update this catalog listing.
            </p>

            <input
              type="file"
              ref={quickFileInputRef}
              onChange={handleQuickUpload}
              multiple
              accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
              className="hidden"
            />

            <div
              onClick={() => quickFileInputRef.current && quickFileInputRef.current.click()}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-purple-300 bg-purple-50/30 p-6 text-center cursor-pointer hover:border-[#4A0D4F] hover:bg-purple-50/60 transition"
            >
              {isUploadingImage ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <Loader2 size={28} className="animate-spin text-[#4A0D4F]" />
                  <p className="text-xs font-bold text-slate-800">Uploading & Saving...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-[#4A0D4F]">
                    <UploadCloud size={24} />
                  </div>
                  <div>
                    <span className="text-xs font-black text-[#4A0D4F] underline">
                      Choose Photos from Device
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-400">PNG, JPG, WEBP, SVG</p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setQuickUploadProduct(null)}
                className="rounded-full px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: DISPATCH & TRACKING INFO                                         */}
      {/* ========================================================================= */}
      {showDispatchModal && dispatchOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-[28px] border border-purple-200 bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowDispatchModal(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-slate-500 hover:bg-purple-100"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 text-[#4A0D4F] mb-2 font-bold text-xs uppercase tracking-wider">
              <Truck size={18} />
              <span>Courier Dispatch</span>
            </div>

            <h3 className="text-lg font-black text-slate-900 mb-1">
              Dispatch Order #{dispatchOrder.orderId || dispatchOrder._id?.slice(-8)}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter shipping courier details so the customer can track the delivery.
            </p>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Courier Partner Name
                </label>
                <input
                  type="text"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="e.g. BlueDart, Delhivery, Shadowfax"
                  className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2 text-xs outline-none focus:border-[#B35FA3] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tracking Waybill / ID
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. DEL789123049"
                  className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2 text-xs font-mono outline-none focus:border-[#B35FA3] focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="rounded-full px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() =>
                    handleUpdateStatus(dispatchOrder._id, "Shipped", {
                      courierName,
                      trackingNumber,
                    })
                  }
                  className="rounded-full bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
                >
                  {actionLoading ? "Processing..." : "Confirm & Mark Shipped"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VendorDashboard;
