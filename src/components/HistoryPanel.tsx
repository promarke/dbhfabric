import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { History, Trash2, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface HistoryItem {
  id: string;
  fabric_name: string;
  fabric_name_en: string;
  color: string;
  color_en: string;
  category: string;
  category_en: string;
  confidence: string;
  created_at: string;
}

const HistoryRow: React.FC<{ item: HistoryItem; onDelete: (id: string) => void }> = ({ item, onDelete }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    const text = [
      item.fabric_name_en && `Fabric: ${item.fabric_name_en}`,
      item.category_en && `Category: ${item.category_en}`,
      item.color_en && `Color: ${item.color_en}`,
    ].filter(Boolean).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-muted/30">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">
          {item.fabric_name_en || item.fabric_name || "Unknown"}
        </p>
        <p className="text-xs text-muted-foreground">
          {item.category_en || item.category} • {item.color_en || item.color} • {new Date(item.created_at).toLocaleDateString()}
        </p>
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

  const fetchHistory = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("analysis_history")
      .select("id, fabric_name, fabric_name_en, color, color_en, category, category_en, confidence, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
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

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-foreground text-sm">Analysis History</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {isOpen && (
        <div className="border-t border-border max-h-64 overflow-y-auto">
          {loading ? (
            <p className="text-center py-4 text-sm text-muted-foreground">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-center py-4 text-sm text-muted-foreground">No history yet</p>
          ) : (
            <div className="divide-y divide-border">
              {items.map((item) => (
                <HistoryRow key={item.id} item={item} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;
