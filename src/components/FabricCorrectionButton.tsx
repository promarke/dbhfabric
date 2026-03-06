import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Edit3, Check, X } from "lucide-react";
import { toast } from "sonner";

const FABRICS = [
  "Crepe", "Chiffon", "Georgette", "Nida", "Jersey", "Silk", "Cotton", "Polyester",
  "ZOOM", "CEY", "ORGANJA", "POKA", "AROWA", "TICTOC", "PRINT", "BABLA", "BELVET", "LILEN",
  "KASMIRI", "FAKRU PRINT", "KORIYAN SIMAR", "JORI SHIPON",
  "Satin", "Linen", "Rayon", "Viscose", "Modal", "Tencel", "Lycra", "Spandex",
  "Twill", "Jacquard", "Dobby", "Poplin", "Oxford",
  "French Terry", "Ponte", "Interlock", "Rib Knit", "Pique",
  "Bamboo", "Wool", "Acrylic", "Nylon", "Hemp", "Jute", "Ramie",
  "Muslin", "Lawn", "Voile", "Batiste", "Cambric", "Challis", "Charmeuse",
  "Damask", "Dupioni", "Faille", "Flannel", "Fleece", "Gabardine", "Habotai",
  "Mikado", "Organza", "Taffeta", "Tulle", "Velour",
  "Brocade", "Canvas", "Denim", "Drill", "Duck", "Sateen",
  "Chambray", "Corduroy", "Crepe de Chine", "Duchess Satin",
  "Mesh", "Net", "Scuba", "Terry Cloth", "Waffle Knit",
];

interface FabricCorrectionButtonProps {
  analysisId?: string;
  currentFabric: string;
  currentCategory?: string;
  onCorrected?: (newFabric: string) => void;
}

const FabricCorrectionButton: React.FC<FabricCorrectionButtonProps> = ({
  analysisId,
  currentFabric,
  currentCategory,
  onCorrected,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFabric, setSelectedFabric] = useState(currentFabric);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);

  const filteredFabrics = FABRICS.filter((f) =>
    f.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async () => {
    if (selectedFabric === currentFabric) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    try {
      // Save correction record
      await supabase.from("fabric_corrections").insert({
        analysis_id: analysisId || "00000000-0000-0000-0000-000000000000",
        original_fabric: currentFabric,
        corrected_fabric: selectedFabric,
        original_category: currentCategory || null,
      });

      // Update the analysis_history record if we have an ID
      if (analysisId) {
        await supabase
          .from("analysis_history")
          .update({ fabric_name_en: selectedFabric, fabric_name: selectedFabric } as any)
          .eq("id", analysisId);
      }

      toast.success(`ফেব্রিক "${currentFabric}" → "${selectedFabric}" সংশোধন করা হয়েছে`);
      onCorrected?.(selectedFabric);
      setIsEditing(false);
    } catch (e) {
      console.error("Correction save failed:", e);
      toast.error("সংশোধন সেভ করতে ব্যর্থ");
    } finally {
      setSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="inline-flex items-center gap-1 text-[10px] text-accent/70 hover:text-accent transition-colors px-1.5 py-0.5 rounded hover:bg-accent/10"
        title="ফেব্রিক সংশোধন করুন"
      >
        <Edit3 className="w-3 h-3" />
        সংশোধন
      </button>
    );
  }

  return (
    <div className="mt-2 p-3 border border-accent/30 rounded-lg bg-accent/5 space-y-2 animate-fade-in">
      <p className="text-xs font-medium text-foreground">সঠিক ফেব্রিক নির্বাচন করুন:</p>
      <input
        type="text"
        placeholder="Search fabric..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-2.5 py-1.5 text-xs rounded-md bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
      />
      <div className="max-h-32 overflow-y-auto flex flex-wrap gap-1">
        {filteredFabrics.map((fabric) => (
          <button
            key={fabric}
            onClick={() => setSelectedFabric(fabric)}
            className={`text-[11px] px-2 py-1 rounded-md border transition-colors ${
              selectedFabric === fabric
                ? "bg-accent text-accent-foreground border-accent font-semibold"
                : fabric === currentFabric
                ? "bg-destructive/10 text-destructive border-destructive/30 line-through"
                : "bg-background text-foreground border-border hover:border-accent/50"
            }`}
          >
            {fabric}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving || selectedFabric === currentFabric}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          <Check className="w-3 h-3" />
          {saving ? "সেভ হচ্ছে..." : "সংশোধন সেভ"}
        </button>
        <button
          onClick={() => { setIsEditing(false); setSelectedFabric(currentFabric); setSearchQuery(""); }}
          className="px-3 py-1.5 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default FabricCorrectionButton;
