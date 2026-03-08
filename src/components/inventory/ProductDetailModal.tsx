import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, Star, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/pages/Inventory";

interface ProductDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
}

const copyToClipboard = (text: string, label: string) => {
  navigator.clipboard.writeText(text);
  toast.success(`${label} কপি হয়েছে`);
};

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-2 py-2 border-b border-border last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap">{value}</p>
      </div>
      <button
        onClick={() => copyToClipboard(value, label)}
        className="shrink-0 p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        title={`${label} কপি করুন`}
      >
        <Copy className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ open, onOpenChange, product }) => {
  const allDetails = [
    { label: "নাম / Name", value: product.name },
    { label: "ক্যাটাগরি / Category", value: product.category },
    { label: "দাম / Price", value: product.discount_price != null ? `৳${product.discount_price} (ছাড়), আসল: ৳${product.price}` : `৳${product.price}` },
    { label: "ফেব্রিক / Fabric", value: product.fabric_type || "" },
    { label: "সাইজ / Sizes", value: product.sizes.join(", ") },
    { label: "রং / Colors", value: product.colors.join(", ") },
    { label: "বিবরণ / Description", value: product.description || "" },
    { label: "ইমেজ URL", value: product.image_url || "" },
    { label: "ভিডিও URL", value: product.video_url || "" },
  ];

  const copyAll = () => {
    const text = allDetails
      .filter((d) => d.value)
      .map((d) => `${d.label}: ${d.value}`)
      .join("\n");
    copyToClipboard(text, "সকল তথ্য");
  };

  const shareOnWhatsApp = () => {
    const message = `*${product.name}*\n\n${product.description ? product.description + "\n\n" : ""}দাম: ৳${product.discount_price != null ? product.discount_price : product.price}\nফেব্রিক: ${product.fabric_type}\nসাইজ: ${product.sizes.join(", ")}\nরং: ${product.colors.join(", ")}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            প্রোডাক্ট ডিটেইলস
            {product.featured && <Star className="w-4 h-4 text-accent fill-accent" />}
          </DialogTitle>
        </DialogHeader>

        {product.image_url && (
          <img src={product.image_url} alt={product.name} className="w-full h-48 object-contain bg-muted/30 rounded-lg" />
        )}

        <div className="divide-y-0">
          {allDetails.map((d) => (
            <DetailRow key={d.label} label={d.label} value={d.value} />
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={copyAll}
            className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <Copy className="w-4 h-4" /> কপি করুন
          </button>
          <button
            onClick={shareOnWhatsApp}
            className="flex-1 py-2.5 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp শেয়ার
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;
