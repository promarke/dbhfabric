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

    const CATEGORIES = ["ABAYA", "ABAYA 2P", "FARASHA", "FARASHA 2P", "BLAZER", "BORKA", "KOTI", "INNER", "HIJAB", "URNA", "NIQAAB", "KHIMAR", "JILBAB", "KAFTAN", "COAT", "PRAYER SET", "SAREE", "KURTI", "GOWN", "MAXI"];
    const FABRICS = ["Crepe", "Chiffon", "Georgette", "Nida", "Jersey", "Silk", "Cotton", "Polyester", "ZOOM", "CEY", "ORGANJA", "POKA", "AROWA", "TICTOC", "PRINT", "BABLA", "BELVET", "LILEN", "KASMIRI", "FAKRU PRINT", "KORIYAN SIMAR", "JORI SHIPON", "Satin", "Linen", "Rayon", "Viscose", "Modal", "Tencel", "Lycra", "Spandex", "Twill", "Jacquard", "Dobby", "Poplin", "Oxford", "French Terry", "Ponte", "Bamboo", "Wool", "Acrylic", "Nylon"];
    const EMBELLISHMENTS = ["Plain", "Embroidered", "Beaded", "Lace", "Sequined", "Stone Work", "HAND WORK", "ARI WORK", "CREP Work", "BeadSton", "LaceSton", "EmbroStone", "AriStone", "HandSton", "CrepStone", "SeqenStone", "StoneFbody", "StoneHbody", "Stonehand", "StoneBack", "AriHbody", "AriFBoday", "Arihand", "AriFront", "AriBack", "EmbroFBody", "EmbroHbody", "EmbroHand", "EmbroFront", "BelvetStone", "Belvet", "Pearl", "Applique", "Zari", "Rhinestone", "Crystal", "Foil Print", "Digital Print", "Block Print", "Screen Print", "Pintuck", "Pleating", "Cutwork", "Ribbon"];

    const systemPrompt = `You are a world-class textile analyst. Map analysis to EXACT inventory values:

**CATEGORIES:** ${CATEGORIES.join(", ")}
**FABRICS:** ${FABRICS.join(", ")}
**EMBELLISHMENTS:** ${EMBELLISHMENTS.join(", ")}

Return JSON:
{
  "fabric_name": "MUST match FABRICS list exactly",
  "fabric_type": "Detailed type with weave",
  "embellishment": "MUST match EMBELLISHMENTS list exactly",
  "color": "Precise color",
  "craftsmanship": "Quality description",
  "category": "MUST match CATEGORIES list exactly",
  "additional_details": "Weight, opacity, stretch, care, occasion",
  "confidence": "high/medium/low",
  "product_name": "category + ' — ' + fabric_name + ' — ' + embellishment"
}

CRITICAL: All values MUST exactly match the inventory lists above.`;

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
              { type: "text", text: "Analyze this fabric/garment image and return ONLY the JSON object." },
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
