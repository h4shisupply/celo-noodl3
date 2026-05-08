import Link from "next/link";
import { BrandMark } from "./brand-mark";
import { LanguageSwitcher } from "./language-switcher";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import type { Locale } from "../lib/i18n";

export function HomePage({ locale }: { locale: Locale }) {
  const copy = locale === "en" ? enHomeCopy : ptHomeCopy;

  return (
    <main className="space-y-16 pb-20">
      <header className="flex items-center justify-between py-6">
        <BrandMark href="/" />
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link href="/app">
            <Button size="sm">{copy.openApp}</Button>
          </Link>
        </div>
      </header>

      <section className="grid min-h-[68dvh] items-center gap-10 lg:grid-cols-[minmax(0,1fr)_28rem]">
        <div className="max-w-3xl space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7B3FE4]">
            {copy.eyebrow}
          </p>
          <h1 className="text-5xl font-semibold tracking-[-0.04em] text-[#18122A] md:text-7xl">
            noodl3
          </h1>
          <p className="text-xl leading-9 text-[#625B78]">{copy.description}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/app/program/new">
              <Button size="lg">{copy.create}</Button>
            </Link>
            <Link href="/app">
              <Button size="lg" variant="outline">
                {copy.openApp}
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardContent className="space-y-6 pt-7">
            <div className="rounded-[24px] border border-[#ECEAF4] bg-[#FBFAFD] p-5">
              <p className="text-sm font-semibold text-[#18122A]">{copy.cardTitle}</p>
              <div className="mt-5 grid grid-cols-5 gap-2">
                {Array.from({ length: 10 }).map((_, index) => (
                  <span
                    key={index}
                    className={`flex aspect-square items-center justify-center rounded-full border text-sm font-semibold ${
                      index < 7
                        ? "border-[#17122A] bg-[#17122A] text-white"
                        : "border-[#DCD6EA] bg-white text-[#8B84A1]"
                    }`}
                  >
                    {index + 1}
                  </span>
                ))}
              </div>
              <p className="mt-5 text-sm leading-7 text-[#625B78]">{copy.cardDescription}</p>
            </div>
            <div className="grid gap-3 text-sm text-[#625B78]">
              {copy.points.map((point) => (
                <p key={point} className="rounded-2xl bg-[#F5F3FA] px-4 py-3">
                  {point}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

const enHomeCopy = {
  eyebrow: "Web3 loyalty for real visits",
  description:
    "Create a stamp-card loyalty program on Celo. Customers scan a QR, collect one stamp per visit, and claim rewards without catalogs or item checkout.",
  create: "Create program",
  openApp: "Open app",
  cardTitle: "7/10 visits",
  cardDescription: "One fixed QR for daily self-stamps, dynamic QR for fast check-ins, one-time reward claims for owner validation.",
  points: [
    "Any wallet can create a program.",
    "Fixed QR allows one stamp per wallet every 20 hours.",
    "Dynamic QR expires and can be used once."
  ]
};

const ptHomeCopy = {
  eyebrow: "Fidelidade Web3 para visitas reais",
  description:
    "Crie um programa de selos na Celo. Clientes leem um QR, recebem um selo por visita e resgatam recompensas sem catálogo nem checkout.",
  create: "Criar programa",
  openApp: "Abrir app",
  cardTitle: "7/10 visitas",
  cardDescription: "QR fixo para selos diários, QR dinâmico para check-ins rápidos e recompensas de uso único com validação do dono.",
  points: [
    "Qualquer carteira pode criar um programa.",
    "QR fixo libera um selo por carteira a cada 20 horas.",
    "QR dinâmico expira e só pode ser usado uma vez."
  ]
};
