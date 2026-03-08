import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CATEGORIES = [
  "ABAYA", "ABAYA 2P", "FARASHA", "FARASHA 2P", "BLAZER", "BORKA", "KOTI", "INNER",
  "HIJAB", "URNA", "NIQAAB", "KHIMAR", "JILBAB", "KAFTAN", "COAT", "PRAYER SET",
  "SAREE", "KURTI", "GOWN", "MAXI",
  "PONCHO", "CAPE", "TUNIC", "PALAZZO", "SHRUG", "CARDIGAN", "VEST", "JUMPSUIT",
  "SKIRT", "TROUSER", "SHARARA", "GHARARA", "LEHENGA", "SALWAR KAMEEZ", "CHURIDAR",
  "DUPATTA", "STOLE", "SHAWL", "WRAP", "KIMONO", "PEPLUM", "SHIRT", "BLOUSE",
  "HOODIE", "PULLOVER", "KAFTAN SET", "CO-ORD SET", "BURKINI", "MODEST SWIMWEAR"
];

const FABRICS = [
  "Crepe", "Chiffon", "Georgette", "Nida", "Jersey", "Silk", "Cotton", "Polyester",
  "ZOOM", "CEY", "ORGANJA", "POKA", "AROWA", "TICTOC", "PRINT", "BABLA", "BELVET", "LILEN",
  "KASMIRI", "FAKRU PRINT", "KORIYAN SIMAR", "JORI SHIPON",
  "Satin", "Linen", "Rayon", "Viscose", "Modal", "Tencel", "Lycra", "Spandex",
  "Twill", "Jacquard", "Dobby", "Poplin", "Oxford",
  "French Terry", "Ponte", "Interlock", "Rib Knit", "Pique",
  "Bamboo", "Wool", "Acrylic", "Nylon", "Hemp", "Jute", "Ramie",
  "Muslin", "Lawn", "Voile", "Batiste", "Cambric", "Challis", "Charmeuse",
  "Damask", "Dupioni", "Faille", "Flannel", "Fleece", "Gabardine", "Habotai",
  "Mikado", "Organza", "Taffeta", "Tulle", "Velour",
  "Brocade", "Canvas", "Denim", "Drill", "Duck", "Sateen",
  "Chambray", "Corduroy", "Crepe de Chine", "Duchess Satin",
  "Mesh", "Net", "Scuba", "Terry Cloth", "Waffle Knit"
];

const EMBELLISHMENTS = [
  "Plain", "Embroidered", "Beaded", "Lace", "Sequined", "Stone Work",
  "HAND WORK", "ARI WORK", "CREP Work",
  "BeadSton", "LaceSton", "EmbroStone", "AriStone", "HandSton", "CrepStone", "SeqenStone",
  "StoneFbody", "StoneHbody", "Stonehand", "StoneBack",
  "AriHbody", "AriFBoday", "Arihand", "AriFront", "AriBack",
  "EmbroFBody", "EmbroHbody", "EmbroHand", "EmbroFront",
  "BelvetStone", "Belvet", "Pearl", "Applique", "Zari", "Rhinestone", "Crystal",
  "Foil Print", "Digital Print", "Block Print", "Screen Print",
  "Pintuck", "Pleating", "Cutwork", "Ribbon",
  "Mirror Work", "Kantha", "Phulkari", "Chikankari", "Lucknowi",
  "Gota Patti", "Dabka", "Resham", "Mukaish", "Tilla",
  "Bandhani", "Tie-Dye", "Batik", "Ikat", "Shibori",
  "Crochet", "Tassel", "Fringe", "Pom Pom", "Ruffle",
  "Smocking", "Quilting", "Patchwork", "Shadow Work", "Aari Work",
  "Thread Work", "Bullion Knot", "French Knot", "Cross Stitch", "Kross Stitch",
  "Laser Cut", "Burnout", "Devore", "Flocking", "Heat Transfer",
  "Metallic Thread", "Gold Work", "Silver Work", "Kundan", "Meenakari"
];

