import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

════════════════════════════════════════
⚠️ MANDATORY FABRIC ELIMINATION PROCESS ⚠️
════════════════════════════════════════

You MUST complete ALL 7 checks below and report findings for EACH before naming a fabric.
DO NOT skip any check. DO NOT jump to a conclusion.

CHECK 1 — SHEEN: Does the fabric show ANY shine, luster, or glossy reflection?
  → YES: It is Satin, Silk, Charmeuse, Sateen, or Duchess Satin. STOP.
  → NO: Continue.

CHECK 2 — TEXTURE: Does the surface show crinkle, pebble, grain, or roughness?
  → YES: It is Crepe, Crepe de Chine, or textured fabric. STOP.
  → NO: Continue.

CHECK 3 — TRANSPARENCY: Can you see through the fabric at all? Is it sheer or semi-transparent?
  → YES: It is Chiffon, Georgette, Voile, or Organza. STOP.
  → NO: Continue.

CHECK 4 — STRETCH: Does the fabric appear to stretch, cling, or hug the body?
  → YES: It is Jersey, Ponte, Lycra, or Scuba. STOP.
  → NO: Continue.

CHECK 5 — WEIGHT/STIFFNESS: Does the fabric appear thick, heavy, or hold its shape rigidly?
  → YES: It is ZOOM, Gabardine, Twill, or Poplin. STOP.
  → NO: Continue.

CHECK 6 — DRAPE/FLOW: Does the fabric flow very softly and fluidly (but NOT sheer)?
  → YES: It is Rayon, Viscose, Modal, or Challis. STOP.
  → NO: Continue.

CHECK 7 — NATURAL TEXTURE: Does it show natural fiber characteristics (breathable, cotton-like)?
  → YES: It is Cotton, Linen, Lawn, Cambric, or Muslin. STOP.
  → NO: Continue to final assessment.

FINAL: ONLY if ALL 7 checks are genuinely NO → then it MAY be Nida.
But even then, confirm: Is it truly medium-weight, perfectly smooth, completely matte, with zero texture?

🚫 "Nida" is NEVER the answer just because the garment is BLACK.
🚫 "smooth" alone is NOT enough for Nida — many fabrics are smooth (Satin, Crepe, Rayon, Polyester).
🚫 If you cannot clearly identify specific Nida characteristics, choose Polyester or Crepe instead.

════════════════════════════════════════
CONFIDENCE RULES:
- "high" = You can clearly see distinctive visual cues (e.g., visible crinkle for Crepe, visible shine for Satin)
- "medium" = Fabric shows some characteristics but image quality makes it uncertain
- "low" = Cannot clearly determine from the image, making best guess
════════════════════════════════════════

Return ONLY this JSON:
{
  "fabric_name": "বাংলায়",
  "fabric_name_en": "From FABRICS list",
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

    // ===== STEP 1: Determine category =====
    console.log("Step 1: Determining category...");
    const categoryResult = await callAI(
      LOVABLE_API_KEY,
      "google/gemini-2.5-pro",
      buildCategoryPrompt(),
      "Look at this garment image. Follow the decision tree steps 1-20 IN ORDER. Stop at the FIRST match. Do NOT default to ABAYA. Return the JSON.",
      imageUrl
    );

    if (categoryResult.error) {
      return new Response(JSON.stringify({ error: categoryResult.error }), {
        status: categoryResult.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let categoryData;
    try {
      categoryData = parseJSON(categoryResult.content!);
    } catch {
      console.error("Failed to parse category response:", categoryResult.content);
      throw new Error("ক্যাটাগরি শনাক্ত করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
    }

    // Validate category — do NOT silently default to ABAYA
    const detectedCategory = CATEGORIES.includes(categoryData.category_en)
      ? categoryData.category_en
      : null;

    if (!detectedCategory) {
      console.error("Invalid category returned:", categoryData.category_en);
      throw new Error(`অচেনা ক্যাটাগরি: ${categoryData.category_en}। আবার চেষ্টা করুন।`);
    }

    console.log("Detected category:", detectedCategory, "Reasoning:", categoryData.reasoning);

    // ===== STEP 2: Full analysis =====
    console.log("Step 2: Full analysis with category:", detectedCategory);
    const analysisResult = await callAI(
      LOVABLE_API_KEY,
      "google/gemini-2.5-flash",
      buildAnalysisPrompt(detectedCategory),
      `Analyze this garment image. Category is confirmed: ${detectedCategory}. 
IMPORTANT: Complete ALL 7 fabric elimination checks before naming the fabric. 
Do NOT default to Nida for black garments. Report each check result in fabric_reasoning.
Return ONLY the JSON object.`,
      imageUrl
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
