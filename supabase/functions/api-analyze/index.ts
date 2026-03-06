import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
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

CRITICAL: Follow this decision tree IN ORDER. Stop at the FIRST match:

1. Is it ONLY a head/face covering? → HIJAB, KHIMAR, NIQAAB, or URNA
2. Is it ONLY a bottom garment? → PALAZZO, TROUSER, SKIRT, SHARARA, GHARARA, CHURIDAR, LEHENGA
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
  return `You are a textile analyst. Category is confirmed as: **${category}**.

Analyze the garment image and map to EXACT output values.

ALLOWED FABRICS (must choose ONE exact value only): ${FABRICS.join(", ")}
ALLOWED EMBELLISHMENTS: ${EMBELLISHMENTS.join(", ")}

════════ FABRIC IDENTIFICATION PROTOCOL (MANDATORY) ════════
You must do all steps below. Do NOT stop early.

STEP A — 7 Visual Checks (report each as strong/moderate/weak/none)
1) Sheen/luster
2) Surface texture (crinkle/grain)
3) Transparency/sheerness
4) Stretch/cling behavior
5) Weight/structure/stiffness
6) Drape/flow
7) Natural-fiber visual cues

STEP B — Candidate Scoring
- Build top 3 fabric candidates from the allowed list.
- For each candidate, provide why it matches and why alternatives are weaker.
- Polyester must NOT be used as a default. Choose Polyester only when visible synthetic cues support it.
- Black color must NEVER influence fabric choice.

STEP C — Final Selection Rules
- Return ONE single fabric only (no mix like “A + B”, no “A and B”).
- If visual evidence is weak/unclear, still pick the closest single allowed fabric BUT set fabric_confidence="low".
- "high" confidence only when there are clear, distinctive visual cues.

Return ONLY this JSON:
{
  "fabric_name": "From FABRICS list (single value)",
  "fabric_type": "Detailed type",
  "embellishment": "From EMBELLISHMENTS list",
  "color": "Precise color",
  "craftsmanship": "Description",
  "category": "${category}",
  "additional_details": "Weight, opacity, stretch, care, occasion",
  "design_details": "Describe motifs, patterns, placement in detail",
  "confidence": "high/medium/low",
  "fabric_confidence": "high/medium/low",
  "fabric_reasoning": "Report STEP A checks + STEP B top-3 scoring + final justification",
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
1) Re-evaluate the image briefly for fabric-only cues.
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

async function callAI(apiKey: string, model: string, systemPrompt: string, userText: string, imageUrl: string) {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
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
    if (response.status === 429) return { error: "Rate limited. Please try again later.", status: 429 };
    if (response.status === 402) return { error: "Credits exhausted. Please add credits.", status: 402 };
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
  imageDataUrl: string,
  category: string,
  analysis: Record<string, unknown>
) {
  const recoveryResult = await callAI(
    apiKey,
    "google/gemini-3-flash-preview",
    buildFabricRecoveryPrompt(category),
    `Initial analysis (may contain wrong/invalid fabric): ${JSON.stringify(analysis)}\nReturn corrected canonical fabric JSON only.`,
    imageDataUrl
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
    const apiKey = req.headers.get("x-api-key");
    const DBH_API_KEY = Deno.env.get("DBH_API_KEY");
    if (!DBH_API_KEY) throw new Error("DBH_API_KEY is not configured");
    if (!apiKey || apiKey !== DBH_API_KEY) {
      return new Response(JSON.stringify({ error: "Invalid or missing API key" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { imageBase64, imageUrl: externalImageUrl } = await req.json();

    let base64Data = imageBase64;

    if (!base64Data && externalImageUrl) {
      const imgResponse = await fetch(externalImageUrl);
      if (!imgResponse.ok) throw new Error("Failed to fetch image from URL");
      const buffer = await imgResponse.arrayBuffer();
      base64Data = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    }

    if (!base64Data) {
      return new Response(JSON.stringify({ error: "Provide 'imageBase64' or 'imageUrl'" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const imageDataUrl = `data:image/jpeg;base64,${base64Data}`;

    // ===== STEP 1: Category detection =====
    const categoryResult = await callAI(
      LOVABLE_API_KEY,
      "google/gemini-2.5-pro",
      buildCategoryPrompt(),
      "Look at this garment image. Follow the decision tree steps 1-20 IN ORDER. Stop at the FIRST match. Do NOT default to ABAYA. Return the JSON.",
      imageDataUrl
    );

    if (categoryResult.error) {
      return new Response(JSON.stringify({ success: false, error: categoryResult.error }), {
        status: categoryResult.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let categoryData;
    try {
      categoryData = parseJSON(categoryResult.content!);
    } catch {
      console.error("Failed to parse category response:", categoryResult.content);
      throw new Error("Failed to parse category result");
    }

    const detectedCategory = CATEGORIES.includes(categoryData.category_en)
      ? categoryData.category_en
      : null;

    if (!detectedCategory) {
      throw new Error(`Unknown category: ${categoryData.category_en}`);
    }

    // ===== STEP 2: Full analysis =====
    const analysisResult = await callAI(
      LOVABLE_API_KEY,
      "google/gemini-3-flash-preview",
      buildAnalysisPrompt(detectedCategory),
      `Analyze this garment image. Category is confirmed: ${detectedCategory}.
Follow the fabric identification protocol fully, produce top-3 candidates, and return one canonical fabric only.`,
      imageDataUrl
    );

    if (analysisResult.error) {
      return new Response(JSON.stringify({ success: false, error: analysisResult.error }), {
        status: analysisResult.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let analysis;
    try {
      analysis = parseJSON(analysisResult.content!);
    } catch {
      throw new Error("Failed to parse analysis result");
    }

    const rawFabric = analysis.fabric_name_en ?? analysis.fabric_name;
    let { fabric: normalizedFabric, wasCompound } = normalizeFabricName(rawFabric);

    if (!normalizedFabric) {
      const recovered = await recoverFabricFromImage(LOVABLE_API_KEY, imageDataUrl, detectedCategory, analysis);
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
      throw new Error("Unable to determine a reliable single fabric from the image");
    }

    analysis.fabric_name = normalizedFabric;
    analysis.fabric_name_en = normalizedFabric;
    analysis.fabric_confidence = normalizeConfidence(analysis.fabric_confidence);

    if (wasCompound && analysis.fabric_confidence === "high") {
      analysis.fabric_confidence = "medium";
    }

    analysis.category = detectedCategory;
    analysis.category_reasoning = categoryData.reasoning || "";
    analysis.product_name = `${detectedCategory} — ${analysis.fabric_name || "Unknown"} — ${analysis.embellishment || "Plain"}`;

    return new Response(JSON.stringify({ success: true, analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("api-analyze error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
