import { renderComplimentCard } from "@/lib/og";
import { STYLE_META, STYLES, type ComplimentStyle } from "@/lib/types";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("c");
  const s = searchParams.get("s");
  const style = STYLES.includes(s as ComplimentStyle) ? STYLE_META[s as ComplimentStyle].label : undefined;
  const image = await renderComplimentCard(text, style);
  image.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return image;
}
