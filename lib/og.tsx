import { ImageResponse } from "next/og";
import { sanitizeText } from "./schema";

export const OG_SIZE = { width: 1200, height: 630 };

/**
 * Fetch a subset of Fraunces (only the glyphs we need) from Google Fonts.
 * Requested without a modern user agent so Google returns TTF, which Satori
 * supports. Falls back to the default font if anything goes wrong.
 */
async function loadFraunces(text: string, italic: boolean): Promise<ArrayBuffer | null> {
  try {
    const family = italic ? "Fraunces:ital,wght@1,400" : "Fraunces:wght@400";
    const url = `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url, { cache: "force-cache" })).text();
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
    if (!src) return null;
    const res = await fetch(src[1], { cache: "force-cache" });
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

function fontSizeFor(text: string) {
  const n = text.length;
  if (n < 70) return 64;
  if (n < 120) return 54;
  if (n < 180) return 46;
  if (n < 240) return 40;
  return 34;
}

export async function renderComplimentCard(rawText: string | null, styleLabel?: string) {
  const text = sanitizeText(rawText ?? "", 300) || "Take a breath. Something nice is on its way.";
  const isDefault = !rawText;
  const quote = isDefault ? text : `“${text}”`;

  const [regular, italic] = await Promise.all([
    loadFraunces(quote, false),
    loadFraunces("Dear Lola · A little something, just for you" + (styleLabel ?? ""), true),
  ]);

  const fonts = [
    regular && { name: "Fraunces", data: regular, style: "normal" as const, weight: 400 as const },
    italic && { name: "Fraunces", data: italic, style: "italic" as const, weight: 400 as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; style: "normal" | "italic"; weight: 400 }[];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 80px",
        backgroundColor: "#fbf7f2",
        backgroundImage:
          "radial-gradient(circle at 0% 0%, #f7c6a8 0%, rgba(247,198,168,0) 45%), radial-gradient(circle at 100% 10%, #cdb8e8 0%, rgba(205,184,232,0) 50%), radial-gradient(circle at 60% 120%, #efa7b5 0%, rgba(239,167,181,0) 50%)",
        color: "#2a1a2e",
        fontFamily: "Fraunces",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 15,
              background: "linear-gradient(135deg, #f7b79a, #d98aa8 55%, #8f5ab8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="30" height="30" viewBox="0 0 32 32">
              <path
                d="M16 23.2s-6.4-3.9-6.4-8.4a3.6 3.6 0 0 1 6.4-2.3 3.6 3.6 0 0 1 6.4 2.3c0 4.5-6.4 8.4-6.4 8.4Z"
                fill="#fff8f1"
              />
            </svg>
          </div>
          <span style={{ fontSize: 34, fontStyle: "italic" }}>Dear Lola</span>
        </div>
        {styleLabel && (
          <span
            style={{
              fontSize: 22,
              fontStyle: "italic",
              padding: "8px 20px",
              borderRadius: 999,
              border: "1px solid rgba(42,26,46,0.15)",
              background: "rgba(255,253,250,0.6)",
            }}
          >
            {styleLabel}
          </span>
        )}
      </div>

      <div
        style={{
          display: "flex",
          fontSize: fontSizeFor(quote),
          lineHeight: 1.22,
          letterSpacing: "-0.02em",
          maxWidth: 1040,
        }}
      >
        {quote}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 20, color: "#6b5a6e", fontSize: 24 }}>
        <div style={{ height: 1, width: 64, background: "rgba(42,26,46,0.25)" }} />
        <span style={{ fontStyle: "italic" }}>A little something, just for you</span>
      </div>
    </div>,
    { ...OG_SIZE, fonts: fonts.length ? fonts : undefined },
  );
}
