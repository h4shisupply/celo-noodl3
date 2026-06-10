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
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait",
    dir: "ltr",
    lang: "en",
    background_color: "#FBFCFF",
    theme_color: "#FBFCFF",
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "Open the wallet-aware loyalty dashboard.",
        url: "/app",
        icons: [
          {
            src: "/icon.svg",
            type: "image/svg+xml",
            sizes: "any",
            purpose: "any maskable"
          }
        ]
      },
      {
        name: "Create program",
        short_name: "Create",
        description: "Create a new noodl3 stamp card.",
        url: "/app/program/new",
        icons: [
          {
            src: "/icon.svg",
            type: "image/svg+xml",
            sizes: "any",
            purpose: "any maskable"
          }
        ]
      }
    ],
    icons: [
      {
        src: "/icon.svg",
        type: "image/svg+xml",
        sizes: "any",
        purpose: "any maskable"
      }
    ]
  };
}
