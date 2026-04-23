"use client";

import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";

export type HeadlessSelectOption = {
  value: string;
  label: string;
  description?: string;
};

export function HeadlessSelect({
  label,
  value,
  options,
  onChange,
  placeholder,
  className,
  triggerClassName,
  align = "left",
  disabled = false
}: {
  label?: string;
  value: string;
  options: HeadlessSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  align?: "left" | "right";
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selected = useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className={clsx("space-y-2", className)} ref={rootRef}>
      {label ? (
        <span className="block text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
          {label}
        </span>
      ) : null}

      <div className="relative">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => {
            if (disabled) return;
            setOpen((current) => !current);
          }}
          disabled={disabled}
          className={clsx(
            "flex min-h-12 w-full items-center justify-between rounded-[22px] border border-[#E7E1F1] bg-white px-4 py-3 text-left shadow-[0_10px_30px_rgba(23,18,42,0.06)] transition hover:border-[#D7CFF0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FE4]/15",
            disabled && "cursor-default opacity-70 hover:border-[#E7E1F1]",
            triggerClassName
          )}
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[#18122A]">
              {selected?.label || placeholder || ""}
            </p>
            {selected?.description ? (
              <p className="mt-1 truncate text-xs text-[#7A748E]">
                {selected.description}
              </p>
            ) : null}
          </div>
          <span
            aria-hidden="true"
            className={clsx(
              "ml-4 h-2.5 w-2.5 shrink-0 rotate-45 border-b border-r border-[#6C6582] transition-transform",
              open ? "-translate-y-[1px] -rotate-135" : "translate-y-[-1px]"
            )}
          />
        </button>

        {open ? (
          <div
            className={clsx(
              "absolute z-40 mt-2 w-full min-w-[15rem] rounded-[24px] border border-[#E7E1F1] bg-white p-2 shadow-[0_24px_80px_rgba(23,18,42,0.12)]",
              align === "right" ? "right-0" : "left-0"
            )}
            role="listbox"
          >
            {options.map((option) => {
              const active = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={clsx(
                    "flex w-full flex-col rounded-xl px-3 py-3 text-left transition",
                    active
                      ? "bg-[#17122A] text-white"
                      : "text-[#241B3C] hover:bg-[#F7F5FF]"
                  )}
                >
                  <span className="text-sm font-medium">{option.label}</span>
                  {option.description ? (
                    <span
                      className={clsx(
                        "mt-1 text-xs",
                        active ? "text-white/72" : "text-[#7A748E]"
                      )}
                    >
                      {option.description}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