function buildCategoryPrompt(): string {
  return `You are a garment classification expert. Your ONLY job is to identify the EXACT category of the garment in the image.

AVAILABLE CATEGORIES: ${CATEGORIES.join(", ")}

CRITICAL: You MUST follow this decision tree IN ORDER. Stop at the FIRST match:

1. Is it ONLY a head/face covering? → HIJAB, KHIMAR, NIQAAB, or URNA
2. Is it ONLY a bottom garment (pants/skirt)? → PALAZZO, TROUSER, SKIRT, SHARARA, GHARARA, CHURIDAR, LEHENGA
3. Is it ONLY a top (NOT full-length)? → KURTI, BLOUSE, SHIRT, PEPLUM, TUNIC, HOODIE, PULLOVER
4. Is it short outerwear? → BLAZER (lapels), KOTI (sleeveless vest), SHRUG, CARDIGAN
5. Is it one-piece top+bottom connected? → JUMPSUIT
6. Is it a matching set (2 pieces)? → CO-ORD SET, SALWAR KAMEEZ, PRAYER SET, ABAYA 2P, FARASHA 2P, KAFTAN SET
7. Is it draped fabric (5-6 yards)? → SAREE
8. Is it a scarf/shawl/stole? → DUPATTA, STOLE, SHAWL, WRAP
9. Does it have BUTTERFLY/BAT-WING sleeves or tent-like shape? → FARASHA
10. Is it EXTREMELY loose, minimal design, full body cover with NO structure? → BORKA
11. Does it cover from HEAD to feet with ATTACHED head covering? → JILBAB
12. Is it loose, ornate, V-neck, NO front opening? → KAFTAN
13. Is it a sleeveless cloak? → PONCHO or CAPE
14. Is it open-front with wide sleeves, Japanese-inspired? → KIMONO
15. Is it a COAT (buttons/zip, collar, coat construction)? → COAT
16. Is it a FORMAL floor-length dress with fitted bodice, party/evening wear? → GOWN
17. Is it a CASUAL long dress? → MAXI
18. Is it an undergarment/slip? → INNER
19. Is it swimwear? → BURKINI, MODEST SWIMWEAR
20. ONLY if NONE of steps 1-19 match AND it is a structured, front-open OR A-line modest robe → ABAYA

🚫 ABAYA IS NOT THE DEFAULT. Most garments are NOT abayas.

Think step by step. For each step 1-20, write YES or NO. Then give your final answer.

Return JSON: {"category_en": "EXACT_CATEGORY", "reasoning": "brief explanation of why this category and not others"}`;
}

function buildAnalysisPrompt(category: string): string {
  return `You are a textile analyst. The garment category has been determined as: **${category}**

Analyze the image for fabric, embellishment, color, and design details.

MAP to these EXACT values:
**FABRICS:** ${FABRICS.join(", ")}
**EMBELLISHMENTS:** ${EMBELLISHMENTS.join(", ")}

════════ FABRIC IDENTIFICATION PROTOCOL (MANDATORY) ════════
You MUST complete ALL steps. Do NOT stop at first signal.

STEP A — 7 Visual Checks (for each, report: strong/moderate/weak/none)
1) Sheen/luster
2) Surface texture (crinkle/grain)
3) Transparency/sheerness
4) Stretch/cling behavior
5) Weight/structure/stiffness
6) Drape/flow
7) Natural-fiber visual cues

STEP B — Candidate Scoring
- Build top 3 fabric candidates from FABRICS list.
- For each candidate, explain why it matches and why alternatives are weaker.
- Polyester is NOT a fallback. Choose Polyester only with visible synthetic cues.
- Black color must NEVER determine fabric.

STEP C — Final Selection
- Return ONE single fabric only from FABRICS list.
- Never return mixed labels (e.g., “Crepe and Georgette”, “Nida + Crepe”).
- If image quality is unclear, still pick the closest single fabric but set fabric_confidence="low".
- Use "high" confidence only for clear distinctive cues.

Return ONLY this JSON:
{
  "fabric_name": "বাংলায়",
  "fabric_name_en": "One exact value from FABRICS list",
  "fabric_type": "বাংলায়",
  "fabric_type_en": "Detailed type",
  "embellishment": "বাংলায়",
  "embellishment_en": "From EMBELLISHMENTS list",
  "color": "বাংলায়",
  "color_en": "English color",
  "craftsmanship": "বাংলায়",
  "craftsmanship_en": "English",
  "category": "বাংলায়",
  "category_en": "${category}",
  "additional_details": "বাংলায়",
  "additional_details_en": "English",
  "design_details": "বাংলায়",
  "design_details_en": "Describe motifs, patterns, placement in detail",
  "confidence": "high/medium/low",
  "fabric_confidence": "high/medium/low",
  "fabric_reasoning": "STEP A checks + STEP B top-3 scoring + final justification",
  "fabric_top_candidates_en": ["Candidate 1", "Candidate 2", "Candidate 3"],
  "product_name": "${category} — [fabric] — [embellishment]"
}`;
}

