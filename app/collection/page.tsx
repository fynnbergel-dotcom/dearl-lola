import type { Metadata } from "next";
import { CollectionView } from "@/components/collection/collection-view";

export const metadata: Metadata = {
  title: "Lola's Collection",
  description: "Every compliment you've kept, in one place.",
};

export default function CollectionPage() {
  return <CollectionView />;
}
