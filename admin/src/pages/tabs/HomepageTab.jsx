import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Flame,
  Grid,
  Image as ImageIcon,
  ImagePlus,
  Layers,
  Layout,
  Link as LinkIcon,
  Loader2,
  Megaphone,
  MoveDown,
  MoveUp,
  Package,
  Palette,
  Plus,
  Power,
  RefreshCcw,
  Search,
  Sliders,
  Sparkles,
  Star,
  Tag,
  Trash2,
  Upload,
  X,
  Zap,
} from "lucide-react";
import {
  apiGetBanners,
  apiCreateBanner,
  apiUpdateBanner,
  apiDeleteBanner,
  apiToggleBanner,
  apiGetHomepageOverview,
  apiGetCategories,
  apiToggleCategoryFeatured,
  apiGetProducts,
  apiUpdateProductShowcase,
  apiUploadImage,
} from "../../api";
import {
  ActionBtn,
  Badge,
  Spinner,
  cancelBtn,
  cardStyle,
  iconBtn,
  inputStyle,
  inputWithIcon,
  modal,
  overlay,
  primaryBtn,
  selectStyle,
  tableStyle,
  tdStyle,
  thStyle,
} from "../../components/UI";

const labelStyle = {
  display: "block",
  color: "var(--text-secondary)",
  fontSize: "11px",
  fontWeight: 600,
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

export default function HomepageTab({ showToast, showConfirm }) {
  // Main sub-navigation
  const [activeSubTab, setActiveSubTab] = useState("banners"); // 'banners', 'categories', 'products', 'ticker'

  // Banners state
  const [banners, setBanners] = useState([]);
  const [bannerTypeFilter, setBannerTypeFilter] = useState("all");
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [bannerStats, setBannerStats] = useState({});

  // Banner Modal state
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [savingBanner, setSavingBanner] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [bannerForm, setBannerForm] = useState({
    title: "",
    subtitle: "",
    badge: "",
    image: "",
    mobileImage: "",
    link: "/shop",
    buttonText: "",
    bannerType: "hero",
    bgColor: "#4A0D4F",
    textColor: "#FFFFFF",
    displayOrder: 0,
    isActive: true,
    startDate: "",
    endDate: "",
  });

  // Categories state
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  // Products Showcase state
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [productFilter, setProductFilter] = useState("all"); // 'all', 'featured', 'flash', 'new'

  // Overview stats
  const [overview, setOverview] = useState(null);

  // ── Fetch Banners & Overview ──
  const fetchBannersData = useCallback(async () => {
    setLoadingBanners(true);
    try {
      const p = bannerTypeFilter !== "all" ? `type=${bannerTypeFilter}` : "";
      const res = await apiGetBanners(p);
      setBanners(res.data?.banners || []);
      setBannerStats(res.data?.stats || {});

      const overviewRes = await apiGetHomepageOverview();
      setOverview(overviewRes.data || null);
    } catch (err) {
      showToast(err.message || "Failed to load banners", "error");
    } finally {
      setLoadingBanners(false);
    }
  }, [bannerTypeFilter, showToast]);

  // ── Fetch Categories ──
  const fetchCategoriesData = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const res = await apiGetCategories();
      setCategories(res.data || []);
    } catch (err) {
      showToast(err.message || "Failed to load categories", "error");
    } finally {
      setLoadingCategories(false);
    }
  }, [showToast]);

  // ── Fetch Products ──
  const fetchProductsData = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const p = new URLSearchParams();
      p.append("limit", "50");
      if (productSearch.trim()) p.append("keyword", productSearch.trim());
      if (productFilter === "featured") p.append("featured", "true");
      if (productFilter === "flash") p.append("flashSale", "true");
      if (productFilter === "new") p.append("newArrival", "true");

      const res = await apiGetProducts(p.toString());
      setProducts(res.data?.products || []);
    } catch (err) {
      showToast(err.message || "Failed to load showcase products", "error");
    } finally {
      setLoadingProducts(false);
    }
  }, [productSearch, productFilter, showToast]);

  useEffect(() => {
    if (activeSubTab === "banners" || activeSubTab === "ticker") {
      fetchBannersData();
    } else if (activeSubTab === "categories") {
      fetchCategoriesData();
    } else if (activeSubTab === "products") {
      fetchProductsData();
    }
  }, [activeSubTab, fetchBannersData, fetchCategoriesData, fetchProductsData]);

  // ── Banner Modal Actions ──
  const handleOpenCreateBanner = (defaultType = "hero") => {
    setEditingBanner(null);
    setShowOptionalFields(defaultType === "top_strip");
    setBannerForm({
      title: "",
      subtitle: "",
      badge: "",
      image: "",
      mobileImage: "",
      link: "/shop",
      buttonText: "",
      bannerType: defaultType,
      bgColor: defaultType === "hero" ? "#4A0D4F" : "#1E1B4B",
      textColor: "#FFFFFF",
      displayOrder: banners.length + 1,
      isActive: true,
      startDate: "",
      endDate: "",
    });
    setShowBannerModal(true);
  };

  const handleOpenEditBanner = (b) => {
    setEditingBanner(b);
    setShowOptionalFields(
      Boolean(b.title || b.subtitle || b.badge || b.buttonText || b.bannerType === "top_strip")
    );
    setBannerForm({
      title: b.title || "",
      subtitle: b.subtitle || "",
      badge: b.badge || "",
      image: b.image || "",
      mobileImage: b.mobileImage || "",
      link: b.link || "/shop",
      buttonText: b.buttonText || "",
      bannerType: b.bannerType || "hero",
      bgColor: b.bgColor || "#4A0D4F",
      textColor: b.textColor || "#FFFFFF",
      displayOrder: b.displayOrder !== undefined ? b.displayOrder : 0,
      isActive: b.isActive !== undefined ? b.isActive : true,
      startDate: b.startDate ? new Date(b.startDate).toISOString().split("T")[0] : "",
      endDate: b.endDate ? new Date(b.endDate).toISOString().split("T")[0] : "",
    });
    setShowBannerModal(true);
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    if (bannerForm.bannerType === "top_strip" && !bannerForm.title.trim()) {
      showToast("Top announcement strip requires an announcement message", "error");
      return;
    }
    if (bannerForm.bannerType !== "top_strip" && !bannerForm.image.trim() && !bannerForm.title.trim()) {
      showToast("Please provide either a banner image or a headline", "error");
      return;
    }

    setSavingBanner(true);
    try {
      if (editingBanner) {
        await apiUpdateBanner(editingBanner._id, bannerForm);
        showToast("Banner updated successfully!");
      } else {
        await apiCreateBanner(bannerForm);
        showToast("New banner created successfully!");
      }
      setShowBannerModal(false);
      fetchBannersData();
    } catch (err) {
      showToast(err.message || "Failed to save banner", "error");
    } finally {
      setSavingBanner(false);
    }
  };

  const handleToggleBanner = async (id, title) => {
    try {
      const res = await apiToggleBanner(id);
      showToast(`Banner "${title}" marked ${res.data?.isActive ? "active" : "inactive"}`);
      setBanners((prev) =>
        prev.map((b) => (b._id === id ? { ...b, isActive: res.data?.isActive } : b))
      );
    } catch (err) {
      showToast(err.message || "Failed to toggle banner", "error");
    }
  };

  const handleDeleteBanner = (id, title) => {
    showConfirm(`Delete banner "${title}" from the homepage?`, async () => {
      try {
        await apiDeleteBanner(id);
        showToast("Banner deleted successfully");
        setBanners((prev) => prev.filter((b) => b._id !== id));
      } catch (err) {
        showToast(err.message || "Failed to delete banner", "error");
      }
    });
  };

  // Image Upload helper
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please choose a valid image file", "error");
      return;
    }

    setUploadingImage(true);
    try {
      const res = await apiUploadImage(file);
      if (res.data?.url) {
        setBannerForm((prev) => ({ ...prev, image: res.data.url }));
        showToast("Banner image uploaded successfully!");
      }
    } catch (err) {
      showToast(err.message || "Image upload failed", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  // ── Category Featured Toggle ──
  const handleToggleCategory = async (id, name, currentFeatured) => {
    try {
      await apiToggleCategoryFeatured(id);
      const next = !currentFeatured;
      setCategories((prev) =>
        prev.map((c) => (c._id === id ? { ...c, featured: next } : c))
      );
      showToast(`Category "${name}" ${next ? "is now featured on homepage" : "removed from featured"}`);
    } catch (err) {
      showToast(err.message || "Failed to update category", "error");
    }
  };

  // ── Product Showcase Flags Toggle ──
  const handleToggleProductFlag = async (id, title, flagKey, currentValue) => {
    try {
      const nextVal = !currentValue;
      await apiUpdateProductShowcase(id, { [flagKey]: nextVal });
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, [flagKey]: nextVal } : p))
      );
      showToast(`Updated "${title}" showcase status`);
    } catch (err) {
      showToast(err.message || "Failed to update product", "error");
    }
  };

  const filteredCategories = categories.filter((c) => {
    if (!categorySearch.trim()) return true;
    return (
      c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
      c.slug.toLowerCase().includes(categorySearch.toLowerCase())
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* ── Sub Navigation Tabs ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          borderBottom: "1px solid var(--border-color)",
          paddingBottom: "12px",
        }}
      >
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {[
            { id: "banners", label: "Homepage Banners", icon: ImageIcon, count: bannerStats.totalCount },
            { id: "categories", label: "Featured Categories", icon: Grid, count: overview?.counts?.featuredCategories },
            { id: "products", label: "Showcase Products", icon: Sparkles, count: overview?.counts?.featuredProducts },
            { id: "ticker", label: "Announcement Strip", icon: Megaphone },
          ].map((tab) => {
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  border: active ? "1px solid var(--primary)" : "1px solid var(--border-color)",
                  background: active ? "var(--primary-subtle)" : "var(--card-bg)",
                  color: active ? "var(--primary)" : "var(--text-secondary)",
                }}
              >
                <tab.icon size={15} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    style={{
                      background: active ? "var(--primary)" : "var(--bg-surface-alt)",
                      color: active ? "#fff" : "var(--text-secondary)",
                      fontSize: "11px",
                      padding: "1px 7px",
                      borderRadius: "10px",
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {activeSubTab === "banners" && (
          <button
            onClick={() => handleOpenCreateBanner("hero")}
            style={{
              ...primaryBtn,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              fontSize: "13px",
            }}
          >
            <Plus size={16} />
            <span>Add Banner</span>
          </button>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 1. HOMEPAGE BANNERS SUB-TAB                                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "banners" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* KPI Metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>Total Banners</span>
                <ImageIcon size={18} color="var(--primary)" />
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, marginTop: "8px" }}>{bannerStats.totalCount || 0}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>Across all placements</div>
            </div>

            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>Active Live</span>
                <CheckCircle2 size={18} color="#10b981" />
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, marginTop: "8px", color: "#10b981" }}>{bannerStats.activeCount || 0}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>Displaying on store right now</div>
            </div>

            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>Hero Sliders</span>
                <Layers size={18} color="#8b5cf6" />
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, marginTop: "8px", color: "#8b5cf6" }}>{bannerStats.heroCount || 0}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>Top main carousel</div>
            </div>

            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>Promotional Cards</span>
                <Zap size={18} color="#f59e0b" />
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, marginTop: "8px", color: "#f59e0b" }}>{bannerStats.promoCount || 0}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>Mid-page featured deals</div>
            </div>
          </div>

          {/* Type Filter Controls */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>Filter by Placement:</span>
            {[
              { id: "all", label: "All Banners" },
              { id: "hero", label: "Hero Sliders" },
              { id: "promo", label: "Promotional Deals" },
              { id: "top_strip", label: "Top Announcement Strip" },
              { id: "category_feature", label: "Category Features" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setBannerTypeFilter(f.id)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: bannerTypeFilter === f.id ? "1px solid var(--primary)" : "1px solid var(--border-color)",
                  background: bannerTypeFilter === f.id ? "var(--primary)" : "var(--card-bg)",
                  color: bannerTypeFilter === f.id ? "#fff" : "var(--text-secondary)",
                }}
              >
                {f.label}
              </button>
            ))}
            <button onClick={fetchBannersData} style={iconBtn} title="Refresh banners">
              <RefreshCcw size={15} />
            </button>
          </div>

          {/* Banners Grid View */}
          {loadingBanners ? (
            <Spinner />
          ) : banners.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: "center", padding: "48px" }}>
              <ImageIcon size={48} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
              <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>No banners found</div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "6px" }}>
                Create your first promotional or hero banner to showcase special offers on the homepage.
              </p>
              <button onClick={() => handleOpenCreateBanner("hero")} style={{ ...primaryBtn, marginTop: "16px" }}>
                Create Banner
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
              {banners.map((b) => (
                <div
                  key={b._id}
                  style={{
                    ...cardStyle,
                    display: "flex",
                    flexDirection: "column",
                    padding: "0",
                    overflow: "hidden",
                    border: b.isActive ? "1px solid var(--border-color)" : "1px dashed #ef444466",
                    opacity: b.isActive ? 1 : 0.75,
                  }}
                >
                  {/* Banner Visual Preview Box */}
                  <div
                    style={{
                      position: "relative",
                      height: "170px",
                      background: b.bgColor || "#4A0D4F",
                      color: b.textColor || "#fff",
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      overflow: "hidden",
                    }}
                  >
                    {b.image && (
                      <img
                        src={b.image}
                        alt={b.title || "Banner"}
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}

                    {b.image && (b.title || b.subtitle) && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)",
                          zIndex: 1,
                        }}
                      />
                    )}

                    <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      {b.badge ? (
                        <span
                          style={{
                            background: "rgba(255,255,255,0.25)",
                            backdropFilter: "blur(6px)",
                            color: "#fff",
                            fontSize: "10px",
                            fontWeight: 800,
                            padding: "3px 8px",
                            borderRadius: "6px",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {b.badge}
                        </span>
                      ) : <span />}

                      <span
                        style={{
                          background: b.isActive ? "#10b981" : "#ef4444",
                          color: "#fff",
                          fontSize: "10px",
                          fontWeight: 800,
                          padding: "2px 8px",
                          borderRadius: "10px",
                        }}
                      >
                        {b.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>

                    {(b.title || b.subtitle) && (
                      <div style={{ position: "relative", zIndex: 2 }}>
                        {b.title && (
                          <h4 style={{ fontSize: "16px", fontWeight: 800, lineHeight: 1.25, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
                            {b.title}
                          </h4>
                        )}
                        {b.subtitle && (
                          <p style={{ fontSize: "12px", opacity: 0.9, marginTop: "4px", lineHeight: 1.3, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
                            {b.subtitle}
                          </p>
                        )}
                      </div>
                    )}

                    <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      {b.buttonText && (b.title || b.subtitle) ? (
                        <span
                          style={{
                            background: "#fff",
                            color: "#000",
                            fontSize: "10px",
                            fontWeight: 800,
                            padding: "4px 10px",
                            borderRadius: "20px",
                          }}
                        >
                          {b.buttonText} →
                        </span>
                      ) : <span />}
                      <span style={{ fontSize: "10px", opacity: 0.85, fontWeight: 700, background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: "4px" }}>
                        {b.bannerType.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Banner Control Meta Box */}
                  <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}>
                        <LinkIcon size={13} />
                        <span style={{ fontFamily: "monospace", fontSize: "11px" }}>{b.link}</span>
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)" }}>
                        Order #{b.displayOrder}
                      </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <ActionBtn color="#6366f1" title="Edit banner" onClick={() => handleOpenEditBanner(b)}>
                          <Sliders size={15} />
                        </ActionBtn>
                        <ActionBtn
                          color={b.isActive ? "#f59e0b" : "#10b981"}
                          title={b.isActive ? "Deactivate banner" : "Activate banner"}
                          onClick={() => handleToggleBanner(b._id, b.title)}
                        >
                          <Power size={15} />
                        </ActionBtn>
                        <ActionBtn color="#ef4444" title="Delete banner" onClick={() => handleDeleteBanner(b._id, b.title)}>
                          <Trash2 size={15} />
                        </ActionBtn>
                      </div>

                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        👁 {b.clickCount || 0} clicks
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 2. FEATURED CATEGORIES SUB-TAB                                     */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "categories" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 800 }}>Featured Categories on Homepage</h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Toggle which categories appear prominently in the Shop by Categories row and menu showcases.
              </p>
            </div>
            <div style={{ position: "relative", minWidth: "240px" }}>
              <Search size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Search categories..."
                style={{ ...inputWithIcon, paddingLeft: "32px", fontSize: "12px" }}
              />
            </div>
          </div>

          {loadingCategories ? (
            <Spinner />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
              {filteredCategories.map((cat) => {
                const isFeatured = Boolean(cat.featured);
                return (
                  <div
                    key={cat._id}
                    style={{
                      ...cardStyle,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      border: isFeatured ? "1px solid #10b98188" : "1px solid var(--border-color)",
                      background: isFeatured ? "var(--card-bg)" : "var(--bg-surface-alt)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "12px",
                          background: "var(--primary-subtle)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "20px",
                          flexShrink: 0,
                          overflow: "hidden",
                        }}
                      >
                        {cat.image ? (
                          <img src={cat.image} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : cat.icon ? (
                          cat.icon
                        ) : (
                          <Grid size={20} color="var(--primary)" />
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <h4 style={{ fontSize: "14px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>{cat.name}</h4>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>/{cat.slug}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleCategory(cat._id, cat.name, isFeatured)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        fontSize: "11.5px",
                        fontWeight: 800,
                        cursor: "pointer",
                        border: "none",
                        transition: "all 0.15s",
                        background: isFeatured ? "#10b98122" : "var(--bg-main)",
                        color: isFeatured ? "#10b981" : "var(--text-muted)",
                        border: isFeatured ? "1px solid #10b98166" : "1px solid var(--border-color)",
                        flexShrink: 0,
                      }}
                    >
                      {isFeatured ? "★ Featured" : "+ Feature"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 3. SHOWCASE PRODUCTS & FLASH SALE SUB-TAB                          */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "products" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 800 }}>Homepage Showcase Products</h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Select products to appear in the Featured Carousel, Flash Sale with live countdown, or New Arrivals section.
              </p>
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ position: "relative", minWidth: "220px" }}>
                <Search size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products..."
                  style={{ ...inputWithIcon, paddingLeft: "32px", fontSize: "12px" }}
                />
              </div>

              <select
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                style={{ ...selectStyle, fontSize: "12px", padding: "8px 12px" }}
              >
                <option value="all">All Products</option>
                <option value="featured">Featured Only</option>
                <option value="flash">Flash Sale Deals Only</option>
                <option value="new">New Arrivals Only</option>
              </select>

              <button onClick={fetchProductsData} style={iconBtn} title="Refresh products">
                <RefreshCcw size={15} />
              </button>
            </div>
          </div>

          {loadingProducts ? (
            <Spinner />
          ) : (
            <div style={{ overflowX: "auto", background: "var(--card-bg)", borderRadius: "16px", border: "1px solid var(--card-border)" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Product</th>
                    <th style={thStyle}>Category</th>
                    <th style={thStyle}>Price</th>
                    <th style={{ ...thStyle, textAlign: "center" }}>Featured (★)</th>
                    <th style={{ ...thStyle, textAlign: "center" }}>Flash Sale (⚡)</th>
                    <th style={{ ...thStyle, textAlign: "center" }}>New Arrival (✨)</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const isF = Boolean(p.isFeatured);
                    const isFS = Boolean(p.isFlashSale);
                    const isNA = Boolean(p.isNewArrival);
                    return (
                      <tr key={p._id}>
                        <td style={tdStyle}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <img
                              src={p.mainImage || (p.images && p.images[0]) || "https://placehold.co/40x40"}
                              alt={p.title}
                              style={{ width: "36px", height: "36px", borderRadius: "8px", objectFit: "cover" }}
                            />
                            <div>
                              <div style={{ fontWeight: 700, fontSize: "13px" }}>{p.title}</div>
                              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Seller: {p.sellerName || "Direct"}</span>
                            </div>
                          </div>
                        </td>

                        <td style={tdStyle}>
                          <span style={{ fontSize: "12px", fontWeight: 600 }}>{p.categoryName || p.categorySlug}</span>
                        </td>

                        <td style={tdStyle}>
                          <span style={{ fontWeight: 700 }}>₹{p.price?.toLocaleString("en-IN")}</span>
                        </td>

                        {/* Featured Toggle */}
                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          <button
                            type="button"
                            onClick={() => handleToggleProductFlag(p._id, p.title, "isFeatured", isF)}
                            style={{
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 800,
                              cursor: "pointer",
                              border: isF ? "1px solid #8b5cf6" : "1px solid var(--border-color)",
                              background: isF ? "#8b5cf622" : "transparent",
                              color: isF ? "#8b5cf6" : "var(--text-muted)",
                            }}
                          >
                            {isF ? "★ On Home" : "Off"}
                          </button>
                        </td>

                        {/* Flash Sale Toggle */}
                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          <button
                            type="button"
                            onClick={() => handleToggleProductFlag(p._id, p.title, "isFlashSale", isFS)}
                            style={{
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 800,
                              cursor: "pointer",
                              border: isFS ? "1px solid #ef4444" : "1px solid var(--border-color)",
                              background: isFS ? "#ef444422" : "transparent",
                              color: isFS ? "#ef4444" : "var(--text-muted)",
                            }}
                          >
                            {isFS ? "⚡ Flash Deal" : "Off"}
                          </button>
                        </td>

                        {/* New Arrival Toggle */}
                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          <button
                            type="button"
                            onClick={() => handleToggleProductFlag(p._id, p.title, "isNewArrival", isNA)}
                            style={{
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 800,
                              cursor: "pointer",
                              border: isNA ? "1px solid #10b981" : "1px solid var(--border-color)",
                              background: isNA ? "#10b98122" : "transparent",
                              color: isNA ? "#10b981" : "var(--text-muted)",
                            }}
                          >
                            {isNA ? "✨ Active" : "Off"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 4. ANNOUNCEMENT STRIP (TOP TICKER) SUB-TAB                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "ticker" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 800 }}>Top Announcement Ticker Bar</h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
              Configure the floating announcement banner displayed at the very top of the customer storefront.
            </p>
          </div>

          {banners
            .filter((b) => b.bannerType === "top_strip")
            .map((strip) => (
              <div key={strip._id} style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Live Preview Strip */}
                <div
                  style={{
                    background: strip.bgColor || "#4A0D4F",
                    color: strip.textColor || "#fff",
                    padding: "10px 18px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Megaphone size={16} />
                    <span>{strip.title}</span>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 800, background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: "10px" }}>
                    {strip.buttonText || "Learn More"}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        background: strip.isActive ? "#10b98122" : "#ef444422",
                        color: strip.isActive ? "#10b981" : "#ef4444",
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "6px",
                      }}
                    >
                      {strip.isActive ? "Live on Storefront" : "Disabled"}
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Target: {strip.link}</span>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => handleOpenEditBanner(strip)} style={{ ...cancelBtn, padding: "6px 14px", fontSize: "12px" }}>
                      Edit Announcement
                    </button>
                    <button
                      onClick={() => handleToggleBanner(strip._id, strip.title)}
                      style={{
                        ...primaryBtn,
                        padding: "6px 14px",
                        fontSize: "12px",
                        background: strip.isActive ? "#f59e0b" : "#10b981",
                      }}
                    >
                      {strip.isActive ? "Turn Off" : "Turn On"}
                    </button>
                  </div>
                </div>
              </div>
            ))}

          <button
            onClick={() => handleOpenCreateBanner("top_strip")}
            style={{
              ...primaryBtn,
              alignSelf: "flex-start",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Plus size={16} />
            <span>Add New Announcement Strip</span>
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* BANNER CREATE / EDIT MODAL WITH LIVE PREVIEW                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {showBannerModal && (
        <div style={overlay}>
          <div style={{ ...modal, maxWidth: "620px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ImageIcon size={20} color="var(--primary)" />
                <h3 style={{ fontSize: "18px", fontWeight: 800, margin: 0 }}>
                  {editingBanner ? "Edit Homepage Banner" : "Create New Banner"}
                </h3>
              </div>
              <button onClick={() => setShowBannerModal(false)} style={iconBtn}>
                <X size={16} />
              </button>
            </div>

            {/* Real-time Visual Card Preview */}
            <div style={{ marginBottom: "20px" }}>
              <span style={labelStyle}>Live Visual Preview</span>
              <div
                style={{
                  position: "relative",
                  height: "140px",
                  background: bannerForm.bgColor || "#4A0D4F",
                  color: bannerForm.textColor || "#fff",
                  borderRadius: "14px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  overflow: "hidden",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                }}
              >
                {bannerForm.image && (
                  <img
                    src={bannerForm.image}
                    alt="preview"
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                )}
                {bannerForm.image && (bannerForm.title || bannerForm.subtitle) && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
                      zIndex: 1,
                    }}
                  />
                )}
                <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "space-between" }}>
                  {bannerForm.badge ? (
                    <span style={{ background: "rgba(255,255,255,0.25)", backdropFilter: "blur(4px)", fontSize: "10px", fontWeight: 800, padding: "2px 8px", borderRadius: "4px" }}>
                      {bannerForm.badge}
                    </span>
                  ) : <span />}
                  <span style={{ fontSize: "10px", opacity: 0.85, fontWeight: 700, background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: "4px" }}>
                    {bannerForm.bannerType.toUpperCase()}
                  </span>
                </div>
                {(bannerForm.title || bannerForm.subtitle) && (
                  <div style={{ position: "relative", zIndex: 2 }}>
                    {bannerForm.title && (
                      <div style={{ fontSize: "16px", fontWeight: 800, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
                        {bannerForm.title}
                      </div>
                    )}
                    {bannerForm.subtitle && (
                      <div style={{ fontSize: "11px", opacity: 0.9, marginTop: "2px", color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
                        {bannerForm.subtitle}
                      </div>
                    )}
                  </div>
                )}
                <div style={{ position: "relative", zIndex: 2 }}>
                  {bannerForm.buttonText && (bannerForm.title || bannerForm.subtitle) ? (
                    <span style={{ background: "#fff", color: "#000", fontSize: "10px", fontWeight: 800, padding: "3px 10px", borderRadius: "14px" }}>
                      {bannerForm.buttonText} →
                    </span>
                  ) : <span />}
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveBanner} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Placement / Type</label>
                  <select
                    value={bannerForm.bannerType}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setBannerForm({ ...bannerForm, bannerType: newType });
                      if (newType === "top_strip") setShowOptionalFields(true);
                    }}
                    style={selectStyle}
                  >
                    <option value="hero">Hero Carousel Banner</option>
                    <option value="promo">Promotional Mid-Page Banner</option>
                    <option value="top_strip">Top Announcement Strip</option>
                    <option value="category_feature">Category Feature</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Link Destination</label>
                  <input
                    value={bannerForm.link}
                    onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })}
                    placeholder="e.g. /shop or /product/slug"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Image URL & Upload button */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ ...labelStyle, margin: 0 }}>Banner Image URL</label>
                  <label
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--primary)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "var(--primary-subtle, rgba(99,102,241,0.08))",
                      padding: "4px 10px",
                      borderRadius: "6px",
                    }}
                  >
                    <Upload size={12} />
                    <span>{uploadingImage ? "Uploading..." : "Upload from Computer"}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                  </label>
                </div>
                <input
                  value={bannerForm.image}
                  onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}
                  placeholder="Upload banner from computer or paste URL"
                  style={inputStyle}
                />
              </div>

              {/* Order & Status */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Display Order</label>
                  <input
                    type="number"
                    value={bannerForm.displayOrder}
                    onChange={(e) => setBannerForm({ ...bannerForm, displayOrder: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Active Status</label>
                  <select
                    value={bannerForm.isActive ? "true" : "false"}
                    onChange={(e) => setBannerForm({ ...bannerForm, isActive: e.target.value === "true" })}
                    style={selectStyle}
                  >
                    <option value="true">Active (Live)</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Optional Text & Color Overlay Section */}
              <div
                style={{
                  border: "1px dashed var(--border-color)",
                  borderRadius: "10px",
                  padding: "12px",
                  background: "var(--input-bg, rgba(0,0,0,0.02))",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowOptionalFields(!showOptionalFields)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    color: "var(--text-primary)",
                    fontWeight: 700,
                    fontSize: "12px",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Sliders size={14} color="var(--primary)" />
                    {bannerForm.bannerType === "top_strip"
                      ? "Announcement Text & Colors (Required for top ticker)"
                      : "Heading, Subheading & Colors (Optional Overlay)"}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--primary)" }}>
                    {showOptionalFields ? "Hide ▲" : "Show ▼"}
                  </span>
                </button>

                {showOptionalFields && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border-color)" }}>
                    <div>
                      <label style={labelStyle}>
                        {bannerForm.bannerType === "top_strip" ? "Announcement Headline *" : "Banner Headline (Optional)"}
                      </label>
                      <input
                        value={bannerForm.title}
                        onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                        placeholder={bannerForm.bannerType === "top_strip" ? "e.g. Free delivery on orders over ₹999 | Code: FESTIVE20" : "Leave blank for graphic banners with built-in text"}
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Sub-headline / Offer Text (Optional)</label>
                      <input
                        value={bannerForm.subtitle}
                        onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                        placeholder="e.g. Limited time promotion"
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div>
                        <label style={labelStyle}>Badge Tag (Optional)</label>
                        <input
                          value={bannerForm.badge}
                          onChange={(e) => setBannerForm({ ...bannerForm, badge: e.target.value })}
                          placeholder="e.g. HOT DEAL"
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>Button Text (Optional)</label>
                        <input
                          value={bannerForm.buttonText}
                          onChange={(e) => setBannerForm({ ...bannerForm, buttonText: e.target.value })}
                          placeholder="e.g. Shop Now"
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div>
                        <label style={labelStyle}>Background Color (Optional)</label>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <input
                            type="color"
                            value={bannerForm.bgColor}
                            onChange={(e) => setBannerForm({ ...bannerForm, bgColor: e.target.value })}
                            style={{ width: "36px", height: "36px", border: "none", cursor: "pointer", borderRadius: "8px" }}
                          />
                          <input
                            value={bannerForm.bgColor}
                            onChange={(e) => setBannerForm({ ...bannerForm, bgColor: e.target.value })}
                            style={{ ...inputStyle, fontFamily: "monospace" }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={labelStyle}>Text Color (Optional)</label>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <input
                            type="color"
                            value={bannerForm.textColor}
                            onChange={(e) => setBannerForm({ ...bannerForm, textColor: e.target.value })}
                            style={{ width: "36px", height: "36px", border: "none", cursor: "pointer", borderRadius: "8px" }}
                          />
                          <input
                            value={bannerForm.textColor}
                            onChange={(e) => setBannerForm({ ...bannerForm, textColor: e.target.value })}
                            style={{ ...inputStyle, fontFamily: "monospace" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "12px" }}>
                <button type="button" onClick={() => setShowBannerModal(false)} style={cancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={savingBanner} style={primaryBtn}>
                  {savingBanner ? "Saving..." : editingBanner ? "Save Changes" : "Create Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
