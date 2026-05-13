import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "noodl3",
    short_name: "noodl3",
    description:
      "Wallet stamp cards, counter QR codes, and one-time reward tickets for real-world visits on Celo.",
    start_url: "/",
    display: "standalone",
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
