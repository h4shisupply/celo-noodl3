import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "noodl3",
    short_name: "noodl3",
    id: "/",
    description:
      "QR stamp cards, wallet stamps, and one-time reward tickets for real-world visits on Celo.",
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
        description: "Open your QR stamp cards, owned programs, and reward tickets.",
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
        name: "Create QR stamp card",
        short_name: "Create",
        description: "Create a new noodl3 QR stamp card with a reward promise and visit goal.",
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
