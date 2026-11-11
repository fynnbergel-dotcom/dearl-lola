import { OG_SIZE, renderComplimentCard } from "@/lib/og";

export const alt = "Dear Lola: Take a breath. Something nice is on its way.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderComplimentCard(null);
}
