import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Save } from "lucide-react";

interface Variant {
  id: string;
  product_id: string;
  size: string;
  color: string;
  stock: number;
}

interface VariantManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
}

const VariantManager: React.FC<VariantManagerProps> = ({ open, onOpenChange, productId, productName }) => {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changed, setChanged] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!open) return;
    const fetchVariants = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", productId)
        .order("color")
        .order("size");
      if (error) {
        toast.error("Failed to load variants");
      } else {
        setVariants((data as any[]) || []);
      }
      setLoading(false);
    };
    fetchVariants();
    setChanged({});
  }, [open, productId]);

  const sizes = [...new Set(variants.map((v) => v.size))];
  const colors = [...new Set(variants.map((v) => v.color))];

  const getVariant = (size: string, color: string) => variants.find((v) => v.size === size && v.color === color);

  const getStock = (variant: Variant | undefined) => {
    if (!variant) return 0;
    return changed[variant.id] ?? variant.stock;
  };

  const handleStockChange = (variantId: string, value: string) => {
    const num = parseInt(value) || 0;
    setChanged((prev) => ({ ...prev, [variantId]: Math.max(0, num) }));
  };

  const handleSave = async () => {
    const updates = Object.entries(changed);
    if (updates.length === 0) return toast.info("No changes");

    setSaving(true);
    try {
      for (const [id, stock] of updates) {
        const { error } = await supabase
          .from("product_variants")
          .update({ stock })
          .eq("id", id);
        if (error) throw error;
      }
      toast.success(`${updates.length} variant(s) updated`);
      setChanged({});
      // Refresh
      const { data } = await supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", productId)
        .order("color")
        .order("size");
      setVariants((data as any[]) || []);
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const totalStock = variants.reduce((sum, v) => sum + (changed[v.id] ?? v.stock), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-base">
            📦 Variants — {productName}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading variants...</div>
        ) : variants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No variants found</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {colors.length} colors × {sizes.length} sizes = {variants.length} variants · Total stock: <strong className="text-foreground">{totalStock}</strong>
              </p>
              {Object.keys(changed).length > 0 && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? "Saving..." : `Save (${Object.keys(changed).length})`}
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="text-left text-xs font-medium text-muted-foreground p-2 border-b border-border sticky left-0 bg-background">
                      Size ↓ / Color →
                    </th>
                    {colors.map((color) => (
                      <th key={color} className="text-center text-xs font-medium text-muted-foreground p-2 border-b border-border whitespace-nowrap">
                        {color}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((size) => (
                    <tr key={size} className="hover:bg-muted/30">
                      <td className="p-2 border-b border-border font-medium text-foreground text-xs sticky left-0 bg-background">
                        {size}
                      </td>
                      {colors.map((color) => {
                        const variant = getVariant(size, color);
                        const stock = getStock(variant);
                        const isChanged = variant && changed[variant.id] !== undefined;
                        return (
                          <td key={color} className="p-1.5 border-b border-border text-center">
                            {variant ? (
                              <Input
                                type="number"
                                min={0}
                                value={stock}
                                onChange={(e) => handleStockChange(variant.id, e.target.value)}
                                className={`w-16 mx-auto text-center text-xs h-8 ${isChanged ? "border-accent ring-1 ring-accent/30" : ""}`}
                              />
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VariantManager;
