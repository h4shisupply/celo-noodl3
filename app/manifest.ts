import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "noodl3",
    short_name: "noodl3",
    id: "/",
    description:
      "QR stamp cards, wallet stamps, and one-time reward tickets for real-world visits on Celo.",
    categories: ["finance", "shopping", "utilities"],
    start_url: "/",
    scope: "/",
    display: "standalone",
    dir: "ltr",
    background_color: "#FBFCFF",
    theme_color: "#FBFCFF",
    icons: [
      {
        src: "/icon.svg",
        type: "image/svg+xml",
        sizes: "any",
        purpose: "any"
      }
    ]
  };
}
