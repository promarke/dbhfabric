import React, { useState } from "react";
import { Package } from "lucide-react";
import type { AnalysisResult } from "./AnalysisDisplay";
import AddProductModal from "./inventory/AddProductModal";

interface Props {
  result: AnalysisResult;
  historyId?: string | null;
}

const AddToInventoryButton: React.FC<Props> = ({ result, historyId }) => {
  const [showModal, setShowModal] = useState(false);

  const prefill = {
    name: [result.category_en, result.fabric_name_en, result.embellishment_en].filter(Boolean).join(" ") || "Unnamed",
    category: result.category_en || "",
    fabric_type: result.fabric_name_en || "",
    colors: result.color_en ? [result.color_en] : ["Black"],
    description: [
      result.design_details_en && `Design: ${result.design_details_en}`,
      result.craftsmanship_en && `Craftsmanship: ${result.craftsmanship_en}`,
      result.additional_details_en && `Details: ${result.additional_details_en}`,
    ].filter(Boolean).join("\n"),
    analysis_id: historyId || undefined,
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
      >
        <Package className="w-3.5 h-3.5" />
        Add to Inventory
      </button>
      {showModal && (
        <AddProductModal
          open={showModal}
          onOpenChange={setShowModal}
          onSaved={() => {}}
          prefill={prefill as any}
        />
      )}
    </>
  );
};

export default AddToInventoryButton;
