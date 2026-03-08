import React, { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";

interface CSVImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
}

interface ParsedRow {
  name: string;
  category: string;
  price: number;
  discount_price: number | null;
  fabric_type: string;
  image_url: string;
  video_url: string;
  sizes: string[];
  colors: string[];
  featured: boolean;
  description: string;
}

const REQUIRED_HEADERS = ["Name"];

const parseCSV = (text: string): { headers: string[]; rows: string[][] } => {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (line[i] === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += line[i];
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);
  return { headers, rows };
};

const CSVImportModal: React.FC<CSVImportModalProps> = ({ open, onOpenChange, onImported }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.name.endsWith(".csv")) return toast.error("Please select a CSV file");
    setFile(f);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const { headers, rows } = parseCSV(text);
      const errs: string[] = [];

      const headerMap: Record<string, number> = {};
      headers.forEach((h, i) => { headerMap[h.toLowerCase()] = i; });

      if (!("name" in headerMap)) {
        errs.push("Missing required column: Name");
        setErrors(errs);
        setParsed([]);
        return;
      }

      const get = (row: string[], key: string) => {
        const idx = headerMap[key.toLowerCase()];
        return idx !== undefined ? row[idx] || "" : "";
      };

      const products: ParsedRow[] = [];
      rows.forEach((row, i) => {
        const name = get(row, "name");
        if (!name) {
          errs.push(`Row ${i + 2}: Missing name, skipped`);
          return;
        }
        const priceStr = get(row, "price");
        const price = parseFloat(priceStr) || 0;
        const dpStr = get(row, "discount price") || get(row, "discount_price");
        const discount_price = dpStr ? parseFloat(dpStr) || null : null;

        const sizesStr = get(row, "sizes");
        const sizes = sizesStr ? sizesStr.split(/[,;|]/).map((s) => s.trim()).filter(Boolean) : ['52"', '54"', '56"', '58"', '60"'];

        const colorsStr = get(row, "colors");
        const colors = colorsStr ? colorsStr.split(/[,;|]/).map((s) => s.trim()).filter(Boolean) : ["Black"];

        const featuredStr = get(row, "featured").toLowerCase();
        const featured = featuredStr === "yes" || featuredStr === "true" || featuredStr === "1";

        products.push({
          name,
          category: get(row, "category") || "",
          price,
          discount_price,
          fabric_type: get(row, "fabric type") || get(row, "fabric_type") || "",
          image_url: get(row, "image url") || get(row, "image_url") || "",
          video_url: get(row, "video url") || get(row, "video_url") || "",
          sizes,
          colors,
          featured,
          description: get(row, "description") || "",
        });
      });

      setParsed(products);
      setErrors(errs);
    };
    reader.readAsText(f);
  };

  const handleImport = async () => {
    if (parsed.length === 0) return;
    setImporting(true);
    let success = 0;
    let failed = 0;

    for (const product of parsed) {
      try {
        const { data, error } = await supabase
          .from("products")
          .insert({
            name: product.name,
            category: product.category,
            price: product.price,
            discount_price: product.discount_price,
            fabric_type: product.fabric_type,
            image_url: product.image_url,
            video_url: product.video_url,
            sizes: product.sizes,
            colors: product.colors,
            featured: product.featured,
            description: product.description,
          })
          .select("id")
          .single();

        if (error) throw error;

        // Create variants
        const variants = product.sizes.flatMap((size) =>
          product.colors.map((color) => ({
            product_id: (data as any).id,
            size,
            color,
            stock: 5,
          }))
        );
        if (variants.length > 0) {
          await supabase.from("product_variants").insert(variants);
        }
        success++;
      } catch {
        failed++;
      }
    }

    setImportResult({ success, failed });
    setImporting(false);
    if (success > 0) {
      toast.success(`${success} products imported`);
      onImported();
    }
  };

  const downloadTemplate = () => {
    const csv = "Name,Category,Price,Discount Price,Fabric Type,Sizes,Colors,Featured,Description,Image URL,Video URL\nSample Abaya,Abaya,1500,1200,Nida,\"52\"\",54\"\",56\"\",58\"\",60\"\"\",\"Black,Navy\",No,Sample description,,";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <FileText className="w-5 h-5" /> CSV Bulk Import
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <button onClick={downloadTemplate} className="text-xs text-accent hover:underline">
            📥 Download CSV Template
          </button>

          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-accent/50 transition-colors"
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {file ? file.name : "Click to select CSV file"}
            </p>
            <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
          </div>

          {errors.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 space-y-1">
              {errors.map((err, i) => (
                <p key={i} className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {err}
                </p>
              ))}
            </div>
          )}

          {parsed.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">
                ✅ {parsed.length} products ready to import
              </p>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {parsed.map((p, i) => (
                  <div key={i} className="text-xs bg-muted/50 rounded p-2 flex items-center justify-between">
                    <span className="font-medium text-foreground truncate">{p.name}</span>
                    <span className="text-muted-foreground shrink-0 ml-2">
                      {p.category} · ৳{p.price} · {p.sizes.length}sz × {p.colors.length}cl
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleImport}
                disabled={importing}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all disabled:opacity-50"
              >
                {importing ? "Importing..." : `Import ${parsed.length} Products`}
              </button>
            </div>
          )}

          {importResult && (
            <div className="bg-card border border-border rounded-lg p-4 text-center space-y-1">
              <CheckCircle2 className="w-6 h-6 mx-auto text-green-600" />
              <p className="text-sm font-medium text-foreground">{importResult.success} imported</p>
              {importResult.failed > 0 && (
                <p className="text-xs text-destructive">{importResult.failed} failed</p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CSVImportModal;
