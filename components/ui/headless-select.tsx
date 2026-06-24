"use client";

import clsx from "clsx";
import { useEffect, useId, useMemo, useRef, useState } from "react";

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
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const selectId = useId();
  const labelId = `${selectId}-label`;
  const valueId = `${selectId}-value`;
  const selectedDescriptionId = `${selectId}-description`;
  const listboxId = `${selectId}-listbox`;

  const selected = useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );
  const triggerTitle = selected?.description
    ? `${selected.label}: ${selected.description}`
    : selected?.label || placeholder;

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div className={clsx("space-y-2", className)} ref={rootRef}>
      {label ? (
        <span
          id={labelId}
          className="block break-words text-xs font-semibold uppercase tracking-[0.12em] text-muted"
        >
          {label}
        </span>
      ) : null}

      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          aria-labelledby={label ? `${labelId} ${valueId}` : valueId}
          aria-describedby={selected?.description ? selectedDescriptionId : undefined}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-expanded={open}
          title={triggerTitle}
          onClick={() => {
            if (disabled) return;
            setOpen((current) => !current);
          }}
          disabled={disabled}
          className={clsx(
            "flex min-h-12 w-full items-center justify-between rounded-lg border border-line bg-panel px-4 py-3 text-left shadow-card transition hover:border-accent-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-focus",
            disabled && "cursor-default opacity-70 hover:border-line",
            triggerClassName
          )}
        >
          <div className="min-w-0">
            <p id={valueId} className="truncate text-sm font-medium text-ink">
              {selected?.label || placeholder || ""}
            </p>
            {selected?.description ? (
              <p id={selectedDescriptionId} className="mt-1 truncate text-xs text-muted">
                {selected.description}
              </p>
            ) : null}
          </div>
          <span
            aria-hidden="true"
            className={clsx(
              "ml-4 h-2.5 w-2.5 shrink-0 border-b border-r border-muted transition-transform",
              open ? "-translate-y-[1px] -rotate-[135deg]" : "translate-y-[-1px] rotate-45"
            )}
          />
        </button>

        {open ? (
          <div
            id={listboxId}
            aria-labelledby={label ? labelId : valueId}
            className={clsx(
              "absolute z-40 mt-2 max-h-72 w-full min-w-[15rem] overflow-y-auto rounded-lg border border-line bg-panel p-2 shadow-float",
              align === "right" ? "right-0" : "left-0"
            )}
            role="listbox"
          >
            {options.map((option, index) => {
              const active = option.value === value;
              const optionDescriptionId = `${selectId}-option-${index}-description`;
              const optionTitle = option.description
                ? `${option.label}: ${option.description}`
                : option.label;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  aria-describedby={option.description ? optionDescriptionId : undefined}
                  title={optionTitle}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                    triggerRef.current?.focus();
                  }}
                  className={clsx(
                    "flex w-full min-w-0 flex-col rounded-md px-3 py-3 text-left transition",
                    active
                      ? "bg-ink text-white"
                      : "text-ink-soft hover:bg-accent-soft"
                  )}
                >
                  <span className="break-words text-sm font-medium">{option.label}</span>
                  {option.description ? (
                    <span
                      id={optionDescriptionId}
                      className={clsx(
                        "mt-1 break-words text-xs",
                        active ? "text-white/72" : "text-muted"
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
