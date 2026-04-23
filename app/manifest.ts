import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "noodl3",
    short_name: "noodl3",
    description:
      "MiniPay-native loyalty for local food and drink stores on Celo.",
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
