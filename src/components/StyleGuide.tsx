import React, { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, Layers, Palette, Sparkles } from "lucide-react";

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
      { name: "Trench Coat Style", desc: "Double-breasted with belt, inspired by trench coats" },
      { name: "Blazer Style", desc: "Tailored like a blazer with lapels and structured shoulders" },
      { name: "Sherwani Style", desc: "Long structured top inspired by South Asian sherwani" },
      { name: "Mandarin Collar", desc: "Short stand-up collar without fold" },
      { name: "Nehru Collar", desc: "Band collar standing upright, buttoned to the top" },
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
      { name: "Prayer Set", desc: "Dedicated prayer outfit, usually loose with head covering" },
      { name: "Co-Ord Set", desc: "Matching top and bottom sold as a coordinated set" },
      { name: "Kaftan Set", desc: "Kaftan with matching inner or accessories" },
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
      { name: "Cape", desc: "Sleeveless cloak draped over the shoulders" },
    ],
  },
  {
    title: "Khimar & Hijab",
    icon: "🧣",
    styles: [
      { name: "Khimar", desc: "Cape-like head covering extending to waist or beyond" },
      { name: "Jilbab", desc: "Full-length outer garment covering from head to feet" },
      { name: "Overhead Khimar", desc: "Pulls over the head, no pins needed" },
      { name: "Hijab", desc: "Head scarf covering hair and neck" },
      { name: "Niqab", desc: "Face veil with eye opening" },
      { name: "Dupatta", desc: "Long scarf draped over shoulders or head" },
      { name: "Stole", desc: "Wide scarf or wrap for neck/shoulders" },
      { name: "Shawl", desc: "Large cloth worn around shoulders or head for warmth" },
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
      { name: "Churidar", desc: "Tight-fitting trousers with gathered folds at ankle" },
      { name: "Palazzo", desc: "Wide-leg flowing trousers, relaxed fit" },
      { name: "Maxi Dress", desc: "Full-length dress, various cuts and styles" },
    ],
  },
  {
    title: "Modern & Western Fusion",
    icon: "✨",
    styles: [
      { name: "Tunic", desc: "Hip or knee-length top, relaxed fit" },
      { name: "Peplum", desc: "Flared ruffle at the waist for a structured look" },
      { name: "Jumpsuit", desc: "One-piece top and bottom, modest or casual" },
      { name: "Shirt Dress", desc: "Button-down shirt extended to dress length" },
      { name: "Blouse", desc: "Formal or casual top, various collar and sleeve styles" },
      { name: "Hoodie", desc: "Casual hooded top with or without zipper" },
      { name: "Pullover", desc: "Knit top pulled over head, no buttons" },
      { name: "Kimono", desc: "Japanese-inspired open-front wrap, wide sleeves" },
      { name: "Wrap Dress", desc: "Dress that wraps and ties at waist" },
      { name: "Burkini", desc: "Modest full-coverage swimwear" },
    ],
  },
];

// Supported Fabrics (75+)
const FABRICS = [
  { group: "ক্লাসিক", items: ["Crepe", "Chiffon", "Georgette", "Nida", "Jersey", "Silk", "Cotton", "Polyester"] },
  { group: "লোকাল/ট্রেড", items: ["ZOOM", "CEY", "ORGANJA", "POKA", "AROWA", "TICTOC", "PRINT", "BABLA", "BELVET", "LILEN", "KASMIRI", "FAKRU PRINT", "KORIYAN SIMAR", "JORI SHIPON"] },
  { group: "প্রিমিয়াম", items: ["Satin", "Linen", "Rayon", "Viscose", "Modal", "Tencel", "Lycra", "Spandex"] },
  { group: "উভেন", items: ["Twill", "Jacquard", "Dobby", "Poplin", "Oxford", "Gabardine", "Chambray", "Cambric"] },
  { group: "নিট ও স্ট্রেচ", items: ["French Terry", "Ponte", "Interlock", "Rib Knit", "Pique", "Waffle Knit", "Scuba"] },
  { group: "প্রাকৃতিক", items: ["Bamboo", "Wool", "Acrylic", "Nylon", "Hemp", "Jute", "Ramie"] },
  { group: "শিয়ার/লাইটওয়েট", items: ["Muslin", "Lawn", "Voile", "Batiste", "Challis", "Tulle", "Net", "Mesh", "Organza"] },
  { group: "লাস্ট্রাস/শাইনি", items: ["Charmeuse", "Duchess Satin", "Sateen", "Taffeta", "Dupioni", "Habotai", "Mikado", "Faille"] },
  { group: "টেক্সচার্ড", items: ["Damask", "Brocade", "Velour", "Corduroy", "Flannel", "Fleece", "Crepe de Chine"] },
  { group: "হেভি/স্ট্রাকচার্ড", items: ["Canvas", "Denim", "Drill", "Duck", "Terry Cloth"] },
];

