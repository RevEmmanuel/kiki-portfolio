import type { MetadataRoute } from "next";
import { abs, allowIndexing } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!allowIndexing) return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/", disallow: "/api/" }, sitemap: abs("/sitemap.xml") };
}
