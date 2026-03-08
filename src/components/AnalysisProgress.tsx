import React, { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2 } from "lucide-react";

const STEPS = [
  { label: "ছবি প্রস্তুত করা হচ্ছে", labelEn: "Preparing image", duration: 800 },
  { label: "ক্যাটাগরি শনাক্ত করা হচ্ছে", labelEn: "Detecting category", duration: 3000 },
  { label: "ফেব্রিক বিশ্লেষণ চলছে", labelEn: "Analyzing fabric", duration: 5000 },
  { label: "ডিজাইন ও রঙ যাচাই", labelEn: "Checking design & color", duration: 3000 },
  { label: "ফলাফল তৈরি হচ্ছে", labelEn: "Generating results", duration: 2000 },
];

interface AnalysisProgressProps {
  imageCount: number;
  isActive: boolean;
}

const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ imageCount, isActive }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setCurrentStep(0);
      setProgress(0);
      return;
    }

    let stepIdx = 0;
    let elapsed = 0;
    const totalDuration = STEPS.reduce((s, st) => s + st.duration, 0);

    const interval = setInterval(() => {
      elapsed += 100;

      // Calculate cumulative time for current step
      let cumulative = 0;
      for (let i = 0; i < STEPS.length; i++) {
        cumulative += STEPS[i].duration;
        if (elapsed < cumulative) {
          stepIdx = i;
          break;
        }
        if (i === STEPS.length - 1) stepIdx = STEPS.length - 1;
      }

      setCurrentStep(stepIdx);
      // Cap at 92% so it doesn't show 100% before actual completion
      setProgress(Math.min(92, Math.round((elapsed / totalDuration) * 100)));
    }, 100);

    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">
          {imageCount > 1 ? `${imageCount}টি ছবি এনালাইজ হচ্ছে...` : "এনালাইজ হচ্ছে..."}
        </p>
        <span className="text-xs font-medium text-muted-foreground">{progress}%</span>
      </div>
      
      <Progress value={progress} className="h-2" />

      <div className="space-y-1.5">
        {STEPS.map((step, i) => {
          const isDone = i < currentStep;
          const isCurrent = i === currentStep;
          return (
            <div key={i} className={`flex items-center gap-2.5 text-xs transition-opacity ${
              isDone ? "opacity-50" : isCurrent ? "opacity-100" : "opacity-30"
            }`}>
              {isDone ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-3.5 h-3.5 text-accent animate-spin shrink-0" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground/30 shrink-0" />
              )}
              <span className={isCurrent ? "text-foreground font-medium" : "text-muted-foreground"}>
                {step.label}
              </span>
              <span className="text-muted-foreground/50 hidden sm:inline">— {step.labelEn}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnalysisProgress;
