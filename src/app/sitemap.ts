import type { MetadataRoute } from "next";
import { detailServices } from "@/content/services";
import { siteConfig } from "@/content/site";

const staticRoutes = [
  "",
  "/about",
  "/services",
  "/uk-seo-services",
  "/india-seo-services",
  "/case-studies",
  "/blog",
  "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries = staticRoutes.map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  })) satisfies MetadataRoute.Sitemap;

  const serviceEntries = detailServices.map((service) => ({
    url: `${siteConfig.url}/services/${service.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  })) satisfies MetadataRoute.Sitemap[number][];

  return [...staticEntries, ...serviceEntries];
}