function buildFabricRecoveryPrompt(category: string): string {
  return `You are a strict fabric quality gate.

Category is fixed: ${category}

ALLOWED FABRICS (choose exactly ONE): ${FABRICS.join(", ")}

You will receive an initial analysis that may contain invalid or mixed fabric labels.
Your job:
1) Re-evaluate fabric cues from image.
2) Pick exactly ONE canonical fabric from ALLOWED FABRICS.
3) Never return mixed labels or out-of-list values.
4) If uncertain, still choose the closest match but set confidence to low.

Return ONLY JSON:
{
  "fabric_name_en": "One exact value from ALLOWED FABRICS",
  "fabric_confidence": "high/medium/low",
  "fabric_reasoning": "Short evidence-based explanation",
  "fabric_top_candidates_en": ["Candidate 1", "Candidate 2", "Candidate 3"]
}`;
}

const FABRIC_MAP = new Map(FABRICS.map((fabric) => [fabric.toLowerCase(), fabric]));
const FABRIC_ALIASES: Record<string, string> = {
  velvet: "BELVET",
  velveteen: "BELVET",
  organja: "ORGANJA",
  organdy: "ORGANJA",
  organdie: "ORGANJA",
  linen: "Linen",
  linnen: "Linen",
  georget: "Georgette",
  shipon: "JORI SHIPON",
  "jori chiffon": "JORI SHIPON",
  chiffon: "Chiffon",
  satin: "Satin",
  polyester: "Polyester",
  nida: "Nida",
  cey: "CEY",
};

async function callAI(apiKey: string, model: string, systemPrompt: string, userText: string, imageUrl: string, maxTokens = 2048) {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: userText },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    if (response.status === 429) return { error: "অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।", status: 429 };
    if (response.status === 402) return { error: "ক্রেডিট শেষ। অনুগ্রহ করে ক্রেডিট যোগ করুন।", status: 402 };
    const errorText = await response.text();
    console.error("AI gateway error:", response.status, errorText);
    throw new Error(`AI gateway error: ${response.status}`);
  }

  const data = await response.json();
  return { content: data.choices?.[0]?.message?.content || "" };
}

function parseJSON(content: string) {
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) return JSON.parse(jsonMatch[0]);
  throw new Error("No JSON found in response");
}

function normalizeConfidence(value: unknown): "high" | "medium" | "low" {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (normalized === "high" || normalized === "medium" || normalized === "low") return normalized;
  return "low";
}

