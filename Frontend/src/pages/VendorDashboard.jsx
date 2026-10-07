import React, { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Ban,
  Boxes,
  Building,
  Check,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
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
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Trash2,
  TrendingUp,
  Truck,
  UploadCloud,
  X,
  Copy,
  TicketPercent,
  Tag,
  Percent,
  LifeBuoy,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useCategories from "../hooks/useCategories";
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
  apiGetVendorCoupons,
  apiCreateVendorCoupon,
  apiUpdateVendorCoupon,
  apiDeleteVendorCoupon,
  apiToggleVendorCoupon,
  apiCreateTicket,
  apiGetMyTickets,
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
  const { user, isVendor, isAuthenticated, loading: authLoading, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { categories, error: categoriesError } = useCategories();

  // Vendor Approval & Store Status flags
  const isApproved =
    user?.vendorStatus === "approved" ||
    user?.storeStatus === "active" ||
    (user?.isVerifiedSeller && user?.vendorStatus !== "suspended" && user?.vendorStatus !== "rejected");
  const isPending =
    user?.vendorStatus === "pending" ||
    user?.storeStatus === "pending_approval" ||
    (!user?.vendorStatus && !user?.isVerifiedSeller);
  const isSuspended = user?.vendorStatus === "suspended" || user?.storeStatus === "suspended";
  const isRejected = user?.vendorStatus === "rejected" || user?.storeStatus === "rejected";

  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'orders', 'products', 'verification'
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef(null);

  // KYC & Document Verification State
  const [kycForm, setKycForm] = useState({
    businessType: user?.businessType || "Individual / Sole Proprietor",
    storeName: user?.storeName || "",
    phone: user?.phone || "",
    businessAddress: user?.businessAddress || "",
    gstNumber: user?.gstNumber || "",
    panNumber: user?.panNumber || "",
    businessDocUrl: user?.businessDocUrl || "",
    idProofUrl: user?.idProofUrl || "",
  });
  const [savingKyc, setSavingKyc] = useState(false);
  const [uploadingDocType, setUploadingDocType] = useState("");

  useEffect(() => {
    if (user) {
      setKycForm({
        businessType: user.businessType || "Individual / Sole Proprietor",
        storeName: user.storeName || "",
        phone: user.phone || "",
        businessAddress: user.businessAddress || "",
        gstNumber: user.gstNumber || "",
        panNumber: user.panNumber || "",
        businessDocUrl: user.businessDocUrl || "",
        idProofUrl: user.idProofUrl || "",
      });
    }
  }, [user]);

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

  // Vendor Coupons State
  const [vendorCoupons, setVendorCoupons] = useState([]);
  const [vendorCouponStats, setVendorCouponStats] = useState({
    totalCount: 0,
    activeCount: 0,
    expiredCount: 0,
    totalRedemptions: 0,
  });
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [savingCoupon, setSavingCoupon] = useState(false);
  const [couponSearch, setCouponSearch] = useState("");
  const [couponStatusFilter, setCouponStatusFilter] = useState("all");
  const [couponForm, setCouponForm] = useState({
    code: "",
    title: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    maxDiscountAmount: "",
    minOrderAmount: "",
    startDate: new Date().toISOString().split("T")[0],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    usageLimit: 100,
    perUserLimit: 1,
    status: "active",
  });

  // Support & Dispute State
  const [vendorTickets, setVendorTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicketDetail, setSelectedTicketDetail] = useState(null);
  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketStatusFilter, setTicketStatusFilter] = useState("all");
  const [ticketCategoryFilter, setTicketCategoryFilter] = useState("all");
  const [ticketForm, setTicketForm] = useState({
    category: "payment",
    priority: "medium",
    subject: "",
    description: "",
    orderId: "",
    paymentId: "",
  });
  const [submittingTicket, setSubmittingTicket] = useState(false);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isVendor)) {
      navigate("/login");
    }
  }, [isAuthenticated, isVendor, authLoading, navigate]);

  const fetchVendorData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, ordersRes, productsRes, couponsRes, ticketsRes] = await Promise.all([
        apiGetSellerAnalytics().catch(() => ({ data: null })),
        apiGetSellerOrders().catch(() => ({ data: [] })),
        apiGetSellerProducts().catch(() => ({ data: [] })),
        apiGetVendorCoupons().catch(() => ({ data: { coupons: [], stats: {} } })),
        apiGetMyTickets().catch(() => ({ data: [] })),
      ]);

      if (analyticsRes?.data) setAnalytics(analyticsRes.data);
      if (ordersRes?.data) setOrders(ordersRes.data);
      if (productsRes?.data) setProducts(productsRes.data);
      if (couponsRes?.data?.coupons) {
        setVendorCoupons(couponsRes.data.coupons);
        if (couponsRes.data.stats) setVendorCouponStats(couponsRes.data.stats);
      }
      if (ticketsRes?.data) {
        setVendorTickets(ticketsRes.data);
      }
    } catch (err) {
      console.error("[VendorDashboard Error]", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
      setTicketsLoading(true);
      const res = await apiGetMyTickets();
      if (res?.data) {
        setVendorTickets(res.data);
      }
    } catch (err) {
      console.error("[Vendor Tickets Error]", err);
    } finally {
      setTicketsLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!ticketForm.subject.trim() || !ticketForm.description.trim()) {
      alert("Please provide both a subject and detailed description.");
      return;
    }
    setSubmittingTicket(true);
    try {
      await apiCreateTicket({
        category: ticketForm.category,
        priority: ticketForm.priority,
        subject: ticketForm.subject.trim(),
        description: ticketForm.description.trim(),
        orderId: ticketForm.orderId.trim(),
        paymentId: ticketForm.paymentId.trim(),
        name: user?.storeName || user?.name || "Vendor",
        email: user?.email,
        phone: user?.phone || "",
      });
      triggerNotification("Support ticket submitted to ShivraTech Admin!");
      setShowTicketModal(false);
      setTicketForm({
        category: "payment",
        priority: "medium",
        subject: "",
        description: "",
        orderId: "",
        paymentId: "",
      });
      fetchTickets();
    } catch (err) {
      alert(err.message || "Failed to submit ticket.");
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleOpenCreateCoupon = () => {
    setEditingCoupon(null);
    setCouponForm({
      code: "",
      title: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      maxDiscountAmount: "",
      minOrderAmount: "",
      startDate: new Date().toISOString().split("T")[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      usageLimit: 100,
      perUserLimit: 1,
      status: "active",
    });
    setShowCouponModal(true);
  };

  const handleOpenEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setCouponForm({
      code: coupon.code,
      title: coupon.title || "",
      description: coupon.description || "",
      discountType: coupon.discountType || "percentage",
      discountValue: coupon.discountValue,
      maxDiscountAmount: coupon.maxDiscountAmount || "",
      minOrderAmount: coupon.minOrderAmount || "",
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split("T")[0] : "",
      usageLimit: coupon.usageLimit || 100,
      perUserLimit: coupon.perUserLimit || 1,
      status: coupon.status || "active",
    });
    setShowCouponModal(true);
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    if (!couponForm.code.trim()) {
      alert("Coupon code is required");
      return;
    }
    if (!couponForm.discountValue || Number(couponForm.discountValue) <= 0) {
      alert("Please provide a valid discount value");
      return;
    }
    if (!couponForm.expiryDate) {
      alert("Expiry date is required");
      return;
    }

    setSavingCoupon(true);
    try {
      const payload = {
        ...couponForm,
        code: couponForm.code.trim().toUpperCase(),
        discountValue: Number(couponForm.discountValue),
        maxDiscountAmount: Number(couponForm.maxDiscountAmount || 0),
        minOrderAmount: Number(couponForm.minOrderAmount || 0),
        usageLimit: Number(couponForm.usageLimit || 100),
        perUserLimit: Number(couponForm.perUserLimit || 1),
      };

      if (editingCoupon) {
        const res = await apiUpdateVendorCoupon(editingCoupon._id, payload);
        setVendorCoupons((prev) =>
          prev.map((c) => (c._id === editingCoupon._id ? res.data : c))
        );
        triggerNotification(`Coupon "${payload.code}" updated successfully!`);
      } else {
        const res = await apiCreateVendorCoupon(payload);
        setVendorCoupons((prev) => [res.data, ...prev]);
        setVendorCouponStats((prev) => ({
          ...prev,
          totalCount: prev.totalCount + 1,
          activeCount: prev.activeCount + 1,
        }));
        triggerNotification(`Coupon "${payload.code}" created successfully!`);
      }
      setShowCouponModal(false);
    } catch (err) {
      alert(err.message || "Failed to save coupon");
    } finally {
      setSavingCoupon(false);
    }
  };

  const handleToggleCoupon = async (couponId) => {
    try {
      const res = await apiToggleVendorCoupon(couponId);
      setVendorCoupons((prev) =>
        prev.map((c) => (c._id === couponId ? res.data : c))
      );
      triggerNotification(`Coupon marked ${res.data.status}`);
    } catch (err) {
      alert(err.message || "Failed to toggle coupon status");
    }
  };

  const handleDeleteCoupon = async (couponId, code) => {
    if (!window.confirm(`Are you sure you want to delete coupon "${code}"?`)) {
      return;
    }
    try {
      await apiDeleteVendorCoupon(couponId);
      setVendorCoupons((prev) => prev.filter((c) => c._id !== couponId));
      setVendorCouponStats((prev) => ({
        ...prev,
        totalCount: Math.max(0, prev.totalCount - 1),
      }));
      triggerNotification(`Coupon "${code}" deleted successfully`);
    } catch (err) {
      alert(err.message || "Failed to delete coupon");
    }
  };

  const handleCopyCouponCode = (code) => {
    navigator.clipboard.writeText(code);
    triggerNotification(`Coupon code "${code}" copied to clipboard!`);
  };

  useEffect(() => {
    if (isAuthenticated && isVendor) {
      fetchVendorData();
    }
  }, [isAuthenticated, isVendor]);

  useEffect(() => {
    if (
      categories.length > 0 &&
      !editingProduct &&
      !categories.some((category) => category.slug === productForm.categorySlug)
    ) {
      setProductForm((prev) => ({
        ...prev,
        categorySlug: categories[0].slug,
        categoryName: categories[0].name,
      }));
    }
  }, [categories, editingProduct, productForm.categorySlug]);

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
    if (!isApproved) {
      alert(
        isSuspended
          ? `Your vendor store is suspended (${user?.suspensionReason || "Contact administration"}). You cannot edit products.`
          : "Your vendor store is not approved. Products cannot be edited until your store is active."
      );
      return;
    }
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

  const handleUploadKycDoc = async (file, fieldName) => {
    if (!file) return;
    setUploadingDocType(fieldName);
    try {
      const res = await apiUploadImage(file);
      if (res.data?.url) {
        setKycForm((prev) => ({ ...prev, [fieldName]: res.data.url }));
        triggerNotification("Document uploaded successfully! Click save to submit for verification.");
      }
    } catch (err) {
      alert(err.message || "Failed to upload document");
    } finally {
      setUploadingDocType("");
    }
  };

  const handleSaveKyc = async (e) => {
    e.preventDefault();
    setSavingKyc(true);
    try {
      await updateProfile({
        ...kycForm,
        resubmitVerification: true,
      });
      triggerNotification("Store details & KYC documents submitted for Admin approval!");
    } catch (err) {
      alert(err.message || "Failed to update KYC documents");
    } finally {
      setSavingKyc(false);
    }
  };

  const openCreateModal = () => {
    if (!isApproved) {
      alert(
        isSuspended
          ? `Your vendor store is currently suspended: ${user?.suspensionReason || "Contact administration."}`
          : isRejected
          ? `Your vendor application was rejected: ${user?.rejectionReason || "Please update your documents in the Store & KYC Docs tab."}`
          : "Your vendor store is pending admin approval. You can create products once verified by administration."
      );
      return;
    }
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
      categorySlug: categories[0]?.slug || "audio",
      categoryName: categories[0]?.name || "Audio",
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
                  {isApproved && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-700">
                      <ShieldCheck size={12} />
                      <span>Active & Verified Store</span>
                    </span>
                  )}
                  {isPending && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10.5px] font-bold text-amber-700">
                      <Clock size={12} />
                      <span>Pending Admin Approval</span>
                    </span>
                  )}
                  {isRejected && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[10.5px] font-bold text-rose-700">
                      <X size={12} />
                      <span>Application Rejected</span>
                    </span>
                  )}
                  {isSuspended && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-300 px-2.5 py-0.5 text-[10.5px] font-bold text-slate-700">
                      <Ban size={12} />
                      <span>Store Suspended</span>
                    </span>
                  )}
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
                disabled={!isApproved}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition ${
                  isApproved
                    ? "bg-[#4A0D4F] hover:bg-[#380B3C] active:scale-95"
                    : "bg-slate-400 cursor-not-allowed opacity-70"
                }`}
                title={
                  !isApproved
                    ? isSuspended
                      ? "Store is suspended — cannot upload products"
                      : "Store is pending approval — cannot upload products"
                    : "Add New Product"
                }
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
              <button
                type="button"
                onClick={handleOpenCreateCoupon}
                disabled={!isApproved}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#B35FA3]/30 bg-purple-50 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#4A0D4F] hover:bg-purple-100 transition disabled:opacity-50"
                title="Create Store Promotional Coupon"
              >
                <TicketPercent size={15} />
                <span>+ Promo Coupon</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-6 flex gap-2 border-t border-purple-100 pt-4 overflow-x-auto scrollbar-none">
            {[
              { id: "overview", label: "Overview & Analytics", icon: TrendingUp },
              { id: "orders", label: `Customer Orders (${orders.length})`, icon: ShoppingBag },
              { id: "products", label: `My Products (${products.length})`, icon: Package },
              { id: "coupons", label: `Store Coupons (${vendorCoupons.length})`, icon: TicketPercent },
              { id: "verification", label: "Store Status & KYC Docs", icon: ShieldCheck },
              { id: "disputes", label: `Support & Disputes (${vendorTickets.length})`, icon: LifeBuoy },
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

        {/* Store Approval Status Alerts */}
        {isPending && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 shadow-xs">
            <div className="flex items-start gap-3">
              <Clock size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs sm:text-sm font-bold">Store Verification Pending Admin Review</div>
                <p className="text-xs text-amber-700 mt-0.5">
                  Your vendor registration and business documents are being reviewed by ShivraTech Administration. You will be able to sell products once approved.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("verification")}
              className="whitespace-nowrap rounded-full bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition"
            >
              Review / Update KYC Docs
            </button>
          </div>
        )}

        {isRejected && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs sm:text-sm font-bold">Vendor Application Rejected</div>
                <p className="text-xs text-rose-700 mt-0.5">
                  Reason: {user?.rejectionReason || "Submitted verification documents could not be verified."} Please update your documents to re-submit.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("verification")}
              className="whitespace-nowrap rounded-full bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition"
            >
              Re-submit Documents
            </button>
          </div>
        )}

        {isSuspended && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-slate-700 bg-slate-900 p-4 text-white shadow-xs">
            <Ban size={20} className="text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs sm:text-sm font-bold">Store Suspended by Administration</div>
              <p className="text-xs text-slate-300 mt-0.5">
                Reason: {user?.suspensionReason || "Suspended by administration."} Contact admin support at admin@shivratech.com for reactivation.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & SALES ANALYTICS                                         */}
        {/* ========================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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

        {/* ========================================================================= */}
        {/* TAB 3.5: STORE COUPONS & PROMOTIONAL OFFERS                               */}
        {/* ========================================================================= */}
        {activeTab === "coupons" && (
          <div className="space-y-6">
            {/* Header / Intro Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[28px] border border-purple-200/80 bg-white p-6 sm:p-8 shadow-xs">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#B35FA3]">
                  Promotions & Deals
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  Store Coupons & Offers
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                  Create exclusive discount codes valid specifically on items from your store. Customers can apply them at checkout to receive immediate savings.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenCreateCoupon}
                disabled={!isApproved}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#4A0D4F] px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition hover:bg-[#380B3C] active:scale-95 disabled:opacity-50 flex-shrink-0"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Create Store Coupon</span>
              </button>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="rounded-2xl border border-purple-100 bg-white p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Total Coupons</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-[#4A0D4F]">
                    <TicketPercent size={16} />
                  </div>
                </div>
                <p className="mt-2 text-xl sm:text-2xl font-black text-slate-900">
                  {vendorCouponStats.totalCount}
                </p>
                <p className="mt-0.5 text-[10px] sm:text-xs text-slate-400 font-semibold">
                  Created by your store
                </p>
              </div>

              <div className="rounded-2xl border border-purple-100 bg-white p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Active Offers</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <CheckCircle2 size={16} />
                  </div>
                </div>
                <p className="mt-2 text-xl sm:text-2xl font-black text-emerald-600">
                  {vendorCouponStats.activeCount}
                </p>
                <p className="mt-0.5 text-[10px] sm:text-xs text-emerald-600 font-semibold">
                  Valid & claimable right now
                </p>
              </div>

              <div className="rounded-2xl border border-purple-100 bg-white p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Expired Coupons</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                    <Clock size={16} />
                  </div>
                </div>
                <p className="mt-2 text-xl sm:text-2xl font-black text-rose-600">
                  {vendorCouponStats.expiredCount}
                </p>
                <p className="mt-0.5 text-[10px] sm:text-xs text-rose-500 font-semibold">
                  Past validity deadline
                </p>
              </div>

              <div className="rounded-2xl border border-purple-100 bg-white p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Total Redemptions</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                    <Sparkles size={16} />
                  </div>
                </div>
                <p className="mt-2 text-xl sm:text-2xl font-black text-indigo-600">
                  {vendorCouponStats.totalRedemptions}
                </p>
                <p className="mt-0.5 text-[10px] sm:text-xs text-indigo-500 font-semibold">
                  Orders used with discount
                </p>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="rounded-[24px] border border-purple-100 bg-white p-4 shadow-xs">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={couponSearch}
                    onChange={(e) => setCouponSearch(e.target.value)}
                    placeholder="Search by code (e.g. SUMMER20) or headline..."
                    className="w-full rounded-xl border border-purple-100 bg-purple-50/20 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#B35FA3] focus:bg-white"
                  />
                  {couponSearch && (
                    <button
                      type="button"
                      onClick={() => setCouponSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={couponStatusFilter}
                    onChange={(e) => setCouponStatusFilter(e.target.value)}
                    className="rounded-xl border border-purple-100 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-[#B35FA3] cursor-pointer"
                  >
                    <option value="all">All Coupons</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                    <option value="expired">Expired Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Coupons List / Grid */}
            {(() => {
              const filteredCoupons = vendorCoupons.filter((c) => {
                const matchesSearch =
                  !couponSearch ||
                  c.code.toLowerCase().includes(couponSearch.toLowerCase()) ||
                  (c.title && c.title.toLowerCase().includes(couponSearch.toLowerCase())) ||
                  (c.description && c.description.toLowerCase().includes(couponSearch.toLowerCase()));
                const isExp = c.expiryDate && new Date(c.expiryDate) < new Date();
                if (couponStatusFilter === "active") return matchesSearch && c.status === "active" && !isExp;
                if (couponStatusFilter === "inactive") return matchesSearch && c.status === "inactive";
                if (couponStatusFilter === "expired") return matchesSearch && isExp;
                return matchesSearch;
              });

              if (filteredCoupons.length === 0) {
                return (
                  <div className="rounded-[28px] border border-dashed border-purple-200 bg-white p-12 text-center shadow-xs">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-[#4A0D4F]">
                      <TicketPercent size={28} />
                    </div>
                    <h3 className="mt-4 text-base font-black text-slate-900">
                      {couponSearch || couponStatusFilter !== "all"
                        ? "No coupons match your filter"
                        : "No Store Coupons Created Yet"}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
                      {couponSearch || couponStatusFilter !== "all"
                        ? "Try adjusting your search criteria or resetting the status filter."
                        : "Create exclusive promotional discounts to attract more shoppers to your products and increase sales conversion rates."}
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenCreateCoupon}
                      disabled={!isApproved}
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#4A0D4F] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#380B3C] transition disabled:opacity-50"
                    >
                      <Plus size={15} />
                      <span>Create Your First Coupon</span>
                    </button>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCoupons.map((coupon) => {
                    const isExp = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
                    const percentUsed = coupon.usageLimit
                      ? Math.min(100, Math.round(((coupon.usageCount || 0) / coupon.usageLimit) * 100))
                      : 0;

                    return (
                      <div
                        key={coupon._id}
                        className={`group relative flex flex-col justify-between rounded-[24px] border transition-all duration-200 p-5 bg-white shadow-xs hover:shadow-md ${
                          isExp
                            ? "border-rose-100 bg-rose-50/10"
                            : coupon.status === "active"
                            ? "border-purple-100 hover:border-purple-300"
                            : "border-slate-200 opacity-80"
                        }`}
                      >
                        <div>
                          {/* Top Badges */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100/80 px-2.5 py-1 text-[11px] font-extrabold text-[#4A0D4F]">
                              <Store size={12} />
                              <span>Store Special</span>
                            </span>

                            {isExp ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[10.5px] font-bold text-rose-700">
                                <Clock size={11} />
                                <span>Expired</span>
                              </span>
                            ) : coupon.status === "active" ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Active</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-300 px-2.5 py-0.5 text-[10.5px] font-bold text-slate-600">
                                <span>Inactive</span>
                              </span>
                            )}
                          </div>

                          {/* Code Pill & Copy Button */}
                          <div className="flex items-center justify-between rounded-xl border border-dashed border-purple-300 bg-purple-50/40 px-3.5 py-2">
                            <div className="flex items-center gap-2">
                              <TicketPercent size={16} className="text-[#4A0D4F]" />
                              <span className="font-mono text-sm sm:text-base font-black tracking-wider text-[#4A0D4F]">
                                {coupon.code}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopyCouponCode(coupon.code)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-500 shadow-xs hover:text-[#4A0D4F] transition"
                              title="Copy code"
                            >
                              <Copy size={13} />
                            </button>
                          </div>

                          {/* Value & Discount summary */}
                          <div className="mt-3.5">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl font-black text-slate-900">
                                {coupon.discountType === "percentage"
                                  ? `${coupon.discountValue}% OFF`
                                  : `₹${coupon.discountValue} OFF`}
                              </span>
                              {coupon.discountType === "percentage" && coupon.maxDiscountAmount > 0 && (
                                <span className="text-xs font-semibold text-slate-500">
                                  (up to ₹{coupon.maxDiscountAmount})
                                </span>
                              )}
                            </div>

                            <h4 className="mt-1 text-xs font-bold text-slate-700 line-clamp-1">
                              {coupon.title || coupon.code}
                            </h4>
                            {coupon.description && (
                              <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-2">
                                {coupon.description}
                              </p>
                            )}
                          </div>

                          {/* Conditions & Details */}
                          <div className="mt-4 space-y-1.5 border-t border-purple-50 pt-3 text-[11px] text-slate-600">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Min. Cart Value:</span>
                              <span className="font-semibold text-slate-800">
                                {coupon.minOrderAmount > 0 ? `₹${coupon.minOrderAmount}` : "None (₹0)"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Valid Until:</span>
                              <span className="font-semibold text-slate-800">
                                {coupon.expiryDate
                                  ? new Date(coupon.expiryDate).toLocaleDateString("en-IN", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "Indefinite"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Per User Cap:</span>
                              <span className="font-semibold text-slate-800">
                                {coupon.perUserLimit || 1}x per customer
                              </span>
                            </div>
                          </div>

                          {/* Redemptions progress */}
                          <div className="mt-3.5">
                            <div className="flex items-center justify-between text-[10.5px] font-bold text-slate-500 mb-1">
                              <span>Redemptions</span>
                              <span>
                                {coupon.usageCount || 0} / {coupon.usageLimit || "∞"} used
                              </span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  percentUsed >= 90
                                    ? "bg-rose-500"
                                    : percentUsed >= 60
                                    ? "bg-amber-500"
                                    : "bg-[#B35FA3]"
                                }`}
                                style={{ width: `${percentUsed}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Bottom Actions Bar */}
                        <div className="mt-5 flex items-center justify-between border-t border-purple-50 pt-3">
                          <button
                            type="button"
                            onClick={() => handleToggleCoupon(coupon._id)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                              coupon.status === "active"
                                ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >
                            <span>{coupon.status === "active" ? "Deactivate" : "Activate"}</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditCoupon(coupon)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-200 text-slate-600 hover:bg-purple-50 hover:text-[#4A0D4F] transition"
                              title="Edit Coupon"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCoupon(coupon._id, coupon.code)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 transition"
                              title="Delete Coupon"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: STORE STATUS & KYC VERIFICATION DOCUMENTS                          */}
        {/* ========================================================================= */}
        {activeTab === "verification" && (
          <div className="space-y-6">
            {/* Status Overview Card */}
            <div className="rounded-[28px] border border-purple-200/80 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100 pb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#B35FA3]">
                    Official Store Status
                  </span>
                  <div className="mt-1 flex items-center gap-3 flex-wrap">
                    <h2 className="text-2xl font-black text-slate-900">
                      {user?.storeName || user?.name || "Your Store"}
                    </h2>
                    {isApproved && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                        <ShieldCheck size={14} />
                        <span>Active & Approved Store</span>
                      </span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700">
                        <Clock size={14} />
                        <span>Under Admin Review</span>
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-bold text-rose-700">
                        <X size={14} />
                        <span>Application Rejected</span>
                      </span>
                    )}
                    {isSuspended && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-300 px-3 py-1 text-xs font-bold text-slate-700">
                        <Ban size={14} />
                        <span>Store Suspended</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">
                    KYC Status:{" "}
                    <strong className="text-slate-800">
                      {user?.documentVerificationStatus === "verified"
                        ? "Verified ✓"
                        : user?.documentVerificationStatus === "rejected"
                        ? "Action Needed ⚠"
                        : "Pending Verification"}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Status Details / Feedback Notice */}
              <div className="mt-6">
                {isApproved && (
                  <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200/80 p-4 text-xs text-emerald-900 flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Your store is verified!</strong> Your business documents have been approved by ShivraTech Administration. You are authorized to list gadgets, receive customer orders, and manage inventory.
                    </div>
                  </div>
                )}

                {isPending && (
                  <div className="rounded-2xl bg-amber-50/70 border border-amber-200/80 p-4 text-xs text-amber-900 flex items-start gap-3">
                    <Clock size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Awaiting Admin Review:</strong> Your vendor registration is in the review queue. ShivraTech administrators review GST, PAN, and identity proofs before activating new vendor stores. You will be able to sell products once approved.
                    </div>
                  </div>
                )}

                {isRejected && (
                  <div className="rounded-2xl bg-rose-50/70 border border-rose-200/80 p-4 text-xs text-rose-900 flex items-start gap-3">
                    <AlertCircle size={18} className="text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Application Rejected by Admin:</strong>{" "}
                      {user?.rejectionReason || "Uploaded business documents could not be validated."}
                      <p className="mt-1 text-slate-600">
                        Please update your business information and re-upload valid documents below, then click &quot;Save & Re-submit for Review&quot;.
                      </p>
                    </div>
                  </div>
                )}

                {isSuspended && (
                  <div className="rounded-2xl bg-slate-100 border border-slate-300 p-4 text-xs text-slate-800 flex items-start gap-3">
                    <Ban size={18} className="text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Store Suspended by Administration:</strong>{" "}
                      {user?.suspensionReason || "Your selling privileges have been paused."}
                      <p className="mt-1 text-slate-500">
                        Please contact ShivraTech Administration at support@shivratech.com for reactivation.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* KYC & Business Details Form */}
            <form onSubmit={handleSaveKyc} className="rounded-[28px] border border-purple-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Business Entity & Legal Identification
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ensure your business credentials match the documents provided for fast approval.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Store / Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={kycForm.storeName}
                    onChange={(e) => setKycForm({ ...kycForm, storeName: e.target.value })}
                    placeholder="e.g. Apex Audio Labs"
                    className="w-full rounded-2xl border border-purple-100 bg-purple-50/20 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#B35FA3] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Business Entity Structure
                  </label>
                  <select
                    value={kycForm.businessType}
                    onChange={(e) => setKycForm({ ...kycForm, businessType: e.target.value })}
                    className="w-full rounded-2xl border border-purple-100 bg-purple-50/20 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#B35FA3] focus:bg-white cursor-pointer"
                  >
                    <option value="Individual / Sole Proprietor">Individual / Sole Proprietor</option>
                    <option value="Partnership Firm">Partnership Firm</option>
                    <option value="Private Limited (Pvt Ltd)">Private Limited (Pvt Ltd)</option>
                    <option value="LLP">Limited Liability Partnership (LLP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Phone Number
                  </label>
                  <input
                    type="tel"
                    value={kycForm.phone}
                    onChange={(e) => setKycForm({ ...kycForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-2xl border border-purple-100 bg-purple-50/20 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#B35FA3] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    GSTIN (Tax Identifier)
                  </label>
                  <input
                    type="text"
                    value={kycForm.gstNumber}
                    onChange={(e) => setKycForm({ ...kycForm, gstNumber: e.target.value.toUpperCase() })}
                    placeholder="22AAAAA0000A1Z5"
                    className="w-full rounded-2xl border border-purple-100 bg-purple-50/20 px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-800 outline-none focus:border-[#B35FA3] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Business PAN Number
                  </label>
                  <input
                    type="text"
                    value={kycForm.panNumber}
                    onChange={(e) => setKycForm({ ...kycForm, panNumber: e.target.value.toUpperCase() })}
                    placeholder="ABCDE1234F"
                    className="w-full rounded-2xl border border-purple-100 bg-purple-50/20 px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-800 outline-none focus:border-[#B35FA3] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registered Business Address
                  </label>
                  <input
                    type="text"
                    value={kycForm.businessAddress}
                    onChange={(e) => setKycForm({ ...kycForm, businessAddress: e.target.value })}
                    placeholder="Plot 42, Electronics Park, Bangalore, KA"
                    className="w-full rounded-2xl border border-purple-100 bg-purple-50/20 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#B35FA3] focus:bg-white"
                  />
                </div>
              </div>

              {/* Uploaded Verification Documents Section */}
              <div className="border-t border-purple-100 pt-6">
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  KYC Verification Documents
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  Upload PDF or clear high-resolution images of your business license and identity proof.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Business Certificate Document */}
                  <div className="rounded-2xl border border-purple-100 bg-purple-50/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Business Certificate / GST Proof
                      </span>
                      {kycForm.businessDocUrl ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          <Check size={10} /> Attached
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Not Uploaded</span>
                      )}
                    </div>

                    {kycForm.businessDocUrl && (
                      <div className="flex items-center justify-between rounded-xl border border-purple-100 bg-white p-2.5">
                        <div className="flex items-center gap-2 truncate">
                          <FileText size={16} className="text-[#4A0D4F] flex-shrink-0" />
                          <span className="text-xs text-slate-600 truncate">
                            Business Registration Proof
                          </span>
                        </div>
                        <a
                          href={kycForm.businessDocUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-[#4A0D4F] hover:underline flex items-center gap-1 flex-shrink-0"
                        >
                          <ExternalLink size={12} /> View
                        </a>
                      </div>
                    )}

                    <div>
                      <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-purple-200 bg-white px-3.5 py-2 text-xs font-bold text-[#4A0D4F] shadow-2xs hover:bg-purple-50 transition">
                        <UploadCloud size={14} />
                        <span>
                          {uploadingDocType === "businessDocUrl"
                            ? "Uploading..."
                            : kycForm.businessDocUrl
                            ? "Replace Certificate"
                            : "Upload GST / Business License"}
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          disabled={Boolean(uploadingDocType)}
                          onChange={(e) => handleUploadKycDoc(e.target.files?.[0], "businessDocUrl")}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* ID Proof Document */}
                  <div className="rounded-2xl border border-purple-100 bg-purple-50/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Owner Identity Proof (Govt ID)
                      </span>
                      {kycForm.idProofUrl ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          <Check size={10} /> Attached
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Not Uploaded</span>
                      )}
                    </div>

                    {kycForm.idProofUrl && (
                      <div className="flex items-center justify-between rounded-xl border border-purple-100 bg-white p-2.5">
                        <div className="flex items-center gap-2 truncate">
                          <FileText size={16} className="text-[#4A0D4F] flex-shrink-0" />
                          <span className="text-xs text-slate-600 truncate">
                            Owner ID Proof
                          </span>
                        </div>
                        <a
                          href={kycForm.idProofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-[#4A0D4F] hover:underline flex items-center gap-1 flex-shrink-0"
                        >
                          <ExternalLink size={12} /> View
                        </a>
                      </div>
                    )}

                    <div>
                      <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-purple-200 bg-white px-3.5 py-2 text-xs font-bold text-[#4A0D4F] shadow-2xs hover:bg-purple-50 transition">
                        <UploadCloud size={14} />
                        <span>
                          {uploadingDocType === "idProofUrl"
                            ? "Uploading..."
                            : kycForm.idProofUrl
                            ? "Replace ID Proof"
                            : "Upload Aadhaar / Voter / Passport"}
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          disabled={Boolean(uploadingDocType)}
                          onChange={(e) => handleUploadKycDoc(e.target.files?.[0], "idProofUrl")}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-purple-100 pt-6">
                <p className="text-xs text-slate-400 max-w-md">
                  Saving updates your business profile and notifies ShivraTech Administration to review your application.
                </p>
                <button
                  type="submit"
                  disabled={savingKyc || Boolean(uploadingDocType)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#4A0D4F] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition hover:bg-[#380B3C] active:scale-95 disabled:opacity-50"
                >
                  <ShieldCheck size={16} />
                  <span>{savingKyc ? "Submitting for Review..." : "Save & Submit for Admin Verification"}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: SUPPORT & DISPUTES TICKETS                                         */}
        {/* ========================================================================= */}
        {activeTab === "disputes" && (
          <div className="space-y-6">
            {/* Header / Actions Card */}
            <div className="rounded-[24px] border border-purple-100 bg-white p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[#4A0D4F] font-bold text-xs uppercase tracking-wider mb-1">
                  <LifeBuoy size={16} />
                  <span>Vendor Support & Disputes</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Direct Admin Resolution Center
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                  Raise tickets to ShivraTech Admin for payout/settlement issues, order disputes, customer chargebacks, or store verification queries.
                </p>
              </div>
              <div className="flex items-center gap-2.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={fetchTickets}
                  disabled={ticketsLoading}
                  className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-purple-50 transition"
                  title="Refresh tickets"
                >
                  <RefreshCcw size={13} className={ticketsLoading ? "animate-spin" : ""} />
                  <span>Refresh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowTicketModal(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#4A0D4F] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#380B3C] transition active:scale-95"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span>Raise Ticket to Admin</span>
                </button>
              </div>
            </div>

            {/* Quick Summary KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="rounded-2xl border border-purple-100 bg-white p-4 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400">Total Tickets</span>
                <p className="mt-1 text-2xl font-black text-slate-900">{vendorTickets.length}</p>
                <p className="text-[10.5px] font-semibold text-slate-500 mt-0.5">Submitted history</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 shadow-xs">
                <span className="text-[11px] font-bold text-amber-700">Open Tickets</span>
                <p className="mt-1 text-2xl font-black text-amber-800">
                  {vendorTickets.filter((t) => t.status === "open").length}
                </p>
                <p className="text-[10.5px] font-semibold text-amber-600 mt-0.5">Pending admin review</p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 shadow-xs">
                <span className="text-[11px] font-bold text-blue-700">In Progress</span>
                <p className="mt-1 text-2xl font-black text-blue-800">
                  {vendorTickets.filter((t) => t.status === "in_progress").length}
                </p>
                <p className="text-[10.5px] font-semibold text-blue-600 mt-0.5">Being investigated</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-xs">
                <span className="text-[11px] font-bold text-emerald-700">Resolved</span>
                <p className="mt-1 text-2xl font-black text-emerald-800">
                  {vendorTickets.filter((t) => t.status === "resolved").length}
                </p>
                <p className="text-[10.5px] font-semibold text-emerald-600 mt-0.5">Successfully closed</p>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="rounded-2xl border border-purple-100 bg-white p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                  placeholder="Search by Ticket ID, subject, or description..."
                  className="w-full rounded-xl border border-purple-100 bg-purple-50/20 pl-10 pr-3.5 py-2 text-xs outline-none focus:border-[#B35FA3] focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={ticketStatusFilter}
                  onChange={(e) => setTicketStatusFilter(e.target.value)}
                  className="rounded-xl border border-purple-100 bg-purple-50/20 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#B35FA3]"
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>

                <select
                  value={ticketCategoryFilter}
                  onChange={(e) => setTicketCategoryFilter(e.target.value)}
                  className="rounded-xl border border-purple-100 bg-purple-50/20 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#B35FA3]"
                >
                  <option value="all">All Categories</option>
                  <option value="payment">Payment & Payouts</option>
                  <option value="order">Order Issues</option>
                  <option value="customer">Customer Disputes</option>
                  <option value="vendor">Store & Verification</option>
                  <option value="product">Product Catalog</option>
                  <option value="general">General Support</option>
                </select>
              </div>
            </div>

            {/* Tickets Cards List */}
            {(() => {
              const filtered = vendorTickets.filter((t) => {
                if (ticketStatusFilter !== "all" && t.status !== ticketStatusFilter) return false;
                if (ticketCategoryFilter !== "all" && t.category !== ticketCategoryFilter) return false;
                if (ticketSearch.trim()) {
                  const q = ticketSearch.toLowerCase();
                  const matchId = t.ticketId?.toLowerCase().includes(q);
                  const matchSub = t.subject?.toLowerCase().includes(q);
                  const matchDesc = t.description?.toLowerCase().includes(q);
                  const matchOrd = t.orderId?.toLowerCase().includes(q);
                  const matchPay = t.paymentId?.toLowerCase().includes(q);
                  if (!matchId && !matchSub && !matchDesc && !matchOrd && !matchPay) return false;
                }
                return true;
              });

              if (filtered.length === 0) {
                return (
                  <div className="rounded-[24px] border border-dashed border-purple-200 bg-white p-12 text-center">
                    <LifeBuoy size={42} className="mx-auto text-purple-300 mb-3" />
                    <h3 className="text-base font-black text-slate-800 mb-1">
                      {vendorTickets.length === 0 ? "No Support Tickets Raised Yet" : "No Matching Tickets Found"}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                      {vendorTickets.length === 0
                        ? "Need help with payouts, order settlements, customer complaints, or store verification? Raise a ticket to admin directly."
                        : "Try clearing your search query or filter selections."}
                    </p>
                    {vendorTickets.length === 0 && (
                      <button
                        type="button"
                        onClick={() => setShowTicketModal(true)}
                        className="inline-flex items-center gap-2 rounded-full bg-[#4A0D4F] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#380B3C] transition"
                      >
                        <Plus size={15} />
                        <span>Raise Your First Ticket</span>
                      </button>
                    )}
                  </div>
                );
              }

              return (
                <div className="space-y-3.5">
                  {filtered.map((ticket) => {
                    const statusBadge =
                      ticket.status === "resolved"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                        : ticket.status === "in_progress"
                        ? "bg-blue-100 text-blue-800 border-blue-200"
                        : ticket.status === "closed"
                        ? "bg-slate-100 text-slate-700 border-slate-200"
                        : "bg-amber-100 text-amber-800 border-amber-200";

                    const priorityBadge =
                      ticket.priority === "urgent"
                        ? "bg-rose-100 text-rose-800"
                        : ticket.priority === "high"
                        ? "bg-orange-100 text-orange-800"
                        : ticket.priority === "medium"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-slate-100 text-slate-700";

                    return (
                      <div
                        key={ticket._id || ticket.ticketId}
                        className="rounded-[22px] border border-purple-100 bg-white p-5 shadow-xs transition hover:border-purple-300 space-y-3.5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-purple-50 pb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-black text-[#4A0D4F] bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                              #{ticket.ticketId}
                            </span>
                            <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold capitalize ${statusBadge}`}>
                              {ticket.status?.replace("_", " ")}
                            </span>
                            <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold capitalize ${priorityBadge}`}>
                              {ticket.priority} priority
                            </span>
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10.5px] font-bold text-slate-600 capitalize">
                              {ticket.category} Issue
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-semibold">
                            {new Date(ticket.createdAt).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm sm:text-base font-black text-slate-900 mb-1">
                            {ticket.subject}
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                            {ticket.description}
                          </p>
                        </div>

                        {(ticket.orderId || ticket.paymentId) && (
                          <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                            {ticket.orderId && (
                              <span className="rounded-md bg-[#FAF8FC] border border-purple-100 px-2 py-0.5 text-slate-700">
                                <strong>Order Ref:</strong> {ticket.orderId}
                              </span>
                            )}
                            {ticket.paymentId && (
                              <span className="rounded-md bg-[#FAF8FC] border border-purple-100 px-2 py-0.5 text-slate-700">
                                <strong>Payment/Payout Ref:</strong> {ticket.paymentId}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Admin Reply Highlight */}
                        {ticket.adminReply && (
                          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-black text-emerald-900">
                              <span className="flex items-center gap-1.5">
                                <CheckCircle2 size={14} className="text-emerald-600" />
                                Official Response from ShivraTech Administration
                              </span>
                              {ticket.resolvedAt && (
                                <span className="text-[10.5px] font-semibold text-emerald-700">
                                  Resolved on {new Date(ticket.resolvedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-emerald-800 leading-relaxed whitespace-pre-wrap">
                              {ticket.adminReply}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => setSelectedTicketDetail(ticket)}
                            className="text-xs font-bold text-[#4A0D4F] hover:underline flex items-center gap-1"
                          >
                            <span>View Full Details</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
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
                      const category = categories.find(
                        (item) => item.slug === e.target.value,
                      );
                      if (!category) return;
                      setProductForm({
                        ...productForm,
                        categorySlug: category.slug,
                        categoryName: category.name,
                      });
                    }}
                    className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[#B35FA3] focus:bg-white"
                  >
                    {!categories.some(
                      (category) => category.slug === productForm.categorySlug,
                    ) && productForm.categorySlug && (
                      <option value={productForm.categorySlug}>
                        {productForm.categoryName}
                      </option>
                    )}
                    {categories.map((category) => (
                      <option key={category._id || category.slug} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {categoriesError && (
                    <p className="mt-1 text-[11px] font-semibold text-rose-600" role="alert">
                      {categoriesError}
                    </p>
                  )}
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
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isNewArrival}
                    onChange={(e) => setProductForm({ ...productForm, isNewArrival: e.target.checked })}
                    className="rounded text-[#4A0D4F]"
                  />
                  <span>New Arrival Product</span>
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

      {/* ========================================================================= */}
      {/* MODAL 4: CREATE / EDIT STORE COUPON                                       */}
      {/* ========================================================================= */}
      {showCouponModal && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative my-auto max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-purple-200 bg-white p-5 shadow-2xl sm:p-7">
            <button
              type="button"
              onClick={() => setShowCouponModal(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-slate-500 hover:bg-purple-100"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-[#4A0D4F]">
                <TicketPercent size={18} />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {editingCoupon ? "Edit Store Coupon" : "Create Store Promotional Coupon"}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Set discount rules, minimum purchase thresholds, and redemption limits for items from your store.
            </p>

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Coupon Promo Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={couponForm.code}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        code: e.target.value.toUpperCase().replace(/\s+/g, ""),
                      })
                    }
                    placeholder="e.g. SOUND25"
                    className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold tracking-wider uppercase outline-none focus:border-[#B35FA3] focus:bg-white"
                  />
                  <p className="text-[10.5px] text-slate-400 mt-1">
                    Capitalized letters and numbers only.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Offer Headline / Title
                  </label>
                  <input
                    type="text"
                    value={couponForm.title}
                    onChange={(e) => setCouponForm({ ...couponForm, title: e.target.value })}
                    placeholder="e.g. 25% Off Premium Soundbars"
                    className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[#B35FA3] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Offer Details
                </label>
                <textarea
                  rows="2"
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  placeholder="e.g. Applicable on all Bluetooth audio speakers and accessories from our store."
                  className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-[#B35FA3] focus:bg-white resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, discountType: e.target.value })
                    }
                    className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:border-[#B35FA3] focus:bg-white cursor-pointer"
                  >
                    <option value="percentage">Percentage (%) Off</option>
                    <option value="fixed">Flat Amount (₹) Off</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Discount Value *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      value={couponForm.discountValue}
                      onChange={(e) =>
                        setCouponForm({ ...couponForm, discountValue: e.target.value })
                      }
                      placeholder={couponForm.discountType === "percentage" ? "15" : "300"}
                      className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2.5 text-xs sm:text-sm font-bold outline-none focus:border-[#B35FA3] focus:bg-white"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      {couponForm.discountType === "percentage" ? "%" : "₹"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    disabled={couponForm.discountType === "fixed"}
                    value={couponForm.maxDiscountAmount}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, maxDiscountAmount: e.target.value })
                    }
                    placeholder={couponForm.discountType === "fixed" ? "N/A" : "e.g. 500 (0 for no cap)"}
                    className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[#B35FA3] focus:bg-white disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Min. Store Order Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={couponForm.minOrderAmount}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, minOrderAmount: e.target.value })
                    }
                    placeholder="e.g. 999 (0 for no minimum)"
                    className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[#B35FA3] focus:bg-white"
                  />
                  <p className="text-[10.5px] text-slate-400 mt-1">
                    Customer must have this subtotal of items from your store.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={couponForm.expiryDate}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, expiryDate: e.target.value })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:border-[#B35FA3] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Total Usage Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={couponForm.usageLimit}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, usageLimit: e.target.value })
                    }
                    placeholder="100"
                    className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[#B35FA3] focus:bg-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Maximum total uses</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Per User Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={couponForm.perUserLimit}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, perUserLimit: e.target.value })
                    }
                    placeholder="1"
                    className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[#B35FA3] focus:bg-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Max times per customer</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={couponForm.status}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, status: e.target.value })
                    }
                    className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:border-[#B35FA3] focus:bg-white cursor-pointer"
                  >
                    <option value="active">Active (Claimable)</option>
                    <option value="inactive">Inactive (Draft)</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-0.5">Visibility to shoppers</p>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#B35FA3]">
                  Shopper Live Preview
                </span>
                <div className="mt-2 flex items-center justify-between rounded-xl bg-white border border-purple-200 p-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-[#4A0D4F]">
                      <TicketPercent size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-[#4A0D4F]">
                          {couponForm.code || "SAMPLE20"}
                        </span>
                        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          {couponForm.discountType === "percentage"
                            ? `${couponForm.discountValue || 20}% OFF`
                            : `₹${couponForm.discountValue || 200} OFF`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {couponForm.title || "Special Store Discount"}
                        {couponForm.minOrderAmount > 0 ? ` • Min. order ₹${couponForm.minOrderAmount}` : ""}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#4A0D4F] border border-purple-200 px-3 py-1 rounded-full">
                    APPLY
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-purple-100">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="rounded-full px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCoupon}
                  className="inline-flex items-center gap-2 rounded-full bg-[#4A0D4F] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#380B3C] active:scale-95 transition disabled:opacity-50"
                >
                  {savingCoupon ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Saving Coupon...</span>
                    </>
                  ) : (
                    <>
                      <Check size={15} />
                      <span>{editingCoupon ? "Update Coupon" : "Publish Coupon"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: RAISE TICKET TO ADMIN                                            */}
      {/* ========================================================================= */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-[28px] border border-purple-200 bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowTicketModal(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-slate-500 hover:bg-purple-100"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 text-[#4A0D4F] mb-1.5 font-bold text-xs uppercase tracking-wider">
              <LifeBuoy size={16} />
              <span>Direct Admin Ticket</span>
            </div>

            <h3 className="text-lg font-black text-slate-900 mb-1">
              Raise Support / Dispute Ticket
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Submit your inquiry or issue directly to the ShivraTech administration team for review and resolution.
            </p>

            <form onSubmit={handleCreateTicket} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                    className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3 py-2 text-xs font-semibold outline-none focus:border-[#B35FA3] focus:bg-white"
                  >
                    <option value="payment">Payment & Payout Settlement</option>
                    <option value="order">Order Fulfillment & Delivery</option>
                    <option value="customer">Customer Dispute / Return</option>
                    <option value="vendor">Store Status & KYC Verification</option>
                    <option value="product">Product Catalog & Approval</option>
                    <option value="general">General Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Priority *
                  </label>
                  <select
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                    className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3 py-2 text-xs font-semibold outline-none focus:border-[#B35FA3] focus:bg-white"
                  >
                    <option value="low">Low (General queries)</option>
                    <option value="medium">Medium (Standard requests)</option>
                    <option value="high">High (Urgent payout/order issue)</option>
                    <option value="urgent">Urgent (Blocked operations / Critical)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  placeholder="e.g. Bank payout not received for Order #ORD-12847"
                  className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2 text-xs outline-none focus:border-[#B35FA3] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Related Order ID <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={ticketForm.orderId}
                    onChange={(e) => setTicketForm({ ...ticketForm, orderId: e.target.value })}
                    placeholder="e.g. ORD-6591234"
                    className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2 text-xs font-mono outline-none focus:border-[#B35FA3] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Payment / Txn Ref <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={ticketForm.paymentId}
                    onChange={(e) => setTicketForm({ ...ticketForm, paymentId: e.target.value })}
                    placeholder="e.g. pay_Nabc123456"
                    className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2 text-xs font-mono outline-none focus:border-[#B35FA3] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  placeholder="Provide complete details including expected payout dates, amounts, courier waybill numbers, or messages from customer..."
                  className="w-full rounded-xl border border-purple-100 bg-purple-50/20 px-3.5 py-2.5 text-xs outline-none focus:border-[#B35FA3] focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTicketModal(false)}
                  className="rounded-full px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTicket}
                  className="inline-flex items-center gap-2 rounded-full bg-[#4A0D4F] px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#380B3C] transition active:scale-95 disabled:opacity-50"
                >
                  {submittingTicket ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Ticket to Admin</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: TICKET DETAIL & AUDIT                                            */}
      {/* ========================================================================= */}
      {selectedTicketDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-[28px] border border-purple-200 bg-white p-6 shadow-2xl space-y-4">
            <button
              type="button"
              onClick={() => setSelectedTicketDetail(null)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-slate-500 hover:bg-purple-100"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 text-[#4A0D4F] font-bold text-xs uppercase tracking-wider">
              <LifeBuoy size={16} />
              <span>Ticket Inspection</span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-black text-[#4A0D4F] bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-100">
                  #{selectedTicketDetail.ticketId}
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] font-bold text-slate-700 capitalize">
                  {selectedTicketDetail.status?.replace("_", " ")}
                </span>
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10.5px] font-bold text-purple-800 capitalize">
                  {selectedTicketDetail.priority}
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900">
                {selectedTicketDetail.subject}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Logged on {new Date(selectedTicketDetail.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl border border-purple-100 bg-[#FAF8FC] p-3.5 space-y-2 text-xs">
              <div>
                <strong className="text-slate-800">Category:</strong>{" "}
                <span className="capitalize text-slate-600">{selectedTicketDetail.category}</span>
              </div>
              {selectedTicketDetail.orderId && (
                <div>
                  <strong className="text-slate-800">Order Ref:</strong>{" "}
                  <span className="font-mono text-slate-600">{selectedTicketDetail.orderId}</span>
                </div>
              )}
              {selectedTicketDetail.paymentId && (
                <div>
                  <strong className="text-slate-800">Payment/Txn Ref:</strong>{" "}
                  <span className="font-mono text-slate-600">{selectedTicketDetail.paymentId}</span>
                </div>
              )}
              <div>
                <strong className="text-slate-800">Description:</strong>
                <p className="mt-1 text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {selectedTicketDetail.description}
                </p>
              </div>
            </div>

            {selectedTicketDetail.adminReply ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span>Admin Resolution Reply</span>
                </div>
                <p className="text-xs text-emerald-800 whitespace-pre-wrap leading-relaxed">
                  {selectedTicketDetail.adminReply}
                </p>
                {selectedTicketDetail.resolvedAt && (
                  <p className="text-[10.5px] text-emerald-700 pt-1">
                    Resolved at {new Date(selectedTicketDetail.resolvedAt).toLocaleString()}
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3.5 text-xs text-amber-800">
                <p className="font-bold">Pending Admin Response</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  ShivraTech operations has received this ticket and will update you shortly.
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedTicketDetail(null)}
                className="rounded-full bg-slate-100 px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VendorDashboard;
