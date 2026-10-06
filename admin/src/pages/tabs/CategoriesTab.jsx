import { useCallback, useEffect, useState } from "react";
import { Edit2, Loader2, Plus, Trash2, X } from "lucide-react";
import { apiGetCategories, apiCreateCategory, apiUpdateCategory, apiDeleteCategory } from "../../api";
import {
  Spinner, ActionBtn, overlay, modal,
  primaryBtn, cancelBtn, inputStyle,
} from "../../components/UI";

const labelStyle = {
  display: "block", color: "var(--text-secondary)", fontSize: "11px",
  fontWeight: 600, marginBottom: "6px",
  textTransform: "uppercase", letterSpacing: "0.5px",
};

export default function CategoriesTab({ showToast, showConfirm }) {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", icon: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGetCategories();
      setCats(res.data || []);
    } catch (e) { showToast(e.message, "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditCat(null);
    setForm({ name: "", slug: "", description: "", icon: "" });
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditCat(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || "", icon: cat.icon || "" });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.slug) { showToast("Name and slug are required", "error"); return; }
    setSaving(true);
    try {
      if (editCat) {
        await apiUpdateCategory(editCat._id, form);
        showToast("Category updated!");
      } else {
        await apiCreateCategory(form);
        showToast("Category created!");
      }
      setShowModal(false);
      load();
    } catch (e) { showToast(e.message, "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = (cat) => showConfirm(
    `Delete category "${cat.name}"? Products in this category will not be deleted.`,
    async () => {
      try { await apiDeleteCategory(cat._id); showToast("Category deleted"); load(); }
      catch (e) { showToast(e.message, "error"); }
    }
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>{cats.length} categories</span>
        <button id="add-category-btn" onClick={openAdd} style={primaryBtn}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      {loading ? <Spinner /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "16px" }}>
          {cats.map(cat => (
            <div key={cat._id} style={{
              background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "16px",
              padding: "20px", display: "flex", flexDirection: "column", gap: "12px",
              boxShadow: "var(--card-shadow)",
              transition: "border-color 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#6366f144"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--card-border)"}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: 42, height: 42, borderRadius: "12px", background: "#6366f115", border: "1px solid #6366f122", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
                    {cat.icon || "📦"}
                  </div>
                  <div>
                    <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "15px" }}>{cat.name}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "12px" }}>/{cat.slug}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <ActionBtn color="#6366f1" title="Edit" onClick={() => openEdit(cat)}><Edit2 size={14} /></ActionBtn>
                  <ActionBtn color="#ef4444" title="Delete" onClick={() => handleDelete(cat)}><Trash2 size={14} /></ActionBtn>
                </div>
              </div>
              {cat.description && (
                <p style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: "1.5" }}>{cat.description}</p>
              )}
            </div>
          ))}

          {/* Add Card */}
          <button onClick={openAdd} style={{
            background: "transparent", border: "2px dashed var(--input-border)", borderRadius: "16px",
            padding: "20px", display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: "10px", cursor: "pointer", color: "var(--text-muted)",
            transition: "all 0.2s", minHeight: "100px",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#a78bfa"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--input-border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
          >
            <Plus size={24} />
            <span style={{ fontWeight: 600, fontSize: "13px" }}>New Category</span>
          </button>
        </div>
      )}

      {showModal && (
        <div style={overlay}>
          <div style={modal}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: "18px" }}>
                {editCat ? "Edit Category" : "New Category"}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Name *</label>
                <input id="cat-name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Electronics" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Slug *</label>
                <input id="cat-slug" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })} placeholder="e.g. electronics" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Icon (emoji)</label>
                <input id="cat-icon" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="e.g. 📱" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <input id="cat-desc" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Short category description" style={inputStyle} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button onClick={() => setShowModal(false)} style={cancelBtn}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={primaryBtn}>
                {saving && <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} />}
                {saving ? "Saving..." : editCat ? "Save Changes" : "Create Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
