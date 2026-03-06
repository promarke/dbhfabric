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
  return `You are a textile analyst. The garment category has been determined as: **${category}**

Analyze the image for fabric, embellishment, color, and design details.

MAP to these EXACT values:
**FABRICS:** ${FABRICS.join(", ")}
**EMBELLISHMENTS:** ${EMBELLISHMENTS.join(", ")}

════════════════════════════════════════
⚠️ MANDATORY FABRIC ELIMINATION PROCESS ⚠️
════════════════════════════════════════

You MUST complete ALL 7 checks below and report findings for EACH before naming a fabric.

CHECK 1 — SHEEN: Does the fabric show ANY shine, luster, or glossy reflection?
  → YES: Satin, Silk, Charmeuse, Sateen, or Duchess Satin. STOP.
  → NO: Continue.

CHECK 2 — TEXTURE: Does the surface show crinkle, pebble, grain, or roughness?
  → YES: Crepe, Crepe de Chine. STOP.
  → NO: Continue.

CHECK 3 — TRANSPARENCY: Can you see through the fabric at all?
  → YES: Chiffon, Georgette, Voile, or Organza. STOP.
  → NO: Continue.

CHECK 4 — STRETCH: Does the fabric appear to stretch, cling, or hug the body?
  → YES: Jersey, Ponte, Lycra, or Scuba. STOP.
  → NO: Continue.

CHECK 5 — WEIGHT/STIFFNESS: Does the fabric appear thick, heavy, or hold its shape rigidly?
  → YES: ZOOM, Gabardine, Twill, or Poplin. STOP.
  → NO: Continue.

CHECK 6 — DRAPE/FLOW: Does the fabric flow very softly and fluidly (but NOT sheer)?
  → YES: Rayon, Viscose, Modal, or Challis. STOP.
  → NO: Continue.

CHECK 7 — NATURAL TEXTURE: Does it show natural fiber characteristics?
  → YES: Cotton, Linen, Lawn, Cambric, or Muslin. STOP.
  → NO: Continue to final assessment.

FINAL ASSESSMENT — If ALL 7 checks are NO:
Evaluate these specific fabric types carefully:
- Nida: Medium-weight, perfectly smooth, completely matte, zero texture, slightly stiff drape. Common for structured abayas.
- Polyester: Lightweight, smooth, may have slight synthetic sheen under light. Generic synthetic.
- CEY: Smooth, slightly stretchy feel, soft drape, common in modest wear.
- Nida and Polyester are DIFFERENT fabrics. Choose based on VISIBLE characteristics, not assumptions.

⚠️ ANTI-BIAS RULES:
🚫 Do NOT default to ANY single fabric. Each analysis must be independent.
🚫 "Black" does NOT determine fabric type.
🚫 "Smooth" alone is insufficient — describe WHAT KIND of smooth.
🚫 If image quality prevents clear identification, set fabric_confidence to "low".

CONFIDENCE RULES:
- "high" = Clear distinctive visual cues visible
- "medium" = Some characteristics but image quality uncertain
- "low" = Cannot clearly determine, making best guess

Return ONLY this JSON:
{
  "fabric_name": "From FABRICS list",
  "fabric_type": "Detailed type",
  "embellishment": "From EMBELLISHMENTS list",
  "color": "Precise color",
  "craftsmanship": "Description",
  "category": "${category}",
  "additional_details": "Weight, opacity, stretch, care, occasion",
  "design_details": "Describe motifs, patterns, placement in detail",
  "confidence": "high/medium/low",
  "fabric_confidence": "high/medium/low",
  "fabric_reasoning": "Report each CHECK 1-7 result, then explain final fabric choice",
  "product_name": "${category} — [fabric] — [embellishment]"
}`;
}

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
      "google/gemini-2.5-flash",
      buildAnalysisPrompt(detectedCategory),
      `Analyze this garment image. Category is confirmed: ${detectedCategory}. 
IMPORTANT: Complete ALL 7 fabric elimination checks before naming the fabric.
Do NOT default to Nida for black garments. Return ONLY the JSON.`,
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
