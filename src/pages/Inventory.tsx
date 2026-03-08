import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Plus, Package, Search, Upload, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import AddProductModal from "@/components/inventory/AddProductModal";
import ProductCard from "@/components/inventory/ProductCard";
import CSVImportModal from "@/components/inventory/CSVImportModal";
import CatalogModal from "@/components/inventory/CatalogModal";

export interface Product {
  id: string;
  created_at: string;
  name: string;
  category: string;
  price: number;
  discount_price: number | null;
  description: string;
  fabric_type: string;
  image_url: string;
  video_url: string;
  sizes: string[];
  colors: string[];
  featured: boolean;
  analysis_id: string | null;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  color: string;
  stock: number;
}

const Inventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load products");
      console.error(error);
    } else {
      setProducts((data as any[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category).filter(Boolean));
    return Array.from(cats);
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.fabric_type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = !filterCategory || p.category === filterCategory;
      return matchSearch && matchCat;
    });
  }, [products, searchQuery, filterCategory]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error("Delete failed");
    } else {
      toast.success("Product deleted");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    const { error } = await supabase.from("products").update({ featured: !current }).eq("id", id);
    if (error) {
      toast.error("Update failed");
    } else {
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, featured: !current } : p)));
    }
  };

  const exportCSV = () => {
    if (products.length === 0) return toast.error("No products to export");
    const headers = ["Name", "Category", "Price", "Discount Price", "Fabric Type", "Sizes", "Colors", "Featured", "Description"];
    const rows = products.map((p) => [
      `"${p.name}"`,
      `"${p.category}"`,
      p.price,
      p.discount_price ?? "",
      `"${p.fabric_type}"`,
      `"${p.sizes.join(", ")}"`,
      `"${p.colors.join(", ")}"`,
      p.featured ? "Yes" : "No",
      `"${(p.description || "").replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-hero text-primary-foreground py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-1.5 text-primary-foreground/70 hover:text-primary-foreground text-sm mb-4">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h1 className="text-3xl font-display font-bold flex items-center gap-2">
              <Package className="w-7 h-7" /> Inventory
            </h1>
            <div className="flex items-center gap-2">
              <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 text-sm font-medium transition-colors">
                <Download className="w-4 h-4" /> CSV
              </button>
              <button onClick={() => { setEditProduct(null); setShowAddModal(true); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-colors">
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-md border border-input bg-background text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{products.length}</p>
            <p className="text-xs text-muted-foreground">Total Products</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{products.filter((p) => p.featured).length}</p>
            <p className="text-xs text-muted-foreground">Featured</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{categories.length}</p>
            <p className="text-xs text-muted-foreground">Categories</p>
          </div>
        </div>

        {/* Products */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {products.length === 0 ? "No products yet. Add your first product!" : "No matching products found."}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDelete={handleDelete}
                onToggleFeatured={handleToggleFeatured}
                onEdit={(p) => { setEditProduct(p); setShowAddModal(true); }}
              />
            ))}
          </div>
        )}
      </main>

      {showAddModal && (
        <AddProductModal
          open={showAddModal}
          onOpenChange={setShowAddModal}
          onSaved={fetchProducts}
          editProduct={editProduct}
        />
      )}
    </div>
  );
};

export default Inventory;
