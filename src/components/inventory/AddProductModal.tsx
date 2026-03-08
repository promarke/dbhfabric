import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { X, Plus } from "lucide-react";
import type { Product } from "@/pages/Inventory";

const DEFAULT_SIZES = ['52"', '54"', '56"', '58"', '60"'];
const CATEGORY_OPTIONS = ["Borka", "Abaya", "Hijab", "Khimar", "Niqab", "Kaftan", "Jilbab", "Farasha", "Other"];

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  editProduct?: Product | null;
  prefill?: Partial<Product>;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ open, onOpenChange, onSaved, editProduct, prefill }) => {
  const isEdit = !!editProduct;

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [description, setDescription] = useState("");
  const [fabricType, setFabricType] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [sizes, setSizes] = useState<string[]>(DEFAULT_SIZES);
  const [colors, setColors] = useState<string[]>(["Black"]);
  const [featured, setFeatured] = useState(false);
  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editProduct) {
      setName(editProduct.name);
      setCategory(editProduct.category);
      setPrice(String(editProduct.price));
      setDiscountPrice(editProduct.discount_price != null ? String(editProduct.discount_price) : "");
      setDescription(editProduct.description || "");
      setFabricType(editProduct.fabric_type || "");
      setImageUrl(editProduct.image_url || "");
      setVideoUrl(editProduct.video_url || "");
      setSizes(editProduct.sizes || DEFAULT_SIZES);
      setColors(editProduct.colors || ["Black"]);
      setFeatured(editProduct.featured);
    } else if (prefill) {
      if (prefill.name) setName(prefill.name);
      if (prefill.category) setCategory(prefill.category);
      if (prefill.fabric_type) setFabricType(prefill.fabric_type);
      if (prefill.colors) setColors(prefill.colors);
      if (prefill.description) setDescription(prefill.description);
    }
  }, [editProduct, prefill]);

  const handleAddSize = () => {
    const s = newSize.trim();
    if (s && !sizes.includes(s)) {
      setSizes([...sizes, s]);
      setNewSize("");
    }
  };

  const handleAddColor = () => {
    const c = newColor.trim();
    if (c && !colors.includes(c)) {
      setColors([...colors, c]);
      setNewColor("");
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Product name is required");
    if (!price || isNaN(Number(price))) return toast.error("Valid price is required");

    setSaving(true);
    try {
      const productData = {
        name: name.trim(),
        category,
        price: Number(price),
        discount_price: discountPrice ? Number(discountPrice) : null,
        description: description.trim(),
        fabric_type: fabricType.trim(),
        image_url: imageUrl.trim(),
        video_url: videoUrl.trim(),
        sizes,
        colors,
        featured,
      };

      let productId: string;

      if (isEdit) {
        const { error } = await supabase.from("products").update(productData).eq("id", editProduct.id);
        if (error) throw error;
        productId = editProduct.id;
        // Delete old variants and recreate
        await supabase.from("product_variants").delete().eq("product_id", productId);
      } else {
        const { data, error } = await supabase.from("products").insert(productData).select("id").single();
        if (error) throw error;
        productId = (data as any).id;
      }

      // Create variants: each size × color = 5 default stock
      const variants = sizes.flatMap((size) =>
        colors.map((color) => ({
          product_id: productId,
          size,
          color,
          stock: 5,
        }))
      );

      if (variants.length > 0) {
        const { error: vErr } = await supabase.from("product_variants").insert(variants);
        if (vErr) console.error("Variant insert error:", vErr);
      }

      toast.success(isEdit ? "Product updated" : "Product added");
      onSaved();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{isEdit ? "Edit Product" : "Add Product"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Product Name *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nida Abaya Black" />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Category *</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm">
              <option value="">Select Category</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Price row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Price (৳) *</label>
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Discount Price (৳)</label>
              <Input type="number" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} placeholder="Leave empty for no sale" />
            </div>
          </div>

          {/* Fabric Type */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Fabric Type</label>
            <Input value={fabricType} onChange={(e) => setFabricType(e.target.value)} placeholder="e.g. Nida, Zoom, Jorjet" />
          </div>

          {/* Image URL */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Image URL</label>
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Paste image URL" />
          </div>

          {/* Video URL */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Video URL</label>
            <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Paste video URL (optional)" />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Product description..."
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm min-h-[80px] resize-y"
            />
          </div>

          {/* Sizes */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Sizes</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {sizes.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-muted rounded-md">
                  {s}
                  <button onClick={() => setSizes(sizes.filter((x) => x !== s))} className="hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={newSize} onChange={(e) => setNewSize(e.target.value)} placeholder='e.g. 62"' className="flex-1" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSize())} />
              <button onClick={handleAddSize} className="px-3 py-2 rounded-md bg-muted hover:bg-muted/80 text-sm"><Plus className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Colors */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Colors</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {colors.map((c) => (
                <span key={c} className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-muted rounded-md">
                  {c}
                  <button onClick={() => setColors(colors.filter((x) => x !== c))} className="hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={newColor} onChange={(e) => setNewColor(e.target.value)} placeholder="e.g. Navy" className="flex-1" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddColor())} />
              <button onClick={handleAddColor} className="px-3 py-2 rounded-md bg-muted hover:bg-muted/80 text-sm"><Plus className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Featured */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="rounded border-input" />
            <span className="text-sm text-foreground">Featured on homepage</span>
          </label>

          {/* Variant info */}
          <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
            <strong>{sizes.length} sizes × {colors.length} colors = {sizes.length * colors.length} variants</strong> — each with default 5 stock
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all disabled:opacity-50"
          >
            {saving ? "Saving..." : isEdit ? "Update Product" : "Add Product"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