// Supported Embellishments (80+)
const EMBELLISHMENTS = [
  { group: "স্টোন ওয়ার্ক", items: ["Stone Work", "BeadSton", "LaceSton", "EmbroStone", "AriStone", "HandSton", "CrepStone", "SeqenStone", "StoneFbody", "StoneHbody", "Stonehand", "StoneBack", "BelvetStone", "Rhinestone", "Crystal", "Kundan"] },
  { group: "হ্যান্ড ওয়ার্ক", items: ["HAND WORK", "ARI WORK", "CREP Work", "Aari Work", "Shadow Work", "Thread Work", "Bullion Knot", "French Knot", "Cross Stitch"] },
  { group: "এমব্রয়ডারি", items: ["Embroidered", "EmbroFBody", "EmbroHbody", "EmbroHand", "EmbroFront", "Chikankari", "Lucknowi", "Kantha", "Phulkari", "Resham", "Dabka", "Mukaish", "Tilla"] },
  { group: "আরি ওয়ার্ক", items: ["AriHbody", "AriFBoday", "Arihand", "AriFront", "AriBack"] },
  { group: "প্রিন্ট", items: ["Foil Print", "Digital Print", "Block Print", "Screen Print", "FAKRU PRINT", "Batik", "Ikat", "Tie-Dye", "Bandhani", "Shibori"] },
  { group: "ডেকোরেটিভ", items: ["Lace", "Sequined", "Pearl", "Applique", "Zari", "Ribbon", "Gota Patti", "Mirror Work", "Meenakari", "Gold Work", "Silver Work", "Metallic Thread"] },
  { group: "টেক্সচার", items: ["Pintuck", "Pleating", "Cutwork", "Ruffle", "Smocking", "Quilting", "Patchwork", "Crochet", "Tassel", "Fringe", "Pom Pom"] },
  { group: "মডার্ন", items: ["Laser Cut", "Burnout", "Devore", "Flocking", "Heat Transfer", "Belvet"] },
  { group: "বেসিক", items: ["Plain", "Beaded"] },
];

const totalFabrics = FABRICS.reduce((a, g) => a + g.items.length, 0);
const totalEmbellishments = EMBELLISHMENTS.reduce((a, g) => a + g.items.length, 0);
const totalCategories = categories.reduce((a, c) => a + c.styles.length, 0);

const StyleGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCat, setExpandedCat] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState<"styles" | "fabrics" | "embellishments">("styles");

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-accent" />
          <span className="text-sm font-semibold text-foreground">Style Guide</span>
          <span className="text-xs text-muted-foreground">— {totalCategories} styles · {totalFabrics} fabrics · {totalEmbellishments} embellishments</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-3 animate-fade-in">
          {/* Tab buttons */}
          <div className="flex gap-2">
            {[
              { key: "styles" as const, label: "ক্যাটাগরি", icon: <Layers className="w-3.5 h-3.5" />, count: totalCategories },
              { key: "fabrics" as const, label: "ফেব্রিক", icon: <Palette className="w-3.5 h-3.5" />, count: totalFabrics },
              { key: "embellishments" as const, label: "এমবেলিশমেন্ট", icon: <Sparkles className="w-3.5 h-3.5" />, count: totalEmbellishments },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {tab.icon}
                {tab.label}
                <span className="text-[10px] opacity-70">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Styles tab */}
          {activeTab === "styles" && (
            <div className="space-y-2">
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

          {/* Fabrics tab */}
          {activeTab === "fabrics" && (
            <div className="space-y-3">
              {FABRICS.map((group) => (
                <div key={group.group}>
                  <h4 className="text-xs font-semibold text-foreground mb-1.5">{group.group}</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <span key={item} className="text-[11px] px-2 py-1 rounded-md bg-muted/30 text-muted-foreground border border-border">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Embellishments tab */}
          {activeTab === "embellishments" && (
            <div className="space-y-3">
              {EMBELLISHMENTS.map((group) => (
                <div key={group.group}>
                  <h4 className="text-xs font-semibold text-foreground mb-1.5">{group.group}</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <span key={item} className="text-[11px] px-2 py-1 rounded-md bg-muted/30 text-muted-foreground border border-border">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StyleGuide;
