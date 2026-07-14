import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CHAT_MODEL, getGenAI } from "@/lib/gemini";

const TONES = ["professional", "playful", "luxury", "technical"] as const;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const title = String(body.title ?? "").trim();
  const category = String(body.category ?? "").trim();
  const keywords = String(body.keywords ?? "").trim();
  const currentDescription = String(body.currentDescription ?? "").trim();
  const tone = TONES.includes(body.tone) ? (body.tone as string) : "professional";

  if (!title) {
    return NextResponse.json(
      { error: "Give the product a title first." },
      { status: 400 }
    );
  }

  const prompt = [
    `Write an e-commerce product description for: "${title}".`,
    category && `Category: ${category}.`,
    keywords && `Work in these keywords or details: ${keywords}.`,
    currentDescription &&
      `Here is the current description to improve on:\n"""${currentDescription}"""`,
    `Tone: ${tone}.`,
    "",
    "Rules:",
    "- 2 short paragraphs (max ~60 words each) followed by 3 bullet-point highlights.",
    "- Plain text only: no markdown symbols, no headings, no emoji. Use '•' for bullets.",
    "- Concrete and specific; never invent measurable specs (weights, materials, certifications) that were not provided.",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const ai = getGenAI();
    const result = await ai.models.generateContent({
      model: CHAT_MODEL,
      contents: prompt,
    });
    const description = result.text?.trim();
    if (!description) {
      return NextResponse.json(
        { error: "The model returned an empty response. Try again." },
        { status: 502 }
      );
    }
    return NextResponse.json({ description });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "AI request failed." },
      { status: 502 }
    );
  }
}
