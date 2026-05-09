import Link from "next/link";
import { AppWindow, Plus, Sparkles } from "lucide-react";
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
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#7047DF]">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {copy.eyebrow}
          </p>
          <h1 className="text-5xl font-semibold text-[#1B172B] md:text-7xl">
            noodl3
          </h1>
          <p className="text-xl leading-9 text-[#676078]">{copy.description}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/app/program/new">
              <Button size="lg" icon={<Plus className="h-4 w-4" />}>
                {copy.create}
              </Button>
            </Link>
            <Link href="/app">
              <Button size="lg" variant="outline" icon={<AppWindow className="h-4 w-4" />}>
                {copy.openApp}
              </Button>
            </Link>
          </div>
        </div>

        <Card className="stamp-pattern">
          <CardContent className="space-y-6 pt-7">
            <div className="rounded-lg border border-[#E5E1EE] bg-white/90 p-5">
              <p className="text-sm font-semibold text-[#1B172B]">{copy.cardTitle}</p>
              <div className="mt-5 grid grid-cols-5 gap-2">
                {Array.from({ length: 10 }).map((_, index) => (
                  <span
                    key={index}
                    className={`flex aspect-square items-center justify-center rounded-lg border text-sm font-semibold ${
                      index < 7
                        ? "border-[#0F9F8F] bg-[#E9FBF7] text-[#146B5E]"
                        : "border-[#DCD6EA] bg-white text-[#8B84A1]"
                    }`}
                  >
                    {index + 1}
                  </span>
                ))}
              </div>
              <p className="mt-5 text-sm leading-7 text-[#676078]">{copy.cardDescription}</p>
            </div>
            <div className="grid gap-3 text-sm text-[#676078]">
              {copy.points.map((point) => (
                <p key={point} className="rounded-lg bg-white/88 px-4 py-3">
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
  eyebrow: "Pocket stamp cards for real visits",
  description:
    "Create a Celo stamp card customers can carry in their wallet. They scan, collect, and turn full cards into reward tickets you can validate on the spot.",
  create: "Create card",
  openApp: "Open app",
  cardTitle: "7/10 visits",
  cardDescription: "Printed QR for daily stamps, live QR for quick check-ins, reward tickets for owner validation.",
  points: [
    "Any wallet can launch a card.",
    "Printed QR allows one stamp per wallet every 20 hours.",
    "Live QR expires quickly and works once."
  ]
};

const ptHomeCopy = {
  eyebrow: "Cartões de selo para visitas reais",
  description:
    "Crie um cartão de selos na Celo que clientes carregam na carteira. Eles leem, colecionam e transformam cartões completos em tickets que você valida na hora.",
  create: "Criar cartão",
  openApp: "Abrir app",
  cardTitle: "7/10 visitas",
  cardDescription: "QR impresso para selos diários, QR ao vivo para check-ins rápidos e tickets de recompensa para validação do dono.",
  points: [
    "Qualquer carteira pode lançar um cartão.",
    "QR impresso libera um selo por carteira a cada 20 horas.",
    "QR ao vivo expira rápido e funciona uma vez."
  ]
};
