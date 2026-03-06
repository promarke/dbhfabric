import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Validate API key
    const apiKey = req.headers.get("x-api-key");
    const DBH_API_KEY = Deno.env.get("DBH_API_KEY");
    if (!DBH_API_KEY) throw new Error("DBH_API_KEY is not configured");
    if (!apiKey || apiKey !== DBH_API_KEY) {
      return new Response(JSON.stringify({ error: "Invalid or missing API key" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { imageBase64, imageUrl } = await req.json();

    let base64Data = imageBase64;

    // If imageUrl provided, fetch and convert to base64
    if (!base64Data && imageUrl) {
      const imgResponse = await fetch(imageUrl);
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

    const systemPrompt = `You are a world-class textile analyst. Your PRIMARY skill is distinguishing between different fabric types by analyzing texture, drape, sheen, weave pattern, and surface characteristics.

Map analysis to EXACT inventory values:

**CATEGORIES:** ${CATEGORIES.join(", ")}
**FABRICS:** ${FABRICS.join(", ")}
**EMBELLISHMENTS:** ${EMBELLISHMENTS.join(", ")}

CRITICAL FABRIC IDENTIFICATION — Analyze texture, sheen, drape, weight, transparency:
- DO NOT default to "Nida". Nida is ONLY smooth/matte/medium-weight with zero texture.
- Sheer: Chiffon(flowing), Georgette(crinkled), Voile(crisp), Organza(stiff), Tulle(net-like), Net/Mesh(open weave), Batiste(ultra-fine)
- Medium: Crepe(crinkled/matte), Crepe de Chine(smooth crepe), Cotton(natural/stiff), Lawn(fine cotton), Muslin(soft/loose), Cambric(fine/luster), Poplin(ribbed), Chambray(denim-like lighter), Challis(fluid), Viscose/Rayon(silk-like drape), Modal(very soft), Tencel(smooth/cool)
- Heavy: ZOOM(thick/structured), Gabardine(twill/firm), Twill(diagonal), Denim(heavy twill), Canvas(sturdy), Scuba(neoprene-like)
- Lustrous: Silk(natural glow), Satin/Sateen(reflective), Charmeuse(drapey/luster), Duchess Satin(heavy/stiff), Taffeta(crisp/sheen), Dupioni(nubby/lustrous), Habotai(soft luster), Mikado(subtle sheen), Faille(ribbed/sheen)
- Textured: Jacquard(woven patterns), Brocade(raised patterns), Damask(reversible), Dobby(geometric), BELVET/Velvet/Velour(pile), Corduroy(ridges), Linen(wrinkled), Flannel(brushed), Fleece(fuzzy)
- Knit: Jersey(stretchy), Ponte(structured stretch), Interlock(smooth knit), Rib Knit(ribbed), French Terry(looped back), Pique(diamond texture), Waffle Knit(grid)
- NEVER guess — if unsure, use "medium" confidence

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
1. Is it a HEAD/FACE covering only? → HIJAB, KHIMAR, NIQAAB, URNA
2. Is it a BOTTOM garment only? → PALAZZO, TROUSER, SKIRT, SHARARA, GHARARA, CHURIDAR
3. Is it a TOP only (not full-length)? → KURTI, BLOUSE, SHIRT, PEPLUM, TUNIC, HOODIE, PULLOVER
4. Is it a SHORT outerwear? → BLAZER, KOTI, SHRUG, CARDIGAN
5. Is it a ONE-PIECE top+bottom? → JUMPSUIT
6. Is it a MATCHING SET? → CO-ORD SET, SALWAR KAMEEZ, PRAYER SET
7. Is it a DRAPED garment (5-6 yards)? → SAREE
8. Is it a LEHENGA (flared skirt + top)? → LEHENGA
9. Does it have BUTTERFLY/BAT-WING sleeves, tent-like shape? → FARASHA or FARASHA 2P
10. Is it EXTREMELY loose, minimal design, full body cover? → BORKA
11. Does it cover from HEAD/SHOULDERS to feet with attached headpiece? → JILBAB
12. Is it loose, ornate, V-neck, NO front opening? → KAFTAN or KAFTAN SET
13. Is it a sleeveless cloak/poncho? → PONCHO, CAPE
14. Is it open-front with wide sleeves, Japanese-inspired? → KIMONO
15. Is it a COAT-like structure with buttons/zip and collar? → COAT
16. Is it a FORMAL floor-length dress with fitted bodice? → GOWN
17. Is it a CASUAL long dress? → MAXI
18. Is it an undergarment/slip? → INNER
19. Is it a WRAP garment? → WRAP, DUPATTA, STOLE, SHAWL
20. Is it swimwear? → BURKINI, MODEST SWIMWEAR
21. ONLY if none of the above match AND it is a structured, full-length modest robe → ABAYA or ABAYA 2P

Return JSON:
{
  "fabric_name": "MUST match FABRICS list — identify by ACTUAL visual characteristics",
  "fabric_type": "Detailed type with weave",
  "embellishment": "MUST match EMBELLISHMENTS list exactly",
  "color": "Precise color",
  "craftsmanship": "Quality description",
  "category": "MUST match CATEGORIES list — follow DECISION TREE above",
  "additional_details": "Weight, opacity, stretch, care, occasion",
  "design_details": "Detailed description of visible motifs/patterns: flower types, vines, leaves, geometric shapes, abstract patterns, border designs, placement",
  "confidence": "high/medium/low",
  "product_name": "category + ' — ' + fabric_name + ' — ' + embellishment"
}

CRITICAL: All values MUST exactly match the inventory lists. Identify the ACTUAL fabric and category from visual cues.`;

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
              { type: "text", text: "Analyze this garment/fabric image carefully. Follow the STEP-BY-STEP CATEGORY DECISION TREE to identify the EXACT category. ABAYA should ONLY be selected at step 21 after ruling out ALL other categories. Return ONLY the JSON object." },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Data}` } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch {
      throw new Error("Failed to parse analysis result");
    }

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
