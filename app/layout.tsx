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
  authors: [{ name: "H4shi" }],
  creator: "H4shi",
  publisher: "H4shi",
  title: {
    default: "noodl3",
    template: "%s · noodl3"
  },
  description:
    "Celo-native merchant QR stamp card loyalty app for real-world visits. Print a visit QR, collect visit stamps, and validate each reward ticket once.",
  manifest: "/manifest.webmanifest",
  metadataBase: new URL(publicEnv.appUrl),
  alternates: {
    canonical: "/"
  },
  keywords: [
    "MiniPay",
    "Celo",
    "Celo loyalty",
    "QR loyalty",
    "QR scanner",
    "PWA",
    "loyalty",
    "loyalty program",
    "manual stamp",
    "customer loyalty",
    "counter QR",
    "live visit QR",
    "live QR",
    "printed visit QR",
    "static visit QR",
    "dynamic visit QR",
    "visit QR",
    "wallet",
    "customer QR stamp card",
    "merchant QR stamp card",
    "QR stamp card",
    "stamp card",
    "wallet stamps",
    "visit stamps",
    "merchant loyalty",
    "merchant reward surfaces",
    "merchant rewards",
    "reward ticket",
    "reward ticket QR",
    "reward ticket sheet",
    "QR code",
    "QR"
  ],
  category: "finance",
  robots: {
    index: true,
    follow: true
  },
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false
  },
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
      "Celo-native merchant QR stamp card loyalty app for real-world visits. Print a visit QR, collect visit stamps, and validate each reward ticket once.",
    url: publicEnv.appUrl,
    siteName: "noodl3",
    type: "website",
    locale: "en_US",
    alternateLocale: ["pt_BR"],
    images: [
      {
        url: "/og.svg",
        width: 1200,
        height: 630,
        alt: "noodl3 printed visit QR, visit stamps, and reward ticket QR preview"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "noodl3",
    description:
      "Celo-native merchant QR stamp card loyalty app for real-world visits. Print a visit QR, collect visit stamps, and validate each reward ticket once.",
    images: [
      {
        url: "/og.svg",
        alt: "noodl3 printed visit QR, visit stamps, and reward ticket QR preview"
      }
    ]
  },
  other: {
    "talentapp:project_verification":
      "cc7197afe9c10ac10336321d8760c55be63e6f4cc7cc0a19a9ed6854dcdffbc17a7edff3b97b247ba300d26aba5d98daad2d657c9ef22513f79668fe38458bb0"
  }
};

export const viewport: Viewport = {
  themeColor: "#fbfcff",
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
    <html lang={locale} dir="ltr" className={`${sans.variable} ${mono.variable}`}>
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
