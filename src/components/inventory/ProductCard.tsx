import React, { useState } from "react";
import { Star, Trash2, Edit2, Package } from "lucide-react";
import type { Product } from "@/pages/Inventory";
import VariantManager from "./VariantManager";

interface ProductCardProps {
  product: Product;
  onDelete: (id: string) => void;
  onToggleFeatured: (id: string, current: boolean) => void;
  onEdit: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onDelete, onToggleFeatured, onEdit }) => {
  const [showVariants, setShowVariants] = useState(false);

  return (
    <>
      <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-accent/40 transition-colors group">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-40 object-cover bg-muted/30" />
        ) : (
          <div className="w-full h-40 bg-muted/30 flex items-center justify-center text-muted-foreground text-sm">
            No Image
          </div>
        )}
        <div className="p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground text-sm truncate">{product.name}</h3>
              <p className="text-xs text-muted-foreground">{product.category}</p>
            </div>
            {product.featured && (
              <Star className="w-4 h-4 text-accent fill-accent shrink-0" />
            )}
          </div>

          <div className="flex items-center gap-2">
            {product.discount_price != null ? (
              <>
                <span className="text-foreground font-bold text-sm">৳{product.discount_price}</span>
                <span className="text-muted-foreground text-xs line-through">৳{product.price}</span>
              </>
            ) : (
              <span className="text-foreground font-bold text-sm">৳{product.price}</span>
            )}
          </div>

          <div className="flex flex-wrap gap-1">
            {product.colors.slice(0, 3).map((c) => (
              <span key={c} className="text-[10px] px-1.5 py-0.5 bg-muted rounded">{c}</span>
            ))}
            {product.colors.length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded">+{product.colors.length - 3}</span>
            )}
          </div>

          <p className="text-[10px] text-muted-foreground">{product.fabric_type} · {product.sizes.length} sizes</p>

          <div className="flex items-center gap-1 pt-1 border-t border-border">
            <button onClick={() => onEdit(product)} className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <Edit2 className="w-3 h-3" /> Edit
            </button>
            <button onClick={() => setShowVariants(true)} className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-primary">
              <Package className="w-3 h-3" /> Stock
            </button>
            <button onClick={() => onToggleFeatured(product.id, product.featured)} className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-accent">
              <Star className="w-3 h-3" /> {product.featured ? "Unfeature" : "Feature"}
            </button>
            <button onClick={() => onDelete(product.id)} className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        </div>
      </div>

      <VariantManager
        open={showVariants}
        onOpenChange={setShowVariants}
        productId={product.id}
        productName={product.name}
      />
    </>
  );
};

export default ProductCard;