function normalizeFabricName(value: unknown): { fabric: string | null; wasCompound: boolean } {
  if (typeof value !== "string") return { fabric: null, wasCompound: false };

  const cleaned = value.trim().replace(/\s+/g, " ");
  if (!cleaned) return { fabric: null, wasCompound: false };

  const direct = FABRIC_MAP.get(cleaned.toLowerCase()) ?? FABRIC_ALIASES[cleaned.toLowerCase()];
  if (direct) return { fabric: direct, wasCompound: false };

  const parts = cleaned
    .split(/(?:,|\/|\+|\sand\s|\s&\s|\swith\s|\|)/i)
    .map((part) => part.trim())
    .filter(Boolean);

  const matched = Array.from(
    new Set(
      parts
        .map((part) => FABRIC_MAP.get(part.toLowerCase()) ?? FABRIC_ALIASES[part.toLowerCase()])
        .filter((fabric): fabric is string => Boolean(fabric))
    )
  );

  if (matched.length === 1) return { fabric: matched[0], wasCompound: parts.length > 1 };

  return { fabric: null, wasCompound: parts.length > 1 || /[,+/&|]/.test(cleaned) };
}

async function recoverFabricFromImage(
  apiKey: string,
  imageUrl: string,
  category: string,
  analysis: Record<string, unknown>
) {
  const recoveryResult = await callAI(
    apiKey,
    "google/gemini-2.5-flash",
    buildFabricRecoveryPrompt(category),
    `Initial analysis (may contain wrong/invalid fabric): ${JSON.stringify(analysis)}\nReturn corrected canonical fabric JSON only.`,
    imageUrl,
    512
  );

  if (recoveryResult.error) {
    return {
      fabric_name_en: null,
      fabric_confidence: "low" as const,
      fabric_reasoning: analysis.fabric_reasoning,
      fabric_top_candidates_en: [],
    };
  }

  try {
    const parsed = parseJSON(recoveryResult.content || "");
    return {
      fabric_name_en: parsed.fabric_name_en,
      fabric_confidence: normalizeConfidence(parsed.fabric_confidence),
      fabric_reasoning: parsed.fabric_reasoning,
      fabric_top_candidates_en: Array.isArray(parsed.fabric_top_candidates_en)
        ? parsed.fabric_top_candidates_en.slice(0, 3)
        : [],
    };
  } catch {
    return {
      fabric_name_en: null,
      fabric_confidence: "low" as const,
      fabric_reasoning: analysis.fabric_reasoning,
      fabric_top_candidates_en: [],
    };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64, mimeType } = await req.json();
    const imageMime = mimeType || "image/jpeg";

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const imageUrl = `data:${imageMime};base64,${imageBase64}`;

    // ===== STEP 1 + Corrections: Run in PARALLEL =====
    console.log("Step 1: Category + corrections in parallel...");
    
    const categoryPromise = callAI(
      LOVABLE_API_KEY,
      "google/gemini-2.5-pro",
      buildCategoryPrompt(),
      "Look at this garment image. Follow the decision tree steps 1-20 IN ORDER. Stop at the FIRST match. Do NOT default to ABAYA. Return the JSON.",
      imageUrl,
      512
    );

    const correctionPromise = (async () => {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const sb = createClient(supabaseUrl, supabaseKey);
        const { data: corrData } = await sb
          .from("fabric_corrections")
          .select("original_fabric, corrected_fabric")
          .order("created_at", { ascending: false })
          .limit(50);

        if (corrData && corrData.length > 0) {
          const patternMap = new Map<string, Map<string, number>>();
          corrData.forEach((c: any) => {
            if (!patternMap.has(c.original_fabric)) patternMap.set(c.original_fabric, new Map());
            const inner = patternMap.get(c.original_fabric)!;
            inner.set(c.corrected_fabric, (inner.get(c.corrected_fabric) || 0) + 1);
          });

          const hints: string[] = [];
          patternMap.forEach((corrections, original) => {
            const sorted = Array.from(corrections.entries()).sort((a, b) => b[1] - a[1]);
            const top = sorted[0];
            const total = Array.from(corrections.values()).reduce((s, n) => s + n, 0);
            hints.push(`"${original}" was frequently wrong (${total}x corrected) — often should be "${top[0]}" instead.`);
          });

          if (hints.length > 0) {
            return `\n\n⚠️ KNOWN BIAS CORRECTIONS (from user feedback):\n${hints.join("\n")}\nConsider these patterns when making your fabric choice.`;
          }
        }
      } catch (e) {
        console.error("Failed to fetch corrections:", e);
      }
      return "";
    })();

    const [categoryResult, correctionHint] = await Promise.all([categoryPromise, correctionPromise]);

    // Parse category result
    if (categoryResult.error) {
      return new Response(JSON.stringify({ error: categoryResult.error }), {
        status: categoryResult.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let categoryData: { category_en?: string; reasoning?: string };
    try {
      categoryData = parseJSON(categoryResult.content || "");
    } catch {
      console.error("Failed to parse category:", categoryResult.content);
      throw new Error("ক্যাটাগরি শনাক্ত করতে ব্যর্থ। আবার চেষ্টা করুন।");
    }

    const detectedCategory = (categoryData.category_en || "ABAYA").toUpperCase().trim();
    console.log("Step 2: Full analysis with category:", detectedCategory);
    const analysisResult = await callAI(
      LOVABLE_API_KEY,
      "google/gemini-2.5-flash",
      buildAnalysisPrompt(detectedCategory) + correctionHint,
      `Analyze this garment image. Category is confirmed: ${detectedCategory}.
Follow the fabric identification protocol fully, produce top-3 candidates, and return one canonical fabric only.`,
      imageUrl,
      1536
    );

    if (analysisResult.error) {
      return new Response(JSON.stringify({ error: analysisResult.error }), {
        status: analysisResult.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let analysis;
    try {
      analysis = parseJSON(analysisResult.content!);
    } catch {
      console.error("Failed to parse analysis response:", analysisResult.content);
      throw new Error("এনালাইসিস পার্স করতে ব্যর্থ। আবার চেষ্টা করুন।");
    }

    const rawFabric = analysis.fabric_name_en ?? analysis.fabric_name;
    let { fabric: normalizedFabric, wasCompound } = normalizeFabricName(rawFabric);

    if (!normalizedFabric) {
      const recovered = await recoverFabricFromImage(LOVABLE_API_KEY, imageUrl, detectedCategory, analysis);
      const recoveredNormalized = normalizeFabricName(recovered.fabric_name_en);

      if (recoveredNormalized.fabric) {
        normalizedFabric = recoveredNormalized.fabric;
        wasCompound = wasCompound || recoveredNormalized.wasCompound;
      }

      if (recovered.fabric_reasoning) {
        analysis.fabric_reasoning = recovered.fabric_reasoning;
      }

      if (recovered.fabric_top_candidates_en.length) {
        analysis.fabric_top_candidates_en = recovered.fabric_top_candidates_en;
      }

      analysis.fabric_confidence = recovered.fabric_confidence;
    }

    if (!normalizedFabric) {
      throw new Error("ফেব্রিক নির্ভরযোগ্যভাবে শনাক্ত করা যায়নি। আরো পরিষ্কার ছবি দিন।");
    }

    analysis.fabric_name_en = normalizedFabric;
    if (typeof analysis.fabric_name !== "string" || !analysis.fabric_name.trim()) {
      analysis.fabric_name = normalizedFabric;
    }

    analysis.fabric_confidence = normalizeConfidence(analysis.fabric_confidence);
    if (wasCompound && analysis.fabric_confidence === "high") {
      analysis.fabric_confidence = "medium";
    }

    // Ensure category from step 1
    analysis.category_en = detectedCategory;
    analysis.category_reasoning = categoryData.reasoning || "";
    analysis.product_name = `${detectedCategory} — ${analysis.fabric_name_en || "Unknown"} — ${analysis.embellishment_en || "Plain"}`;

    console.log("Final result:", analysis.product_name, "| Fabric confidence:", analysis.fabric_confidence);

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-abaya error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
