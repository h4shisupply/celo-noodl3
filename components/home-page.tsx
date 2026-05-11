import Link from "next/link";
import {
  AppWindow,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Coins,
  Languages,
  Plus,
  QrCode,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Store,
  TicketCheck,
  WalletCards
} from "lucide-react";
import { BrandMark } from "./brand-mark";
import { LanguageSwitcher } from "./language-switcher";
import { Button } from "./ui/button";
import type { Locale } from "../lib/i18n";

type HomeCopy = {
  nav: {
    workflow: string;
    proof: string;
    pilot: string;
    faq: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    footnote: string;
    stats: Array<{
      value: string;
      label: string;
    }>;
  };
  visual: {
    program: string;
    printedQr: string;
    liveQr: string;
    rewardTicket: string;
    validate: string;
    stamps: string;
    ready: string;
    ownerOnly: string;
    expires: string;
    ticketCode: string;
  };
  problem: {
    eyebrow: string;
    title: string;
    description: string;
    points: string[];
  };
  workflow: {
    eyebrow: string;
    title: string;
    description: string;
    steps: Array<{
      title: string;
      description: string;
    }>;
  };
  benefits: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  };
  proof: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  };
  pilot: {
    eyebrow: string;
    title: string;
    description: string;
    checklist: string[];
  };
  faq: {
    eyebrow: string;
    title: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
  finalCta: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
  };
};

const qrCells = [
  0, 1, 2, 4, 5, 7, 8, 10, 11, 13, 15, 16, 17, 18, 20, 22, 24, 25, 27, 28,
  29, 31, 33, 35, 36, 38, 40, 41, 43, 44, 46, 48, 50, 51, 52, 55, 56, 58,
  59, 61, 63, 64, 66, 68, 69, 70, 72, 73, 75, 77, 79, 80
];

const icons = [
  Store,
  QrCode,
  ScanLine,
  TicketCheck,
  BadgeCheck,
  WalletCards,
  ShieldCheck,
  Clock3,
  Languages,
  Coins
];

