import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "noodl3",
    short_name: "noodl3",
    description:
      "Web3 stamp-card loyalty programs for real-world visits on Celo.",
    start_url: "/",
    display: "standalone",
    background_color: "#FBFAFD",
    theme_color: "#FBFAFD",
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
