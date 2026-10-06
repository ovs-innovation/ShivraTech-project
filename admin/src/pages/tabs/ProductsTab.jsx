import { useCallback, useEffect, useState } from "react";
import { Package, RefreshCcw, Search, Trash2 } from "lucide-react";
import { apiGetProducts, apiDeleteProduct } from "../../api";
import { Badge, Spinner, ActionBtn, Pagination, iconBtn, inputWithIcon, tableStyle, thStyle, tdStyle } from "../../components/UI";

const formatRupees = (v = 0) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

export default function ProductsTab({ showToast, showConfirm }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (search) p.append("keyword", search);
      p.append("page", page);
      p.append("limit", 15);
      const res = await apiGetProducts(p.toString());
      setProducts(res.data?.products || []);
      setTotal(res.data?.total || 0);
      setPages(res.data?.pages || 1);
    } catch (e) { showToast(e.message, "error"); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = (id, title) => showConfirm(
    `Remove product "${title}" from the platform?`,
    async () => {
      try { await apiDeleteProduct(id); showToast("Product removed"); load(); }
      catch (e) { showToast(e.message, "error"); }
    }
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#6b7280", pointerEvents: "none" }} />
          <input id="product-search" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search products..." style={inputWithIcon} />
        </div>
        <button onClick={load} style={iconBtn} title="Refresh"><RefreshCcw size={16} /></button>
        <span style={{ color: "#6b7280", fontSize: "13px", whiteSpace: "nowrap" }}>{total} products</span>
      </div>

      {loading ? <Spinner /> : (
        <>
          <div style={{ overflowX: "auto", background: "var(--card-bg)", borderRadius: "16px", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
            <table style={tableStyle}>
              <thead><tr>
                {["Product", "Category", "Price", "Stock", "Seller", "Flags", "Actions"].map(h => <th key={h} style={thStyle}>{h}</th>)}
              </tr></thead>
              <tbody>
                {products.length === 0
                  ? <tr><td colSpan={7} style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>No products found</td></tr>
                  : products.map(p => (
                    <tr key={p._id}>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {p.mainImage
                            ? <img src={p.mainImage} alt="" style={{ width: 38, height: 38, borderRadius: "8px", objectFit: "cover", border: "1px solid var(--border-color)", flexShrink: 0 }} />
                            : <div style={{ width: 38, height: 38, borderRadius: "8px", background: "var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Package size={16} color="var(--text-muted)" /></div>}
                          <span style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "13px", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</span>
                        </div>
                      </td>
                      <td style={tdStyle}><Badge color="#6366f1">{p.categoryName}</Badge></td>
                      <td style={tdStyle}><span style={{ color: "#10b981", fontWeight: 700 }}>{formatRupees(p.price)}</span></td>
                      <td style={tdStyle}><span style={{ color: p.stock < 5 ? "#ef4444" : "var(--text-secondary)", fontWeight: p.stock < 5 ? 700 : 400 }}>{p.stock}</span></td>
                      <td style={tdStyle}><span style={{ color: "var(--text-muted)", fontSize: "12px" }}>{p.seller?.storeName || p.sellerName}</span></td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                          {p.isFeatured && <Badge color="#f59e0b">Featured</Badge>}
                          {p.isFlashSale && <Badge color="#ef4444">Sale</Badge>}
                          {p.isNewArrival && <Badge color="#3b82f6">New</Badge>}
                        </div>
                      </td>
                      <td style={tdStyle}><ActionBtn color="#ef4444" title="Remove" onClick={() => handleDelete(p._id, p.title)}><Trash2 size={14} /></ActionBtn></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pages={pages} setPage={setPage} />
        </>
      )}
    </div>
  );
}
