import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SkillBridge — Career Readiness Analyzer",
    short_name: "SkillBridge",
    description: "Objective, evidence-weighted career readiness benchmarks and skill gap analysis.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#F7F8FF",
    theme_color: "#4F46E5",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
