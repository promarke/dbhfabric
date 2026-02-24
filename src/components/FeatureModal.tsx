import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { LucideIcon } from "lucide-react";

interface FeatureDetail {
  icon: LucideIcon;
  title: string;
  desc: string;
  details: string[];
}

interface FeatureModalProps {
  feature: FeatureDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FeatureModal: React.FC<FeatureModalProps> = ({ feature, open, onOpenChange }) => {
  if (!feature) return null;
  const Icon = feature.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-lg font-display">{feature.title}</DialogTitle>
          <DialogDescription className="font-bengali text-sm">{feature.desc}</DialogDescription>
        </DialogHeader>
        <ul className="space-y-2 mt-2">
          {feature.details.map((d, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-muted-foreground font-bengali animate-fade-in"
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
              {d}
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
};

export default FeatureModal;
