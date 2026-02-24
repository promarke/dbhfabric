import React, { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";

interface StyleCategory {
  title: string;
  icon: string;
  styles: { name: string; desc: string }[];
}

const categories: StyleCategory[] = [
  {
    title: "Borka & Abaya Styles",
    icon: "🧕",
    styles: [
      { name: "Front-Open Abaya", desc: "Opens from the front like a coat, worn over clothing" },
      { name: "Butterfly Abaya", desc: "Wide sleeves resembling butterfly wings, flowing silhouette" },
      { name: "Pullover Abaya", desc: "Slips over the head, no front opening" },
      { name: "Kimono Abaya", desc: "Japanese-inspired wide sleeves with wrap or open front" },
      { name: "Cape Abaya", desc: "Attached cape layer over the shoulders" },
      { name: "Dubai Style", desc: "Elegant, often embellished, fitted or flared cuts" },
      { name: "Saudi Style", desc: "Traditional loose-fit, typically black with minimal design" },
      { name: "Turkish Style", desc: "Modern cuts with European tailoring influences" },
      { name: "Umbrella Abaya", desc: "Extra-wide flared bottom resembling an umbrella shape" },
      { name: "A-Line Abaya", desc: "Fitted at top, gradually widens to the hem" },
      { name: "Layered Abaya", desc: "Multiple fabric layers for depth and movement" },
      { name: "Belt Abaya", desc: "Includes a waist belt for a defined silhouette" },
      { name: "Wrap Abaya", desc: "Wraps around the body and ties at the side or front" },
    ],
  },
  {
    title: "Coat & Structured Styles",
    icon: "🧥",
    styles: [
      { name: "Coat Style", desc: "Structured like a formal coat with buttons or zipper" },
      { name: "Coat Collar", desc: "Features a distinct collar similar to overcoats" },
      { name: "Coat System", desc: "Full coat-like construction with lining and structure" },
      { name: "Trench Coat Style", desc: "Double-breasted with belt, inspired by trench coats" },
      { name: "Blazer Style", desc: "Tailored like a blazer with lapels and structured shoulders" },
      { name: "Sherwani Style", desc: "Long structured top inspired by South Asian sherwani" },
      { name: "Mandarin Collar", desc: "Short stand-up collar without fold, clean neckline" },
      { name: "Nehru Collar", desc: "Band collar standing upright, buttoned to the top" },
      { name: "Peter Pan Collar", desc: "Flat, rounded collar lying against the garment" },
    ],
  },
  {
    title: "Farasha & Kaftan",
    icon: "👗",
    styles: [
      { name: "Farasha", desc: "Loose butterfly-cut dress, wide body with narrow hem" },
      { name: "Farasha Abaya", desc: "Abaya-length farasha with modest coverage" },
      { name: "Kaftan", desc: "Loose flowing garment, often richly decorated" },
      { name: "Jalabiya", desc: "Traditional long loose dress, common in Gulf regions" },
      { name: "Gandoura", desc: "North African sleeveless or short-sleeve loose garment" },
    ],
  },
  {
    title: "Multi-Part Sets",
    icon: "📦",
    styles: [
      { name: "2-Part Set", desc: "Two matching pieces, typically top + bottom or borka + hijab" },
      { name: "3-Part Set", desc: "Three coordinated pieces, e.g., inner + outer + hijab" },
      { name: "Borka + Hijab Set", desc: "Matching borka and hijab sold together" },
      { name: "Prayer Set", desc: "Dedicated prayer outfit, usually loose with head covering" },
    ],
  },
  {
    title: "Koti & Layered",
    icon: "🦺",
    styles: [
      { name: "Koti (Vest)", desc: "Sleeveless vest or waistcoat worn over another garment" },
      { name: "Koti Style Borka", desc: "Borka with an attached or integrated koti layer" },
      { name: "Shrug Style", desc: "Short open-front cover worn over a dress or abaya" },
      { name: "Poncho Style", desc: "Blanket-like draped garment with head opening" },
      { name: "Cardigan Style", desc: "Open-front knit or fabric layer, casual look" },
    ],
  },
  {
    title: "Khimar & Hijab",
    icon: "🧣",
    styles: [
      { name: "Khimar", desc: "Cape-like head covering extending to waist or beyond" },
      { name: "Jilbab", desc: "Full-length outer garment covering from head to feet" },
      { name: "Overhead Khimar", desc: "Pulls over the head, no pins needed" },
      { name: "Butterfly Khimar", desc: "Khimar with wide wing-like draping on the sides" },
      { name: "Hijab", desc: "Head scarf covering hair and neck" },
      { name: "Shayla", desc: "Long rectangular scarf wrapped around the head" },
      { name: "Niqab", desc: "Face veil with eye opening" },
    ],
  },
  {
    title: "Traditional & Ethnic",
    icon: "🪷",
    styles: [
      { name: "Saree", desc: "Draped garment, 5-9 yards of fabric wrapped around body" },
      { name: "Salwar Kameez", desc: "Tunic top with loose trousers, South Asian classic" },
      { name: "Kurti", desc: "Short to mid-length tunic, casual or semi-formal" },
      { name: "Anarkali", desc: "Fitted bodice with floor-length flared skirt" },
      { name: "Lehenga", desc: "Flared skirt paired with fitted blouse and dupatta" },
      { name: "Gharara", desc: "Wide-legged pants flared from the knee" },
      { name: "Sharara", desc: "Similar to gharara with flare from mid-thigh" },
      { name: "Maxi Dress", desc: "Full-length dress, various cuts and styles" },
    ],
  },
];

const StyleGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCat, setExpandedCat] = useState<number | null>(null);

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-accent" />
          <span className="text-sm font-semibold text-foreground">Style Guide</span>
          <span className="text-xs text-muted-foreground">— {categories.reduce((a, c) => a + c.styles.length, 0)} detectable styles</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-2 animate-fade-in">
          {categories.map((cat, ci) => (
            <div key={cat.title} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedCat(expandedCat === ci ? null : ci)}
                className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-muted/30 transition-colors text-left"
              >
                <span className="text-lg">{cat.icon}</span>
                <span className="text-sm font-medium text-foreground flex-1">{cat.title}</span>
                <span className="text-[10px] text-muted-foreground">{cat.styles.length}</span>
                {expandedCat === ci ? (
                  <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </button>
              {expandedCat === ci && (
                <div className="px-3 pb-3 space-y-1.5 animate-fade-in">
                  {cat.styles.map((s) => (
                    <div key={s.name} className="flex gap-2 px-2 py-1.5 rounded-md bg-muted/20">
                      <span className="text-xs font-semibold text-accent whitespace-nowrap">{s.name}</span>
                      <span className="text-xs text-muted-foreground">{s.desc}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StyleGuide;
