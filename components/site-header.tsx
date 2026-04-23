"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandMark } from "./brand-mark";
import { LanguageSwitcher } from "./language-switcher";
import { useLocale } from "./locale-provider";
import { Button } from "./ui/button";

type NavItem = {
  href: string;
  label: string;
};

type SiteHeaderProps = {
  brandHref: string;
  items: NavItem[];
  cta?: {
    href: string;
    label: string;
  };
};

function NavLink({
  href,
  label,
  onClick
}: NavItem & { onClick?: () => void }) {
  const isAnchor = href.startsWith("#");

  if (isAnchor) {
    return (
      <a
        href={href}
        onClick={onClick}
        className="text-sm text-[#625B78] transition hover:text-[#17122A]"
      >
        {label}
      </a>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className="text-sm text-[#625B78] transition hover:text-[#17122A]"
    >
      {label}
    </Link>
  );
}

export function SiteHeader({ brandHref, items, cta }: SiteHeaderProps) {
  const { locale } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuLabel = menuOpen ? (locale === "pt-BR" ? "Fechar" : "Close") : "Menu";

  return (
    <header className="py-4 md:py-5">
      <div className="flex items-center justify-between gap-6">
        <BrandMark href={brandHref} />

        <div className="hidden items-center gap-6 md:flex">
          <nav className="flex items-center gap-5">
            {items.map((item) => (
              <NavLink key={`${item.href}-${item.label}`} {...item} />
            ))}
          </nav>
          <LanguageSwitcher />
          {cta ? (
            <Link href={cta.href}>
              <Button>{cta.label}</Button>
            </Link>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          className="inline-flex h-11 items-center rounded-full border border-[#E4DEF1] px-4 text-sm font-medium text-[#241B3C] md:hidden"
        >
          {menuLabel}
        </button>
      </div>

      {menuOpen ? (
        <div className="mt-5 space-y-4 rounded-[28px] border border-[#ECE6F5] bg-white px-5 py-5 shadow-[0_20px_50px_rgba(23,18,42,0.06)] md:hidden">
          <nav className="grid gap-3">
            {items.map((item) => (
              <NavLink
                key={`${item.href}-${item.label}`}
                {...item}
                onClick={() => setMenuOpen(false)}
              />
            ))}
          </nav>
          <div className="flex flex-wrap items-center gap-3">
            <LanguageSwitcher />
            {cta ? (
              <Link href={cta.href} onClick={() => setMenuOpen(false)}>
                <Button>{cta.label}</Button>
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
