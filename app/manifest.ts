import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "noodl3",
    short_name: "noodl3",
    id: "/",
    description:
      "Merchant QR stamp cards for real-world visits, visit stamps, and one-time reward tickets on Celo.",
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
        description: "Open the customer and owner dashboard for QR stamp cards, visit stamps, and reward tickets.",
        url: "/app",
        icons: [
          {
            src: "/icon.svg",
            type: "image/svg+xml",
            sizes: "any",
            purpose: "maskable"
          }
        ]
      },
      {
        name: "Create merchant QR stamp card",
        short_name: "Create card",
        description: "Create a new noodl3 merchant QR stamp card with an HTTPS logo URL, reward promise, and customer visit goal.",
        url: "/app/program/new",
        icons: [
          {
            src: "/icon.svg",
            type: "image/svg+xml",
            sizes: "any",
            purpose: "maskable"
          }
        ]
      }
    ],
    icons: [
      {
        src: "/icon.svg",
        type: "image/svg+xml",
        sizes: "any",
        purpose: "maskable"
      }
    ]
  };
}
