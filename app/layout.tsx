import localFont from "next/font/local";
import type { Metadata, Viewport } from "next";
import { cookies, headers } from "next/headers";
import "./globals.css";
import { publicEnv } from "../lib/env";
import { getDictionary, resolveLocaleFromRequest } from "../lib/i18n";
import { LocaleProvider } from "../components/locale-provider";

const sans = localFont({
  src: "../app/fonts/SFCompact.ttf",
  variable: "--font-sans",
  display: "swap"
});

const mono = localFont({
  src: "../app/fonts/SFNSMono.ttf",
  variable: "--font-mono",
  display: "swap"
});

export const metadata: Metadata = {
  applicationName: "noodl3",
  title: {
    default: "noodl3",
    template: "%s · noodl3"
  },
  description:
    "Create Web3 loyalty stamp cards on Celo. Customers collect one stamp per visit and redeem one-time rewards with owner or staff validation.",
  metadataBase: new URL(publicEnv.appUrl),
  keywords: [
    "MiniPay",
    "Celo",
    "loyalty",
    "stamp card",
    "merchant rewards",
    "QR"
  ],
  category: "finance",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
    apple: ["/icon.svg"]
  },
  appleWebApp: {
    capable: true,
    title: "noodl3",
    statusBarStyle: "default"
  },
  openGraph: {
    title: "noodl3",
    description:
      "Create Web3 loyalty stamp cards, collect one stamp per visit, and validate rewards with QR flows on Celo.",
    url: publicEnv.appUrl,
    siteName: "noodl3",
    type: "website",
    images: [
      {
        url: "/og.svg",
        width: 1200,
        height: 630,
        alt: "noodl3"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "noodl3",
    description:
      "Web3 stamp-card loyalty programs for real-world visits on Celo.",
    images: ["/og.svg"]
  },
  other: {
    "talentapp:project_verification":
      "cc7197afe9c10ac10336321d8760c55be63e6f4cc7cc0a19a9ed6854dcdffbc17a7edff3b97b247ba300d26aba5d98daad2d657c9ef22513f79668fe38458bb0"
  }
};

export const viewport: Viewport = {
  themeColor: "#fbfafd",
  colorScheme: "light"
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = resolveLocaleFromRequest(await cookies(), await headers());
  const dictionary = getDictionary(locale);

  return (
    <html lang={locale} className={`${sans.variable} ${mono.variable}`}>
      <body>
        <div className="page-shell">
          <div className="app-frame">
            <LocaleProvider locale={locale} dictionary={dictionary}>
              {children}
            </LocaleProvider>
          </div>
        </div>
      </body>
    </html>
  );
}
