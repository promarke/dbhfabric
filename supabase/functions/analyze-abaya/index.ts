import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const CATEGORIES = ["ABAYA", "ABAYA 2P", "FARASHA", "FARASHA 2P", "BLAZER", "BORKA", "KOTI", "INNER", "HIJAB", "URNA", "NIQAAB", "KHIMAR", "JILBAB", "KAFTAN", "COAT", "PRAYER SET", "SAREE", "KURTI", "GOWN", "MAXI"];
    const FABRICS = ["Crepe", "Chiffon", "Georgette", "Nida", "Jersey", "Silk", "Cotton", "Polyester", "ZOOM", "CEY", "ORGANJA", "POKA", "AROWA", "TICTOC", "PRINT", "BABLA", "BELVET", "LILEN", "KASMIRI", "FAKRU PRINT", "KORIYAN SIMAR", "JORI SHIPON", "Satin", "Linen", "Rayon", "Viscose", "Modal", "Tencel", "Lycra", "Spandex", "Twill", "Jacquard", "Dobby", "Poplin", "Oxford", "French Terry", "Ponte", "Bamboo", "Wool", "Acrylic", "Nylon"];
    const EMBELLISHMENTS = ["Plain", "Embroidered", "Beaded", "Lace", "Sequined", "Stone Work", "HAND WORK", "ARI WORK", "CREP Work", "BeadSton", "LaceSton", "EmbroStone", "AriStone", "HandSton", "CrepStone", "SeqenStone", "StoneFbody", "StoneHbody", "Stonehand", "StoneBack", "AriHbody", "AriFBoday", "Arihand", "AriFront", "AriBack", "EmbroFBody", "EmbroHbody", "EmbroHand", "EmbroFront", "BelvetStone", "Belvet", "Pearl", "Applique", "Zari", "Rhinestone", "Crystal", "Foil Print", "Digital Print", "Block Print", "Screen Print", "Pintuck", "Pleating", "Cutwork", "Ribbon"];

    const systemPrompt = `You are a world-class textile analyst specializing in fabric identification. Your PRIMARY skill is distinguishing between different fabric types by analyzing texture, drape, sheen, weave pattern, and surface characteristics visible in images.

IMPORTANT: You MUST map your analysis to the following EXACT inventory values:

**CATEGORIES (use EXACTLY one):** ${CATEGORIES.join(", ")}
**FABRICS (use EXACTLY one):** ${FABRICS.join(", ")}
**EMBELLISHMENTS (use EXACTLY one or combine with +):** ${EMBELLISHMENTS.join(", ")}

CRITICAL FABRIC IDENTIFICATION RULES:
- DO NOT default to "Nida" for every fabric. Nida is only ONE specific fabric type.
- Carefully analyze the image for these visual cues:
  - **Crepe**: Slightly rough/crinkled texture, matte finish
  - **Chiffon**: Sheer, lightweight, see-through, flowing
  - **Georgette**: Slightly rough, crinkled, more opaque than chiffon
  - **Nida**: Smooth, matte, medium-weight, no texture pattern
  - **Jersey**: Stretchy, knit texture, drapes closely to body
  - **Silk/Satin**: High sheen, smooth, lustrous, reflective surface
  - **Cotton**: Natural texture, breathable look, slightly stiff
  - **Polyester**: Synthetic sheen, wrinkle-resistant appearance
  - **ZOOM**: Thick, heavy, structured
  - **CEY**: Soft, flowing, slightly textured
  - **ORGANJA**: Stiff, sheer, crisp
  - **Jacquard**: Woven patterns visible in the fabric
  - **BELVET/Velvet**: Soft pile, rich texture, light-absorbing surface
  - **Linen/LILEN**: Natural, slightly wrinkled, breathable texture
- Look at shine, texture, weight, drape, and transparency to determine the ACTUAL fabric
- Each fabric has distinct visual characteristics — USE THEM

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
  "confidence": "high/medium/low",
  "product_name": "Auto-generated: category_en + fabric_name_en + embellishment_en joined by space-dash-space"
}

CRITICAL RULES:
- category_en MUST exactly match one from CATEGORIES list
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
              { type: "text", text: "Analyze this burqa/abaya image and return ONLY the JSON object with no extra text." },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
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
