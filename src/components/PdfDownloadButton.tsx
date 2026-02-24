import React, { useCallback } from "react";
import { Download } from "lucide-react";
import type { AnalysisResult } from "./AnalysisDisplay";

const fields = [
  { key: "fabric_name_en", label: "Fabric Name" },
  { key: "fabric_type_en", label: "Fabric Type" },
  { key: "embellishment_en", label: "Embellishment" },
  { key: "color_en", label: "Color" },
  { key: "craftsmanship_en", label: "Craftsmanship" },
  { key: "category_en", label: "Category" },
  { key: "additional_details_en", label: "Additional Details" },
] as const;

interface Props {
  results: AnalysisResult[];
}

const PdfDownloadButton: React.FC<Props> = ({ results }) => {
  const handleDownload = useCallback(async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    let y = 20;
    doc.setFontSize(18);
    doc.text("Borka / Abaya Analysis Report", 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, y);
    y += 15;

    results.forEach((result, idx) => {
      if (idx > 0) {
        doc.addPage();
        y = 20;
      }

      if (results.length > 1) {
        doc.setFontSize(14);
        doc.text(`Image ${idx + 1}`, 20, y);
        y += 10;
      }

      doc.setFontSize(12);
      fields.forEach(({ key, label }) => {
        const en = (result as any)[key];
        if (!en) return;

        if (y > 270) {
          doc.addPage();
          y = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.text(label, 20, y);
        y += 6;
        doc.setFont("helvetica", "normal");

        const lines = doc.splitTextToSize(en, 170);
        doc.text(lines, 20, y);
        y += lines.length * 5 + 5;
      });

      doc.setFont("helvetica", "bold");
      doc.text(`Confidence: ${result.confidence}`, 20, y);
      y += 10;
    });

    doc.save("abaya-analysis.pdf");
  }, [results]);

  if (results.length === 0) return null;

  return (
    <button
      onClick={handleDownload}
      className="w-full py-3 rounded-lg bg-secondary text-secondary-foreground font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
    >
      <Download className="w-4 h-4" />
      Download PDF
    </button>
  );
};

export default PdfDownloadButton;
