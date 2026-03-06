import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { History, Trash2, ChevronDown, ChevronUp, Copy, Check, Search, X } from "lucide-react";
import { toast } from "sonner";

interface HistoryItem {
  id: string;
  fabric_name: string;
  fabric_name_en: string;
  fabric_type: string;
  fabric_type_en: string;
  embellishment: string;
  embellishment_en: string;
  color: string;
  color_en: string;
  craftsmanship: string;
  craftsmanship_en: string;
  category: string;
  category_en: string;
  confidence: string;
  created_at: string;
  design_details: string;
  design_details_en: string;
}

const HistoryRow: React.FC<{ item: HistoryItem; onDelete: (id: string) => void }> = ({ item, onDelete }) => {
  const [copied, setCopied] = React.useState(false);

  const productName = [item.category_en, item.fabric_name_en, item.embellishment_en].filter(Boolean).join(" ") || "Unknown Product";

  const handleCopy = () => {
    const text = [
      `Product: ${productName}`,
      item.fabric_name_en && `Fabric: ${item.fabric_name_en}`,
      item.fabric_type_en && `Type: ${item.fabric_type_en}`,
      item.category_en && `Category: ${item.category_en}`,
      item.color_en && `Color: ${item.color_en}`,
      item.embellishment_en && `Embellishment: ${item.embellishment_en}`,
      item.craftsmanship_en && `Craftsmanship: ${item.craftsmanship_en}`,
      item.design_details_en && `Design: ${item.design_details_en}`,
    ].filter(Boolean).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-muted/30">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground truncate">
          📋 {productName}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {item.color_en || item.color} • {item.fabric_type_en || item.fabric_name_en || item.fabric_name} • {new Date(item.created_at).toLocaleDateString()}
        </p>
        {(item.design_details_en || item.design_details) && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            🌸 {item.design_details_en || item.design_details}
          </p>
        )}
      </div>
      <button onClick={handleCopy} className="p-1.5 text-muted-foreground hover:text-accent transition-colors ml-1">
        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
      <button onClick={() => onDelete(item.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors ml-1">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

const HistoryPanel: React.FC = () => {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const fetchHistory = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("analysis_history")
      .select("id, fabric_name, fabric_name_en, fabric_type, fabric_type_en, embellishment, embellishment_en, color, color_en, craftsmanship, craftsmanship_en, category, category_en, confidence, created_at, design_details, design_details_en")
      .order("created_at", { ascending: false })
      .limit(50);
    setItems((data as HistoryItem[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) fetchHistory();
  }, [isOpen]);

  const handleDelete = async (id: string) => {
    await supabase.from("analysis_history").delete().eq("id", id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Get unique categories from loaded items
  const categories = React.useMemo(() => {
    const cats = new Set<string>();
    items.forEach((item) => {
      if (item.category_en) cats.add(item.category_en);
    });
    return Array.from(cats).sort();
  }, [items]);

  // Filter items
  const filteredItems = React.useMemo(() => {
    let result = items;
    if (selectedCategory) {
      result = result.filter((item) => item.category_en === selectedCategory);
    }
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter((item) => {
        const productName = [item.category_en, item.fabric_name_en, item.embellishment_en].join(" ").toLowerCase();
        return (
          productName.includes(q) ||
          (item.fabric_name_en || "").toLowerCase().includes(q) ||
          (item.fabric_name || "").toLowerCase().includes(q) ||
          (item.color_en || "").toLowerCase().includes(q) ||
          (item.color || "").toLowerCase().includes(q) ||
          (item.category_en || "").toLowerCase().includes(q) ||
          (item.category || "").toLowerCase().includes(q) ||
          (item.embellishment_en || "").toLowerCase().includes(q) ||
          (item.design_details_en || "").toLowerCase().includes(q)
        );
      });
    }
    return result;
  }, [items, selectedCategory, searchText]);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-foreground text-sm">Analysis History</span>
          {items.length > 0 && (
            <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{items.length}</span>
          )}
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {isOpen && (
        <div className="border-t border-border">
          {/* Search & Filter Bar */}
          <div className="px-3 py-2 space-y-2 bg-muted/20 border-b border-border">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="সার্চ করুন..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 text-xs rounded-md bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
              {searchText && (
                <button onClick={() => setSearchText("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setSelectedCategory("")}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                    !selectedCategory
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-background text-muted-foreground border-border hover:border-accent/50"
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(selectedCategory === cat ? "" : cat)}
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                      selectedCategory === cat
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-background text-muted-foreground border-border hover:border-accent/50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Results */}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <p className="text-center py-4 text-sm text-muted-foreground">Loading...</p>
            ) : filteredItems.length === 0 ? (
              <p className="text-center py-4 text-sm text-muted-foreground">
                {items.length === 0 ? "No history yet" : "কোনো ফলাফল পাওয়া যায়নি"}
              </p>
            ) : (
              <div className="divide-y divide-border">
                {filteredItems.map((item) => (
                  <HistoryRow key={item.id} item={item} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;