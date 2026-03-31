"use client";

import { usePathname } from "next/navigation";
import Scene3DBackground from "./Scene3DBackground";

export default function GlobalBackground() {
  const pathname = usePathname();

  // Don't show on homepage (Hero has its own) or product pages
  const isHomepage = /^\/[a-z]{2}\/?$/.test(pathname);
  const isTemplatesPage = /^\/[a-z]{2}\/templates(\/|$)/.test(pathname);

  if (isHomepage || isTemplatesPage) return null;

  return <Scene3DBackground />;
}
