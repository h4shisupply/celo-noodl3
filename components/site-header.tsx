"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
    label: string;
    href?: string;
    onClick?: () => void;
    isLoading?: boolean;
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
        className="min-w-0 break-words rounded-md px-3 py-2 text-sm font-semibold text-muted transition hover:bg-accent-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-focus"
      >
        {label}
      </a>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className="min-w-0 break-words rounded-md px-3 py-2 text-sm font-semibold text-muted transition hover:bg-accent-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-focus"
    >
      {label}
    </Link>
  );
}

export function SiteHeader({ brandHref, items, cta }: SiteHeaderProps) {
  const { dictionary } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const menuLabel = menuOpen
    ? `${dictionary.common.close}: ${dictionary.common.landingPage}`
    : dictionary.common.menu;
  const menuText = menuOpen ? dictionary.common.close : dictionary.common.menu;

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const renderCta = (onClick?: () => void) => {
    if (!cta) {
      return null;
    }

    if (cta.onClick) {
      return (
        <Button
          size="sm"
          onClick={() => {
            onClick?.();
            cta.onClick?.();
          }}
          aria-busy={cta.isLoading}
          disabled={cta.isLoading}
        >
          {cta.label}
        </Button>
      );
    }

    if (!cta.href) {
      return null;
    }

    return (
      <Link
        href={cta.href}
        onClick={onClick}
        className="inline-flex min-h-9 max-w-full shrink-0 select-none items-center justify-center gap-2 rounded-lg border border-transparent bg-ink px-3.5 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(27,23,43,0.18)] transition duration-200 hover:bg-ink-hover hover:shadow-[0_16px_34px_rgba(27,23,43,0.22)] active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-focus"
      >
        <span className="min-w-0 whitespace-normal text-center leading-tight">
          {cta.label}
        </span>
      </Link>
    );
  };

  return (
    <header className="py-4 md:py-5" ref={headerRef} aria-label={dictionary.common.landingPage}>
      <div className="flex items-center justify-between gap-6">
        <BrandMark href={brandHref} />

        <div className="hidden items-center gap-3 md:flex">
          <nav
            className="flex items-center gap-1 rounded-lg border border-line bg-panel/80 p-1 shadow-[0_10px_30px_rgba(27,23,43,0.045)] backdrop-blur"
            aria-label={dictionary.common.landingPage}
          >
            {items.map((item) => (
              <NavLink key={`${item.href}-${item.label}`} {...item} />
            ))}
          </nav>
          <LanguageSwitcher />
          {renderCta()}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          className="inline-flex h-11 items-center gap-2 rounded-lg border border-line bg-panel px-4 text-sm font-semibold text-ink-soft shadow-card transition hover:border-accent-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-focus md:hidden"
          aria-controls="site-mobile-menu"
          aria-expanded={menuOpen}
          aria-label={menuLabel}
        >
          {menuOpen ? (
            <X className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Menu className="h-4 w-4" aria-hidden="true" />
          )}
          {menuText}
        </button>
      </div>

      {menuOpen ? (
        <div
          id="site-mobile-menu"
          className="mt-5 space-y-4 rounded-lg border border-line bg-panel px-5 py-5 shadow-card md:hidden"
        >
          <nav className="grid gap-3" aria-label={dictionary.common.landingPage}>
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
            {renderCta(() => setMenuOpen(false))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
