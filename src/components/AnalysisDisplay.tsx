import React from "react";
import { Loader2, Copy, Check } from "lucide-react";
import PdfDownloadButton from "./PdfDownloadButton";
import FabricCorrectionButton from "./FabricCorrectionButton";
import { toast } from "sonner";

export interface AnalysisResult {
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
  additional_details: string;
  additional_details_en: string;
  design_details: string;
  design_details_en: string;
  confidence: string;
  category_reasoning?: string;
  fabric_confidence?: string;
  fabric_reasoning?: string;
}

interface AnalysisDisplayProps {
  results: { result: AnalysisResult; preview: string; historyId?: string | null }[];
  isLoading: boolean;
  error: string | null;
}

const fields = [
  { key: "fabric_name_en", label: "Fabric Name", icon: "🧵" },
  { key: "fabric_type_en", label: "Fabric Type", icon: "🪡" },
  { key: "embellishment_en", label: "Embellishment", icon: "✨" },
  { key: "color_en", label: "Color", icon: "🎨" },
  { key: "craftsmanship_en", label: "Craftsmanship", icon: "🖌️" },
  { key: "category_en", label: "Category", icon: "📂" },
  { key: "design_details_en", label: "Design Details", icon: "🌸" },
  { key: "additional_details_en", label: "Additional Details", icon: "📝" },
] as const;

const getConfidenceInfo = (confidence: string) => {
  if (confidence === "high") return { color: "bg-green-100 text-green-800 border-green-300", label: "High", emoji: "🟢" };
  if (confidence === "medium") return { color: "bg-yellow-100 text-yellow-800 border-yellow-300", label: "Medium", emoji: "🟡" };
  return { color: "bg-red-100 text-red-800 border-red-300", label: "Low", emoji: "🔴" };
};

const CopyButton: React.FC<{ text: string; label: string }> = ({ text, label }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label} copied`);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 p-1.5 rounded-md hover:bg-accent/10 text-muted-foreground hover:text-accent transition-colors"
      title={`Copy: ${text}`}
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
};

const CopyAllButton: React.FC<{ result: AnalysisResult }> = ({ result }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyAll = async () => {
    const lines = fields
      .map(({ key, label }) => {
        const val = (result as any)[key];
        return val ? `${label}: ${val}` : null;
      })
      .filter(Boolean)
      .join("\n");
    await navigator.clipboard.writeText(lines);
    setCopied(true);
    toast.success("All data copied");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopyAll}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-semibold hover:bg-accent/20 transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : "Copy All"}
    </button>
  );
};

const generateProductNames = (result: AnalysisResult & { product_name?: string }) => {
  const parts = [
    result.category_en,
    result.fabric_name_en,
    result.embellishment_en,
  ].filter(Boolean);
  const shortName = parts.join(" ") || "Unknown Product";
  const detailedName = parts.join(" — ") || "Unknown Product";
  return { shortName, detailedName };
};

const SingleResult: React.FC<{ result: AnalysisResult; index?: number }> = ({ result, index }) => {
  const conf = getConfidenceInfo(result.confidence);
  const { shortName, detailedName } = generateProductNames(result);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-display font-semibold text-foreground">
          {index !== undefined ? `Image ${index + 1} — Results` : "Analysis Results"}
        </h3>
        <div className="flex items-center gap-2">
          <CopyAllButton result={result} />
          <span className={`text-xs font-medium px-3 py-1 rounded-full border ${conf.color}`}>
            Confidence: {conf.label}
          </span>
        </div>
      </div>

      {/* Product Names */}
      <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-accent uppercase tracking-widest mb-1">📋 Product Name</p>
            <p className="text-foreground font-bold text-base md:text-lg truncate">{shortName}</p>
          </div>
          <CopyButton text={shortName} label="Product Name" />
        </div>
        <div className="border-t border-accent/20 pt-2 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">📋 Detailed Name</p>
            <p className="text-foreground font-medium text-sm truncate">{detailedName}</p>
          </div>
          <CopyButton text={detailedName} label="Detailed Name" />
        </div>
      </div>

      <div className="grid gap-2">
        {fields.map(({ key, label, icon }) => {
          const value = (result as any)[key];
          if (!value) return null;
          const bnKey = key.replace("_en", "") as keyof AnalysisResult;
          const bnValue = key === "design_details_en" ? (result as any)[bnKey] : null;
          // Show reasoning under category
          const reasoning = key === "category_en" ? result.category_reasoning : null;
          // Show fabric confidence under fabric name
          const fabricConf = key === "fabric_name_en" && result.fabric_confidence ? getConfidenceInfo(result.fabric_confidence) : null;
          const fabricReasoning = key === "fabric_name_en" ? result.fabric_reasoning : null;
          return (
            <div key={key} className="bg-card border border-border rounded-lg p-3 hover:border-accent/40 transition-colors">
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-foreground font-medium text-sm leading-relaxed">{value}</p>
                    {fabricConf && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${fabricConf.color}`}>
                        {fabricConf.emoji} {fabricConf.label}
                      </span>
                    )}
                  </div>
                  {fabricReasoning && (
                    <p className="text-xs text-accent/80 leading-relaxed mt-1.5 border-t border-border pt-1.5 italic">
                      🔍 {fabricReasoning}
                    </p>
                  )}
                  {key === "fabric_name_en" && (
                    <FabricCorrectionButton
                      currentFabric={value}
                      currentCategory={result.category_en}
                    />
                  )}
                  {reasoning && (
                    <p className="text-xs text-accent/80 leading-relaxed mt-1.5 border-t border-border pt-1.5 italic">
                      💡 {reasoning}
                    </p>
                  )}
                  {bnValue && (
                    <p className="text-muted-foreground text-xs leading-relaxed mt-1 border-t border-border pt-1">
                      🇧🇩 {bnValue}
                    </p>
                  )}
                </div>
                <CopyButton text={value} label={label} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ results, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-accent/30 pulse-gold" />
        </div>
        <p className="text-muted-foreground text-lg">Analyzing...</p>
        <p className="text-sm text-muted-foreground">Processing image(s)...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 text-center">
        <p className="text-destructive font-medium">{error}</p>
      </div>
    );
  }

  if (results.length === 0) return null;

  const isComparison = results.length > 1;

  return (
    <div className="space-y-4 animate-fade-in-up">
      {isComparison ? (
        <>
          <h3 className="text-xl font-display font-semibold text-foreground text-center">
            Comparative Analysis ({results.length} images)
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {results.map((r, i) => (
              <div key={i} className="border border-border rounded-lg p-4 bg-card">
                <img src={r.preview} alt={`Image ${i + 1}`} className="w-full h-32 object-contain bg-muted/30 rounded mb-3" />
                <SingleResult result={r.result} index={i} />
              </div>
            ))}
          </div>
        </>
      ) : (
        <SingleResult result={results[0].result} />
      )}
      <PdfDownloadButton results={results.map((r) => r.result)} />
    </div>
  );
};

export default AnalysisDisplay;
