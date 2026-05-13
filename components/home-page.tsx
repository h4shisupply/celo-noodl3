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
    launch: string;
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
  launch: {
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
            <a className="text-sm font-medium text-[#676078] transition hover:text-[#1B172B]" href="#launch">{copy.nav.launch}</a>
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

      <section id="launch" className="py-12 md:py-16">
        <div className="rounded-lg border border-[#E5E1EE] bg-white/88 p-5 shadow-[0_18px_52px_rgba(27,23,43,0.08)] md:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <SectionIntro
              eyebrow={copy.launch.eyebrow}
              title={copy.launch.title}
              description={copy.launch.description}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {copy.launch.checklist.map((item) => (
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
    workflow: "Flow",
    proof: "Product",
    launch: "Launch",
    faq: "FAQ"
  },
  hero: {
    eyebrow: "Tiny card, real visits",
    title: "Stamp cards that live in your customers' wallets.",
    description:
      "noodl3 turns a counter QR into a cheerful loyalty loop: regulars scan, collect wallet stamps, and bring back reward tickets the owner can validate once.",
    primaryCta: "Create stamp card",
    secondaryCta: "Open app",
    footnote: "Built for quick setup, everyday visits, and no repeat reward surprises.",
    stats: [
      { value: "Counter QR", label: "One scan for everyday visits" },
      { value: "5 min", label: "Live QR for owner-led check-ins" },
      { value: "1 ticket", label: "One-time reward validation" }
    ]
  },
  visual: {
    program: "Shop stamp flow",
    printedQr: "Counter visit QR",
    liveQr: "Live check-in QR",
    rewardTicket: "Reward ticket",
    validate: "Owner validates once",
    stamps: "7 of 10 visits stamped",
    ready: "Active",
    ownerOnly: "owner wallet",
    expires: "4:58",
    ticketCode: "R-0042"
  },
  problem: {
    eyebrow: "Why shops use it",
    title: "The classic stamp card, without the lost-card problem.",
    description:
      "Keep the ritual customers already understand, but move the record into the wallet and the validation into the owner flow.",
    points: [
      "Customers scan while they are already at the counter.",
      "Each visit adds visible progress toward the shop's promised treat.",
      "Reward tickets include a QR and backup code, so the counter has a fallback."
    ]
  },
  workflow: {
    eyebrow: "How it works",
    title: "Print a QR, stamp visits, hand out tiny wins.",
    description:
      "The product stays close to the real counter routine a small shop can run today.",
    steps: [
      {
        title: "Create the card",
        description: "Add the shop name, logo, reward, visit goal, and whether the printed QR is active."
      },
      {
        title: "Print the counter QR",
        description: "Place one reusable QR by the register so each wallet can self-stamp once every 20 hours."
      },
      {
        title: "Scan and stamp",
        description: "Customers open the QR, connect a wallet, and add the visit to their card."
      },
      {
        title: "Unlock the treat",
        description: "A full card becomes a reward ticket with its own QR and backup code."
      },
      {
        title: "Validate once",
        description: "The owner wallet marks the ticket as used, closing the loop after one validation."
      }
    ]
  },
  benefits: {
    eyebrow: "Shop benefits",
    title: "Small-shop loyalty with less admin and more delight.",
    description:
      "noodl3 focuses on the moves a shop repeats every day: stamp a visit, show progress, and validate a reward clearly.",
    items: [
      {
        title: "Quick card setup",
        description: "Create a branded stamp card with a shop name, logo, reward, and visit goal."
      },
      {
        title: "Counter-ready QR",
        description: "Print the visit QR for self-stamps or generate a live QR when the owner wants to lead the check-in."
      },
      {
        title: "Wallet-held progress",
        description: "Customers carry their stamp progress and reward tickets in the wallet they already use."
      },
      {
        title: "Bilingual by default",
        description: "Portuguese and English copy cover the owner and customer flow from the first scan."
      }
    ]
  },
  proof: {
    eyebrow: "Built-in moments",
    title: "The important counter states are already covered.",
    description:
      "Every core state is designed around the owner and customer actions that happen face to face.",
    items: [
      {
        title: "Printed QR",
        description: "A reusable counter sheet for daily self-stamps, with a 20-hour wallet cooldown."
      },
      {
        title: "Live QR",
        description: "An owner-signed QR that expires quickly and works for one customer check-in."
      },
      {
        title: "Reward ticket",
        description: "A completed card creates a ticket QR plus a backup code for counter validation."
      },
      {
        title: "Owner validation",
        description: "The owner wallet validates the ticket, and used tickets show a clear used state."
      }
    ]
  },
  launch: {
    eyebrow: "Counter launch",
    title: "A shop can launch the loop in one sitting.",
    description:
      "Create the card, place the QR, stamp real visits, and validate rewards from the owner wallet.",
    checklist: [
      "Create a branded stamp card from the owner wallet.",
      "Print or download the reusable counter QR.",
      "Use live QR for owner-led check-ins when needed.",
      "Let customers collect wallet stamps at the counter.",
      "Open reward tickets with QR and backup code.",
      "Validate each reward once from the owner wallet."
    ]
  },
  faq: {
    eyebrow: "FAQ",
    title: "Shop questions, answered plainly.",
    items: [
      {
        question: "Do customers need a wallet?",
        answer: "Yes. noodl3 is wallet-native, so customers collect stamps and hold reward tickets in a compatible wallet."
      },
      {
        question: "Why Celo and MiniPay?",
        answer: "Celo keeps the mobile wallet experience light, and MiniPay makes the scan-and-stamp flow easy to use on the go."
      },
      {
        question: "What is the difference between printed and live QR?",
        answer: "Printed QR is reusable for daily self-stamps. Live QR is owner-generated, expires in minutes, and is best for guided check-ins."
      },
      {
        question: "How is a reward protected?",
        answer: "Each reward ticket is validated once by the owner wallet. After that, the app shows it as used."
      },
      {
        question: "What should the shop place at the counter?",
        answer: "Print the visit QR sheet and place it where customers can scan, connect their wallet, and collect a stamp."
      },
      {
        question: "When should a live QR be used?",
        answer: "Use live QR when the owner wants a short-lived code for the next customer instead of leaving the printed QR out."
      }
    ]
  },
  finalCta: {
    eyebrow: "Ready at the counter",
    title: "Launch a stamp card regulars can use today.",
    description:
      "Start with one reward, one printed QR, and a loop built around the next visit.",
    primaryCta: "Create stamp card",
    secondaryCta: "Open app"
  }
};

const ptHomeCopy: HomeCopy = {
  nav: {
    workflow: "Fluxo",
    proof: "Produto",
    launch: "Lançar",
    faq: "FAQ"
  },
  hero: {
    eyebrow: "Cartão pequeno, visita real",
    title: "Cartões de selos que moram na carteira dos clientes.",
    description:
      "noodl3 transforma um QR de balcão em um loop leve de fidelidade: clientes leem, acumulam selos na carteira e voltam com tickets que o lojista valida uma vez.",
    primaryCta: "Criar cartão de selos",
    secondaryCta: "Abrir app",
    footnote: "Feito para configurar rápido, registrar visitas reais e evitar recompensa usada duas vezes.",
    stats: [
      { value: "QR no balcão", label: "Um scan para visitas do dia a dia" },
      { value: "5 min", label: "QR ao vivo para check-ins guiados" },
      { value: "1 ticket", label: "Validação única de recompensa" }
    ]
  },
  visual: {
    program: "Fluxo de selos da loja",
    printedQr: "QR de visita no balcão",
    liveQr: "QR ao vivo de check-in",
    rewardTicket: "Ticket de recompensa",
    validate: "Lojista valida uma vez",
    stamps: "7 de 10 visitas carimbadas",
    ready: "Ativo",
    ownerOnly: "carteira dona",
    expires: "4:58",
    ticketCode: "R-0042"
  },
  problem: {
    eyebrow: "Por que lojas usam",
    title: "O cartão de selos clássico, sem o problema de perder o papel.",
    description:
      "O ritual continua familiar para clientes, mas o registro fica na carteira e a validação fica no fluxo do lojista.",
    points: [
      "Clientes leem o QR enquanto já estão no balcão.",
      "Cada visita mostra progresso até o mimo prometido pela loja.",
      "Tickets de recompensa têm QR e código de apoio para o balcão não travar."
    ]
  },
  workflow: {
    eyebrow: "Como funciona",
    title: "Imprima um QR, carimbe visitas, entregue pequenas vitórias.",
    description:
      "O produto fica perto da rotina real de balcão que uma pequena loja consegue rodar hoje.",
    steps: [
      {
        title: "Crie o cartão",
        description: "Adicione nome da loja, logo, recompensa, meta de visitas e se o QR impresso fica ativo."
      },
      {
        title: "Imprima o QR do balcão",
        description: "Deixe um QR reutilizável no caixa para cada carteira se carimbar uma vez a cada 20 horas."
      },
      {
        title: "Leia e carimbe",
        description: "Clientes abrem o QR, conectam a carteira e adicionam a visita ao cartão."
      },
      {
        title: "Libere o mimo",
        description: "Um cartão completo vira ticket de recompensa com QR próprio e código de apoio."
      },
      {
        title: "Valide uma vez",
        description: "A carteira dona marca o ticket como usado e fecha o loop depois de uma validação."
      }
    ]
  },
  benefits: {
    eyebrow: "Benefícios para a loja",
    title: "Fidelidade de loja pequena, com menos trabalho e mais encanto.",
    description:
      "noodl3 foca nos movimentos que a loja repete todos os dias: carimbar visita, mostrar progresso e validar recompensa com clareza.",
    items: [
      {
        title: "Cartão pronto rápido",
        description: "Crie um cartão com nome da loja, logo, recompensa e meta de visitas."
      },
      {
        title: "QR pronto para o balcão",
        description: "Imprima o QR de visita para autoatendimento ou gere um QR ao vivo quando o lojista quiser guiar o check-in."
      },
      {
        title: "Progresso na carteira",
        description: "Clientes carregam os selos e tickets de recompensa na carteira que já usam."
      },
      {
        title: "Bilíngue por padrão",
        description: "Português e inglês cobrem o fluxo do lojista e do cliente desde o primeiro scan."
      }
    ]
  },
  proof: {
    eyebrow: "Momentos do produto",
    title: "Os estados importantes do balcão já estão cobertos.",
    description:
      "Cada estado principal foi desenhado em torno das ações presenciais do lojista e do cliente.",
    items: [
      {
        title: "QR impresso",
        description: "Folha reutilizável de balcão para selos diários, com intervalo de 20 horas por carteira."
      },
      {
        title: "QR ao vivo",
        description: "QR assinado pelo lojista, com expiração curta, para check-in de um cliente."
      },
      {
        title: "Ticket de recompensa",
        description: "Cartão completo cria um QR de ticket e um código de apoio para validação no balcão."
      },
      {
        title: "Validação pelo lojista",
        description: "A carteira dona valida o ticket, e tickets usados mostram um estado claro."
      }
    ]
  },
  launch: {
    eyebrow: "Lançamento no balcão",
    title: "A loja consegue lançar o loop de uma vez.",
    description:
      "Crie o cartão, posicione o QR, carimbe visitas reais e valide recompensas pela carteira dona.",
    checklist: [
      "Criar um cartão de selos pela carteira dona.",
      "Imprimir ou baixar o QR reutilizável de balcão.",
      "Usar QR ao vivo quando o lojista quiser guiar o check-in.",
      "Permitir que clientes carimbem visitas no balcão.",
      "Abrir tickets de recompensa com QR e código de apoio.",
      "Validar cada recompensa uma vez pela carteira dona."
    ]
  },
  faq: {
    eyebrow: "FAQ",
    title: "Perguntas de lojas, sem enrolação.",
    items: [
      {
        question: "Clientes precisam de carteira?",
        answer: "Sim. noodl3 é wallet-native, então clientes coletam selos e guardam tickets de recompensa em uma carteira compatível."
      },
      {
        question: "Por que Celo e MiniPay?",
        answer: "Celo mantém a experiência mobile leve, e MiniPay deixa o fluxo de ler e carimbar fácil de usar em movimento."
      },
      {
        question: "Qual a diferença entre QR impresso e QR ao vivo?",
        answer: "QR impresso é reutilizável para selos diários. QR ao vivo é gerado pelo lojista, expira em minutos e funciona melhor para check-ins guiados."
      },
      {
        question: "Como a recompensa fica protegida?",
        answer: "Cada ticket de recompensa é validado uma vez pela carteira dona. Depois disso, o app mostra que ele já foi usado."
      },
      {
        question: "O que o lojista coloca no balcão?",
        answer: "Imprima a folha do QR de visita e deixe onde clientes possam ler, conectar a carteira e coletar um selo."
      },
      {
        question: "Quando usar o QR ao vivo?",
        answer: "Use o QR ao vivo quando o lojista quiser um código curto para o próximo cliente em vez de deixar o QR impresso disponível."
      }
    ]
  },
  finalCta: {
    eyebrow: "Pronto para o balcão",
    title: "Lance um cartão que clientes recorrentes podem usar hoje.",
    description:
      "Comece com uma recompensa, um QR impresso e um loop feito para a próxima visita.",
    primaryCta: "Criar cartão de selos",
    secondaryCta: "Abrir app"
  }
};
