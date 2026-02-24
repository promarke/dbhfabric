import React, { useEffect, useState } from "react";
import { Download, CheckCircle, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Smartphone className="w-10 h-10 text-primary" />
        </div>

        <h1 className="text-2xl font-display font-bold text-foreground">
          <span className="font-bengali">অ্যাপ ইনস্টল করুন</span>
        </h1>

        {isInstalled ? (
          <div className="space-y-3">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <p className="font-bengali text-muted-foreground">
              অ্যাপটি ইতিমধ্যে ইনস্টল করা আছে!
            </p>
          </div>
        ) : deferredPrompt ? (
          <div className="space-y-4">
            <p className="font-bengali text-muted-foreground">
              আপনার ফোনে এই অ্যাপটি ইনস্টল করুন — দ্রুত অ্যাক্সেস ও অফলাইন সাপোর্ট পাবেন।
            </p>
            <button
              onClick={handleInstall}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bengali font-semibold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              ইনস্টল করুন
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="font-bengali text-muted-foreground">
              ইনস্টল করতে আপনার ব্রাউজারের মেনু থেকে <strong>"Add to Home Screen"</strong> বা <strong>"Install App"</strong> অপশনটি ব্যবহার করুন।
            </p>
            <div className="bg-muted rounded-lg p-4 text-sm font-bengali text-muted-foreground text-left space-y-2">
              <p><strong>Android:</strong> Chrome মেনু → "Install App"</p>
              <p><strong>iPhone:</strong> Safari Share → "Add to Home Screen"</p>
            </div>
          </div>
        )}

        <a href="/" className="inline-block text-sm text-primary hover:underline font-bengali">
          ← হোমে ফিরে যান
        </a>
      </div>
    </div>
  );
};

export default Install;
