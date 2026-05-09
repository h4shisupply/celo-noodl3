"use client";

import { Check, Copy, Download, ExternalLink, Printer, Share2 } from "lucide-react";
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
    try {
      await navigator.clipboard.writeText(value);
      setNotice(labels.copied);
    } catch {
      setNotice(value);
    }
  }

  async function handleShare() {
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
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          icon={<Copy className="h-4 w-4" />}
          onClick={() => void handleCopy()}
        >
          {labels.copy}
        </Button>
        <Button
          size="sm"
          variant="outline"
          icon={<Share2 className="h-4 w-4" />}
          onClick={() => void handleShare()}
        >
          {labels.share}
        </Button>
        <Button
          size="sm"
          variant="outline"
          icon={<Download className="h-4 w-4" />}
          onClick={() => {
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
            onClick={() => window.print()}
          >
            {labels.print}
          </Button>
        ) : null}
        <a href={value} target="_blank" rel="noreferrer">
          <Button
            size="sm"
            variant="ghost"
            icon={<ExternalLink className="h-4 w-4" />}
          >
            {labels.open}
          </Button>
        </a>
      </div>
      {notice ? (
        <StatusMessage tone={notice === labels.copied ? "success" : "info"}>
          {notice === labels.copied ? (
            <span className="inline-flex items-center gap-2">
              <Check className="h-4 w-4" aria-hidden="true" />
              {notice}
            </span>
          ) : (
            notice
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
      <CardHeader className="stamp-pattern border-b border-[#E5E1EE] bg-[#FBFCFF]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            {code ? (
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7047DF]">
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
        <div className="mx-auto flex w-full max-w-[18rem] justify-center rounded-lg border border-[#E5E1EE] bg-white p-4 shadow-[0_14px_36px_rgba(27,23,43,0.08)]">
          <QRCodeSVG
            ref={qrRef}
            value={value}
            title={title}
            size={256}
            marginSize={4}
            level="M"
            bgColor="#FFFFFF"
            fgColor="#1B172B"
            className="h-auto w-full"
          />
        </div>
        <p className="break-all rounded-lg bg-[#FBFCFF] p-3 text-sm text-[#676078]">
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
    <section className="print-sheet hidden rounded-lg border border-[#DCD6EA] bg-white p-8 text-center shadow-[0_18px_48px_rgba(27,23,43,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7047DF]">
        {code}
      </p>
      <h2 className="mt-3 text-3xl font-semibold text-[#1B172B]">{programName}</h2>
      <p className="mt-2 text-sm leading-6 text-[#676078]">{subtitle}</p>
      <div className="mx-auto mt-8 flex max-w-[18rem] justify-center rounded-lg border border-[#E5E1EE] bg-white p-4">
        <QRCodeSVG
          value={value}
          title={title}
          size={256}
          marginSize={4}
          level="M"
          bgColor="#FFFFFF"
          fgColor="#1B172B"
          className="h-auto w-full"
        />
      </div>
      <div className="mx-auto mt-8 grid max-w-md gap-3 text-left text-sm text-[#1B172B]">
        <p className="rounded-lg bg-[#FFF7E8] p-4 font-semibold text-[#8B5B00]">
          {reward}
        </p>
        <p className="rounded-lg bg-[#E9FBF7] p-4 font-semibold text-[#146B5E]">
          {rule}
        </p>
      </div>
    </section>
  );
}
