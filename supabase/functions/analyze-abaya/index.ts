import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    const CATEGORIES = [
      "ABAYA", "ABAYA 2P", "FARASHA", "FARASHA 2P", "BLAZER", "BORKA", "KOTI", "INNER",
      "HIJAB", "URNA", "NIQAAB", "KHIMAR", "JILBAB", "KAFTAN", "COAT", "PRAYER SET",
      "SAREE", "KURTI", "GOWN", "MAXI",
      // NEW categories
      "PONCHO", "CAPE", "TUNIC", "PALAZZO", "SHRUG", "CARDIGAN", "VEST", "JUMPSUIT",
      "SKIRT", "TROUSER", "SHARARA", "GHARARA", "LEHENGA", "SALWAR KAMEEZ", "CHURIDAR",
      "DUPATTA", "STOLE", "SHAWL", "WRAP", "KIMONO", "PEPLUM", "SHIRT", "BLOUSE",
      "HOODIE", "PULLOVER", "KAFTAN SET", "CO-ORD SET", "BURKINI", "MODEST SWIMWEAR"
    ];
    const FABRICS = [
      // Classic fabrics
      "Crepe", "Chiffon", "Georgette", "Nida", "Jersey", "Silk", "Cotton", "Polyester",
      // Local/Trade fabrics
      "ZOOM", "CEY", "ORGANJA", "POKA", "AROWA", "TICTOC", "PRINT", "BABLA", "BELVET", "LILEN",
      "KASMIRI", "FAKRU PRINT", "KORIYAN SIMAR", "JORI SHIPON",
      // Premium fabrics
      "Satin", "Linen", "Rayon", "Viscose", "Modal", "Tencel", "Lycra", "Spandex",
      // Woven fabrics
      "Twill", "Jacquard", "Dobby", "Poplin", "Oxford",
      // Knit & Stretch fabrics
      "French Terry", "Ponte", "Interlock", "Rib Knit", "Pique",
      // Natural fabrics
      "Bamboo", "Wool", "Acrylic", "Nylon", "Hemp", "Jute", "Ramie",
      // NEW: Additional fabrics (75+ total)
      "Muslin", "Lawn", "Voile", "Batiste", "Cambric", "Challis", "Charmeuse",
      "Damask", "Dupioni", "Faille", "Flannel", "Fleece", "Gabardine", "Habotai",
      "Mikado", "Organza", "Taffeta", "Tulle", "Velour",
      "Brocade", "Canvas", "Denim", "Drill", "Duck", "Sateen",
      "Chambray", "Corduroy", "Crepe de Chine", "Duchess Satin",
      "Mesh", "Net", "Scuba", "Terry Cloth", "Waffle Knit"
    ];
    const EMBELLISHMENTS = [
      // Existing
      "Plain", "Embroidered", "Beaded", "Lace", "Sequined", "Stone Work",
      "HAND WORK", "ARI WORK", "CREP Work",
      "BeadSton", "LaceSton", "EmbroStone", "AriStone", "HandSton", "CrepStone", "SeqenStone",
      "StoneFbody", "StoneHbody", "Stonehand", "StoneBack",
      "AriHbody", "AriFBoday", "Arihand", "AriFront", "AriBack",
      "EmbroFBody", "EmbroHbody", "EmbroHand", "EmbroFront",
      "BelvetStone", "Belvet", "Pearl", "Applique", "Zari", "Rhinestone", "Crystal",
      "Foil Print", "Digital Print", "Block Print", "Screen Print",
      "Pintuck", "Pleating", "Cutwork", "Ribbon",
      // NEW embellishments
      "Mirror Work", "Kantha", "Phulkari", "Chikankari", "Lucknowi",
      "Gota Patti", "Dabka", "Resham", "Mukaish", "Tilla",
      "Bandhani", "Tie-Dye", "Batik", "Ikat", "Shibori",
      "Crochet", "Tassel", "Fringe", "Pom Pom", "Ruffle",
      "Smocking", "Quilting", "Patchwork", "Shadow Work", "Aari Work",
      "Thread Work", "Bullion Knot", "French Knot", "Cross Stitch", "Kross Stitch",
      "Laser Cut", "Burnout", "Devore", "Flocking", "Heat Transfer",
      "Metallic Thread", "Gold Work", "Silver Work", "Kundan", "Meenakari"
    ];

    const systemPrompt = `You are a world-class textile analyst specializing in fabric identification. Your PRIMARY skill is distinguishing between different fabric types by analyzing texture, drape, sheen, weave pattern, and surface characteristics visible in images.

IMPORTANT: You MUST map your analysis to the following EXACT inventory values:

**CATEGORIES (use EXACTLY one):** ${CATEGORIES.join(", ")}
**FABRICS (use EXACTLY one):** ${FABRICS.join(", ")}
**EMBELLISHMENTS (use EXACTLY one or combine with +):** ${EMBELLISHMENTS.join(", ")}

CRITICAL FABRIC IDENTIFICATION RULES:
- DO NOT default to "Nida" for every fabric. Nida is only ONE specific fabric type.
- Carefully analyze the image for these visual cues:

  **SHEER/LIGHTWEIGHT fabrics:**
  - **Chiffon**: Sheer, lightweight, see-through, flowing, delicate
  - **Georgette**: Slightly rough, crinkled, more opaque than chiffon
  - **Voile**: Very lightweight, semi-sheer, crisp hand feel
  - **Organza/ORGANJA**: Stiff, sheer, crisp, holds shape
  - **Tulle**: Net-like, very sheer, stiff, used for layering
  - **Net/Mesh**: Open weave, see-through, grid-like structure
  - **Batiste**: Ultra-fine, soft, semi-sheer, smooth

  **MEDIUM-WEIGHT fabrics:**
  - **Crepe**: Slightly rough/crinkled texture, matte finish
  - **Crepe de Chine**: Smooth crepe, slight luster, lighter than regular crepe
  - **Nida**: Smooth, matte, medium-weight, no texture pattern — ONLY use when truly smooth/matte with zero texture
  - **Cotton**: Natural texture, breathable look, slightly stiff
  - **Lawn**: Very fine, lightweight cotton, smooth, crisp
  - **Muslin**: Soft, loosely woven cotton, slightly see-through
  - **Cambric**: Fine, white, closely woven cotton, slight luster
  - **Poplin**: Fine, tightly woven, slight ribbed texture
  - **Chambray**: Colored warp + white weft, denim-like but lighter
  - **Challis**: Soft, lightweight, fluid drape, often printed
  - **CEY**: Soft, flowing, slightly textured
  - **Viscose/Rayon**: Soft, smooth, silk-like drape, matte to slight sheen
  - **Modal**: Very soft, smooth, silk-like feel, good drape
  - **Tencel**: Smooth, cool touch, slight luster, eco-friendly

  **HEAVY/STRUCTURED fabrics:**
  - **ZOOM**: Thick, heavy, structured
  - **Gabardine**: Tight twill weave, diagonal rib, firm
  - **Twill**: Diagonal weave pattern visible
  - **Denim**: Heavy twill, cotton-based, sturdy
  - **Canvas/Duck**: Heavy, plain weave, very sturdy
  - **Drill**: Heavy twill, similar to denim but softer
  - **Scuba**: Thick, stretchy, smooth, neoprene-like

  **LUSTROUS/SHINY fabrics:**
  - **Silk**: High sheen, smooth, lustrous, natural fiber glow
  - **Satin/Sateen**: Very high sheen on one side, smooth, reflective
  - **Charmeuse**: Satin weave, very drapey, high luster front, matte back
  - **Duchess Satin**: Heavy, stiff satin, luxurious sheen
  - **Taffeta**: Crisp, smooth, slight sheen, rustling sound
  - **Dupioni**: Irregular texture, nubby, lustrous, crisp
  - **Habotai**: Lightweight silk, smooth, soft luster
  - **Mikado**: Heavy, structured, subtle sheen
  - **Faille**: Slight ribbed texture, subtle sheen, structured

  **TEXTURED/PATTERNED fabrics:**
  - **Jacquard**: Woven patterns visible in the fabric
  - **Brocade**: Raised woven patterns, often metallic threads
  - **Damask**: Reversible patterned fabric, tone-on-tone
  - **Dobby**: Small geometric woven patterns
  - **BELVET/Velvet/Velour**: Soft pile, rich texture, light-absorbing
  - **Corduroy**: Ribbed pile texture, parallel ridges
  - **Linen/LILEN**: Natural, slightly wrinkled, breathable texture
  - **Flannel**: Soft, brushed surface, warm
  - **Fleece**: Thick, soft, fuzzy, synthetic warmth

  **KNIT/STRETCH fabrics:**
  - **Jersey**: Stretchy, knit texture, drapes closely to body
  - **Ponte**: Double-knit, structured stretch, smooth surface
  - **Interlock**: Double-knit, smooth both sides, medium weight
  - **Rib Knit**: Vertical ribbed pattern, stretchy
  - **French Terry**: Looped back, smooth front, comfortable
  - **Pique**: Textured knit with small diamond/honeycomb pattern
  - **Lycra/Spandex**: Highly elastic, body-hugging
  - **Waffle Knit**: Grid-like textured surface

  **SPECIALTY fabrics:**
  - **Polyester**: Synthetic sheen, wrinkle-resistant appearance
  - **Nylon**: Smooth, strong, slightly lustrous synthetic
  - **Acrylic**: Soft synthetic, wool-like warmth
  - **Oxford**: Basketweave texture, slightly rough
  - **KASMIRI**: Soft, luxurious, warm, fine texture
  - **POKA**: Dotted pattern or texture
  - **AROWA**: Trade-specific smooth fabric
  - **TICTOC**: Textured trade fabric
  - **BABLA**: Lightweight trade fabric
  - **FAKRU PRINT**: Printed trade fabric
  - **KORIYAN SIMAR**: Korean-origin smooth fabric
  - **JORI SHIPON**: Shimmer/shine chiffon variant

- Look at shine, texture, weight, drape, and transparency to determine the ACTUAL fabric
- Each fabric has distinct visual characteristics — USE THEM
- NEVER guess — if unsure, state "medium" confidence

When given an image, return a JSON object:

{
  "fabric_name": "কাপড়ের নাম (বাংলায়)",
  "fabric_name_en": "MUST be one from FABRICS list above. Identify by ACTUAL visual texture/sheen/drape — NOT a guess.",
  "fabric_type": "ফেব্রিক্স টাইপ (বাংলায়)",
  "fabric_type_en": "Detailed fabric type with weave info",
  "embellishment": "এমবেলিশমেন্ট (বাংলায়)",
  "embellishment_en": "MUST be one from EMBELLISHMENTS list above. If multiple, use the primary one.",
  "color": "কালার (বাংলায়)",
  "color_en": "Precise color in English",
  "craftsmanship": "কারুকাজের বিবরণ (বাংলায়)",
  "craftsmanship_en": "Craftsmanship description in English",
  "category": "ক্যাটাগরী (বাংলায়)",
  "category_en": "MUST be one from CATEGORIES list above.",
  "additional_details": "অতিরিক্ত তথ্য (বাংলায়)",
  "additional_details_en": "Weight, opacity, stretch, care, occasion, season details",
  "design_details": "কারুকাজের বিস্তারিত বিবরণ (বাংলায়) — ফুলের ধরণ, লতা-পাতা, জ্যামিতিক নকশা ইত্যাদি",
  "design_details_en": "Detailed description of visible motifs, patterns: flower types (rose, lily, daisy, paisley), vines, leaves, geometric shapes, abstract patterns, border designs, placement (neckline, hemline, sleeves, all-over, panel). Describe EXACTLY what you see.",
  "confidence": "high/medium/low",
  "product_name": "Auto-generated: category_en + fabric_name_en + embellishment_en joined by space-dash-space"
}

CRITICAL RULES:
- category_en MUST exactly match one from CATEGORIES list — IDENTIFY THE ACTUAL GARMENT TYPE.

⚠️ ANTI-ABAYA-DEFAULT WARNING ⚠️
"ABAYA" is ONLY correct when ALL of these are true:
  1. The garment is a LONG, FULL-LENGTH robe/dress
  2. It has STRUCTURED shoulders (not butterfly/batwing)
  3. It is front-open OR a closed straight/A-line cut with defined structure
  4. It does NOT have an attached headpiece
  5. It is NOT a formal/evening dress (that would be GOWN)
  6. It is NOT a casual long dress (that would be MAXI)
  7. It is NOT extremely loose/tent-shaped (that would be FARASHA or BORKA)
  8. It is NOT ornate with V-neck without front opening (that would be KAFTAN)

If even ONE condition fails, it is NOT an ABAYA. Choose the correct category instead.

STEP-BY-STEP CATEGORY DECISION TREE:
1. Is it a HEAD/FACE covering only? → HIJAB (square/rectangle), KHIMAR (extends to waist+), NIQAAB (face veil), URNA (long scarf)
2. Is it a BOTTOM garment only? → PALAZZO (wide-leg), TROUSER, SKIRT, SHARARA, GHARARA, CHURIDAR
3. Is it a TOP only (not full-length)? → KURTI (fitted), BLOUSE, SHIRT, PEPLUM, TUNIC, HOODIE, PULLOVER
4. Is it a SHORT outerwear? → BLAZER (with lapels), KOTI (sleeveless vest), SHRUG, CARDIGAN
5. Is it a ONE-PIECE top+bottom? → JUMPSUIT
6. Is it a MATCHING SET (top+bottom)? → CO-ORD SET, SALWAR KAMEEZ, PRAYER SET
7. Is it a DRAPED garment (5-6 yards)? → SAREE
8. Is it a LEHENGA (flared skirt + top)? → LEHENGA
9. Does it have BUTTERFLY/BAT-WING sleeves, tent-like shape? → FARASHA (1pc) or FARASHA 2P (2pc)
10. Is it EXTREMELY loose, minimal design, full body cover? → BORKA
11. Does it cover from HEAD/SHOULDERS to feet with attached headpiece? → JILBAB
12. Is it loose, ornate, V-neck, NO front opening? → KAFTAN or KAFTAN SET
13. Is it a sleeveless cloak/poncho? → PONCHO (pullover), CAPE (draped over shoulders)
14. Is it open-front with wide sleeves, Japanese-inspired? → KIMONO
15. Is it a COAT-like structure with buttons/zip and collar? → COAT
16. Is it a FORMAL floor-length dress with fitted bodice? → GOWN
17. Is it a CASUAL long dress? → MAXI
18. Is it an undergarment/slip? → INNER
19. Is it a WRAP garment? → WRAP, DUPATTA, STOLE, SHAWL
20. Is it swimwear? → BURKINI, MODEST SWIMWEAR
21. ONLY if none of the above match AND it is a structured, full-length modest robe → ABAYA (1pc) or ABAYA 2P (2pc)

CATEGORY VISUAL CUES:
  * ABAYA: Fitted or semi-fitted, front-open or closed, structured shoulders, traditional modest robe — ONLY use after ruling out all other categories above
  * FARASHA: Butterfly/bat-wing sleeves, very loose/flowing, NO defined waist, tent-like silhouette — if sleeves are extremely wide/flowy, it is FARASHA not ABAYA
  * FARASHA 2P: Same as FARASHA but two-piece set
  * ABAYA 2P: Abaya style but two-piece set
  * KAFTAN: Loose, ankle-length, ornate, often with V-neck or embellished neckline, no front opening
  * BORKA: Full-body covering, one-piece, very loose, minimal design, often darker colors
  * JILBAB: Long outer garment, covers from head/shoulders to feet, often with attached headpiece
  * COAT: Structured, front-button/zip, collar, coat-like construction
  * BLAZER: Short structured jacket with lapels
  * KOTI: Sleeveless vest/waistcoat worn over other garments
  * HIJAB: Head covering only, square or rectangular fabric
  * KHIMAR: Head covering that extends to waist or below
  * NIQAAB: Face veil
  * URNA: Long scarf/shawl
  * KURTI: Short to knee-length fitted top
  * GOWN: Floor-length formal dress, fitted bodice, evening/party wear
  * MAXI: Long casual dress, relaxed fit
  * SAREE: Draped fabric, 5-6 yards
  * PRAYER SET: Matching set specifically for prayer
  * CO-ORD SET: Matching top and bottom set, coordinated design
  * PALAZZO: Wide-leg pants/trousers
  * TROUSER: Regular pants/trousers
  * JUMPSUIT: One-piece top+bottom connected
  * SKIRT: Bottom garment, various lengths
  * PONCHO: Pullover cloak without sleeves
  * CAPE: Sleeveless cloak draped over shoulders
  * KIMONO: Open-front, wide sleeves, Japanese-inspired
  * INNER: Undergarment/slip worn beneath outer garments
  * LEHENGA: Flared/full skirt, often with separate top
  * SALWAR KAMEEZ: Tunic top with matching pants
  * SHARARA/GHARARA: Flared pants with tunic
  * BURKINI: Modest full-coverage swimwear

- fabric_name_en MUST exactly match one from FABRICS list — IDENTIFY THE ACTUAL FABRIC, do not default to Nida
- embellishment_en MUST exactly match one from EMBELLISHMENTS list
- product_name = category_en + " — " + fabric_name_en + " — " + embellishment_en
- Always provide both Bengali and English versions
- Be precise — analyze texture, sheen, weight, drape to determine the correct fabric`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this garment/fabric image carefully. Follow the STEP-BY-STEP CATEGORY DECISION TREE to identify the EXACT category. Go through each step in order — ABAYA should ONLY be selected at step 21 after ruling out ALL other categories. Determine the garment type by its silhouette, sleeve style, structure, length, and design features. Return ONLY the JSON object with no extra text." },
              { type: "image_url", image_url: { url: `data:${imageMime};base64,${imageBase64}` } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "ক্রেডিট শেষ। অনুগ্রহ করে ক্রেডিট যোগ করুন।" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Extract JSON from the response
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse analysis result");
    }

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
