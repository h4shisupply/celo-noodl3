import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "noodl3",
    short_name: "noodl3",
    id: "/",
    description:
      "Celo-native merchant QR stamp card loyalty app for real-world visits. Print a visit QR, collect visit stamps, add manual fallback stamps, and validate each reward ticket once.",
    categories: ["business", "finance", "shopping", "utilities"],
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    launch_handler: {
      client_mode: "focus-existing"
    },
    orientation: "portrait",
    dir: "ltr",
    lang: "en",
    background_color: "#FBFCFF",
    theme_color: "#FBFCFF",
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "Open the noodl3 dashboard with customer QR stamp cards, merchant QR stamp cards, visit stamps, manual fallback stamps, and reward tickets.",
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
        name: "Create merchant QR stamp card",
        short_name: "Create card",
        description: "Create a Celo-native merchant QR stamp card with a square public HTTPS logo URL, a reward promise, and a visit goal.",
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
