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
    "Wallet QR stamp cards for real-world visits on Celo. Print a counter QR, collect stamps, and validate each reward ticket once.",
  manifest: "/manifest.webmanifest",
  metadataBase: new URL(publicEnv.appUrl),
  alternates: {
    canonical: "/"
  },
  keywords: [
    "MiniPay",
    "Celo",
    "loyalty",
    "customer loyalty",
    "counter QR",
    "dynamic visit QR",
    "live QR",
    "static visit QR",
    "visit QR",
    "QR stamp card",
    "wallet stamps",
    "merchant rewards",
    "reward ticket",
    "reward ticket QR",
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
      "QR stamp cards for small shops, with counter visits, live check-ins, and one-time reward tickets on Celo.",
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
        alt: "noodl3 QR stamp-card loyalty preview"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "noodl3",
    description:
      "QR stamp cards for real visits, wallet stamps, and one-time reward tickets on Celo.",
    images: [
      {
        url: "/og.svg",
        alt: "noodl3 QR stamp-card loyalty preview"
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
