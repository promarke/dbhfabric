import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Share2, Copy, Check, ExternalLink } from "lucide-react";
import type { Product } from "@/pages/Inventory";

interface CatalogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
}

const CatalogModal: React.FC<CatalogModalProps> = ({ open, onOpenChange, products }) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleProduct = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setGenerated(false);
  };

  const selectAll = () => {
    if (selected.size === products.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(products.map((p) => p.id)));
    }
    setGenerated(false);
  };

  const selectedProducts = useMemo(
    () => products.filter((p) => selected.has(p.id)),
    [products, selected]
  );

  const catalogHTML = useMemo(() => {
    if (selectedProducts.length === 0) return "";
    const items = selectedProducts
      .map(
        (p) => `
      <div style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;background:#fff;break-inside:avoid;margin-bottom:16px">
        ${p.image_url ? `<img src="${p.image_url}" style="width:100%;height:200px;object-fit:cover" alt="${p.name}"/>` : `<div style="width:100%;height:200px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;color:#9ca3af">No Image</div>`}
        <div style="padding:12px">
          <h3 style="font-size:16px;font-weight:700;margin:0 0 4px">${p.name}</h3>
          <p style="font-size:12px;color:#6b7280;margin:0 0 8px">${p.category} · ${p.fabric_type}</p>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            ${p.discount_price != null ? `<span style="font-size:18px;font-weight:700">৳${p.discount_price}</span><span style="font-size:14px;text-decoration:line-through;color:#9ca3af">৳${p.price}</span>` : `<span style="font-size:18px;font-weight:700">৳${p.price}</span>`}
          </div>
          <p style="font-size:11px;color:#6b7280">Sizes: ${p.sizes.join(", ")}</p>
          <p style="font-size:11px;color:#6b7280">Colors: ${p.colors.join(", ")}</p>
          ${p.description ? `<p style="font-size:12px;color:#374151;margin-top:8px">${p.description}</p>` : ""}
        </div>
      </div>`
      )
      .join("");

    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Product Catalog</title>
<style>
  body{font-family:system-ui,sans-serif;background:#f9fafb;margin:0;padding:20px}
  .header{text-align:center;padding:24px 0;margin-bottom:20px}
  .header h1{font-size:28px;font-weight:800;margin:0;color:#1f2937}
  .header p{font-size:14px;color:#6b7280;margin:4px 0 0}
  .grid{columns:2 280px;column-gap:16px;max-width:900px;margin:0 auto}
  @media(max-width:600px){.grid{columns:1}}
</style></head>
<body>
<div class="header">
  <h1>📋 Product Catalog</h1>
  <p>${selectedProducts.length} Products · Generated ${new Date().toLocaleDateString()}</p>
</div>
<div class="grid">${items}</div>
</body></html>`;
  }, [selectedProducts]);

  const handleGenerate = () => {
    if (selected.size === 0) return toast.error("Select at least one product");
    setGenerated(true);
  };

  const handleCopyHTML = async () => {
    await navigator.clipboard.writeText(catalogHTML);
    setCopied(true);
    toast.success("Catalog HTML copied");
    setTimeout(() => setCopied(false), 1500);
  };

  const handleOpenPreview = () => {
    const blob = new Blob([catalogHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const handleDownload = () => {
    const blob = new Blob([catalogHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `catalog_${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Catalog downloaded");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Share2 className="w-5 h-5" /> Create Catalog
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{selected.size} of {products.length} selected</p>
            <button onClick={selectAll} className="text-xs text-accent hover:underline">
              {selected.size === products.length ? "Deselect All" : "Select All"}
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1">
            {products.map((p) => (
              <label key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={() => toggleProduct(p.id)}
                  className="rounded border-input"
                />
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {p.image_url ? (
                    <img src={p.image_url} alt="" className="w-8 h-8 rounded object-cover bg-muted/30" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-muted/30" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.category} · ৳{p.discount_price ?? p.price}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {!generated ? (
            <button
              onClick={handleGenerate}
              disabled={selected.size === 0}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
            >
              Generate Catalog ({selected.size} products)
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground text-center">✅ Catalog Ready!</p>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={handleOpenPreview} className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-accent/10 text-accent text-xs font-semibold hover:bg-accent/20 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" /> Preview
                </button>
                <button onClick={handleDownload} className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors">
                  📥 Download
                </button>
                <button onClick={handleCopyHTML} className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-muted text-foreground text-xs font-semibold hover:bg-muted/80 transition-colors">
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy HTML"}
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CatalogModal;
