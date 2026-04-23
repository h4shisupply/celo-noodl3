type BarcodeFormat = "qr_code";

interface DetectedBarcode {
  rawValue?: string;
}

declare class BarcodeDetector {
  constructor(options?: { formats?: BarcodeFormat[] });
  static getSupportedFormats(): Promise<BarcodeFormat[]>;
  detect(
    source: ImageBitmapSource | HTMLVideoElement | HTMLImageElement
  ): Promise<DetectedBarcode[]>;
}
