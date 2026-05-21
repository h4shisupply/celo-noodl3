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
          <nav
            className="hidden items-center gap-1 rounded-lg border border-[#E5E1EE] bg-white/78 p-1 shadow-[0_10px_30px_rgba(27,23,43,0.045)] md:flex"
            aria-label="Landing page"
          >
            <a className="rounded-md px-3 py-2 text-sm font-semibold text-[#676078] transition hover:bg-[#F3EFFF] hover:text-[#1B172B]" href="#workflow">{copy.nav.workflow}</a>
            <a className="rounded-md px-3 py-2 text-sm font-semibold text-[#676078] transition hover:bg-[#F3EFFF] hover:text-[#1B172B]" href="#proof">{copy.nav.proof}</a>
            <a className="rounded-md px-3 py-2 text-sm font-semibold text-[#676078] transition hover:bg-[#F3EFFF] hover:text-[#1B172B]" href="#launch">{copy.nav.launch}</a>
            <a className="rounded-md px-3 py-2 text-sm font-semibold text-[#676078] transition hover:bg-[#F3EFFF] hover:text-[#1B172B]" href="#faq">{copy.nav.faq}</a>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/app/program/new">
              <Button size="sm">{copy.hero.primaryCta}</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="grid min-h-[74dvh] items-center gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,31rem)] lg:py-12">
        <div className="max-w-3xl space-y-7">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#D9D0F4] bg-[#F3EFFF] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#7047DF]">
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
                className="min-h-[6rem] rounded-lg border border-[#E5E1EE] bg-white/84 px-4 py-3 shadow-[0_10px_30px_rgba(27,23,43,0.045)]"
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
                className="flex gap-3 rounded-lg border border-[#E5E1EE] bg-white/86 p-4 shadow-[0_10px_30px_rgba(27,23,43,0.04)]"
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
                className="rounded-lg border border-[#E5E1EE] bg-white/88 p-5 shadow-[0_14px_40px_rgba(27,23,43,0.06)]"
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
                  className="rounded-lg border border-[#E5E1EE] bg-white/88 p-5 shadow-[0_10px_30px_rgba(27,23,43,0.04)]"
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
                  className="rounded-lg border border-[#E5E1EE] bg-white/88 p-5 shadow-[0_10px_30px_rgba(27,23,43,0.04)]"
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
              className="rounded-lg border border-[#E5E1EE] bg-white/88 p-5 shadow-[0_10px_30px_rgba(27,23,43,0.04)]"
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
    <div className="surface-panel stamp-pattern rounded-lg p-2 shadow-float md:p-3">
      <div className="space-y-4 rounded-lg bg-white/94 p-4 md:p-5">
        <div className="flex items-center justify-between gap-3 rounded-lg border border-[#E5E1EE] bg-white px-4 py-3 shadow-[0_10px_30px_rgba(27,23,43,0.04)]">
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
          <div className="rounded-lg border border-[#E5E1EE] bg-[#FBFCFF] p-4 shadow-[0_10px_30px_rgba(27,23,43,0.04)]">
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
            <div className="rounded-lg border border-[#E5E1EE] bg-white p-4 shadow-[0_10px_30px_rgba(27,23,43,0.04)]">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#1B172B]">{copy.liveQr}</p>
                <span className="inline-flex items-center gap-1 rounded-full border border-[#F5DFC1] bg-[#FFF7E8] px-2.5 py-1 text-xs font-semibold text-[#8B5B00]">
                  <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                  {copy.expires}
                </span>
              </div>
              <StampProgress />
            </div>

            <div className="rounded-lg border border-[#E5E1EE] bg-white p-4 shadow-[0_10px_30px_rgba(27,23,43,0.04)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#1B172B]">{copy.rewardTicket}</p>
                  <p className="mt-1 font-mono text-xs font-semibold text-[#7047DF]">
                    {copy.ticketCode}
                  </p>
                </div>
                <TicketCheck className="h-5 w-5 text-[#0F9F8F]" aria-hidden="true" />
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#E9FBF7] px-3 py-3">
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
    eyebrow: "QR stamp cards for real visits",
    title: "Give regulars a stamp card they cannot lose.",
    description:
      "noodl3 turns a counter QR into a wallet stamp card. Customers scan during a visit, collect stamps in their wallet, and return with a reward ticket the shop owner validates once.",
    primaryCta: "Create stamp card",
    secondaryCta: "Open app",
    footnote: "Built for quick setup, daily counter routines, and clear one-time rewards.",
    stats: [
      { value: "Visit QR", label: "One counter scan for everyday stamps" },
      { value: "Live QR", label: "Five-minute owner-led check-ins" },
      { value: "Reward ticket", label: "Validated once by the shop owner wallet" }
    ]
  },
  visual: {
    program: "Shop stamp card",
    printedQr: "Counter visit QR",
    liveQr: "Live check-in QR",
    rewardTicket: "Reward ticket",
    validate: "Shop owner validates once",
    stamps: "7 of 10 visits stamped",
    ready: "Active",
    ownerOnly: "shop owner",
    expires: "4:58",
    ticketCode: "R-0042"
  },
  problem: {
    eyebrow: "Why shops use it",
    title: "The familiar stamp card, without the lost paper.",
    description:
      "Keep the ritual customers already know while the wallet stores progress and the shop owner handles validation.",
    points: [
      "Customers scan while they are already at the counter.",
      "Each visit adds visible progress toward the shop's promised reward.",
      "Reward tickets include a QR and backup code, so validation has a fallback."
    ]
  },
  workflow: {
    eyebrow: "How it works",
    title: "Print a visit QR, stamp real visits, validate rewards.",
    description:
      "The flow matches the counter routine a small shop can run without extra hardware.",
    steps: [
      {
        title: "Create the card",
        description: "Add the shop name, logo, reward promise, visit goal, and counter QR status."
      },
      {
        title: "Print the visit QR",
        description: "Place a reusable QR at the counter so each wallet can collect one stamp every 20 hours."
      },
      {
        title: "Scan and stamp",
        description: "Customers open the visit QR, connect a wallet, and add the stamp to their card."
      },
      {
        title: "Unlock the reward",
        description: "A full card becomes a reward ticket with its own QR and backup code."
      },
      {
        title: "Validate once",
        description: "The shop owner wallet marks the ticket used after the reward is handed over."
      }
    ]
  },
  benefits: {
    eyebrow: "Shop benefits",
    title: "Small-shop loyalty with less admin and clearer rewards.",
    description:
      "noodl3 focuses on the jobs repeated at the counter: collect a visit, show progress, and validate a reward.",
    items: [
      {
        title: "Fast card setup",
        description: "Create a branded stamp card with a shop name, logo, reward, and visit goal."
      },
      {
        title: "Counter-ready visit QR",
        description: "Print the visit QR for self-service stamps or generate a live QR for owner-led check-ins."
      },
      {
        title: "Wallet-held progress",
        description: "Customers keep stamp progress and reward tickets in the wallet they already use."
      },
      {
        title: "Bilingual from the first scan",
        description: "Portuguese and English copy cover the shop owner and customer flow."
      }
    ]
  },
  proof: {
    eyebrow: "Built-in counter moments",
    title: "The important shop states are already covered.",
    description:
      "Each state supports the face-to-face actions between a customer and the shop owner.",
    items: [
      {
        title: "Printed QR",
        description: "A reusable counter sheet for daily visit stamps, with a 20-hour wallet cooldown."
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
        title: "Shop owner validation",
        description: "The shop owner wallet validates the ticket, and used tickets show a clear used state."
      }
    ]
  },
  launch: {
    eyebrow: "Counter launch",
    title: "A shop can launch the stamp loop in one sitting.",
    description:
      "Create the card, place the visit QR, collect real stamps, and validate rewards from the shop owner wallet.",
    checklist: [
      "Create a branded stamp card from the shop owner wallet.",
      "Print or download the reusable visit QR.",
      "Use live QR for owner-led check-ins when needed.",
      "Let customers collect stamps at the counter.",
      "Open reward tickets with QR and backup code.",
      "Validate each reward once from the shop owner wallet."
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
        answer: "Celo keeps wallet actions light, and MiniPay makes the scan-and-stamp flow easy on mobile."
      },
      {
        question: "What is the difference between printed and live QR?",
        answer: "Printed QR is reusable for daily self-stamps. Live QR is owner-generated, expires in minutes, and is best for guided check-ins."
      },
      {
        question: "How is a reward protected?",
        answer: "Each reward ticket is validated once by the shop owner wallet. After that, the app shows it as used."
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
      "Start with one reward, one visit QR, and a loop built around the next visit.",
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
    eyebrow: "Cartões de selos por QR",
    title: "Dê aos clientes recorrentes um cartão que eles não perdem.",
    description:
      "noodl3 transforma um QR de balcão em um cartão de selos na carteira. O cliente lê durante a visita, coleciona selos e volta com um ticket de recompensa que o lojista valida uma vez.",
    primaryCta: "Criar cartão de selos",
    secondaryCta: "Abrir app",
    footnote: "Feito para configurar rápido, caber na rotina do balcão e evitar recompensa usada duas vezes.",
    stats: [
      { value: "QR de visita", label: "Um scan no balcão para selos do dia a dia" },
      { value: "QR ao vivo", label: "Check-ins guiados por cinco minutos" },
      { value: "Ticket", label: "Validado uma vez pela carteira do lojista" }
    ]
  },
  visual: {
    program: "Cartão de selos da loja",
    printedQr: "QR de visita no balcão",
    liveQr: "QR ao vivo de check-in",
    rewardTicket: "Ticket de recompensa",
    validate: "Lojista valida uma vez",
    stamps: "7 de 10 visitas carimbadas",
    ready: "Ativo",
    ownerOnly: "lojista",
    expires: "4:58",
    ticketCode: "R-0042"
  },
  problem: {
    eyebrow: "Por que lojas usam",
    title: "O cartão de selos familiar, sem o papel perdido.",
    description:
      "O ritual continua familiar para clientes, enquanto a carteira guarda o progresso e o lojista faz a validação.",
    points: [
      "Clientes leem o QR enquanto já estão no balcão.",
      "Cada visita mostra progresso até a recompensa prometida pela loja.",
      "Tickets de recompensa têm QR e código de apoio para a validação não travar."
    ]
  },
  workflow: {
    eyebrow: "Como funciona",
    title: "Imprima um QR de visita, carimbe visitas reais e valide recompensas.",
    description:
      "O fluxo acompanha a rotina de balcão que uma pequena loja consegue rodar sem hardware extra.",
    steps: [
      {
        title: "Crie o cartão",
        description: "Adicione nome da loja, logo, promessa da recompensa, meta de visitas e status do QR de balcão."
      },
      {
        title: "Imprima o QR de visita",
        description: "Deixe um QR reutilizável no balcão para cada carteira coletar um selo a cada 20 horas."
      },
      {
        title: "Leia e carimbe",
        description: "Clientes abrem o QR de visita, conectam a carteira e adicionam o selo ao cartão."
      },
      {
        title: "Libere a recompensa",
        description: "Um cartão completo vira ticket de recompensa com QR próprio e código de apoio."
      },
      {
        title: "Valide uma vez",
        description: "A carteira do lojista marca o ticket como usado depois que a recompensa é entregue."
      }
    ]
  },
  benefits: {
    eyebrow: "Benefícios para a loja",
    title: "Fidelidade de loja pequena, com menos trabalho e recompensa clara.",
    description:
      "noodl3 foca no que se repete no balcão: registrar visita, mostrar progresso e validar recompensa.",
    items: [
      {
        title: "Cartão pronto rápido",
        description: "Crie um cartão com nome da loja, logo, recompensa e meta de visitas."
      },
      {
        title: "QR de visita pronto para o balcão",
        description: "Imprima o QR de visita para autoatendimento ou gere um QR ao vivo para check-ins guiados."
      },
      {
        title: "Progresso na carteira",
        description: "Clientes guardam selos e tickets de recompensa na carteira que já usam."
      },
      {
        title: "Bilíngue desde o primeiro scan",
        description: "Português e inglês cobrem o fluxo do lojista e do cliente."
      }
    ]
  },
  proof: {
    eyebrow: "Momentos do balcão",
    title: "Os estados importantes da loja já estão cobertos.",
    description:
      "Cada estado apoia as ações presenciais entre cliente e lojista.",
    items: [
      {
        title: "QR impresso",
        description: "Folha reutilizável de balcão para selos de visita, com intervalo de 20 horas por carteira."
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
        description: "A carteira do lojista valida o ticket, e tickets usados mostram um estado claro."
      }
    ]
  },
  launch: {
    eyebrow: "Lançamento no balcão",
    title: "A loja consegue lançar o loop de selos de uma vez.",
    description:
      "Crie o cartão, posicione o QR de visita, carimbe visitas reais e valide recompensas pela carteira do lojista.",
    checklist: [
      "Criar um cartão de selos pela carteira do lojista.",
      "Imprimir ou baixar o QR de visita reutilizável.",
      "Usar QR ao vivo quando o lojista quiser guiar o check-in.",
      "Permitir que clientes carimbem visitas no balcão.",
      "Abrir tickets de recompensa com QR e código de apoio.",
      "Validar cada recompensa uma vez pela carteira do lojista."
    ]
  },
  faq: {
    eyebrow: "FAQ",
    title: "Perguntas de lojas, direto ao ponto.",
    items: [
      {
        question: "Clientes precisam de carteira?",
        answer: "Sim. noodl3 é wallet-native, então clientes coletam selos e guardam tickets de recompensa em uma carteira compatível."
      },
      {
        question: "Por que Celo e MiniPay?",
        answer: "Celo mantém as ações de carteira leves, e MiniPay deixa o fluxo de ler e carimbar simples no celular."
      },
      {
        question: "Qual a diferença entre QR impresso e QR ao vivo?",
        answer: "QR impresso é reutilizável para selos diários. QR ao vivo é gerado pelo lojista, expira em minutos e funciona melhor para check-ins guiados."
      },
      {
        question: "Como a recompensa fica protegida?",
        answer: "Cada ticket de recompensa é validado uma vez pela carteira do lojista. Depois disso, o app mostra que ele já foi usado."
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
      "Comece com uma recompensa, um QR de visita e um loop feito para a próxima visita.",
    primaryCta: "Criar cartão de selos",
    secondaryCta: "Abrir app"
  }
};