export function HomePage({ locale }: { locale: Locale }) {
  const copy = locale === "en" ? enHomeCopy : ptHomeCopy;

  return (
    <main className="pb-20">
      <header className="py-5 md:py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <BrandMark href="/" />
          <nav className="hidden items-center gap-5 md:flex" aria-label="Landing page">
            <a className="text-sm font-medium text-[#676078] transition hover:text-[#1B172B]" href="#workflow">{copy.nav.workflow}</a>
            <a className="text-sm font-medium text-[#676078] transition hover:text-[#1B172B]" href="#proof">{copy.nav.proof}</a>
            <a className="text-sm font-medium text-[#676078] transition hover:text-[#1B172B]" href="#pilot">{copy.nav.pilot}</a>
            <a className="text-sm font-medium text-[#676078] transition hover:text-[#1B172B]" href="#faq">{copy.nav.faq}</a>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/app/program/new">
              <Button size="sm">{copy.hero.primaryCta}</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="grid min-h-[74dvh] items-center gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(23rem,31rem)] lg:py-12">
        <div className="max-w-3xl space-y-7">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#7047DF]">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {copy.hero.eyebrow}
          </p>
          <div className="space-y-5">
            <h1 className="max-w-4xl text-4xl font-semibold leading-[1.02] text-[#1B172B] sm:text-5xl md:text-7xl">
              {copy.hero.title}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[#676078] md:text-xl md:leading-9">
              {copy.hero.description}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/app/program/new" className="w-full sm:w-auto">
              <Button size="lg" icon={<Plus className="h-4 w-4" />} className="w-full sm:w-auto">
                {copy.hero.primaryCta}
              </Button>
            </Link>
            <Link href="/app" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                icon={<AppWindow className="h-4 w-4" />}
                className="w-full sm:w-auto"
              >
                {copy.hero.secondaryCta}
              </Button>
            </Link>
          </div>
          <p className="text-sm leading-6 text-[#676078]">{copy.hero.footnote}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {copy.hero.stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-[#E5E1EE] bg-white/78 px-4 py-3"
              >
                <p className="text-lg font-semibold text-[#1B172B]">{stat.value}</p>
                <p className="text-sm text-[#676078]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <ProductVisual copy={copy.visual} />
      </section>

      <section className="py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1fr] lg:items-start">
          <SectionIntro
            eyebrow={copy.problem.eyebrow}
            title={copy.problem.title}
            description={copy.problem.description}
          />
          <div className="grid gap-3">
            {copy.problem.points.map((point) => (
              <div
                key={point}
                className="flex gap-3 rounded-lg border border-[#E5E1EE] bg-white/82 p-4"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#0F9F8F]" aria-hidden="true" />
                <p className="text-sm leading-6 text-[#3A344D]">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="py-12 md:py-16">
        <SectionIntro
          eyebrow={copy.workflow.eyebrow}
          title={copy.workflow.title}
          description={copy.workflow.description}
        />
        <div className="mt-8 grid gap-4 md:grid-cols-5">
          {copy.workflow.steps.map((step, index) => {
            const Icon = icons[index] ?? BadgeCheck;
            return (
              <article
                key={step.title}
                className="rounded-lg border border-[#E5E1EE] bg-white/84 p-5 shadow-[0_14px_40px_rgba(27,23,43,0.06)]"
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg border border-[#D9D0F4] bg-[#F3EFFF] text-[#7047DF]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-xs font-semibold text-[#8B84A1]">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-[#1B172B]">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#676078]">{step.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <SectionIntro
            eyebrow={copy.benefits.eyebrow}
            title={copy.benefits.title}
            description={copy.benefits.description}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {copy.benefits.items.map((item, index) => {
              const Icon = icons[index + 5] ?? ShieldCheck;
              return (
                <article
                  key={item.title}
                  className="rounded-lg border border-[#E5E1EE] bg-white/84 p-5"
                >
                  <Icon className="h-5 w-5 text-[#7047DF]" aria-hidden="true" />
                  <h3 className="mt-4 text-base font-semibold text-[#1B172B]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#676078]">{item.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="proof" className="py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="order-2 grid gap-4 sm:grid-cols-2 lg:order-1">
            {copy.proof.items.map((item, index) => {
              const Icon = icons[index + 1] ?? QrCode;
              return (
                <article
                  key={item.title}
                  className="rounded-lg border border-[#E5E1EE] bg-white/84 p-5"
                >
                  <Icon className="h-5 w-5 text-[#0F9F8F]" aria-hidden="true" />
                  <h3 className="mt-4 text-base font-semibold text-[#1B172B]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#676078]">{item.description}</p>
                </article>
              );
            })}
          </div>
          <div className="order-1 lg:order-2">
            <SectionIntro
              eyebrow={copy.proof.eyebrow}
              title={copy.proof.title}
              description={copy.proof.description}
            />
          </div>
        </div>
      </section>

      <section id="pilot" className="py-12 md:py-16">
        <div className="rounded-lg border border-[#E5E1EE] bg-white/88 p-5 shadow-[0_18px_52px_rgba(27,23,43,0.08)] md:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <SectionIntro
              eyebrow={copy.pilot.eyebrow}
              title={copy.pilot.title}
              description={copy.pilot.description}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {copy.pilot.checklist.map((item) => (
                <div key={item} className="flex gap-3 rounded-lg bg-[#FBFCFF] p-4">
                  <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#0F9F8F]" aria-hidden="true" />
                  <p className="text-sm leading-6 text-[#3A344D]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="py-12 md:py-16">
        <SectionIntro eyebrow={copy.faq.eyebrow} title={copy.faq.title} />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {copy.faq.items.map((item) => (
            <article
              key={item.question}
              className="rounded-lg border border-[#E5E1EE] bg-white/84 p-5"
            >
              <h3 className="text-base font-semibold text-[#1B172B]">{item.question}</h3>
              <p className="mt-3 text-sm leading-6 text-[#676078]">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="stamp-pattern rounded-lg border border-[#E5E1EE] bg-white/88 p-6 text-center shadow-[0_18px_52px_rgba(27,23,43,0.08)] md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7047DF]">
            {copy.finalCta.eyebrow}
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold text-[#1B172B] md:text-5xl">
            {copy.finalCta.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[#676078]">
            {copy.finalCta.description}
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/app/program/new" className="w-full sm:w-auto">
              <Button size="lg" icon={<Plus className="h-4 w-4" />} className="w-full sm:w-auto">
                {copy.finalCta.primaryCta}
              </Button>
            </Link>
            <Link href="/app" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                icon={<AppWindow className="h-4 w-4" />}
                className="w-full sm:w-auto"
              >
                {copy.finalCta.secondaryCta}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-3xl space-y-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7047DF]">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-semibold text-[#1B172B] md:text-5xl">{title}</h2>
      {description ? (
        <p className="text-base leading-8 text-[#676078]">{description}</p>
      ) : null}
    </div>
  );
}

function ProductVisual({ copy }: { copy: HomeCopy["visual"] }) {
  return (
    <div className="surface-panel stamp-pattern rounded-lg p-3 md:p-4">
      <div className="space-y-4 rounded-lg bg-white/92 p-4 md:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7047DF]">
              {copy.program}
            </p>
            <p className="mt-1 text-xl font-semibold text-[#1B172B]">Coffee Club</p>
          </div>
          <span className="rounded-full border border-[#BDE8D8] bg-[#E9FBF7] px-3 py-1 text-xs font-semibold text-[#146B5E]">
            {copy.ready}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-lg border border-[#E5E1EE] bg-[#FBFCFF] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[#1B172B]">{copy.printedQr}</p>
              <QrCode className="h-4 w-4 text-[#7047DF]" aria-hidden="true" />
            </div>
            <div className="mx-auto mt-4 max-w-[9.5rem] rounded-lg border border-[#DCD6EA] bg-white p-3">
              <QrPattern />
            </div>
            <p className="mt-4 rounded-lg bg-[#FFF7E8] px-3 py-2 text-xs font-semibold text-[#8B5B00]">
              {copy.stamps}
            </p>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border border-[#E5E1EE] bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#1B172B]">{copy.liveQr}</p>
                <span className="inline-flex items-center gap-1 rounded-full border border-[#F5DFC1] bg-[#FFF7E8] px-2.5 py-1 text-xs font-semibold text-[#8B5B00]">
                  <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                  {copy.expires}
                </span>
              </div>
              <StampProgress />
            </div>

            <div className="rounded-lg border border-[#E5E1EE] bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#1B172B]">{copy.rewardTicket}</p>
                  <p className="mt-1 font-mono text-xs font-semibold text-[#7047DF]">
                    {copy.ticketCode}
                  </p>
                </div>
                <TicketCheck className="h-5 w-5 text-[#0F9F8F]" aria-hidden="true" />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-[#E9FBF7] px-3 py-3">
                <p className="text-sm font-semibold text-[#146B5E]">{copy.validate}</p>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#146B5E]">
                  {copy.ownerOnly}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QrPattern() {
  return (
    <div className="grid aspect-square grid-cols-9 gap-1">
      {Array.from({ length: 81 }).map((_, index) => (
        <span
          key={index}
          className={`rounded-[2px] ${qrCells.includes(index) ? "bg-[#1B172B]" : "bg-[#F7F9FF]"}`}
        />
      ))}
    </div>
  );
}

function StampProgress() {
  return (
    <div className="mt-4 grid grid-cols-5 gap-2">
      {Array.from({ length: 10 }).map((_, index) => (
        <span
          key={index}
          className={`flex aspect-square items-center justify-center rounded-lg border text-xs font-semibold ${
            index < 7
              ? "border-[#0F9F8F] bg-[#E9FBF7] text-[#146B5E]"
              : "border-[#DCD6EA] bg-[#FBFCFF] text-[#8B84A1]"
          }`}
        >
          {index + 1}
        </span>
      ))}
    </div>
  );
}

const enHomeCopy: HomeCopy = {
  nav: {
    workflow: "Workflow",
    proof: "Product",
    pilot: "Pilot",
    faq: "FAQ"
  },
  hero: {
    eyebrow: "Merchant pilot ready",
    title: "Wallet-native stamp cards for small merchants.",
    description:
      "noodl3 gives shops a simple QR loyalty loop: print a counter QR, let customers collect stamps in their wallet, and validate rewards at the register.",
    primaryCta: "Create card",
    secondaryCta: "Open app",
    footnote: "No catalog, checkout rebuild, points backend, or paper cards required.",
    stats: [
      { value: "QR first", label: "Built for counters and walk-ins" },
      { value: "5 min", label: "Live QR expiry for owner-led check-ins" },
      { value: "1 ticket", label: "One-use reward validation" }
    ]
  },
  visual: {
    program: "Live merchant flow",
    printedQr: "Printed visit QR",
    liveQr: "Live visit QR",
    rewardTicket: "Reward ticket",
    validate: "Owner validates reward",
    stamps: "7 of 10 visits stamped",
    ready: "Active",
    ownerOnly: "owner only",
    expires: "4:58",
    ticketCode: "R-0042"
  },
  problem: {
    eyebrow: "Why this exists",
    title: "Small shops need loyalty that fits the counter.",
    description:
      "Most digital loyalty tools ask merchants to change too much before they can test one simple idea: reward repeat visits.",
    points: [
      "Paper cards are easy to start but easy to lose, fake, or forget.",
      "Full POS and catalog systems are too heavy for a fast pilot.",
      "Custodial points databases hide the customer relationship inside another platform."
    ]
  },
  workflow: {
    eyebrow: "How it works",
    title: "One merchant, one QR, one repeat-visit loop.",
    description:
      "The product focuses on the exact counter workflow a merchant can run today.",
    steps: [
      {
        title: "Create a card",
        description: "Set the shop name, logo, reward, visit count, and whether printed QR stamps are active."
      },
      {
        title: "Print the QR",
        description: "Place the static QR at the register so customers can self-stamp once every 20 hours."
      },
      {
        title: "Scan and collect",
        description: "Customers open the QR, connect a wallet, and collect a stamp on their card."
      },
      {
        title: "Unlock reward",
        description: "A completed card becomes a reward ticket with a QR and backup code."
      },
      {
        title: "Validate once",
        description: "The owner wallet marks the reward as used, blocking a second validation."
      }
    ]
  },
  benefits: {
    eyebrow: "Merchant benefits",
    title: "A pilotable loyalty system without operational drag.",
    description:
      "noodl3 stays intentionally narrow so a merchant can test loyalty before investing in a larger stack.",
    items: [
      {
        title: "No paper card cleanup",
        description: "Customers keep progress in their wallet, not in a punch card that disappears."
      },
      {
        title: "No checkout rebuild",
        description: "The QR workflow works beside the register without adding a cart, catalog, or POS integration."
      },
      {
        title: "No points backend",
        description: "Program progress and reward usage live onchain instead of in a private spreadsheet."
      },
      {
        title: "Bilingual by default",
        description: "The app supports Portuguese and English across the merchant and customer flow."
      }
    ]
  },
  proof: {
    eyebrow: "Product proof",
    title: "The important pilot states are already part of the flow.",
    description:
      "The landing page should show the same concepts a merchant will use inside the app.",
    items: [
      {
        title: "Printed QR",
        description: "A reusable counter sheet for daily self-stamps with a 20-hour wallet cooldown."
      },
      {
        title: "Live QR",
        description: "An owner-signed QR that expires quickly and is intended for one customer check-in."
      },
      {
        title: "Reward ticket",
        description: "A completed card produces a ticket QR with a backup code for counter validation."
      },
      {
        title: "Owner validation",
        description: "Only the program owner can consume a reward, and used tickets show a clear used state."
      }
    ]
  },
  pilot: {
    eyebrow: "Pilot checklist",
    title: "What a shop can do on day one.",
    description:
      "The V1 scope is deliberately practical: launch the card, place the QR, stamp visits, and validate rewards.",
    checklist: [
      "Create a branded stamp card from a wallet.",
      "Print or download the static counter QR.",
      "Use live QR for owner-led visits when needed.",
      "Let customers collect stamps from their own wallet.",
      "Open reward tickets with QR and backup code.",
      "Validate each reward once from the owner wallet."
    ]
  },
  faq: {
    eyebrow: "FAQ",
    title: "Merchant questions, answered plainly.",
    items: [
      {
        question: "Do customers need a wallet?",
        answer: "Yes. noodl3 is wallet-native, so customers collect stamps and hold reward tickets from a compatible wallet."
      },
      {
        question: "Why Celo and MiniPay?",
        answer: "Celo keeps the mobile wallet experience lightweight and keeps stamp and reward transactions inexpensive enough for pilots."
      },
      {
        question: "What is the difference between printed and live QR?",
        answer: "Printed QR is reusable for daily self-stamps. Live QR is owner-generated, expires in minutes, and is for live check-ins."
      },
      {
        question: "Can a reward be used twice?",
        answer: "No. The owner consumes the reward ticket once, and the app shows the used state after validation."
      },
      {
        question: "Is there a checkout or catalog?",
        answer: "Not in V1. noodl3 focuses on real-world visit loyalty, not menus, carts, payments, or POS integrations."
      },
      {
        question: "Can staff validate rewards?",
        answer: "V1 is owner-only. Delegation can come later after the pilot proves the counter workflow."
      }
    ]
  },
  finalCta: {
    eyebrow: "Ready for a pilot",
    title: "Launch the first stamp card and test loyalty at the counter.",
    description:
      "Start with one reward, one printed QR, and a workflow your staff can understand in minutes.",
    primaryCta: "Create card",
    secondaryCta: "Open app"
  }
};

const ptHomeCopy: HomeCopy = {
  nav: {
    workflow: "Fluxo",
    proof: "Produto",
    pilot: "Piloto",
    faq: "FAQ"
  },
  hero: {
    eyebrow: "Pronto para piloto com lojistas",
    title: "Cartões de selo na carteira para pequenos comércios.",
    description:
      "noodl3 entrega um loop simples de fidelidade por QR: imprima o QR do balcão, deixe clientes colecionarem selos na carteira e valide recompensas no caixa.",
    primaryCta: "Criar cartão",
    secondaryCta: "Abrir app",
    footnote: "Sem catálogo, rebuild de checkout, backend de pontos ou cartões de papel.",
    stats: [
      { value: "QR first", label: "Feito para balcão e visitas reais" },
      { value: "5 min", label: "QR ao vivo expira rápido" },
      { value: "1 ticket", label: "Validação única de recompensa" }
    ]
  },
  visual: {
    program: "Fluxo ao vivo da loja",
    printedQr: "QR impresso de visita",
    liveQr: "QR ao vivo de visita",
    rewardTicket: "Ticket de recompensa",
    validate: "Dono valida recompensa",
    stamps: "7 de 10 visitas carimbadas",
    ready: "Ativo",
    ownerOnly: "só dono",
    expires: "4:58",
    ticketCode: "R-0042"
  },
  problem: {
    eyebrow: "Por que existe",
    title: "Pequenas lojas precisam de fidelidade que caiba no balcão.",
    description:
      "A maioria das ferramentas digitais pede mudanças demais antes de testar uma ideia simples: recompensar visitas recorrentes.",
    points: [
      "Cartões de papel são fáceis de começar, mas fáceis de perder, esquecer ou fraudar.",
      "Sistemas completos de POS e catálogo são pesados demais para um piloto rápido.",
      "Bancos privados de pontos escondem a relação com o cliente dentro de outra plataforma."
    ]
  },
  workflow: {
    eyebrow: "Como funciona",
    title: "Um lojista, um QR, um loop de visitas recorrentes.",
    description:
      "O produto foca exatamente no fluxo de balcão que uma loja consegue rodar hoje.",
    steps: [
      {
        title: "Crie um cartão",
        description: "Defina nome, logo, recompensa, quantidade de visitas e se o QR impresso fica ativo."
      },
      {
        title: "Imprima o QR",
        description: "Deixe o QR estático no caixa para clientes carimbarem uma vez a cada 20 horas."
      },
      {
        title: "Leia e colecione",
        description: "Clientes abrem o QR, conectam a carteira e coletam um selo no cartão."
      },
      {
        title: "Libere a recompensa",
        description: "Um cartão completo vira ticket de recompensa com QR e código de apoio."
      },
      {
        title: "Valide uma vez",
        description: "A carteira dona marca a recompensa como usada e bloqueia uma segunda validação."
      }
    ]
  },
  benefits: {
    eyebrow: "Benefícios para lojistas",
    title: "Fidelidade pilotável sem peso operacional.",
    description:
    "noodl3 fica propositalmente focado para o lojista testar fidelidade antes de investir em uma stack maior.",
    items: [
      {
        title: "Sem bagunça de cartão de papel",
        description: "Clientes guardam o progresso na carteira, não em um cartão que desaparece."
      },
      {
        title: "Sem refazer checkout",
        description: "O fluxo por QR funciona ao lado do caixa, sem carrinho, catálogo ou integração com POS."
      },
      {
        title: "Sem backend de pontos",
        description: "Progresso e uso de recompensa ficam onchain em vez de uma planilha privada."
      },
      {
        title: "Bilíngue por padrão",
        description: "O app suporta português e inglês no fluxo do lojista e do cliente."
      }
    ]
  },
  proof: {
    eyebrow: "Prova de produto",
    title: "Os estados importantes do piloto já fazem parte do fluxo.",
    description:
    "A landing page deve mostrar os mesmos conceitos que o lojista usa dentro do app.",
    items: [
      {
        title: "QR impresso",
        description: "Folha reutilizável de balcão para selos diários com intervalo de 20 horas por carteira."
      },
      {
        title: "QR ao vivo",
        description: "QR assinado pelo dono, com expiração curta, para check-ins ao vivo com um cliente."
      },
      {
        title: "Ticket de recompensa",
        description: "Cartão completo gera QR de ticket com código de apoio para validação no balcão."
      },
      {
        title: "Validação pelo dono",
        description: "Só o dono do programa consome a recompensa, e tickets usados mostram estado claro."
      }
    ]
  },
  pilot: {
    eyebrow: "Checklist do piloto",
    title: "O que a loja consegue fazer no primeiro dia.",
    description:
      "O escopo V1 é prático: criar o cartão, posicionar o QR, carimbar visitas e validar recompensas.",
    checklist: [
      "Criar um cartão de selos com a marca da loja.",
      "Imprimir ou baixar o QR estático de balcão.",
      "Usar QR ao vivo quando o dono quiser conduzir a visita.",
      "Permitir que clientes colecionem selos da própria carteira.",
      "Abrir tickets de recompensa com QR e código de apoio.",
      "Validar cada recompensa uma vez pela carteira dona."
    ]
  },
  faq: {
    eyebrow: "FAQ",
    title: "Perguntas de lojistas, sem enrolação.",
    items: [
      {
        question: "Clientes precisam de carteira?",
        answer: "Sim. noodl3 é wallet-native, então clientes coletam selos e guardam tickets de recompensa em uma carteira compatível."
      },
      {
        question: "Por que Celo e MiniPay?",
        answer: "Celo mantém a experiência mobile leve e deixa transações de selo e recompensa baratas para pilotos."
      },
      {
        question: "Qual a diferença entre QR impresso e QR ao vivo?",
        answer: "QR impresso é reutilizável para selos diários. QR ao vivo é gerado pelo dono, expira em minutos e serve para check-ins presenciais."
      },
      {
        question: "Uma recompensa pode ser usada duas vezes?",
        answer: "Não. O dono consome o ticket uma vez, e o app mostra o estado usado depois da validação."
      },
      {
        question: "Existe checkout ou catálogo?",
        answer: "Não no V1. noodl3 foca em fidelidade por visitas reais, não em menus, carrinhos, pagamentos ou integrações com POS."
      },
      {
        question: "Equipe pode validar recompensas?",
        answer: "No V1, apenas o dono. Delegação pode vir depois que o piloto provar o fluxo de balcão."
      }
    ]
  },
  finalCta: {
    eyebrow: "Pronto para piloto",
    title: "Lance o primeiro cartão e teste fidelidade no balcão.",
    description:
      "Comece com uma recompensa, um QR impresso e um fluxo que a equipe entende em minutos.",
    primaryCta: "Criar cartão",
    secondaryCta: "Abrir app"
  }
};
