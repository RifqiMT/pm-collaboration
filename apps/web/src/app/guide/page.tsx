import { GuideBrowser } from "@/components/guide-browser";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Definitions · TeamCompass",
  description: "Plain-English definitions of the variables, metrics, and formulas used in a TeamCompass room.",
};

export default function GuidePage() {
  return (
    <main className="guide" id="main">
      <header className="guide-bar">
        <Link href="/" className="wordmark">
          TeamCompass
        </Link>
        <Link href="/" className="btn ghost tiny">
          Back
        </Link>
      </header>
      <GuideBrowser />
    </main>
  );
}
