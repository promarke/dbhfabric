import React, { useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Plus, Loader2 } from "lucide-react";
import heic2any from "heic2any";

interface ImageUploaderProps {
  onImageSelect: (base64: string, preview: string, mimeType: string) => void;
  isAnalyzing: boolean;
  previews: { base64: string; preview: string }[];
  onClear: (index: number) => void;
  onClearAll: () => void;
  maxImages?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelect,
  isAnalyzing,
  previews,
  onClear,
  onClearAll,
  maxImages = 4,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const safeImages = previews || [];

  const readFileAsDataURL = (file: File | Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const processFile = useCallback(
    async (file: File) => {
      const isHeic = file.name.toLowerCase().endsWith(".heic") || file.name.toLowerCase().endsWith(".heif") || file.type === "image/heic" || file.type === "image/heif";

      try {
        let fileToRead: File | Blob = file;

        if (isHeic) {
          setIsConverting(true);
          const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
          fileToRead = Array.isArray(converted) ? converted[0] : converted;
          setIsConverting(false);
        } else if (!file.type.startsWith("image/")) {
          return;
        }

        const result = await readFileAsDataURL(fileToRead);
        const base64 = result.split(",")[1];
        const mimeType = result.split(";")[0].split(":")[1] || "image/jpeg";
        onImageSelect(base64, result, mimeType);
      } catch (err) {
        console.error("File processing error:", err);
        setIsConverting(false);
      }
    },
    [onImageSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      const remaining = maxImages - safeImages.length;
      files.slice(0, remaining).forEach(processFile);
    },
    [processFile, maxImages, safeImages.length]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const remaining = maxImages - safeImages.length;
      files.slice(0, remaining).forEach(processFile);
      e.target.value = "";
    },
    [processFile, maxImages, safeImages.length]
  );

  const acceptTypes = "image/*,.heic,.heif";

  if (safeImages.length > 0) {
    return (
      <div className="space-y-3">
        {isConverting && (
          <div className="flex items-center gap-2 text-sm text-accent">
            <Loader2 className="w-4 h-4 animate-spin" />
            Converting HEIC file...
          </div>
        )}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {safeImages.length}/{maxImages} images selected
          </p>
          {!isAnalyzing && safeImages.length > 1 && (
            <button onClick={onClearAll} className="text-xs text-destructive hover:underline">
              Clear all
            </button>
          )}
        </div>
        <div className={`grid gap-3 ${safeImages.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
          {safeImages.map((img, i) => (
            <div key={i} className="relative group">
              <div className="overflow-hidden rounded-lg border-2 border-accent/30 shadow-lg">
                <img src={img.preview} alt={`Uploaded ${i + 1}`} className="w-full h-48 object-contain bg-muted/30" />
              </div>
              {!isAnalyzing && (
                <button onClick={() => onClear(i)} className="absolute top-2 right-2 p-1.5 rounded-full bg-foreground/70 text-background hover:bg-foreground transition-colors">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          {safeImages.length < maxImages && !isAnalyzing && (
            <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent/50 hover:bg-muted/30 transition-all">
              <input type="file" accept={acceptTypes} multiple onChange={handleFileInput} className="hidden" />
              <Plus className="w-8 h-8 text-muted-foreground" />
              <span className="text-xs text-muted-foreground mt-1">Add more</span>
            </label>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
        isDragging ? "border-accent bg-accent/5 scale-[1.02]" : "border-border hover:border-accent/50 hover:bg-muted/30"
      }`}
    >
      <input type="file" accept={acceptTypes} multiple onChange={handleFileInput} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
          {isConverting ? (
            <Loader2 className="w-9 h-9 text-accent animate-spin" />
          ) : isDragging ? (
            <ImageIcon className="w-9 h-9 text-accent" />
          ) : (
            <Upload className="w-9 h-9 text-secondary-foreground" />
          )}
        </div>
        <div>
          <p className="text-lg font-medium text-foreground">Upload Images</p>
          <p className="text-sm text-muted-foreground mt-1">
            Drag &amp; drop or click to select (max {maxImages})
          </p>
          <p className="text-xs text-muted-foreground mt-2">JPG, PNG, WEBP, HEIC supported</p>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
