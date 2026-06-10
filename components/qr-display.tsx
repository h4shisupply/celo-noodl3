"use client";

import { Copy, Download, ExternalLink, Printer, Share2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useRef, useState, type ReactNode, type RefObject } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { StatusMessage } from "./ui/status-message";

type QrActionLabels = {
  copy: string;
  copied: string;
  share: string;
  download: string;
  print: string;
  open: string;
  shareUnavailable: string;
};

function makeSafeFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "noodl3-qr";
}

function downloadSvg(svg: SVGSVGElement, fileName: string) {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const markup = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${makeSafeFileName(fileName)}.svg`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function QrActionBar({
  value,
  fileName,
  labels,
  qrRef,
  showPrint = false
}: {
  value: string;
  fileName: string;
  labels: QrActionLabels;
  qrRef: RefObject<SVGSVGElement | null>;
  showPrint?: boolean;
}) {
  const [notice, setNotice] = useState<string | null>(null);

  async function handleCopy() {
    setNotice(null);

    try {
      await navigator.clipboard.writeText(value);
      setNotice(labels.copied);
    } catch {
      setNotice(value);
    }
  }

  async function handleShare() {
    setNotice(null);

    if (!navigator.share) {
      setNotice(labels.shareUnavailable);
      return;
    }

    try {
      await navigator.share({ url: value });
    } catch {
      // Share cancellation does not need an in-app error.
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <Button
          size="sm"
          variant="outline"
          icon={<Copy className="h-4 w-4" />}
          className="w-full sm:w-auto"
          aria-label={`${labels.copy}: ${fileName}`}
          onClick={() => void handleCopy()}
        >
          {labels.copy}
        </Button>
        <Button
          size="sm"
          variant="outline"
          icon={<Share2 className="h-4 w-4" />}
          className="w-full sm:w-auto"
          aria-label={`${labels.share}: ${fileName}`}
          onClick={() => void handleShare()}
        >
          {labels.share}
        </Button>
        <Button
          size="sm"
          variant="outline"
          icon={<Download className="h-4 w-4" />}
          className="w-full sm:w-auto"
          aria-label={`${labels.download}: ${fileName}`}
          onClick={() => {
            setNotice(null);

            if (qrRef.current) {
              downloadSvg(qrRef.current, fileName);
            }
          }}
        >
          {labels.download}
        </Button>
        {showPrint ? (
          <Button
            size="sm"
            variant="warm"
            icon={<Printer className="h-4 w-4" />}
            className="w-full sm:w-auto"
            aria-label={`${labels.print}: ${fileName}`}
            onClick={() => {
              setNotice(null);
              window.print();
            }}
          >
            {labels.print}
          </Button>
        ) : null}
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          referrerPolicy="no-referrer"
          aria-label={`${labels.open}: ${fileName}`}
          onClick={() => setNotice(null)}
          className="inline-flex min-h-9 w-full max-w-full shrink-0 select-none items-center justify-center gap-2 rounded-lg border border-transparent bg-transparent px-3.5 py-2 text-sm font-semibold text-muted transition duration-200 hover:bg-accent-soft hover:text-ink active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-focus sm:w-auto"
        >
          <span className="grid h-4 w-4 shrink-0 place-items-center" aria-hidden="true">
            <ExternalLink className="h-4 w-4" />
          </span>
          <span className="min-w-0 whitespace-normal text-center leading-tight">
            {labels.open}
          </span>
        </a>
      </div>
      {notice ? (
        <StatusMessage tone={notice === labels.copied ? "success" : "info"}>
          {notice === labels.copied ? (
            notice
          ) : (
            <span dir="ltr" className="break-all">{notice}</span>
          )}
        </StatusMessage>
      ) : null}
    </div>
  );
}

export function QrDisplay({
  value,
  title,
  description,
  code,
  fileName,
  labels,
  showPrint = false,
  children
}: {
  value: string;
  title: string;
  description?: string;
  code?: string;
  fileName: string;
  labels: QrActionLabels;
  showPrint?: boolean;
  children?: ReactNode;
}) {
  const qrRef = useRef<SVGSVGElement | null>(null);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="stamp-pattern border-b border-line bg-panel-soft">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            {code ? (
              <p dir="ltr" className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
                {code}
              </p>
            ) : null}
            <CardTitle>{title}</CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
          {children}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        <div className="mx-auto flex w-full max-w-[18rem] justify-center rounded-lg border border-line bg-panel p-4 shadow-card">
          <QRCodeSVG
            ref={qrRef}
            value={value}
            aria-label={title}
            role="img"
            title={title}
            size={256}
            marginSize={4}
            level="M"
            bgColor="#FFFFFF"
            fgColor="#1B172B"
            className="h-auto w-full"
          />
        </div>
        <p dir="ltr" className="break-all rounded-lg border border-line bg-panel-soft p-3 text-sm leading-6 text-muted">
          {value}
        </p>
        <QrActionBar
          value={value}
          fileName={fileName}
          labels={labels}
          qrRef={qrRef}
          showPrint={showPrint}
        />
      </CardContent>
    </Card>
  );
}

export function PrintableQrSheet({
  title,
  subtitle,
  programName,
  reward,
  rule,
  code,
  value
}: {
  title: string;
  subtitle: string;
  programName: string;
  reward: string;
  rule: string;
  code: string;
  value: string;
}) {
  return (
    <section className="print-sheet hidden rounded-lg border border-line bg-panel p-8 text-center shadow-card">
      <p dir="ltr" className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
        {code}
      </p>
      <h2 className="mt-3 break-words text-3xl font-semibold text-ink">{programName}</h2>
      <p className="mt-2 break-words text-sm leading-6 text-muted">{subtitle}</p>
      <div className="mx-auto mt-8 flex max-w-[18rem] justify-center rounded-lg border border-line bg-panel p-4">
        <QRCodeSVG
          value={value}
          aria-label={title}
          role="img"
          title={title}
          size={256}
          marginSize={4}
          level="M"
          bgColor="#FFFFFF"
          fgColor="#1B172B"
          className="h-auto w-full"
        />
      </div>
      <div className="mx-auto mt-8 grid max-w-md gap-3 text-left text-sm text-ink">
        <p className="rounded-lg bg-sun-soft p-4 font-semibold text-sun-strong">
          {reward}
        </p>
        <p className="rounded-lg bg-mint-soft p-4 font-semibold text-mint-strong">
          {rule}
        </p>
      </div>
    </section>
  );
}
