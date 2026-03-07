import React, { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import ImageUploader from "@/components/ImageUploader";
import AnalysisDisplay, { AnalysisResult } from "@/components/AnalysisDisplay";
import HistoryPanel from "@/components/HistoryPanel";
import FeatureModal from "@/components/FeatureModal";
import StyleGuide from "@/components/StyleGuide";
import { Sparkles, Copy, FolderUp, Palette, Scissors, Search, FileText, Zap, Code, BarChart3, LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface ImageItem {
  base64: string;
  preview: string;
  mimeType: string;
}

interface FeatureItem {
  icon: LucideIcon;
  title: string;
  desc: string;
  details: string[];
}

const features: FeatureItem[] = [
  { icon: Copy, title: "One-Tap Copy", desc: "Instantly copy any analysis field for quick POS entry", details: ["Copy fabric name, type, color & more", "Paste directly into POS systems", "Fast inventory software entry", "Copy all fields at once"] },
  { icon: FolderUp, title: "Category Detection", desc: "AI automatically identifies product categories", details: ["Detects Khimar, Jilbab, Abaya, Kaftan & more", "Distinguishes Front-Open, Butterfly, Dubai Style", "POS category mapping ready", "E-commerce tagging support"] },
  { icon: Scissors, title: "Fabric Detection", desc: "Accurately identifies fabric type and quality", details: ["Detects Georgette, Chiffon, Nida, Silk, Linen & more", "Differentiates synthetic, natural & blended fabrics", "Fabric quality & weight analysis", "Supplier-ready fabric reports"] },
  { icon: Palette, title: "Color & Design", desc: "Detailed color and embellishment breakdown", details: ["Precise color naming in English", "Stonework, Sequin, Embroidery detection", "Craftsmanship quality analysis", "Ready for product descriptions"] },
  { icon: Search, title: "Multi-Image Compare", desc: "Analyze and compare multiple products at once", details: ["Bulk product analysis", "Side-by-side comparison results", "Speeds up bulk inventory entry", "Supports HEIC & all image formats"] },
  { icon: FileText, title: "PDF Reports", desc: "Download analysis results as a PDF report", details: ["Complete analysis in PDF format", "Print-ready layout", "Share with suppliers or buyers", "Download anytime from history"] },
];

const Index = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [analysisResults, setAnalysisResults] = useState<{ result: AnalysisResult; preview: string; historyId: string | null }[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<FeatureItem | null>(null);

  const handleImageSelect = useCallback((base64: string, preview: string, mimeType: string) => {
    setImages((prev) => [...prev, { base64, preview, mimeType }]);
    setAnalysisResults([]);
    setError(null);
  }, []);

  const handleClear = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setAnalysisResults([]);
  }, []);

  const handleClearAll = useCallback(() => {
    setImages([]);
    setAnalysisResults([]);
    setError(null);
  }, []);

  const saveToHistory = async (result: AnalysisResult): Promise<string | null> => {
    try {
      const { data } = await supabase.from("analysis_history").insert({
        fabric_name: result.fabric_name,
        fabric_name_en: result.fabric_name_en,
        fabric_type: result.fabric_type,
        fabric_type_en: result.fabric_type_en,
        embellishment: result.embellishment,
        embellishment_en: result.embellishment_en,
        color: result.color,
        color_en: result.color_en,
        craftsmanship: result.craftsmanship,
        craftsmanship_en: result.craftsmanship_en,
        category: result.category,
        category_en: result.category_en,
        additional_details: result.additional_details,
        additional_details_en: result.additional_details_en,
        design_details: result.design_details,
        design_details_en: result.design_details_en,
        confidence: result.confidence,
        fabric_confidence: result.fabric_confidence,
        fabric_reasoning: result.fabric_reasoning,
        category_reasoning: result.category_reasoning,
      }).select("id").single();
      return data?.id || null;
    } catch (e) {
      console.error("Failed to save history:", e);
      return null;
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (images.length === 0) return;
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResults([]);

    try {
      // Analyze all images in parallel for maximum speed
      const promises = images.map(async (img) => {
        const { data, error: fnError } = await supabase.functions.invoke("analyze-abaya", {
          body: { imageBase64: img.base64, mimeType: img.mimeType },
        });

        if (fnError) throw fnError;
        if (data?.error) throw new Error(data.error);
        if (data?.analysis) {
          const historyId = await saveToHistory(data.analysis);
          return { result: data.analysis as AnalysisResult, preview: img.preview, historyId };
        }
        return null;
      });

      const settled = await Promise.all(promises);
      const results = settled.filter((r): r is NonNullable<typeof r> => r !== null);
      setAnalysisResults(results);
    } catch (e: any) {
      console.error("Analysis error:", e);
      setError(e.message || "Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [images]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <header className="gradient-hero text-primary-foreground py-16 px-4 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, hsl(var(--accent) / 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, hsl(var(--primary) / 0.2) 0%, transparent 50%)`,
          }}
        />
        <div className="relative max-w-2xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-4 tracking-tight leading-none">
            <span className="gold-shimmer bg-clip-text text-transparent">DBH</span>
            <br />
            <span className="text-primary-foreground">FINDER</span>
          </h1>
          <p className="text-primary-foreground/60 text-sm max-w-md mx-auto leading-relaxed">
            AI-powered fabric &amp; garment analysis — fast data entry for POS &amp; inventory systems.
          </p>
        </div>
      </header>

      {/* Features Grid */}
      <section className="max-w-2xl mx-auto px-4 py-10">
        <h2 className="text-center text-lg font-display font-semibold text-foreground mb-6 animate-fade-in">
          <Zap className="w-5 h-5 inline-block mr-2 text-accent" />
          Key Features
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              onClick={() => setSelectedFeature(f)}
              className="group bg-card border border-border rounded-xl p-4 hover-scale cursor-pointer animate-fade-in"
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: "both" }}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
                <f.icon className="w-5 h-5 text-primary group-hover:text-accent transition-colors" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              <span className="text-[10px] text-accent mt-2 inline-block opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more →
              </span>
            </div>
          ))}
        </div>
      </section>

      <FeatureModal feature={selectedFeature} open={!!selectedFeature} onOpenChange={(o) => !o && setSelectedFeature(null)} />

      {/* Divider */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="h-px bg-border" />
      </div>

      {/* Analyzer Section */}
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            AI Image Analyzer
          </div>
          <p className="text-sm text-muted-foreground">
            Upload a borka or abaya image — AI will analyze it automatically.
          </p>
        </div>

        <ImageUploader onImageSelect={handleImageSelect} isAnalyzing={isAnalyzing} previews={images} onClear={handleClear} onClearAll={handleClearAll} />

        {images.length > 0 && analysisResults.length === 0 && !isAnalyzing && (
          <button
            onClick={handleAnalyze}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 pulse-gold hover-scale"
          >
            <Sparkles className="w-5 h-5" />
            {images.length > 1 ? `Analyze ${images.length} Images` : "Start Analysis"}
          </button>
        )}

        <AnalysisDisplay results={analysisResults} isLoading={isAnalyzing} error={error} />
        <StyleGuide />

        <HistoryPanel />
      </main>

      <footer className="text-center py-8 text-xs text-muted-foreground border-t border-border space-y-2">
        <div><span className="font-display font-bold text-foreground">DBH FINDER</span> — AI-Powered Analysis</div>
        <div className="flex items-center justify-center gap-4">
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-accent hover:text-accent/80 transition-colors text-xs font-medium">
            <BarChart3 className="w-3.5 h-3.5" /> Dashboard
          </Link>
          <Link to="/api-docs" className="inline-flex items-center gap-1.5 text-accent hover:text-accent/80 transition-colors text-xs font-medium">
            <Code className="w-3.5 h-3.5" /> API Documentation
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Index;
